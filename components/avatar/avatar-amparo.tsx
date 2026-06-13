"use client";

/**
 * AvatarAmparo — Avatar audio-reactivo de Amparo.
 *
 * Premisa ODR: escuchar a Amparo importa. Este orbe se ANIMA con la amplitud
 * real de su voz mientras habla, dando una presencia humana sin ser infantil.
 *
 * Cómo logra la reactividad de audio (self-contained, no usa lib/voz.ts):
 *  1. POST /api/voz { texto } -> MP3 (ArrayBuffer).
 *  2. AudioContext.decodeAudioData -> AudioBuffer.
 *  3. BufferSource -> AnalyserNode -> destination (suena Y se analiza).
 *  4. requestAnimationFrame + getByteFrequencyData -> nivel 0..1 -> animación.
 *  5. Fallback: si /api/voz falla, window.speechSynthesis (sin reactividad,
 *     con un pulso "fake" suave para que el avatar no quede inerte).
 *
 * Respeta prefers-reduced-motion: sin RAF, sin pulso; solo cambia el estado
 * de color (hablando/escuchando) sin movimiento.
 *
 * Expone un handle imperativo (decir/detener) vía ref para que la página
 * controle qué dice Amparo y cuándo. Limpia AudioContext/RAF al desmontar.
 */

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { cn } from "@/lib/utils";

export type EstadoAvatar = "inactivo" | "hablando" | "pensando" | "escuchando";

export interface AvatarAmparoHandle {
  /** Hace que Amparo diga `texto` en voz alta (reactivo). Resuelve al terminar. */
  decir: (texto: string) => Promise<void>;
  /** Corta cualquier voz en curso. */
  detener: () => void;
}

interface AvatarAmparoProps {
  estado: EstadoAvatar;
  /** Tamaño en px del lienzo cuadrado. */
  size?: number;
  className?: string;
  /** Notifica cambios de "hablando" para que la UI coordine el input. */
  onHablandoChange?: (hablando: boolean) => void;
}

const LIMITE_TEXTO = 800;

function recortar(texto: string): string {
  const limpio = (texto ?? "").replace(/\s+/g, " ").trim();
  if (limpio.length <= LIMITE_TEXTO) return limpio;
  return `${limpio.slice(0, LIMITE_TEXTO - 1).trimEnd()}…`;
}

function prefiereReduccion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Selecciona una voz en español del navegador, si existe (fallback). */
function vozEspanol(): SpeechSynthesisVoice | null {
  try {
    const voces = window.speechSynthesis.getVoices();
    return (
      voces.find((v) => /^es(-|_)?(419|CO|MX)/i.test(v.lang)) ??
      voces.find((v) => v.lang.toLowerCase().startsWith("es")) ??
      null
    );
  } catch {
    return null;
  }
}

