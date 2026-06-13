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
    <div className="glow-card glow-card--teal flex flex-col gap-3 p-3">
      {/* Selector de métrica: chips dark con estado activo teal. */}
      <div className="flex flex-wrap gap-1.5">
        {(Object.keys(METRICAS) as MetricaAtlas[]).map((m) => {
          const activo = m === metrica;
          return (
            <Button
              key={m}
              size="sm"
              variant="secondary"
              onClick={() => onMetrica(m)}
              aria-pressed={activo}
              className={
                activo
                  ? "h-8 border border-[#1B6B6D] bg-[#1B6B6D] px-2.5 text-xs font-medium text-white shadow-[0_0_14px_-2px_rgba(27,107,109,0.7)] hover:bg-[#1B6B6D]"
                  : "h-8 border border-[#30363D] bg-[#0D1117] px-2.5 text-xs text-[#8B949E] hover:border-[#1B6B6D]/60 hover:bg-[#161B22] hover:text-[#E6EDF3]"
              }
            >
              {METRICAS[m].etiqueta}
            </Button>
          );
        })}
      </div>

      <div>
        <p className="mb-1.5 text-[11px] font-medium text-[#8B949E]">
          {METRICAS[metrica].descripcion}
        </p>
        {/* Rampa teal→rojo, con anillo sutil para legibilidad sobre fondo dark. */}
        <div className="flex h-3 overflow-hidden rounded-full ring-1 ring-white/10">
          {RAMPA.map((c) => (
            <div key={c} className="flex-1" style={{ backgroundColor: c }} />
          ))}
        </div>
        <div className="glow-num mt-1.5 flex justify-between text-[10px] text-[#8B949E]">
          <span className="text-[#1B6B6D]">menor</span>
          {cortes.map((c, i) => (
            <span key={i}>
              {fmt(c)}
              {sufijo}
            </span>
          ))}
          <span className="text-[#d73027]">mayor</span>
        </div>
      </div>
      <p className="text-[10px] leading-tight text-[#8B949E]/70">
        Datos ilustrativos por departamento. No constituyen estadística oficial.
      </p>
    </div>
  );
}

export default AtlasLeyenda;
