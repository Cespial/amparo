"use client";

import { useState } from "react";
import { Brain, Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BotonVoz } from "@/components/boton-voz";
import type { RolUsuario } from "@/lib/types";
import { useT } from "@/lib/i18n";

interface Mensaje {
  id: string;
  rol: "usuario" | "copiloto";
  texto: string;
}

const ROL_KEY: Record<RolUsuario, string> = {
  atlas: "role.atlas",
  demandante: "role.demandante",
  demandado: "role.demandado",
  juez: "role.juez",
};

export interface SegundoCerebroProps {
  /** Rol del usuario que conversa con el copiloto. */
  rol: RolUsuario;
  /** Id del caso en contexto (opcional). */
  casoId?: string;
  /** Título personalizado del panel. */
  titulo?: string;
}

/**
 * Panel del copiloto IA reusable ("segundo cerebro").
 * Stub de fundación: llama a /api/copiloto (501 por ahora) y degrada con gracia.
 */
export function SegundoCerebro({ rol, casoId, titulo }: SegundoCerebroProps) {
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [input, setInput] = useState("");
  const [cargando, setCargando] = useState(false);
  const t = useT("common");

  async function enviar() {
    const pregunta = input.trim();
    if (!pregunta || cargando) return;
    const userMsg: Mensaje = {
      id: crypto.randomUUID(),
      rol: "usuario",
      texto: pregunta,
    };
    setMensajes((m) => [...m, userMsg]);
    setInput("");
    setCargando(true);

    try {
      const res = await fetch("/api/copiloto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rol, casoId, pregunta }),
      });

      if (res.ok && res.body) {
        // /api/copiloto devuelve un text-stream (toTextStreamResponse).
        // Lo consumimos token a token y vamos pintando la respuesta.
        const respId = crypto.randomUUID();
        setMensajes((m) => [...m, { id: respId, rol: "copiloto", texto: "" }]);
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let acumulado = "";
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          acumulado += decoder.decode(value, { stream: true });
          setMensajes((m) =>
            m.map((msg) =>
              msg.id === respId ? { ...msg, texto: acumulado } : msg,
            ),
          );
        }
        if (!acumulado.trim()) {
          setMensajes((m) =>
            m.map((msg) =>
              msg.id === respId
                ? {
                    ...msg,
                    texto: t("copilot.emptyResponse"),
                  }
                : msg,
            ),
          );
        }
      } else {
        setMensajes((m) => [
          ...m,
          {
            id: crypto.randomUUID(),
            rol: "copiloto",
            texto: t("copilot.unavailable"),
          },
        ]);
      }
    } catch {
      setMensajes((m) => [
        ...m,
        {
          id: crypto.randomUUID(),
          rol: "copiloto",
          texto: t("copilot.error"),
        },
      ]);
    } finally {
      setCargando(false);
    }
  }

  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Brain className="size-4" />
          </span>
          {titulo ?? t("copilot.title")}
          <Badge variant="secondary" className="ml-auto font-normal">
            {t(ROL_KEY[rol])}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-3">
        <ScrollArea className="h-64 flex-1 rounded-lg border bg-muted/30 p-3">
          {mensajes.length === 0 ? (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="size-4" />
              {t("copilot.empty")}
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {mensajes.map((m) =>
                m.rol === "usuario" ? (
                  <div
                    key={m.id}
                    className="ml-auto max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-3 py-2 text-sm text-primary-foreground"
                  >
                    {m.texto}
                  </div>
                ) : (
                  <div key={m.id} className="mr-auto max-w-[85%]">
                    <div className="rounded-2xl rounded-bl-sm bg-card px-3 py-2 text-sm shadow-sm">
                      {m.texto}
                    </div>
                    {m.texto.trim() && (
                      <BotonVoz
                        texto={m.texto}
                        size="sm"
                        conTexto={false}
                        className="mt-1 text-muted-foreground"
                      />
                    )}
                  </div>
                ),
              )}
            </div>
          )}
        </ScrollArea>
        <div className="flex items-end gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void enviar();
              }
            }}
            placeholder={t("copilot.placeholder")}
            className="min-h-11 resize-none bg-card"
            rows={1}
          />
          <Button
            onClick={() => void enviar()}
            disabled={cargando || !input.trim()}
            size="icon"
            aria-label={t("copilot.send")}
          >
            <Send className="size-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
