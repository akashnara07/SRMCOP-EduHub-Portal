import { useState, useEffect } from 'react';
import { Award, Clock, TrendingUp, BarChart3, Info } from 'lucide-react';
import GlassCard from '../GlassCard';
import { getAppSubjects } from '../../data/curriculumDb';
import { getSemesterTheme } from '../../lib/semesterColors';

interface StudentProgressProps {
  selectedProgramme?: 'B.Pharm' | 'Pharm.D' | 'M.Pharm';
}

export default function StudentProgress({ selectedProgramme }: StudentProgressProps) {
  const activeProg = selectedProgramme || 'B.Pharm';
  const [selectedSemester, setSelectedSemester] = useState<number>(1);

  const isPharmD = activeProg === 'Pharm.D';
  const isMPharm = activeProg === 'M.Pharm';
  const isBPharm = activeProg === 'B.Pharm';

  const maxSemesters = isPharmD ? 6 : isMPharm ? 4 : 8;

  useEffect(() => {
    // Reset to term 1 if out of bounds
    if (selectedSemester > maxSemesters) {
      setSelectedSemester(1);
    }
  }, [activeProg, maxSemesters]);

  const getRealMarks = (subCode: string) => {
    const cleanCode = subCode.endsWith('T') ? subCode.slice(0, -1) : subCode;
    const keyCandidates = [`sessional_marks_${subCode}`, `sessional_marks_${cleanCode}`];
    
    for (const key of keyCandidates) {
      const saved = localStorage.getItem(key);
      if (saved) {
        try {
          const cohort = JSON.parse(saved);
          const activeStudentInCohort = cohort.find((s: any) => s.registerNumber) || cohort[0];
          if (
            activeStudentInCohort &&
            activeStudentInCohort.sessionalI !== undefined &&
            activeStudentInCohort.sessionalI !== null &&
            activeStudentInCohort.sessionalI !== ''
          ) {
            const s1 = Number(activeStudentInCohort.sessionalI);
            const s2 = Number(activeStudentInCohort.sessionalII || 0);
            const s3 = Number(activeStudentInCohort.sessionalIII || 0);
            
            let avg = 0;
            if (isPharmD) {
              const sorted = [s1, s2, s3].sort((a, b) => b - a);
              avg = (sorted[0] + sorted[1]) / 2;
            } else {
              avg = (s1 + s2) / 2;
            }

            const semExam = activeStudentInCohort.semesterExam !== undefined &&
              activeStudentInCohort.semesterExam !== null &&
              activeStudentInCohort.semesterExam !== ''
                ? Number(activeStudentInCohort.semesterExam)
                : null;

            return {
              sessionalI: s1,
              sessionalII: s2,
              sessionalIII: isPharmD ? s3 : null,
              bestOf2Sessional: avg,
              semesterExam: semExam,
              totalMarks: semExam !== null ? Math.round(avg) + semExam : null,
              grade: activeStudentInCohort.grade || null,
              hasMarks: true
            };
          }
        } catch (e) {
          console.error(e);
        }
      }
    }

    return {
      sessionalI: null,
      sessionalII: null,
      sessionalIII: null,
      bestOf2Sessional: null,
      semesterExam: null,
      totalMarks: null,
      grade: null,
      hasMarks: false
    };
  };

  const allSubjects = getAppSubjects();
  const currentSubjects = allSubjects.filter(sub => {
    if (isPharmD) {
      return sub.programme === 'Pharm.D' && sub.year === selectedSemester;
    } else if (isMPharm) {
      return sub.programme === 'M.Pharm' && sub.semester === selectedSemester;
    } else {
      return sub.programme === 'B.Pharm' && sub.semester === selectedSemester;
    }
  });

  const currentStudentProgress = currentSubjects.map((sub) => {
    const marks = getRealMarks(sub.code);
    return {
      code: sub.code,
      name: sub.name,
      ...marks
    };
  });

  // Calculate stats ONLY from subjects that have uploaded marks
  const subsWithSessionalMarks = currentStudentProgress.filter((s) => s.hasMarks && s.bestOf2Sessional !== null);
  const avgSessional = subsWithSessionalMarks.length > 0
    ? (subsWithSessionalMarks.reduce((acc, sub) => acc + (sub.bestOf2Sessional || 0), 0) / subsWithSessionalMarks.length).toFixed(1)
    : '-';

  const subsWithTotalMarks = currentStudentProgress.filter((s) => s.hasMarks && s.totalMarks !== null);
  const avgSemesterPercent = subsWithTotalMarks.length > 0
    ? (subsWithTotalMarks.reduce((acc, sub) => acc + (sub.totalMarks || 0), 0) / subsWithTotalMarks.length).toFixed(1)
    : '-';

  const avgSgpa = avgSemesterPercent !== '-' ? (Number(avgSemesterPercent) / 10).toFixed(2) : '-';

  return (
    <div className="flex flex-col gap-8 w-full max-w-5xl mx-auto pb-12">
      <div className="flex flex-col items-center text-center gap-4">
        <div>
          <div className="inline-flex items-center gap-2 bg-[#8B1E3F]/10 border border-[#8B1E3F]/20 text-[#8B1E3F] px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider mb-2">
            <span>{activeProg}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#8B1E3F]" />
            <span>{isPharmD ? 'Year-wise Progression' : 'Semester Progression'}</span>
          </div>
          <h1 className="font-display font-extrabold text-2xl text-gray-900 tracking-tight">Academic Progress</h1>
          <p className="text-xs text-gray-500 font-medium mt-1">
            Official Course & Performance Records ({activeProg})
          </p>
        </div>

        {/* Color-Coded Term/Semester/Year Selector */}
        <div className="flex items-center justify-center gap-2 bg-white p-2.5 rounded-2xl border border-gray-150 shadow-sm overflow-x-auto max-w-full">
          {Array.from({ length: maxSemesters }, (_, i) => i + 1).map((val) => {
            const semTheme = getSemesterTheme(activeProg, val);
            const isSelected = selectedSemester === val;

            return (
              <button
                key={val}
                onClick={() => setSelectedSemester(val)}
                className={`
                  px-4 py-2 rounded-xl text-xs font-black border transition-all duration-200 whitespace-nowrap shadow-sm cursor-pointer
                  ${isSelected 
                    ? `${semTheme.bg} ${semTheme.text} ${semTheme.border} ring-2 ring-offset-1 ring-current shadow-md`
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
              >
                <span className={`inline-block w-2.5 h-2.5 rounded-full mr-2 ${semTheme.dotBg}`} />
                {isPharmD ? `Year ${val}` : `Semester ${val}`}
              </button>
            );
          })}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Sessional Performance Average */}
        <GlassCard className="p-6 border-l-4 border-l-[#8B1E3F]">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Sessional Average</span>
            <span className="text-[9px] font-bold text-[#8B1E3F] bg-[#8B1E3F]/5 px-2 py-0.5 rounded-full">Max: 30</span>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-display font-black text-gray-900">{avgSessional}</span>
            {avgSessional !== '-' && (
              <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" /> Standing
              </span>
            )}
          </div>
          <p className="text-[10px] text-gray-400 mt-2 font-semibold">
            {subsWithSessionalMarks.length > 0 ? `${activeProg} sessional score rating` : 'No sessional marks uploaded yet'}
          </p>
        </GlassCard>

        {/* Semester Marks Average */}
        <GlassCard className="p-6 border-l-4 border-l-emerald-500">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Semester Grade (SGPA)</span>
            <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Max: 10.0</span>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-display font-black text-gray-900">{avgSgpa}</span>
            {avgSgpa !== '-' && <span className="text-xs text-emerald-600 font-bold">Evaluated</span>}
          </div>
          <p className="text-[10px] text-gray-400 mt-2 font-semibold">
            {subsWithTotalMarks.length > 0 ? 'Semester performance grade point average' : 'Semester exams pending evaluation'}
          </p>
        </GlassCard>

        {/* Course Outcomes Attainment */}
        <GlassCard className="p-6 border-l-4 border-l-purple-500">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">CO Attainment</span>
            <span className="text-[9px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">Max Index: 3.0</span>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-display font-black text-gray-900">
              {subsWithSessionalMarks.length > 0 && avgSessional !== '-' 
                ? (Number(avgSessional) / 30 * 3.0).toFixed(2)
                : '-'}
            </span>
          </div>
          <p className="text-[10px] text-gray-400 mt-2 font-semibold">
            {subsWithSessionalMarks.length > 0 ? 'PCI outcome accomplishment rating' : 'Attainment evaluation pending'}
          </p>
        </GlassCard>
      </div>

      {/* Sessional Marks Panel */}
      <div className="flex flex-col gap-4">
        <div className="border-b border-[#8B1E3F]/10 pb-2 flex items-center justify-between">
          <h2 className="font-display font-bold text-sm text-[#8B1E3F] uppercase tracking-wider flex items-center gap-1.5">
            <BarChart3 className="w-4 h-4" /> 1. Sessional Marks Breakdown ({isPharmD ? 'Year' : 'Semester'} {selectedSemester})
          </h2>
          {subsWithSessionalMarks.length === 0 && (
            <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Info className="w-3 h-3" /> No sessional marks uploaded yet by faculty
            </span>
          )}
        </div>

        <div className="bg-white border border-gray-150/40 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100 text-[10px] uppercase font-bold text-gray-400">
                  <th className="p-4">Subject Code</th>
                  <th className="p-4">Subject Title</th>
                  <th className="p-4 text-center">Sessional I (30)</th>
                  <th className="p-4 text-center">Sessional II (30)</th>
                  {isPharmD && <th className="p-4 text-center">Sessional III (30)</th>}
                  <th className="p-4 text-center bg-[#8B1E3F]/5 text-[#8B1E3F]">Sessional Avg (30)</th>
                </tr>
              </thead>
              <tbody>
                {currentStudentProgress.map((sub, index) => (
                  <tr key={`${sub.code}-sessional-${index}`} className="border-b border-gray-50 hover:bg-gray-50/30 transition-all font-semibold text-gray-700">
                    <td className="p-4 font-mono font-bold text-[#8B1E3F]">{sub.code}</td>
                    <td className="p-4 text-gray-900 font-extrabold">{sub.name}</td>
                    <td className="p-4 text-center font-mono font-bold text-gray-500">
                      {sub.sessionalI !== null ? sub.sessionalI : '-'}
                    </td>
                    <td className="p-4 text-center font-mono font-bold text-gray-500">
                      {sub.sessionalII !== null ? sub.sessionalII : '-'}
                    </td>
                    {isPharmD && (
                      <td className="p-4 text-center font-mono font-bold text-gray-500">
                        {sub.sessionalIII !== null ? sub.sessionalIII : '-'}
                      </td>
                    )}
                    <td className="p-4 text-center font-mono font-black bg-[#8B1E3F]/5 text-[#8B1E3F] text-sm">
                      {sub.bestOf2Sessional !== null ? sub.bestOf2Sessional.toFixed(1) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Semester Marks Panel */}
      <div className="flex flex-col gap-4">
        <div className="border-b border-[#8B1E3F]/10 pb-2">
          <h2 className="font-display font-bold text-sm text-[#8B1E3F] uppercase tracking-wider flex items-center gap-1.5">
            <Award className="w-4 h-4" /> 2. Semester Examination ({isPharmD ? 'Year' : 'Semester'} {selectedSemester})
          </h2>
        </div>

        <div className="bg-white border border-gray-150/40 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100 text-[10px] uppercase font-bold text-gray-400">
                  <th className="p-4">Subject Code</th>
                  <th className="p-4">Subject Title</th>
                  <th className="p-4 text-center">Grade</th>
                  <th className="p-4 text-center">Result</th>
                </tr>
              </thead>
              <tbody>
                {currentStudentProgress.map((sub, index) => (
                  <tr key={`${sub.code}-semester-${index}`} className="border-b border-gray-50 hover:bg-gray-50/30 transition-all font-semibold text-gray-700">
                    <td className="p-4 font-mono font-bold text-[#8B1E3F]">{sub.code}</td>
                    <td className="p-4 text-gray-900 font-extrabold">{sub.name}</td>
                    <td className="p-4 text-center">
                      {sub.grade ? (
                        <span className="bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full font-black text-[10px] border border-emerald-100">
                          {sub.grade}
                        </span>
                      ) : (
                        <span className="text-gray-400 font-bold text-xs">-</span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      {sub.grade ? (
                        <span className="text-emerald-600 font-black text-[10px] uppercase tracking-wide">
                          Pass
                        </span>
                      ) : (
                        <span className="text-amber-600 font-semibold text-[10px] uppercase tracking-wide bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/50">
                          Pending
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

