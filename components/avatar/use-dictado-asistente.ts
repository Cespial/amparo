"use client";

/**
 * Hook de dictado para el asistente (Web Speech Recognition, es-CO).
 *
 * Self-contained dentro de components/avatar para no depender de lib/* (otro
 * agente lo edita). Degrada con gracia: si el navegador no soporta dictado,
 * `soportado` es false y la UI muestra solo el campo de texto.
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

export interface UseDictadoAsistente {
  soportado: boolean;
  escuchando: boolean;
  /** Empieza a dictar; cada fragmento final se entrega a `onTexto`. */
  iniciar: (onTexto: (texto: string) => void) => void;
  detener: () => void;
}

export function useDictadoAsistente(): UseDictadoAsistente {
  // Lazy init: getCtor() lee window, estable en cliente; evita setState en effect.
  const [soportado] = useState<boolean>(() => getCtor() !== null);
  const [escuchando, setEscuchando] = useState(false);
  const recRef = useRef<SpeechRecognitionLike | null>(null);

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
    try {
      recRef.current?.stop();
    } catch {
      /* noop */
    }
    setEscuchando(false);
  }, []);

  const iniciar = useCallback((onTexto: (texto: string) => void) => {
    const Ctor = getCtor();
    if (!Ctor) return;
    try {
      recRef.current?.abort();
    } catch {
      /* noop */
    }
    const rec = new Ctor();
    rec.lang = "es-CO";
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
    rec.onerror = () => setEscuchando(false);
    rec.onend = () => setEscuchando(false);
    recRef.current = rec;
    try {
      rec.start();
      setEscuchando(true);
    } catch {
      setEscuchando(false);
    }
  }, []);

  return { soportado, escuchando, iniciar, detener };
}
