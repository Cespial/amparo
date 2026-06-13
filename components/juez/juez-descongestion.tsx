// components/juez/juez-descongestion.tsx — Contador de descongestión global.
// Compara casos resueltos SIN juez (acuerdo con EPS) vs. los que llegaron a fallo.

"use client";

import { Gavel, Handshake, TrendingDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { Caso } from "@/lib/types";

export function Descongestion({ casos }: { casos: Caso[] }) {
  const resueltosSinJuez = casos.filter(
    (c) => c.estado === "RESUELTO_EPS",
  ).length;
  const fallados = casos.filter((c) => c.estado === "FALLADO").length;
  const enDespacho = casos.filter(
    (c) => c.estado === "ESCALADO_TUTELA" || c.estado === "EN_DESPACHO",
  ).length;

  const totalResueltos = resueltosSinJuez + fallados;
  const pctDescongestion =
    totalResueltos > 0
      ? Math.round((resueltosSinJuez / totalResueltos) * 100)
      : 0;

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
              <TrendingDown className="size-4 text-success" />
              Descongestión judicial
            </p>
            <p className="mt-1 font-heading text-3xl font-bold tabular-nums text-navy">
              {pctDescongestion}%
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              de disputas resueltas sin llegar a fallo
            </p>
          </div>
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-success/10 text-success">
            <TrendingDown className="size-5" />
          </span>
        </div>

        <Progress value={pctDescongestion} className="mt-4" />

        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <Metrica
            icon={<Handshake className="size-4 text-success" />}
            valor={resueltosSinJuez}
            etiqueta="Acuerdo EPS"
          />
          <Metrica
            icon={<Gavel className="size-4 text-navy" />}
            valor={fallados}
            etiqueta="Fallados"
          />
          <Metrica
            icon={<Gavel className="size-4 text-primary" />}
            valor={enDespacho}
            etiqueta="En despacho"
          />
        </div>
      </CardContent>
    </Card>
  );
}

function Metrica({
  icon,
  valor,
  etiqueta,
}: {
  icon: React.ReactNode;
  valor: number;
  etiqueta: string;
}) {
  return (
    <div className="rounded-lg bg-muted/50 px-2 py-2.5">
      <div className="flex items-center justify-center">{icon}</div>
      <p className="mt-1 text-lg font-bold tabular-nums text-navy">{valor}</p>
      <p className="text-[11px] leading-tight text-muted-foreground">
        {etiqueta}
      </p>
    </div>
  );
}
