"use client";

// components/mediacion/sala-mediacion-dialog.tsx
// Diálogo que aloja la Sala de mediación para un caso concreto. Llama a
// POST /api/mediar, gestiona la aceptación de cada parte y, cuando ambas
// aceptan, notifica la resolución por consenso al contenedor (descongestión).
//
// El cuerpo se monta con `key={caso.id}` (ver SalaMediacionContenido) para que
// el estado de la sala se reinicie limpiamente al cambiar de caso, sin reset
// vía efectos. La propuesta se solicita una sola vez al montar.

import { useCallback, useEffect, useRef, useState } from "react";

import type { Caso, Mediacion } from "@/lib/types";
import { useLang, useT } from "@/lib/i18n";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SalaMediacion } from "./sala-mediacion";

export interface SalaMediacionDialogProps {
  /** Caso a mediar (null = sin caso seleccionado). */
  caso: Caso | null;
  /** ¿Está abierto el diálogo? */
  abierto: boolean;
  /** Cierra el diálogo. */
  onCerrar: () => void;
  /**
   * Se invoca cuando AMBAS partes aceptan el consenso: el contenedor resuelve el
   * caso por acuerdo (RESUELTO_EPS) y suma a la descongestión.
   */
  onAcuerdo?: (caso: Caso, mediacion: Mediacion) => void;
}

export function SalaMediacionDialog({
  caso,
  abierto,
  onCerrar,
  onAcuerdo,
}: SalaMediacionDialogProps) {
  const t = useT("mediacion");

  return (
    <Dialog
      open={abierto}
      onOpenChange={(o) => {
        if (!o) onCerrar();
      }}
    >
      <DialogContent className="max-h-[92vh] gap-0 overflow-hidden p-0 sm:max-w-3xl">
        <DialogHeader className="border-b bg-card p-5">
          <DialogTitle className="text-left">{t("room.title")}</DialogTitle>
          <DialogDescription className="text-left">
            {caso
              ? `${caso.demandante.nombre} · ${caso.demandado.nombre}`
              : t("room.subtitle")}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[78vh]">
          <div className="p-5">
            {/* key por caso: reinicia el estado de la sala sin efectos de reset. */}
            {abierto && caso && (
              <SalaMediacionContenido
                key={caso.id}
                caso={caso}
                onAcuerdo={onAcuerdo}
              />
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Cuerpo de la sala con su propio ciclo de vida. Se monta por caso (key) y pide
 * la propuesta una vez. Gestiona la aceptación de cada parte y, al aceptar ambas,
 * notifica el acuerdo de consenso.
 *
 * Exportado para reusarse incrustado (panel inline en la vista de aterrizaje),
 * no solo dentro del diálogo. Montar siempre con `key={caso.id}`.
 */
export function SalaMediacionContenido({
  caso,
  onAcuerdo,
}: {
  caso: Caso;
  onAcuerdo?: (caso: Caso, mediacion: Mediacion) => void;
}) {
  const t = useT("mediacion");
  const { lang } = useLang();

  const [mediacion, setMediacion] = useState<Mediacion | null>(null);
  const [generando, setGenerando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Evita disparar onAcuerdo más de una vez por sesión de mediación.
  const acuerdoNotificado = useRef(false);
  // Garantiza una sola solicitud automática al montar.
  const solicitado = useRef(false);

  const generar = useCallback(async () => {
    acuerdoNotificado.current = false;
    // Cede un tick antes del primer setState: cuando generar() se invoca desde un
    // efecto de montaje, todo cambio de estado ocurre fuera del cuerpo síncrono.
    await Promise.resolve();
    setGenerando(true);
    setError(null);
    try {
      const res = await fetch("/api/mediar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ casoId: caso.id, lang }),
      });
      if (!res.ok) throw new Error(String(res.status));
      const data = (await res.json()) as Mediacion;
      setMediacion({
        ...data,
        aceptadoDemandante: false,
        aceptadoEPS: false,
        estado: "propuesta",
      });
    } catch {
      setError(t("room.error"));
    } finally {
      setGenerando(false);
    }
  }, [caso.id, lang, t]);

  // Solicita la propuesta una sola vez al montar (deferido: todo setState ocurre
  // tras el primer await, fuera del cuerpo síncrono del efecto).
  useEffect(() => {
    if (solicitado.current) return;
    solicitado.current = true;
    void generar();
  }, [generar]);

  const aceptar = useCallback(
    (parte: "demandante" | "eps") => {
      setMediacion((prev) => {
        if (!prev) return prev;
        const siguiente: Mediacion = {
          ...prev,
          aceptadoDemandante:
            parte === "demandante" ? true : prev.aceptadoDemandante,
          aceptadoEPS: parte === "eps" ? true : prev.aceptadoEPS,
        };
        const ambos =
          Boolean(siguiente.aceptadoDemandante) &&
          Boolean(siguiente.aceptadoEPS);
        siguiente.estado = ambos ? "aceptada" : "propuesta";
        if (ambos && !acuerdoNotificado.current) {
          acuerdoNotificado.current = true;
          onAcuerdo?.(caso, siguiente);
        }
        return siguiente;
      });
    },
    [caso, onAcuerdo],
  );

  // Regenerar: descarta la propuesta actual y vuelve a solicitar.
  const regenerar = useCallback(() => {
    setMediacion(null);
    void generar();
  }, [generar]);

  return (
    <SalaMediacion
      mediacion={mediacion}
      generando={generando}
      error={error}
      pacienteNombre={caso.demandante.nombre}
      epsNombre={caso.demandado.nombre}
      onGenerar={regenerar}
      onAceptarDemandante={() => aceptar("demandante")}
      onAceptarEPS={() => aceptar("eps")}
      embebido
    />
  );
}
