import Image from "next/image"
import Link from "next/link"

type ToolHeaderProps = {
  label: string
}

export default function ToolHeader({ label }: ToolHeaderProps) {
  return (
    <nav className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3">
      <Link href="/" className="flex items-center gap-3">
        <span className="relative h-10 w-10 overflow-hidden rounded-xl border border-cyan-300/25">
          <Image src="/icon.png" alt="Capys.app" fill sizes="40px" />
        </span>
        <span>
          <span className="block text-sm font-semibold tracking-[0.24em]">
            CAPYS
          </span>
          <span className="block text-xs text-white/45">{label}</span>
        </span>
      </Link>

      <div className="flex flex-wrap gap-2">
        <Link
          href="/"
          className="rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold text-white/70 transition hover:border-cyan-300/30 hover:text-white"
        >
          &larr; Home
        </Link>
        <Link
          href="/markets"
          className="rounded-xl border border-white/10 px-4 py-2 text-sm text-white/60 transition hover:text-white"
        >
          Markets
        </Link>
        <Link
          href="/tools"
          className="rounded-xl border border-cyan-300/25 bg-cyan-300/10 px-4 py-2 text-sm font-semibold text-cyan-100"
        >
          Tools
        </Link>
      </div>
    </nav>
  )
}
