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
import { useT } from "@/lib/i18n";

interface KpiItem {
  /** Clave del KPI en el namespace atlas (kpis.<key>.label/.note/.sourceAria). */
  clave: "tutelas" | "granted" | "ips" | "resolved";
  valor: string;
  Icono: typeof FileText;
  /** Color del acento del ícono (tonos de marca/semánticos AAA sobre blanco). */
  tono: string;
  ilustrativo: boolean;
}

export function AtlasKpis({ resueltosSinJuez }: { resueltosSinJuez: number }) {
  const t = useT("atlas");
  const k = kpisNacionales();

  const items: KpiItem[] = [
    {
      clave: "tutelas",
      valor: fmt(k.totalTutelasSalud),
      Icono: FileText,
      tono: "text-[var(--info)]",
      ilustrativo: false,
    },
    {
      clave: "granted",
      valor: `~${k.porcentajeConcedidas}%`,
      Icono: CheckCircle2,
      tono: "text-[var(--success)]",
      ilustrativo: false,
    },
    {
      clave: "ips",
      valor: fmt(k.ipsNacional),
      Icono: Hospital,
      tono: "text-[var(--warning)]",
      ilustrativo: false,
    },
    {
      clave: "resolved",
      valor: fmt(resueltosSinJuez),
      Icono: Handshake,
      tono: "text-brand",
      ilustrativo: false,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {items.map((it) => (
        <Card
          key={it.clave}
          className="surface-card gap-0 py-0 ring-0"
        >
          <CardContent className="flex flex-col gap-2 p-4">
            <div className="flex items-center justify-between">
              <span className={it.tono}>
                <it.Icono className="size-5" aria-hidden />
              </span>
              <Tooltip>
                <TooltipTrigger
                  aria-label={t(`kpis.${it.clave}.sourceAria`)}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Info className="size-3.5" />
                </TooltipTrigger>
                <TooltipContent className="max-w-[220px] text-pretty">
                  {t(`kpis.${it.clave}.note`)}
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="font-mono tabular-nums text-2xl leading-none font-semibold text-foreground sm:text-3xl">
              {it.valor}
            </div>
            <p className="text-xs leading-tight text-muted-foreground">
              {t(`kpis.${it.clave}.label`)}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default AtlasKpis;
