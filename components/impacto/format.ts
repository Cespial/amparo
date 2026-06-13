// components/impacto/format.ts — Formateo numérico local de la vista /impacto.
// Sin dependencias nuevas: usa Intl nativo. Locale derivado del idioma activo.

import type { Lang } from "@/lib/i18n";

function locale(lang: Lang): string {
  return lang === "es" ? "es-CO" : "en-US";
}

/** Entero con separadores de miles del locale. */
export function fmtInt(value: number, lang: Lang): string {
  return new Intl.NumberFormat(locale(lang), {
    maximumFractionDigits: 0,
  }).format(Math.round(value));
}

/** COP compactado a millones/miles de millones, legible en una cifra grande. */
export function fmtCop(value: number, lang: Lang): string {
  const abs = Math.abs(value);
  const nf = (n: number, d: number) =>
    new Intl.NumberFormat(locale(lang), {
      minimumFractionDigits: 0,
      maximumFractionDigits: d,
    }).format(n);

  if (abs >= 1_000_000_000_000) {
    // billones (millones de millones)
    const unit = lang === "es" ? " bill." : "T";
    return `$${nf(value / 1_000_000_000_000, 2)}${lang === "es" ? unit : unit} COP`;
  }
  if (abs >= 1_000_000_000) {
    const unit = lang === "es" ? " mil M" : "B";
    return `$${nf(value / 1_000_000_000, 2)}${unit} COP`;
  }
  if (abs >= 1_000_000) {
    const unit = lang === "es" ? " M" : "M";
    return `$${nf(value / 1_000_000, 1)}${unit} COP`;
  }
  return `$${nf(value, 0)} COP`;
}

/** COP exacto con separadores (para cajas de supuestos). */
export function fmtCopExact(value: number, lang: Lang): string {
  return `$${new Intl.NumberFormat(locale(lang), {
    maximumFractionDigits: 0,
  }).format(Math.round(value))} COP`;
}
