"use client";

// components/demandado/demandado-impacto.tsx
// Panel de impacto de la descongestión judicial lograda por la EPS.

import { Gavel, HandCoins, ShieldCheck, TrendingDown } from "lucide-react";
import { useT } from "@/lib/i18n";
import { DIAS_JUEZ_POR_CASO } from "./demandado-utils";
import { useCountUp } from "./use-count-up";

export interface DemandadoImpactoProps {
  /** Casos resueltos sin juez en esta sesión. */
  resueltos: number;
  /** Total de reclamaciones que llegaron a la bandeja. */
  totalEntrantes: number;
}

/** Métrica cuyo número entero "sube" (count-up) al entrar en viewport / cambiar. */
function MetricaConteo({
  icon,
  valor,
  sufijo = "",
  etiqueta,
  acento,
  delayMs = 0,
}: {
  icon: React.ReactNode;
  valor: number;
  sufijo?: string;
  etiqueta: string;
  acento: string;
  delayMs?: number;
}) {
  const { ref, display } = useCountUp(valor, { delayMs });
  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      className="flex items-center gap-3 rounded-xl bg-white/10 px-3 py-3"
    >
      <span
        className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${acento}`}
      >
        {icon}
      </span>
      <div className="min-w-0">
        <p className="font-mono text-2xl font-bold leading-none tabular-nums">
          {display}
          {sufijo}
        </p>
        <p className="mt-1 text-xs text-navy-foreground/70">{etiqueta}</p>
      </div>
    </div>
  );
}

export function DemandadoImpacto({
  resueltos,
  totalEntrantes,
}: DemandadoImpactoProps) {
  const t = useT("demandado");
  const diasJuez = resueltos * DIAS_JUEZ_POR_CASO;
  const tasa =
    totalEntrantes > 0 ? Math.round((resueltos / totalEntrantes) * 100) : 0;

  return (
    <div className="overflow-hidden rounded-2xl bg-navy p-5 text-navy-foreground shadow-sm">
      <div className="flex items-center gap-2">
        <TrendingDown className="size-4 text-success" />
        <h2 className="font-heading text-sm font-semibold tracking-tight">
          {t("impact.heading")}
        </h2>
      </div>
      <p className="mt-1 text-xs text-navy-foreground/70">
        {t("impact.subtitle")}
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <MetricaConteo
          icon={<ShieldCheck className="size-5 text-success" />}
          valor={resueltos}
          etiqueta={t("impact.resolved")}
          acento="bg-success/15"
        />
        <MetricaConteo
          icon={<Gavel className="size-5 text-info" />}
          valor={diasJuez}
          etiqueta={t("impact.judgeDays")}
          acento="bg-info/20"
          delayMs={120}
        />
        <MetricaConteo
          icon={<HandCoins className="size-5 text-warning" />}
          valor={tasa}
          sufijo="%"
          etiqueta={t("impact.rate")}
          acento="bg-warning/20"
          delayMs={240}
        />
      </div>
    </div>
  );
}
