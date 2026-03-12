"use client"

import Image from "next/image"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { toPng } from "html-to-image"

const PERPS = [
  {
    tier: "S+",
    name: "Variational",
    ref: "https://omni.variational.io/?ref=OMNICAPY",
    refCode: "OMNICAPY",
    logo: "/variational.png",
    boost: "OMNICAPY: +16% points boost",
    farm: "Holding positions + volume on mid-OI tokens",
  },
  {
    tier: "S+",
    name: "Extended",
    ref: "https://app.extended.exchange/join/CAPY",
    refCode: "CAPY",
    logo: "/extended.png",
    boost: "-10% fees + 5% points boost + 30% refback",
    farm: "Volume + holding positions",
  },
  {
    tier: "S",
    name: "Hibachi",
    ref: "http://hibachi.xyz/r/capy",
    refCode: "capy",
    logo: "/hibachi.png",
    boost: "-15% fees + 15% points boost",
    farm: "Volume + holding positions",
  },
  {
    tier: "S",
    name: "Ethereal",
    ref: "https://app.ethereal.trade/?ref=UM68P2M9JZ6D",
    refCode: "UM68P2M9JZ6D",
    logo: "/ethereal.png",
    boost: "+15% points boost",
    farm: "Boost farming + low OI tokens",
  },
  {
    tier: "S",
    name: "Hyena",
    ref: "https://app.hyena.trade/ref/CAPY",
    refCode: "CAPY",
    logo: "/hyena.png",
    boost: "+10% points boost",
    farm: "Activity + steady volume",
  },
  {
    tier: "A",
    name: "Pacifica",
    ref: "https://app.pacifica.fi/?referral=Capy",
    refCode: "Capy",
    logo: "/pacifica.png",
    boost: "+15% points boost",
    farm: "High volume + active trading",
  },
  {
    tier: "A",
    name: "EdgeX",
    ref: "https://pro.edgex.exchange/referral/OLEJK",
    refCode: "OLEJK",
    logo: "/edgex.png",
    boost: "-10% fees + 10% points boost + VIP1",
    farm: "High volume + hold positions",
  },
  {
    tier: "A",
    name: "Dreamcash",
    ref: "https://dreamcash.xyz/share?code=CAPYCR",
    refCode: "CAPYCR",
    logo: "/dreamcash.png",
    boost: "boost from 10K to 1M points",
    farm: "Low OI tokens + active trading",
  },
] as const

const TEMPLATES = [
  "cinema",
  "aurafarming",
  "capypistol",
  "fck",
  "heaven",
  "offer",
  "omg",
  "poor",
  "punchcover",
  "rich",
  "scarcover",
  "skeletons",
  "locedin",
] as const

const PERPS_CALC = {
  variational: {
    name: "Variational",
    fdv: 0.6,
    totalPoints: 9300000,
    airdrop: 30,
  },
  extended: {
    name: "Extended",
    fdv: 0.5,
    totalPoints: 50000000,
    airdrop: 30,
  },
  pacifica: {
    name: "Pacifica",
    fdv: 0.3,
    totalPoints: 240000000,
    airdrop: 20,
  },
  nado: {
    name: "Nado",
    fdv: 0.3,
    totalPoints: 4300000,
    airdrop: 8,
  },
  o1: {
    name: "01Exchange",
    fdv: 0.2,
    totalPoints: 10000000,
    airdrop: 20,
  },
  treadfi: {
    name: "Tread Fi",
    fdv: 0.3,
    totalPoints: 2800000,
    airdrop: 20,
  },
  dreamcash: {
    name: "Dreamcash",
    fdv: 0.1,
    totalPoints: 6000000,
    airdrop: 12,
  },
  hibachi: {
    name: "Hibachi",
    fdv: 0.4,
    totalPoints: 60000000,
    airdrop: 15,
  },
  ethereal: {
    name: "Ethereal",
    fdv: 0.3,
    totalPoints: 8000000000,
    airdrop: 15,
  },
  ostium: {
    name: "Ostium",
    fdv: 0.3,
    totalPoints: 56000000,
    airdrop: 15,
  },
  grvt: {
    name: "Grvt",
    fdv: 0.15,
    totalPoints: 3000000,
    airdrop: 15,
  },
  bullpen: {
    name: "Bullpen",
    fdv: 0.15,
    totalPoints: 69900000,
    airdrop: 15,
  },
  edgex: {
    name: "EdgeX",
    fdv: 1,
    totalPoints: 10000000,
    airdrop: 30,
  },
  standx: {
    name: "StandX",
    fdv: 0.2,
    totalPoints: 50000000,
    airdrop: 20,
  },
  hyena: {
    name: "Hyena",
    fdv: 0,
    totalPoints: 1,
    airdrop: 15,
  },
  liquid: {
    name: "Liquid",
    fdv: 0,
    totalPoints: 1,
    airdrop: 15,
  },
  decibel: {
    name: "Decibel",
    fdv: 0,
    totalPoints: 1,
    airdrop: 15,
  },
} as const

