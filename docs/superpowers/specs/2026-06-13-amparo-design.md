# Amparo — Diseño / Spec

**Fecha:** 2026-06-13
**Contexto:** Hackathon ODR 2026 — *Arbitration Intelligence 2026*, Suffolk University.
**Autor:** Cristian Espinal (solo + Claude Code), build 24–36h.
**Objetivo:** Ganar. Solución de ODR (Online Dispute Resolution) para Colombia con efecto WOW, impacto real, viabilidad de negocio y demo en vivo impecable.

---

## 0. Una frase

> **Amparo** — *La inteligencia que descongesta la justicia en salud de Colombia: resuelve la disputa paciente–EPS antes del juez, y cuando debe llegar al juez, la prepara perfecta.*

El nombre es doble: la *acción de tutela* es una *acción de amparo* constitucional, y **Amparo** es el nombre de nuestra heroína del demo (Amparo, 68 años, le negaron la cirugía de cadera).

---

## 1. El problema (gancho del pitch)

En Colombia la salud es el principal motivo de **acción de tutela**. Cientos de miles al año (~250.000 tutelas invocaron el derecho a la salud en 2023 según informes de la Defensoría del Pueblo — *cifra a confirmar/citar en el demo*). La mayoría se **conceden** porque el ciudadano pedía algo que ya era su derecho (PBS/UPC). Síntomas de un sistema roto:

- **Asimetría de información:** el paciente no sabe redactar una tutela ni qué jurisprudencia lo respalda.
- **Negaciones indebidas de las EPS** que solo se corrigen vía juez.
- **Jueces saturados** resolviendo casos repetitivos de "manual".

Amparo es ODR aplicado a este conflicto: triaje inteligente → resolución directa con la EPS → y solo si falla, tutela impecable + dashboard que le devuelve el tiempo al juez.

---

## 2. Narrativa del demo — 3 actos

- **Acto I — El gancho (`/atlas`):** mapa coroplético de Colombia que "late". KPIs nacionales de tutelas de salud. *"El 80% se ganan porque pedían algo que ya era su derecho."* Click en un departamento → aterriza en un caso.
- **Acto II — Amparo (`/demandante`):** doña Amparo cuenta su historia en lenguaje natural (texto **o voz opcional**). Amparo estructura el caso, corre **triaje de admisibilidad**, **predice el resultado citando sentencias T reales**, e intenta resolver con la EPS. Si la EPS cede → resuelto sin tribunal. Si no → **tutela generada en 60s** + **radicado**.
- **Acto III — El juez (`/juez`):** dashboard con la tutela ya triada, auto-resumida, con **fallo sugerido fundamentado**. El juez revisa y firma. Contador de **descongestión** en vivo.

Cierre: *"Amparo no reemplaza al juez. Le devuelve el tiempo para los casos que de verdad lo necesitan."*

---

## 3. Stack técnico

- **Next.js 16 (App Router) + TypeScript + Tailwind CSS v4 + shadcn/ui** (paridad con Kelsen).
- **Tipografía:** Hanken Grotesk (sans) + un serif para titulares legales (autoridad institucional). Geist Mono para radicados/código.
- **Mapa:** `react-map-gl/maplibre` + GeoJSON de los 33 departamentos de Colombia (coroplético por tasa de tutelas). Reusa el lenguaje visual de `atlas-caba-web`.
- **IA:** **AI SDK v6** + Claude. `claude-opus-4-8` para razonamiento (predicción, fallo, tutela); `claude-haiku-4-5` para triaje/estructuración rápida.
- **RAG demo-safe:** mini-corpus de ~40 sentencias T de salud reales, **embeddings precomputados en un JSON** versionado → búsqueda por similitud coseno **en memoria**. Cero dependencia de DB en vivo (el demo nunca se cae). Opcional: swap a pgvector de Kelsen si sobra tiempo.
- **Voz (opcional, degradable):** Web Speech API (`SpeechRecognition` + `SpeechSynthesis`) para que la abuela *hable* y Amparo *responda*. Si el navegador/entorno no lo soporta, cae a texto sin romper nada.
- **Estado:** Zustand + datos sembrados en JSON. Sin backend pesado; rutas API de Next solo para llamadas a Claude/RAG.
- **Mobile / "app":** **PWA** (manifest + service worker + íconos + splash) → instalable en iOS (Add to Home Screen) y Android. **Mobile-first responsive**. Esto cubre "amigable con iOS y Play Store" sin compilar nativo (fuera de alcance del hackathon; opción Capacitor documentada como futuro).
- **Deploy:** Vercel.

