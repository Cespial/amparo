"use client";

/**
 * AsistenteAmparo — Vista guiada human-in-the-loop con avatar audio-reactivo.
 *
 * Flujo de UNA pregunta a la vez:
 *  saludo -> relato -> estructurar -> confirmar (campo a campo) -> triaje
 *  -> predicción -> cierre. Cada mensaje de Amparo se HABLA (avatar reactivo)
 *  y se muestra en texto (accesibilidad). El estado vive LOCAL aquí; el Caso
 *  se arma en memoria para /api/triaje y /api/predecir.
 */

import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import {
  ArrowRight,
  FileText,
  Mic,
  Radio,
  Send,
  Sparkles,
  Square,
  Volume2,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useLang, useT } from "@/lib/i18n";
import {
  AvatarAmparo,
  type AvatarAmparoHandle,
  type EstadoAvatar,
} from "./avatar-amparo";
import { useDictadoAsistente } from "./use-dictado-asistente";
import {
  construirCaso,
  ESTADO_INICIAL,
  fraseConfirmacion,
  frasePrediccion,
  fraseVeredicto,
  msg,
  PASOS_CONFIRMACION,
  type EstadoConversacion,
  type EstructuracionOutput,
  type Mensaje,
  type PrediccionResultado,
  type TriajeResultado,
} from "./conversacion";

// --- Reducer -----------------------------------------------------------------

type Accion =
  | { tipo: "decirAmparo"; texto: string }
  | { tipo: "decirUsuario"; texto: string }
  | { tipo: "fase"; fase: EstadoConversacion["fase"] }
  | { tipo: "datos"; datos: EstructuracionOutput }
  | { tipo: "patchDato"; campo: keyof EstructuracionOutput; valor: string }
  | { tipo: "avanzarConfirmacion" }
  | { tipo: "triaje"; triaje: TriajeResultado }
  | { tipo: "prediccion"; prediccion: PrediccionResultado }
  | { tipo: "error"; mensaje: string }
  | { tipo: "reset" };

function reducer(
  estado: EstadoConversacion,
  accion: Accion,
): EstadoConversacion {
  switch (accion.tipo) {
    case "decirAmparo":
      return {
        ...estado,
        mensajes: [...estado.mensajes, msg("amparo", accion.texto)],
      };
    case "decirUsuario":
      return {
        ...estado,
        mensajes: [...estado.mensajes, msg("usuario", accion.texto)],
      };
    case "fase":
      return { ...estado, fase: accion.fase };
    case "datos":
      return { ...estado, datos: { ...estado.datos, ...accion.datos } };
    case "patchDato":
      return {
        ...estado,
        datos: { ...estado.datos, [accion.campo]: accion.valor },
      };
    case "avanzarConfirmacion":
      return { ...estado, pasoConfirmacion: estado.pasoConfirmacion + 1 };
    case "triaje":
      return { ...estado, triaje: accion.triaje };
    case "prediccion":
      return { ...estado, prediccion: accion.prediccion };
    case "error":
      return { ...estado, fase: "error", errorMsg: accion.mensaje };
    case "reset":
      return { ...ESTADO_INICIAL, mensajes: [] };
  }
}

// --- Copia local del modo conversación --------------------------------------
//
// Estas cadenas son NUEVAS de esta vista (toggle + estado conversacional) y no
// existen en el diccionario asistente (lib/i18n/dict — territorio de otro
// agente). Para conservar el bilingüismo SIN tocar lib/, se resuelven aquí con
// el idioma activo (useLang). Mantienen el mismo tono que el dict.
const COPIA = {
  es: {
    toggleLabel: "Modo conversación",
    toggleHint: "Manos libres: Amparo pregunta, tú respondes hablando.",
    toggleOn: "Manos libres activado",
    toggleOff: "Manos libres desactivado",
    stHablando: "Amparo habla…",
    stEscuchando: "Escuchando…",
    stGrabando: "Grabando…",
    stTranscribiendo: "Transcribiendo…",
    stPensando: "Pensando…",
    stListo: "Tu turno",
    micDenied:
      "No pude usar el micrófono. Seguimos por texto: escribe tu respuesta.",
    micUnsupported:
      "Tu navegador no permite dictado por voz. Puedes responder escribiendo.",
    micRetry: "No te escuché bien. Cuando quieras, vuelvo a intentarlo.",
  },
  en: {
    toggleLabel: "Conversation mode",
    toggleHint: "Hands-free: Amparo asks, you answer by speaking.",
    toggleOn: "Hands-free on",
    toggleOff: "Hands-free off",
    stHablando: "Amparo is speaking…",
    stEscuchando: "Listening…",
    stGrabando: "Recording…",
    stTranscribiendo: "Transcribing…",
    stPensando: "Thinking…",
    stListo: "Your turn",
    micDenied:
      "I couldn't use the microphone. Let's continue by text: type your answer.",
    micUnsupported:
      "Your browser doesn't support voice dictation. You can answer by typing.",
    micRetry: "I didn't catch that. I'll try again whenever you're ready.",
  },
} as const;

