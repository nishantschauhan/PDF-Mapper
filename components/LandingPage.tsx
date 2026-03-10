'use client';

import { FileText, Upload, Layers, Move, Download } from 'lucide-react';
import { useCallback } from 'react';

interface LandingPageProps {
  onFileUpload: (file: File) => void;
}

export default function LandingPage({ onFileUpload }: LandingPageProps) {
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type === 'application/pdf') {
      onFileUpload(file);
    }
  }, [onFileUpload]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFileUpload(file);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0B0D14] text-white p-6 font-sans">
      
      {/* Header */}
      <div className="flex flex-col items-center mb-10">
        <div className="w-12 h-12 bg-[#1C1F2E] rounded-xl flex items-center justify-center mb-6 shadow-lg border border-[#2A2D3A]">
          <FileText className="text-blue-500" size={24} />
        </div>
        <h1 className="text-3xl font-bold mb-2 tracking-tight">PDF Variable Mapper</h1>
        <p className="text-gray-400 text-sm">Upload a PDF, drag variable fields onto it, and export a JSON schema.</p>
      </div>

      <div 
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className="relative w-full max-w-2xl border-2 border-dashed border-[#2A2D3A] 
        rounded-2xl bg-[#12141C] hover:bg-[#161923] transition-colors p-16 flex flex-col 
        items-center justify-center cursor-pointer mb-8 group overflow-hidden"
      >
        <Upload className="text-gray-500 mb-4 group-hover:text-blue-400 transition-colors" size={32} />
        <p className="text-lg font-medium mb-2">Drop your PDF here, or click to browse</p>
        <p className="text-gray-500 text-sm">Supports multi-page PDF documents</p>
        
        
        <input 
          type="file" 
          accept="application/pdf" 
          onChange={handleFileChange} 
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
        />
      </div>

      {/* Feature Cards */}
      <div className="flex gap-4 w-full max-w-2xl">
        <FeatureCard icon={<Layers size={20} />} text="Multi-page support" />
        <FeatureCard icon={<Move size={20} />} text="Drag & drop fields" />
        <FeatureCard icon={<Download size={20} />} text="Export JSON schema" />
      </div>
    </div>
  );
}

function FeatureCard({ icon, text }: { icon: React.ReactNode, text: string }) {
  return (
    <div className="flex-1 bg-[#12141C] border border-[#2A2D3A] rounded-xl p-4 flex flex-col items-center justify-center text-center hover:border-gray-600 transition-colors">
      <div className="text-gray-400 mb-2">{icon}</div>
      <span className="text-sm font-medium text-gray-300">{text}</span>
    </div>
  );
}