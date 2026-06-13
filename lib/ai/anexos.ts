// lib/ai/anexos.ts — Núcleo de ANEXOS con lectura multimodal de Claude.
//
// Claude es multimodal: lee imágenes (image part) y PDFs (file part con
// mediaType application/pdf) NATIVAMENTE — es OCR + comprensión en un solo paso.
//
//  - leerAnexo(): arma un mensaje multimodal y, con generateObject (Opus),
//    extrae tipoDetectado, textoExtraido (OCR/transcripción), datosExtraidos y
//    un resumen, SOLO de lo que aparece en el documento (anti-alucinación).
//  - complementarCaso(): fusiona los datos de los anexos en el Caso, rellenando
//    o corrigiendo campos vacíos/inconsistentes, agregando los anexos como
//    pruebas, y devolviendo qué se complementó (para mostrar al usuario).
//
// REGLA: el schema Zod es SIMPLE (enums + strings/arrays). NO se usan
// z.number().min().max() porque rompen el structured output de Claude. Los
// rangos/cardinalidades se validan en código después de la generación.

import { z } from "zod";
import { generateObject } from "ai";
import { modeloRazona } from "./client";
import type { Anexo, Caso, EventoCaso, TipoAnexo } from "../types";

// — Entrada / salida públicas —

/** Archivo crudo recibido por el endpoint para su lectura multimodal. */
export interface AnexoInput {
  /** Nombre original del archivo, p.ej. "negacion_sura.pdf". */
  nombre: string;
  /** Media type IANA del archivo (p.ej. "image/png", "application/pdf"). */
  mimeType: string;
  /** Contenido del archivo en base64 (sin el prefijo data: URL). */
  dataBase64: string;
}

/** Un cambio concreto aplicado al caso al complementarlo con los anexos. */
export interface CambioComplemento {
  /** Campo del caso afectado, p.ej. "diagnostico" o "demandado.nombre". */
  campo: string;
  /** Valor que tenía antes (vacío si no había). */
  antes?: string;
  /** Valor nuevo tomado de los anexos. */
  despues: string;
  /** Acción aplicada. */
  accion: "rellenado" | "corregido" | "anexo_agregado";
  /** Anexo del que proviene el dato. */
  origen: string;
}

/** Resultado de complementarCaso: caso enriquecido + bitácora de cambios. */
export interface ComplementoResultado {
  /** Caso enriquecido con los datos de los anexos. */
  caso: Caso;
  /** Lista de "qué se complementó", para mostrar al usuario. */
  complementos: CambioComplemento[];
}

// — Tipos de anexo conocidos (enum del schema) —

const TIPOS_ANEXO = [
  "negacion_eps",
  "orden_medica",
  "historia_clinica",
  "cedula",
  "formula_medica",
  "carnet_eps",
  "derecho_peticion",
  "otro",
] as const satisfies readonly TipoAnexo[];

// — Schema de lectura de un anexo (SIMPLE: enums + strings) —
// `datosExtraidos` se modela como pares clave/valor (array de objetos) para no
// depender de z.record dinámico; se reconstruye el Record en código y se omite
// lo ausente. NUNCA se usan numéricos con min/max.

const parDato = z.object({
  clave: z
    .string()
    .describe(
      "Nombre canónico del dato, p.ej. servicioNegado, diagnostico, eps, medicoTratante, radicadoNegacion, paciente, documentoPaciente, fechaNegacion, fechaOrden, ips, codigoCups, codigoCie.",
    ),
  valor: z
    .string()
    .describe("Valor EXACTO tal como aparece en el documento."),
  dudoso: z
    .boolean()
    .describe(
      "true si el texto es ilegible/ambiguo y el valor es una lectura tentativa.",
    ),
});

const schema = z.object({
  tipoDetectado: z
    .enum(TIPOS_ANEXO)
    .describe("Tipo de documento detectado. Usa 'otro' si no encaja."),
  textoExtraido: z
    .string()
    .describe(
      "Transcripción/OCR FIEL del texto del documento. Marca lo ilegible con [ilegible].",
    ),
  resumen: z
    .string()
    .describe("Resumen del documento en 1-2 frases, en español."),
  fecha: z
    .string()
    .describe(
      "Fecha más relevante del documento (de la negación/orden/expedición). Cadena vacía si no aparece.",
    ),
  datos: z
    .array(parDato)
    .describe(
      "SOLO los datos que aparecen EN el documento. Omite por completo lo que no esté presente; no inventes campos.",
    ),
});

