// lib/ai/triaje.ts — Triaje de admisibilidad de la tutela en salud.
//
// Evalúa, criterio por criterio, la procedencia de la acción de tutela:
// derecho fundamental, legitimación, subsidiariedad, inmediatez, no-temeridad
// y hecho superado (carencia actual de objeto). Emite un veredicto y la ruta.
// Usa el modelo rápido (Haiku) + fundamentos del corpus.

import { z } from "zod";
import { generateObject } from "ai";
import { modeloRapido } from "./client";
import { buscarSentencias } from "../corpus/retrieval";
import type {
  Caso,
  DerechoFundamental,
  SentenciaRef,
  TriajeAdmisibilidad,
} from "../types";
import { conRespaldo, esHeroe, TRIAJE_HEROE } from "./fixtures";

/** Estado de cada criterio de procedibilidad. */
export type EstadoCriterio = "ok" | "reserva" | "falla";

/** Evaluación de un criterio. */
export interface CriterioTriaje {
  estado: EstadoCriterio;
  explicacion: string;
}

/** Veredicto global del triaje. */
export type Veredicto = "admisible" | "admisible_con_reservas" | "inadmisible";

/** Resultado enriquecido del triaje (vista detallada por criterios). */
export interface TriajeResultado {
  veredicto: Veredicto;
  rutaRecomendada: "negociacion_eps" | "tutela";
  confianza: number;
  criterios: {
    derechoFundamental: CriterioTriaje;
    legitimacion: CriterioTriaje;
    subsidiariedad: CriterioTriaje;
    inmediatez: CriterioTriaje;
    noTemeridad: CriterioTriaje;
    hechoSuperado: CriterioTriaje;
  };
  derechosVulnerados: DerechoFundamental[];
  fundamentos: SentenciaRef[];
  recomendacion: string;
  banderas: string[];
}

const DERECHOS = [
  "salud",
  "vida",
  "vida digna",
  "seguridad social",
  "integridad personal",
  "igualdad",
  "petición",
  "mínimo vital",
  "niñez",
] as const satisfies readonly DerechoFundamental[];

// Schema SIMPLE (enums + strings). Confianza como enum textual; se mapea a número.
const criterio = z.object({
  estado: z.enum(["ok", "reserva", "falla"]),
  explicacion: z.string(),
});

const schema = z.object({
  veredicto: z.enum(["admisible", "admisible_con_reservas", "inadmisible"]),
  rutaRecomendada: z.enum(["negociacion_eps", "tutela"]),
  confianza: z
    .enum(["baja", "media", "alta", "muy_alta"])
    .describe("Confianza cualitativa del análisis."),
  derechoFundamental: criterio,
  legitimacion: criterio,
  subsidiariedad: criterio,
  inmediatez: criterio,
  noTemeridad: criterio,
  hechoSuperado: criterio,
  derechosVulnerados: z.array(z.enum(DERECHOS)),
  recomendacion: z.string(),
  banderas: z.array(z.string()).describe("Advertencias o riesgos subsanables."),
});

const CONFIANZA_MAP: Record<string, number> = {
  baja: 0.45,
  media: 0.65,
  alta: 0.82,
  muy_alta: 0.93,
};

const SYSTEM = `Eres un asesor jurídico experto en acción de tutela en salud en Colombia (art. 86 C.P., Decreto 2591 de 1991, línea jurisprudencial de la Corte Constitucional).
Evalúas la ADMISIBILIDAD de un caso criterio por criterio:
- derechoFundamental: ¿se afecta un derecho fundamental (salud autónomo, vida, vida digna, etc.)?
- legitimacion: ¿el accionante es titular o actúa válidamente (agencia oficiosa, representación de menor)?
- subsidiariedad: ¿no hay otro medio idóneo, o existe perjuicio irremediable, o es sujeto de especial protección?
- inmediatez: ¿la vulneración es actual o reciente?
- noTemeridad: ¿no consta otra tutela por los mismos hechos y pretensiones?
- hechoSuperado: ¿persiste la vulneración (sin carencia actual de objeto)? estado "ok" = SÍ persiste.
Para cada criterio asigna estado: "ok" (se satisface), "reserva" (dudoso/subsanable) o "falla" (no se cumple), con una explicación breve y jurídica.
GUARDA DE PROCEDENCIA: la tutela en salud ampara el acceso a SERVICIOS O TECNOLOGÍAS DE SALUD necesarios. Si la solicitud NO es una prestación de salud legítima —sustancias ILÍCITAS o de uso recreativo (heroína, cocaína, drogas para consumo recreativo), pedidos SIN orden médica ni indicación clínica, fines puramente estéticos/recreativos, o cualquier cosa ajena al derecho a la salud— entonces "derechoFundamental" es "falla" (no se afecta un derecho fundamental amparable), el veredicto es "inadmisible", y la recomendación debe explicar con firmeza que la pretensión es IMPROCEDENTE por la vía de tutela. En esos casos "rutaRecomendada" pierde sentido (el esquema obliga a un valor: usa "tutela" como marcador, pero deja claro en la recomendación que NO procede).
Veredicto: "admisible" si todos los esenciales están ok; "admisible_con_reservas" si hay reservas subsanables; "inadmisible" si falla un requisito esencial.
Sé riguroso pero favorable al acceso a la justicia cuando hay sujetos de especial protección (siempre que la pretensión sea una prestación de salud legítima). Devuelve solo los campos del esquema.`;

