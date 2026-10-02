import { useState } from 'react';
import {
  Landmark, Search, Bell, User, Menu, ChevronDown, ChevronRight, LayoutDashboard,
  Layers, Scale, GraduationCap,
  Building2, School, HelpCircle, PanelLeftClose, PanelLeftOpen, ListChecks, GitCompareArrows,
  ClipboardList,
} from 'lucide-react';
import type { InstitutionData } from '../data/types';

// Fix icon import alias issue: FileBarChart2 may not exist; use safe fallback
const SummaryIcon = ClipboardList;

export type ViewKind =
  | { k: 'welcome' } | { k: 'dashboard' } | { k: 'criterion'; criterionId: number }
  | { k: 'metric'; metricId: string } | { k: 'sectionB'; itemId: string }
  | { k: 'sectionB-form'; formId: string }
  | { k: 'qif' } | { k: 'checklist' }
  | { k: 'summary' } | { k: 'compare' } | { k: 'search' };

interface LayoutProps {
  data: InstitutionData;
  instId: 'university' | 'autonomous' | 'affiliated';
  variant: 'ug' | 'pg';
  onInstChange: (v: 'university' | 'autonomous' | 'affiliated') => void;
  onVariantChange: (v: 'ug' | 'pg') => void;
  view: ViewKind;
  onNavigate: (v: ViewKind) => void;
  search: string;
  onSearch: (v: string) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (v: boolean) => void;
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
}

const PART_A = [
  ['b-exec', '1. Executive Summary', 'exec'],
  ['b-profile', '2. Profile', 'profile'],
  ['b-extended', '3. Extended Profile', 'extended'],
];
const PART_B = [
  ['b-qif', '4. Quality Indicator Framework (QIF)', 'qif'],
  ['b-dept', '5. Evaluative Report of the Departments', 'dept'],
];

