import type { Metadata } from "next"
import Link from "next/link"
import { DEFAULT_FUNDING_EXCHANGES, SITE_URL } from "../data/perps"

export const revalidate = 86400

export const metadata: Metadata = {
  title: "Perp Funding Rate Screener",
  description:
    "Scan perp DEX funding rates, funding spreads, and cross-exchange opportunities with Capy referral routes where available.",
  keywords: [
    "perp funding rates",
    "funding rate screener",
    "funding arbitrage",
    "hyperliquid funding rates",
    "extended funding rates",
    "hibachi funding rates",
    "variational funding rates",
    "perp dex screener",
  ],
  alternates: {
    canonical: "/funding-rates",
  },
}

export default function FundingRatesPage() {
  return (
    <main className="capys-page min-h-screen px-4 py-10 text-white sm:px-6 lg:px-8">
      <section className="mx-auto max-w-5xl rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-10">
        <div className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/55">
          Funding rate screener
        </div>
        <h1 className="mt-4 max-w-4xl text-4xl font-black leading-tight tracking-tight sm:text-6xl">
          Live perp funding rates and spread scanner
        </h1>
        <p className="mt-5 max-w-3xl text-base leading-7 text-white/62">
          Capys.app uses Loris Tools funding data to compare funding rates across
          perp exchanges, normalize interval views, and surface potential
          long/short routes. When a Capy referral exists, the trade route opens
          with that referral; otherwise it opens the generic exchange website.
        </p>

        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {DEFAULT_FUNDING_EXCHANGES.map((exchange) => (
            <a
              key={exchange.key}
              href={exchange.tradeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-2xl border border-white/10 bg-white/[0.035] p-4 transition hover:border-cyan-300/35 hover:bg-white/[0.07]"
            >
              <div className="font-bold">{exchange.label}</div>
              <div className="mt-1 text-sm text-white/52">
                {exchange.hasPersonalRef ? "Capy referral route" : "Generic route"}
              </div>
            </a>
          ))}
        </div>

        <Link
          href={`${SITE_URL}/#funding`}
          className="mt-8 inline-flex rounded-2xl bg-cyan-300 px-6 py-4 text-sm font-black uppercase tracking-[0.16em] text-slate-950"
        >
          Open funding screener
        </Link>
      </section>
    </main>
  )
}
