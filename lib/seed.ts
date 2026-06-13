// lib/seed.ts — Datos semilla del demo: 1 caso HÉROE (Amparo) + casos variados.

import type {
  Caso,
  EventoCaso,
  EstadisticaDepartamento,
  Demandante,
  Demandado,
  EstadoCaso,
  TipoServicio,
  Urgencia,
  DerechoFundamental,
} from "./types";
import { generarRadicado } from "./radicado";
import { cronogramaTutela } from "./plazos";
import { progresoDeEstado } from "./progreso";
import { construirPeticion } from "./peticion";
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
// Derecho de petición de urgencia vital, radicado de forma reciente: el reloj de
// 48 horas corre y es crítico para la bandeja del demandado.
caso2.peticion = construirPeticion(
  caso2,
  new Date("2026-06-12T09:00:00.000Z"),
);

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

// =====================================================================
//  CASOS HISTÓRICOS — dan cuerpo a los contadores de impacto.
//  Generados con un constructor compacto para mantener consistencia.
//  Distribución objetivo:
//    EN_NEGOCIACION_EPS (bandeja EPS):     5
//    ESCALADO_TUTELA / EN_DESPACHO (juez): 6
//    RESUELTO_EPS (acuerdo sin juez):      8
//    FALLADO (sentencia):                  5
// =====================================================================

interface SemillaHistorica {
  id: string;
  estado: EstadoCaso;
  /** Días hacia atrás respecto a "hoy" para la fecha base del caso. */
  haceDias: number;
  ciudadCod: string; // clave de CODIGOS_CIUDAD o código de 3 dígitos
  consecutivo: number;
  demandante: Demandante;
  demandado: Demandado;
  servicioNegado: string;
  tipoServicio: TipoServicio;
  diagnostico: string;
  hechos: string;
  pretension: string;
  urgencia: Urgencia;
  esPBS: boolean;
  derechosInvocados: DerechoFundamental[];
  /** Consulta para recuperar precedente del corpus. */
  consultaCorpus: string;
}

const HOY = new Date("2026-06-13T09:00:00.000Z");

/**
 * Construye la línea de tiempo coherente con el estado final, encadenando los
 * hitos del flujo ODR a partir de la fecha base.
 */
function timelineDeEstado(
  id: string,
  estado: EstadoCaso,
  base: Date,
  servicio: string,
  eps: string,
): EventoCaso[] {
  const t: EventoCaso[] = [
    ev(`${id}-1`, base.toISOString(), "creacion", "Caso recibido en Amparo", {
      estado: "INTAKE",
      actor: "demandante",
      detalle: "Ingreso del caso al centro de resolución de disputas en salud.",
    }),
    ev(`${id}-2`, dias(base, 1), "ia", "Triaje de admisibilidad", {
      estado: "TRIADO",
      actor: "sistema",
      detalle: "Caso admisible. Se identifican derechos invocados y precedente.",
    }),
  ];
  if (estado === "TRIADO" || estado === "INTAKE") return t;

  // Todos los demás estados pasan por negociación con la EPS.
  t.push(
    ev(`${id}-3`, dias(base, 2), "estado", "Apertura de negociación con la EPS", {
      estado: "EN_NEGOCIACION_EPS",
      actor: "sistema",
      detalle: `Se traslada la reclamación a ${eps} para resolver sin juez.`,
    }),
  );
  if (estado === "EN_NEGOCIACION_EPS") return t;

  if (estado === "RESUELTO_EPS") {
    t.push(
      ev(`${id}-4`, dias(base, 4), "estado", "EPS autoriza el servicio (acuerdo sin juez)", {
        estado: "RESUELTO_EPS",
        actor: "eps",
        detalle: `${eps} cede tras el análisis de costo/riesgo y autoriza ${servicio}. Caso resuelto sin acudir al juez.`,
      }),
    );
    return t;
  }

  // Vía judicial: ESCALADO_TUTELA, EN_DESPACHO o FALLADO.
  t.push(
    ev(`${id}-4`, dias(base, 3), "estado", "EPS mantiene la negación", {
      estado: "EN_NEGOCIACION_EPS",
      actor: "eps",
      detalle: "Sin acuerdo. El demandante queda habilitado para escalar a tutela.",
    }),
    ev(`${id}-5`, dias(base, 4), "documento", "Tutela radicada", {
      estado: "ESCALADO_TUTELA",
      actor: "demandante",
      detalle: "Se radica la acción de tutela ante el juez de reparto.",
    }),
  );
  if (estado === "ESCALADO_TUTELA") return t;

  t.push(
    ev(`${id}-6`, dias(base, 5), "estado", "Avocado conocimiento — en despacho", {
      estado: "EN_DESPACHO",
      actor: "juez",
      detalle: "El despacho avoca conocimiento y corre traslado a la accionada.",
    }),
  );
  if (estado === "EN_DESPACHO") return t;

  // FALLADO
  t.push(
    ev(`${id}-7`, dias(base, 9), "fallo", "Fallo a favor del accionante", {
      estado: "FALLADO",
      actor: "juez",
      detalle: `Se TUTELAN los derechos invocados y se ordena a ${eps} garantizar ${servicio}.`,
    }),
  );
  return t;
}

