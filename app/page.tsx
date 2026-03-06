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

const [tab,setTab] = useState<"list" | "calculator" | "funding">("list")
const perpsCalc = {
  nado: {
    name: "Nado",
    fdv: 1.5,
    totalPoints: 4300000,
    airdrop: 8
  },
  variational: {
    name: "Variational",
    fdv: 0.6,
    totalPoints: 9300000,
    airdrop: 30
  },
  extended: {
    name: "Extended",
    fdv: 0.5,
    totalPoints: 7700000,
    airdrop: 30
  },
  pacifica: {
    name: "Pacifica",
    fdv: 0.6,
    totalPoints: 60000000,
    airdrop: 20
  },
  ethereal: {
    name: "Ethereal",
    fdv: 0.5,
    totalPoints: 10000000,
    airdrop: 15
  },
  edgex: {
    name: "EdgeX",
    fdv: 2,
    totalPoints: 10000000,
    airdrop: 30
  },
  standx: {
    name: "StandX",
    fdv: 0.5,
    totalPoints: 50000000,
    airdrop: 20
  },
  hibachi: {
    name: "Hibachi",
    fdv: 0.15,
    totalPoints: 60000000,
    airdrop: 15
  }
}
const [calcPerp, setCalcPerp] = useState<keyof typeof perpsCalc>("nado")
const [myPoints, setMyPoints] = useState(0)

const current = perpsCalc[calcPerp]

const totalAirdropPool = current.fdv * 1000000000 * (current.airdrop / 100)
const pricePerPoint = totalAirdropPool / current.totalPoints
const myValue = myPoints * pricePerPoint

return (
    <main className="text-white relative overflow-x-hidden z-10">

      {/* Background */}
      <div className="absolute inset-0 -z-10 overflow-hidden">

        <div className="absolute inset-0 bg-gradient-to-br from-[#070b14] via-[#0f1630] to-[#050814]" />

        <div className="absolute top-[-250px] left-[-250px] w-[700px] h-[700px] bg-purple-500/40 rounded-full blur-[200px] animate-blob" />

        <div className="absolute bottom-[-250px] right-[-250px] w-[700px] h-[700px] bg-cyan-500/30 rounded-full blur-[200px] animate-blob animation-delay-2000" />

        <div className="absolute top-[40%] left-[50%] w-[600px] h-[600px] bg-emerald-500/25 rounded-full blur-[200px] animate-blob animation-delay-4000" />

        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:60px_60px]" />

      </div>

      {/* Hero */}
      <div className="relative z-20 max-w-6xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 text-center">

        {/* Made by */}
        <div className="flex justify-center items-center gap-4 mb-6 text-sm">

<span className="opacity-40">Made by</span>

<a
href="https://x.com/capy_onchain"
target="_blank"
className="flex items-center gap-2 px-3 py-1 rounded-lg border border-neutral-700 hover:border-cyan-400/40 transition bg-[#0c1220]/60"
>
<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
<path d="M18 2h3l-7 8 8 12h-6l-5-8-7 8H1l8-9L1 2h6l4 7 7-7z"/>
</svg>
Capy
</a>

<a
href="https://t.me/olejk_2k"
target="_blank"
className="flex items-center gap-2 px-3 py-1 rounded-lg border border-neutral-700 hover:border-cyan-400/40 transition bg-[#0c1220]/60"
>
<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
<path d="M21.5 2.5L2.7 9.6c-1 .4-1 1.1-.2 1.3l4.8 1.5 1.8 5.7c.2.6.1.8.7.8.5 0 .7-.2 1-.5l2.4-2.3 5 3.7c.9.5 1.5.2 1.8-.8L23 3.7c.4-1.3-.5-1.9-1.5-1.2z"/>
</svg>
Capy
</a>

