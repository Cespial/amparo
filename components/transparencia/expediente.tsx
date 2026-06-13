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
import { cn } from "@/lib/utils";

type Vista = "demandante" | "demandado" | "juez";

const FMT = new Intl.DateTimeFormat("es-CO", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

/** ¿La EPS ya respondió (acuerdo, negación o fallo)? Deriva del timeline. */
function respuestaEps(caso: Caso): { texto: string; tono: "ok" | "alerta" | "pendiente" } {
  if (caso.estado === "RESUELTO_EPS") {
    return {
      texto: `La EPS autorizó ${caso.servicioNegado} mediante acuerdo, sin acudir al juez.`,
      tono: "ok",
    };
  }
  if (
    caso.estado === "ESCALADO_TUTELA" ||
    caso.estado === "EN_DESPACHO" ||
    caso.estado === "FALLADO"
  ) {
    return {
      texto:
        "La EPS mantuvo su posición en la etapa de negociación. La disputa se trasladó a la vía judicial.",
      tono: "alerta",
    };
  }
  if (caso.peticion) {
    const reloj = relojPeticion(caso.peticion);
    return {
      texto: reloj.vencida
        ? "El término del derecho de petición venció sin respuesta de fondo de la EPS."
        : `Pendiente: la EPS debe responder de fondo. ${reloj.etiqueta}.`,
      tono: reloj.vencida ? "alerta" : "pendiente",
    };
  }
  return {
    texto: "Aún no se ha abierto la negociación con la EPS.",
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
  const resp = respuestaEps(caso);

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center gap-2">
        <Scale className="size-4 text-primary" />
        <h3 className="font-serif text-base font-semibold text-navy">
          Expediente compartido
        </h3>
        <span className="text-xs text-muted-foreground">
          Transparencia bilateral · cada parte ve los insumos de la otra
        </span>
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        {/* Demandante */}
        <Columna
          icon={<User className="size-4" />}
          titulo="Lo que aporta el demandante"
          subtitulo={`${caso.demandante.nombre} · ${caso.demandante.ciudad}`}
          resaltado={vista === "demandante"}
        >
          <Bloque label="Relato de los hechos">{caso.hechos}</Bloque>
          <Bloque label="Lo que pide">{caso.pretension}</Bloque>
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
          titulo="Lo que responde la EPS"
          subtitulo={caso.demandado.nombre}
          resaltado={vista === "demandado"}
        >
          {caso.peticion && (
            <div className="rounded-lg border bg-background/60 px-2.5 py-2 text-xs">
              <p className="flex items-center gap-1.5 font-medium text-navy">
                <ShieldQuestion className="size-3.5 text-primary" />
                Derecho de petición {caso.peticion.radicadoPeticion}
              </p>
              <p className="mt-0.5 text-muted-foreground">
                Responsable: {caso.peticion.dependencia}
              </p>
              <p className="mt-0.5 text-muted-foreground">
                Vence el {FMT.format(new Date(caso.peticion.slaVence))} ·{" "}
                {caso.peticion.slaDias} días{" "}
                {caso.peticion.slaHabiles ? "hábiles" : "calendario"}
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
          titulo="Lo que valora el juez"
          subtitulo="Despacho judicial"
          resaltado={vista === "juez"}
        >
          <Bloque label="Derechos invocados">
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
            <Bloque label="Precedente aplicable">
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
            Amparo propone un análisis consistente con el precedente. La última
            palabra es del juez, que firma el fallo.
          </p>
        </Columna>
      </div>
    </div>
  );
}
