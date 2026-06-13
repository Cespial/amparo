"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { Volume2, Square } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { hablar, detenerVoz, vozSoportada } from "@/lib/voz";
import { useT } from "@/lib/i18n";

// El soporte de voz no cambia en runtime: suscripción no-op, SSR -> false.
const noop = () => () => {};

export interface BotonVozProps {
  /** Texto que Amparo leerá en voz alta. */
  texto: string;
  /** Etiqueta accesible alternativa (por defecto, "Escuchar"/"Detener"). */
  etiqueta?: string;
  /** Variante visual del botón (coherente con shadcn/tema). */
  variant?: "ghost" | "outline" | "secondary" | "default";
  size?: "sm" | "default" | "icon" | "icon-sm";
  /** Muestra texto junto al ícono (true) o solo el ícono (false). */
  conTexto?: boolean;
  className?: string;
}

/**
 * Botón reutilizable "Escuchar / Detener" que lee `texto` con la voz de Amparo
 * (ElevenLabs con fallback a la voz del navegador). Accesible y degrada con
 * gracia: si no hay forma de reproducir voz, no se renderiza.
 */
export function BotonVoz({
  texto,
  etiqueta,
  variant = "ghost",
  size = "sm",
  conTexto = true,
  className,
}: BotonVozProps) {
  const [hablando, setHablando] = useState(false);
  const idRef = useRef(0);
  const t = useT("common");

  // vozSoportada() depende de window → useSyncExternalStore es SSR-safe (server -> false).
  const soportada = useSyncExternalStore(noop, vozSoportada, () => false);

  // Al desmontar, corta cualquier reproducción nuestra.
  useEffect(() => {
    return () => {
      if (hablando) detenerVoz();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const alternar = useCallback(async () => {
    if (hablando) {
      detenerVoz();
      setHablando(false);
      return;
    }
    const limpio = (texto ?? "").trim();
    if (!limpio) return;

    const id = ++idRef.current;
    setHablando(true);
    try {
      await hablar(limpio);
    } finally {
      // Si nadie inició otra lectura entretanto, restablece el estado.
      if (idRef.current === id) setHablando(false);
    }
  }, [hablando, texto]);

  if (!soportada) return null;

  const aria =
    etiqueta ?? (hablando ? t("voice.stopAria") : t("voice.listenAria"));

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={() => void alternar()}
      aria-label={aria}
      aria-pressed={hablando}
      title={aria}
      className={cn("gap-1.5", className)}
      disabled={!texto.trim()}
    >
      {hablando ? (
        <>
          <Square className="size-4" aria-hidden />
          {conTexto && t("voice.stop")}
        </>
      ) : (
        <>
          <Volume2 className="size-4" aria-hidden />
          {conTexto && t("voice.listen")}
        </>
      )}
    </Button>
  );
}
