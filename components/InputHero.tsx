
import React, { useState } from 'react';
import { Icons } from './Icons';
import { VoiceInput } from './VoiceInput';

interface InputHeroProps {
  onSubmit: (prompt: string) => void;
  isGenerating: boolean;
}

export const InputHero: React.FC<InputHeroProps> = ({ onSubmit, isGenerating }) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (input.trim()) {
      onSubmit(input);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleTranscript = (text: string) => {
    setInput(prev => prev ? prev + ' ' + text : text);
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-6">
      <div className="relative z-10 flex flex-col items-center">
        
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-8 text-center tracking-tight">
          What are we building today?
        </h1>

        <div className="mb-6 flex flex-wrap justify-center gap-2 opacity-90">
          {["Market Analysis", "User Sentiment", "Tech Stack", "Risk Assessment", "MVP Scope"].map((tag) => (
            <span key={tag} className="bg-white border-2 border-slate-200 rounded-lg px-3 py-1 text-xs text-slate-600 font-bold shadow-sm">
              {tag}
            </span>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="relative group w-full">
          <div className="relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isGenerating}
              placeholder="Describe your idea..." 
              className="w-full bg-white border-2 border-slate-900 text-slate-800 text-base rounded-2xl p-4 pr-24 min-h-[64px] focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 outline-none transition-all placeholder:text-slate-400 resize-none leading-relaxed sketch-shadow py-4"
            />
            <div className="absolute bottom-3 right-3 flex items-center gap-1">
              {!isGenerating && (
                  <VoiceInput 
                    onTranscript={handleTranscript} 
                    className="!bg-transparent hover:!bg-slate-100 text-slate-400 hover:text-indigo-600" 
                  />
              )}
              
              {isGenerating ? (
                  <span className="flex items-center justify-center w-10 h-10 bg-indigo-50 rounded-xl text-indigo-600 border border-indigo-100">
                    <Icons.Loader className="w-5 h-5 animate-spin" />
                  </span>
              ) : (
                <button
                    type="submit"
                    disabled={!input.trim()}
                    className="w-10 h-10 flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed border-2 border-slate-900 shadow-sm hover:shadow-md transform active:scale-95"
                  >
                    <Icons.ArrowRight className="w-5 h-5" />
                  </button>
              )}
            </div>
          </div>
        </form>
        <p className="text-center text-xs text-slate-400 mt-4 font-medium">Press <strong>Enter</strong> to submit, <strong>Shift+Enter</strong> for new line</p>
      </div>
    </div>
  );
};
