import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = (searchParams.get("title") || "Stripe Fee Auditor").slice(0, 120);
  const eyebrow = (searchParams.get("eyebrow") || "Fee Auditor").slice(0, 60);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#f8fafc",
          color: "#0f172a",
          padding: "74px",
          fontFamily: "Inter, Arial, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 58,
              height: 58,
              borderRadius: 18,
              background: "#2563eb",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 25,
              fontWeight: 900,
            }}
          >
            FA
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <div style={{ fontSize: 22, fontWeight: 800 }}>{eyebrow}</div>
            <div style={{ fontSize: 18, color: "#64748b" }}>No OAuth Stripe fee analysis</div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 24,
            maxWidth: 980,
          }}
        >
          <div
            style={{
              fontSize: 62,
              lineHeight: 1.05,
              fontWeight: 900,
              letterSpacing: 0,
            }}
          >
            {title}
          </div>
          <div style={{ display: "flex", gap: 14, fontSize: 25, color: "#475569" }}>
            <span>Real effective rate</span>
            <span>·</span>
            <span>Fee drivers</span>
            <span>·</span>
            <span>CSV only</span>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid #dbeafe",
            paddingTop: 30,
            fontSize: 24,
            color: "#2563eb",
            fontWeight: 800,
          }}
        >
          <span>feeauditor.com</span>
          <span style={{ color: "#64748b", fontSize: 21, fontWeight: 600 }}>
            Raw CSV is not stored as a file
          </span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
