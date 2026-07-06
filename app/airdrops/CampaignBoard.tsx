"use client"

import Image from "next/image"
import Link from "next/link"
import { useMemo, useState } from "react"
import {
  LIVE_DATA_REFRESH_COPY,
  PERP_GUIDES,
  PERPS,
  PERPS_CALC,
} from "../data/perps"

type SortMode = "tier" | "name" | "mechanic"

const tierRank: Record<string, number> = {
  "S+": 0,
  S: 1,
  A: 2,
}

export default function CampaignBoard() {
  const [query, setQuery] = useState("")
  const [mechanic, setMechanic] = useState("all")
  const [sortMode, setSortMode] = useState<SortMode>("tier")

  const mechanics = useMemo(
    () => Array.from(new Set(PERPS.map((perp) => PERP_GUIDES[perp.slug].stage))),
    []
  )

  const rows = useMemo(() => {
    const search = query.trim().toLowerCase()
    return PERPS.filter((perp) => {
      const guide = PERP_GUIDES[perp.slug]
      if (
        search &&
        !`${perp.name} ${perp.boost} ${perp.farm} ${guide.bestFor}`
          .toLowerCase()
          .includes(search)
      ) {
        return false
      }
      if (mechanic !== "all" && guide.stage !== mechanic) return false
      return true
    }).sort((a, b) => {
      if (sortMode === "name") return a.name.localeCompare(b.name)
      if (sortMode === "mechanic") {
        return PERP_GUIDES[a.slug].stage.localeCompare(PERP_GUIDES[b.slug].stage)
      }
      return (tierRank[a.tier] ?? 99) - (tierRank[b.tier] ?? 99)
    })
  }, [mechanic, query, sortMode])

  return (
    <>
      <section className="mb-6 rounded-3xl border border-white/10 bg-white/[0.035] p-4 sm:p-5">
        <div className="grid gap-3 md:grid-cols-[1fr_240px_220px]">
          <label>
            <span className="mb-2 block text-xs uppercase tracking-[0.18em] text-white/35">
              Search campaigns
            </span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Variational, fee discount, volume..."
              className="h-12 w-full rounded-xl border border-white/10 bg-[#07101d] px-4 text-sm text-white outline-none placeholder:text-white/25 focus:border-cyan-300/45"
            />
          </label>
          <label>
            <span className="mb-2 block text-xs uppercase tracking-[0.18em] text-white/35">
              Campaign mechanic
            </span>
            <select
              value={mechanic}
              onChange={(event) => setMechanic(event.target.value)}
              className="h-12 w-full rounded-xl border border-white/10 bg-[#07101d] px-4 text-sm text-white outline-none focus:border-cyan-300/45"
            >
              <option value="all">All mechanics</option>
              {mechanics.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="mb-2 block text-xs uppercase tracking-[0.18em] text-white/35">
              Sort
            </span>
            <select
              value={sortMode}
              onChange={(event) => setSortMode(event.target.value as SortMode)}
              className="h-12 w-full rounded-xl border border-white/10 bg-[#07101d] px-4 text-sm text-white outline-none focus:border-cyan-300/45"
            >
              <option value="tier">Capys tier</option>
              <option value="name">Protocol name</option>
              <option value="mechanic">Campaign mechanic</option>
            </select>
          </label>
        </div>
        <div className="mt-4 text-xs text-white/38">
          {rows.length} routes · {LIVE_DATA_REFRESH_COPY}
        </div>
      </section>

      <section className="grid gap-4">
        {rows.map((perp) => {
          const hasCalculator = perp.slug in PERPS_CALC
          const guide = PERP_GUIDES[perp.slug]

          return (
            <article
              key={perp.slug}
              className="grid gap-4 rounded-3xl border border-white/10 bg-white/[0.035] p-5 lg:grid-cols-[64px_1fr_230px_auto] lg:items-center"
            >
              <div className="relative">
                <Image
                  src={perp.logo}
                  alt={`${perp.name} logo`}
                  width={56}
                  height={56}
                  className="rounded-xl border border-white/10"
                />
                <span className="absolute -bottom-2 -right-2 rounded-lg border border-white/10 bg-[#07101d] px-2 py-1 text-[10px] font-black text-white/65">
                  {perp.tier}
                </span>
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-black">{perp.name}</h2>
                  <span className="rounded-full border border-white/10 px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-white/45">
                    {guide.stage}
                  </span>
                  <span className="rounded-full border border-cyan-300/15 bg-cyan-300/[0.06] px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-cyan-100/65">
                    {guide.effort}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-white/48">
                  Best for {guide.bestFor.toLowerCase()} В· {perp.farm}
                </p>
                <div className="mt-2 text-xs text-white/30">
                  Terms are source-linked and should be verified before use.
                </div>
              </div>

              <div>
                <div className="text-xs uppercase tracking-[0.16em] text-white/32">
                  Available terms
                </div>
                <div className="mt-2 rounded-2xl border border-emerald-300/20 bg-emerald-300/10 px-4 py-3 text-sm font-semibold text-emerald-200">
                  {perp.boost}
                </div>
              </div>

              <div className="flex flex-wrap gap-2 lg:justify-end">
                <Link
                  href={`/perps/${perp.slug}`}
                  className="rounded-xl border border-white/10 px-4 py-3 text-sm text-white/65 transition hover:text-white"
                >
                  Guide
                </Link>
                {hasCalculator && (
                  <Link
                    href={`/calculators/${perp.slug}-point-calculator`}
                    className="rounded-xl border border-white/10 px-4 py-3 text-sm text-white/65 transition hover:text-white"
                  >
                    Calculator
                  </Link>
                )}
                <a
                  href={perp.ref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl bg-cyan-300 px-4 py-3 text-sm font-black text-slate-950 transition hover:bg-cyan-200"
                >
                  Open route ↗
                </a>
              </div>
            </article>
          )
        })}
      </section>
    </>
  )
}
