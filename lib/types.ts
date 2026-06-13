// lib/types.ts — Modelo de dominio canónico de Amparo
// Plataforma ODR de tutelas de salud de Colombia.
// CONTRATO DE ARQUITECTURA: estos símbolos son consumidos por todos los agentes.

/**
 * Estados del ciclo de vida de un caso en el flujo ODR.
 * Flujo feliz EPS:  INTAKE -> TRIADO -> EN_NEGOCIACION_EPS -> RESUELTO_EPS
 * Flujo judicial:   ... -> ESCALADO_TUTELA -> EN_DESPACHO -> FALLADO
 */
export type EstadoCaso =
  | "INTAKE"
  | "TRIADO"
  | "EN_NEGOCIACION_EPS"
  | "RESUELTO_EPS"
  | "ESCALADO_TUTELA"
  | "EN_DESPACHO"
  | "FALLADO";

/** Rol del usuario en la plataforma ODR. */
export type RolUsuario = "demandante" | "demandado" | "juez" | "atlas";

/** Régimen del Sistema General de Seguridad Social en Salud. */
export type RegimenSalud = "contributivo" | "subsidiado" | "especial" | "no_afiliado";

/** Nivel de urgencia clínica/jurídica percibida. */
export type Urgencia = "baja" | "media" | "alta" | "vital";

/** Derecho fundamental invocado. */
export type DerechoFundamental =
  | "salud"
  | "vida"
  | "vida digna"
  | "seguridad social"
  | "integridad personal"
  | "igualdad"
  | "petición"
  | "mínimo vital"
  | "niñez";

/** Tipo de servicio de salud negado/demorado que origina la disputa. */
export type TipoServicio =
  | "cirugia"
  | "medicamento"
  | "examen_diagnostico"
  | "tratamiento"
  | "traslado_ambulancia"
  | "terapia"
  | "insumo_dispositivo"
  | "consulta_especialista"
  | "otro";

/** Una sentencia de tutela referenciada (subconjunto del corpus). */
export interface SentenciaRef {
  /** Identificador de la sentencia, p.ej. "T-760/2008". */
  id: string;
  /** Título descriptivo de la sentencia. */
  titulo: string;
  /** Año de expedición. */
  anio: number;
  /** Tema principal. */
  tema: string;
  /** Subregla o ratio decidendi en una frase. */
  subregla: string;
  /** Extracto o resumen del aparte relevante. */
  extracto: string;
  /** Derechos fundamentales tratados. */
  derechos: string[];
  /** Puntaje de relevancia (0-1) cuando proviene de un retrieval. Opcional. */
  score?: number;
  /**
   * URL de la fuente oficial (p.ej. relatoría de la Corte Constitucional).
   * Permite citas clicables. Opcional: no toda sentencia la tiene.
   */
  fuenteUrl?: string;
}

/**
 * Resultado del triaje de admisibilidad de una tutela en salud.
 * Producido por el módulo de IA y revisable por humanos.
 */
export interface TriajeAdmisibilidad {
  /** ¿El caso es admisible como acción de tutela? */
  admisible: boolean;
  /** Confianza del análisis (0-1). */
  confianza: number;
  /** Subsidiariedad: ¿se agotaron/no aplican otros medios de defensa? */
  subsidiariedad: boolean;
  /** ¿Hay perjuicio irremediable que justifique procedencia? */
  perjuicioIrremediable: boolean;
  /** Legitimación por activa verificada. */
  legitimacionActiva: boolean;
  /** Derechos fundamentales vulnerados identificados. */
  derechosVulnerados: DerechoFundamental[];
  /** Sentencias de respaldo (precedente aplicable). */
  fundamentos: SentenciaRef[];
  /** Recomendación textual para el usuario/operador. */
  recomendacion: string;
  /** Banderas o advertencias detectadas (subsanables, riesgos, etc.). */
  banderas: string[];
}

/**
 * Plazo legal calculado dentro del trámite de tutela.
 * Las fechas se serializan como ISO 8601 (string) para Zustand/JSON.
 */
export interface PlazoLegal {
  /** Clave estable del hito, p.ej. "fallo_primera_instancia". */
  hito: string;
  /** Etiqueta legible para UI. */
  etiqueta: string;
  /** Fecha límite (ISO 8601). */
  fechaLimite: string;
  /** Días concedidos por la norma. */
  dias: number;
  /** ¿Los días son hábiles (true) o calendario (false)? */
  habiles: boolean;
  /** Fundamento normativo del plazo. */
  fundamento: string;
  /** ¿Ya se cumplió/venció este hito? */
  cumplido?: boolean;
}

