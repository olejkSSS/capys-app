"use client"

import Image from "next/image"
import { useEffect, useMemo, useRef, useState } from "react"
import { toPng } from "html-to-image"

const PERPS = [
  {
    tier: "S+",
    name: "Variational",
    ref: "https://omni.variational.io/?ref=OMNICAPY",
    logo: "/variational.png",
    boost: "OMNICAPY: +16% points boost",
    farm: "Holding positions + volume on mid-OI tokens",
  },
  {
    tier: "S+",
    name: "Extended",
    ref: "https://app.extended.exchange/join/CAPY",
    logo: "/extended.png",
    boost: "-10% fees + 5% points boost + 30% refback",
    farm: "Volume + holding positions",
  },
  {
    tier: "S",
    name: "Hibachi",
    ref: "https://hibachi.xyz/r/capy",
    logo: "/hibachi.png",
    boost: "-15% fees + 15% points boost",
    farm: "Volume + holding positions",
  },
  {
    tier: "S",
    name: "Ethereal",
    ref: "https://app.ethereal.trade/?ref=UM68P2M9JZ6D",
    logo: "/ethereal.png",
    boost: "+15% points boost",
    farm: "Boost farming + low-OI tokens",
  },
  {
    tier: "S",
    name: "Hyena",
    ref: "https://app.hyena.trade/ref/CAPY",
    logo: "/hyena.png",
    boost: "+10% points boost",
    farm: "Activity + steady volume",
  },
  {
    tier: "A",
    name: "Pacifica",
    ref: "https://app.pacifica.fi/?referral=Capy",
    logo: "/pacifica.png",
    boost: "+15% points boost",
    farm: "High volume + active trading",
  },
  {
    tier: "A",
    name: "EdgeX",
    ref: "https://pro.edgex.exchange/referral/OLEJK",
    logo: "/edgex.png",
    boost: "-10% fees + 10% points boost + VIP1",
    farm: "High volume + holding positions",
  },
  {
    tier: "A",
    name: "Dreamcash",
    ref: "https://dreamcash.xyz/share?code=CAPYCR",
    logo: "/dreamcash.png",
    boost: "Boost from 10K to 1M points",
    farm: "Low-OI tokens + active trading",
  },
] as const

const TEMPLATES = [
  "aurafarming",
  "capypistol",
  "cinema",
  "fck",
  "heaven",
  "offer",
  "omg",
  "poor",
  "punchcover",
  "rich",
  "scarcover",
  "skeletons",
  "locedin",
] as const

const PERPS_CALC = {
  variational: {
    name: "Variational",
    fdv: 0.6,
    totalPoints: 9300000,
    airdrop: 30,
  },
  extended: {
    name: "Extended",
    fdv: 0.5,
    totalPoints: 50000000,
    airdrop: 30,
  },
  pacifica: {
    name: "Pacifica",
    fdv: 0.3,
    totalPoints: 240000000,
    airdrop: 20,
  },
  nado: {
    name: "Nado",
    fdv: 0.3,
    totalPoints: 4300000,
    airdrop: 8,
  },
  o1: {
    name: "01Exchange",
    fdv: 0.2,
    totalPoints: 10000000,
    airdrop: 20,
  },
  treadfi: {
    name: "Tread Fi",
    fdv: 0.3,
    totalPoints: 2800000,
    airdrop: 20,
  },
  dreamcash: {
    name: "Dreamcash",
    fdv: 0.1,
    totalPoints: 6000000,
    airdrop: 12,
  },
  hibachi: {
    name: "Hibachi",
    fdv: 0.4,
    totalPoints: 60000000,
    airdrop: 15,
  },
  ethereal: {
    name: "Ethereal",
    fdv: 0.3,
    totalPoints: 8000000000,
    airdrop: 15,
  },
  ostium: {
    name: "Ostium",
    fdv: 0.3,
    totalPoints: 56000000,
    airdrop: 15,
  },
  grvt: {
    name: "GRVT",
    fdv: 0.15,
    totalPoints: 3000000,
    airdrop: 15,
  },
  bullpen: {
    name: "Bullpen",
    fdv: 0.15,
    totalPoints: 69900000,
    airdrop: 15,
  },
  edgex: {
    name: "EdgeX",
    fdv: 1,
    totalPoints: 10000000,
    airdrop: 30,
  },
  standx: {
    name: "StandX",
    fdv: 0.2,
    totalPoints: 50000000,
    airdrop: 20,
  },
} as const

