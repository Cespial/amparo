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
  score: 0.9,
};

const T1059: SentenciaRef = {
  id: "T-1059/2006",
  titulo: "Sentencia T-1059 de 2006 — Criterio del médico tratante",
  anio: 2006,
  tema: "Prevalencia del concepto del médico tratante",
  subregla:
    "El concepto del médico tratante prevalece sobre consideraciones administrativas de la EPS; negar el servicio prescrito vulnera el derecho a la salud.",
  extracto:
    "La EPS no puede anteponer trámites de pertinencia al criterio del profesional que conoce al paciente y ordenó el procedimiento.",
  derechos: ["salud", "vida"],
  score: 0.88,
};

/** Sentencias que cita la predicción héroe (alta calidad, anti-alucinación). */
export const SENTENCIAS_HEROE: SentenciaRef[] = [T760, T016, T1059];

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
    "El caso reúne los factores que el precedente constitucional reconoce como determinantes de un fallo favorable: (i) prescripción expresa del médico tratante; (ii) sujeto de especial protección constitucional (adulta mayor de 68 años); (iii) servicio incluido en el PBS, por lo que la EPS está obligada a prestarlo con cargo a la UPC; (iv) deterioro funcional progresivo que configura urgencia. La jurisprudencia (T-760/2008, T-016/2007, T-1059/2006) ha amparado de forma reiterada la negativa o demora injustificada de procedimientos quirúrgicos ordenados, descartando que trámites administrativos de pertinencia puedan obstruir el acceso. La probabilidad de amparo es muy alta.",
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
    "Precedente reiterado: T-760/2008, T-016/2007, T-1059/2006",
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

La negativa u obstaculización injustificada de un servicio prescrito por el médico tratante vulnera el derecho fundamental a la salud. El concepto del médico tratante prevalece sobre consideraciones administrativas de la EPS (Sentencias T-760/2008, T-016/2007 y T-1059/2006).

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

2. **Prevalencia del médico tratante.** Conforme a las Sentencias **T-1059 de 2006** y **T-016 de 2007**, el concepto del médico tratante prevalece sobre las consideraciones administrativas de la entidad; los trámites internos de pertinencia no pueden obstaculizar un servicio prescrito.

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
