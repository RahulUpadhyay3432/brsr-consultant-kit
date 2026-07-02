import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the server-only deps so leads.ts (which transitively imports "server-only"
// via ./db) loads in the node test env. ./throttle is kept real.
const { addSubscriber, addAccessRequest, recentAccessRequestExists, notifyFounder } = vi.hoisted(() => ({
  addSubscriber: vi.fn(),
  addAccessRequest: vi.fn(),
  recentAccessRequestExists: vi.fn(),
  notifyFounder: vi.fn(),
}));
vi.mock("./db", () => ({ addSubscriber, addAccessRequest, recentAccessRequestExists }));
vi.mock("./email", () => ({ notifyFounder }));

import { subscribeAction, requestAccessAction } from "./leads";
import { __resetFounderEmailWindow } from "./throttle";

function fd(obj: Record<string, string>): FormData {
  const f = new FormData();
  for (const [k, v] of Object.entries(obj)) f.set(k, v);
  return f;
}

beforeEach(() => {
  vi.clearAllMocks();
  __resetFounderEmailWindow();
  recentAccessRequestExists.mockResolvedValue(false);
  addSubscriber.mockResolvedValue(undefined);
  addAccessRequest.mockResolvedValue(undefined);
  notifyFounder.mockResolvedValue(undefined);
});

describe("subscribeAction", () => {
  it("drops honeypot submissions silently, no side effects", async () => {
    const res = await subscribeAction(fd({ company_url: "bot", email: "a@b.com" }));
    expect(res.ok).toBe(true);
    expect(addSubscriber).not.toHaveBeenCalled();
  });

  it("rejects an invalid or over-length email", async () => {
    expect((await subscribeAction(fd({ email: "nope" }))).ok).toBe(false);
    expect((await subscribeAction(fd({ email: "a".repeat(250) + "@b.com" }))).ok).toBe(false);
  });

  it("stores a valid subscriber and caps the source to 60 chars", async () => {
    const res = await subscribeAction(fd({ email: "A@B.com", source: "x".repeat(100) }));
    expect(res.ok).toBe(true);
    expect(addSubscriber).toHaveBeenCalledWith("a@b.com", "x".repeat(60));
  });
});

describe("requestAccessAction", () => {
  it("drops honeypot", async () => {
    const res = await requestAccessAction(fd({ company_url: "bot", name: "A", email: "a@b.com" }));
    expect(res.ok).toBe(true);
    expect(addAccessRequest).not.toHaveBeenCalled();
  });

  it("requires a name and a valid email", async () => {
    expect((await requestAccessAction(fd({ email: "a@b.com" }))).ok).toBe(false);
    expect((await requestAccessAction(fd({ name: "A", email: "nope" }))).ok).toBe(false);
  });

  it("truncates oversize fields before storing", async () => {
    await requestAccessAction(fd({
      name: "N".repeat(500), email: "a@b.com", message: "m".repeat(5000),
      organisation: "o".repeat(500), clients: "c".repeat(500),
    }));
    const arg = addAccessRequest.mock.calls[0][0];
    expect(arg.name.length).toBe(120);
    expect(arg.organisation.length).toBe(200);
    expect(arg.clients.length).toBe(60);
    expect(arg.message.length).toBe(2000);
  });

  it("dedupes a repeat email within 24h: no store, no founder email", async () => {
    recentAccessRequestExists.mockResolvedValue(true);
    const res = await requestAccessAction(fd({ name: "A", email: "a@b.com" }));
    expect(res.ok).toBe(true);
    expect(addAccessRequest).not.toHaveBeenCalled();
    expect(notifyFounder).not.toHaveBeenCalled();
  });

  it("stores and notifies a fresh request", async () => {
    await requestAccessAction(fd({ name: "A", email: "a@b.com" }));
    expect(addAccessRequest).toHaveBeenCalledTimes(1);
    expect(notifyFounder).toHaveBeenCalledTimes(1);
  });
});
