// lib/ai/generador.ts — Generación de escritos jurídicos (Opus, Markdown).
//
// Tres documentos:
//   1. generarReclamacionEPS(caso)  — reclamación directa previa a la EPS.
//   2. generarTutela(caso)          — acción de tutela constitucional completa.
//   3. generarFalloSugerido(caso)   — proyecto de fallo para el juez.
//
// Todos citan ÚNICAMENTE precedente recuperado del corpus (anti-alucinación) y
// degradan a fixtures de alta calidad para el caso héroe (demo-safe).

import {
  createTextStreamResponse,
  generateText,
  simulateReadableStream,
  streamText,
} from "ai";
import { modeloRazona, tieneApiKey } from "./client";
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

/** Etiqueta legible (español) del tipo de un anexo, para la sección PRUEBAS. */
function etiquetaTipoAnexo(tipo: string): string {
  const mapa: Record<string, string> = {
    negacion_eps: "negación de la EPS",
    orden_medica: "orden médica",
    historia_clinica: "historia clínica",
    cedula: "cédula de ciudadanía",
    formula_medica: "fórmula médica",
    carnet_eps: "carnet de afiliación a la EPS",
    derecho_peticion: "derecho de petición",
    otro: "documento",
  };
  return mapa[tipo] ?? "documento";
}

/**
 * Bloque de PRUEBAS documentales a partir de los anexos leídos por Claude.
 * Cada anexo aparece con su tipo, nombre y resumen para que el escrito los
 * relacione como pruebas. Cadena vacía si el caso no tiene anexos.
 */
function bloqueAnexos(caso: Caso): string {
  const anexos = caso.anexos ?? [];
  if (anexos.length === 0) return "";
  const lineas = anexos.map((a, i) => {
    const tipo = etiquetaTipoAnexo(a.tipoDetectado);
    const resumen = a.resumen ? ` — ${a.resumen}` : "";
    return `${i + 1}. ${tipo} (${a.nombre})${resumen}`;
  });
  return lineas.join("\n");
}

