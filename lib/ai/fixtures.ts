// lib/ai/fixtures.ts — Respuestas precomputadas DEMO-SAFE para el caso HÉROE.
//
// Determinismo: si la API de Anthropic falla o tarda demasiado al procesar el
// caso héroe (heroeId), las funciones de IA degradan a estas respuestas de alta
// calidad para que el demo NUNCA quede en blanco.
//
// El caso héroe es Amparo Restrepo (68 años), artroplastia total de cadera
// negada por la EPS, coxartrosis severa, sujeto de especial protección.

import { heroeId } from "../seed";
import type {
  Mediacion,
  Prediccion,
  SentenciaRef,
  TriajeAdmisibilidad,
} from "../types";
import type { TriajeResultado } from "./triaje";
import type { EstructuracionOutput } from "./estructurador";
import type { PrediccionResultado } from "./predictor";

/** ¿Es el caso héroe? Centraliza la comparación. */
export function esHeroe(casoId: string | undefined): boolean {
  return casoId === heroeId;
}

/**
 * Id del segundo caso semilla (Carlos Jaramillo, Pembrolizumab) que se usa como
 * caso inicial en la "Mediation room" de /demandado. También cuenta con fixtures
 * de mediación EN/ES de alta calidad para que la demo sea DETERMINISTA y NO filtre
 * español en modo inglés. Se define aquí (no en seed) para respetar el alcance.
 */
export const jaramilloId = "caso-jaramillo-002";

/** Timeout (ms) para degradar al fixture en el caso héroe. */
export const TIMEOUT_DEMO_MS = 12_000;

/**
 * Corre `op` con un límite de tiempo. Si excede `ms` o lanza, devuelve `fallback`.
 * Solo debe usarse para blindar el caso héroe.
 */
export async function conRespaldo<T>(
  op: () => Promise<T>,
  fallback: T,
  ms: number = TIMEOUT_DEMO_MS,
): Promise<T> {
  try {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const timeout = new Promise<T>((resolve) => {
      timer = setTimeout(() => resolve(fallback), ms);
    });
    const result = await Promise.race([op(), timeout]);
    if (timer) clearTimeout(timer);
    return result;
  } catch {
    return fallback;
  }
}

// --- Sentencias canónicas que respaldan el caso héroe (subconjunto del corpus) ---

const T760: SentenciaRef = {
  id: "T-760/2008",
  titulo: "Sentencia T-760 de 2008 — Estructural del derecho a la salud",
  anio: 2008,
  tema: "Salud como derecho fundamental autónomo",
  subregla:
    "La salud es un derecho fundamental autónomo y la EPS debe garantizar el acceso oportuno, eficaz y de calidad a los servicios prescritos por el médico tratante, sin que trámites administrativos puedan obstruirlo.",
  extracto:
    "El derecho a la salud es fundamental y comprende el acceso a los servicios que requiera la persona con necesidad. La falta de autorización oportuna de un servicio ordenado por el médico tratante vulnera ese derecho.",
  derechos: ["salud", "vida digna", "seguridad social"],
  // Fuente oficial (corpus): hace la cita clicable también en el camino demo.
  fuenteUrl: "https://www.corteconstitucional.gov.co/relatoria/2008/t-760-08.htm",
  score: 0.97,
};

const T016: SentenciaRef = {
  id: "T-016/2007",
  titulo: "Sentencia T-016 de 2007 — Fundamentalidad de la salud",
  anio: 2007,
  tema: "Conexidad y autonomía del derecho a la salud",
  subregla:
    "El derecho a la salud es fundamental cuando su falta de garantía amenaza la vida digna, especialmente en sujetos de especial protección.",
  extracto:
    "La negativa injustificada a prestar un servicio de salud compromete la dignidad humana y puede configurar un perjuicio irremediable.",
  derechos: ["salud", "vida digna"],
  // Fuente oficial (corpus): hace la cita clicable también en el camino demo.
  fuenteUrl:
    "https://vlex.com.co/tags/sentencia-t-016-2007-corte-constitucional-229024",
  score: 0.9,
};

