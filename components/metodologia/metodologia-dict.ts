// components/metodologia/metodologia-dict.ts — Diccionario LOCAL de /metodologia.
//
// Aislamiento deliberado (igual que /impacto): esta vista NO toca
// lib/i18n/index.ts ni ningún diccionario global. Importa SÓLO useLang()
// (lectura) y resuelve la copia con este diccionario local por idioma.
// Forma { es: {...}, en: {...} } con la misma estructura de claves; el
// componente accede vía metodologiaDict(lang).
//
// PRINCIPIO DE INTEGRIDAD (Amparo): toda cifra y todo enlace de esta página
// es verificable. Los datasets reales, las URL oficiales y el conteo del
// corpus viven en DATA (abajo) con su procedencia; la copia narrativa vive
// en los árboles es/en. Inglés nativo, no traducción literal.

import type { Lang } from "@/lib/i18n";

/* ──────────────────────────────────────────────────────────────────────────
   DATA — constantes verificables de la página (fuentes, enlaces, conteos).
   No es copia traducible: son hechos. La copia los referencia por interpolación.
   ────────────────────────────────────────────────────────────────────────── */
export const DATA = {
  /** Tutelas de salud (Corte Constitucional, dataset datos.gov.co). */
  tutelasCorte: 197_737,
  /** Tutelas de salud reportadas por la Defensoría del Pueblo (2023). */
  tutelasDefensoria: 197_765,
  /** Coincidencia entre ambas fuentes. */
  matchPct: "99,99%",
  matchPctEn: "99.99%",
  /** Año de referencia de las cifras de tutela. */
  anioTutelas: 2023,
  /** Sentencias T verificadas en el corpus jurídico. */
  sentenciasCorpus: 38,
  /** La cita alucinada que el propio sistema cazó y eliminó. */
  citaAlucinada: "T-1059/2006",
  /** Sentencia ancla, real y verificada (para el chip clicable de ejemplo). */
  sentenciaAncla: "T-760/2008",
  sentenciaAnclaUrl:
    "https://www.corteconstitucional.gov.co/relatoria/2008/t-760-08.htm",
  /** Datasets de datos abiertos usados, con su identificador estable. */
  datasets: {
    tutelas: {
      id: "xkyt-k6pk",
      url: "https://www.datos.gov.co/d/xkyt-k6pk",
    },
    reps: {
      id: "c36g-9fc2",
      url: "https://www.datos.gov.co/d/c36g-9fc2",
    },
  },
  /** Relatoría oficial de la Corte Constitucional. */
  relatoriaUrl: "https://www.corteconstitucional.gov.co/relatoria/",
  /** Defensoría del Pueblo. */
  defensoriaUrl: "https://www.defensoria.gov.co/",
} as const;

/** Un enlace nombrado dentro de una fuente. */
export interface SourceLink {
  label: string;
  url: string;
}

/** Una fila de la tabla de datasets. */
export interface DatasetRow {
  name: string;
  what: string;
  source: string;
  link: SourceLink;
  note: string;
}

type Dict = {
  meta: { title: string; description: string };
  hero: {
    eyebrow: string;
    title: string;
    subtitle: string;
    badge: string;
  };
  toc: {
    title: string;
    data: string;
    corpus: string;
    model: string;
    ethics: string;
  };
  // 1 · Datos
  data: {
    eyebrow: string;
    title: string;
    intro: string;
    tableHead: { dataset: string; what: string; source: string };
    rows: DatasetRow[];
    validation: {
      title: string;
      body: string;
      court: string;
      ombudsman: string;
      matchLabel: string;
      note: string;
    };
  };
  // 2 · Corpus jurídico
  corpus: {
    eyebrow: string;
    title: string;
    intro: string;
    countLabel: string;
    countUnit: string;
    verifiedTag: string;
    guardrail: {
      title: string;
      body: string;
      points: string[];
    };
    audit: {
      title: string;
      lead: string;
      body: string;
      anchorIntro: string;
      kicker: string;
    };
  };
  // 3 · Modelo
  model: {
    eyebrow: string;
    title: string;
    intro: string;
    cards: {
      opus: { tag: string; title: string; body: string };
      haiku: { tag: string; title: string; body: string };
      rag: { tag: string; title: string; body: string };
    };
    humanTitle: string;
    humanBody: string;
  };
  // 4 · Límites y ética
  ethics: {
    eyebrow: string;
    title: string;
    intro: string;
    items: { title: string; body: string }[];
  };
  // Footer
  footer: {
    sourcesTitle: string;
    sources: SourceLink[];
    disclaimer: string;
    backToImpact: string;
    tryDemo: string;
  };
};

