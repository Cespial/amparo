// components/impacto/impacto-dict.ts — Diccionario LOCAL de la vista /impacto.
//
// Aislamiento deliberado: esta vista NO toca lib/i18n/index.ts (lo edita otro
// agente). Importamos SÓLO useLang() (lectura) y resolvemos la copia con este
// diccionario local por idioma. Forma: { es: {...}, en: {...} } con la misma
// estructura de claves; el componente accede vía DICT[lang].
//
// PRINCIPIO DE INTEGRIDAD DE DATOS (Amparo): toda cifra que NO provenga de una
// fuente pública verificable va etiquetada como SUPUESTO o ESTIMACIÓN en la UI.
// Las constantes del modelo viven en MODELO (abajo) con su procedencia.

import type { Lang } from "@/lib/i18n";

/* ──────────────────────────────────────────────────────────────────────────
   MODELO — constantes del cálculo de descongestión.
   Cada valor declara su procedencia: "fuente" (cifra pública verificable) o
   "supuesto" (parámetro de modelo defendible, marcado como tal en la UI).
   ────────────────────────────────────────────────────────────────────────── */
export const MODELO = {
  /** Tutelas de salud radicadas en 2023 en Colombia.
   *  FUENTE: Corte Constitucional / Defensoría del Pueblo (informe de tutela). */
  tutelasSaludAnio: 197_737,
  /** Año de referencia de la cifra anterior. */
  anioBase: 2023,
  /** Cuota de tutelas de salud que se conceden (≈). FUENTE: Defensoría. */
  tasaConcesion: 0.8,
  /** Plazo legal de fallo de la tutela (días hábiles). FUENTE: Decreto 2591/1991. */
  plazoFalloDiasHabiles: 10,
  /** Horas-juez (y despacho) consumidas por una tutela de salud, de extremo a
   *  extremo (reparto, sustanciación, fallo, eventual impugnación/desacato).
   *  SUPUESTO de modelo — editable en la UI. */
  horasJuezPorTutela: 6,
  /** Costo de tramitar una tutela en el despacho judicial (COP).
   *  SUPUESTO de modelo conservador — editable en la UI. No es cifra oficial. */
  costoPorTutelaCop: 1_200_000,
  /** Jornada laboral de referencia para convertir horas-juez en días-juez. */
  horasPorDiaJuez: 8,
  /** Rango del control deslizante (% de tutelas resueltas antes del juez). */
  sliderMin: 20,
  sliderMax: 70,
  /** Default conservador, por debajo de la descongestión proyectada del pitch (~57%). */
  sliderDefault: 45,
  /** Descongestión temprana PROYECTADA en el pitch de Amparo (referencia, no medición). */
  demoResolucion: 57,
} as const;

type Dict = {
  meta: { title: string; description: string };
  hero: {
    eyebrow: string;
    titleLead: string;
    titleEmphasis: string;
    subtitle: string;
    thesis: string;
    badgeEstimacion: string;
  };
  proj: {
    eyebrow: string;
    title: string;
    intro: string;
    sliderLabel: string;
    sliderHint: string;
    demoNote: string;
    estimacion: string;
    perYear: string;
    metrics: {
      desviadas: { label: string; unit: string; help: string };
      diasJuez: { label: string; unit: string; help: string };
      ahorro: { label: string; unit: string; help: string };
    };
    chart: {
      title: string;
      before: string;
      after: string;
      beforeNote: string;
      afterNote: string;
      axis: string;
    };
    assumptions: {
      title: string;
      intro: string;
      sourceTag: string;
      assumptionTag: string;
      editableTag: string;
      items: {
        tutelas: string;
        plazo: string;
        concesion: string;
        horas: string;
        costo: string;
        jornada: string;
      };
      controlsTitle: string;
      horasControl: string;
      costoControl: string;
      reset: string;
    };
  };
  modelo: {
    eyebrow: string;
    title: string;
    intro: string;
    who: string;
    problem: string;
    pricing: string;
    cards: {
      b2g: { tag: string; title: string; who: string; problem: string; pricing: string };
      b2b: { tag: string; title: string; who: string; problem: string; pricing: string };
      b2c: { tag: string; title: string; who: string; problem: string; pricing: string };
    };
    donut: { title: string; note: string };
  };
  why: {
    eyebrow: string;
    title: string;
    nowTitle: string;
    nowBody: string;
    usTitle: string;
    usBody: string;
    moat: string[];
  };
  footer: {
    sourcesTitle: string;
    sources: string[];
    disclaimer: string;
  };
};

