'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useDraggable } from '@dnd-kit/core';
import { Type, Hash, Calendar, PenTool, CheckSquare, ChevronLeft, ChevronRight, Download, FileText, Plus, Trash2, Undo, Redo} from 'lucide-react';
import { usePdfStore } from '../store/usePdfStore'; 
import { TemplateExportSchema } from '@/lib/schema'; 

// Dynamically import the canvas to avoid SSR Node.js errors with react-pdf
const PdfCanvas = dynamic(() => import('@/components/PdfCanvas'), { ssr: false });

const FIELD_TYPES = [
  { type: 'text', label: 'Text', desc: 'Single-line text', icon: Type, color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20' },
  { type: 'number', label: 'Number', desc: 'Numeric value', icon: Hash, color: 'text-green-400', bg: 'bg-green-400/10', border: 'border-green-400/20' },
  { type: 'date', label: 'Date', desc: 'Date picker', icon: Calendar, color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/20' },
  { type: 'signature', label: 'Signature', desc: 'Signature field', icon: PenTool, color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/20' },
  { type: 'checkbox', label: 'Checkbox', desc: 'Boolean toggle', icon: CheckSquare, color: 'text-pink-400', bg: 'bg-pink-400/10', border: 'border-pink-400/20' },
];

// 1. Draggable Field Component for Left Sidebar
function DraggableFieldCard({ field }: { field: typeof FIELD_TYPES[0] }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: `new-field-${field.type}`,
    data: { type: 'new-variable', fieldType: field.type }
  });

  const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`, zIndex: 100 } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`flex items-center p-3 mb-3 rounded-xl border ${field.border} ${field.bg} cursor-grab active:cursor-grabbing hover:bg-opacity-80 transition`}
    >
      <div className={`mr-3 ${field.color}`}><field.icon size={20} /></div>
      <div>
        <p className={`text-sm font-medium ${field.color}`}>{field.label}</p>
        <p className="text-xs text-gray-400">{field.desc}</p>
      </div>
    </div>
  );
}

export default function Workspace({ file, onNewDocument }: { file: File, onNewDocument: () => void }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [numPages, setNumPages] = useState<number | null>(null);
  
  const { 
    variables, 
    selectedVariableId, 
    updateVariable, 
    deleteVariable, 
    setSelectedVariable, 
    reset,
    undo,
    redo,
    history,
    future
  } = usePdfStore();
  const selectedVar = variables.find(v => v.id === selectedVariableId);

  useEffect(() =>{
    const handleKeyDown = (e: KeyboardEvent) =>{
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement){
        return;
      }

      if((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z'){
        e.preventDefault();
        if(e.shiftKey){
          redo();
        }else{
          undo();
        }
        return;
      }

      if((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y'){
        e.preventDefault();
        redo();
        return;
      }

      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedVariableId){
        deleteVariable(selectedVariableId);
        setSelectedVariable(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedVariableId, deleteVariable, setSelectedVariable, undo, redo]);

  const handleExport = () => {
    try{
      const payload = {
        documentName: file.name,
        variables: variables,
      };
      
      const validatedData = TemplateExportSchema.parse(payload);
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(validatedData, null, 2));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", `schema_${file.name}.json`);
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
    }catch(error: any ){
    alert("validation Error: Cannot export invalid schema. Check the console for details.")
    }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-[#0B0D14] text-white font-sans overflow-hidden">
      
      {/* Top Bar */}
      <header className="h-14 border-b border-[#2A2D3A] bg-[#12141C] flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-[#1C1F2E] px-3 py-1.5 rounded-lg border border-[#2A2D3A]">
            <FileText size={16} className="text-blue-400" />
            <span className="text-sm font-medium truncate max-w-[200px]">{file.name}</span>
          </div>
        </div>

        {/* Page Switcher */}
        <div className="flex items-center gap-3 bg-[#0B0D14] px-2 py-1 rounded-lg border border-[#2A2D3A]">
          <button 
            disabled={currentPage <= 1} 
            onClick={() => setCurrentPage(p => p - 1)}
            className="p-1 hover:bg-[#2A2D3A] rounded disabled:opacity-30"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-xs text-gray-400">Page <span className="text-white">{currentPage}</span> of {numPages || '-'}</span>
          <button 
            disabled={numPages === null || currentPage >= numPages} 
            onClick={() => setCurrentPage(p => p + 1)}
            className="p-1 hover:bg-[#2A2D3A] rounded disabled:opacity-30"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-3">
          
          {/* Undo & Redo Controls */}
          <div className="flex items-center gap-1 border-r border-[#2A2D3A] pr-3 mr-1">
            <button 
              onClick={undo}
              disabled={history.length === 0}
              title="Undo"
              className="p-1.5 text-gray-400 hover:text-white hover:bg-[#1C1F2E] rounded transition disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Undo size={18} />
            </button>
            <button 
              onClick={redo}
              disabled={future.length === 0}
              title="Redo"
              className="p-1.5 text-gray-400 hover:text-white hover:bg-[#1C1F2E] rounded transition disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Redo size={18} />
            </button>
          </div>

          {/* Existing New and Export Buttons */}
          <button 
            onClick={() => {
              reset();
              onNewDocument();
            }}
            className="flex items-center gap-2 text-sm px-4 py-1.5 border border-[#2A2D3A] rounded-lg hover:bg-[#1C1F2E] transition"
          >
            <Plus size={16} /> New
          </button>
          <button onClick={handleExport} className="flex items-center gap-2 text-sm px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition shadow-lg shadow-blue-900/20">
            <Download size={16} /> Export JSON
          </button>
        </div>

       
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar: Field Types */}
        <aside className="w-64 border-r border-[#2A2D3A] bg-[#12141C] p-4 flex flex-col shrink-0 overflow-y-auto">
          <h2 className="text-xs font-bold text-gray-500 tracking-wider mb-4">FIELD TYPES</h2>
          <p className="text-xs text-gray-400 mb-4">Drag onto the PDF canvas</p>
          {FIELD_TYPES.map(field => (
            <DraggableFieldCard key={field.type} field={field} />
          ))}
        </aside>

        {/* Center: PDF Canvas */}
        <main className="flex-1 bg-[#0B0D14] overflow-auto relative flex justify-center p-8" onClick={() => setSelectedVariable(null)}>
          <div onClick={(e) => e.stopPropagation()}>
            <PdfCanvas 
              file={file} 
              currentPage={currentPage} 
              setNumPages={setNumPages} 
            />
          </div>
        </main>

        {/* Right Sidebar: Inspector */}
        <aside className="w-80 border-l border-[#2A2D3A] bg-[#12141C] flex flex-col shrink-0">
          <div className="p-4 border-b border-[#2A2D3A]">
            <h2 className="text-xs font-bold text-gray-500 tracking-wider mb-4">INSPECTOR</h2>
            
            {!selectedVar ? (
              <div className="text-center py-8 text-sm text-gray-500">
                Select a variable on the canvas to edit it
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Variable Key</label>
                  <input 
                    type="text" 
                    value={selectedVar.key}
                    onChange={(e) => updateVariable(selectedVar.id, { key: e.target.value })}
                    className="w-full bg-[#1C1F2E] border border-[#2A2D3A] rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Type</label>
                  <div className="w-full bg-[#1C1F2E] border border-[#2A2D3A] rounded px-3 py-2 text-sm text-gray-300 capitalize">
                    {selectedVar.type}
                  </div>
                </div>
                <button 
                  onClick={() => { deleteVariable(selectedVar.id); setSelectedVariable(null); }}
                  className="w-full flex justify-center items-center gap-2 py-2 mt-4 text-sm text-red-400 border border-red-900/50 bg-red-950/20 hover:bg-red-900/40 rounded transition"
                >
                  <Trash2 size={16} /> Delete Field
                </button>
              </div>
            )}
          </div>

          <div className="p-4 flex-1 overflow-y-auto">
             <h2 className="text-xs font-bold text-gray-500 tracking-wider mb-4">ALL VARIABLES ({variables.length})</h2>
             {variables.length === 0 ? (
               <p className="text-center text-sm text-gray-600 mt-4">No variables placed yet.</p>
             ) : (
               <div className="flex flex-col gap-2">
                 {variables.map(v => (
                   <div 
                    key={v.id} 
                    onClick={() => setSelectedVariable(v.id)}
                    className={`p-2 text-sm border rounded cursor-pointer transition ${selectedVariableId === v.id ? 'bg-[#1C1F2E] border-blue-500/50 text-blue-400' : 'bg-[#12141C] border-[#2A2D3A] text-gray-400 hover:border-gray-500'}`}
                   >
                     {v.key} <span className="text-xs opacity-50 block">Page {v.page}</span>
                   </div>
                 ))}
               </div>
             )}
          </div>
        </aside>
      </div>
    </div>
  );
}