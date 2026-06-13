// components/anexos/zona-carga.tsx — Zona de carga multimodal de anexos.
//
// Drag-and-drop (y botón "Adjuntar") que acepta imágenes (PNG/JPG/WEBP) y PDF.
// Por cada archivo muestra miniatura/ícono, estado (leyendo… / leído / error),
// y al leerlo: el TIPO detectado (badge) + los datos clave extraídos + el
// resumen + la transcripción colapsable. Convierte a base64 y llama a
// POST /api/anexos (sin caso → solo lee). Accesible (teclado + aria) y con
// límites de tamaño/cantidad avisados al usuario. Bilingüe vía useT("anexos").
//
// Eleva los Anexo leídos al padre vía onAnexosListos para que el panel de
// complemento pueda enriquecer el caso.

"use client";

import { useCallback, useId, useRef, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  FileText,
  FileUp,
  Image as ImageIcon,
  Loader2,
  Paperclip,
  Trash2,
  XCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";
import type { Anexo } from "@/lib/types";

/** Tamaño máximo por archivo (12 MB, igual que el endpoint). */
const MAX_BYTES = 12 * 1024 * 1024;
/** Máximo de archivos por petición (igual que el endpoint). */
const MAX_ARCHIVOS = 8;
/** Formatos aceptados (MIME). */
const ACEPTADOS = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "image/heic",
  "application/pdf",
];
const ACCEPT_ATTR = ".png,.jpg,.jpeg,.webp,.gif,.heic,.pdf,image/*,application/pdf";

/** Estado de un archivo en la zona de carga. */
type EstadoArchivo = "pendiente" | "leyendo" | "leido" | "error";

/** Un archivo gestionado por la zona (crudo + resultado de lectura). */
interface ArchivoUI {
  /** Id local estable de la fila. */
  id: string;
  file: File;
  /** URL de objeto para la miniatura (solo imágenes). */
  previewUrl?: string;
  estado: EstadoArchivo;
  /** Anexo leído por Claude (si estado === "leido"). */
  anexo?: Anexo;
  /** Mensaje de error (si estado === "error"). */
  error?: string;
}

export interface ZonaCargaProps {
  /**
   * Se invoca cada vez que cambia el conjunto de anexos LEÍDOS con éxito.
   * El padre lo usa para habilitar el complemento del caso.
   */
  onAnexosListos?: (anexos: Anexo[]) => void;
  /** Clase extra del contenedor. */
  className?: string;
}

/** Convierte un File a base64 puro (sin el prefijo data: URL). */
function fileABase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result ?? "");
      const i = result.indexOf("base64,");
      resolve(i >= 0 ? result.slice(i + "base64,".length) : result);
    };
    reader.onerror = () => reject(reader.error ?? new Error("read error"));
    reader.readAsDataURL(file);
  });
}

