// components/sentencia-chip.tsx — Chip institucional para una sentencia del corpus.
//
// Cita CLICABLE y accesible. Si la SentenciaRef trae `fuenteUrl` (relatoría de
// la Corte Constitucional), el chip es un <a target="_blank" rel="noopener
// noreferrer"> con ícono de enlace externo; si no, degrada a un <span> estático.
// Cuando existe `subregla`, se muestra como tooltip al pasar el cursor/foco.
//
// Transversal (todos los roles): demandante, demandado, juez, atlas. Bilingüe
// vía el namespace "common" (useT). Estética AAA clara: borde, id en mono, navy.

"use client";

import { BookOpen, ExternalLink } from "lucide-react";

import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import type { SentenciaRef } from "@/lib/types";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface SentenciaChipProps {
  /** La sentencia a citar. `fuenteUrl` hace el chip clicable. */
  sentencia: SentenciaRef;
  /**
   * Densidad visual. "sm" (default) para listas/inline; "md" para destacados.
   */
  size?: "sm" | "md";
  /** Mostrar el tema junto al id (p.ej. "T-760/2008 · Salud…"). Default true. */
  showTema?: boolean;
  /** Mostrar la subregla como tooltip (si existe). Default true. */
  withTooltip?: boolean;
  className?: string;
}

/** Estilo base compartido por el <a> y el <span>. */
const chipBase =
  "group inline-flex max-w-full items-center gap-1.5 rounded-full border border-border bg-surface-card/60 font-medium text-navy transition-colors";
const chipSizes = {
  sm: "px-2.5 py-1 text-[11px]",
  md: "px-3 py-1.5 text-xs",
} as const;
/** Solo el <a> (clicable) recibe affordances de hover/foco. */
const chipLink =
  "hover:border-primary/40 hover:bg-primary/5 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-1";

/**
 * Chip institucional clicable para una sentencia del corpus.
 *
 * - Con `fuenteUrl`: `<a href target="_blank" rel="noopener noreferrer">` +
 *   ícono ExternalLink + aria-label "Ver Sentencia {id} en la Corte
 *   Constitucional" (bilingüe).
 * - Sin `fuenteUrl`: `<span>` estático (mismo look, sin enlace ni ícono).
 * - Con `subregla` y `withTooltip`: tooltip con la subregla (la fuente oficial
 *   se anuncia en una línea final).
 */
export function SentenciaChip({
  sentencia,
  size = "sm",
  showTema = true,
  withTooltip = true,
  className,
}: SentenciaChipProps) {
  const t = useT("common");
  const { id, tema, subregla, fuenteUrl } = sentencia;

  const inner = (
    <>
      <BookOpen className="size-3 shrink-0 text-primary" aria-hidden />
      <span className="font-mono tracking-tight">{id}</span>
      {showTema && tema ? (
        <span className="truncate font-normal text-muted-foreground">
          · {tema}
        </span>
      ) : null}
      {fuenteUrl ? (
        <ExternalLink
          className="size-3 shrink-0 text-muted-foreground transition-colors group-hover:text-primary"
          aria-hidden
        />
      ) : null}
    </>
  );

  const chip = fuenteUrl ? (
    <a
      href={fuenteUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t("judgmentChip.openAria", { id })}
      className={cn(chipBase, chipSizes[size], chipLink, className)}
    >
      {inner}
    </a>
  ) : (
    <span className={cn(chipBase, chipSizes[size], className)}>{inner}</span>
  );

  if (!withTooltip || !subregla) return chip;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger
          // El trigger reusa el chip (a/span) como su elemento renderizado
          // (base-ui fusiona aquí los handlers/aria del tooltip).
          render={chip}
        />
        <TooltipContent className="max-w-xs flex-col items-start gap-1 text-left">
          <span className="leading-snug">{subregla}</span>
          {fuenteUrl ? (
            <span className="text-[10px] opacity-70">
              {t("judgmentChip.officialSource")}
            </span>
          ) : null}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default SentenciaChip;
