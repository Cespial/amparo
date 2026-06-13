"use client";

// components/demandante/peticion-reloj.tsx
// Tarjeta del derecho de petición: responsable concreto + reloj de SLA.
// Reutilizable en /demandante (ruta EPS) y /demandado.

import { Building2, Clock, FileText, ShieldQuestion } from "lucide-react";
import type { PeticionFormal } from "@/lib/types";
import { relojPeticion } from "@/lib/peticion";
import { cn } from "@/lib/utils";

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

const FMT = new Intl.DateTimeFormat("es-CO", {
  day: "2-digit",
  month: "long",
  year: "numeric",
});

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
  const reloj = relojPeticion(peticion);
  const meta = SEMAFORO_META[reloj.semaforo];

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
            Derecho de petición radicado
          </p>
          <p className="text-xs text-muted-foreground">
            Tu EPS está obligada a responder de fondo dentro del término legal.
          </p>
        </div>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {/* Responsable */}
        <div className="rounded-xl border bg-background/60 p-3">
          <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            <Building2 className="size-3.5" /> ¿Quién debe responder?
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
            <Clock className="size-3.5" /> ¿Cuándo debe responder?
          </p>
          <p className={cn("mt-1 font-heading text-lg font-bold", meta.texto)}>
            {reloj.etiqueta}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Vence el{" "}
            {FMT.format(new Date(peticion.slaVence))} ·{" "}
            {peticion.slaDias} días {peticion.slaHabiles ? "hábiles" : "calendario"}
          </p>
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
