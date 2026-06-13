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
import type { RolUsuario } from "@/lib/types";

interface Mensaje {
  id: string;
  rol: "usuario" | "copiloto";
  texto: string;
}

const ETIQUETA_ROL: Record<RolUsuario, string> = {
  atlas: "Atlas",
  demandante: "Demandante",
  demandado: "Demandado",
  juez: "Juez",
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
                    texto:
                      "El copiloto no devolvió contenido. Intenta reformular tu pregunta.",
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
            texto:
              "El copiloto aún no está disponible (módulo de IA en construcción). " +
              "Pronto podré ayudarte con tu caso.",
          },
        ]);
      }
    } catch {
      setMensajes((m) => [
        ...m,
        {
          id: crypto.randomUUID(),
          rol: "copiloto",
          texto: "No se pudo contactar al copiloto. Intenta de nuevo.",
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
          {titulo ?? "Segundo cerebro"}
          <Badge variant="secondary" className="ml-auto font-normal">
            {ETIQUETA_ROL[rol]}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-3">
        <ScrollArea className="h-64 flex-1 rounded-lg border bg-muted/30 p-3">
          {mensajes.length === 0 ? (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="size-4" />
              Pregúntame sobre tu caso, plazos o precedentes aplicables.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {mensajes.map((m) => (
                <div
                  key={m.id}
                  className={
                    m.rol === "usuario"
                      ? "ml-auto max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-3 py-2 text-sm text-primary-foreground"
                      : "mr-auto max-w-[85%] rounded-2xl rounded-bl-sm bg-card px-3 py-2 text-sm shadow-sm"
                  }
                >
                  {m.texto}
                </div>
              ))}
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
            placeholder="Escribe tu pregunta…"
            className="min-h-11 resize-none bg-card"
            rows={1}
          />
          <Button
            onClick={() => void enviar()}
            disabled={cargando || !input.trim()}
            size="icon"
            aria-label="Enviar"
          >
            <Send className="size-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
