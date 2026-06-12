import Link from "next/link";
import CollectNav from "@/components/datarequest/CollectNav";
import { logoutAction } from "@/lib/datarequest/auth";

// Shared app-shell for the consultant "Collect" area — mirrors the report
// workspace chrome so the two halves read as one product. (Recipient /submit
// and /login keep their own standalone layouts.)
export default function RequestsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#F7F6F2]">

      {/* Sidebar */}
      <aside className="no-print w-[244px] flex-shrink-0 h-screen sticky top-0 hidden lg:flex flex-col
        bg-white/55 backdrop-blur-sm border-r border-black/[0.06]">

        {/* Brand → back to the readiness tool */}
        <Link href="/" className="h-14 flex items-center gap-2.5 px-4 border-b border-black/[0.05]
          hover:bg-stone-100/50 transition-colors">
          <div className="w-[26px] h-[26px] rounded-md bg-[#111111] flex items-center justify-center flex-shrink-0">
            <span className="text-[10px] font-bold text-white leading-none tracking-tight">BK</span>
          </div>
          <div className="leading-tight">
            <p className="text-[13px] font-semibold text-stone-900 tracking-[-0.01em]">BRSR Kit</p>
            <p className="text-[10.5px] text-stone-400">Data collection</p>
          </div>
        </Link>

        <CollectNav />

        {/* Footer */}
        <div className="px-3 py-3 border-t border-black/[0.05] space-y-1">
          <form action={logoutAction}>
            <button type="submit" className="inline-flex items-center gap-2 w-full px-2.5 py-2 rounded-lg text-[13px] font-medium
              text-stone-600 hover:bg-stone-100/70 transition-colors pressable">
              <svg className="w-4 h-4 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12H3m0 0l4-4m-4 4l4 4M21 4v16" />
              </svg>
              Log out
            </button>
          </form>
          <div className="flex items-center gap-1.5 px-2.5 pt-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
            <span className="text-[10.5px] text-stone-400 tracking-tight">Client data · encrypted</span>
          </div>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="no-print sticky top-0 z-40 h-14 flex items-center gap-3 px-5 sm:px-8
          bg-[#F7F6F2]/85 backdrop-blur-md border-b border-black/[0.06]">
          {/* Mobile brand (sidebar is hidden < lg) */}
          <Link href="/" className="lg:hidden flex items-center">
            <span className="w-[24px] h-[24px] rounded-md bg-[#111111] flex items-center justify-center">
              <span className="text-[9px] font-bold text-white leading-none">BK</span>
            </span>
          </Link>
          <span className="text-[13px] font-semibold text-stone-700">Data collection</span>
          <div className="flex-1" />
          <Link href="/requests" className="lg:hidden text-[12.5px] font-medium text-stone-500 hover:text-stone-700">Collections</Link>
        </header>

        <main className="flex-1 px-5 sm:px-8 lg:px-10 py-7">
          {children}
        </main>
      </div>
    </div>
  );
}
