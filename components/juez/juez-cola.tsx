// components/juez/juez-cola.tsx — Lista priorizada de tutelas del despacho.

"use client";

import { ChevronRight, Gavel, Inbox } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useT, useLang } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { tCaso } from "@/lib/seed-en";
import type { Caso } from "@/lib/types";
import { EstadoBadge, UrgenciaBadge, PlazoBadge } from "./juez-badges";
import {
  prioridadCaso,
  probabilidadPct,
  plazoFallo,
  diasRestantes,
  fechaCorta,
} from "./juez-utils";

interface Props {
  casos: Caso[];
  onAbrir: (caso: Caso) => void;
  seleccionadoId?: string | null;
}

export function JuezCola({ casos, onAbrir, seleccionadoId }: Props) {
  const t = useT("juez");
  const { lang } = useLang();
  const ordenados = [...casos].sort(
    (a, b) => prioridadCaso(b) - prioridadCaso(a),
  );

  if (ordenados.length === 0) {
    return (
      <Card className="flex flex-col items-center justify-center gap-2 p-10 text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-success/10 text-success">
          <Inbox className="size-6" />
        </span>
        <p className="font-medium text-navy">{t("queue.emptyTitle")}</p>
        <p className="max-w-xs text-sm text-muted-foreground">
          {t("queue.emptyBody")}
        </p>
      </Card>
    );
  }

  return (
    <ul className="space-y-3">
      {ordenados.map((caso, i) => {
        const plazo = plazoFallo(caso);
        const dias = plazo ? diasRestantes(plazo.fechaLimite) : null;
        const prob = probabilidadPct(caso);
        const activo = seleccionadoId === caso.id;
        return (
          <li key={caso.id}>
            <Card
              className={cn(
                "group cursor-pointer p-0 transition-all hover:shadow-md focus-within:ring-2 focus-within:ring-ring",
                activo && "ring-2 ring-primary",
              )}
              onClick={() => onAbrir(caso)}
            >
              <button
                type="button"
                className="flex w-full items-stretch gap-0 text-left"
                onClick={(e) => {
                  e.stopPropagation();
                  onAbrir(caso);
                }}
                aria-label={t("queue.openAria", { nombre: caso.demandante.nombre })}
              >
                {/* Rango de prioridad */}
                <div className="flex w-12 shrink-0 flex-col items-center justify-center rounded-l-[inherit] bg-navy py-3 text-navy-foreground">
                  <span className="text-[10px] uppercase opacity-60">
                    {t("queue.priorityShort")}
                  </span>
                  <span className="font-heading text-lg font-bold tabular-nums">
                    {i + 1}
                  </span>
                </div>

                <div className="min-w-0 flex-1 p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <UrgenciaBadge urgencia={caso.urgencia} />
                    <EstadoBadge estado={caso.estado} />
                    {dias !== null && (
                      <PlazoBadge dias={dias} cumplido={plazo?.cumplido} />
                    )}
                  </div>

                  <p className="mt-2 truncate font-heading text-base font-semibold text-navy">
                    {caso.demandante.nombre}
                  </p>
                  <p className="truncate text-sm text-muted-foreground">
                    {tCaso(caso.servicioNegado, lang)} · {caso.demandado.nombre}
                  </p>
                  <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">
                    {caso.radicado}
                  </p>

                  <div className="mt-3 flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <Gavel className="size-3.5 text-primary" />
                      <span className="text-xs font-medium tabular-nums text-primary">
                        {prob}%
                      </span>
                    </div>
                    <Progress value={prob} className="h-1.5 flex-1" />
                    {plazo && (
                      <span className="hidden text-[11px] text-muted-foreground sm:inline">
                        {t("queue.rulingDate", {
                          fecha: fechaCorta(plazo.fechaLimite, lang),
                        })}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center pr-3">
                  <ChevronRight className="size-5 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </div>
              </button>
            </Card>
          </li>
        );
      })}
    </ul>
  );
}
