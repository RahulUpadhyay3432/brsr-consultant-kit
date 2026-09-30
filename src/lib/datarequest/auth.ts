"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { findOrgByPasscode } from "./db";
import { orgFromEnvPasscode } from "./passcodes";

// Sign-in for the consultant area. A passcode is accepted when it belongs to a
// firm (a brsr_orgs row, or an entry in CONSULTANT_PASSCODES) or matches the
// original single CONSULTANT_PASSCODE, which is still honoured so nothing
// breaks before the migration is run. The cookie holds the passcode; org.ts
// resolves it to a firm on each request.
// (Cookie name is also in middleware.ts and org.ts, keep all three in sync.)
const AUTH_COOKIE = "bk_auth";

export async function loginAction(formData: FormData): Promise<void> {
  const passcode = String(formData.get("passcode") || "");
  const expected = process.env.CONSULTANT_PASSCODE || "";

  const known = Boolean(orgFromEnvPasscode(passcode)) || Boolean(await findOrgByPasscode(passcode));
  if (known || (expected && passcode === expected)) {
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
