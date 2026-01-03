
import React from 'react';
import { Project } from '../types';

interface ExportViewProps {
  project: Project;
}

export const ExportView: React.FC<ExportViewProps> = ({ project }) => {
  const { blueprint: data } = project;

  return (
    <div className="bg-white p-8 text-slate-900 max-w-4xl mx-auto print:p-0 font-sans" id="print-area">
      {/* 1. DOCUMENT HEADER */}
      <header className="border-b-2 border-slate-900 pb-6 mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">{data.title}</h1>
          <p className="text-slate-500 font-medium">Project Blueprint & Implementation Strategy</p>
        </div>
        <div className="text-right text-xs font-bold text-slate-400 uppercase tracking-widest">
          Generated: {new Date().toLocaleDateString()}
        </div>
      </header>

      {/* 2. SUMMARY SECTION */}
      <section className="mb-10">
        <h2 className="text-lg font-bold border-l-4 border-indigo-600 pl-3 mb-4 uppercase tracking-wide">Executive Summary</h2>
        <p className="text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-100 italic">
          {data.summary}
        </p>
      </section>

      {/* 3. WORKFLOW SECTION (Page 1) */}
      <section className="mb-10">
        <h2 className="text-lg font-bold border-l-4 border-indigo-600 pl-3 mb-6 uppercase tracking-wide">01. System & Build Workflows</h2>
        
        <div className="space-y-8">
          <div>
            <h3 className="text-sm font-bold text-slate-500 uppercase mb-4 flex items-center gap-2">
              <span className="w-5 h-5 bg-slate-900 text-white rounded-full flex items-center justify-center text-[10px]">A</span>
              The System: How it works
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {data.appWorkflow.nodes.map((node, i) => (
                <div key={i} className="flex gap-4 items-center p-3 border border-slate-200 rounded-lg">
                  <span className="text-xs font-bold text-slate-400 w-6">{(i + 1).toString().padStart(2, '0')}</span>
                  <div className="flex-1">
                    <div className="text-sm font-bold">{node.label}</div>
                    <div className="text-xs text-slate-500">{node.details}</div>
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-tighter text-slate-300 border border-slate-200 px-1.5 rounded">{node.type}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="page-break-before pt-4">
            <h3 className="text-sm font-bold text-slate-500 uppercase mb-4 flex items-center gap-2">
              <span className="w-5 h-5 bg-slate-900 text-white rounded-full flex items-center justify-center text-[10px]">B</span>
              Implementation: How to build it
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {data.implementationWorkflow.nodes.map((node, i) => (
                <div key={i} className="flex gap-4 items-center p-3 border border-slate-200 rounded-lg">
                  <span className="text-xs font-bold text-slate-400 w-6">{(i + 1).toString().padStart(2, '0')}</span>
                  <div className="flex-1">
                    <div className="text-sm font-bold">{node.label}</div>
                    <div className="text-xs text-slate-500">{node.details}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4. RESOURCES & SCOPE (Page 2) */}
      <section className="mb-10 page-break-before pt-8">
        <h2 className="text-lg font-bold border-l-4 border-indigo-600 pl-3 mb-8 uppercase tracking-wide">02. Resources, Scope & Tech Stack</h2>
        
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase mb-3">Core Tech Stack</h3>
            <div className="space-y-3">
              {data.techStack.map((stack, i) => (
                <div key={i} className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <div className="text-[10px] font-black text-indigo-600 uppercase mb-1">{stack.category}</div>
                  <div className="text-sm font-bold">{stack.tools.join(', ')}</div>
                  <div className="text-[10px] text-slate-400 mt-1 italic">{stack.reason}</div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase mb-3">Project Scope (MVP)</h3>
            <div className="border-2 border-slate-100 rounded-xl overflow-hidden">
              <div className="bg-slate-100 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-600">Must Have Features</div>
              <ul className="p-4 space-y-2">
                {data.scope.coreFeatures.map((f, i) => (
                  <li key={i} className="text-xs font-medium text-slate-700 flex gap-2">
                    <span className="text-emerald-500 font-bold">•</span> {f}
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-4 border border-dashed border-slate-200 rounded-xl p-4">
               <div className="text-[10px] font-bold uppercase text-slate-400 mb-2">Future Considerations</div>
               <div className="flex flex-wrap gap-2">
                 {data.scope.optionalFeatures.map((f, i) => (
                   <span key={i} className="text-[10px] bg-slate-50 px-2 py-1 rounded text-slate-500 border border-slate-100">{f}</span>
                 ))}
               </div>
            </div>
          </div>
        </div>

        <h3 className="text-xs font-bold text-slate-400 uppercase mb-3">External Knowledge & Assets</h3>
        <div className="grid grid-cols-2 gap-4">
          {data.recommendedResources.map((res, i) => (
            <div key={i} className="p-4 border border-slate-100 rounded-lg flex items-start gap-3">
              <div className="w-8 h-8 rounded bg-indigo-50 flex items-center justify-center flex-shrink-0">
                <span className="text-[10px] font-bold text-indigo-600">{res.type[0].toUpperCase()}</span>
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900 leading-tight">{res.title}</div>
                <div className="text-[10px] text-slate-500 mt-1 line-clamp-1 underline">{res.url}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. STRATEGY & RISKS (Page 3) */}
      <section className="mb-10 page-break-before pt-8">
        <h2 className="text-lg font-bold border-l-4 border-indigo-600 pl-3 mb-8 uppercase tracking-wide">03. Strategy, Market & Risk Analysis</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="bg-slate-50 p-6 rounded-2xl">
            <h3 className="text-xs font-bold text-slate-400 uppercase mb-4">Market Context</h3>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase">Target Audience</label>
                <p className="text-sm font-medium text-slate-700 mt-1">{data.marketAnalysis.targetAudience}</p>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase">Key Competitors</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {data.marketAnalysis.keyCompetitors.map((c, i) => (
                    <span key={i} className="text-xs font-bold px-2 py-0.5 border border-slate-300 rounded">{c}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="border-2 border-rose-100 p-6 rounded-2xl bg-rose-50/30">
            <h3 className="text-xs font-bold text-rose-600 uppercase mb-4 tracking-widest">Risk Assessment</h3>
            <ul className="space-y-3">
              {data.risksAndLiabilities.map((risk, i) => (
                <li key={i} className="text-sm font-bold text-slate-800 flex gap-3">
                  <span className="text-rose-500">!</span> {risk}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase mb-4">Strategic Insights</h3>
          <div className="grid grid-cols-1 gap-4">
            {data.strategicInsights.map((insight, i) => (
              <div key={i} className="p-4 border border-slate-100 rounded-xl bg-white">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-sm font-bold text-slate-900">{insight.title}</h4>
                  <span className="text-[9px] font-black text-slate-400 uppercase">{insight.type}</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed italic border-t border-slate-50 pt-2">{insight.summary}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="mt-20 pt-8 border-t border-slate-100 text-center">
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
          End of Document — ConceptForge Blueprint Engine
        </p>
      </footer>
    </div>
  );
};
