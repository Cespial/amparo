import type { Metadata } from "next";
import { HeartHandshake } from "lucide-react";
import { DemandantePortal } from "@/components/demandante/demandante-portal";

export const metadata: Metadata = {
  title: "Demandante · Amparo",
  description:
    "De tu relato a una tutela en minutos. Amparo te acompaña paso a paso para proteger tu derecho a la salud.",
};

export default function DemandantePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
      <header className="mb-6 flex items-start gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <HeartHandshake className="size-6" />
        </span>
        <div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-navy">
            De tu historia a tu tutela
          </h1>
          <p className="mt-1 max-w-2xl text-muted-foreground">
            Cuéntanos qué pasó con tu EPS. Amparo organiza tu caso, evalúa si
            procede, te da un pronóstico con sentencias reales y redacta tu
            documento. Tú decides el camino.
          </p>
          <p className="mt-1.5 max-w-2xl text-sm font-medium text-primary">
            Amparo es la cuarta parte que te acompaña: resultados consistentes,
            no arbitrarios. La decisión final siempre es de un humano.
          </p>
        </div>
      </header>

      <DemandantePortal />
    </div>
  );
}
