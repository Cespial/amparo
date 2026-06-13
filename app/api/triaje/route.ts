import { NextResponse } from "next/server";
import { triarCasoDetallado } from "@/lib/ai/triaje";
import { resolverCaso } from "@/lib/ai/resolver-caso";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * POST /api/triaje
 * Request:  { caso: Caso }  ó  { casoId: string }
 * Response: TriajeResultado (veredicto + criterios + fundamentos + ...)
 */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const caso = resolverCaso(body);
    if (!caso) {
      return NextResponse.json(
        { error: "Falta 'caso' o 'casoId' válido." },
        { status: 400 },
      );
    }
    const resultado = await triarCasoDetallado(caso);
    return NextResponse.json(resultado);
  } catch (e) {
    return NextResponse.json(
      { error: "Error en el triaje.", detalle: String(e) },
      { status: 500 },
    );
  }
}
