import { useState } from 'react';
import { Search, Filter, BookOpen, GraduationCap, ArrowRight, CheckCircle2 } from 'lucide-react';
import GlassCard from '../GlassCard';
import { Subject, ProgrammeType, StudentProgress } from '../../types';
import { getSemesterTheme } from '../../lib/semesterColors';

interface SubjectListProps {
  subjects: Subject[];
  selectedProgramme: ProgrammeType;
  onGoToSubject: (subjectId: string) => void;
  searchQuery: string;
  studentProgress?: StudentProgress;
}

export default function SubjectList({
  subjects,
  selectedProgramme = 'B.Pharm',
  onGoToSubject,
  searchQuery,
  studentProgress,
}: SubjectListProps) {
  const isPharmD = selectedProgramme === 'Pharm.D';
  const isMPharm = selectedProgramme === 'M.Pharm';

  // Initialize filters based on student's active semester or year if applicable, else 'all'
  const [selectedYear, setSelectedYear] = useState<number | 'all'>(() => {
    if (studentProgress && studentProgress.programme === selectedProgramme && isPharmD) {
      return studentProgress.year;
    }
    return 'all';
  });

  const [selectedSemester, setSelectedSemester] = useState<number | 'all'>(() => {
    if (studentProgress && studentProgress.programme === selectedProgramme && !isPharmD) {
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
    
    if (isPharmD) {
      const matchesYear = selectedYear === 'all' ? true : sub.year === selectedYear;
      return matchesProg && matchesSearch && matchesYear;
    } else {
      const matchesSem = selectedSemester === 'all' ? true : sub.semester === selectedSemester;
      return matchesProg && matchesSearch && matchesSem;
    }
  });

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Search and Filters Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-extrabold text-2xl text-gray-900 tracking-tight flex items-center gap-2 flex-wrap">
            <span>Academic Subjects</span>
            <span className="text-xs bg-[#8B1E3F]/10 text-[#8B1E3F] px-2.5 py-0.5 rounded-full font-black border border-[#8B1E3F]/20">
              {selectedProgramme}
            </span>
            <span className="text-xs bg-gray-100 text-gray-700 px-2.5 py-0.5 rounded-full font-bold border border-gray-200">
              {isPharmD 
                ? (selectedYear === 'all' ? 'All Years' : `Year ${selectedYear === 1 ? 'I' : selectedYear === 2 ? 'II' : selectedYear === 3 ? 'III' : selectedYear === 4 ? 'IV' : selectedYear === 5 ? 'V' : 'VI'}`)
                : (selectedSemester === 'all' ? 'All Semesters' : `Semester ${selectedSemester === 1 ? 'I' : selectedSemester === 2 ? 'II' : selectedSemester === 3 ? 'III' : selectedSemester === 4 ? 'IV' : selectedSemester === 5 ? 'V' : selectedSemester === 6 ? 'VI' : selectedSemester === 7 ? 'VII' : 'VIII'}`)
              }
            </span>
          </h1>
          <p className="text-xs text-gray-500 font-medium mt-0.5">
            {isPharmD ? 'Annual curriculum subjects & clinical modules' : 'Semester-wise curriculum subjects'}
          </p>
        </div>

        {/* Apple Segmented Controls for Years & Semesters */}
        <GlassCard className="p-2 flex flex-wrap gap-2 items-center h-auto">
          {isPharmD ? (
            <div className="flex items-center gap-1 bg-gray-100/60 p-1 rounded-full border border-white/20">
              <span className="text-[10px] font-bold text-gray-500 px-2">Academic Year:</span>
              {([ 1, 2, 3, 4, 5, 6, 'all' ] as const).map((year) => {
                const isSel = selectedYear === year;
                const theme = year !== 'all' ? getSemesterTheme('Pharm.D', year) : null;
                const labelMap: Record<number, string> = { 1: 'Year I', 2: 'Year II', 3: 'Year III', 4: 'Year IV', 5: 'Year V', 6: 'Year VI' };
                const label = year === 'all' ? 'All Years' : labelMap[year];
                return (
                  <button
                    key={year}
                    onClick={() => setSelectedYear(year)}
                    className={`
                      text-[10px] font-extrabold px-3 py-1 rounded-full transition-all duration-200 border cursor-pointer
                      ${isSel 
                        ? theme ? `${theme.badge} shadow-sm ring-1 ring-current` : 'bg-white text-gray-900 border-gray-300 shadow-sm' 
                        : 'bg-transparent text-gray-500 border-transparent hover:text-gray-900'
                      }
                    `}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          ) : isMPharm ? (
            <div className="flex items-center gap-1 bg-gray-100/60 p-1 rounded-full border border-white/20">
              <span className="text-[10px] font-bold text-gray-500 px-2">Semester:</span>
              {([ 'all', 1, 2, 3, 4 ] as const).map((sem) => {
                const isSel = selectedSemester === sem;
                const theme = sem !== 'all' ? getSemesterTheme('M.Pharm', sem) : null;
                return (
                  <button
                    key={sem}
                    onClick={() => setSelectedSemester(sem)}
                    className={`
                      text-[10px] font-extrabold px-3 py-1 rounded-full transition-all duration-200 border cursor-pointer
                      ${isSel 
                        ? theme ? `${theme.badge} shadow-sm ring-1 ring-current` : 'bg-white text-gray-900 border-gray-300 shadow-sm' 
                        : 'bg-transparent text-gray-500 border-transparent hover:text-gray-900'
                      }
                    `}
                  >
                    {sem === 'all' ? 'All' : `Sem ${sem}`}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center gap-1 bg-gray-100/60 p-1 rounded-full border border-white/20">
              <span className="text-[10px] font-bold text-gray-500 px-2">Semester:</span>
              {([ 'all', 1, 2, 3, 4, 5, 6, 7, 8 ] as const).map((sem) => {
                const isSel = selectedSemester === sem;
                const theme = sem !== 'all' ? getSemesterTheme('B.Pharm', sem) : null;
                return (
                  <button
                    key={sem}
                    onClick={() => setSelectedSemester(sem)}
                    className={`
                      text-[10px] font-extrabold px-3 py-1 rounded-full transition-all duration-200 border cursor-pointer
                      ${isSel 
                        ? theme ? `${theme.badge} shadow-sm ring-1 ring-current` : 'bg-white text-gray-900 border-gray-300 shadow-sm' 
                        : 'bg-transparent text-gray-500 border-transparent hover:text-gray-900'
                      }
                    `}
                  >
                    {sem === 'all' ? 'All' : `Sem ${sem}`}
                  </button>
                );
              })}
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
            const semNum = sub.programme === 'Pharm.D' ? (sub.year || 1) : (sub.semester || 1);
            const semTheme = getSemesterTheme(sub.programme, semNum);

            return (
              <div 
                key={sub.id} 
                onClick={() => onGoToSubject(sub.id)}
                className={`
                  group relative p-6 flex flex-col justify-between h-72 rounded-3xl border bg-gradient-to-br transition-all duration-300 cursor-pointer overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1
                  ${semTheme.cardBg} ${semTheme.cardBorder} ${semTheme.hoverRing}
                `}
              >
                {/* Top Accent Strip */}
                <div className={`h-1.5 w-full ${semTheme.accentStrip} absolute top-0 left-0 right-0`} />

                <div>
                  {/* Meta Row */}
                  <div className="flex justify-between items-center mt-1">
                    <span className={`text-[10px] font-black tracking-widest px-2 py-0.5 rounded-lg border font-mono ${semTheme.codeChip}`}>
                      {sub.code}
                    </span>
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border shadow-sm ${semTheme.badge}`}>
                      {sub.programme === 'Pharm.D' 
                        ? `Year ${sub.year === 1 ? 'I' : sub.year === 2 ? 'II' : sub.year === 3 ? 'III' : sub.year === 4 ? 'IV' : sub.year === 5 ? 'V' : 'VI'}` 
                        : `Sem ${sub.semester}`}
                    </span>
                  </div>

                  {/* Redesigned Subject Name */}
                  <h3 className="mt-3 font-display font-extrabold text-base text-gray-900 group-hover:text-gray-950 transition-colors duration-300 line-clamp-2 leading-snug">
                    {sub.name}
                  </h3>

                  {/* Subject-In-Charge detail */}
                  <div className="mt-3 flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-full ${semTheme.bg} border ${semTheme.border} flex items-center justify-center shrink-0`}>
                      <GraduationCap className={`w-3.5 h-3.5 ${semTheme.text}`} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[8px] font-bold text-gray-400 uppercase tracking-wider">Subject-In-Charge</span>
                      <span className="text-[11px] font-bold text-gray-700 leading-none mt-0.5">{sub.facultyName}</span>
                    </div>
                  </div>
                </div>

                {/* Progress bar and Footer */}
                <div className="mt-4 pt-3 border-t border-gray-200/50">
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center text-[10px] font-bold">
                      <span className="text-gray-500 flex items-center gap-1">
                        <CheckCircle2 className={`w-3.5 h-3.5 ${semTheme.text}`} />
                        {completedLectures}/{totalLectures} Resources Finished
                      </span>
                      <span className={`font-black ${semTheme.text}`}>{sub.progress}%</span>
                    </div>
                    {/* Progress Bar with Semester Accent */}
                    <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden border border-gray-200/60">
                      <div 
                        className={`h-full ${semTheme.accentStrip} rounded-full transition-all duration-500`} 
                        style={{ width: `${sub.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Clean Interactive Action link */}
                  <div className="mt-3 flex items-center justify-between text-[10px] font-black uppercase tracking-wider">
                    <span className={`${semTheme.text} group-hover:translate-x-1 transition-transform duration-300`}>
                      Enter Course Classroom
                    </span>
                    <div className={`w-7 h-7 rounded-xl ${semTheme.buttonStyle} flex items-center justify-center transition-all duration-300`}>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
