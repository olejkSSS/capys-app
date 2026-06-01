export const SITE_URL = "https://capys.app"

export const PERPS = [
  {
    slug: "variational",
    tier: "S+",
    name: "Variational",
    ref: "https://omni.variational.io/?ref=OMNICAPY",
    refCode: "OMNICAPY",
    logo: "/variational.png",
    boost: "+15% points boost",
    farm: "Holding positions + volume on mid-OI tokens",
    seoKeywords: [
      "variational point calculator",
      "variational referral code",
      "variational points boost",
      "variational airdrop calculator",
      "variational omni ref code",
    ],
  },
  {
    slug: "risex",
    tier: "S+",
    name: "RiseX",
    ref: "https://t.me/olejk_2k",
    refCode: "Contact",
    logo: "/risex.svg",
    boost: "Private invite codes via Telegram",
    farm: "Private access + early perp farming",
    seoKeywords: [
      "risex invite code",
      "risex referral code",
      "risex perp invite",
      "risex point calculator",
      "rise trade invite code",
    ],
  },
  {
    slug: "extended",
    tier: "S",
    name: "Extended",
    ref: "https://app.extended.exchange/join/CAPY",
    refCode: "CAPY",
    logo: "/extended.png",
    boost: "-10% fees + 5% points boost + 30% refback",
    farm: "Volume + holding positions",
    seoKeywords: [
      "extended exchange referral code",
      "extended points calculator",
      "extended airdrop calculator",
      "extended exchange fee discount",
    ],
  },
  {
    slug: "hibachi",
    tier: "S",
    name: "Hibachi",
    ref: "http://hibachi.xyz/r/capy",
    refCode: "capy",
    logo: "/hibachi.png",
    boost: "-15% fees + 15% points boost",
    farm: "Volume + holding positions",
    seoKeywords: [
      "hibachi referral code",
      "hibachi maximum referral",
      "hibachi fee discount",
      "hibachi points boost",
      "hibachi airdrop calculator",
    ],
  },
  {
    slug: "ethereal",
    tier: "A",
    name: "Ethereal",
    ref: "https://app.ethereal.trade/?ref=UM68P2M9JZ6D",
    refCode: "UM68P2M9JZ6D",
    logo: "/ethereal.png",
    boost: "+15% points boost",
    farm: "Boost farming + low OI tokens",
    seoKeywords: [
      "ethereal trade referral code",
      "ethereal points boost",
      "ethereal airdrop calculator",
      "ethereal trade ref",
    ],
  },
  {
    slug: "hyena",
    tier: "A",
    name: "Hyena",
    ref: "https://app.hyena.trade/ref/CAPY",
    refCode: "CAPY",
    logo: "/hyena.png",
    boost: "+10% points boost",
    farm: "Activity + steady volume",
    seoKeywords: [
      "hyena referral code",
      "hyena points boost",
      "hyena airdrop calculator",
      "hyena trade ref",
    ],
  },
  {
    slug: "pacifica",
    tier: "S",
    name: "Pacifica",
    ref: "https://app.pacifica.fi/?referral=Capy",
    refCode: "Capy",
    logo: "/pacifica.png",
    boost: "+15% points boost",
    farm: "High volume + active trading",
    seoKeywords: [
      "pacifica referral code",
      "pacifica points boost",
      "pacifica airdrop calculator",
      "pacifica fi referral",
    ],
  },
  {
    slug: "edgex",
    tier: "A",
    name: "EdgeX",
    ref: "https://pro.edgex.exchange/referral/OLEJK",
    refCode: "OLEJK",
    logo: "/edgex.png",
    boost: "-10% fees + 10% points boost + VIP1",
    farm: "High volume + hold positions",
    seoKeywords: [
      "edgex referral code",
      "edgex fee discount",
      "edgex points boost",
      "edgex airdrop calculator",
    ],
  },
  {
    slug: "dreamcash",
    tier: "A",
    name: "Dreamcash",
    ref: "https://dreamcash.xyz/share?code=CAPYCR",
    refCode: "CAPYCR",
    logo: "/dreamcash.png",
    boost: "boost from 10K to 1M points",
    farm: "Low OI tokens + active trading",
    seoKeywords: [
      "dreamcash referral code",
      "dreamcash points boost",
      "dreamcash airdrop calculator",
    ],
  },
] as const

