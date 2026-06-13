// lib/i18n/dict/atlas.ts — Namespace "atlas".
// Todos los textos visibles del módulo Atlas:
//   app/atlas/page.tsx, components/atlas/{atlas-shell,atlas-kpis,
//   atlas-leyenda,atlas-panel}.tsx
// Estructura ANIDADA: el resolver soporta dot-path (p.ej. "hero.title").
// Los NÚMEROS y nombres propios (departamentos, sentencias) NO se traducen.

export const atlas = {
  es: {
    // — Metadata de la página (SEO) —
    meta: {
      title: "Atlas de tutelas en salud",
      description:
        "Mapa de Colombia con la magnitud de las tutelas de salud por departamento.",
    },

    // — Encabezado / titular gancho (Acto I del pitch) —
    hero: {
      eyebrow: "El mapa del problema",
      title: "Colombia radica una tutela de salud cada 3 minutos.",
      // {pct}, {emphGranted} y {emphRight} se inyectan en negrita.
      bodyLead: "El",
      emphGranted: "80% de las tutelas de salud se ganan",
      bodyMid: "… porque pedían algo que",
      emphRight: "ya era su derecho.",
      bodyEnd: "Amparo lo resuelve antes de que un juez tenga que ordenarlo.",
    },

    // — Pie de página con fuentes —
    // El nombre del archivo (colombia-departamentos.geojson) va en un <span>
    // estilizado entre `before` y `after`; no se traduce.
    footer: {
      before:
        "Datos reales 2023: tutelas de salud por departamento (Corte Constitucional, datos.gov.co; total nacional validado al 99,99 % contra la Defensoría del Pueblo) e IPS (REPS / Ministerio de Salud). Cartografía: ",
      after: " (33 departamentos, códigos DANE).",
    },

    // — KPIs nacionales —
    kpis: {
      tutelas: {
        label: "Tutelas de salud (2023)",
        note: "Dato real: Corte Constitucional (datos.gov.co), validado vs. Defensoría del Pueblo 2023.",
        sourceAria: "Fuente: Tutelas de salud (2023)",
      },
      granted: {
        label: "% concedidas",
        note: "La gran mayoría se conceden: el juez confirma un derecho que ya existía (Defensoría del Pueblo).",
        sourceAria: "Fuente: % concedidas",
      },
      ips: {
        label: "IPS en el país",
        note: "Instituciones Prestadoras de Servicios de Salud — REPS / Ministerio de Salud.",
        sourceAria: "Fuente: IPS en el país",
      },
      resolved: {
        label: "Resueltos sin juez",
        note: "Casos resueltos en negociación con la EPS, sin llegar a despacho judicial.",
        sourceAria: "Fuente: Resueltos sin juez",
      },
    },

    // — Selector de métrica + leyenda del coroplético —
    metrics: {
      tasaPor10k: {
        label: "Tasa por 10.000 hab.",
        description: "Tutelas de salud por cada 10.000 habitantes (2023)",
      },
      totalTutelas: {
        label: "Total de tutelas",
        description: "Tutelas de salud radicadas en 2023",
      },
      ipsTotal: {
        label: "IPS de salud",
        description: "Instituciones Prestadoras de Servicios de Salud (REPS)",
      },
    },
    legend: {
      lower: "menor",
      higher: "mayor",
      toggleIps: "Mostrar IPS",
      ipsOn:
        "Cada punto es un municipio; su tamaño crece con el nº de IPS (REPS). Pasa el cursor para ver el detalle.",
      ipsOff: "Capa de IPS por municipio (centroides DANE + conteo REPS).",
      source:
        "Datos reales 2023: tutelas de salud (Corte Constitucional, datos.gov.co; validado vs Defensoría) e IPS (REPS / MinSalud). Centroides municipales DANE.",
    },

    // — Pista de interacción (panel desktop vacío) —
    hint: {
      title: "Explora el mapa",
      text: "Haz clic en un departamento para ver sus estadísticas de tutelas en salud y abrir un caso.",
    },

    // — Panel de ranking nacional —
    // `columnLabel` rotula la columna del ranking con la métrica activa.
    ranking: {
      columnLabel: "Métrica",
    },

    // — Panel de detalle de un departamento —
    panel: {
      kicker: "Departamento",
      closeAria: "Cerrar panel",
      sheetFallbackTitle: "Departamento",
      sheetDescription:
        "Estadísticas reales de tutelas de salud por departamento (2023, Corte Constitucional) e IPS (REPS).",
      tutelas: "Tutelas de salud (2023)",
      rate: "Tasa por 10.000 hab.",
      ipsHealth: "IPS de salud",
      ipsPublic: "públicas",
      ipsPrivate: "privadas",
      casesInDemo: "Casos en el demo",
      startCase: "Iniciar un caso aquí",
      viewInCourt: "Ver casos en despacho",
      source:
        "Datos reales 2023: Corte Constitucional (tutelas) y REPS/MinSalud (IPS).",
    },
  },

  en: {
    // — Page metadata (SEO) —
    meta: {
      title: "Atlas of health tutelas",
      description:
        "A map of Colombia showing the scale of health tutelas (constitutional injunctions) by department.",
    },

    // — Header / hook headline (Act I of the pitch) —
    hero: {
      eyebrow: "The map of the problem",
      title: "Colombia files a health tutela—a constitutional injunction—every 3 minutes.",
      bodyLead: "",
      emphGranted: "80% of health tutelas are won",
      bodyMid: "… because they were claiming something that",
      emphRight: "was already theirs by right.",
      bodyEnd: "Amparo settles it before a judge ever has to order it.",
    },

    // — Footer with sources —
    footer: {
      before:
        "Verified 2023 data: health tutelas by department (Constitutional Court, datos.gov.co; national total validated to 99.99% against the Ombudsman's Office) and IPS (REPS / Ministry of Health). Base map: ",
      after: " (33 departments, DANE codes).",
    },

    // — National KPIs —
    kpis: {
      tutelas: {
        label: "Health tutelas (2023)",
        note: "Verified data: Constitutional Court (datos.gov.co), cross-checked against the Ombudsman's Office (2023).",
        sourceAria: "Source: Health tutelas (2023)",
      },
      granted: {
        label: "% granted",
        note: "The vast majority are granted: the judge upholds a right that already existed (Ombudsman's Office).",
        sourceAria: "Source: % granted",
      },
      ips: {
        label: "IPS nationwide",
        note: "Health-care provider institutions (IPS) — REPS / Ministry of Health.",
        sourceAria: "Source: IPS nationwide",
      },
      resolved: {
        label: "Resolved without a judge",
        note: "Cases settled through negotiation with the EPS (health insurer), before ever reaching a court.",
        sourceAria: "Source: Resolved without a judge",
      },
    },

    // — Metric selector + choropleth legend —
    metrics: {
      tasaPor10k: {
        label: "Rate per 10,000 pop.",
        description: "Health tutelas per 10,000 inhabitants (2023)",
      },
      totalTutelas: {
        label: "Total tutelas",
        description: "Health tutelas filed in 2023",
      },
      ipsTotal: {
        label: "Health-care IPS",
        description: "Health-care provider institutions (IPS) — REPS",
      },
    },
    legend: {
      lower: "lower",
      higher: "higher",
      toggleIps: "Show IPS",
      ipsOn: "Each dot is a municipality; the larger the dot, the more IPS it has (REPS). Hover for details.",
      ipsOff: "IPS layer by municipality (DANE centroids + REPS count).",
      source:
        "Verified 2023 data: health tutelas (Constitutional Court, datos.gov.co; cross-checked against the Ombudsman's Office) and IPS (REPS / Ministry of Health). DANE municipal centroids.",
    },

    // — Interaction hint (empty desktop panel) —
    hint: {
      title: "Explore the map",
      text: "Click any department to see its health-tutela figures and open a case.",
    },

    // — National ranking panel —
    // `columnLabel` labels the ranking column with the active metric.
    ranking: {
      columnLabel: "Metric",
    },

    // — Department detail panel —
    panel: {
      kicker: "Department",
      closeAria: "Close panel",
      sheetFallbackTitle: "Department",
      sheetDescription:
        "Verified health-tutela figures by department (2023, Constitutional Court) and IPS (REPS).",
      tutelas: "Health tutelas (2023)",
      rate: "Rate per 10,000 pop.",
      ipsHealth: "Health-care IPS",
      ipsPublic: "public",
      ipsPrivate: "private",
      casesInDemo: "Cases in this demo",
      startCase: "Start a case here",
      viewInCourt: "View cases in chambers",
      source:
        "Verified 2023 data: Constitutional Court (tutelas) and REPS / Ministry of Health (IPS).",
    },
  },
} as const;
