import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { 
  getCurriculumDb, 
  saveCurriculumDb, 
  parseCurriculumWorkbook, 
  validateWorkbookWorksheets, 
  validateWorkbookFull,
  EXPECTED_SHEETS_CONFIG,
  compareCurriculumVersions, 
  MasterCurriculumDb 
} from '../../data/curriculumDb';
import { 
  Calendar, BookOpen, Sliders, ArrowRight, Library, Info, ShieldCheck, 
  Upload, FileSpreadsheet, Download, Check, AlertCircle, ArrowLeft, 
  Trash2, Copy, Archive, Layers, HelpCircle, Eye, ChevronDown, ChevronRight,
  Clock, Award, History, CheckCircle2, ChevronRightCircle, RefreshCcw
} from 'lucide-react';
import GlassCard from '../GlassCard';
import { Subject, FacultyProfile } from '../../types';

interface CourseDesignerHubProps {
  facultyProfile: FacultyProfile;
  subjects: Subject[];
  onGoToSubject: (subjectId: string) => void;
  onGoToScreen: (screenId: string) => void;
  readOnly?: boolean;
  onRefreshSubjects?: () => void;
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

const defaultCurriculum = (code: string, name: string, programme: string, sem: number): CurriculumData => ({
  courseCode: code,
  courseName: name,
  programme: programme as any,
  regulation: 'PCI Regulation 2020',
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

export default function CourseDesignerHub({
  facultyProfile,
  subjects,
  onGoToSubject,
  onGoToScreen,
  readOnly = false,
  onRefreshSubjects,
}: CourseDesignerHubProps) {
  // Configured Academic Years
  const academicYears = ['2024-2025', '2025-2026', '2026-2027'];
  const [selectedYear, setSelectedYear] = useState<string>('2025-2026');

  // Interactive views inside CourseDesignerHub:
  // - "list": Shows the Course Cards
  // - "designer": Shows the Curriculum Designer Page for the selected Course ID
  const [viewMode, setViewMode] = useState<'list' | 'designer'>('list');
  const [hubTab, setHubTab] = useState<'courses' | 'settings'>('courses');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);

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
  const [programmeFilter, setProgrammeFilter] = useState<'B.Pharm' | 'Pharm.D'>('B.Pharm');
  const [publishedSubjectIds, setPublishedSubjectIds] = useState<string[]>(['BP101T', 'PD101', 'BP201T', 'BP103T']);

  // Dynamic syllabus draft states inside Curriculum Designer
  const [activeSubjectCurriculum, setActiveSubjectCurriculum] = useState<CurriculumData | null>(null);
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

  // Filter subjects allotted to this faculty AND matching the selected academic year and programme
  const mySubjects = subjects.filter(
    (s) => facultyProfile.subjects.includes(s.id) && s.academicYear === selectedYear && s.programme === programmeFilter
  );

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 4500);
  };

  // Duplicate course card simulation
  const handleDuplicateCourse = (e: React.MouseEvent, sub: Subject) => {
    e.stopPropagation();
    triggerToast(`Successfully duplicated curriculum for ${sub.code} - Draft Copy created.`);
  };

  // Archive course card simulation
  const handleArchiveCourse = (e: React.MouseEvent, sub: Subject) => {
    e.stopPropagation();
    triggerToast(`Archived ${sub.code} course shell. Active student logins will be locked.`);
  };

  // Open curriculum designer sub-view
  const handleOpenCurriculumDesigner = (sub: Subject) => {
    const cur = mockCurriculums[sub.code] || defaultCurriculum(sub.code, sub.name, sub.programme, sub.semester);
    setActiveSubjectCurriculum(cur);
    setSelectedSubjectId(sub.id);
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
        const currentDb = getCurriculumDb();
        const diffs = compareCurriculumVersions(currentDb, parsedData);

        const academicYearsFound = Array.from(new Set(parsedData.courseInformation.map(c => c.academicYear)));
        logs.push(`[VALIDATOR] Identified Academic Year: ${academicYearsFound.join(', ') || selectedYear}`);
        logs.push(`[VALIDATOR] Found ${diffs.subjectsAdded.length} new course(s), ${diffs.subjectsUpdated.length} modified course(s).`);
        setImportLog(logs);

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
            setPublishedSubjectIds(prev => prev.filter(id => id !== 'BP101T' && id !== 'PD101'));
            triggerToast(`Master Workbook for Academic Year ${matchedYear} imported successfully! Active courses refreshed and set to Draft. Please publish to make active.`);
          }

