// components/demandado/demandado-utils.ts
// Utilidades compartidas de la vista del demandado (EPS).

import type { Caso, Urgencia } from "@/lib/types";

/** Estimación de días de despacho judicial que se ahorran al ceder sin tutela. */
export const DIAS_JUEZ_POR_CASO = 12;

/**
 * Tono visual por nivel de urgencia. La etiqueta legible se resuelve en los
 * componentes con useT("demandado")("urgency.<nivel>") para no acoplar i18n
 * a este módulo puro.
 */
export const URGENCIA_META: Record<Urgencia, { clase: string }> = {
  vital: { clase: "bg-danger/10 text-danger" },
  alta: { clase: "bg-warning/15 text-warning" },
  media: { clase: "bg-info/10 text-info" },
  baja: { clase: "bg-muted text-muted-foreground" },
};

/** Peso de urgencia para ordenar la bandeja (mayor = más arriba). */
const PESO_URGENCIA: Record<Urgencia, number> = {
  vital: 4,
  alta: 3,
  media: 2,
  baja: 1,
};

/**
 * Probabilidad de amparo estimada (0-100) SIN llamar a la IA.
 * Heurística determinista y demo-safe usada para pintar la bandeja al instante.
 * El razonamiento profundo lo aporta el agente-EPS vía /api/predecir.
 */
export function estimarProbabilidadAmparo(caso: Caso): number {
  // Si ya hay predicción persistida, úsala.
  if (caso.prediccion) {
    return Math.round(caso.prediccion.probabilidadFavorable * 100);
  }
  let p = 55;
  if (caso.demandante.sujetoEspecialProteccion) p += 14;
  if (caso.urgencia === "vital") p += 16;
  else if (caso.urgencia === "alta") p += 9;
  else if (caso.urgencia === "media") p += 3;
  // El médico tratante prescribió: salud y vida casi siempre amparan.
  if (caso.derechosInvocados.includes("vida")) p += 6;
  if (caso.derechosInvocados.includes("niñez")) p += 8;
  // Servicios NO-PBS también amparan por jurisprudencia reiterada (T-760).
  if (!caso.esPBS) p += 2;
  const menor = caso.demandante.edad < 18;
  const adultoMayor = caso.demandante.edad >= 60;
  if (menor || adultoMayor) p += 3;
  return Math.max(20, Math.min(96, p));
}

/**
 * Nivel de riesgo para la EPS derivado de la probabilidad de amparo.
 * `etiquetaKey` apunta a la clave i18n del namespace "demandado" (risk.*) que
 * el componente resuelve con useT; este módulo permanece libre de i18n.
 */
export function nivelRiesgoEPS(prob: number): {
  nivel: "alto" | "medio" | "bajo";
  etiquetaKey: "risk.high" | "risk.medium" | "risk.low";
  recomendacion: "ceder" | "evaluar" | "sostener";
  clase: string;
} {
  if (prob >= 75) {
    return {
      nivel: "alto",
      etiquetaKey: "risk.high",
      recomendacion: "ceder",
      clase: "text-danger",
    };
  }
  if (prob >= 55) {
    return {
      nivel: "medio",
      etiquetaKey: "risk.medium",
      recomendacion: "evaluar",
      clase: "text-warning",
    };
  }
  return {
    nivel: "bajo",
    etiquetaKey: "risk.low",
    recomendacion: "sostener",
    clase: "text-success",
  };
}

/** Ordena la bandeja: mayor probabilidad de amparo y urgencia primero. */
export function ordenarBandeja(casos: Caso[]): Caso[] {
  return [...casos].sort((a, b) => {
    const pa = estimarProbabilidadAmparo(a);
    const pb = estimarProbabilidadAmparo(b);
    if (pb !== pa) return pb - pa;
    return PESO_URGENCIA[b.urgencia] - PESO_URGENCIA[a.urgencia];
  });
}

/** Una entrada de riesgo: clave i18n (namespace "demandado", cost.*) + vars. */
export interface RiesgoEntry {
  key: string;
  vars?: Record<string, string | number>;
}

/**
 * Costo procesal/reputacional cualitativo de mantener la negación.
 * Devuelve CLAVES i18n (no texto): el componente las resuelve con
 * useT("demandado") para que este módulo no dependa del idioma.
 */
export function costoDeNegar(
  caso: Caso,
  prob: number,
): {
  resumenKey: "cost.summaryHigh" | "cost.summaryMedium" | "cost.summaryLow";
  riesgos: RiesgoEntry[];
} {
  const riesgos: RiesgoEntry[] = [];
  riesgos.push({ key: "cost.probability", vars: { prob } });
  if (caso.demandante.sujetoEspecialProteccion) {
    riesgos.push({ key: "cost.specialProtection" });
  }
  if (caso.urgencia === "vital" || caso.urgencia === "alta") {
    riesgos.push({ key: "cost.clinicalUrgency" });
  }
  riesgos.push({ key: "cost.contempt" });
  riesgos.push({ key: "cost.defense" });
  const resumenKey =
    prob >= 75
      ? "cost.summaryHigh"
      : prob >= 55
        ? "cost.summaryMedium"
        : "cost.summaryLow";
  return { resumenKey, riesgos };
}
