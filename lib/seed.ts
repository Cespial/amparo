// lib/seed.ts — Datos semilla del demo: 1 caso HÉROE (Amparo) + casos variados.

import type {
  Caso,
  EventoCaso,
  EstadisticaDepartamento,
} from "./types";
import { generarRadicado } from "./radicado";
import { cronogramaTutela } from "./plazos";
import { progresoDeEstado } from "./progreso";
import { buscarSentencias } from "./corpus/retrieval";

/** Construye un evento de timeline. */
function ev(
  id: string,
  fecha: string,
  tipo: EventoCaso["tipo"],
  titulo: string,
  opts: Partial<EventoCaso> = {},
): EventoCaso {
  return { id, fecha, tipo, titulo, ...opts };
}

/** Helper para fechas relativas a una base (días). */
function dias(base: Date, n: number): string {
  const d = new Date(base.getTime());
  d.setDate(d.getDate() + n);
  return d.toISOString();
}

// --- Caso HÉROE: Amparo Restrepo ---

const heroeFechaBase = new Date("2026-06-10T09:00:00.000Z");

const heroe: Caso = {
  id: "caso-amparo-001",
  radicado: generarRadicado("05", "medellin", 2026, 1),
  estado: "INTAKE",
  fechaCreacion: heroeFechaBase.toISOString(),
  fechaBase: heroeFechaBase.toISOString(),
  demandante: {
    nombre: "Amparo Restrepo",
    edad: 68,
    documento: "43.215.678",
    ciudad: "Medellín",
    departamento: "Antioquia",
    codigoDepartamento: "05",
    regimen: "contributivo",
    telefono: "+57 300 000 0000",
    email: "amparo.restrepo@example.co",
    sujetoEspecialProteccion: true,
  },
  demandado: {
    nombre: "EPS Sura",
    tipo: "EPS",
    nit: "800.088.702-2",
  },
  servicioNegado: "Artroplastia total de cadera",
  tipoServicio: "cirugia",
  diagnostico: "Coxartrosis severa de cadera derecha (M16.1)",
  hechos:
    "La señora Amparo Restrepo, de 68 años, padece coxartrosis severa que le causa dolor incapacitante y limitación funcional. Su médico tratante ordenó una artroplastia total de cadera. La EPS Sura no ha autorizado el procedimiento alegando trámites de pertinencia, pese a la prescripción y al deterioro progresivo de la paciente.",
  pretension:
    "Que se ordene a la EPS Sura autorizar y practicar de manera oportuna la artroplastia total de cadera prescrita por el médico tratante, junto con la atención integral del postoperatorio.",
  urgencia: "alta",
  esPBS: true,
  derechosInvocados: ["salud", "vida digna", "seguridad social"],
  cronograma: cronogramaTutela(heroeFechaBase),
  progreso: progresoDeEstado("INTAKE"),
  sentenciasAplicables: buscarSentencias(
    "cirugía artroplastia cadera demorada negada adulto mayor médico tratante oportunidad",
    4,
  ),
  timeline: [
    ev("h-1", heroeFechaBase.toISOString(), "creacion", "Caso recibido en Amparo", {
      estado: "INTAKE",
      actor: "demandante",
      detalle:
        "Ingreso del caso al centro de resolución de disputas en salud. Se inicia recolección de hechos.",
    }),
    ev("h-2", dias(heroeFechaBase, 0), "ia", "Estructuración asistida por IA", {
      actor: "sistema",
      detalle:
        "El estructurador identifica tipo de servicio (cirugía), diagnóstico y derechos invocados.",
    }),
  ],
};

// --- Caso 2: Medicamento de alto costo negado ---

