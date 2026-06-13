"use client";

// app/demandado/page.tsx
// Portal del demandado (EPS) — bandeja ODR, agente-EPS costo/riesgo,
// negociación automática y panel de impacto. El clímax "resolución sin juez".

import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Building2,
  CheckCircle2,
  Loader2,
  ShieldX,
  Sparkles,
  Zap,
} from "lucide-react";
import { useCasoStore } from "@/lib/store";
import type { Caso, EventoCaso } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { SegundoCerebro } from "@/components/segundo-cerebro";
import { DemandadoBandeja } from "@/components/demandado/demandado-bandeja";
import { DemandadoAgente } from "@/components/demandado/demandado-agente";
import { DemandadoImpacto } from "@/components/demandado/demandado-impacto";
import {
  estimarProbabilidadAmparo,
  nivelRiesgoEPS,
} from "@/components/demandado/demandado-utils";

function nuevoEvento(parcial: Omit<EventoCaso, "id" | "fecha">): EventoCaso {
  return {
    id: crypto.randomUUID(),
    fecha: new Date().toISOString(),
    ...parcial,
  };
}

const espera = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default function DemandadoPage() {
  const casos = useCasoStore((s) => s.casos);
  const updateCaso = useCasoStore((s) => s.updateCaso);
  const addEvento = useCasoStore((s) => s.addEvento);

  const [seleccionado, setSeleccionado] = useState<Caso | null>(null);
  const [dialogoAbierto, setDialogoAbierto] = useState(false);
  const [autoActivo, setAutoActivo] = useState(false);
  const [procesandoId, setProcesandoId] = useState<string | null>(null);
  const [resueltosSesion, setResueltosSesion] = useState(0);
  const [totalEntrantes, setTotalEntrantes] = useState<number | null>(null);

  // Casos vivos en la cola de negociación.
  const enNegociacion = useMemo(
    () => casos.filter((c) => c.estado === "EN_NEGOCIACION_EPS"),
    [casos],
  );

  // Fija el universo de entrantes la primera vez que se observa la cola.
  const base = totalEntrantes ?? enNegociacion.length + resueltosSesion;

  function abrir(caso: Caso) {
    setSeleccionado(caso);
    setDialogoAbierto(true);
  }

  function autorizar(caso: Caso, analisis: { prob: number }) {
    updateCaso(caso.id, { estado: "RESUELTO_EPS" });
    addEvento(
      caso.id,
      nuevoEvento({
        tipo: "estado",
        estado: "RESUELTO_EPS",
        actor: "eps",
        titulo: "EPS autoriza el servicio (acuerdo sin juez)",
        detalle: `El agente-EPS estimó ${analisis.prob}% de amparo en tutela. La EPS cede y autoriza ${caso.servicioNegado}.`,
      }),
    );
    setResueltosSesion((n) => n + 1);
    if (totalEntrantes === null) setTotalEntrantes(enNegociacion.length);
    setDialogoAbierto(false);
    toast.success("Servicio autorizado", {
      description: `${caso.demandante.nombre}: caso resuelto sin acudir al juez.`,
    });
  }

  function mantener(caso: Caso) {
    updateCaso(caso.id, { estado: "ESCALADO_TUTELA" });
    addEvento(
      caso.id,
      nuevoEvento({
        tipo: "estado",
        estado: "ESCALADO_TUTELA",
        actor: "eps",
        titulo: "EPS mantiene la negación — habilitada la tutela",
        detalle:
          "La EPS sostuvo su posición. El demandante queda habilitado para escalar a acción de tutela ante juez.",
      }),
    );
    if (totalEntrantes === null) setTotalEntrantes(enNegociacion.length);
    setDialogoAbierto(false);
    toast.warning("Negación mantenida", {
      description: `${caso.demandante.nombre} podrá escalar a tutela.`,
    });
  }

  // Negociación automática: el agente-EPS recorre los casos "obvios"
  // (probabilidad de amparo alta) y los resuelve en vivo.
  async function negociacionAutomatica() {
    if (autoActivo) return;
    const obvios = enNegociacion.filter(
      (c) => nivelRiesgoEPS(estimarProbabilidadAmparo(c)).recomendacion === "ceder",
    );
    if (obvios.length === 0) {
      toast.info("Sin casos obvios", {
        description: "No hay reclamaciones de riesgo alto para resolver en lote.",
      });
      return;
    }
    setAutoActivo(true);
    if (totalEntrantes === null) setTotalEntrantes(enNegociacion.length);
    toast("Negociación automática iniciada", {
      description: `El agente-EPS evaluará ${obvios.length} caso(s) de alto riesgo.`,
    });

    for (const caso of obvios) {
      setProcesandoId(caso.id);
      const prob = estimarProbabilidadAmparo(caso);
      await espera(900); // "pensando"
      updateCaso(caso.id, { estado: "RESUELTO_EPS" });
      addEvento(
        caso.id,
        nuevoEvento({
          tipo: "ia",
          estado: "RESUELTO_EPS",
          actor: "eps",
          titulo: "Acuerdo automático del agente-EPS",
          detalle: `Probabilidad de amparo ${prob}%. La EPS autoriza ${caso.servicioNegado} sin litigio.`,
        }),
      );
      setResueltosSesion((n) => n + 1);
      toast.success(`Resuelto: ${caso.demandante.nombre}`, {
        description: `${prob}% de amparo — autorizado sin juez.`,
      });
      await espera(450);
    }

    setProcesandoId(null);
    setAutoActivo(false);
    toast.success("Negociación automática completa", {
      description: `${obvios.length} caso(s) descongestionado(s).`,
    });
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Encabezado */}
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-brand-strong">
            <Building2 className="size-5" />
            <span className="text-xs font-semibold uppercase tracking-wide">
              Portal del demandado · EPS
            </span>
          </div>
          <h1 className="mt-1 font-heading text-3xl font-bold tracking-tight">
            Bandeja de reclamaciones
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Resuelva disputas de salud antes del juez. El agente-EPS calcula el
            costo/riesgo de negar y recomienda ceder cuando la tutela se perdería.
          </p>
          <p className="mt-1.5 max-w-2xl text-xs font-medium text-brand-strong">
            Amparo es la cuarta parte: asiste con análisis consistentes por
            jurisprudencia. La decisión de autorizar o sostener es suya.
          </p>
        </div>

        <Button
          onClick={() => void negociacionAutomatica()}
          disabled={autoActivo || enNegociacion.length === 0}
          className="gap-2 self-start"
        >
          {autoActivo ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Zap className="size-4" />
          )}
          {autoActivo ? "Negociando…" : "Negociación automática"}
        </Button>
      </header>

      {/* Impacto */}
      <div className="mt-6">
        <DemandadoImpacto
          resueltos={resueltosSesion}
          totalEntrantes={Math.max(base, resueltosSesion, 1)}
        />
      </div>

      {/* Cuerpo: bandeja + copiloto */}
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_22rem]">
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-heading text-lg font-semibold">
              <Sparkles className="size-4 text-primary" />
              En negociación
              <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
                {enNegociacion.length}
              </span>
            </h2>
          </div>
          <DemandadoBandeja
            casos={enNegociacion}
            onAbrir={abrir}
            procesandoId={procesandoId}
          />

          {/* Leyenda de acciones */}
          <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="size-3.5 text-success" />
              Autorizar = resolver sin juez
            </span>
            <span className="inline-flex items-center gap-1.5">
              <ShieldX className="size-3.5 text-warning" />
              Mantener negación = habilitar tutela
            </span>
          </div>
        </section>

        <aside className="lg:sticky lg:top-6 lg:self-start">
          <SegundoCerebro
            rol="demandado"
            casoId={seleccionado?.id}
            titulo="Asesor de la EPS"
          />
        </aside>
      </div>

      {/* Diálogo del agente-EPS */}
      <DemandadoAgente
        caso={seleccionado}
        abierto={dialogoAbierto}
        onCerrar={() => setDialogoAbierto(false)}
        onAutorizar={autorizar}
        onMantener={mantener}
      />
    </div>
  );
}
