// components/juez/juez-dashboard.tsx — Cliente del despacho del juez.

"use client";

import { useMemo, useState } from "react";
import { Gavel, ListFilter, Scale } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCasoStore } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { SegundoCerebro } from "@/components/segundo-cerebro";
import type { Caso } from "@/lib/types";
import { ESTADOS_DESPACHO } from "./juez-utils";
import { JuezCola } from "./juez-cola";
import { Descongestion } from "./juez-descongestion";
import { JuezDetalle } from "./juez-detalle";

type Filtro = "despacho" | "todos";

export function JuezDashboard() {
  const t = useT("juez");
  const casos = useCasoStore((s) => s.casos);
  const [filtro, setFiltro] = useState<Filtro>("despacho");
  const [abiertoId, setAbiertoId] = useState<string | null>(null);

  const enCola = useMemo(
    () => casos.filter((c) => ESTADOS_DESPACHO.includes(c.estado)),
    [casos],
  );

  const visibles = filtro === "despacho" ? enCola : casos;

  // El caso abierto se relee del store en cada render -> refleja "firmar fallo".
  const casoAbierto: Caso | null = abiertoId
    ? casos.find((c) => c.id === abiertoId) ?? null
    : null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:py-8">
      {/* Encabezado */}
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 font-heading text-2xl font-bold tracking-tight text-navy sm:text-3xl">
            <span className="flex size-9 items-center justify-center rounded-xl bg-navy text-navy-foreground">
              <Scale className="size-5" />
            </span>
            {t("dashboard.title")}
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            {t("dashboard.subtitle")}
          </p>
          <p className="mt-1.5 text-xs font-medium text-primary">
            {t("dashboard.lastWord")}
          </p>
        </div>
        <Badge className="border-0 bg-primary/10 font-medium text-primary">
          <Gavel className="size-3.5" /> {t("dashboard.inDocket", { count: enCola.length })}
        </Badge>
      </header>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_22rem]">
        {/* Columna principal */}
        <div className="space-y-5">
          <Descongestion casos={casos} />

          <Card>
            <CardHeader className="flex-row items-center justify-between gap-2 space-y-0 pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <ListFilter className="size-4 text-primary" />
                {t("dashboard.queueTitle")}
                <span className="text-xs font-normal text-muted-foreground">
                  {t("dashboard.queueHint")}
                </span>
              </CardTitle>
              <Tabs
                value={filtro}
                onValueChange={(v) => setFiltro(v as Filtro)}
              >
                <TabsList>
                  <TabsTrigger value="despacho">
                    {t("dashboard.tabDocket")}
                  </TabsTrigger>
                  <TabsTrigger value="todos">{t("dashboard.tabAll")}</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent>
              <JuezCola
                casos={visibles}
                onAbrir={(c) => setAbiertoId(c.id)}
                seleccionadoId={abiertoId}
              />
            </CardContent>
          </Card>
        </div>

        {/* Columna lateral: copiloto */}
        <aside className="lg:sticky lg:top-20 lg:h-[calc(100dvh-6rem)]">
          <SegundoCerebro
            rol="juez"
            casoId={abiertoId ?? undefined}
            titulo={t("dashboard.advisorTitle")}
          />
        </aside>
      </div>

      <JuezDetalle
        caso={casoAbierto}
        abierto={Boolean(casoAbierto)}
        onCerrar={() => setAbiertoId(null)}
      />
    </div>
  );
}