const POLYMARKET_LAUNCH_ODDS = [
  {
    name: "Variational",
    deadline: "Dec 31, 2026",
    probability: 88,
    link: "https://polymarket.com/event/will-variational-launch-a-token-in-2025?via=capy",
    note: "Market is pricing one of the strongest launch setups among tracked perps.",
  },
  {
    name: "Extended",
    deadline: "Dec 31, 2026",
    probability: 92,
    link: "https://polymarket.com/event/will-extended-launch-a-token-by?via=capy",
    note: "Very strong odds. One of the cleanest launch probabilities on the board.",
  },
  {
    name: "edgeX",
    deadline: "Sep 30, 2026",
    probability: 98,
    link: "https://polymarket.com/event/will-edgex-launch-a-token-by?via=capy",
    note: "Extremely strong market confidence. Odds already imply near-certain launch this year.",
  },
  {
    name: "GRVT",
    deadline: "Sep 30, 2026",
    probability: 84,
    link: "https://polymarket.com/event/will-grvt-launch-a-token-by?via=capy",
    note: "Very strong odds. Market is leaning heavily toward a 2026 launch.",
  },
  {
    name: "Ostium",
    deadline: "Dec 31, 2026",
    probability: 80,
    link: "https://polymarket.com/event/will-ostium-launch-a-token-in-2025?via=capy",
    note: "Strong odds, though the market URL/title is older and the live frontrunner on page is Dec 31, 2026.",
  },
  {
    name: "Tread Fi",
    deadline: "Dec 31, 2026",
    probability: 74,
    link: "https://polymarket.com/event/will-tread-launch-a-token-by?via=capy",
    note: "Good odds overall, but still not in the top tier of certainty.",
  },
  {
    name: "Hibachi",
    deadline: "Sep 30, 2026",
    probability: 61,
    link: "https://polymarket.com/event/will-hibachi-launch-a-token-by?via=capy",
    note: "More binary setup. If market conditions improve, sentiment can rerate quickly.",
  },
  {
    name: "Pacifica",
    deadline: "Dec 31, 2026",
    probability: 60,
    link: "https://polymarket.com/event/will-pacifica-launch-a-token-by?via=capy",
    note: "Moderate odds. Market is not fully convinced yet despite the protocol being watched.",
  },
  {
    name: "Dreamcash",
    deadline: "Dec 31, 2026",
    probability: 62,
    link: "https://polymarket.com/event/will-dreamcash-launch-a-token-by?via=capy",
    note: "Still speculative, but market assigns a real shot at launch by year-end.",
  },
  {
    name: "StandX",
    deadline: "Mar 31, 2026",
    probability: 2,
    link: "https://polymarket.com/event/will-standx-launch-a-token-in-2025?via=capy",
    note: "Very weak odds right now. Market is heavily skeptical on near-term launch timing.",
  },
] as const

const POLYMARKET_FDV_ODDS = [
  {
    name: "edgeX",
    threshold: "$700M",
    probability: 53,
    link: "https://polymarket.com/event/edgex-fdv-above-one-day-after-launch?via=capy",
    note: "Market leader is already in the upper mid-range, with $1B still close behind.",
  },
  {
    name: "Extended",
    threshold: "$150M",
    probability: 68,
    link: "https://polymarket.com/event/extended-fdv-above-one-day-after-launch?via=capy",
    note: "Market is leaning toward a relatively modest opening FDV versus top-tier perp names.",
  },
  {
    name: "Variational",
    threshold: "$300M",
    probability: 41,
    link: "https://polymarket.com/event/variational-fdv-above-one-day-after-launch?via=capy",
    note: "Current leader is $300M, but the board still leaves room for rerating if sentiment improves.",
  },
  {
    name: "Ostium",
    threshold: "$300M",
    probability: 37,
    link: "https://polymarket.com/event/ostium-fdv-above-one-day-after-launch?via=capy",
    note: "Market center of gravity is around the mid-range rather than a premium launch multiple.",
  },
  {
    name: "Pacifica",
    threshold: "$300M",
    probability: 20,
    link: "https://polymarket.com/event/pacifica-fdv-above-one-day-after-launch?via=capy",
    note: "Market is still very split here, which makes Pacifica one of the noisier FDV boards.",
  },
  {
    name: "Dreamcash",
    threshold: "$20M",
    probability: 82,
    link: "https://polymarket.com/event/dreamcash-fdv-above-one-day-after-launch?via=capy",
    note: "Board is anchored low for now, with most optimism concentrated at the lower thresholds.",
  },
  {
    name: "GRVT",
    threshold: "$50M",
    probability: 86,
    link: "https://polymarket.com/event/grvt-fdv-above-one-day-after-launch?via=capy",
    note: "Market is heavily centered on a low opening FDV relative to the hype around the project.",
  },
  {
    name: "StandX",
    threshold: "$200M",
    probability: 40,
    link: "https://polymarket.com/event/standx-fdv-above-one-day-after-launch?via=capy",
    note: "Very mixed board. No single valuation bucket has dominant control.",
  },
] as const

