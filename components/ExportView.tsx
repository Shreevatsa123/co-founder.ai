
import React from 'react';
import { Project } from '../types';
import { Icons } from './Icons';
import { DynamicChart } from './Visualizations';

interface ExportViewProps {
  project: Project;
  onDownload?: () => void;
}

export const ExportView: React.FC<ExportViewProps> = ({ project, onDownload }) => {
  const { blueprint: data } = project;

  return (
    <div className="bg-white p-8 text-slate-900 print:text-black max-w-4xl mx-auto print:p-0 font-sans" id="print-area">
      {/* 1. DOCUMENT HEADER */}
      <header className="border-b-4 border-slate-900 print:border-black pb-6 mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter mb-1">{data.title}</h1>
          <p className="text-indigo-600 print:text-black font-bold text-sm uppercase tracking-widest">Co-Founder Blueprint</p>
        </div>
        <div className="text-right text-[10px] font-bold text-slate-400 print:text-black uppercase tracking-widest">
          {new Date().toLocaleDateString()}
        </div>
      </header>

      {/* 2. PROJECT SUMMARY */}
      <section className="mb-10">
        <h2 className="text-xs font-black text-slate-400 print:text-black/60 uppercase tracking-[0.3em] mb-4">Project Summary</h2>
        <p className="text-lg leading-relaxed text-slate-800 print:text-black font-medium">
          {data.summary}
        </p>
      </section>

      {/* 3. SCOPE & FEATURES */}
      <section className="mb-10">
        <h2 className="text-xs font-black text-slate-400 print:text-black/60 uppercase tracking-[0.3em] mb-6 border-b border-slate-100 print:border-black/20 pb-2">01. Scope & MVP Features</h2>
        <div className="grid grid-cols-2 gap-8">
          <div className="bg-slate-50 print:bg-transparent p-6 rounded-2xl border border-slate-100 print:border-black/30">
            <h3 className="text-xs font-black text-emerald-600 print:text-black uppercase mb-4">Must Have (Core)</h3>
            <ul className="space-y-3">
              {data.scope.coreFeatures.map((f, i) => (
                <li key={i} className="text-sm font-bold text-slate-700 print:text-black flex gap-3">
                  <span className="text-emerald-500 print:text-black">✓</span> {f}
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-6">
            <div>
              <h3 className="text-xs font-black text-amber-600 print:text-black uppercase mb-3">Nice to Have (v2.0)</h3>
              <ul className="space-y-2">
                {data.scope.optionalFeatures.map((f, i) => (
                  <li key={i} className="text-xs text-slate-600 print:text-black/80 flex gap-2">
                    <span className="text-amber-400 print:text-black font-bold">+</span> {f}
                  </li>
                ))}
              </ul>
            </div>
            <div className="pt-4 border-t border-slate-100 print:border-black/10">
              <h3 className="text-xs font-black text-slate-400 print:text-black/60 uppercase mb-2">Out of Scope</h3>
              <p className="text-[10px] text-slate-400 print:text-black/50 italic mb-2">Features explicitly excluded from initial build:</p>
              <div className="flex flex-wrap gap-2">
                {data.scope.outOfScope.map((f, i) => (
                  <span key={i} className="text-[10px] bg-slate-100 print:bg-transparent print:border print:border-black/20 px-2 py-1 rounded line-through text-slate-400 print:text-black/40">{f}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. TECH STACK & CONCEPTS */}
      <section className="mb-10 page-break-before pt-4">
        <h2 className="text-xs font-black text-slate-400 print:text-black/60 uppercase tracking-[0.3em] mb-6 border-b border-slate-100 print:border-black/20 pb-2">02. Technical Definition</h2>
        <div className="grid grid-cols-2 gap-12">
          <div>
            <h3 className="text-sm font-bold text-slate-900 print:text-black mb-4 uppercase">Tech Stack</h3>
            <div className="space-y-4">
              {data.techStack.map((stack, i) => (
                <div key={i}>
                  <div className="text-[10px] font-black text-indigo-500 print:text-black uppercase">{stack.category}</div>
                  <div className="text-sm font-bold text-slate-800 print:text-black">{stack.tools.join(', ')}</div>
                  <p className="text-[10px] text-slate-400 print:text-black/60 italic mt-0.5">{stack.reason}</p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 print:text-black mb-4 uppercase">Core Concepts</h3>
            <div className="space-y-4">
              {data.coreConcepts.map((concept, i) => (
                <div key={i} className="border-l-2 border-slate-200 print:border-black/20 pl-4">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold print:text-black">{concept.name}</span>
                    <span className="text-[8px] font-black uppercase text-slate-400 print:text-black/50">{concept.complexity}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 print:text-black/80 leading-relaxed">{concept.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      
      {/* 5. STRATEGY, RISKS & LIABILITIES */}
      <section className="mb-10 page-break-before pt-4">
        <h2 className="text-xs font-black text-slate-400 print:text-black/60 uppercase tracking-[0.3em] mb-6 border-b border-slate-100 print:border-black/20 pb-2">03. Strategic Deep Dive & Projections</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div>
              <h3 className="text-sm font-bold text-slate-900 print:text-black mb-4 uppercase flex items-center gap-2">
                 <Icons.Shield className="w-4 h-4 text-rose-600" /> Risks & Liabilities
              </h3>
              <div className="space-y-3">
                 {data.risksAndLiabilities.map((risk, i) => (
                   <div key={i} className="bg-rose-50 print:bg-transparent p-3 rounded-lg border border-rose-100 print:border-black/20">
                      <p className="text-xs text-rose-900 print:text-black font-medium leading-relaxed">
                        • {risk}
                      </p>
                   </div>
                 ))}
              </div>
           </div>

           <div>
              <h3 className="text-sm font-bold text-slate-900 print:text-black mb-4 uppercase flex items-center gap-2">
                 <Icons.Trending className="w-4 h-4 text-emerald-600" /> Data Analysis (EDA)
              </h3>
              <div className="space-y-6">
                 {data.strategicInsights?.slice(0, 3).map((insight, i) => (
                    <div key={i} className="border border-slate-200 rounded-lg p-3">
                       <h4 className="text-xs font-bold text-slate-800 print:text-black uppercase mb-2">{insight.title}</h4>
                       {/* Render actual chart component */}
                       <div className="scale-90 origin-top-left">
                          <DynamicChart metric={insight} />
                       </div>
                       <p className="text-[9px] text-slate-500 print:text-black/70 mt-2 italic">{insight.summary}</p>
                    </div>
                 ))}
              </div>
           </div>
        </div>
      </section>

      {/* 6. IMPLEMENTATION WORKFLOW (Roadmap) - SPEC SHEET STYLE */}
      <section className="mb-10 page-break-before pt-4">
        <h2 className="text-xs font-black text-slate-400 print:text-black/60 uppercase tracking-[0.3em] mb-6 border-b border-slate-100 print:border-black/20 pb-2">04. Technical Implementation Spec</h2>
        <p className="text-xs text-slate-500 mb-6 italic">Engineering task list for system construction.</p>
        
        <div className="border-t-2 border-slate-900 print:border-black">
          {data.implementationWorkflow.nodes.map((node, i) => (
             <div key={i} className="grid grid-cols-12 border-b border-slate-200 print:border-black/20 py-4 gap-4 break-inside-avoid">
               {/* ID & Type */}
               <div className="col-span-1 flex flex-col items-center pt-1">
                 <span className="text-lg font-black text-slate-300 print:text-black/30">{(i + 1).toString().padStart(2, '0')}</span>
               </div>
               
               {/* Title & Desc */}
               <div className="col-span-4">
                 <h3 className="text-sm font-bold text-slate-900 print:text-black uppercase leading-tight mb-1">{node.label}</h3>
                 <span className="text-[9px] font-mono bg-slate-100 text-slate-500 px-1 rounded uppercase">{node.type}</span>
                 <p className="text-[10px] text-slate-600 print:text-black/70 mt-2 leading-relaxed">{node.details}</p>
               </div>

               {/* Specs */}
               <div className="col-span-7 grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Technical Spec</h4>
                    <p className="text-[10px] text-slate-800 font-medium leading-snug">{node.technicalDescription || "Standard implementation."}</p>
                    
                    <h4 className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-3 mb-1">Search Terms</h4>
                    <p className="text-[9px] text-indigo-600 font-mono leading-snug">
                       {node.searchQueries?.join(', ')}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Execution Steps</h4>
                    <ul className="list-decimal list-inside space-y-0.5">
                       {node.executionSteps?.map((step, k) => (
                         <li key={k} className="text-[10px] text-slate-700 leading-snug pl-1 -indent-1 ml-1">{step}</li>
                       ))}
                    </ul>
                  </div>
               </div>
             </div>
          ))}
        </div>
      </section>

      {/* 7. RECOMMENDED RESOURCES */}
      <section className="mb-10">
        <h2 className="text-xs font-black text-slate-400 print:text-black/60 uppercase tracking-[0.3em] mb-6 border-b border-slate-100 print:border-black/20 pb-2">05. Key Learning & Resources</h2>
        <div className="grid grid-cols-2 gap-4">
          {data.recommendedResources.map((res, i) => (
            <div key={i} className="flex flex-col gap-1 mb-2 break-inside-avoid">
               <a 
                   href={res.url} 
                   target="_blank" 
                   rel="noopener noreferrer" 
                   className="text-xs font-bold text-indigo-700 hover:underline print:text-black"
                >
                  {res.title} ↗
                </a>
                <span className="text-[9px] text-slate-400 uppercase font-bold">{res.type}</span>
                <p className="text-[10px] text-slate-500 line-clamp-2">{res.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 8. SYSTEM WORKFLOW - TIMELINE STYLE */}
      <section className="mb-10 page-break-before pt-4">
        <h2 className="text-xs font-black text-slate-400 print:text-black/60 uppercase tracking-[0.3em] mb-6 border-b border-slate-100 print:border-black/20 pb-2">06. System Architecture Flow</h2>
        <p className="text-xs text-slate-500 mb-6 italic">Sequential data flow breakdown.</p>

        <div className="ml-4 pl-4 space-y-0">
           {data.appWorkflow.nodes.map((node, i) => (
             <div key={i} className="relative break-inside-avoid flex gap-6 pb-8 last:pb-0 group">
                {/* Timeline Line */}
                {i !== data.appWorkflow.nodes.length - 1 && (
                   <div className="absolute left-[9px] top-6 bottom-0 w-0.5 bg-slate-200 print:bg-black/20"></div>
                )}
                
                {/* Timeline Dot */}
                <div className="relative z-10 w-5 h-5 rounded-full bg-white border-4 border-slate-900 print:border-black flex-shrink-0 mt-1"></div>
                
                <div>
                   <h3 className="text-sm font-bold text-slate-900 print:text-black flex items-center gap-2">
                      <span className="font-mono text-slate-400 mr-1">{i + 1}.</span> {node.label}
                      <span className="text-[8px] font-normal text-slate-500 uppercase bg-slate-100 border border-slate-200 px-1.5 rounded">{node.type}</span>
                   </h3>
                   <p className="text-xs text-slate-600 print:text-black/80 mt-1 leading-relaxed max-w-prose bg-slate-50 print:bg-transparent p-2 rounded border border-slate-100 print:border-none">
                      {node.details}
                   </p>
                </div>
             </div>
           ))}
        </div>
      </section>

      <footer className="mt-20 pt-8 border-t border-slate-100 print:border-black/20 flex flex-col items-center justify-center gap-6 text-slate-400 print:text-black/50">
        <div className="flex items-center gap-2">
            <p className="text-[10px] font-black uppercase tracking-widest italic">Confidential Project Blueprint</p>
            <span className="text-xs">•</span>
            <p className="text-[10px] font-bold uppercase tracking-widest">Copyright © ConceptForge</p>
        </div>
        
        {onDownload && (
            <button 
                onClick={onDownload}
                className="no-print flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-full font-bold text-sm hover:scale-105 transition-transform"
            >
                <Icons.Download className="w-4 h-4" />
                Download PDF
            </button>
        )}
      </footer>
    </div>
  );
};
