"use client";

// components/presentacion/modo-presentacion.tsx
// Modo presentación a prueba de nervios: control flotante discreto que, al
// activarse, despliega una guía paso a paso del demo. Navega entre rutas con
// next/navigation (router.push), soporta teclado (←/→ y Esc) y persiste el
// paso en estado local. Off por defecto; no estorba cuando está apagado.

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Play,
  X,
  ChevronLeft,
  ChevronRight,
  Presentation,
} from "lucide-react";

interface Paso {
  titulo: string;
  frase: string;
  ruta: string;
}

// Guion del demo — cinco actos, cada uno con su ruta destino.
const PASOS: Paso[] = [
  {
    titulo: "El problema",
    frase:
      "Colombia: 197.737 tutelas de salud en 2023; el 80% se ganan porque ya eran un derecho.",
    ruta: "/atlas",
  },
  {
    titulo: "La persona",
    frase:
      "Amparo, 68 años, cuenta su caso —hablando— y la IA lo estructura.",
    ruta: "/demandante",
  },
  {
    titulo: "El pronóstico",
    frase: "Predicción citada en jurisprudencia real: T-760/2008.",
    ruta: "/demandante",
  },
  {
    titulo: "Resolver sin juez",
    frase: "La EPS cede ante el costo de negar. Descongestión.",
    ruta: "/demandado",
  },
  {
    titulo: "El juez decide",
    frase: "Fallo sugerido y fundamentado. El humano firma.",
    ruta: "/juez",
  },
];

export function ModoPresentacion() {
  const router = useRouter();
  const [activo, setActivo] = useState(false);
  const [paso, setPaso] = useState(0);

  const total = PASOS.length;
  const actual = PASOS[paso];

  // Inicia la presentación desde el primer acto y navega a su ruta.
  const iniciar = useCallback(() => {
    setPaso(0);
    setActivo(true);
    router.push(PASOS[0].ruta);
  }, [router]);

  const salir = useCallback(() => setActivo(false), []);

  const irA = useCallback(
    (idx: number) => {
      const next = Math.max(0, Math.min(total - 1, idx));
      setPaso(next);
      router.push(PASOS[next].ruta);
    },
    [router, total],
  );

  const siguiente = useCallback(() => irA(paso + 1), [irA, paso]);
  const anterior = useCallback(() => irA(paso - 1), [irA, paso]);

  // Teclado: flechas para navegar, Esc para salir.
  useEffect(() => {
    if (!activo) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        salir();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        siguiente();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        anterior();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activo, salir, siguiente, anterior]);

  // Apagado: sólo un botón flotante discreto.
  if (!activo) {
    return (
      <button
        type="button"
        onClick={iniciar}
        aria-label="Iniciar modo presentación"
        className="presentacion-launcher inline-flex items-center gap-2 rounded-full border border-[#30363D] bg-[#161B22]/90 px-4 py-2.5 text-sm font-medium text-[#E6EDF3] shadow-[0_8px_30px_-12px_rgba(0,0,0,0.8)] backdrop-blur transition-colors hover:border-[#1B6B6D] hover:bg-[#161B22]"
      >
        <Play className="size-4 fill-[#1B6B6D] text-[#1B6B6D]" aria-hidden />
        <span className="hidden sm:inline">Modo presentación</span>
        <span className="sm:hidden">Presentar</span>
      </button>
    );
  }

  // Encendido: overlay con la guía del paso actual.
  return (
    <div
      className="presentacion-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Modo presentación"
      onClick={(e) => {
        if (e.target === e.currentTarget) salir();
      }}
    >
      <div className="presentacion-card glow-card glow-card--teal w-full max-w-md p-5 sm:p-6">
        <div className="mb-3 flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#1B6B6D]">
            <Presentation className="size-4" aria-hidden />
            Demo guiado
          </span>
          <div className="flex items-center gap-3">
            <span className="glow-num text-xs text-[#8B949E]">
              {paso + 1} / {total}
            </span>
            <button
              type="button"
              onClick={salir}
              aria-label="Salir del modo presentación (Esc)"
              className="grid size-8 place-items-center rounded-full text-[#8B949E] transition-colors hover:bg-white/5 hover:text-[#E6EDF3]"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        <h2 className="font-heading text-2xl font-semibold leading-tight text-[#E6EDF3]">
          {actual.titulo}
        </h2>
        <p className="mt-2 text-[15px] leading-relaxed text-[#8B949E] text-pretty">
          {actual.frase}
        </p>

        {/* Indicador de progreso por pasos. */}
        <div className="mt-4 flex gap-1.5" aria-hidden>
          {PASOS.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => irA(i)}
              className={
                i === paso
                  ? "h-1.5 flex-1 rounded-full bg-[#1B6B6D] shadow-[0_0_8px_0_rgba(27,107,109,0.7)]"
                  : i < paso
                    ? "h-1.5 flex-1 rounded-full bg-[#1B6B6D]/40"
                    : "h-1.5 flex-1 rounded-full bg-[#30363D]"
              }
            />
          ))}
        </div>

        <div className="mt-5 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={anterior}
            disabled={paso === 0}
            className="inline-flex items-center gap-1.5 rounded-full border border-[#30363D] bg-[#0D1117] px-4 py-2 text-sm font-medium text-[#E6EDF3] transition-colors hover:border-[#1B6B6D]/60 hover:bg-[#161B22] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft className="size-4" />
            Anterior
          </button>

          {paso < total - 1 ? (
            <button
              type="button"
              onClick={siguiente}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#1B6B6D] bg-[#1B6B6D] px-5 py-2 text-sm font-semibold text-white shadow-[0_0_18px_-4px_rgba(27,107,109,0.9)] transition-colors hover:bg-[#17585a]"
            >
              Siguiente
              <ChevronRight className="size-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={salir}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#1B6B6D] bg-[#1B6B6D] px-5 py-2 text-sm font-semibold text-white shadow-[0_0_18px_-4px_rgba(27,107,109,0.9)] transition-colors hover:bg-[#17585a]"
            >
              Terminar
            </button>
          )}
        </div>

        <p className="mt-3 text-center text-[10px] text-[#8B949E]/70">
          Usa ← / → para navegar · Esc para salir
        </p>
      </div>
    </div>
  );
}

export default ModoPresentacion;
