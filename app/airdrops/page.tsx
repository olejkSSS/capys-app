import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import {
  CONTENT_REVIEWED_AT,
  PERP_GUIDES,
  PERPS,
  PERPS_CALC,
  SITE_URL,
} from "../data/perps"

export const metadata: Metadata = {
  title: "Perp Airdrop & Points Campaigns",
  description:
    "Compare curated perp DEX points campaigns, referral boosts, fee discounts, refback terms, and farming routes across Variational, TxFlow, Hibachi, Bulk, Extended, Pacifica, Meridian, Reya and more.",
  keywords: [
    "perp airdrops",
    "perp points campaigns",
    "perp dex airdrop farming",
    "perp referral boosts",
    "best perp airdrops",
    "crypto points campaigns",
  ],
  alternates: {
    canonical: "/airdrops",
  },
  openGraph: {
    title: "Perp Airdrop & Points Campaigns | Capys.app",
    description:
      "Compare points boosts, fee discounts, refback terms, and farming routes across perp DEX projects.",
    url: `${SITE_URL}/airdrops`,
    siteName: "Capys.app",
    type: "website",
    images: ["/opengraph-image"],
  },
}

function getCampaignType(slug: string) {
  if (slug === "bulk") return "Deposit campaign"
  if (slug === "risex") return "Private access"
  if (slug === "txflow") return "Fee discount"
  return "Points and trading"
}

export default function AirdropsPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Perp Airdrop & Points Campaigns",
    url: `${SITE_URL}/airdrops`,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: PERPS.length,
      itemListElement: PERPS.map((perp, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: `${perp.name} farming terms`,
        url: `${SITE_URL}/perps/${perp.slug}`,
      })),
    },
  }

  return (
    <main className="min-h-screen bg-[#050814] px-4 py-8 text-white sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-6xl">
        <nav className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3">
          <Link href="/" className="flex items-center gap-3">
            <span className="relative h-10 w-10 overflow-hidden rounded-xl border border-cyan-300/25">
              <Image src="/icon.png" alt="Capys.app" fill sizes="40px" />
            </span>
            <span>
              <span className="block text-sm font-semibold tracking-[0.24em]">
                CAPYS
              </span>
              <span className="block text-xs text-white/45">
                Airdrop campaign board
              </span>
            </span>
          </Link>

          <div className="flex gap-2">
            <Link
              href="/methodology"
              className="hidden rounded-xl border border-white/10 px-4 py-2 text-sm text-white/65 transition hover:text-white sm:inline-flex"
            >
              Methodology
            </Link>
            <Link
              href="/calculators"
              className="rounded-xl border border-white/10 px-4 py-2 text-sm text-white/65 transition hover:text-white"
            >
              Calculators
            </Link>
            <Link
              href="/funding-rates"
              className="rounded-xl border border-cyan-300/25 bg-cyan-300/10 px-4 py-2 text-sm font-semibold text-cyan-100"
            >
              Funding
            </Link>
          </div>
        </nav>

        <header className="py-14 sm:py-20">
          <div className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-200/65">
            Curated perp farming routes
          </div>
          <h1 className="mt-4 max-w-5xl text-5xl font-black leading-[0.96] tracking-tight sm:text-7xl">
            Perp airdrop and points campaigns
          </h1>
          <p className="mt-6 max-w-3xl text-base leading-7 text-white/60 sm:text-lg">
            Compare how each venue rewards activity, then open the best
            available Capys route. Campaign rules change quickly, so verify
            current eligibility and terms on the venue before depositing or
            trading.
          </p>
        </header>

        <section className="grid gap-4">
          {PERPS.map((perp) => {
            const hasCalculator = perp.slug in PERPS_CALC

            return (
              <article
                key={perp.slug}
                className="grid gap-4 rounded-3xl border border-white/10 bg-white/[0.035] p-5 md:grid-cols-[64px_1fr_220px_auto] md:items-center"
              >
                <Image
                  src={perp.logo}
                  alt={`${perp.name} logo`}
                  width={56}
                  height={56}
                  className="rounded-xl border border-white/10"
                />

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-black">{perp.name}</h2>
                    <span className="rounded-full border border-white/10 px-2 py-1 text-[10px] uppercase tracking-[0.16em] text-white/45">
                      {getCampaignType(perp.slug)}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-white/48">
                    Best for {PERP_GUIDES[perp.slug].bestFor.toLowerCase()} · {perp.farm}
                  </p>
                </div>

                <div className="rounded-2xl border border-emerald-300/20 bg-emerald-300/10 px-4 py-3 text-sm font-semibold text-emerald-200">
                  {perp.boost}
                </div>

                <div className="flex flex-wrap gap-2 md:justify-end">
                  {hasCalculator && (
                    <Link
                      href={`/calculators/${perp.slug}-point-calculator`}
                      className="rounded-xl border border-white/10 px-4 py-3 text-sm text-white/65 transition hover:text-white"
                    >
                      Calculator
                    </Link>
                  )}
                  <a
                    href={perp.ref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-xl bg-cyan-300 px-4 py-3 text-sm font-black text-slate-950 transition hover:bg-cyan-200"
                  >
                    Open route ↗
                  </a>
                </div>
              </article>
            )
          })}
        </section>

        <aside className="mt-10 rounded-2xl border border-yellow-300/15 bg-yellow-300/[0.055] p-5 text-sm leading-6 text-white/55">
          Campaign notes last reviewed {CONTENT_REVIEWED_AT}. Capys.app provides
          research tools and referral routing, not financial advice. Points,
          eligibility, token allocations, and referral terms may change without
          notice.
        </aside>
      </div>
    </main>
  )
}
