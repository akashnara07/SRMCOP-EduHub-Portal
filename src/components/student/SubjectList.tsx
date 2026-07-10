import { useState } from 'react';
import { Search, Filter, BookOpen, GraduationCap, ArrowRight, CheckCircle2 } from 'lucide-react';
import GlassCard from '../GlassCard';
import { Subject, ProgrammeType } from '../../types';

interface SubjectListProps {
  subjects: Subject[];
  selectedProgramme: ProgrammeType;
  onGoToSubject: (subjectId: string) => void;
  searchQuery: string;
}

export default function SubjectList({
  subjects,
  selectedProgramme,
  onGoToSubject,
  searchQuery,
}: SubjectListProps) {
  const [selectedYear, setSelectedYear] = useState<number | 'all'>('all');
  const [selectedSemester, setSelectedSemester] = useState<number | 'all'>('all');

  // Filter subjects based on programme, search, year, and semester
  const filteredSubjects = subjects.filter((sub) => {
    const matchesProg = sub.programme === selectedProgramme;
    const matchesSearch = searchQuery 
      ? sub.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        sub.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sub.facultyName.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    const matchesYear = selectedYear === 'all' ? true : sub.year === selectedYear;
    const matchesSem = selectedSemester === 'all' ? true : sub.semester === selectedSemester;
    
    return matchesProg && matchesSearch && matchesYear && matchesSem;
  });

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Search and Filters Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-extrabold text-2xl text-gray-900 tracking-tight">
            Academic Subjects ({selectedProgramme})
          </h1>
          <p className="text-xs text-gray-500">Explore and resume your enrolled professional curriculum</p>
        </div>

        {/* Apple Segmented Controls for Years & Semesters */}
        <GlassCard className="p-2 flex flex-wrap gap-2 items-center h-auto md:h-14">
          <div className="flex items-center gap-1.5 bg-gray-100/60 p-1 rounded-full border border-white/20">
            <span className="text-[10px] font-bold text-gray-500 px-2">Year:</span>
            {([ 'all', 1, 2 ] as const).map((year) => (
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

          <div className="flex items-center gap-1.5 bg-gray-100/60 p-1 rounded-full border border-white/20">
            <span className="text-[10px] font-bold text-gray-500 px-2">Semester:</span>
            {([ 'all', 1, 3 ] as const).map((sem) => (
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
                className={`p-6 flex flex-col justify-between h-64 border-l-4 border-l-[#8B1E3F]`}
                onClick={() => onGoToSubject(sub.id)}
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{sub.code}</span>
                    <span className="text-[10px] font-bold bg-[#8B1E3F]/5 text-[#8B1E3F] px-2.5 py-1 rounded-full border border-[#8B1E3F]/10">
                      Sem {sub.semester} • Yr {sub.year}
                    </span>
                  </div>

                  <h3 className="font-display font-bold text-lg text-gray-900 mb-1 leading-snug line-clamp-1 hover:text-[#8B1E3F] transition-colors">
                    {sub.name}
                  </h3>
                  <p className="text-xs text-gray-500 mb-4">{sub.facultyName}</p>

                  {/* Horizontal Progress Bar */}
                  <div className="flex flex-col gap-1.5 mb-4">
                    <div className="flex justify-between text-[10px] font-bold text-gray-500">
                      <span>Course Progress</span>
                      <span>{sub.progress}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-200/50 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-[#8B1E3F] to-[#CD4368] rounded-full transition-all duration-500" 
                        style={{ width: `${sub.progress}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Card footer details */}
                <div className="flex justify-between items-center border-t border-gray-100 pt-3">
                  <span className="text-[10px] font-bold text-gray-500 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#8B1E3F]" />
                    {completedLectures}/{totalLectures} Resources Finished
                  </span>
                  <div className="w-8 h-8 rounded-full bg-[#8B1E3F]/10 text-[#8B1E3F] flex items-center justify-center group-hover:bg-[#8B1E3F] group-hover:text-white transition-all duration-300">
                    <ArrowRight className="w-4 h-4" />
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
