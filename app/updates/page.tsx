import type { Metadata } from "next"
import Link from "next/link"
import ToolHeader from "../components/ToolHeader"
import { LIVE_DATA_REFRESH_COPY, PERPS, SITE_URL } from "../data/perps"

export const revalidate = 86400

export const metadata: Metadata = {
  title: "Perp Research Updates & Changelog",
  description:
    "Follow Capys.app research updates, new perp market tools, referral-term reviews, calculator coverage, and funding screener improvements.",
  alternates: {
    canonical: "/updates",
  },
  openGraph: {
    title: "Capys.app Research Updates",
    description:
      "A public log of market tools, campaign reviews, calculators, and funding improvements.",
    url: `${SITE_URL}/updates`,
    siteName: "Capys.app",
    type: "article",
    images: ["/opengraph-image"],
  },
}

const updates = [
  {
    date: "July 6, 2026",
    category: "Design system",
    title: "Capys Terminal visual refresh",
    body: "Unified the site around a dark mint terminal system with denser tables, consistent surfaces, cleaner navigation, and stronger responsive behavior.",
    href: "/",
  },
  {
    date: "July 6, 2026",
    category: "Data freshness",
    title: "Live market refresh and safer routing",
    body: "Added recurring DefiLlama open-interest refreshes, clearer live-versus-reference labels, official trade destinations, and resilient market fallbacks.",
    href: "/markets",
  },
  {
    date: "July 5, 2026",
    category: "Market intelligence",
    title: "Perp Market Terminal",
    body: "Added a searchable perp market map with live DefiLlama open interest, volume rankings, chain filters, Capy routes, and local watchlists.",
    href: "/markets",
  },
  {
    date: "July 5, 2026",
    category: "Farming tools",
    title: "Cost, route, and comparison tools",
    body: "Added a fee and break-even calculator, personalized route finder, and side-by-side protocol comparison.",
    href: "/tools",
  },
  {
    date: "July 4, 2026",
    category: "Calculators and SEO",
    title: "Expanded dedicated point calculators",
    body: "Added protocol-specific calculator pages, logos, structured metadata, discovery feeds, and broader search coverage for perp point-value queries.",
    href: "/calculators",
  },
  {
    date: "July 4, 2026",
    category: "Research",
    title: "Perp farming guides and methodology",
    body: "Expanded project pages with practical plans, mistakes to avoid, calculator assumptions, research dates, and visible methodology.",
    href: "/methodology",
  },
  {
    date: "July 2, 2026",
    category: "Funding",
    title: "Funding screener recovery and workflow upgrade",
    body: "Hardened the Loris data fallback, added exchange controls, row limits, sorting, watchlists, shareable filters, and fee-adjusted opportunity estimates.",
    href: "/#funding",
  },
  {
    date: "June 2, 2026",
    category: "Campaign coverage",
    title: "Bulk, Hibachi, and referral lineup updates",
    body: "Added new campaign routes and calculators, reordered farming tiers, refreshed referral terms, and expanded protocol artwork.",
    href: "/#perps",
  },
  {
    date: "June 1, 2026",
    category: "Calculator coverage",
    title: "Calculator logos and new protocol presets",
    body: "Expanded calculator branding and presets so more perp campaigns could be estimated from dedicated pages.",
    href: "/calculators",
  },
]

export default function UpdatesPage() {
  return (
    <main className="capys-page min-h-screen px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <ToolHeader label="Research updates" />
        <header className="py-14 sm:py-20">
          <div className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/60">
            Public research log
          </div>
          <h1 className="mt-4 max-w-4xl text-5xl font-black leading-[0.96] tracking-tight sm:text-7xl">
            What changed on Capys.app.
          </h1>
          <p className="mt-6 max-w-3xl text-base leading-7 text-white/60 sm:text-lg">
            Product improvements, research reviews, and new market coverage.{" "}
            {LIVE_DATA_REFRESH_COPY}
          </p>
        </header>

        <section className="space-y-4">
          {updates.map((update) => (
            <article
              key={`${update.date}-${update.title}`}
              className="grid gap-4 rounded-3xl border border-white/10 bg-white/[0.035] p-6 md:grid-cols-[160px_1fr_auto] md:items-center"
            >
              <div>
                <div className="text-xs font-semibold text-cyan-200">
                  {update.date}
                </div>
                <div className="mt-2 text-[10px] uppercase tracking-[0.16em] text-white/35">
                  {update.category}
                </div>
              </div>
              <div>
                <h2 className="text-xl font-black">{update.title}</h2>
                <p className="mt-2 text-sm leading-6 text-white/52">
                  {update.body}
                </p>
              </div>
              <Link
                href={update.href}
                className="rounded-xl border border-white/10 px-4 py-3 text-center text-sm font-semibold text-white/65 transition hover:text-white"
              >
                Open →
              </Link>
            </article>
          ))}
        </section>

        <section className="mt-10 rounded-3xl border border-white/10 bg-white/[0.025] p-6">
          <h2 className="text-2xl font-black">Current referral coverage</h2>
          <div className="mt-5 flex flex-wrap gap-2">
            {PERPS.map((perp) => (
              <Link
                key={perp.slug}
                href={`/perps/${perp.slug}`}
                className="rounded-full border border-white/10 bg-white/[0.035] px-4 py-2 text-sm text-white/60 transition hover:border-cyan-300/30 hover:text-cyan-100"
              >
                {perp.name}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
