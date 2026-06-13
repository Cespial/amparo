import Link from "next/link";
import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "Amparo — La justicia en salud, al alcance de todos",
  description:
    "Plataforma ODR de tutelas de salud de Colombia. Resuelve lo que tu EPS te negó —rápido, gratis y con respaldo en la jurisprudencia de la Corte Constitucional.",
};

const PASOS = [
  {
    icon: Mic,
    titulo: "Cuéntalo con tus palabras",
    texto:
      "Hablando o escribiendo, sin lenguaje jurídico. Amparo entiende tu caso y lo organiza por ti.",
  },
  {
    icon: ShieldCheck,
    titulo: "Amparo evalúa y actúa",
    texto:
      "Verifica si tu tutela procede, predice el resultado citando sentencias reales y redacta el documento.",
  },
  {
    icon: Scale,
    titulo: "Se resuelve",
    texto:
      "Tu EPS cede antes del juez, o llega al juez con un fallo ya fundamentado, listo para revisar y firmar. Tú decides el camino.",
  },
];

const VALORES = [
  {
    icon: Mic,
    titulo: "Tu voz, primero",
    texto:
      "Diseñada para todos, sin importar tu escolaridad. Cuenta tu historia y escúchala explicada.",
  },
  {
    icon: Quote,
    titulo: "Sin caja negra",
    texto:
      "Cada pronóstico se sustenta en jurisprudencia verificable de la Corte Constitucional.",
  },
  {
    icon: BadgeCheck,
    titulo: "Decisiones consistentes",
    texto:
      "El mismo reclamo recibe el mismo trato. Menos arbitrariedad, más equidad.",
  },
  {
    icon: Scale,
    titulo: "La última palabra es humana",
    texto:
      "Amparo no reemplaza al juez: le devuelve el tiempo para los casos que de verdad lo necesitan.",
  },
];

const ROLES = [
  {
    href: "/atlas",
    icon: MapIcon,
    label: "Atlas",
    desc: "El mapa del problema en Colombia",
  },
  {
    href: "/demandante",
    icon: User,
    label: "Demandante",
    desc: "De tu historia a tu tutela",
  },
  {
    href: "/demandado",
    icon: Building2,
    label: "Demandado · EPS",
    desc: "Resolver antes del juez",
  },
  {
    href: "/juez",
    icon: Scale,
    label: "Juez",
    desc: "Despacho asistido por IA",
  },
];

