import React from 'react';
import { Calendar, RefreshCw } from 'lucide-react';
import GlassCard from './GlassCard';
import { useAcademicYear } from '../context/AcademicYearContext';

export interface AcademicSessionWorkspaceProps {
  moduleName: string; // e.g., "TEACHING ACADEMIC SESSION WORKSPACE"
  description?: string;
  icon?: React.ReactNode;
  extraContent?: React.ReactNode;
  className?: string;
  hideSessionSelector?: boolean; // For Academic Calendar module
}

export default function AcademicSessionWorkspace({
  moduleName,
  description,
  icon,
  extraContent,
  className = '',
  hideSessionSelector = false,
}: AcademicSessionWorkspaceProps) {
  const { 
    activeAcademicYear, 
    setActiveAcademicYear, 
    availableAcademicYears,
    selectedProgramme,
    setSelectedProgramme,
    availableProgrammes,
    selectedRegulation,
    setSelectedRegulation,
    getRegulationsForProgramme,
  } = useAcademicYear();

  const isCurrentYear = activeAcademicYear === '2026-2027';
  const currentValidRegulations = getRegulationsForProgramme(selectedProgramme);

  return (
    <GlassCard className={`p-5 mb-6 border border-gray-150 shadow-md bg-gradient-to-r from-white/95 via-rose-50/20 to-white/90 relative overflow-hidden ${className}`}>
      {/* Background ambient accent */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#8B1E3F]/5 rounded-full blur-3xl -z-10 pointer-events-none" />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        
        {/* Left Column: Workspace Title & Status Badges */}
        <div className="flex flex-col gap-2.5 flex-1 min-w-0">
          
          {/* Header Title */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="w-7 h-7 rounded-lg bg-[#8B1E3F] text-white flex items-center justify-center shrink-0 shadow-sm">
              {icon || <Calendar className="w-4 h-4" />}
            </div>
            <span className="text-[11px] font-black uppercase tracking-widest text-[#8B1E3F]">
              {moduleName}
            </span>
          </div>

          {/* Current Academic Session & Status */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="flex items-center gap-2 bg-white/90 border border-gray-200 px-3.5 py-1.5 rounded-2xl shadow-xs">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                {isCurrentYear ? 'Current Academic Session' : 'Academic Session'}
              </span>
              <span className="text-sm font-black font-mono text-gray-900">
                AY {activeAcademicYear}
              </span>
            </div>

            {/* Current Active Badge (shown ONLY for current active session 2026-2027) */}
            {isCurrentYear && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-black text-emerald-800 bg-emerald-50 border border-emerald-200/80 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                (Current Active)
              </span>
            )}
          </div>

          {description && (
            <p className="text-xs text-gray-500 font-medium leading-relaxed max-w-3xl">
              {description}
            </p>
          )}

        </div>

        {/* Right Column: Controls (Session, Programme, Regulation) */}
        <div className="flex flex-wrap items-center gap-3 shrink-0 lg:border-l lg:border-gray-200/80 lg:pl-5">
          
          {/* Academic Session Selector (Hidden for Academic Calendar if requested) */}
          {!hideSessionSelector && (
            <div className="flex flex-col bg-white border border-gray-200 rounded-2xl p-2 shadow-xs min-w-[170px]">
              <label className="text-[9px] font-black uppercase tracking-wider text-gray-400 mb-0.5 flex items-center justify-between px-1">
                <span>Academic Session</span>
                <RefreshCw className="w-2.5 h-2.5 text-[#8B1E3F]" />
              </label>
              <select
                value={activeAcademicYear}
                onChange={(e) => setActiveAcademicYear(e.target.value)}
                className="text-xs font-black font-mono text-gray-900 bg-gray-50/80 hover:bg-gray-100 border border-gray-200 rounded-xl px-2.5 py-1.5 cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#8B1E3F] transition-all"
              >
                {availableAcademicYears.map(yr => (
                  <option key={yr} value={yr}>
                    AY {yr} {yr === '2026-2027' ? '(Current)' : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Programme Selector */}
          <div className="flex flex-col bg-white border border-gray-200 rounded-2xl p-2 shadow-xs min-w-[140px]">
            <label className="text-[9px] font-black uppercase tracking-wider text-gray-400 mb-0.5 px-1">
              Programme
            </label>
            <select
              value={selectedProgramme}
              onChange={(e) => setSelectedProgramme(e.target.value)}
              className="text-xs font-extrabold text-[#8B1E3F] bg-pink-50/50 hover:bg-pink-50 border border-pink-200/80 rounded-xl px-2.5 py-1.5 cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#8B1E3F] transition-all"
            >
              {availableProgrammes.map(prog => (
                <option key={prog} value={prog}>{prog}</option>
              ))}
            </select>
          </div>

          {/* Regulation Selector (Dynamic based on Programme) */}
          <div className="flex flex-col bg-white border border-gray-200 rounded-2xl p-2 shadow-xs min-w-[130px]">
            <label className="text-[9px] font-black uppercase tracking-wider text-gray-400 mb-0.5 px-1">
              Regulation
            </label>
            <select
              value={selectedRegulation}
              onChange={(e) => setSelectedRegulation(e.target.value)}
              className="text-xs font-bold text-gray-800 bg-gray-50/80 hover:bg-gray-100 border border-gray-200 rounded-xl px-2.5 py-1.5 cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#8B1E3F] transition-all"
            >
              {currentValidRegulations.map(reg => (
                <option key={reg} value={reg}>{reg}</option>
              ))}
            </select>
          </div>

          {extraContent}
        </div>

      </div>
    </GlassCard>
  );
}