/** Ficha del caso para el prompt. */
function ficha(caso: Caso): string {
  const lineas = [
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
  ];
  const anexos = bloqueAnexos(caso);
  if (anexos) {
    lineas.push(
      `Pruebas documentales aportadas (anexos leídos del expediente; relaciónalos en la sección de PRUEBAS, no inventes otros):\n${anexos}`,
    );
  }
  return lineas.join("\n");
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

/** Tipo de documento solicitable a la API /api/generar. */
export type TipoDocumento = "reclamacion" | "tutela" | "fallo";

// --- Construcción de prompts (compartida entre variantes no-stream y stream) ---

const SYSTEM_POR_TIPO: Record<TipoDocumento, string> = {
  reclamacion: `Eres un redactor jurídico de Amparo (ODR de salud, Colombia). Redactas una RECLAMACIÓN DIRECTA ante la EPS (vía administrativa previa a la tutela), en español formal y respetuoso, en Markdown bien formateado.
Estructura: título; destinatario (la EPS); identificación del afiliado; hechos numerados; fundamento (incluye derecho a la salud y precedente provisto); solicitud concreta y términos; advertencia de acudir a tutela si no hay respuesta; firma.
${ANTI_ALUCINACION}`,
  tutela: `Eres un abogado constitucionalista que redacta ACCIONES DE TUTELA en salud en Colombia (art. 86 C.P., Decreto 2591 de 1991), en Markdown bien formateado.
El escrito DEBE contener, en secciones claras: encabezado (juez de reparto, partes, derechos); I. HECHOS (numerados); II. DERECHOS FUNDAMENTALES VULNERADOS (con fundamento normativo y precedente provisto); III. PRETENSIONES (incluida solicitud de medida provisional cuando proceda por urgencia/sujeto de especial protección); IV. PRUEBAS; V. JURAMENTO (art. 37 Decreto 2591/1991, no temeridad); VI. NOTIFICACIONES; firma.
Tono jurídico, preciso y persuasivo.
${ANTI_ALUCINACION}`,
  fallo: `Eres un magistrado auxiliar que redacta un PROYECTO DE FALLO de acción de tutela en salud (Colombia), en Markdown bien formateado, para apoyo del despacho judicial.
Estructura: encabezado (juzgado, partes); I. ANTECEDENTES; II. PROBLEMA JURÍDICO; III. CONSIDERACIONES (con la regla constitucional y el precedente provisto); IV. RESUELVE (numerales: TUTELAR / ORDENAR plazo concreto / atención integral / advertencia de desacato arts. 52-53 Decreto 2591/1991 / notificación e impugnación 3 días).
Razona la decisión con neutralidad judicial pero conforme al precedente.
${ANTI_ALUCINACION}`,
};

const INSTRUCCION_POR_TIPO: Record<TipoDocumento, string> = {
  reclamacion: "Redacta la reclamación.",
  tutela: "Redacta el escrito de tutela completo.",
  fallo: "Redacta el proyecto de fallo.",
};

/** Construye { system, prompt } para un tipo de documento (fuente única). */
function construirPrompt(
  caso: Caso,
  tipo: TipoDocumento,
): { system: string; prompt: string } {
  const { texto } = bloquePrecedente(caso);
  const system = SYSTEM_POR_TIPO[tipo];
  const prompt = `FICHA DEL CASO:\n${ficha(caso)}\n\nPRECEDENTE (citable):\n${texto}\n\n${INSTRUCCION_POR_TIPO[tipo]} Cierra con esta nota textual en la última línea:\n${DISCLAIMER}`;
  return { system, prompt };
}

/** Fixture héroe correspondiente al tipo (fallback demo-safe). */
function fixtureHeroe(tipo: TipoDocumento): string {
  switch (tipo) {
    case "reclamacion":
      return RECLAMACION_EPS_HEROE;
    case "fallo":
      return FALLO_HEROE;
    case "tutela":
    default:
      return TUTELA_HEROE;
  }
}

// --- 1. Reclamación directa ante la EPS ---

export async function generarReclamacionEPS(caso: Caso): Promise<string> {
  return generarDocumento(caso, "reclamacion");
}

// --- 2. Acción de tutela ---

export async function generarTutela(caso: Caso): Promise<string> {
  return generarDocumento(caso, "tutela");
}

// --- 3. Proyecto de fallo (para el juez) ---

export async function generarFalloSugerido(caso: Caso): Promise<string> {
  return generarDocumento(caso, "fallo");
}

/** Despacha la generación (NO-STREAM) según el tipo de documento. */
export async function generarDocumento(
  caso: Caso,
  tipo: TipoDocumento,
): Promise<string> {
  const { system, prompt } = construirPrompt(caso, tipo);
  const op = () => generarDoc(system, prompt);
  if (esHeroe(caso.id)) return conRespaldo(op, fixtureHeroe(tipo));
  return op();
}

// --- Variantes STREAMING (redacción token a token) ---
//
// Devuelven un `Response` text/plain (mismo contrato que /api/copiloto:
// toTextStreamResponse). Mantienen el blindaje demo-safe: si no hay API key, o
// si el caso héroe falla al iniciar el stream, degradan al fixture, servido
// igualmente como stream para que el consumidor (Fase 2) no distinga el origen.

/** Construye un Response que streamea un texto fijo (fixture) token a token. */
function streamDeTexto(texto: string): Response {
  // Trocea por palabras para una redacción visiblemente progresiva.
  const chunks = texto.match(/\S+\s*/g) ?? [texto];
  return createTextStreamResponse({
    textStream: simulateReadableStream({
      initialDelayInMs: 0,
      chunkDelayInMs: 8,
      chunks,
    }),
  });
}

/**
 * Genera un documento en STREAMING. Devuelve un `Response` (text/plain stream)
 * listo para retornarse desde la API route.
 *
 * - Sin API key → stream del fixture héroe (o de la tutela como neutro).
 * - Caso héroe → intenta el stream en vivo; si su construcción falla, degrada
 *   al fixture (también como stream). El timeout/respaldo total del fixture
 *   sigue cubierto por la variante no-stream para descargas.
 * - Resto → stream en vivo de Opus.
 */
export function generarDocumentoStream(caso: Caso, tipo: TipoDocumento): Response {
  if (!tieneApiKey()) {
    // Sin clave no hay generación en vivo: servimos el fixture como stream.
    return streamDeTexto(fixtureHeroe(tipo));
  }
  try {
    const { system, prompt } = construirPrompt(caso, tipo);
    const result = streamText({ model: modeloRazona(), system, prompt });
    return result.toTextStreamResponse();
  } catch {
    // Si la construcción del stream falla y es el caso héroe, degradamos al
    // fixture para no dejar el demo en blanco.
    if (esHeroe(caso.id)) return streamDeTexto(fixtureHeroe(tipo));
    throw new Error("No se pudo iniciar el stream de generación.");
  }
}
