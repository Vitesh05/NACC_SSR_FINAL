import { useMemo, useState } from 'react';
import { ArrowLeft, Plus, Trash2, ExternalLink, Check, Search, GitCompareArrows, FileText, Scale, CircleCheck, CircleDashed, Circle } from 'lucide-react';
import type { InstitutionData, ProfileSection } from '../data/types';
import { getSectionBInfo, getExecutiveSummaryFields, getProfileFields, getExtendedProfileFields, getDeptReportFields } from '../data/sections';
import { universityData, autonomousCollegeData, affiliatedCollegeData } from '../data/registry';
const autonomousData = autonomousCollegeData;
const affiliatedUGData = affiliatedCollegeData.ug;
const affiliatedPGData = affiliatedCollegeData.pg;
import { useSSR, uid } from '../store/ssrStore';
import type { ViewKind } from './Layout';

/* ── Generic rich section renderer ── */
export function RichSection({ itemId, items, crumb, onBack }: { itemId: string; items: { id: string; title: string; content: string[]; bullets?: string[]; table?: { headers: string[]; rows: string[][]; caption?: string }; note?: string }[]; crumb: string; onBack: () => void }) {
  const item = items.find((x) => x.id === itemId) ?? items[0];
  return (
    <div className="space-y-4">
      <button onClick={onBack} className="flex items-center gap-1.5 text-[13px] font-medium text-slate-500 hover:text-[#4a1545]"><ArrowLeft size={15} /> {crumb}</button>
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="text-[11px] font-bold uppercase tracking-widest text-[#6d1d3c]">{crumb}</div>
        <h1 className="mt-1 text-xl font-bold text-slate-900 sm:text-2xl">{item.title}</h1>
        <div className="mt-3 space-y-2.5">{item.content.map((p, i) => <p key={i} className="text-[13.5px] leading-relaxed text-slate-700">{p}</p>)}</div>
        {item.bullets && <ul className="mt-3 list-disc space-y-1.5 rounded-xl bg-violet-50/60 p-4 pl-9 text-[13px] text-slate-700 ring-1 ring-violet-100">{item.bullets.map((b, i) => <li key={i}>{b}</li>)}</ul>}
        {item.table && (
          <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200">
            {item.table.caption && <div className="bg-slate-50 px-4 py-2 text-[12px] font-bold text-slate-700">{item.table.caption}</div>}
            <table className="w-full min-w-[560px] text-[12.5px]">
              <thead><tr className="bg-[#2d0a33] text-white">{item.table.headers.map((h, i) => <th key={i} className="px-3 py-2.5 text-left font-semibold">{h}</th>)}</tr></thead>
              <tbody>{item.table.rows.map((r, i) => <tr key={i} className={i % 2 ? 'bg-slate-50/60' : 'bg-white'}>{r.map((c, j) => <td key={j} className={`border-t border-slate-100 px-3 py-2 ${j === 0 ? 'font-semibold text-slate-800' : 'text-slate-600'}`}>{c}</td>)}</tr>)}</tbody>
            </table>
          </div>
        )}
        {item.note && <div className="mt-3 rounded-lg bg-amber-50 p-3 text-[12.5px] text-amber-800 ring-1 ring-amber-200">{item.note}</div>}
      </div>
    </div>
  );
}

export function SectionBInfoView({ data, itemId, onNavigate }: { data: InstitutionData; itemId: string; onNavigate: (v: ViewKind) => void }) {
  const items = getSectionBInfo(data.id);
  return <RichSection itemId={itemId} items={items} crumb="SSR Workspace" onBack={() => onNavigate({ k: 'dashboard' })} />;
}

