"use client";

// components/transparencia/expediente.tsx
// Expediente compartido (transparencia bilateral): cada parte ve los insumos de
// la otra. Justicia procedimental — estándar AAA. Reutilizable en /demandado,
// /juez y, en modo solo lectura, en /demandante.

import {
  Building2,
  Gavel,
  Scale,
  ShieldQuestion,
  Stethoscope,
  User,
} from "lucide-react";
import type { Caso } from "@/lib/types";
import { relojPeticion } from "@/lib/peticion";
import { useT, useLang, type TFunction } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type Vista = "demandante" | "demandado" | "juez";

/** Etiqueta localizada del reloj del término de petición (sin tocar lib/peticion). */
function relojEtiqueta(caso: Caso, t: TFunction): string {
  const reloj = relojPeticion(caso.peticion!);
  const tipo = caso.peticion!.slaHabiles
    ? t("expediente.daysBusiness")
    : t("expediente.daysCalendar");
  if (reloj.vencida)
    return t("expediente.clockOverdue", {
      dias: Math.abs(reloj.diasRestantes),
      tipo,
    });
  if (reloj.diasRestantes <= 0) return t("expediente.clockDueToday");
  return t("expediente.clockDueIn", { dias: reloj.diasRestantes, tipo });
}

/** Respuesta de la EPS derivada del estado: clave i18n + tono + vars. */
function respuestaEps(
  caso: Caso,
  t: TFunction,
): { texto: string; tono: "ok" | "alerta" | "pendiente" } {
  if (caso.estado === "RESUELTO_EPS") {
    return {
      texto: t("expediente.respAuthorized", { servicio: caso.servicioNegado }),
      tono: "ok",
    };
  }
  if (
    caso.estado === "ESCALADO_TUTELA" ||
    caso.estado === "EN_DESPACHO" ||
    caso.estado === "FALLADO"
  ) {
    return {
      texto: t("expediente.respMovedToCourt"),
      tono: "alerta",
    };
  }
  if (caso.peticion) {
    const reloj = relojPeticion(caso.peticion);
    return {
      texto: reloj.vencida
        ? t("expediente.respPetitionExpired")
        : t("expediente.respPetitionPending", { reloj: relojEtiqueta(caso, t) }),
      tono: reloj.vencida ? "alerta" : "pendiente",
    };
  }
  return {
    texto: t("expediente.respNotStarted"),
    tono: "pendiente",
  };
}

const TONO_RESP: Record<"ok" | "alerta" | "pendiente", string> = {
  ok: "border-success/30 bg-success/5 text-success",
  alerta: "border-warning/30 bg-warning/5 text-warning",
  pendiente: "border-info/30 bg-info/5 text-info",
};

function Columna({
  icon,
  titulo,
  subtitulo,
  resaltado,
  children,
}: {
  icon: React.ReactNode;
  titulo: string;
  subtitulo: string;
  resaltado?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex flex-col rounded-2xl border bg-card p-4 shadow-sm",
        resaltado && "ring-1 ring-primary/30",
      )}
    >
      <div className="flex items-center gap-2">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-navy">
          {icon}
        </span>
        <div className="min-w-0">
          <p className="font-serif text-sm font-semibold text-navy">{titulo}</p>
          <p className="text-[11px] text-muted-foreground">{subtitulo}</p>
        </div>
      </div>
      <div className="mt-3 space-y-3 text-sm">{children}</div>
    </div>
  );
}

function Bloque({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-0.5 leading-relaxed text-foreground/90">{children}</p>
    </div>
  );
}

export interface ExpedienteProps {
  caso: Caso;
  /** Desde qué rol se mira el expediente (resalta la propia columna). */
  vista: Vista;
  className?: string;
}

/**
 * Expediente compartido del caso. Muestra, lado a lado: lo que aportó el
 * demandante, lo que respondió (o debe responder) la EPS, y lo que valora el
 * juez. Cada parte ve los insumos de la otra.
 */
