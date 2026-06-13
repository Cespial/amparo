// components/juez/juez-utils.ts — Utilidades de presentación de la vista /juez.
// Sólo helpers puros (sin red, sin estado). Prefijo "juez" para no chocar.

import type { Caso, EstadoCaso, Urgencia, PlazoLegal } from "@/lib/types";

/** Peso de urgencia para ordenar la cola de despacho. */
export const PESO_URGENCIA: Record<Urgencia, number> = {
  vital: 4,
  alta: 3,
  media: 2,
  baja: 1,
};

/**
 * Las etiquetas legibles de urgencia se resuelven vía i18n en los componentes
 * (useT("juez")("urgency.<nivel>")); este módulo solo mantiene pesos y helpers
 * de presentación libres de idioma.
 */

/** Estados que pertenecen a la cola del despacho judicial. */
export const ESTADOS_DESPACHO: EstadoCaso[] = ["ESCALADO_TUTELA", "EN_DESPACHO"];

/**
 * Prioridad de un caso = urgencia × probabilidad de amparo.
 * Si no hay predicción persistida, se usa una heurística (PBS + sujeto especial).
 */
export function prioridadCaso(caso: Caso): number {
  const u = PESO_URGENCIA[caso.urgencia] ?? 1;
  const p =
    caso.prediccion?.probabilidadFavorable ??
    estimacionRapida(caso); // 0-1
  return u * p;
}

/** Heurística de probabilidad cuando aún no se corrió la predicción IA. */
export function estimacionRapida(caso: Caso): number {
  let base = 0.55;
  if (caso.demandante.sujetoEspecialProteccion) base += 0.15;
  if (caso.urgencia === "vital") base += 0.12;
  else if (caso.urgencia === "alta") base += 0.07;
  if (caso.esPBS) base += 0.08;
  return Math.min(0.96, base);
}

/** Probabilidad mostrable (0-100), de predicción o heurística. */
export function probabilidadPct(caso: Caso): number {
  const p = caso.prediccion?.probabilidadFavorable ?? estimacionRapida(caso);
  return Math.round(p * 100);
}

/** Días naturales restantes hasta una fecha límite ISO (negativo = vencido). */
export function diasRestantes(fechaLimiteISO: string, ahora = new Date()): number {
  const limite = new Date(fechaLimiteISO);
  const ms = limite.getTime() - ahora.getTime();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

/** Estado semafórico de un plazo. */
export type SemaforoPlazo = "vencido" | "critico" | "proximo" | "ok";

export function semaforoPlazo(dias: number): SemaforoPlazo {
  if (dias < 0) return "vencido";
  if (dias <= 2) return "critico";
  if (dias <= 5) return "proximo";
  return "ok";
}

/**
 * Plazo de fallo de primera instancia (hito clave para el juez).
 * Devuelve undefined si no está en el cronograma.
 */
export function plazoFallo(caso: Caso): PlazoLegal | undefined {
  return (
    caso.cronograma.find((p) => p.hito === "fallo_primera_instancia") ??
    caso.cronograma[0]
  );
}

/**
 * Locale BCP-47 para formateo de fechas según el idioma activo de la UI.
 * Conserva la convención colombiana (orden día-mes-año) pero usa nombres de
 * mes y conectores en inglés cuando la UI está en EN.
 */
type Lang = "es" | "en";
function localeFecha(lang: Lang): string {
  return lang === "en" ? "en-CO" : "es-CO";
}

// Formatters cacheados por locale (Intl.DateTimeFormat es costoso de construir).
const FMT_CORTA: Record<Lang, Intl.DateTimeFormat> = {
  es: new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }),
  en: new Intl.DateTimeFormat("en-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }),
};

/** Formatea fecha ISO en formato corto, localizado según el idioma activo. */
export function fechaCorta(iso: string, lang: Lang = "es"): string {
  try {
    return FMT_CORTA[lang].format(new Date(iso));
  } catch {
    return iso;
  }
}

const FMT_LARGA: Record<Lang, Intl.DateTimeFormat> = {
  es: new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }),
  en: new Intl.DateTimeFormat("en-CO", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }),
};

/** Formatea fecha ISO en formato largo (con hora), localizado por idioma. */
export function fechaLarga(iso: string, lang: Lang = "es"): string {
  try {
    return FMT_LARGA[lang].format(new Date(iso));
  } catch {
    return iso;
  }
}
