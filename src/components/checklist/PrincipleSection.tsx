// A collapsible principle group containing its disclosure rows.
import type { ChecklistItem } from "@/lib/types";
import type { DisclosureMatch } from "@/lib/report-extractor";
import { PRINCIPLES, type StatusKey } from "./constants";
import type { CalcInputs } from "@/lib/emissions-calculator";
import type { Scope3Inputs } from "@/lib/scope3-calculator";
import DisclosureRow from "./DisclosureRow";

export default function PrincipleSection({
  principle, items, expandedId, onToggle, isFirst, collapsed, onCollapse,
  collectedIds, onToggleCollected, matches, calcInputs, onCalcChange, scope3Inputs, onScope3Change,
}: {
  principle: string;
  items: ChecklistItem[];
  expandedId: string | null;
  onToggle: (id: string) => void;
  isFirst?: boolean;
  collapsed?: boolean;
  onCollapse: () => void;
  collectedIds: Set<string>;
  onToggleCollected: (id: string) => void;
  matches: Record<string, DisclosureMatch> | null;
  calcInputs: CalcInputs;
  onCalcChange: (key: keyof CalcInputs, value: string) => void;
  scope3Inputs: Scope3Inputs;
  onScope3Change: (key: string, value: string) => void;
}) {
  const info = PRINCIPLES[principle];
  const collectedCount = items.filter(i => collectedIds.has(i.id)).length;

  // Per-principle status mix → a small segmented bar (the principle's "readiness" profile).
  const mix = items.reduce((acc, i) => {
    const k = i.status as StatusKey;
    acc[k] = (acc[k] ?? 0) + 1;
    return acc;
  }, {} as Record<StatusKey, number>);

  return (
    <div className={isFirst ? "" : "border-t border-stone-200"}>
      <button
        onClick={onCollapse}
        aria-expanded={!collapsed}
        className="w-full flex items-center gap-2 px-4 py-2.5 bg-stone-100 border-b border-stone-200
          hover:bg-stone-200 transition-colors text-left group pressable"
      >
        <span className={`text-[11px] font-bold font-mono px-2 py-0.5 rounded
          ${info?.bg ?? "bg-stone-200"} ${info?.color ?? "text-stone-700"} border ${info?.border ?? "border-stone-300"}`}>
          {principle}
        </span>
        <span className="text-[15.5px] font-semibold text-stone-800 group-hover:text-stone-900">
          {info?.name ?? principle}
        </span>
        <div className="ml-auto flex items-center gap-2.5">
          {/* Status mix mini-bar, at-a-glance readiness for this principle */}
          <div className="hidden sm:flex items-stretch gap-0.5 h-1.5 w-24 flex-shrink-0"
            title={`${mix.already_tracked ?? 0} ready · ${mix.partially_tracked ?? 0} verify · ${mix.new_data_needed ?? 0} collect${mix.not_applicable ? ` · ${mix.not_applicable} N/A` : ""}`}>
            {(mix.already_tracked ?? 0) > 0 &&
              <div className="bg-emerald-500 rounded-full" style={{ flexGrow: mix.already_tracked }} />}
            {(mix.partially_tracked ?? 0) > 0 &&
              <div className="bg-amber-400 rounded-full" style={{ flexGrow: mix.partially_tracked }} />}
            {(mix.new_data_needed ?? 0) > 0 &&
              <div className="bg-stone-300 rounded-full" style={{ flexGrow: mix.new_data_needed }} />}
            {(mix.not_applicable ?? 0) > 0 &&
              <div className="bg-slate-300 rounded-full" style={{ flexGrow: mix.not_applicable }} />}
          </div>
          {collectedCount > 0 && (
            <span className="text-[10px] font-medium text-emerald-600 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full">
              {collectedCount} collected
            </span>
          )}
          <span className="text-xs text-stone-500 tabular-nums font-medium">
            {items.length} {items.length === 1 ? "item" : "items"}
          </span>
          <svg
            aria-hidden="true"
            className={`w-4 h-4 text-stone-400 transition-transform duration-200 flex-shrink-0
              ${collapsed ? "-rotate-90" : ""}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      <div
        className={`grid overflow-hidden transition-[grid-template-rows] duration-200
          ${collapsed ? "grid-rows-[0fr]" : "grid-rows-[1fr]"}`}
        style={{ transitionTimingFunction: "cubic-bezier(0.23, 1, 0.32, 1)" }}
      >
        <div className="min-h-0">
          {items.map((item, idx) => (
            <DisclosureRow
              key={item.id}
              item={item}
              isOdd={idx % 2 === 1}
              expanded={expandedId === item.id}
              onToggle={() => onToggle(item.id)}
              isCollected={collectedIds.has(item.id)}
              onToggleCollected={() => onToggleCollected(item.id)}
              detectedMatch={matches?.[item.id] ?? null}
              calcInputs={calcInputs}
              onCalcChange={onCalcChange}
              scope3Inputs={scope3Inputs}
              onScope3Change={onScope3Change}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
