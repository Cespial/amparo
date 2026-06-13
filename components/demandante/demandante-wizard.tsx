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
import { useT, useLang, type TFunction } from "@/lib/i18n";
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
// Las ETIQUETAS visibles se resuelven en el idioma activo vía useT("demandante").
// Aquí se conservan solo las claves estructurales (ids, valores, iconos).

const PASO_KEYS = [
  { id: 1, key: "tell" },
  { id: 2, key: "yourCase" },
  { id: 3, key: "proceeds" },
  { id: 4, key: "forecast" },
  { id: 5, key: "decision" },
] as const;

const TIPO_SERVICIO_KEYS: TipoServicio[] = [
  "cirugia",
  "medicamento",
  "examen_diagnostico",
  "tratamiento",
  "traslado_ambulancia",
  "terapia",
  "insumo_dispositivo",
  "consulta_especialista",
  "otro",
];

const URGENCIA_KEYS: Urgencia[] = ["baja", "media", "alta", "vital"];

const ICONO_CRITERIO = {
  ok: { Icon: CheckCircle2, color: "text-success", bg: "bg-success/10", labelKey: "ok" },
  reserva: { Icon: CircleAlert, color: "text-warning", bg: "bg-warning/10", labelKey: "reserva" },
  falla: { Icon: XCircle, color: "text-danger", bg: "bg-danger/10", labelKey: "falla" },
} as const;

const CRITERIO_KEYS: (keyof TriajeResultado["criterios"])[] = [
  "derechoFundamental",
  "legitimacion",
  "subsidiariedad",
  "inmediatez",
  "noTemeridad",
  "hechoSuperado",
];

// --- Componente principal ---

