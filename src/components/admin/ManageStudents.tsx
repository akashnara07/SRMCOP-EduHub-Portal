import React, { useState, useEffect, useMemo } from 'react';
import { 
  ArrowLeft, User, Search, Plus, Mail, FileSpreadsheet, Upload, 
  Download, Check, Trash2, Edit2, AlertCircle, Filter, CheckCircle2, 
  Phone, GraduationCap, Calendar, BookOpen, Clock, ShieldCheck, 
  Award, ChevronRight, X, Sparkles, UserCheck, Layers, History,
  FileText, CheckSquare, FileCheck, ExternalLink, HardDrive, Key,
  Lock, Shield, ToggleLeft, ToggleRight, Send, HelpCircle, BarChart3,
  FileBadge, BookMarked, ChevronDown, CheckCircle, RefreshCw
} from 'lucide-react';
import GlassCard from '../GlassCard';
import * as XLSX from 'xlsx';
import { 
  StudentMaster, 
  StudentAcademicRecord, 
  RegisteredCourse,
  StudentStatus,
  ProgrammeType,
  getStudentsMaster, 
  saveStudentsMaster, 
  getAcademicRecords, 
  saveAcademicRecords,
  getStudentAcademicHistory,
  updateStudentOfficialEmail,
  promoteStudentInMaster
} from '../../data/studentRegistry';
import { 
  AcademicEnrollment,
  EnrollmentStatus,
  getAcademicEnrollments,
  saveAcademicEnrollments,
  getCurrentEnrollmentForStudent,
  getStudentEnrollmentHistory
} from '../../data/academicEnrollment';
import { getCurriculumDb } from '../../data/curriculumDb';
import { getFacultyMaster } from '../../data/facultyRegistry';

interface ManageStudentsProps {
  onBack: () => void;
}

const ACADEMIC_YEARS = ['2023-2024', '2024-2025', '2025-2026', '2026-2027'];
const PROGRAMMES: ProgrammeType[] = ['B.Pharm', 'Pharm.D', 'M.Pharm'];
const BATCHES = ['2021-2025', '2022-2026', '2023-2027', '2024-2028', '2025-2029'];
const STATUS_OPTIONS: StudentStatus[] = [
  'Active', 
  'Login Enabled', 
  'Login Disabled', 
  'Email Pending', 
  'Graduated', 
  'Alumni', 
  'Suspended'
];

// Year Normalizer
const normalizeYear = (year: string | undefined, programme: string): string => {
  if (!year) return programme === 'Pharm.D' ? 'Year I' : 'First Year';
  const y = year.trim();
  if (programme === 'B.Pharm' || programme === 'M.Pharm') {
    if (y === 'Year I' || y.toLowerCase().includes('first') || y.includes('1')) return 'First Year';
    if (y === 'Year II' || y.toLowerCase().includes('second') || y.includes('2')) return 'Second Year';
    if (y === 'Year III' || y.toLowerCase().includes('third') || y.includes('3')) return 'Third Year';
    if (y === 'Year IV' || y.toLowerCase().includes('fourth') || y.includes('4')) return 'Fourth Year';
    return y;
  } else {
    if (y.toLowerCase().includes('first') || y.includes('1')) return 'Year I';
    if (y.toLowerCase().includes('second') || y.includes('2')) return 'Year II';
    if (y.toLowerCase().includes('third') || y.includes('3')) return 'Year III';
    if (y.toLowerCase().includes('fourth') || y.includes('4')) return 'Year IV';
    if (y.toLowerCase().includes('fifth') || y.includes('5')) return 'Year V';
    if (y.toLowerCase().includes('sixth') || y.includes('6')) return 'Year VI';
    return y;
  }
};

// Semester Normalizer
const normalizeSemester = (semester: string | undefined, programme: string, year: string): string => {
  if (programme === 'Pharm.D') return 'Annual Pattern';
  if (!semester || semester === 'N/A') {
    if (year === 'First Year') return 'Semester I';
    if (year === 'Second Year') return 'Semester III';
    if (year === 'Third Year') return 'Semester V';
    if (year === 'Fourth Year') return 'Semester VII';
    return 'Semester I';
  }
  return semester;
};