          // Auto-switch selectedYear so that imported courses appear instantly!
          if (matchedYear && academicYears.includes(matchedYear)) {
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
          {/* Intro Banner */}
          <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-gray-950 via-[#19191e] to-gray-950 p-6 md:p-8 lg:p-10 text-white shadow-2xl border border-white/5">
            <div className="absolute -right-16 -bottom-16 w-96 h-96 bg-[#8B1E3F]/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -left-16 -top-16 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex flex-col gap-1 w-full">
                <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-[#CD4368] bg-[#CD4368]/15 border border-[#CD4368]/20 px-3 py-1 rounded-full w-max">
                  my teaching portfolio
                </span>
                <h1 className="font-display font-black text-xl md:text-2xl lg:text-3xl tracking-tight mt-2.5 leading-tight bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
                  {readOnly ? 'Assigned Teaching Subjects' : 'Curriculum & Course Manager'}
                </h1>
                <p className="text-xs text-gray-300 max-w-2xl leading-relaxed mt-2.5 font-medium">
                  {readOnly 
                    ? 'Browse the subjects assigned to you. Review curriculum details, monitor teaching readiness and continue creating learning resources through the Course Manager.'
                    : 'Configure PCI academic syllabus layouts, add Course Objectives (CO), map Program Outcomes (PO), and manage lecture-by-lecture lesson plans.'}
                </p>
              </div>
            </div>
          </div>

          {/* Academic Session Selector & Template Download */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">
                1. SELECT ALLOTTED ACADEMIC YEAR
              </label>
              
              {/* Apple Segmented Control */}
              <GlassCard className="p-1 flex gap-1 items-center max-w-sm h-11">
                {academicYears.map((year) => (
                  <button
                    key={year}
                    onClick={() => setSelectedYear(year)}
                    className={`
                      flex-1 h-full rounded-full text-[11px] font-bold transition-all duration-300 whitespace-nowrap px-4
                      ${selectedYear === year
                        ? 'bg-[#8B1E3F] text-white shadow-md shadow-maroon-900/15'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-white/40'
                      }
                    `}
                  >
                    Year {year}
                  </button>
                ))}
              </GlassCard>
            </div>

            {!readOnly && (
              <div className="flex flex-col gap-2 shrink-0 self-end sm:self-auto">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-left sm:text-right">
                  {selectedYear} Workbook Operations
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleDownloadTemplate();
                    }}
                    className="px-4 py-2.5 bg-white border border-gray-200/80 hover:bg-gray-50 text-gray-750 text-xs font-bold rounded-full transition-all flex items-center gap-2 shadow-sm animate-pulse"
                    title={`Download Excel Template for Year ${selectedYear}`}
                  >
                    <Download className="w-3.5 h-3.5 text-[#8B1E3F]" />
                    Download {selectedYear} Template
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Main Course Manager Tab Navigation */}
          {!readOnly && (
            <div className="flex border-b border-gray-150/60 pb-1.5 gap-2 mt-4">
              <button
                onClick={() => setHubTab('courses')}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                  hubTab === 'courses'
                    ? 'bg-white text-[#8B1E3F] shadow-sm font-black border border-gray-150/40'
                    : 'text-gray-500 hover:text-gray-800 hover:bg-white/50'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" /> Allotted Course List
              </button>
              <button
                onClick={() => setHubTab('settings')}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                  hubTab === 'settings'
                    ? 'bg-white text-[#8B1E3F] shadow-sm font-black border border-gray-150/40'
                    : 'text-gray-500 hover:text-gray-800 hover:bg-white/50'
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
                    Active Year Syllabus Integrity Status
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
            <div className="flex flex-col gap-3 mt-2">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 pl-1 mb-1">
              <div className="flex flex-wrap items-center gap-3">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  2. ACTIVE SUBJECT SHELLS ({mySubjects.length} Found)
                </label>
                
                {/* B.Pharm / Pharm.D Toggle Filter */}
                <div className="flex items-center gap-1 bg-gray-100 p-0.5 rounded-full border border-gray-200/50">
                  <button
                    onClick={() => setProgrammeFilter('B.Pharm')}
                    className={`px-3 py-0.5 text-[9px] font-black uppercase rounded-full transition-all duration-200 ${
                      programmeFilter === 'B.Pharm' 
                        ? 'bg-[#8B1E3F] text-white shadow-sm' 
                        : 'text-gray-500 hover:text-gray-800'
                    }`}
                  >
                    B.Pharm
                  </button>
                  <button
                    onClick={() => setProgrammeFilter('Pharm.D')}
                    className={`px-3 py-0.5 text-[9px] font-black uppercase rounded-full transition-all duration-200 ${
                      programmeFilter === 'Pharm.D' 
                        ? 'bg-[#8B1E3F] text-white shadow-sm' 
                        : 'text-gray-500 hover:text-gray-800'
                    }`}
                  >
                    Pharm.D
                  </button>
                </div>
              </div>
              <span className="text-[10px] text-gray-400 font-semibold bg-gray-100 px-2.5 py-0.5 rounded-full w-max">
                Active PCI Compliance Checklist
              </span>
            </div>

            {mySubjects.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 {mySubjects.map((sub) => {
                  // Fallbacks for missing info to preserve robust UI
                  const credits = sub.code.endsWith('P') ? 2 : 4;
                  const hours = sub.code.endsWith('P') ? 30 : 45;
                  const regulation = 'PCI Regulation 2020';
                  const unitsCount = 5;
                  const isPublished = publishedSubjectIds.includes(sub.id);
                  const status = isPublished ? 'Published' : 'Draft';
                  const lastUpdated = '2026-07-08';
                  const curriculumImported = true; // Mark as imported by admin default workflow

                  return (
                    <GlassCard
                      key={sub.id}
                      hoverLift
                      className="p-6 relative flex flex-col justify-between border border-gray-150/50 hover:shadow-xl transition-all duration-300 rounded-[24px]"
                    >
                      {/* Course Card Top Metadata block */}
                      <div>
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider">{sub.code}</span>
                            <span className="text-[9px] font-black uppercase text-[#8B1E3F] mt-0.5">{regulation}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-[9px] font-bold px-2.5 py-0.5 rounded-full uppercase ${status === 'Published' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                              {status}
                            </span>
                            <span className="text-[9px] font-bold bg-[#8B1E3F]/5 text-[#8B1E3F] px-2.5 py-0.5 rounded-full uppercase">
                              {sub.programme} • Sem {sub.semester}
                            </span>
                          </div>
                        </div>

                        {/* Title and credits metrics */}
                        <h3 className="font-display font-bold text-base text-gray-950 leading-tight mb-2 pr-16 line-clamp-1">
                          {sub.name}
                        </h3>

                        {/* Compact statistics row */}
                        <div className="grid grid-cols-3 gap-2 py-3 border-y border-gray-100 my-3 text-[10px] font-semibold text-gray-500 bg-gray-50/50 rounded-xl px-3">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-gray-400 text-[8px] uppercase font-bold tracking-wider">Credits</span>
                            <span className="font-extrabold text-gray-800 text-[11px]">{credits} Credits</span>
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <span className="text-gray-400 text-[8px] uppercase font-bold tracking-wider">L/T Hours</span>
                            <span className="font-extrabold text-gray-800 text-[11px]">{hours} Hours</span>
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <span className="text-gray-400 text-[8px] uppercase font-bold tracking-wider">Syllabus Structure</span>
                            <span className="font-extrabold text-gray-800 text-[11px]">{unitsCount} Units Mapped</span>
                          </div>
                        </div>

                        {/* Extra metadata block */}
                        <div className="flex flex-col gap-1.5 text-[10px] font-semibold text-gray-500 mt-2 pl-1">
                          <div className="flex justify-between">
                            <span>Faculty In Charge:</span>
                            <span className="text-gray-800 font-bold">{sub.facultyName || 'Dr. V. Chitra'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Syllabus Imported:</span>
                            <span className="text-emerald-600 font-black flex items-center gap-1 uppercase text-[9px]">
                              ✓ Master Workbook
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Last Updated:</span>
                            <span className="text-gray-750">{lastUpdated}</span>
                          </div>
                        </div>
                      </div>

                        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 pt-4 mt-4">
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleOpenCurriculumDesigner(sub)}
                              className="px-3 py-1.5 hover:bg-gray-100 rounded-full text-gray-600 hover:text-[#8B1E3F] text-[10px] font-black uppercase tracking-wider flex items-center gap-1 transition-all"
                              title="Preview Curriculum"
                            >
                              <Eye className="w-3.5 h-3.5" /> Preview Curriculum
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                triggerToast(`Successfully downloaded PCI Curriculum Syllabus for ${sub.code} (${sub.name}).xlsx`);
                              }}
                              className="px-3 py-1.5 bg-[#8B1E3F]/5 hover:bg-[#8B1E3F]/10 text-[#8B1E3F] hover:text-[#a12349] rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 transition-all border border-[#8B1E3F]/10"
                              title="Download Syllabus Workbook"
                            >
                              <Download className="w-3.5 h-3.5" /> Download
                            </button>
                          </div>

                          <div className="flex items-center gap-1.5">
                            {!readOnly && (
                              <>
                                {!isPublished && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setPublishedSubjectIds([...publishedSubjectIds, sub.id]);
                                      triggerToast(`${sub.code} has been published successfully!`);
                                    }}
                                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 transition-all shadow-sm"
                                    title="Publish Course"
                                  >
                                    <Check className="w-3 h-3" /> Publish
                                  </button>
                                )}
                                <button
                                  onClick={(e) => handleArchiveCourse(e, sub)}
                                  className="p-1.5 text-gray-400 hover:text-red-600 bg-gray-50 hover:bg-gray-100 rounded-full transition-all"
                                  title="Archive Subject"
                                >
                                  <Archive className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => onGoToSubject(sub.id)}
                              className="px-4 py-1.5 bg-[#8B1E3F] hover:bg-[#a12349] text-white text-[11px] font-bold rounded-full transition-all flex items-center gap-1 shadow-sm shadow-maroon-900/10"
                            >
                              Open Course Workspace <ArrowRight className="w-3 h-3 ml-0.5" />
                            </button>
                          </div>
                        </div>
                    </GlassCard>
                  );
                })}
              </div>
            ) : (
              <GlassCard className="p-12 flex flex-col items-center justify-center text-center gap-4 border border-dashed border-gray-200">
                <div className="w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100 shadow-sm text-gray-400">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-display font-bold text-base text-gray-800">No Allotted Subjects Found</h4>
                  <p className="text-xs text-gray-500 max-w-sm leading-relaxed mt-1">
                    You do not have any courses assigned under the <span className="font-bold text-gray-700">{selectedYear}</span> session.
                  </p>
                </div>
              </GlassCard>
            )}
          </div>
          )}
        </>
      )}

      {/* VIEW 2: CURRICULUM DESIGNER PAGE */}
      {viewMode === 'designer' && activeSubjectCurriculum && (
        <div className="flex flex-col gap-6 animate-fadeIn">
          
          {/* Back Button */}
          <button
            onClick={() => setViewMode('list')}
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
                onClick={() => setViewMode('list')}
                className="p-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 rounded-full transition-all flex items-center justify-center"
                title="Historical import journals logs"
              >
                <History className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Curriculum Workspace Layout (Main Content Left 2/3, Sidebar Right 1/3) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            
            {/* LEFT 2 COLUMNS: SYLLABUS DOCK DETAILS (ALL READ-ONLY AS SPECIFIED) */}
            <div className="lg:col-span-2 flex flex-col gap-6">

              {/* 1. Course Information Section */}
              <div className="rounded-[24px] bg-white border border-gray-150/50 shadow-sm overflow-hidden">
                <div 
                  onClick={() => toggleSection('info')}
                  className="p-4 bg-gray-50/50 hover:bg-gray-50/80 cursor-pointer flex justify-between items-center border-b border-gray-100"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#8B1E3F]/10 text-[#8B1E3F] flex items-center justify-center">
                      <Library className="w-4 h-4" />
                    </div>
                    <h3 className="font-display font-extrabold text-sm text-gray-900 uppercase tracking-wide">1. Course Information Specifications</h3>
                  </div>
                  {collapsedSections.info ? <ChevronRight className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </div>

                {!collapsedSections.info && (
                  <div className="p-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 bg-white">
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

              {/* 2. Course Scope Section */}
              <div className="rounded-[24px] bg-white border border-gray-150/50 shadow-sm overflow-hidden">
                <div 
                  onClick={() => toggleSection('scope')}
                  className="p-4 bg-gray-50/50 hover:bg-gray-50/80 cursor-pointer flex justify-between items-center border-b border-gray-100"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#8B1E3F]/10 text-[#8B1E3F] flex items-center justify-center">
                      <Sliders className="w-4 h-4" />
                    </div>
                    <h3 className="font-display font-extrabold text-sm text-gray-900 uppercase tracking-wide">2. Course Scope & Compliance Statement</h3>
                  </div>
                  {collapsedSections.scope ? <ChevronRight className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </div>

                {!collapsedSections.scope && (
                  <div className="p-5 bg-white text-xs text-gray-600 leading-relaxed font-medium">
                    <div className="p-4 bg-gray-50/60 border border-gray-100 rounded-2xl italic">
                      "{activeSubjectCurriculum.scope}"
                    </div>
                  </div>
                )}
              </div>

              {/* 3. Objectives Section */}
              <div className="rounded-[24px] bg-white border border-gray-150/50 shadow-sm overflow-hidden">
                <div 
                  onClick={() => toggleSection('objectives')}
                  className="p-4 bg-gray-50/50 hover:bg-gray-50/80 cursor-pointer flex justify-between items-center border-b border-gray-100"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#8B1E3F]/10 text-[#8B1E3F] flex items-center justify-center">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <h3 className="font-display font-extrabold text-sm text-gray-900 uppercase tracking-wide">3. Syllabus Learning Objectives</h3>
                  </div>
                  {collapsedSections.objectives ? <ChevronRight className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </div>

                {!collapsedSections.objectives && (
                  <div className="p-5 flex flex-col gap-3 bg-white">
                    {activeSubjectCurriculum.objectives.map((obj, oIdx) => (
                      <div key={oIdx} className="p-3 bg-gray-50/40 border border-gray-100 rounded-xl flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-[#8B1E3F]/10 text-[#8B1E3F] font-mono text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
                          {oIdx + 1}
                        </span>
                        <p className="text-xs font-semibold text-gray-700 leading-relaxed pt-0.5">{obj}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 4. Course Outcomes Section */}
              <div className="rounded-[24px] bg-white border border-gray-150/50 shadow-sm overflow-hidden">
                <div 
                  onClick={() => toggleSection('outcomes')}
                  className="p-4 bg-gray-50/50 hover:bg-gray-50/80 cursor-pointer flex justify-between items-center border-b border-gray-100"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#8B1E3F]/10 text-[#8B1E3F] flex items-center justify-center">
                      <Award className="w-4 h-4" />
                    </div>
                    <h3 className="font-display font-extrabold text-sm text-gray-900 uppercase tracking-wide">4. Course Outcomes (CO) Map</h3>
                  </div>
                  {collapsedSections.outcomes ? <ChevronRight className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </div>

                {!collapsedSections.outcomes && (
                  <div className="p-5 flex flex-col gap-3 bg-white">
                    {activeSubjectCurriculum.courseOutcomes && activeSubjectCurriculum.courseOutcomes.length > 0 ? (
                      activeSubjectCurriculum.courseOutcomes.map((co, cIdx) => (
                        <div key={cIdx} className="p-3 bg-gray-50/40 border border-gray-100 rounded-xl">
                          <p className="text-xs font-semibold text-gray-700 leading-relaxed">{co}</p>
                        </div>
                      ))
                    ) : (
                      <div className="p-6 text-center text-xs text-gray-400 font-semibold italic border border-dashed border-gray-200 rounded-2xl">
                        "No Course Outcomes Imported"
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 5 & 6. Unit Management & Topics Section */}
              <div className="rounded-[24px] bg-white border border-gray-150/50 shadow-sm overflow-hidden">
                <div 
                  onClick={() => toggleSection('units')}
                  className="p-4 bg-gray-50/50 hover:bg-gray-50/80 cursor-pointer flex justify-between items-center border-b border-gray-100"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#8B1E3F]/10 text-[#8B1E3F] flex items-center justify-center">
                      <Layers className="w-4 h-4" />
                    </div>
                    <h3 className="font-display font-extrabold text-sm text-gray-900 uppercase tracking-wide">5 & 6. PCI Unit & Topic Syllabus Matrix</h3>
                  </div>
                  {collapsedSections.units ? <ChevronRight className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </div>

                {!collapsedSections.units && (
                  <div className="p-5 flex flex-col gap-4 bg-white">
                    {activeSubjectCurriculum.units.map((unit) => {
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
                    })}
                  </div>
                )}
              </div>

              {/* 7 & 8. Books Mapped Section */}
              <div className="rounded-[24px] bg-white border border-gray-150/50 shadow-sm overflow-hidden">
                <div 
                  onClick={() => toggleSection('books')}
                  className="p-4 bg-gray-50/50 hover:bg-gray-50/80 cursor-pointer flex justify-between items-center border-b border-gray-100"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#8B1E3F]/10 text-[#8B1E3F] flex items-center justify-center">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <h3 className="font-display font-extrabold text-sm text-gray-900 uppercase tracking-wide">7 & 8. Recommended and Reference Books</h3>
                  </div>
                  {collapsedSections.books ? <ChevronRight className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </div>

                {!collapsedSections.books && (
                  <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5 bg-white">
                    <div>
                      <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 block mb-2.5">7. Recommended Textbooks</span>
                      <div className="flex flex-col gap-2.5">
                        {activeSubjectCurriculum.recommendedBooks.map((bk, bIdx) => (
                          <div key={bIdx} className="p-3 bg-gray-50/40 border border-gray-100 rounded-xl">
                            <h5 className="text-xs font-extrabold text-gray-800">{bk.title}</h5>
                            <p className="text-[10px] font-bold text-[#8B1E3F] mt-0.5">{bk.author} • {bk.edition}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 block mb-2.5">8. Reference Monographs</span>
                      <div className="flex flex-col gap-2.5">
                        {activeSubjectCurriculum.referenceBooks.map((bk, bIdx) => (
                          <div key={bIdx} className="p-3 bg-gray-50/40 border border-gray-100 rounded-xl">
                            <h5 className="text-xs font-extrabold text-gray-800">{bk.title}</h5>
                            <p className="text-[10px] font-bold text-[#8B1E3F] mt-0.5">{bk.author} • {bk.edition}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 9. Assessment Pattern Section */}
              <div className="rounded-[24px] bg-white border border-gray-150/50 shadow-sm overflow-hidden">
                <div 
                  onClick={() => toggleSection('assessment')}
                  className="p-4 bg-gray-50/50 hover:bg-gray-50/80 cursor-pointer flex justify-between items-center border-b border-gray-100"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#8B1E3F]/10 text-[#8B1E3F] flex items-center justify-center">
                      <Clock className="w-4 h-4" />
                    </div>
                    <h3 className="font-display font-extrabold text-sm text-gray-900 uppercase tracking-wide">9. Regulatory Assessment Pattern</h3>
                  </div>
                  {collapsedSections.assessment ? <ChevronRight className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </div>

                {!collapsedSections.assessment && (
                  <div className="p-5 bg-white text-xs">
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
                    <span>Syllabic Units Mapped:</span>
                    <span>{activeSubjectCurriculum.units.length} Units</span>
                  </div>
                  <div className="flex justify-between text-gray-800 font-bold">
                    <span>Curricular Topics:</span>
                    <span>{activeSubjectCurriculum.units.reduce((acc, u) => acc + u.topics.length, 0)} Lectures</span>
                  </div>
                  <div className="flex justify-between text-gray-800 font-bold">
                    <span>Referenced Books:</span>
                    <span>{activeSubjectCurriculum.recommendedBooks.length + activeSubjectCurriculum.referenceBooks.length} Editions</span>
                  </div>
                  <div className="flex justify-between text-gray-800 font-bold">
                    <span>Assigned CO / POs:</span>
                    <span>{activeSubjectCurriculum.courseOutcomes.length} COs</span>
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

    </div>
  );
}