export const AvatarAmparo = forwardRef<AvatarAmparoHandle, AvatarAmparoProps>(
  function AvatarAmparo(
    { estado, size = 180, className, onHablandoChange },
    ref,
  ) {
    // Nivel de amplitud 0..1 (driver de la animación). Se mantiene en un ref
    // y se refleja a estado React solo en cada frame, suavizado.
    const [nivel, setNivel] = useState(0);
    const nivelRef = useRef(0);

    // Recursos de audio (singletons del componente).
    const ctxRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const sourceRef = useRef<AudioBufferSourceNode | null>(null);
    const rafRef = useRef<number | null>(null);
    const datosRef = useRef<Uint8Array<ArrayBuffer> | null>(null);
    // Token de generación: invalida reproducciones obsoletas.
    const genRef = useRef(0);
    // Pulso "fake" para el fallback de speechSynthesis (sin análisis real).
    const fakeRef = useRef<number | null>(null);

    const reducido = useRef(false);
    useEffect(() => {
      reducido.current = prefiereReduccion();
    }, []);

    const cancelarRAF = useCallback(() => {
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      if (fakeRef.current != null) {
        window.clearInterval(fakeRef.current);
        fakeRef.current = null;
      }
    }, []);

    const fijarNivel = useCallback((v: number) => {
      nivelRef.current = v;
      setNivel(v);
    }, []);

    const limpiarAudio = useCallback(() => {
      cancelarRAF();
      if (sourceRef.current) {
        try {
          sourceRef.current.onended = null;
          sourceRef.current.stop();
        } catch {
          /* noop */
        }
        try {
          sourceRef.current.disconnect();
        } catch {
          /* noop */
        }
        sourceRef.current = null;
      }
      if (analyserRef.current) {
        try {
          analyserRef.current.disconnect();
        } catch {
          /* noop */
        }
        analyserRef.current = null;
      }
      datosRef.current = null;
      fijarNivel(0);
    }, [cancelarRAF, fijarNivel]);

    const detener = useCallback(() => {
      genRef.current++;
      limpiarAudio();
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        try {
          window.speechSynthesis.cancel();
        } catch {
          /* noop */
        }
      }
      onHablandoChange?.(false);
    }, [limpiarAudio, onHablandoChange]);

    /** Fallback con voz del navegador + pulso simulado (sin reactividad real). */
    const hablarNavegador = useCallback(
      (texto: string, miGen: number): Promise<void> =>
        new Promise((resolve) => {
          if (
            typeof window === "undefined" ||
            !("speechSynthesis" in window)
          ) {
            resolve();
            return;
          }
          try {
            window.speechSynthesis.cancel();
            const u = new SpeechSynthesisUtterance(recortar(texto));
            const voz = vozEspanol();
            u.lang = voz?.lang ?? "es-CO";
            if (voz) u.voice = voz;
            u.rate = 0.98;

            // Pulso simulado mientras dura el habla, salvo reducción de motion.
            if (!reducido.current) {
              fakeRef.current = window.setInterval(() => {
                if (miGen !== genRef.current) return;
                // Onda suave pseudo-aleatoria para simular voz.
                const v = 0.35 + Math.random() * 0.4;
                fijarNivel(v);
              }, 110);
            }

            const fin = () => {
              if (fakeRef.current != null) {
                window.clearInterval(fakeRef.current);
                fakeRef.current = null;
              }
              if (miGen === genRef.current) fijarNivel(0);
              resolve();
            };
            u.onend = fin;
            u.onerror = fin;
            window.speechSynthesis.speak(u);
          } catch {
            resolve();
          }
        }),
      [fijarNivel],
    );

    /** Reproducción sin Web Audio (último recurso, sin reactividad). */
    const reproducirSimple = useCallback(
      (arrayBuf: ArrayBuffer, miGen: number): Promise<void> =>
        new Promise((resolve) => {
          try {
            const blob = new Blob([arrayBuf], { type: "audio/mpeg" });
            const url = URL.createObjectURL(blob);
            const audio = new Audio(url);
            const limpiar = () => {
              try {
                URL.revokeObjectURL(url);
              } catch {
                /* noop */
              }
              if (miGen === genRef.current) fijarNivel(0);
              resolve();
            };
            audio.addEventListener("ended", limpiar);
            audio.addEventListener("error", limpiar);
            void audio.play().catch(limpiar);
          } catch {
            resolve();
          }
        }),
      [fijarNivel],
    );

    const decir = useCallback(
      async (texto: string): Promise<void> => {
        if (typeof window === "undefined") return;
        const limpio = recortar(texto);
        if (!limpio) return;

        detener();
        const miGen = ++genRef.current;
        onHablandoChange?.(true);

        try {
          const res = await fetch("/api/voz", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ texto: limpio }),
          });
          if (miGen !== genRef.current) return;

          if (!res.ok) {
            await hablarNavegador(limpio, miGen);
            return;
          }

          const arrayBuf = await res.arrayBuffer();
          if (miGen !== genRef.current) return;
          if (!arrayBuf || arrayBuf.byteLength < 256) {
            await hablarNavegador(limpio, miGen);
            return;
          }

          // --- Web Audio: decodificar, analizar y reproducir ---
          type ACtor = typeof AudioContext;
          const Ctor: ACtor | undefined =
            window.AudioContext ??
            (window as unknown as { webkitAudioContext?: ACtor })
              .webkitAudioContext;
          if (!Ctor) {
            // Sin Web Audio: reproducción simple sin reactividad.
            await reproducirSimple(arrayBuf, miGen);
            return;
          }

          let ctx = ctxRef.current;
          if (!ctx || ctx.state === "closed") {
            ctx = new Ctor();
            ctxRef.current = ctx;
          }
          if (ctx.state === "suspended") {
            try {
              await ctx.resume();
            } catch {
              /* noop */
            }
          }

          let audioBuf: AudioBuffer;
          try {
            // decodeAudioData consume el ArrayBuffer; usamos una copia.
            audioBuf = await ctx.decodeAudioData(arrayBuf.slice(0));
          } catch {
            await hablarNavegador(limpio, miGen);
            return;
          }
          if (miGen !== genRef.current) return;

          const source = ctx.createBufferSource();
          source.buffer = audioBuf;
          const analyser = ctx.createAnalyser();
          analyser.fftSize = 256;
          analyser.smoothingTimeConstant = 0.75;
          source.connect(analyser);
          analyser.connect(ctx.destination);

          sourceRef.current = source;
          analyserRef.current = analyser;
          datosRef.current = new Uint8Array(
            new ArrayBuffer(analyser.frequencyBinCount),
          );

          await new Promise<void>((resolve) => {
            source.onended = () => {
              if (miGen === genRef.current) {
                limpiarAudio();
              }
              resolve();
            };

            if (!reducido.current) {
              const loop = () => {
                if (miGen !== genRef.current) return;
                const a = analyserRef.current;
                const d = datosRef.current;
                if (a && d) {
                  a.getByteFrequencyData(d);
                  // RMS de las bandas bajas/medias (voz) -> 0..1.
                  let suma = 0;
                  const n = Math.min(d.length, 48);
                  for (let i = 0; i < n; i++) suma += d[i] * d[i];
                  const rms = Math.sqrt(suma / n) / 255;
                  // Curva de respuesta para que el movimiento se sienta vivo.
                  const v = Math.min(1, rms * 1.9);
                  fijarNivel(v);
                }
                rafRef.current = requestAnimationFrame(loop);
              };
              rafRef.current = requestAnimationFrame(loop);
            }

            try {
              source.start(0);
            } catch {
              if (miGen === genRef.current) limpiarAudio();
              resolve();
            }
          });
        } catch {
          if (miGen === genRef.current) await hablarNavegador(limpio, miGen);
        } finally {
          if (miGen === genRef.current) onHablandoChange?.(false);
        }
      },
      [
        detener,
        fijarNivel,
        hablarNavegador,
        limpiarAudio,
        onHablandoChange,
        reproducirSimple,
      ],
    );

    useImperativeHandle(ref, () => ({ decir, detener }), [decir, detener]);

    // Limpieza al desmontar. Estos refs son recursos imperativos del
    // componente (no nodos de React) y queremos su valor VIVO al desmontar,
    // por eso se leen dentro del cleanup a propósito.
    useEffect(() => {
      const gen = genRef;
      const source = sourceRef;
      const ctx = ctxRef;
      return () => {
        gen.current++;
        cancelarRAF();
        try {
          source.current?.stop();
        } catch {
          /* noop */
        }
        if (ctx.current && ctx.current.state !== "closed") {
          try {
            void ctx.current.close();
          } catch {
            /* noop */
          }
        }
        ctx.current = null;
        if (typeof window !== "undefined" && "speechSynthesis" in window) {
          try {
            window.speechSynthesis.cancel();
          } catch {
            /* noop */
          }
        }
      };
    }, [cancelarRAF]);

    // --- Render: orbe 3D glossy (estética Design System). El nivel sigue
    // impulsando escala, glow, sonrisa y "ondas" concéntricas. Solo cambió la
    // estética visual; toda la lógica de Web Audio de arriba queda intacta. ---
    const hablando = estado === "hablando";
    const pensando = estado === "pensando";
    const escuchando = estado === "escuchando";

    // Escala del núcleo según amplitud (suave incluso en idle).
    const escalaNucleo = 1 + nivel * 0.14;
    const glow = 0.32 + nivel * 0.55;
    // La sonrisa se curva un poco más al hablar (control point del arco).
    const sonrisaY = 128 + nivel * 12;

    return (
      <div
        className={cn("relative select-none", className)}
        style={{ width: size, height: size }}
        role="img"
        aria-label={
          hablando
            ? "Amparo está hablando"
            : pensando
              ? "Amparo está pensando"
              : escuchando
                ? "Amparo está escuchando"
                : "Amparo"
        }
      >
        <svg
          viewBox="0 0 200 200"
          width={size}
          height={size}
          className="overflow-visible"
        >
          <defs>
            {/* Esfera glossy: highlight descentrado (32% 26%) → brillo/volumen */}
            <radialGradient id="amparo-core" cx="32%" cy="26%" r="92%">
              <stop offset="0%" stopColor="#f0705c" />
              <stop offset="45%" stopColor="#ce3a28" />
              <stop offset="100%" stopColor="#8c1f12" />
            </radialGradient>
            {/* Sombra interior inferior: da profundidad de esfera (inset look) */}
            <radialGradient id="amparo-inner-shade" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#000000" stopOpacity="0" />
              <stop offset="72%" stopColor="#000000" stopOpacity="0" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0.34" />
            </radialGradient>
            {/* Halo de glow concéntrico exterior */}
            <radialGradient id="amparo-glow" cx="50%" cy="50%" r="50%">
              <stop offset="55%" stopColor="#ce3a28" stopOpacity="0" />
              <stop offset="78%" stopColor="#ce3a28" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#ce3a28" stopOpacity="0" />
            </radialGradient>
            {/* Sheen especular superior (el "brillo" de plástico/cristal) */}
            <radialGradient id="amparo-sheen" cx="38%" cy="30%" r="42%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.78" />
              <stop offset="60%" stopColor="#ffffff" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Halo difuso de glow, intensidad ligada a la amplitud */}
          <circle
            cx="100"
            cy="100"
            r="96"
            fill="url(#amparo-glow)"
            style={{ opacity: glow, transition: "opacity 90ms linear" }}
          />

          {/* Anillo de glow concéntrico que late con la voz (DS) */}
          {(hablando || nivel > 0.02) && (
            <>
              <circle
                cx="100"
                cy="100"
                r={68 + nivel * 24}
                fill="none"
                stroke="#f0705c"
                strokeWidth="1.5"
                style={{
                  opacity: 0.2 + nivel * 0.4,
                  transition: "r 90ms linear, opacity 90ms linear",
                }}
              />
              <circle
                cx="100"
                cy="100"
                r={80 + nivel * 32}
                fill="none"
                stroke="#ce3a28"
                strokeWidth="1"
                style={{
                  opacity: 0.12 + nivel * 0.26,
                  transition: "r 110ms linear, opacity 110ms linear",
                }}
              />
            </>
          )}

          {/* Anillo de progreso "pensando": gira mientras se llaman las APIs */}
          {pensando && (
            <circle
              cx="100"
              cy="100"
              r="72"
              fill="none"
              stroke="#f0705c"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="40 420"
              className="amparo-spin"
              style={{ transformOrigin: "100px 100px" }}
            />
          )}

          {/* Esfera 3D: late con la amplitud de la voz */}
          <g
            style={{
              transform: `scale(${escalaNucleo})`,
              transformOrigin: "100px 100px",
              transition: "transform 70ms ease-out",
            }}
          >
            {/* Sombra de contacto exterior (el orbe "flota") */}
            <ellipse
              cx="100"
              cy="158"
              rx="42"
              ry="9"
              fill="#8c1f12"
              opacity={0.18}
            />
            {/* Cuerpo de la esfera: gradiente glossy descentrado */}
            <circle cx="100" cy="100" r="56" fill="url(#amparo-core)" />
            {/* Sombra interior inferior: profundidad de esfera */}
            <circle cx="100" cy="100" r="56" fill="url(#amparo-inner-shade)" />
            {/* Sheen especular: el brillo que la vuelve cristalina, no plana */}
            <circle cx="100" cy="100" r="56" fill="url(#amparo-sheen)" />
            {/* Pequeño destello puntual arriba-izquierda */}
            <ellipse
              cx="80"
              cy="74"
              rx="13"
              ry="8"
              fill="#ffffff"
              opacity={0.5}
              transform="rotate(-24 80 74)"
            />

            {/* Carita sutil minimalista (blancos, estética DS) */}
            {/* Ojos */}
            <circle
              cx="84"
              cy="100"
              r="5.5"
              fill="#ffffff"
              opacity={pensando ? 0.6 : 0.95}
            />
            <circle
              cx="116"
              cy="100"
              r="5.5"
              fill="#ffffff"
              opacity={pensando ? 0.6 : 0.95}
            />
            {/* Sonrisa: arco blanco que se abre un poco al hablar */}
            <path
              d={`M82 120 Q100 ${sonrisaY} 118 120`}
              fill="none"
              stroke="#ffffff"
              strokeWidth="4"
              strokeLinecap="round"
              opacity={0.9}
              style={{ transition: "d 70ms ease-out" }}
            />
          </g>
        </svg>

        {/* Punto de estado accesible (texto en sr-only en la página) */}
        <span
          aria-hidden="true"
          className={cn(
            "absolute right-2 bottom-2 size-3 rounded-full ring-2 ring-background transition-colors",
            hablando && "bg-primary",
            pensando && "bg-navy animate-pulse",
            escuchando && "bg-emerald-500 animate-pulse",
            estado === "inactivo" && "bg-muted-foreground/40",
          )}
        />

        <style>{`
          @keyframes amparo-spin { to { transform: rotate(360deg); } }
          .amparo-spin { animation: amparo-spin 1.1s linear infinite; }
          @media (prefers-reduced-motion: reduce) {
            .amparo-spin { animation: none; }
          }
        `}</style>
      </div>
    );
  },
);
