import React, { useState, useEffect } from 'react';
import { 
  Sliders, Plus, Edit2, Trash2, ShieldCheck, Users, GraduationCap, 
  Database, RefreshCw, Upload, FileSpreadsheet, Download, Check, 
  AlertCircle, ArrowRight, ArrowLeft, Search, Layers, UserCheck, Play, Eye
} from 'lucide-react';
import GlassCard from '../GlassCard';
import { 
  getCurriculumDb, 
  saveCurriculumDb, 
  getAppSubjects,
  MasterCurriculumDb,
  CourseInformation
} from '../../data/curriculumDb';
import { Subject } from '../../types';

interface AdminDashboardProps {
  onGoToScreen: (screenId: string) => void;
  onGoToSubject: (subjectId: string) => void;
  currentRole: 'Student' | 'Faculty' | 'Admin';
  onChangeRole: (role: 'Student' | 'Faculty' | 'Admin') => void;
  subjects: Subject[];
  onRefreshSubjects: () => void;
  onImpersonateUser?: (role: 'Student' | 'Faculty' | 'Admin', name: string) => void;
}

export default function AdminDashboard({
  onGoToScreen,
  onGoToSubject,
  currentRole,
  onChangeRole,
  subjects,
  onRefreshSubjects,
  onImpersonateUser
}: AdminDashboardProps) {
  const [curriculumDb, setCurriculumDb] = useState<MasterCurriculumDb>(getCurriculumDb());
  const [filterProgramme, setFilterProgramme] = useState<string>('All');
  const [filterYear, setFilterYear] = useState<number | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals / Form state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCourseCode, setSelectedCourseCode] = useState<string | null>(null);

  // Form Fields
  const [formCode, setFormCode] = useState('');
  const [formName, setFormName] = useState('');
  const [formProgramme, setFormProgramme] = useState<'B.Pharm' | 'Pharm.D' | 'M.Pharm'>('B.Pharm');
  const [formYear, setFormYear] = useState(1);
  const [formSemester, setFormSemester] = useState(1);
  const [formCredits, setFormCredits] = useState(4);
  const [formHours, setFormHours] = useState(45);
  const [formType, setFormType] = useState<'Theory' | 'Practical'>('Theory');
  const [formFaculty, setFormFaculty] = useState('');
  const [formStatus, setFormStatus] = useState<'Active' | 'Draft' | 'Approved' | 'Archived'>('Approved');

  // Logs state
  const [logs, setLogs] = useState<{ id: string; action: string; target: string; time: string; type: 'success' | 'info' | 'warning' }[]>([
    { id: '1', action: 'Curriculum database synced with active semesters', target: 'B.Pharm Year 1', time: 'Just now', type: 'success' },
    { id: '2', action: 'Assigned Course Designer credentials', target: 'Dr. V. Chitra', time: '5 mins ago', type: 'info' },
    { id: '3', action: 'Master Template v1.2 parsed successfully', target: 'PCI_Syllabus_Master_Template.xlsx', time: '1 hour ago', type: 'success' },
    { id: '4', action: 'Course structure check completed', target: 'BP103T (Pharmaceutics I)', time: '2 hours ago', type: 'success' },
  ]);

  useEffect(() => {
    setCurriculumDb(getCurriculumDb());
  }, [subjects]);

  const addLog = (action: string, target: string, type: 'success' | 'info' | 'warning' = 'info') => {
    setLogs(prev => [
      { id: Date.now().toString(), action, target, time: 'Just now', type },
      ...prev.slice(0, 5)
    ]);
  };

  // Switch/Impersonate user handler
  const handleSwitchUser = (role: 'Student' | 'Faculty' | 'Admin', name: string) => {
    if (onImpersonateUser) {
      onImpersonateUser(role, name);
    } else {
      onChangeRole(role);
      const targetScreen = `${role.toLowerCase()}-dashboard`;
      onGoToScreen(targetScreen);
    }
  };

  // Open Edit Form
  const handleOpenEdit = (course: CourseInformation) => {
    setSelectedCourseCode(course.subjectCode);
    setFormCode(course.subjectCode);
    setFormName(course.courseName);
    setFormProgramme(course.programme as any);
    setFormYear(course.year);
    setFormSemester(course.semester);
    setFormCredits(course.credits);
    setFormHours(course.hours);
    setFormType(course.subjectType);
    setFormFaculty(course.facultyAssigned);
    setFormStatus(course.status);
    setShowEditModal(true);
  };

  // Open Create Form
  const handleOpenCreate = () => {
    setFormCode('');
    setFormName('');
    setFormProgramme('B.Pharm');
    setFormYear(1);
    setFormSemester(1);
    setFormCredits(4);
    setFormHours(45);
    setFormType('Theory');
    setFormFaculty('');
    setFormStatus('Approved');
    setShowCreateModal(true);
  };

  // Handle Create Subject Submit
  const handleCreateCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCode || !formName) return;

    const db = { ...curriculumDb };
    
    // Check duplication
    if (db.courseInformation.some(c => c.subjectCode.toUpperCase() === formCode.toUpperCase())) {
      alert(`Course with subject code ${formCode} already exists.`);
      return;
    }

    const code = formCode.toUpperCase().trim();
    const name = formName.trim();

    // 1. Add course information
    const newCourse: CourseInformation = {
      subjectCode: code,
      courseName: name,
      programme: formProgramme,
      regulation: 'PCI Regulation 2020',
      year: formYear,
      semester: formSemester,
      credits: formCredits,
      hours: formHours,
      subjectType: formType,
      status: formStatus,
      facultyAssigned: formFaculty || 'Unassigned',
      importVersion: '1.0',
      academicYear: '2025-2026'
    };

    db.courseInformation.push(newCourse);

    // 2. Setup boilerplate fields to prevent crashes on syllabus screens
    db.scope.push({
      subjectCode: code,
      scopeStatement: 'This course is configured under standard PCI regulations and academic guidelines.'
    });

    db.objectives.push(
      { subjectCode: code, objectiveText: 'Develop core foundational and practice competencies in the subject.', order: 1 },
      { subjectCode: code, objectiveText: 'Understand the standard application guidelines.', order: 2 }
    );

    db.courseOutcomes.push(
      { subjectCode: code, coCode: 'CO1', coText: 'Acknowledge fundamental regulatory concepts and principles.', attainmentTarget: 2.5 },
      { subjectCode: code, coCode: 'CO2', coText: 'Apply structured problem-solving mechanisms in exercises.', attainmentTarget: 2.5 }
    );

    db.units.push(
      { subjectCode: code, unitCode: 'Unit I', unitName: 'Foundational Concepts & Principles', hours: 9 },
      { subjectCode: code, unitCode: 'Unit II', unitName: 'Core Operations & Workflows', hours: 9 },
      { subjectCode: code, unitCode: 'Unit III', unitName: 'Standard Methodologies & Validation', hours: 9 },
      { subjectCode: code, unitCode: 'Unit IV', unitName: 'Advanced Applications & Protocols', hours: 9 },
      { subjectCode: code, unitCode: 'Unit V', unitName: 'Quality Control & Regulatory Compliance', hours: 9 }
    );

    db.curriculumTopics.push(
      { subjectCode: code, unitCode: 'Unit I', topicCode: 'T1.1', topicName: 'Introduction & Scope', hours: 3 },
      { subjectCode: code, unitCode: 'Unit I', topicCode: 'T1.2', topicName: 'Basic Classifications', hours: 3 },
      { subjectCode: code, unitCode: 'Unit I', topicCode: 'T1.3', topicName: 'Terminology & Definitions', hours: 3 }
    );

    db.referenceBooks.push({
      subjectCode: code,
      title: 'Official Pharmacopoeia of India',
      author: 'Ministry of Health',
      edition: 'Latest'
    });

    db.recommendedBooks.push({
      subjectCode: code,
      title: 'Standard Academic Reference Guide',
      author: 'Academic Press',
      edition: '1st Edition'
    });

    db.assessmentPattern.push({
      subjectCode: code,
      theoryInternal: 25,
      theoryExternal: 75,
      practicalInternal: 15,
      practicalExternal: 35,
      universityExam: 100
    });

    saveCurriculumDb(db);
    setCurriculumDb(db);
    onRefreshSubjects();
    setShowCreateModal(false);
    addLog('Created master course', `${code} - ${name}`, 'success');
  };

  // Handle Edit Subject Submit
  const handleEditCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseCode || !formName) return;

    const db = { ...curriculumDb };
    const idx = db.courseInformation.findIndex(c => c.subjectCode === selectedCourseCode);
    if (idx !== -1) {
      db.courseInformation[idx] = {
        ...db.courseInformation[idx],
        courseName: formName.trim(),
        programme: formProgramme,
        year: formYear,
        semester: formSemester,
        credits: formCredits,
        hours: formHours,
        subjectType: formType,
        facultyAssigned: formFaculty || 'Unassigned',
        status: formStatus
      };

      saveCurriculumDb(db);
      setCurriculumDb(db);
      onRefreshSubjects();
      setShowEditModal(false);
      addLog('Modified master course metadata', `${selectedCourseCode}`, 'info');
    }
  };

  // Delete Course Handler
  const handleDeleteCourse = (code: string, name: string) => {
    if (window.confirm(`Are you sure you want to permanently delete the master curriculum for ${code} - ${name}? This will remove all syllabus and learning resources.`)) {
      const db = { ...curriculumDb };
      
      db.courseInformation = db.courseInformation.filter(c => c.subjectCode !== code);
      db.scope = db.scope.filter(s => s.subjectCode !== code);
      db.objectives = db.objectives.filter(o => o.subjectCode !== code);
      db.courseOutcomes = db.courseOutcomes.filter(o => o.subjectCode !== code);
      db.units = db.units.filter(u => u.subjectCode !== code);
      db.curriculumTopics = db.curriculumTopics.filter(t => t.subjectCode !== code);
      db.recommendedBooks = db.recommendedBooks.filter(b => b.subjectCode !== code);
      db.referenceBooks = db.referenceBooks.filter(b => b.subjectCode !== code);
      db.assessmentPattern = db.assessmentPattern.filter(a => a.subjectCode !== code);

      saveCurriculumDb(db);
      setCurriculumDb(db);
      onRefreshSubjects();
      addLog('Deleted master course', `${code}`, 'warning');
    }
  };

  // Filtered lists grouping
  const filteredCourses = curriculumDb.courseInformation.filter(course => {
    const matchesSearch = course.subjectCode.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          course.courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          course.facultyAssigned.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesProg = filterProgramme === 'All' || course.programme === filterProgramme;
    const matchesYear = filterYear === 'All' || course.year === filterYear;
    return matchesSearch && matchesProg && matchesYear;
  });

  return (
    <div className="flex flex-col gap-6 w-full animate-fade-in">
      
      {/* 1. Header Hero Banner */}
      <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-[#111827] via-[#2D1B22] to-[#111827] p-8 text-white shadow-xl border border-white/5">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#8B1E3F]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-12 w-64 h-64 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#CD4368] bg-[#CD4368]/15 border border-[#CD4368]/20 px-3 py-1 rounded-full w-max">
              Executive LMS Administrator
            </span>
            <div className="flex flex-wrap items-baseline gap-x-3 mt-1">
              <h1 className="font-display font-extrabold text-2xl md:text-3xl tracking-tight bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
                Dr. J. Narayanan
              </h1>
              <span className="text-sm font-bold text-[#CD4368] font-mono">Employee ID: 1805447</span>
            </div>
            <p className="text-xs text-gray-300 max-w-2xl leading-relaxed mt-1 font-medium">
              Global operations dashboard. Monitor compliance indexes, mock student or faculty roles, configure unified master curriculums, and manage syllabus compliance templates.
            </p>
          </div>

          <button 
            onClick={handleOpenCreate}
            className="bg-gradient-to-r from-[#8B1E3F] to-[#CD4368] text-white text-xs font-bold px-4 py-2.5 rounded-full hover:shadow-lg hover:shadow-maroon-900/20 active:scale-95 transition-all flex items-center gap-2 border border-white/15 shrink-0"
          >
            <Plus className="w-4 h-4" />
            Create Master Course
          </button>
        </div>
      </div>

      {/* 2. Simulation Persona Switcher Section */}
      <GlassCard className="p-6">
        <div className="flex items-center gap-2 border-b border-gray-100 pb-3 mb-4">
          <Users className="w-5 h-5 text-[#8B1E3F]" />
          <div>
            <h2 className="font-display font-bold text-sm text-gray-900">User Switching & Impersonation Hub</h2>
            <p className="text-[11px] text-gray-500">Instantly experience the LMS system from any active role's perspective</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Student Persona card */}
          <div className="p-4 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 rounded-2xl border border-blue-100/60 flex flex-col justify-between hover:shadow-sm transition-all">
            <div>
              <div className="flex justify-between items-start">
                <span className="text-[9px] font-bold uppercase tracking-wider text-blue-600 bg-blue-100/50 px-2.5 py-0.5 rounded-full">
                  Student Persona
                </span>
                <span className="text-[10px] text-gray-400 font-bold">ID: SRM2026PH7810</span>
              </div>
              <h3 className="font-display font-bold text-sm text-gray-900 mt-2">J. Akash</h3>
              <p className="text-[11px] text-gray-500 mt-0.5">Year 1 • B.Pharm • GPA: 8.85 • Attendance: 92.4%</p>
            </div>
            <button 
              onClick={() => handleSwitchUser('Student', 'J. Akash')}
              className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2 rounded-xl active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 shadow-sm"
            >
              <UserCheck className="w-3.5 h-3.5" />
              Impersonate Student
            </button>
          </div>

          {/* Faculty Persona card */}
          <div className="p-4 bg-gradient-to-br from-purple-50/50 to-pink-50/50 rounded-2xl border border-purple-100/60 flex flex-col justify-between hover:shadow-sm transition-all">
            <div>
              <div className="flex justify-between items-start">
                <span className="text-[9px] font-bold uppercase tracking-wider text-purple-600 bg-purple-100/50 px-2.5 py-0.5 rounded-full">
                  Faculty HOD Persona
                </span>
                <span className="text-[10px] text-gray-400 font-bold">Professor of Pharmacology</span>
              </div>
              <h3 className="font-display font-bold text-sm text-gray-900 mt-2">Dr. V. Chitra</h3>
              <p className="text-[11px] text-gray-500 mt-0.5">Professor & Head • Assg. 4 Subjects • PG Coordinator</p>
            </div>
            <button 
              onClick={() => handleSwitchUser('Faculty', 'Dr. V. Chitra')}
              className="mt-4 w-full bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs py-2 rounded-xl active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 shadow-sm"
            >
              <UserCheck className="w-3.5 h-3.5" />
              Impersonate Faculty
            </button>
          </div>
        </div>
      </GlassCard>

      {/* 3. Combined Master Curriculum Registry View */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Core Year & Course wise Matrix List (3 Columns) */}
        <GlassCard className="lg:col-span-3 p-6 flex flex-col gap-4">
          
          {/* Header Controls */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-3">
            <div>
              <h2 className="font-display font-extrabold text-base text-gray-900">Master Curriculum Matrix</h2>
              <p className="text-xs text-gray-500">See all curriculum courses and year-wise altogether. Option to create or edit any.</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Filters:</span>
              
              {/* Program filter selector */}
              <select 
                value={filterProgramme} 
                onChange={(e) => setFilterProgramme(e.target.value)}
                className="bg-gray-100 border-none text-[11px] font-bold rounded-full px-3 py-1.5 text-gray-700 focus:ring-1 focus:ring-[#8B1E3F]"
              >
                <option value="All">All Programmes</option>
                <option value="B.Pharm">B.Pharm</option>
                <option value="Pharm.D">Pharm.D</option>
                <option value="M.Pharm">M.Pharm</option>
              </select>

              {/* Year filter selector */}
              <select 
                value={filterYear.toString()} 
                onChange={(e) => setFilterYear(e.target.value === 'All' ? 'All' : Number(e.target.value))}
                className="bg-gray-100 border-none text-[11px] font-bold rounded-full px-3 py-1.5 text-gray-700 focus:ring-1 focus:ring-[#8B1E3F]"
              >
                <option value="All">All Years</option>
                <option value="1">Year I</option>
                <option value="2">Year II</option>
                <option value="3">Year III</option>
                <option value="4">Year IV</option>
              </select>
            </div>
          </div>

          {/* Search box */}
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 px-3.5 py-2 rounded-2xl w-full">
            <Search className="w-4 h-4 text-gray-400 shrink-0" />
            <input 
              type="text" 
              placeholder="Search master subjects by code, name, or assigned faculty..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none w-full text-xs placeholder-gray-400 focus:outline-none focus:ring-0 text-gray-800"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="text-[10px] bg-gray-200 hover:bg-gray-300 text-gray-600 px-2 py-0.5 rounded-full shrink-0 font-bold"
              >
                Clear
              </button>
            )}
          </div>

          {/* Unified Matrix Table */}
          <div className="overflow-x-auto w-full border border-gray-100 rounded-2xl">
            <table className="min-w-full divide-y divide-gray-100 text-left text-xs">
              <thead className="bg-gray-50 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                <tr>
                  <th className="px-4 py-3">Code & Name</th>
                  <th className="px-4 py-3">Programme & Year</th>
                  <th className="px-4 py-3">Semester</th>
                  <th className="px-4 py-3">Credits/Hours</th>
                  <th className="px-4 py-3">Faculty Assigned</th>
                  <th className="px-4 py-3 text-center">Syllabus Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {filteredCourses.length > 0 ? (
                  filteredCourses.map((course) => (
                    <tr key={course.subjectCode} className="hover:bg-gray-50/50 transition-all">
                      {/* Code & Name */}
                      <td className="px-4 py-3.5">
                        <div className="flex flex-col">
                          <span className="font-mono font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded text-[10px] w-max mb-1">
                            {course.subjectCode}
                          </span>
                          <span className="font-bold text-gray-800 text-xs leading-snug">{course.courseName}</span>
                        </div>
                      </td>

                      {/* Programme & Year */}
                      <td className="px-4 py-3.5">
                        <div className="flex flex-col">
                          <span className="font-semibold text-gray-700">{course.programme}</span>
                          <span className="text-[10px] text-gray-400 font-bold">Year {course.year}</span>
                        </div>
                      </td>

                      {/* Semester */}
                      <td className="px-4 py-3.5">
                        <span className="font-semibold text-gray-700">Sem {course.semester}</span>
                      </td>

                      {/* Credits/Hours */}
                      <td className="px-4 py-3.5">
                        <div className="flex flex-col">
                          <span className="font-semibold text-gray-700">{course.credits} Credits</span>
                          <span className="text-[10px] text-gray-400 font-bold">{course.hours} Hours</span>
                        </div>
                      </td>

                      {/* Faculty */}
                      <td className="px-4 py-3.5">
                        <span className="font-bold text-[#8B1E3F] bg-rose-50/70 px-2.5 py-1 rounded-full text-[10px] inline-block">
                          {course.facultyAssigned || 'Unassigned'}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider
                          ${course.status === 'Approved' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 
                            course.status === 'Active' ? 'bg-blue-50 text-blue-600 border border-blue-100' : 
                            course.status === 'Draft' ? 'bg-amber-50 text-amber-600 border border-amber-100' : 
                            'bg-gray-100 text-gray-500'}
                        `}>
                          {course.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            title="Manage Course Chapters, Topics, Recommended Books & Import Options (Full Access)"
                            onClick={() => {
                              onGoToSubject(course.subjectCode);
                              onGoToScreen('faculty-subject-management'); // Redirects to fully editable Course Manager view
                            }}
                            className="p-1.5 rounded-lg bg-[#8B1E3F]/5 hover:bg-[#8B1E3F] text-[#8B1E3F] hover:text-white transition-all flex items-center gap-1 font-bold text-[10px] px-2.5 py-1"
                          >
                            <Sliders className="w-3 h-3" />
                            Manage
                          </button>
                          <button 
                            title="Quick Edit Metadata"
                            onClick={() => handleOpenEdit(course)}
                            className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition-all"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button 
                            title="Delete Curriculum"
                            onClick={() => handleDeleteCourse(course.subjectCode, course.courseName)}
                            className="p-1.5 rounded-lg bg-red-50 hover:bg-red-600 text-red-600 hover:text-white transition-all"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-gray-400 font-medium">
                      No matching master courses found. Use filters above or click "Create Master Course" to create one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </GlassCard>

        {/* Live System Status / Operations Logs (1 Column) */}
        <div className="flex flex-col gap-6">
          <GlassCard className="p-6">
            <h3 className="font-display font-bold text-sm text-gray-900 border-b border-gray-100 pb-3 mb-4 flex items-center justify-between">
              <span>Operational Integrity</span>
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            </h3>

            <div className="flex flex-col gap-4">
              {[
                { label: 'Total Curriculums', value: curriculumDb.courseInformation.length, icon: Database, color: 'text-rose-600 bg-rose-50' },
                { label: 'Assigned Lectures', value: subjects.length, icon: GraduationCap, color: 'text-indigo-600 bg-indigo-50' },
                { label: 'Compliance Index', value: '100%', icon: Sliders, color: 'text-emerald-600 bg-emerald-50' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${item.color} border border-white/30 shrink-0 shadow-inner`}>
                    <item.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-gray-400 block uppercase tracking-wider">{item.label}</span>
                    <span className="text-sm font-bold text-gray-800">{item.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="p-6 flex-1 flex flex-col justify-between">
            <div>
              <h3 className="font-display font-bold text-sm text-gray-900 border-b border-gray-100 pb-3 mb-4 flex items-center justify-between">
                <span>Console Audit Log</span>
                <RefreshCw className="w-3.5 h-3.5 text-gray-400 animate-spin-slow" />
              </h3>

              <div className="flex flex-col gap-3">
                {logs.map((log) => (
                  <div key={log.id} className="p-2.5 rounded-xl bg-gray-50/60 border border-white/40 flex flex-col gap-1">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        log.type === 'success' ? 'bg-emerald-500' : log.type === 'warning' ? 'bg-red-500' : 'bg-blue-500'
                      }`} />
                      <span className="text-[10px] font-bold text-gray-800 leading-tight">{log.action}</span>
                    </div>
                    <p className="text-[9px] text-gray-400 font-bold ml-3">{log.target} • {log.time}</p>
                  </div>
                ))}
              </div>
            </div>

            <button 
              onClick={() => {
                onGoToScreen('faculty-courses'); // Access overall Course compliance and templates sheet import/export panel
              }}
              className="w-full text-center text-[10px] font-black text-[#8B1E3F] hover:underline uppercase tracking-wider border-t border-gray-100 pt-3 mt-4 flex items-center justify-center gap-1 group"
            >
              <span>Manage Compliance Templates</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </GlassCard>
        </div>
      </div>

      {/* 4. MODALS (Create & Edit Course) */}
      
      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-950/40 backdrop-blur-sm flex items-center justify-center z-[1000] p-4">
          <div className="bg-white/95 backdrop-blur-md rounded-[24px] shadow-2xl border border-gray-100 w-full max-w-lg overflow-hidden animate-fade-in">
            <div className="bg-[#8B1E3F] text-white p-5">
              <h3 className="font-display font-extrabold text-base">Create Master Course Curriculum</h3>
              <p className="text-[11px] text-pink-100 mt-0.5">Define metadata. System will automatically generate boilerplate compliance units & templates.</p>
            </div>

            <form onSubmit={handleCreateCourse} className="p-6 flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Subject Code *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. BP103T"
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                    className="border border-gray-200 text-xs rounded-xl px-3 py-2 focus:ring-1 focus:ring-[#8B1E3F] focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Programme *</label>
                  <select 
                    value={formProgramme}
                    onChange={(e) => setFormProgramme(e.target.value as any)}
                    className="border border-gray-200 text-xs rounded-xl px-3 py-2 focus:ring-1 focus:ring-[#8B1E3F] focus:outline-none bg-white"
                  >
                    <option value="B.Pharm">B.Pharm (Bachelor of Pharmacy)</option>
                    <option value="Pharm.D">Pharm.D (Doctor of Pharmacy)</option>
                    <option value="M.Pharm">M.Pharm (Master of Pharmacy)</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Course Title *</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Pharmaceutics I"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="border border-gray-200 text-xs rounded-xl px-3 py-2 focus:ring-1 focus:ring-[#8B1E3F] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Academic Year</label>
                  <select 
                    value={formYear}
                    onChange={(e) => setFormYear(Number(e.target.value))}
                    className="border border-gray-200 text-xs rounded-xl px-3 py-2 focus:ring-1 focus:ring-[#8B1E3F] focus:outline-none bg-white"
                  >
                    <option value={1}>1st Year</option>
                    <option value={2}>2nd Year</option>
                    <option value={3}>3rd Year</option>
                    <option value={4}>4th Year</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Semester</label>
                  <select 
                    value={formSemester}
                    onChange={(e) => setFormSemester(Number(e.target.value))}
                    className="border border-gray-200 text-xs rounded-xl px-3 py-2 focus:ring-1 focus:ring-[#8B1E3F] focus:outline-none bg-white"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                      <option key={s} value={s}>Semester {s}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Subject Type</label>
                  <select 
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as any)}
                    className="border border-gray-200 text-xs rounded-xl px-3 py-2 focus:ring-1 focus:ring-[#8B1E3F] focus:outline-none bg-white"
                  >
                    <option value="Theory">Theory</option>
                    <option value="Practical">Practical</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Academic Credits</label>
                  <input 
                    type="number" 
                    value={formCredits}
                    onChange={(e) => setFormCredits(Number(e.target.value))}
                    className="border border-gray-200 text-xs rounded-xl px-3 py-2 focus:ring-1 focus:ring-[#8B1E3F] focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Teaching Hours</label>
                  <input 
                    type="number" 
                    value={formHours}
                    onChange={(e) => setFormHours(Number(e.target.value))}
                    className="border border-gray-200 text-xs rounded-xl px-3 py-2 focus:ring-1 focus:ring-[#8B1E3F] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Faculty Assigned</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Dr. V. Chitra"
                    value={formFaculty}
                    onChange={(e) => setFormFaculty(e.target.value)}
                    className="border border-gray-200 text-xs rounded-xl px-3 py-2 focus:ring-1 focus:ring-[#8B1E3F] focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Syllabus Status</label>
                  <select 
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="border border-gray-200 text-xs rounded-xl px-3 py-2 focus:ring-1 focus:ring-[#8B1E3F] focus:outline-none bg-white"
                  >
                    <option value="Draft">Draft</option>
                    <option value="Active">Active</option>
                    <option value="Approved">Approved</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-4 mt-2">
                <button 
                  type="button" 
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-xl"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 text-xs font-bold bg-[#8B1E3F] hover:bg-[#6c172f] text-white rounded-xl shadow-sm"
                >
                  Save Master Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-gray-950/40 backdrop-blur-sm flex items-center justify-center z-[1000] p-4">
          <div className="bg-white/95 backdrop-blur-md rounded-[24px] shadow-2xl border border-gray-100 w-full max-w-lg overflow-hidden animate-fade-in">
            <div className="bg-[#8B1E3F] text-white p-5">
              <h3 className="font-display font-extrabold text-base">Edit Master Course Metadata</h3>
              <p className="text-[11px] text-pink-100 mt-0.5">Modifying metadata for subject code: <strong className="font-mono">{selectedCourseCode}</strong></p>
            </div>

            <form onSubmit={handleEditCourse} className="p-6 flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Course Title *</label>
                <input 
                  type="text" 
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="border border-gray-200 text-xs rounded-xl px-3 py-2 focus:ring-1 focus:ring-[#8B1E3F] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Programme</label>
                  <select 
                    value={formProgramme}
                    onChange={(e) => setFormProgramme(e.target.value as any)}
                    className="border border-gray-200 text-xs rounded-xl px-3 py-2 focus:ring-1 focus:ring-[#8B1E3F] focus:outline-none bg-white"
                  >
                    <option value="B.Pharm">B.Pharm (Bachelor of Pharmacy)</option>
                    <option value="Pharm.D">Pharm.D (Doctor of Pharmacy)</option>
                    <option value="M.Pharm">M.Pharm (Master of Pharmacy)</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Subject Type</label>
                  <select 
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as any)}
                    className="border border-gray-200 text-xs rounded-xl px-3 py-2 focus:ring-1 focus:ring-[#8B1E3F] focus:outline-none bg-white"
                  >
                    <option value="Theory">Theory</option>
                    <option value="Practical">Practical</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Year</label>
                  <select 
                    value={formYear}
                    onChange={(e) => setFormYear(Number(e.target.value))}
                    className="border border-gray-200 text-xs rounded-xl px-3 py-2 focus:ring-1 focus:ring-[#8B1E3F] focus:outline-none bg-white"
                  >
                    <option value={1}>1st Year</option>
                    <option value={2}>2nd Year</option>
                    <option value={3}>3rd Year</option>
                    <option value={4}>4th Year</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Semester</label>
                  <select 
                    value={formSemester}
                    onChange={(e) => setFormSemester(Number(e.target.value))}
                    className="border border-gray-200 text-xs rounded-xl px-3 py-2 focus:ring-1 focus:ring-[#8B1E3F] focus:outline-none bg-white"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                      <option key={s} value={s}>Semester {s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Academic Credits</label>
                  <input 
                    type="number" 
                    value={formCredits}
                    onChange={(e) => setFormCredits(Number(e.target.value))}
                    className="border border-gray-200 text-xs rounded-xl px-3 py-2 focus:ring-1 focus:ring-[#8B1E3F] focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Teaching Hours</label>
                  <input 
                    type="number" 
                    value={formHours}
                    onChange={(e) => setFormHours(Number(e.target.value))}
                    className="border border-gray-200 text-xs rounded-xl px-3 py-2 focus:ring-1 focus:ring-[#8B1E3F] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Faculty Assigned</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Dr. V. Chitra"
                    value={formFaculty}
                    onChange={(e) => setFormFaculty(e.target.value)}
                    className="border border-gray-200 text-xs rounded-xl px-3 py-2 focus:ring-1 focus:ring-[#8B1E3F] focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Syllabus Status</label>
                  <select 
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="border border-gray-200 text-xs rounded-xl px-3 py-2 focus:ring-1 focus:ring-[#8B1E3F] focus:outline-none bg-white"
                  >
                    <option value="Draft">Draft</option>
                    <option value="Active">Active</option>
                    <option value="Approved">Approved</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-4 mt-2">
                <button 
                  type="button" 
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-xl"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 text-xs font-bold bg-[#8B1E3F] hover:bg-[#6c172f] text-white rounded-xl shadow-sm"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
