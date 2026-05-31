import { NextResponse } from "next/server"
import {
  getFundingExchangeMeta,
  normalizeExchangeKey,
  PERSONAL_FUNDING_EXCHANGES,
  PREFERRED_FUNDING_ORDER,
  type FundingExchangeMeta,
} from "../../data/perps"

const LORIS_FUNDING_URL = "https://api.loris.tools/funding"
const CACHE_TTL_MS = 65_000

type LorisExchangeName = {
  name: string
  display: string
}

type FundingRow = {
  exchange: string
  display: string
  symbol: string
  funding: number
  oiRank: string
  bias: "longs_pay_shorts" | "shorts_pay_longs" | "neutral"
}

type FundingPayload = {
  updatedAt: string | null
  fetchedAt: string
  stale: boolean
  exchanges: FundingExchangeMeta[]
  rows: FundingRow[]
}

let cachedPayload: FundingPayload | null = null
let cachedAt = 0
let inFlightRequest: Promise<FundingPayload> | null = null

function sortExchanges(exchanges: FundingExchangeMeta[]) {
  return [...exchanges].sort((a, b) => {
    const aPreferred = PREFERRED_FUNDING_ORDER.indexOf(a.key)
    const bPreferred = PREFERRED_FUNDING_ORDER.indexOf(b.key)

    if (aPreferred !== -1 || bPreferred !== -1) {
      if (aPreferred === -1) return 1
      if (bPreferred === -1) return -1
      return aPreferred - bPreferred
    }

    return a.label.localeCompare(b.label)
  })
}

async function fetchFundingPayload(): Promise<FundingPayload> {
  const res = await fetch(LORIS_FUNDING_URL, {
    headers: {
      Accept: "application/json",
      "User-Agent": "capys.app funding screener",
    },
    cache: "no-store",
  })

  if (!res.ok) {
    throw new Error(`Loris API error: ${res.status}`)
  }

  const rawData = await res.json()
  const data = typeof rawData === "string" ? JSON.parse(rawData) : rawData

  const exchangeNames: LorisExchangeName[] = Array.isArray(
    data?.exchanges?.exchange_names
  )
    ? data.exchanges.exchange_names
    : []

  const fundingRates: Record<string, Record<string, number>> =
    data?.funding_rates ?? {}

  const oiRankings: Record<string, string> = data?.oi_rankings ?? {}
  const defaultOiRank: string = data?.default_oi_rank ?? "500+"
  const updatedAt: string | null = data?.timestamp ?? null

  const exchangePairs = exchangeNames.map((exchange) => ({
    originalName: exchange.name,
    meta: getFundingExchangeMeta(exchange.name, exchange.display),
  }))

  const exchanges = sortExchanges(
    exchangePairs.map((exchange) => exchange.meta)
  )

  const rows: FundingRow[] = exchangePairs.flatMap(({ originalName, meta }) => {
    const rawExchangeFunding =
      fundingRates[originalName] ??
      fundingRates[meta.key] ??
      fundingRates[normalizeExchangeKey(originalName)] ??
      {}

    return Object.entries(rawExchangeFunding).map(([symbol, rawFunding]) => {
      const funding = Number(rawFunding) / 100

      let bias: FundingRow["bias"] = "neutral"
      if (funding > 0) bias = "longs_pay_shorts"
      if (funding < 0) bias = "shorts_pay_longs"

      return {
        exchange: meta.key,
        display: meta.label,
        symbol: String(symbol).toUpperCase(),
        funding,
        oiRank: oiRankings[symbol] ?? defaultOiRank,
        bias,
      }
    })
  })

  return {
    updatedAt,
    fetchedAt: new Date().toISOString(),
    stale: false,
    exchanges,
    rows,
  }
}

export async function GET() {
  const now = Date.now()

  if (cachedPayload && now - cachedAt < CACHE_TTL_MS) {
    return NextResponse.json(cachedPayload, {
      headers: {
        "Cache-Control": "public, max-age=30, stale-while-revalidate=120",
      },
    })
  }

  try {
    inFlightRequest ??= fetchFundingPayload()
    const payload = await inFlightRequest

    cachedPayload = payload
    cachedAt = Date.now()

    return NextResponse.json(payload, {
      headers: {
        "Cache-Control": "public, max-age=30, stale-while-revalidate=120",
      },
    })
  } catch (error) {
    if (cachedPayload) {
      return NextResponse.json(
        {
          ...cachedPayload,
          stale: true,
          error:
            error instanceof Error ? error.message : "Failed to refresh funding data",
        },
        {
          headers: {
            "Cache-Control": "public, max-age=15, stale-while-revalidate=120",
          },
        }
      )
    }

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown funding error",
        updatedAt: null,
        fetchedAt: new Date().toISOString(),
        stale: true,
        exchanges: sortExchanges(Object.values(PERSONAL_FUNDING_EXCHANGES)),
        rows: [],
      },
      { status: 200 }
    )
  } finally {
    inFlightRequest = null
  }
}