// Real corpus sentence (lib/corpus/sentencias.json) on the prevalence of the
// treating physician's criterion. Replaces the previously hard-wired
// T-1059/2006, which did not exist in the curated corpus.
const T195: SentenciaRef = {
  id: "T-195/2021",
  titulo:
    "Sentencia T-195 de 2021 — Suministro de tecnología en salud y criterio del médico tratante",
  anio: 2021,
  tema: "Prevalencia del criterio del médico tratante",
  subregla:
    "Prevalece el criterio del médico tratante sobre los conceptos administrativos de la EPS; el suministro de lo prescrito no puede negarse por razones meramente administrativas o de cobertura.",
  extracto:
    "La Corte amparó el acceso a lo prescrito por el médico tratante, reiterando la prevalencia de su criterio frente a las objeciones administrativas de la EPS.",
  derechos: ["salud", "vida digna"],
  // Fuente oficial (corpus): hace la cita clicable también en el camino demo.
  fuenteUrl: "https://www.corteconstitucional.gov.co/relatoria/2021/T-195-21.htm",
  score: 0.88,
};

/** Sentencias que cita la predicción héroe (alta calidad, anti-alucinación). */
export const SENTENCIAS_HEROE: SentenciaRef[] = [T760, T016, T195];

// --- Estructuración héroe ---

export const ESTRUCTURACION_HEROE: EstructuracionOutput = {
  servicioNegado: "Artroplastia total de cadera derecha",
  tipoServicio: "cirugia",
  diagnostico: "Coxartrosis severa de cadera derecha (M16.1)",
  urgencia: "alta",
  derechosInvocados: ["salud", "vida digna", "seguridad social"],
  hechos:
    "Paciente adulta mayor con coxartrosis severa de cadera derecha. El médico tratante ordenó artroplastia total de cadera. La EPS no ha autorizado el procedimiento alegando trámites de pertinencia, pese a la prescripción y al deterioro progresivo.",
  pretension:
    "Que se ordene a la EPS autorizar y practicar de manera oportuna la artroplastia total de cadera prescrita, con atención integral del postoperatorio.",
};

// --- Triaje héroe ---

export const TRIAJE_HEROE: TriajeResultado = {
  veredicto: "admisible",
  rutaRecomendada: "tutela",
  confianza: 0.94,
  criterios: {
    derechoFundamental: {
      estado: "ok",
      explicacion:
        "Se invoca el derecho fundamental autónomo a la salud (T-760/2008), en conexidad con la vida digna y la seguridad social. La negativa a una cirugía prescrita lo compromete directamente.",
    },
    legitimacion: {
      estado: "ok",
      explicacion:
        "La accionante es la titular directa del derecho (paciente). Legitimación por activa plena. La EPS Sura es la entidad obligada (legitimación por pasiva).",
    },
    subsidiariedad: {
      estado: "ok",
      explicacion:
        "Tratándose de un sujeto de especial protección (adulta mayor de 68 años) con deterioro funcional progresivo, los medios ordinarios no son idóneos ni eficaces; la tutela procede como mecanismo principal.",
    },
    inmediatez: {
      estado: "ok",
      explicacion:
        "La vulneración es actual y continuada: la cirugía sigue sin autorizarse, por lo que el requisito de inmediatez se satisface.",
    },
    noTemeridad: {
      estado: "ok",
      explicacion:
        "No se advierte una segunda acción de tutela por los mismos hechos y pretensiones. No hay temeridad.",
    },
    hechoSuperado: {
      estado: "ok",
      explicacion:
        "No existe carencia actual de objeto: el servicio continúa negado, de modo que persiste la materia del amparo.",
    },
  },
  derechosVulnerados: ["salud", "vida digna", "seguridad social"],
  fundamentos: SENTENCIAS_HEROE,
  recomendacion:
    "Caso admisible con alta confianza. Se recomienda escalar a acción de tutela invocando el precedente T-760/2008 y la condición de sujeto de especial protección. Solicitar medida provisional para autorización inmediata de la cirugía.",
  banderas: [],
};

/** Triaje héroe adaptado al tipo canónico TriajeAdmisibilidad. */
export const TRIAJE_HEROE_ADMISIBILIDAD: TriajeAdmisibilidad = {
  admisible: true,
  confianza: 0.94,
  subsidiariedad: true,
  perjuicioIrremediable: true,
  legitimacionActiva: true,
  derechosVulnerados: ["salud", "vida digna", "seguridad social"],
  fundamentos: SENTENCIAS_HEROE,
  recomendacion: TRIAJE_HEROE.recomendacion,
  banderas: [],
};

