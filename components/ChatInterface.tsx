
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, Blueprint } from '../types';
import { Icons } from './Icons';
import { sendMessageToProject } from '../services/gemini';

interface ChatInterfaceProps {
  blueprint: Blueprint;
  history: ChatMessage[];
  onUpdateHistory: (newHistory: ChatMessage[]) => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ blueprint, history, onUpdateHistory }) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      role: 'user',
      text: input,
      timestamp: Date.now()
    };

    const newHistory = [...history, userMsg];
    onUpdateHistory(newHistory);
    setInput('');
    setIsLoading(true);

    try {
      const responseText = await sendMessageToProject(blueprint, newHistory, input);
      const botMsg: ChatMessage = {
        role: 'model',
        text: responseText,
        timestamp: Date.now()
      };
      onUpdateHistory([...newHistory, botMsg]);
    } catch (error) {
      console.error(error);
      const errorMsg: ChatMessage = {
        role: 'model',
        text: "I'm having trouble connecting right now. Please try again.",
        timestamp: Date.now()
      };
      onUpdateHistory([...newHistory, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] paper-card rounded-lg overflow-hidden">
      <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-indigo-100 rounded-md">
            <Icons.Brain className="w-4 h-4 text-indigo-600" />
          </div>
          <div>
             <h3 className="font-semibold text-slate-800 text-sm">Project Assistant</h3>
             <p className="text-xs text-slate-500">Ask questions or refine the plan</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white" ref={scrollRef}>
        {/* Initial Prompt from System based on clarifying questions */}
        {blueprint.clarifyingQuestions && blueprint.clarifyingQuestions.length > 0 && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 mt-1">
               <Icons.Bot className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="space-y-2 max-w-[85%]">
               <div className="bg-slate-50 border border-slate-100 rounded-2xl rounded-tl-none p-4 text-sm text-slate-700">
                 <p className="mb-2 font-medium">Here are a few things I need to know to refine the plan:</p>
                 <ul className="list-disc list-inside space-y-1 text-slate-600">
                   {blueprint.clarifyingQuestions.map((q, i) => (
                     <li key={i}>{q}</li>
                   ))}
                 </ul>
               </div>
            </div>
          </div>
        )}

        {history.map((msg, idx) => (
          <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
             <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${
               msg.role === 'user' ? 'bg-slate-800' : 'bg-indigo-100'
             }`}>
                {msg.role === 'user' ? (
                  <Icons.User className="w-4 h-4 text-white" />
                ) : (
                  <Icons.Bot className="w-4 h-4 text-indigo-600" />
                )}
             </div>
             <div className={`max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`rounded-2xl p-4 text-sm shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-slate-800 text-white rounded-tr-none' 
                    : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none'
                }`}>
                  {msg.text.split('\n').map((line, i) => (
                    <p key={i} className={i > 0 ? 'mt-2' : ''}>{line}</p>
                  ))}
                </div>
                <span className="text-[10px] text-slate-400 mt-1 px-1 block">
                  {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </span>
             </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex gap-3">
             <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 mt-1">
                <Icons.Bot className="w-4 h-4 text-indigo-600" />
             </div>
             <div className="bg-slate-50 border border-slate-100 rounded-2xl rounded-tl-none p-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
             </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSend} className="p-3 border-t border-slate-100 bg-white">
        <div className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your answer or ask a question..."
            className="w-full bg-slate-50 border border-slate-200 rounded-full py-3 pl-4 pr-12 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
          />
          <button 
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-1.5 p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-colors"
          >
            <Icons.ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
