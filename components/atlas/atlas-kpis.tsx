"use client";

// components/atlas/atlas-kpis.tsx
// Tarjetas de KPIs nacionales. Cifras ilustrativas marcadas con asterisco.

import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  FileText,
  CheckCircle2,
  Hospital,
  Handshake,
  Info,
} from "lucide-react";
import { kpisNacionales, fmt } from "./atlas-data";

interface KpiItem {
  etiqueta: string;
  valor: string;
  Icono: typeof FileText;
  tono: string;
  ilustrativo: boolean;
  nota: string;
}

export function AtlasKpis({ resueltosSinJuez }: { resueltosSinJuez: number }) {
  const k = kpisNacionales();

  const items: KpiItem[] = [
    {
      etiqueta: "Tutelas de salud (2023)",
      valor: fmt(k.totalTutelasSalud),
      Icono: FileText,
      tono: "text-info",
      ilustrativo: false,
      nota: "Dato real: Corte Constitucional (datos.gov.co), validado vs. Defensoría del Pueblo 2023.",
    },
    {
      etiqueta: "% concedidas",
      valor: `~${k.porcentajeConcedidas}%`,
      Icono: CheckCircle2,
      tono: "text-success",
      ilustrativo: false,
      nota: "La gran mayoría se conceden: el juez confirma un derecho que ya existía (Defensoría del Pueblo).",
    },
    {
      etiqueta: "IPS en el país",
      valor: fmt(k.ipsNacional),
      Icono: Hospital,
      tono: "text-warning",
      ilustrativo: false,
      nota: "Instituciones Prestadoras de Servicios de Salud — REPS / Ministerio de Salud.",
    },
    {
      etiqueta: "Resueltos sin juez",
      valor: fmt(resueltosSinJuez),
      Icono: Handshake,
      tono: "text-primary",
      ilustrativo: false,
      nota: "Casos resueltos en negociación con la EPS, sin llegar a despacho judicial.",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {items.map((it) => (
        <Card key={it.etiqueta} className="surface-card border-0 py-0">
          <CardContent className="flex flex-col gap-2 p-4">
            <div className="flex items-center justify-between">
              <span className={`${it.tono}`}>
                <it.Icono className="size-5" aria-hidden />
              </span>
              <Tooltip>
                <TooltipTrigger
                  aria-label={`Fuente: ${it.etiqueta}`}
                  className="text-muted-foreground/70 hover:text-muted-foreground"
                >
                  <Info className="size-3.5" />
                </TooltipTrigger>
                <TooltipContent className="max-w-[220px] text-pretty">
                  {it.nota}
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="font-heading text-2xl leading-none font-semibold tabular-nums sm:text-3xl">
              {it.valor}
            </div>
            <p className="text-xs leading-tight text-muted-foreground">
              {it.etiqueta}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default AtlasKpis;
