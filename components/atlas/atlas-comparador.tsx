"use client";

// components/atlas/atlas-comparador.tsx
// Comparador A vs B de departamentos (chrome CLARO AAA, tarjeta blanca dentro de
// un Dialog). Dos selectores (Departamento A / Departamento B), un RADAR SVG
// propio (sin librerías) sobre 5 ejes normalizados [0..1] respecto al máximo
// nacional, y una tabla numérica A vs B con la diferencia.
//
// Accesibilidad: el radar es decorativo (aria-hidden) — TODA la información está
// también en la tabla A/B/Δ, navegable por lectores de pantalla. Bilingüe vía
// dict LOCAL (no toca lib/i18n; sólo useLang para el idioma activo).

import { useId, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { GitCompareArrows } from "lucide-react";
import { statsPorCodigo, fmt, type EstadDepto } from "./atlas-data";
import { useLang } from "@/lib/i18n";

const COPIA = {
  es: {
    abrir: "Comparar",
    titulo: "Comparar departamentos",
    descripcion:
      "Compara dos departamentos en cinco dimensiones de presión y oferta en salud. Útil para leer la inequidad territorial.",
    deptoA: "Departamento A",
    deptoB: "Departamento B",
    eje: "Dimensión",
    columnaA: "A",
    columnaB: "B",
    diferencia: "Diferencia (A − B)",
    nota: "Valores 2023. El radar normaliza cada eje al máximo nacional (1,0 = el departamento más alto del país en esa dimensión). Los datos también están en la tabla.",
    radarAria:
      "Radar comparativo: cada vértice es una dimensión normalizada al máximo nacional.",
    mejorPista: "El radar es ilustrativo; los valores exactos están en la tabla.",
    igual: "—",
  },
  en: {
    abrir: "Compare",
    titulo: "Compare departments",
    descripcion:
      "Compare two departments across five dimensions of health pressure and supply. Useful for reading territorial inequity.",
    deptoA: "Department A",
    deptoB: "Department B",
    eje: "Dimension",
    columnaA: "A",
    columnaB: "B",
    diferencia: "Difference (A − B)",
    nota: "2023 values. The radar normalizes each axis to the national maximum (1.0 = the country's highest department on that dimension). The data is also in the table.",
    radarAria:
      "Comparative radar: each vertex is a dimension normalized to the national maximum.",
    mejorPista: "The radar is illustrative; exact values are in the table.",
    igual: "—",
  },
} as const;

/** Ejes del radar: 5 dimensiones derivadas de EstadDepto. */
type ValorDe = (e: EstadDepto) => number;
interface Eje {
  clave: string;
  etiqueta: { es: string; en: string };
  valor: ValorDe;
  /** Formatea el valor para la tabla. */
  fmt: (v: number) => string;
}

const PCT = (v: number) => `${v.toFixed(0)}%`;

const EJES: Eje[] = [
  {
    clave: "tasaPor10k",
    etiqueta: { es: "Tasa / 10k hab.", en: "Rate / 10k pop." },
    valor: (e) => e.tasaPor10k,
    fmt: (v) => fmt(v),
  },
  {
    clave: "totalTutelas",
    etiqueta: { es: "Total tutelas", en: "Total writs" },
    valor: (e) => e.totalTutelas,
    fmt: (v) => fmt(v),
  },
  {
    clave: "ipsTotal",
    etiqueta: { es: "IPS totales", en: "Total IPS" },
    valor: (e) => e.ipsTotal,
    fmt: (v) => fmt(v),
  },
  {
    clave: "pctRedPublica",
    etiqueta: { es: "% red pública", en: "% public network" },
    valor: (e) => (e.ipsTotal ? (e.ipsPublicas / e.ipsTotal) * 100 : 0),
    fmt: PCT,
  },
  {
    clave: "prestadoresTotal",
    etiqueta: { es: "Prestadores", en: "Providers" },
    valor: (e) => e.prestadoresTotal,
    fmt: (v) => fmt(v),
  },
];

/** Máximo nacional por eje, para normalizar [0..1]. */
function maximosNacionales(deptos: EstadDepto[]): number[] {
  return EJES.map((eje) => {
    const m = Math.max(...deptos.map((d) => eje.valor(d)));
    return m > 0 ? m : 1;
  });
}

/** Colores de marca para A (teal Tensor) y B (rojo crítico de la rampa). */
const COLOR_A = "#1B6B6D";
const COLOR_B = "#d73027";

interface AtlasComparadorProps {
  /** Código DANE preseleccionado para A (p.ej. el departamento activo en el mapa). */
  preseleccionA?: string | null;
}

export function AtlasComparador({ preseleccionA }: AtlasComparadorProps) {
  const { lang } = useLang();
  const c = COPIA[lang];

  const deptos = useMemo(
    () =>
      Array.from(statsPorCodigo.values()).sort((a, b) =>
        a.nombre.localeCompare(b.nombre, "es"),
      ),
    [],
  );

  // Defaults útiles a la narrativa de inequidad: Antioquia (05) vs Chocó (27)
  // si existen; si no, los dos primeros. La preselección (mapa) gana para A.
  const defA =
    (preseleccionA && statsPorCodigo.has(preseleccionA)
      ? preseleccionA
      : statsPorCodigo.has("05")
        ? "05"
        : deptos[0]?.codigo) ?? "";
  const defB =
    (statsPorCodigo.has("27") && "27" !== defA
      ? "27"
      : deptos.find((d) => d.codigo !== defA)?.codigo) ?? "";

  const [abierto, setAbierto] = useState(false);
  const [a, setA] = useState<string>(defA);
  const [b, setB] = useState<string>(defB);

  const stA = statsPorCodigo.get(a);
  const stB = statsPorCodigo.get(b);
  const maximos = useMemo(() => maximosNacionales(deptos), [deptos]);

  return (
    <>
      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={() => {
          // Re-sincroniza A con la preselección del mapa cada vez que se abre.
          if (preseleccionA && statsPorCodigo.has(preseleccionA)) {
            setA(preseleccionA);
            if (preseleccionA === b) {
              const otro = deptos.find((d) => d.codigo !== preseleccionA);
              if (otro) setB(otro.codigo);
            }
          }
          setAbierto(true);
        }}
        className="h-8 gap-1.5 border border-border bg-secondary px-2.5 text-xs text-foreground hover:border-primary/40 hover:bg-accent"
      >
        <GitCompareArrows className="size-3.5" aria-hidden />
        {c.abrir}
      </Button>

      <Dialog open={abierto} onOpenChange={setAbierto}>
        <DialogContent className="max-h-[88vh] w-full max-w-[calc(100%-1.5rem)] overflow-auto bg-card text-foreground ring-foreground/10 sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-heading text-lg font-semibold text-foreground">
              {c.titulo}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              {c.descripcion}
            </DialogDescription>
          </DialogHeader>

          {/* Selectores A / B. Nativos por robustez + a11y; estilo AAA claro. */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <SelectorDepto
              etiqueta={c.deptoA}
              color={COLOR_A}
              valor={a}
              onChange={setA}
              deptos={deptos}
            />
            <SelectorDepto
              etiqueta={c.deptoB}
              color={COLOR_B}
              valor={b}
              onChange={setB}
              deptos={deptos}
            />
          </div>

          {stA && stB && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-[minmax(0,220px)_minmax(0,1fr)] sm:items-center">
              <RadarComparativo
                stA={stA}
                stB={stB}
                maximos={maximos}
                lang={lang}
                ariaLabel={c.radarAria}
              />

              <TablaComparativa stA={stA} stB={stB} c={c} lang={lang} />
            </div>
          )}

          <p className="text-[10px] leading-tight text-muted-foreground">
            {c.nota}
          </p>
        </DialogContent>
      </Dialog>
    </>
  );
}

/** Selector nativo de departamento con punto de color (A/B). */
function SelectorDepto({
  etiqueta,
  color,
  valor,
  onChange,
  deptos,
}: {
  etiqueta: string;
  color: string;
  valor: string;
  onChange: (v: string) => void;
  deptos: EstadDepto[];
}) {
  const id = useId();
  return (
    <label htmlFor={id} className="flex flex-col gap-1">
      <span className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        <span
          aria-hidden
          className="size-2.5 rounded-full"
          style={{ backgroundColor: color }}
        />
        {etiqueta}
      </span>
      <select
        id={id}
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 w-full rounded-lg border border-border bg-secondary px-2.5 text-sm text-foreground outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30"
      >
        {deptos.map((d) => (
          <option key={d.codigo} value={d.codigo}>
            {d.nombre}
          </option>
        ))}
      </select>
    </label>
  );
}

/** Radar SVG propio (pentágono) — decorativo; los datos están en la tabla. */
function RadarComparativo({
  stA,
  stB,
  maximos,
  lang,
  ariaLabel,
}: {
  stA: EstadDepto;
  stB: EstadDepto;
  maximos: number[];
  lang: "es" | "en";
  ariaLabel: string;
}) {
  const SIZE = 200;
  const C = SIZE / 2;
  const R = 74; // radio del eje completo (valor normalizado = 1)
  const n = EJES.length;

  // Punto del eje i a un factor t (0..1) del radio.
  function punto(i: number, t: number): [number, number] {
    const ang = (Math.PI * 2 * i) / n - Math.PI / 2; // arranca arriba
    return [C + Math.cos(ang) * R * t, C + Math.sin(ang) * R * t];
  }

  const norm = (st: EstadDepto) =>
    EJES.map((eje, i) => Math.min(1, eje.valor(st) / maximos[i]));

  const polígono = (vals: number[]) =>
    vals.map((v, i) => punto(i, v).join(",")).join(" ");

  const valsA = norm(stA);
  const valsB = norm(stB);

  // Anillos de referencia (0.25, 0.5, 0.75, 1.0).
  const anillos = [0.25, 0.5, 0.75, 1];

  return (
    <svg
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      className="mx-auto h-auto w-full max-w-[220px]"
      role="img"
      aria-label={ariaLabel}
    >
      {/* Rejilla: anillos concéntricos. */}
      {anillos.map((t) => (
        <polygon
          key={t}
          points={Array.from({ length: n }, (_, i) =>
            punto(i, t).join(","),
          ).join(" ")}
          fill="none"
          stroke="var(--border)"
          strokeWidth={t === 1 ? 1 : 0.6}
        />
      ))}
      {/* Radios + etiquetas de eje. */}
      {EJES.map((eje, i) => {
        const [x, y] = punto(i, 1);
        const [lx, ly] = punto(i, 1.18);
        const anchor =
          Math.abs(lx - C) < 6 ? "middle" : lx > C ? "start" : "end";
        return (
          <g key={eje.clave}>
            <line
              x1={C}
              y1={C}
              x2={x}
              y2={y}
              stroke="var(--border)"
              strokeWidth={0.6}
            />
            <text
              x={lx}
              y={ly}
              textAnchor={anchor}
              dominantBaseline="middle"
              className="fill-muted-foreground"
              style={{ fontSize: 7.5 }}
            >
              {eje.etiqueta[lang]}
            </text>
          </g>
        );
      })}
      {/* Polígono B (debajo) y A (encima), translúcidos. */}
      <polygon
        points={polígono(valsB)}
        fill={COLOR_B}
        fillOpacity={0.18}
        stroke={COLOR_B}
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
      <polygon
        points={polígono(valsA)}
        fill={COLOR_A}
        fillOpacity={0.22}
        stroke={COLOR_A}
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
      {/* Vértices. */}
      {valsB.map((v, i) => {
        const [x, y] = punto(i, v);
        return <circle key={`b${i}`} cx={x} cy={y} r={1.8} fill={COLOR_B} />;
      })}
      {valsA.map((v, i) => {
        const [x, y] = punto(i, v);
        return <circle key={`a${i}`} cx={x} cy={y} r={1.8} fill={COLOR_A} />;
      })}
    </svg>
  );
}

/** Tabla numérica A vs B con la diferencia (la fuente accesible de la verdad). */
function TablaComparativa({
  stA,
  stB,
  c,
  lang,
}: {
  stA: EstadDepto;
  stB: EstadDepto;
  c: (typeof COPIA)[keyof typeof COPIA];
  lang: "es" | "en";
}) {
  return (
    <div className="overflow-hidden rounded-[var(--radius-md)] border border-border">
      {/* Cabecera con nombres A/B coloreados. */}
      <div className="grid grid-cols-[minmax(0,1fr)_auto_auto_auto] items-center gap-2 border-b border-border bg-secondary px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        <span>{c.eje}</span>
        <span className="text-right" style={{ color: COLOR_A }}>
          {stA.nombre}
        </span>
        <span className="text-right" style={{ color: COLOR_B }}>
          {stB.nombre}
        </span>
        <span className="text-right">Δ</span>
      </div>
      <table className="w-full">
        <caption className="sr-only">
          {c.titulo}: {stA.nombre} ({c.columnaA}), {stB.nombre} ({c.columnaB}),{" "}
          {c.diferencia}
        </caption>
        <thead className="sr-only">
          <tr>
            <th scope="col">{c.eje}</th>
            <th scope="col">{stA.nombre}</th>
            <th scope="col">{stB.nombre}</th>
            <th scope="col">{c.diferencia}</th>
          </tr>
        </thead>
        <tbody>
          {EJES.map((eje) => {
            const va = eje.valor(stA);
            const vb = eje.valor(stB);
            const d = va - vb;
            const dTxt =
              d === 0 ? c.igual : `${d > 0 ? "+" : "−"}${eje.fmt(Math.abs(d))}`;
            return (
              <tr
                key={eje.clave}
                className="grid grid-cols-[minmax(0,1fr)_auto_auto_auto] items-center gap-2 border-b border-border px-2.5 py-1.5 last:border-0"
              >
                <th
                  scope="row"
                  className="truncate text-left text-xs font-medium text-foreground"
                >
                  {eje.etiqueta[lang]}
                </th>
                <td className="text-right font-mono tabular-nums text-xs text-foreground">
                  {eje.fmt(va)}
                </td>
                <td className="text-right font-mono tabular-nums text-xs text-foreground">
                  {eje.fmt(vb)}
                </td>
                <td
                  className="text-right font-mono tabular-nums text-xs font-semibold"
                  style={{
                    color:
                      d === 0
                        ? "var(--muted-foreground)"
                        : d > 0
                          ? COLOR_A
                          : COLOR_B,
                  }}
                >
                  {dTxt}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default AtlasComparador;
