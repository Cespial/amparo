// lib/i18n/dict/common.ts — Namespace "common".
// Botones, etiquetas y términos transversales reutilizables por todos los
// módulos. Fase 2: reutiliza estas claves antes de crear nuevas en tu propio
// namespace (evita divergencias de traducción).

export const common = {
  es: {
    // — Acciones / botones —
    "action.continue": "Continuar",
    "action.back": "Atrás",
    "action.cancel": "Cancelar",
    "action.confirm": "Confirmar",
    "action.save": "Guardar",
    "action.edit": "Editar",
    "action.delete": "Eliminar",
    "action.close": "Cerrar",
    "action.send": "Enviar",
    "action.download": "Descargar",
    "action.copy": "Copiar",
    "action.copied": "Copiado",
    "action.retry": "Reintentar",
    "action.start": "Empezar",
    "action.enter": "Entrar",
    "action.viewMore": "Ver más",
    "action.viewDetail": "Ver detalle",
    "action.search": "Buscar",
    "action.filter": "Filtrar",
    "action.next": "Siguiente",
    "action.previous": "Anterior",
    "action.finish": "Finalizar",
    "action.print": "Imprimir",
    "action.share": "Compartir",

    // — Estados —
    "state.loading": "Cargando…",
    "state.saving": "Guardando…",
    "state.sending": "Enviando…",
    "state.processing": "Procesando…",
    "state.empty": "Sin resultados",
    "state.error": "Ocurrió un error",
    "state.success": "Listo",

    // — Roles / partes —
    "role.atlas": "Atlas",
    "role.demandante": "Demandante",
    "role.demandado": "Demandado",
    "role.demandadoEps": "Demandado (EPS)",
    "role.juez": "Juez",

    // — Términos de dominio —
    "term.tutela": "tutela",
    "term.eps": "EPS",
    "term.rightToHealth": "derecho a la salud",
    "term.fourthParty": "la cuarta parte",
    "term.decongestion": "descongestión",
    "term.constitutionalCourt": "Corte Constitucional",
    "term.case": "caso",
    "term.cases": "casos",
    "term.judgment": "sentencia",
    "term.judgments": "sentencias",
    "term.ruling": "fallo",
    "term.caseFile": "expediente",
    "term.deadline": "plazo",
    "term.jurisprudence": "jurisprudencia",

    // — Misceláneo —
    "misc.optional": "opcional",
    "misc.required": "obligatorio",
    "misc.yes": "Sí",
    "misc.no": "No",
    "misc.and": "y",
    "misc.or": "o",
    "misc.of": "de",
    "misc.source": "Fuente",
    "misc.disclaimer":
      "Amparo es una herramienta de apoyo asistida por IA; no constituye asesoría jurídica vinculante y la decisión final siempre es humana.",

    // — Chip de sentencia (SentenciaChip, transversal) —
    "judgmentChip.openAria":
      "Ver Sentencia {id} en la Corte Constitucional",
    "judgmentChip.officialSource": "Fuente oficial: Corte Constitucional",

    // — Voz (BotonVoz, transversal) —
    "voice.listen": "Escuchar",
    "voice.stop": "Detener",
    "voice.listenAria": "Escuchar en voz alta",
    "voice.stopAria": "Detener la lectura en voz alta",

    // — Copiloto (SegundoCerebro, transversal) —
    "copilot.title": "Segundo cerebro",
    "copilot.empty": "Pregúntame sobre tu caso, plazos o precedentes aplicables.",
    "copilot.placeholder": "Escribe tu pregunta…",
    "copilot.send": "Enviar",
    "copilot.emptyResponse":
      "El copiloto no devolvió contenido. Intenta reformular tu pregunta.",
    "copilot.unavailable":
      "El copiloto aún no está disponible (módulo de IA en construcción). Pronto podré ayudarte con tu caso.",
    "copilot.error": "No se pudo contactar al copiloto. Intenta de nuevo.",

    // — Modo presentación (tour guiado, transversal) —
    "present.launch": "Modo presentación",
    "present.launchShort": "Presentar",
    "present.launchAria": "Iniciar modo presentación",
    "present.dialogAria": "Modo presentación",
    "present.guidedDemo": "Demo guiado",
    "present.exitAria": "Salir del modo presentación (Esc)",
    "present.keyboardHint": "Usa ← / → para navegar · Esc para salir",
    "present.s1.title": "El problema",
    "present.s1.phrase":
      "Colombia: 197.737 tutelas de salud en 2023; el 80% se ganan porque ya eran un derecho.",
    "present.s2.title": "La persona",
    "present.s2.phrase":
      "Amparo, 68 años, cuenta su caso —hablando— y la IA lo estructura.",
    "present.s3.title": "El pronóstico",
    "present.s3.phrase": "Predicción citada en jurisprudencia real: T-760/2008.",
    "present.s4.title": "Resolver sin juez",
    "present.s4.phrase": "La EPS cede ante el costo de negar. Descongestión.",
    "present.s5.title": "El juez decide",
    "present.s5.phrase": "Fallo sugerido y fundamentado. El humano firma.",
  },
  en: {
    // — Actions / buttons —
    "action.continue": "Continue",
    "action.back": "Back",
    "action.cancel": "Cancel",
    "action.confirm": "Confirm",
    "action.save": "Save",
    "action.edit": "Edit",
    "action.delete": "Delete",
    "action.close": "Close",
    "action.send": "Send",
    "action.download": "Download",
    "action.copy": "Copy",
    "action.copied": "Copied",
    "action.retry": "Try again",
    "action.start": "Get started",
    "action.enter": "Open",
    "action.viewMore": "See more",
    "action.viewDetail": "View details",
    "action.search": "Search",
    "action.filter": "Filter",
    "action.next": "Next",
    "action.previous": "Previous",
    "action.finish": "Finish",
    "action.print": "Print",
    "action.share": "Share",

    // — States —
    "state.loading": "Loading…",
    "state.saving": "Saving…",
    "state.sending": "Sending…",
    "state.processing": "Processing…",
    "state.empty": "No results",
    "state.error": "Something went wrong",
    "state.success": "Done",

    // — Roles / parties —
    "role.atlas": "Atlas",
    "role.demandante": "Claimant",
    "role.demandado": "Respondent",
    "role.demandadoEps": "Respondent (EPS)",
    "role.juez": "Judge",

    // — Domain terms —
    "term.tutela": "tutela",
    "term.eps": "EPS",
    "term.rightToHealth": "right to health",
    "term.fourthParty": "the fourth party",
    "term.decongestion": "decongestion",
    "term.constitutionalCourt": "Constitutional Court",
    "term.case": "case",
    "term.cases": "cases",
    "term.judgment": "judgment",
    "term.judgments": "judgments",
    "term.ruling": "ruling",
    "term.caseFile": "case file",
    "term.deadline": "deadline",
    "term.jurisprudence": "case law",

    // — Miscellaneous —
    "misc.optional": "optional",
    "misc.required": "required",
    "misc.yes": "Yes",
    "misc.no": "No",
    "misc.and": "and",
    "misc.or": "or",
    "misc.of": "of",
    "misc.source": "Source",
    "misc.disclaimer":
      "Amparo is an AI-assisted support tool; it is not binding legal advice and the final decision is always human.",

    // — Judgment chip (SentenciaChip, cross-cutting) —
    "judgmentChip.openAria":
      "View ruling {id} on the Constitutional Court website",
    "judgmentChip.officialSource": "Official source: Constitutional Court",

    // — Voice (BotonVoz, cross-cutting) —
    "voice.listen": "Listen",
    "voice.stop": "Stop",
    "voice.listenAria": "Listen out loud",
    "voice.stopAria": "Stop reading aloud",

    // — Copilot (SegundoCerebro, cross-cutting) —
    "copilot.title": "Second brain",
    "copilot.empty": "Ask me about your case, deadlines, or applicable precedents.",
    "copilot.placeholder": "Type your question…",
    "copilot.send": "Send",
    "copilot.emptyResponse":
      "The copilot returned no content. Try rephrasing your question.",
    "copilot.unavailable":
      "The copilot isn't available yet (AI module under construction). I'll be able to help with your case soon.",
    "copilot.error": "Couldn't reach the copilot. Please try again.",

    // — Presentation mode (guided tour, cross-cutting) —
    "present.launch": "Presentation mode",
    "present.launchShort": "Present",
    "present.launchAria": "Start presentation mode",
    "present.dialogAria": "Presentation mode",
    "present.guidedDemo": "Guided demo",
    "present.exitAria": "Exit presentation mode (Esc)",
    "present.keyboardHint": "Use ← / → to navigate · Esc to exit",
    "present.s1.title": "The problem",
    "present.s1.phrase":
      "Colombia: 197,737 health tutelas in 2023; 80% are won because the claim was a right all along.",
    "present.s2.title": "The person",
    "present.s2.phrase":
      "Amparo, 68, tells her story—out loud—and the AI structures it into a case.",
    "present.s3.title": "The forecast",
    "present.s3.phrase": "A prediction cited in real case law: T-760/2008.",
    "present.s4.title": "Resolve without a judge",
    "present.s4.phrase": "The EPS backs down once denial costs more than compliance. Decongestion.",
    "present.s5.title": "The judge decides",
    "present.s5.phrase": "A suggested, reasoned ruling. The human signs.",
  },
} as const;
