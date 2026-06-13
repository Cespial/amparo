// lib/progreso.ts — Progreso 0-100 derivado del estado del caso ODR.

import type { EstadoCaso } from "./types";

/** Mapa estado -> progreso (según contrato de arquitectura). */
const PROGRESO_POR_ESTADO: Record<EstadoCaso, number> = {
  INTAKE: 10,
  TRIADO: 25,
  EN_NEGOCIACION_EPS: 45,
  RESUELTO_EPS: 100,
  ESCALADO_TUTELA: 60,
  EN_DESPACHO: 80,
  FALLADO: 100,
};

/** Devuelve el progreso (0-100) correspondiente a un estado del caso. */
export function progresoDeEstado(e: EstadoCaso): number {
  return PROGRESO_POR_ESTADO[e] ?? 0;
}

/** Etiqueta legible del estado para UI. */
export const ETIQUETA_ESTADO: Record<EstadoCaso, string> = {
  INTAKE: "Recepción",
  TRIADO: "Triaje realizado",
  EN_NEGOCIACION_EPS: "En negociación con EPS",
  RESUELTO_EPS: "Resuelto con EPS",
  ESCALADO_TUTELA: "Tutela presentada",
  EN_DESPACHO: "En despacho judicial",
  FALLADO: "Fallado",
};
