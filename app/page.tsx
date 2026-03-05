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
    <main className="text-white relative overflow-x-hidden bg-[#070b14]">

      {/* Animated Background */}
<div className="absolute inset-0 -z-10 overflow-hidden">

  {/* base gradient */}
  <div className="absolute inset-0 bg-gradient-to-br from-[#050814] via-[#0b1020] to-[#020617]" />

  {/* BIG PURPLE */}
  <div className="absolute top-[-150px] left-[-150px] w-[700px] h-[700px] bg-purple-600/50 rounded-full blur-[120px] animate-blob" />

  {/* BIG CYAN */}
  <div className="absolute bottom-[-150px] right-[-150px] w-[700px] h-[700px] bg-cyan-500/50 rounded-full blur-[120px] animate-blob animation-delay-2000" />

  {/* CENTER PINK */}
  <div className="absolute top-[40%] left-[40%] w-[600px] h-[600px] bg-pink-500/40 rounded-full blur-[120px] animate-blob animation-delay-4000" />

</div>

      {/* Hero */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 text-center">

        <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold tracking-tight">
          CAPY <span className="text-red-500">PERP</span> HUB
        </h1>

        <p className="mt-4 opacity-60">
          Crypto-native Perp Tier List
        </p>

        {/* Socials */}
        <div className="flex flex-wrap justify-center gap-3 sm:gap-6 mt-6">

          <a
  href="https://x.com/capy_onchain"
  target="_blank"
rel="noopener"
  className="flex items-center gap-2 px-6 py-2 rounded-xl border border-neutral-700 hover:border-cyan-400/40 hover:scale-[1.01] transition backdrop-blur bg-white/5"
>
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18 2h3l-7 8 8 12h-6l-5-8-7 8H1l8-9L1 2h6l4 7 7-7z"/>
  </svg>
  capy
</a>

          <a
  href="https://t.me/olejk_2k"
  target="_blank"
rel="noopener"
  className="flex items-center gap-2 px-6 py-2 rounded-xl border border-neutral-700 hover:border-cyan-400/40 hover:scale-[1.01] transition backdrop-blur bg-white/5"
>
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M22 2L2 10l5 2 2 6 4-5 6 5z"/>
  </svg>
  capy
</a>

        </div>

      </div>

      {/* Perp list */}
      <section className="max-w-5xl mx-auto mt-16 sm:mt-20 px-4 sm:px-6 space-y-6">

        <div className="hidden md:grid grid-cols-[100px_1fr_200px_auto] text-xs uppercase tracking-widest opacity-50 border-b border-neutral-800 pb-4">
          <div>Tier</div>
          <div>Protocol</div>
          <div className="text-center">Boost</div>
          <div></div>
        </div>

        {perps.map((perp, i) => (

          <div
            key={i}
            className="flex flex-col md:grid md:grid-cols-[100px_1fr_200px_auto] gap-4 items-start md:items-center bg-[#0c1220]/70 backdrop-blur-xl border border-neutral-800 rounded-2xl p-4 md:p-5 hover:border-cyan-400/40 hover:scale-[1.01] transition"
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
  width={32}
  height={32}
  className="md:w-[40px] md:h-[40px]"
/>
              <div className="text-lg font-medium">{perp.name}</div>
            </div>

            {/* BOOST */}
<div className="flex md:justify-center">
  <div className="text-xs sm:text-sm text-center px-3 py-1 font-medium rounded-full border border-emerald-400 text-emerald-300 bg-emerald-400/5 max-w-[220px] md:max-w-full break-words">
    {perp.boost}
  </div>
</div>

            {/* Button */}
            <a
  href={perp.ref}
  target="_blank"
rel="noopener"
  className="w-full md:w-auto mt-2 md:mt-0 md:ml-4 px-6 py-2 text-center rounded-xl border border-cyan-400 text-cyan-300 hover:bg-cyan-400/10 hover:shadow-[0_0_15px_rgba(34,211,238,0.6)] transition font-semibold"
>
  TRADE →
</a>

          </div>

        ))}

      </section>



    </main>
  )
}