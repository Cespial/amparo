import type { Metadata } from "next";
import { JuezDashboard } from "@/components/juez/juez-dashboard";

export const metadata: Metadata = {
  title: "Juez",
  description:
    "Despacho del juez — cola priorizada de tutelas, admisibilidad, predicción y proyección de fallo.",
};

export default function JuezPage() {
  return <JuezDashboard />;
}
