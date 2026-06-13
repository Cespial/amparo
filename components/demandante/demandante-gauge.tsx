"use client";

import { useEffect, useState } from "react";

/**
 * Medidor semicircular de probabilidad (0-100). SVG puro, animado, accesible.
 * Color según el nivel (rojo/ámbar/verde) para lectura intuitiva.
 */
export function DemandanteGauge({ valor }: { valor: number }) {
  const v = Math.max(0, Math.min(100, Math.round(valor)));
  const [animado, setAnimado] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setAnimado(v), 80);
    return () => clearTimeout(t);
  }, [v]);

  // Geometría del semicírculo.
  const r = 80;
  const cx = 100;
  const cy = 100;
  const circ = Math.PI * r; // longitud del semicírculo
  const offset = circ * (1 - animado / 100);

  const color =
    v >= 75 ? "var(--success)" : v >= 50 ? "var(--warning)" : "var(--danger)";
  const etiqueta =
    v >= 75 ? "Probabilidad alta" : v >= 50 ? "Probabilidad media" : "Probabilidad baja";

  return (
    <div
      className="flex flex-col items-center"
      role="img"
      aria-label={`Probabilidad estimada de fallo a favor: ${v} por ciento. ${etiqueta}.`}
    >
      <svg viewBox="0 0 200 116" className="w-full max-w-[280px]">
        {/* Arco de fondo */}
        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none"
          stroke="var(--muted)"
          strokeWidth="16"
          strokeLinecap="round"
        />
        {/* Arco de valor */}
        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none"
          stroke={color}
          strokeWidth="16"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 900ms cubic-bezier(0.22,1,0.36,1)" }}
        />
        <text
          x={cx}
          y={cy - 8}
          textAnchor="middle"
          className="fill-navy font-serif"
          style={{ fontSize: "38px", fontWeight: 700 }}
        >
          {animado}%
        </text>
      </svg>
      <span
        className="mt-1 text-sm font-semibold"
        style={{ color }}
      >
        {etiqueta}
      </span>
    </div>
  );
}
