
import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { AppWorkflow, WorkflowNode, Project, StickyNote, Drawing, Blueprint } from '../types';
import { Icons } from './Icons';
import { sendMessageToProject, refineProjectDetails } from '../services/gemini';

interface WorkflowMapProps {
  project: Project;
  onUpdateProject: (p: Project) => void;
  isFullScreen: boolean;
  onToggleFullScreen: () => void;
}

type ToolType = 'select' | 'pan' | 'pencil' | 'line';

export const WorkflowMap: React.FC<WorkflowMapProps> = ({ 
  project, 
  onUpdateProject,
  isFullScreen, 
  onToggleFullScreen 
}) => {
  const { appWorkflow, implementationWorkflow, techStack } = project.blueprint;
  
  // Safe Fallback for older projects
  const systemWorkflow = appWorkflow || { nodes: [], edges: [] };
  const buildWorkflow = implementationWorkflow || { nodes: [], edges: [] };

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState<ToolType>('select');
  
  // AI Interaction
  const [aiInput, setAiInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isRefining, setIsRefining] = useState(false);

  // Viewport State
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [edgePaths, setEdgePaths] = useState<{id: string, d: string, label?: string, x?: number, y?: number}[]>([]);
  
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [zoom, setZoom] = useState(0.8);
  const [isPanning, setIsPanning] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });

  // Drawing State
  const [currentDrawing, setCurrentDrawing] = useState<Drawing | null>(null);
  const [draggingNoteId, setDraggingNoteId] = useState<string | null>(null);

  const selectedNode = 
    systemWorkflow.nodes.find(n => n.id === selectedNodeId) ||
    buildWorkflow.nodes.find(n => n.id === selectedNodeId);

  // --- 1. Helper: Calculate Hierarchy Levels ---
  // Returns topological levels. 
  // For System (Horizontal): Level 0 is Leftmost column.
  // For Build (Vertical): Level 0 is Topmost row.
  const getLevels = (nodes: WorkflowNode[], edges: any[]) => {
    const nodeLevels: Record<string, number> = {};
    nodes.forEach(n => nodeLevels[n.id] = 0);

    let changed = true;
    let iterations = 0;
    while(changed && iterations < nodes.length + 2) {
       changed = false;
       edges.forEach(edge => {
          const fromLvl = nodeLevels[edge.from] || 0;
          const toLvl = nodeLevels[edge.to] || 0;
          if (fromLvl + 1 > toLvl) {
             nodeLevels[edge.to] = fromLvl + 1;
             changed = true;
          }
       });
       iterations++;
    }
    const levels: WorkflowNode[][] = [];
    nodes.forEach(n => {
       const lvl = nodeLevels[n.id];
       if (!levels[lvl]) levels[lvl] = [];
       levels[lvl].push(n);
    });
    return levels.filter(r => r && r.length > 0);
  };

  const systemColumns = useMemo(() => getLevels(systemWorkflow.nodes, systemWorkflow.edges), [systemWorkflow]);
  const buildRows = useMemo(() => getLevels(buildWorkflow.nodes, buildWorkflow.edges), [buildWorkflow]);

  // --- 2. Calculate Arrow Paths (STABLE VERSION) ---
  const calculateEdges = useCallback(() => {
    if (!contentRef.current) return;
    
    // We calculate edges based on internal OFFSET positions, ignoring zoom/viewport entirely.
    const newPaths: {id: string, d: string, label?: string, x?: number, y?: number}[] = [];

    const getCenter = (id: string) => {
       const el = document.getElementById(`node-${id}`);
       if (!el || !contentRef.current) return null;
       
       // Calculate offset relative to contentRef
       let x = el.offsetLeft;
       let y = el.offsetTop;
       let parent = el.offsetParent as HTMLElement;
       
       // Traverse up until we hit the contentRef
       while(parent && parent !== contentRef.current) {
          x += parent.offsetLeft;
          y += parent.offsetTop;
          parent = parent.offsetParent as HTMLElement;
       }

       return {
         x: x + el.offsetWidth / 2,
         y: y + el.offsetHeight / 2
       };
    };

    const processEdges = (edges: any[], prefix: string, orientation: 'horizontal' | 'vertical') => {
        edges.forEach((edge, idx) => {
            const start = getCenter(edge.from);
            const end = getCenter(edge.to);

            if (start && end) {
                let path = '';
                
                if (orientation === 'horizontal') {
                   // Horizontal Curve (Left to Right)
                   const controlOffset = Math.abs(end.x - start.x) * 0.5;
                   path = `
                    M ${start.x} ${start.y}
                    C ${start.x + controlOffset} ${start.y},
                      ${end.x - controlOffset} ${end.y},
                      ${end.x} ${end.y}
                   `;
                } else {
                   // Vertical Curve (Top to Bottom)
                   const controlOffset = Math.abs(end.y - start.y) * 0.5;
                   path = `
                    M ${start.x} ${start.y}
                    C ${start.x} ${start.y + controlOffset},
                      ${end.x} ${end.y - controlOffset},
                      ${end.x} ${end.y}
                   `;
                }

                newPaths.push({ 
                  id: `${prefix}-edge-${idx}`, 
                  d: path,
                  label: edge.label,
                  x: start.x + (end.x - start.x) / 2,
                  y: start.y + (end.y - start.y) / 2
                });
            }
        });
    };

    // System = Horizontal
    processEdges(systemWorkflow.edges, 'sys', 'horizontal');
    // Build = Vertical
    processEdges(buildWorkflow.edges, 'imp', 'vertical');

    setEdgePaths(newPaths);
  }, [systemWorkflow, buildWorkflow]);

  // Trigger calculation on mount, resize, and updates
  useEffect(() => {
    const timer = setTimeout(calculateEdges, 100);
    const resizeObserver = new ResizeObserver(() => calculateEdges());
    if (contentRef.current) resizeObserver.observe(contentRef.current);
    return () => {
      clearTimeout(timer);
      resizeObserver.disconnect();
    };
  }, [calculateEdges, zoom, systemColumns, buildRows]);


  // --- 3. Interaction Handlers ---
  const getRelPos = (e: React.MouseEvent) => {
    if (!contentRef.current) return { x: 0, y: 0 };
    const rect = contentRef.current.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) / zoom,
      y: (e.clientY - rect.top) / zoom
    };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 2 || activeTool === 'pan') {
      e.preventDefault();
      setIsPanning(true);
      setLastMousePos({ x: e.clientX, y: e.clientY });
      return;
    }
    if (e.button === 0 && (activeTool === 'pencil' || activeTool === 'line')) {
        const { x, y } = getRelPos(e);
        const newDrawing: Drawing = {
          id: crypto.randomUUID(),
          type: activeTool === 'pencil' ? 'freehand' : 'line',
          points: [{ x, y }],
          color: '#1e293b'
        };
        setCurrentDrawing(newDrawing);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      const dx = e.clientX - lastMousePos.x;
      const dy = e.clientY - lastMousePos.y;
      setPosition(prev => ({ x: prev.x + dx, y: prev.y + dy }));
      setLastMousePos({ x: e.clientX, y: e.clientY });
    } 
    else if (draggingNoteId) {
       const dx = (e.clientX - lastMousePos.x) / zoom;
       const dy = (e.clientY - lastMousePos.y) / zoom;
       
       const updatedNotes = (appWorkflow.stickyNotes || []).map(note => 
         note.id === draggingNoteId ? { ...note, x: note.x + dx, y: note.y + dy } : note
       );
       
       onUpdateProject({
         ...project,
         blueprint: { ...project.blueprint, appWorkflow: { ...appWorkflow, stickyNotes: updatedNotes } }
       });
       setLastMousePos({ x: e.clientX, y: e.clientY });
    }
    else if (currentDrawing) {
      const { x, y } = getRelPos(e);
      if (currentDrawing.type === 'line') {
         setCurrentDrawing({ ...currentDrawing, points: [currentDrawing.points[0], { x, y }] });
      } else {
         setCurrentDrawing({ ...currentDrawing, points: [...currentDrawing.points, { x, y }] });
      }
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setDraggingNoteId(null);
    if (currentDrawing) {
      const updatedDrawings = [...(appWorkflow.drawings || []), currentDrawing];
      onUpdateProject({
        ...project,
        blueprint: { ...project.blueprint, appWorkflow: { ...appWorkflow, drawings: updatedDrawings } }
      });
      setCurrentDrawing(null);
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(prev => Math.min(Math.max(0.1, prev * delta), 3));
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  // --- Actions ---
  const handleApplyChanges = async () => {
    if (!appWorkflow.stickyNotes || appWorkflow.stickyNotes.length === 0) return;
    setIsRefining(true);
    try {
      const updates = await refineProjectDetails(
          systemWorkflow, 
          buildWorkflow, 
          techStack, 
          appWorkflow.stickyNotes
      );

      onUpdateProject({
        ...project,
        blueprint: { 
            ...project.blueprint, 
            appWorkflow: { ...updates.systemWorkflow, stickyNotes: [], drawings: appWorkflow.drawings },
            implementationWorkflow: updates.implementationWorkflow,
            techStack: updates.techStack
        }
      });
      setTimeout(calculateEdges, 100);
    } catch (e) {
      console.error(e);
      alert("Failed to apply changes. Please try again.");
    } finally {
      setIsRefining(false);
    }
  };

  const addStickyNote = (color: StickyNote['color']) => {
    // Add note near the center of the current view
    const centerX = (-position.x + (containerRef.current?.offsetWidth || 800)/2) / zoom;
    const centerY = (-position.y + (containerRef.current?.offsetHeight || 600)/2) / zoom;
    
    const newNote: StickyNote = {
      id: crypto.randomUUID(),
      x: Math.max(0, centerX), 
      y: Math.max(0, centerY),
      content: '',
      color
    };
    const updatedNotes = [...(appWorkflow.stickyNotes || []), newNote];
    onUpdateProject({
        ...project,
        blueprint: { ...project.blueprint, appWorkflow: { ...appWorkflow, stickyNotes: updatedNotes } }
    });
  };

  const updateStickyNote = (id: string, content: string) => {
    const updatedNotes = (appWorkflow.stickyNotes || []).map(n => 
       n.id === id ? { ...n, content } : n
    );
    onUpdateProject({
        ...project,
        blueprint: { ...project.blueprint, appWorkflow: { ...appWorkflow, stickyNotes: updatedNotes } }
    });
  };

  const deleteStickyNote = (id: string) => {
    const updatedNotes = (appWorkflow.stickyNotes || []).filter(n => n.id !== id);
    onUpdateProject({
        ...project,
        blueprint: { ...project.blueprint, appWorkflow: { ...appWorkflow, stickyNotes: updatedNotes } }
    });
  }
  
  const handleNoteDragStart = (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); 
    if (activeTool === 'select' || activeTool === 'pan') {
      setDraggingNoteId(id);
      setLastMousePos({ x: e.clientX, y: e.clientY });
    }
  }

  const handleAskAi = async () => {
    if (!selectedNodeId || !aiInput.trim()) return;
    setIsAiLoading(true);
    try {
      const context = `Context: Node: ${selectedNode?.label}. Details: ${selectedNode?.details}. User Q: ${aiInput}`;
      const response = await sendMessageToProject(project.blueprint, [], context);
      const updatedNodes = appWorkflow.nodes.map(n => 
        n.id === selectedNodeId ? { 
          ...n, 
          aiSuggestions: (n.aiSuggestions ? n.aiSuggestions + '\n\n' : '') + `Q: ${aiInput}\nA: ${response}` 
        } : n
      );
      onUpdateProject({
        ...project,
        blueprint: { ...project.blueprint, appWorkflow: { ...appWorkflow, nodes: updatedNodes } }
      });
      setAiInput('');
    } catch (e) {
      console.error(e);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleUpdateNotes = (notes: string) => {
     if (!selectedNodeId) return;
     // Helper to update active node, check both workflows
     const updateInWorkflow = (wf: AppWorkflow) => {
         return wf.nodes.map(n => n.id === selectedNodeId ? { ...n, userNotes: notes } : n);
     };
     
     onUpdateProject({
        ...project,
        blueprint: { 
            ...project.blueprint, 
            appWorkflow: { ...appWorkflow, nodes: updateInWorkflow(appWorkflow) },
            implementationWorkflow: { ...buildWorkflow, nodes: updateInWorkflow(buildWorkflow) }
        }
     });
  };

  // --- Render Helper Functions ---
  const renderNode = (node: WorkflowNode) => {
    const isSelected = selectedNodeId === node.id;
    const isAction = node.type === 'action';
    const isData = node.type === 'data';
    const isUser = node.type === 'user';

    if (isAction) {
      return (
        <button
          key={node.id}
          id={`node-${node.id}`}
          onClick={(e) => { e.stopPropagation(); setSelectedNodeId(node.id); }}
          onMouseDown={(e) => e.stopPropagation()}
          className={`
            relative z-10 transition-all duration-200 group
            px-4 py-2 rounded-full border border-slate-900 bg-white
            text-xs font-bold text-slate-700
            hover:scale-105
            ${isSelected ? 'ring-2 ring-indigo-400 shadow-md' : 'shadow-sm'}
          `}
        >
          {node.label}
        </button>
      );
    }

    if (isUser) {
      return (
        <button
          key={node.id}
          id={`node-${node.id}`}
          onClick={(e) => { e.stopPropagation(); setSelectedNodeId(node.id); }}
          onMouseDown={(e) => e.stopPropagation()}
          className={`
            relative z-10 w-28 h-28 flex-shrink-0 rounded-full border-[3px] border-slate-900 bg-white 
            flex flex-col items-center justify-center p-2 text-center 
            sketch-shadow hover:sketch-shadow-hover transition-all
            ${isSelected ? 'scale-105 ring-4 ring-indigo-100' : ''}
          `}
        >
          <Icons.User className="w-6 h-6 text-indigo-600 mb-1" />
          <span className="font-bold text-slate-900 text-xs leading-tight w-full px-1">{node.label}</span>
          {node.userNotes && <div className="absolute top-1 right-1 w-3 h-3 bg-amber-400 rounded-full border border-slate-900"></div>}
        </button>
      );
    }

    return (
      <button
        key={node.id}
        id={`node-${node.id}`}
        onClick={(e) => { e.stopPropagation(); setSelectedNodeId(node.id); }}
        onMouseDown={(e) => e.stopPropagation()}
        className={`
          relative z-10 w-60 h-auto min-h-[5rem] px-5 py-4
          bg-white border-2 border-slate-900 
          text-left flex flex-col justify-center
          sketch-shadow hover:sketch-shadow-hover transition-all
          ${isData ? 'rounded-lg border-l-8 border-l-emerald-500' : 'rounded-xl'}
          ${isSelected ? 'scale-105 ring-4 ring-indigo-100' : ''}
        `}
      >
        <div className="flex items-center gap-2 mb-2">
           <span className={`text-[10px] font-bold uppercase tracking-widest ${
              isData ? 'text-emerald-700' : 'text-slate-500'
           }`}>
             {node.type}
           </span>
           {node.userNotes && <Icons.PenTool className="w-3 h-3 text-amber-500" />}
        </div>
        
        <h4 className="font-bold text-slate-900 text-sm leading-tight whitespace-normal mb-1">{node.label}</h4>
        <p className="text-[10px] text-slate-500 line-clamp-2 leading-tight">{node.details}</p>
      </button>
    );
  };

  const renderDrawings = () => {
    const allDrawings = [...(appWorkflow.drawings || [])];
    if (currentDrawing) allDrawings.push(currentDrawing);

    return allDrawings.map(d => {
       if (d.type === 'line' && d.points.length >= 2) {
         return (
           <line 
             key={d.id} 
             x1={d.points[0].x} y1={d.points[0].y} 
             x2={d.points[d.points.length-1].x} y2={d.points[d.points.length-1].y}
             stroke={d.color} strokeWidth="2" strokeDasharray="5,5"
           />
         );
       }
       const pathData = d.points.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(' ');
       return <path key={d.id} d={pathData} stroke={d.color} strokeWidth="2" fill="none" strokeLinecap="round" />;
    });
  }

  return (
    <div className="flex w-full h-full bg-slate-50 relative overflow-hidden">
      
      {/* LEFT TOOLBAR */}
      <div className="absolute left-6 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-4">
          <div className="bg-white border-2 border-slate-900 rounded-xl p-2 shadow-xl flex flex-col items-center gap-3">
              <span className="text-[10px] font-bold uppercase text-slate-400 mt-1">Tools</span>
              <button onClick={() => setActiveTool('select')} className={`p-2 rounded hover:bg-slate-100 ${activeTool === 'select' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500'}`} title="Select"><Icons.MousePointer2 className="w-5 h-5" /></button>
              <button onClick={() => setActiveTool('pan')} className={`p-2 rounded hover:bg-slate-100 ${activeTool === 'pan' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500'}`} title="Pan"><Icons.Maximize className="w-5 h-5" /></button>
              <button onClick={() => setActiveTool('pencil')} className={`p-2 rounded hover:bg-slate-100 ${activeTool === 'pencil' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500'}`} title="Pencil"><Icons.Pencil className="w-5 h-5" /></button>
              <button onClick={() => setActiveTool('line')} className={`p-2 rounded hover:bg-slate-100 ${activeTool === 'line' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500'}`} title="Line"><Icons.Line className="w-5 h-5" /></button>

              <div className="w-full h-px bg-slate-100"></div>
              <button onClick={() => addStickyNote('yellow')} className="w-6 h-6 bg-yellow-200 border border-yellow-400 rounded hover:scale-110 shadow-sm"></button>
              <button onClick={() => addStickyNote('blue')} className="w-6 h-6 bg-blue-200 border border-blue-400 rounded hover:scale-110 shadow-sm"></button>
              <button onClick={() => addStickyNote('green')} className="w-6 h-6 bg-green-200 border border-green-400 rounded hover:scale-110 shadow-sm"></button>

              <div className="w-full h-px bg-slate-100 my-1"></div>
              <button onClick={handleApplyChanges} disabled={isRefining || !appWorkflow.stickyNotes?.length} className="p-2 bg-slate-900 text-white rounded-lg hover:bg-slate-700 disabled:opacity-50 transition-colors flex flex-col items-center gap-1 w-full">
                {isRefining ? <Icons.Loader className="w-4 h-4 animate-spin" /> : <Icons.Zap className="w-4 h-4" />}
                <span className="text-[9px] font-bold">APPLY</span>
              </button>
          </div>
      </div>

      {/* Canvas Area */}
      <div 
        ref={containerRef}
        className={`flex-1 overflow-hidden bg-grid-pattern relative select-none ${isPanning || activeTool === 'pan' ? 'cursor-grabbing' : activeTool === 'select' ? 'cursor-default' : 'cursor-crosshair'}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        onContextMenu={handleContextMenu}
      >
           {/* Zoom/Pan Container */}
           <div 
             ref={contentRef}
             className="min-w-full min-h-full transition-transform duration-75 ease-out origin-top-left"
             style={{ transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})` }}
           >
              {/* SVG Arrows & Drawings Layer */}
              <svg className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-visible z-0">
                <defs>
                  <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill="#1e293b" />
                  </marker>
                </defs>
                
                {/* Workflow Edges */}
                {edgePaths.map((edge) => (
                  <g key={edge.id}>
                    <path 
                      d={edge.d}
                      stroke="#1e293b"
                      strokeWidth="2"
                      fill="none"
                      markerEnd="url(#arrowhead)"
                    />
                    {edge.label && edge.x && edge.y && (
                      <foreignObject x={edge.x - 120} y={edge.y - 30} width="240" height="60">
                         <div className="flex items-center justify-center w-full h-full p-1">
                            <span className="bg-white/95 px-3 py-1 text-[10px] font-bold text-slate-700 border border-slate-300 rounded-md shadow-sm text-center leading-snug break-words max-w-full">
                              {edge.label}
                            </span>
                         </div>
                      </foreignObject>
                    )}
                  </g>
                ))}

                {/* User Drawings */}
                {renderDrawings()}
              </svg>

              {/* TECH STACK ON CANVAS (Moved Top Left & Fixed Position) */}
              <div className="absolute top-12 left-12 w-80 bg-white border-2 border-slate-900 rounded-xl p-6 sketch-shadow z-20">
                 <h4 className="text-sm font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2 flex items-center gap-2">
                    <Icons.Code className="w-4 h-4" /> RECOMMENDED TECH STACK
                 </h4>
                 <div className="space-y-4">
                    {techStack.map((stack, idx) => (
                       <div key={idx} className="flex flex-col">
                          <span className="text-[10px] font-bold text-slate-400 uppercase mb-2">{stack.category}</span>
                          <div className="flex flex-wrap gap-2">
                             {stack.tools.map((t, i) => (
                                <span key={i} className="px-3 py-1 bg-slate-800 text-white rounded text-xs font-bold shadow-sm">
                                   {t}
                                </span>
                             ))}
                          </div>
                       </div>
                    ))}
                 </div>
              </div>

              {/* DUAL WORKFLOW LAYOUT */}
              {/* Added padding and left margin to clear the tech stack */}
              <div className="flex flex-col gap-48 p-20 pl-[420px] pt-12 z-10 w-max">
                 
                 {/* 1. SYSTEM ARCHITECTURE (Horizontal) */}
                 <div>
                    <h2 className="text-5xl font-bold text-slate-900 mb-16 ml-4 flex items-center gap-4 tracking-tight">
                       <span className="flex items-center justify-center w-12 h-12 rounded-full bg-slate-900 text-white text-xl">1</span>
                       How the project will work?
                    </h2>
                    <div className="flex flex-row items-center gap-64">
                      {systemColumns.map((colNodes, colIndex) => (
                        <div key={`sys-col-${colIndex}`} className="flex flex-col gap-32 items-center justify-center">
                          {colNodes.map(node => renderNode(node))}
                        </div>
                      ))}
                    </div>
                 </div>

                 {/* Divider */}
                 <div className="w-full h-px bg-slate-300 my-12"></div>

                 {/* 2. IMPLEMENTATION GUIDE (Vertical) */}
                 <div>
                    <h2 className="text-5xl font-bold text-slate-900 mb-16 ml-4 flex items-center gap-4 tracking-tight">
                       <span className="flex items-center justify-center w-12 h-12 rounded-full bg-slate-900 text-white text-xl">2</span>
                       How to build this project?
                    </h2>
                     {/* Changed from flex-row to flex-col for Vertical Layout */}
                     <div className="flex flex-col items-center gap-32">
                      {buildRows.map((rowNodes, rowIndex) => (
                        <div key={`build-row-${rowIndex}`} className="flex flex-row gap-64 items-center justify-center">
                          {rowNodes.map(node => renderNode(node))}
                        </div>
                      ))}
                    </div>
                 </div>

              </div>

              {/* Sticky Notes Layer */}
              {(appWorkflow.stickyNotes || []).map(note => (
                <div
                   key={note.id}
                   className={`absolute w-40 p-3 shadow-md border rounded-sm flex flex-col z-50 cursor-move
                     ${note.color === 'yellow' ? 'bg-yellow-100 border-yellow-200' : 
                       note.color === 'blue' ? 'bg-blue-100 border-blue-200' :
                       note.color === 'green' ? 'bg-green-100 border-green-200' : 
                       'bg-pink-100 border-pink-200'}
                   `}
                   style={{ left: note.x, top: note.y }}
                   onMouseDown={(e) => handleNoteDragStart(e, note.id)}
                >
                   <div className="flex justify-between items-center mb-1 border-b border-black/5 pb-1 handle">
                      <span className="text-[10px] font-bold uppercase text-black/40">Note</span>
                      <button onClick={(e) => {e.stopPropagation(); deleteStickyNote(note.id)}} className="text-black/30 hover:text-red-500">
                        <Icons.Close className="w-3 h-3" />
                      </button>
                   </div>
                   <textarea
                     value={note.content}
                     onChange={(e) => updateStickyNote(note.id, e.target.value)}
                     placeholder="Type feedback..."
                     className="bg-transparent border-none p-0 text-xs font-medium text-slate-800 focus:ring-0 resize-none min-h-[60px]"
                     onMouseDown={(e) => e.stopPropagation()}
                   />
                </div>
              ))}
           </div>
      </div>

      {/* Side Detail Panel */}
      <div className={`
        w-80 bg-white border-l-2 border-slate-900 z-30 transition-transform duration-300 flex flex-col absolute top-0 right-0 h-full shadow-2xl pt-20
        ${selectedNodeId ? 'translate-x-0' : 'translate-x-full'}
      `}>
           {selectedNode && (
             <>
               <div className="p-6 border-b-2 border-slate-100 flex items-start justify-between bg-slate-50">
                 <div>
                   <h3 className="text-lg font-bold text-slate-900">{selectedNode.label}</h3>
                   <span className="text-xs font-mono text-slate-500 mt-1 block uppercase">{selectedNode.type}</span>
                 </div>
                 <button onClick={() => setSelectedNodeId(null)} className="text-slate-400 hover:text-slate-900">
                   <Icons.Close className="w-6 h-6" />
                 </button>
               </div>

               <div className="flex-1 overflow-y-auto p-6 space-y-6">
                 <div className="prose prose-sm">
                   <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Description</h4>
                   <p className="text-slate-800 leading-relaxed text-sm">{selectedNode.details}</p>
                 </div>

                 <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                    <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-2 flex items-center gap-2">
                       <Icons.PenTool className="w-3 h-3" /> Notes
                    </h4>
                    <textarea 
                      value={selectedNode.userNotes || ''}
                      onChange={(e) => handleUpdateNotes(e.target.value)}
                      placeholder="Add notes..."
                      className="w-full bg-transparent border-none p-0 text-sm text-slate-800 focus:ring-0 resize-none min-h-[60px]"
                    />
                 </div>

                 <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
                    <h4 className="text-xs font-bold text-indigo-800 uppercase tracking-wider mb-3">AI Assistant</h4>
                    {selectedNode.aiSuggestions && (
                      <div className="mb-4 bg-white/50 rounded p-3 text-xs text-slate-700 whitespace-pre-wrap border border-indigo-100">
                        {selectedNode.aiSuggestions}
                      </div>
                    )}
                    <div className="flex gap-2">
                       <input
                         type="text"
                         value={aiInput}
                         onChange={(e) => setAiInput(e.target.value)}
                         placeholder="Refine this step..."
                         className="flex-1 text-xs border border-slate-200 rounded px-3 py-2"
                         onKeyDown={(e) => e.key === 'Enter' && handleAskAi()}
                       />
                       <button 
                         onClick={handleAskAi}
                         disabled={isAiLoading || !aiInput.trim()}
                         className="p-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                       >
                         {isAiLoading ? <Icons.Loader className="w-3 h-3 animate-spin" /> : <Icons.Send className="w-3 h-3" />}
                       </button>
                    </div>
                 </div>
               </div>
             </>
           )}
      </div>
    </div>
  );
};
