"use client"

import Image from "next/image"
import Link from "next/link"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { toPng } from "html-to-image"
import { motion } from "motion/react"
import {
  DEFAULT_FUNDING_EXCHANGES,
  FARMING_ROUTES,
  type FundingExchangeMeta,
  PERP_CALC_LOGOS,
  PERPS,
  PERPS_CALC,
  SITE_URL,
  TEMPLATES,
} from "./data/perps"

type Tab = "list" | "calculator" | "funding"
type CalcPerpKey = keyof typeof PERPS_CALC
type FundingMetricMode = "interval" | "annualized"
type FundingBias = "longs_pay_shorts" | "shorts_pay_longs" | "neutral"
type FundingExchangeKey = string
type FundingRowLimit = 100 | 250 | 500 | "all"
type FundingSortKey = "maxArb" | "oiRank" | "symbol"
type FundingSortDirection = "desc" | "asc"

type FundingApiRow = {
  exchange: string
  display: string
  symbol: string
  funding: number
  oiRank: string
  bias: FundingBias
}

type FundingApiExchange = FundingExchangeMeta

type RawFundingApiRow = Partial<FundingApiRow> & {
  [key: string]: unknown
}

type FundingMatrixRow = {
  symbol: string
  oiRank: string
  maxArb: number
  estimatedNetUsd: number | null
  netReturnPct: number | null
  activeCount: number
  buyExchange: { key: FundingExchangeKey; label: string } | null
  sellExchange: { key: FundingExchangeKey; label: string } | null
  byExchange: Record<string, number | null>
}