function aResultado(
  raw: z.infer<typeof schema>,
  fundamentos: SentenciaRef[],
): TriajeResultado {
  return {
    veredicto: raw.veredicto,
    rutaRecomendada: raw.rutaRecomendada,
    confianza: CONFIANZA_MAP[raw.confianza] ?? 0.65,
    criterios: {
      derechoFundamental: raw.derechoFundamental,
      legitimacion: raw.legitimacion,
      subsidiariedad: raw.subsidiariedad,
      inmediatez: raw.inmediatez,
      noTemeridad: raw.noTemeridad,
      hechoSuperado: raw.hechoSuperado,
    },
    derechosVulnerados: Array.from(
      new Set(raw.derechosVulnerados ?? []),
    ) as DerechoFundamental[],
    fundamentos,
    recomendacion: raw.recomendacion,
    banderas: raw.banderas ?? [],
  };
}

/** Construye el contexto textual del caso para el prompt. */
function contextoCaso(caso: Caso): string {
  const dte = caso.demandante;
  const ddo = caso.demandado;
  return [
    `Servicio negado: ${caso.servicioNegado} (${caso.tipoServicio})`,
    `Diagnóstico: ${caso.diagnostico || "sin diagnóstico"}`,
    `Accionante: ${dte?.nombre ?? "el accionante"}, ${dte?.edad ?? "?"} años, régimen ${dte?.regimen ?? "no indicado"}` +
      (dte?.sujetoEspecialProteccion
        ? " — SUJETO DE ESPECIAL PROTECCIÓN"
        : ""),
    `Accionada: ${ddo?.nombre ?? "la EPS"}${ddo?.tipo ? ` (${ddo.tipo})` : ""}`,
    `Urgencia: ${caso.urgencia}. ¿Incluido en PBS?: ${caso.esPBS ? "sí" : "no"}`,
    `Derechos invocados: ${caso.derechosInvocados.join(", ")}`,
    `Hechos: ${caso.hechos}`,
    `Pretensión: ${caso.pretension}`,
  ].join("\n");
}

/**
 * Triaje de admisibilidad enriquecido (por criterios). Recupera fundamentos del
 * corpus y razona con Haiku. Demo-safe para el caso héroe.
 */
export async function triarCasoDetallado(caso: Caso): Promise<TriajeResultado> {
  const fundamentos = buscarSentencias(
    `${caso.servicioNegado} ${caso.diagnostico} ${caso.derechosInvocados.join(" ")} tutela admisibilidad procedencia`,
    4,
  );

  const op = async (): Promise<TriajeResultado> => {
    const { object } = await generateObject({
      model: modeloRapido(),
      schema,
      system: SYSTEM,
      prompt:
        `Evalúa la admisibilidad de la siguiente acción de tutela en salud.\n\n` +
        `CASO:\n${contextoCaso(caso)}\n\n` +
        `PRECEDENTE DISPONIBLE (para tu valoración):\n` +
        fundamentos
          .map((s) => `- ${s.id}: ${s.subregla}`)
          .join("\n"),
    });
    return aResultado(object, fundamentos);
  };

  if (esHeroe(caso.id)) {
    return conRespaldo(op, { ...TRIAJE_HEROE, fundamentos });
  }
  return op();
}

/**
 * Triaje en el tipo canónico TriajeAdmisibilidad (consumido por el dominio).
 * Adapta el resultado detallado.
 */
export async function triarCaso(caso: Caso): Promise<TriajeAdmisibilidad> {
  const r = await triarCasoDetallado(caso);
  return {
    admisible: r.veredicto !== "inadmisible",
    confianza: r.confianza,
    subsidiariedad: r.criterios.subsidiariedad.estado !== "falla",
    perjuicioIrremediable:
      caso.urgencia === "alta" || caso.urgencia === "vital",
    legitimacionActiva: r.criterios.legitimacion.estado !== "falla",
    derechosVulnerados: r.derechosVulnerados,
    fundamentos: r.fundamentos,
    recomendacion: r.recomendacion,
    banderas: r.banderas,
  };
}
