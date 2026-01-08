
import React from 'react';
import { Project } from '../types';
import { Icons } from './Icons';

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
        <h2 className="text-xs font-black text-slate-400 print:text-black/60 uppercase tracking-[0.3em] mb-6 border-b border-slate-100 print:border-black/20 pb-2">03. Strategic Deep Dive</h2>
        
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
                 <Icons.Trending className="w-4 h-4 text-emerald-600" /> Growth Strategy
              </h3>
              <div className="space-y-4">
                 {data.strategicInsights?.slice(0, 3).map((insight, i) => (
                    <div key={i} className="border-l-2 border-emerald-500 pl-3">
                       <h4 className="text-xs font-bold text-slate-800 print:text-black uppercase">{insight.title}</h4>
                       <p className="text-[10px] text-slate-500 print:text-black/70 mt-1">{insight.summary}</p>
                    </div>
                 ))}
              </div>
           </div>
        </div>
      </section>

      {/* 6. IMPLEMENTATION WORKFLOW (Roadmap) - TECHNICAL & GRANULAR */}
      <section className="mb-10 page-break-before pt-4">
        <h2 className="text-xs font-black text-slate-400 print:text-black/60 uppercase tracking-[0.3em] mb-6 border-b border-slate-100 print:border-black/20 pb-2">04. Technical Implementation Specification</h2>
        <p className="text-xs text-slate-500 mb-6 italic">Granular engineering roadmap for system construction.</p>
        
        <div className="space-y-8 relative">
          <div className="absolute left-[11px] top-4 bottom-4 w-[2px] bg-slate-100 print:bg-black/10"></div>
          
          {data.implementationWorkflow.nodes.map((node, i) => (
             <div key={i} className="flex gap-6 items-start break-inside-avoid relative">
               
               {/* Marker */}
               <div className="w-6 h-6 rounded-full bg-slate-900 print:bg-black text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5 z-10 shadow-sm border-2 border-white">
                 {i + 1}
               </div>

               {/* Technical Card */}
               <div className="flex-1 bg-white print:bg-transparent rounded-lg border-2 border-slate-100 print:border-black/30 overflow-hidden shadow-sm">
                  {/* Header */}
                  <div className="bg-slate-50 border-b border-slate-100 px-5 py-3 flex justify-between items-center">
                     <h3 className="text-sm font-black text-slate-900 print:text-black uppercase tracking-tight">{node.label}</h3>
                     <span className="text-[9px] uppercase tracking-widest text-slate-400 font-bold bg-white px-2 py-0.5 rounded border border-slate-200">{node.type}</span>
                  </div>
                  
                  <div className="p-5 space-y-6">
                     
                     {/* Technical Description */}
                     <div>
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Technical Specification</h4>
                        <p className="text-xs text-slate-800 font-medium leading-relaxed bg-slate-50 p-3 rounded border border-slate-100">{node.technicalDescription || node.details}</p>
                     </div>

                     {/* Architecture & Benefit Grid */}
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                           <h4 className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mb-1">Architecture Rationale</h4>
                           <p className="text-[10px] text-slate-600 leading-snug">{node.whyNeeded || "Critical infrastructure component."}</p>
                        </div>
                        <div>
                           <h4 className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1">Business Value</h4>
                           <p className="text-[10px] text-slate-600 leading-snug">{node.userBenefit || "Enables core product functionality."}</p>
                        </div>
                     </div>

                     {/* Execution Steps */}
                     {node.executionSteps && node.executionSteps.length > 0 && (
                       <div>
                          <h4 className="text-[10px] font-bold text-slate-900 uppercase tracking-widest mb-2 border-b border-slate-100 pb-1">Execution Strategy</h4>
                          <ul className="space-y-1.5">
                             {node.executionSteps.map((step, idx) => (
                               <li key={idx} className="text-xs text-slate-700 flex gap-2">
                                 <span className="font-mono text-slate-400">{idx + 1}.</span> {step}
                               </li>
                             ))}
                          </ul>
                       </div>
                     )}

                     {/* Search Queries */}
                     {node.searchQueries && node.searchQueries.length > 0 && (
                       <div className="bg-slate-900 rounded p-3">
                          <h4 className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                             <Icons.Search className="w-3 h-3" /> Reference Search Queries
                          </h4>
                          <div className="flex flex-wrap gap-2">
                             {node.searchQueries.map((q, idx) => (
                               <span key={idx} className="text-[10px] font-mono text-indigo-300 bg-slate-800 px-2 py-1 rounded select-all cursor-text">
                                 {q}
                               </span>
                             ))}
                          </div>
                       </div>
                     )}
                  </div>
               </div>
             </div>
          ))}
        </div>
      </section>

      {/* 7. RECOMMENDED RESOURCES */}
      <section className="mb-10">
        <h2 className="text-xs font-black text-slate-400 print:text-black/60 uppercase tracking-[0.3em] mb-6 border-b border-slate-100 print:border-black/20 pb-2">05. Key Learning & Resources</h2>
        <div className="grid grid-cols-1 gap-4">
          {data.recommendedResources.map((res, i) => (
            <div key={i} className="p-4 border-2 border-slate-100 print:border-black/30 rounded-xl flex items-center justify-between group break-inside-avoid hover:border-indigo-100 transition-colors">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-black text-indigo-600 print:text-black uppercase bg-indigo-50 print:bg-transparent px-2 py-0.5 rounded border border-indigo-100 print:border-black/20">{res.type}</span>
                  <h4 className="text-sm font-bold text-slate-900 print:text-black">{res.title}</h4>
                </div>
                <p className="text-xs text-slate-500 print:text-black/70 mb-1">{res.description}</p>
                <a 
                   href={res.url} 
                   target="_blank" 
                   rel="noopener noreferrer" 
                   className="text-[10px] text-blue-600 hover:text-blue-800 print:text-blue-800 font-mono underline break-all block mt-1"
                >
                  {res.url}
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 8. SYSTEM WORKFLOW */}
      <section className="mb-10 page-break-before pt-4">
        <h2 className="text-xs font-black text-slate-400 print:text-black/60 uppercase tracking-[0.3em] mb-6 border-b border-slate-100 print:border-black/20 pb-2">06. System Architecture (Deep Dive)</h2>
        <p className="text-xs text-slate-500 mb-6 italic">Detailed component breakdown.</p>

        <div className="grid grid-cols-1 gap-4">
           {data.appWorkflow.nodes.map((node, i) => (
             <div key={i} className="p-4 bg-slate-50 print:bg-transparent rounded-lg border border-slate-100 print:border-black/30 flex flex-col gap-2 break-inside-avoid shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                   <span className="text-sm font-black text-slate-900 print:text-black">{node.label}</span>
                   <span className="text-[9px] uppercase bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-500 font-bold">{node.type}</span>
                </div>
                <p className="text-xs text-slate-700 print:text-black/90 leading-relaxed whitespace-pre-wrap">{node.details}</p>
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
