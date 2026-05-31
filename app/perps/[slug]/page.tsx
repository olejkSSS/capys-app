import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { PERPS, PERPS_CALC, SITE_URL } from "../../data/perps"

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

  const title = `${perp.name} Referral Code, Points Boost & Airdrop Calculator`
  const description = `Use Capys.app for the ${perp.name} referral code (${perp.refCode}), ${perp.boost}, farming notes, and a perp points airdrop calculator.`

  return {
    title,
    description,
    keywords: [
      ...perp.seoKeywords,
      `${perp.name} point calculator`,
      `${perp.name} points calculator`,
      `${perp.name} referral code`,
      `${perp.name} max referral`,
      `${perp.name} airdrop calculator`,
      "perp dex referral code",
      "best perp dex referral bonus",
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
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      creator: "@capy_onchain",
    },
  }
}

export default async function PerpSeoPage({ params }: Props) {
  const { slug } = await params
  const perp = PERPS.find((item) => item.slug === slug)

  if (!perp) notFound()

  const calc = PERPS_CALC[perp.slug as keyof typeof PERPS_CALC]

  return (
    <main className="min-h-screen bg-[#050814] px-4 py-10 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/"
          className="inline-flex rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/65 transition hover:text-white"
        >
          Back to Capys.app
        </Link>

        <section className="mt-8 overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-10">
          <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/55">
                Perp DEX referral and calculator
              </div>
              <h1 className="mt-4 max-w-3xl text-4xl font-black leading-tight tracking-tight sm:text-6xl">
                {perp.name} referral code and points calculator
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-white/62">
                Get the current Capy referral setup for {perp.name}, estimate
                potential airdrop value, and compare the farming route against
                other perp DEX opportunities.
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

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            <div className="rounded-3xl border border-emerald-300/20 bg-emerald-300/10 p-5">
              <div className="text-xs uppercase tracking-[0.24em] text-emerald-100/60">
                Referral code
              </div>
              <div className="mt-3 text-3xl font-black text-white">{perp.refCode}</div>
            </div>

            <div className="rounded-3xl border border-cyan-300/20 bg-cyan-300/10 p-5">
              <div className="text-xs uppercase tracking-[0.24em] text-cyan-100/60">
                Boost
              </div>
              <div className="mt-3 text-xl font-bold text-white">{perp.boost}</div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
              <div className="text-xs uppercase tracking-[0.24em] text-white/40">
                Farming focus
              </div>
              <div className="mt-3 text-xl font-bold text-white">{perp.farm}</div>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href={perp.ref}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-2xl bg-cyan-300 px-6 py-4 text-center text-sm font-black uppercase tracking-[0.16em] text-slate-950 shadow-[0_0_34px_rgba(34,211,238,0.22)]"
            >
              Open {perp.name} with Capy ref
            </a>
            <Link
              href="/#calculator"
              className="rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-4 text-center text-sm font-semibold text-white/75 transition hover:text-white"
            >
              Use airdrop calculator
            </Link>
          </div>
        </section>

        <section className="mt-8 grid gap-5 md:grid-cols-2">
          <article className="rounded-3xl border border-white/10 bg-white/[0.035] p-6">
            <h2 className="text-2xl font-black">Best searches this page targets</h2>
            <p className="mt-3 text-sm leading-6 text-white/58">
              This page is built for users looking for {perp.name} referral code,
              {perp.name} point calculator, {perp.name} airdrop calculator,
              maximum {perp.name} ref bonus, perp DEX farming boosts, and best
              referral conditions across new perp exchanges.
            </p>
          </article>

          <article className="rounded-3xl border border-white/10 bg-white/[0.035] p-6">
            <h2 className="text-2xl font-black">Calculator defaults</h2>
            {calc ? (
              <dl className="mt-4 space-y-3 text-sm text-white/62">
                <div className="flex justify-between gap-4">
                  <dt>Estimated FDV</dt>
                  <dd>${calc.fdv}B</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt>Total points</dt>
                  <dd>{calc.totalPoints.toLocaleString("en-US")}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt>Airdrop allocation</dt>
                  <dd>{calc.airdrop}%</dd>
                </div>
              </dl>
            ) : (
              <p className="mt-3 text-sm text-white/58">
                Use the main Capys.app calculator to model FDV, points supply,
                and your own balance.
              </p>
            )}
          </article>
        </section>
      </div>
    </main>
  )
}
