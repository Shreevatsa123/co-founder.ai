
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

// --- Dynamic Chart for Strategic Insights (EDA Style) ---
export const DynamicChart: React.FC<{ metric: DomainMetric }> = ({ metric }) => {
  const colors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  if (metric.type === 'growth_prediction') {
    // A chart showing historical line solid and predictive line dotted
    const height = 180;
    const width = 400;
    const padding = 25;
    
    // Find max value across actual and projected
    const allValues = metric.data.flatMap(d => [d.value, d.projectedValue || 0]);
    const maxVal = Math.max(...allValues) * 1.1; // 10% headroom

    return (
      <div className="w-full overflow-hidden bg-white border border-slate-200 rounded-lg p-2">
         <div className="text-[10px] text-slate-400 font-bold uppercase mb-2 text-right tracking-widest px-2">Predictive Analysis</div>
         <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
             {/* Grid Lines */}
             {[0.2, 0.4, 0.6, 0.8, 1].map(p => (
                <line key={p} x1={padding} y1={height - padding - (p * (height - 2*padding))} x2={width-padding} y2={height - padding - (p * (height - 2*padding))} stroke="#f1f5f9" strokeWidth="1" />
             ))}

             {/* Actual Data Line */}
             <polyline 
               points={metric.data.map((d, i) => {
                 const x = padding + (i / (metric.data.length - 1)) * (width - 2 * padding);
                 const y = height - padding - (d.value / maxVal) * (height - 2 * padding);
                 return `${x},${y}`;
               }).join(' ')}
               fill="none"
               stroke="#6366f1"
               strokeWidth="2.5"
             />

             {/* Projected Data Line (Dotted) */}
             <polyline 
               points={metric.data.map((d, i) => {
                 const val = d.projectedValue !== undefined ? d.projectedValue : d.value;
                 const x = padding + (i / (metric.data.length - 1)) * (width - 2 * padding);
                 const y = height - padding - (val / maxVal) * (height - 2 * padding);
                 return `${x},${y}`;
               }).join(' ')}
               fill="none"
               stroke="#94a3b8"
               strokeWidth="2"
               strokeDasharray="4,4"
             />
             
             {/* Points */}
             {metric.data.map((d, i) => {
                 const x = padding + (i / (metric.data.length - 1)) * (width - 2 * padding);
                 const y = height - padding - (d.value / maxVal) * (height - 2 * padding);
                 const yProj = d.projectedValue !== undefined ? height - padding - (d.projectedValue / maxVal) * (height - 2 * padding) : y;
                 
                 return (
                   <g key={i}>
                     <circle cx={x} cy={y} r="3" fill="#6366f1" />
                     {d.projectedValue !== undefined && <circle cx={x} cy={yProj} r="3" fill="#94a3b8" />}
                     {/* Label X-Axis */}
                     {i % Math.ceil(metric.data.length / 5) === 0 && (
                        <text x={x} y={height-5} fontSize="9" textAnchor="middle" fill="#64748b">{d.label}</text>
                     )}
                   </g>
                 )
             })}
         </svg>
         <div className="flex justify-center gap-4 mt-2">
            <div className="flex items-center gap-1 text-[10px] text-slate-600"><div className="w-2 h-2 bg-indigo-500 rounded-full"></div> Current Data</div>
            <div className="flex items-center gap-1 text-[10px] text-slate-600"><div className="w-2 h-2 bg-slate-400 rounded-full"></div> Projection</div>
         </div>
      </div>
    )
  }

  if (metric.type === 'heatmap') {
    // Grid based visualization
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
         <div className="text-[10px] text-slate-400 font-bold uppercase mb-3 tracking-widest">Intensity Heatmap</div>
         <div className="grid grid-cols-4 gap-2">
            {metric.data.map((d, i) => {
               // Normalize value 0-100 roughly
               const intensity = Math.min(100, Math.max(10, d.value));
               const opacity = intensity / 100;
               return (
                  <div key={i} className="flex flex-col items-center gap-1 group">
                     <div 
                       className="w-full h-12 rounded bg-indigo-600 transition-all hover:scale-105"
                       style={{ opacity: opacity }}
                       title={`${d.label}: ${d.value}`}
                     ></div>
                     <span className="text-[9px] text-slate-500 font-medium truncate w-full text-center">{d.label}</span>
                  </div>
               )
            })}
         </div>
      </div>
    )
  }

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
     const size = 200;
     const center = size / 2;
     const radius = (size - 40) / 2;
     const angleSlice = (Math.PI * 2) / metric.data.length;
     const maxVal = Math.max(...metric.data.map(d => d.value)) || 1;

     const points = metric.data.map((d, i) => {
        const val = (d.value / maxVal) * radius;
        const x = center + val * Math.cos(i * angleSlice - Math.PI / 2);
        const y = center + val * Math.sin(i * angleSlice - Math.PI / 2);
        return `${x},${y}`;
     }).join(' ');

     return (
       <div className="relative h-64 w-full flex items-center justify-center bg-slate-50 rounded-lg overflow-hidden border border-slate-100">
         <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            {/* Grid Circles */}
            {[0.2, 0.4, 0.6, 0.8, 1].map(r => (
               <circle key={r} cx={center} cy={center} r={radius * r} fill="none" stroke="#e2e8f0" strokeWidth="1" />
            ))}
            {/* Axes */}
            {metric.data.map((_, i) => {
               const x = center + radius * Math.cos(i * angleSlice - Math.PI / 2);
               const y = center + radius * Math.sin(i * angleSlice - Math.PI / 2);
               return <line key={i} x1={center} y1={center} x2={x} y2={y} stroke="#e2e8f0" strokeWidth="1" />;
            })}
            {/* Shape */}
            <polygon points={points} fill="rgba(99, 102, 241, 0.2)" stroke="#6366f1" strokeWidth="2" />
            {/* Labels */}
            {metric.data.map((d, i) => {
               // Push labels out a bit
               const labelRadius = radius + 15; 
               const x = center + labelRadius * Math.cos(i * angleSlice - Math.PI / 2);
               const y = center + labelRadius * Math.sin(i * angleSlice - Math.PI / 2);
               return (
                 <text 
                   key={i} 
                   x={x} 
                   y={y} 
                   textAnchor="middle" 
                   dominantBaseline="middle" 
                   fontSize="9" 
                   fill="#64748b" 
                   fontWeight="bold"
                 >
                   {d.label}
                 </text>
               )
            })}
         </svg>
       </div>
     );
  }

  if (metric.type === 'line') {
     const height = 160;
     const width = 300;
     const padding = 20;
     const maxVal = Math.max(...metric.data.map(d => d.value)) || 1;
     
     const points = metric.data.map((d, i) => {
       const x = padding + (i / (metric.data.length - 1)) * (width - 2 * padding);
       const y = height - padding - (d.value / maxVal) * (height - 2 * padding);
       return `${x},${y}`;
     }).join(' ');

     // Create area path
     const areaPoints = `${padding},${height-padding} ${points} ${width-padding},${height-padding}`;

     return (
       <div className="w-full overflow-hidden flex justify-center bg-slate-50 rounded-lg p-2 border border-slate-100">
         <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
            <defs>
              <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d={`M ${areaPoints} Z`} fill="url(#areaGradient)" stroke="none" />
            <polyline points={points} fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            {metric.data.map((d, i) => {
               const x = padding + (i / (metric.data.length - 1)) * (width - 2 * padding);
               const y = height - padding - (d.value / maxVal) * (height - 2 * padding);
               return <circle key={i} cx={x} cy={y} r="3" fill="#ffffff" stroke="#6366f1" strokeWidth="2" />
            })}
         </svg>
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
