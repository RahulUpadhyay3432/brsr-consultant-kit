"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { initMixpanel, identifyUser } from "@/lib/mixpanel";
import { analyticsAllowed } from "@/lib/consent";

// Mounted only by AnalyticsGate (i.e. after the user opts in), but we re-check
// consent here too so a direct mount can never start the SDK without consent.
export function MixpanelProvider() {
  const pathname = usePathname();
  const isPro = pathname?.startsWith("/requests") || pathname?.startsWith("/submit");

  useEffect(() => {
    if (!analyticsAllowed()) return;
    initMixpanel({ plan_type: isPro ? "pro" : "free" }).then(() => {
      if (isPro) {
        identifyUser("saaksh-consultant", {
          $name: "Saaksh Consultant",
          plan: "pro",
        });
      }
    });
  }, [isPro]);

  return null;
}
