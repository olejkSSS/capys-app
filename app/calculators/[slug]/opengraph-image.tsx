import { ImageResponse } from "next/og"
import { PERPS_CALC } from "../../data/perps"

export const size = {
  width: 1200,
  height: 630,
}

export const contentType = "image/png"

type Props = {
  params: Promise<{
    slug: string
  }>
}

export function generateStaticParams() {
  return Object.keys(PERPS_CALC).map((slug) => ({
    slug: `${slug}-point-calculator`,
  }))
}

export default async function Image({ params }: Props) {
  const { slug } = await params
  const normalized = slug.replace(/-points?-calculator$/, "")
  const calculator = PERPS_CALC[normalized as keyof typeof PERPS_CALC]
  const name = calculator?.name ?? "Perp"

  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background:
            "radial-gradient(circle at 18% 15%, rgba(34,211,238,0.34), transparent 34%), radial-gradient(circle at 85% 80%, rgba(16,185,129,0.22), transparent 32%), #050814",
          color: "white",
          display: "flex",
          height: "100%",
          justifyContent: "space-between",
          padding: 72,
          width: "100%",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              color: "#67e8f9",
              fontSize: 26,
              fontWeight: 800,
              letterSpacing: 7,
              textTransform: "uppercase",
            }}
          >
            Capys.app
          </div>
          <div
            style={{
              fontSize: 76,
              fontWeight: 900,
              lineHeight: 0.98,
              maxWidth: 820,
            }}
          >
            {`${name} Point Calculator`}
          </div>
          <div
            style={{
              color: "rgba(255,255,255,0.66)",
              fontSize: 29,
              lineHeight: 1.35,
              maxWidth: 780,
            }}
          >
            Model FDV, allocation, total point supply, and your own balance.
          </div>
        </div>

        <div
          style={{
            alignItems: "center",
            border: "1px solid rgba(103,232,249,0.32)",
            borderRadius: 36,
            boxShadow: "0 0 80px rgba(34,211,238,0.2)",
            display: "flex",
            flexDirection: "column",
            gap: 18,
            justifyContent: "center",
            padding: 36,
            width: 285,
          }}
        >
          <div style={{ color: "#67e8f9", fontSize: 56, fontWeight: 900 }}>
            Points
          </div>
          <div style={{ color: "rgba(255,255,255,0.44)", fontSize: 26 }}>×</div>
          <div style={{ fontSize: 42, fontWeight: 900 }}>FDV</div>
          <div style={{ color: "rgba(255,255,255,0.44)", fontSize: 26 }}>÷</div>
          <div style={{ color: "#6ee7b7", fontSize: 36, fontWeight: 900 }}>
            Supply
          </div>
        </div>
      </div>
    ),
    size
  )
}
