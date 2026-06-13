// lib/i18n/dict/pitch.ts — Namespace "pitch".
// Todos los textos visibles del deck de pitch (app/pitch/deck.tsx).
// Usa estructura ANIDADA: el resolver soporta dot-path (p.ej. "problema.headline").
//
// Material que leerá un jurado angloparlante: el inglés debe ser nativo.
// Glosario: tutela → "tutela (constitutional injunction)" (1ª vez) luego "tutela";
// EPS → "EPS (health insurer)" (1ª vez) luego "EPS"; la cuarta parte → "the fourth party";
// descongestión → "decongestion"; derecho a la salud → "right to health".
// Las frases con énfasis se parten en (lead/strong/rest) para conservar el <strong>.

export const pitch = {
  es: {
    // Cabecera del deck (marca + kicker por slide)
    chrome: {
      brand: "Amparo",
      homeLabel: "Volver al inicio",
      exitLabel: "Salir del deck (Esc)",
    },

    nav: {
      prev: "Anterior",
      next: "Siguiente",
      toDemo: "Al demo",
      prevLabel: "Slide anterior",
      nextLabel: "Siguiente slide",
      toDemoLabel: "Ir al demo",
      slideOf: "Slide {index} de {total}",
      progressLabel: "Progreso del deck: slide {index} de {total}",
      dotsLabel: "Slides",
      goToSlide: "Ir al slide {index}: {kicker}",
      keyboardHint: "← / → navegar · Inicio / Fin extremos · Esc salir",
    },

    // Kickers (texto pequeño junto a la marca en la cabecera)
    kicker: {
      portada: "Amparo",
      problema: "El problema",
      persona: "La persona, no el caso",
      comoFunciona: "Cómo funciona",
      voz: "Voz · justicia procedimental",
      prediccion: "Sin caja negra",
      credibilidad: "Credibilidad · verificable",
      resolver: "Resolver antes de pelear",
      juez: "Humano en el loop",
      equidad: "Equidad · mediación Habermas",
      impacto: "Impacto · modelo",
      cierre: "Cierre",
    },

    // 1 · Portada
    portada: {
      brand: "Amparo",
      titleLead: "La",
      titleEmphasis: "cuarta parte",
      titleRest: "que descongestiona la justicia en salud.",
      subtitle:
        "Una plataforma de resolución en línea para las tutelas de salud de Colombia. Da voz a la persona, resuelve antes del juez y le devuelve al juez el tiempo para lo que de verdad importa.",
      tag: "amparo.help · Hackathon ODR 2026",
    },

    // 2 · El problema
    problema: {
      eyebrow: "El problema",
      headline: "Se demanda al Estado para recibir lo que ya es un derecho.",
      body: "La salud es el principal motivo de tutela en Colombia. La mayoría se conceden: la persona pedía algo que la ley ya le garantizaba. Es un sistema que obliga a litigar para acceder a lo evidente.",
      statsTitle: "El problema, en números",
      stat1: {
        figure: "197.737",
        unit: "tutelas de salud · 2023",
        note: "La salud es el primer motivo de tutela del país.",
      },
      stat2: {
        figure: "80%",
        unit: "se conceden",
        note: "Porque pedían algo que ya era su derecho.",
      },
      stat3: {
        figure: "meses",
        unit: "de espera",
        note: "Tiempo del juez consumido en casos repetidos y evidentes.",
      },
    },

    // 3 · La persona
    persona: {
      cardName: "Amparo, 68 años",
      cardDesc:
        "Le negaron la cirugía de cadera. No tiene abogado ni sabe por dónde empezar.",
      cardTag: "Y aun así, puede contar su historia.",
      eyebrow: "La persona, no el caso",
      headline: "Detrás de cada tutela hay alguien esperando.",
      body: "Conozcan a Amparo. No empezamos por el expediente: empezamos por la persona. Lo más importante para quien acude a la justicia es poder contar lo que le pasó —con sus propias palabras.",
    },

    // 4 · Cómo funciona
    comoFunciona: {
      eyebrow: "Cómo funciona",
      headline: "Tres pasos. Cero formularios incomprensibles.",
      stepLabel: "Paso",
      steps: {
        tell: {
          title: "Cuéntalo",
          text: "Hablando o escribiendo, sin lenguaje jurídico. Amparo entiende y organiza tu caso.",
        },
        assess: {
          title: "Amparo evalúa",
          text: "Verifica si la tutela procede y predice el resultado citando sentencias reales.",
        },
        resolve: {
          title: "Se resuelve",
          text: "Tu EPS cede antes del juez, o el juez decide con un fallo ya fundamentado.",
        },
      },
    },

    // 5 · Voz + avatar = acceso para todos
    voz: {
      eyebrow: "Voz · justicia procedimental",
      headline: "Tu voz, primero. Acceso real para todos.",
      bullet1: {
        lead: "Amparo",
        strong: "habla y escucha",
        rest: ": un avatar conversacional para quien no escribe con facilidad ni domina el lenguaje legal.",
      },
      bullet2: {
        lead: "Poder contar tu historia es el corazón de la",
        strong: "justicia procedimental",
        rest: "— lo que más valoran las personas frente a la justicia.",
      },
      bullet3: {
        lead: "Voz",
        strong: "+ transparencia",
        rest: "= acceso significativo, no solo poder radicar un trámite.",
      },
    },

    // 6 · Predicción citada en jurisprudencia
    prediccion: {
      eyebrow: "Sin caja negra",
      headline: "Una predicción que cita la ley, no un oráculo.",
      body: "Cada pronóstico de Amparo se sustenta en jurisprudencia verificable de la Corte Constitucional. La persona —y el juez— ven exactamente en qué se apoya. Neutralidad que se puede auditar.",
      cardTag: "Fundamento citado",
      cardRuling: "T-760 de 2008",
      cardDesc:
        "Sentencia hito que ordenó garantizar el derecho a la salud. Amparo la invoca —y a sus sentencias afines— para sustentar cada pronóstico.",
      probLabel: "Probabilidad estimada",
      probValue: "Alta",
    },

    // 7 · Credibilidad — cada dato es real o está marcado
    credibilidad: {
      eyebrow: "Credibilidad · verificable",
      headline: "Cada dato es real o está marcado.",
      bullet1: {
        lead: "Nada de cifras inventadas:",
        strong: "cada dato es real o lleva un marcador",
        rest: "que advierte que aún falta verificarlo.",
      },
      bullet2: {
        lead: "Cada sentencia que citamos es",
        strong: "verificable en la fuente",
        rest: "—la Corte Constitucional—, no una referencia de adorno.",
      },
      cardTag: "Anti-alucinación",
      cardTitle: "Nuestro propio sistema cazó una cita alucinada y la eliminó.",
      cardBody:
        "Una capa de verificación contrasta cada cita contra el corpus real antes de mostrarla. Cuando una referencia no existe, no llega a la persona ni al juez.",
      cardQuote: "Si no se puede verificar, no se muestra.",
    },

    // 8 · Resolver sin juez
    resolver: {
      eyebrow: "Resolver antes de pelear",
      headline: "La mejor tutela es la que no llega al juez.",
      bullet1: {
        lead: "Antes del juez, Amparo genera un",
        strong: "derecho de petición",
        rest: ": identifica al responsable y arranca un reloj de plazo.",
      },
      bullet2: {
        lead: "La EPS ve el costo real de negar y",
        strong: "cede los casos obvios",
        rest: "—con transparencia entre las partes.",
      },
      statTitle: "Descongestión proyectada",
      statFigure: "57%",
      statNote:
        "de los casos podrían resolverse en la etapa administrativa, sin tocar un despacho.",
    },

    // 8 · El juez decide
    juez: {
      eyebrow: "Humano en el loop",
      headline: "El fallo se sugiere. La última palabra es humana.",
      bullet1: {
        lead: "Cuando debe llegar al juez, llega",
        strong: "perfecta y triada",
        rest: ": priorizada, con un fallo fundamentado ya redactado.",
      },
      bullet2: {
        lead: "Amparo",
        strong: "detecta reclamos repetidos",
        rest: "—el mismo reclamo por miles— y permite resolverlos por lotes.",
      },
      bullet3: {
        lead: "Amparo no reemplaza al juez:",
        strong: "el juez firma",
        rest: ". Le devolvemos el tiempo para lo que de verdad lo necesita.",
      },
    },

    // 9 · Equidad
    equidad: {
      eyebrow: "Equidad · anti-arbitrariedad",
      headline: "Mismo reclamo, mismo resultado.",
      bodyLead:
        "Lo arbitrario es injusto. Al decidir por jurisprudencia consistente, Amparo reduce la disparidad —y un humano valida. Bien diseñado, lo digital puede ser",
      bodyStrong: "más",
      bodyRest: "justo.",
      card1Title: "Estudio de Michigan",
      card1Text:
        "En cortes de tránsito, el proceso escrito y asíncrono redujo la disparidad racial que aparecía cara a cara. El diseño afecta la equidad.",
      card2Title: "Máquina de Habermas · Science 2024",
      card2Text:
        "Una IA medió entre posturas enfrentadas y redactó posiciones de consenso: los participantes las calificaron como más justas y claras que las de un mediador humano, e integró las voces minoritarias. Es el modelo de mediación de Amparo entre persona y EPS.",
    },

    // 10 · Impacto / negocio
    impacto: {
      eyebrow: "Impacto · modelo",
      headline: "Presupuesto piloto bajo. Impacto masivo.",
      cards: {
        b2g: {
          tag: "B2G",
          title: "Rama Judicial · Defensoría",
          text: "Descongestión: menos carga, decisiones en minutos, acceso a la justicia.",
        },
        b2b: {
          tag: "B2B",
          title: "EPS",
          text: "Menos tutelas y sanciones: resolver antes de la confrontación sale más barato.",
        },
        b2c: {
          tag: "B2C",
          title: "Pacientes · freemium",
          text: "Acceso gratuito de principio a fin, con acompañamiento hasta la resolución.",
        },
      },
    },

    // 11 · Cierre
    cierre: {
      headlineLead: "Amparo no reemplaza al juez. Es",
      headlineEmphasis: "la cuarta parte",
      headlineRest: "que le devuelve el tiempo.",
      body: "Y le devuelve a la gente el acceso real a su derecho. Pruébenlo: hablen con Amparo.",
      ctaDemo: "Probar el demo",
      ctaAtlas: "Ver el atlas",
      url: "amparo.help",
    },
  },

  en: {
    chrome: {
      brand: "Amparo",
      homeLabel: "Back to home",
      exitLabel: "Exit the deck (Esc)",
    },

    nav: {
      prev: "Previous",
      next: "Next",
      toDemo: "To the demo",
      prevLabel: "Previous slide",
      nextLabel: "Next slide",
      toDemoLabel: "Go to the demo",
      slideOf: "Slide {index} of {total}",
      progressLabel: "Deck progress: slide {index} of {total}",
      dotsLabel: "Slides",
      goToSlide: "Go to slide {index}: {kicker}",
      keyboardHint: "← / → navigate · Home / End jump · Esc exit",
    },

    kicker: {
      portada: "Amparo",
      problema: "The problem",
      persona: "The person, not the case",
      comoFunciona: "How it works",
      voz: "Voice · procedural justice",
      prediccion: "No black box",
      credibilidad: "Credibility · verifiable",
      resolver: "Resolve before the fight",
      juez: "Human in the loop",
      equidad: "Fairness · Habermas mediation",
      impacto: "Impact · model",
      cierre: "Closing",
    },

    // 1 · Cover
    portada: {
      brand: "Amparo",
      titleLead: "The",
      titleEmphasis: "fourth party",
      titleRest: "that decongests justice in health.",
      subtitle:
        "An online dispute resolution platform for Colombia's health tutelas (constitutional injunctions). It gives the person a voice, resolves before the judge, and gives the judge back the time for what truly matters.",
      tag: "amparo.help · ODR Hackathon 2026",
    },

    // 2 · The problem
    problema: {
      eyebrow: "The problem",
      headline: "You sue the State to receive what is already a right.",
      body: "Health is the leading reason for filing a tutela in Colombia. Most are granted: the person was asking for something the law already guaranteed them. It's a system that forces you to litigate to access the obvious.",
      statsTitle: "The problem, in numbers",
      stat1: {
        figure: "197,737",
        unit: "health tutelas · 2023",
        note: "Health is the country's leading reason for filing a tutela.",
      },
      stat2: {
        figure: "80%",
        unit: "are granted",
        note: "Because they were asking for something that was already their right.",
      },
      stat3: {
        figure: "months",
        unit: "of waiting",
        note: "Judges' time consumed by repetitive, self-evident cases.",
      },
    },

    // 3 · The person
    persona: {
      cardName: "Amparo, 68 years old",
      cardDesc:
        "She was denied hip surgery. She has no lawyer and no idea where to begin.",
      cardTag: "And even so, she can tell her story.",
      eyebrow: "The person, not the case",
      headline: "Behind every tutela there's someone waiting.",
      body: "Meet Amparo. We don't start with the case file: we start with the person. What matters most to anyone turning to the justice system is being able to tell what happened to them —in their own words.",
    },

    // 4 · How it works
    comoFunciona: {
      eyebrow: "How it works",
      headline: "Three steps. Zero baffling forms.",
      stepLabel: "Step",
      steps: {
        tell: {
          title: "Tell it",
          text: "By speaking or typing, with no legal jargon. Amparo understands and organizes your case.",
        },
        assess: {
          title: "Amparo assesses",
          text: "It checks whether the tutela has merit and predicts the outcome citing real rulings.",
        },
        resolve: {
          title: "It gets resolved",
          text: "Your EPS yields before the judge, or the judge decides with an already-reasoned ruling.",
        },
      },
    },

    // 5 · Voice + avatar = access for everyone
    voz: {
      eyebrow: "Voice · procedural justice",
      headline: "Your voice, first. Real access for everyone.",
      bullet1: {
        lead: "Amparo",
        strong: "speaks and listens",
        rest: ": a conversational avatar for anyone who doesn't write easily or master legal language.",
      },
      bullet2: {
        lead: "Being able to tell your story is the heart of",
        strong: "procedural justice",
        rest: "— what people value most when facing the justice system.",
      },
      bullet3: {
        lead: "Voice",
        strong: "+ transparency",
        rest: "= meaningful access, not just being able to file a request.",
      },
    },

    // 6 · Prediction cited in case law
    prediccion: {
      eyebrow: "No black box",
      headline: "A prediction that cites the law, not an oracle.",
      body: "Every Amparo forecast is grounded in verifiable case law from the Constitutional Court. The person —and the judge— see exactly what it rests on. Neutrality you can audit.",
      cardTag: "Cited basis",
      cardRuling: "T-760 of 2008",
      cardDesc:
        "Landmark ruling that ordered the right to health be guaranteed. Amparo invokes it —and its related rulings— to support every forecast.",
      probLabel: "Estimated probability",
      probValue: "High",
    },

    // 7 · Credibility — every figure is real or flagged
    credibilidad: {
      eyebrow: "Credibility · verifiable",
      headline: "Every figure is real or flagged.",
      bullet1: {
        lead: "No made-up numbers:",
        strong: "every figure is real or carries a flag",
        rest: "warning that it still needs to be verified.",
      },
      bullet2: {
        lead: "Every ruling we cite is",
        strong: "verifiable at the source",
        rest: "—the Constitutional Court—, not a decorative reference.",
      },
      cardTag: "Anti-hallucination",
      cardTitle: "Our own system caught a hallucinated citation and removed it.",
      cardBody:
        "A verification layer checks every citation against the real corpus before it's shown. When a reference doesn't exist, it never reaches the person or the judge.",
      cardQuote: "If it can't be verified, it isn't shown.",
    },

    // 8 · Resolve without a judge
    resolver: {
      eyebrow: "Resolve before the fight",
      headline: "The best tutela is the one that never reaches the judge.",
      bullet1: {
        lead: "Before the judge, Amparo generates a",
        strong: "right-to-petition request",
        rest: ": it identifies who's responsible and starts a deadline clock.",
      },
      bullet2: {
        lead: "The EPS sees the real cost of denying and",
        strong: "yields on the obvious cases",
        rest: "—with transparency between the parties.",
      },
      statTitle: "Projected decongestion",
      statFigure: "57%",
      statNote:
        "of cases could be resolved at the administrative stage, without touching a court.",
    },

    // 8 · The judge decides
    juez: {
      eyebrow: "Human in the loop",
      headline: "The ruling is suggested. The last word is human.",
      bullet1: {
        lead: "When it does need to reach the judge, it arrives",
        strong: "polished and triaged",
        rest: ": prioritized, with a reasoned ruling already drafted.",
      },
      bullet2: {
        lead: "Amparo",
        strong: "detects repeated claims",
        rest: "—the same claim, multiplied by thousands— and lets you resolve them in batches.",
      },
      bullet3: {
        lead: "Amparo doesn't replace the judge:",
        strong: "the judge signs",
        rest: ". We give back the time for what truly needs it.",
      },
    },

    // 9 · Fairness
    equidad: {
      eyebrow: "Fairness · anti-arbitrariness",
      headline: "Same claim, same outcome.",
      bodyLead:
        "What's arbitrary is unjust. By deciding on consistent case law, Amparo reduces disparity —and a human validates. Well designed, the digital can be",
      bodyStrong: "more",
      bodyRest: "just.",
      card1Title: "Michigan study",
      card1Text:
        "In traffic courts, the written, asynchronous process reduced the racial disparity that surfaced face to face. Design shapes fairness.",
      card2Title: "Habermas Machine · Science 2024",
      card2Text:
        "An AI mediated between opposing views and drafted consensus statements: participants rated them as fairer and clearer than a human mediator's, and it integrated minority voices. It's the model for how Amparo mediates between the person and the EPS.",
    },

    // 10 · Impact / business model
    impacto: {
      eyebrow: "Impact · model",
      headline: "Low pilot budget. Massive impact.",
      cards: {
        b2g: {
          tag: "B2G",
          title: "Judiciary · Ombudsman's Office",
          text: "Decongestion: less caseload, decisions in minutes, access to justice.",
        },
        b2b: {
          tag: "B2B",
          title: "EPS",
          text: "Fewer tutelas and penalties: resolving before the confrontation costs less.",
        },
        b2c: {
          tag: "B2C",
          title: "Patients · freemium",
          text: "Free access from start to finish, with support all the way to resolution.",
        },
      },
    },

    // 11 · Closing
    cierre: {
      headlineLead: "Amparo doesn't replace the judge. It's",
      headlineEmphasis: "the fourth party",
      headlineRest: "that gives back the time.",
      body: "And it gives people back real access to their right. Try it: talk to Amparo.",
      ctaDemo: "Try the demo",
      ctaAtlas: "See the atlas",
      url: "amparo.help",
    },
  },
} as const;