const POLYMARKET_LAUNCH_ODDS = [
  {
    name: "EdgeX",
    deadline: "Sep 30, 2026",
    probability: 98,
    link: "https://polymarket.com/event/will-edgex-launch-a-token-by?via=capy",
    note: "Extremely strong market confidence. Odds already imply a near-certain launch this year.",
  },
  {
    name: "Extended",
    deadline: "Dec 31, 2026",
    probability: 92,
    link: "https://polymarket.com/event/will-extended-launch-a-token-by?via=capy",
    note: "Very strong odds. One of the cleanest launch probability boards right now.",
  },
  {
    name: "Variational",
    deadline: "Dec 31, 2026",
    probability: 88,
    link: "https://polymarket.com/event/will-variational-launch-a-token-in-2025?via=capy",
    note: "Market is pricing one of the strongest launch setups among tracked perps.",
  },
  {
    name: "GRVT",
    deadline: "Sep 30, 2026",
    probability: 84,
    link: "https://polymarket.com/event/will-grvt-launch-a-token-by?via=capy",
    note: "Very strong odds. The market is leaning heavily toward a 2026 launch.",
  },
  {
    name: "Ostium",
    deadline: "Dec 31, 2026",
    probability: 80,
    link: "https://polymarket.com/event/will-ostium-launch-a-token-in-2025?via=capy",
    note: "Strong odds, though the market URL is older while the live board now points to Dec 31, 2026.",
  },
  {
    name: "Tread Fi",
    deadline: "Dec 31, 2026",
    probability: 74,
    link: "https://polymarket.com/event/will-tread-launch-a-token-by?via=capy",
    note: "Good odds overall, but still not in the top tier of certainty.",
  },
  {
    name: "Dreamcash",
    deadline: "Dec 31, 2026",
    probability: 62,
    link: "https://polymarket.com/event/will-dreamcash-launch-a-token-by?via=capy",
    note: "Still speculative, but the market assigns a real shot at launch by year-end.",
  },
  {
    name: "Hibachi",
    deadline: "Sep 30, 2026",
    probability: 61,
    link: "https://polymarket.com/event/will-hibachi-launch-a-token-by?via=capy",
    note: "More binary setup. If market conditions improve, sentiment can rerate quickly.",
  },
  {
    name: "Pacifica",
    deadline: "Dec 31, 2026",
    probability: 60,
    link: "https://polymarket.com/event/will-pacifica-launch-a-token-by?via=capy",
    note: "Moderate odds. The market is not fully convinced yet despite strong interest around the protocol.",
  },
  {
    name: "StandX",
    deadline: "Mar 31, 2026",
    probability: 2,
    link: "https://polymarket.com/event/will-standx-launch-a-token-in-2025?via=capy",
    note: "Very weak odds right now. The market is heavily skeptical on near-term launch timing.",
  },
] as const

const POLYMARKET_FDV_ODDS = [
  {
    name: "GRVT",
    threshold: "$50M",
    probability: 86,
    link: "https://polymarket.com/event/grvt-fdv-above-one-day-after-launch?via=capy",
    note: "The board is heavily centered on a low opening FDV relative to the project hype.",
  },
  {
    name: "Dreamcash",
    threshold: "$20M",
    probability: 82,
    link: "https://polymarket.com/event/dreamcash-fdv-above-one-day-after-launch?via=capy",
    note: "The board is anchored low for now, with most optimism concentrated at lower thresholds.",
  },
  {
    name: "Extended",
    threshold: "$150M",
    probability: 68,
    link: "https://polymarket.com/event/extended-fdv-above-one-day-after-launch?via=capy",
    note: "The market is leaning toward a relatively modest opening FDV versus top-tier perp names.",
  },
  {
    name: "EdgeX",
    threshold: "$700M",
    probability: 53,
    link: "https://polymarket.com/event/edgex-fdv-above-one-day-after-launch?via=capy",
    note: "The market leader is already in the upper mid-range, with $1B still close behind.",
  },
  {
    name: "Variational",
    threshold: "$300M",
    probability: 41,
    link: "https://polymarket.com/event/variational-fdv-above-one-day-after-launch?via=capy",
    note: "The current leader is $300M, but the board still leaves room for rerating if sentiment improves.",
  },
  {
    name: "StandX",
    threshold: "$200M",
    probability: 40,
    link: "https://polymarket.com/event/standx-fdv-above-one-day-after-launch?via=capy",
    note: "A very mixed board. No single valuation bucket has dominant control.",
  },
  {
    name: "Ostium",
    threshold: "$300M",
    probability: 37,
    link: "https://polymarket.com/event/ostium-fdv-above-one-day-after-launch?via=capy",
    note: "The market center of gravity is around the mid-range rather than a premium launch multiple.",
  },
  {
    name: "Pacifica",
    threshold: "$300M",
    probability: 20,
    link: "https://polymarket.com/event/pacifica-fdv-above-one-day-after-launch?via=capy",
    note: "The board is still very split, which makes Pacifica one of the noisier FDV markets.",
  },
] as const

