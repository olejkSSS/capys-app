import { NextResponse } from "next/server"
import {
  GENERIC_EXCHANGE_URLS,
  normalizeExchangeKey,
  PERP_CALC_LOGOS,
  PERPS,
  PERPS_CALC,
} from "../../data/perps"
import {
  PERP_VOLUME_SNAPSHOT,
  PERP_VOLUME_SNAPSHOT_DATE,
  type PerpVolumeSnapshot,
} from "../../data/perp-market-snapshot"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const OPEN_INTEREST_URL =
  "https://api.llama.fi/overview/open-interest?excludeTotalDataChart=true&excludeTotalDataChartBreakdown=true"
const PROTOCOLS_URL = "https://api.llama.fi/protocols"
const PUBLIC_PERPS_PAGE_URL = "https://r.jina.ai/http://defillama.com/perps"

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

type LlamaDirectoryProtocol = {
  name?: string
  slug?: string
  url?: string
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
  tradeUrl: string
  capyDetailsUrl: string | null
}

let lastSuccessfulResponse:
  | {
      rows: MarketRow[]
      updatedAt: string
      openInterestTotal: number
      volume24hTotal: number
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

function parseUsdCompact(value: string) {
  const match = value
    .trim()
    .toLowerCase()
    .replace(/,/g, "")
    .match(/^\$?(-?\d+(?:\.\d+)?)\s*([kmbt])?$/)

  if (!match) return null

  const multipliers: Record<string, number> = {
    k: 1_000,
    m: 1_000_000,
    b: 1_000_000_000,
    t: 1_000_000_000_000,
  }
  const amount = Number(match[1])
  const multiplier = match[2] ? multipliers[match[2]] : 1

  return Number.isFinite(amount) ? amount * multiplier : null
}

async function fetchPublicVolumeData() {
  const response = await fetch(PUBLIC_PERPS_PAGE_URL, {
    headers: {
      Accept: "text/plain",
      "User-Agent": "Capys.app market terminal",
    },
    next: { revalidate: 300 },
  })

  if (!response.ok) {
    throw new Error(`DefiLlama public page returned ${response.status}`)
  }

  const page = await response.text()
  const protocols: PerpVolumeSnapshot[] = []

  for (const line of page.split("\n")) {
    if (!line.startsWith("|") || !line.includes("defillama.com/protocol/")) {
      continue
    }

    const link = line.match(
      /\]\([^)]*\)\[([^\]]+)\]\(https?:\/\/defillama\.com\/protocol\/([^?)]+)[^)]*\)/
    )
    if (!link) continue

    const cells = line
      .split("|")
      .slice(1, -1)
      .map((cell) => cell.trim())
    if (cells.length < 6) continue

    protocols.push({
      name: link[1].trim(),
      slug: decodeURIComponent(link[2]).trim(),
      normalizedVolume24h: parseUsdCompact(cells[1]),
      reportedVolume24h: parseUsdCompact(cells[2]),
      volume7d: parseUsdCompact(cells[4]),
      volume30d: parseUsdCompact(cells[5]),
    })
  }

  const totalMatch = page.match(
    /# Perp Volume \(24h\)\s+\$(\d+(?:\.\d+)?[kmbt]?)/i
  )
  const total24h = totalMatch ? parseUsdCompact(`$${totalMatch[1]}`) : null

  if (protocols.length < 5 || total24h === null) {
    throw new Error("DefiLlama public volume table could not be parsed")
  }

  return {
    protocols,
    total24h,
    mode: "live" as const,
    updatedAt: new Date().toISOString(),
  }
}

async function fetchProtocolDirectory() {
  try {
    const response = await fetch(PROTOCOLS_URL, {
      headers: {
        Accept: "application/json",
        "User-Agent": "Capys.app market terminal",
      },
      next: { revalidate: 86_400 },
    })

    if (!response.ok) return new Map<string, string>()

    const protocols = (await response.json()) as LlamaDirectoryProtocol[]
    const directory = new Map<string, string>()

    for (const protocol of protocols) {
      const url = protocol.url?.trim()
      if (!url) continue

      if (protocol.slug) directory.set(marketKey(protocol.slug), url)
      if (protocol.name) directory.set(marketKey(protocol.name), url)
    }

    return directory
  } catch {
    return new Map<string, string>()
  }
}

