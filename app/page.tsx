"use client"

import Image from "next/image"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"

type Tier = "S+" | "S" | "A"
type Tab = "list" | "calculator" | "odds" | "funding"
type FundingMetricMode = "interval" | "annualized"
type FundingApiMode = "interval" | "normalized8h"
type FundingExchangeKey =
  | "edgex"
  | "ethereal"
  | "extended"
  | "hibachi"
  | "hyena"
  | "hyperliquid"
  | "pacifica"
  | "variational"

type FundingApiRow = {
  exchange: FundingExchangeKey
  display: string
  symbol: string
  funding: number
  oiRank: string
  intervalHours: number
  apiFundingMode: FundingApiMode
}

type FundingMatrixRow = {
  symbol: string
  oiRank: string
  maxArb: number
  activeCount: number
  lowFundingExchange: { key: FundingExchangeKey; label: string } | null
  highFundingExchange: { key: FundingExchangeKey; label: string } | null
  byExchange: Record<FundingExchangeKey, number | null>
}

const REFRESH_SECONDS = 60

const PROTOCOLS = {
  variational: {
    name: "Variational",
    tier: "S+" as Tier,
    logo: "/variational.png",
    tradeUrl: "https://omni.variational.io/?ref=OMNICAPY",
    refCode: "OMNICAPY",
    boost: "OMNICAPY · +15% points boost",
    farm: "Holding positions + volume on mid-OI tokens",
  },
  extended: {
    name: "Extended",
    tier: "S+" as Tier,
    logo: "/extended.png",
    tradeUrl: "https://app.extended.exchange/join/CAPY",
    refCode: "CAPY",
    boost: "CAPY · -10% fees + 5% points boost + 30% refback",
    farm: "Volume + holding positions",
  },
  hibachi: {
    name: "Hibachi",
    tier: "S" as Tier,
    logo: "/hibachi.png",
    tradeUrl: "https://hibachi.xyz/r/capy",
    refCode: "capy",
    boost: "capy · -15% fees + 15% points boost",
    farm: "Volume + holding positions",
  },
  ethereal: {
    name: "Ethereal",
    tier: "S" as Tier,
    logo: "/ethereal.png",
    tradeUrl: "https://app.ethereal.trade/?ref=UM68P2M9JZ6D",
    refCode: "UM68P2M9JZ6D",
    boost: "UM68P2M9JZ6D · +15% points boost",
    farm: "Boost farming + low OI tokens",
  },
  hyena: {
    name: "Hyena",
    tier: "S" as Tier,
    logo: "/hyena.png",
    tradeUrl: "https://app.hyena.trade/ref/CAPY",
    refCode: "CAPY",
    boost: "CAPY · +10% points boost",
    farm: "Activity + steady volume",
  },
  pacifica: {
    name: "Pacifica",
    tier: "A" as Tier,
    logo: "/pacifica.png",
    tradeUrl: "https://app.pacifica.fi/?referral=Capy",
    refCode: "Capy",
    boost: "Capy · +15% points boost",
    farm: "High volume + active trading",
  },
  edgex: {
    name: "EdgeX",
    tier: "A" as Tier,
    logo: "/edgex.png",
    tradeUrl: "https://pro.edgex.exchange/referral/OLEJK",
    refCode: "OLEJK",
    boost: "OLEJK · -10% fees + 10% points boost + VIP1",
    farm: "High volume + hold positions",
  },
  dreamcash: {
    name: "Dreamcash",
    tier: "A" as Tier,
    logo: "/dreamcash.png",
    tradeUrl: "https://dreamcash.xyz/share?code=CAPYCR",
    refCode: "CAPYCR",
    boost: "CAPYCR · boost from 10K to 1M points",
    farm: "Low OI tokens + active trading",
  },
  nado: {
    name: "Nado",
  },
  o1: {
    name: "01Exchange",
  },
  treadfi: {
    name: "Tread Fi",
  },
  ostium: {
    name: "Ostium",
  },
  grvt: {
    name: "GRVT",
  },
  bullpen: {
    name: "Bullpen",
  },
  standx: {
    name: "StandX",
  },
  liquid: {
    name: "Liquid",
  },
  decibel: {
    name: "Decibel",
  },
} as const

type ProtocolKey = keyof typeof PROTOCOLS

const LIST_PROTOCOL_IDS = [
  "variational",
  "extended",
  "hibachi",
  "ethereal",
  "hyena",
  "pacifica",
  "edgex",
  "dreamcash",
] as const satisfies readonly ProtocolKey[]

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

type TemplateName = (typeof TEMPLATES)[number]

