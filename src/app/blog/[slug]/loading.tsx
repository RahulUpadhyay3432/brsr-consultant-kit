import { BlogHeader } from "@/components/blog/BlogHeader";

/* Shown instantly while a post route resolves, so clicking a card feels responsive
   instead of hanging on a blank screen. Mirrors the article's layout. */
export default function Loading() {
  return (
    <div className="min-h-screen bg-[#FBFCFE] flex flex-col">
      <BlogHeader />
      <main className="flex-1">
        <div className="max-w-[1080px] mx-auto px-6 py-10">
          <div className="h-4 w-16 rounded bg-[#E9EEF5] animate-pulse mb-8" />
          <div className="w-full aspect-[16/9] rounded-2xl bg-[#E9EEF5] animate-pulse mb-10" />
          <div className="lg:grid lg:grid-cols-[216px_1fr] lg:gap-14">
            <div className="hidden lg:block" />
            <div className="min-w-0">
              <div className="flex gap-2 mb-5">
                <div className="h-5 w-20 rounded bg-[#E9EEF5] animate-pulse" />
                <div className="h-5 w-24 rounded bg-[#EEF2F8] animate-pulse" />
              </div>
              <div className="h-9 w-[92%] rounded bg-[#E9EEF5] animate-pulse mb-3" />
              <div className="h-9 w-[64%] rounded bg-[#E9EEF5] animate-pulse mb-8" />
              <div className="space-y-3">
                {Array.from({ length: 7 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-4 rounded bg-[#EEF2F8] animate-pulse"
                    style={{ width: `${92 - (i % 3) * 13}%` }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
