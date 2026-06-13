"use client";

// components/mediacion/sala-mediacion.tsx
// "Sala de mediación" — el núcleo de Amparo como "la cuarta parte".
//
// Inspirada en la "Habermas Machine" (Google DeepMind, Science 2024): en vez de
// gana/pierde, Amparo media entre el PACIENTE (demandante) y la EPS (demandado)
// y propone un ACUERDO de consenso, razonado y fundado en el derecho a la salud,
// que ambas partes pueden aceptar. Justicia procedimental + descongestión.
//
// Esta UI:
//   1) muestra las dos POSICIONES legítimas lado a lado;
//   2) presenta la PROPUESTA DE CONSENSO con su fundamento y términos concretos;
//   3) ofrece botones de ACEPTAR para cada parte;
//   4) al aceptar ambas → revela el "Acta de acuerdo" con un estado RESUELTO por
//      consenso y una animación sutil.
//
// Es presentacional y controlada: el estado de aceptación vive arriba (página)
// para poder reflejar la descongestión en el flujo del demandado.

import { useMemo } from "react";
import {
  BadgeCheck,
  CheckCircle2,
  FileSignature,
  Gavel,
  HeartHandshake,
  Loader2,
  Plus,
  RefreshCw,
  Scale,
  ScrollText,
  Sparkles,
  Stethoscope,
  TrendingDown,
  User,
  Building2,
} from "lucide-react";

import type { Mediacion } from "@/lib/types";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { BotonVoz } from "@/components/boton-voz";
import { SentenciaChip } from "@/components/sentencia-chip";
import anim from "./mediacion-anim.module.css";

export interface SalaMediacionProps {
  /** La propuesta de mediación, o null si aún no se ha generado. */
  mediacion: Mediacion | null;
  /** ¿Se está construyendo la propuesta? */
  generando?: boolean;
  /** Mensaje de error (si la generación falló). */
  error?: string | null;
  /** Nombre del paciente (demandante), para personalizar las posiciones. */
  pacienteNombre?: string;
  /** Nombre de la EPS (demandado). */
  epsNombre?: string;
  /** Genera (o regenera) la propuesta de consenso. */
  onGenerar?: () => void;
  /** El paciente acepta el consenso. */
  onAceptarDemandante?: () => void;
  /** La EPS acepta el consenso. */
  onAceptarEPS?: () => void;
  /** Variante compacta (sin el encabezado de la sala) para incrustar en diálogos. */
  embebido?: boolean;
  /** Solo lectura: oculta los botones de aceptar/regenerar (p.ej. vista del demandante). */
  soloLectura?: boolean;
  className?: string;
}

