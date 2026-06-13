"use client";

import { useState } from "react";
import { heroeId } from "@/lib/seed";
import { SegundoCerebro } from "@/components/segundo-cerebro";
import { DemandanteWizard } from "./demandante-wizard";

/**
 * Layout cliente del portal del demandante: el wizard (corazón del Acto II)
 * + el copiloto "segundo cerebro" en panel lateral (escritorio) / inferior (móvil).
 * Comparte el id del caso activo con el copiloto.
 */
export function DemandantePortal() {
  const [casoActivoId, setCasoActivoId] = useState<string>(heroeId);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="min-w-0">
        <DemandanteWizard onCasoActivo={setCasoActivoId} />
      </div>

      <aside className="lg:sticky lg:top-24 lg:h-[calc(100vh-7rem)]">
        <SegundoCerebro
          rol="demandante"
          casoId={casoActivoId}
          titulo="Amparo, tu copiloto"
        />
      </aside>
    </div>
  );
}