</div>

        <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold tracking-tight">
          CAPY <span className="text-red-500">PERP</span> HUB
        </h1>

        <p className="mt-4 opacity-60">
          Crypto-native Perp Tier List
        </p>

        {/* Tabs */}
        <div className="flex justify-center mt-8">
          <div className="flex bg-[#0c1220]/70 border border-neutral-800 rounded-full p-1 backdrop-blur">

            <button
              onClick={() => setTab("list")}
              className={`px-5 py-2 rounded-full text-sm transition ${
                tab === "list"
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400"
                  : "text-neutral-400"
              }`}
            >
              Perp DEX List
            </button>

            <button
              onClick={() => setTab("calculator")}
              className={`px-5 py-2 rounded-full text-sm transition ${
                tab === "calculator"
                  ? "bg-purple-500/20 text-purple-300 border border-purple-400"
                  : "text-neutral-400"
              }`}
            >
              Airdrop Calculator
            </button>

            <button
              onClick={() => setTab("funding")}
              className={`px-5 py-2 rounded-full text-sm transition ${
                tab === "funding"
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400"
                  : "text-neutral-400"
              }`}
            >
              Funding Rates
            </button>

          </div>
        </div>

      </div>

      {/* PERP LIST */}
      {tab === "list" && (

        <section className="max-w-5xl mx-auto mt-16 sm:mt-20 px-4 sm:px-6 space-y-6">

          <div className="hidden md:grid grid-cols-[100px_1fr_220px_auto] text-xs uppercase tracking-widest opacity-50 border-b border-neutral-800 pb-4">
            <div className="pl-2">Tier</div>
            <div>Protocol</div>
            <div className="text-right pr-6">Boost</div>
            <div></div>
          </div>

          {perps.map((perp, i) => (

            <div
              key={i}
              className="group flex flex-col md:grid md:grid-cols-[100px_1fr_220px_auto] gap-4 items-start md:items-center bg-[#0c1220]/70 backdrop-blur-xl border border-neutral-800 rounded-2xl p-4 md:p-5 hover:scale-[1.01] hover:border-cyan-400/40 hover:shadow-[0_0_30px_rgba(34,211,238,0.2)] transition"
            >

              <div className="flex md:justify-center">
                <div className={`w-12 h-12 flex items-center justify-center rounded-xl font-bold border ${getTierStyle(perp.tier)}`}>
                  {perp.tier}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Image
                  src={perp.logo}
                  alt={perp.name}
                  width={40}
                  height={40}
                  className="md:w-[48px] md:h-[48px] rounded-lg"
                />
                <div className="text-lg font-medium">{perp.name}</div>
              </div>

              <div className="flex md:justify-center">
                <div className="text-xs sm:text-sm text-center px-3 py-1 font-medium rounded-full border border-emerald-400 text-emerald-300 bg-emerald-400/5">
                  {perp.boost}
                </div>
              </div>

              <a
                href={perp.ref}
                target="_blank"
                rel="noopener"
                className="w-full md:w-auto mt-2 md:mt-0 md:ml-4 px-6 py-2 text-center rounded-xl border border-cyan-400 text-cyan-300 bg-cyan-400/5 hover:bg-cyan-400/10 transition font-semibold"
              >
                TRADE →
              </a>

            </div>

          ))}

        </section>

      )}

      {/* CALCULATOR */}
{tab === "calculator" && (

<section className="max-w-4xl mx-auto mt-20 px-4 space-y-8">

<p className="text-center opacity-50">
Calculate your potential airdrop based on your points balance.
</p>

{/* PERP SELECTOR */}

<div className="flex flex-wrap justify-center gap-3">

{Object.keys(perpsCalc).map((key) => (

<button
key={key}
onClick={() => setCalcPerp(key as keyof typeof perpsCalc)}
className={`px-4 py-2 rounded-full text-sm border transition ${
calcPerp === key
? "border-cyan-400 text-cyan-300"
: "border-neutral-700 text-neutral-400"
}`}
>

{perpsCalc[key as keyof typeof perpsCalc].name}

</button>

))}

</div>

{/* INPUTS */}

<div className="grid md:grid-cols-2 gap-6">

<div>
<p className="text-xs opacity-50 mb-2">MY POINTS</p>

<input
type="number"
value={myPoints}
onChange={(e)=>setMyPoints(Number(e.target.value))}
className="w-full bg-[#0c1220] border border-neutral-800 rounded-xl p-4"
/>

</div>

<div>
<p className="text-xs opacity-50 mb-2">FDV (billions $)</p>

<input
type="number"
value={current.fdv}
readOnly
className="w-full bg-[#0c1220] border border-neutral-800 rounded-xl p-4"
/>

</div>

<div>
<p className="text-xs opacity-50 mb-2">TOTAL POINTS</p>

<input
type="number"
value={current.totalPoints}
readOnly
className="w-full bg-[#0c1220] border border-neutral-800 rounded-xl p-4"
/>

</div>

<div>
<p className="text-xs opacity-50 mb-2">AIRDROP % SUPPLY</p>

<input
type="number"
value={current.airdrop}
readOnly
className="w-full bg-[#0c1220] border border-neutral-800 rounded-xl p-4"
/>

</div>

</div>

{/* RESULT */}

<div className="bg-[#0c1220]/70 border border-neutral-800 rounded-2xl p-8 mt-10">

<h2 className="text-xl text-cyan-300 mb-4">

{current.name}

</h2>

<div className="text-4xl font-bold mb-6">

${myValue.toFixed(2)}

</div>

<div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">

<div className="bg-black/30 p-4 rounded-lg">
<p className="opacity-50">Total Airdrop Pool</p>
<p>${(totalAirdropPool/1000000).toFixed(2)}M</p>
</div>

<div className="bg-black/30 p-4 rounded-lg">
<p className="opacity-50">My Points</p>
<p>{myPoints}</p>
</div>

<div className="bg-black/30 p-4 rounded-lg">
<p className="opacity-50">Price per point</p>
<p>${pricePerPoint.toFixed(2)}</p>
</div>

<div className="bg-black/30 p-4 rounded-lg">
<p className="opacity-50">Airdrop %</p>
<p>{current.airdrop}%</p>
</div>

</div>

</div>

</section>

)}

{/* FUNDING */}
{tab === "funding" && (

  <div className="max-w-4xl mx-auto mt-20 text-center min-h-screen">

    <div className="bg-[#0c1220]/70 border border-neutral-800 rounded-2xl p-10">

      <div className="text-xl opacity-60 mb-4">
        Funding Rates
      </div>

      <div className="opacity-40">
         coming soon
      </div>

    </div>

  </div>

)}

</main>
)
}