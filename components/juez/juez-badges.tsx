// components/juez/juez-badges.tsx — Badges de estado, urgencia y plazo para /juez.

import { AlertTriangle, Clock, ShieldCheck, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { EstadoCaso, Urgencia } from "@/lib/types";
import { ETIQUETA_ESTADO } from "@/lib/progreso";
import {
  ETIQUETA_URGENCIA,
  semaforoPlazo,
  type SemaforoPlazo,
} from "./juez-utils";

/** Badge del estado del caso con color institucional. */
export function EstadoBadge({ estado }: { estado: EstadoCaso }) {
  const clase: Record<EstadoCaso, string> = {
    INTAKE: "bg-muted text-muted-foreground",
    TRIADO: "bg-info/10 text-info",
    EN_NEGOCIACION_EPS: "bg-warning/10 text-warning",
    RESUELTO_EPS: "bg-success/10 text-success",
    ESCALADO_TUTELA: "bg-primary/10 text-primary",
    EN_DESPACHO: "bg-navy/10 text-navy",
    FALLADO: "bg-success/10 text-success",
  };
  return (
    <Badge className={cn("border-0 font-medium", clase[estado])}>
      {ETIQUETA_ESTADO[estado]}
    </Badge>
  );
}

/** Badge de urgencia clínico-jurídica. */
export function UrgenciaBadge({ urgencia }: { urgencia: Urgencia }) {
  const clase: Record<Urgencia, string> = {
    vital: "bg-danger/10 text-danger",
    alta: "bg-warning/10 text-warning",
    media: "bg-info/10 text-info",
    baja: "bg-muted text-muted-foreground",
  };
  return (
    <Badge className={cn("border-0 font-medium", clase[urgencia])}>
      {urgencia === "vital" ? (
        <Zap className="size-3" />
      ) : urgencia === "alta" ? (
        <AlertTriangle className="size-3" />
      ) : null}
      {ETIQUETA_URGENCIA[urgencia]}
    </Badge>
  );
}

const SEMAFORO_CLASE: Record<SemaforoPlazo, string> = {
  vencido: "bg-danger/10 text-danger",
  critico: "bg-danger/10 text-danger",
  proximo: "bg-warning/10 text-warning",
  ok: "bg-success/10 text-success",
};

/** Badge de días restantes de un plazo, con alerta si vence. */
export function PlazoBadge({
  dias,
  cumplido,
}: {
  dias: number;
  cumplido?: boolean;
}) {
  if (cumplido) {
    return (
      <Badge className="border-0 bg-success/10 font-medium text-success">
        <ShieldCheck className="size-3" />
        Cumplido
      </Badge>
    );
  }
  const sem = semaforoPlazo(dias);
  const etiqueta =
    dias < 0
      ? `Vencido hace ${Math.abs(dias)} d`
      : dias === 0
        ? "Vence hoy"
        : `Faltan ${dias} d`;
  return (
    <Badge
      className={cn(
        "border-0 font-medium tabular-nums",
        SEMAFORO_CLASE[sem],
      )}
    >
      {sem === "vencido" || sem === "critico" ? (
        <AlertTriangle className="size-3" />
      ) : (
        <Clock className="size-3" />
      )}
      {etiqueta}
    </Badge>
  );
}
