"use client";

// components/language-toggle.tsx — Switch ES|EN segmentado y accesible.
// Coherente con el nav navy: cápsula translúcida con segmento activo en blanco.

import { useLang } from "@/lib/i18n";
import { useT } from "@/lib/i18n";
import type { Lang } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const OPTIONS: Lang[] = ["es", "en"];

export function LanguageToggle({ className }: { className?: string }) {
  const { lang, setLang } = useLang();
  const t = useT("nav");

  return (
    <div
      role="radiogroup"
      aria-label={t("lang.aria")}
      className={cn(
        "inline-flex items-center rounded-lg border border-white/20 bg-white/10 p-0.5",
        className,
      )}
    >
      {OPTIONS.map((opt) => {
        const active = lang === opt;
        const label = t(opt === "es" ? "lang.es" : "lang.en");
        const fullLabel = t(opt === "es" ? "lang.esFull" : "lang.enFull");
        return (
          <button
            key={opt}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={fullLabel}
            onClick={() => setLang(opt)}
            className={cn(
              "min-h-8 min-w-9 rounded-md px-2.5 text-xs font-semibold uppercase tracking-wide transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/60",
              active
                ? "bg-white text-navy shadow-sm"
                : "text-white/70 hover:text-white",
            )}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
