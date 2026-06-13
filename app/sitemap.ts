import type { MetadataRoute } from "next";

const BASE_URL = "https://amparo.help";

// Rutas públicas de Amparo. La portada y el Atlas son las páginas de mayor
// prioridad; los espacios de cada rol (demandante, demandado, juez, asistente)
// y el pitch completan la superficie pública indexable.
const routes: Array<{
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}> = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/atlas", changeFrequency: "weekly", priority: 0.9 },
  { path: "/demandante", changeFrequency: "monthly", priority: 0.8 },
  { path: "/demandado", changeFrequency: "monthly", priority: 0.8 },
  { path: "/juez", changeFrequency: "monthly", priority: 0.8 },
  { path: "/asistente", changeFrequency: "monthly", priority: 0.7 },
  { path: "/pitch", changeFrequency: "monthly", priority: 0.6 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return routes.map(({ path, changeFrequency, priority }) => ({
    url: `${BASE_URL}${path}`,
    lastModified,
    changeFrequency,
    priority,
  }));
}
