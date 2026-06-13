import { NextResponse } from "next/server";
import { predecirCasoDetallado } from "@/lib/ai/predictor";
import { resolverCaso } from "@/lib/ai/resolver-caso";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * POST /api/predecir
 * Request:  { caso: Caso }  ó  { casoId: string }
 * Response: PrediccionResultado
 *   { probabilidadAmparo: number (0-100); sentenciasCitadas: SentenciaRef[];
 *     reglaAplicable: string; razonamiento: string }
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
    const resultado = await predecirCasoDetallado(caso);
    return NextResponse.json(resultado);
  } catch (e) {
    return NextResponse.json(
      { error: "Error en la predicción.", detalle: String(e) },
      { status: 500 },
    );
  }
}
