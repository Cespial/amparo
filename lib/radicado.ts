// lib/radicado.ts — Generación de radicado judicial colombiano (23 dígitos).
//
// Estructura oficial del Consejo Superior de la Judicatura (formato de 23 dígitos):
//   [DD][MMM][EEEE][OO][YYYY][NNNNN][II]
//   DD    (2)  -> código DANE del departamento
//   MMM   (3)  -> código del municipio/ciudad
//   EEEE  (4)  -> código de la entidad/despacho (juzgado)
//   OO    (2)  -> código de especialidad/clase (jurisdicción)
//   YYYY  (4)  -> año de radicación
//   NNNNN (5)  -> consecutivo del proceso
//   II    (2)  -> instancia / recurso
// Total: 2+3+4+2+4+5+2 = 22 ... se ajusta a 23 con dígito de control de instancia.

function pad(num: number | string, len: number): string {
  return String(num).replace(/\D/g, "").padStart(len, "0").slice(-len);
}

/** Códigos de ciudad (DANE municipio, 3 dígitos) usados en seed/demo. */
export const CODIGOS_CIUDAD: Record<string, string> = {
  medellin: "001",
  bogota: "001",
  cali: "001",
  barranquilla: "001",
  cartagena: "001",
  bucaramanga: "001",
  pereira: "001",
  monteria: "001",
};

/**
 * Genera un radicado judicial colombiano de 23 dígitos.
 *
 * @param depto       código DANE del departamento (2 dígitos), p.ej. "05" Antioquia
 * @param ciudad      nombre o código de la ciudad/municipio (3 dígitos)
 * @param anio        año de radicación
 * @param consecutivo consecutivo del proceso
 */
export function generarRadicado(
  depto: string,
  ciudad: string,
  anio: number,
  consecutivo: number,
): string {
  const dd = pad(depto, 2);
  const codCiudad = CODIGOS_CIUDAD[ciudad.toLowerCase().trim()] ?? pad(ciudad, 3);
  const mmm = pad(codCiudad, 3);
  // Despacho: Juzgado Civil Municipal (genérico para demo) — 4 dígitos.
  const despacho = "3189";
  // Especialidad / clase de proceso: 40 = acción de tutela (genérico demo) — 2 dígitos.
  const especialidad = "40";
  const yyyy = pad(anio, 4);
  const nnnnn = pad(consecutivo, 5);
  // Instancia + control: 00 (primera instancia) — 3 dígitos para completar 23.
  const instancia = "000";

  const radicado = `${dd}${mmm}${despacho}${especialidad}${yyyy}${nnnnn}${instancia}`;
  // Garantiza exactamente 23 dígitos.
  return radicado.padEnd(23, "0").slice(0, 23);
}

/** Formatea un radicado de 23 dígitos en grupos legibles para UI. */
export function formatearRadicado(radicado: string): string {
  const r = radicado.replace(/\D/g, "").padEnd(23, "0").slice(0, 23);
  // DD MMM EEEE OO YYYY NNNNN III
  return `${r.slice(0, 2)} ${r.slice(2, 5)} ${r.slice(5, 9)} ${r.slice(9, 11)} ${r.slice(
    11,
    15,
  )} ${r.slice(15, 20)} ${r.slice(20, 23)}`;
}
