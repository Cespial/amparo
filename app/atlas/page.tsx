import type { Metadata } from "next";
import { AtlasPageClient } from "./atlas-page-client";

// Server component delgado: conserva la metadata (un page "use client" no puede
// exportarla en Next 16). La metadata permanece en español (SEO / idioma por
// defecto); la copia visible se externaliza al cliente AtlasPageClient.
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
        <AtlasPageClient />
      </div>
    </div>
  );
}