// --- Predicción héroe ---

export const PREDICCION_HEROE: PrediccionResultado = {
  probabilidadAmparo: 92,
  reglaAplicable:
    "El concepto del médico tratante prevalece sobre trámites administrativos de pertinencia. Negar u obstaculizar una cirugía prescrita a un adulto mayor vulnera el derecho fundamental a la salud (T-760/2008), procediendo el amparo y la orden de práctica oportuna.",
  razonamiento:
    "El caso reúne los factores que el precedente constitucional reconoce como determinantes de un fallo favorable: (i) prescripción expresa del médico tratante; (ii) sujeto de especial protección constitucional (adulta mayor de 68 años); (iii) servicio incluido en el PBS, por lo que la EPS está obligada a prestarlo con cargo a la UPC; (iv) deterioro funcional progresivo que configura urgencia. La jurisprudencia (T-760/2008, T-016/2007, T-195/2021) ha amparado de forma reiterada la negativa o demora injustificada de procedimientos quirúrgicos ordenados, descartando que trámites administrativos de pertinencia puedan obstruir el acceso. La probabilidad de amparo es muy alta.",
  sentenciasCitadas: SENTENCIAS_HEROE,
};

/** Predicción héroe adaptada al tipo canónico Prediccion. */
export const PREDICCION_HEROE_CANONICA: Prediccion = {
  probabilidadFavorable: 0.92,
  diasEstimados: 10,
  viaRecomendada: "tutela",
  factoresFavorables: [
    "Prescripción expresa del médico tratante",
    "Sujeto de especial protección constitucional (adulta mayor)",
    "Servicio incluido en el PBS (obligación directa de la EPS)",
    "Precedente reiterado: T-760/2008, T-016/2007, T-195/2021",
    "Deterioro funcional progresivo (urgencia)",
  ],
  factoresRiesgo: [
    "La EPS podría alegar listas de espera o trámites de pertinencia (argumento débil frente al precedente).",
  ],
  casosComparables: SENTENCIAS_HEROE,
  confianza: 0.92,
};

// --- Reclamación EPS héroe ---

export const RECLAMACION_EPS_HEROE = `# Reclamación directa ante EPS Sura

**Asunto:** Solicitud de autorización inmediata de artroplastia total de cadera

**Radicado interno:** caso-amparo-001

---

Respetados señores **EPS Sura**:

Yo, **Amparo Restrepo**, mayor de edad, afiliada al régimen contributivo, en mi calidad de paciente, me permito presentar **reclamación directa** para que se autorice de manera inmediata el servicio de salud que a continuación describo.

## Hechos

1. Padezco **coxartrosis severa de cadera derecha (M16.1)**, que me causa dolor incapacitante y limitación funcional progresiva.
2. Mi médico tratante ordenó la realización de una **artroplastia total de cadera derecha**.
3. A la fecha, la EPS no ha autorizado el procedimiento, alegando trámites de pertinencia.
4. Soy **adulta mayor (68 años)**, sujeto de especial protección constitucional.

## Fundamento

El servicio se encuentra **incluido en el Plan de Beneficios en Salud (PBS)** y fue prescrito por mi médico tratante, cuyo concepto prevalece sobre consideraciones administrativas. La jurisprudencia constitucional (Sentencia **T-760 de 2008**) ha reiterado que la salud es un derecho fundamental autónomo cuyo acceso oportuno no puede ser obstaculizado por trámites internos.

## Solicitud

Solicito respetuosamente:

1. **Autorizar y agendar** la artroplastia total de cadera prescrita, en el menor tiempo posible.
2. Garantizar la **atención integral del postoperatorio** (rehabilitación, controles, insumos).
3. Dar respuesta de fondo dentro de los términos legales.

En caso de no obtener respuesta favorable, me reservo el derecho de acudir a la **acción de tutela** para la protección de mis derechos fundamentales a la salud, la vida digna y la seguridad social.

Atentamente,

**Amparo Restrepo**
C.C. 43.215.678
Medellín, Antioquia

---
*Documento generado por Amparo (asistido por IA). Material ilustrativo, no constituye asesoría jurídica formal.*`;

