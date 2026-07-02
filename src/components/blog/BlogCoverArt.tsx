import React from "react";
import { BlogPost } from "@/data/blog-posts";

const W = "rgba(255,255,255,";
const mono: React.CSSProperties = { fontFamily: "var(--font-hanken), -apple-system, system-ui, sans-serif" };

/* ─── Original 5 covers ──────────────────────────────────────────────────── */

function BrsrFy2526Cover() {
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", padding: "24px 26px", justifyContent: "space-between" }}>
      <div style={{ ...mono, color: W + "0.5)", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase" }}>FY 2025 – 26</div>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {[
          { label: "BRSR Core assurance", tag: "Mandatory", tagColor: "#10A572" },
          { label: "Value-chain disclosure", tag: "FY 2026-27", tagColor: "#C2871B" },
          { label: "SEBI March 2025 amendments", tag: "In force", tagColor: "#1E9DF2" },
        ].map((row) => (
          <div key={row.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: W + "0.08)", borderRadius: "8px", padding: "9px 12px" }}>
            <span style={{ color: W + "0.9)", fontSize: "12.5px", fontWeight: 500 }}>{row.label}</span>
            <span style={{ ...mono, background: row.tagColor + "33", color: row.tagColor, fontSize: "10px", fontWeight: 700, padding: "2px 8px", borderRadius: "20px", letterSpacing: "0.05em" }}>{row.tag}</span>
          </div>
        ))}
      </div>
      <div style={{ color: W + "0.35)", fontSize: "11px" }}>SEBI BRSR Format · ICAI 2024</div>
    </div>
  );
}

function GhgCover() {
  const bars = [
    { label: "Scope 1", sub: "Diesel · LPG", height: 70, color: "#10A572" },
    { label: "Scope 2", sub: "Grid electricity", height: 100, color: "#1E9DF2" },
    { label: "Scope 3", sub: "Voluntary", height: 40, color: W + "0.2)" },
  ];
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", padding: "20px 22px" }}>
      <div style={{ ...mono, color: W + "0.5)", fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "auto" }}>P6-E1 · GHG Emissions</div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: "14px", height: "110px" }}>
        {bars.map((b) => (
          <div key={b.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "5px", flex: 1 }}>
            <div style={{ width: "100%", height: `${b.height}px`, background: b.color, borderRadius: "5px 5px 0 0" }} />
            <span style={{ color: W + "0.85)", fontSize: "10.5px", fontWeight: 600, textAlign: "center" }}>{b.label}</span>
            <span style={{ ...mono, color: W + "0.4)", fontSize: "9px", textAlign: "center" }}>{b.sub}</span>
          </div>
        ))}
      </div>
      <div style={{ marginTop: "12px", background: W + "0.07)", borderRadius: "6px", padding: "6px 10px", ...mono, fontSize: "9.5px", color: W + "0.6)" }}>
        Grid: 0.710 kg CO₂e/kWh · CEA v21.0 (2024)
      </div>
    </div>
  );
}

