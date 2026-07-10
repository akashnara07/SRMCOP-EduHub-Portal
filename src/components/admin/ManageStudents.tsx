import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, User, Search, Plus, Mail, FileSpreadsheet, Upload, 
  Download, Check, Trash2, Edit2, AlertCircle, Database, Filter, CheckCircle2, Phone, GraduationCap 
} from 'lucide-react';
import GlassCard from '../GlassCard';
import * as XLSX from 'xlsx';

interface Student {
  id: string;
  name: string;
  regNo: string;
  program: 'B.Pharm' | 'Pharm.D';
  year: number;
  semester?: number; // B.Pharm only
  email: string;
  phone: string;
}

interface ManageStudentsProps {
  onBack: () => void;
}

const DEFAULT_STUDENTS: Student[] = [
  { id: '1', name: 'J. Akash', regNo: 'SRM2026PH7810', program: 'B.Pharm', year: 1, semester: 1, email: 'akash.j@srmcop.edu.in', phone: '9444123456' },
  { id: '2', name: 'Priya Sharma', regNo: 'SRM2026PH7811', program: 'Pharm.D', year: 1, email: 'priya.s@srmcop.edu.in', phone: '9444123457' },
  { id: '3', name: 'Manoj Kumar', regNo: 'SRM2026PH7812', program: 'B.Pharm', year: 2, semester: 3, email: 'manoj.k@srmcop.edu.in', phone: '9444123458' },
  { id: '4', name: 'Ritu Sen', regNo: 'SRM2026PH7813', program: 'Pharm.D', year: 3, email: 'ritu.s@srmcop.edu.in', phone: '9444123459' }
];

