// lib/ai/mediador.ts — El núcleo de la mediación de Amparo (la cuarta parte).
//
// Inspirado en la "Habermas Machine" (Google DeepMind, Science 2024): una IA
// puede MEDIAR temas divisivos y construir un CONSENSO que las partes —incluidas
// las minoritarias— califican como más justo. Amparo media entre el PACIENTE
// (demandante) y la EPS (demandado): en vez de gana/pierde, articula la posición
// LEGÍTIMA de cada parte y propone un ACUERDO de consenso, razonado y fundado en
// el derecho a la salud, que ambas partes pueden aceptar. Justicia procedimental
// + descongestión.
//
// Recupera precedente con buscarSentencias(query, 4) y, con el modelo de
// razonamiento (Opus), genera una propuesta de mediación BALANCEADA.
//
// REGLA ANTI-ALUCINACIÓN: el modelo SOLO puede citar sentencias presentes en el
// conjunto recuperado del corpus (se le pasan por id y se exige que devuelva ids
// de esa lista). Las citas se filtran contra el corpus recuperado; se prohíbe
// inventar sentencias fuera del corpus.
//
// Demo-safe: para el caso héroe degrada a un fixture de alta calidad si la API
// falla o tarda demasiado.

import { z } from "zod";
import { generateObject } from "ai";
import { modeloRazona } from "./client";
import { buscarSentencias } from "../corpus/retrieval";
import type { Caso, Mediacion, SentenciaRef } from "../types";
import {
  conRespaldo,
  esHeroe,
  MEDIACION_HEROE,
  MEDIACION_HEROE_EN,
} from "./fixtures";

/** Idioma de la propuesta de mediación. */
export type LangMediacion = "es" | "en";

// Schema SIMPLE (sin number.min/max) para no romper generateObject con Claude.
// `terminos` y `sentenciasCitadas` son arrays de strings; el resto, texto libre.
const schema = z.object({
  posicionDemandante: z
    .string()
    .describe(
      "La posición LEGÍTIMA del paciente (demandante): por qué su pretensión de acceso oportuno al servicio es razonable y digna de protección.",
    ),
  posicionEPS: z
    .string()
    .describe(
      "La posición LEGÍTIMA de la EPS (demandado): su interés válido en el proceso de autorización, la sostenibilidad y el alcance de lo cubierto, SIN reducirla a una mera negativa.",
    ),
  consensoPropuesto: z
    .string()
    .describe(
      "El acuerdo de consenso concreto que da al paciente el servicio que requiere Y atiende el proceso de la EPS. Debe poder ser calificado como justo por AMBAS partes.",
    ),
  fundamento: z
    .string()
    .describe(
      "El fundamento del consenso en el derecho a la salud, citando SOLO sentencias del precedente recuperado (por su id).",
    ),
  terminos: z
    .array(z.string())
    .describe(
      "Términos operativos y verificables del acuerdo (p.ej. autorización en X días, prestador concreto, fecha de cirugía, plan de seguimiento postoperatorio).",
    ),
  sentenciasCitadas: z
    .array(z.string())
    .describe(
      "IDs de sentencias citadas. DEBEN provenir EXCLUSIVAMENTE de la lista de PRECEDENTE RECUPERADO provista.",
    ),
});

const SYSTEM_ES = `Eres Amparo, "la cuarta parte": una IA mediadora de disputas de tutela en salud en Colombia, inspirada en la "Habermas Machine" (Google DeepMind, Science 2024), que demostró que una IA puede mediar temas divisivos y construir un consenso que las partes —incluidas las minoritarias— califican como más justo.

Tu misión NO es declarar un ganador. Es MEDIAR entre el PACIENTE (demandante) y la EPS (demandado) y construir un ACUERDO DE CONSENSO que ambos puedan aceptar como justo.

Reglas de la mediación:
1. Articula la posición LEGÍTIMA de CADA parte con genuina caridad interpretativa: del paciente, el acceso oportuno al servicio prescrito; de la EPS, su interés válido en el debido proceso de autorización, la auditoría de pertinencia, la red de prestadores, la sostenibilidad y el alcance de lo cubierto. Nunca caricaturices a la EPS como mera negadora.
2. Propón un CONSENSO concreto que dé al paciente el servicio que requiere Y atienda el proceso de la EPS: autorización en un plazo definido, prestador concreto, fecha cierta, plan de seguimiento del postoperatorio. El acuerdo debe ser RECÍPROCO: incluye también un compromiso concreto del paciente (p.ej. suspender la acción de tutela mientras la EPS cumpla los plazos pactados), de modo que el consenso no recaiga solo sobre la EPS. Que ninguna parte sacrifique su posición legítima.
3. Funda el consenso en el derecho fundamental a la salud y cita SOLO sentencias del PRECEDENTE RECUPERADO (por su id, p.ej. T-760/2008). Está terminantemente PROHIBIDO inventar o citar sentencias que no estén en esa lista.
4. Tono respetuoso, en primera persona plural ("proponemos"), procedimentalmente justo, accesible.
Devuelve solo los campos del esquema.`;

