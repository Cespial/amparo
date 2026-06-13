"use client";

// components/atlas/atlas-mapa.tsx
// Mapa coroplético de Colombia con react-map-gl/maplibre.
// Sin token Mapbox: estilo de fondo claro propio (solo el GeoJSON de departamentos).

import { useEffect, useMemo, useRef, useState } from "react";
import Map, {
  Source,
  Layer,
  type MapRef,
  type MapLayerMouseEvent,
} from "react-map-gl/maplibre";
import type {
  FeatureCollection,
  Feature,
  Geometry,
  GeoJsonProperties,
} from "geojson";
import "maplibre-gl/dist/maplibre-gl.css";

import {
  type MetricaAtlas,
  statsPorCodigo,
  expresionColor,
} from "./atlas-data";

interface AtlasMapaProps {
  metrica: MetricaAtlas;
  /** Código DANE seleccionado (resaltado). */
  seleccionado: string | null;
  onSeleccionar: (codigo: string | null) => void;
}

/** Basemap dark vectorial (estética Tensor / OpenFreeMap). */
const ESTILO_DARK = "https://tiles.openfreemap.org/styles/dark";

export function AtlasMapa({
  metrica,
  seleccionado,
  onSeleccionar,
}: AtlasMapaProps) {
  const mapRef = useRef<MapRef | null>(null);
  const [raw, setRaw] = useState<FeatureCollection | null>(null);
  const [hover, setHover] = useState<{
    codigo: string;
    nombre: string;
    x: number;
    y: number;
  } | null>(null);

  // Carga local del GeoJSON una sola vez.
  useEffect(() => {
    let vivo = true;
    fetch("/data/colombia-departamentos.geojson")
      .then((r) => r.json())
      .then((g: FeatureCollection) => {
        if (vivo) setRaw(g);
      })
      .catch(() => {
        if (vivo) setRaw(null);
      });
    return () => {
      vivo = false;
    };
  }, []);

  // Inyecta el valor de la métrica activa en cada feature como `__valor`.
  const data = useMemo<FeatureCollection | null>(() => {
    if (!raw) return null;
    const features: Feature<Geometry, GeoJsonProperties>[] = raw.features.map(
      (f) => {
        const codigo = String(f.properties?.DPTO ?? "");
        const st = statsPorCodigo.get(codigo);
        return {
          ...f,
          properties: {
            ...f.properties,
            __codigo: codigo,
            __valor: st ? st[metrica] : null,
            __tiene: st ? 1 : 0,
          },
        };
      },
    );
    return { type: "FeatureCollection", features };
  }, [raw, metrica]);

  const colorExpr = useMemo(() => expresionColor(metrica), [metrica]);

  function handleClick(e: MapLayerMouseEvent) {
    const f = e.features?.[0];
    const codigo = f?.properties?.__codigo as string | undefined;
    if (codigo && statsPorCodigo.has(codigo)) {
      onSeleccionar(seleccionado === codigo ? null : codigo);
    } else {
      onSeleccionar(null);
    }
  }

  function handleMove(e: MapLayerMouseEvent) {
    const f = e.features?.[0];
    const codigo = f?.properties?.__codigo as string | undefined;
    const map = mapRef.current?.getMap();
    if (codigo && statsPorCodigo.has(codigo)) {
      if (map) map.getCanvas().style.cursor = "pointer";
      setHover({
        codigo,
        nombre: statsPorCodigo.get(codigo)!.nombre,
        x: e.point.x,
        y: e.point.y,
      });
    } else {
      if (map) map.getCanvas().style.cursor = "";
      setHover(null);
    }
  }

  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl">
      <Map
        ref={mapRef}
        initialViewState={{ longitude: -73.5, latitude: 4.6, zoom: 4.1 }}
        mapStyle={ESTILO_DARK}
        attributionControl={false}
        dragRotate={false}
        touchPitch={false}
        maxZoom={7}
        minZoom={3.4}
        interactiveLayerIds={["deptos-fill"]}
        onClick={handleClick}
        onMouseMove={handleMove}
        onMouseLeave={() => {
          const map = mapRef.current?.getMap();
          if (map) map.getCanvas().style.cursor = "";
          setHover(null);
        }}
        style={{ width: "100%", height: "100%" }}
      >
        {data && (
          <Source id="deptos" type="geojson" data={data}>
            <Layer
              id="deptos-fill"
              type="fill"
              paint={{
                "fill-color": colorExpr as never,
                "fill-opacity": [
                  "case",
                  ["==", ["get", "__codigo"], seleccionado ?? "__none__"],
                  0.95,
                  0.74,
                ] as never,
              }}
            />
            <Layer
              id="deptos-line"
              type="line"
              paint={{
                "line-color": "rgba(230,237,243,0.28)",
                "line-width": 0.6,
              }}
            />
            <Layer
              id="deptos-sel"
              type="line"
              filter={[
                "==",
                ["get", "__codigo"],
                seleccionado ?? "__none__",
              ]}
              paint={{
                "line-color": "#E6EDF3",
                "line-width": 2.4,
              }}
            />
          </Source>
        )}
      </Map>

      {hover && (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-[calc(100%+10px)] rounded-lg border border-white/10 bg-[#161B22]/95 px-2.5 py-1 text-xs font-medium text-[#E6EDF3] shadow-lg backdrop-blur"
          style={{ left: hover.x, top: hover.y }}
        >
          {hover.nombre}
        </div>
      )}
    </div>
  );
}

export default AtlasMapa;
