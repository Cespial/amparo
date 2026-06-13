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
import { useT, useLang } from "@/lib/i18n";

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
  const t = useT("atlas");
  const { lang } = useLang();
  const st = statsPorCodigo.get(codigo);
  if (!st) return null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <MapPin className="size-4" />
            <span className="text-xs font-medium uppercase tracking-wide">
              {t("panel.kicker")}
            </span>
          </div>
          <h3 className="font-heading text-xl font-semibold leading-tight text-foreground">
            {st.nombre}
          </h3>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onCerrar}
          aria-label={t("panel.closeAria")}
          className="hidden text-muted-foreground hover:bg-accent hover:text-foreground lg:inline-flex"
        >
          <X className="size-4" />
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Metric
          Icono={Scale}
          tono="text-[var(--info)]"
          etiqueta={t("panel.tutelas")}
          valor={fmt(st.totalTutelas, lang)}
        />
        <Metric
          Icono={TrendingUp}
          tono="text-[var(--warning)]"
          etiqueta={t("panel.rate")}
          valor={fmt(st.tasaPor10k, lang)}
        />
      </div>

      <div className="rounded-[var(--radius-md)] border border-border bg-secondary p-3">
        <div className="mb-2 flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-sm font-medium text-foreground">
            <Hospital className="size-4 text-[var(--info)]" />
            {t("panel.ipsHealth")}
          </span>
          <span className="font-mono tabular-nums text-lg font-semibold text-foreground">
            {fmt(st.ipsTotal, lang)}
          </span>
        </div>
        <div className="flex h-2 overflow-hidden rounded-full bg-muted ring-1 ring-foreground/10">
          <div
            className="bg-[var(--success)]"
            style={{
              width: `${st.ipsTotal ? (st.ipsPublicas / st.ipsTotal) * 100 : 0}%`,
            }}
          />
          <div
            className="bg-[var(--info)]"
            style={{
              width: `${st.ipsTotal ? (st.ipsPrivadas / st.ipsTotal) * 100 : 0}%`,
            }}
          />
        </div>
        <div className="mt-2 flex justify-between font-mono tabular-nums text-xs text-muted-foreground">
          <span>
            <span className="text-[var(--success)]">{fmt(st.ipsPublicas, lang)}</span>{" "}
            {t("panel.ipsPublic")}
          </span>
          <span>
            <span className="text-[var(--info)]">{fmt(st.ipsPrivadas, lang)}</span>{" "}
            {t("panel.ipsPrivate")}
          </span>
        </div>
      </div>

      <Separator className="bg-border" />

      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{t("panel.casesInDemo")}</span>
        <Badge
          variant="secondary"
          className="font-mono tabular-nums border border-border bg-secondary text-foreground"
        >
          {casosEnDepto}
        </Badge>
      </div>

      <div className="flex flex-col gap-2">
        <Button
          render={<Link href="/demandante" />}
          className="w-full bg-primary text-primary-foreground hover:bg-[var(--primary-hover)]"
        >
          <UserPlus className="size-4" />
          {t("panel.startCase")}
        </Button>
        <Button
          render={<Link href="/juez" />}
          variant="secondary"
          className="w-full border border-border bg-secondary text-foreground hover:bg-accent"
        >
          <Gavel className="size-4" />
          {t("panel.viewInCourt")}
        </Button>
      </div>

      <p className="text-[10px] leading-tight text-muted-foreground">
        {t("panel.source")}
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
    <div className="rounded-[var(--radius-md)] border border-border bg-secondary p-3">
      <span className={tono}>
        <Icono className="size-4" aria-hidden />
      </span>
      <div className="mt-1 font-mono tabular-nums text-lg font-semibold leading-none text-foreground">
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
  const t = useT("atlas");
  const st = statsPorCodigo.get(props.codigo);
  return (
    <Sheet open={abierto} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="max-h-[85vh] overflow-auto border-border bg-card text-foreground lg:hidden"
      >
        <SheetHeader className="sr-only">
          <SheetTitle>{st?.nombre ?? t("panel.sheetFallbackTitle")}</SheetTitle>
          <SheetDescription>{t("panel.sheetDescription")}</SheetDescription>
        </SheetHeader>
        <div className="px-4 pb-6">
          <PanelContenido {...props} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
