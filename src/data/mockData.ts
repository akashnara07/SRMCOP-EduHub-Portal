import { Subject, Announcement, Quiz, StudentProgress, FacultyProfile, AcademicYear } from '../types';

export const mockSubjects: Subject[] = [
  {
    id: 'bpharm-y1-s1-p1',
    code: 'BP101T',
    name: 'Human Anatomy and Physiology I',
    programme: 'B.Pharm',
    year: 1,
    semester: 1,
    academicYear: '2025-2026',
    facultyName: 'Dr. V. Chitra',
    progress: 85,
    color: 'from-blue-500/20 to-indigo-500/20 border-blue-500/30',
    resources: [
      {
        id: 'res-hap-1',
        type: 'Video',
        title: 'Introduction to Epithelial & Connective Tissues',
        description: 'Comprehensive lecture on structure, classification, and function of epithelial and connective tissues in human body.',
        duration: '42 mins',
        status: 'completed',
        url: 'https://www.w3schools.com/html/mov_bbb.mp4',
        content: 'Overview of tissues, structural hierarchy, types of simple and stratified epithelium, connective tissue matrix and specialized fibers.',
        unit: 'Unit I'
      },
      {
        id: 'res-hap-2',
        type: 'PDF',
        title: 'Skeletal System Study Guide & Bone Landmarks',
        description: 'High-definition bone atlas with labeled landmarks, osseous tissue physiology, and axial vs appendicular skeletal classifications.',
        fileSize: '4.8 MB',
        status: 'completed',
        url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        content: 'This study guide details the 206 bones of the human body, detailing classification of bones, microscopic anatomy of compact and spongy bone, bone remodeling cycles, and calcium homeostasis.',
        unit: 'Unit II'
      },
      {
        id: 'res-hap-3',
        type: 'Slides',
        title: 'Cardiovascular System - Blood Components',
        description: 'Lecture slides covering composition of blood, plasma proteins, hematopoiesis, red blood cell lifecycle, and erythropoietin feedback loop.',
        fileSize: '3.1 MB',
        status: 'in-progress',
        unit: 'Unit III'
      },
      {
        id: 'res-hap-4',
        type: 'Notes',
        title: 'Anatomy of the Human Heart & Coronal Sections',
        description: 'Detailed study notes describing the four chambers, major vessels, heart valves, coronary circulation, and the intrinsic conducting system.',
        status: 'not-started',
        content: 'The heart is a muscular organ located in the mediastinum. Layers: Epicardium, Myocardium, Endocardium. Valves: Atrioventricular (Tricuspid and Bicuspid/Mitral) and Semilunar (Aortic and Pulmonary). Conducting system pathway: SA Node -> AV Node -> Bundle of His -> Purkinje Fibers.',
        unit: 'Unit IV'
      },
      {
        id: 'res-hap-5',
        type: 'Quiz',
        title: 'Integumentary & Skeletal Systems MCQ Test',
        description: 'Assessment containing 5 high-yield multiple choice questions testing epidermal layer physiology and bone calcification.',
        questionsCount: 5,
        status: 'not-started',
        unit: 'Unit V'
      },
      {
        id: 'res-hap-6',
        type: 'Assignment',
        title: 'Histological Classification of Muscular Tissue',
        description: 'Compare skeletal, smooth, and cardiac muscle fibers under the microscope. Label structural differences (striations, nuclei, intercalated discs).',
        dueDate: 'July 15, 2026',
        status: 'not-started',
        grade: 'Awaiting Submission',
        unit: 'Unit I'
      }
    ]
  },
  {
    id: 'bpharm-y1-s1-p2',
    code: 'BP102T',
    name: 'Pharmaceutical Analysis I',
    programme: 'B.Pharm',
    year: 1,
    semester: 1,
    academicYear: '2025-2026',
    facultyName: 'Dr. Meena Swaminathan, M.Pharm.',
    progress: 60,
    color: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30',
    resources: [
      {
        id: 'res-pa-1',
        type: 'Video',
        title: 'Acid-Base Titration Concepts & Indicator Theory',
        description: 'Visualizing neutralization reactions, pH curves, Ostwald theory of indicators, and selection criteria for volumetric analysis.',
        duration: '35 mins',
        status: 'completed',
        url: 'https://www.w3schools.com/html/mov_bbb.mp4',
        unit: 'Unit I'
      },
      {
        id: 'res-pa-2',
        type: 'PDF',
        title: 'Non-Aqueous Titration Methodologies & Solvents',
        description: 'Deep dive into titration of weak acids and bases, solvent effects, protogenic vs protophilic classifications, and assay of standard drugs.',
        fileSize: '3.6 MB',
        status: 'in-progress',
        content: 'Non-aqueous titrations are suitable for very weak acids/bases insoluble in water. Solvents used: Aprotic, Protogenic, Protophilic, Amphiprotic. Standard titrants: Perchloric acid in glacial acetic acid.',
        unit: 'Unit II'
      },
      {
        id: 'res-pa-3',
        type: 'Quiz',
        title: 'Volumetric & Gravimetric Analysis Quiz',
        description: 'Test your understanding of primary standards, error categories, co-precipitation, and post-precipitation.',
        questionsCount: 5,
        status: 'not-started',
        unit: 'Unit III'
      }
    ]
  },
  {
    id: 'bpharm-y2-s3-p1',
    code: 'BP301T',
    name: 'Pharmaceutical Organic Chemistry II',
    programme: 'B.Pharm',
    year: 2,
    semester: 3,
    academicYear: '2024-2025',
    facultyName: 'Prof. S. J. Vardhan, Ph.D.',
    progress: 40,
    color: 'from-orange-500/20 to-amber-500/20 border-orange-500/30',
    resources: [
      {
        id: 'res-poc-1',
        type: 'Video',
        title: 'Benzene Structure & Huckel Rule of Aromaticity',
        description: 'Explaining molecular orbital theory, resonance energy, electrophilic aromatic substitution, and stability of benzene.',
        duration: '50 mins',
        status: 'completed'
      },
      {
        id: 'res-poc-2',
        type: 'PDF',
        title: 'Phenols - Acidity, Syntheses, and Reactions',
        description: 'Mechanism of Kolbe-Schmitt reaction, Reimer-Tiemann reaction, electrophilic substitutions, and comparison of phenol vs alcohol acidity.',
        fileSize: '5.1 MB',
        status: 'not-started'
      }
    ]
  },
  {
    id: 'pharmd-y1-p1',
    code: 'PD101',
    name: 'Human Anatomy and Physiology',
    programme: 'Pharm.D',
    year: 1,
    semester: 1,
    academicYear: '2025-2026',
    facultyName: 'Dr. V. Chitra',
    progress: 75,
    color: 'from-purple-500/20 to-pink-500/20 border-purple-500/30',
    resources: [
      {
        id: 'res-pdhap-1',
        type: 'Video',
        title: 'Introduction to Human Genome and Cell Biology',
        description: 'Advanced cellular structures, organelles, membrane potential, and molecular genetics essential for clinical pharmacokinetics.',
        duration: '48 mins',
        status: 'completed'
      },
      {
        id: 'res-pdhap-2',
        type: 'Notes',
        title: 'The Nervous System - Action Potential Transmission',
        description: 'Neurotransmission, synapse microanatomy, neurotransmitters, depolarization, repolarization, and hyperpolarization mechanics.',
        status: 'completed'
      }
    ]
  },
  {
    id: 'pharmd-y5-p1',
    code: 'PD501',
    name: 'Clinical Pharmacokinetics & TDM',
    programme: 'Pharm.D',
    year: 5,
    semester: 1,
    academicYear: '2025-2026',
    facultyName: 'Prof. Elizabeth Mathew, Ph.D.',
    progress: 90,
    color: 'from-rose-500/20 to-red-500/20 border-rose-500/30',
    resources: [
      {
        id: 'res-cp-1',
        type: 'Video',
        title: 'Therapeutic Drug Monitoring (TDM) of Digoxin',
        description: 'Clinical cases, dose optimization, serum sampling timings, toxicities, and loading dose mathematical equations.',
        duration: '55 mins',
        status: 'completed'
      },
      {
        id: 'res-cp-2',
        type: 'PDF',
        title: 'Renal Clearance & Dose Adjustment Guidelines',
        description: 'Cockcroft-Gault equation, GFR calculation, dose scaling for nephrotoxic antimicrobials like Vancomycin and Aminoglycosides.',
        fileSize: '6.4 MB',
        status: 'completed',
        content: 'This clinical guideline explains dosage adjustment methods in renal impairment. Utilizing the Cockcroft-Gault equation for creatinine clearance (CrCl) calculation: CrCl = ((140-age) * weight) / (72 * SCr) [multiply by 0.85 for females].'
      }
    ]
  },
  {
    id: 'bpharm-y1-s2-p1',
    code: 'BP201T',
    name: 'Human Anatomy and Physiology II',
    programme: 'B.Pharm',
    year: 1,
    semester: 2,
    academicYear: '2025-2026',
    facultyName: 'Dr. V. Chitra',
    progress: 15,
    color: 'from-blue-500/20 to-sky-500/20 border-blue-400/30',
    resources: [
      {
        id: 'res-hap2-1',
        type: 'Video',
        title: 'Introduction to Central Nervous System',
        description: 'Detailed anatomical structures of the cerebrum, cerebellum, and brainstem.',
        duration: '38 mins',
        status: 'not-started'
      }
    ]
  },
  {
    id: 'bpharm-y1-s1-p3',
    code: 'BP103T',
    name: 'Pharmaceutics I - Historic & Theory',
    programme: 'B.Pharm',
    year: 1,
    semester: 1,
    academicYear: '2024-2025',
    facultyName: 'Dr. V. Chitra',
    progress: 100,
    color: 'from-pink-500/20 to-rose-500/20 border-pink-500/30',
    resources: [
      {
        id: 'res-ph1-1',
        type: 'PDF',
        title: 'History of Pharmacy Education in India',
        description: 'Development of pharmacopoeias and evolution of apothecary shops.',
        fileSize: '2.5 MB',
        status: 'completed'
      }
    ]
  }
];

