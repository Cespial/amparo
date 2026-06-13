"use client";

// app/pitch/deck.tsx
// Deck de pitch navegable a pantalla completa. Estética AAA clara (rojo #ce3a28,
// navy #20243f, lavanda, tarjetas blancas; titulares en Source Serif 4).
// Navegación con teclado (←/→, Inicio/Fin, Espacio, Esc), barra de progreso,
// puntos por slide y controles táctiles. Mobile-friendly. La última slide
// enlaza al demo (/asistente). Componente <Slide> reutilizable más abajo.

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

/* ──────────────────────────────────────────────────────────────────────────
   Modelo de un slide. El contenido vive como datos; el render es declarativo.
   ────────────────────────────────────────────────────────────────────────── */
interface SlideDef {
  id: string;
  kicker: string;
  render: () => React.ReactNode;
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
  index,
  total,
  children,
}: {
  index: number;
  total: number;
  children: React.ReactNode;
}) {
  return (
    <section
      role="group"
      aria-roledescription="slide"
      aria-label={`Slide ${index + 1} de ${total}`}
      className="relative flex min-h-full w-full items-center justify-center px-5 py-20 sm:px-10 lg:px-16"
    >
      <div className="mx-auto w-full max-w-5xl">{children}</div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   Definición de los 11 slides del deck.
   ────────────────────────────────────────────────────────────────────────── */
const SLIDES: SlideDef[] = [
  // 1 · Portada
  {
    id: "portada",
    kicker: "Amparo",
    render: () => (
      <div className="text-center">
        <div className="flex justify-center">
          <span className="grid size-16 place-items-center rounded-2xl bg-primary shadow-lg shadow-primary/20">
            <ShieldCheck className="size-8 text-white" aria-hidden />
          </span>
        </div>
        <p className="mt-6 text-sm font-semibold uppercase tracking-[0.28em] text-brand">
          Amparo
        </p>
        <h1 className="mx-auto mt-4 max-w-4xl font-serif text-4xl font-semibold leading-[1.04] tracking-tight text-balance text-navy sm:text-5xl lg:text-6xl">
          La <span className="text-brand">cuarta parte</span> que descongestiona
          la justicia en salud.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground text-pretty sm:text-xl">
          Una plataforma de resolución en línea para las tutelas de salud de
          Colombia. Da voz a la persona, resuelve antes del juez y le devuelve al
          juez el tiempo para lo que de verdad importa.
        </p>
        <p className="mt-8 inline-flex items-center gap-2 rounded-full border border-border bg-white/70 px-4 py-1.5 text-sm font-medium text-muted-foreground backdrop-blur">
          <MapIcon className="size-4 text-brand" />
          amparo.help · Hackathon ODR 2026
        </p>
      </div>
    ),
  },

  // 2 · El problema
  {
    id: "problema",
    kicker: "El problema",
    render: () => (
      <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <Eyebrow>
            <Scale className="size-3.5 text-brand" />
            El problema
          </Eyebrow>
          <Headline>
            Se demanda al Estado para recibir lo que ya es un derecho.
          </Headline>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground text-pretty">
            La salud es el principal motivo de tutela en Colombia. La mayoría se
            conceden: la persona pedía algo que la ley ya le garantizaba. Es un
            sistema que obliga a litigar para acceder a lo evidente.
          </p>
        </div>
        <div className="surface-navy p-7 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/55">
            El problema, en números
          </p>
          <div className="mt-6 space-y-6">
            <StatCard
              cifra="197.737"
              unidad="tutelas de salud · 2023"
              nota="La salud es el primer motivo de tutela del país."
            />
            <StatCard
              cifra="80%"
              unidad="se conceden"
              nota="Porque pedían algo que ya era su derecho."
            />
            <StatCard
              cifra="meses"
              unidad="de espera"
              nota="Tiempo del juez consumido en casos repetidos y evidentes."
            />
          </div>
        </div>
      </div>
    ),
  },

  // 3 · La persona
  {
    id: "persona",
    kicker: "La persona, no el caso",
    render: () => (
      <div className="grid items-center gap-10 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="surface-card flex flex-col items-center p-8 text-center">
          <span className="grid size-24 place-items-center rounded-full bg-secondary text-brand">
            <User className="size-12" />
          </span>
          <p className="mt-5 font-serif text-2xl font-semibold text-navy">
            Amparo, 68 años
          </p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Le negaron la cirugía de cadera. No tiene abogado ni sabe por dónde
            empezar.
          </p>
          <span className="mt-5 inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1.5 text-sm font-medium text-brand">
            <Mic className="size-4" />
            Y aun así, puede contar su historia.
          </span>
        </div>
        <div>
          <Eyebrow>
            <User className="size-3.5 text-brand" />
            La persona, no el caso
          </Eyebrow>
          <Headline>Detrás de cada tutela hay alguien esperando.</Headline>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground text-pretty">
            Conozcan a Amparo. No empezamos por el expediente: empezamos por la
            persona. Lo más importante para quien acude a la justicia es poder
            contar lo que le pasó —con sus propias palabras.
          </p>
        </div>
      </div>
    ),
  },

  // 4 · Cómo funciona
  {
    id: "como-funciona",
    kicker: "Cómo funciona",
    render: () => (
      <div>
        <div className="text-center">
          <Eyebrow>
            <Sparkles className="size-3.5 text-brand" />
            Cómo funciona
          </Eyebrow>
          <h2 className="mx-auto mt-4 max-w-3xl font-serif text-4xl font-semibold leading-[1.06] tracking-tight text-balance text-navy sm:text-5xl">
            Tres pasos. Cero formularios incomprensibles.
          </h2>
        </div>
        <ol className="mt-10 grid gap-5 md:grid-cols-3">
          {[
            {
              icon: Mic,
              titulo: "Cuéntalo",
              texto:
                "Hablando o escribiendo, sin lenguaje jurídico. Amparo entiende y organiza tu caso.",
            },
            {
              icon: ShieldCheck,
              titulo: "Amparo evalúa",
              texto:
                "Verifica si la tutela procede y predice el resultado citando sentencias reales.",
            },
            {
              icon: Scale,
              titulo: "Se resuelve",
              texto:
                "Tu EPS cede antes del juez, o el juez decide con un fallo ya fundamentado.",
            },
          ].map((p, i) => (
            <li key={p.titulo} className="surface-card p-7">
              <div className="flex items-center gap-3">
                <span className="grid size-11 place-items-center rounded-xl bg-secondary text-brand">
                  <p.icon className="size-5" />
                </span>
                <span className="font-serif text-sm font-semibold text-muted-foreground">
                  Paso {i + 1}
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
    ),
  },

  // 5 · Voz + avatar = acceso para todos
  {
    id: "voz",
    kicker: "Voz · justicia procedimental",
    render: () => (
      <div>
        <div className="max-w-2xl">
          <Eyebrow>
            <Mic className="size-3.5 text-brand" />
            Voz · justicia procedimental
          </Eyebrow>
          <Headline>Tu voz, primero. Acceso real para todos.</Headline>
        </div>
        <Bullets
          items={[
            {
              icon: Mic,
              text: (
                <>
                  Amparo <strong className="text-navy">habla y escucha</strong>:
                  un avatar conversacional para quien no escribe con facilidad ni
                  domina el lenguaje legal.
                </>
              ),
            },
            {
              icon: Quote,
              text: (
                <>
                  Poder contar tu historia es el corazón de la{" "}
                  <strong className="text-navy">justicia procedimental</strong> —
                  lo que más valoran las personas frente a la justicia.
                </>
              ),
            },
            {
              icon: BadgeCheck,
              text: (
                <>
                  Voz <strong className="text-navy">+ transparencia</strong> =
                  acceso significativo, no solo poder radicar un trámite.
                </>
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
    kicker: "Sin caja negra",
    render: () => (
      <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <Eyebrow>
            <Quote className="size-3.5 text-brand" />
            Sin caja negra
          </Eyebrow>
          <Headline>Una predicción que cita la ley, no un oráculo.</Headline>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground text-pretty">
            Cada pronóstico de Amparo se sustenta en jurisprudencia verificable
            de la Corte Constitucional. La persona —y el juez— ven exactamente en
            qué se apoya. Neutralidad que se puede auditar.
          </p>
        </div>
        <div className="surface-card p-7">
          <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-brand">
            <FileText className="size-3.5" />
            Fundamento citado
          </span>
          <p className="mt-4 font-serif text-3xl font-semibold tracking-tight text-navy">
            T-760 de 2008
          </p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Sentencia hito que ordenó garantizar el derecho a la salud. Amparo la
            invoca —y a sus sentencias afines— para sustentar cada pronóstico.
          </p>
          <div className="mt-5 flex items-center justify-between rounded-xl bg-secondary px-4 py-3">
            <span className="text-sm font-medium text-muted-foreground">
              Probabilidad estimada
            </span>
            <span className="font-serif text-2xl font-semibold text-success">
              Alta
            </span>
          </div>
        </div>
      </div>
    ),
  },

  // 7 · Resolver sin juez
  {
    id: "resolver",
    kicker: "Resolver antes de pelear",
    render: () => (
      <div className="grid items-center gap-10 lg:grid-cols-[1fr_0.9fr]">
        <div>
          <Eyebrow>
            <Building2 className="size-3.5 text-brand" />
            Resolver antes de pelear
          </Eyebrow>
          <Headline>La mejor tutela es la que no llega al juez.</Headline>
          <Bullets
            items={[
              {
                icon: FileText,
                text: (
                  <>
                    Antes del juez, Amparo genera un{" "}
                    <strong className="text-navy">derecho de petición</strong>:
                    identifica al responsable y arranca un reloj de plazo.
                  </>
                ),
              },
              {
                icon: Clock,
                text: (
                  <>
                    La EPS ve el costo real de negar y{" "}
                    <strong className="text-navy">cede los casos obvios</strong>{" "}
                    —con transparencia entre las partes.
                  </>
                ),
              },
            ]}
          />
        </div>
        <div className="surface-navy p-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/55">
            Descongestión proyectada
          </p>
          <p className="mt-4 font-serif text-6xl font-semibold text-white">57%</p>
          <p className="mt-2 text-sm text-white/65">
            de los casos podrían resolverse en la etapa administrativa, sin tocar
            un despacho.
          </p>
        </div>
      </div>
    ),
  },

  // 8 · El juez decide
  {
    id: "juez",
    kicker: "Humano en el loop",
    render: () => (
      <div>
        <div className="max-w-2xl">
          <Eyebrow>
            <Gavel className="size-3.5 text-brand" />
            Humano en el loop
          </Eyebrow>
          <Headline>El fallo se sugiere. La última palabra es humana.</Headline>
        </div>
        <Bullets
          items={[
            {
              icon: Scale,
              text: (
                <>
                  Cuando debe llegar al juez, llega{" "}
                  <strong className="text-navy">perfecta y triada</strong>:
                  priorizada, con un fallo fundamentado ya redactado.
                </>
              ),
            },
            {
              icon: Layers,
              text: (
                <>
                  Amparo <strong className="text-navy">detecta reclamos
                  repetidos</strong> —el mismo reclamo por miles— y permite
                  resolverlos por lotes.
                </>
              ),
            },
            {
              icon: Gavel,
              text: (
                <>
                  Amparo no reemplaza al juez:{" "}
                  <strong className="text-navy">el juez firma</strong>. Le
                  devolvemos el tiempo para lo que de verdad lo necesita.
                </>
              ),
            },
          ]}
        />
      </div>
    ),
  },

  // 9 · Equidad
  {
    id: "equidad",
    kicker: "Equidad · anti-arbitrariedad",
    render: () => (
      <div className="grid items-center gap-10 lg:grid-cols-[1fr_1fr]">
        <div>
          <Eyebrow>
            <BadgeCheck className="size-3.5 text-brand" />
            Equidad · anti-arbitrariedad
          </Eyebrow>
          <Headline>Mismo reclamo, mismo resultado.</Headline>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground text-pretty">
            Lo arbitrario es injusto. Al decidir por jurisprudencia consistente,
            Amparo reduce la disparidad —y un humano valida. Bien diseñado, lo
            digital puede ser <strong className="text-navy">más</strong> justo.
          </p>
        </div>
        <div className="grid gap-4">
          <div className="surface-card p-6">
            <p className="font-serif text-base font-semibold text-navy">
              Estudio de Michigan
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              En cortes de tránsito, el proceso escrito y asíncrono redujo la
              disparidad racial que aparecía cara a cara. El diseño afecta la
              equidad.
            </p>
          </div>
          <div className="surface-card p-6">
            <p className="font-serif text-base font-semibold text-navy">
              Habermas Machine · Science 2024
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              Una IA medió temas divisivos y construyó consenso; los
              participantes lo calificaron como más justo y claro, integrando
              voces minoritarias.
            </p>
          </div>
        </div>
      </div>
    ),
  },

  // 10 · Impacto / negocio
  {
    id: "impacto",
    kicker: "Impacto · modelo",
    render: () => (
      <div>
        <div className="max-w-2xl">
          <Eyebrow>
            <Sparkles className="size-3.5 text-brand" />
            Impacto · modelo
          </Eyebrow>
          <Headline>Presupuesto piloto bajo. Impacto masivo.</Headline>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {[
            {
              icon: Scale,
              tag: "B2G",
              titulo: "Rama Judicial · Defensoría",
              texto:
                "Descongestión: menos carga, decisiones en minutos, acceso a la justicia.",
            },
            {
              icon: Building2,
              tag: "B2B",
              titulo: "EPS",
              texto:
                "Menos tutelas y sanciones: resolver antes de la confrontación sale más barato.",
            },
            {
              icon: User,
              tag: "B2C",
              titulo: "Pacientes · freemium",
              texto:
                "Acceso gratuito de principio a fin, con acompañamiento hasta la resolución.",
            },
          ].map((m) => (
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
    ),
  },

  // 11 · Cierre
  {
    id: "cierre",
    kicker: "Cierre",
    render: () => (
      <div className="text-center">
        <div className="flex justify-center">
          <span className="grid size-14 place-items-center rounded-2xl bg-primary shadow-lg shadow-primary/20">
            <ShieldCheck className="size-7 text-white" aria-hidden />
          </span>
        </div>
        <h2 className="mx-auto mt-6 max-w-3xl font-serif text-4xl font-semibold leading-[1.05] tracking-tight text-balance text-navy sm:text-5xl lg:text-6xl">
          Amparo no reemplaza al juez. Es{" "}
          <span className="text-brand">la cuarta parte</span> que le devuelve el
          tiempo.
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground text-pretty">
          Y le devuelve a la gente el acceso real a su derecho. Pruébenlo: hablen
          con Amparo.
        </p>
        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/asistente"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-7 text-base font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <Mic className="size-4" />
            Probar el demo
          </Link>
          <Link
            href="/atlas"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-border bg-white px-7 text-base font-semibold text-foreground transition-colors hover:bg-secondary"
          >
            <MapIcon className="size-4 text-brand" />
            Ver el atlas
          </Link>
        </div>
        <p className="mt-8 font-serif text-lg font-semibold tracking-tight text-brand">
          amparo.help
        </p>
      </div>
    ),
  },
];

/* ──────────────────────────────────────────────────────────────────────────
   El deck: estado de slide actual, navegación por teclado y controles.
   ────────────────────────────────────────────────────────────────────────── */
export function PitchDeck() {
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
      const t = e.target as HTMLElement | null;
      if (
        t &&
        (t.tagName === "INPUT" ||
          t.tagName === "TEXTAREA" ||
          t.isContentEditable)
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

  return (
    <div className="fixed inset-0 z-[80] flex flex-col bg-background">
      {/* Barra de progreso */}
      <div
        className="absolute inset-x-0 top-0 z-10 h-1.5 bg-border/60"
        role="progressbar"
        aria-valuenow={i + 1}
        aria-valuemin={1}
        aria-valuemax={total}
        aria-label={`Progreso del deck: slide ${i + 1} de ${total}`}
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
          Amparo
          <span className="hidden text-xs font-normal uppercase tracking-[0.16em] text-muted-foreground sm:inline">
            · {actual.kicker}
          </span>
        </span>
        <div className="flex items-center gap-2">
          <Link
            href="/"
            aria-label="Volver al inicio"
            className="inline-flex size-9 items-center justify-center rounded-full border border-border bg-white/80 text-muted-foreground backdrop-blur transition-colors hover:text-brand"
          >
            <HomeIcon className="size-4" />
          </Link>
          <Link
            href="/"
            aria-label="Salir del deck (Esc)"
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
        <Slide index={i} total={total}>
          {actual.render()}
        </Slide>
      </div>

      {/* Controles inferiores: anterior / puntos / siguiente */}
      <div className="absolute inset-x-0 bottom-0 z-10 flex items-center justify-between gap-4 px-4 pb-5 sm:px-8 sm:pb-7">
        <button
          type="button"
          onClick={prev}
          disabled={i === 0}
          aria-label="Slide anterior"
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-4 py-2.5 text-sm font-semibold text-foreground shadow-sm transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ArrowLeft className="size-4" />
          <span className="hidden sm:inline">Anterior</span>
        </button>

        {/* Puntos de navegación */}
        <div className="flex items-center gap-2" role="tablist" aria-label="Slides">
          {SLIDES.map((s, idx) => (
            <button
              key={s.id}
              type="button"
              role="tab"
              aria-selected={idx === i}
              aria-label={`Ir al slide ${idx + 1}: ${s.kicker}`}
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
            aria-label="Siguiente slide"
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary-hover"
          >
            <span className="hidden sm:inline">Siguiente</span>
            <ArrowRight className="size-4" />
          </button>
        ) : (
          <Link
            href="/asistente"
            aria-label="Ir al demo"
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary-hover"
          >
            <Mic className="size-4" />
            <span>Al demo</span>
          </Link>
        )}
      </div>

      {/* Pista de teclado */}
      <p className="pointer-events-none absolute inset-x-0 bottom-1 z-0 hidden text-center text-[10px] text-muted-foreground/60 sm:block">
        ← / → navegar · Inicio / Fin extremos · Esc salir
      </p>
    </div>
  );
}

export default PitchDeck;
