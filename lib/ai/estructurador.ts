// lib/ai/estructurador.ts — Estructura un relato libre (o transcripción de voz)
// en campos del caso, usando generateObject con el modelo rápido (Haiku).
//
// REGLA: el schema Zod es SIMPLE (enums + strings). NO se usan
// z.number().min().max() porque rompen el structured output de Claude.
// Los rangos/cardinalidades se validan en código después de la generación.

import { z } from "zod";
import { generateObject } from "ai";
import { modeloRapido } from "./client";
import type { Caso, DerechoFundamental, TipoServicio, Urgencia } from "../types";
import { conRespaldo, esHeroe, ESTRUCTURACION_HEROE } from "./fixtures";

/** Idioma de la salida de estructuración. */
export type LangEstructuracion = "es" | "en";

/** Entrada de estructuración (texto libre del usuario o transcripción de voz). */
export interface EstructuracionInput {
  relato: string;
  /** Id del caso (para blindaje demo-safe del héroe). Opcional. */
  casoId?: string;
  /** Idioma de la salida ("es" por defecto, o "en"). */
  lang?: LangEstructuracion;
}

/** Salida parcial estructurada de un caso, con campos auxiliares de intake. */
export type EstructuracionOutput = Partial<
  Pick<
    Caso,
    | "servicioNegado"
    | "tipoServicio"
    | "diagnostico"
    | "hechos"
    | "pretension"
    | "urgencia"
    | "derechosInvocados"
  >
> & {
  /** Nombre de la EPS/entidad accionada detectada, si se menciona. */
  eps?: string;
  /** Nombre del paciente detectado, si se menciona. */
  paciente?: string;
};

const TIPOS_SERVICIO = [
  "cirugia",
  "medicamento",
  "examen_diagnostico",
  "tratamiento",
  "traslado_ambulancia",
  "terapia",
  "insumo_dispositivo",
  "consulta_especialista",
  "otro",
] as const satisfies readonly TipoServicio[];

const URGENCIAS = ["baja", "media", "alta", "vital"] as const satisfies readonly Urgencia[];

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

// Schema SIMPLE: solo enums y strings. Sin .min()/.max() numéricos.
const schema = z.object({
  servicioNegado: z
    .string()
    .describe("Servicio de salud negado o demorado, en una frase corta."),
  tipoServicio: z.enum(TIPOS_SERVICIO).describe("Categoría del servicio."),
  diagnostico: z
    .string()
    .describe("Diagnóstico clínico mencionado o inferido (con código CIE si aparece)."),
  urgencia: z.enum(URGENCIAS).describe("Nivel de urgencia clínica/jurídica."),
  derechosInvocados: z
    .array(z.enum(DERECHOS))
    .describe("Derechos fundamentales en juego (1 a 4)."),
  hechos: z
    .string()
    .describe("Resumen narrativo y ordenado de los hechos relatados."),
  pretension: z
    .string()
    .describe("Pretensión concreta: qué debe ordenarse a la entidad."),
  eps: z
    .string()
    .describe("Nombre de la EPS o entidad accionada. Cadena vacía si no se menciona."),
  paciente: z
    .string()
    .describe("Nombre del paciente. Cadena vacía si no se menciona."),
});

const SYSTEM_BASE = `Eres el módulo de intake de Amparo, una plataforma de resolución de disputas de salud en Colombia.
A partir del relato libre (o transcripción de voz) de un paciente, extraes de forma fiel y estructurada los campos de un caso de tutela en salud.
Reglas:
- No inventes diagnósticos, servicios ni entidades que no estén implicados en el relato; si algo no aparece, deja la cadena lo más fiel posible o vacía cuando corresponda.
- "urgencia" = vital si hay riesgo inminente para la vida; alta si hay deterioro grave/progresivo; media si afecta la salud sin riesgo inmediato; baja en lo demás.
- Devuelve solo los campos del esquema.`;

const IDIOMA_ES = `\n- IDIOMA — REQUISITO ABSOLUTO: Redacta TODOS los campos de texto libre (servicioNegado, diagnostico, hechos, pretension) en ESPAÑOL formal, claro y en tercera/primera persona coherente. Términos jurídicos y nombres propios (tutela, EPS, PBS, T-760/2008) se mantienen tal cual.`;

const IDIOMA_EN = `\n- LANGUAGE — ABSOLUTE REQUIREMENT: Write ALL free-text fields (servicioNegado, diagnostico, hechos, pretension) in natural, fluent ENGLISH, even if the patient's account is in Spanish. Do NOT leave any of those fields in Spanish. Keep ONLY proper nouns and Colombian institutional terms that have no English form (tutela, EPS, PBS, UPC, ADRES, Mipres, T-760/2008), and the patient/EPS proper names exactly as given. The enum fields (tipoServicio, urgencia, derechosInvocados) MUST keep their exact schema values.`;

function systemPrompt(lang: LangEstructuracion): string {
  return SYSTEM_BASE + (lang === "en" ? IDIOMA_EN : IDIOMA_ES);
}

/** Coacciona/limpia la salida del modelo a la forma de dominio. */
function sanear(raw: z.infer<typeof schema>): EstructuracionOutput {
  const out: EstructuracionOutput = {
    servicioNegado: raw.servicioNegado?.trim() || undefined,
    tipoServicio: raw.tipoServicio,
    diagnostico: raw.diagnostico?.trim() || undefined,
    urgencia: raw.urgencia,
    hechos: raw.hechos?.trim() || undefined,
    pretension: raw.pretension?.trim() || undefined,
  };
  // Deduplicar derechos y limitar a un máximo razonable (validación en código).
  const derechos = Array.from(new Set(raw.derechosInvocados ?? [])).slice(0, 4);
  if (derechos.length > 0) out.derechosInvocados = derechos as DerechoFundamental[];
  const eps = raw.eps?.trim();
  if (eps) out.eps = eps;
  const paciente = raw.paciente?.trim();
  if (paciente) out.paciente = paciente;
  return out;
}

/**
 * Estructura el relato en campos del caso con generateObject + Haiku.
 * Para el caso héroe degrada a un fixture si la API falla o tarda demasiado.
 */
export async function estructurarCaso(
  input: EstructuracionInput,
): Promise<EstructuracionOutput> {
  const lang: LangEstructuracion = input.lang === "en" ? "en" : "es";
  const op = async (): Promise<EstructuracionOutput> => {
    const { object } = await generateObject({
      model: modeloRapido(),
      schema,
      system: systemPrompt(lang),
      prompt: `Relato del paciente:\n\n"""${input.relato}"""`,
    });
    return sanear(object);
  };

  if (esHeroe(input.casoId)) {
    return conRespaldo(op, ESTRUCTURACION_HEROE);
  }
  return op();
}
