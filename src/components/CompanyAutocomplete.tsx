"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import companiesData from "@/data/companies.json";
import { INDUSTRY_LABELS, type IndustryType, type SectorType } from "@/lib/types";

export interface Company {
  name: string;
  industry: IndustryType;
  sector: SectorType;
}

const COMPANIES = (companiesData as { companies: Company[] }).companies;

interface Props {
  value: string;
  onChange: (name: string) => void;
  onPick: (company: Company) => void;
}

// Bold the part of the name that matches what the user typed.
function highlightMatch(name: string, q: string) {
  const query = q.trim();
  if (!query) return name;
  const idx = name.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return name;
  return (
    <>
      {name.slice(0, idx)}
      <span className="font-semibold text-brand-700">{name.slice(idx, idx + query.length)}</span>
      {name.slice(idx + query.length)}
    </>
  );
}

export default function CompanyAutocomplete({ value, onChange, onPick }: Props) {
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);

  const matches = useMemo(() => {
    const q = value.trim().toLowerCase();
    if (!q) return [];
    const starts: Company[] = [];
    const includes: Company[] = [];
    for (const c of COMPANIES) {
      const n = c.name.toLowerCase();
      if (n.startsWith(q)) starts.push(c);
      else if (n.includes(q)) includes.push(c);
    }
    return [...starts, ...includes].slice(0, 8);
  }, [value]);

  // Reset the highlighted row whenever the query changes.
  useEffect(() => { setHighlight(0); }, [value]);

  // Close the dropdown on an outside click.
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  // Hide the list if the only match is exactly what's already in the box.
  const showList =
    open &&
    matches.length > 0 &&
    !(matches.length === 1 && matches[0].name.toLowerCase() === value.trim().toLowerCase());

  function pick(c: Company) {
    onPick(c);
    setOpen(false);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (!showList) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, matches.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      pick(matches[highlight]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div ref={wrapRef} className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => { onChange(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        placeholder="Start typing, e.g. Tata Steel…"
        role="combobox"
        aria-expanded={showList}
        aria-autocomplete="list"
        autoComplete="off"
        className="w-full px-4 py-3 rounded-lg border border-stone-200 bg-white text-stone-900
          placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-brand-500/60
          focus:border-brand-500 transition-[border-color,box-shadow] duration-150"
      />
      {showList && (
        <ul
          role="listbox"
          className="absolute z-30 mt-1 w-full max-h-72 overflow-auto rounded-lg border border-stone-200
            bg-white shadow-lg py-1"
        >
          {matches.map((c, i) => (
            <li
              key={c.name}
              role="option"
              aria-selected={i === highlight}
              onMouseEnter={() => setHighlight(i)}
              onMouseDown={(e) => { e.preventDefault(); pick(c); }}
              className={`flex items-center justify-between gap-3 px-3 py-2 cursor-pointer text-sm ${
                i === highlight ? "bg-brand-50" : "hover:bg-stone-50"
              }`}
            >
              <span className="text-stone-800 truncate">{highlightMatch(c.name, value)}</span>
              <span className="text-[10px] text-stone-400 flex-shrink-0 whitespace-nowrap">
                {INDUSTRY_LABELS[c.industry]}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