export function SalaMediacion({
  mediacion,
  generando = false,
  error = null,
  pacienteNombre,
  epsNombre,
  onGenerar,
  onAceptarDemandante,
  onAceptarEPS,
  embebido = false,
  soloLectura = false,
  className,
}: SalaMediacionProps) {
  const t = useT("mediacion");

  const aceptadoDemandante = Boolean(mediacion?.aceptadoDemandante);
  const aceptadoEPS = Boolean(mediacion?.aceptadoEPS);
  const ambosAceptaron =
    aceptadoDemandante && aceptadoEPS && Boolean(mediacion);

  // Texto que Amparo lee en voz alta: la propuesta de consenso y sus términos.
  const textoVoz = useMemo(() => {
    if (!mediacion) return "";
    return [
      `${t("room.fourthParty")}.`,
      `${t("consensus.title")}: ${mediacion.consensoPropuesto}`,
      `${t("consensus.termsTitle")}: ${mediacion.terminos.join(". ")}`,
    ].join(" ");
  }, [mediacion, t]);

  return (
    <section
      className={cn(
        "space-y-6",
        !embebido && "surface-card p-5 sm:p-6",
        className,
      )}
      aria-label={t("room.title")}
    >
      {/* ── Encabezado de la sala ── */}
      {!embebido && (
        <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-brand-strong">
              <HeartHandshake className="size-5" />
              <span className="text-xs font-semibold uppercase tracking-wide">
                {t("room.eyebrow")}
              </span>
            </div>
            <h2 className="mt-1 font-serif text-2xl font-bold tracking-tight text-navy">
              {t("room.title")}
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              {t("room.subtitle")}
            </p>
          </div>

          {!soloLectura && (
            <div className="flex shrink-0 items-center gap-2">
              {mediacion && !ambosAceptaron && (
                <BotonVoz texto={textoVoz} variant="outline" size="sm" />
              )}
              {onGenerar && (
                <Button
                  onClick={onGenerar}
                  disabled={generando}
                  variant={mediacion ? "outline" : "default"}
                  className="gap-2"
                >
                  {generando ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : mediacion ? (
                    <RefreshCw className="size-4" />
                  ) : (
                    <Sparkles className="size-4" />
                  )}
                  {generando
                    ? t("room.generating")
                    : mediacion
                      ? t("room.regenerate")
                      : t("room.generate")}
                </Button>
              )}
            </div>
          )}
        </header>
      )}

      {/* ── Nota: Habermas Machine ── */}
      {!embebido && (
        <HabermasNota />
      )}

      {/* ── Cuerpo ── */}
      {generando && !mediacion ? (
        <EstadoGenerando texto={t("room.generating")} />
      ) : error && !mediacion ? (
        <EstadoVacio tono="error" texto={error} />
      ) : !mediacion ? (
        <EstadoVacio tono="vacio" texto={t("room.empty")} />
      ) : (
        <div className="space-y-6">
          {/* Posiciones legítimas, lado a lado */}
          <div>
            <h3 className="flex items-center gap-2 font-serif text-lg font-semibold text-navy">
              <Stethoscope className="size-5 text-primary" />
              {t("positions.title")}
            </h3>
            <div className="mt-3 grid gap-4 md:grid-cols-2">
              <PosicionCard
                icon={<User className="size-5" />}
                acento="patient"
                titulo={pacienteNombre ?? t("positions.patient")}
                etiqueta={t("positions.patient")}
                hint={t("positions.patientHint")}
                texto={mediacion.posicionDemandante}
                aceptado={aceptadoDemandante}
                aceptadoLabel={t("decision.acceptedByPatient")}
                // Clímax: ambas tarjetas viran a verde EN SECUENCIA (esta primero).
                consenso={ambosAceptaron}
              />
              <PosicionCard
                icon={<Building2 className="size-5" />}
                acento="eps"
                titulo={epsNombre ?? t("positions.eps")}
                etiqueta={t("positions.eps")}
                hint={t("positions.epsHint")}
                texto={mediacion.posicionEPS}
                aceptado={aceptadoEPS}
                aceptadoLabel={t("decision.acceptedByEps")}
                // …y esta vira después (consenso secuencial, no simultáneo).
                consenso={ambosAceptaron}
                consensoTarde
              />
            </div>
          </div>

          {/* Propuesta de consenso */}
          <div
            className={cn(
              "relative rounded-2xl border bg-secondary/40 p-5 transition-colors duration-500",
              ambosAceptaron && "border-success/50 bg-success/5",
            )}
          >
            {/* Clímax: el sello "ACUERDO POR CONSENSO" cae sobre el panel. */}
            {ambosAceptaron && <SelloConsenso label={t("seal.label")} />}

            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="flex items-center gap-2 font-serif text-lg font-semibold text-navy">
                  <HeartHandshake
                    className={cn(
                      "size-5 transition-colors",
                      ambosAceptaron ? "text-success" : "text-primary",
                      // Latido único al sellar el consenso.
                      ambosAceptaron && anim.latidoUnico,
                    )}
                  />
                  {t("consensus.title")}
                </h3>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {t("consensus.hint")}
                </p>
              </div>
              <Badge variant="secondary" className="shrink-0 gap-1">
                <Sparkles className="size-3" />
                {t("room.fourthParty")}
              </Badge>
            </div>

            <p className="mt-3 text-sm leading-relaxed text-foreground/90">
              {mediacion.consensoPropuesto}
            </p>

            {/* Fundamento en el derecho a la salud */}
            <div className="mt-4 rounded-xl border bg-card p-4">
              <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <Scale className="size-3.5" />
                {t("consensus.foundationTitle")}
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                {mediacion.fundamento}
              </p>
            </div>

            {/* Términos del acuerdo */}
            {mediacion.terminos.length > 0 && (
              <div className="mt-4">
                <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <ScrollText className="size-3.5" />
                  {t("consensus.termsTitle")}
                </p>
                <ol className="mt-2 space-y-2">
                  {mediacion.terminos.map((termino, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2.5 rounded-xl border bg-card p-3 text-sm"
                    >
                      <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[0.7rem] font-bold text-primary">
                        {i + 1}
                      </span>
                      <span className="leading-relaxed">{termino}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* Precedente que respalda el consenso (solo corpus) */}
            {mediacion.fundamentos && mediacion.fundamentos.length > 0 && (
              <div className="mt-4">
                <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <Gavel className="size-3.5" />
                  {t("consensus.precedentsTitle")}
                </p>
                <div className="mt-2 grid gap-2.5 sm:grid-cols-2">
                  {mediacion.fundamentos.map((s) => (
                    <div
                      key={s.id}
                      className="rounded-xl border bg-card p-3 shadow-sm"
                    >
                      <div className="flex items-center justify-between gap-2">
                        {/* Cita CLICABLE a la relatoría de la Corte (degrada a span). */}
                        <SentenciaChip sentencia={s} showTema={false} />
                        <div className="flex items-center gap-1.5">
                          {typeof s.score === "number" && (
                            <Badge variant="outline" className="font-mono font-normal">
                              {Math.round(s.score * 100)}%
                            </Badge>
                          )}
                          <Badge variant="secondary" className="font-normal">
                            {s.anio}
                          </Badge>
                        </div>
                      </div>
                      <p className="mt-1 text-sm font-medium text-navy">
                        {s.tema}
                      </p>
                      <p className="mt-1 line-clamp-3 text-xs leading-relaxed text-muted-foreground">
                        {s.extracto || s.subregla}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Decisión de las partes / Acta de acuerdo */}
          {ambosAceptaron ? (
            <ActaAcuerdo
              pacienteNombre={pacienteNombre}
              epsNombre={epsNombre}
              terminos={mediacion.terminos}
            />
          ) : (
            !soloLectura && (
              <DecisionPartes
                aceptadoDemandante={aceptadoDemandante}
                aceptadoEPS={aceptadoEPS}
                onAceptarDemandante={onAceptarDemandante}
                onAceptarEPS={onAceptarEPS}
              />
            )
          )}

          {/* Aviso */}
          <p className="text-xs leading-relaxed text-muted-foreground">
            {t("disclaimer")}
          </p>
        </div>
      )}
    </section>
  );
}

// ── Subcomponentes locales ──

/** Nota elegante que reconoce la inspiración en la Habermas Machine. */
function HabermasNota() {
  const t = useT("mediacion");
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-primary/15 bg-primary/5 p-4">
      <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Sparkles className="size-5" />
      </span>
      <div className="min-w-0">
        <p className="flex flex-wrap items-center gap-2 font-medium text-navy">
          {t("habermas.title")}
          <Badge variant="outline" className="font-normal text-brand-strong">
            {t("habermas.badge")}
          </Badge>
        </p>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          {t("habermas.body")}
        </p>
      </div>
    </div>
  );
}

type AcentoParte = "patient" | "eps";

function PosicionCard({
  icon,
  acento,
  titulo,
  etiqueta,
  hint,
  texto,
  aceptado,
  aceptadoLabel,
  consenso = false,
  consensoTarde = false,
}: {
  icon: React.ReactNode;
  acento: AcentoParte;
  titulo: string;
  etiqueta: string;
  hint: string;
  texto: string;
  aceptado: boolean;
  aceptadoLabel: string;
  /** Clímax: ambas partes aceptaron → la tarjeta vira a verde. */
  consenso?: boolean;
  /** Esta tarjeta vira DESPUÉS de la otra (secuencia, no simultáneo). */
  consensoTarde?: boolean;
}) {
  // Paciente → navy; EPS → info, manteniendo la estética AAA clara.
  const tono =
    acento === "patient"
      ? "bg-navy/10 text-navy"
      : "bg-info/10 text-info";
  return (
    <article
      className={cn(
        "flex flex-col rounded-2xl border bg-card p-4 shadow-sm transition-all duration-500",
        aceptado && "border-success/40 ring-1 ring-success/30",
        // Clímax: viraje a verde EN SECUENCIA (la 2ª tarjeta con retraso).
        consenso && "border-success/60 bg-success/5 ring-1 ring-success/40",
        consenso && anim.virajeVerde,
        consenso && consensoTarde && anim.virajeTarde,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span
            className={cn(
              "flex size-9 items-center justify-center rounded-xl",
              tono,
            )}
          >
            {icon}
          </span>
          <div className="min-w-0">
            <p className="truncate font-medium leading-tight text-navy">
              {titulo}
            </p>
            <p className="text-xs text-muted-foreground">{etiqueta}</p>
          </div>
        </div>
        {aceptado && (
          <Badge variant="outline" className="shrink-0 gap-1 text-success">
            <CheckCircle2 className="size-3" />
            {aceptadoLabel}
          </Badge>
        )}
      </div>
      <p className="mt-2 text-xs italic text-muted-foreground">{hint}</p>
      <p className="mt-2 text-sm leading-relaxed text-foreground/90">{texto}</p>
    </article>
  );
}

function DecisionPartes({
  aceptadoDemandante,
  aceptadoEPS,
  onAceptarDemandante,
  onAceptarEPS,
}: {
  aceptadoDemandante: boolean;
  aceptadoEPS: boolean;
  onAceptarDemandante?: () => void;
  onAceptarEPS?: () => void;
}) {
  const t = useT("mediacion");
  return (
    <div className="rounded-2xl border bg-card p-4">
      <p className="flex items-center gap-2 font-serif text-base font-semibold text-navy">
        <FileSignature className="size-4 text-primary" />
        {t("decision.title")}
      </p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <BotonDecision
          aceptado={aceptadoDemandante}
          onClick={onAceptarDemandante}
          icon={<User className="size-4" />}
          aceptarLabel={t("decision.acceptPatient")}
          aceptadoLabel={t("decision.acceptedByPatient")}
        />
        <BotonDecision
          aceptado={aceptadoEPS}
          onClick={onAceptarEPS}
          icon={<Building2 className="size-4" />}
          aceptarLabel={t("decision.acceptEps")}
          aceptadoLabel={t("decision.acceptedByEps")}
        />
      </div>
    </div>
  );
}

function BotonDecision({
  aceptado,
  onClick,
  icon,
  aceptarLabel,
  aceptadoLabel,
}: {
  aceptado: boolean;
  onClick?: () => void;
  icon: React.ReactNode;
  aceptarLabel: string;
  aceptadoLabel: string;
}) {
  if (aceptado) {
    return (
      <div className="flex items-center justify-center gap-2 rounded-xl border border-success/40 bg-success/5 px-3 py-2.5 text-sm font-medium text-success">
        <CheckCircle2 className="size-4" />
        {aceptadoLabel}
      </div>
    );
  }
  return (
    <Button
      onClick={onClick}
      disabled={!onClick}
      variant="default"
      size="lg"
      className="w-full gap-2"
    >
      {icon}
      {aceptarLabel}
    </Button>
  );
}

/** El "Acta de acuerdo": revela el consenso alcanzado con animación sutil. */
function ActaAcuerdo({
  pacienteNombre,
  epsNombre,
  terminos,
}: {
  pacienteNombre?: string;
  epsNombre?: string;
  terminos: string[];
}) {
  const t = useT("mediacion");
  const partes = [pacienteNombre, epsNombre].filter(Boolean).join(" · ");
  return (
    <div className="surface-navy animate-in fade-in zoom-in-95 overflow-hidden p-5 duration-500">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-success">
            <CheckCircle2 className="size-5" />
            <span className="text-xs font-semibold uppercase tracking-wide">
              {t("status.bothAccepted")}
            </span>
          </div>
          <h3 className="mt-1 font-serif text-xl font-bold tracking-tight">
            {t("record.title")}
          </h3>
          <p className="mt-1 max-w-xl text-sm text-navy-foreground/70">
            {t("record.subtitle")}
          </p>
          {partes && (
            <p className="mt-1 text-xs font-medium text-navy-foreground/60">
              {partes}
            </p>
          )}
        </div>
        <Badge
          variant="secondary"
          className="shrink-0 gap-1 bg-success/15 text-success"
        >
          <FileSignature className="size-3" />
          {t("status.aceptada")}
        </Badge>
      </div>

      {terminos.length > 0 && (
        <ol className="mt-4 space-y-1.5">
          {terminos.map((termino, i) => (
            <li
              key={i}
              className="flex items-start gap-2 text-sm text-navy-foreground/85"
            >
              <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-success" />
              <span className="leading-relaxed">{termino}</span>
            </li>
          ))}
        </ol>
      )}

      <Separator className="my-4 bg-white/10" />

      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-center gap-2 text-sm font-medium text-success">
          <TrendingDown className="size-4" />
          {t("record.decongestion")}
        </p>
        {/* Contador de descongestión: este acuerdo suma +1 caso sin juez. */}
        <div className="flex items-center gap-2 rounded-full bg-success/15 px-3 py-1.5 text-success">
          <span className="text-[0.65rem] font-semibold uppercase tracking-wide text-navy-foreground/70">
            {t("seal.decongestionCounter")}
          </span>
          <span className="flex items-center gap-0.5 font-mono text-base font-bold tabular-nums">
            <Plus className="size-3.5" />1
          </span>
        </div>
      </div>
    </div>
  );
}

/** Sello "ACUERDO POR CONSENSO" que cae sobre el panel al sellar el consenso. */
function SelloConsenso({ label }: { label: string }) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute -top-3 right-3 z-10 select-none sm:right-5",
        anim.selloBase,
        anim.selloCae,
        anim.selloEstatico,
      )}
      aria-hidden
    >
      <div className="flex items-center gap-1.5 rounded-md border-2 border-success/70 bg-success/10 px-2.5 py-1 text-success shadow-sm backdrop-blur-sm">
        <BadgeCheck className="size-4" />
        <span className="text-[0.7rem] font-bold uppercase tracking-[0.12em]">
          {label}
        </span>
      </div>
    </div>
  );
}

function EstadoGenerando({ texto }: { texto: string }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed bg-card/60 px-6 py-14 text-center">
      <Loader2 className="size-6 animate-spin text-primary" />
      <p className="text-sm font-medium text-muted-foreground">{texto}</p>
    </div>
  );
}

function EstadoVacio({
  tono,
  texto,
}: {
  tono: "vacio" | "error";
  texto: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3 rounded-2xl border border-dashed px-6 py-14 text-center",
        tono === "error" ? "border-danger/30 bg-danger/5" : "bg-card/60",
      )}
    >
      <span
        className={cn(
          "flex size-12 items-center justify-center rounded-full",
          tono === "error"
            ? "bg-danger/10 text-danger"
            : "bg-primary/10 text-primary",
        )}
      >
        <HeartHandshake className="size-6" />
      </span>
      <p
        className={cn(
          "max-w-sm text-sm",
          tono === "error" ? "text-danger" : "text-muted-foreground",
        )}
      >
        {texto}
      </p>
    </div>
  );
}
