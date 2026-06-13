// lib/i18n/dict/anexos.ts — Namespace "anexos".
// Textos de la UI de subida y lectura multimodal de documentos anexos.

export const anexos = {
  es: {
    // — Encabezado / disparador —
    "title": "Documentos anexos",
    "subtitle": "Sube la negación de la EPS, la orden médica o la historia clínica. Amparo los lee por ti.",

    // — Integración en el wizard (paso "Tu caso") —
    "step.title": "Adjunta tus documentos (opcional)",
    "step.subtitle": "Si tienes la negación, la orden médica o la historia clínica, súbelas: Amparo las lee y completa tu caso con esos datos. Las anexamos como pruebas de tu tutela.",
    "toast.title": "Caso complementado",
    "toast.desc": "Usamos los datos de tus documentos para completar tu caso.",
    "cta.upload": "Subir documentos",
    "cta.add": "Añadir documento",
    "dropzone.hint": "Arrastra aquí tus archivos o haz clic para elegirlos",
    "dropzone.formats": "Imágenes (PNG, JPG) o PDF · hasta 12 MB por archivo",
    "cta.remove": "Quitar",
    "cta.process": "Leer documentos",

    // — Estados —
    "state.reading": "Leyendo…",
    "state.readingOne": "Leyendo {nombre}…",
    "state.complementing": "Complementando tu caso…",
    "state.done": "Listo",
    "state.empty": "Aún no has subido ningún documento.",

    // — Tipos de documento —
    "tipo.negacion_eps": "Negación de la EPS",
    "tipo.orden_medica": "Orden médica",
    "tipo.historia_clinica": "Historia clínica",
    "tipo.cedula": "Cédula",
    "tipo.formula_medica": "Fórmula médica",
    "tipo.carnet_eps": "Carnet de EPS",
    "tipo.derecho_peticion": "Derecho de petición",
    "tipo.otro": "Otro documento",

    // — Resultado de la lectura —
    "result.title": "Esto encontramos en tus documentos",
    "result.summary": "Resumen",
    "result.data": "Datos extraídos",
    "result.text": "Texto del documento",
    "result.text.toggle": "Ver transcripción",
    "result.doubtful": "Lectura dudosa",
    "result.noData": "No encontramos datos estructurados en este documento.",

    // — Complemento del caso —
    "complement.cta": "Complementar mi caso con estos documentos",
    "complement.title": "Complementamos tu caso con…",
    "complement.filled": "Rellenamos {campo} con “{valor}”.",
    "complement.corrected": "Corregimos {campo}: de “{antes}” a “{despues}”.",
    "complement.added": "Anexamos {valor} como prueba.",
    "complement.none": "No hubo nada nuevo que complementar; guardamos los documentos como prueba.",
    "complement.review": "Revisa los cambios antes de continuar.",
    "complement.apply": "Aplicar a mi caso",
    "complement.applied": "Listo: tu caso quedó complementado con tus documentos.",

    // — Campos (etiquetas legibles) —
    "campo.servicioNegado": "servicio negado",
    "campo.diagnostico": "diagnóstico",
    "campo.demandado.nombre": "EPS accionada",
    "campo.demandante.nombre": "nombre del paciente",
    "campo.demandante.documento": "documento del paciente",
    "campo.anexos": "documentos",

    // — Errores —
    "error.generic": "No pudimos leer tus documentos. Inténtalo de nuevo.",
    "error.tooLarge": "El archivo “{nombre}” es demasiado grande (máximo 12 MB).",
    "error.tooMany": "Demasiados archivos: máximo 8 por vez.",
    "error.unsupported": "Formato no soportado. Sube una imagen (PNG, JPG) o un PDF.",
    "error.empty": "No seleccionaste ningún archivo.",
    "error.partial": "Algunos documentos no se pudieron leer.",
  },
  en: {
    // — Header / trigger —
    "title": "Attached documents",
    "subtitle": "Upload the EPS denial, the medical order or the clinical history. Amparo reads them for you.",

    // — Wizard integration (the "Your case" step) —
    "step.title": "Attach your documents (optional)",
    "step.subtitle": "If you have the denial, the medical order or the clinical history, upload them: Amparo reads them and completes your case with that data. We attach them as evidence for your tutela.",
    "toast.title": "Case completed",
    "toast.desc": "We used the data from your documents to complete your case.",
    "cta.upload": "Upload documents",
    "cta.add": "Add document",
    "dropzone.hint": "Drag your files here or click to choose them",
    "dropzone.formats": "Images (PNG, JPG) or PDF · up to 12 MB per file",
    "cta.remove": "Remove",
    "cta.process": "Read documents",

    // — States —
    "state.reading": "Reading…",
    "state.readingOne": "Reading {nombre}…",
    "state.complementing": "Completing your case…",
    "state.done": "Done",
    "state.empty": "You haven't uploaded any documents yet.",

    // — Document types —
    "tipo.negacion_eps": "EPS denial",
    "tipo.orden_medica": "Medical order",
    "tipo.historia_clinica": "Clinical history",
    "tipo.cedula": "ID card",
    "tipo.formula_medica": "Prescription",
    "tipo.carnet_eps": "EPS membership card",
    "tipo.derecho_peticion": "Right of petition",
    "tipo.otro": "Other document",

    // — Reading result —
    "result.title": "Here's what we found in your documents",
    "result.summary": "Summary",
    "result.data": "Extracted data",
    "result.text": "Document text",
    "result.text.toggle": "View transcription",
    "result.doubtful": "Uncertain reading",
    "result.noData": "We found no structured data in this document.",

    // — Case complement —
    "complement.cta": "Complete my case with these documents",
    "complement.title": "We completed your case with…",
    "complement.filled": "We filled {campo} with “{valor}”.",
    "complement.corrected": "We corrected {campo}: from “{antes}” to “{despues}”.",
    "complement.added": "We attached {valor} as evidence.",
    "complement.none": "Nothing new to complete; we saved the documents as evidence.",
    "complement.review": "Review the changes before continuing.",
    "complement.apply": "Apply to my case",
    "complement.applied": "Done: your case has been completed with your documents.",

    // — Fields (readable labels) —
    "campo.servicioNegado": "denied service",
    "campo.diagnostico": "diagnosis",
    "campo.demandado.nombre": "respondent EPS",
    "campo.demandante.nombre": "patient name",
    "campo.demandante.documento": "patient ID",
    "campo.anexos": "documents",

    // — Errors —
    "error.generic": "We couldn't read your documents. Please try again.",
    "error.tooLarge": "File “{nombre}” is too large (max 12 MB).",
    "error.tooMany": "Too many files: max 8 at a time.",
    "error.unsupported": "Unsupported format. Upload an image (PNG, JPG) or a PDF.",
    "error.empty": "You didn't select any file.",
    "error.partial": "Some documents could not be read.",
  },
} as const;
