# Imágenes para la landing de Amparo — brief + prompts (ChatGPT / Google Flow·Veo)

**Marca (anclas de estilo para TODAS las piezas):** brick red `#CE3A28`, navy `#20243F`, lavanda `#E4E5FC`, blanco. Institucional + cálido. Source Serif 4 / Hanken Grotesk (no incrustar texto en la imagen). Sin emoji, sin logos ajenos, sin cruz médica obvia ni mazo de juez literal. Estética: editorial, digna, esperanzadora, mucho aire.

**Criterio:** la landing es limpia/minimal. Mejor **ilustración editorial cohesionada** (controlable, on-brand, sin caras uncanny) como base + 1 hero humano tratado opcional. Evitar "stock-photo" cliché y caras fotorrealistas de personas reales (ético + uncanny).

---

## Pieza 1 — HERO (la imagen ancla) · 2 rutas, elige una

### Ruta A (recomendada) — Ilustración editorial "la cuarta parte"
**Dónde:** columna derecha del hero (hoy hay una tarjeta navy de cifras; puede convivir o reemplazarse). **Specs:** 1200×1200 PNG transparente o lavanda.
**ChatGPT / DALL·E prompt:**
> Editorial vector illustration, warm and institutional. A dignified older Latin American woman (Colombian, ~68) seen from the side, calm and hopeful, gently holding a smartphone; from the phone a soft protective shield-like form unfolds over her like a roof or shelter, suggesting care and protection. Minimal flat shapes with subtle grain, limited palette of brick red (#CE3A28), deep navy (#20243F), soft lavender (#E4E5FC) and white, generous negative space, soft diffuse light. Conveys access to justice and dignity. No text, no logos, no medical cross, no gavel. Clean, modern, hopeful editorial style.

### Ruta B — Hero humano tratado (más emocional)
**Treatment:** duotono navy↔brick o foto limpia sobre lavanda; tratarla editorialmente para que se sienta intencional, no stock.
**ChatGPT prompt:**
> Warm documentary-style portrait of a dignified Colombian grandmother, around 68, kind eyes, a gentle hopeful expression (not a forced smile), soft natural window light, simple everyday clothing, calm and empowered. Neutral warm background tinted soft lavender (#E4E5FC). Authentic and respectful, editorial — NOT a stock photo, not staged. Shallow depth of field, portrait orientation. No text, no watermark.

> Post: aplicar duotono de marca (sombras navy #20243F, luces brick #CE3A28 muy sutil) o dejar a color sobre lavanda. Marcar como ilustrativa (persona ficticia).

---

## Pieza 2 — Trío de los 3 actos (sección "Cómo funciona")
Set cohesionado, MISMO estilo que la pieza 1. **Specs:** 800×600 cada una.
**Estilo común (pega al inicio de cada prompt):**
> Editorial flat vector illustration, subtle grain, palette brick red #CE3A28 / navy #20243F / lavender #E4E5FC / white, generous negative space, soft light, hopeful institutional tone, no text, no logos. Consistent style across the set.

1. **Voz / contar tu caso:** `...A person speaking into a soft microphone/voice wave that turns into organized document lines — telling their story in plain words being understood and structured.`
2. **Mediación / acuerdo:** `...Two hands meeting over a small round table with a gentle shield between them, a balanced agreement forming — consensus, not conflict.`
3. **El juez / la última palabra humana:** `...A calm judge's desk with a single signature pen and a softly glowing document; a human hand signing — dignity and human decision, no gavel, no scales cliché.`

---

## Pieza 3 — Textura / fondo de marca (sutil)
**Dónde:** fondo del hero o de secciones; muy sutil. **Specs:** 1920×1080, baja opacidad.
**ChatGPT prompt:**
> Abstract soft gradient-mesh background, lavender (#E4E5FC) to white with a faint brick-red glow at the top, plus a very subtle topographic line motif evoking the silhouette of Colombia. Minimal, calm, high negative space, no text. Suitable as a clean web hero background.

---

## Pieza 4 — Tarjeta social / Open Graph (al compartir amparo.help)
Ya hay una OG generada por código; esta sería una versión "hero". **Specs:** 1200×630.
**ChatGPT prompt:**
> A clean institutional social card composition (1200x630), lavender-to-white background with a subtle brick-red glow, lots of negative space on the left for a serif headline (leave it empty, no text), and on the right the warm editorial illustration of the protective shield unfolding over a person. Palette brick red #CE3A28 / navy #20243F / lavender #E4E5FC. No text, no logos.

---

## Pieza 5 (opcional, WOW) — Video hero loop · Google Flow / Veo
**Dónde:** fondo del hero o un mini-clip. **Specs:** 5–8s, loop, 1920×1080, sin audio.
**Google Flow / Veo prompt:**
> Cinematic but minimal, slow and calm. A soft protective shield-like form gently unfolds and settles like a roof of light over an abstract small figure, in a palette of brick red, deep navy and soft lavender, on a clean light background with delicate floating particles. Hopeful, institutional, dignified. Seamless slow loop, no text, no logos, no people's faces in detail. Subtle motion only.

**Alternativo (emocional):**
> Cinematic close shot, soft natural light: an older woman's hands holding a phone; on the screen a calm hopeful glow appears as good news arrives; gentle smile begins (out of focus). Warm, dignified, documentary tone, lavender ambiance. 5 seconds, no text.

---

## Especificaciones técnicas (para integrarlas yo)
- Formato: PNG (transparente donde aplique) o WebP; el hero idealmente con transparencia o sobre lavanda.
- Optimizar a < 300 KB cada una (las integro con `next/image`).
- Guárdalas en `~/Downloads` o pásamelas; yo las pongo en `public/img/` y las cableo en la landing (hero, 3 actos, OG, fondo) — respetando el diseño AAA y `next/image` (lazy, responsive).
- Pídele a cada herramienta **varias variaciones** y elige la más limpia/menos "AI-slop".

## Qué evitar (negative)
stock-photo cliché · caras fotorrealistas uncanny · cruz médica / mazo / balanza literal · degradados arcoíris · texto incrustado · logos · sobre-saturación · 3D plastificado.
