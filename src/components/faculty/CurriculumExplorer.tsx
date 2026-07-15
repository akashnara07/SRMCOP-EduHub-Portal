import React, { useState } from 'react';
import { 
  Library, ChevronDown, ChevronRight, BookOpen, ShieldCheck, Calendar, Award 
} from 'lucide-react';
import { Subject } from '../../types';

interface CurriculumExplorerProps {
  programmeFilter: 'B.Pharm' | 'Pharm.D';
  selectedRegulation: string;
  selectedYear: string;
  selectedSemesterFilter: number | 'All';
  selectedYearLevelFilter: number | 'All';
  subjects: Subject[];
  onSelectNode: (params: {
    programme: 'B.Pharm' | 'Pharm.D';
    regulation: string;
    year: string;
    semester: number | 'All';
    yearLevel: number | 'All';
  }) => void;
  isMinimized?: boolean;
  onToggleMinimize?: () => void;
}

export default function CurriculumExplorer({
  programmeFilter,
  selectedRegulation,
  selectedYear,
  selectedSemesterFilter,
  selectedYearLevelFilter,
  subjects,
  onSelectNode,
  isMinimized = true,
  onToggleMinimize,
}: CurriculumExplorerProps) {
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});

  const getSubjectCountInTree = (prog: 'B.Pharm' | 'Pharm.D', reg: string, year: string, levelNum: number) => {
    return subjects.filter(s => {
      const isProgMatch = s.programme === prog;
      const isYearMatch = s.academicYear === year;
      let isRegMatch = false;
      if (prog === 'B.Pharm') {
        isRegMatch = s.regulation === reg || (!s.regulation && reg === 'PCI 2017');
      } else {
        isRegMatch = s.regulation === reg || (!s.regulation && reg === 'PCI 2008');
      }
      const isLevelMatch = prog === 'B.Pharm' ? s.semester === levelNum : s.year === levelNum;
      return isProgMatch && isYearMatch && isRegMatch && isLevelMatch;
    }).length;
  };

  const handleToggleExpand = (nodeId: string) => {
    setExpandedNodes(prev => ({ ...prev, [nodeId]: !prev[nodeId] }));
  };

  const handleExpandCollapseAll = () => {
    const isCurrentlyExpanded = expandedNodes['B.Pharm'];
    const nextState = !isCurrentlyExpanded;
    setExpandedNodes({
      'B.Pharm': nextState,
      'B.Pharm-PCI 2017': nextState,
      'B.Pharm-PCI 2017-2024-2025': nextState,
      'B.Pharm-PCI 2017-2025-2026': nextState,
      'B.Pharm-PCI 2017-2026-2027': nextState,
      'B.Pharm-PCI 2026': nextState,
      'Pharm.D': nextState,
      'Pharm.D-PCI 2008': nextState,
      'Pharm.D-PCI 2008-2024-2025': nextState,
      'Pharm.D-PCI 2008-2025-2026': nextState,
      'Pharm.D-PCI 2008-2026-2027': nextState,
    });
  };

  if (isMinimized) {
    return (
      <div 
        onClick={onToggleMinimize}
        className="bg-white border border-gray-150 hover:border-[#8B1E3F]/30 rounded-2xl p-4 shadow-sm cursor-pointer transition-all hover:bg-[#8B1E3F]/5 group flex items-center justify-between"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-pink-50/50 flex items-center justify-center text-[#8B1E3F] group-hover:scale-110 transition-transform">
            <Library className="w-4 h-4 text-[#8B1E3F]" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-black uppercase tracking-wider text-gray-900">Curriculum Explorer</span>
            <span className="text-[9px] text-gray-400 font-bold">Click to Maximise Tree</span>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#8B1E3F] transition-colors" />
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-150/50 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <Library className="w-4 h-4 text-gray-400" />
          <h3 className="text-xs font-black uppercase tracking-wider text-gray-900">Curriculum Explorer</h3>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExpandCollapseAll}
            className="text-[10px] font-bold text-gray-400 hover:text-gray-650 uppercase tracking-wider"
          >
            {expandedNodes['B.Pharm'] ? 'Collapse All' : 'Expand All'}
          </button>
          {onToggleMinimize && (
            <button
              onClick={onToggleMinimize}
              className="text-[10px] font-black text-[#8B1E3F] hover:underline uppercase tracking-wider"
            >
              Minimise
            </button>
          )}
        </div>
      </div>

      <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
        {/* B.Pharm Node */}
        <div>
          <div 
            onClick={() => handleToggleExpand('B.Pharm')}
            className="flex items-center justify-between py-1 px-1.5 hover:bg-gray-50 rounded-lg cursor-pointer"
          >
            <div className="flex items-center gap-2 text-xs font-black text-gray-800">
              {expandedNodes['B.Pharm'] ? <ChevronDown className="w-3.5 h-3.5 text-gray-500" /> : <ChevronRight className="w-3.5 h-3.5 text-gray-500" />}
              <BookOpen className="w-3.5 h-3.5 text-[#8B1E3F]" />
              <span>B.Pharm</span>
            </div>
          </div>

          {expandedNodes['B.Pharm'] && (
            <div className="pl-4 border-l border-gray-100 ml-3 mt-1 space-y-3">
              {/* PCI 2017 Regulation Node */}
              <div>
                <div
                  onClick={() => handleToggleExpand('B.Pharm-PCI 2017')}
                  className="flex items-center justify-between py-1 px-1.5 hover:bg-gray-50 rounded-lg cursor-pointer"
                >
                  <div className="flex items-center gap-2 text-[11px] font-black text-gray-700">
                    {expandedNodes['B.Pharm-PCI 2017'] ? <ChevronDown className="w-3.5 h-3.5 text-gray-400" /> : <ChevronRight className="w-3.5 h-3.5 text-gray-400" />}
                    <ShieldCheck className="w-3.5 h-3.5 text-gray-400" />
                    <span>PCI 2017</span>
                  </div>
                </div>

                {expandedNodes['B.Pharm-PCI 2017'] && (
                  <div className="pl-3 border-l border-gray-100 ml-3 mt-1 space-y-2">
                    {['2024-2025', '2025-2026', '2026-2027'].map(year => {
                      const nodeKey = `B.Pharm-PCI 2017-${year}`;
                      const isYearExpanded = expandedNodes[nodeKey] !== false;
                      
                      return (
                        <div key={year}>
                          <div
                            onClick={() => handleToggleExpand(nodeKey)}
                            className="flex items-center justify-between py-1 px-1.5 hover:bg-gray-50 rounded-lg cursor-pointer"
                          >
                            <div className="flex items-center gap-2 text-[11px] font-extrabold text-gray-600">
                              {isYearExpanded ? <ChevronDown className="w-3 h-3 text-gray-400" /> : <ChevronRight className="w-3 h-3 text-gray-400" />}
                              <Calendar className="w-3.5 h-3.5 text-gray-400" />
                              <span>AY {year}</span>
                            </div>
                          </div>

                          {isYearExpanded && (
                            <div className="pl-3 ml-2 mt-1 space-y-1">
                              {[1, 2, 3, 4, 5, 6, 7, 8].filter(semNum => {
                                if (year === '2026-2027' && (semNum === 1 || semNum === 2)) {
                                  return false;
                                }
                                const courseCount = getSubjectCountInTree('B.Pharm', 'PCI 2017', year, semNum);
                                const isSelected = programmeFilter === 'B.Pharm' && 
                                                   selectedRegulation === 'PCI 2017' && 
                                                   selectedYear === year && 
                                                   selectedSemesterFilter === semNum;
                                return courseCount > 0 || isSelected;
                              }).map(semNum => {
                                const courseCount = getSubjectCountInTree('B.Pharm', 'PCI 2017', year, semNum);
                                const isSelected = programmeFilter === 'B.Pharm' && 
                                                   selectedRegulation === 'PCI 2017' && 
                                                   selectedYear === year && 
                                                   selectedSemesterFilter === semNum;
                                
                                return (
                                  <div
                                    key={semNum}
                                    onClick={() => onSelectNode({
                                      programme: 'B.Pharm',
                                      regulation: 'PCI 2017',
                                      year,
                                      semester: semNum,
                                      yearLevel: 'All'
                                    })}
                                    className={`flex items-center justify-between py-1.5 px-3 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                                      isSelected 
                                        ? 'bg-pink-50 text-[#8B1E3F]' 
                                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2">
                                      <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-[#8B1E3F]' : 'bg-gray-300'}`} />
                                      <span>Semester {semNum}</span>
                                    </div>
                                    <span className="text-[10px] opacity-75">({courseCount})</span>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* PCI 2026 Regulation Node */}
              <div>
                <div
                  onClick={() => handleToggleExpand('B.Pharm-PCI 2026')}
                  className="flex items-center justify-between py-1 px-1.5 hover:bg-gray-50 rounded-lg cursor-pointer"
                >
                  <div className="flex items-center gap-2 text-[11px] font-black text-gray-700">
                    {expandedNodes['B.Pharm-PCI 2026'] ? <ChevronDown className="w-3.5 h-3.5 text-gray-400" /> : <ChevronRight className="w-3.5 h-3.5 text-gray-400" />}
                    <ShieldCheck className="w-3.5 h-3.5 text-gray-400" />
                    <span>PCI 2026</span>
                  </div>
                </div>

                {expandedNodes['B.Pharm-PCI 2026'] && (
                  <div className="pl-3 border-l border-gray-100 ml-3 mt-1 space-y-2">
                    {['2026-2027'].map(year => {
                      const nodeKey = `B.Pharm-PCI 2026-${year}`;
                      const isYearExpanded = expandedNodes[nodeKey] !== false;
                      
                      return (
                        <div key={year}>
                          <div
                            onClick={() => handleToggleExpand(nodeKey)}
                            className="flex items-center justify-between py-1 px-1.5 hover:bg-gray-50 rounded-lg cursor-pointer"
                          >
                            <div className="flex items-center gap-2 text-[11px] font-extrabold text-gray-600">
                              {isYearExpanded ? <ChevronDown className="w-3 h-3 text-gray-400" /> : <ChevronRight className="w-3 h-3 text-gray-400" />}
                              <Calendar className="w-3.5 h-3.5 text-gray-400" />
                              <span>AY {year}</span>
                            </div>
                          </div>

                          {isYearExpanded && (
                            <div className="pl-3 ml-2 mt-1 space-y-1">
                              {[1, 2, 3, 4, 5, 6, 7, 8].filter(semNum => {
                                const courseCount = getSubjectCountInTree('B.Pharm', 'PCI 2026', year, semNum);
                                const isSelected = programmeFilter === 'B.Pharm' && 
                                                   selectedRegulation === 'PCI 2026' && 
                                                   selectedYear === year && 
                                                   selectedSemesterFilter === semNum;
                                return courseCount > 0 || isSelected;
                              }).map(semNum => {
                                const courseCount = getSubjectCountInTree('B.Pharm', 'PCI 2026', year, semNum);
                                const isSelected = programmeFilter === 'B.Pharm' && 
                                                   selectedRegulation === 'PCI 2026' && 
                                                   selectedYear === year && 
                                                   selectedSemesterFilter === semNum;
                                
                                return (
                                  <div
                                    key={semNum}
                                    onClick={() => onSelectNode({
                                      programme: 'B.Pharm',
                                      regulation: 'PCI 2026',
                                      year,
                                      semester: semNum,
                                      yearLevel: 'All'
                                    })}
                                    className={`flex items-center justify-between py-1.5 px-3 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                                      isSelected 
                                        ? 'bg-pink-50 text-[#8B1E3F]' 
                                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2">
                                      <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-[#8B1E3F]' : 'bg-gray-300'}`} />
                                      <span>Semester {semNum}</span>
                                    </div>
                                    <span className="text-[10px] opacity-75">({courseCount})</span>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Pharm.D Node */}
        <div>
          <div 
            onClick={() => handleToggleExpand('Pharm.D')}
            className="flex items-center justify-between py-1 px-1.5 hover:bg-gray-50 rounded-lg cursor-pointer"
          >
            <div className="flex items-center gap-2 text-xs font-black text-gray-800">
              {expandedNodes['Pharm.D'] ? <ChevronDown className="w-3.5 h-3.5 text-gray-500" /> : <ChevronRight className="w-3.5 h-3.5 text-gray-500" />}
              <Award className="w-3.5 h-3.5 text-[#0F766E]" />
              <span>Pharm.D</span>
            </div>
          </div>

          {expandedNodes['Pharm.D'] && (
            <div className="pl-4 border-l border-gray-100 ml-3 mt-1 space-y-3">
              {/* PCI 2008 Regulation Node */}
              <div>
                <div
                  onClick={() => handleToggleExpand('Pharm.D-PCI 2008')}
                  className="flex items-center justify-between py-1 px-1.5 hover:bg-gray-50 rounded-lg cursor-pointer"
                >
                  <div className="flex items-center gap-2 text-[11px] font-black text-gray-700">
                    {expandedNodes['Pharm.D-PCI 2008'] ? <ChevronDown className="w-3.5 h-3.5 text-gray-400" /> : <ChevronRight className="w-3.5 h-3.5 text-gray-400" />}
                    <ShieldCheck className="w-3.5 h-3.5 text-gray-400" />
                    <span>PCI 2008</span>
                  </div>
                </div>

                {expandedNodes['Pharm.D-PCI 2008'] && (
                  <div className="pl-3 border-l border-gray-100 ml-3 mt-1 space-y-2">
                    {['2024-2025', '2025-2026', '2026-2027'].map(year => {
                      const nodeKey = `Pharm.D-PCI 2008-${year}`;
                      const isYearExpanded = expandedNodes[nodeKey] !== false;
                      
                      return (
                        <div key={year}>
                          <div
                            onClick={() => handleToggleExpand(nodeKey)}
                            className="flex items-center justify-between py-1 px-1.5 hover:bg-gray-50 rounded-lg cursor-pointer"
                          >
                            <div className="flex items-center gap-2 text-[11px] font-extrabold text-gray-600">
                              {isYearExpanded ? <ChevronDown className="w-3 h-3 text-gray-400" /> : <ChevronRight className="w-3 h-3 text-gray-400" />}
                              <Calendar className="w-3.5 h-3.5 text-gray-400" />
                              <span>AY {year}</span>
                            </div>
                          </div>

                          {isYearExpanded && (
                            <div className="pl-3 ml-2 mt-1 space-y-1">
                              {[1, 2, 3, 4, 5, 6].filter(yrNum => {
                                const courseCount = getSubjectCountInTree('Pharm.D', 'PCI 2008', year, yrNum);
                                const isSelected = programmeFilter === 'Pharm.D' && 
                                                   selectedRegulation === 'PCI 2008' && 
                                                   selectedYear === year && 
                                                   selectedYearLevelFilter === yrNum;
                                return courseCount > 0 || isSelected;
                              }).map(yrNum => {
                                const courseCount = getSubjectCountInTree('Pharm.D', 'PCI 2008', year, yrNum);
                                const isSelected = programmeFilter === 'Pharm.D' && 
                                                   selectedRegulation === 'PCI 2008' && 
                                                   selectedYear === year && 
                                                   selectedYearLevelFilter === yrNum;
                                
                                return (
                                  <div
                                    key={yrNum}
                                    onClick={() => onSelectNode({
                                      programme: 'Pharm.D',
                                      regulation: 'PCI 2008',
                                      year,
                                      semester: 'All',
                                      yearLevel: yrNum
                                    })}
                                    className={`flex items-center justify-between py-1.5 px-3 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                                      isSelected 
                                        ? 'bg-teal-50 text-[#0F766E]' 
                                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2">
                                      <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-[#0F766E]' : 'bg-gray-300'}`} />
                                      <span>Year {yrNum}</span>
                                    </div>
                                    <span className="text-[10px] opacity-75">({courseCount})</span>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
