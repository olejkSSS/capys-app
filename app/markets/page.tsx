import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { SITE_URL } from "../data/perps"
import MarketTerminal from "./MarketTerminal"

export const revalidate = 86400

export const metadata: Metadata = {
  title: "Perp DEX Rankings: Volume & Open Interest",
  description:
    "Explore perp DEX rankings by open interest, 24h volume, 7d volume, and 30d volume. Search chains, save a watchlist, and open Capy referral routes.",
  keywords: [
    "perp dex list",
    "perp dex rankings",
    "perp dex by volume",
    "perp dex volume rankings",
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
  const faq = [
    {
      question: "Why does Capys show fewer live OI rows than DefiLlama perps?",
      answer:
        "DefiLlama maintains separate volume-adapter, open-interest, and protocol datasets. Capys uses the free live open-interest feed for live OI rows and labels volume snapshot coverage separately, so unavailable metrics are not presented as zero.",
    },
    {
      question: "How do I rank perp DEXs by volume?",
      answer:
        "Select a 24-hour, 7-day, or 30-day volume column in the table. Snapshot volume is dated in the interface; live volume is enabled when the official DefiLlama Pro feed is configured.",
    },
    {
      question: "Does a missing value mean zero?",
      answer:
        "No. A dash means that metric is unavailable in the current source. This prevents inactive or uncovered venues from being ranked as if they reported zero.",
    },
  ]
  const jsonLd = [
    {
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
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faq.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: { "@type": "Answer", text: item.answer },
      })),
    },
  ]

  return (
    <main className="capys-page min-h-screen px-4 py-6 text-white sm:px-6 lg:px-8">
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
              href="/"
              className="rounded-xl border border-white/10 bg-white/[0.035] px-4 py-2 text-sm font-semibold text-white/70 transition hover:border-cyan-300/30 hover:text-white"
            >
              ← Home
            </Link>
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
            Perp DEX rankings by volume and open interest.
          </h1>
          <p className="mt-6 max-w-3xl text-base leading-7 text-white/60 sm:text-lg">
            Search the perp market, compare open interest and trading volume,
            filter by chain, build a watchlist, and jump into Capy research or
            the best available referral route.
          </p>
          <div className="mt-7 flex flex-wrap gap-3 text-sm">
            <Link
              href="/perp-dex-list"
              className="rounded-xl border border-cyan-300/25 bg-cyan-300/[0.08] px-4 py-3 font-semibold text-cyan-100"
            >
              Browse perp DEX list
            </Link>
            <Link
              href="/tools/route-finder"
              className="rounded-xl border border-white/10 px-4 py-3 font-semibold text-white/65 transition hover:text-white"
            >
              Find a farming route
            </Link>
          </div>
        </header>

        <MarketTerminal />

        <section className="mt-16">
          <div className="text-xs uppercase tracking-[0.22em] text-white/35">
            Perp market FAQ
          </div>
          <h2 className="mt-3 text-3xl font-black">How to read the rankings</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {faq.map((item) => (
              <article
                key={item.question}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
              >
                <h3 className="font-bold">{item.question}</h3>
                <p className="mt-3 text-sm leading-6 text-white/50">
                  {item.answer}
                </p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
