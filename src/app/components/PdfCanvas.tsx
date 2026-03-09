'use client';

import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { useDroppable } from '@dnd-kit/core';
import { usePdfStore } from '../../../store/usePdfStore'; 


pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;


interface PdfCanvasProps {
  file: File;
}

export default function PdfCanvas({ file }: PdfCanvasProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  
  const { variables } = usePdfStore();

  
  const { setNodeRef, isOver } = useDroppable({
    id: `pdf-canvas-droppable-page-${currentPage}`,
  });

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setCurrentPage(1);
  };


  const currentPageVariables = variables.filter((v) => v.page === currentPage);

  return (
    <div className="flex flex-col items-center h-full w-full">
      
      <div className="flex items-center gap-4 mb-4 p-2 bg-white rounded-md shadow-sm border border-gray-200">
        <button
          disabled={currentPage <= 1}
          onClick={() => setCurrentPage((prev) => prev - 1)}
          className="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50"
        >
          Previous
        </button>
        <span className="text-sm font-medium text-gray-700">
          Page {currentPage} of {numPages || '--'}
        </span>
        <button
          disabled={numPages === null || currentPage >= numPages}
          onClick={() => setCurrentPage((prev) => prev + 1)}
          className="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50"
        >
          Next
        </button>
      </div>

      {/* Droppable Canvas Area */}
      <div 
        ref={setNodeRef}
        className={`relative shadow-xl transition-all ${isOver ? 'ring-4 ring-blue-400 ring-opacity-50' : 'ring-1 ring-gray-300'}`}
        style={{ width: 'fit-content' }}
      >
        <Document
          file={file}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={<div className="p-20 text-gray-500">Loading PDF...</div>}
        >
          <Page 
            pageNumber={currentPage} 
            renderTextLayer={false} 
            renderAnnotationLayer={false}
            className="bg-white"
          />
        </Document>

        
        {currentPageVariables.map((variable) => (
          <div
            key={variable.id}
            className="absolute z-10 p-1 bg-blue-100/80 border border-blue-500 text-blue-900 text-xs font-bold rounded shadow-sm backdrop-blur-sm transform -translate-x-1/2 -translate-y-1/2"
            style={{
              left: `${variable.x}%`,
              top: `${variable.y}%`,
            }}
          >
            {variable.key}
          </div>
        ))}
      </div>
    </div>
  );
}