export default function ManageStudents({ onBack }: ManageStudentsProps) {
  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('srm_lms_student_registry');
    return saved ? JSON.parse(saved) : DEFAULT_STUDENTS;
  });

  const [search, setSearch] = useState('');
  const [filterProgram, setFilterProgram] = useState<'All' | 'B.Pharm' | 'Pharm.D'>('All');
  
  // Manual student form states
  const [formName, setFormName] = useState('');
  const [formRegNo, setFormRegNo] = useState('');
  const [formProgram, setFormProgram] = useState<'B.Pharm' | 'Pharm.D'>('B.Pharm');
  const [formYear, setFormYear] = useState<number>(1);
  const [formSemester, setFormSemester] = useState<number>(1);
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);

  // Bulk Upload wizard states
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkRows, setBulkRows] = useState<any[]>([]);
  const [validationErrors, setValidationErrors] = useState<{ [rowIdx: number]: string[] }>({});
  const [dragActive, setDragActive] = useState(false);
  const [isSuccessMessage, setIsSuccessMessage] = useState<string | null>(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('srm_lms_student_registry', JSON.stringify(students));
  }, [students]);

  // Handle manual submit
  const handleSubmitManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formRegNo.trim() || !formEmail.trim() || !formPhone.trim()) return;

    // Check duplicate RegNo if not editing or changed
    const isDuplicate = students.some(
      s => s.regNo.toUpperCase() === formRegNo.toUpperCase().trim() && s.id !== editingStudentId
    );
    if (isDuplicate) {
      alert(`Student with Registration Number ${formRegNo} already exists.`);
      return;
    }

    const payload: Student = {
      id: editingStudentId || Date.now().toString(),
      name: formName.trim(),
      regNo: formRegNo.toUpperCase().trim(),
      program: formProgram,
      year: formYear,
      semester: formProgram === 'B.Pharm' ? formSemester : undefined,
      email: formEmail.trim(),
      phone: formPhone.trim()
    };

    if (editingStudentId) {
      setStudents(prev => prev.map(s => s.id === editingStudentId ? payload : s));
      setIsSuccessMessage('Student details updated successfully!');
      setEditingStudentId(null);
    } else {
      setStudents(prev => [payload, ...prev]);
      setIsSuccessMessage('Student registered successfully!');
    }

    // Reset Form
    setFormName('');
    setFormRegNo('');
    setFormProgram('B.Pharm');
    setFormYear(1);
    setFormSemester(1);
    setFormEmail('');
    setFormPhone('');
    
    setTimeout(() => setIsSuccessMessage(null), 3000);
  };

  const startEdit = (student: Student) => {
    setEditingStudentId(student.id);
    setFormName(student.name);
    setFormRegNo(student.regNo);
    setFormProgram(student.program);
    setFormYear(student.year);
    if (student.program === 'B.Pharm' && student.semester) {
      setFormSemester(student.semester);
    }
    setFormEmail(student.email);
    setFormPhone(student.phone);
  };

  const cancelEdit = () => {
    setEditingStudentId(null);
    setFormName('');
    setFormRegNo('');
    setFormProgram('B.Pharm');
    setFormYear(1);
    setFormSemester(1);
    setFormEmail('');
    setFormPhone('');
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete student ${name}?`)) {
      setStudents(prev => prev.filter(s => s.id !== id));
      addLog('Deleted student', name, 'warning');
    }
  };

  const addLog = (action: string, target: string, type: 'success' | 'info' | 'warning' = 'info') => {
    // Standard system logging
    console.log(`${action}: ${target}`);
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
      
      // Map columns dynamically and check headers
      const parsedRows = json.map((row: any, idx) => {
        // Find keys case-insensitively
        const findVal = (names: string[]) => {
          const key = Object.keys(row).find(k => names.some(n => k.toLowerCase().replace(/[\s_-]/g, '').includes(n.toLowerCase())));
          return key ? row[key]?.toString().trim() : '';
        };

        const name = findVal(['name', 'studentname', 'fullname']);
        const regNo = findVal(['registration', 'regno', 'regnumber', 'rollno', 'id']);
        const progInput = findVal(['program', 'programme', 'degree']);
        const yearInput = findVal(['year', 'academic_year', 'yr']);
        const semInput = findVal(['semester', 'sem', 'term']);
        const email = findVal(['email', 'emailid', 'mail']);
        const phone = findVal(['phone', 'phonenumber', 'mobile', 'contact']);

        let program: 'B.Pharm' | 'Pharm.D' = 'B.Pharm';
        if (progInput.toLowerCase().includes('pharm.d') || progInput.toLowerCase().includes('pharmd')) {
          program = 'Pharm.D';
        }

        const year = parseInt(yearInput) || 1;
        const semester = program === 'B.Pharm' ? (parseInt(semInput) || 1) : undefined;

        return {
          id: `bulk-${idx}-${Date.now()}`,
          name,
          regNo,
          program,
          year,
          semester,
          email,
          phone,
          originalRow: row
        };
      });

      setBulkRows(parsedRows);
      validateRows(parsedRows);
    };
    reader.readAsBinaryString(file);
  };

  // Validate the spreadsheet rows
  const validateRows = (rows: any[]) => {
    const errors: { [key: number]: string[] } = {};
    rows.forEach((row, idx) => {
      const rowErrors: string[] = [];
      if (!row.name) rowErrors.push('Missing student name');
      if (!row.regNo) rowErrors.push('Missing Registration Number');
      if (!row.email) {
        rowErrors.push('Missing email ID');
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)) {
        rowErrors.push('Invalid email format');
      }
      if (!row.phone) {
        rowErrors.push('Missing phone number');
      } else if (row.phone.length < 8) {
        rowErrors.push('Invalid phone number');
      }

      if (row.program === 'B.Pharm') {
        if (!row.semester) rowErrors.push('Missing semester for B.Pharm');
        if (row.year < 1 || row.year > 4) rowErrors.push('B.Pharm year must be 1-4');
        if (row.semester && (row.semester < 1 || row.semester > 8)) rowErrors.push('B.Pharm semester must be 1-8');
      } else {
        if (row.year < 1 || row.year > 6) rowErrors.push('Pharm.D year must be 1-6');
      }

      if (rowErrors.length > 0) {
        errors[idx] = rowErrors;
      }
    });
    setValidationErrors(errors);
  };

  // Inline edit handler inside validation grid
  const handleCellEdit = (idx: number, field: string, value: any) => {
    const updated = [...bulkRows];
    if (field === 'year' || field === 'semester') {
      updated[idx][field] = value ? parseInt(value) : undefined;
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

  // Commit valid bulk records
  const handleCommitBulkUpload = () => {
    const hasErrors = Object.keys(validationErrors).length > 0;
    if (hasErrors) {
      if (!window.confirm('Some rows contain validation errors. Proceeding will ONLY upload the valid rows. Do you wish to continue?')) {
        return;
      }
    }

    const validRowsToInsert = bulkRows.filter((_, idx) => !validationErrors[idx]);
    if (validRowsToInsert.length === 0) {
      alert('No valid student rows found to import.');
      return;
    }

    // Insert only non-duplicate registration numbers
    let addedCount = 0;
    const currentRegNos = new Set(students.map(s => s.regNo.toUpperCase()));
    const finalInserted: Student[] = [];

    validRowsToInsert.forEach(row => {
      if (!currentRegNos.has(row.regNo.toUpperCase())) {
        finalInserted.push({
          id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
          name: row.name,
          regNo: row.regNo.toUpperCase(),
          program: row.program,
          year: row.year,
          semester: row.semester,
          email: row.email,
          phone: row.phone
        });
        addedCount++;
      }
    });

    if (finalInserted.length > 0) {
      setStudents(prev => [...finalInserted, ...prev]);
    }

    alert(`Successfully processed file. Imported ${addedCount} new students. (${validRowsToInsert.length - addedCount} duplicates skipped).`);
    setShowBulkModal(false);
    setBulkRows([]);
    setValidationErrors({});
  };

  // Download official CSV template
  const handleDownloadTemplate = () => {
    const headers = [['Name', 'Registration Number', 'Program', 'Year', 'Semester', 'Email ID', 'Phone Number']];
    const sampleRows = [
      ['Rohan Sharma', 'SRM2026PH7821', 'B.Pharm', '1', '2', 'rohan.s@srmcop.edu.in', '9876543201'],
      ['Meera Iyer', 'SRM2026PH7822', 'Pharm.D', '3', 'N/A', 'meera.i@srmcop.edu.in', '9876543202'],
      ['Abhishek Gupta', 'SRM2026PH7823', 'B.Pharm', '2', '3', 'abhishek.g@srmcop.edu.in', '9876543203']
    ];
    
    const ws = XLSX.utils.aoa_to_sheet([...headers, ...sampleRows]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Student_Registry_Template");
    XLSX.writeFile(wb, "SRM_Student_Registry_Template.xlsx");
  };

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) || 
                          s.regNo.toLowerCase().includes(search.toLowerCase()) ||
                          s.email.toLowerCase().includes(search.toLowerCase());
    const matchesProg = filterProgram === 'All' || s.program === filterProgram;
    return matchesSearch && matchesProg;
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
              Student Registry
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowBulkModal(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-full flex items-center gap-2 shadow-sm transition-all active:scale-95"
          >
            <Upload className="w-4 h-4" />
            Bulk Import Students
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
                placeholder="Search students by name, register number, or email id..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent border-none text-xs text-gray-800 placeholder-gray-400 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Program:</span>
              <select
                value={filterProgram}
                onChange={(e) => setFilterProgram(e.target.value as any)}
                className="bg-gray-100 border-none text-xs font-bold rounded-lg px-3 py-1.5 text-gray-700 focus:ring-1 focus:ring-[#8B1E3F]"
              >
                <option value="All">All Degrees</option>
                <option value="B.Pharm">B.Pharm Only</option>
                <option value="Pharm.D">Pharm.D Only</option>
              </select>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <h3 className="font-display font-bold text-base text-gray-900 border-b border-gray-100 pb-3 mb-4">
              Enrolled Students Registry ({filteredStudents.length} entries)
            </h3>

            <div className="overflow-x-auto w-full border border-gray-100 rounded-xl">
              <table className="min-w-full divide-y divide-gray-100 text-left text-xs">
                <thead className="bg-gray-50 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  <tr>
                    <th className="px-4 py-3">Student Name</th>
                    <th className="px-4 py-3">Registration Number</th>
                    <th className="px-4 py-3">Program</th>
                    <th className="px-4 py-3">Year / Semester</th>
                    <th className="px-4 py-3">Contact Information</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white text-gray-700">
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map((student) => (
                      <tr key={student.id} className="hover:bg-gray-50/50 transition-all">
                        {/* Name */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-rose-50 text-[#8B1E3F] font-bold text-xs flex items-center justify-center border border-[#8B1E3F]/10">
                              {student.name[0]}
                            </div>
                            <span className="font-bold text-gray-900">{student.name}</span>
                          </div>
                        </td>

                        {/* Reg No */}
                        <td className="px-4 py-3.5">
                          <span className="font-mono font-bold text-[10px] bg-gray-100 px-2 py-1 rounded text-gray-800">
                            {student.regNo}
                          </span>
                        </td>

                        {/* Program */}
                        <td className="px-4 py-3.5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold
                            ${student.program === 'B.Pharm' ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'bg-purple-50 text-purple-700 border border-purple-100'}
                          `}>
                            {student.program}
                          </span>
                        </td>

                        {/* Year / Semester */}
                        <td className="px-4 py-3.5">
                          <div className="flex flex-col">
                            <span className="font-semibold text-gray-800">Year {student.year}</span>
                            {student.program === 'B.Pharm' && student.semester && (
                              <span className="text-[10px] text-gray-400 font-bold">Semester {student.semester}</span>
                            )}
                            {student.program === 'Pharm.D' && (
                              <span className="text-[9px] text-purple-400 font-bold uppercase tracking-wider">Yearly Course</span>
                            )}
                          </div>
                        </td>

                        {/* Contact */}
                        <td className="px-4 py-3.5">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-gray-600 flex items-center gap-1"><Mail className="w-3 h-3 text-gray-400" /> {student.email}</span>
                            <span className="text-gray-500 text-[10px] flex items-center gap-1"><Phone className="w-3 h-3 text-gray-400" /> {student.phone}</span>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => startEdit(student)}
                              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-all"
                              title="Edit Student details"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(student.id, student.name)}
                              className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-all"
                              title="Delete student record"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center text-gray-400 font-medium">
                        No enrolled students matching your filter criteria.
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
            {editingStudentId ? <Edit2 className="w-4 h-4 text-[#8B1E3F]" /> : <Plus className="w-4 h-4 text-[#8B1E3F]" />}
            {editingStudentId ? 'Edit Student Details' : 'Manual Student Registration'}
          </h3>

          <form onSubmit={handleSubmitManual} className="flex flex-col gap-4">
            <div>
              <label className="text-[9px] font-bold text-gray-400 uppercase block mb-1">Full Student Name *</label>
              <input
                type="text"
                required
                placeholder="Ex. Rohan Sharma"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="w-full bg-gray-100/60 border border-transparent hover:border-gray-200 text-xs text-gray-800 p-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#8B1E3F]"
              />
            </div>

            <div>
              <label className="text-[9px] font-bold text-gray-400 uppercase block mb-1">Registration Number *</label>
              <input
                type="text"
                required
                placeholder="Ex. SRM2026PH7821"
                value={formRegNo}
                onChange={(e) => setFormRegNo(e.target.value)}
                className="w-full bg-gray-100/60 border border-transparent hover:border-gray-200 text-xs text-gray-800 p-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#8B1E3F]"
              />
            </div>

            <div>
              <label className="text-[9px] font-bold text-gray-400 uppercase block mb-1">Academic Degree / Program *</label>
              <select
                value={formProgram}
                onChange={(e) => setFormProgram(e.target.value as any)}
                className="w-full bg-gray-100/60 text-xs text-gray-800 p-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#8B1E3F] bg-white"
              >
                <option value="B.Pharm">B.Pharm (Bachelor of Pharmacy)</option>
                <option value="Pharm.D">Pharm.D (Doctor of Pharmacy)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[9px] font-bold text-gray-400 uppercase block mb-1">Academic Year *</label>
                <select
                  value={formYear}
                  onChange={(e) => setFormYear(Number(e.target.value))}
                  className="w-full bg-gray-100/60 text-xs text-gray-800 p-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#8B1E3F] bg-white"
                >
                  <option value={1}>1st Year</option>
                  <option value={2}>2nd Year</option>
                  <option value={3}>3rd Year</option>
                  <option value={4}>4th Year</option>
                  {formProgram === 'Pharm.D' && (
                    <>
                      <option value={5}>5th Year</option>
                      <option value={6}>6th Year</option>
                    </>
                  )}
                </select>
              </div>

              {/* Only show Semester for B.Pharm */}
              {formProgram === 'B.Pharm' ? (
                <div>
                  <label className="text-[9px] font-bold text-gray-400 uppercase block mb-1">Semester *</label>
                  <select
                    value={formSemester}
                    onChange={(e) => setFormSemester(Number(e.target.value))}
                    className="w-full bg-gray-100/60 text-xs text-gray-800 p-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#8B1E3F] bg-white"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                      <option key={s} value={s}>Semester {s}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="bg-gray-50 border border-gray-100 rounded-xl p-2.5 flex items-center justify-center text-center">
                  <span className="text-[9px] text-gray-400 font-bold leading-tight uppercase">No Semesters (Yearly)</span>
                </div>
              )}
            </div>

            <div>
              <label className="text-[9px] font-bold text-gray-400 uppercase block mb-1">Email ID Address *</label>
              <input
                type="email"
                required
                placeholder="Ex. student@srmcop.edu.in"
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

            <div className="flex gap-2 mt-2">
              {editingStudentId && (
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
                {editingStudentId ? 'Update Student' : 'Register Student'}
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
                <h3 className="font-display font-extrabold text-base">Student Registry Bulk Upload Wizard</h3>
                <p className="text-[11px] text-pink-100 mt-0.5">Upload, validate, and parse registration lists instantly.</p>
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
                    <h4 className="font-bold text-sm text-gray-800">Drag & Drop your student list Excel or CSV here</h4>
                    <p className="text-xs text-gray-400 mt-1">Supports standard columns: Name, Registration Number, Program, Year, Semester, Email ID, Phone Number</p>
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
                        <h4 className="font-bold text-xs text-gray-800">Verification & Inspection Grid</h4>
                        <p className="text-[10px] text-gray-400">Total Rows: {bulkRows.length} | Errors Found: {Object.keys(validationErrors).length} rows contain issues.</p>
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
                          <th className="px-3 py-2">Name</th>
                          <th className="px-3 py-2">Reg Number</th>
                          <th className="px-3 py-2">Program</th>
                          <th className="px-3 py-2 w-20">Year</th>
                          <th className="px-3 py-2 w-24">Semester</th>
                          <th className="px-3 py-2">Email ID</th>
                          <th className="px-3 py-2">Phone Number</th>
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
                                  className="w-full bg-transparent border-b border-transparent focus:border-gray-300 focus:outline-none p-0.5 font-bold"
                                />
                              </td>

                              <td className="px-3 py-2">
                                <input 
                                  type="text" 
                                  value={row.regNo} 
                                  onChange={(e) => handleCellEdit(idx, 'regNo', e.target.value)}
                                  className="w-full bg-transparent border-b border-transparent focus:border-gray-300 focus:outline-none p-0.5 font-mono"
                                />
                              </td>

                              <td className="px-3 py-2">
                                <select 
                                  value={row.program} 
                                  onChange={(e) => handleCellEdit(idx, 'program', e.target.value)}
                                  className="bg-transparent border-none p-0.5 font-semibold focus:outline-none focus:ring-0"
                                >
                                  <option value="B.Pharm">B.Pharm</option>
                                  <option value="Pharm.D">Pharm.D</option>
                                </select>
                              </td>

                              <td className="px-3 py-2">
                                <input 
                                  type="number" 
                                  value={row.year} 
                                  onChange={(e) => handleCellEdit(idx, 'year', e.target.value)}
                                  className="w-full bg-transparent border-b border-transparent focus:border-gray-300 focus:outline-none p-0.5 text-center font-semibold"
                                />
                              </td>

                              <td className="px-3 py-2">
                                {row.program === 'B.Pharm' ? (
                                  <input 
                                    type="number" 
                                    value={row.semester || ''} 
                                    onChange={(e) => handleCellEdit(idx, 'semester', e.target.value)}
                                    className="w-full bg-transparent border-b border-transparent focus:border-gray-300 focus:outline-none p-0.5 text-center font-semibold"
                                  />
                                ) : (
                                  <span className="text-gray-400 text-[10px] text-center block">N/A</span>
                                )}
                              </td>

                              <td className="px-3 py-2">
                                <input 
                                  type="text" 
                                  value={row.email} 
                                  onChange={(e) => handleCellEdit(idx, 'email', e.target.value)}
                                  className="w-full bg-transparent border-b border-transparent focus:border-gray-300 focus:outline-none p-0.5 text-xs"
                                />
                              </td>

                              <td className="px-3 py-2">
                                <input 
                                  type="text" 
                                  value={row.phone} 
                                  onChange={(e) => handleCellEdit(idx, 'phone', e.target.value)}
                                  className="w-full bg-transparent border-b border-transparent focus:border-gray-300 focus:outline-none p-0.5 text-xs"
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
                      <h5 className="text-[10px] font-bold text-red-800 uppercase tracking-wider mb-1">Errors spotted:</h5>
                      <p className="text-[11px] text-red-700">Please correct the highlighted fields in the table directly. Invalid rows (marked in red) will be skipped if you choose to Import now.</p>
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
                  Import Valid Records
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
