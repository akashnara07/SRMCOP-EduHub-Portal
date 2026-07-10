import React, { useState } from 'react';
import { ArrowLeft, Plus, GraduationCap, ToggleLeft, ToggleRight, CheckCircle, ExternalLink } from 'lucide-react';
import GlassCard from '../GlassCard';

interface ManageProgrammesProps {
  onBack: () => void;
}

export default function ManageProgrammes({
  onBack,
}: ManageProgrammesProps) {
  const [programmes, setProgrammes] = useState([
    { id: '1', name: 'Bachelor of Pharmacy (B.Pharm)', type: 'Undergraduate', duration: '4 Years / 8 Semesters', status: 'Active' },
    { id: '2', name: 'Doctor of Pharmacy (Pharm.D)', type: 'Professional Doctorate', duration: '6 Years (Yearly)', status: 'Active' },
    { id: '3', name: 'Master of Pharmacy (M.Pharm)', type: 'Postgraduate', duration: '2 Years / 4 Semesters', status: 'Planning' },
    { id: '4', name: 'Doctor of Philosophy (Ph.D.)', type: 'Research', duration: '3-5 Years', status: 'Planning' },
    { id: '5', name: 'Certificate Course in Clinical Trial Management', type: 'Vocational', duration: '6 Months', status: 'Active' },
  ]);

  const [newProgName, setNewProgName] = useState('');
  const [newProgType, setNewProgType] = useState('Postgraduate');
  const [newProgDuration, setNewProgDuration] = useState('2 Years');

  const handleCreateProgramme = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProgName.trim()) return;

    const added = {
      id: Date.now().toString(),
      name: newProgName.trim(),
      type: newProgType,
      duration: newProgDuration,
      status: 'Planning'
    };

    setProgrammes([...programmes, added]);
    setNewProgName('');
  };

  const handleToggleStatus = (id: string) => {
    setProgrammes(programmes.map((p) => {
      if (p.id === id) {
        return { ...p, status: p.status === 'Active' ? 'Planning' : 'Active' };
      }
      return p;
    }));
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto">
      {/* Header and Back actions */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-white/60 border border-white/40 hover:bg-white flex items-center justify-center text-gray-700 transition-all shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <span className="text-[10px] font-bold text-[#8B1E3F] uppercase tracking-widest bg-[#8B1E3F]/5 border border-[#8B1E3F]/10 px-2.5 py-0.5 rounded-full">
              University Curricular Registry
            </span>
            <h1 className="font-display font-extrabold text-2xl text-gray-900 tracking-tight mt-1">
              Configure Programmes
            </h1>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column (2-spans): Existing Programs and Toggle Status */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <GlassCard className="p-6">
            <h3 className="font-display font-bold text-base text-gray-900 border-b border-gray-100 pb-3 mb-5">
              Available University Degrees
            </h3>

            <div className="flex flex-col gap-3">
              {programmes.map((p) => {
                const isActive = p.status === 'Active';

                return (
                  <div 
                    key={p.id} 
                    className="p-3.5 bg-white/50 hover:bg-white border border-white/30 rounded-2xl flex items-center justify-between gap-4 transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-9 h-9 rounded-full bg-[#8B1E3F]/10 text-[#8B1E3F] flex items-center justify-center shrink-0">
                        <GraduationCap className="w-4.5 h-4.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-[9px] font-bold text-gray-400 block uppercase tracking-wider">{p.type} • {p.duration}</span>
                        <h4 className="text-xs font-bold text-gray-800 truncate leading-snug">{p.name}</h4>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className={`text-[9px] font-bold px-2.5 py-0.5 rounded-full ${
                        isActive ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'
                      }`}>
                        {p.status}
                      </span>
                      
                      <button 
                        onClick={() => handleToggleStatus(p.id)}
                        className="text-gray-400 hover:text-[#8B1E3F] transition-colors"
                        title="Toggle status"
                      >
                        {isActive ? (
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

        {/* Right Column: Add a degree Program creator */}
        <GlassCard className="p-6">
          <h3 className="font-display font-bold text-base text-gray-900 mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5 text-[#8B1E3F]" />
            Establish New Degree
          </h3>

          <form onSubmit={handleCreateProgramme} className="flex flex-col gap-4">
            <div>
              <label className="text-[9px] font-bold text-gray-400 uppercase block mb-1">Degree Programme Title</label>
              <input
                type="text"
                required
                placeholder="Ex. Post-Baccalaureate Pharm.D..."
                value={newProgName}
                onChange={(e) => setNewProgName(e.target.value)}
                className="w-full bg-gray-100/60 border border-transparent hover:border-gray-200 text-xs text-gray-800 p-2.5 rounded-xl focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[9px] font-bold text-gray-400 uppercase block mb-1">Classification Type</label>
              <select
                value={newProgType}
                onChange={(e) => setNewProgType(e.target.value)}
                className="w-full bg-gray-100/60 text-xs text-gray-800 p-2.5 rounded-xl focus:outline-none"
              >
                <option value="Undergraduate">Undergraduate (UG)</option>
                <option value="Postgraduate">Postgraduate (PG)</option>
                <option value="Research">Research (Ph.D.)</option>
                <option value="Vocational">Vocational Certification</option>
              </select>
            </div>

            <div>
              <label className="text-[9px] font-bold text-gray-400 uppercase block mb-1">Standard Duration</label>
              <input
                type="text"
                required
                placeholder="Ex. 3 Years / 6 Semesters..."
                value={newProgDuration}
                onChange={(e) => setNewProgDuration(e.target.value)}
                className="w-full bg-gray-100/60 border border-transparent hover:border-gray-200 text-xs text-gray-800 p-2.5 rounded-xl focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full text-center text-xs font-bold bg-[#8B1E3F] hover:bg-[#b32a4e] text-white py-3 rounded-full transition-all mt-2 shadow-md shadow-maroon-900/10"
            >
              Append to University Registry
            </button>
          </form>
        </GlassCard>
      </div>
    </div>
  );
}