---

## 4. Lenguaje de diseño (target: adr.org / AAA DDRC + Kelsen)

Referencias: capturas de `AAI Frontend` (AAA Digital Dispute Resolution Center), `adr.org`, y `Kelsen`.

- **Paleta:** fondo degradado lavanda/periwinkle muy suave; **tarjetas blancas** con sombras sutiles y esquinas redondeadas; **header navy/slate** con logo; **primario rojo ladrillo institucional** (CTA). Verdes/ámbar/rojo semánticos para estados.
- **Componentes clave:** wizard/stepper por pasos (estilo "1/6 … 6/6"), grilla de opciones con íconos, modales de confirmación ("¿Listo para enviar?"), tablas de caso con número/etapas/cronograma, badges de estado.
- **Tono:** institucional, confiable, "legal-grade", pero cálido y accesible (es para la abuela *y* para el juez).
- **Accesibilidad:** contraste AA, foco visible, tamaños táctiles ≥44px, soporte de lectura por voz.

---

## 5. Modelo de datos del caso

Un único objeto `Caso` que fluye por estados; las cuatro vistas leen/escriben el mismo objeto (coherencia total en demo).

```ts
type EstadoCaso =
  | 'INTAKE'              // paciente describe
  | 'TRIADO'             // admisibilidad verificada
  | 'EN_NEGOCIACION_EPS' // reclamación enviada a EPS
  | 'RESUELTO_EPS'       // EPS cedió (sin juez) ✅
  | 'ESCALADO_TUTELA'    // tutela generada + radicada
  | 'EN_DESPACHO'        // juez la tiene
  | 'FALLADO'            // juez falló

interface Caso {
  id: string
  radicado: string            // generado (ver §8)
  paciente: { nombre, edad, ciudad, departamento, regimen, eps }
  servicioNegado: string      // p.ej. "artroplastia de cadera"
  diagnostico: string
  urgencia: 'vital' | 'alta' | 'media' | 'baja'
  derechoVulnerado: string[]  // salud, vida digna, seguridad social...
  estado: EstadoCaso
  admisibilidad: TriajeAdmisibilidad   // §7
  prediccion: {
    probabilidadAmparo: number          // 0–100
    sentenciasCitadas: SentenciaRef[]
    reglaAplicable: string
    razonamiento: string
  }
  documentos: {
    reclamacionEPS?: string
    tutela?: string
    falloSugerido?: string
  }
  plazos: PlazoLegal[]        // cronograma §8
  progreso: number            // % 0–100 derivado del estado §8
  timeline: EventoCaso[]      // bitácora con timestamps
}
```

> **Nota de runtime:** evitar `Date.now()`/`new Date()` argless dentro de scripts de workflow; en la app normal de Next sí se usan fechas reales. Las fechas sembradas del demo se fijan como constantes para reproducibilidad.

---

## 6. Capa de inteligencia (corazón "Arbitration Intelligence")

Cuatro funciones sobre el mini-corpus de sentencias T:

