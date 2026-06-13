// lib/i18n/dict/juez.ts — Namespace "juez".
// Textos visibles del rol Juez (despacho): dashboard, cola priorizada,
// descongestión, badges/plazos, cronograma y panel de estudio/fallo.
// Incluye además el "Expediente compartido" (components/transparencia/
// expediente.tsx), que comparten Juez y Demandado: vive aquí porque Juez es
// el namespace propietario del componente.
// Estructura ANIDADA (el resolver soporta dot-path, p.ej. "dashboard.title").

export const juez = {
  es: {
    // — Dashboard (juez-dashboard.tsx) —
    dashboard: {
      title: "Despacho del juez",
      subtitle:
        "Cola priorizada de tutelas, estudio asistido de admisibilidad y predicción, y proyección de fallo con fundamentos del precedente.",
      lastWord:
        "Amparo propone, con criterios consistentes por jurisprudencia; la última palabra es suya. Usted firma el fallo.",
      inDocket: "{count} en despacho",
      queueTitle: "Tutelas por prioridad",
      queueHint: "(urgencia × probabilidad)",
      tabDocket: "En despacho",
      tabAll: "Todos",
      advisorTitle: "Asistente del despacho",
    },

    // — Cola priorizada (juez-cola.tsx) —
    queue: {
      emptyTitle: "Sin tutelas en cola",
      emptyBody:
        "No hay casos en despacho. La descongestión está funcionando: las disputas se resuelven antes de llegar al juez.",
      priorityShort: "Prio",
      openAria: "Abrir caso de {nombre}",
      rulingDate: "Fallo: {fecha}",
    },

    // — Descongestión (juez-descongestion.tsx) —
    decongestion: {
      label: "Descongestión judicial",
      headline: "de disputas resueltas sin llegar a fallo",
      epsAgreement: "Acuerdo EPS",
      ruled: "Fallados",
      inDocket: "En despacho",
    },

    // — Etiquetas de urgencia (juez-utils.ts / juez-badges.tsx) —
    urgency: {
      vital: "Vital",
      alta: "Alta",
      media: "Media",
      baja: "Baja",
    },

    // — Etiquetas de estado del caso (juez-badges.tsx) —
    // Espejo localizado de ETIQUETA_ESTADO (lib/progreso.ts), resuelto en el badge.
    estado: {
      INTAKE: "Recepción",
      TRIADO: "Triaje realizado",
      EN_NEGOCIACION_EPS: "En negociación con EPS",
      RESUELTO_EPS: "Resuelto con EPS",
      ESCALADO_TUTELA: "Tutela presentada",
      EN_DESPACHO: "En despacho judicial",
      FALLADO: "Fallado",
    },

    // — Plazos / semáforo (juez-badges.tsx) —
    deadline: {
      met: "Cumplido",
      overdueBy: "Vencido hace {dias} d",
      dueToday: "Vence hoy",
      remaining: "Faltan {dias} d",
    },

    // — Cronograma (juez-cronograma.tsx) —
    schedule: {
      businessDays: "{dias} días hábiles",
      calendarDays: "{dias} días calendario",
    },

    // — Panel de estudio / detalle (juez-detalle.tsx) —
    detail: {
      specialProtection: "Sujeto de especial protección",

      // Estudio asistido (toasts)
      studyUnavailable: "El estudio asistido por IA no está disponible ahora.",
      studyContactError: "No se pudo contactar el módulo de estudio.",

      // Resumen del caso
      summaryTitle: "Resumen del caso",
      claimant: "Accionante",
      claimantValue:
        "{nombre}, {edad} años · {ciudad} ({departamento}) · régimen {regimen}",
      respondent: "Accionada",
      respondentValue: "{nombre} ({tipo})",
      deniedService: "Servicio negado",
      deniedServiceValue: "{servicio} · {diagnostico} · {pbs}",
      inPbs: "incluido en PBS",
      notPbs: "NO PBS",
      facts: "Hechos",
      claim: "Pretensión",

      // Triaje
      triageTitle: "Triaje de admisibilidad",
      aiBadge: "IA",
      confidence: "Confianza {pct}% · ruta {ruta}",
      routeTutela: "tutela",
      routeEps: "negociación EPS",
      warnings: "Advertencias",
      triageUnavailable: "Estudio de admisibilidad no disponible.",

      // Criterios de admisibilidad
      critFundamental: "Derecho fundamental",
      critLegitimacion: "Legitimación por activa",
      critSubsidiariedad: "Subsidiariedad",
      critInmediatez: "Inmediatez",
      critNoTemeridad: "No temeridad",
      critHechoSuperado: "Vigencia (sin hecho superado)",

      // Veredicto
      verdictAdmissible: "Admisible",
      verdictAdmissibleReservations: "Admisible con reservas",
      verdictInadmissible: "Inadmisible",

      // Predicción
      predictionTitle: "Predicción de amparo",
      predictionCaption: "probabilidad de tutelar el derecho",
      applicableRule: "Regla aplicable",
      citedPrecedent: "Precedente citado",

      // Fallo sugerido
      rulingTitle: "Fallo sugerido",
      rulingEmpty:
        "Genera un proyecto de fallo con su parte resolutiva y los fundamentos citando el corpus.",
      rulingGenerate: "Generar proyecto de fallo",
      rulingRegenerate: "Regenerar proyecto de fallo",
      rulingGeneratedToast: "Proyecto de fallo generado.",
      rulingUnavailable: "El generador de fallos no está disponible ahora.",
      rulingGenError: "No se pudo generar el proyecto de fallo.",

      // Cronograma
      scheduleTitle: "Cronograma de plazos",
      progress: "Progreso del trámite",

      // Barra de acción / firma
      rulingOverdueBy: "Fallo vencido hace {dias} d",
      rulingDeadline: "Plazo de fallo: {dias} d",
      caseRuled: "Caso fallado",
      signRuling: "Firmar fallo",
      confirmSignTitle: "Su firma legitima el fallo",
      confirmSignLead: "Amparo propone; usted decide.",
      confirmSignBody:
        "Su firma es la legitimidad de este fallo. La IA nunca decide sola: el análisis es solo un insumo y la última palabra es del juez.",
      confirmSignCase:
        "Fallo para {nombre} (radicado {radicado}). Al firmar, el caso pasa a estado Fallado y se notifica a las partes con término de impugnación de 3 días.",
      confirmAndSign: "Firmar el fallo",
      cancel: "Cancelar",

      // Sello / overlay de validación humana (tras firmar)
      sealValidated: "Decisión humana validada",
      sealSubtitle: "Firmada por el despacho · {radicado}",

      // Eventos / toasts de firma
      signEventTitle: "Fallo firmado por el despacho",
      signEventGranted:
        "Se TUTELAN los derechos fundamentales invocados y se ordena el servicio de salud.",
      signEventGeneric: "Sentencia proferida por el despacho judicial.",
      signedToast: "Fallo firmado y notificado.",
    },

    // — Expediente compartido (components/transparencia/expediente.tsx) —
    // Compartido entre Juez y Demandado.
    expediente: {
      title: "Expediente compartido",
      tagline: "Transparencia bilateral · cada parte ve los insumos de la otra",

      claimantTitle: "Lo que aporta el demandante",
      factsLabel: "Relato de los hechos",
      requestLabel: "Lo que pide",

      epsTitle: "Lo que responde la EPS",
      rightOfPetition: "Derecho de petición {radicado}",
      responsible: "Responsable: {dependencia}",
      // {fecha} y {dias} interpolados; {tipo} = "hábiles"/"calendario"
      dueOn: "Vence el {fecha} · {dias} días {tipo}",
      daysBusiness: "hábiles",
      daysCalendar: "calendario",

      // Respuesta de la EPS (derivada del estado)
      respAuthorized:
        "La EPS autorizó {servicio} mediante acuerdo, sin acudir al juez.",
      respMovedToCourt:
        "La EPS mantuvo su posición en la etapa de negociación. La disputa se trasladó a la vía judicial.",
      respPetitionExpired:
        "El término del derecho de petición venció sin respuesta de fondo de la EPS.",
      respPetitionPending:
        "Pendiente: la EPS debe responder de fondo. {reloj}.",
      respNotStarted: "Aún no se ha abierto la negociación con la EPS.",

      // Reloj del término de petición (etiqueta localizada en el componente)
      clockDueToday: "Vence hoy",
      clockDueIn: "Vence en {dias} día(s) {tipo}",
      clockOverdue: "Término vencido hace {dias} día(s) {tipo}",

      judgeTitle: "Lo que valora el juez",
      judgeSubtitle: "Despacho judicial",
      rightsInvoked: "Derechos invocados",
      applicablePrecedent: "Precedente aplicable",
      judgeNote:
        "Amparo propone un análisis consistente con el precedente. La última palabra es del juez, que firma el fallo.",
    },
  },

  en: {
    // — Dashboard —
    dashboard: {
      title: "Judge's chambers",
      subtitle:
        "Prioritized tutela (constitutional injunction) queue, AI-assisted review of admissibility and prediction, and a draft ruling grounded in precedent.",
      lastWord:
        "Amparo proposes, with criteria kept consistent by case law; the last word is yours. You sign the ruling.",
      inDocket: "{count} on the docket",
      queueTitle: "Tutelas by priority",
      queueHint: "(urgency × likelihood)",
      tabDocket: "On docket",
      tabAll: "All",
      advisorTitle: "Chambers assistant",
    },

    // — Prioritized queue —
    queue: {
      emptyTitle: "No tutelas in the queue",
      emptyBody:
        "There are no cases on the docket. Decongestion is working: disputes are resolved before they reach the judge.",
      priorityShort: "Pri",
      openAria: "Open {nombre}'s case",
      rulingDate: "Ruling: {fecha}",
    },

    // — Decongestion —
    decongestion: {
      label: "Court decongestion",
      headline: "of disputes resolved without a ruling",
      epsAgreement: "EPS settlement",
      ruled: "Ruled",
      inDocket: "On docket",
    },

    // — Urgency labels —
    urgency: {
      vital: "Vital",
      alta: "High",
      media: "Medium",
      baja: "Low",
    },

    // — Case-state labels (mirror of ETIQUETA_ESTADO, resolved in the badge) —
    estado: {
      INTAKE: "Intake",
      TRIADO: "Triaged",
      EN_NEGOCIACION_EPS: "In negotiation with EPS",
      RESUELTO_EPS: "Settled with EPS",
      ESCALADO_TUTELA: "Tutela filed",
      EN_DESPACHO: "In the judge's chambers",
      FALLADO: "Ruled",
    },

    // — Deadlines / traffic light —
    deadline: {
      met: "Met",
      overdueBy: "Overdue by {dias} d",
      dueToday: "Due today",
      remaining: "{dias} d left",
    },

    // — Schedule —
    schedule: {
      businessDays: "{dias} business days",
      calendarDays: "{dias} calendar days",
    },

    // — Study / detail panel —
    detail: {
      specialProtection: "Subject of special protection",

      studyUnavailable: "AI-assisted review is not available right now.",
      studyContactError: "Could not reach the review module.",

      summaryTitle: "Case summary",
      claimant: "Claimant",
      claimantValue:
        "{nombre}, age {edad} · {ciudad} ({departamento}) · {regimen} scheme",
      respondent: "Respondent",
      respondentValue: "{nombre} ({tipo})",
      deniedService: "Denied service",
      deniedServiceValue: "{servicio} · {diagnostico} · {pbs}",
      inPbs: "included in the PBS (basic health plan)",
      notPbs: "NOT in the PBS",
      facts: "Facts",
      claim: "Relief sought",

      triageTitle: "Admissibility triage",
      aiBadge: "AI",
      confidence: "Confidence {pct}% · route: {ruta}",
      routeTutela: "tutela",
      routeEps: "EPS negotiation",
      warnings: "Warnings",
      triageUnavailable: "Admissibility review not available.",

      critFundamental: "Fundamental right",
      critLegitimacion: "Standing to sue",
      critSubsidiariedad: "Subsidiarity",
      critInmediatez: "Immediacy",
      critNoTemeridad: "No bad faith",
      critHechoSuperado: "Still live (no moot point)",

      verdictAdmissible: "Admissible",
      verdictAdmissibleReservations: "Admissible with reservations",
      verdictInadmissible: "Inadmissible",

      predictionTitle: "Relief prediction",
      predictionCaption: "likelihood of granting the right",
      applicableRule: "Applicable rule",
      citedPrecedent: "Cited precedent",

      rulingTitle: "Suggested ruling",
      rulingEmpty:
        "Generate a draft ruling with its operative section and the grounds, citing the corpus.",
      rulingGenerate: "Generate draft ruling",
      rulingRegenerate: "Regenerate draft ruling",
      rulingGeneratedToast: "Draft ruling generated.",
      rulingUnavailable: "The ruling generator is not available right now.",
      rulingGenError: "Could not generate the draft ruling.",

      scheduleTitle: "Deadline schedule",
      progress: "Case progress",

      rulingOverdueBy: "Ruling overdue by {dias} d",
      rulingDeadline: "Ruling deadline: {dias} d",
      caseRuled: "Case ruled",
      signRuling: "Sign ruling",
      confirmSignTitle: "Your signature legitimizes the ruling",
      confirmSignLead: "Amparo proposes; you decide.",
      confirmSignBody:
        "Your signature is what gives this ruling its legitimacy. The AI never decides on its own: the analysis is merely an input, and the last word belongs to the judge.",
      confirmSignCase:
        "Ruling for {nombre} (file no. {radicado}). On signing, the case moves to the Ruled state and the parties are notified, with a 3-day window to appeal.",
      confirmAndSign: "Sign the ruling",
      cancel: "Cancel",

      // Human-validation seal / overlay (after signing)
      sealValidated: "Human decision validated",
      sealSubtitle: "Signed by the chambers · {radicado}",

      signEventTitle: "Ruling signed by the chambers",
      signEventGranted:
        "The fundamental rights invoked are GRANTED and the health service is ordered.",
      signEventGeneric: "Judgment issued by the court.",
      signedToast: "Ruling signed and served.",
    },

    // — Shared case file (expediente.tsx) — shared with Respondent (EPS) —
    expediente: {
      title: "Shared case file",
      tagline: "Bilateral transparency · each party sees the other's inputs",

      claimantTitle: "What the claimant submits",
      factsLabel: "Account of the facts",
      requestLabel: "What they ask for",

      epsTitle: "What the EPS responds",
      rightOfPetition: "Right of petition {radicado}",
      responsible: "Responsible: {dependencia}",
      dueOn: "Due {fecha} · {dias} {tipo} days",
      daysBusiness: "business",
      daysCalendar: "calendar",

      respAuthorized:
        "The EPS authorized {servicio} by agreement, without going to a judge.",
      respMovedToCourt:
        "The EPS held its position during negotiation. The dispute moved to the courts.",
      respPetitionExpired:
        "The right-of-petition deadline lapsed with no substantive response from the EPS.",
      respPetitionPending:
        "Pending: the EPS must respond on the merits. {reloj}.",
      respNotStarted: "Negotiation with the EPS has not started yet.",

      // Petition-deadline clock (label localized in the component)
      clockDueToday: "Due today",
      clockDueIn: "Due in {dias} {tipo} day(s)",
      clockOverdue: "Deadline lapsed {dias} {tipo} day(s) ago",

      judgeTitle: "What the judge weighs",
      judgeSubtitle: "Court chambers",
      rightsInvoked: "Rights invoked",
      applicablePrecedent: "Applicable precedent",
      judgeNote:
        "Amparo proposes an analysis consistent with precedent. The last word belongs to the judge, who signs the ruling.",
    },
  },
} as const;
