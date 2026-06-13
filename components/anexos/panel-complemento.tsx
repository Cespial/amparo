// components/anexos/panel-complemento.tsx — Complemento del caso con los anexos.
//
// Tras leer los anexos, ofrece "Complementar mi caso con estos documentos".
// Llama a POST /api/anexos con el caso provisional + los anexos ya leídos, y
// muestra CLARAMENTE qué se detectó/rellenó/corregió (con antes/después) ANTES
// de aplicarlo. El usuario confirma; solo entonces se aplica al caso (callback
// onAplicar). Nunca se sobreescribe en silencio. Bilingüe vía useT("anexos").

"use client";

import { useCallback, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Loader2,
  PlusCircle,
  Sparkles,
  Wand2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useT, type TFunction } from "@/lib/i18n";
import type { Anexo, Caso } from "@/lib/types";

/** Espejo de CambioComplemento de lib/ai/anexos (evita import de tipos server). */
export interface CambioComplemento {
  campo: string;
  antes?: string;
  despues: string;
  accion: "rellenado" | "corregido" | "anexo_agregado";
  origen: string;
}

export interface PanelComplementoProps {
  /** Anexos ya leídos por la zona de carga. */
  anexos: Anexo[];
  /**
   * Construye el caso provisional (desde el estado actual del wizard) que se
   * enviará a complementar. Se llama justo antes de la petición.
   */
  construirCaso: () => Caso | null;
  /**
   * Se invoca cuando el usuario CONFIRMA aplicar el complemento.
   * Recibe el caso enriquecido + la lista de cambios aplicados.
   */
  onAplicar: (caso: Caso, complementos: CambioComplemento[]) => void;
  className?: string;
}

/** Etiqueta legible de un campo del caso (con respaldo al propio nombre). */
function etiquetaCampo(t: TFunction, campo: string): string {
  const k = `campo.${campo}`;
  const label = t(k);
  return label === k ? campo : label;
}

/** Frase descriptiva de un cambio, según su acción, lista para mostrar. */
function describirCambio(t: TFunction, c: CambioComplemento): string {
  const campo = etiquetaCampo(t, c.campo);
  if (c.accion === "anexo_agregado") {
    return t("complement.added", { valor: c.despues });
  }
  if (c.accion === "corregido") {
    return t("complement.corrected", {
      campo,
      antes: c.antes ?? "",
      despues: c.despues,
    });
  }
  return t("complement.filled", { campo, valor: c.despues });
}

