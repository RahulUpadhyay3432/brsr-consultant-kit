import Skeleton from "@/components/Skeleton";

// Shown while a campaign's detail (owners, items, emissions, evidence) fetches.
export default function LoadingCampaign() {
  return (
    <div className="max-w-[820px] mx-auto">
      <Skeleton className="h-3.5 w-28" />
      <div className="flex items-start justify-between gap-4 mt-3">
        <div className="space-y-2">
          <Skeleton className="h-6 w-52" />
          <Skeleton className="h-3.5 w-40" />
        </div>
        <Skeleton className="h-8 w-28 rounded-lg" />
      </div>
      {/* emissions / assurance block */}
      <Skeleton className="h-28 w-full rounded-xl mt-5" />
      {/* owner cards */}
      <div className="mt-5 space-y-3">
        {[0, 1].map((i) => (
          <div key={i} className="bg-white border border-stone-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-3/4" />
          </div>
        ))}
      </div>
    </div>
  );
}
