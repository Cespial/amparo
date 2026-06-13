"use client";

// components/demandado/demandado-agente.tsx
// Agente-EPS: evalúa costo/riesgo de negar un caso y permite ceder (autorizar)
// o mantener la negación (habilitando escalar a tutela).

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  BadgeCheck,
  Bot,
  CheckCircle2,
  Gavel,
  Loader2,
  Scale,
  ShieldX,
} from "lucide-react";
import type { Caso, SentenciaRef } from "@/lib/types";
import { useT } from "@/lib/i18n";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PeticionReloj } from "@/components/demandante/peticion-reloj";
import { Expediente } from "@/components/transparencia/expediente";
import {
  costoDeNegar,
  estimarProbabilidadAmparo,
  nivelRiesgoEPS,
  URGENCIA_META,
} from "./demandado-utils";

interface AnalisisEPS {
  prob: number;
  reglaAplicable: string;
  razonamiento: string;
  sentencias: SentenciaRef[];
}

export interface DemandadoAgenteProps {
  caso: Caso | null;
  abierto: boolean;
  onCerrar: () => void;
  onAutorizar: (caso: Caso, analisis: { prob: number }) => void;
  onMantener: (caso: Caso) => void;
}

export function DemandadoAgente({
  caso,
  abierto,
  onCerrar,
  onAutorizar,
  onMantener,
}: DemandadoAgenteProps) {
  const t = useT("demandado");
  const [analizando, setAnalizando] = useState(false);
  const [analisis, setAnalisis] = useState<AnalisisEPS | null>(null);

  useEffect(() => {
    if (!caso || !abierto) return;
    let activo = true;
    const probBase = estimarProbabilidadAmparo(caso);

    (async () => {
      if (!activo) return;
      setAnalisis(null);
      setAnalizando(true);
      try {
        const res = await fetch("/api/predecir", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ casoId: caso.id }),
        });
        if (res.ok) {
          const data = await res.json();
          if (!activo) return;
          setAnalisis({
            prob:
              typeof data.probabilidadAmparo === "number"
                ? data.probabilidadAmparo
                : probBase,
            reglaAplicable: data.reglaAplicable ?? "",
            razonamiento: data.razonamiento ?? "",
            sentencias: Array.isArray(data.sentenciasCitadas)
              ? data.sentenciasCitadas
              : caso.sentenciasAplicables ?? [],
          });
        } else {
          throw new Error("predecir no disponible");
        }
      } catch {
        if (!activo) return;
        // Degradación: análisis local determinista.
        setAnalisis({
          prob: probBase,
          reglaAplicable: t("agent.localRule"),
          razonamiento: t("agent.localReasoning"),
          sentencias: caso.sentenciasAplicables ?? [],
        });
      } finally {
        if (activo) setAnalizando(false);
      }
    })();

    return () => {
      activo = false;
    };
  }, [caso, abierto, t]);

  if (!caso) return null;

  const prob = analisis?.prob ?? estimarProbabilidadAmparo(caso);
  const riesgo = nivelRiesgoEPS(prob);
  const costo = costoDeNegar(caso, prob);
  const u = URGENCIA_META[caso.urgencia];

  return (
    <Dialog
      open={abierto}
      onOpenChange={(o) => {
        if (!o) onCerrar();
      }}
    >
      <DialogContent className="max-h-[92vh] gap-0 overflow-hidden p-0 sm:max-w-lg">
        <DialogHeader className="border-b bg-card p-5">
          <DialogTitle className="flex items-center gap-2 pr-6 text-left">
            {caso.demandante.nombre}
          </DialogTitle>
          <DialogDescription className="text-left">
            {caso.demandado.nombre} · Radicado{" "}
            <span className="font-mono text-xs">{caso.radicado}</span>
          </DialogDescription>
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            <Badge variant="secondary">{caso.servicioNegado}</Badge>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${u.clase}`}
            >
              {t("agent.urgencyLabel", { nivel: t(`urgency.${caso.urgencia}`) })}
            </span>
            <Badge variant="outline">{caso.esPBS ? "PBS" : "NO-PBS"}</Badge>
            {caso.demandante.sujetoEspecialProteccion && (
              <Badge variant="outline" className="gap-1">
                <BadgeCheck className="size-3 text-info" />
                {t("agent.specialProtection")}
              </Badge>
            )}
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[48vh]">
          <div className="space-y-4 p-5">
            {/* Caso */}
            <section>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t("agent.facts")}
              </h3>
              <p className="mt-1 text-sm leading-relaxed">{caso.hechos}</p>
            </section>

            {/* Derecho de petición: a quién le corresponde y el reloj corriendo. */}
            {caso.peticion && <PeticionReloj peticion={caso.peticion} />}

            {/* Expediente compartido: la EPS ve también lo que valora el juez. */}
            <Expediente caso={caso} vista="demandado" />

            <Separator />

            {/* Agente-EPS */}
            <section>
              <div className="flex items-center gap-2">
                <span className="flex size-7 items-center justify-center rounded-lg bg-navy text-navy-foreground">
                  <Bot className="size-4" />
                </span>
                <h3 className="font-heading text-sm font-semibold">
                  {t("agent.title")}
                </h3>
              </div>

              {analizando ? (
                <div className="mt-3 flex items-center gap-2 rounded-xl border bg-muted/40 px-3 py-4 text-sm text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" />
                  {t("agent.analyzing")}
                </div>
              ) : (
                <div className="mt-3 space-y-3">
                  <div className="flex items-center gap-3 rounded-xl border bg-muted/40 p-3">
                    <Scale className={`size-5 ${riesgo.clase}`} />
                    <div className="flex-1">
                      <p className={`text-sm font-semibold ${riesgo.clase}`}>
                        {t(riesgo.etiquetaKey)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t("agent.probabilityLabel")}
                      </p>
                    </div>
                    <span
                      className={`font-mono text-2xl font-bold tabular-nums ${riesgo.clase}`}
                    >
                      {prob}%
                    </span>
                  </div>

                  <p className="rounded-lg bg-accent/60 px-3 py-2 text-sm font-medium">
                    {t(costo.resumenKey)}
                  </p>

                  {analisis?.razonamiento && (
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {analisis.razonamiento}
                    </p>
                  )}

                  <ul className="space-y-1.5">
                    {costo.riesgos.map((r) => (
                      <li
                        key={r.key}
                        className="flex items-start gap-2 text-sm text-muted-foreground"
                      >
                        <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-warning" />
                        <span>{t(r.key, r.vars)}</span>
                      </li>
                    ))}
                  </ul>

                  {analisis && analisis.sentencias.length > 0 && (
                    <div className="rounded-xl border bg-card p-3">
                      <p className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                        <Gavel className="size-3.5" />
                        {t("agent.precedent")}
                      </p>
                      <ul className="mt-2 space-y-1.5">
                        {analisis.sentencias.slice(0, 3).map((s) => (
                          <li key={s.id} className="text-xs">
                            <span className="font-mono font-semibold text-primary">
                              {s.id}
                            </span>{" "}
                            <span className="text-muted-foreground">
                              {s.subregla}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </section>
          </div>
        </ScrollArea>

        {/* Acciones */}
        <div className="flex flex-col-reverse gap-2 border-t bg-muted/50 p-4 sm:flex-row sm:justify-end">
          <Button
            variant="outline"
            disabled={analizando}
            onClick={() => onMantener(caso)}
            className="gap-2"
          >
            <ShieldX className="size-4" />
            {t("agent.keepDenial")}
          </Button>
          <Button
            disabled={analizando}
            onClick={() => onAutorizar(caso, { prob })}
            className="gap-2"
          >
            <CheckCircle2 className="size-4" />
            {t("agent.authorizeService")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