export const mockAnnouncements: Announcement[] = [
  {
    id: 'ann-1',
    title: 'Semester End Theory Examinations - Schedule Released',
    content: 'The Office of the Controller of Examinations has officially announced the B.Pharm First and Second Year Semester End Examination Schedule starting August 3, 2026. Hall tickets will be downloadable via SRMCOP EduHub from July 25 onwards. Ensure all pending library dues are cleared.',
    date: 'July 8, 2026',
    sender: 'Dr. G. Sivakumar, Dean Academic',
    role: 'Admin',
    category: 'exam'
  },
  {
    id: 'ann-2',
    title: 'Guest Lecture: AI & Quantum Computing in Drug Discovery',
    content: 'We are honored to host Dr. V. Prasanna from Novartis Research Labs for a special lecture on "Quantum Machine Learning Models for Targeted Oncology Formulation Design". Attendance is mandatory for M.Pharm and final year Pharm.D scholars. Date: July 12, 10:00 AM at the Main Auditorium.',
    date: 'July 7, 2026',
    sender: 'Prof. S. J. Vardhan, HOD Pharm. Chemistry',
    role: 'Faculty',
    category: 'event'
  },
  {
    id: 'ann-3',
    title: 'GPAT 2027 Comprehensive Mock Test Series',
    content: 'The Department of Pharmacology will host a weekly GPAT practice test every Sunday starting next week on the EduHub platform. Top 5 ranking students will receive personalized mentorship under senior faculty advisors.',
    date: 'July 5, 2026',
    sender: 'Dr. V. Chitra, PG Coordinator',
    role: 'Faculty',
    category: 'academic'
  }
];

