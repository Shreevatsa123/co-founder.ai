
import React from 'react';
import { RevenueData, MarketSegment, DomainMetric } from '../types';
import { Icons } from './Icons';

// --- Revenue Chart (Legacy) ---
export const RevenueChart: React.FC<{ data: RevenueData[] }> = ({ data }) => {
  const maxVal = Math.max(...data.map(d => d.amount));
  
  return (
    <div className="w-full h-48 flex items-end justify-between gap-4 mt-6 px-2">
      {data.map((item, idx) => {
        const heightPercent = (item.amount / maxVal) * 100;
        return (
          <div key={idx} className="flex flex-col items-center flex-1 group relative">
            <div className="w-full flex justify-center mb-2 opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8">
              <span className="text-xs font-bold bg-slate-800 text-white px-2 py-1 rounded">
                {item.unit}{item.amount}
              </span>
            </div>
            <div 
              className="w-full max-w-[40px] bg-indigo-500 rounded-t-md transition-all duration-1000 ease-out hover:bg-indigo-600"
              style={{ height: `${heightPercent}%` }}
            ></div>
            <span className="text-xs text-slate-500 mt-2 font-medium">{item.year}</span>
          </div>
        );
      })}
    </div>
  );
};

// --- Market Donut Chart (Legacy) ---
export const MarketDonut: React.FC<{ segments: MarketSegment[] }> = ({ segments }) => {
  let cumulative = 0;
  const colors = ['#6366f1', '#a5b4fc', '#e0e7ff', '#4f46e5', '#312e81']; 
  
  const gradientParts = segments.map((seg, i) => {
    const start = cumulative;
    cumulative += seg.percentage;
    const color = colors[i % colors.length];
    return `${color} ${start}% ${cumulative}%`;
  });

  const gradientString = `conic-gradient(${gradientParts.join(', ')})`;

  return (
    <div className="flex flex-col md:flex-row items-center gap-8">
      <div className="relative w-40 h-40 flex-shrink-0">
        <div 
          className="w-full h-full rounded-full"
          style={{ background: gradientString }}
        ></div>
        <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center shadow-inner">
           <span className="text-xs font-bold text-slate-400 uppercase">Share</span>
        </div>
      </div>
      <div className="space-y-2 flex-1 w-full">
        {segments.map((seg, i) => (
          <div key={i} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: colors[i % colors.length] }}
              ></div>
              <span className="text-slate-700 font-medium">{seg.segment}</span>
            </div>
            <span className="font-bold text-slate-900">{seg.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Dynamic Chart for Strategic Insights ---
export const DynamicChart: React.FC<{ metric: DomainMetric }> = ({ metric }) => {
  const colors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  if (metric.type === 'stat') {
    return (
      <div className="grid grid-cols-2 gap-4">
        {metric.data.map((item, i) => (
          <div key={i} className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex flex-col items-center justify-center text-center hover:border-indigo-300 transition-colors">
             <span className="text-2xl font-bold text-slate-900">{item.value}</span>
             <span className="text-xs font-medium text-slate-500 uppercase tracking-wide mt-1">{item.label}</span>
          </div>
        ))}
      </div>
    );
  }

  if (metric.type === 'pie') {
     let cumulative = 0;
     const total = metric.data.reduce((acc, curr) => acc + curr.value, 0);
     const gradientParts = metric.data.map((d, i) => {
       const start = cumulative;
       const percentage = (d.value / total) * 100;
       cumulative += percentage;
       return `${colors[i % colors.length]} ${start}% ${cumulative}%`;
     });
     
     return (
       <div className="flex items-center gap-6">
          <div className="relative w-32 h-32 flex-shrink-0">
            <div className="w-full h-full rounded-full" style={{ background: `conic-gradient(${gradientParts.join(', ')})` }}></div>
            <div className="absolute inset-3 bg-white rounded-full shadow-inner flex items-center justify-center">
              <Icons.PieChart className="w-6 h-6 text-slate-300" />
            </div>
          </div>
          <div className="space-y-1 flex-1">
            {metric.data.map((d, i) => (
               <div key={i} className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colors[i % colors.length] }}></div>
                    <span className="text-slate-600 font-medium truncate max-w-[120px]" title={d.label}>{d.label}</span>
                  </div>
                  <span className="font-bold text-slate-900">{d.value}</span>
               </div>
            ))}
          </div>
       </div>
     );
  }

  if (metric.type === 'radar') {
     // Simplified Radar Chart visualization
     const maxVal = Math.max(...metric.data.map(d => d.value));
     return (
       <div className="relative h-48 w-full flex items-center justify-center bg-slate-50 rounded-lg overflow-hidden border border-slate-100">
         <div className="absolute inset-0 flex items-center justify-center opacity-10">
            <div className="w-32 h-32 border border-slate-900 rounded-full"></div>
            <div className="w-20 h-20 border border-slate-900 rounded-full absolute"></div>
            <div className="w-10 h-10 border border-slate-900 rounded-full absolute"></div>
         </div>
         <div className="z-10 w-full px-4 flex justify-around items-end h-32 gap-2">
            {metric.data.map((d, i) => (
               <div key={i} className="flex flex-col items-center gap-1 group w-full">
                  <div className="relative w-2 h-full bg-slate-200 rounded-full overflow-hidden">
                     <div 
                       className="absolute bottom-0 w-full bg-indigo-500 group-hover:bg-indigo-600 transition-all duration-700"
                       style={{ height: `${(d.value / maxVal) * 100}%` }}
                     ></div>
                  </div>
                  <span className="text-[10px] text-slate-500 font-bold truncate max-w-[40px] text-center">{d.label.substring(0,4)}</span>
               </div>
            ))}
         </div>
       </div>
     );
  }

  if (metric.type === 'line') {
     // Simulated Area/Line Chart
     const maxVal = Math.max(...metric.data.map(d => d.value));
     return (
       <div className="h-40 flex items-end justify-between gap-1 pt-4">
          {metric.data.map((d, i) => (
             <div key={i} className="flex-1 flex flex-col items-center group">
                <div className="w-full relative flex items-end h-32 bg-slate-50 rounded-t-sm mx-0.5 overflow-hidden">
                   <div 
                     className="w-full bg-indigo-100 border-t-2 border-indigo-500 group-hover:bg-indigo-200 transition-all duration-500"
                     style={{ height: `${(d.value / maxVal) * 100}%` }}
                   ></div>
                </div>
                <span className="text-[9px] text-slate-400 mt-2 font-bold rotate-0 truncate max-w-full px-1">{d.label}</span>
             </div>
          ))}
       </div>
     );
  }

  // Default Bar
  const maxVal = Math.max(...metric.data.map(d => d.value));
  return (
    <div className="space-y-3 pt-2">
       {metric.data.map((d, i) => (
         <div key={i} className="space-y-1">
            <div className="flex justify-between text-xs font-medium text-slate-600">
               <span>{d.label}</span>
               <span>{d.value}</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
               <div 
                 className="h-full rounded-full transition-all duration-1000"
                 style={{ width: `${(d.value / maxVal) * 100}%`, backgroundColor: colors[i % colors.length] }}
               ></div>
            </div>
         </div>
       ))}
    </div>
  );
};
