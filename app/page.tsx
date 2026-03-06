"use client"

import Image from "next/image"
import { useEffect, useMemo, useRef, useState } from "react"
import html2canvas from "html2canvas"

const PERPS = [
  {
    tier: "S+",
    name: "Variational",
    ref: "https://omni.variational.io/?ref=OMNICAPY",
    logo: "/variational.png",
    boost: "OMNICAPY: +13% points boost",
  },
  {
    tier: "S+",
    name: "Extended",
    ref: "https://app.extended.exchange/join/CAPY",
    logo: "/extended.png",
    boost: "-10% fees + 5% points boost + 30% refback",
  },
  {
    tier: "S",
    name: "Hibachi",
    ref: "http://hibachi.xyz/r/capy",
    logo: "/hibachi.png",
    boost: "-15% fees + 15% points boost",
  },
  {
    tier: "S",
    name: "Ethereal",
    ref: "https://app.ethereal.trade/?ref=UM68P2M9JZ6D",
    logo: "/ethereal.png",
    boost: "+15% points boost",
  },
  {
    tier: "S",
    name: "Hyena",
    ref: "https://app.hyena.trade/ref/CAPY",
    logo: "/hyena.png",
    boost: "+10% points boost",
  },
  {
    tier: "A",
    name: "Pacifica",
    ref: "https://app.pacifica.fi/?referral=Capy",
    logo: "/pacifica.png",
    boost: "+15% points boost",
  },
  {
    tier: "A",
    name: "EdgeX",
    ref: "https://pro.edgex.exchange/referral/OLEJK",
    logo: "/edgex.png",
    boost: "-10% fees + 10% points boost + VIP1",
  },
  {
    tier: "A",
    name: "Dreamcash",
    ref: "https://dreamcash.xyz/share?code=CAPYCR",
    logo: "/dreamcash.png",
    boost: "boost from 10K to 1M points",
  },
] as const

const TEMPLATES = [
  "aurafarming",
  "capypistol",
  "cinema",
  "fck",
  "heaven",
  "laughing",
  "offer",
  "ohno",
  "omg",
  "poor",
  "punchcover",
  "rich",
  "scarcover",
  "skeletons",
] as const

const PERPS_CALC = {
  nado: {
    name: "Nado",
    fdv: 1.5,
    totalPoints: 4300000,
    airdrop: 8,
  },
  variational: {
    name: "Variational",
    fdv: 0.6,
    totalPoints: 9300000,
    airdrop: 30,
  },
  extended: {
    name: "Extended",
    fdv: 0.5,
    totalPoints: 7700000,
    airdrop: 30,
  },
  pacifica: {
    name: "Pacifica",
    fdv: 0.6,
    totalPoints: 60000000,
    airdrop: 20,
  },
  ethereal: {
    name: "Ethereal",
    fdv: 0.5,
    totalPoints: 10000000,
    airdrop: 15,
  },
  edgex: {
    name: "EdgeX",
    fdv: 2,
    totalPoints: 10000000,
    airdrop: 30,
  },
  standx: {
    name: "StandX",
    fdv: 0.5,
    totalPoints: 50000000,
    airdrop: 20,
  },
  hibachi: {
    name: "Hibachi",
    fdv: 0.15,
    totalPoints: 60000000,
    airdrop: 15,
  },
} as const

type Tab = "list" | "calculator" | "funding"
type CalcPerpKey = keyof typeof PERPS_CALC

