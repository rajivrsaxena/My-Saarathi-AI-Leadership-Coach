
import React, { useState, useMemo, useEffect } from 'react';
import { 
  PerformanceData, 
  CoachingReport, 
  Message, 
  EmployeeRecord, 
  LeadershipPersona, 
  Metric, 
  CoachingAction, 
  SentimentType,
  AppLanguage,
  PersistentStorage
} from './types';
import { INITIAL_METRICS, PERSONA_CONFIGS, SENTIMENT_MAP, PERSONAS } from './constants';
import * as gemini from './services/geminiService';
import MetricChart from './components/MetricChart';
import ActionPlan from './components/ActionPlan';
import ShareModal from './components/ShareModal';
import Logo from './components/Logo';

const STORAGE_KEY = 'saarathi_v4_storage';
const DATA_VERSION = 4;

const UI_TRANSLATIONS: Record<AppLanguage, any> = {
  'English': { input: 'Pulse', report: 'Insight', chat: 'Counsel', save: 'Save', analyze: 'Generate Strategy', myHuddle: 'My Team', history: 'Cycle History', pulse: 'Sentiment' },
  'Hinglish': { input: 'Nabs', report: 'Insight', chat: 'Counsel', save: 'Save', analyze: 'Strategy Banayein', myHuddle: 'Huddle', history: 'Archive', pulse: 'Mood' },
  'Tamil': { input: 'Pulse', report: 'Insight', chat: 'Counsel', save: 'Save', analyze: 'Generate Strategy', myHuddle: 'Huddle', history: 'Cycle History', pulse: 'Sentiment' },
  'Malayalam': { input: 'Pulse', report: 'Insight', chat: 'Counsel', save: 'Save', analyze: 'Generate Strategy', myHuddle: 'Huddle', history: 'Cycle History', pulse: 'Sentiment' },
  'Gujarati': { input: 'Pulse', report: 'Insight', chat: 'Counsel', save: 'Save', analyze: 'Generate Strategy', myHuddle: 'Huddle', history: 'Cycle History', pulse: 'Sentiment' },
  'Kannada': { input: 'Pulse', report: 'Insight', chat: 'Counsel', save: 'Save', analyze: 'Generate Strategy', myHuddle: 'Huddle', history: 'Cycle History', pulse: 'Sentiment' },
  'Bengali': { input: 'Pulse', report: 'Insight', chat: 'Counsel', save: 'Save', analyze: 'Generate Strategy', myHuddle: 'Huddle', history: 'Cycle History', pulse: 'Sentiment' },
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'input' | 'report' | 'chat'>('input');
  const [persona, setPersona] = useState<LeadershipPersona>('Empathetic Mentor');
  const [language, setLanguage] = useState<AppLanguage>('English');
  const [isLoading, setIsLoading] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [records, setRecords] = useState<EmployeeRecord[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedReportIndex, setSelectedReportIndex] = useState<number>(0);

  const [data, setData] = useState<PerformanceData>({
    employeeName: '',
    role: '',
    metrics: INITIAL_METRICS,
    observations: [],
    context: '',
    sentiment: 'Eager',
    sentimentNotes: ''
  });
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1280) setSidebarOpen(false);
      else setSidebarOpen(true);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed: PersistentStorage = JSON.parse(saved);
        if (parsed && Array.isArray(parsed.records)) {
          setRecords(parsed.records);
          if (parsed.records.length > 0) loadEmployee(parsed.records[0]);
        }
      } catch (e) { console.error(e); }
    }
  }, []);

  useEffect(() => {
    const storageObj: PersistentStorage = { version: DATA_VERSION, records: records };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(storageObj));
  }, [records]);

  const loadEmployee = (record: EmployeeRecord) => {
    setActiveId(record.id);
    setData(structuredClone(record.data));
    setSelectedReportIndex(0);
    setActiveTab(record.reports.length > 0 ? 'report' : 'input');
    setMessages([]);
    if (window.innerWidth < 1280) setSidebarOpen(false);
  };

  const createNewEmployee = () => {
    const newId = crypto.randomUUID();
    const newRecord: EmployeeRecord = {
      id: newId,
      data: { employeeName: 'New Colleague', role: '', metrics: structuredClone(INITIAL_METRICS), observations: [], context: '', sentiment: 'Eager', sentimentNotes: '' },
      reports: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setRecords([newRecord, ...records]);
    loadEmployee(newRecord);
    setActiveTab('input');
  };

  const handleGenerateReport = async () => {
    if (!data.employeeName.trim() || !activeId) return;
    setIsLoading(true);
    try {
      const res = await gemini.generateCoachingReport(data, persona, language);
      const reportWithMeta: CoachingReport = { 
        ...res, 
        id: crypto.randomUUID(), 
        timestamp: new Date().toISOString(),
        metricSnapshot: structuredClone(data) 
      };
      setRecords(prev => prev.map(r => r.id === activeId ? { ...r, data: structuredClone(data), reports: [reportWithMeta, ...r.reports], updatedAt: new Date().toISOString() } : r));
      setSelectedReportIndex(0);
      setActiveTab('report');
    } catch (error) { 
      console.error(error); 
    } finally { 
      setIsLoading(false); 
    }
  };

  const updateMetric = (index: number, field: keyof Metric, value: any) => {
    const newMetrics = [...data.metrics];
    newMetrics[index] = { ...newMetrics[index], [field]: value };
    setData({ ...data, metrics: newMetrics });
  };

  const t = UI_TRANSLATIONS[language] || UI_TRANSLATIONS['English'];
  const activeEmployee = useMemo(() => records.find(r => r.id === activeId), [records, activeId]);
  const activeReport = activeEmployee?.reports[selectedReportIndex] || null;

  return (
    <div className="min-h-screen flex text-slate-800 overflow-hidden font-sans">
      
      {/* Dynamic Sidebar Overlay */}
      {sidebarOpen && window.innerWidth < 1280 && (
        <div 
          className="fixed inset-0 bg-slate-900/10 backdrop-blur-md z-[60] transition-opacity duration-500"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Elegant Vertical Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 xl:static bg-white/40 backdrop-blur-3xl border-r border-white/40 z-[70] transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] flex flex-col ${sidebarOpen ? 'w-80 translate-x-0' : 'w-0 -translate-x-full xl:w-0 overflow-hidden'}`}
      >
        <div className="p-10 flex flex-col gap-10 h-full">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-[10px] font-black text-[#B8860B] uppercase tracking-[0.3em]">{t.myHuddle}</h2>
              <p className="text-xl font-black text-slate-900 tracking-tighter">Colleague Pool</p>
            </div>
            <button onClick={createNewEmployee} className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center hover:bg-[#B8860B] transition-all shadow-xl active:scale-90">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4"></path></svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar pr-2">
            {records.length === 0 ? (
              <div className="py-20 text-center opacity-40 italic text-sm">No profiles tracked yet.</div>
            ) : (
              records.map(record => (
                <button 
                  key={record.id} 
                  onClick={() => loadEmployee(record)} 
                  className={`w-full text-left p-5 rounded-[2rem] transition-all border-2 group ${activeId === record.id ? 'bg-white border-white shadow-2xl shadow-[#B8860B]/5 ring-1 ring-[#B8860B]/10' : 'bg-transparent border-transparent hover:bg-white/40'}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-[1.25rem] flex items-center justify-center font-black text-sm transition-all shadow-sm ${activeId === record.id ? 'bg-slate-900 text-white' : 'bg-white text-slate-400 border border-slate-100'}`}>
                      {record.data.employeeName.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-slate-800 text-sm truncate">{record.data.employeeName}</h3>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest truncate">{record.data.role || 'Unassigned'}</p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
          
          <div className="pt-6 border-t border-slate-100/50">
             <button onClick={() => setIsShareModalOpen(true)} className="w-full py-4 rounded-2xl bg-white border border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-colors">Export Workspace</button>
          </div>
        </div>
      </aside>

      {/* Main Experience Layer */}
      <div className="flex-1 flex flex-col h-screen relative transition-all duration-500">
        
        {/* Soft Navbar */}
        <header className="px-8 py-8 lg:px-14 flex justify-between items-center z-50 shrink-0">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)} 
              className="w-12 h-12 flex items-center justify-center bg-white rounded-2xl text-slate-400 border border-slate-100 shadow-sm transition-all hover:text-[#B8860B] active:scale-90"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16"></path></svg>
            </button>
            <Logo size="md" showText={true} variant="ornate" />
          </div>

          <div className="flex items-center gap-5">
            <div className="hidden md:flex items-center gap-3 bg-white/60 backdrop-blur-md px-5 py-3 rounded-[1.5rem] border border-white shadow-sm ring-1 ring-slate-100">
              <span className="text-[9px] font-black text-[#B8860B] uppercase tracking-widest">Leadership Persona</span>
              <select 
                value={persona} 
                onChange={(e) => setPersona(e.target.value as LeadershipPersona)} 
                className="bg-transparent border-none text-[11px] font-black focus:ring-0 cursor-pointer text-slate-800"
              >
                {PERSONAS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
        </header>

        {/* Floating Dynamic Content Switcher */}
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 floating-pill">
          <nav className="flex bg-white/80 backdrop-blur-2xl rounded-full p-2 border border-white/50 shadow-2xl ring-1 ring-slate-100">
            {(['input', 'report', 'chat'] as const).map(tab => (
              <button 
                key={tab} 
                onClick={() => setActiveTab(tab)} 
                className={`px-8 py-3.5 rounded-full text-[10px] font-black transition-all uppercase tracking-widest ${activeTab === tab ? 'bg-slate-900 text-white shadow-xl translate-y-[-2px]' : 'text-slate-400 hover:text-slate-600'}`}
              >
                {t[tab]}
              </button>
            ))}
          </nav>
        </div>

        {/* The Content Stage */}
        <main className="flex-1 overflow-y-auto px-6 lg:px-14 pb-48 custom-scrollbar scroll-smooth">
          {!activeId ? (
            <div className="h-full flex items-center justify-center text-center">
              <div className="max-w-lg animate-in fade-in slide-in-from-bottom-10 duration-1000">
                 <div className="mb-10 flex justify-center">
                   <Logo size="xl" variant="ornate" className="animate-pulse duration-[4000ms]" />
                 </div>
                 <h2 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tighter mb-6 leading-none">The Future of <br/>Leadership is <span className="text-[#B8860B]">Guided Insight.</span></h2>
                 <p className="text-slate-400 font-medium text-lg mb-12 px-10">Capture high-dimensional performance data and transform it into empathetic, actionable leadership strategies with My Saarathi.</p>
                 <button onClick={createNewEmployee} className="px-12 py-6 bg-slate-900 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-[#B8860B]/10 hover:bg-[#B8860B] transition-all hover:scale-105 active:scale-95">Initiate Coaching Cycle</button>
              </div>
            </div>
          ) : (
            <div className="max-w-6xl mx-auto animate-in slide-in-from-bottom-8 duration-700">
              
              {activeTab === 'input' && (
                <div className="space-y-12">
                   <div className="space-y-2">
                    <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Engagement Diagnostic</h2>
                    <p className="text-slate-400 font-medium">Define the trajectory for {data.employeeName || 'your colleague'}.</p>
                  </div>

                  <section className="glass-surface rounded-[3.5rem] p-10 lg:p-20 shadow-2xl shadow-indigo-50/40">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-[#B8860B] uppercase tracking-widest px-1">Colleague Identity</label>
                        <input 
                          className="w-full bg-white border border-slate-100 rounded-[1.75rem] px-10 py-7 text-sm font-bold text-slate-800 focus:ring-4 focus:ring-[#B8860B]/5 focus:border-[#B8860B]/20 transition-all shadow-sm" 
                          value={data.employeeName} 
                          onChange={e => setData({...data, employeeName: e.target.value})} 
                          placeholder="Legal/Common Name" 
                        />
                      </div>
                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-[#B8860B] uppercase tracking-widest px-1">Strategic Function</label>
                        <input 
                          className="w-full bg-white border border-slate-100 rounded-[1.75rem] px-10 py-7 text-sm font-bold text-slate-800 focus:ring-4 focus:ring-[#B8860B]/5 focus:border-[#B8860B]/20 transition-all shadow-sm" 
                          value={data.role} 
                          onChange={e => setData({...data, role: e.target.value})} 
                          placeholder="e.g. Design Lead" 
                        />
                      </div>
                    </div>

                    <div className="mb-16 space-y-6">
                      <label className="text-[10px] font-black text-[#B8860B] uppercase tracking-widest px-1">Behavioral Sentiment (The Pulse)</label>
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="relative">
                          <select 
                            value={data.sentiment} 
                            onChange={(e) => setData({...data, sentiment: e.target.value as SentimentType})}
                            className="w-full bg-white border border-slate-100 rounded-[1.75rem] px-10 py-7 text-sm font-bold text-slate-800 appearance-none focus:ring-4 focus:ring-[#B8860B]/5 cursor-pointer shadow-sm"
                          >
                            {(Object.keys(SENTIMENT_MAP) as SentimentType[]).map(s => (
                              <option key={s} value={s}>{SENTIMENT_MAP[s].emoji} {s}</option>
                            ))}
                          </select>
                          <div className="absolute right-10 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300">
                             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"></path></svg>
                          </div>
                        </div>
                        <div className="lg:col-span-2">
                           <input 
                            className="w-full bg-white border border-slate-100 rounded-[1.75rem] px-10 py-7 text-sm font-bold text-slate-600 focus:ring-4 focus:ring-[#B8860B]/5 transition-all shadow-sm"
                            placeholder="Briefly describe the trigger for this mood..."
                            value={data.sentimentNotes}
                            onChange={e => setData({...data, sentimentNotes: e.target.value})}
                           />
                        </div>
                      </div>
                    </div>

                    {/* KPIs */}
                    <div className="mb-16">
                      <div className="flex justify-between items-center mb-8 px-2">
                        <label className="text-[10px] font-black text-[#B8860B] uppercase tracking-widest">Performance Quantifiables</label>
                        <button onClick={() => setData({...data, metrics: [...data.metrics, { label: 'New Metric', value: 0, target: 100, unit: '%' }]})} className="px-5 py-2.5 bg-slate-50 text-[#B8860B] rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-colors">Add Variable</button>
                      </div>
                      <div className="grid grid-cols-1 gap-6">
                        {data.metrics.map((m, idx) => (
                          <div key={idx} className="bg-white/50 border border-white rounded-[2rem] p-8 flex flex-wrap lg:flex-nowrap items-center gap-10 group hover:shadow-xl transition-all shadow-sm ring-1 ring-slate-100/50">
                            <div className="flex-1 min-w-[200px]">
                              <input className="w-full bg-transparent border-none p-0 text-sm font-black text-slate-800 focus:ring-0 placeholder:text-slate-300" value={m.label} onChange={e => updateMetric(idx, 'label', e.target.value)} placeholder="KPI Label" />
                            </div>
                            <div className="flex items-center gap-6">
                               <div className="text-center">
                                 <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2">Value</span>
                                 <input type="number" className="w-20 bg-slate-50 border border-slate-100 rounded-xl px-2 py-2 text-center text-xs font-bold" value={m.value} onChange={e => updateMetric(idx, 'value', Number(e.target.value))} />
                               </div>
                               <div className="text-center">
                                 <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2">Target</span>
                                 <input type="number" className="w-20 bg-slate-50 border border-slate-100 rounded-xl px-2 py-2 text-center text-xs font-bold" value={m.target} onChange={e => updateMetric(idx, 'target', Number(e.target.value))} />
                               </div>
                               <div className="text-center">
                                 <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2">Unit</span>
                                 <input className="w-14 bg-slate-50 border border-slate-100 rounded-xl px-2 py-2 text-center text-xs font-bold" value={m.unit} onChange={e => updateMetric(idx, 'unit', e.target.value)} />
                               </div>
                            </div>
                            <button onClick={() => {
                              const next = [...data.metrics];
                              next.splice(idx, 1);
                              setData({...data, metrics: next});
                            }} className="opacity-0 group-hover:opacity-100 p-3 text-slate-300 hover:text-rose-500 transition-all">
                               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4 mb-16">
                      <label className="text-[10px] font-black text-[#B8860B] uppercase tracking-widest px-1">Executive Context</label>
                      <textarea 
                        className="w-full bg-white border border-slate-100 rounded-[2.5rem] p-10 text-sm min-h-[180px] focus:ring-4 focus:ring-[#B8860B]/5 transition-all leading-relaxed font-bold text-slate-600 shadow-sm" 
                        placeholder="Detail observations, specific behaviors, or career alignment notes..." 
                        value={data.context} 
                        onChange={e => setData({...data, context: e.target.value})} 
                      />
                    </div>

                    <button 
                      onClick={handleGenerateReport} 
                      disabled={isLoading || !data.employeeName} 
                      className="w-full py-8 bg-slate-900 text-white rounded-[2.5rem] font-black text-xs uppercase tracking-[0.4em] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] transition-all active:scale-[0.98] disabled:opacity-50 hover:bg-[#B8860B] flex items-center justify-center gap-6 group"
                    >
                      {isLoading ? (
                        <>
                          <div className="w-6 h-6 border-4 border-white/20 border-t-white animate-spin rounded-full"></div>
                          <span className="animate-pulse tracking-widest">Synthesizing Strategy...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                          {t.analyze}
                        </>
                      )}
                    </button>
                  </section>
                </div>
              )}

              {activeTab === 'report' && activeReport && (
                <div className="space-y-16 pb-40">
                  <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
                    <div className="space-y-3">
                       <div className="flex items-center gap-3">
                         <div className="w-4 h-4 rounded-full bg-[#B8860B] aesthetic-glow"></div>
                         <span className="text-[10px] font-black text-[#B8860B] uppercase tracking-[0.4em]">Strategic Synthesis Active</span>
                       </div>
                      <h2 className="text-5xl lg:text-7xl font-black text-slate-900 tracking-tighter leading-none">{activeReport.metricSnapshot?.employeeName}</h2>
                      <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-sm">{activeReport.metricSnapshot?.role}</p>
                    </div>
                    
                    <div className="flex items-center gap-3 bg-white/40 p-2 rounded-[2rem] border border-white">
                      {activeEmployee?.reports.map((r, i) => (
                        <button 
                          key={r.id} 
                          onClick={() => setSelectedReportIndex(i)} 
                          className={`whitespace-nowrap px-6 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${selectedReportIndex === i ? 'bg-[#B8860B] text-white shadow-xl translate-y-[-2px]' : 'bg-transparent text-slate-400 hover:text-slate-600'}`}
                        >
                          {new Date(r.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </button>
                      ))}
                    </div>
                  </header>

                  <div className="grid grid-cols-1 xl:grid-cols-12 gap-12 items-start">
                    <div className="xl:col-span-8 space-y-12">
                      {/* Perspective Card */}
                      <section className="bg-slate-900 rounded-[4rem] p-12 lg:p-20 text-white relative overflow-hidden shadow-3xl shadow-[#B8860B]/20 group">
                        <div className="absolute top-0 right-0 p-20 opacity-10 rotate-12 transition-transform duration-1000 group-hover:scale-125">
                           <Logo size="xl" variant="ornate" className="opacity-40" />
                        </div>
                        <h3 className="text-[10px] font-black text-[#B8860B] uppercase tracking-[0.4em] mb-10 flex items-center gap-3">
                          <div className="w-2.5 h-2.5 rounded-full bg-[#B8860B] animate-pulse"></div>
                          The Guided Lens
                        </h3>
                        <p className="text-4xl lg:text-5xl font-black leading-[1.1] tracking-tight relative z-10">"{activeReport.sentimentInsight}"</p>
                      </section>

                      {/* Deep Analysis Surfaces */}
                      <div className="glass-surface rounded-[4rem] p-12 lg:p-20 space-y-20">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
                          <div className="space-y-6">
                            <h4 className="text-[10px] font-black text-[#B8860B] uppercase tracking-[0.3em]">Operational Gaps</h4>
                            <p className="text-lg font-bold text-slate-700 leading-relaxed italic">{activeReport.overallAssessment}</p>
                          </div>
                          <div className="space-y-6">
                            <h4 className="text-[10px] font-black text-[#B8860B] uppercase tracking-[0.3em]">Leadership Pivot</h4>
                            <p className="text-lg font-bold text-slate-700 leading-relaxed">{activeReport.performanceGapAnalysis}</p>
                          </div>
                        </div>
                        
                        <div className="pt-20 border-t border-slate-100">
                          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-14 text-center">Quantified Trajectory</h4>
                          <div className="max-w-2xl mx-auto h-[350px]">
                             <MetricChart metrics={activeReport.metricSnapshot?.metrics || []} />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="xl:col-span-4 space-y-12 xl:sticky xl:top-32 transition-all">
                      {/* Resilience Insight */}
                      <div className="bg-[#B8860B]/5 border border-[#B8860B]/10 rounded-[3rem] p-12 flex flex-col items-center text-center">
                         <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[#B8860B] mb-6 shadow-sm">
                           <Logo size="sm" variant="ornate" />
                         </div>
                         <h4 className="text-[9px] font-black text-[#B8860B] uppercase tracking-[0.3em] mb-4">Empathetic Resilience</h4>
                         <p className="text-base font-bold text-slate-700/60 italic leading-relaxed">"{activeReport.empathyNote}"</p>
                      </div>

                      {/* Dialogue Map */}
                      <div className="bg-white border border-slate-100 rounded-[3.5rem] p-12 shadow-2xl shadow-slate-100">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-10 text-center">Dialogue Architecture</h4>
                        <div className="space-y-6">
                          {activeReport.coachingConversationStarters.map((s, i) => (
                            <div key={i} className="group p-8 bg-slate-50/50 border border-slate-100 rounded-[2rem] text-sm font-bold text-slate-600 italic hover:border-[#B8860B] hover:bg-white transition-all duration-500">
                               "{s}"
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-10">
                    <ActionPlan actions={activeReport.actionPlan} n8nPayload={activeReport.n8nPayload} />
                  </div>
                </div>
              )}

              {activeTab === 'chat' && (
                <div className="bg-white rounded-[4rem] h-[80vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden ring-1 ring-slate-100">
                  <div className="bg-slate-900 p-12 text-white flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-8">
                      <div className="w-14 h-14 rounded-[1.5rem] bg-[#B8860B] flex items-center justify-center font-black text-white text-2xl shadow-2xl shadow-[#B8860B]/20">{persona.charAt(0)}</div>
                      <div>
                        <h3 className="font-black text-xl tracking-tight">Executive Advisory Stream</h3>
                        <p className="text-[10px] font-black text-[#B8860B] uppercase tracking-[0.4em] mt-1">{persona} Mode Active</p>
                      </div>
                    </div>
                    <button className="text-xs font-black uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity">Reset Session</button>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-12 space-y-10 bg-slate-50/10 custom-scrollbar">
                    {messages.length === 0 && (
                      <div className="h-full flex flex-col items-center justify-center text-center opacity-20">
                        <Logo size="xl" variant="ornate" className="mb-8 opacity-20 grayscale" />
                        <p className="font-black uppercase tracking-[0.5em] text-[10px]">Awaiting Advisory Probe</p>
                      </div>
                    )}
                    {messages.map((m, i) => (
                      <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-4`}>
                        <div className={`max-w-[75%] p-10 rounded-[3rem] text-sm leading-relaxed font-bold shadow-sm ${m.role === 'user' ? 'bg-slate-900 text-white rounded-tr-none' : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none ring-1 ring-slate-50'}`}>
                          {m.text}
                        </div>
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex justify-start">
                        <div className="bg-white border border-slate-100 p-8 rounded-[2rem] flex gap-3 shadow-sm">
                          <div className="w-2 h-2 bg-[#B8860B] rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-[#B8860B] rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                          <div className="w-2 h-2 bg-[#B8860B] rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="p-10 bg-white border-t border-slate-100 flex gap-6">
                    <input 
                      className="flex-1 bg-slate-50/50 border-2 border-slate-100 rounded-[2.5rem] px-10 py-7 text-sm font-bold text-slate-700 outline-none focus:border-[#B8860B]/20 transition-all placeholder:text-slate-300" 
                      placeholder="Discuss tactical maneuvers or alignment..." 
                      value={inputValue} 
                      onChange={e => setInputValue(e.target.value)} 
                      onKeyDown={e => e.key === 'Enter' && (async () => {
                        if (!inputValue.trim() || isLoading) return;
                        const msg = inputValue;
                        setInputValue('');
                        setMessages(prev => [...prev, { role: 'user', text: msg, timestamp: new Date() }]);
                        setIsLoading(true);
                        try {
                          const res = await gemini.chatWithLeader([], msg, persona, language);
                          setMessages(prev => [...prev, { role: 'model', text: res, timestamp: new Date() }]);
                        } catch (err) {
                          setMessages(prev => [...prev, { role: 'model', text: "Cognitive connection failed.", timestamp: new Date() }]);
                        }
                        setIsLoading(false);
                      })()} 
                    />
                    <button 
                      onClick={async () => {
                        if (!inputValue.trim() || isLoading) return;
                        const msg = inputValue;
                        setInputValue('');
                        setMessages(prev => [...prev, { role: 'user', text: msg, timestamp: new Date() }]);
                        setIsLoading(true);
                        const res = await gemini.chatWithLeader([], msg, persona, language);
                        setMessages(prev => [...prev, { role: 'model', text: res, timestamp: new Date() }]);
                        setIsLoading(false);
                      }} 
                      className="bg-slate-900 text-white w-24 rounded-[2.5rem] flex items-center justify-center shadow-2xl hover:bg-[#B8860B] hover:scale-105 active:scale-90 transition-all"
                    >
                       <svg className="w-7 h-7 rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      <ShareModal isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} data={data} report={activeReport} persona={persona} />
    </div>
  );
};

export default App;
