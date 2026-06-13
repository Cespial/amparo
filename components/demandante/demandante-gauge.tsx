"use client";

import { useEffect, useRef, useState } from "react";
import { useT } from "@/lib/i18n";

/** Easing suave (easeOutCubic): el conteo desacelera al acercarse al valor. */
function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

/**
 * Medidor semicircular de probabilidad (0-100). SVG puro, accesible.
 *
 * Al montarse (cuando el pronóstico se revela) CUENTA 0 → valor: el número y el
 * arco animan en sincronía con una sola animación por `requestAnimationFrame`,
 * de modo que el porcentaje impreso y el llenado del arco nunca se desfasan.
 * Color según el nivel (rojo/ámbar/verde) para lectura intuitiva.
 *
 * Respeta `prefers-reduced-motion`: si el usuario lo pide, pinta el valor final
 * de inmediato, sin conteo ni transición.
 */
export function DemandanteGauge({ valor }: { valor: number }) {
  const t = useT("demandante");
  const v = Math.max(0, Math.min(100, Math.round(valor)));
  // Valor animado en curso (0 → v). Se usa para el número Y el arco a la vez.
  const [animado, setAnimado] = useState(0);
  const rafRef = useRef(0);

  useEffect(() => {
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    // Sin animación: muestra el valor final de inmediato.
    if (reduced || typeof requestAnimationFrame === "undefined" || v === 0) {
      setAnimado(v);
      return;
    }

    setAnimado(0);
    const duracion = 1100; // ms — suficiente para notar el conteo, sin demorar.
    const inicio = performance.now();

    const tick = (now: number) => {
      const t = Math.min(1, (now - inicio) / duracion);
      const eased = easeOutCubic(t);
      setAnimado(Math.round(v * eased));
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setAnimado(v); // exactitud final (evita errores de redondeo)
      }
    };
    // Pequeño retraso para que el arranque desde 0 sea perceptible al revelar.
    const id = setTimeout(() => {
      rafRef.current = requestAnimationFrame(tick);
    }, 80);

    return () => {
      clearTimeout(id);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [v]);

  // Geometría del semicírculo.
  const r = 80;
  const cx = 100;
  const cy = 100;
  const circ = Math.PI * r; // longitud del semicírculo
  const offset = circ * (1 - animado / 100);

  // El color del nivel se fija con el valor objetivo (no parpadea durante el conteo).
  const color =
    v >= 75 ? "var(--success)" : v >= 50 ? "var(--warning)" : "var(--danger)";
  const etiqueta =
    v >= 75 ? t("gauge.alta") : v >= 50 ? t("gauge.media") : t("gauge.baja");

  return (
    <div
      className="flex flex-col items-center"
      role="img"
      aria-label={t("gauge.aria", { v, etiqueta })}
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
        {/* Arco de valor — el offset sigue al mismo `animado` que el número. */}
        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none"
          stroke={color}
          strokeWidth="16"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
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
      <span className="mt-1 text-sm font-semibold" style={{ color }}>
        {etiqueta}
      </span>
    </div>
  );
}
