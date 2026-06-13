// lib/peticion.ts — Derecho de petición ante la EPS: responsable + reloj SLA.
//
// La ruta "intentar resolver con la EPS" del demandante se formaliza como un
// DERECHO DE PETICIÓN (art. 23 C.P.; Ley 1755 de 2015), que obliga a la entidad
// a responder de fondo dentro de un término perentorio:
//
//   - General:    15 días hábiles (Ley 1755/2015, art. 14).
//   - Prioritaria: 5 días hábiles para casos de salud que requieren respuesta
//                  pronta (urgencia clínica relevante, sujeto de especial
//                  protección).
//   - Urgencia vital: 48 horas (2 días) cuando está en riesgo la vida o la
//                  integridad (desarrollo jurisprudencial — derecho a la salud).
//
// Este módulo resuelve el RESPONSABLE concreto (entidad + dependencia) y calcula
// el SLA (término, fecha de vencimiento, días restantes y estado).

import type { Caso, PeticionFormal, EstadoPeticion } from "./types";

// --------------------------------------------------------------------------
//  Días hábiles (autocontenido para no acoplar con plazos.ts).
// --------------------------------------------------------------------------

const FESTIVOS_MMDD = new Set<string>([
  "01-01",
  "05-01",
  "07-20",
  "08-07",
  "12-08",
  "12-25",
]);

function esFinDeSemana(d: Date): boolean {
  const day = d.getDay();
  return day === 0 || day === 6;
}

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

/** Cuenta los días hábiles entre `desde` (exclusivo) y `hasta` (inclusivo). */
function diasHabilesEntre(desde: Date, hasta: Date): number {
  if (hasta.getTime() <= desde.getTime()) {
    // hacia atrás: días hábiles ya transcurridos como negativo
    let n = 0;
    const d = new Date(desde.getTime());
    while (d.getTime() > hasta.getTime()) {
      d.setDate(d.getDate() - 1);
      if (esHabil(d)) n++;
    }
    return -n;
  }
  let n = 0;
  const d = new Date(desde.getTime());
  while (d.getTime() < hasta.getTime()) {
    d.setDate(d.getDate() + 1);
    if (esHabil(d)) n++;
  }
  return n;
}

// --------------------------------------------------------------------------
//  Naturaleza de la petición y término aplicable.
// --------------------------------------------------------------------------

export type NaturalezaPeticion = "vital" | "prioritaria" | "general";

export interface SlaPeticion {
  naturaleza: NaturalezaPeticion;
  /** Días concedidos por la norma. */
  dias: number;
  /** ¿Días hábiles (true) o calendario (false)? */
  habiles: boolean;
  /** Fundamento normativo del término. */
  fundamento: string;
}

/**
 * Determina la naturaleza de la petición a partir del caso y el término que la
 * norma concede para responder.
 */
export function slaDePeticion(caso: Caso): SlaPeticion {
  // Urgencia vital → respuesta perentoria de 48 horas (2 días).
  if (caso.urgencia === "vital") {
    return {
      naturaleza: "vital",
      dias: 2,
      habiles: false,
      fundamento:
        "Urgencia vital: respuesta perentoria de 48 horas (derecho a la salud y a la vida).",
    };
  }
  // Prioritaria: urgencia alta o sujeto de especial protección → 5 días hábiles.
  if (caso.urgencia === "alta" || caso.demandante.sujetoEspecialProteccion) {
    return {
      naturaleza: "prioritaria",
      dias: 5,
      habiles: true,
      fundamento:
        "Petición prioritaria en salud: respuesta dentro de 5 días hábiles (Ley 1755 de 2015 y reglas del SGSSS).",
    };
  }
  // General → 15 días hábiles.
  return {
    naturaleza: "general",
    dias: 15,
    habiles: true,
    fundamento:
      "Término general del derecho de petición: 15 días hábiles (art. 14, Ley 1755 de 2015).",
  };
}

/**
 * Resuelve la dependencia interna de la EPS responsable de responder, según el
 * tipo de servicio negado.
 */
