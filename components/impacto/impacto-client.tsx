"use client";

// components/impacto/impacto-client.tsx — Vista /impacto: dashboard
// "Si Amparo escalara" + caso de negocio. Refuerza el criterio de VIABILIDAD.
//
// Aislamiento i18n: importamos SÓLO useLang() de '@/lib/i18n' (lectura) y
// resolvemos la copia con el diccionario LOCAL impactoDict(lang). No tocamos
// lib/i18n/index.ts ni ningún diccionario global.
//
// Integridad de datos: el cálculo vive en MODELO (impacto-dict.ts) con la
// procedencia de cada constante. Toda proyección se etiqueta como ESTIMACIÓN
// y todos los supuestos son visibles (caja "Supuestos") y editables.

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Scale,
  Building2,
  User,
  Sparkles,
  TrendingDown,
  Clock,
  PiggyBank,
  Info,
  RotateCcw,
  ArrowRight,
  Mic,
  ShieldCheck,
  CheckCircle2,
  CircleDot,
  SlidersHorizontal,
} from "lucide-react";
import { useLang } from "@/lib/i18n";
import { impactoDict, MODELO } from "./impacto-dict";
import { fmtInt, fmtCop, fmtCopExact } from "./format";
import { BeforeAfterBars, BusinessDonut } from "./charts";

/* Eyebrow reutilizable, alineado con la estética del deck. */
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

