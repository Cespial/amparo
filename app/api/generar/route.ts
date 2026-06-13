import { NextResponse } from "next/server";
import {
  generarDocumento,
  generarDocumentoStream,
  type TipoDocumento,
} from "@/lib/ai/generador";
import { resolverCaso } from "@/lib/ai/resolver-caso";

export const runtime = "nodejs";
export const maxDuration = 120;

const TIPOS: TipoDocumento[] = ["reclamacion", "tutela", "fallo"];

/** ¿Se solicitó la respuesta en streaming? (?stream=1 ó body.stream === true). */
function quiereStream(req: Request, body: { stream?: unknown }): boolean {
  const flag = new URL(req.url).searchParams.get("stream");
  if (flag === "1" || flag === "true") return true;
  return body?.stream === true || body?.stream === 1 || body?.stream === "1";
}

/**
 * POST /api/generar
 * Request:  { caso: Caso (ó casoId: string); tipo: "reclamacion"|"tutela"|"fallo"; stream?: boolean }
 * Query:    ?stream=1  → respuesta en streaming.
 * Response (no-stream): { tipo: TipoDocumento; documento: string (Markdown) }
 * Response (stream):    text/plain stream (toTextStreamResponse), igual que /api/copiloto.
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

    if (quiereStream(req, body)) {
      // Stream text/plain (token a token). Mantiene los fixtures héroe como
      // fallback. El consumidor lo lee con res.body.getReader() (ver
      // components/segundo-cerebro.tsx).
      return generarDocumentoStream(caso, tipo);
    }

    const documento = await generarDocumento(caso, tipo);
    return NextResponse.json({ tipo, documento });
  } catch (e) {
    return NextResponse.json(
      { error: "Error al generar el documento.", detalle: String(e) },
      { status: 500 },
    );
  }
}
