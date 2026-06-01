"use client"

import { useMemo, useState } from "react"

type CalculatorClientProps = {
  airdrop: number
  fdv: number
  name: string
  totalPoints: number
}

function sanitizeNumber(value: string) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
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

export function CalculatorClient({
  airdrop,
  fdv,
  name,
  totalPoints,
}: CalculatorClientProps) {
  const [myPoints, setMyPoints] = useState(0)
  const [fdvInput, setFdvInput] = useState(fdv)
  const [totalPointsInput, setTotalPointsInput] = useState(totalPoints)
  const [airdropInput, setAirdropInput] = useState(airdrop)

  const safeFdv = Math.max(fdvInput, 0)
  const safeTotalPoints = Math.max(totalPointsInput, 1)
  const safeAirdrop = Math.min(Math.max(airdropInput, 0), 100)
  const safeMyPoints = Math.max(myPoints, 0)

  const { pricePerPoint, value } = useMemo(() => {
    const pool = safeFdv * 1_000_000_000 * (safeAirdrop / 100)
    const price = pool / safeTotalPoints

    return {
      pricePerPoint: price,
      value: safeMyPoints * price,
    }
  }, [safeAirdrop, safeFdv, safeMyPoints, safeTotalPoints])

  return (
    <div className="grid gap-5 rounded-[2rem] border border-cyan-300/15 bg-cyan-300/[0.055] p-5 shadow-2xl shadow-black/20 backdrop-blur-xl md:grid-cols-2">
      <div className="md:col-span-2">
        <div className="rounded-3xl border border-cyan-300/20 bg-[#07101d]/82 p-6">
          <div className="text-xs uppercase tracking-[0.24em] text-cyan-100/55">
            {name} estimated airdrop value
          </div>
          <div className="mt-3 text-5xl font-black text-white">
            {formatMoney(value, 0)}
          </div>
          <div className="mt-2 text-sm text-white/55">
            {formatMoney(pricePerPoint, 4)} per point at{" "}
            {formatCompactMoney(safeFdv * 1_000_000_000)} FDV
          </div>
        </div>
      </div>

      <label className="block">
        <span className="mb-2 block text-xs uppercase tracking-[0.22em] text-white/40">
          My {name} points
        </span>
        <input
          type="number"
          min="0"
          value={myPoints}
          onChange={(event) => setMyPoints(sanitizeNumber(event.target.value))}
          className="w-full rounded-2xl border border-white/10 bg-[#07101d] p-4 text-white outline-none transition placeholder:text-white/25 focus:border-cyan-300"
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-xs uppercase tracking-[0.22em] text-white/40">
          FDV (billions $)
        </span>
        <input
          type="number"
          min="0"
          step="0.1"
          value={fdvInput}
          onChange={(event) => setFdvInput(sanitizeNumber(event.target.value))}
          className="w-full rounded-2xl border border-white/10 bg-[#07101d] p-4 text-white outline-none transition placeholder:text-white/25 focus:border-cyan-300"
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-xs uppercase tracking-[0.22em] text-white/40">
          Total {name} points
        </span>
        <input
          type="number"
          min="1"
          value={totalPointsInput}
          onChange={(event) =>
            setTotalPointsInput(sanitizeNumber(event.target.value))
          }
          className="w-full rounded-2xl border border-white/10 bg-[#07101d] p-4 text-white outline-none transition placeholder:text-white/25 focus:border-cyan-300"
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-xs uppercase tracking-[0.22em] text-white/40">
          Airdrop % supply
        </span>
        <input
          type="number"
          min="0"
          max="100"
          value={airdropInput}
          onChange={(event) =>
            setAirdropInput(sanitizeNumber(event.target.value))
          }
          className="w-full rounded-2xl border border-white/10 bg-[#07101d] p-4 text-white outline-none transition placeholder:text-white/25 focus:border-cyan-300"
        />
      </label>

      <div className="grid gap-3 md:col-span-2 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <div className="text-xs uppercase tracking-[0.2em] text-white/35">
            Points
          </div>
          <div className="mt-2 text-xl font-bold text-white">
            {formatNumber(safeMyPoints)}
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <div className="text-xs uppercase tracking-[0.2em] text-white/35">
            Point price
          </div>
          <div className="mt-2 text-xl font-bold text-white">
            {formatMoney(pricePerPoint, 4)}
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <div className="text-xs uppercase tracking-[0.2em] text-white/35">
            FDV
          </div>
          <div className="mt-2 text-xl font-bold text-white">
            {formatCompactMoney(safeFdv * 1_000_000_000)}
          </div>
        </div>
      </div>
    </div>
  )
}
