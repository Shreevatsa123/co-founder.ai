
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
      <header className="border-b-4 border-slate-900 pb-6 mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter mb-1">{data.title}</h1>
          <p className="text-indigo-600 font-bold text-sm uppercase tracking-widest">Resources & Scope Blueprint</p>
        </div>
        <div className="text-right text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          {new Date().toLocaleDateString()}
        </div>
      </header>

      {/* 2. PROJECT SUMMARY */}
      <section className="mb-10">
        <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Project Summary</h2>
        <p className="text-lg leading-relaxed text-slate-800 font-medium">
          {data.summary}
        </p>
      </section>

      {/* 3. SCOPE & FEATURES */}
      <section className="mb-10">
        <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-6 border-b border-slate-100 pb-2">01. Scope & MVP Features</h2>
        <div className="grid grid-cols-2 gap-8">
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
            <h3 className="text-xs font-black text-emerald-600 uppercase mb-4">Must Have (Core)</h3>
            <ul className="space-y-3">
              {data.scope.coreFeatures.map((f, i) => (
                <li key={i} className="text-sm font-bold text-slate-700 flex gap-3">
                  <span className="text-emerald-500">✓</span> {f}
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-6">
            <div>
              <h3 className="text-xs font-black text-amber-600 uppercase mb-3">Nice to Have (v2.0)</h3>
              <ul className="space-y-2">
                {data.scope.optionalFeatures.map((f, i) => (
                  <li key={i} className="text-xs text-slate-600 flex gap-2">
                    <span className="text-amber-400 font-bold">+</span> {f}
                  </li>
                ))}
              </ul>
            </div>
            <div className="pt-4 border-t border-slate-100">
              <h3 className="text-xs font-black text-slate-400 uppercase mb-2">Out of Scope</h3>
              <p className="text-[10px] text-slate-400 italic mb-2">Features explicitly excluded from initial build:</p>
              <div className="flex flex-wrap gap-2">
                {data.scope.outOfScope.map((f, i) => (
                  <span key={i} className="text-[10px] bg-slate-100 px-2 py-1 rounded line-through text-slate-400">{f}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. TECH STACK & CONCEPTS */}
      <section className="mb-10 page-break-before pt-4">
        <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-6 border-b border-slate-100 pb-2">02. Technical Definition</h2>
        <div className="grid grid-cols-2 gap-12">
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase">Tech Stack</h3>
            <div className="space-y-4">
              {data.techStack.map((stack, i) => (
                <div key={i}>
                  <div className="text-[10px] font-black text-indigo-500 uppercase">{stack.category}</div>
                  <div className="text-sm font-bold text-slate-800">{stack.tools.join(', ')}</div>
                  <p className="text-[10px] text-slate-400 italic mt-0.5">{stack.reason}</p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase">Core Concepts</h3>
            <div className="space-y-4">
              {data.coreConcepts.map((concept, i) => (
                <div key={i} className="border-l-2 border-slate-200 pl-4">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold">{concept.name}</span>
                    <span className="text-[8px] font-black uppercase text-slate-400">{concept.complexity}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-relaxed">{concept.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 5. SIMPLIFIED IMPLEMENTATION WORKFLOW */}
      <section className="mb-10">
        <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-6 border-b border-slate-100 pb-2">03. Build Roadmap</h2>
        <div className="space-y-3">
          {data.implementationWorkflow.nodes.map((node, i) => (
            <div key={i} className="flex gap-4 items-start p-4 bg-slate-50 rounded-xl border border-slate-100">
              <span className="w-6 h-6 rounded bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                {i + 1}
              </span>
              <div>
                <div className="text-sm font-bold text-slate-900">{node.label}</div>
                <div className="text-xs text-slate-500 mt-0.5">{node.details}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. RECOMMENDED RESOURCES */}
      <section className="mb-10 page-break-before pt-4">
        <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-6 border-b border-slate-100 pb-2">04. Key Learning & Resources</h2>
        <div className="grid grid-cols-1 gap-4">
          {data.recommendedResources.map((res, i) => (
            <div key={i} className="p-4 border-2 border-slate-100 rounded-xl flex items-center justify-between group">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-black text-indigo-600 uppercase bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">{res.type}</span>
                  <h4 className="text-sm font-bold text-slate-900">{res.title}</h4>
                </div>
                <p className="text-xs text-slate-500 mb-1">{res.description}</p>
                <div className="text-[10px] text-slate-400 underline font-mono">{res.url}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer className="mt-20 pt-8 border-t border-slate-100 flex justify-between items-center text-slate-400">
        <p className="text-[10px] font-black uppercase tracking-widest italic">Confidential Project Blueprint</p>
        <p className="text-[10px] font-bold uppercase tracking-widest">ConceptForge.ai</p>
      </footer>
    </div>
  );
};
