"use client";

// components/impacto/charts.tsx — Gráficos propios en SVG/CSS (sin librerías).
// Dos piezas: BeforeAfterBars (carga del despacho antes/después) y BusinessDonut
// (reparto del modelo de negocio). Animación sutil vía transición de atributos,
// respetando prefers-reduced-motion (las transiciones CSS se anulan solas si el
// usuario lo pide; aquí usamos transición en width/stroke que es discreta).

import { useId } from "react";

/* ──────────────────────────────────────────────────────────────────────────
   Barras antes/después: dos barras horizontales comparando cuántas tutelas
   llegan al despacho. La barra "después" se anima al cambiar el slider.
   ────────────────────────────────────────────────────────────────────────── */
export interface BeforeAfterBarsProps {
  /** Total de tutelas (barra "antes" = 100%). */
  total: number;
  /** Tutelas que aún llegan al juez (barra "después"). */
  after: number;
  beforeLabel: string;
  afterLabel: string;
  beforeNote: string;
  afterNote: string;
  axisLabel: string;
}

export function BeforeAfterBars({
  total,
  after,
  beforeLabel,
  afterLabel,
  beforeNote,
  afterNote,
  axisLabel,
}: BeforeAfterBarsProps) {
  const safeTotal = Math.max(1, total);
  const afterPct = Math.max(0, Math.min(100, (after / safeTotal) * 100));

  return (
    <div>
      <div className="grid gap-4">
        <BarRow
          label={beforeLabel}
          note={beforeNote}
          pct={100}
          tone="navy"
        />
        <BarRow label={afterLabel} note={afterNote} pct={afterPct} tone="brand" />
      </div>
      <p className="mt-3 text-xs text-muted-foreground">{axisLabel}</p>
    </div>
  );
}

function BarRow({
  label,
  note,
  pct,
  tone,
}: {
  label: string;
  note: string;
  pct: number;
  tone: "navy" | "brand";
}) {
  const fill = tone === "navy" ? "var(--navy)" : "var(--primary)";
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-2">
        <span className="text-sm font-semibold text-navy">{label}</span>
        <span className="text-xs font-medium text-muted-foreground">{note}</span>
      </div>
      <div
        className="relative h-9 w-full overflow-hidden rounded-lg bg-secondary"
        role="img"
        aria-label={`${label}: ${note}`}
      >
        <div
          className="absolute inset-y-0 left-0 rounded-lg"
          style={{
            width: `${pct}%`,
            background: fill,
            transition:
              "width 600ms cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        />
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   Dona del modelo de negocio: tres segmentos (B2G/B2B/B2C) en un anillo SVG.
   stroke-dasharray reparte la circunferencia; transición sutil al montar.
   ────────────────────────────────────────────────────────────────────────── */
export interface BusinessDonutSegment {
  key: string;
  label: string;
  value: number;
  color: string;
}

export interface BusinessDonutProps {
  segments: BusinessDonutSegment[];
  centerTop: string;
  centerBottom: string;
  ariaLabel: string;
}

export function BusinessDonut({
  segments,
  centerTop,
  centerBottom,
  ariaLabel,
}: BusinessDonutProps) {
  const titleId = useId();
  const size = 200;
  const stroke = 26;
  const r = (size - stroke) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  const total = segments.reduce((s, seg) => s + seg.value, 0) || 1;

  // Offset acumulado por segmento, calculado sin mutar variables capturadas
  // (evita el aviso de inmutabilidad del React Compiler): cada arco arranca
  // donde termina la suma de los anteriores.
  const arcs = segments.map((seg, idx) => {
    const dash = (seg.value / total) * circumference;
    const gap = circumference - dash;
    const priorDash =
      segments
        .slice(0, idx)
        .reduce((acc, prev) => acc + prev.value, 0) /
        total *
      circumference;
    return {
      ...seg,
      dasharray: `${dash} ${gap}`,
      dashoffset: -priorDash,
    };
  });

  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center sm:gap-7">
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="h-44 w-44 shrink-0"
        role="img"
        aria-labelledby={titleId}
      >
        <title id={titleId}>{ariaLabel}</title>
        {/* Pista de fondo */}
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="var(--secondary)"
          strokeWidth={stroke}
        />
        {arcs.map((a, idx) => (
          <circle
            key={a.key}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={a.color}
            strokeWidth={stroke}
            strokeDasharray={a.dasharray}
            strokeDashoffset={a.dashoffset}
            strokeLinecap="butt"
            transform={`rotate(-90 ${cx} ${cy})`}
            style={{
              transition: "stroke-dasharray 700ms ease-out",
              transitionDelay: `${idx * 90}ms`,
            }}
          />
        ))}
        {/* Centro */}
        <text
          x={cx}
          y={cy - 4}
          textAnchor="middle"
          className="fill-navy"
          style={{ fontSize: 20, fontWeight: 700 }}
        >
          {centerTop}
        </text>
        <text
          x={cx}
          y={cy + 16}
          textAnchor="middle"
          className="fill-muted-foreground"
          style={{ fontSize: 9, letterSpacing: 1 }}
        >
          {centerBottom}
        </text>
      </svg>
      <ul className="grid gap-2.5">
        {segments.map((seg) => (
          <li key={seg.key} className="flex items-center gap-2.5">
            <span
              className="size-3 shrink-0 rounded-full"
              style={{ background: seg.color }}
              aria-hidden
            />
            <span className="text-sm font-medium text-foreground">
              {seg.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
