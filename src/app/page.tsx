'use client';

import { useState } from 'react';
import { DndContext, DragEndEvent, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import Sidebar from './components/Sidebar';
import PdfCanvas from './components/PdfCanvas';
import { usePdfStore } from '../../store/usePdfStore'; 
import { v4 as uuidv4 } from 'uuid';

export default function PdfMapperPage() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const addVariable = usePdfStore((state) => state.addVariable);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    // Check if it was dropped over our dynamic canvas ID
    if (over && over.id.toString().startsWith('pdf-canvas-droppable-page-')) {
      
      // Extract the page number from the droppable ID
      const targetPage = parseInt(over.id.toString().replace('pdf-canvas-droppable-page-', ''), 10);
      
      const canvasRect = over.rect;
      const dropX = event.active.rect.current.translated?.left || 0;
      const dropY = event.active.rect.current.translated?.top || 0;

      const xPercent = ((dropX - canvasRect.left) / canvasRect.width) * 100;
      const yPercent = ((dropY - canvasRect.top) / canvasRect.height) * 100;

      const boundedX = Math.max(0, Math.min(xPercent, 100));
      const boundedY = Math.max(0, Math.min(yPercent, 100));

      const newId = uuidv4();
      
  
      addVariable({
        id: newId,
        key: `var_${newId.slice(0, 4)}`,
        type: 'text',
        page: targetPage, 
        x: boundedX,
        y: boundedY,
      });
    }
  };

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <main className="flex h-screen w-full bg-gray-50 overflow-hidden">
       
        <div className="flex-1 flex flex-col relative overflow-auto p-8">
          {!pdfFile ? (
            <div className="flex items-center justify-center h-full border-2 border-dashed border-gray-300 rounded-lg bg-white">
              <label className="cursor-pointer flex flex-col items-center p-12">
                <span className="text-gray-600 font-medium mb-2">Upload a PDF to start mapping</span>
                <input 
                  type="file" 
                  accept="application/pdf" 
                  className="hidden" 
                  onChange={(e) => setPdfFile(e.target.files?.[0] || null)} 
                />
                <span className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
                  Select File
                </span>
              </label>
            </div>
          ) : (
            <PdfCanvas file={pdfFile} />
          )}
        </div>

     
        <Sidebar docId="default-doc" pdfFile={pdfFile} />
      </main>
    </DndContext>
  );
}