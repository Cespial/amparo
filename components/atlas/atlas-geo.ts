// components/atlas/atlas-geo.ts
// Utilidades geométricas SIN librerías (sin Turf): centroide y bounding box de
// un feature GeoJSON (Polygon / MultiPolygon). Se usan para el fly-to por
// departamento y para escalar la cámara al tamaño real del departamento.
// No hace red: opera sobre el GeoJSON que el mapa ya cargó.

import type { Feature, Geometry, Position } from "geojson";

/** Recorre recursivamente cualquier anidamiento de coordenadas y los aplana. */
function aplanarCoords(coords: unknown, salida: Position[]): void {
  if (!Array.isArray(coords)) return;
  if (typeof coords[0] === "number") {
    salida.push(coords as Position);
    return;
  }
  for (const c of coords) aplanarCoords(c, salida);
}

/** Bounding box [oeste, sur, este, norte] de una geometría. */
export function bboxDeGeometria(
  geom: Geometry,
): [number, number, number, number] | null {
  if (geom.type === "GeometryCollection") return null;
  const pts: Position[] = [];
  aplanarCoords((geom as { coordinates: unknown }).coordinates, pts);
  if (!pts.length) return null;
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const [x, y] of pts) {
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
  }
  return [minX, minY, maxX, maxY];
}

/**
 * Centroide aproximado de un feature como centro del bounding box. Para una
 * cámara de fly-to es perfectamente legible (no hace falta el centroide de masa,
 * que para polígonos cóncavos puede caer fuera del territorio).
 */
export function centroideDeFeature(
  f: Feature,
): { lng: number; lat: number } | null {
  const bb = bboxDeGeometria(f.geometry);
  if (!bb) return null;
  return { lng: (bb[0] + bb[2]) / 2, lat: (bb[1] + bb[3]) / 2 };
}

/** Geometría de centroide + bbox por código DANE de departamento. */
export interface GeoDepto {
  codigo: string;
  centro: { lng: number; lat: number };
  bbox: [number, number, number, number];
}

/**
 * Indexa centroide y bbox por código DANE a partir del FeatureCollection de
 * departamentos. El código se lee de la propiedad `DPTO` (2 dígitos).
 */
export function indexarGeoDeptos(
  features: Feature[],
): Map<string, GeoDepto> {
  const idx = new Map<string, GeoDepto>();
  for (const f of features) {
    const codigo = String(f.properties?.DPTO ?? "");
    if (!codigo) continue;
    const bbox = bboxDeGeometria(f.geometry);
    const centro = centroideDeFeature(f);
    if (!bbox || !centro) continue;
    idx.set(codigo, { codigo, centro, bbox });
  }
  return idx;
}
