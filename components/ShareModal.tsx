
import React, { useState, useEffect } from 'react';
import { SharePermission, PerformanceData, CoachingReport, LeadershipPersona } from '../types';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: PerformanceData;
  report: CoachingReport | null;
  persona: LeadershipPersona;
}

const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, data, report, persona }) => {
  const [permission, setPermission] = useState<SharePermission>('view');
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  useEffect(() => {
    if (isOpen) {
      const state = { data, report, persona, permission };
      const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(state))));
      const url = `${window.location.origin}${window.location.pathname}#share=${encoded}`;
      setShareUrl(url);
    }
  }, [isOpen, permission, data, report, persona]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const shareText = `Hi, I've generated a leadership coaching report for ${data.employeeName} using Saarathi AI. You can view the full interactive insights and action plan here: ${shareUrl}`;
  const encodedText = encodeURIComponent(shareText);
  const encodedSubject = encodeURIComponent(`Coaching Report: ${data.employeeName}`);

  const handleSystemShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Coaching Report: ${data.employeeName}`,
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      handleCopy();
    }
  };

  const shareLinks = {
    whatsapp: `https://api.whatsapp.com/send?text=${encodedText}`,
    gmail: `mailto:?subject=${encodedSubject}&body=${encodedText}`,
    teams: `https://teams.microsoft.com/share?href=${encodeURIComponent(shareUrl)}&msgText=${encodedText}`,
    slack: `https://slack.com/share?url=${encodeURIComponent(shareUrl)}&text=${encodedText}`
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[92vh] border border-white/20">
        
        {/* Header */}
        <div className="p-8 border-b border-slate-100 flex justify-between items-center shrink-0 bg-slate-50/50">
          <div>
            <h3 className="text-2xl font-bold text-slate-800">Share & Export</h3>
            <p className="text-sm text-slate-500 font-medium">Reporting for {data.employeeName}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-full text-slate-400 hover:text-slate-600 transition-all shadow-sm border border-transparent hover:border-slate-200">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <div className="p-8 space-y-10 overflow-y-auto custom-scrollbar">
          
          {/* Permission Level Section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Access Permissions</label>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${permission === 'edit' ? 'bg-indigo-100 text-indigo-600' : 'bg-emerald-100 text-emerald-600'}`}>
                {permission === 'edit' ? 'Full Edit Access' : 'Read-Only Access'}
              </span>
            </div>
            <div className="grid grid-cols-2 bg-slate-100 p-1.5 rounded-2xl gap-2">
              <button 
                onClick={() => setPermission('view')}
                className={`flex flex-col items-center py-3 px-4 rounded-xl transition-all ${permission === 'view' ? 'bg-white text-emerald-700 shadow-md scale-[1.02]' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <span className="text-sm font-bold">View-only</span>
                <span className="text-[10px] opacity-70 font-medium">Safe for external sharing</span>
              </button>
              <button 
                onClick={() => setPermission('edit')}
                className={`flex flex-col items-center py-3 px-4 rounded-xl transition-all ${permission === 'edit' ? 'bg-white text-indigo-700 shadow-md scale-[1.02]' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <span className="text-sm font-bold">Full Access</span>
                <span className="text-[10px] opacity-70 font-medium">Allow collaborative editing</span>
              </button>
            </div>
          </div>

          {/* Quick Share Grid */}
          <div className="space-y-4">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Quick Actions</label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {/* WhatsApp */}
              <a href={shareLinks.whatsapp} target="_blank" rel="noopener noreferrer" 
                className="group flex flex-col items-center gap-2 p-3 bg-white border border-slate-100 rounded-2xl hover:border-emerald-200 hover:bg-emerald-50/30 transition-all active:scale-95"
              >
                <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 .018 5.396.015 12.03a11.948 11.948 0 001.605 6.057L0 24l6.105-1.602a11.834 11.834 0 005.937 1.598h.005c6.637 0 12.032-5.395 12.035-12.03a11.824 11.824 0 00-3.417-8.415z"/></svg>
                </div>
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tight">WhatsApp</span>
              </a>

              {/* Teams */}
              <a href={shareLinks.teams} target="_blank" rel="noopener noreferrer" 
                className="group flex flex-col items-center gap-2 p-3 bg-white border border-slate-100 rounded-2xl hover:border-indigo-200 hover:bg-indigo-50/30 transition-all active:scale-95"
              >
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.42 12.18c0 .12-.01.25-.01.37 0 2.22 1.8 4.02 4.02 4.02s4.02-1.8 4.02-4.02-1.8-4.02-4.02-4.02c-.12 0-.24.01-.36.02-.12-.34-.18-.7-.18-1.07 0-1.74 1.41-3.15 3.15-3.15s3.15 1.41 3.15 3.15-1.41 3.15-3.15 3.15c-.12 0-.25-.01-.37-.02v.01c0 2.23-1.81 4.04-4.04 4.04s-4.04-1.81-4.04-4.04c0-.12.01-.25.02-.37-.34.12-.7.18-1.07.18-1.74 0-3.15-1.41-3.15-3.15s1.41-3.15 3.15-3.15c1.74 0 3.15 1.41 3.15 3.15 0 .37-.06.73-.18 1.07zm-7.64 3.01c-.13-.01-.26-.01-.4-.01-2.43 0-4.38 1.95-4.38 4.38S1.95 23.94 4.38 23.94s4.38-1.95 4.38-4.38c0-.14 0-.27-.01-.4-.36.13-.75.21-1.15.21-1.88 0-3.41-1.53-3.41-3.41s1.53-3.41 3.41-3.41c.4 0 .79.08 1.15.21zM24 19.56c0 2.44-1.97 4.41-4.41 4.41s-4.41-1.97-4.41-4.41 1.97-4.41 4.41-4.41 4.41 1.97 4.41 4.41z"/></svg>
                </div>
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tight">Teams</span>
              </a>

              {/* Email */}
              <a href={shareLinks.gmail} target="_blank" rel="noopener noreferrer" 
                className="group flex flex-col items-center gap-2 p-3 bg-white border border-slate-100 rounded-2xl hover:border-red-200 hover:bg-red-50/30 transition-all active:scale-95"
              >
                <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-red-500/30">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                </div>
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tight">Email</span>
              </a>

              {/* Slack */}
              <a href={shareLinks.slack} target="_blank" rel="noopener noreferrer" 
                className="group flex flex-col items-center gap-2 p-3 bg-white border border-slate-100 rounded-2xl hover:border-purple-200 hover:bg-purple-50/30 transition-all active:scale-95"
              >
                <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-purple-600/30">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.527 2.527 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.527 2.527 0 0 1 2.521 2.521 2.527 2.527 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.958 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.527 2.527 0 0 1-2.52 2.521h-2.522V8.834zM17.687 8.834a2.527 2.527 0 0 1-2.521 2.521 2.527 2.527 0 0 1-2.521-2.521V2.522A2.528 2.528 0 0 1 15.166 0a2.528 2.528 0 0 1 2.521 2.522v6.312zM15.166 18.958a2.528 2.528 0 0 1 2.521 2.522A2.528 2.528 0 0 1 15.166 24a2.527 2.527 0 0 1-2.521-2.522v-2.52h2.521zM15.166 17.687a2.527 2.527 0 0 1-2.521-2.521 2.527 2.527 0 0 1 2.521-2.521h6.312A2.528 2.528 0 0 1 24 15.166a2.528 2.528 0 0 1-2.52 2.521h-6.314z"/></svg>
                </div>
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tight">Slack</span>
              </a>

              {/* System Share */}
              <button onClick={handleSystemShare} 
                className="group flex flex-col items-center gap-2 p-3 bg-white border border-slate-100 rounded-2xl hover:border-slate-300 hover:bg-slate-50 transition-all active:scale-95"
              >
                <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-lg shadow-slate-900/20">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path></svg>
                </div>
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tight">Share Link</span>
              </button>

              {/* Download PDF Quick Access */}
              <button onClick={handlePrint} 
                className="group flex flex-col items-center gap-2 p-3 bg-white border border-slate-100 rounded-2xl hover:border-red-300 hover:bg-red-50 transition-all active:scale-95"
              >
                <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-red-600/20 group-hover:scale-105 transition-transform">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                </div>
                <span className="text-[9px] font-bold text-red-600 uppercase tracking-tight">Download</span>
              </button>
            </div>
          </div>

          {/* Document & PDF Banner */}
          <div className="space-y-4">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Document Export</label>
            <div className="bg-slate-900 rounded-[1.5rem] overflow-hidden shadow-xl shadow-slate-900/20 group">
              <button 
                onClick={handlePrint}
                className="w-full flex items-center justify-between p-6 text-white hover:bg-slate-800 transition-all active:scale-[0.98]"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center text-red-400 group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
                  </div>
                  <div className="text-left">
                    <span className="block text-base font-bold">Generate PDF Report</span>
                    <span className="block text-[10px] opacity-60 font-bold uppercase tracking-widest mt-0.5">High-Resolution Executive Copy</span>
                  </div>
                </div>
                <svg className="w-6 h-6 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
              </button>
            </div>
          </div>

          {/* Shareable Link Input */}
          <div className="space-y-4">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Collaborative URL</label>
            <div className="relative group">
              <input 
                readOnly
                value={shareUrl}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-5 text-xs text-slate-500 pr-16 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all font-mono"
              />
              <button 
                onClick={handleCopy}
                className={`absolute right-3 top-1/2 -translate-y-1/2 p-3 rounded-xl transition-all ${copied ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'bg-white text-slate-400 hover:text-slate-600 shadow-sm border border-slate-100'}`}
              >
                {copied ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path></svg>
                )}
              </button>
            </div>
            {copied && <p className="text-[10px] text-emerald-600 font-bold animate-pulse text-center uppercase tracking-widest">Link copied to clipboard!</p>}
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-between items-center shrink-0">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Saarathi | Executive Access</p>
          <button 
            onClick={onClose}
            className="px-10 py-4 bg-white text-slate-800 font-bold rounded-2xl text-sm hover:bg-slate-100 border border-slate-200 transition-all shadow-sm active:scale-95"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
