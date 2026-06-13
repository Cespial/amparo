"use client";

import { useState } from "react";
import { HeartHandshake } from "lucide-react";
import { heroeId } from "@/lib/seed";
import { useT } from "@/lib/i18n";
import { SegundoCerebro } from "@/components/segundo-cerebro";
import { DemandanteWizard } from "./demandante-wizard";

/**
 * Layout cliente del portal del demandante: encabezado bilingüe + el wizard
 * (corazón del Acto II) + el copiloto "segundo cerebro" en panel lateral
 * (escritorio) / inferior (móvil). Comparte el id del caso activo con el copiloto.
 */
export function DemandantePortal() {
  const [casoActivoId, setCasoActivoId] = useState<string>(heroeId);
  const t = useT("demandante");

  return (
    <>
      <header className="mb-6 flex items-start gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <HeartHandshake className="size-6" />
        </span>
        <div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-navy">
            {t("page.title")}
          </h1>
          <p className="mt-1 max-w-2xl text-muted-foreground">
            {t("page.subtitle")}
          </p>
          <p className="mt-1.5 max-w-2xl text-sm font-medium text-brand-strong">
            {t("page.tagline")}
          </p>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="min-w-0">
          <DemandanteWizard onCasoActivo={setCasoActivoId} />
        </div>

        <aside className="lg:sticky lg:top-24 lg:h-[calc(100vh-7rem)]">
          <SegundoCerebro
            rol="demandante"
            casoId={casoActivoId}
            titulo={t("copilot.title")}
          />
        </aside>
      </div>
    </>
  );
}
