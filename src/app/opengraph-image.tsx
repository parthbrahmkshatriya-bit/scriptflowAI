import { ImageResponse } from "next/og"

export const runtime = "edge"
export const alt = "ScriptFlow AI — AI Video Script Generator"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

const tools = [
  { name: "VEO 3", color: "#93C5FD", border: "rgba(59,130,246,0.45)", bg: "rgba(59,130,246,0.14)" },
  { name: "Kling 2.0", color: "#FDB07C", border: "rgba(249,115,22,0.45)", bg: "rgba(249,115,22,0.14)" },
  { name: "Runway", color: "#C084FC", border: "rgba(168,85,247,0.45)", bg: "rgba(168,85,247,0.14)" },
  { name: "Pika 2.0", color: "#F9A8D4", border: "rgba(236,72,153,0.45)", bg: "rgba(236,72,153,0.14)" },
  { name: "Midjourney", color: "#6EE7B7", border: "rgba(16,185,129,0.45)", bg: "rgba(16,185,129,0.14)" },
]

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#050508",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "60px 80px",
          position: "relative",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        {/* Purple radial glow top-right */}
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: 560,
            height: 560,
            borderRadius: "50%",
            background:
              "radial-gradient(circle at center, rgba(139,92,246,0.28) 0%, transparent 70%)",
          }}
        />
        {/* Blue radial glow bottom-left */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            width: 480,
            height: 480,
            borderRadius: "50%",
            background:
              "radial-gradient(circle at center, rgba(59,130,246,0.2) 0%, transparent 70%)",
          }}
        />

        {/* Logo row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            marginBottom: 32,
          }}
        >
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 14,
              background: "linear-gradient(135deg, #7C3AED 0%, #2563EB 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 26,
            }}
          >
            ✨
          </div>
          <span
            style={{ fontSize: 30, fontWeight: 700, color: "rgba(255,255,255,0.95)" }}
          >
            ScriptFlow AI
          </span>
        </div>

        {/* Headline */}
        <div
          style={{
            fontSize: 62,
            fontWeight: 800,
            color: "white",
            textAlign: "center",
            lineHeight: 1.12,
            marginBottom: 18,
            maxWidth: 900,
          }}
        >
          AI Video Script Generator
        </div>

        {/* Subheadline */}
        <div
          style={{
            fontSize: 26,
            color: "rgba(161,161,170,1)",
            textAlign: "center",
            marginBottom: 52,
            maxWidth: 740,
            lineHeight: 1.4,
          }}
        >
          Turn any idea into a production-ready script in{" "}
          <span style={{ color: "#A78BFA" }}>10 seconds</span>
        </div>

        {/* Tool badges */}
        <div style={{ display: "flex", gap: 12 }}>
          {tools.map((tool) => (
            <div
              key={tool.name}
              style={{
                padding: "10px 22px",
                borderRadius: 28,
                border: `1.5px solid ${tool.border}`,
                background: tool.bg,
                color: tool.color,
                fontSize: 18,
                fontWeight: 600,
              }}
            >
              {tool.name}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  )
}
