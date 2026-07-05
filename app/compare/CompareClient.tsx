"use client"

import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { PERP_GUIDES, PERPS, PERPS_CALC } from "../data/perps"

export default function CompareClient() {
  const [leftSlug, setLeftSlug] = useState("variational")
  const [rightSlug, setRightSlug] = useState("hibachi")
  const left = PERPS.find((perp) => perp.slug === leftSlug) ?? PERPS[0]
  const right =
    PERPS.find((perp) => perp.slug === rightSlug) ?? PERPS[PERPS.length - 1]
  const leftGuide = PERP_GUIDES[left.slug]
  const rightGuide = PERP_GUIDES[right.slug]
  const leftCalc = PERPS_CALC[left.slug as keyof typeof PERPS_CALC]
  const rightCalc = PERPS_CALC[right.slug as keyof typeof PERPS_CALC]

  const rows = [
    ["Tier", left.tier, right.tier],
    ["Current terms", left.boost, right.boost],
    ["Farming focus", left.farm, right.farm],
    ["Campaign type", leftGuide.stage, rightGuide.stage],
    ["Best for", leftGuide.bestFor, rightGuide.bestFor],
    ["Effort", leftGuide.effort, rightGuide.effort],
    ["Cost profile", leftGuide.costProfile, rightGuide.costProfile],
    [
      "Calculator FDV",
      leftCalc ? `$${leftCalc.fdv}B scenario` : "No dedicated preset",
      rightCalc ? `$${rightCalc.fdv}B scenario` : "No dedicated preset",
    ],
    [
      "Airdrop allocation",
      leftCalc ? `${leftCalc.airdrop}% scenario` : "Not modeled",
      rightCalc ? `${rightCalc.airdrop}% scenario` : "Not modeled",
    ],
  ]

  return (
    <div className="space-y-6">
      <section className="grid gap-4 rounded-3xl border border-white/10 bg-white/[0.035] p-5 md:grid-cols-[1fr_auto_1fr] md:items-end">
        <label>
          <span className="mb-2 block text-xs uppercase tracking-[0.18em] text-white/35">
            First perp
          </span>
          <select
            value={leftSlug}
            onChange={(event) => setLeftSlug(event.target.value)}
            className="h-12 w-full rounded-xl border border-white/10 bg-[#07101d] px-4 text-sm font-semibold text-white outline-none focus:border-cyan-300/45"
          >
            {PERPS.map((perp) => (
              <option key={perp.slug} value={perp.slug}>
                {perp.name}
              </option>
            ))}
          </select>
        </label>
        <div className="pb-3 text-center text-xs font-black uppercase tracking-[0.2em] text-white/30">
          VS
        </div>
        <label>
          <span className="mb-2 block text-xs uppercase tracking-[0.18em] text-white/35">
            Second perp
          </span>
          <select
            value={rightSlug}
            onChange={(event) => setRightSlug(event.target.value)}
            className="h-12 w-full rounded-xl border border-white/10 bg-[#07101d] px-4 text-sm font-semibold text-white outline-none focus:border-cyan-300/45"
          >
            {PERPS.map((perp) => (
              <option key={perp.slug} value={perp.slug}>
                {perp.name}
              </option>
            ))}
          </select>
        </label>
      </section>

      <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.025]">
        <div className="grid grid-cols-[130px_1fr_1fr] border-b border-white/10 bg-[#070d18] sm:grid-cols-[200px_1fr_1fr]">
          <div className="p-4" />
          {[left, right].map((perp) => (
            <div
              key={perp.slug}
              className="flex flex-col items-center gap-3 border-l border-white/10 p-5 text-center sm:flex-row sm:text-left"
            >
              <Image
                src={perp.logo}
                alt={`${perp.name} logo`}
                width={48}
                height={48}
                className="rounded-xl"
              />
              <div>
                <div className="text-lg font-black">{perp.name}</div>
                <div className="mt-1 text-xs text-white/35">Tier {perp.tier}</div>
              </div>
            </div>
          ))}
        </div>

        {rows.map(([label, leftValue, rightValue]) => (
          <div
            key={label}
            className="grid grid-cols-[130px_1fr_1fr] border-b border-white/[0.07] last:border-b-0 sm:grid-cols-[200px_1fr_1fr]"
          >
            <div className="p-4 text-xs font-semibold uppercase tracking-[0.14em] text-white/38 sm:p-5">
              {label}
            </div>
            <div className="border-l border-white/[0.07] p-4 text-sm leading-6 text-white/65 sm:p-5">
              {leftValue}
            </div>
            <div className="border-l border-white/[0.07] p-4 text-sm leading-6 text-white/65 sm:p-5">
              {rightValue}
            </div>
          </div>
        ))}
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {[
          [left, leftGuide, leftCalc],
          [right, rightGuide, rightCalc],
        ].map(([perpValue, guideValue, calcValue]) => {
          const perp = perpValue as typeof left
          const guide = guideValue as typeof leftGuide
          const calc = calcValue as typeof leftCalc
          return (
            <article
              key={perp.slug}
              className="rounded-3xl border border-white/10 bg-white/[0.035] p-6"
            >
              <h2 className="text-2xl font-black">{perp.name} next steps</h2>
              <ul className="mt-4 space-y-3">
                {guide.actions.slice(0, 2).map((action) => (
                  <li
                    key={action}
                    className="flex gap-3 text-sm leading-6 text-white/55"
                  >
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-300" />
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                <Link
                  href={`/perps/${perp.slug}`}
                  className="rounded-xl border border-white/10 px-4 py-3 text-center text-sm font-semibold text-white/70"
                >
                  Full guide
                </Link>
                {calc && (
                  <Link
                    href={`/calculators/${perp.slug}-point-calculator`}
                    className="rounded-xl border border-cyan-300/25 bg-cyan-300/10 px-4 py-3 text-center text-sm font-semibold text-cyan-100"
                  >
                    Calculator
                  </Link>
                )}
              </div>
            </article>
          )
        })}
      </section>
    </div>
  )
}
