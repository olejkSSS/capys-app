"use client"

import Image from "next/image"
import { useState } from "react"

const perps = [
  {
    tier: "S+",
    name: "Variational",
    ref: "https://omni.variational.io/?ref=OMNICAPY",
    logo: "/variational.png",
    boost: "OMNICAPY: +13% points boost"
  },
  {
    tier: "S+",
    name: "Extended",
    ref: "https://app.extended.exchange/join/CAPY",
    logo: "/extended.png",
    boost: "-10% fees + 5% points boost + 30% refback"
  },
  {
    tier: "S",
    name: "Hibachi",
    ref: "http://hibachi.xyz/r/capy",
    logo: "/hibachi.png",
    boost: "-15% fees + 15% points boost"
  },
  {
    tier: "S",
    name: "Ethereal",
    ref: "https://app.ethereal.trade/?ref=UM68P2M9JZ6D",
    logo: "/ethereal.png",
    boost: "+15% points boost"
  },
  {
    tier: "S",
    name: "Hyena",
    ref: "https://app.hyena.trade/ref/CAPY",
    logo: "/hyena.png",
    boost: "+10% points boost"
  },
  {
    tier: "A",
    name: "Pacifica",
    ref: "https://trade.pacifica.fi/ref/CAPY",
    logo: "/pacifica.png",
    boost: "+15% points boost"
  },
  {
    tier: "A",
    name: "EdgeX",
    ref: "https://app.edgex.exchange/ref/CAPY",
    logo: "/edgex.png",
    boost: "-10% fees + 10% points boost + VIP1"
  },
  {
    tier: "A",
    name: "Dreamcash",
    ref: "https://app.dreamcash.xyz/ref/CAPY",
    logo: "/dreamcash.png",
    boost: "boost from 10K to 1M points"
  }
]

function getTierStyle(tier: string) {
  if (tier === "S+")
    return "bg-purple-500/20 border-purple-400 text-purple-300 shadow-[0_0_35px_rgba(168,85,247,0.9)]"

  if (tier === "S")
    return "bg-yellow-500/20 border-yellow-400 text-yellow-300 shadow-[0_0_22px_rgba(250,204,21,0.7)]"

  if (tier === "A")
    return "bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_22px_rgba(34,211,238,0.7)]"

  return ""
}

export default function Home() {

  const [tab, setTab] = useState<"list" | "calculator">("list")

  return (
    <main className="text-white relative overflow-x-hidden z-10">

      {/* Hero */}
      <div className="relative z-20 max-w-6xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 text-center">

        <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold tracking-tight">
          CAPY <span className="text-red-500">PERP</span> HUB
        </h1>

        <p className="mt-4 opacity-60">
          Crypto-native Perp Tier List
        </p>

        {/* Tabs */}
        <div className="flex justify-center mt-10">
          <div className="flex bg-[#0c1220]/70 border border-neutral-800 rounded-full p-1">

            <button
              onClick={() => setTab("list")}
              className={`px-6 py-2 rounded-full text-sm transition ${
                tab === "list"
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400"
                  : "text-neutral-400"
              }`}
            >
              Perp DEX List
            </button>

            <button
              onClick={() => setTab("calculator")}
              className={`px-6 py-2 rounded-full text-sm transition ${
                tab === "calculator"
                  ? "bg-purple-500/20 text-purple-300 border border-purple-400"
                  : "text-neutral-400"
              }`}
            >
              Airdrop Calculator
            </button>

          </div>
        </div>

      </div>

      {/* LIST */}
      {tab === "list" && (

        <section className="max-w-5xl mx-auto mt-16 sm:mt-20 px-4 sm:px-6 space-y-6">

          <div className="hidden md:grid grid-cols-[100px_1fr_220px_auto] text-xs uppercase tracking-widest opacity-50 border-b border-neutral-800 pb-4">
            <div className="pl-2">Tier</div>
            <div>-Protocol</div>
            <div className="text-right pr-6">Boost</div>
            <div></div>
          </div>

          {perps.map((perp, i) => (

            <div
              key={i}
              className="group flex flex-col md:grid md:grid-cols-[100px_1fr_220px_auto] gap-4 items-start md:items-center bg-[#0c1220]/70 backdrop-blur-xl border border-neutral-800 rounded-2xl p-4 md:p-5 hover:scale-[1.01] hover:border-cyan-400/40 hover:shadow-[0_0_30px_rgba(34,211,238,0.2)] transition"
            >

              {/* Tier */}
              <div className="flex md:justify-center">
                <div className={`w-12 h-12 flex items-center justify-center rounded-xl font-bold border ${getTierStyle(perp.tier)}`}>
                  {perp.tier}
                </div>
              </div>

              {/* Logo + name */}
              <div className="flex items-center gap-4">

                <Image
                  src={perp.logo}
                  alt={perp.name}
                  width={40}
                  height={40}
                  className="md:w-[48px] md:h-[48px] rounded-lg shadow-[0_0_12px_rgba(255,255,255,0.08)]"
                />

                <div className="text-lg font-medium">{perp.name}</div>

              </div>

              {/* Boost */}
              <div className="flex md:justify-center">
                <div className="text-xs sm:text-sm text-center px-3 py-1 font-medium rounded-full border border-emerald-400 text-emerald-300 bg-emerald-400/5 shadow-[0_0_10px_rgba(16,185,129,0.25)] max-w-[220px] md:max-w-full break-words">
                  {perp.boost}
                </div>
              </div>

              {/* Button */}
              <a
                href={perp.ref}
                target="_blank"
                rel="noopener"
                className="w-full md:w-auto mt-2 md:mt-0 md:ml-4 px-6 py-2 text-center rounded-xl border border-cyan-400 text-cyan-300 bg-cyan-400/5 hover:bg-cyan-400/10 hover:shadow-[0_0_18px_rgba(34,211,238,0.7)] transition font-semibold tracking-wide"
              >
                TRADE →
              </a>

            </div>

          ))}

        </section>

      )}

      {/* CALCULATOR */}
      {tab === "calculator" && (
        <div className="max-w-4xl mx-auto mt-20 text-center opacity-60">
          Calculator coming soon
        </div>
      )}

    </main>
  )
}