export function DemandanteWizard({
  onCasoActivo,
}: {
  onCasoActivo?: (id: string) => void;
}) {
  const { getCaso, updateCaso, addEvento, addCaso, seleccionarCaso } =
    useCasoStore();
  const t = useT("demandante");
  const { lang } = useLang();
  const fechaLocale = lang === "en" ? "en-US" : "es-CO";

  // Constantes UI derivadas en el idioma activo.
  const PASOS: PasoDef[] = PASO_KEYS.map((p) => ({
    id: p.id,
    titulo: t(`steps.${p.key}`),
  }));
  const TIPOS_SERVICIO = TIPO_SERVICIO_KEYS.map((v) => ({
    v,
    label: t(`tipoServicio.${v}`),
  }));
  const URGENCIAS = URGENCIA_KEYS.map((v) => ({ v, label: t(`urgencia.${v}`) }));
  const RELATO_EJEMPLO = t("step1.ejemplo");
  const veredictoTitulo = (v: TriajeResultado["veredicto"]) =>
    t(`veredicto.${v}`);

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
    toast.success(t("step1.toast.ejemploTitle"), {
      description: t("step1.toast.ejemploDesc"),
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
          titulo: t("evento.casoRecibido"),
        },
      ],
    };
    return caso;
  }

  // ---- Paso 1 -> 2: Estructurar ----

  async function estructurar() {
    const texto = relato.trim();
    if (texto.length < 20) {
      toast.error(t("step1.toast.cortoTitle"), {
        description: t("step1.toast.cortoDesc"),
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
      toast.success(t("step1.toast.okTitle"), {
        description: t("step1.toast.okDesc"),
      });
    } catch {
      toast.error(t("step1.toast.errorTitle"), {
        description: t("step1.toast.errorDesc"),
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
      addEvento(
        caso.id,
        evento(caso.id, "ia", t("evento.triajeTitulo"), "TRIADO", {
          detalle: t("evento.triajeDetalle", {
            veredicto: data.veredicto.replace(/_/g, " "),
          }),
        }),
      );
      setPaso(3);
      leerSiModoVoz(
        t("say.veredicto", {
          titulo: veredictoTitulo(data.veredicto),
          recomendacion: data.recomendacion,
        }),
      );
    } catch {
      toast.error(t("step2.toast.errorTitle"), {
        description: t("step2.toast.errorDesc"),
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
      addEvento(
        caso.id,
        evento(caso.id, "ia", t("evento.prediccionTitulo"), undefined, {
          detalle: t("evento.prediccionDetalle", {
            pct: data.probabilidadAmparo,
          }),
        }),
      );
      setPaso(4);
      leerSiModoVoz(
        t("say.pronostico", {
          pct: data.probabilidadAmparo,
          regla: data.reglaAplicable,
        }),
      );
    } catch {
      toast.error(t("step3.toast.errorTitle"));
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
            t("evento.peticionTitulo"),
            "EN_NEGOCIACION_EPS",
            {
              actor: "demandante",
              detalle: t("evento.peticionDetalle", {
                dependencia: nuevaPeticion.dependencia,
                dias: nuevaPeticion.slaDias,
                tipo: nuevaPeticion.slaHabiles
                  ? t("resultado.diasHabiles")
                  : t("resultado.diasCalendario"),
                radicado: nuevaPeticion.radicadoPeticion,
              }),
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
          evento(
            caso.id,
            "documento",
            t("evento.tutelaTitulo"),
            "ESCALADO_TUTELA",
            {
              actor: "demandante",
              detalle: t("evento.tutelaDetalle", {
                radicado: formatearRadicado(caso.radicado),
              }),
            },
          ),
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
        via === "tutela" ? t("say.docTutela") : t("say.docReclamacion"),
      );
    } catch {
      toast.error(t("step5.toast.errorTitle"), {
        description: t("step5.toast.errorDesc"),
      });
    } finally {
      setCargando(null);
    }
  }

  function copiarDocumento() {
    if (!documento) return;
    void navigator.clipboard
      ?.writeText(documento)
      .then(() => toast.success(t("resultado.toast.copiadoOk")))
      .catch(() => toast.error(t("resultado.toast.copiadoError")));
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
          <DemandanteStepper
            pasos={PASOS}
            actual={paso}
            label={t("stepper.label", { actual: paso, total: PASOS.length })}
          />
          <div className="flex items-center justify-end">
            <Button
              type="button"
              variant={modoVoz ? "default" : "outline"}
              size="sm"
              onClick={alternarModoVoz}
              aria-pressed={modoVoz}
              aria-label={modoVoz ? t("voice.ariaOn") : t("voice.ariaOff")}
              title={t("voice.title")}
              className="gap-1.5"
            >
              {modoVoz ? (
                <Volume2 className="size-4" aria-hidden />
              ) : (
                <VolumeX className="size-4" aria-hidden />
              )}
              {modoVoz ? t("voice.on") : t("voice.off")}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-2">
          {/* ---------- PASO 1 ---------- */}
          {paso === 1 && (
            <section className="space-y-5">
              <div>
                <h2 className="font-serif text-2xl font-bold text-navy">
                  {t("step1.title")}
                </h2>
                <p className="mt-1 text-muted-foreground">
                  {t("step1.subtitle")}
                </p>
              </div>

              <div className="relative">
                <Textarea
                  value={relato}
                  onChange={(e) => setRelato(e.target.value)}
                  placeholder={t("step1.placeholder")}
                  className="min-h-44 resize-none bg-card p-4 text-base leading-relaxed"
                  aria-label={t("step1.ariaRelato")}
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
                        <MicOff className="size-5" /> {t("step1.detener")}
                      </>
                    ) : (
                      <>
                        <Mic className="size-5" /> {t("step1.dictar")}
                      </>
                    )}
                  </Button>
                )}
              </div>

              {!dictado.soportado && (
                <p className="flex items-center gap-2 text-xs text-muted-foreground">
                  <MicOff className="size-3.5" />
                  {t("step1.noDictado")}
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
                  {t("step1.usarEjemplo")}
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
                      <Loader2 className="size-5 animate-spin" />{" "}
                      {t("step1.organizando")}
                    </>
                  ) : (
                    <>
                      <Wand2 className="size-5" /> {t("step1.continuar")}
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
                  {t("step2.title")}
                </h2>
                <p className="mt-1 text-muted-foreground">
                  {t("step2.subtitle")}
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Campo label={t("step2.fields.paciente")}>
                  <Input
                    value={paciente}
                    onChange={(e) => setPaciente(e.target.value)}
                    placeholder={t("step2.fields.pacientePlaceholder")}
                  />
                </Campo>
                <Campo label={t("step2.fields.eps")}>
                  <Input
                    value={eps}
                    onChange={(e) => setEps(e.target.value)}
                    placeholder={t("step2.fields.epsPlaceholder")}
                  />
                </Campo>
                <Campo label={t("step2.fields.servicioNegado")}>
                  <Input
                    value={estructura.servicioNegado ?? ""}
                    onChange={(e) =>
                      setEstructura({ ...estructura, servicioNegado: e.target.value })
                    }
                  />
                </Campo>
                <Campo label={t("step2.fields.tipoServicio")}>
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
                      {TIPOS_SERVICIO.map((ts) => (
                        <SelectItem key={ts.v} value={ts.v}>
                          {ts.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Campo>
                <Campo label={t("step2.fields.diagnostico")}>
                  <Input
                    value={estructura.diagnostico ?? ""}
                    onChange={(e) =>
                      setEstructura({ ...estructura, diagnostico: e.target.value })
                    }
                  />
                </Campo>
                <Campo label={t("step2.fields.urgencia")}>
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

              <Campo label={t("step2.fields.hechos")}>
                <Textarea
                  value={estructura.hechos ?? ""}
                  onChange={(e) =>
                    setEstructura({ ...estructura, hechos: e.target.value })
                  }
                  className="min-h-28 resize-none"
                />
              </Campo>
              <Campo label={t("step2.fields.pretension")}>
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
                    {t("step2.derechosEnJuego")}
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
                textoSiguiente={t("step2.siguiente")}
                textoCargando={t("step2.cargando")}
                textoAtras={t("nav.atras")}
              />
            </section>
          )}

          {/* ---------- PASO 3 ---------- */}
          {paso === 3 && triaje && (
            <section className="space-y-5">
              <VeredictoBanner triaje={triaje} t={t} />

              <div className="grid gap-3">
                {CRITERIO_KEYS.map((k) => {
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
                          {t(`criterio.${k}`)}
                          <Badge variant="outline" className={cn("font-normal", meta.color)}>
                            {t(`criterio.estado.${meta.labelKey}`)}
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
                    <AlertTriangle className="size-4" /> {t("step3.banderasTitulo")}
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
                textoSiguiente={t("step3.siguiente")}
                textoCargando={t("step3.cargando")}
                textoAtras={t("nav.atras")}
              />
            </section>
          )}

          {/* ---------- PASO 4 ---------- */}
          {paso === 4 && prediccion && (
            <section className="space-y-5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="font-serif text-2xl font-bold text-navy">
                    {t("step4.title")}
                  </h2>
                  <p className="mt-1 text-muted-foreground">
                    {t("step4.subtitle")}
                  </p>
                </div>
                <BotonVoz
                  texto={t("say.pronosticoCompleto", {
                    pct: prediccion.probabilidadAmparo,
                    regla: prediccion.reglaAplicable,
                    razonamiento: prediccion.razonamiento,
                  })}
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
                    {t("step4.reglaAplicable")}
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
                  {t("step4.sentenciasTitulo")}
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
                  {t("step4.sentenciasNota")}
                </p>
              </div>

              <NavPasos
                onAtras={() => setPaso(3)}
                onSiguiente={() => setPaso(5)}
                textoSiguiente={t("step4.siguiente")}
                textoAtras={t("nav.atras")}
              />
            </section>
          )}

          {/* ---------- PASO 5 ---------- */}
          {paso === 5 && !documento && (
            <section className="space-y-5">
              <div>
                <h2 className="font-serif text-2xl font-bold text-navy">
                  {t("step5.title")}
                </h2>
                <p className="mt-1 text-muted-foreground">
                  {t("step5.subtitle")}
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <CaminoCard
                  icon={Handshake}
                  titulo={t("step5.reclamacion.titulo")}
                  descripcion={t("step5.reclamacion.descripcion")}
                  cta={t("step5.reclamacion.cta")}
                  textoCargando={t("step5.redactando")}
                  variant="outline"
                  cargando={cargando === "reclamacion"}
                  onClick={() => decidir("reclamacion")}
                />
                <CaminoCard
                  icon={Gavel}
                  titulo={t("step5.tutela.titulo")}
                  descripcion={t("step5.tutela.descripcion")}
                  cta={t("step5.tutela.cta")}
                  textoCargando={t("step5.redactando")}
                  variant="default"
                  cargando={cargando === "tutela"}
                  onClick={() => decidir("tutela")}
                />
              </div>

              <Button variant="ghost" onClick={() => setPaso(4)} className="gap-2">
                <ArrowLeft className="size-4" /> {t("step5.volverPronostico")}
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
                      ? t("resultado.tutelaLista")
                      : t("resultado.reclamacionLista")}
                  </p>
                  <BotonVoz
                    texto={
                      tipoDoc === "tutela"
                        ? t("say.docTutela")
                        : t("say.docReclamacion")
                    }
                    conTexto={false}
                    className="-mr-1 -mt-1 shrink-0 text-success"
                  />
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {tipoDoc === "tutela"
                    ? t("resultado.tutelaSub")
                    : t("resultado.reclamacionSub")}
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
                      {t("resultado.radicado")}
                    </p>
                    <p className="mt-1 font-mono text-base font-semibold text-navy">
                      {formatearRadicado(radicado)}
                    </p>
                  </div>
                  <div className="rounded-2xl border bg-card p-4">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {t("resultado.avanceCaso")}
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
                    {t("resultado.plazosTitulo")}
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
                            {t("resultado.plazoVence", {
                              fecha: new Date(p.fechaLimite).toLocaleDateString(
                                fechaLocale,
                                {
                                  day: "2-digit",
                                  month: "long",
                                  year: "numeric",
                                },
                              ),
                              dias: p.dias,
                              tipo: p.habiles
                                ? t("resultado.diasHabiles")
                                : t("resultado.diasCalendario"),
                              fundamento: p.fundamento,
                            })}
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
                    {tipoDoc === "tutela"
                      ? t("resultado.docTutela")
                      : t("resultado.docReclamacion")}
                  </CardTitle>
                  <div className="flex gap-2">
                    <BotonVoz texto={documento} variant="outline" size="sm" />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={copiarDocumento}
                      className="gap-1.5"
                    >
                      <Copy className="size-4" /> {t("resultado.copiar")}
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
                  <Sparkles className="size-4" /> {t("resultado.otroCaso")}
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
  textoAtras,
}: {
  onAtras: () => void;
  onSiguiente: () => void;
  cargando?: boolean;
  textoSiguiente: string;
  textoCargando?: string;
  textoAtras: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 pt-1">
      <Button variant="ghost" onClick={onAtras} className="gap-2" disabled={cargando}>
        <ArrowLeft className="size-4" /> {textoAtras}
      </Button>
      <Button onClick={onSiguiente} disabled={cargando} size="lg" className="gap-2">
        {cargando ? (
          <>
            <Loader2 className="size-5 animate-spin" />
            {textoCargando ?? textoSiguiente}
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

function VeredictoBanner({
  triaje,
  t,
}: {
  triaje: TriajeResultado;
  t: TFunction;
}) {
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
  const titulo = t(`veredicto.${triaje.veredicto}`);
  return (
    <div className={cn("rounded-2xl border p-4", m.cls)}>
      <div className="flex items-start justify-between gap-2">
        <p className="flex items-center gap-2 font-serif text-lg font-semibold">
          <m.Icon className="size-5" /> {titulo}
        </p>
        <BotonVoz
          texto={t("say.veredicto", {
            titulo,
            recomendacion: triaje.recomendacion,
          })}
          conTexto={false}
          className="-mr-1 -mt-1 shrink-0"
        />
      </div>
      <p className="mt-1 text-sm text-foreground/80">{triaje.recomendacion}</p>
      <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
        <Stethoscope className="size-3.5" />
        {t("step3.rutaSugerida")}{" "}
        <span className="font-medium">
          {triaje.rutaRecomendada === "tutela"
            ? t("step3.rutaTutela")
            : t("step3.rutaEps")}
        </span>
        · {t("step3.confianza", { pct: Math.round(triaje.confianza * 100) })}
      </div>
    </div>
  );
}

function CaminoCard({
  icon: Icon,
  titulo,
  descripcion,
  cta,
  textoCargando,
  variant,
  cargando,
  onClick,
}: {
  icon: typeof Handshake;
  titulo: string;
  descripcion: string;
  cta: string;
  textoCargando: string;
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
              <Loader2 className="size-5 animate-spin" /> {textoCargando}
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