type Tab = "list" | "calculator" | "odds" | "funding"
type CalcPerpKey = keyof typeof PERPS_CALC

function getTierStyle(tier: string) {
  if (tier === "S+") {
    return "bg-purple-500/20 border-purple-400 text-purple-300 shadow-[0_0_28px_rgba(168,85,247,0.55)]"
  }

  if (tier === "S") {
    return "bg-yellow-500/20 border-yellow-400 text-yellow-300 shadow-[0_0_22px_rgba(250,204,21,0.35)]"
  }

  if (tier === "A") {
    return "bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_22px_rgba(34,211,238,0.35)]"
  }

  return "bg-neutral-500/20 border-neutral-400 text-neutral-300"
}

function formatMoney(value: number, digits = 2) {
  if (!Number.isFinite(value)) return "$0.00"

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value)
}

function formatCompactMoney(value: number) {
  if (!Number.isFinite(value)) return "$0"

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value)
}

function formatNumber(value: number) {
  if (!Number.isFinite(value)) return "0"
  return new Intl.NumberFormat("en-US").format(value)
}

function sanitizeNumber(value: string) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function getProbabilityStyle(probability: number) {
  if (probability >= 75) {
    return "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
  }

  if (probability >= 50) {
    return "border-yellow-400/30 bg-yellow-400/10 text-yellow-300"
  }

  return "border-red-400/30 bg-red-400/10 text-red-300"
}

function getFdvStyle(probability: number) {
  if (probability >= 60) {
    return "border-cyan-400/30 bg-cyan-400/10 text-cyan-300"
  }

  if (probability >= 35) {
    return "border-fuchsia-400/30 bg-fuchsia-400/10 text-fuchsia-300"
  }

  return "border-neutral-500/30 bg-neutral-500/10 text-neutral-300"
}

const tabBaseClass =
  "rounded-full px-4 sm:px-5 py-2 text-xs sm:text-sm transition border"
const inputClass =
  "w-full rounded-xl border border-neutral-800 bg-[#0c1220] p-4 text-white outline-none transition placeholder:text-white/25 focus:border-cyan-400/70 focus:bg-[#0d1425]"
const cardClass =
  "rounded-2xl border border-neutral-800 bg-[#0c1220]/70 backdrop-blur-xl"