1. **Estructurador** (Haiku): texto/voz libre del paciente → JSON del caso (servicio, diagnóstico, urgencia, derechos).
2. **Triaje de admisibilidad** (§7): verifica que la tutela *sea procedente* antes de generarla.
3. **Predictor citado** (Opus): recupera sentencias T similares (RAG) → estima `probabilidadAmparo` + **cita T-760/08 y sentencias específicas con la regla aplicable**. Es el WOW intelectual; nunca inventa citas (solo del corpus recuperado).
4. **Generador** (Opus): redacta, fundamentado en lo recuperado:
   - (a) **Reclamación/derecho de petición a la EPS** (intento de resolución sin juez),
   - (b) **Tutela constitucional completa** (hechos, derechos, pretensiones, pruebas, juramento),
   - (c) **Fallo sugerido** para el juez (con resuelve y fundamentos).

**Anti-alucinación:** toda cita jurisprudencial debe existir en el corpus; el prompt obliga a citar solo `SentenciaRef` recuperadas; si no hay soporte, lo dice explícitamente.

---

## 7. Triaje de admisibilidad de la tutela

Verifica procedencia antes de generar. Checklist (cada uno: ✅/⚠️/❌ + explicación):

- **Derecho fundamental** invocado (salud es fundamental — T-760/08).
- **Legitimación** (titular o agente oficioso).
- **Subsidiariedad** (no hay otro medio idóneo, o hay perjuicio irremediable).
- **Inmediatez** (plazo razonable desde la vulneración).
- **No temeridad** (no es tutela duplicada).
- **Hecho superado / carencia de objeto** (¿ya le entregaron el servicio?).

Salida: `admisible | admisible_con_reservas | inadmisible` + recomendación de ruta (resolver con EPS / radicar tutela / corregir). Esto evita el anti-patrón de "generar tutelas basura" y demuestra rigor jurídico al jurado.

---

## 8. Case management

- **Radicado:** generador con formato judicial colombiano plausible de 23 dígitos:
  `DDMMM·OO·JJ·DDD·AAAA·NNNNN·II`
  (código DANE depto+ciudad · entidad · jurisdicción · despacho · año · consecutivo · instancia).
  Ej.: `05001 31 05 001 2026 00123 00`. Determinístico para el caso héroe.
- **Cronograma / calendario de plazos** (vista calendario + lista):
  - Tutela: **fallo de 1ª instancia ≤ 10 días hábiles** desde reparto.
  - Notificación → **impugnación: 3 días**.
  - 2ª instancia: **≤ 20 días**.
  - Eventual selección/revisión Corte Constitucional.
  - Medidas provisionales si urgencia vital.
  - Reclamación EPS / petición: término de respuesta (p.ej. 15 días hábiles, menor si urgencia).
  Cada `PlazoLegal` tiene `{ titulo, fechaInicio, fechaVence, estado, diasRestantes }` y alerta visual al vencimiento.
- **% de progreso:** derivado del `EstadoCaso` (mapa estado→%: INTAKE 10 · TRIADO 25 · EN_NEGOCIACION_EPS 45 · RESUELTO_EPS 100 · ESCALADO_TUTELA 60 · EN_DESPACHO 80 · FALLADO 100). Barra de progreso + timeline en cada vista.

---

## 9. Las cuatro vistas (rutas)

- **`/atlas`** — Mapa coroplético + KPIs nacionales. Gancho del pitch (Acto I).
- **`/demandante`** — Paciente: intake conversacional (texto/voz) → triaje → predicción citada → elegir "intentar con EPS" o "generar tutela" → radicado + cronograma + progreso. (Acto II).
- **`/demandado`** — EPS: bandeja de reclamaciones entrantes; un **agente-EPS** evalúa y **cede en los casos obvios** en vivo (clímax ODR: resolución sin juez). Muestra costo/riesgo de sanción de negar.
- **`/juez`** — Dashboard: lista priorizada de tutelas (urgencia × probabilidad), abre una → resumen + admisibilidad + **fallo sugerido** → "firmar". Contador de descongestión.

**Segundo cerebro:** panel copiloto IA presente en cada rol, que responde *desde la perspectiva de ese rol* sobre el caso abierto.

---

## 10. Efectos WOW

