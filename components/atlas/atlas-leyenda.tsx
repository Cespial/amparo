"use client";

// components/atlas/atlas-leyenda.tsx
// Leyenda del coroplético + selector de métrica + toggles de capas.
// Chrome CLARO AAA (tarjeta blanca); la rampa teal→rojo se muestra con borde
// para legibilidad sobre fondo blanco.

import { Button } from "@/components/ui/button";
import {
  type MetricaAtlas,
  METRICAS,
  RAMPA,
  umbralesLeyenda,
  fmt,
} from "./atlas-data";
import { useT, useLang } from "@/lib/i18n";

interface AtlasLeyendaProps {
  metrica: MetricaAtlas;
  onMetrica: (m: MetricaAtlas) => void;
  /** Capa de puntos de IPS por municipio. */
  mostrarIps: boolean;
  onToggleIps: (v: boolean) => void;
  /** Capa de puntos de la red PÚBLICA (ESE) por municipio. */
  mostrarRedPublica: boolean;
  onToggleRedPublica: (v: boolean) => void;
}

/**
 * Copia bilingüe de los toggles de capas NUEVAS. No se añade al diccionario
 * i18n global (sólo se importa useLang); el resto de la vista sigue usando
 * useT("atlas") sin tocar sus claves.
 */
const COPIA = {
  es: {
    redPublica: "Red pública",
    redPublicaOn:
      "Cada punto es una Empresa Social del Estado (ESE); su tamaño crece con el nº de IPS públicas (REPS).",
    redPublicaOff: "Capa de red pública de salud (ESE) por municipio.",
  },
  en: {
    redPublica: "Public network",
    redPublicaOn:
      "Each dot is a public health enterprise (Empresa Social del Estado, ESE); the larger the dot, the more public IPS it has (REPS).",
    redPublicaOff: "Public health network layer (ESE) by municipality.",
  },
} as const;

/** Color del acento de la red pública (verde, distinto al teal de IPS). */
const COLOR_RED_PUBLICA = "#15803d";

export function AtlasLeyenda({
  metrica,
  onMetrica,
  mostrarIps,
  onToggleIps,
  mostrarRedPublica,
  onToggleRedPublica,
}: AtlasLeyendaProps) {
  const t = useT("atlas");
  const { lang } = useLang();
  const c = COPIA[lang];
  const cortes = umbralesLeyenda(metrica);
  const sufijo = METRICAS[metrica].sufijo;

  return (
    <div className="surface-card flex flex-col gap-3 p-3">
      {/* Selector de métrica: chips claros con estado activo de marca. */}
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
                  ? "h-8 border border-primary bg-primary px-2.5 text-xs font-medium text-primary-foreground hover:bg-[var(--primary-hover)]"
                  : "h-8 border border-border bg-secondary px-2.5 text-xs text-muted-foreground hover:border-primary/40 hover:bg-accent hover:text-foreground"
              }
            >
              {t(`metrics.${m}.label`)}
            </Button>
          );
        })}
      </div>

      <div>
        <p className="mb-1.5 text-[11px] font-medium text-muted-foreground">
          {t(`metrics.${metrica}.description`)}
        </p>
        {/* Rampa teal→rojo, con borde para legibilidad sobre fondo blanco. */}
        <div className="flex h-3 overflow-hidden rounded-full ring-1 ring-foreground/15">
          {RAMPA.map((c) => (
            <div key={c} className="flex-1" style={{ backgroundColor: c }} />
          ))}
        </div>
        <div className="mt-1.5 flex justify-between font-mono tabular-nums text-[10px] text-muted-foreground">
          <span className="text-[#0f6b6d]">{t("legend.lower")}</span>
          {cortes.map((c, i) => (
            <span key={i}>
              {fmt(c)}
              {sufijo}
            </span>
          ))}
          <span className="text-brand">{t("legend.higher")}</span>
        </div>
      </div>

      {/* Toggle de la capa de puntos de IPS por municipio (teal). */}
      <div className="border-t border-border pt-2.5">
        <LayerToggle
          activo={mostrarIps}
          onToggle={() => onToggleIps(!mostrarIps)}
          color="#0f6b6d"
          etiqueta={t("legend.toggleIps")}
          descripcion={mostrarIps ? t("legend.ipsOn") : t("legend.ipsOff")}
        />
      </div>

      {/* Toggle de la capa de red PÚBLICA (ESE) por municipio (verde). */}
      <div className="border-t border-border pt-2.5">
        <LayerToggle
          activo={mostrarRedPublica}
          onToggle={() => onToggleRedPublica(!mostrarRedPublica)}
          color={COLOR_RED_PUBLICA}
          etiqueta={c.redPublica}
          descripcion={mostrarRedPublica ? c.redPublicaOn : c.redPublicaOff}
        />
      </div>

      <p className="text-[10px] leading-tight text-muted-foreground">
        {t("legend.source")}
      </p>
    </div>
  );
}

/** Switch de capa reutilizable (claro AAA). El `color` es el acento de la capa. */
function LayerToggle({
  activo,
  onToggle,
  color,
  etiqueta,
  descripcion,
}: {
  activo: boolean;
  onToggle: () => void;
  color: string;
  etiqueta: string;
  descripcion: string;
}) {
  return (
    <>
      <button
        type="button"
        role="switch"
        aria-checked={activo}
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-2 text-left"
      >
        <span className="flex items-center gap-2">
          <span
            aria-hidden
            className="size-2.5 rounded-full border"
            style={
              activo
                ? { backgroundColor: color, borderColor: color }
                : { backgroundColor: "transparent", borderColor: "var(--border)" }
            }
          />
          <span
            className={
              activo
                ? "text-xs font-medium text-foreground"
                : "text-xs font-medium text-muted-foreground"
            }
          >
            {etiqueta}
          </span>
        </span>
        {/* Track del switch. */}
        <span
          className="relative h-4 w-7 rounded-full transition-colors"
          style={{
            backgroundColor: activo ? color : "var(--input)",
          }}
        >
          <span
            className={
              activo
                ? "absolute top-0.5 left-0.5 size-3 translate-x-3 rounded-full bg-white transition-transform"
                : "absolute top-0.5 left-0.5 size-3 rounded-full bg-white shadow-sm transition-transform"
            }
          />
        </span>
      </button>
      <p className="mt-1.5 text-[10px] leading-tight text-muted-foreground">
        {descripcion}
      </p>
    </>
  );
}

export default AtlasLeyenda;
