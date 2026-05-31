import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";

export const metadata: Metadata = {
  metadataBase: new URL("https://capys.app"),
  title: {
    default: "Capys.app | Perp DEX Farming Hub",
    template: "%s | Capys.app",
  },
  description:
    "Crypto-native perp DEX farming hub with referral boosts, airdrop calculators, tier lists, and live funding rate opportunities.",
  keywords: [
    "perp dex",
    "airdrop calculator",
    "funding rates",
    "crypto referrals",
    "perp farming",
    "Capy",
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
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Capys.app | Perp DEX Farming Hub",
    description:
      "Perp DEX referral boosts, airdrop calculators, tier lists, and live funding rates.",
    creator: "@capy_onchain",
  },
  alternates: {
    canonical: "/",
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
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
