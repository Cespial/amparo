// lib/i18n/dict/demandante.ts — Namespace "demandante".
// Toda la copia visible del rol Demandante: página, wizard de 5 pasos,
// stepper, medidor de probabilidad, reloj del derecho de petición y las
// frases habladas (modo voz). Estructura ANIDADA con interpolación {var}.

export const demandante = {
  es: {
    meta: {
      title: "Demandante · Amparo",
      description:
        "De tu relato a una tutela en minutos. Amparo te acompaña paso a paso para proteger tu derecho a la salud.",
    },

    page: {
      title: "De tu historia a tu tutela",
      subtitle:
        "Cuéntanos qué pasó con tu EPS. Amparo organiza tu caso, evalúa si procede, te da un pronóstico con sentencias reales y redacta tu documento. Tú decides el camino.",
      tagline:
        "Amparo es la cuarta parte que te acompaña: resultados consistentes, no arbitrarios. La decisión final siempre es de un humano.",
    },

    copilot: {
      title: "Amparo, tu copiloto",
    },

    // Stepper "Paso X de N".
    stepper: {
      // {actual} y {total} se interpolan.
      label: "Paso {actual} de {total}",
    },

    // Títulos de los 5 pasos (usados en el stepper).
    steps: {
      tell: "Cuéntanos qué pasó",
      yourCase: "Tu caso",
      proceeds: "¿Procede?",
      forecast: "Pronóstico",
      decision: "Decisión",
    },

    // Modo voz (botón de la cabecera).
    voice: {
      on: "Modo voz activo",
      off: "Modo voz apagado",
      title: "Amparo te lee cada paso en voz alta",
      ariaOn: "Desactivar modo voz: Amparo dejará de leer en voz alta",
      ariaOff: "Activar modo voz: Amparo leerá en voz alta cada paso",
    },

    // --- PASO 1: relato ---
    step1: {
      title: "Cuéntanos qué pasó",
      subtitle:
        "Con tus palabras: qué te negó tu EPS y por qué lo necesitas. Puedes escribir o dictar con el micrófono.",
      placeholder:
        "Por ejemplo: «Mi médico me ordenó una cirugía de cadera y mi EPS no me la ha autorizado…»",
      ariaRelato: "Relato de los hechos",
      dictar: "Dictar",
      detener: "Detener",
      noDictado:
        "Tu navegador no permite dictar por voz; escribe el relato.",
      usarEjemplo: "Usar el ejemplo de Amparo",
      continuar: "Continuar",
      organizando: "Amparo está organizando tu caso…",
      // Relato de ejemplo precargado (caso héroe).
      ejemplo:
        "Mi nombre es Amparo Restrepo, tengo 68 años y vivo en Medellín. Estoy afiliada a la EPS Sura. Hace meses mi médico me ordenó una cirugía de cadera, una artroplastia, porque tengo coxartrosis severa y el dolor no me deja caminar ni dormir. La EPS no me ha autorizado la operación, dicen que está en trámites de pertinencia, y cada día estoy peor. Necesito que me operen pronto.",
      toast: {
        cortoTitle: "Cuéntanos un poco más",
        cortoDesc:
          "Describe qué servicio te negaron y por qué lo necesitas.",
        ejemploTitle: "Ejemplo de Amparo cargado",
        ejemploDesc: "Puedes editarlo o continuar tal cual.",
        okTitle: "Amparo organizó tu caso",
        okDesc: "Revisa los datos y corrige lo que necesites.",
        errorTitle: "No se pudo estructurar el caso",
        errorDesc: "Revisa tu conexión e inténtalo de nuevo.",
      },
    },

    // --- PASO 2: revisar caso estructurado ---
    step2: {
      title: "Así entendí tu caso",
      subtitle: "Revisa y corrige. Tú tienes la última palabra.",
      fields: {
        paciente: "Paciente",
        pacientePlaceholder: "Nombre del paciente",
        eps: "EPS o entidad",
        epsPlaceholder: "Nombre de la EPS",
        servicioNegado: "Servicio negado",
        tipoServicio: "Tipo de servicio",
        diagnostico: "Diagnóstico",
        urgencia: "Urgencia",
        hechos: "Hechos",
        pretension: "Lo que pides (pretensión)",
      },
      derechosEnJuego: "Derechos en juego:",
      siguiente: "Evaluar si procede",
      cargando: "Evaluando admisibilidad…",
      toast: {
        errorTitle: "No se pudo evaluar la admisibilidad",
        errorDesc: "Inténtalo de nuevo en un momento.",
      },
    },

    // Tipos de servicio (Select).
    tipoServicio: {
      cirugia: "Cirugía",
      medicamento: "Medicamento",
      examen_diagnostico: "Examen diagnóstico",
      tratamiento: "Tratamiento",
      traslado_ambulancia: "Traslado / ambulancia",
      terapia: "Terapia",
      insumo_dispositivo: "Insumo o dispositivo",
      consulta_especialista: "Consulta con especialista",
      otro: "Otro",
    },

    // Niveles de urgencia (Select).
    urgencia: {
      baja: "Baja",
      media: "Media",
      alta: "Alta",
      vital: "Vital (riesgo de vida)",
    },

    // --- PASO 3: triaje / admisibilidad ---
    step3: {
      siguiente: "Ver mi pronóstico",
      cargando: "Analizando precedentes…",
      banderasTitulo: "A tener en cuenta",
      rutaSugerida: "Ruta sugerida:",
      rutaTutela: "acción de tutela",
      rutaEps: "negociación con la EPS",
      // {pct} = confianza en porcentaje.
      confianza: "confianza {pct}%",
      toast: {
        errorTitle: "No se pudo calcular el pronóstico",
      },
    },

    // Veredicto del triaje (títulos).
    veredicto: {
      admisible: "Tu caso es admisible",
      admisible_con_reservas: "Admisible, con algunas reservas",
      inadmisible: "Por ahora, el caso no procedería",
    },

    // Criterios de admisibilidad (nombres) + etiquetas de estado.
    criterio: {
      derechoFundamental: "Derecho fundamental afectado",
      legitimacion: "Legitimación para actuar",
      subsidiariedad: "Subsidiariedad / perjuicio irremediable",
      inmediatez: "Inmediatez de la afectación",
      noTemeridad: "Ausencia de temeridad",
      hechoSuperado: "Vulneración aún vigente",
      estado: {
        ok: "Cumple",
        reserva: "Con reserva",
        falla: "No cumple",
      },
    },

    // --- PASO 4: pronóstico ---
    step4: {
      title: "Tu pronóstico",
      subtitle:
        "Estimación basada en casos reales de la Corte Constitucional.",
      reglaAplicable: "Regla aplicable",
      sentenciasTitulo: "Sentencias que respaldan tu caso",
      sentenciasNota:
        "Material ilustrativo. Una persona profesional del derecho debe revisar el caso antes de su uso formal.",
      siguiente: "Decidir mi camino",
    },

    // Medidor de probabilidad (gauge).
    gauge: {
      // {v} = valor en porcentaje; {etiqueta} = nivel.
      aria: "Probabilidad estimada de fallo a favor: {v} por ciento. {etiqueta}.",
      alta: "Probabilidad alta",
      media: "Probabilidad media",
      baja: "Probabilidad baja",
    },

    // --- PASO 5: decisión de ruta ---
    step5: {
      title: "¿Cómo quieres avanzar?",
      subtitle: "Elige un camino. Amparo redacta el documento por ti.",
      volverPronostico: "Volver al pronóstico",
      reclamacion: {
        titulo: "Intentar con mi EPS",
        descripcion:
          "Radicamos un derecho de petición formal: identificamos quién en tu EPS debe responder y desde cuándo corre el plazo legal. Suele ser más rápido si la entidad responde a tiempo.",
        cta: "Radicar derecho de petición",
      },
      tutela: {
        titulo: "Generar mi tutela",
        descripcion:
          "Redactamos la acción de tutela completa, con radicado y plazos legales. La vía constitucional para proteger tu derecho.",
        cta: "Generar tutela",
      },
      redactando: "Redactando…",
      toast: {
        errorTitle: "No se pudo generar el documento",
        errorDesc: "Inténtalo de nuevo en un momento.",
      },
    },

    // --- PASO 5: resultado (documento listo) ---
    resultado: {
      // Mientras la tutela se escribe en streaming (carácter a carácter).
      redactandoTutela: "Redactando tu tutela…",
      redactandoTutelaSub:
        "Amparo está escribiendo tu acción de tutela. Verás el texto aparecer en tiempo real.",
      tutelaLista: "Tu tutela está lista",
      reclamacionLista: "Tu reclamación está lista",
      tutelaSub: "Revísala, descárgala o llévala al juzgado de reparto.",
      reclamacionSub:
        "Envíala a tu EPS. Si no responde a tiempo, podrás escalar a tutela.",
      radicado: "Radicado",
      avanceCaso: "Avance del caso",
      plazosTitulo: "Plazos legales de tu tutela",
      // {fecha}, {dias}, {tipo}, {fundamento} se interpolan.
      plazoVence: "Vence el {fecha} · {dias} días {tipo} · {fundamento}",
      diasHabiles: "hábiles",
      diasCalendario: "calendario",
      docTutela: "Acción de tutela",
      docReclamacion: "Reclamación a la EPS",
      copiar: "Copiar",
      otroCaso: "Iniciar otro caso",
      toast: {
        copiadoOk: "Documento copiado al portapapeles",
        copiadoError: "No se pudo copiar",
      },
    },

    // Eventos del expediente (registrados en el timeline del caso).
    evento: {
      triajeTitulo: "Triaje de admisibilidad",
      // {veredicto} = veredicto legible.
      triajeDetalle: "Veredicto: {veredicto}.",
      prediccionTitulo: "Predicción del resultado",
      // {pct} = probabilidad.
      prediccionDetalle: "Probabilidad estimada de amparo: {pct}%.",
      peticionTitulo: "Derecho de petición radicado ante la EPS",
      // {dependencia}, {dias}, {tipo}, {radicado} se interpolan.
      peticionDetalle:
        "Responsable: {dependencia}. Término de respuesta: {dias} días {tipo} (radicado {radicado}).",
      tutelaTitulo: "Tutela radicada",
      // {radicado} se interpola.
      tutelaDetalle: "Radicado {radicado}.",
      casoRecibido: "Caso recibido en Amparo",
    },

    // Navegación entre pasos.
    nav: {
      atras: "Atrás",
      procesando: "Procesando…",
    },

    // Reloj del derecho de petición (peticion-reloj.tsx).
    peticion: {
      titulo: "Derecho de petición radicado",
      subtitulo:
        "Tu EPS está obligada a responder de fondo dentro del término legal.",
      quienResponde: "¿Quién debe responder?",
      cuandoResponde: "¿Cuándo debe responder?",
      // {fecha}, {dias}, {tipo} se interpolan.
      vence: "Vence el {fecha} · {dias} días {tipo}",
      diasHabiles: "hábiles",
      diasCalendario: "calendario",
    },

    // --- Frases HABLADAS (modo voz) ---
    say: {
      // {titulo} = título del veredicto; {recomendacion} = recomendación.
      veredicto: "{titulo}. {recomendacion}",
      // {pct} = probabilidad; {regla} = regla aplicable.
      pronostico:
        "Tu pronóstico: la probabilidad estimada de que prospere el amparo es del {pct} por ciento. {regla}",
      docTutela:
        "Tu tutela está lista. Revísala, descárgala o llévala al juzgado de reparto.",
      docReclamacion:
        "Tu reclamación está lista. Envíala a tu EPS. Si no responde a tiempo, podrás escalar a tutela.",
      // Pronóstico completo (botón de voz del paso 4).
      pronosticoCompleto:
        "Tu pronóstico. La probabilidad estimada de que prospere el amparo es del {pct} por ciento. {regla}. {razonamiento}",
    },
  },

  en: {
    meta: {
      title: "Claimant · Amparo",
      description:
        "From your account to a tutela (constitutional injunction) in minutes. Amparo walks you through every step to protect your right to health.",
    },

    page: {
      title: "From your story to your tutela",
      subtitle:
        "Tell us what happened with your EPS (health insurer). Amparo organizes your case, assesses whether it qualifies, gives you a forecast backed by real judgments, and drafts your document. You decide the path.",
      tagline:
        "Amparo is the fourth party that stands with you: consistent results, not arbitrary ones. The final decision is always a human's.",
    },

    copilot: {
      title: "Amparo, your copilot",
    },

    stepper: {
      label: "Step {actual} of {total}",
    },

    steps: {
      tell: "Tell us what happened",
      yourCase: "Your case",
      proceeds: "Does it qualify?",
      forecast: "Forecast",
      decision: "Decision",
    },

    voice: {
      on: "Voice mode on",
      off: "Voice mode off",
      title: "Amparo reads each step aloud for you",
      ariaOn: "Turn off voice mode: Amparo will stop reading aloud",
      ariaOff: "Turn on voice mode: Amparo will read each step aloud",
    },

    step1: {
      title: "Tell us what happened",
      subtitle:
        "In your own words: what your EPS denied you and why you need it. You can type or dictate with the microphone.",
      placeholder:
        "For example: “My doctor ordered hip surgery and my EPS hasn't authorized it…”",
      ariaRelato: "Account of the facts",
      dictar: "Dictate",
      detener: "Stop",
      noDictado:
        "Your browser doesn't support voice dictation; please type your account.",
      usarEjemplo: "Use Amparo's example",
      continuar: "Continue",
      organizando: "Amparo is organizing your case…",
      ejemplo:
        "My name is Amparo Restrepo, I'm 68 years old and I live in Medellín. I'm a member of EPS Sura. Months ago my doctor ordered hip surgery, an arthroplasty, because I have severe coxarthrosis and the pain won't let me walk or sleep. The EPS hasn't authorized the operation; they say it's under a medical-appropriateness review, and I'm getting worse every day. I need to be operated on soon.",
      toast: {
        cortoTitle: "Tell us a little more",
        cortoDesc:
          "Describe what service you were denied and why you need it.",
        ejemploTitle: "Amparo's example loaded",
        ejemploDesc: "You can edit it or continue as is.",
        okTitle: "Amparo organized your case",
        okDesc: "Review the details and fix anything you need to.",
        errorTitle: "The case couldn't be structured",
        errorDesc: "Check your connection and try again.",
      },
    },

    step2: {
      title: "Here's how I understood your case",
      subtitle: "Review and correct. You have the final say.",
      fields: {
        paciente: "Patient",
        pacientePlaceholder: "Patient's name",
        eps: "EPS or entity",
        epsPlaceholder: "Name of the EPS",
        servicioNegado: "Denied service",
        tipoServicio: "Type of service",
        diagnostico: "Diagnosis",
        urgencia: "Urgency",
        hechos: "Facts",
        pretension: "What you're asking for (claim)",
      },
      derechosEnJuego: "Rights at stake:",
      siguiente: "Assess whether it qualifies",
      cargando: "Assessing admissibility…",
      toast: {
        errorTitle: "Admissibility couldn't be assessed",
        errorDesc: "Try again in a moment.",
      },
    },

    tipoServicio: {
      cirugia: "Surgery",
      medicamento: "Medication",
      examen_diagnostico: "Diagnostic test",
      tratamiento: "Treatment",
      traslado_ambulancia: "Transport / ambulance",
      terapia: "Therapy",
      insumo_dispositivo: "Supply or device",
      consulta_especialista: "Specialist consultation",
      otro: "Other",
    },

    urgencia: {
      baja: "Low",
      media: "Medium",
      alta: "High",
      vital: "Critical (life-threatening)",
    },

    step3: {
      siguiente: "See my forecast",
      cargando: "Analyzing precedents…",
      banderasTitulo: "Things to keep in mind",
      rutaSugerida: "Suggested path:",
      rutaTutela: "tutela (constitutional injunction)",
      rutaEps: "negotiation with the EPS",
      confianza: "{pct}% confidence",
      toast: {
        errorTitle: "The forecast couldn't be calculated",
      },
    },

    veredicto: {
      admisible: "Your case is admissible",
      admisible_con_reservas: "Admissible, with some reservations",
      inadmisible: "For now, the case would not qualify",
    },

    criterio: {
      derechoFundamental: "Fundamental right affected",
      legitimacion: "Standing to act",
      subsidiariedad: "Subsidiarity / irreparable harm",
      inmediatez: "Immediacy of the harm",
      noTemeridad: "Absence of bad faith",
      hechoSuperado: "Violation still ongoing",
      estado: {
        ok: "Met",
        reserva: "With reservations",
        falla: "Not met",
      },
    },

    step4: {
      title: "Your forecast",
      subtitle:
        "Estimate based on real Constitutional Court cases.",
      reglaAplicable: "Applicable rule",
      sentenciasTitulo: "Judgments that support your case",
      sentenciasNota:
        "Illustrative material. A legal professional must review the case before any formal use.",
      siguiente: "Decide my path",
    },

    gauge: {
      aria: "Estimated probability of a favorable ruling: {v} percent. {etiqueta}.",
      alta: "High probability",
      media: "Medium probability",
      baja: "Low probability",
    },

    step5: {
      title: "How do you want to move forward?",
      subtitle: "Choose a path. Amparo drafts the document for you.",
      volverPronostico: "Back to the forecast",
      reclamacion: {
        titulo: "Try with my EPS first",
        descripcion:
          "We file a formal right-of-petition request: we identify who at your EPS must respond and when the legal deadline starts. It's usually faster if the entity responds on time.",
        cta: "File right-of-petition request",
      },
      tutela: {
        titulo: "Generate my tutela",
        descripcion:
          "We draft the complete tutela (constitutional injunction), with a case number and legal deadlines. The constitutional path to protect your right.",
        cta: "Generate tutela",
      },
      redactando: "Drafting…",
      toast: {
        errorTitle: "The document couldn't be generated",
        errorDesc: "Try again in a moment.",
      },
    },

    resultado: {
      // While the tutela is being written in streaming (character by character).
      redactandoTutela: "Drafting your tutela…",
      redactandoTutelaSub:
        "Amparo is writing your tutela. You'll see the text appear in real time.",
      tutelaLista: "Your tutela is ready",
      reclamacionLista: "Your claim is ready",
      tutelaSub: "Review it, download it, or take it to the assigning court.",
      reclamacionSub:
        "Send it to your EPS. If they don't respond on time, you'll be able to escalate to a tutela.",
      radicado: "Case number",
      avanceCaso: "Case progress",
      plazosTitulo: "Legal deadlines for your tutela",
      plazoVence: "Due on {fecha} · {dias} {tipo} days · {fundamento}",
      diasHabiles: "business",
      diasCalendario: "calendar",
      docTutela: "Tutela (constitutional injunction)",
      docReclamacion: "Claim to the EPS",
      copiar: "Copy",
      otroCaso: "Start another case",
      toast: {
        copiadoOk: "Document copied to clipboard",
        copiadoError: "Couldn't copy",
      },
    },

    evento: {
      triajeTitulo: "Admissibility triage",
      triajeDetalle: "Verdict: {veredicto}.",
      prediccionTitulo: "Outcome prediction",
      prediccionDetalle: "Estimated probability of relief: {pct}%.",
      peticionTitulo: "Right-of-petition request filed with the EPS",
      peticionDetalle:
        "Responsible party: {dependencia}. Response deadline: {dias} {tipo} days (case number {radicado}).",
      tutelaTitulo: "Tutela filed",
      tutelaDetalle: "Case number {radicado}.",
      casoRecibido: "Case received at Amparo",
    },

    nav: {
      atras: "Back",
      procesando: "Processing…",
    },

    peticion: {
      titulo: "Right-of-petition request filed",
      subtitulo:
        "Your EPS is required to respond on the merits within the legal deadline.",
      quienResponde: "Who must respond?",
      cuandoResponde: "When must they respond?",
      vence: "Due on {fecha} · {dias} {tipo} days",
      diasHabiles: "business",
      diasCalendario: "calendar",
    },

    say: {
      veredicto: "{titulo}. {recomendacion}",
      pronostico:
        "Your forecast: the estimated probability that the relief will succeed is {pct} percent. {regla}",
      docTutela:
        "Your tutela is ready. Review it, download it, or take it to the assigning court.",
      docReclamacion:
        "Your claim is ready. Send it to your EPS. If they don't respond on time, you'll be able to escalate to a tutela.",
      pronosticoCompleto:
        "Your forecast. The estimated probability that the relief will succeed is {pct} percent. {regla}. {razonamiento}",
    },
  },
} as const;
