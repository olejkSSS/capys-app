import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { PERPS, SITE_URL } from "../data/perps"

export const metadata: Metadata = {
  title: "Perp DEX: рейтинги, аирдропы и калькуляторы",
  description:
    "Русскоязычный хаб по perp DEX: объёмы и open interest, funding rates, поинт-кампании, реферальные бонусы и калькуляторы аирдропов.",
  alternates: {
    canonical: "/ru",
    languages: {
      "en-US": "/",
      "ru-RU": "/ru",
      "zh-CN": "/zh",
    },
  },
  openGraph: {
    title: "Capys.app — инструменты для Perp DEX",
    description:
      "Рейтинги perp DEX, поинт-кампании, funding screener и калькуляторы потенциальных аирдропов.",
    url: `${SITE_URL}/ru`,
    siteName: "Capys.app",
    locale: "ru_RU",
    type: "website",
    images: ["/opengraph-image"],
  },
}

const sections = [
  {
    href: "/markets",
    title: "Рынок Perp DEX",
    body: "Рейтинг протоколов по open interest и объёмам, фильтры по сетям и персональный watchlist.",
  },
  {
    href: "/airdrops",
    title: "Поинты и аирдропы",
    body: "Актуальные механики фарминга, доступные бусты, скидки на комиссии и подробные гайды.",
  },
  {
    href: "/tools/farming-cost-calculator",
    title: "Стоимость фарминга",
    body: "Расчёт комиссий, рефбека, стоимости одного поинта и цены безубыточности.",
  },
  {
    href: "/#funding",
    title: "Funding Screener",
    body: "Поиск funding spread между биржами с учётом комиссий и быстрыми торговыми маршрутами.",
  },
]

export default function RussianLandingPage() {
  return (
    <main className="capys-page min-h-screen px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <nav className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3">
          <Link href="/" className="flex items-center gap-3">
            <span className="relative h-10 w-10 overflow-hidden rounded-xl border border-cyan-300/25">
              <Image src="/icon.png" alt="Capys.app" fill sizes="40px" />
            </span>
            <span className="text-sm font-semibold tracking-[0.24em]">CAPYS</span>
          </Link>
          <Link
            href="/zh"
            className="rounded-xl border border-white/10 px-4 py-2 text-sm text-white/60"
          >
            中文
          </Link>
        </nav>

        <header className="py-14 sm:py-20">
          <div className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/60">
            Perp DEX терминал
          </div>
          <h1 className="mt-4 max-w-5xl text-5xl font-black leading-[0.96] tracking-tight sm:text-7xl">
            Всё необходимое для анализа и фарминга Perp DEX.
          </h1>
          <p className="mt-6 max-w-3xl text-base leading-7 text-white/60 sm:text-lg">
            Сравнивайте объёмы, open interest, funding rates, поинт-кампании,
            комиссии и реферальные условия. Рассчитывайте потенциальную
            стоимость аирдропа до того, как тратить деньги на фарминг.
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
                Открыть →
              </div>
            </Link>
          ))}
        </section>

        <section className="mt-10 rounded-3xl border border-white/10 bg-white/[0.025] p-6">
          <h2 className="text-2xl font-black">Отслеживаемые perp-маршруты</h2>
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
