'use client';

import { useState } from 'react';
import { DndContext, DragEndEvent, useSensor, useSensors, PointerSensor, DragOverlay,DragStartEvent } from '@dnd-kit/core';
import { usePdfStore } from '../../store/usePdfStore'; 
import { v4 as uuidv4 } from 'uuid';
import LandingPage from '../../components/LandingPage';
import { VariableType } from '../../lib/schema';
import Workspace from '../../components/Workspace';


export default function AppRouter() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [activeDragData, setActiveDragData] = useState<any>(null);
  
  const addVariable = usePdfStore((state) => state.addVariable);
  const updateVariable = usePdfStore((state) => state.updateVariable);
  const setSelectedVariable = usePdfStore((state) => state.setSelectedVariable);
  const handleNewDocument = () => {
    setPdfFile(null);
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragData(event.active.data.current);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDragData(null);
    const { active, over } = event;


    
    if (!over && active.data.current?.type === 'existing-variable') {
      setSelectedVariable(active.data.current.variable.id);
      return;
    }

    if (over && over.id.toString().startsWith('pdf-canvas-droppable-page-')) {
      const targetPage = parseInt(over.id.toString().replace('pdf-canvas-droppable-page-', ''), 10);
      
      const canvasRect = over.rect;
      const dropX = event.active.rect.current.translated?.left || 0;
      const dropY = event.active.rect.current.translated?.top || 0;

      
      const xPercent = Math.max(0, Math.min(((dropX - canvasRect.left) / canvasRect.width) * 100, 100));
      const yPercent = Math.max(0, Math.min(((dropY - canvasRect.top) / canvasRect.height) * 100, 100));

      const activeData = active.data.current;

      if (activeData?.type === 'new-variable') {
        
        const newId = uuidv4();
        addVariable({
          id: newId,
          key: `${activeData.fieldType}_${newId.slice(0, 4)}`,
          type: activeData.fieldType as VariableType,
          page: targetPage,
          x: xPercent,
          y: yPercent,
        });
        setSelectedVariable(newId);
      } 
      else if (activeData?.type === 'existing-variable') {
        updateVariable(activeData.variable.id, {
          x: xPercent,
          y: yPercent,
          page: targetPage,
        });
        setSelectedVariable(activeData.variable.id);
      }
    }
  };

  if (!pdfFile) {
    return <LandingPage onFileUpload={setPdfFile} />;
  }

  return (
    <DndContext sensors={sensors} 
    onDragStart={handleDragStart}
    onDragEnd={handleDragEnd}>
      <Workspace file={pdfFile} onNewDocument={handleNewDocument}/>
      <DragOverlay dropAnimation={null}>
        {activeDragData?.type === 'new-variable' ? (
          <div className="px-4 py-2 bg-[#1C1F2E] border border-gray-500 rounded-lg text-gray-300 text-sm font-medium shadow-2xl opacity-90 backdrop-blur-sm cursor-grabbing">
            Dragging {activeDragData.fieldType}...
          </div>
        ) : activeDragData?.type === 'existing-variable' ? (
          <div className="px-2 py-1 bg-blue-500/30 border border-blue-400 text-blue-200 text-xs font-bold rounded shadow-2xl backdrop-blur-md cursor-grabbing">
            {activeDragData.variable.key}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}