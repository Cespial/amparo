"use client";

// components/demandante/peticion-reloj.tsx
// Tarjeta del derecho de petición: responsable concreto + reloj de SLA.
// Reutilizable en /demandante (ruta EPS) y /demandado.

import { useEffect, useRef, useState } from "react";
import { Building2, Clock, FileText, ShieldQuestion } from "lucide-react";
import type { PeticionFormal } from "@/lib/types";
import { relojPeticion } from "@/lib/peticion";
import { cn } from "@/lib/utils";
import { useT, useLang } from "@/lib/i18n";

const SEMAFORO_META: Record<
  ReturnType<typeof relojPeticion>["semaforo"],
  { anillo: string; texto: string; chip: string; punto: string }
> = {
  vencido: {
    anillo: "border-danger/30 bg-danger/5",
    texto: "text-danger",
    chip: "bg-danger/10 text-danger",
    punto: "bg-danger",
  },
  critico: {
    anillo: "border-danger/30 bg-danger/5",
    texto: "text-danger",
    chip: "bg-danger/10 text-danger",
    punto: "bg-danger",
  },
  proximo: {
    anillo: "border-warning/30 bg-warning/5",
    texto: "text-warning",
    chip: "bg-warning/15 text-warning",
    punto: "bg-warning",
  },
  ok: {
    anillo: "border-info/30 bg-info/5",
    texto: "text-info",
    chip: "bg-info/10 text-info",
    punto: "bg-info",
  },
};

export interface PeticionRelojProps {
  peticion: PeticionFormal;
  /** Compacto: una fila resumida (para la bandeja del demandado). */
  compacto?: boolean;
  className?: string;
}

export function PeticionReloj({
  peticion,
  compacto = false,
  className,
}: PeticionRelojProps) {
  const t = useT("demandante");
  const { lang } = useLang();
  const reloj = relojPeticion(peticion);
  const meta = SEMAFORO_META[reloj.semaforo];
  const fmt = new Intl.DateTimeFormat(lang === "en" ? "en-US" : "es-CO", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const tipoDias = peticion.slaHabiles
    ? t("peticion.diasHabiles")
    : t("peticion.diasCalendario");

  // Fracción de término que aún queda (1 = recién radicada; 0 = vencida). El
  // anillo SVG se "vacía" desde 1 hasta esta fracción al revelar el reloj.
  const fraccionRestante =
    peticion.slaDias > 0
      ? Math.max(0, Math.min(1, reloj.diasRestantes / peticion.slaDias))
      : 0;
  // "Bajo esfuerzo" = ruta de respuesta veloz: término corto (≤ 5 días, p.ej.
  // urgencia vital 48h o petición prioritaria). El anillo se vacía más rápido
  // para comunicar la premura.
  const bajoEsfuerzo = peticion.slaDias <= 5;

  if (compacto) {
    return (
      <div
        className={cn(
          "flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-xs",
          meta.anillo,
          className,
        )}
      >
        <span className={cn("size-2 shrink-0 rounded-full", meta.punto)} />
        <Clock className={cn("size-3.5 shrink-0", meta.texto)} />
        <span className={cn("font-medium", meta.texto)}>{reloj.etiqueta}</span>
        <span className="ml-auto truncate font-mono text-[10px] text-muted-foreground">
          {peticion.radicadoPeticion}
        </span>
      </div>
    );
  }

  return (
    <div className={cn("rounded-2xl border bg-card p-4 shadow-sm", className)}>
      <div className="flex items-center gap-2">
        <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <ShieldQuestion className="size-4" />
        </span>
        <div>
          <p className="font-serif text-base font-semibold text-navy">
            {t("peticion.titulo")}
          </p>
          <p className="text-xs text-muted-foreground">
            {t("peticion.subtitulo")}
          </p>
        </div>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {/* Responsable */}
        <div className="rounded-xl border bg-background/60 p-3">
          <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            <Building2 className="size-3.5" /> {t("peticion.quienResponde")}
          </p>
          <p className="mt-1 text-sm font-medium text-navy">
            {peticion.responsable}
          </p>
          <p className="mt-0.5 text-xs leading-snug text-muted-foreground">
            {peticion.dependencia}
          </p>
        </div>

        {/* Reloj SLA */}
        <div className={cn("rounded-xl border p-3", meta.anillo)}>
          <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            <Clock className="size-3.5" /> {t("peticion.cuandoResponde")}
          </p>
          <div className="mt-1 flex items-center gap-3">
            <RelojAnillo
              restante={fraccionRestante}
              bajoEsfuerzo={bajoEsfuerzo}
              colorClass={meta.texto}
              dias={Math.max(0, reloj.diasRestantes)}
            />
            <div className="min-w-0">
              <p className={cn("font-heading text-lg font-bold", meta.texto)}>
                {reloj.etiqueta}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {t("peticion.vence", {
                  fecha: fmt.format(new Date(peticion.slaVence)),
                  dias: peticion.slaDias,
                  tipo: tipoDias,
                })}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium",
            meta.chip,
          )}
        >
          <FileText className="size-3" />
          {peticion.radicadoPeticion}
        </span>
        {peticion.fundamento && (
          <span className="text-muted-foreground">{peticion.fundamento}</span>
        )}
      </div>
    </div>
  );
}

