"use client";
import { Analytics } from "@vercel/analytics/react";
import { GoogleAnalytics } from "@next/third-parties/google";
import { MixpanelProvider } from "./MixpanelProvider";
import { useConsent } from "@/lib/use-consent";

// Mounts ALL analytics (Vercel, GA4, Mixpanel) only after the user opts in via
// the consent banner. Before consent — or on Decline — nothing here renders, so
// no analytics scripts load and no cookies are set (DPDP opt-in compliant).
export function AnalyticsGate() {
  const { consent } = useConsent();
  if (consent?.analytics !== true) return null;
  return (
    <>
      <Analytics />
      <MixpanelProvider />
      <GoogleAnalytics gaId="G-GJBBQ6YPZL" />
    </>
  );
}
