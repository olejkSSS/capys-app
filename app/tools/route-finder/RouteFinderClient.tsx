"use client"

import Image from "next/image"
import Link from "next/link"
import { useMemo, useState } from "react"
import { PERP_GUIDES, PERPS } from "../../data/perps"

type Capital = "small" | "medium" | "large"
type Effort = "low" | "active"
type Goal = "points" | "fees" | "deposit" | "private"

const preferenceMap: Record<
  string,
  { capital: Capital[]; effort: Effort[]; goals: Goal[] }
> = {
  variational: {
    capital: ["small", "medium", "large"],
    effort: ["active"],
    goals: ["points"],
  },
  txflow: {
    capital: ["small", "medium", "large"],
    effort: ["active"],
    goals: ["fees"],
  },
  risex: {
    capital: ["small", "medium", "large"],
    effort: ["low", "active"],
    goals: ["private"],
  },
  hibachi: {
    capital: ["small", "medium", "large"],
    effort: ["active"],
    goals: ["points", "fees"],
  },
  bulk: {
    capital: ["small", "medium", "large"],
    effort: ["low"],
    goals: ["deposit"],
  },
  extended: {
    capital: ["medium", "large"],
    effort: ["active"],
    goals: ["points", "fees"],
  },
  pacifica: {
    capital: ["medium", "large"],
    effort: ["active"],
    goals: ["points"],
  },
  meridian: {
    capital: ["small", "medium", "large"],
    effort: ["active"],
    goals: ["points"],
  },
  reya: {
    capital: ["small", "medium", "large"],
    effort: ["active"],
    goals: ["points"],
  },
}

export default function RouteFinderClient() {
  const [capital, setCapital] = useState<Capital>("medium")
  const [effort, setEffort] = useState<Effort>("active")
  const [goal, setGoal] = useState<Goal>("points")

  const recommendations = useMemo(
    () =>
      PERPS.map((perp) => {
        const preferences = preferenceMap[perp.slug]
        let score = 0
        const reasons: string[] = []

        if (preferences.capital.includes(capital)) {
          score += 2
          reasons.push("fits the selected capital range")
        }
        if (preferences.effort.includes(effort)) {
          score += 3
          reasons.push(
            effort === "active"
              ? "matches active farming"
              : "supports a lower-touch route"
          )
        }
        if (preferences.goals.includes(goal)) {
          score += 5
          reasons.push(
            goal === "points"
              ? "prioritizes points"
              : goal === "fees"
                ? "reduces trading costs"
                : goal === "deposit"
                  ? "uses deposit-led participation"
                  : "offers private access"
          )
        }

        return { perp, score, reasons }
      })
        .sort((a, b) => b.score - a.score)
        .slice(0, 3),
    [capital, effort, goal]
  )

  return (
    <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
      <section className="h-fit rounded-3xl border border-white/10 bg-white/[0.035] p-6">
        <div className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200/55">
          Your farming profile
        </div>

        <fieldset className="mt-6">
          <legend className="text-sm font-bold">Capital</legend>
          <div className="mt-3 grid gap-2">
            {[
              ["small", "Under $1,000"],
              ["medium", "$1,000 – $5,000"],
              ["large", "$5,000+"],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setCapital(value as Capital)}
                className={`rounded-xl border px-4 py-3 text-left text-sm transition ${
                  capital === value
                    ? "border-cyan-300/45 bg-cyan-300/15 text-cyan-100"
                    : "border-white/10 bg-black/10 text-white/55 hover:text-white"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="mt-6">
          <legend className="text-sm font-bold">Effort</legend>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {[
              ["low", "Lower touch"],
              ["active", "Active"],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setEffort(value as Effort)}
                className={`rounded-xl border px-3 py-3 text-sm transition ${
                  effort === value
                    ? "border-cyan-300/45 bg-cyan-300/15 text-cyan-100"
                    : "border-white/10 bg-black/10 text-white/55 hover:text-white"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="mt-6">
          <legend className="text-sm font-bold">Primary goal</legend>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {[
              ["points", "Points"],
              ["fees", "Lower fees"],
              ["deposit", "Deposit"],
              ["private", "Private access"],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setGoal(value as Goal)}
                className={`rounded-xl border px-3 py-3 text-sm transition ${
                  goal === value
                    ? "border-cyan-300/45 bg-cyan-300/15 text-cyan-100"
                    : "border-white/10 bg-black/10 text-white/55 hover:text-white"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </fieldset>
      </section>

      <section>
        <div className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-200/65">
          Best fit for this profile
        </div>
        <h2 className="mt-3 text-3xl font-black">Three routes to research first</h2>
        <div className="mt-6 grid gap-4">
          {recommendations.map(({ perp, reasons }, index) => {
            const guide = PERP_GUIDES[perp.slug]
            return (
              <article
                key={perp.slug}
                className="rounded-3xl border border-white/10 bg-white/[0.035] p-5 sm:p-6"
              >
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                  <div className="flex items-center gap-4">
                    <div className="grid h-10 w-10 place-items-center rounded-xl border border-cyan-300/20 bg-cyan-300/10 text-sm font-black text-cyan-200">
                      {index + 1}
                    </div>
                    <Image
                      src={perp.logo}
                      alt={`${perp.name} logo`}
                      width={52}
                      height={52}
                      className="rounded-xl"
                    />
                    <div>
                      <div className="text-xl font-black">{perp.name}</div>
                      <div className="mt-1 text-xs text-white/40">
                        Tier {perp.tier} · {guide.effort}
                      </div>
                    </div>
                  </div>

                  <div className="sm:ml-auto">
                    <div className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-4 py-2 text-sm font-semibold text-emerald-200">
                      {perp.boost}
                    </div>
                  </div>
                </div>

                <p className="mt-5 text-sm leading-6 text-white/55">
                  {guide.summary}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {reasons.map((reason) => (
                    <span
                      key={reason}
                      className="rounded-full border border-white/10 bg-black/15 px-3 py-2 text-xs text-white/48"
                    >
                      {reason}
                    </span>
                  ))}
                </div>

                <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                  <Link
                    href={`/perps/${perp.slug}`}
                    className="rounded-xl border border-white/10 px-4 py-3 text-center text-sm font-semibold text-white/70 transition hover:text-white"
                  >
                    Read farming guide
                  </Link>
                  <a
                    href={perp.ref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-xl bg-cyan-300 px-4 py-3 text-center text-sm font-black text-slate-950"
                  >
                    Open route ↗
                  </a>
                </div>
              </article>
            )
          })}
        </div>
        <p className="mt-4 text-xs leading-5 text-white/35">
          This finder matches farming mechanics, not expected returns. Verify
          current rules and set a risk budget before depositing or trading.
        </p>
      </section>
    </div>
  )
}
