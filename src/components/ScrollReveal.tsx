"use client";

// Mount once on a server-component page to enable [data-reveal] scroll animations
// (the homepage LandingPage already calls the hook itself). Renders nothing.
import { useScrollReveal } from "@/lib/useScrollReveal";

export function ScrollReveal() {
  useScrollReveal();
  return null;
}