/** Evento del timeline/bitácora de un caso. */
export interface EventoCaso {
  /** Id único del evento. */
  id: string;
  /** Marca temporal (ISO 8601). */
  fecha: string;
  /** Tipo de evento para iconografía/filtrado. */
  tipo:
    | "creacion"
    | "estado"
    | "mensaje"
    | "documento"
    | "ia"
    | "plazo"
    | "fallo"
    | "sistema";
  /** Estado del caso al momento del evento (opcional). */
  estado?: EstadoCaso;
  /** Actor que originó el evento. */
  actor?: RolUsuario | "sistema" | "eps";
  /** Título corto del evento. */
  titulo: string;
  /** Detalle/descripcion del evento. */
  detalle?: string;
}

/** Predicción del resultado probable del caso. */
export interface Prediccion {
  /** Probabilidad estimada de fallo a favor del accionante (0-1). */
  probabilidadFavorable: number;
  /** Días estimados hasta resolución. */
  diasEstimados: number;
  /** Vía recomendada. */
  viaRecomendada: "negociacion_eps" | "tutela";
  /** Factores que aumentan probabilidad. */
  factoresFavorables: string[];
  /** Factores de riesgo. */
  factoresRiesgo: string[];
  /** Sentencias comparables que sustentan la predicción. */
  casosComparables: SentenciaRef[];
  /** Confianza del modelo (0-1). */
  confianza: number;
}

/** El accionante (paciente o quien actúa en su nombre). */
export interface Demandante {
  nombre: string;
  edad: number;
  documento?: string;
  ciudad: string;
  departamento: string;
  /** Código DANE del departamento (2 dígitos). */
  codigoDepartamento: string;
  regimen: RegimenSalud;
  telefono?: string;
  email?: string;
  /** ¿Es sujeto de especial protección constitucional? */
  sujetoEspecialProteccion?: boolean;
}

/** El accionado (entidad obligada a prestar el servicio). */
export interface Demandado {
  /** Razón social, p.ej. "EPS Sura". */
  nombre: string;
  tipo: "EPS" | "IPS" | "ENTE_TERRITORIAL" | "ADRES" | "OTRO";
  nit?: string;
}

/**
 * Estado del trámite del derecho de petición ante la EPS.
 */
export type EstadoPeticion =
  | "radicada"
  | "en_termino"
  | "vencida"
  | "respondida";

/**
 * Derecho de petición formal dirigido a la EPS (Ley 1755 de 2015).
 * Identifica al responsable concreto que debe responder y el reloj del SLA.
 */
export interface PeticionFormal {
  /** Responsable concreto (entidad), p.ej. "EPS Sura". */
  responsable: string;
  /** Dependencia interna que debe resolver, p.ej. "Dirección de Aseguramiento / Auditoría Médica". */
  dependencia: string;
  /** Radicado interno de la petición (no judicial). */
  radicadoPeticion: string;
  /** Término de respuesta en días hábiles según la naturaleza de la petición. */
  slaDias: number;
  /** ¿Los días del SLA son hábiles (true) o calendario (false)? */
  slaHabiles?: boolean;
  /** Fecha de vencimiento del término de respuesta (ISO 8601). */
  slaVence: string;
  /** Fecha de radicación de la petición (ISO 8601). */
  fechaRadicacion?: string;
  /** Fundamento normativo del término aplicado. */
  fundamento?: string;
  /** Estado del trámite de la petición. */
  estado: EstadoPeticion;
}

/**
 * Tipo de documento anexo detectado por la lectura multimodal de Claude.
 * Permite iconografía/filtrado y guía la fusión de datos en el caso.
 */
export type TipoAnexo =
  | "negacion_eps"
  | "orden_medica"
  | "historia_clinica"
  | "cedula"
  | "formula_medica"
  | "carnet_eps"
  | "derecho_peticion"
  | "otro";

/**
 * Documento anexo subido por el usuario (imagen o PDF), leído por Claude de
 * forma multimodal (OCR + comprensión). El texto y los datos se EXTRAEN
 * exclusivamente de lo que aparece en el documento (regla anti-alucinación).
 */
export interface Anexo {
  /** Id interno único del anexo. */
  id: string;
  /** Nombre original del archivo, p.ej. "negacion_sura.pdf". */
  nombre: string;
  /** Media type IANA del archivo (p.ej. "image/png", "application/pdf"). */
  mimeType: string;
  /**
   * Tipo de documento detectado. Es un TipoAnexo conocido cuando se reconoce,
   * pero se tipa como string para tolerar categorías nuevas del modelo.
   */
  tipoDetectado: TipoAnexo | string;
  /** Transcripción / OCR del documento (lo que dice el texto). */
  textoExtraido: string;
  /**
   * Datos estructurados hallados EN el documento (servicioNegado, diagnostico,
   * eps, medicoTratante, fechas, radicadoNegacion, paciente, etc.).
   * Solo claves presentes en el documento; lo ausente queda undefined.
   */
  datosExtraidos: Record<string, string | undefined>;
  /** Resumen de 1-2 frases del contenido del documento. */
  resumen: string;
  /** Fecha relevante del documento (ISO 8601 o tal como aparece). Opcional. */
  fecha?: string;
}

