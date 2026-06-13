"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

// Tipos mínimos de la Web Speech API (no siempre presentes en lib.dom).
interface SpeechRecognitionResultLike {
  0: { transcript: string };
  isFinal: boolean;
}
interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: { length: number; [i: number]: SpeechRecognitionResultLike };
}
interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((e: SpeechRecognitionEventLike) => void) | null;
  onerror: ((e: { error?: string }) => void) | null;
  onend: (() => void) | null;
}
type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

function getCtor(): SpeechRecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

// Suscripción no-op: el soporte no cambia en tiempo de ejecución.
function subscribe() {
  return () => {};
}

/**
 * Hook de dictado por voz (Web Speech API). Degrada a no-soportado sin romper.
 * onTexto recibe el texto reconocido para anexarlo al relato.
 */
export function useDictado(onTexto: (texto: string) => void) {
  // useSyncExternalStore evita setState-en-efecto y es SSR-safe (server -> false).
  const soportado = useSyncExternalStore(
    subscribe,
    () => getCtor() !== null,
    () => false,
  );
  const [escuchando, setEscuchando] = useState(false);
  const recRef = useRef<SpeechRecognitionLike | null>(null);
  const onTextoRef = useRef(onTexto);

  useEffect(() => {
    onTextoRef.current = onTexto;
  }, [onTexto]);

  useEffect(() => {
    return () => {
      try {
        recRef.current?.abort();
      } catch {
        /* noop */
      }
    };
  }, []);

  const alternar = useCallback(() => {
    const Ctor = getCtor();
    if (!Ctor) return;

    if (escuchando) {
      recRef.current?.stop();
      setEscuchando(false);
      return;
    }

    const rec = new Ctor();
    rec.lang = "es-CO";
    rec.continuous = true;
    rec.interimResults = false;
    rec.onresult = (e) => {
      let finalText = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) finalText += r[0].transcript;
      }
      if (finalText.trim()) onTextoRef.current(finalText.trim());
    };
    rec.onerror = () => setEscuchando(false);
    rec.onend = () => setEscuchando(false);
    recRef.current = rec;
    try {
      rec.start();
      setEscuchando(true);
    } catch {
      setEscuchando(false);
    }
  }, [escuchando]);

  return { soportado, escuchando, alternar };
}

/** Lectura en voz alta (SpeechSynthesis). Degrada sin romper. */
export function hablar(texto: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(texto);
    u.lang = "es-CO";
    u.rate = 0.98;
    window.speechSynthesis.speak(u);
  } catch {
    /* noop */
  }
}

export function detenerVoz() {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  try {
    window.speechSynthesis.cancel();
  } catch {
    /* noop */
  }
}

export function vozSoportada(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}
