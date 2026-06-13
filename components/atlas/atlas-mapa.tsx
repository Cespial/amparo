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
  /** Capa de puntos de IPS por municipio (encendida/apagada desde la leyenda). */
  mostrarIps: boolean;
}

/** Un punto de IPS por municipio (centroide DANE + conteo REPS). */
interface PuntoIps {
  municipio: string;
  departamento: string;
  cod_dane_mpio: string;
  lat: number;
  lng: number;
  ips_total: number;
}

/** Basemap dark vectorial (estética Tensor / OpenFreeMap). */
const ESTILO_DARK = "https://tiles.openfreemap.org/styles/dark";

export function AtlasMapa({
  metrica,
  seleccionado,
  onSeleccionar,
  mostrarIps,
}: AtlasMapaProps) {
  const mapRef = useRef<MapRef | null>(null);
  const [raw, setRaw] = useState<FeatureCollection | null>(null);
  const [hover, setHover] = useState<{
    nombre: string;
    sub?: string;
    x: number;
    y: number;
  } | null>(null);
  const [puntosIps, setPuntosIps] = useState<PuntoIps[] | null>(null);

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

  // Carga perezosa de los puntos de IPS: solo la primera vez que se encienden.
  useEffect(() => {
    if (!mostrarIps || puntosIps) return;
    let vivo = true;
    fetch("/data/ips-puntos.json")
      .then((r) => r.json())
      .then((d: { puntos?: PuntoIps[] }) => {
        if (vivo) setPuntosIps(d.puntos ?? []);
      })
      .catch(() => {
        if (vivo) setPuntosIps([]);
      });
    return () => {
      vivo = false;
    };
  }, [mostrarIps, puntosIps]);

  // FeatureCollection de puntos de IPS (centroide municipal + conteo).
  const ipsData = useMemo<FeatureCollection | null>(() => {
    if (!puntosIps) return null;
    return {
      type: "FeatureCollection",
      features: puntosIps.map((p) => ({
        type: "Feature",
        geometry: { type: "Point", coordinates: [p.lng, p.lat] },
        properties: {
          municipio: p.municipio,
          departamento: p.departamento,
          ips_total: p.ips_total,
        },
      })),
    };
  }, [puntosIps]);

  // Radio máximo del set de puntos (para escalar el círculo por ips_total).
  const ipsMax = useMemo(
    () =>
      puntosIps && puntosIps.length
        ? Math.max(...puntosIps.map((p) => p.ips_total))
        : 1,
    [puntosIps],
  );

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
    // Prioriza el punto de IPS si está bajo el cursor (capa superior).
    const fIps = e.features?.find((f) => f.layer.id === "ips-circle");
    if (fIps) return; // los puntos no cambian la selección de departamento
    const f = e.features?.find((ff) => ff.layer.id === "deptos-fill");
    const codigo = f?.properties?.__codigo as string | undefined;
    if (codigo && statsPorCodigo.has(codigo)) {
      onSeleccionar(seleccionado === codigo ? null : codigo);
    } else {
      onSeleccionar(null);
    }
  }

  function handleMove(e: MapLayerMouseEvent) {
    const map = mapRef.current?.getMap();
    const fIps = e.features?.find((f) => f.layer.id === "ips-circle");
    if (fIps) {
      if (map) map.getCanvas().style.cursor = "pointer";
      const ips = Number(fIps.properties?.ips_total ?? 0);
      setHover({
        nombre: String(fIps.properties?.municipio ?? ""),
        sub: `${ips.toLocaleString("es-CO")} IPS · ${fIps.properties?.departamento ?? ""}`,
        x: e.point.x,
        y: e.point.y,
      });
      return;
    }
    const f = e.features?.find((ff) => ff.layer.id === "deptos-fill");
    const codigo = f?.properties?.__codigo as string | undefined;
    if (codigo && statsPorCodigo.has(codigo)) {
      if (map) map.getCanvas().style.cursor = "pointer";
      setHover({
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
        interactiveLayerIds={
          mostrarIps ? ["ips-circle", "deptos-fill"] : ["deptos-fill"]
        }
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

        {/* Capa de IPS por municipio: puntos teal con glow, radio ∝ ips_total. */}
        {mostrarIps && ipsData && (
          <Source id="ips" type="geojson" data={ipsData}>
            {/* Halo difuso (glow Tensor teal) bajo el núcleo. */}
            <Layer
              id="ips-glow"
              type="circle"
              paint={{
                "circle-color": "#1B6B6D",
                "circle-blur": 1,
                "circle-opacity": 0.35,
                "circle-radius": [
                  "interpolate",
                  ["linear"],
                  ["sqrt", ["get", "ips_total"]],
                  0,
                  6,
                  Math.sqrt(ipsMax),
                  34,
                ] as never,
              }}
            />
            {/* Núcleo del punto: teal brillante, borde claro. */}
            <Layer
              id="ips-circle"
              type="circle"
              paint={{
                "circle-color": "#2BD9C0",
                "circle-opacity": 0.92,
                "circle-stroke-color": "#E6FFFB",
                "circle-stroke-width": 0.8,
                "circle-stroke-opacity": 0.7,
                "circle-radius": [
                  "interpolate",
                  ["linear"],
                  ["sqrt", ["get", "ips_total"]],
                  0,
                  2.4,
                  Math.sqrt(ipsMax),
                  16,
                ] as never,
              }}
            />
          </Source>
        )}
      </Map>

      {hover && (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-[calc(100%+10px)] rounded-lg border border-white/10 bg-[#161B22]/95 px-2.5 py-1 text-xs text-[#E6EDF3] shadow-lg backdrop-blur"
          style={{ left: hover.x, top: hover.y }}
        >
          <span className="font-medium">{hover.nombre}</span>
          {hover.sub && (
            <span className="mt-0.5 block text-[10px] text-[#8B949E]">
              {hover.sub}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default AtlasMapa;