/** Construye un Caso histórico completo a partir de una semilla compacta. */
function casoHistorico(s: SemillaHistorica): Caso {
  const base = new Date(HOY.getTime());
  base.setDate(base.getDate() - s.haceDias);
  const caso: Caso = {
    id: s.id,
    radicado: generarRadicado(
      s.demandante.codigoDepartamento,
      s.ciudadCod,
      base.getFullYear(),
      s.consecutivo,
    ),
    estado: s.estado,
    fechaCreacion: base.toISOString(),
    fechaBase: base.toISOString(),
    demandante: s.demandante,
    demandado: s.demandado,
    servicioNegado: s.servicioNegado,
    tipoServicio: s.tipoServicio,
    diagnostico: s.diagnostico,
    hechos: s.hechos,
    pretension: s.pretension,
    urgencia: s.urgencia,
    esPBS: s.esPBS,
    derechosInvocados: s.derechosInvocados,
    cronograma: cronogramaTutela(base),
    progreso: progresoDeEstado(s.estado),
    sentenciasAplicables: buscarSentencias(s.consultaCorpus, 4),
    timeline: timelineDeEstado(
      s.id,
      s.estado,
      base,
      s.servicioNegado,
      s.demandado.nombre,
    ),
  };

  // Los casos en negociación llevan un derecho de petición con el reloj de SLA
  // corriendo, radicado el día siguiente a la apertura de la negociación (día 2).
  if (s.estado === "EN_NEGOCIACION_EPS") {
    const radicacion = new Date(base.getTime());
    radicacion.setDate(radicacion.getDate() + 2);
    caso.peticion = construirPeticion(caso, radicacion);
  }

  return caso;
}

