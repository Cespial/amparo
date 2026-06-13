"use client";

// components/landing/use-count-up.ts — Hook LOCAL de la landing (presentación).
// Anima una cifra 0 → valor cuando el elemento entra en viewport, conservando
// el formato original ("197.737", "80%", "57%"): separador de miles y sufijo.
//
// NOTA: es un hook local de components/landing/ a propósito (otra frente está
// creando otro useCountUp en su propia carpeta; no compartimos módulo).
//
// - Si la cifra NO es numérica ("minutos", "meses"), se renderiza tal cual.
// - Respeta prefers-reduced-motion: muestra el valor final sin animar.
// - SSR-safe: sin acceso a window/IntersectionObserver durante el render.

import { useEffect, useRef, useState } from "react";

/** Resultado del parseo de una cifra formateada. */
interface ParsedFigure {
  /** Valor objetivo (entero). NaN si la cifra no es numérica. */
  target: number;
  /** Separador de miles detectado ("." | "," | ""). */
  groupSep: string;
  /** Prefijo no numérico (p. ej. "$"). */
  prefix: string;
  /** Sufijo no numérico (p. ej. "%"). */
  suffix: string;
  /** ¿La cifra es numérica y, por tanto, animable? */
  numeric: boolean;
}

/** Descompone "197.737", "80%", "$1,2M" en valor + adornos de formato. */
function parseFigure(raw: string): ParsedFigure {
  const match = raw.match(/^(\D*?)([\d.,\s]+)(\D*)$/);
  if (!match) {
    return { target: NaN, groupSep: "", prefix: "", suffix: raw, numeric: false };
  }
  const [, prefix, digits, suffix] = match;
  // Detecta el separador de miles: último de "." o "," que agrupa de a 3.
  const groupSep = /\d[.,]\d{3}(\D|$)/.test(raw)
    ? raw.includes(".")
      ? "."
      : ","
    : "";
  const numericStr = digits.replace(/[.,\s]/g, "");
  const target = Number.parseInt(numericStr, 10);
  return {
    target,
    groupSep,
    prefix: prefix.trim(),
    suffix: suffix.trim(),
    numeric: Number.isFinite(target),
  };
}

/** Reaplica separador de miles y adornos al valor animado en curso. */
function formatValue(value: number, p: ParsedFigure): string {
  const intStr = Math.round(value).toString();
  const grouped = p.groupSep
    ? intStr.replace(/\B(?=(\d{3})+(?!\d))/g, p.groupSep)
    : intStr;
  return `${p.prefix}${grouped}${p.suffix}`;
}

/** Easing suave (easeOutCubic) para que el conteo desacelere al final. */
function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

interface UseCountUpOptions {
  /** Duración de la animación en ms. */
  durationMs?: number;
  /** Retraso antes de arrancar, para escalonar varias cifras. */
  delayMs?: number;
}

/**
 * Anima una cifra formateada al entrar en viewport.
 * Devuelve `{ ref, display }`: ata `ref` al nodo y pinta `display`.
 */
export function useCountUp(
  figure: string,
  { durationMs = 1500, delayMs = 0 }: UseCountUpOptions = {},
) {
  const ref = useRef<HTMLElement | null>(null);
  const parsed = useRef<ParsedFigure>(parseFigure(figure));
  // Re-parsea si cambia la cifra (cambio de idioma: "197.737" ↔ "197,737").
  parsed.current = parseFigure(figure);

  const [display, setDisplay] = useState<string>(figure);
  const startedRef = useRef(false);

  useEffect(() => {
    const node = ref.current;
    const p = parsed.current;

    // No animable o sin soporte: muestra el valor final tal cual.
    if (!node || !p.numeric) {
      setDisplay(figure);
      return;
    }

    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    if (reduced || typeof IntersectionObserver === "undefined") {
      setDisplay(figure);
      return;
    }

    let raf = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const run = () => {
      const start = performance.now();
      const tick = (now: number) => {
        const elapsed = now - start;
        const t = Math.min(1, elapsed / durationMs);
        const eased = easeOutCubic(t);
        setDisplay(formatValue(p.target * eased, p));
        if (t < 1) {
          raf = requestAnimationFrame(tick);
        } else {
          setDisplay(figure); // exactitud final (evita errores de redondeo)
        }
      };
      raf = requestAnimationFrame(tick);
    };

    // Arranca en 0 para que la animación se note desde el inicio.
    setDisplay(formatValue(0, p));

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !startedRef.current) {
            startedRef.current = true;
            timer = setTimeout(run, delayMs);
            observer.disconnect();
          }
        }
      },
      { threshold: 0.35 },
    );
    observer.observe(node);

    return () => {
      observer.disconnect();
      if (raf) cancelAnimationFrame(raf);
      if (timer) clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [figure, durationMs, delayMs]);

  return { ref, display };
}
