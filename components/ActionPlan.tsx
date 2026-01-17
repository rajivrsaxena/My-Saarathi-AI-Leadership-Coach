
import React from 'react';
import { CoachingAction } from '../types';

interface ActionPlanProps {
  actions: CoachingAction[];
  n8nPayload: string;
}

const ActionPlan: React.FC<ActionPlanProps> = ({ actions, n8nPayload }) => {
  const copyToClipboard = () => {
    navigator.clipboard.writeText(n8nPayload);
    alert('Strategic Payload copied for n8n integration.');
  };

  return (
    <div className="space-y-16">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-10 px-2">
        <div>
          <h3 className="text-4xl font-black text-slate-900 tracking-tighter">Tactical Roadmap</h3>
          <p className="text-slate-400 font-medium">Critical maneuvers for the immediate cycle.</p>
        </div>
        <button 
          onClick={copyToClipboard}
          className="bg-slate-900 text-white font-black py-5 px-10 rounded-[2rem] transition-all shadow-xl hover:-translate-y-1 active:scale-95 flex items-center gap-4 text-[10px] uppercase tracking-widest hover:bg-[#B8860B]"
        >
          <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
          Export to n8n
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {actions.map((action, idx) => (
          <div key={idx} className="bg-white border border-slate-100 p-12 rounded-[3.5rem] shadow-2xl shadow-slate-100 flex flex-col group hover:border-[#B8860B]/30 transition-all duration-700">
            <div className="flex justify-between items-start mb-10">
              <span className="w-12 h-12 rounded-2xl bg-[#B8860B]/10 text-[#B8860B] flex items-center justify-center text-[10px] font-black uppercase tracking-[0.2em] transition-transform group-hover:scale-110">0{idx + 1}</span>
              <div className="px-5 py-2 bg-slate-50 rounded-full border border-slate-100">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{action.deadline}</span>
              </div>
            </div>
            
            <h4 className="text-2xl font-black text-slate-800 mb-8 leading-tight flex-1">{action.task}</h4>
            
            <div className="pt-10 border-t border-slate-50 mt-auto">
              <label className="text-[9px] font-black text-[#B8860B] uppercase tracking-[0.3em] mb-4 block">Enablement Requirement</label>
              <div className="p-6 bg-[#B8860B]/5 border border-[#B8860B]/10 rounded-[1.5rem] text-[13px] font-bold text-slate-700 leading-relaxed italic">
                 {action.supportNeeded}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActionPlan;
