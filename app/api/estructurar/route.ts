import { NextResponse } from "next/server";
import { estructurarCaso } from "@/lib/ai/estructurador";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * POST /api/estructurar
 * Request:  { relato: string; casoId?: string; lang?: "es" | "en" }
 * Response: EstructuracionOutput (Partial<Caso> + { eps?, paciente? })
 */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const relato = typeof body?.relato === "string" ? body.relato.trim() : "";
    if (!relato) {
      return NextResponse.json(
        { error: "Falta 'relato' (texto del paciente)." },
        { status: 400 },
      );
    }
    const lang = body?.lang === "en" ? "en" : "es";
    const resultado = await estructurarCaso({
      relato,
      casoId: body?.casoId,
      lang,
    });
    return NextResponse.json(resultado);
  } catch (e) {
    return NextResponse.json(
      { error: "Error al estructurar el caso.", detalle: String(e) },
      { status: 500 },
    );
  }
}
