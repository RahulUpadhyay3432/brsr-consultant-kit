import { describe, it, expect, beforeEach } from "vitest";
import { allowFounderEmail, __resetFounderEmailWindow } from "./throttle";

describe("allowFounderEmail", () => {
  beforeEach(() => __resetFounderEmailWindow());

  it("allows up to the cap (30) in a window, then blocks", () => {
    let allowed = 0;
    for (let i = 0; i < 50; i++) if (allowFounderEmail()) allowed++;
    expect(allowed).toBe(30);
    expect(allowFounderEmail()).toBe(false);
  });

  it("recovers after a reset", () => {
    for (let i = 0; i < 40; i++) allowFounderEmail();
    expect(allowFounderEmail()).toBe(false);
    __resetFounderEmailWindow();
    expect(allowFounderEmail()).toBe(true);
  });
});
