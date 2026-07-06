import type { Metadata } from "next"
import ToolHeader from "../components/ToolHeader"
import { PERPS, SITE_URL } from "../data/perps"
import CompareClient from "./CompareClient"

export const revalidate = 86400

export const metadata: Metadata = {
  title: "Compare Perp DEX Farming Routes",
  description:
    "Compare two perp DEXs side by side: referral terms, point boosts, fee discounts, farming mechanics, effort, cost profile, and calculator assumptions.",
  keywords: PERPS.flatMap((perp) => [
    `${perp.name} alternatives`,
    `${perp.name} comparison`,
  ]),
  alternates: {
    canonical: "/compare",
  },
  openGraph: {
    title: "Compare Perp DEXs | Capys.app",
    description:
      "Side-by-side referral terms, farming mechanics, costs, effort, and point scenarios.",
    url: `${SITE_URL}/compare`,
    siteName: "Capys.app",
    type: "website",
    images: ["/opengraph-image"],
  },
}

export default function ComparePage() {
  return (
    <main className="capys-page min-h-screen px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <ToolHeader label="Perp comparison" />
        <header className="py-12 sm:py-16">
          <div className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/60">
            Side-by-side research
          </div>
          <h1 className="mt-4 max-w-5xl text-5xl font-black leading-[0.96] tracking-tight sm:text-7xl">
            Compare two perp farming routes.
          </h1>
          <p className="mt-6 max-w-3xl text-base leading-7 text-white/60 sm:text-lg">
            Put referral terms, farming mechanics, effort, cost profile, and
            calculator assumptions next to each other before choosing a venue.
          </p>
        </header>
        <CompareClient />
      </div>
    </main>
  )
}
