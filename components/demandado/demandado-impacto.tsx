"use client";

// components/demandado/demandado-impacto.tsx
// Panel de impacto de la descongestión judicial lograda por la EPS.

import { Gavel, HandCoins, ShieldCheck, TrendingDown } from "lucide-react";
import { DIAS_JUEZ_POR_CASO } from "./demandado-utils";

export interface DemandadoImpactoProps {
  /** Casos resueltos sin juez en esta sesión. */
  resueltos: number;
  /** Total de reclamaciones que llegaron a la bandeja. */
  totalEntrantes: number;
}

function Metrica({
  icon,
  valor,
  etiqueta,
  acento,
}: {
  icon: React.ReactNode;
  valor: string;
  etiqueta: string;
  acento: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-white/10 px-3 py-3">
      <span
        className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${acento}`}
      >
        {icon}
      </span>
      <div className="min-w-0">
        <p className="font-mono text-2xl font-bold leading-none tabular-nums">
          {valor}
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
  const diasJuez = resueltos * DIAS_JUEZ_POR_CASO;
  const tasa =
    totalEntrantes > 0 ? Math.round((resueltos / totalEntrantes) * 100) : 0;

  return (
    <div className="overflow-hidden rounded-2xl bg-navy p-5 text-navy-foreground shadow-sm">
      <div className="flex items-center gap-2">
        <TrendingDown className="size-4 text-success" />
        <h2 className="font-heading text-sm font-semibold tracking-tight">
          Impacto de la resolución sin juez
        </h2>
      </div>
      <p className="mt-1 text-xs text-navy-foreground/70">
        Cada acuerdo descongestiona la rama judicial y resuelve antes para el
        paciente.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <Metrica
          icon={<ShieldCheck className="size-5 text-success" />}
          valor={String(resueltos)}
          etiqueta="Casos resueltos sin juez"
          acento="bg-success/15"
        />
        <Metrica
          icon={<Gavel className="size-5 text-info" />}
          valor={String(diasJuez)}
          etiqueta="Días-juez ahorrados"
          acento="bg-info/20"
        />
        <Metrica
          icon={<HandCoins className="size-5 text-warning" />}
          valor={`${tasa}%`}
          etiqueta="Tasa de descongestión"
          acento="bg-warning/20"
        />
      </div>
    </div>
  );
}
