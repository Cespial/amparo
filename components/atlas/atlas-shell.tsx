"use client";

// components/atlas/atlas-shell.tsx
// Orquesta el Atlas: estado de métrica + selección, layout responsive.
// Mobile-first: mapa arriba, KPIs abajo; en desktop, mapa + panel lateral.

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useCasoStore } from "@/lib/store";
import { Skeleton } from "@/components/ui/skeleton";
import { AtlasKpis } from "./atlas-kpis";
import { AtlasLeyenda } from "./atlas-leyenda";
import { AtlasPanelDesktop, AtlasPanelMovil } from "./atlas-panel";
import { type MetricaAtlas, statsPorCodigo } from "./atlas-data";

// MapLibre necesita el navegador: carga sólo en cliente.
const AtlasMapa = dynamic(() => import("./atlas-mapa"), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full rounded-2xl bg-[#161B22]" />,
});

export function AtlasShell() {
  const [metrica, setMetrica] = useState<MetricaAtlas>("tasaPor10k");
  const [seleccionado, setSeleccionado] = useState<string | null>(null);
  const [sheetAbierto, setSheetAbierto] = useState(false);
  const [mostrarIps, setMostrarIps] = useState(false);

  const casos = useCasoStore((s) => s.casos);

  // Casos resueltos en negociación EPS, sin llegar a juez.
  const resueltosSinJuez = useMemo(
    () => casos.filter((c) => c.estado === "RESUELTO_EPS").length,
    [casos],
  );

  // Conteo de casos del store por departamento seleccionado.
  const casosEnDepto = useMemo(() => {
    if (!seleccionado) return 0;
    return casos.filter(
      (c) => c.demandante.codigoDepartamento === seleccionado,
    ).length;
  }, [casos, seleccionado]);

  function seleccionar(codigo: string | null) {
    setSeleccionado(codigo);
    if (codigo && statsPorCodigo.has(codigo)) setSheetAbierto(true);
  }

  return (
    <div className="flex flex-col gap-4">
      <AtlasKpis resueltosSinJuez={resueltosSinJuez} />

      {/* Mapa + lateral. En móvil una sola columna; en desktop 2fr/1fr. */}
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex flex-col gap-3">
          <div className="glow-card glow-card--teal relative h-[58vh] min-h-[360px] overflow-hidden p-0 lg:h-[640px]">
            <AtlasMapa
              metrica={metrica}
              seleccionado={seleccionado}
              onSeleccionar={seleccionar}
              mostrarIps={mostrarIps}
            />
          </div>
          <AtlasLeyenda
            metrica={metrica}
            onMetrica={setMetrica}
            mostrarIps={mostrarIps}
            onToggleIps={setMostrarIps}
          />
        </div>

        {/* Panel desktop: detalle o pista de interacción. */}
        <div className="hidden lg:block">
          {seleccionado ? (
            <AtlasPanelDesktop
              codigo={seleccionado}
              casosEnDepto={casosEnDepto}
              onCerrar={() => setSeleccionado(null)}
            />
          ) : (
            <div className="glow-card flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
              <div className="grid size-12 place-items-center rounded-full border border-[#30363D] bg-[#0D1117] shadow-[0_0_18px_-6px_rgba(27,107,109,0.8)]">
                <span className="text-2xl" aria-hidden>
                  🗺️
                </span>
              </div>
              <p className="font-heading text-base font-medium text-[#E6EDF3]">
                Explora el mapa
              </p>
              <p className="text-sm text-[#8B949E]">
                Haz clic en un departamento para ver sus estadísticas de tutelas
                en salud y abrir un caso.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Panel móvil: Sheet inferior. */}
      {seleccionado && (
        <AtlasPanelMovil
          abierto={sheetAbierto}
          onOpenChange={(v) => {
            setSheetAbierto(v);
            if (!v) setSeleccionado(null);
          }}
          codigo={seleccionado}
          casosEnDepto={casosEnDepto}
          onCerrar={() => {
            setSheetAbierto(false);
            setSeleccionado(null);
          }}
        />
      )}
    </div>
  );
}

export default AtlasShell;
