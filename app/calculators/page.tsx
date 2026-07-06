import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { PERP_CALC_LOGOS, PERPS, PERPS_CALC, SITE_URL } from "../data/perps"

export const revalidate = 86400

export const metadata: Metadata = {
  title: "Perp Point Calculators",
  description:
    "Browse dedicated point and airdrop value calculators for Variational, TxFlow, Hibachi, Extended, Meridian, Evedex, GMTrade, TurboFlow, Dango, HotStuff and more perp DEX projects.",
  keywords: [
    "perp point calculators",
    "perp points value calculator",
    "perp airdrop calculator",
    "perp dex points calculator",
    "crypto points to dollars",
    ...Object.values(PERPS_CALC).flatMap((calculator) => [
      `${calculator.name} point calculator`,
      `${calculator.name} points calculator`,
      `${calculator.name} airdrop calculator`,
    ]),
  ],
  alternates: {
    canonical: "/calculators",
  },
  openGraph: {
    title: "Perp Point Calculators | Capys.app",
    description:
      "Editable point-value and airdrop scenario calculators for leading and emerging perp DEX projects.",
    url: `${SITE_URL}/calculators`,
    siteName: "Capys.app",
    type: "website",
    images: ["/opengraph-image"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Perp Point Calculators | Capys.app",
    description:
      "Estimate perp points value with editable FDV, supply, and allocation assumptions.",
    creator: "@capy_onchain",
    images: ["/opengraph-image"],
  },
}

const calculators = Object.entries(PERPS_CALC).map(([slug, calculator]) => {
  const listedPerp = PERPS.find((perp) => perp.slug === slug)

  return {
    slug,
    name: calculator.name,
    logo:
      listedPerp?.logo ??
      PERP_CALC_LOGOS[slug as keyof typeof PERPS_CALC] ??
      "/icon.png",
  }
})

const faq = [
  {
    question: "How is a perp point value estimated?",
    answer:
      "The calculator multiplies the assumed FDV by the airdrop allocation, then divides that pool by total points supply.",
  },
  {
    question: "Are the default values official?",
    answer:
      "No. Defaults are editable scenario assumptions for research, not official tokenomics, prices, or financial advice.",
  },
  {
    question: "Can I compare different FDV scenarios?",
    answer:
      "Yes. Change FDV, total points, allocation, and your own points to model conservative or aggressive outcomes.",
  },
]

export default function CalculatorsPage() {
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "Perp Point Calculators",
      url: `${SITE_URL}/calculators`,
      description:
        "Dedicated point-value and airdrop scenario calculators for perp DEX projects.",
      mainEntity: {
        "@type": "ItemList",
        numberOfItems: calculators.length,
        itemListElement: calculators.map((calculator, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: `${calculator.name} Point Calculator`,
          url: `${SITE_URL}/calculators/${calculator.slug}-point-calculator`,
        })),
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faq.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer,
        },
      })),
    },
  ]

  return (
    <main className="capys-page min-h-screen px-4 py-8 text-white sm:px-6 lg:px-8">
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
                Perp calculator directory
              </span>
            </span>
          </Link>

          <div className="flex gap-2">
            <Link
              href="/funding-rates"
              className="rounded-xl border border-white/10 px-4 py-2 text-sm text-white/65 transition hover:text-white"
            >
              Funding rates
            </Link>
            <Link
              href="/#calculator"
              className="rounded-xl border border-cyan-300/25 bg-cyan-300/10 px-4 py-2 text-sm font-semibold text-cyan-100"
            >
              Main calculator
            </Link>
          </div>
        </nav>

        <header className="py-14 sm:py-20">
          <div className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/60">
            {calculators.length} dedicated calculators
          </div>
          <h1 className="mt-4 max-w-4xl text-5xl font-black leading-[0.96] tracking-tight sm:text-7xl">
            Perp point calculators
          </h1>
          <p className="mt-6 max-w-3xl text-base leading-7 text-white/60 sm:text-lg">
            Estimate potential point value with editable FDV, total points
            supply, token allocation, and personal balance assumptions.
          </p>
        </header>

        <section aria-labelledby="calculator-list">
          <h2 id="calculator-list" className="sr-only">
            All perp point calculators
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {calculators.map((calculator) => (
              <Link
                key={calculator.slug}
                href={`/calculators/${calculator.slug}-point-calculator`}
                className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.035] p-4 transition hover:-translate-y-0.5 hover:border-cyan-300/35 hover:bg-white/[0.065]"
              >
                <Image
                  src={calculator.logo}
                  alt={`${calculator.name} logo`}
                  width={48}
                  height={48}
                  className="rounded-xl border border-white/10"
                />
                <span className="min-w-0">
                  <span className="block font-bold text-white">
                    {calculator.name}
                  </span>
                  <span className="mt-1 block text-sm text-white/45 transition group-hover:text-cyan-100/70">
                    Point value calculator →
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-14 grid gap-4 lg:grid-cols-3">
          {faq.map((item) => (
            <article
              key={item.question}
              className="rounded-2xl border border-white/10 bg-white/[0.035] p-5"
            >
              <h2 className="text-lg font-bold">{item.question}</h2>
              <p className="mt-3 text-sm leading-6 text-white/55">
                {item.answer}
              </p>
            </article>
          ))}
        </section>
      </div>
    </main>
  )
}
