// lib/plazos.ts — Cómputo del cronograma de plazos de la acción de tutela.
//
// Marco normativo (Decreto 2591 de 1991 y desarrollo jurisprudencial):
//  - Art. 29: el fallo de primera instancia se profiere dentro de los 10 días
//    siguientes a la presentación de la solicitud (días hábiles).
//  - Art. 31: la impugnación se interpone dentro de los 3 días siguientes a la
//    notificación del fallo.
//  - Art. 32: la segunda instancia decide dentro de los 20 días siguientes a la
//    recepción del expediente.
//  - Art. 23/27: cumplimiento del fallo dentro de las 48 horas (servicios de salud)
//    a un máximo razonable según la orden.
//  - Selección/revisión por la Corte Constitucional (Art. 33): eventual.

import type { PlazoLegal } from "./types";

/** ¿La fecha cae en fin de semana? (sábado=6, domingo=0). */
function esFinDeSemana(d: Date): boolean {
  const day = d.getDay();
  return day === 0 || day === 6;
}

/**
 * Festivos nacionales colombianos (aproximación para demo, formato MM-DD de fecha
 * trasladada por Ley Emiliani cuando aplica). Lista no exhaustiva; suficiente para
 * el cómputo ilustrativo del cronograma.
 */
const FESTIVOS_MMDD = new Set<string>([
  "01-01", // Año Nuevo
  "05-01", // Día del Trabajo
  "07-20", // Independencia
  "08-07", // Batalla de Boyacá
  "12-08", // Inmaculada Concepción
  "12-25", // Navidad
]);

function esFestivo(d: Date): boolean {
  const mmdd = `${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
  return FESTIVOS_MMDD.has(mmdd);
}

function esHabil(d: Date): boolean {
  return !esFinDeSemana(d) && !esFestivo(d);
}

/** Suma `n` días hábiles a partir de `base` (excluye el día base). */
function sumarDiasHabiles(base: Date, n: number): Date {
  const d = new Date(base.getTime());
  let restantes = n;
  while (restantes > 0) {
    d.setDate(d.getDate() + 1);
    if (esHabil(d)) restantes--;
  }
  return d;
}

/** Suma `n` días calendario a partir de `base`. */
function sumarDiasCalendario(base: Date, n: number): Date {
  const d = new Date(base.getTime());
  d.setDate(d.getDate() + n);
  return d;
}

function plazo(
  hito: string,
  etiqueta: string,
  base: Date,
  dias: number,
  habiles: boolean,
  fundamento: string,
): PlazoLegal {
  const fechaLimite = habiles
    ? sumarDiasHabiles(base, dias)
    : sumarDiasCalendario(base, dias);
  return {
    hito,
    etiqueta,
    fechaLimite: fechaLimite.toISOString(),
    dias,
    habiles,
    fundamento,
    cumplido: false,
  };
}

/**
 * Construye el cronograma de plazos legales del trámite de tutela a partir de la
 * fecha de presentación (fechaBase).
 */
export function cronogramaTutela(fechaBase: Date): PlazoLegal[] {
  const base = new Date(fechaBase.getTime());

  const falloPrimera = plazo(
    "fallo_primera_instancia",
    "Fallo de primera instancia",
    base,
    10,
    true,
    "Art. 29 Decreto 2591 de 1991 (10 días hábiles)",
  );
  const baseFallo = new Date(falloPrimera.fechaLimite);

  const impugnacion = plazo(
    "impugnacion",
    "Término para impugnar",
    baseFallo,
    3,
    true,
    "Art. 31 Decreto 2591 de 1991 (3 días siguientes a la notificación)",
  );
  const baseImpugnacion = new Date(impugnacion.fechaLimite);

  const falloSegunda = plazo(
    "fallo_segunda_instancia",
    "Fallo de segunda instancia",
    baseImpugnacion,
    20,
    true,
    "Art. 32 Decreto 2591 de 1991 (20 días siguientes a la recepción)",
  );
  const baseSegunda = new Date(falloSegunda.fechaLimite);

  const cumplimiento = plazo(
    "cumplimiento_orden",
    "Cumplimiento de la orden (salud)",
    baseFallo,
    2,
    false,
    "Arts. 23 y 27 Decreto 2591 de 1991 (cumplimiento perentorio, 48 horas)",
  );

  const revision = plazo(
    "eventual_revision",
    "Eventual selección y revisión (Corte Const.)",
    baseSegunda,
    30,
    false,
    "Art. 33 Decreto 2591 de 1991 (remisión a la Corte Constitucional)",
  );

  return [falloPrimera, impugnacion, falloSegunda, cumplimiento, revision];
}