const CALCULATOR_PRESETS = {
  variational: {
    available: true,
    fdv: 0.6,
    totalPoints: 9_300_000,
    airdrop: 30,
  },
  extended: {
    available: true,
    fdv: 0.5,
    totalPoints: 50_000_000,
    airdrop: 30,
  },
  pacifica: {
    available: true,
    fdv: 0.3,
    totalPoints: 240_000_000,
    airdrop: 20,
  },
  nado: {
    available: true,
    fdv: 0.3,
    totalPoints: 4_300_000,
    airdrop: 8,
  },
  o1: {
    available: true,
    fdv: 0.2,
    totalPoints: 10_000_000,
    airdrop: 20,
  },
  treadfi: {
    available: true,
    fdv: 0.3,
    totalPoints: 2_800_000,
    airdrop: 20,
  },
  dreamcash: {
    available: true,
    fdv: 0.1,
    totalPoints: 6_000_000,
    airdrop: 12,
  },
  hibachi: {
    available: true,
    fdv: 0.4,
    totalPoints: 60_000_000,
    airdrop: 15,
  },
  ethereal: {
    available: true,
    fdv: 0.3,
    totalPoints: 8_000_000_000,
    airdrop: 15,
  },
  ostium: {
    available: true,
    fdv: 0.3,
    totalPoints: 56_000_000,
    airdrop: 15,
  },
  grvt: {
    available: true,
    fdv: 0.15,
    totalPoints: 3_000_000,
    airdrop: 15,
  },
  bullpen: {
    available: true,
    fdv: 0.15,
    totalPoints: 69_900_000,
    airdrop: 15,
  },
  edgex: {
    available: true,
    fdv: 1,
    totalPoints: 10_000_000,
    airdrop: 30,
  },
  standx: {
    available: true,
    fdv: 0.2,
    totalPoints: 50_000_000,
    airdrop: 20,
  },
  hyena: {
    available: false,
  },
  liquid: {
    available: false,
  },
  decibel: {
    available: false,
  },
} as const

type CalcProtocolKey = keyof typeof CALCULATOR_PRESETS

const CALCULATOR_PROTOCOL_IDS = Object.keys(
  CALCULATOR_PRESETS
) as CalcProtocolKey[]

const ODDS_UPDATED_LABEL = "Manually curated snapshot"

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
    name: "EdgeX",
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
    note: "Strong odds overall, though market pricing can rerate quickly with sentiment changes.",
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
    name: "EdgeX",
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
    note: "Board is anchored low for now, with most optimism concentrated at lower thresholds.",
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

const FUNDING_EXCHANGES = {
  edgex: {
    label: "EdgeX",
    intervalHours: 8,
    tradeUrl: "https://pro.edgex.exchange/referral/OLEJK",
    hasPersonalRef: true,
    apiFundingMode: "interval" as FundingApiMode,
  },
  ethereal: {
    label: "Ethereal",
    intervalHours: 8,
    tradeUrl: "https://app.ethereal.trade/?ref=UM68P2M9JZ6D",
    hasPersonalRef: true,
    apiFundingMode: "interval" as FundingApiMode,
  },
  extended: {
    label: "Extended",
    intervalHours: 1,
    tradeUrl: "https://app.extended.exchange/join/CAPY",
    hasPersonalRef: true,
    apiFundingMode: "normalized8h" as FundingApiMode,
  },
  hibachi: {
    label: "Hibachi",
    intervalHours: 8,
    tradeUrl: "https://hibachi.xyz/r/capy",
    hasPersonalRef: true,
    apiFundingMode: "interval" as FundingApiMode,
  },
  hyena: {
    label: "Hyena",
    intervalHours: 8,
    tradeUrl: "https://app.hyena.trade/ref/CAPY",
    hasPersonalRef: true,
    apiFundingMode: "interval" as FundingApiMode,
  },
  hyperliquid: {
    label: "Hyperliquid",
    intervalHours: 1,
    tradeUrl: "https://app.hyperliquid.xyz/",
    hasPersonalRef: false,
    apiFundingMode: "normalized8h" as FundingApiMode,
  },
  pacifica: {
    label: "Pacifica",
    intervalHours: 8,
    tradeUrl: "https://app.pacifica.fi/?referral=Capy",
    hasPersonalRef: true,
    apiFundingMode: "interval" as FundingApiMode,
  },
  variational: {
    label: "Variational",
    intervalHours: 8,
    tradeUrl: "https://omni.variational.io/?ref=OMNICAPY",
    hasPersonalRef: true,
    apiFundingMode: "interval" as FundingApiMode,
  },
} as const

const ALL_FUNDING_KEYS = Object.keys(
  FUNDING_EXCHANGES
) as FundingExchangeKey[]

const FUNDING_KEY_SET = new Set<FundingExchangeKey>(ALL_FUNDING_KEYS)

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function normalizeNumberInput(
  value: string,
  { allowDecimal = false }: { allowDecimal?: boolean } = {}
) {
  const base = value.replace(/,/g, ".")

  if (!allowDecimal) {
    return base.replace(/[^\d]/g, "")
  }

  const stripped = base.replace(/[^\d.]/g, "")
  const [head, ...tail] = stripped.split(".")
  return tail.length ? `${head}.${tail.join("")}` : stripped
}

