import type { Metadata } from "next"
import Link from "next/link"
import { PERPS, SITE_URL } from "../data/perps"

export const metadata: Metadata = {
  title: "Perp Points Airdrop Calculator",
  description:
    "Estimate perp DEX airdrop value from points, FDV, total points supply, and token allocation across Variational, Extended, Hibachi, Ethereal, EdgeX, Pacifica, Hyena and more.",
  keywords: [
    "perp points calculator",
    "perp airdrop calculator",
    "variational point calculator",
    "hibachi points calculator",
    "extended points calculator",
    "ethereal airdrop calculator",
    "perp dex airdrop estimate",
  ],
  alternates: {
    canonical: "/perp-airdrop-calculator",
  },
}

export default function PerpAirdropCalculatorPage() {
  return (
    <main className="min-h-screen bg-[#050814] px-4 py-10 text-white sm:px-6 lg:px-8">
      <section className="mx-auto max-w-5xl rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-10">
        <div className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/55">
          Perp points calculator
        </div>
        <h1 className="mt-4 max-w-4xl text-4xl font-black leading-tight tracking-tight sm:text-6xl">
          Perp DEX airdrop calculator for points farmers
        </h1>
        <p className="mt-5 max-w-3xl text-base leading-7 text-white/62">
          Use Capys.app to estimate potential airdrop value from your points
          balance, FDV assumptions, total points supply, and airdrop allocation.
          The calculator supports popular perp venues and keeps referral boost
          context nearby so users can choose where to farm next.
        </p>

        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {PERPS.map((perp) => (
            <Link
              key={perp.slug}
              href={`/perps/${perp.slug}`}
              className="rounded-2xl border border-white/10 bg-white/[0.035] p-4 transition hover:border-cyan-300/35 hover:bg-white/[0.07]"
            >
              <div className="font-bold">{perp.name}</div>
              <div className="mt-1 text-sm text-white/52">{perp.boost}</div>
            </Link>
          ))}
        </div>

        <Link
          href={`${SITE_URL}/#calculator`}
          className="mt-8 inline-flex rounded-2xl bg-cyan-300 px-6 py-4 text-sm font-black uppercase tracking-[0.16em] text-slate-950"
        >
          Open calculator
        </Link>
      </section>
    </main>
  )
}