const SYSTEM = `Eres el módulo de lectura de anexos de Amparo, una plataforma ODR de tutelas de salud en Colombia. Recibes un documento (imagen escaneada o PDF) y haces OCR + comprensión.

Tu tarea: leer el documento y extraer de forma FIEL su contenido.
- tipoDetectado: clasifica el documento (negacion_eps = carta/comunicado de negación o no autorización de la EPS; orden_medica = orden o remisión del médico; historia_clinica = epicrisis/historia/notas clínicas; formula_medica = fórmula/receta de medicamentos; cedula = documento de identidad; carnet_eps = carnet o certificado de afiliación; derecho_peticion = derecho de petición; otro = cualquier otro).
- textoExtraido: transcribe el texto del documento tal cual; marca lo ilegible con [ilegible].
- datos: extrae SOLO los datos que aparecen EN el documento (servicioNegado, diagnostico, eps, medicoTratante, ips, radicadoNegacion, paciente, documentoPaciente, codigoCups, codigoCie, fechaNegacion, fechaOrden, etc.). Si un dato NO está en el documento, OMÍTELO; no lo inventes ni lo deduzcas. Si una lectura es tentativa por mala legibilidad, márcala con dudoso=true.
- resumen: 1-2 frases sobre qué es el documento y qué dice.

REGLA ANTI-ALUCINACIÓN ESTRICTA: solo reportas lo que está EN el documento. Está prohibido inventar nombres, diagnósticos, fechas, radicados o entidades. Ante la duda, marca dudoso=true o no lo incluyas. Devuelve solo los campos del esquema.`;

/** Normaliza el mimeType: deduce de la extensión si llega vacío/genérico. */
function normalizarMime(mimeType: string, nombre: string): string {
  const mt = (mimeType || "").toLowerCase().trim();
  if (mt && mt !== "application/octet-stream") return mt;
  const ext = nombre.toLowerCase().split(".").pop() ?? "";
  const mapa: Record<string, string> = {
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    webp: "image/webp",
    gif: "image/gif",
    heic: "image/heic",
    pdf: "application/pdf",
  };
  return mapa[ext] ?? "application/octet-stream";
}

/** ¿El mimeType corresponde a una imagen soportada? */
function esImagen(mimeType: string): boolean {
  return mimeType.startsWith("image/");
}

/** ¿El mimeType corresponde a un PDF? */
function esPdf(mimeType: string): boolean {
  return mimeType === "application/pdf";
}

/** Construye el Record<string,string|undefined> a partir de los pares del modelo. */
function aDatosExtraidos(
  datos: z.infer<typeof schema>["datos"],
): Record<string, string | undefined> {
  const out: Record<string, string | undefined> = {};
  for (const d of datos ?? []) {
    const clave = d.clave?.trim();
    const valor = d.valor?.trim();
    if (!clave || !valor) continue; // omitir lo ausente/vacío
    // Anotar lo dudoso para que la UI/fusión lo trate con cautela.
    out[clave] = d.dudoso ? `${valor} [dudoso]` : valor;
  }
  return out;
}

