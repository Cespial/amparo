"use client";

// Página oculta "Cómo lo construimos" (/tech). No enlazada en el nav; accesible
// por URL para explicar el stack y la arquitectura al jurado. Bilingüe (useLang).
import Link from "next/link";
import { useLang } from "@/lib/i18n";
import {
  Cpu,
  Mic,
  AudioLines,
  ScanText,
  Map as MapIcon,
  BookCheck,
  Boxes,
  Languages,
  Database,
  Rocket,
  ShieldCheck,
  GitBranch,
} from "lucide-react";

const COPIA = {
  es: {
    eyebrow: "Detrás de Amparo",
    title: "Cómo lo construimos",
    titleAccent: "y con qué.",
    intro:
      "Amparo se construyó para el Hackathon ODR 2026 (Suffolk University). Aquí está el stack tecnológico, la arquitectura y las decisiones de ingeniería detrás de la plataforma — la idea de “la cuarta parte” aplicada a su propia construcción.",
    stackTitle: "Stack tecnológico",
    archTitle: "Arquitectura",
    archNote:
      "Un solo objeto Caso fluye por las cuatro vistas. La capa de IA solo cita el corpus verificado. Sin base de datos: datos versionados → el demo nunca se cae.",
    decTitle: "Decisiones de ingeniería",
    metaTitle: "Construido con orquestación multi-agente",
    metaBody:
      "Amparo se desarrolló con Claude Code ejecutando workflows de agentes en paralelo: olas de subagentes (construir → QA adversarial → corregir) para las vistas, la capa de IA, el pipeline de datos, el sistema de marca y la capa bilingüe. La misma “cuarta parte”, aplicada a sí misma.",
    layerClient: "Cliente — Next.js 16 (App Router · RSC)",
    layerApi: "API routes — runtime Node",
    layerAi: "Capa de IA",
    layerData: "Datos — versionados, sin base de datos",
    back: "Volver al inicio",
    repo: "Ver el código",
  },
  en: {
    eyebrow: "Behind Amparo",
    title: "How we built it",
    titleAccent: "and with what.",
    intro:
      "Amparo was built for the ODR Hackathon 2026 (Suffolk University). Here is the tech stack, the architecture and the engineering decisions behind the platform — the “fourth party” idea applied to its own construction.",
    stackTitle: "Tech stack",
    archTitle: "Architecture",
    archNote:
      "A single Caso object flows through all four views. The AI layer only cites the verified corpus. No database: versioned data → the demo never goes blank.",
    decTitle: "Engineering decisions",
    metaTitle: "Built with multi-agent orchestration",
    metaBody:
      "Amparo was developed with Claude Code running parallel agent workflows: fan-out waves of subagents (build → adversarial QA → fix) for the views, the AI layer, the data pipeline, the brand system and the bilingual layer. The same “fourth party”, applied to itself.",
    layerClient: "Client — Next.js 16 (App Router · RSC)",
    layerApi: "API routes — Node runtime",
    layerAi: "AI layer",
    layerData: "Data — versioned, no database",
    back: "Back to home",
    repo: "View the code",
  },
} as const;

const STACK = [
  {
    icon: Cpu,
    es: { t: "IA · Razonamiento", d: "Claude (AI SDK v6): Opus para predicción/fallo/mediación, Haiku para triaje rápido." },
    en: { t: "AI · Reasoning", d: "Claude (AI SDK v6): Opus for prediction/ruling/mediation, Haiku for fast triage." },
  },
  {
    icon: Mic,
    es: { t: "Voz · TTS", d: "ElevenLabs multilingüe — Amparo habla ES/EN (fallback Web Speech)." },
    en: { t: "Voice · TTS", d: "ElevenLabs multilingual — Amparo speaks ES/EN (Web Speech fallback)." },
  },
  {
    icon: AudioLines,
    es: { t: "Voz · STT", d: "ElevenLabs Scribe + OpenAI Whisper de respaldo — entiende EN/ES y acentos." },
    en: { t: "Speech · STT", d: "ElevenLabs Scribe + OpenAI Whisper fallback — understands EN/ES and accents." },
  },
  {
    icon: ScanText,
    es: { t: "Multimodal · Anexos", d: "Claude vision lee imágenes y PDFs (OCR + comprensión) y complementa el caso." },
    en: { t: "Multimodal · Annexes", d: "Claude vision reads images & PDFs (OCR + comprehension) and enriches the case." },
  },
  {
    icon: MapIcon,
    es: { t: "Mapa", d: "react-map-gl / MapLibre GL (basemap dark, sin token) — coroplético, 2D/3D, capas IPS." },
    en: { t: "Map", d: "react-map-gl / MapLibre GL (dark basemap, no token) — choropleth, 2D/3D, IPS layers." },
  },
  {
    icon: BookCheck,
    es: { t: "RAG · Grounding", d: "Recuperación léxica sobre 38 Sentencias T verificadas. Solo cita el corpus." },
    en: { t: "RAG · Grounding", d: "Lexical retrieval over 38 verified Sentencias T. Cites only the corpus." },
  },
  {
    icon: Boxes,
    es: { t: "UI / Diseño", d: "Next.js 16 · Tailwind v4 · shadcn/ui · Source Serif 4 + Hanken Grotesk." },
    en: { t: "UI / Design", d: "Next.js 16 · Tailwind v4 · shadcn/ui · Source Serif 4 + Hanken Grotesk." },
  },
  {
    icon: Languages,
    es: { t: "Bilingüe", d: "Provider i18n ES/EN con paridad total; la IA también responde en el idioma activo." },
    en: { t: "Bilingual", d: "ES/EN i18n provider with full parity; the AI answers in the active language too." },
  },
  {
    icon: Database,
    es: { t: "Datos", d: "datos.gov.co (Corte Constitucional + REPS/MinSalud), DANE. Cada cifra real o marcada." },
    en: { t: "Data", d: "datos.gov.co (Constitutional Court + REPS/MinSalud), DANE. Every figure real or marked." },
  },
  {
    icon: Rocket,
    es: { t: "Estado · Deploy", d: "Zustand (un Caso) · Vercel · amparo.help." },
    en: { t: "State · Deploy", d: "Zustand (one Caso) · Vercel · amparo.help." },
  },
];