function getKnownTradeUrl(slug: string, name: string) {
  const candidates = [
    normalizeExchangeKey(slug),
    normalizeExchangeKey(name),
    marketKey(slug),
    marketKey(name),
  ]

  for (const key of candidates) {
    const url = GENERIC_EXCHANGE_URLS[key]
    if (url) return url
  }

  return null
}

function getTradeUrl(
  slug: string,
  name: string,
  capyRef: string | undefined,
  directory: Map<string, string>
) {
  return (
    capyRef ??
    getKnownTradeUrl(slug, name) ??
    directory.get(marketKey(slug)) ??
    directory.get(marketKey(name)) ??
    `https://defillama.com/protocol/${slug}?tvl=false&events=false&perpVolume=true`
  )
}

async function getVolumeData() {
  const apiKey = process.env.DEFILLAMA_API_KEY?.trim()

  if (!apiKey) {
    try {
      return await fetchPublicVolumeData()
    } catch {
      return {
        protocols: PERP_VOLUME_SNAPSHOT,
        total24h: PERP_VOLUME_SNAPSHOT.reduce(
          (sum, protocol) =>
            sum +
            (protocol.normalizedVolume24h ??
              protocol.reportedVolume24h ??
              0),
          0
        ),
        mode: "snapshot" as const,
        updatedAt: PERP_VOLUME_SNAPSHOT_DATE,
      }
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
    total24h:
      finiteOrNull(data.total24h) ??
      protocols.reduce(
        (sum, protocol) =>
          sum +
          (protocol.normalizedVolume24h ?? protocol.reportedVolume24h ?? 0),
        0
      ),
    mode: "live" as const,
    updatedAt: new Date().toISOString(),
  }
}

function buildRows(
  openInterestProtocols: LlamaProtocol[],
  volumeProtocols: PerpVolumeSnapshot[],
  protocolDirectory: Map<string, string>
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
    const calcLogo =
      PERP_CALC_LOGOS[marketKey(slug) as keyof typeof PERPS_CALC] ??
      PERP_CALC_LOGOS[marketKey(name) as keyof typeof PERPS_CALC]

    rowByKey.set(marketKey(slug), {
      name,
      slug,
      logo: capy?.logo ?? calcLogo ?? protocol.logo ?? null,
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
      tradeUrl: getTradeUrl(slug, name, capy?.ref, protocolDirectory),
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
    const calcLogo =
      PERP_CALC_LOGOS[key as keyof typeof PERPS_CALC] ??
      PERP_CALC_LOGOS[marketKey(volume.name) as keyof typeof PERPS_CALC]

    rowByKey.set(key, {
      name: volume.name,
      slug: volume.slug,
      logo: capy?.logo ?? calcLogo ?? null,
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
      tradeUrl: getTradeUrl(volume.slug, volume.name, capy?.ref, protocolDirectory),
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
    const protocolDirectory = await fetchProtocolDirectory()
    const rows = buildRows(
      openInterest.protocols ?? [],
      volume.protocols,
      protocolDirectory
    )
    const payload = {
      rows,
      updatedAt: new Date().toISOString(),
      openInterestTotal:
        finiteOrNull(openInterest.total24h) ??
        rows.reduce((sum, row) => sum + (row.openInterest ?? 0), 0),
      volume24hTotal: volume.total24h,
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

    const rows = buildRows([], PERP_VOLUME_SNAPSHOT, new Map())
    return NextResponse.json(
      {
        rows,
        updatedAt: PERP_VOLUME_SNAPSHOT_DATE,
        openInterestTotal: rows.reduce(
          (sum, row) => sum + (row.openInterest ?? 0),
          0
        ),
        volume24hTotal: PERP_VOLUME_SNAPSHOT.reduce(
          (sum, protocol) =>
            sum +
            (protocol.normalizedVolume24h ??
              protocol.reportedVolume24h ??
              0),
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
