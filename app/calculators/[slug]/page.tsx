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

  const title = `${perp.name} Point Calculator`
  const description = `Estimate ${perp.name} airdrop value from points, FDV, total point supply, and token allocation. Includes ${perp.name} farming notes${perp.hasReferral ? ` and referral code ${perp.refCode}` : ""}.`
  const canonical = `/calculators/${perp.slug}-point-calculator`

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
      `${perp.name} referral code`,
      `${perp.name} best referral`,
      `${perp.name} max referral bonus`,
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

export default async function PerpPointCalculatorPage({ params }: Props) {
  const { slug } = await params
  const perp = getPerpFromCalculatorSlug(slug)

  if (!perp) notFound()

  const calc = PERPS_CALC[perp.slug as keyof typeof PERPS_CALC]

  if (!calc) notFound()

  const calculatorUrl = `${SITE_URL}/calculators/${perp.slug}-point-calculator`
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: `${perp.name} Point Calculator`,
    applicationCategory: "FinanceApplication",
    operatingSystem: "Web",
    url: calculatorUrl,
    description: `Estimate ${perp.name} point value and potential airdrop value with Capys.app.`,
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
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#050814] px-4 py-10 text-white sm:px-6 lg:px-8">
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
              href="/#calculator"
              className="rounded-xl border border-cyan-300/25 bg-cyan-300/10 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-300/15"
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
              FDV, total points supply, and token allocation. This page also
              keeps the current Capy referral route nearby for users searching
              for the best {perp.name} farming terms.
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
                    Referral terms
                  </div>
                  <div className="mt-1 text-2xl font-black">{perp.name}</div>
                </div>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-emerald-300/20 bg-emerald-300/10 p-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-emerald-100/60">
                    Code
                  </div>
                  <div className="mt-2 font-black">{perp.refCode}</div>
                </div>
                <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-4 sm:col-span-2">
                  <div className="text-xs uppercase tracking-[0.2em] text-cyan-100/60">
                    Boost
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
              {perp.name} airdrop calculator
            </h2>
            <p className="mt-3 text-sm leading-6 text-white/58">
              Use this page for searches like {perp.name} point calculator,{" "}
              {perp.name} points value, {perp.name} airdrop estimate, and{" "}
              {perp.name} FDV calculator.
            </p>
          </article>

          <article className="rounded-3xl border border-white/10 bg-white/[0.035] p-6">
            <h2 className="text-2xl font-black">
              Best {perp.name} referral route
            </h2>
            <p className="mt-3 text-sm leading-6 text-white/58">
              Capys.app tracks referral codes, fee discounts, points boosts,
              refback terms, and farming notes for perp DEX users looking for
              stronger conditions.
            </p>
          </article>

          <article className="rounded-3xl border border-white/10 bg-white/[0.035] p-6">
            <h2 className="text-2xl font-black">More perp calculators</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {Object.entries(PERPS_CALC)
                .filter(([slug]) => slug !== perp.slug)
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
          </article>
        </section>
      </div>
    </main>
  )
}
