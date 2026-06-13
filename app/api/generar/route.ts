import { NextResponse } from "next/server";
import { generarDocumento, type TipoDocumento } from "@/lib/ai/generador";
import { resolverCaso } from "@/lib/ai/resolver-caso";

export const runtime = "nodejs";
export const maxDuration = 120;

const TIPOS: TipoDocumento[] = ["reclamacion", "tutela", "fallo"];

/**
 * POST /api/generar
 * Request:  { caso: Caso (ó casoId: string); tipo: "reclamacion"|"tutela"|"fallo" }
 * Response: { tipo: TipoDocumento; documento: string (Markdown) }
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
    const tipo: TipoDocumento = TIPOS.includes(body?.tipo) ? body.tipo : "tutela";
    const documento = await generarDocumento(caso, tipo);
    return NextResponse.json({ tipo, documento });
  } catch (e) {
    return NextResponse.json(
      { error: "Error al generar el documento.", detalle: String(e) },
      { status: 500 },
    );
  }
}
