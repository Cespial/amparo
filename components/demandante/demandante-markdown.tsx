"use client";

import { Fragment } from "react";

/**
 * Renderizador Markdown minimalista (sin dependencias) para los escritos
 * jurídicos generados por la IA. Soporta encabezados (#..####), listas,
 * negritas **...**, itálicas *...*, citas > y separadores ---.
 * Suficiente para los documentos del generador de Amparo.
 */
function renderInline(text: string, keyBase: string) {
  // Negrita **...** y luego itálica *...*
  const parts: React.ReactNode[] = [];
  const regex = /\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = regex.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    if (m[1] !== undefined) {
      parts.push(
        <strong key={`${keyBase}-b-${i}`} className="font-semibold text-foreground">
          {m[1]}
        </strong>,
      );
    } else if (m[2] !== undefined) {
      parts.push(
        <em key={`${keyBase}-i-${i}`} className="italic">
          {m[2]}
        </em>,
      );
    } else if (m[3] !== undefined) {
      parts.push(
        <code
          key={`${keyBase}-c-${i}`}
          className="rounded bg-muted px-1 py-0.5 font-mono text-[0.85em]"
        >
          {m[3]}
        </code>,
      );
    }
    last = regex.lastIndex;
    i++;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

export function DemandanteMarkdown({ source }: { source: string }) {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const blocks: React.ReactNode[] = [];
  let listBuffer: string[] = [];
  let key = 0;

  const flushList = () => {
    if (listBuffer.length === 0) return;
    const items = [...listBuffer];
    listBuffer = [];
    blocks.push(
      <ul
        key={`ul-${key++}`}
        className="my-2 list-disc space-y-1 pl-5 text-[0.95rem] leading-relaxed"
      >
        {items.map((it, idx) => (
          <li key={idx}>{renderInline(it, `li-${key}-${idx}`)}</li>
        ))}
      </ul>,
    );
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (/^\s*[-*]\s+/.test(line)) {
      listBuffer.push(line.replace(/^\s*[-*]\s+/, ""));
      continue;
    }
    flushList();
    if (line.trim() === "") {
      continue;
    }
    if (/^---+$/.test(line.trim())) {
      blocks.push(<hr key={`hr-${key++}`} className="my-4 border-border" />);
      continue;
    }
    const h = /^(#{1,6})\s+(.*)$/.exec(line);
    if (h) {
      const level = h[1].length;
      const content = renderInline(h[2], `h-${key}`);
      const cls =
        level <= 1
          ? "mt-5 mb-2 font-serif text-xl font-bold text-navy"
          : level === 2
            ? "mt-4 mb-2 font-serif text-lg font-semibold text-navy"
            : "mt-3 mb-1 text-base font-semibold text-foreground";
      blocks.push(
        <p key={`h-${key++}`} className={cls}>
          {content}
        </p>,
      );
      continue;
    }
    if (/^>\s?/.test(line)) {
      blocks.push(
        <blockquote
          key={`q-${key++}`}
          className="my-2 border-l-2 border-primary/40 pl-3 text-[0.95rem] italic text-muted-foreground"
        >
          {renderInline(line.replace(/^>\s?/, ""), `q-${key}`)}
        </blockquote>,
      );
      continue;
    }
    blocks.push(
      <p key={`p-${key++}`} className="my-2 text-[0.95rem] leading-relaxed">
        {renderInline(line, `p-${key}`)}
      </p>,
    );
  }
  flushList();

  return <Fragment>{blocks}</Fragment>;
}
