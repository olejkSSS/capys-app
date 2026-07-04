import type { MetadataRoute } from "next"
import { PERPS, PERPS_CALC, SITE_URL } from "./data/perps"

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${SITE_URL}/perp-airdrop-calculator`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.92,
    },
    {
      url: `${SITE_URL}/calculators`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.95,
    },
    {
      url: `${SITE_URL}/funding-rates`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.92,
    },
    ...PERPS.map((perp) => ({
      url: `${SITE_URL}/perps/${perp.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.86,
    })),
    ...Object.keys(PERPS_CALC).map((slug) => ({
      url: `${SITE_URL}/calculators/${slug}-point-calculator`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    })),
  ]
}
