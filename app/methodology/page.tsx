import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { CONTENT_REVIEWED_AT, LIVE_DATA_REFRESH_COPY, SITE_URL } from "../data/perps"

export const revalidate = 86400

export const metadata: Metadata = {
  title: "Perp Farming Methodology & Data Sources",
  description:
    "See how Capys.app reviews perp DEX referral terms, farming routes, calculator assumptions, tier placement, and funding data freshness.",
  alternates: {
    canonical: "/methodology",
  },
  openGraph: {
    title: "Capys.app Research Methodology",
    description:
      "Transparent sources, editable assumptions, funding freshness, and editorial criteria for perp DEX farming research.",
    url: `${SITE_URL}/methodology`,
    siteName: "Capys.app",
    type: "article",
    images: ["/opengraph-image"],
  },
}

const sections = [
  {
    number: "01",
    title: "Referral terms",
    body: "Codes, boosts, discounts, and refback are recorded from project routes and campaign material, then presented visibly instead of being hidden behind a button. Users should confirm the final terms on the venue because projects can change them without notice.",
  },
  {
    number: "02",
    title: "Tier placement",
    body: "Tiers are editorial, not a promise of returns. Capys.app considers the usefulness of published benefits, how users earn rewards, accessibility, estimated activity costs, and how clearly a campaign explains its rules.",
  },
  {
    number: "03",
    title: "Calculator assumptions",
    body: "FDV, allocation, and total points are scenario inputs. They are editable because most projects have not published complete tokenomics. Calculator output is an estimate, not a token price prediction.",
  },
  {
    number: "04",
    title: "Funding data",
    body: "The funding screener uses Loris Tools data, displays its update state, and keeps a cached fallback for temporary upstream failures. Funding spreads are not guaranteed profit and can change before a trade is opened.",
  },
]

export default function MethodologyPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Capys.app perp farming research methodology",
    description:
      "How Capys.app reviews referral terms, farming routes, calculator assumptions, and funding data.",
    dateModified: "2026-07-06",
    url: `${SITE_URL}/methodology`,
    author: {
      "@type": "Person",
      name: "Capy",
      url: "https://x.com/capy_onchain",
    },
  }

  return (
    <main className="capys-page min-h-screen px-4 py-8 text-white sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-5xl">
        <nav className="capys-nav flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3">
          <Link href="/" className="flex items-center gap-3">
            <span className="relative h-10 w-10 overflow-hidden rounded-xl border border-cyan-300/25">
              <Image src="/icon.png" alt="Capys.app" fill sizes="40px" />
            </span>
            <span className="text-sm font-semibold tracking-[0.24em]">CAPYS</span>
          </Link>
          <Link
            href="/partners"
            className="rounded-xl border border-cyan-300/25 bg-cyan-300/10 px-4 py-2 text-sm font-semibold text-cyan-100"
          >
            Submit an update
          </Link>
        </nav>

        <header className="py-14 sm:py-20">
          <div className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/60">
            Research methodology
          </div>
          <h1 className="mt-4 max-w-4xl text-5xl font-black leading-[0.96] tracking-tight sm:text-7xl">
            Useful research needs visible assumptions.
          </h1>
          <p className="mt-6 max-w-3xl text-base leading-7 text-white/60 sm:text-lg">
            Capys.app helps users compare routes, but it does not manufacture
            certainty. Here is what the site checks, what remains an estimate,
            and where every user should verify the final details.
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-2">
          {sections.map((section) => (
            <article
              key={section.number}
              className="rounded-3xl border border-white/10 bg-white/[0.035] p-6"
            >
              <div className="text-sm font-black text-cyan-300">{section.number}</div>
              <h2 className="mt-4 text-2xl font-black">{section.title}</h2>
              <p className="mt-3 text-sm leading-6 text-white/55">{section.body}</p>
            </article>
          ))}
        </section>

        <section className="mt-8 rounded-3xl border border-emerald-300/15 bg-emerald-300/[0.055] p-6 sm:p-8">
          <div className="grid gap-6 sm:grid-cols-3">
            <div>
              <div className="text-xs uppercase tracking-[0.18em] text-white/35">
                Freshness model
              </div>
              <div className="mt-2 font-bold">{CONTENT_REVIEWED_AT}</div>
              <p className="mt-2 text-xs leading-5 text-white/45">
                {LIVE_DATA_REFRESH_COPY}
              </p>
            </div>
            <div>
              <div className="text-xs uppercase tracking-[0.18em] text-white/35">
                Funding source
              </div>
              <a
                href="https://loris.tools"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex font-bold text-cyan-200"
              >
                Loris Tools →
              </a>
            </div>
            <div>
              <div className="text-xs uppercase tracking-[0.18em] text-white/35">
                Corrections
              </div>
              <a
                href="https://t.me/olejk_2k"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex font-bold text-cyan-200"
              >
                Message Capy →
              </a>
            </div>
          </div>
        </section>

        <aside className="mt-8 rounded-2xl border border-yellow-300/15 bg-yellow-300/[0.055] p-5 text-sm leading-6 text-white/55">
          Estimates use public information, editable assumptions, and personal
          research. Nothing on Capys.app is financial advice. Referral links may
          benefit Capys.app, while user-facing terms remain visible.
        </aside>
      </div>
    </main>
  )
}
