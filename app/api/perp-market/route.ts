import { NextResponse } from "next/server"
import { PERPS } from "../../data/perps"
import {
  PERP_VOLUME_SNAPSHOT,
  PERP_VOLUME_SNAPSHOT_DATE,
  type PerpVolumeSnapshot,
} from "../../data/perp-market-snapshot"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const OPEN_INTEREST_URL =
  "https://api.llama.fi/overview/open-interest?excludeTotalDataChart=true&excludeTotalDataChartBreakdown=true"

type LlamaProtocol = {
  name?: string
  displayName?: string
  slug?: string
  logo?: string
  chains?: string[]
  total24h?: number | null
  change_1d?: number | null
  change_7d?: number | null
  methodologyURL?: string
}

type LlamaResponse = {
  protocols?: LlamaProtocol[]
  total24h?: number | null
}

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

let lastSuccessfulResponse:
  | {
      rows: MarketRow[]
      updatedAt: string
      openInterestTotal: number
      volumeMode: "live" | "snapshot"
      volumeUpdatedAt: string
    }
  | undefined

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "")
}

function marketKey(value: string) {
  return normalize(value)
    .replace(/perpetuals$/, "")
    .replace(/perps$/, "")
    .replace(/protocol$/, "")
}

function finiteOrNull(value: unknown) {
  const numeric = Number(value)
  return Number.isFinite(numeric) ? numeric : null
}

async function fetchJson(url: string) {
  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent": "Capys.app market terminal",
    },
    next: { revalidate: 300 },
  })

  if (!response.ok) {
    throw new Error(`DefiLlama API returned ${response.status}`)
  }

  return (await response.json()) as LlamaResponse
}

async function getVolumeData() {
  const apiKey = process.env.DEFILLAMA_API_KEY?.trim()

  if (!apiKey) {
    return {
      protocols: PERP_VOLUME_SNAPSHOT,
      mode: "snapshot" as const,
      updatedAt: PERP_VOLUME_SNAPSHOT_DATE,
    }
  }

  const url = `https://pro-api.llama.fi/${encodeURIComponent(
    apiKey
  )}/api/overview/derivatives?excludeTotalDataChart=true&excludeTotalDataChartBreakdown=true`
  const data = await fetchJson(url)
  const protocols: PerpVolumeSnapshot[] = (data.protocols ?? []).map(
    (protocol) => ({
      name: protocol.displayName || protocol.name || protocol.slug || "Unknown",
      slug: protocol.slug || normalize(protocol.name || "unknown"),
      normalizedVolume24h: finiteOrNull(
        (protocol as LlamaProtocol & { total24hNormalized?: number | null })
          .total24hNormalized
      ),
      reportedVolume24h: finiteOrNull(protocol.total24h),
      volume7d: finiteOrNull(
        (protocol as LlamaProtocol & { total7d?: number | null }).total7d
      ),
      volume30d: finiteOrNull(
        (protocol as LlamaProtocol & { total30d?: number | null }).total30d
      ),
    })
  )

  return {
    protocols,
    mode: "live" as const,
    updatedAt: new Date().toISOString(),
  }
}

function buildRows(
  openInterestProtocols: LlamaProtocol[],
  volumeProtocols: PerpVolumeSnapshot[]
) {
  const volumeByKey = new Map<string, PerpVolumeSnapshot>()
  const rowByKey = new Map<string, MarketRow>()

  for (const protocol of volumeProtocols) {
    volumeByKey.set(marketKey(protocol.slug), protocol)
    volumeByKey.set(marketKey(protocol.name), protocol)
  }

  for (const protocol of openInterestProtocols) {
    const name =
      protocol.displayName || protocol.name || protocol.slug || "Unknown perp"
    const slug = protocol.slug || normalize(name)
    const volume =
      volumeByKey.get(marketKey(slug)) ?? volumeByKey.get(marketKey(name))
    const capy = PERPS.find(
      (perp) =>
        marketKey(perp.slug) === marketKey(slug) ||
        marketKey(perp.name) === marketKey(name)
    )

    rowByKey.set(marketKey(slug), {
      name,
      slug,
      logo: protocol.logo || null,
      chains: Array.isArray(protocol.chains) ? protocol.chains : [],
      openInterest: finiteOrNull(protocol.total24h),
      oiChange1d: finiteOrNull(protocol.change_1d),
      oiChange7d: finiteOrNull(protocol.change_7d),
      normalizedVolume24h: volume?.normalizedVolume24h ?? null,
      reportedVolume24h: volume?.reportedVolume24h ?? null,
      volume7d: volume?.volume7d ?? null,
      volume30d: volume?.volume30d ?? null,
      methodologyUrl: protocol.methodologyURL || null,
      capyRoute: capy?.ref ?? null,
      capyDetailsUrl: capy ? `/perps/${capy.slug}` : null,
    })
  }

  for (const volume of volumeProtocols) {
    const key = marketKey(volume.slug)
    if (rowByKey.has(key)) continue

    const capy = PERPS.find(
      (perp) =>
        marketKey(perp.slug) === key ||
        marketKey(perp.name) === marketKey(volume.name)
    )

    rowByKey.set(key, {
      name: volume.name,
      slug: volume.slug,
      logo: null,
      chains: [],
      openInterest: null,
      oiChange1d: null,
      oiChange7d: null,
      normalizedVolume24h: volume.normalizedVolume24h,
      reportedVolume24h: volume.reportedVolume24h,
      volume7d: volume.volume7d,
      volume30d: volume.volume30d,
      methodologyUrl: null,
      capyRoute: capy?.ref ?? null,
      capyDetailsUrl: capy ? `/perps/${capy.slug}` : null,
    })
  }

  return Array.from(rowByKey.values()).sort(
    (a, b) =>
      (b.openInterest ?? b.normalizedVolume24h ?? b.reportedVolume24h ?? 0) -
      (a.openInterest ?? a.normalizedVolume24h ?? a.reportedVolume24h ?? 0)
  )
}

export async function GET() {
  try {
    const [openInterest, volume] = await Promise.all([
      fetchJson(OPEN_INTEREST_URL),
      getVolumeData(),
    ])
    const rows = buildRows(openInterest.protocols ?? [], volume.protocols)
    const payload = {
      rows,
      updatedAt: new Date().toISOString(),
      openInterestTotal:
        finiteOrNull(openInterest.total24h) ??
        rows.reduce((sum, row) => sum + (row.openInterest ?? 0), 0),
      volumeMode: volume.mode,
      volumeUpdatedAt: volume.updatedAt,
    }

    lastSuccessfulResponse = payload

    return NextResponse.json(payload, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600",
      },
    })
  } catch (error) {
    if (lastSuccessfulResponse) {
      return NextResponse.json(
        {
          ...lastSuccessfulResponse,
          stale: true,
          error: error instanceof Error ? error.message : "Market API error",
        },
        {
          headers: {
            "Cache-Control": "public, s-maxage=60, stale-while-revalidate=3600",
          },
        }
      )
    }

    const rows = buildRows([], PERP_VOLUME_SNAPSHOT)
    return NextResponse.json(
      {
        rows,
        updatedAt: PERP_VOLUME_SNAPSHOT_DATE,
        openInterestTotal: rows.reduce(
          (sum, row) => sum + (row.openInterest ?? 0),
          0
        ),
        volumeMode: "snapshot",
        volumeUpdatedAt: PERP_VOLUME_SNAPSHOT_DATE,
        stale: true,
        error: error instanceof Error ? error.message : "Market API error",
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=3600",
        },
      }
    )
  }
}