const c2Base = new Date("2026-05-20T10:00:00.000Z");
const caso2: Caso = {
  id: "caso-jaramillo-002",
  radicado: generarRadicado("11", "bogota", 2026, 245),
  estado: "EN_NEGOCIACION_EPS",
  fechaCreacion: c2Base.toISOString(),
  fechaBase: c2Base.toISOString(),
  demandante: {
    nombre: "Carlos Jaramillo Vélez",
    edad: 54,
    documento: "79.554.120",
    ciudad: "Bogotá",
    departamento: "Bogotá D.C.",
    codigoDepartamento: "11",
    regimen: "contributivo",
    sujetoEspecialProteccion: true,
  },
  demandado: { nombre: "Nueva EPS", tipo: "EPS", nit: "900.156.264-2" },
  servicioNegado: "Pembrolizumab (medicamento oncológico de alto costo)",
  tipoServicio: "medicamento",
  diagnostico: "Carcinoma pulmonar no microcítico avanzado (C34.9)",
  hechos:
    "El paciente, diagnosticado con cáncer de pulmón avanzado, requiere un medicamento biológico de alto costo no financiado con la UPC. La EPS negó el suministro argumentando que no está incluido en el plan de beneficios, pese a la prescripción del oncólogo tratante por Mipres.",
  pretension:
    "Ordenar el suministro inmediato e ininterrumpido del medicamento prescrito y la atención integral del tratamiento oncológico.",
  urgencia: "vital",
  esPBS: false,
  derechosInvocados: ["salud", "vida", "mínimo vital"],
  cronograma: cronogramaTutela(c2Base),
  progreso: progresoDeEstado("EN_NEGOCIACION_EPS"),
  sentenciasAplicables: buscarSentencias(
    "medicamento alto costo no financiado UPC oncológico vida prescripción Mipres",
    4,
  ),
  timeline: [
    ev("c2-1", c2Base.toISOString(), "creacion", "Caso recibido", {
      estado: "INTAKE",
      actor: "demandante",
    }),
    ev("c2-2", dias(c2Base, 1), "ia", "Triaje de admisibilidad", {
      actor: "sistema",
      estado: "TRIADO",
      detalle: "Caso admisible. Sujeto de especial protección, urgencia vital.",
    }),
    ev("c2-3", dias(c2Base, 3), "estado", "Apertura de negociación con la EPS", {
      actor: "sistema",
      estado: "EN_NEGOCIACION_EPS",
    }),
  ],
};

// --- Caso 3: Examen diagnóstico demorado ---

const c3Base = new Date("2026-06-01T08:30:00.000Z");
const caso3: Caso = {
  id: "caso-mosquera-003",
  radicado: generarRadicado("76", "cali", 2026, 88),
  estado: "TRIADO",
  fechaCreacion: c3Base.toISOString(),
  fechaBase: c3Base.toISOString(),
  demandante: {
    nombre: "Luz Marina Mosquera",
    edad: 41,
    documento: "31.998.450",
    ciudad: "Cali",
    departamento: "Valle del Cauca",
    codigoDepartamento: "76",
    regimen: "subsidiado",
  },
  demandado: { nombre: "EPS Coosalud", tipo: "EPS", nit: "900.226.715-3" },
  servicioNegado: "Resonancia magnética cerebral con contraste",
  tipoServicio: "examen_diagnostico",
  diagnostico: "Cefalea persistente en estudio (R51) — descartar masa intracraneal",
  hechos:
    "La paciente presenta cefalea persistente y su neurólogo ordenó una resonancia magnética cerebral. La EPS ha demorado más de 30 días la autorización del examen, impidiendo el diagnóstico oportuno de su condición.",
  pretension:
    "Ordenar la práctica inmediata de la resonancia magnética y las valoraciones derivadas para definir el diagnóstico y tratamiento.",
  urgencia: "media",
  esPBS: true,
  derechosInvocados: ["salud", "integridad personal"],
  cronograma: cronogramaTutela(c3Base),
  progreso: progresoDeEstado("TRIADO"),
  sentenciasAplicables: buscarSentencias(
    "examen diagnóstico resonancia demorada derecho al diagnóstico oportuno autorización",
    4,
  ),
  timeline: [
    ev("c3-1", c3Base.toISOString(), "creacion", "Caso recibido", {
      estado: "INTAKE",
      actor: "demandante",
    }),
    ev("c3-2", dias(c3Base, 1), "ia", "Triaje de admisibilidad", {
      actor: "sistema",
      estado: "TRIADO",
      detalle: "Admisible. Derecho al diagnóstico oportuno comprometido.",
    }),
  ],
};

