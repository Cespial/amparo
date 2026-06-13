import type { Metadata } from "next";
import { AsistenteAmparo } from "@/components/avatar/asistente-amparo";

export const metadata: Metadata = {
  title: "Asistente · Amparo",
  description:
    "Habla con Amparo. Te saluda, te hace una pregunta a la vez y arma tu caso por ti — sin lenguaje jurídico, para cualquiera.",
};

export default function AsistentePage() {
  return (
    <div className="mx-auto min-h-[calc(100dvh-4rem)] max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
      <header className="mb-8 text-center">
        <h1 className="font-serif text-3xl font-bold tracking-tight text-navy sm:text-4xl">
          Habla con Amparo
        </h1>
        <p className="mx-auto mt-2 max-w-xl text-balance text-muted-foreground">
          Te acompaño paso a paso. Solo cuéntame qué pasó con tu EPS, con tus
          propias palabras. Yo me encargo del resto.
        </p>
      </header>

      <AsistenteAmparo />
    </div>
  );
}
