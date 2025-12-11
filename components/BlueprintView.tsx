
import React, { useState } from 'react';
import { Blueprint, ChatMessage, Project } from '../types';
import { Icons } from './Icons';
import { RevenueChart, MarketDonut, DynamicChart } from './Visualizations';
import { WorkflowMap } from './WorkflowMap';
import { PromptManager } from './PromptManager';

interface BlueprintViewProps {
  project: Project;
  onUpdateProject: (p: Project) => void;
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
}

const Card: React.FC<{ title?: string; icon?: any; children: React.ReactNode; className?: string; action?: React.ReactNode }> = ({ 
  title, icon: Icon, children, className = "", action
}) => (
  <div className={`bg-white border-2 border-slate-900 rounded-xl p-6 sketch-shadow ${className}`}>
    {title && (
      <div className="flex items-center justify-between mb-4 border-b-2 border-slate-100 pb-2 pr-12">
        <div className="flex items-center gap-2 text-slate-900">
          {Icon && <Icon className="w-5 h-5" />}
          <h3 className="text-sm font-bold uppercase tracking-wider font-display">{title}</h3>
        </div>
        {action}
      </div>
    )}
    {children}
  </div>
);

export const BlueprintView: React.FC<BlueprintViewProps> = ({ 
  project, 
  onUpdateProject, 
  onToggleSidebar, 
  isSidebarOpen 
}) => {
  // Navigation Order: Workflow -> Resources -> Strategy
  const [activeView, setActiveView] = useState<'workflow' | 'resources' | 'strategy'>('workflow');
  const [isMapFullScreen, setIsMapFullScreen] = useState(false);
  const [showPromptManager, setShowPromptManager] = useState(false);
  const { blueprint: data } = project;

  const views = [
    { id: 'workflow', label: 'Workflow', icon: Icons.GitMerge },
    { id: 'resources', label: 'Resources & Scope', icon: Icons.Book },
    { id: 'strategy', label: 'Strategy & Risks', icon: Icons.Trending },
  ];

  return (
    <div className="relative w-full h-full flex flex-col bg-slate-50 overflow-hidden font-sans">
      
      {/* Header */}
      <div className="relative z-40 flex items-center gap-4 px-6 py-4 bg-white/80 backdrop-blur-sm border-b border-slate-200/50 flex-shrink-0">
        <button 
          onClick={onToggleSidebar}
          className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100/50 rounded-lg transition-all flex-shrink-0"
          title={isSidebarOpen ? "Close Sidebar" : "Open Sidebar"}
        >
          {isSidebarOpen ? <Icons.PanelLeftClose className="w-6 h-6" /> : <Icons.PanelLeftOpen className="w-6 h-6" />}
        </button>
        <div className="min-w-0 flex-1 flex items-center justify-between">
           <h1 className="text-2xl font-bold text-slate-900 leading-tight truncate font-display">{data.title}</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 relative overflow-hidden"> 
        
        {/* View: Workflow (Map) */}
        {activeView === 'workflow' && (
           <div className="absolute inset-0 z-0 pt-0">
             <WorkflowMap 
                project={project} 
                onUpdateProject={onUpdateProject}
                isFullScreen={true}
                onToggleFullScreen={() => {}} 
             />
           </div>
        )}

        {/* View: Resources & Scope */}
        {activeView === 'resources' && (
          <div className="absolute inset-0 bg-slate-50 overflow-y-auto p-8 pr-24 animate-in fade-in slide-in-from-right-4 duration-300">
             <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 pb-20">
                <div className="md:col-span-2">
                  <h2 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-3 font-display">
                    <Icons.Book className="w-8 h-8 text-indigo-600" />
                    Resources, Scope & Tech
                  </h2>
                </div>

                {/* Project Summary Description */}
                <div className="md:col-span-2 bg-indigo-50 border-2 border-indigo-100 rounded-xl p-6 mb-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-900 mb-2 font-display">Project Summary</h3>
                  <p className="text-slate-700 leading-relaxed">{data.summary}</p>
                </div>

                {/* Scope / MVP Features */}
                <Card title="Scope & MVP Features" icon={Icons.Layers} className="md:col-span-2">
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-emerald-700 text-sm font-bold">
                        <Icons.Check className="w-4 h-4" /> Must Have (Core)
                      </div>
                      <ul className="bg-emerald-50 border-2 border-emerald-100 rounded-lg p-4 space-y-3">
                        {data.scope.coreFeatures.map((f, i) => (
                          <li key={i} className="text-sm text-slate-800 font-medium pl-3 border-l-4 border-emerald-400 leading-snug">
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-amber-600 text-sm font-bold">
                        <Icons.Plus className="w-4 h-4" /> Nice to Have (v2)
                      </div>
                      <ul className="bg-amber-50 border-2 border-amber-100 rounded-lg p-4 space-y-3">
                        {data.scope.optionalFeatures.map((f, i) => (
                          <li key={i} className="text-sm text-slate-700 pl-3 border-l-4 border-amber-400 leading-snug">
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-rose-500 text-sm font-bold">
                        <Icons.Minus className="w-4 h-4" /> Out of Scope
                      </div>
                      <ul className="bg-rose-50 border-2 border-rose-100 rounded-lg p-4 space-y-3">
                        {data.scope.outOfScope.map((f, i) => (
                          <li key={i} className="text-sm text-slate-500 line-through decoration-slate-300 pl-3 border-l-4 border-rose-300 leading-snug">
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </Card>

                {/* Tech Stack */}
                 <Card title="Recommended Tech Stack" icon={Icons.Code}>
                    <div className="space-y-4">
                      {data.techStack.map((stack, idx) => (
                        <div key={idx} className="flex flex-col gap-2 pb-3 border-b border-slate-100 last:border-0">
                          <span className="text-xs font-bold text-slate-400 uppercase">{stack.category}</span>
                          <div className="flex flex-wrap gap-2">
                            {stack.tools.map((t, i) => (
                              <span key={i} className="px-3 py-1 bg-slate-800 text-white rounded-md text-xs font-mono font-medium sketch-shadow-sm">
                                {t}
                              </span>
                            ))}
                          </div>
                          <p className="text-xs text-slate-500 italic">{stack.reason}</p>
                        </div>
                      ))}
                    </div>
                </Card>

                 {/* Concepts */}
                 <Card title="Core System Concepts" icon={Icons.Brain}>
                    <ul className="space-y-5">
                      {data.coreConcepts.map((concept, idx) => (
                        <li key={idx}>
                          <div className="flex justify-between items-baseline mb-1">
                            <span className="text-sm font-bold text-slate-900">{concept.name}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded border border-slate-900 font-bold ${
                              concept.complexity === 'High' ? 'bg-rose-100 text-rose-900' : 
                              concept.complexity === 'Medium' ? 'bg-amber-100 text-amber-900' : 
                              'bg-emerald-100 text-emerald-900'
                            }`}>{concept.complexity}</span>
                          </div>
                          <p className="text-sm text-slate-600 leading-relaxed">{concept.description}</p>
                        </li>
                      ))}
                    </ul>
                 </Card>

                 {/* Resources List */}
                <div className="md:col-span-2 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                   {data.recommendedResources.map((res, idx) => (
                     <a key={idx} href="#" className="block p-5 bg-white border-2 border-slate-200 hover:border-indigo-600 rounded-xl transition-all group sketch-shadow-sm hover:sketch-shadow">
                       <div className="flex justify-between mb-3">
                         <span className="text-[10px] uppercase font-bold text-indigo-700 bg-indigo-50 px-2 py-1 rounded border border-indigo-100">{res.type}</span>
                         <Icons.ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 transition-colors" />
                       </div>
                       <h4 className="text-sm font-bold text-slate-900 mb-1">{res.title}</h4>
                       <p className="text-xs text-slate-500 line-clamp-2">{res.description}</p>
                     </a>
                   ))}
                </div>

             </div>
          </div>
        )}

        {/* View: Strategy & Risks */}
        {activeView === 'strategy' && (
          <div className="absolute inset-0 bg-slate-50 overflow-y-auto p-8 pr-24 animate-in fade-in slide-in-from-right-4 duration-300">
             <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 pb-20">
                <div className="md:col-span-2">
                  <h2 className="text-3xl font-bold text-slate-900 mb-6 flex items-center gap-3 font-display">
                    <Icons.Trending className="w-8 h-8 text-indigo-600" />
                    Strategy, Risks & Market
                  </h2>
                </div>

                {/* NEW Intelligent Strategy Dashboard */}
                {data.strategicInsights?.map((metric, idx) => (
                   <Card key={idx} title={metric.title} icon={Icons.Activity}>
                      <DynamicChart metric={metric} />
                      <p className="text-xs text-slate-500 mt-4 italic border-t border-slate-100 pt-2">{metric.summary}</p>
                   </Card>
                ))}

                 {/* Risks & Liabilities (Moved here) */}
                 <Card title="Risks & Liabilities" icon={Icons.Shield} className="md:col-span-2">
                  <div className="flex flex-wrap gap-3">
                    {data.risksAndLiabilities.map((risk, idx) => (
                      <div key={idx} className="flex items-center gap-2 px-4 py-3 bg-rose-50 border-2 border-rose-100 rounded-lg text-sm text-rose-800 font-medium">
                        <Icons.Alert className="w-4 h-4 text-rose-600" />
                        {risk}
                      </div>
                    ))}
                  </div>
                </Card>

             </div>
          </div>
        )}

      </div>

      {/* Right Floating Nav Dock */}
      <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-50">
         {views.map(view => (
            <div key={view.id} className="relative group flex items-center justify-end">
               {/* Label */}
               <div className="absolute right-full mr-3 px-3 py-1 bg-slate-900 text-white text-xs font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-lg font-display">
                  {view.label}
                  <div className="absolute top-1/2 -right-1 -translate-y-1/2 border-4 border-transparent border-l-slate-900"></div>
               </div>

               <button
                 onClick={() => setActiveView(view.id as any)}
                 className={`w-12 h-12 flex items-center justify-center rounded-full border-2 transition-all duration-200 sketch-shadow ${
                    activeView === view.id 
                    ? 'bg-indigo-600 border-slate-900 text-white translate-x-[-2px] translate-y-[-2px]' 
                    : 'bg-white border-slate-900 text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                 }`}
               >
                 <view.icon className="w-5 h-5" />
               </button>
            </div>
         ))}
         
         <div className="w-full h-px bg-slate-300/50 my-1"></div>

         {/* Build Prompts Button */}
         <div className="relative group flex items-center justify-end">
            <div className="absolute right-full mr-3 px-3 py-1 bg-slate-900 text-white text-xs font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-lg font-display">
                Build Prompts
                <div className="absolute top-1/2 -right-1 -translate-y-1/2 border-4 border-transparent border-l-slate-900"></div>
            </div>
            <button
               onClick={() => setShowPromptManager(true)}
               className="w-12 h-12 flex items-center justify-center rounded-full border-2 bg-indigo-50 border-indigo-200 text-indigo-600 hover:bg-indigo-100 hover:border-indigo-300 transition-all duration-200 sketch-shadow hover:sketch-shadow-hover"
            >
               <Icons.Sparkles className="w-5 h-5" />
            </button>
         </div>

      </div>

      {showPromptManager && (
         <PromptManager 
           blueprint={data}
           onUpdateBlueprint={(bp) => onUpdateProject({ ...project, blueprint: bp })}
           onClose={() => setShowPromptManager(false)}
         />
      )}
    </div>
  );
};
