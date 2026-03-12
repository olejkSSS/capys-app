import { NextResponse } from "next/server"

const EXCHANGE_META = {
  edgex: {
    label: "EdgeX",
    intervalHours: 8,
    apiFundingMode: "interval",
  },
  ethereal: {
    label: "Ethereal",
    intervalHours: 8,
    apiFundingMode: "interval",
  },
  extended: {
    label: "Extended",
    intervalHours: 1,
    apiFundingMode: "normalized8h",
  },
  hibachi: {
    label: "Hibachi",
    intervalHours: 8,
    apiFundingMode: "interval",
  },
  hyena: {
    label: "Hyena",
    intervalHours: 8,
    apiFundingMode: "interval",
  },
  hyperliquid: {
    label: "Hyperliquid",
    intervalHours: 1,
    apiFundingMode: "normalized8h",
  },
  pacifica: {
    label: "Pacifica",
    intervalHours: 8,
    apiFundingMode: "interval",
  },
  variational: {
    label: "Variational",
    intervalHours: 8,
    apiFundingMode: "interval",
  },
} as const

type ExchangeKey = keyof typeof EXCHANGE_META
type ApiFundingMode = "interval" | "normalized8h"

type FundingRow = {
  exchange: ExchangeKey
  display: string
  symbol: string
  funding: number
  oiRank: string
  intervalHours: number
  apiFundingMode: ApiFundingMode
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function isExchangeKey(value: string): value is ExchangeKey {
  return value in EXCHANGE_META
}

export async function GET() {
  try {
    const res = await fetch("https://api.loris.tools/funding", {
      headers: {
        Accept: "application/json",
      },
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(8000),
    })

    if (!res.ok) {
      return NextResponse.json(
        { error: `Upstream funding API error: ${res.status}` },
        { status: 502 }
      )
    }

    const contentType = res.headers.get("content-type") ?? ""
    if (!contentType.includes("application/json")) {
      return NextResponse.json(
        { error: "Upstream returned non-JSON response" },
        { status: 502 }
      )
    }

    const data: unknown = await res.json()

    if (!isRecord(data)) {
      return NextResponse.json(
        { error: "Invalid upstream payload" },
        { status: 502 }
      )
    }

    const exchangesRoot = isRecord(data.exchanges) ? data.exchanges : null
    const exchangeNamesRaw = Array.isArray(exchangesRoot?.exchange_names)
      ? exchangesRoot.exchange_names
      : []

    const fundingRatesRaw =
      isRecord(data.funding_rates) ? data.funding_rates : {}
    const oiRankingsRaw = isRecord(data.oi_rankings) ? data.oi_rankings : {}

    const defaultOiRank =
      typeof data.default_oi_rank === "string" ? data.default_oi_rank : "500+"

    const updatedAt =
      typeof data.timestamp === "string" ? data.timestamp : null

    const rows: FundingRow[] = exchangeNamesRaw.flatMap((exchangeItem) => {
      if (!isRecord(exchangeItem) || typeof exchangeItem.name !== "string") {
        return []
      }

      const exchangeName = exchangeItem.name.trim().toLowerCase()
      if (!isExchangeKey(exchangeName)) return []

      const meta = EXCHANGE_META[exchangeName]
      const exchangeFundingRaw = fundingRatesRaw[exchangeName]

      if (!isRecord(exchangeFundingRaw)) return []

      return Object.entries(exchangeFundingRaw).flatMap(([symbol, rawFunding]) => {
        const numericFunding = Number(rawFunding)
        if (!Number.isFinite(numericFunding)) return []

        return [
          {
            exchange: exchangeName,
            display: meta.label,
            symbol: String(symbol).trim().toUpperCase(),
            funding: numericFunding / 100,
            oiRank:
              typeof oiRankingsRaw[symbol] === "string" ||
              typeof oiRankingsRaw[symbol] === "number"
                ? String(oiRankingsRaw[symbol])
                : defaultOiRank,
            intervalHours: meta.intervalHours,
            apiFundingMode: meta.apiFundingMode,
          },
        ]
      })
    })

    rows.sort(
      (a, b) =>
        a.symbol.localeCompare(b.symbol) ||
        a.display.localeCompare(b.display)
    )

    return NextResponse.json({
      updatedAt,
      rows,
    })
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unknown funding route error",
      },
      { status: 500 }
    )
  }
}