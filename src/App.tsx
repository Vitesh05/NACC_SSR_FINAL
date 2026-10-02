import { useMemo, useState } from 'react';
import { Landmark, Building2, School, GraduationCap, ArrowRight, BookOpen, Scale, FileText, ShieldCheck } from 'lucide-react';
import { getInstitutionData } from './data/registry';
import { SSRProvider } from './store/ssrStore';
import { Header, Sidebar, type ViewKind } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { CriterionView } from './components/CriterionView';
import { MetricDetail } from './components/MetricDetail';
import { SectionBInfoView, FormView, formSectionsFor, QifView, ChecklistView, SummaryView, CompareView, SearchView } from './components/SectionsView';

function Welcome({ inst, variant, setInst, setVariant, onEnter }: {
  inst: 'university' | 'autonomous' | 'affiliated'; variant: 'ug' | 'pg';
  setInst: (v: 'university' | 'autonomous' | 'affiliated') => void; setVariant: (v: 'ug' | 'pg') => void; onEnter: () => void;
}) {
  const cards = [
    { id: 'university' as const, icon: <Building2 size={26} />, title: 'University', sub: 'Manual for Universities', meta: '7 Criteria · 34 KIs · 115 Metrics (36 QlM + 79 QnM)' },
    { id: 'autonomous' as const, icon: <School size={26} />, title: 'Autonomous College', sub: 'Manual for Autonomous Colleges', meta: '7 Criteria · 34 KIs · 107 Metrics (35 QlM + 72 QnM)' },
    { id: 'affiliated' as const, icon: <GraduationCap size={26} />, title: 'Affiliated / Constituent College', sub: 'Manual for Affiliated / Constituent UG & PG Colleges', meta: 'UG: 31 KIs · 93 Metrics · PG: 32 KIs · 96 Metrics' },
  ];
  return (
    <div className="min-h-screen text-slate-800">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0b6e5e] text-white shadow-md"><Landmark size={26} /></span>
          <div><div className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#0b6e5e]">NAAC · Quality and Excellence in Higher Education</div>
          <h1 className="text-2xl font-extrabold text-[#0a3f37] sm:text-3xl">NAAC SSR — Self-Study Report Digital Workspace</h1></div>
        </div>
        <p className="mt-3 max-w-3xl text-[14px] leading-relaxed text-slate-600">Prepare, organize and track the NAAC Self-Study Report using the official SSR manual. One application · three institution types · Part A (Executive Summary, Profile, Extended Profile) · Part B (Quality Indicator Framework with all seven criteria, Key Indicators, all metrics, exact questions, weightages, data requirements, tables, documents, evidence, links) · Evaluative Report of the Departments · progress tracking.</p>

        <div className="mt-6 rounded-2xl border border-[#d5e4e1] bg-white/85 p-4 shadow-sm backdrop-blur sm:p-5">
          <div className="text-[12px] font-bold uppercase tracking-widest text-slate-500">Select Institution Type</div>
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            {cards.map((c) => (
              <button key={c.id} onClick={() => setInst(c.id)} aria-pressed={inst === c.id}
                className={`rounded-xl border-2 p-4 text-left transition ${inst === c.id ? 'border-[#0b6e5e] bg-[#eef7f5] shadow-md' : 'border-slate-200 bg-white hover:border-[#7fbdb3] hover:bg-[#f4faf8]'}`}>
                <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${inst === c.id ? 'bg-[#0b6e5e] text-white' : 'bg-[#e3efec] text-[#0b6e5e]'}`}>{c.icon}</span>
                <span className="mt-2.5 block text-[15px] font-extrabold text-slate-900">{c.title}</span>
                <span className="block text-[12px] text-slate-600">{c.sub}</span>
                <span className="mt-1.5 block text-[11.5px] font-medium text-[#0b6e5e]">{c.meta}</span>
              </button>
            ))}
          </div>
          {inst === 'affiliated' && (
            <div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl border border-[#d5e4e1] bg-[#f2f8f6] p-3">
              <span className="text-[13px] font-semibold text-slate-600">Affiliated college type:</span>
              {(['ug', 'pg'] as const).map((v) => (
                <button key={v} onClick={() => setVariant(v)} className={`rounded-lg px-5 py-2 text-[13px] font-extrabold ${variant === v ? 'bg-[#0b6e5e] text-white shadow' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-teal-50'}`}>
                  {v === 'ug' ? 'UG College (93 Metrics)' : 'PG College (96 Metrics)'}
                </button>
              ))}
            </div>
          )}
          <button onClick={onEnter} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#0b6e5e] px-6 py-3.5 text-[15px] font-extrabold text-white shadow-md transition hover:bg-[#084c43]">
            Enter SSR Workspace <ArrowRight size={18} />
          </button>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: <BookOpen size={17} />, t: 'Complete QIF Hierarchy', d: 'Criterion → Key Indicator → Metric → Question → Response → Documents → Tables' },
            { icon: <Scale size={17} />, t: 'Weightages & Marks', d: 'KI and metric weightages exactly as demarcated in the manuals' },
            { icon: <FileText size={17} />, t: 'Templates & Evidence', d: 'Interactive data tables, uploads, links, geo-tagged visual evidence' },
            { icon: <ShieldCheck size={17} />, t: 'Editable Questions', d: 'Every QIF question can be modified — edit text, sub-questions, add your own' },
          ].map((f) => (
            <div key={f.t} className="rounded-xl border border-[#d5e4e1] bg-white/85 p-3.5 shadow-sm">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#e3efec] text-[#0b6e5e]">{f.icon}</span>
              <div className="mt-2 text-[13.5px] font-bold text-slate-800">{f.t}</div><div className="mt-0.5 text-[12px] text-slate-500">{f.d}</div>
            </div>
          ))}
        </div>
        <p className="mt-5 text-center text-[11.5px] text-slate-400">Frontend-only workspace · Data persists locally in your browser · Verify against official NAAC manuals before submission.</p>
      </div>
    </div>
  );
}