function parsePositiveNumber(value: string) {
  const parsed = Number.parseFloat(value)
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0
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

function formatPointPrice(value: number) {
  if (!Number.isFinite(value) || value <= 0) return "$0.00"
  if (value >= 1) return formatMoney(value, 2)
  if (value >= 0.01) return formatMoney(value, 4)
  if (value >= 0.0001) return formatMoney(value, 6)
  return formatMoney(value, 8)
}

function getTierStyle(tier: Tier) {
  if (tier === "S+") {
    return "bg-purple-500/20 border-purple-400 text-purple-300 shadow-[0_0_35px_rgba(168,85,247,0.9)]"
  }

  if (tier === "S") {
    return "bg-yellow-500/20 border-yellow-400 text-yellow-300 shadow-[0_0_22px_rgba(250,204,21,0.7)]"
  }

  return "bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_22px_rgba(34,211,238,0.7)]"
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

  const normalized = String(value).trim()
  if (!normalized) return 999999

  if (normalized.includes("+")) {
    const numeric = Number(normalized.replace("+", ""))
    return Number.isFinite(numeric) ? numeric : 999999
  }

  const numeric = Number(normalized)
  return Number.isFinite(numeric) ? numeric : 999999
}

function normalizeExchangeKey(value: unknown): FundingExchangeKey | null {
  const key = String(value ?? "")
    .trim()
    .toLowerCase() as FundingExchangeKey

  return FUNDING_KEY_SET.has(key) ? key : null
}

function buildEmptyExchangeMap() {
  return Object.fromEntries(
    ALL_FUNDING_KEYS.map((key) => [key, null])
  ) as Record<FundingExchangeKey, number | null>
}

function getExchangeMeta(exchangeKey: FundingExchangeKey) {
  return FUNDING_EXCHANGES[exchangeKey]
}

function toDisplayedFundingValue(
  rawFunding: number,
  intervalHours: number,
  apiFundingMode: FundingApiMode,
  metricMode: FundingMetricMode
) {
  if (!Number.isFinite(rawFunding) || !Number.isFinite(intervalHours) || intervalHours <= 0) {
    return 0
  }

  const actualIntervalFunding =
    apiFundingMode === "normalized8h"
      ? rawFunding / (8 / intervalHours)
      : rawFunding

  if (metricMode === "annualized") {
    return actualIntervalFunding * (24 / intervalHours) * 365
  }

  return actualIntervalFunding
}

function getFocusableElements(container: HTMLElement | null) {
  if (!container) return []

  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
  ).filter((element) => !element.hasAttribute("aria-hidden"))
}

