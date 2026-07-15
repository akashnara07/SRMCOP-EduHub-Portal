import React, { useState } from 'react';
import { BookOpen, Users, Award, Calendar, BellRing, Clipboard, ChevronRight, ChevronLeft, BarChart3, Plus, ArrowRight } from 'lucide-react';
import GlassCard from '../GlassCard';
import { Subject, Announcement, FacultyProfile } from '../../types';

interface FacultyDashboardProps {
  facultyProfile: FacultyProfile;
  subjects: Subject[];
  announcements: Announcement[];
  onCreateAnnouncement: (title: string, content: string, category: 'academic' | 'exam' | 'event') => void;
  onGoToScreen: (screenId: string) => void;
  onGoToSubject: (subjectId: string) => void;
}

export default function FacultyDashboard({
  facultyProfile,
  subjects,
  announcements,
  onCreateAnnouncement,
  onGoToScreen,
  onGoToSubject,
}: FacultyDashboardProps) {
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementContent, setAnnouncementContent] = useState('');
  const [announcementCat, setAnnouncementCat] = useState<'academic' | 'exam' | 'event'>('academic');
  const [showBroadcastConfirm, setShowBroadcastConfirm] = useState(false);
  const [currentSubIdx, setCurrentSubIdx] = useState(0);

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementTitle.trim() || !announcementContent.trim()) return;

    onCreateAnnouncement(announcementTitle.trim(), announcementContent.trim(), announcementCat);
    setAnnouncementTitle('');
    setAnnouncementContent('');
    setShowBroadcastConfirm(true);
    setTimeout(() => setShowBroadcastConfirm(false), 3000);
  };

  // Filter subjects taught by this professor
  const mySubjects = subjects.filter(s => facultyProfile.subjects.includes(s.id));

  const bPharmCoursesCount = mySubjects.filter(s => s.programme === 'B.Pharm').length;
  const pharmDCoursesCount = mySubjects.filter(s => s.programme === 'Pharm.D').length;
  const activeSubject = mySubjects[currentSubIdx];
  const bPharmStudents = bPharmCoursesCount * 6;
  const pharmDStudents = pharmDCoursesCount * 6;

  const displayName = facultyProfile.name.includes('Chitra') ? 'Dr. V. Chitra' : facultyProfile.name;

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* 1. Premium Typographic Dashboard Header */}
      <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-r from-[#6b172f] via-[#8B1E3F] to-[#CD4368] p-8 text-white shadow-xl shadow-maroon-900/10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-white/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col gap-5">
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-pink-100">Good Morning,</span>
            <h1 className="font-display font-extrabold text-3xl text-white tracking-tight leading-none mt-1">
              {displayName}
            </h1>
          </div>

          <div className="flex items-center gap-2 text-xs font-black text-white bg-white/15 w-max px-3 py-1.5 rounded-full font-mono">
            <Calendar className="w-3.5 h-3.5 text-pink-200" />
            <span>Thursday • 9 July</span>
          </div>

          <div className="border-t border-white/20 pt-4 flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-black uppercase tracking-wider text-pink-100">
              {facultyProfile.department || 'Department of Pharmacology'}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Frosted Stats row with Separated Programs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* B.Pharm Stats Card */}
        <GlassCard hoverLift className="p-6">
          <div className="flex justify-between items-start">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">B.Pharm Courses</span>
              <span className="text-3xl font-display font-black text-gray-900 tracking-tight mt-1">
                {bPharmCoursesCount}
              </span>
              <span className="text-[10px] font-medium text-gray-400 mt-1">Instructing sessional programs</span>
            </div>
            <div className="w-11 h-11 rounded-full flex items-center justify-center text-blue-500 bg-blue-500/10 border border-white/40 shadow-sm">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
        </GlassCard>

        {/* Pharm.D Stats Card */}
        <GlassCard hoverLift className="p-6">
          <div className="flex justify-between items-start">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Pharm.D Courses</span>
              <span className="text-3xl font-display font-black text-gray-900 tracking-tight mt-1">
                {pharmDCoursesCount}
              </span>
              <span className="text-[10px] font-medium text-gray-400 mt-1">Instructing doctoral programs</span>
            </div>
            <div className="w-11 h-11 rounded-full flex items-center justify-center text-purple-500 bg-purple-500/10 border border-white/40 shadow-sm">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
        </GlassCard>

        {/* Active Students Stats Card */}
        <GlassCard hoverLift className="p-6">
          <div className="flex justify-between items-start">
            <div className="flex flex-col gap-1 w-full font-semibold">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Active Students</span>
              <span className="text-3xl font-display font-black text-[#8B1E3F] tracking-tight mt-1">
                {bPharmStudents + pharmDStudents}
              </span>
              <div className="flex flex-col gap-1 mt-2.5 pt-2 border-t border-gray-100 text-[10px] font-bold text-gray-500">
                <div className="flex justify-between items-center">
                  <span className="uppercase tracking-wider">B.Pharm:</span>
                  <span className="text-gray-900 font-extrabold">{bPharmStudents} Students</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="uppercase tracking-wider">Pharm.D:</span>
                  <span className="text-gray-900 font-extrabold">{pharmDStudents} Students</span>
                </div>
              </div>
            </div>
            <div className="w-11 h-11 rounded-full flex items-center justify-center text-[#8B1E3F] bg-[#8B1E3F]/10 border border-white/40 shadow-sm shrink-0">
              <Users className="w-5 h-5" />
            </div>
          </div>
        </GlassCard>
      </div>

      {/* 3. Subject Performance Graph & Broadcast Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Subject Performance dynamic switcher (2 Columns) */}
        <GlassCard className="lg:col-span-2 p-6 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-display font-bold text-base text-gray-900">Subject Performance</h3>
                <p className="text-xs text-gray-500">Sessional grade metrics for the active course roster</p>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-[#8B1E3F] bg-[#8B1E3F]/5 border border-[#8B1E3F]/10 px-2.5 py-1 rounded-full uppercase">
                  {mySubjects[currentSubIdx]?.code || 'Allotted Subjects'}
                </span>
                
                {mySubjects.length > 1 && (
                  <div className="flex gap-1">
                    <button
                      onClick={() => setCurrentSubIdx(prev => (prev === 0 ? mySubjects.length - 1 : prev - 1))}
                      className="w-7 h-7 bg-white hover:bg-gray-100 border border-gray-150 rounded-full flex items-center justify-center text-gray-600 hover:text-gray-900 transition-all shadow-sm"
                      title="Previous Subject"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setCurrentSubIdx(prev => (prev === mySubjects.length - 1 ? 0 : prev + 1))}
                      className="w-7 h-7 bg-white hover:bg-gray-100 border border-gray-150 rounded-full flex items-center justify-center text-gray-600 hover:text-gray-900 transition-all shadow-sm"
                      title="Next Subject"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Display active course context */}
            {mySubjects.length > 0 ? (
              <div className="mb-4">
                <h4 className="text-sm font-black text-gray-800 leading-tight">
                  {mySubjects[currentSubIdx]?.name}
                </h4>
                <p className="text-[10px] text-gray-400 font-semibold uppercase mt-0.5">
                  Semester {mySubjects[currentSubIdx]?.semester} • {mySubjects[currentSubIdx]?.programme} Class
                </p>
              </div>
            ) : null}

            {/* Subject Performance Class Averages Line Chart */}
            {(() => {
              const activeSub = mySubjects[currentSubIdx];
              if (!activeSub) return null;

              const isPharmD = activeSub.programme === 'Pharm.D';

              // Helper function to load student sessional cohort marks
              const getSessionalCohort = (subjectCode: string, programme: string) => {
                const saved = localStorage.getItem(`sessional_marks_${subjectCode}`);
                if (saved) {
                  try {
                    return JSON.parse(saved);
                  } catch (e) {
                    console.error(e);
                  }
                }
                // Default fallback cohort list
                return [
                  { sNo: 1, name: 'J. Akash', registerNumber: 'SRM2026PH7810', programme, attendance: 92.4, gpa: 8.85, status: 'Active', sessionalI: 24, sessionalII: 25, sessionalIII: 23 },
                  { sNo: 2, name: 'Meera Patel', registerNumber: 'SRM2026PH7812', programme, attendance: 88.5, gpa: 8.12, status: 'Active', sessionalI: 19, sessionalII: 22, sessionalIII: 20 },
                  { sNo: 3, name: 'Rahul Sharma', registerNumber: 'SRM2026PH7815', programme, attendance: 95.0, gpa: 9.20, status: 'Active', sessionalI: 28, sessionalII: 29, sessionalIII: 28 },
                  { sNo: 4, name: 'Anjali Rao', registerNumber: 'SRM2026PH7831', programme, attendance: 94.0, gpa: 8.75, status: 'Active', sessionalI: 26, sessionalII: 24, sessionalIII: 25 },
                  { sNo: 5, name: 'Priyesh Sen', registerNumber: 'SRM2026PH7830', programme, attendance: 91.5, gpa: 8.20, status: 'Active', sessionalI: 22, sessionalII: 23, sessionalIII: 24 },
                  { sNo: 6, name: 'Vignesh Nair', registerNumber: 'SRM2026PH7832', programme, attendance: 86.2, gpa: 7.90, status: 'Active', sessionalI: 18, sessionalII: 20, sessionalIII: 21 }
                ];
              };

              const cohort = getSessionalCohort(activeSub.code, activeSub.programme);

              // Calculate averages
              const count = cohort.length || 1;
              const avgSessionalI = cohort.reduce((acc, s) => acc + s.sessionalI, 0) / count;
              const avgSessionalII = cohort.reduce((acc, s) => acc + s.sessionalII, 0) / count;
              const avgSessionalIII = isPharmD 
                ? (cohort.reduce((acc, s) => acc + (s.sessionalIII || 0), 0) / count) 
                : 0;
              const avgSemesterExam = cohort.reduce((acc, s) => acc + Math.round(((s.gpa || 8.0) / 10) * 75), 0) / count;

              const getSessionalAvgForStudent = (s1: number, s2: number, s3: number, isPharm: boolean) => {
                if (!isPharm) {
                  return (s1 + s2) / 2;
                }
                const vals = [s1, s2, s3].sort((a, b) => b - a);
                return (vals[0] + vals[1]) / 2;
              };

              const classSessionalAvg = (cohort.reduce((acc, s) => acc + getSessionalAvgForStudent(s.sessionalI, s.sessionalII, s.sessionalIII || 0, isPharmD), 0) / count).toFixed(1);

              const sessionalIPct = (avgSessionalI / 30) * 100;
              const sessionalIIPct = (avgSessionalII / 30) * 100;
              const sessionalIIIPct = (avgSessionalIII / 30) * 100;
              const semesterExamPct = (avgSemesterExam / 75) * 100;

              return (
                <div className="flex flex-col gap-5">
                  {/* Subject Marks Performance Bar Graph */}
                  <div className="h-44 w-full relative bg-gray-50/50 rounded-2xl border border-gray-150/40 p-4 flex flex-col justify-between overflow-hidden" id="subject_marks_performance_chart">
                    {/* Background Grid Lines */}
                    <div className="absolute inset-x-4 top-4 bottom-12 flex flex-col justify-between pointer-events-none">
                      <div className="border-b border-gray-100/75 w-full h-0" />
                      <div className="border-b border-gray-100/75 w-full h-0" />
                      <div className="border-b border-gray-100/75 w-full h-0" />
                      <div className="border-b border-gray-200 w-full h-0" />
                    </div>

                    {/* Bars Container */}
                    <div className="relative z-10 flex h-28 items-end justify-around px-2">
                      {/* Bar 1: Sessional I */}
                      <div className="flex flex-col items-center gap-1 h-full justify-end w-20 group">
                        <span className="text-[10px] font-black text-[#8B1E3F]">
                          {avgSessionalI.toFixed(1)}/30
                        </span>
                        <div 
                          className="w-10 bg-gradient-to-t from-[#8B1E3F]/80 to-[#8B1E3F] rounded-t-lg shadow-sm transition-all duration-300 hover:scale-105" 
                          style={{ height: `${sessionalIPct}%` }}
                        />
                        <span className="text-[10px] font-extrabold text-gray-500 whitespace-nowrap">Sess I</span>
                      </div>

                      {/* Bar 2: Sessional II */}
                      <div className="flex flex-col items-center gap-1 h-full justify-end w-20 group">
                        <span className="text-[10px] font-black text-[#8B1E3F]">
                          {avgSessionalII.toFixed(1)}/30
                        </span>
                        <div 
                          className="w-10 bg-gradient-to-t from-[#8B1E3F]/80 to-[#8B1E3F] rounded-t-lg shadow-sm transition-all duration-300 hover:scale-105" 
                          style={{ height: `${sessionalIIPct}%` }}
                        />
                        <span className="text-[10px] font-extrabold text-gray-500 whitespace-nowrap">Sess II</span>
                      </div>

                      {/* Bar 3: Sessional III (Pharm.D Only) */}
                      {isPharmD && (
                        <div className="flex flex-col items-center gap-1 h-full justify-end w-20 group">
                          <span className="text-[10px] font-black text-[#8B1E3F]">
                            {avgSessionalIII.toFixed(1)}/30
                          </span>
                          <div 
                            className="w-10 bg-gradient-to-t from-[#8B1E3F]/80 to-[#8B1E3F] rounded-t-lg shadow-sm transition-all duration-300 hover:scale-105" 
                            style={{ height: `${sessionalIIIPct}%` }}
                          />
                          <span className="text-[10px] font-extrabold text-gray-500 whitespace-nowrap">Sess III</span>
                        </div>
                      )}

                      {/* Bar 4: Semester Exam */}
                      <div className="flex flex-col items-center gap-1 h-full justify-end w-20 group">
                        <span className="text-[10px] font-black text-emerald-700">
                          {avgSemesterExam.toFixed(1)}/75
                        </span>
                        <div 
                          className="w-10 bg-gradient-to-t from-emerald-500 to-emerald-600 rounded-t-lg shadow-sm transition-all duration-300 hover:scale-105" 
                          style={{ height: `${semesterExamPct}%` }}
                        />
                        <span className="text-[10px] font-extrabold text-emerald-700 whitespace-nowrap">Sem Exam</span>
                      </div>
                    </div>

                    {/* Horizontal Labels */}
                    <div className="flex justify-between items-center text-[9px] font-extrabold text-gray-400 font-mono px-2 mt-2 border-t border-gray-100 pt-1.5">
                      <span>Max Sessional: 30 Marks</span>
                      <span>Max Semester Exam: 75 Marks</span>
                    </div>
                  </div>

                  {/* Summary section with dynamic grid columns */}
                  <div className={`grid grid-cols-1 ${isPharmD ? 'sm:grid-cols-4' : 'sm:grid-cols-3'} gap-4`}>
                    {/* Panel 1 */}
                    <div className="p-3 bg-gray-50 border border-gray-150/50 rounded-2xl">
                      <span className="text-[9px] font-black uppercase text-gray-400 block tracking-wider">Avg I Sessional</span>
                      <p className="text-sm font-extrabold text-gray-850 mt-0.5">{avgSessionalI.toFixed(1)} <span className="text-[10px] text-gray-400 font-medium font-mono">/ 30 Max</span></p>
                      <div className="w-full bg-gray-150 h-1 rounded-full mt-1.5 overflow-hidden">
                        <div className="bg-[#8B1E3F] h-full rounded-full" style={{ width: `${sessionalIPct}%` }} />
                      </div>
                    </div>

                    {/* Panel 2 */}
                    <div className="p-3 bg-gray-50 border border-gray-150/50 rounded-2xl">
                      <span className="text-[9px] font-black uppercase text-gray-400 block tracking-wider">Avg II Sessional</span>
                      <p className="text-sm font-extrabold text-gray-850 mt-0.5">{avgSessionalII.toFixed(1)} <span className="text-[10px] text-gray-400 font-medium font-mono">/ 30 Max</span></p>
                      <div className="w-full bg-gray-150 h-1 rounded-full mt-1.5 overflow-hidden">
                        <div className="bg-[#8B1E3F] h-full rounded-full" style={{ width: `${sessionalIIPct}%` }} />
                      </div>
                    </div>

                    {/* Panel 3 (Pharm.D Only) */}
                    {isPharmD && (
                      <div className="p-3 bg-gray-50 border border-gray-150/50 rounded-2xl">
                        <span className="text-[9px] font-black uppercase text-gray-400 block tracking-wider">Avg III Sessional</span>
                        <p className="text-sm font-extrabold text-gray-850 mt-0.5">{avgSessionalIII.toFixed(1)} <span className="text-[10px] text-gray-400 font-medium font-mono">/ 30 Max</span></p>
                        <div className="w-full bg-gray-150 h-1 rounded-full mt-1.5 overflow-hidden">
                          <div className="bg-[#8B1E3F] h-full rounded-full" style={{ width: `${sessionalIIIPct}%` }} />
                        </div>
                      </div>
                    )}

                    {/* Panel 4: Semester Exam */}
                    <div className="p-3 bg-emerald-50/20 border border-emerald-100 rounded-2xl">
                      <span className="text-[9px] font-black uppercase text-emerald-600 block tracking-wider font-mono">Avg Semester Grade</span>
                      <p className="text-sm font-extrabold text-emerald-800 mt-0.5">{avgSemesterExam.toFixed(1)} <span className="text-[10px] text-emerald-400 font-medium font-mono">/ 75 Max</span></p>
                      <div className="w-full bg-emerald-100 h-1 rounded-full mt-1.5 overflow-hidden">
                        <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${semesterExamPct}%` }} />
                      </div>
                    </div>
                  </div>

                  {/* Class Sessional Average Indicator */}
                  <div className="flex justify-between items-center mt-2 border-t border-gray-100 pt-3">
                    <span className="text-xs text-gray-500 font-semibold">
                      Class Sessional Average: <span className="font-extrabold text-[#8B1E3F]">{classSessionalAvg} / 30</span> ({isPharmD ? 'Best of 2' : 'Average'} Compliance Confirmed).
                    </span>
                  </div>
                </div>
              );
            })()}
          </div>

          <div className="flex justify-between items-center mt-4 border-t border-gray-100 pt-4">
            <span className="text-xs text-gray-500">Aggregate metrics correspond to continuous internal evaluations and exam averages across the class.</span>
            <button 
              onClick={() => onGoToScreen('faculty-analytics')}
              className="text-xs font-bold text-[#8B1E3F] flex items-center gap-1 hover:underline"
            >
              Examine Analytics <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </GlassCard>

        {/* Dynamic Announcements panel (replaces broadcaster console) */}
        <GlassCard className="p-6">
          <div className="mb-4">
            <h3 className="font-display font-bold text-base text-gray-900 flex items-center gap-2">
              <BellRing className="w-5 h-5 text-[#8B1E3F] shrink-0" />
              Announcements
            </h3>
            {mySubjects[currentSubIdx] && (
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">
                Targeted to: {mySubjects[currentSubIdx].code} ({mySubjects[currentSubIdx].name})
              </p>
            )}
          </div>

          <form onSubmit={handleBroadcast} className="flex flex-col gap-3">
            <div>
              <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Title</label>
              <input
                type="text"
                placeholder="Ex. Syllabus completion review..."
                value={announcementTitle}
                onChange={(e) => setAnnouncementTitle(e.target.value)}
                className="w-full bg-gray-100/60 border border-transparent hover:border-gray-200 focus:border-[#8B1E3F] text-xs text-gray-800 p-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#8B1E3F]/30"
              />
            </div>

            <div>
              <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Announcement Content</label>
              <textarea
                placeholder="Ex. All physical copies of laboratory folders must be signed by..."
                value={announcementContent}
                rows={3}
                onChange={(e) => setAnnouncementContent(e.target.value)}
                className="w-full bg-gray-100/60 border border-transparent hover:border-gray-200 focus:border-[#8B1E3F] text-xs text-gray-800 p-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#8B1E3F]/30 resize-none"
              />
            </div>

            <div className="flex justify-between items-center mt-1">
              {/* Type Category selection bubble */}
              <div className="flex gap-1">
                {(['academic', 'exam', 'event'] as const).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setAnnouncementCat(cat)}
                    className={`
                      text-[9px] font-bold px-2 py-1 rounded-full border transition-all capitalize
                      \${announcementCat === cat 
                        ? 'bg-gray-900 text-white border-gray-900 shadow-sm' 
                        : 'bg-white/40 border-gray-200 text-gray-500'
                      }
                    `}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <button
                type="submit"
                disabled={!announcementTitle.trim() || !announcementContent.trim()}
                className="px-4 py-2 bg-[#8B1E3F] hover:bg-[#b32a4e] text-white text-[11px] font-bold rounded-full transition-all shadow-md shadow-maroon-900/10 disabled:opacity-50"
              >
                Post Announcement
              </button>
            </div>
          </form>

          {showBroadcastConfirm && (
            <div className="mt-3 text-center text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 p-2 rounded-xl animate-fade-in">
              ✓ Announcement posted successfully for {mySubjects[currentSubIdx]?.code || 'subject'}!
            </div>
          )}
        </GlassCard>
      </div>

      {/* 4. My Courses section */}
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="font-display font-bold text-lg text-gray-900">Classroom Subjects Hub</h2>
          <p className="text-xs text-gray-500">Edit, manage, and arrange curricular content for your subjects</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {mySubjects.map((sub) => (
            <GlassCard key={sub.id} hoverLift className="p-6 flex flex-col justify-between h-48 border-t-4 border-t-[#8B1E3F]">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{sub.code}</span>
                  <span className="text-[10px] font-bold bg-[#8B1E3F]/5 text-[#8B1E3F] px-2.5 py-1 rounded-full">
                    {sub.programme} • Year {sub.year}
                  </span>
                </div>
                <h3 className="font-display font-bold text-base text-gray-900 line-clamp-1 mb-1">{sub.name}</h3>
                <p className="text-xs text-gray-500 mb-2">Curriculum timeline features {sub.resources.length} active resources</p>
              </div>

              <div className="flex justify-between items-center border-t border-gray-100 pt-3 mt-2">
                <span className="text-[10px] font-bold text-gray-400">PCI Compliant Syllabus</span>
                <button
                  onClick={() => onGoToSubject(sub.id)}
                  className="flex items-center gap-1.5 text-xs font-bold text-[#8B1E3F] bg-[#8B1E3F]/10 hover:bg-[#8B1E3F]/20 px-3.5 py-1.5 rounded-full transition-all"
                >
                  Manage Subject <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </div>
  );
}