export default function App() {
  const [entered, setEntered] = useState(false);
  const [instId, setInstId] = useState<'university' | 'autonomous' | 'affiliated'>('university');
  const [variant, setVariant] = useState<'ug' | 'pg'>('ug');
  const [view, setView] = useState<ViewKind>({ k: 'dashboard' });
  const [search, setSearch] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const data = useMemo(() => getInstitutionData(instId, variant), [instId, variant]);
  const instKey = `${instId}-${variant}`;

  const navigate = (v: ViewKind) => { setView(v); setSidebarOpen(false); window.scrollTo({ top: 0 }); };
  const changeInst = (v: 'university' | 'autonomous' | 'affiliated') => { setInstId(v); setView({ k: 'dashboard' }); };
  const changeVariant = (v: 'ug' | 'pg') => { setVariant(v); setView({ k: 'dashboard' }); };

  if (!entered) return <Welcome inst={instId} variant={variant} setInst={setInstId} setVariant={setVariant} onEnter={() => setEntered(true)} />;

  const findMetric = (id: string) => {
    for (const c of data.criteria) for (const ki of c.keyIndicators) for (const mt of ki.metrics) if (mt.id === id) return mt;
    return null;
  };

  return (
    // key={instKey} forces a full remount on institution switch:
    // progress, docs, links and tables can NEVER leak across institution types.
    <SSRProvider key={instKey} instKey={instKey}>
      <div className="min-h-screen bg-transparent">
        <Header data={data} instId={instId} variant={variant} onInstChange={changeInst} onVariantChange={changeVariant}
          view={view} onNavigate={navigate} search={search} onSearch={setSearch}
          sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} collapsed={collapsed} setCollapsed={setCollapsed}
          onSearchSubmit={() => search.trim() && navigate({ k: 'search' })} />
        <Sidebar data={data} instId={instId} variant={variant} onInstChange={changeInst} onVariantChange={changeVariant}
          view={view} onNavigate={navigate} search={search} onSearch={setSearch}
          sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} collapsed={collapsed} setCollapsed={setCollapsed} />
        <main className={`px-3 pb-10 pt-24 transition-all sm:px-5 md:pt-20 ${collapsed ? 'lg:pl-[84px]' : 'lg:pl-[316px]'}`}>
          <div className="mx-auto max-w-6xl">
            {view.k === 'dashboard' && <Dashboard data={data} onNavigate={navigate} />}
            {view.k === 'criterion' && (() => { const c = data.criteria.find((x) => x.id === view.criterionId); return c ? <CriterionView criterion={c} onNavigate={navigate} /> : null; })()}
            {view.k === 'metric' && (() => { const mt = findMetric(view.metricId); return mt ? <MetricDetail data={data} metric={mt} onNavigate={navigate} /> : <div className="rounded-xl bg-white p-8 text-center text-sm text-slate-500">Metric not found in the {data.name} manual.</div>; })()}
            {view.k === 'sectionB' && <SectionBInfoView data={data} itemId={view.itemId} onNavigate={navigate} />}
            {view.k === 'sectionB-form' && (() => { const f = formSectionsFor(view.formId, data); return <FormView title={f.title} crumb="SSR Workspace" sections={f.sections} formPrefix={`${instKey}:${view.formId}`} onNavigate={navigate} manualRef={f.manualRef} />; })()}
            {view.k === 'qif' && <QifView data={data} onNavigate={navigate} />}
            {view.k === 'checklist' && <ChecklistView data={data} onNavigate={navigate} />}
            {view.k === 'summary' && <SummaryView data={data} onNavigate={navigate} />}
            {view.k === 'compare' && <CompareView onNavigate={navigate} />}
            {view.k === 'search' && <SearchView data={data} query={search} onNavigate={navigate} />}
            {view.k === 'welcome' && <Dashboard data={data} onNavigate={navigate} />}
          </div>
          <footer className="mx-auto mt-8 max-w-6xl rounded-xl border border-slate-200 bg-white p-4 text-center text-[11.5px] text-slate-500">
            <span className="font-bold text-slate-700">NAAC SSR Digital Workspace</span> · {data.manualName} · {data.totalCriteria} Criteria · {data.totalKIs} KIs · {data.totalMetrics} Metrics ({data.totalQlM} QlM + {data.totalQnM} QnM) · {data.totalScore} Points
            <br />Part A (Executive Summary · Profile · Extended Profile) + Part B (QIF with all Criteria & Questions · Evaluative Report of the Departments). Frontend-only — verify against official manuals before submission.
          </footer>
        </main>
      </div>
    </SSRProvider>
  );
}
