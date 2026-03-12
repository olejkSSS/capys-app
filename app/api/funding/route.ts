import { NextResponse } from "next/server"

const TARGET_EXCHANGES = [
  "edgex",
  "ethereal",
  "extended",
  "hibachi",
  "hyena",
  "hyperliquid",
  "pacifica",
  "variational",
] as const

const EXCHANGE_LABELS: Record<string, string> = {
  edgex: "EdgeX",
  ethereal: "Ethereal",
  extended: "Extended",
  hibachi: "Hibachi",
  hyena: "Hyena",
  hyperliquid: "Hyperliquid",
  pacifica: "Pacifica",
  variational: "Variational",
}

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

export async function GET() {
  try {
    const res = await fetch("https://api.loris.tools/funding", {
      headers: {
        Accept: "application/json",
      },
      next: { revalidate: 60 },
    })

    if (!res.ok) {
      return NextResponse.json(
        { error: `Loris API error: ${res.status}` },
        { status: 500 }
      )
    }

    const data = await res.json()

    const exchangeNames: LorisExchangeName[] =
      data?.exchanges?.exchange_names ?? []

    const fundingRates: Record<string, Record<string, number>> =
      data?.funding_rates ?? {}

    const oiRankings: Record<string, string> = data?.oi_rankings ?? {}
    const defaultOiRank: string = data?.default_oi_rank ?? "500+"
    const updatedAt: string | null = data?.timestamp ?? null

    const allowedExchangeSet = new Set<string>(TARGET_EXCHANGES)

    const rows: FundingRow[] = exchangeNames
      .filter((exchange) => allowedExchangeSet.has(exchange.name))
      .flatMap((exchange) => {
        const exchangeFunding = fundingRates[exchange.name] ?? {}

        return Object.entries(exchangeFunding).map(([symbol, rawFunding]) => {
          const funding = Number(rawFunding) / 100

          let bias: FundingRow["bias"] = "neutral"
          if (funding > 0) bias = "longs_pay_shorts"
          if (funding < 0) bias = "shorts_pay_longs"

          return {
            exchange: exchange.name,
            display:
              EXCHANGE_LABELS[exchange.name] ?? exchange.display ?? exchange.name,
            symbol,
            funding,
            oiRank: oiRankings[symbol] ?? defaultOiRank,
            bias,
          }
        })
      })

    return NextResponse.json({
      updatedAt,
      exchanges: TARGET_EXCHANGES.map((key) => ({
        key,
        label: EXCHANGE_LABELS[key],
      })),
      rows,
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}