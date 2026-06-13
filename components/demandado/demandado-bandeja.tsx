"use client";

// components/demandado/demandado-bandeja.tsx
// Bandeja de reclamaciones entrantes en estado EN_NEGOCIACION_EPS.

import { AlertTriangle, ChevronRight, Inbox } from "lucide-react";
import type { Caso } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { PeticionReloj } from "@/components/demandante/peticion-reloj";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  estimarProbabilidadAmparo,
  nivelRiesgoEPS,
  ordenarBandeja,
  URGENCIA_META,
} from "./demandado-utils";

interface BarraProbabilidadProps {
  prob: number;
}

function BarraProbabilidad({ prob }: BarraProbabilidadProps) {
  const { clase } = nivelRiesgoEPS(prob);
  const color =
    prob >= 75
      ? "bg-danger"
      : prob >= 55
        ? "bg-warning"
        : "bg-success";
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 w-16 overflow-hidden rounded-full bg-muted sm:w-24">
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${prob}%` }}
        />
      </div>
      <span className={`font-mono text-xs font-semibold tabular-nums ${clase}`}>
        {prob}%
      </span>
    </div>
  );
}

export interface DemandadoBandejaProps {
  casos: Caso[];
  onAbrir: (caso: Caso) => void;
  procesandoId?: string | null;
}

export function DemandadoBandeja({
  casos,
  onAbrir,
  procesandoId,
}: DemandadoBandejaProps) {
  if (casos.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed bg-card/60 px-6 py-14 text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-success/10 text-success">
          <Inbox className="size-6" />
        </span>
        <p className="font-medium">Bandeja al día</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          No hay reclamaciones en negociación. Los casos resueltos no vuelven a
          la cola.
        </p>
      </div>
    );
  }

  const ordenados = ordenarBandeja(casos);

  return (
    <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
      {/* Tarjetas en móvil */}
      <ul className="divide-y sm:hidden">
        {ordenados.map((caso) => {
          const prob = estimarProbabilidadAmparo(caso);
          const u = URGENCIA_META[caso.urgencia];
          const r = nivelRiesgoEPS(prob);
          const procesando = procesandoId === caso.id;
          return (
            <li key={caso.id}>
              <button
                onClick={() => onAbrir(caso)}
                className="flex w-full flex-col gap-2 px-4 py-4 text-left transition-colors hover:bg-muted/40 data-[busy=true]:opacity-60"
                data-busy={procesando}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium leading-tight">
                      {caso.demandante.nombre}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {caso.demandado.nombre} · {caso.demandante.ciudad}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${u.clase}`}
                  >
                    {u.etiqueta}
                  </span>
                </div>
                <p className="line-clamp-2 text-sm text-muted-foreground">
                  {caso.servicioNegado}
                </p>
                {caso.peticion && (
                  <PeticionReloj peticion={caso.peticion} compacto />
                )}
                <div className="flex items-center justify-between">
                  <BarraProbabilidad prob={prob} />
                  {r.recomendacion === "ceder" && (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-danger">
                      <AlertTriangle className="size-3.5" />
                      Ceder
                    </span>
                  )}
                </div>
              </button>
            </li>
          );
        })}
      </ul>

      {/* Tabla en escritorio */}
      <div className="hidden sm:block">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Paciente</TableHead>
              <TableHead>Servicio negado</TableHead>
              <TableHead>Urgencia</TableHead>
              <TableHead>Prob. de amparo</TableHead>
              <TableHead className="text-right">Acción EPS</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ordenados.map((caso) => {
              const prob = estimarProbabilidadAmparo(caso);
              const u = URGENCIA_META[caso.urgencia];
              const r = nivelRiesgoEPS(prob);
              const procesando = procesandoId === caso.id;
              return (
                <TableRow
                  key={caso.id}
                  onClick={() => onAbrir(caso)}
                  data-busy={procesando}
                  className="cursor-pointer data-[busy=true]:animate-pulse data-[busy=true]:opacity-70"
                >
                  <TableCell>
                    <p className="font-medium leading-tight">
                      {caso.demandante.nombre}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {caso.demandado.nombre} · {caso.demandante.ciudad}
                    </p>
                  </TableCell>
                  <TableCell className="max-w-[18rem]">
                    <p className="truncate text-sm">{caso.servicioNegado}</p>
                    <p className="text-xs text-muted-foreground">
                      {caso.esPBS ? "PBS" : "NO-PBS"} ·{" "}
                      {caso.diagnostico.split("(")[0].trim()}
                    </p>
                    {caso.peticion && (
                      <PeticionReloj
                        peticion={caso.peticion}
                        compacto
                        className="mt-1.5"
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${u.clase}`}
                    >
                      {u.etiqueta}
                    </span>
                  </TableCell>
                  <TableCell>
                    <BarraProbabilidad prob={prob} />
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="inline-flex items-center justify-end gap-1.5">
                      {r.recomendacion === "ceder" ? (
                        <Badge variant="destructive" className="gap-1">
                          <AlertTriangle className="size-3" />
                          Ceder
                        </Badge>
                      ) : r.recomendacion === "evaluar" ? (
                        <Badge variant="outline">Evaluar</Badge>
                      ) : (
                        <Badge variant="secondary">Sostenible</Badge>
                      )}
                      <ChevronRight className="size-4 text-muted-foreground" />
                    </span>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