// --- Tutela héroe ---

export const TUTELA_HEROE = `# ACCIÓN DE TUTELA

**Señor JUEZ (REPARTO) — Medellín, Antioquia**
**E. S. D.**

**Accionante:** Amparo Restrepo, C.C. 43.215.678
**Accionada:** EPS Sura (NIT 800.088.702-2)
**Derechos invocados:** Salud · Vida digna · Seguridad social

---

**Amparo Restrepo**, mayor de edad, identificada con cédula de ciudadanía No. 43.215.678, residente en Medellín (Antioquia), actuando en nombre propio, instauro **ACCIÓN DE TUTELA** contra la **EPS Sura**, con fundamento en el artículo 86 de la Constitución Política y el Decreto 2591 de 1991, por la vulneración de mis derechos fundamentales a la **salud, la vida digna y la seguridad social**.

## I. HECHOS

1. Tengo 68 años de edad y soy afiliada al régimen contributivo en la EPS Sura.
2. Padezco **coxartrosis severa de cadera derecha (M16.1)**, que me produce dolor incapacitante y limitación funcional progresiva.
3. Mi médico tratante ordenó la práctica de una **artroplastia total de cadera derecha**, procedimiento incluido en el Plan de Beneficios en Salud (PBS).
4. La EPS Sura **no ha autorizado** el procedimiento, alegando trámites de pertinencia, pese a la prescripción y al deterioro progresivo de mi salud.
5. Como adulta mayor, soy **sujeto de especial protección constitucional**.

## II. DERECHOS FUNDAMENTALES VULNERADOS

- **Salud** (art. 49 C.P. y derecho fundamental autónomo, Sentencia T-760 de 2008).
- **Vida digna** (art. 1 y 11 C.P.).
- **Seguridad social** (art. 48 C.P.).

La negativa u obstaculización injustificada de un servicio prescrito por el médico tratante vulnera el derecho fundamental a la salud. El concepto del médico tratante prevalece sobre consideraciones administrativas de la EPS (Sentencias T-760/2008, T-016/2007 y T-195/2021).

## III. PRETENSIONES

Solicito al despacho:

1. **TUTELAR** mis derechos fundamentales a la salud, la vida digna y la seguridad social.
2. **ORDENAR** a la EPS Sura que, en un término no superior a **48 horas**, autorice y agende la **artroplastia total de cadera derecha** prescrita por mi médico tratante.
3. **ORDENAR** la **atención integral** del procedimiento, incluyendo postoperatorio, rehabilitación, insumos y controles que se requieran.
4. Como **medida provisional** (art. 7 Decreto 2591/1991), disponer la autorización inmediata mientras se resuelve de fondo, dada mi condición de adulta mayor con deterioro progresivo.

## IV. PRUEBAS

1. Orden médica de artroplastia total de cadera (médico tratante).
2. Historia clínica con diagnóstico de coxartrosis severa (M16.1).
3. Constancia de afiliación a la EPS Sura.
4. Documento de identidad que acredita mi edad (68 años).

## V. JURAMENTO

Bajo la gravedad del juramento manifiesto que **no he presentado otra acción de tutela** por los mismos hechos y derechos ante ninguna otra autoridad judicial (art. 37 Decreto 2591/1991).

## VI. NOTIFICACIONES

- **Accionante:** Medellín (Antioquia). Tel. +57 300 000 0000.
- **Accionada:** EPS Sura, en su domicilio principal y de notificaciones judiciales.

Atentamente,

**Amparo Restrepo**
C.C. 43.215.678

---
*Escrito generado por Amparo (asistido por IA). Material ilustrativo; requiere revisión de un profesional del derecho antes de su presentación.*`;

// --- Fallo sugerido héroe ---

