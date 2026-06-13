import { NextResponse } from "next/server";
import {
  MAX_AUDIO_BYTES,
  transcribirAudio,
  TranscribirError,
  type LangCorto,
} from "@/lib/transcribir";

export const runtime = "nodejs";
export const maxDuration = 120;

/** Normaliza el idioma de UI ("es"/"en") o lo deja indefinido (auto-detect). */
function normalizarLang(v: unknown): LangCorto | undefined {
  if (v === "en") return "en";
  if (v === "es") return "es";
  return undefined;
}

/** Mapea el código de TranscribirError a un HTTP status razonable. */
function statusDe(err: TranscribirError): number {
  switch (err.codigo) {
    case "audio-vacio":
      return 400;
    case "audio-grande":
      return 413;
    case "sin-proveedor":
      return 502;
    case "proveedores-fallaron":
      return 502;
  }
}

/**
 * POST /api/transcribir — Speech-to-text en la nube.
 *
 * Acepta dos formas de request:
 *   1) multipart/form-data:  file=<audio>, lang?=("es"|"en")
 *   2) application/json:      { audioBase64, mimeType?, lang? }
 *
 * Response 200: { text, proveedor: "scribe"|"whisper", idiomaDetectado? }
 * Response 400/413/502: { error, detalle? }
 *
 * Las API keys NUNCA se exponen al cliente (la transcripción pasa por aquí).
 */
export async function POST(req: Request) {
  const contentType = req.headers.get("content-type") ?? "";

  let audio: Blob | null = null;
  let mimeType = "";
  let lang: LangCorto | undefined;

  try {
    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      const file = form.get("file");
      if (!(file instanceof Blob)) {
        return NextResponse.json(
          { error: "Falta el campo 'file' (audio)." },
          { status: 400 },
        );
      }
      audio = file;
      mimeType = file.type || "";
      lang = normalizarLang(form.get("lang"));
    } else {
      // JSON con audio en base64.
      const body = (await req.json().catch(() => ({}))) as {
        audioBase64?: unknown;
        mimeType?: unknown;
        lang?: unknown;
      };
      const b64 = typeof body.audioBase64 === "string" ? body.audioBase64 : "";
      if (!b64) {
        return NextResponse.json(
          { error: "Falta 'audioBase64' o un 'file' multipart." },
          { status: 400 },
        );
      }
      // Soporta data URLs ("data:audio/webm;base64,...") y base64 pelado.
      const coma = b64.indexOf(",");
      const crudo = b64.startsWith("data:") && coma >= 0 ? b64.slice(coma + 1) : b64;
      mimeType = typeof body.mimeType === "string" ? body.mimeType : "";
      lang = normalizarLang(body.lang);
      let bytes: Uint8Array<ArrayBuffer>;
      try {
        const buf = Buffer.from(crudo, "base64");
        // Copia a un Uint8Array sobre un ArrayBuffer propio (BlobPart válido y
        // no SharedArrayBuffer, que el tipo de Blob rechaza).
        const ab = new ArrayBuffer(buf.byteLength);
        bytes = new Uint8Array(ab);
        bytes.set(buf);
      } catch {
        return NextResponse.json(
          { error: "El audio base64 es inválido." },
          { status: 400 },
        );
      }
      if (bytes.byteLength > MAX_AUDIO_BYTES) {
        return NextResponse.json(
          { error: "El audio es demasiado grande." },
          { status: 413 },
        );
      }
      audio = new Blob([bytes], {
        type: mimeType || "application/octet-stream",
      });
    }
  } catch (e) {
    return NextResponse.json(
      { error: "No se pudo leer el audio del request.", detalle: String(e) },
      { status: 400 },
    );
  }

  try {
    const resultado = await transcribirAudio(audio, { mimeType, lang });
    return NextResponse.json(resultado, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (e) {
    if (e instanceof TranscribirError) {
      return NextResponse.json(
        { error: e.message, ...(e.detalle ? { detalle: e.detalle } : {}) },
        { status: statusDe(e) },
      );
    }
    return NextResponse.json(
      { error: "Error al transcribir el audio.", detalle: String(e) },
      { status: 500 },
    );
  }
}
