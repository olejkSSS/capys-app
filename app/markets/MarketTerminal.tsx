"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useMemo, useState } from "react"

type MarketRow = {
  name: string
  slug: string
  logo: string | null
  chains: string[]
  openInterest: number | null
  oiChange1d: number | null
  oiChange7d: number | null
  normalizedVolume24h: number | null
  reportedVolume24h: number | null
  volume7d: number | null
  volume30d: number | null
  methodologyUrl: string | null
  capyRoute: string | null
  capyDetailsUrl: string | null
}

type MarketResponse = {
  rows: MarketRow[]
  updatedAt: string
  openInterestTotal: number
  volumeMode: "live" | "snapshot"
  volumeUpdatedAt: string
  stale?: boolean
  error?: string
}

type SortKey =
  | "rank"
  | "name"
  | "openInterest"
  | "normalizedVolume24h"
  | "reportedVolume24h"
  | "volume7d"
  | "volume30d"
  | "oiChange1d"

const WATCHLIST_KEY = "capys:market-watchlist"

function formatCompact(value: number | null) {
  if (value === null || !Number.isFinite(value)) return "—"

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: value >= 1_000_000_000 ? 2 : 1,
  })
    .format(value)
    .replace("T", "t")
    .replace("B", "b")
    .replace("M", "m")
}

function formatChange(value: number | null) {
  if (value === null || !Number.isFinite(value)) return "—"
  const sign = value > 0 ? "+" : ""
  return `${sign}${value.toFixed(2)}%`
}

function changeClass(value: number | null) {
  if (value === null || !Number.isFinite(value)) return "text-white/28"
  if (value > 0) return "text-emerald-300"
  if (value < 0) return "text-rose-300"
  return "text-white/50"
}

