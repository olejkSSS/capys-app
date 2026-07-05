import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { PERPS, SITE_URL } from "../data/perps"

export const metadata: Metadata = {
  title: "永续合约 DEX 排名、积分活动与空投工具",
  description:
    "永续合约 DEX 数据中心：交易量、未平仓合约、资金费率、积分活动、推荐奖励和空投估值工具。",
  alternates: {
    canonical: "/zh",
    languages: {
      "en-US": "/",
      "ru-RU": "/ru",
      "zh-CN": "/zh",
    },
  },
  openGraph: {
    title: "Capys.app — 永续合约 DEX 数据与工具",
    description:
      "查看 Perp DEX 排名、积分活动、资金费率和空投估值工具。",
    url: `${SITE_URL}/zh`,
    siteName: "Capys.app",
    locale: "zh_CN",
    type: "website",
    images: ["/opengraph-image"],
  },
}

const sections = [
  {
    href: "/markets",
    title: "Perp DEX 市场排名",
    body: "按未平仓合约和交易量比较协议，筛选区块链并保存关注列表。",
  },
  {
    href: "/airdrops",
    title: "积分与空投活动",
    body: "查看积分机制、推荐奖励、手续费折扣和每个协议的研究指南。",
  },
  {
    href: "/tools/farming-cost-calculator",
    title: "积分耕作成本计算器",
    body: "计算手续费、返佣、每积分成本以及达到盈亏平衡所需的积分价格。",
  },
  {
    href: "/#funding",
    title: "资金费率扫描器",
    body: "寻找跨交易所资金费率差，并在估算中加入交易手续费。",
  },
]

export default function ChineseLandingPage() {
  return (
    <main className="min-h-screen bg-[#050814] px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <nav className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3">
          <Link href="/" className="flex items-center gap-3">
            <span className="relative h-10 w-10 overflow-hidden rounded-xl border border-cyan-300/25">
              <Image src="/icon.png" alt="Capys.app" fill sizes="40px" />
            </span>
            <span className="text-sm font-semibold tracking-[0.24em]">CAPYS</span>
          </Link>
          <Link
            href="/ru"
            className="rounded-xl border border-white/10 px-4 py-2 text-sm text-white/60"
          >
            Русский
          </Link>
        </nav>

        <header className="py-14 sm:py-20">
          <div className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/60">
            Perp DEX 数据终端
          </div>
          <h1 className="mt-4 max-w-5xl text-5xl font-black leading-[0.96] tracking-tight sm:text-7xl">
            一个页面查看永续合约 DEX 的数据、积分与工具。
          </h1>
          <p className="mt-6 max-w-3xl text-base leading-7 text-white/60 sm:text-lg">
            比较交易量、未平仓合约、资金费率、积分活动、手续费和推荐奖励。在投入资金之前，先估算积分耕作成本与潜在空投价值。
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-2">
          {sections.map((section) => (
            <Link
              key={section.href}
              href={section.href}
              className="rounded-3xl border border-white/10 bg-white/[0.035] p-6 transition hover:border-cyan-300/35 hover:bg-white/[0.06]"
            >
              <h2 className="text-2xl font-black">{section.title}</h2>
              <p className="mt-3 text-sm leading-6 text-white/52">{section.body}</p>
              <div className="mt-5 text-sm font-semibold text-cyan-200">
                打开工具 →
              </div>
            </Link>
          ))}
        </section>

        <section className="mt-10 rounded-3xl border border-white/10 bg-white/[0.025] p-6">
          <h2 className="text-2xl font-black">当前跟踪的 Perp 路线</h2>
          <div className="mt-5 flex flex-wrap gap-2">
            {PERPS.map((perp) => (
              <Link
                key={perp.slug}
                href={`/perps/${perp.slug}`}
                className="rounded-full border border-white/10 px-4 py-2 text-sm text-white/60 transition hover:border-cyan-300/30 hover:text-cyan-100"
              >
                {perp.name}: {perp.boost}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