/** Genera un id estable-ish para el anexo. */
function anexoId(nombre: string): string {
  const slug = nombre
    .toLowerCase()
    .replace(/\.[a-z0-9]+$/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  return `anexo-${slug || "doc"}-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 6)}`;
}

/**
 * Lee un anexo (imagen o PDF) con Claude multimodal y extrae su contenido.
 *
 * Arma un mensaje de usuario con una parte de texto (instrucción) + una parte
 * `image` (si es imagen) o `file` con mediaType application/pdf (si es PDF), y
 * usa generateObject con el modelo de razonamiento (Opus) para producir un
 * Anexo estructurado. Solo extrae lo que está EN el documento.
 *
 * @param input  { nombre, mimeType, dataBase64 } del archivo.
 * @returns      Anexo con tipoDetectado, textoExtraido, datosExtraidos, resumen.
 * @throws       Si el tipo de archivo no es imagen ni PDF.
 */
export async function leerAnexo(input: AnexoInput): Promise<Anexo> {
  const mimeType = normalizarMime(input.mimeType, input.nombre);

  if (!esImagen(mimeType) && !esPdf(mimeType)) {
    throw new Error(
      `Tipo de archivo no soportado para lectura multimodal: ${mimeType}. Solo imágenes (image/*) o PDF (application/pdf).`,
    );
  }

  // Parte multimodal: image part para imágenes, file part para PDFs.
  const parteDocumento = esPdf(mimeType)
    ? ({
        type: "file" as const,
        data: input.dataBase64,
        mediaType: "application/pdf",
        filename: input.nombre,
      })
    : ({
        type: "image" as const,
        image: input.dataBase64,
        mediaType: mimeType,
      });

  const { object } = await generateObject({
    model: modeloRazona(),
    schema,
    system: SYSTEM,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text:
              `Lee este documento anexo de un caso de tutela en salud (archivo "${input.nombre}") ` +
              `y extrae su contenido fielmente. Recuerda: solo lo que aparece EN el documento.`,
          },
          parteDocumento,
        ],
      },
    ],
  });

  const fecha = object.fecha?.trim() || undefined;

  return {
    id: anexoId(input.nombre),
    nombre: input.nombre,
    mimeType,
    tipoDetectado: object.tipoDetectado,
    textoExtraido: object.textoExtraido?.trim() ?? "",
    datosExtraidos: aDatosExtraidos(object.datos),
    resumen: object.resumen?.trim() ?? "",
    ...(fecha ? { fecha } : {}),
  };
}

// — complementarCaso —

// Mapa de claves de datosExtraidos a campos del Caso que pueden rellenarse.
// Solo campos de texto simples del Caso; nada que requiera enums/validación
// dura se sobreescribe sin confirmación humana.

const schemaFusion = z.object({
  servicioNegado: z
    .string()
    .describe("Servicio de salud negado/demorado según los anexos. Vacío si no aplica."),
  diagnostico: z
    .string()
    .describe("Diagnóstico clínico según los anexos (con código CIE si aparece). Vacío si no aplica."),
  epsNombre: z
    .string()
    .describe("Nombre de la EPS/entidad accionada según los anexos. Vacío si no aplica."),
  pacienteNombre: z
    .string()
    .describe("Nombre del paciente según los anexos. Vacío si no aplica."),
  pacienteDocumento: z
    .string()
    .describe("Documento de identidad del paciente según los anexos. Vacío si no aplica."),
  radicadoNegacion: z
    .string()
    .describe("Radicado de la negación de la EPS según los anexos. Vacío si no aplica."),
  medicoTratante: z
    .string()
    .describe("Médico tratante según los anexos. Vacío si no aplica."),
  notas: z
    .array(z.string())
    .describe(
      "Observaciones sobre inconsistencias o vacíos entre el caso y los anexos, para mostrar al usuario.",
    ),
});

const SYSTEM_FUSION = `Eres el módulo de complemento de caso de Amparo. Recibes un CASO actual y el contenido EXTRAÍDO de uno o varios documentos anexos (negaciones de EPS, órdenes médicas, historia clínica, cédula, etc.).

Tu tarea: consolidar los datos de los anexos en una forma canónica que sirva para rellenar/corregir el caso. Reglas:
- Usa SOLO datos presentes en los anexos. No inventes. Si un campo no está en los anexos, déjalo vacío.
- Propón un valor SOLO cuando aporte algo de fondo: rellena un campo vacío del caso, o corrige un valor que el anexo contradice de forma sustantiva. NO propongas un valor que solo cambie la FORMA (mayúsculas, puntuación, un prefijo como "C.C.") ni uno MÁS ESCUETO que el que ya tiene el caso; en esos casos deja el campo vacío para conservar el dato del usuario.
- En "notas", señala inconsistencias entre lo que dice el caso y lo que dicen los anexos (p.ej. EPS distinta, diagnóstico que no coincide), en español, claras y breves.
- Ignora valores marcados con [dudoso] salvo que no exista otra fuente; si los usas, menciónalo en notas.
Devuelve solo los campos del esquema.`;

