import React, { useState } from 'react';
import { BookOpen, Users, Award, Calendar, BellRing, Clipboard, ChevronRight, ChevronLeft, BarChart3, Plus, ArrowRight } from 'lucide-react';
import GlassCard from '../GlassCard';
import { Subject, Announcement, FacultyProfile } from '../../types';
import { getStudentsMaster } from '../../data/studentRegistry';

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

  // Current session subjects (2026-2027)
  const currentSessionSubjects = mySubjects.filter(s => (s.academicYear === '2026-2027' || !s.academicYear));
  const bPharmCoursesCount = currentSessionSubjects.filter(s => s.programme === 'B.Pharm').length;
  const pharmDCoursesCount = currentSessionSubjects.filter(s => s.programme === 'Pharm.D').length;
  const activeSubject = mySubjects[currentSubIdx];
  const bPharmStudents = bPharmCoursesCount * 6;
  const pharmDStudents = pharmDCoursesCount * 6;

  const displayName = facultyProfile.name;

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
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-full w-max mt-1">
                🟢 Current Academic Session
              </span>
            </div>
            <div className="w-11 h-11 rounded-full flex items-center justify-center text-blue-500 bg-blue-500/10 border border-white/40 shadow-sm shrink-0">
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
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-full w-max mt-1">
                🟢 Current Academic Session
              </span>
            </div>
            <div className="w-11 h-11 rounded-full flex items-center justify-center text-purple-500 bg-purple-500/10 border border-white/40 shadow-sm shrink-0">
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
                {bPharmStudents + pharmDStudents} Students
              </span>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-full w-max mt-0.5">
                Current Academic Session
              </span>
              <div className="flex items-center gap-3 mt-2 pt-2 border-t border-gray-100 text-[10px] font-bold text-gray-500">
                <span>B.Pharm : <strong className="text-gray-900">{bPharmStudents}</strong></span>
                <span>•</span>
                <span>Pharm.D : <strong className="text-gray-900">{pharmDStudents}</strong></span>
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
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-display font-bold text-base text-gray-900">Subject Performance</h3>
                <p className="text-xs text-gray-500">Sessional grade metrics for the active course roster</p>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#8B1E3F] bg-[#8B1E3F]/5 border border-[#8B1E3F]/10 px-2.5 py-1 rounded-full uppercase">
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
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2 bg-gray-50/70 p-3 rounded-2xl border border-gray-150/50">
                <div>
                  <h4 className="text-sm font-black text-gray-850 leading-tight">
                    {mySubjects[currentSubIdx]?.name}
                  </h4>
                  <p className="text-[10px] text-gray-500 font-semibold uppercase mt-0.5">
                    {mySubjects[currentSubIdx]?.programme} • {mySubjects[currentSubIdx]?.programme === 'Pharm.D' ? `Year ${mySubjects[currentSubIdx]?.year}` : `Semester ${mySubjects[currentSubIdx]?.semester}`} • {mySubjects[currentSubIdx]?.regulation || 'PCI 2017'}
                  </p>
                </div>

                {(mySubjects[currentSubIdx]?.academicYear === '2026-2027' || !mySubjects[currentSubIdx]?.academicYear) ? (
                  <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200/80 font-bold px-2.5 py-1 rounded-full text-[10px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    🟢 Current Academic Session
                  </span>
                ) : (
                  <span className="text-[10px] font-semibold text-gray-600 bg-gray-100 border border-gray-200 px-2.5 py-1 rounded-md font-mono">
                    AY {mySubjects[currentSubIdx]?.academicYear}
                  </span>
                )}
              </div>
            ) : null}

            {/* Subject Performance Class Averages Line Chart */}
            {(() => {
              const activeSub = mySubjects[currentSubIdx];
              if (!activeSub) return null;

              const isPharmD = activeSub.programme === 'Pharm.D';

              const getSessionalCohort = (subjectCode: string, programme: string) => {
                const saved = localStorage.getItem(`sessional_marks_${subjectCode}`);
                if (saved) {
                  try {
                    return JSON.parse(saved);
                  } catch (e) {
                    console.error(e);
                  }
                }
                const masterList = getStudentsMaster();
                const filtered = masterList.filter(s => s.programme === programme);
                const studentSource = filtered.length > 0 ? filtered : masterList;

                return studentSource.slice(0, 30).map((std, idx) => {
                  return {
                    sNo: idx + 1,
                    name: std.name,
                    registerNumber: std.regNo,
                    programme,
                    attendance: 100,
                    gpa: undefined,
                    status: 'Active',
                    sessionalI: null,
                    sessionalII: null,
                    sessionalIII: null
                  };
                });
              };

              const cohort = getSessionalCohort(activeSub.code, activeSub.programme);
              const hasMarks = cohort.some((s: any) =>
                (s.sessionalI !== null && s.sessionalI !== '' && Number(s.sessionalI) > 0) ||
                (s.sessionalII !== null && s.sessionalII !== '' && Number(s.sessionalII) > 0) ||
                (s.sessionalIII !== null && s.sessionalIII !== '' && Number(s.sessionalIII) > 0)
              );

              const count = cohort.length || 0;
              const avgSessionalI = hasMarks ? (cohort.reduce((acc, s) => acc + (Number(s.sessionalI) || 0), 0) / (count || 1)) : 0;
              const avgSessionalII = hasMarks ? (cohort.reduce((acc, s) => acc + (Number(s.sessionalII) || 0), 0) / (count || 1)) : 0;
              const avgSessionalIII = (hasMarks && isPharmD) 
                ? (cohort.reduce((acc, s) => acc + (Number(s.sessionalIII) || 0), 0) / (count || 1)) 
                : 0;

              const sessionalIPct = (avgSessionalI / 30) * 100;
              const sessionalIIPct = (avgSessionalII / 30) * 100;
              const sessionalIIIPct = (avgSessionalIII / 30) * 100;

              return (
                <div className="flex flex-col gap-4">
                  {/* Subject Marks Performance Bar Graph */}
                  {!hasMarks ? (
                    <div className="h-40 w-full relative bg-gray-50/50 rounded-2xl border border-gray-150/40 p-4 flex flex-col items-center justify-center text-center gap-1.5" id="subject_marks_performance_chart">
                      <BarChart3 className="w-6 h-6 text-gray-300" />
                      <p className="text-xs font-bold text-gray-700">No Data Available</p>
                      <p className="text-[11px] text-gray-500 max-w-sm">
                        No student marks available for this course. Analytics will be generated after marks are uploaded.
                      </p>
                    </div>
                  ) : (
                    <div className="h-40 w-full relative bg-gray-50/50 rounded-2xl border border-gray-150/40 p-3 flex flex-col justify-between overflow-hidden" id="subject_marks_performance_chart">
                      {/* Background Grid Lines */}
                      <div className="absolute inset-x-4 top-4 bottom-10 flex flex-col justify-between pointer-events-none">
                        <div className="border-b border-gray-100/75 w-full h-0" />
                        <div className="border-b border-gray-100/75 w-full h-0" />
                        <div className="border-b border-gray-200 w-full h-0" />
                      </div>

                      {/* Bars Container */}
                      <div className="relative z-10 flex h-24 items-end justify-around px-2">
                        {/* Bar 1: Sessional I */}
                        <div className="flex flex-col items-center gap-1 h-full justify-end w-16 group">
                          <span className="text-[10px] font-black text-[#8B1E3F]">
                            {avgSessionalI.toFixed(1)}/30
                          </span>
                          <div 
                            className="w-8 bg-gradient-to-t from-[#8B1E3F]/80 to-[#8B1E3F] rounded-t-lg shadow-sm transition-all duration-300 hover:scale-105" 
                            style={{ height: `${sessionalIPct}%` }}
                          />
                          <span className="text-[10px] font-extrabold text-gray-500 whitespace-nowrap">Sess I</span>
                        </div>

                        {/* Bar 2: Sessional II */}
                        <div className="flex flex-col items-center gap-1 h-full justify-end w-16 group">
                          <span className="text-[10px] font-black text-[#8B1E3F]">
                            {avgSessionalII.toFixed(1)}/30
                          </span>
                          <div 
                            className="w-8 bg-gradient-to-t from-[#8B1E3F]/80 to-[#8B1E3F] rounded-t-lg shadow-sm transition-all duration-300 hover:scale-105" 
                            style={{ height: `${sessionalIIPct}%` }}
                          />
                          <span className="text-[10px] font-extrabold text-gray-500 whitespace-nowrap">Sess II</span>
                        </div>

                        {/* Bar 3: Sessional III (Pharm.D Only) */}
                        {isPharmD && (
                          <div className="flex flex-col items-center gap-1 h-full justify-end w-16 group">
                            <span className="text-[10px] font-black text-[#8B1E3F]">
                              {avgSessionalIII.toFixed(1)}/30
                            </span>
                            <div 
                              className="w-8 bg-gradient-to-t from-[#8B1E3F]/80 to-[#8B1E3F] rounded-t-lg shadow-sm transition-all duration-300 hover:scale-105" 
                              style={{ height: `${sessionalIIIPct}%` }}
                            />
                            <span className="text-[10px] font-extrabold text-gray-500 whitespace-nowrap">Sess III</span>
                          </div>
                        )}
                      </div>

                      <div className="flex justify-between items-center text-[9px] font-extrabold text-gray-400 font-mono px-2 border-t border-gray-100 pt-1.5">
                        <span>Max Sessional: 30 Marks</span>
                        <span>Class Size: {count} Students</span>
                      </div>
                    </div>
                  )}

                  {/* Summary section */}
                  <div className={`grid grid-cols-1 ${isPharmD ? 'sm:grid-cols-3' : 'sm:grid-cols-2'} gap-3`}>
                    <div className="p-3 bg-gray-50 border border-gray-150/50 rounded-2xl">
                      <span className="text-[9px] font-black uppercase text-gray-400 block tracking-wider">Avg I Sessional</span>
                      <p className="text-sm font-extrabold text-gray-850 mt-0.5">{avgSessionalI.toFixed(1)} <span className="text-[10px] text-gray-400 font-medium font-mono">/ 30 Max</span></p>
                    </div>

                    <div className="p-3 bg-gray-50 border border-gray-150/50 rounded-2xl">
                      <span className="text-[9px] font-black uppercase text-gray-400 block tracking-wider">Avg II Sessional</span>
                      <p className="text-sm font-extrabold text-gray-850 mt-0.5">{avgSessionalII.toFixed(1)} <span className="text-[10px] text-gray-400 font-medium font-mono">/ 30 Max</span></p>
                    </div>

                    {isPharmD && (
                      <div className="p-3 bg-gray-50 border border-gray-150/50 rounded-2xl">
                        <span className="text-[9px] font-black uppercase text-gray-400 block tracking-wider">Avg III Sessional</span>
                        <p className="text-sm font-extrabold text-gray-850 mt-0.5">{avgSessionalIII.toFixed(1)} <span className="text-[10px] text-gray-400 font-medium font-mono">/ 30 Max</span></p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>

          <div className="flex justify-between items-center mt-4 border-t border-gray-100 pt-3">
            <span className="text-xs text-gray-500">Continuous internal evaluation performance across class.</span>
            <button 
              onClick={() => onGoToScreen('faculty-analytics')}
              className="text-xs font-bold text-[#8B1E3F] flex items-center gap-1 hover:underline"
            >
              Examine Analytics <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </GlassCard>

        {/* Staff Announcements Panel */}
        <GlassCard className="p-6 flex flex-col justify-between">
          <div>
            <div className="mb-4">
              <h3 className="font-display font-bold text-base text-gray-900 flex items-center gap-2">
                <BellRing className="w-5 h-5 text-[#8B1E3F] shrink-0" />
                Staff Announcements
              </h3>
            </div>

            {/* Announcement List */}
            <div className="mb-4 flex flex-col gap-2">
              <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider border-b border-gray-100 pb-2">Announcement List</h4>
              {announcements && announcements.length > 0 ? (
                <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                  {announcements.map((ann) => (
                    <div key={ann.id} className="p-3 bg-gray-50/70 border border-gray-150/60 rounded-2xl flex flex-col gap-1">
                      <span className="text-xs font-extrabold text-gray-900">{ann.title}</span>
                      <p className="text-xs text-gray-600 font-medium leading-relaxed">{ann.content}</p>
                      <div className="flex items-center justify-between text-[10px] text-gray-400 mt-1 pt-1 border-t border-gray-100/60 font-semibold">
                        <span>Sender: {ann.sender}</span>
                        <span>{ann.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 bg-gray-50/50 rounded-2xl border border-gray-150/50 text-center text-xs text-gray-400 font-medium">
                  No active staff announcements posted yet.
                </div>
              )}
            </div>

            {/* Post Announcement Panel */}
            <div className="pt-4 border-t border-gray-100">
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

                <div className="flex justify-end items-center mt-1">
                  <button
                    type="submit"
                    disabled={!announcementTitle.trim() || !announcementContent.trim()}
                    className="px-4 py-2 bg-[#8B1E3F] hover:bg-[#b32a4e] text-white text-xs font-bold rounded-full transition-all shadow-md shadow-maroon-900/10 disabled:opacity-50"
                  >
                    Post Announcement
                  </button>
                </div>
              </form>

              {showBroadcastConfirm && (
                <div className="mt-3 text-center text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 p-2 rounded-xl animate-fade-in">
                  ✓ Announcement posted successfully!
                </div>
              )}
            </div>
          </div>
        </GlassCard>
      </div>

      {/* 4. Classroom Subjects Hub Section */}
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="font-display font-bold text-lg text-gray-900">Classroom Subjects Hub</h2>
          <p className="text-xs text-gray-500">Active and historical subjects under your faculty teaching profile</p>
        </div>

        {(() => {
          // Sort subjects so Current Academic Session subjects always appear FIRST
          const isCurrentSession = (s: Subject) => {
            const ay = s.academicYear || '2026-2027';
            return ay === '2026-2027';
          };

          const sortedSubjects = [...mySubjects].sort((a, b) => {
            const aCurr = isCurrentSession(a);
            const bCurr = isCurrentSession(b);
            if (aCurr && !bCurr) return -1;
            if (!aCurr && bCurr) return 1;
            return 0;
          });

          return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {sortedSubjects.map((sub) => {
                const isCurrent = isCurrentSession(sub);
                const ayStr = sub.academicYear || (isCurrent ? '2026–2027' : '2025–2026');

                return (
                  <GlassCard 
                    key={sub.id} 
                    hoverLift 
                    className="p-6 flex flex-col justify-between h-52 border-t-4 border-t-[#8B1E3F]"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{sub.code}</span>
                          <span className="text-[10px] font-bold bg-[#8B1E3F]/5 text-[#8B1E3F] px-2.5 py-0.5 rounded-full">
                            {sub.programme} • {sub.programme === 'Pharm.D' ? `Year ${sub.year}` : `Semester ${sub.semester || sub.year}`}
                          </span>
                        </div>
                        {isCurrent ? (
                          <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200/80 font-bold px-2.5 py-0.5 rounded-full text-[10px]">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            🟢 Current Academic Session
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold text-gray-600 bg-gray-100 border border-gray-200/80 px-2 py-0.5 rounded-md font-mono">
                            AY {ayStr}
                          </span>
                        )}
                      </div>
                      <h3 className="font-display font-bold text-base text-gray-900 line-clamp-1 mb-1">{sub.name}</h3>
                      <p className="text-xs text-gray-500 mb-2">
                        Curriculum timeline features {sub.resources?.length || 0} active resources • Regulation: {sub.regulation || 'PCI 2017'}
                      </p>
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
                );
              })}
            </div>
          );
        })()}
      </div>
    </div>
  );
}
