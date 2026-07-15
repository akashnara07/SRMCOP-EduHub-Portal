import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, BookOpen, Play, Award, Users, BarChart3, Settings, 
  ChevronDown, ChevronRight, CheckCircle2, ShieldCheck, Sliders, 
  Trash2, Plus, Download, Upload, FileSpreadsheet, AlertCircle, FileText,
  Search, ExternalLink, Calendar, HelpCircle, Check, Loader2, Info, Edit, Layers, Library
} from 'lucide-react';
import GlassCard from '../GlassCard';
import CurriculumTabContent from './CurriculumTabContent';
import { Subject, Resource } from '../../types';
import { db } from '../../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { 
  getCurriculumDb, 
  saveCurriculumDb, 
  getTeachingResources, 
  saveTeachingResources, 
  getAppSubjects,
  compareCurriculumVersions,
  validateWorkbookWorksheets,
  parseCurriculumWorkbook,
  generateAndDownloadTemplate,
  MasterCurriculumDb,
  CourseInformation
} from '../../data/curriculumDb';
import * as XLSX from 'xlsx';

interface SubjectManagementProps {
  subject: Subject;
  onBack: () => void;
  onUpdateSubjectResources: (subjectId: string, updatedResources: Resource[]) => void;
  readOnly?: boolean;
}

interface EnrolledStudent {
  sNo: number;
  name: string;
  registerNumber: string;
  programme: string;
  attendance: number;
  gpa: number;
  status: 'Active' | 'Imported' | 'On Hold';
  sessionalI: number;
  sessionalII: number;
  sessionalIII: number;
}