const DECISIONES = [
  {
    icon: Boxes,
    es: { t: "Un solo Caso", d: "El mismo objeto recorre demandante → EPS → juez: coherencia total en el demo." },
    en: { t: "One Caso", d: "The same object flows claimant → EPS → judge: total demo coherence." },
  },
  {
    icon: ShieldCheck,
    es: { t: "Anti-alucinación", d: "El predictor solo cita sentencias del corpus recuperado; una auditoría adversarial cazó y eliminó una cita inventada." },
    en: { t: "Anti-hallucination", d: "The predictor cites only retrieved-corpus rulings; an adversarial audit caught and removed a hallucinated citation." },
  },
  {
    icon: Database,
    es: { t: "Demo-safe", d: "Sin base de datos en vivo: corpus y casos versionados + fixtures del caso héroe." },
    en: { t: "Demo-safe", d: "No live database: versioned corpus and cases + hero-case fixtures." },
  },
  {
    icon: ShieldCheck,
    es: { t: "Guarda de procedencia", d: "Peticiones improcedentes (p. ej. sustancias ilícitas) → ~0% e inadmisible, sin citas engañosas." },
    en: { t: "Admissibility guard", d: "Improper requests (e.g. illegal substances) → ~0% and inadmissible, with no misleading citations." },
  },
];

export function TechPage() {
  const { lang } = useLang();
  const t = COPIA[lang];
  const layers = [
    { label: t.layerClient, items: "/ · /atlas · /asistente · /demandante · /demandado · /juez · /impacto · /pitch", tone: "bg-secondary text-foreground" },
    { label: t.layerApi, items: "estructurar · triaje · predecir · generar · mediar · anexos · voz · transcribir", tone: "bg-secondary text-foreground" },
    { label: t.layerAi, items: "Claude (Opus · Haiku · vision) · ElevenLabs (TTS · Scribe) · Whisper", tone: "surface-navy" },
    { label: t.layerData, items: "Corpus: 38 Sentencias T · datos.gov.co (Corte · REPS · DANE)", tone: "bg-secondary text-foreground" },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      <header className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-strong">
          {t.eyebrow}
        </p>
        <h1 className="mt-2 font-heading text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
          {t.title} <span className="text-brand">{t.titleAccent}</span>
        </h1>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground text-pretty sm:text-lg">
          {t.intro}
        </p>
      </header>

      {/* Stack */}
      <section className="mt-12">
        <h2 className="font-heading text-2xl font-semibold tracking-tight">
          {t.stackTitle}
        </h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {STACK.map((s) => (
            <div key={s.en.t} className="surface-card flex gap-3 p-5">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-secondary text-brand">
                <s.icon className="size-5" />
              </span>
              <div>
                <h3 className="font-heading text-base font-semibold">{s[lang].t}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {s[lang].d}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Arquitectura — diagrama de capas */}
      <section className="mt-12">
        <h2 className="font-heading text-2xl font-semibold tracking-tight">
          {t.archTitle}
        </h2>
        <div className="mt-5 flex flex-col items-stretch gap-2">
          {layers.map((l, i) => (
            <div key={l.label}>
              <div
                className={`rounded-2xl border border-border p-4 ${l.tone === "surface-navy" ? "surface-navy" : l.tone}`}
              >
                <p className="text-xs font-semibold uppercase tracking-[0.14em] opacity-80">
                  {l.label}
                </p>
                <p className="mt-1 font-mono text-sm">{l.items}</p>
              </div>
              {i < layers.length - 1 && (
                <div className="flex justify-center py-1 text-muted-foreground" aria-hidden>
                  ↓
                </div>
              )}
            </div>
          ))}
        </div>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          {t.archNote}
        </p>
      </section>

      {/* Decisiones */}
      <section className="mt-12">
        <h2 className="font-heading text-2xl font-semibold tracking-tight">
          {t.decTitle}
        </h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {DECISIONES.map((d) => (
            <div key={d.en.t} className="surface-card flex gap-3 p-5">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-secondary text-brand">
                <d.icon className="size-5" />
              </span>
              <div>
                <h3 className="font-heading text-base font-semibold">{d[lang].t}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {d[lang].d}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Meta — orquestación multi-agente */}
      <section className="mt-12">
        <div className="surface-navy p-7 sm:p-8">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-primary text-white">
              <GitBranch className="size-5" />
            </span>
            <h2 className="font-heading text-xl font-semibold text-white sm:text-2xl">
              {t.metaTitle}
            </h2>
          </div>
          <p className="mt-4 max-w-3xl leading-relaxed text-white/75">
            {t.metaBody}
          </p>
        </div>
      </section>

      <footer className="mt-12 flex flex-wrap gap-3">
        <Link
          href="/"
          className="inline-flex min-h-11 items-center rounded-xl border border-border bg-white px-5 text-sm font-semibold transition-colors hover:bg-secondary"
        >
          {t.back}
        </Link>
        <a
          href="https://github.com/Cespial/amparo"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
        >
          {t.repo}
        </a>
      </footer>
    </div>
  );
}