export default function Home() {
  const [tab, setTab] = useState<Tab>("list")
  const [calcPerp, setCalcPerp] = useState<CalcPerpKey>("variational")
  const [myPoints, setMyPoints] = useState(0)
  const [templatePicker, setTemplatePicker] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<string>(TEMPLATES[0])
  const [isDownloading, setIsDownloading] = useState(false)
  const [launchSort, setLaunchSort] = useState<"desc" | "asc">("desc")
  const [fdvSort, setFdvSort] = useState<"desc" | "asc">("desc")

  const cardRef = useRef<HTMLDivElement>(null)
  const current = PERPS_CALC[calcPerp]

  const [fdv, setFdv] = useState<number>(current.fdv)
  const [totalPoints, setTotalPoints] = useState<number>(current.totalPoints)
  const [airdrop, setAirdrop] = useState<number>(current.airdrop)

  useEffect(() => {
    setFdv(current.fdv)
    setTotalPoints(current.totalPoints)
    setAirdrop(current.airdrop)
  }, [current])

  const safeTotalPoints = Math.max(totalPoints, 1)
  const safeAirdrop = Math.min(Math.max(airdrop, 0), 100)
  const safeFdv = Math.max(fdv, 0)
  const safeMyPoints = Math.max(myPoints, 0)

  const { totalAirdropPool, pricePerPoint, myValue } = useMemo(() => {
    const pool = safeFdv * 1_000_000_000 * (safeAirdrop / 100)
    const price = pool / safeTotalPoints
    const value = safeMyPoints * price

    return {
      totalAirdropPool: pool,
      pricePerPoint: price,
      myValue: value,
    }
  }, [safeFdv, safeAirdrop, safeTotalPoints, safeMyPoints])

  const sortedLaunchOdds = [...POLYMARKET_LAUNCH_ODDS].sort((a, b) =>
    launchSort === "desc" ? b.probability - a.probability : a.probability - b.probability
  )

  const sortedFdvOdds = [...POLYMARKET_FDV_ODDS].sort((a, b) =>
    fdvSort === "desc" ? b.probability - a.probability : a.probability - b.probability
  )

  const downloadCard = async () => {
    if (!cardRef.current || isDownloading) return

    try {
      setIsDownloading(true)

      await document.fonts.ready
      await new Promise((resolve) => setTimeout(resolve, 250))

      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: "#060b16",
      })

      const link = document.createElement("a")
      link.download = `${current.name.toLowerCase()}-airdrop-card.png`
      link.href = dataUrl
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error("Card download failed:", error)
      alert("Failed to download card.")
    } finally {
      setIsDownloading(false)
    }
  }

  const shareOnX = () => {
    const text = `My potential ${current.name} airdrop is ${formatMoney(myValue, 0)}.

My points: ${formatNumber(safeMyPoints)}
Est. FDV: ${formatCompactMoney(safeFdv * 1_000_000_000)}
Airdrop: ${safeAirdrop}%

Calculate yours on capys.app`

    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`
    window.open(url, "_blank", "noopener,noreferrer")
  }

  return (
    <main className="relative z-10 overflow-x-hidden text-white">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#070b14] via-[#0f1630] to-[#050814]" />
        <div className="absolute left-[-250px] top-[-250px] h-[700px] w-[700px] animate-blob rounded-full bg-purple-500/40 blur-[200px]" />
        <div className="animation-delay-2000 absolute bottom-[-250px] right-[-250px] h-[700px] w-[700px] animate-blob rounded-full bg-cyan-500/30 blur-[200px]" />
        <div className="animation-delay-4000 absolute left-[50%] top-[40%] h-[600px] w-[600px] animate-blob rounded-full bg-emerald-500/25 blur-[200px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(to_right,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:56px_56px]" />
      </div>

      <div className="relative z-20 mx-auto max-w-6xl px-4 pt-14 text-center sm:px-6 sm:pt-20">
        <div className="mb-6 flex flex-wrap items-center justify-center gap-3 text-sm">
          <span className="opacity-40">Made by</span>

          <a
            href="https://x.com/capy_onchain"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-lg border border-neutral-700 bg-[#0c1220]/60 px-3 py-1 transition hover:border-cyan-400/40 hover:bg-[#0f1729]"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18 2h3l-7 8 8 12h-6l-5-8-7 8H1l8-9L1 2h6l4 7 7-7z" />
            </svg>
            Capy
          </a>

          <a
            href="https://t.me/olejk_2k"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-lg border border-neutral-700 bg-[#0c1220]/60 px-3 py-1 transition hover:border-cyan-400/40 hover:bg-[#0f1729]"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21.5 2.5L2.7 9.6c-1 .4-1 1.1-.2 1.3l4.8 1.5 1.8 5.7c.2.6.1.8.7.8.5 0 .7-.2 1-.5l2.4-2.3 5 3.7c.9.5 1.5.2 1.8-.8L23 3.7c.4-1.3-.5-1.9-1.5-1.2z" />
            </svg>
            Capy
          </a>
        </div>

        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
          CAPY <span className="text-red-500">PERP</span> HUB
        </h1>

        <p className="mt-4 text-sm text-white/55 sm:text-base">Crypto-native perp research, tools, and launch market signals.</p>

        <div className="mt-8 flex justify-center">
          <div className="flex flex-wrap justify-center gap-2 rounded-full border border-neutral-800 bg-[#0c1220]/70 p-1 backdrop-blur">
            <button
              onClick={() => setTab("list")}
              className={`${tabBaseClass} ${
                tab === "list"
                  ? "border-cyan-400 bg-cyan-500/20 text-cyan-300 shadow-[0_0_18px_rgba(34,211,238,0.18)]"
                  : "border-transparent text-neutral-400 hover:border-neutral-700 hover:bg-white/5 hover:text-white"
              }`}
            >
              Perp DEX List
            </button>

            <button
              onClick={() => setTab("calculator")}
              className={`${tabBaseClass} ${
                tab === "calculator"
                  ? "border-purple-400 bg-purple-500/20 text-purple-300 shadow-[0_0_18px_rgba(168,85,247,0.18)]"
                  : "border-transparent text-neutral-400 hover:border-neutral-700 hover:bg-white/5 hover:text-white"
              }`}
            >
              Airdrop Calculator
            </button>

            <button
              onClick={() => setTab("odds")}
              className={`${tabBaseClass} ${
                tab === "odds"
                  ? "border-fuchsia-400 bg-fuchsia-500/20 text-fuchsia-300 shadow-[0_0_18px_rgba(217,70,239,0.16)]"
                  : "border-transparent text-neutral-400 hover:border-neutral-700 hover:bg-white/5 hover:text-white"
              }`}
            >
              Polymarket Odds
            </button>

            <button
              onClick={() => setTab("funding")}
              className={`${tabBaseClass} ${
                tab === "funding"
                  ? "border-emerald-400 bg-emerald-500/20 text-emerald-300 shadow-[0_0_18px_rgba(52,211,153,0.16)]"
                  : "border-transparent text-neutral-400 hover:border-neutral-700 hover:bg-white/5 hover:text-white"
              }`}
            >
              Funding Rates
            </button>
          </div>
        </div>
      </div>

      {tab === "list" && (
        <section className="mx-auto mt-16 max-w-5xl space-y-5 px-4 sm:mt-20 sm:px-6">
          <div className="hidden grid-cols-[88px_1fr_240px_auto] border-b border-neutral-800 pb-4 text-[11px] uppercase tracking-[0.22em] text-white/35 md:grid">
            <div className="pl-2">Tier</div>
            <div>Protocol</div>
            <div className="pr-6 text-right">Boost</div>
            <div />
          </div>

          {PERPS.map((perp) => (
            <div
              key={perp.name}
              className={`${cardClass} group flex flex-col gap-4 p-4 transition hover:border-cyan-400/30 hover:bg-[#0d1425]/90 hover:shadow-[0_0_30px_rgba(34,211,238,0.08)] md:grid md:grid-cols-[88px_1fr_240px_auto] md:items-center md:gap-5 md:p-5`}
            >
              <div className="flex md:justify-center">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl border text-sm font-bold ${getTierStyle(
                    perp.tier
                  )}`}
                >
                  {perp.tier}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Image
                  src={perp.logo}
                  alt={perp.name}
                  width={48}
                  height={48}
                  className="rounded-lg"
                />

                <div className="min-w-0">
                  <div className="text-base font-semibold text-white sm:text-lg">{perp.name}</div>
                  <div className="mt-1 text-xs text-cyan-300/70 sm:text-[13px]">{perp.farm}</div>
                </div>
              </div>

              <div className="flex md:justify-center">
                <div className="rounded-full border border-emerald-400/35 bg-emerald-400/8 px-3 py-1 text-center text-xs font-medium text-emerald-300">
                  {perp.boost}
                </div>
              </div>

              <a
                href={perp.ref}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full rounded-xl border border-cyan-400 bg-cyan-400/5 px-6 py-2.5 text-center text-sm font-semibold text-cyan-300 transition hover:bg-cyan-400/10 hover:shadow-[0_0_18px_rgba(34,211,238,0.08)] md:w-auto"
              >
                Trade →
              </a>
            </div>
          ))}
        </section>
      )}

      {tab === "calculator" && (
        <section className="mx-auto mt-16 max-w-5xl space-y-8 px-4 sm:mt-20 sm:px-6">
          <div className={`${cardClass} p-5 sm:p-6`}>
            <h2 className="text-xl font-semibold text-white">Perp DEX Airdrop Calculator</h2>
            <p className="mt-2 text-sm text-white/50">
              Estimate a potential airdrop value using your own assumptions.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            {Object.keys(PERPS_CALC).map((key) => {
              const perpKey = key as CalcPerpKey
              const isActive = calcPerp === perpKey

              return (
                <button
                  key={key}
                  onClick={() => setCalcPerp(perpKey)}
                  className={`rounded-full border px-4 py-2 text-sm transition ${
                    isActive
                      ? "border-cyan-400 bg-cyan-400/10 text-cyan-300 shadow-[0_0_18px_rgba(34,211,238,0.14)]"
                      : "border-neutral-700 text-neutral-400 hover:border-neutral-500 hover:text-white"
                  }`}
                >
                  {PERPS_CALC[perpKey].name}
                </button>
              )
            })}
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <p className="mb-2 text-xs uppercase tracking-[0.22em] text-white/40">My points</p>
              <input
                type="number"
                min="0"
                value={myPoints}
                onChange={(e) => setMyPoints(sanitizeNumber(e.target.value))}
                className={inputClass}
                placeholder="0"
              />
            </div>

            <div>
              <p className="mb-2 text-xs uppercase tracking-[0.22em] text-white/40">FDV (billions $)</p>
              <input
                type="number"
                min="0"
                step="0.1"
                value={fdv}
                onChange={(e) => setFdv(sanitizeNumber(e.target.value))}
                className={inputClass}
              />
            </div>

            <div>
              <p className="mb-2 text-xs uppercase tracking-[0.22em] text-white/40">Total points</p>
              <input
                type="number"
                min="1"
                value={totalPoints}
                onChange={(e) => setTotalPoints(sanitizeNumber(e.target.value))}
                className={inputClass}
              />
            </div>

            <div>
              <p className="mb-2 text-xs uppercase tracking-[0.22em] text-white/40">Airdrop % of supply</p>
              <input
                type="number"
                min="0"
                max="100"
                value={airdrop}
                onChange={(e) => setAirdrop(sanitizeNumber(e.target.value))}
                className={inputClass}
              />
            </div>
          </div>

          <div
            ref={cardRef}
            className="relative mt-10 aspect-[16/9] overflow-hidden rounded-[28px] border border-cyan-400/20 bg-[#060b16] shadow-[0_0_40px_rgba(0,255,255,0.08)]"
          >
            <img
              src={`/templates/${selectedTemplate}.png`}
              alt="Card template"
              className="absolute inset-0 h-full w-full object-cover"
            />

            <div className="absolute inset-0 bg-gradient-to-r from-[#050a14]/92 via-[#050a14]/45 to-transparent" />
            <div className="absolute inset-0 bg-black/15" />

            <div className="relative z-10 flex h-full flex-col p-4 sm:p-6 md:p-10">
              <div className="flex items-start justify-between gap-4">
                <div className="max-w-[68%] sm:max-w-[62%]">
                  <div className="mb-3 text-[10px] font-semibold uppercase tracking-[0.35em] text-cyan-300/85 sm:text-xs">
                    capys.app
                  </div>

                  <div className="mb-3 inline-flex items-center rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs text-cyan-300 sm:text-base">
                    {current.name}
                  </div>

                  <div className="text-[10px] uppercase tracking-[0.35em] text-white/45 sm:text-xs">
                    Potential Airdrop Value
                  </div>

                  <div className="mt-3 text-3xl font-bold leading-none text-white sm:text-4xl md:text-6xl">
                    {formatMoney(myValue, 0)}
                  </div>

                  <div className="mt-3 text-xs text-white/65 sm:text-base">
                    {formatNumber(safeMyPoints)} points • {formatMoney(pricePerPoint, 2)} per point
                  </div>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-[10px] uppercase tracking-[0.22em] text-white/45 sm:px-4 sm:text-xs">
                  estimate only
                </div>
              </div>

              <div className="mt-auto grid grid-cols-2 gap-3 md:grid-cols-4">
                <div className="rounded-2xl border border-white/10 bg-black/30 p-3 backdrop-blur-md sm:p-4">
                  <div className="text-[10px] uppercase tracking-[0.22em] text-white/40 sm:text-[11px]">
                    My Points
                  </div>
                  <div className="mt-2 text-lg font-semibold text-white sm:text-xl">
                    {formatNumber(safeMyPoints)}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/30 p-3 backdrop-blur-md sm:p-4">
                  <div className="text-[10px] uppercase tracking-[0.22em] text-white/40 sm:text-[11px]">
                    Total Supply
                  </div>
                  <div className="mt-2 text-lg font-semibold text-white sm:text-xl">
                    {formatNumber(safeTotalPoints)}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/30 p-3 backdrop-blur-md sm:p-4">
                  <div className="text-[10px] uppercase tracking-[0.22em] text-white/40 sm:text-[11px]">
                    Est. FDV
                  </div>
                  <div className="mt-2 text-lg font-semibold text-white sm:text-xl">
                    {formatCompactMoney(safeFdv * 1_000_000_000)}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/30 p-3 backdrop-blur-md sm:p-4">
                  <div className="text-[10px] uppercase tracking-[0.22em] text-white/40 sm:text-[11px]">
                    Airdrop %
                  </div>
                  <div className="mt-2 text-lg font-semibold text-white sm:text-xl">
                    {safeAirdrop}%
                  </div>
                </div>
              </div>

              <div className="pointer-events-none absolute bottom-3 right-4 text-[10px] uppercase tracking-[0.28em] text-white/30 sm:bottom-4 sm:right-6 sm:text-xs">
                @capy_onchain
              </div>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => setTemplatePicker(true)}
              className="rounded-xl border border-neutral-700 px-6 py-3 transition hover:border-cyan-400 hover:bg-white/5"
            >
              Pick a Template
            </button>

            <button
              onClick={downloadCard}
              disabled={isDownloading}
              className="rounded-xl border border-neutral-700 px-6 py-3 transition hover:border-purple-400 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isDownloading ? "Downloading..." : "Download Card"}
            </button>

            <button
              onClick={shareOnX}
              className="rounded-xl bg-white px-6 py-3 font-semibold text-black transition hover:bg-neutral-200"
            >
              Share on X
            </button>
          </div>
        </section>
      )}

      {tab === "odds" && (
        <section className="mx-auto mt-16 max-w-6xl space-y-8 px-4 sm:mt-20 sm:px-6">
          <div className={`${cardClass} p-6`}>
            <h2 className="text-2xl font-semibold text-white">Polymarket Odds</h2>

            <p className="mt-2 text-sm text-white/50">
              Market-implied launch timing and FDV expectations based on current Polymarket pricing.
            </p>

            <div className="mt-3 inline-flex rounded-full border border-fuchsia-400/20 bg-fuchsia-400/10 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-fuchsia-300/80">
              Last updated: Mar 9, 12:00 UTC
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-wrap items-center gap-4">
                <h3 className="text-lg font-semibold text-white">Launch Timing Odds</h3>
                <div className="text-xs uppercase tracking-[0.25em] text-white/35">
                  token launch deadlines
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setLaunchSort("desc")}
                  className={`rounded-lg px-3 py-1.5 text-xs transition ${
                    launchSort === "desc"
                      ? "border border-emerald-400/40 bg-emerald-400/10 text-emerald-300"
                      : "border border-neutral-700 text-neutral-400 hover:border-neutral-500"
                  }`}
                >
                  High → Low
                </button>

                <button
                  onClick={() => setLaunchSort("asc")}
                  className={`rounded-lg px-3 py-1.5 text-xs transition ${
                    launchSort === "asc"
                      ? "border border-red-400/40 bg-red-400/10 text-red-300"
                      : "border border-neutral-700 text-neutral-400 hover:border-neutral-500"
                  }`}
                >
                  Low → High
                </button>
              </div>
            </div>

            <div className="grid gap-4">
              {sortedLaunchOdds.map((item) => (
                <div
                  key={item.name}
                  className={`${cardClass} p-5 transition hover:border-fuchsia-400/30 hover:bg-[#0d1425]/90`}
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="text-xl font-semibold text-white">{item.name}</div>

                        <div
                          className={`rounded-full border px-3 py-1 text-xs font-medium ${getProbabilityStyle(
                            item.probability
                          )}`}
                        >
                          {item.probability}% probability
                        </div>
                      </div>

                      <div className="text-sm text-white/45">Deadline: {item.deadline}</div>

                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex rounded-lg border border-cyan-400/25 bg-cyan-400/10 px-3 py-1.5 text-xs font-medium text-cyan-300 transition hover:border-cyan-400/50 hover:bg-cyan-400/15"
                      >
                        Open launch market
                      </a>
                    </div>

                    <div className="max-w-2xl text-sm leading-6 text-white/70 lg:text-right">{item.note}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-wrap items-center gap-4">
                <h3 className="text-lg font-semibold text-white">FDV Odds</h3>
                <div className="text-xs uppercase tracking-[0.25em] text-white/35">
                  one day after launch
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setFdvSort("desc")}
                  className={`rounded-lg px-3 py-1.5 text-xs transition ${
                    fdvSort === "desc"
                      ? "border border-cyan-400/40 bg-cyan-400/10 text-cyan-300"
                      : "border border-neutral-700 text-neutral-400 hover:border-neutral-500"
                  }`}
                >
                  High → Low
                </button>

                <button
                  onClick={() => setFdvSort("asc")}
                  className={`rounded-lg px-3 py-1.5 text-xs transition ${
                    fdvSort === "asc"
                      ? "border border-fuchsia-400/40 bg-fuchsia-400/10 text-fuchsia-300"
                      : "border border-neutral-700 text-neutral-400 hover:border-neutral-500"
                  }`}
                >
                  Low → High
                </button>
              </div>
            </div>

            <div className="grid gap-4">
              {sortedFdvOdds.map((item) => (
                <div
                  key={item.name}
                  className={`${cardClass} p-5 transition hover:border-cyan-400/30 hover:bg-[#0d1425]/90`}
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="text-xl font-semibold text-white">{item.name}</div>

                        <div
                          className={`rounded-full border px-3 py-1 text-xs font-medium ${getFdvStyle(
                            item.probability
                          )}`}
                        >
                          {item.threshold} • {item.probability}%
                        </div>
                      </div>

                      <div className="text-sm text-cyan-300/75">Current market leader</div>

                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex rounded-lg border border-fuchsia-400/25 bg-fuchsia-400/10 px-3 py-1.5 text-xs font-medium text-fuchsia-300 transition hover:border-fuchsia-400/50 hover:bg-fuchsia-400/15"
                      >
                        Open FDV market
                      </a>
                    </div>

                    <div className="max-w-2xl text-sm leading-6 text-white/70 lg:text-right">{item.note}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {tab === "funding" && (
        <section className="mx-auto mt-16 max-w-4xl px-4 text-center sm:mt-20">
          <div className={`${cardClass} p-10`}>
            <div className="mb-4 text-xl font-semibold text-white/70">Funding Rates</div>
            <div className="text-sm text-white/40">Coming soon</div>
          </div>
        </section>
      )}

      {templatePicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur">
          <div className="max-h-[85vh] w-full max-w-5xl overflow-y-auto rounded-2xl border border-neutral-800 bg-[#0c1220] p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Choose Card Background</h3>

              <button
                onClick={() => setTemplatePicker(false)}
                className="rounded-lg px-2 py-1 text-white/60 transition hover:bg-white/5 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {TEMPLATES.map((template) => (
                <button
                  key={template}
                  onClick={() => {
                    setSelectedTemplate(template)
                    setTemplatePicker(false)
                  }}
                  className={`overflow-hidden rounded-xl border transition ${
                    selectedTemplate === template
                      ? "border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.2)]"
                      : "border-neutral-800 hover:border-cyan-400"
                  }`}
                >
                  <div className="relative aspect-video w-full bg-[#060b16]">
                    <Image
                      src={`/templates/${template}.png`}
                      alt={template}
                      fill
                      className="object-cover"
                    />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </main>
  )
}