function CoreVsEssentialCover() {
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", padding: "20px 22px", gap: "10px" }}>
      <div style={{ ...mono, color: W + "0.45)", fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase" }}>Understanding BRSR</div>
      <div style={{ display: "flex", gap: "10px", flex: 1 }}>
        <div style={{ flex: 1, background: W + "0.07)", borderRadius: "10px", padding: "12px", display: "flex", flexDirection: "column", gap: "6px" }}>
          <span style={{ ...mono, color: W + "0.5)", fontSize: "9px", letterSpacing: "0.08em" }}>ESSENTIAL</span>
          <span style={{ color: "white", fontSize: "26px", fontWeight: 800, lineHeight: 1 }}>108</span>
          <span style={{ color: W + "0.6)", fontSize: "10.5px" }}>indicators</span>
          <div style={{ marginTop: "auto", ...mono, color: W + "0.35)", fontSize: "9px" }}>No assurance</div>
        </div>
        <div style={{ flex: 1, background: "rgba(123,111,224,0.25)", borderRadius: "10px", padding: "12px", display: "flex", flexDirection: "column", gap: "6px", border: "1px solid rgba(123,111,224,0.5)" }}>
          <span style={{ ...mono, color: "#A89FF7", fontSize: "9px", letterSpacing: "0.08em" }}>CORE</span>
          <span style={{ color: "white", fontSize: "26px", fontWeight: 800, lineHeight: 1 }}>42</span>
          <span style={{ color: W + "0.6)", fontSize: "10.5px" }}>KPIs</span>
          <div style={{ marginTop: "auto", background: "#7B6FE0", borderRadius: "4px", padding: "2px 6px", ...mono, color: "white", fontSize: "8.5px", fontWeight: 700, textAlign: "center" }}>ASSURANCE REQ.</div>
        </div>
      </div>
      <div style={{ ...mono, color: W + "0.3)", fontSize: "9px" }}>Source: SEBI BRSR Core circular</div>
    </div>
  );
}

function FiveFieldsCover() {
  const items = ["P6-E1 · GHG Scope 2", "P3-E1 · Contractor count", "P2-E3 · EPR obligations", "P6-E7 · Energy intensity", "P5-E4 · Gender wages"];
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", padding: "18px 20px", gap: "8px" }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
        <span style={{ color: "white", fontSize: "42px", fontWeight: 900, lineHeight: 1, opacity: 0.95 }}>5</span>
        <span style={{ color: W + "0.6)", fontSize: "12px", fontWeight: 600 }}>fields to watch</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "5px", flex: 1 }}>
        {items.map((item, i) => (
          <div key={item} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ ...mono, color: "#F2674A", fontSize: "10px", fontWeight: 700, width: "14px", textAlign: "right" }}>{i + 1}</span>
            <span style={{ ...mono, color: W + "0.75)", fontSize: "10px" }}>{item}</span>
          </div>
        ))}
      </div>
      <div style={{ ...mono, color: W + "0.3)", fontSize: "9px" }}>Manufacturing sector · BRSR Section C</div>
    </div>
  );
}

function CbamCover() {
  const sectors = ["Steel", "Cement", "Aluminium", "Fertilizers"];
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", padding: "20px 22px", justifyContent: "space-between" }}>
      <div style={{ ...mono, color: W + "0.45)", fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase" }}>EU CBAM · Jan 2026</div>
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <div style={{ background: W + "0.1)", borderRadius: "8px", padding: "8px 14px", color: "white", fontWeight: 700, fontSize: "16px" }}>India</div>
        <div style={{ flex: 1, height: "2px", background: W + "0.3)", position: "relative" as const }}>
          <div style={{ position: "absolute" as const, right: "-1px", top: "-4px", color: W + "0.6)", fontSize: "14px" }}>→</div>
        </div>
        <div style={{ background: "rgba(0,51,153,0.5)", border: "1px solid rgba(0,51,153,0.8)", borderRadius: "8px", padding: "8px 14px", color: "white", fontWeight: 700, fontSize: "16px" }}>EU</div>
      </div>
      <div>
        <div style={{ color: W + "0.5)", fontSize: "10px", marginBottom: "6px", ...mono }}>Covered sectors</div>
        <div style={{ display: "flex", flexWrap: "wrap" as const, gap: "5px" }}>
          {sectors.map((s) => (
            <span key={s} style={{ background: W + "0.1)", color: W + "0.85)", borderRadius: "20px", padding: "3px 10px", fontSize: "10.5px", fontWeight: 500 }}>{s}</span>
          ))}
        </div>
      </div>
      <div style={{ ...mono, color: W + "0.3)", fontSize: "9px" }}>EU Regulation 2023/956</div>
    </div>
  );
}

/* ─── New SEO post covers ─────────────────────────────────────────────────── */

function ApplicabilityGuide() {
  const rows = [
    { co: "Top 1000", brsr: "Full BRSR", core: "No", since: "FY 2022-23" },
    { co: "Top 500", brsr: "Full BRSR", core: "Assurance", since: "FY 2025-26" },
    { co: "Top 1000", brsr: "Full BRSR", core: "Assurance", since: "FY 2026-27" },
  ];
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", padding: "18px 20px", gap: "10px" }}>
      <div style={{ ...mono, color: W + "0.45)", fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase" }}>Who must file</div>
      <div style={{ display: "flex", flexDirection: "column", gap: "6px", flex: 1 }}>
        {rows.map((r, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", background: W + (i === 1 ? "0.12)" : "0.07)"), borderRadius: "7px", padding: "8px 10px" }}>
            <span style={{ color: "white", fontSize: "11px", fontWeight: 600, flex: 1 }}>{r.co}</span>
            <span style={{ ...mono, color: i === 1 ? "#1E9DF2" : W + "0.5)", fontSize: "9px", fontWeight: i === 1 ? 700 : 400 }}>{r.core}</span>
            <span style={{ ...mono, color: W + "0.35)", fontSize: "9px", minWidth: "66px", textAlign: "right" as const }}>{r.since}</span>
          </div>
        ))}
      </div>
      <div style={{ ...mono, color: W + "0.3)", fontSize: "9px" }}>Source: SEBI LODR Regulation 34</div>
    </div>
  );
}

