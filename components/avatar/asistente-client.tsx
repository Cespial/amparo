"use client";

// Envoltura client-only del asistente. El avatar audio-reactive y el flujo de
// conversación usan valores no deterministas (Math.random en el orbe, IDs/fechas
// en handlers), así que se renderiza SOLO en cliente para evitar cualquier
// desajuste de hidratación (React #418) en la página estrella.
import dynamic from "next/dynamic";

const AsistenteAmparo = dynamic(
  () => import("./asistente-amparo").then((m) => m.AsistenteAmparo),
  {
    ssr: false,
    loading: () => (
      <div
        className="min-h-[60vh] w-full animate-pulse rounded-2xl"
        aria-busy="true"
      />
    ),
  },
);

export function AsistenteClient() {
  return <AsistenteAmparo />;
}
