
import React, { useState } from 'react';
import { Icons } from './Icons';
import { VoiceInput } from './VoiceInput';

interface ClarificationViewProps {
  questions: string[];
  onSubmit: (answers: {question: string, answer: string}[]) => void;
  onSkip: () => void;
}

export const ClarificationView: React.FC<ClarificationViewProps> = ({ questions, onSubmit, onSkip }) => {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  
  const handleAnswerChange = (idx: number, text: string) => {
    setAnswers(prev => ({ ...prev, [idx]: text }));
  };

  const handleVoiceTranscript = (idx: number, text: string) => {
    setAnswers(prev => {
      const current = prev[idx] || '';
      return { ...prev, [idx]: current ? `${current} ${text}` : text };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formatted = questions.map((q, i) => ({
      question: q,
      answer: answers[i] || "Not specified"
    }));
    onSubmit(formatted);
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white border-2 border-slate-900 rounded-xl sketch-shadow overflow-hidden relative">
        
        <div className="p-8 bg-slate-50 border-b-2 border-slate-900 text-center">
          <div className="inline-flex items-center justify-center p-3 bg-white border-2 border-slate-900 rounded-full mb-4 shadow-sm">
             <Icons.Lightbulb className="w-6 h-6 text-indigo-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2 tracking-tight">Let's refine your idea</h2>
          <p className="text-slate-600 text-sm font-medium">I have a few questions to build a better strategy for you.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8 bg-white">
          {questions.map((q, idx) => (
            <div key={idx} className="space-y-3 group">
              <label className="block text-lg font-bold text-slate-900">
                <span className="text-indigo-600 mr-2">#{idx + 1}</span>
                {q}
              </label>
              <div className="relative">
                <textarea
                  value={answers[idx] || ''}
                  onChange={(e) => handleAnswerChange(idx, e.target.value)}
                  placeholder="Type or speak your answer..."
                  className="w-full bg-white border-2 border-slate-900 rounded-xl p-4 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 transition-all min-h-[120px] resize-none sketch-shadow-sm placeholder:text-slate-400"
                />
                <div className="absolute bottom-3 right-3">
                  <VoiceInput onTranscript={(text) => handleVoiceTranscript(idx, text)} />
                </div>
              </div>
            </div>
          ))}

          <div className="pt-6 flex items-center justify-between gap-4 border-t-2 border-slate-100 mt-8">
             <button
               type="button"
               onClick={onSkip}
               className="text-slate-500 text-sm hover:text-slate-900 font-bold px-4 py-2 transition-colors border-2 border-transparent hover:border-slate-200 rounded-lg"
             >
               Skip to draft
             </button>
             <button
               type="submit"
               className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-xl font-bold border-2 border-slate-900 sketch-shadow hover:sketch-shadow-hover transition-all flex items-center gap-2 transform active:scale-95"
             >
               <span>Generate Plan</span>
               <Icons.ArrowRight className="w-4 h-4" />
             </button>
          </div>
        </form>

      </div>
    </div>
  );
};
