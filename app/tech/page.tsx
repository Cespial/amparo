import type { Metadata } from "next";
import { TechPage } from "@/components/tech/tech-page";

// Página oculta (no enlazada en el nav). Accesible en /tech.
export const metadata: Metadata = {
  title: "Cómo lo construimos · Amparo",
  description:
    "Stack tecnológico y arquitectura de Amparo — Next.js 16, Claude (AI SDK), ElevenLabs, MapLibre, datos.gov.co.",
  robots: { index: false, follow: false },
};

export default function Tech() {
  return <TechPage />;
}
