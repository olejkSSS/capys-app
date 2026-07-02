import { NextResponse } from "next/server"
import {
  getFundingExchangeMeta,
  normalizeExchangeKey,
  PERSONAL_FUNDING_EXCHANGES,
  PREFERRED_FUNDING_ORDER,
  type FundingExchangeMeta,
} from "../../data/perps"

const LORIS_FUNDING_URL = "https://api.loris.tools/funding"
const LORIS_PUBLIC_URL = "https://loris.tools/"
const CACHE_TTL_MS = 90_000
const UPSTREAM_TIMEOUT_MS = 12_000
const MAX_FETCH_ATTEMPTS = 3

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

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function getRetryDelay(response: Response, attempt: number) {
  const retryAfter = response.headers.get("retry-after")
  const retryAfterSeconds = retryAfter ? Number(retryAfter) : Number.NaN

  if (Number.isFinite(retryAfterSeconds)) {
    return Math.min(Math.max(retryAfterSeconds * 1000, 500), 5_000)
  }

  return 600 * 2 ** attempt
}

async function fetchLorisResponse() {
  let lastError: Error | null = null

  for (let attempt = 0; attempt < MAX_FETCH_ATTEMPTS; attempt += 1) {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS)

    try {
      const response = await fetch(LORIS_FUNDING_URL, {
        headers: {
          Accept: "application/json",
          "User-Agent": "capys.app funding screener",
          ...(process.env.LORIS_API_KEY
            ? { "X-Api-Key": process.env.LORIS_API_KEY }
            : {}),
        },
        next: { revalidate: 90 },
        signal: controller.signal,
      })

      if (response.ok) return response

      lastError = new Error(`Loris API error: ${response.status}`)
      const retryable = response.status === 429 || response.status >= 500

      if (!retryable || attempt === MAX_FETCH_ATTEMPTS - 1) {
        throw lastError
      }

      await wait(getRetryDelay(response, attempt))
    } catch (error) {
      lastError =
        error instanceof Error ? error : new Error("Loris API request failed")

      if (attempt === MAX_FETCH_ATTEMPTS - 1) throw lastError
      await wait(600 * 2 ** attempt)
    } finally {
      clearTimeout(timeout)
    }
  }

  throw lastError ?? new Error("Loris API request failed")
}

function decodeEscapedJson<T>(fragment: string): T {
  const decoded = JSON.parse(`"${fragment}"`)
  return JSON.parse(decoded) as T
}

function extractSnapshotField<T>(
  html: string,
  field: string,
  nextField: string
): T {
  const startMarker = `\\"${field}\\":`
  const endMarker = `,\\"${nextField}\\":`
  const start = html.indexOf(startMarker)

  if (start === -1) {
    throw new Error(`Loris public snapshot is missing ${field}`)
  }

  const valueStart = start + startMarker.length
  const end = html.indexOf(endMarker, valueStart)

  if (end === -1) {
    throw new Error(`Loris public snapshot has invalid ${field}`)
  }

  return decodeEscapedJson<T>(html.slice(valueStart, end))
}

async function fetchPublicFundingSnapshot() {
  const response = await fetch(LORIS_PUBLIC_URL, {
    headers: {
      Accept: "text/html",
      "User-Agent": "capys.app funding screener",
    },
    next: { revalidate: 90 },
  })

  if (!response.ok) {
    throw new Error(`Loris public snapshot error: ${response.status}`)
  }

  const html = await response.text()
  const exchangeNames = extractSnapshotField<LorisExchangeName[]>(
    html,
    "exchange_names",
    "exchanges"
  )
  const fundingRates = extractSnapshotField<
    Record<string, Record<string, number>>
  >(html, "funding_rates", "funding_rates_raw")
  const oiRankings = extractSnapshotField<Record<string, string>>(
    html,
    "oi_rankings",
    "default_oi_rank"
  )
  const defaultOiRankMatch = html.match(
    /\\"default_oi_rank\\":\\"([^"]+)\\"/
  )
  const timestampMatch = html.match(/\\"timestamp\\":\\"([^"]+)\\"/)

  return {
    exchanges: {
      exchange_names: exchangeNames,
    },
    funding_rates: fundingRates,
    oi_rankings: oiRankings,
    default_oi_rank: defaultOiRankMatch?.[1] ?? "500+",
    timestamp: timestampMatch?.[1] ?? null,
  }
}

async function fetchLorisData() {
  if (!process.env.LORIS_API_KEY) {
    return fetchPublicFundingSnapshot()
  }

  try {
    const response = await fetchLorisResponse()
    return await response.json()
  } catch {
    return fetchPublicFundingSnapshot()
  }
}

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
  const rawData = await fetchLorisData()
  const parsedData = typeof rawData === "string" ? JSON.parse(rawData) : rawData
  const data = parsedData?.data ?? parsedData

  const parsedExchangeNames: LorisExchangeName[] = Array.isArray(
    data?.exchanges?.exchange_names
  )
    ? data.exchanges.exchange_names
    : []

  const fundingRates: Record<string, Record<string, number>> =
    data?.funding_rates ?? {}

  if (
    !fundingRates ||
    typeof fundingRates !== "object" ||
    !Object.keys(fundingRates).length
  ) {
    throw new Error("Loris API returned no funding rates")
  }

  const oiRankings: Record<string, string> = data?.oi_rankings ?? {}
  const defaultOiRank: string = data?.default_oi_rank ?? "500+"
  const updatedAt: string | null = data?.timestamp ?? null
  const exchangeNames: LorisExchangeName[] = parsedExchangeNames.length
    ? parsedExchangeNames
    : Object.keys(fundingRates).map((key) => ({
        name: key,
        display: key,
      }))

  const exchangePairs = exchangeNames.map((exchange) => ({
    originalName: exchange.name,
    meta: getFundingExchangeMeta(exchange.name, exchange.display),
  }))

  const exchanges = sortExchanges(
    Array.from(
      new Map(
        exchangePairs.map((exchange) => [exchange.meta.key, exchange.meta])
      ).values()
    )
  )

  const rows: FundingRow[] = exchangePairs.flatMap(({ originalName, meta }) => {
    const rawExchangeFunding =
      fundingRates[originalName] ??
      fundingRates[meta.key] ??
      fundingRates[normalizeExchangeKey(originalName)] ??
      {}

    return Object.entries(rawExchangeFunding).flatMap(([symbol, rawFunding]) => {
      const funding = Number(rawFunding) / 100
      const normalizedSymbol = String(symbol).trim().toUpperCase()

      if (!normalizedSymbol || !Number.isFinite(funding)) return []

      let bias: FundingRow["bias"] = "neutral"
      if (funding > 0) bias = "longs_pay_shorts"
      if (funding < 0) bias = "shorts_pay_longs"

      return {
        exchange: meta.key,
        display: meta.label,
        symbol: normalizedSymbol,
        funding,
        oiRank:
          oiRankings[symbol] ??
          oiRankings[normalizedSymbol] ??
          defaultOiRank,
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
        "CDN-Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
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
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
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
            "Cache-Control": "public, s-maxage=30, stale-while-revalidate=300",
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
