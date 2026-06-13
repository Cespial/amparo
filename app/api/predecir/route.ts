import { NextResponse } from "next/server";
import {
  predecirCasoDetallado,
  type LangPrediccion,
} from "@/lib/ai/predictor";
import { resolverCaso } from "@/lib/ai/resolver-caso";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * POST /api/predecir
 * Request:  { caso: Caso; lang?: "es" | "en" }  ó  { casoId: string; lang?: "es" | "en" }
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
    const lang: LangPrediccion = body?.lang === "en" ? "en" : "es";
    const resultado = await predecirCasoDetallado(caso, lang);
    return NextResponse.json(resultado);
  } catch (e) {
    return NextResponse.json(
      { error: "Error en la predicción.", detalle: String(e) },
      { status: 500 },
    );
  }
}
