// components/juez/juez-markdown.tsx — Render Markdown ligero sin dependencias.
// Soporta encabezados, listas, negritas, itálicas y párrafos. Suficiente para
// los escritos jurídicos generados por la IA (fallo, tutela).

import { Fragment } from "react";

function inline(text: string, keyBase: string): React.ReactNode[] {
  // **bold**, *italic*, `code`
  const tokens = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);
  return tokens.map((t, i) => {
    const key = `${keyBase}-${i}`;
    if (/^\*\*[^*]+\*\*$/.test(t)) {
      return (
        <strong key={key} className="font-semibold text-navy">
          {t.slice(2, -2)}
        </strong>
      );
    }
    if (/^\*[^*]+\*$/.test(t)) {
      return (
        <em key={key} className="text-muted-foreground">
          {t.slice(1, -1)}
        </em>
      );
    }
    if (/^`[^`]+`$/.test(t)) {
      return (
        <code
          key={key}
          className="rounded bg-muted px-1 py-0.5 font-mono text-[0.85em]"
        >
          {t.slice(1, -1)}
        </code>
      );
    }
    return <Fragment key={key}>{t}</Fragment>;
  });
}

export function Markdown({ children }: { children: string }) {
  const lines = children.replace(/\r\n/g, "\n").split("\n");
  const out: React.ReactNode[] = [];
  let listBuffer: string[] = [];

  function flushList(key: string) {
    if (listBuffer.length === 0) return;
    out.push(
      <ul key={key} className="my-2 ml-5 list-disc space-y-1 text-sm">
        {listBuffer.map((item, i) => (
          <li key={`${key}-${i}`}>{inline(item, `${key}-${i}`)}</li>
        ))}
      </ul>,
    );
    listBuffer = [];
  }

  lines.forEach((raw, idx) => {
    const line = raw.trimEnd();
    const key = `l-${idx}`;

    const li = line.match(/^\s*[-*]\s+(.*)$/);
    if (li) {
      listBuffer.push(li[1]);
      return;
    }
    flushList(`ul-${idx}`);

    if (line.trim() === "") return;

    const h = line.match(/^(#{1,6})\s+(.*)$/);
    if (h) {
      const level = h[1].length;
      const cls =
        level <= 1
          ? "font-heading text-lg font-bold text-navy mt-4 mb-1"
          : level === 2
            ? "font-heading text-base font-bold text-navy mt-4 mb-1"
            : "font-semibold text-sm text-foreground mt-3 mb-1";
      out.push(
        <p key={key} className={cls}>
          {inline(h[2], key)}
        </p>,
      );
      return;
    }

    out.push(
      <p key={key} className="my-1.5 text-sm leading-relaxed">
        {inline(line, key)}
      </p>,
    );
  });
  flushList("ul-end");

  return <div className="text-foreground">{out}</div>;
}
