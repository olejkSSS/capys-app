import type { Metadata } from "next"
import ToolHeader from "../../components/ToolHeader"
import { SITE_URL } from "../../data/perps"
import FarmingCostClient from "./FarmingCostClient"

export const metadata: Metadata = {
  title: "Perp Farming Cost & Break-Even Calculator",
  description:
    "Calculate perp DEX farming fees, discounts, refback, cost per point, break-even point value, and bear/base/bull ROI scenarios.",
  alternates: {
    canonical: "/tools/farming-cost-calculator",
  },
  openGraph: {
    title: "Perp Farming Cost Calculator | Capys.app",
    description:
      "Estimate net farming costs, break-even point value, and scenario ROI after fee discounts and refback.",
    url: `${SITE_URL}/tools/farming-cost-calculator`,
    siteName: "Capys.app",
    type: "website",
    images: ["/opengraph-image"],
  },
}

export default function FarmingCostCalculatorPage() {
  return (
    <main className="min-h-screen bg-[#050814] px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <ToolHeader label="Farming cost calculator" />
        <header className="py-12 sm:py-16">
          <div className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-200/65">
            Fees before hype
          </div>
          <h1 className="mt-4 max-w-5xl text-5xl font-black leading-[0.96] tracking-tight sm:text-7xl">
            Calculate what your perp farm really costs.
          </h1>
          <p className="mt-6 max-w-3xl text-base leading-7 text-white/60 sm:text-lg">
            Model maker and taker fees, discounts, refback, expected points, and
            the point value needed to break even.
          </p>
        </header>
        <FarmingCostClient />
      </div>
    </main>
  )
}