function CoreAssuranceCover() {
  const kpis = ["GHG intensity", "Water intensity", "Energy intensity", "Waste generated", "Gender pay"];
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", padding: "18px 20px", gap: "10px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <div style={{ background: "#7B1AE0", borderRadius: "6px", padding: "4px 10px", ...mono, color: "white", fontSize: "10px", fontWeight: 700 }}>BRSR Core</div>
        <span style={{ color: W + "0.5)", fontSize: "11px" }}>· 42 KPIs</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "5px", flex: 1 }}>
        {kpis.map((k) => (
          <div key={k} style={{ display: "flex", alignItems: "center", gap: "7px" }}>
            <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#7B1AE0", flexShrink: 0 }} />
            <span style={{ ...mono, color: W + "0.75)", fontSize: "10px" }}>{k}</span>
          </div>
        ))}
        <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
          <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: W + "0.25)", flexShrink: 0 }} />
          <span style={{ ...mono, color: W + "0.4)", fontSize: "10px" }}>+37 more…</span>
        </div>
      </div>
      <div style={{ background: "rgba(123,26,224,0.3)", border: "1px solid rgba(123,26,224,0.6)", borderRadius: "6px", padding: "6px 10px", ...mono, fontSize: "9.5px", color: W + "0.7)" }}>
        Reasonable assurance: FY 2025-26
      </div>
    </div>
  );
}

function DataCollectionCover() {
  const teams = [
    { team: "HR", fields: "P3, P5" },
    { team: "EHS / Plant", fields: "P6 (GHG, water, waste)" },
    { team: "Company Secretary", fields: "P1, P4, P7" },
    { team: "Procurement", fields: "P2, value chain" },
    { team: "CSR", fields: "P8, P9" },
  ];
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", padding: "18px 20px", gap: "8px" }}>
      <div style={{ ...mono, color: W + "0.45)", fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase" }}>Who owns what</div>
      <div style={{ display: "flex", flexDirection: "column", gap: "5px", flex: 1 }}>
        {teams.map((t) => (
          <div key={t.team} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "6px 8px", background: W + "0.07)", borderRadius: "6px" }}>
            <span style={{ ...mono, color: "#10A572", fontSize: "10px", fontWeight: 700, minWidth: "100px" }}>{t.team}</span>
            <span style={{ color: W + "0.55)", fontSize: "10px" }}>{t.fields}</span>
          </div>
        ))}
      </div>
      <div style={{ ...mono, color: W + "0.3)", fontSize: "9px" }}>BRSR Section C · 9 Principles</div>
    </div>
  );
}

