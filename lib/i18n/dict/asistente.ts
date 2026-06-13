// lib/i18n/dict/asistente.ts — Namespace "asistente".
// Toda la copia visible Y las frases HABLADAS del asistente de voz de Amparo
// (app/asistente/page.tsx, components/avatar/*). Las frases habladas se
// resuelven en el idioma activo y se pasan tal cual a /api/voz, que con
// eleven_multilingual_v2 las pronuncia en español o inglés.
//
// Estructura ANIDADA (el resolver soporta dot-path) con interpolación {var}.

export const asistente = {
  es: {
    meta: {
      title: "Asistente · Amparo",
      description:
        "Habla con Amparo. Te saluda, te hace una pregunta a la vez y arma tu caso por ti — sin lenguaje jurídico, para cualquiera.",
    },

    page: {
      title: "Habla con Amparo",
      subtitle:
        "Te acompaño paso a paso. Solo cuéntame qué pasó con tu EPS, con tus propias palabras. Yo me encargo del resto.",
    },

    // Etiquetas de estado bajo el avatar (badge "Amparo" + descripción).
    avatar: {
      name: "Amparo",
      speaking: "está hablando…",
      thinking: "está pensando…",
      listening: "te está escuchando…",
      idle: "tu asistente de salud",
      processing: "Amparo está procesando",
    },

    // Hilo de conversación.
    thread: {
      label: "Conversación con Amparo",
      aboutToGreet: "Amparo está a punto de saludarte…",
      youSaid: "Tú dijiste: ",
      amparoSaid: "Amparo dijo: ",
    },

    // CTA de cierre hacia el expediente.
    closing: {
      question: "¿Listo para preparar tu tutela con todo el detalle?",
      cta: "Continuar a mi expediente",
    },

    // Caja de entrada (texto + micrófono).
    input: {
      placeholderRelato:
        "Escribe aquí lo que te pasó… (o usa el micrófono)",
      placeholderConfirmar: "Responde sí, o escribe la corrección…",
      ariaInput: "Tu respuesta para Amparo",
      ariaSend: "Enviar respuesta",
      ariaMicStart: "Hablar por micrófono",
      ariaMicStop: "Detener micrófono",
      repeat: "Repetir lo último que dijo Amparo",
      listeningHint: "Escuchando… habla con tranquilidad",
    },

    // --- Frases HABLADAS de Amparo (voz + burbuja) ---
    say: {
      greeting:
        "Hola, soy Amparo. Estoy aquí para ayudarte, con calma y en palabras sencillas. Cuéntame: ¿qué servicio de salud te negó tu EPS?",
      organizing: "Gracias por contarme. Dame un momento, lo organizo.",
      organizeFailed:
        "No logré organizar tu relato. ¿Puedes contármelo de otra forma?",
      noted: "Listo, lo anoté así.",
      gotEssentials: "Perfecto, ya tengo lo esencial. Déjame revisarlo.",
      triageFailed:
        "Tuve un problema evaluando tu caso. Intentémoslo de nuevo en un momento.",
      closing:
        "Eso es todo lo que necesitaba por ahora. Cuando quieras, seguimos con tu expediente completo para preparar tu tutela.",
      // {etiqueta} se sustituye con confirm.label.* (p.ej. "tu EPS").
      askAgain: "Sin problema. Dime entonces cuál es {etiqueta}.",
    },

    // Etiquetas usadas dentro de say.askAgain ("Dime cuál es …").
    confirm: {
      label: {
        eps: "tu EPS",
        servicioNegado: "el servicio que te negaron",
        diagnostico: "tu diagnóstico",
      },
      // Preguntas de confirmación campo por campo. {valor} = dato detectado.
      eps: {
        withValue: "Entendido. Tu EPS es {valor}, ¿es correcto?",
        empty: "No alcancé a entender el nombre de tu EPS. ¿Me dices cuál es?",
      },
      servicioNegado: {
        withValue: "Y lo que te negaron es: {valor}. ¿Está bien así?",
        empty: "¿Qué servicio exactamente te negó tu EPS?",
      },
      diagnostico: {
        withValue: "Anoté tu diagnóstico como: {valor}. ¿Lo dejo así?",
        empty:
          "Si tienes un diagnóstico del médico, dímelo. Si no, puedes dejarlo vacío y seguimos.",
      },
    },

    // Veredicto del triaje (hablado, sin jerga jurídica).
    verdict: {
      inadmissible:
        "Revisé tu caso. Con lo que me contaste, todavía no veo clara la procedencia de una tutela. No te preocupes: hay otros caminos y te acompaño igual.",
      mayProceed:
        "Tu tutela podría proceder, con un par de detalles por afinar.",
      proceeds: "Buenas noticias: tu tutela procede.",
      routeTutela: "Lo más conveniente es ir por la acción de tutela.",
      routeEps:
        "Conviene primero intentar resolverlo directamente con tu EPS.",
    },

    // Predicción (hablada). {pct} = probabilidad; {ref} = referencia a sentencia.
    prediction: {
      // {ref} ya incluye el espacio inicial cuando hay sentencia (o queda vacío).
      base: "Tu caso tiene cerca de un {pct} por ciento de probabilidad de que un juez ampare tu derecho.{ref}",
      // {sentencia} ya viene formateada (p.ej. "T-760 de 2008").
      ref: " Me apoyo en la Sentencia {sentencia}.",
      // {anio} opcional para la sentencia.
      year: " de {anio}",
    },
  },

  en: {
    meta: {
      title: "Assistant · Amparo",
      description:
        "Talk to Amparo. She greets you, asks one question at a time, and builds your case for you — no legal jargon, for anyone.",
    },

    page: {
      title: "Talk to Amparo",
      subtitle:
        "I'll walk you through it step by step. Just tell me what happened with your EPS (health insurer), in your own words. I'll take care of the rest.",
    },

    avatar: {
      name: "Amparo",
      speaking: "is speaking…",
      thinking: "is thinking…",
      listening: "is listening to you…",
      idle: "your health assistant",
      processing: "Amparo is processing",
    },

    thread: {
      label: "Conversation with Amparo",
      aboutToGreet: "Amparo is about to greet you…",
      youSaid: "You said: ",
      amparoSaid: "Amparo said: ",
    },

    closing: {
      question: "Ready to prepare your tutela (constitutional injunction) in full detail?",
      cta: "Continue to my case file",
    },

    input: {
      placeholderRelato:
        "Type what happened to you here… (or use the microphone)",
      placeholderConfirmar: "Reply yes, or type the correction…",
      ariaInput: "Your reply to Amparo",
      ariaSend: "Send reply",
      ariaMicStart: "Speak using the microphone",
      ariaMicStop: "Stop the microphone",
      repeat: "Repeat the last thing Amparo said",
      listeningHint: "Listening… take your time",
    },

    say: {
      greeting:
        "Hi, I'm Amparo. I'm here to help you, calmly and in plain words. Tell me: what health service did your EPS deny you?",
      organizing: "Thank you for telling me. Give me a moment, I'll organize it.",
      organizeFailed:
        "I couldn't organize your account. Could you tell me about it another way?",
      noted: "Done, I've noted it down.",
      gotEssentials: "Perfect, I have the essentials now. Let me review it.",
      triageFailed:
        "I ran into a problem assessing your case. Let's try again in a moment.",
      closing:
        "That's all I needed for now. Whenever you're ready, we'll continue with your full case file to prepare your tutela.",
      askAgain: "No problem. So tell me, what is {etiqueta}?",
    },

    confirm: {
      label: {
        eps: "your EPS",
        servicioNegado: "the service you were denied",
        diagnostico: "your diagnosis",
      },
      eps: {
        withValue: "Got it. Your EPS is {valor}, is that correct?",
        empty: "I didn't quite catch the name of your EPS. Can you tell me which one it is?",
      },
      servicioNegado: {
        withValue: "And what you were denied is: {valor}. Is that right?",
        empty: "What service exactly did your EPS deny you?",
      },
      diagnostico: {
        withValue: "I noted your diagnosis as: {valor}. Shall I leave it like that?",
        empty:
          "If you have a diagnosis from your doctor, tell me. If not, you can leave it blank and we'll continue.",
      },
    },

    verdict: {
      inadmissible:
        "I reviewed your case. With what you told me, I don't yet see a clear basis for a tutela. Don't worry: there are other paths, and I'll be with you all the same.",
      mayProceed:
        "Your tutela could go through, with a couple of details to fine-tune.",
      proceeds: "Good news: your tutela is viable.",
      routeTutela: "The best option is to go with the tutela (constitutional injunction).",
      routeEps:
        "It's best to first try to resolve it directly with your EPS.",
    },

    prediction: {
      base: "Your case has about a {pct} percent chance that a judge will protect your right.{ref}",
      ref: " I'm relying on Judgment {sentencia}.",
      year: " of {anio}",
    },
  },
} as const;
