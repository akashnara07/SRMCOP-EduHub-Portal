import React, { useState, useEffect, useMemo } from 'react';
import { 
  ArrowLeft, BookOpen, Search, Plus, Filter, Check, Trash2, Edit2, 
  Copy, Save, Layers, CheckCircle2, Calendar, User, GraduationCap,
  Sparkles, X, ChevronRight, ChevronDown, Sliders, AlertCircle, AlertTriangle
} from 'lucide-react';
import GlassCard from '../GlassCard';
import AcademicSessionWorkspace from '../AcademicSessionWorkspace';
import TeachingAllocationAuditReport from './TeachingAllocationAuditReport';
import { useAcademicYear } from '../../context/AcademicYearContext';
import { 
  FacultyMember, 
  TeachingAssignment, 
  getFacultyMaster, 
  getTeachingAssignments, 
  saveTeachingAssignments,
  copyAllocations 
} from '../../data/facultyRegistry';
import { getCurriculumDb } from '../../data/curriculumDb';
import { getSemesterTheme } from '../../lib/semesterColors';

interface TeachingAllocationProps {
  onBack: () => void;
}

const PROGRAMMES = ['B.Pharm', 'Pharm.D', 'M.Pharm'] as const;
const DEPARTMENTS = [
  'All',
  'Department of Pharmacology',
  'Department of Pharmaceutical Analysis',
  'Department of Pharmacognosy',
  'Department of Pharmaceutics',
  'Department of Pharmacy Practice',
  'Department of Pharmaceutical Quality Assurance',
  'Department of Pharmaceutical Regulatory affairs',
  'Department of Pharmaceutical Chemistry'
];