/** Caso ODR completo. Entidad central del dominio. */
export interface Caso {
  /** Id interno único (no judicial). */
  id: string;
  /** Radicado judicial de 23 dígitos (formato colombiano). */
  radicado: string;
  /** Estado actual en el flujo ODR. */
  estado: EstadoCaso;
  /** Fecha de creación del caso (ISO 8601). */
  fechaCreacion: string;
  /** Fecha base para el cómputo de plazos (ISO 8601). */
  fechaBase: string;

  demandante: Demandante;
  demandado: Demandado;

  /** Servicio de salud objeto de la disputa. */
  servicioNegado: string;
  tipoServicio: TipoServicio;
  /** Diagnóstico clínico relacionado. */
  diagnostico: string;
  /** Relato de los hechos en lenguaje natural. */
  hechos: string;
  /** Pretensión concreta del accionante. */
  pretension: string;

  urgencia: Urgencia;
  /** ¿El servicio está cubierto por el PBS (Plan de Beneficios en Salud)? */
  esPBS: boolean;
  /** Derechos fundamentales invocados. */
  derechosInvocados: DerechoFundamental[];

  /** Resultado del triaje de admisibilidad (si se ejecutó). */
  triaje?: TriajeAdmisibilidad;
  /** Predicción del resultado (si se ejecutó). */
  prediccion?: Prediccion;
  /** Cronograma de plazos legales del trámite. */
  cronograma: PlazoLegal[];
  /** Progreso 0-100 derivado del estado. */
  progreso: number;
  /** Bitácora de eventos del caso. */
  timeline: EventoCaso[];
  /** Sentencias citadas/aplicables al caso. */
  sentenciasAplicables?: SentenciaRef[];
  /** Derecho de petición formal radicado ante la EPS (ruta de resolución directa). */
  peticion?: PeticionFormal;
  /** Propuesta de mediación de consenso entre paciente y EPS (la cuarta parte). */
  mediacion?: Mediacion;
  /** Documentos anexos (imágenes/PDF) leídos por Claude de forma multimodal. */
  anexos?: Anexo[];
}

/** Estado de la propuesta de mediación construida por Amparo (la cuarta parte). */
export type EstadoMediacion = "propuesta" | "aceptada" | "rechazada";

/**
 * Propuesta de mediación de consenso entre el demandante (paciente) y la EPS.
 *
 * Inspirada en la "Habermas Machine" (Google DeepMind, Science 2024): en vez de
 * un resultado gana/pierde, Amparo articula la posición LEGÍTIMA de cada parte y
 * propone un CONSENSO concreto, razonado y fundado en el derecho a la salud, que
 * ambas partes pueden calificar como justo y aceptar. Justicia procedimental +
 * descongestión. Todo precedente citado proviene EXCLUSIVAMENTE del corpus.
 */
export interface Mediacion {
  /** Posición legítima del demandante (paciente): acceso oportuno al servicio. */
  posicionDemandante: string;
  /** Posición legítima de la EPS: sostenibilidad, proceso, alcance de lo cubierto. */
  posicionEPS: string;
  /** Acuerdo de consenso concreto que da el servicio al paciente Y atiende el proceso de la EPS. */
  consensoPropuesto: string;
  /** Fundamento del consenso en el derecho a la salud, citando SOLO sentencias del corpus. */
  fundamento: string;
  /** Términos operativos del acuerdo (autorización en X días, prestador, plan de seguimiento, etc.). */
  terminos: string[];
  /** Sentencias del corpus que respaldan el consenso (subconjunto recuperado). Opcional. */
  fundamentos?: SentenciaRef[];
  /** ¿El demandante aceptó la propuesta? */
  aceptadoDemandante?: boolean;
  /** ¿La EPS aceptó la propuesta? */
  aceptadoEPS?: boolean;
  /** Estado del acuerdo de consenso. */
  estado: EstadoMediacion;
}

/** Estadística ilustrativa de tutelas por departamento (para el Atlas). */
export interface EstadisticaDepartamento {
  /** Código DANE (2 dígitos). */
  codigo: string;
  /** Nombre del departamento. */
  nombre: string;
  /** Total de tutelas en salud (ilustrativo). */
  totalTutelas: number;
  /** Tasa por cada 10.000 habitantes (ilustrativa). */
  tasaPor10k: number;
  /** Porcentaje de fallos favorables al accionante (ilustrativo). */
  porcentajeFavorable: number;
  /** ¿El dato es ilustrativo/no oficial? Siempre true en el seed. */
  ilustrativo: boolean;
}
