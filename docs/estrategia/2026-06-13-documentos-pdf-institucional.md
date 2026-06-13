# Spec — Documentos exhaustivos + exportación PDF institucional

**Objetivo:** que los documentos que genera Amparo (tutela, contestación EPS, fallo, acta de mediación, derecho de petición) sean **exhaustivos, bien estructurados, con citación jurisprudencial completa para TODAS las partes**, y exportables a **PDF institucional** (logo, radicado, encabezado, pie de página con número de página, bloque de firma). Referencia de formato: `~/Downloads/2021-10-06_Contestacion_icbf_accion_tutela...pdf` (Contestación ICBF).

## 1. Tipos de documento (cada parte tiene el suyo, todos citados)
| Documento | Quién | Citas |
|---|---|---|
| **Acción de tutela** | Demandante | Art. 86 CP, Decreto 2591/1991, sentencias T de salud aplicables (T-760/08 + las del corpus por el sub-tema) |
| **Derecho de petición** | Demandante → EPS | Ley 1755/2015, art. 23 CP, normas de salud |
| **Contestación de la tutela** | Demandado (EPS) | argumentos de procedencia/improcedencia citando jurisprudencia (legitimación, subsidiariedad, hecho superado) |
| **Acta de mediación / acuerdo** | Amparo (mediador) | fundamento en el derecho a la salud + términos del consenso |
| **Fallo / sentencia** | Juez | considerandos con cita exhaustiva + resuelve |

## 2. Estructura del cuerpo (exhaustiva)
Tomado del formato real. Cada documento, según su tipo:
- **Encabezado de destinatario**: "Señor Juez (reparto) …" / "Honorable Juez" / para fallo el encabezado del despacho.
- **Bloque de referencia**: Radicado (23 dígitos), ciudad y fecha, **Referencia**, **Accionante**, **Accionado**, derechos invocados.
- **Identificación** del firmante (nombre, C.C., calidad: en nombre propio / agente oficioso / apoderado).
- **I. HECHOS** — numerados (PRIMERO, SEGUNDO, …), narrados con fechas concretas.
- **II. FUNDAMENTOS DE DERECHO** — desarrollo por sub-reglas, **con notas al pie** que citan las sentencias del corpus (¹ ² ³…) y las normas (Art. 86 CP; Decreto 2591/1991; Ley 1751/2015 estatutaria de salud; Ley 1755/2015). Bloques de cita indentados en itálica para extractos.
- **III. PRETENSIONES** — peticiones concretas, numeradas (tutelar el derecho; ordenar a la EPS autorizar X en N horas; medidas provisionales si urgencia vital).
- **IV. PRUEBAS** — listado de anexos (orden médica, negación de la EPS, historia clínica).
- **V. JURAMENTO** (art. 37 Decreto 2591) + **NOTIFICACIONES** (direcciones/correos).
- **Firma** — nombre, C.C., (apoderado: T.P.).
- Para **fallo**: CONSIDERANDOS (competencia, problema jurídico, sub-reglas con cita, caso concreto) + **RESUELVE** (numeral por numeral, con plazos) + recursos.

## 3. Citación exhaustiva (el diferenciador)
- **Notas al pie numeradas** con las sentencias (solo del corpus `lib/corpus/sentencias.json` — anti-alucinación) + normas. Ej.: "¹ Corte Constitucional, Sentencia T-760 de 2008, M.P. …". 
- Una sección final **"Referencias / Fundamento jurisprudencial"** consolidando todas las sentencias citadas con su sub-regla.
- Prompts de `lib/ai/generador.ts` reforzados: exigir estructura completa por secciones, hechos numerados, fundamentos con AL MENOS 3-5 sentencias del corpus recuperado (pásaselas), normas aplicables, y marcar `[anexo]` donde corresponda. Más largo y formal. Conserva el español jurídico.

## 4. PDF institucional — tecnología
- **`@react-pdf/renderer`** (instalar como dep; NO lo instala un agente — lo instala Cristian). Genera PDF multipágina con control fino.
- `lib/pdf/`:
  - `plantilla-base.tsx` — `<Page>` con **header fijo** (logo Amparo + "Amparo · Centro de Resolución de Disputas en Salud" + banda/acento institucional + línea), **footer fijo** (línea + "amparo.help" + **"Página {n} de {m}"** vía render callback + nota "Documento generado por Amparo — herramienta de apoyo, no asesoría vinculante"). Tipografía serif (registrar Source Serif 4) para el cuerpo; sans para metadatos.
  - `tutela-pdf.tsx`, `contestacion-pdf.tsx`, `fallo-pdf.tsx`, `acta-mediacion-pdf.tsx`, `peticion-pdf.tsx` — componen el cuerpo desde el markdown/estructura que devuelve el generador. Renderizan secciones romanas, hechos numerados, **notas al pie** (lista al pie de página o sección de referencias), bloques de cita, y **bloque de firma con radicado**.
  - `radicado` y fecha visibles en el encabezado del documento.
- **Descarga**: un botón "Descargar PDF" en el visor de cada documento (`/demandante` tutela/petición, `/juez` fallo, `/demandado` contestación/acta). Usa `@react-pdf/renderer` `pdf(<Doc/>).toBlob()` en cliente → descarga. (O una API route `/api/pdf` server-side si pesa.)
- Logo: usar el SVG/PNG de marca (cuando llegue de Claude Design; mientras, el escudo actual).

## 5. Anti-alucinación + exactitud (mantener el foso)
- Las sentencias citadas SOLO del corpus. Las normas (CP, decretos, leyes) son de derecho positivo conocido — citarlas con número correcto.
- Datos del paciente: del caso (ficticios en demo). Radicado: del caso.
- Disclaimer en el pie: "Documento de apoyo generado por IA; no constituye asesoría jurídica vinculante."

## 6. Orden de ejecución
Esta ola se construye DESPUÉS de que cierre Habermas (toca `lib/ai/generador` + `/demandado` + visores en `/demandante`/`/juez`). Se combina con la "Ola 1: Demo blindado + flujo continuo + PDF". Pasos: (1) instalar `@react-pdf/renderer` + registrar fuente; (2) reforzar prompts del generador (exhaustivo + citado); (3) construir `lib/pdf/*` + botones de descarga; (4) verificar build + QA visual del PDF (página por página) con la skill pdf-deliverable.