export function Header(p: LayoutProps & { onSearchSubmit: () => void }) {
  const [instOpen, setInstOpen] = useState(false);
  const instLabel = p.instId === 'university' ? 'University' : p.instId === 'autonomous' ? 'Autonomous College' : `Affiliated / Constituent (${p.variant.toUpperCase()})`;
  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-[#d5e4e1] bg-white/95 text-slate-800 shadow-[0_1px_10px_rgba(11,110,94,0.10)] backdrop-blur">
      <div className="flex h-16 items-center gap-3 px-3 sm:px-5">
        <button onClick={() => p.setSidebarOpen(!p.sidebarOpen)} className="rounded-lg p-2 text-slate-500 hover:bg-[#e9f3f1] hover:text-[#0b6e5e] lg:hidden" aria-label="Toggle navigation"><Menu size={20} /></button>
        <button onClick={() => p.setCollapsed(!p.collapsed)} className="hidden rounded-lg p-2 text-slate-500 hover:bg-[#e9f3f1] hover:text-[#0b6e5e] lg:block" aria-label="Collapse sidebar">
          {p.collapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
        </button>
        <button onClick={() => p.onNavigate({ k: 'dashboard' })} className="flex items-center gap-3 text-left">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0b6e5e] text-white shadow-sm"><Landmark size={22} /></span>
          <span className="hidden sm:block">
            <span className="block text-[13px] font-extrabold tracking-wide text-[#0a3f37]">NAAC SSR DIGITAL WORKSPACE</span>
            <span className="block text-[11px] text-slate-500">Self-Study Report Preparation Portal</span>
          </span>
        </button>
        <div className="mx-auto hidden max-w-md flex-1 items-center md:flex">
          <div className="relative w-full">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={p.search} onChange={(e) => p.onSearch(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') p.onSearchSubmit(); }}
              placeholder="Search criteria, KIs, metrics, questions, documents…" aria-label="Global search"
              className="w-full rounded-lg border border-[#d5e4e1] bg-[#f1f5f4] py-2 pl-9 pr-4 text-sm text-slate-700 placeholder:text-slate-400 focus:border-[#0b6e5e] focus:bg-white focus:outline-none" />
          </div>
        </div>
        <div className="relative ml-auto md:ml-0">
          <button onClick={() => setInstOpen(!instOpen)} className="flex items-center gap-2 rounded-lg border border-[#bcd8d2] bg-[#eef7f5] px-3 py-2 text-sm font-semibold text-[#0a3f37] hover:bg-[#e3efec]" aria-haspopup="listbox" aria-expanded={instOpen}>
            <GraduationCap size={16} /><span className="hidden max-w-[180px] truncate sm:inline">[ {instLabel} ▼ ]</span><span className="sm:hidden">Inst.</span><ChevronDown size={14} />
          </button>
          {instOpen && (
            <div className="absolute right-0 mt-2 w-72 overflow-hidden rounded-xl border border-[#d5e4e1] bg-white text-slate-800 shadow-2xl" role="listbox">
              <div className="bg-[#f2f8f6] px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Select Institution Type</div>
              {([['university', 'University', Building2, 'Manual for Universities · 115 Metrics'], ['autonomous', 'Autonomous College', School, 'Autonomous Manual · 107 Metrics'], ['affiliated', 'Affiliated / Constituent College', GraduationCap, 'Affiliated Manual · UG 93 / PG 96']] as const).map(([id, label, Icon, sub]) => (
                <button key={id} onClick={() => { p.onInstChange(id); setInstOpen(false); }} className={`flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-[#eef7f5] ${p.instId === id ? 'bg-[#eef7f5]' : ''}`}>
                  <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${p.instId === id ? 'bg-[#0b6e5e] text-white' : 'bg-slate-100 text-slate-600'}`}><Icon size={18} /></span>
                  <span><span className="block text-sm font-semibold">{label}</span><span className="block text-xs text-slate-500">{sub}</span></span>
                </button>
              ))}
              {p.instId === 'affiliated' && (
                <div className="flex gap-2 border-t border-slate-100 bg-[#f2f8f6] px-4 py-3">
                  <span className="py-1 text-xs font-medium text-slate-500">College type:</span>
                  {(['ug', 'pg'] as const).map((v) => (
                    <button key={v} onClick={() => { p.onVariantChange(v); }} className={`rounded-md px-3 py-1 text-xs font-bold ${p.variant === v ? 'bg-[#0b6e5e] text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200'}`}>{v.toUpperCase()}</button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        <button className="rounded-lg p-2 text-slate-500 hover:bg-[#e9f3f1] hover:text-[#0b6e5e]" aria-label="Notifications"><Bell size={18} /></button>
        <button className="rounded-lg p-2 text-slate-500 hover:bg-[#e9f3f1] hover:text-[#0b6e5e]" aria-label="Help"><HelpCircle size={18} /></button>
        <span className="hidden h-9 w-9 items-center justify-center rounded-full bg-[#0b6e5e] text-white shadow-sm sm:flex" title="IQAC Coordinator"><User size={18} /></span>
      </div>
      <div className="px-3 pb-2 md:hidden">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={p.search} onChange={(e) => p.onSearch(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') p.onSearchSubmit(); }}
            placeholder="Search metrics, questions…" aria-label="Global search"
            className="w-full rounded-lg border border-[#d5e4e1] bg-[#f1f5f4] py-2 pl-9 pr-4 text-sm text-slate-700 placeholder:text-slate-400 focus:border-[#0b6e5e] focus:bg-white focus:outline-none" />
        </div>
      </div>
    </header>
  );
}

export function Sidebar(p: LayoutProps) {
  const [partA, setPartA] = useState(true);
  const [partB, setPartB] = useState(true);

  const cls = p.sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0';
  const w = p.collapsed ? 'lg:w-[68px]' : 'lg:w-[300px]';

  const NavBtn = ({ active, onClick, icon, label, badge }: { active?: boolean; onClick: () => void; icon: React.ReactNode; label: string; badge?: string }) => (
    <button onClick={onClick} className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[13px] transition ${active ? 'bg-[#4a1545] font-semibold text-white shadow' : 'text-slate-700 hover:bg-violet-50'}`}>
      <span className={active ? 'text-white' : 'text-[#6d1d3c]'}>{icon}</span>
      {!p.collapsed && <><span className="flex-1 truncate">{label}</span>{badge && <span className="rounded-full bg-white/20 px-1.5 text-[10px]">{badge}</span>}</>}
    </button>
  );

  return (
    <>
      {p.sidebarOpen && <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => p.setSidebarOpen(false)} />}
      <aside className={`fixed bottom-0 left-0 top-16 z-30 flex w-[300px] flex-col border-r border-slate-200 bg-white transition-all duration-200 ${cls} ${w}`} aria-label="SSR navigation">
        <div className="flex-1 overflow-y-auto px-3 py-4" style={{ scrollbarWidth: 'thin' }}>
          {!p.collapsed && <div className="px-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">Home</div>}
          <div className="mt-1 space-y-0.5">
            <NavBtn active={p.view.k === 'dashboard'} onClick={() => p.onNavigate({ k: 'dashboard' })} icon={<LayoutDashboard size={16} />} label="Dashboard" />
            <NavBtn active={p.view.k === 'summary'} onClick={() => p.onNavigate({ k: 'summary' })} icon={<SummaryIcon size={16} />} label="SSR Completion Summary" />
            <NavBtn active={p.view.k === 'checklist'} onClick={() => p.onNavigate({ k: 'checklist' })} icon={<ListChecks size={16} />} label="Document Checklist" />
            <NavBtn active={p.view.k === 'compare'} onClick={() => p.onNavigate({ k: 'compare' })} icon={<GitCompareArrows size={16} />} label="Compare Manuals" />
          </div>

          {!p.collapsed && (
            <div className="mt-3 space-y-2">
              <div>
                <button onClick={() => setPartA(!partA)} className="flex w-full items-center gap-2 rounded-md bg-slate-100 px-2 py-1.5 text-[11px] font-extrabold uppercase tracking-wide text-slate-600">
                  {partA ? <ChevronDown size={12} /> : <ChevronRight size={12} />} Part A
                </button>
                {partA && <div className="mt-1 space-y-0.5">{PART_A.map(([id, t, form]: string[]) => (
                  <NavBtn key={id} active={(p.view.k === 'sectionB' && p.view.itemId === id) || (p.view.k === 'sectionB-form' && p.view.formId === form)} onClick={() => p.onNavigate({ k: 'sectionB-form', formId: form })} icon={<Layers size={14} />} label={t} />
                ))}</div>}
              </div>
              <div>
                <button onClick={() => setPartB(!partB)} className="flex w-full items-center gap-2 rounded-md bg-slate-100 px-2 py-1.5 text-[11px] font-extrabold uppercase tracking-wide text-slate-600">
                  {partB ? <ChevronDown size={12} /> : <ChevronRight size={12} />} Part B
                </button>
                {partB && <div className="mt-1 space-y-0.5">{PART_B.map(([id, t, form]: string[]) => (
                  <NavBtn key={id} active={(p.view.k === 'sectionB' && p.view.itemId === id) || (p.view.k === 'sectionB-form' && p.view.formId === form) || (p.view.k === 'qif' && form === 'qif')} onClick={() => p.onNavigate(form === 'qif' ? { k: 'qif' } : { k: 'sectionB-form', formId: form })} icon={<Layers size={14} />} label={t} />
                ))}</div>}
              </div>
            </div>
          )}
        </div>
        <div className="border-t border-slate-100 bg-slate-50 px-3 py-2.5 text-[10.5px] text-slate-500">
          {!p.collapsed ? <><span className="font-semibold text-slate-700">{p.data.manualShort}</span><br />{p.data.totalMetrics} Metrics · {p.data.totalScore} Points</> : <Scale size={16} />}
        </div>
      </aside>
    </>
  );
}