function AssuranceVsAssessmentCover() {
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", padding: "20px 22px", gap: "10px" }}>
      <div style={{ ...mono, color: W + "0.45)", fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase" }}>SEBI March 2025</div>
      <div style={{ display: "flex", gap: "8px", flex: 1 }}>
        <div style={{ flex: 1, background: W + "0.08)", borderRadius: "8px", padding: "12px 10px", display: "flex", flexDirection: "column", gap: "6px" }}>
          <span style={{ ...mono, color: "#A89FF7", fontSize: "9px" }}>ASSURANCE</span>
          <span style={{ color: "white", fontSize: "12px", fontWeight: 600 }}>ISAE 3000</span>
          <span style={{ color: W + "0.5)", fontSize: "10px" }}>Auditor-level evidence</span>
          <div style={{ marginTop: "auto", ...mono, color: "#A89FF7", fontSize: "9px" }}>Higher bar</div>
        </div>
        <div style={{ flex: 1, background: "rgba(240,120,60,0.2)", borderRadius: "8px", padding: "12px 10px", display: "flex", flexDirection: "column", gap: "6px", border: "1px solid rgba(240,120,60,0.4)" }}>
          <span style={{ ...mono, color: "#F2874A", fontSize: "9px" }}>ASSESSMENT</span>
          <span style={{ color: "white", fontSize: "12px", fontWeight: 600 }}>ISF standard</span>
          <span style={{ color: W + "0.5)", fontSize: "10px" }}>Lighter review</span>
          <div style={{ marginTop: "auto", ...mono, color: "#F2874A", fontSize: "9px" }}>New in 2025</div>
        </div>
      </div>
      <div style={{ ...mono, color: W + "0.3)", fontSize: "9px" }}>Source: SEBI circular 28 Mar 2025</div>
    </div>
  );
}

function ItServicesCover() {
  const naFields = ["P2-E3 · EPR registration", "P2-E4 · Extended producer", "P6-E2 · Air emissions", "P6-E4 · Effluent discharge", "P6-E11 · Environmental fines"];
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", padding: "18px 20px", gap: "8px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        <div style={{ background: "rgba(30,157,242,0.25)", border: "1px solid rgba(30,157,242,0.5)", borderRadius: "6px", padding: "3px 10px", ...mono, color: "#1E9DF2", fontSize: "10px", fontWeight: 700 }}>IT Services</div>
        <span style={{ color: W + "0.45)", fontSize: "10px" }}>— what to skip</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "5px", flex: 1 }}>
        {naFields.map((f) => (
          <div key={f} style={{ display: "flex", alignItems: "center", gap: "7px" }}>
            <span style={{ color: "#F2674A", fontSize: "11px", lineHeight: 1 }}>✕</span>
            <span style={{ ...mono, color: W + "0.6)", fontSize: "9.5px" }}>{f}</span>
          </div>
        ))}
      </div>
      <div style={{ background: W + "0.07)", borderRadius: "6px", padding: "6px 10px", ...mono, fontSize: "9px", color: W + "0.5)" }}>
        11 fields marked N/A for services
      </div>
    </div>
  );
}

function TextileCompanyCover() {
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", padding: "18px 20px", justifyContent: "space-between" }}>
      <div style={{ ...mono, color: W + "0.45)", fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase" }}>Textile sector · FY 2025-26</div>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <div style={{ background: "rgba(123,26,200,0.2)", border: "1px solid rgba(123,26,200,0.4)", borderRadius: "8px", padding: "10px 12px" }}>
          <div style={{ ...mono, color: "#C07BF0", fontSize: "9px", marginBottom: "4px" }}>BRSR Core</div>
          <div style={{ color: "white", fontSize: "12px", fontWeight: 600 }}>Reasonable assurance required</div>
          <div style={{ color: W + "0.45)", fontSize: "10px", marginTop: "2px" }}>Annual report filing · Jun/Jul 2026</div>
        </div>
        <div style={{ background: "rgba(26,140,90,0.2)", border: "1px solid rgba(26,140,90,0.4)", borderRadius: "8px", padding: "10px 12px" }}>
          <div style={{ ...mono, color: "#3FD4A0", fontSize: "9px", marginBottom: "4px" }}>CCTS</div>
          <div style={{ color: "white", fontSize: "12px", fontWeight: 600 }}>GHG intensity report to BEE</div>
          <div style={{ color: W + "0.45)", fontSize: "10px", marginTop: "2px" }}>Due: 31 July 2026</div>
        </div>
      </div>
      <div style={{ ...mono, color: W + "0.3)", fontSize: "9px" }}>SEBI + BEE GEI Target Order 2023</div>
    </div>
  );
}

function ValueChainCover() {
  const timeline = [
    { fy: "FY 2024-25", label: "Comply-or-explain", color: "#C2871B" },
    { fy: "FY 2025-26", label: "Voluntary", color: "#10A572", highlight: true },
    { fy: "FY 2026-27", label: "Mandatory (2%+ partners)", color: "#F2674A" },
  ];
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", padding: "18px 20px", gap: "10px" }}>
      <div style={{ ...mono, color: W + "0.45)", fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase" }}>Value chain timeline</div>
      <div style={{ display: "flex", flexDirection: "column", gap: "7px", flex: 1, justifyContent: "center" }}>
        {timeline.map((t, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 10px", background: t.highlight ? W + "0.1)" : W + "0.06)", borderRadius: "7px" }}>
            <span style={{ ...mono, color: t.color, fontSize: "9px", fontWeight: 700, minWidth: "80px" }}>{t.fy}</span>
            <span style={{ color: W + "0.75)", fontSize: "11px" }}>{t.label}</span>
          </div>
        ))}
      </div>
      <div style={{ ...mono, color: W + "0.3)", fontSize: "9px" }}>SEBI Mar 2025 · scope: 2%+ of purchases/sales</div>
    </div>
  );
}

