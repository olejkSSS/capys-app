import type { Metadata } from "next"
import Link from "next/link"
import ToolHeader from "../components/ToolHeader"
import { SITE_URL } from "../data/perps"

export const metadata: Metadata = {
  title: "Perp DEX Farming Tools",
  description:
    "Use free perp DEX tools to calculate farming costs, find a suitable farming route, compare protocols, estimate point value, and scan funding.",
  alternates: {
    canonical: "/tools",
  },
  openGraph: {
    title: "Perp DEX Farming Tools | Capys.app",
    description:
      "Cost calculators, route finder, protocol comparison, point estimates, and live funding tools.",
    url: `${SITE_URL}/tools`,
    siteName: "Capys.app",
    type: "website",
    images: ["/opengraph-image"],
  },
}

const tools = [
  {
    href: "/tools/farming-cost-calculator",
    eyebrow: "Fees and break-even",
    title: "Farming Cost Calculator",
    body: "Estimate total fees, discounts, refback, cost per point, and break-even point value.",
  },
  {
    href: "/tools/route-finder",
    eyebrow: "Personalized shortlist",
    title: "Where Should I Farm?",
    body: "Match capital, effort, and goals to practical perp routes with clear reasoning.",
  },
  {
    href: "/compare",
    eyebrow: "Side-by-side research",
    title: "Compare Two Perps",
    body: "Compare boosts, farming mechanics, effort, cost profile, tiers, and calculators.",
  },
  {
    href: "/calculators",
    eyebrow: "Points to dollars",
    title: "Point Calculators",
    body: "Stress-test FDV, allocation, total points, and personal point balances.",
  },
  {
    href: "/#funding",
    eyebrow: "Live spreads",
    title: "Funding Screener",
    body: "Scan cross-exchange funding opportunities with watchlists and fee-adjusted estimates.",
  },
  {
    href: "/markets",
    eyebrow: "Market intelligence",
    title: "Perp Market Terminal",
    body: "Rank protocols by open interest and volume, filter chains, and save a watchlist.",
  },
]

export default function ToolsPage() {
  return (
    <main className="min-h-screen bg-[#050814] px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <ToolHeader label="Perp farming toolbox" />

        <header className="py-14 sm:py-20">
          <div className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/60">
            Perp farming toolbox
          </div>
          <h1 className="mt-4 max-w-4xl text-5xl font-black leading-[0.96] tracking-tight sm:text-7xl">
            Make the farming decision before paying the fees.
          </h1>
          <p className="mt-6 max-w-3xl text-base leading-7 text-white/60 sm:text-lg">
            Compare markets, calculate the real cost of activity, model point
            value, and find a route that matches your capital and effort.
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="group rounded-3xl border border-white/10 bg-white/[0.035] p-6 transition hover:-translate-y-0.5 hover:border-cyan-300/35 hover:bg-white/[0.06]"
            >
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200/55">
                {tool.eyebrow}
              </div>
              <h2 className="mt-4 text-2xl font-black">{tool.title}</h2>
              <p className="mt-3 text-sm leading-6 text-white/52">{tool.body}</p>
              <div className="mt-6 text-sm font-semibold text-cyan-200">
                Open tool →
              </div>
            </Link>
          ))}
        </section>
      </div>
    </main>
  )
}
