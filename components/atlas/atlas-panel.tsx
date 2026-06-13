"use client";

// components/atlas/atlas-panel.tsx
// Panel de detalle de un departamento (in-place en desktop, Sheet en móvil).

import Link from "next/link";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  MapPin,
  Scale,
  TrendingUp,
  Hospital,
  Gavel,
  UserPlus,
  X,
} from "lucide-react";
import { statsPorCodigo, fmt } from "./atlas-data";

interface AtlasPanelContenidoProps {
  codigo: string;
  casosEnDepto: number;
  onCerrar: () => void;
}

function PanelContenido({
  codigo,
  casosEnDepto,
  onCerrar,
}: AtlasPanelContenidoProps) {
  const st = statsPorCodigo.get(codigo);
  if (!st) return null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <MapPin className="size-4" />
            <span className="text-xs font-medium uppercase tracking-wide">
              Departamento
            </span>
          </div>
          <h3 className="font-heading text-xl font-semibold leading-tight">
            {st.nombre}
          </h3>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onCerrar}
          aria-label="Cerrar panel"
          className="hidden lg:inline-flex"
        >
          <X className="size-4" />
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Metric
          Icono={Scale}
          tono="text-info"
          etiqueta="Tutelas de salud (2023)"
          valor={fmt(st.totalTutelas)}
        />
        <Metric
          Icono={TrendingUp}
          tono="text-warning"
          etiqueta="Tasa por 10.000 hab."
          valor={fmt(st.tasaPor10k)}
        />
      </div>

      <div className="surface-card border-0 bg-secondary/60 p-3">
        <div className="mb-2 flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-sm font-medium">
            <Hospital className="size-4 text-info" />
            IPS de salud
          </span>
          <span className="font-heading text-lg font-semibold tabular-nums">
            {fmt(st.ipsTotal)}
          </span>
        </div>
        <div className="flex h-2 overflow-hidden rounded-full bg-border">
          <div
            className="bg-success"
            style={{
              width: `${st.ipsTotal ? (st.ipsPublicas / st.ipsTotal) * 100 : 0}%`,
            }}
          />
          <div
            className="bg-info"
            style={{
              width: `${st.ipsTotal ? (st.ipsPrivadas / st.ipsTotal) * 100 : 0}%`,
            }}
          />
        </div>
        <div className="mt-2 flex justify-between text-xs text-muted-foreground">
          <span>{fmt(st.ipsPublicas)} públicas</span>
          <span>{fmt(st.ipsPrivadas)} privadas</span>
        </div>
      </div>

      <Separator />

      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Casos en el demo</span>
        <Badge variant="secondary" className="tabular-nums">
          {casosEnDepto}
        </Badge>
      </div>

      <div className="flex flex-col gap-2">
        <Button render={<Link href="/demandante" />} className="w-full">
          <UserPlus className="size-4" />
          Iniciar un caso aquí
        </Button>
        <Button
          render={<Link href="/juez" />}
          variant="secondary"
          className="w-full"
        >
          <Gavel className="size-4" />
          Ver casos en despacho
        </Button>
      </div>

      <p className="text-[10px] leading-tight text-muted-foreground/80">
        Datos reales 2023: Corte Constitucional (tutelas) y REPS/MinSalud (IPS).
      </p>
    </div>
  );
}

function Metric({
  Icono,
  tono,
  etiqueta,
  valor,
}: {
  Icono: typeof Scale;
  tono: string;
  etiqueta: string;
  valor: string;
}) {
  return (
    <div className="surface-card border-0 p-3">
      <span className={tono}>
        <Icono className="size-4" aria-hidden />
      </span>
      <div className="mt-1 font-heading text-lg font-semibold tabular-nums leading-none">
        {valor}
      </div>
      <p className="mt-1 text-[11px] leading-tight text-muted-foreground">
        {etiqueta}
      </p>
    </div>
  );
}

/** Versión desktop: tarjeta fija en la columna lateral. */
export function AtlasPanelDesktop(props: AtlasPanelContenidoProps) {
  return (
    <div className="surface-card hidden p-4 lg:block">
      <PanelContenido {...props} />
    </div>
  );
}

/** Versión móvil: Sheet inferior. */
export function AtlasPanelMovil({
  abierto,
  onOpenChange,
  ...props
}: AtlasPanelContenidoProps & {
  abierto: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const st = statsPorCodigo.get(props.codigo);
  return (
    <Sheet open={abierto} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[85vh] overflow-auto lg:hidden">
        <SheetHeader className="sr-only">
          <SheetTitle>{st?.nombre ?? "Departamento"}</SheetTitle>
          <SheetDescription>
            Estadísticas ilustrativas de tutelas en salud.
          </SheetDescription>
        </SheetHeader>
        <div className="px-4 pb-6">
          <PanelContenido {...props} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
