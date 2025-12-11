import React, { useState } from 'react';
import { RevenueData, MarketSegment, AppWorkflow, WorkflowNode } from '../types';
import { Icons } from './Icons';

// --- Revenue Chart ---
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

// --- Market Donut Chart ---
export const MarketDonut: React.FC<{ segments: MarketSegment[] }> = ({ segments }) => {
  // Simple CSS conic gradient for donut chart
  // We need to calculate cumulative percentages
  let cumulative = 0;
  const colors = ['#6366f1', '#a5b4fc', '#e0e7ff', '#4f46e5', '#312e81']; // Indigo shades
  
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
        {/* Inner white circle for Donut effect */}
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

// --- Interactive Workflow Diagram ---
export const WorkflowDiagram: React.FC<{ workflow: AppWorkflow }> = ({ workflow }) => {
  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null);

  // Simple layout logic: Divide nodes into columns based on their index for a left-to-right flow
  // In a real app, we'd use a graph layout library (Dagre, Elk). 
  // Here we'll simulate a 3-column layout.
  
  const columns: WorkflowNode[][] = [[], [], []];
  workflow.nodes.forEach((node, i) => {
    const colIndex = i % 3; // Distribute round-robin
    columns[colIndex].push(node);
  });

  return (
    <div className="flex flex-col md:flex-row gap-6 h-[500px]">
      {/* Diagram Area */}
      <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-6 relative overflow-y-auto overflow-x-auto min-h-[300px]">
        <div className="flex justify-between items-center h-full min-w-[600px] relative">
            {/* Draw basic edges using SVG overlay - Simplified for this demo as straight lines would require exact coordinates */}
            {/* Instead, we use a Flex layout with Arrows between columns */}
            
            {columns.map((colNodes, colIdx) => (
              <div key={colIdx} className="flex flex-col justify-center gap-8 z-10 w-1/3 px-4">
                 {colNodes.map(node => (
                   <button
                     key={node.id}
                     onClick={() => setSelectedNode(node)}
                     className={`
                       relative p-4 rounded-xl border-2 text-left transition-all shadow-sm group
                       ${selectedNode?.id === node.id 
                         ? 'border-indigo-600 bg-indigo-50 ring-2 ring-indigo-200' 
                         : 'border-white bg-white hover:border-indigo-300'
                       }
                     `}
                   >
                     {/* Connector Dots */}
                     {colIdx > 0 && <div className="absolute top-1/2 -left-5 w-2 h-2 bg-slate-300 rounded-full"></div>}
                     {colIdx < 2 && <div className="absolute top-1/2 -right-5 w-2 h-2 bg-slate-300 rounded-full"></div>}

                     <div className="flex items-center gap-2 mb-1">
                        {node.type === 'user' && <Icons.User className="w-3 h-3 text-slate-500" />}
                        {node.type === 'system' && <Icons.Cpu className="w-3 h-3 text-slate-500" />}
                        {node.type === 'data' && <Icons.Book className="w-3 h-3 text-slate-500" />}
                        {node.type === 'action' && <Icons.Zap className="w-3 h-3 text-slate-500" />}
                        <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">{node.type}</span>
                     </div>
                     <h4 className="font-bold text-slate-800 text-sm">{node.label}</h4>
                   </button>
                 ))}
              </div>
            ))}
            
            {/* Background connecting lines visualization (Abstract) */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
               <div className="w-2/3 h-0.5 bg-slate-400"></div>
            </div>
        </div>
      </div>

      {/* Details Panel */}
      <div className="w-full md:w-72 bg-white border border-slate-200 rounded-xl p-5 shadow-sm h-full flex flex-col">
        {selectedNode ? (
          <div className="animate-in slide-in-from-right duration-300">
            <div className="flex items-center gap-2 mb-4 pb-4 border-b border-slate-100">
              <span className={`p-2 rounded-lg ${
                 selectedNode.type === 'user' ? 'bg-indigo-100 text-indigo-700' :
                 selectedNode.type === 'data' ? 'bg-emerald-100 text-emerald-700' :
                 'bg-amber-100 text-amber-700'
              }`}>
                {selectedNode.type === 'user' && <Icons.User className="w-4 h-4" />}
                {selectedNode.type === 'system' && <Icons.Cpu className="w-4 h-4" />}
                {selectedNode.type === 'data' && <Icons.Book className="w-4 h-4" />}
                {selectedNode.type === 'action' && <Icons.Zap className="w-4 h-4" />}
              </span>
              <div>
                <h3 className="font-bold text-slate-900">{selectedNode.label}</h3>
                <span className="text-xs text-slate-500 uppercase">{selectedNode.type} Node</span>
              </div>
            </div>
            
            <div className="prose prose-sm">
              <p className="text-slate-600 leading-relaxed">{selectedNode.details}</p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Connected Flow</h4>
              <div className="space-y-2">
                 {workflow.edges.filter(e => e.from === selectedNode.id).map((edge, i) => (
                   <div key={i} className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 p-2 rounded">
                     <Icons.ArrowRight className="w-3 h-3 text-slate-400" />
                     <span>Triggers: <span className="font-semibold">{workflow.nodes.find(n => n.id === edge.to)?.label || edge.to}</span></span>
                   </div>
                 ))}
                 {workflow.edges.filter(e => e.to === selectedNode.id).map((edge, i) => (
                   <div key={i} className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 p-2 rounded">
                     <Icons.ArrowRight className="w-3 h-3 text-slate-400 rotate-180" />
                     <span>Triggered by: <span className="font-semibold">{workflow.nodes.find(n => n.id === edge.from)?.label || edge.from}</span></span>
                   </div>
                 ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center text-slate-400">
            <Icons.Maximize className="w-8 h-8 mb-2 opacity-20" />
            <p className="text-sm">Select a node in the diagram to view detailed logic and data flow.</p>
          </div>
        )}
      </div>
    </div>
  );
};
