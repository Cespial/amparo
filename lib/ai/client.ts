// lib/ai/client.ts — Cliente AI SDK (Anthropic) compartido.
import { createAnthropic } from "@ai-sdk/anthropic";

/** Modelo de razonamiento (tareas complejas: triaje, predicción, generación). */
export const MODELO_RAZONA = "claude-opus-4-8";
/** Modelo rápido (estructuración, copiloto, respuestas ágiles). */
export const MODELO_RAPIDO = "claude-haiku-4-5";

/**
 * Proveedor Anthropic. Lee ANTHROPIC_API_KEY del entorno.
 * Se construye perezosamente para no fallar en el build cuando falta la clave.
 */
export const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/** Modelo de lenguaje listo para usar con generateText/generateObject. */
export function modeloRazona() {
  return anthropic(MODELO_RAZONA);
}

/** Modelo rápido listo para usar. */
export function modeloRapido() {
  return anthropic(MODELO_RAPIDO);
}

/** ¿Hay clave de API configurada? Útil para degradar a stubs. */
export function tieneApiKey(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}
