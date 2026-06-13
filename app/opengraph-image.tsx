import { ImageResponse } from "next/og";

// Open Graph image for amparo.help — shown when the site is shared on
// social networks and messaging apps. Generated at build time.
export const alt =
  "Amparo — La justicia en salud, al alcance de todos. ODR de tutelas de salud · Colombia.";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

// Brand palette (AAA claro)
const ROJO = "#ce3a28";
const NAVY = "#20243f";
const LAVANDA = "#eef0fc";
const CARD = "#ffffff";

// Marca: escudo "Amparo" como SVG embebido (mismo lenguaje que public/icons/icon.svg).
const shieldSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="112" fill="${NAVY}"/>
  <path d="M256 86 L398 140 V268 C398 360 332 414 256 446 C180 414 114 360 114 268 V140 Z" fill="${ROJO}" stroke="${LAVANDA}" stroke-width="14" stroke-linejoin="round"/>
  <path d="M210 262 L244 298 L312 222" fill="none" stroke="#FFFFFF" stroke-width="26" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const shieldSrc = `data:image/svg+xml;base64,${Buffer.from(shieldSvg).toString(
  "base64",
)}`;

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          // Degradado lavanda → blanco
          backgroundColor: LAVANDA,
          backgroundImage: `linear-gradient(135deg, ${LAVANDA} 0%, ${CARD} 62%, ${CARD} 100%)`,
          padding: "72px 80px",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* Barra de acento de marca */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: 14,
            backgroundColor: ROJO,
            display: "flex",
          }}
        />

        {/* Encabezado: logo + nombre */}
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          <img src={shieldSrc} width={120} height={120} alt="" />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                fontSize: 64,
                fontWeight: 800,
                color: NAVY,
                lineHeight: 1,
                letterSpacing: "-0.02em",
              }}
            >
              Amparo
            </div>
            <div
              style={{
                fontSize: 26,
                color: ROJO,
                fontWeight: 700,
                marginTop: 6,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
              }}
            >
              amparo.help
            </div>
          </div>
        </div>

        {/* Titular + subtítulo */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: 78,
              fontWeight: 800,
              color: NAVY,
              lineHeight: 1.05,
              letterSpacing: "-0.025em",
              maxWidth: 980,
            }}
          >
            La justicia en salud,{" "}
            <span style={{ color: ROJO, marginLeft: 18 }}>
              al alcance de todos
            </span>
          </div>
          <div
            style={{
              fontSize: 34,
              color: "#4a4f6b",
              fontWeight: 500,
              marginTop: 28,
            }}
          >
            ODR de tutelas de salud · Colombia
          </div>
        </div>

        {/* Pie: respaldo institucional */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            fontSize: 24,
            color: NAVY,
            fontWeight: 600,
          }}
        >
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: 12,
              backgroundColor: ROJO,
              display: "flex",
            }}
          />
          Asistido por IA · respaldado en la Corte Constitucional
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
