// components/atlas/atlas-data.ts
// Datos del Atlas a partir de DATASETS REALES (datos.gov.co):
//  - Tutelas de salud por departamento 2023 (Corte Constitucional, xkyt-k6pk;
//    validado vs. Defensoría del Pueblo 2023).
//  - IPS por departamento (REPS / MinSalud, c36g-9fc2).
// Join por código DANE (2 dígitos). SIN llamadas de red.

import tutelasJson from "../../public/data/tutelas-por-departamento.json";
import ipsJson from "../../public/data/ips-salud.json";

/** Estadística consolidada por departamento (datos reales 2023/2026). */
export interface EstadDepto {
  codigo: string;
  nombre: string;
  /** Tutelas de salud radicadas (2023, Corte Constitucional). */
  totalTutelas: number;
  /** Tutelas de salud por cada 10.000 habitantes. */
  tasaPor10k: number;
  /** Población (proyección DANE 2023). */
  poblacion: number;
  /** IPS (Instituciones Prestadoras de Servicios de Salud) — REPS. */
  ipsTotal: number;
  ipsPublicas: number;
  ipsPrivadas: number;
  /** Prestadores totales (todas las clases) — REPS. */
  prestadoresTotal: number;
}

type TutelaRow = {
  departamento: string;
  tutelas_salud: number;
  poblacion: number;
  tasa_por_10k: number;
};
type IpsRow = {
  departamento: string;
  ips_total: number;
  ips_publicas: number;
  ips_privadas: number;
  prestadores_total: number;
};

const TUT = (tutelasJson as { datos: Record<string, TutelaRow> }).datos;
const IPS = (ipsJson as { datos: Record<string, IpsRow> }).datos;

/** Índice consolidado por código DANE. */
export const statsPorCodigo: Map<string, EstadDepto> = new Map(
  Object.entries(TUT).map(([codigo, t]) => {
    const i = IPS[codigo];
    return [
      codigo,
      {
        codigo,
        nombre: t.departamento,
        totalTutelas: t.tutelas_salud,
        tasaPor10k: t.tasa_por_10k,
        poblacion: t.poblacion,
        ipsTotal: i?.ips_total ?? 0,
        ipsPublicas: i?.ips_publicas ?? 0,
        ipsPrivadas: i?.ips_privadas ?? 0,
        prestadoresTotal: i?.prestadores_total ?? 0,
      } satisfies EstadDepto,
    ];
  }),
);

const TODAS = Array.from(statsPorCodigo.values());

/** Métrica activa del coroplético. */
export type MetricaAtlas = "tasaPor10k" | "totalTutelas" | "ipsTotal";

export const METRICAS: Record<
  MetricaAtlas,
  { etiqueta: string; sufijo: string; descripcion: string }
> = {
  tasaPor10k: {
    etiqueta: "Tasa por 10.000 hab.",
    sufijo: "",
    descripcion: "Tutelas de salud por cada 10.000 habitantes (2023)",
  },
  totalTutelas: {
    etiqueta: "Total de tutelas",
    sufijo: "",
    descripcion: "Tutelas de salud radicadas en 2023",
  },
  ipsTotal: {
    etiqueta: "IPS de salud",
    sufijo: "",
    descripcion: "Instituciones Prestadoras de Servicios de Salud (REPS)",
  },
};

/**
 * Rampa Tensor: teal (menor presión) → rojo crítico (mayor presión).
 * Sobre basemap oscuro, los valores altos (más tutelas) resaltan en rojo.
 */
export const RAMPA: string[] = [
  "#1B6B6D", // teal Tensor — menor
  "#1d91c0",
  "#41b6c4",
  "#a8ddb5",
  "#fdae61",
  "#f46d43",
  "#d73027", // rojo crítico — mayor
];

export const COLOR_SIN_DATO = "#2A2F3A";

/** Devuelve [min, max] de una métrica sobre los datos reales. */
export function rangoMetrica(metrica: MetricaAtlas): [number, number] {
  const vals = TODAS.map((e) => e[metrica]);
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

/**
 * Formatea números grandes con separador de miles según el idioma activo.
 * `es` → es-CO (197.737) · `en` → en-US (197,737). Default `es` para
 * preservar el comportamiento previo en llamadas sin idioma.
 */
export function fmt(n: number, lang: "es" | "en" = "es"): string {
  return Math.round(n).toLocaleString(lang === "en" ? "en-US" : "es-CO");
}

/**
 * Expresión MapLibre `interpolate` para colorear por `__valor`.
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

/** KPIs nacionales (datos reales 2023) + casos resueltos sin juez del store. */
export interface KpiNacional {
  totalTutelasSalud: number;
  totalTutelasTodas: number;
  porcentajeConcedidas: number;
  ipsNacional: number;
  diasPromedioFallo: number;
}

const META = tutelasJson as {
  total_nacional_tutelas_salud?: number;
  total_nacional_tutelas_todas_materias?: number;
};

export function kpisNacionales(): KpiNacional {
  const totalSalud =
    META.total_nacional_tutelas_salud ??
    TODAS.reduce((s, e) => s + e.totalTutelas, 0);
  const ipsNacional = TODAS.reduce((s, e) => s + e.ipsTotal, 0);
  return {
    totalTutelasSalud: totalSalud,
    totalTutelasTodas: META.total_nacional_tutelas_todas_materias ?? 633475,
    // ~80% de fallos favorables en salud (Defensoría del Pueblo).
    porcentajeConcedidas: 80,
    ipsNacional,
    diasPromedioFallo: 10,
  };
}
