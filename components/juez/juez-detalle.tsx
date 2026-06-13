// components/juez/juez-detalle.tsx — Panel de estudio de una tutela (Sheet).
// Resumen del caso, triaje de admisibilidad, predicción citada, fallo sugerido
// y firma del fallo (estado -> FALLADO + timeline + progreso).

"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  BookOpen,
  CheckCircle2,
  CircleAlert,
  FileSignature,
  Gavel,
  Loader2,
  PenLine,
  Scale,
  Scale3d,
  Sparkles,
  Stethoscope,
  User,
  XCircle,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Caso, EventoCaso, SentenciaRef } from "@/lib/types";
import { useCasoStore } from "@/lib/store";
import { useT, type TFunction } from "@/lib/i18n";
import { progresoDeEstado } from "@/lib/progreso";
import type { TriajeResultado, EstadoCriterio } from "@/lib/ai/triaje";
import type { PrediccionResultado } from "@/lib/ai/predictor";
import { Expediente } from "@/components/transparencia/expediente";
import { EstadoBadge, UrgenciaBadge } from "./juez-badges";
import { Cronograma } from "./juez-cronograma";
import { Markdown } from "./juez-markdown";
import { plazoFallo, diasRestantes, probabilidadPct } from "./juez-utils";

interface Props {
  caso: Caso | null;
  abierto: boolean;
  onCerrar: () => void;
}

/** Mapa criterio de triaje → clave i18n (detail.crit*) del namespace "juez". */
const CRITERIO_I18N: Record<string, string> = {
  derechoFundamental: "detail.critFundamental",
  legitimacion: "detail.critLegitimacion",
  subsidiariedad: "detail.critSubsidiariedad",
  inmediatez: "detail.critInmediatez",
  noTemeridad: "detail.critNoTemeridad",
  hechoSuperado: "detail.critHechoSuperado",
};

