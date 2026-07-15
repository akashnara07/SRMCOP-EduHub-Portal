import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, User, Search, Plus, Mail, FileSpreadsheet, Upload, 
  Download, Check, Trash2, Edit2, AlertCircle, Database, Filter, 
  CheckCircle2, Phone, BookOpen, Sliders, ToggleLeft, ToggleRight, GraduationCap 
} from 'lucide-react';
import GlassCard from '../GlassCard';
import * as XLSX from 'xlsx';
import { getCurriculumDb } from '../../data/curriculumDb';

interface FacultyMember {
  id: string;
  name: string;
  empId: string;
  dept: string;
  email: string;
  phone: string;
  coursesAllotted: string[]; // List of subject codes
  status: 'Authorized' | 'Suspended';
}

interface ManageFacultyProps {
  onBack: () => void;
}

const DEPARTMENTS = [
  'Department of Pharmacology',
  'Department of Pharmaceutical Analysis',
  'Department of Pharmacognosy',
  'Department of Pharmaceutics',
  'Department of Pharmacy Practice',
  'Department of Pharmaceutical Quality Assurance',
  'Department of Pharmaceutical Regulatory affairs',
  'Department of Pharmaceutical Chemistry'
];

const DEFAULT_FACULTY: FacultyMember[] = [
  { id: '1', name: 'Dr. V. Chitra', empId: '1805101', dept: 'Department of Pharmacology', email: 'chitra.v@srmcop.edu.in', phone: '9876543210', coursesAllotted: ['BP101T'], status: 'Authorized' },
  { id: '2', name: 'Dr. Meena Swaminathan, M.Pharm.', empId: '1805102', dept: 'Department of Pharmaceutical Chemistry', email: 'meena.s@srmcop.edu.in', phone: '9876543211', coursesAllotted: ['BP102T'], status: 'Authorized' },
  { id: '3', name: 'Prof. S. J. Vardhan, Ph.D.', empId: '1805103', dept: 'Department of Pharmaceutical Chemistry', email: 'vardhan.sj@srmcop.edu.in', phone: '9876543212', coursesAllotted: [], status: 'Authorized' },
  { id: '4', name: 'Prof. Elizabeth Mathew, Ph.D.', empId: '1805104', dept: 'Department of Pharmacy Practice', email: 'elizabeth.m@srmcop.edu.in', phone: '9876543213', coursesAllotted: [], status: 'Authorized' }
];

