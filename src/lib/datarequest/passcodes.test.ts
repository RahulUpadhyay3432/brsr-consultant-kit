import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

// passcodes.ts parses the env once and caches it, so each case needs the module
// re-evaluated after setting the env it should see.
async function load(env: { CONSULTANT_PASSCODES?: string; CONSULTANT_PASSCODE?: string }) {
  process.env.CONSULTANT_PASSCODES = env.CONSULTANT_PASSCODES ?? "";
  process.env.CONSULTANT_PASSCODE = env.CONSULTANT_PASSCODE ?? "";
  vi.resetModules();
  return import("./passcodes");
}

const ORIGINAL = { ...process.env };
beforeEach(() => { delete process.env.CONSULTANT_PASSCODES; delete process.env.CONSULTANT_PASSCODE; });
afterEach(() => { process.env = { ...ORIGINAL }; });

describe("orgFromEnvPasscode", () => {
  it("resolves a firm from a slug|name|passcode line", async () => {
    const { orgFromEnvPasscode } = await load({
      CONSULTANT_PASSCODES: "sage|SAGE Sustainability|pc-sage",
    });
    expect(orgFromEnvPasscode("pc-sage")).toEqual({ slug: "sage", name: "SAGE Sustainability" });
  });

  it("keeps firms apart across multiple lines", async () => {
    const { orgFromEnvPasscode } = await load({
      CONSULTANT_PASSCODES: "sage|SAGE Sustainability|pc-sage\nacme|Acme ESG|pc-acme",
    });
    expect(orgFromEnvPasscode("pc-sage")?.slug).toBe("sage");
    expect(orgFromEnvPasscode("pc-acme")?.slug).toBe("acme");
  });

  it("accepts semicolons as a separator too", async () => {
    const { orgFromEnvPasscode } = await load({
      CONSULTANT_PASSCODES: "sage|SAGE|pc-sage; acme|Acme|pc-acme",
    });
    expect(orgFromEnvPasscode("pc-acme")?.slug).toBe("acme");
  });

  it("returns null for an unknown or empty passcode", async () => {
    const { orgFromEnvPasscode } = await load({ CONSULTANT_PASSCODES: "sage|SAGE|pc-sage" });
    expect(orgFromEnvPasscode("nope")).toBeNull();
    expect(orgFromEnvPasscode("")).toBeNull();
  });

  it("skips malformed lines rather than throwing", async () => {
    const { orgFromEnvPasscode } = await load({
      CONSULTANT_PASSCODES: "\n  \nbroken-line\nsage|SAGE|pc-sage\n|missing-slug|pc-x",
    });
    expect(orgFromEnvPasscode("pc-sage")?.slug).toBe("sage");
    expect(orgFromEnvPasscode("pc-x")).toBeNull();
  });
});

describe("isKnownPasscode", () => {
  it("accepts a firm passcode", async () => {
    const { isKnownPasscode } = await load({ CONSULTANT_PASSCODES: "sage|SAGE|pc-sage" });
    expect(isKnownPasscode("pc-sage")).toBe(true);
  });

  it("still accepts the original single passcode", async () => {
    const { isKnownPasscode } = await load({ CONSULTANT_PASSCODE: "legacy-pc" });
    expect(isKnownPasscode("legacy-pc")).toBe(true);
  });

  it("rejects an unknown passcode, undefined, and the empty string", async () => {
    const { isKnownPasscode } = await load({
      CONSULTANT_PASSCODES: "sage|SAGE|pc-sage", CONSULTANT_PASSCODE: "legacy-pc",
    });
    expect(isKnownPasscode("guess")).toBe(false);
    expect(isKnownPasscode(undefined)).toBe(false);
    expect(isKnownPasscode("")).toBe(false);
  });

  // Fails closed: with nothing configured, nothing gets in.
  it("rejects everything when no passcode is configured at all", async () => {
    const { isKnownPasscode } = await load({});
    expect(isKnownPasscode("anything")).toBe(false);
    expect(isKnownPasscode("")).toBe(false);
  });
});
