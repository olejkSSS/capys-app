import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { SITE_URL } from "../data/perps"
import MarketTerminal from "./MarketTerminal"

export const metadata: Metadata = {
  title: "Perp DEX Rankings: Volume & Open Interest",
  description:
    "Explore perp DEX rankings by open interest, 24h volume, 7d volume, and 30d volume. Search chains, save a watchlist, and open Capy referral routes.",
  keywords: [
    "perp dex rankings",
    "perp dex volume",
    "perp dex open interest",
    "perpetual dex market share",
    "top perp dexes",
    "perp market dashboard",
  ],
  alternates: {
    canonical: "/markets",
  },
  openGraph: {
    title: "Perp DEX Market Terminal | Capys.app",
    description:
      "Rank perp protocols by volume and open interest, filter chains, and open the best available route.",
    url: `${SITE_URL}/markets`,
    siteName: "Capys.app",
    type: "website",
    images: ["/opengraph-image"],
  },
}

export default function MarketsPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: "Perp DEX Market Rankings",
    description:
      "Perpetual DEX market rankings with open interest and volume metrics.",
    url: `${SITE_URL}/markets`,
    creator: {
      "@type": "Organization",
      name: "Capys.app",
      url: SITE_URL,
    },
    isBasedOn: "https://defillama.com/perps",
  }

  return (
    <main className="min-h-screen bg-[#050814] px-4 py-6 text-white sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-[1600px]">
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
                Perp market terminal
              </span>
            </span>
          </Link>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/airdrops"
              className="rounded-xl border border-white/10 px-4 py-2 text-sm text-white/60 transition hover:text-white"
            >
              Campaigns
            </Link>
            <Link
              href="/calculators"
              className="rounded-xl border border-white/10 px-4 py-2 text-sm text-white/60 transition hover:text-white"
            >
              Calculators
            </Link>
            <Link
              href="/#funding"
              className="rounded-xl border border-white/10 px-4 py-2 text-sm text-white/60 transition hover:text-white"
            >
              Funding
            </Link>
          </div>
        </nav>

        <header className="py-12 sm:py-16">
          <div className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/60">
            Perp market intelligence
          </div>
          <h1 className="mt-4 max-w-5xl text-5xl font-black leading-[0.96] tracking-tight sm:text-7xl">
            The market map for perpetual DEXs.
          </h1>
          <p className="mt-6 max-w-3xl text-base leading-7 text-white/60 sm:text-lg">
            Search the perp market, compare open interest and trading volume,
            filter by chain, build a watchlist, and jump into Capy research or
            the best available referral route.
          </p>
        </header>

        <MarketTerminal />
      </div>
    </main>
  )
}
