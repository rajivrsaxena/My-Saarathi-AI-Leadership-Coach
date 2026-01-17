
import React, { useMemo, useState } from 'react';
import { 
  ComposedChart, 
  Bar, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  Legend,
  LineChart
} from 'recharts';
import { Metric } from '../types';

interface MetricChartProps {
  metrics: Metric[];
}

const MetricChart: React.FC<MetricChartProps> = ({ metrics }) => {
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  // Snapshot Data: Current performance vs Target
  const snapshotData = useMemo(() => metrics.map(m => ({
    name: m.label,
    value: m.value,
    target: m.target,
    percentage: (m.value / m.target) * 100
  })), [metrics]);

  // Trend Data: Transforming multiple metric histories into a single time-series array
  const { trendData, hasHistory, maxHistoryLen } = useMemo(() => {
    const hasAnyHistory = metrics.some(m => m.history && m.history.length > 0);
    if (!hasAnyHistory) return { trendData: [], hasHistory: false, maxHistoryLen: 0 };

    const maxLen = Math.max(...metrics.map(m => m.history?.length || 0));
    const dataPoints = [];

    for (let i = 0; i <= maxLen; i++) {
      const point: any = { 
        name: i === maxLen ? 'Now' : `T-${maxLen - i}` 
      };
      
      metrics.forEach(m => {
        const history = m.history || [];
        if (i === maxLen) {
          point[m.label] = m.value;
        } else {
          const historyIndex = i - (maxLen - history.length);
          if (historyIndex >= 0 && historyIndex < history.length) {
            point[m.label] = history[historyIndex];
          }
        }
      });
      dataPoints.push(point);
    }

    return { trendData: dataPoints, hasHistory: true, maxHistoryLen: maxLen };
  }, [metrics]);

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#3b82f6', '#ec4899'];

  return (
    <div className="space-y-8">
      {/* Current Status Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Performance Snapshot</h4>
          <span className="text-[10px] text-slate-400 font-medium">Actual vs Target</span>
        </div>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={snapshotData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} tick={{fill: '#94a3b8'}} />
              <YAxis fontSize={10} tickLine={false} axisLine={false} tick={{fill: '#94a3b8'}} />
              <Tooltip 
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
              />
              <Bar dataKey="target" name="Target" fill="#e2e8f0" radius={[4, 4, 0, 0]} barSize={20} opacity={0.4} />
              <Bar dataKey="value" name="Current" radius={[4, 4, 0, 0]} barSize={30}>
                {snapshotData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.percentage >= 100 ? '#10b981' : entry.percentage >= 80 ? '#3b82f6' : '#f59e0b'} 
                  />
                ))}
              </Bar>
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Historical Trend Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Historical Progress</h4>
          {hasHistory && (
            <button 
              onClick={() => setIsHistoryModalOpen(true)}
              className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
              View Detailed History
            </button>
          )}
        </div>
        
        {hasHistory ? (
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 5, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} tick={{fill: '#94a3b8'}} />
                <YAxis fontSize={10} tickLine={false} axisLine={false} tick={{fill: '#94a3b8'}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                {metrics.map((m, idx) => (
                  <Line 
                    key={m.label}
                    type="monotone" 
                    dataKey={m.label} 
                    stroke={COLORS[idx % COLORS.length]} 
                    strokeWidth={2} 
                    dot={{ r: 3, fill: COLORS[idx % COLORS.length], strokeWidth: 1, stroke: '#fff' }}
                    activeDot={{ r: 5 }}
                    connectNulls
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center text-center">
            <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <p className="text-xs font-semibold text-slate-500 mb-1">Historical Trend Unavailable</p>
            <p className="text-[10px] text-slate-400 max-w-[200px]">Historical data is required to visualize performance momentum over time.</p>
          </div>
        )}
      </section>

      {/* History Modal */}
      {isHistoryModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-slate-800">Historical Data Breakdown</h3>
                <p className="text-xs text-slate-500 font-medium">Metric trends relative to current period (Now)</p>
              </div>
              <button onClick={() => setIsHistoryModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 transition-colors bg-slate-50 rounded-xl hover:bg-slate-100">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            <div className="p-6 overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Metric</th>
                    {trendData.map(point => (
                      <th key={point.name} className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">
                        {point.name}
                      </th>
                    ))}
                    <th className="px-4 py-3 text-[10px] font-bold text-indigo-600 uppercase tracking-widest text-center">Target</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {metrics.map((m, idx) => (
                    <tr key={m.label} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-4 text-xs font-bold text-slate-700">{m.label}</td>
                      {trendData.map(point => (
                        <td key={point.name} className="px-4 py-4 text-xs text-slate-600 text-center font-medium">
                          {point[m.label] !== undefined ? `${point[m.label]}${m.unit}` : '-'}
                        </td>
                      ))}
                      <td className="px-4 py-4 text-xs font-bold text-indigo-600 text-center bg-indigo-50/20">
                        {m.target}{m.unit}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button 
                onClick={() => setIsHistoryModalOpen(false)}
                className="px-6 py-2 bg-slate-900 text-white font-bold rounded-xl text-sm hover:bg-slate-800 transition-all shadow-lg"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contextual Note */}
      <div className="mt-4 p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100/50">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
          <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">AI Insight Engine</span>
        </div>
        <p className="text-[11px] text-slate-500 leading-relaxed italic">
          Historical data is normalized. Points labeled T-X represent X periods before the present. This view helps identify cyclical performance dips versus steady growth patterns.
        </p>
      </div>
    </div>
  );
};

export default MetricChart;
