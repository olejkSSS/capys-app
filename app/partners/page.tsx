import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { SITE_URL } from "../data/perps"

export const metadata: Metadata = {
  title: "List or Update a Perp DEX",
  description:
    "Submit a perp DEX, correct campaign terms, or discuss a referral and research partnership with Capys.app.",
  alternates: {
    canonical: "/partners",
  },
  openGraph: {
    title: "List Your Perp on Capys.app",
    description:
      "Project listings, campaign updates, referral terms, research pages, and community distribution.",
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
    title: "Terms update",
    body: "Correct a referral code, points boost, fee discount, campaign status, or farming instructions.",
  },
  {
    title: "Research page",
    body: "Build a useful project guide with transparent terms, calculator access, strategy notes, and risks.",
  },
  {
    title: "Community distribution",
    body: "Discuss an X or Telegram campaign for users actively researching perp DEX farming.",
  },
]

export default function PartnersPage() {
  return (
    <main className="capys-page min-h-screen px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <nav className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3">
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
            Projects and partners
          </div>
          <h1 className="mt-4 max-w-4xl text-5xl font-black leading-[0.96] tracking-tight sm:text-7xl">
            List your perp or update your campaign terms.
          </h1>
          <p className="mt-6 max-w-3xl text-base leading-7 text-white/60 sm:text-lg">
            Capys.app is a focused perp farming hub for users comparing points,
            fees, referral benefits, calculators, and funding routes. Send the
            facts once and give users a page they can actually use.
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
              "Calculator inputs or published token assumptions",
              "Best contact for future corrections",
            ].map((item) => (
              <div
                key={item}
                className="flex gap-3 rounded-2xl border border-white/8 bg-black/15 p-4 text-sm text-white/60"
              >
                <span className="text-cyan-300">вњ“</span>
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
