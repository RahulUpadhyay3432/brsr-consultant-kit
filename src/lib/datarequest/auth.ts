"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// MVP gate: a single shared passcode protects the consultant area. Real
// per-consultant accounts (Supabase Auth + RLS) arrive with the paid tier.
// (Cookie name is also hardcoded in middleware.ts — keep them in sync.)
const AUTH_COOKIE = "bk_auth";

export async function loginAction(formData: FormData): Promise<void> {
  const passcode = String(formData.get("passcode") || "");
  const expected = process.env.CONSULTANT_PASSCODE || "";

  if (expected && passcode === expected) {
    cookies().set(AUTH_COOKIE, passcode, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
    redirect("/requests");
  }
  redirect("/login?error=1");
}

export async function logoutAction(): Promise<void> {
  cookies().delete(AUTH_COOKIE);
  redirect("/login");
}
