import type { Metadata } from "next";
import { ImpactoClient } from "@/components/impacto/impacto-client";
import "./impacto.css";

// Server component delgado: conserva la metadata (un page "use client" no puede
// exportarla en Next 16). La metadata queda en español (idioma por defecto); la
// copia visible se externaliza al cliente ImpactoClient y se resuelve bilingüe
// vía useLang() + diccionario local.
export const metadata: Metadata = {
  title: "Si Amparo escalara · Impacto y viabilidad",
  description:
    "Proyección de descongestión de la justicia en salud y caso de negocio de Amparo a escala nacional. Estimaciones con todos los supuestos visibles.",
};

export default function ImpactoPage() {
  return (
    <div className="min-h-full text-foreground">
      <ImpactoClient />
    </div>
  );
}
