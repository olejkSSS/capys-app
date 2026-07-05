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
      url: `${SITE_URL}/airdrops`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.96,
    },
    {
      url: `${SITE_URL}/funding-rates`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.92,
    },
    {
      url: `${SITE_URL}/markets`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.98,
    },
    {
      url: `${SITE_URL}/perp-dex-list`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.97,
    },
    {
      url: `${SITE_URL}/tools`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.92,
    },
    {
      url: `${SITE_URL}/tools/farming-cost-calculator`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.93,
    },
    {
      url: `${SITE_URL}/tools/route-finder`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/compare`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/updates`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.82,
    },
    {
      url: `${SITE_URL}/ru`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
      alternates: {
        languages: {
          en: SITE_URL,
          ru: `${SITE_URL}/ru`,
          zh: `${SITE_URL}/zh`,
        },
      },
    },
    {
      url: `${SITE_URL}/zh`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
      alternates: {
        languages: {
          en: SITE_URL,
          ru: `${SITE_URL}/ru`,
          zh: `${SITE_URL}/zh`,
        },
      },
    },
    {
      url: `${SITE_URL}/methodology`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.72,
    },
    {
      url: `${SITE_URL}/partners`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.68,
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
