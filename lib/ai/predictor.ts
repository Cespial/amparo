// lib/ai/predictor.ts — Predicción del resultado del caso.
//
// Recupera sentencias comparables con buscarSentencias(query, 4) y, con el
// modelo de razonamiento (Opus), estima la probabilidad de amparo y la regla
// aplicable.
//
// REGLA ANTI-ALUCINACIÓN: el modelo SOLO puede citar sentencias presentes en el
// conjunto recuperado del corpus (se le pasan por id en el prompt y se exige que
// devuelva ids de esa lista). Las citas se filtran contra el corpus recuperado;
// se prohíbe inventar.

import { z } from "zod";
import { generateObject } from "ai";
import { modeloRazona } from "./client";
import { buscarSentencias } from "../corpus/retrieval";
import type { Caso, Prediccion, SentenciaRef } from "../types";
import { conRespaldo, esHeroe, PREDICCION_HEROE } from "./fixtures";

/** Resultado enriquecido de la predicción (vista detallada). */
export interface PrediccionResultado {
  /** Probabilidad de amparo (0-100). */
  probabilidadAmparo: number;
  /** Sentencias citadas — SIEMPRE subconjunto del corpus recuperado. */
  sentenciasCitadas: SentenciaRef[];
  /** Regla/subregla constitucional aplicable. */
  reglaAplicable: string;
  /** Razonamiento del modelo. */
  razonamiento: string;
}

// Schema SIMPLE. probabilidadAmparo como string para evitar number.min/max;
// se parsea y se acota a [0,100] en código.
const schema = z.object({
  probabilidadAmparo: z
    .string()
    .describe("Probabilidad de amparo como entero de 0 a 100 (solo el número)."),
  sentenciasCitadas: z
    .array(z.string())
    .describe(
      "IDs de sentencias citadas. DEBEN provenir EXCLUSIVAMENTE de la lista de precedente recuperado provista.",
    ),
  reglaAplicable: z.string().describe("Subregla constitucional aplicable, en una frase."),
  razonamiento: z
    .string()
    .describe("Razonamiento jurídico que sustenta la probabilidad estimada."),
});

/** Idioma de la respuesta de la predicción. */
export type LangPrediccion = "es" | "en";

const SYSTEM_BASE = `Eres un analista jurídico predictivo experto en tutela en salud en Colombia.
Estimas la probabilidad de que un juez AMPARE el derecho (falle a favor del accionante), con base en los hechos del caso y EXCLUSIVAMENTE en el precedente recuperado que se te entrega.
REGLA INVIOLABLE: solo puedes citar sentencias cuyo id aparezca en la lista "PRECEDENTE RECUPERADO". Está terminantemente PROHIBIDO inventar o citar sentencias que no estén en esa lista.

GUARDA DE PROCEDENCIA (evalúala SIEMPRE primero): la tutela en salud protege el acceso a SERVICIOS O TECNOLOGÍAS DE SALUD necesarios, normalmente con orden del médico tratante o en clara conexión con el derecho fundamental a la salud, la vida o la integridad. Si la solicitud NO es una prestación de salud legítima —por ejemplo: sustancias ILÍCITAS o de uso recreativo (heroína, cocaína, drogas para "consumo recreativo"), pedidos SIN orden médica ni indicación clínica, fines puramente estéticos/recreativos sin sustento médico, o cualquier cosa ajena al derecho a la salud— entonces la acción es IMPROCEDENTE: asigna una probabilidad MUY BAJA (0 a 5), explica con claridad y firmeza por qué NO constituye un derecho fundamental amparable, y NO cites precedentes como si la respaldaran. En esos casos deja "sentenciasCitadas" VACÍO o, si mencionas el precedente recuperado, aclara expresamente que NO aplica a esta solicitud. JAMÁS uses una sentencia sobre un tema distinto (p. ej. un medicamento oncológico) para sugerir que una petición improcedente prosperaría.

Si SÍ es una prestación de salud legítima, calibra: alta (85-95) cuando hay prescripción del médico tratante, sujeto de especial protección y precedente reiterado; media (55-80) cuando hay matices; baja (<50) cuando el requisito de fundamentalidad o procedencia es débil.
Devuelve solo los campos del esquema.`;

const IDIOMA_ES = `\n\nIDIOMA — REQUISITO ABSOLUTO: Responde SIEMPRE en ESPAÑOL (el idioma del usuario). Términos jurídicos y nombres propios (tutela, EPS, PBS, UPC, ADRES, Mipres, T-760/2008, Corte Constitucional, Supersalud, Defensoría) se mantienen tal cual.`;

