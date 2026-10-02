import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { MetricStatus, DocStatus, MetricDoc } from '../data/types';

export interface DocEntry {
  id: string;
  metricId: string;
  name: string;
  type: string;
  year: string;
  description: string;
  url: string;
  status: DocStatus;
  uploadProgress: number;
  createdAt: number;
  isImage?: boolean;
}

export interface LinkEntry { id: string; metricId: string; title: string; url: string; }
export interface TableRow { id: string; values: string[]; }

export interface CustomModule { id: string; title: string; content: string; }

export const DEFAULT_TABLE_COLS = ['Year', 'Number'];

export interface CustomSub { id: string; text: string; }

/** A row in the Required Documents list — manual default or user-added. */
export interface ReqDocItem { id: string; name: string; custom: boolean; }

interface MetricState {
  status: MetricStatus;
  response: string;
  remarks: string;
  nonApplicable: boolean;
  nonApplicableReason: string;
  /** Selected option (A–E) for option-based metrics. */
  selectedOption: string;
  /** User-edited question text (empty = use manual default). */
  customTitle: string;
  /** User-edited instruction/description (empty = use manual default). */
  customDesc: string;
  /** User-edited sub-question list (null = use manual default). */
  customSubs: CustomSub[] | null;
  /** Required-documents list override (null = manual required-only defaults). Preserves user add above/below order. */
  reqDocsOverride: ReqDocItem[] | null;
  tables: Record<string, TableRow[]>;
  /** Per-sub-module responses, keyed by sub-question id (e.g. "1.1.2.1") or module key. */
  subResponses: Record<string, string>;
  /** Tables marked as intentionally empty ("Mark as empty"). */
  tableEmpty: Record<string, boolean>;
  /** User-added columns per table ("Add Column"). Legacy — kept for migration. */
  extraCols: Record<string, string[]>;
  /** Effective column names per table. Defaults to Year/Number. User can rename/add/remove. */
  tableCols: Record<string, string[]>;
  /** User-added modules ("+ Add Module"). */
  customModules: CustomModule[];
  updatedAt: number;
}

interface SSRContextValue {
  metricStates: Record<string, MetricState>;
  docs: DocEntry[];
  links: LinkEntry[];
  formValues: Record<string, string>;
  formTables: Record<string, TableRow[]>;
  formCols: Record<string, string[]>;
  setStatus: (metricId: string, status: MetricStatus) => void;
  setResponse: (metricId: string, v: string) => void;
  setRemarks: (metricId: string, v: string) => void;
  setNonApplicable: (metricId: string, v: boolean, reason?: string) => void;
  setSelectedOption: (metricId: string, v: string) => void;
  setCustomTitle: (metricId: string, v: string) => void;
  setCustomDesc: (metricId: string, v: string) => void;
  getCustomSubs: (metricId: string) => CustomSub[] | null;
  setCustomSubs: (metricId: string, subs: CustomSub[] | null) => void;
  getReqDocs: (metricId: string, defaults: MetricDoc[]) => ReqDocItem[];
  addReqDoc: (metricId: string, index: number, placement: 'above' | 'below', name: string, defaults: MetricDoc[]) => void;
  removeReqDoc: (metricId: string, id: string) => void;
  resetReqDocs: (metricId: string) => void;
  getTable: (metricId: string, tableIdx: number) => TableRow[];
  setTable: (metricId: string, tableIdx: number, rows: TableRow[]) => void;
  setSubResponse: (metricId: string, subId: string, v: string) => void;
  setTableEmpty: (metricId: string, tableIdx: number, v: boolean) => void;
  getTableCols: (metricId: string, tableIdx: number) => string[];
  setTableCols: (metricId: string, tableIdx: number, cols: string[]) => void;
  renameTableColumn: (metricId: string, tableIdx: number, colIdx: number, newName: string) => void;
  addTableColumn: (metricId: string, tableIdx: number, colName: string) => void;
  removeTableColumn: (metricId: string, tableIdx: number, colName: string) => void;
  removeTableColumnByIndex: (metricId: string, tableIdx: number, colIdx: number) => void;
  resetTableCols: (metricId: string, tableIdx: number) => void;
  addCustomModule: (metricId: string, title: string) => void;
  setCustomModule: (metricId: string, moduleId: string, patch: Partial<CustomModule>) => void;
  removeCustomModule: (metricId: string, moduleId: string) => void;
  addDoc: (d: Omit<DocEntry, 'id' | 'createdAt' | 'uploadProgress' | 'status'> & { status?: DocStatus }) => void;
  removeDoc: (id: string) => void;
  verifyDoc: (id: string) => void;
  addLink: (metricId: string, title: string, url: string) => void;
  removeLink: (id: string) => void;
  setFormValue: (key: string, v: string) => void;
  getFormTable: (key: string) => TableRow[];
  setFormTable: (key: string, rows: TableRow[]) => void;
  getFormCols: (key: string, fallback: string[]) => string[];
  setFormCols: (key: string, cols: string[]) => void;
  resetAll: () => void;
  getMetric: (metricId: string) => MetricState;
}

