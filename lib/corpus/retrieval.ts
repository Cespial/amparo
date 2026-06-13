// lib/corpus/retrieval.ts — Búsqueda léxica (TF-IDF + coseno) en memoria sobre el
// corpus de sentencias. Sin llamadas de red.

import corpus from "./sentencias.json";
import type { SentenciaRef } from "../types";

interface SentenciaRaw {
  id: string;
  titulo: string;
  anio: number;
  tema: string;
  subregla: string;
  extracto: string;
  derechos: string[];
}

const SENTENCIAS: SentenciaRaw[] = (corpus.sentencias ?? []) as SentenciaRaw[];

/** Stopwords en español (lista mínima para no penalizar términos vacíos). */
const STOPWORDS = new Set([
  "a", "al", "ante", "con", "como", "de", "del", "el", "en", "es", "la", "las",
  "lo", "los", "no", "o", "para", "por", "que", "se", "su", "sus", "un", "una",
  "unos", "unas", "y", "e", "u", "le", "les", "este", "esta", "estos", "estas",
  "ese", "esa", "the", "of", "and",
]);

/** Normaliza texto: minúsculas, sin tildes, sin signos. */
function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9ñ\s]/g, " ");
}

/** Tokeniza a términos significativos. */
function tokenizar(texto: string): string[] {
  return normalizar(texto)
    .split(/\s+/)
    .filter((t) => t.length > 2 && !STOPWORDS.has(t));
}

/** Texto indexable de una sentencia (campos ponderados por repetición). */
function textoSentencia(s: SentenciaRaw): string {
  return [
    s.titulo,
    s.titulo, // peso extra
    s.tema,
    s.subregla,
    s.subregla,
    s.extracto,
    (s.derechos ?? []).join(" "),
    s.id,
  ].join(" ");
}

// --- Construcción del índice TF-IDF (una sola vez por proceso) ---

const N = SENTENCIAS.length;
const docTokens: string[][] = SENTENCIAS.map((s) => tokenizar(textoSentencia(s)));

const df = new Map<string, number>();
for (const tokens of docTokens) {
  const unique = new Set(tokens);
  for (const t of unique) df.set(t, (df.get(t) ?? 0) + 1);
}

function idf(term: string): number {
  const d = df.get(term) ?? 0;
  // idf suavizado
  return Math.log((N + 1) / (d + 1)) + 1;
}

/** Vector TF-IDF (mapa término -> peso) a partir de tokens. */
function vectorTfidf(tokens: string[]): Map<string, number> {
  const tf = new Map<string, number>();
  for (const t of tokens) tf.set(t, (tf.get(t) ?? 0) + 1);
  const vec = new Map<string, number>();
  const total = tokens.length || 1;
  for (const [term, count] of tf) {
    vec.set(term, (count / total) * idf(term));
  }
  return vec;
}

const docVectors: Map<string, number>[] = docTokens.map(vectorTfidf);

function magnitud(vec: Map<string, number>): number {
  let s = 0;
  for (const v of vec.values()) s += v * v;
  return Math.sqrt(s);
}

const docMagnitudes: number[] = docVectors.map(magnitud);

function coseno(
  a: Map<string, number>,
  magA: number,
  b: Map<string, number>,
  magB: number,
): number {
  if (magA === 0 || magB === 0) return 0;
  let dot = 0;
  // itera el vector más corto
  const [shorter, longer] = a.size <= b.size ? [a, b] : [b, a];
  for (const [term, val] of shorter) {
    const other = longer.get(term);
    if (other !== undefined) dot += val * other;
  }
  return dot / (magA * magB);
}

/**
 * Busca las `k` sentencias más relevantes a la consulta por similitud léxica
 * (TF-IDF + coseno). Devuelve SentenciaRef con `score` (0-1).
 */
export function buscarSentencias(query: string, k = 4): SentenciaRef[] {
  const qTokens = tokenizar(query);
  if (qTokens.length === 0) {
    return SENTENCIAS.slice(0, k).map((s) => ({ ...s, score: 0 }));
  }
  const qVec = vectorTfidf(qTokens);
  const qMag = magnitud(qVec);

  const ranked = SENTENCIAS.map((s, i) => ({
    sentencia: s,
    score: coseno(qVec, qMag, docVectors[i], docMagnitudes[i]),
  }))
    .sort((a, b) => b.score - a.score)
    .slice(0, k);

  return ranked.map(({ sentencia, score }) => ({
    id: sentencia.id,
    titulo: sentencia.titulo,
    anio: sentencia.anio,
    tema: sentencia.tema,
    subregla: sentencia.subregla,
    extracto: sentencia.extracto,
    derechos: sentencia.derechos,
    score: Number(score.toFixed(4)),
  }));
}

/** Devuelve todas las sentencias del corpus como SentenciaRef. */
export function todasLasSentencias(): SentenciaRef[] {
  return SENTENCIAS.map((s) => ({ ...s }));
}

/** Disclaimer del corpus. */
export const DISCLAIMER_CORPUS: string = corpus.disclaimer ?? "";