function WaterDisclosureCover() {
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", padding: "20px 22px", justifyContent: "space-between" }}>
      <div style={{ ...mono, color: W + "0.45)", fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase" }}>P6-E3 · Water intensity</div>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <div style={{ background: W + "0.08)", borderRadius: "8px", padding: "10px 12px" }}>
          <div style={{ ...mono, color: "#1E9DF2", fontSize: "9px", marginBottom: "6px" }}>MANUFACTURING</div>
          <div style={{ color: "white", fontSize: "11px", fontWeight: 600 }}>ML withdrawn ÷ units of production</div>
        </div>
        <div style={{ background: W + "0.05)", borderRadius: "8px", padding: "10px 12px" }}>
          <div style={{ ...mono, color: W + "0.45)", fontSize: "9px", marginBottom: "6px" }}>SERVICES / OTHERS</div>
          <div style={{ color: W + "0.7)", fontSize: "11px", fontWeight: 600 }}>ML withdrawn ÷ revenue (₹ crore)</div>
        </div>
      </div>
      <div style={{ ...mono, color: W + "0.3)", fontSize: "9px" }}>Source: SEBI BRSR Format, ICAI 2024</div>
    </div>
  );
}

function CctsCover() {
  const sectors = ["Aluminium", "Cement", "Iron & Steel", "Fertiliser", "Textile", "Petroleum", "Petrochemicals"];
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", padding: "18px 20px", gap: "8px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ ...mono, color: W + "0.45)", fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase" }}>CCTS · 7 sectors</div>
        <div style={{ ...mono, background: "rgba(26,140,90,0.25)", color: "#3FD4A0", fontSize: "9px", fontWeight: 700, padding: "2px 8px", borderRadius: "20px" }}>~490 companies</div>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap" as const, gap: "5px", flex: 1, alignContent: "flex-start" as const }}>
        {sectors.map((s) => (
          <span key={s} style={{ background: "rgba(26,140,90,0.15)", border: "1px solid rgba(26,140,90,0.3)", color: W + "0.8)", borderRadius: "6px", padding: "4px 10px", fontSize: "10.5px" }}>{s}</span>
        ))}
      </div>
      <div style={{ background: "rgba(26,140,90,0.15)", border: "1px solid rgba(26,140,90,0.4)", borderRadius: "6px", padding: "7px 10px", ...mono, fontSize: "9.5px", color: W + "0.65)" }}>
        First reports due: 31 July 2026 to BEE
      </div>
    </div>
  );
}