export const FALLO_HEROE = `# PROYECTO DE FALLO — ACCIÓN DE TUTELA

**Juzgado (reparto) — Medellín, Antioquia**
**Accionante:** Amparo Restrepo · **Accionada:** EPS Sura

---

## I. ANTECEDENTES

La accionante, adulta mayor de 68 años afiliada al régimen contributivo, solicita la protección de sus derechos fundamentales a la salud, la vida digna y la seguridad social, presuntamente vulnerados por la EPS Sura al no autorizar la **artroplastia total de cadera derecha** prescrita por su médico tratante para tratar una **coxartrosis severa (M16.1)**.

## II. PROBLEMA JURÍDICO

¿Vulnera la EPS los derechos fundamentales a la salud y a la vida digna de una adulta mayor al abstenerse de autorizar, por trámites de pertinencia, un procedimiento quirúrgico ordenado por su médico tratante e incluido en el PBS?

## III. CONSIDERACIONES

1. **La salud es un derecho fundamental autónomo.** La Sentencia **T-760 de 2008** consolidó la fundamentalidad del derecho a la salud y la obligación de las EPS de garantizar el acceso oportuno, eficaz y de calidad a los servicios requeridos.

2. **Prevalencia del médico tratante.** Conforme a las Sentencias **T-195 de 2021** y **T-016 de 2007**, el concepto del médico tratante prevalece sobre las consideraciones administrativas de la entidad; los trámites internos de pertinencia no pueden obstaculizar un servicio prescrito.

3. **Sujeto de especial protección.** Por tratarse de una adulta mayor con deterioro funcional progresivo, opera una protección reforzada que torna la tutela en el mecanismo idóneo.

4. **Servicio PBS.** Al estar incluido el procedimiento en el Plan de Beneficios en Salud, la EPS tiene la obligación directa de prestarlo con cargo a la UPC, sin que sea admisible su dilación.

## IV. RESUELVE

**PRIMERO. TUTELAR** los derechos fundamentales a la **salud, la vida digna y la seguridad social** de la señora Amparo Restrepo.

**SEGUNDO. ORDENAR** a la **EPS Sura** que, dentro de las **cuarenta y ocho (48) horas** siguientes a la notificación de este fallo, **autorice y agende** la artroplastia total de cadera derecha prescrita por el médico tratante.

**TERCERO. ORDENAR** que la EPS garantice la **atención integral** del procedimiento, incluyendo postoperatorio, rehabilitación, insumos y controles.

**CUARTO. ADVERTIR** a la entidad accionada sobre las consecuencias del desacato (arts. 52 y 53 del Decreto 2591 de 1991).

**QUINTO. NOTIFICAR** a las partes conforme al artículo 30 del Decreto 2591 de 1991, advirtiendo el término de impugnación de tres (3) días.

Notifíquese y cúmplase.

---
*Proyecto de fallo generado por Amparo (asistido por IA). Material ilustrativo de apoyo al despacho; no sustituye el criterio del juez.*`;

// --- Mediación héroe (la cuarta parte: consenso paciente ↔ EPS) ---
//
// Inspirada en la "Habermas Machine": articula la posición legítima de cada
// parte y propone un consenso que ambas pueden calificar como justo. Cita SOLO
// sentencias del corpus (SENTENCIAS_HEROE).

