"use client";

// lib/i18n/provider.tsx — Context + persistencia del idioma (es | en).
//
// Patrón anti-hydration-mismatch (sin setState-en-efecto):
//   - Usamos useSyncExternalStore, diseñado para suscribirse a estado externo
//     (aquí: localStorage). El "server snapshot" SIEMPRE es 'es', igual que el
//     primer snapshot del cliente, de modo que el HTML hidratado coincide.
//   - Tras la hidratación, React lee el snapshot real del cliente; si el
//     usuario había elegido 'en', se re-renderiza de forma controlada.
//   - setLang escribe en localStorage y notifica a los suscriptores.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from "react";
import type { ReactNode } from "react";

export type Lang = "es" | "en";

const STORAGE_KEY = "amparo-lang";
const DEFAULT_LANG: Lang = "es";

interface LanguageContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

function isLang(value: unknown): value is Lang {
  return value === "es" || value === "en";
}

// — Store externo basado en localStorage —

const listeners = new Set<() => void>();

function subscribe(onChange: () => void): () => void {
  listeners.add(onChange);
  // Sincroniza entre pestañas.
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) onChange();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onStorage);
  };
}

function getClientSnapshot(): Lang {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return isLang(stored) ? stored : DEFAULT_LANG;
  } catch {
    return DEFAULT_LANG;
  }
}

// Snapshot de servidor (y primer render del cliente): siempre el default,
// para que el HTML hidratado coincida y no haya mismatch.
function getServerSnapshot(): Lang {
  return DEFAULT_LANG;
}

function writeLang(next: Lang) {
  try {
    window.localStorage.setItem(STORAGE_KEY, next);
  } catch {
    // Ignorar si no hay almacenamiento.
  }
  // Notificar a todos los componentes suscritos.
  listeners.forEach((fn) => fn());
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const lang = useSyncExternalStore(
    subscribe,
    getClientSnapshot,
    getServerSnapshot,
  );

  // Reflejar el idioma en <html lang> para accesibilidad/SEO.
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((next: Lang) => {
    writeLang(next);
  }, []);

  const value = useMemo<LanguageContextValue>(
    () => ({ lang, setLang }),
    [lang, setLang],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguageContext(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLang/useT deben usarse dentro de <LanguageProvider>");
  }
  return ctx;
}