/* ── ESPAÑOL ─────────────────────────────────────────────────────────────── */
const es: Dict = {
  meta: {
    title: "Metodología y fuentes · Amparo",
    description:
      "Cómo construimos Amparo: datasets oficiales, validación de datos, corpus jurídico verificado, guardrail anti-alucinación y decisión humana en el centro.",
  },
  hero: {
    eyebrow: "Transparencia · Cómo está hecho",
    title: "Metodología y fuentes",
    subtitle:
      "Amparo se sostiene sobre datos públicos verificables y jurisprudencia real. Aquí abrimos cada fuente, cada validación y cada límite —sin letra pequeña.",
    badge: "Fuentes oficiales · enlaces verificables",
  },
  toc: {
    title: "En esta página",
    data: "Los datos",
    corpus: "El corpus jurídico",
    model: "El modelo de IA",
    ethics: "Límites y ética",
  },
  data: {
    eyebrow: "01 · Los datos",
    title: "Datos públicos, trazables hasta la fuente",
    intro:
      "Ningún número de Amparo nace de la nada. Cada dataset es público, tiene un identificador estable y se puede abrir y reproducir. Estos son los tres que sostienen la plataforma.",
    tableHead: {
      dataset: "Dataset",
      what: "Qué aporta",
      source: "Fuente y enlace",
    },
    rows: [
      {
        name: "Tutelas en salud",
        what: "Conteo de tutelas de salud por departamento (2023), base del Atlas y de la proyección de impacto.",
        source: "Corte Constitucional · datos.gov.co",
        link: { label: "datos.gov.co · xkyt-k6pk", url: DATA.datasets.tutelas.url },
        note: "Dataset xkyt-k6pk",
      },
      {
        name: "Prestadores (REPS)",
        what: "Registro Especial de Prestadores de Servicios de Salud: IPS habilitadas para ubicar al prestador y al accionado.",
        source: "MinSalud · datos.gov.co",
        link: { label: "datos.gov.co · c36g-9fc2", url: DATA.datasets.reps.url },
        note: "Dataset c36g-9fc2",
      },
      {
        name: "Informe de tutela",
        what: "Cifras agregadas de tutela en salud que usamos para validar el conteo de la Corte de forma independiente.",
        source: "Defensoría del Pueblo (2023)",
        link: { label: "defensoria.gov.co", url: DATA.defensoriaUrl },
        note: "Informe anual de tutela",
      },
    ],
    validation: {
      title: "Validación cruzada del dato base",
      body: "El total de tutelas de salud no descansa en una sola fuente. Cruzamos el conteo de la Corte Constitucional con el reporte independiente de la Defensoría del Pueblo y las dos cifras coinciden casi exactamente.",
      court: "Corte Constitucional",
      ombudsman: "Defensoría del Pueblo",
      matchLabel: "de coincidencia",
      note: "Dos fuentes independientes que convergen en la misma realidad: la base sobre la que proyectamos el impacto es sólida, no un supuesto.",
    },
  },
  corpus: {
    eyebrow: "02 · El corpus jurídico",
    title: "Jurisprudencia real, verificada una a una",
    intro:
      "Amparo razona sobre un corpus curado de Sentencias T de la Corte Constitucional en materia de salud. Cada sentencia se contrastó contra la relatoría oficial: existe, dice lo que decimos que dice y enlaza a su fuente.",
    countLabel: "Sentencias T verificadas",
    countUnit: "en el corpus",
    verifiedTag: "Contrastadas con la relatoría oficial",
    guardrail: {
      title: "El guardrail anti-alucinación",
      body: "La regla de oro de Amparo: el sistema sólo puede citar sentencias que existen en el corpus verificado. El modelo no “recuerda” jurisprudencia de su entrenamiento ni inventa radicados; recupera del corpus y cita lo recuperado.",
      points: [
        "Toda cita visible enlaza a la relatoría oficial de la Corte (fuente clicable).",
        "Si una sentencia no está en el corpus verificado, el sistema no la cita.",
        "El predictor argumenta sobre precedente recuperado, nunca sobre memoria del modelo.",
      ],
    },
    audit: {
      title: "Cuando nuestro propio sistema cazó una cita falsa",
      lead: "La prueba de que el guardrail funciona la dio el guardrail mismo.",
      body: "Durante la curaduría, el sistema marcó una sentencia que no resistía el contraste con la relatoría oficial: el radicado {cita} no correspondía a la jurisprudencia que pretendía respaldar. Nuestro propio control la cazó y la eliminamos del corpus. Preferimos un corpus más pequeño y cierto que uno más grande y dudoso.",
      anchorIntro:
        "Así se ve una cita que SÍ pasa el control —existe, está verificada y enlaza a su fuente oficial:",
      kicker: "Cita eliminada por auto-auditoría",
    },
  },
  model: {
    eyebrow: "03 · El modelo de IA",
    title: "Claude, con recuperación y un humano al final",
    intro:
      "Amparo usa los modelos Claude de Anthropic dentro de una arquitectura RAG (recuperación + generación). El modelo no decide solo: estructura, recupera y propone; la decisión final siempre es de una persona.",
    cards: {
      opus: {
        tag: "Razonamiento",
        title: "Claude Opus razona",
        body: "El análisis jurídico fino —admisibilidad, pronóstico, fundamentación— lo lleva el modelo más capaz, siempre sobre el precedente recuperado del corpus.",
      },
      haiku: {
        tag: "Triaje",
        title: "Claude Haiku tría",
        body: "El triaje rápido y de alto volumen (clasificar, ordenar, enrutar) corre en un modelo ligero y económico. La capacidad cara se reserva para lo que la necesita.",
      },
      rag: {
        tag: "Recuperación",
        title: "RAG sobre el corpus",
        body: "Antes de redactar, el sistema recupera del corpus verificado las sentencias pertinentes y razona sobre ellas. El grounding jurídico es real, no decorativo.",
      },
    },
    humanTitle: "La decisión final siempre es humana",
    humanBody:
      "Amparo no falla tutelas ni reemplaza al juez, al abogado o a la EPS. Estructura el caso, propone y fundamenta; quien decide, firma y asume la responsabilidad es siempre una persona. La IA está en el loop, nunca al mando.",
  },
  ethics: {
    eyebrow: "04 · Límites y ética",
    title: "Lo que Amparo no es",
    intro:
      "La transparencia incluye decir con claridad dónde están los límites. Estos son explícitos y deliberados.",
    items: [
      {
        title: "Son estimaciones, no certezas",
        body: "Las predicciones y proyecciones son estimaciones de apoyo construidas sobre supuestos visibles. Un resultado probable no es una garantía: el caso concreto lo resuelve el juez.",
      },
      {
        title: "Los datos de paciente del demo son ficticios",
        body: "Los casos que se ven en la plataforma de demostración son inventados con fines ilustrativos. No corresponden a personas reales ni a expedientes reales.",
      },
      {
        title: "No es asesoría jurídica vinculante",
        body: "Amparo es una herramienta de apoyo asistida por IA. No sustituye la asesoría de un profesional del derecho ni constituye consejo legal que obligue a nadie.",
      },
      {
        title: "Privacidad y datos personales",
        body: "Tratamos la información del caso con minimización de datos y propósito acotado. Nada de lo sensible se usa para entrenar modelos de terceros.",
      },
    ],
  },
  footer: {
    sourcesTitle: "Fuentes oficiales",
    sources: [
      {
        label:
          "Corte Constitucional de Colombia — relatoría oficial (jurisprudencia)",
        url: DATA.relatoriaUrl,
      },
      {
        label: "Tutelas de salud por departamento — datos.gov.co (xkyt-k6pk)",
        url: DATA.datasets.tutelas.url,
      },
      {
        label:
          "Registro Especial de Prestadores (REPS) — datos.gov.co (c36g-9fc2)",
        url: DATA.datasets.reps.url,
      },
      {
        label: "Defensoría del Pueblo — informe de tutela",
        url: DATA.defensoriaUrl,
      },
    ],
    disclaimer:
      "Amparo es una herramienta de apoyo asistida por IA; no constituye asesoría jurídica vinculante y la decisión final siempre es humana. Los datos de paciente del demo son ficticios. Las cifras provienen de fuentes públicas citadas y enlazadas en esta página.",
    backToImpact: "Ver el impacto a escala",
    tryDemo: "Probar el demo",
  },
};

