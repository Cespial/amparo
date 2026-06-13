"use client";

/**
 * Capa de voz de Amparo (cliente).
 *
 * Premisa de producto: acceso a la justicia FÁCIL para todos, incluida la gente
 * con baja alfabetización. Por eso ESCUCHAR a Amparo importa.
 *
 * `hablar()` intenta primero la voz natural de Amparo (ElevenLabs vía /api/voz)
 * y, si no está disponible o falla, degrada con gracia a la voz del navegador
 * (Web Speech / SpeechSynthesis). Nunca lanza: si no hay audio, no hace nada.
 */

const LIMITE_TEXTO = 800;

// --- Singletons del lado del cliente (uno solo a la vez, para poder cortar) ---

let audioActual: HTMLAudioElement | null = null;
let urlActual: string | null = null;
// Token de generación: invalida reproducciones en curso cuando se llama detener/nuevo hablar.
let generacion = 0;

function limpiarAudio() {
  if (audioActual) {
    try {
      audioActual.pause();
      audioActual.src = "";
    } catch {
      /* noop */
    }
    audioActual = null;
  }
  if (urlActual) {
    try {
      URL.revokeObjectURL(urlActual);
    } catch {
      /* noop */
    }
    urlActual = null;
  }
}

/** Recorta a un límite razonable, cerrando con elipsis (espejo del server). */
function recortar(texto: string): string {
  const limpio = texto.replace(/\s+/g, " ").trim();
  if (limpio.length <= LIMITE_TEXTO) return limpio;
  return `${limpio.slice(0, LIMITE_TEXTO - 1).trimEnd()}…`;
}

/** ¿Hay alguna forma de reproducir voz en este entorno? */
export function vozSoportada(): boolean {
  if (typeof window === "undefined") return false;
  return (
    typeof window.Audio !== "undefined" || "speechSynthesis" in window
  );
}

/** Selecciona una voz en español del navegador, si existe. */
function vozEspanol(): SpeechSynthesisVoice | null {
  try {
    const voces = window.speechSynthesis.getVoices();
    return (
      voces.find((v) => /^es(-|_)?(ES)?/i.test(v.lang)) ??
      voces.find((v) => /^es(-|_)?(419|CO|MX|US)/i.test(v.lang)) ??
      voces.find((v) => v.lang.toLowerCase().startsWith("es")) ??
      null
    );
  } catch {
    return null;
  }
}

/** Fallback: lee con la voz del navegador. */
function hablarNavegador(texto: string): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(recortar(texto));
    const voz = vozEspanol();
    u.lang = voz?.lang ?? "es-ES";
    if (voz) u.voice = voz;
    u.rate = 0.98;
    window.speechSynthesis.speak(u);
  } catch {
    /* noop */
  }
}

/**
 * Lee `texto` en voz alta. Intenta la voz natural de Amparo (ElevenLabs) y,
 * si falla, degrada a la voz del navegador. Corta cualquier voz previa.
 *
 * @param texto  Lo que Amparo debe decir.
 * @param voiceId  Voz alternativa opcional (por defecto, la de Amparo del server).
 */
export async function hablar(texto: string, voiceId?: string): Promise<void> {
  if (typeof window === "undefined") return;
  const limpio = recortar(texto ?? "");
  if (!limpio) return;

  // Corta cualquier reproducción en curso e invalida generaciones previas.
  detenerVoz();
  const miGeneracion = ++generacion;

  try {
    const res = await fetch("/api/voz", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ texto: limpio, ...(voiceId ? { voiceId } : {}) }),
    });

    // Si el usuario detuvo o pidió otra voz mientras esperábamos, abortar.
    if (miGeneracion !== generacion) return;

    if (!res.ok || !res.body) {
      hablarNavegador(limpio);
      return;
    }

    const blob = await res.blob();
    if (miGeneracion !== generacion) return;
    if (!blob || blob.size < 256) {
      // Respuesta vacía/sospechosa → fallback.
      hablarNavegador(limpio);
      return;
    }

    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    audioActual = audio;
    urlActual = url;
    audio.addEventListener("ended", () => {
      if (audioActual === audio) limpiarAudio();
    });
    audio.addEventListener("error", () => {
      if (miGeneracion === generacion) {
        limpiarAudio();
        hablarNavegador(limpio);
      }
    });
    await audio.play().catch(() => {
      // Autoplay bloqueado u otro error de reproducción → voz del navegador.
      if (miGeneracion === generacion) {
        limpiarAudio();
        hablarNavegador(limpio);
      }
    });
  } catch {
    if (miGeneracion === generacion) hablarNavegador(limpio);
  }
}

/** Detiene cualquier voz en curso (ElevenLabs o navegador). */
export function detenerVoz(): void {
  if (typeof window === "undefined") return;
  generacion++; // invalida cualquier hablar() en vuelo
  limpiarAudio();
  if ("speechSynthesis" in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      /* noop */
    }
  }
}

// --- Dictado opcional (Web Speech Recognition) ---------------------------------
//
// La vista del demandante ya centraliza el dictado en
// components/demandante/use-dictado.ts (hook useDictado). NO lo dupliques allí.
// Esta utilidad existe para vistas o componentes que no tengan ese hook.

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

function getRecognitionCtor(): SpeechRecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

/** ¿El navegador soporta dictado por voz? */
export function dictadoSoportado(): boolean {
  return getRecognitionCtor() !== null;
}

export interface DictadoControlador {
  /** Detiene el reconocimiento en curso. */
  detener: () => void;
}

/**
 * Envoltura mínima de SpeechRecognition (es-CO) para dictado.
 * Devuelve un controlador con `detener()`, o null si no hay soporte.
 *
 * @param onTexto  Recibe cada fragmento final reconocido.
 */
export function dictar(
  onTexto: (texto: string) => void,
): DictadoControlador | null {
  const Ctor = getRecognitionCtor();
  if (!Ctor) return null;

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
    if (finalText.trim()) onTexto(finalText.trim());
  };
  rec.onerror = () => {
    try {
      rec.stop();
    } catch {
      /* noop */
    }
  };
  try {
    rec.start();
  } catch {
    return null;
  }

  return {
    detener: () => {
      try {
        rec.stop();
      } catch {
        /* noop */
      }
    },
  };
}
