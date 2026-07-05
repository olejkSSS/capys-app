import type { Metadata } from "next"
import ToolHeader from "../../components/ToolHeader"
import { SITE_URL } from "../../data/perps"
import RouteFinderClient from "./RouteFinderClient"

export const metadata: Metadata = {
  title: "Best Perp DEX to Farm: Route Finder",
  description:
    "Find perp DEX farming routes that fit your capital, activity level, and goal: points, fee discounts, deposits, or private access.",
  alternates: {
    canonical: "/tools/route-finder",
  },
  openGraph: {
    title: "Where Should I Farm? | Capys.app",
    description:
      "Match your capital, effort, and goal to practical perp DEX farming routes.",
    url: `${SITE_URL}/tools/route-finder`,
    siteName: "Capys.app",
    type: "website",
    images: ["/opengraph-image"],
  },
}

export default function RouteFinderPage() {
  return (
    <main className="min-h-screen bg-[#050814] px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <ToolHeader label="Perp route finder" />
        <header className="py-12 sm:py-16">
          <div className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/60">
            Personalized shortlist
          </div>
          <h1 className="mt-4 max-w-5xl text-5xl font-black leading-[0.96] tracking-tight sm:text-7xl">
            Where should you farm next?
          </h1>
          <p className="mt-6 max-w-3xl text-base leading-7 text-white/60 sm:text-lg">
            Select your capital, preferred effort, and primary goal. Capys will
            narrow the board to routes whose mechanics fit that profile.
          </p>
        </header>
        <RouteFinderClient />
      </div>
    </main>
  )
}