/* ── ENGLISH (native) ────────────────────────────────────────────────────── */
const en: Dict = {
  meta: {
    title: "Methodology & sources · Amparo",
    description:
      "How we built Amparo: official datasets, data validation, a verified legal corpus, an anti-hallucination guardrail, and human judgment at the center.",
  },
  hero: {
    eyebrow: "Transparency · How it's built",
    title: "Methodology & sources",
    subtitle:
      "Amparo stands on verifiable public data and real case law. Here we open up every source, every validation, and every limit—no fine print.",
    badge: "Official sources · verifiable links",
  },
  toc: {
    title: "On this page",
    data: "The data",
    corpus: "The legal corpus",
    model: "The AI model",
    ethics: "Limits & ethics",
  },
  data: {
    eyebrow: "01 · The data",
    title: "Public data, traceable to the source",
    intro:
      "No number in Amparo comes out of thin air. Every dataset is public, carries a stable identifier, and can be opened and reproduced. These are the three that hold up the platform.",
    tableHead: {
      dataset: "Dataset",
      what: "What it provides",
      source: "Source & link",
    },
    rows: [
      {
        name: "Health tutelas",
        what: "Count of health tutelas by department (2023), the basis for the Atlas and the impact projection.",
        source: "Constitutional Court · datos.gov.co",
        link: { label: "datos.gov.co · xkyt-k6pk", url: DATA.datasets.tutelas.url },
        note: "Dataset xkyt-k6pk",
      },
      {
        name: "Providers (REPS)",
        what: "Special Registry of Health Service Providers: licensed IPS used to locate the provider and the respondent.",
        source: "Health Ministry · datos.gov.co",
        link: { label: "datos.gov.co · c36g-9fc2", url: DATA.datasets.reps.url },
        note: "Dataset c36g-9fc2",
      },
      {
        name: "Tutela report",
        what: "Aggregate health-tutela figures we use to validate the Court's count independently.",
        source: "Ombudsman's Office (2023)",
        link: { label: "defensoria.gov.co", url: DATA.defensoriaUrl },
        note: "Annual tutela report",
      },
    ],
    validation: {
      title: "Cross-validation of the base figure",
      body: "The total of health tutelas does not rest on a single source. We cross the Constitutional Court's count with the Ombudsman's independent report, and the two figures match almost exactly.",
      court: "Constitutional Court",
      ombudsman: "Ombudsman's Office",
      matchLabel: "match",
      note: "Two independent sources converging on the same reality: the basis for our impact projection is solid, not an assumption.",
    },
  },
  corpus: {
    eyebrow: "02 · The legal corpus",
    title: "Real case law, verified one by one",
    intro:
      "Amparo reasons over a curated corpus of Constitutional Court health-rights rulings (Sentencias T). Each one was checked against the official court record: it exists, it says what we say it says, and it links to its source.",
    countLabel: "Verified T-rulings",
    countUnit: "in the corpus",
    verifiedTag: "Checked against the official court record",
    guardrail: {
      title: "The anti-hallucination guardrail",
      body: "Amparo's golden rule: the system may only cite rulings that exist in the verified corpus. The model does not “recall” case law from its training or invent docket numbers; it retrieves from the corpus and cites what it retrieves.",
      points: [
        "Every visible citation links to the Court's official record (a clickable source).",
        "If a ruling is not in the verified corpus, the system does not cite it.",
        "The predictor argues from retrieved precedent, never from the model's memory.",
      ],
    },
    audit: {
      title: "When our own system caught a fake citation",
      lead: "The proof that the guardrail works came from the guardrail itself.",
      body: "During curation, the system flagged a ruling that didn't survive the check against the official record: docket number {cita} did not match the case law it claimed to support. Our own safeguard caught it, and we removed it from the corpus. We'd rather have a smaller, certain corpus than a larger, doubtful one.",
      anchorIntro:
        "This is what a citation that DOES pass the check looks like—it exists, it's verified, and it links to its official source:",
      kicker: "Citation removed by self-audit",
    },
  },
  model: {
    eyebrow: "03 · The AI model",
    title: "Claude, with retrieval and a human at the end",
    intro:
      "Amparo uses Anthropic's Claude models inside a RAG architecture (retrieval + generation). The model doesn't decide on its own: it structures, retrieves, and proposes; the final call is always a person's.",
    cards: {
      opus: {
        tag: "Reasoning",
        title: "Claude Opus reasons",
        body: "The fine legal analysis—admissibility, forecast, justification—runs on the most capable model, always over precedent retrieved from the corpus.",
      },
      haiku: {
        tag: "Triage",
        title: "Claude Haiku triages",
        body: "Fast, high-volume triage (classify, sort, route) runs on a light, low-cost model. Expensive capacity is reserved for what truly needs it.",
      },
      rag: {
        tag: "Retrieval",
        title: "RAG over the corpus",
        body: "Before drafting, the system retrieves the relevant rulings from the verified corpus and reasons over them. The legal grounding is real, not decorative.",
      },
    },
    humanTitle: "The final decision is always human",
    humanBody:
      "Amparo does not rule on tutelas or replace the judge, the lawyer, or the EPS. It structures the case, proposes, and justifies; whoever decides, signs, and bears responsibility is always a person. The AI is in the loop, never in charge.",
  },
  ethics: {
    eyebrow: "04 · Limits & ethics",
    title: "What Amparo is not",
    intro:
      "Transparency includes saying plainly where the limits are. These are explicit and deliberate.",
    items: [
      {
        title: "They are estimates, not certainties",
        body: "Predictions and projections are supporting estimates built on visible assumptions. A likely outcome is not a guarantee: the specific case is decided by the judge.",
      },
      {
        title: "Demo patient data is fictional",
        body: "The cases shown on the demonstration platform are invented for illustration. They do not correspond to real people or real case files.",
      },
      {
        title: "It is not binding legal advice",
        body: "Amparo is an AI-assisted support tool. It does not replace advice from a legal professional, nor does it constitute legal counsel that binds anyone.",
      },
      {
        title: "Privacy and personal data",
        body: "We handle case information with data minimization and a narrow purpose. Nothing sensitive is used to train third-party models.",
      },
    ],
  },
  footer: {
    sourcesTitle: "Official sources",
    sources: [
      {
        label: "Constitutional Court of Colombia — official record (case law)",
        url: DATA.relatoriaUrl,
      },
      {
        label: "Health tutelas by department — datos.gov.co (xkyt-k6pk)",
        url: DATA.datasets.tutelas.url,
      },
      {
        label:
          "Special Registry of Providers (REPS) — datos.gov.co (c36g-9fc2)",
        url: DATA.datasets.reps.url,
      },
      {
        label: "Ombudsman's Office — tutela report",
        url: DATA.defensoriaUrl,
      },
    ],
    disclaimer:
      "Amparo is an AI-assisted support tool; it is not binding legal advice and the final decision is always human. Demo patient data is fictional. Figures come from the public sources cited and linked on this page.",
    backToImpact: "See the impact at scale",
    tryDemo: "Try the demo",
  },
};

const DICT: Record<Lang, Dict> = { es, en };

/** Resuelve el diccionario local por idioma activo (lectura). */
export function metodologiaDict(lang: Lang): Dict {
  return DICT[lang];
}

export type MetodologiaDict = Dict;
