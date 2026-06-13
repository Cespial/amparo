// lib/i18n/index.ts — Núcleo de i18n de Amparo.
//
// API pública (CONTRATO — Fase 2 NO modifica este archivo):
//   type Lang = "es" | "en"
//   <LanguageProvider>            — context + persistencia (localStorage "amparo-lang", default "es")
//   useLang(): { lang, setLang }  — idioma activo + setter
//   useT(ns): (key, vars?) => string
//       resuelve DICT[ns][lang][key] con dot-path (p.ej. "hero.title"),
//       interpolación opcional {var} y fallback es→en si falta en "en".
//
// Diccionarios por NAMESPACE en lib/i18n/dict/<ns>.ts con la forma:
//   export const <ns> = { es: { ... }, en: { ... } } as const;
// Para añadir un namespace: créalo en dict/ y regístralo en DICT abajo.

"use client";

import { useCallback } from "react";
import {
  LanguageProvider,
  useLanguageContext,
  type Lang,
} from "./provider";

// — Namespaces (10) —
import { common } from "./dict/common";
import { nav } from "./dict/nav";
import { landing } from "./dict/landing";
import { atlas } from "./dict/atlas";
import { asistente } from "./dict/asistente";
import { demandante } from "./dict/demandante";
import { demandado } from "./dict/demandado";
import { juez } from "./dict/juez";
import { pitch } from "./dict/pitch";
import { mediacion } from "./dict/mediacion";

/** Registro central de diccionarios, indexado por namespace. */
export const DICT = {
  common,
  nav,
  landing,
  atlas,
  asistente,
  demandante,
  demandado,
  juez,
  pitch,
  mediacion,
} as const;

export type Namespace = keyof typeof DICT;

export { LanguageProvider };
export type { Lang };

/** Idioma activo + setter. */
export function useLang(): { lang: Lang; setLang: (lang: Lang) => void } {
  return useLanguageContext();
}

/** Variables de interpolación para t(): reemplaza {clave} por su valor. */
export type TVars = Record<string, string | number>;

/** Función de traducción devuelta por useT(). */
export type TFunction = (key: string, vars?: TVars) => string;

/**
 * Resuelve un dot-path ("a.b.c") dentro de un árbol del diccionario.
 * Devuelve la cadena hallada o undefined si no existe / no es string.
 */
function resolvePath(tree: unknown, path: string): string | undefined {
  let node: unknown = tree;
  for (const part of path.split(".")) {
    if (node == null || typeof node !== "object") return undefined;
    node = (node as Record<string, unknown>)[part];
  }
  return typeof node === "string" ? node : undefined;
}

/** Aplica interpolación {var} sobre una cadena. */
function interpolate(template: string, vars?: TVars): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in vars ? String(vars[name]) : match,
  );
}

/**
 * Hook de traducción ligado a un namespace.
 * Resolución: DICT[ns][lang] → (fallback) DICT[ns].es → (último) la propia key.
 */
export function useT(ns: Namespace): TFunction {
  const { lang } = useLang();

  return useCallback(
    (key: string, vars?: TVars): string => {
      const table = DICT[ns];
      // 1) idioma activo
      const primary = resolvePath(table[lang], key);
      if (primary !== undefined) return interpolate(primary, vars);
      // 2) fallback es→en (si el activo era "en" y faltaba la clave)
      if (lang !== "es") {
        const fallback = resolvePath(table.es, key);
        if (fallback !== undefined) return interpolate(fallback, vars);
      }
      // 3) último recurso: la propia clave (facilita detectar faltantes)
      return key;
    },
    [ns, lang],
  );
}
