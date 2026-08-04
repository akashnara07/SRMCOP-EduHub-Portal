import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, Database, Plus, CheckCircle, ToggleLeft, ToggleRight, 
  TrendingUp, Users, Sparkles, Check, AlertCircle, ArrowRight, 
  Layers, ShieldCheck, Filter, RefreshCw, CheckCircle2, ChevronRight
} from 'lucide-react';
import GlassCard from '../GlassCard';
import { useAcademicYear } from '../../context/AcademicYearContext';
import { getStudentsMaster } from '../../data/studentRegistry';
import { 
  AcademicEnrollment, 
  EnrollmentStatus, 
  getAcademicEnrollments, 
  saveAcademicEnrollments, 
  PROGRAMME_PROMOTION_RULES 
} from '../../data/academicEnrollment';

interface AcademicYearsProps {
  onBack: () => void;
}

export default function AcademicYears({ onBack }: AcademicYearsProps) {
  // Global Academic Year context
  const { setActiveAcademicYear } = useAcademicYear();

  // Navigation tab state: 'sessions' | 'promotion'
  const [activeTab, setActiveTab] = useState<'sessions' | 'promotion'>('sessions');

  // Academic Sessions state
  const [years, setYears] = useState([
    { id: '1', name: 'Academic Year 2026-2027', start: 'June 2026', end: 'May 2027', isActive: true },
    { id: '2', name: 'Academic Year 2025-2026', start: 'June 2025', end: 'May 2026', isActive: false },
    { id: '3', name: 'Academic Year 2024-2025', start: 'June 2024', end: 'May 2025', isActive: false },
    { id: '4', name: 'Academic Year 2027-2028 (Planning)', start: 'June 2027', end: 'May 2028', isActive: false },
  ]);

  const [newYearName, setNewYearName] = useState('');

  const handleCreateYear = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newYearName.trim()) return;

    const added = {
      id: Date.now().toString(),
      name: newYearName.trim(),
      start: 'June 2027',
      end: 'May 2028',
      isActive: false
    };

    setYears([...years, added]);
    setNewYearName('');
  };

  const handleSetActive = (id: string) => {
    setYears(years.map((y) => ({ ...y, isActive: y.id === id })));
    const target = years.find(y => y.id === id);
    if (target) {
      const match = target.name.match(/\d{4}-\d{4}/);
      if (match) {
        setActiveAcademicYear(match[0]);
      }
    }
  };

  // =========================================================================
  // ACADEMIC PROMOTION WIZARD STATE & LOGIC
  // =========================================================================
  const [students] = useState(() => getStudentsMaster());
  const [enrollments, setEnrollments] = useState<AcademicEnrollment[]>(() => getAcademicEnrollments());

  // Wizard Configuration
  const [sourceYear, setSourceYear] = useState('2025-2026');
  const [targetYear, setTargetYear] = useState('2026-2027');
  const [selectedProg, setSelectedProg] = useState<'All' | 'B.Pharm' | 'Pharm.D' | 'M.Pharm'>('All');

  // Wizard Progress Step: 1 (Config & Rules) | 2 (Preview & Review Overrides) | 3 (Confirmed)
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3>(1);

  // Toast message
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Proposed Promotion Candidates Item interface
  interface PromotionCandidate {
    studentId: string;
    studentName: string;
    regNo: string;
    programme: 'B.Pharm' | 'Pharm.D' | 'M.Pharm';
    currentYear: string;
    currentSemester: string;
    proposedNextYear: string;
    proposedNextSemester: string;
    action: 'Promote' | 'Hold Back' | 'Repeat Year' | 'Graduated' | 'Discontinued' | 'Transferred';
    targetSection: string;
    facultyAdvisor: string;
  }

  const [promotionList, setPromotionList] = useState<PromotionCandidate[]>([]);

  // Generate Promotion Candidates Preview
  const handleGeneratePromotionPreview = () => {
    const sourceEnrollments = enrollments.filter(e => {
      if (e.academicYear !== sourceYear) return false;
      if (selectedProg !== 'All' && e.programme !== selectedProg) return false;
      return true;
    });

    if (sourceEnrollments.length === 0) {
      alert(`No student enrollments found in source academic year ${sourceYear} for ${selectedProg}.`);
      return;
    }

    const generated: PromotionCandidate[] = sourceEnrollments.map(se => {
      const student = students.find(s => s.id === se.studentId);
      const progRules = PROGRAMME_PROMOTION_RULES[se.programme] || [];
      const stage = progRules.find(r => r.year === se.currentYear);

      let nextYr = stage ? stage.nextYear : se.currentYear;
      let nextSem = stage ? stage.nextSemester : se.semester;
      let defaultAction: PromotionCandidate['action'] = 'Promote';

      if (nextYr === 'Graduated') {
        defaultAction = 'Graduated';
      }

      return {
        studentId: se.studentId,
        studentName: student ? student.name : 'Student',
        regNo: student ? student.regNo : 'N/A',
        programme: se.programme,
        currentYear: se.currentYear,
        currentSemester: se.semester,
        proposedNextYear: nextYr,
        proposedNextSemester: nextSem,
        action: defaultAction,
        targetSection: se.section || 'Section A',
        facultyAdvisor: se.facultyAdvisor || 'Dr. V. Chitra'
      };
    });

    setPromotionList(generated);
    setWizardStep(2);
  };

  // Override candidate action
  const handleUpdateCandidateAction = (index: number, newAction: PromotionCandidate['action']) => {
    const updated = [...promotionList];
    const candidate = updated[index];
    candidate.action = newAction;

    if (newAction === 'Hold Back' || newAction === 'Repeat Year') {
      candidate.proposedNextYear = candidate.currentYear;
      candidate.proposedNextSemester = candidate.currentSemester;
    } else if (newAction === 'Graduated') {
      candidate.proposedNextYear = 'Graduated';
      candidate.proposedNextSemester = 'Graduated';
    } else if (newAction === 'Promote') {
      const progRules = PROGRAMME_PROMOTION_RULES[candidate.programme] || [];
      const stage = progRules.find(r => r.year === candidate.currentYear);
      candidate.proposedNextYear = stage ? stage.nextYear : candidate.currentYear;
      candidate.proposedNextSemester = stage ? stage.nextSemester : candidate.currentSemester;
    }

    setPromotionList(updated);
  };

  // Update target section
  const handleUpdateCandidateSection = (index: number, section: string) => {
    const updated = [...promotionList];
    updated[index].targetSection = section;
    setPromotionList(updated);
  };

  // Commit Academic Promotion Execution
  const handleConfirmExecutePromotion = () => {
    if (promotionList.length === 0) return;

    if (!window.confirm(`Confirm creating ${promotionList.length} new Academic Enrollment records for Academic Year ${targetYear}? Master student records and previous academic years will remain unchanged.`)) {
      return;
    }

    const newEnrollmentRecords: AcademicEnrollment[] = promotionList.map(cand => {
      let status: EnrollmentStatus = 'Active';
      if (cand.action === 'Hold Back') status = 'Held Back';
      else if (cand.action === 'Repeat Year') status = 'Repeater';
      else if (cand.action === 'Graduated') status = 'Graduated';
      else if (cand.action === 'Discontinued') status = 'Discontinued';
      else if (cand.action === 'Transferred') status = 'Transferred';

      return {
        id: `ae-${cand.studentId}-${targetYear}`,
        studentId: cand.studentId,
        academicYear: targetYear,
        programme: cand.programme,
        currentYear: cand.proposedNextYear,
        semester: cand.proposedNextSemester,
        section: cand.targetSection,
        enrollmentStatus: status,
        facultyAdvisor: cand.facultyAdvisor
      };
    });

    // Remove old targetYear enrollments for these students to prevent duplicate keys if re-run
    const existingFiltered = enrollments.filter(e => {
      if (e.academicYear === targetYear && promotionList.some(p => p.studentId === e.studentId)) {
        return false;
      }
      return true;
    });

    const updatedTotal = [...newEnrollmentRecords, ...existingFiltered];
    setEnrollments(updatedTotal);
    saveAcademicEnrollments(updatedTotal);

    setWizardStep(3);
    showToast(`Successfully promoted ${promotionList.length} students to AY ${targetYear}!`);
  };

  // Summary statistics for Step 2 Preview
  const previewStats = useMemo(() => {
    const total = promotionList.length;
    const promoted = promotionList.filter(p => p.action === 'Promote').length;
    const heldBack = promotionList.filter(p => p.action === 'Hold Back' || p.action === 'Repeat Year').length;
    const graduated = promotionList.filter(p => p.action === 'Graduated').length;
    return { total, promoted, heldBack, graduated };
  }, [promotionList]);

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto pb-12 animate-fade-in">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-[#8B1E3F] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-white/20">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Header and Back actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/60 backdrop-blur-md p-6 rounded-3xl border border-white/40 shadow-sm">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-white/80 border border-white/40 hover:bg-white flex items-center justify-center text-gray-700 transition-all shadow-sm cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <span className="text-[10px] font-bold text-[#8B1E3F] uppercase tracking-widest bg-[#8B1E3F]/5 border border-[#8B1E3F]/10 px-2.5 py-0.5 rounded-full">
              University Academic Operations
            </span>
            <h1 className="font-display font-extrabold text-2xl text-gray-900 tracking-tight mt-1">
              Academic Sessions & Promotion Engine
            </h1>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-2xl border border-gray-200">
          <button
            onClick={() => setActiveTab('sessions')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'sessions'
                ? 'bg-[#8B1E3F] text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Database className="w-4 h-4" />
            Academic Sessions
          </button>
          <button
            onClick={() => setActiveTab('promotion')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'promotion'
                ? 'bg-[#8B1E3F] text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            Academic Promotion Wizard
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: ACADEMIC SESSIONS MANAGEMENT                       */}
      {/* ========================================================= */}
      {activeTab === 'sessions' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start animate-fade-in">
          {/* Left Column (2-spans): Existing academic years */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <GlassCard className="p-6">
              <h3 className="font-display font-bold text-base text-gray-900 border-b border-gray-100 pb-3 mb-5">
                Available Academic Terms & Sessional Calendars
              </h3>

              <div className="flex flex-col gap-3">
                {years.map((y) => {
                  return (
                    <div 
                      key={y.id} 
                      className="p-4 bg-white/80 hover:bg-white border border-gray-200/70 rounded-2xl flex items-center justify-between gap-4 transition-all shadow-2xs"
                    >
                      <div className="flex items-center gap-3.5 min-w-0 flex-1">
                        <div className="w-10 h-10 rounded-2xl bg-[#8B1E3F]/10 text-[#8B1E3F] flex items-center justify-center shrink-0 font-bold">
                          <Database className="w-5 h-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="text-[9px] font-bold text-gray-400 block uppercase tracking-wider">
                            Duration: {y.start} - {y.end}
                          </span>
                          <h4 className="text-xs font-bold text-gray-900 truncate leading-snug">{y.name}</h4>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full border ${
                          y.isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-gray-50 text-gray-400 border border-gray-200'
                        }`}>
                          {y.isActive ? 'Current Term' : 'Archived'}
                        </span>
                        
                        <button 
                          onClick={() => handleSetActive(y.id)}
                          disabled={y.isActive}
                          className="text-gray-400 hover:text-[#8B1E3F] transition-colors disabled:opacity-30 cursor-pointer"
                          title="Set Active Sessional Term"
                        >
                          {y.isActive ? (
                            <ToggleRight className="w-8 h-8 text-[#8B1E3F]" />
                          ) : (
                            <ToggleLeft className="w-8 h-8" />
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </GlassCard>
          </div>

          {/* Right Column: Establish New Sessional Term */}
          <GlassCard className="p-6">
            <h3 className="font-display font-bold text-base text-gray-900 mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-[#8B1E3F]" />
              Establish Term Session
            </h3>

            <form onSubmit={handleCreateYear} className="flex flex-col gap-4">
              <div>
                <label className="text-[10px] font-extrabold text-gray-400 uppercase block mb-1">
                  Academic Year Label
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex. Academic Year 2027-2028..."
                  value={newYearName}
                  onChange={(e) => setNewYearName(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 text-xs font-bold text-gray-800 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B1E3F]/30"
                />
              </div>

              <button
                type="submit"
                className="w-full text-center text-xs font-extrabold bg-[#8B1E3F] hover:bg-[#721733] text-white py-3 rounded-xl transition-all shadow-md shadow-maroon-900/10 cursor-pointer"
              >
                Append to Sessional Registry
              </button>
            </form>
          </GlassCard>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: ACADEMIC PROMOTION GUIDED WIZARD                   */}
      {/* ========================================================= */}
      {activeTab === 'promotion' && (
        <div className="space-y-6 animate-fade-in">
          {/* Progress Steps Header */}
          <GlassCard className="p-4 rounded-3xl border border-white/40 bg-white/80">
            <div className="flex items-center justify-between max-w-2xl mx-auto text-xs">
              <div className={`flex items-center gap-2 font-bold ${wizardStep >= 1 ? 'text-[#8B1E3F]' : 'text-gray-400'}`}>
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${wizardStep >= 1 ? 'bg-[#8B1E3F] text-white' : 'bg-gray-200 text-gray-500'}`}>
                  1
                </span>
                <span>Configure Academic Years</span>
              </div>

              <ChevronRight className="w-4 h-4 text-gray-300" />

              <div className={`flex items-center gap-2 font-bold ${wizardStep >= 2 ? 'text-[#8B1E3F]' : 'text-gray-400'}`}>
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${wizardStep >= 2 ? 'bg-[#8B1E3F] text-white' : 'bg-gray-200 text-gray-500'}`}>
                  2
                </span>
                <span>Review Candidates & Exceptions</span>
              </div>

              <ChevronRight className="w-4 h-4 text-gray-300" />

              <div className={`flex items-center gap-2 font-bold ${wizardStep === 3 ? 'text-emerald-700' : 'text-gray-400'}`}>
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${wizardStep === 3 ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                  3
                </span>
                <span>Execution Complete</span>
              </div>
            </div>
          </GlassCard>

          {/* STEP 1: CONFIGURATION & PROGRAMME PROMOTION RULES */}
          {wizardStep === 1 && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <GlassCard className="p-6 lg:col-span-1 space-y-4 bg-white border border-gray-200">
                <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                  <TrendingUp className="w-5 h-5 text-[#8B1E3F]" />
                  <h3 className="text-sm font-extrabold text-gray-900">Promotion Scope</h3>
                </div>

                <div className="space-y-4 text-xs">
                  <div>
                    <label className="text-[10px] font-extrabold uppercase text-gray-500 block mb-1">
                      Current (Source) Academic Year
                    </label>
                    <select
                      value={sourceYear}
                      onChange={(e) => setSourceYear(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#8B1E3F]/30"
                    >
                      <option value="2025-2026">2025-2026</option>
                      <option value="2024-2025">2024-2025</option>
                      <option value="2023-2024">2023-2024</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-extrabold uppercase text-gray-500 block mb-1">
                      Target New Academic Year
                    </label>
                    <select
                      value={targetYear}
                      onChange={(e) => setTargetYear(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-bold text-[#8B1E3F] focus:outline-none focus:ring-2 focus:ring-[#8B1E3F]/30"
                    >
                      <option value="2026-2027">2026-2027</option>
                      <option value="2027-2028">2027-2028</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-extrabold uppercase text-gray-500 block mb-1">
                      Programme Scope
                    </label>
                    <select
                      value={selectedProg}
                      onChange={(e) => setSelectedProg(e.target.value as any)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#8B1E3F]/30"
                    >
                      <option value="All">All Programmes (B.Pharm, Pharm.D, M.Pharm)</option>
                      <option value="B.Pharm">B.Pharm</option>
                      <option value="Pharm.D">Pharm.D</option>
                      <option value="M.Pharm">M.Pharm</option>
                    </select>
                  </div>

                  <button
                    onClick={handleGeneratePromotionPreview}
                    className="w-full py-3 bg-gradient-to-r from-[#8B1E3F] to-[#CD4368] text-white font-extrabold text-xs rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer mt-4"
                  >
                    <Sparkles className="w-4 h-4" />
                    Generate Promotion Preview
                  </button>
                </div>
              </GlassCard>

              {/* Programme Progression Rules Panel */}
              <GlassCard className="p-6 lg:col-span-2 space-y-4 bg-white border border-gray-200">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-[#8B1E3F]" />
                    <h3 className="text-sm font-extrabold text-gray-900">Configured Progression Rules</h3>
                  </div>
                  <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">
                    Sessional Ordinance Rules
                  </span>
                </div>

                <div className="space-y-4">
                  {/* B.Pharm Rules */}
                  <div className="bg-pink-50/40 p-4 rounded-2xl border border-pink-100 space-y-2">
                    <h4 className="text-xs font-black text-[#8B1E3F] uppercase tracking-wide">B.Pharm (4-Year Degree)</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-bold">
                      <div className="bg-white p-2 rounded-xl border border-pink-100 text-center">
                        <span className="text-gray-400 block text-[9px]">YEAR I</span>
                        <span className="text-gray-900">Sem I & II</span>
                      </div>
                      <div className="bg-white p-2 rounded-xl border border-pink-100 text-center">
                        <span className="text-gray-400 block text-[9px]">YEAR II</span>
                        <span className="text-gray-900">Sem III & IV</span>
                      </div>
                      <div className="bg-white p-2 rounded-xl border border-pink-100 text-center">
                        <span className="text-gray-400 block text-[9px]">YEAR III</span>
                        <span className="text-gray-900">Sem V & VI</span>
                      </div>
                      <div className="bg-white p-2 rounded-xl border border-pink-100 text-center">
                        <span className="text-gray-400 block text-[9px]">YEAR IV</span>
                        <span className="text-emerald-700">Sem VII ➔ Grad</span>
                      </div>
                    </div>
                  </div>

                  {/* Pharm.D Rules */}
                  <div className="bg-purple-50/40 p-4 rounded-2xl border border-purple-100 space-y-2">
                    <h4 className="text-xs font-black text-purple-800 uppercase tracking-wide">Pharm.D (6-Year Doctoral)</h4>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-[10px] font-bold">
                      <div className="bg-white p-2 rounded-xl border border-purple-100 text-center">Yr I</div>
                      <div className="bg-white p-2 rounded-xl border border-purple-100 text-center">Yr II</div>
                      <div className="bg-white p-2 rounded-xl border border-purple-100 text-center">Yr III</div>
                      <div className="bg-white p-2 rounded-xl border border-purple-100 text-center">Yr IV</div>
                      <div className="bg-white p-2 rounded-xl border border-purple-100 text-center">Yr V</div>
                      <div className="bg-white p-2 rounded-xl border border-purple-100 text-center text-purple-700">Internship</div>
                    </div>
                  </div>

                  {/* M.Pharm Rules */}
                  <div className="bg-amber-50/40 p-4 rounded-2xl border border-amber-100 space-y-2">
                    <h4 className="text-xs font-black text-amber-800 uppercase tracking-wide">M.Pharm (2-Year Postgraduate)</h4>
                    <div className="grid grid-cols-2 gap-2 text-[11px] font-bold">
                      <div className="bg-white p-2 rounded-xl border border-amber-100 text-center">
                        <span className="text-gray-400 block text-[9px]">YEAR I</span>
                        <span className="text-gray-900">Sem I & II</span>
                      </div>
                      <div className="bg-white p-2 rounded-xl border border-amber-100 text-center">
                        <span className="text-gray-400 block text-[9px]">YEAR II</span>
                        <span className="text-emerald-700">Sem III ➔ Graduated</span>
                      </div>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </div>
          )}

          {/* STEP 2: REVIEW CANDIDATES & EXCEPTIONS */}
          {wizardStep === 2 && (
            <div className="space-y-6">
              {/* Stat Summary Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <GlassCard className="p-4 rounded-2xl border border-gray-200 bg-white">
                  <span className="text-[10px] font-extrabold uppercase text-gray-400 block mb-1">Total Candidates</span>
                  <span className="text-2xl font-black text-gray-900">{previewStats.total}</span>
                </GlassCard>

                <GlassCard className="p-4 rounded-2xl border border-gray-200 bg-white">
                  <span className="text-[10px] font-extrabold uppercase text-gray-400 block mb-1">Promoted to Next Year</span>
                  <span className="text-2xl font-black text-emerald-700">{previewStats.promoted}</span>
                </GlassCard>

                <GlassCard className="p-4 rounded-2xl border border-gray-200 bg-white">
                  <span className="text-[10px] font-extrabold uppercase text-gray-400 block mb-1">Held Back / Repeaters</span>
                  <span className="text-2xl font-black text-amber-700">{previewStats.heldBack}</span>
                </GlassCard>

                <GlassCard className="p-4 rounded-2xl border border-gray-200 bg-white">
                  <span className="text-[10px] font-extrabold uppercase text-gray-400 block mb-1">Graduating Batch</span>
                  <span className="text-2xl font-black text-slate-800">{previewStats.graduated}</span>
                </GlassCard>
              </div>

              {/* Review & Override Table */}
              <GlassCard className="p-0 rounded-3xl border border-gray-200 overflow-hidden bg-white shadow-sm">
                <div className="p-4 bg-gray-50 border-b border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-xs font-black uppercase text-gray-800 tracking-wider">
                      Review Candidate Promotion List ({sourceYear} ➔ {targetYear})
                    </h3>
                    <p className="text-[11px] text-gray-400">Modify individual student outcomes below. Changes affect ONLY the new Academic Enrollment records.</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setWizardStep(1)}
                      className="px-3.5 py-1.5 bg-white border border-gray-200 text-gray-700 font-bold text-xs rounded-xl hover:bg-gray-100 cursor-pointer"
                    >
                      Back to Config
                    </button>
                    <button
                      onClick={handleConfirmExecutePromotion}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-sm flex items-center gap-1.5 cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      Confirm & Commit Promotion
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-gray-100/70 text-[10px] font-black text-gray-400 uppercase tracking-wider border-b border-gray-200">
                        <th className="py-3 px-4">Student Name & Reg No</th>
                        <th className="py-3 px-4">Programme</th>
                        <th className="py-3 px-4">Current Year ({sourceYear})</th>
                        <th className="py-3 px-4">Proposed Target ({targetYear})</th>
                        <th className="py-3 px-4">Promotion Action Override</th>
                        <th className="py-3 px-4">Target Section</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-medium">
                      {promotionList.map((cand, idx) => (
                        <tr key={cand.studentId} className="hover:bg-pink-50/20 transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-extrabold text-gray-900">{cand.studentName}</div>
                            <div className="text-[10px] text-gray-400 font-mono">{cand.regNo}</div>
                          </td>

                          <td className="py-3 px-4 font-bold text-[#8B1E3F]">
                            {cand.programme}
                          </td>

                          <td className="py-3 px-4 text-gray-700 font-semibold">
                            {cand.currentYear} ({cand.currentSemester})
                          </td>

                          <td className="py-3 px-4">
                            <span className="font-extrabold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                              {cand.proposedNextYear} ({cand.proposedNextSemester})
                            </span>
                          </td>

                          <td className="py-3 px-4">
                            <select
                              value={cand.action}
                              onChange={(e) => handleUpdateCandidateAction(idx, e.target.value as any)}
                              className={`bg-white border rounded-xl px-2.5 py-1.5 text-xs font-bold focus:outline-none ${
                                cand.action === 'Promote' ? 'border-emerald-300 text-emerald-800' :
                                cand.action === 'Hold Back' ? 'border-amber-300 text-amber-800' :
                                cand.action === 'Graduated' ? 'border-slate-300 text-slate-800' :
                                'border-red-300 text-red-800'
                              }`}
                            >
                              <option value="Promote">Promote to Next Year</option>
                              <option value="Hold Back">Hold Back (Same Year)</option>
                              <option value="Repeat Year">Repeat Year</option>
                              <option value="Graduated">Mark Graduated</option>
                              <option value="Discontinued">Discontinued</option>
                              <option value="Transferred">Transferred</option>
                            </select>
                          </td>

                          <td className="py-3 px-4">
                            <select
                              value={cand.targetSection}
                              onChange={(e) => handleUpdateCandidateSection(idx, e.target.value)}
                              className="bg-white border border-gray-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-gray-800 focus:outline-none"
                            >
                              <option value="Section A">Section A</option>
                              <option value="Section B">Section B</option>
                              <option value="Section C">Section C</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </GlassCard>
            </div>
          )}

          {/* STEP 3: CONFIRMATION COMPLETE */}
          {wizardStep === 3 && (
            <GlassCard className="p-8 text-center rounded-3xl bg-white border border-gray-200 max-w-xl mx-auto space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
                <CheckCircle className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-xl font-extrabold text-gray-900">Academic Promotion Successfully Executed!</h3>
                <p className="text-xs text-gray-500 mt-1">
                  Created new Academic Enrollment records for <strong>Academic Year {targetYear}</strong> for {promotionList.length} students. Master student records and previous academic histories remain preserved.
                </p>
              </div>

              <div className="pt-4 flex justify-center gap-3">
                <button
                  onClick={() => setWizardStep(1)}
                  className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-extrabold text-xs rounded-xl transition-all cursor-pointer"
                >
                  Start Another Promotion
                </button>
                <button
                  onClick={onBack}
                  className="px-5 py-2.5 bg-[#8B1E3F] hover:bg-[#721733] text-white font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer"
                >
                  Return to Dashboard
                </button>
              </div>
            </GlassCard>
          )}
        </div>
      )}
    </div>
  );
}
