"use client";

// app/landing-client.tsx — Landing bilingüe (es | en).
// Toda la copia visible se resuelve vía useT("landing"); la estructura,
// estilos e iconografía permanecen idénticas al diseño original.

import Link from "next/link";
import {
  ArrowRight,
  Mic,
  ShieldCheck,
  Scale,
  Map as MapIcon,
  Quote,
  BadgeCheck,
  Building2,
  User,
} from "lucide-react";
import { useT } from "@/lib/i18n";
import { Reveal, CountUpStat } from "@/components/landing/reveal";

export function LandingClient() {
  const t = useT("landing");

  const PASOS = [
    {
      icon: Mic,
      titulo: t("how.steps.tell.title"),
      texto: t("how.steps.tell.text"),
    },
    {
      icon: ShieldCheck,
      titulo: t("how.steps.assess.title"),
      texto: t("how.steps.assess.text"),
    },
    {
      icon: Scale,
      titulo: t("how.steps.resolve.title"),
      texto: t("how.steps.resolve.text"),
    },
  ];

  const VALORES = [
    {
      icon: Mic,
      titulo: t("why.values.voice.title"),
      texto: t("why.values.voice.text"),
    },
    {
      icon: Quote,
      titulo: t("why.values.transparent.title"),
      texto: t("why.values.transparent.text"),
    },
    {
      icon: BadgeCheck,
      titulo: t("why.values.consistent.title"),
      texto: t("why.values.consistent.text"),
    },
    {
      icon: Scale,
      titulo: t("why.values.human.title"),
      texto: t("why.values.human.text"),
    },
  ];

  const ROLES = [
    {
      href: "/atlas",
      icon: MapIcon,
      label: t("explore.roles.atlas.label"),
      desc: t("explore.roles.atlas.desc"),
    },
    {
      href: "/demandante",
      icon: User,
      label: t("explore.roles.demandante.label"),
      desc: t("explore.roles.demandante.desc"),
    },
    {
      href: "/demandado",
      icon: Building2,
      label: t("explore.roles.demandado.label"),
      desc: t("explore.roles.demandado.desc"),
    },
    {
      href: "/juez",
      icon: Scale,
      label: t("explore.roles.juez.label"),
      desc: t("explore.roles.juez.desc"),
    },
  ];

  const STATS = [
    {
      cifra: t("stats.tutelas.figure"),
      unidad: t("stats.tutelas.unit"),
      nota: t("stats.tutelas.note"),
    },
    {
      cifra: t("stats.granted.figure"),
      unidad: t("stats.granted.unit"),
      nota: t("stats.granted.note"),
    },
    {
      cifra: t("stats.minutes.figure"),
      unidad: t("stats.minutes.unit"),
      nota: t("stats.minutes.note"),
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6">
      {/* ───────────── Hero ───────────── */}
      <section className="grid items-center gap-10 py-12 sm:py-16 lg:grid-cols-[1.15fr_0.85fr] lg:py-24">
        <div className="max-w-2xl">
          <Reveal delay={0}>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground backdrop-blur">
              <ShieldCheck className="size-3.5 text-brand" />
              {t("hero.badge")}
            </span>
          </Reveal>

          <Reveal delay={80}>
            <h1 className="mt-5 font-heading text-4xl font-semibold leading-[1.05] tracking-tight text-balance sm:text-5xl lg:text-6xl">
              {t("hero.titleLead")}{" "}
              <span className="text-brand">{t("hero.titleEmphasis")}</span>
            </h1>
          </Reveal>

          <Reveal delay={160}>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground text-pretty sm:text-xl">
              {t("hero.bodyLead")}{" "}
              <strong className="text-foreground">
                {t("hero.bodyEmphasis")}
              </strong>
              {t("hero.bodyRest")}
            </p>
          </Reveal>

          <Reveal delay={240}>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/asistente"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-base font-semibold text-primary-foreground shadow-sm transition-[transform,background-color,box-shadow] duration-200 hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                <Mic className="size-4" />
                {t("hero.ctaTalk")}
              </Link>
              <Link
                href="/demandante"
                className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-border bg-white px-6 text-base font-semibold text-foreground transition-[transform,background-color,border-color] duration-200 hover:-translate-y-0.5 hover:border-input hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                {t("hero.ctaStart")}
                <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>
            </div>
          </Reveal>

          <Reveal delay={320}>
            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
              <Link
                href="/atlas"
                className="inline-flex items-center gap-1.5 rounded-md font-medium text-foreground transition-colors hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                <MapIcon className="size-4 text-brand" />
                {t("hero.linkMap")}
              </Link>
              <span className="hidden sm:inline text-muted-foreground/50">·</span>
              <span>{t("hero.trust")}</span>
            </div>
          </Reveal>

          {/* Sello de credibilidad — datos reales, fuente y decisión humana */}
          <Reveal delay={400}>
            <Link
              href="/metodologia"
              className="group mt-6 inline-flex flex-wrap items-center gap-x-2.5 gap-y-1 rounded-xl border border-border bg-white/60 px-3.5 py-2 text-xs font-medium text-muted-foreground backdrop-blur transition-colors hover:border-input hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              <BadgeCheck className="size-4 text-success" aria-hidden />
              <span className="text-foreground">{t("hero.seal.data")}</span>
              <span className="text-muted-foreground/40" aria-hidden>
                ·
              </span>
              <span>{t("hero.seal.source")}</span>
              <span className="text-muted-foreground/40" aria-hidden>
                ·
              </span>
              <span>{t("hero.seal.human")}</span>
              <ArrowRight className="size-3.5 text-brand transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
          </Reveal>
        </div>

        {/* Tarjeta de cifras — el problema en números (count-up al entrar) */}
        <Reveal delay={200} className="lg:justify-self-end lg:w-full">
          <div className="surface-navy p-7 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/55">
              {t("stats.heading")}
            </p>
            <div className="mt-6 space-y-6">
              {STATS.map((s, i) => (
                <CountUpStat
                  key={s.unidad}
                  figure={s.cifra}
                  unit={s.unidad}
                  note={s.nota}
                  delay={300 + i * 220}
                />
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      {/* ───────────── Cómo funciona ───────────── */}
      <section className="py-12 sm:py-16">
        <header className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-strong">
            {t("how.eyebrow")}
          </p>
          <h2 className="mt-2 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
            {t("how.heading")}
          </h2>
        </header>

        <ol className="mt-10 grid gap-5 md:grid-cols-3">
          {PASOS.map((p, i) => (
            <Reveal
              as="li"
              key={p.titulo}
              delay={i * 110}
              className="surface-card p-7 transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div className="flex items-center gap-3">
                <span className="grid size-11 place-items-center rounded-xl bg-secondary text-brand">
                  <p.icon className="size-5" />
                </span>
                <span className="font-heading text-sm font-semibold text-muted-foreground">
                  {t("how.stepLabel")} {i + 1}
                </span>
              </div>
              <h3 className="mt-4 font-heading text-xl font-semibold tracking-tight">
                {p.titulo}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {p.texto}
              </p>
            </Reveal>
          ))}
        </ol>
      </section>

      {/* ───────────── Por qué Amparo ───────────── */}
      <section className="py-12 sm:py-16">
        <div className="surface-card overflow-hidden p-8 sm:p-12">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
            <header className="max-w-md">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-strong">
                {t("why.eyebrow")}
              </p>
              <h2 className="mt-2 font-heading text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
                {t("why.heading")}
              </h2>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                {t("why.lead")}
              </p>
            </header>

            <ul className="grid gap-5 sm:grid-cols-2">
              {VALORES.map((v, i) => (
                <Reveal as="li" key={v.titulo} delay={i * 90} className="flex gap-4">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-secondary text-brand">
                    <v.icon className="size-5" />
                  </span>
                  <div>
                    <h3 className="font-heading text-base font-semibold">
                      {v.titulo}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {v.texto}
                    </p>
                  </div>
                </Reveal>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ───────────── Explorar la plataforma ───────────── */}
      <section className="py-12 sm:py-16">
        <header className="mb-8 max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-strong">
            {t("explore.eyebrow")}
          </p>
          <h2 className="mt-2 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
            {t("explore.heading")}
          </h2>
          <p className="mt-3 text-base leading-relaxed text-muted-foreground">
            {t("explore.lead")}
          </p>
        </header>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {ROLES.map((r, i) => (
            <Reveal key={r.href} delay={i * 90} className="flex">
              <Link
                href={r.href}
                className="surface-card group flex w-full flex-col gap-3 p-6 transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                <span className="grid size-11 place-items-center rounded-xl bg-navy text-white transition-colors duration-200 group-hover:bg-primary">
                  <r.icon className="size-5" />
                </span>
                <div>
                  <h3 className="font-heading text-lg font-semibold tracking-tight">
                    {r.label}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">{r.desc}</p>
                </div>
                <span className="mt-auto inline-flex items-center gap-1 text-sm font-medium text-brand">
                  {t("explore.enter")}
                  <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ───────────── Footer ───────────── */}
      <footer className="border-t border-border py-10 text-sm text-muted-foreground">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2.5">
            <span className="grid size-8 place-items-center rounded-lg bg-primary">
              <ShieldCheck className="size-4 text-white" />
            </span>
            <span className="font-heading font-semibold text-foreground">
              {t("footer.brand")}
            </span>
          </div>
          <p className="max-w-xl text-xs leading-relaxed text-muted-foreground">
            {t("footer.disclaimer")}
          </p>
        </div>
      </footer>
    </div>
  );
}
