import { useState } from 'react';
import { BookOpen, Award, Clock, ArrowRight, ArrowLeft, ChevronRight, Play, Calendar } from 'lucide-react';
import GlassCard from '../GlassCard';
import { Subject, Announcement, StudentProgress } from '../../types';
import { CANONICAL_SCHEDULES } from '../AcademicCalendarModule';

interface StudentDashboardProps {
  studentProgress: StudentProgress;
  subjects: Subject[];
  announcements: Announcement[];
  onGoToSubject: (subjectId: string) => void;
  onGoToScreen: (screenId: string) => void;
}

// Fixed marks database matching the curriculum evaluation standards
const marksLookup: Record<string, { sessionalI: number; sessionalII: number; sessionalIII?: number; semesterExam: number; maxSessional: number; maxSemester: number }> = {
  'BP101T': { sessionalI: 26, sessionalII: 28, semesterExam: 64, maxSessional: 30, maxSemester: 75 },
  'BP102T': { sessionalI: 24, sessionalII: 25, semesterExam: 59, maxSessional: 30, maxSemester: 75 },
  'BP103T': { sessionalI: 28, sessionalII: 29, semesterExam: 68, maxSessional: 30, maxSemester: 75 },
  'BP104T': { sessionalI: 23, sessionalII: 24, semesterExam: 58, maxSessional: 30, maxSemester: 75 },
  'BP105T': { sessionalI: 29, sessionalII: 28, semesterExam: 71, maxSessional: 30, maxSemester: 75 },
  'PD101': { sessionalI: 27, sessionalII: 26, sessionalIII: 28, semesterExam: 62, maxSessional: 30, maxSemester: 75 },
  'BP201T': { sessionalI: 25, sessionalII: 27, semesterExam: 65, maxSessional: 30, maxSemester: 75 },
};