/** Id local único para una fila. */
function filaId(): string {
  return `f-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

/** ¿El archivo es una imagen soportada? */
function esImagenFile(file: File): boolean {
  return file.type.startsWith("image/");
}

/** ¿El archivo tiene un tipo/extensión aceptado? */
function esAceptado(file: File): boolean {
  if (file.type && ACEPTADOS.includes(file.type)) return true;
  const ext = file.name.toLowerCase().split(".").pop() ?? "";
  return ["png", "jpg", "jpeg", "webp", "gif", "heic", "pdf"].includes(ext);
}

export function ZonaCarga({ onAnexosListos, className }: ZonaCargaProps) {
  const t = useT("anexos");
  const inputRef = useRef<HTMLInputElement>(null);
  const dropId = useId();
  const [archivos, setArchivos] = useState<ArchivoUI[]>([]);
  const [arrastrando, setArrastrando] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);
  const [leyendo, setLeyendo] = useState(false);

  /** Notifica al padre el conjunto vigente de anexos leídos. */
  const emitirListos = useCallback(
    (lista: ArchivoUI[]) => {
      const leidos = lista
        .filter((a) => a.estado === "leido" && a.anexo)
        .map((a) => a.anexo!) as Anexo[];
      onAnexosListos?.(leidos);
    },
    [onAnexosListos],
  );

  /** Lee un conjunto de filas: a base64 + POST /api/anexos en una sola llamada. */
  const leerArchivos = useCallback(
    async (filas: ArchivoUI[]) => {
      if (filas.length === 0) return;
      setLeyendo(true);
      // Marcar todas como "leyendo".
      setArchivos((prev) =>
        prev.map((a) =>
          filas.some((f) => f.id === a.id) ? { ...a, estado: "leyendo" } : a,
        ),
      );

      try {
        const payload = await Promise.all(
          filas.map(async (f) => ({
            id: f.id,
            nombre: f.file.name,
            mimeType: f.file.type || "",
            dataBase64: await fileABase64(f.file),
          })),
        );

        const res = await fetch("/api/anexos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            archivos: payload.map(({ nombre, mimeType, dataBase64 }) => ({
              nombre,
              mimeType,
              dataBase64,
            })),
          }),
        });

        if (!res.ok) {
          const data = (await res.json().catch(() => ({}))) as {
            error?: string;
          };
          throw new Error(data.error || `HTTP ${res.status}`);
        }

        const data = (await res.json()) as {
          anexos: Anexo[];
          errores?: { archivo: string; error: string }[];
        };

        // Emparejar por nombre (el endpoint preserva el orden, pero los
        // errores rompen la correspondencia 1:1; emparejamos por nombre).
        const porNombre = new Map<string, Anexo[]>();
        for (const a of data.anexos ?? []) {
          const arr = porNombre.get(a.nombre) ?? [];
          arr.push(a);
          porNombre.set(a.nombre, arr);
        }

        setArchivos((prev) => {
          const next = prev.map((a) => {
            if (!filas.some((f) => f.id === a.id)) return a;
            const cola = porNombre.get(a.file.name);
            const anexo = cola?.shift();
            if (anexo) {
              return { ...a, estado: "leido" as const, anexo };
            }
            return {
              ...a,
              estado: "error" as const,
              error: t("error.generic"),
            };
          });
          emitirListos(next);
          return next;
        });

        if (data.errores && data.errores.length > 0) {
          setAviso(t("error.partial"));
        }
      } catch {
        setArchivos((prev) => {
          const next = prev.map((a) =>
            filas.some((f) => f.id === a.id)
              ? { ...a, estado: "error" as const, error: t("error.generic") }
              : a,
          );
          emitirListos(next);
          return next;
        });
        setAviso(t("error.generic"));
      } finally {
        setLeyendo(false);
      }
    },
    [emitirListos, t],
  );

  /** Agrega archivos validados a la lista y dispara la lectura. */
  const agregarArchivos = useCallback(
    (lista: FileList | File[]) => {
      setAviso(null);
      const entrantes = Array.from(lista);
      if (entrantes.length === 0) {
        setAviso(t("error.empty"));
        return;
      }

      const nuevos: ArchivoUI[] = [];
      for (const file of entrantes) {
        if (!esAceptado(file)) {
          setAviso(t("error.unsupported"));
          continue;
        }
        if (file.size > MAX_BYTES) {
          setAviso(t("error.tooLarge", { nombre: file.name }));
          continue;
        }
        nuevos.push({
          id: filaId(),
          file,
          previewUrl: esImagenFile(file)
            ? URL.createObjectURL(file)
            : undefined,
          estado: "pendiente",
        });
      }
      if (nuevos.length === 0) return;

      setArchivos((prev) => {
        const combinados = [...prev, ...nuevos];
        if (combinados.length > MAX_ARCHIVOS) {
          setAviso(t("error.tooMany"));
          // Conservar solo hasta el límite; revocar previews descartadas.
          const descartados = combinados.slice(MAX_ARCHIVOS);
          for (const d of descartados) {
            if (d.previewUrl) URL.revokeObjectURL(d.previewUrl);
          }
          const recortados = combinados.slice(0, MAX_ARCHIVOS);
          // Leer solo los nuevos que sobrevivieron al recorte.
          const aLeer = recortados.filter((c) =>
            nuevos.some((n) => n.id === c.id),
          );
          void leerArchivos(aLeer);
          return recortados;
        }
        void leerArchivos(nuevos);
        return combinados;
      });
    },
    [leerArchivos, t],
  );

  /** Quita una fila (revoca su preview). */
  const quitar = useCallback(
    (id: string) => {
      setArchivos((prev) => {
        const fila = prev.find((a) => a.id === id);
        if (fila?.previewUrl) URL.revokeObjectURL(fila.previewUrl);
        const next = prev.filter((a) => a.id !== id);
        emitirListos(next);
        return next;
      });
    },
    [emitirListos],
  );

  // — Drag & drop —

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setArrastrando(false);
      if (e.dataTransfer?.files?.length) {
        agregarArchivos(e.dataTransfer.files);
      }
    },
    [agregarArchivos],
  );

  const abrirSelector = useCallback(() => inputRef.current?.click(), []);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Zona drag & drop — también activable por teclado (Enter/Espacio). */}
      <div
        role="button"
        tabIndex={0}
        aria-describedby={dropId}
        aria-disabled={leyendo}
        onClick={abrirSelector}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            abrirSelector();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setArrastrando(true);
        }}
        onDragLeave={() => setArrastrando(false)}
        onDrop={onDrop}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed bg-card/60 px-6 py-8 text-center transition-colors",
          "hover:border-primary/40 hover:bg-primary/5",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2",
          arrastrando
            ? "border-primary bg-primary/10"
            : "border-border",
        )}
      >
        <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <FileUp className="size-6" aria-hidden />
        </span>
        <p className="font-medium text-navy">{t("dropzone.hint")}</p>
        <p id={dropId} className="text-xs text-muted-foreground">
          {t("dropzone.formats")}
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-1 gap-1.5"
          onClick={(e) => {
            e.stopPropagation();
            abrirSelector();
          }}
        >
          <Paperclip className="size-4" aria-hidden />
          {archivos.length > 0 ? t("cta.add") : t("cta.upload")}
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT_ATTR}
          multiple
          className="sr-only"
          aria-label={t("cta.upload")}
          onChange={(e) => {
            if (e.target.files?.length) agregarArchivos(e.target.files);
            // Permitir re-seleccionar el mismo archivo.
            e.target.value = "";
          }}
        />
      </div>

      {/* Aviso de validación (tamaño/cantidad/formato). */}
      {aviso && (
        <p
          role="alert"
          className="flex items-center gap-2 rounded-xl border border-warning/30 bg-warning/5 px-3 py-2 text-sm text-warning"
        >
          <AlertTriangle className="size-4 shrink-0" aria-hidden />
          {aviso}
        </p>
      )}

      {/* Lista de archivos / resultados. */}
      {archivos.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("state.empty")}</p>
      ) : (
        <ul className="space-y-3">
          {archivos.map((a) => (
            <FilaArchivo
              key={a.id}
              archivo={a}
              onQuitar={() => quitar(a.id)}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

// — Fila de un archivo —

function FilaArchivo({
  archivo,
  onQuitar,
}: {
  archivo: ArchivoUI;
  onQuitar: () => void;
}) {
  const t = useT("anexos");
  const [verTexto, setVerTexto] = useState(false);
  const textoId = useId();
  const { file, estado, anexo, error, previewUrl } = archivo;
  const esImagen = esImagenFile(file);

  const tipoLabel = anexo
    ? t(`tipo.${anexo.tipoDetectado}`)
    : undefined;
  // Si el modelo devolvió un tipo no mapeado, useT cae en la propia key:
  // mostramos "otro" como respaldo legible.
  const tipoTexto =
    tipoLabel && !tipoLabel.startsWith("tipo.") ? tipoLabel : t("tipo.otro");

  const datos = anexo ? Object.entries(anexo.datosExtraidos) : [];

  return (
    <li className="overflow-hidden rounded-2xl border bg-card">
      <div className="flex items-start gap-3 p-3">
        {/* Miniatura / ícono */}
        <span className="relative flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border bg-secondary/40">
          {esImagen && previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewUrl}
              alt=""
              className="size-full object-cover"
            />
          ) : esImagen ? (
            <ImageIcon className="size-6 text-muted-foreground" aria-hidden />
          ) : (
            <FileText className="size-6 text-primary" aria-hidden />
          )}
          {estado === "leyendo" && (
            <span className="absolute inset-0 flex items-center justify-center bg-card/70">
              <Loader2 className="size-5 animate-spin text-primary" aria-hidden />
            </span>
          )}
        </span>

        {/* Cabecera de la fila */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="truncate font-medium text-navy" title={file.name}>
              {file.name}
            </p>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={onQuitar}
              aria-label={`${t("cta.remove")} ${file.name}`}
              className="shrink-0 text-muted-foreground hover:text-danger"
            >
              <Trash2 className="size-4" aria-hidden />
            </Button>
          </div>

          {/* Estado + tipo detectado */}
          <div className="mt-1 flex flex-wrap items-center gap-2">
            {estado === "leyendo" && (
              <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Loader2 className="size-3.5 animate-spin" aria-hidden />
                {t("state.readingOne", { nombre: file.name })}
              </span>
            )}
            {estado === "pendiente" && (
              <span className="text-sm text-muted-foreground">
                {t("state.reading")}
              </span>
            )}
            {estado === "leido" && (
              <>
                <Badge variant="secondary" className="gap-1">
                  <CheckCircle2 className="size-3 text-success" aria-hidden />
                  {tipoTexto}
                </Badge>
                <span className="flex items-center gap-1 text-xs text-success">
                  {t("state.done")}
                </span>
              </>
            )}
            {estado === "error" && (
              <span className="flex items-center gap-1.5 text-sm text-danger">
                <XCircle className="size-4" aria-hidden />
                {error || t("error.generic")}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Resultado de la lectura */}
      {estado === "leido" && anexo && (
        <div className="space-y-3 border-t bg-background/40 p-3">
          {/* Resumen */}
          {anexo.resumen && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t("result.summary")}
              </p>
              <p className="mt-0.5 text-sm leading-relaxed text-foreground/90">
                {anexo.resumen}
              </p>
            </div>
          )}

          {/* Datos extraídos */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {t("result.data")}
            </p>
            {datos.length === 0 ? (
              <p className="mt-0.5 text-sm text-muted-foreground">
                {t("result.noData")}
              </p>
            ) : (
              <dl className="mt-1 grid gap-x-4 gap-y-1.5 sm:grid-cols-2">
                {datos.map(([clave, valor]) => {
                  const dudoso = /\s*\[dudoso\]\s*$/i.test(valor ?? "");
                  const limpio = (valor ?? "").replace(
                    /\s*\[dudoso\]\s*$/i,
                    "",
                  );
                  return (
                    <div key={clave} className="min-w-0">
                      <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
                        {clave}
                      </dt>
                      <dd className="flex items-center gap-1.5 text-sm font-medium text-navy">
                        <span className="min-w-0 break-words">{limpio}</span>
                        {dudoso && (
                          <Badge
                            variant="outline"
                            className="shrink-0 border-warning/40 text-warning"
                          >
                            {t("result.doubtful")}
                          </Badge>
                        )}
                      </dd>
                    </div>
                  );
                })}
              </dl>
            )}
          </div>

          {/* Transcripción colapsable */}
          {anexo.textoExtraido && (
            <div>
              <button
                type="button"
                onClick={() => setVerTexto((v) => !v)}
                aria-expanded={verTexto}
                aria-controls={textoId}
                className="flex items-center gap-1.5 text-xs font-medium text-primary transition-colors hover:text-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-1"
              >
                <ChevronDown
                  className={cn(
                    "size-4 transition-transform",
                    verTexto && "rotate-180",
                  )}
                  aria-hidden
                />
                {t("result.text.toggle")}
              </button>
              {verTexto && (
                <pre
                  id={textoId}
                  className="mt-2 max-h-56 overflow-y-auto whitespace-pre-wrap rounded-xl border bg-background/60 p-3 font-sans text-xs leading-relaxed text-foreground/80"
                >
                  {anexo.textoExtraido}
                </pre>
              )}
            </div>
          )}
        </div>
      )}
    </li>
  );
}

export default ZonaCarga;
