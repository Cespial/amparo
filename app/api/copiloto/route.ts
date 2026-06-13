import { NextResponse } from "next/server";
import { responderCopilotoStream } from "@/lib/ai/copiloto";
import { resolverCaso } from "@/lib/ai/resolver-caso";
import type { RolUsuario } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

const ROLES: RolUsuario[] = ["demandante", "demandado", "juez", "atlas"];

/**
 * POST /api/copiloto
 * Request:  { rol: RolUsuario; pregunta: string; caso?: Caso; casoId?: string }
 * Response: text/plain stream (toTextStreamResponse).
 */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const pregunta =
      typeof body?.pregunta === "string" ? body.pregunta.trim() : "";
    if (!pregunta) {
      return NextResponse.json(
        { error: "Falta 'pregunta'." },
        { status: 400 },
      );
    }
    const rol: RolUsuario = ROLES.includes(body?.rol) ? body.rol : "demandante";
    const caso = resolverCaso(body) ?? undefined;

    const result = responderCopilotoStream({
      rol,
      pregunta,
      casoId: typeof body?.casoId === "string" ? body.casoId : caso?.id,
      caso,
    });
    return result.toTextStreamResponse();
  } catch (e) {
    return NextResponse.json(
      { error: "Error en el copiloto.", detalle: String(e) },
      { status: 500 },
    );
  }
}