export default function Home() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6">
      {/* ───────────── Hero ───────────── */}
      <section className="grid items-center gap-10 py-12 sm:py-16 lg:grid-cols-[1.15fr_0.85fr] lg:py-24">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground backdrop-blur">
            <ShieldCheck className="size-3.5 text-brand" />
            ODR · Resolución de disputas en salud
          </span>

          <h1 className="mt-5 font-heading text-4xl font-semibold leading-[1.05] tracking-tight text-balance sm:text-5xl lg:text-6xl">
            La justicia en salud,{" "}
            <span className="text-brand">al alcance de todos.</span>
          </h1>

          <p className="mt-5 text-lg leading-relaxed text-muted-foreground text-pretty sm:text-xl">
            Amparo es <strong className="text-foreground">la cuarta parte</strong>
            : te ayuda a resolver lo que tu EPS te negó —rápido, gratis y con
            respaldo en la jurisprudencia de la Corte Constitucional. Sin
            abogados, sin filas.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/asistente"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-base font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              <Mic className="size-4" />
              Habla con Amparo
            </Link>
            <Link
              href="/demandante"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-border bg-white px-6 text-base font-semibold text-foreground transition-colors hover:bg-secondary"
            >
              Empezar mi caso
              <ArrowRight className="size-4" />
            </Link>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
            <Link
              href="/atlas"
              className="inline-flex items-center gap-1.5 font-medium text-foreground transition-colors hover:text-brand"
            >
              <MapIcon className="size-4 text-brand" />
              Ver el mapa del problema
            </Link>
            <span className="hidden sm:inline text-muted-foreground/50">·</span>
            <span>Respaldado en sentencias reales · La decisión final siempre es humana.</span>
          </div>
        </div>

        {/* Tarjeta de cifras — el problema en números */}
        <div className="surface-navy p-7 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/55">
            El problema, en números
          </p>
          <div className="mt-6 space-y-6">
            {[
              {
                cifra: "197.737",
                unidad: "tutelas de salud · 2023",
                nota: "La salud es el principal motivo de tutela en Colombia. Fuente: Corte Constitucional / Defensoría del Pueblo, 2023.",
              },
              {
                cifra: "80%",
                unidad: "se conceden",
                nota: "Porque pedían algo que ya era su derecho. Fuente: Defensoría del Pueblo, 2023.",
              },
              {
                cifra: "minutos",
                unidad: "no meses",
                nota: "Lo que hoy tarda semanas, asistido por IA toma minutos.",
              },
            ].map((s) => (
              <div
                key={s.unidad}
                className="border-b border-white/10 pb-5 last:border-0 last:pb-0"
              >
                <div className="flex items-baseline gap-2">
                  <span className="font-heading text-3xl font-semibold text-white sm:text-4xl">
                    {s.cifra}
                  </span>
                  <span className="text-sm font-medium text-white/70">
                    {s.unidad}
                  </span>
                </div>
                <p className="mt-1 text-sm text-white/60">{s.nota}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────── Cómo funciona ───────────── */}
      <section className="py-12 sm:py-16">
        <header className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-strong">
            Cómo funciona
          </p>
          <h2 className="mt-2 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
            Tres pasos. Cero formularios incomprensibles.
          </h2>
        </header>

        <ol className="mt-10 grid gap-5 md:grid-cols-3">
          {PASOS.map((p, i) => (
            <li key={p.titulo} className="surface-card p-7">
              <div className="flex items-center gap-3">
                <span className="grid size-11 place-items-center rounded-xl bg-secondary text-brand">
                  <p.icon className="size-5" />
                </span>
                <span className="font-heading text-sm font-semibold text-muted-foreground">
                  Paso {i + 1}
                </span>
              </div>
              <h3 className="mt-4 font-heading text-xl font-semibold tracking-tight">
                {p.titulo}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {p.texto}
              </p>
            </li>
          ))}
        </ol>
      </section>

      {/* ───────────── Por qué Amparo ───────────── */}
      <section className="py-12 sm:py-16">
        <div className="surface-card overflow-hidden p-8 sm:p-12">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
            <header className="max-w-md">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-strong">
                Por qué Amparo
              </p>
              <h2 className="mt-2 font-heading text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
                Acceso real a la justicia, no solo a un formulario.
              </h2>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                Acceder no es solo poder iniciar el trámite: es poder usarlo y
                llegar a un resultado justo. Amparo está diseñada para que
                cualquier persona lo logre.
              </p>
            </header>

            <ul className="grid gap-5 sm:grid-cols-2">
              {VALORES.map((v) => (
                <li key={v.titulo} className="flex gap-4">
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
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ───────────── Explorar la plataforma ───────────── */}
      <section className="py-12 sm:py-16">
        <header className="mb-8 max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-strong">
            Explora la plataforma
          </p>
          <h2 className="mt-2 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
            Una disputa, cuatro miradas.
          </h2>
          <p className="mt-3 text-base leading-relaxed text-muted-foreground">
            El mismo caso recorre al demandante, a la EPS y al juez —con total
            transparencia entre las partes.
          </p>
        </header>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {ROLES.map((r) => (
            <Link
              key={r.href}
              href={r.href}
              className="surface-card group flex flex-col gap-3 p-6 transition-transform hover:-translate-y-0.5"
            >
              <span className="grid size-11 place-items-center rounded-xl bg-navy text-white">
                <r.icon className="size-5" />
              </span>
              <div>
                <h3 className="font-heading text-lg font-semibold tracking-tight">
                  {r.label}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">{r.desc}</p>
              </div>
              <span className="mt-auto inline-flex items-center gap-1 text-sm font-medium text-brand">
                Entrar
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
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
              Amparo
            </span>
          </div>
          <p className="max-w-xl text-xs leading-relaxed text-muted-foreground">
            Amparo es una herramienta de apoyo asistida por IA; no constituye
            asesoría jurídica vinculante y la decisión final siempre es humana.
            Las predicciones son estimaciones basadas en jurisprudencia real de
            la Corte Constitucional de Colombia. Los casos y personas de esta
            demo son ficticios. Hackathon ODR 2026.
          </p>
        </div>
      </footer>
    </div>
  );
}
