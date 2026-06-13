"use client";

// components/mediacion/sala-mediacion-panel.tsx
// Sala de mediación PROMOVIDA a primer plano: panel inline para la vista de
// aterrizaje del demandado. En vez de esconder la sala a dos clics (fila → agente
// → Mediar), aquí Amparo —la cuarta parte— ya está mediando un caso concreto en
// cuanto se abre la bandeja.
//
// Auto-selecciona un caso representativo de la cola (el de mayor probabilidad de
// amparo, el "más obvio" de ceder) y monta el mismo cuerpo de consenso que usa el
// diálogo (SalaMediacionContenido), con su propio ciclo de vida por caso (key).
// El usuario puede saltar a otro caso desde un selector compacto.

import { useEffect, useMemo, useState } from "react";
import { HeartHandshake, Sparkles } from "lucide-react";

import type { Caso, Mediacion } from "@/lib/types";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SalaMediacionContenido } from "./sala-mediacion-dialog";

export interface SalaMediacionPanelProps {
  /** Cola de casos en negociación (se ordena/filtra internamente). */
  casos: Caso[];
  /**
   * Acuerdo por consenso: ambas partes aceptaron. El contenedor resuelve el caso
   * (RESUELTO_EPS) y suma a la descongestión.
   */
  onAcuerdo?: (caso: Caso, mediacion: Mediacion) => void;
  className?: string;
}

/**
 * Panel inline de la Sala de mediación. Promueve la "cuarta parte" a primer plano
 * con un caso ya cargado, sin sacar al usuario de la vista de la bandeja.
 */
export function SalaMediacionPanel({
  casos,
  onAcuerdo,
  className,
}: SalaMediacionPanelProps) {
  const t = useT("mediacion");

  // Caso destacado: el primero de la cola (la bandeja ya llega ordenada por
  // probabilidad/urgencia desde la página, así que el [0] es el "más obvio").
  const sugerido = casos[0]?.id ?? null;
  const [casoId, setCasoId] = useState<string | null>(sugerido);

  // Si la cola cambia (se resuelve el caso activo, llegan otros), reapunta al
  // primero disponible cuando el seleccionado ya no esté en negociación.
  useEffect(() => {
    if (casoId && casos.some((c) => c.id === casoId)) return;
    setCasoId(casos[0]?.id ?? null);
  }, [casos, casoId]);

  const casoActivo = useMemo(
    () => casos.find((c) => c.id === casoId) ?? null,
    [casos, casoId],
  );

  if (!casoActivo) return null;

  return (
    <section
      className={cn("surface-card overflow-hidden p-5 sm:p-6", className)}
      aria-label={t("room.title")}
    >
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-brand-strong">
            <HeartHandshake className="size-5" />
            <span className="text-xs font-semibold uppercase tracking-wide">
              {t("room.eyebrow")}
            </span>
            <Badge variant="secondary" className="gap-1">
              <Sparkles className="size-3" />
              {t("room.fourthParty")}
            </Badge>
          </div>
          <h2 className="mt-1 font-serif text-2xl font-bold tracking-tight text-navy">
            {t("room.title")}
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            {t("room.subtitle")}
          </p>
        </div>

        {/* Saltar entre casos sin salir del panel (cuando hay más de uno). */}
        {casos.length > 1 && (
          <div className="flex shrink-0 flex-wrap gap-1.5">
            {casos.slice(0, 4).map((c) => (
              <Button
                key={c.id}
                variant={c.id === casoId ? "secondary" : "outline"}
                size="sm"
                onClick={() => setCasoId(c.id)}
                className="max-w-[10rem] justify-start gap-0 truncate"
                aria-pressed={c.id === casoId}
              >
                <span className="truncate">{c.demandante.nombre}</span>
              </Button>
            ))}
          </div>
        )}
      </header>

      <div className="mt-5">
        {/* key por caso: reinicia el ciclo de vida de la sala al cambiar de caso. */}
        <SalaMediacionContenido
          key={casoActivo.id}
          caso={casoActivo}
          onAcuerdo={onAcuerdo}
        />
      </div>
    </section>
  );
}
