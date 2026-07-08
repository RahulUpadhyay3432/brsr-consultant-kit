// All Action Plan checklist state: filters, expand/collapse, collected tracking,
// and the "upload last year's report" detection, plus localStorage persistence
// so the consultant's work (collected items + detection) survives a refresh.
import { useState, useMemo, useRef, useEffect } from "react";
import type { ChecklistItem } from "@/lib/types";
import { extractPdfText } from "@/lib/pdf-extract";
import { detectDisclosures, type DetectionResult } from "@/lib/report-extractor";
import { loadJSON, saveJSON, syncActiveClient, STORAGE_KEYS } from "@/lib/storage";
import { PRINCIPLES, type StatusKey, type TypeKey } from "./constants";
import type { UploadStatus } from "./UploadCard";
import { type CalcInputs, DEFAULT_CALC_INPUTS } from "@/lib/emissions-calculator";
import { type Scope3Inputs, DEFAULT_SCOPE3_INPUTS } from "@/lib/scope3-calculator";

interface ChecklistPersist {
  collectedIds: string[];
  detection: DetectionResult | null;
  uploadInfo: { fileName: string; pageCount: number } | null;
  showOnlyDetected: boolean;
  calcInputs?: CalcInputs;
  scope3Inputs?: Scope3Inputs;
  // View state, persisted so a tab-switch or refresh doesn't lose the
  // consultant's filters / search / expanded sections.
  statusFilter?: StatusKey | "all";
  principleFilter?: string;
  typeFilter?: TypeKey;
  search?: string;
  collapsedSections?: string[];
}

// Sections A & B disclosure ids (e.g. SA-1, SB-1), passed in so the upload
// detection count + "mark all detected" include policy disclosures, not just
// the Section-C fields.
type GeneralLike = { sectionA: { id: string }[]; sectionB: { id: string }[] };

