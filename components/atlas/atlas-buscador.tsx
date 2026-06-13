"use client";

// components/atlas/atlas-buscador.tsx
// Buscador con autocompletado SIN geocoder externo: combina los nombres de
// departamentos (atlas-data, estáticos) y de ciudades (ciudades.json) ya
// disponibles. Al elegir, emite un destino de cámara (fly-to) al mapa.
// Se monta como overlay sobre el mapa dark; estética propia oscura para no
// pelear con el chrome claro AAA del resto de la vista.

import { useEffect, useMemo, useRef, useState } from "react";
import { Search, MapPin, Building2, X } from "lucide-react";
import { statsPorCodigo } from "./atlas-data";
import { useLang } from "@/lib/i18n";

/** Destino de cámara que el mapa interpreta con easeTo. */
export interface DestinoBusqueda {
  lng: number;
  lat: number;
  /** Zoom sugerido (ciudad más cerca que departamento). */
  zoom: number;
  /** Si es un departamento, su código DANE (para resaltarlo). */
  codigoDepto: string | null;
  etiqueta: string;
}

/** Una ciudad geocodificada (centroide municipal DANE). */
interface Ciudad {
  nombre: string;
  departamento: string;
  cod_dane_mpio: string;
  lat: number;
  lng: number;
  es_capital: boolean;
}

interface Opcion {
  tipo: "depto" | "ciudad";
  etiqueta: string;
  sub: string;
  lng: number;
  lat: number;
  zoom: number;
  codigoDepto: string | null;
  norm: string;
}

const COPIA = {
  es: {
    placeholder: "Busca tu departamento o municipio",
    depto: "Departamento",
    ciudad: "Municipio",
    limpiar: "Limpiar búsqueda",
  },
  en: {
    placeholder: "Search your department or municipality",
    depto: "Department",
    ciudad: "Municipality",
    limpiar: "Clear search",
  },
} as const;

