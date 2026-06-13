"use client";

// components/landing/reveal.tsx — Piezas de presentación LOCALES de la landing.
//
//  <Reveal>      — entrada escalonada (fade + translate) al entrar en viewport,
//                  con animation-delay para orquestar una sola cascada elegante.
//  <CountUpStat> — cifra grande con count-up (Geist Mono tabular) + unidad + nota.
//
// Todo respeta prefers-reduced-motion (vía landing-anim.module.css: sin motion,
// el contenido aparece estable). No contiene lógica de negocio; solo presentación.

import {
  useEffect,
  useRef,
  useState,
  type ElementType,
  type ReactNode,
} from "react";
import { useCountUp } from "./use-count-up";
import styles from "./landing-anim.module.css";

/* ──────────────────────────────────────────────────────────────────────────
   <Reveal>: revela su contenido al entrar en viewport con un retraso opcional.
   `as` permite usar li/section/div sin romper la semántica del contenedor.
   ────────────────────────────────────────────────────────────────────────── */
interface RevealProps {
  children: ReactNode;
  /** Retraso de la entrada en ms (para escalonar). */
  delay?: number;
  /** Elemento a renderizar (por defecto div). */
  as?: ElementType;
  className?: string;
}

export function Reveal({
  children,
  delay = 0,
  as: Tag = "div",
  className = "",
}: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setShown(true);
            observer.disconnect();
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const cls = [styles.reveal, shown ? styles.revealIn : "", className]
    .filter(Boolean)
    .join(" ");

  return (
    <Tag
      ref={ref}
      className={cls}
      style={{ "--reveal-delay": `${delay}ms` } as React.CSSProperties}
    >
      {children}
    </Tag>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   <CountUpStat>: una fila de la tarjeta de cifras del hero. La cifra se anima
   0 → valor (Geist Mono tabular para que no "salte" el ancho al contar).
   ────────────────────────────────────────────────────────────────────────── */
interface CountUpStatProps {
  figure: string;
  unit: string;
  note: string;
  /** Retraso del conteo en ms (escalona varias cifras del hero). */
  delay?: number;
}

export function CountUpStat({ figure, unit, note, delay = 0 }: CountUpStatProps) {
  const { ref, display } = useCountUp(figure, { delayMs: delay });

  return (
    <div className="border-b border-white/10 pb-5 last:border-0 last:pb-0">
      <div className="flex items-baseline gap-2">
        <span
          ref={ref as React.RefObject<HTMLSpanElement>}
          className="font-mono text-3xl font-semibold tabular-nums tracking-tight text-white sm:text-4xl"
        >
          {display}
        </span>
        <span className="text-sm font-medium text-white/70">{unit}</span>
      </div>
      <p className="mt-1 text-sm text-white/60">{note}</p>
    </div>
  );
}
