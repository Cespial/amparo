"use client";

// components/metodologia/metodologia-client.tsx — Vista /metodologia:
// página institucional de Metodología y Fuentes. Da credibilidad ante el jurado:
// abre datasets, validación de datos, corpus jurídico verificado, el guardrail
// anti-alucinación (con la historia de la auto-auditoría) y la ética del modelo.
//
// Aislamiento i18n: importa SÓLO useLang() de '@/lib/i18n' (lectura) y resuelve
// la copia con el diccionario LOCAL metodologiaDict(lang). No toca
// lib/i18n/index.ts ni ningún diccionario global.
//
// Toda cita de sentencia visible usa <SentenciaChip> (contrato Fase 1): el
// ejemplo "que sí pasa el control" es la T-760/2008 real, con su fuenteUrl
// oficial, por lo que el chip es clicable hacia la relatoría de la Corte.

import Link from "next/link";
import {
  ShieldCheck,
  Database,
  ExternalLink,
  BookOpenCheck,
  Scale,
  Sparkles,
  ListTree,
  Layers,
  Cpu,
  Search,
  UserCheck,
  AlertTriangle,
  CheckCircle2,
  Ban,
  Microscope,
  ArrowRight,
  Mic,
  TrendingDown,
} from "lucide-react";

import { useLang } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import type { SentenciaRef } from "@/lib/types";
import { SentenciaChip } from "@/components/sentencia-chip";
import { metodologiaDict, DATA } from "./metodologia-dict";
import { fmtInt } from "@/components/impacto/format";

/* Eyebrow reutilizable, alineado con la estética institucional del deck. */
function Eyebrow({
  icon: Icon,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-border bg-white/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground backdrop-blur">
      <Icon className="size-3.5 text-brand" />
      {children}
    </span>
  );
}

/** Interpola {clave} en una plantilla local con valores de cadena/número. */
function interp(tpl: string, vars: Record<string, string | number>): string {
  return tpl.replace(/\{(\w+)\}/g, (m, k: string) =>
    k in vars ? String(vars[k]) : m,
  );
}

/** Enlace externo institucional (mismo look de afordancia que SentenciaChip). */
function SourceAnchor({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "group inline-flex items-center gap-1.5 font-medium text-brand-strong underline decoration-brand/30 underline-offset-2 transition-colors hover:text-primary hover:decoration-primary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-1 rounded-sm",
        className,
      )}
    >
      {children}
      <ExternalLink
        className="size-3 shrink-0 opacity-70 transition-opacity group-hover:opacity-100"
        aria-hidden
      />
    </a>
  );
}

