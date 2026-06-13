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
          <div className="flex items-center gap-1.5 text-[#8B949E]">
            <MapPin className="size-4" />
            <span className="text-xs font-medium uppercase tracking-wide">
              Departamento
            </span>
          </div>
          <h3 className="font-heading text-xl font-semibold leading-tight text-[#E6EDF3]">
            {st.nombre}
          </h3>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onCerrar}
          aria-label="Cerrar panel"
          className="hidden text-[#8B949E] hover:bg-white/5 hover:text-[#E6EDF3] lg:inline-flex"
        >
          <X className="size-4" />
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Metric
          Icono={Scale}
          tono="text-[#58a6ff]"
          etiqueta="Tutelas de salud (2023)"
          valor={fmt(st.totalTutelas)}
        />
        <Metric
          Icono={TrendingUp}
          tono="text-[#d29922]"
          etiqueta="Tasa por 10.000 hab."
          valor={fmt(st.tasaPor10k)}
        />
      </div>

      <div className="rounded-[var(--radius-md)] border border-[#30363D] bg-[#0D1117] p-3">
        <div className="mb-2 flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-sm font-medium text-[#E6EDF3]">
            <Hospital className="size-4 text-[#58a6ff]" />
            IPS de salud
          </span>
          <span className="glow-num text-lg font-semibold text-[#E6EDF3]">
            {fmt(st.ipsTotal)}
          </span>
        </div>
        <div className="flex h-2 overflow-hidden rounded-full bg-[#30363D]">
          <div
            className="bg-[#3fb950]"
            style={{
              width: `${st.ipsTotal ? (st.ipsPublicas / st.ipsTotal) * 100 : 0}%`,
            }}
          />
          <div
            className="bg-[#58a6ff]"
            style={{
              width: `${st.ipsTotal ? (st.ipsPrivadas / st.ipsTotal) * 100 : 0}%`,
            }}
          />
        </div>
        <div className="glow-num mt-2 flex justify-between text-xs text-[#8B949E]">
          <span>
            <span className="text-[#3fb950]">{fmt(st.ipsPublicas)}</span>{" "}
            públicas
          </span>
          <span>
            <span className="text-[#58a6ff]">{fmt(st.ipsPrivadas)}</span>{" "}
            privadas
          </span>
        </div>
      </div>

      <Separator className="bg-[#30363D]" />

      <div className="flex items-center justify-between text-sm">
        <span className="text-[#8B949E]">Casos en el demo</span>
        <Badge
          variant="secondary"
          className="glow-num border border-[#30363D] bg-[#0D1117] text-[#E6EDF3]"
        >
          {casosEnDepto}
        </Badge>
      </div>

      <div className="flex flex-col gap-2">
        <Button
          render={<Link href="/demandante" />}
          className="w-full border border-[#1B6B6D] bg-[#1B6B6D] text-white shadow-[0_0_18px_-4px_rgba(27,107,109,0.8)] hover:bg-[#17585a]"
        >
          <UserPlus className="size-4" />
          Iniciar un caso aquí
        </Button>
        <Button
          render={<Link href="/juez" />}
          variant="secondary"
          className="w-full border border-[#30363D] bg-[#0D1117] text-[#E6EDF3] hover:border-[#1B6B6D]/60 hover:bg-[#161B22]"
        >
          <Gavel className="size-4" />
          Ver casos en despacho
        </Button>
      </div>

      <p className="text-[10px] leading-tight text-[#8B949E]/70">
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
    <div className="rounded-[var(--radius-md)] border border-[#30363D] bg-[#0D1117] p-3">
      <span className={tono}>
        <Icono className="size-4" aria-hidden />
      </span>
      <div className="glow-num mt-1 text-lg font-semibold leading-none text-[#E6EDF3]">
        {valor}
      </div>
      <p className="mt-1 text-[11px] leading-tight text-[#8B949E]">{etiqueta}</p>
    </div>
  );
}

/** Versión desktop: tarjeta fija en la columna lateral. */
export function AtlasPanelDesktop(props: AtlasPanelContenidoProps) {
  return (
    <div className="glow-card glow-card--teal hidden p-4 lg:block">
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
      <SheetContent
        side="bottom"
        className="max-h-[85vh] overflow-auto border-[#30363D] bg-[#161B22] text-[#E6EDF3] lg:hidden"
      >
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
