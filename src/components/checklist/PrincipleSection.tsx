// A collapsible principle group containing its disclosure rows.
import type { ChecklistItem } from "@/lib/types";
import type { DisclosureMatch } from "@/lib/report-extractor";
import { PRINCIPLES } from "./constants";
import type { CalcInputs } from "@/lib/emissions-calculator";
import DisclosureRow from "./DisclosureRow";

export default function PrincipleSection({
  principle, items, expandedId, onToggle, isFirst, collapsed, onCollapse,
  collectedIds, onToggleCollected, matches, calcInputs, onCalcChange,
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
}) {
  const info = PRINCIPLES[principle];
  const collectedCount = items.filter(i => collectedIds.has(i.id)).length;

  return (
    <div className={isFirst ? "" : "border-t-2 border-stone-200"}>
      <button
        onClick={onCollapse}
        aria-expanded={!collapsed}
        className="w-full flex items-center gap-2 px-4 py-2.5 bg-stone-100 border-b border-stone-200
          sticky top-0 z-10 hover:bg-stone-150 transition-colors text-left group pressable"
      >
        <span className={`text-[11px] font-bold font-mono px-2 py-0.5 rounded
          ${info?.bg ?? "bg-stone-200"} ${info?.color ?? "text-stone-700"} border ${info?.border ?? "border-stone-300"}`}>
          {principle}
        </span>
        <span className="text-sm font-semibold text-stone-700 group-hover:text-stone-900">
          {info?.name ?? principle}
        </span>
        <div className="ml-auto flex items-center gap-2">
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
            />
          ))}
        </div>
      </div>
    </div>
  );
}