export const MEDIACION_HEROE: Mediacion = {
  posicionDemandante:
    "Como paciente, Amparo Restrepo necesita el acceso oportuno a la artroplastia total de cadera que su médico tratante ordenó. Su posición es legítima: el dolor es incapacitante, el deterioro funcional avanza y, como adulta mayor de 68 años, es sujeto de especial protección constitucional. El servicio está incluido en el PBS y ya fue prescrito; cada día de demora agrava su condición y su dignidad.",
  posicionEPS:
    "La EPS Sura tiene una posición legítima en cuanto al debido proceso de autorización: requiere completar la auditoría médica de pertinencia, verificar la red de prestadores habilitados y agendar el procedimiento de forma ordenada para garantizar seguridad clínica y sostenibilidad del sistema. Su preocupación no es negar el derecho, sino encauzar el cómo y el cuándo dentro de un trámite trazable y con cargo correcto a la UPC.",
  consensoPropuesto:
    "Ambas partes coinciden en que el procedimiento debe realizarse: la diferencia es de proceso y oportunidad, no de fondo. El consenso propuesto da a la paciente el servicio que requiere Y atiende el proceso de la EPS: la EPS cierra su auditoría de pertinencia en un plazo breve y autoriza la artroplastia con un prestador concreto de su red, con fecha cierta de cirugía y un plan de seguimiento integral del postoperatorio; a cambio, la disputa se resuelve sin escalar a tutela, descongestionando la vía judicial. Es un acuerdo que ambas partes pueden calificar como justo: la paciente obtiene certeza y oportunidad; la EPS conserva su proceso de auditoría y agendamiento ordenado.",
  fundamento:
    "El consenso se funda en el derecho fundamental a la salud como derecho autónomo (T-760/2008): la EPS debe garantizar el acceso oportuno y de calidad a los servicios prescritos por el médico tratante, cuyo criterio prevalece sobre las consideraciones administrativas (T-195/2021). Tratándose de una adulta mayor con deterioro progresivo, opera una protección reforzada que torna inadmisible la dilación injustificada (T-016/2007). El acuerdo respeta a la vez la oportunidad debida al paciente y un trámite de autorización ordenado por parte de la EPS, sin que ninguno sacrifique su posición legítima.",
  terminos: [
    "La EPS Sura cierra la auditoría médica de pertinencia en un plazo máximo de cinco (5) días hábiles.",
    "Autorización de la artroplastia total de cadera derecha con prestador concreto de la red habilitada, identificado en el acta.",
    "Fecha cierta de cirugía dentro de los treinta (30) días siguientes a la autorización, comunicada por escrito a la paciente.",
    "Atención integral del postoperatorio: rehabilitación, controles, insumos y medicamentos asociados, con cargo a la UPC.",
    "Plan de seguimiento con un punto de contacto único en la EPS y reporte de avance a Amparo como cuarta parte.",
    "Por su parte, la paciente acepta suspender la acción de tutela mientras la EPS cumpla los plazos acordados, dando al trámite de autorización la oportunidad de resolverse sin litigio.",
    "Si la EPS incumple cualquier término, la paciente conserva intacta la vía de tutela sin necesidad de agotar trámite adicional.",
  ],
  fundamentos: SENTENCIAS_HEROE,
  estado: "propuesta",
};

export const MEDIACION_HEROE_EN: Mediacion = {
  posicionDemandante:
    "As the patient, Amparo Restrepo needs timely access to the total hip replacement her treating physician ordered. Her position is legitimate: the pain is disabling, functional deterioration is advancing and, as a 68-year-old senior, she is a subject of special constitutional protection. The service is included in the PBS benefits plan and has already been prescribed; every day of delay worsens her condition and her dignity.",
  posicionEPS:
    "EPS Sura has a legitimate position regarding the due authorization process: it needs to complete the medical-appropriateness review, verify the network of authorized providers and schedule the procedure in an orderly way to ensure clinical safety and the system's sustainability. Its concern is not to deny the right, but to channel the how and the when within a traceable process correctly charged to the UPC capitation.",
  consensoPropuesto:
    "Both parties agree the procedure must take place: the disagreement is about process and timing, not substance. The proposed consensus gives the patient the service she needs AND honors the EPS's process: the EPS closes its appropriateness review within a short deadline and authorizes the hip replacement with a specific in-network provider, with a fixed surgery date and an integral post-operative follow-up plan; in return, the dispute is resolved without escalating to a tutela, decongesting the courts. It is an agreement both parties can call fair: the patient gains certainty and timeliness; the EPS keeps its orderly review and scheduling process.",
  fundamento:
    "The consensus rests on the fundamental right to health as an autonomous right (T-760/2008): the EPS must guarantee timely, quality access to services prescribed by the treating physician, whose judgment prevails over administrative considerations (T-195/2021). For a senior with progressive deterioration, reinforced protection applies, making unjustified delay inadmissible (T-016/2007). The agreement honors both the patient's due timeliness and the EPS's orderly authorization process, without either side sacrificing its legitimate position.",
  terminos: [
    "EPS Sura closes the medical-appropriateness review within a maximum of five (5) business days.",
    "Authorization of the right total hip replacement with a specific in-network provider, named in the agreement record.",
    "A fixed surgery date within the thirty (30) days following authorization, communicated to the patient in writing.",
    "Integral post-operative care: rehabilitation, follow-ups, supplies and related medication, charged to the UPC capitation.",
    "A follow-up plan with a single point of contact at the EPS and progress reporting to Amparo as the fourth party.",
    "For her part, the patient agrees to hold the tutela action while the EPS meets the agreed deadlines, giving the authorization process the chance to resolve without litigation.",
    "If the EPS breaches any term, the patient fully retains the tutela route with no need to exhaust any further process.",
  ],
  fundamentos: SENTENCIAS_HEROE,
  estado: "propuesta",
};

