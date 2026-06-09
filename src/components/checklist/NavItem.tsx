// Sidebar nav item for the checklist status/topic filters.
export default function NavItem({
  label, sublabel, count, dot, active, dimmed, onClick,
}: {
  label: string;
  sublabel?: string;
  count: number;
  dot?: string;
  active?: boolean;
  dimmed?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={dimmed && !active}
      className={`w-full flex items-center justify-between gap-2 px-2 py-1.5 rounded-md
        text-left transition-colors mb-0.5 pressable
        ${active
          ? "bg-forest text-white"
          : dimmed
          ? "text-stone-300 cursor-default"
          : "hover:bg-stone-100"
        }`}
    >
      <div className="flex items-center gap-1.5 min-w-0">
        {dot && <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dot}`} />}
        <div className="min-w-0 flex items-baseline gap-1">
          {sublabel && (
            <span className={`text-[10px] font-bold font-mono flex-shrink-0
              ${active ? "text-white/70" : dimmed ? "text-stone-300" : "text-stone-400"}`}>
              {sublabel}
            </span>
          )}
          <p className={`text-[12px] font-medium truncate leading-tight
            ${active ? "text-white" : dimmed ? "text-stone-300" : "text-stone-700"}`}>
            {label}
          </p>
        </div>
      </div>
      <span className={`text-[11px] tabular-nums flex-shrink-0 whitespace-nowrap
        ${active ? "text-white/75" : dimmed ? "text-stone-300" : "text-stone-500"}`}>
        {sublabel ? `${count} fields` : count}
      </span>
    </button>
  );
}
