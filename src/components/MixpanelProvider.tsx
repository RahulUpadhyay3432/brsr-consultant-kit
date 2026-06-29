"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { initMixpanel, identifyUser } from "@/lib/mixpanel";

export function MixpanelProvider() {
  const pathname = usePathname();
  const isPro = pathname?.startsWith("/requests") || pathname?.startsWith("/submit");

  useEffect(() => {
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