/** Fases en las que Amparo espera input del usuario (relato / confirmación). */
function faseAdmiteInput(fase: EstadoConversacion["fase"]): boolean {
  return fase === "relato" || fase === "confirmar" || fase === "error";
}

/**
 * ¿Hay SpeechRecognition del navegador? Sirve para decidir si vale la pena
 * conmutar al fallback cuando la transcripción en la nube falla.
 */
function getCtorDisponible(): boolean {
  if (typeof window === "undefined") return false;
  const w = window as unknown as {
    SpeechRecognition?: unknown;
    webkitSpeechRecognition?: unknown;
  };
  return !!(w.SpeechRecognition ?? w.webkitSpeechRecognition);
}

/** Debounce de silencio antes de auto-enviar la respuesta hablada (ms). */
const SILENCIO_MS = 800;

// --- Componente --------------------------------------------------------------

export function AsistenteAmparo() {
  const t = useT("asistente");
  const { lang } = useLang();
  const c = COPIA[lang] ?? COPIA.es;
  const [estado, dispatch] = useReducer(reducer, ESTADO_INICIAL);
  const [borrador, setBorrador] = useState("");
  const [hablando, setHablando] = useState(false);
  // Modo conversación (manos libres). OPT-IN: apagado por defecto para no
  // romper el flujo manual (micrófono + Send).
  const [modoConversacion, setModoConversacion] = useState(false);
  const [avisoVoz, setAvisoVoz] = useState<string | null>(null);

  const avatarRef = useRef<AvatarAmparoHandle>(null);
  const hiloRef = useRef<HTMLDivElement>(null);
  const iniciadoRef = useRef(false);
  const dictado = useDictadoAsistente();

  // Refs que exponen el valor VIVO a callbacks de larga vida (reconocimiento de
  // voz, timers) sin recrearlos ni encadenar dependencias circulares. Se
  // sincronizan en efectos (no durante el render) para respetar react-hooks/refs.
  const modoConversacionRef = useRef(modoConversacion);
  const faseRef = useRef(estado.fase);
  const borradorRef = useRef(borrador);
  // Apuntan a las versiones más recientes de enviar() y al auto-armado de voz.
  const enviarRef = useRef<() => void>(() => {});
  const autoEscucharRef = useRef<() => void>(() => {});
  // Timer del debounce de silencio antes de auto-enviar.
  const silencioRef = useRef<number | null>(null);
  // Reintentos consecutivos por "no-speech" (evita reabrir el micro sin fin).
  const reintentosRef = useRef(0);
  // Fallos consecutivos de la transcripción en la nube. Tras 2, forzamos el
  // SpeechRecognition del navegador para no dejar al usuario sin voz.
  const fallosNubeRef = useRef(0);
  const [forzarNavegador, setForzarNavegador] = useState(false);
  const forzarNavegadorRef = useRef(forzarNavegador);
  useEffect(() => {
    forzarNavegadorRef.current = forzarNavegador;
  }, [forzarNavegador]);

  useEffect(() => {
    modoConversacionRef.current = modoConversacion;
  }, [modoConversacion]);
  useEffect(() => {
    faseRef.current = estado.fase;
  }, [estado.fase]);
  useEffect(() => {
    borradorRef.current = borrador;
  }, [borrador]);

  // Hace que Amparo diga algo (voz + burbuja de texto) y espera a que termine.
  // En modo conversación, al terminar de hablar AUTO-arma el dictado si la fase
  // (ya actualizada por quien orquesta) admite input del usuario.
  const amparoDice = useCallback(async (texto: string) => {
    dispatch({ tipo: "decirAmparo", texto });
    try {
      await avatarRef.current?.decir(texto);
    } catch {
      /* la voz nunca debe romper el flujo */
    }
    // Tras hablar: si estamos en manos libres y toca que el usuario hable,
    // arrancamos el micrófono solo. Lo hacemos vía ref para leer la versión
    // más reciente de autoEscuchar sin encadenar dependencias.
    if (modoConversacionRef.current && faseAdmiteInput(faseRef.current)) {
      autoEscucharRef.current();
    }
  }, []);

  // Saludo inicial automático (una sola vez).
  // El guard `iniciadoRef` se fija DENTRO del callback del timer (no al
  // programarlo): bajo React StrictMode el efecto corre mount → cleanup →
  // remount; si fijáramos el guard de forma síncrona, el cleanup limpiaría el
  // timer pero el remount caería en el early-return y el saludo nunca se
  // ejecutaría. Así, el cleanup cancela el timer pendiente sin dejar el guard
  // "armado", y el remount puede reprogramarlo.
  useEffect(() => {
    if (iniciadoRef.current) return;
    const timer = window.setTimeout(() => {
      if (iniciadoRef.current) return;
      iniciadoRef.current = true;
      void (async () => {
        // Pasamos a "relato" ANTES de hablar para que, en manos libres, el
        // micrófono se auto-arme al terminar el saludo. El input sigue
        // bloqueado por `ocupado` mientras Amparo habla, así que no hay riesgo
        // de que el usuario escriba antes de tiempo.
        dispatch({ tipo: "fase", fase: "relato" });
        await amparoDice(t("say.greeting"));
      })();
    }, 400);
    return () => window.clearTimeout(timer);
  }, [amparoDice, t]);

  // Auto-scroll del hilo al último mensaje.
  useEffect(() => {
    hiloRef.current?.scrollTo({
      top: hiloRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [estado.mensajes, estado.fase]);

  // Limpia voz al desmontar. avatarRef es un recurso imperativo (no un nodo
  // de React); leemos su valor vivo en el cleanup a propósito.
  const dictadoDetener = dictado.detener;
  useEffect(() => {
    const avatar = avatarRef;
    return () => {
      avatar.current?.detener();
      dictadoDetener();
    };
  }, [dictadoDetener]);

  const estadoAvatar: EstadoAvatar = hablando
    ? "hablando"
    : dictado.escuchando
      ? "escuchando"
      : dictado.transcribiendo ||
          estado.fase === "estructurando" ||
          estado.fase === "triando" ||
          estado.fase === "prediciendo"
        ? "pensando"
        : "inactivo";

  // --- Llamadas a las APIs existentes ---

  const llamarEstructurar = useCallback(
    async (relato: string): Promise<EstructuracionOutput | null> => {
      const res = await fetch("/api/estructurar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ relato, lang }),
      });
      if (!res.ok) return null;
      return (await res.json()) as EstructuracionOutput;
    },
    [lang],
  );

  const llamarTriaje = useCallback(
    async (datos: EstructuracionOutput): Promise<TriajeResultado | null> => {
      const caso = construirCaso(datos);
      const res = await fetch("/api/triaje", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caso, lang }),
      });
      if (!res.ok) return null;
      return (await res.json()) as TriajeResultado;
    },
    [lang],
  );

  const llamarPredecir = useCallback(
    async (
      datos: EstructuracionOutput,
    ): Promise<PrediccionResultado | null> => {
      const caso = construirCaso(datos);
      const res = await fetch("/api/predecir", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caso, lang }),
      });
      if (!res.ok) return null;
      return (await res.json()) as PrediccionResultado;
    },
    [lang],
  );

  // --- Orquestación de fases ---

  /** Lanza triaje + predicción y narra los resultados. */
  const correrAnalisis = useCallback(
    async (datos: EstructuracionOutput) => {
      // Triaje
      dispatch({ tipo: "fase", fase: "triando" });
      const triaje = await llamarTriaje(datos);
      if (!triaje) {
        dispatch({
          tipo: "error",
          mensaje: t("say.triageFailed"),
        });
        await amparoDice(t("say.triageFailed"));
        return;
      }
      dispatch({ tipo: "triaje", triaje });
      dispatch({ tipo: "fase", fase: "triaje" });
      await amparoDice(fraseVeredicto(t, triaje));

      // Predicción
      dispatch({ tipo: "fase", fase: "prediciendo" });
      const prediccion = await llamarPredecir(datos);
      if (prediccion) {
        dispatch({ tipo: "prediccion", prediccion });
        dispatch({ tipo: "fase", fase: "prediccion" });
        await amparoDice(frasePrediccion(t, prediccion));
      }

      // Cierre
      dispatch({ tipo: "fase", fase: "cierre" });
      await amparoDice(t("say.closing"));
    },
    [amparoDice, llamarPredecir, llamarTriaje, t],
  );

  /** Hace la pregunta de confirmación del paso actual (o pasa al análisis). */
  const preguntarSiguienteConfirmacion = useCallback(
    async (paso: number, datos: EstructuracionOutput) => {
      if (paso >= PASOS_CONFIRMACION.length) {
        await amparoDice(t("say.gotEssentials"));
        await correrAnalisis(datos);
        return;
      }
      dispatch({ tipo: "fase", fase: "confirmar" });
      await amparoDice(
        fraseConfirmacion(t, PASOS_CONFIRMACION[paso].campo, datos),
      );
    },
    [amparoDice, correrAnalisis, t],
  );

  /** Procesa el primer relato del usuario. */
  const procesarRelato = useCallback(
    async (relato: string) => {
      dispatch({ tipo: "fase", fase: "estructurando" });
      await amparoDice(t("say.organizing"));
      const out = await llamarEstructurar(relato);
      if (!out) {
        dispatch({
          tipo: "error",
          mensaje: t("say.organizeFailed"),
        });
        await amparoDice(t("say.organizeFailed"));
        dispatch({ tipo: "fase", fase: "relato" });
        return;
      }
      // Conserva el relato como hechos si el modelo no lo trae.
      const datos: EstructuracionOutput = {
        ...out,
        hechos: out.hechos ?? relato,
      };
      dispatch({ tipo: "datos", datos });
      await preguntarSiguienteConfirmacion(0, datos);
    },
    [amparoDice, llamarEstructurar, preguntarSiguienteConfirmacion, t],
  );

  /** Maneja la respuesta del usuario en la fase de confirmación. */
  const procesarConfirmacion = useCallback(
    async (texto: string) => {
      const paso = estado.pasoConfirmacion;
      const { campo } = PASOS_CONFIRMACION[paso];
      const limpio = texto.trim();
      // NLU mínima de sí/no, dependiente del idioma activo de la conversación.
      const afirmativo = (
        lang === "en"
          ? /^(yes|yeah|yep|yup|correct|exactly|that's right|thats right|right|sure|ok|okay|fine|perfect|done|all good)\b/i
          : /^(s[ií]|correcto|exacto|así es|asi es|claro|ok|vale|de acuerdo|perfecto|listo)\b/i
      ).test(limpio);
      const negativo = (
        lang === "en"
          ? /^(no|nope|incorrect|wrong|that's wrong|thats wrong|not at all)\b/i
          : /^(no|incorrecto|está mal|esta mal|para nada)\b/i
      ).test(limpio);

      let datosActuales = estado.datos;

      if (negativo) {
        // Pide la corrección explícita y se queda en el mismo paso.
        await amparoDice(
          t("say.askAgain", { etiqueta: t(`confirm.label.${campo}`) }),
        );
        return;
      }

      if (!afirmativo && limpio) {
        // El usuario dio un valor nuevo/corregido directamente.
        dispatch({ tipo: "patchDato", campo, valor: limpio });
        datosActuales = { ...estado.datos, [campo]: limpio };
        await amparoDice(t("say.noted"));
      }

      dispatch({ tipo: "avanzarConfirmacion" });
      await preguntarSiguienteConfirmacion(paso + 1, datosActuales);
    },
    [
      amparoDice,
      estado.datos,
      estado.pasoConfirmacion,
      lang,
      preguntarSiguienteConfirmacion,
      t,
    ],
  );

  // --- Envío unificado del input ---

  const ocupado =
    hablando ||
    estado.fase === "estructurando" ||
    estado.fase === "triando" ||
    estado.fase === "prediciendo" ||
    estado.fase === "saludo";

  const puedeEscribir =
    !ocupado &&
    (estado.fase === "relato" ||
      estado.fase === "confirmar" ||
      estado.fase === "error");

  // Cancela un auto-envío pendiente (debounce de silencio).
  const cancelarSilencio = useCallback(() => {
    if (silencioRef.current != null) {
      window.clearTimeout(silencioRef.current);
      silencioRef.current = null;
    }
  }, []);

  const enviar = useCallback(async () => {
    cancelarSilencio();
    const texto = borrador.trim();
    if (!texto || ocupado) return;
    if (dictado.escuchando) dictado.detener();
    setBorrador("");
    dispatch({ tipo: "decirUsuario", texto });

    if (estado.fase === "relato" || estado.fase === "error") {
      await procesarRelato(texto);
    } else if (estado.fase === "confirmar") {
      await procesarConfirmacion(texto);
    }
  }, [
    borrador,
    cancelarSilencio,
    dictado,
    estado.fase,
    ocupado,
    procesarConfirmacion,
    procesarRelato,
  ]);

  // Mantén enviarRef apuntando a la última versión de enviar().
  useEffect(() => {
    enviarRef.current = () => {
      void enviar();
    };
  }, [enviar]);

  // Arma el dictado en modo manos libres: acumula texto, programa el auto-envío
  // tras un silencio, y degrada con gracia ante errores/permiso denegado.
  const autoEscuchar = useCallback(() => {
    if (!dictado.soportado) {
      setAvisoVoz(c.micUnsupported);
      return;
    }
    setAvisoVoz(null);
    cancelarSilencio();
    avatarRef.current?.detener();
    dictado.iniciar({
      lang: lang === "en" ? "en-US" : "es-CO",
      // Tras fallos repetidos de la nube, usa el dictado del navegador.
      preferirNavegador: forzarNavegadorRef.current,
      onHabla: () => {
        // El usuario retomó la palabra: cancela un auto-envío en cola para no
        // cortarlo a mitad de frase, y resetea el contador de reintentos.
        reintentosRef.current = 0;
        cancelarSilencio();
      },
      onTexto: (txt) => {
        // Texto OK: limpia contadores de error (la nube respondió bien).
        reintentosRef.current = 0;
        fallosNubeRef.current = 0;
        setBorrador((prev) => (prev ? `${prev} ${txt}` : txt));
      },
      onFin: () => {
        // El reconocedor cerró por silencio: si hay texto, auto-enviamos tras
        // un breve respiro; el usuario aún puede teclear/cancelar.
        cancelarSilencio();
        silencioRef.current = window.setTimeout(() => {
          silencioRef.current = null;
          if (
            modoConversacionRef.current &&
            borradorRef.current.trim() &&
            faseAdmiteInput(faseRef.current)
          ) {
            enviarRef.current();
          }
        }, SILENCIO_MS);
      },
      onError: (code) => {
        cancelarSilencio();
        if (code === "not-allowed" || code === "service-not-allowed") {
          // Permiso denegado: apaga manos libres y degrada a solo texto.
          setModoConversacion(false);
          setAvisoVoz(c.micDenied);
          return;
        }
        if (code === "not-supported") {
          setAvisoVoz(c.micUnsupported);
          return;
        }
        // Fallo de la transcripción en la nube (o del motor de nube al armar).
        // A los 2 fallos consecutivos, conmutamos al SpeechRecognition del
        // navegador y reintentamos UNA vez con ese motor. Antes de eso,
        // reintentamos la nube sin texto pendiente.
        if (code === "transcribe-failed" || code === "nube-failed") {
          fallosNubeRef.current += 1;
          if (
            fallosNubeRef.current >= 2 &&
            !forzarNavegadorRef.current &&
            getCtorDisponible()
          ) {
            setForzarNavegador(true);
            forzarNavegadorRef.current = true; // efecto inmediato para el re-arme
          }
          if (
            modoConversacionRef.current &&
            faseAdmiteInput(faseRef.current) &&
            !borradorRef.current.trim() &&
            fallosNubeRef.current <= 3
          ) {
            autoEscucharRef.current();
            return;
          }
          setAvisoVoz(c.micRetry);
          return;
        }
        // no-speech / audio-capture: reabre el micro hasta 2 veces si seguimos
        // en manos libres, la fase espera input y no hay texto pendiente. Más
        // allá de eso, dejamos un aviso suave y la palabra al usuario.
        if (
          (code === "no-speech" || code === "audio-capture") &&
          modoConversacionRef.current &&
          faseAdmiteInput(faseRef.current) &&
          !borradorRef.current.trim() &&
          reintentosRef.current < 2
        ) {
          reintentosRef.current += 1;
          autoEscucharRef.current();
          return;
        }
        if (code !== "aborted") {
          reintentosRef.current = 0;
          setAvisoVoz(c.micRetry);
        }
      },
    });
  }, [cancelarSilencio, dictado, c, lang]);

  // Mantén autoEscucharRef apuntando a la última versión (la usa amparoDice).
  useEffect(() => {
    autoEscucharRef.current = autoEscuchar;
  }, [autoEscuchar]);

  const onMicro = useCallback(() => {
    if (dictado.escuchando) {
      dictado.detener();
      return;
    }
    cancelarSilencio();
    avatarRef.current?.detener();
    dictado.iniciar((t) => setBorrador((prev) => (prev ? `${prev} ${t}` : t)));
  }, [cancelarSilencio, dictado]);

  // Al apagar el modo conversación, corta cualquier escucha/auto-envío vivo.
  useEffect(() => {
    if (!modoConversacion) {
      cancelarSilencio();
      if (dictado.escuchando) dictado.detener();
    }
  }, [modoConversacion, cancelarSilencio, dictado]);

  // Limpia el timer de silencio al desmontar.
  useEffect(() => cancelarSilencio, [cancelarSilencio]);

  // Barge-in: el usuario corta a Amparo mientras habla y pasa a escuchar.
  // Solo tiene sentido en manos libres y si la fase admite input.
  const interrumpir = useCallback(() => {
    avatarRef.current?.detener();
    if (faseAdmiteInput(faseRef.current)) autoEscuchar();
  }, [autoEscuchar]);

  const repetir = useCallback(() => {
    const ultima = [...estado.mensajes]
      .reverse()
      .find((m) => m.autor === "amparo");
    if (ultima) void avatarRef.current?.decir(ultima.texto);
  }, [estado.mensajes]);

  const placeholder =
    estado.fase === "confirmar"
      ? t("input.placeholderConfirmar")
      : t("input.placeholderRelato");

  // Estado conversacional accesible (aria-live) para el modo manos libres.
  // El STT nube distingue "grabando…" (mic abierto) de "transcribiendo…" (audio
  // en la nube); ambos son sub-estados de "pensando/escuchando" en el avatar.
  const statusConversacion = dictado.transcribiendo
    ? c.stTranscribiendo
    : estadoAvatar === "hablando"
      ? c.stHablando
      : estadoAvatar === "escuchando"
        ? c.stGrabando
        : estadoAvatar === "pensando"
          ? c.stPensando
          : c.stListo;

  // El toggle solo se ofrece si el navegador soporta dictado por voz.
  const ofreceModo = dictado.soportado;

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-6">
      {/* Encabezado de la página */}
      <header className="mb-2 text-center">
        <h1 className="font-serif text-3xl font-bold tracking-tight text-navy sm:text-4xl">
          {t("page.title")}
        </h1>
        <p className="mx-auto mt-2 max-w-xl text-balance text-muted-foreground">
          {t("page.subtitle")}
        </p>
      </header>

      {/* Avatar centrado arriba */}
      <div className="flex flex-col items-center gap-3 pt-2">
        <AvatarAmparo
          ref={avatarRef}
          estado={estadoAvatar}
          size={184}
          onHablandoChange={setHablando}
        />
        <div className="flex items-center gap-2" aria-live="polite">
          <Badge variant="secondary" className="gap-1.5 font-medium">
            <Sparkles className="size-3.5" aria-hidden="true" />
            {t("avatar.name")}
          </Badge>
          <span className="text-sm text-muted-foreground">
            {estadoAvatar === "hablando"
              ? t("avatar.speaking")
              : estadoAvatar === "pensando"
                ? t("avatar.thinking")
                : estadoAvatar === "escuchando"
                  ? t("avatar.listening")
                  : t("avatar.idle")}
          </span>
        </div>

        {/* Toggle de modo conversación (manos libres) — OPT-IN. */}
        {ofreceModo && (
          <div className="flex flex-col items-center gap-1.5">
            <button
              type="button"
              role="switch"
              aria-checked={modoConversacion}
              aria-label={`${c.toggleLabel}: ${
                modoConversacion ? c.toggleOn : c.toggleOff
              }`}
              title={c.toggleHint}
              onClick={() => setModoConversacion((v) => !v)}
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                modoConversacion
                  ? "border-primary/40 bg-primary/10 text-primary"
                  : "border-border bg-card text-muted-foreground hover:text-foreground",
              )}
            >
              <Radio className="size-4" aria-hidden="true" />
              {c.toggleLabel}
              <span
                aria-hidden="true"
                className={cn(
                  "relative inline-flex h-5 w-9 items-center rounded-full transition-colors",
                  modoConversacion ? "bg-primary" : "bg-muted-foreground/30",
                )}
              >
                <span
                  className={cn(
                    "absolute size-4 rounded-full bg-background shadow transition-transform motion-reduce:transition-none",
                    modoConversacion ? "translate-x-4" : "translate-x-0.5",
                  )}
                />
              </span>
            </button>

            {/* Estado conversacional accesible mientras está activo. */}
            {modoConversacion && (
              <div
                className="flex items-center gap-2"
                aria-live="assertive"
                role="status"
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "inline-block size-2 rounded-full",
                    estadoAvatar === "hablando" && "bg-primary",
                    estadoAvatar === "escuchando" &&
                      "bg-emerald-500 motion-safe:animate-pulse",
                    estadoAvatar === "pensando" &&
                      "bg-navy motion-safe:animate-pulse",
                    estadoAvatar === "inactivo" && "bg-muted-foreground/40",
                  )}
                />
                <span className="text-xs font-medium text-foreground">
                  {statusConversacion}
                </span>
                {/* Barge-in: cortar a Amparo mientras habla y escuchar. */}
                {estadoAvatar === "hablando" &&
                  faseAdmiteInput(estado.fase) && (
                    <button
                      type="button"
                      onClick={interrumpir}
                      className="ml-1 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <Square className="size-3" aria-hidden="true" />
                      {lang === "en" ? "Interrupt" : "Interrumpir"}
                    </button>
                  )}
              </div>
            )}

            {/* Guía corta del modo cuando está apagado. */}
            {!modoConversacion && (
              <p className="max-w-xs text-center text-xs text-muted-foreground">
                {c.toggleHint}
              </p>
            )}
          </div>
        )}

        {/* Aviso de degradación de voz (permiso/soporte/reintento). */}
        {avisoVoz && (
          <p
            className="max-w-sm text-center text-xs text-muted-foreground"
            role="status"
            aria-live="polite"
          >
            {avisoVoz}
          </p>
        )}
      </div>

      {/* Hilo de conversación */}
      <div
        ref={hiloRef}
        className="flex max-h-[46vh] w-full flex-col gap-3 overflow-y-auto rounded-2xl border bg-card/60 p-4"
        aria-live="polite"
        aria-label={t("thread.label")}
      >
        {estado.mensajes.length === 0 && (
          <p className="py-6 text-center text-sm text-muted-foreground">
            {t("thread.aboutToGreet")}
          </p>
        )}
        {estado.mensajes.map((m) => (
          <Burbuja key={m.id} mensaje={m} t={t} />
        ))}

        {/* Indicador de "pensando" mientras se llaman las APIs */}
        {(estado.fase === "estructurando" ||
          estado.fase === "triando" ||
          estado.fase === "prediciendo") && (
          <div className="flex items-center gap-2 self-start rounded-2xl rounded-bl-sm bg-muted px-4 py-2.5 text-sm text-muted-foreground">
            <span className="flex gap-1">
              <Punto /> <Punto delay="0.15s" /> <Punto delay="0.3s" />
            </span>
            <span className="sr-only">{t("avatar.processing")}</span>
          </div>
        )}
      </div>

      {/* CTA de cierre */}
      {estado.fase === "cierre" && (
        <div className="flex w-full flex-col gap-3 rounded-2xl border border-primary/30 bg-primary/5 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-medium text-navy">
            {t("closing.question")}
          </p>
          <a
            href="/demandante"
            className={cn(
              buttonVariants({ size: "lg" }),
              "h-12 gap-2 text-base",
            )}
          >
            <FileText className="size-5" aria-hidden="true" />
            {t("closing.cta")}
            <ArrowRight className="size-5" aria-hidden="true" />
          </a>
        </div>
      )}

      {/* Un solo input activo */}
      {estado.fase !== "cierre" && (
        <div className="w-full">
          <div className="flex items-end gap-2 rounded-2xl border bg-card p-2 shadow-sm focus-within:ring-2 focus-within:ring-ring">
            <Textarea
              value={borrador}
              onChange={(e) => setBorrador(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void enviar();
                }
              }}
              disabled={!puedeEscribir}
              placeholder={placeholder}
              rows={2}
              aria-label={t("input.ariaInput")}
              className="min-h-[3rem] resize-none border-0 bg-transparent text-base shadow-none focus-visible:ring-0"
            />
            {dictado.soportado && (
              <Button
                type="button"
                size="icon-lg"
                variant={dictado.escuchando ? "default" : "outline"}
                onClick={onMicro}
                disabled={ocupado && !dictado.escuchando}
                aria-pressed={dictado.escuchando}
                aria-label={
                  dictado.escuchando
                    ? t("input.ariaMicStop")
                    : t("input.ariaMicStart")
                }
                className="size-12 shrink-0 rounded-xl"
              >
                {dictado.escuchando ? (
                  <Square className="size-5" aria-hidden="true" />
                ) : (
                  <Mic className="size-5" aria-hidden="true" />
                )}
              </Button>
            )}
            <Button
              type="button"
              size="icon-lg"
              onClick={() => void enviar()}
              disabled={!puedeEscribir || !borrador.trim()}
              aria-label={t("input.ariaSend")}
              className="size-12 shrink-0 rounded-xl"
            >
              <Send className="size-5" aria-hidden="true" />
            </Button>
          </div>

          <div className="mt-2 flex items-center justify-between px-1">
            <button
              type="button"
              onClick={repetir}
              disabled={estado.mensajes.every((m) => m.autor !== "amparo")}
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
            >
              <Volume2 className="size-3.5" aria-hidden="true" />
              {t("input.repeat")}
            </button>
            {dictado.transcribiendo ? (
              <span className="text-xs font-medium text-muted-foreground">
                {c.stTranscribiendo}
              </span>
            ) : dictado.escuchando ? (
              <span className="text-xs font-medium text-success">
                {t("input.listeningHint")}
              </span>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}

// --- Subcomponentes ----------------------------------------------------------

function Burbuja({
  mensaje,
  t,
}: {
  mensaje: Mensaje;
  t: ReturnType<typeof useT>;
}) {
  const esAmparo = mensaje.autor === "amparo";
  return (
    <div
      className={cn(
        "flex w-full",
        esAmparo ? "justify-start" : "justify-end",
      )}
    >
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-4 py-2.5 text-base leading-relaxed",
          esAmparo
            ? "rounded-bl-sm bg-muted text-foreground"
            : "rounded-br-sm bg-primary text-primary-foreground",
        )}
      >
        {!esAmparo && <span className="sr-only">{t("thread.youSaid")}</span>}
        {esAmparo && <span className="sr-only">{t("thread.amparoSaid")}</span>}
        {mensaje.texto}
      </div>
    </div>
  );
}

function Punto({ delay = "0s" }: { delay?: string }) {
  return (
    <>
      <span
        className="inline-block size-1.5 rounded-full bg-current motion-safe:animate-bounce"
        style={{ animationDelay: delay }}
      />
    </>
  );
}