function getTierStyle(tier: string) {
  if (tier === "S+") {
    return "bg-purple-500/20 border-purple-400 text-purple-300 shadow-[0_0_35px_rgba(168,85,247,0.9)]"
  }

  if (tier === "S") {
    return "bg-yellow-500/20 border-yellow-400 text-yellow-300 shadow-[0_0_22px_rgba(250,204,21,0.7)]"
  }

  if (tier === "A") {
    return "bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_22px_rgba(34,211,238,0.7)]"
  }

  return ""
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

function formatNumber(value: number) {
  if (!Number.isFinite(value)) return "0"
  return new Intl.NumberFormat("en-US").format(value)
}

function sanitizeNumber(value: string) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

export default function Home() {
  const [tab, setTab] = useState<Tab>("list")
  const [calcPerp, setCalcPerp] = useState<CalcPerpKey>("nado")
  const [myPoints, setMyPoints] = useState(0)
  const [templatePicker, setTemplatePicker] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [isDownloading, setIsDownloading] = useState(false)

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
  const safeAirdrop = Math.max(airdrop, 0)
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

  const downloadCard = async () => {
    if (!cardRef.current || isDownloading) return

    try {
      setIsDownloading(true)

      await document.fonts.ready
      await new Promise((resolve) => requestAnimationFrame(() => resolve(null)))
      await new Promise((resolve) => setTimeout(resolve, 150))

      const canvas = await html2canvas(cardRef.current, {
        useCORS: true,
        allowTaint: false,
        scale: 2,
        backgroundColor: null,
        logging: false,
      })

      const dataUrl = canvas.toDataURL("image/png")

      const link = document.createElement("a")
      link.href = dataUrl
      link.download = `${current.name.toLowerCase()}-airdrop-card.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error("Card download failed:", error)
      alert("Failed to download card. Try selecting the template again or refreshing the page.")
    } finally {
      setIsDownloading(false)
    }
  }

  const shareOnX = () => {
    const text = `My potential ${current.name} airdrop is ${formatMoney(myValue)}.

Points: ${formatNumber(safeMyPoints)}
Price per point: ${formatMoney(pricePerPoint, 4)}

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
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:60px_60px]" />
      </div>

      <div className="relative z-20 mx-auto max-w-6xl px-4 pt-16 text-center sm:px-6 sm:pt-24">
        <div className="mb-6 flex items-center justify-center gap-4 text-sm">
          <span className="opacity-40">Made by</span>

          <a
            href="https://x.com/capy_onchain"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-lg border border-neutral-700 bg-[#0c1220]/60 px-3 py-1 transition hover:border-cyan-400/40"
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
            className="flex items-center gap-2 rounded-lg border border-neutral-700 bg-[#0c1220]/60 px-3 py-1 transition hover:border-cyan-400/40"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21.5 2.5L2.7 9.6c-1 .4-1 1.1-.2 1.3l4.8 1.5 1.8 5.7c.2.6.1.8.7.8.5 0 .7-.2 1-.5l2.4-2.3 5 3.7c.9.5 1.5.2 1.8-.8L23 3.7c.4-1.3-.5-1.9-1.5-1.2z" />
            </svg>
            Capy
          </a>
        </div>

        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-6xl">
          CAPY <span className="text-red-500">PERP</span> HUB
        </h1>

        <p className="mt-4 opacity-60">Crypto-native Perp Tier List</p>

        <div className="mt-8 flex justify-center">
          <div className="flex flex-wrap justify-center rounded-full border border-neutral-800 bg-[#0c1220]/70 p-1 backdrop-blur">
            <button
              onClick={() => setTab("list")}
              className={`rounded-full px-5 py-2 text-sm transition ${
                tab === "list"
                  ? "border border-cyan-400 bg-cyan-500/20 text-cyan-300"
                  : "text-neutral-400"
              }`}
            >
              Perp DEX List
            </button>

            <button
              onClick={() => setTab("calculator")}
              className={`rounded-full px-5 py-2 text-sm transition ${
                tab === "calculator"
                  ? "border border-purple-400 bg-purple-500/20 text-purple-300"
                  : "text-neutral-400"
              }`}
            >
              Perp DEX Airdrop Calculator
            </button>

            <button
              onClick={() => setTab("funding")}
              className={`rounded-full px-5 py-2 text-sm transition ${
                tab === "funding"
                  ? "border border-emerald-400 bg-emerald-500/20 text-emerald-300"
                  : "text-neutral-400"
              }`}
            >
              Funding Rates
            </button>
          </div>
        </div>
      </div>

      {tab === "list" && (
        <section className="mx-auto mt-16 max-w-5xl space-y-6 px-4 sm:mt-20 sm:px-6">
          <div className="hidden grid-cols-[100px_1fr_220px_auto] border-b border-neutral-800 pb-4 text-xs uppercase tracking-widest opacity-50 md:grid">
            <div className="pl-2">Tier</div>
            <div>Protocol</div>
            <div className="pr-6 text-right">Boost</div>
            <div />
          </div>

          {PERPS.map((perp) => (
            <div
              key={perp.name}
              className="group flex flex-col items-start gap-4 rounded-2xl border border-neutral-800 bg-[#0c1220]/70 p-4 backdrop-blur-xl transition hover:scale-[1.01] hover:border-cyan-400/40 hover:shadow-[0_0_30px_rgba(34,211,238,0.2)] md:grid md:grid-cols-[100px_1fr_220px_auto] md:items-center md:p-5"
            >
              <div className="flex md:justify-center">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl border font-bold ${getTierStyle(
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
                <div className="text-lg font-medium">{perp.name}</div>
              </div>

              <div className="flex md:justify-center">
                <div className="rounded-full border border-emerald-400 bg-emerald-400/5 px-3 py-1 text-center text-xs font-medium text-emerald-300 sm:text-sm">
                  {perp.boost}
                </div>
              </div>

              <a
                href={perp.ref}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 w-full rounded-xl border border-cyan-400 bg-cyan-400/5 px-6 py-2 text-center font-semibold text-cyan-300 transition hover:bg-cyan-400/10 md:ml-4 md:mt-0 md:w-auto"
              >
                TRADE →
              </a>
            </div>
          ))}
        </section>
      )}

      {tab === "calculator" && (
        <section className="mx-auto mt-20 max-w-4xl space-y-8 px-4">
          <p className="text-center opacity-50">
            Calculate your potential airdrop based on your perp DEX points balance.
          </p>

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
                      ? "border-cyan-400 bg-cyan-400/10 text-cyan-300 shadow-[0_0_18px_rgba(34,211,238,0.2)]"
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
              <p className="mb-2 text-xs opacity-50">MY POINTS</p>
              <input
                type="number"
                min="0"
                value={myPoints}
                onChange={(e) => setMyPoints(sanitizeNumber(e.target.value))}
                className="w-full rounded-xl border border-neutral-800 bg-[#0c1220] p-4 outline-none transition focus:border-cyan-400"
              />
            </div>

            <div>
              <p className="mb-2 text-xs opacity-50">FDV (billions $)</p>
              <input
                type="number"
                min="0"
                step="0.1"
                value={fdv}
                onChange={(e) => setFdv(sanitizeNumber(e.target.value))}
                className="w-full rounded-xl border border-neutral-800 bg-[#0c1220] p-4 outline-none transition focus:border-cyan-400"
              />
            </div>

            <div>
              <p className="mb-2 text-xs opacity-50">TOTAL POINTS</p>
              <input
                type="number"
                min="1"
                value={totalPoints}
                onChange={(e) => setTotalPoints(sanitizeNumber(e.target.value))}
                className="w-full rounded-xl border border-neutral-800 bg-[#0c1220] p-4 outline-none transition focus:border-cyan-400"
              />
            </div>

            <div>
              <p className="mb-2 text-xs opacity-50">AIRDROP % SUPPLY</p>
              <input
                type="number"
                min="0"
                max="100"
                value={airdrop}
                onChange={(e) => setAirdrop(sanitizeNumber(e.target.value))}
                className="w-full rounded-xl border border-neutral-800 bg-[#0c1220] p-4 outline-none transition focus:border-cyan-400"
              />
            </div>
          </div>

          <div
            ref={cardRef}
            className="relative mt-10 overflow-hidden rounded-2xl border border-neutral-800 bg-[#0a0f1d] bg-cover bg-center p-8"
            style={{
              backgroundImage: selectedTemplate
                ? `url(/templates/${selectedTemplate}.png)`
                : undefined,
            }}
          >
            <div className="absolute inset-0 bg-black/35" />
            <div className="relative z-10">
              <h2 className="mb-4 text-xl text-cyan-300">{current.name}</h2>

              <div className="mb-6 text-4xl font-bold">{formatMoney(myValue)}</div>

              <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
                <div className="rounded-lg bg-black/35 p-4 backdrop-blur-sm">
                  <p className="opacity-50">Total Airdrop Pool</p>
                  <p>{formatMoney(totalAirdropPool / 1_000_000)}M</p>
                </div>

                <div className="rounded-lg bg-black/35 p-4 backdrop-blur-sm">
                  <p className="opacity-50">My Points</p>
                  <p>{formatNumber(safeMyPoints)}</p>
                </div>

                <div className="rounded-lg bg-black/35 p-4 backdrop-blur-sm">
                  <p className="opacity-50">Price per point</p>
                  <p>{formatMoney(pricePerPoint, 4)}</p>
                </div>

                <div className="rounded-lg bg-black/35 p-4 backdrop-blur-sm">
                  <p className="opacity-50">Airdrop %</p>
                  <p>{safeAirdrop}%</p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap justify-center gap-4">
                <button
                  onClick={() => setTemplatePicker(true)}
                  className="rounded-xl border border-neutral-700 px-6 py-3 transition hover:border-cyan-400"
                >
                  Pick a Template
                </button>

                <button
                  onClick={downloadCard}
                  disabled={isDownloading}
                  className="rounded-xl border border-neutral-700 px-6 py-3 transition hover:border-purple-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isDownloading ? "Downloading..." : "Download Card"}
                </button>

                <button
                  onClick={shareOnX}
                  className="rounded-xl bg-white px-6 py-3 font-semibold text-black"
                >
                  Share on X
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {tab === "funding" && (
        <div className="mx-auto mt-20 min-h-screen max-w-4xl px-4 text-center">
          <div className="rounded-2xl border border-neutral-800 bg-[#0c1220]/70 p-10">
            <div className="mb-4 text-xl opacity-60">Funding Rates</div>
            <div className="opacity-40">coming soon</div>
          </div>
        </div>
      )}

      {templatePicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur">
          <div className="max-h-[85vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-neutral-800 bg-[#0c1220] p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg">Choose Card Background</h3>

              <button
                onClick={() => setTemplatePicker(false)}
                className="opacity-60 transition hover:opacity-100"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {TEMPLATES.map((template) => (
                <button
                  key={template}
                  onClick={() => {
                    setSelectedTemplate(template)
                    setTemplatePicker(false)
                  }}
                  className={`overflow-hidden rounded-lg border transition ${
                    selectedTemplate === template
                      ? "border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.25)]"
                      : "border-neutral-800 hover:border-cyan-400"
                  }`}
                >
                  <Image
                    src={`/templates/${template}.png`}
                    alt={template}
                    width={200}
                    height={200}
                    className="h-auto w-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </main>
  )
}