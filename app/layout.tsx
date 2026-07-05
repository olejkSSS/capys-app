import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
import { SEO_PROTOCOL_KEYWORDS } from "./data/perps";

export const metadata: Metadata = {
  metadataBase: new URL("https://capys.app"),
  applicationName: "Capys.app",
  category: "finance",
  title: {
    default: "Capys.app | Perp DEX Farming Hub",
    template: "%s | Capys.app",
  },
  description:
    "Crypto-native perp DEX farming hub with referral boosts, airdrop calculators, tier lists, and live funding rate opportunities for Variational, TxFlow, RiseX, Hibachi, Bulk, Extended, Pacifica, Meridian, Reya and more.",
  keywords: [
    "perp dex",
    "airdrop calculator",
    "perp points calculator",
    "funding rates",
    "funding rate arbitrage",
    "perp dex rankings",
    "perp dex volume",
    "perp dex open interest",
    "perp farming cost calculator",
    "best perp dex to farm",
    "compare perp dexes",
    "crypto referrals",
    "referral code",
    "best perp referral",
    "maximum referral bonus",
    "perp farming",
    "bulk trade referral",
    "bulk deposit points",
    "bulk trade points campaign",
    "Capy",
    ...SEO_PROTOCOL_KEYWORDS,
  ],
  authors: [{ name: "Capy", url: "https://x.com/capy_onchain" }],
  creator: "Capy",
  publisher: "Capys.app",
  openGraph: {
    title: "Capys.app | Perp DEX Farming Hub",
    description:
      "Compare perp DEX boosts, estimate airdrops, and scan funding rate opportunities in one crypto-native dashboard.",
    url: "https://capys.app",
    siteName: "Capys.app",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Capys.app perp DEX farming hub",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Capys.app | Perp DEX Farming Hub",
    description:
      "Perp DEX referral boosts, airdrop calculators, tier lists, and live funding rates.",
    creator: "@capy_onchain",
    images: ["/opengraph-image"],
  },
  alternates: {
    canonical: "/",
    languages: {
      "en-US": "/",
      "ru-RU": "/ru",
      "zh-CN": "/zh",
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#050814",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://capys.app/#organization",
        name: "Capys.app",
        url: "https://capys.app",
        logo: "https://capys.app/icon.png",
        sameAs: ["https://x.com/capy_onchain"],
      },
      {
        "@type": "WebSite",
        "@id": "https://capys.app/#website",
        name: "Capys.app",
        url: "https://capys.app",
        publisher: {
          "@id": "https://capys.app/#organization",
        },
        inLanguage: "en",
      },
    ],
  }

  return (
    <html lang="en">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
