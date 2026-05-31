"use client"

import Image from "next/image"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { toPng } from "html-to-image"
import { motion } from "motion/react"
import {
  DEFAULT_FUNDING_EXCHANGES,
  type FundingExchangeMeta,
  PERPS,
  PERPS_CALC,
  SITE_URL,
  TEMPLATES,
} from "./data/perps"

type Tab = "list" | "calculator" | "funding"
type CalcPerpKey = keyof typeof PERPS_CALC
type FundingMetricMode = "interval" | "annualized"
type FundingBias = "longs_pay_shorts" | "shorts_pay_longs" | "neutral"
type FundingExchangeKey = string
type FundingRowLimit = 100 | 250 | 500 | "all"
type FundingSortKey = "maxArb" | "oiRank" | "symbol"
type FundingSortDirection = "desc" | "asc"

type FundingApiRow = {
  exchange: string
  display: string
  symbol: string
  funding: number
  oiRank: string
  bias: FundingBias
}

type FundingApiExchange = FundingExchangeMeta

type RawFundingApiRow = Partial<FundingApiRow> & {
  [key: string]: unknown
}

type FundingMatrixRow = {
  symbol: string
  oiRank: string
  maxArb: number
  activeCount: number
  buyExchange: { key: FundingExchangeKey; label: string } | null
  sellExchange: { key: FundingExchangeKey; label: string } | null
  byExchange: Record<string, number | null>
}

const INITIAL_FUNDING_KEYS = DEFAULT_FUNDING_EXCHANGES.map(
  (exchange) => exchange.key
) as FundingExchangeKey[]

function getTierStyle(tier: string) {
  if (tier === "S+") {
    return "bg-purple-500/20 border-purple-400 text-purple-300 shadow-[0_0_35px_rgba(168,85,247,0.9)]"
  }

  if (tier === "S") {
    return "bg-yellow-500/20 border-yellow-400 text-yellow-300 shadow-[0_0_22px_rgba(250,204,21,0.7)]"
  }

  if (tier === "A") {
    return "bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_22px_rgba(34,211,238,0.7)]"
  }

  return ""
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

function sanitizeNumber(value: string) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}



function formatFundingValue(value: unknown) {
  const numeric = Number(value)
  if (!Number.isFinite(numeric)) return "—"

  const abs = Math.abs(numeric)
  let digits = 4

  if (abs >= 100) digits = 1
  else if (abs >= 10) digits = 2
  else if (abs >= 1) digits = 3

  const sign = numeric > 0 ? "+" : ""
  return `${sign}${numeric.toFixed(digits)}%`
}

function formatSpreadValue(value: unknown) {
  const numeric = Number(value)
  if (!Number.isFinite(numeric)) return "—"

  const abs = Math.abs(numeric)
  let digits = 4

  if (abs >= 100) digits = 1
  else if (abs >= 10) digits = 2
  else if (abs >= 1) digits = 3

  return `${numeric.toFixed(digits)}%`
}

function getFundingCellClass(value: number | null) {
  if (value === null || !Number.isFinite(value)) {
    return "bg-transparent text-white/20"
  }

  if (value > 0) {
    return "bg-red-500/12 text-red-300"
  }

  if (value < 0) {
    return "bg-emerald-500/12 text-emerald-300"
  }

  return "bg-neutral-700/20 text-neutral-300"
}

function parseOiRank(value: unknown) {
  if (value === null || value === undefined) return 999999

  const normalized = String(value)
  if (!normalized) return 999999

  if (normalized.includes("+")) {
    const numeric = Number(normalized.replace("+", ""))
    return Number.isFinite(numeric) ? numeric : 999999
  }

  const numeric = Number(normalized)
  return Number.isFinite(numeric) ? numeric : 999999
}

function toDisplayedFundingValue(
  rawFunding: number,
  exchange: FundingExchangeMeta | undefined,
  metricMode: FundingMetricMode
) {
  const meta = exchange ?? DEFAULT_FUNDING_EXCHANGES[0]

  const actualIntervalFunding =
    meta.intervalHours === 1 ? rawFunding / 8 : rawFunding

  if (metricMode === "annualized") {
    return actualIntervalFunding * (24 / meta.intervalHours) * 365
  }

  return actualIntervalFunding
}

const TABS = [
  { id: "list", label: "Perp List" },
  { id: "calculator", label: "Airdrop Calculator" },
  { id: "funding", label: "Funding Screener" },
] as const

