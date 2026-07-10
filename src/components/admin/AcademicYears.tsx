import React, { useState } from 'react';
import { ArrowLeft, Database, Plus, CheckCircle, ToggleLeft, ToggleRight } from 'lucide-react';
import GlassCard from '../GlassCard';

interface AcademicYearsProps {
  onBack: () => void;
}

export default function AcademicYears({
  onBack,
}: AcademicYearsProps) {
  const [years, setYears] = useState([
    { id: '1', name: 'Academic Year 2025-2026', start: 'June 2025', end: 'May 2026', isActive: true },
    { id: '2', name: 'Academic Year 2024-2025', start: 'June 2024', end: 'May 2025', isActive: false },
    { id: '3', name: 'Academic Year 2026-2027 (Planning)', start: 'June 2026', end: 'May 2027', isActive: false },
  ]);

  const [newYearName, setNewYearName] = useState('');

  const handleCreateYear = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newYearName.trim()) return;

    const added = {
      id: Date.now().toString(),
      name: newYearName.trim(),
      start: 'June 2026',
      end: 'May 2027',
      isActive: false
    };

    setYears([...years, added]);
    setNewYearName('');
  };

  const handleSetActive = (id: string) => {
    setYears(years.map((y) => {
      return { ...y, isActive: y.id === id };
    }));
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto">
      {/* Header and Back actions */}
      <div className="flex items-center gap-3">
        <button 
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-white/60 border border-white/40 hover:bg-white flex items-center justify-center text-gray-700 transition-all shadow-sm"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <span className="text-[10px] font-bold text-[#8B1E3F] uppercase tracking-widest bg-[#8B1E3F]/5 border border-[#8B1E3F]/10 px-2.5 py-0.5 rounded-full">
            University Sessional Calendars
          </span>
          <h1 className="font-display font-extrabold text-2xl text-gray-900 tracking-tight mt-1">
            Academic Sessions
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column (2-spans): Existing academic years with toggle state */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <GlassCard className="p-6">
            <h3 className="font-display font-bold text-base text-gray-900 border-b border-gray-100 pb-3 mb-5">
              Available Academic Terms
            </h3>

            <div className="flex flex-col gap-3">
              {years.map((y) => {
                return (
                  <div 
                    key={y.id} 
                    className="p-3.5 bg-white/50 hover:bg-white border border-white/30 rounded-2xl flex items-center justify-between gap-4 transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-9 h-9 rounded-full bg-[#8B1E3F]/10 text-[#8B1E3F] flex items-center justify-center shrink-0">
                        <Database className="w-4.5 h-4.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-[9px] font-bold text-gray-400 block uppercase tracking-wider">Duration: {y.start} - {y.end}</span>
                        <h4 className="text-xs font-bold text-gray-800 truncate leading-snug">{y.name}</h4>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className={`text-[9px] font-bold px-2.5 py-0.5 rounded-full ${
                        y.isActive ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-gray-50 text-gray-400 border border-gray-100'
                      }`}>
                        {y.isActive ? 'Current Term' : 'Archived'}
                      </span>
                      
                      <button 
                        onClick={() => handleSetActive(y.id)}
                        disabled={y.isActive}
                        className="text-gray-400 hover:text-[#8B1E3F] transition-colors disabled:opacity-30"
                        title="Set active"
                      >
                        {y.isActive ? (
                          <ToggleRight className="w-7 h-7 text-[#8B1E3F]" />
                        ) : (
                          <ToggleLeft className="w-7 h-7" />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </GlassCard>
        </div>

        {/* Right Column: Add a year block */}
        <GlassCard className="p-6">
          <h3 className="font-display font-bold text-base text-gray-900 mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5 text-[#8B1E3F]" />
            Establish Term Session
          </h3>

          <form onSubmit={handleCreateYear} className="flex flex-col gap-4">
            <div>
              <label className="text-[9px] font-bold text-gray-400 uppercase block mb-1">Academic Year Label</label>
              <input
                type="text"
                required
                placeholder="Ex. Academic Year 2026-2027..."
                value={newYearName}
                onChange={(e) => setNewYearName(e.target.value)}
                className="w-full bg-gray-100/60 border border-transparent hover:border-gray-200 text-xs text-gray-800 p-2.5 rounded-xl focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full text-center text-xs font-bold bg-[#8B1E3F] hover:bg-[#b32a4e] text-white py-3 rounded-full transition-all mt-2 shadow-md shadow-maroon-900/10"
            >
              Append to Sessional Registry
            </button>
          </form>
        </GlassCard>
      </div>
    </div>
  );
}