export default function MarketTerminal() {
  const [data, setData] = useState<MarketResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState("")
  const [chain, setChain] = useState("all")
  const [capyOnly, setCapyOnly] = useState(false)
  const [watchlistOnly, setWatchlistOnly] = useState(false)
  const [watchlist, setWatchlist] = useState<string[]>([])
  const [sortKey, setSortKey] = useState<SortKey>("openInterest")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(WATCHLIST_KEY)
      if (stored) setWatchlist(JSON.parse(stored))
    } catch {
      setWatchlist([])
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        setLoading(true)
        const response = await fetch("/api/perp-market", {
          headers: { Accept: "application/json" },
        })
        const payload = (await response.json()) as MarketResponse
        if (!response.ok) throw new Error(payload.error || "Market API error")
        if (!cancelled) {
          setData(payload)
          setError(null)
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(
            loadError instanceof Error ? loadError.message : "Market API error"
          )
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [])

  const chains = useMemo(() => {
    const values = new Set<string>()
    for (const row of data?.rows ?? []) {
      for (const item of row.chains) values.add(item)
    }
    return Array.from(values).sort((a, b) => a.localeCompare(b))
  }, [data])

  const rows = useMemo(() => {
    const search = query.trim().toLowerCase()
    const base = (data?.rows ?? []).filter((row) => {
      if (
        search &&
        !`${row.name} ${row.slug} ${row.chains.join(" ")}`
          .toLowerCase()
          .includes(search)
      ) {
        return false
      }
      if (chain !== "all" && !row.chains.includes(chain)) return false
      if (capyOnly && !row.capyRoute) return false
      if (watchlistOnly && !watchlist.includes(row.slug)) return false
      return true
    })

    return base
      .map((row, index) => ({ ...row, originalRank: index + 1 }))
      .sort((a, b) => {
        let comparison = 0

        if (sortKey === "rank") {
          comparison = a.originalRank - b.originalRank
        } else if (sortKey === "name") {
          comparison = a.name.localeCompare(b.name)
        } else {
          comparison = (a[sortKey] ?? -1) - (b[sortKey] ?? -1)
        }

        return sortDirection === "asc" ? comparison : -comparison
      })
  }, [
    capyOnly,
    chain,
    data,
    query,
    sortDirection,
    sortKey,
    watchlist,
    watchlistOnly,
  ])

  const volume24h = useMemo(
    () =>
      (data?.rows ?? []).reduce(
        (sum, row) =>
          sum + (row.normalizedVolume24h ?? row.reportedVolume24h ?? 0),
        0
      ),
    [data]
  )

  const capyRoutes = useMemo(
    () => (data?.rows ?? []).filter((row) => row.capyRoute).length,
    [data]
  )

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDirection((current) => (current === "desc" ? "asc" : "desc"))
    } else {
      setSortKey(key)
      setSortDirection(key === "name" || key === "rank" ? "asc" : "desc")
    }
  }

  function sortArrow(key: SortKey) {
    if (sortKey !== key) return ""
    return sortDirection === "desc" ? " ↓" : " ↑"
  }

  const hasActiveFilters =
    query.trim() !== "" ||
    chain !== "all" ||
    capyOnly ||
    watchlistOnly

  function clearFilters() {
    setQuery("")
    setChain("all")
    setCapyOnly(false)
    setWatchlistOnly(false)
  }

  function toggleWatch(slug: string) {
    setWatchlist((current) => {
      const next = current.includes(slug)
        ? current.filter((item) => item !== slug)
        : [...current, slug]
      window.localStorage.setItem(WATCHLIST_KEY, JSON.stringify(next))
      return next
    })
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Tracked protocols", data?.rows.length ?? 0],
          ["Open interest", formatCompact(data?.openInterestTotal ?? null)],
          ["Visible 24h volume", formatCompact(volume24h)],
          ["Capy routes", capyRoutes],
        ].map(([label, value]) => (
          <div
            key={label}
            className="rounded-2xl border border-white/10 bg-white/[0.035] p-5"
          >
            <div className="text-xs uppercase tracking-[0.2em] text-white/35">
              {label}
            </div>
            <div className="mt-3 text-3xl font-black text-white">{value}</div>
          </div>
        ))}
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/[0.035] p-4 sm:p-6">
        <div className="grid gap-3 lg:grid-cols-[1fr_220px_auto_auto]">
          <label>
            <span className="mb-2 block text-xs uppercase tracking-[0.18em] text-white/35">
              Search protocols
            </span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Hyperliquid, Variational, Solana..."
              className="h-12 w-full rounded-xl border border-white/10 bg-[#07101d] px-4 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-cyan-300/45"
            />
          </label>

          <label>
            <span className="mb-2 block text-xs uppercase tracking-[0.18em] text-white/35">
              Chain
            </span>
            <select
              value={chain}
              onChange={(event) => setChain(event.target.value)}
              className="h-12 w-full rounded-xl border border-white/10 bg-[#07101d] px-4 text-sm text-white outline-none focus:border-cyan-300/45"
            >
              <option value="all">All chains</option>
              {chains.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            onClick={() => setCapyOnly((current) => !current)}
            className={`mt-auto h-12 rounded-xl border px-4 text-sm font-semibold transition ${
              capyOnly
                ? "border-emerald-300/40 bg-emerald-300/15 text-emerald-200"
                : "border-white/10 bg-white/[0.03] text-white/60 hover:text-white"
            }`}
          >
            Capy routes only
          </button>

          <button
            type="button"
            onClick={() => setWatchlistOnly((current) => !current)}
            className={`mt-auto h-12 rounded-xl border px-4 text-sm font-semibold transition ${
              watchlistOnly
                ? "border-cyan-300/40 bg-cyan-300/15 text-cyan-100"
                : "border-white/10 bg-white/[0.03] text-white/60 hover:text-white"
            }`}
          >
            Watchlist ({watchlist.length})
          </button>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-white/38">
          <div className="flex flex-wrap items-center gap-3">
            <span>
              Showing <strong className="text-white/65">{rows.length}</strong>{" "}
              of{" "}
              <strong className="text-white/65">{data?.rows.length ?? 0}</strong>{" "}
              protocols with live OI coverage
            </span>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="rounded-lg border border-white/10 px-3 py-1.5 font-semibold text-white/60 transition hover:border-cyan-300/30 hover:text-white"
              >
                Clear filters
              </button>
            )}
          </div>
          <span>
            OI: live DefiLlama · Volume:{" "}
            <strong
              className={
                data?.volumeMode === "live"
                  ? "text-emerald-300"
                  : "text-amber-200"
              }
            >
              {data?.volumeMode === "live"
                ? "live Pro feed"
                : `public table snapshot${
                    data?.volumeUpdatedAt
                      ? ` · ${new Date(data.volumeUpdatedAt).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          }
                        )}`
                      : ""
                  }`}
            </strong>
          </span>
        </div>
      </section>

      {loading && (
        <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-12 text-center text-white/45">
          Loading perp market data...
        </div>
      )}

      {error && !data && (
        <div className="rounded-3xl border border-rose-300/20 bg-rose-300/[0.06] p-6 text-sm text-rose-100">
          {error}
        </div>
      )}

      {!loading && data && (
        <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.025]">
          <div className="max-h-[72vh] overflow-auto">
            <table className="w-full min-w-[1180px] border-collapse text-left">
              <thead className="sticky top-0 z-10 bg-[#070d18] text-[11px] uppercase tracking-[0.16em] text-white/40 shadow-[0_1px_0_rgba(255,255,255,0.08)]">
                <tr>
                  <th className="w-12 px-4 py-4" />
                  <th className="px-4 py-4">
                    <button type="button" onClick={() => toggleSort("rank")}>
                      #{sortArrow("rank")}
                    </button>
                  </th>
                  <th className="px-4 py-4">
                    <button type="button" onClick={() => toggleSort("name")}>
                      Protocol{sortArrow("name")}
                    </button>
                  </th>
                  <th className="px-4 py-4 text-right">
                    <button
                      type="button"
                      onClick={() => toggleSort("normalizedVolume24h")}
                    >
                      Normalized 24h{sortArrow("normalizedVolume24h")}
                    </button>
                  </th>
                  <th className="px-4 py-4 text-right">
                    <button
                      type="button"
                      onClick={() => toggleSort("reportedVolume24h")}
                    >
                      Reported 24h{sortArrow("reportedVolume24h")}
                    </button>
                  </th>
                  <th className="px-4 py-4 text-right">
                    <button
                      type="button"
                      onClick={() => toggleSort("openInterest")}
                    >
                      Open interest{sortArrow("openInterest")}
                    </button>
                  </th>
                  <th className="px-4 py-4 text-right">
                    <button type="button" onClick={() => toggleSort("oiChange1d")}>
                      OI 24h{sortArrow("oiChange1d")}
                    </button>
                  </th>
                  <th className="px-4 py-4 text-right">
                    <button type="button" onClick={() => toggleSort("volume7d")}>
                      Volume 7d{sortArrow("volume7d")}
                    </button>
                  </th>
                  <th className="px-4 py-4 text-right">
                    <button type="button" onClick={() => toggleSort("volume30d")}>
                      Volume 30d{sortArrow("volume30d")}
                    </button>
                  </th>
                  <th className="px-4 py-4 text-right">Route</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 && (
                  <tr>
                    <td
                      colSpan={10}
                      className="px-6 py-16 text-center text-sm text-white/45"
                    >
                      No protocols match these filters. Clear filters or try a
                      broader search.
                    </td>
                  </tr>
                )}
                {rows.map((row, index) => (
                  <tr
                    key={row.slug}
                    className="border-t border-white/[0.07] transition hover:bg-cyan-300/[0.035]"
                  >
                    <td className="px-4 py-4">
                      <button
                        type="button"
                        onClick={() => toggleWatch(row.slug)}
                        aria-label={
                          watchlist.includes(row.slug)
                            ? `Remove ${row.name} from watchlist`
                            : `Add ${row.name} to watchlist`
                        }
                        className={`text-lg transition ${
                          watchlist.includes(row.slug)
                            ? "text-cyan-300"
                            : "text-white/20 hover:text-white/60"
                        }`}
                      >
                        {watchlist.includes(row.slug) ? "★" : "☆"}
                      </button>
                    </td>
                    <td className="px-4 py-4 text-sm text-white/38">
                      {index + 1}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-white/[0.04]">
                          {row.logo ? (
                            <Image
                              src={row.logo}
                              alt={`${row.name} logo`}
                              fill
                              sizes="40px"
                              className="object-cover"
                              unoptimized
                            />
                          ) : (
                            <span className="grid h-full place-items-center text-sm font-black text-white/45">
                              {row.name.slice(0, 1)}
                            </span>
                          )}
                        </span>
                        <div>
                          <div className="font-bold text-white">{row.name}</div>
                          <div className="mt-1 max-w-[240px] truncate text-xs text-white/35">
                            {row.chains.length
                              ? row.chains.join(" · ")
                              : "Chain data unavailable"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right font-semibold text-white/72">
                      {formatCompact(row.normalizedVolume24h)}
                    </td>
                    <td className="px-4 py-4 text-right font-semibold text-white/72">
                      {formatCompact(row.reportedVolume24h)}
                    </td>
                    <td className="px-4 py-4 text-right font-bold text-white">
                      {formatCompact(row.openInterest)}
                    </td>
                    <td
                      className={`px-4 py-4 text-right font-semibold ${changeClass(
                        row.oiChange1d
                      )}`}
                    >
                      {formatChange(row.oiChange1d)}
                    </td>
                    <td className="px-4 py-4 text-right font-semibold text-white/65">
                      {formatCompact(row.volume7d)}
                    </td>
                    <td className="px-4 py-4 text-right font-semibold text-white/65">
                      {formatCompact(row.volume30d)}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-2">
                        {row.capyDetailsUrl && (
                          <Link
                            href={row.capyDetailsUrl}
                            className="rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-white/60 transition hover:text-white"
                          >
                            Guide
                          </Link>
                        )}
                        <a
                          href={
                            row.capyRoute ||
                            `https://defillama.com/protocol/${row.slug}?tvl=false&events=false&perpVolume=true`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`rounded-lg px-3 py-2 text-xs font-black transition ${
                            row.capyRoute
                              ? "bg-cyan-300 text-slate-950 hover:bg-cyan-200"
                              : "border border-white/10 text-white/55 hover:text-white"
                          }`}
                        >
                          {row.capyRoute ? "Trade" : "Data"} ↗
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <div className="flex flex-col gap-2 text-xs leading-5 text-white/35 sm:flex-row sm:items-center sm:justify-between">
        <p>
          The free live open-interest feed currently covers{" "}
          <strong className="text-white/60">{data?.rows.length ?? 0}</strong>{" "}
          protocols. DefiLlama&apos;s Perps page can show a larger count because
          its volume-adapter catalog is a separate dataset. Open interest data
          is provided by{" "}
          <a
            href="https://defillama.com/perps"
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-300"
          >
            DefiLlama
          </a>
          . Volume switches to the official live feed when a DefiLlama Pro API
          key is configured.
        </p>
        {data?.updatedAt && (
          <span className="shrink-0">
            OI updated {new Date(data.updatedAt).toLocaleString("en-US")}
          </span>
        )}
      </div>
    </div>
  )
}
