import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Capy Perp Hub",
  description: "Perp DEX farming tools, tier list and calculators",
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
  {children}
  <Analytics />
</body>
    </html>
  );
* {
  box-sizing: border-box;
}

html, body {
  max-width: 100%;
  overflow-x: hidden;
}

img {
  max-width: 100%;
  height: auto;
}

/* smooth scroll */
html {
  scroll-behavior: smooth;
}

/* prettier scrollbar */

::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #070b14;
}

::-webkit-scrollbar-thumb {
  background: rgba(34,211,238,0.4);
  border-radius: 10px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(34,211,238,0.7);
}