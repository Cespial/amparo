import type { Metadata } from "next";
import { AsistenteClient } from "@/components/avatar/asistente-client";

export const metadata: Metadata = {
  title: "Asistente · Amparo",
  description:
    "Habla con Amparo. Te saluda, te hace una pregunta a la vez y arma tu caso por ti — sin lenguaje jurídico, para cualquiera.",
};

export default function AsistentePage() {
  return (
    <div className="mx-auto min-h-[calc(100dvh-4rem)] max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
      <AsistenteClient />
    </div>
  );
}