export function Expediente({ caso, vista, className }: ExpedienteProps) {
  const t = useT("juez");
  const { lang } = useLang();
  const resp = respuestaEps(caso, t);
  const FMT = new Intl.DateTimeFormat(lang === "en" ? "en-US" : "es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center gap-2">
        <Scale className="size-4 text-primary" />
        <h3 className="font-serif text-base font-semibold text-navy">
          {t("expediente.title")}
        </h3>
        <span className="text-xs text-muted-foreground">
          {t("expediente.tagline")}
        </span>
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        {/* Demandante */}
        <Columna
          icon={<User className="size-4" />}
          titulo={t("expediente.claimantTitle")}
          subtitulo={`${caso.demandante.nombre} · ${caso.demandante.ciudad}`}
          resaltado={vista === "demandante"}
        >
          <Bloque label={t("expediente.factsLabel")}>{caso.hechos}</Bloque>
          <Bloque label={t("expediente.requestLabel")}>{caso.pretension}</Bloque>
          <div className="flex items-start gap-2 rounded-lg bg-muted/40 px-2.5 py-2 text-xs">
            <Stethoscope className="mt-0.5 size-3.5 shrink-0 text-primary" />
            <span>
              {caso.servicioNegado} · {caso.diagnostico} ·{" "}
              {caso.esPBS ? "PBS" : "NO-PBS"}
            </span>
          </div>
        </Columna>

        {/* EPS */}
        <Columna
          icon={<Building2 className="size-4" />}
          titulo={t("expediente.epsTitle")}
          subtitulo={caso.demandado.nombre}
          resaltado={vista === "demandado"}
        >
          {caso.peticion && (
            <div className="rounded-lg border bg-background/60 px-2.5 py-2 text-xs">
              <p className="flex items-center gap-1.5 font-medium text-navy">
                <ShieldQuestion className="size-3.5 text-primary" />
                {t("expediente.rightOfPetition", {
                  radicado: caso.peticion.radicadoPeticion,
                })}
              </p>
              <p className="mt-0.5 text-muted-foreground">
                {t("expediente.responsible", {
                  dependencia: caso.peticion.dependencia,
                })}
              </p>
              <p className="mt-0.5 text-muted-foreground">
                {t("expediente.dueOn", {
                  fecha: FMT.format(new Date(caso.peticion.slaVence)),
                  dias: caso.peticion.slaDias,
                  tipo: caso.peticion.slaHabiles
                    ? t("expediente.daysBusiness")
                    : t("expediente.daysCalendar"),
                })}
              </p>
            </div>
          )}
          <div className={cn("rounded-lg border px-2.5 py-2 text-sm", TONO_RESP[resp.tono])}>
            {resp.texto}
          </div>
        </Columna>

        {/* Juez */}
        <Columna
          icon={<Gavel className="size-4" />}
          titulo={t("expediente.judgeTitle")}
          subtitulo={t("expediente.judgeSubtitle")}
          resaltado={vista === "juez"}
        >
          <Bloque label={t("expediente.rightsInvoked")}>
            <span className="flex flex-wrap gap-1.5">
              {caso.derechosInvocados.map((d) => (
                <span
                  key={d}
                  className="rounded-full bg-secondary px-2 py-0.5 text-xs capitalize text-navy"
                >
                  {d}
                </span>
              ))}
            </span>
          </Bloque>
          {caso.sentenciasAplicables && caso.sentenciasAplicables.length > 0 && (
            <Bloque label={t("expediente.applicablePrecedent")}>
              <span className="space-y-1">
                {caso.sentenciasAplicables.slice(0, 3).map((s) => (
                  <span key={s.id} className="block text-xs">
                    <span className="font-mono font-semibold text-primary">
                      {s.id}
                    </span>{" "}
                    <span className="text-muted-foreground">{s.tema}</span>
                  </span>
                ))}
              </span>
            </Bloque>
          )}
          <p className="rounded-lg bg-muted/40 px-2.5 py-2 text-[11px] text-muted-foreground">
            {t("expediente.judgeNote")}
          </p>
        </Columna>
      </div>
    </div>
  );
}
