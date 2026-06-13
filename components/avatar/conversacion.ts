"use client";

/**
 * Lógica de la conversación guiada del asistente (human-in-the-loop).
 *
 * Self-contained: NO escribe en el store global (otro agente lo edita).
 * Mantiene un borrador de Caso EN MEMORIA para alimentar /api/triaje y
 * /api/predecir, que aceptan { caso }.
 *
 * Tipos del dominio importados SOLO en modo type (lib/types.ts es de lectura).
 */

import type { Caso, TipoServicio } from "@/lib/types";

/** Fases del flujo de UNA pregunta a la vez. */
export type Fase =
  | "saludo" // Amparo se presenta y pregunta qué le negaron
  | "relato" // usuario cuenta su caso (texto/voz)
  | "estructurando" // llamando /api/estructurar
  | "confirmar" // confirma campo por campo
  | "triando" // llamando /api/triaje
  | "triaje" // muestra veredicto
  | "prediciendo" // llamando /api/predecir
  | "prediccion" // muestra probabilidad + sentencia
  | "cierre" // CTA al expediente / generar tutela
  | "error";

export type Autor = "amparo" | "usuario";

export interface Mensaje {
  id: string;
  autor: Autor;
  texto: string;
}

/** Salida esperada de /api/estructurar (espejo de EstructuracionOutput). */
export interface EstructuracionOutput {
  servicioNegado?: string;
  tipoServicio?: TipoServicio;
  diagnostico?: string;
  hechos?: string;
  pretension?: string;
  urgencia?: Caso["urgencia"];
  derechosInvocados?: Caso["derechosInvocados"];
  eps?: string;
  paciente?: string;
}

/** Salida de /api/triaje (subconjunto que usa la UI). */
export interface TriajeResultado {
  veredicto: "admisible" | "admisible_con_reservas" | "inadmisible";
  rutaRecomendada: "negociacion_eps" | "tutela";
  confianza: number;
  recomendacion: string;
}

/** Salida de /api/predecir (subconjunto que usa la UI). */
export interface PrediccionResultado {
  probabilidadAmparo: number;
  reglaAplicable: string;
  razonamiento: string;
  sentenciasCitadas: { id: string; titulo?: string; anio?: number }[];
}

/** Campos que el usuario confirma uno por uno. */
export type CampoConfirmable = "eps" | "servicioNegado" | "diagnostico";

export interface PasoConfirmacion {
  campo: CampoConfirmable;
  etiqueta: string;
}

export const PASOS_CONFIRMACION: PasoConfirmacion[] = [
  { campo: "eps", etiqueta: "tu EPS" },
  { campo: "servicioNegado", etiqueta: "el servicio que te negaron" },
  { campo: "diagnostico", etiqueta: "tu diagnóstico" },
];

export interface EstadoConversacion {
  fase: Fase;
  mensajes: Mensaje[];
  /** Borrador de datos recolectados (parcial). */
  datos: EstructuracionOutput;
  /** Índice del paso de confirmación actual. */
  pasoConfirmacion: number;
  triaje: TriajeResultado | null;
  prediccion: PrediccionResultado | null;
  errorMsg: string | null;
}

export const ESTADO_INICIAL: EstadoConversacion = {
  fase: "saludo",
  mensajes: [],
  datos: {},
  pasoConfirmacion: 0,
  triaje: null,
  prediccion: null,
  errorMsg: null,
};

let contador = 0;
function nuevoId(): string {
  contador += 1;
  return `m${contador}-${Date.now().toString(36)}`;
}

export function msg(autor: Autor, texto: string): Mensaje {
  return { id: nuevoId(), autor, texto };
}

export const SALUDO =
  "Hola, soy Amparo. Estoy aquí para ayudarte, con calma y en palabras sencillas. Cuéntame: ¿qué servicio de salud te negó tu EPS?";

/** Frase con la que Amparo confirma un campo concreto. */
export function fraseConfirmacion(
  campo: CampoConfirmable,
  datos: EstructuracionOutput,
): string {
  const valor = (datos[campo] ?? "").trim();
  switch (campo) {
    case "eps":
      return valor
        ? `Entendido. Tu EPS es ${valor}, ¿es correcto?`
        : "No alcancé a entender el nombre de tu EPS. ¿Me dices cuál es?";
    case "servicioNegado":
      return valor
        ? `Y lo que te negaron es: ${valor}. ¿Está bien así?`
        : "¿Qué servicio exactamente te negó tu EPS?";
    case "diagnostico":
      return valor
        ? `Anoté tu diagnóstico como: ${valor}. ¿Lo dejo así?`
        : "Si tienes un diagnóstico del médico, dímelo. Si no, puedes dejarlo vacío y seguimos.";
  }
}

