import { NextResponse } from "next/server";
import {
  complementarCaso,
  leerAnexo,
  type AnexoInput,
} from "@/lib/ai/anexos";
import { resolverCaso } from "@/lib/ai/resolver-caso";
import type { Anexo } from "@/lib/types";

export const runtime = "nodejs";
// Lectura multimodal de varios PDFs/imágenes con Opus: damos margen amplio.
export const maxDuration = 300;

/** Tamaño máximo por archivo (decodificado): 12 MB. */
const MAX_BYTES = 12 * 1024 * 1024;
/** Máximo de archivos por petición. */
const MAX_ARCHIVOS = 8;

/** Tamaño aproximado en bytes de una cadena base64. */
function bytesBase64(b64: string): number {
  // 4 chars base64 ≈ 3 bytes; descontamos el padding.
  const padding = b64.endsWith("==") ? 2 : b64.endsWith("=") ? 1 : 0;
  return Math.floor((b64.length * 3) / 4) - padding;
}

/** Quita el prefijo data: URL si viene incluido. */
function limpiarBase64(data: string): string {
  const i = data.indexOf("base64,");
  return i >= 0 ? data.slice(i + "base64,".length) : data;
}

/**
 * Extrae los AnexoInput del cuerpo, soportando dos formatos:
 *  - JSON: { archivos: [{ nombre, mimeType, dataBase64 }] }
 *  - multipart/form-data: campos File bajo "archivos" (o cualquier File).
 * Devuelve también el cuerpo JSON parseado (para resolver el caso) o null.
 */
async function leerEntrada(
  req: Request,
): Promise<{ archivos: AnexoInput[]; body: unknown }> {
  const contentType = req.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    const form = await req.formData();
    const archivos: AnexoInput[] = [];
    for (const [, value] of form.entries()) {
      if (value instanceof File) {
        const buf = Buffer.from(await value.arrayBuffer());
        archivos.push({
          nombre: value.name || "documento",
          mimeType: value.type || "application/octet-stream",
          dataBase64: buf.toString("base64"),
        });
      }
    }
    // El caso puede venir como campo JSON "caso" o "casoId".
    const casoRaw = form.get("caso");
    const casoId = form.get("casoId");
    let body: unknown = null;
    if (typeof casoRaw === "string") {
      try {
        body = { caso: JSON.parse(casoRaw) };
      } catch {
        body = null;
      }
    } else if (typeof casoId === "string") {
      body = { casoId };
    }
    return { archivos, body };
  }

  // JSON por defecto.
  const body = await req.json().catch(() => ({}));
  const lista = Array.isArray((body as { archivos?: unknown })?.archivos)
    ? ((body as { archivos: unknown[] }).archivos as unknown[])
    : [];
  const archivos: AnexoInput[] = lista
    .map((a) => {
      const o = (a ?? {}) as Record<string, unknown>;
      const nombre = typeof o.nombre === "string" ? o.nombre : "documento";
      const mimeType = typeof o.mimeType === "string" ? o.mimeType : "";
      const dataBase64 =
        typeof o.dataBase64 === "string"
          ? limpiarBase64(o.dataBase64)
          : "";
      return { nombre, mimeType, dataBase64 };
    })
    .filter((a) => a.dataBase64.length > 0);

  return { archivos, body };
}

/**
 * POST /api/anexos
 *
 * Recibe uno o varios documentos (imágenes o PDF) y los lee con Claude
 * multimodal. Opcionalmente complementa un caso con lo extraído.
 *
 * Request (JSON):
 *   {
 *     archivos: [{ nombre: string; mimeType: string; dataBase64: string }],
 *     caso?: Caso,          // o
 *     casoId?: string       // para complementar el caso
 *   }
 * Request (multipart/form-data):
 *   campos File (cualquier nombre) + "caso" (JSON) o "casoId" opcionales.
 *
 * Response:
 *   {
 *     anexos: Anexo[],                   // siempre
 *     caso?: Caso,                       // si se pasó un caso (enriquecido)
 *     complementos?: CambioComplemento[] // si se pasó un caso
 *   }
 */
export async function POST(req: Request) {
  try {
    const { archivos, body } = await leerEntrada(req);

    if (archivos.length === 0) {
      return NextResponse.json(
        { error: "No se recibió ningún archivo. Envía 'archivos' (JSON) o adjuntos (multipart)." },
        { status: 400 },
      );
    }
    if (archivos.length > MAX_ARCHIVOS) {
      return NextResponse.json(
        { error: `Demasiados archivos (máximo ${MAX_ARCHIVOS} por petición).` },
        { status: 413 },
      );
    }
    for (const a of archivos) {
      if (bytesBase64(a.dataBase64) > MAX_BYTES) {
        return NextResponse.json(
          {
            error: `El archivo "${a.nombre}" supera el límite de ${MAX_BYTES / (1024 * 1024)} MB.`,
          },
          { status: 413 },
        );
      }
    }

    // Leer todos los anexos en paralelo (cada uno es una llamada multimodal).
    const resultados = await Promise.allSettled(
      archivos.map((a) => leerAnexo(a)),
    );
    const anexos: Anexo[] = [];
    const errores: { archivo: string; error: string }[] = [];
    resultados.forEach((r, i) => {
      if (r.status === "fulfilled") anexos.push(r.value);
      else errores.push({ archivo: archivos[i].nombre, error: String(r.reason) });
    });

    if (anexos.length === 0) {
      return NextResponse.json(
        { error: "No se pudo leer ningún anexo.", errores },
        { status: 502 },
      );
    }

    // Si llega un caso, complementarlo con los anexos leídos.
    const caso = resolverCaso(body);
    if (caso) {
      const { caso: enriquecido, complementos } = await complementarCaso(
        caso,
        anexos,
      );
      return NextResponse.json({
        anexos,
        caso: enriquecido,
        complementos,
        ...(errores.length > 0 ? { errores } : {}),
      });
    }

    return NextResponse.json({
      anexos,
      ...(errores.length > 0 ? { errores } : {}),
    });
  } catch (e) {
    return NextResponse.json(
      { error: "Error al procesar los anexos.", detalle: String(e) },
      { status: 500 },
    );
  }
}
