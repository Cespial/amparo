import type { MetadataRoute } from "next";

const BASE_URL = "https://amparo.help";

// robots.txt — permitimos el rastreo de las rutas públicas y excluimos
// las rutas internas de API. Apuntamos al sitemap canónico.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/"],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
