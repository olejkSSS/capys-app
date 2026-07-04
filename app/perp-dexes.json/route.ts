import { NextResponse } from "next/server"
import { PERPS, PERPS_CALC, SITE_URL } from "../data/perps"

export const dynamic = "force-static"

export function GET() {
  return NextResponse.json(
    {
      name: "Capys.app Perp DEX Directory",
      url: SITE_URL,
      generatedAt: new Date().toISOString(),
      venues: PERPS.map((perp) => ({
        slug: perp.slug,
        name: perp.name,
        tier: perp.tier,
        boost: perp.boost,
        farmingFocus: perp.farm,
        logo: `${SITE_URL}${perp.logo}`,
        referralUrl: perp.ref,
        referralCode: perp.refCode,
        detailsUrl: `${SITE_URL}/perps/${perp.slug}`,
        calculatorUrl:
          perp.slug in PERPS_CALC
            ? `${SITE_URL}/calculators/${perp.slug}-point-calculator`
            : null,
      })),
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    }
  )
}
