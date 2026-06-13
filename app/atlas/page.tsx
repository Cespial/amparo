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
    // Chrome claro AAA (fondo lavanda heredado del body, texto foreground) — el
    // MAPA por dentro sigue siendo dark, enmarcado en tarjetas blancas.
    <div className="min-h-full text-foreground">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10">
        <AtlasPageClient />
      </div>
    </div>
  );
}