1. **Abuela → tutela en 60s** (con voz opcional).
2. **Predicción citada en jurisprudencia real** (no fingida).
3. **Resolución sin juez** vía agente-EPS en vivo.
4. **Contador de descongestión** ("casos resueltos sin juez: X · días-juez ahorrados: Y").
5. **Mapa nacional** que contextualiza la escala.
6. **Modo presentación** que guía el demo paso a paso (a prueba de nervios en vivo).

---

## 11. Plan 24–36h (orden demo-safe)

El **camino héroe** (Amparo → triaje → predicción → tutela → juez) se blinda y scriptea desde el paso 1. Todo lo demás es ancho de banda extra.

1. Scaffold Next.js + Tailwind v4 + shadcn + tema AAA/DDRC + PWA base.
2. Modelo `Caso` + store + sembrado (caso héroe + 3–4 casos).
3. Mini-corpus (~40 sentencias T) + embeddings precomputados + búsqueda coseno.
4. Capa IA: estructurador, triaje, predictor citado, generador (rutas API).
5. `/demandante` (intake → triaje → predicción → tutela + radicado + cronograma + progreso).
6. `/juez` (dashboard + fallo sugerido).
7. `/atlas` (mapa + KPIs).
8. `/demandado` (agente-EPS + resolución sin juez) + contador descongestión.
9. Voz opcional + modo presentación + pulido móvil/PWA.

---

## 12. Fuera de alcance (YAGNI para el hackathon)

- Auth real / multiusuario / persistencia en DB (datos sembrados en memoria).
- App nativa compilada (Capacitor/React Native) — solo PWA; nativo documentado como futuro.
- Integración real con SECOP/Rama Judicial/EPS reales.
- Pagos / facturación.
- Corpus jurídico completo (solo mini-corpus curado).

---

## 13. Notas de datos y disclaimers

- Cifras nacionales y de mapa: usar fuentes reales (Defensoría del Pueblo "La Tutela y los Derechos a la Salud", SISPRO) donde se confirmen; marcar como **ilustrativas** las no verificadas en el footer del demo.
- Sentencias T del corpus: reales y citadas con número; las predicciones son *estimaciones* (disclaimer visible: "Amparo es una herramienta de apoyo, no asesoría jurídica vinculante").
- Datos de pacientes: ficticios.

---

## 14. Recursos y presupuesto

**Presupuesto:** hasta **$200 USD** (gasto en APIs/servicios). Holgado para un demo.

| Concepto | Estimado | Nota |
|---|---|---|
| Claude API (Opus generación + Haiku triaje) | $20–60 | Grueso del gasto; usar prompt caching. |
| Embeddings mini-corpus (1 vez) | <$1 | Precomputados a JSON. |
| Mapa (MapLibre + GeoJSON libre) | $0 | Sin token Mapbox. |
| Hosting (Vercel Hobby) | $0 | |
| Voz (Web Speech API nativa) | $0 | Opcional ElevenLabs TTS ~$5–22. |
| Dominio `amparo.*` | ~$12 | Caché institucional para el pitch. |
| Colchón pruebas/reintentos | resto | |

**Repos de apoyo:**
- **Reutilizar (producto):** `Kelsen` (sistema de diseño shadcn + RAG legal + AI SDK), `atlas-caba-web` (MapLibre coroplético Colombia), `AAI Frontend`/adr.org (lenguaje visual).
- **No adoptar en ruta crítica:** `affaan-m/ECC` — es un *agent-harness OS* (tooling de desarrollo, 64 agentes/262 skills), **no** código de producto ODR. Superpowers + Claude Code ya cubren esa necesidad para un sprint solo. Opcional fuera de la ruta crítica.

---

## 15. Criterios de éxito (jurado)

- **WOW técnico:** predicción citada real + voz + agentes negociando.
- **Impacto/acceso a justicia:** la abuela obtiene justicia en 60s; jueces descongestionados.
- **Viabilidad:** clientes claros (EPS quieren menos tutelas; Rama Judicial quiere descongestión; legal-tech B2B/B2G).
- **Demo pulido:** camino héroe blindado + modo presentación + estética adr.org-grade.