/**
 * Anillo SVG de SLA que se "vacía" al montarse: anima desde lleno (todo el
 * término disponible) hasta `restante` (la fracción que aún queda). El centro
 * muestra los días restantes. Comunica de un vistazo cuánto tiempo le queda a
 * la EPS para responder; en rutas de bajo esfuerzo (término corto) el vaciado
 * es más rápido para transmitir premura.
 *
 * Respeta `prefers-reduced-motion`: pinta la fracción final sin animar.
 */
function RelojAnillo({
  restante,
  bajoEsfuerzo,
  colorClass,
  dias,
}: {
  /** Fracción de término aún disponible (0-1). */
  restante: number;
  /** Ruta de respuesta veloz (término corto): vaciado más rápido. */
  bajoEsfuerzo: boolean;
  /** Clase de color del trazo (sigue el semáforo, p.ej. "text-danger"). */
  colorClass: string;
  /** Días restantes a mostrar en el centro. */
  dias: number;
}) {
  const objetivo = Math.max(0, Math.min(1, restante));
  // Arranca lleno y se vacía hasta `objetivo`.
  const [frac, setFrac] = useState(1);
  const rafRef = useRef(0);

  useEffect(() => {
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    if (reduced || typeof requestAnimationFrame === "undefined") {
      setFrac(objetivo);
      return;
    }

    setFrac(1);
    // Bajo esfuerzo → vaciado más veloz (premura); de lo contrario, más calmo.
    const duracion = bajoEsfuerzo ? 750 : 1300;
    const inicio = performance.now();

    const tick = (now: number) => {
      const t = Math.min(1, (now - inicio) / duracion);
      // easeOutCubic: el vaciado desacelera al acercarse al valor final.
      const eased = 1 - Math.pow(1 - t, 3);
      setFrac(1 - (1 - objetivo) * eased);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setFrac(objetivo);
      }
    };
    const id = setTimeout(() => {
      rafRef.current = requestAnimationFrame(tick);
    }, 80);

    return () => {
      clearTimeout(id);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [objetivo, bajoEsfuerzo]);

  // Geometría del anillo (círculo completo).
  const size = 44;
  const stroke = 5;
  const r = (size - stroke) / 2;
  const c = size / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - frac);

  return (
    <span className="relative inline-flex shrink-0 items-center justify-center">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
        aria-hidden
      >
        {/* Pista de fondo */}
        <circle
          cx={c}
          cy={c}
          r={r}
          fill="none"
          stroke="var(--muted)"
          strokeWidth={stroke}
        />
        {/* Tiempo restante — se vacía al revelar */}
        <circle
          cx={c}
          cy={c}
          r={r}
          fill="none"
          className={colorClass}
          stroke="currentColor"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
        />
      </svg>
      <span
        className={cn(
          "absolute inset-0 flex items-center justify-center text-xs font-bold tabular-nums",
          colorClass,
        )}
      >
        {dias}
      </span>
    </span>
  );
}
