import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 30;

const ELEVEN_BASE = "https://api.elevenlabs.io/v1/text-to-speech";
const MODELO_TTS = "eleven_multilingual_v2";
const LIMITE_TEXTO = 800;

/** Recorta el texto a un límite razonable, cerrando con elipsis. */
function recortar(texto: string): string {
  const limpio = texto.replace(/\s+/g, " ").trim();
  if (limpio.length <= LIMITE_TEXTO) return limpio;
  return `${limpio.slice(0, LIMITE_TEXTO - 1).trimEnd()}…`;
}

/**
 * POST /api/voz
 * Request:  { texto: string; voiceId?: string }
 * Response: audio/mpeg (MP3) generado por ElevenLabs.
 *
 * Si falta la API key o ElevenLabs falla, responde 502 con { error }
 * para que el cliente degrade a Web Speech.
 */
export async function POST(req: Request) {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  const voiceDefault = process.env.ELEVENLABS_VOICE_ID;

  if (!apiKey) {
    return NextResponse.json(
      { error: "Voz no disponible (falta ELEVENLABS_API_KEY)." },
      { status: 502 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    body = {};
  }
  const b = (body ?? {}) as { texto?: unknown; voiceId?: unknown };
  const texto = typeof b.texto === "string" ? b.texto.trim() : "";
  if (!texto) {
    return NextResponse.json({ error: "Falta 'texto'." }, { status: 400 });
  }

  const voiceId =
    (typeof b.voiceId === "string" && b.voiceId.trim()) || voiceDefault;
  if (!voiceId) {
    return NextResponse.json(
      { error: "Voz no disponible (falta voiceId)." },
      { status: 502 },
    );
  }

  try {
    const upstream = await fetch(`${ELEVEN_BASE}/${voiceId}`, {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text: recortar(texto),
        model_id: MODELO_TTS,
      }),
    });

    if (!upstream.ok || !upstream.body) {
      const detalle = await upstream.text().catch(() => "");
      return NextResponse.json(
        {
          error: "ElevenLabs no pudo generar el audio.",
          status: upstream.status,
          detalle: detalle.slice(0, 300),
        },
        { status: 502 },
      );
    }

    // Reenvía el stream de audio tal cual al cliente.
    return new NextResponse(upstream.body, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    return NextResponse.json(
      { error: "No se pudo contactar a ElevenLabs.", detalle: String(e) },
      { status: 502 },
    );
  }
}
