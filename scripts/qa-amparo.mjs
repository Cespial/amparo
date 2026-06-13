/**
 * qa-amparo.mjs — QA visual REAL-BROWSER de Amparo con Playwright (Chromium).
 *
 * Renderiza WebGL/MapLibre por software (SwiftShader) para validar que el mapa
 * dark coroplético de Colombia (basemap OpenFreeMap + relleno teal→rojo) se
 * dibuja de verdad en un navegador real — algo que las capturas headless de
 * Chrome no garantizan.
 *
 * QUÉ HACE
 *   Para cada TARGET (por defecto LIVE Vercel + LOCAL dev):
 *     - Visita /, /atlas, /demandante, /demandado, /juez, /asistente.
 *       (Si una ruta da 404 / error de red, lo reporta y sigue; no aborta todo.)
 *     - En /atlas: espera el canvas de MapLibre (.maplibregl-canvas), da ~4s a
 *       las tiles y lee los píxeles del canvas vía WebGL para comprobar que el
 *       mapa NO está en blanco/uniforme (variedad de color => renderizó).
 *     - Captura screenshots desktop (1440x900) y móvil (390x844) en
 *       scripts/qa-output/{target}/{ruta}-{viewport}.png.
 *     - Recoge errores de consola (console.error) y pageerror por ruta.
 *
 * CÓMO CORRERLO
 *   Desde la raíz del repo (con el dev server ya corriendo en :3000):
 *       node scripts/qa-amparo.mjs
 *
 *   Variables de entorno opcionales:
 *       QA_TARGETS="LOCAL=http://localhost:3000,LIVE=https://amparo-ivory.vercel.app"
 *           Sobrescribe la lista de targets (formato NOMBRE=url separados por coma).
 *       QA_ROUTES="/,/atlas,/juez"
 *           Sobrescribe la lista de rutas.
 *       QA_TILE_WAIT_MS=4000
 *           Milisegundos de espera para que carguen las tiles en /atlas.
 *
 *   Requisitos (ya instalados por la tarea de QA):
 *       npm i -D playwright
 *       npx playwright install chromium
 *
 * SALIDA
 *   - Screenshots en scripts/qa-output/{target}/...
 *   - Reporte JSON en scripts/qa-output/report.json
 *   - Resumen tabular impreso en stdout, con el VEREDICTO del mapa al final.
 *
 * Exit code 0 siempre (es QA informativo); revisa el resumen para el veredicto.
 */

import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, "qa-output");

// ── Config ────────────────────────────────────────────────────────────────
function parseTargets() {
  const env = process.env.QA_TARGETS;
  if (env) {
    return env.split(",").map((pair) => {
      const [name, url] = pair.split("=");
      return { name: name.trim(), baseUrl: url.trim().replace(/\/$/, "") };
    });
  }
  return [
    { name: "LIVE", baseUrl: "https://amparo-ivory.vercel.app" },
    { name: "LOCAL", baseUrl: "http://localhost:3000" },
  ];
}

const ROUTES = (process.env.QA_ROUTES
  ? process.env.QA_ROUTES.split(",").map((r) => r.trim())
  : ["/", "/atlas", "/demandante", "/demandado", "/juez", "/asistente"]);

const TILE_WAIT_MS = Number(process.env.QA_TILE_WAIT_MS ?? 4000);

const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "mobile", width: 390, height: 844 },
];

// Chromium args para forzar WebGL por software (SwiftShader/ANGLE).
const LAUNCH_ARGS = [
  "--use-gl=angle",
  "--use-angle=swiftshader",
  "--enable-unsafe-swiftshader",
  "--ignore-gpu-blocklist",
];