export function dependenciaResponsable(caso: Caso): string {
  const eps = caso.demandado.nombre;
  switch (caso.tipoServicio) {
    case "medicamento":
    case "insumo_dispositivo":
      return `Dirección de Aseguramiento · Auditoría de Medicamentos y Tecnologías de ${eps}`;
    case "cirugia":
    case "examen_diagnostico":
    case "consulta_especialista":
      return `Dirección de Aseguramiento · Auditoría Médica y Autorizaciones de ${eps}`;
    case "tratamiento":
    case "terapia":
      return `Dirección de Gestión del Riesgo en Salud · Auditoría Médica de ${eps}`;
    case "traslado_ambulancia":
      return `Coordinación de Red y Referencia · Auditoría Médica de ${eps}`;
    default:
      return `Oficina de Atención al Afiliado · Auditoría Médica de ${eps}`;
  }
}

// --------------------------------------------------------------------------
//  Radicado de la petición (no judicial) y reloj.
// --------------------------------------------------------------------------

/** Radicado interno legible para la petición, p.ej. "DP-2026-000412". */
export function radicarPeticion(caso: Caso, fecha: Date): string {
  const anio = fecha.getFullYear();
  // Consecutivo derivado del id del caso, estable entre renders.
  const num = Array.from(caso.id).reduce(
    (acc, ch) => (acc * 31 + ch.charCodeAt(0)) % 1000000,
    7,
  );
  return `DP-${anio}-${String(num).padStart(6, "0")}`;
}

export interface RelojPeticion {
  /** Días restantes hasta el vencimiento (negativo = vencida). */
  diasRestantes: number;
  /** ¿El término está vencido? */
  vencida: boolean;
  /** Estado semafórico del reloj. */
  semaforo: "vencido" | "critico" | "proximo" | "ok";
  /** Texto legible, p.ej. "Vence en 3 días hábiles". */
  etiqueta: string;
}

/**
 * Calcula el reloj del SLA de una petición ya construida, respecto a `ahora`.
 */
export function relojPeticion(
  peticion: PeticionFormal,
  ahora: Date = new Date(),
): RelojPeticion {
  const vence = new Date(peticion.slaVence);
  const habiles = peticion.slaHabiles ?? true;

  let diasRestantes: number;
  if (habiles) {
    diasRestantes = diasHabilesEntre(ahora, vence);
  } else {
    const ms = vence.getTime() - ahora.getTime();
    diasRestantes = Math.ceil(ms / (1000 * 60 * 60 * 24));
  }

  const vencida = vence.getTime() < ahora.getTime();
  const unidad = habiles ? "hábiles" : "calendario";

  let semaforo: RelojPeticion["semaforo"];
  if (vencida) semaforo = "vencido";
  else if (diasRestantes <= 1) semaforo = "critico";
  else if (diasRestantes <= 3) semaforo = "proximo";
  else semaforo = "ok";

  const etiqueta = vencida
    ? `Término vencido hace ${Math.abs(diasRestantes)} día(s) ${unidad}`
    : diasRestantes <= 0
      ? "Vence hoy"
      : `Vence en ${diasRestantes} día(s) ${unidad}`;

  return { diasRestantes, vencida, semaforo, etiqueta };
}

/**
 * Construye el derecho de petición formal para un caso: responsable concreto,
 * dependencia, radicado y reloj de SLA con fecha de vencimiento.
 *
 * @param caso  El caso del que se deriva la petición.
 * @param fecha Fecha de radicación (por defecto, ahora).
 */
export function construirPeticion(
  caso: Caso,
  fecha: Date = new Date(),
): PeticionFormal {
  const sla = slaDePeticion(caso);
  const vence = sla.habiles
    ? sumarDiasHabiles(fecha, sla.dias)
    : new Date(fecha.getTime() + sla.dias * 24 * 60 * 60 * 1000);

  const peticion: PeticionFormal = {
    responsable: caso.demandado.nombre,
    dependencia: dependenciaResponsable(caso),
    radicadoPeticion: radicarPeticion(caso, fecha),
    slaDias: sla.dias,
    slaHabiles: sla.habiles,
    slaVence: vence.toISOString(),
    fechaRadicacion: fecha.toISOString(),
    fundamento: sla.fundamento,
    estado: "en_termino",
  };
  return peticion;
}

/**
 * Recalcula el estado de la petición respecto a `ahora`, sin alterar respuestas
 * ya registradas.
 */
export function estadoPeticionAhora(
  peticion: PeticionFormal,
  ahora: Date = new Date(),
): EstadoPeticion {
  if (peticion.estado === "respondida") return "respondida";
  return relojPeticion(peticion, ahora).vencida ? "vencida" : "en_termino";
}