const es: Dict = {
  meta: {
    title: "Si Amparo escalara · Impacto",
    description:
      "Proyección de descongestión judicial y caso de negocio de Amparo a escala nacional. Estimaciones con supuestos visibles.",
  },
  hero: {
    eyebrow: "Viabilidad · Impacto a escala",
    titleLead: "Si Amparo escalara a",
    titleEmphasis: "nivel nacional",
    subtitle:
      "Una proyección honesta de cuánto descongestionaría la justicia en salud resolver las disputas antes de que lleguen al juez.",
    thesis:
      "Cada tutela que resolvemos de común acuerdo es un fallo que el sistema judicial no tiene que dictar. Amparo descongestiona la justicia en salud resolviendo antes del juez —sin quitarle a nadie su derecho a acudir a él.",
    badgeEstimacion: "Proyección · supuestos visibles",
  },
  proj: {
    eyebrow: "El corazón del caso",
    title: "Proyección de descongestión",
    intro:
      "Partimos de cifras reales: en {anio} se radicaron {tutelas} tutelas de salud en Colombia, que deben fallarse en ≤{plazo} días hábiles. Mueve el control para ver cuántas resolveríamos antes del juez.",
    sliderLabel: "% de tutelas resueltas antes del juez con Amparo",
    sliderHint:
      "Rango {min}%–{max}%. El valor por defecto ({def}%) es conservador: queda por debajo de la descongestión que proyecta el pitch (~{demo}%).",
    demoNote: "Pitch: descongestión proyectada ~{demo}%",
    estimacion: "ESTIMACIÓN",
    perYear: "al año",
    metrics: {
      desviadas: {
        label: "Tutelas desviadas del despacho",
        unit: "tutelas/año",
        help: "Disputas resueltas de común acuerdo que ya no necesitan fallo judicial.",
      },
      diasJuez: {
        label: "Días-juez ahorrados",
        unit: "días-juez/año",
        help: "Horas-juez liberadas convertidas a jornadas de {jornada} h.",
      },
      ahorro: {
        label: "Ahorro estimado al sistema judicial",
        unit: "COP/año",
        help: "Tutelas desviadas × costo por tutela (supuesto).",
      },
    },
    chart: {
      title: "Carga del despacho judicial: antes y después",
      before: "Sin Amparo",
      after: "Con Amparo",
      beforeNote: "{n} tutelas llegan al juez",
      afterNote: "{n} tutelas llegan al juez",
      axis: "Tutelas de salud que llegan al despacho/año",
    },
    assumptions: {
      title: "Supuestos del modelo",
      intro:
        "Toda cifra está aquí. Marcamos lo que es FUENTE pública verificable y lo que es SUPUESTO de modelo. Nada se inventa sin etiqueta.",
      sourceTag: "FUENTE",
      assumptionTag: "SUPUESTO",
      editableTag: "EDITABLE",
      items: {
        tutelas:
          "{tutelas} tutelas de salud radicadas en {anio} (Corte Constitucional / Defensoría del Pueblo).",
        plazo:
          "La tutela debe fallarse en ≤{plazo} días hábiles (Decreto 2591 de 1991).",
        concesion:
          "≈{concesion}% de las tutelas de salud se conceden (Defensoría del Pueblo).",
        horas:
          "{horas} horas-juez por tutela, de extremo a extremo (reparto, sustanciación, fallo, eventual impugnación).",
        costo:
          "{costo} por tutela tramitada en el despacho. Cifra conservadora, no oficial.",
        jornada:
          "Jornada de {jornada} horas para convertir horas-juez en días-juez.",
      },
      controlsTitle: "Ajusta los supuestos sensibles",
      horasControl: "Horas-juez por tutela",
      costoControl: "Costo por tutela (COP)",
      reset: "Restablecer supuestos",
    },
  },
  modelo: {
    eyebrow: "Cómo se sostiene",
    title: "Modelo de negocio",
    intro:
      "Descongestionar la justicia en salud crea valor para tres actores a la vez. Cobramos a quien más ahorra; el paciente nunca paga por acceder.",
    who: "A quién",
    problem: "Qué resuelve",
    pricing: "Cómo se cobra",
    cards: {
      b2g: {
        tag: "B2G",
        title: "Rama Judicial · Defensoría · MinSalud",
        who: "Despachos y Defensoría que reparten y fallan miles de tutelas de salud repetidas dentro del plazo de 10 días.",
        problem:
          "Descongestión como servicio: triage y desviación temprana de los casos evidentes, más expedientes pre-estructurados (hechos, pretensiones, precedente) cuando sí llegan al juez.",
        pricing:
          "Contratación pública (SECOP / convenio) por implementación + tarifa anual por despacho o por tutela gestionada, con cláusula de desempeño atada a tutelas desviadas y a días de fallo ahorrados.",
      },
      b2b: {
        tag: "B2B",
        title: "EPS y aseguradores",
        who: "EPS expuestas a tutelas, sanciones de la Supersalud y reincidencia en incidentes de desacato.",
        problem:
          "Menos tutelas en su contra y menos desacatos: la EPS ve el costo real de negar y cede temprano los casos que perdería, con trazabilidad de cada acuerdo.",
        pricing:
          "SaaS por afiliado/mes (fee de plataforma) + éxito por caso resuelto sin llegar al juez; tarifa decreciente por volumen y SLA de respuesta.",
      },
      b2c: {
        tag: "B2C",
        title: "Pacientes · freemium",
        who: "Personas que necesitan acceder a su derecho a la salud, sin abogado ni lenguaje jurídico.",
        problem:
          "Acceso gratuito de extremo a extremo: contar el caso por voz, entender si la tutela procede y buscar acuerdo antes de litigar.",
        pricing:
          "El trámite es gratuito siempre (el acceso nunca se cobra). Premium opcional: seguimiento del plazo, alertas y acompañamiento humano —nunca condiciona radicar la tutela.",
      },
    },
    donut: {
      title: "Tres fuentes de ingreso, un mismo ahorro",
      note: "Reparto ilustrativo de la propuesta de valor entre actores. No es proyección financiera.",
    },
  },
  why: {
    eyebrow: "Momento y foso",
    title: "Por qué ahora y por qué nosotros",
    nowTitle: "Por qué ahora",
    nowBody:
      "Las cortes están saturadas: en 2023 la salud fue casi un tercio de toda la tutela del país (197.737 de 633.475) y descongestionarla ya es urgente. El plazo de 10 días hábiles es ley; el sistema no da abasto.",
    usTitle: "Por qué nosotros",
    usBody:
      "Nuestro foso no es un chatbot: es grounding jurídico real sobre la norma y la jurisprudencia colombiana, operación bilingüe es/en y un humano en el loop en cada decisión sensible.",
    moat: [
      "Grounding jurídico real (norma + jurisprudencia)",
      "Bilingüe es/en, accesible y por voz",
      "Humano en el loop en lo sensible",
    ],
  },
  footer: {
    sourcesTitle: "Fuentes",
    sources: [
      "Corte Constitucional de Colombia — conteo por departamento de tutelas de salud 2023 (datos.gov.co, dataset xkyt-k6pk): 197.737, que coincide al 99,99% con las 197.765 que reporta la Defensoría del Pueblo (informe de tutela 2023).",
      "Decreto 2591 de 1991 — plazo de fallo de la tutela (≤10 días hábiles).",
      "Pitch de Amparo — descongestión temprana PROYECTADA de referencia (~57%); es una proyección del producto, no una medición.",
    ],
    disclaimer:
      "Las proyecciones de esta página son ESTIMACIONES construidas sobre los supuestos visibles arriba. Los parámetros marcados como SUPUESTO son defendibles pero no cifras oficiales; ajústalos para ver la sensibilidad. Ninguna cifra se presenta como dato oficial sin su fuente.",
  },
};

