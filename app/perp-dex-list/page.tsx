import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { PERPS, SITE_URL } from "../data/perps"
import ToolHeader from "../components/ToolHeader"

export const metadata: Metadata = {
  title: "Perp DEX List: Rankings, Points & Referral Terms",
  description:
    "Browse a curated perp DEX list, compare farming terms, and open live perp DEX rankings by volume and open interest. Includes point calculators, airdrop guides, and referral routes.",
  keywords: [
    "perp dex list",
    "perpetual dex list",
    "perp dex rankings",
    "perp dex by volume",
    "perp dex volume rankings",
    "top perp dexes",
    "best perp dex",
    "perp dex airdrops",
    "perp dex referral codes",
  ],
  alternates: { canonical: "/perp-dex-list" },
  openGraph: {
    title: "Perp DEX List | Capys.app",
    description:
      "A research-first directory of perp DEXs with market rankings, farming terms, calculators, and referral routes.",
    url: `${SITE_URL}/perp-dex-list`,
    siteName: "Capys.app",
    type: "website",
    images: ["/opengraph-image"],
  },
}

const faq = [
  {
    question: "What is a perp DEX?",
    answer:
      "A perpetual DEX is a trading venue for perpetual futures. Traders can take leveraged long or short positions without a fixed expiry date.",
  },
  {
    question: "Where can I rank perp DEXs by volume?",
    answer:
      "The Capys market terminal ranks protocols by available 24-hour volume, 7-day volume, 30-day volume, and live open interest.",
  },
  {
    question: "Why can protocol counts differ between market trackers?",
    answer:
      "Volume adapters, open-interest feeds, protocol directories, child deployments, and inactive venues are separate datasets. Capys labels live and snapshot coverage instead of treating missing metrics as zero.",
  },
]

export default function PerpDexListPage() {
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "Perp DEX List",
      url: `${SITE_URL}/perp-dex-list`,
      mainEntity: {
        "@type": "ItemList",
        numberOfItems: PERPS.length,
        itemListElement: PERPS.map((perp, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: perp.name,
          url: `${SITE_URL}/perps/${perp.slug}`,
        })),
      },
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
    <main className="min-h-screen bg-[#050814] px-4 py-6 text-white sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-6xl">
        <ToolHeader label="Perp DEX directory" />

        <header className="py-14 sm:py-20">
          <div className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/60">
            Perp market directory
          </div>
          <h1 className="mt-4 max-w-5xl text-5xl font-black leading-[0.96] sm:text-7xl">
            Perp DEX list, without the spreadsheet mess.
          </h1>
          <p className="mt-6 max-w-3xl text-base leading-7 text-white/60 sm:text-lg">
            Start with a curated list of perp DEX farming routes, then open the
            market terminal for volume and open-interest rankings. Missing data
            stays missing rather than being displayed as zero.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/markets"
              className="rounded-xl bg-cyan-300 px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-cyan-200"
            >
              View volume rankings
            </Link>
            <Link
              href="/airdrops"
              className="rounded-xl border border-white/12 px-5 py-3 text-sm font-semibold text-white/70 transition hover:text-white"
            >
              Browse campaigns
            </Link>
          </div>
        </header>

        <section aria-labelledby="directory-title">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <div className="text-xs uppercase tracking-[0.22em] text-white/35">
                Curated routes
              </div>
              <h2 id="directory-title" className="mt-2 text-3xl font-black">
                Research-ready perp DEXs
              </h2>
            </div>
            <span className="text-sm text-white/45">
              {PERPS.length} reviewed venues
            </span>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-2">
            {PERPS.map((perp) => (
              <Link
                key={perp.slug}
                href={`/perps/${perp.slug}`}
                className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.035] p-4 transition hover:border-cyan-300/35 hover:bg-cyan-300/[0.055]"
              >
                <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-black/20">
                  <Image
                    src={perp.logo}
                    alt={`${perp.name} logo`}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <strong className="text-white">{perp.name}</strong>
                    <span className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] font-bold text-white/45">
                      {perp.tier}
                    </span>
                  </span>
                  <span className="mt-1 block truncate text-sm text-white/45">
                    {perp.boost}
                  </span>
                </span>
                <span className="text-cyan-200 transition group-hover:translate-x-1">
                  &rarr;
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-16 grid gap-4 md:grid-cols-3">
          {faq.map((item) => (
            <article
              key={item.question}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
            >
              <h2 className="font-bold text-white">{item.question}</h2>
              <p className="mt-3 text-sm leading-6 text-white/50">
                {item.answer}
              </p>
            </article>
          ))}
        </section>

        <footer className="py-14 text-sm text-white/40">
          Market metrics change continuously. Verify current protocol terms
          before trading.
        </footer>
      </div>
    </main>
  )
}
