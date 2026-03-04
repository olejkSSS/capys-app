import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Capy Perp Hub",
  description: "Perp DEX farming tools, tier list and calculators",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
  className={`${geistSans.variable} ${geistMono.variable} antialiased relative min-h-screen bg-[#020617] text-white overflow-x-hidden`}
>

  {/* animated background */}
  <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">

    <div className="absolute top-[-200px] left-[-200px] w-[500px] h-[500px] bg-purple-600/20 blur-[120px] rounded-full animate-blob"></div>

    <div className="absolute bottom-[-200px] right-[-200px] w-[500px] h-[500px] bg-cyan-500/20 blur-[120px] rounded-full animate-blob animation-delay-2000"></div>

    <div className="absolute top-[40%] left-[60%] w-[400px] h-[400px] bg-pink-500/20 blur-[120px] rounded-full animate-blob animation-delay-4000"></div>

  </div>

  {children}

</body>
    </html>
  );
}