const SEMILLAS_HISTORICAS: SemillaHistorica[] = [
  // ---- EN_NEGOCIACION_EPS (5) → bandeja del demandado ----
  {
    id: "caso-hurtado-101",
    estado: "EN_NEGOCIACION_EPS",
    haceDias: 6,
    ciudadCod: "bucaramanga",
    consecutivo: 412,
    demandante: {
      nombre: "Gloria Inés Hurtado",
      edad: 62,
      documento: "63.345.901",
      ciudad: "Bucaramanga",
      departamento: "Santander",
      codigoDepartamento: "68",
      regimen: "contributivo",
      sujetoEspecialProteccion: true,
    },
    demandado: { nombre: "Nueva EPS", tipo: "EPS", nit: "900.156.264-2" },
    servicioNegado: "Insulina glargina y tiras reactivas (suministro continuo)",
    tipoServicio: "medicamento",
    diagnostico: "Diabetes mellitus tipo 2 insulinodependiente (E11.9)",
    hechos:
      "La paciente requiere insulina glargina y tiras reactivas de forma continua para controlar su diabetes. La EPS ha entregado el insumo de manera intermitente, generando descompensaciones y riesgo para su salud.",
    pretension:
      "Ordenar el suministro continuo e ininterrumpido de la insulina y los insumos prescritos por el médico tratante.",
    urgencia: "alta",
    esPBS: true,
    derechosInvocados: ["salud", "vida digna"],
    consultaCorpus:
      "suministro continuo medicamento crónico insulina diabetes entrega intermitente derecho a la salud",
  },
  {
    id: "caso-quintero-102",
    estado: "EN_NEGOCIACION_EPS",
    haceDias: 5,
    ciudadCod: "pereira",
    consecutivo: 77,
    demandante: {
      nombre: "Andrés Felipe Quintero",
      edad: 34,
      documento: "1.088.234.556",
      ciudad: "Pereira",
      departamento: "Risaralda",
      codigoDepartamento: "66",
      regimen: "contributivo",
    },
    demandado: { nombre: "EPS Sanitas", tipo: "EPS", nit: "800.251.440-6" },
    servicioNegado: "Cirugía de reconstrucción de ligamento cruzado anterior",
    tipoServicio: "cirugia",
    diagnostico: "Ruptura completa de LCA rodilla izquierda (S83.5)",
    hechos:
      "El paciente sufrió ruptura del ligamento cruzado anterior y el ortopedista ordenó cirugía reconstructiva. La EPS ha demorado la autorización más de un mes, prolongando la incapacidad laboral y el dolor.",
    pretension:
      "Ordenar la autorización y práctica oportuna de la cirugía reconstructiva de ligamento prescrita.",
    urgencia: "media",
    esPBS: true,
    derechosInvocados: ["salud", "integridad personal"],
    consultaCorpus:
      "cirugía ortopédica demorada autorización oportuna ligamento rodilla incapacidad",
  },
  {
    id: "caso-balanta-103",
    estado: "EN_NEGOCIACION_EPS",
    haceDias: 4,
    ciudadCod: "cali",
    consecutivo: 503,
    demandante: {
      nombre: "Yurani Balanta Carabalí",
      edad: 29,
      documento: "1.144.090.812",
      ciudad: "Cali",
      departamento: "Valle del Cauca",
      codigoDepartamento: "76",
      regimen: "subsidiado",
    },
    demandado: { nombre: "EPS Coosalud", tipo: "EPS", nit: "900.226.715-3" },
    servicioNegado: "Ecografía obstétrica de detalle y controles de alto riesgo",
    tipoServicio: "examen_diagnostico",
    diagnostico: "Embarazo de alto riesgo (O09.9) con antecedente de preeclampsia",
    hechos:
      "La gestante con embarazo de alto riesgo requiere ecografía de detalle y controles especializados. La EPS ha negado la red de atención adecuada, exponiendo a la madre y al feto.",
    pretension:
      "Ordenar la atención integral del embarazo de alto riesgo, incluyendo ecografías y controles especializados.",
    urgencia: "alta",
    esPBS: true,
    derechosInvocados: ["salud", "vida", "seguridad social"],
    consultaCorpus:
      "embarazo alto riesgo atención integral gestante controles especializados protección madre",
  },
  {
    id: "caso-ospina-104",
    estado: "EN_NEGOCIACION_EPS",
    haceDias: 5,
    ciudadCod: "medellin",
    consecutivo: 821,
    demandante: {
      nombre: "Rubén Darío Ospina",
      edad: 58,
      documento: "70.556.310",
      ciudad: "Medellín",
      departamento: "Antioquia",
      codigoDepartamento: "05",
      regimen: "contributivo",
    },
    demandado: { nombre: "EPS Sura", tipo: "EPS", nit: "800.088.702-2" },
    servicioNegado: "Marcapasos cardíaco e implante",
    tipoServicio: "insumo_dispositivo",
    diagnostico: "Bloqueo auriculoventricular completo (I44.2)",
    hechos:
      "El paciente presenta bloqueo cardíaco completo con riesgo de síncope y el cardiólogo ordenó el implante de marcapasos. La EPS condicionó la autorización a trámites de auditoría que han retrasado el procedimiento.",
    pretension:
      "Ordenar el implante oportuno del marcapasos y la atención integral cardiológica derivada.",
    urgencia: "vital",
    esPBS: true,
    derechosInvocados: ["salud", "vida", "integridad personal"],
    consultaCorpus:
      "dispositivo médico marcapasos implante riesgo vital cardiología autorización auditoría",
  },
  {
    id: "caso-cuesta-105",
    estado: "EN_NEGOCIACION_EPS",
    haceDias: 3,
    ciudadCod: "quibdo",
    consecutivo: 19,
    demandante: {
      nombre: "Eulalia Cuesta Mosquera",
      edad: 47,
      documento: "35.890.221",
      ciudad: "Quibdó",
      departamento: "Chocó",
      codigoDepartamento: "27",
      regimen: "subsidiado",
    },
    demandado: { nombre: "EPS Mutual Ser", tipo: "EPS", nit: "806.008.394-1" },
    servicioNegado: "Quimioterapia y red oncológica de referencia",
    tipoServicio: "tratamiento",
    diagnostico: "Carcinoma de mama (C50.9) en estadio II",
    hechos:
      "La paciente, diagnosticada con cáncer de mama, requiere quimioterapia en una red oncológica que no existe en su municipio. La EPS no ha garantizado el traslado ni la atención en la ciudad de referencia.",
    pretension:
      "Ordenar la atención oncológica integral, incluyendo quimioterapia y el traslado a la red de referencia.",
    urgencia: "vital",
    esPBS: true,
    derechosInvocados: ["salud", "vida", "vida digna"],
    consultaCorpus:
      "cáncer mama quimioterapia red oncológica traslado atención integral zona apartada",
  },

  // ---- ESCALADO_TUTELA / EN_DESPACHO (6) → cola del juez ----
  {
    id: "caso-arboleda-106",
    estado: "ESCALADO_TUTELA",
    haceDias: 8,
    ciudadCod: "bogota",
    consecutivo: 1340,
    demandante: {
      nombre: "Martha Lucía Arboleda",
      edad: 71,
      documento: "41.667.220",
      ciudad: "Bogotá",
      departamento: "Bogotá D.C.",
      codigoDepartamento: "11",
      regimen: "contributivo",
      sujetoEspecialProteccion: true,
    },
    demandado: { nombre: "EPS Salud Total", tipo: "EPS", nit: "800.130.907-4" },
    servicioNegado: "Cirugía de cataratas en ambos ojos",
    tipoServicio: "cirugia",
    diagnostico: "Catarata senil bilateral (H25.0)",
    hechos:
      "La paciente adulta mayor presenta pérdida progresiva de visión por cataratas bilaterales. El oftalmólogo ordenó cirugía y la EPS la negó alegando lista de espera, afectando su autonomía y seguridad.",
    pretension:
      "Ordenar la práctica oportuna de la cirugía de cataratas en ambos ojos prescrita por el especialista.",
    urgencia: "alta",
    esPBS: true,
    derechosInvocados: ["salud", "vida digna"],
    consultaCorpus:
      "cirugía cataratas adulto mayor lista de espera autonomía pérdida visión oportunidad",
  },
  {
    id: "caso-mejia-107",
    estado: "ESCALADO_TUTELA",
    haceDias: 7,
    ciudadCod: "medellin",
    consecutivo: 905,
    demandante: {
      nombre: "Sebastián Mejía Gómez",
      edad: 9,
      documento: "TI 1.045.778.901",
      ciudad: "Medellín",
      departamento: "Antioquia",
      codigoDepartamento: "05",
      regimen: "subsidiado",
      sujetoEspecialProteccion: true,
    },
    demandado: { nombre: "EPS Savia Salud", tipo: "EPS", nit: "900.604.350-0" },
    servicioNegado: "Hormona de crecimiento (medicamento NO-PBS)",
    tipoServicio: "medicamento",
    diagnostico: "Deficiencia de hormona de crecimiento (E23.0)",
    hechos:
      "El menor requiere hormona de crecimiento prescrita por endocrinología pediátrica, no financiada con la UPC. La EPS negó el suministro pese a tratarse de un niño con protección reforzada.",
    pretension:
      "Ordenar el suministro de la hormona de crecimiento y el tratamiento integral prescrito para el menor.",
    urgencia: "alta",
    esPBS: false,
    derechosInvocados: ["salud", "niñez", "vida digna"],
    consultaCorpus:
      "niñez protección reforzada medicamento no PBS hormona crecimiento tratamiento integral menor",
  },
  {
    id: "caso-navarro-108",
    estado: "EN_DESPACHO",
    haceDias: 9,
    ciudadCod: "barranquilla",
    consecutivo: 614,
    demandante: {
      nombre: "Hernando Navarro Polo",
      edad: 66,
      documento: "8.745.112",
      ciudad: "Barranquilla",
      departamento: "Atlántico",
      codigoDepartamento: "08",
      regimen: "contributivo",
      sujetoEspecialProteccion: true,
    },
    demandado: { nombre: "Nueva EPS", tipo: "EPS", nit: "900.156.264-2" },
    servicioNegado: "Oxígeno domiciliario y concentrador",
    tipoServicio: "insumo_dispositivo",
    diagnostico: "EPOC severa con insuficiencia respiratoria crónica (J44.9)",
    hechos:
      "El paciente con EPOC severa requiere oxígeno domiciliario permanente. La EPS suspendió el servicio del concentrador, poniendo en riesgo inminente su vida.",
    pretension:
      "Ordenar el restablecimiento inmediato del oxígeno domiciliario y la atención integral respiratoria.",
    urgencia: "vital",
    esPBS: true,
    derechosInvocados: ["salud", "vida", "vida digna"],
    consultaCorpus:
      "oxígeno domiciliario concentrador suspensión riesgo vital EPOC continuidad servicio",
  },
  {
    id: "caso-tunubala-109",
    estado: "EN_DESPACHO",
    haceDias: 10,
    ciudadCod: "popayan",
    consecutivo: 33,
    demandante: {
      nombre: "Aida Tunubalá",
      edad: 52,
      documento: "25.667.443",
      ciudad: "Popayán",
      departamento: "Cauca",
      codigoDepartamento: "19",
      regimen: "subsidiado",
      sujetoEspecialProteccion: true,
    },
    demandado: { nombre: "EPS Mutual Ser", tipo: "EPS", nit: "806.008.394-1" },
    servicioNegado: "Prótesis de miembro inferior y rehabilitación",
    tipoServicio: "insumo_dispositivo",
    diagnostico: "Amputación transtibial por pie diabético (Z89.5)",
    hechos:
      "La paciente perdió su pierna por complicaciones de diabetes y requiere prótesis y rehabilitación para recuperar su movilidad. La EPS negó la prótesis funcional argumentando que no estaba cubierta.",
    pretension:
      "Ordenar el suministro de la prótesis funcional y el programa de rehabilitación integral.",
    urgencia: "media",
    esPBS: false,
    derechosInvocados: ["salud", "vida digna", "igualdad"],
    consultaCorpus:
      "prótesis miembro inferior rehabilitación funcional discapacidad no PBS vida digna",
  },
  {
    id: "caso-gaviria-110",
    estado: "ESCALADO_TUTELA",
    haceDias: 6,
    ciudadCod: "manizales",
    consecutivo: 58,
    demandante: {
      nombre: "Luz Dary Gaviria",
      edad: 44,
      documento: "30.221.778",
      ciudad: "Manizales",
      departamento: "Caldas",
      codigoDepartamento: "17",
      regimen: "contributivo",
    },
    demandado: { nombre: "EPS Sanitas", tipo: "EPS", nit: "800.251.440-6" },
    servicioNegado: "Terapias de rehabilitación física (fisioterapia)",
    tipoServicio: "terapia",
    diagnostico: "Secuelas de accidente cerebrovascular (I69.4)",
    hechos:
      "La paciente, tras un ACV, requiere un plan continuo de fisioterapia para recuperar funcionalidad. La EPS autorizó solo unas pocas sesiones e interrumpió el tratamiento.",
    pretension:
      "Ordenar la continuidad del plan de terapias de rehabilitación física prescrito sin interrupciones.",
    urgencia: "media",
    esPBS: true,
    derechosInvocados: ["salud", "vida digna"],
    consultaCorpus:
      "terapias rehabilitación física continuidad ACV interrupción tratamiento integralidad",
  },
  {
    id: "caso-rincon-111",
    estado: "ESCALADO_TUTELA",
    haceDias: 7,
    ciudadCod: "villavicencio",
    consecutivo: 21,
    demandante: {
      nombre: "Wilmar Rincón Ávila",
      edad: 38,
      documento: "86.071.554",
      ciudad: "Villavicencio",
      departamento: "Meta",
      codigoDepartamento: "50",
      regimen: "contributivo",
    },
    demandado: { nombre: "EPS Salud Total", tipo: "EPS", nit: "800.130.907-4" },
    servicioNegado: "Resonancia magnética de columna y valoración por neurocirugía",
    tipoServicio: "examen_diagnostico",
    diagnostico: "Hernia discal lumbar con radiculopatía (M51.1)",
    hechos:
      "El paciente sufre dolor lumbar incapacitante y radiculopatía. El médico ordenó resonancia y valoración por neurocirugía, pero la EPS ha demorado las autorizaciones por más de 45 días.",
    pretension:
      "Ordenar la práctica de la resonancia y la valoración por neurocirugía para definir el tratamiento.",
    urgencia: "media",
    esPBS: true,
    derechosInvocados: ["salud", "integridad personal"],
    consultaCorpus:
      "resonancia columna valoración neurocirugía demora autorización derecho al diagnóstico",
  },

  // ---- RESUELTO_EPS (8) → acuerdo sin juez ----
  {
    id: "caso-bedoya-112",
    estado: "RESUELTO_EPS",
    haceDias: 14,
    ciudadCod: "medellin",
    consecutivo: 660,
    demandante: {
      nombre: "Clara Bedoya Restrepo",
      edad: 60,
      documento: "32.110.998",
      ciudad: "Medellín",
      departamento: "Antioquia",
      codigoDepartamento: "05",
      regimen: "contributivo",
      sujetoEspecialProteccion: true,
    },
    demandado: { nombre: "EPS Sura", tipo: "EPS", nit: "800.088.702-2" },
    servicioNegado: "Rivaroxabán (anticoagulante)",
    tipoServicio: "medicamento",
    diagnostico: "Fibrilación auricular no valvular (I48.0)",
    hechos:
      "La paciente requiere anticoagulante para prevenir un evento embólico. La EPS inicialmente negó el medicamento, pero tras la reclamación de Amparo autorizó el suministro continuo.",
    pretension:
      "Ordenar el suministro continuo del anticoagulante prescrito por cardiología.",
    urgencia: "alta",
    esPBS: true,
    derechosInvocados: ["salud", "vida"],
    consultaCorpus:
      "anticoagulante medicamento continuo fibrilación auricular prevención evento riesgo",
  },
  {
    id: "caso-camargo-113",
    estado: "RESUELTO_EPS",
    haceDias: 16,
    ciudadCod: "bogota",
    consecutivo: 1411,
    demandante: {
      nombre: "Diego Armando Camargo",
      edad: 45,
      documento: "80.221.665",
      ciudad: "Bogotá",
      departamento: "Bogotá D.C.",
      codigoDepartamento: "11",
      regimen: "contributivo",
    },
    demandado: { nombre: "EPS Sanitas", tipo: "EPS", nit: "800.251.440-6" },
    servicioNegado: "Tomografía por emisión de positrones (PET-CT)",
    tipoServicio: "examen_diagnostico",
    diagnostico: "Linfoma en estudio de extensión (C85.9)",
    hechos:
      "El paciente requería un PET-CT para estadificar su linfoma. La EPS demoró la autorización, pero ante el análisis de riesgo accedió a autorizar el examen sin necesidad de tutela.",
    pretension:
      "Ordenar la práctica del PET-CT para la estadificación y el tratamiento oncológico.",
    urgencia: "alta",
    esPBS: true,
    derechosInvocados: ["salud", "vida"],
    consultaCorpus:
      "PET-CT examen diagnóstico oncológico estadificación linfoma autorización oportuna",
  },
  {
    id: "caso-villa-114",
    estado: "RESUELTO_EPS",
    haceDias: 19,
    ciudadCod: "cartagena",
    consecutivo: 240,
    demandante: {
      nombre: "Yenis Villa Ortega",
      edad: 33,
      documento: "1.047.998.220",
      ciudad: "Cartagena",
      departamento: "Bolívar",
      codigoDepartamento: "13",
      regimen: "subsidiado",
    },
    demandado: { nombre: "EPS Coosalud", tipo: "EPS", nit: "900.226.715-3" },
    servicioNegado: "Cesárea programada por riesgo obstétrico",
    tipoServicio: "cirugia",
    diagnostico: "Placenta previa (O44.1)",
    hechos:
      "La gestante con placenta previa requería cesárea programada. La EPS resolvió favorablemente la reclamación y garantizó la atención del parto sin litigio.",
    pretension:
      "Ordenar la programación de la cesárea y la atención integral del parto y el recién nacido.",
    urgencia: "vital",
    esPBS: true,
    derechosInvocados: ["salud", "vida", "niñez"],
    consultaCorpus:
      "cesárea riesgo obstétrico placenta previa atención parto integral gestante",
  },
  {
    id: "caso-londono-115",
    estado: "RESUELTO_EPS",
    haceDias: 21,
    ciudadCod: "pereira",
    consecutivo: 91,
    demandante: {
      nombre: "Gustavo Londoño Ríos",
      edad: 69,
      documento: "10.099.443",
      ciudad: "Pereira",
      departamento: "Risaralda",
      codigoDepartamento: "66",
      regimen: "contributivo",
      sujetoEspecialProteccion: true,
    },
    demandado: { nombre: "Nueva EPS", tipo: "EPS", nit: "900.156.264-2" },
    servicioNegado: "Pañales y suplementos nutricionales (paciente postrado)",
    tipoServicio: "insumo_dispositivo",
    diagnostico: "Secuelas de ACV con dependencia funcional (I69.3)",
    hechos:
      "El paciente postrado requería pañales y suplementos nutricionales. La EPS, tras la reclamación, reconoció el deber de garantizar estos insumos como parte del tratamiento integral.",
    pretension:
      "Ordenar el suministro de pañales y suplementos nutricionales prescritos para el paciente postrado.",
    urgencia: "media",
    esPBS: false,
    derechosInvocados: ["salud", "vida digna", "mínimo vital"],
    consultaCorpus:
      "pañales suplementos nutricionales paciente postrado insumos no PBS tratamiento integral adulto mayor",
  },
  {
    id: "caso-pacheco-116",
    estado: "RESUELTO_EPS",
    haceDias: 12,
    ciudadCod: "cucuta",
    consecutivo: 144,
    demandante: {
      nombre: "Marbel Pacheco Suárez",
      edad: 27,
      documento: "1.090.556.321",
      ciudad: "Cúcuta",
      departamento: "Norte de Santander",
      codigoDepartamento: "54",
      regimen: "subsidiado",
    },
    demandado: { nombre: "EPS Mutual Ser", tipo: "EPS", nit: "806.008.394-1" },
    servicioNegado: "Cirugía de apendicitis (urgencia)",
    tipoServicio: "cirugia",
    diagnostico: "Apendicitis aguda (K35.8)",
    hechos:
      "La paciente acudió por dolor abdominal y se diagnosticó apendicitis aguda. Tras la intervención de Amparo, la EPS autorizó de inmediato la cirugía de urgencia.",
    pretension:
      "Ordenar la atención quirúrgica inmediata de la apendicitis y el postoperatorio.",
    urgencia: "vital",
    esPBS: true,
    derechosInvocados: ["salud", "vida"],
    consultaCorpus:
      "cirugía urgencia apendicitis atención inmediata riesgo vital servicio de salud",
  },
  {
    id: "caso-suarez-117",
    estado: "RESUELTO_EPS",
    haceDias: 23,
    ciudadCod: "monteria",
    consecutivo: 67,
    demandante: {
      nombre: "Ramiro Suárez Petro",
      edad: 55,
      documento: "78.334.210",
      ciudad: "Montería",
      departamento: "Córdoba",
      codigoDepartamento: "23",
      regimen: "subsidiado",
    },
    demandado: { nombre: "EPS Coosalud", tipo: "EPS", nit: "900.226.715-3" },
    servicioNegado: "Diálisis peritoneal e insumos",
    tipoServicio: "tratamiento",
    diagnostico: "Enfermedad renal crónica estadio 5 (N18.5)",
    hechos:
      "El paciente requería diálisis peritoneal continua. La EPS resolvió la reclamación garantizando el tratamiento y los insumos sin acudir a la vía judicial.",
    pretension:
      "Ordenar la continuidad de la diálisis peritoneal y el suministro de insumos.",
    urgencia: "vital",
    esPBS: true,
    derechosInvocados: ["salud", "vida", "vida digna"],
    consultaCorpus:
      "diálisis peritoneal continuidad insumos enfermedad renal crónica tratamiento vital",
  },
  {
    id: "caso-mena-118",
    estado: "RESUELTO_EPS",
    haceDias: 15,
    ciudadCod: "quibdo",
    consecutivo: 24,
    demandante: {
      nombre: "Yeison Mena Palacios",
      edad: 6,
      documento: "RC 1.078.665.443",
      ciudad: "Quibdó",
      departamento: "Chocó",
      codigoDepartamento: "27",
      regimen: "subsidiado",
      sujetoEspecialProteccion: true,
    },
    demandado: { nombre: "EPS Savia Salud", tipo: "EPS", nit: "900.604.350-0" },
    servicioNegado: "Audífonos e implante para hipoacusia",
    tipoServicio: "insumo_dispositivo",
    diagnostico: "Hipoacusia neurosensorial bilateral (H90.3)",
    hechos:
      "El menor con hipoacusia requería audífonos para su desarrollo del lenguaje. La EPS, ante la protección reforzada de la niñez, autorizó el dispositivo sin litigio.",
    pretension:
      "Ordenar el suministro de audífonos y la atención integral auditiva del menor.",
    urgencia: "media",
    esPBS: false,
    derechosInvocados: ["salud", "niñez", "vida digna"],
    consultaCorpus:
      "audífonos hipoacusia niñez desarrollo lenguaje dispositivo no PBS protección reforzada menor",
  },
  {
    id: "caso-rojas-119",
    estado: "RESUELTO_EPS",
    haceDias: 18,
    ciudadCod: "ibague",
    consecutivo: 102,
    demandante: {
      nombre: "Esperanza Rojas Cifuentes",
      edad: 64,
      documento: "38.220.117",
      ciudad: "Ibagué",
      departamento: "Tolima",
      codigoDepartamento: "73",
      regimen: "contributivo",
      sujetoEspecialProteccion: true,
    },
    demandado: { nombre: "EPS Salud Total", tipo: "EPS", nit: "800.130.907-4" },
    servicioNegado: "Medicamento para artritis reumatoide (biológico NO-PBS)",
    tipoServicio: "medicamento",
    diagnostico: "Artritis reumatoide seropositiva (M05.9)",
    hechos:
      "La paciente requería un medicamento biológico para controlar su artritis. La EPS autorizó el suministro tras el análisis de costo/riesgo de Amparo, evitando la tutela.",
    pretension:
      "Ordenar el suministro continuo del medicamento biológico prescrito por reumatología.",
    urgencia: "media",
    esPBS: false,
    derechosInvocados: ["salud", "vida digna"],
    consultaCorpus:
      "medicamento biológico artritis reumatoide no PBS suministro continuo prescripción especialista",
  },

  // ---- FALLADO (5) → sentencias proferidas ----
  {
    id: "caso-cardenas-120",
    estado: "FALLADO",
    haceDias: 28,
    ciudadCod: "bogota",
    consecutivo: 1502,
    demandante: {
      nombre: "Beatriz Cárdenas Mora",
      edad: 74,
      documento: "20.667.880",
      ciudad: "Bogotá",
      departamento: "Bogotá D.C.",
      codigoDepartamento: "11",
      regimen: "contributivo",
      sujetoEspecialProteccion: true,
    },
    demandado: { nombre: "Nueva EPS", tipo: "EPS", nit: "900.156.264-2" },
    servicioNegado: "Cirugía de reemplazo de rodilla",
    tipoServicio: "cirugia",
    diagnostico: "Gonartrosis severa bilateral (M17.0)",
    hechos:
      "La paciente adulta mayor con gonartrosis severa requería reemplazo de rodilla. La EPS sostuvo la negación y el juez tuteló su derecho a la salud, ordenando la cirugía.",
    pretension:
      "Ordenar a la EPS practicar el reemplazo de rodilla y la atención integral del postoperatorio.",
    urgencia: "alta",
    esPBS: true,
    derechosInvocados: ["salud", "vida digna"],
    consultaCorpus:
      "cirugía reemplazo rodilla adulto mayor gonartrosis fallo tutela atención integral",
  },
  {
    id: "caso-zapata-121",
    estado: "FALLADO",
    haceDias: 31,
    ciudadCod: "medellin",
    consecutivo: 712,
    demandante: {
      nombre: "Carolina Zapata Henao",
      edad: 36,
      documento: "43.990.221",
      ciudad: "Medellín",
      departamento: "Antioquia",
      codigoDepartamento: "05",
      regimen: "contributivo",
    },
    demandado: { nombre: "EPS Sura", tipo: "EPS", nit: "800.088.702-2" },
    servicioNegado: "Tratamiento de fertilidad de baja complejidad",
    tipoServicio: "tratamiento",
    diagnostico: "Infertilidad por factor tubárico (N97.1)",
    hechos:
      "La paciente solicitó tratamiento de fertilidad. El juez analizó el precedente y tuteló parcialmente, ordenando los estudios y manejo de baja complejidad relacionados con su salud.",
    pretension:
      "Ordenar la valoración integral y el manejo de baja complejidad de la infertilidad.",
    urgencia: "baja",
    esPBS: false,
    derechosInvocados: ["salud", "vida digna", "igualdad"],
    consultaCorpus:
      "tratamiento fertilidad infertilidad salud reproductiva tutela manejo baja complejidad",
  },
  {
    id: "caso-becerra-122",
    estado: "FALLADO",
    haceDias: 26,
    ciudadCod: "cali",
    consecutivo: 540,
    demandante: {
      nombre: "Omar Becerra Lozano",
      edad: 50,
      documento: "16.778.345",
      ciudad: "Cali",
      departamento: "Valle del Cauca",
      codigoDepartamento: "76",
      regimen: "subsidiado",
    },
    demandado: { nombre: "EPS Coosalud", tipo: "EPS", nit: "900.226.715-3" },
    servicioNegado: "Medicamento antirretroviral (VIH)",
    tipoServicio: "medicamento",
    diagnostico: "Infección por VIH (B24)",
    hechos:
      "El paciente con VIH sufrió interrupciones en la entrega de su antirretroviral. El juez tuteló su derecho a la salud y a la vida, ordenando el suministro continuo e ininterrumpido.",
    pretension:
      "Ordenar el suministro continuo e ininterrumpido del antirretroviral prescrito.",
    urgencia: "alta",
    esPBS: true,
    derechosInvocados: ["salud", "vida", "vida digna"],
    consultaCorpus:
      "antirretroviral VIH suministro continuo interrupción tratamiento fallo tutela vida",
  },
  {
    id: "caso-guerrero-123",
    estado: "FALLADO",
    haceDias: 34,
    ciudadCod: "pasto",
    consecutivo: 48,
    demandante: {
      nombre: "Nelly Guerrero Erazo",
      edad: 59,
      documento: "27.334.901",
      ciudad: "Pasto",
      departamento: "Nariño",
      codigoDepartamento: "52",
      regimen: "subsidiado",
      sujetoEspecialProteccion: true,
    },
    demandado: { nombre: "EPS Mutual Ser", tipo: "EPS", nit: "806.008.394-1" },
    servicioNegado: "Traslado intermunicipal para radioterapia",
    tipoServicio: "traslado_ambulancia",
    diagnostico: "Carcinoma de cuello uterino (C53.9)",
    hechos:
      "La paciente requería traslados frecuentes a otra ciudad para radioterapia y carecía de recursos. El juez tuteló y ordenó a la EPS garantizar el transporte para no interrumpir el tratamiento.",
    pretension:
      "Ordenar el transporte de la paciente y un acompañante hacia el centro de radioterapia.",
    urgencia: "vital",
    esPBS: false,
    derechosInvocados: ["salud", "vida", "vida digna"],
    consultaCorpus:
      "traslado intermunicipal radioterapia paciente sin recursos continuidad tratamiento oncológico fallo",
  },
  {
    id: "caso-moreno-124",
    estado: "FALLADO",
    haceDias: 24,
    ciudadCod: "bucaramanga",
    consecutivo: 455,
    demandante: {
      nombre: "Iván Moreno Castellanos",
      edad: 4,
      documento: "RC 1.099.778.554",
      ciudad: "Bucaramanga",
      departamento: "Santander",
      codigoDepartamento: "68",
      regimen: "contributivo",
      sujetoEspecialProteccion: true,
    },
    demandado: { nombre: "EPS Sanitas", tipo: "EPS", nit: "800.251.440-6" },
    servicioNegado: "Cuidador domiciliario y terapias para parálisis cerebral",
    tipoServicio: "terapia",
    diagnostico: "Parálisis cerebral infantil (G80.9)",
    hechos:
      "El menor con parálisis cerebral requería cuidador domiciliario y terapias integrales. El juez tuteló los derechos de la niñez y ordenó el plan integral de atención.",
    pretension:
      "Ordenar el cuidador domiciliario y el plan integral de terapias para el menor.",
    urgencia: "alta",
    esPBS: false,
    derechosInvocados: ["salud", "niñez", "vida digna"],
    consultaCorpus:
      "cuidador domiciliario parálisis cerebral terapias integrales niñez no PBS tutela protección reforzada",
  },
];

const casosHistoricos: Caso[] = SEMILLAS_HISTORICAS.map(casoHistorico);

/** Catálogo completo de casos del demo. */
export const casosSeed: Caso[] = [
  heroe,
  caso2,
  caso3,
  caso4,
  caso5,
  ...casosHistoricos,
];

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
