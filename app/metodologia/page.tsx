import type { Metadata } from "next";
import { MetodologiaClient } from "@/components/metodologia/metodologia-client";
import { metodologiaDict } from "@/components/metodologia/metodologia-dict";

// Server component delgado: conserva la metadata (un page "use client" no puede
// exportarla en Next 16). La metadata queda en español (idioma por defecto); la
// copia visible se externaliza al cliente MetodologiaClient y se resuelve
// bilingüe vía useLang() + diccionario local (mismo patrón que /impacto).
const es = metodologiaDict("es");

export const metadata: Metadata = {
  title: es.meta.title,
  description: es.meta.description,
};

export default function MetodologiaPage() {
  return (
    <div className="min-h-full text-foreground">
      <MetodologiaClient />
    </div>
  );
}
