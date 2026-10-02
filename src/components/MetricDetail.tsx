import { useMemo, useState } from 'react';
import {
  ArrowLeft, ArrowRight, FileText, Paperclip, Link2,
  Plus, Trash2, ExternalLink, Check, X, ImagePlus,
  ChevronLeft, ChevronRight, ChevronDown, Star, ShieldCheck, Ban, Info, Pencil, RotateCcw,
} from 'lucide-react';
import type { InstitutionData, Metric } from '../data/types';
import { NOT_SPECIFIED } from '../data/types';
import { useSSR, statusMeta, uid } from '../store/ssrStore';
import type { ViewKind } from './Layout';

function isValidUrl(s: string) {
  try { const u = new URL(s); return u.protocol === 'http:' || u.protocol === 'https:'; } catch { return false; }
}

const CRIT_SHORT: Record<number, string> = {
  1: 'Curriculum', 2: 'Teaching-Learning', 3: 'Research & Extension', 4: 'Infrastructure',
  5: 'Student Support', 6: 'Governance', 7: 'Values & Practices',
};

type TabId = 'overview' | 'data' | 'docs' | 'evidence' | 'response';

const TABS: { id: TabId; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'data', label: 'Data Requirements' },
  { id: 'docs', label: 'Documents' },
  { id: 'evidence', label: 'Evidence & Links' },
  { id: 'response', label: 'Response & Notes' },
];

/** Small caps grey label like the reference: METRIC ID, METRIC TYPE... (Overview – Option B, unchanged) */
function FieldLabel({ children }: { children: React.ReactNode }) {
  return <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{children}</div>;
}

function NotSpecified({ label }: { label?: string }) {
  return <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-3 text-[12.5px] italic text-slate-500">{label ?? NOT_SPECIFIED}</div>;
}

/* ── Option A UI kit (only for Data / Documents / Evidence / Response tabs) ── */
function OptALabel({ children }: { children: React.ReactNode }) {
  return <div className="text-[12px] font-bold uppercase tracking-wider text-slate-500">{children}</div>;
}

function OptAPurpleButton({ children, onClick, ariaLabel }: { children: React.ReactNode; onClick: () => void; ariaLabel?: string }) {
  return (
    <button
      onClick={onClick}
      aria-label={ariaLabel}
      className="flex w-full items-center justify-center gap-1.5 rounded-md bg-purple-700 px-4 py-2.5 text-[14px] font-semibold text-white transition hover:bg-purple-800"
    >
      {children}
    </button>
  );
}

function OptAEmpty({ children }: { children: React.ReactNode }) {
  return <div className="mt-3 text-center text-[13px] text-slate-400">{children}</div>;
}

function OptARequiredCard({ title, sub, subHighlight, done }: { title: string; sub?: string; subHighlight?: string; done?: boolean }) {
  return (
    <div className={done ? 'rounded-md border border-emerald-200 bg-emerald-50 p-3' : 'rounded-md border border-amber-200 bg-amber-50 p-3'}>
      <div className="flex items-center gap-2">
        <span className={`h-2 w-2 shrink-0 rounded-full ${done ? 'bg-emerald-500' : 'bg-red-500'}`} />
        <span className="text-[13.5px] font-semibold text-slate-800">{title}</span>
      </div>
      {(sub || subHighlight) && (
        <div className="mt-1 pl-4 text-[12px] text-slate-500">
          {sub}
          {sub && subHighlight ? ' · ' : ''}
          {subHighlight && <span className={`font-medium ${done ? 'text-emerald-600' : 'text-red-600'}`}>{subHighlight}</span>}
        </div>
      )}
    </div>
  );
}

function OptAImagePlaceholder() {
  return (
    <div className="mt-3 flex h-[170px] items-center justify-center rounded-lg bg-slate-100">
      <ImagePlus size={36} className="text-slate-300" />
    </div>
  );
}

const optAInput =
  'w-full rounded-md border border-slate-300 px-3 py-2 text-[13px] text-slate-800 placeholder:text-slate-400 focus:border-purple-600 focus:outline-none';
const optASecondaryBtn =
  'flex items-center gap-1 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-[12px] font-semibold text-slate-600 hover:bg-slate-50';

