"use client"

import Image from "next/image"

const perps = [
  {
    tier: "S+",
    name: "Variational",
    ref: "https://omni.variational.io/?ref=OMNICAPY",
    logo: "/variational.png",
    boost: "+13% points boost + bronze tier"
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
    return "bg-purple-500/20 border-purple-400 text-purple-300 shadow-[0_0_20px_rgba(168,85,247,0.8)]"

  if (tier === "S")
    return "bg-yellow-500/20 border-yellow-400 text-yellow-300 shadow-[0_0_15px_rgba(250,204,21,0.6)]"

  if (tier === "A")
    return "bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.6)]"

  return ""
}

export default function Home() {
  return (
    <main className="min-h-screen text-white relative overflow-hidden bg-[#070b14]">

      {/* Background */}
      <div className="absolute inset-0 -z-10">

        <div className="absolute inset-0 bg-gradient-to-br from-[#0b1020] via-[#0f1630] to-[#050814]" />

        <div className="absolute top-[-200px] left-[-200px] w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[180px]" />

        <div className="absolute bottom-[-200px] right-[-200px] w-[600px] h-[600px] bg-emerald-500/15 rounded-full blur-[180px]" />

        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />

      </div>

      {/* Hero */}
      <div className="max-w-6xl mx-auto px-6 pt-24 text-center">

        <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
          CAPY <span className="text-red-500">PERP</span> HUB
        </h1>

        <p className="mt-4 opacity-60">
          Crypto-native Perp Tier List
        </p>

        {/* Socials */}
        <div className="flex justify-center gap-6 mt-6">

          <a
            href="https://x.com/capy_onchain"
            target="_blank"
            className="flex items-center gap-2 px-6 py-2 rounded-xl border border-neutral-700 hover:border-cyan-400 transition backdrop-blur bg-white/5"
          >
            capy
          </a>

          <a
            href="https://t.me/olejk_2k"
            target="_blank"
            className="flex items-center gap-2 px-6 py-2 rounded-xl border border-neutral-700 hover:border-cyan-400 transition backdrop-blur bg-white/5"
          >
            capy
          </a>

        </div>

      </div>

      {/* Perp list */}
      <section className="max-w-5xl mx-auto mt-20 px-6 space-y-6">

        <div className="grid grid-cols-[100px_1fr_160px_auto] text-xs uppercase tracking-widest opacity-50 border-b border-neutral-800 pb-4">
          <div>Tier</div>
          <div>Protocol</div>
          <div className="text-center">Boost</div>
          <div></div>
        </div>

        {perps.map((perp, i) => (

          <div
            key={i}
            className="grid grid-cols-[100px_1fr_160px_auto] items-center bg-[#0c1220]/70 backdrop-blur-xl border border-neutral-800 rounded-2xl p-5 hover:border-cyan-400/40 transition"
          >

            {/* Tier */}
            <div className="flex justify-center">
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
              />
              <div className="text-lg font-medium">{perp.name}</div>
            </div>

            {/* BOOST */}
<div className="flex justify-center">
  <div className="min-w-[90px] text-center px-3 py-1 text-xs font-medium rounded-full border border-emerald-400 text-emerald-300 bg-emerald-400/5">
    {perp.boost}
  </div>
</div>

            {/* Button */}
            <a
              href={perp.ref}
              target="_blank"
              className="px-6 py-2 rounded-xl border border-emerald-400 text-emerald-300 hover:bg-emerald-400/10 hover:shadow-[0_0_15px_rgba(16,185,129,0.6)] transition font-semibold"
            >
              TRADE →
            </a>

          </div>

        ))}

      </section>

      <div className="h-32" />

    </main>
  )
}