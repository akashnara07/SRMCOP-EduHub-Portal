import React, { useState } from 'react';
import { User, Mail, Shield, Award, Calendar, BookOpen, ChevronRight, Filter, BookOpenCheck, FileSpreadsheet, Download, Loader2, AlertCircle, Check, Upload, Edit, Phone } from 'lucide-react';
import GlassCard from '../GlassCard';
import { Subject, FacultyProfile } from '../../types';

interface ProfileViewProps {
  role?: 'Student' | 'Faculty' | 'Admin';
  facultyProfile?: FacultyProfile;
  subjects?: Subject[];
  onGoToSubject?: (subjectId: string) => void;
  onGoToScreen?: (screenId: string) => void;
}

export default function ProfileView({
  role = 'Student',
  facultyProfile,
  subjects = [],
  onGoToSubject,
  onGoToScreen,
}: ProfileViewProps) {
  // Student Profile editable states
  const [studentName, setStudentName] = useState('J. Akash');
  const [studentRegNumber, setStudentRegNumber] = useState('SRM2026PH7810');
  const [studentCourse, setStudentCourse] = useState('B.Pharm');
  const [studentYear, setStudentYear] = useState('Year I');
  const [studentSem, setStudentSem] = useState('Semester 1');
  const [studentEmail, setStudentEmail] = useState('akash.j@srmcop.edu.in');
  const [studentPhone, setStudentPhone] = useState('+91 98765 43210');
  const [isEditingStudent, setIsEditingStudent] = useState(false);
  const [studentSaveSuccess, setStudentSaveSuccess] = useState(false);

  // Filters for Faculty subjects
  const [selectedYear, setSelectedYear] = useState<string>('2025-2026');
  const [selectedSem, setSelectedSem] = useState<number>(1);
  const [department, setDepartment] = useState(facultyProfile?.department || 'Department of Pharmacology');
  const [phoneNumber, setPhoneNumber] = useState(facultyProfile?.phone || '+91 94440 12345');

  // Roster import states
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [stagedStudents, setStagedStudents] = useState<any[]>([]);
  const [importError, setImportError] = useState<string | null>(null);
  const [showImportSuccess, setShowImportSuccess] = useState(false);
  const [importTargetSubject, setImportTargetSubject] = useState<string>('');

  if (role === 'Faculty' && facultyProfile) {
    // Helper function to download Excel spreadsheet template
    const handleDownloadTemplate = () => {
      const headers = "Name,Register Number,Programme,Attendance (%),GPA\n";
      const rows = [
        "Priyesh Sen,SRM2026PH7830,B.Pharm,91.5,8.20\n",
        "Anjali Rao,SRM2026PH7831,B.Pharm,94.0,8.75\n",
        "Vignesh Nair,SRM2026PH7832,Pharm.D,86.2,7.90\n",
      ].join("");
      
      const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `SRM_LMS_Student_Template.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        parseStudentFile(files[0]);
      }
    };

    const parseStudentFile = (file: File) => {
      setIsImporting(true);
      setImportProgress(0);
      setImportError(null);
      setStagedStudents([]);

      const interval = setInterval(() => {
        setImportProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            
            const reader = new FileReader();
            reader.onload = (event) => {
              try {
                const text = event.target?.result as string;
                const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
                
                if (lines.length < 2) {
                  setImportError("Empty or invalid file. Ensure headers are intact.");
                  setIsImporting(false);
                  return;
                }

                const parsed: any[] = [];
                for (let i = 1; i < lines.length; i++) {
                  const cols = lines[i].split(',').map(c => c.trim());
                  if (cols.length >= 2 && cols[0] && cols[1]) {
                    parsed.push({
                      name: cols[0],
                      registerNumber: cols[1],
                      programme: cols[2] || 'B.Pharm',
                      attendance: parseFloat(cols[3]) || 90.0,
                      gpa: parseFloat(cols[4]) || 8.0,
                    });
                  }
                }

                if (parsed.length === 0) {
                  setImportError("No valid student records found. Check columns format.");
                } else {
                  setStagedStudents(parsed);
                }
              } catch (err) {
                setImportError("Error processing spreadsheet content.");
              }
              setIsImporting(false);
            };
            
            reader.readAsText(file);
            return 100;
          }
          return prev + 25;
        });
      }, 100);
    };

    const handleCommitImport = () => {
      setStagedStudents([]);
      setShowImportSuccess(true);
      setTimeout(() => setShowImportSuccess(false), 4000);
    };

    // Filter subjects taught by this faculty matching the chosen year and semester
    const filteredSubjects = subjects.filter((sub) => {
      const isInstructing = facultyProfile.subjects.includes(sub.id);
      const matchesYear = sub.academicYear === selectedYear;
      const matchesSem = sub.semester === selectedSem;
      return isInstructing && matchesYear && matchesSem;
    });

    return (
      <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto">
        <div>
          <h1 className="font-display font-extrabold text-2xl text-gray-900 tracking-tight">Faculty Profile</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {/* Faculty Card Summary */}
          <GlassCard className="p-6 text-center flex flex-col items-center justify-center gap-4 border-t-4 border-t-[#8B1E3F]">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#8B1E3F] to-[#CD4368] flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-black/10">
              RS
            </div>
            <div>
              <h2 className="font-display font-bold text-lg text-gray-900 leading-tight">{facultyProfile.name}</h2>
              <p className="text-[10px] text-[#8B1E3F] font-bold uppercase tracking-wider mt-1 bg-pink-50 border border-pink-100/50 px-2.5 py-0.5 rounded-full inline-block">
                {facultyProfile.designation}
              </p>
            </div>

            <div className="w-full bg-gray-50/50 p-3.5 rounded-2xl border border-white/20 text-left text-xs text-gray-500 flex flex-col gap-2.5 mt-2">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Department:</span>
                <span className="text-gray-900 font-bold text-[11px]">{department}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold">Status:</span>
                <span className="text-emerald-600 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full text-[10px]">Active</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold">Emp ID:</span>
                <span className="text-gray-900 font-mono text-[10px]">SRM-FAC-1004</span>
              </div>
            </div>
          </GlassCard>

          {/* Details & Allotted Subjects card */}
          <div className="md:col-span-2 flex flex-col gap-6">
            <GlassCard className="p-6 flex flex-col gap-5">
              <h3 className="font-display font-bold text-sm text-gray-900 border-b border-gray-100 pb-3">
                Official Faculty Particulars
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 sm:col-span-2">
                  <div className="w-9 h-9 rounded-full bg-[#8B1E3F]/10 text-[#8B1E3F] flex items-center justify-center shrink-0">
                    <Mail className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <span className="text-[9px] text-gray-400 block font-semibold">EMAIL</span>
                    <p className="text-xs font-bold text-gray-800">{facultyProfile.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 sm:col-span-2 border-t border-gray-100 pt-3">
                  <div className="w-9 h-9 rounded-full bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
                    <BookOpen className="w-4.5 h-4.5" />
                  </div>
                  <div className="flex-1">
                    <span className="text-[9px] text-gray-400 block font-semibold">DEPARTMENT (EDITABLE)</span>
                    <input
                      type="text"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full bg-gray-100/60 border border-transparent hover:border-gray-200 focus:border-[#8B1E3F] text-xs font-bold text-gray-800 px-2.5 py-1.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#8B1E3F]/30"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 sm:col-span-2 border-t border-gray-100 pt-3">
                  <div className="w-9 h-9 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                    <User className="w-4.5 h-4.5" />
                  </div>
                  <div className="flex-1">
                    <span className="text-[9px] text-gray-400 block font-semibold">PHONE NUMBER (EDITABLE)</span>
                    <input
                      type="text"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full bg-gray-100/60 border border-transparent hover:border-gray-200 focus:border-[#8B1E3F] text-xs font-bold text-gray-800 px-2.5 py-1.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#8B1E3F]/30"
                    />
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* Allotted Subjects Filtering & List */}
            <GlassCard className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4 mb-4">
                <div>
                  <h3 className="font-display font-bold text-base text-gray-900 flex items-center gap-2">
                    <BookOpenCheck className="w-5 h-5 text-[#8B1E3F]" /> Allotted Subjects
                  </h3>
                  <p className="text-xs text-gray-500 font-medium">Courses assigned to you for the selected term</p>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-2.5 items-center">
                  <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-xl border border-white/25">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider px-1">AY:</span>
                    <select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(e.target.value)}
                      className="text-xs font-bold text-gray-700 bg-transparent border-none focus:outline-none focus:ring-0 cursor-pointer"
                    >
                      <option value="2025-2026">2025-2026</option>
                      <option value="2024-2025">2024-2025</option>
                      <option value="2026-2027">2026-2027</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-xl border border-white/25">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider px-1">Sem:</span>
                    {[1, 2, 3].map((sem) => (
                      <button
                        key={sem}
                        onClick={() => setSelectedSem(sem)}
                        className={`text-[10px] font-bold px-2 py-1 rounded-lg transition-all ${
                          selectedSem === sem
                            ? 'bg-white text-[#8B1E3F] shadow-sm'
                            : 'text-gray-500 hover:text-gray-900'
                        }`}
                      >
                        S{sem}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Grid of filtered subjects */}
              {filteredSubjects.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 text-center bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                  <Filter className="w-8 h-8 text-gray-300 mb-2" />
                  <p className="text-xs font-bold text-gray-500">No subjects allotted</p>
                  <p className="text-[10px] text-gray-400 mt-1">There are no matching subjects assigned to your profile for Academic Year {selectedYear} and Semester {selectedSem}.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filteredSubjects.map((sub) => (
                    <div
                      key={sub.id}
                      className="p-4 bg-white/60 hover:bg-white rounded-2xl border border-white/40 flex flex-col justify-between h-36 transition-all group hover:shadow-sm"
                    >
                      <div>
                        <div className="flex justify-between items-start mb-1.5">
                          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider font-mono">{sub.code}</span>
                          <span className="text-[9px] font-bold bg-[#8B1E3F]/5 text-[#8B1E3F] px-2 py-0.5 rounded-full uppercase">
                            {sub.programme}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-gray-800 line-clamp-1 group-hover:text-[#8B1E3F] transition-colors">
                          {sub.name}
                        </h4>
                        <p className="text-[10px] text-gray-400 font-semibold mt-1">Year {sub.year} • Semester {sub.semester}</p>
                      </div>

                      <div className="flex justify-between items-center border-t border-gray-100 pt-2.5 mt-2">
                        <span className="text-[9px] font-bold text-gray-400">Timeline Progress: {sub.progress}%</span>
                        <button
                          onClick={() => {
                            if (onGoToSubject && onGoToScreen) {
                              onGoToSubject(sub.id);
                              onGoToScreen('faculty-subject-management');
                            }
                          }}
                          className="text-[10px] font-bold text-[#8B1E3F] flex items-center gap-0.5 hover:underline"
                        >
                          Configure Course <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </GlassCard>

            {/* Excel Student Roster Importer Card */}
            <GlassCard className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4 mb-4">
                <div>
                  <h3 className="font-display font-bold text-base text-gray-900 flex items-center gap-2">
                    <FileSpreadsheet className="w-5 h-5 text-[#8B1E3F]" /> Excel Student Importer
                  </h3>
                  <p className="text-xs text-gray-500 font-medium">Bulk register and enroll students via spreadsheet templates</p>
                </div>
                
                <button
                  onClick={handleDownloadTemplate}
                  className="px-4 py-2 border border-[#8B1E3F]/20 hover:border-[#8B1E3F]/40 bg-[#8B1E3F]/5 hover:bg-[#8B1E3F]/10 text-[11px] font-bold text-[#8B1E3F] rounded-full transition-all flex items-center gap-2"
                >
                  <Download className="w-3.5 h-3.5" /> Download Excel Template
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                <div className="flex flex-col gap-3">
                  <p className="text-xs text-gray-500 leading-relaxed font-medium">
                    Upload a completed student roster to instantly enroll them in your allotted academic session classes. Make sure columns match the downloaded layout template perfectly.
                  </p>
                  
                  {/* Select target class dropdown */}
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Target Course Semester</label>
                    <select
                      value={importTargetSubject}
                      onChange={(e) => setImportTargetSubject(e.target.value)}
                      className="w-full bg-gray-100 p-2.5 rounded-xl border border-transparent text-xs text-gray-700 font-bold focus:outline-none focus:ring-1 focus:ring-[#8B1E3F]/30"
                    >
                      <option value="">-- Choose Subject --</option>
                      {subjects.filter(s => facultyProfile.subjects.includes(s.id)).map(s => (
                        <option key={s.id} value={s.id}>{s.name} ({s.code} • Sem {s.semester})</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Upload Action Container */}
                <div className="p-4 bg-gray-50/50 rounded-2xl border border-white/20 flex flex-col gap-4">
                  {!isImporting && stagedStudents.length === 0 && (
                    <label className="border-2 border-dashed border-gray-200 hover:border-[#8B1E3F]/40 hover:bg-white/40 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all">
                      <input
                        type="file"
                        accept=".csv,.xlsx,.xls"
                        disabled={!importTargetSubject}
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <Upload className={`w-8 h-8 text-[#8B1E3F] ${!importTargetSubject ? 'opacity-30' : 'opacity-70'}`} />
                      <div className="text-center">
                        <span className="text-xs font-bold text-gray-700 block">Upload completed template</span>
                        <span className="text-[9px] text-gray-400">Supports .csv files</span>
                        {!importTargetSubject && <span className="text-[9px] text-red-500 block font-bold mt-1">Select a target subject first</span>}
                      </div>
                    </label>
                  )}

                  {/* Importing Loader */}
                  {isImporting && (
                    <div className="border border-gray-100 rounded-2xl p-4 bg-white/80 flex flex-col gap-2.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-gray-600 flex items-center gap-1.5">
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-[#8B1E3F]" />
                          Analyzing and registering roster...
                        </span>
                        <span className="font-bold text-[#8B1E3F]">{importProgress}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-[#8B1E3F] transition-all" 
                          style={{ width: `${importProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Errors */}
                  {importError && (
                    <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex gap-2 text-red-600">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <div className="text-[10px] font-semibold leading-relaxed">
                        {importError}
                      </div>
                    </div>
                  )}

                  {/* Staged results */}
                  {stagedStudents.length > 0 && (
                    <div className="flex flex-col gap-3">
                      <div className="p-3 bg-blue-50/50 border border-blue-100/50 rounded-xl flex items-center gap-2.5">
                        <div className="w-4 h-4 rounded-full bg-blue-500 text-white flex items-center justify-center text-[10px] font-bold">i</div>
                        <div>
                          <span className="text-xs font-bold text-blue-800 block">Spreadsheet data validated!</span>
                          <span className="text-[10px] text-blue-600 font-medium">Staged {stagedStudents.length} candidate entries.</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={handleCommitImport}
                          className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-full transition-all flex items-center justify-center gap-1 shadow-sm"
                        >
                          <Check className="w-3.5 h-3.5" /> Confirm & Import
                        </button>
                        <button
                          onClick={() => setStagedStudents([])}
                          className="px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-600 text-[11px] font-bold rounded-full transition-all"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Success Alert */}
                  {showImportSuccess && (
                    <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-700 text-[10px] font-bold text-center">
                      ✓ Student roster imported successfully and enrolled into subject database!
                    </div>
                  )}
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    );
  }

  // --- Student View (Original UI preserved exactly) ---
  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-display font-extrabold text-2xl text-gray-900 tracking-tight">Student Profile</h1>
        </div>
        
        <button
          onClick={() => {
            if (isEditingStudent) {
              setStudentSaveSuccess(true);
              setTimeout(() => setStudentSaveSuccess(false), 3000);
            }
            setIsEditingStudent(!isEditingStudent);
          }}
          className={`px-4.5 py-2 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-sm ${
            isEditingStudent 
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
              : 'bg-[#8B1E3F] hover:bg-[#a12349] text-white'
          }`}
        >
          {isEditingStudent ? (
            <>
              <Check className="w-4 h-4" /> Save Changes
            </>
          ) : (
            <>
              <Edit className="w-4 h-4" /> Edit Profile
            </>
          )}
        </button>
      </div>

      {studentSaveSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3 text-emerald-800 animate-fadeIn">
          <Check className="w-5 h-5 text-emerald-600 shrink-0" />
          <div className="text-xs font-semibold">
            Student profile updated successfully in cache database!
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* Profile Card Summary */}
        <GlassCard className="p-6 text-center flex flex-col items-center justify-center gap-4">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-500 to-pink-500 flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-black/10">
            {studentName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'AK'}
          </div>
          
          {isEditingStudent ? (
            <div className="w-full text-left">
              <label className="text-[9px] font-black uppercase text-gray-400 tracking-wider block mb-1">Student Name</label>
              <input 
                type="text" 
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 hover:border-gray-300 focus:border-[#8B1E3F] px-3 py-1.5 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#8B1E3F]/30"
              />
            </div>
          ) : (
            <div>
              <h2 className="font-display font-bold text-lg text-gray-900 leading-tight">{studentName}</h2>
              <p className="text-[10px] text-gray-500 font-semibold uppercase mt-0.5">Register: {studentRegNumber}</p>
            </div>
          )}

          <div className="w-full bg-gray-50/50 p-4.5 rounded-2xl border border-white/20 text-left text-xs text-gray-500 flex flex-col gap-3">
            <div>
              <span className="font-black text-gray-400 text-[9px] uppercase tracking-wider block mb-1">Course / Programme</span>
              <span className="text-gray-900 font-bold">{studentCourse}</span>
            </div>

            <div>
              <span className="font-black text-gray-400 text-[9px] uppercase tracking-wider block mb-1">Academic Year Level</span>
              {isEditingStudent ? (
                <select
                  value={studentYear}
                  onChange={(e) => setStudentYear(e.target.value)}
                  className="w-full bg-white border border-gray-200 p-1.5 rounded-xl text-xs font-bold text-gray-800 focus:outline-none"
                >
                  <option value="Year I">Year I</option>
                  <option value="Year II">Year II</option>
                  <option value="Year III">Year III</option>
                  <option value="Year IV">Year IV</option>
                </select>
              ) : (
                <span className="text-gray-900 font-bold">{studentYear}</span>
              )}
            </div>

            <div>
              <span className="font-black text-gray-400 text-[9px] uppercase tracking-wider block mb-1">Current Semester</span>
              {isEditingStudent ? (
                <select
                  value={studentSem}
                  onChange={(e) => setStudentSem(e.target.value)}
                  className="w-full bg-white border border-gray-200 p-1.5 rounded-xl text-xs font-bold text-gray-800 focus:outline-none"
                >
                  <option value="Semester 1">Semester 1</option>
                  <option value="Semester 2">Semester 2</option>
                  <option value="Semester 3">Semester 3</option>
                  <option value="Semester 4">Semester 4</option>
                  <option value="Semester 5">Semester 5</option>
                  <option value="Semester 6">Semester 6</option>
                  <option value="Semester 7">Semester 7</option>
                  <option value="Semester 8">Semester 8</option>
                </select>
              ) : (
                <span className="text-gray-900 font-bold">{studentSem}</span>
              )}
            </div>

            <div className="flex justify-between items-center border-t border-gray-100 pt-2.5 mt-1">
              <span className="font-bold text-gray-400">Enrollment Status:</span>
              <span className="text-emerald-600 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full text-[10px]">Active</span>
            </div>
          </div>
        </GlassCard>

        {/* Details card */}
        <div className="md:col-span-2 flex flex-col gap-6">
          <GlassCard className="p-6 flex flex-col gap-5">
            <h3 className="font-display font-bold text-sm text-gray-900 border-b border-gray-100 pb-3">
              Official University Particulars & Communications
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              
              {isEditingStudent ? (
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <label className="text-[9px] font-black uppercase text-gray-400 tracking-wider">Registration Number</label>
                  <input 
                    type="text" 
                    value={studentRegNumber}
                    onChange={(e) => setStudentRegNumber(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 hover:border-gray-300 focus:border-[#8B1E3F] px-3 py-2 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#8B1E3F]/30"
                  />
                </div>
              ) : null}

              <div className="flex items-center gap-3 sm:col-span-2">
                <div className="w-10 h-10 rounded-full bg-[#8B1E3F]/10 text-[#8B1E3F] flex items-center justify-center shrink-0">
                  <Mail className="w-4.5 h-4.5" />
                </div>
                <div className="flex-1">
                  <span className="text-[9px] text-gray-400 block font-semibold uppercase tracking-wider">EMAIL ID</span>
                  {isEditingStudent ? (
                    <input 
                      type="email" 
                      value={studentEmail}
                      onChange={(e) => setStudentEmail(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 hover:border-gray-300 focus:border-[#8B1E3F] px-3 py-1.5 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#8B1E3F]/30"
                    />
                  ) : (
                    <p className="text-xs font-black text-gray-800">{studentEmail}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 sm:col-span-2 border-t border-gray-100 pt-4">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                  <Phone className="w-4.5 h-4.5" />
                </div>
                <div className="flex-1">
                  <span className="text-[9px] text-gray-400 block font-semibold uppercase tracking-wider">PHONE NO.</span>
                  {isEditingStudent ? (
                    <input 
                      type="text" 
                      value={studentPhone}
                      onChange={(e) => setStudentPhone(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 hover:border-gray-300 focus:border-[#8B1E3F] px-3 py-1.5 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#8B1E3F]/30"
                    />
                  ) : (
                    <p className="text-xs font-black text-gray-800">{studentPhone}</p>
                  )}
                </div>
              </div>



            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
