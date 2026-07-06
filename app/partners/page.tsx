import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { SITE_URL } from "../data/perps"

export const metadata: Metadata = {
  title: "Perp DEX Growth, BD & Marketing",
  description:
    "Work with Capys.app on perp DEX listings, regional growth, influencer scouting, BD, campaign strategy, and full-funnel marketing.",
  alternates: {
    canonical: "/partners",
  },
  openGraph: {
    title: "Grow Your Perp with Capys.app",
    description:
      "Perp-focused BD, regional growth, influencer scouting, campaign strategy, listings, research, and distribution.",
    url: `${SITE_URL}/partners`,
    siteName: "Capys.app",
    type: "website",
    images: ["/opengraph-image"],
  },
}

const formats = [
  {
    title: "Project listing",
    body: "Add a new perp route with its logo, campaign mechanics, public links, and current user benefits.",
  },
  {
    title: "BD & regional growth",
    body: "Build market-entry partnerships, sharpen the regional offer, and connect your team with relevant communities and operators.",
  },
  {
    title: "Influencer scouting",
    body: "Find and qualify crypto creators, KOLs, community leaders, and distribution partners that match your market and campaign goals.",
  },
  {
    title: "Campaigns & paid marketing",
    body: "Plan offers, referral mechanics, content, media budgets, creator activations, and measurable acquisition campaigns.",
  },
  {
    title: "Research & positioning",
    body: "Turn product details into a useful guide, calculator, comparison page, and clear farming narrative for new and experienced traders.",
  },
  {
    title: "Community distribution",
    body: "Reach perp-native users through X, Telegram, partner channels, educational content, and coordinated launch support.",
  },
]

export default function PartnersPage() {
  return (
    <main className="capys-page min-h-screen px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <nav className="capys-nav flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3">
          <Link href="/" className="flex items-center gap-3">
            <span className="relative h-10 w-10 overflow-hidden rounded-xl border border-cyan-300/25">
              <Image src="/icon.png" alt="Capys.app" fill sizes="40px" />
            </span>
            <span className="text-sm font-semibold tracking-[0.24em]">CAPYS</span>
          </Link>
          <Link
            href="/methodology"
            className="rounded-xl border border-white/10 px-4 py-2 text-sm text-white/65 transition hover:text-white"
          >
            Methodology
          </Link>
        </nav>

        <header className="py-14 sm:py-20">
          <div className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-200/65">
            Perp growth partner
          </div>
          <h1 className="mt-4 max-w-4xl text-5xl font-black leading-[0.96] tracking-tight sm:text-7xl">
            Grow your perp with focused BD and marketing.
          </h1>
          <p className="mt-6 max-w-3xl text-base leading-7 text-white/60 sm:text-lg">
            I help perp teams with BD, regional growth, influencer and KOL
            scouting, campaign positioning, paid acquisition, content,
            referral offers, and community distribution. Capys.app also turns
            your product and campaign terms into practical research pages,
            calculators, comparisons, and routes that traders can actually use.
          </p>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-white/45">
            Whether you need a focused listing, a regional launch partner, a
            creator pipeline, or full marketing support from offer design to
            budget deployment, get in touch with the goal, market, and timeline.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href="https://t.me/olejk_2k"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-2xl bg-cyan-300 px-6 py-4 text-center text-sm font-black uppercase tracking-[0.14em] text-slate-950"
            >
              Contact on Telegram
            </a>
            <a
              href="https://x.com/capy_onchain"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-4 text-center text-sm font-semibold text-white/75"
            >
              Contact on X
            </a>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-2">
          {formats.map((format) => (
            <article
              key={format.title}
              className="rounded-3xl border border-white/10 bg-white/[0.035] p-6"
            >
              <h2 className="text-2xl font-black">{format.title}</h2>
              <p className="mt-3 text-sm leading-6 text-white/55">{format.body}</p>
            </article>
          ))}
        </section>

        <section className="mt-8 rounded-3xl border border-cyan-300/15 bg-cyan-300/[0.055] p-6 sm:p-8">
          <h2 className="text-2xl font-black">What to send</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {[
              "Project name, website, and social links",
              "Logo and approved brand assets",
              "Current campaign and eligibility rules",
              "Referral code and exact user benefit",
              "Target regions, audience, goals, and timeline",
              "Marketing scope, creator needs, and indicative budget",
              "Best contact for future corrections",
            ].map((item) => (
              <div
                key={item}
                className="flex gap-3 rounded-2xl border border-white/8 bg-black/15 p-4 text-sm text-white/60"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                  className="mt-0.5 shrink-0 text-cyan-300"
                >
                  <path
                    d="m5 12 4 4L19 6"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </section>

        <p className="mt-8 text-xs leading-5 text-white/35">
          Commercial relationships do not change the requirement to display
          referral terms clearly or label uncertain calculator assumptions.
        </p>
      </div>
    </main>
  )
}
