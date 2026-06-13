"use client";

/**
 * Hook de dictado para el asistente. Dos motores con el MISMO contrato:
 *
 *  1) STT EN LA NUBE (PRIMARIO, mejor calidad con inglés/acentos):
 *       getUserMedia -> MediaRecorder graba un blob; un AnalyserNode mide RMS
 *       para AUTO-DETENER tras ~1.1s de silencio TRAS detectar habla; el blob
 *       se envía a POST /api/transcribir y el texto se entrega por onTexto;
 *       luego se dispara onFin (sustituye al onend de SpeechRecognition,
 *       conservando el flujo manos-libres / auto-submit del modo conversación).
 *
 *  2) WEB SPEECH (FALLBACK): SpeechRecognition del navegador (lo de siempre).
 *       Se usa si no hay MediaRecorder/getUserMedia, si se niega el permiso del
 *       micro, o si /api/transcribir falla de forma repetida.
 *
 * Contrato público (sin cambios para los llamadores existentes):
 *   - soportado: boolean
 *   - escuchando: boolean
 *   - iniciar(cb)  |  iniciar({ onTexto, onFin, onHabla, onError, lang })
 *   - detener()
 * Se AÑADEN (opt-in, no rompen nada):
 *   - transcribiendo: boolean      — true mientras la nube procesa el audio.
 *   - onEstado?(estado)            — "grabando" | "transcribiendo" | "inactivo".
 *
 * Self-contained dentro de components/avatar para no depender de lib/* (otro
 * agente lo edita). Limpia stream/AudioContext/MediaRecorder al desmontar.
 */

import { useCallback, useEffect, useRef, useState } from "react";

// --- Web Speech (fallback) ---------------------------------------------------

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

// --- Detección de capacidades de la nube -------------------------------------

function tieneNube(): boolean {
  if (typeof window === "undefined") return false;
  const md = navigator.mediaDevices;
  return (
    typeof MediaRecorder !== "undefined" &&
    !!md &&
    typeof md.getUserMedia === "function"
  );
}

/** Primer mimeType de grabación soportado, o "" si ninguno. */
function mimeGrabacion(): string {
  if (typeof MediaRecorder === "undefined") return "";
  const candidatos = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4",
    "audio/ogg;codecs=opus",
  ];
  for (const m of candidatos) {
    try {
      if (MediaRecorder.isTypeSupported(m)) return m;
    } catch {
      /* noop */
    }
  }
  return "";
}

// --- Tipos del contrato ------------------------------------------------------

export type EstadoDictado = "inactivo" | "grabando" | "transcribiendo";

/** Opciones del modo manos-libres. */
export interface IniciarOpciones {
  /** Cada fragmento final reconocido (nube: texto completo del turno). */
  onTexto: (texto: string) => void;
  /** La sesión terminó (silencio o stop). En la nube, tras entregar el texto. */
  onFin?: () => void;
  /** El usuario empezó a hablar (útil para barge-in / debounce). */
  onHabla?: () => void;
  /** Código de error (no-speech, aborted, not-allowed, transcribe-failed…). */
  onError?: (error: string) => void;
  /** Cambios de estado del motor de nube (grabando/transcribiendo/inactivo). */
  onEstado?: (estado: EstadoDictado) => void;
  /** Idioma BCP-47 ("es-CO" | "en-US" | …). Se deriva "es"/"en" para la nube. */
  lang?: string;
  /**
   * Fuerza el SpeechRecognition del navegador, saltándose la nube. Lo usa el
   * llamador cuando /api/transcribir ha fallado repetidamente.
   */
  preferirNavegador?: boolean;
}

type IniciarArg = ((texto: string) => void) | IniciarOpciones;

function normalizar(arg: IniciarArg): IniciarOpciones {
  return typeof arg === "function" ? { onTexto: arg } : arg;
}

/** "es-CO"/"en-US" -> "es"/"en" para /api/transcribir. */
function langCorto(lang?: string): "es" | "en" {
  return (lang ?? "es").toLowerCase().startsWith("en") ? "en" : "es";
}