// ── Helpers ─────────────────────────────────────────────────────────────────
function routeSlug(route) {
  if (route === "/") return "home";
  return route.replace(/^\//, "").replace(/\//g, "_");
}

/**
 * Inspecciona el render del mapa midiendo la variedad de color de los píxeles
 * REALMENTE en pantalla. Un mapa renderizado tiene muchos colores distintos
 * (basemap dark + departamentos teal→rojo); un canvas en blanco/uniforme tiene
 * casi un único color.
 *
 * IMPORTANTE: NO usamos gl.readPixels sobre el contexto de MapLibre — ese
 * contexto se crea SIN `preserveDrawingBuffer`, así que un readback posterior
 * devuelve un buffer vacío (todo negro) aunque el mapa esté pintado en pantalla
 * (falso negativo clásico). En su lugar tomamos un screenshot del elemento
 * canvas (los píxeles compositados reales) con Playwright y lo analizamos
 * dibujándolo sobre un canvas 2D dentro de la página.
 */
async function inspectMapCanvas(page) {
  const canvas = await page.$(".maplibregl-canvas");
  if (!canvas) return { found: false, reason: "no .maplibregl-canvas en DOM" };

  const box = await canvas.boundingBox();
  if (!box || box.width < 4 || box.height < 4) {
    return { found: true, reason: "canvas sin tamaño visible", box };
  }

  // Screenshot del elemento canvas => PNG con los píxeles REALES en pantalla.
  let pngBuffer;
  try {
    pngBuffer = await canvas.screenshot({ type: "png" });
  } catch (err) {
    return { found: true, reason: `screenshot del canvas falló: ${String(err.message || err).slice(0, 120)}` };
  }
  const dataUrl = "data:image/png;base64," + pngBuffer.toString("base64");

  // Analizamos el PNG dentro de la página vía un canvas 2D (getImageData).
  return page.evaluate(async (url) => {
    const img = new Image();
    await new Promise((res, rej) => {
      img.onload = res;
      img.onerror = () => rej(new Error("no se pudo decodificar el screenshot"));
      img.src = url;
    });
    const w = img.naturalWidth;
    const h = img.naturalHeight;
    const cv = document.createElement("canvas");
    cv.width = w;
    cv.height = h;
    const ctx = cv.getContext("2d");
    ctx.drawImage(img, 0, 0);
    const data = ctx.getImageData(0, 0, w, h).data;

    // Muestreo en rejilla ~50x50.
    const stepX = Math.max(1, Math.floor(w / 50));
    const stepY = Math.max(1, Math.floor(h / 50));
    const colors = new Set();
    let sampled = 0;
    let nonBlack = 0;
    let sumR = 0, sumG = 0, sumB = 0;
    const lum = [];

    for (let y = 0; y < h; y += stepY) {
      for (let x = 0; x < w; x += stepX) {
        const i = (y * w + x) * 4;
        const r = data[i], g = data[i + 1], b = data[i + 2];
        sampled++;
        if (r > 8 || g > 8 || b > 8) nonBlack++;
        sumR += r; sumG += g; sumB += b;
        lum.push(0.299 * r + 0.587 * g + 0.114 * b);
        colors.add((r >> 3) + "," + (g >> 3) + "," + (b >> 3)); // cuantizado a 5 bits
      }
    }

    const mean = lum.reduce((s, v) => s + v, 0) / lum.length;
    const variance = lum.reduce((s, v) => s + (v - mean) ** 2, 0) / lum.length;

    return {
      found: true,
      width: w,
      height: h,
      sampled,
      distinctColors: colors.size,
      nonBlackPct: Math.round((nonBlack / sampled) * 100),
      avgColor: {
        r: Math.round(sumR / sampled),
        g: Math.round(sumG / sampled),
        b: Math.round(sumB / sampled),
      },
      lumVariance: Math.round(variance),
    };
  }, dataUrl);
}

/** Heurística de veredicto del mapa a partir de las métricas del canvas. */
function judgeMap(m) {
  if (!m || !m.found) return { rendered: false, why: m?.reason ?? "canvas no encontrado" };
  if (m.distinctColors == null) return { rendered: false, why: m.reason ?? "sin métricas de color" };

  // Render real: muchos colores distintos Y varianza de luminancia apreciable.
  // Un canvas uniforme (blanco/negro/un solo color) tiene <=2-3 colores y var~0.
  const rendered = m.distinctColors >= 8 && m.lumVariance >= 25 && m.nonBlackPct >= 5;
  const why = rendered
    ? `${m.distinctColors} colores distintos, varianza lum ${m.lumVariance}, ${m.nonBlackPct}% píxeles no-negros`
    : `canvas casi uniforme (colores=${m.distinctColors}, varLum=${m.lumVariance}, noNegro=${m.nonBlackPct}%)`;
  return { rendered, why };
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function run() {
  const targets = parseTargets();
  await mkdir(OUT_DIR, { recursive: true });

  console.log("Amparo QA visual real-browser (Playwright + WebGL software)\n");
  console.log("Targets:", targets.map((t) => `${t.name}=${t.baseUrl}`).join("  "));
  console.log("Rutas:  ", ROUTES.join("  "));
  console.log("");

  const browser = await chromium.launch({ headless: true, args: LAUNCH_ARGS });
  const report = [];

  for (const target of targets) {
    for (const route of ROUTES) {
      const entry = {
        target: target.name,
        route,
        url: target.baseUrl + route,
        status: null,
        ok: false,
        consoleErrors: [],
        pageErrors: [],
        screenshots: {},
        map: null,
        note: "",
      };

      for (const vp of VIEWPORTS) {
        const context = await browser.newContext({
          viewport: { width: vp.width, height: vp.height },
          deviceScaleFactor: 1,
          ignoreHTTPSErrors: true,
        });
        const page = await context.newPage();

        // Captura errores solo una vez (en desktop) para no duplicar.
        if (vp.name === "desktop") {
          page.on("console", (msg) => {
            if (msg.type() === "error") entry.consoleErrors.push(msg.text().slice(0, 300));
          });
          page.on("pageerror", (err) => {
            entry.pageErrors.push(String(err.message || err).slice(0, 300));
          });
        }

        let response = null;
        try {
          response = await page.goto(entry.url, {
            waitUntil: "domcontentloaded",
            timeout: 30000,
          });
          if (vp.name === "desktop") {
            entry.status = response ? response.status() : null;
            entry.ok = response ? response.ok() : false;
          }
        } catch (err) {
          entry.note = `goto error: ${String(err.message || err).slice(0, 160)}`;
          await context.close();
          continue;
        }

        // En /atlas: esperar canvas + tiles, e inspeccionar render (solo desktop
        // para el veredicto; el móvil solo aporta screenshot).
        if (route === "/atlas") {
          try {
            await page.waitForSelector(".maplibregl-canvas", { timeout: 15000 });
            await page.waitForTimeout(TILE_WAIT_MS);
          } catch (err) {
            if (vp.name === "desktop") {
              entry.note =
                (entry.note ? entry.note + "; " : "") +
                `canvas no apareció: ${String(err.message || err).slice(0, 120)}`;
            }
          }
          if (vp.name === "desktop" && (entry.status == null || entry.ok)) {
            try {
              const metrics = await inspectMapCanvas(page);
              entry.map = { metrics, verdict: judgeMap(metrics) };
            } catch (err) {
              entry.map = {
                metrics: null,
                verdict: { rendered: false, why: `inspección falló: ${String(err.message || err).slice(0, 120)}` },
              };
            }
          }
        } else {
          // Pequeña espera para que monten componentes cliente.
          await page.waitForTimeout(800);
        }

        // Screenshot (aunque la página sea 404, capturamos lo que muestre).
        const shotPath = join(OUT_DIR, target.name, `${routeSlug(route)}-${vp.name}.png`);
        await mkdir(dirname(shotPath), { recursive: true });
        try {
          await page.screenshot({ path: shotPath, fullPage: false });
          entry.screenshots[vp.name] = shotPath;
        } catch (err) {
          entry.screenshots[vp.name] = `error: ${String(err.message || err).slice(0, 120)}`;
        }

        await context.close();
      }

      report.push(entry);
      const statusLabel = entry.status == null ? "ERR" : entry.status;
      const mapLabel =
        route === "/atlas"
          ? entry.map
            ? entry.map.verdict.rendered
              ? " | MAPA: RENDERIZA ✓"
              : " | MAPA: NO ✗"
            : " | MAPA: ?"
          : "";
      console.log(
        `[${target.name}] ${route.padEnd(12)} HTTP ${statusLabel}${mapLabel}` +
          (entry.consoleErrors.length || entry.pageErrors.length
            ? ` | errs: ${entry.consoleErrors.length + entry.pageErrors.length}`
            : "")
      );
    }
  }

  await browser.close();
  await writeFile(join(OUT_DIR, "report.json"), JSON.stringify(report, null, 2));

  // ── Resumen ────────────────────────────────────────────────────────────────
  console.log("\n================== RESUMEN ==================\n");
  console.log("TARGET  RUTA          HTTP   MAPA          CONSOLE-ERR  PAGE-ERR");
  console.log("------  ------------  -----  ------------  -----------  --------");
  for (const e of report) {
    const http = e.status == null ? "ERR" : String(e.status);
    const map =
      e.route === "/atlas"
        ? e.map
          ? e.map.verdict.rendered
            ? "RENDERIZA ✓"
            : "NO ✗"
          : "?"
        : "-";
    console.log(
      `${e.target.padEnd(6)}  ${e.route.padEnd(12)}  ${http.padEnd(5)}  ${map.padEnd(12)}  ${String(
        e.consoleErrors.length
      ).padEnd(11)}  ${e.pageErrors.length}`
    );
  }

  console.log("\n========== VEREDICTO DEL MAPA (/atlas) ==========\n");
  for (const e of report.filter((r) => r.route === "/atlas")) {
    if (!e.map) {
      console.log(`[${e.target}] sin datos de mapa (HTTP ${e.status ?? "ERR"}) ${e.note || ""}`);
      continue;
    }
    const v = e.map.verdict;
    console.log(`[${e.target}] ${v.rendered ? "RENDERIZA ✓" : "NO RENDERIZA ✗"} — ${v.why}`);
    if (e.map.metrics?.avgColor) {
      const c = e.map.metrics.avgColor;
      console.log(`         color promedio rgb(${c.r},${c.g},${c.b}), canvas ${e.map.metrics.width}x${e.map.metrics.height}`);
    }
  }

  // Errores detallados (primeros por ruta).
  const withErrs = report.filter((r) => r.consoleErrors.length || r.pageErrors.length);
  if (withErrs.length) {
    console.log("\n========== ERRORES DE CONSOLA / PÁGINA ==========\n");
    for (const e of withErrs) {
      console.log(`[${e.target}] ${e.route}`);
      for (const m of e.consoleErrors.slice(0, 5)) console.log(`   console.error: ${m}`);
      for (const m of e.pageErrors.slice(0, 5)) console.log(`   pageerror:     ${m}`);
    }
  }

  console.log(`\nScreenshots + report.json en: ${OUT_DIR}`);
}

run().catch((err) => {
  console.error("QA falló de forma irrecuperable:", err);
  process.exit(1);
});
