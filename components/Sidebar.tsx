'use client';

import { useDraggable } from '@dnd-kit/core';
import { usePdfStore } from '../store/usePdfStore'; 
import { useState } from 'react';

// Draggable item component
function DraggableVariable() {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: 'new-variable-drag',
    data: { type: 'new-variable' }
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="p-3 mb-4 bg-white border border-gray-300 rounded shadow-sm cursor-grab active:cursor-grabbing text-center font-medium text-sm text-gray-700 hover:border-blue-500 transition"
    >
      ⠿ Drag New Variable
    </div>
  );
}

export default function Sidebar({ docId, pdfFile }: { docId: string, pdfFile: File | null }) {
  const { variables, undo, redo, history, future, deleteVariable, updateVariable } = usePdfStore();
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (!pdfFile) return alert('Please upload a PDF first.');
    setIsExporting(true);

    try {
      // 1. Convert PDF to Base64 for our in-memory backend
      const arrayBuffer = await pdfFile.arrayBuffer();
      const base64String = Buffer.from(arrayBuffer).toString('base64');

     
      const saveRes = await fetch('/api/document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          docId,
          pdfBuffer: base64String,
          schema: { documentName: pdfFile.name, variables }
        })
      });

      if (!saveRes.ok) throw new Error('Failed to save to server');

      const fetchRes = await fetch(`/api/document?docId=${docId}`);
      const exportData = await fetchRes.json();

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${pdfFile.name}-schema.json`;
      a.click();
      URL.revokeObjectURL(url);

    } catch (error) {
      console.error(error);
      alert('Export failed. Check console for details.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <aside className="w-80 bg-white border-l border-gray-200 flex flex-col h-full shadow-lg z-10">
      <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
        <h2 className="font-semibold text-gray-800">Mapper Controls</h2>
        <div className="flex gap-2">
          <button 
            onClick={undo} 
            disabled={history.length === 0}
            className="px-2 py-1 text-xs bg-gray-200 rounded disabled:opacity-50 hover:bg-gray-300"
          >
            Undo
          </button>
          <button 
            onClick={redo} 
            disabled={future.length === 0}
            className="px-2 py-1 text-xs bg-gray-200 rounded disabled:opacity-50 hover:bg-gray-300"
          >
            Redo
          </button>
        </div>
      </div>

      <div className="p-4 border-b border-gray-200">
        <DraggableVariable />
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Placed Variables</h3>
        {variables.length === 0 && (
          <p className="text-sm text-gray-400 italic">No variables placed yet.</p>
        )}
        <div className="flex flex-col gap-3">
          {variables.map((v) => (
            <div key={v.id} className="p-3 border border-gray-100 bg-gray-50 rounded-md text-sm">
              <div className="flex justify-between mb-2">
                <input 
                  type="text" 
                  value={v.key}
                  onChange={(e) => updateVariable(v.id, { key: e.target.value })}
                  className="w-full mr-2 px-1 py-0.5 border border-gray-300 rounded text-xs focus:outline-none focus:border-blue-500"
                  placeholder="Variable Key"
                />
                <button onClick={() => deleteVariable(v.id)} className="text-red-500 hover:text-red-700">✕</button>
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>Page: {v.page}</span>
                <span>[ {Math.round(v.x)}%, {Math.round(v.y)}% ]</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <button 
          onClick={handleExport}
          disabled={isExporting || !pdfFile}
          className="w-full py-2 bg-black text-white rounded font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {isExporting ? 'Processing...' : 'Export JSON Schema'}
        </button>
      </div>
    </aside>
  );
}