export function MetodologiaClient() {
  const { lang } = useLang();
  const d = metodologiaDict(lang);
  const matchPct = lang === "es" ? DATA.matchPct : DATA.matchPctEn;

  // Sentencia ancla REAL del corpus (T-760/2008) para el chip clicable de la
  // sección de auto-auditoría: existe, está verificada y enlaza a su fuente.
  const sentenciaAncla: SentenciaRef = {
    id: DATA.sentenciaAncla,
    titulo:
      lang === "es"
        ? "Sentencia estructural del derecho a la salud"
        : "Structural judgment on the right to health",
    anio: 2008,
    tema:
      lang === "es"
        ? "Salud como derecho fundamental autónomo"
        : "Health as an autonomous fundamental right",
    subregla:
      lang === "es"
        ? "La salud es un derecho fundamental autónomo, exigible por tutela sin demostrar conexidad con la vida."
        : "Health is an autonomous fundamental right, enforceable by tutela without proving a connection to life.",
    extracto: "",
    derechos: ["salud", "vida digna", "seguridad social"],
    fuenteUrl: DATA.sentenciaAnclaUrl,
  };

  const modelCards = [
    { icon: Cpu, ...d.model.cards.opus },
    { icon: ListTree, ...d.model.cards.haiku },
    { icon: Search, ...d.model.cards.rag },
  ];

  const ethicsIcons = [TrendingDown, Ban, Scale, ShieldCheck];

  return (
    <div className="text-foreground">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        {/* ── Encabezado / tesis ───────────────────────────────────────── */}
        <header className="max-w-3xl">
          <Eyebrow icon={ShieldCheck}>{d.hero.eyebrow}</Eyebrow>
          <h1 className="mt-4 font-serif text-4xl font-semibold leading-[1.05] tracking-tight text-balance text-navy sm:text-5xl lg:text-6xl">
            {d.hero.title}
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground text-pretty sm:text-xl">
            {d.hero.subtitle}
          </p>
          <span className="mt-6 inline-flex items-center gap-2 rounded-full bg-success/10 px-3 py-1.5 text-xs font-semibold text-success">
            <CheckCircle2 className="size-3.5" />
            {d.hero.badge}
          </span>

          {/* Índice ancla */}
          <nav
            aria-label={d.toc.title}
            className="mt-8 flex flex-wrap gap-2"
          >
            {[
              { href: "#datos", label: d.toc.data },
              { href: "#corpus", label: d.toc.corpus },
              { href: "#modelo", label: d.toc.model },
              { href: "#etica", label: d.toc.ethics },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="inline-flex items-center rounded-full border border-border bg-white/60 px-3.5 py-1.5 text-xs font-semibold text-navy transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
              >
                {item.label}
              </a>
            ))}
          </nav>
        </header>

        {/* ── 1 · Los datos ────────────────────────────────────────────── */}
        <section
          id="datos"
          className="mt-14 scroll-mt-24 sm:mt-20"
          aria-labelledby="datos-title"
        >
          <div className="max-w-2xl">
            <Eyebrow icon={Database}>{d.data.eyebrow}</Eyebrow>
            <h2
              id="datos-title"
              className="mt-3 font-serif text-3xl font-semibold tracking-tight text-navy sm:text-4xl"
            >
              {d.data.title}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground text-pretty">
              {d.data.intro}
            </p>
          </div>

          {/* Tabla de datasets (cards en móvil, tabla en ≥md) */}
          <div className="surface-card mt-7 overflow-hidden p-0">
            <table className="hidden w-full border-collapse text-left md:table">
              <thead>
                <tr className="border-b border-border bg-secondary/40">
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {d.data.tableHead.dataset}
                  </th>
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {d.data.tableHead.what}
                  </th>
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {d.data.tableHead.source}
                  </th>
                </tr>
              </thead>
              <tbody>
                {d.data.rows.map((row) => (
                  <tr
                    key={row.name}
                    className="border-b border-border/70 last:border-0 align-top"
                  >
                    <td className="px-5 py-4">
                      <span className="font-serif text-base font-semibold text-navy">
                        {row.name}
                      </span>
                      <span className="mt-1 block font-mono text-[11px] text-muted-foreground">
                        {row.note}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm leading-relaxed text-muted-foreground">
                      {row.what}
                    </td>
                    <td className="px-5 py-4 text-sm">
                      <span className="block text-foreground/90">
                        {row.source}
                      </span>
                      <SourceAnchor href={row.link.url} className="mt-1 text-xs">
                        {row.link.label}
                      </SourceAnchor>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Cards en móvil */}
            <ul className="divide-y divide-border/70 md:hidden">
              {d.data.rows.map((row) => (
                <li key={row.name} className="p-5">
                  <span className="font-serif text-base font-semibold text-navy">
                    {row.name}
                  </span>
                  <span className="ml-2 font-mono text-[11px] text-muted-foreground">
                    {row.note}
                  </span>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {row.what}
                  </p>
                  <p className="mt-2 text-sm text-foreground/90">{row.source}</p>
                  <SourceAnchor href={row.link.url} className="mt-1 text-xs">
                    {row.link.label}
                  </SourceAnchor>
                </li>
              ))}
            </ul>
          </div>

          {/* Validación cruzada — el match 99,99% */}
          <div className="surface-navy mt-6 p-6 sm:p-8">
            <h3 className="flex items-center gap-2 font-serif text-lg font-semibold tracking-tight text-white">
              <CheckCircle2 className="size-4 text-success" />
              {d.data.validation.title}
            </h3>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-white/80 text-pretty">
              {d.data.validation.body}
            </p>
            <div className="mt-6 grid items-center gap-4 sm:grid-cols-[1fr_auto_1fr]">
              <div className="rounded-xl border border-white/10 bg-white/5 p-5 text-center">
                <span className="block text-[11px] font-semibold uppercase tracking-wide text-white/60">
                  {d.data.validation.court}
                </span>
                <span className="mt-1 block font-serif text-3xl font-semibold tabular-nums text-white">
                  {fmtInt(DATA.tutelasCorte, lang)}
                </span>
              </div>
              <div className="flex flex-col items-center justify-center gap-1 py-2">
                <span className="font-serif text-2xl font-semibold text-success">
                  ≈
                </span>
                <span className="rounded-full bg-success/20 px-3 py-1 text-center text-xs font-bold text-success">
                  {matchPct} {d.data.validation.matchLabel}
                </span>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-5 text-center">
                <span className="block text-[11px] font-semibold uppercase tracking-wide text-white/60">
                  {d.data.validation.ombudsman}
                </span>
                <span className="mt-1 block font-serif text-3xl font-semibold tabular-nums text-white">
                  {fmtInt(DATA.tutelasDefensoria, lang)}
                </span>
              </div>
            </div>
            <p className="mt-5 text-xs leading-relaxed text-white/60 text-pretty">
              {d.data.validation.note}
            </p>
          </div>
        </section>

        {/* ── 2 · El corpus jurídico ───────────────────────────────────── */}
        <section
          id="corpus"
          className="mt-14 scroll-mt-24 sm:mt-20"
          aria-labelledby="corpus-title"
        >
          <div className="max-w-2xl">
            <Eyebrow icon={BookOpenCheck}>{d.corpus.eyebrow}</Eyebrow>
            <h2
              id="corpus-title"
              className="mt-3 font-serif text-3xl font-semibold tracking-tight text-navy sm:text-4xl"
            >
              {d.corpus.title}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground text-pretty">
              {d.corpus.intro}
            </p>
          </div>

          <div className="mt-7 grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
            {/* Conteo del corpus */}
            <div className="surface-card flex flex-col items-start justify-center p-7">
              <span className="grid size-11 place-items-center rounded-xl bg-navy text-white">
                <Layers className="size-5" />
              </span>
              <span className="mt-4 font-serif text-6xl font-semibold tabular-nums text-brand">
                {DATA.sentenciasCorpus}
              </span>
              <span className="mt-1 text-sm font-semibold text-navy">
                {d.corpus.countLabel}
              </span>
              <span className="text-sm text-muted-foreground">
                {d.corpus.countUnit}
              </span>
              <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-1 text-[11px] font-semibold text-success">
                <CheckCircle2 className="size-3.5" />
                {d.corpus.verifiedTag}
              </span>
            </div>

            {/* Guardrail */}
            <div className="surface-card border-primary/20 p-7">
              <h3 className="flex items-center gap-2 font-serif text-lg font-semibold tracking-tight text-navy">
                <ShieldCheck className="size-5 text-primary" />
                {d.corpus.guardrail.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground text-pretty">
                {d.corpus.guardrail.body}
              </p>
              <ul className="mt-5 grid gap-3">
                {d.corpus.guardrail.points.map((point) => (
                  <li
                    key={point}
                    className="flex items-start gap-2.5 text-sm leading-relaxed text-foreground/90"
                  >
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" />
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Auto-auditoría — la historia de la cita cazada */}
          <div className="surface-card mt-6 overflow-hidden p-0">
            <div className="grid gap-0 md:grid-cols-[auto_1fr]">
              <div className="flex items-center gap-3 bg-warning/10 p-6 md:flex-col md:items-start md:justify-center md:border-r md:border-warning/20">
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-warning/15 text-warning">
                  <Microscope className="size-5" />
                </span>
                <span className="text-xs font-semibold uppercase tracking-wide text-warning">
                  {d.corpus.audit.kicker}
                </span>
              </div>
              <div className="p-6 sm:p-7">
                <h3 className="font-serif text-lg font-semibold tracking-tight text-navy">
                  {d.corpus.audit.title}
                </h3>
                <p className="mt-2 flex items-start gap-2 text-sm font-medium text-brand-strong">
                  <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                  {d.corpus.audit.lead}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground text-pretty">
                  {interp(d.corpus.audit.body, { cita: DATA.citaAlucinada })}
                </p>

                {/* La cita eliminada (tachada, sin enlace) vs la que sí pasa */}
                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-warning/30 bg-warning/5 px-2.5 py-1 text-[11px] font-medium text-warning line-through">
                    <Ban className="size-3 shrink-0" aria-hidden />
                    <span className="font-mono tracking-tight">
                      {DATA.citaAlucinada}
                    </span>
                  </span>
                </div>

                <p className="mt-5 text-sm leading-relaxed text-foreground/90 text-pretty">
                  {d.corpus.audit.anchorIntro}
                </p>
                <div className="mt-3">
                  <SentenciaChip sentencia={sentenciaAncla} size="md" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 3 · El modelo de IA ──────────────────────────────────────── */}
        <section
          id="modelo"
          className="mt-14 scroll-mt-24 sm:mt-20"
          aria-labelledby="modelo-title"
        >
          <div className="max-w-2xl">
            <Eyebrow icon={Sparkles}>{d.model.eyebrow}</Eyebrow>
            <h2
              id="modelo-title"
              className="mt-3 font-serif text-3xl font-semibold tracking-tight text-navy sm:text-4xl"
            >
              {d.model.title}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground text-pretty">
              {d.model.intro}
            </p>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {modelCards.map((m) => (
              <article key={m.tag} className="surface-card flex flex-col p-7">
                <div className="flex items-center justify-between">
                  <span className="grid size-11 place-items-center rounded-xl bg-navy text-white">
                    <m.icon className="size-5" />
                  </span>
                  <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-bold tracking-wide text-brand">
                    {m.tag}
                  </span>
                </div>
                <h3 className="mt-4 font-serif text-lg font-semibold tracking-tight text-navy">
                  {m.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground text-pretty">
                  {m.body}
                </p>
              </article>
            ))}
          </div>

          {/* Humano en el loop */}
          <div className="surface-navy mt-6 flex flex-col gap-4 p-7 sm:flex-row sm:items-center sm:p-8">
            <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-white/10 text-white">
              <UserCheck className="size-6" />
            </span>
            <div>
              <h3 className="font-serif text-lg font-semibold tracking-tight text-white">
                {d.model.humanTitle}
              </h3>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-white/80 text-pretty">
                {d.model.humanBody}
              </p>
            </div>
          </div>
        </section>

        {/* ── 4 · Límites y ética ──────────────────────────────────────── */}
        <section
          id="etica"
          className="mt-14 scroll-mt-24 sm:mt-20"
          aria-labelledby="etica-title"
        >
          <div className="max-w-2xl">
            <Eyebrow icon={Scale}>{d.ethics.eyebrow}</Eyebrow>
            <h2
              id="etica-title"
              className="mt-3 font-serif text-3xl font-semibold tracking-tight text-navy sm:text-4xl"
            >
              {d.ethics.title}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground text-pretty">
              {d.ethics.intro}
            </p>
          </div>

          <div className="mt-7 grid gap-5 sm:grid-cols-2">
            {d.ethics.items.map((item, i) => {
              const Icon = ethicsIcons[i] ?? ShieldCheck;
              return (
                <article key={item.title} className="surface-card p-6">
                  <h3 className="flex items-center gap-2.5 font-serif text-base font-semibold text-navy">
                    <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-secondary text-brand">
                      <Icon className="size-4" />
                    </span>
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground text-pretty">
                    {item.body}
                  </p>
                </article>
              );
            })}
          </div>
        </section>

        {/* ── Footer: fuentes oficiales + disclaimer + CTA ─────────────── */}
        <footer className="mt-14 border-t border-border pt-7 sm:mt-20">
          <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            {d.footer.sourcesTitle}
          </h2>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {d.footer.sources.map((s) => (
              <li key={s.url} className="flex items-start gap-2 text-xs">
                <BookOpenCheck className="mt-0.5 size-3.5 shrink-0 text-brand-strong" />
                <SourceAnchor href={s.url} className="text-xs leading-relaxed">
                  {s.label}
                </SourceAnchor>
              </li>
            ))}
          </ul>
          <p className="mt-5 rounded-xl bg-secondary/60 p-4 text-xs leading-relaxed text-muted-foreground text-pretty">
            {d.footer.disclaimer}
          </p>

          <div className="mt-7 flex flex-col items-start gap-3 sm:flex-row">
            <Link
              href="/asistente"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-base font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              <Mic className="size-4" />
              {d.footer.tryDemo}
            </Link>
            <Link
              href="/impacto"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-border bg-white px-6 text-base font-semibold text-foreground transition-colors hover:bg-secondary"
            >
              {d.footer.backToImpact}
              <ArrowRight className="size-4 text-brand" />
            </Link>
          </div>
        </footer>
      </div>
    </div>
  );
}