export default function Home() {
  const [tab, setTab] = useState<Tab>("list")
  const [calcPerp, setCalcPerp] = useState<CalcPerpKey>("variational")
  const [myPoints, setMyPoints] = useState(0)
  const [templatePicker, setTemplatePicker] = useState(false)
  const [selectedTemplate, setSelectedTemplate] =
    useState<(typeof TEMPLATES)[number]>("cinema")
  const [isDownloading, setIsDownloading] = useState(false)
  

  const [copiedRefName, setCopiedRefName] = useState<string | null>(null)
  const [copiedTicker, setCopiedTicker] = useState<string | null>(null)

  const [fundingRows, setFundingRows] = useState<FundingApiRow[]>([])
  const [fundingExchanges, setFundingExchanges] = useState<FundingApiExchange[]>(
    DEFAULT_FUNDING_EXCHANGES
  )
  const [fundingUpdatedAt, setFundingUpdatedAt] = useState<string | null>(null)
  const [fundingStale, setFundingStale] = useState(false)
  const [fundingLoading, setFundingLoading] = useState(false)
  const [fundingError, setFundingError] = useState<string | null>(null)
  const [fundingSort, setFundingSort] = useState<{
    key: FundingSortKey
    direction: FundingSortDirection
  }>({ key: "maxArb", direction: "desc" })
  const [searchTicker, setSearchTicker] = useState("")
  const [enabledFundingExchanges, setEnabledFundingExchanges] =
    useState<FundingExchangeKey[]>(INITIAL_FUNDING_KEYS)
  const [fundingMetricMode, setFundingMetricMode] =
    useState<FundingMetricMode>("interval")
  const [onlyActionable, setOnlyActionable] = useState(true)
  const [fundingRowLimit, setFundingRowLimit] = useState<FundingRowLimit>(100)
  const [refreshCountdown, setRefreshCountdown] = useState(90)
  const [customTemplate, setCustomTemplate] = useState<string | null>(null)

  const cardRef = useRef<HTMLDivElement>(null)
  const fundingRequestInFlightRef = useRef(false)
  const listCopyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const tickerCopyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const current = PERPS_CALC[calcPerp]
  const cardTemplateSrc = customTemplate ?? `/templates/${selectedTemplate}.png`

  const selectTab = (nextTab: Tab) => {
    setTab(nextTab)
    window.history.replaceState(null, "", `#${nextTab}`)
  }

  const [fdv, setFdv] = useState<number>(current.fdv)
  const [totalPoints, setTotalPoints] = useState<number>(current.totalPoints)
  const [airdrop, setAirdrop] = useState<number>(current.airdrop)

  useEffect(() => {
    setFdv(current.fdv)
    setTotalPoints(current.totalPoints)
    setAirdrop(current.airdrop)
  }, [current])

  useEffect(() => {
    const hash = window.location.hash.replace("#", "")
    if (hash === "calculator" || hash === "funding" || hash === "list") {
      setTab(hash)
    }
  }, [])

  useEffect(() => {
    return () => {
      if (listCopyTimeoutRef.current) clearTimeout(listCopyTimeoutRef.current)
      if (tickerCopyTimeoutRef.current) clearTimeout(tickerCopyTimeoutRef.current)
    }
  }, [])

  const loadFunding = useCallback(
    async (silent = false) => {
      if (fundingRequestInFlightRef.current) return

      try {
        fundingRequestInFlightRef.current = true
        if (!silent) setFundingLoading(true)
        setFundingError(null)

        const res = await fetch("/api/funding")

        const data = await res.json()

        if (!res.ok) {
          throw new Error(data?.error || "Failed to load funding data")
        }

        const safeRows = Array.isArray(data?.rows)
          ? data.rows
              .filter((row: unknown) => row && typeof row === "object")
              .map((row: RawFundingApiRow) => ({
                exchange: String(row.exchange ?? ""),
                display: String(row.display ?? row.exchange ?? ""),
                symbol: String(row.symbol ?? "").toUpperCase(),
                funding: Number.isFinite(Number(row.funding))
                  ? Number(row.funding)
                  : 0,
                oiRank: String(row.oiRank ?? "500+"),
                bias:
                  row.bias === "longs_pay_shorts" ||
                  row.bias === "shorts_pay_longs" ||
                  row.bias === "neutral"
                    ? row.bias
                    : "neutral",
              }))
          : []

        const safeExchanges: FundingApiExchange[] = Array.isArray(data?.exchanges)
          ? data.exchanges
              .filter((exchange: unknown) => exchange && typeof exchange === "object")
              .map((exchange: Partial<FundingApiExchange>) => ({
                key: String(exchange.key ?? ""),
                label: String(exchange.label ?? exchange.key ?? ""),
                intervalHours: exchange.intervalHours === 1 ? 1 : 8,
                tradeUrl: String(exchange.tradeUrl ?? "#"),
                hasPersonalRef: Boolean(exchange.hasPersonalRef),
              }))
              .filter((exchange: FundingApiExchange) => exchange.key && exchange.label)
          : DEFAULT_FUNDING_EXCHANGES

        setFundingExchanges(safeExchanges)
        setEnabledFundingExchanges((prev) => {
          const availableKeys = safeExchanges.map((exchange) => exchange.key)
          const kept = prev.filter((key) => availableKeys.includes(key))
          return kept.length ? kept : availableKeys
        })
        setFundingRows(safeRows)
        setFundingUpdatedAt(data?.updatedAt ? String(data.updatedAt) : null)
        setFundingStale(Boolean(data?.stale))
        setRefreshCountdown(90)
      } catch (error) {
        setFundingError(
          error instanceof Error ? error.message : "Failed to load funding data"
        )
      } finally {
        fundingRequestInFlightRef.current = false
        if (!silent) setFundingLoading(false)
      }
    },
    []
  )

  useEffect(() => {
    if (tab !== "funding") return
    void loadFunding(false)
  }, [tab, loadFunding])

  useEffect(() => {
    if (tab !== "funding") return

    const interval = setInterval(() => {
      setRefreshCountdown((prev) => {
        if (prev <= 1) {
          void loadFunding(true)
          return 90
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [tab, loadFunding])

  const safeTotalPoints = Math.max(totalPoints, 1)
  const safeAirdrop = Math.min(Math.max(airdrop, 0), 100)
  const safeFdv = Math.max(fdv, 0)
  const safeMyPoints = Math.max(myPoints, 0)

  const { pricePerPoint, myValue } = useMemo(() => {
    const pool = safeFdv * 1_000_000_000 * (safeAirdrop / 100)
    const price = pool / safeTotalPoints
    const value = safeMyPoints * price

    return {
      pricePerPoint: price,
      myValue: value,
    }
  }, [safeFdv, safeAirdrop, safeTotalPoints, safeMyPoints])

  

  const activeFundingExchanges = useMemo(
    () =>
      fundingExchanges.filter((exchange) =>
        enabledFundingExchanges.includes(exchange.key)
      ),
    [fundingExchanges, enabledFundingExchanges]
  )

  const fundingExchangeByKey = useMemo(
    () =>
      new Map(
        fundingExchanges.map((exchange) => [exchange.key, exchange] as const)
      ),
    [fundingExchanges]
  )

  const visibleFundingRows = useMemo(() => {
    const search = searchTicker.trim().toUpperCase()

    return fundingRows
      .filter((row) =>
        enabledFundingExchanges.includes(row.exchange as FundingExchangeKey)
      )
      .filter((row) => !search || row.symbol.includes(search))
      .map((row) => {
        const exchangeKey = row.exchange as FundingExchangeKey
        const exchangeMeta = fundingExchangeByKey.get(exchangeKey)
        return {
          ...row,
          displayFunding: toDisplayedFundingValue(
            row.funding,
            exchangeMeta,
            fundingMetricMode
          ),
        }
      })
  }, [
    fundingRows,
    enabledFundingExchanges,
    searchTicker,
    fundingMetricMode,
    fundingExchangeByKey,
  ])

  const fundingMatrixRows = useMemo(() => {
    try {
      const grouped = new Map<
        string,
        {
          symbol: string
          oiRank: string
          byExchange: Record<string, number | null>
        }
      >()

      for (const row of visibleFundingRows) {
        const exchangeKey = row.exchange as FundingExchangeKey
        const symbol = String(row.symbol ?? "").trim()
        if (!symbol) continue

        if (!grouped.has(symbol)) {
          grouped.set(symbol, {
            symbol,
            oiRank: String(row.oiRank ?? "500+"),
            byExchange: Object.fromEntries(
              fundingExchanges.map((exchange) => [exchange.key, null])
            ),
          })
        }

        const currentGroup = grouped.get(symbol)!
        currentGroup.byExchange[exchangeKey] = Number.isFinite(row.displayFunding)
          ? row.displayFunding
          : null

        if (parseOiRank(row.oiRank) < parseOiRank(currentGroup.oiRank)) {
          currentGroup.oiRank = String(row.oiRank ?? "500+")
        }
      }

      const matrix = Array.from(grouped.values()).map((group) => {
        const values = activeFundingExchanges
          .map((exchange) => group.byExchange[exchange.key])
          .filter((value): value is number => value !== null && Number.isFinite(value))

        const maxFunding = values.length ? Math.max(...values) : 0
        const minFunding = values.length ? Math.min(...values) : 0
        const maxArb = maxFunding - minFunding

        const highestEntry =
  activeFundingExchanges
    .map((exchange) => ({
      key: exchange.key,
      label: String(exchange.label),
      value: group.byExchange[exchange.key] ?? null,
    }))
    .filter((item) => item.value !== null)
    .sort((a, b) => Number(b.value ?? 0) - Number(a.value ?? 0))[0] ?? null

        const lowestEntry =
  activeFundingExchanges
    .map((exchange) => ({
      key: exchange.key,
      label: String(exchange.label),
      value: group.byExchange[exchange.key] ?? null,
    }))
    .filter((item) => item.value !== null)
    .sort((a, b) => Number(a.value ?? 0) - Number(b.value ?? 0))[0] ?? null

        return {
          symbol: group.symbol,
          oiRank: group.oiRank,
          maxArb,
          activeCount: values.length,
          buyExchange:
            lowestEntry && highestEntry && lowestEntry.key !== highestEntry.key
              ? { key: lowestEntry.key, label: lowestEntry.label }
              : null,
          sellExchange:
            lowestEntry && highestEntry && lowestEntry.key !== highestEntry.key
              ? { key: highestEntry.key, label: highestEntry.label }
              : null,
          byExchange: group.byExchange,
        } satisfies FundingMatrixRow
      })

      const filtered = onlyActionable
        ? matrix.filter((row) => row.activeCount >= 2 && row.maxArb > 0)
        : matrix

      return filtered.sort((a, b) => {
        let comparison = 0

        if (fundingSort.key === "symbol") {
          comparison = a.symbol.localeCompare(b.symbol)
        }

        if (fundingSort.key === "oiRank") {
          comparison = parseOiRank(a.oiRank) - parseOiRank(b.oiRank)
        }

        if (fundingSort.key === "maxArb") {
          comparison = a.maxArb - b.maxArb
        }

        return fundingSort.direction === "asc" ? comparison : -comparison
      })
    } catch (error) {
      console.error("Funding matrix build failed:", error)
      return []
    }
  }, [
    visibleFundingRows,
    activeFundingExchanges,
    fundingExchanges,
    fundingSort,
    onlyActionable,
  ])

  const topFundingPositive = useMemo(() => {
    const positive = visibleFundingRows.filter((row) => row.displayFunding > 0)
    if (!positive.length) return null
    return [...positive].sort((a, b) => b.displayFunding - a.displayFunding)[0]
  }, [visibleFundingRows])

  const topFundingNegative = useMemo(() => {
    const negative = visibleFundingRows.filter((row) => row.displayFunding < 0)
    if (!negative.length) return null
    return [...negative].sort((a, b) => a.displayFunding - b.displayFunding)[0]
  }, [visibleFundingRows])

  const topFundingSpread = fundingMatrixRows[0] ?? null
  const renderedFundingRows = useMemo(
    () =>
      fundingRowLimit === "all"
        ? fundingMatrixRows
        : fundingMatrixRows.slice(0, fundingRowLimit),
    [fundingMatrixRows, fundingRowLimit]
  )
  const hiddenFundingRows = Math.max(
    fundingMatrixRows.length - renderedFundingRows.length,
    0
  )

  const setFundingSortKey = (key: FundingSortKey) => {
    setFundingSort((prev) => ({
      key,
      direction:
        prev.key === key
          ? prev.direction === "desc"
            ? "asc"
            : "desc"
          : key === "symbol"
            ? "asc"
            : "desc",
    }))
  }

  const sortLabel = (key: FundingSortKey) => {
    if (fundingSort.key !== key) return ""
    return fundingSort.direction === "desc" ? "↓" : "↑"
  }

  const copyRefCode = async (perpName: string, refCode: string) => {
    try {
      await navigator.clipboard.writeText(refCode)
      setCopiedRefName(perpName)

      if (listCopyTimeoutRef.current) clearTimeout(listCopyTimeoutRef.current)
      listCopyTimeoutRef.current = setTimeout(() => {
        setCopiedRefName(null)
      }, 1600)
    } catch (error) {
      console.error("Failed to copy ref code:", error)
    }
  }

  const copyTickerValue = async (symbol: string) => {
    try {
      await navigator.clipboard.writeText(symbol)
      setCopiedTicker(symbol)

      if (tickerCopyTimeoutRef.current) clearTimeout(tickerCopyTimeoutRef.current)
      tickerCopyTimeoutRef.current = setTimeout(() => {
        setCopiedTicker(null)
      }, 1400)
    } catch (error) {
      console.error("Failed to copy ticker:", error)
    }
  }

  const toggleFundingExchange = (exchangeKey: FundingExchangeKey) => {
    setEnabledFundingExchanges((prev) => {
      if (prev.includes(exchangeKey)) {
        return prev.filter((key) => key !== exchangeKey)
      }

      return [...prev, exchangeKey]
    })
  }

  const resetFundingFilters = () => {
    setEnabledFundingExchanges(fundingExchanges.map((exchange) => exchange.key))
    setSearchTicker("")
    setOnlyActionable(true)
    setFundingMetricMode("interval")
    setFundingSort({ key: "maxArb", direction: "desc" })
    setFundingRowLimit(100)
  }

  const uploadCustomTemplate = (file: File | undefined) => {
    if (!file || !file.type.startsWith("image/")) return

    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setCustomTemplate(reader.result)
        setTemplatePicker(false)
      }
    }
    reader.readAsDataURL(file)
  }

  const downloadCard = async () => {
    if (!cardRef.current || isDownloading) return

    try {
      setIsDownloading(true)

      await document.fonts.ready
      await new Promise((resolve) => setTimeout(resolve, 250))

      const dataUrl = await createCardDataUrl()

      const link = document.createElement("a")
      link.download = `${current.name.toLowerCase()}-airdrop-card.png`
      link.href = dataUrl
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error("Card download failed:", error)
      alert("Failed to download card.")
    } finally {
      setIsDownloading(false)
    }
  }

  const createCardDataUrl = async () => {
    if (!cardRef.current) throw new Error("Card is not ready")

    await document.fonts.ready
    await new Promise((resolve) => setTimeout(resolve, 250))

    return toPng(cardRef.current, {
      cacheBust: true,
      pixelRatio: 2,
      backgroundColor: "#060b16",
    })
  }

  const shareOnX = async () => {
    const text = `My potential ${current.name} airdrop is ${formatMoney(myValue, 0)}.

My points: ${formatNumber(safeMyPoints)}
Est. FDV: ${formatCompactMoney(safeFdv * 1_000_000_000)}
Airdrop: ${safeAirdrop}%

Calculate yours on ${SITE_URL}`

    try {
      setIsDownloading(true)
      const dataUrl = await createCardDataUrl()
      const imageBlob = await fetch(dataUrl).then((res) => res.blob())
      const file = new File(
        [imageBlob],
        `${current.name.toLowerCase()}-airdrop-card.png`,
        { type: "image/png" }
      )

      if (
        navigator.canShare?.({ files: [file] }) &&
        typeof navigator.share === "function"
      ) {
        await navigator.share({
          title: `${current.name} airdrop estimate`,
          text,
          files: [file],
        })
        return
      }

      const link = document.createElement("a")
      link.download = file.name
      link.href = dataUrl
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        `${text}\n\nCard image downloaded. Attach it to the post.`
      )}`
      window.open(url, "_blank", "noopener,noreferrer")
    } catch (error) {
      console.error("X share failed:", error)
      const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`
      window.open(url, "_blank", "noopener,noreferrer")
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <main className="relative z-10 min-h-screen overflow-x-hidden bg-[#050814] pb-20 text-white">
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.18),transparent_32%),linear-gradient(135deg,#030610_0%,#07111f_44%,#050814_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(to_right,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:72px_72px] [mask-image:linear-gradient(to_bottom,black,transparent_82%)]" />
        <div className="absolute left-[-260px] top-[-260px] h-[680px] w-[680px] animate-blob rounded-full bg-cyan-500/20 blur-[170px]" />
        <div className="animation-delay-2000 absolute right-[-260px] top-[18%] h-[620px] w-[620px] animate-blob rounded-full bg-indigo-500/20 blur-[180px]" />
        <div className="animation-delay-4000 absolute bottom-[-280px] left-[35%] h-[640px] w-[640px] animate-blob rounded-full bg-emerald-500/15 blur-[190px]" />
      </div>

      <div className="relative z-20 mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3 shadow-2xl shadow-black/20 backdrop-blur-xl">
          <button
            type="button"
            onClick={() => selectTab("list")}
            className="flex items-center gap-3 text-left"
            aria-label="Go to Capys app home"
          >
            <span className="grid h-10 w-10 place-items-center rounded-xl border border-cyan-300/25 bg-cyan-300/10 text-sm font-black text-cyan-200 shadow-[0_0_24px_rgba(34,211,238,0.18)]">
              C
            </span>
            <span>
              <span className="block text-sm font-semibold tracking-[0.24em] text-white">
                CAPYS
              </span>
              <span className="block text-xs text-white/45">Perp farming console</span>
            </span>
          </button>

          <div className="hidden items-center gap-2 text-sm md:flex">
            {TABS.map((item) => (
              <button
                key={`nav-${item.id}`}
                onClick={() => selectTab(item.id as Tab)}
                className={`rounded-full px-4 py-2 transition ${
                  tab === item.id
                    ? "bg-white text-black"
                    : "text-white/55 hover:bg-white/10 hover:text-white"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <a
              href="https://x.com/capy_onchain"
              target="_blank"
              rel="noopener noreferrer"
              className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-white/70 transition hover:border-cyan-300/40 hover:text-cyan-200"
              aria-label="Open Capy on X"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18 2h3l-7 8 8 12h-6l-5-8-7 8H1l8-9L1 2h6l4 7 7-7z" />
              </svg>
            </a>

            <a
              href="https://t.me/olejk_2k"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden rounded-xl border border-cyan-300/25 bg-cyan-300/10 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-300/15 sm:inline-flex"
            >
              Contact
            </a>
          </div>
        </header>

        <section className="grid min-h-[680px] items-center gap-10 py-14 lg:grid-cols-[1.05fr_0.95fr] lg:py-20">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.26em] text-emerald-200">
              Live perp farming dashboard
            </div>

            <h1 className="max-w-4xl text-5xl font-black leading-[0.95] tracking-tight text-white sm:text-6xl lg:text-7xl">
              Farm perps with a cleaner edge.
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-7 text-white/62 sm:text-lg">
              Compare referral boosts, estimate point upside, and scan live funding
              spreads across the perp DEXs that matter. Built for fast decisions,
              not spreadsheet archaeology.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={() => selectTab("funding")}
                className="rounded-2xl bg-cyan-300 px-6 py-4 text-sm font-black uppercase tracking-[0.18em] text-slate-950 shadow-[0_0_34px_rgba(34,211,238,0.28)] transition hover:-translate-y-0.5 hover:bg-cyan-200"
              >
                Scan funding
              </button>

              <button
                onClick={() => selectTab("calculator")}
                className="rounded-2xl border border-white/12 bg-white/[0.04] px-6 py-4 text-sm font-semibold text-white/80 transition hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/[0.08]"
              >
                Estimate airdrop
              </button>
            </div>

            <div className="mt-10 grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                ["40+", "tracked venues"],
                ["17", "calc presets"],
                ["90s", "safe refresh"],
                ["100%", "ref links kept"],
              ].map(([value, label]) => (
                <div
                  key={label}
                  className="rounded-2xl border border-white/10 bg-white/[0.035] p-4 backdrop-blur"
                >
                  <div className="text-2xl font-black text-white">{value}</div>
                  <div className="mt-1 text-xs uppercase tracking-[0.18em] text-white/38">
                    {label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-6 rounded-[2rem] bg-cyan-300/10 blur-3xl" />
            <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#08111f]/88 p-5 shadow-2xl shadow-black/40 backdrop-blur-xl">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <div className="text-xs uppercase tracking-[0.28em] text-white/35">
                    Opportunity snapshot
                  </div>
                  <div className="mt-2 text-2xl font-bold text-white">Perp command center</div>
                </div>
                <div className="rounded-full border border-emerald-300/25 bg-emerald-300/10 px-3 py-1 text-xs font-semibold text-emerald-200">
                  Online
                </div>
              </div>

              <div className="max-h-[360px] space-y-3 overflow-y-auto pr-1">
                {PERPS.map((perp) => (
                  <a
                    href={perp.ref}
                    target="_blank"
                    rel="noopener noreferrer"
                    key={`hero-${perp.name}`}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-white/8 bg-white/[0.035] p-3 transition hover:border-cyan-300/35 hover:bg-white/[0.07]"
                  >
                    <div className="flex items-center gap-3">
                      <Image
                        src={perp.logo}
                        alt={perp.name}
                        width={40}
                        height={40}
                        className="rounded-xl"
                      />
                      <div>
                        <div className="font-semibold text-white">{perp.name}</div>
                      </div>
                    </div>
                    <span
                      className={`rounded-xl border px-3 py-1 text-xs font-black ${getTierStyle(
                        perp.tier
                      )}`}
                    >
                      {perp.tier}
                    </span>
                  </a>
                ))}
              </div>

              <div className="mt-5 rounded-2xl border border-cyan-300/15 bg-cyan-300/8 p-4">
                <div>
                  <div>
                    <div className="text-xs uppercase tracking-[0.22em] text-cyan-100/55">
                      Best next action
                    </div>
                    <div className="mt-1 text-sm text-white/75">
                      Click any perp above to open it with the best available terms through Capy links.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="sticky top-3 z-30 mx-auto flex max-w-3xl justify-center">
          <div className="flex w-full flex-wrap justify-center gap-1 rounded-2xl border border-white/10 bg-[#07101d]/88 p-1 shadow-2xl shadow-black/25 backdrop-blur-xl sm:w-auto">
            {TABS.map((item) => {
              const isActive = tab === item.id

              return (
                <button
                  key={item.id}
                  onClick={() => selectTab(item.id as Tab)}
                  className={`relative flex-1 rounded-xl px-4 py-3 text-xs font-semibold transition-colors duration-300 sm:flex-none sm:px-5 sm:text-sm ${
                    isActive ? "text-slate-950" : "text-white/52 hover:text-white"
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="active-tab"
                      className="absolute inset-0 rounded-xl bg-cyan-300 shadow-[0_0_24px_rgba(34,211,238,0.22)]"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}

                  <span className="relative z-10">{item.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {tab === "list" && (
        <section className="mx-auto mt-14 max-w-6xl space-y-6 px-4 sm:px-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/55">
                Referral boost board
              </div>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
                Perp DEX tier list
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/50">
                Ranked by practical farming value: points boosts, fee discounts,
                refback, and the kind of activity each venue rewards.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3 text-sm text-white/55">
              Click a boost pill to copy the referral code.
            </div>
          </div>

          <div className="hidden grid-cols-[88px_1fr_260px_auto] border-b border-white/10 px-2 pb-4 text-xs uppercase tracking-[0.22em] text-white/35 md:grid">
            <div>Tier</div>
            <div>Protocol</div>
            <div className="pr-6 text-right">Boost</div>
            <div />
          </div>

          {PERPS.map((perp) => (
            <div
              key={perp.name}
              className="group relative flex flex-col items-start gap-4 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035] p-4 shadow-xl shadow-black/10 backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-cyan-300/35 hover:bg-white/[0.055] hover:shadow-[0_0_36px_rgba(34,211,238,0.12)] md:grid md:grid-cols-[88px_1fr_260px_auto] md:items-center md:p-5"
            >
              <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-cyan-300/0 via-cyan-300/55 to-emerald-300/0 opacity-0 transition group-hover:opacity-100" />

              <div className="flex md:justify-start">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl border text-sm font-black ${getTierStyle(
                    perp.tier
                  )}`}
                >
                  {perp.tier}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Image
                  src={perp.logo}
                  alt={perp.name}
                  width={48}
                  height={48}
                  className="rounded-lg"
                />

                <div>
                  <div className="text-lg font-bold text-white">{perp.name}</div>
                  <div className="mt-1 text-xs leading-5 text-white/45">
                    Farm tip: {perp.farm}
                  </div>
                </div>
              </div>

              <div className="flex md:justify-center">
                <button
                  type="button"
                  onClick={() => copyRefCode(perp.name, perp.refCode)}
                  className="group/boost relative rounded-full border border-emerald-300/25 bg-emerald-300/10 px-3 py-2 text-center text-xs font-semibold text-emerald-200 transition hover:bg-emerald-300/15 sm:text-sm"
                >
                  {copiedRefName === perp.name ? "Copied code" : perp.boost}

                  <span className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 w-max -translate-x-1/2 rounded-xl border border-white/10 bg-[#07101d] px-3 py-2 text-[11px] text-white opacity-0 shadow-lg transition group-hover/boost:opacity-100">
                    Code: <span className="text-cyan-300">{perp.refCode}</span> • click to copy
                  </span>
                </button>
              </div>

              <a
                href={perp.ref}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 w-full rounded-2xl border border-cyan-300/30 bg-cyan-300/10 px-6 py-3 text-center text-sm font-black uppercase tracking-[0.16em] text-cyan-100 transition hover:bg-cyan-300 hover:text-slate-950 md:ml-4 md:mt-0 md:w-auto"
              >
                TRADE →
              </a>
            </div>
          ))}
        </section>
      )}

      {tab === "calculator" && (
        <section className="mx-auto mt-14 max-w-6xl space-y-8 px-4 sm:px-6">
          <div className="text-center">
            <div className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/55">
              Points to dollars
            </div>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
              Airdrop value calculator
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-white/50">
              Stress-test FDV, supply allocation, and your points balance before
              you decide where the next trading cycle goes.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-2 rounded-3xl border border-white/10 bg-white/[0.03] p-3 backdrop-blur-xl">
            {Object.keys(PERPS_CALC).map((key) => {
              const perpKey = key as CalcPerpKey
              const isActive = calcPerp === perpKey

              return (
                <button
                  key={key}
                  onClick={() => setCalcPerp(perpKey)}
                  className={`rounded-full border px-4 py-2 text-sm transition ${
                    isActive
                      ? "border-cyan-300 bg-cyan-300 text-slate-950 shadow-[0_0_18px_rgba(34,211,238,0.22)]"
                      : "border-white/10 bg-white/[0.03] text-white/52 hover:border-white/20 hover:text-white"
                  }`}
                >
                  {PERPS_CALC[perpKey].name}
                </button>
              )
            })}
          </div>

          <div className="grid gap-5 rounded-3xl border border-white/10 bg-white/[0.035] p-5 shadow-2xl shadow-black/20 backdrop-blur-xl md:grid-cols-2">
            <div className="md:col-span-2">
              <div className="rounded-3xl border border-cyan-300/15 bg-cyan-300/8 p-5">
                <div className="text-xs uppercase tracking-[0.24em] text-cyan-100/55">
                  Current estimate
                </div>
                <div className="mt-3 text-4xl font-black text-white sm:text-5xl">
                  {formatMoney(myValue, 0)}
                </div>
                <div className="mt-2 text-sm text-white/55">
                  {formatMoney(pricePerPoint, 4)} per point at {formatCompactMoney(safeFdv * 1_000_000_000)} FDV
                </div>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs uppercase tracking-[0.22em] text-white/40">
                My points
              </label>
              <input
                type="number"
                min="0"
                value={myPoints}
                onChange={(e) => setMyPoints(sanitizeNumber(e.target.value))}
                className="w-full rounded-2xl border border-white/10 bg-[#07101d] p-4 text-white outline-none transition placeholder:text-white/25 focus:border-cyan-300"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs uppercase tracking-[0.22em] text-white/40">
                FDV (billions $)
              </label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={fdv}
                onChange={(e) => setFdv(sanitizeNumber(e.target.value))}
                className="w-full rounded-2xl border border-white/10 bg-[#07101d] p-4 text-white outline-none transition placeholder:text-white/25 focus:border-cyan-300"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs uppercase tracking-[0.22em] text-white/40">
                Total points
              </label>
              <input
                type="number"
                min="1"
                value={totalPoints}
                onChange={(e) => setTotalPoints(sanitizeNumber(e.target.value))}
                className="w-full rounded-2xl border border-white/10 bg-[#07101d] p-4 text-white outline-none transition placeholder:text-white/25 focus:border-cyan-300"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs uppercase tracking-[0.22em] text-white/40">
                Airdrop % supply
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={airdrop}
                onChange={(e) => setAirdrop(sanitizeNumber(e.target.value))}
                className="w-full rounded-2xl border border-white/10 bg-[#07101d] p-4 text-white outline-none transition placeholder:text-white/25 focus:border-cyan-300"
              />
            </div>
          </div>

          <div
            ref={cardRef}
            className="relative mt-10 aspect-[16/9] overflow-hidden rounded-[28px] border border-cyan-300/20 bg-[#060b16] shadow-[0_0_48px_rgba(34,211,238,0.12)]"
          >
            <Image
              src={cardTemplateSrc}
              alt="Card template"
              fill
              sizes="(max-width: 768px) 100vw, 1024px"
              className="object-cover"
              priority
            />

            <div className="absolute inset-0 bg-gradient-to-r from-[#050a14]/92 via-[#050a14]/45 to-transparent" />
            <div className="absolute inset-0 bg-black/15" />

            <div className="relative z-10 flex h-full flex-col p-5 sm:p-7 md:p-10">
              <div className="flex items-start justify-between gap-4">
                <div className="max-w-[62%]">
                  <div className="mb-3 text-[10px] font-semibold uppercase tracking-[0.35em] text-cyan-300/85 sm:text-xs">
                    capys.app
                  </div>

                  <div className="mb-3 inline-flex items-center rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-sm text-cyan-300 sm:text-base">
                    {current.name}
                  </div>

                  <div className="text-[10px] uppercase tracking-[0.35em] text-white/45 sm:text-xs">
                    Potential Airdrop Value
                  </div>

                  <div className="mt-3 text-3xl font-bold leading-none text-white sm:text-4xl md:text-6xl">
                    {formatMoney(myValue, 0)}
                  </div>

                  <div className="mt-3 text-sm text-white/65 sm:text-base">
                    {formatNumber(safeMyPoints)} points • {formatMoney(pricePerPoint, 2)} per point
                  </div>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-[10px] uppercase tracking-[0.22em] text-white/45 sm:px-4 sm:text-xs">
                  estimate only
                </div>
              </div>

              <div className="mt-auto grid grid-cols-2 gap-3 md:grid-cols-4">
                <div className="rounded-2xl border border-white/10 bg-black/30 p-3 backdrop-blur-md sm:p-4">
                  <div className="text-[10px] uppercase tracking-[0.22em] text-white/40 sm:text-[11px]">
                    My Points
                  </div>
                  <div className="mt-2 text-lg font-semibold text-white sm:text-xl">
                    {formatNumber(safeMyPoints)}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/30 p-3 backdrop-blur-md sm:p-4">
                  <div className="text-[10px] uppercase tracking-[0.22em] text-white/40 sm:text-[11px]">
                    Total Supply
                  </div>
                  <div className="mt-2 text-lg font-semibold text-white sm:text-xl">
                    {formatNumber(safeTotalPoints)}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/30 p-3 backdrop-blur-md sm:p-4">
                  <div className="text-[10px] uppercase tracking-[0.22em] text-white/40 sm:text-[11px]">
                    Est. FDV
                  </div>
                  <div className="mt-2 text-lg font-semibold text-white sm:text-xl">
                    {formatCompactMoney(safeFdv * 1_000_000_000)}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/30 p-3 backdrop-blur-md sm:p-4">
                  <div className="text-[10px] uppercase tracking-[0.22em] text-white/40 sm:text-[11px]">
                    Airdrop %
                  </div>
                  <div className="mt-2 text-lg font-semibold text-white sm:text-xl">
                    {safeAirdrop}%
                  </div>
                </div>
              </div>

              <div className="pointer-events-none absolute bottom-3 right-4 text-[10px] uppercase tracking-[0.28em] text-white/30 sm:bottom-4 sm:right-6 sm:text-xs">
                @capy_onchain
              </div>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => setTemplatePicker(true)}
              className="rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-3 text-sm font-semibold text-white/75 transition hover:border-cyan-300/35 hover:text-white"
            >
              Pick a Template
            </button>

            <button
              onClick={downloadCard}
              disabled={isDownloading}
              className="rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-3 text-sm font-semibold text-white/75 transition hover:border-indigo-300/35 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isDownloading ? "Downloading..." : "Download Card"}
            </button>

            <button
              onClick={shareOnX}
              className="rounded-2xl bg-white px-6 py-3 text-sm font-black text-black transition hover:-translate-y-0.5"
            >
              {isDownloading ? "Preparing..." : "Share on X + Card"}
            </button>
          </div>
        </section>
      )}

    

      {tab === "funding" && (
        <section className="mx-auto mt-14 max-w-[1750px] space-y-8 px-4 sm:px-6">
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035] p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/55">
                  Live market scanner
                </div>

                <h2 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
                  Funding rate screener
                </h2>

                <p className="mt-2 text-sm text-white/50">
                  Compare interval-normalized funding across every exchange returned
                  by Loris Tools, with Capy referral routes applied where available.
                </p>

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <div className="inline-flex rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-emerald-300/80">
                    Auto-refresh in: {refreshCountdown}s
                  </div>

                  {fundingUpdatedAt && (
                    <div className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-cyan-300/80">
                      Updated: {fundingUpdatedAt}
                    </div>
                  )}

                  {fundingStale && (
                    <div className="inline-flex rounded-full border border-yellow-400/20 bg-yellow-400/10 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-yellow-200/80">
                      Showing cached Loris data
                    </div>
                  )}

                  <div className="inline-flex rounded-full border border-neutral-700 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-white/60">
                    View: {fundingMetricMode === "interval" ? "Per interval" : "Annualized"}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => void loadFunding(false)}
                  className="rounded-2xl border border-cyan-300/30 bg-cyan-300/10 px-4 py-3 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-300 hover:text-slate-950"
                >
                  Refresh now
                </button>

                <button
                  onClick={resetFundingFilters}
                  className="rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3 text-sm text-white/70 transition hover:border-white/20 hover:text-white"
                >
                  Reset filters
                </button>
              </div>
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-[1.2fr_1.2fr_1fr]">
            <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-5 shadow-xl shadow-black/10 backdrop-blur-xl">
              <div className="text-xs uppercase tracking-[0.22em] text-white/40">
                Most Positive Funding
              </div>

              <div className="mt-3 text-2xl font-semibold text-white">
                {topFundingPositive ? topFundingPositive.symbol : "N/A"}
              </div>

              <div className="mt-1 text-sm text-white/50">
                {topFundingPositive ? topFundingPositive.display : "—"}
              </div>

              <div className="mt-4 inline-flex rounded-full border border-red-400/25 bg-red-500/10 px-3 py-1 text-sm font-medium text-red-300">
                {topFundingPositive
                  ? formatFundingValue(topFundingPositive.displayFunding)
                  : "N/A"}
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-5 shadow-xl shadow-black/10 backdrop-blur-xl">
              <div className="text-xs uppercase tracking-[0.22em] text-white/40">
                Most Negative Funding
              </div>

              <div className="mt-3 text-2xl font-semibold text-white">
                {topFundingNegative ? topFundingNegative.symbol : "N/A"}
              </div>

              <div className="mt-1 text-sm text-white/50">
                {topFundingNegative ? topFundingNegative.display : "—"}
              </div>

              <div className="mt-4 inline-flex rounded-full border border-emerald-400/25 bg-emerald-500/10 px-3 py-1 text-sm font-medium text-emerald-300">
                {topFundingNegative
                  ? formatFundingValue(topFundingNegative.displayFunding)
                  : "N/A"}
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-5 shadow-xl shadow-black/10 backdrop-blur-xl">
              <div className="text-xs uppercase tracking-[0.22em] text-white/40">
                Highest Spread
              </div>

              <div className="mt-3 text-2xl font-semibold text-white">
                {topFundingSpread ? topFundingSpread.symbol : "N/A"}
              </div>

              <div className="mt-1 text-sm text-white/50">
                {topFundingSpread ? `OI Rank ${topFundingSpread.oiRank}` : "—"}
              </div>

              <div className="mt-4 inline-flex rounded-full border border-cyan-400/25 bg-cyan-500/10 px-3 py-1 text-sm font-medium text-cyan-300">
                {topFundingSpread ? formatSpreadValue(topFundingSpread.maxArb) : "N/A"}
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-6 shadow-xl shadow-black/10 backdrop-blur-xl">
            <div className="flex flex-col gap-4">
              <div className="grid gap-4 xl:grid-cols-[1.25fr_1fr_1fr_auto]">
                <div>
                  <label className="mb-2 block text-xs uppercase tracking-[0.22em] text-white/40">
                    Search by ticker
                  </label>
                  <input
                    value={searchTicker}
                    onChange={(e) => setSearchTicker(e.target.value.toUpperCase())}
                    placeholder="BTC, ETH, SOL, ICP..."
                    className="w-full rounded-2xl border border-white/10 bg-[#07101d] px-4 py-3 text-white outline-none transition placeholder:text-white/25 focus:border-cyan-300"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs uppercase tracking-[0.22em] text-white/40">
                    Funding view
                  </label>
                  <div className="flex rounded-2xl border border-white/10 bg-[#07101d] p-1">
                    <button
                      onClick={() => setFundingMetricMode("interval")}
                      className={`flex-1 rounded-lg px-3 py-2 text-sm transition ${
                        fundingMetricMode === "interval"
                          ? "bg-cyan-300 text-slate-950"
                          : "text-white/60"
                      }`}
                    >
                      Per interval
                    </button>

                    <button
                      onClick={() => setFundingMetricMode("annualized")}
                      className={`flex-1 rounded-lg px-3 py-2 text-sm transition ${
                        fundingMetricMode === "annualized"
                          ? "bg-indigo-300 text-slate-950"
                          : "text-white/60"
                      }`}
                    >
                      Annualized
                    </button>
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-xs uppercase tracking-[0.22em] text-white/40">
                    Sort
                  </label>
                  <div className="grid grid-cols-3 rounded-2xl border border-white/10 bg-[#07101d] p-1">
                    {[
                      ["maxArb", "Max Arb"],
                      ["oiRank", "OI Rank"],
                      ["symbol", "Symbol"],
                    ].map(([key, label]) => (
                      <button
                        key={key}
                        onClick={() => setFundingSortKey(key as FundingSortKey)}
                        className={`rounded-lg px-3 py-2 text-sm transition ${
                          fundingSort.key === key
                            ? "bg-cyan-300 text-slate-950"
                            : "text-white/60"
                        }`}
                      >
                        {label} {sortLabel(key as FundingSortKey)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={() => setOnlyActionable((prev) => !prev)}
                    className={`w-full rounded-xl border px-4 py-3 text-sm font-medium transition ${
                      onlyActionable
                        ? "border-emerald-300/30 bg-emerald-300/10 text-emerald-200"
                        : "border-white/10 bg-white/[0.03] text-white/60"
                    }`}
                  >
                    {onlyActionable ? "Only opportunities" : "Show all symbols"}
                  </button>
                </div>
              </div>

              <div>
                <div className="mb-2 text-xs uppercase tracking-[0.22em] text-white/40">
                  Exchanges
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() =>
                      setEnabledFundingExchanges(
                        fundingExchanges.map((exchange) => exchange.key)
                      )
                    }
                    className="rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-2 text-xs font-medium text-cyan-200 transition hover:bg-cyan-300/15"
                  >
                    Select all
                  </button>

                  <button
                    onClick={() =>
                      setEnabledFundingExchanges(
                        fundingExchanges
                          .filter((exchange) => exchange.hasPersonalRef)
                          .map((exchange) => exchange.key)
                      )
                    }
                    className="rounded-full border border-emerald-300/25 bg-emerald-300/10 px-3 py-2 text-xs font-medium text-emerald-200 transition hover:bg-emerald-300/15"
                  >
                    Capy refs only
                  </button>

                  <button
                    onClick={() => setEnabledFundingExchanges([])}
                    className="rounded-full border border-red-300/25 bg-red-300/10 px-3 py-2 text-xs font-medium text-red-200 transition hover:bg-red-300/15"
                  >
                    Clear all
                  </button>

                  {fundingExchanges.map((exchange) => {
  const enabled = enabledFundingExchanges.includes(exchange.key)

  return (
    <button
      key={exchange.key}
      onClick={() => toggleFundingExchange(exchange.key)}
      className={`rounded-full border px-3 py-2 text-xs font-medium transition ${
        enabled
          ? "border-emerald-400/25 bg-emerald-500/10 text-emerald-300"
          : "border-neutral-700 text-white/50"
      }`}
    >
      {exchange.label}
    </button>
  )
})}
                </div>
              </div>

              <div>
                <div className="mb-2 text-xs uppercase tracking-[0.22em] text-white/40">
                  Render rows
                </div>

                <div className="flex flex-wrap gap-2">
                  {([100, 250, 500, "all"] as const).map((limit) => (
                    <button
                      key={limit}
                      onClick={() => setFundingRowLimit(limit)}
                      className={`rounded-full border px-3 py-2 text-xs font-medium transition ${
                        fundingRowLimit === limit
                          ? "border-cyan-300/25 bg-cyan-300/10 text-cyan-200"
                          : "border-white/10 text-white/50 hover:text-white"
                      }`}
                    >
                      {limit === "all" ? "All rows" : `Top ${limit}`}
                    </button>
                  ))}
                </div>
              </div>

              <div className="text-xs leading-5 text-white/30">
                Default view renders only the strongest rows so the table stays
                smooth. Search still scans the full Loris dataset.
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-4 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-6">
            {fundingLoading && (
              <div className="rounded-2xl border border-neutral-800 bg-black/20 p-6 text-white/60">
                Loading funding data...
              </div>
            )}

            {fundingError && (
              <div className="rounded-2xl border border-red-400/20 bg-red-400/10 p-6 text-red-300">
                {fundingError}
              </div>
            )}

            {!fundingLoading && !fundingError && (
              <div className="overflow-x-auto rounded-2xl border border-neutral-800">
  <table className="w-full table-fixed border-separate border-spacing-0">
                  <thead>
                    <tr className="text-left">
                      <th className="sticky left-0 top-0 z-40 w-[96px] border-b border-r border-neutral-800 bg-[#0b111d] px-3 py-3 text-xs uppercase tracking-[0.18em] text-white/40">
  <button
    onClick={() => setFundingSortKey("symbol")}
    className="text-left transition hover:text-cyan-200"
  >
    Symbol {sortLabel("symbol")}
  </button>
</th>

<th className="sticky left-[96px] top-0 z-40 w-[76px] border-b border-r border-neutral-800 bg-[#0b111d] px-3 py-3 text-xs uppercase tracking-[0.18em] text-white/40">
  <button
    onClick={() => setFundingSortKey("oiRank")}
    className="text-left transition hover:text-cyan-200"
  >
    OI Rank {sortLabel("oiRank")}
  </button>
</th>

<th className="sticky left-[172px] top-0 z-40 w-[96px] border-b border-r border-neutral-800 bg-[#0b111d] px-3 py-3 text-xs uppercase tracking-[0.18em] text-white/40">
  <button
    onClick={() => setFundingSortKey("maxArb")}
    className="text-left transition hover:text-cyan-200"
  >
    Max Arb {sortLabel("maxArb")}
  </button>
</th>

<th className="sticky left-[268px] top-0 z-40 w-[220px] border-b border-r border-neutral-800 bg-[#0b111d] px-3 py-3 text-xs uppercase tracking-[0.18em] text-white/40">
  Action
</th>

                      {activeFundingExchanges.map((exchange) => (
  <th
    key={exchange.key}
    className="sticky top-0 z-30 border-b border-r border-neutral-800 bg-[#0b111d] px-2 py-3 text-center last:border-r-0"
  >
    <a
      href={exchange.tradeUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-white/70 transition hover:text-cyan-300"
    >
      {exchange.label}
    </a>
  </th>
))}
                    </tr>
                  </thead>

                  <tbody>
                    {renderedFundingRows.map((row) => (
                      <tr key={row.symbol} className="hover:bg-white/[0.02]">
                        <td className="sticky left-0 z-20 w-[96px] border-b border-r border-neutral-800 bg-[#0b111d] px-3 py-4 text-sm font-semibold text-white">
                          <button
                            onClick={() => void copyTickerValue(row.symbol)}
                            className="transition hover:text-cyan-300"
                            title="Click to copy ticker"
                          >
                            {copiedTicker === row.symbol ? "Copied" : row.symbol}
                          </button>
                        </td>

                        <td className="sticky left-[96px] z-20 w-[76px] border-b border-r border-neutral-800 bg-[#0b111d] px-3 py-4 text-sm text-white/80">
                          {row.oiRank}
                        </td>

                        <td className="sticky left-[172px] z-20 w-[96px] border-b border-r border-neutral-800 bg-[#0b111d] px-3 py-4 text-sm">
                          <span className="inline-flex rounded-full border border-cyan-400/25 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-300">
                            {formatSpreadValue(row.maxArb)}
                          </span>
                        </td>

                        <td className="sticky left-[268px] z-20 w-[220px] border-b border-r border-neutral-800 bg-[#0b111d] px-3 py-4">
                          {row.buyExchange && row.sellExchange ? (
                            <div className="flex flex-wrap gap-2">
                              <a
                                href={
                                  fundingExchangeByKey.get(row.buyExchange.key)
                                    ?.tradeUrl ?? "#"
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center rounded-full border border-emerald-400/25 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-500/15"
                              >
                                BUY {row.buyExchange.label}
                              </a>

                              <a
                                href={
                                  fundingExchangeByKey.get(row.sellExchange.key)
                                    ?.tradeUrl ?? "#"
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center rounded-full border border-red-400/25 bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-300 transition hover:bg-red-500/15"
                              >
                                SELL {row.sellExchange.label}
                              </a>
                            </div>
                          ) : (
                            <span className="text-xs text-white/35">No trade route</span>
                          )}
                        </td>

                        {activeFundingExchanges.map((exchange) => {
                          const value = row.byExchange[exchange.key]

                          return (
                            <td
                              key={`${row.symbol}-${exchange.key}`}
                              className={`border-b border-r border-neutral-800 px-2 py-4 text-center text-xs font-semibold sm:text-sm last:border-r-0 ${getFundingCellClass(
  value
)}`}
                            >
                              <a
                                href={exchange.tradeUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block"
                                title={
                                  exchange.hasPersonalRef
                                    ? `Open ${exchange.label} with your ref`
                                    : `Open ${exchange.label} (generic link)`
                                }
                              >
                                {value === null ? "—" : formatFundingValue(value)}
                              </a>
                            </td>
                          )
                        })}
                      </tr>
                    ))}

                    {!fundingMatrixRows.length && (
                      <tr>
                        <td
                          colSpan={4 + activeFundingExchanges.length}
                          className="px-6 py-12 text-center text-white/45"
                        >
                          No rows match your current filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {!fundingLoading && !fundingError && hiddenFundingRows > 0 && (
              <div className="mt-4 flex justify-center">
                <button
                  onClick={() =>
                    setFundingRowLimit((prev) =>
                      prev === "all"
                        ? "all"
                        : prev === 100
                          ? 250
                          : prev === 250
                            ? 500
                            : "all"
                    )
                  }
                  className="rounded-2xl border border-cyan-300/25 bg-cyan-300/10 px-5 py-3 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-300 hover:text-slate-950"
                >
                  Show more rows ({hiddenFundingRows} hidden)
                </button>
              </div>
            )}

            <div className="mt-6 flex flex-wrap items-center gap-3 text-xs text-white/35">
  <span>
    Showing:{" "}
    <span className="text-white/60">
      {renderedFundingRows.length}/{fundingMatrixRows.length}
    </span>
  </span>

  <span>
    Active exchanges:{" "}
    <span className="text-white/60">{activeFundingExchanges.length}</span>
  </span>

  <span>
    Funding rate data provided by{" "}
    <a
      href="https://loris.tools"
      target="_blank"
      rel="noopener noreferrer"
      className="text-cyan-300 transition hover:text-cyan-200"
    >
      Loris Tools
    </a>
  </span>
</div>
          </div>
        </section>
      )}

      {templatePicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur">
          <div className="max-h-[85vh] w-full max-w-5xl overflow-y-auto rounded-2xl border border-neutral-800 bg-[#0c1220] p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg">Choose Card Background</h3>

              <button
                onClick={() => setTemplatePicker(false)}
                className="opacity-60 transition hover:opacity-100"
              >
                ✕
              </button>
            </div>

            <label className="mb-5 flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-cyan-300/30 bg-cyan-300/10 p-6 text-center transition hover:bg-cyan-300/15">
              <span className="text-sm font-semibold text-cyan-100">
                Upload your own meme or screenshot
              </span>
              <span className="mt-1 text-xs text-white/45">
                PNG, JPG, GIF or WebP. It stays local in your browser.
              </span>
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(event) => uploadCustomTemplate(event.target.files?.[0])}
              />
            </label>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {TEMPLATES.map((template) => (
                <button
                  key={template}
                  onClick={() => {
                    setSelectedTemplate(template)
                    setCustomTemplate(null)
                    setTemplatePicker(false)
                  }}
                  className={`overflow-hidden rounded-xl border transition ${
                    selectedTemplate === template
                      ? "border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.25)]"
                      : "border-neutral-800 hover:border-cyan-400"
                  }`}
                >
                  <div className="relative aspect-video w-full bg-[#060b16]">
                    <Image
                      src={`/templates/${template}.png`}
                      alt={template}
                      fill
                      className="object-cover"
                    />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </main>
  )
}


