// lib/i18n/dict/landing.ts — Namespace "landing".
// Todos los textos visibles de la landing (app/page.tsx → LandingClient).
// Usa estructura ANIDADA: el resolver soporta dot-path (p.ej. "hero.title").

export const landing = {
  es: {
    meta: {
      title: "Amparo — La justicia en salud, al alcance de todos",
      description:
        "Plataforma ODR de tutelas de salud de Colombia. Resuelve lo que tu EPS te negó —rápido, gratis y con respaldo en la jurisprudencia de la Corte Constitucional.",
    },

    hero: {
      badge: "ODR · Resolución de disputas en salud",
      titleLead: "La justicia en salud,",
      titleEmphasis: "al alcance de todos.",
      // {fourthParty} se sustituye con term.fourthParty en negrita.
      bodyLead: "Amparo es",
      bodyEmphasis: "la cuarta parte",
      bodyRest:
        ": te ayuda a resolver lo que tu EPS te negó —rápido, gratis y con respaldo en la jurisprudencia de la Corte Constitucional. Sin abogados, sin filas.",
      ctaTalk: "Habla con Amparo",
      ctaStart: "Empezar mi caso",
      linkMap: "Ver el mapa del problema",
      trust:
        "Respaldado en sentencias reales · La decisión final siempre es humana.",
    },

    stats: {
      heading: "El problema, en números",
      tutelas: {
        figure: "197.737",
        unit: "tutelas de salud · 2023",
        note: "La salud es el principal motivo de tutela en Colombia. Fuente: Corte Constitucional / Defensoría del Pueblo, 2023.",
      },
      granted: {
        figure: "80%",
        unit: "se conceden",
        note: "Porque pedían algo que ya era su derecho. Fuente: Defensoría del Pueblo, 2023.",
      },
      minutes: {
        figure: "minutos",
        unit: "no meses",
        note: "Lo que hoy tarda semanas, asistido por IA toma minutos.",
      },
    },

    how: {
      eyebrow: "Cómo funciona",
      heading: "Tres pasos. Cero formularios incomprensibles.",
      stepLabel: "Paso",
      steps: {
        tell: {
          title: "Cuéntalo con tus palabras",
          text: "Hablando o escribiendo, sin lenguaje jurídico. Amparo entiende tu caso y lo organiza por ti.",
        },
        assess: {
          title: "Amparo evalúa y actúa",
          text: "Verifica si tu tutela procede, predice el resultado citando sentencias reales y redacta el documento.",
        },
        resolve: {
          title: "Se resuelve",
          text: "Tu EPS cede antes del juez, o llega al juez con un fallo ya fundamentado, listo para revisar y firmar. Tú decides el camino.",
        },
      },
    },

    why: {
      eyebrow: "Por qué Amparo",
      heading: "Acceso real a la justicia, no solo a un formulario.",
      lead: "Acceder no es solo poder iniciar el trámite: es poder usarlo y llegar a un resultado justo. Amparo está diseñada para que cualquier persona lo logre.",
      values: {
        voice: {
          title: "Tu voz, primero",
          text: "Diseñada para todos, sin importar tu escolaridad. Cuenta tu historia y escúchala explicada.",
        },
        transparent: {
          title: "Sin caja negra",
          text: "Cada pronóstico se sustenta en jurisprudencia verificable de la Corte Constitucional.",
        },
        consistent: {
          title: "Decisiones consistentes",
          text: "El mismo reclamo recibe el mismo trato. Menos arbitrariedad, más equidad.",
        },
        human: {
          title: "La última palabra es humana",
          text: "Amparo no reemplaza al juez: le devuelve el tiempo para los casos que de verdad lo necesitan.",
        },
      },
    },

    explore: {
      eyebrow: "Explora la plataforma",
      heading: "Una disputa, cuatro miradas.",
      lead: "El mismo caso recorre al demandante, a la EPS y al juez —con total transparencia entre las partes.",
      enter: "Entrar",
      roles: {
        atlas: {
          label: "Atlas",
          desc: "El mapa del problema en Colombia",
        },
        demandante: {
          label: "Demandante",
          desc: "De tu historia a tu tutela",
        },
        demandado: {
          label: "Demandado · EPS",
          desc: "Resolver antes del juez",
        },
        juez: {
          label: "Juez",
          desc: "Despacho asistido por IA",
        },
      },
    },

    footer: {
      brand: "Amparo",
      disclaimer:
        "Amparo es una herramienta de apoyo asistida por IA; no constituye asesoría jurídica vinculante y la decisión final siempre es humana. Las predicciones son estimaciones basadas en jurisprudencia real de la Corte Constitucional de Colombia. Los casos y personas de esta demo son ficticios. Hackathon ODR 2026.",
    },
  },

  en: {
    meta: {
      title: "Amparo — Justice in health, within everyone's reach",
      description:
        "Colombia's ODR platform for health tutelas (constitutional injunctions). Resolve what your EPS (health insurer) denied —fast, free, and backed by Constitutional Court case law.",
    },

    hero: {
      badge: "ODR · Health dispute resolution",
      titleLead: "Justice in health,",
      titleEmphasis: "within everyone's reach.",
      bodyLead: "Amparo is",
      bodyEmphasis: "the fourth party",
      bodyRest:
        ": it helps you resolve what your EPS (health insurer) denied —fast, free, and backed by Constitutional Court case law. No lawyers, no lines.",
      ctaTalk: "Talk to Amparo",
      ctaStart: "Start my case",
      linkMap: "See the map of the problem",
      trust: "Grounded in real rulings · The final decision is always human.",
    },

    stats: {
      heading: "The problem, in numbers",
      tutelas: {
        figure: "197,737",
        unit: "health tutelas · 2023",
        note: "Health is the leading reason for filing a tutela (constitutional injunction) in Colombia. Source: Constitutional Court / Ombudsman's Office, 2023.",
      },
      granted: {
        figure: "80%",
        unit: "are granted",
        note: "Because they were asking for something that was already their right. Source: Ombudsman's Office, 2023.",
      },
      minutes: {
        figure: "minutes",
        unit: "not months",
        note: "What takes weeks today is done in minutes with AI assistance.",
      },
    },

    how: {
      eyebrow: "How it works",
      heading: "Three steps. Zero baffling forms.",
      stepLabel: "Step",
      steps: {
        tell: {
          title: "Tell it in your own words",
          text: "By speaking or typing, with no legal jargon. Amparo understands your case and organizes it for you.",
        },
        assess: {
          title: "Amparo assesses and acts",
          text: "It checks whether your tutela has merit, predicts the outcome citing real rulings, and drafts the document.",
        },
        resolve: {
          title: "It gets resolved",
          text: "Your EPS yields before reaching the judge, or the judge receives an already-reasoned ruling, ready to review and sign. You choose the path.",
        },
      },
    },

    why: {
      eyebrow: "Why Amparo",
      heading: "Real access to justice, not just to a form.",
      lead: "Access isn't only being able to start the process: it's being able to use it and reach a fair outcome. Amparo is designed so that anyone can.",
      values: {
        voice: {
          title: "Your voice, first",
          text: "Built for everyone, whatever your level of schooling. Tell your story and hear it explained back to you.",
        },
        transparent: {
          title: "No black box",
          text: "Every prediction is grounded in verifiable Constitutional Court case law.",
        },
        consistent: {
          title: "Consistent decisions",
          text: "The same claim gets the same treatment. Less arbitrariness, more fairness.",
        },
        human: {
          title: "The last word is human",
          text: "Amparo doesn't replace the judge: it gives back the time for the cases that truly need it.",
        },
      },
    },

    explore: {
      eyebrow: "Explore the platform",
      heading: "One dispute, four perspectives.",
      lead: "The same case moves through the claimant, the EPS, and the judge —with full transparency between the parties.",
      enter: "Open",
      roles: {
        atlas: {
          label: "Atlas",
          desc: "The map of the problem in Colombia",
        },
        demandante: {
          label: "Claimant",
          desc: "From your story to your tutela",
        },
        demandado: {
          label: "Respondent · EPS",
          desc: "Resolve before the judge",
        },
        juez: {
          label: "Judge",
          desc: "AI-assisted chambers",
        },
      },
    },

    footer: {
      brand: "Amparo",
      disclaimer:
        "Amparo is an AI-assisted support tool; it is not binding legal advice and the final decision is always human. Predictions are estimates based on real case law from Colombia's Constitutional Court. The cases and people in this demo are fictitious. ODR Hackathon 2026.",
    },
  },
} as const;