export default function Home() {
  const [tab, setTab] = useState<Tab>("list")
  const [calcPerp, setCalcPerp] = useState<CalcProtocolKey>("variational")
  const [templatePicker, setTemplatePicker] = useState(false)
  const [selectedTemplate, setSelectedTemplate] =
    useState<TemplateName>("cinema")
  const [isDownloading, setIsDownloading] = useState(false)
  const [launchSort, setLaunchSort] = useState<"desc" | "asc">("desc")
  const [fdvSort, setFdvSort] = useState<"desc" | "asc">("desc")

  const [myPointsInput, setMyPointsInput] = useState("0")
  const [fdvInput, setFdvInput] = useState("0.6")
  const [totalPointsInput, setTotalPointsInput] = useState("9300000")
  const [airdropInput, setAirdropInput] = useState("30")

  const [copiedRefName, setCopiedRefName] = useState<string | null>(null)
  const [copiedTicker, setCopiedTicker] = useState<string | null>(null)

  const [fundingRows, setFundingRows] = useState<FundingApiRow[]>([])
  const [fundingUpdatedAt, setFundingUpdatedAt] = useState<string | null>(null)
  const [fundingLoading, setFundingLoading] = useState(false)
  const [fundingRefreshing, setFundingRefreshing] = useState(false)
  const [fundingError, setFundingError] = useState<string | null>(null)
  const [fundingNotice, setFundingNotice] = useState<string | null>(null)
  const [fundingSort, setFundingSort] = useState<"desc" | "asc">("desc")
  const [searchTicker, setSearchTicker] = useState("")
  const [enabledFundingExchanges, setEnabledFundingExchanges] =
    useState<FundingExchangeKey[]>(ALL_FUNDING_KEYS)
  const [fundingMetricMode, setFundingMetricMode] =
    useState<FundingMetricMode>("interval")
  const [onlyActionable, setOnlyActionable] = useState(true)
  const [refreshCountdown, setRefreshCountdown] = useState(REFRESH_SECONDS)

  const cardRef = useRef<HTMLDivElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  const previousFocusedElementRef = useRef<HTMLElement | null>(null)
  const fundingAbortRef = useRef<AbortController | null>(null)
  const listCopyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const tickerCopyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const fundingRowsCountRef = useRef(0)

  const currentPreset = CALCULATOR_PRESETS[calcPerp]
  const currentProtocolName = PROTOCOLS[calcPerp]?.name ?? calcPerp

  useEffect(() => {
    fundingRowsCountRef.current = fundingRows.length
  }, [fundingRows.length])

  useEffect(() => {
    if (currentPreset.available) {
      setMyPointsInput("0")
      setFdvInput(String(currentPreset.fdv))
      setTotalPointsInput(String(currentPreset.totalPoints))
      setAirdropInput(String(currentPreset.airdrop))
      return
    }

    setMyPointsInput("")
    setFdvInput("")
    setTotalPointsInput("")
    setAirdropInput("")
  }, [calcPerp, currentPreset])

  useEffect(() => {
    return () => {
      if (listCopyTimeoutRef.current) clearTimeout(listCopyTimeoutRef.current)
      if (tickerCopyTimeoutRef.current) clearTimeout(tickerCopyTimeoutRef.current)
      fundingAbortRef.current?.abort()
    }
  }, [])

  useEffect(() => {
    if (!templatePicker) return

    previousFocusedElementRef.current = document.activeElement as HTMLElement | null
    document.body.style.overflow = "hidden"

    const dialog = dialogRef.current
    const focusable = getFocusableElements(dialog)
    focusable[0]?.focus()

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setTemplatePicker(false)
        return
      }

      if (event.key !== "Tab") return

      const items = getFocusableElements(dialogRef.current)
      if (!items.length) return

      const first = items[0]
      const last = items[items.length - 1]
      const active = document.activeElement as HTMLElement | null

      if (event.shiftKey && active === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && active === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener("keydown", onKeyDown)

    return () => {
      document.body.style.overflow = ""
      document.removeEventListener("keydown", onKeyDown)
      previousFocusedElementRef.current?.focus()
    }
  }, [templatePicker])

  const loadFunding = useCallback(async (silent = false) => {
    fundingAbortRef.current?.abort()

    const controller = new AbortController()
    fundingAbortRef.current = controller

    try {
      if (silent) {
        setFundingRefreshing(true)
        setFundingNotice(null)
      } else {
        setFundingLoading(true)
        setFundingError(null)
        setFundingNotice(null)
      }

      const res = await fetch("/api/funding", {
        cache: "no-store",
        headers: {
          Accept: "application/json",
        },
        signal: controller.signal,
      })

      const contentType = res.headers.get("content-type") ?? ""
      if (!contentType.includes("application/json")) {
        throw new Error("Funding endpoint returned non-JSON data")
      }

      const data = await res.json()

      if (!res.ok) {
        throw new Error(
          typeof data?.error === "string" ? data.error : "Failed to load funding data"
        )
      }

      const rawRows = Array.isArray(data?.rows) ? data.rows : []

      const safeRows: FundingApiRow[] = rawRows.flatMap((row: unknown) => {
        if (!row || typeof row !== "object") return []

        const candidate = row as Record<string, unknown>
        const exchange = normalizeExchangeKey(candidate.exchange)
        if (!exchange) return []

        const meta = getExchangeMeta(exchange)
        const symbol = String(candidate.symbol ?? "")
          .trim()
          .toUpperCase()

        if (!symbol) return []

        const parsedFunding = Number(candidate.funding)
        const parsedIntervalHours = Number(candidate.intervalHours)

        const apiFundingMode: FundingApiMode =
          candidate.apiFundingMode === "interval" ||
          candidate.apiFundingMode === "normalized8h"
            ? candidate.apiFundingMode
            : meta.apiFundingMode

        return [
          {
            exchange,
            display:
              String(candidate.display ?? "").trim() || meta.label,
            symbol,
            funding: Number.isFinite(parsedFunding) ? parsedFunding : 0,
            oiRank: String(candidate.oiRank ?? "500+"),
            intervalHours:
              Number.isFinite(parsedIntervalHours) && parsedIntervalHours > 0
                ? parsedIntervalHours
                : meta.intervalHours,
            apiFundingMode,
          },
        ]
      })

      setFundingRows(safeRows)
      setFundingUpdatedAt(data?.updatedAt ? String(data.updatedAt) : null)
      setFundingError(null)
      setFundingNotice(null)
      setRefreshCountdown(REFRESH_SECONDS)
    } catch (error) {
      if (controller.signal.aborted) return

      const message =
        error instanceof Error ? error.message : "Failed to load funding data"

      if (silent && fundingRowsCountRef.current > 0) {
        setFundingNotice("Auto-refresh failed. Showing latest successful snapshot.")
      } else {
        setFundingError(message)
      }
    } finally {
      if (fundingAbortRef.current === controller) {
        fundingAbortRef.current = null
      }

      if (silent) {
        setFundingRefreshing(false)
      } else {
        setFundingLoading(false)
      }
    }
  }, [])

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
          return REFRESH_SECONDS
        }

        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [tab, loadFunding])

  const safeMyPoints = currentPreset.available
    ? parsePositiveNumber(myPointsInput)
    : 0
  const safeFdv = currentPreset.available ? parsePositiveNumber(fdvInput) : 0
  const safeTotalPoints = currentPreset.available
    ? Math.max(parsePositiveNumber(totalPointsInput), 1)
    : 1
  const safeAirdrop = currentPreset.available
    ? clamp(parsePositiveNumber(airdropInput), 0, 100)
    : 0

  const { pricePerPoint, myValue } = useMemo(() => {
    if (!currentPreset.available) {
      return {
        pricePerPoint: 0,
        myValue: 0,
      }
    }

    const pool = safeFdv * 1_000_000_000 * (safeAirdrop / 100)
    const price = pool / safeTotalPoints
    const value = safeMyPoints * price

    return {
      pricePerPoint: price,
      myValue: value,
    }
  }, [currentPreset.available, safeAirdrop, safeFdv, safeMyPoints, safeTotalPoints])

  const sortedLaunchOdds = useMemo(
    () =>
      [...POLYMARKET_LAUNCH_ODDS].sort((a, b) =>
        launchSort === "desc"
          ? b.probability - a.probability
          : a.probability - b.probability
      ),
    [launchSort]
  )

  const sortedFdvOdds = useMemo(
    () =>
      [...POLYMARKET_FDV_ODDS].sort((a, b) =>
        fdvSort === "desc"
          ? b.probability - a.probability
          : a.probability - b.probability
      ),
    [fdvSort]
  )

  const activeFundingExchanges = useMemo(
    () =>
      ALL_FUNDING_KEYS.filter((key) => enabledFundingExchanges.includes(key)).map(
        (key) => ({
          key,
          ...FUNDING_EXCHANGES[key],
        })
      ),
    [enabledFundingExchanges]
  )

  const visibleFundingRows = useMemo(() => {
    const search = searchTicker.trim().toUpperCase()

    return fundingRows
      .filter((row) => enabledFundingExchanges.includes(row.exchange))
      .filter((row) => !search || row.symbol.includes(search))
      .map((row) => ({
        ...row,
        displayFunding: toDisplayedFundingValue(
          row.funding,
          row.intervalHours,
          row.apiFundingMode,
          fundingMetricMode
        ),
      }))
  }, [enabledFundingExchanges, fundingMetricMode, fundingRows, searchTicker])

  const fundingMatrixRows = useMemo(() => {
    const grouped = new Map<
      string,
      {
        symbol: string
        oiRank: string
        byExchange: Record<FundingExchangeKey, number | null>
      }
    >()

    for (const row of visibleFundingRows) {
      const symbol = row.symbol.trim()
      if (!symbol) continue

      if (!grouped.has(symbol)) {
        grouped.set(symbol, {
          symbol,
          oiRank: String(row.oiRank ?? "500+"),
          byExchange: buildEmptyExchangeMap(),
        })
      }

      const currentGroup = grouped.get(symbol)!
      currentGroup.byExchange[row.exchange] = Number.isFinite(row.displayFunding)
        ? row.displayFunding
        : null

      if (parseOiRank(row.oiRank) < parseOiRank(currentGroup.oiRank)) {
        currentGroup.oiRank = String(row.oiRank ?? "500+")
      }
    }

    const matrix = Array.from(grouped.values()).map((group) => {
  const activeValues: Array<{
    key: FundingExchangeKey
    label: string
    value: number
  }> = activeFundingExchanges.flatMap((exchange) => {
    const value = group.byExchange[exchange.key]

    if (value === null || !Number.isFinite(value)) {
      return []
    }

    return [
      {
        key: exchange.key,
        label: exchange.label,
        value,
      },
    ]
  })

  const maxFunding = activeValues.length
    ? Math.max(...activeValues.map((item) => item.value))
    : 0

  const minFunding = activeValues.length
    ? Math.min(...activeValues.map((item) => item.value))
    : 0

  const lowFundingExchange =
    [...activeValues].sort((a, b) => a.value - b.value)[0] ?? null

  const highFundingExchange =
    [...activeValues].sort((a, b) => b.value - a.value)[0] ?? null

  return {
    symbol: group.symbol,
    oiRank: group.oiRank,
    maxArb: maxFunding - minFunding,
    activeCount: activeValues.length,
    lowFundingExchange:
      lowFundingExchange &&
      highFundingExchange &&
      lowFundingExchange.key !== highFundingExchange.key
        ? {
            key: lowFundingExchange.key,
            label: lowFundingExchange.label,
          }
        : null,
    highFundingExchange:
      lowFundingExchange &&
      highFundingExchange &&
      lowFundingExchange.key !== highFundingExchange.key
        ? {
            key: highFundingExchange.key,
            label: highFundingExchange.label,
          }
        : null,
    byExchange: group.byExchange,
  } satisfies FundingMatrixRow
})

    const filtered = onlyActionable
      ? matrix.filter((row) => row.activeCount >= 2 && row.maxArb > 0)
      : matrix

    return filtered.sort((a, b) => {
      if (fundingSort === "desc") {
        return b.maxArb - a.maxArb || a.symbol.localeCompare(b.symbol)
      }

      return a.maxArb - b.maxArb || a.symbol.localeCompare(b.symbol)
    })
  }, [activeFundingExchanges, fundingSort, onlyActionable, visibleFundingRows])

  const summaryFundingRows = useMemo(() => {
    if (!onlyActionable) return visibleFundingRows

    const actionableSymbols = new Set(fundingMatrixRows.map((row) => row.symbol))
    return visibleFundingRows.filter((row) => actionableSymbols.has(row.symbol))
  }, [fundingMatrixRows, onlyActionable, visibleFundingRows])

  const topFundingPositive = useMemo(() => {
    const positive = summaryFundingRows.filter((row) => row.displayFunding > 0)
    if (!positive.length) return null
    return [...positive].sort((a, b) => b.displayFunding - a.displayFunding)[0]
  }, [summaryFundingRows])

  const topFundingNegative = useMemo(() => {
    const negative = summaryFundingRows.filter((row) => row.displayFunding < 0)
    if (!negative.length) return null
    return [...negative].sort((a, b) => a.displayFunding - b.displayFunding)[0]
  }, [summaryFundingRows])

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
    if (!cardRef.current || isDownloading || !currentPreset.available) return

    try {
      setIsDownloading(true)

      const { toPng } = await import("html-to-image")

      if ("fonts" in document) {
        await document.fonts.ready
      }

      await new Promise((resolve) => setTimeout(resolve, 150))

      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: "#060b16",
      })

      const link = document.createElement("a")
      link.download = `${currentProtocolName.toLowerCase()}-airdrop-card.png`
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
    if (!currentPreset.available) return

    const text = `My potential ${currentProtocolName} airdrop is ${formatMoney(myValue, 0)}.

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
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
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
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
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
          <div
            role="tablist"
            aria-label="Capy Perp Hub sections"
            className="flex flex-wrap justify-center rounded-full border border-neutral-800 bg-[#0c1220]/70 p-1 backdrop-blur"
          >
            <button
              id="tab-list"
              role="tab"
              aria-selected={tab === "list"}
              aria-controls="panel-list"
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
              id="tab-calculator"
              role="tab"
              aria-selected={tab === "calculator"}
              aria-controls="panel-calculator"
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
              id="tab-odds"
              role="tab"
              aria-selected={tab === "odds"}
              aria-controls="panel-odds"
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
              id="tab-funding"
              role="tab"
              aria-selected={tab === "funding"}
              aria-controls="panel-funding"
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
        <section
          id="panel-list"
          role="tabpanel"
          aria-labelledby="tab-list"
          className="mx-auto mt-16 max-w-5xl space-y-6 px-4 sm:mt-20 sm:px-6"
        >
          <div className="hidden grid-cols-[100px_1fr_260px_auto] border-b border-neutral-800 pb-4 text-xs uppercase tracking-widest opacity-50 md:grid">
            <div className="pl-2">Tier</div>
            <div>Protocol</div>
            <div className="pr-6 text-right">Boost</div>
            <div />
          </div>

          {LIST_PROTOCOL_IDS.map((id) => {
            const perp = PROTOCOLS[id]
            if (!perp.logo || !perp.tradeUrl || !perp.refCode || !perp.boost || !perp.farm || !perp.tier) {
              return null
            }

            return (
              <div
                key={perp.name}
                className="group flex flex-col items-start gap-4 rounded-2xl border border-neutral-800 bg-[#0c1220]/70 p-4 backdrop-blur-xl transition hover:scale-[1.01] hover:border-cyan-400/40 hover:shadow-[0_0_30px_rgba(34,211,238,0.2)] md:grid md:grid-cols-[100px_1fr_260px_auto] md:items-center md:p-5"
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
                    <div className="text-xs text-white/45">Farm tip: {perp.farm}</div>
                  </div>
                </div>

                <div className="flex w-full md:justify-center">
                  <button
                    type="button"
                    onClick={() => void copyRefCode(perp.name, perp.refCode)}
                    className="w-full rounded-2xl border border-emerald-400 bg-emerald-400/5 px-3 py-2 text-left transition hover:bg-emerald-400/10 md:max-w-[250px]"
                  >
                    <div className="text-xs font-medium text-emerald-300 sm:text-sm">
                      {copiedRefName === perp.name ? "Copied code" : perp.boost}
                    </div>
                    <div className="mt-1 text-[11px] text-white/45">
                      Code: <span className="text-cyan-300">{perp.refCode}</span> · click to copy
                    </div>
                  </button>
                </div>

                <a
                  href={perp.tradeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 w-full rounded-xl border border-cyan-400 bg-cyan-400/5 px-6 py-2 text-center font-semibold text-cyan-300 transition hover:bg-cyan-400/10 md:ml-4 md:mt-0 md:w-auto"
                >
                  TRADE →
                </a>
              </div>
            )
          })}
        </section>
      )}

      {tab === "calculator" && (
        <section
          id="panel-calculator"
          role="tabpanel"
          aria-labelledby="tab-calculator"
          className="mx-auto mt-20 max-w-5xl space-y-8 px-4"
        >
          <p className="text-center opacity-50">
            Calculate your potential airdrop based on your perp DEX points balance.
          </p>

          <div className="flex flex-wrap justify-center gap-3">
            {CALCULATOR_PROTOCOL_IDS.map((key) => {
              const isActive = calcPerp === key
              const isAvailable = CALCULATOR_PRESETS[key].available
              const label = PROTOCOLS[key]?.name ?? key

              return (
                <button
                  key={key}
                  onClick={() => setCalcPerp(key)}
                  className={`rounded-full border px-4 py-2 text-sm transition ${
                    isActive
                      ? "border-cyan-400 bg-cyan-400/10 text-cyan-300 shadow-[0_0_18px_rgba(34,211,238,0.2)]"
                      : isAvailable
                      ? "border-neutral-700 text-neutral-400 hover:border-neutral-500 hover:text-white"
                      : "border-neutral-800 text-white/30"
                  }`}
                >
                  {label}
                  {!isAvailable && <span className="ml-2 text-[10px] uppercase text-white/35">Soon</span>}
                </button>
              )
            })}
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <p className="mb-2 text-xs opacity-50">MY POINTS</p>
              <input
                type="text"
                inputMode="numeric"
                disabled={!currentPreset.available}
                value={myPointsInput}
                onChange={(e) =>
                  setMyPointsInput(normalizeNumberInput(e.target.value))
                }
                className="w-full rounded-xl border border-neutral-800 bg-[#0c1220] p-4 outline-none transition focus:border-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <div>
              <p className="mb-2 text-xs opacity-50">FDV (billions $)</p>
              <input
                type="text"
                inputMode="decimal"
                disabled={!currentPreset.available}
                value={fdvInput}
                onChange={(e) =>
                  setFdvInput(
                    normalizeNumberInput(e.target.value, { allowDecimal: true })
                  )
                }
                className="w-full rounded-xl border border-neutral-800 bg-[#0c1220] p-4 outline-none transition focus:border-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <div>
              <p className="mb-2 text-xs opacity-50">TOTAL POINTS</p>
              <input
                type="text"
                inputMode="numeric"
                disabled={!currentPreset.available}
                value={totalPointsInput}
                onChange={(e) =>
                  setTotalPointsInput(normalizeNumberInput(e.target.value))
                }
                className="w-full rounded-xl border border-neutral-800 bg-[#0c1220] p-4 outline-none transition focus:border-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <div>
              <p className="mb-2 text-xs opacity-50">AIRDROP % SUPPLY</p>
              <input
                type="text"
                inputMode="numeric"
                disabled={!currentPreset.available}
                value={airdropInput}
                onChange={(e) =>
                  setAirdropInput(normalizeNumberInput(e.target.value))
                }
                className="w-full rounded-xl border border-neutral-800 bg-[#0c1220] p-4 outline-none transition focus:border-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
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
                    {currentProtocolName}
                  </div>

                  <div className="text-[10px] uppercase tracking-[0.35em] text-white/45 sm:text-xs">
                    Potential Airdrop Value
                  </div>

                  {currentPreset.available ? (
                    <>
                      <div className="mt-3 text-3xl font-bold leading-none text-white sm:text-4xl md:text-6xl">
                        {formatMoney(myValue, 0)}
                      </div>

                      <div className="mt-3 text-sm text-white/65 sm:text-base">
                        {formatNumber(safeMyPoints)} points · {formatPointPrice(pricePerPoint)} per point
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="mt-3 text-2xl font-bold leading-tight text-white sm:text-3xl md:text-5xl">
                        Estimates unavailable
                      </div>

                      <div className="mt-3 max-w-xl text-sm text-white/65 sm:text-base">
                        This project is shown in the calculator list, but default supply assumptions are not ready yet.
                      </div>
                    </>
                  )}
                </div>

                <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-[10px] uppercase tracking-[0.22em] text-white/45 sm:px-4 sm:text-xs">
                  {currentPreset.available ? "estimate only" : "coming soon"}
                </div>
              </div>

              <div className="mt-auto grid grid-cols-2 gap-3 md:grid-cols-4">
                <div className="rounded-2xl border border-white/10 bg-black/30 p-3 backdrop-blur-md sm:p-4">
                  <div className="text-[10px] uppercase tracking-[0.22em] text-white/40 sm:text-[11px]">
                    My Points
                  </div>
                  <div className="mt-2 text-lg font-semibold text-white sm:text-xl">
                    {currentPreset.available ? formatNumber(safeMyPoints) : "—"}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/30 p-3 backdrop-blur-md sm:p-4">
                  <div className="text-[10px] uppercase tracking-[0.22em] text-white/40 sm:text-[11px]">
                    Total Supply
                  </div>
                  <div className="mt-2 text-lg font-semibold text-white sm:text-xl">
                    {currentPreset.available ? formatNumber(safeTotalPoints) : "—"}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/30 p-3 backdrop-blur-md sm:p-4">
                  <div className="text-[10px] uppercase tracking-[0.22em] text-white/40 sm:text-[11px]">
                    Est. FDV
                  </div>
                  <div className="mt-2 text-lg font-semibold text-white sm:text-xl">
                    {currentPreset.available ? formatCompactMoney(safeFdv * 1_000_000_000) : "—"}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/30 p-3 backdrop-blur-md sm:p-4">
                  <div className="text-[10px] uppercase tracking-[0.22em] text-white/40 sm:text-[11px]">
                    Airdrop %
                  </div>
                  <div className="mt-2 text-lg font-semibold text-white sm:text-xl">
                    {currentPreset.available ? `${safeAirdrop}%` : "—"}
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
              disabled={isDownloading || !currentPreset.available}
              className="rounded-xl border border-neutral-700 px-6 py-3 transition hover:border-purple-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isDownloading ? "Downloading..." : "Download Card"}
            </button>

            <button
              onClick={shareOnX}
              disabled={!currentPreset.available}
              className="rounded-xl bg-white px-6 py-3 font-semibold text-black transition disabled:cursor-not-allowed disabled:opacity-50"
            >
              Share on X
            </button>
          </div>
        </section>
      )}

      {tab === "odds" && (
        <section
          id="panel-odds"
          role="tabpanel"
          aria-labelledby="tab-odds"
          className="mx-auto mt-20 max-w-6xl space-y-8 px-4 sm:px-6"
        >
          <div className="rounded-2xl border border-neutral-800 bg-[#0c1220]/70 p-6 backdrop-blur-xl">
            <h2 className="text-2xl font-semibold text-white">Polymarket Odds</h2>

            <p className="mt-2 text-sm text-white/50">
              Market-implied launch timing and FDV expectations based on manually curated Polymarket references.
            </p>

            <div className="mt-3 inline-flex rounded-full border border-fuchsia-400/20 bg-fuchsia-400/10 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-fuchsia-300/80">
              {ODDS_UPDATED_LABEL}
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

                      <div className="text-sm text-white/45">Deadline: {item.deadline}</div>

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
                          {item.threshold} · {item.probability}%
                        </div>
                      </div>

                      <div className="text-sm text-cyan-300/75">Current market leader</div>

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
        <section
          id="panel-funding"
          role="tabpanel"
          aria-labelledby="tab-funding"
          className="mx-auto mt-20 max-w-[1750px] space-y-8 px-4 sm:px-6"
        >
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

                  {fundingRefreshing && (
                    <div className="inline-flex rounded-full border border-yellow-400/20 bg-yellow-400/10 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-yellow-300/80">
                      Refreshing...
                    </div>
                  )}
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

                  {ALL_FUNDING_KEYS.map((exchangeKey) => {
                    const enabled = enabledFundingExchanges.includes(exchangeKey)
                    const exchange = FUNDING_EXCHANGES[exchangeKey]

                    return (
                      <button
                        key={exchangeKey}
                        onClick={() => toggleFundingExchange(exchangeKey)}
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
                Potential routes ignore execution fees, slippage, spread and timing to the next funding event.
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-neutral-800 bg-[#0c1220]/70 p-6 backdrop-blur-xl">
            {fundingNotice && (
              <div className="mb-4 rounded-2xl border border-yellow-400/20 bg-yellow-400/10 p-4 text-sm text-yellow-300">
                {fundingNotice}
              </div>
            )}

            {fundingLoading && !fundingRows.length && (
              <div className="rounded-2xl border border-neutral-800 bg-black/20 p-6 text-white/60">
                Loading funding data...
              </div>
            )}

            {fundingError && !fundingRows.length && (
              <div className="rounded-2xl border border-red-400/20 bg-red-400/10 p-6 text-red-300">
                {fundingError}
              </div>
            )}

            {(!fundingLoading || fundingRows.length > 0) && !fundingError && (
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

                      <th className="sticky left-[268px] top-0 z-40 w-[240px] border-b border-r border-neutral-800 bg-[#0b111d] px-3 py-3 text-xs uppercase tracking-[0.18em] text-white/40">
                        Potential Route
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

                        <td className="sticky left-[268px] z-20 w-[240px] border-b border-r border-neutral-800 bg-[#0b111d] px-3 py-4">
                          {row.lowFundingExchange && row.highFundingExchange ? (
                            <div className="flex flex-wrap gap-2">
                              <a
                                href={getExchangeMeta(row.lowFundingExchange.key).tradeUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center rounded-full border border-emerald-400/25 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-500/15"
                              >
                                Low funding: {row.lowFundingExchange.label}
                              </a>

                              <a
                                href={getExchangeMeta(row.highFundingExchange.key).tradeUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center rounded-full border border-red-400/25 bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-300 transition hover:bg-red-500/15"
                              >
                                High funding: {row.highFundingExchange.label}
                              </a>
                            </div>
                          ) : (
                            <span className="text-xs text-white/35">No clear route</span>
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
                                    : `Open ${exchange.label}`
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
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setTemplatePicker(false)
            }
          }}
        >
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="template-picker-title"
            className="max-h-[85vh] w-full max-w-5xl overflow-y-auto rounded-2xl border border-neutral-800 bg-[#0c1220] p-6"
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 id="template-picker-title" className="text-lg">
                Choose Card Background
              </h3>

              <button
                onClick={() => setTemplatePicker(false)}
                aria-label="Close template picker"
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