import { useState } from 'react';
import { Search, Filter, BookOpen, GraduationCap, ArrowRight, CheckCircle2 } from 'lucide-react';
import GlassCard from '../GlassCard';
import { Subject, ProgrammeType, StudentProgress } from '../../types';

interface SubjectListProps {
  subjects: Subject[];
  selectedProgramme: ProgrammeType;
  onGoToSubject: (subjectId: string) => void;
  searchQuery: string;
  studentProgress?: StudentProgress;
}

export default function SubjectList({
  subjects,
  selectedProgramme,
  onGoToSubject,
  searchQuery,
  studentProgress,
}: SubjectListProps) {
  const isBPharm = selectedProgramme === 'B.Pharm';

  // Initialize filters based on student's active semester or year if applicable, else 'all'
  const [selectedYear, setSelectedYear] = useState<number | 'all'>(() => {
    if (studentProgress && studentProgress.programme === selectedProgramme && !isBPharm) {
      return studentProgress.year;
    }
    return 'all';
  });

  const [selectedSemester, setSelectedSemester] = useState<number | 'all'>(() => {
    if (studentProgress && studentProgress.programme === selectedProgramme && isBPharm) {
      return studentProgress.semester;
    }
    return 'all';
  });

  // Filter subjects based on programme, search, year, and semester
  const filteredSubjects = subjects.filter((sub) => {
    const matchesProg = sub.programme === selectedProgramme;
    const matchesSearch = searchQuery 
      ? sub.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        sub.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sub.facultyName.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    
    if (isBPharm) {
      // B.Pharm uses Semesters 1-8
      const matchesSem = selectedSemester === 'all' ? true : sub.semester === selectedSemester;
      return matchesProg && matchesSearch && matchesSem;
    } else {
      // Pharm.D uses Years 1-5
      const matchesYear = selectedYear === 'all' ? true : sub.year === selectedYear;
      return matchesProg && matchesSearch && matchesYear;
    }
  });

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Search and Filters Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-extrabold text-2xl text-gray-900 tracking-tight">
            Academic Subjects ({selectedProgramme})
          </h1>
        </div>

        {/* Apple Segmented Controls for Years & Semesters */}
        <GlassCard className="p-2 flex flex-wrap gap-2 items-center h-auto">
          {!isBPharm ? (
            <div className="flex items-center gap-1.5 bg-gray-100/60 p-1 rounded-full border border-white/20">
              <span className="text-[10px] font-bold text-gray-500 px-2">Year:</span>
              {([ 'all', 1, 2, 3, 4, 5 ] as const).map((year) => (
                <button
                  key={year}
                  onClick={() => setSelectedYear(year)}
                  className={`
                    text-[10px] font-bold px-3 py-1 rounded-full transition-all duration-200
                    ${selectedYear === year 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-500 hover:text-gray-900'
                    }
                  `}
                >
                  {year === 'all' ? 'All' : `Yr ${year}`}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-1.5 bg-gray-100/60 p-1 rounded-full border border-white/20">
              <span className="text-[10px] font-bold text-gray-500 px-2">Semester:</span>
              {([ 'all', 1, 2, 3, 4, 5, 6, 7, 8 ] as const).map((sem) => (
                <button
                  key={sem}
                  onClick={() => setSelectedSemester(sem)}
                  className={`
                    text-[10px] font-bold px-3 py-1 rounded-full transition-all duration-200
                    ${selectedSemester === sem 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-500 hover:text-gray-900'
                    }
                  `}
                >
                  {sem === 'all' ? 'All' : `Sem ${sem}`}
                </button>
              ))}
            </div>
          )}
        </GlassCard>
      </div>

      {/* Grid of Subjects */}
      {filteredSubjects.length === 0 ? (
        <GlassCard className="p-12 text-center flex flex-col items-center justify-center gap-3">
          <BookOpen className="w-12 h-12 text-gray-400 stroke-[1.5]" />
          <h3 className="font-display font-bold text-base text-gray-800">No subjects found</h3>
          <p className="text-xs text-gray-500 max-w-sm">
            We couldn't find any subjects matching your current combination of filters or search query.
          </p>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSubjects.map((sub) => {
            const completedLectures = sub.resources.filter(r => r.status === 'completed').length;
            const totalLectures = sub.resources.length;

            return (
              <GlassCard 
                key={sub.id} 
                hoverLift 
                className="group relative p-6 flex flex-col justify-between h-64 border border-white/60 bg-white/40 hover:bg-white/60 shadow-[8px_8px_16px_rgba(163,177,198,0.18),-8px_-8px_16px_rgba(255,255,255,0.75)] hover:shadow-[12px_12px_20px_rgba(163,177,198,0.22),-12px_-12px_20px_rgba(255,255,255,0.85)] rounded-2xl transition-all duration-300 cursor-pointer overflow-hidden"
                onClick={() => onGoToSubject(sub.id)}
              >
                <div>
                  {/* Subtle Top Meta Row */}
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-extrabold tracking-widest text-[#8B1E3F]/80 font-mono">
                      {sub.code}
                    </span>
                    <span className="text-[9px] font-extrabold uppercase tracking-wider text-gray-400 bg-white/50 px-2.5 py-0.5 rounded-md border border-white/80 shadow-[inset_1px_1px_2px_rgba(0,0,0,0.02)]">
                      {sub.programme === 'B.Pharm' ? `Sem ${sub.semester}` : `Yr ${sub.year}`}
                    </span>
                  </div>

                  {/* Redesigned Subject Name */}
                  <h3 className="mt-4 font-display font-extrabold text-base text-gray-900 group-hover:text-[#8B1E3F] transition-colors duration-300 line-clamp-2 leading-snug">
                    {sub.name}
                  </h3>

                  {/* Elegant minimal Subject-In-Charge detail */}
                  <div className="mt-3 flex items-center gap-2">
                    <div className="w-5.5 h-5.5 rounded-full bg-white/60 border border-white/80 flex items-center justify-center shadow-[inset_1px_1px_2px_rgba(0,0,0,0.05)]">
                      <GraduationCap className="w-3.5 h-3.5 text-[#8B1E3F]/70" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[8px] font-bold text-gray-400 uppercase tracking-wider">Subject-In-Charge</span>
                      <span className="text-[11px] font-bold text-gray-600 leading-none mt-0.5">{sub.facultyName}</span>
                    </div>
                  </div>
                </div>

                {/* Progress bar and Footer */}
                <div className="mt-4 pt-4 border-t border-white/40">
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center text-[10px] font-bold">
                      <span className="text-gray-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#8B1E3F]/80" />
                        {completedLectures}/{totalLectures} Resources Finished
                      </span>
                      <span className="text-[#8B1E3F] font-black">{sub.progress}%</span>
                    </div>
                    {/* Soft Neomorphic Groove Progress Bar */}
                    <div className="h-1.5 w-full bg-[#eef2f7] rounded-full overflow-hidden shadow-[inset_1px_1px_3px_rgba(0,0,0,0.06),inset_-1px_-1px_3px_rgba(255,255,255,0.7)]">
                      <div 
                        className="h-full bg-gradient-to-r from-[#8B1E3F] to-[#CD4368] rounded-full transition-all duration-500" 
                        style={{ width: `${sub.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Clean Interactive Action link */}
                  <div className="mt-4 flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wider text-[#8B1E3F]">
                    <span className="group-hover:translate-x-1 transition-transform duration-300">Enter Course Classroom</span>
                    <div className="w-6 h-6 rounded-full bg-white/80 shadow-[2px_2px_4px_rgba(163,177,198,0.15),-2px_-2px_4px_rgba(255,255,255,0.8)] border border-white/60 flex items-center justify-center text-[#8B1E3F] group-hover:bg-[#8B1E3F] group-hover:text-white group-hover:shadow-[inset_1px_1px_3px_rgba(0,0,0,0.2)] transition-all duration-300">
                      <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
