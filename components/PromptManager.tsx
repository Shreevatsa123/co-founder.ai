
import React, { useState } from 'react';
import { PromptStep, Blueprint } from '../types';
import { Icons } from './Icons';
import { generateProjectPrompts, refinePromptStep } from '../services/gemini';

interface PromptManagerProps {
  blueprint: Blueprint;
  onUpdateBlueprint: (bp: Blueprint) => void;
  onClose: () => void;
}

export const PromptManager: React.FC<PromptManagerProps> = ({ blueprint, onUpdateBlueprint, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  
  const handleGenerate = async () => {
    setLoading(true);
    try {
      const steps = await generateProjectPrompts(blueprint);
      onUpdateBlueprint({ ...blueprint, promptPlan: steps });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleAnalyze = async (stepId: string, output: string) => {
    if (!output.trim()) return;
    setAnalyzingId(stepId);
    try {
      const step = blueprint.promptPlan?.find(s => s.id === stepId);
      if (!step) return;
      
      const feedback = await refinePromptStep(step, output);
      const updatedPlan = blueprint.promptPlan?.map(s => 
        s.id === stepId ? { ...s, userOutput: output, aiFeedback: feedback, status: 'completed' as const } : s
      );
      
      if (updatedPlan) {
        onUpdateBlueprint({ ...blueprint, promptPlan: updatedPlan });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAnalyzingId(null);
    }
  };

  const updateStepOutput = (stepId: string, val: string) => {
    const updatedPlan = blueprint.promptPlan?.map(s => 
       s.id === stepId ? { ...s, userOutput: val } : s
    );
    if (updatedPlan) {
       onUpdateBlueprint({ ...blueprint, promptPlan: updatedPlan });
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-4xl h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Icons.Sparkles className="w-5 h-5 text-indigo-600" />
              Build Sequence Generator
            </h2>
            <p className="text-sm text-slate-500">Generate copy-paste prompts to build your app step-by-step.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-lg transition-colors">
            <Icons.Close className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
          {!blueprint.promptPlan || blueprint.promptPlan.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
               <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center">
                 <Icons.Code className="w-10 h-10 text-indigo-600" />
               </div>
               <div className="max-w-md">
                 <h3 className="text-lg font-bold text-slate-900">Ready to code?</h3>
                 <p className="text-slate-500 mb-6">We will generate a sequence of precise prompts optimized for Cursor, Windsurf, or any AI coding assistant based on your blueprint.</p>
                 <button 
                   onClick={handleGenerate} 
                   disabled={loading}
                   className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2"
                 >
                   {loading ? <Icons.Loader className="w-5 h-5 animate-spin" /> : <Icons.Sparkles className="w-5 h-5" />}
                   Generate Build Prompts
                 </button>
               </div>
            </div>
          ) : (
            <div className="space-y-8 max-w-3xl mx-auto">
               <div className="flex justify-between items-center mb-4">
                  <span className="text-xs font-bold uppercase text-slate-400">Your Build Plan</span>
                  <button 
                    onClick={handleGenerate}
                    className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1"
                  >
                    <Icons.Redo className="w-3 h-3" /> Regenerate
                  </button>
               </div>

               {blueprint.promptPlan.map((step, idx) => (
                 <div key={step.id} className="bg-white border-2 border-slate-200 rounded-xl overflow-hidden sketch-shadow-sm transition-all hover:border-indigo-200">
                    <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                       <div className="flex items-center gap-3">
                          <span className="w-8 h-8 flex items-center justify-center bg-slate-900 text-white rounded-lg font-bold text-sm">
                            {step.step}
                          </span>
                          <h3 className="font-bold text-slate-800">{step.title}</h3>
                       </div>
                       <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase ${
                         step.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                       }`}>
                         {step.status}
                       </span>
                    </div>
                    
                    <div className="p-4 space-y-4">
                       <div className="relative group">
                          <div className="absolute right-2 top-2">
                             <button 
                               onClick={() => handleCopy(step.prompt)}
                               className="p-1.5 bg-white border border-slate-200 rounded-md hover:border-indigo-500 text-slate-400 hover:text-indigo-600 transition-colors shadow-sm"
                               title="Copy Prompt"
                             >
                                <Icons.Copy className="w-4 h-4" />
                             </button>
                          </div>
                          <pre className="bg-slate-900 text-slate-300 p-4 rounded-lg text-xs font-mono whitespace-pre-wrap leading-relaxed overflow-x-auto border-l-4 border-indigo-500">
                             {step.prompt}
                          </pre>
                       </div>

                       <div className="flex flex-col gap-2">
                          <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                             Paste Output Result (Optional)
                          </label>
                          <textarea 
                            value={step.userOutput || ''}
                            onChange={(e) => updateStepOutput(step.id, e.target.value)}
                            placeholder="Paste the output or errors from your coding assistant here..."
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 min-h-[80px]"
                          />
                          {step.aiFeedback && (
                            <div className="mt-2 bg-emerald-50 border border-emerald-100 p-3 rounded-lg text-sm text-emerald-800 flex items-start gap-2">
                               <Icons.Bot className="w-4 h-4 mt-0.5 flex-shrink-0" />
                               <div>
                                 <span className="font-bold block text-xs uppercase mb-1">Analysis</span>
                                 {step.aiFeedback}
                               </div>
                            </div>
                          )}
                          <div className="flex justify-end">
                             <button 
                               onClick={() => handleAnalyze(step.id, step.userOutput || '')}
                               disabled={!step.userOutput || analyzingId === step.id}
                               className="px-4 py-2 bg-white border border-slate-300 hover:border-slate-900 text-slate-700 text-xs font-bold rounded-lg shadow-sm hover:shadow transition-all disabled:opacity-50"
                             >
                               {analyzingId === step.id ? 'Analyzing...' : 'Analyze & Refine Plan'}
                             </button>
                          </div>
                       </div>
                    </div>
                 </div>
               ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
