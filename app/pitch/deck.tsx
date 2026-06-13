"use client";

// app/pitch/deck.tsx
// Deck de pitch navegable a pantalla completa. Estética AAA clara (rojo #ce3a28,
// navy #20243f, lavanda, tarjetas blancas; titulares en Source Serif 4).
// Navegación con teclado (←/→, Inicio/Fin, Espacio, Esc), barra de progreso,
// puntos por slide y controles táctiles. Mobile-friendly. La última slide
// enlaza al demo (/asistente). Componente <Slide> reutilizable más abajo.
//
// Toda la copia visible se resuelve vía useT("pitch"); estructura, estilos e
// iconografía permanecen idénticas al diseño original.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowLeft,
  X,
  Home as HomeIcon,
  Mic,
  Map as MapIcon,
  Scale,
  ShieldCheck,
  FileText,
  Quote,
  Building2,
  User,
  Clock,
  BadgeCheck,
  Sparkles,
  Gavel,
  Layers,
} from "lucide-react";
import { useT, type TFunction } from "@/lib/i18n";
import anim from "@/components/landing/landing-anim.module.css";

/* ──────────────────────────────────────────────────────────────────────────
   Modelo de un slide. El contenido vive como datos; el render es declarativo.
   `kickerKey` resuelve el kicker traducido (cabecera + aria de los puntos).
   ────────────────────────────────────────────────────────────────────────── */
interface SlideDef {
  id: string;
  kickerKey: string;
  render: (t: TFunction) => React.ReactNode;
}

/* Pequeñas piezas reutilizables ─────────────────────────────────────────── */

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-border bg-white/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground backdrop-blur">
      {children}
    </span>
  );
}

function Headline({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-serif text-4xl font-semibold leading-[1.05] tracking-tight text-balance text-navy sm:text-5xl lg:text-6xl">
      {children}
    </h2>
  );
}

function Bullets({
  items,
}: {
  items: { icon: React.ComponentType<{ className?: string }>; text: React.ReactNode }[];
}) {
  return (
    <ul className="mt-8 grid gap-4 sm:max-w-2xl">
      {items.map((b, i) => (
        <li key={i} className="flex items-start gap-4">
          <span className="mt-0.5 grid size-10 shrink-0 place-items-center rounded-xl bg-secondary text-brand">
            <b.icon className="size-5" />
          </span>
          <p className="text-lg leading-relaxed text-foreground/90 text-pretty">
            {b.text}
          </p>
        </li>
      ))}
    </ul>
  );
}

/* Fragmento con énfasis: "lead <strong>strong</strong> rest" (espaciado fijo). */
function Emphasis({
  lead,
  strong,
  rest,
}: {
  lead: string;
  strong: string;
  rest: string;
}) {
  return (
    <>
      {lead} <strong className="text-navy">{strong}</strong> {rest}
    </>
  );
}

