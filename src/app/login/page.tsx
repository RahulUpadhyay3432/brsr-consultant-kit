import Link from "next/link";
import { SaakshMark } from "@/components/SaakshMark";
import { loginAction } from "@/lib/datarequest/auth";
import { REQUEST_ACCESS_URL } from "@/lib/links";

export default function LoginPage({ searchParams }: { searchParams: { error?: string } }) {
  return (
    <main className="min-h-screen bg-page flex items-center justify-center px-5">
      <div className="w-full max-w-[380px]">
        <Link href="/" aria-label="Saaksh home" className="flex items-center gap-2.5 mb-6 justify-center hover:opacity-90 transition-opacity">
          <SaakshMark size={28} />
          <span className="text-[14px] font-semibold text-ink">Saaksh</span>
        </Link>

        <div className={`bg-white border border-line rounded-2xl p-7 shadow-[0_1px_2px_rgba(16,33,26,0.05)] ${searchParams.error ? "shake" : ""}`}>
          <h1 className="font-display text-[22px] font-bold text-ink tracking-tight">Consultant sign-in</h1>
          <p className="text-[13px] text-ink-muted mt-1 leading-relaxed">
            Enter your passcode to manage data collections.
          </p>

          {searchParams.error && (
            <p className="mt-4 text-[13px] text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-3.5 py-2.5">
              Incorrect passcode. Try again.
            </p>
          )}

          <form action={loginAction} className="mt-5 space-y-3">
            <input
              name="passcode"
              type="password"
              autoFocus
              required
              placeholder="Passcode"
              className="w-full h-11 px-3.5 text-[14px] text-stone-800 bg-white border border-stone-200 rounded-lg
                focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition-colors"
            />
            <button type="submit" className="w-full bg-forest text-white text-[14px] font-semibold py-2.5 rounded-lg hover:bg-forest-light transition-colors pressable">
              Sign in
            </button>
          </form>
        </div>

        <p className="text-[12px] text-stone-500 text-center mt-4">
          Don&apos;t have access yet?{" "}
          <a href={REQUEST_ACCESS_URL} className="text-brand-700 font-medium underline underline-offset-2 hover:text-brand-800">Request Pro access</a>
        </p>
        <p className="text-[11px] text-stone-400 text-center mt-2">
          The free readiness tool needs no sign-in; this protects client data collections only.
        </p>
      </div>
    </main>
  );
}