export function MetricDetail({ data, metric, onNavigate }: { data: InstitutionData; metric: Metric; onNavigate: (v: ViewKind) => void }) {
  const ssr = useSSR();
  const st = ssr.getMetric(metric.id);
  const meta = statusMeta(st.status);
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [showGuide, setShowGuide] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState('');
  const [editingDesc, setEditingDesc] = useState(false);
  const [descDraft, setDescDraft] = useState('');
  const [editingSub, setEditingSub] = useState<Record<string, boolean>>({});
  const [subDrafts, setSubDrafts] = useState<Record<string, string>>({});
  const [addingSub, setAddingSub] = useState(false);
  const [newSubText, setNewSubText] = useState('');
  const [docForm, setDocForm] = useState({ name: '', type: 'PDF Document', year: '', description: '', url: '' });
  const [linkForm, setLinkForm] = useState({ title: '', url: '' });
  const [linkErr, setLinkErr] = useState('');
  const [imgForm, setImgForm] = useState({ name: '', description: '', date: '', location: '', caption: '' });
  const [newCol, setNewCol] = useState<Record<number, string>>({});
  const [addingCol, setAddingCol] = useState<Record<number, boolean>>({});
  const [showDocForm, setShowDocForm] = useState(false);
  const [showLinkForm, setShowLinkForm] = useState(false);
  const [showImgForm, setShowImgForm] = useState(false);
  const [addingReq, setAddingReq] = useState<{ index: number; placement: 'above' | 'below' } | null>(null);
  const [reqDraft, setReqDraft] = useState('');

  const siblings = useMemo(() => {
    const all: Metric[] = [];
    data.criteria.forEach((c) => c.keyIndicators.forEach((ki) => ki.metrics.forEach((mt) => all.push(mt))));
    return all;
  }, [data]);
  const idx = siblings.findIndex((m) => m.id === metric.id);
  const prev = idx > 0 ? siblings[idx - 1] : null;
  const next = idx < siblings.length - 1 ? siblings[idx + 1] : null;
  const ki = data.criteria.flatMap((c) => c.keyIndicators).find((k) => k.id === metric.kiId);
  const crit = data.criteria.find((c) => c.id === metric.criterionId);
  const kiSiblings = useMemo(() => crit?.keyIndicators ?? [], [crit]);
  const metricSiblings = useMemo(() => ki?.metrics ?? [], [ki]);
  const myDocs = ssr.docs.filter((d) => d.metricId === metric.id);
  const myLinks = ssr.links.filter((l) => l.metricId === metric.id);
  const wordLimit = metric.wordLimit ?? 500;
  const wordCount = st.response.trim() ? st.response.trim().split(/\s+/).length : 0;
  const subResponses = st.subResponses ?? {};
  const customModules = st.customModules ?? [];
  const isEmptyMarked = (ti: number) => !!st.tableEmpty?.[String(ti)];
  const letter = (i: number) => `(${String.fromCharCode(65 + i)})`;

  const isQlM = metric.type === 'QlM';

  // Effective (editable) question content — defaults from manual, overridable per metric.
  const effectiveTitle = st.customTitle?.trim() ? st.customTitle : metric.title;
  const titleModified = !!st.customTitle?.trim();
  const effectiveDesc = st.customDesc?.trim() ? st.customDesc : metric.description;
  const descModified = !!st.customDesc?.trim();
  const defaultSubs = metric.subQuestions ?? [];
  const effectiveSubs = st.customSubs ?? defaultSubs;
  const subsModified = st.customSubs !== null && st.customSubs !== undefined;
  const ensureCustomSubs = (): { id: string; text: string }[] => {
    if (st.customSubs) return [...st.customSubs];
    return defaultSubs.map((s) => ({ id: s.id, text: s.text }));
  };

  // Required documents: ONLY this metric's required items + user-added (above/below).
  const reqDocs = ssr.getReqDocs(metric.id, metric.documentsRequired ?? []);
  const uploadedDocs = useMemo(() => myDocs.filter((d) => !d.isImage).slice().sort((a, b) => a.createdAt - b.createdAt), [myDocs]);
  const manualReqNames = useMemo(() => (metric.documentsRequired ?? []).filter((d) => d.required).map((d) => d.name), [metric.documentsRequired]);
  const reqModified = !!st.reqDocsOverride && (
    st.reqDocsOverride.length !== manualReqNames.length ||
    st.reqDocsOverride.some((r, i) => r.custom || r.name !== manualReqNames[i])
  );
  const commitReqAdd = () => {
    if (!addingReq || !reqDraft.trim()) return;
    ssr.addReqDoc(metric.id, addingReq.index, addingReq.placement, reqDraft, metric.documentsRequired ?? []);
    setReqDraft('');
    setAddingReq(null);
  };
  const renderReqAddForm = () => (
    <div className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50/50 p-2">
      <input value={reqDraft} onChange={(e) => setReqDraft(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') commitReqAdd(); if (e.key === 'Escape') { setAddingReq(null); setReqDraft(''); } }}
        placeholder="Requirement name…" autoFocus
        className="min-w-0 flex-1 rounded-md border border-slate-300 px-2.5 py-1.5 text-[12px] focus:border-purple-600 focus:outline-none" />
      <button onClick={commitReqAdd} className="rounded-md bg-purple-700 px-3 py-1.5 text-[12px] font-bold text-white">Add</button>
      <button onClick={() => { setAddingReq(null); setReqDraft(''); }} className="rounded-md border border-slate-200 px-2 py-1.5 text-slate-500"><X size={13} /></button>
    </div>
  );

  const saveDoc = () => {
    if (!docForm.name.trim()) return;
    ssr.addDoc({ metricId: metric.id, name: docForm.name.trim(), type: docForm.type, year: docForm.year, description: docForm.description, url: docForm.url });
    setDocForm({ name: '', type: 'PDF Document', year: '', description: '', url: '' });
    setShowDocForm(false);
  };

  const saveLink = () => {
    if (!isValidUrl(linkForm.url)) { setLinkErr('Enter a valid http(s) URL.'); return; }
    ssr.addLink(metric.id, linkForm.title || linkForm.url, linkForm.url);
    setLinkForm({ title: '', url: '' });
    setShowLinkForm(false);
  };

  const saveImage = () => {
    if (!imgForm.name.trim()) return;
    ssr.addDoc({
      metricId: metric.id, name: imgForm.name.trim(), type: 'Image / Photo', year: imgForm.date,
      description: `${imgForm.description}${imgForm.location ? ` · Loc: ${imgForm.location}` : ''}${imgForm.caption ? ` · Caption: ${imgForm.caption}` : ''}`,
      url: '', isImage: true,
    });
    setImgForm({ name: '', description: '', date: '', location: '', caption: '' });
    setShowImgForm(false);
  };

  return (
    <div className="space-y-3">
      {/* ── Criterion tab strip ── */}
      <div className="overflow-x-auto rounded-xl border border-[#d5e4e1] bg-white/95 shadow-sm">
        <div className="flex min-w-max divide-x divide-slate-100">
          {data.criteria.map((c) => {
            const active = c.id === metric.criterionId;
            return (
              <button key={c.id} onClick={() => onNavigate({ k: 'criterion', criterionId: c.id })}
                className={`relative px-4 py-2.5 text-center transition ${active ? 'bg-[#eef7f5]' : 'hover:bg-slate-50'}`}>
                <span className={`flex items-center justify-center gap-1 text-[12.5px] font-extrabold ${active ? 'text-[#0b6e5e]' : 'text-slate-600'}`}>
                  Criterion {c.numeral} <ChevronDown size={12} className="text-slate-400" />
                </span>
                <span className="block text-[10.5px] text-slate-400">{CRIT_SHORT[c.id] ?? c.title}</span>
                {active && <span className="absolute inset-x-3 bottom-0 h-[2.5px] rounded-full bg-[#0b6e5e]" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── KI pills + Metric pills ── */}
      <div className="space-y-2">
        <div className="flex gap-1.5 overflow-x-auto rounded-xl border border-slate-200 bg-white p-2 shadow-sm" role="tablist" aria-label="Key Indicators">
          {kiSiblings.map((k) => (
            <button key={k.id} onClick={() => crit && onNavigate({ k: 'criterion', criterionId: crit.id })} title={`KI ${k.id} · ${k.title}`}
              className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-[11.5px] font-bold ${k.id === metric.kiId ? 'bg-[#0b6e5e] text-white shadow' : 'bg-slate-100 text-slate-600 hover:bg-[#e9f3f1]'}`}>{k.id} {k.title}</button>
          ))}
        </div>
        <div className="flex gap-1.5 overflow-x-auto rounded-xl border border-slate-200 bg-white p-2 shadow-sm" role="tablist" aria-label={`Metrics in KI ${metric.kiId}`}>
          {metricSiblings.map((m) => (
            <button key={m.uid ?? m.id} onClick={() => onNavigate({ k: 'metric', metricId: m.id })} aria-current={m.id === metric.id ? 'page' : undefined}
              className={`whitespace-nowrap rounded-lg px-3 py-1.5 font-mono text-[11.5px] font-bold ${m.id === metric.id ? 'bg-[#0b6e5e] text-white shadow' : 'bg-slate-100 text-slate-600 hover:bg-[#e9f3f1]'}`}>{m.id} · {m.weightage}★</button>
          ))}
          <span className="ml-auto flex shrink-0 items-center gap-1.5 pl-2">
            <button disabled={!prev} onClick={() => prev && onNavigate({ k: 'metric', metricId: prev.id })} className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-[11.5px] font-medium disabled:opacity-40" aria-label="Previous metric"><ChevronLeft size={13} /></button>
            <button disabled={!next} onClick={() => next && onNavigate({ k: 'metric', metricId: next.id })} className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-[11.5px] font-medium disabled:opacity-40" aria-label="Next metric"><ChevronRight size={13} /></button>
          </span>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_300px]">
        {/* ══ LEFT: tabbed metric card (Option B + reference tabs) ══ */}
        <div className="min-w-0">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {/* Card header */}
            <div className="flex items-center justify-between gap-2 px-4 pt-4 sm:px-6">
              <span className="rounded-md bg-[#e6f2ef] px-2.5 py-1 font-mono text-[12px] font-extrabold text-[#0b6e5e]">{metric.id}</span>
              <span className="flex items-center gap-1 rounded-full border border-[#9fd0c5] bg-[#eef7f5] px-3 py-1 text-[12px] font-extrabold text-[#0b6e5e]"><Star size={12} /> {metric.weightage} marks</span>
            </div>
            <h1 className="px-4 pt-2 text-[14.5px] font-bold leading-relaxed text-slate-900 sm:px-6">{effectiveTitle}{titleModified && <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 align-middle text-[10px] font-bold text-amber-700">Edited</span>}</h1>
            <div className="flex flex-wrap items-center gap-2 px-4 pt-2 sm:px-6">
              <span className={`rounded px-2 py-0.5 text-[10.5px] font-bold ${isQlM ? 'bg-purple-100 text-purple-700' : 'bg-sky-100 text-sky-700'}`}>{isQlM ? 'Qualitative Metric (QlM)' : 'Quantitative Metric (QnM)'}{metric.optional ? ' · Optional' : ''}</span>
              <span className="text-[11px] text-slate-400">{data.name} · Criterion {crit?.numeral} · KI {metric.kiId} · {metric.dataPeriod}</span>
            </div>

            {/* ── Tab bar (like reference) ── */}
            <div className="mt-3 border-b border-slate-200 px-4 sm:px-6">
              <div className="flex gap-5 overflow-x-auto" role="tablist" aria-label="Metric sections">
                {TABS.map((t) => {
                  const active = activeTab === t.id;
                  return (
                    <button key={t.id} role="tab" aria-selected={active} onClick={() => setActiveTab(t.id)}
                      className={`relative whitespace-nowrap py-3 text-[13px] font-semibold transition ${active ? 'text-purple-700' : 'text-slate-500 hover:text-slate-800'}`}>
                      {t.label}
                      {active && <span className="absolute inset-x-0 -bottom-px h-[2.5px] rounded-full bg-purple-600" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="px-4 py-5 sm:px-6">
              {/* ═══════════ OVERVIEW — unchanged ═══════════ */}
              {activeTab === 'overview' && (
                <div className="space-y-5">
                  <div>
                    <FieldLabel>Metric ID</FieldLabel>
                    <div className="mt-1.5 font-mono text-[15px] font-extrabold text-slate-900">{metric.id}</div>
                  </div>
                  <div>
                    <FieldLabel>Metric Type</FieldLabel>
                    <div className="mt-1.5">
                      <span className={`inline-block rounded-md px-2.5 py-1 text-[12.5px] font-bold ${isQlM ? 'bg-purple-100 text-purple-700' : 'bg-sky-100 text-sky-700'}`}>
                        {isQlM ? 'Qualitative Metric (QlM)' : 'Quantitative Metric (QnM)'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <FieldLabel>Marks / Weightage</FieldLabel>
                    <div className="mt-1.5 text-[16px] font-extrabold text-purple-700">{metric.weightage} marks</div>
                    <div className="mt-0.5 text-[11.5px] text-slate-400">Metric weightage — belongs only to {metric.id} · KI {metric.kiId} weightage: {ki?.weightage ?? '—'} (separate)</div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <FieldLabel>Exact Question</FieldLabel>
                      <span className="flex items-center gap-1.5">
                        {titleModified && <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-700">Modified</span>}
                        {!editingTitle ? (
                          <button onClick={() => { setTitleDraft(effectiveTitle); setEditingTitle(true); }} className="flex items-center gap-1 rounded-md border border-slate-200 px-2 py-1 text-[11px] font-bold text-slate-500 hover:border-[#0b6e5e] hover:text-[#0b6e5e]"><Pencil size={11} /> Modify</button>
                        ) : null}
                      </span>
                    </div>
                    {!editingTitle ? (
                      <p className="mt-1.5 text-[13.5px] leading-relaxed text-slate-800">{effectiveTitle}</p>
                    ) : (
                      <div className="mt-2 space-y-2">
                        <textarea value={titleDraft} onChange={(e) => setTitleDraft(e.target.value)} rows={3} className="w-full rounded-lg border border-[#0b6e5e] px-3 py-2 text-[13px] focus:outline-none" />
                        <div className="flex flex-wrap gap-2">
                          <button onClick={() => { ssr.setCustomTitle(metric.id, titleDraft.trim()); setEditingTitle(false); }} className="rounded-lg bg-[#0b6e5e] px-3 py-1.5 text-[12px] font-bold text-white">Save Question</button>
                          <button onClick={() => setEditingTitle(false)} className="rounded-lg border border-slate-200 px-3 py-1.5 text-[12px] font-bold text-slate-500">Cancel</button>
                          {titleModified && <button onClick={() => { ssr.setCustomTitle(metric.id, ''); setEditingTitle(false); }} className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-[12px] font-bold text-slate-500"><RotateCcw size={12} /> Reset to Manual</button>}
                        </div>
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <FieldLabel>Instruction / Description</FieldLabel>
                      <span className="flex items-center gap-1.5">
                        {descModified && <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-700">Modified</span>}
                        {!editingDesc ? (
                          <button onClick={() => { setDescDraft(effectiveDesc); setEditingDesc(true); }} className="flex items-center gap-1 rounded-md border border-slate-200 px-2 py-1 text-[11px] font-bold text-slate-500 hover:border-[#0b6e5e] hover:text-[#0b6e5e]"><Pencil size={11} /> Modify</button>
                        ) : null}
                      </span>
                    </div>
                    {!editingDesc ? (
                      <p className="mt-1.5 text-[13px] leading-relaxed text-slate-700">{effectiveDesc}</p>
                    ) : (
                      <div className="mt-2 space-y-2">
                        <textarea value={descDraft} onChange={(e) => setDescDraft(e.target.value)} rows={3} className="w-full rounded-lg border border-[#0b6e5e] px-3 py-2 text-[13px] focus:outline-none" />
                        <div className="flex flex-wrap gap-2">
                          <button onClick={() => { ssr.setCustomDesc(metric.id, descDraft.trim()); setEditingDesc(false); }} className="rounded-lg bg-[#0b6e5e] px-3 py-1.5 text-[12px] font-bold text-white">Save</button>
                          <button onClick={() => setEditingDesc(false)} className="rounded-lg border border-slate-200 px-3 py-1.5 text-[12px] font-bold text-slate-500">Cancel</button>
                          {descModified && <button onClick={() => { ssr.setCustomDesc(metric.id, ''); setEditingDesc(false); }} className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-[12px] font-bold text-slate-500"><RotateCcw size={12} /> Reset to Manual</button>}
                        </div>
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <FieldLabel>Sub-Questions ({effectiveSubs.length})</FieldLabel>
                      <span className="flex items-center gap-1.5">
                        {subsModified && <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-700">Modified</span>}
                        {subsModified && <button onClick={() => ssr.setCustomSubs(metric.id, null)} className="flex items-center gap-1 rounded-md border border-slate-200 px-2 py-1 text-[11px] font-bold text-slate-500 hover:text-red-600"><RotateCcw size={11} /> Reset</button>}
                      </span>
                    </div>
                    <div className="mt-2 space-y-2">
                      {effectiveSubs.length > 0 ? effectiveSubs.map((s) => (
                        <div key={s.id} className="rounded-lg border border-slate-200 bg-white p-3">
                          <div className="flex items-center gap-2">
                            <span className="inline-block rounded bg-slate-100 px-2 py-0.5 font-mono text-[11px] font-bold text-slate-600">{s.id}</span>
                            <span className="ml-auto flex items-center gap-1">
                              {!editingSub[s.id] ? (
                                <button onClick={() => { setSubDrafts({ ...subDrafts, [s.id]: s.text }); setEditingSub({ ...editingSub, [s.id]: true }); }} className="flex items-center gap-1 rounded-md border border-slate-200 px-2 py-1 text-[11px] font-bold text-slate-500 hover:border-[#0b6e5e] hover:text-[#0b6e5e]"><Pencil size={11} /> Modify</button>
                              ) : null}
                              <button onClick={() => { const next = ensureCustomSubs().filter((x) => x.id !== s.id); ssr.setCustomSubs(metric.id, next); }} className="rounded-md border border-slate-200 p-1.5 text-red-400 hover:bg-red-50 hover:text-red-600" title={`Remove ${s.id}`} aria-label={`Remove ${s.id}`}><Trash2 size={12} /></button>
                            </span>
                          </div>
                          {!editingSub[s.id] ? (
                            <p className="mt-1.5 text-[13px] leading-relaxed text-slate-800">{s.text}</p>
                          ) : (
                            <div className="mt-2 space-y-2">
                              <textarea value={subDrafts[s.id] ?? s.text} onChange={(e) => setSubDrafts({ ...subDrafts, [s.id]: e.target.value })} rows={2} className="w-full rounded-lg border border-[#0b6e5e] px-3 py-2 text-[13px] focus:outline-none" />
                              <div className="flex gap-2">
                                <button onClick={() => { const next = ensureCustomSubs().map((x) => x.id === s.id ? { ...x, text: (subDrafts[s.id] ?? '').trim() || x.text } : x); ssr.setCustomSubs(metric.id, next); setEditingSub({ ...editingSub, [s.id]: false }); }} className="rounded-lg bg-[#0b6e5e] px-3 py-1.5 text-[12px] font-bold text-white">Save</button>
                                <button onClick={() => setEditingSub({ ...editingSub, [s.id]: false })} className="rounded-lg border border-slate-200 px-3 py-1.5 text-[12px] font-bold text-slate-500">Cancel</button>
                              </div>
                            </div>
                          )}
                        </div>
                      )) : <NotSpecified label="None — single response metric. Add one below if needed." />}
                    </div>
                    {!addingSub ? (
                      <button onClick={() => { setNewSubText(''); setAddingSub(true); }} className="mt-2 flex items-center gap-1.5 rounded-lg border border-dashed border-slate-300 px-3 py-2 text-[12px] font-bold text-slate-500 hover:border-[#0b6e5e] hover:text-[#0b6e5e]"><Plus size={13} /> Add Sub-Question to {metric.id}</button>
                    ) : (
                      <div className="mt-2 space-y-2 rounded-lg border border-slate-200 p-3">
                        <textarea value={newSubText} onChange={(e) => setNewSubText(e.target.value)} rows={2} placeholder="Enter new sub-question text…" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-[13px] focus:border-[#0b6e5e] focus:outline-none" />
                        <div className="flex gap-2">
                          <button onClick={() => { if (!newSubText.trim()) return; const base = ensureCustomSubs(); const nid = `${metric.id}.${base.length + 1}`; ssr.setCustomSubs(metric.id, [...base, { id: nid, text: newSubText.trim() }]); setNewSubText(''); setAddingSub(false); }} className="rounded-lg bg-[#0b6e5e] px-3 py-1.5 text-[12px] font-bold text-white">Add</button>
                          <button onClick={() => { setAddingSub(false); setNewSubText(''); }} className="rounded-lg border border-slate-200 px-3 py-1.5 text-[12px] font-bold text-slate-500">Cancel</button>
                        </div>
                      </div>
                    )}
                  </div>
                  {metric.options && metric.options.length > 0 && (
                    <div>
                      <FieldLabel>Options — Select One</FieldLabel>
                      <div role="radiogroup" aria-label={`Options for Metric ${metric.id}`} className="mt-2 space-y-2">
                        {metric.options.map((o) => {
                          const code = o.split(':')[0].trim();
                          const active = st.selectedOption === code || st.selectedOption === o;
                          return (
                            <button key={o} role="radio" aria-checked={active} onClick={() => ssr.setSelectedOption(metric.id, code)}
                              className={`flex w-full items-start gap-2.5 rounded-xl border-2 p-3 text-left transition ${active ? 'border-purple-600 bg-purple-50 shadow-sm' : 'border-slate-200 bg-white hover:border-purple-300 hover:bg-slate-50'}`}>
                              <span className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[12px] font-extrabold ${active ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-500'}`}>{code}</span>
                              <span className={`text-[13px] ${active ? 'font-bold text-slate-900' : 'text-slate-700'}`}>{o.includes(':') ? o.slice(o.indexOf(':') + 1).trim() : o}</span>
                              {active && <Check size={16} className="ml-auto mt-0.5 shrink-0 text-purple-600" />}
                            </button>
                          );
                        })}
                      </div>
                      {st.selectedOption
                        ? <button onClick={() => ssr.setSelectedOption(metric.id, '')} className="mt-2 text-[12px] font-medium text-slate-400 hover:text-red-600 hover:underline">Clear selection ({st.selectedOption})</button>
                        : <div className="mt-2 text-[12px] text-amber-600">No option selected yet.</div>}
                    </div>
                  )}
                  {metric.fileDescription && metric.fileDescription.length > 0 && (
                    <div>
                      <FieldLabel>File Description</FieldLabel>
                      <ul className="mt-2 list-disc space-y-1 rounded-xl bg-slate-50 p-4 pl-9 text-[13px] text-slate-700 ring-1 ring-slate-200">
                        {metric.fileDescription.map((f, i) => <li key={i}>{f}</li>)}
                      </ul>
                    </div>
                  )}
                  <div>
                    <FieldLabel>Formula / Calculation</FieldLabel>
                    <div className="mt-2">
                      {metric.formula ? (
                        <div className="rounded-md bg-slate-800 px-4 py-3 font-mono text-[13px] leading-relaxed text-white">{metric.formula}</div>
                      ) : <NotSpecified label="No formula specified for this metric in provided source." />}
                    </div>
                  </div>
                  <div className="grid gap-2 rounded-xl bg-slate-50 p-3 text-[12px] text-slate-600 ring-1 ring-slate-200 sm:grid-cols-3">
                    <div><span className="font-semibold">Data period:</span> {metric.dataPeriod}</div>
                    <div><span className="font-semibold">Word limit:</span> {wordLimit} words</div>
                    <div><span className="font-semibold">Status:</span> {meta.label}</div>
                  </div>
                </div>
              )}

              {/* ═══════════ DATA REQUIREMENTS — Option A UI ═══════════ */}
              {activeTab === 'data' && (
                <div className="space-y-6">
                  <div>
                    <OptALabel>Data Requirements</OptALabel>
                    <div className="mt-2 space-y-2">
                      {(metric.dataTemplateFields ?? metric.dataRequired).length > 0 ? (
                        (metric.dataTemplateFields ?? metric.dataRequired).map((d, i) => (
                          <OptARequiredCard key={i} title={d} sub="As per Data Template" subHighlight="Required" />
                        ))
                      ) : (
                        <NotSpecified />
                      )}
                    </div>
                    {metric.dataTemplateFields && metric.dataTemplateFields.length > 0 && metric.dataRequired.length > 0 && (
                      <div className="mt-2 text-[12px] text-slate-500">Also required: {metric.dataRequired.join(' · ')}</div>
                    )}
                  </div>

                  {effectiveSubs.length > 0 && (
                    <div>
                      <OptALabel>Sub-Questions & Responses</OptALabel>
                      <div className="mt-2 space-y-3">
                        {effectiveSubs.map((s) => (
                          <div key={s.id} className="rounded-md border border-slate-200 bg-white p-3">
                            <div className="flex items-center gap-2">
                              <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-[11px] font-bold text-slate-700">{s.id}</span>
                            </div>
                            <p className="mt-1.5 text-[13px] font-semibold leading-relaxed text-slate-800">{s.text}</p>
                            <textarea
                              value={subResponses[s.id] ?? ''}
                              onChange={(e) => ssr.setSubResponse(metric.id, s.id, e.target.value)}
                              rows={2}
                              placeholder={`Enter data / value for ${s.id}…`}
                              className="mt-2 w-full resize-y rounded-md border border-slate-300 px-3 py-2 text-[13px] placeholder:text-slate-400 focus:border-purple-600 focus:outline-none"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <OptALabel>Data Tables (Year / Number)</OptALabel>
                    <div className="mt-2">
                      {metric.tables.length === 0 ? <NotSpecified label="No table/template specified for this metric in provided source." /> : (
                        <div className="space-y-5">
                          {metric.tables.map((t, ti) => {
                            const rows = ssr.getTable(metric.id, ti);
                            const cols = ssr.getTableCols(metric.id, ti);
                            const empty = isEmptyMarked(ti);
                            const normRows = rows.map((r) => {
                              const vals = [...(r.values ?? [])];
                              while (vals.length < cols.length) vals.push('');
                              return { ...r, values: vals.slice(0, cols.length) };
                            });
                            const addRow = () => { if (empty) ssr.setTableEmpty(metric.id, ti, false); ssr.setTable(metric.id, ti, [...normRows, { id: uid(), values: cols.map(() => '') }]); };
                            return (
                              <div key={ti}>
                                <div className="mb-2 text-[13px] font-semibold text-slate-800">{t.title}</div>
                                <div className={`overflow-hidden rounded-md border ${empty ? 'border-dashed border-slate-300 opacity-70' : 'border-slate-200'}`}>
                                  <div className="overflow-x-auto">
                                    <table className="w-full min-w-[420px] border-collapse text-[13px]">
                                      <thead>
                                        <tr className="border-b border-slate-200 bg-slate-50">
                                          {cols.map((c, ci) => (
                                            <th key={ci} className="min-w-[140px] px-2 py-2 text-left">
                                              <div className="flex items-center gap-1">
                                                <input value={c} onChange={(e) => ssr.renameTableColumn(metric.id, ti, ci, e.target.value)}
                                                  placeholder={`Column ${ci + 1}`} aria-label={`Rename column ${ci + 1}`}
                                                  className="w-full rounded bg-transparent px-1.5 py-1 text-[12px] font-bold uppercase tracking-wide text-slate-600 placeholder:text-slate-300 hover:bg-white focus:bg-white focus:outline-none focus:ring-1 focus:ring-purple-600" />
                                                {cols.length > 1 && (
                                                  <button onClick={() => ssr.removeTableColumnByIndex(metric.id, ti, ci)}
                                                    className="shrink-0 rounded p-1 text-slate-300 hover:bg-red-50 hover:text-red-500" title={`Remove column "${c}"`} aria-label={`Remove column ${c}`}>✕</button>
                                                )}
                                              </div>
                                            </th>
                                          ))}
                                          <th className="w-10 border-slate-200" />
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {empty ? (
                                          <tr><td colSpan={cols.length + 1} className="px-3 py-6 text-center text-[13px] italic text-slate-400">Marked as empty — no data applicable.</td></tr>
                                        ) : normRows.length === 0 ? (
                                          <tr><td colSpan={cols.length + 1} className="px-3 py-6 text-center text-[13px] text-slate-400">No rows yet. Use “Add Row” below.</td></tr>
                                        ) : normRows.map((r, ri) => (
                                          <tr key={r.id} className="border-t border-slate-100 hover:bg-slate-50/60">
                                            {cols.map((c, ci) => (
                                              <td key={ci} className="min-w-[130px] border-l border-slate-100 px-1.5 py-1 first:border-l-0">
                                                <input value={r.values[ci] ?? ''} onChange={(e) => {
                                                  const nv = normRows.map((x) => x.id === r.id ? { ...x, values: cols.map((_, ii) => (ii === ci ? e.target.value : (x.values[ii] ?? ''))) } : x);
                                                  ssr.setTable(metric.id, ti, nv);
                                                }} placeholder={`Enter ${(c || `column ${ci + 1}`).toLowerCase()}`} aria-label={`${c || `Column ${ci + 1}`} row ${ri + 1}`}
                                                  className="w-full rounded px-2 py-1.5 placeholder:text-slate-300 focus:outline-none focus:ring-1 focus:ring-purple-600" />
                                              </td>
                                            ))}
                                            <td className="px-1 py-1.5 text-center">
                                              <button onClick={() => ssr.setTable(metric.id, ti, normRows.filter((x) => x.id !== r.id))} className="rounded p-1 text-slate-300 hover:bg-red-50 hover:text-red-500" aria-label="Delete row">✕</button>
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                                <div className="mt-2">
                                  <OptAPurpleButton onClick={addRow} ariaLabel={`Add row to ${t.title}`}>+ Add Row</OptAPurpleButton>
                                </div>
                                <div className="mt-2 flex flex-wrap items-center gap-2">
                                  {addingCol[ti] ? (
                                    <span className="flex flex-1 items-center gap-1.5">
                                      <input value={newCol[ti] ?? ''} onChange={(e) => setNewCol({ ...newCol, [ti]: e.target.value })} onKeyDown={(e) => { if (e.key === 'Enter' && (newCol[ti] ?? '').trim()) { ssr.addTableColumn(metric.id, ti, newCol[ti]); setNewCol({ ...newCol, [ti]: '' }); setAddingCol({ ...addingCol, [ti]: false }); } }}
                                        placeholder="Column name…" autoFocus className="min-w-0 flex-1 rounded-md border border-slate-300 px-2.5 py-1.5 text-[12px] focus:border-purple-600 focus:outline-none" />
                                      <button onClick={() => { if ((newCol[ti] ?? '').trim()) { ssr.addTableColumn(metric.id, ti, newCol[ti]); setNewCol({ ...newCol, [ti]: '' }); } setAddingCol({ ...addingCol, [ti]: false }); }} className="rounded-md bg-purple-700 px-3 py-1.5 text-[12px] font-bold text-white">Add</button>
                                      <button onClick={() => setAddingCol({ ...addingCol, [ti]: false })} className="rounded-md border border-slate-200 px-2 py-1.5 text-slate-500"><X size={13} /></button>
                                    </span>
                                  ) : (
                                    <button onClick={() => setAddingCol({ ...addingCol, [ti]: true })} className={optASecondaryBtn}><Plus size={13} /> Add Column</button>
                                  )}
                                  <button onClick={() => ssr.resetTableCols(metric.id, ti)} className={optASecondaryBtn} title="Reset columns to Year / Number"><RotateCcw size={13} /> Reset</button>
                                  <button onClick={() => ssr.setTableEmpty(metric.id, ti, !empty)} className={`${optASecondaryBtn} ${empty ? 'border-amber-300 bg-amber-50 text-amber-700' : ''}`}>
                                    <Ban size={13} /> {empty ? 'Unmark empty' : 'Mark as empty'}
                                  </button>
                                  <span className="ml-auto text-[11px] text-slate-400">{normRows.length} row(s)</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ═══════════ DOCUMENTS — Option A UI ═══════════ */}
              {activeTab === 'docs' && (
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <OptALabel>Required Documents</OptALabel>
                      {reqModified && (
                        <button onClick={() => ssr.resetReqDocs(metric.id)} className="flex items-center gap-1 rounded-md border border-slate-200 px-2 py-1 text-[11px] font-bold text-slate-500 hover:text-red-600"><RotateCcw size={11} /> Reset</button>
                      )}
                    </div>
                    <div className="mt-2 space-y-2">
                      {reqDocs.length > 0 ? reqDocs.map((r, i) => {
                        const done = uploadedDocs.length > i;
                        return (
                          <div key={r.id}>
                            {addingReq?.index === i && addingReq.placement === 'above' && renderReqAddForm()}
                            <div className="group relative">
                              <OptARequiredCard title={r.name} sub="Type: PDF" subHighlight={done ? 'Added' : 'Required'} done={done} />
                              <div className="absolute right-2 top-2 flex gap-1 opacity-100 transition md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100">
                                <button onClick={() => { setAddingReq({ index: i, placement: 'above' }); setReqDraft(''); }} className="rounded border border-slate-200 bg-white/95 px-1.5 py-0.5 text-[10px] font-bold text-slate-500 shadow-sm hover:border-purple-600 hover:text-purple-700" title="Add requirement above">↑ Above</button>
                                <button onClick={() => { setAddingReq({ index: i, placement: 'below' }); setReqDraft(''); }} className="rounded border border-slate-200 bg-white/95 px-1.5 py-0.5 text-[10px] font-bold text-slate-500 shadow-sm hover:border-purple-600 hover:text-purple-700" title="Add requirement below">↓ Below</button>
                                {r.custom && (
                                  <button onClick={() => ssr.removeReqDoc(metric.id, r.id)} className="rounded border border-slate-200 bg-white/95 p-1 text-slate-400 shadow-sm hover:bg-red-50 hover:text-red-500" title="Remove this requirement" aria-label={`Remove ${r.name}`}><X size={11} /></button>
                                )}
                              </div>
                            </div>
                            {addingReq?.index === i && addingReq.placement === 'below' && <div className="mt-2">{renderReqAddForm()}</div>}
                          </div>
                        );
                      }) : (
                        <>
                          <NotSpecified label="No documents listed for this metric." />
                          {!addingReq ? (
                            <button onClick={() => { setAddingReq({ index: 0, placement: 'below' }); setReqDraft(''); }} className="flex items-center gap-1 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-[12px] font-semibold text-slate-600 hover:bg-slate-50"><Plus size={13} /> Add requirement</button>
                          ) : renderReqAddForm()}
                        </>
                      )}
                    </div>
                    {isQlM && metric.fileDescription && metric.fileDescription.length > 0 && (
                      <div className="mt-2 text-[12px] text-slate-500">File Description: {metric.fileDescription.join(' · ')}</div>
                    )}
                  </div>

                  <div>
                    <OptALabel>Upload Documents (Your Evidence)</OptALabel>
                    <div className="mt-2">
                      {!showDocForm ? (
                        <OptAPurpleButton onClick={() => setShowDocForm(true)} ariaLabel="Add document">+ Add Document</OptAPurpleButton>
                      ) : (
                        <div className="rounded-md border border-slate-200 bg-slate-50/50 p-3">
                          <div className="grid gap-2 sm:grid-cols-2">
                            <input value={docForm.name} onChange={(e) => setDocForm({ ...docForm, name: e.target.value })} placeholder="Document name *" aria-label="Document name" className={optAInput} />
                            <select value={docForm.type} onChange={(e) => setDocForm({ ...docForm, type: e.target.value })} aria-label="Document type" className={optAInput}><option>PDF Document</option><option>Data Template (Excel)</option><option>Minutes / Report</option><option>Certificate</option><option>Photograph</option><option>Video / Media</option><option>Other</option></select>
                            <input value={docForm.year} onChange={(e) => setDocForm({ ...docForm, year: e.target.value })} placeholder="Academic year (e.g., 2023-24)" className={optAInput} />
                            <input value={docForm.url} onChange={(e) => setDocForm({ ...docForm, url: e.target.value })} placeholder="File / Drive URL (optional)" className={optAInput} />
                            <input value={docForm.description} onChange={(e) => setDocForm({ ...docForm, description: e.target.value })} placeholder="Description / remarks" className={`${optAInput} sm:col-span-2`} />
                          </div>
                          <div className="mt-2.5">
                            <OptAPurpleButton onClick={saveDoc}>+ Add Document</OptAPurpleButton>
                            <button onClick={() => setShowDocForm(false)} className="mt-2 w-full text-center text-[12px] font-medium text-slate-400 hover:text-slate-600">Cancel</button>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="mt-2 space-y-2">
                      {myDocs.filter((d) => !d.isImage).length === 0 && !showDocForm && <OptAEmpty>No documents added yet.</OptAEmpty>}
                      {myDocs.filter((d) => !d.isImage).map((d) => (
                        <div key={d.id} className="rounded-md border border-slate-200 bg-white p-3">
                          <div className="flex items-start gap-2">
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-purple-50 text-purple-700"><FileText size={17} /></span>
                            <div className="min-w-0 flex-1">
                              <div className="truncate text-[13px] font-semibold text-slate-800">{d.name}</div>
                              <div className="text-[11.5px] text-slate-500">{d.type}{d.year ? ` · ${d.year}` : ''}{d.description ? ` · ${d.description}` : ''}</div>
                              {d.uploadProgress < 100 && <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100"><div className="h-1.5 rounded-full bg-purple-600 transition-all" style={{ width: `${d.uploadProgress}%` }} /></div>}
                            </div>
                            <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${d.status === 'verified' ? 'bg-emerald-100 text-emerald-700' : 'bg-sky-100 text-sky-700'}`}>{d.status.toUpperCase()}</span>
                          </div>
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {d.url && <a href={d.url} target="_blank" rel="noreferrer" className="flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-200"><ExternalLink size={11} /> Open Link</a>}
                            <button onClick={() => ssr.verifyDoc(d.id)} className="flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-1 text-[11px] font-medium text-emerald-700 hover:bg-emerald-100"><Check size={11} /> Verify</button>
                            <button onClick={() => ssr.removeDoc(d.id)} className="flex items-center gap-1 rounded-md bg-red-50 px-2 py-1 text-[11px] font-medium text-red-600 hover:bg-red-100"><Trash2 size={11} /> Remove</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ═══════════ EVIDENCE & LINKS — Option A UI ═══════════ */}
              {activeTab === 'evidence' && (
                <div className="space-y-6">
                  {metric.supportingEvidence.length > 0 && (
                    <div>
                      <OptALabel>Evidence Checklist</OptALabel>
                      <div className="mt-2 space-y-2">
                        {metric.supportingEvidence.map((e, i) => (
                          <OptARequiredCard key={i} title={`${i + 1}. ${e}`} />
                        ))}
                      </div>
                    </div>
                  )}
                  <div>
                    <OptALabel>Links / URLs</OptALabel>
                    <div className="mt-2">
                      {!showLinkForm ? (
                        <OptAPurpleButton onClick={() => setShowLinkForm(true)} ariaLabel="Add link">+ Add Link</OptAPurpleButton>
                      ) : (
                        <div className="rounded-md border border-slate-200 bg-slate-50/50 p-3">
                          <div className="grid gap-2">
                            <input value={linkForm.title} onChange={(e) => setLinkForm({ ...linkForm, title: e.target.value })} placeholder="Link title" aria-label="Link title" className={optAInput} />
                            <input value={linkForm.url} onChange={(e) => { setLinkForm({ ...linkForm, url: e.target.value }); setLinkErr(''); }} placeholder="https://…" aria-label="Link URL" className={optAInput} />
                          </div>
                          {linkErr && <div className="mt-1.5 text-[12px] text-red-600">{linkErr}</div>}
                          <div className="mt-2.5">
                            <OptAPurpleButton onClick={saveLink}>+ Add Link</OptAPurpleButton>
                            <button onClick={() => setShowLinkForm(false)} className="mt-2 w-full text-center text-[12px] font-medium text-slate-400 hover:text-slate-600">Cancel</button>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="mt-2 space-y-2">
                      {myLinks.length === 0 && !showLinkForm && <OptAEmpty>No links added yet.</OptAEmpty>}
                      {myLinks.map((l) => (
                        <div key={l.id} className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2">
                          <Link2 size={13} className="shrink-0 text-slate-400" /><span className="min-w-0 flex-1 truncate text-[13px] font-medium text-slate-700">{l.title}</span>
                          <a href={l.url} target="_blank" rel="noreferrer" className="flex items-center gap-1 rounded bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-200"><ExternalLink size={11} /> Open Link</a>
                          <button onClick={() => ssr.removeLink(l.id)} className="rounded p-1 text-slate-300 hover:bg-red-50 hover:text-red-500" aria-label="Remove link"><X size={14} /></button>
                        </div>
                      ))}
                    </div>
                    {metric.linksRequired.length > 0 && <div className="mt-2 text-[12px] text-slate-500">Required: {metric.linksRequired.join(' · ')}</div>}
                  </div>

                  <div>
                    <OptALabel>Images / Geo-tagged Photos</OptALabel>
                    <div className="mt-2">
                      {!showImgForm ? (
                        <OptAPurpleButton onClick={() => setShowImgForm(true)} ariaLabel="Add image">+ Add Image</OptAPurpleButton>
                      ) : (
                        <div className="rounded-md border border-slate-200 bg-slate-50/50 p-3">
                          <div className="grid gap-2 sm:grid-cols-2">
                            <input value={imgForm.name} onChange={(e) => setImgForm({ ...imgForm, name: e.target.value })} placeholder="Image title *" aria-label="Image title" className={optAInput} />
                            <input value={imgForm.date} onChange={(e) => setImgForm({ ...imgForm, date: e.target.value })} placeholder="Date (dd/mm/yyyy)" className={optAInput} />
                            <input value={imgForm.description} onChange={(e) => setImgForm({ ...imgForm, description: e.target.value })} placeholder="Description" className={optAInput} />
                            <input value={imgForm.location} onChange={(e) => setImgForm({ ...imgForm, location: e.target.value })} placeholder="Location (if required)" className={optAInput} />
                            <input value={imgForm.caption} onChange={(e) => setImgForm({ ...imgForm, caption: e.target.value })} placeholder="Image caption" aria-label="Image caption" className={`${optAInput} sm:col-span-2`} />
                          </div>
                          <div className="mt-2.5">
                            <OptAPurpleButton onClick={saveImage}>+ Add Image</OptAPurpleButton>
                            <button onClick={() => setShowImgForm(false)} className="mt-2 w-full text-center text-[12px] font-medium text-slate-400 hover:text-slate-600">Cancel</button>
                          </div>
                        </div>
                      )}
                    </div>
                    {myDocs.filter((d) => d.isImage).length === 0 ? (
                      <OptAImagePlaceholder />
                    ) : (
                      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                        {myDocs.filter((d) => d.isImage).map((d) => (
                          <figure key={d.id} className="overflow-hidden rounded-md border border-slate-200 bg-white">
                            <div className="flex h-24 items-center justify-center bg-slate-100 text-slate-300"><ImagePlus size={30} /></div>
                            <figcaption className="p-2"><div className="truncate text-[12px] font-semibold text-slate-800">{d.name}</div><div className="truncate text-center text-[11px] italic text-slate-500">{d.description}</div>
                              <button onClick={() => ssr.removeDoc(d.id)} className="mt-1 w-full text-center text-[11px] font-medium text-red-500 hover:underline">Remove</button></figcaption>
                          </figure>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ═══════════ RESPONSE & NOTES — Option A UI ═══════════ */}
              {activeTab === 'response' && (
                <div className="space-y-6">
                  <div>
                    <OptALabel>Response ({wordCount}/{wordLimit} words)</OptALabel>
                    <div className="mt-2 rounded-md border border-slate-300 bg-white">
                      <textarea
                        value={st.response}
                        onChange={(e) => ssr.setResponse(metric.id, e.target.value)}
                        rows={isQlM ? 7 : 4}
                        placeholder={isQlM ? `Write the Metric ${metric.id} description…` : `Enter the Metric ${metric.id} computed value…`}
                        className="w-full resize-y rounded-md p-3 text-[13.5px] leading-relaxed text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-purple-600"
                      />
                    </div>
                    <div className="mt-1.5 flex items-center justify-between text-[12px] text-slate-400">
                      <span>{isQlM ? `Description for ${metric.id} (maximum of ${wordLimit} words)` : `Computed value / summary for ${metric.id}`}</span>
                      <span className={wordCount > wordLimit ? 'font-bold text-red-600' : ''}>{wordCount} / {wordLimit} words</span>
                    </div>
                  </div>

                  {metric.notes.length > 0 && (
                    <div>
                      <OptALabel>Notes / Instructions</OptALabel>
                      <ul className="mt-2 list-disc space-y-1 rounded-md bg-slate-50 p-3 pl-8 text-[13px] text-slate-600 ring-1 ring-slate-200">{metric.notes.map((n, i) => <li key={i}>{n}</li>)}</ul>
                    </div>
                  )}

                  <div>
                    <OptALabel>Remarks</OptALabel>
                    <textarea
                      value={st.remarks}
                      onChange={(e) => ssr.setRemarks(metric.id, e.target.value)}
                      rows={3}
                      placeholder={`Internal remarks for Metric ${metric.id} — DVV queries, pending items…`}
                      className="mt-2 w-full resize-y rounded-md border border-slate-300 p-3 text-[13px] placeholder:text-slate-400 focus:border-purple-600 focus:outline-none"
                    />
                  </div>

                  {customModules.map((m) => (
                    <div key={m.id} className="rounded-md border border-slate-200 bg-white p-3">
                      <OptALabel>Additional Module</OptALabel>
                      <input value={m.title} onChange={(e) => ssr.setCustomModule(metric.id, m.id, { title: e.target.value })} placeholder="Module title…" aria-label="Custom module title" className="mb-2 mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-[13px] font-semibold focus:border-purple-600 focus:outline-none" />
                      <textarea value={m.content} onChange={(e) => ssr.setCustomModule(metric.id, m.id, { content: e.target.value })} rows={4} placeholder="Module content…" className="w-full resize-y rounded-md border border-slate-300 p-3 text-[13px] focus:border-purple-600 focus:outline-none" />
                      <button onClick={() => ssr.removeCustomModule(metric.id, m.id)} className="mt-2 flex items-center gap-1 text-[12px] font-medium text-red-500 hover:underline"><Trash2 size={13} /> Remove module</button>
                    </div>
                  ))}
                  <div>
                    <OptAPurpleButton onClick={() => ssr.addCustomModule(metric.id, `Additional Module ${letter(customModules.length)}`)}>+ Add Module</OptAPurpleButton>
                  </div>

                  <div className="space-y-2">
                    <OptAPurpleButton onClick={() => ssr.setStatus(metric.id, 'completed')}>Save Metric & Mark Completed</OptAPurpleButton>
                    <button onClick={() => ssr.setStatus(metric.id, 'in-progress')} className="w-full rounded-md border border-slate-300 bg-white px-4 py-2.5 text-[14px] font-semibold text-slate-700 hover:bg-slate-50">Mark In Progress</button>
                    {next && <button onClick={() => onNavigate({ k: 'metric', metricId: next.id })} className="flex w-full items-center justify-center gap-1.5 rounded-md border border-slate-300 bg-white px-4 py-2.5 text-[14px] font-semibold text-slate-700 hover:bg-slate-50">Save & Next <ArrowRight size={14} /></button>}
                  </div>

                  <div>
                    <button onClick={() => setShowGuide(!showGuide)} className="flex items-center gap-1.5 rounded-md bg-[#fef3e2] px-3 py-1.5 text-[12px] font-bold text-[#b45309] ring-1 ring-[#f5d9a8] hover:bg-[#fdecd2]">
                      <ChevronDown size={13} className={showGuide ? 'rotate-180' : ''} /> <Info size={13} /> NAAC Evaluation Guideline
                    </button>
                    {showGuide && (
                      <div className="mt-2 rounded-md bg-[#fffaf0] p-4 text-[12.5px] leading-relaxed text-slate-700 ring-1 ring-[#f5d9a8]">
                        <p><span className="font-bold">Metric {metric.id} ({metric.type}, {metric.weightage} marks)</span> belongs to KI {metric.kiId} under Criterion {crit?.numeral}. {metric.description}</p>
                        <p className="mt-1.5">Data period: {metric.dataPeriod}. {isQlM ? `Keep the description within ${wordLimit} words and attach File Description evidence (upload + link).` : 'Fill every numbered sub-question, complete the data template table, and verify the computed value against the formula.'}</p>
                        {metric.notes.length > 0 && <ul className="mt-1.5 ml-4 list-disc">{metric.notes.map((n, i) => <li key={i}>{n}</li>)}</ul>}
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>

        {/* ── RIGHT: completion panel (Option B) ── */}
        <div className="space-y-4">
          <div className={`rounded-xl border p-4 ${meta.bg}`}>
            <div className="flex items-center gap-2"><span className={`h-2.5 w-2.5 rounded-full ${meta.dot}`} /><span className={`text-[13px] font-bold ${meta.text}`}>{meta.label} — {metric.id}</span></div>
            <div className="mt-3 space-y-1.5">
              {(['not-started', 'in-progress', 'completed'] as const).map((s) => (
                <button key={s} onClick={() => ssr.setStatus(metric.id, s)} className={`w-full rounded-lg px-3 py-1.5 text-left text-[12px] font-medium ${st.status === s ? 'bg-white shadow ring-1 ring-slate-300' : 'hover:bg-white/60'}`}>{statusMeta(s).label}</button>
              ))}
            </div>
            <div className="mt-3 space-y-1 border-t border-slate-200/70 pt-3 text-[12px] text-slate-600">
              <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-400"><Paperclip size={11} /> Module progress</div>
              {metric.options && metric.options.length > 0 && (
                <div className="flex justify-between"><span>Option selected</span><span className="font-bold">{st.selectedOption ? `✓ ${st.selectedOption}` : '—'}</span></div>
              )}
              <div className="flex justify-between"><span>Main response</span><span className="font-bold">{st.response.trim() ? '✓' : '—'}</span></div>
              {effectiveSubs.map((s) => (
                <div key={s.id} className="flex justify-between"><span className="font-mono">{s.id}</span><span className="font-bold">{(subResponses[s.id] ?? '').trim() ? '✓' : '—'}</span></div>
              ))}
              <div className="flex justify-between"><span>Documents</span><span className="font-bold">{myDocs.length}</span></div>
              <div className="flex justify-between"><span>Links</span><span className="font-bold">{myLinks.length}</span></div>
              <div className="flex justify-between"><span>Table rows</span><span className="font-bold">{Object.values(st.tables || {}).reduce((a, r) => a + r.length, 0)}</span></div>
              <div className="flex justify-between"><span>Words</span><span className="font-bold">{wordCount}/{wordLimit}</span></div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <h4 className="text-[12px] font-bold uppercase tracking-wide text-slate-500">Non-Applicable — {metric.id}</h4>
            <label className="mt-2 flex cursor-pointer items-center gap-2 text-[12.5px] text-slate-700">
              <input type="checkbox" checked={st.nonApplicable} onChange={(e) => ssr.setNonApplicable(metric.id, e.target.checked, st.nonApplicableReason)} className="h-4 w-4 accent-[#0b6e5e]" /> Mark {metric.id} as non-applicable
            </label>
            {st.nonApplicable && <textarea value={st.nonApplicableReason} onChange={(e) => ssr.setNonApplicable(metric.id, true, e.target.value)} rows={2} placeholder="Justification (mandatory, max 5% opt-out)…" className="mt-2 w-full rounded-lg border border-slate-300 p-2 text-[12px] focus:border-[#0b6e5e] focus:outline-none" />}
            <p className="mt-1.5 flex items-center gap-1 text-[11px] text-slate-400"><ShieldCheck size={11} /> Opt-out up to 5% weightage; subject to DVV / peer approval.</p>
          </div>

          <button onClick={() => crit && onNavigate({ k: 'criterion', criterionId: crit.id })} className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-2.5 text-[13px] font-bold text-slate-700 hover:bg-slate-50"><ArrowLeft size={14} /> Back to Criterion {crit?.numeral}</button>
        </div>
      </div>
    </div>
  );
}
