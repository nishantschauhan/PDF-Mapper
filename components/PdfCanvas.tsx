'use client';

import { Document, Page, pdfjs } from 'react-pdf';
import { useDroppable, useDraggable } from '@dnd-kit/core';
import { usePdfStore } from '../store/usePdfStore'; 
import { VariablePlacement } from '../lib/schema'; 
import React, { useState, useEffect } from 'react';
import { Type, Hash, Calendar, PenTool,CheckSquare, Signature } from 'lucide-react';


pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PdfCanvasProps {
  file: File;
  currentPage: number;
  setNumPages: (num: number) => void;
}

function DraggablePlacedVariable({ variable, isSelected }: { variable: VariablePlacement, isSelected: boolean }) {
  const {variables, setSelectedVariable, updateVariable } = usePdfStore();
  
 
  const [isEditing, setIsEditing] = useState(false);
  const [widthTracker, setWidthTracker] = useState(variable.key);

  const[error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    setWidthTracker(variable.key);
  }, [variable.key]);

  
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: `placed-var-${variable.id}`,
    data: { type: 'existing-variable', variable },
    disabled: isEditing, 
  });

  const handleSave = () => {
    const val = widthTracker.trim();

   if (val === variable.key) {
      setIsEditing(false);
      setError(null);
      return;
    }

    if (!val) {
      setError("Key cannot be empty");
      return;
    }

    const isDuplicate = variables.some(v => v.key=== val && v.id !== variable.id);
    if(isDuplicate){
      setError("Key must be unqiure");
      return;
    }
    updateVariable(variable.id, {key:val});
    setIsEditing(false);
    setError(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if(e.key === 'Enter'){
     handleSave();
    }
    if(e.key === 'Escape'){
      setIsEditing(false);
      setError(null);
    }
    e.stopPropagation();
  };

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: isSelected ? 50 : 10,
  } : { zIndex: isSelected ? 50 : 10 };

  const colorMap: Record<string, string> = {
    text: ' border-black text-black',
    number: ' border-black text-black',
    date: ' border-black text-black',
    signature: 'border-black text-black',
    checkbox: ' border-black text-black',
  };

  const IconMap: Record<string, React.ElementType> ={
    text: Type,
    number: Hash,
    date: Calendar,
    Signature: PenTool,
    checkbox: CheckSquare,
  }

  const themeClasses = colorMap[variable.type] || colorMap.text;
  const selectedClasses = isSelected ? 'ring-2 ring-white ring-offset-2 ring-offset-[#0B0D14] shadow-lg' : '';
  const FieldIcon = IconMap[variable.type] || Type;

  return (
    <div
      ref={setNodeRef}
      style={{ left: `${variable.x}%`, top: `${variable.y}%`, ...style }}
      {...(!isEditing ? listeners : {})}
      {...attributes}
      className={`absolute flex items-center gap-1.5 px-2 py-1 border backdrop-blur-md text-xs font-semibold rounded shadow-sm transform -translate-x-1/2 -translate-y-1/2 transition-all ${themeClasses} ${selectedClasses} ${isEditing ? 'cursor-text' : 'cursor-grab active:cursor-grabbing'} `}
      onClick={(e) => {
        e.stopPropagation(); 
        if (!isEditing) setSelectedVariable(variable.id); 
      }}
      onDoubleClick={(e) => {
        e.stopPropagation();
        setSelectedVariable(variable.id);
        setIsEditing(true); 
      }}
    >
      {!isEditing && <FieldIcon size={12} className="opacity-80 shrink-0" />}

      {isEditing ? (
        <input
          type="text"
          autoFocus
          defaultValue={variable.key}
          onChange={(e) => setWidthTracker(e.target.value)}
          onBlur={(e) => handleSave(e.target.value)} 
          onKeyDown={handleKeyDown} 
          className="bg-transparent border-none outline-none text-center text-black"
          style={{ width: `${Math.max(widthTracker.length, 3)}ch` }} 
        />
      ) : (
        <span className="whitespace-nowrap">{variable.key}</span>
      )}
      {error && (
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-red-600 text-white text-[10px] px-2 py-1 rounded shadow-xl whitespace-nowrap pointer-events-none z-50">
          {error}
          <div className="absolue -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-red-600 rotate-45"></div>
        </div>
      )}
    </div>
  );
}

// 2. Main Canvas Component
export default function PdfCanvas({ file, currentPage, setNumPages }: PdfCanvasProps) {
  const { variables, selectedVariableId } = usePdfStore();

  
  const { setNodeRef, isOver } = useDroppable({
    id: `pdf-canvas-droppable-page-${currentPage}`,
  });

  const currentPageVariables = variables.filter((v) => v.page === currentPage);

  return (
    <div 
      ref={setNodeRef}
      className={`relative shadow-2xl transition-all ${isOver ? 'ring-2 ring-blue-500/50' : 'ring-1 ring-[#2A2D3A]'}`}
      style={{ width: 'fit-content' }}
    >
      <Document
        file={file}
        onLoadSuccess={({ numPages }) => setNumPages(numPages)}
        loading={<div className="p-20 text-gray-500 text-sm">Loading PDF Engine...</div>}
      >
        <Page 
          pageNumber={currentPage} 
          renderTextLayer={false} 
          renderAnnotationLayer={false}
          className="bg-white"
          width={800} 
        />
      </Document>

      {/* Render the movable variables as an overlay on top of the PDF */}
      {currentPageVariables.map((variable) => (
        <DraggablePlacedVariable 
          key={variable.id} 
          variable={variable} 
          isSelected={selectedVariableId === variable.id}
        />
      ))}
    </div>
  );
}