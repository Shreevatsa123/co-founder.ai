
import React, { useState, useEffect } from 'react';
import { InputHero } from './components/InputHero';
import { BlueprintView } from './components/BlueprintView';
import { ClarificationView } from './components/ClarificationView';
import { generateBlueprint, analyzeRequest } from './services/gemini';
import { AppState, Project, ChatMessage, Blueprint } from './types';
import { Icons } from './components/Icons';

function App() {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // Temporary state for the creation flow
  const [pendingPrompt, setPendingPrompt] = useState<string>('');
  const [clarifyingQuestions, setClarifyingQuestions] = useState<string[]>([]);

  // Sidebar grouping state
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    'Today': true,
    'Yesterday': true,
    'Last 7 Days': true,
    'Older': false
  });

  // Load from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem('conceptForge_projects');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setProjects(parsed);
      } catch (e) {
        console.error("Failed to load projects", e);
      }
    }
  }, []);

  // Save to LocalStorage
  useEffect(() => {
    localStorage.setItem('conceptForge_projects', JSON.stringify(projects));
  }, [projects]);

  // Step 1: User submits initial idea -> Analyze it
  const handleInitialSubmit = async (prompt: string) => {
    setPendingPrompt(prompt);
    setAppState(AppState.ANALYZING);
    setError(null);
    
    try {
      const analysis = await analyzeRequest(prompt);
      
      if (analysis.isClarificationNeeded && analysis.questions.length > 0) {
        setClarifyingQuestions(analysis.questions);
        setAppState(AppState.CLARIFYING);
      } else {
        // Idea is detailed enough, proceed directly
        await handleFinalGeneration(prompt, []);
      }
    } catch (err) {
      console.error(err);
      // Fallback: just try to generate if analysis fails
      await handleFinalGeneration(prompt, []);
    }
  };

  // Step 2: User answers questions (or skips) -> Generate Blueprint
  const handleClarificationSubmit = async (qaPairs: {question: string, answer: string}[]) => {
    await handleFinalGeneration(pendingPrompt, qaPairs);
  };

  const handleFinalGeneration = async (prompt: string, qaPairs: {question: string, answer: string}[]) => {
    setAppState(AppState.GENERATING);
    try {
      const blueprintData = await generateBlueprint(prompt, qaPairs);
      
      const blueprint: Blueprint = {
        ...blueprintData,
        clarifyingQuestions: clarifyingQuestions
      };
      
      const newProject: Project = {
        id: crypto.randomUUID(),
        title: blueprint.title,
        createdAt: Date.now(),
        blueprint,
        chatHistory: []
      };

      setProjects(prev => [newProject, ...prev]);
      setCurrentProject(newProject);
      setAppState(AppState.SUCCESS);
    } catch (err) {
      console.error(err);
      setError("Failed to generate the plan. Please try again.");
      setAppState(AppState.ERROR);
    }
  };

  const handleSelectProject = (project: Project) => {
    setCurrentProject(project);
    setAppState(AppState.SUCCESS);
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  const handleDeleteProject = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const updated = projects.filter(p => p.id !== id);
    setProjects(updated);
    if (currentProject?.id === id) {
      setCurrentProject(null);
      setAppState(AppState.IDLE);
    }
  };

  const handleNewProject = () => {
    setCurrentProject(null);
    setAppState(AppState.IDLE);
    setError(null);
    setPendingPrompt('');
    setClarifyingQuestions([]);
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  const updateProject = (updatedProject: Project) => {
    setCurrentProject(updatedProject);
    setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p));
  };

  const toggleGroup = (group: string) => {
    setExpandedGroups(prev => ({...prev, [group]: !prev[group]}));
  }

  // Group projects by date
  const groupedProjects = projects.reduce((groups, project) => {
    const date = new Date(project.createdAt);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);

    let key = 'Older';
    if (date.toDateString() === today.toDateString()) {
      key = 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      key = 'Yesterday';
    } else if (date > lastWeek) {
      key = 'Last 7 Days';
    }

    if (!groups[key]) groups[key] = [];
    groups[key].push(project);
    return groups;
  }, {} as Record<string, Project[]>);

  const groupOrder = ['Today', 'Yesterday', 'Last 7 Days', 'Older'];

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 overflow-hidden font-sans">
      
      {/* Sidebar */}
      <aside 
        className={`${isSidebarOpen ? 'w-72 border-r-2' : 'w-0 border-r-0'} bg-white border-slate-900 transition-all duration-300 flex flex-col absolute md:relative z-20 h-full shadow-lg md:shadow-none overflow-hidden`}
      >
        <div className="p-4 border-b-2 border-slate-900 flex items-center justify-between min-w-[18rem] bg-white">
          <div className="flex items-center gap-2 font-bold text-slate-900">
            <Icons.Book className="w-5 h-5 text-indigo-600" />
            <span>My Notebooks</span>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(false)} 
            className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
            title="Close Sidebar"
          >
            <Icons.PanelLeftClose className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 min-w-[18rem]">
          <button 
            onClick={handleNewProject}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded-xl transition-all font-bold text-sm shadow-sm border-2 border-slate-900 sketch-shadow hover:sketch-shadow-hover active:sketch-shadow-active active:translate-x-[2px] active:translate-y-[2px]"
          >
            <Icons.Plus className="w-4 h-4" />
            New Project
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-2 min-w-[18rem]">
          {projects.length === 0 && (
            <div className="text-center text-slate-400 text-sm py-12 flex flex-col items-center gap-2">
              <Icons.Book className="w-8 h-8 opacity-20" />
              <span>No notebooks yet.</span>
            </div>
          )}

          {groupOrder.map(group => {
            const groupProjects = groupedProjects[group];
            if (!groupProjects || groupProjects.length === 0) return null;
            
            return (
              <div key={group} className="mb-6">
                 <button 
                   onClick={() => toggleGroup(group)}
                   className="flex items-center gap-2 w-full text-left mb-3 px-2 py-1 hover:bg-slate-50 rounded-lg group transition-colors"
                 >
                   {expandedGroups[group] ? (
                      <Icons.ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 transition-colors rotate-90" />
                   ) : (
                      <Icons.ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                   )}
                   <span className="text-xs font-bold text-slate-500 uppercase tracking-wider group-hover:text-slate-900">{group}</span>
                   <span className="ml-auto text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">{groupProjects.length}</span>
                 </button>
                 
                 {expandedGroups[group] && (
                   <div className="space-y-2 animate-in slide-in-from-top-2 duration-200 pl-1 pb-2">
                     {groupProjects.map(project => (
                        <div 
                          key={project.id}
                          onClick={() => handleSelectProject(project)}
                          className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all border-2 ${
                            currentProject?.id === project.id 
                              ? 'bg-white border-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] translate-x-[-1px] translate-y-[-1px]' 
                              : 'bg-transparent border-transparent hover:bg-white hover:border-slate-200 hover:shadow-sm'
                          }`}
                        >
                          <div className="flex flex-col overflow-hidden">
                            <span className={`truncate text-sm font-bold pr-2 leading-tight ${currentProject?.id === project.id ? 'text-indigo-700' : 'text-slate-700'}`}>
                              {project.title}
                            </span>
                            <span className="text-[10px] text-slate-400 mt-1">
                              {new Date(project.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </span>
                          </div>
                          <button 
                            onClick={(e) => handleDeleteProject(e, project.id)}
                            className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-500 transition-all p-1.5 hover:bg-rose-50 rounded-md"
                            title="Delete project"
                          >
                            <Icons.Trash className="w-3.5 h-3.5" />
                          </button>
                        </div>
                     ))}
                   </div>
                 )}
              </div>
            );
          })}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative bg-slate-50/50 bg-grid-pattern h-full overflow-hidden">
        
        {/* Global Sidebar Toggle (visible when sidebar is closed, except in BlueprintView where it has its own) */}
        {!isSidebarOpen && appState !== AppState.SUCCESS && (
           <div className="absolute top-4 left-4 z-30">
             <button onClick={() => setIsSidebarOpen(true)} className="p-2 bg-white border-2 border-slate-900 rounded-lg shadow-sm text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors sketch-shadow-sm">
               <Icons.PanelLeftOpen className="w-5 h-5" />
             </button>
           </div>
        )}

        <div className="flex-1 overflow-y-auto w-full">
          {appState === AppState.ERROR && (
            <div className="max-w-md mx-auto mt-12 p-4 bg-rose-50 border-2 border-rose-200 rounded-lg flex items-center gap-3 shadow-sm">
              <Icons.Alert className="text-rose-500 w-5 h-5" />
              <span className="text-rose-900 text-sm font-bold">{error}</span>
            </div>
          )}

          {/* Loading States */}
          {(appState === AppState.ANALYZING || appState === AppState.GENERATING) && (
            <div className="flex flex-col items-center justify-center min-h-[80vh]">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
                <Icons.Brain className="w-6 h-6 text-indigo-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mt-6 mb-2">
                {appState === AppState.ANALYZING ? "Reviewing your idea..." : "Drafting the Notebook..."}
              </h2>
              <p className="text-slate-500 font-medium">
                {appState === AppState.ANALYZING ? "Checking for blind spots" : "Sketching architecture and workflows"}
              </p>
            </div>
          )}

          {/* IDLE: Initial Input */}
          {appState === AppState.IDLE && (
            <div className="h-full flex items-center justify-center">
              <InputHero onSubmit={handleInitialSubmit} isGenerating={false} />
            </div>
          )}

          {/* CLARIFYING: User Q&A */}
          {appState === AppState.CLARIFYING && (
            <ClarificationView 
              questions={clarifyingQuestions} 
              onSubmit={handleClarificationSubmit}
              onSkip={() => handleFinalGeneration(pendingPrompt, [])}
            />
          )}

          {/* SUCCESS: View Project */}
          {appState === AppState.SUCCESS && currentProject && (
            <BlueprintView 
              project={currentProject} 
              onUpdateProject={updateProject}
              onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
              isSidebarOpen={isSidebarOpen}
            />
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
