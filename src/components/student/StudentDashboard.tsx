import { useState } from 'react';
import { BookOpen, Award, Clock, ArrowRight, ArrowLeft, ChevronRight, Play } from 'lucide-react';
import GlassCard from '../GlassCard';
import { Subject, Announcement, StudentProgress } from '../../types';

interface StudentDashboardProps {
  studentProgress: StudentProgress;
  subjects: Subject[];
  announcements: Announcement[];
  onGoToSubject: (subjectId: string) => void;
  onGoToScreen: (screenId: string) => void;
}

// Fixed marks database matching the curriculum evaluation standards
const marksLookup: Record<string, { sessionalI: number; sessionalII: number; semesterExam: number; maxSessional: number; maxSemester: number }> = {
  'BP101T': { sessionalI: 26, sessionalII: 28, semesterExam: 64, maxSessional: 30, maxSemester: 75 },
  'BP102T': { sessionalI: 24, sessionalII: 25, semesterExam: 59, maxSessional: 30, maxSemester: 75 },
  'BP103T': { sessionalI: 28, sessionalII: 29, semesterExam: 68, maxSessional: 30, maxSemester: 75 },
  'BP104T': { sessionalI: 23, sessionalII: 24, semesterExam: 58, maxSessional: 30, maxSemester: 75 },
  'BP105T': { sessionalI: 29, sessionalII: 28, semesterExam: 71, maxSessional: 30, maxSemester: 75 },
  'PD101': { sessionalI: 27, sessionalII: 26, semesterExam: 62, maxSessional: 30, maxSemester: 75 },
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
  const currentMarks = activeSubject
    ? (marksLookup[activeSubject.code] || { sessionalI: 22, sessionalII: 24, semesterExam: 56, maxSessional: 30, maxSemester: 75 })
    : { sessionalI: 0, sessionalII: 0, semesterExam: 0, maxSessional: 30, maxSemester: 75 };

  const sessionalIPct = (currentMarks.sessionalI / currentMarks.maxSessional) * 100;
  const sessionalIIPct = (currentMarks.sessionalII / currentMarks.maxSessional) * 100;
  const semesterExamPct = (currentMarks.semesterExam / currentMarks.maxSemester) * 100;

  // Calculate coordinates for the SVG graph (viewBox="0 0 500 150")
  // Let y be mapped from 125 (0%) to 25 (100%)
  const getY = (pct: number) => 125 - (pct / 100) * 95;
  const y1 = getY(sessionalIPct);
  const y2 = getY(sessionalIIPct);
  const y3 = getY(semesterExamPct);

  const handlePrevSubject = () => {
    setActiveSubjectIdx((prev) => (prev > 0 ? prev - 1 : subjects.length - 1));
  };

  const handleNextSubject = () => {
    setActiveSubjectIdx((prev) => (prev < subjects.length - 1 ? prev + 1 : 0));
  };

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

      {/* 2. Glass Statistic Cards Row (Shorter, cleaner stats removing 'Semester Grades') */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" id="stats_cards">
        {[
          { label: 'Active Enrolled Subjects', value: subjects.length, desc: 'Across B.Pharm Course', icon: BookOpen, color: 'text-blue-500 bg-blue-500/10' },
          { label: 'Learning Resources', value: totalResourcesCount, desc: 'Videos, PDFs, Notes', icon: Clock, color: 'text-amber-500 bg-amber-500/10' },
          { label: 'Upcoming Sessional Tests', value: 2, desc: 'Integumentary, Titration', icon: Award, color: 'text-purple-500 bg-purple-500/10' },
          { label: 'Registered Course Credits', value: subjects.length * 4, desc: 'Active PCI Curriculum', icon: Award, color: 'text-rose-500 bg-rose-500/10' },
        ].map((stat, i) => (
          <GlassCard key={i} hoverLift className="p-6">
            <div className="flex justify-between items-start">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-gray-500">{stat.label}</span>
                <span className="text-3xl font-display font-black text-gray-900 tracking-tight mt-1">{stat.value}</span>
                <span className="text-[10px] font-medium text-gray-400 mt-1">{stat.desc}</span>
              </div>
              <div className={`w-11 h-11 rounded-full flex items-center justify-center ${stat.color} border border-white/40 shadow-sm shadow-black/5`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* 3. Center Section: Active Marks Graph & Announcements Bulletins */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Dynamic Subject Marks Progression Chart */}
        <GlassCard className="lg:col-span-2 p-6 flex flex-col justify-between" id="marks_progression_card">
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
                    Lead: {activeSubject.facultyName}
                  </span>
                </div>

                {/* Custom SVG line graph for Sessional 1, Sessional 2, Semester Exam */}
                <div className="h-44 w-full relative bg-gray-50/50 rounded-2xl border border-white p-4 flex flex-col justify-between">
                  <svg className="w-full h-full" viewBox="0 0 500 150">
                    <defs>
                      <linearGradient id="marksGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#8B1E3F" stopOpacity="0.15" />
                        <stop offset="100%" stopColor="#8B1E3F" stopOpacity="0" />
                      </linearGradient>
                    </defs>

                    {/* Horizontal Reference Lines */}
                    <line x1="30" y1="30" x2="470" y2="30" stroke="#f1f3f9" strokeWidth="1" strokeDasharray="3,3" />
                    <line x1="30" y1="77.5" x2="470" y2="77.5" stroke="#f1f3f9" strokeWidth="1" strokeDasharray="3,3" />
                    <line x1="30" y1="125" x2="470" y2="125" stroke="#eef0f6" strokeWidth="1" />

                    {/* Shaded Area under the curve */}
                    <path
                      d={`M 60 ${y1} C 145 ${y1}, 205 ${y2}, 250 ${y2} C 295 ${y2}, 355 ${y3}, 440 ${y3} L 440 125 L 60 125 Z`}
                      fill="url(#marksGrad)"
                    />

                    {/* The main trend line */}
                    <path
                      d={`M 60 ${y1} C 145 ${y1}, 205 ${y2}, 250 ${y2} C 295 ${y2}, 355 ${y3}, 440 ${y3}`}
                      fill="none"
                      stroke="#8B1E3F"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />

                    {/* Vertical reference guidelines */}
                    <line x1="60" y1="125" x2="60" y2={y1} stroke="#8B1E3F" strokeWidth="1" strokeDasharray="2,2" strokeOpacity="0.4" />
                    <line x1="250" y1="125" x2="250" y2={y2} stroke="#8B1E3F" strokeWidth="1" strokeDasharray="2,2" strokeOpacity="0.4" />
                    <line x1="440" y1="125" x2="440" y2={y3} stroke="#8B1E3F" strokeWidth="1" strokeDasharray="2,2" strokeOpacity="0.4" />

                    {/* Node Circles */}
                    {/* Sessional 1 Node */}
                    <circle cx="60" cy={y1} r="5" fill="#8B1E3F" stroke="#ffffff" strokeWidth="2.5" />
                    {/* Sessional 2 Node */}
                    <circle cx="250" cy={y2} r="5" fill="#8B1E3F" stroke="#ffffff" strokeWidth="2.5" />
                    {/* Semester Exam Node */}
                    <circle cx="440" cy={y3} r="7" fill="#8B1E3F" stroke="#ffffff" strokeWidth="3" className="animate-pulse" />
                    <circle cx="440" cy={y3} r="5" fill="#8B1E3F" stroke="#ffffff" strokeWidth="2" />
                  </svg>

                  {/* Horizontal Labels */}
                  <div className="flex justify-between items-center text-[10px] font-extrabold text-gray-400 font-mono px-6">
                    <span className="text-[#8B1E3F]">Sessional I ({sessionalIPct.toFixed(0)}%)</span>
                    <span className="text-[#8B1E3F]">Sessional II ({sessionalIIPct.toFixed(0)}%)</span>
                    <span className="text-emerald-700">Semester Exam ({semesterExamPct.toFixed(0)}%)</span>
                  </div>
                </div>

                {/* Score breakdown metrics list */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-3 bg-gray-50/50 border border-white rounded-2xl">
                    <span className="text-[9px] font-black uppercase text-gray-400 block">Sessional 1 Marks</span>
                    <p className="text-base font-extrabold text-gray-800 mt-0.5">{currentMarks.sessionalI} <span className="text-xs text-gray-400 font-medium">/ {currentMarks.maxSessional} Max</span></p>
                    <div className="w-full bg-gray-100 h-1.5 rounded-full mt-2 overflow-hidden">
                      <div className="bg-[#8B1E3F] h-full rounded-full" style={{ width: `${sessionalIPct}%` }} />
                    </div>
                  </div>

                  <div className="p-3 bg-gray-50/50 border border-white rounded-2xl">
                    <span className="text-[9px] font-black uppercase text-gray-400 block">Sessional 2 Marks</span>
                    <p className="text-base font-extrabold text-gray-800 mt-0.5">{currentMarks.sessionalII} <span className="text-xs text-gray-400 font-medium">/ {currentMarks.maxSessional} Max</span></p>
                    <div className="w-full bg-gray-100 h-1.5 rounded-full mt-2 overflow-hidden">
                      <div className="bg-[#8B1E3F] h-full rounded-full" style={{ width: `${sessionalIIPct}%` }} />
                    </div>
                  </div>

                  <div className="p-3 bg-emerald-50/20 border border-white rounded-2xl">
                    <span className="text-[9px] font-black uppercase text-emerald-600 block">Semester Exam Marks</span>
                    <p className="text-base font-extrabold text-emerald-800 mt-0.5">{currentMarks.semesterExam} <span className="text-xs text-emerald-400 font-medium">/ {currentMarks.maxSemester} Max</span></p>
                    <div className="w-full bg-emerald-100/50 h-1.5 rounded-full mt-2 overflow-hidden">
                      <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${semesterExamPct}%` }} />
                    </div>
                  </div>
                </div>

              </div>
            ) : (
              <div className="p-12 text-center text-xs text-gray-400 font-semibold">
                No active subjects mapped to display.
              </div>
            )}
          </div>

          <div className="flex justify-between items-center mt-4 border-t border-gray-100 pt-4">
            <span className="text-xs text-gray-500 font-semibold">Calculated Best-Of-2 Sessional Average: <span className="font-extrabold text-[#8B1E3F]">{(Math.max(currentMarks.sessionalI, currentMarks.sessionalII)).toFixed(1)} / 30</span> (Compliance Confirmed).</span>
            <button 
              onClick={() => onGoToScreen('student-progress')}
              className="text-xs font-black text-[#8B1E3F] flex items-center gap-1 hover:underline"
            >
              Analyze Progress <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </GlassCard>

        {/* Quick Bulletins Bulletins */}
        <GlassCard className="p-6 flex flex-col justify-between">
          <div>
            <h3 className="font-display font-extrabold text-base text-gray-900 mb-4">Latest Announcements</h3>
            <div className="flex flex-col gap-3">
              {announcements.slice(0, 2).map((ann) => (
                <div 
                  key={ann.id} 
                  className="p-3 bg-white/40 border border-white/20 rounded-2xl flex flex-col gap-1 hover:bg-white/80 transition-all duration-300 cursor-pointer"
                  onClick={() => onGoToScreen('student-announcements')}
                >
                  <div className="flex items-center gap-1.5 justify-between">
                    <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      ann.category === 'exam' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-blue-50 text-blue-600 border border-blue-100'
                    }`}>
                      {ann.category}
                    </span>
                    <span className="text-[9px] text-gray-400 font-medium">{ann.date}</span>
                  </div>
                  <h4 className="text-xs font-bold text-gray-800 line-clamp-1">{ann.title}</h4>
                  <p className="text-[10px] text-gray-500 line-clamp-2 leading-relaxed">{ann.content}</p>
                </div>
              ))}
            </div>
          </div>

          <button 
            onClick={() => onGoToScreen('student-announcements')}
            className="w-full text-center text-xs font-bold text-[#8B1E3F] hover:underline pt-4 border-t border-gray-100"
          >
            Read All Announcements
          </button>
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
          {subjects.slice(0, 3).map((sub) => {
            const completedCount = sub.resources.filter(r => r.status === 'completed').length;
            const totalCount = sub.resources.length;

            return (
              <GlassCard key={sub.id} hoverLift className="p-6 flex flex-col justify-between h-56">
                <div>
                  {/* Card Header with frosted tag */}
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{sub.code}</span>
                    <span className="text-[10px] font-bold bg-[#8B1E3F]/5 text-[#8B1E3F] px-2.5 py-1 rounded-full border border-[#8B1E3F]/10">
                      Year {sub.year}
                    </span>
                  </div>

                  <h3 className="font-display font-bold text-base text-gray-900 line-clamp-1 mb-1">{sub.name}</h3>
                  <p className="text-xs text-gray-500 mb-4">{sub.facultyName}</p>

                  {/* Projected Sessional indicator */}
                  <div className="flex flex-col gap-1.5 mb-4">
                    <div className="flex justify-between text-[10px] font-bold text-gray-500">
                      <span>Course Standing</span>
                      <span className="text-[#8B1E3F] font-black">{sub.progress > 80 ? 'Outstanding (O)' : sub.progress > 60 ? 'Excellent (A+)' : 'Very Good (A)'}</span>
                    </div>
                    <div className="flex justify-between items-center text-[9px] font-semibold text-gray-400 mt-1">
                      <span>Sessional Avg: {sub.progress}%</span>
                      <span>Target: PCI Pass</span>
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
          })}
        </div>
      </div>
    </div>
  );
}
