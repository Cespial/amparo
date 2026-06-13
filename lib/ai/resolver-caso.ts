// lib/ai/resolver-caso.ts — Resuelve un Caso desde el cuerpo de una API route.
// Acepta { caso: Caso } directo, o { casoId } resuelto contra el seed (servidor).

import type { Caso } from "../types";
import { casosSeed } from "../seed";

/** Obtiene el caso del body: prioriza `caso` completo; si no, busca por `casoId`. */
export function resolverCaso(body: unknown): Caso | null {
  if (body && typeof body === "object") {
    const b = body as Record<string, unknown>;
    if (b.caso && typeof b.caso === "object" && "id" in (b.caso as object)) {
      return b.caso as Caso;
    }
    if (typeof b.casoId === "string") {
      return casosSeed.find((c) => c.id === b.casoId) ?? null;
    }
  }
  return null;
}