// --- Mediación Jaramillo (caso-jaramillo-002): Pembrolizumab oncológico ---
//
// Caso semilla de la "Mediation room" de /demandado: Carlos Jaramillo Vélez
// (54 años, sujeto de especial protección), carcinoma pulmonar no microcítico
// avanzado (C34.9), Pembrolizumab de alto costo NO financiado con la UPC, negado
// por Nueva EPS pese a la prescripción del oncólogo por Mipres. Estas fixtures
// hacen la mediación DETERMINISTA en ES y EN (evita que el LLM en vivo filtre
// español en modo inglés). Citan SOLO sentencias del corpus (SENTENCIAS_HEROE).

/** Sentencias del corpus que respaldan la mediación Jaramillo (alta calidad). */
const SENTENCIAS_JARAMILLO: SentenciaRef[] = [T760, T195, T016];

export const MEDIACION_JARAMILLO: Mediacion = {
  posicionDemandante:
    "Como paciente, Carlos Jaramillo Vélez necesita el suministro inmediato e ininterrumpido del Pembrolizumab que su oncólogo tratante le prescribió por Mipres para tratar un carcinoma pulmonar no microcítico avanzado. Su posición es legítima: se trata de una enfermedad de urgencia vital, el tratamiento oncológico no admite interrupciones sin comprometer su vida y su mínimo vital, y la continuidad terapéutica es determinante para el pronóstico. Cada día de demora reduce su oportunidad de respuesta clínica y agrava el riesgo.",
  posicionEPS:
    "Nueva EPS tiene una posición legítima respecto del proceso de autorización de una tecnología de alto costo NO financiada con la UPC: requiere verificar la prescripción por Mipres, surtir el trámite de recobro/giro ante la ADRES para que el medicamento no financiado se cubra con cargo a la fuente correcta, validar la pertinencia oncológica y garantizar la trazabilidad del suministro. Su preocupación no es negar el derecho, sino encauzar el cómo y el cuándo dentro de un trámite ordenado y financieramente sostenible.",
  consensoPropuesto:
    "Ambas partes coinciden en que el tratamiento debe garantizarse: la diferencia es de proceso y financiación, no de fondo. El consenso propuesto da al paciente el medicamento que requiere Y atiende el proceso de la EPS: Nueva EPS autoriza el Pembrolizumab prescrito por Mipres y asegura su entrega inmediata e ininterrumpida a través de un prestador concreto de su red, gestionando en paralelo el recobro ante la ADRES por tratarse de tecnología no financiada con la UPC, sin trasladar esa gestión administrativa al paciente; a cambio, la disputa se resuelve sin escalar a tutela, descongestionando la vía judicial. Es un acuerdo que ambas partes pueden calificar como justo: el paciente obtiene continuidad y certeza terapéutica; la EPS conserva su proceso de autorización y recobro ordenado.",
  fundamento:
    "El consenso se funda en el derecho fundamental a la salud como derecho autónomo (T-760/2008): la EPS debe garantizar el acceso oportuno, eficaz y de calidad a los servicios prescritos por el médico tratante, y el hecho de que una tecnología no esté financiada con la UPC no exonera a la EPS de garantizar su suministro, gestionando el recobro ante la ADRES. El criterio del oncólogo tratante prevalece sobre las objeciones administrativas o de cobertura (T-195/2021). Tratándose de un paciente oncológico de urgencia vital y sujeto de especial protección, opera una protección reforzada que torna inadmisible la interrupción o dilación injustificada del tratamiento (T-016/2007). El acuerdo respeta a la vez la oportunidad debida al paciente y un trámite de autorización y recobro ordenado por parte de la EPS, sin que ninguno sacrifique su posición legítima.",
  terminos: [
    "Nueva EPS autoriza el Pembrolizumab prescrito por el oncólogo tratante a través de Mipres dentro de un plazo máximo de cuarenta y ocho (48) horas, dada la urgencia vital.",
    "Entrega inmediata e ininterrumpida del medicamento con un prestador concreto de la red habilitada, identificado en el acta, con calendario de los ciclos siguientes.",
    "La EPS gestiona el recobro ante la ADRES por tratarse de tecnología no financiada con la UPC, sin trasladar ese trámite administrativo ni costo alguno al paciente.",
    "Atención integral del tratamiento oncológico: valoraciones, exámenes de control, manejo de efectos adversos e insumos asociados, con cargo a la fuente que corresponda.",
    "Plan de seguimiento con un punto de contacto único en la EPS y reporte de avance a Amparo como cuarta parte, asegurando la continuidad entre ciclos.",
    "Por su parte, el paciente acepta suspender la acción de tutela mientras la EPS cumpla los plazos y la continuidad acordados, dando al trámite la oportunidad de resolverse sin litigio.",
    "Si la EPS incumple cualquier término o interrumpe el suministro, el paciente conserva intacta la vía de tutela sin necesidad de agotar trámite adicional.",
  ],
  fundamentos: SENTENCIAS_JARAMILLO,
  estado: "propuesta",
};

