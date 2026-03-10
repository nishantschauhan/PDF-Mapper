'use client';

import { Document, Page, pdfjs } from 'react-pdf';
import { useDroppable, useDraggable } from '@dnd-kit/core';
import { usePdfStore } from '../store/usePdfStore'; 
import { VariablePlacement } from '../lib/schema'; 
import { useState, useEffect } from 'react';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PdfCanvasProps {
  file: File;
  currentPage: number;
  setNumPages: (num: number) => void;
}

function DraggablePlacedVariable({ variable, isSelected }: { variable: VariablePlacement, isSelected: boolean }) {
  const { setSelectedVariable, updateVariable } = usePdfStore();
  
 
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(variable.key);

  
  useEffect(() => {
    setEditValue(variable.key);
  }, [variable.key]);

  
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: `placed-var-${variable.id}`,
    data: { type: 'existing-variable', variable },
    disabled: isEditing, 
  });

  const handleSave = () => {
    if (editValue.trim() && editValue !== variable.key) {
      updateVariable(variable.id, { key: editValue.trim() });
    } else {
      setEditValue(variable.key); 
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') {
      setEditValue(variable.key);
      setIsEditing(false);
    }
    
    e.stopPropagation(); 
  };

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: isSelected ? 50 : 10,
  } : { zIndex: isSelected ? 50 : 10 };

  const colorMap: Record<string, string> = {
    text: 'bg-blue-500/20 border-blue-500 text-blue-300',
    number: 'bg-green-500/20 border-green-500 text-green-300',
    date: 'bg-yellow-500/20 border-yellow-500 text-yellow-300',
    signature: 'bg-purple-500/20 border-purple-500 text-purple-300',
    checkbox: 'bg-pink-500/20 border-pink-500 text-pink-300',
  };

  const themeClasses = colorMap[variable.type] || colorMap.text;
  const selectedClasses = isSelected ? 'ring-2 ring-white ring-offset-2 ring-offset-[#0B0D14] shadow-lg' : '';

  return (
    <div
      ref={setNodeRef}
      style={{ left: `${variable.x}%`, top: `${variable.y}%`, ...style }}
      // Only attach drag listeners if we are NOT editing
      {...(!isEditing ? listeners : {})}
      {...attributes}
      className={`absolute px-2 py-1 border backdrop-blur-md text-xs font-semibold rounded shadow-sm transform -translate-x-1/2 -translate-y-1/2 transition-all ${themeClasses} ${selectedClasses} ${isEditing ? 'cursor-text' : 'cursor-grab active:cursor-grabbing'}`}
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
      {isEditing ? (
        <input
          type="text"
          autoFocus
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleSave} 
          onKeyDown={handleKeyDown} 
          className="bg-transparent border-none outline-none text-center text-white"
          style={{ width: `${Math.max(editValue.length, 3)}ch` }} 
        />
      ) : (
        variable.key
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