// --- Caso 4: Traslado / ambulancia ---

const c4Base = new Date("2026-05-28T14:00:00.000Z");
const caso4: Caso = {
  id: "caso-payan-004",
  radicado: generarRadicado("27", "monteria", 2026, 12),
  estado: "ESCALADO_TUTELA",
  fechaCreacion: c4Base.toISOString(),
  fechaBase: c4Base.toISOString(),
  demandante: {
    nombre: "José Domingo Payán",
    edad: 73,
    documento: "6.812.339",
    ciudad: "Quibdó",
    departamento: "Chocó",
    codigoDepartamento: "27",
    regimen: "subsidiado",
    sujetoEspecialProteccion: true,
  },
  demandado: { nombre: "EPS Savia Salud", tipo: "EPS", nit: "900.604.350-0" },
  servicioNegado: "Traslado en ambulancia medicalizada intermunicipal",
  tipoServicio: "traslado_ambulancia",
  diagnostico: "Insuficiencia renal crónica terminal (N18.6) en hemodiálisis",
  hechos:
    "El paciente, en hemodiálisis tres veces por semana, vive en zona rural apartada y carece de recursos para trasladarse a la unidad renal en otra ciudad. La EPS negó el transporte, poniendo en riesgo la continuidad de su tratamiento vital.",
  pretension:
    "Ordenar el transporte del paciente (y acompañante cuando proceda) hacia la unidad renal para garantizar la continuidad de la hemodiálisis.",
  urgencia: "vital",
  esPBS: false,
  derechosInvocados: ["salud", "vida", "vida digna"],
  cronograma: cronogramaTutela(c4Base),
  progreso: progresoDeEstado("ESCALADO_TUTELA"),
  sentenciasAplicables: buscarSentencias(
    "transporte traslado ambulancia paciente sin recursos acceso continuidad tratamiento renal",
    4,
  ),
  timeline: [
    ev("c4-1", c4Base.toISOString(), "creacion", "Caso recibido", {
      estado: "INTAKE",
      actor: "demandante",
    }),
    ev("c4-2", dias(c4Base, 1), "ia", "Triaje de admisibilidad", {
      actor: "sistema",
      estado: "TRIADO",
    }),
    ev("c4-3", dias(c4Base, 2), "estado", "Negociación con EPS sin acuerdo", {
      actor: "eps",
      estado: "EN_NEGOCIACION_EPS",
      detalle: "La EPS mantuvo la negativa. Se escala a tutela.",
    }),
    ev("c4-4", dias(c4Base, 3), "documento", "Tutela presentada", {
      actor: "demandante",
      estado: "ESCALADO_TUTELA",
      detalle: "Se radica acción de tutela ante juez de reparto.",
    }),
  ],
};

// --- Caso 5: Tratamiento NO-PBS (terapias / rehabilitación) ---

