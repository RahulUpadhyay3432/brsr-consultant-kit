import { loginAction } from "@/lib/datarequest/auth";

export default function LoginPage({ searchParams }: { searchParams: { error?: string } }) {
  return (
    <main className="min-h-screen bg-[#FAF8F3] flex items-center justify-center px-5">
      <div className="w-full max-w-[380px]">
        <div className="flex items-center gap-2.5 mb-6 justify-center">
          <span className="w-[28px] h-[28px] rounded-md bg-forest flex items-center justify-center">
            <span className="text-[12px] font-bold text-white leading-none">S</span>
          </span>
          <span className="text-[14px] font-semibold text-stone-900">Saaksh</span>
        </div>

        <div className="bg-white border border-stone-200 rounded-2xl p-7 shadow-[0_2px_20px_rgba(100,80,40,0.06)]">
          <h1 className="font-display text-[20px] text-stone-900 tracking-tight">Consultant sign-in</h1>
          <p className="text-[13px] text-stone-500 mt-1 leading-relaxed">
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

        <p className="text-[11.5px] text-stone-400 text-center mt-4">
          The free readiness tool needs no sign-in; this protects client data collections only.
        </p>
      </div>
    </main>
  );
}