export function useChecklistState(items: ChecklistItem[], general: GeneralLike, seedQuery?: string, demo = false) {
  const abIds = useMemo(
    () => [...general.sectionA, ...general.sectionB].map(d => d.id),
    [general]
  );
  const [statusFilter,      setStatusFilter]      = useState<StatusKey | "all">("all");
  const [principleFilter,   setPrincipleFilter]   = useState<string>("all");
  const [typeFilter,        setTypeFilter]        = useState<TypeKey>("all");
  const [search,            setSearch]            = useState("");
  const [expandedId,        setExpandedId]        = useState<string | null>(null);
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(
    () => new Set(Object.keys(PRINCIPLES))
  );

  // ── Calculator inputs, shared across P6-E1, P6-E7, P6-E3 rows ─────────────
  const [calcInputs, setCalcInputs] = useState<CalcInputs>(DEFAULT_CALC_INPUTS);

  function setCalcInput(key: keyof CalcInputs, value: string) {
    setCalcInputs(prev => ({ ...prev, [key]: value }));
  }

  // ── Scope 3 calculator inputs, the P6-L2 screening calculator ──────────────
  const [scope3Inputs, setScope3Inputs] = useState<Scope3Inputs>(DEFAULT_SCOPE3_INPUTS);

  function setScope3Input(key: string, value: string) {
    setScope3Inputs(prev => ({ ...prev, [key]: value }));
  }

  // ── Collected state, consultant marks data they've already gathered ────────
  const [collectedIds,  setCollectedIds]  = useState<Set<string>>(new Set());
  const [hideCollected, setHideCollected] = useState(false);

  // ── Upload last year's report, client-side detection of documented fields ──
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [detection,    setDetection]    = useState<DetectionResult | null>(null);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>("idle");
  const [uploadInfo,   setUploadInfo]   = useState<{ fileName: string; pageCount: number } | null>(null);
  const [uploadError,  setUploadError]  = useState<string>("");
  const [showOnlyDetected, setShowOnlyDetected] = useState(false);

  // ── Persistence, hydrate once after mount, then save on change ─────────────
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    if (demo) { setHydrated(true); return; } // sample starts clean, reads nothing
    const saved = loadJSON<ChecklistPersist | null>(STORAGE_KEYS.checklist, null);
    if (saved) {
      setCollectedIds(new Set(saved.collectedIds ?? []));
      setDetection(saved.detection ?? null);
      setUploadInfo(saved.uploadInfo ?? null);
      setShowOnlyDetected(!!saved.showOnlyDetected);
      if (saved.calcInputs) setCalcInputs(saved.calcInputs);
      if (saved.scope3Inputs) setScope3Inputs({ ...DEFAULT_SCOPE3_INPUTS, ...saved.scope3Inputs });
      if (saved.statusFilter) setStatusFilter(saved.statusFilter);
      if (saved.principleFilter) setPrincipleFilter(saved.principleFilter);
      if (saved.typeFilter) setTypeFilter(saved.typeFilter);
      if (typeof saved.search === "string") setSearch(saved.search);
      if (saved.collapsedSections) setCollapsedSections(new Set(saved.collapsedSections));
      if (saved.detection || saved.uploadInfo) setUploadStatus("done");
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated || demo) return; // demo mode: interactive in-memory, never persisted
    saveJSON(STORAGE_KEYS.checklist, {
      collectedIds: Array.from(collectedIds),
      detection,
      uploadInfo,
      showOnlyDetected,
      calcInputs,
      scope3Inputs,
      statusFilter,
      principleFilter,
      typeFilter,
      search,
      collapsedSections: Array.from(collapsedSections),
    } satisfies ChecklistPersist);
    // Mirror this progress into the active "My clients" record (on-device).
    syncActiveClient();
  }, [hydrated, collectedIds, detection, uploadInfo, showOnlyDetected, calcInputs, scope3Inputs,
      statusFilter, principleFilter, typeFilter, search, collapsedSections]);

  // ── Global search seed, a query from the app-shell top bar lands here and
  //    seeds the Action Plan search (resetting filters so matches aren't hidden).
  const lastSeedRef = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (!hydrated) return;
    if (seedQuery == null || seedQuery === lastSeedRef.current) return;
    lastSeedRef.current = seedQuery;
    if (!seedQuery) return;
    setSearch(seedQuery);
    setStatusFilter("all");
    setPrincipleFilter("all");
    setTypeFilter("all");
  }, [seedQuery, hydrated]);

  const detectedSet = useMemo(
    () => new Set(detection?.detectedIds ?? []),
    [detection]
  );
  // Only count detections that correspond to disclosures actually in this report
  //, Section-C fields plus the Section A & B (policy) disclosures.
  const detectedInReport = useMemo(
    () => items.filter(i => detectedSet.has(i.id)).length
        + abIds.filter(id => detectedSet.has(id)).length,
    [items, abIds, detectedSet]
  );

  async function handleFile(file: File) {
    setUploadStatus("processing");
    setUploadError("");
    try {
      const { text, pageCount } = await extractPdfText(file);
      if (!text.trim()) {
        setUploadStatus("error");
        setUploadError("Couldn't read any text from this PDF, it may be a scanned image. Try a text-based PDF.");
        return;
      }
      setDetection(detectDisclosures(text));
      setUploadInfo({ fileName: file.name, pageCount });
      setUploadStatus("done");
    } catch {
      setUploadStatus("error");
      setUploadError("Something went wrong reading that file. Please try another PDF.");
    }
  }

  function clearUpload() {
    setDetection(null);
    setUploadInfo(null);
    setUploadStatus("idle");
    setUploadError("");
    setShowOnlyDetected(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function markAllDetectedCollected() {
    setCollectedIds(prev => {
      const next = new Set(prev);
      for (const i of items) if (detectedSet.has(i.id)) next.add(i.id);
      for (const id of abIds) if (detectedSet.has(id)) next.add(id);
      return next;
    });
  }

  function toggleCollected(id: string) {
    setCollectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleExpanded(id: string) {
    setExpandedId(prev => (prev === id ? null : id));
  }

  function toggleSection(principle: string) {
    setCollapsedSections(prev => {
      const next = new Set(prev);
      if (next.has(principle)) next.delete(principle);
      else { next.add(principle); setExpandedId(null); }
      return next;
    });
  }

  // ── Derived counts / filtering ──────────────────────────────────────────────
  const statusCounts = useMemo(() => ({
    all:               items.length,
    already_tracked:   items.filter(i => i.status === "already_tracked").length,
    partially_tracked: items.filter(i => i.status === "partially_tracked").length,
    new_data_needed:   items.filter(i => i.status === "new_data_needed").length,
    not_applicable:    items.filter(i => i.status === "not_applicable").length,
  }), [items]);

  const principleCounts = useMemo(() => {
    const base = statusFilter === "all" ? items : items.filter(i => i.status === statusFilter);
    const counts: Record<string, number> = {};
    for (const item of base) counts[item.principle] = (counts[item.principle] || 0) + 1;
    return counts;
  }, [items, statusFilter]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return items.filter(item => {
      if (statusFilter !== "all"    && item.status         !== statusFilter)    return false;
      if (principleFilter !== "all" && item.principle      !== principleFilter) return false;
      if (typeFilter !== "all"      && item.indicator_type !== typeFilter)       return false;
      if (q && !item.label.toLowerCase().includes(q) && !item.id.toLowerCase().includes(q)) return false;
      if (hideCollected && collectedIds.has(item.id))                           return false;
      if (showOnlyDetected && !detectedSet.has(item.id))                        return false;
      return true;
    });
  }, [items, statusFilter, principleFilter, typeFilter, search, hideCollected, collectedIds, showOnlyDetected, detectedSet]);

  const grouped = useMemo(() => {
    const groups: Record<string, ChecklistItem[]> = {};
    for (const item of filtered) {
      if (!groups[item.principle]) groups[item.principle] = [];
      groups[item.principle].push(item);
    }
    return groups;
  }, [filtered]);

  const principleKeys = Object.keys(grouped).sort();

  function clearFilters() {
    setStatusFilter("all");
    setPrincipleFilter("all");
    setTypeFilter("all");
    setSearch("");
  }

  return {
    // filters
    statusFilter, setStatusFilter, principleFilter, setPrincipleFilter,
    typeFilter, setTypeFilter, search, setSearch, clearFilters,
    // expand / collapse
    expandedId, toggleExpanded, collapsedSections, toggleSection,
    // collected
    collectedIds, toggleCollected, markAllDetectedCollected, hideCollected, setHideCollected,
    // upload / detection
    fileInputRef, detection, uploadStatus, uploadInfo, uploadError,
    showOnlyDetected, setShowOnlyDetected, handleFile, clearUpload,
    detectedSet, detectedInReport,
    // calculator inputs (shared across P6-E1 / P6-E7 / P6-E3)
    calcInputs, setCalcInput,
    // Scope 3 screening calculator inputs (P6-L2)
    scope3Inputs, setScope3Input,
    // derived
    statusCounts, principleCounts, filtered, grouped, principleKeys,
  };
}
