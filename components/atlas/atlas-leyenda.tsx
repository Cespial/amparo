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
import { useT } from "@/lib/i18n";

interface AtlasLeyendaProps {
  metrica: MetricaAtlas;
  onMetrica: (m: MetricaAtlas) => void;
  /** Capa de puntos de IPS por municipio. */
  mostrarIps: boolean;
  onToggleIps: (v: boolean) => void;
}

export function AtlasLeyenda({
  metrica,
  onMetrica,
  mostrarIps,
  onToggleIps,
}: AtlasLeyendaProps) {
  const t = useT("atlas");
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
              {t(`metrics.${m}.label`)}
            </Button>
          );
        })}
      </div>

      <div>
        <p className="mb-1.5 text-[11px] font-medium text-[#8B949E]">
          {t(`metrics.${metrica}.description`)}
        </p>
        {/* Rampa teal→rojo, con anillo sutil para legibilidad sobre fondo dark. */}
        <div className="flex h-3 overflow-hidden rounded-full ring-1 ring-white/10">
          {RAMPA.map((c) => (
            <div key={c} className="flex-1" style={{ backgroundColor: c }} />
          ))}
        </div>
        <div className="glow-num mt-1.5 flex justify-between text-[10px] text-[#8B949E]">
          <span className="text-[#2BD9C0]">{t("legend.lower")}</span>
          {cortes.map((c, i) => (
            <span key={i}>
              {fmt(c)}
              {sufijo}
            </span>
          ))}
          <span className="text-[#f06a5e]">{t("legend.higher")}</span>
        </div>
      </div>
      {/* Toggle de la capa de puntos de IPS por municipio. */}
      <div className="border-t border-[#30363D] pt-2.5">
        <button
          type="button"
          role="switch"
          aria-checked={mostrarIps}
          onClick={() => onToggleIps(!mostrarIps)}
          className="flex w-full items-center justify-between gap-2 text-left"
        >
          <span className="flex items-center gap-2">
            <span
              aria-hidden
              className={
                mostrarIps
                  ? "size-2.5 rounded-full bg-[#2BD9C0] shadow-[0_0_8px_1px_rgba(43,217,192,0.8)]"
                  : "size-2.5 rounded-full border border-[#30363D] bg-[#0D1117]"
              }
            />
            <span
              className={
                mostrarIps
                  ? "text-xs font-medium text-[#E6EDF3]"
                  : "text-xs font-medium text-[#8B949E]"
              }
            >
              {t("legend.toggleIps")}
            </span>
          </span>
          {/* Track del switch. */}
          <span
            className={
              mostrarIps
                ? "relative h-4 w-7 rounded-full bg-[#1B6B6D] shadow-[0_0_10px_-1px_rgba(27,107,109,0.8)] transition-colors"
                : "relative h-4 w-7 rounded-full bg-[#30363D] transition-colors"
            }
          >
            <span
              className={
                mostrarIps
                  ? "absolute top-0.5 left-0.5 size-3 translate-x-3 rounded-full bg-white transition-transform"
                  : "absolute top-0.5 left-0.5 size-3 rounded-full bg-[#8B949E] transition-transform"
              }
            />
          </span>
        </button>
        <p className="mt-1.5 text-[10px] leading-tight text-[#8B949E]">
          {mostrarIps ? t("legend.ipsOn") : t("legend.ipsOff")}
        </p>
      </div>

      <p className="text-[10px] leading-tight text-[#8B949E]">
        {t("legend.source")}
      </p>
    </div>
  );
}

export default AtlasLeyenda;