const SSRContext = createContext<SSRContextValue | null>(null);
const LS_KEY = 'naac-ssr-workspace-v1';

function defaultMetric(): MetricState {
  return { status: 'not-started', response: '', remarks: '', nonApplicable: false, nonApplicableReason: '', selectedOption: '', customTitle: '', customDesc: '', customSubs: null, reqDocsOverride: null, tables: {}, subResponses: {}, tableEmpty: {}, extraCols: {}, tableCols: {}, customModules: [], updatedAt: Date.now() };
}

/** Merge persisted state with defaults so older saved workspaces keep working. */
function withDefaults(s: Partial<MetricState>): MetricState {
  return { ...defaultMetric(), ...s, tables: s.tables ?? {}, subResponses: s.subResponses ?? {}, tableEmpty: s.tableEmpty ?? {}, extraCols: s.extraCols ?? {}, tableCols: (s as Partial<MetricState>).tableCols ?? {}, customModules: s.customModules ?? [], customSubs: (s as Partial<MetricState>).customSubs ?? null, reqDocsOverride: (s as Partial<MetricState>).reqDocsOverride ?? null };
}

/** Manual truth: ONLY docs flagged required for this metric — never support docs, never other metrics' docs. */
function baseReqDocs(defaults: MetricDoc[]): ReqDocItem[] {
  return defaults.filter((d) => d.required).map((d, i) => ({ id: `base-${i}`, name: d.name, custom: false }));
}

function normalizeRows(rows: TableRow[], colCount: number): TableRow[] {
  return rows.map((r) => {
    const vals = [...(r.values ?? [])];
    while (vals.length < colCount) vals.push('');
    return { ...r, values: vals.slice(0, Math.max(colCount, 1)) };
  });
}

function loadLS(key: string) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch { return null; }
}