const en: Dict = {
  meta: {
    title: "If Amparo scaled · Impact",
    description:
      "Projected judicial decongestion and business case for Amparo at national scale. Estimates with visible assumptions.",
  },
  hero: {
    eyebrow: "Viability · Impact at scale",
    titleLead: "If Amparo scaled",
    titleEmphasis: "nationwide",
    subtitle:
      "An honest projection of how much it would decongest health justice to resolve disputes before they reach the judge.",
    thesis:
      "Every dispute we settle by agreement is a ruling the courts never have to write. Amparo decongests health justice by resolving before the judge —without taking away anyone's right to reach one.",
    badgeEstimacion: "Projection · visible assumptions",
  },
  proj: {
    eyebrow: "The heart of the case",
    title: "Decongestion projection",
    intro:
      "We start from real figures: in {anio}, {tutelas} health tutelas were filed in Colombia, each due within ≤{plazo} business days. Move the control to see how many we would resolve before the judge.",
    sliderLabel: "% of tutelas resolved before the judge with Amparo",
    sliderHint:
      "Range {min}%–{max}%. The default ({def}%) is conservative: it stays below the decongestion the pitch projects (~{demo}%).",
    demoNote: "Pitch: projected decongestion ~{demo}%",
    estimacion: "ESTIMATE",
    perYear: "per year",
    metrics: {
      desviadas: {
        label: "Tutelas diverted from the court",
        unit: "tutelas/year",
        help: "Disputes settled by agreement that no longer need a judicial ruling.",
      },
      diasJuez: {
        label: "Judge-days saved",
        unit: "judge-days/year",
        help: "Freed judge-hours converted into {jornada}-hour working days.",
      },
      ahorro: {
        label: "Estimated savings to the judiciary",
        unit: "COP/year",
        help: "Diverted tutelas × cost per tutela (assumption).",
      },
    },
    chart: {
      title: "Court caseload: before and after",
      before: "Without Amparo",
      after: "With Amparo",
      beforeNote: "{n} tutelas reach the judge",
      afterNote: "{n} tutelas reach the judge",
      axis: "Health tutelas reaching the court/year",
    },
    assumptions: {
      title: "Model assumptions",
      intro:
        "Every figure is here. We label what is a verifiable public SOURCE and what is a model ASSUMPTION. Nothing is invented without a tag.",
      sourceTag: "SOURCE",
      assumptionTag: "ASSUMPTION",
      editableTag: "EDITABLE",
      items: {
        tutelas:
          "{tutelas} health tutelas filed in {anio} (Constitutional Court / Ombudsman's Office).",
        plazo:
          "A tutela must be ruled within ≤{plazo} business days (Decree 2591 of 1991).",
        concesion:
          "≈{concesion}% of health tutelas are granted (Ombudsman's Office).",
        horas:
          "{horas} judge-hours per tutela, end to end (assignment, drafting, ruling, possible appeal).",
        costo:
          "{costo} per tutela processed by the court. A conservative, non-official figure.",
        jornada:
          "An {jornada}-hour working day to convert judge-hours into judge-days.",
      },
      controlsTitle: "Tune the sensitive assumptions",
      horasControl: "Judge-hours per tutela",
      costoControl: "Cost per tutela (COP)",
      reset: "Reset assumptions",
    },
  },
  modelo: {
    eyebrow: "How it sustains itself",
    title: "Business model",
    intro:
      "Decongesting health justice creates value for three actors at once. We charge whoever saves the most; the patient never pays for access.",
    who: "Who",
    problem: "What it solves",
    pricing: "How we charge",
    cards: {
      b2g: {
        tag: "B2G",
        title: "Judiciary · Ombudsman · Health Ministry",
        who: "Courts and the Ombudsman that route and rule thousands of repeat health tutelas within the 10-day deadline.",
        problem:
          "Decongestion as a service: triage and early diversion of the obvious cases, plus pre-structured files (facts, claims, precedent) when they do reach the judge.",
        pricing:
          "Public procurement (framework/agreement) for rollout + an annual fee per court or per tutela handled, with a performance clause tied to tutelas diverted and ruling-days saved.",
      },
      b2b: {
        tag: "B2B",
        title: "EPS and insurers",
        who: "EPS exposed to tutelas, Supersalud penalties and repeat contempt incidents.",
        problem:
          "Fewer tutelas against them and fewer contempt actions: the EPS sees the real cost of denial and settles early the cases it would lose, with every agreement traceable.",
        pricing:
          "SaaS per member/month (platform fee) + success fee per case resolved before the judge; volume-decreasing rate and a response SLA.",
      },
      b2c: {
        tag: "B2C",
        title: "Patients · freemium",
        who: "People who need to access their right to health, with no lawyer and no legal jargon.",
        problem:
          "Free end-to-end access: tell the case by voice, understand whether the tutela holds, and seek agreement before litigating.",
        pricing:
          "The process is always free (access is never charged). Optional premium: deadline tracking, alerts and human support —it never gates filing the tutela.",
      },
    },
    donut: {
      title: "Three revenue streams, one shared saving",
      note: "Illustrative split of the value proposition across actors. Not a financial projection.",
    },
  },
  why: {
    eyebrow: "Timing and moat",
    title: "Why now and why us",
    nowTitle: "Why now",
    nowBody:
      "The courts are saturated: in 2023, health was nearly a third of every tutela filed in the country (197,737 of 633,475), and decongesting it is now urgent. The 10-business-day deadline is law; the system cannot keep up.",
    usTitle: "Why us",
    usBody:
      "Our moat is not a chatbot: it is real legal grounding on Colombian statute and case law, bilingual es/en operation, and a human in the loop on every sensitive decision.",
    moat: [
      "Real legal grounding (statute + case law)",
      "Bilingual es/en, accessible and by voice",
      "Human in the loop on sensitive matters",
    ],
  },
  footer: {
    sourcesTitle: "Sources",
    sources: [
      "Constitutional Court of Colombia — per-department count of 2023 health tutelas (datos.gov.co, dataset xkyt-k6pk): 197,737, a 99.99% match with the 197,765 reported by the Ombudsman's Office (2023 tutela report).",
      "Decree 2591 of 1991 — tutela ruling deadline (≤10 business days).",
      "Amparo pitch — reference PROJECTED early decongestion (~57%); a product projection, not a measurement.",
    ],
    disclaimer:
      "The projections on this page are ESTIMATES built on the assumptions shown above. Parameters marked ASSUMPTION are defensible but not official figures; adjust them to see the sensitivity. No figure is presented as an official datum without its source.",
  },
};

const DICT: Record<Lang, Dict> = { es, en };

/** Resuelve el diccionario local por idioma activo (lectura). */
export function impactoDict(lang: Lang): Dict {
  return DICT[lang];
}

export type ImpactoDict = Dict;
