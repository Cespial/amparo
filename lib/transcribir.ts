/**
 * Transcripción de audio en la nube (STT). SERVER-ONLY.
 *
 * Convención del repo: los módulos de servidor (lib/ai/*) NO llevan
 * "use client" y leen process.env / usan fetch del runtime de Node. Este
 * archivo sigue lo mismo: solo lo importa app/api/transcribir/route.ts; nunca
 * un componente cliente. Así las API keys jamás llegan al bundle del navegador.
 *
 * Primario:  ElevenLabs Scribe (scribe_v1) — multilingüe, auto-detecta idioma,
 *            mejor calidad con inglés/acentos que el SpeechRecognition del
 *            navegador.
 * Fallback:  OpenAI Whisper (whisper-1) — si Scribe falla (no-200/permiso/red).
 */

const SCRIBE_URL = "https://api.elevenlabs.io/v1/speech-to-text";
const WHISPER_URL = "https://api.openai.com/v1/audio/transcriptions";
const SCRIBE_MODEL = "scribe_v1";
const WHISPER_MODEL = "whisper-1";

/** Idioma de UI de Amparo. */
export type LangCorto = "es" | "en";

/** Tamaño máximo de audio aceptado (defensa básica). */
export const MAX_AUDIO_BYTES = 25 * 1024 * 1024; // 25 MB
/** Tamaño mínimo para considerar que hay audio real (evita blobs vacíos). */
export const MIN_AUDIO_BYTES = 512;

export interface TranscripcionResultado {
  /** Texto transcrito (puede ser cadena vacía si no se detectó habla). */
  text: string;
  /** Qué proveedor produjo el texto. */
  proveedor: "scribe" | "whisper";
  /** Idioma detectado por el proveedor, si lo reporta. */
  idiomaDetectado?: string;
}

/** Error de transcripción con código estable para la route. */
export class TranscribirError extends Error {
  constructor(
    message: string,
    readonly codigo:
      | "audio-vacio"
      | "audio-grande"
      | "sin-proveedor"
      | "proveedores-fallaron",
    readonly detalle?: string,
  ) {
    super(message);
    this.name = "TranscribirError";
  }
}

/** ISO-639-3 para Scribe. */
function langScribe(lang?: LangCorto): string | undefined {
  if (lang === "en") return "eng";
  if (lang === "es") return "spa";
  return undefined; // deja que Scribe auto-detecte
}

/** ISO-639-1 para Whisper. */
function langWhisper(lang?: LangCorto): string | undefined {
  if (lang === "en") return "en";
  if (lang === "es") return "es";
  return undefined;
}

/** Deriva un nombre de archivo con extensión razonable según el mimeType. */
function nombreArchivo(mimeType: string): string {
  const mt = mimeType.toLowerCase();
  if (mt.includes("webm")) return "audio.webm";
  if (mt.includes("mp4") || mt.includes("m4a")) return "audio.mp4";
  if (mt.includes("ogg")) return "audio.ogg";
  if (mt.includes("wav")) return "audio.wav";
  if (mt.includes("mpeg") || mt.includes("mp3")) return "audio.mp3";
  return "audio.webm";
}

/** Llama a ElevenLabs Scribe. Lanza si la respuesta no es 200. */
async function transcribirScribe(
  blob: Blob,
  filename: string,
  lang?: LangCorto,
): Promise<TranscripcionResultado> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) throw new Error("falta ELEVENLABS_API_KEY");

  const form = new FormData();
  form.append("model_id", SCRIBE_MODEL);
  form.append("file", blob, filename);
  const code = langScribe(lang);
  if (code) form.append("language_code", code);

  const res = await fetch(SCRIBE_URL, {
    method: "POST",
    headers: { "xi-api-key": apiKey },
    body: form,
  });

  if (!res.ok) {
    const detalle = await res.text().catch(() => "");
    throw new Error(`Scribe ${res.status}: ${detalle.slice(0, 300)}`);
  }

  const data = (await res.json().catch(() => ({}))) as {
    text?: unknown;
    language_code?: unknown;
    detected_language?: unknown;
  };
  const text = typeof data.text === "string" ? data.text.trim() : "";
  const idiomaDetectado =
    typeof data.language_code === "string"
      ? data.language_code
      : typeof data.detected_language === "string"
        ? data.detected_language
        : undefined;

  return { text, proveedor: "scribe", idiomaDetectado };
}

/** Llama a OpenAI Whisper. Lanza si la respuesta no es 200. */
async function transcribirWhisper(
  blob: Blob,
  filename: string,
  lang?: LangCorto,
): Promise<TranscripcionResultado> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("falta OPENAI_API_KEY");

  const form = new FormData();
  form.append("model", WHISPER_MODEL);
  form.append("file", blob, filename);
  const code = langWhisper(lang);
  if (code) form.append("language", code);
  // Pedimos JSON verboso para recuperar el idioma detectado.
  form.append("response_format", "verbose_json");

  const res = await fetch(WHISPER_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body: form,
  });

  if (!res.ok) {
    const detalle = await res.text().catch(() => "");
    throw new Error(`Whisper ${res.status}: ${detalle.slice(0, 300)}`);
  }

  const data = (await res.json().catch(() => ({}))) as {
    text?: unknown;
    language?: unknown;
  };
  const text = typeof data.text === "string" ? data.text.trim() : "";
  const idiomaDetectado =
    typeof data.language === "string" ? data.language : undefined;

  return { text, proveedor: "whisper", idiomaDetectado };
}

/**
 * Transcribe `audio` con Scribe y, si falla, con Whisper.
 *
 * @throws {TranscribirError} si el audio es vacío/grande o ambos proveedores
 *         fallan (o no hay ninguna API key configurada).
 */
export async function transcribirAudio(
  audio: Blob,
  opciones: { mimeType?: string; lang?: LangCorto } = {},
): Promise<TranscripcionResultado> {
  const mimeType = opciones.mimeType || audio.type || "audio/webm";
  const lang = opciones.lang;

  if (!audio || audio.size < MIN_AUDIO_BYTES) {
    throw new TranscribirError(
      "El audio está vacío o es demasiado corto.",
      "audio-vacio",
    );
  }
  if (audio.size > MAX_AUDIO_BYTES) {
    throw new TranscribirError(
      "El audio es demasiado grande.",
      "audio-grande",
    );
  }

  const hayScribe = !!process.env.ELEVENLABS_API_KEY;
  const hayWhisper = !!process.env.OPENAI_API_KEY;
  if (!hayScribe && !hayWhisper) {
    throw new TranscribirError(
      "Transcripción no disponible: falta configurar el proveedor.",
      "sin-proveedor",
    );
  }

  const filename = nombreArchivo(mimeType);
  const fallos: string[] = [];

  // 1) Primario: ElevenLabs Scribe.
  if (hayScribe) {
    try {
      return await transcribirScribe(audio, filename, lang);
    } catch (e) {
      fallos.push(String(e));
    }
  }

  // 2) Fallback: OpenAI Whisper.
  if (hayWhisper) {
    try {
      return await transcribirWhisper(audio, filename, lang);
    } catch (e) {
      fallos.push(String(e));
    }
  }

  throw new TranscribirError(
    "No se pudo transcribir el audio con ningún proveedor.",
    "proveedores-fallaron",
    fallos.join(" | ").slice(0, 500),
  );
}
