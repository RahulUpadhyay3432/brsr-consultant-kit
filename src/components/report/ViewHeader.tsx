"use client";
import { type ReactNode } from "react";
import { ICON_COLOR, TabIcon } from "./tab-icons";

// One shared header for every report view. Carries each view's accent colour +
// icon into the content area (they used to live only in the 16px sidebar glyph),
// so the views stop blending: each announces itself with a distinct identity and
// a one-line "what this is". Calm, consistent, framed as peers (no step numbers).
export default function ViewHeader({
  tabId,
  title,
  subtitle,
  info,
  actions,
  className = "",
}: {
  tabId: string;
  title: string;
  subtitle?: ReactNode;
  info?: ReactNode;      // an <InfoPopover> for "learn more"
  actions?: ReactNode;   // right-aligned buttons (exports, etc.)
  className?: string;
}) {
  const accent = ICON_COLOR[tabId] ?? "#5B6573";
  return (
    <div className={`flex items-start justify-between gap-4 flex-wrap mb-5 ${className}`}>
      <div className="flex items-start gap-3 min-w-0">
        <span
          className="flex-shrink-0 mt-0.5 inline-flex items-center justify-center w-10 h-10 rounded-xl border"
          style={{ backgroundColor: `${accent}14`, borderColor: `${accent}33` }}
        >
          <TabIcon id={tabId} size={20} />
        </span>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="font-display text-[24px] font-bold text-ink leading-tight tracking-tight">{title}</h1>
            {info}
          </div>
          {subtitle && (
            <p className="text-[14px] text-ink-muted mt-1 max-w-[70ch] leading-relaxed">{subtitle}</p>
          )}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
    </div>
  );
}