const INITIAL_FUNDING_KEYS = DEFAULT_FUNDING_EXCHANGES.map(
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

function toDisplayedFundingValue(
  rawFunding: number,
  exchange: FundingExchangeMeta | undefined,
  metricMode: FundingMetricMode
) {
  const meta = exchange ?? DEFAULT_FUNDING_EXCHANGES[0]

  const actualIntervalFunding =
    meta.intervalHours === 1 ? rawFunding / 8 : rawFunding

  if (metricMode === "annualized") {
    return actualIntervalFunding * (24 / meta.intervalHours) * 365
  }

  return actualIntervalFunding
}

const TABS = [
  { id: "list", label: "Perp List" },
  { id: "calculator", label: "Airdrop Calculator" },
  { id: "funding", label: "Funding Screener" },
] as const

const CALC_KEYS = Object.keys(PERPS_CALC) as CalcPerpKey[]
const CALCULATOR_DIRECTORY = CALC_KEYS.map((key) => {
  const listedPerp = PERPS.find((perp) => perp.slug === key)

  return {
    slug: key,
    name: PERPS_CALC[key].name,
    logo: listedPerp?.logo ?? PERP_CALC_LOGOS[key] ?? "/icon.png",
  }
})

const TAB_HASH: Record<Tab, string> = {
  list: "perps",
  calculator: "calculator",
  funding: "funding",
}

const HASH_TAB: Record<string, Tab> = {
  list: "list",
  perps: "list",
  calculator: "calculator",
  funding: "funding",
}

const LANGUAGES = [
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "zh", label: "中文", flag: "🇨🇳" },
  { code: "ko", label: "한국어", flag: "🇰🇷" },
  { code: "ja", label: "日本語", flag: "🇯🇵" },
  { code: "uk", label: "Українська", flag: "🇺🇦" },
  { code: "ru", label: "Русский", flag: "🇷🇺" },
  { code: "ar", label: "العربية", flag: "🇦🇪" },
  { code: "pt", label: "Português", flag: "🇵🇹" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "tr", label: "Türkçe", flag: "🇹🇷" },
  { code: "vi", label: "Tiếng Việt", flag: "🇻🇳" },
  { code: "id", label: "Bahasa Indonesia", flag: "🇮🇩" },
  { code: "hi", label: "हिन्दी", flag: "🇮🇳" },
  { code: "th", label: "ไทย", flag: "🇹🇭" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
  { code: "pl", label: "Polski", flag: "🇵🇱" },
  { code: "it", label: "Italiano", flag: "🇮🇹" },
  { code: "cs", label: "Čeština", flag: "🇨🇿" },
  { code: "bn", label: "বাংলা", flag: "🇧🇩" },
] as const

type LanguageCode = (typeof LANGUAGES)[number]["code"]
type HeroText = Record<
  Tab,
  {
    badge: string
    title: string
    body: string
    primary: string
    secondary: string
  }
>

const COPY = {
  en: {
    tabs: ["Perp List", "Airdrop Calculator", "Funding Screener"],
    contact: "Contact",
    console: "Perp farming console",
    language: "Language",
    hero: {
      list: {
        badge: "Referral boost board",
        title: "Compare perp DEX boosts, points and farming routes.",
        body: "Find a route that fits how you farm, compare referral terms, estimate airdrop scenarios, and scan live funding without digging through 20 docs and Discords.",
        primary: "Explore perps",
        secondary: "Estimate airdrop",
      },
      calculator: {
        badge: "Points to dollars",
        title: "Estimate your airdrop upside.",
        body: "Model FDV, token allocation, point supply, and your own point balance before deciding where the next trading cycle goes.",
        primary: "Open calculator",
        secondary: "Scan funding",
      },
      funding: {
        badge: "Live market scanner",
        title: "Scan funding spreads faster.",
        body: "Track Loris funding data across perp venues, sort by max arb, OI rank, or symbol, and open the best available route in one click.",
        primary: "Scan funding",
        secondary: "Reset filters",
      },
    },
    stats: ["funding venues", "calc presets", "safe refresh", "ref links kept"],
    commandEyebrow: "Opportunity snapshot",
    commandTitle: "Perp command center",
    online: "Online",
    nextAction: "Best next action",
    nextActionText:
      "Click any perp above to open it with the best available terms.",
    listEyebrow: "Referral boost board",
    listTitle: "Perp DEX tier list",
    listBody:
      "Ranked by practical farming value: points boosts, fee discounts, refback, and the kind of activity each venue rewards.",
    copyHint: "Click a boost pill to copy the referral code.",
    tier: "Tier",
    protocol: "Protocol",
    boost: "Boost",
    farmTip: "Farm tip:",
    trade: "TRADE",
    copiedCode: "Copied code",
    code: "Code",
    clickToCopy: "click to copy",
    calcEyebrow: "Points to dollars",
    calcTitle: "Airdrop value calculator",
    calcBody:
      "Stress-test FDV, supply allocation, and your points balance before you decide where the next trading cycle goes.",
    currentEstimate: "Current estimate",
    perPoint: "per point at",
    myPoints: "My points",
    fdv: "FDV (billions $)",
    totalPoints: "Total points",
    airdropSupply: "Airdrop % supply",
    pointBalance: "Point balance",
    estValue: "Est. value",
    potentialValue: "Potential Airdrop Value",
    estimateOnly: "estimate only",
    totalSupply: "Total Supply",
    estFdv: "Est. FDV",
    pickTemplate: "Pick a Template",
    downloadCard: "Download Card",
    downloading: "Downloading...",
    preparing: "Preparing...",
    shareX: "Share on X",
    chooseBackground: "Choose Card Background",
    uploadTemplate: "Upload your own meme or screenshot",
    uploadNote: "PNG, JPG, GIF or WebP. It stays local in your browser.",
    fundingEyebrow: "Live market scanner",
    fundingTitle: "Funding rate screener",
    fundingBody:
      "Compare interval-normalized funding across every exchange returned by Loris Tools, with Capy referral routes applied where available.",
    refreshNow: "Refresh now",
    resetFilters: "Reset filters",
    mostPositive: "Most Positive Funding",
    mostNegative: "Most Negative Funding",
    highestSpread: "Highest Spread",
    searchTicker: "Search by ticker",
    fundingView: "Funding view",
    perInterval: "Per interval",
    annualized: "Annualized",
    sort: "Sort",
    maxArb: "Max Arb",
    oiRank: "OI Rank",
    symbol: "Symbol",
    action: "Action",
    onlyOpps: "Only opportunities",
    showAllSymbols: "Show all symbols",
    exchanges: "Exchanges",
    selectAll: "Select all",
    capyRefsOnly: "Capy refs only",
    clearAll: "Clear all",
    renderRows: "Render rows",
    allRows: "All rows",
    defaultRows:
      "Default view renders only the strongest rows so the table stays smooth. Search still scans the full Loris dataset.",
    loadingFunding: "Loading funding data...",
    noTradeRoute: "No trade route",
    noRows: "No rows match your current filters.",
    showMore: "Show more rows",
    hidden: "hidden",
    showing: "Showing",
    activeExchanges: "Active exchanges",
    dataBy: "Funding rate data provided by",
    updated: "Updated",
    cached: "Showing cached Loris data",
    view: "View",
  },
} as const

type LanguageOverride = Partial<
  Record<string, string | readonly string[] | Partial<HeroText>>
>

const LANGUAGE_OVERRIDES: Partial<Record<LanguageCode, LanguageOverride>> = {
  zh: {
    tabs: ["Perp 列表", "空投计算器", "Funding 筛选器"],
    contact: "联系",
    language: "语言",
    hero: {
      list: {
        badge: "返佣与加成看板",
        title: "找到更好的 perp farming 条件。",
        body: "对比手续费折扣、积分加成和返佣路线。协议名称保持原样，重点是更快做决策。",
        primary: "查看 perps",
        secondary: "估算空投",
      },
      calculator: {
        badge: "积分换美元",
        title: "估算你的空投上行空间。",
        body: "用 FDV、分配比例、总积分和完整积分组合来估算潜在价值。",
        primary: "打开计算器",
        secondary: "扫描 funding",
      },
      funding: {
        badge: "实时市场扫描",
        title: "更快扫描 funding spread。",
        body: "查看 Loris funding 数据，按 Max Arb、OI Rank 或 Symbol 排序，并一键打开可用路线。",
        primary: "扫描 funding",
        secondary: "重置筛选",
      },
    },
    portfolioTitle: "积分组合估算器",
    pointBalance: "积分余额",
    estimatedTotal: "估算总额",
  },
  ko: {
    tabs: ["Perp 목록", "에어드롭 계산기", "Funding 스크리너"],
    contact: "연락",
    language: "언어",
    hero: {
      list: { badge: "추천 혜택 보드", title: "더 좋은 perp farming 조건을 찾으세요.", body: "수수료 할인, 포인트 부스트, refback 루트를 빠르게 비교하세요.", primary: "Perps 보기", secondary: "에어드롭 계산" },
      calculator: { badge: "포인트를 달러로", title: "에어드롭 업사이드를 추정하세요.", body: "FDV, 배분, 포인트 공급량과 포트폴리오를 함께 모델링합니다.", primary: "계산기 열기", secondary: "Funding 스캔" },
      funding: { badge: "실시간 시장 스캐너", title: "Funding spread를 더 빠르게 스캔하세요.", body: "Loris 데이터를 정렬하고 가장 좋은 사용 가능한 경로를 바로 여세요.", primary: "Funding 스캔", secondary: "필터 초기화" },
    },
    portfolioTitle: "포인트 포트폴리오 추정기",
    pointBalance: "포인트 잔액",
    estimatedTotal: "예상 합계",
  },
  ja: {
    tabs: ["Perp リスト", "エアドロップ計算", "Funding スクリーナー"],
    contact: "連絡",
    language: "言語",
    hero: {
      list: { badge: "紹介特典ボード", title: "より良い perp farming 条件を見つける。", body: "手数料割引、ポイントブースト、refback ルートを素早く比較できます。", primary: "Perpsを見る", secondary: "空投を試算" },
      calculator: { badge: "ポイントをドルへ", title: "エアドロップの期待値を見積もる。", body: "FDV、配分、総ポイント、保有ポイントをまとめて試算します。", primary: "計算機を開く", secondary: "Fundingを見る" },
      funding: { badge: "ライブ市場スキャナー", title: "Funding spread をすばやく確認。", body: "Loris データを並べ替え、最適な利用可能ルートを開けます。", primary: "Funding確認", secondary: "リセット" },
    },
    portfolioTitle: "ポイントポートフォリオ試算",
    pointBalance: "ポイント残高",
    estimatedTotal: "推定合計",
  },
  uk: {
    tabs: ["Список perp", "Калькулятор airdrop", "Funding скринер"],
    contact: "Контакт",
    language: "Мова",
    hero: {
      list: { badge: "Дошка реф-бонусів", title: "Знайди найкращі умови для perp farming.", body: "Порівнюй знижки, бусти поінтів і refback-маршрути без зайвих таблиць.", primary: "Дивитись perps", secondary: "Оцінити airdrop" },
      calculator: { badge: "Поінти в долари", title: "Оціни потенціал свого airdrop.", body: "Моделюй FDV, алокацію, supply поінтів і власний баланс поінтів.", primary: "Відкрити калькулятор", secondary: "Сканувати funding" },
      funding: { badge: "Live market scanner", title: "Швидше скануй funding spreads.", body: "Дані Loris, сортування за Max Arb, OI Rank або Symbol і швидкі переходи.", primary: "Сканувати funding", secondary: "Скинути фільтри" },
    },
    portfolioTitle: "Оцінка портфеля поінтів",
    pointBalance: "Баланс поінтів",
    estimatedTotal: "Оцінка разом",
  },
  ru: {
    tabs: ["Список perp", "Калькулятор airdrop", "Funding скринер"],
    contact: "Контакт",
    language: "Язык",
    hero: {
      list: { badge: "Доска реф-бонусов", title: "Найди лучшие условия для perp farming.", body: "Сравнивай скидки, бусты поинтов и refback-маршруты без лишних таблиц.", primary: "Смотреть perps", secondary: "Оценить airdrop" },
      calculator: { badge: "Поинты в доллары", title: "Оцени потенциал своего airdrop.", body: "Моделируй FDV, аллокацию, общий supply поинтов и свой баланс.", primary: "Открыть калькулятор", secondary: "Сканировать funding" },
      funding: { badge: "Live market scanner", title: "Быстрее сканируй funding spreads.", body: "Данные Loris, сортировка по Max Arb, OI Rank или Symbol и быстрые переходы.", primary: "Сканировать funding", secondary: "Сбросить фильтры" },
    },
    portfolioTitle: "Оценка портфеля поинтов",
    pointBalance: "Баланс поинтов",
    estimatedTotal: "Итого примерно",
  },
  ar: {
    tabs: ["قائمة Perp", "حاسبة Airdrop", "ماسح Funding"],
    contact: "تواصل",
    language: "اللغة",
    hero: {
      list: { badge: "لوحة مزايا الإحالة", title: "اعثر على أفضل شروط perp farming.", body: "قارن الخصومات، تعزيزات النقاط، ومسارات refback مع إبقاء أسماء البروتوكولات كما هي.", primary: "استعرض perps", secondary: "قدّر airdrop" },
      calculator: { badge: "النقاط إلى دولار", title: "قدّر قيمة airdrop المحتملة.", body: "اختبر FDV والتخصيص وإجمالي النقاط ومحفظتك الكاملة.", primary: "افتح الحاسبة", secondary: "افحص funding" },
      funding: { badge: "ماسح سوق مباشر", title: "افحص funding spreads بسرعة.", body: "بيانات Loris مع ترتيب حسب Max Arb أو OI Rank أو Symbol وروابط مباشرة.", primary: "افحص funding", secondary: "إعادة ضبط" },
    },
    portfolioTitle: "مقدر محفظة النقاط",
    pointBalance: "رصيد النقاط",
    estimatedTotal: "الإجمالي المقدر",
  },
  pt: { tabs: ["Lista de Perps", "Calculadora de Airdrop", "Screener de Funding"], contact: "Contato", language: "Idioma", hero: { list: { badge: "Painel de boosts", title: "Encontre os melhores termos de perp farming.", body: "Compare descontos, boosts de pontos e rotas de refback sem traduzir nomes de protocolos.", primary: "Ver perps", secondary: "Estimar airdrop" }, calculator: { badge: "Pontos em dólares", title: "Estime o potencial do seu airdrop.", body: "Modele FDV, alocação, supply de pontos e seu saldo de pontos.", primary: "Abrir calculadora", secondary: "Escanear funding" }, funding: { badge: "Scanner de mercado", title: "Escaneie funding spreads mais rápido.", body: "Dados Loris com ordenação por Max Arb, OI Rank ou Symbol e rotas diretas.", primary: "Escanear funding", secondary: "Resetar filtros" } }, portfolioTitle: "Estimador de portfólio de pontos", pointBalance: "Saldo de pontos", estimatedTotal: "Total estimado" },
  es: { tabs: ["Lista de Perps", "Calculadora de Airdrop", "Screener de Funding"], contact: "Contacto", language: "Idioma", hero: { list: { badge: "Panel de boosts", title: "Encuentra las mejores condiciones de perp farming.", body: "Compara descuentos, boosts de puntos y rutas de refback sin tocar los nombres de protocolos.", primary: "Ver perps", secondary: "Estimar airdrop" }, calculator: { badge: "Puntos a dólares", title: "Estima el potencial de tu airdrop.", body: "Modela FDV, asignación, supply de puntos y tu balance de puntos.", primary: "Abrir calculadora", secondary: "Escanear funding" }, funding: { badge: "Scanner de mercado", title: "Escanea funding spreads más rápido.", body: "Datos de Loris con orden por Max Arb, OI Rank o Symbol y rutas directas.", primary: "Escanear funding", secondary: "Resetear filtros" } }, portfolioTitle: "Estimador de portafolio de puntos", pointBalance: "Saldo de puntos", estimatedTotal: "Total estimado" },
  tr: { tabs: ["Perp Listesi", "Airdrop Hesaplayıcı", "Funding Tarayıcı"], contact: "İletişim", language: "Dil", hero: { list: { badge: "Ref boost paneli", title: "En iyi perp farming şartlarını bul.", body: "Ücret indirimlerini, puan boostlarını ve refback rotalarını hızlıca karşılaştır.", primary: "Perps göster", secondary: "Airdrop hesapla" }, calculator: { badge: "Puanları dolara çevir", title: "Airdrop potansiyelini tahmin et.", body: "FDV, dağıtım, toplam puan ve kendi puan bakiyeni birlikte modelle.", primary: "Hesaplayıcıyı aç", secondary: "Funding tara" }, funding: { badge: "Canlı piyasa tarayıcı", title: "Funding spreadlerini daha hızlı tara.", body: "Loris verisini Max Arb, OI Rank veya Symbol ile sırala ve rotayı aç.", primary: "Funding tara", secondary: "Filtreleri sıfırla" } }, portfolioTitle: "Puan portföy tahmini", pointBalance: "Puan bakiyesi", estimatedTotal: "Tahmini toplam" },
  vi: { tabs: ["Danh sách Perp", "Máy tính Airdrop", "Bộ lọc Funding"], contact: "Liên hệ", language: "Ngôn ngữ", hero: { list: { badge: "Bảng referral boost", title: "Tìm điều kiện perp farming tốt hơn.", body: "So sánh giảm phí, boost điểm và refback route, giữ nguyên tên protocol.", primary: "Xem perps", secondary: "Ước tính airdrop" }, calculator: { badge: "Điểm sang USD", title: "Ước tính upside airdrop.", body: "Mô phỏng FDV, allocation, tổng điểm và số điểm của bạn.", primary: "Mở máy tính", secondary: "Quét funding" }, funding: { badge: "Quét thị trường live", title: "Quét funding spreads nhanh hơn.", body: "Dữ liệu Loris, sắp xếp theo Max Arb, OI Rank hoặc Symbol và mở route nhanh.", primary: "Quét funding", secondary: "Đặt lại lọc" } }, portfolioTitle: "Ước tính danh mục điểm", pointBalance: "Số điểm", estimatedTotal: "Tổng ước tính" },
  id: { tabs: ["Daftar Perp", "Kalkulator Airdrop", "Penyaring Funding"], contact: "Kontak", language: "Bahasa", hero: { list: { badge: "Papan referral boost", title: "Temukan syarat perp farming terbaik.", body: "Bandingkan diskon fee, boost poin, dan rute refback tanpa mengubah nama protokol.", primary: "Lihat perps", secondary: "Estimasi airdrop" }, calculator: { badge: "Poin ke dolar", title: "Estimasi potensi airdrop kamu.", body: "Modelkan FDV, alokasi, total poin, dan portofolio poin penuh.", primary: "Buka kalkulator", secondary: "Pindai funding" }, funding: { badge: "Pemindai pasar live", title: "Pindai funding spreads lebih cepat.", body: "Data Loris dengan sort Max Arb, OI Rank, atau Symbol dan rute cepat.", primary: "Pindai funding", secondary: "Reset filter" } }, portfolioTitle: "Estimator portofolio poin", pointBalance: "Saldo poin", estimatedTotal: "Total estimasi" },
  hi: { tabs: ["Perp सूची", "Airdrop कैलकुलेटर", "Funding स्क्रीनर"], contact: "संपर्क", language: "भाषा", hero: { list: { badge: "Referral boost बोर्ड", title: "बेहतर perp farming terms खोजें।", body: "Fee discount, point boost और refback routes की तुलना करें; protocol names जैसे हैं वैसे रहें।", primary: "Perps देखें", secondary: "Airdrop अनुमान" }, calculator: { badge: "Points to dollars", title: "अपने airdrop upside का अनुमान लगाएँ।", body: "FDV, allocation, total points और पूरे point portfolio को साथ में मॉडल करें।", primary: "Calculator खोलें", secondary: "Funding scan" }, funding: { badge: "Live market scanner", title: "Funding spreads तेज़ी से scan करें।", body: "Loris data को Max Arb, OI Rank या Symbol से sort करें और route खोलें।", primary: "Funding scan", secondary: "Filters reset" } }, portfolioTitle: "पॉइंट पोर्टफोलियो अनुमान", pointBalance: "पॉइंट बैलेंस", estimatedTotal: "अनुमानित कुल" },
  th: { tabs: ["รายการ Perp", "เครื่องคำนวณ Airdrop", "Funding Screener"], contact: "ติดต่อ", language: "ภาษา", hero: { list: { badge: "บอร์ด referral boost", title: "หาเงื่อนไข perp farming ที่ดีที่สุด", body: "เทียบส่วนลดค่าธรรมเนียม point boost และ refback route โดยคงชื่อ protocol เดิมไว้", primary: "ดู perps", secondary: "ประเมิน airdrop" }, calculator: { badge: "แต้มเป็นดอลลาร์", title: "ประเมิน upside ของ airdrop", body: "จำลอง FDV, allocation, total points และ point portfolio ทั้งหมด", primary: "เปิดเครื่องคำนวณ", secondary: "สแกน funding" }, funding: { badge: "ตัวสแกนตลาดสด", title: "สแกน funding spreads ได้เร็วขึ้น", body: "ข้อมูล Loris พร้อมเรียงตาม Max Arb, OI Rank หรือ Symbol", primary: "สแกน funding", secondary: "รีเซ็ตฟิลเตอร์" } }, portfolioTitle: "ตัวประเมินพอร์ตคะแนน", pointBalance: "ยอดคะแนน", estimatedTotal: "ยอดประเมินรวม" },
  fr: { tabs: ["Liste Perp", "Calculateur Airdrop", "Screener Funding"], contact: "Contact", language: "Langue", hero: { list: { badge: "Tableau des boosts", title: "Trouvez les meilleures conditions de perp farming.", body: "Comparez réductions, boosts de points et routes refback sans traduire les noms de protocoles.", primary: "Voir les perps", secondary: "Estimer l'airdrop" }, calculator: { badge: "Points en dollars", title: "Estimez le potentiel de votre airdrop.", body: "Modélisez FDV, allocation, supply de points et portefeuille complet.", primary: "Ouvrir le calculateur", secondary: "Scanner funding" }, funding: { badge: "Scanner de marché live", title: "Scannez les funding spreads plus vite.", body: "Données Loris, tri Max Arb, OI Rank ou Symbol, avec routes directes.", primary: "Scanner funding", secondary: "Réinitialiser" } }, portfolioTitle: "Estimateur de portefeuille de points", pointBalance: "Solde de points", estimatedTotal: "Total estimé" },
  de: { tabs: ["Perp-Liste", "Airdrop-Rechner", "Funding-Screener"], contact: "Kontakt", language: "Sprache", hero: { list: { badge: "Referral-Boost-Board", title: "Finde bessere perp farming Konditionen.", body: "Vergleiche Fee-Rabatte, Point-Boosts und Refback-Routen, ohne Protokollnamen zu übersetzen.", primary: "Perps ansehen", secondary: "Airdrop schätzen" }, calculator: { badge: "Punkte in Dollar", title: "Schätze dein Airdrop-Potenzial.", body: "Modelliere FDV, Allocation, Gesamtpunkte und dein komplettes Punkteportfolio.", primary: "Rechner öffnen", secondary: "Funding scannen" }, funding: { badge: "Live-Market-Scanner", title: "Scanne funding spreads schneller.", body: "Loris-Daten nach Max Arb, OI Rank oder Symbol sortieren und Route öffnen.", primary: "Funding scannen", secondary: "Filter zurücksetzen" } }, portfolioTitle: "Point-Portfolio-Schätzer", pointBalance: "Punktestand", estimatedTotal: "Geschätzter Gesamtwert" },
  pl: { tabs: ["Lista Perp", "Kalkulator Airdrop", "Screener Funding"], contact: "Kontakt", language: "Język", hero: { list: { badge: "Tablica referral boostów", title: "Znajdź lepsze warunki perp farming.", body: "Porównuj zniżki fee, boosty punktów i trasy refback bez tłumaczenia nazw protokołów.", primary: "Zobacz perps", secondary: "Oszacuj airdrop" }, calculator: { badge: "Punkty na dolary", title: "Oszacuj potencjał swojego airdropu.", body: "Modeluj FDV, alokację, podaż punktów i cały portfel punktów.", primary: "Otwórz kalkulator", secondary: "Skanuj funding" }, funding: { badge: "Live market scanner", title: "Skanuj funding spreads szybciej.", body: "Dane Loris z sortowaniem po Max Arb, OI Rank lub Symbol i szybkimi trasami.", primary: "Skanuj funding", secondary: "Reset filtrów" } }, portfolioTitle: "Estymator portfela punktów", pointBalance: "Saldo punktów", estimatedTotal: "Szacowana suma" },
  it: { tabs: ["Lista Perp", "Calcolatore Airdrop", "Screener Funding"], contact: "Contatto", language: "Lingua", hero: { list: { badge: "Board referral boost", title: "Trova le migliori condizioni di perp farming.", body: "Confronta sconti fee, boost punti e rotte refback mantenendo invariati i nomi dei protocolli.", primary: "Vedi perps", secondary: "Stima airdrop" }, calculator: { badge: "Punti in dollari", title: "Stima il potenziale del tuo airdrop.", body: "Modella FDV, allocation, supply punti e tutto il point portfolio.", primary: "Apri calcolatore", secondary: "Scansiona funding" }, funding: { badge: "Scanner mercato live", title: "Scansiona funding spreads più velocemente.", body: "Dati Loris ordinabili per Max Arb, OI Rank o Symbol con rotte dirette.", primary: "Scansiona funding", secondary: "Reset filtri" } }, portfolioTitle: "Stima portafoglio punti", pointBalance: "Saldo punti", estimatedTotal: "Totale stimato" },
  cs: { tabs: ["Seznam Perp", "Airdrop kalkulačka", "Funding screener"], contact: "Kontakt", language: "Jazyk", hero: { list: { badge: "Referral boost panel", title: "Najdi lepší podmínky pro perp farming.", body: "Porovnej fee slevy, point boosty a refback trasy bez překladu názvů protokolů.", primary: "Zobrazit perps", secondary: "Odhadnout airdrop" }, calculator: { badge: "Body na dolary", title: "Odhadni potenciál svého airdropu.", body: "Modeluj FDV, alokaci, celkový počet bodů a celé point portfolio.", primary: "Otevřít kalkulačku", secondary: "Skenovat funding" }, funding: { badge: "Live market scanner", title: "Skenuj funding spreads rychleji.", body: "Data Loris se sortováním podle Max Arb, OI Rank nebo Symbol a rychlými trasami.", primary: "Skenovat funding", secondary: "Reset filtrů" } }, portfolioTitle: "Odhad portfolia bodů", pointBalance: "Zůstatek bodů", estimatedTotal: "Odhad celkem" },
  bn: { tabs: ["Perp তালিকা", "Airdrop ক্যালকুলেটর", "Funding স্ক্রিনার"], contact: "যোগাযোগ", language: "ভাষা", hero: { list: { badge: "Referral boost বোর্ড", title: "ভালো perp farming terms খুঁজুন।", body: "Fee discount, point boost এবং refback route তুলনা করুন; protocol names অপরিবর্তিত থাকে।", primary: "Perps দেখুন", secondary: "Airdrop estimate" }, calculator: { badge: "Points to dollars", title: "আপনার airdrop upside অনুমান করুন।", body: "FDV, allocation, total points এবং পুরো point portfolio একসাথে model করুন।", primary: "Calculator খুলুন", secondary: "Funding scan" }, funding: { badge: "Live market scanner", title: "Funding spreads দ্রুত scan করুন।", body: "Loris data Max Arb, OI Rank বা Symbol দিয়ে sort করে route খুলুন।", primary: "Funding scan", secondary: "Filters reset" } }, portfolioTitle: "পয়েন্ট পোর্টফোলিও অনুমান", pointBalance: "পয়েন্ট ব্যালেন্স", estimatedTotal: "আনুমানিক মোট" },
}

function getCopy(language: LanguageCode) {
  const override = LANGUAGE_OVERRIDES[language] ?? {}
  const heroOverride =
    override.hero && typeof override.hero === "object" && !Array.isArray(override.hero)
      ? (override.hero as Partial<HeroText>)
      : {}

  return {
    ...COPY.en,
    ...override,
    hero: {
      ...COPY.en.hero,
      ...heroOverride,
    },
  } as typeof COPY.en
}

export default function Home() {
  const [tab, setTab] = useState<Tab>("list")
  const [language, setLanguage] = useState<LanguageCode>("en")
  const [languageOpen, setLanguageOpen] = useState(false)
  const [calcPerp, setCalcPerp] = useState<CalcPerpKey>("variational")
  const [myPoints, setMyPoints] = useState(0)
  const [templatePicker, setTemplatePicker] = useState(false)
  const [selectedTemplate, setSelectedTemplate] =
    useState<(typeof TEMPLATES)[number]>("cinema")
  const [isDownloading, setIsDownloading] = useState(false)
  

  const [copiedRefName, setCopiedRefName] = useState<string | null>(null)
  const [copiedTicker, setCopiedTicker] = useState<string | null>(null)

  const [fundingRows, setFundingRows] = useState<FundingApiRow[]>([])
  const [fundingExchanges, setFundingExchanges] = useState<FundingApiExchange[]>(
    DEFAULT_FUNDING_EXCHANGES
  )
  const [fundingUpdatedAt, setFundingUpdatedAt] = useState<string | null>(null)
  const [fundingStale, setFundingStale] = useState(false)
  const [fundingLoading, setFundingLoading] = useState(false)
  const [fundingError, setFundingError] = useState<string | null>(null)
  const [fundingSort, setFundingSort] = useState<{
    key: FundingSortKey
    direction: FundingSortDirection
  }>({ key: "maxArb", direction: "desc" })
  const [searchTicker, setSearchTicker] = useState("")
  const [enabledFundingExchanges, setEnabledFundingExchanges] =
    useState<FundingExchangeKey[]>(INITIAL_FUNDING_KEYS)
  const [fundingMetricMode, setFundingMetricMode] =
    useState<FundingMetricMode>("interval")
  const [onlyActionable, setOnlyActionable] = useState(true)
  const [minimumFundingSpread, setMinimumFundingSpread] = useState(0)
  const [showExchangePicker, setShowExchangePicker] = useState(false)
  const [watchedFundingSymbols, setWatchedFundingSymbols] = useState<string[]>([])
  const [watchlistOnly, setWatchlistOnly] = useState(false)
  const [fundingCapital, setFundingCapital] = useState(10000)
  const [fundingHoldingPeriods, setFundingHoldingPeriods] = useState(8)
  const [fundingFeePercent, setFundingFeePercent] = useState(0.2)
  const [fundingShareCopied, setFundingShareCopied] = useState(false)
  const [fundingRowLimit, setFundingRowLimit] = useState<FundingRowLimit>(100)
  const [refreshCountdown, setRefreshCountdown] = useState(90)
  const [customTemplate, setCustomTemplate] = useState<string | null>(null)
  const [languageMenuPosition, setLanguageMenuPosition] = useState({
    left: 16,
    top: 76,
    width: 224,
  })

  const cardRef = useRef<HTMLDivElement>(null)
  const languageButtonRef = useRef<HTMLButtonElement>(null)
  const fundingTopScrollRef = useRef<HTMLDivElement>(null)
  const fundingTableScrollRef = useRef<HTMLDivElement>(null)
  const fundingRequestInFlightRef = useRef(false)
  const fundingParamsInitializedRef = useRef(false)
  const fundingShareTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const listCopyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const tickerCopyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const current = PERPS_CALC[calcPerp]
  const cardTemplateSrc = customTemplate ?? `/templates/${selectedTemplate}.png`
  const t = getCopy(language)
  const activeLanguage = LANGUAGES.find((item) => item.code === language)!
  const hero = t.hero[tab]

  const scrollToTab = (nextTab: Tab) => {
    window.setTimeout(() => {
      document.getElementById(TAB_HASH[nextTab])?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      })
    }, 80)
  }

  const selectTab = (nextTab: Tab, shouldScroll = true) => {
    setTab(nextTab)
    window.history.replaceState(null, "", `#${TAB_HASH[nextTab]}`)
    if (shouldScroll) scrollToTab(nextTab)
  }

  const updateLanguageMenuPosition = () => {
    const button = languageButtonRef.current
    if (!button) return

    const rect = button.getBoundingClientRect()
    const width = Math.max(210, rect.width)
    const viewportPadding = 12
    const left = Math.min(
      Math.max(viewportPadding, rect.right - width),
      window.innerWidth - width - viewportPadding
    )

    setLanguageMenuPosition({
      left,
      top: rect.bottom + 8,
      width,
    })
  }

  const [fdv, setFdv] = useState<number>(current.fdv)
  const [totalPoints, setTotalPoints] = useState<number>(current.totalPoints)
  const [airdrop, setAirdrop] = useState<number>(current.airdrop)

  useEffect(() => {
    setFdv(current.fdv)
    setTotalPoints(current.totalPoints)
    setAirdrop(current.airdrop)
  }, [current])

  useEffect(() => {
    const hash = window.location.hash.replace("#", "")
    const hashTab = HASH_TAB[hash]

    if (hashTab) {
      setTab(hashTab)
      scrollToTab(hashTab)
    }
  }, [])

  useEffect(() => {
    if (!languageOpen) return

    updateLanguageMenuPosition()
    window.addEventListener("resize", updateLanguageMenuPosition)
    window.addEventListener("scroll", updateLanguageMenuPosition, true)

    return () => {
      window.removeEventListener("resize", updateLanguageMenuPosition)
      window.removeEventListener("scroll", updateLanguageMenuPosition, true)
    }
  }, [languageOpen])

  useEffect(() => {
    return () => {
      if (listCopyTimeoutRef.current) clearTimeout(listCopyTimeoutRef.current)
      if (tickerCopyTimeoutRef.current) clearTimeout(tickerCopyTimeoutRef.current)
      if (fundingShareTimeoutRef.current) {
        clearTimeout(fundingShareTimeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem("capys:funding-watchlist")
      const parsed = stored ? JSON.parse(stored) : []

      if (Array.isArray(parsed)) {
        setWatchedFundingSymbols(
          parsed
            .map((symbol) => String(symbol).trim().toUpperCase())
            .filter(Boolean)
        )
      }
    } catch {
      setWatchedFundingSymbols([])
    }
  }, [])

  useEffect(() => {
    window.localStorage.setItem(
      "capys:funding-watchlist",
      JSON.stringify(watchedFundingSymbols)
    )
  }, [watchedFundingSymbols])

  useEffect(() => {
    if (fundingParamsInitializedRef.current) return
    fundingParamsInitializedRef.current = true

    const params = new URLSearchParams(window.location.search)
    const ticker = params.get("ticker")
    const exchanges = params.get("exchanges")
    const minSpread = Number(params.get("minSpread"))
    const mode = params.get("mode")

    if (ticker) setSearchTicker(ticker.toUpperCase())
    if (exchanges) {
      setEnabledFundingExchanges(
        exchanges
          .split(",")
          .map((exchange) => exchange.trim())
          .filter(Boolean)
      )
    }
    if (Number.isFinite(minSpread) && minSpread >= 0) {
      setMinimumFundingSpread(minSpread)
    }
    if (mode === "annualized" || mode === "interval") {
      setFundingMetricMode(mode)
    }
  }, [])

  const loadFunding = useCallback(
    async (silent = false) => {
      if (fundingRequestInFlightRef.current) return

      try {
        fundingRequestInFlightRef.current = true
        if (!silent) setFundingLoading(true)
        if (!silent) setFundingError(null)

        const controller = new AbortController()
        const timeout = window.setTimeout(() => controller.abort(), 20_000)
        const res = await fetch("/api/funding", {
          cache: "no-store",
          signal: controller.signal,
        }).finally(() => window.clearTimeout(timeout))

        const data = await res.json()

        if (!res.ok) {
          throw new Error(data?.error || "Failed to load funding data")
        }

        const safeRows = Array.isArray(data?.rows)
          ? data.rows
              .filter((row: unknown) => row && typeof row === "object")
              .map((row: RawFundingApiRow) => ({
                exchange: String(row.exchange ?? ""),
                display: String(row.display ?? row.exchange ?? ""),
                symbol: String(row.symbol ?? "").toUpperCase(),
                funding: Number(row.funding),
                oiRank: String(row.oiRank ?? "500+"),
                bias:
                  row.bias === "longs_pay_shorts" ||
                  row.bias === "shorts_pay_longs" ||
                  row.bias === "neutral"
                    ? row.bias
                    : "neutral",
              }))
              .filter(
                (row: FundingApiRow) =>
                  Boolean(row.exchange && row.symbol) &&
                  Number.isFinite(row.funding)
              )
          : []

        const safeExchanges: FundingApiExchange[] = Array.isArray(data?.exchanges)
          ? data.exchanges
              .filter((exchange: unknown) => exchange && typeof exchange === "object")
              .map((exchange: Partial<FundingApiExchange>) => ({
                key: String(exchange.key ?? ""),
                label: String(exchange.label ?? exchange.key ?? ""),
                intervalHours: exchange.intervalHours === 1 ? 1 : 8,
                tradeUrl: String(exchange.tradeUrl ?? "#"),
                hasPersonalRef: Boolean(exchange.hasPersonalRef),
              }))
              .filter((exchange: FundingApiExchange) => exchange.key && exchange.label)
          : DEFAULT_FUNDING_EXCHANGES

        if (data?.error && !safeRows.length) {
          throw new Error(String(data.error))
        }

        setFundingExchanges(safeExchanges)
        setEnabledFundingExchanges((prev) => {
          const availableKeys = safeExchanges.map((exchange) => exchange.key)
          const kept = prev.filter((key) => availableKeys.includes(key))
          return kept.length ? kept : availableKeys
        })
        setFundingRows(safeRows)
        setFundingUpdatedAt(data?.updatedAt ? String(data.updatedAt) : null)
        setFundingStale(Boolean(data?.stale))
        setFundingError(null)
        setRefreshCountdown(90)
      } catch (error) {
        if (silent) {
          setFundingStale(true)
        } else {
          setFundingError(
            error instanceof Error ? error.message : "Failed to load funding data"
          )
        }
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
          return 90
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

  const activeFundingExchanges = useMemo(
    () =>
      fundingExchanges.filter((exchange) =>
        enabledFundingExchanges.includes(exchange.key)
      ),
    [fundingExchanges, enabledFundingExchanges]
  )

  const fundingTableMinWidth = 488 + activeFundingExchanges.length * 166

  const syncFundingScroll = (source: "top" | "table") => {
    const from =
      source === "top"
        ? fundingTopScrollRef.current
        : fundingTableScrollRef.current
    const to =
      source === "top"
        ? fundingTableScrollRef.current
        : fundingTopScrollRef.current

    if (!from || !to || to.scrollLeft === from.scrollLeft) return
    to.scrollLeft = from.scrollLeft
  }

  const fundingExchangeByKey = useMemo(
    () =>
      new Map(
        fundingExchanges.map((exchange) => [exchange.key, exchange] as const)
      ),
    [fundingExchanges]
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
        const exchangeMeta = fundingExchangeByKey.get(exchangeKey)
        return {
          ...row,
          displayFunding: toDisplayedFundingValue(
            row.funding,
            exchangeMeta,
            fundingMetricMode
          ),
        }
      })
  }, [
    fundingRows,
    enabledFundingExchanges,
    searchTicker,
    fundingMetricMode,
    fundingExchangeByKey,
  ])

  const fundingMatrixRows = useMemo(() => {
    try {
      const grouped = new Map<
        string,
        {
          symbol: string
          oiRank: string
          byExchange: Record<string, number | null>
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
            byExchange: Object.fromEntries(
              fundingExchanges.map((exchange) => [exchange.key, null])
            ),
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
        const netReturnPct =
          fundingMetricMode === "interval"
            ? maxArb * Math.max(fundingHoldingPeriods, 1) -
              Math.max(fundingFeePercent, 0)
            : null
        const estimatedNetUsd =
          netReturnPct === null
            ? null
            : (Math.max(fundingCapital, 0) * netReturnPct) / 100

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
          estimatedNetUsd,
          netReturnPct,
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

      const filtered = matrix.filter(
        (row) =>
          (!onlyActionable || (row.activeCount >= 2 && row.maxArb > 0)) &&
          row.maxArb >= minimumFundingSpread &&
          (!watchlistOnly || watchedFundingSymbols.includes(row.symbol))
      )

      return filtered.sort((a, b) => {
        let comparison = 0

        if (fundingSort.key === "symbol") {
          comparison = a.symbol.localeCompare(b.symbol)
        }

        if (fundingSort.key === "oiRank") {
          comparison = parseOiRank(a.oiRank) - parseOiRank(b.oiRank)
        }

        if (fundingSort.key === "maxArb") {
          comparison = a.maxArb - b.maxArb
        }

        return fundingSort.direction === "asc" ? comparison : -comparison
      })
    } catch (error) {
      console.error("Funding matrix build failed:", error)
      return []
    }
  }, [
    visibleFundingRows,
    activeFundingExchanges,
    fundingExchanges,
    fundingSort,
    onlyActionable,
    minimumFundingSpread,
    fundingMetricMode,
    fundingHoldingPeriods,
    fundingFeePercent,
    fundingCapital,
    watchlistOnly,
    watchedFundingSymbols,
  ])

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
  const renderedFundingRows = useMemo(
    () =>
      fundingRowLimit === "all"
        ? fundingMatrixRows
        : fundingMatrixRows.slice(0, fundingRowLimit),
    [fundingMatrixRows, fundingRowLimit]
  )
  const hiddenFundingRows = Math.max(
    fundingMatrixRows.length - renderedFundingRows.length,
    0
  )

  const setFundingSortKey = (key: FundingSortKey) => {
    setFundingSort((prev) => ({
      key,
      direction:
        prev.key === key
          ? prev.direction === "desc"
            ? "asc"
            : "desc"
          : key === "symbol"
            ? "asc"
            : "desc",
    }))
  }

  const sortLabel = (key: FundingSortKey) => {
    if (fundingSort.key !== key) return ""
    return fundingSort.direction === "desc" ? "↓" : "↑"
  }

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
        return prev.filter((key) => key !== exchangeKey)
      }

      return [...prev, exchangeKey]
    })
  }

  const toggleFundingWatch = (symbol: string) => {
    setWatchedFundingSymbols((current) =>
      current.includes(symbol)
        ? current.filter((item) => item !== symbol)
        : [...current, symbol]
    )
  }

  const shareFundingView = async () => {
    const url = new URL(window.location.href)
    url.hash = "funding"

    if (searchTicker) url.searchParams.set("ticker", searchTicker)
    else url.searchParams.delete("ticker")

    if (
      enabledFundingExchanges.length &&
      enabledFundingExchanges.length !== fundingExchanges.length
    ) {
      url.searchParams.set("exchanges", enabledFundingExchanges.join(","))
    } else {
      url.searchParams.delete("exchanges")
    }

    if (minimumFundingSpread > 0) {
      url.searchParams.set("minSpread", String(minimumFundingSpread))
    } else {
      url.searchParams.delete("minSpread")
    }

    if (fundingMetricMode !== "interval") {
      url.searchParams.set("mode", fundingMetricMode)
    } else {
      url.searchParams.delete("mode")
    }

    try {
      await navigator.clipboard.writeText(url.toString())
      setFundingShareCopied(true)

      if (fundingShareTimeoutRef.current) {
        clearTimeout(fundingShareTimeoutRef.current)
      }
      fundingShareTimeoutRef.current = setTimeout(
        () => setFundingShareCopied(false),
        1600
      )
    } catch (error) {
      console.error("Failed to copy funding view:", error)
    }
  }

  const resetFundingFilters = () => {
    setEnabledFundingExchanges(fundingExchanges.map((exchange) => exchange.key))
    setSearchTicker("")
    setOnlyActionable(true)
    setMinimumFundingSpread(0)
    setWatchlistOnly(false)
    setFundingMetricMode("interval")
    setFundingSort({ key: "maxArb", direction: "desc" })
    setFundingRowLimit(100)
  }

  const setFundingQuickView = (
    view: "best" | "capy" | "majors" | "all"
  ) => {
    const allKeys = fundingExchanges.map((exchange) => exchange.key)

    if (view === "capy") {
      setEnabledFundingExchanges(
        fundingExchanges
          .filter((exchange) => exchange.hasPersonalRef)
          .map((exchange) => exchange.key)
      )
      setOnlyActionable(true)
      setMinimumFundingSpread(0)
      setFundingSort({ key: "maxArb", direction: "desc" })
      setFundingRowLimit(100)
      return
    }

    if (view === "majors") {
      const preferred = new Set([
        "hyperliquid",
        "binance",
        "bybit",
        "okx",
        "bitget",
        "kucoin",
        "extended",
        "hibachi",
        "pacifica",
        "variational",
      ])
      const next = fundingExchanges
        .filter((exchange) => preferred.has(exchange.key))
        .map((exchange) => exchange.key)
      setEnabledFundingExchanges(next.length ? next : allKeys)
      setOnlyActionable(true)
      setMinimumFundingSpread(0.01)
      setFundingSort({ key: "maxArb", direction: "desc" })
      setFundingRowLimit(100)
      return
    }

    setEnabledFundingExchanges(allKeys)
    setOnlyActionable(view !== "all")
    setMinimumFundingSpread(view === "best" ? 0.05 : 0)
    setFundingSort({ key: "maxArb", direction: "desc" })
    setFundingRowLimit(view === "all" ? "all" : 100)
  }

  const uploadCustomTemplate = (file: File | undefined) => {
    if (!file || !file.type.startsWith("image/")) return

    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setCustomTemplate(reader.result)
        setTemplatePicker(false)
      }
    }
    reader.readAsDataURL(file)
  }

  const downloadCard = async () => {
    if (!cardRef.current || isDownloading) return

    try {
      setIsDownloading(true)

      await document.fonts.ready
      await new Promise((resolve) => setTimeout(resolve, 250))

      const dataUrl = await createCardDataUrl()

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

  const createCardDataUrl = async () => {
    if (!cardRef.current) throw new Error("Card is not ready")

    await document.fonts.ready
    await new Promise((resolve) => setTimeout(resolve, 250))

    return toPng(cardRef.current, {
      cacheBust: true,
      pixelRatio: 2,
      backgroundColor: "#060b16",
    })
  }

  const shareOnX = async () => {
    const text = `My potential ${current.name} airdrop is ${formatMoney(myValue, 0)}.

My points: ${formatNumber(safeMyPoints)}
Est. FDV: ${formatCompactMoney(safeFdv * 1_000_000_000)}
Point price: ${formatMoney(pricePerPoint, 4)}
Airdrop: ${safeAirdrop}%

Calculate yours on ${SITE_URL}`

    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`
    window.open(url, "_blank", "noopener,noreferrer")
  }

  return (
    <main className="capys-page relative z-10 min-h-screen overflow-x-hidden pb-20 text-white">
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.18),transparent_32%),linear-gradient(135deg,#030610_0%,#07111f_44%,#050814_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(to_right,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:72px_72px] [mask-image:linear-gradient(to_bottom,black,transparent_82%)]" />
        <div className="absolute left-[-260px] top-[-260px] h-[680px] w-[680px] animate-blob rounded-full bg-cyan-500/20 blur-[170px]" />
        <div className="animation-delay-2000 absolute right-[-260px] top-[18%] h-[620px] w-[620px] animate-blob rounded-full bg-indigo-500/20 blur-[180px]" />
        <div className="animation-delay-4000 absolute bottom-[-280px] left-[35%] h-[640px] w-[640px] animate-blob rounded-full bg-emerald-500/15 blur-[190px]" />
      </div>

      <div className="relative z-[100] mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
        <div className="absolute right-4 top-9 z-[120] sm:right-6 lg:right-8 xl:right-[-132px]">
          <button
            ref={languageButtonRef}
            type="button"
            onClick={() => {
              updateLanguageMenuPosition()
              setLanguageOpen((prev) => !prev)
            }}
            className="inline-flex h-10 min-w-[112px] items-center justify-center gap-2 rounded-xl border border-white/10 bg-[#08111f]/88 px-3 text-xs font-semibold text-white/75 shadow-2xl shadow-black/20 backdrop-blur-xl transition hover:border-cyan-300/35 hover:bg-white/[0.07] hover:text-white focus:outline-none focus:ring-2 focus:ring-cyan-300/40"
            aria-expanded={languageOpen}
            aria-label={t.language}
          >
            <span>{activeLanguage.flag}</span>
            <span className="hidden sm:inline">{activeLanguage.label}</span>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
              className={`text-white/45 transition-transform duration-200 ${
                languageOpen ? "rotate-180" : ""
              }`}
            >
              <path
                d="m6 9 6 6 6-6"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {languageOpen && (
            <div
              className="fixed z-[1000] max-h-[min(520px,calc(100vh-96px))] overflow-y-auto rounded-2xl border border-cyan-300/15 bg-[#08111f]/98 p-2 shadow-[0_24px_80px_rgba(0,0,0,0.55)] backdrop-blur-xl"
              style={{
                left: languageMenuPosition.left,
                top: languageMenuPosition.top,
                width: languageMenuPosition.width,
              }}
            >
              {LANGUAGES.map((item) => (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => {
                    setLanguage(item.code)
                    setLanguageOpen(false)
                  }}
                  className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm transition focus:outline-none focus:ring-2 focus:ring-cyan-300/35 ${
                    language === item.code
                      ? "bg-cyan-300 text-slate-950 shadow-[0_0_24px_rgba(34,211,238,0.2)]"
                      : "text-white/70 hover:bg-white/[0.06] hover:text-white"
                  }`}
                >
                  <span>{item.flag}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <header className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3 shadow-2xl shadow-black/20 backdrop-blur-xl">
          <button
            type="button"
            onClick={() => selectTab("list", false)}
            className="flex items-center gap-3 text-left"
            aria-label="Go to Capys app home"
          >
            <span className="relative h-10 w-10 overflow-hidden rounded-xl border border-cyan-300/25 bg-cyan-300/10 shadow-[0_0_24px_rgba(34,211,238,0.18)]">
              <Image
                src="/icon.png"
                alt="Capys.app"
                fill
                sizes="40px"
                className="object-cover"
              />
            </span>
            <span>
              <span className="block text-sm font-semibold tracking-[0.24em] text-white">
                CAPYS
              </span>
              <span className="block text-xs text-white/45">{t.console}</span>
            </span>
          </button>

          <div className="hidden items-center gap-2 text-sm md:flex">
            {TABS.map((item, index) => (
              <button
                key={`nav-${item.id}`}
                onClick={() => selectTab(item.id as Tab, false)}
                className={`rounded-full px-4 py-2 transition focus:outline-none focus:ring-2 focus:ring-cyan-300/40 ${
                  tab === item.id
                    ? "bg-white text-black"
                    : "text-white/55 hover:bg-white/10 hover:text-white"
                }`}
              >
                {t.tabs[index]}
              </button>
            ))}
            <Link
              href="/markets"
              className="rounded-full px-4 py-2 text-white/55 transition hover:bg-white/10 hover:text-white"
            >
              Markets
            </Link>
            <Link
              href="/tools"
              className="rounded-full px-4 py-2 text-white/55 transition hover:bg-white/10 hover:text-white"
            >
              Tools
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/airdrops"
              className="hidden rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-white/65 transition hover:border-cyan-300/25 hover:text-cyan-100 xl:inline-flex"
            >
              Airdrops
            </Link>
            <a
              href="https://x.com/capy_onchain"
              target="_blank"
              rel="noopener noreferrer"
              className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-white/70 transition hover:border-cyan-300/40 hover:text-cyan-200 focus:outline-none focus:ring-2 focus:ring-cyan-300/40"
              aria-label="Open Capy on X"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18 2h3l-7 8 8 12h-6l-5-8-7 8H1l8-9L1 2h6l4 7 7-7z" />
              </svg>
            </a>

            <a
              href="https://t.me/olejk_2k"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden rounded-xl border border-cyan-300/25 bg-cyan-300/10 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-300/15 sm:inline-flex"
            >
              {t.contact}
            </a>

          </div>
        </header>

        <nav className="mt-3 grid grid-cols-5 gap-1 rounded-2xl border border-white/10 bg-[#07101d]/88 p-1 text-[10px] font-semibold text-white/55 backdrop-blur-xl md:hidden">
          {TABS.map((item, index) => (
            <button
              key={`mobile-nav-${item.id}`}
              type="button"
              onClick={() => selectTab(item.id as Tab, false)}
              className={`rounded-xl px-2 py-3 transition ${
                tab === item.id
                  ? "bg-cyan-300 text-slate-950"
                  : "hover:bg-white/[0.06] hover:text-white"
              }`}
            >
              {index === 0 ? "Perps" : index === 1 ? "Calc" : "Funding"}
            </button>
          ))}
          <Link
            href="/markets"
            className="rounded-xl px-2 py-3 text-center transition hover:bg-white/[0.06] hover:text-white"
          >
            Markets
          </Link>
          <Link
            href="/tools"
            className="rounded-xl px-2 py-3 text-center transition hover:bg-white/[0.06] hover:text-white"
          >
            Tools
          </Link>
        </nav>

        <section className="grid min-h-[680px] items-center gap-10 py-14 lg:grid-cols-[1.05fr_0.95fr] lg:py-20">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.26em] text-emerald-200">
              {hero.badge}
            </div>

            <h1 className="max-w-4xl text-5xl font-black leading-[0.95] tracking-tight text-white sm:text-6xl lg:text-7xl">
              {hero.title}
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-7 text-white/62 sm:text-lg">
              {hero.body}
            </p>

            <a
              href="https://x.com/capy_onchain"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-xs font-bold text-cyan-100 transition hover:border-cyan-300/45 hover:bg-cyan-300/15 focus:outline-none focus:ring-2 focus:ring-cyan-300/40"
            >
              <span className="text-cyan-300">Built by @capy_onchain</span>
              <span className="text-white/38">•</span>
              <span>follow for perp farming research</span>
            </a>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={() => {
                  if (tab === "funding") {
                    selectTab("funding")
                    void loadFunding(false)
                  } else {
                    selectTab(tab === "calculator" ? "calculator" : "list")
                  }
                }}
                className="rounded-2xl bg-cyan-300 px-6 py-4 text-sm font-black uppercase tracking-[0.18em] text-slate-950 shadow-[0_0_34px_rgba(34,211,238,0.28)] transition hover:-translate-y-0.5 hover:bg-cyan-200 focus:outline-none focus:ring-2 focus:ring-cyan-300/50 focus:ring-offset-2 focus:ring-offset-[#050814]"
              >
                {hero.primary}
              </button>

              <button
                onClick={() => {
                  if (tab === "funding") {
                    resetFundingFilters()
                    selectTab("funding")
                  } else {
                    selectTab(tab === "calculator" ? "funding" : "calculator")
                  }
                }}
                className="rounded-2xl border border-white/12 bg-white/[0.04] px-6 py-4 text-sm font-semibold text-white/80 transition hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/[0.08] focus:outline-none focus:ring-2 focus:ring-white/25"
              >
                {hero.secondary}
              </button>
            </div>

            <div className="mt-10 grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                ["40+", t.stats[0]],
                [String(CALC_KEYS.length), t.stats[1]],
                ["90s", t.stats[2]],
                ["100%", t.stats[3]],
              ].map(([value, label]) => (
                <div
                  key={label}
                  className="rounded-2xl border border-white/10 bg-white/[0.035] p-4 backdrop-blur"
                >
                  <div className="text-2xl font-black text-white">{value}</div>
                  <div className="mt-1 text-xs uppercase tracking-[0.18em] text-white/38">
                    {label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-6 rounded-[2rem] bg-cyan-300/10 blur-3xl" />
            <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#08111f]/88 p-5 shadow-2xl shadow-black/40 backdrop-blur-xl">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <div className="text-xs uppercase tracking-[0.28em] text-white/35">
                    {t.commandEyebrow}
                  </div>
                  <div className="mt-2 text-2xl font-bold text-white">
                    {t.commandTitle}
                  </div>
                </div>
                <div className="rounded-full border border-emerald-300/25 bg-emerald-300/10 px-3 py-1 text-xs font-semibold text-emerald-200">
                  {t.online}
                </div>
              </div>

              <div className="max-h-[360px] space-y-3 overflow-y-auto pr-1">
                {PERPS.map((perp) => (
                  <a
                    href={perp.ref}
                    target="_blank"
                    rel="noopener noreferrer"
                    key={`hero-${perp.name}`}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-white/8 bg-white/[0.035] p-3 transition hover:border-cyan-300/35 hover:bg-white/[0.07]"
                  >
                    <div className="flex items-center gap-3">
                      <Image
                        src={perp.logo}
                        alt={perp.name}
                        width={40}
                        height={40}
                        className="rounded-xl"
                      />
                      <div>
                        <div className="font-semibold text-white">{perp.name}</div>
                      </div>
                    </div>
                    <span
                      className={`rounded-xl border px-3 py-1 text-xs font-black ${getTierStyle(
                        perp.tier
                      )}`}
                    >
                      {perp.tier}
                    </span>
                  </a>
                ))}
              </div>

              <div className="mt-5 rounded-2xl border border-cyan-300/15 bg-cyan-300/8 p-4">
                <div>
                  <div>
                    <div className="text-xs uppercase tracking-[0.22em] text-cyan-100/55">
                      {t.nextAction}
                    </div>
                    <div className="mt-1 text-sm text-white/75">
                      {t.nextActionText}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="sticky top-3 z-30 mx-auto flex max-w-3xl justify-center">
          <div className="flex w-full flex-wrap justify-center gap-1 rounded-2xl border border-white/10 bg-[#07101d]/88 p-1 shadow-2xl shadow-black/25 backdrop-blur-xl sm:w-auto">
            {TABS.map((item, index) => {
              const isActive = tab === item.id

              return (
                <button
                  key={item.id}
                onClick={() => selectTab(item.id as Tab, false)}
                  className={`relative flex-1 rounded-xl px-4 py-3 text-xs font-semibold transition-colors duration-300 sm:flex-none sm:px-5 sm:text-sm ${
                    isActive ? "text-slate-950" : "text-white/52 hover:text-white"
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="active-tab"
                      className="absolute inset-0 rounded-xl bg-cyan-300 shadow-[0_0_24px_rgba(34,211,238,0.22)]"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}

                  <span className="relative z-10">{t.tabs[index]}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {tab === "list" && (
        <section id="perps" className="scroll-mt-24 mx-auto mt-14 max-w-6xl space-y-6 px-4 sm:px-6">
          <div className="mb-12">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-200/65">
                  Choose your farming route
                </div>
                <h2 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
                  Start with your strategy, not a tier
                </h2>
              </div>
              <Link
                href="/methodology"
                className="text-sm font-semibold text-cyan-200 transition hover:text-cyan-100"
              >
                How Capys evaluates routes →
              </Link>
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {FARMING_ROUTES.map((route) => (
                <Link
                  key={route.slug}
                  href={`/perps/${route.slug}`}
                  className="group rounded-2xl border border-white/10 bg-white/[0.035] p-5 transition hover:-translate-y-0.5 hover:border-cyan-300/35 hover:bg-white/[0.06]"
                >
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200/55">
                    {route.label}
                  </div>
                  <div className="mt-3 text-xl font-black text-white">
                    {route.title}
                  </div>
                  <p className="mt-2 text-sm leading-6 text-white/50">
                    {route.description}
                  </p>
                  <div className="mt-4 text-sm font-semibold text-cyan-200 transition group-hover:text-cyan-100">
                    View farming guide →
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/55">
                {t.listEyebrow}
              </div>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
                {t.listTitle}
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/50">
                {t.listBody}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3 text-sm text-white/55">
              {t.copyHint}
            </div>
          </div>

          <div className="hidden grid-cols-[88px_1fr_260px_auto] border-b border-white/10 px-2 pb-4 text-xs uppercase tracking-[0.22em] text-white/35 md:grid">
            <div>{t.tier}</div>
            <div>{t.protocol}</div>
            <div className="pr-6 text-right">{t.boost}</div>
            <div />
          </div>

          {PERPS.map((perp) => {
            const isContactOnly = perp.slug === "risex"

            return (
            <div
              key={perp.name}
              className="group relative flex flex-col items-start gap-4 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035] p-4 shadow-xl shadow-black/10 backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-cyan-300/35 hover:bg-white/[0.055] hover:shadow-[0_0_36px_rgba(34,211,238,0.12)] md:grid md:grid-cols-[88px_1fr_260px_auto] md:items-center md:p-5"
            >
              <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-cyan-300/0 via-cyan-300/55 to-emerald-300/0 opacity-0 transition group-hover:opacity-100" />

              <div className="flex md:justify-start">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl border text-sm font-black ${getTierStyle(
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
                  <div className="text-lg font-bold text-white">{perp.name}</div>
                  <div className="mt-1 text-xs leading-5 text-white/45">
                    {t.farmTip} {perp.farm}
                  </div>
                </div>
              </div>

              <div className="flex md:justify-center">
                <button
                  type="button"
                  onClick={() => copyRefCode(perp.name, perp.refCode)}
                  className="group/boost relative w-[190px] rounded-full border border-emerald-300/25 bg-emerald-300/10 px-3 py-2 text-center text-xs font-semibold text-emerald-200 transition hover:bg-emerald-300/15 sm:text-sm"
                >
                  {copiedRefName === perp.name
                    ? t.copiedCode
                    : isContactOnly
                      ? "Contact for codes"
                      : perp.boost}

                  <span className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 w-max -translate-x-1/2 rounded-xl border border-white/10 bg-[#07101d] px-3 py-2 text-[11px] text-white opacity-0 shadow-lg transition group-hover/boost:opacity-100">
                    {isContactOnly ? (
                      <span>DM @olejk_2k on Telegram for RiseX access codes</span>
                    ) : (
                      <>
                        {t.code}: <span className="text-cyan-300">{perp.refCode}</span> • {t.clickToCopy}
                      </>
                    )}
                  </span>
                </button>
              </div>

              <a
                href={perp.ref}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 w-full rounded-2xl border border-cyan-300/30 bg-cyan-300/10 px-6 py-3 text-center text-sm font-black uppercase tracking-[0.16em] text-cyan-100 transition hover:bg-cyan-300 hover:text-slate-950 md:ml-4 md:mt-0 md:w-[130px]"
              >
                {isContactOnly ? "Contact for codes" : t.trade} →
              </a>
            </div>
            )
          })}
        </section>
      )}

      {tab === "calculator" && (
        <section id="calculator" className="scroll-mt-24 mx-auto mt-14 max-w-6xl space-y-8 px-4 sm:px-6">
          <div className="text-center">
              <div className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/55">
              {t.calcEyebrow}
            </div>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
              {t.calcTitle}
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-white/50">
              {t.calcBody}
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-2 rounded-3xl border border-white/10 bg-white/[0.03] p-3 backdrop-blur-xl">
            {CALC_KEYS.map((perpKey) => {
              const isActive = calcPerp === perpKey

              return (
                <button
                  key={perpKey}
                  onClick={() => setCalcPerp(perpKey)}
                  className={`rounded-full border px-4 py-2 text-sm transition ${
                    isActive
                      ? "border-cyan-300 bg-cyan-300 text-slate-950 shadow-[0_0_18px_rgba(34,211,238,0.22)]"
                      : "border-white/10 bg-white/[0.03] text-white/52 hover:border-white/20 hover:text-white"
                  }`}
                >
                  {PERPS_CALC[perpKey].name}
                </button>
              )
            })}
          </div>

          <div className="grid gap-5 lg:grid-cols-[270px_1fr]">
            <aside className="rounded-3xl border border-cyan-300/15 bg-cyan-300/[0.055] p-5 shadow-2xl shadow-black/15 backdrop-blur-xl">
              <div className="text-xs font-semibold uppercase tracking-[0.26em] text-cyan-200/55">
                Dedicated calculators
              </div>
              <h3 className="mt-2 text-xl font-black text-white">
                Perp-specific pages
              </h3>
              <p className="mt-2 text-xs leading-5 text-white/48">
                Open a dedicated point calculator page for any perp.
              </p>
              <Link
                href="/calculators"
                className="mt-3 inline-flex text-xs font-semibold text-cyan-200 transition hover:text-cyan-100"
              >
                Browse all calculators →
              </Link>

              <div className="mt-5 max-h-[520px] space-y-2 overflow-y-auto pr-1">
                {CALCULATOR_DIRECTORY.map((perp) => (
                  <a
                    key={`calc-link-${perp.slug}`}
                    href={`/calculators/${perp.slug}-point-calculator`}
                    className={`flex items-center gap-3 rounded-2xl border p-3 transition hover:-translate-y-0.5 ${
                      calcPerp === perp.slug
                        ? "border-cyan-300/35 bg-cyan-300/12"
                        : "border-white/10 bg-white/[0.035] hover:border-cyan-300/25 hover:bg-white/[0.06]"
                    }`}
                  >
                    <Image
                      src={perp.logo}
                      alt={perp.name}
                      width={34}
                      height={34}
                      className="rounded-lg"
                    />
                    <span>
                      <span className="block text-sm font-bold text-white">
                        {perp.name}
                      </span>
                      <span className="block text-xs text-white/42">
                        Point calculator
                      </span>
                    </span>
                  </a>
                ))}
              </div>
            </aside>

            <div className="grid gap-5 rounded-3xl border border-white/10 bg-white/[0.035] p-5 shadow-2xl shadow-black/20 backdrop-blur-xl md:grid-cols-2">
            <div className="md:col-span-2">
              <div className="rounded-3xl border border-cyan-300/15 bg-cyan-300/8 p-5">
                <div className="text-xs uppercase tracking-[0.24em] text-cyan-100/55">
                  {t.currentEstimate}
                </div>
                <div className="mt-3 text-4xl font-black text-white sm:text-5xl">
                  {formatMoney(myValue, 0)}
                </div>
                <div className="mt-2 text-sm text-white/55">
                  {formatMoney(pricePerPoint, 4)} {t.perPoint} {formatCompactMoney(safeFdv * 1_000_000_000)} FDV
                </div>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs uppercase tracking-[0.22em] text-white/40">
                {t.myPoints}
              </label>
              <input
                type="number"
                min="0"
                value={myPoints}
                onChange={(e) => setMyPoints(sanitizeNumber(e.target.value))}
                className="w-full rounded-2xl border border-white/10 bg-[#07101d] p-4 text-white outline-none transition placeholder:text-white/25 focus:border-cyan-300"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs uppercase tracking-[0.22em] text-white/40">
                {t.fdv}
              </label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={fdv}
                onChange={(e) => setFdv(sanitizeNumber(e.target.value))}
                className="w-full rounded-2xl border border-white/10 bg-[#07101d] p-4 text-white outline-none transition placeholder:text-white/25 focus:border-cyan-300"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs uppercase tracking-[0.22em] text-white/40">
                {t.totalPoints}
              </label>
              <input
                type="number"
                min="1"
                value={totalPoints}
                onChange={(e) => setTotalPoints(sanitizeNumber(e.target.value))}
                className="w-full rounded-2xl border border-white/10 bg-[#07101d] p-4 text-white outline-none transition placeholder:text-white/25 focus:border-cyan-300"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs uppercase tracking-[0.22em] text-white/40">
                {t.airdropSupply}
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={airdrop}
                onChange={(e) => setAirdrop(sanitizeNumber(e.target.value))}
                className="w-full rounded-2xl border border-white/10 bg-[#07101d] p-4 text-white outline-none transition placeholder:text-white/25 focus:border-cyan-300"
              />
            </div>
            </div>
          </div>

          <div
            ref={cardRef}
            className="relative mt-10 aspect-[16/9] overflow-hidden rounded-[28px] border border-cyan-300/20 bg-[#060b16] shadow-[0_0_48px_rgba(34,211,238,0.12)]"
          >
            <Image
              src={cardTemplateSrc}
              alt="Card template"
              fill
              sizes="(max-width: 768px) 100vw, 1024px"
              className="object-cover"
              priority
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
                    {t.potentialValue}
                  </div>

                  <div className="mt-3 text-3xl font-bold leading-none text-white sm:text-4xl md:text-6xl">
                    {formatMoney(myValue, 0)}
                  </div>

                  <div className="mt-3 text-sm text-white/65 sm:text-base">
                    {formatNumber(safeMyPoints)} points • {formatMoney(pricePerPoint, 2)} / point
                  </div>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-[10px] uppercase tracking-[0.22em] text-white/45 sm:px-4 sm:text-xs">
                  {t.estimateOnly}
                </div>
              </div>

              <div className="mt-auto grid grid-cols-2 gap-3 md:grid-cols-4">
                <div className="rounded-2xl border border-white/10 bg-black/30 p-3 backdrop-blur-md sm:p-4">
                  <div className="text-[10px] uppercase tracking-[0.22em] text-white/40 sm:text-[11px]">
                    {t.myPoints}
                  </div>
                  <div className="mt-2 text-lg font-semibold text-white sm:text-xl">
                    {formatNumber(safeMyPoints)}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/30 p-3 backdrop-blur-md sm:p-4">
                  <div className="text-[10px] uppercase tracking-[0.22em] text-white/40 sm:text-[11px]">
                    {t.totalSupply}
                  </div>
                  <div className="mt-2 text-lg font-semibold text-white sm:text-xl">
                    {formatNumber(safeTotalPoints)}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/30 p-3 backdrop-blur-md sm:p-4">
                  <div className="text-[10px] uppercase tracking-[0.22em] text-white/40 sm:text-[11px]">
                    {t.estFdv}
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
              className="rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-3 text-sm font-semibold text-white/75 transition hover:border-cyan-300/35 hover:text-white"
            >
              {t.pickTemplate}
            </button>

            <button
              onClick={downloadCard}
              disabled={isDownloading}
              className="rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-3 text-sm font-semibold text-white/75 transition hover:border-indigo-300/35 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isDownloading ? t.downloading : t.downloadCard}
            </button>

            <button
              onClick={shareOnX}
              className="rounded-2xl bg-white px-6 py-3 text-sm font-black text-black transition hover:-translate-y-0.5"
            >
              {isDownloading ? t.preparing : t.shareX}
            </button>
          </div>
        </section>
      )}

    

      {tab === "funding" && (
        <section id="funding" className="scroll-mt-24 mx-auto mt-14 max-w-[1750px] space-y-8 px-4 sm:px-6">
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035] p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/55">
                  {t.fundingEyebrow}
                </div>

                <h2 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
                  {t.fundingTitle}
                </h2>

                <p className="mt-2 text-sm text-white/50">
                  {t.fundingBody}
                </p>

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <div className="inline-flex rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-emerald-300/80">
                    Auto-refresh in: {refreshCountdown}s
                  </div>

                  {fundingUpdatedAt && (
                    <div className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-cyan-300/80">
                      {t.updated}: {fundingUpdatedAt}
                    </div>
                  )}

                  {fundingStale && (
                    <div className="inline-flex rounded-full border border-yellow-400/20 bg-yellow-400/10 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-yellow-200/80">
                      {t.cached}
                    </div>
                  )}

                  <div className="inline-flex rounded-full border border-neutral-700 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-white/60">
                    {t.view}: {fundingMetricMode === "interval" ? t.perInterval : t.annualized}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => void shareFundingView()}
                  className="rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3 text-sm text-white/70 transition hover:border-cyan-300/30 hover:text-cyan-100"
                >
                  {fundingShareCopied ? "Copied view" : "Share view"}
                </button>

                <button
                  onClick={() => void loadFunding(false)}
                  disabled={fundingLoading}
                  className="rounded-2xl border border-cyan-300/30 bg-cyan-300/10 px-4 py-3 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-300 hover:text-slate-950 disabled:cursor-wait disabled:opacity-50"
                >
                  {fundingLoading ? t.loadingFunding : t.refreshNow}
                </button>

                <button
                  onClick={resetFundingFilters}
                  className="rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3 text-sm text-white/70 transition hover:border-white/20 hover:text-white"
                >
                  {t.resetFilters}
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-cyan-300/15 bg-cyan-300/[0.045] p-4 shadow-xl shadow-black/10 backdrop-blur-xl sm:p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-100/60">
                  Quick funding views
                </div>
                <p className="mt-1 text-sm leading-6 text-white/48">
                  Start with a clean preset, then tweak exchanges, spread,
                  watchlist, and row count if you want deeper control.
                </p>
              </div>
              <div className="grid gap-2 sm:grid-cols-4 lg:min-w-[620px]">
                {[
                  ["best", "Best arbs", "Spread >= 0.05%"],
                  ["capy", "Capy routes", "Only venues with your routes"],
                  ["majors", "Majors", "Liquid venues first"],
                  ["all", "All data", "Full Loris dataset"],
                ].map(([view, title, note]) => (
                  <button
                    key={view}
                    type="button"
                    onClick={() =>
                      setFundingQuickView(view as "best" | "capy" | "majors" | "all")
                    }
                    className="rounded-2xl border border-white/10 bg-[#07101d]/70 p-3 text-left transition hover:border-cyan-300/35 hover:bg-cyan-300/[0.08]"
                  >
                    <span className="block text-sm font-black text-white">
                      {title}
                    </span>
                    <span className="mt-1 block text-xs text-white/40">
                      {note}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-[1.2fr_1.2fr_1fr]">
            <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-5 shadow-xl shadow-black/10 backdrop-blur-xl">
              <div className="text-xs uppercase tracking-[0.22em] text-white/40">
                {t.mostPositive}
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

            <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-5 shadow-xl shadow-black/10 backdrop-blur-xl">
              <div className="text-xs uppercase tracking-[0.22em] text-white/40">
                {t.mostNegative}
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

            <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-5 shadow-xl shadow-black/10 backdrop-blur-xl">
              <div className="text-xs uppercase tracking-[0.22em] text-white/40">
                {t.highestSpread}
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

          <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-6 shadow-xl shadow-black/10 backdrop-blur-xl">
            <div className="flex flex-col gap-4">
              <div className="grid gap-4 xl:grid-cols-[1.25fr_1fr_1fr_auto]">
                <div>
                  <label className="mb-2 block text-xs uppercase tracking-[0.22em] text-white/40">
                    {t.searchTicker}
                  </label>
                  <div className="relative">
                    <input
                      value={searchTicker}
                      onChange={(e) => setSearchTicker(e.target.value.toUpperCase())}
                      placeholder="BTC, ETH, SOL, ICP..."
                      className="w-full rounded-2xl border border-white/10 bg-[#07101d] px-4 py-3 pr-11 text-white outline-none transition placeholder:text-white/25 focus:border-cyan-300"
                    />
                    {searchTicker && (
                      <button
                        type="button"
                        onClick={() => setSearchTicker("")}
                        className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-white/35 transition hover:bg-white/[0.06] hover:text-white"
                        aria-label="Clear ticker search"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-xs uppercase tracking-[0.22em] text-white/40">
                    {t.fundingView}
                  </label>
                  <div className="flex rounded-2xl border border-white/10 bg-[#07101d] p-1">
                    <button
                      onClick={() => setFundingMetricMode("interval")}
                      className={`flex-1 rounded-lg px-3 py-2 text-sm transition ${
                        fundingMetricMode === "interval"
                          ? "bg-cyan-300 text-slate-950"
                          : "text-white/60"
                      }`}
                    >
                      {t.perInterval}
                    </button>

                    <button
                      onClick={() => setFundingMetricMode("annualized")}
                      className={`flex-1 rounded-lg px-3 py-2 text-sm transition ${
                        fundingMetricMode === "annualized"
                          ? "bg-indigo-300 text-slate-950"
                          : "text-white/60"
                      }`}
                    >
                      {t.annualized}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-xs uppercase tracking-[0.22em] text-white/40">
                    {t.sort}
                  </label>
                  <div className="grid grid-cols-3 rounded-2xl border border-white/10 bg-[#07101d] p-1">
                    {[
                      ["maxArb", t.maxArb],
                      ["oiRank", t.oiRank],
                      ["symbol", t.symbol],
                    ].map(([key, label]) => (
                      <button
                        key={key}
                        onClick={() => setFundingSortKey(key as FundingSortKey)}
                        className={`rounded-lg px-3 py-2 text-sm transition ${
                          fundingSort.key === key
                            ? "bg-cyan-300 text-slate-950"
                            : "text-white/60"
                        }`}
                      >
                        {label} {sortLabel(key as FundingSortKey)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-end gap-2">
                  <button
                    onClick={() => setOnlyActionable((prev) => !prev)}
                    className={`w-full rounded-xl border px-4 py-3 text-sm font-medium transition ${
                      onlyActionable
                        ? "border-emerald-300/30 bg-emerald-300/10 text-emerald-200"
                        : "border-white/10 bg-white/[0.03] text-white/60"
                    }`}
                  >
                    {onlyActionable ? t.onlyOpps : t.showAllSymbols}
                  </button>
                  <button
                    type="button"
                    onClick={() => setWatchlistOnly((current) => !current)}
                    className={`w-full rounded-xl border px-4 py-3 text-sm font-medium transition ${
                      watchlistOnly
                        ? "border-yellow-300/30 bg-yellow-300/10 text-yellow-100"
                        : "border-white/10 bg-white/[0.03] text-white/60"
                    }`}
                  >
                    Watchlist ({watchedFundingSymbols.length})
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border border-white/8 bg-black/15 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-xs uppercase tracking-[0.22em] text-white/40">
                      {t.exchanges}
                    </div>
                    <div className="mt-1 text-sm text-white/65">
                      {activeFundingExchanges.length} of {fundingExchanges.length} selected
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowExchangePicker((current) => !current)}
                    className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-semibold text-white/70 transition hover:border-cyan-300/30 hover:text-cyan-100"
                    aria-expanded={showExchangePicker}
                  >
                    {showExchangePicker ? "Hide exchange list" : "Choose exchanges"}
                  </button>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    onClick={() =>
                      setEnabledFundingExchanges(
                        fundingExchanges.map((exchange) => exchange.key)
                      )
                    }
                    className="rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-2 text-xs font-medium text-cyan-200 transition hover:bg-cyan-300/15"
                  >
                    {t.selectAll}
                  </button>

                  <button
                    onClick={() =>
                      setEnabledFundingExchanges(
                        fundingExchanges
                          .filter((exchange) => exchange.hasPersonalRef)
                          .map((exchange) => exchange.key)
                      )
                    }
                    className="rounded-full border border-emerald-300/25 bg-emerald-300/10 px-3 py-2 text-xs font-medium text-emerald-200 transition hover:bg-emerald-300/15"
                  >
                    {t.capyRefsOnly}
                  </button>

                  <button
                    onClick={() => {
                      setEnabledFundingExchanges([])
                      setShowExchangePicker(true)
                    }}
                    className="rounded-full border border-red-300/25 bg-red-300/10 px-3 py-2 text-xs font-medium text-red-200 transition hover:bg-red-300/15"
                  >
                    {t.clearAll}
                  </button>

                  {!showExchangePicker &&
                    activeFundingExchanges.slice(0, 6).map((exchange) => (
                      <span
                        key={`selected-${exchange.key}`}
                        className="rounded-full border border-white/10 bg-white/[0.035] px-3 py-2 text-xs text-white/55"
                      >
                        {exchange.label}
                      </span>
                    ))}

                  {!showExchangePicker && activeFundingExchanges.length > 6 && (
                    <span className="rounded-full border border-white/10 px-3 py-2 text-xs text-white/40">
                      +{activeFundingExchanges.length - 6} more
                    </span>
                  )}
                </div>

                {showExchangePicker && (
                  <div className="mt-4 max-h-44 overflow-y-auto rounded-xl border border-white/8 bg-[#07101d]/80 p-3 [scrollbar-color:rgba(34,211,238,0.45)_rgba(255,255,255,0.06)] [scrollbar-width:thin]">
                    <div className="flex flex-wrap gap-2">
                      {fundingExchanges.map((exchange) => {
                        const enabled = enabledFundingExchanges.includes(exchange.key)

                        return (
                          <button
                            key={exchange.key}
                            onClick={() => toggleFundingExchange(exchange.key)}
                            className={`rounded-full border px-3 py-2 text-xs font-medium transition ${
                              enabled
                                ? "border-emerald-400/25 bg-emerald-500/10 text-emerald-300"
                                : "border-neutral-700 text-white/50 hover:border-white/20 hover:text-white/70"
                            }`}
                          >
                            {exchange.label}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-white/8 bg-black/15 p-4">
                <div>
                  <div className="text-xs uppercase tracking-[0.22em] text-white/40">
                    Minimum spread
                  </div>
                  <div className="mt-1 text-sm text-white/55">
                    Hide low-signal opportunities before rendering the table.
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {[0, 0.01, 0.05, 0.1, 0.5].map((spread) => (
                    <button
                      key={spread}
                      type="button"
                      onClick={() => setMinimumFundingSpread(spread)}
                      className={`rounded-xl border px-3 py-2 text-xs font-semibold tabular-nums transition ${
                        minimumFundingSpread === spread
                          ? "border-cyan-300 bg-cyan-300 text-slate-950"
                          : "border-white/10 bg-white/[0.03] text-white/55 hover:border-white/20 hover:text-white"
                      }`}
                    >
                      {spread === 0 ? "Any" : `≥ ${spread}%`}
                    </button>
                  ))}
                </div>

                <div className="mt-4 grid gap-3 border-t border-white/8 pt-4 sm:grid-cols-3">
                  <label>
                    <span className="mb-2 block text-xs uppercase tracking-[0.18em] text-white/35">
                      Capital ($)
                    </span>
                    <input
                      type="number"
                      min="0"
                      value={fundingCapital}
                      onChange={(event) =>
                        setFundingCapital(Math.max(Number(event.target.value), 0))
                      }
                      className="w-full rounded-xl border border-white/10 bg-[#07101d] px-3 py-2 text-sm text-white outline-none focus:border-cyan-300"
                    />
                  </label>
                  <label>
                    <span className="mb-2 block text-xs uppercase tracking-[0.18em] text-white/35">
                      Funding intervals
                    </span>
                    <input
                      type="number"
                      min="1"
                      max="365"
                      value={fundingHoldingPeriods}
                      onChange={(event) =>
                        setFundingHoldingPeriods(
                          Math.min(Math.max(Number(event.target.value), 1), 365)
                        )
                      }
                      className="w-full rounded-xl border border-white/10 bg-[#07101d] px-3 py-2 text-sm text-white outline-none focus:border-cyan-300"
                    />
                  </label>
                  <label>
                    <span className="mb-2 block text-xs uppercase tracking-[0.18em] text-white/35">
                      Total trading fees (%)
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={fundingFeePercent}
                      onChange={(event) =>
                        setFundingFeePercent(
                          Math.max(Number(event.target.value), 0)
                        )
                      }
                      className="w-full rounded-xl border border-white/10 bg-[#07101d] px-3 py-2 text-sm text-white outline-none focus:border-cyan-300"
                    />
                  </label>
                </div>

                <p className="mt-3 text-xs leading-5 text-white/30">
                  Net estimate = capital × (spread × intervals − total fees).
                  Slippage, borrow costs, execution risk, and changing rates are
                  not included.
                  {fundingMetricMode === "annualized" &&
                    " Switch to Per interval to display net estimates."}
                </p>
              </div>

              <div>
                <div className="mb-2 text-xs uppercase tracking-[0.22em] text-white/40">
                  {t.renderRows}
                </div>

                <div className="flex flex-wrap gap-2">
                  {([100, 250, 500, "all"] as const).map((limit) => (
                    <button
                      key={limit}
                      onClick={() => setFundingRowLimit(limit)}
                      className={`rounded-full border px-3 py-2 text-xs font-medium transition ${
                        fundingRowLimit === limit
                          ? "border-cyan-300/25 bg-cyan-300/10 text-cyan-200"
                          : "border-white/10 text-white/50 hover:text-white"
                      }`}
                    >
                      {limit === "all" ? t.allRows : `Top ${limit}`}
                    </button>
                  ))}
                </div>
              </div>

              <div className="text-xs leading-5 text-white/30">
                {t.defaultRows}
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-4 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-6">
            {!fundingLoading && !fundingError && (
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-white">
                    {fundingMatrixRows.length} opportunities
                  </div>
                  <div className="mt-1 text-xs text-white/40">
                    {activeFundingExchanges.length} exchanges
                    {minimumFundingSpread > 0
                      ? ` · spread ≥ ${minimumFundingSpread}%`
                      : ""}
                    {searchTicker ? ` · ticker: ${searchTicker}` : ""}
                  </div>
                </div>

                <div className="text-xs text-white/35">
                  Click a ticker to copy · click a rate to open the venue
                </div>
              </div>
            )}

            {fundingLoading && (
              <div className="rounded-2xl border border-neutral-800 bg-black/20 p-6 text-white/60">
                {t.loadingFunding}
              </div>
            )}

            {fundingError && (
              <div className="rounded-2xl border border-red-400/20 bg-red-400/10 p-6 text-red-300">
                {fundingError}
              </div>
            )}

            {!fundingLoading && !fundingError && (
              <div className="relative overflow-hidden rounded-2xl border border-neutral-800">
                <div className="pointer-events-none absolute bottom-0 left-0 top-0 z-50 w-8 bg-gradient-to-r from-[#0b111d] to-transparent" />
                <div className="pointer-events-none absolute bottom-0 right-0 top-0 z-50 w-10 bg-gradient-to-l from-[#0b111d] to-transparent" />
                <div
                  ref={fundingTopScrollRef}
                  onScroll={() => syncFundingScroll("top")}
                  className="overflow-x-auto overflow-y-hidden border-b border-neutral-800 bg-[#0b111d] [scrollbar-color:rgba(34,211,238,0.7)_rgba(255,255,255,0.08)] [scrollbar-width:thin]"
                  aria-label="Funding table horizontal scroll"
                >
                  <div style={{ width: fundingTableMinWidth, height: 14 }} />
                </div>
                <div
                  ref={fundingTableScrollRef}
                  onScroll={() => syncFundingScroll("table")}
                  className="max-h-[72vh] overflow-auto overscroll-contain [scrollbar-color:rgba(34,211,238,0.45)_rgba(255,255,255,0.06)] [scrollbar-width:thin]"
                >
  <table
    className="min-w-full border-separate border-spacing-0"
    style={{ minWidth: fundingTableMinWidth }}
  >
                  <thead>
                    <tr className="text-left">
                      <th className="sticky left-0 top-0 z-40 w-[96px] border-b border-r border-neutral-800 bg-[#0b111d] px-3 py-3 text-xs uppercase tracking-[0.18em] text-white/40">
  <button
    onClick={() => setFundingSortKey("symbol")}
    className="text-left transition hover:text-cyan-200"
  >
    {t.symbol} {sortLabel("symbol")}
  </button>
</th>

<th className="sticky top-0 z-30 w-[76px] border-b border-r border-neutral-800 bg-[#0b111d] px-3 py-3 text-xs uppercase tracking-[0.18em] text-white/40 md:left-[96px] md:z-40">
  <button
    onClick={() => setFundingSortKey("oiRank")}
    className="text-left transition hover:text-cyan-200"
  >
    {t.oiRank} {sortLabel("oiRank")}
  </button>
</th>

<th className="sticky top-0 z-30 w-[96px] border-b border-r border-neutral-800 bg-[#0b111d] px-3 py-3 text-xs uppercase tracking-[0.18em] text-white/40 md:left-[172px] md:z-40">
  <button
    onClick={() => setFundingSortKey("maxArb")}
    className="text-left transition hover:text-cyan-200"
  >
    {t.maxArb} {sortLabel("maxArb")}
  </button>
</th>

<th className="sticky top-0 z-30 w-[220px] border-b border-r border-neutral-800 bg-[#0b111d] px-3 py-3 text-xs uppercase tracking-[0.18em] text-white/40 md:left-[268px] md:z-40">
  {t.action}
</th>

                      {activeFundingExchanges.map((exchange) => (
  <th
    key={exchange.key}
    className="sticky top-0 z-30 w-[166px] min-w-[166px] border-b border-r border-neutral-800 bg-[#0b111d] px-3 py-3 text-center last:border-r-0"
  >
    <a
      href={exchange.tradeUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="block truncate text-[11px] font-semibold uppercase tracking-[0.18em] text-white/70 transition hover:text-cyan-300"
    >
      {exchange.label}
    </a>
  </th>
))}
                    </tr>
                  </thead>

                  <tbody>
                    {renderedFundingRows.map((row) => (
                      <tr key={row.symbol} className="hover:bg-white/[0.02]">
                        <td className="sticky left-0 z-20 w-[96px] border-b border-r border-neutral-800 bg-[#0b111d] px-3 py-4 text-sm font-semibold text-white">
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => toggleFundingWatch(row.symbol)}
                              className={`text-sm transition ${
                                watchedFundingSymbols.includes(row.symbol)
                                  ? "text-yellow-300"
                                  : "text-white/25 hover:text-yellow-200"
                              }`}
                              title={
                                watchedFundingSymbols.includes(row.symbol)
                                  ? "Remove from watchlist"
                                  : "Add to watchlist"
                              }
                              aria-label={
                                watchedFundingSymbols.includes(row.symbol)
                                  ? `Remove ${row.symbol} from watchlist`
                                  : `Add ${row.symbol} to watchlist`
                              }
                            >
                              {watchedFundingSymbols.includes(row.symbol)
                                ? "★"
                                : "☆"}
                            </button>
                            <button
                              onClick={() => void copyTickerValue(row.symbol)}
                              className="min-w-0 truncate transition hover:text-cyan-300"
                              title="Click to copy ticker"
                            >
                              {copiedTicker === row.symbol ? "Copied" : row.symbol}
                            </button>
                          </div>
                        </td>

                        <td className="w-[76px] border-b border-r border-neutral-800 bg-[#0b111d] px-3 py-4 text-sm text-white/80 md:sticky md:left-[96px] md:z-20">
                          {row.oiRank}
                        </td>

                        <td className="w-[96px] border-b border-r border-neutral-800 bg-[#0b111d] px-3 py-4 text-sm md:sticky md:left-[172px] md:z-20">
                          <span className="inline-flex rounded-full border border-cyan-400/25 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-300">
                            {formatSpreadValue(row.maxArb)}
                          </span>
                          {row.estimatedNetUsd !== null && (
                            <div
                              className={`mt-2 text-[10px] font-semibold tabular-nums ${
                                row.estimatedNetUsd >= 0
                                  ? "text-emerald-300"
                                  : "text-red-300"
                              }`}
                              title={`${row.netReturnPct?.toFixed(4)}% estimated net return`}
                            >
                              ~{formatMoney(row.estimatedNetUsd, 0)} net
                            </div>
                          )}
                        </td>

                        <td className="w-[220px] border-b border-r border-neutral-800 bg-[#0b111d] px-3 py-4 md:sticky md:left-[268px] md:z-20 md:shadow-[18px_0_24px_rgba(5,8,20,0.25)]">
                          {row.buyExchange && row.sellExchange ? (
                            <div className="flex flex-wrap gap-2">
                              <a
                                href={
                                  fundingExchangeByKey.get(row.buyExchange.key)
                                    ?.tradeUrl ?? "#"
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center rounded-full border border-emerald-400/25 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-500/15"
                              >
                                BUY {row.buyExchange.label}
                              </a>

                              <a
                                href={
                                  fundingExchangeByKey.get(row.sellExchange.key)
                                    ?.tradeUrl ?? "#"
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center rounded-full border border-red-400/25 bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-300 transition hover:bg-red-500/15"
                              >
                                SELL {row.sellExchange.label}
                              </a>
                            </div>
                          ) : (
                            <span className="text-xs text-white/35">{t.noTradeRoute}</span>
                          )}
                        </td>

                        {activeFundingExchanges.map((exchange) => {
                          const value = row.byExchange[exchange.key]

                          return (
                            <td
                              key={`${row.symbol}-${exchange.key}`}
                              className={`w-[166px] min-w-[166px] whitespace-nowrap border-b border-r border-neutral-800 px-3 py-4 text-center text-sm font-bold tabular-nums last:border-r-0 ${getFundingCellClass(
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
                          {t.noRows}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
                </div>
              </div>
            )}

            {!fundingLoading && !fundingError && hiddenFundingRows > 0 && (
              <div className="mt-4 flex justify-center">
                <button
                  onClick={() =>
                    setFundingRowLimit((prev) =>
                      prev === "all"
                        ? "all"
                        : prev === 100
                          ? 250
                          : prev === 250
                            ? 500
                            : "all"
                    )
                  }
                  className="rounded-2xl border border-cyan-300/25 bg-cyan-300/10 px-5 py-3 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-300 hover:text-slate-950"
                >
                  {t.showMore} ({hiddenFundingRows} {t.hidden})
                </button>
              </div>
            )}

            <div className="mt-6 flex flex-wrap items-center gap-3 text-xs text-white/35">
  <span>
    {t.showing}:{" "}
    <span className="text-white/60">
      {renderedFundingRows.length}/{fundingMatrixRows.length}
    </span>
  </span>

  <span>
    {t.activeExchanges}:{" "}
    <span className="text-white/60">{activeFundingExchanges.length}</span>
  </span>

  <span>
    {t.dataBy}{" "}
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

      <footer className="mx-auto mt-16 max-w-6xl px-4 pb-10 sm:px-6">
        <div className="grid gap-6 rounded-3xl border border-white/10 bg-white/[0.035] p-6 md:grid-cols-[1.2fr_0.8fr] md:p-8">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/55">
              Data and trust
            </div>
            <h2 className="mt-3 text-2xl font-black text-white">
              Clear assumptions. Visible referral terms.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/50">
              Funding and market data refresh from live sources. Referral terms
              are displayed openly, and calculator defaults stay editable
              research scenarios, not official token prices or financial advice.
            </p>
          </div>
          <nav className="grid grid-cols-2 gap-2 self-end text-sm">
            <Link href="/markets" className="rounded-xl border border-white/10 bg-white/[0.035] px-4 py-3 text-white/70 transition hover:border-cyan-300/35 hover:bg-cyan-300/[0.08] hover:text-cyan-100">
              Market terminal
            </Link>
            <Link href="/perp-dex-list" className="rounded-xl border border-white/10 bg-white/[0.035] px-4 py-3 text-white/70 transition hover:border-cyan-300/35 hover:bg-cyan-300/[0.08] hover:text-cyan-100">
              Perp DEX list
            </Link>
            <Link href="/tools" className="rounded-xl border border-white/10 bg-white/[0.035] px-4 py-3 text-white/70 transition hover:border-cyan-300/35 hover:bg-cyan-300/[0.08] hover:text-cyan-100">
              Farming tools
            </Link>
            <Link href="/methodology" className="rounded-xl border border-white/10 bg-white/[0.035] px-4 py-3 text-white/70 transition hover:border-cyan-300/35 hover:bg-cyan-300/[0.08] hover:text-cyan-100">
              Methodology
            </Link>
            <Link href="/partners" className="rounded-xl border border-white/10 bg-white/[0.035] px-4 py-3 text-white/70 transition hover:border-cyan-300/35 hover:bg-cyan-300/[0.08] hover:text-cyan-100">
              List or update a perp
            </Link>
            <Link href="/airdrops" className="rounded-xl border border-white/10 bg-white/[0.035] px-4 py-3 text-white/70 transition hover:border-cyan-300/35 hover:bg-cyan-300/[0.08] hover:text-cyan-100">
              Airdrop campaigns
            </Link>
            <Link href="/calculators" className="rounded-xl border border-white/10 bg-white/[0.035] px-4 py-3 text-white/70 transition hover:border-cyan-300/35 hover:bg-cyan-300/[0.08] hover:text-cyan-100">
              All calculators
            </Link>
            <Link href="/compare" className="rounded-xl border border-white/10 bg-white/[0.035] px-4 py-3 text-white/70 transition hover:border-cyan-300/35 hover:bg-cyan-300/[0.08] hover:text-cyan-100">
              Compare perps
            </Link>
            <Link href="/updates" className="rounded-xl border border-white/10 bg-white/[0.035] px-4 py-3 text-white/70 transition hover:border-cyan-300/35 hover:bg-cyan-300/[0.08] hover:text-cyan-100">
              Research updates
            </Link>
          </nav>
        </div>
      </footer>

      {templatePicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur">
          <div className="max-h-[85vh] w-full max-w-5xl overflow-y-auto rounded-2xl border border-neutral-800 bg-[#0c1220] p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg">{t.chooseBackground}</h3>

              <button
                onClick={() => setTemplatePicker(false)}
                className="opacity-60 transition hover:opacity-100"
              >
                ×
              </button>
            </div>

            <label className="mb-5 flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-cyan-300/30 bg-cyan-300/10 p-6 text-center transition hover:bg-cyan-300/15">
              <span className="text-sm font-semibold text-cyan-100">
                {t.uploadTemplate}
              </span>
              <span className="mt-1 text-xs text-white/45">
                {t.uploadNote}
              </span>
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(event) => uploadCustomTemplate(event.target.files?.[0])}
              />
            </label>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {TEMPLATES.map((template) => (
                <button
                  key={template}
                  onClick={() => {
                    setSelectedTemplate(template)
                    setCustomTemplate(null)
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


