import { ImageResponse } from "next/og"

export const size = {
  width: 1200,
  height: 630,
}

export const contentType = "image/png"

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background:
            "radial-gradient(circle at 16% 0%, rgba(121,247,208,0.2), transparent 34%), linear-gradient(135deg, #080b0a 0%, #070a09 52%, #060807 100%)",
          color: "white",
          display: "flex",
          height: "100%",
          justifyContent: "space-between",
          padding: 76,
          width: "100%",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
          <div
            style={{
              color: "#67e8f9",
              fontSize: 28,
              fontWeight: 800,
              letterSpacing: 8,
              textTransform: "uppercase",
            }}
          >
            Capys.app
          </div>
          <div
            style={{
              fontSize: 78,
              fontWeight: 900,
              letterSpacing: -3,
              lineHeight: 0.96,
              maxWidth: 760,
            }}
          >
            Perp DEX farming hub
          </div>
          <div
            style={{
              color: "rgba(255,255,255,0.68)",
              fontSize: 30,
              lineHeight: 1.35,
              maxWidth: 760,
            }}
          >
            Referral boosts, airdrop calculators, and live funding rate spreads
            in one crypto-native dashboard.
          </div>
        </div>

        <div
          style={{
            alignItems: "center",
            border: "1px solid rgba(103,232,249,0.32)",
            borderRadius: 42,
            boxShadow: "0 0 70px rgba(34,211,238,0.22)",
            display: "flex",
            flexDirection: "column",
            gap: 18,
            height: 300,
            justifyContent: "center",
            width: 300,
          }}
        >
          <div style={{ color: "#67e8f9", fontSize: 104, fontWeight: 950 }}>
            C
          </div>
          <div
            style={{
              color: "rgba(255,255,255,0.72)",
              fontSize: 24,
              fontWeight: 800,
              letterSpacing: 5,
              textTransform: "uppercase",
            }}
          >
            Ref alpha
          </div>
        </div>
      </div>
    ),
    size
  )
}
