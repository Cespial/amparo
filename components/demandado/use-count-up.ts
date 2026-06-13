"use client";

// components/demandado/use-count-up.ts — Hook LOCAL de la vista del demandado.
// Anima un entero 0 → valor cuando el elemento entra en viewport. Pensado para
// las métricas del panel de impacto (días-juez ahorrados, casos resueltos): el
// número "sube" cada vez que cambia el objetivo, reforzando la descongestión.
//
// NOTA: es un hook local a propósito (la landing tiene el suyo, parametrizado a
// cifras formateadas; aquí trabajamos con números enteros simples). No se
// comparte módulo entre frentes.
//
// - Respeta prefers-reduced-motion: muestra el valor final sin animar.
// - SSR-safe: no toca window/IntersectionObserver durante el render.
// - Re-anima cuando `value` cambia (p. ej. al resolver un caso nuevo).

import { useEffect, useRef, useState } from "react";

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
 * Anima un entero hacia `value` cuando el nodo entra en viewport, y re-anima
 * desde el valor previo cada vez que `value` cambia. Devuelve `{ ref, display }`:
 * ata `ref` al contenedor y pinta `display`.
 */
export function useCountUp(
  value: number,
  { durationMs = 900, delayMs = 0 }: UseCountUpOptions = {},
) {
  const ref = useRef<HTMLElement | null>(null);
  const [display, setDisplay] = useState<number>(value);
  // Punto de partida de la animación (valor previo) y si ya entró en viewport.
  const fromRef = useRef<number>(0);
  const seenRef = useRef(false);

  useEffect(() => {
    const node = ref.current;

    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    // Sin soporte o con reduced-motion: salta al valor final.
    if (!node || reduced || typeof IntersectionObserver === "undefined") {
      setDisplay(value);
      fromRef.current = value;
      return;
    }

    let raf = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const animate = () => {
      const from = fromRef.current;
      const delta = value - from;
      if (delta === 0) {
        setDisplay(value);
        return;
      }
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / durationMs);
        const eased = easeOutCubic(t);
        setDisplay(Math.round(from + delta * eased));
        if (t < 1) {
          raf = requestAnimationFrame(tick);
        } else {
          setDisplay(value); // exactitud final
          fromRef.current = value;
        }
      };
      raf = requestAnimationFrame(tick);
    };

    // Primera vez: espera a que el panel sea visible antes de contar.
    if (!seenRef.current) {
      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              seenRef.current = true;
              observer.disconnect();
              timer = setTimeout(animate, delayMs);
            }
          }
        },
        { threshold: 0.3 },
      );
      observer.observe(node);
      return () => {
        observer.disconnect();
        if (raf) cancelAnimationFrame(raf);
        if (timer) clearTimeout(timer);
      };
    }

    // Cambios posteriores (ya visible): re-anima desde el valor previo.
    timer = setTimeout(animate, delayMs);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      if (timer) clearTimeout(timer);
    };
  }, [value, durationMs, delayMs]);

  return { ref, display };
}
