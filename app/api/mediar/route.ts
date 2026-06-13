import { NextResponse } from "next/server";
import { generarMediacion, type LangMediacion } from "@/lib/ai/mediador";
import { resolverCaso } from "@/lib/ai/resolver-caso";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * POST /api/mediar
 * Request:  { caso: Caso; lang?: "es" | "en" }  ó  { casoId: string; lang?: "es" | "en" }
 * Response: Mediacion
 *   { posicionDemandante: string; posicionEPS: string; consensoPropuesto: string;
 *     fundamento: string; terminos: string[]; fundamentos?: SentenciaRef[];
 *     aceptadoDemandante?: boolean; aceptadoEPS?: boolean;
 *     estado: "propuesta" | "aceptada" | "rechazada" }
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
    const lang: LangMediacion = body?.lang === "en" ? "en" : "es";
    const mediacion = await generarMediacion(caso, lang);
    return NextResponse.json(mediacion);
  } catch (e) {
    return NextResponse.json(
      { error: "Error en la mediación.", detalle: String(e) },
      { status: 500 },
    );
  }
}