function StatCard({
  cifra,
  unidad,
  nota,
}: {
  cifra: string;
  unidad: string;
  nota: string;
}) {
  return (
    <div className="border-b border-white/10 pb-5 last:border-0 last:pb-0">
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <span className="font-serif text-4xl font-semibold text-white sm:text-5xl">
          {cifra}
        </span>
        <span className="text-sm font-medium text-white/70">{unidad}</span>
      </div>
      <p className="mt-1 text-sm leading-relaxed text-white/60">{nota}</p>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   Slide reutilizable: cáscara de layout con mucho aire, titular serif y
   espacio para 1-3 ideas. Centrado vertical, ancho contenido.
   ────────────────────────────────────────────────────────────────────────── */
function Slide({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <section
      role="group"
      aria-roledescription="slide"
      aria-label={label}
      className="relative flex min-h-full w-full items-center justify-center px-5 py-20 sm:px-10 lg:px-16"
    >
      <div className="mx-auto w-full max-w-5xl">{children}</div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   Definición de los 12 slides del deck. El texto se resuelve vía t() (pitch).
   ────────────────────────────────────────────────────────────────────────── */
const SLIDES: SlideDef[] = [
  // 1 · Portada
  {
    id: "portada",
    kickerKey: "kicker.portada",
    render: (t) => (
      <div className="text-center">
        <div className="flex justify-center">
          <span className="grid size-16 place-items-center rounded-2xl bg-primary shadow-lg shadow-primary/20">
            <ShieldCheck className="size-8 text-white" aria-hidden />
          </span>
        </div>
        <p className="mt-6 text-sm font-semibold uppercase tracking-[0.28em] text-brand">
          {t("portada.brand")}
        </p>
        <h1 className="mx-auto mt-4 max-w-4xl font-serif text-4xl font-semibold leading-[1.04] tracking-tight text-balance text-navy sm:text-5xl lg:text-6xl">
          {t("portada.titleLead")}{" "}
          <span className="text-brand">{t("portada.titleEmphasis")}</span>{" "}
          {t("portada.titleRest")}
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground text-pretty sm:text-xl">
          {t("portada.subtitle")}
        </p>
        <p className="mt-8 inline-flex items-center gap-2 rounded-full border border-border bg-white/70 px-4 py-1.5 text-sm font-medium text-muted-foreground backdrop-blur">
          <MapIcon className="size-4 text-brand" />
          {t("portada.tag")}
        </p>
      </div>
    ),
  },

  // 2 · El problema
  {
    id: "problema",
    kickerKey: "kicker.problema",
    render: (t) => (
      <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <Eyebrow>
            <Scale className="size-3.5 text-brand" />
            {t("problema.eyebrow")}
          </Eyebrow>
          <Headline>{t("problema.headline")}</Headline>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground text-pretty">
            {t("problema.body")}
          </p>
        </div>
        <div className="surface-navy p-7 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/55">
            {t("problema.statsTitle")}
          </p>
          <div className="mt-6 space-y-6">
            <StatCard
              cifra={t("problema.stat1.figure")}
              unidad={t("problema.stat1.unit")}
              nota={t("problema.stat1.note")}
            />
            <StatCard
              cifra={t("problema.stat2.figure")}
              unidad={t("problema.stat2.unit")}
              nota={t("problema.stat2.note")}
            />
            <StatCard
              cifra={t("problema.stat3.figure")}
              unidad={t("problema.stat3.unit")}
              nota={t("problema.stat3.note")}
            />
          </div>
        </div>
      </div>
    ),
  },

  // 3 · La persona
  {
    id: "persona",
    kickerKey: "kicker.persona",
    render: (t) => (
      <div className="grid items-center gap-10 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="surface-card flex flex-col items-center p-8 text-center">
          <span className="grid size-24 place-items-center rounded-full bg-secondary text-brand">
            <User className="size-12" />
          </span>
          <p className="mt-5 font-serif text-2xl font-semibold text-navy">
            {t("persona.cardName")}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {t("persona.cardDesc")}
          </p>
          <span className="mt-5 inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1.5 text-sm font-medium text-brand">
            <Mic className="size-4" />
            {t("persona.cardTag")}
          </span>
        </div>
        <div>
          <Eyebrow>
            <User className="size-3.5 text-brand" />
            {t("persona.eyebrow")}
          </Eyebrow>
          <Headline>{t("persona.headline")}</Headline>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground text-pretty">
            {t("persona.body")}
          </p>
        </div>
      </div>
    ),
  },

  // 4 · Cómo funciona
  {
    id: "como-funciona",
    kickerKey: "kicker.comoFunciona",
    render: (t) => {
      const pasos = [
        {
          icon: Mic,
          titulo: t("comoFunciona.steps.tell.title"),
          texto: t("comoFunciona.steps.tell.text"),
        },
        {
          icon: ShieldCheck,
          titulo: t("comoFunciona.steps.assess.title"),
          texto: t("comoFunciona.steps.assess.text"),
        },
        {
          icon: Scale,
          titulo: t("comoFunciona.steps.resolve.title"),
          texto: t("comoFunciona.steps.resolve.text"),
        },
      ];
      return (
        <div>
          <div className="text-center">
            <Eyebrow>
              <Sparkles className="size-3.5 text-brand" />
              {t("comoFunciona.eyebrow")}
            </Eyebrow>
            <h2 className="mx-auto mt-4 max-w-3xl font-serif text-4xl font-semibold leading-[1.06] tracking-tight text-balance text-navy sm:text-5xl">
              {t("comoFunciona.headline")}
            </h2>
          </div>
          <ol className="mt-10 grid gap-5 md:grid-cols-3">
            {pasos.map((p, i) => (
              <li key={p.titulo} className="surface-card p-7">
                <div className="flex items-center gap-3">
                  <span className="grid size-11 place-items-center rounded-xl bg-secondary text-brand">
                    <p.icon className="size-5" />
                  </span>
                  <span className="font-serif text-sm font-semibold text-muted-foreground">
                    {t("comoFunciona.stepLabel")} {i + 1}
                  </span>
                </div>
                <h3 className="mt-4 font-serif text-xl font-semibold tracking-tight text-navy">
                  {p.titulo}
                </h3>
                <p className="mt-2 text-base leading-relaxed text-muted-foreground">
                  {p.texto}
                </p>
              </li>
            ))}
          </ol>
        </div>
      );
    },
  },

  // 5 · Voz + avatar = acceso para todos
  {
    id: "voz",
    kickerKey: "kicker.voz",
    render: (t) => (
      <div>
        <div className="max-w-2xl">
          <Eyebrow>
            <Mic className="size-3.5 text-brand" />
            {t("voz.eyebrow")}
          </Eyebrow>
          <Headline>{t("voz.headline")}</Headline>
        </div>
        <Bullets
          items={[
            {
              icon: Mic,
              text: (
                <Emphasis
                  lead={t("voz.bullet1.lead")}
                  strong={t("voz.bullet1.strong")}
                  rest={t("voz.bullet1.rest")}
                />
              ),
            },
            {
              icon: Quote,
              text: (
                <Emphasis
                  lead={t("voz.bullet2.lead")}
                  strong={t("voz.bullet2.strong")}
                  rest={t("voz.bullet2.rest")}
                />
              ),
            },
            {
              icon: BadgeCheck,
              text: (
                <Emphasis
                  lead={t("voz.bullet3.lead")}
                  strong={t("voz.bullet3.strong")}
                  rest={t("voz.bullet3.rest")}
                />
              ),
            },
          ]}
        />
      </div>
    ),
  },

  // 6 · Predicción citada en jurisprudencia
  {
    id: "prediccion",
    kickerKey: "kicker.prediccion",
    render: (t) => (
      <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <Eyebrow>
            <Quote className="size-3.5 text-brand" />
            {t("prediccion.eyebrow")}
          </Eyebrow>
          <Headline>{t("prediccion.headline")}</Headline>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground text-pretty">
            {t("prediccion.body")}
          </p>
        </div>
        <div className="surface-card p-7">
          <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-brand">
            <FileText className="size-3.5" />
            {t("prediccion.cardTag")}
          </span>
          <p className="mt-4 font-serif text-3xl font-semibold tracking-tight text-navy">
            {t("prediccion.cardRuling")}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {t("prediccion.cardDesc")}
          </p>
          <div className="mt-5 flex items-center justify-between rounded-xl bg-secondary px-4 py-3">
            <span className="text-sm font-medium text-muted-foreground">
              {t("prediccion.probLabel")}
            </span>
            <span className="font-serif text-2xl font-semibold text-success">
              {t("prediccion.probValue")}
            </span>
          </div>
        </div>
      </div>
    ),
  },

  // 7 · Credibilidad — cada dato es real o está marcado
  {
    id: "credibilidad",
    kickerKey: "kicker.credibilidad",
    render: (t) => (
      <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <Eyebrow>
            <BadgeCheck className="size-3.5 text-brand" />
            {t("credibilidad.eyebrow")}
          </Eyebrow>
          <Headline>{t("credibilidad.headline")}</Headline>
          <Bullets
            items={[
              {
                icon: BadgeCheck,
                text: (
                  <Emphasis
                    lead={t("credibilidad.bullet1.lead")}
                    strong={t("credibilidad.bullet1.strong")}
                    rest={t("credibilidad.bullet1.rest")}
                  />
                ),
              },
              {
                icon: FileText,
                text: (
                  <Emphasis
                    lead={t("credibilidad.bullet2.lead")}
                    strong={t("credibilidad.bullet2.strong")}
                    rest={t("credibilidad.bullet2.rest")}
                  />
                ),
              },
            ]}
          />
        </div>
        {/* Tarjeta: el propio sistema cazó una cita alucinada y la eliminó */}
        <div className="surface-card p-7">
          <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-brand">
            <ShieldCheck className="size-3.5" />
            {t("credibilidad.cardTag")}
          </span>
          <p className="mt-4 font-serif text-2xl font-semibold leading-snug tracking-tight text-navy">
            {t("credibilidad.cardTitle")}
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {t("credibilidad.cardBody")}
          </p>
          <div className="mt-5 flex items-center gap-2 rounded-xl bg-secondary px-4 py-3">
            <Quote className="size-4 shrink-0 text-brand" />
            <span className="text-sm font-medium text-navy">
              {t("credibilidad.cardQuote")}
            </span>
          </div>
        </div>
      </div>
    ),
  },

  // 8 · Resolver sin juez
  {
    id: "resolver",
    kickerKey: "kicker.resolver",
    render: (t) => (
      <div className="grid items-center gap-10 lg:grid-cols-[1fr_0.9fr]">
        <div>
          <Eyebrow>
            <Building2 className="size-3.5 text-brand" />
            {t("resolver.eyebrow")}
          </Eyebrow>
          <Headline>{t("resolver.headline")}</Headline>
          <Bullets
            items={[
              {
                icon: FileText,
                text: (
                  <Emphasis
                    lead={t("resolver.bullet1.lead")}
                    strong={t("resolver.bullet1.strong")}
                    rest={t("resolver.bullet1.rest")}
                  />
                ),
              },
              {
                icon: Clock,
                text: (
                  <Emphasis
                    lead={t("resolver.bullet2.lead")}
                    strong={t("resolver.bullet2.strong")}
                    rest={t("resolver.bullet2.rest")}
                  />
                ),
              },
            ]}
          />
        </div>
        <div className="surface-navy p-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/55">
            {t("resolver.statTitle")}
          </p>
          <p className="mt-4 font-serif text-6xl font-semibold text-white">
            {t("resolver.statFigure")}
          </p>
          <p className="mt-2 text-sm text-white/65">{t("resolver.statNote")}</p>
        </div>
      </div>
    ),
  },

  // 9 · El juez decide
  {
    id: "juez",
    kickerKey: "kicker.juez",
    render: (t) => (
      <div>
        <div className="max-w-2xl">
          <Eyebrow>
            <Gavel className="size-3.5 text-brand" />
            {t("juez.eyebrow")}
          </Eyebrow>
          <Headline>{t("juez.headline")}</Headline>
        </div>
        <Bullets
          items={[
            {
              icon: Scale,
              text: (
                <Emphasis
                  lead={t("juez.bullet1.lead")}
                  strong={t("juez.bullet1.strong")}
                  rest={t("juez.bullet1.rest")}
                />
              ),
            },
            {
              icon: Layers,
              text: (
                <Emphasis
                  lead={t("juez.bullet2.lead")}
                  strong={t("juez.bullet2.strong")}
                  rest={t("juez.bullet2.rest")}
                />
              ),
            },
            {
              icon: Gavel,
              text: (
                <Emphasis
                  lead={t("juez.bullet3.lead")}
                  strong={t("juez.bullet3.strong")}
                  rest={t("juez.bullet3.rest")}
                />
              ),
            },
          ]}
        />
      </div>
    ),
  },

  // 10 · Equidad
  {
    id: "equidad",
    kickerKey: "kicker.equidad",
    render: (t) => (
      <div className="grid items-center gap-10 lg:grid-cols-[1fr_1fr]">
        <div>
          <Eyebrow>
            <BadgeCheck className="size-3.5 text-brand" />
            {t("equidad.eyebrow")}
          </Eyebrow>
          <Headline>{t("equidad.headline")}</Headline>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground text-pretty">
            {t("equidad.bodyLead")}{" "}
            <strong className="text-navy">{t("equidad.bodyStrong")}</strong>{" "}
            {t("equidad.bodyRest")}
          </p>
        </div>
        <div className="grid gap-4">
          <div className="surface-card p-6">
            <p className="font-serif text-base font-semibold text-navy">
              {t("equidad.card1Title")}
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              {t("equidad.card1Text")}
            </p>
          </div>
          <div className="surface-card p-6">
            <p className="font-serif text-base font-semibold text-navy">
              {t("equidad.card2Title")}
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              {t("equidad.card2Text")}
            </p>
          </div>
        </div>
      </div>
    ),
  },

  // 11 · Impacto / negocio
  {
    id: "impacto",
    kickerKey: "kicker.impacto",
    render: (t) => {
      const modelos = [
        {
          icon: Scale,
          tag: t("impacto.cards.b2g.tag"),
          titulo: t("impacto.cards.b2g.title"),
          texto: t("impacto.cards.b2g.text"),
        },
        {
          icon: Building2,
          tag: t("impacto.cards.b2b.tag"),
          titulo: t("impacto.cards.b2b.title"),
          texto: t("impacto.cards.b2b.text"),
        },
        {
          icon: User,
          tag: t("impacto.cards.b2c.tag"),
          titulo: t("impacto.cards.b2c.title"),
          texto: t("impacto.cards.b2c.text"),
        },
      ];
      return (
        <div>
          <div className="max-w-2xl">
            <Eyebrow>
              <Sparkles className="size-3.5 text-brand" />
              {t("impacto.eyebrow")}
            </Eyebrow>
            <Headline>{t("impacto.headline")}</Headline>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {modelos.map((m) => (
              <div key={m.tag} className="surface-card p-7">
                <div className="flex items-center justify-between">
                  <span className="grid size-11 place-items-center rounded-xl bg-navy text-white">
                    <m.icon className="size-5" />
                  </span>
                  <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-bold tracking-wide text-brand">
                    {m.tag}
                  </span>
                </div>
                <h3 className="mt-4 font-serif text-lg font-semibold tracking-tight text-navy">
                  {m.titulo}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {m.texto}
                </p>
              </div>
            ))}
          </div>
        </div>
      );
    },
  },

  // 12 · Cierre
  {
    id: "cierre",
    kickerKey: "kicker.cierre",
    render: (t) => (
      <div className="text-center">
        <div className="flex justify-center">
          <span className="grid size-14 place-items-center rounded-2xl bg-primary shadow-lg shadow-primary/20">
            <ShieldCheck className="size-7 text-white" aria-hidden />
          </span>
        </div>
        <h2 className="mx-auto mt-6 max-w-3xl font-serif text-4xl font-semibold leading-[1.05] tracking-tight text-balance text-navy sm:text-5xl lg:text-6xl">
          {t("cierre.headlineLead")}{" "}
          <span className="text-brand">{t("cierre.headlineEmphasis")}</span>{" "}
          {t("cierre.headlineRest")}
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground text-pretty">
          {t("cierre.body")}
        </p>
        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/asistente"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-7 text-base font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <Mic className="size-4" />
            {t("cierre.ctaDemo")}
          </Link>
          <Link
            href="/atlas"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-border bg-white px-7 text-base font-semibold text-foreground transition-colors hover:bg-secondary"
          >
            <MapIcon className="size-4 text-brand" />
            {t("cierre.ctaAtlas")}
          </Link>
        </div>
        <p className="mt-8 font-serif text-lg font-semibold tracking-tight text-brand">
          {t("cierre.url")}
        </p>
      </div>
    ),
  },
];

/* ──────────────────────────────────────────────────────────────────────────
   El deck: estado de slide actual, navegación por teclado y controles.
   ────────────────────────────────────────────────────────────────────────── */
export function PitchDeck() {
  const t = useT("pitch");
  const [i, setI] = useState(0);
  const total = SLIDES.length;
  const liveRef = useRef<HTMLDivElement>(null);

  const goTo = useCallback(
    (n: number) => setI(Math.max(0, Math.min(total - 1, n))),
    [total],
  );
  const next = useCallback(() => goTo(i + 1), [goTo, i]);
  const prev = useCallback(() => goTo(i - 1), [goTo, i]);

  // Teclado: ←/→ navegan, Inicio/Fin saltan a extremos, Espacio avanza, Esc
  // vuelve al inicio de la app. Se ignora cuando hay foco en campos de texto.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }
      switch (e.key) {
        case "ArrowRight":
        case "PageDown":
          e.preventDefault();
          next();
          break;
        case " ":
          e.preventDefault();
          next();
          break;
        case "ArrowLeft":
        case "PageUp":
          e.preventDefault();
          prev();
          break;
        case "Home":
          e.preventDefault();
          goTo(0);
          break;
        case "End":
          e.preventDefault();
          goTo(total - 1);
          break;
        case "Escape":
          e.preventDefault();
          window.location.assign("/");
          break;
        default:
          break;
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev, goTo, total]);

  const progreso = useMemo(() => ((i + 1) / total) * 100, [i, total]);
  const actual = SLIDES[i];
  const actualKicker = t(actual.kickerKey);

  return (
    <div className="fixed inset-0 z-[80] flex flex-col bg-background">
      {/* Barra de progreso */}
      <div
        className="absolute inset-x-0 top-0 z-10 h-1.5 bg-border/60"
        role="progressbar"
        aria-valuenow={i + 1}
        aria-valuemin={1}
        aria-valuemax={total}
        aria-label={t("nav.progressLabel", { index: i + 1, total })}
      >
        <div
          className="h-full bg-primary transition-[width] duration-300 ease-out"
          style={{ width: `${progreso}%` }}
        />
      </div>

      {/* Cabecera discreta: marca + salir */}
      <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-4 pt-4 sm:px-6">
        <span className="inline-flex items-center gap-2 text-sm font-semibold text-navy">
          <span className="grid size-7 place-items-center rounded-lg bg-primary">
            <ShieldCheck className="size-4 text-white" aria-hidden />
          </span>
          {t("chrome.brand")}
          <span className="hidden text-xs font-normal uppercase tracking-[0.16em] text-muted-foreground sm:inline">
            · {actualKicker}
          </span>
        </span>
        <div className="flex items-center gap-2">
          <Link
            href="/"
            aria-label={t("chrome.homeLabel")}
            className="inline-flex size-9 items-center justify-center rounded-full border border-border bg-white/80 text-muted-foreground backdrop-blur transition-colors hover:text-brand"
          >
            <HomeIcon className="size-4" />
          </Link>
          <Link
            href="/"
            aria-label={t("chrome.exitLabel")}
            className="inline-flex size-9 items-center justify-center rounded-full border border-border bg-white/80 text-muted-foreground backdrop-blur transition-colors hover:text-brand"
          >
            <X className="size-4" />
          </Link>
        </div>
      </div>

      {/* Lienzo del slide */}
      <div
        ref={liveRef}
        className="flex-1 overflow-y-auto"
        aria-live="polite"
        aria-atomic="true"
      >
        <Slide label={t("nav.slideOf", { index: i + 1, total })}>
          {/* key={i} remonta el contenido en cada cambio para reanimar la entrada;
              el className respeta prefers-reduced-motion (módulo CSS local). */}
          <div key={i} className={anim.slideEnter}>
            {actual.render(t)}
          </div>
        </Slide>
      </div>

      {/* Controles inferiores: anterior / puntos / siguiente */}
      <div className="absolute inset-x-0 bottom-0 z-10 flex items-center justify-between gap-4 px-4 pb-5 sm:px-8 sm:pb-7">
        <button
          type="button"
          onClick={prev}
          disabled={i === 0}
          aria-label={t("nav.prevLabel")}
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-4 py-2.5 text-sm font-semibold text-foreground shadow-sm transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ArrowLeft className="size-4" />
          <span className="hidden sm:inline">{t("nav.prev")}</span>
        </button>

        {/* Puntos de navegación */}
        <div
          className="flex items-center gap-2"
          role="tablist"
          aria-label={t("nav.dotsLabel")}
        >
          {SLIDES.map((s, idx) => (
            <button
              key={s.id}
              type="button"
              role="tab"
              aria-selected={idx === i}
              aria-label={t("nav.goToSlide", {
                index: idx + 1,
                kicker: t(s.kickerKey),
              })}
              onClick={() => goTo(idx)}
              className={
                idx === i
                  ? "h-2.5 w-7 rounded-full bg-primary transition-all"
                  : "h-2.5 w-2.5 rounded-full bg-border transition-all hover:bg-primary/40"
              }
            />
          ))}
        </div>

        {i < total - 1 ? (
          <button
            type="button"
            onClick={next}
            aria-label={t("nav.nextLabel")}
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary-hover"
          >
            <span className="hidden sm:inline">{t("nav.next")}</span>
            <ArrowRight className="size-4" />
          </button>
        ) : (
          <Link
            href="/asistente"
            aria-label={t("nav.toDemoLabel")}
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary-hover"
          >
            <Mic className="size-4" />
            <span>{t("nav.toDemo")}</span>
          </Link>
        )}
      </div>

      {/* Pista de teclado */}
      <p className="pointer-events-none absolute inset-x-0 bottom-1 z-0 hidden text-center text-[10px] text-muted-foreground/60 sm:block">
        {t("nav.keyboardHint")}
      </p>
    </div>
  );
}

export default PitchDeck;
