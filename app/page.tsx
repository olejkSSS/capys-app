"use client"

import Image from "next/image"

const perps = [
  {
    tier: "S+",
    name: "Variational",
    ref: "https://omni.variational.io/?ref=OMNICAPY",
    logo: "/variational.png",
  },
  {
    tier: "S+",
    name: "Extended",
    ref: "https://app.extended.exchange/join/CAPY",
    logo: "/extended.png",
  },
  {
    tier: "S",
    name: "Hibachi",
    ref: "http://hibachi.xyz/r/capy",
    logo: "/hibachi.png",
  },
  {
    tier: "S",
    name: "Ethereal",
    ref: "https://app.ethereal.trade/?ref=UM68P2M9JZ6D",
    logo: "/ethereal.png",
  },
  {
    tier: "S",
    name: "Hyena",
    ref: "https://app.hyena.trade/ref/CAPY",
    logo: "/hyena.png",
  },
  {
    tier: "A",
    name: "Pacifica",
    ref: "https://app.pacifica.fi/?referral=Capy",
    logo: "/pacifica.png",
  },
  {
    tier: "A",
    name: "EdgeX",
    ref: "https://pro.edgex.exchange/referral/OLEJK",
    logo: "/edgex.png",
  },
  {
    tier: "A",
    name: "Dreamcash",
    ref: "https://dreamcash.xyz/share?code=CAPYCR",
    logo: "/dreamcash.png",
  },
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

      {/* Premium background */}
<div className="absolute inset-0 -z-10">

  {/* base gradient */}
  <div className="absolute inset-0 bg-gradient-to-br from-[#0b1020] via-[#0f1630] to-[#050814]" />

  {/* purple glow top left */}
  <div className="absolute top-[-200px] left-[-200px] w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[180px]" />

  {/* emerald glow bottom right */}
  <div className="absolute bottom-[-200px] right-[-200px] w-[600px] h-[600px] bg-emerald-500/15 rounded-full blur-[180px]" />

  {/* subtle grid */}
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

          {/* X */}
          <a
            href="https://x.com/capy_onchain"
            target="_blank"
            className="flex items-center gap-2 px-6 py-2 rounded-xl border border-neutral-700 hover:border-cyan-400 transition backdrop-blur bg-white/5"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18 2h3l-7 8 8 12h-6l-5-8-7 8H1l8-9L1 2h6l4 7 7-7z"/>
            </svg>
            capy
          </a>

          {/* Telegram */}
          <a
            href="https://t.me/olejk_2k"
            target="_blank"
            className="flex items-center gap-2 px-6 py-2 rounded-xl border border-neutral-700 hover:border-cyan-400 transition backdrop-blur bg-white/5"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22 2L2 10l5 2 2 6 4-5 6 5z"/>
            </svg>
            capy
          </a>

        </div>
      </div>

      {/* Perp list */}
      <section className="max-w-5xl mx-auto mt-20 px-6 space-y-6">

        <div className="grid grid-cols-[100px_1fr_auto] text-xs uppercase tracking-widest opacity-50 border-b border-neutral-800 pb-4">
          <div>Tier</div>
          <div>Protocol</div>
          <div></div>
        </div>

        {perps.map((perp, i) => (
          <div
            key={i}
            className="grid grid-cols-[100px_1fr_auto] items-center bg-[#0c1220]/70 backdrop-blur-xl border border-neutral-800 rounded-2xl p-5 hover:border-cyan-400/40 transition"
          >

            {/* Tier */}
            <div className="flex justify-center">
              <div
                className={`w-12 h-12 flex items-center justify-center rounded-xl font-bold border ${getTierStyle(perp.tier)}`}
              >
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

<div className="fixed right-10 top-56 w-64 bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-xl p-4">

<h3 className="text-sm text-gray-300 mb-3">Referral Boosts</h3>

<div className="text-sm mb-2">
<b>Variational</b>
<div className="text-gray-400 text-xs">+13% point boost</div>
</div>

<div className="text-sm mb-2">
<b>Extended</b>
<div className="text-gray-400 text-xs">10% fee discount</div>
<div className="text-gray-400 text-xs">+ farming boost</div>
<div className="text-gray-400 text-xs">+30% fee cashback</div>
</div>

<div className="text-sm mb-2">
<b>Hibachi</b>
<div className="text-gray-400 text-xs">+15% farming boost</div>
<div className="text-gray-400 text-xs">+15% trading discount</div>
</div>

<div className="text-sm mb-2">
<b>Hyena</b>
<div className="text-gray-400 text-xs">+10% point boost</div>
</div>

<div className="text-sm">
<b>Pacifica</b>
<div className="text-gray-400 text-xs">+15% point boost</div>
</div>

</div>

<div className="h-32" />

</main>
  )
}