export default function ManageFaculty({ onBack }: ManageFacultyProps) {
  // Retrieve current active courses from Master Curriculum Database
  const [createdCourses, setCreatedCourses] = useState<any[]>([]);
  
  useEffect(() => {
    try {
      const db = getCurriculumDb();
      if (db && db.courseInformation) {
        setCreatedCourses(db.courseInformation);
      }
    } catch (err) {
      console.error('Error fetching course curriculum database:', err);
    }
  }, []);

  const [faculty, setFaculty] = useState<FacultyMember[]>(() => {
    const saved = localStorage.getItem('srm_lms_faculty_registry');
    return saved ? JSON.parse(saved) : DEFAULT_FACULTY;
  });

  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState<string>('All');

  // Manual Form States
  const [formName, setFormName] = useState('');
  const [formEmpId, setFormEmpId] = useState('');
  const [formDept, setFormDept] = useState('Department of Pharmacology');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formCourses, setFormCourses] = useState<string[]>([]);
  const [editingFacultyId, setEditingFacultyId] = useState<string | null>(null);

  // States for searchable course allotment redesign
  const [allotSearchQuery, setAllotSearchQuery] = useState('');
  const [allotFilterProg, setAllotFilterProg] = useState<'All' | 'B.Pharm' | 'Pharm.D'>('All');

  // Bulk Upload wizard states
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkRows, setBulkRows] = useState<any[]>([]);
  const [validationErrors, setValidationErrors] = useState<{ [rowIdx: number]: string[] }>({});
  const [dragActive, setDragActive] = useState(false);
  const [isSuccessMessage, setIsSuccessMessage] = useState<string | null>(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('srm_lms_faculty_registry', JSON.stringify(faculty));
  }, [faculty]);

  // Handle manual form submission
  const handleSubmitManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formEmpId.trim() || !formEmail.trim() || !formPhone.trim()) return;

    // Check duplication of Employee ID
    const isDuplicate = faculty.some(
      f => f.empId.toUpperCase() === formEmpId.toUpperCase().trim() && f.id !== editingFacultyId
    );
    if (isDuplicate) {
      alert(`A faculty advisor with Employee ID ${formEmpId} already exists.`);
      return;
    }

    const payload: FacultyMember = {
      id: editingFacultyId || Date.now().toString(),
      name: formName.trim(),
      empId: formEmpId.toUpperCase().trim(),
      dept: formDept,
      email: formEmail.trim(),
      phone: formPhone.trim(),
      coursesAllotted: formCourses,
      status: editingFacultyId ? (faculty.find(f => f.id === editingFacultyId)?.status || 'Authorized') : 'Authorized'
    };

    if (editingFacultyId) {
      setFaculty(prev => prev.map(f => f.id === editingFacultyId ? payload : f));
      setIsSuccessMessage('Faculty details updated successfully!');
      setEditingFacultyId(null);
    } else {
      setFaculty(prev => [payload, ...prev]);
      setIsSuccessMessage('Faculty advisor registered successfully!');
    }

    // Reset Form
    setFormName('');
    setFormEmpId('');
    setFormDept('Department of Pharmacology');
    setFormEmail('');
    setFormPhone('');
    setFormCourses([]);
    
    setTimeout(() => setIsSuccessMessage(null), 3000);
  };

  const startEdit = (fac: FacultyMember) => {
    setEditingFacultyId(fac.id);
    setFormName(fac.name);
    setFormEmpId(fac.empId);
    setFormDept(fac.dept);
    setFormEmail(fac.email);
    setFormPhone(fac.phone);
    setFormCourses(fac.coursesAllotted || []);
  };

  const cancelEdit = () => {
    setEditingFacultyId(null);
    setFormName('');
    setFormEmpId('');
    setFormDept('Department of Pharmacology');
    setFormEmail('');
    setFormPhone('');
    setFormCourses([]);
  };

  const handleToggleStatus = (id: string) => {
    setFaculty(prev => prev.map(f => {
      if (f.id === id) {
        return { ...f, status: f.status === 'Authorized' ? 'Suspended' : 'Authorized' };
      }
      return f;
    }));
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to permanently delete faculty member ${name}?`)) {
      setFaculty(prev => prev.filter(f => f.id !== id));
    }
  };

  // Toggle allotting course selection in form
  const handleToggleCourseSelect = (courseCode: string) => {
    if (formCourses.includes(courseCode)) {
      setFormCourses(prev => prev.filter(c => c !== courseCode));
    } else {
      setFormCourses(prev => [...prev, courseCode]);
    }
  };

  // Drag & drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  // Process and parse CSV/Excel File
  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target?.result;
      const workbook = XLSX.read(data, { type: 'binary' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const json = XLSX.utils.sheet_to_json(worksheet);
      
      const parsedRows = json.map((row: any, idx) => {
        const findVal = (names: string[]) => {
          const key = Object.keys(row).find(k => names.some(n => k.toLowerCase().replace(/[\s_-]/g, '').includes(n.toLowerCase())));
          return key ? row[key]?.toString().trim() : '';
        };

        const name = findVal(['name', 'facultyname', 'fullname', 'professor']);
        const empId = findVal(['empid', 'employeeid', 'id', 'code', 'staffid']);
        const dept = findVal(['dept', 'department', 'division']) || 'Department of Pharmaceutics';
        const email = findVal(['email', 'emailid', 'mail']);
        const phone = findVal(['phone', 'phonenumber', 'mobile', 'contact']);
        
        // Courses can be comma-separated strings inside spreadsheet
        const coursesRaw = findVal(['courses', 'allotted', 'subjects', 'coursesallotted']);
        const coursesAllotted = coursesRaw ? coursesRaw.split(',').map((c: string) => c.trim().toUpperCase()).filter(Boolean) : [];

        return {
          id: `fac-bulk-${idx}-${Date.now()}`,
          name,
          empId,
          dept,
          email,
          phone,
          coursesAllotted,
          originalRow: row
        };
      });

      setBulkRows(parsedRows);
      validateRows(parsedRows);
    };
    reader.readAsBinaryString(file);
  };

  // Validate the faculty spreadsheet rows
  const validateRows = (rows: any[]) => {
    const errors: { [key: number]: string[] } = {};
    rows.forEach((row, idx) => {
      const rowErrors: string[] = [];
      if (!row.name) rowErrors.push('Missing professor name');
      if (!row.empId) rowErrors.push('Missing Employee ID');
      if (!row.email) {
        rowErrors.push('Missing official email');
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)) {
        rowErrors.push('Invalid email format');
      }
      if (!row.phone) {
        rowErrors.push('Missing phone number');
      } else if (row.phone.length < 8) {
        rowErrors.push('Invalid phone number');
      }

      // Warn if allotted courses do not exist in system
      if (row.coursesAllotted && row.coursesAllotted.length > 0) {
        const activeCodes = new Set(createdCourses.map(c => c.subjectCode.toUpperCase()));
        const missingCodes = row.coursesAllotted.filter((code: string) => !activeCodes.has(code));
        if (missingCodes.length > 0) {
          rowErrors.push(`Unrecognized courses: ${missingCodes.join(', ')} (Created B.Pharm/Pharm.D courses only)`);
        }
      }

      if (rowErrors.length > 0) {
        errors[idx] = rowErrors;
      }
    });
    setValidationErrors(errors);
  };

  // Inline edit inside validation grid
  const handleCellEdit = (idx: number, field: string, value: any) => {
    const updated = [...bulkRows];
    if (field === 'coursesAllotted') {
      updated[idx][field] = value ? value.split(',').map((c: string) => c.trim().toUpperCase()).filter(Boolean) : [];
    } else {
      updated[idx][field] = value;
    }
    setBulkRows(updated);
    validateRows(updated);
  };

  // Delete row from bulk list before uploading
  const handleRemoveBulkRow = (idx: number) => {
    const updated = bulkRows.filter((_, i) => i !== idx);
    setBulkRows(updated);
    validateRows(updated);
  };

  // Commit valid bulk faculty records
  const handleCommitBulkUpload = () => {
    const hasErrors = Object.keys(validationErrors).length > 0;
    if (hasErrors) {
      if (!window.confirm('Some rows contain unresolved conflicts or invalid courses. Proceeding will ONLY upload the valid rows. Continue?')) {
        return;
      }
    }

    const validRowsToInsert = bulkRows.filter((_, idx) => !validationErrors[idx]);
    if (validRowsToInsert.length === 0) {
      alert('No valid faculty advisor rows found to import.');
      return;
    }

    // Insert only non-duplicate employee IDs
    let addedCount = 0;
    const currentEmpIds = new Set(faculty.map(f => f.empId.toUpperCase()));
    const finalInserted: FacultyMember[] = [];

    validRowsToInsert.forEach(row => {
      if (!currentEmpIds.has(row.empId.toUpperCase())) {
        finalInserted.push({
          id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
          name: row.name,
          empId: row.empId.toUpperCase(),
          dept: row.dept,
          email: row.email,
          phone: row.phone,
          coursesAllotted: row.coursesAllotted,
          status: 'Authorized'
        });
        addedCount++;
      }
    });

    if (finalInserted.length > 0) {
      setFaculty(prev => [...finalInserted, ...prev]);
    }

    alert(`Successfully processed. Imported ${addedCount} new faculty members. (${validRowsToInsert.length - addedCount} duplicates skipped).`);
    setShowBulkModal(false);
    setBulkRows([]);
    setValidationErrors({});
  };

  // Download official CSV template for Faculty Registry
  const handleDownloadTemplate = () => {
    const headers = [['Name', 'Employee ID', 'Department', 'Email ID', 'Phone Number', 'Courses Allotted']];
    const sampleRows = [
      ['Dr. Rajesh Khanna', '1805115', 'Department of Pharmaceutics', 'rajesh.k@srmcop.edu.in', '9876543230', 'BP101T, BP102T'],
      ['Dr. Meera Vasudevan', '1805116', 'Department of Pharmacy Practice', 'meera.v@srmcop.edu.in', '9876543231', 'BP103T'],
      ['Prof. Antony Paul', '1805117', 'Department of Pharmaceutical Chemistry', 'antony.p@srmcop.edu.in', '9876543232', '']
    ];
    
    const ws = XLSX.utils.aoa_to_sheet([...headers, ...sampleRows]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Faculty_Registry_Template");
    XLSX.writeFile(wb, "SRM_Faculty_Registry_Template.xlsx");
  };

  const filteredFaculty = faculty.filter(f => {
    const matchesSearch = f.name.toLowerCase().includes(search.toLowerCase()) || 
                          f.empId.toLowerCase().includes(search.toLowerCase()) ||
                          f.email.toLowerCase().includes(search.toLowerCase());
    const matchesDept = filterDept === 'All' || f.dept === filterDept;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto animate-fade-in">
      
      {/* Top action and page title bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-white/60 border border-white/40 hover:bg-white flex items-center justify-center text-gray-700 transition-all shadow-sm shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <span className="text-[10px] font-bold text-[#8B1E3F] uppercase tracking-widest bg-[#8B1E3F]/5 border border-[#8B1E3F]/10 px-2.5 py-0.5 rounded-full">
              LMS Operations Portal
            </span>
            <h1 className="font-display font-extrabold text-2xl text-gray-900 tracking-tight mt-1">
              Faculty Registry
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowBulkModal(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-full flex items-center gap-2 shadow-sm transition-all active:scale-95"
          >
            <Upload className="w-4 h-4" />
            Bulk Import Faculty
          </button>
          <button
            onClick={handleDownloadTemplate}
            className="bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold px-4 py-2.5 rounded-full border border-gray-200 flex items-center gap-2 shadow-sm transition-all"
          >
            <Download className="w-4 h-4" />
            Download Excel Template
          </button>
        </div>
      </div>

      {isSuccessMessage && (
        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <strong>Success:</strong> {isSuccessMessage}
        </div>
      )}

      {/* Main content columns */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* Registry Table & List (3 spans) */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          
          <GlassCard className="p-4 flex flex-col sm:flex-row items-center gap-3">
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-xl flex-1 w-full">
              <Search className="w-4 h-4 text-gray-400 shrink-0" />
              <input
                type="text"
                placeholder="Search professors by name, employee ID, or email id..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent border-none text-xs text-gray-800 placeholder-gray-400 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Department:</span>
              <select
                value={filterDept}
                onChange={(e) => setFilterDept(e.target.value)}
                className="bg-gray-100 border-none text-xs font-bold rounded-lg px-3 py-1.5 text-gray-700 focus:ring-1 focus:ring-[#8B1E3F]"
              >
                <option value="All">All Departments</option>
                {DEPARTMENTS.map(d => (
                  <option key={d} value={d}>{d.replace('Department of ', '')}</option>
                ))}
              </select>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <h3 className="font-display font-bold text-base text-gray-900 border-b border-gray-100 pb-3 mb-4">
              Registered Faculty Advisors ({filteredFaculty.length} entries)
            </h3>

            <div className="overflow-x-auto w-full border border-gray-100 rounded-xl">
              <table className="min-w-full divide-y divide-gray-100 text-left text-xs">
                <thead className="bg-gray-50 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  <tr>
                    <th className="px-4 py-3">Faculty Member</th>
                    <th className="px-4 py-3">Employee ID</th>
                    <th className="px-4 py-3">Department</th>
                    <th className="px-4 py-3">Allotted Courses</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white text-gray-700">
                  {filteredFaculty.length > 0 ? (
                    filteredFaculty.map((fac) => {
                      const isAuthorized = fac.status === 'Authorized';
                      return (
                        <tr key={fac.id} className="hover:bg-gray-50/50 transition-all">
                          {/* Name / Email */}
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-[#8B1E3F]/10 text-[#8B1E3F] font-bold text-xs flex items-center justify-center border border-[#8B1E3F]/10">
                                {fac.name.split(' ').find(w => w.length > 3)?.[0] || fac.name[0]}
                              </div>
                              <div>
                                <span className="font-bold text-gray-900 block leading-tight">{fac.name}</span>
                                <span className="text-[10px] text-gray-400 font-mono mt-0.5 block">{fac.email} • {fac.phone}</span>
                              </div>
                            </div>
                          </td>

                          {/* Emp ID */}
                          <td className="px-4 py-3.5">
                            <span className="font-mono font-bold text-[10px] bg-gray-100 px-2 py-1 rounded text-gray-800">
                              {fac.empId}
                            </span>
                          </td>

                          {/* Department */}
                          <td className="px-4 py-3.5">
                            <span className="font-medium text-gray-600">{fac.dept}</span>
                          </td>

                          {/* Allotted Courses */}
                          <td className="px-4 py-3.5">
                            <div className="flex flex-wrap gap-1">
                              {fac.coursesAllotted && fac.coursesAllotted.length > 0 ? (
                                fac.coursesAllotted.map(code => {
                                  // Find the actual name
                                  const cObj = createdCourses.find(c => c.subjectCode === code);
                                  const tooltip = cObj ? `${cObj.courseName} (${cObj.programme})` : 'Master Course';
                                  return (
                                    <span 
                                      key={code} 
                                      title={tooltip}
                                      className="font-mono font-bold text-[9px] bg-rose-50 text-[#8B1E3F] border border-rose-100 px-1.5 py-0.5 rounded cursor-help"
                                    >
                                      {code}
                                    </span>
                                  );
                                })
                              ) : (
                                <span className="text-gray-400 font-medium italic text-[10px]">None Allotted</span>
                              )}
                            </div>
                          </td>

                          {/* Status */}
                          <td className="px-4 py-3.5">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider
                              ${isAuthorized ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'}
                            `}>
                              {fac.status}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="px-4 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button 
                                onClick={() => handleToggleStatus(fac.id)}
                                className="text-gray-400 hover:text-[#8B1E3F] transition-colors"
                                title="Toggle authorization"
                              >
                                {isAuthorized ? (
                                  <ToggleRight className="w-6 h-6 text-[#8B1E3F]" />
                                ) : (
                                  <ToggleLeft className="w-6 h-6" />
                                )}
                              </button>
                              <button
                                onClick={() => startEdit(fac)}
                                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-all"
                                title="Edit Faculty details"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDelete(fac.id, fac.name)}
                                className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-all"
                                title="Delete faculty record"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center text-gray-400 font-medium">
                        No registered faculty members matching your filter criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>

        {/* Manual Form (1 span) */}
        <GlassCard className="p-6">
          <h3 className="font-display font-bold text-base text-gray-900 mb-4 flex items-center gap-2">
            {editingFacultyId ? <Edit2 className="w-4 h-4 text-[#8B1E3F]" /> : <Plus className="w-4 h-4 text-[#8B1E3F]" />}
            {editingFacultyId ? 'Edit Faculty Details' : 'Manual Staff Registration'}
          </h3>

          <form onSubmit={handleSubmitManual} className="flex flex-col gap-4">
            <div>
              <label className="text-[9px] font-bold text-gray-400 uppercase block mb-1">Full Name & Credentials *</label>
              <input
                type="text"
                required
                placeholder="Ex. Dr. Ramesh Kumar, Ph.D..."
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="w-full bg-gray-100/60 border border-transparent hover:border-gray-200 text-xs text-gray-800 p-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#8B1E3F]"
              />
            </div>

            <div>
              <label className="text-[9px] font-bold text-gray-400 uppercase block mb-1">Employee ID *</label>
              <input
                type="text"
                required
                placeholder="Ex. 1805115"
                value={formEmpId}
                onChange={(e) => setFormEmpId(e.target.value)}
                className="w-full bg-gray-100/60 border border-transparent hover:border-gray-200 text-xs text-gray-800 p-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#8B1E3F]"
              />
            </div>            <div>
              <label className="text-[9px] font-bold text-gray-400 uppercase block mb-1">Department Registry *</label>
              <select
                value={formDept}
                onChange={(e) => setFormDept(e.target.value)}
                className="w-full bg-gray-100/60 text-xs text-gray-800 p-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#8B1E3F] bg-white border border-transparent hover:border-gray-200"
              >
                {DEPARTMENTS.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[9px] font-bold text-gray-400 uppercase block mb-1">Official University Email *</label>
              <input
                type="email"
                required
                placeholder="Ex. ramesh.k@srmcop.edu.in..."
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                className="w-full bg-gray-100/60 border border-transparent hover:border-gray-200 text-xs text-gray-800 p-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#8B1E3F]"
              />
            </div>

            <div>
              <label className="text-[9px] font-bold text-gray-400 uppercase block mb-1">Phone Number *</label>
              <input
                type="tel"
                required
                placeholder="Ex. 9876543210"
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
                className="w-full bg-gray-100/60 border border-transparent hover:border-gray-200 text-xs text-gray-800 p-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#8B1E3F]"
              />
            </div>

            {/* Redesigned Courses Allotment for 100+ subjects */}
            <div className="flex flex-col gap-2.5 border-t border-gray-150/45 pt-3 mt-1">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider block">
                Allot Courses (Redesigned Search & Add)
              </label>
              
              {/* Filter controls */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-1.5 bg-gray-100 p-0.5 rounded-lg">
                  {(['All', 'B.Pharm', 'Pharm.D'] as const).map(prog => (
                    <button
                      key={prog}
                      type="button"
                      onClick={() => setAllotFilterProg(prog)}
                      className={`flex-1 text-center py-1 text-[10px] font-bold uppercase rounded-md transition-all ${
                        allotFilterProg === prog
                          ? 'bg-[#8B1E3F] text-white shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {prog}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-150 px-2.5 py-1.5 rounded-xl">
                  <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <input
                    type="text"
                    placeholder="Search master courses by code or name..."
                    value={allotSearchQuery}
                    onChange={(e) => setAllotSearchQuery(e.target.value)}
                    className="w-full bg-transparent border-none text-[11px] text-gray-800 placeholder-gray-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* Searched Results Panel */}
              <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto border border-gray-150/60 rounded-xl p-2 bg-gray-50/30">
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wide px-1">
                  Search Results:
                </span>
                {(() => {
                  const filtered = createdCourses.filter(c => {
                    const matchesSearch = c.courseName.toLowerCase().includes(allotSearchQuery.toLowerCase()) ||
                                          c.subjectCode.toLowerCase().includes(allotSearchQuery.toLowerCase());
                    const matchesProg = allotFilterProg === 'All' || c.programme === allotFilterProg;
                    return matchesSearch && matchesProg;
                  });

                  if (filtered.length === 0) {
                    return <span className="text-gray-400 italic text-[10px] text-center py-2">No matching courses found.</span>;
                  }

                  // Show matching courses
                  return filtered.map(c => {
                    const isSelected = formCourses.includes(c.subjectCode);
                    return (
                      <button
                        key={c.subjectCode}
                        type="button"
                        onClick={() => handleToggleCourseSelect(c.subjectCode)}
                        className={`flex items-center justify-between text-left text-[11px] p-2 rounded-lg border transition-all select-none ${
                          isSelected 
                            ? 'bg-rose-50/60 border-[#8B1E3F]/30 text-[#8B1E3F] font-bold' 
                            : 'bg-white border-gray-100 hover:bg-gray-100 text-gray-700'
                        }`}
                      >
                        <div className="truncate pr-1 flex items-center gap-1.5">
                          <span className="font-mono bg-gray-150 px-1 rounded text-[9px] text-gray-500 font-bold">{c.subjectCode}</span>
                          <span className="truncate">{c.courseName}</span>
                        </div>
                        <span className="text-[9px] font-black uppercase text-gray-400 shrink-0">
                          {isSelected ? '✓ Allotted' : '+ Allot'}
                        </span>
                      </button>
                    );
                  });
                })()}
              </div>

              {/* Active Allotted List Chips */}
              <div className="flex flex-col gap-1.5 mt-1">
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest pl-0.5">
                  CURRENTLY ALLOTTED ({formCourses.length})
                </span>
                {formCourses.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 p-2 bg-white border border-gray-150/65 rounded-xl max-h-24 overflow-y-auto">
                    {formCourses.map(code => {
                      const cInfo = createdCourses.find(c => c.subjectCode === code);
                      return (
                        <div 
                          key={code}
                          className="flex items-center gap-1 bg-rose-50/50 border border-rose-100 text-[#8B1E3F] font-semibold text-[10px] pl-2 pr-1 py-0.5 rounded-full"
                        >
                          <span className="font-mono font-bold mr-0.5">{code}</span>
                          <span className="max-w-[80px] truncate text-gray-600 font-normal">{cInfo?.courseName || ''}</span>
                          <button
                            type="button"
                            onClick={() => setFormCourses(prev => prev.filter(c => c !== code))}
                            className="w-4 h-4 rounded-full hover:bg-rose-100 flex items-center justify-center text-[#8B1E3F] transition-all text-[9px] font-bold shrink-0 ml-0.5"
                          >
                            ×
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <span className="text-gray-400 italic text-[10px] text-center py-2 bg-gray-50 border border-dashed border-gray-200 rounded-xl">
                    No courses allotted yet. Search and select above.
                  </span>
                )}
              </div>
            </div>

            <div className="flex gap-2 mt-2">
              {editingFacultyId && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="flex-1 text-center text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-full transition-all"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                className="flex-1 text-center text-xs font-bold bg-[#8B1E3F] hover:bg-[#b32a4e] text-white py-3 rounded-full transition-all shadow-md shadow-maroon-900/10"
              >
                {editingFacultyId ? 'Update Staff' : 'Register Staff'}
              </button>
            </div>
          </form>
        </GlassCard>
      </div>

      {/* Bulk Import Modal Wizard */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-gray-950/40 backdrop-blur-sm flex items-center justify-center z-[1000] p-4">
          <div className="bg-white/95 backdrop-blur-md rounded-[24px] shadow-2xl border border-gray-100 w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-fade-in">
            <div className="bg-[#8B1E3F] text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="font-display font-extrabold text-base">Faculty Registry Bulk Upload Wizard</h3>
                <p className="text-[11px] text-pink-100 mt-0.5">Upload and sync authorized lecturers, departments, and course allotments dynamically.</p>
              </div>
              <button 
                onClick={() => {
                  setShowBulkModal(false);
                  setBulkRows([]);
                  setValidationErrors({});
                }}
                className="text-white/80 hover:text-white font-bold text-xs bg-white/10 px-3 py-1 rounded-full"
              >
                Close
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-5">
              
              {/* Drag and Drop Zone */}
              {bulkRows.length === 0 ? (
                <div 
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-[20px] p-10 text-center flex flex-col items-center justify-center gap-3 transition-all cursor-pointer
                    ${dragActive ? 'border-[#8B1E3F] bg-rose-50/20' : 'border-gray-200 hover:border-gray-300'}
                  `}
                >
                  <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-inner">
                    <FileSpreadsheet className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-gray-800">Drag & Drop your staff list Excel or CSV here</h4>
                    <p className="text-xs text-gray-400 mt-1">Supports columns: Name, Employee ID, Department, Email ID, Phone Number, Courses Allotted (comma separated)</p>
                  </div>
                  <label className="mt-2 bg-gray-100 hover:bg-gray-200 text-[#8B1E3F] text-xs font-bold px-4 py-2 rounded-full cursor-pointer transition-all">
                    Browse Files
                    <input 
                      type="file" 
                      accept=".csv, .xlsx, .xls"
                      className="hidden" 
                      onChange={handleFileChange}
                    />
                  </label>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {/* Status Banner */}
                  <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-[#8B1E3F]" />
                      <div className="text-left">
                        <h4 className="font-bold text-xs text-gray-800">Operational Checklist & Course Compliance Grid</h4>
                        <p className="text-[10px] text-gray-400">Total Rows: {bulkRows.length} | Errors Spotted: {Object.keys(validationErrors).length} rows. Invalid/unregistered courses will highlight warnings.</p>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => {
                        setBulkRows([]);
                        setValidationErrors({});
                      }}
                      className="text-[10px] bg-gray-200 hover:bg-gray-300 text-gray-600 font-bold px-3 py-1.5 rounded-full uppercase"
                    >
                      Clear & Upload New File
                    </button>
                  </div>

                  {/* Excel Like Grid */}
                  <div className="overflow-x-auto border border-gray-200 rounded-2xl max-h-[40vh]">
                    <table className="min-w-full divide-y divide-gray-200 text-left text-xs">
                      <thead className="bg-gray-50 text-[10px] font-bold uppercase tracking-wider text-gray-400 sticky top-0">
                        <tr>
                          <th className="px-3 py-2 w-10 text-center">Row</th>
                          <th className="px-3 py-2">Professor Name</th>
                          <th className="px-3 py-2">Employee ID</th>
                          <th className="px-3 py-2">Department</th>
                          <th className="px-3 py-2">Email Address</th>
                          <th className="px-3 py-2">Phone Number</th>
                          <th className="px-3 py-2">Allotted Courses (Codes)</th>
                          <th className="px-3 py-2 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {bulkRows.map((row, idx) => {
                          const errors = validationErrors[idx] || [];
                          const hasError = errors.length > 0;
                          
                          return (
                            <tr key={row.id} className={hasError ? 'bg-red-50/40 hover:bg-red-50/60' : 'hover:bg-gray-50'}>
                              <td className="px-3 py-2 text-center font-mono text-[10px] text-gray-400">
                                {idx + 1}
                              </td>

                              {/* Editable cells */}
                              <td className="px-3 py-2">
                                <input 
                                  type="text" 
                                  value={row.name} 
                                  onChange={(e) => handleCellEdit(idx, 'name', e.target.value)}
                                  className="w-full bg-transparent border-b border-transparent focus:border-gray-300 focus:outline-none p-0.5 font-bold text-gray-800"
                                />
                              </td>

                              <td className="px-3 py-2">
                                <input 
                                  type="text" 
                                  value={row.empId} 
                                  onChange={(e) => handleCellEdit(idx, 'empId', e.target.value)}
                                  className="w-full bg-transparent border-b border-transparent focus:border-gray-300 focus:outline-none p-0.5 font-mono"
                                />
                              </td>

                              <td className="px-3 py-2">
                                <select 
                                  value={row.dept} 
                                  onChange={(e) => handleCellEdit(idx, 'dept', e.target.value)}
                                  className="bg-transparent border-none p-0.5 focus:outline-none focus:ring-0 text-xs text-gray-700"
                                >
                                  {DEPARTMENTS.map(d => (
                                    <option key={d} value={d}>{d}</option>
                                  ))}
                                </select>
                              </td>

                              <td className="px-3 py-2">
                                <input 
                                  type="text" 
                                  value={row.email} 
                                  onChange={(e) => handleCellEdit(idx, 'email', e.target.value)}
                                  className="w-full bg-transparent border-b border-transparent focus:border-gray-300 focus:outline-none p-0.5"
                                />
                              </td>

                              <td className="px-3 py-2">
                                <input 
                                  type="text" 
                                  value={row.phone} 
                                  onChange={(e) => handleCellEdit(idx, 'phone', e.target.value)}
                                  className="w-full bg-transparent border-b border-transparent focus:border-gray-300 focus:outline-none p-0.5"
                                />
                              </td>

                              <td className="px-3 py-2">
                                <input 
                                  type="text" 
                                  value={row.coursesAllotted.join(', ')} 
                                  title="Enter comma-separated course codes"
                                  onChange={(e) => handleCellEdit(idx, 'coursesAllotted', e.target.value)}
                                  className="w-full bg-transparent border-b border-transparent focus:border-gray-300 focus:outline-none p-0.5 font-mono text-xs font-bold text-[#8B1E3F]"
                                />
                              </td>

                              <td className="px-3 py-2 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  {hasError && (
                                    <span 
                                      className="text-red-600 cursor-help"
                                      title={errors.join('\n')}
                                    >
                                      <AlertCircle className="w-4 h-4 text-red-500" />
                                    </span>
                                  )}
                                  <button 
                                    onClick={() => handleRemoveBulkRow(idx)}
                                    className="text-gray-400 hover:text-red-500 transition-colors"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Errors display panel */}
                  {Object.keys(validationErrors).length > 0 && (
                    <div className="p-3 bg-red-50 border border-red-100 rounded-xl">
                      <h5 className="text-[10px] font-bold text-red-800 uppercase tracking-wider mb-1">Validation warnings and course compliance checks:</h5>
                      <p className="text-[11px] text-red-700">Allotted courses must exist inside the Master Curriculum Database (B.Pharm or Pharm.D created courses). Correct any misspelled codes, or missing fields directly in the table cells above.</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="bg-gray-50 p-5 border-t border-gray-100 flex items-center justify-between">
              <button 
                type="button" 
                onClick={handleDownloadTemplate}
                className="text-xs font-bold text-gray-500 hover:text-gray-700 flex items-center gap-1.5"
              >
                <Download className="w-4 h-4" />
                Download Blank Excel Template
              </button>

              <div className="flex items-center gap-3">
                <button 
                  type="button" 
                  onClick={() => {
                    setShowBulkModal(false);
                    setBulkRows([]);
                    setValidationErrors({});
                  }}
                  className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-700 rounded-xl"
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  disabled={bulkRows.length === 0}
                  onClick={handleCommitBulkUpload}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-1.5 transition-all"
                >
                  <Check className="w-4 h-4" />
                  Import Valid Staff Records
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