const c5Base = new Date("2026-04-15T11:00:00.000Z");
const caso5: Caso = {
  id: "caso-renteria-005",
  radicado: generarRadicado("08", "barranquilla", 2026, 301),
  estado: "FALLADO",
  fechaCreacion: c5Base.toISOString(),
  fechaBase: c5Base.toISOString(),
  demandante: {
    nombre: "Sofía Rentería (menor, repr. por madre)",
    edad: 7,
    documento: "TI 1.045.667.220",
    ciudad: "Barranquilla",
    departamento: "Atlántico",
    codigoDepartamento: "08",
    regimen: "contributivo",
    sujetoEspecialProteccion: true,
  },
  demandado: { nombre: "EPS Famisanar", tipo: "EPS", nit: "830.003.564-7" },
  servicioNegado: "Terapias integrales de neurodesarrollo (no incluidas en PBS)",
  tipoServicio: "terapia",
  diagnostico: "Trastorno del espectro autista (F84.0)",
  hechos:
    "La menor requiere un programa integral de terapias de neurodesarrollo (fonoaudiología, ocupacional, ABA) no financiado con la UPC. La EPS negó parte de las terapias. Por tratarse de una niña, se aplica protección reforzada.",
  pretension:
    "Ordenar el tratamiento integral de neurodesarrollo prescrito, incluyendo todas las terapias requeridas para el desarrollo de la menor.",
  urgencia: "alta",
  esPBS: false,
  derechosInvocados: ["salud", "niñez", "vida digna"],
  cronograma: cronogramaTutela(c5Base),
  progreso: progresoDeEstado("FALLADO"),
  sentenciasAplicables: buscarSentencias(
    "niñez protección reforzada terapias integrales no PBS neurodesarrollo tratamiento integral menor",
    4,
  ),
  timeline: [
    ev("c5-1", c5Base.toISOString(), "creacion", "Caso recibido", {
      estado: "INTAKE",
      actor: "demandante",
    }),
    ev("c5-2", dias(c5Base, 1), "ia", "Triaje de admisibilidad", {
      actor: "sistema",
      estado: "TRIADO",
    }),
    ev("c5-3", dias(c5Base, 4), "documento", "Tutela presentada", {
      actor: "demandante",
      estado: "ESCALADO_TUTELA",
    }),
    ev("c5-4", dias(c5Base, 8), "estado", "En despacho judicial", {
      actor: "juez",
      estado: "EN_DESPACHO",
    }),
    ev("c5-5", dias(c5Base, 14), "fallo", "Fallo a favor del accionante", {
      actor: "juez",
      estado: "FALLADO",
      detalle:
        "El juez ampara los derechos de la menor y ordena el tratamiento integral de neurodesarrollo.",
    }),
  ],
};

/** Catálogo completo de casos del demo. */
export const casosSeed: Caso[] = [heroe, caso2, caso3, caso4, caso5];

/** Id del caso héroe (Amparo Restrepo). */
export const heroeId = heroe.id;

/**
 * Estadísticas ilustrativas de tutelas en salud por departamento.
 * VALORES ILUSTRATIVOS / NO OFICIALES — únicamente para visualización del Atlas.
 */
export const estadisticasDepartamentos: EstadisticaDepartamento[] = [
  { codigo: "05", nombre: "Antioquia", totalTutelas: 92340, tasaPor10k: 138, porcentajeFavorable: 81, ilustrativo: true },
  { codigo: "11", nombre: "Bogotá D.C.", totalTutelas: 110210, tasaPor10k: 142, porcentajeFavorable: 79, ilustrativo: true },
  { codigo: "76", nombre: "Valle del Cauca", totalTutelas: 64120, tasaPor10k: 152, porcentajeFavorable: 83, ilustrativo: true },
  { codigo: "08", nombre: "Atlántico", totalTutelas: 41880, tasaPor10k: 158, porcentajeFavorable: 84, ilustrativo: true },
  { codigo: "68", nombre: "Santander", totalTutelas: 38760, tasaPor10k: 168, porcentajeFavorable: 82, ilustrativo: true },
  { codigo: "13", nombre: "Bolívar", totalTutelas: 33450, tasaPor10k: 153, porcentajeFavorable: 80, ilustrativo: true },
  { codigo: "66", nombre: "Risaralda", totalTutelas: 18920, tasaPor10k: 196, porcentajeFavorable: 85, ilustrativo: true },
  { codigo: "54", nombre: "Norte de Santander", totalTutelas: 24310, tasaPor10k: 172, porcentajeFavorable: 81, ilustrativo: true },
  { codigo: "27", nombre: "Chocó", totalTutelas: 8910, tasaPor10k: 174, porcentajeFavorable: 86, ilustrativo: true },
  { codigo: "23", nombre: "Córdoba", totalTutelas: 21540, tasaPor10k: 118, porcentajeFavorable: 80, ilustrativo: true },
  { codigo: "50", nombre: "Meta", totalTutelas: 15220, tasaPor10k: 142, porcentajeFavorable: 82, ilustrativo: true },
  { codigo: "17", nombre: "Caldas", totalTutelas: 16880, tasaPor10k: 168, porcentajeFavorable: 84, ilustrativo: true },
];
