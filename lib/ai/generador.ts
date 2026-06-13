// lib/ai/generador.ts — Generación de escritos jurídicos (Opus, Markdown).
//
// Tres documentos:
//   1. generarReclamacionEPS(caso)  — reclamación directa previa a la EPS.
//   2. generarTutela(caso)          — acción de tutela constitucional completa.
//   3. generarFalloSugerido(caso)   — proyecto de fallo para el juez.
//
// Todos citan ÚNICAMENTE precedente recuperado del corpus (anti-alucinación) y
// degradan a fixtures de alta calidad para el caso héroe (demo-safe).

import { generateText } from "ai";
import { modeloRazona } from "./client";
import { buscarSentencias } from "../corpus/retrieval";
import { formatearRadicado } from "../radicado";
import type { Caso, SentenciaRef } from "../types";
import {
  conRespaldo,
  esHeroe,
  FALLO_HEROE,
  RECLAMACION_EPS_HEROE,
  TUTELA_HEROE,
} from "./fixtures";

const DISCLAIMER =
  "*Documento generado por Amparo (asistido por IA). Material ilustrativo; requiere revisión de un profesional del derecho antes de su uso formal.*";

/** Recupera precedente y lo formatea como bloque citable. */
function bloquePrecedente(caso: Caso): { sentencias: SentenciaRef[]; texto: string } {
  const sentencias = buscarSentencias(
    `${caso.servicioNegado} ${caso.diagnostico} ${caso.derechosInvocados.join(" ")} ${caso.tipoServicio}`,
    4,
  );
  const texto = sentencias
    .map((s) => `- ${s.id} (${s.anio}): ${s.subregla}`)
    .join("\n");
  return { sentencias, texto };
}

/** Ficha del caso para el prompt. */
function ficha(caso: Caso): string {
  return [
    `Radicado: ${formatearRadicado(caso.radicado)}`,
    `Accionante: ${caso.demandante.nombre}, ${caso.demandante.edad} años, doc. ${caso.demandante.documento ?? "N/D"}, ${caso.demandante.ciudad} (${caso.demandante.departamento}), régimen ${caso.demandante.regimen}` +
      (caso.demandante.sujetoEspecialProteccion
        ? ", SUJETO DE ESPECIAL PROTECCIÓN"
        : ""),
    `Accionada: ${caso.demandado.nombre} (${caso.demandado.tipo}${caso.demandado.nit ? ", NIT " + caso.demandado.nit : ""})`,
    `Servicio negado: ${caso.servicioNegado} (${caso.tipoServicio})`,
    `Diagnóstico: ${caso.diagnostico}`,
    `Urgencia: ${caso.urgencia} · ¿PBS?: ${caso.esPBS ? "sí" : "no"}`,
    `Derechos invocados: ${caso.derechosInvocados.join(", ")}`,
    `Hechos: ${caso.hechos}`,
    `Pretensión: ${caso.pretension}`,
  ].join("\n");
}

const ANTI_ALUCINACION =
  "Cita SOLO las sentencias del PRECEDENTE provisto (por su id, p.ej. T-760/2008). No inventes ni cites sentencias que no estén en esa lista. No inventes datos fácticos que no estén en la ficha del caso.";

/** Helper común de generación de texto con Opus. */
async function generarDoc(system: string, prompt: string): Promise<string> {
  const { text } = await generateText({
    model: modeloRazona(),
    system,
    prompt,
  });
  return text.trim();
}

// --- 1. Reclamación directa ante la EPS ---

export async function generarReclamacionEPS(caso: Caso): Promise<string> {
  const { texto } = bloquePrecedente(caso);
  const system = `Eres un redactor jurídico de Amparo (ODR de salud, Colombia). Redactas una RECLAMACIÓN DIRECTA ante la EPS (vía administrativa previa a la tutela), en español formal y respetuoso, en Markdown bien formateado.
Estructura: título; destinatario (la EPS); identificación del afiliado; hechos numerados; fundamento (incluye derecho a la salud y precedente provisto); solicitud concreta y términos; advertencia de acudir a tutela si no hay respuesta; firma.
${ANTI_ALUCINACION}`;
  const prompt = `FICHA DEL CASO:\n${ficha(caso)}\n\nPRECEDENTE (citable):\n${texto}\n\nRedacta la reclamación. Cierra con esta nota textual en la última línea:\n${DISCLAIMER}`;

  const op = () => generarDoc(system, prompt);
  if (esHeroe(caso.id)) return conRespaldo(op, RECLAMACION_EPS_HEROE);
  return op();
}

// --- 2. Acción de tutela ---

export async function generarTutela(caso: Caso): Promise<string> {
  const { texto } = bloquePrecedente(caso);
  const system = `Eres un abogado constitucionalista que redacta ACCIONES DE TUTELA en salud en Colombia (art. 86 C.P., Decreto 2591 de 1991), en Markdown bien formateado.
El escrito DEBE contener, en secciones claras: encabezado (juez de reparto, partes, derechos); I. HECHOS (numerados); II. DERECHOS FUNDAMENTALES VULNERADOS (con fundamento normativo y precedente provisto); III. PRETENSIONES (incluida solicitud de medida provisional cuando proceda por urgencia/sujeto de especial protección); IV. PRUEBAS; V. JURAMENTO (art. 37 Decreto 2591/1991, no temeridad); VI. NOTIFICACIONES; firma.
Tono jurídico, preciso y persuasivo.
${ANTI_ALUCINACION}`;
  const prompt = `FICHA DEL CASO:\n${ficha(caso)}\n\nPRECEDENTE (citable):\n${texto}\n\nRedacta el escrito de tutela completo. Cierra con esta nota textual en la última línea:\n${DISCLAIMER}`;

  const op = () => generarDoc(system, prompt);
  if (esHeroe(caso.id)) return conRespaldo(op, TUTELA_HEROE);
  return op();
}

// --- 3. Proyecto de fallo (para el juez) ---

export async function generarFalloSugerido(caso: Caso): Promise<string> {
  const { texto } = bloquePrecedente(caso);
  const system = `Eres un magistrado auxiliar que redacta un PROYECTO DE FALLO de acción de tutela en salud (Colombia), en Markdown bien formateado, para apoyo del despacho judicial.
Estructura: encabezado (juzgado, partes); I. ANTECEDENTES; II. PROBLEMA JURÍDICO; III. CONSIDERACIONES (con la regla constitucional y el precedente provisto); IV. RESUELVE (numerales: TUTELAR / ORDENAR plazo concreto / atención integral / advertencia de desacato arts. 52-53 Decreto 2591/1991 / notificación e impugnación 3 días).
Razona la decisión con neutralidad judicial pero conforme al precedente.
${ANTI_ALUCINACION}`;
  const prompt = `FICHA DEL CASO:\n${ficha(caso)}\n\nPRECEDENTE (citable):\n${texto}\n\nRedacta el proyecto de fallo. Cierra con esta nota textual en la última línea:\n${DISCLAIMER}`;

  const op = () => generarDoc(system, prompt);
  if (esHeroe(caso.id)) return conRespaldo(op, FALLO_HEROE);
  return op();
}

/** Tipo de documento solicitable a la API /api/generar. */
export type TipoDocumento = "reclamacion" | "tutela" | "fallo";

/** Despacha la generación según el tipo de documento. */
export async function generarDocumento(
  caso: Caso,
  tipo: TipoDocumento,
): Promise<string> {
  switch (tipo) {
    case "reclamacion":
      return generarReclamacionEPS(caso);
    case "fallo":
      return generarFalloSugerido(caso);
    case "tutela":
    default:
      return generarTutela(caso);
  }
}
