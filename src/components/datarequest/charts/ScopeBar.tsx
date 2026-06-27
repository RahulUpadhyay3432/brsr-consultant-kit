// A stacked horizontal bar splitting Scope 1 vs Scope 2 emissions, with a legend.
// Pure CSS (flex widths), no dependency, reduced-motion safe. Values are tCO2e
// already computed upstream (cited GHG calc) — nothing is fabricated here.

function fmt(n: number): string {
  return n.toLocaleString("en-IN", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

export default function ScopeBar({ scope1, scope2 }: { scope1: number; scope2: number }) {
  const total = scope1 + scope2;
  const s1 = total > 0 ? (scope1 / total) * 100 : 0;
  const s2 = total > 0 ? (scope2 / total) * 100 : 0;

  return (
    <div>
      <div className="flex h-3 rounded-full overflow-hidden bg-line" role="img" aria-label={`Scope 1 ${fmt(scope1)} tCO2e, Scope 2 ${fmt(scope2)} tCO2e`}>
        {s1 > 0 && <div className="h-full bg-forest transition-[width] duration-500" style={{ width: `${s1}%` }} />}
        {s2 > 0 && <div className="h-full bg-brand-500 transition-[width] duration-500" style={{ width: `${s2}%` }} />}
      </div>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 mt-3">
        <span className="flex items-center gap-1.5 text-[13.5px] text-ink-body">
          <span className="w-2.5 h-2.5 rounded-sm bg-forest flex-shrink-0" />
          Scope 1 (fuel)
          <span className="text-ink-body tabular-nums">{fmt(scope1)} t</span>
        </span>
        <span className="flex items-center gap-1.5 text-[13.5px] text-ink-body">
          <span className="w-2.5 h-2.5 rounded-sm bg-brand-500 flex-shrink-0" />
          Scope 2 (electricity)
          <span className="text-ink-body tabular-nums">{fmt(scope2)} t</span>
        </span>
        <span className="flex items-center gap-1.5 text-[13.5px] font-semibold text-ink ml-auto">
          Total <span className="tabular-nums">{fmt(total)} tCO₂e</span>
        </span>
      </div>
    </div>
  );
}
