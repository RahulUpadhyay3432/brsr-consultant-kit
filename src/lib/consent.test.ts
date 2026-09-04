import { afterEach, describe, expect, it, vi } from "vitest";

// consent.ts reads the opt-out flag from the URL exactly once per page load, via a
// module-level guard. Each case therefore needs a fresh module instance, which is
// why every test imports it dynamically after stubbing the browser globals.
function stubBrowser(search: string, stored?: string) {
  const store = new Map<string, string>();
  if (stored !== undefined) store.set("saaksh_consent", stored);
  const win = {
    location: { search },
    localStorage: {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => void store.set(k, v),
      removeItem: (k: string) => void store.delete(k),
    },
    dispatchEvent: () => true,
  };
  vi.stubGlobal("window", win);
  return store;
}

async function freshConsent() {
  vi.resetModules();
  return import("./consent");
}

afterEach(() => vi.unstubAllGlobals());

describe("device opt-out link (?notrack)", () => {
  it("?notrack=1 excludes the device on the very first read", async () => {
    const store = stubBrowser("?notrack=1");
    const { getConsent } = await freshConsent();
    // The first read is what AnalyticsGate calls, so the flag has to land here.
    expect(getConsent()).toMatchObject({ analytics: false });
    expect(JSON.parse(store.get("saaksh_consent")!).analytics).toBe(false);
  });

  it("works as a bare flag and alongside other query params", async () => {
    stubBrowser("?utm_source=nl&notrack");
    const { getConsent } = await freshConsent();
    expect(getConsent()).toMatchObject({ analytics: false });
  });

  it("overrides a previous opt-in", async () => {
    stubBrowser("?notrack=1", JSON.stringify({ analytics: true, ts: 1 }));
    const { getConsent } = await freshConsent();
    expect(getConsent()).toMatchObject({ analytics: false });
  });

  it("?notrack=0 clears the choice rather than opting the device in", async () => {
    // DPDP consent must be given explicitly, so undoing an opt-out returns the
    // user to "undecided" (the banner asks again) — never straight to tracked.
    const store = stubBrowser("?notrack=0", JSON.stringify({ analytics: false, ts: 1 }));
    const { getConsent } = await freshConsent();
    expect(getConsent()).toBeNull();
    expect(store.has("saaksh_consent")).toBe(false);
  });

  it("leaves a stored choice untouched when the flag is absent", async () => {
    stubBrowser("?ref=newsletter", JSON.stringify({ analytics: true, ts: 1 }));
    const { getConsent } = await freshConsent();
    expect(getConsent()).toMatchObject({ analytics: true });
  });

  it("does not re-apply the URL flag on later reads in the same page load", async () => {
    // Otherwise navigating away from ?notrack=1 and back would keep rewriting it,
    // silently undoing a deliberate re-opt-in made in between.
    const store = stubBrowser("?notrack=1");
    const { getConsent, setConsent } = await freshConsent();
    expect(getConsent()).toMatchObject({ analytics: false });
    setConsent(true);
    expect(getConsent()).toMatchObject({ analytics: true });
    expect(JSON.parse(store.get("saaksh_consent")!).analytics).toBe(true);
  });

  it("returns null on the server, where there is no window", async () => {
    vi.stubGlobal("window", undefined);
    const { getConsent } = await freshConsent();
    expect(getConsent()).toBeNull();
  });
});
