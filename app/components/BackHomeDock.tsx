"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"

export default function BackHomeDock() {
  const pathname = usePathname()

  if (pathname === "/") return null

  return (
    <Link
      href="/"
      aria-label="Back to Capys.app home"
      className="fixed bottom-4 left-4 z-[80] flex items-center gap-2 rounded-xl border border-cyan-300/25 bg-[#07101d]/92 px-3 py-2 text-xs font-bold text-white shadow-2xl shadow-black/40 backdrop-blur-xl transition hover:border-cyan-300/45 hover:bg-[#0b1928] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
    >
      <span className="relative h-7 w-7 overflow-hidden rounded-lg border border-white/10">
        <Image src="/icon.png" alt="" fill sizes="28px" />
      </span>
      <span aria-hidden="true">&larr;</span>
      <span>Capys home</span>
    </Link>
  )
}
