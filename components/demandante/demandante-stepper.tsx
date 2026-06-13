"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PasoDef {
  id: number;
  titulo: string;
}

/**
 * Stepper "Paso X de N" cálido y grande. Mobile-first: en pantallas pequeñas
 * muestra puntos + etiqueta del paso actual; en escritorio, la fila completa.
 */
export function DemandanteStepper({
  pasos,
  actual,
}: {
  pasos: PasoDef[];
  actual: number;
}) {
  const total = pasos.length;
  const pasoActual = pasos.find((p) => p.id === actual);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-muted-foreground">
          Paso{" "}
          <span className="font-bold text-primary">{actual}</span> de {total}
        </p>
        <p className="font-serif text-base font-semibold text-navy sm:hidden">
          {pasoActual?.titulo}
        </p>
      </div>

      {/* Fila de pasos (escritorio) */}
      <ol className="mt-3 hidden items-center sm:flex">
        {pasos.map((p, i) => {
          const completado = p.id < actual;
          const activo = p.id === actual;
          return (
            <li
              key={p.id}
              className={cn("flex items-center", i < total - 1 && "flex-1")}
            >
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold transition-colors",
                    completado &&
                      "border-success bg-success text-success-foreground",
                    activo && "border-primary bg-primary text-primary-foreground",
                    !completado &&
                      !activo &&
                      "border-border bg-card text-muted-foreground",
                  )}
                  aria-current={activo ? "step" : undefined}
                >
                  {completado ? <Check className="size-4" /> : p.id}
                </span>
                <span
                  className={cn(
                    "text-[0.8rem] font-medium leading-tight",
                    activo ? "text-navy" : "text-muted-foreground",
                  )}
                >
                  {p.titulo}
                </span>
              </div>
              {i < total - 1 && (
                <span
                  className={cn(
                    "mx-2 h-0.5 flex-1 rounded-full transition-colors",
                    completado ? "bg-success" : "bg-border",
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>

      {/* Puntos (móvil) */}
      <div className="mt-3 flex items-center gap-1.5 sm:hidden">
        {pasos.map((p) => (
          <span
            key={p.id}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-colors",
              p.id < actual && "bg-success",
              p.id === actual && "bg-primary",
              p.id > actual && "bg-border",
            )}
          />
        ))}
      </div>
    </div>
  );
}
