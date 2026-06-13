"use client";

// components/atlas/atlas-leyenda.tsx
// Leyenda del coroplético + selector de métrica.

import { Button } from "@/components/ui/button";
import {
  type MetricaAtlas,
  METRICAS,
  RAMPA,
  umbralesLeyenda,
  fmt,
} from "./atlas-data";

interface AtlasLeyendaProps {
  metrica: MetricaAtlas;
  onMetrica: (m: MetricaAtlas) => void;
}

export function AtlasLeyenda({ metrica, onMetrica }: AtlasLeyendaProps) {
  const cortes = umbralesLeyenda(metrica);
  const sufijo = METRICAS[metrica].sufijo;

  return (
    <div className="surface-card flex flex-col gap-3 p-3">
      <div className="flex flex-wrap gap-1.5">
        {(Object.keys(METRICAS) as MetricaAtlas[]).map((m) => (
          <Button
            key={m}
            size="sm"
            variant={m === metrica ? "default" : "secondary"}
            onClick={() => onMetrica(m)}
            className="h-8 px-2.5 text-xs"
          >
            {METRICAS[m].etiqueta}
          </Button>
        ))}
      </div>

      <div>
        <p className="mb-1.5 text-[11px] font-medium text-muted-foreground">
          {METRICAS[metrica].descripcion}
        </p>
        <div className="flex h-3 overflow-hidden rounded-full">
          {RAMPA.map((c) => (
            <div key={c} className="flex-1" style={{ backgroundColor: c }} />
          ))}
        </div>
        <div className="mt-1 flex justify-between text-[10px] tabular-nums text-muted-foreground">
          <span>menor</span>
          {cortes.map((c, i) => (
            <span key={i}>
              {fmt(c)}
              {sufijo}
            </span>
          ))}
          <span>mayor</span>
        </div>
      </div>
      <p className="text-[10px] leading-tight text-muted-foreground/80">
        Datos ilustrativos por departamento. No constituyen estadística oficial.
      </p>
    </div>
  );
}

export default AtlasLeyenda;
