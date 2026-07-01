import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Saaksh – Free BRSR Readiness Tool for Indian ESG Consultants";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#0F1E33",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "80px 80px",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        {/* Logo row */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "36px" }}>
          <div
            style={{
              width: "56px",
              height: "56px",
              background: "#1E9DF2",
              borderRadius: "14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "26px",
              fontWeight: 700,
              color: "#fff",
            }}
          >
            S
          </div>
          <span style={{ fontSize: "28px", fontWeight: 700, color: "#fff", letterSpacing: "-0.3px" }}>
            Saaksh
          </span>
        </div>

        {/* Headline */}
        <div
          style={{
            fontSize: "58px",
            fontWeight: 700,
            color: "#fff",
            lineHeight: 1.08,
            letterSpacing: "-1px",
            marginBottom: "28px",
            maxWidth: "880px",
          }}
        >
          Free BRSR Readiness Tool for Indian ESG Consultants
        </div>

        {/* Sub */}
        <div style={{ fontSize: "24px", color: "#8BA4C0", maxWidth: "720px", lineHeight: 1.5 }}>
          Gap-analysed and cited to SEBI &amp; ICAI. Everything runs on your device.
        </div>

        {/* Bottom bar */}
        <div
          style={{
            position: "absolute",
            bottom: "48px",
            left: "80px",
            right: "80px",
            display: "flex",
            alignItems: "center",
            gap: "24px",
          }}
        >
          {["108 BRSR fields", "GHG calculators", "Framework mapping", "Free"].map((t) => (
            <div
              key={t}
              style={{
                fontSize: "14px",
                color: "#1E9DF2",
                background: "rgba(30,157,242,0.12)",
                borderRadius: "20px",
                padding: "6px 16px",
                fontWeight: 600,
              }}
            >
              {t}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
