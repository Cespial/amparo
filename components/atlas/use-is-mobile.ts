"use client";

// components/atlas/use-is-mobile.ts
// Hook SSR-safe que indica si el viewport está por debajo del breakpoint `lg`
// (1024px de Tailwind). Se usa para abrir el Sheet de detalle SÓLO en móvil:
// en desktop el panel lateral derecho ya muestra el detalle, y el overlay del
// Sheet (fixed inset-0 con backdrop-blur) taparía la página con un velo borroso.

import { useEffect, useState } from "react";

/** Breakpoint `lg` de Tailwind: < 1024px se considera móvil/tablet. */
const QUERY = "(max-width: 1023.98px)";

/**
 * Devuelve `true` cuando el viewport es menor que el breakpoint `lg`.
 * En SSR / primer render devuelve `false` (evita abrir el Sheet antes de
 * conocer el tamaño real); se corrige en el efecto tras montar en cliente.
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mql = window.matchMedia(QUERY);
    const update = () => setIsMobile(mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, []);

  return isMobile;
}
