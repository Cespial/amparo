"use client";

/**
 * Hook de dictado para el asistente (Web Speech Recognition, es-CO / en-US).
 *
 * Self-contained dentro de components/avatar para no depender de lib/* (otro
 * agente lo edita). Degrada con gracia: si el navegador no soporta dictado,
 * `soportado` es false y la UI muestra solo el campo de texto.
 *
 * Soporta dos modos de uso, sin romper el contrato anterior:
 *  - Manual:  iniciar((texto) => …)               — callback simple de texto.
 *  - Manos libres: iniciar({ onTexto, onFin, onError, lang })
 *      · onTexto(texto)  — cada fragmento FINAL reconocido.
 *      · onFin()         — la sesión de reconocimiento terminó (silencio/stop).
 *      · onError(error)  — código de error del reconocedor (no-speech, aborted…).
 *      · lang            — "es-CO" (default) | "en-US" | cualquier BCP-47.
 */

import { useCallback, useEffect, useRef, useState } from "react";

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
  onspeechstart: (() => void) | null;
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

/** Opciones del modo manos-libres. */
export interface IniciarOpciones {
  /** Cada fragmento final reconocido. */
  onTexto: (texto: string) => void;
  /** La sesión de reconocimiento terminó (por silencio o stop()). */
  onFin?: () => void;
  /** El usuario empezó a hablar (útil para barge-in / debounce). */
  onHabla?: () => void;
  /** Código de error del reconocedor (no-speech, aborted, not-allowed…). */
  onError?: (error: string) => void;
  /** Idioma BCP-47 del reconocimiento. Default "es-CO". */
  lang?: string;
}

type IniciarArg = ((texto: string) => void) | IniciarOpciones;

function normalizar(arg: IniciarArg): IniciarOpciones {
  return typeof arg === "function" ? { onTexto: arg } : arg;
}

export interface UseDictadoAsistente {
  soportado: boolean;
  escuchando: boolean;
  /**
   * Empieza a dictar. Acepta un callback simple (modo manual) o un objeto de
   * opciones (modo manos libres con onFin/onError/lang).
   */
  iniciar: (arg: IniciarArg) => void;
  detener: () => void;
}

export function useDictadoAsistente(): UseDictadoAsistente {
  // Lazy init: getCtor() lee window, estable en cliente; evita setState en effect.
  const [soportado] = useState<boolean>(() => getCtor() !== null);
  const [escuchando, setEscuchando] = useState(false);
  const recRef = useRef<SpeechRecognitionLike | null>(null);
  // Evita que un stop() manual dispare onFin como si fuera fin natural de habla.
  const detenidoManualRef = useRef(false);

  useEffect(() => {
    return () => {
      const rec = recRef.current;
      try {
        rec?.abort();
      } catch {
        /* noop */
      }
      recRef.current = null;
    };
  }, []);

  const detener = useCallback(() => {
    detenidoManualRef.current = true;
    try {
      recRef.current?.stop();
    } catch {
      /* noop */
    }
    setEscuchando(false);
  }, []);

  const iniciar = useCallback((arg: IniciarArg) => {
    const { onTexto, onFin, onHabla, onError, lang } = normalizar(arg);
    const Ctor = getCtor();
    if (!Ctor) {
      onError?.("not-supported");
      return;
    }
    try {
      recRef.current?.abort();
    } catch {
      /* noop */
    }
    detenidoManualRef.current = false;
    const rec = new Ctor();
    rec.lang = lang ?? "es-CO";
    rec.continuous = false;
    rec.interimResults = false;
    rec.onresult = (e) => {
      let txt = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) txt += r[0].transcript;
      }
      if (txt.trim()) onTexto(txt.trim());
    };
    rec.onspeechstart = () => onHabla?.();
    rec.onerror = (e) => {
      setEscuchando(false);
      const code = e?.error ?? "unknown";
      // "aborted" es esperado cuando nosotros mismos abortamos para re-armar.
      if (code !== "aborted") onError?.(code);
    };
    rec.onend = () => {
      setEscuchando(false);
      // Solo notificamos fin natural (silencio); el stop() manual lo silencia.
      if (!detenidoManualRef.current) onFin?.();
      detenidoManualRef.current = false;
    };
    recRef.current = rec;
    try {
      rec.start();
      setEscuchando(true);
    } catch {
      setEscuchando(false);
      onError?.("start-failed");
    }
  }, []);

  return { soportado, escuchando, iniciar, detener };
}
