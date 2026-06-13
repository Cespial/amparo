"use client";

// components/atlas/atlas-shell.tsx
// Orquesta el Atlas: estado de métrica + selección, layout responsive.
// Mobile-first: mapa arriba, KPIs abajo; en desktop, mapa + panel lateral.

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useCasoStore } from "@/lib/store";
import { Skeleton } from "@/components/ui/skeleton";
import { Map as MapIcon } from "lucide-react";
import { AtlasKpis } from "./atlas-kpis";
import { AtlasLeyenda } from "./atlas-leyenda";
import { AtlasRanking } from "./atlas-ranking";
import { AtlasComparador } from "./atlas-comparador";
import { AtlasAcciones } from "./atlas-acciones";
import { AtlasPanelDesktop, AtlasPanelMovil } from "./atlas-panel";
import { type MetricaAtlas, METRICAS, statsPorCodigo } from "./atlas-data";
import { useIsMobile } from "./use-is-mobile";
import { useT } from "@/lib/i18n";

// MapLibre necesita el navegador: carga sólo en cliente. El skeleton queda
// oscuro a propósito (es el área del mapa dark dentro de una tarjeta blanca).
const AtlasMapa = dynamic(() => import("./atlas-mapa"), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full rounded-2xl bg-[#161B22]" />,
});

/** Métrica inicial leída de ?metrica= (cliente); por defecto, la tasa por 10k. */
function metricaInicial(): MetricaAtlas {
  if (typeof window === "undefined") return "tasaPor10k";
  const m = new URLSearchParams(window.location.search).get("metrica");
  return m && m in METRICAS ? (m as MetricaAtlas) : "tasaPor10k";
}

/** Departamento inicial leído de ?depto= (cliente); null si no es válido. */
function deptoInicial(): string | null {
  if (typeof window === "undefined") return null;
  const d = new URLSearchParams(window.location.search).get("depto");
  return d && statsPorCodigo.has(d) ? d : null;
}

export function AtlasShell() {
  const t = useT("atlas");
  const isMobile = useIsMobile();
  // Estado inicial hidratado desde los query params (?metrica=, ?depto=) para
  // que un enlace compartido reproduzca la vista. Lazy initializer (cliente) —
  // sin efecto ni setState en montaje.
  const [metrica, setMetrica] = useState<MetricaAtlas>(() => metricaInicial());
  const [seleccionado, setSeleccionado] = useState<string | null>(
    () => deptoInicial(),
  );
  const [sheetAbierto, setSheetAbierto] = useState(false);
  const [mostrarIps, setMostrarIps] = useState(false);
  const [mostrarRedPublica, setMostrarRedPublica] = useState(false);

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
    // BUG-FIX: el Sheet móvil (overlay fixed inset-0 con backdrop-blur) sólo
    // debe abrirse en móvil. En desktop el panel lateral derecho ya muestra el
    // detalle; abrir el Sheet aquí tapaba la página con un velo borroso.
    if (codigo && statsPorCodigo.has(codigo) && isMobile) setSheetAbierto(true);
  }

  return (
    <div className="flex min-w-0 max-w-full flex-col gap-4 overflow-x-hidden">
      <AtlasKpis resueltosSinJuez={resueltosSinJuez} />

      {/* Barra de acciones: comparador A vs B (izq.) + compartir/descargar (der.).
          Aditivo y AAA claro; no toca el mapa ni las capas existentes. */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <AtlasComparador preseleccionA={seleccionado} />
        <AtlasAcciones metrica={metrica} seleccionado={seleccionado} />
      </div>

      {/* Mapa + lateral. En móvil una sola columna; en desktop 2fr/1fr.
          `min-w-0` en la grilla y en la columna del mapa evita que el canvas
          del mapa (o una etiqueta larga) desborde horizontalmente en móvil. */}
      <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex min-w-0 flex-col gap-3">
          {/* Marco claro (surface-card) con un mapa DARK enmarcado por dentro. */}
          <div className="surface-card relative h-[58vh] min-h-[360px] overflow-hidden p-0 lg:h-[640px]">
            <AtlasMapa
              metrica={metrica}
              seleccionado={seleccionado}
              onSeleccionar={seleccionar}
              mostrarIps={mostrarIps}
              mostrarRedPublica={mostrarRedPublica}
            />
          </div>
          <AtlasLeyenda
            metrica={metrica}
            onMetrica={setMetrica}
            mostrarIps={mostrarIps}
            onToggleIps={setMostrarIps}
            mostrarRedPublica={mostrarRedPublica}
            onToggleRedPublica={setMostrarRedPublica}
          />
          {/* Ranking + distribución nacional (chrome claro AAA, NO sobre el mapa). */}
          <AtlasRanking
            metrica={metrica}
            seleccionado={seleccionado}
            onSeleccionar={seleccionar}
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
            <div className="surface-card flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
              <div className="grid size-12 place-items-center rounded-full border border-border bg-secondary text-brand">
                <MapIcon className="size-6" aria-hidden />
              </div>
              <p className="font-heading text-base font-medium text-foreground">
                {t("hint.title")}
              </p>
              <p className="text-sm text-muted-foreground">{t("hint.text")}</p>
            </div>
          )}
        </div>
      </div>

      {/* Panel móvil: Sheet inferior. Sólo se monta en móvil para que su overlay
          (fixed inset-0 + backdrop-blur) nunca cubra la página en desktop. */}
      {seleccionado && isMobile && (
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
