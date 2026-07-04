import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import {
  CONTENT_REVIEWED_AT,
  PERP_GUIDES,
  PERPS,
  PERPS_CALC,
  SITE_URL,
} from "../../data/perps"

type Props = {
  params: Promise<{
    slug: string
  }>
}

export function generateStaticParams() {
  return PERPS.map((perp) => ({ slug: perp.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const perp = PERPS.find((item) => item.slug === slug)

  if (!perp) return {}

  const hasCalculator = perp.slug in PERPS_CALC
  const title = `${perp.name} Referral Code, Farming Guide${hasCalculator ? " & Calculator" : ""}`
  const description = `Review the ${perp.name} referral code (${perp.refCode}), ${perp.boost}, farming strategy, risks, and current Capys.app research notes.`

  return {
    title,
    description,
    keywords: [
      ...perp.seoKeywords,
      `${perp.name} referral code`,
      `${perp.name} farming guide`,
      `how to farm ${perp.name} points`,
      ...(hasCalculator
        ? [
            `${perp.name} point calculator`,
            `${perp.name} airdrop calculator`,
          ]
        : []),
    ],
    alternates: {
      canonical: `/perps/${perp.slug}`,
    },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/perps/${perp.slug}`,
      siteName: "Capys.app",
      type: "article",
      images: ["/opengraph-image"],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      creator: "@capy_onchain",
      images: ["/opengraph-image"],
    },
  }
}

export default async function PerpGuidePage({ params }: Props) {
  const { slug } = await params
  const perp = PERPS.find((item) => item.slug === slug)

  if (!perp) notFound()

  const guide = PERP_GUIDES[perp.slug]
  const calc = PERPS_CALC[perp.slug as keyof typeof PERPS_CALC]
  const related = PERPS.filter((item) => item.slug !== perp.slug).slice(0, 3)
  const pageUrl = `${SITE_URL}/perps/${perp.slug}`
  const faq = [
    {
      question: `What is the ${perp.name} referral code?`,
      answer: `The referral code tracked by Capys.app is ${perp.refCode}. The displayed route currently lists ${perp.boost}. Verify the final terms on the project before trading or depositing.`,
    },
    {
      question: `How should I approach ${perp.name} farming?`,
      answer: `${guide.summary} Keep a defined fee and risk budget and check current campaign eligibility first.`,
    },
    {
      question: `Are ${perp.name} point estimates guaranteed?`,
      answer:
        "No. Calculator results are editable scenarios based on assumptions, not official tokenomics, prices, or guaranteed airdrop allocations.",
    },
  ]
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: `${perp.name} referral code and farming guide`,
      description: guide.summary,
      url: pageUrl,
      dateModified: "2026-07-04",
      author: {
        "@type": "Person",
        name: "Capy",
        url: "https://x.com/capy_onchain",
      },
      publisher: {
        "@type": "Organization",
        name: "Capys.app",
        url: SITE_URL,
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
          name: "Airdrop campaigns",
          item: `${SITE_URL}/airdrops`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: perp.name,
          item: pageUrl,
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
              <span className="block text-xs text-white/45">Perp research guide</span>
            </span>
          </Link>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/airdrops"
              className="rounded-xl border border-white/10 px-4 py-2 text-sm text-white/65 transition hover:text-white"
            >
              Campaigns
            </Link>
            <Link
              href="/methodology"
              className="rounded-xl border border-cyan-300/25 bg-cyan-300/10 px-4 py-2 text-sm font-semibold text-cyan-100"
            >
              Methodology
            </Link>
          </div>
        </nav>

        <article>
          <header className="mt-8 overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-10">
            <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-purple-400/35 bg-purple-500/15 px-3 py-1 text-xs font-black text-purple-200">
                    Tier {perp.tier}
                  </span>
                  <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs font-semibold text-emerald-200">
                    {guide.stage}
                  </span>
                </div>
                <h1 className="mt-5 max-w-4xl text-4xl font-black leading-tight tracking-tight sm:text-6xl">
                  {perp.name} referral code and farming guide
                </h1>
                <p className="mt-5 max-w-3xl text-base leading-7 text-white/62">
                  {guide.summary}
                </p>
              </div>

              <Image
                src={perp.logo}
                alt={`${perp.name} logo`}
                width={112}
                height={112}
                className="rounded-3xl border border-white/10 bg-black/20 p-3"
                priority
              />
            </div>

            <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ["Referral code", perp.refCode],
                ["Available terms", perp.boost],
                ["Best for", guide.bestFor],
                ["Effort", guide.effort],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-2xl border border-white/10 bg-black/15 p-5"
                >
                  <div className="text-xs uppercase tracking-[0.2em] text-white/38">
                    {label}
                  </div>
                  <div className="mt-3 font-bold leading-6 text-white">{value}</div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href={perp.ref}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-2xl bg-cyan-300 px-6 py-4 text-center text-sm font-black uppercase tracking-[0.14em] text-slate-950 shadow-[0_0_34px_rgba(34,211,238,0.22)]"
              >
                {perp.slug === "risex"
                  ? "Contact for RiseX codes"
                  : `Open ${perp.name} route`}
              </a>
              {calc && (
                <Link
                  href={`/calculators/${perp.slug}-point-calculator`}
                  className="rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-4 text-center text-sm font-semibold text-white/75 transition hover:text-white"
                >
                  Open {perp.name} point calculator
                </Link>
              )}
            </div>
          </header>

          <section className="mt-8 grid gap-5 lg:grid-cols-2">
            <div className="rounded-3xl border border-emerald-300/15 bg-emerald-300/[0.055] p-6">
              <div className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-200/65">
                Farming strategy
              </div>
              <h2 className="mt-3 text-2xl font-black">A practical starting plan</h2>
              <ol className="mt-5 space-y-4">
                {guide.actions.map((action, index) => (
                  <li key={action} className="flex gap-4 text-sm leading-6 text-white/62">
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-emerald-300/25 bg-emerald-300/10 text-xs font-black text-emerald-200">
                      {index + 1}
                    </span>
                    <span>{action}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="rounded-3xl border border-rose-300/15 bg-rose-300/[0.045] p-6">
              <div className="text-xs font-semibold uppercase tracking-[0.24em] text-rose-200/60">
                Mistakes to avoid
              </div>
              <h2 className="mt-3 text-2xl font-black">Protect the downside first</h2>
              <ul className="mt-5 space-y-4">
                {guide.avoid.map((item) => (
                  <li key={item} className="flex gap-3 text-sm leading-6 text-white/62">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-300" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6 rounded-2xl border border-white/8 bg-black/15 p-4">
                <div className="text-xs uppercase tracking-[0.18em] text-white/35">
                  Cost profile
                </div>
                <div className="mt-2 font-bold text-white">{guide.costProfile}</div>
              </div>
            </div>
          </section>

          {calc && (
            <section className="mt-8 rounded-3xl border border-cyan-300/15 bg-cyan-300/[0.055] p-6 sm:p-8">
              <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/60">
                    Scenario calculator
                  </div>
                  <h2 className="mt-3 text-3xl font-black">
                    Stress-test the {perp.name} point value
                  </h2>
                  <p className="mt-3 max-w-3xl text-sm leading-6 text-white/55">
                    Defaults use ${calc.fdv}B FDV, {calc.airdrop}% allocation, and{" "}
                    {calc.totalPoints.toLocaleString("en-US")} total points. Every
                    assumption is editable and none is an official forecast.
                  </p>
                </div>
                <Link
                  href={`/calculators/${perp.slug}-point-calculator`}
                  className="rounded-2xl bg-cyan-300 px-6 py-4 text-center text-sm font-black text-slate-950"
                >
                  Run calculator →
                </Link>
              </div>
            </section>
          )}

          <section className="mt-8 rounded-3xl border border-white/10 bg-white/[0.035] p-6 sm:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/55">
                  Research status
                </div>
                <h2 className="mt-3 text-2xl font-black">What this page confirms</h2>
              </div>
              <Link
                href="/methodology"
                className="text-sm font-semibold text-cyan-200 transition hover:text-cyan-100"
              >
                Read the methodology →
              </Link>
            </div>
            <div className="mt-6 grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl border border-white/8 bg-black/15 p-4">
                <div className="text-xs uppercase tracking-[0.18em] text-white/35">
                  Content reviewed
                </div>
                <div className="mt-2 font-bold">{CONTENT_REVIEWED_AT}</div>
              </div>
              <div className="rounded-2xl border border-white/8 bg-black/15 p-4">
                <div className="text-xs uppercase tracking-[0.18em] text-white/35">
                  Terms shown
                </div>
                <div className="mt-2 font-bold">{perp.boost}</div>
              </div>
              <a
                href={perp.ref}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-2xl border border-white/8 bg-black/15 p-4 transition hover:border-cyan-300/30"
              >
                <div className="text-xs uppercase tracking-[0.18em] text-white/35">
                  Project route
                </div>
                <div className="mt-2 font-bold text-cyan-200">Verify current terms →</div>
              </a>
            </div>
            <p className="mt-5 text-xs leading-5 text-white/38">
              Review date means Capys.app checked this page content on that date.
              Campaign rules, eligibility, and referral benefits can still change
              without notice.
            </p>
          </section>

          <section className="mt-8">
            <div className="flex items-end justify-between gap-4">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.24em] text-white/35">
                  Compare alternatives
                </div>
                <h2 className="mt-3 text-2xl font-black">Other farming routes</h2>
              </div>
              <Link href="/airdrops" className="text-sm font-semibold text-cyan-200">
                View all →
              </Link>
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-3">
              {related.map((item) => (
                <Link
                  key={item.slug}
                  href={`/perps/${item.slug}`}
                  className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.035] p-4 transition hover:border-cyan-300/30"
                >
                  <Image
                    src={item.logo}
                    alt={`${item.name} logo`}
                    width={44}
                    height={44}
                    className="rounded-xl"
                  />
                  <div>
                    <div className="font-bold">{item.name}</div>
                    <div className="mt-1 text-xs text-white/45">{item.boost}</div>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          <section className="mt-8 rounded-3xl border border-white/10 bg-white/[0.025] p-6">
            <h2 className="text-2xl font-black">Common questions</h2>
            <div className="mt-5 grid gap-3">
              {faq.map((item) => (
                <details
                  key={item.question}
                  className="rounded-2xl border border-white/8 bg-black/15 p-5"
                >
                  <summary className="cursor-pointer font-bold text-white">
                    {item.question}
                  </summary>
                  <p className="mt-3 text-sm leading-6 text-white/55">{item.answer}</p>
                </details>
              ))}
            </div>
          </section>
        </article>
      </div>
    </main>
  )
}