const SYSTEM_EN = `You are Amparo, "the fourth party": an AI mediator for health-tutela disputes in Colombia, inspired by the "Habermas Machine" (Google DeepMind, Science 2024), which showed that an AI can mediate divisive issues and build a consensus the parties —including minority ones— rate as fairer.

Your mission is NOT to declare a winner. It is to MEDIATE between the PATIENT (claimant) and the EPS (respondent) and build a CONSENSUS AGREEMENT both can accept as fair.

Mediation rules:
1. Articulate the LEGITIMATE position of EACH party with genuine interpretive charity: for the patient, timely access to the prescribed service; for the EPS, its valid interest in the due authorization process, the appropriateness review, the provider network, sustainability and the scope of what is covered. Never caricature the EPS as a mere denier.
2. Propose a concrete CONSENSUS that gives the patient the service they need AND honors the EPS's process: authorization within a defined deadline, a specific provider, a fixed date, a post-operative follow-up plan. The agreement must be RECIPROCAL: include a concrete commitment from the patient too (e.g. holding the tutela action while the EPS meets the agreed deadlines), so the consensus does not fall on the EPS alone. Let neither party sacrifice its legitimate position.
3. Ground the consensus in the fundamental right to health and cite ONLY judgments from the RETRIEVED PRECEDENT (by their id, e.g. T-760/2008). It is strictly FORBIDDEN to invent or cite judgments not on that list.
4. Respectful tone, first person plural ("we propose"), procedurally fair, accessible.
Return only the schema fields. Write all free-text fields in natural English.`;

/** Ficha compacta del caso para el prompt del mediador. */
function fichaCaso(caso: Caso): string {
  return [
    `Paciente (demandante): ${caso.demandante.nombre}, ${caso.demandante.edad} años, ${caso.demandante.ciudad} (${caso.demandante.departamento}), régimen ${caso.demandante.regimen}` +
      (caso.demandante.sujetoEspecialProteccion
        ? ", SUJETO DE ESPECIAL PROTECCIÓN"
        : ""),
    `EPS (demandado): ${caso.demandado.nombre} (${caso.demandado.tipo}${caso.demandado.nit ? ", NIT " + caso.demandado.nit : ""})`,
    `Servicio en disputa: ${caso.servicioNegado} (${caso.tipoServicio})`,
    `Diagnóstico: ${caso.diagnostico}`,
    `Urgencia: ${caso.urgencia} · ¿Incluido en PBS?: ${caso.esPBS ? "sí" : "no"}`,
    `Derechos invocados: ${caso.derechosInvocados.join(", ")}`,
    `Hechos: ${caso.hechos}`,
    `Pretensión del paciente: ${caso.pretension}`,
  ].join("\n");
}

/**
 * Genera una propuesta de mediación BALANCEADA entre el paciente y la EPS.
 *
 * Recupera precedente del corpus, articula la posición legítima de cada parte y
 * propone un consenso concreto fundado en el derecho a la salud, citando SOLO
 * sentencias del corpus recuperado. Demo-safe para el caso héroe.
 *
 * @param caso  El caso ODR a mediar.
 * @param lang  Idioma de la propuesta ("es" por defecto, o "en").
 * @returns     El objeto Mediacion (estado: "propuesta").
 */
export async function generarMediacion(
  caso: Caso,
  lang: LangMediacion = "es",
): Promise<Mediacion> {
  const recuperadas = buscarSentencias(
    `${caso.servicioNegado} ${caso.tipoServicio} ${caso.diagnostico} ${caso.derechosInvocados.join(" ")} derecho a la salud médico tratante autorización EPS`,
    4,
  );
  const porId = new Map(recuperadas.map((s) => [s.id, s]));

  const op = async (): Promise<Mediacion> => {
    const { object } = await generateObject({
      model: modeloRazona(),
      schema,
      system: lang === "en" ? SYSTEM_EN : SYSTEM_ES,
      prompt:
        `Media la siguiente disputa de tutela en salud y construye una propuesta de consenso entre el PACIENTE y la EPS.\n\n` +
        `CASO:\n${fichaCaso(caso)}\n\n` +
        `PRECEDENTE RECUPERADO (única fuente citable):\n` +
        recuperadas
          .map((s) => `- ${s.id} (${s.anio}): ${s.subregla}`)
          .join("\n"),
    });

    // Anti-alucinación: conservar solo ids presentes en el corpus recuperado.
    const citadas = (object.sentenciasCitadas ?? [])
      .map((id) => porId.get(id))
      .filter((s): s is SentenciaRef => Boolean(s));
    const fundamentos = citadas.length > 0 ? citadas : recuperadas.slice(0, 2);

    return {
      posicionDemandante: object.posicionDemandante,
      posicionEPS: object.posicionEPS,
      consensoPropuesto: object.consensoPropuesto,
      fundamento: object.fundamento,
      terminos: object.terminos ?? [],
      fundamentos,
      estado: "propuesta",
    };
  };

  if (esHeroe(caso.id)) {
    return conRespaldo(op, lang === "en" ? MEDIACION_HEROE_EN : MEDIACION_HEROE);
  }
  return op();
}
