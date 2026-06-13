// components/juez/juez-cronograma.tsx — Cronograma de plazos legales del caso.

"use client";

import { CalendarClock, CheckCircle2, Circle } from "lucide-react";
import { useT, useLang } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import type { PlazoLegal } from "@/lib/types";
import { PlazoBadge } from "./juez-badges";
import { diasRestantes, fechaCorta, semaforoPlazo } from "./juez-utils";

export function Cronograma({ plazos }: { plazos: PlazoLegal[] }) {
  const t = useT("juez");
  const { lang } = useLang();
  return (
    <ol className="relative space-y-4 pl-6">
      {/* Línea vertical */}
      <span
        aria-hidden
        className="absolute top-1.5 bottom-1.5 left-[7px] w-px bg-border"
      />
      {plazos.map((p) => {
        const dias = diasRestantes(p.fechaLimite);
        const sem = semaforoPlazo(dias);
        const color = p.cumplido
          ? "text-success"
          : sem === "vencido" || sem === "critico"
            ? "text-danger"
            : sem === "proximo"
              ? "text-warning"
              : "text-muted-foreground";
        return (
          <li key={p.hito} className="relative">
            <span
              className={cn(
                "absolute top-0.5 -left-6 flex size-4 items-center justify-center rounded-full bg-card",
                color,
              )}
            >
              {p.cumplido ? (
                <CheckCircle2 className="size-4" />
              ) : (
                <Circle className="size-3.5" />
              )}
            </span>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-medium text-foreground">
                {p.etiqueta}
              </p>
              <PlazoBadge dias={dias} cumplido={p.cumplido} />
            </div>
            <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
              <CalendarClock className="size-3.5" />
              {fechaCorta(p.fechaLimite, lang)} ·{" "}
              {p.habiles
                ? t("schedule.businessDays", { dias: p.dias })
                : t("schedule.calendarDays", { dias: p.dias })}
            </p>
            <p className="text-[11px] text-muted-foreground">
              {p.fundamento}
            </p>
          </li>
        );
      })}
    </ol>
  );
}
