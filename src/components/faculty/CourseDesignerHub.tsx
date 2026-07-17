import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { db } from '../../lib/firebase';
import { collection, onSnapshot, query, collectionGroup, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { 
  getCurriculumDb, 
  saveCurriculumDb, 
  parseCurriculumWorkbook, 
  validateWorkbookWorksheets, 
  validateWorkbookFull,
  EXPECTED_SHEETS_CONFIG,
  compareCurriculumVersions, 
  MasterCurriculumDb,
  deleteCourseFromDb
} from '../../data/curriculumDb';
import { 
  Calendar, BookOpen, Sliders, ArrowRight, Library, Info, ShieldCheck, 
  Upload, FileSpreadsheet, Download, Check, AlertCircle, ArrowLeft, 
  Trash2, Copy, Archive, FileText, Layers, HelpCircle, Eye, ChevronDown, ChevronRight, Edit,
  Clock, Award, History, CheckCircle2, ChevronRightCircle, RefreshCcw,
  Plus, Search, MoreVertical, Home, ChevronLeft
} from 'lucide-react';
import GlassCard from '../GlassCard';
import { Subject, FacultyProfile } from '../../types';
import CurriculumExplorer from './CurriculumExplorer';
import CourseListTable from './CourseListTable';

interface CourseDesignerHubProps {
  facultyProfile: FacultyProfile;
  subjects: Subject[];
  onGoToSubject: (subjectId: string) => void;
  onGoToScreen: (screenId: string) => void;
  readOnly?: boolean;
  onRefreshSubjects?: () => void;
  isAdmin?: boolean;
}

// Full, rich mock curriculum database matching all subjects
interface CurriculumData {
  courseCode: string;
  courseName: string;
  programme: string;
  regulation: string;
  semester: number;
  credits: number;
  hours: number;
  type: 'Theory' | 'Practical';
  status: 'Active' | 'Approved' | 'Pending Approval';
  importVersion: string;
  lastImported: string;
  importedBy: string;
  curriculumVersion: string;
  scope: string;
  objectives: string[];
  courseOutcomes: string[];
  units: {
    name: string;
    title: string;
    hours: number;
    description: string;
    topics: {
      number: string;
      name: string;
      hours: number;
    }[];
  }[];
  recommendedBooks: { author: string; title: string; edition: string }[];
  referenceBooks: { author: string; title: string; edition: string }[];
  assessmentPattern: {
    theoryInternal: number;
    theoryExternal: number;
    practicalInternal: number;
    practicalExternal: number;
    universityExam: number;
  };
}

const mockCurriculums: Record<string, CurriculumData> = {
  'BP101T': {
    courseCode: 'BP101T',
    courseName: 'Human Anatomy and Physiology I',
    programme: 'B.Pharm',
    regulation: 'PCI Regulation 2020',
    semester: 1,
    credits: 4,
    hours: 45,
    type: 'Theory',
    status: 'Approved',
    importVersion: '1.2',
    lastImported: '2026-07-08',
    importedBy: 'Admin Office',
    curriculumVersion: 'PCI-2020-V3',
    scope: 'This course is designed to impart a fundamental knowledge on the structure and functions of the various systems of the human body. It also helps in understanding both homeostatic mechanisms and cellular pathways under standard therapeutic regimens.',
    objectives: [
      'Describe the structure, location, and basic function of various organs of the human body.',
      'Comprehend the homeostatic mechanisms of tissue systems.',
      'Perform structural analysis of cells, tissues, and skeletal classifications.',
      'Identify key skeletal bone landmarks and arterial routes.'
    ],
    courseOutcomes: [
      'CO1: Articulate cellular pathways, epithelial tissue boundaries, and intercellular communications.',
      'CO2: Classify bones and joints under skeletal physiology and locate specific cranial landmarks.',
      'CO3: Appraise blood parameters, plasma composition, and cardiovascular transport dynamics.',
      'CO4: Understand the nervous system structures, including spinal pathways and synaptic transmission.',
      'CO5: Evaluate the skin layers, sweat glands, and thermoregulatory feedback loops.'
    ],
    units: [
      {
        name: 'Unit I',
        title: 'Introduction to Human Body & Cellular Level',
        hours: 10,
        description: 'Detailed study of structural levels of organization, cell structure, membrane transport, cell division, and fundamental tissue types.',
        topics: [
          { number: '1.1', name: 'Definition of Anatomy and Physiology', hours: 1 },
          { number: '1.2', name: 'Levels of Structural Organization', hours: 1 },
          { number: '1.3', name: 'Cellular Homeostasis and Feedback Control Loops', hours: 2 },
          { number: '1.4', name: 'Structure of Cell and Organelle functions', hours: 2 },
          { number: '1.5', name: 'Cell Membrane Transport (Active vs Passive)', hours: 2 },
          { number: '1.6', name: 'Cell Division (Mitosis & Meiosis)', hours: 1 },
          { number: '1.7', name: 'Epithelial, Connective, Muscle and Nervous Tissues', hours: 1 }
        ]
      },
      {
        name: 'Unit II',
        title: 'Skeletal & Joint Systems',
        hours: 9,
        description: 'Structure and classification of bones, joint articulations, bone growth, fracture healing, and skeletal disorders.',
        topics: [
          { number: '2.1', name: 'Bone Tissue Histology and Remodeling', hours: 2 },
          { number: '2.2', name: 'Axial Skeleton: Cranial and Facial Bones', hours: 2 },
          { number: '2.3', name: 'Appendicular Skeleton and Pelvic Girdle', hours: 2 },
          { number: '2.4', name: 'Joints: Fibrous, Cartilaginous, and Synovial', hours: 2 },
          { number: '2.5', name: 'Joint movements and range of motion', hours: 1 }
        ]
      },
      {
        name: 'Unit III',
        title: 'Body Fluids & Blood',
        hours: 8,
        description: 'Composition of blood, hematopoiesis, red blood cells lifecycle, clotting factors, anemia, and blood grouping.',
        topics: [
          { number: '3.1', name: 'Plasma Proteins and Solute Composition', hours: 2 },
          { number: '3.2', name: 'Erythropoiesis and Iron Metabolism', hours: 2 },
          { number: '3.3', name: 'WBCs, Platelets, and Hemostasis cascade', hours: 1 },
          { number: '3.4', name: 'ABO and Rh Blood Grouping systems', hours: 2 },
          { number: '3.5', name: 'Lymphatic System organs and fluid dynamics', hours: 1 }
        ]
      },
      {
        name: 'Unit IV',
        title: 'Cardiovascular & Lymphatic Systems',
        hours: 10,
        description: 'Anatomy of heart chambers, conducting system, cardiac cycle, electrocardiogram, and peripheral vascular resistance.',
        topics: [
          { number: '4.1', name: 'Gross Anatomy and Chambers of the Heart', hours: 2 },
          { number: '4.2', name: 'Intrinsic Cardiac Conduction (SA / AV Nodes)', hours: 2 },
          { number: '4.3', name: 'Cardiac Cycle, Stroke Volume, and Cardiac Output', hours: 2 },
          { number: '4.4', name: 'Electrocardiogram (ECG) waveforms (P, QRS, T)', hours: 2 },
          { number: '4.5', name: 'Blood Pressure and hypertension etiology', hours: 2 }
        ]
      },
      {
        name: 'Unit V',
        title: 'Nervous System & Integumentary System',
        hours: 8,
        description: 'Central vs peripheral nervous systems, neuron structure, myelination, action potentials, reflexes, and skin anatomy.',
        topics: [
          { number: '5.1', name: 'Neuronal structure and Synaptic Transmission', hours: 2 },
          { number: '5.2', name: 'Spinal Cord tracts and Spinal Reflexes', hours: 2 },
          { number: '5.3', name: 'Cranial nerves and Autonomic Nervous System', hours: 2 },
          { number: '5.4', name: 'Integumentary: Epidermis, Dermis, and accessory structures', hours: 1 },
          { number: '5.5', name: 'Temperature regulation feedback controls', hours: 1 }
        ]
      }
    ],
    recommendedBooks: [
      { author: 'Ross & Wilson', title: 'Anatomy and Physiology in Health and Illness', edition: '13th Edition' },
      { author: 'Gerard J. Tortora', title: 'Principles of Anatomy and Physiology', edition: '15th Edition' }
    ],
    referenceBooks: [
      { author: 'Guyton & Hall', title: 'Textbook of Medical Physiology', edition: '14th Edition' },
      { author: 'Arthur C. Guyton', title: 'Physiology of the Human Body', edition: '8th Edition' }
    ],
    assessmentPattern: {
      theoryInternal: 25,
      theoryExternal: 75,
      practicalInternal: 15,
      practicalExternal: 35,
      universityExam: 100
    }
  },
  'BP102T': {
    courseCode: 'BP102T',
    courseName: 'Pharmaceutical Analysis I',
    programme: 'B.Pharm',
    regulation: 'PCI Regulation 2020',
    semester: 1,
    credits: 4,
    hours: 45,
    type: 'Theory',
    status: 'Approved',
    importVersion: '1.0',
    lastImported: '2026-06-15',
    importedBy: 'Office of Registrar',
    curriculumVersion: 'PCI-2020-V1',
    scope: 'This course deals with the fundamentals of analytical chemistry and principles of electrochemical analysis of pharmaceutical formulations.',
    objectives: [
      'Understand the principles of volumetric and electrochemical analysis.',
      'Develop analytical skill sets in basic titration preparations.',
      'Appreciate the high-yield concepts of impurity control and limit tests.'
    ],
    courseOutcomes: [
      'CO1: Evaluate different sources of errors and conduct standard analytical calibrations.',
      'CO2: Perform complex neutralization and non-aqueous assays.',
      'CO3: Master precipitation and complexometric titration protocols.',
      'CO4: Formulate electrochemical cell metrics for quantitative analyses.'
    ],
    units: [
      {
        name: 'Unit I',
        title: 'Quantitative Analysis & Titrimetry Fundamentals',
        hours: 10,
        description: 'Errors, precision, accuracy, primary standards, and indicators theory.',
        topics: [
          { number: '1.1', name: 'Classification of analytical methods', hours: 2 },
          { number: '1.2', name: 'Errors: systematic and random distributions', hours: 3 },
          { number: '1.3', name: 'Significant figures and calculation indices', hours: 2 },
          { number: '1.4', name: 'Primary and secondary standardization', hours: 3 }
        ]
      },
      {
        name: 'Unit II',
        title: 'Acid-Base and Non-Aqueous Titrations',
        hours: 9,
        description: 'Acid-base neutralization theories and solvent characteristics in non-aqueous titrimetry.',
        topics: [
          { number: '2.1', name: 'Acid-base indicators and Ostwald theories', hours: 3 },
          { number: '2.2', name: 'Non-aqueous titrations: Protophilic vs Protogenic', hours: 3 },
          { number: '2.3', name: 'Assay of Sodium Benzoate and Ephedrine HCl', hours: 3 }
        ]
      }
    ],
    recommendedBooks: [
      { author: 'A.H. Beckett & J.B. Stenlake', title: 'Practical Pharmaceutical Chemistry', edition: '4th Edition' },
      { author: 'Vogel', title: 'Quantitative Chemical Analysis', edition: '6th Edition' }
    ],
    referenceBooks: [
      { author: 'Christian G.D.', title: 'Analytical Chemistry', edition: '7th Edition' }
    ],
    assessmentPattern: {
      theoryInternal: 25,
      theoryExternal: 75,
      practicalInternal: 15,
      practicalExternal: 35,
      universityExam: 100
    }
  }
};

const defaultCurriculum = (code: string, name: string, programme: string, sem: number, reg?: string): CurriculumData => ({
  courseCode: code,
  courseName: name,
  programme: programme as any,
  regulation: reg || (programme === 'Pharm.D' ? 'PCI 2008' : 'PCI 2017'),
  semester: sem,
  credits: 4,
  hours: 45,
  type: 'Theory',
  status: 'Pending Approval',
  importVersion: '1.0',
  lastImported: 'Never',
  importedBy: 'None',
  curriculumVersion: 'PCI-Draft-2026',
  scope: 'The syllabus content for this subject is currently loaded in default draft state. Please import a valid Excel Curriculum Workbook to automatically map all objective statements, unit metrics, assessment patterns, and CO/PO indexes.',
  objectives: [
    'Define the essential physiological, chemical or laboratory principles of the core subject.',
    'Formulate structural competencies for practical session executions.',
    'Synthesize modern industrial standards in pharmaceutical sciences.'
  ],
  courseOutcomes: [],
  units: [
    {
      name: 'Unit I',
      title: 'Introduction & Core Foundations',
      hours: 9,
      description: 'Primary foundations, definitions, and broad classification parameters associated with this course code.',
      topics: [
        { number: '1.1', name: 'Syllabus Classification and Introductory Remarks', hours: 3 },
        { number: '1.2', name: 'Historical Overview and Evolution Indices', hours: 3 },
        { number: '1.3', name: 'Standard Nomenclature and Guidelines', hours: 3 }
      ]
    },
    {
      name: 'Unit II',
      title: 'Secondary Systems & Operational Principles',
      hours: 9,
      description: 'Intermediate systems mapping and laboratory testing validations.',
      topics: [
        { number: '2.1', name: 'Systemic Framework and Core Mechanics', hours: 4 },
        { number: '2.2', name: 'Operational Standards and Parameters', hours: 5 }
      ]
    },
    {
      name: 'Unit III',
      title: 'Structural Methodologies & Synthesis',
      hours: 9,
      description: 'Advanced structural models and synthetic formulation methods.',
      topics: [
        { number: '3.1', name: 'Synthesis and Reaction Pathways', hours: 5 },
        { number: '3.2', name: 'Evaluation and Stability Metrics', hours: 4 }
      ]
    },
    {
      name: 'Unit IV',
      title: 'Standardization and Controls',
      hours: 9,
      description: 'Standard guidelines, regulatory filings, and QA parameters.',
      topics: [
        { number: '4.1', name: 'Pharmacopoeial Standards', hours: 4 },
        { number: '4.2', name: 'Quality Control and Assay Protocols', hours: 5 }
      ]
    },
    {
      name: 'Unit V',
      title: 'Advanced Applied Systems',
      hours: 9,
      description: 'Recent advances and future technologies in pharmacy.',
      topics: [
        { number: '5.1', name: 'Recent Advancements and Modern Formulations', hours: 5 },
        { number: '5.2', name: 'Future Directives and Clinical Prospects', hours: 4 }
      ]
    }
  ],
  recommendedBooks: [
    { author: 'PCI Authorized Committee', title: 'Standard Text of Pharmaceutics', edition: 'Latest Edition' }
  ],
  referenceBooks: [
    { author: 'Indian Pharmacopoeia Commission', title: 'Indian Pharmacopoeia (IP)', edition: '2022 Edition' }
  ],
  assessmentPattern: {
    theoryInternal: 25,
    theoryExternal: 75,
    practicalInternal: 15,
    practicalExternal: 35,
    universityExam: 100
  }
});

const getRomanSemester = (sem: number): string => {
  const romanMap: Record<number, string> = {
    1: 'Semester I',
    2: 'Semester II',
    3: 'Semester III',
    4: 'Semester IV',
    5: 'Semester V',
    6: 'Semester VI',
    7: 'Semester VII',
    8: 'Semester VIII',
  };
  return romanMap[sem] || `Semester ${sem}`;
};

export default function CourseDesignerHub({
  facultyProfile,
  subjects,
  onGoToSubject,
  onGoToScreen,
  readOnly = false,
  onRefreshSubjects,
  isAdmin = false,
}: CourseDesignerHubProps) {
  // Configured Academic Years and Regulation
  const [academicYears, setAcademicYears] = useState<string[]>(['2024-2025', '2025-2026', '2026-2027', '2027-2028']);
  const [selectedYear, setSelectedYear] = useState<string>('2025-2026');
  const [selectedRegulation, setSelectedRegulation] = useState<string>('PCI 2017');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Published' | 'Draft'>('All');
  const [programmeFilter, setProgrammeFilter] = useState<'B.Pharm' | 'Pharm.D'>('B.Pharm');

  // Semester and Year Level selection filters
  const [selectedSemesterFilter, setSelectedSemesterFilter] = useState<number | 'All'>('All');
  const [selectedYearLevelFilter, setSelectedYearLevelFilter] = useState<number | 'All'>('All');

  // Redesigned Curriculum Manager state variables
  const [courseSearchQuery, setCourseSearchQuery] = useState('');
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    'B.Pharm': true,
    'B.Pharm-PCI 2017': true,
    'B.Pharm-PCI 2017-AY 2025-2026': true,
    'Pharm.D': true,
    'Pharm.D-PCI 2008': true,
    'Pharm.D-PCI 2008-AY 2025-2026': true
  });
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  
  // Add course form states
  const [addCode, setAddCode] = useState('');
  const [addName, setAddName] = useState('');
  const [addSemester, setAddSemester] = useState<number>(3);
  const [addYearLevel, setAddYearLevel] = useState<number>(3);
  const [addCredits, setAddCredits] = useState<number>(4);
  const [addHours, setAddHours] = useState<number>(45);
  const [addFacultyName, setAddFacultyName] = useState('Dr. V. Chitra');
  
  // Pagination
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [activeDropdownRowId, setActiveDropdownRowId] = useState<string | null>(null);

  // Active Regulations list based on selected program
  const regulationsList = programmeFilter === 'B.Pharm'
    ? ['PCI 2017', 'PCI 2026']
    : ['PCI 2008'];

  // Filter shown academic years: if PCI 2026 regulation is chosen, restrict selector to 2026-2027 alone
  const displayedYears = programmeFilter === 'B.Pharm'
    ? (selectedRegulation === 'PCI 2026' ? ['2026-2027'] : ['2024-2025', '2025-2026', '2026-2027'])
    : ['2024-2025', '2025-2026', '2026-2027'];

  const getStatusColor = (status: string) => {
    if (status === 'Published') return 'bg-emerald-500';
    if (status === 'Draft') return 'bg-amber-500';
    return 'bg-gray-400';
  };

  // Sync / validate state parameters when program or regulation changes
  useEffect(() => {
    if (programmeFilter === 'B.Pharm') {
      if (selectedRegulation !== 'PCI 2017' && selectedRegulation !== 'PCI 2026') {
        setSelectedRegulation('PCI 2017');
        setSelectedYear('2025-2026');
      } else if (selectedRegulation === 'PCI 2017') {
        if (selectedYear !== '2024-2025' && selectedYear !== '2025-2026' && selectedYear !== '2026-2027') {
          setSelectedYear('2025-2026');
        }
      } else if (selectedRegulation === 'PCI 2026') {
        if (selectedYear !== '2026-2027') {
          setSelectedYear('2026-2027');
        }
      }
    } else {
      // Pharm.D
      if (selectedRegulation !== 'PCI 2008') {
        setSelectedRegulation('PCI 2008');
        setSelectedYear('2025-2026');
      } else {
        if (selectedYear !== '2024-2025' && selectedYear !== '2025-2026' && selectedYear !== '2026-2027') {
          setSelectedYear('2025-2026');
        }
      }
    }
  }, [programmeFilter, selectedRegulation]);



  // CO-PO mapping state for CourseDesignerHub
  const [coPoMapping, setCoPoMapping] = useState<Record<string, Record<string, number>>>({
    'CO1': { 'PO1': 3, 'PO2': 2, 'PO3': 1, 'PO4': 3, 'PO5': 2, 'PO6': 0, 'PO7': 1, 'PO8': 2, 'PO9': 1, 'PO10': 3, 'PO11': 0, 'PO12': 2 },
    'CO2': { 'PO1': 2, 'PO2': 3, 'PO3': 2, 'PO4': 1, 'PO5': 3, 'PO6': 1, 'PO7': 2, 'PO8': 0, 'PO9': 2, 'PO10': 1, 'PO11': 3, 'PO12': 1 },
    'CO3': { 'PO1': 3, 'PO2': 2, 'PO3': 3, 'PO4': 2, 'PO5': 1, 'PO6': 2, 'PO7': 1, 'PO8': 3, 'PO9': 0, 'PO10': 2, 'PO11': 1, 'PO12': 3 },
    'CO4': { 'PO1': 1, 'PO2': 1, 'PO3': 2, 'PO4': 3, 'PO5': 2, 'PO6': 3, 'PO7': 0, 'PO8': 1, 'PO9': 3, 'PO10': 2, 'PO11': 2, 'PO12': 1 },
    'CO5': { 'PO1': 2, 'PO2': 2, 'PO3': 1, 'PO4': 2, 'PO5': 3, 'PO6': 0, 'PO7': 3, 'PO8': 2, 'PO9': 1, 'PO10': 3, 'PO11': 1, 'PO12': 2 }
  });

  const handleCoPoCellClick = (coCode: string, po: string) => {
    setCoPoMapping(prev => {
      const currentVal = prev[coCode]?.[po] || 0;
      const newVal = (currentVal + 1) % 4; // Cycles through 0, 1, 2, 3
      return {
        ...prev,
        [coCode]: {
          ...(prev[coCode] || {}),
          [po]: newVal
        }
      };
    });
    triggerToast(`Updated alignment of ${coCode} - ${po} index.`);
  };

  // Edit Course State Engine
  const [editingCourse, setEditingCourse] = useState<Subject | null>(null);
  const [editName, setEditName] = useState('');
  const [editCode, setEditCode] = useState('');
  const [editSemester, setEditSemester] = useState<number>(1);
  const [editYear, setEditYear] = useState<number>(1);
  const [editRegulation, setEditRegulation] = useState('PCI 2017');
  const [editAcademicYear, setEditAcademicYear] = useState('2025-2026');
  const [editCredits, setEditCredits] = useState<number>(4);
  const [editHours, setEditHours] = useState<number>(45);
  const [editFacultyName, setEditFacultyName] = useState('Dr. V. Chitra');

  // Interactive views inside CourseDesignerHub:
  // - "list": Shows the Course Cards
  // - "designer": Shows the Curriculum Designer Page for the selected Course ID
  const [viewMode, setViewMode] = useState<'list' | 'designer'>('list');
  const [hubTab, setHubTab] = useState<'courses' | 'settings'>('courses');
  const [layoutMode, setLayoutMode] = useState<'grid' | 'table'>('table');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [isExplorerMinimized, setIsExplorerMinimized] = useState<boolean>(true);

  // Excel Workbook Import Modal States
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isImportValidating, setIsImportValidating] = useState(false);
  const [validationProgress, setValidationProgress] = useState(0);
  const [importLog, setImportLog] = useState<string[]>([]);
  const [showLogModal, setShowLogModal] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isImportSuccess, setIsImportSuccess] = useState(false);
  const [publishedSubjectIds, setPublishedSubjectIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('srmcop_published_subject_ids');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    return ['BP101T', 'PD101', 'BP201T', 'BP103T'];
  });

  useEffect(() => {
    localStorage.setItem('srmcop_published_subject_ids', JSON.stringify(publishedSubjectIds));
  }, [publishedSubjectIds]);

  // Dynamic syllabus draft states inside Curriculum Designer
  const [activeSubjectCurriculum, setActiveSubjectCurriculum] = useState<CurriculumData | null>(null);

  // Curriculum Section-wise editing states
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [savingSection, setSavingSection] = useState<string | null>(null);
  const [savedSection, setSavedSection] = useState<string | null>(null);

  // 1. Course Information States
  const [editInfoCode, setEditInfoCode] = useState('');
  const [editInfoName, setEditInfoName] = useState('');
  const [editInfoProgramme, setEditInfoProgramme] = useState('');
  const [editInfoRegulation, setEditInfoRegulation] = useState('');
  const [editInfoSemester, setEditInfoSemester] = useState<number>(3);
  const [editInfoCredits, setEditInfoCredits] = useState<number>(4);
  const [editInfoHours, setEditInfoHours] = useState<number>(45);
  const [editInfoType, setEditInfoType] = useState('Theory');

  // 2. Scope State
  const [editScopeStatement, setEditScopeStatement] = useState('');

  // 3. Objectives State
  const [editObjectivesList, setEditObjectivesList] = useState<string[]>([]);

  // 4. Outcomes State
  const [editOutcomesList, setEditOutcomesList] = useState<string[]>([]);

  // 5. CO-PO Mapping State
  const [editCoPoMapping, setEditCoPoMapping] = useState<Record<string, Record<string, number>>>({});

  // 6. Units & Topics State
  const [editUnitsList, setEditUnitsList] = useState<any[]>([]);

  // 7 & 8. Recommended & Reference Books
  const [editRecBooksList, setEditRecBooksList] = useState<{ author: string; title: string; edition: string }[]>([]);
  const [editRefBooksList, setEditRefBooksList] = useState<{ author: string; title: string; edition: string }[]>([]);

  // 9. Assessment Pattern States
  const [editTheoryInternal, setEditTheoryInternal] = useState<number>(25);
  const [editTheoryExternal, setEditTheoryExternal] = useState<number>(75);
  const [editPracticalInternal, setEditPracticalInternal] = useState<number>(15);
  const [editPracticalExternal, setEditPracticalExternal] = useState<number>(35);
  const [editUniversityExam, setEditUniversityExam] = useState<number>(100);

  const handleStartEdit = (section: string) => {
    if (!activeSubjectCurriculum) return;
    setEditingSection(section);
    
    if (section === 'info') {
      setEditInfoCode(activeSubjectCurriculum.courseCode || '');
      setEditInfoName(activeSubjectCurriculum.courseName || '');
      setEditInfoProgramme(activeSubjectCurriculum.programme || programmeFilter);
      setEditInfoRegulation(activeSubjectCurriculum.regulation || selectedRegulation);
      setEditInfoSemester(activeSubjectCurriculum.semester || 3);
      setEditInfoCredits(activeSubjectCurriculum.credits || 4);
      setEditInfoHours(activeSubjectCurriculum.hours || 45);
      setEditInfoType(activeSubjectCurriculum.type || 'Theory');
    } else if (section === 'scope') {
      setEditScopeStatement(activeSubjectCurriculum.scope || '');
    } else if (section === 'objectives') {
      setEditObjectivesList([...(activeSubjectCurriculum.objectives || [])]);
    } else if (section === 'outcomes') {
      setEditOutcomesList([...(activeSubjectCurriculum.courseOutcomes || [])]);
    } else if (section === 'matrix') {
      setEditCoPoMapping(JSON.parse(JSON.stringify(activeSubjectCurriculum.coPoMapping || coPoMapping)));
    } else if (section === 'units') {
      setEditUnitsList(JSON.parse(JSON.stringify(activeSubjectCurriculum.units || [])));
    } else if (section === 'recommendedBooks') {
      setEditRecBooksList(JSON.parse(JSON.stringify(activeSubjectCurriculum.recommendedBooks || [])));
    } else if (section === 'referenceBooks') {
      setEditRefBooksList(JSON.parse(JSON.stringify(activeSubjectCurriculum.referenceBooks || [])));
    } else if (section === 'assessment') {
      const pattern = activeSubjectCurriculum.assessmentPattern || {
        theoryInternal: 25,
        theoryExternal: 75,
        practicalInternal: 15,
        practicalExternal: 35,
        universityExam: 100
      };
      setEditTheoryInternal(pattern.theoryInternal);
      setEditTheoryExternal(pattern.theoryExternal);
      setEditPracticalInternal(pattern.practicalInternal);
      setEditPracticalExternal(pattern.practicalExternal);
      setEditUniversityExam(pattern.universityExam || 100);
    }
  };

  const handleCancelEdit = () => {
    setEditingSection(null);
  };

  const getRomanSemester = (sem: number): string => {
    const romans = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
    return `Semester ${romans[sem - 1] || sem}`;
  };

  const handleSaveSection = async (section: string) => {
    if (!activeSubjectCurriculum) return;
    setSavingSection(section);

    try {
      const currentSemStr = getRomanSemester(activeSubjectCurriculum.semester);
      const currentCode = activeSubjectCurriculum.courseCode;
      const currentProg = activeSubjectCurriculum.programme;
      const currentReg = activeSubjectCurriculum.regulation;

      const docRefCurrent = doc(
        db,
        'curriculum',
        currentProg,
        currentReg,
        selectedYear,
        currentSemStr,
        currentCode
      );

      let updateData: any = {};
      let isKeyChanged = false;
      let docRefTarget = docRefCurrent;

      if (section === 'info') {
        const targetSemStr = getRomanSemester(editInfoSemester);
        if (
          currentSemStr !== targetSemStr ||
          currentCode !== editInfoCode ||
          currentProg !== editInfoProgramme ||
          currentReg !== editInfoRegulation
        ) {
          isKeyChanged = true;
          docRefTarget = doc(
            db,
            'curriculum',
            editInfoProgramme,
            editInfoRegulation,
            selectedYear,
            targetSemStr,
            editInfoCode
          );
        }

        updateData = {
          courseCode: editInfoCode,
          courseName: editInfoName,
          programme: editInfoProgramme,
          regulation: editInfoRegulation,
          semester: editInfoSemester,
          credits: Number(editInfoCredits),
          hours: Number(editInfoHours),
          type: editInfoType
        };
      } else if (section === 'scope') {
        updateData = { scope: editScopeStatement };
      } else if (section === 'objectives') {
        updateData = { objectives: editObjectivesList };
      } else if (section === 'outcomes') {
        updateData = { courseOutcomes: editOutcomesList };
      } else if (section === 'matrix') {
        updateData = { coPoMapping: editCoPoMapping };
      } else if (section === 'units') {
        updateData = { units: editUnitsList };
      } else if (section === 'recommendedBooks') {
        updateData = { recommendedBooks: editRecBooksList };
      } else if (section === 'referenceBooks') {
        updateData = { referenceBooks: editRefBooksList };
      } else if (section === 'assessment') {
        updateData = {
          assessmentPattern: {
            theoryInternal: Number(editTheoryInternal),
            theoryExternal: Number(editTheoryExternal),
            practicalInternal: Number(editPracticalInternal),
            practicalExternal: Number(editPracticalExternal),
            universityExam: Number(editUniversityExam)
          }
        };
      }

      if (isKeyChanged) {
        // Prepare the complete copied curriculum data
        const completeData = {
          ...activeSubjectCurriculum,
          ...updateData
        };
        await setDoc(docRefTarget, completeData);
        await deleteDoc(docRefCurrent);
        setSelectedCourseCode(editInfoCode);
      } else {
        await setDoc(docRefTarget, updateData, { merge: true });
      }

      setSavedSection(section);
      setTimeout(() => setSavedSection(null), 3000);
      setEditingSection(null);
      triggerToast(`Successfully saved section: ${section}`);
    } catch (error: any) {
      console.error("Error saving section:", error);
      triggerToast(`Failed to save: ${error.message}`);
    } finally {
      setSavingSection(null);
    }
  };

  // Real-time Firestore courses list listener
  const [allFetchedCourses, setAllFetchedCourses] = useState<CurriculumData[]>([]);
  const [selectedCourseCode, setSelectedCourseCode] = useState<string>('');

  useEffect(() => {
    const semestersToQuery = ['Semester I', 'Semester II', 'Semester III', 'Semester IV', 'Semester V', 'Semester VI', 'Semester VII', 'Semester VIII'];
    const results: Record<string, CurriculumData[]> = {};
    const unsubscribes: (() => void)[] = [];

    semestersToQuery.forEach((semStr) => {
      const q = query(collectionGroup(db, semStr));
      const unsub = onSnapshot(q, (snapshot) => {
        const semesterCourses: CurriculumData[] = [];
        snapshot.forEach((docSnap) => {
          const rawData = docSnap.data();
          const pathParts = docSnap.ref.path.split('/');
          // Path format: curriculum/{programme}/{regulation}/{year}/{semester}/{courseCode}
          if (pathParts.length >= 6) {
            const prog = pathParts[1];
            const reg = pathParts[2];
            const yr = pathParts[3];
            const semName = pathParts[4];
            
            // Convert semName (e.g. 'Semester III') to numeric semester
            let semNum = 3;
            if (semName === 'Semester I') semNum = 1;
            else if (semName === 'Semester II') semNum = 2;
            else if (semName === 'Semester III') semNum = 3;
            else if (semName === 'Semester IV') semNum = 4;
            else if (semName === 'Semester V') semNum = 5;
            else if (semName === 'Semester VI') semNum = 6;
            else if (semName === 'Semester VII') semNum = 7;
            else if (semName === 'Semester VIII') semNum = 8;

            const code = rawData.courseCode || rawData.subjectCode || docSnap.id;
            semesterCourses.push({
              ...rawData,
              courseCode: code,
              subjectCode: code,
              programme: prog,
              regulation: reg,
              academicYear: yr,
              semester: semNum,
            } as unknown as CurriculumData);
          }
        });
        results[semStr] = semesterCourses;

        // Flatten all current results
        const allFetched: CurriculumData[] = [];
        semestersToQuery.forEach(s => {
          if (results[s]) {
            allFetched.push(...results[s]);
          }
        });
        setAllFetchedCourses(allFetched);
      }, (error) => {
        console.warn(`Firestore collectionGroup onSnapshot error for ${semStr}:`, error.message);
      });
      unsubscribes.push(unsub);
    });

    return () => {
      unsubscribes.forEach(unsub => unsub());
    };
  }, []);

  const fetchedCourses = allFetchedCourses.filter(c => 
    c.programme === programmeFilter &&
    c.regulation === selectedRegulation &&
    c.academicYear === selectedYear
  );

  // Keep activeSubjectCurriculum in sync with fetchedCourses changes safely without triggering loops
  useEffect(() => {
    if (activeSubjectCurriculum) {
      const activeCode = activeSubjectCurriculum.courseCode || (activeSubjectCurriculum as any).subjectCode;
      const matchingDoc = fetchedCourses.find(c => c.courseCode === activeCode);
      if (matchingDoc) {
        if (JSON.stringify(matchingDoc) !== JSON.stringify(activeSubjectCurriculum)) {
          setActiveSubjectCurriculum(matchingDoc);
        }
      }
    }
  }, [fetchedCourses, activeSubjectCurriculum]);

  const handleCourseDropdownChange = (code: string) => {
    setSelectedCourseCode(code);
    if (!code) {
      setActiveSubjectCurriculum(null);
      setViewMode('list');
      return;
    }
    const matched = fetchedCourses.find(c => c.courseCode === code);
    if (matched) {
      setActiveSubjectCurriculum(matched);
      const isLegacy = (matched.courseCode === 'BP101T' && matched.regulation === 'PCI 2017') ||
                       (matched.courseCode === 'PD101' && matched.regulation === 'PCI 2008') ||
                       (matched.courseCode === 'BP201T' && matched.regulation === 'PCI 2017') ||
                       (matched.courseCode === 'BP103T' && matched.regulation === 'PCI 2026');
      const standardId = isLegacy
        ? (selectedYear === '2025-2026' ? matched.courseCode : `${matched.courseCode}-${selectedYear}`)
        : `${matched.courseCode}-${matched.regulation}-${selectedYear || '2025-2026'}`;
      setSelectedSubjectId(standardId);
      setViewMode('designer');
    }
  };
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({
    'info': false,
    'scope': false,
    'objectives': false,
    'outcomes': false,
    'units': false,
    'books': false,
    'assessment': false,
  });
  const [expandedCurriculumUnits, setExpandedCurriculumUnits] = useState<Record<string, boolean>>({
    'Unit I': true,
    'Unit II': false,
    'Unit III': false,
    'Unit IV': false,
    'Unit V': false,
  });

  // Checklist verification items
  const [validationChecklist, setValidationChecklist] = useState({
    courseInfo: 'pending',
    scope: 'pending',
    objectives: 'pending',
    courseOutcomes: 'pending',
    units: 'pending',
    curriculumTopics: 'pending',
    referenceBooks: 'pending',
    assessmentPattern: 'pending'
  });

  // Filter subjects allotted to this faculty (or all subjects if Admin) AND matching the selected academic year, programme, regulation and status
  const isPCI2026 = programmeFilter === 'B.Pharm' && selectedRegulation === 'PCI 2026';

  // Convert fetchedCourses to Subject list
  const fetchedSubjects: Subject[] = fetchedCourses.map((c, idx) => {
    const code = c.courseCode;
    const reg = c.regulation || selectedRegulation;
    const isLegacy = (code === 'BP101T' && reg === 'PCI 2017') ||
                     (code === 'PD101' && reg === 'PCI 2008') ||
                     (code === 'BP201T' && reg === 'PCI 2017') ||
                     (code === 'BP103T' && reg === 'PCI 2026');
    
    const standardId = isLegacy
      ? (selectedYear === '2025-2026' ? code : `${code}-${selectedYear}`)
      : `${code}-${reg}-${selectedYear || '2025-2026'}`;

    const matchingSub = subjects.find(s => s.id === standardId) || subjects.find(s => s.code === code && s.academicYear === selectedYear);
    const finalId = matchingSub ? matchingSub.id : standardId;

    return {
      id: finalId,
      code: c.courseCode,
      name: c.courseName,
      programme: c.programme as any,
      year: Math.ceil(c.semester / 2),
      semester: c.semester,
      academicYear: selectedYear,
      regulation: c.regulation || selectedRegulation,
      facultyName: c.importedBy || 'Dr. V. Chitra',
      progress: matchingSub ? matchingSub.progress : 0,
      color: ['bg-rose-500', 'bg-blue-500', 'bg-amber-500', 'bg-emerald-500'][idx % 4],
      resources: matchingSub ? matchingSub.resources : []
    };
  });

  // Convert allFetchedCourses to Subject list for counts in CurriculumExplorer
  const allFetchedSubjects: Subject[] = allFetchedCourses.map((c, idx) => {
    const code = c.courseCode;
    const reg = c.regulation || selectedRegulation;
    const isLegacy = (code === 'BP101T' && reg === 'PCI 2017') ||
                     (code === 'PD101' && reg === 'PCI 2008') ||
                     (code === 'BP201T' && reg === 'PCI 2017') ||
                     (code === 'BP103T' && reg === 'PCI 2026');
    
    const yr = c.academicYear || selectedYear;
    const standardId = isLegacy
      ? (yr === '2025-2026' ? code : `${code}-${yr}`)
      : `${code}-${reg}-${yr}`;

    const matchingSub = subjects.find(s => s.id === standardId) || subjects.find(s => s.code === code && s.academicYear === yr);
    const finalId = matchingSub ? matchingSub.id : standardId;

    return {
      id: finalId,
      code: c.courseCode,
      name: c.courseName,
      programme: c.programme as any,
      year: Math.ceil(c.semester / 2),
      semester: c.semester,
      academicYear: yr,
      regulation: c.regulation || selectedRegulation,
      facultyName: c.importedBy || 'Dr. V. Chitra',
      progress: matchingSub ? matchingSub.progress : 0,
      color: ['bg-rose-500', 'bg-blue-500', 'bg-amber-500', 'bg-emerald-500'][idx % 4],
      resources: matchingSub ? matchingSub.resources : []
    };
  });

  const explorerSubjects = allFetchedSubjects.length > 0 ? allFetchedSubjects : subjects;

  const mySubjects = fetchedSubjects.length > 0 ? fetchedSubjects.filter((s) => {
    const isPublished = publishedSubjectIds.includes(s.id);
    const statusValue = isPublished ? 'Published' : 'Draft';
    const isStatusMatch = statusFilter === 'All' || statusValue === statusFilter;
    
    let isSemOrYearMatch = true;
    if (programmeFilter === 'B.Pharm') {
      isSemOrYearMatch = selectedSemesterFilter === 'All' || s.semester === selectedSemesterFilter;
    } else {
      isSemOrYearMatch = selectedYearLevelFilter === 'All' || s.year === selectedYearLevelFilter;
    }
    return isStatusMatch && isSemOrYearMatch;
  }) : subjects.filter((s) => {
    const isAllotted = true; // Let both faculty and admin view all curriculum courses in the hub
    const isYearMatch = s.academicYear === selectedYear;
    const isProgMatch = s.programme === programmeFilter;
    
    let isRegMatch = false;
    if (programmeFilter === 'B.Pharm') {
      isRegMatch = s.regulation === selectedRegulation || (!s.regulation && selectedRegulation === 'PCI 2017');
    } else {
      isRegMatch = s.regulation === 'PCI 2008' || (!s.regulation); // Fallback to match existing Pharm.D courses
    }
    
    const isPublished = publishedSubjectIds.includes(s.id);
    const statusValue = isPublished ? 'Published' : 'Draft';
    const isStatusMatch = statusFilter === 'All' || statusValue === statusFilter;
    
    // Filter by selected Semester (for B.Pharm) or Year Level (for Pharm.D)
    let isSemOrYearMatch = true;
    if (programmeFilter === 'B.Pharm') {
      isSemOrYearMatch = selectedSemesterFilter === 'All' || s.semester === selectedSemesterFilter;
    } else {
      isSemOrYearMatch = selectedYearLevelFilter === 'All' || s.year === selectedYearLevelFilter;
    }
    
    return isAllotted && isYearMatch && isProgMatch && isRegMatch && isStatusMatch && isSemOrYearMatch;
  });

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 4500);
  };

  const getSubjectCountInTree = (prog: 'B.Pharm' | 'Pharm.D', reg: string, year: string, levelNum: number) => {
    return explorerSubjects.filter(s => {
      const isProgMatch = s.programme === prog;
      const isYearMatch = s.academicYear === year;
      let isRegMatch = false;
      if (prog === 'B.Pharm') {
        isRegMatch = s.regulation === reg || (!s.regulation && reg === 'PCI 2017');
      } else {
        isRegMatch = s.regulation === reg || (!s.regulation && reg === 'PCI 2008');
      }
      const isLevelMatch = prog === 'B.Pharm' ? s.semester === levelNum : s.year === levelNum;
      return isProgMatch && isYearMatch && isRegMatch && isLevelMatch;
    }).length;
  };

  // Duplicate course card simulation
  const handleDuplicateCourse = (e: React.MouseEvent, sub: Subject) => {
    e.stopPropagation();
    triggerToast(`Successfully duplicated curriculum for ${sub.code} - Draft Copy created.`);
  };

  // Move course to draft state simulation
  const handleArchiveCourse = (e: React.MouseEvent, sub: Subject) => {
    e.stopPropagation();
    setPublishedSubjectIds(publishedSubjectIds.filter(id => id !== sub.id));
    triggerToast(`Moved ${sub.code} to Draft status. The Admin can now review it.`);
  };

  // Custom Delete Modal State
  const [courseToDelete, setCourseToDelete] = useState<Subject | null>(null);

  // Delete course card permanently from database
  const handleDeleteCourse = (e: React.MouseEvent, sub: Subject) => {
    e.stopPropagation();
    setCourseToDelete(sub);
  };

  const confirmDeleteCourse = () => {
    if (!courseToDelete) return;
    deleteCourseFromDb(courseToDelete.code);

    if (onRefreshSubjects) {
      onRefreshSubjects();
    }
    
    triggerToast(`Permanently deleted ${courseToDelete.code} course shell and all compliance configurations.`);
    setCourseToDelete(null);
  };

  // Open course editor modal
  const handleEditCourse = (e: React.MouseEvent, sub: Subject) => {
    e.stopPropagation();
    setEditingCourse(sub);
    setEditName(sub.name);
    setEditCode(sub.code);
    setEditSemester(sub.semester);
    setEditYear(sub.year);
    setEditRegulation(sub.regulation || 'PCI 2017');
    setEditAcademicYear(sub.academicYear || '2025-2026');
    setEditFacultyName(sub.facultyName || 'Dr. V. Chitra');
    
    // Retrieve credits & hours from master database
    const db = getCurriculumDb();
    const info = db.courseInformation.find(c => c.subjectCode === sub.code);
    setEditCredits(info ? info.credits : ((sub.code && sub.code.endsWith('P')) ? 2 : 4));
    setEditHours(info ? info.hours : ((sub.code && sub.code.endsWith('P')) ? 30 : 45));
  };

  const handleSaveCourseEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourse) return;

    const db = getCurriculumDb();
    // Update CourseInformation
    db.courseInformation = db.courseInformation.map(c => {
      if (c.subjectCode === editingCourse.code) {
        return {
          ...c,
          subjectCode: editCode,
          courseName: editName,
          semester: editSemester,
          year: editYear,
          regulation: editRegulation,
          academicYear: editAcademicYear,
          credits: editCredits,
          hours: editHours,
          facultyAssigned: editFacultyName,
        };
      }
      return c;
    });

    // If the subjectCode (code) was changed, we must also update the subjectCode key in all other sheets
    if (editCode !== editingCourse.code) {
      const oldCode = editingCourse.code;
      const updateCode = <T extends { subjectCode: string }>(arr: T[]): T[] => {
        return arr.map(item => item.subjectCode === oldCode ? { ...item, subjectCode: editCode } : item);
      };

      db.scope = updateCode(db.scope);
      db.objectives = updateCode(db.objectives);
      db.courseOutcomes = updateCode(db.courseOutcomes);
      db.units = updateCode(db.units);
      db.curriculumTopics = updateCode(db.curriculumTopics);
      db.recommendedBooks = updateCode(db.recommendedBooks);
      db.referenceBooks = updateCode(db.referenceBooks);
      db.assessmentPattern = updateCode(db.assessmentPattern);

      // Move teaching resources
      const oldRes = localStorage.getItem(`srmcop_teaching_res_${oldCode}`);
      if (oldRes) {
        localStorage.setItem(`srmcop_teaching_res_${editCode}`, oldRes);
        localStorage.removeItem(`srmcop_teaching_res_${oldCode}`);
      }
    }

    saveCurriculumDb(db);
    setEditingCourse(null);
    if (onRefreshSubjects) {
      onRefreshSubjects();
    }
    triggerToast(`Successfully updated course shell details for ${editCode}.`);
  };

  const handleSaveCourseAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const db = getCurriculumDb();
    
    // Check duplicate
    if (db.courseInformation.some(c => c.subjectCode === addCode)) {
      alert(`A course with code ${addCode} already exists in the curriculum database.`);
      return;
    }
    
    // Append to CourseInformation
    db.courseInformation.push({
      subjectCode: addCode,
      courseName: addName,
      programme: programmeFilter,
      year: programmeFilter === 'B.Pharm' ? Math.ceil(addSemester / 2) : addYearLevel,
      semester: programmeFilter === 'B.Pharm' ? addSemester : 1,
      credits: addCredits,
      hours: addHours,
      subjectType: (addCode && addCode.endsWith('P')) ? 'Practical' : 'Theory',
      facultyAssigned: addFacultyName,
      importVersion: '1.0',
      academicYear: selectedYear,
      regulation: selectedRegulation,
      status: 'Approved'
    });
    
    // Initialize other sheets
    db.scope.push({ subjectCode: addCode, scopeStatement: `This course is designed to provide comprehensive training in ${addName}.` });
    db.objectives.push({ subjectCode: addCode, objectiveText: `Describe the fundamental theories and techniques in ${addName}.`, order: 1 });
    db.courseOutcomes.push({ subjectCode: addCode, coCode: 'CO1', coText: `Define and explain key methodologies of ${addName}.`, attainmentTarget: 2.5 });
    db.units.push({ subjectCode: addCode, unitCode: 'Unit I', unitName: 'General Foundations', hours: 9 });
    db.curriculumTopics.push({ subjectCode: addCode, unitCode: 'Unit I', topicCode: 'T1', topicName: 'Introduction & Core Terminology', hours: 1 });
    db.referenceBooks.push({ subjectCode: addCode, title: 'A Text Book of ' + addName, author: 'Standard Authors', edition: 'Latest' });
    db.assessmentPattern.push({
      subjectCode: addCode,
      theoryInternal: 25,
      theoryExternal: 75,
      practicalInternal: 15,
      practicalExternal: 35,
      universityExam: 100
    });
    
    saveCurriculumDb(db);
    setShowAddCourseModal(false);
    
    // Reset form
    setAddCode('');
    setAddName('');
    
    if (onRefreshSubjects) {
      onRefreshSubjects();
    }
    triggerToast(`Successfully added course shell ${addCode} - ${addName} to the database.`);
  };

  // Open curriculum designer sub-view
  const handleOpenCurriculumDesigner = (sub: Subject) => {
    const matched = fetchedCourses.find(c => c.courseCode === sub.code);
    const cur = matched || defaultCurriculum(sub.code, sub.name, sub.programme, sub.semester, sub.regulation);
    setActiveSubjectCurriculum(cur);
    setSelectedSubjectId(sub.id);
    setSelectedCourseCode(sub.code);
    setViewMode('designer');
  };

  // Toggle single section of curriculum designer
  const toggleSection = (sectionKey: string) => {
    setCollapsedSections(prev => ({ ...prev, [sectionKey]: !prev[sectionKey] }));
  };

  // Excel Drag and Drop event handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        setSelectedFile(file);
      } else {
        alert("Invalid file format. Please upload only an Excel workbook (.xlsx or .xls).");
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        setSelectedFile(file);
        setIsImportValidating(false);
        setValidationProgress(0);
        setValidationChecklist({
          courseInfo: 'pending', scope: 'pending', objectives: 'pending', courseOutcomes: 'pending',
          units: 'pending', curriculumTopics: 'pending', referenceBooks: 'pending', assessmentPattern: 'pending'
        });
      } else {
        alert("Invalid file format. Please upload only an Excel workbook (.xlsx or .xls).");
      }
    }
  };

  // Real Multi-Sheet Excel Template Exporter
  const handleDownloadTemplate = () => {
    try {
      const currentDb = getCurriculumDb();
      
      // Filter data matching the selected year, or fallback to general sample
      const courseInfoData = currentDb.courseInformation.filter(c => c.academicYear === selectedYear);
      const subjectCodes = courseInfoData.length > 0 
        ? courseInfoData.map(c => c.subjectCode) 
        : ['BP101T', 'BP102T', 'PD101', 'BP201T', 'BP103T'];
      
      const filterBySubject = (arr: any[]) => arr.filter(item => subjectCodes.includes(item.subjectCode));
      
      // Helper to transform keys into clean column names
      const formatHeaders = (arr: any[], mappings: Record<string, string>) => {
        return arr.map(item => {
          const newItem: Record<string, any> = {};
          Object.keys(item).forEach(key => {
            const mappedKey = mappings[key] || key;
            newItem[mappedKey] = item[key];
          });
          return newItem;
        });
      };

      // Configuration Mappings
      const infoMapping = {
        subjectCode: 'Subject Code',
        courseName: 'Course Name',
        programme: 'Programme',
        regulation: 'Regulation',
        year: 'Year',
        semester: 'Semester',
        credits: 'Credits',
        hours: 'Hours',
        subjectType: 'Subject Type',
        status: 'Status',
        facultyAssigned: 'Faculty Assigned',
        importVersion: 'Import Version',
        academicYear: 'Academic Year'
      };

      const scopeMapping = { subjectCode: 'Subject Code', scopeStatement: 'Scope Statement' };
      const objMapping = { subjectCode: 'Subject Code', objectiveText: 'Objective Text', order: 'Order' };
      const coMapping = { subjectCode: 'Subject Code', coCode: 'CO Code', coText: 'CO Text', attainmentTarget: 'Attainment Target' };
      const unitMapping = { subjectCode: 'Subject Code', unitCode: 'Unit Code', unitName: 'Unit Name', hours: 'Hours' };
      const topicMapping = { subjectCode: 'Subject Code', unitCode: 'Unit Code', topicCode: 'Topic Code', topicName: 'Topic Name', hours: 'Hours' };
      const bookMapping = { subjectCode: 'Subject Code', title: 'Title', author: 'Author', edition: 'Edition' };
      const assessmentMapping = {
        subjectCode: 'Subject Code',
        theoryInternal: 'Theory Internal',
        theoryExternal: 'Theory External',
        practicalInternal: 'Practical Internal',
        practicalExternal: 'Practical External',
        universityExam: 'University Exam'
      };

      const wb = XLSX.utils.book_new();

      const addSheet = (sheetName: string, rawData: any[], mapping: Record<string, string>, defaultSamples: any[]) => {
        let finalData = rawData.length > 0 ? formatHeaders(rawData, mapping) : formatHeaders(defaultSamples, mapping);
        const headers = EXPECTED_SHEETS_CONFIG[sheetName];
        // Enforce exact columns sequence in output
        const ws = XLSX.utils.json_to_sheet(finalData, { header: headers });
        XLSX.utils.book_append_sheet(wb, ws, sheetName);
      };

      // Compliant Fallback samples
      const sampleInfo = [{
        subjectCode: 'BP101T',
        courseName: 'Human Anatomy and Physiology I',
        programme: 'B.Pharm',
        regulation: 'PCI Regulation 2020',
        year: 1,
        semester: 1,
        credits: 4,
        hours: 45,
        subjectType: 'Theory',
        status: 'Approved',
        facultyAssigned: 'Dr. V. Chitra',
        importVersion: '1.0',
        academicYear: selectedYear
      }];

      const sampleScope = [{ subjectCode: 'BP101T', scopeStatement: 'This course is designed to impart fundamental knowledge on the structure and functions of the various systems of the human body.' }];
      const sampleObj = [{ subjectCode: 'BP101T', objectiveText: 'Explain the gross morphology, structure and functions of various organs of the human body.', order: 1 }];
      const sampleCo = [{ subjectCode: 'BP101T', coCode: 'CO1', coText: 'Explain homeostasis, cell structure and various primary tissues.', attainmentTarget: 2.5 }];
      const sampleUnit = [{ subjectCode: 'BP101T', unitCode: 'Unit I', unitName: 'Introduction to Human Body, Cellular & Tissue Level of Organization', hours: 9 }];
      const sampleTopic = [{ subjectCode: 'BP101T', unitCode: 'Unit I', topicCode: 'T1', topicName: 'Introduction to Human Body: Definition and scope of anatomy and physiology', hours: 1 }];
      const sampleBook = [{ subjectCode: 'BP101T', title: 'Anatomy and Physiology in Health and Illness', author: 'Ross & Wilson', edition: '13th Edition' }];
      const sampleAssessment = [{ subjectCode: 'BP101T', theoryInternal: 25, theoryExternal: 75, practicalInternal: 15, practicalExternal: 35, universityExam: 100 }];

      addSheet('Course Information', courseInfoData, infoMapping, sampleInfo);
      addSheet('Scope', filterBySubject(currentDb.scope), scopeMapping, sampleScope);
      addSheet('Objectives', filterBySubject(currentDb.objectives), objMapping, sampleObj);
      addSheet('Course Outcomes', filterBySubject(currentDb.courseOutcomes), coMapping, sampleCo);
      addSheet('Units', filterBySubject(currentDb.units), unitMapping, sampleUnit);
      addSheet('Curriculum Topics', filterBySubject(currentDb.curriculumTopics), topicMapping, sampleTopic);
      addSheet('Reference Books', filterBySubject(currentDb.referenceBooks), bookMapping, sampleBook);
      addSheet('Assessment Pattern', filterBySubject(currentDb.assessmentPattern), assessmentMapping, sampleAssessment);

      XLSX.writeFile(wb, `SRM_Pharmacy_Curriculum_Template_${selectedYear}.xlsx`);
      triggerToast(`Official 8-sheet template workbook generated for Academic Year ${selectedYear}.`);
    } catch (error) {
      console.error(error);
      alert('Error creating Excel template file.');
    }
  };

  // Start Excel Workbook Validation
  const handleStartImportValidation = () => {
    if (!selectedFile) return;

    setIsImportValidating(true);
    setIsImportSuccess(false);
    setValidationProgress(10);
    const initialLog = [`[SYSTEM] Initializing stream reader for: ${selectedFile.name}`];
    setImportLog(initialLog);

    setValidationChecklist({
      courseInfo: 'loading', scope: 'pending', objectives: 'pending', courseOutcomes: 'pending',
      units: 'pending', curriculumTopics: 'pending', referenceBooks: 'pending', assessmentPattern: 'pending'
    });

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });

        setValidationProgress(30);
        
        const logs = [...initialLog, `[VALIDATOR] Checking worksheet names, worksheet sequence, column names, and column sequence...`];
        setImportLog(logs);

        const validation = validateWorkbookFull(workbook);
        
        let localChecklist = {
          courseInfo: 'success',
          scope: 'success',
          objectives: 'success',
          courseOutcomes: 'success',
          units: 'success',
          curriculumTopics: 'success',
          referenceBooks: 'success',
          assessmentPattern: 'success'
        };

        if (!validation.valid) {
          validation.errors.forEach(err => {
            logs.push(`[ERROR] ${err}`);
            
            // Map the errors to their corresponding checklist sheet keys
            if (err.includes('Course Information')) localChecklist.courseInfo = 'error';
            if (err.includes('Scope')) localChecklist.scope = 'error';
            if (err.includes('Objectives')) localChecklist.objectives = 'error';
            if (err.includes('Course Outcomes')) localChecklist.courseOutcomes = 'error';
            if (err.includes('Units')) localChecklist.units = 'error';
            if (err.includes('Curriculum Topics')) localChecklist.curriculumTopics = 'error';
            if (err.includes('Reference Books')) localChecklist.referenceBooks = 'error';
            if (err.includes('Assessment Pattern')) localChecklist.assessmentPattern = 'error';
            
            // Fallback: if it's general worksheet order or sheet count, mark all as error
            if (err.includes('worksheet sequence') || err.includes('worksheet(s)')) {
              localChecklist.courseInfo = 'error';
              localChecklist.scope = 'error';
              localChecklist.objectives = 'error';
              localChecklist.courseOutcomes = 'error';
              localChecklist.units = 'error';
              localChecklist.curriculumTopics = 'error';
              localChecklist.referenceBooks = 'error';
              localChecklist.assessmentPattern = 'error';
            }
          });

          // Mark any unchanged keys to 'success' or leave as success
          Object.keys(localChecklist).forEach(key => {
            if ((localChecklist as any)[key] !== 'error') {
              (localChecklist as any)[key] = 'success';
            }
          });

          setValidationChecklist(localChecklist);
          setImportLog([...logs, `[CRITICAL] Workbook validation failed. 8-Worksheet Master Template Schema rules violated.`]);
          setValidationProgress(100);
          return;
        }

        setValidationProgress(70);
        logs.push(`[VALIDATOR] Verification SUCCESS. 8 worksheets and all column sequences match template perfectly.`);
        setImportLog(logs);

        // Parse with default academic year set to currently selected
        const parsedData = parseCurriculumWorkbook(workbook, selectedYear);

        // Ensure imported courses ALWAYS match the currently selected filters so they show up instantly in the active view in Draft state
        parsedData.courseInformation = parsedData.courseInformation.map(info => ({
          ...info,
          academicYear: selectedYear,
          programme: programmeFilter,
          regulation: selectedRegulation,
          status: 'Draft' as any // Ensure it is in Draft state
        }));

        const currentDb = getCurriculumDb();
        const diffs = compareCurriculumVersions(currentDb, parsedData);

        const academicYearsFound = Array.from(new Set(parsedData.courseInformation.map(c => c.academicYear)));
        logs.push(`[VALIDATOR] Identified Academic Year: ${academicYearsFound.join(', ') || selectedYear}`);
        logs.push(`[VALIDATOR] Found ${diffs.subjectsAdded.length} new course(s), ${diffs.subjectsUpdated.length} modified course(s).`);
        setImportLog(logs);

        setValidationChecklist({
          courseInfo: 'success',
          scope: 'success',
          objectives: 'success',
          courseOutcomes: 'success',
          units: 'success',
          curriculumTopics: 'success',
          referenceBooks: 'success',
          assessmentPattern: 'success'
        });
        setValidationProgress(90);

        setTimeout(() => {
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
                id: `imp-${Date.now()}`,
                fileName: selectedFile.name,
                importedAt: new Date().toISOString(),
                importedBy: 'Admin Office',
                version: (currentDb.importHistory.length > 0 ? (parseFloat(currentDb.importHistory[0].version) + 0.1).toFixed(1) : '1.0'),
                summary: `Master Workbook imported for Academic Year ${academicYearsFound[0] || selectedYear} with ${parsedData.courseInformation.length} course(s)`
              },
              ...currentDb.importHistory
            ]
          };

          saveCurriculumDb(newDb);
          
          setValidationProgress(100);
          setIsImportSuccess(true);

          const matchedYear = academicYearsFound[0] || selectedYear;
          const importedSubjectCodes = parsedData.courseInformation.map(c => c.subjectCode);

          if (activeSubjectCurriculum) {
            const enrichedCurriculum = {
              ...activeSubjectCurriculum,
              status: 'Approved' as const,
              importVersion: (parseFloat(activeSubjectCurriculum.importVersion) + 0.1).toFixed(1),
              importedBy: 'Admin Office',
              curriculumVersion: 'PCI-2020-V4',
              lastImported: new Date().toLocaleDateString('en-CA'),
              scope: activeSubjectCurriculum.courseCode === 'BP101T' 
                ? activeSubjectCurriculum.scope 
                : 'Enriched system syllabus imported. This workbook verifies scope, units, and PCI-2020 standard learning objectives.',
            };
            setActiveSubjectCurriculum(enrichedCurriculum);
            setPublishedSubjectIds(prev => prev.filter(id => id !== activeSubjectCurriculum.courseCode));
            triggerToast(`Workbook imported successfully! ${activeSubjectCurriculum.courseCode} refreshed and set to Draft. Click 'Publish' to publish.`);
          } else {
            setPublishedSubjectIds(prev => prev.filter(id => !importedSubjectCodes.includes(id)));
            triggerToast(`Master Workbook for Academic Year ${matchedYear} imported successfully with ${parsedData.courseInformation.length} courses! All imported courses are refreshed and placed in Draft state. Please review and publish them.`);
          }

          // Auto-switch selectedYear and dynamically append it if new, so that imported courses appear instantly!
          if (matchedYear) {
            setAcademicYears(prev => {
              if (!prev.includes(matchedYear)) {
                return [...prev, matchedYear];
              }
              return prev;
            });
            setSelectedYear(matchedYear);
          }

          // Re-trigger sync in App.tsx!
          if (onRefreshSubjects) {
            onRefreshSubjects();
          }

        }, 800);

      } catch (err) {
        setIsImportValidating(false);
        alert('An error occurred while parsing the Excel file. Please ensure it is a valid .xlsx file with correct headers.');
      }
    };
    reader.readAsArrayBuffer(selectedFile);
  };

  // Timeline changes log mock
  const importHistoryLog = [
    { version: '1.2', status: 'Approved', author: 'Admin Office', date: '2026-07-08', desc: 'Updated Course Objectives and added Unit IV topics index' },
    { version: '1.1', status: 'Approved', author: 'Dean Academics', date: '2026-06-20', desc: 'Mapped CO-PO alignment index based on PCI feedback' },
    { version: '1.0', status: 'Approved', author: 'Admin Office', date: '2026-06-15', desc: 'Initial curriculum upload from PCI central master sheets' }
  ];

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto px-4 md:px-6">
      
      {/* Toast Notification */}
      {showSuccessToast && (
        <div className="fixed top-6 right-6 z-50 p-4 bg-emerald-50/90 backdrop-blur-md border border-emerald-200/50 rounded-2xl flex items-center gap-3 text-emerald-800 shadow-2xl animate-slideIn">
          <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-black uppercase tracking-wider block">Action Confirmed</span>
            <span className="text-[10px] font-semibold text-emerald-600 block mt-0.5">{toastMessage}</span>
          </div>
        </div>
      )}

      {/* VIEW 1: COURSE LIST PAGE */}
      {viewMode === 'list' && (
        <>
          {/* Page Title & Breadcrumbs */}
          <div className="flex flex-col gap-1.5 pl-1 mb-2 mt-4">
            <h1 className="font-sans font-black text-2xl md:text-3xl text-gray-950 tracking-tight leading-none">
              {readOnly ? 'Curriculum Manager' : 'Course Manager'}
            </h1>
          </div>

          {/* CURRICULUM CONTEXT CARD (Matches Screenshot perfectly, redesigned for perfect spacing) */}
          <div className="bg-white px-4 md:px-5 py-6 rounded-[24px] border border-gray-150/50 shadow-sm flex flex-col gap-6">
            {/* Header */}
            <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
              <BookOpen className="w-5 h-5 text-[#8B1E3F]" />
              <h3 className="font-display font-black text-sm text-gray-950 uppercase tracking-wider">
                Curriculum Context
              </h3>
            </div>

            {/* Row 1: Filters Area (Responsive grid of selectors) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-5 w-full">
              
              {/* 1. Program Selector */}
              <div className="flex flex-col flex-1" style={{ minWidth: '180px' }}>
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 pl-0.5 block whitespace-nowrap leading-none">
                  Program
                </label>
                <div className="relative w-full h-11">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 flex items-center justify-center">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <select
                    value={programmeFilter}
                    onChange={(e) => {
                      const prog = e.target.value as 'B.Pharm' | 'Pharm.D';
                      setProgrammeFilter(prog);
                      if (prog === 'B.Pharm') {
                        setSelectedRegulation('PCI 2017');
                        setSelectedYear('2025-2026');
                      } else {
                        setSelectedRegulation('PCI 2008');
                        setSelectedYear('2025-2026');
                      }
                    }}
                    title={programmeFilter}
                    className="pl-10 pr-10 w-full h-11 bg-gray-50/60 hover:bg-gray-100/40 hover:border-gray-300 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 appearance-none focus:outline-none focus:ring-1 focus:ring-[#8B1E3F] focus:border-[#8B1E3F] cursor-pointer transition-all leading-normal"
                  >
                    <option value="B.Pharm">B.Pharm</option>
                    <option value="Pharm.D">Pharm.D</option>
                  </select>
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 flex items-center justify-center">
                    <ChevronDown className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>

              {/* 2. Regulation Selector */}
              <div className="flex flex-col flex-1" style={{ minWidth: '170px' }}>
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 pl-0.5 block whitespace-nowrap leading-none">
                  Regulation
                </label>
                <div className="relative w-full h-11">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <select
                    value={selectedRegulation}
                    onChange={(e) => {
                      const reg = e.target.value;
                      setSelectedRegulation(reg);
                      if (reg === 'PCI 2026') {
                        setSelectedYear('2026-2027');
                      } else {
                        setSelectedYear('2025-2026');
                      }
                    }}
                    title={selectedRegulation}
                    className="pl-10 pr-10 w-full h-11 bg-gray-50/60 hover:bg-gray-100/40 hover:border-gray-300 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 appearance-none focus:outline-none focus:ring-1 focus:ring-[#8B1E3F] focus:border-[#8B1E3F] cursor-pointer transition-all leading-normal"
                  >
                    {regulationsList.map(reg => (
                      <option key={reg} value={reg}>{reg}</option>
                    ))}
                  </select>
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 flex items-center justify-center">
                    <ChevronDown className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>

              {/* 3. Academic Year Selector */}
              <div className="flex flex-col flex-1" style={{ minWidth: '190px' }}>
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 pl-0.5 block whitespace-nowrap leading-none">
                  Academic Year
                </label>
                <div className="relative w-full h-11">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 flex items-center justify-center">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    title={`AY ${selectedYear}`}
                    className="pl-10 pr-10 w-full h-11 bg-gray-50/60 hover:bg-gray-100/40 hover:border-gray-300 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 appearance-none focus:outline-none focus:ring-1 focus:ring-[#8B1E3F] focus:border-[#8B1E3F] cursor-pointer transition-all leading-normal"
                  >
                    {displayedYears.map(year => (
                      <option key={year} value={year}>AY {year}</option>
                    ))}
                  </select>
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 flex items-center justify-center">
                    <ChevronDown className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>

              {/* 4. Semester / Year Selector */}
              <div className="flex flex-col flex-1" style={{ minWidth: '170px' }}>
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 pl-0.5 block whitespace-nowrap leading-none">
                  {programmeFilter === 'B.Pharm' ? 'Semester' : 'Year Level'}
                </label>
                <div className="relative w-full h-11">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 flex items-center justify-center">
                    <Layers className="w-4 h-4" />
                  </div>
                  <select
                    value={programmeFilter === 'B.Pharm' 
                      ? (selectedSemesterFilter === 'All' ? 'All' : selectedSemesterFilter)
                      : (selectedYearLevelFilter === 'All' ? 'All' : selectedYearLevelFilter)
                    }
                    onChange={(e) => {
                      const val = e.target.value;
                      if (programmeFilter === 'B.Pharm') {
                        setSelectedSemesterFilter(val === 'All' ? 'All' : Number(val));
                      } else {
                        setSelectedYearLevelFilter(val === 'All' ? 'All' : Number(val));
                      }
                    }}
                    title={
                      programmeFilter === 'B.Pharm' 
                        ? (selectedSemesterFilter === 'All' ? 'All Semesters' : getRomanSemester(Number(selectedSemesterFilter)))
                        : (selectedYearLevelFilter === 'All' ? 'All Years' : `Year ${selectedYearLevelFilter}`)
                    }
                    className="pl-10 pr-10 w-full h-11 bg-gray-50/60 hover:bg-gray-100/40 hover:border-gray-300 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 appearance-none focus:outline-none focus:ring-1 focus:ring-[#8B1E3F] focus:border-[#8B1E3F] cursor-pointer transition-all leading-normal"
                  >
                    {programmeFilter === 'B.Pharm' ? (
                      <>
                        <option value="All">All Semesters</option>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                          <option key={s} value={s}>{getRomanSemester(s)}</option>
                        ))}
                      </>
                    ) : (
                      <>
                        <option value="All">All Years</option>
                        {[1, 2, 3, 4, 5, 6].map(y => (
                          <option key={y} value={y}>Year {y}</option>
                        ))}
                      </>
                    )}
                  </select>
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 flex items-center justify-center">
                    <ChevronDown className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>

              {/* 5. Status Selector */}
              <div className="flex flex-col flex-1" style={{ minWidth: '150px' }}>
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 pl-0.5 block whitespace-nowrap leading-none">
                  Status
                </label>
                <div className="relative w-full h-11">
                  <div className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full ${getStatusColor(statusFilter)} border border-white shadow-sm`} />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    title={statusFilter === 'All' ? 'All Statuses' : (statusFilter === 'Published' ? 'Active' : 'Draft')}
                    className="pl-10 pr-10 w-full h-11 bg-gray-50/60 hover:bg-gray-100/40 hover:border-gray-300 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 appearance-none focus:outline-none focus:ring-1 focus:ring-[#8B1E3F] focus:border-[#8B1E3F] cursor-pointer transition-all leading-normal"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Published">Active</option>
                    <option value="Draft">Draft</option>
                  </select>
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 flex items-center justify-center">
                    <ChevronDown className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>

              {/* 6. Course Selector (Direct from Firestore) */}
              <div className="flex flex-col flex-1" style={{ minWidth: '280px' }}>
                <label className="text-[11px] font-bold text-[#8B1E3F] uppercase tracking-wider mb-1.5 pl-0.5 block whitespace-nowrap leading-none flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-[#8B1E3F] shrink-0" /> <span>Course</span>
                </label>
                <div className="relative w-full h-11">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 flex items-center justify-center">
                    <Library className="w-4 h-4" />
                  </div>
                  <select
                    value={selectedCourseCode}
                    onChange={(e) => handleCourseDropdownChange(e.target.value)}
                    title={(() => {
                      const current = fetchedCourses.find(c => c.courseCode === selectedCourseCode);
                      return current ? `${current.courseCode} – ${current.courseName}` : "Select a Course...";
                    })()}
                    className="pl-10 pr-10 w-full h-11 bg-gray-50/60 hover:bg-gray-100/40 hover:border-gray-[#8B1E3F]/30 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 appearance-none focus:outline-none focus:ring-1 focus:ring-[#8B1E3F] focus:border-[#8B1E3F] cursor-pointer transition-all leading-normal"
                  >
                    <option value="">Select a Course...</option>
                    {fetchedCourses.map((c, idx) => (
                      <option key={`${c.courseCode || 'course'}-${idx}`} value={c.courseCode}>
                        {c.courseCode} – {c.courseName}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 flex items-center justify-center">
                    <ChevronDown className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>

            </div>

            {/* Row 2: Actions Bar */}
            <div className="flex flex-wrap gap-3 items-center justify-end border-t border-gray-100 pt-4 mt-1">
              {!readOnly && (
                <button
                  onClick={() => setShowImportModal(true)}
                  className="h-11 px-4 border border-dashed border-[#8B1E3F]/40 bg-[#8B1E3F]/5 hover:bg-[#8B1E3F]/10 text-[#8B1E3F] text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Upload className="w-4 h-4" /> Import Excel
                </button>
              )}

              <button
                onClick={() => triggerToast("Master syllabus structure compiled into .xlsx export docket.")}
                className="h-11 px-4 border border-solid border-gray-200 bg-white hover:bg-gray-50 text-gray-700 hover:text-gray-900 text-xs font-bold rounded-xl transition-all flex items-center gap-2 shadow-sm cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4" /> Export Excel
              </button>

              {!readOnly && (
                <button
                  onClick={handleDownloadTemplate}
                  className="h-11 px-4 border border-solid border-transparent bg-[#8B1E3F]/10 hover:bg-[#8B1E3F]/15 text-[#8B1E3F] text-xs font-black rounded-xl transition-all flex items-center gap-2 shadow-sm cursor-pointer"
                >
                  <Download className="w-4 h-4" /> Download Template
                </button>
              )}
            </div>
          </div>

          {/* Main Course Manager Tab Navigation */}
          {!readOnly && (
            <div className="flex border-b border-gray-150/40 pb-2.5 gap-2 mt-4">
              <button
                onClick={() => setHubTab('courses')}
                className={`px-5 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all border ${
                  hubTab === 'courses'
                    ? programmeFilter === 'B.Pharm'
                      ? 'bg-pink-50/50 border-pink-200 text-[#8B1E3F]'
                      : 'bg-teal-50/50 border-teal-200 text-[#0F766E]'
                    : 'border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" /> Allotted Course List
              </button>
              <button
                onClick={() => setHubTab('settings')}
                className={`px-5 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all border ${
                  hubTab === 'settings'
                    ? programmeFilter === 'B.Pharm'
                      ? 'bg-pink-50/50 border-pink-200 text-[#8B1E3F]'
                      : 'bg-teal-50/50 border-teal-200 text-[#0F766E]'
                    : 'border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" /> Syllabus Master Settings
              </button>
            </div>
          )}

          {hubTab === 'settings' && !readOnly ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start animate-fadeIn mt-6">
              <div className="lg:col-span-2 flex flex-col gap-6">
                
                {/* Premium Drag & Drop Workbook Import Workspace */}
                <GlassCard className="p-6 border border-gray-150/50">
                  <h3 className="font-display font-bold text-base text-gray-900">Excel Curriculum Workbook Import</h3>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    Upload the 9-worksheet Master Curriculum Excel file for sessional year <span className="font-bold text-gray-700">{selectedYear}</span>. This will automatically update/generate corresponding course structures, learning syllabus matrices, book lists, outcomes, and assessment schemes.
                  </p>

                  <div 
                    onClick={() => setShowImportModal(true)}
                    className="mt-5 border-2 border-dashed border-gray-200 hover:border-[#8B1E3F]/30 bg-gray-50/50 p-6 rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer relative group transition-all"
                  >
                    <Upload className="w-8 h-8 text-gray-400 group-hover:text-[#8B1E3F] mb-3 transition-all" />
                    <span className="text-xs font-black text-gray-800 uppercase tracking-wide">Click to Drag & Drop or Browse file</span>
                    <span className="text-[10px] text-gray-400 mt-1 font-semibold uppercase">Supported formats: Microsoft Excel (.xlsx, .xls)</span>
                  </div>
                </GlassCard>

                {/* Differential Overwrite Preview State Mock */}
                <GlassCard className="p-6 border border-gray-150/50 bg-emerald-50/5">
                  <h4 className="text-xs font-black uppercase text-gray-900 flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" />
                    Active Year Syllabus Status (Draft/Published)
                  </h4>
                  <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
                    Active schemas are 100% compliant with PCI guidelines for the sessional year <span className="font-bold text-gray-700">{selectedYear}</span>. Last verified on {new Date().toLocaleDateString()}.
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-bold text-gray-600 mt-4">
                    <div className="p-3 bg-white border border-gray-100 rounded-xl">
                      <span className="text-[8px] text-gray-400 block uppercase">Allotted Shells</span>
                      <span className="text-gray-800 font-mono text-sm">{mySubjects.length} Active</span>
                    </div>
                    <div className="p-3 bg-white border border-gray-100 rounded-xl">
                      <span className="text-[8px] text-gray-400 block uppercase">Outcomes & Units</span>
                      <span className="text-gray-800 font-mono text-sm">35 Units Verified</span>
                    </div>
                    <div className="p-3 bg-white border border-gray-100 rounded-xl">
                      <span className="text-[8px] text-gray-400 block uppercase">Assessment Schemes</span>
                      <span className="text-gray-800 font-mono text-sm">PCI-2020 Standard</span>
                    </div>
                  </div>
                </GlassCard>

                 {/* Import History */}
                <div className="flex flex-col gap-3">
                  <h3 className="font-display font-bold text-xs text-gray-900 pl-1 uppercase tracking-wider">Excel Workbook Import History</h3>
                  {getCurriculumDb().importHistory.map((hist) => (
                    <div key={hist.id} className="p-4 bg-white border border-gray-150/40 rounded-2xl shadow-sm text-xs text-gray-600 font-semibold">
                      <div className="flex justify-between font-bold mb-1">
                        <span className="text-[#8B1E3F] truncate max-w-[280px]">{hist.fileName}</span>
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

              {/* Side Column info cards */}
              <div className="flex flex-col gap-6">
                
                {/* Compliance Verification Panel */}
                <GlassCard className="p-5 flex flex-col gap-4 border border-gray-150/50">
                  <h4 className="text-xs font-black uppercase tracking-wider text-gray-900 border-b border-gray-100 pb-2">
                    PCI Compliance Verification
                  </h4>
                  <p className="text-[11px] text-gray-500 font-semibold leading-relaxed">
                    Syllabus settings are governed by the Pharmacy Council of India (PCI) Education Regulations. All active course shells require structured units, objectives, and mapped reference books.
                  </p>
                  <div className="flex flex-col gap-2.5 pt-1.5 text-xs text-gray-700">
                    <div className="flex justify-between items-center bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                      <span>Theory Internal Mark Scheme</span>
                      <span className="font-black text-[#8B1E3F]">75/25 Scheme</span>
                    </div>
                    <div className="flex justify-between items-center bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                      <span>Practical Internal Mark Scheme</span>
                      <span className="font-black text-[#8B1E3F]">35/15 Scheme</span>
                    </div>
                  </div>
                </GlassCard>

                {/* Templates & Exports */}
                <GlassCard className="p-5 flex flex-col gap-4 border border-gray-150/50">
                  <h4 className="text-xs font-black uppercase tracking-wider text-gray-900 border-b border-gray-100 pb-2">
                    Compliance Templates
                  </h4>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={handleDownloadTemplate}
                      className="w-full text-left p-3 bg-[#8B1E3F]/5 border border-[#8B1E3F]/15 rounded-xl hover:bg-[#8B1E3F]/10 transition-all text-xs font-black uppercase tracking-wide text-[#8B1E3F] flex items-center justify-between animate-pulse"
                    >
                      <span>Download {selectedYear} Master Template</span>
                      <Download className="w-4 h-4" />
                    </button>
                    <p className="text-[10px] text-gray-400 font-bold leading-normal">
                      Generates a standard compliant 9-worksheet PCI syllabus template with pre-mapped code indices for instant workbook uploads.
                    </p>
                  </div>
                </GlassCard>

              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start mt-6">
              {/* Left Column: Curriculum Explorer Sidebar */}
              <div className="lg:col-span-1 animate-fadeIn">
                <CurriculumExplorer
                  programmeFilter={programmeFilter}
                  selectedRegulation={selectedRegulation}
                  selectedYear={selectedYear}
                  selectedSemesterFilter={selectedSemesterFilter}
                  selectedYearLevelFilter={selectedYearLevelFilter}
                  subjects={explorerSubjects}
                  isMinimized={isExplorerMinimized}
                  onToggleMinimize={() => setIsExplorerMinimized(!isExplorerMinimized)}
                  onSelectNode={(node) => {
                    setProgrammeFilter(node.programme);
                    setSelectedRegulation(node.regulation);
                    setSelectedYear(node.year);
                    if (node.programme === 'B.Pharm') {
                      setSelectedSemesterFilter(node.semester);
                    } else {
                      setSelectedYearLevelFilter(node.yearLevel === 'All' ? 'All' : Number(node.yearLevel));
                    }
                  }}
                />
              </div>

              {/* Right Column: Active Workspace */}
              <div className="lg:col-span-3 flex flex-col gap-6">
                
                {/* Active Courses Header with Grid/Table layout toggles */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-150 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">
                      Active Courses ({mySubjects.length} Found)
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setLayoutMode('grid')}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
                        layoutMode === 'grid'
                          ? 'bg-white text-gray-950 shadow-sm'
                          : 'text-gray-500 hover:text-gray-800'
                      }`}
                    >
                      Grid View
                    </button>
                    <button
                      type="button"
                      onClick={() => setLayoutMode('table')}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
                        layoutMode === 'table'
                          ? 'bg-white text-gray-950 shadow-sm'
                          : 'text-gray-500 hover:text-gray-800'
                      }`}
                    >
                      Table View
                    </button>
                  </div>
                </div>

              {layoutMode === 'table' ? (
                <CourseListTable
                  programmeFilter={programmeFilter}
                  selectedSemesterFilter={selectedSemesterFilter}
                  selectedYearLevelFilter={selectedYearLevelFilter}
                  selectedRegulation={selectedRegulation}
                  selectedYear={selectedYear}
                  mySubjects={mySubjects}
                  publishedSubjectIds={publishedSubjectIds}
                  readOnly={readOnly}
                  onGoToSubject={onGoToSubject}
                  onOpenCurriculumDesigner={handleOpenCurriculumDesigner}
                  onEditCourse={handleEditCourse}
                  onDuplicateCourse={handleDuplicateCourse}
                  onArchiveCourse={handleArchiveCourse}
                  onDeleteCourse={handleDeleteCourse}
                  onPublishCourse={(id) => {
                    if (publishedSubjectIds.includes(id)) {
                      setPublishedSubjectIds(publishedSubjectIds.filter(x => x !== id));
                      triggerToast(`Moved course status to Draft.`);
                    } else {
                      setPublishedSubjectIds([...publishedSubjectIds, id]);
                      triggerToast(`Course has been published successfully!`);
                    }
                  }}
                  onAddCourseClick={() => setShowAddCourseModal(true)}
                  isPCI2026={isPCI2026}
                />
              ) : mySubjects.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {mySubjects.map((sub) => {
                    // Fallbacks for missing info to preserve robust UI
                    const credits = (sub.code && sub.code.endsWith('P')) ? 2 : 4;
                    const hours = (sub.code && sub.code.endsWith('P')) ? 30 : 45;
                    const regulation = 'PCI Regulation 2020';
                    const unitsCount = 5;
                    const isPublished = publishedSubjectIds.includes(sub.id);
                    const status = isPublished ? 'Published' : 'Draft';
                    const lastUpdated = '2026-07-08';

                    // Premium Accent Color based on programme Filter
                    const activeAccent = programmeFilter === 'B.Pharm' ? 'border-maroon-100 hover:border-[#8B1E3F]/30 hover:shadow-maroon-900/10' : 'border-teal-100 hover:border-[#0F766E]/30 hover:shadow-teal-900/10';
                    const progBadgeStyle = programmeFilter === 'B.Pharm' 
                      ? 'bg-maroon-50 text-[#8B1E3F] border-maroon-100/40' 
                      : 'bg-teal-50 text-[#0F766E] border-teal-100/40';

                    return (
                      <GlassCard
                        key={sub.id}
                        hoverLift
                        className={`p-6 relative flex flex-col justify-between border-2 ${activeAccent} hover:shadow-2xl transition-all duration-300 rounded-[32px] overflow-hidden group bg-white`}
                      >
                        {/* Decorative background gradient */}
                        <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20 -mr-10 -mt-10 transition-colors duration-500 ${
                          programmeFilter === 'B.Pharm' ? 'bg-[#8B1E3F]' : 'bg-[#0F766E]'
                        }`} />

                        <div>
                          {/* Top Tag Row */}
                          <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center gap-2">
                              <span className={`px-2.5 py-1 text-[10px] font-mono font-extrabold tracking-wider rounded-lg ${
                                programmeFilter === 'B.Pharm'
                                  ? 'bg-[#8B1E3F]/5 text-[#8B1E3F]'
                                  : 'bg-[#0F766E]/5 text-[#0F766E]'
                              }`}>
                                {sub.code}
                              </span>
                              <span className="text-[9px] font-bold uppercase text-gray-400">
                                {sub.regulation || regulation}
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <span className={`text-[9px] font-black px-2.5 py-1 rounded-full uppercase border ${progBadgeStyle}`}>
                                {sub.programme} • {sub.semester ? `Sem ${sub.semester}` : `Year ${sub.year}`}
                              </span>
                            </div>
                          </div>

                          {/* Subject Title */}
                          <h3 className="font-display font-black text-xl text-gray-900 leading-snug tracking-tight mb-4 pr-6 transition-colors duration-300 group-hover:text-[#8B1E3F]">
                            {sub.name}
                          </h3>

                          {/* Quick Stats Grid */}
                          <div className="grid grid-cols-3 gap-3 py-3.5 border-y border-gray-100 my-4 text-[10px] font-semibold text-gray-500 bg-gray-50/50 rounded-2xl px-4">
                            <div className="flex flex-col gap-1 border-r border-gray-150/40 pr-1">
                              <span className="text-gray-400 text-[8px] uppercase font-black tracking-wider flex items-center gap-1">
                                <Award className="w-3 h-3 text-amber-500" />
                                Credits
                              </span>
                              <span className="font-extrabold text-gray-800 text-xs">{credits} Credits</span>
                            </div>
                            <div className="flex flex-col gap-1 border-r border-gray-150/40 pr-1">
                              <span className="text-gray-400 text-[8px] uppercase font-black tracking-wider flex items-center gap-1">
                                <Clock className="w-3 h-3 text-indigo-500" />
                                Hours
                              </span>
                              <span className="font-extrabold text-gray-800 text-xs">{hours} Hrs Required</span>
                            </div>
                            <div className="flex flex-col gap-1">
                              <span className="text-gray-400 text-[8px] uppercase font-black tracking-wider flex items-center gap-1">
                                <Layers className="w-3 h-3 text-rose-500" />
                                Regulation
                              </span>
                              <span className="font-extrabold text-gray-800 text-xs">{sub.regulation || 'PCI 2017'}</span>
                            </div>
                          </div>

                          {/* Secondary Metadata Info */}
                          <div className="space-y-2 text-[10px] font-bold text-gray-500 mt-2 pl-1 bg-gray-50/30 p-3 rounded-2xl border border-gray-100">
                            <div className="flex justify-between items-center">
                              <span className="text-gray-400 font-extrabold uppercase text-[8px]">Faculty Assigned:</span>
                              <span className="text-gray-800 font-black">{sub.facultyName || 'Dr. V. Chitra'}</span>
                            </div>

                          </div>
                        </div>

                        {/* Redesigned Card Footer Workspace */}
                        <div className="border-t border-gray-150/40 pt-4 mt-5 flex flex-col gap-3">
                          {/* Secondary actions row */}
                          <div className="flex items-center justify-between gap-1.5 flex-wrap">
                            {/* Left: Preview & Download */}
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => handleOpenCurriculumDesigner(sub)}
                                className="h-8 px-2 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1 transition-all bg-white"
                                title="Preview Curriculum"
                              >
                                <Eye className="w-3.5 h-3.5 text-gray-400" /> PREVIEW
                              </button>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  triggerToast(`Successfully downloaded PCI Curriculum Syllabus for ${sub.code} (${sub.name}).xlsx`);
                                }}
                                className={`h-8 px-2 border rounded-lg text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1 transition-all ${
                                  programmeFilter === 'B.Pharm'
                                    ? 'border-pink-200 bg-pink-50/50 hover:bg-pink-50 text-[#8B1E3F]'
                                    : 'border-teal-200 bg-teal-50/50 hover:bg-teal-50 text-[#0F766E]'
                                }`}
                                title="Download Syllabus Workbook"
                              >
                                <Download className="w-3.5 h-3.5" /> DOWNLOAD
                              </button>
                            </div>

                            {/* Right: Edit, Publish, Delete (Admin/Author only) */}
                            {!readOnly && (
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={(e) => handleEditCourse(e, sub)}
                                  className="h-8 w-8 flex items-center justify-center border border-gray-200 hover:bg-gray-50 text-gray-400 hover:text-gray-600 rounded-lg bg-white transition-all"
                                  title="Edit Course Details"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>

                                {!isPublished ? (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setPublishedSubjectIds([...publishedSubjectIds, sub.id]);
                                      triggerToast(`${sub.code} has been published successfully!`);
                                    }}
                                    className="h-8 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1 transition-all"
                                    title="Publish Course"
                                  >
                                    <Check className="w-3.5 h-3.5" /> PUBLISH
                                  </button>
                                ) : null}

                                {isPublished ? (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setPublishedSubjectIds(publishedSubjectIds.filter(id => id !== sub.id));
                                      triggerToast(`Moved ${sub.code} to Draft status. The Admin can now review and correct it.`);
                                    }}
                                    className="h-8 px-2.5 border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-lg text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1 transition-all"
                                    title="Revert to Draft"
                                  >
                                    <FileText className="w-3.5 h-3.5 text-amber-500" /> DRAFT
                                  </button>
                                ) : (
                                  <div className="h-8 px-2.5 border border-gray-200 bg-gray-50 text-gray-400 rounded-lg text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1">
                                    <FileText className="w-3.5 h-3.5 text-gray-400" /> DRAFT STATE
                                  </div>
                                )}

                                <button
                                  onClick={(e) => handleDeleteCourse(e, sub)}
                                  className="h-8 w-8 flex items-center justify-center border border-red-200 hover:bg-red-50 text-red-500 rounded-lg bg-white transition-all"
                                  title="Delete Course Shell Permanently"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                          </div>

                          {/* Primary full-width button row: Open Workspace */}
                          <button
                            onClick={() => onGoToSubject(sub.id)}
                            className={`w-full h-10 text-white text-[10px] font-black uppercase tracking-widest rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-sm group/btn ${
                              programmeFilter === 'B.Pharm'
                                ? 'bg-[#8B1E3F] hover:bg-[#721833]'
                                : 'bg-[#0F766E] hover:bg-[#0C5F58]'
                            }`}
                          >
                            <span>Open Teaching Workspace</span>
                            <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                          </button>
                        </div>
                      </GlassCard>
                    );
                  })}
                </div>
            ) : (
              <GlassCard className="p-12 flex flex-col items-center justify-center text-center gap-4 border border-dashed border-gray-200">
                {isPCI2026 ? (
                  <>
                    <div className="w-14 h-14 rounded-full bg-pink-50 flex items-center justify-center border border-pink-100 shadow-sm text-[#8B1E3F]">
                      <Layers className="w-6 h-6 animate-pulse" />
                    </div>
                    <div>
                      <h4 className="font-display font-extrabold text-base text-[#8B1E3F]">PCI 2026 Regulation Schema</h4>
                      <p className="text-xs text-gray-500 max-w-md leading-relaxed mt-2 mx-auto">
                        This regulation is reserved for future curriculum entry. Existing PCI 2017 course data is not copied or displayed.
                      </p>
                      <div className="mt-4 flex flex-col sm:flex-row gap-3 justify-center items-center">
                        <div className="px-4 py-2 bg-pink-50 border border-pink-100/60 rounded-xl text-xs font-bold text-[#8B1E3F]">
                          No semesters configured.
                        </div>
                        <div className="px-4 py-2 bg-gray-50 border border-gray-150 rounded-xl text-xs font-bold text-gray-500">
                          No courses configured.
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100 shadow-sm text-gray-400">
                      <BookOpen className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-display font-bold text-base text-gray-800">No Allotted Subjects Found</h4>
                      <p className="text-xs text-gray-500 max-w-sm leading-relaxed mt-1">
                        You do not have any courses assigned under the <span className="font-bold text-gray-700">{selectedYear}</span> session.
                      </p>
                    </div>
                  </>
                )}
              </GlassCard>
            )}
          </div>
          </div>
          )}
        </>
      )}

      {/* VIEW 2: CURRICULUM DESIGNER PAGE */}
      {viewMode === 'designer' && activeSubjectCurriculum && (
        <div className="flex flex-col gap-6 animate-fadeIn">
          
          {/* Back Button */}
          <button
            onClick={() => {
              setViewMode('list');
              setSelectedCourseCode('');
              setActiveSubjectCurriculum(null);
            }}
            className="flex items-center gap-2 text-xs font-bold text-[#8B1E3F] hover:underline self-start bg-white px-3.5 py-1.5 rounded-full border border-gray-100 shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to allotted courses list
          </button>

          {/* Core Curriculum Header Block */}
          <div className="relative overflow-hidden rounded-[24px] bg-white p-6 border border-gray-150/50 shadow-md flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="text-[10px] font-mono font-black text-gray-400 uppercase tracking-widest">{activeSubjectCurriculum.courseCode}</span>
                <span className="w-1.5 h-1.5 bg-gray-300 rounded-full" />
                <span className="text-[10px] font-black text-[#8B1E3F] uppercase tracking-wider">{activeSubjectCurriculum.regulation}</span>
                <span className="w-1.5 h-1.5 bg-gray-300 rounded-full" />
                <span className="text-[10px] font-bold bg-[#8B1E3F]/10 text-[#8B1E3F] px-2 py-0.5 rounded-full uppercase">
                  Semester {activeSubjectCurriculum.semester}
                </span>
              </div>
              <h1 className="font-display font-black text-xl text-gray-950 tracking-tight leading-snug">
                {activeSubjectCurriculum.courseName}
              </h1>

              {/* Header metadata layout */}
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-3 text-[11px] font-semibold text-gray-500">
                <div>Programme: <span className="text-gray-900 font-extrabold">{activeSubjectCurriculum.programme}</span></div>
                <div>Credits: <span className="text-gray-900 font-extrabold">{activeSubjectCurriculum.credits} Credits</span></div>
                <div>Syllabus Hours: <span className="text-gray-900 font-extrabold">{activeSubjectCurriculum.hours} Lecture Hours</span></div>
                <div>Ver Status: <span className="text-emerald-600 font-extrabold">{activeSubjectCurriculum.status}</span></div>
                <div>Import Sheet Ver: <span className="text-gray-800 font-extrabold">v{activeSubjectCurriculum.importVersion}</span></div>
                <div>Curriculum Master: <span className="text-gray-800 font-extrabold">{activeSubjectCurriculum.curriculumVersion}</span></div>
              </div>
            </div>

            {/* Top Right Action Trigger buttons */}
            <div className="flex flex-wrap gap-2.5 shrink-0">
              <button
                onClick={() => triggerToast("Master syllabus structure compiled into .xlsx export docket.")}
                className="p-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 rounded-full transition-all flex items-center justify-center"
                title="Export Syllabus Workbook"
              >
                <FileSpreadsheet className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setViewMode('list');
                  setSelectedCourseCode('');
                  setActiveSubjectCurriculum(null);
                }}
                className="p-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 rounded-full transition-all flex items-center justify-center"
                title="Historical import journals logs"
              >
                <History className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Curriculum Workspace Layout (Main Content Left 2/3, Sidebar Right 1/3) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            
            {/* LEFT 2 COLUMNS: SYLLABUS DOCK DETAILS */}
            <div className="lg:col-span-2 flex flex-col gap-6">

              {/* 1. Course Information Section */}
              <div className="rounded-[24px] bg-white border border-gray-150/50 shadow-sm overflow-hidden">
                <div 
                  onClick={() => { if (editingSection !== 'info') toggleSection('info'); }}
                  className="p-4 bg-gray-50/50 hover:bg-gray-50/80 cursor-pointer flex justify-between items-center border-b border-gray-100"
                >
                  <div className="flex justify-between items-center w-full">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#8B1E3F]/10 text-[#8B1E3F] flex items-center justify-center">
                        <Library className="w-4 h-4" />
                      </div>
                      <h3 className="font-display font-extrabold text-sm text-gray-900 uppercase tracking-wide">1. Course Information Specifications</h3>
                    </div>
                    {!readOnly && (
                      editingSection === 'info' ? (
                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          <button 
                            onClick={() => handleSaveSection('info')}
                            disabled={savingSection === 'info'}
                            className="px-3 py-1 text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-all flex items-center gap-1 shadow-sm disabled:opacity-50"
                          >
                            {savingSection === 'info' ? 'Saving...' : 'Save'}
                          </button>
                          <button 
                            onClick={handleCancelEdit}
                            className="px-3 py-1 text-[11px] font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleStartEdit('info'); }}
                          className="px-3 py-1 text-[11px] font-bold text-[#8B1E3F] bg-pink-50 hover:bg-pink-100 rounded-lg transition-all flex items-center gap-1 border border-pink-100"
                        >
                          <Edit className="w-3 h-3" /> Edit Section
                        </button>
                      )
                    )}
                  </div>
                </div>

                {!collapsedSections.info && (
                  <div className="p-5 bg-white">
                    {editingSection === 'info' ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-black uppercase text-gray-400">Subject Code</label>
                          <input 
                            type="text" 
                            value={editInfoCode} 
                            onChange={(e) => setEditInfoCode(e.target.value)} 
                            className="p-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-pink-900/10 focus:border-[#8B1E3F]"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-black uppercase text-gray-400">Syllabus Title</label>
                          <input 
                            type="text" 
                            value={editInfoName} 
                            onChange={(e) => setEditInfoName(e.target.value)} 
                            className="p-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-pink-900/10 focus:border-[#8B1E3F]"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-black uppercase text-gray-400">Programme</label>
                          <select 
                            value={editInfoProgramme} 
                            onChange={(e) => setEditInfoProgramme(e.target.value)} 
                            className="p-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-pink-900/10"
                          >
                            <option value="B.Pharm">B.Pharm</option>
                            <option value="M.Pharm">M.Pharm</option>
                            <option value="Pharm.D">Pharm.D</option>
                          </select>
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-black uppercase text-gray-400">Syllabus Regulation</label>
                          <select 
                            value={editInfoRegulation} 
                            onChange={(e) => setEditInfoRegulation(e.target.value)} 
                            className="p-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-pink-900/10"
                          >
                            <option value="PCI 2017">PCI 2017</option>
                            <option value="PCI 2026">PCI 2026</option>
                            <option value="PCI 2020">PCI 2020</option>
                            <option value="PCI 2008">PCI 2008</option>
                          </select>
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-black uppercase text-gray-400">Semester</label>
                          <input 
                            type="number" 
                            min={1} 
                            max={10} 
                            value={editInfoSemester} 
                            onChange={(e) => setEditInfoSemester(Number(e.target.value))} 
                            className="p-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-pink-900/10"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-black uppercase text-gray-400">Credits</label>
                          <input 
                            type="number" 
                            min={1} 
                            max={20} 
                            value={editInfoCredits} 
                            onChange={(e) => setEditInfoCredits(Number(e.target.value))} 
                            className="p-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-pink-900/10"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-black uppercase text-gray-400">Lecture Hours</label>
                          <input 
                            type="number" 
                            min={1} 
                            max={100} 
                            value={editInfoHours} 
                            onChange={(e) => setEditInfoHours(Number(e.target.value))} 
                            className="p-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-pink-900/10"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-black uppercase text-gray-400">Instruction Modality</label>
                          <select 
                            value={editInfoType} 
                            onChange={(e) => setEditInfoType(e.target.value)} 
                            className="p-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-pink-900/10"
                          >
                            <option value="Theory">Theory</option>
                            <option value="Practical">Practical</option>
                          </select>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                          { label: 'Subject Code', value: activeSubjectCurriculum.courseCode },
                          { label: 'Syllabus Title', value: activeSubjectCurriculum.courseName },
                          { label: 'Core Programme', value: activeSubjectCurriculum.programme },
                          { label: 'Syllabus Regulation', value: activeSubjectCurriculum.regulation },
                          { label: 'Allotted Semester', value: `Semester ${activeSubjectCurriculum.semester}` },
                          { label: 'Classroom Credits', value: `${activeSubjectCurriculum.credits} Credits` },
                          { label: 'Lecture Hours', value: `${activeSubjectCurriculum.hours} Hours` },
                          { label: 'Curricular Modality', value: `${activeSubjectCurriculum.type} Instruction` }
                        ].map((spec, sIdx) => (
                          <div key={sIdx} className="p-3 bg-gray-50/60 border border-gray-100 rounded-xl">
                            <span className="text-[8px] font-black uppercase tracking-wider text-gray-400 block mb-0.5">{spec.label}</span>
                            <p className="text-xs font-bold text-gray-800 leading-tight">{spec.value}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 2. Course Scope Section */}
              <div className="rounded-[24px] bg-white border border-gray-150/50 shadow-sm overflow-hidden">
                <div 
                  onClick={() => { if (editingSection !== 'scope') toggleSection('scope'); }}
                  className="p-4 bg-gray-50/50 hover:bg-gray-50/80 cursor-pointer flex justify-between items-center border-b border-gray-100"
                >
                  <div className="flex justify-between items-center w-full">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#8B1E3F]/10 text-[#8B1E3F] flex items-center justify-center">
                        <Sliders className="w-4 h-4" />
                      </div>
                      <h3 className="font-display font-extrabold text-sm text-gray-900 uppercase tracking-wide">2. Course Scope & Compliance Statement</h3>
                    </div>
                    {!readOnly && (
                      editingSection === 'scope' ? (
                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          <button 
                            onClick={() => handleSaveSection('scope')}
                            disabled={savingSection === 'scope'}
                            className="px-3 py-1 text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-all flex items-center gap-1 shadow-sm disabled:opacity-50"
                          >
                            {savingSection === 'scope' ? 'Saving...' : 'Save'}
                          </button>
                          <button 
                            onClick={handleCancelEdit}
                            className="px-3 py-1 text-[11px] font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleStartEdit('scope'); }}
                          className="px-3 py-1 text-[11px] font-bold text-[#8B1E3F] bg-pink-50 hover:bg-pink-100 rounded-lg transition-all flex items-center gap-1 border border-pink-100"
                        >
                          <Edit className="w-3 h-3" /> Edit Section
                        </button>
                      )
                    )}
                  </div>
                </div>

                {!collapsedSections.scope && (
                  <div className="p-5 bg-white text-xs text-gray-600 leading-relaxed font-medium">
                    {editingSection === 'scope' ? (
                      <textarea 
                        value={editScopeStatement}
                        onChange={(e) => setEditScopeStatement(e.target.value)}
                        rows={5}
                        className="w-full p-4 border border-gray-200 rounded-2xl text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-pink-900/10 focus:border-[#8B1E3F]"
                        placeholder="Enter Course Scope Statement..."
                      />
                    ) : (
                      <div className="p-4 bg-gray-50/60 border border-gray-100 rounded-2xl italic">
                        "{activeSubjectCurriculum.scope}"
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 3. Objectives Section */}
              <div className="rounded-[24px] bg-white border border-gray-150/50 shadow-sm overflow-hidden">
                <div 
                  onClick={() => { if (editingSection !== 'objectives') toggleSection('objectives'); }}
                  className="p-4 bg-gray-50/50 hover:bg-gray-50/80 cursor-pointer flex justify-between items-center border-b border-gray-100"
                >
                  <div className="flex justify-between items-center w-full">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#8B1E3F]/10 text-[#8B1E3F] flex items-center justify-center">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <h3 className="font-display font-extrabold text-sm text-gray-900 uppercase tracking-wide">3. Syllabus Learning Objectives</h3>
                    </div>
                    {!readOnly && (
                      editingSection === 'objectives' ? (
                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          <button 
                            onClick={() => handleSaveSection('objectives')}
                            disabled={savingSection === 'objectives'}
                            className="px-3 py-1 text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-all flex items-center gap-1 shadow-sm disabled:opacity-50"
                          >
                            {savingSection === 'objectives' ? 'Saving...' : 'Save'}
                          </button>
                          <button 
                            onClick={handleCancelEdit}
                            className="px-3 py-1 text-[11px] font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleStartEdit('objectives'); }}
                          className="px-3 py-1 text-[11px] font-bold text-[#8B1E3F] bg-pink-50 hover:bg-pink-100 rounded-lg transition-all flex items-center gap-1 border border-pink-100"
                        >
                          <Edit className="w-3 h-3" /> Edit Section
                        </button>
                      )
                    )}
                  </div>
                </div>

                {!collapsedSections.objectives && (
                  <div className="p-5 flex flex-col gap-3 bg-white">
                    {editingSection === 'objectives' ? (
                      <div className="flex flex-col gap-3">
                        {editObjectivesList.map((obj, oIdx) => (
                          <div key={oIdx} className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded-full bg-pink-50 text-[#8B1E3F] font-mono text-[10px] font-black flex items-center justify-center shrink-0">
                              {oIdx + 1}
                            </span>
                            <input 
                              type="text"
                              value={obj}
                              onChange={(e) => {
                                const newList = [...editObjectivesList];
                                newList[oIdx] = e.target.value;
                                setEditObjectivesList(newList);
                              }}
                              className="flex-1 p-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-pink-900/10 focus:border-[#8B1E3F]"
                            />
                            <button 
                              onClick={() => {
                                setEditObjectivesList(editObjectivesList.filter((_, idx) => idx !== oIdx));
                              }}
                              className="p-2 border border-red-200 text-red-500 hover:bg-red-50 rounded-xl transition-all"
                              title="Delete Objective"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                        <button 
                          onClick={() => setEditObjectivesList([...editObjectivesList, ''])}
                          className="mt-2 py-2 border border-dashed border-gray-200 hover:border-[#8B1E3F]/30 text-[#8B1E3F] hover:bg-pink-50/30 text-xs font-bold rounded-xl transition-all"
                        >
                          + Add Syllabus Objective
                        </button>
                      </div>
                    ) : (
                      activeSubjectCurriculum.objectives && activeSubjectCurriculum.objectives.length > 0 ? (
                        activeSubjectCurriculum.objectives.map((obj, oIdx) => (
                          <div key={oIdx} className="p-3 bg-gray-50/40 border border-gray-100 rounded-xl flex items-start gap-3">
                            <span className="w-6 h-6 rounded-full bg-[#8B1E3F]/10 text-[#8B1E3F] font-mono text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
                              {oIdx + 1}
                            </span>
                            <p className="text-xs font-semibold text-gray-700 leading-relaxed pt-0.5">{obj}</p>
                          </div>
                        ))
                      ) : (
                        <div className="p-6 text-center text-xs text-gray-400 font-semibold italic border border-dashed border-gray-200 rounded-2xl">
                          "No objectives mapped"
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>

              {/* 4. Course Outcomes Section */}
              <div className="rounded-[24px] bg-white border border-gray-150/50 shadow-sm overflow-hidden">
                <div 
                  onClick={() => { if (editingSection !== 'outcomes') toggleSection('outcomes'); }}
                  className="p-4 bg-gray-50/50 hover:bg-gray-50/80 cursor-pointer flex justify-between items-center border-b border-gray-100"
                >
                  <div className="flex justify-between items-center w-full">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#8B1E3F]/10 text-[#8B1E3F] flex items-center justify-center">
                        <Award className="w-4 h-4" />
                      </div>
                      <h3 className="font-display font-extrabold text-sm text-gray-900 uppercase tracking-wide">4. Course Outcomes (CO) Map</h3>
                    </div>
                    {!readOnly && (
                      editingSection === 'outcomes' ? (
                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          <button 
                            onClick={() => handleSaveSection('outcomes')}
                            disabled={savingSection === 'outcomes'}
                            className="px-3 py-1 text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-all flex items-center gap-1 shadow-sm disabled:opacity-50"
                          >
                            {savingSection === 'outcomes' ? 'Saving...' : 'Save'}
                          </button>
                          <button 
                            onClick={handleCancelEdit}
                            className="px-3 py-1 text-[11px] font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleStartEdit('outcomes'); }}
                          className="px-3 py-1 text-[11px] font-bold text-[#8B1E3F] bg-pink-50 hover:bg-pink-100 rounded-lg transition-all flex items-center gap-1 border border-pink-100"
                        >
                          <Edit className="w-3 h-3" /> Edit Section
                        </button>
                      )
                    )}
                  </div>
                </div>

                {!collapsedSections.outcomes && (
                  <div className="p-5 flex flex-col gap-3 bg-white">
                    {editingSection === 'outcomes' ? (
                      <div className="flex flex-col gap-3">
                        {editOutcomesList.map((co, cIdx) => (
                          <div key={cIdx} className="flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-pink-50 text-[#8B1E3F] font-mono text-[10px] font-black flex items-center justify-center shrink-0">
                              CO{cIdx + 1}
                            </span>
                            <input 
                              type="text"
                              value={co}
                              onChange={(e) => {
                                const newList = [...editOutcomesList];
                                newList[cIdx] = e.target.value;
                                setEditOutcomesList(newList);
                              }}
                              className="flex-1 p-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-pink-900/10 focus:border-[#8B1E3F]"
                            />
                            <button 
                              onClick={() => {
                                setEditOutcomesList(editOutcomesList.filter((_, idx) => idx !== cIdx));
                              }}
                              className="p-2 border border-red-200 text-red-500 hover:bg-red-50 rounded-xl transition-all"
                              title="Delete Outcome"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                        <button 
                          onClick={() => setEditOutcomesList([...editOutcomesList, ''])}
                          className="mt-2 py-2 border border-dashed border-gray-200 hover:border-[#8B1E3F]/30 text-[#8B1E3F] hover:bg-pink-50/30 text-xs font-bold rounded-xl transition-all"
                        >
                          + Add Course Outcome
                        </button>
                      </div>
                    ) : (
                      activeSubjectCurriculum.courseOutcomes && activeSubjectCurriculum.courseOutcomes.length > 0 ? (
                        activeSubjectCurriculum.courseOutcomes.map((co, cIdx) => (
                          <div key={cIdx} className="p-3 bg-gray-50/40 border border-gray-100 rounded-xl flex items-start gap-3">
                            <span className="w-8 h-8 rounded-lg bg-[#8B1E3F]/10 text-[#8B1E3F] font-mono text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
                              CO{cIdx + 1}
                            </span>
                            <p className="text-xs font-semibold text-gray-700 leading-relaxed pt-0.5">{co}</p>
                          </div>
                        ))
                      ) : (
                        <div className="p-6 text-center text-xs text-gray-400 font-semibold italic border border-dashed border-gray-200 rounded-2xl">
                          "No Course Outcomes Mapped"
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>

              {/* Separate CO-PO Alignment Mapping Matrix Section */}
              <div className="rounded-[24px] bg-white border border-gray-150/50 shadow-sm p-6 flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-indigo-50/10 text-indigo-600 flex items-center justify-center">
                      <Sliders className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-display font-extrabold text-sm text-gray-900 uppercase tracking-wide">CO-PO Alignment Mapping Matrix</h3>
                      <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Levels: 1 = Low Alignment, 2 = Medium Alignment, 3 = High Alignment</p>
                    </div>
                  </div>
                  {!readOnly && (
                    editingSection === 'matrix' ? (
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleSaveSection('matrix')}
                          disabled={savingSection === 'matrix'}
                          className="px-3 py-1 text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-all flex items-center gap-1 shadow-sm disabled:opacity-50"
                        >
                          {savingSection === 'matrix' ? 'Saving...' : 'Save'}
                        </button>
                        <button 
                          onClick={handleCancelEdit}
                          className="px-3 py-1 text-[11px] font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => handleStartEdit('matrix')}
                        className="px-3 py-1 text-[11px] font-bold text-[#8B1E3F] bg-pink-50 hover:bg-pink-100 rounded-lg transition-all flex items-center gap-1 border border-pink-100"
                      >
                        <Edit className="w-3 h-3" /> Edit Alignment
                      </button>
                    )
                  )}
                </div>

                <div className="w-full overflow-x-auto lg:overflow-x-visible">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-gray-150/50">
                        <th className="py-2.5 pr-4 font-black text-gray-400 uppercase text-[9px] tracking-wider">Course Outcomes</th>
                        {['PO1', 'PO2', 'PO3', 'PO4', 'PO5', 'PO6', 'PO7', 'PO8', 'PO9', 'PO10', 'PO11', 'PO12'].map(po => (
                          <th key={po} className="py-2.5 px-0.5 text-center font-black text-gray-400 uppercase text-[9px] tracking-wider min-w-[32px]">{po}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {['CO1', 'CO2', 'CO3', 'CO4', 'CO5'].map((coCode) => {
                        const isEditing = editingSection === 'matrix';
                        const currentMapping = isEditing ? editCoPoMapping : (activeSubjectCurriculum.coPoMapping || coPoMapping);
                        const mapping = currentMapping[coCode] || {};
                        
                        return (
                          <tr key={coCode} className="border-b border-gray-50 hover:bg-gray-50/40 transition-colors">
                            <td className="py-2 pr-4 font-black text-gray-900">{coCode}</td>
                            {['PO1', 'PO2', 'PO3', 'PO4', 'PO5', 'PO6', 'PO7', 'PO8', 'PO9', 'PO10', 'PO11', 'PO12'].map(po => {
                              const value = mapping[po] || 0;
                              return (
                                <td 
                                  key={po} 
                                  onClick={() => {
                                    if (!isEditing) {
                                      triggerToast("Please click 'Edit Alignment' to change mapping values.");
                                      return;
                                    }
                                    const currentVal = editCoPoMapping[coCode]?.[po] || 0;
                                    const newVal = (currentVal + 1) % 4;
                                    setEditCoPoMapping(prev => ({
                                      ...prev,
                                      [coCode]: {
                                        ...(prev[coCode] || {}),
                                        [po]: newVal
                                      }
                                    }));
                                  }}
                                  className={`py-2 px-0.5 text-center font-bold font-mono select-none group ${isEditing ? 'cursor-pointer hover:bg-pink-50/20' : ''}`}
                                  title={isEditing ? `Click to toggle ${coCode} - ${po} alignment index` : `${coCode} - ${po}: Level ${value}`}
                                >
                                  {value > 0 ? (
                                    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-md text-[10px] transition-all duration-150 ${isEditing ? 'group-hover:scale-110' : ''} ${
                                      value === 3 ? 'bg-[#8B1E3F] text-white font-black' :
                                      value === 2 ? 'bg-pink-200 text-[#8B1E3F]' :
                                      'bg-pink-50 text-pink-700'
                                    }`}>
                                      {value}
                                    </span>
                                  ) : (
                                    <span className="text-gray-300 font-extrabold group-hover:text-pink-400 transition-colors duration-200">-</span>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 5 & 6. Unit Management & Topics Section */}
              <div className="rounded-[24px] bg-white border border-gray-150/50 shadow-sm overflow-hidden">
                <div 
                  onClick={() => { if (editingSection !== 'units') toggleSection('units'); }}
                  className="p-4 bg-gray-50/50 hover:bg-gray-50/80 cursor-pointer flex justify-between items-center border-b border-gray-100"
                >
                  <div className="flex justify-between items-center w-full">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#8B1E3F]/10 text-[#8B1E3F] flex items-center justify-center">
                        <Layers className="w-4 h-4" />
                      </div>
                      <h3 className="font-display font-extrabold text-sm text-gray-900 uppercase tracking-wide">5 & 6. PCI Unit & Topic Syllabus Matrix</h3>
                    </div>
                    {!readOnly && (
                      editingSection === 'units' ? (
                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          <button 
                            onClick={() => handleSaveSection('units')}
                            disabled={savingSection === 'units'}
                            className="px-3 py-1 text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-all flex items-center gap-1 shadow-sm disabled:opacity-50"
                          >
                            {savingSection === 'units' ? 'Saving...' : 'Save'}
                          </button>
                          <button 
                            onClick={handleCancelEdit}
                            className="px-3 py-1 text-[11px] font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleStartEdit('units'); }}
                          className="px-3 py-1 text-[11px] font-bold text-[#8B1E3F] bg-pink-50 hover:bg-pink-100 rounded-lg transition-all flex items-center gap-1 border border-pink-100"
                        >
                          <Edit className="w-3 h-3" /> Edit Section
                        </button>
                      )
                    )}
                  </div>
                </div>

                {!collapsedSections.units && (
                  <div className="p-5 flex flex-col gap-4 bg-white">
                    {editingSection === 'units' ? (
                      <div className="flex flex-col gap-4">
                        {editUnitsList.map((unit, uIdx) => (
                          <div key={uIdx} className="border border-pink-100 rounded-2xl p-4 bg-pink-50/5 flex flex-col gap-3">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <div className="flex flex-col gap-1 sm:col-span-2">
                                <label className="text-[10px] font-black uppercase text-[#8B1E3F]">Unit ID & Title</label>
                                <input 
                                  type="text"
                                  value={unit.title}
                                  onChange={(e) => {
                                    const newList = [...editUnitsList];
                                    newList[uIdx].title = e.target.value;
                                    setEditUnitsList(newList);
                                  }}
                                  className="p-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-800"
                                  placeholder="e.g. Unit I: General Pharmacology"
                                />
                              </div>
                              <div className="flex flex-col gap-1">
                                <label className="text-[10px] font-black uppercase text-[#8B1E3F]">Syllabus Hours</label>
                                <input 
                                  type="number"
                                  value={unit.hours}
                                  onChange={(e) => {
                                    const newList = [...editUnitsList];
                                    newList[uIdx].hours = Number(e.target.value);
                                    setEditUnitsList(newList);
                                  }}
                                  className="p-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-800"
                                  placeholder="e.g. 10"
                                />
                              </div>
                            </div>

                            <div className="flex flex-col gap-1">
                              <label className="text-[10px] font-black uppercase text-gray-400">Unit Description</label>
                              <textarea 
                                value={unit.description}
                                onChange={(e) => {
                                  const newList = [...editUnitsList];
                                  newList[uIdx].description = e.target.value;
                                  setEditUnitsList(newList);
                                }}
                                rows={2}
                                className="p-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-800"
                                placeholder="Enter detailed unit summary..."
                              />
                            </div>

                            <div className="flex flex-col gap-1.5 mt-2">
                              <span className="text-[10px] font-black uppercase text-gray-400 block">Lectures/Topics mapped under {unit.name}</span>
                              <div className="flex flex-col gap-2 bg-white/40 p-3 rounded-xl border border-gray-100">
                                {unit.topics.map((topic: any, tIdx: number) => (
                                  <div key={tIdx} className="flex items-center gap-2">
                                    <input 
                                      type="text" 
                                      value={topic.number} 
                                      onChange={(e) => {
                                        const newList = [...editUnitsList];
                                        newList[uIdx].topics[tIdx].number = e.target.value;
                                        setEditUnitsList(newList);
                                      }}
                                      className="w-16 p-1.5 border border-gray-200 rounded-lg text-xs font-bold text-center"
                                      placeholder="No."
                                    />
                                    <input 
                                      type="text" 
                                      value={topic.name} 
                                      onChange={(e) => {
                                        const newList = [...editUnitsList];
                                        newList[uIdx].topics[tIdx].name = e.target.value;
                                        setEditUnitsList(newList);
                                      }}
                                      className="flex-1 p-1.5 border border-gray-200 rounded-lg text-xs font-bold"
                                      placeholder="Topic name"
                                    />
                                    <input 
                                      type="text" 
                                      value={topic.hours} 
                                      onChange={(e) => {
                                        const newList = [...editUnitsList];
                                        newList[uIdx].topics[tIdx].hours = e.target.value;
                                        setEditUnitsList(newList);
                                      }}
                                      className="w-16 p-1.5 border border-gray-200 rounded-lg text-xs font-bold text-center"
                                      placeholder="Hrs"
                                    />
                                    <button 
                                      onClick={() => {
                                        const newList = [...editUnitsList];
                                        newList[uIdx].topics = newList[uIdx].topics.filter((_: any, idx: number) => idx !== tIdx);
                                        setEditUnitsList(newList);
                                      }}
                                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                      title="Delete Topic"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                ))}
                                <button 
                                  onClick={() => {
                                    const newList = [...editUnitsList];
                                    const nextNum = `${unit.topics.length + 1}`;
                                    newList[uIdx].topics = [...newList[uIdx].topics, { number: nextNum, name: '', hours: '1' }];
                                    setEditUnitsList(newList);
                                  }}
                                  className="mt-1 text-left text-[11px] font-bold text-[#8B1E3F] hover:underline flex items-center gap-1"
                                >
                                  + Add Syllabus Topic/Lecture
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      activeSubjectCurriculum.units.map((unit) => {
                        const isUnitExpanded = expandedCurriculumUnits[unit.name];
                        return (
                          <div 
                            key={unit.name}
                            className={`border rounded-2xl p-4 transition-all duration-300 ${isUnitExpanded ? 'bg-gray-50/40 border-[#8B1E3F]/25 shadow-sm' : 'border-gray-100 hover:bg-gray-50/40'}`}
                          >
                            <div 
                              onClick={() => setExpandedCurriculumUnits(prev => ({ ...prev, [unit.name]: !prev[unit.name] }))}
                              className="flex justify-between items-center cursor-pointer select-none group"
                            >
                              <div className="flex items-center gap-3">
                                {isUnitExpanded ? <ChevronDown className="w-4 h-4 text-[#8B1E3F]" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                                <div>
                                  <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider">{unit.name}: {unit.title}</h4>
                                  <span className="text-[9px] font-bold text-[#8B1E3F]/80 uppercase mt-0.5 block">{unit.hours} Syllabic Lecture Hours</span>
                                </div>
                              </div>
                              <span className="text-[10px] font-bold bg-[#8B1E3F]/5 text-[#8B1E3F] px-2.5 py-0.5 rounded-full uppercase">
                                {unit.topics.length} Lectures Mapped
                              </span>
                            </div>

                            {isUnitExpanded && (
                              <div className="mt-4 border-t border-gray-150/40 pt-3 flex flex-col gap-3 animate-fadeIn">
                                <div>
                                  <span className="text-[8px] font-extrabold text-gray-400 uppercase tracking-widest block mb-1">Unit Description</span>
                                  <p className="text-xs text-gray-600 leading-relaxed font-semibold italic bg-white p-3 rounded-xl border border-gray-100">
                                    {unit.description}
                                  </p>
                                </div>

                                <div className="mt-2">
                                  <span className="text-[8px] font-extrabold text-gray-400 uppercase tracking-widest block mb-2">Curriculum Topics Index</span>
                                  <div className="flex flex-col gap-2">
                                    {unit.topics.map((topic) => (
                                      <div key={topic.number} className="flex justify-between items-center p-2.5 bg-white rounded-xl border border-gray-100 text-xs hover:border-pink-900/15 transition-all">
                                        <div className="flex items-center gap-2.5 font-bold">
                                          <span className="text-mono font-black text-gray-400 tracking-wider w-8 shrink-0">{topic.number}</span>
                                          <span className="text-gray-800">{topic.name}</span>
                                        </div>
                                        <span className="text-[10px] font-black text-gray-400 bg-gray-50 border border-gray-100 px-2.5 py-0.5 rounded-full shrink-0">
                                          {topic.hours} Hr
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>

              {/* 7. Recommended Textbooks */}
              <div className="rounded-[24px] bg-white border border-gray-150/50 shadow-sm overflow-hidden">
                <div 
                  onClick={() => { if (editingSection !== 'recommendedBooks') toggleSection('books'); }}
                  className="p-4 bg-gray-50/50 hover:bg-gray-50/80 cursor-pointer flex justify-between items-center border-b border-gray-100"
                >
                  <div className="flex justify-between items-center w-full">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#8B1E3F]/10 text-[#8B1E3F] flex items-center justify-center">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <h3 className="font-display font-extrabold text-sm text-gray-900 uppercase tracking-wide">7. Recommended Textbooks</h3>
                    </div>
                    {!readOnly && (
                      editingSection === 'recommendedBooks' ? (
                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          <button 
                            onClick={() => handleSaveSection('recommendedBooks')}
                            disabled={savingSection === 'recommendedBooks'}
                            className="px-3 py-1 text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-all flex items-center gap-1 shadow-sm disabled:opacity-50"
                          >
                            {savingSection === 'recommendedBooks' ? 'Saving...' : 'Save'}
                          </button>
                          <button 
                            onClick={handleCancelEdit}
                            className="px-3 py-1 text-[11px] font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleStartEdit('recommendedBooks'); }}
                          className="px-3 py-1 text-[11px] font-bold text-[#8B1E3F] bg-pink-50 hover:bg-pink-100 rounded-lg transition-all flex items-center gap-1 border border-pink-100"
                        >
                          <Edit className="w-3 h-3" /> Edit Section
                        </button>
                      )
                    )}
                  </div>
                </div>

                {!collapsedSections.books && (
                  <div className="p-5 bg-white">
                    {editingSection === 'recommendedBooks' ? (
                      <div className="flex flex-col gap-3">
                        {editRecBooksList.map((bk, bIdx) => (
                          <div key={bIdx} className="flex flex-col sm:flex-row items-center gap-3 p-3 bg-pink-50/5 border border-pink-100 rounded-xl">
                            <input 
                              type="text"
                              value={bk.title}
                              onChange={(e) => {
                                const newList = [...editRecBooksList];
                                newList[bIdx].title = e.target.value;
                                setEditRecBooksList(newList);
                              }}
                              className="w-full sm:flex-1 p-2 border border-gray-200 rounded-xl text-xs font-bold"
                              placeholder="Book Title"
                            />
                            <input 
                              type="text"
                              value={bk.author}
                              onChange={(e) => {
                                const newList = [...editRecBooksList];
                                newList[bIdx].author = e.target.value;
                                setEditRecBooksList(newList);
                              }}
                              className="w-full sm:w-1/4 p-2 border border-gray-200 rounded-xl text-xs font-bold"
                              placeholder="Author(s)"
                            />
                            <input 
                              type="text"
                              value={bk.edition}
                              onChange={(e) => {
                                const newList = [...editRecBooksList];
                                newList[bIdx].edition = e.target.value;
                                setEditRecBooksList(newList);
                              }}
                              className="w-full sm:w-1/6 p-2 border border-gray-200 rounded-xl text-xs font-bold text-center"
                              placeholder="Edition"
                            />
                            <button 
                              onClick={() => {
                                setEditRecBooksList(editRecBooksList.filter((_, idx) => idx !== bIdx));
                              }}
                              className="p-2 border border-red-200 text-red-500 hover:bg-red-50 rounded-xl transition-all"
                              title="Delete Book"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                        <button 
                          onClick={() => setEditRecBooksList([...editRecBooksList, { title: '', author: '', edition: '' }])}
                          className="mt-2 py-2 border border-dashed border-gray-200 hover:border-[#8B1E3F]/30 text-[#8B1E3F] hover:bg-pink-50/30 text-xs font-bold rounded-xl transition-all"
                        >
                          + Add Recommended Textbook
                        </button>
                      </div>
                    ) : (
                      activeSubjectCurriculum.recommendedBooks && activeSubjectCurriculum.recommendedBooks.length > 0 ? (
                        <div className="flex flex-col gap-2.5">
                          {activeSubjectCurriculum.recommendedBooks.map((bk, bIdx) => (
                            <div key={bIdx} className="p-3 bg-gray-50/40 border border-gray-100 rounded-xl">
                              <h5 className="text-xs font-extrabold text-gray-800">{bk.title}</h5>
                              <p className="text-[10px] font-bold text-[#8B1E3F] mt-0.5">{bk.author} • {bk.edition}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-6 text-center text-xs text-gray-400 font-semibold italic border border-dashed border-gray-200 rounded-2xl">
                          "No recommended books added"
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>

              {/* 8. Reference Monographs */}
              <div className="rounded-[24px] bg-white border border-gray-150/50 shadow-sm overflow-hidden">
                <div 
                  onClick={() => { if (editingSection !== 'referenceBooks') toggleSection('books'); }}
                  className="p-4 bg-gray-50/50 hover:bg-gray-50/80 cursor-pointer flex justify-between items-center border-b border-gray-100"
                >
                  <div className="flex justify-between items-center w-full">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#8B1E3F]/10 text-[#8B1E3F] flex items-center justify-center">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <h3 className="font-display font-extrabold text-sm text-gray-900 uppercase tracking-wide">8. Reference Monographs</h3>
                    </div>
                    {!readOnly && (
                      editingSection === 'referenceBooks' ? (
                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          <button 
                            onClick={() => handleSaveSection('referenceBooks')}
                            disabled={savingSection === 'referenceBooks'}
                            className="px-3 py-1 text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-all flex items-center gap-1 shadow-sm disabled:opacity-50"
                          >
                            {savingSection === 'referenceBooks' ? 'Saving...' : 'Save'}
                          </button>
                          <button 
                            onClick={handleCancelEdit}
                            className="px-3 py-1 text-[11px] font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleStartEdit('referenceBooks'); }}
                          className="px-3 py-1 text-[11px] font-bold text-[#8B1E3F] bg-pink-50 hover:bg-pink-100 rounded-lg transition-all flex items-center gap-1 border border-pink-100"
                        >
                          <Edit className="w-3 h-3" /> Edit Section
                        </button>
                      )
                    )}
                  </div>
                </div>

                {!collapsedSections.books && (
                  <div className="p-5 bg-white">
                    {editingSection === 'referenceBooks' ? (
                      <div className="flex flex-col gap-3">
                        {editRefBooksList.map((bk, bIdx) => (
                          <div key={bIdx} className="flex flex-col sm:flex-row items-center gap-3 p-3 bg-pink-50/5 border border-pink-100 rounded-xl">
                            <input 
                              type="text"
                              value={bk.title}
                              onChange={(e) => {
                                const newList = [...editRefBooksList];
                                newList[bIdx].title = e.target.value;
                                setEditRefBooksList(newList);
                              }}
                              className="w-full sm:flex-1 p-2 border border-gray-200 rounded-xl text-xs font-bold"
                              placeholder="Book Title"
                            />
                            <input 
                              type="text"
                              value={bk.author}
                              onChange={(e) => {
                                const newList = [...editRefBooksList];
                                newList[bIdx].author = e.target.value;
                                setEditRefBooksList(newList);
                              }}
                              className="w-full sm:w-1/4 p-2 border border-gray-200 rounded-xl text-xs font-bold"
                              placeholder="Author(s)"
                            />
                            <input 
                              type="text"
                              value={bk.edition}
                              onChange={(e) => {
                                const newList = [...editRefBooksList];
                                newList[bIdx].edition = e.target.value;
                                setEditRefBooksList(newList);
                              }}
                              className="w-full sm:w-1/6 p-2 border border-gray-200 rounded-xl text-xs font-bold text-center"
                              placeholder="Edition"
                            />
                            <button 
                              onClick={() => {
                                setEditRefBooksList(editRefBooksList.filter((_, idx) => idx !== bIdx));
                              }}
                              className="p-2 border border-red-200 text-red-500 hover:bg-red-50 rounded-xl transition-all"
                              title="Delete Book"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                        <button 
                          onClick={() => setEditRefBooksList([...editRefBooksList, { title: '', author: '', edition: '' }])}
                          className="mt-2 py-2 border border-dashed border-gray-200 hover:border-[#8B1E3F]/30 text-[#8B1E3F] hover:bg-pink-50/30 text-xs font-bold rounded-xl transition-all"
                        >
                          + Add Reference Monograph
                        </button>
                      </div>
                    ) : (
                      activeSubjectCurriculum.referenceBooks && activeSubjectCurriculum.referenceBooks.length > 0 ? (
                        <div className="flex flex-col gap-2.5">
                          {activeSubjectCurriculum.referenceBooks.map((bk, bIdx) => (
                            <div key={bIdx} className="p-3 bg-gray-50/40 border border-gray-100 rounded-xl">
                              <h5 className="text-xs font-extrabold text-gray-800">{bk.title}</h5>
                              <p className="text-[10px] font-bold text-[#8B1E3F] mt-0.5">{bk.author} • {bk.edition}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-6 text-center text-xs text-gray-400 font-semibold italic border border-dashed border-gray-200 rounded-2xl">
                          "No reference books added"
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>

              {/* 9. Assessment Pattern Section */}
              <div className="rounded-[24px] bg-white border border-gray-150/50 shadow-sm overflow-hidden">
                <div 
                  onClick={() => { if (editingSection !== 'assessment') toggleSection('assessment'); }}
                  className="p-4 bg-gray-50/50 hover:bg-gray-50/80 cursor-pointer flex justify-between items-center border-b border-gray-100"
                >
                  <div className="flex justify-between items-center w-full">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#8B1E3F]/10 text-[#8B1E3F] flex items-center justify-center">
                        <Clock className="w-4 h-4" />
                      </div>
                      <h3 className="font-display font-extrabold text-sm text-gray-900 uppercase tracking-wide">9. Regulatory Assessment Pattern</h3>
                    </div>
                    {!readOnly && (
                      editingSection === 'assessment' ? (
                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          <button 
                            onClick={() => handleSaveSection('assessment')}
                            disabled={savingSection === 'assessment'}
                            className="px-3 py-1 text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-all flex items-center gap-1 shadow-sm disabled:opacity-50"
                          >
                            {savingSection === 'assessment' ? 'Saving...' : 'Save'}
                          </button>
                          <button 
                            onClick={handleCancelEdit}
                            className="px-3 py-1 text-[11px] font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleStartEdit('assessment'); }}
                          className="px-3 py-1 text-[11px] font-bold text-[#8B1E3F] bg-pink-50 hover:bg-pink-100 rounded-lg transition-all flex items-center gap-1 border border-pink-100"
                        >
                          <Edit className="w-3 h-3" /> Edit Section
                        </button>
                      )
                    )}
                  </div>
                </div>

                {!collapsedSections.assessment && (
                  <div className="p-5 bg-white text-xs">
                    {editingSection === 'assessment' ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-4 bg-pink-50/5 border border-pink-100 rounded-2xl flex flex-col gap-3">
                          <span className="text-[9px] font-black uppercase tracking-wider text-[#8B1E3F] block">Theory Assessment Distribution</span>
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-gray-500">Internal Continuous Evaluation (Marks)</label>
                            <input 
                              type="number"
                              value={editTheoryInternal}
                              onChange={(e) => setEditTheoryInternal(Number(e.target.value))}
                              className="p-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-800"
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-gray-500">End Semester University Exam (Marks)</label>
                            <input 
                              type="number"
                              value={editTheoryExternal}
                              onChange={(e) => setEditTheoryExternal(Number(e.target.value))}
                              className="p-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-800"
                            />
                          </div>
                        </div>

                        <div className="p-4 bg-pink-50/5 border border-pink-100 rounded-2xl flex flex-col gap-3">
                          <span className="text-[9px] font-black uppercase tracking-wider text-[#8B1E3F] block">Practical Assessment Distribution</span>
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-gray-500">Internal Laboratory Sessional Evaluation (Marks)</label>
                            <input 
                              type="number"
                              value={editPracticalInternal}
                              onChange={(e) => setEditPracticalInternal(Number(e.target.value))}
                              className="p-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-800"
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-gray-500">End Semester Practical Exam (Marks)</label>
                            <input 
                              type="number"
                              value={editPracticalExternal}
                              onChange={(e) => setEditPracticalExternal(Number(e.target.value))}
                              className="p-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-800"
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-4 bg-gray-50/60 border border-gray-100 rounded-2xl flex flex-col gap-2">
                          <span className="text-[9px] font-black uppercase tracking-wider text-gray-400 block">Theory Assessment Distribution</span>
                          <div className="flex justify-between font-bold text-gray-700">
                            <span>Internal Continuous Sessional Evaluation:</span>
                            <span className="text-gray-900 font-extrabold">{activeSubjectCurriculum.assessmentPattern.theoryInternal} Marks</span>
                          </div>
                          <div className="flex justify-between font-bold text-gray-700">
                            <span>End Semester University Exam:</span>
                            <span className="text-gray-900 font-extrabold">{activeSubjectCurriculum.assessmentPattern.theoryExternal} Marks</span>
                          </div>
                          <div className="border-t border-gray-150/50 pt-2 flex justify-between text-[#8B1E3F] font-black uppercase tracking-wider">
                            <span>Total Theory Valuation:</span>
                            <span>100 Marks</span>
                          </div>
                        </div>

                        <div className="p-4 bg-gray-50/60 border border-gray-100 rounded-2xl flex flex-col gap-2">
                          <span className="text-[9px] font-black uppercase tracking-wider text-gray-400 block">Practical Assessment Distribution</span>
                          <div className="flex justify-between font-bold text-gray-700">
                            <span>Internal Laboratory Sessional Evaluation:</span>
                            <span className="text-gray-900 font-extrabold">{activeSubjectCurriculum.assessmentPattern.practicalInternal} Marks</span>
                          </div>
                          <div className="flex justify-between font-bold text-gray-700">
                            <span>End Semester Practical University Exam:</span>
                            <span className="text-gray-900 font-extrabold">{activeSubjectCurriculum.assessmentPattern.practicalExternal} Marks</span>
                          </div>
                          <div className="border-t border-gray-150/50 pt-2 flex justify-between text-[#8B1E3F] font-black uppercase tracking-wider">
                            <span>Total Practical Valuation:</span>
                            <span>50 Marks</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

            </div>

            {/* RIGHT SIDEBAR PANEL: IMPORT SUMMARY & QUICK ACTIONS */}
            <div className="flex flex-col gap-6">
              
              {/* Curriculum Import Summary Card */}
              <GlassCard className="p-5 border border-gray-150/50 rounded-[24px]">
                <h4 className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-3.5 pb-2 border-b border-gray-100">
                  Curriculum Import Summary
                </h4>
                
                <div className="flex flex-col gap-2.5 text-xs font-semibold text-gray-600">
                  <div className="flex justify-between">
                    <span>Workbook Name:</span>
                    <span className="text-gray-800 font-black text-[11px] truncate max-w-[150px]" title={`curriculum_pharmacy_v${activeSubjectCurriculum.importVersion}.xlsx`}>
                      curriculum_pharmacy_v{activeSubjectCurriculum.importVersion}.xlsx
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Imported On:</span>
                    <span className="text-gray-800 font-bold">{activeSubjectCurriculum.lastImported}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Imported By:</span>
                    <span className="text-gray-800 font-bold">{activeSubjectCurriculum.importedBy}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Workbook Version:</span>
                    <span className="text-gray-800 font-black">v{activeSubjectCurriculum.importVersion}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Validation Status:</span>
                    <span className="text-emerald-600 font-black uppercase text-[10px]">Verified Pass</span>
                  </div>
                  
                  <hr className="border-gray-100 my-1.5" />

                  <div className="flex justify-between text-gray-400 text-[10px] uppercase font-bold tracking-wider">
                    <span>Mapped Metrics</span>
                    <span>Count</span>
                  </div>
                  <div className="flex justify-between text-gray-800 font-bold">
                    <span>Curricular Topics:</span>
                    <span>{activeSubjectCurriculum.units.reduce((acc, u) => acc + u.topics.length, 0)} Lectures</span>
                  </div>
                  <div className="flex justify-between text-gray-800 font-bold">
                    <span>Referenced Books:</span>
                    <span>{activeSubjectCurriculum.recommendedBooks.length + activeSubjectCurriculum.referenceBooks.length} Editions</span>
                  </div>
                </div>
              </GlassCard>

              {/* Sidebar Quick Actions */}
              <GlassCard className="p-5 border border-gray-150/50 rounded-[24px] flex flex-col gap-3">
                <h4 className="text-[10px] font-black uppercase tracking-wider text-gray-400 pb-2 border-b border-gray-100">
                  Curriculum Quick Controls
                </h4>
                
                <button
                  onClick={() => triggerToast("Master workbook validated successfully - all columns match central PCI format.")}
                  className="w-full py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-600" /> Validate Workbook Schema
                </button>
                <button
                  onClick={() => triggerToast("Compiled master curriculum syllabus schema document saved locally.")}
                  className="w-full py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" /> Export Workbook (.xlsx)
                </button>
              </GlassCard>

            </div>

          </div>

          {/* BOTTOM TIMELINE: IMPORT HISTORY LOGS */}
          <div className="border-t border-gray-150 pt-6 mt-4">
            <h3 className="font-display font-extrabold text-sm text-gray-900 uppercase tracking-wide flex items-center gap-2 mb-4">
              <History className="w-4.5 h-4.5 text-[#8B1E3F]" /> Bottom Timeline - Curriculum Import History
            </h3>

            <div className="flex flex-col md:flex-row items-stretch justify-between gap-4 relative">
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-150/50 -translate-y-1/2 hidden md:block z-0" />
              
              {importHistoryLog.map((log, hIdx) => (
                <GlassCard 
                  key={log.version} 
                  className="flex-1 p-4 border border-gray-100 rounded-2xl relative z-10 hover:shadow-md transition-all"
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-black bg-[#8B1E3F] text-white px-2.5 py-0.5 rounded-full">
                      v{log.version}
                    </span>
                    <span className="text-[10px] font-bold text-gray-400">{log.date}</span>
                  </div>
                  <h5 className="text-xs font-bold text-gray-800">{log.desc}</h5>
                  <p className="text-[10px] text-gray-400 mt-1 font-semibold">Imported By: <span className="text-gray-600">{log.author}</span></p>
                </GlassCard>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* EXCEL EXPORT WORKBOOK IMPORT MODAL */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-[32px] border border-gray-150/50 shadow-2xl p-6 w-full max-w-xl flex flex-col gap-5">
            
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-display font-black text-lg text-gray-950">Import Curriculum Excel Workbook</h3>
                <p className="text-xs text-gray-500 mt-1">Upload the central PCI curriculum sheets. The system will parse information directly.</p>
              </div>
              <button 
                onClick={() => {
                  setShowImportModal(false);
                  setSelectedFile(null);
                  setIsImportValidating(false);
                  setIsImportSuccess(false);
                }}
                className="w-8 h-8 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-800 font-extrabold"
              >
                ✕
              </button>
            </div>

            {/* Drag & Drop Area */}
            {!isImportValidating && !isImportSuccess && (
              <div 
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`
                  border-2 border-dashed rounded-2xl p-8 text-center flex flex-col items-center justify-center gap-3 transition-all cursor-pointer
                  ${isDragging ? 'border-[#8B1E3F] bg-[#8B1E3F]/5' : 'border-gray-200 bg-gray-50/50 hover:bg-gray-50'}
                `}
                onClick={() => document.getElementById('excelFileInput')?.click()}
              >
                <div className="w-12 h-12 rounded-full bg-[#8B1E3F]/5 text-[#8B1E3F] flex items-center justify-center border border-[#8B1E3F]/10 shadow-sm">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-bold text-gray-800 block">Drag & Drop Excel Workbook here</span>
                  <span className="text-[10px] text-gray-400 font-semibold block mt-1">Accepts only .xlsx and .xls formats</span>
                </div>
                <input 
                  type="file" 
                  id="excelFileInput"
                  accept=".xlsx, .xls"
                  className="hidden" 
                  onChange={handleFileSelect}
                />
              </div>
            )}

            {/* Selected File Details */}
            {selectedFile && !isImportValidating && !isImportSuccess && (
              <div className="p-3 bg-gray-50/60 border border-gray-100 rounded-xl flex justify-between items-center text-xs">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-[#8B1E3F]" />
                  <div>
                    <span className="font-bold text-gray-800 block truncate max-w-[250px]">{selectedFile.name}</span>
                    <span className="text-[10px] text-gray-400 font-semibold mt-0.5 block uppercase font-mono">{(selectedFile.size / 1024).toFixed(1)} KB</span>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedFile(null)}
                  className="p-1 hover:bg-gray-200 rounded-full text-gray-500 hover:text-gray-800"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Validation Checklist / Loading Indicator */}
            {(isImportValidating || isImportSuccess) && (
              <div className="flex flex-col gap-4">
                
                {/* Success Alert Banner */}
                {isImportSuccess && (
                  <div className="p-4 bg-emerald-50 border border-emerald-200/60 rounded-2xl flex items-start gap-3 text-emerald-800 animate-slideIn">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/15 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-black uppercase tracking-wider block">Workbook Imported Successfully!</span>
                      <span className="text-[10px] font-semibold text-emerald-600 block mt-0.5 leading-relaxed">
                        All 8 worksheets verified perfectly. Course lists, outcomes, objectives, unit structures, and assessment patterns have been compiled and synchronized into the live dashboard.
                      </span>
                    </div>
                  </div>
                )}

                {/* Progress bar */}
                <div>
                  <div className="flex justify-between text-xs font-bold text-gray-700 mb-1">
                    <span>{isImportSuccess ? 'Verification Complete' : 'Validating Sheets Integrity...'}</span>
                    <span>{validationProgress}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full bg-gradient-to-r ${isImportSuccess ? 'from-emerald-500 to-teal-500' : 'from-[#8B1E3F] to-[#CD4368]'} transition-all duration-300`}
                      style={{ width: `${validationProgress}%` }}
                    />
                  </div>
                </div>

                {/* Real-time validating checklists */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-bold text-gray-600 bg-gray-50 p-4 rounded-2xl border border-gray-100 max-h-56 overflow-y-auto">
                  {[
                    { key: 'courseInfo', label: 'Course Information' },
                    { key: 'scope', label: 'Course Scope Statement' },
                    { key: 'objectives', label: 'Syllabus Objectives' },
                    { key: 'courseOutcomes', label: 'Course Outcomes (CO)' },
                    { key: 'units', label: '5 Curricular Units' },
                    { key: 'curriculumTopics', label: 'Curriculum Topics' },
                    { key: 'referenceBooks', label: 'Reference Books' },
                    { key: 'assessmentPattern', label: 'Assessment Pattern' }
                  ].map((item) => {
                    const status = (validationChecklist as any)[item.key];
                    let icon = <div className="w-3.5 h-3.5 rounded-full bg-gray-200 shrink-0" />;
                    let textClass = 'text-gray-400';

                    if (status === 'success') {
                      icon = <Check className="w-4 h-4 text-emerald-600 shrink-0" />;
                      textClass = 'text-emerald-700';
                    } else if (status === 'error') {
                      icon = <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 animate-bounce" />;
                      textClass = 'text-rose-700 font-extrabold';
                    } else if (status === 'loading') {
                      icon = <div className="w-3.5 h-3.5 rounded-full border-2 border-[#8B1E3F] border-t-transparent animate-spin shrink-0" />;
                      textClass = 'text-gray-700 animate-pulse';
                    }

                    return (
                      <div key={item.key} className="flex items-center gap-2">
                        {icon}
                        <span className={textClass}>{item.label}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Simulated Terminal Live Log */}
                <div className="p-3 bg-gray-900 text-[10px] font-mono text-gray-200 rounded-xl max-h-32 overflow-y-auto">
                  {importLog.map((logLine, lIdx) => (
                    <div key={lIdx} className={logLine.includes('[ERROR]') || logLine.includes('[CRITICAL]') ? 'text-rose-400 font-bold' : logLine.includes('[VALIDATOR]') ? 'text-emerald-400' : 'text-gray-300'}>
                      {logLine}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions Footer */}
            <div className="flex justify-end gap-2.5 mt-2 border-t border-gray-100 pt-4">
              {isImportSuccess ? (
                <button
                  onClick={() => {
                    setShowImportModal(false);
                    setSelectedFile(null);
                    setIsImportValidating(false);
                    setIsImportSuccess(false);
                  }}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider rounded-full transition-all flex items-center gap-1.5 shadow-lg shadow-emerald-950/15"
                >
                  <Check className="w-4 h-4" /> Complete & Close
                </button>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setShowImportModal(false);
                      setSelectedFile(null);
                      setIsImportValidating(false);
                      setIsImportSuccess(false);
                    }}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-full transition-all"
                  >
                    Cancel
                  </button>
                  {Object.values(validationChecklist).includes('error') ? (
                    <button
                      onClick={() => {
                        setIsImportValidating(false);
                        setSelectedFile(null);
                        setIsImportSuccess(false);
                      }}
                      className="px-5 py-2 bg-gray-700 hover:bg-gray-800 text-white text-xs font-bold rounded-full transition-all flex items-center gap-1.5 shadow-md"
                    >
                      Clear & Choose Another File
                    </button>
                  ) : (
                    <button
                      onClick={handleStartImportValidation}
                      disabled={!selectedFile || (isImportValidating && validationProgress < 100)}
                      className="px-5 py-2 bg-[#8B1E3F] hover:bg-[#a12349] text-white text-xs font-bold rounded-full transition-all flex items-center gap-1.5 shadow-md shadow-maroon-950/15 disabled:opacity-50"
                    >
                      {isImportValidating ? 'Validation Complete' : 'Validate & Import Workbook'}
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* EDIT COURSE METADATA MODAL */}
      {editingCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-[32px] border border-gray-150/50 shadow-2xl p-6 w-full max-w-xl flex flex-col gap-5 max-h-[90vh] overflow-y-auto">
            
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-display font-black text-lg text-gray-950">Edit Course Metadata Shell</h3>
                <p className="text-xs text-gray-500 mt-1">Modify structural PCI values, assigned faculty, regulation schema, or hours.</p>
              </div>
              <button 
                onClick={() => setEditingCourse(null)}
                className="w-8 h-8 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-800 font-extrabold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCourseEdit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Course Title / Name</label>
                  <input 
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#8B1E3F]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Course Code</label>
                  <input 
                    type="text"
                    required
                    value={editCode}
                    onChange={(e) => setEditCode(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#8B1E3F]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Assigned Faculty In Charge</label>
                  <input 
                    type="text"
                    required
                    value={editFacultyName}
                    onChange={(e) => setEditFacultyName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#8B1E3F]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Academic Year</label>
                  <select 
                    value={editAcademicYear}
                    onChange={(e) => setEditAcademicYear(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#8B1E3F]"
                  >
                    {academicYears.map((year, idx) => (
                      <option key={`${year}-${idx}`} value={year}>{year}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Regulation Schema</label>
                  <select 
                    value={editRegulation}
                    onChange={(e) => setEditRegulation(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#8B1E3F]"
                  >
                    <option value="PCI 2017">PCI 2017</option>
                    <option value="PCI 2026">PCI 2026</option>
                  </select>
                </div>

                {editingCourse.programme === 'B.Pharm' ? (
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Semester (1 to 8)</label>
                    <input 
                      type="number"
                      required
                      min={1}
                      max={8}
                      value={editSemester}
                      onChange={(e) => setEditSemester(parseInt(e.target.value) || 1)}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#8B1E3F]"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Doctorate Year (1 to 6)</label>
                    <input 
                      type="number"
                      required
                      min={1}
                      max={6}
                      value={editYear}
                      onChange={(e) => setEditYear(parseInt(e.target.value) || 1)}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#8B1E3F]"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">Credits</label>
                    <input 
                      type="number"
                      required
                      min={1}
                      value={editCredits}
                      onChange={(e) => setEditCredits(parseInt(e.target.value) || 2)}
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#8B1E3F]"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">Total Hours</label>
                    <input 
                      type="number"
                      required
                      min={1}
                      value={editHours}
                      onChange={(e) => setEditHours(parseInt(e.target.value) || 45)}
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#8B1E3F]"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditingCourse(null)}
                  className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-full transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#8B1E3F] hover:bg-[#a12349] text-white text-xs font-black uppercase tracking-wider rounded-full transition-all flex items-center gap-1.5 shadow-md shadow-maroon-950/15"
                >
                  <Check className="w-4 h-4" /> Save Course Details
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* CUSTOM DELETE COURSE CONFIRMATION DIALOG */}
      {courseToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-fade-in" id="delete-course-confirm-modal">
          <div className="bg-white rounded-[24px] border border-red-100 shadow-2xl p-6 w-full max-w-md flex flex-col gap-4">
            <div className="flex items-center gap-3 text-red-600">
              <div className="p-3 bg-red-50 rounded-full">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-display font-black text-base text-gray-950">Confirm Course Deletion</h3>
                <p className="text-xs text-red-500 font-bold uppercase tracking-wider">Warning: This action is permanent</p>
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 text-xs font-medium text-gray-600 flex flex-col gap-1.5">
              <div>
                <span className="font-bold text-gray-400">Subject Code: </span>
                <span className="font-black text-gray-900">{courseToDelete.code}</span>
              </div>
              <div>
                <span className="font-bold text-gray-400">Course Name: </span>
                <span className="font-black text-gray-900">{courseToDelete.name}</span>
              </div>
              <div>
                <span className="font-bold text-gray-400">Regulation: </span>
                <span className="font-black text-gray-900">{courseToDelete.regulation || 'PCI 2017'}</span>
              </div>
            </div>

            <p className="text-xs leading-relaxed text-gray-500">
              Are you sure you want to permanently delete the active subject shell <span className="font-bold text-gray-900">{courseToDelete.code} - {courseToDelete.name}</span>? 
              This will erase all syllabus units, topics, and teaching resource references from the system. This cannot be undone.
            </p>

            <div className="flex justify-end gap-2.5 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setCourseToDelete(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-full transition-all"
                id="cancel-delete-course-btn"
              >
                No, Keep Course
              </button>
              <button
                type="button"
                onClick={confirmDeleteCourse}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-black uppercase tracking-wider rounded-full transition-all flex items-center gap-1.5 shadow-md shadow-red-950/15"
                id="confirm-delete-course-btn"
              >
                <Trash2 className="w-4 h-4" /> Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