/**
 * Normaliza un valor para comparar equivalencia "de fondo": minúsculas, sin
 * acentos, colapsa espacios y descarta puntuación/prefijos de forma (p.ej.
 * "C.C. 43.215.678" ≈ "43215678"). Sirve para no tratar como CORRECCIÓN lo que
 * solo difiere en forma (mayúsculas, puntuación, un prefijo "C.C.").
 */
function normalizarComparacion(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "") // quita acentos
    .replace(/[^a-z0-9]+/g, " ") // puntuación → espacio
    .trim()
    .replace(/\s+/g, " ");
}

/**
 * ¿El valor nuevo es solo un "refinamiento trivial" del actual (o viceversa)?
 * True cuando, tras normalizar, son iguales o uno CONTIENE al otro. En ese caso
 * NO corregimos: evitamos churn cosmético ("43.215.678"→"C.C. 43.215.678") y
 * evitamos DEGRADAR un valor del usuario más completo por uno más escueto del
 * documento ("Pembrolizumab (medicamento oncológico de alto costo)"→"Pembrolizumab").
 */
function esRefinamientoTrivial(actual: string, nuevo: string): boolean {
  const a = normalizarComparacion(actual);
  const b = normalizarComparacion(nuevo);
  if (!a || !b) return false;
  if (a === b) return true;
  // Solo lo consideramos contención si la subcadena es sustantiva (>=3 chars),
  // para no anular correcciones reales por una coincidencia parcial mínima.
  const corta = a.length <= b.length ? a : b;
  const larga = a.length <= b.length ? b : a;
  return corta.length >= 3 && larga.includes(corta);
}

/** Aplica un valor de los anexos a un campo del caso, registrando el cambio. */
function aplicar(
  cambios: CambioComplemento[],
  campo: string,
  actual: string | undefined,
  nuevo: string | undefined,
  origen: string,
): string | undefined {
  const limpio = nuevo?.replace(/\s*\[dudoso\]\s*$/i, "").trim();
  if (!limpio) return actual;
  const actualLimpio = (actual ?? "").trim();
  // Rellenar si está vacío.
  if (!actualLimpio) {
    cambios.push({ campo, despues: limpio, accion: "rellenado", origen });
    return limpio;
  }
  // Mismo valor (ignorando forma) o refinamiento trivial / valor más escueto:
  // conservamos lo que ya tenía el caso, sin registrar una "corrección" ruidosa
  // ni degradar el dato del usuario.
  if (esRefinamientoTrivial(actualLimpio, limpio)) {
    return actual;
  }
  // Corrección REAL: el documento dice algo de fondo distinto. Marcada, no silenciosa.
  cambios.push({
    campo,
    antes: actualLimpio,
    despues: limpio,
    accion: "corregido",
    origen,
  });
  return limpio;
}

/**
 * Complementa un Caso con los datos extraídos de sus anexos.
 *
 * Con el modelo de razonamiento (Opus), consolida los datosExtraidos de los
 * anexos, rellena los campos vacíos del caso, MARCA (no silencia) las
 * correcciones de campos inconsistentes, agrega los anexos como pruebas
 * (caso.anexos) y registra un evento en el timeline. Devuelve el caso
 * enriquecido + la lista de qué se complementó.
 *
 * NO sobreescribe datos del usuario sin dejar constancia del cambio.
 *
 * @param caso    El caso a enriquecer.
 * @param anexos  Anexos ya leídos por leerAnexo().
 * @returns       { caso enriquecido, complementos: CambioComplemento[] }.
 */