export function JuezDetalle({ caso, abierto, onCerrar }: Props) {
  const t = useT("juez");
  const updateCaso = useCasoStore((s) => s.updateCaso);
  const addEvento = useCasoStore((s) => s.addEvento);

  const [triaje, setTriaje] = useState<TriajeResultado | null>(null);
  const [prediccion, setPrediccion] = useState<PrediccionResultado | null>(null);
  const [fallo, setFallo] = useState<string | null>(null);
  const [cargandoEstudio, setCargandoEstudio] = useState(false);
  const [cargandoFallo, setCargandoFallo] = useState(false);
  const [confirmarOpen, setConfirmarOpen] = useState(false);
  const [casoIdCargado, setCasoIdCargado] = useState<string | null>(null);

  // Estudio automático (triaje + predicción) al abrir un caso nuevo.
  if (abierto && caso && casoIdCargado !== caso.id) {
    setCasoIdCargado(caso.id);
    setTriaje(null);
    setPrediccion(null);
    setFallo(null);
    void estudiar(caso.id);
  }

  async function estudiar(casoId: string) {
    setCargandoEstudio(true);
    try {
      const [tRes, pRes] = await Promise.all([
        fetch("/api/triaje", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ casoId }),
        }),
        fetch("/api/predecir", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ casoId }),
        }),
      ]);
      if (tRes.ok) setTriaje(await tRes.json());
      if (pRes.ok) setPrediccion(await pRes.json());
      if (!tRes.ok && !pRes.ok) {
        toast.warning(t("detail.studyUnavailable"));
      }
    } catch {
      toast.error(t("detail.studyContactError"));
    } finally {
      setCargandoEstudio(false);
    }
  }

  async function generarFallo() {
    if (!caso) return;
    setCargandoFallo(true);
    try {
      const res = await fetch("/api/generar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ casoId: caso.id, tipo: "fallo" }),
      });
      if (res.ok) {
        const data = await res.json();
        setFallo(data.documento as string);
        toast.success(t("detail.rulingGeneratedToast"));
      } else {
        toast.warning(t("detail.rulingUnavailable"));
      }
    } catch {
      toast.error(t("detail.rulingGenError"));
    } finally {
      setCargandoFallo(false);
    }
  }

  function firmarFallo() {
    if (!caso) return;
    const ahora = new Date().toISOString();
    updateCaso(caso.id, {
      estado: "FALLADO",
      progreso: progresoDeEstado("FALLADO"),
    });
    const evento: EventoCaso = {
      id: `fallo-${caso.id}-${Date.now()}`,
      fecha: ahora,
      tipo: "fallo",
      estado: "FALLADO",
      actor: "juez",
      titulo: t("detail.signEventTitle"),
      detalle:
        prediccion && prediccion.probabilidadAmparo >= 50
          ? t("detail.signEventGranted")
          : t("detail.signEventGeneric"),
    };
    addEvento(caso.id, evento);
    setConfirmarOpen(false);
    toast.success(t("detail.signedToast"), {
      description: `${caso.demandante.nombre} · ${t("estado.FALLADO")}`,
    });
    onCerrar();
  }

  if (!caso) return null;

  const yaFallado = caso.estado === "FALLADO";
  const plazo = plazoFallo(caso);
  const diasFallo = plazo ? diasRestantes(plazo.fechaLimite) : null;
  const prob = prediccion?.probabilidadAmparo ?? probabilidadPct(caso);

  return (
    <Sheet open={abierto} onOpenChange={(o) => !o && onCerrar()}>
      <SheetContent
        side="right"
        className="w-full gap-0 p-0 sm:max-w-2xl"
      >
        <SheetHeader className="border-b bg-navy px-5 py-4 text-navy-foreground">
          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-lg bg-white/10">
              <Scale className="size-4" />
            </span>
            <div className="min-w-0">
              <SheetTitle className="truncate font-heading text-base text-navy-foreground">
                {caso.demandante.nombre}
              </SheetTitle>
              <SheetDescription className="font-mono text-[11px] text-navy-foreground/70">
                {caso.radicado}
              </SheetDescription>
            </div>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <EstadoBadge estado={caso.estado} />
            <UrgenciaBadge urgencia={caso.urgencia} />
            {caso.demandante.sujetoEspecialProteccion && (
              <Badge className="border-0 bg-white/10 font-medium text-navy-foreground">
                {t("detail.specialProtection")}
              </Badge>
            )}
          </div>
        </SheetHeader>

        <ScrollArea className="h-[calc(100dvh-9.5rem)]">
          <div className="space-y-4 p-5">
            {/* Resumen del caso */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Stethoscope className="size-4 text-primary" />
                  {t("detail.summaryTitle")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <Dato
                  icon={<User className="size-3.5" />}
                  label={t("detail.claimant")}
                >
                  {t("detail.claimantValue", {
                    nombre: caso.demandante.nombre,
                    edad: caso.demandante.edad,
                    ciudad: caso.demandante.ciudad,
                    departamento: caso.demandante.departamento,
                    regimen: caso.demandante.regimen,
                  })}
                </Dato>
                <Dato
                  icon={<Scale3d className="size-3.5" />}
                  label={t("detail.respondent")}
                >
                  {t("detail.respondentValue", {
                    nombre: caso.demandado.nombre,
                    tipo: caso.demandado.tipo,
                  })}
                </Dato>
                <Dato
                  icon={<Stethoscope className="size-3.5" />}
                  label={t("detail.deniedService")}
                >
                  {t("detail.deniedServiceValue", {
                    servicio: caso.servicioNegado,
                    diagnostico: caso.diagnostico,
                    pbs: caso.esPBS ? t("detail.inPbs") : t("detail.notPbs"),
                  })}
                </Dato>
                <Separator />
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    {t("detail.facts")}
                  </p>
                  <p className="mt-0.5 leading-relaxed">{caso.hechos}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    {t("detail.claim")}
                  </p>
                  <p className="mt-0.5 leading-relaxed">{caso.pretension}</p>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {caso.derechosInvocados.map((d) => (
                    <Badge key={d} variant="secondary" className="font-normal">
                      {d}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Expediente compartido (transparencia bilateral). */}
            <Expediente caso={caso} vista="juez" />

            {/* Triaje de admisibilidad */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Scale className="size-4 text-info" />
                  {t("detail.triageTitle")}
                  <Badge variant="ghost" className="ml-auto gap-1 text-muted-foreground">
                    <Sparkles className="size-3" /> {t("detail.aiBadge")}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {cargandoEstudio && !triaje ? (
                  <EstudioSkeleton />
                ) : triaje ? (
                  <>
                    <div className="flex items-center gap-2">
                      <VeredictoBadge veredicto={triaje.veredicto} t={t} />
                      <span className="text-xs text-muted-foreground">
                        {t("detail.confidence", {
                          pct: Math.round(triaje.confianza * 100),
                          ruta:
                            triaje.rutaRecomendada === "tutela"
                              ? t("detail.routeTutela")
                              : t("detail.routeEps"),
                        })}
                      </span>
                    </div>
                    <div className="grid gap-1.5 sm:grid-cols-2">
                      {(
                        Object.entries(triaje.criterios) as [
                          string,
                          { estado: EstadoCriterio; explicacion: string },
                        ][]
                      ).map(([clave, c]) => (
                        <div
                          key={clave}
                          className="flex items-start gap-2 rounded-lg bg-muted/40 px-2.5 py-2"
                        >
                          <CriterioIcono estado={c.estado} />
                          <div className="min-w-0">
                            <p className="text-xs font-medium">
                              {CRITERIO_I18N[clave] ? t(CRITERIO_I18N[clave]) : clave}
                            </p>
                            <p className="text-[11px] leading-snug text-muted-foreground">
                              {c.explicacion}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    {triaje.banderas.length > 0 && (
                      <div className="rounded-lg border border-warning/30 bg-warning/5 px-3 py-2">
                        <p className="flex items-center gap-1.5 text-xs font-medium text-warning">
                          <CircleAlert className="size-3.5" /> {t("detail.warnings")}
                        </p>
                        <ul className="mt-1 ml-4 list-disc text-[11px] text-muted-foreground">
                          {triaje.banderas.map((b, i) => (
                            <li key={i}>{b}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    {t("detail.triageUnavailable")}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Predicción citada */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Gavel className="size-4 text-primary" />
                  {t("detail.predictionTitle")}
                  <Badge variant="ghost" className="ml-auto gap-1 text-muted-foreground">
                    <Sparkles className="size-3" /> {t("detail.aiBadge")}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {cargandoEstudio && !prediccion ? (
                  <EstudioSkeleton />
                ) : (
                  <>
                    <div className="flex items-center gap-3">
                      <div className="font-heading text-3xl font-bold tabular-nums text-primary">
                        {prob}%
                      </div>
                      <div className="flex-1">
                        <Progress value={prob} />
                        <p className="mt-1 text-xs text-muted-foreground">
                          {t("detail.predictionCaption")}
                        </p>
                      </div>
                    </div>
                    {prediccion && (
                      <>
                        <div className="rounded-lg bg-muted/40 px-3 py-2">
                          <p className="text-xs font-medium text-muted-foreground">
                            {t("detail.applicableRule")}
                          </p>
                          <p className="mt-0.5 text-[13px] leading-snug">
                            {prediccion.reglaAplicable}
                          </p>
                        </div>
                        <p className="text-[13px] leading-relaxed text-muted-foreground">
                          {prediccion.razonamiento}
                        </p>
                      </>
                    )}
                    <PrecedenteLista
                      t={t}
                      sentencias={
                        prediccion?.sentenciasCitadas ??
                        caso.sentenciasAplicables ??
                        []
                      }
                    />
                  </>
                )}
              </CardContent>
            </Card>

            {/* Fallo sugerido */}
            <Card className="border-primary/20">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <FileSignature className="size-4 text-primary" />
                  {t("detail.rulingTitle")}
                  <Badge variant="ghost" className="ml-auto gap-1 text-muted-foreground">
                    <Sparkles className="size-3" /> {t("detail.aiBadge")}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {fallo ? (
                  <div className="rounded-lg border bg-card px-4 py-3">
                    <Markdown>{fallo}</Markdown>
                  </div>
                ) : cargandoFallo ? (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-3/4" />
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed bg-muted/30 px-4 py-6 text-center">
                    <p className="text-sm text-muted-foreground">
                      {t("detail.rulingEmpty")}
                    </p>
                  </div>
                )}
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => void generarFallo()}
                  disabled={cargandoFallo}
                >
                  {cargandoFallo ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <PenLine className="size-4" />
                  )}
                  {fallo
                    ? t("detail.rulingRegenerate")
                    : t("detail.rulingGenerate")}
                </Button>
              </CardContent>
            </Card>

            {/* Cronograma + progreso */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <BookOpen className="size-4 text-info" />
                  {t("detail.scheduleTitle")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{t("detail.progress")}</span>
                    <span className="tabular-nums">{caso.progreso}%</span>
                  </div>
                  <Progress value={caso.progreso} className="mt-1" />
                </div>
                <Separator />
                <Cronograma plazos={caso.cronograma} />
              </CardContent>
            </Card>
          </div>
        </ScrollArea>

        {/* Barra de acción inferior */}
        <div className="flex items-center gap-3 border-t bg-card px-5 py-3">
          {diasFallo !== null && !yaFallado && (
            <span
              className={cn(
                "text-xs font-medium",
                diasFallo <= 2 ? "text-danger" : "text-muted-foreground",
              )}
            >
              {diasFallo < 0
                ? t("detail.rulingOverdueBy", { dias: Math.abs(diasFallo) })
                : t("detail.rulingDeadline", { dias: diasFallo })}
            </span>
          )}
          {yaFallado ? (
            <Badge className="ml-auto border-0 bg-success/10 font-medium text-success">
              <CheckCircle2 className="size-3.5" /> {t("detail.caseRuled")}
            </Badge>
          ) : (
            <Button
              className="ml-auto"
              onClick={() => setConfirmarOpen(true)}
            >
              <FileSignature className="size-4" /> {t("detail.signRuling")}
            </Button>
          )}
        </div>
      </SheetContent>

      {/* Confirmación de firma */}
      <Dialog open={confirmarOpen} onOpenChange={setConfirmarOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileSignature className="size-5 text-primary" />
              {t("detail.confirmSignTitle")}
            </DialogTitle>
            <DialogDescription>
              {t("detail.confirmSignBody", {
                nombre: caso.demandante.nombre,
                radicado: caso.radicado,
              })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose
              render={
                <Button variant="outline">{t("detail.cancel")}</Button>
              }
            />
            <Button onClick={firmarFallo}>
              <FileSignature className="size-4" /> {t("detail.confirmAndSign")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Sheet>
  );
}

function Dato({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-2">
      <span className="mt-0.5 text-muted-foreground">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="leading-snug">{children}</p>
      </div>
    </div>
  );
}

function VeredictoBadge({
  veredicto,
  t,
}: {
  veredicto: TriajeResultado["veredicto"];
  t: TFunction;
}) {
  const map = {
    admisible: {
      key: "detail.verdictAdmissible",
      cls: "bg-success/10 text-success",
    },
    admisible_con_reservas: {
      key: "detail.verdictAdmissibleReservations",
      cls: "bg-warning/10 text-warning",
    },
    inadmisible: {
      key: "detail.verdictInadmissible",
      cls: "bg-danger/10 text-danger",
    },
  } as const;
  const v = map[veredicto];
  return (
    <Badge className={cn("border-0 font-medium", v.cls)}>{t(v.key)}</Badge>
  );
}

function CriterioIcono({ estado }: { estado: EstadoCriterio }) {
  if (estado === "ok")
    return <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-success" />;
  if (estado === "reserva")
    return <CircleAlert className="mt-0.5 size-3.5 shrink-0 text-warning" />;
  return <XCircle className="mt-0.5 size-3.5 shrink-0 text-danger" />;
}

function PrecedenteLista({
  sentencias,
  t,
}: {
  sentencias: SentenciaRef[];
  t: TFunction;
}) {
  if (sentencias.length === 0) return null;
  return (
    <div>
      <p className="mb-1.5 text-xs font-medium text-muted-foreground">
        {t("detail.citedPrecedent")}
      </p>
      <div className="space-y-1.5">
        {sentencias.map((s) => (
          <div
            key={s.id}
            className="rounded-lg border bg-muted/30 px-3 py-2"
          >
            <p className="flex items-center gap-2 text-xs font-semibold text-navy">
              <BookOpen className="size-3.5 text-primary" />
              <span className="font-mono">{s.id}</span>
              <span className="font-normal text-muted-foreground">
                · {s.tema}
              </span>
            </p>
            <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
              {s.subregla}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function EstudioSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-5 w-1/3" />
      <div className="grid gap-1.5 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    </div>
  );
}
