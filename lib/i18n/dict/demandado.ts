// lib/i18n/dict/demandado.ts — Namespace "demandado".
// Textos visibles del rol Demandado (EPS): portal/bandeja, agente-EPS de
// costo/riesgo, negociación automática y panel de impacto/descongestión.
// Estructura ANIDADA (el resolver soporta dot-path, p.ej. "page.title").

export const demandado = {
  es: {
    // — Portal / encabezado (app/demandado/page.tsx) —
    page: {
      kicker: "Portal del demandado · EPS",
      title: "Bandeja de reclamaciones",
      subtitle:
        "Resuelva disputas de salud antes del juez. El agente-EPS calcula el costo/riesgo de negar y recomienda ceder cuando la tutela se perdería.",
      fourthParty:
        "Amparo es la cuarta parte: asiste con análisis consistentes por jurisprudencia. La decisión de autorizar o sostener es suya.",
    },

    // — Acción de negociación automática —
    auto: {
      idle: "Negociación automática",
      running: "Negociando…",
      // Toasts
      startedTitle: "Negociación automática iniciada",
      startedDesc: "El agente-EPS evaluará {count} caso(s) de alto riesgo.",
      noneTitle: "Sin casos obvios",
      noneDesc: "No hay reclamaciones de riesgo alto para resolver en lote.",
      resolvedToast: "Resuelto: {nombre}",
      resolvedToastDesc: "{prob}% de amparo — autorizado sin juez.",
      completeTitle: "Negociación automática completa",
      completeDesc: "{count} caso(s) descongestionado(s).",
      // Eventos del timeline
      eventTitle: "Acuerdo automático del agente-EPS",
      eventDetail:
        "Probabilidad de amparo {prob}%. La EPS autoriza {servicio} sin litigio.",
    },

    // — Sección "En negociación" + leyenda —
    queue: {
      heading: "En negociación",
      legendAuthorize: "Autorizar = resolver sin juez",
      legendKeep: "Mantener negación = habilitar tutela",
    },

    // — Copiloto lateral —
    advisor: {
      title: "Asesor de la EPS",
    },

    // — Acciones manuales (autorizar / mantener) —
    actions: {
      authorizeEventTitle: "EPS autoriza el servicio (acuerdo sin juez)",
      authorizeEventDetail:
        "El agente-EPS estimó {prob}% de amparo en tutela. La EPS cede y autoriza {servicio}.",
      authorizeToast: "Servicio autorizado",
      authorizeToastDesc: "{nombre}: caso resuelto sin acudir al juez.",
      keepEventTitle: "EPS mantiene la negación — habilitada la tutela",
      keepEventDetail:
        "La EPS sostuvo su posición. El demandante queda habilitado para escalar a acción de tutela ante juez.",
      keepToast: "Negación mantenida",
      keepToastDesc: "{nombre} podrá escalar a tutela.",
    },

    // — Bandeja (demandado-bandeja.tsx) —
    inbox: {
      emptyTitle: "Bandeja al día",
      emptyBody:
        "No hay reclamaciones en negociación. Los casos resueltos no vuelven a la cola.",
      colPatient: "Paciente",
      colService: "Servicio negado",
      colUrgency: "Urgencia",
      colProbability: "Prob. de amparo",
      colAction: "Acción EPS",
      cede: "Ceder",
      evaluate: "Evaluar",
      sustainable: "Sostenible",
    },

    // — Etiquetas de urgencia —
    urgency: {
      vital: "Vital",
      alta: "Alta",
      media: "Media",
      baja: "Baja",
    },

    // — Agente-EPS (demandado-agente.tsx) —
    agent: {
      urgencyLabel: "Urgencia {nivel}",
      specialProtection: "Especial protección",
      facts: "Hechos",
      title: "Agente-EPS · análisis costo/riesgo de negar",
      analyzing: "Evaluando precedente, urgencia y exposición procesal…",
      probabilityLabel: "Probabilidad de amparo estimada",
      precedent: "Precedente aplicable",
      keepDenial: "Mantener negación",
      authorizeService: "Autorizar servicio",
      // Degradación: análisis local determinista
      localRule:
        "El derecho a la salud es fundamental y autónomo; lo prescrito por el médico tratante debe garantizarse (T-760/2008).",
      localReasoning:
        "Análisis local. Existe orden del médico tratante y el accionante invoca derechos fundamentales. Según el precedente reiterado, un juez de tutela ampararía con alta probabilidad, por lo que sostener la negación expone a la EPS a un fallo en contra y a un eventual desacato.",
    },

    // — Niveles de riesgo (demandado-utils.ts) —
    risk: {
      high: "Riesgo alto de perder en tutela",
      medium: "Riesgo medio — evaluar costo/beneficio",
      low: "Riesgo bajo — posición sostenible",
    },

    // — Costo de negar (demandado-utils.ts) —
    cost: {
      probability:
        "Probabilidad {prob}% de fallo en contra dentro de 10 días hábiles (art. 86 C.P.).",
      specialProtection:
        "Accionante es sujeto de especial protección constitucional: el juez aplica un estándar más estricto.",
      clinicalUrgency:
        "Urgencia clínica alta: alto riesgo de fallo de tutela y eventual medida provisional inmediata.",
      contempt:
        "Si se incumple el fallo: incidente de desacato (arresto hasta 6 meses y multa) contra el representante legal.",
      defense:
        "Costos de defensa judicial, recobro tardío ante ADRES y desgaste reputacional ante la Supersalud.",
      summaryHigh:
        "El análisis costo/riesgo recomienda CEDER y autorizar: negar casi con certeza deriva en tutela perdida, fallo en 10 días y exposición a desacato.",
      summaryMedium:
        "Caso fronterizo: ceder evita litigio, pero hay margen para sostener con sustento clínico. Evalúe caso a caso.",
      summaryLow:
        "Posición administrativamente sostenible; documente la negación con soporte técnico-científico.",
    },

    // — Panel de impacto (demandado-impacto.tsx) —
    impact: {
      heading: "Impacto de la resolución sin juez",
      subtitle:
        "Cada acuerdo descongestiona la rama judicial y resuelve antes para el paciente.",
      resolved: "Casos resueltos sin juez",
      judgeDays: "Días-juez ahorrados",
      rate: "Tasa de descongestión",
    },
  },

  en: {
    // — Portal / header —
    page: {
      kicker: "Respondent portal · EPS",
      title: "Claims inbox",
      subtitle:
        "Resolve health disputes before they reach a judge. The EPS agent weighs the cost and risk of denying a claim and recommends conceding when the tutela (constitutional injunction) would be lost.",
      fourthParty:
        "Amparo is the fourth party: it assists with analyses kept consistent by case law. The choice to authorize or hold the line is yours.",
    },

    // — Auto-negotiation action —
    auto: {
      idle: "Auto-negotiate",
      running: "Negotiating…",
      startedTitle: "Auto-negotiation started",
      startedDesc: "The EPS agent will review {count} high-risk case(s).",
      noneTitle: "No clear-cut cases",
      noneDesc: "There are no high-risk claims to resolve in a batch.",
      resolvedToast: "Resolved: {nombre}",
      resolvedToastDesc: "{prob}% likelihood of relief—authorized without a judge.",
      completeTitle: "Auto-negotiation complete",
      completeDesc: "{count} case(s) cleared from the docket.",
      eventTitle: "Automatic settlement by the EPS agent",
      eventDetail:
        "{prob}% likelihood of relief. The EPS authorizes {servicio} without litigation.",
    },

    // — "In negotiation" section + legend —
    queue: {
      heading: "In negotiation",
      legendAuthorize: "Authorize = resolve without a judge",
      legendKeep: "Hold the denial = clears the way for a tutela action",
    },

    // — Side copilot —
    advisor: {
      title: "EPS advisor",
    },

    // — Manual actions (authorize / hold) —
    actions: {
      authorizeEventTitle: "EPS authorizes the service (settlement without a judge)",
      authorizeEventDetail:
        "The EPS agent estimated a {prob}% likelihood of relief in a tutela. The EPS concedes and authorizes {servicio}.",
      authorizeToast: "Service authorized",
      authorizeToastDesc: "{nombre}: case resolved without going to a judge.",
      keepEventTitle: "EPS upholds the denial—tutela action now open",
      keepEventDetail:
        "The EPS held its position. The claimant is now free to escalate to a tutela action before a judge.",
      keepToast: "Denial upheld",
      keepToastDesc: "{nombre} may now escalate to a tutela.",
    },

    // — Inbox —
    inbox: {
      emptyTitle: "Inbox clear",
      emptyBody:
        "There are no claims in negotiation. Resolved cases do not return to the queue.",
      colPatient: "Patient",
      colService: "Denied service",
      colUrgency: "Urgency",
      colProbability: "Relief likelihood",
      colAction: "EPS action",
      cede: "Concede",
      evaluate: "Evaluate",
      sustainable: "Defensible",
    },

    // — Urgency labels —
    urgency: {
      vital: "Vital",
      alta: "High",
      media: "Medium",
      baja: "Low",
    },

    // — EPS agent —
    agent: {
      urgencyLabel: "{nivel} urgency",
      specialProtection: "Special protection",
      facts: "Facts",
      title: "EPS agent · cost/risk analysis of denying",
      analyzing: "Weighing precedent, urgency, and procedural exposure…",
      probabilityLabel: "Estimated likelihood of relief",
      precedent: "Applicable precedent",
      keepDenial: "Hold the denial",
      authorizeService: "Authorize service",
      localRule:
        "The right to health is fundamental and autonomous; what the treating physician prescribes must be guaranteed (T-760/2008).",
      localReasoning:
        "Local analysis. There is an order from the treating physician and the claimant invokes fundamental rights. Under settled precedent, a tutela judge would very likely grant relief, so upholding the denial exposes the EPS to an adverse ruling and possible contempt proceedings.",
    },

    // — Risk levels —
    risk: {
      high: "High risk of losing the tutela",
      medium: "Medium risk — weigh cost vs. benefit",
      low: "Low risk — defensible position",
    },

    // — Cost of denying —
    cost: {
      probability:
        "{prob}% likelihood of an adverse ruling within 10 business days (art. 86 of the Constitution).",
      specialProtection:
        "The claimant is a subject of special constitutional protection: the judge applies a stricter standard.",
      clinicalUrgency:
        "High clinical urgency: elevated risk of an adverse tutela ruling and a possible immediate interim measure.",
      contempt:
        "If the ruling is not complied with: contempt proceedings (up to 6 months' arrest and a fine) against the legal representative.",
      defense:
        "Costs of legal defense, delayed reimbursement from ADRES, and reputational damage before the Supersalud (health superintendency).",
      summaryHigh:
        "The cost/risk analysis recommends CONCEDING and authorizing: denying almost certainly leads to a lost tutela, a ruling within 10 days, and exposure to contempt.",
      summaryMedium:
        "Borderline case: conceding avoids litigation, but there is room to hold the line with clinical support. Assess case by case.",
      summaryLow:
        "Administratively defensible position; document the denial with technical and scientific support.",
    },

    // — Impact panel —
    impact: {
      heading: "Impact of resolving without a judge",
      subtitle:
        "Every settlement clears the courts and resolves the matter sooner for the patient.",
      resolved: "Cases resolved without a judge",
      judgeDays: "Judge-days saved",
      rate: "Decongestion rate",
    },
  },
} as const;
