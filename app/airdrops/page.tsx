import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { LIVE_DATA_REFRESH_COPY, PERPS, SITE_URL } from "../data/perps"
import CampaignBoard from "./CampaignBoard"

export const revalidate = 86400

export const metadata: Metadata = {
  title: "Perp Airdrop & Points Campaigns",
  description:
    "Search curated perp DEX points campaigns, referral boosts, fee discounts, refback terms, and farming routes across leading and emerging venues.",
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
      "Search points boosts, fee discounts, refback terms, and farming routes across perp DEX projects.",
    url: `${SITE_URL}/airdrops`,
    siteName: "Capys.app",
    type: "website",
    images: ["/opengraph-image"],
  },
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
    <main className="capys-page min-h-screen px-4 py-8 text-white sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-6xl">
        <nav className="capys-nav flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3">
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

          <div className="flex flex-wrap gap-2">
            <Link
              href="/markets"
              className="rounded-xl border border-white/10 px-4 py-2 text-sm text-white/65 transition hover:text-white"
            >
              Markets
            </Link>
            <Link
              href="/tools"
              className="rounded-xl border border-white/10 px-4 py-2 text-sm text-white/65 transition hover:text-white"
            >
              Tools
            </Link>
            <Link
              href="/#funding"
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
            Search campaign mechanics, compare available terms, and open the
            related guide or calculator. Rules change quickly, so verify current
            eligibility on the venue before depositing or trading.
          </p>
        </header>

        <CampaignBoard />

        <aside className="mt-10 rounded-2xl border border-yellow-300/15 bg-yellow-300/[0.055] p-5 text-sm leading-6 text-white/55">
          {LIVE_DATA_REFRESH_COPY} Capys.app provides research tools and
          referral routing, not financial advice. Points, eligibility, token
          allocations, and referral terms may change without notice.
        </aside>
      </div>
    </main>
  )
}
