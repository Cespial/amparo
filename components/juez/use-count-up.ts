"use client";

// components/juez/use-count-up.ts — Hook LOCAL del despacho del juez.
// Anima un número 0 → valor cuando el elemento entra en viewport, para las
// cifras de descongestión (porcentaje + contadores de casos).
//
// NOTA: es un hook local de components/juez/ a propósito. La landing tiene su
// propio useCountUp (components/landing/use-count-up.ts), pensado para cifras
// FORMATEADAS como string ("197.737"); este trabaja sobre NÚMEROS planos y no
// comparte módulo con aquel.
//
// - Respeta prefers-reduced-motion: muestra el valor final sin animar.
// - SSR-safe: no toca window/IntersectionObserver durante el render.
// - Cuenta una sola vez (al primer cruce del viewport); si el valor cambia
//   después, vuelve a animar desde el valor anterior hacia el nuevo.

import { useEffect, useRef, useState } from "react";

interface UseCountUpOptions {
  /** Duración de la animación en ms. */
  durationMs?: number;
  /** Retraso antes de arrancar, para escalonar varias cifras. */
  delayMs?: number;
  /** Decimales a conservar en el valor pintado. Default 0 (enteros). */
  decimals?: number;
}

/** Easing suave (easeOutCubic) para que el conteo desacelere al final. */
function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

/** Redondea a `decimals` posiciones sin arrastrar errores de coma flotante. */
function round(value: number, decimals: number): number {
  const f = 10 ** decimals;
  return Math.round(value * f) / f;
}

/**
 * Anima un número al entrar en viewport.
 * Devuelve `{ ref, value }`: ata `ref` al nodo contenedor y pinta `value`.
 *
 * @example
 *   const { ref, value } = useCountUp(pct);
 *   <p ref={ref}>{value}%</p>
 */
export function useCountUp<T extends HTMLElement = HTMLElement>(
  target: number,
  { durationMs = 1200, delayMs = 0, decimals = 0 }: UseCountUpOptions = {},
) {
  const ref = useRef<T | null>(null);
  const [value, setValue] = useState<number>(target);
  // Punto de partida de cada animación (último valor mostrado).
  const fromRef = useRef<number>(0);
  const startedRef = useRef(false);

  useEffect(() => {
    const node = ref.current;

    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    // Sin nodo, sin soporte o con reduced-motion: salta directo al valor final.
    if (
      !node ||
      reduced ||
      typeof IntersectionObserver === "undefined" ||
      typeof performance === "undefined"
    ) {
      setValue(target);
      fromRef.current = target;
      return;
    }

    let raf = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const animate = () => {
      const from = fromRef.current;
      const delta = target - from;
      if (delta === 0) {
        setValue(target);
        return;
      }
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / durationMs);
        const eased = easeOutCubic(t);
        const current = round(from + delta * eased, decimals);
        setValue(current);
        if (t < 1) {
          raf = requestAnimationFrame(tick);
        } else {
          setValue(target); // exactitud final
          fromRef.current = target;
        }
      };
      raf = requestAnimationFrame(tick);
    };

    if (startedRef.current) {
      // Ya cruzó el viewport antes: anima el cambio de valor en el acto.
      timer = setTimeout(animate, delayMs);
      return () => {
        if (raf) cancelAnimationFrame(raf);
        if (timer) clearTimeout(timer);
      };
    }

    // Primer montaje: arranca en 0 y espera al cruce del viewport.
    fromRef.current = 0;
    setValue(0);

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !startedRef.current) {
            startedRef.current = true;
            timer = setTimeout(animate, delayMs);
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
  }, [target, durationMs, delayMs, decimals]);

  return { ref, value };
}
