"use client";
import { openConsentSettings } from "@/lib/consent";

// Re-opens the consent banner so the user can change their analytics choice.
export default function CookieSettingsLink({ className }: { className?: string }) {
  return (
    <button type="button" onClick={openConsentSettings} className={className}>
      Cookie settings
    </button>
  );
}
