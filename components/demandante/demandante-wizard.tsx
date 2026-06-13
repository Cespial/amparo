"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle2,
  CircleAlert,
  Copy,
  FileText,
  Gavel,
  Handshake,
  Loader2,
  Mic,
  MicOff,
  ScrollText,
  Sparkles,
  Stethoscope,
  Volume2,
  VolumeX,
  Wand2,
  XCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

import { cn } from "@/lib/utils";
import { useCasoStore } from "@/lib/store";
import { heroeId } from "@/lib/seed";
import { generarRadicado, formatearRadicado } from "@/lib/radicado";
import { cronogramaTutela } from "@/lib/plazos";
import { progresoDeEstado } from "@/lib/progreso";
import { construirPeticion } from "@/lib/peticion";
import type {
  Caso,
  EstadoCaso,
  EventoCaso,
  PeticionFormal,
  PlazoLegal,
  TipoServicio,
  Urgencia,
} from "@/lib/types";

import { DemandanteStepper, type PasoDef } from "./demandante-stepper";
import { DemandanteGauge } from "./demandante-gauge";
import { DemandanteMarkdown } from "./demandante-markdown";
import { PeticionReloj } from "./peticion-reloj";
import { Expediente } from "@/components/transparencia/expediente";
import { useDictado } from "./use-dictado";
import { hablar, detenerVoz } from "@/lib/voz";
import { BotonVoz } from "@/components/boton-voz";

// --- Tipos de las respuestas de API consumidas (subconjunto) ---

interface EstructuracionOutput {
  servicioNegado?: string;
  tipoServicio?: TipoServicio;
  diagnostico?: string;
  hechos?: string;
  pretension?: string;
  urgencia?: Urgencia;
  derechosInvocados?: string[];
  eps?: string;
  paciente?: string;
}

interface CriterioTriaje {
  estado: "ok" | "reserva" | "falla";
  explicacion: string;
}
interface TriajeResultado {
  veredicto: "admisible" | "admisible_con_reservas" | "inadmisible";
  rutaRecomendada: "negociacion_eps" | "tutela";
  confianza: number;
  criterios: {
    derechoFundamental: CriterioTriaje;
    legitimacion: CriterioTriaje;
    subsidiariedad: CriterioTriaje;
    inmediatez: CriterioTriaje;
    noTemeridad: CriterioTriaje;
    hechoSuperado: CriterioTriaje;
  };
  derechosVulnerados: string[];
  fundamentos: { id: string; titulo: string; anio: number; subregla: string }[];
  recomendacion: string;
  banderas: string[];
}

interface PrediccionResultado {
  probabilidadAmparo: number;
  sentenciasCitadas: {
    id: string;
    titulo: string;
    anio: number;
    tema: string;
    subregla: string;
  }[];
  reglaAplicable: string;
  razonamiento: string;
}

// --- Constantes UI ---

const PASOS: PasoDef[] = [
  { id: 1, titulo: "Cuéntanos qué pasó" },
  { id: 2, titulo: "Tu caso" },
  { id: 3, titulo: "¿Procede?" },
  { id: 4, titulo: "Pronóstico" },
  { id: 5, titulo: "Decisión" },
];

const TIPOS_SERVICIO: { v: TipoServicio; label: string }[] = [
  { v: "cirugia", label: "Cirugía" },
  { v: "medicamento", label: "Medicamento" },
  { v: "examen_diagnostico", label: "Examen diagnóstico" },
  { v: "tratamiento", label: "Tratamiento" },
  { v: "traslado_ambulancia", label: "Traslado / ambulancia" },
  { v: "terapia", label: "Terapia" },
  { v: "insumo_dispositivo", label: "Insumo o dispositivo" },
  { v: "consulta_especialista", label: "Consulta con especialista" },
  { v: "otro", label: "Otro" },
];

const URGENCIAS: { v: Urgencia; label: string }[] = [
  { v: "baja", label: "Baja" },
  { v: "media", label: "Media" },
  { v: "alta", label: "Alta" },
  { v: "vital", label: "Vital (riesgo de vida)" },
];

const RELATO_EJEMPLO =
  "Mi nombre es Amparo Restrepo, tengo 68 años y vivo en Medellín. " +
  "Estoy afiliada a la EPS Sura. Hace meses mi médico me ordenó una cirugía de cadera, " +
  "una artroplastia, porque tengo coxartrosis severa y el dolor no me deja caminar ni dormir. " +
  "La EPS no me ha autorizado la operación, dicen que está en trámites de pertinencia, " +
  "y cada día estoy peor. Necesito que me operen pronto.";

const ICONO_CRITERIO = {
  ok: { Icon: CheckCircle2, color: "text-success", bg: "bg-success/10", label: "Cumple" },
  reserva: { Icon: CircleAlert, color: "text-warning", bg: "bg-warning/10", label: "Con reserva" },
  falla: { Icon: XCircle, color: "text-danger", bg: "bg-danger/10", label: "No cumple" },
} as const;

