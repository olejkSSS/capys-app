import type { MetadataRoute } from "next"
import { PERPS, SITE_URL } from "./data/perps"

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    ...PERPS.map((perp) => ({
      url: `${SITE_URL}/perps/${perp.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.86,
    })),
  ]
}
