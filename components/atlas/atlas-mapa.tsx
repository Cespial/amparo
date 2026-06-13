"use client";

// components/atlas/atlas-mapa.tsx
// Mapa coroplético de Colombia con react-map-gl/maplibre sobre basemap DARK.
// Capas: coroplético de departamentos (teal→rojo), IPS, Red pública (ESE) y
// etiquetas de capitales. Elementos WOW (inspirados en caba.tensor.lat):
//   1) Vista 3D: fill-extrusion con altura ∝ métrica activa + pitch de cámara.
//   2) Buscador con fly-to (easeTo) desde departamentos y ciudades locales.
//   3) Fly-to + realce (line glow) al seleccionar un departamento.
//   4) Basemap toggle dark ⇄ satélite (Esri World Imagery, sin token).

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
import type { StyleSpecification } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Box, Square, Mountain, Satellite } from "lucide-react";

import {
  type MetricaAtlas,
  statsPorCodigo,
  expresionColor,
  rangoMetrica,
} from "./atlas-data";
import { indexarGeoDeptos } from "./atlas-geo";
import { AtlasBuscador, type DestinoBusqueda } from "./atlas-buscador";
import { useLang } from "@/lib/i18n";

interface AtlasMapaProps {
  metrica: MetricaAtlas;
  /** Código DANE seleccionado (resaltado). */
  seleccionado: string | null;
  onSeleccionar: (codigo: string | null) => void;
  /** Capa de puntos de IPS por municipio (encendida/apagada desde la leyenda). */
  mostrarIps: boolean;
  /** Capa de puntos de la red PÚBLICA (ESE) por municipio. */
  mostrarRedPublica: boolean;
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

/** Un punto de red pública (ESE) por municipio (centroide DANE + conteo REPS). */
interface PuntoRedPublica {
  municipio: string;
  departamento: string;
  cod_dane_mpio: string;
  lat: number;
  lng: number;
  ips_publicas: number;
  ese: number;
}

/** Una ciudad geocodificada (centroide municipal DANE). */
interface Ciudad {
  nombre: string;
  departamento: string;
  cod_dane_mpio: string;
  lat: number;
  lng: number;
  poblacion: number;
  es_capital: boolean;
}

/** Basemap dark vectorial (estética Tensor / OpenFreeMap). */
const ESTILO_DARK = "https://tiles.openfreemap.org/styles/dark";

/**
 * Basemap satélite (Esri World Imagery, raster, SIN token). Se construye como
 * StyleSpecification mínima para no depender de un endpoint de estilo externo.
 */
const ESTILO_SATELITE: StyleSpecification = {
  version: 8,
  glyphs: "https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf",
  sources: {
    "esri-imagery": {
      type: "raster",
      tiles: [
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      ],
      tileSize: 256,
      attribution: "Esri, Maxar, Earthstar Geographics",
      maxzoom: 19,
    },
  },
  layers: [
    {
      id: "esri-imagery",
      type: "raster",
      source: "esri-imagery",
      paint: { "raster-opacity": 1 },
    },
  ],
};

/** Acento de la red pública (verde, distinto al teal de IPS). */
const COLOR_RED_PUBLICA = "#3fb950";

/** Altura visual máxima de la extrusión 3D (en "metros" del mapa). */
const ALTURA_3D_MAX = 340000;

const COPIA = {
  es: {
    vista2d: "2D",
    vista3d: "3D",
    vistaAria: "Alternar vista 2D / 3D",
    basemapDark: "Mapa",
    basemapSat: "Satélite",
    basemapAria: "Alternar basemap oscuro / satélite",
    relieve: "Relieve por magnitud",
  },
  en: {
    vista2d: "2D",
    vista3d: "3D",
    vistaAria: "Toggle 2D / 3D view",
    basemapDark: "Map",
    basemapSat: "Satellite",
    basemapAria: "Toggle dark / satellite basemap",
    relieve: "Relief by magnitude",
  },
} as const;

export function AtlasMapa({
  metrica,
  seleccionado,
  onSeleccionar,
  mostrarIps,
  mostrarRedPublica,
}: AtlasMapaProps) {
  const { lang } = useLang();
  const tc = COPIA[lang];
  const mapRef = useRef<MapRef | null>(null);
  const [raw, setRaw] = useState<FeatureCollection | null>(null);
  const [hover, setHover] = useState<{
    nombre: string;
    sub?: string;
    x: number;
    y: number;
  } | null>(null);
  const [puntosIps, setPuntosIps] = useState<PuntoIps[] | null>(null);
  const [puntosRed, setPuntosRed] = useState<PuntoRedPublica[] | null>(null);
  const [ciudades, setCiudades] = useState<Ciudad[] | null>(null);

  // Elementos WOW.
  const [vista3d, setVista3d] = useState(false);
  const [basemap, setBasemap] = useState<"dark" | "satelite">("dark");

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

  // Carga perezosa de la red pública (ESE): solo la primera vez que se enciende.
  useEffect(() => {
    if (!mostrarRedPublica || puntosRed) return;
    let vivo = true;
    fetch("/data/ips-publicas-puntos.json")
      .then((r) => r.json())
      .then((d: { puntos?: PuntoRedPublica[] }) => {
        if (vivo) setPuntosRed(d.puntos ?? []);
      })
      .catch(() => {
        if (vivo) setPuntosRed([]);
      });
    return () => {
      vivo = false;
    };
  }, [mostrarRedPublica, puntosRed]);

  // Carga (una vez) de las ciudades para las etiquetas de capitales.
  useEffect(() => {
    let vivo = true;
    fetch("/data/ciudades.json")
      .then((r) => r.json())
      .then((d: { ciudades?: Ciudad[] }) => {
        if (vivo) setCiudades(d.ciudades ?? []);
      })
      .catch(() => {
        if (vivo) setCiudades([]);
      });
    return () => {
      vivo = false;
    };
  }, []);

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

  // FeatureCollection de la red pública (ESE) por municipio.
  const redData = useMemo<FeatureCollection | null>(() => {
    if (!puntosRed) return null;
    return {
      type: "FeatureCollection",
      features: puntosRed.map((p) => ({
        type: "Feature",
        geometry: { type: "Point", coordinates: [p.lng, p.lat] },
        properties: {
          municipio: p.municipio,
          departamento: p.departamento,
          ips_publicas: p.ips_publicas,
          ese: p.ese,
        },
      })),
    };
  }, [puntosRed]);

  // Radio máximo de la red pública (para escalar el círculo por ips_publicas).
  const redMax = useMemo(
    () =>
      puntosRed && puntosRed.length
        ? Math.max(...puntosRed.map((p) => p.ips_publicas))
        : 1,
    [puntosRed],
  );

  // FeatureCollection de etiquetas de CIUDADES (solo capitales, para no saturar).
  const ciudadesData = useMemo<FeatureCollection | null>(() => {
    if (!ciudades) return null;
    return {
      type: "FeatureCollection",
      features: ciudades
        .filter((c) => c.es_capital)
        .map((c) => ({
          type: "Feature",
          geometry: { type: "Point", coordinates: [c.lng, c.lat] },
          properties: { nombre: c.nombre, departamento: c.departamento },
        })),
    };
  }, [ciudades]);

  // Centroides de departamentos para el buscador + fly-to por selección.
  const geoDeptos = useMemo(
    () => (raw ? indexarGeoDeptos(raw.features) : null),
    [raw],
  );
  const centroidesDepto = useMemo(() => {
    if (!geoDeptos) return null;
    const m = new globalThis.Map<string, { lng: number; lat: number }>();
    for (const [codigo, g] of geoDeptos) m.set(codigo, g.centro);
    return m;
  }, [geoDeptos]);

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

  // Expresión de altura 3D: escala lineal del valor al rango visual.
  const alturaExpr = useMemo(() => {
    const [min, max] = rangoMetrica(metrica);
    return [
      "interpolate",
      ["linear"],
      ["coalesce", ["get", "__valor"], min],
      min,
      0,
      max,
      ALTURA_3D_MAX,
    ];
  }, [metrica]);

  /** easeTo suave centrando una coordenada (fly-to compartido). */
  function volarA(lng: number, lat: number, zoom: number) {
    const map = mapRef.current?.getMap();
    if (!map) return;
    map.easeTo({
      center: [lng, lat],
      zoom,
      pitch: vista3d ? 50 : 0,
      duration: 1100,
      essential: true,
    });
  }

  // Transición de cámara al alternar 2D/3D (pitch animado).
  useEffect(() => {
    const map = mapRef.current?.getMap();
    if (!map) return;
    map.easeTo({
      pitch: vista3d ? 50 : 0,
      bearing: vista3d ? -14 : 0,
      duration: 900,
      essential: true,
    });
  }, [vista3d]);

  // Fly-to al seleccionar un departamento (centra en su centroide).
  useEffect(() => {
    if (!seleccionado || !geoDeptos) return;
    const g = geoDeptos.get(seleccionado);
    if (!g) return;
    // Zoom según el ancho del bbox (departamentos grandes → más lejos).
    const [w, , e] = g.bbox;
    const ancho = Math.abs(e - w);
    const zoom = ancho > 5 ? 5.4 : ancho > 2.5 ? 6 : 6.6;
    volarA(g.centro.lng, g.centro.lat, zoom);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seleccionado, geoDeptos]);

  function onElegirBusqueda(d: DestinoBusqueda) {
    volarA(d.lng, d.lat, d.zoom);
    if (d.codigoDepto && statsPorCodigo.has(d.codigoDepto)) {
      onSeleccionar(d.codigoDepto);
    }
  }

  function handleClick(e: MapLayerMouseEvent) {
    // Prioriza los puntos (IPS / red pública) si están bajo el cursor: no
    // cambian la selección de departamento.
    const fPunto = e.features?.find(
      (f) => f.layer.id === "ips-circle" || f.layer.id === "red-circle",
    );
    if (fPunto) return;
    const f = e.features?.find(
      (ff) => ff.layer.id === "deptos-fill" || ff.layer.id === "deptos-3d",
    );
    const codigo = f?.properties?.__codigo as string | undefined;
    if (codigo && statsPorCodigo.has(codigo)) {
      onSeleccionar(seleccionado === codigo ? null : codigo);
    } else {
      onSeleccionar(null);
    }
  }

  function handleMove(e: MapLayerMouseEvent) {
    const map = mapRef.current?.getMap();
    // Red pública (ESE): capa superior, tiene prioridad en el tooltip.
    const fRed = e.features?.find((f) => f.layer.id === "red-circle");
    if (fRed) {
      if (map) map.getCanvas().style.cursor = "pointer";
      const ese = Number(fRed.properties?.ese ?? 0);
      const pub = Number(fRed.properties?.ips_publicas ?? 0);
      setHover({
        nombre: String(fRed.properties?.municipio ?? ""),
        sub: `${ese.toLocaleString("es-CO")} ESE / ${pub.toLocaleString("es-CO")} públicas`,
        x: e.point.x,
        y: e.point.y,
      });
      return;
    }
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
    const f = e.features?.find(
      (ff) => ff.layer.id === "deptos-fill" || ff.layer.id === "deptos-3d",
    );
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

  const interactiveLayerIds = [
    ...(mostrarRedPublica ? ["red-circle"] : []),
    ...(mostrarIps ? ["ips-circle"] : []),
    vista3d ? "deptos-3d" : "deptos-fill",
  ];

  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl">
      <Map
        ref={mapRef}
        initialViewState={{ longitude: -73.5, latitude: 4.6, zoom: 4.1 }}
        mapStyle={basemap === "dark" ? ESTILO_DARK : ESTILO_SATELITE}
        attributionControl={false}
        dragRotate={vista3d}
        touchPitch={vista3d}
        maxPitch={60}
        maxZoom={9}
        minZoom={3.4}
        interactiveLayerIds={interactiveLayerIds}
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
            {/* 2D: coroplético plano. */}
            {!vista3d && (
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
            )}

            {/* 3D: extrusión con altura ∝ métrica (la magnitud, en relieve). */}
            {vista3d && (
              <Layer
                id="deptos-3d"
                type="fill-extrusion"
                paint={{
                  "fill-extrusion-color": colorExpr as never,
                  "fill-extrusion-height": alturaExpr as never,
                  "fill-extrusion-base": 0,
                  "fill-extrusion-opacity": 0.92,
                  "fill-extrusion-vertical-gradient": true,
                }}
              />
            )}

            <Layer
              id="deptos-line"
              type="line"
              paint={{
                "line-color": "rgba(230,237,243,0.28)",
                "line-width": 0.6,
              }}
            />
            {/* Realce de selección: glow exterior + línea nítida. */}
            <Layer
              id="deptos-sel-glow"
              type="line"
              filter={["==", ["get", "__codigo"], seleccionado ?? "__none__"]}
              paint={{
                "line-color": "#2BD9C0",
                "line-width": 7,
                "line-blur": 6,
                "line-opacity": 0.55,
              }}
            />
            <Layer
              id="deptos-sel"
              type="line"
              filter={["==", ["get", "__codigo"], seleccionado ?? "__none__"]}
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

        {/* Capa de RED PÚBLICA (ESE) por municipio: puntos verdes, radio ∝ ips_publicas. */}
        {mostrarRedPublica && redData && (
          <Source id="red-publica" type="geojson" data={redData}>
            <Layer
              id="red-glow"
              type="circle"
              paint={{
                "circle-color": COLOR_RED_PUBLICA,
                "circle-blur": 1,
                "circle-opacity": 0.32,
                "circle-radius": [
                  "interpolate",
                  ["linear"],
                  ["sqrt", ["get", "ips_publicas"]],
                  0,
                  6,
                  Math.sqrt(redMax),
                  32,
                ] as never,
              }}
            />
            <Layer
              id="red-circle"
              type="circle"
              paint={{
                "circle-color": COLOR_RED_PUBLICA,
                "circle-opacity": 0.92,
                "circle-stroke-color": "#EAFBEF",
                "circle-stroke-width": 0.8,
                "circle-stroke-opacity": 0.7,
                "circle-radius": [
                  "interpolate",
                  ["linear"],
                  ["sqrt", ["get", "ips_publicas"]],
                  0,
                  2.4,
                  Math.sqrt(redMax),
                  15,
                ] as never,
              }}
            />
          </Source>
        )}

        {/* Etiquetas de CIUDADES (capitales): punto sutil + texto claro con halo
            oscuro para legibilidad sobre el basemap dark. */}
        {ciudadesData && (
          <Source id="ciudades" type="geojson" data={ciudadesData}>
            <Layer
              id="ciudades-dot"
              type="circle"
              paint={{
                "circle-color": "#E6EDF3",
                "circle-radius": 2.2,
                "circle-opacity": 0.85,
                "circle-stroke-color": "rgba(0,0,0,0.6)",
                "circle-stroke-width": 0.6,
              }}
            />
            <Layer
              id="ciudades-label"
              type="symbol"
              layout={{
                "text-field": ["get", "nombre"] as never,
                "text-size": 11,
                "text-offset": [0, 0.9],
                "text-anchor": "top",
                "text-allow-overlap": false,
                "text-padding": 4,
              }}
              paint={{
                "text-color": "#E6EDF3",
                "text-halo-color": "rgba(0,0,0,0.85)",
                "text-halo-width": 1.4,
                "text-halo-blur": 0.4,
              }}
            />
          </Source>
        )}
      </Map>

      {/* Buscador overlay (arriba-izquierda). Móvil: ancho casi completo. */}
      <div className="pointer-events-none absolute left-3 top-3 z-20 w-[min(20rem,calc(100%-1.5rem))]">
        <AtlasBuscador
          centroidesDepto={centroidesDepto}
          onElegir={onElegirBusqueda}
        />
      </div>

      {/* Controles de cámara/basemap (arriba-derecha). */}
      <div className="absolute right-3 top-3 z-20 flex flex-col items-end gap-2">
        <SegToggle
          aria-label={tc.vistaAria}
          opciones={[
            { valor: "2d", etiqueta: tc.vista2d, Icono: Square },
            { valor: "3d", etiqueta: tc.vista3d, Icono: Box },
          ]}
          valor={vista3d ? "3d" : "2d"}
          onValor={(v) => setVista3d(v === "3d")}
        />
        <SegToggle
          aria-label={tc.basemapAria}
          opciones={[
            { valor: "dark", etiqueta: tc.basemapDark, Icono: Mountain },
            { valor: "satelite", etiqueta: tc.basemapSat, Icono: Satellite },
          ]}
          valor={basemap}
          onValor={(v) => setBasemap(v as "dark" | "satelite")}
        />
      </div>

      {/* Pista de relieve cuando está en 3D. */}
      {vista3d && (
        <div className="pointer-events-none absolute bottom-3 left-3 z-20 rounded-md border border-white/10 bg-[#161B22]/90 px-2.5 py-1 text-[10px] font-medium text-[#C9D1D9] backdrop-blur">
          {tc.relieve}
        </div>
      )}

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

/** Toggle segmentado (estética dark) para vista 2D/3D y basemap. */
function SegToggle({
  opciones,
  valor,
  onValor,
  "aria-label": ariaLabel,
}: {
  opciones: {
    valor: string;
    etiqueta: string;
    Icono: typeof Box;
  }[];
  valor: string;
  onValor: (v: string) => void;
  "aria-label": string;
}) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className="flex overflow-hidden rounded-lg border border-white/10 bg-[#161B22]/90 shadow-lg backdrop-blur"
    >
      {opciones.map((o) => {
        const activo = o.valor === valor;
        return (
          <button
            key={o.valor}
            type="button"
            aria-pressed={activo}
            onClick={() => onValor(o.valor)}
            className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium transition-colors ${
              activo
                ? "bg-[#2BD9C0]/20 text-[#E6EDF3]"
                : "text-[#8B949E] hover:bg-white/5 hover:text-[#C9D1D9]"
            }`}
          >
            <o.Icono className="size-3.5" aria-hidden />
            {o.etiqueta}
          </button>
        );
      })}
    </div>
  );
}

export default AtlasMapa;