export function PanelComplemento({
  anexos,
  construirCaso,
  onAplicar,
  className,
}: PanelComplementoProps) {
  const t = useT("anexos");
  const [cargando, setCargando] = useState(false);
  const [propuesta, setPropuesta] = useState<{
    caso: Caso;
    complementos: CambioComplemento[];
  } | null>(null);
  const [aplicado, setAplicado] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Previsualiza el complemento. Los anexos YA fueron leídos por Claude en la
   * zona de carga (POST /api/anexos), así que aquí NO se vuelven a subir ni a
   * releer: consolidamos en el cliente sus datosExtraidos contra el caso,
   * replicando la lógica de aplicar() del servidor. El usuario revisa y confirma.
   */
  const previsualizar = useCallback(() => {
    const caso = construirCaso();
    if (!caso || anexos.length === 0) return;
    setCargando(true);
    setError(null);
    setAplicado(false);
    try {
      setPropuesta(complementarEnCliente(caso, anexos));
    } catch {
      setError(t("error.generic"));
    } finally {
      setCargando(false);
    }
  }, [anexos, construirCaso, t]);

  /** Confirma y aplica el complemento previsualizado. */
  const confirmar = useCallback(() => {
    if (!propuesta) return;
    onAplicar(propuesta.caso, propuesta.complementos);
    setAplicado(true);
  }, [onAplicar, propuesta]);

  if (anexos.length === 0) return null;

  // Cambios significativos (no contamos los "anexo_agregado" como "complemento").
  const sustantivos =
    propuesta?.complementos.filter((c) => c.accion !== "anexo_agregado") ?? [];
  const agregados =
    propuesta?.complementos.filter((c) => c.accion === "anexo_agregado") ?? [];

  return (
    <div
      className={cn(
        "rounded-2xl border border-primary/20 bg-primary/5 p-4",
        className,
      )}
    >
      {/* Estado inicial: invitar a complementar */}
      {!propuesta && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-2 text-sm text-foreground/90">
            <Sparkles className="size-4 shrink-0 text-primary" aria-hidden />
            {t("subtitle")}
          </p>
          <Button
            type="button"
            onClick={previsualizar}
            disabled={cargando}
            className="shrink-0 gap-2"
          >
            {cargando ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden />
                {t("state.complementing")}
              </>
            ) : (
              <>
                <Wand2 className="size-4" aria-hidden />
                {t("complement.cta")}
              </>
            )}
          </Button>
        </div>
      )}

      {error && (
        <p role="alert" className="mt-2 text-sm text-danger">
          {error}
        </p>
      )}

      {/* Previsualización de cambios (antes de aplicar) */}
      {propuesta && (
        <div className="space-y-3">
          <p className="flex items-center gap-2 font-serif text-base font-semibold text-navy">
            <Wand2 className="size-4 text-primary" aria-hidden />
            {t("complement.title")}
          </p>

          {sustantivos.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {t("complement.none")}
            </p>
          ) : (
            <ul className="space-y-2">
              {sustantivos.map((c, i) => (
                <li
                  key={`${c.campo}-${i}`}
                  className="flex items-start gap-2 rounded-xl border bg-card p-2.5 text-sm"
                >
                  <span
                    className={cn(
                      "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full",
                      c.accion === "corregido"
                        ? "bg-warning/10 text-warning"
                        : "bg-success/10 text-success",
                    )}
                  >
                    {c.accion === "corregido" ? (
                      <ArrowRight className="size-3.5" aria-hidden />
                    ) : (
                      <PlusCircle className="size-3.5" aria-hidden />
                    )}
                  </span>
                  <span className="min-w-0 text-foreground/90">
                    {describirCambio(t, c)}
                  </span>
                </li>
              ))}
            </ul>
          )}

          {/* Documentos anexados como prueba */}
          {agregados.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">
                {etiquetaCampo(t, "anexos")}:
              </span>
              {agregados.map((c, i) => (
                <Badge key={i} variant="secondary" className="gap-1">
                  <CheckCircle2 className="size-3 text-success" aria-hidden />
                  {c.despues}
                </Badge>
              ))}
            </div>
          )}

          {!aplicado ? (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-muted-foreground">
                {t("complement.review")}
              </p>
              <Button
                type="button"
                onClick={confirmar}
                className="shrink-0 gap-2"
              >
                <CheckCircle2 className="size-4" aria-hidden />
                {t("complement.apply")}
              </Button>
            </div>
          ) : (
            <p className="flex items-center gap-2 rounded-xl border border-success/30 bg-success/5 px-3 py-2 text-sm font-medium text-success">
              <CheckCircle2 className="size-4 shrink-0" aria-hidden />
              {t("complement.applied")}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// — Complemento en cliente (fallback / sin releer archivos) —
//
// Replica la lógica de aplicar() de lib/ai/anexos pero usando los anexos YA
// leídos (datosExtraidos). Esto permite previsualizar/aplicar el complemento
// sin volver a subir los archivos al endpoint (que los relee). El campo se
// resuelve por claves canónicas de datosExtraidos. Nunca sobreescribe sin
// registrar el cambio.

/** Limpia el sufijo [dudoso] de un valor extraído. */
function limpiarDudoso(v: string | undefined): string {
  return (v ?? "").replace(/\s*\[dudoso\]\s*$/i, "").trim();
}

/**
 * Normaliza un valor para comparar equivalencia "de fondo" (espejo del servidor):
 * minúsculas, sin acentos, sin puntuación/prefijos de forma. "C.C. 43.215.678"
 * ≈ "43215678".
 */
function normalizarComparacion(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

/**
 * ¿El nuevo valor es solo un refinamiento trivial del actual (o viceversa)?
 * Iguales tras normalizar, o uno contiene al otro (subcadena ≥3). Evita churn
 * cosmético y evita degradar un valor del usuario más completo. Espejo de
 * esRefinamientoTrivial() del servidor (lib/ai/anexos.ts).
 */
function esRefinamientoTrivial(actual: string, nuevo: string): boolean {
  const a = normalizarComparacion(actual);
  const b = normalizarComparacion(nuevo);
  if (!a || !b) return false;
  if (a === b) return true;
  const corta = a.length <= b.length ? a : b;
  const larga = a.length <= b.length ? b : a;
  return corta.length >= 3 && larga.includes(corta);
}

/** Busca la primera clave presente entre varias alternativas. */
function primerDato(
  anexos: Anexo[],
  claves: string[],
): string | undefined {
  for (const a of anexos) {
    for (const k of claves) {
      const v = limpiarDudoso(a.datosExtraidos[k]);
      if (v) return v;
    }
  }
  return undefined;
}

/** Registra un cambio si el valor nuevo rellena/corrige el actual. */
function aplicarCampo(
  cambios: CambioComplemento[],
  campo: string,
  actual: string | undefined,
  nuevo: string | undefined,
  origen: string,
): string | undefined {
  const limpio = limpiarDudoso(nuevo);
  if (!limpio) return actual;
  const actualLimpio = (actual ?? "").trim();
  if (!actualLimpio) {
    cambios.push({ campo, despues: limpio, accion: "rellenado", origen });
    return limpio;
  }
  // Mismo valor de fondo o refinamiento trivial: conservar el del caso.
  if (esRefinamientoTrivial(actualLimpio, limpio)) {
    return actual;
  }
  cambios.push({
    campo,
    antes: actualLimpio,
    despues: limpio,
    accion: "corregido",
    origen,
  });
  return limpio;
}

/**
 * Complementa el caso en el cliente con los anexos ya leídos.
 * Equivalente cliente de complementarCaso (sin la consolidación LLM): mapea las
 * claves canónicas de datosExtraidos a los campos del caso.
 */
export function complementarEnCliente(
  caso: Caso,
  anexos: Anexo[],
): { caso: Caso; complementos: CambioComplemento[] } {
  const cambios: CambioComplemento[] = [];
  const enriquecido: Caso = { ...caso };
  const origen = anexos.map((a) => a.nombre).join(", ");

  // Anexar como prueba.
  enriquecido.anexos = [...(caso.anexos ?? []), ...anexos];
  for (const a of anexos) {
    cambios.push({
      campo: "anexos",
      despues: `${a.nombre} (${a.tipoDetectado})`,
      accion: "anexo_agregado",
      origen: a.nombre,
    });
  }

  // Mapear claves canónicas → campos del caso.
  enriquecido.servicioNegado =
    aplicarCampo(
      cambios,
      "servicioNegado",
      caso.servicioNegado,
      primerDato(anexos, ["servicioNegado", "servicio", "servicioSolicitado"]),
      origen,
    ) ?? caso.servicioNegado;

  enriquecido.diagnostico =
    aplicarCampo(
      cambios,
      "diagnostico",
      caso.diagnostico,
      primerDato(anexos, ["diagnostico", "diagnóstico"]),
      origen,
    ) ?? caso.diagnostico;

  const epsNuevo = aplicarCampo(
    cambios,
    "demandado.nombre",
    caso.demandado?.nombre,
    primerDato(anexos, ["eps", "entidad", "aseguradora"]),
    origen,
  );
  if (epsNuevo && epsNuevo !== caso.demandado?.nombre) {
    enriquecido.demandado = { ...caso.demandado, nombre: epsNuevo };
  }

  const pacienteNuevo = aplicarCampo(
    cambios,
    "demandante.nombre",
    caso.demandante?.nombre,
    primerDato(anexos, ["paciente", "nombrePaciente", "afiliado"]),
    origen,
  );
  const docNuevo = aplicarCampo(
    cambios,
    "demandante.documento",
    caso.demandante?.documento,
    primerDato(anexos, [
      "documentoPaciente",
      "documento",
      "cedula",
      "identificacion",
    ]),
    origen,
  );
  if (
    (pacienteNuevo && pacienteNuevo !== caso.demandante?.nombre) ||
    (docNuevo && docNuevo !== caso.demandante?.documento)
  ) {
    enriquecido.demandante = {
      ...caso.demandante,
      ...(pacienteNuevo ? { nombre: pacienteNuevo } : {}),
      ...(docNuevo ? { documento: docNuevo } : {}),
    };
  }

  return { caso: enriquecido, complementos: cambios };
}

export default PanelComplemento;
