import Skeleton from "@/components/Skeleton";

// Shown (Next route loading UI) while the collections list fetches from Supabase.
export default function LoadingCollections() {
  return (
    <div className="max-w-[820px] mx-auto">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-6 w-44" />
          <Skeleton className="h-3.5 w-64" />
        </div>
        <Skeleton className="h-9 w-36 rounded-lg" />
      </div>
      <div className="mt-6 space-y-2.5">
        {[0, 1, 2].map((i) => (
          <div key={i} className="bg-white border border-stone-200 rounded-xl p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-28" />
              </div>
              <Skeleton className="h-7 w-20 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