const FUNDING_EXCHANGE_ORDER = [
  {
    key: "edgex",
    label: "EdgeX",
    intervalHours: 8,
    tradeUrl: "https://pro.edgex.exchange/referral/OLEJK",
    hasPersonalRef: true,
  },
  {
    key: "ethereal",
    label: "Ethereal",
    intervalHours: 8,
    tradeUrl: "https://app.ethereal.trade/?ref=UM68P2M9JZ6D",
    hasPersonalRef: true,
  },
  {
    key: "extended",
    label: "Extended",
    intervalHours: 1,
    tradeUrl: "https://app.extended.exchange/join/CAPY",
    hasPersonalRef: true,
  },
  {
    key: "hibachi",
    label: "Hibachi",
    intervalHours: 8,
    tradeUrl: "http://hibachi.xyz/r/capy",
    hasPersonalRef: true,
  },
  {
    key: "hyena",
    label: "Hyena",
    intervalHours: 8,
    tradeUrl: "https://app.hyena.trade/ref/CAPY",
    hasPersonalRef: true,
  },
  {
    key: "hyperliquid",
    label: "Hyperliquid",
    intervalHours: 1,
    tradeUrl: "https://app.hyperliquid.xyz/",
    hasPersonalRef: false,
  },
  {
    key: "pacifica",
    label: "Pacifica",
    intervalHours: 8,
    tradeUrl: "https://app.pacifica.fi/?referral=Capy",
    hasPersonalRef: true,
  },
  {
    key: "variational",
    label: "Variational",
    intervalHours: 8,
    tradeUrl: "https://omni.variational.io/?ref=OMNICAPY",
    hasPersonalRef: true,
  },
] as const

type Tab = "list" | "calculator" | "odds" | "funding"
type CalcPerpKey = keyof typeof PERPS_CALC
type FundingMetricMode = "interval" | "annualized"
type FundingBias = "longs_pay_shorts" | "shorts_pay_longs" | "neutral"
type FundingExchangeKey = (typeof FUNDING_EXCHANGE_ORDER)[number]["key"]

type FundingApiRow = {
  exchange: string
  display: string
  symbol: string
  funding: number
  oiRank: string
  bias: FundingBias
}

type FundingMatrixRow = {
  symbol: string
  oiRank: string
  maxArb: number
  activeCount: number
  buyExchange: { key: FundingExchangeKey; label: string } | null
  sellExchange: { key: FundingExchangeKey; label: string } | null
  byExchange: Record<FundingExchangeKey, number | null>
}