export default function SubjectManagement({
  subject,
  onBack,
  onUpdateSubjectResources,
  readOnly = false,
}: SubjectManagementProps) {
  const [activeTab, setActiveTab] = useState<string>('overview');
  
  // Loaded Curriculum data matching the subject code
  const [curriculumDb, setCurriculumDb] = useState<MasterCurriculumDb>(getCurriculumDb());
  const [subjectInfo, setSubjectInfo] = useState<CourseInformation | undefined>(
    curriculumDb.courseInformation.find(c => c.subjectCode === subject.code)
  );

  useEffect(() => {
    const db = getCurriculumDb();
    setCurriculumDb(db);
    setSubjectInfo(db.courseInformation.find(c => c.subjectCode === subject.code));
  }, [subject.code]);

  // Curriculum elements
  const scopeText = curriculumDb.scope.find(s => s.subjectCode === subject.code)?.scopeStatement || 
    'Standard curriculum scope details are pending import.';
  const objectivesList = curriculumDb.objectives
    .filter(o => o.subjectCode === subject.code)
    .sort((a, b) => a.order - b.order);
  const outcomesList = curriculumDb.courseOutcomes
    .filter(co => co.subjectCode === subject.code);
  const unitsList = curriculumDb.units
    .filter(u => u.subjectCode === subject.code);
  const topicsList = curriculumDb.curriculumTopics
    .filter(t => t.subjectCode === subject.code);
  const recBooks = curriculumDb.recommendedBooks
    .filter(b => b.subjectCode === subject.code);
  const refBooks = curriculumDb.referenceBooks
    .filter(b => b.subjectCode === subject.code);
  const assessment = curriculumDb.assessmentPattern
    .find(a => a.subjectCode === subject.code);

  // Teaching workspace resources
  const [resources, setResources] = useState<Resource[]>([]);

  useEffect(() => {
    setResources(getTeachingResources(subject.code));
  }, [subject.code]);

  // Cohort student roster
  const [cohort, setCohort] = useState<EnrolledStudent[]>([
    { sNo: 1, name: 'J. Akash', registerNumber: 'SRM2026PH7810', programme: subject.programme, attendance: 92.4, gpa: 8.85, status: 'Active', sessionalI: 24, sessionalII: 25, sessionalIII: 23 },
    { sNo: 2, name: 'Meera Patel', registerNumber: 'SRM2026PH7812', programme: subject.programme, attendance: 88.5, gpa: 8.12, status: 'Active', sessionalI: 19, sessionalII: 22, sessionalIII: 20 },
    { sNo: 3, name: 'Rahul Sharma', registerNumber: 'SRM2026PH7815', programme: subject.programme, attendance: 95.0, gpa: 9.20, status: 'Active', sessionalI: 28, sessionalII: 29, sessionalIII: 28 },
    { sNo: 4, name: 'Anjali Rao', registerNumber: 'SRM2026PH7831', programme: subject.programme, attendance: 94.0, gpa: 8.75, status: 'Active', sessionalI: 26, sessionalII: 24, sessionalIII: 25 },
    { sNo: 5, name: 'Priyesh Sen', registerNumber: 'SRM2026PH7830', programme: subject.programme, attendance: 91.5, gpa: 8.20, status: 'Active', sessionalI: 22, sessionalII: 23, sessionalIII: 24 },
    { sNo: 6, name: 'Vignesh Nair', registerNumber: 'SRM2026PH7832', programme: subject.programme, attendance: 86.2, gpa: 7.90, status: 'Active', sessionalI: 18, sessionalII: 20, sessionalIII: 21 }
  ]);

  const [studentSearch, setStudentSearch] = useState('');
  const [resourceSearch, setResourceSearch] = useState('');
  const [toastMsg, setToastMsg] = useState('');
  const [showToast, setShowToast] = useState(false);

  // Accordion states
  const [expandedWorkspaceUnits, setExpandedWorkspaceUnits] = useState<Record<string, boolean>>({
    'Unit I': true
  });
  const [expandedWorkspaceTopics, setExpandedWorkspaceTopics] = useState<Record<string, boolean>>({});

  // Add Resource Dialog States
  const [showAddResourceModal, setShowAddResourceModal] = useState(false);
  const [selectedTopicCode, setSelectedTopicCode] = useState<string>('');
  const [selectedTopicUnit, setSelectedTopicUnit] = useState<string>('');
  const [resType, setResType] = useState<string>('Video');
  const [resTitle, setResTitle] = useState('');
  const [resDesc, setResDesc] = useState('');
  const [resMeta, setResMeta] = useState(''); // e.g. "45 mins" or "3.5 MB"
  const [resUrl, setResUrl] = useState('');

  // Excel Workbook Live Import States (within Settings Tab)
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isImportValidating, setIsImportValidating] = useState(false);
  const [validationProgress, setValidationProgress] = useState(0);
  const [validationChecklist, setValidationChecklist] = useState<Record<string, string>>({});
  const [parsedData, setParsedData] = useState<Omit<MasterCurriculumDb, 'importHistory'> | null>(null);
  const [diffSummary, setDiffSummary] = useState<any | null>(null);
  const [showOverwriteConfirm, setShowOverwriteConfirm] = useState(false);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 4000);
  };

  // Safe numeric average for sessional exams (best of 2 for Pharm.D, or regular average of s1 and s2 for B.Pharm)
  const calculateSessionalAvg = (s1: number, s2: number, s3: number, isPharmD: boolean): string => {
    if (!isPharmD) {
      return ((s1 + s2) / 2).toFixed(1);
    }
    const vals = [s1, s2, s3].sort((a, b) => b - a);
    return ((vals[0] + vals[1]) / 2).toFixed(1);
  };

  const getSemesterGrade = (avgStr: string): string => {
    const avg = parseFloat(avgStr) || 0;
    if (avg >= 26) return 'O';
    if (avg >= 23) return 'A+';
    if (avg >= 20) return 'A';
    if (avg >= 17) return 'B+';
    if (avg >= 14) return 'B';
    return 'C';
  };

  const handleMarkChange = (index: number, field: 'sessionalI' | 'sessionalII' | 'sessionalIII', value: string) => {
    const numVal = Math.min(30, Math.max(0, parseInt(value) || 0));
    const updated = [...cohort];
    updated[index] = {
      ...updated[index],
      [field]: numVal
    };
    setCohort(updated);
  };

  // Add a supplementary material into the Teaching Workspace attached to a specific topic
  const handleAddResourceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resTitle.trim() || !selectedTopicCode) return;

    const topic = topicsList.find(t => t.topicCode === selectedTopicCode);

    const newRes: Resource = {
      id: `res-added-${Date.now()}`,
      type: resType as any,
      title: resTitle.trim(),
      description: resDesc || `Supplementary resource for topic ${topic?.topicName || selectedTopicCode}`,
      status: 'not-started',
      unit: selectedTopicUnit || 'Unit I',
      topicCode: selectedTopicCode,
      url: resUrl || 'https://www.w3schools.com/html/mov_bbb.mp4'
    };

    if (resType === 'Video') {
      newRes.duration = resMeta || '45 mins';
    } else if (resType === 'PDF' || resType === 'Slides' || resType === 'Notes') {
      newRes.fileSize = resMeta || '2.4 MB';
    } else if (resType === 'Quiz') {
      newRes.questionsCount = parseInt(resMeta) || 10;
    }

    const updatedRes = [...resources, newRes];
    saveTeachingResources(subject.code, updatedRes);
    setResources(updatedRes);
    onUpdateSubjectResources(subject.code, updatedRes);

    // Clear and close
    setResTitle('');
    setResDesc('');
    setResMeta('');
    setResUrl('');
    setShowAddResourceModal(false);
    triggerToast(`Published material to topic ${selectedTopicCode} successfully.`);
  };

  const handleDeleteResource = (resId: string) => {
    const updatedRes = resources.filter(r => r.id !== resId);
    saveTeachingResources(subject.code, updatedRes);
    setResources(updatedRes);
    onUpdateSubjectResources(subject.code, updatedRes);
    triggerToast('Material removed from the Teaching Workspace.');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setParsedData(null);
      setDiffSummary(null);
    }
  };

  // Handles reading and validating the Excel workbook
  const handleStartImportValidation = () => {
    if (!selectedFile) return;

    setIsImportValidating(true);
    setValidationProgress(5);
    setValidationChecklist({
      courseInfo: 'pending',
      scope: 'pending',
      objectives: 'pending',
      courseOutcomes: 'pending',
      units: 'pending',
      curriculumTopics: 'pending',
      recommendedBooks: 'pending',
      referenceBooks: 'pending',
      assessmentPattern: 'pending'
    });

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });

        setTimeout(() => {
          setValidationProgress(40);
          const validation = validateWorkbookWorksheets(workbook);

          if (!validation.valid) {
            setIsImportValidating(false);
            alert(`Validation failed. Missing worksheets in workbook: ${validation.missingSheets.join(', ')}`);
            return;
          }

          setValidationChecklist(prev => ({ ...prev, courseInfo: 'success', scope: 'success', objectives: 'success' }));
          setValidationProgress(70);

          setTimeout(() => {
            const parsed = parseCurriculumWorkbook(workbook);
            const currentDb = getCurriculumDb();
            const diffs = compareCurriculumVersions(currentDb, parsed);

            setValidationChecklist({
              courseInfo: 'success',
              scope: 'success',
              objectives: 'success',
              courseOutcomes: 'success',
              units: 'success',
              curriculumTopics: 'success',
              recommendedBooks: 'success',
              referenceBooks: 'success',
              assessmentPattern: 'success'
            });
            setValidationProgress(100);
            setIsImportValidating(false);
            setParsedData(parsed);
            setDiffSummary(diffs);
          }, 600);

        }, 500);

      } catch (err) {
        setIsImportValidating(false);
        alert('An error occurred while parsing the Excel file. Please ensure it is a valid .xlsx file.');
      }
    };
    reader.readAsArrayBuffer(selectedFile);
  };

  // Commit parsed Excel data to our active database
  const handleConfirmImportOverwrite = () => {
    if (!parsedData) return;

    const currentDb = getCurriculumDb();
    
    // Merge new parsed worksheets, updating matching ones
    const newDb: MasterCurriculumDb = {
      courseInformation: [
        ...currentDb.courseInformation.filter(c => !parsedData.courseInformation.some(p => p.subjectCode === c.subjectCode)),
        ...parsedData.courseInformation
      ],
      scope: [
        ...currentDb.scope.filter(c => !parsedData.scope.some(p => p.subjectCode === c.subjectCode)),
        ...parsedData.scope
      ],
      objectives: [
        ...currentDb.objectives.filter(c => !parsedData.objectives.some(p => p.subjectCode === c.subjectCode)),
        ...parsedData.objectives
      ],
      courseOutcomes: [
        ...currentDb.courseOutcomes.filter(c => !parsedData.courseOutcomes.some(p => p.subjectCode === c.subjectCode)),
        ...parsedData.courseOutcomes
      ],
      units: [
        ...currentDb.units.filter(c => !parsedData.units.some(p => p.subjectCode === c.subjectCode)),
        ...parsedData.units
      ],
      curriculumTopics: [
        ...currentDb.curriculumTopics.filter(c => !parsedData.curriculumTopics.some(p => p.subjectCode === c.subjectCode)),
        ...parsedData.curriculumTopics
      ],
      recommendedBooks: [
        ...currentDb.recommendedBooks.filter(c => !parsedData.recommendedBooks.some(p => p.subjectCode === c.subjectCode)),
        ...parsedData.recommendedBooks
      ],
      referenceBooks: [
        ...currentDb.referenceBooks.filter(c => !parsedData.referenceBooks.some(p => p.subjectCode === c.subjectCode)),
        ...parsedData.referenceBooks
      ],
      assessmentPattern: [
        ...currentDb.assessmentPattern.filter(c => !parsedData.assessmentPattern.some(p => p.subjectCode === c.subjectCode)),
        ...parsedData.assessmentPattern
      ],
      importHistory: [
        {
          id: `h-${Date.now()}`,
          fileName: selectedFile?.name || 'Master_Import.xlsx',
          importedAt: new Date().toISOString(),
          importedBy: 'Academic Administrator',
          version: parsedData.courseInformation[0]?.importVersion || '1.0',
          summary: `Workbook update. Added ${diffSummary?.subjectsAdded.length || 0} subjects, updated ${diffSummary?.subjectsUpdated.length || 0} subjects.`
        },
        ...currentDb.importHistory
      ]
    };

    saveCurriculumDb(newDb);
    setCurriculumDb(newDb);
    setSubjectInfo(newDb.courseInformation.find(c => c.subjectCode === subject.code));
    
    // Reset states
    setSelectedFile(null);
    setParsedData(null);
    setDiffSummary(null);
    setShowOverwriteConfirm(false);
    triggerToast('Master curriculum workbook database successfully updated!');
  };

  const handleExportSyllabusToExcel = () => {
    const wb = XLSX.utils.book_new();

    // Export current subject info worksheets
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet([subjectInfo].filter(Boolean)), 'Course Information');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(curriculumDb.scope.filter(s => s.subjectCode === subject.code)), 'Scope');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(objectivesList), 'Objectives');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(outcomesList), 'Course Outcomes');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(unitsList), 'Units');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(topicsList), 'Curriculum Topics');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(recBooks), 'Recommended Books');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(refBooks), 'Reference Books');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet([assessment].filter(Boolean)), 'Assessment Pattern');

    XLSX.writeFile(wb, `${subject.code}_Curriculum_Syllabus.xlsx`);
    triggerToast('Syllabus workbook generated successfully!');
  };

  const handleDownloadRoster = () => {
    const isPharmD = subject.programme === 'Pharm.D';
    const csvContent = isPharmD
      ? "data:text/csv;charset=utf-8,S.No,Register Number,Name of Student,Programme,Sessional I,Sessional II,Sessional III,Average (Best of 2),Semester Grade\n"
        + cohort.map(s => {
          const avg = calculateSessionalAvg(s.sessionalI, s.sessionalII, s.sessionalIII, true);
          const grade = getSemesterGrade(avg);
          return `"${s.sNo}","${s.registerNumber}","${s.name}","${s.programme}",${s.sessionalI},${s.sessionalII},${s.sessionalIII},${avg},"${grade}"`;
        }).join("\n")
      : "data:text/csv;charset=utf-8,S.No,Register Number,Name of Student,Programme,Sessional I,Sessional II,Average,Semester Grade\n"
        + cohort.map(s => {
          const avg = calculateSessionalAvg(s.sessionalI, s.sessionalII, s.sessionalIII, false);
          const grade = getSemesterGrade(avg);
          return `"${s.sNo}","${s.registerNumber}","${s.name}","${s.programme}",${s.sessionalI},${s.sessionalII},${avg},"${grade}"`;
        }).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${subject.code}_Student_Cohort_Ledger.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast("Cohort roster sheet downloaded.");
  };

  const filteredCohort = cohort.filter(s => 
    s.name.toLowerCase().includes(studentSearch.toLowerCase()) || 
    s.registerNumber.toLowerCase().includes(studentSearch.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto px-4 md:px-6 relative">
      
      {/* Toast Alert */}
      {showToast && (
        <div className="fixed top-6 right-6 z-50 p-4 bg-emerald-50/95 backdrop-blur-md border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800 shadow-2xl animate-slideIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <div>
            <span className="text-xs font-black uppercase tracking-wider block">LMS Sync Active</span>
            <span className="text-[10px] font-semibold text-emerald-600 block mt-0.5">{toastMsg}</span>
          </div>
        </div>
      )}

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-r from-[#6b172f] via-[#8B1E3F] to-[#CD4368] p-8 text-white shadow-xl shadow-maroon-900/10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-white/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col gap-1.5">
            <button 
              onClick={onBack}
              className="flex items-center gap-2 text-pink-100 hover:text-white text-xs font-bold transition-all w-max mb-1.5 bg-white/10 hover:bg-white/15 px-3 py-1.5 rounded-full"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Curriculum Directory
            </button>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-pink-100 bg-white/10 px-3 py-1 rounded-full">
                PCI Subject Frame
              </span>
              <span className="text-xs font-mono font-bold bg-white/10 text-pink-150 px-2.5 py-0.5 rounded-full">
                {subject.code}
              </span>
              <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-100 border border-emerald-500/30 px-2.5 py-0.5 rounded-full uppercase font-mono">
                {subjectInfo?.status || 'Approved'}
              </span>
            </div>
            <h1 className="font-display font-extrabold text-2.5xl tracking-tight mt-1.5 leading-tight">
              {subjectInfo?.courseName || subject.name}
            </h1>
            <p className="text-xs text-pink-100/90 max-w-xl leading-relaxed font-medium mt-1">
              Active Syllabus: {subjectInfo?.regulation || 'PCI 2017'} — Year {subjectInfo?.year || subject.year}, Semester {subjectInfo?.semester || subject.semester}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="border-b border-gray-150/60 pb-1.5 flex flex-wrap gap-2">
        {[
          { id: 'overview', label: 'Overview', icon: BookOpen },
          { id: 'curriculum', label: 'Curriculum', icon: Sliders },
          { id: 'workspace', label: 'Teaching Workspace', icon: Play },
          { id: 'students', label: 'Students & Sessional Marks', icon: Users },
          { id: 'analytics', label: 'OBE Analytics', icon: BarChart3 }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={`
                px-5 py-3 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-all relative
                ${isActive 
                  ? 'bg-white text-[#8B1E3F] shadow-sm font-black border border-gray-150/40' 
                  : 'text-gray-500 hover:text-gray-800 hover:bg-white/50'
                }
              `}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-[#8B1E3F]' : 'text-gray-400'}`} />
              {tab.label}
              {isActive && (
                <div className="absolute bottom-[-2px] left-5 right-5 h-0.5 bg-[#8B1E3F] rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* Tabs panels */}
      <div className="min-h-[400px]">
        
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start animate-fadeIn">
            <div className="lg:col-span-2 flex flex-col gap-6">
              <GlassCard className="p-6">
                <h3 className="font-display font-bold text-base text-gray-900 mb-2">Subject Scope & Guidelines</h3>
                <p className="text-xs text-gray-600 leading-relaxed font-semibold">
                  {scopeText}
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5 pt-5 border-t border-gray-100 text-xs font-bold">
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <span className="text-[8px] font-black uppercase text-gray-400 block mb-0.5">LMS Credits</span>
                    <span className="text-gray-800">{subjectInfo?.credits || 4} Credits</span>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <span className="text-[8px] font-black uppercase text-gray-400 block mb-0.5">Syllabus Hours</span>
                    <span className="text-gray-800">{subjectInfo?.hours || 45} Lect. Hours</span>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <span className="text-[8px] font-black uppercase text-gray-400 block mb-0.5">Structure Type</span>
                    <span className="text-gray-800">{subjectInfo?.subjectType || 'Theory'} Class</span>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <span className="text-[8px] font-black uppercase text-gray-400 block mb-0.5">Faculty Lead</span>
                    <span className="text-gray-800">{subjectInfo?.facultyAssigned || 'Dr. V. Chitra'}</span>
                  </div>
                </div>
              </GlassCard>

              {/* Units summary cards list */}
              <div className="flex flex-col gap-3">
                <h3 className="font-display font-bold text-xs text-gray-900 pl-1 uppercase tracking-wider">Unit Milestones</h3>
                {unitsList.length > 0 ? (
                  unitsList.map((unit) => (
                    <div key={unit.unitCode} className="border border-gray-150/40 rounded-2xl p-4 bg-white flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#8B1E3F]/5 text-[#8B1E3F] font-black text-xs flex items-center justify-center shrink-0">
                          {unit.unitCode.split(' ')[1] || 'U'}
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-gray-800 uppercase tracking-wider">{unit.unitCode}: {unit.unitName}</h4>
                          <p className="text-[10px] font-semibold text-gray-400 uppercase mt-0.5">
                            {topicsList.filter(t => t.unitCode === unit.unitCode).length} Curriculum Topics Mapped
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-[#8B1E3F] font-mono bg-[#8B1E3F]/5 px-3 py-1 rounded-full shrink-0">
                        {unit.hours} Hours
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-xs text-gray-400 italic border border-dashed border-gray-200 rounded-2xl">
                    Syllabus units are pending curriculum Excel sheet import.
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-6">
              <GlassCard className="p-5 border border-gray-150/50 rounded-[24px]">
                <h4 className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-3 pb-2 border-b border-gray-100">
                  Faculty Assignments
                </h4>
                <div className="flex flex-col gap-2.5 text-xs font-semibold text-gray-600">
                  <div className="flex justify-between">
                    <span>Program:</span>
                    <span className="text-gray-800 font-extrabold">{subjectInfo?.programme || 'B.Pharm'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Regulation:</span>
                    <span className="text-gray-800 font-extrabold">{subjectInfo?.regulation || 'PCI 2017'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className="text-emerald-600 font-black uppercase">{subjectInfo?.status || 'Approved'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Class Size:</span>
                    <span className="text-gray-800 font-extrabold">{cohort.length} Registered</span>
                  </div>
                </div>
              </GlassCard>
            </div>
          </div>
        )}

        {/* TAB 2: CURRICULUM */}
        {activeTab === 'curriculum' && (
          <CurriculumTabContent 
            subject={subject} 
            readOnly={readOnly} 
            triggerToast={triggerToast} 
          />
        )}

        {/* TAB 3: TEACHING WORKSPACE (EDITABLE RESOURCE ALLOCATIONS) */}
        {activeTab === 'workspace' && (
          <div className="flex flex-col gap-5 animate-fadeIn">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="relative max-w-md w-full">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  placeholder="Search resources by title or keywords..."
                  value={resourceSearch}
                  onChange={(e) => setResourceSearch(e.target.value)}
                  className="w-full bg-white border border-gray-200/80 rounded-full pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#8B1E3F] focus:border-[#8B1E3F] font-semibold"
                />
              </div>

              <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl text-[11px] font-bold text-gray-500">
                LMS Hierarchy: Course Unit ➔ Curriculum Topic ➔ Supplemental Resources
              </div>
            </div>

            {/* Teaching workspace unit collapsibles */}
            <div className="flex flex-col gap-4">
              {unitsList.map((unit) => {
                const unitTopics = topicsList.filter(t => t.unitCode === unit.unitCode);
                const isUnitExpanded = expandedWorkspaceUnits[unit.unitCode];
                return (
                  <div key={unit.unitCode} className="border border-gray-100 rounded-2xl p-4 bg-white shadow-sm">
                    <div 
                      onClick={() => setExpandedWorkspaceUnits(prev => ({ ...prev, [unit.unitCode]: !prev[unit.unitCode] }))}
                      className="flex justify-between items-center cursor-pointer select-none pb-2 border-b border-gray-50"
                    >
                      <div className="flex items-center gap-3">
                        {isUnitExpanded ? <ChevronDown className="w-4 h-4 text-[#8B1E3F]" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                        <h4 className="text-xs font-black text-gray-800 uppercase tracking-wide">{unit.unitCode}: {unit.unitName}</h4>
                      </div>
                      <span className="text-[10px] font-bold bg-gray-50 border border-gray-100 text-gray-500 px-2.5 py-0.5 rounded-full font-mono">
                        {unitTopics.length} Topics
                      </span>
                    </div>

                    {isUnitExpanded && (
                      <div className="mt-4 flex flex-col gap-3 animate-fadeIn">
                        {unitTopics.map((topic) => {
                          const isTopicExpanded = expandedWorkspaceTopics[topic.topicCode];
                          const topicResources = resources.filter(r => r.topicCode === topic.topicCode && r.title.toLowerCase().includes(resourceSearch.toLowerCase()));
                          return (
                            <div key={topic.topicCode} className="border border-gray-50 bg-gray-50/20 rounded-xl p-3">
                              <div className="flex justify-between items-center select-none">
                                <div 
                                  onClick={() => setExpandedWorkspaceTopics(prev => ({ ...prev, [topic.topicCode]: !prev[topic.topicCode] }))}
                                  className="flex items-center gap-2 cursor-pointer"
                                >
                                  {isTopicExpanded ? <ChevronDown className="w-3.5 h-3.5 text-[#8B1E3F]" /> : <ChevronRight className="w-3.5 h-3.5 text-gray-400" />}
                                  <span className="text-xs font-bold text-gray-500 font-mono">{topic.topicCode}</span>
                                  <span className="text-xs font-black text-gray-800 line-clamp-1">{topic.topicName}</span>
                                </div>

                                <div className="flex items-center gap-2.5">
                                  <span className="text-[9px] font-bold bg-[#8B1E3F]/5 text-[#8B1E3F] border border-[#8B1E3F]/10 px-2 py-0.5 rounded font-mono">
                                    {topicResources.length} Materials
                                  </span>
                                  {!readOnly && (
                                    <button
                                      onClick={() => {
                                        setSelectedTopicCode(topic.topicCode);
                                        setSelectedTopicUnit(unit.unitCode);
                                        setResTitle('');
                                        setShowAddResourceModal(true);
                                      }}
                                      className="p-1 text-[#8B1E3F] hover:bg-[#8B1E3F]/10 rounded transition-all"
                                      title="Publish Supplementary Material"
                                    >
                                      <Plus className="w-4 h-4" />
                                    </button>
                                  )}
                                </div>
                              </div>

                              {isTopicExpanded && (
                                <div className="mt-3 pl-6 border-t border-gray-100 pt-3 flex flex-col gap-2 animate-fadeIn">
                                  {topicResources.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      {topicResources.map((res) => (
                                        <div key={res.id} className="p-4 bg-white border border-gray-150/40 rounded-2xl shadow-sm flex items-start justify-between gap-3">
                                          <div className="flex gap-3">
                                            <div className="w-8 h-8 rounded-full bg-maroon-500/10 text-[#8B1E3F] flex items-center justify-center shrink-0">
                                              {res.type === 'Video' ? <Play className="w-4 h-4 text-rose-500" /> : res.type === 'Quiz' ? <Check className="w-4 h-4 text-purple-500" /> : <FileText className="w-4 h-4 text-blue-500" />}
                                            </div>
                                            <div>
                                              <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">{res.type} Resource</span>
                                              <h5 className="text-xs font-black text-gray-800 leading-snug line-clamp-1">{res.title}</h5>
                                              <p className="text-[10px] text-gray-500 font-semibold leading-relaxed mt-0.5 line-clamp-1">{res.description}</p>
                                              <div className="flex gap-2.5 mt-2 text-[9px] font-bold text-gray-400">
                                                {res.duration && <span>Duration: {res.duration}</span>}
                                                {res.fileSize && <span>File: {res.fileSize}</span>}
                                                {res.questionsCount && <span>Questions: {res.questionsCount} MCQs</span>}
                                                {res.url && <a href={res.url} target="_blank" rel="noreferrer" className="text-[#8B1E3F] hover:underline flex items-center gap-0.5 shrink-0">Preview <ExternalLink className="w-2.5 h-2.5" /></a>}
                                              </div>
                                            </div>
                                          </div>
                                          {!readOnly && (
                                            <button
                                              onClick={() => handleDeleteResource(res.id)}
                                              className="p-1 text-gray-300 hover:text-red-600 transition-all"
                                              title="Delete resource material"
                                            >
                                              <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <span className="text-[11px] text-gray-400 font-bold italic block pl-2">
                                      {readOnly 
                                        ? 'No material attached to this subtopic yet. Please use Course Manager to upload the contents.' 
                                        : 'No material attached to this subtopic yet. Click "+" to upload study material.'}
                                    </span>
                                  )}
                                </div>
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

          </div>
        )}

        {/* TAB 4: STUDENTS AND SESSIONAL MARKS */}
        {activeTab === 'students' && (
          <div className="flex flex-col gap-6 animate-fadeIn">
            
            <div className="p-5 bg-white border border-gray-150/40 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
              <div>
                <h3 className="font-display font-bold text-base text-gray-900">Sessional Marks Ledger</h3>
                <p className="text-xs text-gray-500 mt-0.5">Edit continuous sessional marks for enrolled candidates. Marks are capped at maximum 30. Calculations automatically capture best of two exams.</p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text" 
                    placeholder="Filter students..."
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    className="bg-gray-50 border border-gray-200 rounded-full pl-8 pr-4 py-1.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#8B1E3F] w-48"
                  />
                </div>
                {!readOnly && (
                  <button
                    onClick={handleDownloadRoster}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-full transition-all flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" /> Export CSV
                  </button>
                )}
              </div>
            </div>

            <div className="bg-white border border-gray-150/50 rounded-3xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-gray-50/50 border-b border-gray-100 text-[10px] uppercase font-bold text-gray-400">
                      <th className="p-4 w-12 text-center">S.No</th>
                      <th className="p-4">Register Number</th>
                      <th className="p-4">Name of Student</th>
                      <th className="p-4">Programme</th>
                      <th className="p-4 text-center">Sessional I (30)</th>
                      <th className="p-4 text-center">Sessional II (30)</th>
                      {subject.programme === 'Pharm.D' && <th className="p-4 text-center">Sessional III (30)</th>}
                      <th className="p-4 text-center">{subject.programme === 'Pharm.D' ? 'Best of 2 Average' : 'Sessional Average'}</th>
                      <th className="p-4 text-right">Semester Grade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCohort.map((student, sIdx) => {
                      const isStudentPharmD = subject.programme === 'Pharm.D';
                      const avg = calculateSessionalAvg(student.sessionalI, student.sessionalII, student.sessionalIII || 0, isStudentPharmD);
                      const grade = getSemesterGrade(avg);
                      return (
                        <tr key={student.registerNumber} className="border-b border-gray-50 hover:bg-gray-50/30 transition-all font-semibold text-gray-700">
                          <td className="p-4 text-center text-gray-400">{student.sNo}</td>
                          <td className="p-4 font-mono text-[11px] font-bold text-gray-500">{student.registerNumber}</td>
                          <td className="p-4 text-gray-900 font-extrabold">{student.name}</td>
                          <td className="p-4 text-gray-500">{student.programme}</td>
                          <td className="p-4 text-center">
                            <input 
                              type="number"
                              min="0"
                              max="30"
                              disabled={readOnly}
                              value={student.sessionalI}
                              onChange={(e) => handleMarkChange(sIdx, 'sessionalI', e.target.value)}
                              className="w-12 bg-gray-50 border border-gray-200 rounded p-1 text-center font-mono font-bold text-xs focus:ring-1 focus:ring-[#8B1E3F] focus:bg-white disabled:opacity-75"
                            />
                          </td>
                          <td className="p-4 text-center">
                            <input 
                              type="number"
                              min="0"
                              max="30"
                              disabled={readOnly}
                              value={student.sessionalII}
                              onChange={(e) => handleMarkChange(sIdx, 'sessionalII', e.target.value)}
                              className="w-12 bg-gray-50 border border-gray-200 rounded p-1 text-center font-mono font-bold text-xs focus:ring-1 focus:ring-[#8B1E3F] focus:bg-white disabled:opacity-75"
                            />
                          </td>
                          {isStudentPharmD && (
                            <td className="p-4 text-center">
                              <input 
                                type="number"
                                min="0"
                                max="30"
                                disabled={readOnly}
                                value={student.sessionalIII || 0}
                                onChange={(e) => handleMarkChange(sIdx, 'sessionalIII', e.target.value)}
                                className="w-12 bg-gray-50 border border-gray-200 rounded p-1 text-center font-mono font-bold text-xs focus:ring-1 focus:ring-[#8B1E3F] focus:bg-white disabled:opacity-75"
                              />
                            </td>
                          )}
                          <td className="p-4 text-center font-mono font-black text-[#8B1E3F] text-sm">
                            {avg}
                          </td>
                          <td className="p-4 text-right">
                            <span className="px-2.5 py-1 rounded-full text-xs font-black bg-maroon-50 text-[#8B1E3F] border border-[#8B1E3F]/20">
                              {grade}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* TAB 5: OBE ANALYTICS (EXPRESSED ON SCALE LESS THAN 3.0) */}
        {activeTab === 'analytics' && (
          <div className="flex flex-col gap-6 animate-fadeIn">
            
            <div className="p-5 bg-white border border-gray-150/40 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
              <div>
                <h3 className="font-display font-bold text-base text-gray-900">Direct Course Outcome (CO) OBE Index</h3>
                <p className="text-xs text-gray-500 mt-0.5">Continuous Direct Attainment mapping is calculated on standard scale less than 3.0 (Low = 1, Moderate = 2, High = 3) according to statutory PCI/OBE rules.</p>
              </div>

              <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl text-xs font-black text-gray-500 uppercase font-mono">
                Attainment Scale Range: 0.00 to 3.00
              </div>
            </div>

            {/* Direct Attainment grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              <GlassCard className="lg:col-span-2 p-6">
                <h4 className="font-display font-bold text-sm text-gray-900 uppercase tracking-wider mb-4">Syllabus Outcome-Based Education (OBE) Attainment Matrix</h4>
                
                <div className="overflow-x-auto border border-gray-100 rounded-2xl">
                  <table className="w-full text-left border-collapse text-[11px] font-semibold text-gray-700">
                    <thead>
                      <tr className="bg-gray-50/50 border-b border-gray-100 text-[9px] uppercase font-bold text-gray-400">
                        <th className="p-3">Student Candidate</th>
                        <th className="p-3 text-center">Internal Target (Scale 3.0)</th>
                        <th className="p-3 text-center">Internal Attainment Achieved (/3.0)</th>
                        <th className="p-3 text-center">Semester Target (Scale 3.0)</th>
                        <th className="p-3 text-center">Semester Attainment Achieved (/3.0)</th>
                        <th className="p-3 text-right">OBE Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cohort.map((student) => {
                        const isStudentPharmD = subject.programme === 'Pharm.D';
                        const avg = calculateSessionalAvg(student.sessionalI, student.sessionalII, student.sessionalIII || 0, isStudentPharmD);
                        const intAtt = (parseFloat(avg) / 30 * 3.0).toFixed(2);
                        const semAtt = (student.gpa / 10 * 3.0).toFixed(2);
                        const isExceeded = parseFloat(intAtt) >= 2.4 && parseFloat(semAtt) >= 2.4;
                        
                        return (
                          <tr key={student.registerNumber} className="border-b border-gray-50 hover:bg-gray-50/30 transition-all">
                            <td className="p-3">
                              <span className="font-extrabold text-gray-900 block">{student.name}</span>
                              <span className="text-[9.5px] text-[#8B1E3F] font-mono font-bold leading-tight">{student.registerNumber}</span>
                            </td>
                            <td className="p-3 text-center font-mono text-gray-500">2.00</td>
                            <td className="p-3 text-center font-mono font-black text-emerald-600">{intAtt}</td>
                            <td className="p-3 text-center font-mono text-gray-500">2.00</td>
                            <td className="p-3 text-center font-mono font-black text-emerald-600">{semAtt}</td>
                            <td className="p-3 text-right">
                              <span className={`text-[8px] font-black px-2.5 py-0.5 rounded-full uppercase ${
                                isExceeded 
                                  ? 'bg-blue-50 text-blue-600' 
                                  : 'bg-emerald-50 text-emerald-600'
                              }`}>
                                {isExceeded ? 'Target Exceeded' : 'Target Met'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </GlassCard>

              {/* Attainment scorecard summaries */}
              <div className="flex flex-col gap-4">
                <GlassCard className="p-5 flex flex-col gap-3">
                  <h4 className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2 pb-2 border-b border-gray-100">
                    Cohort Performance KPIs
                  </h4>

                  <div className="flex flex-col gap-3">
                    <div className="p-3 bg-gray-50 rounded-xl">
                      <span className="text-[8px] font-black text-gray-400 block uppercase mb-0.5">Continuous Internal Assessment Level</span>
                      <div className="flex justify-between items-baseline">
                        <span className="text-xl font-black text-gray-900">2.50 / 3.0</span>
                        <span className="text-[9px] text-emerald-600 font-extrabold uppercase bg-emerald-50 px-2 py-0.5 rounded">Level 3 (High)</span>
                      </div>
                    </div>

                    <div className="p-3 bg-gray-50 rounded-xl">
                      <span className="text-[8px] font-black text-gray-400 block uppercase mb-0.5">End-Semester Exam Attainment Level</span>
                      <div className="flex justify-between items-baseline">
                        <span className="text-xl font-black text-gray-900">2.40 / 3.0</span>
                        <span className="text-[9px] text-emerald-600 font-extrabold uppercase bg-emerald-50 px-2 py-0.5 rounded">Level 3 (High)</span>
                      </div>
                    </div>

                    <div className="p-3 bg-[#8B1E3F]/5 rounded-xl border border-[#8B1E3F]/15">
                      <span className="text-[8px] font-black text-[#8B1E3F] block uppercase mb-0.5">Direct Overall Subject Mapped index</span>
                      <div className="flex justify-between items-baseline">
                        <span className="text-xl font-black text-[#8B1E3F]">2.43 / 3.0</span>
                        <span className="text-[9px] text-pink-700 font-black uppercase bg-[#8B1E3F]/10 px-2 py-0.5 rounded">Met</span>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </div>

            </div>

          </div>
        )}

        {/* TAB 6: SYLLABUS SETTINGS (WORKBOOK IMPORTS & HISTORY EXPORTS) */}
        {activeTab === 'settings' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start animate-fadeIn">
            
            <div className="lg:col-span-2 flex flex-col gap-6">
              
              {/* Premium Drag & Drop Workbook Import Workspace */}
              <GlassCard className="p-6">
                <h3 className="font-display font-bold text-base text-gray-900">Excel Curriculum Workbook Import</h3>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  Upload the 9-worksheet Master Curriculum Excel file. This will automatically update/generate corresponding course structures, learning syllabus matrices, book lists, outcomes, and assessment schemes.
                </p>

                <div className="mt-5 border-2 border-dashed border-gray-200 hover:border-[#8B1E3F]/30 bg-gray-50/50 p-6 rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer relative group transition-all">
                  <input 
                    type="file" 
                    accept=".xlsx,.xls"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <Upload className="w-8 h-8 text-gray-400 group-hover:text-[#8B1E3F] mb-3 transition-all" />
                  <span className="text-xs font-black text-gray-800 uppercase tracking-wide">Drag & Drop or Browse file</span>
                  <span className="text-[10px] text-gray-400 mt-1 font-semibold uppercase">Supported formats: Microsoft Excel (.xlsx, .xls)</span>
                </div>

                {selectedFile && !isImportValidating && (
                  <div className="mt-4 p-3 bg-[#8B1E3F]/5 border border-[#8B1E3F]/15 rounded-xl flex justify-between items-center text-xs font-bold">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="w-5 h-5 text-[#8B1E3F]" />
                      <div>
                        <span className="text-gray-800 block truncate max-w-[200px]">{selectedFile.name}</span>
                        <span className="text-[9px] text-gray-400 font-black uppercase font-mono">{(selectedFile.size / 1024).toFixed(1)} KB</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setSelectedFile(null)}
                        className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-[10px]"
                      >
                        Clear
                      </button>
                      <button 
                        onClick={handleStartImportValidation}
                        className="px-3.5 py-1.5 bg-[#8B1E3F] hover:bg-[#a12349] text-white rounded-full text-[10px] shadow"
                      >
                        Verify & Parse
                      </button>
                    </div>
                  </div>
                )}

                {isImportValidating && (
                  <div className="mt-5 flex flex-col gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100 animate-pulse">
                    <div className="flex justify-between text-xs font-black text-gray-700">
                      <span>Validating Excel Sheets Integrity...</span>
                      <span>{validationProgress}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[#8B1E3F] to-[#CD4368]" style={{ width: `${validationProgress}%` }} />
                    </div>
                  </div>
                )}

                {/* Differential Comparison Log Display */}
                {diffSummary && parsedData && (
                  <div className="mt-5 border border-pink-900/10 bg-pink-50/5 p-4 rounded-2xl flex flex-col gap-3">
                    <h4 className="text-xs font-black uppercase text-gray-900 flex items-center gap-1.5">
                      <Sliders className="w-4 h-4 text-[#8B1E3F]" />
                      Syllabus Overwrite Differential Preview
                    </h4>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs font-bold text-gray-600">
                      <div className="p-3 bg-white border border-gray-100 rounded-xl">
                        <span className="text-[8px] text-gray-400 block uppercase">Added Courses</span>
                        <span className="text-gray-800 font-mono text-sm">{diffSummary.subjectsAdded.length} Mapped</span>
                      </div>
                      <div className="p-3 bg-white border border-gray-100 rounded-xl">
                        <span className="text-[8px] text-gray-400 block uppercase">Modified Courses</span>
                        <span className="text-gray-800 font-mono text-sm">{diffSummary.subjectsUpdated.length} Checked</span>
                      </div>
                      <div className="p-3 bg-white border border-gray-100 rounded-xl">
                        <span className="text-[8px] text-gray-400 block uppercase">Outcomes & Units Updated</span>
                        <span className="text-gray-800 font-mono text-sm">{(diffSummary.unitsUpdated.length + diffSummary.objectivesUpdated.length)} Changes</span>
                      </div>
                    </div>

                    <div className="p-3 bg-gray-900 text-[10px] font-mono text-gray-300 rounded-xl max-h-32 overflow-y-auto">
                      <div>&gt; _ Verifying 9 schemas: Course Information, Scope, Objectives, Outcomes, Units, Topics...</div>
                      <div>&gt; _ Excel worksheets read successfully. Status: OK.</div>
                      {diffSummary.subjectsAdded.map((c: string) => <div key={c} className="text-emerald-400">[NEW SUBJECT] {c} detected.</div>)}
                      {diffSummary.subjectsUpdated.map((c: string) => <div key={c} className="text-amber-400">[UPDATE DETAILS] {c} modified.</div>)}
                      {diffSummary.unitsUpdated.map((c: string) => <div key={c} className="text-pink-400">[UPDATE UNITS] {c} syllabus structure updated.</div>)}
                      <div>&gt; _ System is ready to overwrite existing local schemas.</div>
                    </div>

                    <div className="flex justify-end gap-2.5 border-t border-gray-100 pt-3 mt-1">
                      <button 
                        onClick={() => { setDiffSummary(null); setParsedData(null); setSelectedFile(null); }}
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-full transition-all"
                      >
                        Discard
                      </button>
                      <button 
                        onClick={() => setShowOverwriteConfirm(true)}
                        className="px-4 py-2 bg-[#8B1E3F] hover:bg-[#a12349] text-white text-xs font-bold rounded-full transition-all shadow"
                      >
                        Overwrite & Apply Curriculum
                      </button>
                    </div>
                  </div>
                )}
              </GlassCard>

              {/* History list */}
              <div className="flex flex-col gap-3">
                <h3 className="font-display font-bold text-xs text-gray-900 pl-1 uppercase tracking-wider">Excel Workbook Import History</h3>
                {curriculumDb.importHistory.map((hist) => (
                  <div key={hist.id} className="p-4 bg-white border border-gray-150/40 rounded-2xl shadow-sm text-xs text-gray-600 font-semibold">
                    <div className="flex justify-between font-bold mb-1">
                      <span className="text-[#8B1E3F] truncate max-w-[180px]">{hist.fileName}</span>
                      <span className="text-[10px] font-mono text-gray-400 uppercase">Version v{hist.version}</span>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1 leading-relaxed">{hist.summary}</p>
                    <div className="flex justify-between text-[8px] font-black uppercase text-gray-400 border-t border-gray-100 pt-2.5 mt-2.5 font-mono">
                      <span>By: {hist.importedBy}</span>
                      <span>{new Date(hist.importedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>

            </div>

            {/* Side column: Actions & Schemes */}
            <div className="flex flex-col gap-6">
              <GlassCard className="p-5 flex flex-col gap-4">
                <h4 className="text-xs font-black uppercase tracking-wider text-gray-900 border-b border-gray-100 pb-2">
                  Compliance Templates
                </h4>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={generateAndDownloadTemplate}
                    className="w-full text-left p-3 bg-[#8B1E3F]/5 border border-[#8B1E3F]/15 rounded-xl hover:bg-[#8B1E3F]/10 transition-all text-xs font-black uppercase tracking-wide text-[#8B1E3F] flex items-center justify-between"
                  >
                    <span>Download Master Template</span>
                    <Download className="w-4 h-4" />
                  </button>
                  <p className="text-[10px] text-gray-400 font-bold leading-normal">
                    Generates a standard compliant 9-worksheet PCI syllabus template with pre-mapped code indices for instant workbook uploads.
                  </p>
                </div>

                <div className="flex flex-col gap-2 pt-2 border-t border-gray-100">
                  <button
                    onClick={handleExportSyllabusToExcel}
                    className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all text-xs font-black uppercase tracking-wide text-gray-700 flex items-center justify-between border border-gray-200"
                  >
                    <span>Export Mapped Syllabus</span>
                    <FileSpreadsheet className="w-4 h-4" />
                  </button>
                </div>
              </GlassCard>
            </div>

          </div>
        )}

      </div>

      {/* Overwrite Confirmation Dialog */}
      {showOverwriteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <GlassCard className="max-w-md w-full p-6 border border-red-200 shadow-2xl animate-scaleIn">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-black text-gray-900 uppercase tracking-wide">Overwrite Syllabus Database?</h4>
                <p className="text-xs text-gray-600 leading-relaxed font-semibold mt-2">
                  This action will overwrite existing active courses, outcomes, unit structures, and study books with the newly loaded workbook data. This is irreversible and changes will instantly sync across Student & Faculty interfaces.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2.5 mt-5 border-t border-gray-100 pt-4">
              <button 
                onClick={() => setShowOverwriteConfirm(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-full transition-all"
              >
                No, Cancel
              </button>
              <button 
                onClick={handleConfirmImportOverwrite}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-full transition-all shadow-md shadow-red-950/15"
              >
                Yes, Overwrite Schemas
              </button>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Add Supplementary Resource Modal */}
      {showAddResourceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <GlassCard className="max-w-lg w-full p-6 border border-gray-150 shadow-2xl animate-scaleIn">
            <h3 className="font-display font-black text-base text-gray-900 mb-1 flex items-center gap-2">
              <Play className="w-5 h-5 text-[#8B1E3F]" />
              Publish Materials to Topic {selectedTopicCode}
            </h3>
            <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wide border-b border-gray-100 pb-3 mb-4">
              Teaching Workspace — LMS supplemental materials stream
            </p>

            <form onSubmit={handleAddResourceSubmit} className="flex flex-col gap-4 text-xs font-bold text-gray-700">
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-[10px] uppercase tracking-wide mb-1">Resource Category</label>
                  <select 
                    value={resType}
                    onChange={(e) => setResType(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 focus:ring-1 focus:ring-[#8B1E3F] outline-none"
                  >
                    <option value="Video">Video Lecture</option>
                    <option value="PDF">PDF Notes</option>
                    <option value="Slides">PowerPoint / Slides</option>
                    <option value="Notes">Faculty Notes</option>
                    <option value="Quiz">Interactive Quiz</option>
                    <option value="Assignment">Assignment Task</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-400 text-[10px] uppercase tracking-wide mb-1">Duration / File Size / MCQ count</label>
                  <input 
                    type="text"
                    required
                    placeholder={resType === 'Video' ? 'e.g. 45 mins' : resType === 'Quiz' ? 'e.g. 10 MCQs' : 'e.g. 4.2 MB'}
                    value={resMeta}
                    onChange={(e) => setResMeta(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 focus:ring-1 focus:ring-[#8B1E3F] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 text-[10px] uppercase tracking-wide mb-1">Material Title</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Structure & Histology of Osseous Tissues"
                  value={resTitle}
                  onChange={(e) => setResTitle(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 focus:ring-1 focus:ring-[#8B1E3F] outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-400 text-[10px] uppercase tracking-wide mb-1">Study Description</label>
                <textarea 
                  placeholder="Key concepts, homework topics, or slide notes references..."
                  rows={3}
                  value={resDesc}
                  onChange={(e) => setResDesc(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 focus:ring-1 focus:ring-[#8B1E3F] outline-none font-semibold text-gray-600"
                />
              </div>

              <div>
                <label className="block text-gray-400 text-[10px] uppercase tracking-wide mb-1">Access URL / Resource Link</label>
                <input 
                  type="text"
                  placeholder="e.g. https://www.w3schools.com/html/mov_bbb.mp4"
                  value={resUrl}
                  onChange={(e) => setResUrl(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 focus:ring-1 focus:ring-[#8B1E3F] outline-none"
                />
              </div>

              <div className="flex justify-end gap-2.5 border-t border-gray-100 pt-4 mt-2">
                <button 
                  type="button"
                  onClick={() => setShowAddResourceModal(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-full transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-[#8B1E3F] hover:bg-[#a12349] text-white text-xs font-bold rounded-full transition-all shadow"
                >
                  Publish Material
                </button>
              </div>

            </form>
          </GlassCard>
        </div>
      )}

    </div>
  );
}
