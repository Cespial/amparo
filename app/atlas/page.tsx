import type { Metadata } from "next";
import { AtlasShell } from "@/components/atlas/atlas-shell";

export const metadata: Metadata = {
  title: "Atlas de tutelas en salud",
  description:
    "Mapa de Colombia con la magnitud de las tutelas de salud por departamento.",
};

export default function AtlasPage() {
  return (
    // Control room oscuro (estética Tensor) — contrasta a propósito con la app AAA clara.
    <div className="min-h-full bg-[#0D1117] text-[#E6EDF3]">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10">
        {/* Titular gancho — Acto I del pitch, sobre tarjeta glow dark */}
        <header className="glow-card glow-card--teal mb-5 max-w-3xl p-5 sm:mb-6 sm:p-7">
          <p className="mb-2 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#1B6B6D]">
            <span
              className="size-1.5 rounded-full bg-[#1B6B6D] shadow-[0_0_8px_2px_rgba(27,107,109,0.7)]"
              aria-hidden
            />
            El mapa del problema
          </p>
          <h1 className="font-heading text-3xl font-semibold leading-tight tracking-tight text-balance text-[#E6EDF3] sm:text-4xl lg:text-[2.75rem]">
            Colombia presenta una tutela de salud cada minuto.
          </h1>
          <p className="mt-3 text-base leading-relaxed text-[#8B949E] sm:text-lg text-pretty">
            El{" "}
            <span className="font-semibold text-[#E6EDF3]">
              80% de las tutelas de salud se ganan
            </span>
            … porque pedían algo que{" "}
            <span className="font-semibold text-[#E6EDF3]">
              ya era su derecho.
            </span>{" "}
            Amparo lo resuelve antes de que un juez tenga que ordenarlo.
          </p>
        </header>

        <AtlasShell />

        <footer className="mt-8 max-w-3xl text-xs leading-relaxed text-[#8B949E]/80">
          <p>
            * Las cifras por departamento y los agregados nacionales son
            ilustrativos y se presentan únicamente para fines de visualización
            del demo; no constituyen estadística oficial. Cartografía:{" "}
            <span className="glow-num">colombia-departamentos.geojson</span> (33
            departamentos, códigos DANE).
          </p>
        </footer>
      </div>
    </div>
  );
}