function MaterialityCover() {
  const axes = [
    { x: 85, y: 20, label: "GHG", r: 14, color: "#10A572" },
    { x: 65, y: 35, label: "Water", r: 11, color: "#1E9DF2" },
    { x: 50, y: 55, label: "Labour", r: 10, color: "#C2871B" },
    { x: 30, y: 70, label: "Ethics", r: 9, color: "#F2674A" },
    { x: 75, y: 60, label: "Supply", r: 8, color: W + "0.35)" },
  ];
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", padding: "18px 20px", gap: "8px" }}>
      <div style={{ ...mono, color: W + "0.45)", fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase" }}>Materiality matrix</div>
      <div style={{ position: "relative" as const, flex: 1, border: "1px solid " + W + "0.12)", borderRadius: "8px", overflow: "hidden" }}>
        <div style={{ position: "absolute" as const, left: "6px", bottom: "6px", ...mono, color: W + "0.3)", fontSize: "8px", transform: "rotate(-90deg)", transformOrigin: "bottom left" }}>Impact</div>
        <div style={{ position: "absolute" as const, right: "6px", bottom: "6px", ...mono, color: W + "0.3)", fontSize: "8px" }}>Stakeholder concern →</div>
        {axes.map((d) => (
          <div key={d.label} style={{
            position: "absolute" as const,
            left: `${d.x}%`, bottom: `${100 - d.y}%`,
            transform: "translate(-50%, 50%)",
            width: `${d.r * 2}px`, height: `${d.r * 2}px`,
            borderRadius: "50%", background: d.color,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ color: "white", fontSize: "7px", fontWeight: 700 }}>{d.label}</span>
          </div>
        ))}
      </div>
      <div style={{ ...mono, color: W + "0.3)", fontSize: "9px" }}>E/S/G grouped · stakeholder-engagement process</div>
    </div>
  );
}

function DefaultCover({ post }: { post: BlogPost }) {
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "20px", gap: "12px" }}>
      <div style={{ color: W + "0.7)", fontSize: "13px", fontWeight: 600, textAlign: "center" as const }}>{post.category}</div>
      <div style={{ color: "white", fontSize: "15px", fontWeight: 700, textAlign: "center" as const, lineHeight: 1.4 }}>{post.title}</div>
    </div>
  );
}

/* ─── Cover map ───────────────────────────────────────────────────────────── */
const COVER_MAP: Record<string, () => React.ReactElement> = {
  "brsr-fy2526-changes":              BrsrFy2526Cover,
  "scope-1-2-ghg-brsr-guide":        GhgCover,
  "brsr-core-vs-essential":           CoreVsEssentialCover,
  "5-brsr-fields-manufacturers-struggle": FiveFieldsCover,
  "cbam-2026-indian-exporters":       CbamCover,
  "brsr-applicability-guide":         ApplicabilityGuide,
  "brsr-core-assurance-fy2526":       CoreAssuranceCover,
  "brsr-data-collection-guide":       DataCollectionCover,
  "brsr-assurance-vs-assessment":     AssuranceVsAssessmentCover,
  "brsr-for-it-services":             ItServicesCover,
  "brsr-for-textile-companies":       TextileCompanyCover,
  "brsr-value-chain-disclosure":      ValueChainCover,
  "brsr-water-disclosure-calculation": WaterDisclosureCover,
  "ccts-india-2025-26":              CctsCover,
  "brsr-materiality-assessment-guide": MaterialityCover,
};

export function BlogCoverArt({
  post,
  className,
  style,
}: {
  post: BlogPost;
  className?: string;
  style?: React.CSSProperties;
}) {
  // Real photo when provided (16:9 at /blog/<slug>.jpg), else the generated cover art.
  if (post.coverImage) {
    return (
      <div className={className} style={{ overflow: "hidden", ...style }}>
        <img
          src={post.coverImage}
          alt={post.title}
          loading="lazy"
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
      </div>
    );
  }

  const CoverComponent = COVER_MAP[post.slug];
  return (
    <div
      className={className}
      style={{
        background: `linear-gradient(145deg, ${post.coverGradient[0]} 0%, ${post.coverGradient[1]} 100%)`,
        overflow: "hidden",
        ...style,
      }}
    >
      {CoverComponent ? <CoverComponent /> : <DefaultCover post={post} />}
    </div>
  );
}
