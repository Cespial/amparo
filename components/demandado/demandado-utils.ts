// components/demandado/demandado-utils.ts
// Utilidades compartidas de la vista del demandado (EPS).

import type { Caso, Urgencia } from "@/lib/types";

/** Estimación de días de despacho judicial que se ahorran al ceder sin tutela. */
export const DIAS_JUEZ_POR_CASO = 12;

/** Etiquetas y tono visual por nivel de urgencia. */
export const URGENCIA_META: Record<
  Urgencia,
  { etiqueta: string; clase: string }
> = {
  vital: { etiqueta: "Vital", clase: "bg-danger/10 text-danger" },
  alta: { etiqueta: "Alta", clase: "bg-warning/15 text-warning" },
  media: { etiqueta: "Media", clase: "bg-info/10 text-info" },
  baja: { etiqueta: "Baja", clase: "bg-muted text-muted-foreground" },
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

/** Nivel de riesgo para la EPS derivado de la probabilidad de amparo. */
export function nivelRiesgoEPS(prob: number): {
  nivel: "alto" | "medio" | "bajo";
  etiqueta: string;
  recomendacion: "ceder" | "evaluar" | "sostener";
  clase: string;
} {
  if (prob >= 75) {
    return {
      nivel: "alto",
      etiqueta: "Riesgo alto de perder en tutela",
      recomendacion: "ceder",
      clase: "text-danger",
    };
  }
  if (prob >= 55) {
    return {
      nivel: "medio",
      etiqueta: "Riesgo medio — evaluar costo/beneficio",
      recomendacion: "evaluar",
      clase: "text-warning",
    };
  }
  return {
    nivel: "bajo",
    etiqueta: "Riesgo bajo — posición sostenible",
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

/** Costo procesal/reputacional cualitativo de mantener la negación. */
export function costoDeNegar(caso: Caso, prob: number): {
  resumen: string;
  riesgos: string[];
} {
  const riesgos: string[] = [];
  riesgos.push(
    `Probabilidad ${prob}% de fallo en contra dentro de 10 días hábiles (art. 86 C.P.).`,
  );
  if (caso.demandante.sujetoEspecialProteccion) {
    riesgos.push(
      "Accionante es sujeto de especial protección constitucional: el juez aplica un estándar más estricto.",
    );
  }
  if (caso.urgencia === "vital" || caso.urgencia === "alta") {
    riesgos.push(
      "Urgencia clínica alta: alto riesgo de fallo de tutela y eventual medida provisional inmediata.",
    );
  }
  riesgos.push(
    "Si se incumple el fallo: incidente de desacato (arresto hasta 6 meses y multa) contra el representante legal.",
  );
  riesgos.push(
    "Costos de defensa judicial, recobro tardío ante ADRES y desgaste reputacional ante la Supersalud.",
  );
  const resumen =
    prob >= 75
      ? "El análisis costo/riesgo recomienda CEDER y autorizar: negar casi con certeza deriva en tutela perdida, fallo en 10 días y exposición a desacato."
      : prob >= 55
        ? "Caso fronterizo: ceder evita litigio, pero hay margen para sostener con sustento clínico. Evalúe caso a caso."
        : "Posición administrativamente sostenible; documente la negación con soporte técnico-científico.";
  return { resumen, riesgos };
}
