// lib/i18n/dict/mediacion.ts — Namespace "mediacion".
// Textos visibles de la Sala de mediación: el núcleo de Amparo como "la cuarta
// parte". Inspirada en la "Habermas Machine" (Google DeepMind, Science 2024):
// en vez de gana/pierde, Amparo media entre el PACIENTE y la EPS y propone un
// ACUERDO de consenso, razonado y fundado en el derecho a la salud, que ambas
// partes pueden aceptar.
// Estructura ANIDADA (el resolver soporta dot-path, p.ej. "consensus.title").

export const mediacion = {
  es: {
    // — Encabezado de la sala —
    room: {
      title: "Sala de mediación",
      subtitle:
        "En vez de gana/pierde, proponemos un acuerdo de consenso entre el paciente y la EPS, razonado y fundado en el derecho a la salud, que ambas partes pueden aceptar.",
      eyebrow: "La cuarta parte",
      fourthParty: "Amparo, la cuarta parte",
      generate: "Proponer consenso",
      regenerate: "Volver a proponer",
      generating: "Construyendo el consenso…",
      empty:
        "Aún no hay propuesta de mediación. Generemos un acuerdo de consenso para este caso.",
      error: "No se pudo construir la mediación. Intentemos de nuevo.",
    },

    // — Guiño a la Habermas Machine (DeepMind, Science 2024) —
    habermas: {
      title: "Inspirado en la Habermas Machine",
      body:
        "Google DeepMind demostró (Science, 2024) que una IA puede mediar temas divisivos y construir un consenso que las partes —incluidas las minoritarias— califican como más justo. Amparo hace lo mismo entre el paciente y la EPS.",
      badge: "Mediación asistida por IA",
    },

    // — Posiciones de cada parte —
    positions: {
      title: "Posiciones legítimas",
      patient: "Posición del paciente",
      patientHint: "Acceso oportuno al servicio prescrito.",
      eps: "Posición de la EPS",
      epsHint: "Proceso de autorización, sostenibilidad y lo cubierto.",
    },

    // — Propuesta de consenso —
    consensus: {
      title: "Propuesta de consenso",
      hint: "Un acuerdo que da al paciente el servicio Y atiende el proceso de la EPS.",
      foundationTitle: "Fundamento en el derecho a la salud",
      termsTitle: "Términos del acuerdo",
      precedentsTitle: "Precedente que respalda el consenso",
    },

    // — Decisión de las partes —
    decision: {
      title: "¿Aceptan el consenso?",
      accept: "Aceptar",
      acceptPatient: "El paciente acepta",
      acceptEps: "La EPS acepta",
      reject: "No aceptar",
      acceptedByPatient: "Aceptado por el paciente",
      acceptedByEps: "Aceptado por la EPS",
      pendingPatient: "Pendiente: paciente",
      pendingEps: "Pendiente: EPS",
    },

    // — Estado de la propuesta —
    status: {
      label: "Estado del acuerdo",
      propuesta: "Propuesta",
      aceptada: "Aceptada",
      rechazada: "Rechazada",
      bothAccepted: "Ambas partes aceptaron el consenso",
    },

    // — Clímax del consenso (sello + descongestión) —
    seal: {
      label: "Acuerdo por consenso",
      decongestionCounter: "Descongestión",
      decongestionDelta: "+1 caso resuelto sin juez",
    },

    // — Acta de acuerdo —
    record: {
      title: "Acta de acuerdo",
      subtitle:
        "Constancia del consenso alcanzado, lista para firma de las partes. La descongestión empieza aquí.",
      download: "Descargar acta",
      decongestion: "Disputa resuelta sin llegar al juez.",
    },

    // — Aviso —
    disclaimer:
      "Esta propuesta de mediación es asistida por IA, no vinculante; las partes deciden libremente y la última palabra es siempre humana.",
  },
  en: {
    // — Room header —
    room: {
      title: "Mediation room",
      subtitle:
        "Instead of win/lose, we propose a consensus agreement between the patient and the EPS that both can accept—reasoned and grounded in the right to health.",
      eyebrow: "The fourth party",
      fourthParty: "Amparo, the fourth party",
      generate: "Propose consensus",
      regenerate: "Propose again",
      generating: "Building the consensus…",
      empty:
        "There's no mediation proposal yet. Let's generate a consensus agreement for this case.",
      error: "We couldn't build the mediation. Let's try again.",
    },

    // — Nod to the Habermas Machine (DeepMind, Science 2024) —
    habermas: {
      title: "Inspired by the Habermas Machine",
      body:
        "Google DeepMind showed (Science, 2024) that an AI can mediate divisive issues and build a consensus that the parties—minorities included—rate as fairer. Amparo does the same between the patient and the EPS.",
      badge: "AI-assisted mediation",
    },

    // — Each party's position —
    positions: {
      title: "Legitimate positions",
      patient: "Patient's position",
      patientHint: "Timely access to the prescribed service.",
      eps: "EPS's position",
      epsHint: "Authorization process, sustainability and scope of coverage.",
    },

    // — Consensus proposal —
    consensus: {
      title: "Consensus proposal",
      hint: "An agreement that gives the patient the service AND honors the EPS's process.",
      foundationTitle: "Grounded in the right to health",
      termsTitle: "Terms of the agreement",
      precedentsTitle: "Precedent backing the consensus",
    },

    // — Parties' decision —
    decision: {
      title: "Do they accept the consensus?",
      accept: "Accept",
      acceptPatient: "The patient accepts",
      acceptEps: "The EPS accepts",
      reject: "Decline",
      acceptedByPatient: "Accepted by the patient",
      acceptedByEps: "Accepted by the EPS",
      pendingPatient: "Pending: patient",
      pendingEps: "Pending: EPS",
    },

    // — Proposal status —
    status: {
      label: "Agreement status",
      propuesta: "Proposed",
      aceptada: "Accepted",
      rechazada: "Rejected",
      bothAccepted: "Both parties accepted the consensus",
    },

    // — Consensus climax (seal + decongestion) —
    seal: {
      label: "Consensus agreement",
      decongestionCounter: "Decongestion",
      decongestionDelta: "+1 case resolved without a judge",
    },

    // — Agreement record —
    record: {
      title: "Agreement record",
      subtitle:
        "A record of the consensus reached, ready for the parties to sign. Decongestion starts here.",
      download: "Download record",
      decongestion: "Dispute resolved without reaching the judge.",
    },

    // — Disclaimer —
    disclaimer:
      "This mediation proposal is AI-assisted and non-binding; the parties decide freely and the final word is always human.",
  },
} as const;
