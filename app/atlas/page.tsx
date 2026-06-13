import type { Metadata } from "next";
import { AtlasShell } from "@/components/atlas/atlas-shell";

export const metadata: Metadata = {
  title: "Atlas de tutelas en salud",
  description:
    "Mapa de Colombia con la magnitud de las tutelas de salud por departamento.",
};

export default function AtlasPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10">
      {/* Titular gancho — Acto I del pitch */}
      <header className="mb-6 max-w-3xl">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          El mapa del problema
        </p>
        <h1 className="font-heading text-3xl font-semibold leading-tight tracking-tight text-balance sm:text-4xl lg:text-[2.75rem]">
          Colombia presenta una tutela de salud cada minuto.
        </h1>
        <p className="mt-3 text-base leading-relaxed text-muted-foreground sm:text-lg text-pretty">
          El{" "}
          <span className="font-semibold text-foreground">
            80% de las tutelas de salud se ganan
          </span>
          … porque pedían algo que{" "}
          <span className="font-semibold text-foreground">
            ya era su derecho.
          </span>{" "}
          Amparo lo resuelve antes de que un juez tenga que ordenarlo.
        </p>
      </header>

      <AtlasShell />

      <footer className="mt-8 max-w-3xl text-xs leading-relaxed text-muted-foreground/80">
        <p>
          * Las cifras por departamento y los agregados nacionales son
          ilustrativos y se presentan únicamente para fines de visualización del
          demo; no constituyen estadística oficial. Cartografía:{" "}
          <span className="font-mono">colombia-departamentos.geojson</span>{" "}
          (33 departamentos, códigos DANE).
        </p>
      </footer>
    </div>
  );
}