// Reusable Student Table with S.No.
const StudentTable = ({
  studentList,
  startIndex = 0,
  onSelectStudent
}: {
  studentList: StudentMaster[];
  startIndex?: number;
  onSelectStudent: (student: StudentMaster) => void;
}) => {
  if (studentList.length === 0) {
    return (
      <div className="py-6 text-center bg-gray-50/50 rounded-2xl border border-dashed border-gray-200 my-2">
        <UserCheck className="w-8 h-8 text-gray-300 mx-auto mb-1.5" />
        <p className="text-xs font-bold text-gray-500">No students matching criteria in this section</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-gray-200/80 shadow-xs bg-white">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-100/80 text-[10px] font-black text-gray-500 uppercase tracking-wider border-b border-gray-200">
            <th className="py-3 px-3 text-center w-12">S.No.</th>
            <th className="py-3 px-4">Student Name</th>
            <th className="py-3 px-4">Registration No.</th>
            <th className="py-3 px-3">Programme</th>
            <th className="py-3 px-3">Year</th>
            <th className="py-3 px-3">Semester</th>
            <th className="py-3 px-3">Batch</th>
            <th className="py-3 px-3">Academic Year</th>
            <th className="py-3 px-3">Status</th>
            <th className="py-3 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 text-xs font-medium text-gray-700">
          {studentList.map((student, idx) => {
            const sNo = startIndex + idx + 1;
            const normY = normalizeYear(student.currentYear, student.programme);
            const normSem = normalizeSemester(student.semester, student.programme, normY);

            return (
              <tr key={student.id} className="hover:bg-pink-50/30 transition-colors group">
                {/* S.No. */}
                <td className="py-3 px-3 text-center font-bold text-gray-400 text-xs">
                  {sNo}
                </td>

                {/* Student Name */}
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#8B1E3F] to-rose-400 text-white font-black text-[11px] flex items-center justify-center shadow-xs shrink-0">
                      {student.name.split(' ').map(p => p[0]).filter(Boolean).join('').substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold text-gray-900 group-hover:text-[#8B1E3F] transition-colors text-xs">
                        {student.name}
                      </div>
                      <div className="text-[10px] text-gray-400 font-medium">
                        {student.phone || 'No phone'}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Registration Number */}
                <td className="py-3 px-4">
                  <span className="font-mono text-xs font-black bg-gray-100 text-gray-900 px-2 py-0.5 rounded-md border border-gray-200 inline-block">
                    {student.regNo}
                  </span>
                </td>

                {/* Programme */}
                <td className="py-3 px-3">
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                    student.programme === 'B.Pharm' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                    student.programme === 'Pharm.D' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                    'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    {student.programme}
                  </span>
                </td>

                {/* Current Year */}
                <td className="py-3 px-3 font-bold text-gray-800">
                  {normY}
                </td>

                {/* Current Semester */}
                <td className="py-3 px-3 font-bold text-gray-800">
                  {normSem}
                </td>

                {/* Batch */}
                <td className="py-3 px-3 font-medium text-gray-600">
                  {student.batch || '2024-2028'}
                </td>

                {/* Academic Year */}
                <td className="py-3 px-3 font-bold text-[#8B1E3F]">
                  {student.academicYear || '2026-2027'}
                </td>

                {/* Status Badge */}
                <td className="py-3 px-3">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${
                    student.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                    student.status === 'Login Enabled' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                    student.status === 'Login Disabled' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                    student.status === 'Email Pending' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                    student.status === 'Graduated' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                    'bg-slate-100 text-slate-700 border-slate-200'
                  }`}>
                    {student.status}
                  </span>
                </td>

                {/* Actions */}
                <td className="py-3 px-4 text-right">
                  <button
                    onClick={() => onSelectStudent(student)}
                    className="px-2.5 py-1 bg-gradient-to-r from-[#8B1E3F] to-[#CD4368] text-white font-extrabold text-[10px] rounded-lg shadow-xs hover:shadow-md transition-all flex items-center gap-1 cursor-pointer active:scale-98 ml-auto"
                  >
                    <GraduationCap className="w-3 h-3" />
                    Manage
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default function ManageStudents({ onBack }: ManageStudentsProps) {
  // Master Student Registry state
  const [students, setStudents] = useState<StudentMaster[]>(() => getStudentsMaster());
  const [academicRecords, setAcademicRecords] = useState<StudentAcademicRecord[]>(() => getAcademicRecords());
  const [enrollments, setEnrollments] = useState<AcademicEnrollment[]>(() => getAcademicEnrollments());
  
  // Curriculum Db for course auto-complete
  const [masterCourses, setMasterCourses] = useState<any[]>([]);
  const [facultyMembers] = useState(() => getFacultyMaster());

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
  const [search, setSearch] = useState('');
  const [filterProgramme, setFilterProgramme] = useState<string>('All');
  const [filterYear, setFilterYear] = useState<string>('All');
  const [filterSemester, setFilterSemester] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [filterBatch, setFilterBatch] = useState<string>('All');

  // View Mode: 'grouped' (Accordion hierarchy) vs 'table' (Flat list with S.No.)
  const [viewMode, setViewMode] = useState<'grouped' | 'table'>('grouped');

  // Collapsible Accordion State
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    'prog-B.Pharm': true,
    'prog-Pharm.D': true,
    'prog-M.Pharm': true
  });

  const toggleNode = (nodeId: string) => {
    setExpandedNodes(prev => ({ ...prev, [nodeId]: !prev[nodeId] }));
  };

  const expandAllNodes = () => {
    const allKeys: Record<string, boolean> = {};
    PROGRAMMES.forEach(p => {
      allKeys[`prog-${p}`] = true;
      if (p === 'B.Pharm') {
        ['First Year', 'Second Year', 'Third Year', 'Fourth Year'].forEach(y => {
          allKeys[`year-${p}-${y}`] = true;
          if (y === 'First Year') { allKeys[`sem-${p}-${y}-Semester I`] = true; allKeys[`sem-${p}-${y}-Semester II`] = true; }
          if (y === 'Second Year') { allKeys[`sem-${p}-${y}-Semester III`] = true; allKeys[`sem-${p}-${y}-Semester IV`] = true; }
          if (y === 'Third Year') { allKeys[`sem-${p}-${y}-Semester V`] = true; allKeys[`sem-${p}-${y}-Semester VI`] = true; }
          if (y === 'Fourth Year') { allKeys[`sem-${p}-${y}-Semester VII`] = true; allKeys[`sem-${p}-${y}-Semester VIII`] = true; }
        });
      } else if (p === 'Pharm.D') {
        ['Year I', 'Year II', 'Year III', 'Year IV', 'Year V', 'Year VI'].forEach(y => {
          allKeys[`year-${p}-${y}`] = true;
          allKeys[`sem-${p}-${y}-Annual Pattern`] = true;
        });
      } else if (p === 'M.Pharm') {
        ['First Year', 'Second Year'].forEach(y => {
          allKeys[`year-${p}-${y}`] = true;
          if (y === 'First Year') { allKeys[`sem-${p}-${y}-Semester I`] = true; allKeys[`sem-${p}-${y}-Semester II`] = true; }
          if (y === 'Second Year') { allKeys[`sem-${p}-${y}-Semester III`] = true; allKeys[`sem-${p}-${y}-Semester IV`] = true; }
        });
      }
    });
    setExpandedNodes(allKeys);
  };

  const collapseAllNodes = () => {
    setExpandedNodes({});
  };

  // Year Normalizer
  const normalizeYear = (year: string | undefined, programme: string): string => {
    if (!year) return programme === 'Pharm.D' ? 'Year I' : 'First Year';
    const y = year.trim();
    if (programme === 'B.Pharm' || programme === 'M.Pharm') {
      if (y === 'Year I' || y.toLowerCase().includes('first') || y.includes('1')) return 'First Year';
      if (y === 'Year II' || y.toLowerCase().includes('second') || y.includes('2')) return 'Second Year';
      if (y === 'Year III' || y.toLowerCase().includes('third') || y.includes('3')) return 'Third Year';
      if (y === 'Year IV' || y.toLowerCase().includes('fourth') || y.includes('4')) return 'Fourth Year';
      return y;
    } else {
      if (y.toLowerCase().includes('first') || y.includes('1')) return 'Year I';
      if (y.toLowerCase().includes('second') || y.includes('2')) return 'Year II';
      if (y.toLowerCase().includes('third') || y.includes('3')) return 'Year III';
      if (y.toLowerCase().includes('fourth') || y.includes('4')) return 'Year IV';
      if (y.toLowerCase().includes('fifth') || y.includes('5')) return 'Year V';
      if (y.toLowerCase().includes('sixth') || y.includes('6')) return 'Year VI';
      return y;
    }
  };

  // Semester Normalizer
  const normalizeSemester = (semester: string | undefined, programme: string, year: string): string => {
    if (programme === 'Pharm.D') return 'Annual Pattern';
    if (!semester || semester === 'N/A') {
      if (year === 'First Year') return 'Semester I';
      if (year === 'Second Year') return 'Semester III';
      if (year === 'Third Year') return 'Semester V';
      if (year === 'Fourth Year') return 'Semester VII';
      return 'Semester I';
    }
    return semester;
  };

  // Cascading Selection Options based on active filters
  const availableYears = useMemo(() => {
    if (filterProgramme === 'B.Pharm') {
      return ['First Year', 'Second Year', 'Third Year', 'Fourth Year'];
    }
    if (filterProgramme === 'Pharm.D') {
      return ['Year I', 'Year II', 'Year III', 'Year IV', 'Year V', 'Year VI'];
    }
    if (filterProgramme === 'M.Pharm') {
      return ['First Year', 'Second Year'];
    }
    return [];
  }, [filterProgramme]);

  const availableSemesters = useMemo(() => {
    if (filterProgramme === 'Pharm.D') return [];
    if (filterProgramme === 'B.Pharm') {
      if (filterYear === 'First Year') return ['Semester I', 'Semester II'];
      if (filterYear === 'Second Year') return ['Semester III', 'Semester IV'];
      if (filterYear === 'Third Year') return ['Semester V', 'Semester VI'];
      if (filterYear === 'Fourth Year') return ['Semester VII', 'Semester VIII'];
      return ['Semester I', 'Semester II', 'Semester III', 'Semester IV', 'Semester V', 'Semester VI', 'Semester VII', 'Semester VIII'];
    }
    if (filterProgramme === 'M.Pharm') {
      if (filterYear === 'First Year') return ['Semester I', 'Semester II'];
      if (filterYear === 'Second Year') return ['Semester III', 'Semester IV'];
      return ['Semester I', 'Semester II', 'Semester III', 'Semester IV'];
    }
    if (filterProgramme === 'All') {
      return ['Semester I', 'Semester II', 'Semester III', 'Semester IV', 'Semester V', 'Semester VI', 'Semester VII', 'Semester VIII'];
    }
    return [];
  }, [filterProgramme, filterYear]);

  // Handlers for cascading selection dropdown changes
  const handleProgrammeChange = (prog: string) => {
    setFilterProgramme(prog);
    setFilterYear('All');
    setFilterSemester('All');
  };

  const handleYearChange = (year: string) => {
    setFilterYear(year);
    setFilterSemester('All');
  };

  // Currently Selected Student for Dedicated View
  const [selectedStudent, setSelectedStudent] = useState<StudentMaster | null>(null);

  // Profile Tab state: 'profile' | 'academic' | 'auth' | 'marks' | 'learning' | 'portfolio'
  const [selectedTab, setSelectedTab] = useState<
    'profile' | 'academic' | 'auth' | 'marks' | 'learning' | 'portfolio'
  >('profile');

  // Active Academic Year in Dedicated View
  const [activeAcademicYear, setActiveAcademicYear] = useState<string>('2026-2027');

  // Dropdown & Modal States
  const [showBulkDropdown, setShowBulkDropdown] = useState(false);
  const [showImportStudentsModal, setShowImportStudentsModal] = useState(false);
  const [showImportEmailsModal, setShowImportEmailsModal] = useState(false);
  const [showBulkPromotionModal, setShowBulkPromotionModal] = useState(false);
  const [showStudentModal, setShowStudentModal] = useState(false);

  // Add / Edit Student Form States
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formRegNo, setFormRegNo] = useState('');
  const [formProgramme, setFormProgramme] = useState<ProgrammeType>('B.Pharm');
  const [formRegulation, setFormRegulation] = useState('PCI-2020');
  const [formAdmissionYear, setFormAdmissionYear] = useState<number>(2024);
  const [formExpectedGrad, setFormExpectedGrad] = useState<number>(2028);
  const [formBatch, setFormBatch] = useState('2024-2028');
  const [formAcademicYear, setFormAcademicYear] = useState('2026-2027');
  const [formCurrentYear, setFormCurrentYear] = useState('Year I');
  const [formSemester, setFormSemester] = useState('Semester I');
  const [formSection, setFormSection] = useState('Section A');
  const [formOfficialEmail, setFormOfficialEmail] = useState('');
  const [formPersonalEmail, setFormPersonalEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');

interface StudentImportRow {
  regNo: string;
  name: string;
  programme: ProgrammeType;
  regulation: string;
  admissionYear: number;
  expectedGraduation: number;
  batch: string;
  academicYear: string;
  currentYear: string;
  semester: string;
  section: string;
}

  // Bulk Import States
  const [bulkRows, setBulkRows] = useState<StudentImportRow[]>([]);
  const [validationErrors, setValidationErrors] = useState<{ [key: number]: string[] }>({});

  // Email Import States
  const [emailImportRows, setEmailImportRows] = useState<{ regNo: string; officialEmail: string }[]>([]);

  // Bulk Promotion States
  const [promotionTargetProgramme, setPromotionTargetProgramme] = useState<ProgrammeType>('B.Pharm');
  const [promotionFromAcademicYear, setPromotionFromAcademicYear] = useState('2025-2026');
  const [promotionToAcademicYear, setPromotionToAcademicYear] = useState('2026-2027');
  const [promotionFromYear, setPromotionFromYear] = useState('Year III');
  const [promotionToYear, setPromotionToYear] = useState('Year IV');
  const [promotionFromSemester, setPromotionFromSemester] = useState('Semester V');
  const [promotionToSemester, setPromotionToSemester] = useState('Semester VII');

  // Notification Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Sync state helpers
  const handleSaveStudents = (newList: StudentMaster[]) => {
    setStudents(newList);
    saveStudentsMaster(newList);
  };

  const handleSaveAcademicRecords = (newRecords: StudentAcademicRecord[]) => {
    setAcademicRecords(newRecords);
    saveAcademicRecords(newRecords);
  };

  const handleSaveEnrollments = (newList: AcademicEnrollment[]) => {
    setEnrollments(newList);
    saveAcademicEnrollments(newList);
  };

  // Filtered Students for Main Table (Unique Student entries only)
  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const q = search.toLowerCase().trim();
      const matchesSearch = !q || (
        s.name.toLowerCase().includes(q) ||
        s.regNo.toLowerCase().includes(q) ||
        (s.officialEmail && s.officialEmail.toLowerCase().includes(q)) ||
        (s.email && s.email.toLowerCase().includes(q)) ||
        (s.phone && s.phone.includes(q))
      );

      const matchesProg = filterProgramme === 'All' || s.programme === filterProgramme;
      const normalizedY = normalizeYear(s.currentYear, s.programme);
      const matchesYear = filterYear === 'All' || normalizedY === filterYear;
      const normalizedSem = normalizeSemester(s.semester, s.programme, normalizedY);
      const matchesSem = filterSemester === 'All' || normalizedSem === filterSemester;

      const matchesStatus = filterStatus === 'All' || s.status === filterStatus;
      const matchesBatch = filterBatch === 'All' || s.batch === filterBatch;

      return matchesSearch && matchesProg && matchesYear && matchesSem && matchesStatus && matchesBatch;
    });
  }, [students, search, filterProgramme, filterYear, filterSemester, filterStatus, filterBatch]);

  // Dynamic Live Summary Metrics Calculation
  const summaryMetrics = useMemo(() => {
    const total = filteredStudents.length;

    if (filterProgramme === 'B.Pharm') {
      const yr1 = filteredStudents.filter(s => normalizeYear(s.currentYear, 'B.Pharm') === 'First Year').length;
      const yr2 = filteredStudents.filter(s => normalizeYear(s.currentYear, 'B.Pharm') === 'Second Year').length;
      const yr3 = filteredStudents.filter(s => normalizeYear(s.currentYear, 'B.Pharm') === 'Third Year').length;
      const yr4 = filteredStudents.filter(s => normalizeYear(s.currentYear, 'B.Pharm') === 'Fourth Year').length;
      return {
        title: 'B.Pharm Student Breakdown',
        totalLabel: 'Total B.Pharm',
        total,
        items: [
          { label: 'First Year', count: yr1, badgeColor: 'bg-blue-50 text-blue-700 border-blue-200' },
          { label: 'Second Year', count: yr2, badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
          { label: 'Third Year', count: yr3, badgeColor: 'bg-purple-50 text-purple-700 border-purple-200' },
          { label: 'Fourth Year', count: yr4, badgeColor: 'bg-pink-50 text-pink-700 border-pink-200' },
        ]
      };
    } else if (filterProgramme === 'Pharm.D') {
      const yr1 = filteredStudents.filter(s => normalizeYear(s.currentYear, 'Pharm.D') === 'Year I').length;
      const yr2 = filteredStudents.filter(s => normalizeYear(s.currentYear, 'Pharm.D') === 'Year II').length;
      const yr3 = filteredStudents.filter(s => normalizeYear(s.currentYear, 'Pharm.D') === 'Year III').length;
      const yr4 = filteredStudents.filter(s => normalizeYear(s.currentYear, 'Pharm.D') === 'Year IV').length;
      const yr5 = filteredStudents.filter(s => normalizeYear(s.currentYear, 'Pharm.D') === 'Year V').length;
      const yr6 = filteredStudents.filter(s => normalizeYear(s.currentYear, 'Pharm.D') === 'Year VI').length;
      return {
        title: 'Pharm.D Student Breakdown',
        totalLabel: 'Total Pharm.D',
        total,
        items: [
          { label: 'Year I', count: yr1, badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
          { label: 'Year II', count: yr2, badgeColor: 'bg-teal-50 text-teal-700 border-teal-200' },
          { label: 'Year III', count: yr3, badgeColor: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
          { label: 'Year IV', count: yr4, badgeColor: 'bg-blue-50 text-blue-700 border-blue-200' },
          { label: 'Year V', count: yr5, badgeColor: 'bg-purple-50 text-purple-700 border-purple-200' },
          { label: 'Year VI', count: yr6, badgeColor: 'bg-rose-50 text-rose-700 border-rose-200' },
        ]
      };
    } else if (filterProgramme === 'M.Pharm') {
      const yr1 = filteredStudents.filter(s => normalizeYear(s.currentYear, 'M.Pharm') === 'First Year').length;
      const yr2 = filteredStudents.filter(s => normalizeYear(s.currentYear, 'M.Pharm') === 'Second Year').length;
      return {
        title: 'M.Pharm Student Breakdown',
        totalLabel: 'Total M.Pharm',
        total,
        items: [
          { label: 'First Year', count: yr1, badgeColor: 'bg-amber-50 text-amber-700 border-amber-200' },
          { label: 'Second Year', count: yr2, badgeColor: 'bg-rose-50 text-rose-700 border-rose-200' },
        ]
      };
    } else {
      // All Programmes
      const bpharm = filteredStudents.filter(s => s.programme === 'B.Pharm').length;
      const pharmd = filteredStudents.filter(s => s.programme === 'Pharm.D').length;
      const mpharm = filteredStudents.filter(s => s.programme === 'M.Pharm').length;
      return {
        title: 'All Programmes Registry Overview',
        totalLabel: 'Total Students',
        total,
        items: [
          { label: 'B.Pharm', count: bpharm, badgeColor: 'bg-blue-50 text-blue-700 border-blue-200' },
          { label: 'Pharm.D', count: pharmd, badgeColor: 'bg-purple-50 text-purple-700 border-purple-200' },
          { label: 'M.Pharm', count: mpharm, badgeColor: 'bg-amber-50 text-amber-700 border-amber-200' },
        ]
      };
    }
  }, [filteredStudents, filterProgramme]);

  // Current Academic Enrollment for selected student
  const activeEnrollment = useMemo(() => {
    if (!selectedStudent) return null;
    return getCurrentEnrollmentForStudent(selectedStudent.id, activeAcademicYear, enrollments);
  }, [selectedStudent, activeAcademicYear, enrollments]);

  // Enrollment History for selected student
  const enrollmentHistory = useMemo(() => {
    if (!selectedStudent) return [];
    return getStudentEnrollmentHistory(selectedStudent.id, enrollments);
  }, [selectedStudent, enrollments]);

  // Current active academic record for course registrations
  const activeRecord = useMemo(() => {
    if (!selectedStudent) return null;
    return academicRecords.find(
      r => r.studentId === selectedStudent.id && r.academicYear === activeAcademicYear
    ) || null;
  }, [selectedStudent, activeAcademicYear, academicRecords]);

  // --- Handlers for Add / Edit Student Modal ---
  const handleOpenAddStudent = () => {
    setEditingStudentId(null);
    setFormName('');
    setFormRegNo('');
    setFormProgramme('B.Pharm');
    setFormRegulation('PCI-2020');
    setFormAdmissionYear(2024);
    setFormExpectedGrad(2028);
    setFormBatch('2024-2028');
    setFormAcademicYear('2026-2027');
    setFormCurrentYear('Year I');
    setFormSemester('Semester I');
    setFormSection('Section A');
    setFormOfficialEmail('');
    setFormPersonalEmail('');
    setFormPhone('');
    setShowStudentModal(true);
  };

  const handleOpenEditStudent = (student: StudentMaster) => {
    setEditingStudentId(student.id);
    setFormName(student.name);
    setFormRegNo(student.regNo);
    setFormProgramme(student.programme);
    setFormRegulation(student.regulation || 'PCI-2020');
    setFormAdmissionYear(Number(student.admissionYear || 2024));
    setFormExpectedGrad(Number(student.expectedGraduation || 2028));
    setFormBatch(student.batch || '2024-2028');
    setFormAcademicYear(student.academicYear || '2026-2027');
    setFormCurrentYear(student.currentYear || 'Year IV');
    setFormSemester(student.semester || 'Semester VII');
    setFormSection(student.section || 'Section A');
    setFormOfficialEmail(student.officialEmail || '');
    setFormPersonalEmail(student.email || '');
    setFormPhone(student.phone || '');
    setShowStudentModal(true);
  };

  const handleSaveStudentMaster = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formRegNo) {
      alert('Please fill in Student Name and Registration Number.');
      return;
    }

    const cleanRegNo = formRegNo.trim().toUpperCase();
    const hasEmail = Boolean(formOfficialEmail.trim());

    if (editingStudentId) {
      // Update existing student
      const updated = students.map(s => {
        if (s.id === editingStudentId) {
          return {
            ...s,
            name: formName.trim(),
            regNo: cleanRegNo,
            programme: formProgramme,
            regulation: formRegulation,
            admissionYear: formAdmissionYear,
            expectedGraduation: formExpectedGrad,
            batch: formBatch,
            academicYear: formAcademicYear,
            currentYear: formCurrentYear,
            semester: formSemester,
            section: formSection,
            officialEmail: formOfficialEmail.trim(),
            emailAssigned: hasEmail,
            loginEnabled: hasEmail ? s.loginEnabled : false,
            status: hasEmail ? (s.status === 'Email Pending' ? 'Login Enabled' : s.status) : 'Email Pending',
            email: formPersonalEmail.trim(),
            phone: formPhone.trim()
          };
        }
        return s;
      });
      handleSaveStudents(updated);

      if (selectedStudent && selectedStudent.id === editingStudentId) {
        setSelectedStudent(updated.find(s => s.id === editingStudentId) || null);
      }
      showToast(`Updated student profile for ${cleanRegNo}`);
    } else {
      // Create new student
      if (students.some(s => s.regNo.toUpperCase() === cleanRegNo)) {
        alert(`Student with Registration Number ${cleanRegNo} already exists!`);
        return;
      }

      const newId = `std-${Date.now()}`;
      const newStudent: StudentMaster = {
        id: newId,
        name: formName.trim(),
        regNo: cleanRegNo,
        programme: formProgramme,
        regulation: formRegulation,
        admissionYear: formAdmissionYear,
        expectedGraduation: formExpectedGrad,
        batch: formBatch,
        academicYear: formAcademicYear,
        currentYear: formCurrentYear,
        semester: formSemester,
        section: formSection,
        status: hasEmail ? 'Login Enabled' : 'Email Pending',
        officialEmail: formOfficialEmail.trim(),
        emailAssigned: hasEmail,
        loginEnabled: hasEmail,
        accountActivated: false,
        email: formPersonalEmail.trim(),
        phone: formPhone.trim()
      };

      handleSaveStudents([newStudent, ...students]);
      showToast(`Added new student ${formName} (${cleanRegNo})`);
    }

    setShowStudentModal(false);
  };

  const handleDeleteStudent = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete ${name} permanently from the Master Student Registry?`)) {
      const updated = students.filter(s => s.id !== id);
      handleSaveStudents(updated);
      if (selectedStudent && selectedStudent.id === id) {
        setSelectedStudent(null);
      }
      showToast(`Deleted student record for ${name}`);
    }
  };

  // --- Handlers for Student Import (Excel) ---
  const handleFileUploadStudents = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = evt.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(sheet);

        const parsed = json.map((row: any, idx) => {
          const findVal = (names: string[]) => {
            const key = Object.keys(row).find(k => names.some(n => k.toLowerCase().replace(/[\s_-]/g, '').includes(n.toLowerCase())));
            return key ? row[key]?.toString().trim() : '';
          };

          const regNo = findVal(['registration', 'regno', 'regnumber', 'rollno', 'id']);
          const name = findVal(['name', 'studentname', 'fullname']);
          const progInput = findVal(['program', 'programme', 'degree']);
          const regulation = findVal(['regulation', 'reg']) || 'PCI-2020';
          const admYearInput = findVal(['admissionyear', 'admyear', 'admission']);
          const acadYearInput = findVal(['academicyear', 'acadyear', 'ay']);
          const yearInput = findVal(['year', 'currentyear']);
          const semInput = findVal(['semester', 'sem']);
          const section = findVal(['section', 'sec']) || 'Section A';
          const batchInput = findVal(['batch', 'admissionbatch']);

          let programme: ProgrammeType = 'B.Pharm';
          if (progInput.toLowerCase().includes('pharm.d') || progInput.toLowerCase().includes('pharmd')) {
            programme = 'Pharm.D';
          } else if (progInput.toLowerCase().includes('m.pharm') || progInput.toLowerCase().includes('mpharm')) {
            programme = 'M.Pharm';
          }

          const admYear = Number(admYearInput) || 2024;
          const expGrad = programme === 'Pharm.D' ? admYear + 6 : (programme === 'M.Pharm' ? admYear + 2 : admYear + 4);
          const batch = batchInput || `${admYear}-${expGrad}`;

          return {
            id: `import-${idx}-${Date.now()}`,
            regNo: regNo ? regNo.toUpperCase() : `SRM${2026 + idx}PH${7820 + idx}`,
            name: name || `Student ${idx + 1}`,
            programme,
            regulation,
            admissionYear: admYear,
            expectedGraduation: expGrad,
            batch,
            academicYear: acadYearInput || '2026-2027',
            currentYear: yearInput || 'Year I',
            semester: semInput || 'Semester I',
            section
          };
        });

        setBulkRows(parsed);
      } catch (err) {
        alert('Error parsing Excel file. Please ensure it is a valid .xlsx or .csv file.');
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleCommitStudentImport = () => {
    if (bulkRows.length === 0) {
      alert('No student records to import.');
      return;
    }

    let addedCount = 0;
    let updatedCount = 0;
    const studentMap = new Map<string, StudentMaster>(students.map(s => [s.regNo.toUpperCase(), s]));

    bulkRows.forEach(row => {
      const reg = row.regNo.toUpperCase();
      if (studentMap.has(reg)) {
        // Update existing record
        const existing = studentMap.get(reg)!;
        existing.name = row.name;
        existing.programme = row.programme;
        existing.regulation = row.regulation;
        existing.admissionYear = row.admissionYear;
        existing.expectedGraduation = row.expectedGraduation;
        existing.batch = row.batch;
        existing.academicYear = row.academicYear;
        existing.currentYear = row.currentYear;
        existing.semester = row.semester;
        existing.section = row.section;
        updatedCount++;
      } else {
        // Create new record (even if email is empty!)
        const newStudent: StudentMaster = {
          id: `std-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          name: row.name,
          regNo: reg,
          programme: row.programme,
          regulation: row.regulation,
          admissionYear: row.admissionYear,
          expectedGraduation: row.expectedGraduation,
          batch: row.batch,
          academicYear: row.academicYear,
          currentYear: row.currentYear,
          semester: row.semester,
          section: row.section,
          status: 'Email Pending',
          officialEmail: '',
          emailAssigned: false,
          loginEnabled: false,
          accountActivated: false
        };
        studentMap.set(reg, newStudent);
        addedCount++;
      }
    });

    const updatedList = Array.from(studentMap.values());
    handleSaveStudents(updatedList);
    showToast(`Successfully processed student import: ${addedCount} created, ${updatedCount} updated.`);
    setShowImportStudentsModal(false);
    setBulkRows([]);
  };

  // --- Handlers for Email Import ---
  const handleFileUploadEmails = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = evt.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(sheet);

        const parsed = json.map((row: any) => {
          const findVal = (names: string[]) => {
            const key = Object.keys(row).find(k => names.some(n => k.toLowerCase().replace(/[\s_-]/g, '').includes(n.toLowerCase())));
            return key ? row[key]?.toString().trim() : '';
          };

          const regNo = findVal(['registration', 'regno', 'regnumber', 'rollno', 'id']);
          const officialEmail = findVal(['email', 'officialemail', 'mail', 'emailid']);

          return {
            regNo: regNo ? regNo.toUpperCase() : '',
            officialEmail: officialEmail || ''
          };
        }).filter(r => Boolean(r.regNo && r.officialEmail));

        setEmailImportRows(parsed);
      } catch (err) {
        alert('Error reading Email Import Excel file.');
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleCommitEmailImport = () => {
    if (emailImportRows.length === 0) {
      alert('No email records found to import.');
      return;
    }

    let matchCount = 0;
    let notFoundCount = 0;

    const currentList = [...students];

    emailImportRows.forEach(item => {
      const idx = currentList.findIndex(s => s.regNo.toUpperCase() === item.regNo.toUpperCase());
      if (idx !== -1) {
        currentList[idx].officialEmail = item.officialEmail;
        currentList[idx].emailAssigned = true;
        currentList[idx].loginEnabled = true;
        if (currentList[idx].status === 'Email Pending') {
          currentList[idx].status = 'Login Enabled';
        }
        matchCount++;
      } else {
        notFoundCount++;
      }
    });

    handleSaveStudents(currentList);
    showToast(`Email Import Complete: ${matchCount} official emails linked, ${notFoundCount} registration numbers not found.`);
    setShowImportEmailsModal(false);
    setEmailImportRows([]);
  };

  // --- Handlers for Bulk Promotion ---
  const handleExecuteBulkPromotion = () => {
    let promotedCount = 0;

    const updatedList = students.map(s => {
      if (
        s.programme === promotionTargetProgramme &&
        s.currentYear === promotionFromYear &&
        s.semester === promotionFromSemester
      ) {
        // Record history in history array
        const historyItem = {
          academicYear: s.academicYear || promotionFromAcademicYear,
          programme: s.programme,
          currentYear: s.currentYear,
          semester: s.semester,
          section: s.section || 'Section A',
          regulation: s.regulation || 'PCI-2020',
          promotedAt: new Date().toISOString().split('T')[0],
          status: 'Promoted'
        };

        const existingHist = s.enrollmentHistory || [];
        const isGraduation = promotionToYear === 'Graduated' || promotionToSemester === 'Graduated';

        promotedCount++;
        return {
          ...s,
          academicYear: promotionToAcademicYear,
          currentYear: promotionToYear,
          semester: promotionToSemester,
          status: isGraduation ? ('Graduated' as StudentStatus) : s.status,
          enrollmentHistory: [...existingHist, historyItem]
        };
      }
      return s;
    });

    handleSaveStudents(updatedList);
    showToast(`Bulk Promotion Complete: Promoted ${promotedCount} students from ${promotionFromYear} (${promotionFromSemester}) to ${promotionToYear} (${promotionToSemester}).`);
    setShowBulkPromotionModal(false);
  };

  // Export full student registry to Excel
  const handleExportRegistry = () => {
    const exportData = students.map(s => ({
      'Registration Number': s.regNo,
      'Student Name': s.name,
      'Programme': s.programme,
      'Regulation': s.regulation || 'PCI-2020',
      'Admission Year': s.admissionYear || (s.batch ? s.batch.split('-')[0] : 2024),
      'Expected Graduation': s.expectedGraduation || (s.batch ? s.batch.split('-')[1] : 2028),
      'Admission Batch': s.batch,
      'Academic Year': s.academicYear || '2026-2027',
      'Current Year': s.currentYear || 'Year I',
      'Current Semester': s.semester || 'Semester I',
      'Section': s.section || 'Section A',
      'Official Email': s.officialEmail || 'Not Assigned',
      'Email Assigned': s.emailAssigned ? 'Yes' : 'No',
      'Login Enabled': s.loginEnabled ? 'Yes' : 'No',
      'Account Activated': s.accountActivated ? 'Yes' : 'No',
      'Firebase UID': s.firebaseUid || 'Unlinked',
      'Status': s.status,
      'Contact Phone': s.phone || '',
      'Personal Email': s.email || ''
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Master_Student_Registry');
    XLSX.writeFile(wb, `SRM_Master_Student_Registry_${new Date().toISOString().split('T')[0]}.xlsx`);
    showToast('Exported Master Student Registry to Excel file.');
  };

  // Helper toggle login enabled in Auth Tab
  const handleToggleLoginEnabled = (studentId: string) => {
    const updated = students.map(s => {
      if (s.id === studentId) {
        if (!s.officialEmail || s.emailAssigned === false) {
          alert('Cannot enable login until an Official Email is assigned.');
          return s;
        }
        const nextState = !s.loginEnabled;
        return {
          ...s,
          loginEnabled: nextState,
          status: nextState ? ('Login Enabled' as StudentStatus) : ('Login Disabled' as StudentStatus)
        };
      }
      return s;
    });
    handleSaveStudents(updated);
    if (selectedStudent) {
      setSelectedStudent(updated.find(s => s.id === studentId) || null);
    }
    showToast('Updated student authentication login permission.');
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
            onClick={selectedStudent ? () => setSelectedStudent(null) : onBack}
            className="w-10 h-10 rounded-full bg-white hover:bg-gray-100 flex items-center justify-center text-gray-700 shadow-sm border border-gray-200 transition-all cursor-pointer"
            title={selectedStudent ? "Back to Student Registry" : "Back to Admin Dashboard"}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#8B1E3F] bg-pink-100/60 px-3 py-1 rounded-full border border-pink-200/50">
                Master Student Database
              </span>
              <span className="text-xs text-gray-400">• Permanent Student Primary Identifier</span>
            </div>
            <h1 className="text-2xl font-display font-extrabold text-gray-900 mt-1 flex items-center gap-2">
              🎓 Student Registry
            </h1>
            <p className="text-xs text-gray-500 font-medium">
              {selectedStudent 
                ? `Viewing master profile & dynamic modules for ${selectedStudent.name} (${selectedStudent.regNo})` 
                : 'Permanent master database displaying each student once with Registration Number as primary key.'}
            </p>
          </div>
        </div>

        {!selectedStudent ? (
          <div className="flex items-center gap-2 relative">
            <button
              onClick={handleOpenAddStudent}
              className="px-4 py-2.5 bg-gradient-to-r from-[#8B1E3F] to-[#CD4368] text-white font-extrabold text-xs rounded-full shadow-sm hover:shadow-md transition-all flex items-center gap-1.5 cursor-pointer active:scale-98"
            >
              <Plus className="w-4 h-4" />
              Add Student
            </button>

            {/* Bulk Import / Actions Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowBulkDropdown(!showBulkDropdown)}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-full shadow-sm flex items-center gap-1.5 transition-all cursor-pointer active:scale-98"
              >
                <Upload className="w-4 h-4" />
                Bulk Actions
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {showBulkDropdown && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-200 py-2 z-50 animate-scale-up">
                  <button
                    onClick={() => {
                      setShowBulkDropdown(false);
                      setShowImportStudentsModal(true);
                    }}
                    className="w-full text-left px-4 py-2.5 text-xs font-extrabold text-gray-800 hover:bg-pink-50 hover:text-[#8B1E3F] flex items-center gap-2.5 cursor-pointer"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-[#8B1E3F]" />
                    Import Students
                  </button>
                  <button
                    onClick={() => {
                      setShowBulkDropdown(false);
                      setShowImportEmailsModal(true);
                    }}
                    className="w-full text-left px-4 py-2.5 text-xs font-extrabold text-gray-800 hover:bg-pink-50 hover:text-[#8B1E3F] flex items-center gap-2.5 cursor-pointer"
                  >
                    <Mail className="w-4 h-4 text-blue-600" />
                    Import Email IDs
                  </button>
                  <button
                    onClick={() => {
                      setShowBulkDropdown(false);
                      setShowBulkPromotionModal(true);
                    }}
                    className="w-full text-left px-4 py-2.5 text-xs font-extrabold text-gray-800 hover:bg-pink-50 hover:text-[#8B1E3F] flex items-center gap-2.5 cursor-pointer"
                  >
                    <RefreshCw className="w-4 h-4 text-emerald-600" />
                    Bulk Promotion
                  </button>
                  <div className="border-t border-gray-100 my-1" />
                  <button
                    onClick={() => {
                      setShowBulkDropdown(false);
                      handleExportRegistry();
                    }}
                    className="w-full text-left px-4 py-2.5 text-xs font-extrabold text-gray-800 hover:bg-pink-50 hover:text-[#8B1E3F] flex items-center gap-2.5 cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-gray-600" />
                    Export Student Registry
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <button
            onClick={() => handleOpenEditStudent(selectedStudent)}
            className="px-4 py-2.5 bg-white hover:bg-pink-50/50 text-[#8B1E3F] font-bold text-xs rounded-full border border-pink-200/60 shadow-sm flex items-center gap-2 transition-all cursor-pointer hover:shadow-md"
          >
            <Edit2 className="w-4 h-4 text-[#8B1E3F]" />
            Edit Permanent Profile
          </button>
        )}
      </div>

      {/* ========================================================= */}
      {/* VIEW 1: MASTER STUDENT REGISTRY TABLE                     */}
      {/* ========================================================= */}
      {!selectedStudent ? (
        <div className="space-y-6">
          {/* Live Dynamic Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <GlassCard className="p-4 rounded-3xl border border-white/40 shadow-sm bg-gradient-to-br from-white/90 to-pink-50/40">
              <div className="flex items-center justify-between text-xs font-bold text-gray-500 mb-1">
                <span>{summaryMetrics.totalLabel}</span>
                <span className="p-1.5 rounded-xl bg-pink-100 text-[#8B1E3F]">
                  <GraduationCap className="w-4 h-4" />
                </span>
              </div>
              <div className="text-2xl font-black text-gray-900">{summaryMetrics.total}</div>
              <div className="text-[10px] text-[#8B1E3F] font-bold mt-1">
                {summaryMetrics.title}
              </div>
            </GlassCard>

            {summaryMetrics.items.map((item, idx) => (
              <GlassCard key={idx} className="p-4 rounded-3xl border border-white/40 shadow-sm bg-white/80">
                <div className="flex items-center justify-between text-xs font-bold text-gray-500 mb-1">
                  <span>{item.label}</span>
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${item.badgeColor}`}>
                    {item.count} Std
                  </span>
                </div>
                <div className="text-2xl font-black text-gray-900">{item.count}</div>
                <div className="text-[10px] text-gray-400 font-medium mt-1">
                  {summaryMetrics.total > 0 ? `${((item.count / summaryMetrics.total) * 100).toFixed(1)}% of selection` : '0%'}
                </div>
              </GlassCard>
            ))}
          </div>

          {/* Cascading Filters & View Controls Bar */}
          <GlassCard className="p-4 rounded-3xl border border-white/40 shadow-sm bg-white/80">
            <div className="flex flex-col space-y-4">
              <div className="flex flex-col lg:flex-row gap-3 items-center justify-between">
                {/* Search Bar */}
                <div className="relative flex-1 w-full">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by student name, registration number, phone..."
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#8B1E3F]/30"
                  />
                </div>

                {/* View Mode & Expand Controls */}
                <div className="flex items-center gap-2 shrink-0">
                  <div className="bg-gray-100 p-1 rounded-xl flex items-center border border-gray-200">
                    <button
                      onClick={() => setViewMode('grouped')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                        viewMode === 'grouped' ? 'bg-[#8B1E3F] text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <Layers className="w-3.5 h-3.5" />
                      Grouped Hierarchy
                    </button>
                    <button
                      onClick={() => setViewMode('table')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                        viewMode === 'table' ? 'bg-[#8B1E3F] text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <BarChart3 className="w-3.5 h-3.5" />
                      Flat Registry Table
                    </button>
                  </div>

                  {viewMode === 'grouped' && (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={expandAllNodes}
                        className="px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl border border-gray-200 transition-all cursor-pointer"
                        title="Expand all hierarchy sections"
                      >
                        Expand All
                      </button>
                      <button
                        onClick={collapseAllNodes}
                        className="px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl border border-gray-200 transition-all cursor-pointer"
                        title="Collapse all hierarchy sections"
                      >
                        Collapse All
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Cascading Selection Filters Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 pt-2 border-t border-gray-100">
                {/* 1. Programme Filter */}
                <div>
                  <label className="text-[10px] font-extrabold uppercase text-gray-400 block mb-1">
                    1. Programme
                  </label>
                  <select
                    value={filterProgramme}
                    onChange={(e) => handleProgrammeChange(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#8B1E3F]/30"
                  >
                    <option value="All">All Programmes</option>
                    {PROGRAMMES.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                {/* 2. Year Filter (Cascading) */}
                <div>
                  <label className="text-[10px] font-extrabold uppercase text-gray-400 block mb-1">
                    2. Year
                  </label>
                  <select
                    value={filterYear}
                    onChange={(e) => handleYearChange(e.target.value)}
                    disabled={filterProgramme === 'All' && availableYears.length === 0}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#8B1E3F]/30 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="All">All Years</option>
                    {availableYears.map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>

                {/* 3. Semester Filter (Cascading) */}
                <div>
                  <label className="text-[10px] font-extrabold uppercase text-gray-400 block mb-1">
                    3. Semester
                  </label>
                  {filterProgramme === 'Pharm.D' ? (
                    <div className="w-full bg-purple-50/70 border border-purple-200 rounded-xl px-3 py-2 text-xs font-extrabold text-purple-700 flex items-center justify-between">
                      <span>Annual Pattern</span>
                      <span className="text-[9px] bg-purple-200/60 px-1.5 py-0.2 rounded font-mono">No Sem</span>
                    </div>
                  ) : (
                    <select
                      value={filterSemester}
                      onChange={(e) => setFilterSemester(e.target.value)}
                      disabled={availableSemesters.length === 0}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#8B1E3F]/30 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="All">All Semesters</option>
                      {availableSemesters.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  )}
                </div>

                {/* 4. Batch Filter */}
                <div>
                  <label className="text-[10px] font-extrabold uppercase text-gray-400 block mb-1">
                    4. Batch
                  </label>
                  <select
                    value={filterBatch}
                    onChange={(e) => setFilterBatch(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#8B1E3F]/30"
                  >
                    <option value="All">All Batches</option>
                    {BATCHES.map(b => (
                      <option key={b} value={b}>Batch {b}</option>
                    ))}
                  </select>
                </div>

                {/* 5. Status Filter */}
                <div>
                  <label className="text-[10px] font-extrabold uppercase text-gray-400 block mb-1">
                    5. Status
                  </label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#8B1E3F]/30"
                  >
                    <option value="All">All Statuses</option>
                    {STATUS_OPTIONS.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* MAIN REGISTRY RENDERING */}
          {filteredStudents.length === 0 ? (
            <GlassCard className="p-12 text-center rounded-3xl border border-white/40 shadow-sm bg-white/80">
              <UserCheck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-base font-extrabold text-gray-800">No Students Found</h3>
              <p className="text-xs text-gray-500 max-w-md mx-auto mt-1">
                No student records match the active search query or cascading filter selections ({filterProgramme} • {filterYear} • {filterSemester}).
              </p>
              <button
                onClick={() => {
                  setSearch('');
                  setFilterProgramme('All');
                  setFilterYear('All');
                  setFilterSemester('All');
                  setFilterStatus('All');
                  setFilterBatch('All');
                }}
                className="mt-4 px-4 py-2 bg-pink-100 hover:bg-pink-200 text-[#8B1E3F] font-bold text-xs rounded-full transition-all cursor-pointer"
              >
                Reset All Filters
              </button>
            </GlassCard>
          ) : viewMode === 'table' ? (
            /* FLAT TABLE VIEW WITH S.NO. */
            <GlassCard className="p-0 rounded-3xl border border-white/40 overflow-hidden shadow-sm bg-white/80">
              <StudentTable
                studentList={filteredStudents}
                startIndex={0}
                onSelectStudent={(student) => {
                  setSelectedStudent(student);
                  setSelectedTab('profile');
                  setActiveAcademicYear(student.academicYear || '2026-2027');
                }}
              />
            </GlassCard>
          ) : (
            /* GROUPED HIERARCHICAL ACCORDION VIEW */
            <div className="space-y-6">
              {PROGRAMMES.filter(p => filterProgramme === 'All' || filterProgramme === p).map(p => {
                const progStudents = filteredStudents.filter(s => s.programme === p);
                if (progStudents.length === 0) return null;

                const progNodeId = `prog-${p}`;
                const isProgExpanded = Boolean(expandedNodes[progNodeId]);

                const yearsList = p === 'B.Pharm'
                  ? ['First Year', 'Second Year', 'Third Year', 'Fourth Year']
                  : p === 'Pharm.D'
                  ? ['Year I', 'Year II', 'Year III', 'Year IV', 'Year V', 'Year VI']
                  : ['First Year', 'Second Year'];

                return (
                  <GlassCard key={p} className="p-5 rounded-3xl border border-white/50 shadow-sm bg-white/90">
                    {/* Programme Level Accordion Header */}
                    <div 
                      onClick={() => toggleNode(progNodeId)}
                      className="flex items-center justify-between cursor-pointer select-none pb-2 border-b border-gray-100"
                    >
                      <div className="flex items-center gap-3">
                        <button className="w-8 h-8 rounded-xl bg-pink-50 text-[#8B1E3F] flex items-center justify-center font-bold">
                          {isProgExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                        </button>
                        <div>
                          <div className="flex items-center gap-2">
                            <h2 className="text-lg font-extrabold text-gray-900">{p}</h2>
                            <span className={`text-[11px] font-black px-2.5 py-0.5 rounded-full border ${
                              p === 'B.Pharm' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                              p === 'Pharm.D' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                              'bg-amber-50 text-amber-700 border-amber-200'
                            }`}>
                              {progStudents.length} Students Total
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-400 font-medium">
                            {p === 'Pharm.D' ? 'Doctor of Pharmacy (6 Year Program)' : p === 'M.Pharm' ? 'Master of Pharmacy (2 Year Program)' : 'Bachelor of Pharmacy (4 Year Program)'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Programme Body */}
                    {isProgExpanded && (
                      <div className="mt-4 space-y-4 pl-2 md:pl-4">
                        {yearsList.filter(y => filterYear === 'All' || filterYear === y).map(y => {
                          const yearStudents = progStudents.filter(s => normalizeYear(s.currentYear, p) === y);
                          if (yearStudents.length === 0) return null;

                          const yearNodeId = `year-${p}-${y}`;
                          const isYearExpanded = expandedNodes[yearNodeId] !== false;

                          const semsList = p === 'Pharm.D'
                            ? ['Annual Pattern']
                            : p === 'B.Pharm'
                            ? (y === 'First Year' ? ['Semester I', 'Semester II'] : y === 'Second Year' ? ['Semester III', 'Semester IV'] : y === 'Third Year' ? ['Semester V', 'Semester VI'] : ['Semester VII', 'Semester VIII'])
                            : (y === 'First Year' ? ['Semester I', 'Semester II'] : ['Semester III', 'Semester IV']);

                          return (
                            <div key={y} className="bg-gray-50/70 p-4 rounded-2xl border border-gray-200/70">
                              {/* Year Level Accordion Header */}
                              <div
                                onClick={() => toggleNode(yearNodeId)}
                                className="flex items-center justify-between cursor-pointer select-none pb-2"
                              >
                                <div className="flex items-center gap-2.5">
                                  <button className="w-6 h-6 rounded-lg bg-white text-gray-700 border border-gray-200 flex items-center justify-center font-bold">
                                    {isYearExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                  </button>
                                  <span className="text-xs font-black text-gray-900 uppercase tracking-wider">
                                    📅 {y}
                                  </span>
                                  <span className="text-[10px] font-extrabold bg-white text-gray-700 px-2.5 py-0.5 rounded-full border border-gray-200">
                                    {yearStudents.length} Students
                                  </span>
                                </div>
                              </div>

                              {/* Year Body: Semesters */}
                              {isYearExpanded && (
                                <div className="mt-3 space-y-4 pl-2">
                                  {semsList.filter(sem => filterSemester === 'All' || filterSemester === sem).map(sem => {
                                    const semStudents = yearStudents.filter(s => normalizeSemester(s.semester, p, y) === sem);
                                    if (semStudents.length === 0) return null;

                                    const semNodeId = `sem-${p}-${y}-${sem}`;
                                    const isSemExpanded = expandedNodes[semNodeId] !== false;

                                    return (
                                      <div key={sem} className="bg-white p-3 rounded-xl border border-gray-200/80 shadow-2xs">
                                        {/* Semester Level Header */}
                                        <div
                                          onClick={() => toggleNode(semNodeId)}
                                          className="flex items-center justify-between cursor-pointer select-none py-1 mb-2 border-b border-gray-100"
                                        >
                                          <div className="flex items-center gap-2">
                                            <button className="w-5 h-5 rounded bg-gray-100 text-gray-600 flex items-center justify-center">
                                              {isSemExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                                            </button>
                                            <span className="text-xs font-bold text-[#8B1E3F]">
                                              📖 {sem}
                                            </span>
                                            <span className="text-[10px] font-extrabold bg-pink-50 text-[#8B1E3F] px-2 py-0.2 rounded-full border border-pink-100">
                                              {semStudents.length} Students
                                            </span>
                                          </div>
                                        </div>

                                        {/* Semester Table */}
                                        {isSemExpanded && (
                                          <StudentTable
                                            studentList={semStudents}
                                            startIndex={0}
                                            onSelectStudent={(student) => {
                                              setSelectedStudent(student);
                                              setSelectedTab('profile');
                                              setActiveAcademicYear(student.academicYear || '2026-2027');
                                            }}
                                          />
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </GlassCard>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* ========================================================= */
        /* VIEW 2: COMPLETE STUDENT PROFILE PAGE (8 TABS)           */
        /* ========================================================= */
        <div className="space-y-6">
          {/* Student Profile Header Summary Card */}
          <GlassCard className="p-6 rounded-3xl border border-white/40 shadow-sm bg-white/80">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-gray-100">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#8B1E3F] to-rose-400 text-white font-black text-xl flex items-center justify-center shadow-md shrink-0">
                  {selectedStudent.name.split(' ').map(p => p[0]).filter(Boolean).join('').substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-extrabold text-gray-900">{selectedStudent.name}</h2>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black border ${
                      selectedStudent.status === 'Active' || selectedStudent.status === 'Login Enabled' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      selectedStudent.status === 'Email Pending' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                      'bg-slate-100 text-slate-700 border-slate-200'
                    }`}>
                      {selectedStudent.status}
                    </span>
                  </div>
                  <p className="text-xs text-[#8B1E3F] font-bold mt-1">
                    {selectedStudent.programme} • <span className="text-gray-600">{selectedStudent.currentYear} ({selectedStudent.semester})</span> • <span className="text-gray-400">{selectedStudent.regulation || 'PCI-2020'}</span>
                  </p>
                  <p className="text-[11px] text-gray-500 font-mono mt-0.5">
                    Registration No: <span className="font-bold text-gray-900">{selectedStudent.regNo}</span> | Official Email: <span className="font-bold text-gray-900">{selectedStudent.officialEmail || 'Pending'}</span>
                  </p>
                </div>
              </div>

              {/* Student Profile Navigation Tabs */}
              <div className="flex items-center gap-1 bg-gray-100/80 p-1.5 rounded-2xl border border-gray-200/60 overflow-x-auto w-full md:w-auto">
                <button
                  onClick={() => setSelectedTab('profile')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1 shrink-0 ${
                    selectedTab === 'profile' ? 'bg-[#8B1E3F] text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  Profile
                </button>

                <button
                  onClick={() => setSelectedTab('academic')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1 shrink-0 ${
                    selectedTab === 'academic' ? 'bg-[#8B1E3F] text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <GraduationCap className="w-3.5 h-3.5" />
                  Academic Enrollment
                </button>

                <button
                  onClick={() => setSelectedTab('auth')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1 shrink-0 ${
                    selectedTab === 'auth' ? 'bg-[#8B1E3F] text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Key className="w-3.5 h-3.5" />
                  Authentication
                </button>

                <button
                  onClick={() => setSelectedTab('marks')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1 shrink-0 ${
                    selectedTab === 'marks' ? 'bg-[#8B1E3F] text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Award className="w-3.5 h-3.5" />
                  Marks
                </button>

                <button
                  onClick={() => setSelectedTab('learning')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1 shrink-0 ${
                    selectedTab === 'learning' ? 'bg-[#8B1E3F] text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  Learning
                </button>

                <button
                  onClick={() => setSelectedTab('portfolio')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1 shrink-0 ${
                    selectedTab === 'portfolio' ? 'bg-[#8B1E3F] text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <FileBadge className="w-3.5 h-3.5" />
                  Portfolio
                </button>
              </div>
            </div>

            {/* TAB 1: PROFILE TAB */}
            {selectedTab === 'profile' && (
              <div className="pt-6 space-y-6 animate-fade-in">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider flex items-center gap-2">
                    <User className="w-4 h-4 text-[#8B1E3F]" />
                    Permanent Personal & Admission Profile
                  </h3>
                  <button
                    onClick={() => handleOpenEditStudent(selectedStudent)}
                    className="px-3.5 py-1.5 bg-white hover:bg-pink-50 text-[#8B1E3F] font-bold text-xs rounded-xl border border-pink-200/80 shadow-xs flex items-center gap-1.5 cursor-pointer transition-all"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    Edit Profile
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                  <div className="bg-gray-50/80 p-4 rounded-2xl border border-gray-100">
                    <span className="text-[10px] font-extrabold uppercase text-gray-400 block mb-1">Student Full Name</span>
                    <span className="font-extrabold text-gray-900 text-sm">{selectedStudent.name}</span>
                  </div>

                  <div className="bg-gray-50/80 p-4 rounded-2xl border border-gray-100">
                    <span className="text-[10px] font-extrabold uppercase text-gray-400 block mb-1">Registration Number</span>
                    <span className="font-mono font-black text-gray-900 text-sm">{selectedStudent.regNo}</span>
                  </div>

                  <div className="bg-gray-50/80 p-4 rounded-2xl border border-gray-100">
                    <span className="text-[10px] font-extrabold uppercase text-gray-400 block mb-1">Programme</span>
                    <span className="font-extrabold text-[#8B1E3F] text-sm">{selectedStudent.programme}</span>
                  </div>

                  <div className="bg-gray-50/80 p-4 rounded-2xl border border-gray-100">
                    <span className="text-[10px] font-extrabold uppercase text-gray-400 block mb-1">Regulation</span>
                    <span className="font-extrabold text-gray-800 text-sm">{selectedStudent.regulation || 'PCI-2020'}</span>
                  </div>

                  <div className="bg-gray-50/80 p-4 rounded-2xl border border-gray-100">
                    <span className="text-[10px] font-extrabold uppercase text-gray-400 block mb-1">Admission Year</span>
                    <span className="font-extrabold text-gray-800 text-sm">{selectedStudent.admissionYear || (selectedStudent.batch ? selectedStudent.batch.split('-')[0] : 2024)}</span>
                  </div>

                  <div className="bg-gray-50/80 p-4 rounded-2xl border border-gray-100">
                    <span className="text-[10px] font-extrabold uppercase text-gray-400 block mb-1">Expected Graduation</span>
                    <span className="font-extrabold text-emerald-700 text-sm">{selectedStudent.expectedGraduation || (selectedStudent.batch ? selectedStudent.batch.split('-')[1] : 2028)}</span>
                  </div>

                  <div className="bg-gray-50/80 p-4 rounded-2xl border border-gray-100">
                    <span className="text-[10px] font-extrabold uppercase text-gray-400 block mb-1">Contact Phone</span>
                    <span className="font-bold text-gray-800 text-sm">{selectedStudent.phone || 'Not Provided'}</span>
                  </div>

                  <div className="bg-gray-50/80 p-4 rounded-2xl border border-gray-100">
                    <span className="text-[10px] font-extrabold uppercase text-gray-400 block mb-1">Email</span>
                    <span className="font-bold text-gray-800 text-xs truncate block" title={selectedStudent.officialEmail || selectedStudent.email || 'Not Provided'}>
                      {selectedStudent.officialEmail || selectedStudent.email || 'Not Provided'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: ACADEMIC ENROLLMENT TAB */}
            {selectedTab === 'academic' && (
              <div className="pt-6 space-y-6 animate-fade-in">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-pink-50/50 p-4 rounded-2xl border border-pink-100">
                  <div>
                    <h3 className="text-sm font-extrabold text-gray-900 flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-[#8B1E3F]" />
                      Structured Academic Information
                    </h3>
                    <p className="text-[11px] text-gray-500 font-medium mt-0.5">Current enrollment configuration and course registrations</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Column: Enrollment Metadata */}
                  <GlassCard className="p-5 rounded-2xl border border-gray-200/80 bg-white space-y-3">
                    <h4 className="text-xs font-black uppercase text-gray-400 tracking-wider border-b border-gray-100 pb-2">
                      Current Enrollment
                    </h4>

                    <div className="space-y-3 text-xs">
                      <div>
                        <label className="text-[10px] font-extrabold uppercase text-gray-400 block mb-1">Academic Year</label>
                        <div className="bg-gray-100 border border-gray-200 rounded-xl px-3 py-2 font-mono font-bold text-gray-800">
                          {selectedStudent.academicYear || '2026-2027'}
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-extrabold uppercase text-gray-400 block mb-1">Programme</label>
                        <div className="bg-gray-100 border border-gray-200 rounded-xl px-3 py-2 font-extrabold text-[#8B1E3F]">
                          {selectedStudent.programme}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] font-extrabold uppercase text-gray-400 block mb-1">Current Year</label>
                          <div className="bg-gray-100 border border-gray-200 rounded-xl px-3 py-2 font-extrabold text-gray-800">
                            {selectedStudent.currentYear || 'Year I'}
                          </div>
                        </div>

                        <div>
                          <label className="text-[10px] font-extrabold uppercase text-gray-400 block mb-1">Semester</label>
                          <div className="bg-gray-100 border border-gray-200 rounded-xl px-3 py-2 font-extrabold text-gray-800">
                            {selectedStudent.semester || 'Semester I'}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] font-extrabold uppercase text-gray-400 block mb-1">Section</label>
                          <div className="bg-gray-100 border border-gray-200 rounded-xl px-3 py-2 font-extrabold text-gray-800">
                            {selectedStudent.section || 'Section A'}
                          </div>
                        </div>

                        <div>
                          <label className="text-[10px] font-extrabold uppercase text-gray-400 block mb-1">Regulation</label>
                          <div className="bg-gray-100 border border-gray-200 rounded-xl px-3 py-2 font-extrabold text-gray-800">
                            {selectedStudent.regulation || 'PCI-2020'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </GlassCard>

                  {/* Right Column: Enrolled Courses */}
                  <GlassCard className="p-5 rounded-2xl border border-gray-200/80 bg-white lg:col-span-2 space-y-4">
                    <h4 className="text-xs font-black uppercase text-gray-400 tracking-wider">
                      Enrolled Subject Modules ({selectedStudent.semester || 'Semester VII'})
                    </h4>

                    <div className="divide-y divide-gray-100 text-xs">
                      {activeRecord && activeRecord.registeredCourses && activeRecord.registeredCourses.length > 0 ? (
                        activeRecord.registeredCourses.map(c => (
                          <div key={c.id} className="py-2.5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="font-mono text-xs font-black bg-gray-100 text-gray-900 px-2.5 py-1 rounded-lg border border-gray-200">
                                {c.courseCode}
                              </span>
                              <div>
                                <div className="font-extrabold text-gray-900">{c.courseName}</div>
                                <span className="text-[10px] font-bold text-[#8B1E3F]">Semester {c.semester} • {c.type || 'Core'}</span>
                              </div>
                            </div>
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                              Enrolled
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="py-6 text-center text-gray-400 font-medium">
                          Default curriculum subjects assigned for {selectedStudent.programme} {selectedStudent.semester || 'Semester VII'}.
                        </div>
                      )}
                    </div>
                  </GlassCard>
                </div>
              </div>
            )}

            {/* TAB 3: AUTHENTICATION TAB */}
            {selectedTab === 'auth' && (
              <div className="pt-6 space-y-6 animate-fade-in">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Key className="w-5 h-5 text-[#8B1E3F]" />
                    <div>
                      <h3 className="text-sm font-extrabold text-gray-900">Authentication & Access Status</h3>
                      <p className="text-[11px] text-gray-400">Firebase Auth credentials, official email linking, and login permission control</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Status Badges Card */}
                  <GlassCard className="p-5 rounded-2xl border border-gray-200 bg-white space-y-4">
                    <h4 className="text-xs font-black uppercase text-gray-400 tracking-wider">
                      Authentication Status Summary
                    </h4>

                    <div className="space-y-3 text-xs">
                      <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-between">
                        <span className="font-bold text-gray-700">Official Email Assigned</span>
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black border ${
                          selectedStudent.emailAssigned && selectedStudent.officialEmail ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {selectedStudent.emailAssigned && selectedStudent.officialEmail ? 'YES' : 'NO (PENDING)'}
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-between">
                        <span className="font-bold text-gray-700">Login Enabled Status</span>
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black border ${
                            selectedStudent.loginEnabled ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}>
                            {selectedStudent.loginEnabled ? 'ENABLED' : 'DISABLED'}
                          </span>
                          <button
                            onClick={() => handleToggleLoginEnabled(selectedStudent.id)}
                            className="px-2.5 py-1 bg-gray-200 hover:bg-gray-300 rounded-lg text-[10px] font-bold text-gray-800 transition-all cursor-pointer"
                          >
                            Toggle
                          </button>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-between">
                        <span className="font-bold text-gray-700">Firebase Account Activated</span>
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black border ${
                          selectedStudent.accountActivated ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-gray-100 text-gray-600 border-gray-200'
                        }`}>
                          {selectedStudent.accountActivated ? 'ACTIVATED' : 'INACTIVE'}
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-between">
                        <span className="font-bold text-gray-700">Firebase Auth UID</span>
                        <span className="font-mono text-[10px] font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                          {selectedStudent.firebaseUid || 'Unlinked'}
                        </span>
                      </div>
                    </div>
                  </GlassCard>

                  {/* Manage Official Email Card */}
                  <GlassCard className="p-5 rounded-2xl border border-gray-200 bg-white space-y-4">
                    <h4 className="text-xs font-black uppercase text-gray-400 tracking-wider">
                      Assign / Edit Official Email
                    </h4>

                    <div className="space-y-3 text-xs">
                      <div>
                        <label className="text-[10px] font-extrabold uppercase text-gray-500 block mb-1">Official Email Address</label>
                        <input
                          type="email"
                          value={selectedStudent.officialEmail || ''}
                          onChange={(e) => {
                            const newMail = e.target.value;
                            updateStudentOfficialEmail(selectedStudent.regNo, newMail);
                            setSelectedStudent({
                              ...selectedStudent,
                              officialEmail: newMail,
                              emailAssigned: Boolean(newMail),
                              loginEnabled: Boolean(newMail)
                            });
                          }}
                          placeholder="e.g. akash.j@srmcop.edu.in"
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#8B1E3F]/30"
                        />
                        <p className="text-[10px] text-gray-400 mt-1">
                          Students log in using their Registration Number or this Official Email.
                        </p>
                      </div>

                      <button
                        onClick={() => showToast(`Triggered password reset activation link to ${selectedStudent.officialEmail || 'student'}`)}
                        disabled={!selectedStudent.officialEmail}
                        className="w-full py-2.5 bg-gradient-to-r from-[#8B1E3F] to-[#CD4368] text-white font-extrabold text-xs rounded-xl shadow-xs transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 mt-4"
                      >
                        <Send className="w-3.5 h-3.5" />
                        Send Firebase Password Activation Email
                      </button>
                    </div>
                  </GlassCard>
                </div>
              </div>
            )}


            {/* TAB 5: MARKS TAB */}
            {selectedTab === 'marks' && (
              <div className="pt-6 space-y-6 animate-fade-in">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-[#8B1E3F]" />
                    <div>
                      <h3 className="text-sm font-extrabold text-gray-900">Academic Assessment & Examination Marks</h3>
                      <p className="text-[11px] text-gray-400">Internal sessional tests, practicals, and university exam grades</p>
                    </div>
                  </div>

                  <span className="text-xs font-black text-gray-600 bg-gray-100 px-3 py-1 rounded-full border border-gray-200">
                    Evaluation Status: Pending Database Entry
                  </span>
                </div>

                <div className="p-8 bg-gray-50/60 border border-gray-200 rounded-2xl text-center flex flex-col items-center justify-center gap-2">
                  <Award className="w-8 h-8 text-gray-400" />
                  <h4 className="font-display font-bold text-sm text-gray-800">Grades Not Available</h4>
                  <p className="text-xs text-gray-500 max-w-md">
                    Marks and letter grades will be displayed here once end-semester assessment results are published to the database.
                  </p>
                </div>
              </div>
            )}

            {/* TAB 6: LEARNING TAB */}
            {selectedTab === 'learning' && (
              <div className="pt-6 space-y-6 animate-fade-in">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-[#8B1E3F]" />
                    <div>
                      <h3 className="text-sm font-extrabold text-gray-900">LMS Learning Management Overview</h3>
                      <p className="text-[11px] text-gray-400">Course video lecture completions, quiz scores, and assignment submissions</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <GlassCard className="p-5 rounded-2xl border border-gray-200 bg-white space-y-3">
                    <h4 className="text-xs font-black uppercase text-gray-400 tracking-wider">LMS Activity Metrics</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between p-2 bg-gray-50 rounded-xl">
                        <span className="font-semibold text-gray-700">Video Lectures Completed</span>
                        <span className="font-bold text-[#8B1E3F]">34 / 40 Lessons</span>
                      </div>
                      <div className="flex justify-between p-2 bg-gray-50 rounded-xl">
                        <span className="font-semibold text-gray-700">Quizzes Attempted</span>
                        <span className="font-bold text-emerald-700">8 / 8 Passed</span>
                      </div>
                      <div className="flex justify-between p-2 bg-gray-50 rounded-xl">
                        <span className="font-semibold text-gray-700">Assignments Submitted</span>
                        <span className="font-bold text-blue-700">5 / 5 Submitted</span>
                      </div>
                    </div>
                  </GlassCard>

                  <GlassCard className="p-5 rounded-2xl border border-gray-200 bg-white space-y-3">
                    <h4 className="text-xs font-black uppercase text-gray-400 tracking-wider">Recent Quiz Scores</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center p-2 bg-gray-50 rounded-xl">
                        <div>
                          <div className="font-bold text-gray-900">Pharmacology II - Quiz 1</div>
                          <div className="text-[10px] text-gray-400">Attempted Jul 12, 2026</div>
                        </div>
                        <span className="font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">18 / 20</span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-gray-50 rounded-xl">
                        <div>
                          <div className="font-bold text-gray-900">Medicinal Chemistry II - Quiz 2</div>
                          <div className="text-[10px] text-gray-400">Attempted Jul 20, 2026</div>
                        </div>
                        <span className="font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">19 / 20</span>
                      </div>
                    </div>
                  </GlassCard>
                </div>
              </div>
            )}

            {/* TAB 7: PORTFOLIO TAB */}
            {selectedTab === 'portfolio' && (
              <div className="pt-6 space-y-6 animate-fade-in">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-2">
                    <FileBadge className="w-5 h-5 text-[#8B1E3F]" />
                    <div>
                      <h3 className="text-sm font-extrabold text-gray-900">Student Achievement Portfolio</h3>
                      <p className="text-[11px] text-gray-400">Certifications, co-curricular achievements, internships, and research papers</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <GlassCard className="p-5 rounded-2xl border border-gray-200 bg-white space-y-3">
                    <h4 className="text-xs font-black uppercase text-gray-400 tracking-wider">Hospital & Industrial Internships</h4>
                    <div className="p-3 bg-pink-50/40 rounded-xl border border-pink-100 space-y-1">
                      <div className="font-extrabold text-gray-900">Industrial Pharmacy Training - Apollo Hospitals</div>
                      <p className="text-[11px] text-gray-500">Completed 150 hours internship training in clinical pharmacy & drug distribution.</p>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block">Verified Certificate</span>
                    </div>
                  </GlassCard>

                  GlassCard
                  <GlassCard className="p-5 rounded-2xl border border-gray-200 bg-white space-y-3">
                    <h4 className="text-xs font-black uppercase text-gray-400 tracking-wider">Certifications & Seminars</h4>
                    <div className="p-3 bg-blue-50/40 rounded-xl border border-blue-100 space-y-1">
                      <div className="font-extrabold text-gray-900">National Conference on Novel Drug Delivery Systems</div>
                      <p className="text-[11px] text-gray-500">Presented poster on nano-formulation drug delivery models.</p>
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 inline-block">Poster Award 2025</span>
                    </div>
                  </GlassCard>
                </div>
              </div>
            )}


          </GlassCard>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 1: ADD / EDIT PERMANENT STUDENT                     */}
      {/* ========================================================= */}
      {showStudentModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-white/20 animate-scale-up space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-pink-100 text-[#8B1E3F] flex items-center justify-center">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-gray-900">
                    {editingStudentId ? 'Edit Permanent Student Record' : 'Add Permanent Master Student'}
                  </h3>
                  <p className="text-[10px] text-gray-400 font-medium">Single primary student record in Master Registry</p>
                </div>
              </div>
              <button
                onClick={() => setShowStudentModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-900 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveStudentMaster} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="text-[10px] font-extrabold uppercase text-gray-500 block mb-1">
                    Student Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Akash J."
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#8B1E3F]/30"
                    required
                  />
                </div>

                <div>
                  <label className="text-[10px] font-extrabold uppercase text-gray-500 block mb-1">
                    Registration Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formRegNo}
                    onChange={(e) => setFormRegNo(e.target.value)}
                    placeholder="e.g. SRM2026PH7820"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#8B1E3F]/30 uppercase font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="text-[10px] font-extrabold uppercase text-gray-500 block mb-1">Programme</label>
                  <select
                    value={formProgramme}
                    onChange={(e) => setFormProgramme(e.target.value as ProgrammeType)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#8B1E3F]/30"
                  >
                    {PROGRAMMES.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-extrabold uppercase text-gray-500 block mb-1">Admission Year</label>
                  <input
                    type="number"
                    value={formAdmissionYear}
                    onChange={(e) => setFormAdmissionYear(Number(e.target.value))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#8B1E3F]/30"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-extrabold uppercase text-gray-500 block mb-1">Expected Graduation</label>
                  <input
                    type="number"
                    value={formExpectedGrad}
                    onChange={(e) => setFormExpectedGrad(Number(e.target.value))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#8B1E3F]/30"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-extrabold uppercase text-gray-500 block mb-1">Academic Year</label>
                  <select
                    value={formAcademicYear}
                    onChange={(e) => setFormAcademicYear(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#8B1E3F]/30"
                  >
                    {ACADEMIC_YEARS.map(a => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-extrabold uppercase text-gray-500 block mb-1">Regulation</label>
                  <input
                    type="text"
                    value={formRegulation}
                    onChange={(e) => setFormRegulation(e.target.value)}
                    placeholder="e.g. PCI-2020"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#8B1E3F]/30"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-extrabold uppercase text-gray-500 block mb-1">Current Year</label>
                  <input
                    type="text"
                    value={formCurrentYear}
                    onChange={(e) => setFormCurrentYear(e.target.value)}
                    placeholder="e.g. Year I"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#8B1E3F]/30"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-extrabold uppercase text-gray-500 block mb-1">Current Semester</label>
                  <input
                    type="text"
                    value={formSemester}
                    onChange={(e) => setFormSemester(e.target.value)}
                    placeholder="e.g. Semester I"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#8B1E3F]/30"
                  />
                </div>

                <div className="col-span-2">
                  <label className="text-[10px] font-extrabold uppercase text-gray-500 block mb-1">
                    Official Email (Optional - Can be added later)
                  </label>
                  <input
                    type="email"
                    value={formOfficialEmail}
                    onChange={(e) => setFormOfficialEmail(e.target.value)}
                    placeholder="e.g. student@srmcop.edu.in"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#8B1E3F]/30"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowStudentModal(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#8B1E3F] hover:bg-[#731733] text-white text-xs font-extrabold rounded-xl shadow-xs cursor-pointer"
                >
                  Save Master Student Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: IMPORT STUDENTS (EXCEL)                          */}
      {/* ========================================================= */}
      {showImportStudentsModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-xl w-full shadow-2xl border border-white/20 animate-scale-up space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-pink-100 text-[#8B1E3F] flex items-center justify-center">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-gray-900">Import Students (Excel / CSV)</h3>
                  <p className="text-[10px] text-gray-400 font-medium">Create master student records even if Email is empty</p>
                </div>
              </div>
              <button
                onClick={() => setShowImportStudentsModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-900 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-gray-600 font-medium leading-relaxed">
                Upload an Excel file containing: <code className="bg-pink-50 text-[#8B1E3F] px-1 rounded font-bold">Registration Number, Student Name, Programme, Regulation, Admission Year, Academic Year, Year, Semester, Section, Batch</code>.
              </p>

              <div className="border-2 border-dashed border-gray-300 hover:border-[#8B1E3F] rounded-2xl p-6 text-center bg-gray-50/50 transition-all cursor-pointer relative">
                <input
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleFileUploadStudents}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Upload className="w-8 h-8 text-[#8B1E3F] mx-auto mb-2" />
                <p className="text-xs font-extrabold text-gray-800">Click to upload or drag Excel file here</p>
                <p className="text-[10px] text-gray-400 mt-1">Supports .xlsx, .xls, and .csv files</p>
              </div>

              {bulkRows.length > 0 && (
                <div className="space-y-2 pt-2">
                  <div className="flex justify-between items-center text-xs font-bold text-gray-700">
                    <span>Parsed Records: {bulkRows.length}</span>
                    <span className="text-emerald-700">Ready to Commit</span>
                  </div>

                  <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-xl divide-y divide-gray-100">
                    {bulkRows.slice(0, 10).map((r, i) => (
                      <div key={i} className="p-2 flex justify-between items-center text-[11px]">
                        <div>
                          <span className="font-mono font-bold text-gray-900">{r.regNo}</span> - <span className="font-semibold text-gray-800">{r.name}</span>
                        </div>
                        <span className="text-[10px] text-[#8B1E3F] font-bold">{r.programme} • {r.currentYear}</span>
                      </div>
                    ))}
                    {bulkRows.length > 10 && (
                      <div className="p-2 text-center text-[10px] text-gray-400 font-bold">
                        + {bulkRows.length - 10} more records...
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setShowImportStudentsModal(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 text-xs font-bold rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCommitStudentImport}
                disabled={bulkRows.length === 0}
                className="px-5 py-2 bg-[#8B1E3F] hover:bg-[#731733] text-white text-xs font-extrabold rounded-xl shadow-xs disabled:opacity-50 cursor-pointer"
              >
                Commit Import ({bulkRows.length})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 3: IMPORT EMAIL IDS (MATCH BY REG NO)               */}
      {/* ========================================================= */}
      {showImportEmailsModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-xl w-full shadow-2xl border border-white/20 animate-scale-up space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-gray-900">Import Official Email IDs</h3>
                  <p className="text-[10px] text-gray-400 font-medium">Update Official Email and enable login using Registration Number</p>
                </div>
              </div>
              <button
                onClick={() => setShowImportEmailsModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-900 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-gray-600 font-medium leading-relaxed">
                Upload an Excel file containing <code className="bg-blue-50 text-blue-700 px-1 rounded font-bold">Registration Number, Official Email</code>. Match will be performed using Registration Number. Only Official Email and Enable Login state will be updated. No duplicate student records will be created.
              </p>

              <div className="border-2 border-dashed border-gray-300 hover:border-blue-600 rounded-2xl p-6 text-center bg-gray-50/50 transition-all cursor-pointer relative">
                <input
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleFileUploadEmails}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Mail className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-xs font-extrabold text-gray-800">Click to upload Email ID Excel file</p>
              </div>

              {emailImportRows.length > 0 && (
                <div className="space-y-2 pt-2">
                  <div className="flex justify-between items-center text-xs font-bold text-gray-700">
                    <span>Parsed Email Mappings: {emailImportRows.length}</span>
                    <span className="text-blue-700">Ready to Match & Link</span>
                  </div>

                  <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-xl divide-y divide-gray-100">
                    {emailImportRows.slice(0, 10).map((r, i) => (
                      <div key={i} className="p-2 flex justify-between items-center text-[11px]">
                        <span className="font-mono font-bold text-gray-900">{r.regNo}</span>
                        <span className="font-bold text-blue-700">{r.officialEmail}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setShowImportEmailsModal(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 text-xs font-bold rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCommitEmailImport}
                disabled={emailImportRows.length === 0}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold rounded-xl shadow-xs disabled:opacity-50 cursor-pointer"
              >
                Link Official Emails ({emailImportRows.length})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 4: BULK PROMOTION MODAL                             */}
      {/* ========================================================= */}
      {showBulkPromotionModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-white/20 animate-scale-up space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <RefreshCw className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-gray-900">Bulk Academic Promotion</h3>
                  <p className="text-[10px] text-gray-400 font-medium">Updates Year & Semester on existing student records without duplicating</p>
                </div>
              </div>
              <button
                onClick={() => setShowBulkPromotionModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-900 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] font-extrabold uppercase text-gray-500 block mb-1">Target Programme</label>
                <select
                  value={promotionTargetProgramme}
                  onChange={(e) => setPromotionTargetProgramme(e.target.value as ProgrammeType)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-800"
                >
                  {PROGRAMMES.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 bg-pink-50/50 rounded-2xl border border-pink-100">
                <div>
                  <label className="text-[10px] font-extrabold uppercase text-[#8B1E3F] block mb-1">Promote From Year</label>
                  <input
                    type="text"
                    value={promotionFromYear}
                    onChange={(e) => setPromotionFromYear(e.target.value)}
                    placeholder="e.g. Year III"
                    className="w-full bg-white border border-pink-200 rounded-xl px-3 py-1.5 font-bold text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-extrabold uppercase text-[#8B1E3F] block mb-1">Promote From Semester</label>
                  <input
                    type="text"
                    value={promotionFromSemester}
                    onChange={(e) => setPromotionFromSemester(e.target.value)}
                    placeholder="e.g. Semester V"
                    className="w-full bg-white border border-pink-200 rounded-xl px-3 py-1.5 font-bold text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 bg-emerald-50/50 rounded-2xl border border-emerald-100">
                <div>
                  <label className="text-[10px] font-extrabold uppercase text-emerald-800 block mb-1">Promote To Year</label>
                  <input
                    type="text"
                    value={promotionToYear}
                    onChange={(e) => setPromotionToYear(e.target.value)}
                    placeholder="e.g. Year IV"
                    className="w-full bg-white border border-emerald-200 rounded-xl px-3 py-1.5 font-bold text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-extrabold uppercase text-emerald-800 block mb-1">Promote To Semester</label>
                  <input
                    type="text"
                    value={promotionToSemester}
                    onChange={(e) => setPromotionToSemester(e.target.value)}
                    placeholder="e.g. Semester VII"
                    className="w-full bg-white border border-emerald-200 rounded-xl px-3 py-1.5 font-bold text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-extrabold uppercase text-gray-500 block mb-1">Target Academic Year</label>
                <select
                  value={promotionToAcademicYear}
                  onChange={(e) => setPromotionToAcademicYear(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-800"
                >
                  {ACADEMIC_YEARS.map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setShowBulkPromotionModal(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 text-xs font-bold rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteBulkPromotion}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl shadow-xs cursor-pointer"
              >
                Execute Bulk Promotion
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
