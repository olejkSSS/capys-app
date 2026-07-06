import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { PERP_CALC_LOGOS, PERPS, PERPS_CALC, SITE_URL } from "../../data/perps"
import { CalculatorClient } from "./CalculatorClient"

type Props = {
  params: Promise<{
    slug: string
  }>
}

function getPerpFromCalculatorSlug(slug: string) {
  const normalized = slug.replace(/-points?-calculator$/, "")
  const listedPerp = PERPS.find((perp) => perp.slug === normalized)
  const calc = PERPS_CALC[normalized as keyof typeof PERPS_CALC]

  if (!calc) return null

  return {
    slug: normalized,
    name: calc.name,
    ref: listedPerp?.ref ?? SITE_URL,
    refCode: listedPerp?.refCode ?? "N/A",
    logo:
      listedPerp?.logo ??
      PERP_CALC_LOGOS[normalized as keyof typeof PERPS_CALC] ??
      "/icon.png",
    boost: listedPerp?.boost ?? "Editable FDV, points supply, and airdrop estimate",
    farm: listedPerp?.farm ?? "Model your points, FDV, allocation, and point supply",
    seoKeywords: listedPerp?.seoKeywords ?? [],
    hasReferral: Boolean(listedPerp),
  }
}

export function generateStaticParams() {
  return Object.keys(PERPS_CALC).map((slug) => ({
    slug: `${slug}-point-calculator`,
  }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const perp = getPerpFromCalculatorSlug(slug)

  if (!perp) return {}

  const title = `${perp.name} Point Calculator: Estimate Airdrop Value`
  const description = `Estimate ${perp.name} points value using editable FDV, total points supply, token allocation, and personal balance assumptions.`
  const canonical = `/calculators/${perp.slug}-point-calculator`
  const socialImage = `${canonical}/opengraph-image`

  return {
    title,
    description,
    keywords: [
      `${perp.name} point calculator`,
      `${perp.name} points calculator`,
      `${perp.name} airdrop calculator`,
      `${perp.name} points value`,
      `${perp.name} point price`,
      `${perp.name} FDV calculator`,
      ...(perp.hasReferral
        ? [
            `${perp.name} referral code`,
            `${perp.name} best referral`,
            `${perp.name} max referral bonus`,
          ]
        : []),
      ...perp.seoKeywords,
    ],
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}${canonical}`,
      siteName: "Capys.app",
      type: "website",
      images: [socialImage],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      creator: "@capy_onchain",
      images: [socialImage],
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}

export default async function PerpPointCalculatorPage({ params }: Props) {
  const { slug } = await params
  const perp = getPerpFromCalculatorSlug(slug)

  if (!perp) notFound()

  const calc = PERPS_CALC[perp.slug as keyof typeof PERPS_CALC]

  if (!calc) notFound()

  const calculatorUrl = `${SITE_URL}/calculators/${perp.slug}-point-calculator`
  const faq = [
    {
      question: `How does the ${perp.name} point calculator work?`,
      answer: `It estimates a scenario value by multiplying FDV by the assumed airdrop allocation and dividing the result by total ${perp.name} points.`,
    },
    {
      question: `Are the ${perp.name} defaults official?`,
      answer:
        "No. Every default is an editable research assumption, not official tokenomics, a guaranteed valuation, or financial advice.",
    },
    {
      question: `Can I calculate the value of my own ${perp.name} points?`,
      answer:
        "Yes. Enter your points balance, then adjust FDV, total points, and airdrop allocation to compare multiple scenarios.",
    },
  ]
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: `${perp.name} Point Calculator`,
      applicationCategory: "FinanceApplication",
      operatingSystem: "Web",
      url: calculatorUrl,
      description: `Estimate ${perp.name} point value and potential airdrop value with editable assumptions.`,
      creator: {
        "@type": "Person",
        name: "CapyOnchain",
        url: "https://x.com/capy_onchain",
      },
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Capys.app",
          item: SITE_URL,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Perp Point Calculators",
          item: `${SITE_URL}/calculators`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: `${perp.name} Point Calculator`,
          item: calculatorUrl,
        },
      ],
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
    <main className="capys-page min-h-screen overflow-hidden px-4 py-10 text-white sm:px-6 lg:px-8">
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.18),transparent_32%),linear-gradient(135deg,#030610_0%,#07111f_44%,#050814_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(to_right,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:72px_72px] [mask-image:linear-gradient(to_bottom,black,transparent_82%)]" />
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-6xl">
        <nav className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3 shadow-2xl shadow-black/20 backdrop-blur-xl">
          <Link href="/" className="flex items-center gap-3">
            <span className="relative h-10 w-10 overflow-hidden rounded-xl border border-cyan-300/25 bg-cyan-300/10">
              <Image
                src="/icon.png"
                alt="Capys.app"
                fill
                sizes="40px"
                className="object-cover"
              />
            </span>
            <span>
              <span className="block text-sm font-semibold tracking-[0.24em]">
                CAPYS
              </span>
              <span className="block text-xs text-white/45">
                Perp point calculator
              </span>
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <a
              href="https://x.com/capy_onchain"
              target="_blank"
              rel="noopener noreferrer"
              className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-white/70 transition hover:border-cyan-300/40 hover:text-cyan-200"
              aria-label="Open Capy on X"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18 2h3l-7 8 8 12h-6l-5-8-7 8H1l8-9L1 2h6l4 7 7-7z" />
              </svg>
            </a>
            <Link
              href="/calculators"
              className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-white/70 transition hover:border-white/20 hover:text-white"
            >
              All calculators
            </Link>
            <Link
              href="/#calculator"
              className="hidden rounded-xl border border-cyan-300/25 bg-cyan-300/10 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-300/15 sm:inline-flex"
            >
              Main calculator
            </Link>
          </div>
        </nav>

        <section className="grid gap-8 py-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div>
            <div className="inline-flex rounded-full border border-emerald-300/20 bg-emerald-300/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.26em] text-emerald-200">
              {perp.name} point calculator
            </div>

            <h1 className="mt-5 text-5xl font-black leading-[0.95] tracking-tight sm:text-6xl">
              {perp.name} points to dollars calculator
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-white/62">
              Estimate your potential {perp.name} airdrop value from points,
              FDV, total points supply, and token allocation. All inputs are
              editable, so you can compare conservative and aggressive
              scenarios without treating the defaults as official tokenomics.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={perp.ref}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-2xl bg-cyan-300 px-6 py-4 text-sm font-black uppercase tracking-[0.16em] text-slate-950 shadow-[0_0_34px_rgba(34,211,238,0.24)] transition hover:bg-cyan-200"
              >
                {perp.hasReferral
                  ? perp.slug === "risex"
                    ? "Contact for RiseX codes"
                    : `Open ${perp.name} with Capy ref`
                  : "Open Capys.app"}
              </a>
              <Link
                href={perp.hasReferral ? `/perps/${perp.slug}` : "/"}
                className="rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-4 text-sm font-semibold text-white/75 transition hover:border-white/20 hover:text-white"
              >
                {perp.hasReferral ? "Referral details" : "Back to main dashboard"}
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-6 rounded-[2rem] bg-cyan-300/10 blur-3xl" />
            <div className="relative rounded-[2rem] border border-white/10 bg-[#08111f]/88 p-6 shadow-2xl shadow-black/40 backdrop-blur-xl">
              <div className="flex items-center gap-4">
                <Image
                  src={perp.logo}
                  alt={`${perp.name} logo`}
                  width={76}
                  height={76}
                  className="rounded-2xl border border-white/10 bg-black/20 p-2"
                  priority
                />
                <div>
                  <div className="text-xs uppercase tracking-[0.24em] text-white/38">
                    {perp.hasReferral ? "Referral terms" : "Calculator scenario"}
                  </div>
                  <div className="mt-1 text-2xl font-black">{perp.name}</div>
                </div>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-emerald-300/20 bg-emerald-300/10 p-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-emerald-100/60">
                    {perp.hasReferral ? "Code" : "Status"}
                  </div>
                  <div className="mt-2 font-black">
                    {perp.hasReferral ? perp.refCode : "Editable"}
                  </div>
                </div>
                <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-4 sm:col-span-2">
                  <div className="text-xs uppercase tracking-[0.2em] text-cyan-100/60">
                    {perp.hasReferral ? "Boost" : "Defaults"}
                  </div>
                  <div className="mt-2 font-bold">{perp.boost}</div>
                </div>
              </div>

              <div className="mt-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-white/35">
                  Farming focus
                </div>
                <div className="mt-2 text-white/78">{perp.farm}</div>
              </div>
            </div>
          </div>
        </section>

        <CalculatorClient
          airdrop={calc.airdrop}
          fdv={calc.fdv}
          name={calc.name}
          totalPoints={calc.totalPoints}
        />

        <section className="mt-8 grid gap-5 lg:grid-cols-3">
          <article className="rounded-3xl border border-white/10 bg-white/[0.035] p-6">
            <h2 className="text-2xl font-black">
              Model several {perp.name} outcomes
            </h2>
            <p className="mt-3 text-sm leading-6 text-white/58">
              Change the FDV, allocation, total points, and your balance instead
              of relying on one headline estimate. Conservative, base, and
              optimistic scenarios make the uncertainty visible.
            </p>
          </article>

          <article className="rounded-3xl border border-white/10 bg-white/[0.035] p-6">
            <h2 className="text-2xl font-black">
              {perp.hasReferral
                ? `Best ${perp.name} referral route`
                : `Editable ${perp.name} scenarios`}
            </h2>
            <p className="mt-3 text-sm leading-6 text-white/58">
              {perp.hasReferral
                ? "Capys.app tracks referral codes, fee discounts, points boosts, refback terms, and farming notes for perp DEX users looking for stronger conditions."
                : "Use the calculator as a scenario model. Change every assumption and compare outcomes instead of relying on a single headline estimate."}
            </p>
          </article>

          <article className="rounded-3xl border border-white/10 bg-white/[0.035] p-6">
            <h2 className="text-2xl font-black">More perp calculators</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {Object.entries(PERPS_CALC)
                .filter(([slug]) => slug !== perp.slug)
                .slice(0, 12)
                .map(([slug, item]) => (
                <Link
                  key={slug}
                  href={`/calculators/${slug}-point-calculator`}
                  className="rounded-full border border-white/10 bg-white/[0.035] px-3 py-2 text-xs text-white/60 transition hover:border-cyan-300/35 hover:text-cyan-200"
                >
                  {item.name}
                </Link>
                ))}
            </div>
            <Link
              href="/calculators"
              className="mt-4 inline-flex text-sm font-semibold text-cyan-200 transition hover:text-cyan-100"
            >
              View all calculators в†’
            </Link>
          </article>
        </section>

        <section className="mt-8 rounded-3xl border border-yellow-300/15 bg-yellow-300/[0.055] p-6">
          <h2 className="text-xl font-black">Scenario methodology</h2>
          <p className="mt-3 max-w-4xl text-sm leading-6 text-white/58">
            The estimate uses: FDV Г— airdrop allocation Г· total points supply Г—
            your points. Defaults are editable research assumptions and may not
            reflect official tokenomics, future prices, eligibility rules, or
            final allocations.
          </p>
        </section>

        <section className="mt-8 grid gap-4 lg:grid-cols-3">
          {faq.map((item) => (
            <article
              key={item.question}
              className="rounded-3xl border border-white/10 bg-white/[0.035] p-6"
            >
              <h2 className="text-lg font-black">{item.question}</h2>
              <p className="mt-3 text-sm leading-6 text-white/58">
                {item.answer}
              </p>
            </article>
          ))}
        </section>
      </div>
    </main>
  )
}
