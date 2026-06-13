// components/atlas/atlas-data.ts
// Utilidades de datos del Atlas: join estadísticas ↔ GeoJSON, escala de color,
// KPIs nacionales. SIN llamadas de red (el GeoJSON se carga vía fetch local).

import type { EstadisticaDepartamento } from "@/lib/types";
import { estadisticasDepartamentos } from "@/lib/seed";

/** Métrica activa del coroplético. */
export type MetricaAtlas = "tasaPor10k" | "totalTutelas" | "porcentajeFavorable";

export const METRICAS: Record<
  MetricaAtlas,
  { etiqueta: string; sufijo: string; descripcion: string }
> = {
  tasaPor10k: {
    etiqueta: "Tasa por 10.000 hab.",
    sufijo: "",
    descripcion: "Tutelas de salud por cada 10.000 habitantes",
  },
  totalTutelas: {
    etiqueta: "Total de tutelas",
    sufijo: "",
    descripcion: "Tutelas de salud radicadas al año",
  },
  porcentajeFavorable: {
    etiqueta: "% concedidas",
    sufijo: "%",
    descripcion: "Porcentaje de fallos favorables al accionante",
  },
};

/** Índice de estadísticas por código DANE. */
export const statsPorCodigo: Map<string, EstadisticaDepartamento> = new Map(
  estadisticasDepartamentos.map((e) => [e.codigo, e]),
);

/**
 * Rampa de color secuencial lavanda → rojo ladrillo institucional.
 * 6 paradas. Departamentos sin dato usan el color "vacío".
 */
export const RAMPA: string[] = [
  "#E6E9FA", // lavanda muy claro (menor)
  "#F3D9CF",
  "#E6A99A",
  "#D87B69",
  "#C0392B",
  "#8E2018", // rojo profundo (mayor)
];

export const COLOR_SIN_DATO = "#EDEFF8";

/** Devuelve [min, max] de una métrica sobre el seed. */
export function rangoMetrica(metrica: MetricaAtlas): [number, number] {
  const vals = estadisticasDepartamentos.map((e) => e[metrica]);
  return [Math.min(...vals), Math.max(...vals)];
}

/** Color de un valor dado el rango, usando la rampa discreta de 6 pasos. */
export function colorDeValor(
  valor: number | undefined,
  [min, max]: [number, number],
): string {
  if (valor === undefined || Number.isNaN(valor)) return COLOR_SIN_DATO;
  if (max === min) return RAMPA[RAMPA.length - 1];
  const t = (valor - min) / (max - min);
  const idx = Math.min(RAMPA.length - 1, Math.floor(t * RAMPA.length));
  return RAMPA[idx];
}

/** Umbrales legibles de la leyenda (5 cortes → 6 bandas). */
export function umbralesLeyenda(metrica: MetricaAtlas): number[] {
  const [min, max] = rangoMetrica(metrica);
  const paso = (max - min) / RAMPA.length;
  return Array.from({ length: RAMPA.length - 1 }, (_, i) =>
    Math.round(min + paso * (i + 1)),
  );
}

/** Formatea números grandes con separador de miles (es-CO). */
export function fmt(n: number): string {
  return n.toLocaleString("es-CO");
}

/**
 * Expresión MapLibre `interpolate` para colorear por una propiedad numérica
 * inyectada en el GeoJSON (`__valor`). Devuelve una expresión de estilo.
 */
export function expresionColor(metrica: MetricaAtlas): unknown[] {
  const [min, max] = rangoMetrica(metrica);
  const paso = (max - min) / (RAMPA.length - 1);
  const stops: (string | number)[] = [];
  for (let i = 0; i < RAMPA.length; i++) {
    stops.push(min + paso * i, RAMPA[i]);
  }
  return [
    "interpolate",
    ["linear"],
    ["coalesce", ["get", "__valor"], -1],
    -1,
    COLOR_SIN_DATO,
    ...stops,
  ];
}

/** KPIs nacionales agregados (ilustrativos) + casos resueltos sin juez del store. */
export interface KpiNacional {
  totalTutelasAnio: number;
  porcentajeConcedidas: number;
  diasPromedioFallo: number;
}

export function kpisNacionales(): KpiNacional {
  const total = estadisticasDepartamentos.reduce(
    (s, e) => s + e.totalTutelas,
    0,
  );
  const favPromedio =
    estadisticasDepartamentos.reduce((s, e) => s + e.porcentajeFavorable, 0) /
    estadisticasDepartamentos.length;
  // Extrapolación ilustrativa al total nacional (~660k tutelas de salud/año).
  const totalNacional = Math.round(total * 1.65);
  return {
    totalTutelasAnio: totalNacional,
    porcentajeConcedidas: Math.round(favPromedio),
    diasPromedioFallo: 10,
  };
}
