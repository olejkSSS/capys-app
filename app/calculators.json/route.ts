import { NextResponse } from "next/server"
import { PERPS_CALC, SITE_URL } from "../data/perps"

export const dynamic = "force-static"

export function GET() {
  return NextResponse.json(
    {
      name: "Capys.app Perp Point Calculators",
      url: `${SITE_URL}/calculators`,
      generatedAt: new Date().toISOString(),
      disclaimer:
        "Defaults are editable research assumptions, not official tokenomics or financial advice.",
      calculators: Object.entries(PERPS_CALC).map(([slug, calculator]) => ({
        slug,
        name: calculator.name,
        defaultScenario: {
          fdvBillionsUsd: calculator.fdv,
          totalPoints: calculator.totalPoints,
          airdropAllocationPercent: calculator.airdrop,
        },
        url: `${SITE_URL}/calculators/${slug}-point-calculator`,
      })),
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    }
  )
}
