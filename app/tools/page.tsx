import type { Metadata } from "next"
import Link from "next/link"
import ToolHeader from "../components/ToolHeader"
import { SITE_URL } from "../data/perps"

export const revalidate = 86400

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
    metric: "Fees",
  },
  {
    href: "/tools/route-finder",
    eyebrow: "Personalized shortlist",
    title: "Where Should I Farm?",
    body: "Match capital, effort, and goals to practical perp routes with clear reasoning.",
    metric: "Route",
  },
  {
    href: "/compare",
    eyebrow: "Side-by-side research",
    title: "Compare Two Perps",
    body: "Compare boosts, farming mechanics, effort, cost profile, tiers, and calculators.",
    metric: "Compare",
  },
  {
    href: "/calculators",
    eyebrow: "Points to dollars",
    title: "Point Calculators",
    body: "Stress-test FDV, allocation, total points, and personal point balances.",
    metric: "Points",
  },
  {
    href: "/#funding",
    eyebrow: "Live spreads",
    title: "Funding Screener",
    body: "Scan cross-exchange funding opportunities with watchlists and fee-adjusted estimates.",
    metric: "Live",
  },
  {
    href: "/markets",
    eyebrow: "Market intelligence",
    title: "Perp Market Terminal",
    body: "Rank protocols by open interest and volume, filter chains, and save a watchlist.",
    metric: "119",
  },
]

export default function ToolsPage() {
  return (
    <main className="capys-page min-h-screen px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <ToolHeader label="Perp farming toolbox" />

        <header className="py-14 sm:py-20">
          <div className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/60">
            Perp farming toolbox
          </div>
          <div className="grid gap-8 lg:grid-cols-[1fr_340px] lg:items-end">
            <div>
              <h1 className="mt-4 max-w-4xl text-5xl font-black leading-[0.96] tracking-tight sm:text-7xl">
                Make the farming decision before paying the fees.
              </h1>
              <p className="mt-6 max-w-3xl text-base leading-7 text-white/60 sm:text-lg">
                Compare markets, calculate the real cost of activity, model
                point value, and find a route that matches your capital and
                effort.
              </p>
            </div>
            <div className="rounded-3xl border border-cyan-300/15 bg-[#07101d]/70 p-5 shadow-2xl shadow-black/20 backdrop-blur-xl">
              <div className="text-xs uppercase tracking-[0.22em] text-cyan-100/55">
                Toolbox status
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                {[
                  ["6", "tools"],
                  ["Live", "funding"],
                  ["Free", "access"],
                ].map(([value, label]) => (
                  <div
                    key={label}
                    className="rounded-2xl border border-white/10 bg-white/[0.035] p-3"
                  >
                    <div className="text-xl font-black text-white">{value}</div>
                    <div className="mt-1 text-[10px] uppercase tracking-[0.16em] text-white/35">
                      {label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool, index) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="group relative overflow-hidden rounded-3xl border border-white/10 bg-[#08111f]/72 p-6 shadow-2xl shadow-black/15 transition hover:-translate-y-0.5 hover:border-cyan-300/35 hover:bg-[#0b1726]/88"
            >
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/60 to-transparent opacity-0 transition group-hover:opacity-100" />
              <div className="mb-8 flex items-start justify-between gap-4">
                <div className="rounded-2xl border border-cyan-300/15 bg-cyan-300/[0.07] px-3 py-2 text-xs font-black uppercase tracking-[0.18em] text-cyan-100">
                  {tool.metric}
                </div>
                <div className="text-xs font-semibold text-white/25">
                  0{index + 1}
                </div>
              </div>
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200/55">
                {tool.eyebrow}
              </div>
              <h2 className="mt-4 text-2xl font-black">{tool.title}</h2>
              <p className="mt-3 min-h-[72px] text-sm leading-6 text-white/52">
                {tool.body}
              </p>
              <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1.5 text-sm font-black text-cyan-100 transition group-hover:border-cyan-300/35 group-hover:bg-cyan-300 group-hover:text-slate-950">
                <span>Open tool</span>
                <span aria-hidden="true">→</span>
              </div>
            </Link>
          ))}
        </section>
      </div>
    </main>
  )
}
