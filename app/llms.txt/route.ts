import { PERPS_CALC, SITE_URL } from "../data/perps"

export const dynamic = "force-static"

export function GET() {
  const calculatorNames = Object.values(PERPS_CALC)
    .map((calculator) => calculator.name)
    .join(", ")

  const content = `# Capys.app

> Capys.app is a perp DEX farming research hub with referral terms, editable point-value calculators, a live funding-rate screener, and a curated airdrop campaign board.

## Primary pages
- Home and referral tier list: ${SITE_URL}
- Perp point calculator directory: ${SITE_URL}/calculators
- Perp airdrop and points campaigns: ${SITE_URL}/airdrops
- Funding-rate screener: ${SITE_URL}/funding-rates
- Perp DEX volume and open-interest rankings: ${SITE_URL}/markets
- Curated perp DEX list and research directory: ${SITE_URL}/perp-dex-list
- Perp farming tool directory: ${SITE_URL}/tools
- Farming cost and break-even calculator: ${SITE_URL}/tools/farming-cost-calculator
- Personalized perp route finder: ${SITE_URL}/tools/route-finder
- Side-by-side perp comparison: ${SITE_URL}/compare
- Research updates and changelog: ${SITE_URL}/updates
- Research methodology and data sources: ${SITE_URL}/methodology
- Project listings and campaign updates: ${SITE_URL}/partners

## Structured data
- Perp DEX directory JSON: ${SITE_URL}/perp-dexes.json
- Calculator directory JSON: ${SITE_URL}/calculators.json
- Perp market data JSON: ${SITE_URL}/api/perp-market
- XML sitemap: ${SITE_URL}/sitemap.xml

## Calculator coverage
${calculatorNames}

## Important
Calculator defaults are editable research assumptions. Funding rates, point programs, eligibility rules, referral terms, and token allocations can change. Capys.app does not provide financial advice.
`

  return new Response(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  })
}
