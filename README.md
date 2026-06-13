<div align="center">

# 🛡️ Amparo

### The fourth party that decongests health justice in Colombia

**[amparo.help](https://amparo.help)** · Online Dispute Resolution for health *tutelas*
Built for **Arbitration Intelligence 2026 — ODR Hackathon, Suffolk University**

*Justice in health, within everyone's reach — speak your case, resolve it before the judge, and when it must reach the judge, arrive prepared.*

</div>

---

## The problem

In Colombia, the **acción de tutela** (constitutional injunction) is the #1 tool citizens use to claim a denied health service. In 2023 alone there were **197,737 health tutelas** (Constitutional Court / Defensoría del Pueblo) — and **~80% are granted**, because people were asking for something **that was already their right**. A system that forces you to sue the State to receive what the law already guarantees is a broken one:

- **Information asymmetry** — citizens don't know how to draft a tutela or which case law backs them.
- **Improper denials by EPS** (health insurers) that only get corrected by a judge.
- **Overwhelmed judges** ruling on repetitive, manual-grade cases.

> *"Amparo"* has a triple meaning: the tutela is, in essence, an *acción de amparo* (constitutional protection); *amparo* means **shelter / protection**; and **Amparo** is a classic Colombian grandmother's name — our demo's heroine is *Amparo, 68, denied a hip surgery.*

## The solution — the **fourth party**

Amparo is technology as a party in the process (Katsh & Rule's "fourth party"). It **gives the person a voice**, tries to resolve the dispute **with the EPS before a judge**, and when it must reach the judge, **prepares the case impeccably** — always keeping the **final decision human**.

🌐 **Live:** **[amparo.help](https://amparo.help)** · 🎙️ Talk to Amparo: [/asistente](https://amparo.help/asistente) · 🗺️ The map of the problem: [/atlas](https://amparo.help/atlas) · 🎞️ Pitch: [/pitch](https://amparo.help/pitch)

---

## What's inside

| Route | What it does | The WOW |
|---|---|---|
| **/** Landing | The promise, in plain language | Bilingual, AAA-grade clean UI |
| **/asistente** | A guided assistant that fills your case **one question at a time** | **Audio-reactive avatar that speaks** with a real voice (ElevenLabs) — accessibility for everyone |
| **/atlas** | The national map of the problem | Choropleth of **real** health-tutela data + **922 municipalities of IPS** + public-network layer |
| **/demandante** | From your story to your tutela | Admissibility triage → **outcome prediction citing real Constitutional Court rulings** → **right-of-petition with named respondent + SLA clock** |
| **/demandado** | The EPS portal | Sees the cost of denying, **mediates a consensus agreement** (Habermas-style), decongestion counters |
| **/juez** | The judge's chambers | Prioritized queue + auto-summary + **suggested, grounded ruling** — *the last word is the judge's* |
| **/impacto** | "If Amparo scaled" | National decongestion projection + B2G/B2B/B2C model |
| **/pitch** | In-app navigable deck | 11 slides, keyboard-driven |

Plus: **🌐 EN/ES toggle** (the voice speaks the selected language), a **presentation mode** that guides the live demo step-by-step, and **bilateral transparency** (each party sees the other's submissions).

---

## Why it wins (mapped to the judging criteria)

The keynote framed dispute-resolution design around **procedural justice, equity, legitimacy, and the fourth party**. Amparo is built to embody each:

| Judging value | How Amparo delivers |
|---|---|
| **Voice** (procedural justice) | Conversational + **voice** intake — a grandmother *speaks* her case and hears it explained |
| **Meaningful access** | Not just filing — it carries the person end-to-end with a timeline and an actual resolution |
| **Neutrality / transparency** | Predictions **cited in verifiable case law**, not a black box; each side sees the other's inputs |
| **Equity / anti-bias** | Consistent outcomes grounded in jurisprudence — less arbitrariness (cf. the Michigan traffic-court study, the Habermas Machine) |
| **Legitimacy / human-in-the-loop** | The **judge signs**; Amparo proposes, the human decides. Visible disclaimers |
| **The fourth party** | Amparo relieves the two classic constraints — place and human capacity |

### Our moat: **every number and citation is real or explicitly marked**
The legal corpus is **38 verified Sentencias T** of the Constitutional Court. The predictor is **forbidden from citing anything outside the retrieved corpus**. An **adversarial audit** during development actually caught and removed a hallucinated citation — proof the guardrail works. Atlas figures come from **datos.gov.co** (Constitutional Court + REPS/MinSalud), validated against the Defensoría del Pueblo's 2023 report (197,737 ≈ 197,765, a 99.99% match).

---

## Architecture

```
Next.js 16 (App Router, RSC) · TypeScript · Tailwind v4 · shadcn/ui
AI:        AI SDK v6 + Claude  (Opus 4.x = reasoning · Haiku = fast triage)
Voice:     ElevenLabs multilingual TTS  (Web Speech fallback)
Map:       react-map-gl / MapLibre GL  (OpenFreeMap dark basemap, no token)
RAG:       in-memory lexical retrieval over a curated, verified corpus (no DB -> demo-safe)
State:     Zustand (a single Caso flows through all four roles)
i18n:      context provider + namespaced dictionaries (ES/EN, 87/87 parity)
Deploy:    Vercel · amparo.help
```

**Key design choices**
- **One `Caso` object** moves through `INTAKE -> TRIADO -> EN_NEGOCIACION_EPS -> (RESUELTO_EPS | ESCALADO_TUTELA -> EN_DESPACHO -> FALLADO)`, read/written by every view — total demo coherence.
- **Demo-safe by construction:** no live database; the legal corpus and seed cases are versioned JSON, and the hero case has high-quality fixtures so the demo never goes blank.
- **Anti-hallucination layer:** the prediction prompt receives only corpus-retrieved rulings and must return ids from that list.

### Data sources (`public/data/`, documented in `public/data/FUENTES.md`)
- `tutelas-por-departamento.json` — health tutelas 2023 by department (Constitutional Court, datos.gov.co `xkyt-k6pk`; validated vs. Defensoría).
- `ips-puntos.json` — IPS by municipality (REPS `c36g-9fc2` x DANE centroids), 922 municipalities.
- `ips-publicas-puntos.json` — public health network (ESE), 857 municipalities.
- `ciudades.json` — 76 cities. `colombia-departamentos.geojson` — 33 departments (DANE).
- `lib/corpus/sentencias.json` — 38 verified Constitutional Court health rulings.

---

## Run it locally

```bash
npm install
# .env.local needs: ANTHROPIC_API_KEY, ELEVENLABS_API_KEY, ELEVENLABS_VOICE_ID (optionally VOYAGE_API_KEY)
npm run dev          # http://localhost:3000
npm run build        # production build
```

> The app degrades gracefully: without the ElevenLabs key, the assistant falls back to the browser's Web Speech; the hero case uses fixtures if the model is unavailable.

---

## Demo script (3 acts)

1. **The problem** — `/atlas`: *"197,737 health tutelas in 2023; ~80% are won because they were already a right."*
2. **The person** — `/asistente`: Amparo **speaks**, asks one question at a time, structures the case, and predicts the outcome **citing T-760/2008**.
3. **Resolve, then the judge** — `/demandado`: the EPS mediates a consensus agreement -> decongestion. `/juez`: a grounded, suggested ruling the judge **signs**.

*Closing line: "Amparo doesn't replace the judge. It gives the judge back the time for the cases that truly need it — and gives people real access to their right."*

---

## Status & roadmap

**Shipped & live:** landing · atlas (real data + map layers) · assistant with voice avatar · demandante (petition + SLA) · demandado · juez · pitch deck · EN/ES · presentation mode · OG/SEO · adversarial audit.

**In progress / next:** Habermas-style mediation · national impact & business case · demo-proof mode + downloadable real PDF (tutela/fallo) · brand identity integration.

---

## Disclaimers

Amparo is a **support tool for access to justice**, not binding legal advice. Predictions are **estimates** grounded in real Colombian Constitutional Court case law. Patient data in the demo is **fictitious**. Built for the ODR Hackathon 2026 (Suffolk University).

<div align="center">

**Amparo — la cuarta parte que descongestiona la justicia en salud.**

</div>
