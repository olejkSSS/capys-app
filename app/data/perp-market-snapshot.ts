export type PerpVolumeSnapshot = {
  name: string
  slug: string
  normalizedVolume24h: number | null
  reportedVolume24h: number | null
  volume7d: number | null
  volume30d: number | null
}

export const PERP_VOLUME_SNAPSHOT_DATE = "2026-07-04T00:00:00.000Z"

// Public DefiLlama perps table snapshot. Live volume requires their Pro API.
export const PERP_VOLUME_SNAPSHOT: PerpVolumeSnapshot[] = [
  {
    name: "Hyperliquid",
    slug: "hyperliquid",
    normalizedVolume24h: 3_083_000_000,
    reportedVolume24h: 2_919_000_000,
    volume7d: 43_351_000_000,
    volume30d: 225_559_000_000,
  },
  {
    name: "Aster",
    slug: "aster",
    normalizedVolume24h: 1_139_000_000,
    reportedVolume24h: 1_045_000_000,
    volume7d: 10_324_000_000,
    volume30d: 55_124_000_000,
  },
  {
    name: "ApeX Protocol",
    slug: "apex-protocol",
    normalizedVolume24h: 1_062_000_000,
    reportedVolume24h: 1_082_000_000,
    volume7d: 7_436_000_000,
    volume30d: 46_221_000_000,
  },
  {
    name: "Lighter",
    slug: "lighter",
    normalizedVolume24h: 813_650_000,
    reportedVolume24h: 813_650_000,
    volume7d: 9_036_000_000,
    volume30d: 42_991_000_000,
  },
  {
    name: "Grvt",
    slug: "grvt",
    normalizedVolume24h: 794_660_000,
    reportedVolume24h: 797_840_000,
    volume7d: 8_622_000_000,
    volume30d: 39_024_000_000,
  },
  {
    name: "Variational",
    slug: "variational",
    normalizedVolume24h: null,
    reportedVolume24h: 636_900_000,
    volume7d: 6_147_000_000,
    volume30d: 25_049_000_000,
  },
  {
    name: "Evedex",
    slug: "evedex",
    normalizedVolume24h: 545_090_000,
    reportedVolume24h: 545_090_000,
    volume7d: 3_675_000_000,
    volume30d: 15_532_000_000,
  },
  {
    name: "StandX",
    slug: "standx",
    normalizedVolume24h: 458_200_000,
    reportedVolume24h: 458_200_000,
    volume7d: 4_884_000_000,
    volume30d: 23_847_000_000,
  },
  {
    name: "GMX",
    slug: "gmx",
    normalizedVolume24h: 428_970_000,
    reportedVolume24h: null,
    volume7d: 873_420_000,
    volume30d: 3_027_000_000,
  },
  {
    name: "edgeX",
    slug: "edgex",
    normalizedVolume24h: 298_410_000,
    reportedVolume24h: 302_270_000,
    volume7d: 4_611_000_000,
    volume30d: 27_884_000_000,
  },
  {
    name: "Pacifica",
    slug: "pacifica",
    normalizedVolume24h: 258_210_000,
    reportedVolume24h: 257_940_000,
    volume7d: 2_895_000_000,
    volume30d: 12_606_000_000,
  },
  {
    name: "Extended",
    slug: "extended",
    normalizedVolume24h: 363_820_000,
    reportedVolume24h: 190_280_000,
    volume7d: 1_692_000_000,
    volume30d: 7_846_000_000,
  },
  {
    name: "Avantis",
    slug: "avantis",
    normalizedVolume24h: 184_620_000,
    reportedVolume24h: null,
    volume7d: 689_560_000,
    volume30d: 2_978_000_000,
  },
  {
    name: "GMTrade",
    slug: "gmtrade",
    normalizedVolume24h: 131_880_000,
    reportedVolume24h: null,
    volume7d: 4_324_000_000,
    volume30d: 24_319_000_000,
  },
  {
    name: "Jupiter",
    slug: "jupiter",
    normalizedVolume24h: 130_000_000,
    reportedVolume24h: null,
    volume7d: 1_424_000_000,
    volume30d: 7_274_000_000,
  },
  {
    name: "Antarctic",
    slug: "antarctic",
    normalizedVolume24h: 99_240_000,
    reportedVolume24h: 99_240_000,
    volume7d: 1_192_000_000,
    volume30d: 5_380_000_000,
  },
  {
    name: "Satori Finance",
    slug: "satori-finance",
    normalizedVolume24h: 92_560_000,
    reportedVolume24h: 544_282,
    volume7d: null,
    volume30d: 2_743_000_000,
  },
  {
    name: "Reya",
    slug: "reya",
    normalizedVolume24h: 86_460_000,
    reportedVolume24h: 13_090_000,
    volume7d: null,
    volume30d: 1_246_000_000,
  },
  {
    name: "dYdX",
    slug: "dydx",
    normalizedVolume24h: 71_930_000,
    reportedVolume24h: null,
    volume7d: 642_950_000,
    volume30d: 2_958_000_000,
  },
  {
    name: "Nado",
    slug: "nado",
    normalizedVolume24h: 61_070_000,
    reportedVolume24h: 61_060_000,
    volume7d: 865_170_000,
    volume30d: 5_270_000_000,
  },
]