export default function TeachingAllocation({ onBack }: TeachingAllocationProps) {
  const { activeAcademicYear, setActiveAcademicYear, availableAcademicYears, selectedProgramme, selectedRegulation } = useAcademicYear();

  // Master Faculty and Allocation Data
  const [facultyList] = useState<FacultyMember[]>(() => getFacultyMaster());
  const [assignments, setAssignments] = useState<TeachingAssignment[]>(() => getTeachingAssignments());
  const [masterCourses, setMasterCourses] = useState<any[]>([]);

  // Load curriculum courses for quick auto-complete
  useEffect(() => {
    try {
      const db = getCurriculumDb();
      if (db && db.courseInformation) {
        setMasterCourses(db.courseInformation);
      }
    } catch (e) {
      console.error('Error reading curriculum DB:', e);
    }
  }, []);

  // Main List Filters
  const [searchFaculty, setSearchFaculty] = useState<string>('');
  const [filterDept, setFilterDept] = useState<string>('All');

  // Currently Selected Faculty for Dedicated View
  const [selectedFaculty, setSelectedFaculty] = useState<FacultyMember | null>(null);

  // Modal State for Add / Edit Course
  const [showCourseModal, setShowCourseModal] = useState<boolean>(false);
  const [editingAssignmentId, setEditingAssignmentId] = useState<string | null>(null);

  // Form Fields for Curriculum-Driven Modal
  const [formAcademicYear, setFormAcademicYear] = useState<string>(activeAcademicYear);
  const [formProgramme, setFormProgramme] = useState<'B.Pharm' | 'Pharm.D' | 'M.Pharm'>('B.Pharm');
  const [formAcademicLevel, setFormAcademicLevel] = useState<number>(1);
  const [selectedCurriculumSubject, setSelectedCurriculumSubject] = useState<any | null>(null);
  const [subjectSearchQuery, setSubjectSearchQuery] = useState<string>('');

  // Copy Previous Year Modal State
  const [showCopyModal, setShowCopyModal] = useState<boolean>(false);
  const [copySourceYear, setCopySourceYear] = useState<string>('2025-2026');
  const [copyTargetYear, setCopyTargetYear] = useState<string>('2026-2027');

  // Audit Report State
  const [showAuditReport, setShowAuditReport] = useState<boolean>(false);

  // Collapsible sections state in dedicated view
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  // Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSaveAssignments = (newList: TeachingAssignment[]) => {
    setAssignments(newList);
    saveTeachingAssignments(newList);
  };

  // Helper for Roman numerals
  const getRoman = (num: number): string => {
    const map: Record<number, string> = { 1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V', 6: 'VI', 7: 'VII', 8: 'VIII' };
    return map[num] || String(num);
  };

  // Reset helpers for progressive filters
  const handleProgrammeChange = (prog: 'B.Pharm' | 'Pharm.D' | 'M.Pharm') => {
    setFormProgramme(prog);
    setFormAcademicLevel(1);
    setSelectedCurriculumSubject(null);
    setSubjectSearchQuery('');
  };

  const handleAcademicLevelChange = (level: number) => {
    setFormAcademicLevel(level);
    setSelectedCurriculumSubject(null);
    setSubjectSearchQuery('');
  };

  // Helper for matching academic context (Session + Programme + Regulation)
  const isAssignmentMatchingContext = (a: TeachingAssignment) => {
    if (a.academicYear !== activeAcademicYear) return false;
    if ((a.programme || 'B.Pharm') !== selectedProgramme) return false;
    if (a.regulation) return a.regulation === selectedRegulation;
    return true; // fallback for unassigned/legacy records
  };

  // Available Curriculum Subjects based on Programme & Academic Level & Regulation
  const availableCurriculumSubjects = useMemo(() => {
    if (!masterCourses || masterCourses.length === 0) return [];
    const progClean = formProgramme.toLowerCase().trim();
    const regClean = selectedRegulation.toLowerCase().trim();

    return masterCourses.filter(c => {
      const cProg = (c.programme || '').toLowerCase().trim();
      const cReg = (c.regulation || '').toLowerCase().trim();

      if (cReg && cReg !== regClean) return false;

      if (progClean === 'pharm.d') {
        if (cProg !== 'pharm.d') return false;
        const yr = Number(c.year || c.semester);
        return yr === formAcademicLevel;
      } else {
        if (cProg !== progClean) return false;
        const sem = Number(c.semester);
        return sem === formAcademicLevel;
      }
    });
  }, [masterCourses, formProgramme, formAcademicLevel, selectedRegulation]);

  // Filtered available subjects for autocomplete search
  const filteredAvailableSubjects = useMemo(() => {
    if (!subjectSearchQuery.trim()) return availableCurriculumSubjects;
    const q = subjectSearchQuery.toLowerCase().trim();
    return availableCurriculumSubjects.filter(s => {
      const codeMatch = (s.subjectCode || s.courseCode || '').toLowerCase().includes(q);
      const nameMatch = (s.courseName || s.name || '').toLowerCase().includes(q);
      return codeMatch || nameMatch;
    });
  }, [availableCurriculumSubjects, subjectSearchQuery]);

  // Check for Duplicate Assignment across faculty members in the same session, programme, level & subject
  const duplicateAssignment = useMemo(() => {
    if (!selectedCurriculumSubject) return null;
    const targetCode = (selectedCurriculumSubject.subjectCode || selectedCurriculumSubject.courseCode || '').toUpperCase().trim();
    if (!targetCode) return null;

    return assignments.find(a => 
      a.academicYear === formAcademicYear &&
      a.programme === formProgramme &&
      (a.semester || 1) === formAcademicLevel &&
      a.courseCode.toUpperCase().trim() === targetCode &&
      (editingAssignmentId ? a.id !== editingAssignmentId : true)
    );
  }, [selectedCurriculumSubject, formAcademicYear, formProgramme, formAcademicLevel, assignments, editingAssignmentId]);

  // Filtered Faculty List by Search & Dept Filter
  const filteredFacultyList = useMemo(() => {
    return facultyList.filter(fac => {
      if (filterDept !== 'All' && fac.dept !== filterDept) return false;
      if (searchFaculty.trim()) {
        const q = searchFaculty.toLowerCase().trim();
        const nameMatch = fac.name.toLowerCase().includes(q);
        const empMatch = fac.empId.toLowerCase().includes(q);
        const deptMatch = fac.dept.toLowerCase().includes(q);
        const desMatch = (fac.designation || '').toLowerCase().includes(q);
        if (!nameMatch && !empMatch && !deptMatch && !desMatch) return false;
      }
      return true;
    });
  }, [facultyList, filterDept, searchFaculty]);

  // Divided Faculty: Section 1 (Active Allocations) vs Section 2 (No Allocations) for Active Context (Year + Programme + Regulation)
  const { activeFaculty, unassignedFaculty } = useMemo(() => {
    const active: { faculty: FacultyMember; assignments: TeachingAssignment[]; subjectCount: number }[] = [];
    const unassigned: { faculty: FacultyMember; assignments: TeachingAssignment[]; subjectCount: number }[] = [];

    filteredFacultyList.forEach(fac => {
      const facAss = assignments.filter(a => 
        a.facultyId === fac.id && 
        isAssignmentMatchingContext(a)
      );
      if (facAss.length > 0) {
        active.push({ faculty: fac, assignments: facAss, subjectCount: facAss.length });
      } else {
        unassigned.push({ faculty: fac, assignments: [], subjectCount: 0 });
      }
    });

    // Sort active by subjectCount descending, then name ascending
    active.sort((a, b) => b.subjectCount - a.subjectCount || a.faculty.name.localeCompare(b.faculty.name));
    // Sort unassigned alphabetically
    unassigned.sort((a, b) => a.faculty.name.localeCompare(b.faculty.name));

    return { activeFaculty: active, unassignedFaculty: unassigned };
  }, [filteredFacultyList, assignments, activeAcademicYear, selectedProgramme, selectedRegulation]);

  // Assignments for Currently Selected Faculty in Active Academic Context
  const selectedFacultySessionAssignments = useMemo(() => {
    if (!selectedFaculty) return [];
    return assignments.filter(a => 
      a.facultyId === selectedFaculty.id && 
      isAssignmentMatchingContext(a)
    );
  }, [selectedFaculty, activeAcademicYear, selectedProgramme, selectedRegulation, assignments]);

  // Grouped Assignments by Programme and then Semester/Year
  const groupedAssignments = useMemo(() => {
    const grouped: Record<string, Record<number, TeachingAssignment[]>> = {};
    
    selectedFacultySessionAssignments.forEach(item => {
      const prog = item.programme || 'B.Pharm';
      const sem = item.semester || 1;
      
      if (!grouped[prog]) grouped[prog] = {};
      if (!grouped[prog][sem]) grouped[prog][sem] = [];
      
      grouped[prog][sem].push(item);
    });

    return grouped;
  }, [selectedFacultySessionAssignments]);

  // Open "Add Course" Modal
  const handleOpenAddCourse = () => {
    setEditingAssignmentId(null);
    setFormAcademicYear(activeAcademicYear);
    setFormProgramme((selectedProgramme as 'B.Pharm' | 'Pharm.D' | 'M.Pharm') || 'B.Pharm');
    setFormAcademicLevel(1);
    setSelectedCurriculumSubject(null);
    setSubjectSearchQuery('');
    setShowCourseModal(true);
  };

  // Open "Edit Course" Modal
  const handleOpenEditCourse = (item: TeachingAssignment) => {
    setEditingAssignmentId(item.id);
    setFormAcademicYear(item.academicYear);
    setFormProgramme(item.programme);
    setFormAcademicLevel(item.semester || 1);

    const found = masterCourses.find(c => 
      (c.subjectCode || c.courseCode || '').toUpperCase().trim() === item.courseCode.toUpperCase().trim()
    );

    if (found) {
      setSelectedCurriculumSubject(found);
    } else {
      setSelectedCurriculumSubject({
        subjectCode: item.courseCode,
        courseName: item.courseName,
        programme: item.programme,
        semester: item.semester,
        year: item.semester,
        subjectType: item.teachingType?.practical ? 'Practical' : 'Theory'
      });
    }
    setSubjectSearchQuery('');
    setShowCourseModal(true);
  };

  // Handle Save Course Form
  const handleSaveCourseForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFaculty) return;
    if (!selectedCurriculumSubject) {
      alert('Please select a subject from the curriculum database.');
      return;
    }
    if (duplicateAssignment) {
      alert(`This subject (${selectedCurriculumSubject.subjectCode || selectedCurriculumSubject.courseCode}) is already assigned to ${duplicateAssignment.facultyName} for ${formAcademicYear}. Duplicate assignments are not allowed.`);
      return;
    }

    const subCode = (selectedCurriculumSubject.subjectCode || selectedCurriculumSubject.courseCode || '').toUpperCase().trim();
    const subName = selectedCurriculumSubject.courseName || selectedCurriculumSubject.name || 'Course Module';
    const isPractical = (selectedCurriculumSubject.subjectType || '').toLowerCase() === 'practical' || subCode.endsWith('P');

    const payload: TeachingAssignment = {
      id: editingAssignmentId || `ta-${Date.now()}`,
      academicYear: formAcademicYear,
      programme: formProgramme,
      regulation: selectedRegulation,
      semester: Number(formAcademicLevel),
      dept: selectedFaculty.dept,
      courseCode: subCode,
      courseName: subName,
      facultyId: selectedFaculty.id,
      facultyName: selectedFaculty.name,
      teachingType: { theory: !isPractical, practical: isPractical, tutorial: false },
      role: 'Faculty',
      status: 'Active'
    };

    if (editingAssignmentId) {
      const updated = assignments.map(a => a.id === editingAssignmentId ? payload : a);
      handleSaveAssignments(updated);
      showToast('Course assignment updated from curriculum!');
    } else {
      const updated = [payload, ...assignments];
      handleSaveAssignments(updated);
      showToast('New curriculum subject assigned to faculty!');
    }

    setShowCourseModal(false);
  };

  // Handle Remove Course Assignment
  const handleRemoveAssignment = (id: string, courseCode: string) => {
    if (confirm(`Are you sure you want to remove course assignment ${courseCode}?`)) {
      const updated = assignments.filter(a => a.id !== id);
      handleSaveAssignments(updated);
      showToast(`Course ${courseCode} removed.`);
    }
  };

  // Handle Execute Copy Allocations
  const handleExecuteCopy = () => {
    if (copySourceYear === copyTargetYear) {
      alert('Source and Target academic years cannot be identical.');
      return;
    }
    const newList = copyAllocations(copySourceYear, copyTargetYear);
    setAssignments(newList);
    setShowCopyModal(false);
    showToast(`Successfully copied course allocations from ${copySourceYear} to ${copyTargetYear}!`);
  };

  const toggleSectionCollapse = (key: string) => {
    setCollapsedSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Counter for continuous Serial Number across active & unassigned groups
  let globalSNo = 1;

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-[#8B1E3F] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-white/20 animate-slide-down">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* HEADER BAR */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/60 backdrop-blur-md p-6 rounded-3xl border border-white/40 shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={selectedFaculty ? () => setSelectedFaculty(null) : onBack}
            className="w-10 h-10 rounded-full bg-white hover:bg-gray-100 flex items-center justify-center text-gray-700 shadow-sm border border-gray-200 transition-all cursor-pointer"
            title={selectedFaculty ? "Back to Faculty List" : "Back to Admin Dashboard"}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#8B1E3F] bg-pink-100/60 px-3 py-1 rounded-full border border-pink-200/50">
                Academic Operations
              </span>
              <span className="text-xs text-gray-400">• Curriculum-Driven Teaching Allocation</span>
            </div>
            <h1 className="text-2xl font-display font-extrabold text-gray-900 mt-1 flex items-center gap-2">
              📚 Teaching Allocation
            </h1>
            <p className="text-xs text-gray-500 font-medium">
              {selectedFaculty 
                ? `Managing course assignments for ${selectedFaculty.name} for AY ${activeAcademicYear}` 
                : `Curriculum-driven course allocations for Academic Session AY ${activeAcademicYear}`}
            </p>
          </div>
        </div>

        {!selectedFaculty && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAuditReport(true)}
              className="px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-extrabold text-xs rounded-full border border-emerald-200/80 shadow-sm flex items-center gap-2 transition-all cursor-pointer hover:shadow-md"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Population Audit Report
            </button>

            <button
              onClick={() => setShowCopyModal(true)}
              className="px-4 py-2.5 bg-white hover:bg-pink-50/50 text-[#8B1E3F] font-bold text-xs rounded-full border border-pink-200/60 shadow-sm flex items-center gap-2 transition-all cursor-pointer hover:shadow-md"
            >
              <Copy className="w-4 h-4 text-[#8B1E3F]" />
              Copy Allocations
            </button>
          </div>
        )}
      </div>

      {/* TEACHING ACADEMIC SESSION WORKSPACE */}
      <AcademicSessionWorkspace
        moduleName="TEACHING ACADEMIC SESSION WORKSPACE"
      />

      {/* ========================================================= */}
      {/* VIEW 1: MAIN FACULTY LIST (Faculty-Centric Table)        */}
      {/* ========================================================= */}
      {!selectedFaculty ? (
        <div className="space-y-6">
          {/* Top Filter & Search */}
          <GlassCard className="p-4 rounded-3xl border border-white/40 shadow-sm bg-white/70">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="flex flex-1 gap-3 w-full sm:w-auto">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchFaculty}
                    onChange={(e) => setSearchFaculty(e.target.value)}
                    placeholder="Search faculty by name, employee ID..."
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2 text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#8B1E3F]/30"
                  />
                </div>

                <select
                  value={filterDept}
                  onChange={(e) => setFilterDept(e.target.value)}
                  className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#8B1E3F]/30"
                >
                  {DEPARTMENTS.map(d => (
                    <option key={d} value={d}>
                      {d === 'All' ? 'All Departments' : d.replace('Department of ', '')}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
                  Assigned: {activeFaculty.length}
                </span>
                <span className="text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200">
                  Unassigned: {unassignedFaculty.length}
                </span>
              </div>
            </div>
          </GlassCard>

          {/* Main Faculty Table - Divided into Section 1 & Section 2 */}
          <GlassCard className="p-0 rounded-3xl border border-white/40 overflow-hidden shadow-sm bg-white/80">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-100/80 text-[10px] font-black text-gray-500 uppercase tracking-wider border-b border-gray-200">
                    <th className="py-3.5 px-3 w-[1%] whitespace-nowrap text-center">S.No</th>
                    <th className="py-3.5 px-5 w-auto">Faculty Name</th>
                    <th className="py-3.5 px-5 w-[1%] whitespace-nowrap">Employee ID</th>
                    <th className="py-3.5 px-5 w-[1%] whitespace-nowrap">Department</th>
                    <th className="py-3.5 px-5 w-[1%] whitespace-nowrap">Teaching Status</th>
                    <th className="py-3.5 px-5 w-[1%] whitespace-nowrap text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs font-medium text-gray-700">
                  {/* SECTION 1: FACULTY WITH ACTIVE TEACHING ASSIGNMENTS */}
                  {activeFaculty.length > 0 && (
                    activeFaculty.map(({ faculty: fac, assignments: facAss, subjectCount }) => {
                      const curSNo = globalSNo++;

                      return (
                        <tr key={fac.id} className="hover:bg-pink-50/30 transition-colors group">
                          {/* S.No */}
                          <td className="py-3.5 px-3 text-center font-bold text-gray-400 text-xs w-[1%] whitespace-nowrap">
                            {curSNo}
                          </td>

                          {/* Faculty Name */}
                          <td className="py-4 px-5 w-auto">
                            <div className="font-bold text-gray-900 group-hover:text-[#8B1E3F] transition-colors text-sm">
                              {fac.name}
                            </div>
                          </td>

                          {/* Employee ID */}
                          <td className="py-4 px-5 font-mono text-xs text-gray-700 font-bold w-[1%] whitespace-nowrap">
                            {fac.empId}
                          </td>

                          {/* Department */}
                          <td className="py-4 px-5 text-gray-800 font-semibold w-[1%] whitespace-nowrap">
                            {fac.dept.replace('Department of ', '')}
                          </td>

                          {/* Teaching Status */}
                          <td className="py-4 px-5 w-[1%] whitespace-nowrap">
                            <span className="inline-flex items-center gap-1.5 text-[11px] font-black bg-emerald-100/80 text-emerald-800 px-3 py-1 rounded-full border border-emerald-200 shadow-2xs">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              {subjectCount} {subjectCount === 1 ? 'Subject Assigned' : 'Subjects Assigned'}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="py-4 px-5 text-right w-[1%] whitespace-nowrap">
                            <button
                              onClick={() => setSelectedFaculty(fac)}
                              className="px-4 py-2 bg-gradient-to-r from-[#8B1E3F] to-[#CD4368] text-white font-extrabold text-xs rounded-xl shadow-xs hover:shadow-md transition-all flex items-center gap-1.5 ml-auto cursor-pointer active:scale-98"
                            >
                              <BookOpen className="w-3.5 h-3.5" />
                              Manage Teaching
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}

                  {/* SECTION 2: FACULTY WITH NO TEACHING ALLOCATION */}
                  {unassignedFaculty.length > 0 && (
                    <>
                      <tr className="bg-amber-50/60 border-y border-amber-100/80">
                        <td colSpan={6} className="py-2.5 px-5 text-amber-900 font-extrabold text-[11px] uppercase tracking-wider">
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-2">
                              <AlertCircle className="w-4 h-4 text-amber-600" />
                              NO COURSE ASSIGNMENTS (AY {activeAcademicYear})
                            </span>
                            <span className="text-[10px] bg-amber-100/80 text-amber-800 px-2.5 py-0.5 rounded-full font-black">
                              {unassignedFaculty.length} Faculty Unassigned
                            </span>
                          </div>
                        </td>
                      </tr>

                      {unassignedFaculty.map(({ faculty: fac }) => {
                        const curSNo = globalSNo++;

                        return (
                          <tr key={fac.id} className="hover:bg-amber-50/20 transition-colors group">
                            {/* S.No */}
                            <td className="py-4 px-3 text-center font-bold text-gray-400 text-xs w-[1%] whitespace-nowrap">
                              {curSNo}
                            </td>

                            {/* Faculty Name */}
                            <td className="py-4 px-5 w-auto">
                              <div className="font-bold text-gray-900 text-sm">
                                {fac.name}
                              </div>
                            </td>

                            {/* Employee ID */}
                            <td className="py-4 px-5 font-mono text-xs text-gray-600 font-bold w-[1%] whitespace-nowrap">
                              {fac.empId}
                            </td>

                            {/* Department */}
                            <td className="py-4 px-5 text-gray-800 font-semibold w-[1%] whitespace-nowrap">
                              {fac.dept.replace('Department of ', '')}
                            </td>

                            {/* Teaching Status */}
                            <td className="py-4 px-5 w-[1%] whitespace-nowrap">
                              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold bg-gray-100 text-gray-500 px-3 py-1 rounded-full border border-gray-200">
                                No Courses Assigned
                              </span>
                            </td>

                            {/* Actions */}
                            <td className="py-4 px-5 text-right w-[1%] whitespace-nowrap">
                              <button
                                onClick={() => {
                                  setSelectedFaculty(fac);
                                  handleOpenAddCourse();
                                }}
                                className="px-4 py-2 bg-white hover:bg-pink-50 text-[#8B1E3F] font-bold text-xs rounded-xl border border-pink-200/80 shadow-2xs hover:shadow-xs transition-all flex items-center gap-1.5 ml-auto cursor-pointer"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                Assign Teaching
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </>
                  )}

                  {activeFaculty.length === 0 && unassignedFaculty.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-gray-400 font-semibold text-xs">
                        No faculty members match your search criteria or department filter for AY {activeAcademicYear}.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>
      ) : (
        /* ========================================================= */
        /* VIEW 2: DEDICATED FACULTY TEACHING PAGE / SIDE PANEL     */
        /* ========================================================= */
        <div className="space-y-6">
          {/* Faculty Header Profile Card */}
          <GlassCard className="p-6 rounded-3xl border border-white/40 shadow-sm bg-white/80">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-gray-100">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#8B1E3F] to-rose-400 text-white font-black text-lg flex items-center justify-center shadow-md shrink-0">
                  {selectedFaculty.name.replace('Dr. ', '').replace('Prof. ', '').split(' ').map(p => p[0]).filter(Boolean).join('').substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-gray-900">{selectedFaculty.name}</h2>
                  <p className="text-xs text-[#8B1E3F] font-bold mt-0.5">
                    {selectedFaculty.designation ? `${selectedFaculty.designation} • ` : ''}<span className="text-gray-500">{selectedFaculty.dept}</span>
                  </p>
                  <p className="text-[11px] text-gray-400 font-mono mt-0.5">
                    Emp ID: {selectedFaculty.empId} | Email: {selectedFaculty.email}
                  </p>
                </div>
              </div>

              {/* Add Course Button */}
              <button
                onClick={handleOpenAddCourse}
                className="px-5 py-2.5 bg-gradient-to-r from-[#8B1E3F] to-[#CD4368] text-white font-extrabold text-xs rounded-full shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer active:scale-98"
              >
                <Plus className="w-4 h-4" />
                Add Curriculum Subject
              </button>
            </div>

            {/* Academic Session Sync Indicator */}
            <div className="mt-4 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 bg-pink-50/80 px-3.5 py-1.5 rounded-full border border-pink-200/60 text-[#8B1E3F] font-bold">
                <Calendar className="w-4 h-4 text-[#8B1E3F]" />
                <span>Current Active Session: AY {activeAcademicYear}</span>
              </div>
              <span className="text-gray-400 text-[11px]">
                Teaching allocations automatically synchronize with curriculum master
              </span>
            </div>
          </GlassCard>

          {/* Teaching Assignments List Grouped by Programme & Semester/Year */}
          <div className="space-y-5">
            {Object.keys(groupedAssignments).length === 0 ? (
              <GlassCard className="p-12 text-center rounded-3xl bg-white/80 border border-gray-200/80 shadow-2xs space-y-3">
                <div className="w-12 h-12 rounded-full bg-pink-100 text-[#8B1E3F] mx-auto flex items-center justify-center">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-extrabold text-gray-800">
                  No teaching allocation for AY {activeAcademicYear}.
                </h3>
                <p className="text-xs text-gray-500 max-w-md mx-auto">
                  Assign a course to begin teaching allocation for {selectedFaculty.name}. Course information will be automatically retrieved from the official curriculum.
                </p>
                <button
                  onClick={handleOpenAddCourse}
                  className="px-5 py-2.5 bg-[#8B1E3F] text-white font-bold text-xs rounded-xl shadow-xs hover:bg-[#721733] transition-all inline-flex items-center gap-2 cursor-pointer mt-2"
                >
                  <Plus className="w-4 h-4" />
                  Assign Course from Curriculum
                </button>
              </GlassCard>
            ) : (
              Object.keys(groupedAssignments).map((programme) => {
                const levels = Object.keys(groupedAssignments[programme]).map(Number).sort((a,b) => a - b);
                const isPharmD = programme === 'Pharm.D';

                return (
                  <div key={programme} className="space-y-4">
                    {/* Programme Banner */}
                    <div className="flex items-center gap-2.5 border-b border-pink-200/60 pb-2">
                      <GraduationCap className="w-5 h-5 text-[#8B1E3F]" />
                      <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider">
                        Programme: {programme}
                      </h3>
                      <span className="text-[10px] font-bold text-[#8B1E3F] bg-pink-100 px-2.5 py-0.5 rounded-full">
                        Academic Session AY {activeAcademicYear}
                      </span>
                    </div>

                    {/* Academic Level Group Cards */}
                    <div className="grid grid-cols-1 gap-4">
                      {levels.map((level) => {
                        const items = groupedAssignments[programme][level];
                        const levelText = isPharmD ? `Year ${getRoman(level)}` : `Semester ${getRoman(level)}`;
                        const sectionKey = `${programme}-Level${level}`;
                        const isCollapsed = collapsedSections[sectionKey];

                        return (
                          <GlassCard key={level} className="p-0 rounded-2xl border border-white/60 overflow-hidden bg-white/90 shadow-2xs">
                            {/* Level Section Header */}
                            <div 
                              onClick={() => toggleSectionCollapse(sectionKey)}
                              className="p-4 bg-gray-50/90 border-b border-gray-100 flex items-center justify-between cursor-pointer hover:bg-pink-50/40 transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <span className="w-8 h-8 rounded-lg bg-pink-100 text-[#8B1E3F] font-black text-xs flex items-center justify-center border border-pink-200">
                                  {isPharmD ? `Y${level}` : `S${level}`}
                                </span>
                                <div>
                                  <h4 className="text-xs font-black text-gray-800 uppercase tracking-wide">
                                    {levelText}
                                  </h4>
                                  <span className="text-[10px] text-gray-400 font-semibold">
                                    {items.length} Assigned {items.length === 1 ? 'Subject' : 'Subjects'}
                                  </span>
                                </div>
                              </div>

                              <button className="text-gray-400 hover:text-gray-700">
                                {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                              </button>
                            </div>

                            {/* Course List inside Academic Level */}
                            {!isCollapsed && (
                              <div className="divide-y divide-gray-100">
                                {items.map((item) => (
                                  <div 
                                    key={item.id} 
                                    className="p-4 flex items-center justify-between hover:bg-pink-50/20 transition-colors group"
                                  >
                                    <div className="flex items-center gap-3">
                                      <span className="font-mono text-xs font-black bg-gray-100 text-gray-900 px-3 py-1 rounded-lg border border-gray-200 shrink-0">
                                        {item.courseCode}
                                      </span>
                                      <div>
                                        <div className="text-xs font-extrabold text-gray-900 group-hover:text-[#8B1E3F] transition-colors">
                                          {item.courseName}
                                        </div>
                                        <div className="text-[10px] text-gray-400 font-medium mt-0.5 flex items-center gap-2">
                                          <span>Inherited from Official Curriculum</span>
                                          <span>•</span>
                                          <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                                            {item.teachingType?.practical ? 'Practical' : 'Theory'}
                                          </span>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Edit / Remove Actions */}
                                    <div className="flex items-center gap-2">
                                      <button
                                        onClick={() => handleOpenEditCourse(item)}
                                        className="p-1.5 text-gray-400 hover:text-[#8B1E3F] hover:bg-white rounded-lg border border-transparent hover:border-gray-200 transition-all cursor-pointer"
                                        title="Edit Course Allocation"
                                      >
                                        <Edit2 className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        onClick={() => handleRemoveAssignment(item.id, item.courseCode)}
                                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-white rounded-lg border border-transparent hover:border-gray-200 transition-all cursor-pointer"
                                        title="Remove Course Assignment"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </GlassCard>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 1: CURRICULUM-DRIVEN COURSE ASSIGNMENT DIALOG       */}
      {/* ========================================================= */}
      {showCourseModal && selectedFaculty && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-white/20 animate-scale-up space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-pink-100 text-[#8B1E3F] flex items-center justify-center">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-gray-900">
                    {editingAssignmentId ? 'Edit Course Assignment' : 'Add Curriculum Course Assignment'}
                  </h3>
                  <p className="text-[10px] text-gray-400 font-medium">
                    Faculty: <span className="font-bold text-gray-800">{selectedFaculty.name}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCourseModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-900 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCourseForm} className="space-y-4 text-xs">
              {/* STEP 1: Academic Session */}
              <div>
                <label className="text-[10px] font-extrabold uppercase text-gray-500 block mb-1">
                  1. Academic Session <span className="text-red-500">*</span>
                </label>
                <select
                  value={formAcademicYear}
                  onChange={(e) => setFormAcademicYear(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#8B1E3F]/30"
                  required
                >
                  {availableAcademicYears.map(yr => (
                    <option key={yr} value={yr}>AY {yr}</option>
                  ))}
                </select>
              </div>

              {/* STEP 2: Programme & Academic Level */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-extrabold uppercase text-gray-500 block mb-1">
                    2. Programme <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formProgramme}
                    onChange={(e) => handleProgrammeChange(e.target.value as any)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#8B1E3F]/30"
                    required
                  >
                    {PROGRAMMES.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-extrabold uppercase text-gray-500 block mb-1">
                    3. Academic Level <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formAcademicLevel}
                    onChange={(e) => handleAcademicLevelChange(Number(e.target.value))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#8B1E3F]/30"
                    required
                  >
                    {formProgramme === 'B.Pharm' && [1,2,3,4,5,6,7,8].map(s => (
                      <option key={s} value={s}>Semester {getRoman(s)}</option>
                    ))}
                    {formProgramme === 'M.Pharm' && [1,2,3,4].map(s => (
                      <option key={s} value={s}>Semester {getRoman(s)}</option>
                    ))}
                    {formProgramme === 'Pharm.D' && [1,2,3,4,5,6].map(y => (
                      <option key={y} value={y}>Year {getRoman(y)}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* STEP 3: Curriculum-Driven Subject Autocomplete Dropdown */}
              <div>
                <label className="text-[10px] font-extrabold uppercase text-gray-500 block mb-1">
                  4. Available Subjects from Curriculum Master <span className="text-red-500">*</span>
                </label>

                {selectedCurriculumSubject ? (
                  /* Selected Subject Badge */
                  {...(() => {
                    const theme = getSemesterTheme(formProgramme, formAcademicLevel);
                    return (
                      <div className={`p-3.5 border rounded-2xl flex items-center justify-between ${theme.cardBg} ${theme.cardBorder}`}>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className={`font-mono font-black text-xs px-2.5 py-0.5 rounded-md border ${theme.codeChip}`}>
                              {selectedCurriculumSubject.subjectCode || selectedCurriculumSubject.courseCode}
                            </span>
                            <span className="text-xs font-extrabold text-gray-900">
                              {selectedCurriculumSubject.courseName || selectedCurriculumSubject.name}
                            </span>
                          </div>
                          <div className="text-[10px] text-gray-500 font-semibold flex items-center gap-2">
                            <span>{formProgramme}</span>
                            <span>•</span>
                            <span>
                              {formProgramme === 'Pharm.D' ? `Year ${getRoman(formAcademicLevel)}` : `Semester ${getRoman(formAcademicLevel)}`}
                            </span>
                            {selectedCurriculumSubject.credits && (
                              <>
                                <span>•</span>
                                <span>{selectedCurriculumSubject.credits} Credits</span>
                              </>
                            )}
                            {selectedCurriculumSubject.subjectType && (
                              <>
                                <span>•</span>
                                <span className={`font-bold ${theme.text}`}>{selectedCurriculumSubject.subjectType}</span>
                              </>
                            )}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setSelectedCurriculumSubject(null)}
                          className="text-xs font-bold text-gray-500 hover:text-red-600 bg-white p-1.5 rounded-lg border border-gray-200 cursor-pointer"
                          title="Select a different subject"
                        >
                          Change
                        </button>
                      </div>
                    );
                  })()}
                ) : (
                  /* Searchable Autocomplete Dropdown */
                  <div className="space-y-2">
                    <div className="relative">
                      <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={subjectSearchQuery}
                        onChange={(e) => setSubjectSearchQuery(e.target.value)}
                        placeholder={`Search ${availableCurriculumSubjects.length} curriculum subjects...`}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#8B1E3F]/30"
                      />
                    </div>

                    <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-2xl divide-y divide-gray-100 bg-gray-50/50">
                      {filteredAvailableSubjects.length > 0 ? (
                        filteredAvailableSubjects.map((sub, idx) => {
                          const code = sub.subjectCode || sub.courseCode;
                          const name = sub.courseName || sub.name;
                          const theme = getSemesterTheme(formProgramme, formAcademicLevel);
                          return (
                            <button
                              key={sub.id || idx}
                              type="button"
                              onClick={() => setSelectedCurriculumSubject(sub)}
                              className="w-full text-left p-2.5 hover:bg-gray-100/80 transition-colors flex items-center justify-between cursor-pointer group"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <span className={`font-mono text-[11px] font-black px-2 py-0.5 rounded-md border shrink-0 transition-colors ${theme.codeChip}`}>
                                  {code}
                                </span>
                                <span className="text-xs font-bold text-gray-900 truncate">
                                  {name}
                                </span>
                              </div>
                              <span className="text-[10px] text-gray-400 font-medium shrink-0 ml-2">
                                {sub.subjectType || 'Core'}
                              </span>
                            </button>
                          );
                        })
                      ) : (
                        <div className="p-4 text-center text-xs text-gray-400 font-medium">
                          No subjects found in curriculum for {formProgramme} {formProgramme === 'Pharm.D' ? `Year ${getRoman(formAcademicLevel)}` : `Semester ${getRoman(formAcademicLevel)}`}.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* DUPLICATE ASSIGNMENT WARNING */}
              {duplicateAssignment && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 flex items-start gap-2.5">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Duplicate Assignment Warning</span>
                    <span>
                      This subject ({selectedCurriculumSubject.subjectCode || selectedCurriculumSubject.courseCode}) is already allocated to <strong>{duplicateAssignment.facultyName}</strong> for AY {formAcademicYear}.
                    </span>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCourseModal(false)}
                  className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-bold text-xs rounded-xl hover:bg-gray-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedCurriculumSubject || Boolean(duplicateAssignment)}
                  className={`flex-1 py-2.5 text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer ${
                    !selectedCurriculumSubject || Boolean(duplicateAssignment)
                      ? 'bg-gray-300 cursor-not-allowed'
                      : 'bg-[#8B1E3F] hover:bg-[#721733]'
                  }`}
                >
                  Save Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: COPY ALLOCATIONS DIALOG                         */}
      {/* ========================================================= */}
      {showCopyModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-white/20 animate-scale-up space-y-5">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-pink-100 text-[#8B1E3F] flex items-center justify-center">
                  <Copy className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-gray-900">Copy Allocations</h3>
                  <p className="text-[10px] text-gray-400 font-medium">Duplicate course allocations across years</p>
                </div>
              </div>
              <button
                onClick={() => setShowCopyModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-900 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="text-[10px] font-extrabold uppercase text-gray-500 block mb-1">
                  Source Academic Year:
                </label>
                <select
                  value={copySourceYear}
                  onChange={(e) => setCopySourceYear(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-800"
                >
                  {availableAcademicYears.map(yr => (
                    <option key={yr} value={yr}>{yr}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-extrabold uppercase text-gray-500 block mb-1">
                  Target Academic Year:
                </label>
                <select
                  value={copyTargetYear}
                  onChange={(e) => setCopyTargetYear(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-800"
                >
                  {availableAcademicYears.map(yr => (
                    <option key={yr} value={yr}>{yr}</option>
                  ))}
                </select>
              </div>

              <div className="bg-pink-50/60 border border-pink-100 p-3 rounded-2xl text-[11px] text-[#8B1E3F] font-medium flex gap-2">
                <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  This will duplicate all course assignments from <strong>{copySourceYear}</strong> into <strong>{copyTargetYear}</strong>.
                </span>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowCopyModal(false)}
                className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-bold text-xs rounded-xl hover:bg-gray-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteCopy}
                className="flex-1 py-2.5 bg-[#8B1E3F] text-white font-bold text-xs rounded-xl hover:bg-[#721733] shadow-sm cursor-pointer"
              >
                Confirm Copy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* INSTITUTIONAL DATA POPULATION AUDIT REPORT MODAL */}
      <TeachingAllocationAuditReport
        isOpen={showAuditReport}
        onClose={() => setShowAuditReport(false)}
      />
    </div>
  );
}
