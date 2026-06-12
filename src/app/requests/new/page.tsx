import Link from "next/link";
import { createCampaignAction } from "@/lib/datarequest/actions";

export default function NewCampaignPage({ searchParams }: { searchParams: { error?: string } }) {
  return (
    <main className="min-h-screen bg-[#F7F6F2]">
      <div className="max-w-[560px] mx-auto px-5 sm:px-8 py-10">
        <Link href="/requests" className="text-[13px] text-stone-500 hover:text-stone-700">← All requests</Link>

        <h1 className="font-display text-[26px] text-stone-900 mt-3 tracking-tight">New collection</h1>
        <p className="text-[13.5px] text-stone-500 mt-1 leading-relaxed">
          Start with the client. Next you&apos;ll add the people who own each piece of data — water, energy,
          HR — and send each their own request.
        </p>

        {searchParams.error === "missing" && (
          <p className="mt-4 text-[13px] text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-3.5 py-2.5">
            Please enter a client name.
          </p>
        )}

        <form action={createCampaignAction} className="mt-6 bg-white border border-stone-200 rounded-xl p-5 space-y-4 shadow-[0_1px_3px_rgba(80,60,30,0.04)]">
          <label className="block">
            <span className="block text-[12px] font-medium text-stone-600 mb-1.5">Client / company <span className="text-rose-500">*</span></span>
            <input name="clientName" required placeholder="Tata Motors Ltd"
              className="w-full h-10 px-3 text-[13.5px] text-stone-800 bg-white border border-stone-200 rounded-lg focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition-colors" />
          </label>
          <label className="block">
            <span className="block text-[12px] font-medium text-stone-600 mb-1.5">Deadline</span>
            <input name="deadline" type="date"
              className="w-full h-10 px-3 text-[13.5px] text-stone-800 bg-white border border-stone-200 rounded-lg focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition-colors" />
          </label>
          <button type="submit" className="inline-flex items-center gap-2 bg-[#111] text-white text-[14px] font-semibold px-5 py-2.5 rounded-lg hover:bg-black transition-colors">
            Create →
          </button>
        </form>
      </div>
    </main>
  );
}
