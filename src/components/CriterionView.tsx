import { useMemo, useState } from 'react';
import { ChevronDown, ChevronRight, CircleCheck, CircleDashed, Circle, Star, ArrowLeft, Filter, ArrowRight } from 'lucide-react';
import type { Criterion } from '../data/types';
import { useSSR } from '../store/ssrStore';
import type { ViewKind } from './Layout';

/**
 * OPTION B + SARGEN-inspired hierarchy (visual reference only):
 * - Criterion banner with marks pill (à la SARGEN "120 marks")
 * - KI sub-tab pills row (à la SARGEN "2.1 Teaching Learning Process")
 * - KI headers with accent bar + (XX MARKS)
 * - Metric cards: ID badge + ★ marks pill + exact question + Open Metric
 * Strict rule: every KI and every metric renders ONLY its own data.
 */
export function CriterionView({ criterion, onNavigate }: { criterion: Criterion; onNavigate: (v: ViewKind) => void }) {
  const ssr = useSSR();
  const { metricStates } = ssr;
  const [openKIs, setOpenKIs] = useState<Record<string, boolean>>(() => ({ [criterion.keyIndicators[0]?.id ?? '']: true }));
  const [typeFilter, setTypeFilter] = useState<'All' | 'QlM' | 'QnM'>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'not-started' | 'in-progress' | 'completed'>('All');
  const [activeKi, setActiveKi] = useState<string>(criterion.keyIndicators[0]?.id ?? '');

  const summary = useMemo(() => {
    let done = 0, total = 0, qlm = 0, qnm = 0;
    criterion.keyIndicators.forEach((ki) => ki.metrics.forEach((mt) => {
      total++; if (mt.type === 'QlM') qlm++; else qnm++;
      if (metricStates[mt.id]?.status === 'completed') done++;
    }));
    return { done, total, qlm, qnm, pct: total ? Math.round((done / total) * 100) : 0 };
  }, [criterion, metricStates]);

  const jumpToKi = (kiId: string) => {
    setActiveKi(kiId);
    setOpenKIs((p) => ({ ...p, [kiId]: true }));
    document.getElementById(`ki-${kiId}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="space-y-4">
      <button onClick={() => onNavigate({ k: 'dashboard' })} className="flex items-center gap-1.5 text-[13px] font-medium text-slate-500 hover:text-[#4a1545]"><ArrowLeft size={15} /> Back to Dashboard</button>

      {/* ── Criterion banner (SARGEN-style hero, Option B maroon) ── */}
      <div className="rounded-2xl bg-gradient-to-r from-[#2d0a33] via-[#4a1545] to-[#7b2340] p-5 text-white shadow-md sm:p-6">
        <div className="flex flex-wrap items-start gap-3">
          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-semibold uppercase tracking-widest text-white/60">Criterion {criterion.numeral}</div>
            <h1 className="mt-0.5 text-xl font-extrabold sm:text-2xl">Criterion {criterion.numeral} — {criterion.title}</h1>
            <p className="mt-1.5 max-w-4xl text-[12.5px] leading-relaxed text-white/75">{criterion.description}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">{criterion.focusAreas.map((f) => <span key={f} className="rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] ring-1 ring-white/20">{f}</span>)}</div>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-2">
            <span className="flex items-center gap-1.5 rounded-full bg-white/15 px-4 py-1.5 text-[13px] font-extrabold ring-1 ring-white/25"><Star size={14} /> {criterion.weightage} marks</span>
            <span className="rounded-xl bg-white/10 px-3 py-1.5 text-center text-[11px] ring-1 ring-white/20"><b className="text-base">{summary.pct}%</b><br />{summary.done}/{summary.total} metrics</span>
          </div>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/20"><div className="h-2 rounded-full bg-emerald-300 transition-all" style={{ width: `${summary.pct}%` }} /></div>
        <div className="mt-2 text-[11px] text-white/70">{criterion.keyIndicators.length} Key Indicators · {summary.total} Metrics · {summary.qlm} Qualitative (QlM) · {summary.qnm} Quantitative (QnM)</div>
      </div>

      {/* ── KI sub-tab pills (SARGEN-style) ── */}
      <div className="flex gap-2 overflow-x-auto rounded-xl border border-slate-200 bg-white p-2.5 shadow-sm" role="tablist" aria-label="Key Indicators">
        {criterion.keyIndicators.map((ki) => {
          const done = ki.metrics.filter((mt) => metricStates[mt.id]?.status === 'completed').length;
          const active = activeKi === ki.id;
          return (
            <button key={ki.id} role="tab" aria-selected={active} onClick={() => jumpToKi(ki.id)}
              className={`whitespace-nowrap rounded-lg px-3.5 py-2 text-[12px] font-bold transition ${active ? 'bg-[#4a1545] text-white shadow' : 'bg-slate-100 text-slate-600 hover:bg-violet-100 hover:text-[#4a1545]'}`}>
              {ki.id} {ki.title.length > 26 ? `${ki.title.slice(0, 26)}…` : ki.title}
              <span className={`ml-1.5 text-[10.5px] font-semibold ${active ? 'text-white/70' : 'text-slate-400'}`}>{done}/{ki.metrics.length}</span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
        <span className="flex items-center gap-1.5 text-[12px] font-semibold text-slate-500"><Filter size={14} /> Filters:</span>
        <div className="flex gap-1.5">
          {(['All', 'QlM', 'QnM'] as const).map((t) => (
            <button key={t} onClick={() => setTypeFilter(t)} className={`rounded-lg px-3 py-1.5 text-[12px] font-semibold ${typeFilter === t ? 'bg-[#4a1545] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{t === 'All' ? 'All Types' : t}</button>
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {([['All', 'All Status'], ['not-started', 'Not Started'], ['in-progress', 'In Progress'], ['completed', 'Completed']] as const).map(([v, l]) => (
            <button key={v} onClick={() => setStatusFilter(v)} className={`rounded-lg px-3 py-1.5 text-[12px] font-semibold ${statusFilter === v ? 'bg-[#4a1545] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{l}</button>
          ))}
        </div>
      </div>

      {/* ── KI sections: each KI strictly separate ── */}
      <div className="space-y-5">
        {criterion.keyIndicators.map((ki) => {
          const done = ki.metrics.filter((mt) => metricStates[mt.id]?.status === 'completed').length;
          const pct = ki.metrics.length ? Math.round((done / ki.metrics.length) * 100) : 0;
          const open = !!openKIs[ki.id];
          const visible = ki.metrics.filter((mt) => (typeFilter === 'All' || mt.type === typeFilter) && (statusFilter === 'All' || (metricStates[mt.id]?.status ?? 'not-started') === statusFilter));
          return (
            <section key={ki.id} id={`ki-${ki.id}`} aria-label={`Key Indicator ${ki.id}`} className="scroll-mt-24">
              {/* KI header with accent bar + MARKS (SARGEN-style) */}
              <button onClick={() => { setOpenKIs({ ...openKIs, [ki.id]: !open }); setActiveKi(ki.id); }}
                className="flex w-full items-center gap-2.5 border-l-4 border-[#4a1545] bg-white/60 py-1 pl-3 pr-2 text-left" aria-expanded={open}>
                {open ? <ChevronDown size={17} className="shrink-0 text-[#4a1545]" /> : <ChevronRight size={17} className="shrink-0 text-slate-400" />}
                <span className="min-w-0 flex-1">
                  <span className="block text-[13.5px] font-extrabold uppercase tracking-wide text-slate-800">{ki.id} — {ki.title} ({ki.weightage} MARKS)</span>
                  <span className="block truncate text-[11.5px] font-normal normal-case tracking-normal text-slate-500">KI Weightage: {ki.weightage} · {ki.metrics.length} metrics · {done} completed · {ki.description}</span>
                </span>
                <span className="hidden w-24 shrink-0 sm:block"><span className="block h-1.5 overflow-hidden rounded-full bg-slate-200"><span className="block h-1.5 rounded-full bg-[#4a1545]" style={{ width: `${pct}%` }} /></span><span className="block text-right text-[10px] font-bold text-slate-600">{pct}%</span></span>
              </button>

              {open && (
                <div className="mt-2.5 space-y-3">
                  {visible.length === 0 && <div className="rounded-xl border border-slate-200 bg-white p-4 text-center text-[12px] text-slate-400">No metrics in KI {ki.id} match the selected filters.</div>}
                  {/* Each metric = independent card. NEVER combined. */}
                  {visible.map((mt) => {
                    const st = metricStates[mt.id]?.status ?? 'not-started';
                    const customTitle = metricStates[mt.id]?.customTitle?.trim();
                    const effTitle = customTitle || mt.title;
                    return (
                      <article key={mt.uid ?? mt.id} aria-label={`Metric ${mt.id}`} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:border-[#4a1545]/40 hover:shadow-md">
                        <div className="p-4">
                          <div className="flex items-center justify-between gap-2">
                            <span className="rounded-md bg-violet-100 px-2.5 py-1 font-mono text-[12px] font-extrabold text-[#4a1545]">{mt.id}</span>
                            <span className="flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[12px] font-extrabold text-emerald-700"><Star size={12} /> {mt.weightage} marks</span>
                          </div>
                          <h3 className="mt-2.5 text-[14px] font-bold leading-relaxed text-slate-900">{effTitle}{customTitle && <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 align-middle text-[10px] font-bold text-amber-700">Edited</span>}</h3>
                          <div className="mt-2 text-[10.5px] font-bold uppercase tracking-wider text-slate-400">{mt.id} · {effTitle.length > 90 ? `${effTitle.slice(0, 90)}…` : effTitle}</div>
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            {st === 'completed' ? <CircleCheck size={16} className="text-emerald-600" /> : st === 'in-progress' ? <CircleDashed size={16} className="text-amber-500" /> : <Circle size={16} className="text-slate-300" />}
                            <span className={`rounded px-2 py-0.5 text-[10.5px] font-bold ${mt.type === 'QlM' ? 'bg-purple-100 text-purple-700' : 'bg-sky-100 text-sky-700'}`}>{mt.type === 'QlM' ? 'Qualitative Metric' : 'Quantitative Metric'} · {mt.type}</span>
                            <span className={`rounded px-2 py-0.5 text-[10.5px] font-semibold ${st === 'completed' ? 'bg-emerald-50 text-emerald-700' : st === 'in-progress' ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>{st === 'completed' ? '✓ Completed' : st === 'in-progress' ? '◐ In Progress' : '○ Not Started'}</span>
                            <span className="text-[11px] text-slate-400">Metric weightage {mt.weightage} · belongs only to {mt.id}</span>
                          </div>
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {(mt.subQuestions?.length ?? 0) > 0 && <span className="rounded-full bg-[#e9f3f1] px-2 py-0.5 text-[10.5px] font-bold text-[#0b6e5e]">{mt.subQuestions!.length} sub-questions ({mt.subQuestions!.map((s) => s.id).join(', ')})</span>}
                            {(mt.fileDescription?.length ?? 0) > 0 && <span className="rounded-full bg-[#e9f3f1] px-2 py-0.5 text-[10.5px] font-bold text-[#0b6e5e]">File Description</span>}
                            {(mt.dataTemplateFields?.length ?? 0) > 0 && <span className="rounded-full bg-[#e9f3f1] px-2 py-0.5 text-[10.5px] font-bold text-[#0b6e5e]">Data Template</span>}
                            {(mt.options?.length ?? 0) > 0 && <span className="rounded-full bg-sky-50 px-2 py-0.5 text-[10.5px] font-bold text-sky-700 ring-1 ring-sky-200">Options A–E</span>}
                            {mt.formula && <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10.5px] font-bold text-amber-700 ring-1 ring-amber-200">Formula</span>}
                          </div>
                          <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
                            <span className="text-[11px] text-slate-500">{mt.dataRequired.length} data item(s) · {mt.tables.length} table(s) · {ssr.getReqDocs(mt.id, mt.documentsRequired).length} required document(s)</span>
                            <button onClick={() => onNavigate({ k: 'metric', metricId: mt.id })} className="ml-auto flex items-center gap-1.5 rounded-lg bg-[#4a1545] px-4 py-2 text-[12.5px] font-bold text-white hover:bg-[#3a1035]">Open Metric {mt.id} <ArrowRight size={14} /></button>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