export default function StudentDashboard({
  studentProgress,
  subjects,
  announcements,
  onGoToSubject,
  onGoToScreen,
}: StudentDashboardProps) {
  const [activeSubjectIdx, setActiveSubjectIdx] = useState(0);

  // Total resources count
  const totalResourcesCount = subjects.reduce((acc, sub) => acc + sub.resources.length, 0);

  const activeSubject = subjects[activeSubjectIdx] || null;
  const getStudentMarks = (subjectCode: string, registerNumber: string, programme: string) => {
    const saved = localStorage.getItem(`sessional_marks_${subjectCode}`);
    if (saved) {
      try {
        const cohort = JSON.parse(saved);
        const student = cohort.find((s: any) => s.registerNumber === registerNumber);
        if (student) {
          return {
            sessionalI: student.sessionalI,
            sessionalII: student.sessionalII,
            sessionalIII: student.sessionalIII || 0,
            semesterExam: Math.round(((student.gpa || 8.0) / 10) * 75),
            maxSessional: 30,
            maxSemester: 75
          };
        }
      } catch (e) {
        console.error(e);
      }
    }
    // Fallback to static marksLookup or general default
    const fallback = marksLookup[subjectCode] || { sessionalI: 22, sessionalII: 24, sessionalIII: 25, semesterExam: 56, maxSessional: 30, maxSemester: 75 };
    return {
      sessionalI: fallback.sessionalI,
      sessionalII: fallback.sessionalII,
      sessionalIII: fallback.sessionalIII || 0,
      semesterExam: fallback.semesterExam,
      maxSessional: fallback.maxSessional,
      maxSemester: fallback.maxSemester
    };
  };

  const currentMarks = activeSubject
    ? getStudentMarks(activeSubject.code, studentProgress.registerNumber, activeSubject.programme)
    : { sessionalI: 0, sessionalII: 0, sessionalIII: 0, semesterExam: 0, maxSessional: 30, maxSemester: 75 };

  const isPharmD = activeSubject?.programme === 'Pharm.D' || activeSubject?.code.startsWith('PD');
  const sessionalIIIVal = currentMarks.sessionalIII ?? (isPharmD ? 25 : 0);

  const sessionalIPct = (currentMarks.sessionalI / currentMarks.maxSessional) * 100;
  const sessionalIIPct = (currentMarks.sessionalII / currentMarks.maxSessional) * 100;
  const sessionalIIIPct = (sessionalIIIVal / currentMarks.maxSessional) * 100;
  const semesterExamPct = (currentMarks.semesterExam / currentMarks.maxSemester) * 100;

  const calculatedSessionalAvg = (() => {
    if (isPharmD) {
      const vals = [currentMarks.sessionalI, currentMarks.sessionalII, sessionalIIIVal].sort((a, b) => b - a);
      return ((vals[0] + vals[1]) / 2).toFixed(1);
    } else {
      return ((currentMarks.sessionalI + currentMarks.sessionalII) / 2).toFixed(1);
    }
  })();

  const handlePrevSubject = () => {
    setActiveSubjectIdx((prev) => (prev > 0 ? prev - 1 : subjects.length - 1));
  };

  const handleNextSubject = () => {
    setActiveSubjectIdx((prev) => (prev < subjects.length - 1 ? prev + 1 : 0));
  };

  // Helpers to resolve academic calendar schedules for active upcoming events
  const getSemesterString = (sem: number) => {
    const roman = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
    return `Semester ${roman[sem - 1] || sem}`;
  };

  const getYearString = (yr: number) => {
    const roman = ['I', 'II', 'III', 'IV', 'V', 'VI'];
    return `Year ${roman[yr - 1] || yr}`;
  };

  const studentSemOrYr = studentProgress.programme === 'B.Pharm'
    ? getSemesterString(studentProgress.semester)
    : getYearString(studentProgress.year);

  const studentSchedule = CANONICAL_SCHEDULES.find(
    s => s.programme === studentProgress.programme && s.semesterOrYear === studentSemOrYr
  );

  interface SessionalEvent {
    title: string;
    type: 'Practical' | 'Theory';
    date: string;
    category: string;
  }

  const studentEvents: SessionalEvent[] = [];
  if (studentSchedule) {
    studentEvents.push(
      { title: 'I Sessional Practical', type: 'Practical', date: studentSchedule.sessionalI.practical, category: 'I Sessional' },
      { title: 'I Sessional Theory', type: 'Theory', date: studentSchedule.sessionalI.theory, category: 'I Sessional' },
      { title: 'II Sessional Practical', type: 'Practical', date: studentSchedule.sessionalII.practical, category: 'II Sessional' },
      { title: 'II Sessional Theory', type: 'Theory', date: studentSchedule.sessionalII.theory, category: 'II Sessional' }
    );
    if (studentSchedule.programme === 'Pharm.D' && studentSchedule.sessionalIII) {
      studentEvents.push(
        { title: 'III Sessional Practical', type: 'Practical', date: studentSchedule.sessionalIII.practical, category: 'III Sessional' },
        { title: 'III Sessional Theory', type: 'Theory', date: studentSchedule.sessionalIII.theory, category: 'III Sessional' }
      );
    }
    studentEvents.push(
      { title: 'University Exam Practical', type: 'Practical', date: studentSchedule.universityExam.practical, category: 'University Exam' },
      { title: 'University Exam Theory', type: 'Theory', date: studentSchedule.universityExam.theory, category: 'University Exam' }
    );
  }

  const todayStr = '2026-07-16'; // System current local date
  const upcomingEvents = studentEvents
    .filter(evt => evt.date >= todayStr)
    .sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* 1. Large Keynote-Style Welcome Section */}
      <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-r from-[#6b172f] via-[#8B1E3F] to-[#CD4368] p-8 text-white shadow-xl shadow-maroon-900/10" id="welcome_section">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-white/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-gradient-to-tr from-black/20 to-transparent rounded-full blur-2xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-bold uppercase tracking-widest text-pink-200 bg-white/10 px-3 py-1 rounded-full w-max">
              Official Student Portal
            </span>
            <h1 className="font-display font-extrabold text-3xl md:text-4xl tracking-tight mt-2">
              Welcome back, {studentProgress.studentName}
            </h1>
          </div>
        </div>
      </div>

      {/* 2. Upcoming Sessional & CIA Schedule Track */}
      <div className="flex flex-col gap-4" id="upcoming_sessional_section">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="font-display font-extrabold text-lg text-gray-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#8B1E3F]" />
              Upcoming Sessional & CIA Schedule
            </h2>
            <p className="text-xs text-gray-500">Official examination timetable mapped for {studentProgress.programme} {studentSemOrYr}</p>
          </div>
          <button 
            onClick={() => onGoToScreen('academic-calendar')}
            className="text-xs font-bold text-[#8B1E3F] hover:underline"
          >
            Full Academic Calendar
          </button>
        </div>

        {upcomingEvents.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {upcomingEvents.slice(0, 4).map((evt, idx) => {
              // Calculate countdown
              const target = new Date(evt.date);
              const current = new Date(todayStr);
              const diffTime = target.getTime() - current.getTime();
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              const countdownText = diffDays === 0 ? 'Today' : diffDays === 1 ? 'Tomorrow' : `In ${diffDays} days`;
              
              const isSessionalI = evt.category === 'I Sessional';
              const isSessionalII = evt.category === 'II Sessional';
              const isSessionalIII = evt.category === 'III Sessional';
              
              const badgeColors = isSessionalI 
                ? 'bg-blue-50 text-blue-700 border-blue-100' 
                : isSessionalII 
                ? 'bg-purple-50 text-purple-700 border-purple-100'
                : isSessionalIII
                ? 'bg-amber-50 text-amber-700 border-amber-100'
                : 'bg-emerald-50 text-emerald-700 border-emerald-100';

              return (
                <GlassCard key={idx} hoverLift className="p-5 flex flex-col justify-between border-l-4 border-l-[#8B1E3F]">
                  <div className="flex flex-col gap-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${badgeColors}`}>
                        {evt.category}
                      </span>
                      <span className="text-[10px] font-bold text-gray-400 font-mono">
                        {evt.type}
                      </span>
                    </div>

                    <h3 className="font-display font-extrabold text-sm text-gray-900 leading-snug">
                      {evt.title}
                    </h3>

                    <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      <span>{new Date(evt.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Countdown</span>
                    <span className="text-xs font-black text-[#8B1E3F] bg-[#8B1E3F]/5 px-2.5 py-0.5 rounded-md font-mono">
                      {countdownText}
                    </span>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-gray-400 border border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
            No upcoming examination events found for the current term.
          </div>
        )}
      </div>

      {/* 3. Center Section: Active Marks Graph */}
      <div className="w-full">
        {/* Dynamic Subject Marks Progression Chart */}
        <GlassCard className="w-full p-6 flex flex-col justify-between" id="marks_progression_card">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="font-display font-extrabold text-base text-gray-900">Subject Marks Performance</h3>
                <p className="text-xs text-gray-500 mt-0.5">Sessional assessments and end semester examination scores tracking.</p>
              </div>
              
              {/* Arrow Controller to switch subjects */}
              <div className="flex items-center gap-3 bg-gray-100/50 p-1 rounded-2xl border border-white shrink-0 self-start sm:self-auto">
                <button 
                  onClick={handlePrevSubject}
                  className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#8B1E3F] hover:bg-[#8B1E3F] hover:text-white transition-all duration-300 shadow-sm border border-gray-150"
                  title="Previous Subject"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div className="px-1 text-center min-w-[70px]">
                  <span className="text-xs font-extrabold text-gray-800 uppercase tracking-widest font-mono block">
                    {activeSubject ? activeSubject.code : 'BP000'}
                  </span>
                </div>
                <button 
                  onClick={handleNextSubject}
                  className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#8B1E3F] hover:bg-[#8B1E3F] hover:text-white transition-all duration-300 shadow-sm border border-gray-150"
                  title="Next Subject"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {activeSubject ? (
              <div className="flex flex-col gap-6 animate-fadeIn">
                
                {/* Active Subject Bio */}
                <div className="p-4 bg-[#8B1E3F]/5 border border-[#8B1E3F]/10 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-xs font-black text-[#8B1E3F] uppercase tracking-wide">Active Track</h4>
                    <p className="text-sm font-extrabold text-gray-800 mt-0.5">{activeSubject.name}</p>
                  </div>
                  <span className="text-[10px] font-semibold text-gray-400 bg-white border border-gray-100 px-3 py-1.5 rounded-full shrink-0">
                    Subject-In-Charge: {activeSubject.facultyName}
                  </span>
                </div>

                {/* Custom bar graph for Sessional assessments */}
                <div className="h-44 w-full relative bg-gray-50/50 rounded-2xl border border-white p-4 flex flex-col justify-between overflow-hidden">
                  {/* Background Grid Lines */}
                  <div className="absolute inset-x-4 top-4 bottom-12 flex flex-col justify-between pointer-events-none">
                    <div className="border-b border-gray-100/70 w-full h-0" />
                    <div className="border-b border-gray-100/70 w-full h-0" />
                    <div className="border-b border-gray-100/70 w-full h-0" />
                    <div className="border-b border-gray-200 w-full h-0" />
                  </div>
                  
                  {/* Bars Container */}
                  <div className="relative z-10 flex h-28 items-end justify-around px-2">
                    {/* Bar 1: Sessional I */}
                    <div className="flex flex-col items-center gap-1.5 h-full justify-end w-20 group">
                      <span className="text-[10px] font-black text-[#8B1E3F]">
                        {currentMarks.sessionalI}/30
                      </span>
                      <div 
                        className="w-8 bg-gradient-to-t from-[#8B1E3F]/80 to-[#8B1E3F] rounded-t-lg shadow-sm transition-all duration-300 hover:scale-105" 
                        style={{ height: `${sessionalIPct}%` }}
                      />
                      <span className="text-[10px] font-bold text-gray-500 whitespace-nowrap">Sess I</span>
                    </div>

                    {/* Bar 2: Sessional II */}
                    <div className="flex flex-col items-center gap-1.5 h-full justify-end w-20 group">
                      <span className="text-[10px] font-black text-[#8B1E3F]">
                        {currentMarks.sessionalII}/30
                      </span>
                      <div 
                        className="w-8 bg-gradient-to-t from-[#8B1E3F]/80 to-[#8B1E3F] rounded-t-lg shadow-sm transition-all duration-300 hover:scale-105" 
                        style={{ height: `${sessionalIIPct}%` }}
                      />
                      <span className="text-[10px] font-bold text-gray-500 whitespace-nowrap">Sess II</span>
                    </div>

                    {/* Bar 3: Sessional III (Pharm.D Only) */}
                    {isPharmD && (
                      <div className="flex flex-col items-center gap-1.5 h-full justify-end w-20 group">
                        <span className="text-[10px] font-black text-[#8B1E3F]">
                          {sessionalIIIVal}/30
                        </span>
                        <div 
                          className="w-8 bg-gradient-to-t from-[#8B1E3F]/80 to-[#8B1E3F] rounded-t-lg shadow-sm transition-all duration-300 hover:scale-105" 
                          style={{ height: `${sessionalIIIPct}%` }}
                        />
                        <span className="text-[10px] font-bold text-gray-500 whitespace-nowrap">Sess III</span>
                      </div>
                    )}

                  </div>

                  {/* Horizontal Labels */}
                  <div className="flex justify-between items-center text-[9px] font-extrabold text-gray-400 font-mono px-2 mt-2 border-t border-gray-100 pt-1.5">
                    <span>Max Sessional: 30 Marks</span>
                  </div>
                </div>

                {/* Score breakdown metrics list */}
                <div className={`grid grid-cols-1 ${isPharmD ? 'sm:grid-cols-3' : 'sm:grid-cols-2'} gap-4`}>
                  <div className="p-3 bg-gray-50/50 border border-white rounded-2xl">
                    <span className="text-[9px] font-black uppercase text-gray-400 block">Sessional I</span>
                    <p className="text-base font-extrabold text-gray-800 mt-0.5">{currentMarks.sessionalI} <span className="text-xs text-gray-400 font-medium">/ 30 Max</span></p>
                    <div className="w-full bg-gray-100 h-1.5 rounded-full mt-2 overflow-hidden">
                      <div className="bg-[#8B1E3F] h-full rounded-full" style={{ width: `${sessionalIPct}%` }} />
                    </div>
                  </div>

                  <div className="p-3 bg-gray-50/50 border border-white rounded-2xl">
                    <span className="text-[9px] font-black uppercase text-gray-400 block">Sessional II</span>
                    <p className="text-base font-extrabold text-gray-800 mt-0.5">{currentMarks.sessionalII} <span className="text-xs text-gray-400 font-medium">/ 30 Max</span></p>
                    <div className="w-full bg-gray-100 h-1.5 rounded-full mt-2 overflow-hidden">
                      <div className="bg-[#8B1E3F] h-full rounded-full" style={{ width: `${sessionalIIPct}%` }} />
                    </div>
                  </div>

                  {isPharmD && (
                    <div className="p-3 bg-gray-50/50 border border-white rounded-2xl">
                      <span className="text-[9px] font-black uppercase text-gray-400 block">Sessional III</span>
                      <p className="text-base font-extrabold text-gray-800 mt-0.5">{sessionalIIIVal} <span className="text-xs text-gray-400 font-medium">/ 30 Max</span></p>
                      <div className="w-full bg-gray-100 h-1.5 rounded-full mt-2 overflow-hidden">
                        <div className="bg-[#8B1E3F] h-full rounded-full" style={{ width: `${sessionalIIIPct}%` }} />
                      </div>
                    </div>
                  )}
                </div>

              </div>
            ) : (
              <div className="p-12 text-center text-xs text-gray-400 font-semibold">
                No active subjects mapped to display.
              </div>
            )}
          </div>

          <div className="flex justify-end items-center mt-4 border-t border-gray-100 pt-4">
            <button 
              onClick={() => onGoToScreen('student-progress')}
              className="text-xs font-black text-[#8B1E3F] flex items-center gap-1 hover:underline"
            >
              Analyze Progress <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </GlassCard>
      </div>

      {/* 4. Continue Learning Course Widgets */}
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="font-display font-bold text-lg text-gray-900">Continue Learning</h2>
            <p className="text-xs text-gray-500">Pick up where you left off in your professional curriculum</p>
          </div>
          <button 
            onClick={() => onGoToScreen('student-subjects')}
            className="text-xs font-bold text-[#8B1E3F] flex items-center gap-1 hover:underline"
          >
            All Subjects <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(() => {
            const activeSemesterSubjects = subjects.filter((sub) => {
              const matchesProg = sub.programme === studentProgress.programme;
              if (studentProgress.programme === 'B.Pharm') {
                return matchesProg && sub.semester === studentProgress.semester;
              } else {
                return matchesProg && sub.year === studentProgress.year;
              }
            });

            if (activeSemesterSubjects.length === 0) {
              return (
                <div className="col-span-full p-8 text-center text-xs text-gray-400 border border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
                  No active subjects for the current term.
                </div>
              );
            }

            return activeSemesterSubjects.slice(0, 3).map((sub) => {
              const completedCount = sub.resources.filter(r => r.status === 'completed').length;
              const totalCount = sub.resources.length;
              const badgeText = sub.programme === 'B.Pharm' ? `Semester ${sub.semester}` : `Year ${sub.year}`;

              // Calculate actual sessional marks average out of 30
              const marks = getStudentMarks(sub.code, studentProgress.registerNumber, sub.programme);
              const subIsPharmD = sub.programme === 'Pharm.D' || sub.code.startsWith('PD');
              const sessionalAvg = (() => {
                const s3 = marks.sessionalIII ?? 0;
                if (subIsPharmD) {
                  const vals = [marks.sessionalI, marks.sessionalII, s3].sort((a, b) => b - a);
                  return ((vals[0] + vals[1]) / 2);
                } else {
                  return ((marks.sessionalI + marks.sessionalII) / 2);
                }
              })();
              const sessionalAvgStr = sessionalAvg.toFixed(1);
              const sessionalAvgPct = (sessionalAvg / 30) * 100;

              return (
                <GlassCard key={sub.id} hoverLift className="p-6 flex flex-col justify-between h-56">
                  <div>
                    {/* Card Header with frosted tag */}
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{sub.code}</span>
                      <span className="text-[10px] font-bold bg-[#8B1E3F]/5 text-[#8B1E3F] px-2.5 py-1 rounded-full border border-[#8B1E3F]/10">
                        {badgeText}
                      </span>
                    </div>

                    <h3 className="font-display font-bold text-base text-gray-900 line-clamp-1 mb-1">{sub.name}</h3>
                    <p className="text-xs text-gray-500 mb-4">{sub.facultyName}</p>

                    {/* Sessional average indicator */}
                    <div className="flex flex-col gap-1.5 mb-4">
                      <div className="flex justify-between text-[10px] font-bold text-gray-500">
                        <span>Sessional Mark Average</span>
                        <span className="text-[#8B1E3F] font-black">{sessionalAvgStr} <span className="text-[9px] font-normal text-gray-400">/ 30 Max</span></span>
                      </div>
                      <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden mt-1">
                        <div className="bg-[#8B1E3F] h-full rounded-full transition-all duration-500" style={{ width: `${sessionalAvgPct}%` }} />
                      </div>
                    </div>
                  </div>

                  {/* Footer details with Action button */}
                  <div className="flex justify-between items-center border-t border-gray-100 pt-3">
                    <span className="text-[10px] font-bold text-gray-400">
                      {completedCount}/{totalCount} Completed
                    </span>
                    
                    <button
                      onClick={() => onGoToSubject(sub.id)}
                      className="flex items-center gap-1.5 text-xs font-bold text-[#8B1E3F] hover:text-[#b32a4e] transition-colors bg-[#8B1E3F]/10 hover:bg-[#8B1E3F]/20 px-3 py-1.5 rounded-full"
                    >
                      Resume <Play className="w-3 h-3 fill-current" />
                    </button>
                  </div>
                </GlassCard>
              );
            });
          })()}
        </div>
      </div>

      {/* 5. Latest Announcements (Moved to bottom) */}
      <div className="flex flex-col gap-4 mt-2" id="announcements_bottom_section">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="font-display font-bold text-lg text-gray-900">Latest Announcements</h2>
            <p className="text-xs text-gray-500">Official circulars and notifications from the administration</p>
          </div>
          <button 
            onClick={() => onGoToScreen('student-announcements')}
            className="text-xs font-bold text-[#8B1E3F] hover:underline"
          >
            View All Announcements
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {announcements.slice(0, 3).map((ann) => (
            <GlassCard 
              key={ann.id} 
              hoverLift 
              className="p-5 flex flex-col justify-between h-48 cursor-pointer"
              onClick={() => onGoToScreen('student-announcements')}
            >
              <div>
                <div className="flex items-center gap-1.5 justify-between mb-3">
                  <span className={`text-[9px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                    ann.category === 'exam' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-blue-50 text-blue-600 border border-blue-100'
                  }`}>
                    {ann.category}
                  </span>
                  <span className="text-[9px] text-gray-400 font-semibold">{ann.date}</span>
                </div>
                <h4 className="text-xs font-bold text-gray-800 line-clamp-1 mb-1">{ann.title}</h4>
                <p className="text-[10px] text-gray-500 line-clamp-3 leading-relaxed">{ann.content}</p>
              </div>

              <div className="text-[9px] text-gray-400 font-bold border-t border-gray-100 pt-2 text-right mt-3">
                {ann.sender}
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </div>
  );
}