export const TEMPLATES = [
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

export const PERPS_CALC = {
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
  risex: {
    name: "RiseX",
    fdv: 0.3,
    totalPoints: 10000000,
    airdrop: 15,
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

export type FundingExchangeMeta = {
  key: string
  label: string
  intervalHours: 1 | 8
  tradeUrl: string
  hasPersonalRef: boolean
}

export const PERSONAL_FUNDING_EXCHANGES: Record<string, FundingExchangeMeta> = {
  edgex: {
    key: "edgex",
    label: "EdgeX",
    intervalHours: 8,
    tradeUrl: "https://pro.edgex.exchange/referral/OLEJK",
    hasPersonalRef: true,
  },
  ethereal: {
    key: "ethereal",
    label: "Ethereal",
    intervalHours: 8,
    tradeUrl: "https://app.ethereal.trade/?ref=UM68P2M9JZ6D",
    hasPersonalRef: true,
  },
  extended: {
    key: "extended",
    label: "Extended",
    intervalHours: 1,
    tradeUrl: "https://app.extended.exchange/join/CAPY",
    hasPersonalRef: true,
  },
  hibachi: {
    key: "hibachi",
    label: "Hibachi",
    intervalHours: 8,
    tradeUrl: "http://hibachi.xyz/r/capy",
    hasPersonalRef: true,
  },
  hyena: {
    key: "hyena",
    label: "Hyena",
    intervalHours: 8,
    tradeUrl: "https://app.hyena.trade/ref/CAPY",
    hasPersonalRef: true,
  },
  pacifica: {
    key: "pacifica",
    label: "Pacifica",
    intervalHours: 8,
    tradeUrl: "https://app.pacifica.fi/?referral=Capy",
    hasPersonalRef: true,
  },
  risex: {
    key: "risex",
    label: "RiseX",
    intervalHours: 8,
    tradeUrl: "https://t.me/olejk_2k",
    hasPersonalRef: true,
  },
  variational: {
    key: "variational",
    label: "Variational",
    intervalHours: 8,
    tradeUrl: "https://omni.variational.io/?ref=OMNICAPY",
    hasPersonalRef: true,
  },
}

export const GENERIC_EXCHANGE_URLS: Record<string, string> = {
  aster: "https://www.asterdex.com/",
  binance: "https://www.binance.com/en/futures",
  bingx: "https://bingx.com/en/futures/",
  bitget: "https://www.bitget.com/futures/",
  bitmex: "https://www.bitmex.com/",
  bitunix: "https://www.bitunix.com/",
  bluefin: "https://trade.bluefin.io/",
  bybit: "https://www.bybit.com/trade/usdt/",
  coinex: "https://www.coinex.com/futures",
  crypto_com: "https://crypto.com/exchange",
  cryptocom: "https://crypto.com/exchange",
  deribit: "https://www.deribit.com/",
  drift: "https://app.drift.trade/",
  dydx: "https://dydx.trade/",
  gate: "https://www.gate.com/futures",
  gateio: "https://www.gate.com/futures",
  htx: "https://www.htx.com/futures/",
  hyperliquid: "https://app.hyperliquid.xyz/",
  kucoin: "https://www.kucoin.com/futures",
  lighter: "https://app.lighter.xyz/",
  mexc: "https://www.mexc.com/futures",
  okx: "https://www.okx.com/trade-swap",
  paradex: "https://app.paradex.trade/",
  phemex: "https://phemex.com/futures",
  vest: "https://app.vest.exchange/",
  woo: "https://pro.woox.io/futures",
  woofi: "https://fi.woo.org/",
  woofi_pro: "https://pro.woo.org/",
  woofipro: "https://pro.woo.org/",
}

export const ONE_HOUR_FUNDING_EXCHANGES = new Set([
  "extended",
  "hyperliquid",
  "lighter",
  "vest",
])

export const PREFERRED_FUNDING_ORDER = [
  "edgex",
  "ethereal",
  "extended",
  "hibachi",
  "hyena",
  "pacifica",
  "risex",
  "variational",
  "hyperliquid",
  "lighter",
  "vest",
  "bluefin",
  "paradex",
  "drift",
  "aster",
  "woofi_pro",
  "binance",
  "bybit",
  "okx",
  "bitget",
  "kucoin",
  "gate",
  "mexc",
  "phemex",
  "bingx",
  "crypto_com",
  "htx",
]

export const DEFAULT_FUNDING_EXCHANGES = Object.values(PERSONAL_FUNDING_EXCHANGES)

export function normalizeExchangeKey(key: string) {
  return key.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "")
}

export function prettifyExchangeLabel(key: string) {
  return key
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .replace(/\b01\b/g, "01")
    .replace("Okx", "OKX")
    .replace("Htx", "HTX")
    .replace("Mexc", "MEXC")
    .replace("Bybit", "Bybit")
    .replace("Woofi", "WOOFi")
    .replace("Woofipro", "WOOFi Pro")
    .replace("Cryptocom", "Crypto.com")
    .replace("Gateio", "Gate.io")
    .replace("Qfex", "QFEX")
    .replace("Grvt", "GRVT")
}

export function getFundingExchangeMeta(
  key: string,
  display?: string
): FundingExchangeMeta {
  const normalizedKey = normalizeExchangeKey(key)
  const personal = PERSONAL_FUNDING_EXCHANGES[normalizedKey]

  if (personal) return personal

  return {
    key: normalizedKey,
    label: prettifyExchangeLabel(display || normalizedKey),
    intervalHours: ONE_HOUR_FUNDING_EXCHANGES.has(normalizedKey) ? 1 : 8,
    tradeUrl:
      GENERIC_EXCHANGE_URLS[normalizedKey] ??
      `https://www.google.com/search?q=${encodeURIComponent(
        `${display || normalizedKey} perpetual exchange`
      )}`,
    hasPersonalRef: false,
  }
}

export const SEO_PROTOCOL_KEYWORDS = Array.from(
  new Set(
    PERPS.flatMap((perp) => [
      ...perp.seoKeywords,
      `${perp.name} referral`,
      `${perp.name} ref code`,
      `${perp.name} best referral`,
      `${perp.name} max referral bonus`,
      `${perp.name} point calculator`,
      `${perp.name} points calculator`,
      `${perp.name} airdrop estimate`,
    ])
  )
)
