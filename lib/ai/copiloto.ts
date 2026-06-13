// lib/ai/copiloto.ts — "Segundo cerebro": copiloto conversacional por rol.
//
// Responde una pregunta del usuario DESDE LA PERSPECTIVA de su rol
// (demandante / demandado / juez), sobre un caso dado, con streaming
// (streamText). Se apoya en el corpus para fundamentos.

import { streamText } from "ai";
import { modeloRapido } from "./client";
import { buscarSentencias } from "../corpus/retrieval";
import type { Caso, RolUsuario } from "../types";

export interface CopilotoInput {
  rol: RolUsuario;
  casoId?: string;
  pregunta: string;
  /** Caso completo (opcional) para anclar la respuesta en sus hechos. */
  caso?: Caso;
}

/** Instrucción de sistema según el rol. */
function systemPorRol(rol: RolUsuario): string {
  const base =
    "Eres el 'segundo cerebro' de Amparo, una plataforma de resolución de disputas de salud en Colombia. Respondes en español, claro y conciso, sin tecnicismos innecesarios. Cuando cites jurisprudencia, usa solo el precedente que se te entregue. Recuerda que es información de apoyo y no reemplaza asesoría jurídica formal.";
  switch (rol) {
    case "demandante":
      return `${base}\nHablas con el PACIENTE/ACCIONANTE. Explícale sus derechos, qué puede esperar, próximos pasos y plazos, con empatía y lenguaje sencillo. Empodéralo sin generar falsas expectativas.`;
    case "demandado":
      return `${base}\nHablas con la ENTIDAD ACCIONADA (EPS/IPS). Sé objetivo: expón el marco normativo, el riesgo jurídico, las opciones de cumplimiento o negociación temprana y las consecuencias de un eventual fallo o desacato.`;
    case "juez":
      return `${base}\nHablas con el JUEZ/DESPACHO. Aporta análisis jurídico neutral: problema jurídico, procedencia, precedente aplicable y posibles órdenes. No decides por el juez; ofreces insumos.`;
    case "atlas":
    default:
      return `${base}\nOfreces una visión analítica y de contexto (datos, tendencias) sobre tutelas en salud en Colombia.`;
  }
}

/** Construye el contexto del caso (si se proporcionó). */
function contextoCaso(caso?: Caso): string {
  if (!caso) return "No se proporcionó un caso específico; responde de forma general.";
  return [
    `Caso ${caso.radicado} — estado: ${caso.estado}.`,
    `Accionante: ${caso.demandante.nombre}, ${caso.demandante.edad} años` +
      (caso.demandante.sujetoEspecialProteccion
        ? " (sujeto de especial protección)"
        : "") +
      `. Accionada: ${caso.demandado.nombre} (${caso.demandado.tipo}).`,
    `Servicio negado: ${caso.servicioNegado} (${caso.tipoServicio}). Diagnóstico: ${caso.diagnostico}.`,
    `Urgencia: ${caso.urgencia}. ¿PBS?: ${caso.esPBS ? "sí" : "no"}. Derechos: ${caso.derechosInvocados.join(", ")}.`,
    `Hechos: ${caso.hechos}`,
    `Pretensión: ${caso.pretension}`,
  ].join("\n");
}

/**
 * Responde al copiloto en streaming. Devuelve el StreamTextResult de la AI SDK,
 * cuyo .toTextStreamResponse() puede retornarse directamente desde la API route.
 */
export function responderCopilotoStream(input: CopilotoInput) {
  const fundamentos = buscarSentencias(
    input.caso
      ? `${input.caso.servicioNegado} ${input.caso.diagnostico} ${input.pregunta}`
      : input.pregunta,
    3,
  );
  const precedente = fundamentos
    .map((s) => `- ${s.id} (${s.anio}): ${s.subregla}`)
    .join("\n");

  return streamText({
    model: modeloRapido(),
    system: systemPorRol(input.rol),
    prompt:
      `CONTEXTO DEL CASO:\n${contextoCaso(input.caso)}\n\n` +
      `PRECEDENTE DISPONIBLE (cita solo de aquí):\n${precedente}\n\n` +
      `PREGUNTA DEL USUARIO (${input.rol}):\n${input.pregunta}`,
  });
}

/**
 * Variante no-streaming (texto completo). Útil para entornos sin stream.
 */
export async function responderCopiloto(input: CopilotoInput): Promise<string> {
  const result = responderCopilotoStream(input);
  return result.text;
}