const ALL_FUNDING_KEYS = FUNDING_EXCHANGE_ORDER.map(
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

function getProbabilityStyle(probability: number) {
  if (probability >= 75) {
    return "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
  }

  if (probability >= 50) {
    return "border-yellow-400/30 bg-yellow-400/10 text-yellow-300"
  }

  return "border-red-400/30 bg-red-400/10 text-red-300"
}

function getFdvStyle(probability: number) {
  if (probability >= 60) {
    return "border-cyan-400/30 bg-cyan-400/10 text-cyan-300"
  }

  if (probability >= 35) {
    return "border-fuchsia-400/30 bg-fuchsia-400/10 text-fuchsia-300"
  }

  return "border-neutral-500/30 bg-neutral-500/10 text-neutral-300"
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

function getExchangeMeta(exchangeKey: FundingExchangeKey) {
  return (
    FUNDING_EXCHANGE_ORDER.find((exchange) => exchange.key === exchangeKey) ??
    FUNDING_EXCHANGE_ORDER[0]
  )
}

function toDisplayedFundingValue(
  rawFunding: number,
  exchangeKey: FundingExchangeKey,
  metricMode: FundingMetricMode
) {
  const meta = getExchangeMeta(exchangeKey)

  const actualIntervalFunding =
    meta.intervalHours === 1 ? rawFunding / 8 : rawFunding

  if (metricMode === "annualized") {
    return actualIntervalFunding * (24 / meta.intervalHours) * 365
  }

  return actualIntervalFunding
}

function intervalLabel(hours: number) {
  return `${hours}h`
}

export default function Home() {
  const [tab, setTab] = useState<Tab>("list")
  const [calcPerp, setCalcPerp] = useState<CalcPerpKey>("variational")
  const [myPoints, setMyPoints] = useState(0)
  const [templatePicker, setTemplatePicker] = useState(false)
  const [selectedTemplate, setSelectedTemplate] =
    useState<(typeof TEMPLATES)[number]>("cinema")
  const [isDownloading, setIsDownloading] = useState(false)
  const [launchSort, setLaunchSort] = useState<"desc" | "asc">("desc")
  const [fdvSort, setFdvSort] = useState<"desc" | "asc">("desc")

  const [copiedRefName, setCopiedRefName] = useState<string | null>(null)
  const [copiedTicker, setCopiedTicker] = useState<string | null>(null)

  const [fundingRows, setFundingRows] = useState<FundingApiRow[]>([])
  const [fundingUpdatedAt, setFundingUpdatedAt] = useState<string | null>(null)
  const [fundingLoading, setFundingLoading] = useState(false)
  const [fundingError, setFundingError] = useState<string | null>(null)
  const [fundingSort, setFundingSort] = useState<"desc" | "asc">("desc")
  const [searchTicker, setSearchTicker] = useState("")
  const [enabledFundingExchanges, setEnabledFundingExchanges] =
    useState<FundingExchangeKey[]>(ALL_FUNDING_KEYS)
  const [fundingMetricMode, setFundingMetricMode] =
    useState<FundingMetricMode>("interval")
  const [onlyActionable, setOnlyActionable] = useState(true)
  const [refreshCountdown, setRefreshCountdown] = useState(60)

  const cardRef = useRef<HTMLDivElement>(null)
  const fundingRequestInFlightRef = useRef(false)
  const listCopyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const tickerCopyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const current = PERPS_CALC[calcPerp]

  const [fdv, setFdv] = useState<number>(current.fdv)
  const [totalPoints, setTotalPoints] = useState<number>(current.totalPoints)
  const [airdrop, setAirdrop] = useState<number>(current.airdrop)

  useEffect(() => {
    setFdv(current.fdv)
    setTotalPoints(current.totalPoints)
    setAirdrop(current.airdrop)
  }, [current])

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

        const res = await fetch(`/api/funding?ts=${Date.now()}`, {
          cache: "no-store",
        })

        const data = await res.json()

        if (!res.ok) {
          throw new Error(data?.error || "Failed to load funding data")
        }

        const safeRows = Array.isArray(data?.rows)
          ? data.rows
              .filter((row: unknown) => row && typeof row === "object")
              .map((row: any) => ({
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

        setFundingRows(safeRows)
        setFundingUpdatedAt(data?.updatedAt ? String(data.updatedAt) : null)
        setRefreshCountdown(60)
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
          return 60
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

  const sortedLaunchOdds = [...POLYMARKET_LAUNCH_ODDS].sort((a, b) =>
    launchSort === "desc"
      ? b.probability - a.probability
      : a.probability - b.probability
  )

  const sortedFdvOdds = [...POLYMARKET_FDV_ODDS].sort((a, b) =>
    fdvSort === "desc"
      ? b.probability - a.probability
      : a.probability - b.probability
  )

  const activeFundingExchanges = useMemo(
    () =>
      FUNDING_EXCHANGE_ORDER.filter((exchange) =>
        enabledFundingExchanges.includes(exchange.key)
      ),
    [enabledFundingExchanges]
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
        return {
          ...row,
          displayFunding: toDisplayedFundingValue(
            row.funding,
            exchangeKey,
            fundingMetricMode
          ),
        }
      })
  }, [fundingRows, enabledFundingExchanges, searchTicker, fundingMetricMode])

  const fundingMatrixRows = useMemo(() => {
    try {
      const grouped = new Map<
        string,
        {
          symbol: string
          oiRank: string
          byExchange: Record<FundingExchangeKey, number | null>
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
            byExchange: {
              edgex: null,
              ethereal: null,
              extended: null,
              hibachi: null,
              hyena: null,
              hyperliquid: null,
              pacifica: null,
              variational: null,
            },
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

      return filtered.sort((a, b) =>
        fundingSort === "desc" ? b.maxArb - a.maxArb : a.maxArb - b.maxArb
      )
    } catch (error) {
      console.error("Funding matrix build failed:", error)
      return []
    }
  }, [visibleFundingRows, activeFundingExchanges, fundingSort, onlyActionable])

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
        if (prev.length === 1) return prev
        return prev.filter((key) => key !== exchangeKey)
      }

      return [...prev, exchangeKey]
    })
  }

  const resetFundingFilters = () => {
    setEnabledFundingExchanges(ALL_FUNDING_KEYS)
    setSearchTicker("")
    setOnlyActionable(true)
    setFundingMetricMode("interval")
    setFundingSort("desc")
  }

  const downloadCard = async () => {
    if (!cardRef.current || isDownloading) return

    try {
      setIsDownloading(true)

      await document.fonts.ready
      await new Promise((resolve) => setTimeout(resolve, 250))

      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: "#060b16",
      })

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

  const shareOnX = () => {
    const text = `My potential ${current.name} airdrop is ${formatMoney(myValue, 0)}.

My points: ${formatNumber(safeMyPoints)}
Est. FDV: ${formatCompactMoney(safeFdv * 1_000_000_000)}
Airdrop: ${safeAirdrop}%

Calculate yours on capys.app`

    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`
    window.open(url, "_blank", "noopener,noreferrer")
  }

  return (
    <main className="relative z-10 min-h-screen overflow-x-hidden bg-[#050814] pb-20 text-white">
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#070b14] via-[#0f1630] to-[#050814]" />
        <div className="absolute left-[-250px] top-[-250px] h-[700px] w-[700px] animate-blob rounded-full bg-purple-500/40 blur-[200px]" />
        <div className="animation-delay-2000 absolute bottom-[-250px] right-[-250px] h-[700px] w-[700px] animate-blob rounded-full bg-cyan-500/30 blur-[200px]" />
        <div className="animation-delay-4000 absolute left-[50%] top-[40%] h-[600px] w-[600px] animate-blob rounded-full bg-emerald-500/25 blur-[200px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:60px_60px]" />
      </div>

      <div className="relative z-20 mx-auto max-w-6xl px-4 pt-16 text-center sm:px-6 sm:pt-24">
        <div className="mb-6 flex items-center justify-center gap-4 text-sm">
          <span className="opacity-40">Made by</span>

          <a
            href="https://x.com/capy_onchain"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-lg border border-neutral-700 bg-[#0c1220]/60 px-3 py-1 transition hover:border-cyan-400/40"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18 2h3l-7 8 8 12h-6l-5-8-7 8H1l8-9L1 2h6l4 7 7-7z" />
            </svg>
            Capy
          </a>

          <a
            href="https://t.me/olejk_2k"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-lg border border-neutral-700 bg-[#0c1220]/60 px-3 py-1 transition hover:border-cyan-400/40"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21.5 2.5L2.7 9.6c-1 .4-1 1.1-.2 1.3l4.8 1.5 1.8 5.7c.2.6.1.8.7.8.5 0 .7-.2 1-.5l2.4-2.3 5 3.7c.9.5 1.5.2 1.8-.8L23 3.7c.4-1.3-.5-1.9-1.5-1.2z" />
            </svg>
            Capy
          </a>
        </div>

        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-6xl">
          CAPY <span className="text-red-500">PERP</span> HUB
        </h1>

        <p className="mt-4 opacity-60">Crypto-native Perp Tier List</p>

        <div className="mt-8 flex justify-center">
          <div className="flex flex-wrap justify-center rounded-full border border-neutral-800 bg-[#0c1220]/70 p-1 backdrop-blur">
            <button
              onClick={() => setTab("list")}
              className={`rounded-full px-5 py-2 text-sm transition ${
                tab === "list"
                  ? "border border-cyan-400 bg-cyan-500/20 text-cyan-300"
                  : "text-neutral-400"
              }`}
            >
              Perp DEX List
            </button>

            <button
              onClick={() => setTab("calculator")}
              className={`rounded-full px-5 py-2 text-sm transition ${
                tab === "calculator"
                  ? "border border-purple-400 bg-purple-500/20 text-purple-300"
                  : "text-neutral-400"
              }`}
            >
              Perp DEX Airdrop Calculator
            </button>

            <button
              onClick={() => setTab("odds")}
              className={`rounded-full px-5 py-2 text-sm transition ${
                tab === "odds"
                  ? "border border-fuchsia-400 bg-fuchsia-500/20 text-fuchsia-300"
                  : "text-neutral-400"
              }`}
            >
              Polymarket Odds
            </button>

            <button
              onClick={() => setTab("funding")}
              className={`rounded-full px-5 py-2 text-sm transition ${
                tab === "funding"
                  ? "border border-emerald-400 bg-emerald-500/20 text-emerald-300"
                  : "text-neutral-400"
              }`}
            >
              Funding Rates
            </button>
          </div>
        </div>
      </div>

      {tab === "list" && (
        <section className="mx-auto mt-16 max-w-5xl space-y-6 px-4 sm:mt-20 sm:px-6">
          <div className="hidden grid-cols-[100px_1fr_220px_auto] border-b border-neutral-800 pb-4 text-xs uppercase tracking-widest opacity-50 md:grid">
            <div className="pl-2">Tier</div>
            <div>Protocol</div>
            <div className="pr-6 text-right">Boost</div>
            <div />
          </div>

          {PERPS.map((perp) => (
            <div
              key={perp.name}
              className="group flex flex-col items-start gap-4 rounded-2xl border border-neutral-800 bg-[#0c1220]/70 p-4 backdrop-blur-xl transition hover:scale-[1.01] hover:border-cyan-400/40 hover:shadow-[0_0_30px_rgba(34,211,238,0.2)] md:grid md:grid-cols-[100px_1fr_220px_auto] md:items-center md:p-5"
            >
              <div className="flex md:justify-center">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl border font-bold ${getTierStyle(
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
                  <div className="text-lg font-medium">{perp.name}</div>
                  <div className="text-xs text-white/45">
                    Farm tip: {perp.farm}
                  </div>
                </div>
              </div>

              <div className="flex md:justify-center">
                <button
                  type="button"
                  onClick={() => copyRefCode(perp.name, perp.refCode)}
                  className="group/boost relative rounded-full border border-emerald-400 bg-emerald-400/5 px-3 py-1 text-center text-xs font-medium text-emerald-300 transition hover:bg-emerald-400/10 sm:text-sm"
                >
                  {copiedRefName === perp.name ? "Copied code" : perp.boost}

                  <span className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 w-max -translate-x-1/2 rounded-lg border border-neutral-700 bg-[#0b111d] px-3 py-2 text-[11px] text-white opacity-0 shadow-lg transition group-hover/boost:opacity-100">
                    Code: <span className="text-cyan-300">{perp.refCode}</span> • click to copy
                  </span>
                </button>
              </div>

              <a
                href={perp.ref}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 w-full rounded-xl border border-cyan-400 bg-cyan-400/5 px-6 py-2 text-center font-semibold text-cyan-300 transition hover:bg-cyan-400/10 md:ml-4 md:mt-0 md:w-auto"
              >
                TRADE →
              </a>
            </div>
          ))}
        </section>
      )}

      {tab === "calculator" && (
        <section className="mx-auto mt-20 max-w-5xl space-y-8 px-4">
          <p className="text-center opacity-50">
            Calculate your potential airdrop based on your perp DEX points balance.
          </p>

          <div className="flex flex-wrap justify-center gap-3">
            {Object.keys(PERPS_CALC).map((key) => {
              const perpKey = key as CalcPerpKey
              const isActive = calcPerp === perpKey

              return (
                <button
                  key={key}
                  onClick={() => setCalcPerp(perpKey)}
                  className={`rounded-full border px-4 py-2 text-sm transition ${
                    isActive
                      ? "border-cyan-400 bg-cyan-400/10 text-cyan-300 shadow-[0_0_18px_rgba(34,211,238,0.2)]"
                      : "border-neutral-700 text-neutral-400 hover:border-neutral-500 hover:text-white"
                  }`}
                >
                  {PERPS_CALC[perpKey].name}
                </button>
              )
            })}
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <p className="mb-2 text-xs opacity-50">MY POINTS</p>
              <input
                type="number"
                min="0"
                value={myPoints}
                onChange={(e) => setMyPoints(sanitizeNumber(e.target.value))}
                className="w-full rounded-xl border border-neutral-800 bg-[#0c1220] p-4 outline-none transition focus:border-cyan-400"
              />
            </div>

            <div>
              <p className="mb-2 text-xs opacity-50">FDV (billions $)</p>
              <input
                type="number"
                min="0"
                step="0.1"
                value={fdv}
                onChange={(e) => setFdv(sanitizeNumber(e.target.value))}
                className="w-full rounded-xl border border-neutral-800 bg-[#0c1220] p-4 outline-none transition focus:border-cyan-400"
              />
            </div>

            <div>
              <p className="mb-2 text-xs opacity-50">TOTAL POINTS</p>
              <input
                type="number"
                min="1"
                value={totalPoints}
                onChange={(e) => setTotalPoints(sanitizeNumber(e.target.value))}
                className="w-full rounded-xl border border-neutral-800 bg-[#0c1220] p-4 outline-none transition focus:border-cyan-400"
              />
            </div>

            <div>
              <p className="mb-2 text-xs opacity-50">AIRDROP % SUPPLY</p>
              <input
                type="number"
                min="0"
                max="100"
                value={airdrop}
                onChange={(e) => setAirdrop(sanitizeNumber(e.target.value))}
                className="w-full rounded-xl border border-neutral-800 bg-[#0c1220] p-4 outline-none transition focus:border-cyan-400"
              />
            </div>
          </div>

          <div
            ref={cardRef}
            className="relative mt-10 aspect-[16/9] overflow-hidden rounded-[28px] border border-cyan-400/20 bg-[#060b16] shadow-[0_0_40px_rgba(0,255,255,0.08)]"
          >
            <img
              src={`/templates/${selectedTemplate}.png`}
              alt="Card template"
              className="absolute inset-0 h-full w-full object-cover"
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
              className="rounded-xl border border-neutral-700 px-6 py-3 transition hover:border-cyan-400"
            >
              Pick a Template
            </button>

            <button
              onClick={downloadCard}
              disabled={isDownloading}
              className="rounded-xl border border-neutral-700 px-6 py-3 transition hover:border-purple-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isDownloading ? "Downloading..." : "Download Card"}
            </button>

            <button
              onClick={shareOnX}
              className="rounded-xl bg-white px-6 py-3 font-semibold text-black"
            >
              Share on X
            </button>
          </div>
        </section>
      )}

      {tab === "odds" && (
        <section className="mx-auto mt-20 max-w-6xl space-y-8 px-4 sm:px-6">
          <div className="rounded-2xl border border-neutral-800 bg-[#0c1220]/70 p-6 backdrop-blur-xl">
            <h2 className="text-2xl font-semibold text-white">Polymarket Odds</h2>

            <p className="mt-2 text-sm text-white/50">
              Market-implied launch timing and FDV expectations based on current Polymarket pricing.
            </p>

            <div className="mt-3 inline-flex rounded-full border border-fuchsia-400/20 bg-fuchsia-400/10 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-fuchsia-300/80">
              Last updated: Mar 11, 7:00 UTC
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <h3 className="text-lg font-semibold text-white">Launch Timing Odds</h3>
                <div className="text-xs uppercase tracking-[0.25em] text-white/35">
                  token launch deadlines
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setLaunchSort("desc")}
                  className={`rounded-lg px-3 py-1.5 text-xs transition ${
                    launchSort === "desc"
                      ? "border border-emerald-400/40 bg-emerald-400/10 text-emerald-300"
                      : "border border-neutral-700 text-neutral-400"
                  }`}
                >
                  High → Low
                </button>

                <button
                  onClick={() => setLaunchSort("asc")}
                  className={`rounded-lg px-3 py-1.5 text-xs transition ${
                    launchSort === "asc"
                      ? "border border-red-400/40 bg-red-400/10 text-red-300"
                      : "border border-neutral-700 text-neutral-400"
                  }`}
                >
                  Low → High
                </button>
              </div>
            </div>

            <div className="grid gap-4">
              {sortedLaunchOdds.map((item) => (
                <div
                  key={item.name}
                  className="rounded-2xl border border-neutral-800 bg-[#0c1220]/70 p-5 backdrop-blur-xl transition hover:border-fuchsia-400/30"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="text-xl font-semibold text-white">{item.name}</div>

                        <div
                          className={`rounded-full border px-3 py-1 text-xs font-medium ${getProbabilityStyle(
                            item.probability
                          )}`}
                        >
                          {item.probability}% probability
                        </div>
                      </div>

                      <div className="text-sm text-white/45">
                        Deadline: {item.deadline}
                      </div>

                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex rounded-lg border border-cyan-400/25 bg-cyan-400/10 px-3 py-1.5 text-xs font-medium text-cyan-300 transition hover:border-cyan-400/50 hover:bg-cyan-400/15"
                      >
                        Open launch market
                      </a>
                    </div>

                    <div className="max-w-2xl text-sm leading-6 text-white/70 lg:text-right">
                      {item.note}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <h3 className="text-lg font-semibold text-white">FDV Odds</h3>
                <div className="text-xs uppercase tracking-[0.25em] text-white/35">
                  one day after launch
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setFdvSort("desc")}
                  className={`rounded-lg px-3 py-1.5 text-xs transition ${
                    fdvSort === "desc"
                      ? "border border-cyan-400/40 bg-cyan-400/10 text-cyan-300"
                      : "border border-neutral-700 text-neutral-400"
                  }`}
                >
                  High → Low
                </button>

                <button
                  onClick={() => setFdvSort("asc")}
                  className={`rounded-lg px-3 py-1.5 text-xs transition ${
                    fdvSort === "asc"
                      ? "border border-fuchsia-400/40 bg-fuchsia-400/10 text-fuchsia-300"
                      : "border border-neutral-700 text-neutral-400"
                  }`}
                >
                  Low → High
                </button>
              </div>
            </div>

            <div className="grid gap-4">
              {sortedFdvOdds.map((item) => (
                <div
                  key={item.name}
                  className="rounded-2xl border border-neutral-800 bg-[#0c1220]/70 p-5 backdrop-blur-xl transition hover:border-cyan-400/30"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="text-xl font-semibold text-white">{item.name}</div>

                        <div
                          className={`rounded-full border px-3 py-1 text-xs font-medium ${getFdvStyle(
                            item.probability
                          )}`}
                        >
                          {item.threshold} • {item.probability}%
                        </div>
                      </div>

                      <div className="text-sm text-cyan-300/75">
                        Current market leader
                      </div>

                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex rounded-lg border border-fuchsia-400/25 bg-fuchsia-400/10 px-3 py-1.5 text-xs font-medium text-fuchsia-300 transition hover:border-fuchsia-400/50 hover:bg-fuchsia-400/15"
                      >
                        Open FDV market
                      </a>
                    </div>

                    <div className="max-w-2xl text-sm leading-6 text-white/70 lg:text-right">
                      {item.note}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {tab === "funding" && (
        <section className="mx-auto mt-20 max-w-[1750px] space-y-8 px-4 sm:px-6">
          <div className="rounded-2xl border border-neutral-800 bg-[#0c1220]/70 p-6 backdrop-blur-xl">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-white">Funding Rate Screener</h2>

                <p className="mt-2 text-sm text-white/50">
                  Live funding matrix for EdgeX, Ethereal, Extended, Hibachi, Hyena, Hyperliquid, Pacifica and Variational.
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

                  <div className="inline-flex rounded-full border border-neutral-700 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-white/60">
                    View: {fundingMetricMode === "interval" ? "Per interval" : "Annualized"}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => void loadFunding(false)}
                  className="rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm font-medium text-cyan-300 transition hover:bg-cyan-400/15"
                >
                  Refresh now
                </button>

                <button
                  onClick={resetFundingFilters}
                  className="rounded-xl border border-neutral-700 px-4 py-2 text-sm text-white/70 transition hover:border-neutral-500 hover:text-white"
                >
                  Reset filters
                </button>
              </div>
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-[1.2fr_1.2fr_1fr]">
            <div className="rounded-2xl border border-neutral-800 bg-[#0c1220]/70 p-5 backdrop-blur-xl">
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

            <div className="rounded-2xl border border-neutral-800 bg-[#0c1220]/70 p-5 backdrop-blur-xl">
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

            <div className="rounded-2xl border border-neutral-800 bg-[#0c1220]/70 p-5 backdrop-blur-xl">
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

          <div className="rounded-2xl border border-neutral-800 bg-[#0c1220]/70 p-6 backdrop-blur-xl">
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
                    className="w-full rounded-xl border border-neutral-800 bg-[#0b111d] px-4 py-3 text-white outline-none transition placeholder:text-white/25 focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs uppercase tracking-[0.22em] text-white/40">
                    Funding view
                  </label>
                  <div className="flex rounded-xl border border-neutral-800 bg-[#0b111d] p-1">
                    <button
                      onClick={() => setFundingMetricMode("interval")}
                      className={`flex-1 rounded-lg px-3 py-2 text-sm transition ${
                        fundingMetricMode === "interval"
                          ? "bg-cyan-500/15 text-cyan-300"
                          : "text-white/60"
                      }`}
                    >
                      Per interval
                    </button>

                    <button
                      onClick={() => setFundingMetricMode("annualized")}
                      className={`flex-1 rounded-lg px-3 py-2 text-sm transition ${
                        fundingMetricMode === "annualized"
                          ? "bg-fuchsia-500/15 text-fuchsia-300"
                          : "text-white/60"
                      }`}
                    >
                      Annualized
                    </button>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-xs uppercase tracking-[0.22em] text-white/40">
                    Sort by spread
                  </label>
                  <div className="flex rounded-xl border border-neutral-800 bg-[#0b111d] p-1">
                    <button
                      onClick={() => setFundingSort("desc")}
                      className={`flex-1 rounded-lg px-3 py-2 text-sm transition ${
                        fundingSort === "desc"
                          ? "bg-emerald-500/15 text-emerald-300"
                          : "text-white/60"
                      }`}
                    >
                      High → Low
                    </button>

                    <button
                      onClick={() => setFundingSort("asc")}
                      className={`flex-1 rounded-lg px-3 py-2 text-sm transition ${
                        fundingSort === "asc"
                          ? "bg-red-500/15 text-red-300"
                          : "text-white/60"
                      }`}
                    >
                      Low → High
                    </button>
                  </div>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={() => setOnlyActionable((prev) => !prev)}
                    className={`w-full rounded-xl border px-4 py-3 text-sm font-medium transition ${
                      onlyActionable
                        ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-300"
                        : "border-neutral-700 text-white/60"
                    }`}
                  >
                    {onlyActionable ? "Only opportunities" : "Show all symbols"}
                  </button>
                </div>
              </div>

              <div>
                <div className="mb-2 text-xs uppercase tracking-[0.22em] text-white/40">
                  Toggle exchanges
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setEnabledFundingExchanges(ALL_FUNDING_KEYS)}
                    className="rounded-full border border-cyan-400/25 bg-cyan-500/10 px-3 py-2 text-xs font-medium text-cyan-300 transition hover:bg-cyan-500/15"
                  >
                    All
                  </button>

                  {FUNDING_EXCHANGE_ORDER.map((exchange) => {
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

              <div className="text-xs text-white/30">
  Live funding data with interval and annualized views.
</div>
            </div>
          </div>

          <div className="rounded-2xl border border-neutral-800 bg-[#0c1220]/70 p-6 backdrop-blur-xl">
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
  Symbol
</th>

<th className="sticky left-[96px] top-0 z-40 w-[76px] border-b border-r border-neutral-800 bg-[#0b111d] px-3 py-3 text-xs uppercase tracking-[0.18em] text-white/40">
  OI Rank
</th>

<th className="sticky left-[172px] top-0 z-40 w-[96px] border-b border-r border-neutral-800 bg-[#0b111d] px-3 py-3 text-xs uppercase tracking-[0.18em] text-white/40">
  Max Arb
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
                    {fundingMatrixRows.map((row) => (
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
                                href={getExchangeMeta(row.buyExchange.key).tradeUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center rounded-full border border-emerald-400/25 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-500/15"
                              >
                                BUY {row.buyExchange.label}
                              </a>

                              <a
                                href={getExchangeMeta(row.sellExchange.key).tradeUrl}
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

            <div className="mt-6 flex flex-wrap items-center gap-3 text-xs text-white/35">
  <span>
    Rows: <span className="text-white/60">{fundingMatrixRows.length}</span>
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

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {TEMPLATES.map((template) => (
                <button
                  key={template}
                  onClick={() => {
                    setSelectedTemplate(template)
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