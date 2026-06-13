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
  Send,
  Sparkles,
  Square,
  Volume2,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
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
  SALUDO,
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

// --- Componente --------------------------------------------------------------

export function AsistenteAmparo() {
  const [estado, dispatch] = useReducer(reducer, ESTADO_INICIAL);
  const [borrador, setBorrador] = useState("");
  const [hablando, setHablando] = useState(false);

  const avatarRef = useRef<AvatarAmparoHandle>(null);
  const hiloRef = useRef<HTMLDivElement>(null);
  const iniciadoRef = useRef(false);
  const dictado = useDictadoAsistente();

  // Hace que Amparo diga algo (voz + burbuja de texto) y espera a que termine.
  const amparoDice = useCallback(async (texto: string) => {
    dispatch({ tipo: "decirAmparo", texto });
    try {
      await avatarRef.current?.decir(texto);
    } catch {
      /* la voz nunca debe romper el flujo */
    }
  }, []);

  // Saludo inicial automático (una sola vez).
  useEffect(() => {
    if (iniciadoRef.current) return;
    iniciadoRef.current = true;
    const t = window.setTimeout(() => {
      void (async () => {
        await amparoDice(SALUDO);
        dispatch({ tipo: "fase", fase: "relato" });
      })();
    }, 400);
    return () => window.clearTimeout(t);
  }, [amparoDice]);

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
      : estado.fase === "estructurando" ||
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
        body: JSON.stringify({ relato }),
      });
      if (!res.ok) return null;
      return (await res.json()) as EstructuracionOutput;
    },
    [],
  );

  const llamarTriaje = useCallback(
    async (datos: EstructuracionOutput): Promise<TriajeResultado | null> => {
      const caso = construirCaso(datos);
      const res = await fetch("/api/triaje", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caso }),
      });
      if (!res.ok) return null;
      return (await res.json()) as TriajeResultado;
    },
    [],
  );

  const llamarPredecir = useCallback(
    async (
      datos: EstructuracionOutput,
    ): Promise<PrediccionResultado | null> => {
      const caso = construirCaso(datos);
      const res = await fetch("/api/predecir", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caso }),
      });
      if (!res.ok) return null;
      return (await res.json()) as PrediccionResultado;
    },
    [],
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
          mensaje: "No pude evaluar tu caso en este momento.",
        });
        await amparoDice(
          "Tuve un problema evaluando tu caso. Intentémoslo de nuevo en un momento.",
        );
        return;
      }
      dispatch({ tipo: "triaje", triaje });
      dispatch({ tipo: "fase", fase: "triaje" });
      await amparoDice(fraseVeredicto(triaje));

      // Predicción
      dispatch({ tipo: "fase", fase: "prediciendo" });
      const prediccion = await llamarPredecir(datos);
      if (prediccion) {
        dispatch({ tipo: "prediccion", prediccion });
        dispatch({ tipo: "fase", fase: "prediccion" });
        await amparoDice(frasePrediccion(prediccion));
      }

      // Cierre
      dispatch({ tipo: "fase", fase: "cierre" });
      await amparoDice(
        "Eso es todo lo que necesitaba por ahora. Cuando quieras, seguimos con tu expediente completo para preparar tu tutela.",
      );
    },
    [amparoDice, llamarPredecir, llamarTriaje],
  );

  /** Hace la pregunta de confirmación del paso actual (o pasa al análisis). */
  const preguntarSiguienteConfirmacion = useCallback(
    async (paso: number, datos: EstructuracionOutput) => {
      if (paso >= PASOS_CONFIRMACION.length) {
        await amparoDice("Perfecto, ya tengo lo esencial. Déjame revisarlo.");
        await correrAnalisis(datos);
        return;
      }
      dispatch({ tipo: "fase", fase: "confirmar" });
      await amparoDice(
        fraseConfirmacion(PASOS_CONFIRMACION[paso].campo, datos),
      );
    },
    [amparoDice, correrAnalisis],
  );

  /** Procesa el primer relato del usuario. */
  const procesarRelato = useCallback(
    async (relato: string) => {
      dispatch({ tipo: "fase", fase: "estructurando" });
      await amparoDice("Gracias por contarme. Dame un momento, lo organizo.");
      const out = await llamarEstructurar(relato);
      if (!out) {
        dispatch({
          tipo: "error",
          mensaje: "No pude organizar tu relato.",
        });
        await amparoDice(
          "No logré organizar tu relato. ¿Puedes contármelo de otra forma?",
        );
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
    [amparoDice, llamarEstructurar, preguntarSiguienteConfirmacion],
  );

  /** Maneja la respuesta del usuario en la fase de confirmación. */
  const procesarConfirmacion = useCallback(
    async (texto: string) => {
      const paso = estado.pasoConfirmacion;
      const { campo } = PASOS_CONFIRMACION[paso];
      const limpio = texto.trim();
      const afirmativo =
        /^(s[ií]|correcto|exacto|así es|asi es|claro|ok|vale|de acuerdo|perfecto|listo)\b/i.test(
          limpio,
        );
      const negativo = /^(no|incorrecto|está mal|esta mal|para nada)\b/i.test(
        limpio,
      );

      let datosActuales = estado.datos;

      if (negativo) {
        // Pide la corrección explícita y se queda en el mismo paso.
        await amparoDice(
          `Sin problema. Dime entonces cuál es ${PASOS_CONFIRMACION[paso].etiqueta}.`,
        );
        return;
      }

      if (!afirmativo && limpio) {
        // El usuario dio un valor nuevo/corregido directamente.
        dispatch({ tipo: "patchDato", campo, valor: limpio });
        datosActuales = { ...estado.datos, [campo]: limpio };
        await amparoDice("Listo, lo anoté así.");
      }

      dispatch({ tipo: "avanzarConfirmacion" });
      await preguntarSiguienteConfirmacion(paso + 1, datosActuales);
    },
    [
      amparoDice,
      estado.datos,
      estado.pasoConfirmacion,
      preguntarSiguienteConfirmacion,
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

  const enviar = useCallback(async () => {
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
    dictado,
    estado.fase,
    ocupado,
    procesarConfirmacion,
    procesarRelato,
  ]);

  const onMicro = useCallback(() => {
    if (dictado.escuchando) {
      dictado.detener();
      return;
    }
    avatarRef.current?.detener();
    dictado.iniciar((t) => setBorrador((prev) => (prev ? `${prev} ${t}` : t)));
  }, [dictado]);

  const repetir = useCallback(() => {
    const ultima = [...estado.mensajes]
      .reverse()
      .find((m) => m.autor === "amparo");
    if (ultima) void avatarRef.current?.decir(ultima.texto);
  }, [estado.mensajes]);

  const placeholder =
    estado.fase === "confirmar"
      ? "Responde sí, o escribe la corrección…"
      : "Escribe aquí lo que te pasó… (o usa el micrófono)";

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-6">
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
            Amparo
          </Badge>
          <span className="text-sm text-muted-foreground">
            {estadoAvatar === "hablando"
              ? "está hablando…"
              : estadoAvatar === "pensando"
                ? "está pensando…"
                : estadoAvatar === "escuchando"
                  ? "te está escuchando…"
                  : "tu asistente de salud"}
          </span>
        </div>
      </div>

      {/* Hilo de conversación */}
      <div
        ref={hiloRef}
        className="flex max-h-[46vh] w-full flex-col gap-3 overflow-y-auto rounded-2xl border bg-card/60 p-4"
        aria-live="polite"
        aria-label="Conversación con Amparo"
      >
        {estado.mensajes.length === 0 && (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Amparo está a punto de saludarte…
          </p>
        )}
        {estado.mensajes.map((m) => (
          <Burbuja key={m.id} mensaje={m} />
        ))}

        {/* Indicador de "pensando" mientras se llaman las APIs */}
        {(estado.fase === "estructurando" ||
          estado.fase === "triando" ||
          estado.fase === "prediciendo") && (
          <div className="flex items-center gap-2 self-start rounded-2xl rounded-bl-sm bg-muted px-4 py-2.5 text-sm text-muted-foreground">
            <span className="flex gap-1">
              <Punto /> <Punto delay="0.15s" /> <Punto delay="0.3s" />
            </span>
            <span className="sr-only">Amparo está procesando</span>
          </div>
        )}
      </div>

      {/* CTA de cierre */}
      {estado.fase === "cierre" && (
        <div className="flex w-full flex-col gap-3 rounded-2xl border border-primary/30 bg-primary/5 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-medium text-navy">
            ¿Listo para preparar tu tutela con todo el detalle?
          </p>
          <a
            href="/demandante"
            className={cn(
              buttonVariants({ size: "lg" }),
              "h-12 gap-2 text-base",
            )}
          >
            <FileText className="size-5" aria-hidden="true" />
            Continuar a mi expediente
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
              aria-label="Tu respuesta para Amparo"
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
                  dictado.escuchando ? "Detener micrófono" : "Hablar por micrófono"
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
              aria-label="Enviar respuesta"
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
              Repetir lo último que dijo Amparo
            </button>
            {dictado.escuchando && (
              <span className="text-xs font-medium text-success">
                Escuchando… habla con tranquilidad
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// --- Subcomponentes ----------------------------------------------------------

function Burbuja({ mensaje }: { mensaje: Mensaje }) {
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
        {!esAmparo && <span className="sr-only">Tú dijiste: </span>}
        {esAmparo && <span className="sr-only">Amparo dijo: </span>}
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