/** Mapea TipoServicio a partir del texto si /api/estructurar no lo trae. */
function inferirTipo(texto: string): TipoServicio {
  const t = texto.toLowerCase();
  if (/cirug|operaci/.test(t)) return "cirugia";
  if (/medicament|fármaco|farmaco|pastill/.test(t)) return "medicamento";
  if (/examen|resonanc|tomograf|ecograf|laborator|diagn/.test(t))
    return "examen_diagnostico";
  if (/ambulanc|traslad/.test(t)) return "traslado_ambulancia";
  if (/terapia|fisioterap|rehabilit/.test(t)) return "terapia";
  if (/prótesis|protesis|insumo|dispositiv|silla de ruedas/.test(t))
    return "insumo_dispositivo";
  if (/especialist|cita|consulta/.test(t)) return "consulta_especialista";
  if (/tratamient/.test(t)) return "tratamiento";
  return "otro";
}

/**
 * Construye un Caso completo EN MEMORIA a partir del borrador, con valores
 * por defecto razonables, para enviarlo a /api/triaje y /api/predecir.
 * No se persiste en el store.
 */
export function construirCaso(datos: EstructuracionOutput): Caso {
  const ahora = new Date().toISOString();
  const servicio = (datos.servicioNegado ?? "Servicio de salud").trim();
  const tipo = datos.tipoServicio ?? inferirTipo(servicio);
  const hechos =
    (datos.hechos ?? "").trim() ||
    `Mi EPS me negó ${servicio}. Necesito acceder a este servicio para proteger mi salud.`;

  return {
    id: `asistente-${Date.now().toString(36)}`,
    radicado: "",
    estado: "INTAKE",
    fechaCreacion: ahora,
    fechaBase: ahora,
    demandante: {
      nombre: (datos.paciente ?? "Solicitante").trim() || "Solicitante",
      edad: 40,
      ciudad: "",
      departamento: "",
      codigoDepartamento: "",
      regimen: "contributivo",
    },
    demandado: {
      nombre: (datos.eps ?? "EPS").trim() || "EPS",
      tipo: "EPS",
    },
    servicioNegado: servicio,
    tipoServicio: tipo,
    diagnostico: (datos.diagnostico ?? "").trim(),
    hechos,
    pretension:
      (datos.pretension ?? "").trim() ||
      `Que se ordene a la EPS autorizar y prestar ${servicio} sin dilación.`,
    urgencia: datos.urgencia ?? "alta",
    esPBS: true,
    derechosInvocados:
      datos.derechosInvocados && datos.derechosInvocados.length > 0
        ? datos.derechosInvocados
        : ["salud", "vida"],
    cronograma: [],
    progreso: 0,
    timeline: [],
  };
}

/** Frase hablada del veredicto del triaje (sin jerga jurídica). */
export function fraseVeredicto(t: TriajeResultado): string {
  if (t.veredicto === "inadmisible") {
    return "Revisé tu caso. Con lo que me contaste, todavía no veo clara la procedencia de una tutela. No te preocupes: hay otros caminos y te acompaño igual.";
  }
  const matiz =
    t.veredicto === "admisible_con_reservas"
      ? "Tu tutela podría proceder, con un par de detalles por afinar."
      : "Buenas noticias: tu tutela procede.";
  const ruta =
    t.rutaRecomendada === "tutela"
      ? "Lo más conveniente es ir por la acción de tutela."
      : "Conviene primero intentar resolverlo directamente con tu EPS.";
  return `${matiz} ${ruta}`;
}

/** Frase hablada de la predicción (probabilidad + sentencia citada). */
export function frasePrediccion(p: PrediccionResultado): string {
  const pct = Math.round(p.probabilidadAmparo);
  const cita = p.sentenciasCitadas[0];
  const refSentencia = cita
    ? ` Me apoyo en la Sentencia ${formatearSentencia(cita.id)}${
        cita.anio ? ` de ${cita.anio}` : ""
      }.`
    : "";
  return `Tu caso tiene cerca de un ${pct} por ciento de probabilidad de que un juez ampare tu derecho.${refSentencia}`;
}

/** Normaliza "T-760/2008" -> "T-760 de 2008" para que suene natural. */
export function formatearSentencia(id: string): string {
  const m = id.match(/^([A-Za-z]+-?\d+)[/\s-]?(\d{4})?$/);
  if (m) return m[2] ? `${m[1]} de ${m[2]}` : m[1];
  return id;
}
