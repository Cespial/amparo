"use client";

// components/atlas/atlas-acciones.tsx
// Acciones de credibilidad/pulido del Atlas (chrome CLARO AAA):
//  - "Descargar datos": baja el dataset visible (la métrica activa por
//    departamento) como CSV generado en cliente con un Blob. Suma credibilidad
//    ("descarga el dataset oficial").
//  - "Compartir": copia al portapapeles la URL del atlas con el estado actual
//    (métrica + departamento) en query params, para reproducir la vista.
//
// Bilingüe vía dict LOCAL (no toca lib/i18n; sólo useLang). Sin librerías ni red.

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Share2, Check } from "lucide-react";
import { statsPorCodigo, type MetricaAtlas } from "./atlas-data";
import { useLang } from "@/lib/i18n";

const COPIA = {
  es: {
    descargar: "Descargar datos",
    descargado: "Descargado",
    compartir: "Compartir",
    copiado: "Enlace copiado",
    descargarAria: "Descargar el dataset visible en formato CSV",
    compartirAria: "Copiar el enlace de esta vista del atlas",
  },
  en: {
    descargar: "Download data",
    descargado: "Downloaded",
    compartir: "Share",
    copiado: "Link copied",
    descargarAria: "Download the visible dataset as CSV",
    compartirAria: "Copy the link to this atlas view",
  },
} as const;

/** Encabezados del CSV (estables, independientes del idioma de la vista). */
const CABECERAS = [
  "codigo_dane",
  "departamento",
  "total_tutelas",
  "tasa_por_10k",
  "poblacion",
  "ips_total",
  "ips_publicas",
  "ips_privadas",
  "prestadores_total",
] as const;

/** Escapa un campo CSV (comillas, comas, saltos de línea). */
function csvCampo(v: string | number): string {
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/** Serializa todos los departamentos a CSV, ordenados por la métrica activa. */
function construirCsv(metrica: MetricaAtlas): string {
  const filas = Array.from(statsPorCodigo.values()).sort(
    (a, b) => b[metrica] - a[metrica],
  );
  const lineas = [CABECERAS.join(",")];
  for (const e of filas) {
    lineas.push(
      [
        e.codigo,
        e.nombre,
        e.totalTutelas,
        e.tasaPor10k,
        e.poblacion,
        e.ipsTotal,
        e.ipsPublicas,
        e.ipsPrivadas,
        e.prestadoresTotal,
      ]
        .map(csvCampo)
        .join(","),
    );
  }
  // BOM para que Excel (es-CO) lea bien los acentos.
  return "﻿" + lineas.join("\r\n");
}

/** Construye la URL de esta vista con métrica + depto en query params. */
function construirUrl(metrica: MetricaAtlas, seleccionado: string | null): string {
  if (typeof window === "undefined") return "";
  const url = new URL(window.location.href);
  url.searchParams.set("metrica", metrica);
  if (seleccionado && statsPorCodigo.has(seleccionado)) {
    url.searchParams.set("depto", seleccionado);
  } else {
    url.searchParams.delete("depto");
  }
  return url.toString();
}

interface AtlasAccionesProps {
  metrica: MetricaAtlas;
  seleccionado: string | null;
}

export function AtlasAcciones({ metrica, seleccionado }: AtlasAccionesProps) {
  const { lang } = useLang();
  const c = COPIA[lang];
  const [descargado, setDescargado] = useState(false);
  const [copiado, setCopiado] = useState(false);

  function descargar() {
    const csv = construirCsv(metrica);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const href = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = href;
    a.download = `atlas-tutelas-salud-${metrica}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(href);
    setDescargado(true);
    window.setTimeout(() => setDescargado(false), 2000);
  }

  async function compartir() {
    const url = construirUrl(metrica, seleccionado);
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        // Fallback sin Clipboard API.
        const ta = document.createElement("textarea");
        ta.value = url;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        ta.remove();
      }
      // Refleja el estado en la barra de direcciones (sin recargar).
      if (typeof window !== "undefined") {
        window.history.replaceState(null, "", url);
      }
      setCopiado(true);
      window.setTimeout(() => setCopiado(false), 2000);
    } catch {
      // Silencioso: si falla el portapapeles, no rompemos la vista.
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={descargar}
        aria-label={c.descargarAria}
        className="h-8 gap-1.5 border border-border bg-secondary px-2.5 text-xs text-foreground hover:border-primary/40 hover:bg-accent"
      >
        {descargado ? (
          <Check className="size-3.5 text-[var(--success)]" aria-hidden />
        ) : (
          <Download className="size-3.5" aria-hidden />
        )}
        {descargado ? c.descargado : c.descargar}
      </Button>

      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={compartir}
        aria-label={c.compartirAria}
        className="h-8 gap-1.5 border border-border bg-secondary px-2.5 text-xs text-foreground hover:border-primary/40 hover:bg-accent"
      >
        {copiado ? (
          <Check className="size-3.5 text-[var(--success)]" aria-hidden />
        ) : (
          <Share2 className="size-3.5" aria-hidden />
        )}
        {copiado ? c.copiado : c.compartir}
      </Button>

      {/* Aviso accesible del estado de la acción para lectores de pantalla. */}
      <span aria-live="polite" className="sr-only">
        {copiado ? c.copiado : descargado ? c.descargado : ""}
      </span>
    </div>
  );
}

export default AtlasAcciones;