const IDIOMA_EN = `\n\nLANGUAGE — ABSOLUTE REQUIREMENT: Respond ALWAYS in ENGLISH (the user's language). Write EVERY free-text field ("reglaAplicable" and "razonamiento") in natural, fluent English, even though the case file and the retrieved precedent are in Spanish. Do NOT leave any text in Spanish. Keep ONLY proper nouns and legal terms that have no English form: judgment ids (e.g. T-760/2008), party names, the Corte Constitucional, and Colombian institutional terms (tutela, EPS, PBS, UPC, ADRES, Mipres, Supersalud, Defensoría).`;

function systemPrompt(lang: LangPrediccion): string {
  return SYSTEM_BASE + (lang === "en" ? IDIOMA_EN : IDIOMA_ES);
}

function parseProb(s: string): number {
  const n = Number(String(s).replace(/[^0-9.]/g, ""));
  if (!Number.isFinite(n)) return 70;
  return Math.max(0, Math.min(100, Math.round(n)));
}

/**
 * Predicción enriquecida con razonamiento (Opus + corpus). Demo-safe para héroe.
 * Filtra las citas para garantizar que provienen del corpus recuperado.
 */
export async function predecirCasoDetallado(
  caso: Caso,
  lang: LangPrediccion = "es",
): Promise<PrediccionResultado> {
  const recuperadas = buscarSentencias(
    `${caso.servicioNegado} ${caso.tipoServicio} ${caso.diagnostico} ${caso.derechosInvocados.join(" ")}`,
    4,
  );
  const porId = new Map(recuperadas.map((s) => [s.id, s]));

  const op = async (): Promise<PrediccionResultado> => {
    const { object } = await generateObject({
      model: modeloRazona(),
      schema,
      system: systemPrompt(lang),
      prompt:
        `Estima la probabilidad de amparo del siguiente caso.\n\n` +
        `CASO:\n` +
        `- Servicio negado: ${caso.servicioNegado} (${caso.tipoServicio})\n` +
        `- Diagnóstico: ${caso.diagnostico}\n` +
        `- Accionante: ${caso.demandante.nombre}, ${caso.demandante.edad} años` +
        (caso.demandante.sujetoEspecialProteccion
          ? " (SUJETO DE ESPECIAL PROTECCIÓN)"
          : "") +
        `\n- ¿PBS?: ${caso.esPBS ? "sí" : "no"} · Urgencia: ${caso.urgencia}\n` +
        `- Hechos: ${caso.hechos}\n\n` +
        `PRECEDENTE RECUPERADO (única fuente citable):\n` +
        recuperadas
          .map((s) => `- ${s.id} (${s.anio}): ${s.subregla}`)
          .join("\n"),
    });

    // Anti-alucinación: conservar solo ids presentes en el corpus recuperado.
    const citadas = (object.sentenciasCitadas ?? [])
      .map((id) => porId.get(id))
      .filter((s): s is SentenciaRef => Boolean(s));
    const prob = parseProb(object.probabilidadAmparo);
    // Improcedente / sin sustento (prob ínfima): NO citar precedentes (serían
    // engañosos). Si el modelo citó válidas, usarlas; si no y es procedente,
    // respaldar con las 2 mejores recuperadas.
    const sentenciasCitadas =
      prob <= 5
        ? []
        : citadas.length > 0
          ? citadas
          : recuperadas.slice(0, 2);

    return {
      probabilidadAmparo: prob,
      sentenciasCitadas,
      reglaAplicable: object.reglaAplicable,
      razonamiento: object.razonamiento,
    };
  };

  if (esHeroe(caso.id)) {
    return conRespaldo(op, PREDICCION_HEROE);
  }
  return op();
}

/**
 * Predicción en el tipo canónico Prediccion (consumido por el dominio).
 */
export async function predecirCaso(caso: Caso): Promise<Prediccion> {
  const r = await predecirCasoDetallado(caso);
  const p = r.probabilidadAmparo / 100;
  const favorable = p >= 0.5;
  return {
    probabilidadFavorable: Number(p.toFixed(2)),
    diasEstimados: caso.urgencia === "vital" ? 10 : 12,
    viaRecomendada: caso.esPBS && favorable ? "negociacion_eps" : "tutela",
    factoresFavorables: [
      "Prescripción del médico tratante",
      caso.demandante.sujetoEspecialProteccion
        ? "Sujeto de especial protección constitucional"
        : "Afectación del derecho fundamental a la salud",
      `Precedente aplicable: ${r.sentenciasCitadas.map((s) => s.id).join(", ")}`,
    ],
    factoresRiesgo: favorable
      ? ["La entidad podría alegar trámites administrativos o listas de espera."]
      : ["Procedencia o fundamentalidad del derecho con matices a sustentar."],
    casosComparables: r.sentenciasCitadas,
    confianza: Number(Math.min(0.95, 0.6 + Math.abs(p - 0.5)).toFixed(2)),
  };
}
