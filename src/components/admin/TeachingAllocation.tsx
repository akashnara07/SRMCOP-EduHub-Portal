import React, { useState, useEffect, useMemo } from 'react';
import { 
  ArrowLeft, BookOpen, Search, Plus, Filter, Check, Trash2, Edit2, 
  Copy, Save, Layers, CheckCircle2, Calendar, User, GraduationCap,
  Sparkles, X, ChevronRight, ChevronDown, Sliders, AlertCircle
} from 'lucide-react';
import GlassCard from '../GlassCard';
import { 
  FacultyMember, 
  TeachingAssignment, 
  getFacultyMaster, 
  getTeachingAssignments, 
  saveTeachingAssignments,
  copyAllocations 
} from '../../data/facultyRegistry';
import { getCurriculumDb } from '../../data/curriculumDb';

interface TeachingAllocationProps {
  onBack: () => void;
}

const ACADEMIC_YEARS = ['2024-2025', '2025-2026', '2026-2027'];
const PROGRAMMES = ['B.Pharm', 'Pharm.D', 'M.Pharm'];
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
  
  // Year Selector inside Dedicated View
  const [activeYear, setActiveYear] = useState<string>('2025-2026');

  // Modal State for Add / Edit Course
  const [showCourseModal, setShowCourseModal] = useState<boolean>(false);
  const [editingAssignmentId, setEditingAssignmentId] = useState<string | null>(null);

  // Form Fields for Modal
  const [formAcademicYear, setFormAcademicYear] = useState<string>('2025-2026');
  const [formProgramme, setFormProgramme] = useState<'B.Pharm' | 'Pharm.D' | 'M.Pharm'>('B.Pharm');
  const [formSemester, setFormSemester] = useState<number>(1);
  const [formCourseCode, setFormCourseCode] = useState<string>('');
  const [formCourseName, setFormCourseName] = useState<string>('');

  // Copy Previous Year Modal State
  const [showCopyModal, setShowCopyModal] = useState<boolean>(false);
  const [copySourceYear, setCopySourceYear] = useState<string>('2024-2025');
  const [copyTargetYear, setCopyTargetYear] = useState<string>('2026-2027');

  // Collapsible sections state in dedicated view (Key: `${programme}-Sem${semester}`)
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

  // Map of Faculty ID -> Set of Academic Years with at least 1 course assignment
  const facultyYearsMap = useMemo(() => {
    const map: Record<string, Set<string>> = {};
    assignments.forEach(a => {
      if (!map[a.facultyId]) {
        map[a.facultyId] = new Set();
      }
      if (a.academicYear) {
        map[a.facultyId].add(a.academicYear);
      }
    });
    return map;
  }, [assignments]);

  // Filtered Faculty List (Unique Faculty rows in main table)
  const filteredFaculty = useMemo(() => {
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

  // Assignments for Currently Selected Faculty in Active Academic Year
  const facultyActiveYearAssignments = useMemo(() => {
    if (!selectedFaculty) return [];
    return assignments.filter(a => a.facultyId === selectedFaculty.id && a.academicYear === activeYear);
  }, [selectedFaculty, activeYear, assignments]);

  // Grouped Assignments by Programme and then Semester
  const groupedAssignments = useMemo(() => {
    const grouped: Record<string, Record<number, TeachingAssignment[]>> = {};
    
    facultyActiveYearAssignments.forEach(item => {
      const prog = item.programme || 'B.Pharm';
      const sem = item.semester || 1;
      
      if (!grouped[prog]) grouped[prog] = {};
      if (!grouped[prog][sem]) grouped[prog][sem] = [];
      
      grouped[prog][sem].push(item);
    });

    return grouped;
  }, [facultyActiveYearAssignments]);

  // Open "Add Course" Modal
  const handleOpenAddCourse = () => {
    setEditingAssignmentId(null);
    setFormAcademicYear(activeYear);
    setFormProgramme('B.Pharm');
    setFormSemester(1);
    setFormCourseCode('');
    setFormCourseName('');
    setShowCourseModal(true);
  };

  // Open "Edit Course" Modal
  const handleOpenEditCourse = (item: TeachingAssignment) => {
    setEditingAssignmentId(item.id);
    setFormAcademicYear(item.academicYear);
    setFormProgramme(item.programme);
    setFormSemester(item.semester);
    setFormCourseCode(item.courseCode);
    setFormCourseName(item.courseName);
    setShowCourseModal(true);
  };

  // Auto-fill course title when entering or selecting code
  const handleCourseCodeChange = (code: string) => {
    setFormCourseCode(code);
    const found = masterCourses.find(c => 
      c.courseCode?.toUpperCase() === code.toUpperCase().trim() || 
      c.subjectCode?.toUpperCase() === code.toUpperCase().trim()
    );
    if (found) {
      setFormCourseName(found.courseName || found.name || '');
      if (found.programme) setFormProgramme(found.programme);
      if (found.semester) setFormSemester(Number(found.semester));
    }
  };

  // Handle Save Course Form
  const handleSaveCourseForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFaculty) return;
    if (!formCourseCode.trim()) {
      alert('Please enter a valid Course Code.');
      return;
    }

    const payload: TeachingAssignment = {
      id: editingAssignmentId || `ta-${Date.now()}`,
      academicYear: formAcademicYear,
      programme: formProgramme,
      semester: Number(formSemester),
      dept: selectedFaculty.dept,
      courseCode: formCourseCode.trim().toUpperCase(),
      courseName: formCourseName.trim() || 'Course Module',
      facultyId: selectedFaculty.id,
      facultyName: selectedFaculty.name,
      teachingType: { theory: true, practical: false, tutorial: false },
      role: 'Faculty',
      status: 'Active'
    };

    if (editingAssignmentId) {
      const updated = assignments.map(a => a.id === editingAssignmentId ? payload : a);
      handleSaveAssignments(updated);
      showToast('Course assignment updated!');
    } else {
      const updated = [payload, ...assignments];
      handleSaveAssignments(updated);
      showToast('New course assigned to faculty!');
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
                Academic Management
              </span>
              <span className="text-xs text-gray-400">• Faculty-Centric Course Allocation</span>
            </div>
            <h1 className="text-2xl font-display font-extrabold text-gray-900 mt-1 flex items-center gap-2">
              📚 Teaching Allocation
            </h1>
            <p className="text-xs text-gray-500 font-medium">
              {selectedFaculty 
                ? `Managing course assignments for ${selectedFaculty.name}` 
                : 'Select a faculty member to manage course assignments by academic year.'}
            </p>
          </div>
        </div>

        {!selectedFaculty && (
          <button
            onClick={() => setShowCopyModal(true)}
            className="px-4 py-2.5 bg-white hover:bg-pink-50/50 text-[#8B1E3F] font-bold text-xs rounded-full border border-pink-200/60 shadow-sm flex items-center gap-2 transition-all cursor-pointer hover:shadow-md"
          >
            <Copy className="w-4 h-4 text-[#8B1E3F]" />
            Copy Allocations
          </button>
        )}
      </div>

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

              <div className="text-xs font-bold text-gray-400 bg-white px-3 py-1.5 rounded-full border border-gray-200">
                Faculty Members: {filteredFaculty.length}
              </div>
            </div>
          </GlassCard>

          {/* Main Faculty Table - Each Faculty Displayed ONLY ONCE */}
          <GlassCard className="p-0 rounded-3xl border border-white/40 overflow-hidden shadow-sm bg-white/80">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-100/70 text-[10px] font-black text-gray-400 uppercase tracking-wider border-b border-gray-200">
                    <th className="py-3.5 px-5">Faculty Member</th>
                    <th className="py-3.5 px-5">Department</th>
                    <th className="py-3.5 px-5">Available Academic Years</th>
                    <th className="py-3.5 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs font-medium text-gray-700">
                  {filteredFaculty.map((fac) => {
                    const assignedYearsSet = facultyYearsMap[fac.id];
                    const yearsList = assignedYearsSet ? Array.from(assignedYearsSet).sort() : [];

                    return (
                      <tr key={fac.id} className="hover:bg-pink-50/30 transition-colors group">
                        {/* Faculty Name & Info */}
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#8B1E3F] to-rose-400 text-white font-black text-xs flex items-center justify-center shadow-xs shrink-0">
                              {fac.name.replace('Dr. ', '').replace('Prof. ', '').replace('Mrs. ', '').split(' ').map(p => p[0]).filter(Boolean).join('').substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-bold text-gray-900 group-hover:text-[#8B1E3F] transition-colors text-sm">
                                {fac.name}
                              </div>
                              <div className="text-[11px] text-[#8B1E3F] font-bold">
                                {fac.designation ? fac.designation : <span className="text-gray-400 font-normal italic">No designation</span>} <span className="text-gray-400 font-mono font-normal">({fac.empId})</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Department */}
                        <td className="py-4 px-5 text-gray-800 font-semibold max-w-[220px]">
                          {fac.dept.replace('Department of ', '')}
                        </td>

                        {/* Available Academic Years Badges */}
                        <td className="py-4 px-5">
                          {yearsList.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5">
                              {yearsList.map(yr => (
                                <span 
                                  key={yr} 
                                  className="text-[10px] font-black bg-pink-100/70 text-[#8B1E3F] px-2.5 py-0.5 rounded-full border border-pink-200/60"
                                >
                                  {yr}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-[11px] text-gray-400 font-medium italic">
                              No active course loads
                            </span>
                          )}
                        </td>

                        {/* Manage Teaching Action Button */}
                        <td className="py-4 px-5 text-right">
                          <button
                            onClick={() => {
                              setSelectedFaculty(fac);
                              // Auto pick latest year or first assigned year
                              if (yearsList.length > 0) {
                                setActiveYear(yearsList[yearsList.length - 1]);
                              } else {
                                setActiveYear('2025-2026');
                              }
                            }}
                            className="px-4 py-2 bg-gradient-to-r from-[#8B1E3F] to-[#CD4368] text-white font-extrabold text-xs rounded-xl shadow-xs hover:shadow-md transition-all flex items-center gap-1.5 ml-auto cursor-pointer active:scale-98"
                          >
                            <BookOpen className="w-3.5 h-3.5" />
                            Manage Teaching
                          </button>
                        </td>
                      </tr>
                    );
                  })}
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
                Add Course
              </button>
            </div>

            {/* Academic Year Selector Bar */}
            <div className="mt-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#8B1E3F]" />
                <span className="text-xs font-black uppercase tracking-wider text-gray-700">
                  Select Academic Year:
                </span>
              </div>

              <div className="flex items-center gap-2 bg-gray-100/80 p-1 rounded-2xl border border-gray-200/60">
                {ACADEMIC_YEARS.map((yr) => (
                  <button
                    key={yr}
                    onClick={() => setActiveYear(yr)}
                    className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                      activeYear === yr
                        ? 'bg-[#8B1E3F] text-white shadow-xs'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                    }`}
                  >
                    {yr}
                  </button>
                ))}
              </div>
            </div>
          </GlassCard>

          {/* Teaching Assignments List Grouped by Programme & Semester */}
          <div className="space-y-5">
            {Object.keys(groupedAssignments).length === 0 ? (
              <GlassCard className="p-12 text-center rounded-3xl bg-white/70">
                <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-gray-700">No courses assigned for {activeYear}</h3>
                <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                  Click the "Add Course" button above to assign course subjects to {selectedFaculty.name} for academic year {activeYear}.
                </p>
              </GlassCard>
            ) : (
              Object.keys(groupedAssignments).map((programme) => {
                const semesters = Object.keys(groupedAssignments[programme]).map(Number).sort((a,b) => a - b);

                return (
                  <div key={programme} className="space-y-4">
                    {/* Programme Banner */}
                    <div className="flex items-center gap-2.5 border-b border-pink-200/60 pb-2">
                      <GraduationCap className="w-5 h-5 text-[#8B1E3F]" />
                      <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider">
                        Programme: {programme}
                      </h3>
                      <span className="text-[10px] font-bold text-[#8B1E3F] bg-pink-100 px-2.5 py-0.5 rounded-full">
                        Academic Year {activeYear}
                      </span>
                    </div>

                    {/* Semester Group Cards */}
                    <div className="grid grid-cols-1 gap-4">
                      {semesters.map((sem) => {
                        const items = groupedAssignments[programme][sem];
                        const sectionKey = `${programme}-Sem${sem}`;
                        const isCollapsed = collapsedSections[sectionKey];

                        return (
                          <GlassCard key={sem} className="p-0 rounded-2xl border border-white/60 overflow-hidden bg-white/90 shadow-2xs">
                            {/* Semester Section Header */}
                            <div 
                              onClick={() => toggleSectionCollapse(sectionKey)}
                              className="p-4 bg-gray-50/90 border-b border-gray-100 flex items-center justify-between cursor-pointer hover:bg-pink-50/40 transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <span className="w-7 h-7 rounded-lg bg-pink-100 text-[#8B1E3F] font-black text-xs flex items-center justify-center border border-pink-200">
                                  S{sem}
                                </span>
                                <div>
                                  <h4 className="text-xs font-black text-gray-800 uppercase tracking-wide">
                                    Semester {sem}
                                  </h4>
                                  <span className="text-[10px] text-gray-400 font-semibold">
                                    {items.length} Assigned {items.length === 1 ? 'Course' : 'Courses'}
                                  </span>
                                </div>
                              </div>

                              <button className="text-gray-400 hover:text-gray-700">
                                {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                              </button>
                            </div>

                            {/* Course List inside Semester */}
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
                                      </div>
                                    </div>

                                    {/* Edit / Remove Actions */}
                                    <div className="flex items-center gap-2">
                                      <button
                                        onClick={() => handleOpenEditCourse(item)}
                                        className="p-1.5 text-gray-400 hover:text-[#8B1E3F] hover:bg-white rounded-lg border border-transparent hover:border-gray-200 transition-all cursor-pointer"
                                        title="Edit Course Code/Title"
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
      {/* MODAL 1: ADD / EDIT COURSE ASSIGNMENT DIALOG             */}
      {/* ========================================================= */}
      {showCourseModal && selectedFaculty && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-white/20 animate-scale-up space-y-5">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-pink-100 text-[#8B1E3F] flex items-center justify-center">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-gray-900">
                    {editingAssignmentId ? 'Edit Course Assignment' : 'Add Course Assignment'}
                  </h3>
                  <p className="text-[10px] text-gray-400 font-medium">
                    Faculty: {selectedFaculty.name}
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
              {/* Academic Year */}
              <div>
                <label className="text-[10px] font-extrabold uppercase text-gray-500 block mb-1">
                  Academic Year <span className="text-red-500">*</span>
                </label>
                <select
                  value={formAcademicYear}
                  onChange={(e) => setFormAcademicYear(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#8B1E3F]/30"
                  required
                >
                  {ACADEMIC_YEARS.map(yr => (
                    <option key={yr} value={yr}>{yr}</option>
                  ))}
                </select>
              </div>

              {/* Programme & Semester */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-extrabold uppercase text-gray-500 block mb-1">
                    Programme <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formProgramme}
                    onChange={(e) => setFormProgramme(e.target.value as any)}
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
                    Semester <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formSemester}
                    onChange={(e) => setFormSemester(Number(e.target.value))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#8B1E3F]/30"
                    required
                  >
                    {[1,2,3,4,5,6,7,8].map(s => (
                      <option key={s} value={s}>Semester {s}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Course Selection / Auto-complete */}
              <div>
                <label className="text-[10px] font-extrabold uppercase text-gray-500 block mb-1">
                  Course Code & Title <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={formCourseCode}
                    onChange={(e) => handleCourseCodeChange(e.target.value)}
                    placeholder="Course Code (e.g. BP101T)"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#8B1E3F]/30 uppercase"
                    required
                  />

                  <input
                    type="text"
                    value={formCourseName}
                    onChange={(e) => setFormCourseName(e.target.value)}
                    placeholder="Course Name (e.g. Human Anatomy and Physiology I)"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#8B1E3F]/30"
                    required
                  />
                </div>
              </div>

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
                  className="flex-1 py-2.5 bg-[#8B1E3F] text-white font-bold text-xs rounded-xl hover:bg-[#721733] shadow-sm cursor-pointer"
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
                  {ACADEMIC_YEARS.map(yr => (
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
                  {ACADEMIC_YEARS.map(yr => (
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
    </div>
  );
}