export function SSRProvider({ children, instKey }: { children: React.ReactNode; instKey: string }) {
  const [metricStates, setMetricStates] = useState<Record<string, MetricState>>({});
  const [docs, setDocs] = useState<DocEntry[]>([]);
  const [links, setLinks] = useState<LinkEntry[]>([]);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [formTables, setFormTables] = useState<Record<string, TableRow[]>>({});
  const [formCols, setFormColsState] = useState<Record<string, string[]>>({});
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const storeKey = `${LS_KEY}-${instKey}`;

  useEffect(() => {
    const saved = loadLS(storeKey);
    const rawStates: Record<string, Partial<MetricState>> = saved?.metricStates || {};
    const normalized: Record<string, MetricState> = {};
    Object.keys(rawStates).forEach((k) => { normalized[k] = withDefaults(rawStates[k]); });
    setMetricStates(normalized);
    setDocs(saved?.docs || []);
    setLinks(saved?.links || []);
    setFormValues(saved?.formValues || {});
    setFormTables(saved?.formTables || {});
    setFormColsState(saved?.formCols || {});
    setLoadedKey(storeKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [instKey]);

  useEffect(() => {
    if (loadedKey !== storeKey) return;
    try { localStorage.setItem(storeKey, JSON.stringify({ metricStates, docs, links, formValues, formTables, formCols })); } catch { /* noop */ }
  }, [metricStates, docs, links, formValues, formTables, formCols, loadedKey, storeKey]);

  const value = useMemo<SSRContextValue>(() => {
    const touch = (id: string, patch: Partial<MetricState>) =>
      setMetricStates((p) => ({ ...p, [id]: { ...(p[id] ?? defaultMetric()), ...patch, updatedAt: Date.now() } }));
    const effectiveCols = (metricId: string, tableIdx: number): string[] => {
      const cur = metricStates[metricId];
      const custom = cur?.tableCols?.[String(tableIdx)];
      if (custom && custom.length > 0) return [...custom];
      return [...DEFAULT_TABLE_COLS];
    };
    return {
      metricStates, docs, links, formValues, formTables, formCols,
      getMetric: (id) => metricStates[id] ?? defaultMetric(),
      setStatus: (id, status) => touch(id, { status }),
      setResponse: (id, v) => {
        const cur = metricStates[id]?.status ?? 'not-started';
        touch(id, { response: v, status: cur === 'not-started' && v.trim() ? 'in-progress' : cur });
      },
      setRemarks: (id, v) => touch(id, { remarks: v }),
      setNonApplicable: (id, v, reason = '') => touch(id, { nonApplicable: v, nonApplicableReason: reason }),
      setSelectedOption: (id, v) => {
        const cur = metricStates[id]?.status ?? 'not-started';
        touch(id, { selectedOption: v, status: cur === 'not-started' && v ? 'in-progress' : cur });
      },
      setCustomTitle: (id, v) => touch(id, { customTitle: v }),
      setCustomDesc: (id, v) => touch(id, { customDesc: v }),
      getCustomSubs: (id) => metricStates[id]?.customSubs ?? null,
      setCustomSubs: (id, subs) => touch(id, { customSubs: subs }),
      getReqDocs: (metricId, defaults) => {
        const cur = metricStates[metricId]?.reqDocsOverride;
        if (cur) return [...cur];
        return baseReqDocs(defaults);
      },
      addReqDoc: (metricId, index, placement, name, defaults) =>
        setMetricStates((p) => {
          const trimmed = name.trim();
          if (!trimmed) return p;
          const cur = withDefaults(p[metricId] ?? {});
          const base = cur.reqDocsOverride ?? baseReqDocs(defaults);
          const at = Math.max(0, Math.min(placement === 'above' ? index : index + 1, base.length));
          const item: ReqDocItem = { id: `custom-${Date.now()}-${Math.floor(Math.random() * 10000)}`, name: trimmed, custom: true };
          const next = [...base.slice(0, at), item, ...base.slice(at)];
          return { ...p, [metricId]: { ...cur, reqDocsOverride: next, updatedAt: Date.now() } };
        }),
      removeReqDoc: (metricId, id) =>
        setMetricStates((p) => {
          const cur = withDefaults(p[metricId] ?? {});
          if (!cur.reqDocsOverride) return p;
          const target = cur.reqDocsOverride.find((x) => x.id === id);
          if (!target || !target.custom) return p;
          return { ...p, [metricId]: { ...cur, reqDocsOverride: cur.reqDocsOverride.filter((x) => x.id !== id), updatedAt: Date.now() } };
        }),
      resetReqDocs: (metricId) =>
        setMetricStates((p) => {
          const cur = withDefaults(p[metricId] ?? {});
          if (!cur.reqDocsOverride) return p;
          return { ...p, [metricId]: { ...cur, reqDocsOverride: null, updatedAt: Date.now() } };
        }),
      getTable: (metricId, tableIdx) => metricStates[`${metricId}::${tableIdx}`]?.tables?.[String(tableIdx)] ?? metricStates[metricId]?.tables?.[String(tableIdx)] ?? [],
      setTable: (metricId, tableIdx, rows) =>
        setMetricStates((p) => ({ ...p, [metricId]: { ...withDefaults(p[metricId] ?? {}), tables: { ...(p[metricId]?.tables ?? {}), [String(tableIdx)]: rows }, status: (p[metricId]?.status ?? 'not-started') === 'not-started' && rows.length > 0 ? 'in-progress' : (p[metricId]?.status ?? 'not-started'), updatedAt: Date.now() } })),
      setSubResponse: (metricId, subId, v) =>
        setMetricStates((p) => { const cur = withDefaults(p[metricId] ?? {}); return { ...p, [metricId]: { ...cur, subResponses: { ...cur.subResponses, [subId]: v }, status: cur.status === 'not-started' && v.trim() ? 'in-progress' : cur.status, updatedAt: Date.now() } }; }),
      setTableEmpty: (metricId, tableIdx, v) =>
        setMetricStates((p) => { const cur = withDefaults(p[metricId] ?? {}); return { ...p, [metricId]: { ...cur, tableEmpty: { ...cur.tableEmpty, [String(tableIdx)]: v }, updatedAt: Date.now() } }; }),
      getTableCols: (metricId, tableIdx) => effectiveCols(metricId, tableIdx),
      setTableCols: (metricId, tableIdx, cols) =>
        setMetricStates((p) => {
          const cur = withDefaults(p[metricId] ?? {});
          const key = String(tableIdx);
          const clean = cols.length > 0 ? cols : [...DEFAULT_TABLE_COLS];
          const rows = normalizeRows(cur.tables[key] ?? [], clean.length);
          return { ...p, [metricId]: { ...cur, tableCols: { ...cur.tableCols, [key]: clean }, tables: { ...cur.tables, [key]: rows }, updatedAt: Date.now() } };
        }),
      renameTableColumn: (metricId, tableIdx, colIdx, newName) =>
        setMetricStates((p) => {
          const cur = withDefaults(p[metricId] ?? {});
          const key = String(tableIdx);
          const base = cur.tableCols[key] && cur.tableCols[key].length > 0 ? [...cur.tableCols[key]] : [...DEFAULT_TABLE_COLS];
          if (colIdx < 0 || colIdx >= base.length) return p;
          base[colIdx] = newName;
          return { ...p, [metricId]: { ...cur, tableCols: { ...cur.tableCols, [key]: base }, updatedAt: Date.now() } };
        }),
      addTableColumn: (metricId, tableIdx, colName) =>
        setMetricStates((p) => {
          const cur = withDefaults(p[metricId] ?? {});
          const key = String(tableIdx);
          const base = cur.tableCols[key] && cur.tableCols[key].length > 0 ? [...cur.tableCols[key]] : [...DEFAULT_TABLE_COLS];
          const name = colName.trim() || `Column ${base.length + 1}`;
          const next = [...base, name];
          const rows = (cur.tables[key] ?? []).map((r) => ({ ...r, values: [...r.values, ''] }));
          return { ...p, [metricId]: { ...cur, tableCols: { ...cur.tableCols, [key]: next }, tables: { ...cur.tables, [key]: rows }, updatedAt: Date.now() } };
        }),
      removeTableColumn: (metricId, tableIdx, colName) =>
        setMetricStates((p) => {
          const cur = withDefaults(p[metricId] ?? {});
          const key = String(tableIdx);
          // Legacy extraCols path
          const extras = cur.extraCols[key] ?? [];
          const ei = extras.indexOf(colName);
          if (ei >= 0) {
            return { ...p, [metricId]: { ...cur, extraCols: { ...cur.extraCols, [key]: extras.filter((_, i) => i !== ei) }, updatedAt: Date.now() } };
          }
          // New Year/Number path: remove by name match
          const base = cur.tableCols[key] && cur.tableCols[key].length > 0 ? [...cur.tableCols[key]] : [...DEFAULT_TABLE_COLS];
          const idx = base.indexOf(colName);
          if (idx < 0 || base.length <= 1) return p;
          const next = base.filter((_, i) => i !== idx);
          const rows = (cur.tables[key] ?? []).map((r) => ({ ...r, values: r.values.filter((_, vi) => vi !== idx) }));
          return { ...p, [metricId]: { ...cur, tableCols: { ...cur.tableCols, [key]: next }, tables: { ...cur.tables, [key]: rows }, updatedAt: Date.now() } };
        }),
      removeTableColumnByIndex: (metricId, tableIdx, colIdx) =>
        setMetricStates((p) => {
          const cur = withDefaults(p[metricId] ?? {});
          const key = String(tableIdx);
          const base = cur.tableCols[key] && cur.tableCols[key].length > 0 ? [...cur.tableCols[key]] : [...DEFAULT_TABLE_COLS];
          if (colIdx < 0 || colIdx >= base.length || base.length <= 1) return p;
          const next = base.filter((_, i) => i !== colIdx);
          const rows = (cur.tables[key] ?? []).map((r) => ({ ...r, values: r.values.filter((_, vi) => vi !== colIdx) }));
          return { ...p, [metricId]: { ...cur, tableCols: { ...cur.tableCols, [key]: next }, tables: { ...cur.tables, [key]: rows }, updatedAt: Date.now() } };
        }),
      resetTableCols: (metricId, tableIdx) =>
        setMetricStates((p) => {
          const cur = withDefaults(p[metricId] ?? {});
          const key = String(tableIdx);
          const next = [...DEFAULT_TABLE_COLS];
          const rows = normalizeRows(cur.tables[key] ?? [], next.length);
          const nc = { ...cur.tableCols };
          delete nc[key];
          return { ...p, [metricId]: { ...cur, tableCols: nc, tables: { ...cur.tables, [key]: rows }, updatedAt: Date.now() } };
        }),
      addCustomModule: (metricId, title) =>
        setMetricStates((p) => { const cur = withDefaults(p[metricId] ?? {}); return { ...p, [metricId]: { ...cur, customModules: [...cur.customModules, { id: `mod-${Date.now()}`, title, content: '' }], updatedAt: Date.now() } }; }),
      setCustomModule: (metricId, moduleId, patch) =>
        setMetricStates((p) => { const cur = withDefaults(p[metricId] ?? {}); return { ...p, [metricId]: { ...cur, customModules: cur.customModules.map((m) => (m.id === moduleId ? { ...m, ...patch } : m)), updatedAt: Date.now() } }; }),
      removeCustomModule: (metricId, moduleId) =>
        setMetricStates((p) => { const cur = withDefaults(p[metricId] ?? {}); return { ...p, [metricId]: { ...cur, customModules: cur.customModules.filter((m) => m.id !== moduleId), updatedAt: Date.now() } }; }),
      addDoc: (d) => {
        const id = `doc-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
        const entry: DocEntry = { ...d, id, createdAt: Date.now(), uploadProgress: 0, status: d.status ?? 'added' };
        setDocs((p) => [...p, entry]);
        // simulate upload progress
        let pr = 0;
        const iv = setInterval(() => {
          pr += 25;
          setDocs((p) => p.map((x) => (x.id === id ? { ...x, uploadProgress: Math.min(100, pr) } : x)));
          if (pr >= 100) clearInterval(iv);
        }, 180);
        // auto move metric to in-progress
        setMetricStates((p) => ({ ...p, [d.metricId]: { ...(p[d.metricId] ?? defaultMetric()), status: (p[d.metricId]?.status ?? 'not-started') === 'not-started' ? 'in-progress' : (p[d.metricId]?.status ?? 'not-started'), updatedAt: Date.now() } }));
      },
      removeDoc: (id) => setDocs((p) => p.filter((x) => x.id !== id)),
      verifyDoc: (id) => setDocs((p) => p.map((x) => (x.id === id ? { ...x, status: 'verified' as DocStatus } : x))),
      addLink: (metricId, title, url) => setLinks((p) => [...p, { id: `lnk-${Date.now()}-${Math.floor(Math.random() * 10000)}`, metricId, title, url }]),
      removeLink: (id) => setLinks((p) => p.filter((x) => x.id !== id)),
      setFormValue: (key, v) => setFormValues((p) => ({ ...p, [key]: v })),
      getFormTable: (key) => formTables[key] ?? [],
      setFormTable: (key, rows) => setFormTables((p) => ({ ...p, [key]: rows })),
      getFormCols: (key, fallback) => formCols[key] && formCols[key].length > 0 ? [...formCols[key]] : [...fallback],
      setFormCols: (key, cols) => {
        const clean = cols.length > 0 ? cols : [...DEFAULT_TABLE_COLS];
        setFormColsState((p) => ({ ...p, [key]: clean }));
        setFormTables((p) => ({ ...p, [key]: normalizeRows(p[key] ?? [], clean.length) }));
      },
      resetAll: () => { setMetricStates({}); setDocs([]); setLinks([]); setFormValues({}); setFormTables({}); setFormColsState({}); try { localStorage.removeItem(storeKey); } catch { /* noop */ } },
    };
  }, [metricStates, docs, links, formValues, formTables, formCols, storeKey]);

  return <SSRContext.Provider value={value}>{children}</SSRContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSSR() {
  const ctx = useContext(SSRContext);
  if (!ctx) throw new Error('useSSR must be used within SSRProvider');
  return ctx;
}

export function statusMeta(s: MetricStatus) {
  if (s === 'completed') return { label: 'Completed', dot: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' };
  if (s === 'in-progress') return { label: 'In Progress', dot: 'bg-amber-500', text: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' };
  return { label: 'Not Started', dot: 'bg-slate-300', text: 'text-slate-600', bg: 'bg-slate-50 border-slate-200' };
}

export function uid() { return `${Date.now()}-${Math.floor(Math.random() * 100000)}`; }
