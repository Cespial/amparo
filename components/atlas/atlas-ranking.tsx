"use client";

// components/atlas/atlas-ranking.tsx
// Panel de RANKING + DISTRIBUCIÓN nacional (chrome CLARO AAA, NO sobre el mapa).
// - TOP-5 departamentos por la métrica activa (clic = seleccionar/fly-to).
// - Mini-histograma SVG propio (sin librerías) de la distribución nacional, con
//   la barra del departamento seleccionado resaltada y su posición en el ranking.

import { useMemo } from "react";
import {
  type MetricaAtlas,
  statsPorCodigo,
  METRICAS,
  fmt,
  RAMPA,
} from "./atlas-data";
import { useLang } from "@/lib/i18n";

const COPIA = {
  es: {
    titulo: "Ranking nacional",
    top: "Top 5",
    distribucion: "Distribución nacional",
    puesto: "Puesto",
    de: "de",
    aqui: "aquí cae el seleccionado",
    seleccionaPista: "Selecciona un departamento para ubicarlo en la distribución.",
    bandaEje: (a: string, b: string) => `${a} – ${b}`,
  },
  en: {
    titulo: "National ranking",
    top: "Top 5",
    distribucion: "National distribution",
    puesto: "Rank",
    de: "of",
    aqui: "lands here",
    seleccionaPista: "Select a department to see where it lands in the distribution.",
    bandaEje: (a: string, b: string) => `${a} – ${b}`,
  },
} as const;

interface AtlasRankingProps {
  metrica: MetricaAtlas;
  seleccionado: string | null;
  onSeleccionar: (codigo: string) => void;
}

/** Nº de cubetas del histograma. */
const NBINS = 12;

export function AtlasRanking({
  metrica,
  seleccionado,
  onSeleccionar,
}: AtlasRankingProps) {
  const { lang } = useLang();
  const c = COPIA[lang];

  const filas = useMemo(
    () =>
      Array.from(statsPorCodigo.values())
        .map((s) => ({ codigo: s.codigo, nombre: s.nombre, valor: s[metrica] }))
        .sort((a, b) => b.valor - a.valor),
    [metrica],
  );

  const top5 = filas.slice(0, 5);
  const maxValor = filas.length ? filas[0].valor : 1;

  // Posición (1-based) del departamento seleccionado en el ranking.
  const idxSel = useMemo(
    () => (seleccionado ? filas.findIndex((f) => f.codigo === seleccionado) : -1),
    [filas, seleccionado],
  );

  // Histograma: cuenta por cubeta + cubeta del seleccionado.
  const histo = useMemo(() => {
    const vals = filas.map((f) => f.valor);
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    const span = max - min || 1;
    const bins = new Array<number>(NBINS).fill(0);
    const cubetaDe = (v: number) =>
      Math.min(NBINS - 1, Math.floor(((v - min) / span) * NBINS));
    for (const v of vals) bins[cubetaDe(v)]++;
    const cubetaSel =
      seleccionado && idxSel >= 0 ? cubetaDe(filas[idxSel].valor) : -1;
    const maxBin = Math.max(...bins, 1);
    return { bins, min, max, span, cubetaSel, maxBin };
  }, [filas, seleccionado, idxSel]);

  const sufijo = METRICAS[metrica].sufijo;
  const colorSel = RAMPA[RAMPA.length - 1];

  return (
    <div className="surface-card flex flex-col gap-3 p-3">
      <div className="flex items-baseline justify-between">
        <h3 className="font-heading text-sm font-semibold text-foreground">
          {c.titulo}
        </h3>
        <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
          {/* Reutiliza la etiqueta de la métrica del diccionario atlas vía atlas-data. */}
          {METRICAS[metrica].etiqueta}
        </span>
      </div>

      {/* TOP-5: barras horizontales clicables. */}
      <ul className="flex flex-col gap-1.5">
        {top5.map((f, i) => {
          const activo = f.codigo === seleccionado;
          const ancho = maxValor ? Math.max(4, (f.valor / maxValor) * 100) : 0;
          return (
            <li key={f.codigo}>
              <button
                type="button"
                onClick={() => onSeleccionar(f.codigo)}
                aria-pressed={activo}
                className={`group flex w-full items-center gap-2 rounded-md px-1.5 py-1 text-left transition-colors ${
                  activo ? "bg-accent" : "hover:bg-accent/60"
                }`}
              >
                <span className="w-4 shrink-0 text-center font-mono text-[11px] font-semibold text-muted-foreground">
                  {i + 1}
                </span>
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="flex items-center justify-between gap-2">
                    <span
                      className={`truncate text-xs ${
                        activo
                          ? "font-semibold text-foreground"
                          : "font-medium text-foreground"
                      }`}
                    >
                      {f.nombre}
                    </span>
                    <span className="shrink-0 font-mono tabular-nums text-[11px] text-muted-foreground">
                      {fmt(f.valor)}
                      {sufijo}
                    </span>
                  </span>
                  <span className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                    <span
                      className="block h-full rounded-full transition-[width] duration-500"
                      style={{
                        width: `${ancho}%`,
                        backgroundColor: activo ? colorSel : "var(--primary)",
                      }}
                    />
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      {/* Distribución nacional: histograma SVG propio. */}
      <div className="border-t border-border pt-2.5">
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-[11px] font-medium text-muted-foreground">
            {c.distribucion}
          </span>
          {idxSel >= 0 && (
            <span className="font-mono tabular-nums text-[11px] font-semibold text-foreground">
              {c.puesto} {idxSel + 1} {c.de} {filas.length}
            </span>
          )}
        </div>

        <Histograma
          bins={histo.bins}
          maxBin={histo.maxBin}
          cubetaSel={histo.cubetaSel}
          colorSel={colorSel}
        />

        <div className="mt-1 flex justify-between font-mono tabular-nums text-[10px] text-muted-foreground">
          <span>{fmt(histo.min)}</span>
          <span>{fmt(histo.max)}</span>
        </div>

        <p className="mt-1.5 text-[10px] leading-tight text-muted-foreground">
          {idxSel >= 0 ? (
            <span>
              <span className="font-medium text-foreground">
                {filas[idxSel]?.nombre}
              </span>{" "}
              · {c.aqui}.
            </span>
          ) : (
            c.seleccionaPista
          )}
        </p>
      </div>
    </div>
  );
}

/** Histograma de barras verticales en SVG (sin librerías). */
function Histograma({
  bins,
  maxBin,
  cubetaSel,
  colorSel,
}: {
  bins: number[];
  maxBin: number;
  cubetaSel: number;
  colorSel: string;
}) {
  const W = 100;
  const H = 34;
  const gap = 1.4;
  const n = bins.length;
  const bw = (W - gap * (n - 1)) / n;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      className="h-9 w-full"
      aria-hidden
    >
      {bins.map((v, i) => {
        const h = maxBin ? (v / maxBin) * (H - 2) : 0;
        const x = i * (bw + gap);
        const sel = i === cubetaSel;
        return (
          <rect
            key={i}
            x={x}
            y={H - h}
            width={bw}
            height={Math.max(h, v > 0 ? 1.5 : 0)}
            rx={0.6}
            fill={sel ? colorSel : "var(--primary)"}
            opacity={sel ? 1 : 0.32}
          />
        );
      })}
    </svg>
  );
}

export default AtlasRanking;
