// app/page.tsx — Landing (server wrapper).
// La página es estática pero la copia es bilingüe (useT requiere cliente).
// Patrón: este server component conserva el `metadata` export —que un page
// "use client" no puede tener en Next 16— y delega el render en LandingClient.
// La metadata permanece en español (idioma por defecto / SEO base); el cambio
// de idioma en runtime se hace vía el contexto de i18n en el cliente.

import type { Metadata } from "next";
import { LandingClient } from "./landing-client";

export const metadata: Metadata = {
  title: "Amparo — La justicia en salud, al alcance de todos",
  description:
    "Plataforma ODR de tutelas de salud de Colombia. Resuelve lo que tu EPS te negó —rápido, gratis y con respaldo en la jurisprudencia de la Corte Constitucional.",
};

export default function Home() {
  return <LandingClient />;
}