/** Normaliza para buscar sin acentos ni mayúsculas. */
function norm(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

interface AtlasBuscadorProps {
  /** Centroides de departamentos por código DANE (los provee el mapa al cargar). */
  centroidesDepto: Map<string, { lng: number; lat: number }> | null;
  onElegir: (destino: DestinoBusqueda) => void;
}

export function AtlasBuscador({
  centroidesDepto,
  onElegir,
}: AtlasBuscadorProps) {
  const { lang } = useLang();
  const c = COPIA[lang];
  const [q, setQ] = useState("");
  const [abierto, setAbierto] = useState(false);
  const [activo, setActivo] = useState(0);
  const [ciudades, setCiudades] = useState<Ciudad[] | null>(null);
  const cajaRef = useRef<HTMLDivElement | null>(null);

  // Carga (una vez) de las ciudades para el autocompletado.
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

  // Cierra el desplegable al hacer click fuera.
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (cajaRef.current && !cajaRef.current.contains(e.target as Node)) {
        setAbierto(false);
      }
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  // Universo de opciones: departamentos (con centroide del mapa) + ciudades.
  const opciones = useMemo<Opcion[]>(() => {
    const out: Opcion[] = [];
    if (centroidesDepto) {
      for (const st of statsPorCodigo.values()) {
        const ctr = centroidesDepto.get(st.codigo);
        if (!ctr) continue;
        out.push({
          tipo: "depto",
          etiqueta: st.nombre,
          sub: c.depto,
          lng: ctr.lng,
          lat: ctr.lat,
          zoom: 6,
          codigoDepto: st.codigo,
          norm: norm(st.nombre),
        });
      }
    }
    if (ciudades) {
      for (const ci of ciudades) {
        out.push({
          tipo: "ciudad",
          etiqueta: ci.nombre,
          sub: `${c.ciudad} · ${ci.departamento}`,
          lng: ci.lng,
          lat: ci.lat,
          zoom: 8.5,
          // Resalta el departamento de la ciudad si lo conocemos (2 dígitos).
          codigoDepto: ci.cod_dane_mpio.slice(0, 2),
          norm: norm(ci.nombre),
        });
      }
    }
    return out;
  }, [centroidesDepto, ciudades, c.depto, c.ciudad]);

  // Filtrado: prioriza prefijo, luego inclusión. Máx. 8 resultados.
  const resultados = useMemo<Opcion[]>(() => {
    const nq = norm(q);
    if (!nq) return [];
    const prefijo: Opcion[] = [];
    const incluye: Opcion[] = [];
    for (const o of opciones) {
      if (o.norm.startsWith(nq)) prefijo.push(o);
      else if (o.norm.includes(nq)) incluye.push(o);
    }
    // Departamentos primero dentro de cada grupo (más relevantes que un caserío).
    const orden = (a: Opcion, b: Opcion) =>
      a.tipo === b.tipo ? 0 : a.tipo === "depto" ? -1 : 1;
    return [...prefijo.sort(orden), ...incluye.sort(orden)].slice(0, 8);
  }, [q, opciones]);

  function elegir(o: Opcion) {
    onElegir({
      lng: o.lng,
      lat: o.lat,
      zoom: o.zoom,
      codigoDepto: o.codigoDepto,
      etiqueta: o.etiqueta,
    });
    setQ(o.etiqueta);
    setAbierto(false);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!abierto && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      setAbierto(true);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActivo((i) => Math.min(i + 1, resultados.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActivo((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const o = resultados[activo];
      if (o) elegir(o);
    } else if (e.key === "Escape") {
      setAbierto(false);
    }
  }

  const mostrar = abierto && resultados.length > 0;

  return (
    <div ref={cajaRef} className="pointer-events-auto relative w-full">
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-[#8B949E]"
          aria-hidden
        />
        <input
          type="text"
          role="combobox"
          aria-label={c.placeholder}
          aria-expanded={mostrar}
          aria-controls="atlas-buscador-lista"
          aria-autocomplete="list"
          aria-activedescendant={
            mostrar && resultados[activo]
              ? `atlas-opcion-${activo}`
              : undefined
          }
          value={q}
          placeholder={c.placeholder}
          onChange={(e) => {
            setQ(e.target.value);
            setAbierto(true);
            setActivo(0);
          }}
          onFocus={() => setAbierto(true)}
          onKeyDown={onKeyDown}
          className="h-9 w-full rounded-lg border border-white/10 bg-[#161B22]/95 pl-8 pr-8 text-sm text-[#E6EDF3] shadow-lg outline-none backdrop-blur placeholder:text-[#6E7681] focus:border-[#2BD9C0]/60 focus:ring-1 focus:ring-[#2BD9C0]/40"
        />
        {q && (
          <button
            type="button"
            aria-label={c.limpiar}
            onClick={() => {
              setQ("");
              setAbierto(false);
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-[#8B949E] hover:text-[#E6EDF3]"
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>

      {mostrar && (
        <ul
          id="atlas-buscador-lista"
          role="listbox"
          className="absolute z-30 mt-1.5 max-h-64 w-full overflow-auto rounded-lg border border-white/10 bg-[#161B22]/97 py-1 shadow-2xl backdrop-blur"
        >
          {resultados.map((o, i) => {
            const sel = i === activo;
            const Icono = o.tipo === "depto" ? MapPin : Building2;
            return (
              <li
                key={`${o.tipo}-${o.etiqueta}-${i}`}
                id={`atlas-opcion-${i}`}
                role="option"
                aria-selected={sel}
              >
                <button
                  type="button"
                  onMouseEnter={() => setActivo(i)}
                  onClick={() => elegir(o)}
                  className={`flex w-full items-center gap-2.5 px-2.5 py-1.5 text-left text-sm ${
                    sel ? "bg-[#2BD9C0]/15 text-[#E6EDF3]" : "text-[#C9D1D9]"
                  }`}
                >
                  <Icono
                    className={`size-3.5 shrink-0 ${
                      o.tipo === "depto" ? "text-[#2BD9C0]" : "text-[#8B949E]"
                    }`}
                    aria-hidden
                  />
                  <span className="flex min-w-0 flex-col">
                    <span className="truncate font-medium">{o.etiqueta}</span>
                    <span className="truncate text-[10px] text-[#8B949E]">
                      {o.sub}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default AtlasBuscador;