export function ImpactoClient() {
  const { lang } = useLang();
  const d = impactoDict(lang);

  // — Estado interactivo —
  const [pct, setPct] = useState<number>(MODELO.sliderDefault);
  const [horas, setHoras] = useState<number>(MODELO.horasJuezPorTutela);
  const [costo, setCosto] = useState<number>(MODELO.costoPorTutelaCop);

  const isDefault =
    pct === MODELO.sliderDefault &&
    horas === MODELO.horasJuezPorTutela &&
    costo === MODELO.costoPorTutelaCop;

  // — Cálculo en vivo (ESTIMACIÓN sobre supuestos visibles) —
  const calc = useMemo(() => {
    const total = MODELO.tutelasSaludAnio;
    const desviadas = Math.round(total * (pct / 100));
    const lleganAlJuez = total - desviadas;
    const horasJuezAhorradas = desviadas * horas;
    const diasJuezAhorrados = horasJuezAhorradas / MODELO.horasPorDiaJuez;
    const ahorroCop = desviadas * costo;
    return {
      total,
      desviadas,
      lleganAlJuez,
      diasJuezAhorrados,
      ahorroCop,
    };
  }, [pct, horas, costo]);

  const reset = () => {
    setPct(MODELO.sliderDefault);
    setHoras(MODELO.horasJuezPorTutela);
    setCosto(MODELO.costoPorTutelaCop);
  };

  // — Datos de la dona (reparto ilustrativo, no proyección financiera) —
  const donutSegments = [
    {
      key: "b2g",
      label: d.modelo.cards.b2g.tag + " · " + d.modelo.cards.b2g.title,
      value: 45,
      color: "var(--navy)",
    },
    {
      key: "b2b",
      label: d.modelo.cards.b2b.tag + " · " + d.modelo.cards.b2b.title,
      value: 35,
      color: "var(--primary)",
    },
    {
      key: "b2c",
      label: d.modelo.cards.b2c.tag + " · " + d.modelo.cards.b2c.title,
      value: 20,
      color: "#8b91c4",
    },
  ];

  const modeloCards = [
    { icon: Scale, ...d.modelo.cards.b2g },
    { icon: Building2, ...d.modelo.cards.b2b },
    { icon: User, ...d.modelo.cards.b2c },
  ];

  return (
    <div className="text-foreground">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        {/* ── 1 · Encabezado / tesis ───────────────────────────────────── */}
        <header className="max-w-3xl">
          <Eyebrow icon={TrendingDown}>{d.hero.eyebrow}</Eyebrow>
          <h1 className="mt-4 font-serif text-4xl font-semibold leading-[1.05] tracking-tight text-balance text-navy sm:text-5xl lg:text-6xl">
            {d.hero.titleLead}{" "}
            <span className="text-brand">{d.hero.titleEmphasis}</span>
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground text-pretty sm:text-xl">
            {d.hero.subtitle}
          </p>
          <p className="mt-5 max-w-2xl border-l-2 border-primary/40 pl-4 text-base leading-relaxed text-foreground/90 text-pretty">
            {d.hero.thesis}
          </p>
          <span className="mt-6 inline-flex items-center gap-2 rounded-full bg-warning/10 px-3 py-1.5 text-xs font-semibold text-warning">
            <Info className="size-3.5" />
            {d.hero.badgeEstimacion}
          </span>
        </header>

        {/* ── 2 · Proyección interactiva de descongestión ──────────────── */}
        <section className="mt-12 sm:mt-16" aria-labelledby="proj-title">
          <div className="max-w-2xl">
            <Eyebrow icon={Sparkles}>{d.proj.eyebrow}</Eyebrow>
            <h2
              id="proj-title"
              className="mt-3 font-serif text-3xl font-semibold tracking-tight text-navy sm:text-4xl"
            >
              {d.proj.title}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground text-pretty">
              {interp(d.proj.intro, {
                anio: MODELO.anioBase,
                tutelas: fmtInt(MODELO.tutelasSaludAnio, lang),
                plazo: MODELO.plazoFalloDiasHabiles,
              })}
            </p>
          </div>

          <div className="mt-7 grid gap-6 lg:grid-cols-[1fr_1.05fr]">
            {/* Control + métricas */}
            <div className="surface-card p-6 sm:p-7">
              {/* Slider principal */}
              <label
                htmlFor="slider-pct"
                className="flex flex-wrap items-baseline justify-between gap-2"
              >
                <span className="text-sm font-semibold text-navy">
                  {d.proj.sliderLabel}
                </span>
                <span className="font-serif text-3xl font-semibold text-brand tabular-nums">
                  {pct}%
                </span>
              </label>
              <input
                id="slider-pct"
                type="range"
                min={MODELO.sliderMin}
                max={MODELO.sliderMax}
                step={1}
                value={pct}
                onChange={(e) => setPct(Number(e.target.value))}
                aria-valuetext={`${pct}%`}
                className="impacto-range mt-3 w-full"
              />
              <div className="mt-1 flex justify-between text-xs text-muted-foreground">
                <span>{MODELO.sliderMin}%</span>
                <span className="inline-flex items-center gap-1 text-brand-strong">
                  <CircleDot className="size-3" />
                  {interp(d.proj.demoNote, { demo: MODELO.demoResolucion })}
                </span>
                <span>{MODELO.sliderMax}%</span>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                {interp(d.proj.sliderHint, {
                  min: MODELO.sliderMin,
                  max: MODELO.sliderMax,
                  def: MODELO.sliderDefault,
                  demo: MODELO.demoResolucion,
                })}
              </p>

              {/* Métricas vivas */}
              <div className="mt-6 grid gap-3">
                <Metric
                  icon={TrendingDown}
                  tone="brand"
                  value={fmtInt(calc.desviadas, lang)}
                  unit={d.proj.metrics.desviadas.unit}
                  label={d.proj.metrics.desviadas.label}
                  help={d.proj.metrics.desviadas.help}
                  estimacionLabel={d.proj.estimacion}
                />
                <Metric
                  icon={Clock}
                  tone="navy"
                  value={fmtInt(calc.diasJuezAhorrados, lang)}
                  unit={d.proj.metrics.diasJuez.unit}
                  label={d.proj.metrics.diasJuez.label}
                  help={interp(d.proj.metrics.diasJuez.help, {
                    jornada: MODELO.horasPorDiaJuez,
                  })}
                  estimacionLabel={d.proj.estimacion}
                />
                <Metric
                  icon={PiggyBank}
                  tone="success"
                  value={fmtCop(calc.ahorroCop, lang)}
                  unit={d.proj.metrics.ahorro.unit}
                  label={d.proj.metrics.ahorro.label}
                  help={d.proj.metrics.ahorro.help}
                  estimacionLabel={d.proj.estimacion}
                />
              </div>
            </div>

            {/* Gráfico antes/después + supuestos */}
            <div className="flex flex-col gap-6">
              <div className="surface-card p-6 sm:p-7">
                <h3 className="font-serif text-lg font-semibold tracking-tight text-navy">
                  {d.proj.chart.title}
                </h3>
                <div className="mt-5">
                  <BeforeAfterBars
                    total={calc.total}
                    after={calc.lleganAlJuez}
                    beforeLabel={d.proj.chart.before}
                    afterLabel={d.proj.chart.after}
                    beforeNote={interp(d.proj.chart.beforeNote, {
                      n: fmtInt(calc.total, lang),
                    })}
                    afterNote={interp(d.proj.chart.afterNote, {
                      n: fmtInt(calc.lleganAlJuez, lang),
                    })}
                    axisLabel={d.proj.chart.axis}
                  />
                </div>
              </div>

              {/* Caja de supuestos — TODO visible */}
              <div className="surface-card border-warning/30 bg-warning/5 p-6 sm:p-7">
                <h3 className="flex items-center gap-2 font-serif text-lg font-semibold tracking-tight text-navy">
                  <Info className="size-4 text-warning" />
                  {d.proj.assumptions.title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  {d.proj.assumptions.intro}
                </p>
                <ul className="mt-4 grid gap-2.5 text-sm">
                  <AssumptionItem
                    kind="source"
                    tag={d.proj.assumptions.sourceTag}
                  >
                    {interp(d.proj.assumptions.items.tutelas, {
                      tutelas: fmtInt(MODELO.tutelasSaludAnio, lang),
                      anio: MODELO.anioBase,
                    })}
                  </AssumptionItem>
                  <AssumptionItem
                    kind="source"
                    tag={d.proj.assumptions.sourceTag}
                  >
                    {interp(d.proj.assumptions.items.plazo, {
                      plazo: MODELO.plazoFalloDiasHabiles,
                    })}
                  </AssumptionItem>
                  <AssumptionItem
                    kind="source"
                    tag={d.proj.assumptions.sourceTag}
                  >
                    {interp(d.proj.assumptions.items.concesion, {
                      concesion: Math.round(MODELO.tasaConcesion * 100),
                    })}
                  </AssumptionItem>
                  <AssumptionItem
                    kind="assumption"
                    tag={d.proj.assumptions.assumptionTag}
                    extraTag={d.proj.assumptions.editableTag}
                  >
                    {interp(d.proj.assumptions.items.horas, { horas })}
                  </AssumptionItem>
                  <AssumptionItem
                    kind="assumption"
                    tag={d.proj.assumptions.assumptionTag}
                    extraTag={d.proj.assumptions.editableTag}
                  >
                    {interp(d.proj.assumptions.items.costo, {
                      costo: fmtCopExact(costo, lang),
                    })}
                  </AssumptionItem>
                  <AssumptionItem
                    kind="assumption"
                    tag={d.proj.assumptions.assumptionTag}
                  >
                    {interp(d.proj.assumptions.items.jornada, {
                      jornada: MODELO.horasPorDiaJuez,
                    })}
                  </AssumptionItem>
                </ul>

                {/* Controles de supuestos sensibles */}
                <div className="mt-5 border-t border-warning/20 pt-4">
                  <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    <SlidersHorizontal className="size-3.5" />
                    {d.proj.assumptions.controlsTitle}
                  </p>
                  <div className="mt-3 grid gap-4 sm:grid-cols-2">
                    <AssumptionControl
                      id="ctrl-horas"
                      label={d.proj.assumptions.horasControl}
                      value={horas}
                      display={`${horas} h`}
                      min={2}
                      max={12}
                      step={1}
                      onChange={setHoras}
                    />
                    <AssumptionControl
                      id="ctrl-costo"
                      label={d.proj.assumptions.costoControl}
                      value={costo}
                      display={fmtCopExact(costo, lang)}
                      min={300_000}
                      max={3_000_000}
                      step={100_000}
                      onChange={setCosto}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={reset}
                    disabled={isDefault}
                    className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-3.5 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <RotateCcw className="size-3.5" />
                    {d.proj.assumptions.reset}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 3 · Modelo de negocio ────────────────────────────────────── */}
        <section className="mt-14 sm:mt-20" aria-labelledby="modelo-title">
          <div className="max-w-2xl">
            <Eyebrow icon={Building2}>{d.modelo.eyebrow}</Eyebrow>
            <h2
              id="modelo-title"
              className="mt-3 font-serif text-3xl font-semibold tracking-tight text-navy sm:text-4xl"
            >
              {d.modelo.title}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground text-pretty">
              {d.modelo.intro}
            </p>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {modeloCards.map((m) => (
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
                <dl className="mt-4 grid gap-3 text-sm">
                  <Field term={d.modelo.who} desc={m.who} />
                  <Field term={d.modelo.problem} desc={m.problem} />
                  <Field term={d.modelo.pricing} desc={m.pricing} />
                </dl>
              </article>
            ))}
          </div>

          {/* Dona del reparto */}
          <div className="surface-card mt-6 p-6 sm:p-7">
            <h3 className="font-serif text-lg font-semibold tracking-tight text-navy">
              {d.modelo.donut.title}
            </h3>
            <div className="mt-5">
              <BusinessDonut
                segments={donutSegments}
                centerTop="3×"
                centerBottom="B2G·B2B·B2C"
                ariaLabel={d.modelo.donut.title}
              />
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              {d.modelo.donut.note}
            </p>
          </div>
        </section>

        {/* ── 4 · Por qué ahora / por qué nosotros ─────────────────────── */}
        <section className="mt-14 sm:mt-20" aria-labelledby="why-title">
          <div className="max-w-2xl">
            <Eyebrow icon={ShieldCheck}>{d.why.eyebrow}</Eyebrow>
            <h2
              id="why-title"
              className="mt-3 font-serif text-3xl font-semibold tracking-tight text-navy sm:text-4xl"
            >
              {d.why.title}
            </h2>
          </div>
          <div className="mt-7 grid gap-5 lg:grid-cols-2">
            <div className="surface-card p-7">
              <h3 className="flex items-center gap-2 font-serif text-base font-semibold text-navy">
                <Clock className="size-4 text-brand" />
                {d.why.nowTitle}
              </h3>
              <p className="mt-3 text-base leading-relaxed text-muted-foreground text-pretty">
                {d.why.nowBody}
              </p>
            </div>
            <div className="surface-navy p-7">
              <h3 className="flex items-center gap-2 font-serif text-base font-semibold text-white">
                <ShieldCheck className="size-4" />
                {d.why.usTitle}
              </h3>
              <p className="mt-3 text-base leading-relaxed text-white/80 text-pretty">
                {d.why.usBody}
              </p>
              <ul className="mt-5 grid gap-2.5">
                {d.why.moat.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2.5 text-sm text-white/90"
                  >
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          {/* CTA al demo / pitch */}
          <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row">
            <Link
              href="/asistente"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-base font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              <Mic className="size-4" />
              {lang === "es" ? "Probar el demo" : "Try the demo"}
            </Link>
            <Link
              href="/pitch"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-border bg-white px-6 text-base font-semibold text-foreground transition-colors hover:bg-secondary"
            >
              {lang === "es" ? "Ver el pitch" : "See the pitch"}
              <ArrowRight className="size-4 text-brand" />
            </Link>
          </div>
        </section>

        {/* ── 5 · Footer: fuentes + disclaimer ─────────────────────────── */}
        <footer className="mt-14 border-t border-border pt-7 sm:mt-20">
          <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            {d.footer.sourcesTitle}
          </h2>
          <ul className="mt-3 grid gap-1.5">
            {d.footer.sources.map((s) => (
              <li
                key={s}
                className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground"
              >
                <CircleDot className="mt-0.5 size-3 shrink-0 text-brand-strong" />
                {s}
              </li>
            ))}
          </ul>
          <p className="mt-4 rounded-xl bg-secondary/60 p-4 text-xs leading-relaxed text-muted-foreground">
            {d.footer.disclaimer}
          </p>
        </footer>
      </div>
    </div>
  );
}

/* ── Subcomponentes ──────────────────────────────────────────────────────── */

function Metric({
  icon: Icon,
  tone,
  value,
  unit,
  label,
  help,
  estimacionLabel,
}: {
  icon: React.ComponentType<{ className?: string }>;
  tone: "brand" | "navy" | "success";
  value: string;
  unit: string;
  label: string;
  help: string;
  estimacionLabel: string;
}) {
  const toneCls =
    tone === "brand"
      ? "text-brand"
      : tone === "success"
        ? "text-success"
        : "text-navy";
  return (
    <div className="rounded-xl border border-border bg-secondary/40 p-4">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Icon className={`size-4 ${toneCls}`} />
          {label}
        </span>
        <span className="rounded-full bg-warning/10 px-2 py-0.5 text-[10px] font-bold tracking-wide text-warning">
          {estimacionLabel}
        </span>
      </div>
      <div className="mt-2 flex flex-wrap items-baseline gap-x-2">
        <span
          className={`font-serif text-3xl font-semibold tabular-nums ${toneCls}`}
        >
          {value}
        </span>
        <span className="text-xs font-medium text-muted-foreground">{unit}</span>
      </div>
      <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
        {help}
      </p>
    </div>
  );
}

function AssumptionItem({
  kind,
  tag,
  extraTag,
  children,
}: {
  kind: "source" | "assumption";
  tag: string;
  extraTag?: string;
  children: React.ReactNode;
}) {
  const tagCls =
    kind === "source"
      ? "bg-success/15 text-success"
      : "bg-warning/15 text-warning";
  return (
    <li className="flex items-start gap-2 leading-relaxed text-foreground/85">
      <span className="mt-0.5 flex shrink-0 flex-wrap gap-1">
        <span
          className={`rounded px-1.5 py-0.5 text-[9px] font-bold tracking-wide ${tagCls}`}
        >
          {tag}
        </span>
        {extraTag ? (
          <span className="rounded bg-info/15 px-1.5 py-0.5 text-[9px] font-bold tracking-wide text-info">
            {extraTag}
          </span>
        ) : null}
      </span>
      <span className="text-xs">{children}</span>
    </li>
  );
}

function AssumptionControl({
  id,
  label,
  value,
  display,
  min,
  max,
  step,
  onChange,
}: {
  id: string;
  label: string;
  value: number;
  display: string;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="flex items-baseline justify-between gap-2"
      >
        <span className="text-xs font-medium text-foreground">{label}</span>
        <span className="text-xs font-semibold text-navy tabular-nums">
          {display}
        </span>
      </label>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-valuetext={display}
        className="impacto-range impacto-range--sm mt-1.5 w-full"
      />
    </div>
  );
}

function Field({ term, desc }: { term: string; desc: string }) {
  return (
    <div>
      <dt className="text-[11px] font-semibold uppercase tracking-wide text-brand-strong">
        {term}
      </dt>
      <dd className="mt-0.5 leading-relaxed text-muted-foreground">{desc}</dd>
    </div>
  );
}
