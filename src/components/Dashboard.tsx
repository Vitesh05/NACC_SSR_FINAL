import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid } from 'recharts';
import { Award, CircleCheck, CircleDashed, Circle, FileText, FileWarning, Table2, TrendingUp, BookOpen, Scale, ArrowRight, GraduationCap, ShieldCheck } from 'lucide-react';
import type { InstitutionData } from '../data/types';
import { checkIntegrity, assertIndependent } from '../data/registry';
import { useSSR } from '../store/ssrStore';
import type { ViewKind } from './Layout';

export function Dashboard({ data, onNavigate }: { data: InstitutionData; onNavigate: (v: ViewKind) => void }) {
  const { metricStates, docs } = useSSR();

  const stats = useMemo(() => {
    let completed = 0, inprog = 0, qlm = 0, qnM = 0, qlmDone = 0, qnMDone = 0;
    const critRows: { name: string; full: string; completed: number; total: number; pct: number; weightage: number }[] = [];
    data.criteria.forEach((c) => {
      let cd = 0, ct = 0;
      c.keyIndicators.forEach((ki) => ki.metrics.forEach((mt) => {
        ct++;
        if (mt.type === 'QlM') qlm++; else qnM++;
        const st = metricStates[mt.id]?.status ?? 'not-started';
        if (st === 'completed') { completed++; cd++; if (mt.type === 'QlM') qlmDone++; else qnMDone++; }
        else if (st === 'in-progress') inprog++;
      }));
      critRows.push({ name: c.numeral, full: c.title, completed: cd, total: ct, pct: ct ? Math.round((cd / ct) * 100) : 0, weightage: c.weightage });
    });
    const total = data.totalMetrics;
    const pending = total - completed - inprog;
    const overall = total ? Math.round((completed / total) * 100) : 0;
    const docsAdded = docs.length;
    const docsVerified = docs.filter((d) => d.status === 'verified').length;
    const tablesCompleted = Object.values(metricStates).reduce((a, s) => a + Object.values(s.tables || {}).filter((r) => r.length > 0).length, 0);
    return { completed, inprog, pending, overall, qlm, qnM, qlmDone, qnMDone, critRows, docsAdded, docsVerified, tablesCompleted };
  }, [data, metricStates, docs]);

  const pie = [
    { name: 'Completed', value: stats.completed, color: '#059669' },
    { name: 'In Progress', value: stats.inprog, color: '#d97706' },
    { name: 'Not Started', value: stats.pending, color: '#cbd5e1' },
  ];

  const cards = [
    { label: 'Criteria', value: data.totalCriteria, sub: 'Seven NAAC Criteria', icon: <BookOpen size={18} />, bg: 'bg-violet-100 text-violet-700' },
    { label: 'Key Indicators', value: data.totalKIs, sub: 'Across all criteria', icon: <Scale size={18} />, bg: 'bg-fuchsia-100 text-fuchsia-700' },
    { label: 'Total Metrics', value: data.totalMetrics, sub: `${data.totalQlM} QlM · ${data.totalQnM} QnM`, icon: <FileText size={18} />, bg: 'bg-indigo-100 text-indigo-700' },
    { label: 'Overall Completion', value: `${stats.overall}%`, sub: `${stats.completed}/${data.totalMetrics} metrics`, icon: <TrendingUp size={18} />, bg: 'bg-emerald-100 text-emerald-700' },
    { label: 'Completed', value: stats.completed, sub: `QlM ${stats.qlmDone} · QnM ${stats.qnMDone}`, icon: <CircleCheck size={18} />, bg: 'bg-emerald-100 text-emerald-700' },
    { label: 'In Progress', value: stats.inprog, sub: 'Started, not finished', icon: <CircleDashed size={18} />, bg: 'bg-amber-100 text-amber-700' },
    { label: 'Pending', value: stats.pending, sub: 'Not started', icon: <Circle size={18} />, bg: 'bg-slate-200 text-slate-600' },
    { label: 'Documents Added', value: stats.docsAdded, sub: `${stats.docsVerified} verified`, icon: <Award size={18} />, bg: 'bg-sky-100 text-sky-700' },
    { label: 'Tables With Data', value: stats.tablesCompleted, sub: 'Data templates drafted', icon: <Table2 size={18} />, bg: 'bg-rose-100 text-rose-700' },
    { label: 'Total Score', value: data.totalScore, sub: 'Maximum points', icon: <FileWarning size={18} />, bg: 'bg-orange-100 text-orange-700' },
  ];

  return (
    <div className="space-y-5">
      <div className="overflow-hidden rounded-2xl border border-[#4a1545]/15 bg-gradient-to-r from-[#2d0a33] via-[#4a1545] to-[#7b2340] p-5 text-white sm:p-6">
        <div className="flex flex-wrap items-center gap-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/25"><GraduationCap size={26} /></span>
          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-semibold uppercase tracking-widest text-white/70">{data.manualName}</div>
            <h1 className="text-xl font-bold sm:text-2xl">{data.name} — SSR Dashboard</h1>
            <p className="mt-1 max-w-3xl text-[12.5px] text-white/75">{data.sourceNote}</p>
            {(() => {
              const key = data.id === 'affiliated' ? `affiliated-${data.variant ?? 'ug'}` : data.id;
              const rep = checkIntegrity(key, data);
              const ind = assertIndependent();
              const ok = rep.ok && ind.independent;
              return (
                <div className={`mt-2 inline-flex flex-wrap items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-bold ring-1 ${ok ? 'bg-emerald-400/20 text-emerald-100 ring-emerald-300/30' : 'bg-red-400/20 text-red-100 ring-red-300/30'}`}>
                  <ShieldCheck size={13} />
                  {ok
                    ? `Verified independent unit · ${rep.kis} KIs · ${rep.qlm} QlM + ${rep.qnm} QnM = ${rep.total} · KI weights reconcile · zero shared metric objects`
                    : `Integrity attention: ${[...rep.duplicateIds.map((d) => `dup ${d}`), ...rep.kiWeightMismatch.map((m) => `KI ${m}`)].join('; ') || 'count mismatch'}${ind.independent ? '' : ` · ${ind.shared} shared objects`}`}
                </div>
              );
            })()}
          </div>
          <button onClick={() => onNavigate({ k: 'summary' })} className="flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-bold text-[#4a1545] hover:bg-white/90">SSR Summary <ArrowRight size={16} /></button>
        </div>
        <div className="mt-4">
          <div className="flex justify-between text-[11px] text-white/70"><span>Overall SSR completion</span><span className="font-bold text-white">{stats.overall}%</span></div>
          <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-white/20"><div className="h-2.5 rounded-full bg-gradient-to-r from-emerald-300 to-emerald-400 transition-all duration-500" style={{ width: `${stats.overall}%` }} /></div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm transition hover:shadow-md">
            <div className="flex items-center gap-2"><span className={`flex h-8 w-8 items-center justify-center rounded-lg ${c.bg}`}>{c.icon}</span><span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{c.label}</span></div>
            <div className="mt-2 text-2xl font-extrabold text-slate-900">{c.value}</div>
            <div className="text-[11px] text-slate-500">{c.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800">Criterion-wise Completion</h3>
          <p className="text-[11px] text-slate-500">Completed metrics per criterion (click a criterion to open it)</p>
          <div className="mt-2 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.critRows} onClick={(e: unknown) => { const p = (e as { activeLabel?: string })?.activeLabel; const row = stats.critRows.find((r) => r.name === p); if (row) { const c = data.criteria.find((x) => x.numeral === row.name); if (c) onNavigate({ k: 'criterion', criterionId: c.id }); } }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v, n) => [v, n === 'completed' ? 'Completed' : 'Total']} labelFormatter={(l) => { const r = stats.critRows.find((x) => x.name === l); return r ? `Criterion ${r.name} – ${r.full}` : String(l); }} />
                <Bar dataKey="total" fill="#e9d5e3" name="Total" radius={[4, 4, 0, 0]} />
                <Bar dataKey="completed" fill="#4a1545" name="Completed" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800">Metric Status Distribution</h3>
          <p className="text-[11px] text-slate-500">QlM vs QnM completion across the SSR</p>
          <div className="mt-2 flex h-64 flex-col items-center sm:flex-row">
            <ResponsiveContainer width="55%" height="100%">
              <PieChart>
                <Pie data={pie} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2}>
                  {pie.map((s) => <Cell key={s.name} fill={s.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="w-full space-y-2 sm:w-[45%]">
              {pie.map((s) => (
                <div key={s.name} className="flex items-center gap-2 text-sm"><span className="h-3 w-3 rounded-full" style={{ background: s.color }} /><span className="flex-1 text-slate-600">{s.name}</span><span className="font-bold text-slate-900">{s.value}</span></div>
              ))}
              <div className="mt-3 rounded-lg bg-slate-50 p-3 text-[12px] text-slate-600">
                <div className="flex justify-between"><span>Qualitative (QlM)</span><span className="font-bold">{stats.qlmDone}/{stats.qlm}</span></div>
                <div className="mt-1 h-1.5 rounded-full bg-slate-200"><div className="h-1.5 rounded-full bg-purple-500" style={{ width: `${stats.qlm ? (stats.qlmDone / stats.qlm) * 100 : 0}%` }} /></div>
                <div className="mt-2 flex justify-between"><span>Quantitative (QnM)</span><span className="font-bold">{stats.qnMDone}/{stats.qnM}</span></div>
                <div className="mt-1 h-1.5 rounded-full bg-slate-200"><div className="h-1.5 rounded-full bg-sky-500" style={{ width: `${stats.qnM ? (stats.qnMDone / stats.qnM) * 100 : 0}%` }} /></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="text-sm font-bold text-slate-800">The Seven Criteria — Basis of Assessment</h3>
        <p className="text-[11px] text-slate-500">Key Indicators are further divided into Metrics that elicit responses from HEIs. Weightages as per Table 2 of the manual.</p>
        <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {data.criteria.map((c) => {
            const row = stats.critRows.find((r) => r.name === c.numeral)!;
            return (
              <button key={c.id} onClick={() => onNavigate({ k: 'criterion', criterionId: c.id })} className="group rounded-xl border border-slate-200 p-4 text-left transition hover:border-[#4a1545]/40 hover:shadow-md">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#4a1545] text-sm font-extrabold text-white">{c.numeral}</span>
                  <div className="min-w-0 flex-1"><div className="truncate text-[13px] font-bold text-slate-800 group-hover:text-[#4a1545]">Criterion {c.numeral} · {c.title}</div>
                  <div className="text-[11px] text-slate-500">{c.keyIndicators.length} KIs · {row.total} Metrics · {c.weightage} pts</div></div>
                  <span className="text-sm font-extrabold text-[#4a1545]">{row.pct}%</span>
                </div>
                <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-slate-100"><div className="h-1.5 rounded-full bg-gradient-to-r from-[#4a1545] to-[#c06a9a]" style={{ width: `${row.pct}%` }} /></div>
                <div className="mt-1.5 text-[11px] text-slate-500">{row.completed}/{row.total} metrics completed</div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