export async function complementarCaso(
  caso: Caso,
  anexos: Anexo[],
): Promise<ComplementoResultado> {
  const cambios: CambioComplemento[] = [];

  // Caso enriquecido: copia superficial + anexos agregados como pruebas.
  const enriquecido: Caso = { ...caso };
  const previos = enriquecido.anexos ?? [];
  enriquecido.anexos = [...previos, ...anexos];
  for (const a of anexos) {
    cambios.push({
      campo: "anexos",
      despues: `${a.nombre} (${a.tipoDetectado})`,
      accion: "anexo_agregado",
      origen: a.nombre,
    });
  }

  if (anexos.length === 0) {
    return { caso: enriquecido, complementos: cambios };
  }

  // Contexto: caso compacto + datos de cada anexo.
  const contextoCaso = [
    `servicioNegado: ${caso.servicioNegado || "(vacío)"}`,
    `diagnostico: ${caso.diagnostico || "(vacío)"}`,
    `eps (demandado): ${caso.demandado?.nombre || "(vacío)"}`,
    `paciente: ${caso.demandante?.nombre || "(vacío)"}`,
    `documento paciente: ${caso.demandante?.documento || "(vacío)"}`,
  ].join("\n");

  const contextoAnexos = anexos
    .map((a, i) => {
      const datos = Object.entries(a.datosExtraidos)
        .map(([k, v]) => `    ${k}: ${v}`)
        .join("\n");
      return [
        `Anexo ${i + 1} — ${a.nombre} [${a.tipoDetectado}]`,
        `  resumen: ${a.resumen}`,
        datos ? `  datos:\n${datos}` : "  datos: (ninguno)",
      ].join("\n");
    })
    .join("\n\n");

  const { object } = await generateObject({
    model: modeloRazona(),
    schema: schemaFusion,
    system: SYSTEM_FUSION,
    prompt:
      `CASO ACTUAL:\n${contextoCaso}\n\n` +
      `CONTENIDO DE LOS ANEXOS (única fuente de verdad):\n${contextoAnexos}`,
  });

  // Fusión campo por campo, con registro de cada cambio. Un solo origen
  // agregado (los anexos) basta para la trazabilidad de la demo.
  const origen = anexos.map((a) => a.nombre).join(", ");

  enriquecido.servicioNegado =
    aplicar(cambios, "servicioNegado", caso.servicioNegado, object.servicioNegado, origen) ??
    caso.servicioNegado;
  enriquecido.diagnostico =
    aplicar(cambios, "diagnostico", caso.diagnostico, object.diagnostico, origen) ??
    caso.diagnostico;

  // Demandado (EPS) y demandante: copia anidada para no mutar el original.
  const epsNuevo = aplicar(
    cambios,
    "demandado.nombre",
    caso.demandado?.nombre,
    object.epsNombre,
    origen,
  );
  if (epsNuevo && epsNuevo !== caso.demandado?.nombre) {
    enriquecido.demandado = { ...caso.demandado, nombre: epsNuevo };
  }

  const pacienteNuevo = aplicar(
    cambios,
    "demandante.nombre",
    caso.demandante?.nombre,
    object.pacienteNombre,
    origen,
  );
  const docNuevo = aplicar(
    cambios,
    "demandante.documento",
    caso.demandante?.documento,
    object.pacienteDocumento,
    origen,
  );
  if (
    (pacienteNuevo && pacienteNuevo !== caso.demandante?.nombre) ||
    (docNuevo && docNuevo !== caso.demandante?.documento)
  ) {
    enriquecido.demandante = {
      ...caso.demandante,
      ...(pacienteNuevo ? { nombre: pacienteNuevo } : {}),
      ...(docNuevo ? { documento: docNuevo } : {}),
    };
  }

  // Registrar el complemento en el timeline (evento "documento").
  const evento: EventoCaso = {
    id: `ev-anexos-${Date.now().toString(36)}`,
    fecha: new Date().toISOString(),
    tipo: "documento",
    actor: "sistema",
    titulo:
      anexos.length === 1
        ? "Se anexó 1 documento"
        : `Se anexaron ${anexos.length} documentos`,
    detalle:
      cambios.filter((c) => c.accion !== "anexo_agregado").length > 0
        ? `Complementamos el caso con la lectura de: ${origen}.`
        : `Anexamos como prueba: ${origen}.`,
  };
  enriquecido.timeline = [...(caso.timeline ?? []), evento];

  return { caso: enriquecido, complementos: cambios };
}
