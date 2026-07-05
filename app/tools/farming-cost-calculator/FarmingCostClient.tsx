"use client"

import { useMemo, useState } from "react"

function toNumber(value: string) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function money(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: value < 100 ? 2 : 0,
  }).format(Number.isFinite(value) ? value : 0)
}

function percent(value: number) {
  return `${Number.isFinite(value) ? value.toFixed(1) : "0.0"}%`
}

export default function FarmingCostClient() {
  const [weeklyVolume, setWeeklyVolume] = useState("100000")
  const [weeks, setWeeks] = useState("6")
  const [makerShare, setMakerShare] = useState("30")
  const [makerFee, setMakerFee] = useState("0.02")
  const [takerFee, setTakerFee] = useState("0.05")
  const [feeDiscount, setFeeDiscount] = useState("10")
  const [refback, setRefback] = useState("30")
  const [expectedPoints, setExpectedPoints] = useState("1000")
  const [basePointValue, setBasePointValue] = useState("1")

  const result = useMemo(() => {
    const totalVolume = toNumber(weeklyVolume) * Math.max(toNumber(weeks), 0)
    const makerRatio = Math.min(Math.max(toNumber(makerShare), 0), 100) / 100
    const makerVolume = totalVolume * makerRatio
    const takerVolume = totalVolume - makerVolume
    const grossFees =
      makerVolume * (Math.max(toNumber(makerFee), 0) / 100) +
      takerVolume * (Math.max(toNumber(takerFee), 0) / 100)
    const discountSavings =
      grossFees * (Math.max(toNumber(feeDiscount), 0) / 100)
    const feesAfterDiscount = Math.max(grossFees - discountSavings, 0)
    const refbackValue =
      feesAfterDiscount * (Math.max(toNumber(refback), 0) / 100)
    const netCost = Math.max(feesAfterDiscount - refbackValue, 0)
    const points = Math.max(toNumber(expectedPoints), 0)
    const pointValue = Math.max(toNumber(basePointValue), 0)
    const costPerPoint = points > 0 ? netCost / points : 0
    const scenario = (multiplier: number) => {
      const grossValue = points * pointValue * multiplier
      const netProfit = grossValue - netCost
      return {
        grossValue,
        netProfit,
        roi: netCost > 0 ? (netProfit / netCost) * 100 : 0,
      }
    }

    return {
      totalVolume,
      grossFees,
      discountSavings,
      refbackValue,
      netCost,
      costPerPoint,
      bear: scenario(0.5),
      base: scenario(1),
      bull: scenario(2),
    }
  }, [
    basePointValue,
    expectedPoints,
    feeDiscount,
    makerFee,
    makerShare,
    refback,
    takerFee,
    weeklyVolume,
    weeks,
  ])

  const fields = [
    ["Weekly trading volume ($)", weeklyVolume, setWeeklyVolume],
    ["Farming period (weeks)", weeks, setWeeks],
    ["Maker share (%)", makerShare, setMakerShare],
    ["Maker fee (%)", makerFee, setMakerFee],
    ["Taker fee (%)", takerFee, setTakerFee],
    ["Fee discount (%)", feeDiscount, setFeeDiscount],
    ["Refback after discount (%)", refback, setRefback],
    ["Expected points", expectedPoints, setExpectedPoints],
    ["Base point value ($)", basePointValue, setBasePointValue],
  ] as const

  return (
    <div className="grid gap-6 xl:grid-cols-[0.88fr_1.12fr]">
      <section className="rounded-3xl border border-white/10 bg-white/[0.035] p-5 sm:p-7">
        <div className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200/55">
          Activity assumptions
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {fields.map(([label, value, setter]) => (
            <label key={label}>
              <span className="mb-2 block text-xs uppercase tracking-[0.15em] text-white/38">
                {label}
              </span>
              <input
                type="number"
                min="0"
                step="any"
                value={value}
                onChange={(event) => setter(event.target.value)}
                className="h-12 w-full rounded-xl border border-white/10 bg-[#07101d] px-4 text-sm font-semibold text-white outline-none transition focus:border-cyan-300/45"
              />
            </label>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            ["Total volume", money(result.totalVolume)],
            ["Gross fees", money(result.grossFees)],
            ["Discount savings", money(result.discountSavings)],
            ["Estimated refback", money(result.refbackValue)],
            ["Net farming cost", money(result.netCost)],
            ["Break-even / point", money(result.costPerPoint)],
          ].map(([label, value]) => (
            <div
              key={label}
              className="rounded-2xl border border-white/10 bg-white/[0.035] p-5"
            >
              <div className="text-xs uppercase tracking-[0.16em] text-white/35">
                {label}
              </div>
              <div className="mt-3 text-2xl font-black">{value}</div>
            </div>
          ))}
        </div>

        <div className="rounded-3xl border border-cyan-300/15 bg-cyan-300/[0.055] p-5 sm:p-7">
          <div className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200/60">
            Point value scenarios
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {[
              ["Bear · 0.5x", result.bear],
              ["Base · 1x", result.base],
              ["Bull · 2x", result.bull],
            ].map(([label, scenario]) => {
              const value = scenario as typeof result.base
              return (
                <div
                  key={label as string}
                  className="rounded-2xl border border-white/10 bg-black/15 p-5"
                >
                  <div className="text-xs uppercase tracking-[0.16em] text-white/38">
                    {label as string}
                  </div>
                  <div className="mt-3 text-2xl font-black">
                    {money(value.netProfit)}
                  </div>
                  <div className="mt-2 text-xs text-white/42">
                    Gross {money(value.grossValue)} · ROI {percent(value.roi)}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <p className="text-xs leading-5 text-white/35">
          The calculator estimates trading costs only. It does not model PnL,
          slippage, liquidation risk, changing campaign rules, or guaranteed
          token value.
        </p>
      </section>
    </div>
  )
}