export const MEDIACION_JARAMILLO_EN: Mediacion = {
  posicionDemandante:
    "As the patient, Carlos Jaramillo Vélez needs the immediate, uninterrupted supply of the Pembrolizumab his treating oncologist prescribed through Mipres to treat advanced non-small-cell lung carcinoma. His position is legitimate: this is a life-threatening condition, oncological treatment cannot be interrupted without endangering his life and his minimum vital subsistence, and therapeutic continuity is decisive for his prognosis. Every day of delay reduces his chance of clinical response and worsens the risk.",
  posicionEPS:
    "Nueva EPS has a legitimate position regarding the authorization process for a high-cost technology NOT financed by the UPC capitation: it must verify the Mipres prescription, carry out the reimbursement/disbursement procedure before ADRES so the non-financed medication is covered from the correct source, validate oncological appropriateness and ensure traceability of the supply. Its concern is not to deny the right, but to channel the how and the when within an orderly and financially sustainable process.",
  consensoPropuesto:
    "Both parties agree the treatment must be guaranteed: the disagreement is about process and financing, not substance. The proposed consensus gives the patient the medication he needs AND honors the EPS's process: Nueva EPS authorizes the Pembrolizumab prescribed through Mipres and secures its immediate, uninterrupted delivery through a specific in-network provider, handling the ADRES reimbursement in parallel because this is a technology not financed by the UPC, without shifting that administrative burden onto the patient; in return, the dispute is resolved without escalating to a tutela, decongesting the courts. It is an agreement both parties can call fair: the patient gains therapeutic continuity and certainty; the EPS keeps its orderly authorization and reimbursement process.",
  fundamento:
    "The consensus rests on the fundamental right to health as an autonomous right (T-760/2008): the EPS must guarantee timely, effective and quality access to services prescribed by the treating physician, and the fact that a technology is not financed by the UPC does not relieve the EPS of guaranteeing its supply while it pursues the ADRES reimbursement. The treating oncologist's judgment prevails over administrative or coverage objections (T-195/2021). For an oncology patient with a life-threatening condition and special protection, reinforced protection applies, making any unjustified interruption or delay of treatment inadmissible (T-016/2007). The agreement honors both the patient's due timeliness and the EPS's orderly authorization and reimbursement process, without either side sacrificing its legitimate position.",
  terminos: [
    "Nueva EPS authorizes the Pembrolizumab prescribed by the treating oncologist through Mipres within a maximum of forty-eight (48) hours, given the life-threatening urgency.",
    "Immediate, uninterrupted delivery of the medication through a specific in-network provider, named in the agreement record, with a schedule for the following cycles.",
    "The EPS handles the reimbursement before ADRES, since this is a technology not financed by the UPC capitation, without shifting that administrative procedure or any cost onto the patient.",
    "Integral care of the oncological treatment: assessments, follow-up tests, management of adverse effects and related supplies, charged to the appropriate source.",
    "A follow-up plan with a single point of contact at the EPS and progress reporting to Amparo as the fourth party, ensuring continuity between cycles.",
    "For his part, the patient agrees to hold the tutela action while the EPS meets the agreed deadlines and continuity, giving the process the chance to resolve without litigation.",
    "If the EPS breaches any term or interrupts the supply, the patient fully retains the tutela route with no need to exhaust any further process.",
  ],
  fundamentos: SENTENCIAS_JARAMILLO,
  estado: "propuesta",
};
