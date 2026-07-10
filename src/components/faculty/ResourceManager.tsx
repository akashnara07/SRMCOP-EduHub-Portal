import React, { useState, useRef } from 'react';
import { ArrowLeft, Plus, MoveUp, MoveDown, Trash2, Video, FileText, Award, HelpCircle, Layers, Check, Upload, FileSpreadsheet, X, Loader2, CheckCircle2 } from 'lucide-react';
import GlassCard from '../GlassCard';
import { Subject, Resource } from '../../types';

interface ResourceManagerProps {
  subject: Subject;
  onBack: () => void;
  onSaveResources: (updated: Resource[]) => void;
}

export default function ResourceManager({
  subject,
  onBack,
  onSaveResources,
}: ResourceManagerProps) {
  const [resources, setResources] = useState<Resource[]>([...subject.resources]);
  
  // New Resource Form States
  const [newType, setNewType] = useState<Resource['type']>('Video');
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newMeta, setNewMeta] = useState(''); // duration or size

  // File Upload states
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<{ name: string; sizeStr: string; type: string } | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Append new resource
  const handleAddResource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const added: Resource = {
      id: `res-added-${Date.now()}`,
      type: newType,
      title: newTitle.trim(),
      description: newDesc.trim() || `Comprehensive curricular ${newType.toLowerCase()} content drafted by Department HOD.`,
      duration: newType === 'Video' ? (newMeta || '45 mins') : undefined,
      fileSize: (newType === 'PDF' || newType === 'Slides') ? (newMeta || '2.4 MB') : undefined,
      dueDate: newType === 'Assignment' ? (newMeta || 'July 30, 2026') : undefined,
      status: 'not-started',
    };

    setResources([...resources, added]);
    setNewTitle('');
    setNewDesc('');
    setNewMeta('');
    setUploadedFile(null);
  };

  // Drag and Drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  // Simulating the file uploading progress bar
  const processFile = (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);
    setUploadedFile(null);

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);

          // Format metadata based on file type
          let sizeStr = (file.size / (1024 * 1024)).toFixed(1) + ' MB';
          let autoMeta = sizeStr;
          
          if (newType === 'Video') {
            autoMeta = '25 mins'; // Simulated video length
          } else if (newType === 'Assignment') {
            autoMeta = 'July 28, 2026';
          }

          // Strip extension for title
          const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
          setNewTitle(nameWithoutExt);
          setNewMeta(autoMeta);
          setUploadedFile({
            name: file.name,
            sizeStr,
            type: file.type,
          });

          return 100;
        }
        return prev + 10;
      });
    }, 120);
  };

  const clearUploadedFile = () => {
    setUploadedFile(null);
    setNewTitle('');
    setNewMeta('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Re-ordering mechanics
  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const reordered = [...resources];
    const temp = reordered[index];
    reordered[index] = reordered[index - 1];
    reordered[index - 1] = temp;
    setResources(reordered);
  };

  const handleMoveDown = (index: number) => {
    if (index === resources.length - 1) return;
    const reordered = [...resources];
    const temp = reordered[index];
    reordered[index] = reordered[index + 1];
    reordered[index + 1] = temp;
    setResources(reordered);
  };

  const handleDelete = (id: string) => {
    setResources(resources.filter(r => r.id !== id));
  };

  const getIconForType = (type: Resource['type']) => {
    switch (type) {
      case 'Video': return <Video className="w-4 h-4 text-rose-500" />;
      case 'PDF': return <FileText className="w-4 h-4 text-blue-500" />;
      case 'Slides': return <Layers className="w-4 h-4 text-amber-500" />;
      case 'Notes': return <FileText className="w-4 h-4 text-emerald-500" />;
      case 'Quiz': return <Award className="w-4 h-4 text-purple-500" />;
      default: return <HelpCircle className="w-4 h-4 text-orange-500" />;
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Header and tools */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-white/60 border border-white/40 hover:bg-white flex items-center justify-center text-gray-700 transition-all shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Subject Resource Manager
            </span>
            <h1 className="font-display font-extrabold text-2xl text-gray-900 tracking-tight mt-1">
              Timeline Designer: {subject.name}
            </h1>
          </div>
        </div>

        <button
          onClick={() => onSaveResources(resources)}
          className="px-6 py-2.5 bg-[#8B1E3F] hover:bg-[#b32a4e] text-white text-xs font-bold rounded-full transition-all flex items-center gap-1.5 shadow-md shadow-maroon-900/10"
        >
          <Check className="w-4.5 h-4.5" /> Save Course Timeline
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: Resource Timeline and tactile reordering (2-spans) */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <GlassCard className="p-6">
            <h3 className="font-display font-bold text-base text-gray-900 border-b border-gray-100 pb-3 mb-5">
              Subject Curricular Node Sequence
            </h3>

            {resources.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-12">No materials exist. Build some using the Creator tool on the right.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {resources.map((res, idx) => (
                  <div 
                    key={res.id} 
                    className="p-3.5 bg-white/50 border border-white/30 rounded-2xl flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-9 h-9 rounded-full bg-white border border-gray-100 flex items-center justify-center shrink-0">
                        {getIconForType(res.type)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-[9px] font-bold text-[#8B1E3F] uppercase tracking-widest block mb-0.5">{res.type}</span>
                        <h4 className="text-xs font-bold text-gray-800 truncate leading-snug">{res.title}</h4>
                      </div>
                    </div>

                    {/* Shifting and discarding mechanics */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleMoveUp(idx)}
                        disabled={idx === 0}
                        className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-900 disabled:opacity-30 transition-colors"
                        title="Move Up"
                      >
                        <MoveUp className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleMoveDown(idx)}
                        disabled={idx === resources.length - 1}
                        className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-900 disabled:opacity-30 transition-colors"
                        title="Move Down"
                      >
                        <MoveDown className="w-4 h-4" />
                      </button>

                      <div className="w-[1px] h-4 bg-gray-200 mx-1" />

                      <button
                        onClick={() => handleDelete(res.id)}
                        className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-600 transition-colors"
                        title="Discard Node"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        </div>

        {/* Right Column: Add a Resource creator tool with Upload functionality */}
        <div className="flex flex-col gap-6">
          <GlassCard className="p-6">
            <h3 className="font-display font-bold text-base text-gray-900 mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-[#8B1E3F]" />
              Timeline Node Builder
            </h3>

            <form onSubmit={handleAddResource} className="flex flex-col gap-4">
              <div>
                <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Content Media Type</label>
                <div className="grid grid-cols-3 gap-1.5 p-1 bg-gray-100 rounded-2xl border border-white/20">
                  {(['Video', 'PDF', 'Slides', 'Notes', 'Quiz', 'Assignment'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => {
                        setNewType(type);
                        clearUploadedFile();
                      }}
                      className={`
                        text-[9px] font-bold py-1.5 rounded-xl transition-all
                        ${newType === type 
                          ? 'bg-white text-gray-900 shadow-sm font-black' 
                          : 'text-gray-500 hover:text-gray-900'
                        }
                      `}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic Interactive Upload Zone for file types */}
              {['PDF', 'Slides', 'Video', 'Assignment'].includes(newType) && (
                <div>
                  <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
                    Upload {newType} Source File
                  </label>
                  
                  {!uploadedFile && !isUploading && (
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`
                        border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center gap-2
                        ${isDragging 
                          ? 'border-[#8B1E3F] bg-pink-50/40' 
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/50'
                        }
                      `}
                    >
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        className="hidden"
                        accept={
                          newType === 'Video' ? 'video/*' :
                          newType === 'PDF' ? 'application/pdf' :
                          newType === 'Slides' ? '.ppt,.pptx,.pdf' :
                          '*'
                        }
                      />
                      <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center shadow-sm">
                        <Upload className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-700">Drag & drop files here</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">or click to browse your storage</p>
                      </div>
                    </div>
                  )}

                  {/* Uploading progress feedback */}
                  {isUploading && (
                    <div className="border border-gray-100 rounded-2xl p-4 bg-gray-50/40 flex flex-col gap-2.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-gray-600 flex items-center gap-1.5">
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-[#8B1E3F]" />
                          Uploading media assets...
                        </span>
                        <span className="font-bold text-[#8B1E3F]">{uploadProgress}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-gray-150 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-[#8B1E3F] to-[#CD4368] transition-all duration-150" 
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Upload Success View */}
                  {uploadedFile && (
                    <div className="border border-emerald-100 rounded-2xl p-3.5 bg-emerald-50/30 flex justify-between items-center gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                          <CheckCircle2 className="w-4.5 h-4.5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-gray-800 truncate leading-tight">{uploadedFile.name}</p>
                          <p className="text-[10px] font-semibold text-gray-400 mt-0.5">{uploadedFile.sizeStr} • Upload Complete</p>
                        </div>
                      </div>
                      <button 
                        type="button" 
                        onClick={clearUploadedFile}
                        className="w-6 h-6 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-900 transition-all shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Material Title</label>
                <input
                  type="text"
                  required
                  placeholder="Ex. Structural classifications of long bones..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-gray-100/60 border border-transparent hover:border-gray-200 focus:border-[#8B1E3F] text-xs text-gray-800 p-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#8B1E3F]/30"
                />
              </div>

              <div>
                <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Short Description</label>
                <textarea
                  placeholder="Ex. Detailed review and textbook pages outlining chemical structure of..."
                  value={newDesc}
                  rows={2}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full bg-gray-100/60 border border-transparent hover:border-gray-200 focus:border-[#8B1E3F] text-xs text-gray-800 p-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#8B1E3F]/30 resize-none"
                />
              </div>

              <div>
                <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
                  {newType === 'Video' ? 'Duration (mins)' : (newType === 'PDF' || newType === 'Slides') ? 'File size (MB)' : newType === 'Assignment' ? 'Due Date' : 'Questions Count'}
                </label>
                <input
                  type="text"
                  placeholder={newType === 'Video' ? 'Ex: 42 mins' : (newType === 'PDF' || newType === 'Slides') ? 'Ex: 4.8 MB' : newType === 'Assignment' ? 'Ex: July 15, 2026' : 'Ex: 5 questions'}
                  value={newMeta}
                  onChange={(e) => setNewMeta(e.target.value)}
                  className="w-full bg-gray-100/60 border border-transparent hover:border-gray-200 focus:border-[#8B1E3F] text-xs text-gray-800 p-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#8B1E3F]/30"
                />
              </div>

              <button
                type="submit"
                className="w-full text-center text-xs font-bold bg-[#8B1E3F] hover:bg-[#b32a4e] text-white py-3 rounded-full transition-all mt-2 shadow-md shadow-maroon-900/10"
              >
                Append to Course Timeline
              </button>
            </form>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