export interface UseDictadoAsistente {
  soportado: boolean;
  escuchando: boolean;
  /** True mientras la nube procesa el audio grabado. */
  transcribiendo: boolean;
  iniciar: (arg: IniciarArg) => void;
  detener: () => void;
}

// --- Parámetros del auto-stop por silencio -----------------------------------

const SILENCIO_MS = 1100; // ~1.1s de silencio TRAS habla -> detiene la grabación
const RMS_UMBRAL = 0.018; // por encima = hay voz (sobre 0..1, mic típico)
const MAX_GRABACION_MS = 30_000; // tope duro de grabación (defensa)
const POLL_MS = 80; // cadencia de muestreo del RMS

export function useDictadoAsistente(): UseDictadoAsistente {
  // El hook está "soportado" si hay nube O Web Speech.
  const [soportado] = useState<boolean>(
    () => tieneNube() || getCtor() !== null,
  );
  const [escuchando, setEscuchando] = useState(false);
  const [transcribiendo, setTranscribiendo] = useState(false);

  // --- Web Speech (fallback) ---
  const recRef = useRef<SpeechRecognitionLike | null>(null);
  const detenidoManualRef = useRef(false);

  // --- Nube ---
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const pollRef = useRef<number | null>(null);
  const silencioDesdeRef = useRef<number | null>(null);
  const huboHablaRef = useRef(false);
  const maxTimerRef = useRef<number | null>(null);
  // Opciones del turno vivo (para usarlas en onstop / catch sin re-armar).
  const opcRef = useRef<IniciarOpciones | null>(null);
  // Razón del stop del recorder de nube:
  //   "auto"     — silencio/tope: transcribe y dispara onFin (auto-submit).
  //   "manual"   — detener()/push-to-talk: transcribe pero NO onFin.
  //   "descartar"— re-arme/desmontaje: descarta el audio, sin transcribir.
  const razonStopRef = useRef<"auto" | "manual" | "descartar">("auto");
  // Evita doble manejo (timeout + onstop + abort).
  const finalizandoRef = useRef(false);

  // ---- Limpieza de recursos de la nube ----
  // No detiene el recorder (eso lo hace quien decide la razón del stop); sí
  // cierra Web Audio, suelta el mic y limpia timers/flags.
  const limpiarNube = useCallback(() => {
    if (pollRef.current != null) {
      window.clearInterval(pollRef.current);
      pollRef.current = null;
    }
    if (maxTimerRef.current != null) {
      window.clearTimeout(maxTimerRef.current);
      maxTimerRef.current = null;
    }
    try {
      sourceRef.current?.disconnect();
    } catch {
      /* noop */
    }
    sourceRef.current = null;
    analyserRef.current = null;
    const ctx = audioCtxRef.current;
    audioCtxRef.current = null;
    if (ctx && ctx.state !== "closed") {
      void ctx.close().catch(() => {});
    }
    const stream = streamRef.current;
    streamRef.current = null;
    if (stream) {
      for (const tr of stream.getTracks()) {
        try {
          tr.stop();
        } catch {
          /* noop */
        }
      }
    }
    recorderRef.current = null;
    silencioDesdeRef.current = null;
    huboHablaRef.current = false;
  }, []);

  // Detiene un recorder ANTERIOR y desactiva su onstop, para que un stop tardío
  // no transcriba audio descartado (re-arme / desmontaje).
  const descartarRecorderActual = useCallback(() => {
    const r = recorderRef.current;
    if (!r) return;
    r.onstop = null;
    r.ondataavailable = null;
    if (r.state !== "inactive") {
      try {
        r.stop();
      } catch {
        /* noop */
      }
    }
    recorderRef.current = null;
    chunksRef.current = [];
  }, []);

  // ---- Desmontaje: corta todo ----
  useEffect(() => {
    return () => {
      try {
        recRef.current?.abort();
      } catch {
        /* noop */
      }
      recRef.current = null;
      descartarRecorderActual();
      limpiarNube();
    };
  }, [descartarRecorderActual, limpiarNube]);

  // ---- Detener (manual / push-to-talk / barge-in externo) ----
  // Transcribe lo capturado (entrega onTexto) pero NO dispara onFin, igual que
  // el stop manual de Web Speech (que suprime onFin/auto-submit).
  const detener = useCallback(() => {
    // Web Speech
    detenidoManualRef.current = true;
    try {
      recRef.current?.stop();
    } catch {
      /* noop */
    }
    // Nube: detiene el recorder; su onstop transcribirá sin onFin.
    razonStopRef.current = "manual";
    const r = recorderRef.current;
    if (r && r.state !== "inactive") {
      try {
        r.stop();
      } catch {
        /* noop */
      }
    } else {
      limpiarNube();
    }
    setEscuchando(false);
  }, [limpiarNube]);

  // ---- Fallback a Web Speech ----
  const iniciarWebSpeech = useCallback((opc: IniciarOpciones) => {
    const { onTexto, onFin, onHabla, onError, lang } = opc;
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
      if (code !== "aborted") onError?.(code);
    };
    rec.onend = () => {
      setEscuchando(false);
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

  // ---- Envía el audio grabado a la nube y entrega el texto ----
  // `dispararFin`: true en auto-stop (silencio) para encadenar el auto-submit;
  // false en stop manual (igual que Web Speech suprime onFin al detener a mano).
  const transcribirBlob = useCallback(
    async (blob: Blob, opc: IniciarOpciones, dispararFin: boolean) => {
      // Sin habla detectada o blob trivial: cierra el turno sin texto, como el
      // onend de Web Speech ante silencio.
      if (blob.size < 512 || !huboHablaRef.current) {
        opc.onError?.("no-speech");
        if (dispararFin) opc.onFin?.();
        return;
      }
      setTranscribiendo(true);
      opc.onEstado?.("transcribiendo");
      try {
        const form = new FormData();
        form.append("file", blob, "audio.webm");
        form.append("lang", langCorto(opc.lang));
        const res = await fetch("/api/transcribir", {
          method: "POST",
          body: form,
        });
        if (!res.ok) {
          opc.onError?.("transcribe-failed");
          if (dispararFin) opc.onFin?.();
          return;
        }
        const data = (await res.json().catch(() => ({}))) as {
          text?: unknown;
        };
        const texto = typeof data.text === "string" ? data.text.trim() : "";
        if (texto) opc.onTexto(texto);
        else opc.onError?.("no-speech");
        if (dispararFin) opc.onFin?.();
      } catch {
        opc.onError?.("transcribe-failed");
        if (dispararFin) opc.onFin?.();
      } finally {
        setTranscribiendo(false);
        opc.onEstado?.("inactivo");
      }
    },
    [],
  );

  // ---- Motor de nube: graba + auto-stop por silencio ----
  const iniciarNube = useCallback(
    async (opc: IniciarOpciones) => {
      opcRef.current = opc;
      const mime = mimeGrabacion();
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch (e) {
        const name = (e as { name?: string })?.name ?? "";
        if (name === "NotAllowedError" || name === "SecurityError") {
          opc.onError?.("not-allowed");
        } else if (name === "NotFoundError") {
          opc.onError?.("audio-capture");
        } else {
          opc.onError?.("nube-failed");
        }
        return; // el llamador decide si cae a Web Speech
      }
      streamRef.current = stream;

      // Recorder
      let recorder: MediaRecorder;
      try {
        recorder = mime
          ? new MediaRecorder(stream, { mimeType: mime })
          : new MediaRecorder(stream);
      } catch {
        limpiarNube();
        opc.onError?.("nube-failed");
        return;
      }
      recorderRef.current = recorder;
      chunksRef.current = [];
      razonStopRef.current = "auto";
      finalizandoRef.current = false;
      huboHablaRef.current = false;
      silencioDesdeRef.current = null;

      recorder.ondataavailable = (ev) => {
        if (ev.data && ev.data.size > 0) chunksRef.current.push(ev.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: recorder.mimeType || mime || "audio/webm",
        });
        chunksRef.current = [];
        const razon = razonStopRef.current;
        setEscuchando(false);
        limpiarNube();
        // Re-arme/desmontaje: descarta el audio sin tocar callbacks.
        if (razon === "descartar") {
          opc.onEstado?.("inactivo");
          return;
        }
        // "manual" transcribe sin onFin; "auto" transcribe y dispara onFin.
        void transcribirBlob(blob, opc, razon === "auto");
      };

      // Web Audio: AnalyserNode para medir RMS y detectar silencio.
      try {
        const Ctx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext })
            .webkitAudioContext;
        const ctx = new Ctx();
        audioCtxRef.current = ctx;
        const source = ctx.createMediaStreamSource(stream);
        sourceRef.current = source;
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 1024;
        analyser.smoothingTimeConstant = 0.4;
        analyserRef.current = analyser;
        source.connect(analyser);
      } catch {
        // Sin Web Audio no podemos auto-detener; igual grabamos y dependemos
        // del tope de tiempo / del stop manual.
        audioCtxRef.current = null;
        analyserRef.current = null;
      }

      const finalizarPorSilencio = () => {
        if (finalizandoRef.current) return;
        finalizandoRef.current = true;
        const r = recorderRef.current;
        if (r && r.state !== "inactive") {
          try {
            r.stop(); // dispara onstop -> transcribe
          } catch {
            /* noop */
          }
        }
      };

      // Loop de muestreo del RMS.
      const analyser = analyserRef.current;
      if (analyser) {
        const buf = new Uint8Array(analyser.fftSize);
        pollRef.current = window.setInterval(() => {
          const a = analyserRef.current;
          if (!a) return;
          a.getByteTimeDomainData(buf);
          // RMS sobre la desviación respecto a 128 (centro), normalizado 0..1.
          let suma = 0;
          for (let i = 0; i < buf.length; i++) {
            const v = (buf[i] - 128) / 128;
            suma += v * v;
          }
          const rms = Math.sqrt(suma / buf.length);
          const ahora = Date.now();
          if (rms >= RMS_UMBRAL) {
            // Hay voz.
            if (!huboHablaRef.current) {
              huboHablaRef.current = true;
              opc.onHabla?.();
            }
            silencioDesdeRef.current = null;
          } else if (huboHablaRef.current) {
            // Silencio TRAS haber hablado: arranca / evalúa el cronómetro.
            if (silencioDesdeRef.current == null) {
              silencioDesdeRef.current = ahora;
            } else if (ahora - silencioDesdeRef.current >= SILENCIO_MS) {
              finalizarPorSilencio();
            }
          }
        }, POLL_MS);
      }

      // Tope duro de grabación.
      maxTimerRef.current = window.setTimeout(() => {
        finalizarPorSilencio();
      }, MAX_GRABACION_MS);

      try {
        recorder.start();
        setEscuchando(true);
        opc.onEstado?.("grabando");
      } catch {
        limpiarNube();
        opc.onError?.("nube-failed");
      }
    },
    [limpiarNube, transcribirBlob],
  );

  // ---- iniciar(): nube primero, Web Speech como red de seguridad ----
  const iniciar = useCallback(
    (arg: IniciarArg) => {
      const opc = normalizar(arg);
      // Re-arme limpio de cualquier sesión previa.
      try {
        recRef.current?.abort();
      } catch {
        /* noop */
      }
      descartarRecorderActual();
      limpiarNube();

      // Nube primero, salvo que el llamador pida forzar el navegador (p.ej.
      // tras fallos repetidos de /api/transcribir) o que no haya nube.
      if (tieneNube() && !opc.preferirNavegador) {
        void iniciarNube(opc).catch(() => {
          // Si el motor de nube cae al armar, intenta Web Speech si existe.
          if (getCtor()) iniciarWebSpeech(opc);
          else opc.onError?.("nube-failed");
        });
        return;
      }
      // Sin nube (o forzado): Web Speech directo.
      iniciarWebSpeech(opc);
    },
    [descartarRecorderActual, iniciarNube, iniciarWebSpeech, limpiarNube],
  );

  return { soportado, escuchando, transcribiendo, iniciar, detener };
}