/* ── Part B · QIF hub — all 7 criteria + KIs + metric questions for current institution ── */
export function QifView({ data, onNavigate }: { data: InstitutionData; onNavigate: (v: ViewKind) => void }) {
  const { metricStates } = useSSR();
  const [q, setQ] = useState('');
  const [openCrit, setOpenCrit] = useState<Record<number, boolean>>({ 1: true });
  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return data.criteria;
    return data.criteria.map((c) => ({
      ...c,
      keyIndicators: c.keyIndicators.map((ki) => ({
        ...ki,
        metrics: ki.metrics.filter((mt) =>
          mt.id.includes(needle) || mt.title.toLowerCase().includes(needle) ||
          ki.id.includes(needle) || ki.title.toLowerCase().includes(needle)
        ),
      })).filter((ki) =>
        ki.id.includes(needle) || ki.title.toLowerCase().includes(needle) || ki.metrics.length > 0
      ),
    })).filter((c) =>
      c.title.toLowerCase().includes(needle) || (`criterion ${c.numeral}`.toLowerCase().includes(needle)) || c.keyIndicators.length > 0
    );
  }, [data, q]);
  return (
    <div className="space-y-4">
      <button onClick={() => onNavigate({ k: 'dashboard' })} className="flex items-center gap-1.5 text-[13px] font-medium text-slate-500 hover:text-[#0b6e5e]"><ArrowLeft size={15} /> Dashboard</button>
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="text-[11px] font-bold uppercase tracking-widest text-[#0b6e5e]">Part B · 4. Quality Indicator Framework (QIF)</div>
        <h1 className="mt-1 text-xl font-bold text-slate-900">All Criteria & Questions — {data.name}</h1>
        <p className="mt-1 text-[12.5px] text-slate-500">Every criterion, key indicator and metric question for the selected institution type. Switch University / Autonomous / Affiliated (UG/PG) in the header to see that manual&apos;s QIF. {data.totalKIs} KIs · {data.totalQlM} QlM + {data.totalQnM} QnM = {data.totalMetrics} metrics · {data.totalScore} points.</p>
        <div className="relative mt-3 max-w-md"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter by criterion, KI, metric ID or question keyword…" className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-[13px] focus:border-[#0b6e5e] focus:outline-none" /></div>
      </div>
      <div className="space-y-3">
        {filtered.map((c) => {
          const total = c.keyIndicators.reduce((a, ki) => a + ki.metrics.length, 0);
          const done = c.keyIndicators.reduce((a, ki) => a + ki.metrics.filter((mt) => metricStates[mt.id]?.status === 'completed').length, 0);
          const open = !!openCrit[c.id];
          return (
            <div key={c.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <button onClick={() => { setOpenCrit({ ...openCrit, [c.id]: !open }); }} className="flex w-full items-center gap-3 p-4 text-left hover:bg-slate-50">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#0b6e5e] text-sm font-extrabold text-white">{c.numeral}</span>
                <span className="min-w-0 flex-1"><span className="block truncate text-[14px] font-bold text-slate-800">Criterion {c.numeral} · {c.title}</span><span className="block text-[11.5px] text-slate-500">{c.keyIndicators.length} KIs · {total} metrics · {done} completed · {c.weightage} pts</span></span>
                <span onClick={(e) => { e.stopPropagation(); onNavigate({ k: 'criterion', criterionId: c.id }); }} className="shrink-0 cursor-pointer rounded-lg bg-[#0b6e5e] px-3 py-1.5 text-[12px] font-bold text-white hover:bg-[#084c43]" role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter') onNavigate({ k: 'criterion', criterionId: c.id }); }}>Open</span>
              </button>
              {open && (
                <div className="space-y-3 border-t border-slate-100 bg-slate-50/60 p-3">
                  {c.keyIndicators.map((ki) => (
                    <div key={ki.id} className="rounded-lg border border-slate-200 bg-white p-3">
                      <div className="flex flex-wrap items-center gap-2"><span className="font-mono text-[12.5px] font-extrabold text-[#0b6e5e]">KI {ki.id}</span><span className="text-[13px] font-bold text-slate-800">{ki.title}</span><span className="ml-auto rounded bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-600">{ki.weightage} pts · {ki.metrics.length} metrics</span></div>
                      <div className="mt-2 space-y-1.5">
                        {ki.metrics.map((mt) => {
                          const st = metricStates[mt.id]?.status ?? 'not-started';
                          const customTitle = metricStates[mt.id]?.customTitle?.trim();
                          const effTitle = customTitle || mt.title;
                          const customSubs = metricStates[mt.id]?.customSubs;
                          const effSubs = customSubs ?? mt.subQuestions ?? [];
                          return (
                            <button key={mt.uid ?? mt.id} onClick={() => onNavigate({ k: 'metric', metricId: mt.id })} className="block w-full rounded-lg border border-slate-100 bg-slate-50/50 p-2.5 text-left hover:border-[#0b6e5e]/40 hover:bg-white">
                              <div className="flex flex-wrap items-center gap-2"><span className="font-mono text-[12px] font-extrabold text-[#0b6e5e]">{mt.id}</span><span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${mt.type === 'QlM' ? 'bg-purple-100 text-purple-700' : 'bg-sky-100 text-sky-700'}`}>{mt.type}</span><span className="rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold text-amber-700 ring-1 ring-amber-200">{mt.weightage} marks</span>{customTitle && <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-700">Edited</span>}{effSubs.length > 0 && <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-500">{effSubs.length} sub-q</span>}<span className="ml-auto flex items-center gap-1 text-[10.5px] text-slate-500">{st === 'completed' ? <CircleCheck size={12} className="text-emerald-600" /> : st === 'in-progress' ? <CircleDashed size={12} className="text-amber-500" /> : <Circle size={12} className="text-slate-300" />}{st}</span></div>
                              <div className="mt-1 text-[12.5px] leading-relaxed text-slate-700">{effTitle}</div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && <div className="rounded-xl bg-white p-6 text-center text-[13px] text-slate-400">No criteria match “{q}”.</div>}
      </div>
    </div>
  );
}

function countWords(s: string): number {
  const t = (s ?? '').trim();
  return t ? t.split(/\s+/).length : 0;
}

/* ── Editable data table (rename / add / remove columns, add / remove rows, manual preset rows) ── */
function FormEditableTable({ tableKey, label, fallbackCols, presetRows, lockFirstCol }: { tableKey: string; label: string; fallbackCols: string[]; presetRows?: string[][]; lockFirstCol?: boolean }) {
  const ssr = useSSR();
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState('');
  const cols = ssr.getFormCols(tableKey, fallbackCols);
  const rawRows = ssr.getFormTable(tableKey);
  // Manual preset rows (e.g. Sanctioned/Recruited, Urban/Rural…) shown until user saves own rows.
  const effectiveRaw = rawRows.length > 0
    ? rawRows
    : (presetRows ?? []).map((pr, i) => ({ id: `preset-${i}`, values: pr }));
  const rows = effectiveRaw.map((r) => {
    const vals = [...(r.values ?? [])];
    while (vals.length < cols.length) vals.push('');
    return { ...r, values: vals.slice(0, cols.length) };
  });
  const isPreset = rawRows.length === 0 && (presetRows?.length ?? 0) > 0;
  const persist = (next: { id: string; values: string[] }[]) => ssr.setFormTable(tableKey, next);
  const commitAdd = () => {
    const name = draft.trim() || `Column ${cols.length + 1}`;
    ssr.setFormCols(tableKey, [...cols, name]);
    setDraft('');
    setAdding(false);
  };
  return (
    <div className="md:col-span-2 overflow-hidden rounded-xl border border-slate-200">
      <div className="flex flex-wrap items-center gap-2 bg-slate-50 px-3 py-2">
        <span className="min-w-0 flex-1 text-[12.5px] font-bold text-slate-700">{label}</span>
        {isPreset && <span className="rounded bg-teal-50 px-2 py-0.5 text-[10.5px] font-bold text-teal-700 ring-1 ring-teal-200">Manual rows — edit to save your data</span>}
        <span className="text-[10.5px] text-slate-400">Click a header to rename</span>
        <button onClick={() => persist([...rows, { id: uid(), values: cols.map(() => '') }])} className="flex items-center gap-1 rounded-lg bg-[#4a1545] px-2.5 py-1 text-[11.5px] font-bold text-white"><Plus size={12} /> Add Row</button>
        {adding ? (
          <span className="flex items-center gap-1.5">
            <input value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') commitAdd(); }}
              placeholder="Column name…" autoFocus className="w-32 rounded-lg border border-slate-300 px-2 py-1 text-[11.5px] focus:border-[#4a1545] focus:outline-none" />
            <button onClick={commitAdd} className="rounded-lg bg-[#4a1545] px-2 py-1 text-[11.5px] font-bold text-white">Add</button>
            <button onClick={() => { setAdding(false); setDraft(''); }} className="rounded-lg border border-slate-200 px-2 py-1 text-[11.5px] text-slate-500">✕</button>
          </span>
        ) : (
          <button onClick={() => setAdding(true)} className="flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-[11.5px] font-bold text-slate-600 hover:bg-slate-100"><Plus size={12} /> Add Column</button>
        )}
      </div>
      <div className="overflow-x-auto"><table className="w-full min-w-[600px] text-[12px]">
        <thead><tr className="bg-[#2d0a33] text-white">
          {cols.map((c, i) => (
            <th key={i} className="min-w-[130px] whitespace-nowrap px-1.5 py-1.5 text-left">
              <div className="flex items-center gap-1">
                <input value={c} onChange={(e) => { const next = [...cols]; next[i] = e.target.value; ssr.setFormCols(tableKey, next); }}
                  aria-label={`Rename column ${i + 1}`} className="w-full rounded bg-white/10 px-2 py-1 text-[11.5px] font-semibold text-white placeholder:text-white/40 focus:bg-white focus:text-slate-800 focus:outline-none" />
                {cols.length > 1 && (
                  <button onClick={() => ssr.setFormCols(tableKey, cols.filter((_, ii) => ii !== i))} className="shrink-0 rounded p-0.5 text-white/50 hover:bg-white/10 hover:text-red-300" title={`Remove column "${c}"`} aria-label={`Remove column ${c}`}>✕</button>
                )}
              </div>
            </th>
          ))}
          <th className="w-14 px-2 py-2" />
        </tr></thead>
        <tbody>{rows.length === 0 && <tr><td colSpan={cols.length + 1} className="px-3 py-4 text-center text-slate-400">No rows yet.</td></tr>}
          {rows.map((r) => <tr key={r.id} className="border-t border-slate-100">{r.values.map((v, ci) => (
            <td key={ci} className={`min-w-[130px] px-1.5 py-1 ${lockFirstCol && ci === 0 ? 'bg-slate-50' : ''}`}>
              {lockFirstCol && ci === 0 ? (
                <span className="block px-2 py-1.5 text-[12px] font-semibold text-slate-700">{v}</span>
              ) : (
                <input value={v} onChange={(e) => persist(rows.map((x) => x.id === r.id ? { ...x, values: x.values.map((vv, ii) => ii === ci ? e.target.value : vv) } : x))} placeholder={`Enter ${cols[ci]?.toLowerCase() ?? ''}`} className="w-full rounded-md border border-slate-200 px-2 py-1.5 placeholder:text-slate-300 focus:border-[#4a1545] focus:outline-none" />
              )}
            </td>))}<td className="px-2 text-center">{!isPreset && <button onClick={() => persist(rows.filter((x) => x.id !== r.id))} className="rounded p-1 text-red-500 hover:bg-red-50"><Trash2 size={13} /></button>}</td></tr>)}
        </tbody></table></div>
    </div>
  );
}

/* ── Generic form renderer (manual-faithful: word limits, preset manual rows) ── */
export function FormView({ title, crumb, sections, formPrefix, onNavigate, manualRef }: { title: string; crumb: string; sections: ProfileSection[]; formPrefix: string; onNavigate: (v: ViewKind) => void; manualRef?: string }) {
  const ssr = useSSR();
  const isExec = formPrefix.includes(':exec');
  const execTotal = useMemo(() => {
    if (!isExec) return 0;
    let total = 0;
    sections.forEach((s) => s.fields.forEach((f) => {
      if (f.type === 'textarea') total += countWords(ssr.formValues[`${formPrefix}:${f.id}`] ?? '');
    }));
    return total;
  }, [isExec, sections, formPrefix, ssr.formValues]);
  const execOver = execTotal > 5000;
  return (
    <div className="space-y-4">
      <button onClick={() => onNavigate({ k: 'dashboard' })} className="flex items-center gap-1.5 text-[13px] font-medium text-slate-500 hover:text-[#4a1545]"><ArrowLeft size={15} /> {crumb}</button>
      <div className="rounded-2xl border border-[#4a1545]/15 bg-gradient-to-r from-[#2d0a33] to-[#6d1d3c] p-5 text-white">
        <div className="text-[11px] uppercase tracking-widest text-white/70">{crumb}</div>
        <h1 className="text-xl font-bold">{title}</h1>
        <p className="mt-1 text-[12.5px] text-white/75">Fields mirror the manual / online SSR format exactly. All entries auto-save to the local workspace.</p>
        {manualRef && <p className="mt-1 text-[11.5px] font-semibold text-white/60">Source: {manualRef}</p>}
        {isExec && (
          <div className={`mt-3 flex flex-wrap items-center gap-2 rounded-xl px-3 py-2 text-[12.5px] font-bold ring-1 ${execOver ? 'bg-red-500/20 ring-red-300/40' : 'bg-white/10 ring-white/20'}`}>
            <FileText size={14} /> Executive Summary total: {execTotal.toLocaleString()} / 5,000 words
            {execOver && <span className="rounded bg-red-500 px-2 py-0.5 text-[11px]">OVER LIMIT — reduce {(execTotal - 5000).toLocaleString()} words</span>}
            {!execOver && <span className="text-white/60">({(5000 - execTotal).toLocaleString()} remaining)</span>}
          </div>
        )}
      </div>
      {sections.map((s) => (
        <div key={s.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="text-[14px] font-bold text-slate-800">{s.title}</h3>
          {s.description && <p className="mt-0.5 text-[12px] text-slate-500">{s.description}</p>}
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {s.fields.map((f) => {
              const key = `${formPrefix}:${f.id}`;
              if (f.type === 'table' && f.columns) {
                return <FormEditableTable key={f.id} tableKey={key} label={f.label} fallbackCols={f.columns} presetRows={f.presetRows} lockFirstCol={f.lockFirstCol} />;
              }
              if (f.type === 'textarea') {
                const wc = countWords(ssr.formValues[key] ?? '');
                const over = f.maxWords != null && wc > f.maxWords;
                return (
                  <label key={f.id} className="block md:col-span-2">
                    <span className="mb-1 flex items-center justify-between text-[12px] font-semibold text-slate-600">
                      <span>{f.label} {f.required && <span className="text-red-500">*</span>}</span>
                      {f.maxWords != null && <span className={`rounded px-2 py-0.5 text-[11px] font-bold ${over ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-500'}`}>{wc} / {f.maxWords} words{over ? ' — OVER LIMIT' : ''}</span>}
                    </span>
                    <textarea value={ssr.formValues[key] ?? ''} onChange={(e) => ssr.setFormValue(key, e.target.value)} rows={4} className={`w-full rounded-lg border px-3 py-2 text-[13px] focus:outline-none ${over ? 'border-red-400 focus:border-red-500' : 'border-slate-300 focus:border-[#4a1545]'}`} />
                    {f.help && <span className="mt-0.5 block text-[11px] text-slate-400">{f.help}</span>}
                  </label>
                );
              }
              return (
                <label key={f.id} className="block">
                  <span className="mb-1 block text-[12px] font-semibold text-slate-600">{f.label} {f.required && <span className="text-red-500">*</span>}</span>
                  {f.type === 'select' ? <select value={ssr.formValues[key] ?? ''} onChange={(e) => ssr.setFormValue(key, e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-[13px] focus:border-[#4a1545] focus:outline-none"><option value="">— Select —</option>{f.options?.map((o) => <option key={o} value={o}>{o}</option>)}</select>
                    : <input type={f.type === 'number' ? 'number' : f.type === 'date' ? 'date' : 'text'} value={ssr.formValues[key] ?? ''} onChange={(e) => ssr.setFormValue(key, e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-[13px] focus:border-[#4a1545] focus:outline-none" />}
                  {f.help && <span className="mt-0.5 block text-[11px] text-slate-400">{f.help}</span>}
                </label>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

export function formSectionsFor(formId: string, data: InstitutionData): { title: string; sections: ProfileSection[]; manualRef?: string } {
  const inst = data.id;
  const variant = data.variant;
  const manualName = inst === 'university' ? 'Manual for Universities' : inst === 'autonomous' ? 'Manual for Autonomous Colleges' : 'Manual for Affiliated / Constituent UG & PG Colleges';
  if (formId === 'exec') return { title: '1. Executive Summary', sections: getExecutiveSummaryFields(inst), manualRef: `${manualName} · p. 38 (≤ 5000 words total; ≤ 250 words per criterion)` };
  if (formId === 'profile') {
    const pages = inst === 'university' ? 'pp. 39–44' : inst === 'autonomous' ? 'pp. 39–46' : 'pp. 39–44';
    const t = inst === 'university' ? '2. Profile of the University' : '2. Profile of the Institution';
    return { title: t, sections: getProfileFields(inst, variant), manualRef: `${manualName} · ${pages}` };
  }
  if (formId === 'extended') {
    const pages = inst === 'university' ? 'pp. 45–46' : inst === 'autonomous' ? 'pp. 47–48' : 'Extended Profile';
    const t = inst === 'university' ? '3. Extended Profile of the University' : '3. Extended Profile of the Institution';
    return { title: t, sections: getExtendedProfileFields(inst), manualRef: `${manualName} · ${pages}` };
  }
  const deptPages = inst === 'university' ? 'p. 99' : inst === 'autonomous' ? 'p. 109' : 'Evaluative Report';
  return { title: '5. Evaluative Report of the Departments', sections: getDeptReportFields(inst), manualRef: `${manualName} · ${deptPages} (compile data for the last five years)` };
}

/* ── Checklist ── */
export function ChecklistView({ data, onNavigate }: { data: InstitutionData; onNavigate: (v: ViewKind) => void }) {
  const ssr = useSSR();
  const [f, setF] = useState<'All' | 'Missing' | 'Added' | 'Verified'>('All');
  const rows = useMemo(() => {
    const out: { metricId: string; doc: string; required: boolean; status: string; file: string; link: string }[] = [];
    data.criteria.forEach((c) => c.keyIndicators.forEach((ki) => ki.metrics.forEach((mt) => {
      const added = ssr.docs.filter((d) => d.metricId === mt.id && !d.isImage);
      if (added.length === 0) ssr.getReqDocs(mt.id, mt.documentsRequired).forEach((d) => out.push({ metricId: mt.id, doc: d.name, required: true, status: 'Missing', file: '—', link: '—' }));
      else added.forEach((a) => out.push({ metricId: mt.id, doc: a.name, required: true, status: a.status === 'verified' ? 'Verified' : 'Added', file: a.type, link: a.url || '—' }));
    })));
    return f === 'All' ? out : out.filter((r) => r.status === f);
  }, [data, ssr, f]);
  const missing = rows.filter((r) => r.status === 'Missing').length;
  return (
    <div className="space-y-4">
      <button onClick={() => onNavigate({ k: 'dashboard' })} className="flex items-center gap-1.5 text-[13px] font-medium text-slate-500 hover:text-[#4a1545]"><ArrowLeft size={15} /> Dashboard</button>
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="text-[11px] font-bold uppercase tracking-widest text-[#6d1d3c]">Global Document Checklist</div>
        <h1 className="mt-1 text-xl font-bold text-slate-900">Document Checklist — {data.name}</h1>
        <div className="mt-3 flex flex-wrap gap-2">{(['All', 'Missing', 'Added', 'Verified'] as const).map((s) => <button key={s} onClick={() => setF(s)} className={`rounded-lg px-3 py-1.5 text-[12px] font-bold ${f === s ? 'bg-[#4a1545] text-white' : 'bg-slate-100 text-slate-600'}`}>{s}</button>)}<span className="ml-auto text-[12px] text-slate-500">{rows.length} rows · {missing} missing</span></div>
      </div>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto"><table className="w-full min-w-[820px] text-[12.5px]">
          <thead><tr className="bg-[#2d0a33] text-white"><th className="px-3 py-2.5 text-left">Metric</th><th className="px-3 py-2.5 text-left">Document Required</th><th className="px-3 py-2.5 text-left">Status</th><th className="px-3 py-2.5 text-left">File</th><th className="px-3 py-2.5 text-left">Link</th><th className="w-20 px-3 py-2.5" /></tr></thead>
          <tbody>{rows.slice(0, 400).map((r, i) => <tr key={i} className="border-t border-slate-100 hover:bg-violet-50/40"><td className="px-3 py-2 font-mono font-bold text-[#4a1545]">{r.metricId}</td><td className="max-w-[360px] px-3 py-2 text-slate-700">{r.doc}</td><td className="px-3 py-2"><span className={`rounded px-2 py-0.5 text-[11px] font-bold ${r.status === 'Verified' ? 'bg-emerald-100 text-emerald-700' : r.status === 'Added' ? 'bg-sky-100 text-sky-700' : 'bg-red-100 text-red-700'}`}>{r.status}</span></td><td className="px-3 py-2 text-slate-500">{r.file}</td><td className="max-w-[180px] truncate px-3 py-2 text-slate-500">{r.link}</td><td className="px-3 py-2"><button onClick={() => onNavigate({ k: 'metric', metricId: r.metricId })} className="rounded bg-violet-100 px-2 py-1 text-[11px] font-bold text-[#4a1545]">Open</button></td></tr>)}</tbody>
        </table></div>
        {rows.length > 400 && <div className="bg-slate-50 px-4 py-2 text-[11px] text-slate-500">Showing first 400 of {rows.length} rows — refine filter.</div>}
      </div>
    </div>
  );
}

/* ── Summary ── */
export function SummaryView({ data, onNavigate }: { data: InstitutionData; onNavigate: (v: ViewKind) => void }) {
  const ssr = useSSR();
  const per = useMemo(() => data.criteria.map((c) => {
    let done = 0, total = 0;
    c.keyIndicators.forEach((ki) => ki.metrics.forEach((mt) => { total++; if (ssr.metricStates[mt.id]?.status === 'completed') done++; }));
    return { id: c.id, numeral: c.numeral, title: c.title, weightage: c.weightage, done, total, pct: total ? Math.round((done / total) * 100) : 0 };
  }), [data, ssr.metricStates]);
  const totalDone = per.reduce((a, x) => a + x.done, 0);
  const overall = data.totalMetrics ? Math.round((totalDone / data.totalMetrics) * 100) : 0;
  const docsAdded = ssr.docs.length;
  const tablesDone = Object.values(ssr.metricStates).reduce((a, s) => a + Object.values(s.tables || {}).filter((r) => r.length > 0).length, 0);
  return (
    <div className="space-y-4">
      <button onClick={() => onNavigate({ k: 'dashboard' })} className="flex items-center gap-1.5 text-[13px] font-medium text-slate-500 hover:text-[#4a1545]"><ArrowLeft size={15} /> Dashboard</button>
      <div className="rounded-2xl border border-[#4a1545]/15 bg-gradient-to-r from-[#2d0a33] to-[#6d1d3c] p-5 text-white">
        <div className="text-[11px] uppercase tracking-widest text-white/70">SSR Completion Summary</div>
        <h1 className="text-xl font-bold sm:text-2xl">{data.name} — Overall {overall}%</h1>
        <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-white/20"><div className="h-2.5 rounded-full bg-emerald-300" style={{ width: `${overall}%` }} /></div>
        <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-[12px] text-white/80"><span>{totalDone}/{data.totalMetrics} metrics completed</span><span>{docsAdded} documents added</span><span>{tablesDone} tables with data</span></div>
        <p className="mt-2 text-[11.5px] text-white/60">No accreditation grade is computed here — grading requires peer assessment of QlM and NAAC’s prescribed calculation on submitted values.</p>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {per.map((p) => (
          <button key={p.id} onClick={() => onNavigate({ k: 'criterion', criterionId: p.id })} className="rounded-xl border border-slate-200 bg-white p-4 text-left hover:border-[#4a1545]/40 hover:shadow">
            <div className="flex items-center gap-2.5"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#4a1545] text-sm font-extrabold text-white">{p.numeral}</span>
              <div className="min-w-0 flex-1"><div className="truncate text-[13.5px] font-bold text-slate-800">Criterion {p.numeral} · {p.title}</div><div className="text-[11.5px] text-slate-500">{p.done}/{p.total} metrics · {p.weightage} pts</div></div>
              <span className="text-lg font-extrabold text-[#4a1545]">{p.pct}%</span></div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100"><div className="h-1.5 rounded-full bg-gradient-to-r from-[#4a1545] to-[#c06a9a]" style={{ width: `${p.pct}%` }} /></div>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── Compare ── */
export function CompareView({ onNavigate }: { onNavigate: (v: ViewKind) => void }) {
  const cols = [
    { d: universityData, label: 'University' },
    { d: autonomousData, label: 'Autonomous' },
    { d: affiliatedUGData, label: 'Affiliated UG' },
    { d: affiliatedPGData, label: 'Affiliated PG' },
  ];
  const kiRows = useMemo(() => {
    const map = new Map<string, { title: string; w: Record<string, number | string> }>();
    cols.forEach(({ d, label }) => d.criteria.forEach((c) => c.keyIndicators.forEach((ki) => {
      if (!map.has(ki.id)) map.set(ki.id, { title: ki.title, w: {} });
      map.get(ki.id)!.w[label] = ki.weightage;
    })));
    (['University', 'Autonomous', 'Affiliated UG', 'Affiliated PG'] as const).forEach((l) => map.forEach((v) => { if (!(l in v.w)) v.w[l] = 'NA'; }));
    return [...map.entries()].sort((a, b) => parseFloat(a[0]) - parseFloat(b[0]));
  }, []);
  return (
    <div className="space-y-4">
      <button onClick={() => onNavigate({ k: 'dashboard' })} className="flex items-center gap-1.5 text-[13px] font-medium text-slate-500 hover:text-[#4a1545]"><ArrowLeft size={15} /> Dashboard</button>
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-[#6d1d3c]"><GitCompareArrows size={14} /> Compare Manuals</div>
        <h1 className="mt-1 text-xl font-bold text-slate-900">University vs Autonomous vs Affiliated</h1>
        <p className="mt-1 text-[12.5px] text-slate-500">Only differences established from the manuals (Table 1: metric distribution; Table 2: KI weightages; KI applicability). Metric-level wording differences (e.g., KI 1.1 U/A) are shown in the respective workspaces.</p>
        <div className="mt-3 grid grid-cols-2 gap-2 lg:grid-cols-4">
          {cols.map(({ d, label }) => (
            <div key={label} className="rounded-xl bg-slate-50 p-3 ring-1 ring-slate-200">
              <div className="text-[12px] font-bold text-[#4a1545]">{label}</div>
              <div className="mt-1 text-[11.5px] text-slate-600">{d.totalKIs} KIs · {d.totalQlM} QlM + {d.totalQnM} QnM = <b>{d.totalMetrics}</b></div>
              <div className="text-[11.5px] text-slate-600">Total: {d.totalScore} points</div>
            </div>
          ))}
        </div>
      </div>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="bg-slate-50 px-4 py-3 text-[13px] font-bold text-slate-800">Table 2 — KI Weightages across Institution Types (NA = Not Applicable)</div>
        <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-[12px]">
          <thead><tr className="bg-[#2d0a33] text-white"><th className="px-3 py-2.5 text-left">KI</th><th className="px-3 py-2.5 text-left">Key Indicator</th><th className="px-3 py-2.5 text-right">Univ.</th><th className="px-3 py-2.5 text-right">Auto.</th><th className="px-3 py-2.5 text-right">Aff. UG</th><th className="px-3 py-2.5 text-right">Aff. PG</th></tr></thead>
          <tbody>{kiRows.map(([id, v]) => { const diff = new Set(Object.values(v.w)).size > 1; return <tr key={id} className={`border-t border-slate-100 ${diff ? 'bg-amber-50/50' : ''}`}><td className="px-3 py-2 font-mono font-bold text-[#4a1545]">{id}</td><td className="px-3 py-2 text-slate-700">{v.title}</td>{(['University', 'Autonomous', 'Affiliated UG', 'Affiliated PG'] as const).map((l) => <td key={l} className="px-3 py-2 text-right font-semibold text-slate-700">{v.w[l]}</td>)}</tr>; })}</tbody>
        </table></div>
        <div className="bg-slate-50 px-4 py-2 text-[11px] text-slate-500">Highlighted rows differ across manuals. Footnote: *(U) applicable only for Universities & Autonomous; *(A) only for Affiliated. In case of 5% Non-Applicable opt-out, total score varies accordingly.</div>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <h3 className="text-[13px] font-bold text-slate-800">Institution-specific Sections</h3>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-[12.5px] text-slate-600">
          <li><b>KI 1.1(U) Curriculum Design & Development</b> (Univ/Auto) vs <b>KI 1.1(A) Curricular Planning & Implementation</b> (Affiliated) — different metrics and emphasis.</li>
          <li><b>Criterion III:</b> KIs 3.1 (Promotion of Research) and 3.5 (Consultancy) are NA for affiliated; KI 3.3 (Innovation Ecosystem) is NA for UG only — hence 7/7/4/5 KIs.</li>
          <li><b>Criterion II weightage</b> is 200 (Univ) / 300 (Auto) / 350 (Affiliated); <b>Criterion III</b> is 250 / 150 / 110 (UG) / 120 (PG).</li>
          <li><b>Criterion V weightage</b> differs: 100 / 100 / 140 (UG) / 130 (PG).</li>
          <li><b>Departmental Evaluative Report</b> depth varies: departments/schools (Univ), departments (Auto), department-wise compilation (Affiliated).</li>
        </ul>
      </div>
    </div>
  );
}

/* ── Search ── */
export function SearchView({ data, query, onNavigate }: { data: InstitutionData; query: string; onNavigate: (v: ViewKind) => void }) {
  const [typeF, setTypeF] = useState<'All' | 'QlM' | 'QnM'>('All');
  const [statusF, setStatusF] = useState<string>('All');
  const ssr = useSSR();
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const out: { id: string; title: string; type: string; ki: string; crit: string; critId: number; status: string }[] = [];
    if (!q) return out;
    data.criteria.forEach((c) => c.keyIndicators.forEach((ki) => {
      const kiHit = ki.id.includes(q) || ki.title.toLowerCase().includes(q);
      ki.metrics.forEach((mt) => {
        const hit = kiHit || mt.id.includes(q) || mt.title.toLowerCase().includes(q) || mt.description.toLowerCase().includes(q) || mt.dataRequired.some((d) => d.toLowerCase().includes(q)) || mt.documentsRequired.some((d) => d.name.toLowerCase().includes(q));
        if (!hit) return;
        if (typeF !== 'All' && mt.type !== typeF) return;
        const st = ssr.metricStates[mt.id]?.status ?? 'not-started';
        if (statusF !== 'All' && st !== statusF) return;
        out.push({ id: mt.id, title: mt.title, type: mt.type, ki: ki.id, crit: `Criterion ${c.numeral}`, critId: c.id, status: st });
      });
    }));
    return out.slice(0, 120);
  }, [data, query, typeF, statusF, ssr.metricStates]);
  return (
    <div className="space-y-4">
      <button onClick={() => onNavigate({ k: 'dashboard' })} className="flex items-center gap-1.5 text-[13px] font-medium text-slate-500 hover:text-[#4a1545]"><ArrowLeft size={15} /> Dashboard</button>
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="text-[11px] font-bold uppercase tracking-widest text-[#6d1d3c]">Global Search</div>
        <h1 className="mt-1 text-xl font-bold text-slate-900">Results for “{query}” — {results.length}</h1>
        <div className="mt-2 flex flex-wrap gap-2">
          <div className="flex gap-1.5">{(['All', 'QlM', 'QnM'] as const).map((t) => <button key={t} onClick={() => setTypeF(t)} className={`rounded-lg px-3 py-1.5 text-[12px] font-bold ${typeF === t ? 'bg-[#4a1545] text-white' : 'bg-slate-100 text-slate-600'}`}>{t}</button>)}</div>
          <div className="flex gap-1.5">{(['All', 'not-started', 'in-progress', 'completed'] as const).map((s) => <button key={s} onClick={() => setStatusF(s)} className={`rounded-lg px-3 py-1.5 text-[12px] font-bold ${statusF === s ? 'bg-[#4a1545] text-white' : 'bg-slate-100 text-slate-600'}`}>{s === 'All' ? 'All Status' : s}</button>)}</div>
        </div>
      </div>
      <div className="space-y-2">
        {results.map((r) => (
          <button key={r.id} onClick={() => onNavigate({ k: 'metric', metricId: r.id })} className="block w-full rounded-xl border border-slate-200 bg-white p-3.5 text-left hover:border-[#4a1545]/40 hover:shadow">
            <div className="flex flex-wrap items-center gap-2 text-[11px]"><span className="font-mono text-[12.5px] font-extrabold text-[#4a1545]">Metric {r.id}</span><span className={`rounded px-1.5 py-0.5 font-bold ${r.type === 'QlM' ? 'bg-purple-100 text-purple-700' : 'bg-sky-100 text-sky-700'}`}>{r.type}</span><span className="text-slate-500">{r.crit} · KI {r.ki}</span><span className="ml-auto flex items-center gap-1 text-slate-500">{r.status === 'completed' ? <CircleCheck size={13} className="text-emerald-600" /> : r.status === 'in-progress' ? <CircleDashed size={13} className="text-amber-500" /> : <Circle size={13} className="text-slate-300" />}{r.status}</span></div>
            <div className="mt-1 text-[13px] font-medium text-slate-800">{r.title}</div>
          </button>
        ))}
        {results.length === 0 && <div className="rounded-xl bg-white p-8 text-center"><FileText size={28} className="mx-auto text-slate-300" /><div className="mt-2 text-[13px] text-slate-500">No results. Try metric numbers (e.g., 3.4.3), keywords (e.g., “student progression”, “library”, “MoU”) or document names.</div></div>}
      </div>
    </div>
  );
}

/* small re-exports to satisfy unused imports */
export const _icons = { Scale, Check, ExternalLink };