export const sampleQuiz: Quiz = {
  id: 'quiz-hap-1',
  subjectId: 'bpharm-y1-s1-p1',
  title: 'Integumentary & Skeletal Systems MCQ Test',
  description: 'Assess your knowledge on epidermis histology, cartilage cells, osteoblast signaling, and vertebral landmarks.',
  timeLimit: 10,
  questions: [
    {
      id: 'q-1',
      question: 'Which stratum of the epidermis is primarily responsible for continuous cell division and generating new keratinocytes?',
      options: ['Stratum corneum', 'Stratum spinosum', 'Stratum basale', 'Stratum granulosum'],
      correctAnswer: 2,
      explanation: 'Stratum basale (also called stratum germinativum) contains stem cells that undergo rapid mitotic divisions to replenish outer skin layers.'
    },
    {
      id: 'q-2',
      question: 'What type of cell is found within lacunae in mature bone tissue and maintains the surrounding mineral matrix?',
      options: ['Osteoblast', 'Osteoclast', 'Osteocyte', 'Chondrocyte'],
      correctAnswer: 2,
      explanation: 'Osteocytes are mature bone cells trapped in lacunae that regulate local mineral exchange and osteocytic osteolysis.'
    },
    {
      id: 'q-3',
      question: 'Which bone forms the posterior part of the cranial vault and houses the foramen magnum?',
      options: ['Sphenoid bone', 'Occipital bone', 'Temporal bone', 'Parietal bone'],
      correctAnswer: 1,
      explanation: 'The occipital bone forms the base of the skull, containing the foramen magnum through which the spinal cord leaves.'
    },
    {
      id: 'q-4',
      question: 'The anatomical term for the shaft of a long bone is the:',
      options: ['Epiphysis', 'Metaphysis', 'Diaphysis', 'Periosteum'],
      correctAnswer: 2,
      explanation: 'The diaphysis is the main elongated shaft of a long bone, which provides structural integrity and contains the medullary cavity.'
    },
    {
      id: 'q-5',
      question: 'Which cartilage tissue provides structural flexibility and is rich in chondrocytes nested inside dense network elastic fibers?',
      options: ['Hyaline cartilage', 'Fibrocartilage', 'Elastic cartilage', 'Articular cartilage'],
      correctAnswer: 2,
      explanation: 'Elastic cartilage contains extensive networks of yellow elastic fibers, giving it both structural strength and flexible elastic properties (e.g., ear, epiglottis).'
    }
  ]
};

export const mockStudentProgress: StudentProgress = {
  studentName: 'J. Akash',
  registerNumber: 'SRM2026PH7810',
  programme: 'B.Pharm',
  year: 1,
  semester: 1,
  attendance: 92.4,
  gpa: 8.85,
  completedLectures: 14,
  totalLectures: 18
};

export const mockFacultyProfile: FacultyProfile = {
  name: 'Dr. V. Chitra',
  designation: 'Professor & Head',
  department: 'Department of Pharmacology',
  email: 'chitra.v@srmcop.edu.in',
  subjects: ['BP101T', 'PD101', 'BP201T', 'BP103T'],
  phone: '+91 94440 12345'
};

export const mockAcademicYears: AcademicYear[] = [
  { id: 'ay-1', name: 'Academic Year 2025-2026', isActive: true },
  { id: 'ay-2', name: 'Academic Year 2024-2025', isActive: false },
  { id: 'ay-3', name: 'Academic Year 2026-2027 (Planning)', isActive: false }
];
