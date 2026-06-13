"use client";

// app/atlas/atlas-page-client.tsx — Cabecera + pie del Atlas, bilingüe (es | en).
// Toda la copia visible se resuelve vía useT("atlas"); la estructura, estilos
// e iconografía permanecen idénticas al diseño original. La metadata (SEO)
// queda en el server component app/atlas/page.tsx.

import { AtlasShell } from "@/components/atlas/atlas-shell";
import { useT } from "@/lib/i18n";

export function AtlasPageClient() {
  const t = useT("atlas");

  return (
    <>
      {/* Titular gancho — Acto I del pitch, sobre tarjeta blanca AAA */}
      <header className="surface-card mb-5 max-w-3xl p-5 sm:mb-6 sm:p-7">
        <p className="mb-2 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-strong">
          <span
            className="size-1.5 rounded-full bg-primary"
            aria-hidden
          />
          {t("hero.eyebrow")}
        </p>
        <h1 className="font-heading text-3xl font-semibold leading-tight tracking-tight text-balance text-foreground sm:text-4xl lg:text-[2.75rem]">
          {t("hero.title")}
        </h1>
        <p className="mt-3 text-base leading-relaxed text-muted-foreground sm:text-lg text-pretty">
          {t("hero.bodyLead")}{" "}
          <span className="font-semibold text-foreground">
            {t("hero.emphGranted")}
          </span>
          {t("hero.bodyMid")}{" "}
          <span className="font-semibold text-foreground">
            {t("hero.emphRight")}
          </span>{" "}
          {t("hero.bodyEnd")}
        </p>
      </header>

      <AtlasShell />

      <footer className="mt-8 max-w-3xl text-xs leading-relaxed text-muted-foreground">
        <p>
          {t("footer.before")}
          <span className="font-mono tabular-nums text-foreground">
            colombia-departamentos.geojson
          </span>
          {t("footer.after")}
        </p>
      </footer>
    </>
  );
}

export default AtlasPageClient;
