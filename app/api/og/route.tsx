import { ImageResponse } from "next/og";

export const runtime = "edge";

const GRADE_COLORS: Record<string, { bg: string; text: string }> = {
  A: { bg: "#d1fae5", text: "#065f46" },
  B: { bg: "#dbeafe", text: "#1e40af" },
  C: { bg: "#fef3c7", text: "#92400e" },
  D: { bg: "#ffedd5", text: "#9a3412" },
  F: { bg: "#fee2e2", text: "#991b1b" },
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = (searchParams.get("title") || "Stripe Fee Auditor").slice(0, 120);
  const eyebrow = (searchParams.get("eyebrow") || "Fee Auditor").slice(0, 60);
  const grade = (searchParams.get("grade") || "").slice(0, 1).toUpperCase();
  const rate = (searchParams.get("rate") || "").slice(0, 12);
  const gradeStyle = GRADE_COLORS[grade];

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
          {gradeStyle && (
            <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
              <div
                style={{
                  width: 96,
                  height: 96,
                  borderRadius: 24,
                  background: gradeStyle.bg,
                  color: gradeStyle.text,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 56,
                  fontWeight: 900,
                }}
              >
                {grade}
              </div>
              {rate ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <div style={{ fontSize: 22, color: "#64748b", fontWeight: 600 }}>
                    All-in Stripe cost
                  </div>
                  <div style={{ fontSize: 44, fontWeight: 900, color: "#0f172a" }}>
                    {rate.includes("%") ? rate : `${rate}%`}
                  </div>
                </div>
              ) : null}
            </div>
          )}
          <div
            style={{
              fontSize: gradeStyle ? 48 : 62,
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