const VEREDICTO_TITULO: Record<TriajeResultado["veredicto"], string> = {
  admisible: "Tu caso es admisible",
  admisible_con_reservas: "Admisible, con algunas reservas",
  inadmisible: "Por ahora, el caso no procedería",
};

const NOMBRE_CRITERIO: Record<keyof TriajeResultado["criterios"], string> = {
  derechoFundamental: "Derecho fundamental afectado",
  legitimacion: "Legitimación para actuar",
  subsidiariedad: "Subsidiariedad / perjuicio irremediable",
  inmediatez: "Inmediatez de la afectación",
  noTemeridad: "Ausencia de temeridad",
  hechoSuperado: "Vulneración aún vigente",
};

// --- Componente principal ---

export function DemandanteWizard({
  onCasoActivo,
}: {
  onCasoActivo?: (id: string) => void;
}) {
  const { getCaso, updateCaso, addEvento, addCaso, seleccionarCaso } =
    useCasoStore();

  const [paso, setPaso] = useState(1);

  // Paso 1
  const [relato, setRelato] = useState("");

  // Caso estructurado (editable) — derivado del paso 2
  const [casoId, setCasoId] = useState<string>(heroeId);
  const [esHeroe, setEsHeroe] = useState(true);
  const [estructura, setEstructura] = useState<EstructuracionOutput | null>(null);
  const [eps, setEps] = useState("");
  const [paciente, setPaciente] = useState("");

  // Resultados IA
  const [triaje, setTriaje] = useState<TriajeResultado | null>(null);
  const [prediccion, setPrediccion] = useState<PrediccionResultado | null>(null);

  // Documento final + radicado
  const [documento, setDocumento] = useState<string | null>(null);
  const [tipoDoc, setTipoDoc] = useState<"reclamacion" | "tutela">("tutela");
  const [radicado, setRadicado] = useState<string | null>(null);
  const [cronograma, setCronograma] = useState<PlazoLegal[]>([]);
  const [estadoFinal, setEstadoFinal] = useState<EstadoCaso | null>(null);
  const [peticion, setPeticion] = useState<PeticionFormal | null>(null);

  // Cargas
  const [cargando, setCargando] = useState<null | string>(null);

  // Modo voz: si está activo, Amparo lee en voz alta el primer mensaje de cada paso.
  const [modoVoz, setModoVoz] = useState(false);

  const dictado = useDictado((t) =>
    setRelato((prev) => (prev ? `${prev} ${t}` : t)),
  );

  // Lee `texto` en voz alta solo si el modo voz está activo. Frases cortas.
  const leerSiModoVoz = useCallback(
    (texto: string) => {
      if (!modoVoz) return;
      const limpio = texto.replace(/\s+/g, " ").trim();
      if (limpio) void hablar(limpio);
    },
    [modoVoz],
  );

  // Al activar/desactivar el modo voz, corta cualquier lectura en curso.
  function alternarModoVoz() {
    setModoVoz((v) => {
      if (v) detenerVoz();
      return !v;
    });
  }

  // Al desmontar, corta cualquier voz en curso.
  useEffect(() => detenerVoz, []);

  // ---- Helpers ----

  function precargarHeroe() {
    setRelato(RELATO_EJEMPLO);
    toast.success("Ejemplo de Amparo cargado", {
      description: "Puedes editarlo o continuar tal cual.",
    });
  }

  /** Construye un Caso completo desde la estructura (para casos nuevos). */
  function construirCasoNuevo(e: EstructuracionOutput): Caso {
    const id = `caso-web-${Date.now()}`;
    const fechaBase = new Date();
    const consecutivo = Math.floor(1000 + Math.random() * 8000);
    const rad = generarRadicado("05", "medellin", fechaBase.getFullYear(), consecutivo);
    const derechos = (e.derechosInvocados ?? ["salud"]) as Caso["derechosInvocados"];
    const caso: Caso = {
      id,
      radicado: rad,
      estado: "INTAKE",
      fechaCreacion: fechaBase.toISOString(),
      fechaBase: fechaBase.toISOString(),
      demandante: {
        nombre: paciente || e.paciente || "Accionante",
        edad: 50,
        ciudad: "Medellín",
        departamento: "Antioquia",
        codigoDepartamento: "05",
        regimen: "contributivo",
      },
      demandado: { nombre: eps || e.eps || "EPS", tipo: "EPS" },
      servicioNegado: e.servicioNegado ?? "Servicio de salud",
      tipoServicio: e.tipoServicio ?? "otro",
      diagnostico: e.diagnostico ?? "",
      hechos: e.hechos ?? relato,
      pretension: e.pretension ?? "",
      urgencia: e.urgencia ?? "media",
      esPBS: true,
      derechosInvocados: derechos.length ? derechos : ["salud"],
      cronograma: cronogramaTutela(fechaBase),
      progreso: progresoDeEstado("INTAKE"),
      timeline: [
        {
          id: `${id}-ev1`,
          fecha: fechaBase.toISOString(),
          tipo: "creacion",
          estado: "INTAKE",
          actor: "demandante",
          titulo: "Caso recibido en Amparo",
        },
      ],
    };
    return caso;
  }

  // ---- Paso 1 -> 2: Estructurar ----

  async function estructurar() {
    const texto = relato.trim();
    if (texto.length < 20) {
      toast.error("Cuéntanos un poco más", {
        description: "Describe qué servicio te negaron y por qué lo necesitas.",
      });
      return;
    }
    detenerVoz();
    setCargando("estructurar");

    // ¿Es el caso héroe? Heurística: el relato es (o contiene) el ejemplo de Amparo.
    const heroe =
      relato.trim() === RELATO_EJEMPLO.trim() ||
      /amparo restrepo/i.test(relato);
    setEsHeroe(heroe);
    const idParaApi = heroe ? heroeId : undefined;
    setCasoId(heroe ? heroeId : `caso-web-${Date.now()}`);

    try {
      const res = await fetch("/api/estructurar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ relato: texto, casoId: idParaApi }),
      });
      if (!res.ok) throw new Error(String(res.status));
      const data = (await res.json()) as EstructuracionOutput;
      setEstructura(data);
      setEps(data.eps ?? "");
      setPaciente(data.paciente ?? "");
      setPaso(2);
      toast.success("Amparo organizó tu caso", {
        description: "Revisa los datos y corrige lo que necesites.",
      });
    } catch {
      toast.error("No se pudo estructurar el caso", {
        description: "Revisa tu conexión e inténtalo de nuevo.",
      });
    } finally {
      setCargando(null);
    }
  }

  /** Reconstruye/persiste el caso en el store a partir de la estructura editada. */
  function persistirCaso(): Caso | undefined {
    if (esHeroe) {
      const existente = getCaso(heroeId);
      if (existente && estructura) {
        const patch: Partial<Caso> = {
          servicioNegado: estructura.servicioNegado ?? existente.servicioNegado,
          tipoServicio: estructura.tipoServicio ?? existente.tipoServicio,
          diagnostico: estructura.diagnostico ?? existente.diagnostico,
          hechos: estructura.hechos ?? existente.hechos,
          pretension: estructura.pretension ?? existente.pretension,
          urgencia: estructura.urgencia ?? existente.urgencia,
        };
        if (eps) patch.demandado = { ...existente.demandado, nombre: eps };
        updateCaso(heroeId, patch);
      }
      return getCaso(heroeId);
    }
    // Caso nuevo
    const existente = getCaso(casoId);
    if (existente) return existente;
    const nuevo = construirCasoNuevo(estructura ?? {});
    nuevo.id = casoId;
    addCaso(nuevo);
    return nuevo;
  }

  // ---- Paso 2 -> 3: Triaje ----

  async function correrTriaje() {
    const caso = persistirCaso();
    if (!caso) return;
    setCargando("triaje");
    try {
      const res = await fetch("/api/triaje", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(esHeroe ? { casoId: heroeId } : { caso }),
      });
      if (!res.ok) throw new Error(String(res.status));
      const data = (await res.json()) as TriajeResultado;
      setTriaje(data);
      updateCaso(caso.id, { estado: "TRIADO" });
      addEvento(caso.id, evento(caso.id, "ia", "Triaje de admisibilidad", "TRIADO", {
        detalle: `Veredicto: ${data.veredicto.replace(/_/g, " ")}.`,
      }));
      setPaso(3);
      leerSiModoVoz(`${VEREDICTO_TITULO[data.veredicto]}. ${data.recomendacion}`);
    } catch {
      toast.error("No se pudo evaluar la admisibilidad", {
        description: "Inténtalo de nuevo en un momento.",
      });
    } finally {
      setCargando(null);
    }
  }

  // ---- Paso 3 -> 4: Predicción ----

  async function correrPrediccion() {
    const caso = getCaso(casoId);
    if (!caso) return;
    setCargando("prediccion");
    try {
      const res = await fetch("/api/predecir", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(esHeroe ? { casoId: heroeId } : { caso }),
      });
      if (!res.ok) throw new Error(String(res.status));
      const data = (await res.json()) as PrediccionResultado;
      setPrediccion(data);
      addEvento(caso.id, evento(caso.id, "ia", "Predicción del resultado", undefined, {
        detalle: `Probabilidad estimada de amparo: ${data.probabilidadAmparo}%.`,
      }));
      setPaso(4);
      leerSiModoVoz(
        `Tu pronóstico: la probabilidad estimada de que prospere el amparo es del ${data.probabilidadAmparo} por ciento. ${data.reglaAplicable}`,
      );
    } catch {
      toast.error("No se pudo calcular el pronóstico");
    } finally {
      setCargando(null);
    }
  }

  // ---- Paso 4 -> 5: generar documento + decidir ruta ----

  async function decidir(via: "reclamacion" | "tutela") {
    const caso = getCaso(casoId);
    if (!caso) return;
    setCargando(via);
    setTipoDoc(via);
    try {
      const res = await fetch("/api/generar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          esHeroe ? { casoId: heroeId, tipo: via } : { caso, tipo: via },
        ),
      });
      if (!res.ok) throw new Error(String(res.status));
      const data = (await res.json()) as { tipo: string; documento: string };
      setDocumento(data.documento);

      if (via === "reclamacion") {
        // Formaliza la ruta EPS como derecho de petición: responsable + reloj SLA.
        const nuevaPeticion = construirPeticion(caso, new Date());
        updateCaso(caso.id, {
          estado: "EN_NEGOCIACION_EPS",
          peticion: nuevaPeticion,
        });
        addEvento(
          caso.id,
          evento(
            caso.id,
            "documento",
            "Derecho de petición radicado ante la EPS",
            "EN_NEGOCIACION_EPS",
            {
              actor: "demandante",
              detalle: `Responsable: ${nuevaPeticion.dependencia}. Término de respuesta: ${nuevaPeticion.slaDias} días ${nuevaPeticion.slaHabiles ? "hábiles" : "calendario"} (radicado ${nuevaPeticion.radicadoPeticion}).`,
            },
          ),
        );
        setPeticion(nuevaPeticion);
        setEstadoFinal("EN_NEGOCIACION_EPS");
        setRadicado(null);
        setCronograma([]);
      } else {
        const base = new Date();
        const crono = cronogramaTutela(base);
        updateCaso(caso.id, {
          estado: "ESCALADO_TUTELA",
          cronograma: crono,
          fechaBase: base.toISOString(),
        });
        addEvento(
          caso.id,
          evento(caso.id, "documento", "Tutela radicada", "ESCALADO_TUTELA", {
            actor: "demandante",
            detalle: `Radicado ${formatearRadicado(caso.radicado)}.`,
          }),
        );
        setPeticion(null);
        setEstadoFinal("ESCALADO_TUTELA");
        setRadicado(caso.radicado);
        setCronograma(crono);
      }

      seleccionarCaso(caso.id);
      onCasoActivo?.(caso.id);
      setPaso(5);
      leerSiModoVoz(
        via === "tutela"
          ? "Tu tutela está lista. Revísala, descárgala o llévala al juzgado de reparto."
          : "Tu reclamación está lista. Envíala a tu EPS. Si no responde a tiempo, podrás escalar a tutela.",
      );
    } catch {
      toast.error("No se pudo generar el documento", {
        description: "Inténtalo de nuevo en un momento.",
      });
    } finally {
      setCargando(null);
    }
  }

  function copiarDocumento() {
    if (!documento) return;
    void navigator.clipboard
      ?.writeText(documento)
      .then(() => toast.success("Documento copiado al portapapeles"))
      .catch(() => toast.error("No se pudo copiar"));
  }

  function reiniciar() {
    setPaso(1);
    setRelato("");
    setEstructura(null);
    setTriaje(null);
    setPrediccion(null);
    setDocumento(null);
    setRadicado(null);
    setCronograma([]);
    setEstadoFinal(null);
    setPeticion(null);
    setEps("");
    setPaciente("");
    setEsHeroe(true);
    setCasoId(heroeId);
  }

  const progresoCaso = useMemo(
    () => (estadoFinal ? progresoDeEstado(estadoFinal) : 0),
    [estadoFinal],
  );

  // ====== RENDER ======

  return (
    <div className="space-y-6">
      <Card className="surface-card border-0">
        <CardHeader className="gap-3 pb-4">
          <DemandanteStepper pasos={PASOS} actual={paso} />
          <div className="flex items-center justify-end">
            <Button
              type="button"
              variant={modoVoz ? "default" : "outline"}
              size="sm"
              onClick={alternarModoVoz}
              aria-pressed={modoVoz}
              aria-label={
                modoVoz
                  ? "Desactivar modo voz: Amparo dejará de leer en voz alta"
                  : "Activar modo voz: Amparo leerá en voz alta cada paso"
              }
              title="Amparo te lee cada paso en voz alta"
              className="gap-1.5"
            >
              {modoVoz ? (
                <Volume2 className="size-4" aria-hidden />
              ) : (
                <VolumeX className="size-4" aria-hidden />
              )}
              Modo voz {modoVoz ? "activo" : "apagado"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-2">
          {/* ---------- PASO 1 ---------- */}
          {paso === 1 && (
            <section className="space-y-5">
              <div>
                <h2 className="font-serif text-2xl font-bold text-navy">
                  Cuéntanos qué pasó
                </h2>
                <p className="mt-1 text-muted-foreground">
                  Con tus palabras: qué te negó tu EPS y por qué lo necesitas.
                  Puedes escribir o dictar con el micrófono.
                </p>
              </div>

              <div className="relative">
                <Textarea
                  value={relato}
                  onChange={(e) => setRelato(e.target.value)}
                  placeholder="Por ejemplo: «Mi médico me ordenó una cirugía de cadera y mi EPS no me la ha autorizado…»"
                  className="min-h-44 resize-none bg-card p-4 text-base leading-relaxed"
                  aria-label="Relato de los hechos"
                />
                {dictado.soportado && (
                  <Button
                    type="button"
                    onClick={dictado.alternar}
                    variant={dictado.escuchando ? "default" : "outline"}
                    size="lg"
                    className={cn(
                      "absolute bottom-3 right-3 gap-2",
                      dictado.escuchando && "animate-pulse",
                    )}
                    aria-pressed={dictado.escuchando}
                  >
                    {dictado.escuchando ? (
                      <>
                        <MicOff className="size-5" /> Detener
                      </>
                    ) : (
                      <>
                        <Mic className="size-5" /> Dictar
                      </>
                    )}
                  </Button>
                )}
              </div>

              {!dictado.soportado && (
                <p className="flex items-center gap-2 text-xs text-muted-foreground">
                  <MicOff className="size-3.5" />
                  Tu navegador no permite dictar por voz; escribe el relato.
                </p>
              )}

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Button
                  type="button"
                  variant="secondary"
                  size="lg"
                  onClick={precargarHeroe}
                  className="gap-2"
                >
                  <Sparkles className="size-4" />
                  Usar el ejemplo de Amparo
                </Button>
                <Button
                  type="button"
                  size="lg"
                  onClick={estructurar}
                  disabled={cargando === "estructurar"}
                  className="gap-2"
                >
                  {cargando === "estructurar" ? (
                    <>
                      <Loader2 className="size-5 animate-spin" /> Amparo está
                      organizando tu caso…
                    </>
                  ) : (
                    <>
                      <Wand2 className="size-5" /> Continuar
                      <ArrowRight className="size-4" />
                    </>
                  )}
                </Button>
              </div>
            </section>
          )}

          {/* ---------- PASO 2 ---------- */}
          {paso === 2 && estructura && (
            <section className="space-y-5">
              <div>
                <h2 className="font-serif text-2xl font-bold text-navy">
                  Así entendí tu caso
                </h2>
                <p className="mt-1 text-muted-foreground">
                  Revisa y corrige. Tú tienes la última palabra.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Campo label="Paciente">
                  <Input
                    value={paciente}
                    onChange={(e) => setPaciente(e.target.value)}
                    placeholder="Nombre del paciente"
                  />
                </Campo>
                <Campo label="EPS o entidad">
                  <Input
                    value={eps}
                    onChange={(e) => setEps(e.target.value)}
                    placeholder="Nombre de la EPS"
                  />
                </Campo>
                <Campo label="Servicio negado">
                  <Input
                    value={estructura.servicioNegado ?? ""}
                    onChange={(e) =>
                      setEstructura({ ...estructura, servicioNegado: e.target.value })
                    }
                  />
                </Campo>
                <Campo label="Tipo de servicio">
                  <Select
                    value={estructura.tipoServicio ?? "otro"}
                    onValueChange={(v) =>
                      setEstructura({ ...estructura, tipoServicio: v as TipoServicio })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TIPOS_SERVICIO.map((t) => (
                        <SelectItem key={t.v} value={t.v}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Campo>
                <Campo label="Diagnóstico">
                  <Input
                    value={estructura.diagnostico ?? ""}
                    onChange={(e) =>
                      setEstructura({ ...estructura, diagnostico: e.target.value })
                    }
                  />
                </Campo>
                <Campo label="Urgencia">
                  <Select
                    value={estructura.urgencia ?? "media"}
                    onValueChange={(v) =>
                      setEstructura({ ...estructura, urgencia: v as Urgencia })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {URGENCIAS.map((u) => (
                        <SelectItem key={u.v} value={u.v}>
                          {u.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Campo>
              </div>

              <Campo label="Hechos">
                <Textarea
                  value={estructura.hechos ?? ""}
                  onChange={(e) =>
                    setEstructura({ ...estructura, hechos: e.target.value })
                  }
                  className="min-h-28 resize-none"
                />
              </Campo>
              <Campo label="Lo que pides (pretensión)">
                <Textarea
                  value={estructura.pretension ?? ""}
                  onChange={(e) =>
                    setEstructura({ ...estructura, pretension: e.target.value })
                  }
                  className="min-h-20 resize-none"
                />
              </Campo>

              {(estructura.derechosInvocados?.length ?? 0) > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium text-muted-foreground">
                    Derechos en juego:
                  </span>
                  {estructura.derechosInvocados!.map((d) => (
                    <Badge key={d} variant="secondary" className="capitalize">
                      {d}
                    </Badge>
                  ))}
                </div>
              )}

              <NavPasos
                onAtras={() => setPaso(1)}
                onSiguiente={correrTriaje}
                cargando={cargando === "triaje"}
                textoSiguiente="Evaluar si procede"
                textoCargando="Evaluando admisibilidad…"
              />
            </section>
          )}

          {/* ---------- PASO 3 ---------- */}
          {paso === 3 && triaje && (
            <section className="space-y-5">
              <VeredictoBanner triaje={triaje} />

              <div className="grid gap-3">
                {(
                  Object.keys(triaje.criterios) as (keyof TriajeResultado["criterios"])[]
                ).map((k) => {
                  const c = triaje.criterios[k];
                  const meta = ICONO_CRITERIO[c.estado];
                  return (
                    <div
                      key={k}
                      className="flex items-start gap-3 rounded-xl border bg-card p-3"
                    >
                      <span
                        className={cn(
                          "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full",
                          meta.bg,
                        )}
                      >
                        <meta.Icon className={cn("size-5", meta.color)} />
                      </span>
                      <div className="min-w-0">
                        <p className="flex flex-wrap items-center gap-2 font-medium text-navy">
                          {NOMBRE_CRITERIO[k]}
                          <Badge variant="outline" className={cn("font-normal", meta.color)}>
                            {meta.label}
                          </Badge>
                        </p>
                        <p className="mt-0.5 text-sm text-muted-foreground">
                          {c.explicacion}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {triaje.banderas.length > 0 && (
                <div className="rounded-xl border border-warning/30 bg-warning/5 p-3">
                  <p className="flex items-center gap-2 text-sm font-medium text-warning">
                    <AlertTriangle className="size-4" /> A tener en cuenta
                  </p>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                    {triaje.banderas.map((b, i) => (
                      <li key={i}>{b}</li>
                    ))}
                  </ul>
                </div>
              )}

              <NavPasos
                onAtras={() => setPaso(2)}
                onSiguiente={correrPrediccion}
                cargando={cargando === "prediccion"}
                textoSiguiente="Ver mi pronóstico"
                textoCargando="Analizando precedentes…"
              />
            </section>
          )}

          {/* ---------- PASO 4 ---------- */}
          {paso === 4 && prediccion && (
            <section className="space-y-5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="font-serif text-2xl font-bold text-navy">
                    Tu pronóstico
                  </h2>
                  <p className="mt-1 text-muted-foreground">
                    Estimación basada en casos reales de la Corte Constitucional.
                  </p>
                </div>
                <BotonVoz
                  texto={`Tu pronóstico. La probabilidad estimada de que prospere el amparo es del ${prediccion.probabilidadAmparo} por ciento. ${prediccion.reglaAplicable}. ${prediccion.razonamiento}`}
                  conTexto={false}
                  className="shrink-0"
                />
              </div>

              <div className="grid gap-5 md:grid-cols-[auto_1fr] md:items-center">
                <div className="rounded-2xl border bg-card p-4">
                  <DemandanteGauge valor={prediccion.probabilidadAmparo} />
                </div>
                <div className="rounded-2xl border bg-secondary/50 p-4">
                  <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    Regla aplicable
                  </p>
                  <p className="mt-1 font-serif text-base font-medium text-navy">
                    {prediccion.reglaAplicable}
                  </p>
                  <Separator className="my-3" />
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {prediccion.razonamiento}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="mb-3 flex items-center gap-2 font-serif text-lg font-semibold text-navy">
                  <ScrollText className="size-5 text-primary" />
                  Sentencias que respaldan tu caso
                </h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  {prediccion.sentenciasCitadas.map((s) => (
                    <div
                      key={s.id}
                      className="rounded-xl border bg-card p-3 shadow-sm"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-sm font-semibold text-primary">
                          {s.id}
                        </span>
                        <Badge variant="secondary" className="font-normal">
                          {s.anio}
                        </Badge>
                      </div>
                      <p className="mt-1 text-sm font-medium text-navy">{s.tema}</p>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                        {s.subregla}
                      </p>
                    </div>
                  ))}
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Material ilustrativo. Una persona profesional del derecho debe
                  revisar el caso antes de su uso formal.
                </p>
              </div>

              <NavPasos onAtras={() => setPaso(3)} onSiguiente={() => setPaso(5)} textoSiguiente="Decidir mi camino" />
            </section>
          )}

          {/* ---------- PASO 5 ---------- */}
          {paso === 5 && !documento && (
            <section className="space-y-5">
              <div>
                <h2 className="font-serif text-2xl font-bold text-navy">
                  ¿Cómo quieres avanzar?
                </h2>
                <p className="mt-1 text-muted-foreground">
                  Elige un camino. Amparo redacta el documento por ti.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <CaminoCard
                  icon={Handshake}
                  titulo="Intentar con mi EPS"
                  descripcion="Radicamos un derecho de petición formal: identificamos quién en tu EPS debe responder y desde cuándo corre el plazo legal. Suele ser más rápido si la entidad responde a tiempo."
                  cta="Radicar derecho de petición"
                  variant="outline"
                  cargando={cargando === "reclamacion"}
                  onClick={() => decidir("reclamacion")}
                />
                <CaminoCard
                  icon={Gavel}
                  titulo="Generar mi tutela"
                  descripcion="Redactamos la acción de tutela completa, con radicado y plazos legales. La vía constitucional para proteger tu derecho."
                  cta="Generar tutela"
                  variant="default"
                  cargando={cargando === "tutela"}
                  onClick={() => decidir("tutela")}
                />
              </div>

              <Button variant="ghost" onClick={() => setPaso(4)} className="gap-2">
                <ArrowLeft className="size-4" /> Volver al pronóstico
              </Button>
            </section>
          )}

          {/* ---------- PASO 5 — Resultado ---------- */}
          {paso === 5 && documento && (
            <section className="space-y-5">
              <div className="rounded-2xl border border-success/30 bg-success/5 p-4">
                <div className="flex items-start justify-between gap-2">
                  <p className="flex items-center gap-2 font-serif text-lg font-semibold text-success">
                    <CheckCircle2 className="size-5" />
                    {tipoDoc === "tutela"
                      ? "Tu tutela está lista"
                      : "Tu reclamación está lista"}
                  </p>
                  <BotonVoz
                    texto={
                      tipoDoc === "tutela"
                        ? "Tu tutela está lista. Revísala, descárgala o llévala al juzgado de reparto."
                        : "Tu reclamación está lista. Envíala a tu EPS. Si no responde a tiempo, podrás escalar a tutela."
                    }
                    conTexto={false}
                    className="-mr-1 -mt-1 shrink-0 text-success"
                  />
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {tipoDoc === "tutela"
                    ? "Revísala, descárgala o llévala al juzgado de reparto."
                    : "Envíala a tu EPS. Si no responde a tiempo, podrás escalar a tutela."}
                </p>
              </div>

              {/* Derecho de petición: responsable + reloj de SLA */}
              {peticion && tipoDoc === "reclamacion" && (
                <PeticionReloj peticion={peticion} />
              )}

              {/* Expediente compartido (solo lectura): ver la respuesta de la EPS. */}
              {tipoDoc === "reclamacion" &&
                (() => {
                  const casoActual = getCaso(casoId);
                  return casoActual ? (
                    <Expediente caso={casoActual} vista="demandante" />
                  ) : null;
                })()}

              {radicado && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border bg-card p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Radicado
                    </p>
                    <p className="mt-1 font-mono text-base font-semibold text-navy">
                      {formatearRadicado(radicado)}
                    </p>
                  </div>
                  <div className="rounded-2xl border bg-card p-4">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Avance del caso
                    </p>
                    <Progress value={progresoCaso}>
                      <span className="ml-auto text-sm font-semibold text-navy">
                        {progresoCaso}%
                      </span>
                    </Progress>
                  </div>
                </div>
              )}

              {cronograma.length > 0 && (
                <div>
                  <h3 className="mb-3 font-serif text-lg font-semibold text-navy">
                    Plazos legales de tu tutela
                  </h3>
                  <ol className="space-y-2">
                    {cronograma.map((p) => (
                      <li
                        key={p.hito}
                        className="flex items-start gap-3 rounded-xl border bg-card p-3"
                      >
                        <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-info/10 text-xs font-bold text-info">
                          {p.dias}
                        </span>
                        <div className="min-w-0">
                          <p className="font-medium text-navy">{p.etiqueta}</p>
                          <p className="text-xs text-muted-foreground">
                            Vence el{" "}
                            {new Date(p.fechaLimite).toLocaleDateString("es-CO", {
                              day: "2-digit",
                              month: "long",
                              year: "numeric",
                            })}{" "}
                            · {p.dias} días {p.habiles ? "hábiles" : "calendario"} ·{" "}
                            {p.fundamento}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              <Card className="border-0 bg-card shadow-sm">
                <CardHeader className="flex-row items-center justify-between gap-2 space-y-0 pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <FileText className="size-4 text-primary" />
                    {tipoDoc === "tutela" ? "Acción de tutela" : "Reclamación a la EPS"}
                  </CardTitle>
                  <div className="flex gap-2">
                    <BotonVoz texto={documento} variant="outline" size="sm" />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={copiarDocumento}
                      className="gap-1.5"
                    >
                      <Copy className="size-4" /> Copiar
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="max-h-[28rem] overflow-y-auto rounded-xl border bg-background/60 p-4">
                    <DemandanteMarkdown source={documento} />
                  </div>
                </CardContent>
              </Card>

              <div className="flex flex-wrap gap-3">
                <Button variant="secondary" onClick={reiniciar} className="gap-2">
                  <Sparkles className="size-4" /> Iniciar otro caso
                </Button>
              </div>
            </section>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// --- Subcomponentes locales ---

function Campo({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-navy">{label}</span>
      {children}
    </label>
  );
}

function NavPasos({
  onAtras,
  onSiguiente,
  cargando,
  textoSiguiente,
  textoCargando,
}: {
  onAtras: () => void;
  onSiguiente: () => void;
  cargando?: boolean;
  textoSiguiente: string;
  textoCargando?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 pt-1">
      <Button variant="ghost" onClick={onAtras} className="gap-2" disabled={cargando}>
        <ArrowLeft className="size-4" /> Atrás
      </Button>
      <Button onClick={onSiguiente} disabled={cargando} size="lg" className="gap-2">
        {cargando ? (
          <>
            <Loader2 className="size-5 animate-spin" />
            {textoCargando ?? "Procesando…"}
          </>
        ) : (
          <>
            {textoSiguiente}
            <ArrowRight className="size-4" />
          </>
        )}
      </Button>
    </div>
  );
}

function VeredictoBanner({ triaje }: { triaje: TriajeResultado }) {
  const map = {
    admisible: {
      Icon: CheckCircle2,
      cls: "border-success/30 bg-success/5 text-success",
    },
    admisible_con_reservas: {
      Icon: CircleAlert,
      cls: "border-warning/30 bg-warning/5 text-warning",
    },
    inadmisible: {
      Icon: XCircle,
      cls: "border-danger/30 bg-danger/5 text-danger",
    },
  } as const;
  const m = map[triaje.veredicto];
  const titulo = VEREDICTO_TITULO[triaje.veredicto];
  return (
    <div className={cn("rounded-2xl border p-4", m.cls)}>
      <div className="flex items-start justify-between gap-2">
        <p className="flex items-center gap-2 font-serif text-lg font-semibold">
          <m.Icon className="size-5" /> {titulo}
        </p>
        <BotonVoz
          texto={`${titulo}. ${triaje.recomendacion}`}
          conTexto={false}
          className="-mr-1 -mt-1 shrink-0"
        />
      </div>
      <p className="mt-1 text-sm text-foreground/80">{triaje.recomendacion}</p>
      <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
        <Stethoscope className="size-3.5" />
        Ruta sugerida:{" "}
        <span className="font-medium capitalize">
          {triaje.rutaRecomendada === "tutela"
            ? "acción de tutela"
            : "negociación con la EPS"}
        </span>
        · confianza {Math.round(triaje.confianza * 100)}%
      </div>
    </div>
  );
}

function CaminoCard({
  icon: Icon,
  titulo,
  descripcion,
  cta,
  variant,
  cargando,
  onClick,
}: {
  icon: typeof Handshake;
  titulo: string;
  descripcion: string;
  cta: string;
  variant: "default" | "outline";
  cargando: boolean;
  onClick: () => void;
}) {
  return (
    <Card
      className={cn(
        "flex flex-col border-0 shadow-sm transition-shadow hover:shadow-md",
        variant === "default" && "ring-1 ring-primary/20",
      )}
    >
      <CardHeader>
        <span
          className={cn(
            "flex size-11 items-center justify-center rounded-xl",
            variant === "default"
              ? "bg-primary/10 text-primary"
              : "bg-secondary text-navy",
          )}
        >
          <Icon className="size-6" />
        </span>
        <CardTitle className="mt-3 font-serif text-lg text-navy">{titulo}</CardTitle>
        <CardDescription className="leading-relaxed">{descripcion}</CardDescription>
      </CardHeader>
      <CardContent className="mt-auto">
        <Button
          variant={variant}
          size="lg"
          className="w-full gap-2"
          onClick={onClick}
          disabled={cargando}
        >
          {cargando ? (
            <>
              <Loader2 className="size-5 animate-spin" /> Redactando…
            </>
          ) : (
            <>
              <Building2 className="size-4" /> {cta}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

// --- util ---

function evento(
  casoId: string,
  tipo: EventoCaso["tipo"],
  titulo: string,
  estado: EstadoCaso | undefined,
  extra: Partial<EventoCaso> = {},
): EventoCaso {
  return {
    id: `${casoId}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    fecha: new Date().toISOString(),
    tipo,
    titulo,
    ...(estado ? { estado } : {}),
    ...extra,
  };
}
