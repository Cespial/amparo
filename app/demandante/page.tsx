import type { Metadata } from "next";
import { DemandantePortal } from "@/components/demandante/demandante-portal";

export const metadata: Metadata = {
  title: "Demandante · Amparo",
  description:
    "De tu relato a una tutela en minutos. Amparo te acompaña paso a paso para proteger tu derecho a la salud.",
};

export default function DemandantePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
      <DemandantePortal />
    </div>
  );
}
