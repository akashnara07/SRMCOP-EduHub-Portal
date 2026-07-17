import * as XLSX from 'xlsx';
import { Subject, Resource } from '../types';

export interface CourseInformation {
  subjectCode: string;
  courseName: string;
  programme: string;
  regulation: string;
  year: number;
  semester: number;
  credits: number;
  hours: number;
  subjectType: 'Theory' | 'Practical';
  status: 'Active' | 'Draft' | 'Approved' | 'Archived';
  facultyAssigned: string;
  importVersion: string;
  academicYear?: string;
}

export interface ScopeData {
  subjectCode: string;
  scopeStatement: string;
}

export interface ObjectiveData {
  subjectCode: string;
  objectiveText: string;
  order: number;
}

export interface CourseOutcomeData {
  subjectCode: string;
  coCode: string;
  coText: string;
  attainmentTarget: number;
}

export interface UnitData {
  subjectCode: string;
  unitCode: string;
  unitName: string;
  hours: number;
}

export interface CurriculumTopicData {
  id?: string;
  subjectCode: string;
  unitCode: string;
  topicCode: string;
  topicName: string;
  hours: number;
}

export interface BookData {
  subjectCode: string;
  title: string;
  author: string;
  edition: string;
}

export interface AssessmentPatternData {
  subjectCode: string;
  theoryInternal: number;
  theoryExternal: number;
  practicalInternal: number;
  practicalExternal: number;
  universityExam: number;
}

// Global master database structure mirroring firestore collections
export interface MasterCurriculumDb {
  courseInformation: CourseInformation[];
  scope: ScopeData[];
  objectives: ObjectiveData[];
  courseOutcomes: CourseOutcomeData[];
  units: UnitData[];
  curriculumTopics: CurriculumTopicData[];
  recommendedBooks: BookData[];
  referenceBooks: BookData[];
  assessmentPattern: AssessmentPatternData[];
  importHistory: {
    id: string;
    fileName: string;
    importedAt: string;
    importedBy: string;
    version: string;
    summary: string;
  }[];
}

// Default initial data for BP101T and BP102T to simulate an already imported curriculum database
const defaultCurriculumDb: MasterCurriculumDb = {
  courseInformation: [
    {
      subjectCode: 'PD101',
      courseName: 'Human Anatomy and Physiology',
      programme: 'Pharm.D',
      regulation: 'PCI 2008',
      year: 1,
      semester: 1,
      credits: 4,
      hours: 45,
      subjectType: 'Theory',
      status: 'Approved',
      facultyAssigned: 'Dr. V. Chitra',
      importVersion: '1.0',
      academicYear: '2024-2025'
    },
    {
      subjectCode: 'PD101',
      courseName: 'Human Anatomy and Physiology',
      programme: 'Pharm.D',
      regulation: 'PCI 2008',
      year: 1,
      semester: 1,
      credits: 4,
      hours: 45,
      subjectType: 'Theory',
      status: 'Approved',
      facultyAssigned: 'Dr. V. Chitra',
      importVersion: '1.0',
      academicYear: '2025-2026'
    },
    {
      subjectCode: 'PD101',
      courseName: 'Human Anatomy and Physiology',
      programme: 'Pharm.D',
      regulation: 'PCI 2008',
      year: 1,
      semester: 1,
      credits: 4,
      hours: 45,
      subjectType: 'Theory',
      status: 'Approved',
      facultyAssigned: 'Dr. V. Chitra',
      importVersion: '1.0',
      academicYear: '2026-2027'
    },
    {
      subjectCode: 'BP201T',
      courseName: 'Human Anatomy and Physiology II',
      programme: 'B.Pharm',
      regulation: 'PCI 2017',
      year: 1,
      semester: 2,
      credits: 4,
      hours: 45,
      subjectType: 'Theory',
      status: 'Approved',
      facultyAssigned: 'Dr. V. Chitra',
      importVersion: '1.1',
      academicYear: '2025-2026'
    },
    {
      subjectCode: 'BP301T',
      courseName: 'Pharmaceutical Organic Chemistry II',
      programme: 'B.Pharm',
      regulation: 'PCI 2017',
      year: 2,
      semester: 3,
      credits: 4,
      hours: 45,
      subjectType: 'Theory',
      status: 'Approved',
      facultyAssigned: 'Dr. V. Chitra',
      importVersion: '1.0',
      academicYear: '2025-2026'
    },
    {
      subjectCode: 'BP501T',
      courseName: 'Medicinal Chemistry II',
      programme: 'B.Pharm',
      regulation: 'PCI 2017',
      year: 3,
      semester: 5,
      credits: 4,
      hours: 45,
      subjectType: 'Theory',
      status: 'Approved',
      facultyAssigned: 'Dr. V. Chitra',
      importVersion: '1.0',
      academicYear: '2025-2026'
    },
    {
      subjectCode: 'BP601T',
      courseName: 'Medicinal Chemistry III',
      programme: 'B.Pharm',
      regulation: 'PCI 2017',
      year: 3,
      semester: 6,
      credits: 4,
      hours: 45,
      subjectType: 'Theory',
      status: 'Approved',
      facultyAssigned: 'Dr. V. Chitra',
      importVersion: '1.0',
      academicYear: '2025-2026'
    },
    {
      subjectCode: 'BP701T',
      courseName: 'Instrumental Methods of Analysis',
      programme: 'B.Pharm',
      regulation: 'PCI 2017',
      year: 4,
      semester: 7,
      credits: 4,
      hours: 45,
      subjectType: 'Theory',
      status: 'Approved',
      facultyAssigned: 'Dr. V. Chitra',
      importVersion: '1.0',
      academicYear: '2025-2026'
    },
    {
      subjectCode: 'BP801T',
      courseName: 'Biostatistics and Research Methodology',
      programme: 'B.Pharm',
      regulation: 'PCI 2017',
      year: 4,
      semester: 8,
      credits: 4,
      hours: 45,
      subjectType: 'Theory',
      status: 'Approved',
      facultyAssigned: 'Dr. V. Chitra',
      importVersion: '1.0',
      academicYear: '2025-2026'
    },
    {
      subjectCode: 'PD201',
      courseName: 'Pathophysiology',
      programme: 'Pharm.D',
      regulation: 'PCI 2008',
      year: 2,
      semester: 3,
      credits: 4,
      hours: 45,
      subjectType: 'Theory',
      status: 'Approved',
      facultyAssigned: 'Prof. Elizabeth Mathew',
      importVersion: '1.0',
      academicYear: '2025-2026'
    },
    {
      subjectCode: 'PD301',
      courseName: 'Pharmacology II',
      programme: 'Pharm.D',
      regulation: 'PCI 2008',
      year: 3,
      semester: 5,
      credits: 4,
      hours: 45,
      subjectType: 'Theory',
      status: 'Approved',
      facultyAssigned: 'Prof. Elizabeth Mathew',
      importVersion: '1.0',
      academicYear: '2025-2026'
    },
    {
      subjectCode: 'PD401',
      courseName: 'Clinical Pharmacy',
      programme: 'Pharm.D',
      regulation: 'PCI 2008',
      year: 4,
      semester: 7,
      credits: 4,
      hours: 45,
      subjectType: 'Theory',
      status: 'Approved',
      facultyAssigned: 'Prof. Elizabeth Mathew',
      importVersion: '1.0',
      academicYear: '2025-2026'
    }
  ],
  scope: [
    {
      subjectCode: 'BP101T',
      scopeStatement: 'This course is designed to impart a fundamental knowledge on the structure and functions of the various systems of the human body. It also helps in understanding both homeostatic mechanisms and cellular pathways under standard therapeutic regimens.'
    },
    {
      subjectCode: 'BP102T',
      scopeStatement: 'This course deals with the fundamentals of analytical chemistry and principles of electrochemical analysis of pharmaceutical formulations.'
    },
    {
      subjectCode: 'PD101',
      scopeStatement: 'This course is designed to impart a fundamental knowledge on the structure and functions of the human body for Doctor of Pharmacy aspirants.'
    },
    {
      subjectCode: 'BP201T',
      scopeStatement: 'This course is designed to impart advanced knowledge on structural histology, endocrine regulations, and metabolic pathways of the organ systems.'
    },
    {
      subjectCode: 'BP103T',
      scopeStatement: 'This course deals with the formulation methodologies, calculations, and official monographs of various pharmaceutical dosage forms.'
    }
  ],
  objectives: [
    { subjectCode: 'BP101T', objectiveText: 'Describe the structure, location, and basic function of various organs of the human body.', order: 1 },
    { subjectCode: 'BP101T', objectiveText: 'Comprehend the homeostatic mechanisms of tissue systems.', order: 2 },
    { subjectCode: 'BP101T', objectiveText: 'Perform structural analysis of cells, tissues, and skeletal classifications.', order: 3 },
    { subjectCode: 'BP101T', objectiveText: 'Identify key skeletal bone landmarks and arterial routes.', order: 4 },
    { subjectCode: 'BP102T', objectiveText: 'Understand the principles of volumetric and electrochemical analysis.', order: 1 },
    { subjectCode: 'BP102T', objectiveText: 'Develop analytical skill sets in basic titration preparations.', order: 2 },
    { subjectCode: 'BP102T', objectiveText: 'Appreciate the high-yield concepts of impurity control and limit tests.', order: 3 },
    { subjectCode: 'PD101', objectiveText: 'Describe the physiological structures and homeostatic controls of key organ systems.', order: 1 },
    { subjectCode: 'PD101', objectiveText: 'Develop clinical knowledge base for structural-functional mapping.', order: 2 },
    { subjectCode: 'BP201T', objectiveText: 'Understand the anatomy and physiology of respiratory, digestive, and urinary systems.', order: 1 },
    { subjectCode: 'BP201T', objectiveText: 'Appreciate the role of endocrine glands and hormones in homeostasis.', order: 2 },
    { subjectCode: 'BP103T', objectiveText: 'Understand the professional handling of prescriptions and pharmaceutical preparations.', order: 1 },
    { subjectCode: 'BP103T', objectiveText: 'Master standard dispensing calculations and pharmacopeial compliance standards.', order: 2 }
  ],
  courseOutcomes: [
    { subjectCode: 'BP101T', coCode: 'CO1', coText: 'Articulate cellular pathways, epithelial tissue boundaries, and intercellular communications.', attainmentTarget: 2.5 },
    { subjectCode: 'BP101T', coCode: 'CO2', coText: 'Classify bones and joints under skeletal physiology and locate specific cranial landmarks.', attainmentTarget: 2.5 },
    { subjectCode: 'BP101T', coCode: 'CO3', coText: 'Appraise blood parameters, plasma composition, and cardiovascular transport dynamics.', attainmentTarget: 2.5 },
    { subjectCode: 'BP101T', coCode: 'CO4', coText: 'Understand the nervous system structures, including spinal pathways and synaptic transmission.', attainmentTarget: 2.5 },
    { subjectCode: 'BP101T', coCode: 'CO5', coText: 'Evaluate the skin layers, sweat glands, and thermoregulatory feedback loops.', attainmentTarget: 2.5 },
    { subjectCode: 'BP102T', coCode: 'CO1', coText: 'Evaluate different sources of errors and conduct standard analytical calibrations.', attainmentTarget: 2.5 },
    { subjectCode: 'BP102T', coCode: 'CO2', coText: 'Perform complex neutralization and non-aqueous assays.', attainmentTarget: 2.5 },
    { subjectCode: 'BP102T', coCode: 'CO3', coText: 'Master precipitation and complexometric titration protocols.', attainmentTarget: 2.5 },
    { subjectCode: 'BP102T', coCode: 'CO4', coText: 'Formulate electrochemical cell metrics for quantitative analyses.', attainmentTarget: 2.5 },
    { subjectCode: 'PD101', coCode: 'CO1', coText: 'Identify histological boundaries and describe organ functions clinically.', attainmentTarget: 2.5 },
    { subjectCode: 'PD101', coCode: 'CO2', coText: 'Interpret cellular transport systems and neural reflex paths.', attainmentTarget: 2.5 },
    { subjectCode: 'BP201T', coCode: 'CO1', coText: 'Explain the mechanisms of respiration and pulmonary function parameters.', attainmentTarget: 2.5 },
    { subjectCode: 'BP201T', coCode: 'CO2', coText: 'Detail the anatomy and metabolic roles of the gastrointestinal system.', attainmentTarget: 2.5 },
    { subjectCode: 'BP103T', coCode: 'CO1', coText: 'Perform pharmaceutical calculations involving weights, measures, dilutions, and isotonicity.', attainmentTarget: 2.5 },
    { subjectCode: 'BP103T', coCode: 'CO2', coText: 'Formulate liquid oral dosage forms like syrups, elixirs, and monophasic drops.', attainmentTarget: 2.5 }
  ],
  units: [
    { subjectCode: 'BP101T', unitCode: 'Unit I', unitName: 'Introduction to Human Body & Cellular Level', hours: 10 },
    { subjectCode: 'BP101T', unitCode: 'Unit II', unitName: 'Skeletal & Joint Systems', hours: 9 },
    { subjectCode: 'BP101T', unitCode: 'Unit III', unitName: 'Body Fluids & Blood', hours: 8 },
    { subjectCode: 'BP101T', unitCode: 'Unit IV', unitName: 'Cardiovascular & Lymphatic Systems', hours: 10 },
    { subjectCode: 'BP101T', unitCode: 'Unit V', unitName: 'Nervous System & Integumentary System', hours: 8 },
    { subjectCode: 'BP102T', unitCode: 'Unit I', unitName: 'Quantitative Analysis & Titrimetry Fundamentals', hours: 10 },
    { subjectCode: 'BP102T', unitCode: 'Unit II', unitName: 'Acid-Base and Non-Aqueous Titrations', hours: 9 },
    { subjectCode: 'BP102T', unitCode: 'Unit III', unitName: 'Complexometric Titrations & Gravimetry', hours: 8 },
    { subjectCode: 'BP102T', unitCode: 'Unit IV', unitName: 'Redox Titrations & Assays', hours: 10 },
    { subjectCode: 'BP102T', unitCode: 'Unit V', unitName: 'Electrochemical Methods of Analysis', hours: 8 },
    { subjectCode: 'PD101', unitCode: 'Unit I', unitName: 'Scope of Anatomy & Cellular Physiology', hours: 10 },
    { subjectCode: 'PD101', unitCode: 'Unit II', unitName: 'Skeletal & Muscle Physiology', hours: 9 },
    { subjectCode: 'PD101', unitCode: 'Unit III', unitName: 'Hematological Parameters & Circulation', hours: 8 },
    { subjectCode: 'PD101', unitCode: 'Unit IV', unitName: 'Cardiovascular Dynamics', hours: 10 },
    { subjectCode: 'PD101', unitCode: 'Unit V', unitName: 'Nervous & Sensory Systems', hours: 8 },
    { subjectCode: 'BP201T', unitCode: 'Unit I', unitName: 'Nervous & Endocrine Systems', hours: 10 },
    { subjectCode: 'BP201T', unitCode: 'Unit II', unitName: 'Digestive System & Bioenergetics', hours: 9 },
    { subjectCode: 'BP201T', unitCode: 'Unit III', unitName: 'Respiratory & Urinary Systems', hours: 8 },
    { subjectCode: 'BP201T', unitCode: 'Unit IV', unitName: 'Endocrine Glands & Hormone Regulation', hours: 10 },
    { subjectCode: 'BP201T', unitCode: 'Unit V', unitName: 'Reproductive System & Genetics', hours: 8 },
    { subjectCode: 'BP103T', unitCode: 'Unit I', unitName: 'Historical Background & Prescription Handling', hours: 10 },
    { subjectCode: 'BP103T', unitCode: 'Unit II', unitName: 'Pharmaceutical Calculations & Powders', hours: 9 },
    { subjectCode: 'BP103T', unitCode: 'Unit III', unitName: 'Liquid Dosage Forms: Monophasics', hours: 8 },
    { subjectCode: 'BP103T', unitCode: 'Unit IV', unitName: 'Biphasic Liquids & Semisolids', hours: 10 },
    { subjectCode: 'BP103T', unitCode: 'Unit V', unitName: 'Incompatibilities & Dispensing Protocols', hours: 8 }
  ],
  curriculumTopics: [
    { subjectCode: 'BP101T', unitCode: 'Unit I', topicCode: 'T1.1', topicName: 'Definition of Anatomy and Physiology', hours: 1 },
    { subjectCode: 'BP101T', unitCode: 'Unit I', topicCode: 'T1.2', topicName: 'Levels of Structural Organization', hours: 1 },
    { subjectCode: 'BP101T', unitCode: 'Unit I', topicCode: 'T1.3', topicName: 'Cellular Homeostasis and Feedback Control Loops', hours: 2 },
    { subjectCode: 'BP101T', unitCode: 'Unit I', topicCode: 'T1.4', topicName: 'Structure of Cell and Organelle functions', hours: 2 },
    { subjectCode: 'BP101T', unitCode: 'Unit I', topicCode: 'T1.5', topicName: 'Cell Membrane Transport (Active vs Passive)', hours: 2 },
    { subjectCode: 'BP101T', unitCode: 'Unit I', topicCode: 'T1.6', topicName: 'Cell Division (Mitosis & Meiosis)', hours: 1 },
    { subjectCode: 'BP101T', unitCode: 'Unit I', topicCode: 'T1.7', topicName: 'Epithelial, Connective, Muscle and Nervous Tissues', hours: 1 },
    { subjectCode: 'BP101T', unitCode: 'Unit II', topicCode: 'T2.1', topicName: 'Bone Tissue Histology and Remodeling', hours: 2 },
    { subjectCode: 'BP101T', unitCode: 'Unit II', topicCode: 'T2.2', topicName: 'Axial Skeleton: Cranial and Facial Bones', hours: 2 },
    { subjectCode: 'BP101T', unitCode: 'Unit II', topicCode: 'T2.3', topicName: 'Appendicular Skeleton and Pelvic Girdle', hours: 2 },
    { subjectCode: 'BP101T', unitCode: 'Unit II', topicCode: 'T2.4', topicName: 'Joints: Fibrous, Cartilaginous, and Synovial', hours: 2 },
    { subjectCode: 'BP101T', unitCode: 'Unit II', topicCode: 'T2.5', topicName: 'Joint movements and range of motion', hours: 1 },
    { subjectCode: 'BP101T', unitCode: 'Unit III', topicCode: 'T3.1', topicName: 'Plasma Proteins and Solute Composition', hours: 2 },
    { subjectCode: 'BP101T', unitCode: 'Unit III', topicCode: 'T3.2', topicName: 'Erythropoiesis and Iron Metabolism', hours: 2 },
    { subjectCode: 'BP101T', unitCode: 'Unit III', topicCode: 'T3.3', topicName: 'WBCs, Platelets, and Hemostasis cascade', hours: 1 },
    { subjectCode: 'BP101T', unitCode: 'Unit III', topicCode: 'T3.4', topicName: 'ABO and Rh Blood Grouping systems', hours: 2 },
    { subjectCode: 'BP101T', unitCode: 'Unit III', topicCode: 'T3.5', topicName: 'Lymphatic System organs and fluid dynamics', hours: 1 },
    { subjectCode: 'BP101T', unitCode: 'Unit IV', topicCode: 'T4.1', topicName: 'Gross Anatomy and Chambers of the Heart', hours: 2 },
    { subjectCode: 'BP101T', unitCode: 'Unit IV', topicCode: 'T4.2', topicName: 'Intrinsic Cardiac Conduction (SA / AV Nodes)', hours: 2 },
    { subjectCode: 'BP101T', unitCode: 'Unit IV', topicCode: 'T4.3', topicName: 'Cardiac Cycle, Stroke Volume, and Cardiac Output', hours: 2 },
    { subjectCode: 'BP101T', unitCode: 'Unit IV', topicCode: 'T4.4', topicName: 'Electrocardiogram (ECG) waveforms (P, QRS, T)', hours: 2 },
    { subjectCode: 'BP101T', unitCode: 'Unit IV', topicCode: 'T4.5', topicName: 'Blood Pressure and hypertension etiology', hours: 2 },
    { subjectCode: 'BP101T', unitCode: 'Unit V', topicCode: 'T5.1', topicName: 'Neuronal structure and Synaptic Transmission', hours: 2 },
    { subjectCode: 'BP101T', unitCode: 'Unit V', topicCode: 'T5.2', topicName: 'Spinal Cord tracts and Spinal Reflexes', hours: 2 },
    { subjectCode: 'BP101T', unitCode: 'Unit V', topicCode: 'T5.3', topicName: 'Cranial nerves and Autonomic Nervous System', hours: 2 },
    { subjectCode: 'BP101T', unitCode: 'Unit V', topicCode: 'T5.4', topicName: 'Integumentary: Epidermis, Dermis, and accessory structures', hours: 1 },
    { subjectCode: 'BP101T', unitCode: 'Unit V', topicCode: 'T5.5', topicName: 'Temperature regulation feedback controls', hours: 1 },
    { subjectCode: 'BP102T', unitCode: 'Unit I', topicCode: 'T1.1', topicName: 'Classification of analytical methods', hours: 2 },
    { subjectCode: 'BP102T', unitCode: 'Unit I', topicCode: 'T1.2', topicName: 'Errors: systematic and random distributions', hours: 3 },
    { subjectCode: 'BP102T', unitCode: 'Unit I', topicCode: 'T1.3', topicName: 'Significant figures and calculation indices', hours: 2 },
    { subjectCode: 'BP102T', unitCode: 'Unit I', topicCode: 'T1.4', topicName: 'Primary and secondary standardization', hours: 3 },
    { subjectCode: 'BP102T', unitCode: 'Unit II', topicCode: 'T2.1', topicName: 'Acid-base indicators and Ostwald theories', hours: 3 },
    { subjectCode: 'BP102T', unitCode: 'Unit II', topicCode: 'T2.2', topicName: 'Non-aqueous titrations: Protophilic vs Protogenic', hours: 3 },
    { subjectCode: 'BP102T', unitCode: 'Unit II', topicCode: 'T2.3', topicName: 'Assay of Sodium Benzoate and Ephedrine HCl', hours: 3 },
    { subjectCode: 'BP102T', unitCode: 'Unit III', topicCode: 'T3.1', topicName: 'EDTA Ligand Complexation and Stability Constants', hours: 3 },
    { subjectCode: 'BP102T', unitCode: 'Unit III', topicCode: 'T3.2', topicName: 'Metal Indicator Theories and masking agents', hours: 3 },
    { subjectCode: 'BP102T', unitCode: 'Unit III', topicCode: 'T3.3', topicName: 'Gravimetric theory and barium sulfate assays', hours: 2 },
    { subjectCode: 'BP102T', unitCode: 'Unit IV', topicCode: 'T4.1', topicName: 'Cerimetry, Iodimetry, and Iodometry principles', hours: 4 },
    { subjectCode: 'BP102T', unitCode: 'Unit IV', topicCode: 'T4.2', topicName: 'Potassium Permanganate Preparations and standard assays', hours: 3 },
    { subjectCode: 'BP102T', unitCode: 'Unit IV', topicCode: 'T4.3', topicName: 'Pharmaceutical Redox Titrations and quality checks', hours: 3 },
    { subjectCode: 'BP102T', unitCode: 'Unit V', topicCode: 'T5.1', topicName: 'Conductometric curves and titration diagrams', hours: 3 },
    { subjectCode: 'BP102T', unitCode: 'Unit V', topicCode: 'T5.2', topicName: 'Potentiometric Titrations and indicator electrodes', hours: 3 },
    { subjectCode: 'BP102T', unitCode: 'Unit V', topicCode: 'T5.3', topicName: 'Polarography and Dropping Mercury Electrode systems', hours: 2 },
    // PD101
    { subjectCode: 'PD101', unitCode: 'Unit I', topicCode: 'T1.1', topicName: 'Definition of Human Body Systems', hours: 5 },
    { subjectCode: 'PD101', unitCode: 'Unit I', topicCode: 'T1.2', topicName: 'Cellular physiology and biochemical gates', hours: 5 },
    { subjectCode: 'PD101', unitCode: 'Unit II', topicCode: 'T2.1', topicName: 'Bone Tissue Microscopic Structure', hours: 5 },
    { subjectCode: 'PD101', unitCode: 'Unit II', topicCode: 'T2.2', topicName: 'Types of muscular contractions', hours: 4 },
    { subjectCode: 'PD101', unitCode: 'Unit III', topicCode: 'T3.1', topicName: 'Hemoglobin and oxygen transport mechanisms', hours: 4 },
    { subjectCode: 'PD101', unitCode: 'Unit III', topicCode: 'T3.2', topicName: 'Clotting factors cascade pathway', hours: 4 },
    { subjectCode: 'PD101', unitCode: 'Unit IV', topicCode: 'T4.1', topicName: 'Cardiac cycle and systemic arterial routes', hours: 5 },
    { subjectCode: 'PD101', unitCode: 'Unit IV', topicCode: 'T4.2', topicName: 'Regulation of blood pressure and flow', hours: 5 },
    { subjectCode: 'PD101', unitCode: 'Unit V', topicCode: 'T5.1', topicName: 'Action Potential generation & myelination', hours: 4 },
    { subjectCode: 'PD101', unitCode: 'Unit V', topicCode: 'T5.2', topicName: 'Reflex pathways and spinal root tracts', hours: 4 },
    // BP201T
    { subjectCode: 'BP201T', unitCode: 'Unit I', topicCode: 'T1.1', topicName: 'Organization of Nervous system', hours: 5 },
    { subjectCode: 'BP201T', unitCode: 'Unit I', topicCode: 'T1.2', topicName: 'Autonomic reflex actions', hours: 5 },
    { subjectCode: 'BP201T', unitCode: 'Unit II', topicCode: 'T2.1', topicName: 'Anatomy of Gastrointestinal Tract organs', hours: 5 },
    { subjectCode: 'BP201T', unitCode: 'Unit II', topicCode: 'T2.2', topicName: 'Energetics of food processing & absorption', hours: 4 },
    { subjectCode: 'BP201T', unitCode: 'Unit III', topicCode: 'T3.1', topicName: 'Anatomy of Respiratory tree structures', hours: 4 },
    { subjectCode: 'BP201T', unitCode: 'Unit III', topicCode: 'T3.2', topicName: 'Glomerular filtration and urine production', hours: 4 },
    { subjectCode: 'BP201T', unitCode: 'Unit IV', topicCode: 'T4.1', topicName: 'Mechanism of hormone synthesis', hours: 5 },
    { subjectCode: 'BP201T', unitCode: 'Unit IV', topicCode: 'T4.2', topicName: 'Pituitary gland secretion loops', hours: 5 },
    { subjectCode: 'BP201T', unitCode: 'Unit V', topicCode: 'T5.1', topicName: 'Anatomy of Male Reproductive system', hours: 4 },
    { subjectCode: 'BP201T', unitCode: 'Unit V', topicCode: 'T5.2', topicName: 'Anatomy of Female Reproductive system', hours: 4 },
    // BP103T
    { subjectCode: 'BP103T', unitCode: 'Unit I', topicCode: 'T1.1', topicName: 'History of Pharmacy as a profession', hours: 5 },
    { subjectCode: 'BP103T', unitCode: 'Unit I', topicCode: 'T1.2', topicName: 'Prescription parsing and error checking', hours: 5 },
    { subjectCode: 'BP103T', unitCode: 'Unit II', topicCode: 'T2.1', topicName: 'Calculations of weights and measures', hours: 5 },
    { subjectCode: 'BP103T', unitCode: 'Unit II', topicCode: 'T2.2', topicName: 'Preparation of pharmaceutical powders', hours: 4 },
    { subjectCode: 'BP103T', unitCode: 'Unit III', topicCode: 'T3.1', topicName: 'Monophasic solutions and vehicle selection', hours: 4 },
    { subjectCode: 'BP103T', unitCode: 'Unit III', topicCode: 'T3.2', topicName: 'Formulation of syrups and elixirs', hours: 4 },
    { subjectCode: 'BP103T', unitCode: 'Unit IV', topicCode: 'T4.1', topicName: 'Suspensions & Emulsions biphasic design', hours: 5 },
    { subjectCode: 'BP103T', unitCode: 'Unit IV', topicCode: 'T4.2', topicName: 'Formulation of Suppositories', hours: 5 },
    { subjectCode: 'BP103T', unitCode: 'Unit V', topicCode: 'T5.1', topicName: 'Physical and Chemical Incompatibilities', hours: 4 },
    { subjectCode: 'BP103T', unitCode: 'Unit V', topicCode: 'T5.2', topicName: 'Professional dispensing standards', hours: 4 }
  ],
  recommendedBooks: [
    { subjectCode: 'BP101T', title: 'Anatomy and Physiology in Health and Illness', author: 'Ross & Wilson', edition: '13th Edition' },
    { subjectCode: 'BP101T', title: 'Principles of Anatomy and Physiology', author: 'Gerard J. Tortora', edition: '15th Edition' },
    { subjectCode: 'BP102T', title: 'Practical Pharmaceutical Chemistry', author: 'A.H. Beckett & J.B. Stenlake', edition: '4th Edition' },
    { subjectCode: 'BP102T', title: 'Quantitative Chemical Analysis', author: 'Vogel', edition: '6th Edition' },
    { subjectCode: 'PD101', title: 'Anatomy and Physiology in Health and Illness', author: 'Ross & Wilson', edition: '13th Edition' },
    { subjectCode: 'BP201T', title: 'Anatomy and Physiology in Health and Illness', author: 'Ross & Wilson', edition: '13th Edition' },
    { subjectCode: 'BP103T', title: 'Cooper and Gunn\'s Dispensing for Pharmaceutical Students', author: 'S.J. Carter', edition: '12th Edition' }
  ],
  referenceBooks: [
    { subjectCode: 'BP101T', title: 'Textbook of Medical Physiology', author: 'Guyton & Hall', edition: '14th Edition' },
    { subjectCode: 'BP101T', title: 'Physiology of the Human Body', author: 'Arthur C. Guyton', edition: '8th Edition' },
    { subjectCode: 'BP102T', title: 'Analytical Chemistry', author: 'Christian G.D.', edition: '7th Edition' },
    { subjectCode: 'PD101', title: 'Textbook of Medical Physiology', author: 'Guyton & Hall', edition: '14th Edition' },
    { subjectCode: 'BP201T', title: 'Textbook of Medical Physiology', author: 'Guyton & Hall', edition: '14th Edition' },
    { subjectCode: 'BP103T', title: 'Remington: The Science and Practice of Pharmacy', author: 'Gennaro A.R.', edition: '23rd Edition' }
  ],
  assessmentPattern: [
    {
      subjectCode: 'BP101T',
      theoryInternal: 25,
      theoryExternal: 75,
      practicalInternal: 15,
      practicalExternal: 35,
      universityExam: 100
    },
    {
      subjectCode: 'BP102T',
      theoryInternal: 25,
      theoryExternal: 75,
      practicalInternal: 15,
      practicalExternal: 35,
      universityExam: 100
    },
    {
      subjectCode: 'PD101',
      theoryInternal: 30,
      theoryExternal: 70,
      practicalInternal: 30,
      practicalExternal: 70,
      universityExam: 100
    },
    {
      subjectCode: 'BP201T',
      theoryInternal: 25,
      theoryExternal: 75,
      practicalInternal: 15,
      practicalExternal: 35,
      universityExam: 100
    },
    {
      subjectCode: 'BP103T',
      theoryInternal: 25,
      theoryExternal: 75,
      practicalInternal: 15,
      practicalExternal: 35,
      universityExam: 100
    }
  ],
  importHistory: [
    {
      id: 'h1',
      fileName: 'PCI_Syllabus_Master_Template_v1.xlsx',
      importedAt: '2026-07-08T10:00:00Z',
      importedBy: 'Academic Admin',
      version: '1.2',
      summary: 'Initial load of BP101T and BP102T curricula.'
    }
  ]
};

// Initialize or read from localStorage
export const getCurriculumDb = (): MasterCurriculumDb => {
  const deletedData = localStorage.getItem('srmcop_deleted_subjects');
  const deletedList = deletedData ? (JSON.parse(deletedData) as string[]) : [];

  const data = localStorage.getItem('srmcop_curriculum_db');
  if (!data) {
    const initialDb = { ...defaultCurriculumDb };
    if (deletedList.length > 0) {
      initialDb.courseInformation = initialDb.courseInformation.filter(c => !deletedList.includes(c.subjectCode));
      initialDb.scope = initialDb.scope.filter(s => !deletedList.includes(s.subjectCode));
      initialDb.objectives = initialDb.objectives.filter(o => !deletedList.includes(o.subjectCode));
      initialDb.courseOutcomes = initialDb.courseOutcomes.filter(o => !deletedList.includes(o.subjectCode));
      initialDb.units = initialDb.units.filter(u => !deletedList.includes(u.subjectCode));
      initialDb.curriculumTopics = initialDb.curriculumTopics.filter(t => !deletedList.includes(t.subjectCode));
      initialDb.recommendedBooks = initialDb.recommendedBooks.filter(b => !deletedList.includes(b.subjectCode));
      initialDb.referenceBooks = initialDb.referenceBooks.filter(b => !deletedList.includes(b.subjectCode));
      initialDb.assessmentPattern = initialDb.assessmentPattern.filter(a => !deletedList.includes(a.subjectCode));
    }
    localStorage.setItem('srmcop_curriculum_db', JSON.stringify(initialDb));
    return initialDb;
  }
  try {
    const parsed = JSON.parse(data) as MasterCurriculumDb;
    let updated = false;

    // Filter out deleted items from parsed db just in case
    if (deletedList.length > 0) {
      const originalInfoLength = parsed.courseInformation?.length || 0;
      parsed.courseInformation = parsed.courseInformation?.filter(c => !deletedList.includes(c.subjectCode)) || [];
      if (parsed.courseInformation.length !== originalInfoLength) {
        updated = true;
      }
      parsed.scope = parsed.scope?.filter(s => !deletedList.includes(s.subjectCode)) || [];
      parsed.objectives = parsed.objectives?.filter(o => !deletedList.includes(o.subjectCode)) || [];
      parsed.courseOutcomes = parsed.courseOutcomes?.filter(o => !deletedList.includes(o.subjectCode)) || [];
      parsed.units = parsed.units?.filter(u => !deletedList.includes(u.subjectCode)) || [];
      parsed.curriculumTopics = parsed.curriculumTopics?.filter(t => !deletedList.includes(t.subjectCode)) || [];
      parsed.recommendedBooks = parsed.recommendedBooks?.filter(b => !deletedList.includes(b.subjectCode)) || [];
      parsed.referenceBooks = parsed.referenceBooks?.filter(b => !deletedList.includes(b.subjectCode)) || [];
      parsed.assessmentPattern = parsed.assessmentPattern?.filter(a => !deletedList.includes(a.subjectCode)) || [];
    }

    // Normalize regulations globally based on programme
    if (parsed.courseInformation) {
      parsed.courseInformation = parsed.courseInformation.map(c => {
        let r = c.regulation ? String(c.regulation).trim() : '';
        if (c.programme === 'Pharm.D') {
          if (r !== 'PCI 2008') {
            r = 'PCI 2008';
            updated = true;
          }
        } else {
          // B.Pharm
          if (!r || r === 'PCI Regulation 2020' || r === 'PCI Regulation 2008' || r === 'PCI 2020' || r === 'PCI 2008' || r === 'PCI 2017') {
            r = 'PCI 2017';
          } else if (r === 'PCI2026' || r === 'PCI Regulation 2026' || r === 'PCI 2026') {
            r = 'PCI 2026';
          } else {
            r = 'PCI 2017';
          }
        }
        if (c.regulation !== r) {
          updated = true;
        }
        return { ...c, regulation: r };
      });
    }

    // Purge outdated PCI 2026 courses from parsed db to ensure it starts clean (only BP101T is the allowed test subject)
    if (parsed.courseInformation) {
      const originalLength = parsed.courseInformation.length;
      parsed.courseInformation = parsed.courseInformation.filter(c => {
        if (c.regulation === 'PCI 2026') {
          return c.subjectCode === 'BP101T' && c.academicYear === '2026-2027';
        }
        return true;
      });
      if (parsed.courseInformation.length !== originalLength) {
        updated = true;
      }
    }

    // Check if default subjects are present in courseInformation, if not add them (skip deleted ones)
    defaultCurriculumDb.courseInformation.forEach(c => {
      if (deletedList.includes(c.subjectCode)) return;
      if (!parsed.courseInformation.some(existing => existing.subjectCode === c.subjectCode && (existing.regulation || 'PCI 2017') === c.regulation)) {
        parsed.courseInformation.push(c);
        updated = true;
      }
    });

    if (updated) {
      // Merge all other key sheets so they are not missing (skip deleted ones)
      const sheetsToMerge = [
        'scope', 'objectives', 'courseOutcomes', 'units', 
        'curriculumTopics', 'recommendedBooks', 'referenceBooks', 'assessmentPattern'
      ];
      
      sheetsToMerge.forEach(key => {
        const parsedArr = (parsed as any)[key] || [];
        const defaultArr = (defaultCurriculumDb as any)[key] || [];
        
        defaultArr.forEach((item: any) => {
          if (deletedList.includes(item.subjectCode)) return;
          const isExisting = parsedArr.some((existing: any) => {
            if (key === 'scope' || key === 'assessmentPattern') {
              return existing.subjectCode === item.subjectCode;
            }
            if (key === 'objectives') {
              return existing.subjectCode === item.subjectCode && existing.order === item.order;
            }
            if (key === 'courseOutcomes') {
              return existing.subjectCode === item.subjectCode && existing.coCode === item.coCode;
            }
            if (key === 'units') {
              return existing.subjectCode === item.subjectCode && existing.unitCode === item.unitCode;
            }
            if (key === 'curriculumTopics') {
              return existing.subjectCode === item.subjectCode && existing.topicCode === item.topicCode;
            }
            if (key === 'recommendedBooks' || key === 'referenceBooks') {
              return existing.subjectCode === item.subjectCode && existing.title === item.title;
            }
            return false;
          });
          
          if (!isExisting) {
            parsedArr.push(item);
          }
        });
        
        (parsed as any)[key] = parsedArr;
      });

      localStorage.setItem('srmcop_curriculum_db', JSON.stringify(parsed));
    }
    
    return parsed;
  } catch (e) {
    return defaultCurriculumDb;
  }
};

// Save to localStorage
export const saveCurriculumDb = (db: MasterCurriculumDb) => {
  localStorage.setItem('srmcop_curriculum_db', JSON.stringify(db));
  
  // Sync to Firestore
  import('../lib/firebase').then(({ addCourseToFirestore }) => {
    for (const course of db.courseInformation) {
      addCourseToFirestore(course).catch(err => console.error("Error syncing course to firestore:", err));
    }
  }).catch(e => console.error("Firebase load error inside saveCurriculumDb:", e));
};

// Permanently delete course across all collections
export const deleteCourseFromDb = (code: string) => {
  const deletedData = localStorage.getItem('srmcop_deleted_subjects');
  const deletedList = deletedData ? (JSON.parse(deletedData) as string[]) : [];
  if (!deletedList.includes(code)) {
    deletedList.push(code);
    localStorage.setItem('srmcop_deleted_subjects', JSON.stringify(deletedList));
  }

  const db = getCurriculumDb();
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
  localStorage.removeItem(`srmcop_teaching_res_${code}`);

  // Sync delete to Firestore
  import('../lib/firebase').then(({ deleteCourseFromFirestore }) => {
    deleteCourseFromFirestore(code).catch(err => console.error("Error deleting course from firestore:", err));
  }).catch(e => console.error("Firebase load error inside deleteCourseFromDb:", e));
};

// Reusable worksheet existence validator
export const EXPECTED_SHEETS_CONFIG: Record<string, string[]> = {
  'Course Information': [
    'Subject Code',
    'Course Name',
    'Programme',
    'Regulation',
    'Year',
    'Semester',
    'Credits',
    'Hours',
    'Subject Type',
    'Status',
    'Faculty Assigned',
    'Import Version',
    'Academic Year'
  ],
  'Scope': [
    'Subject Code',
    'Scope Statement'
  ],
  'Objectives': [
    'Subject Code',
    'Objective Text',
    'Order'
  ],
  'Course Outcomes': [
    'Subject Code',
    'CO Code',
    'CO Text',
    'Attainment Target'
  ],
  'Units': [
    'Subject Code',
    'Unit Code',
    'Unit Name',
    'Hours'
  ],
  'Curriculum Topics': [
    'Subject Code',
    'Unit Code',
    'Topic Code',
    'Topic Name',
    'Hours'
  ],
  'Reference Books': [
    'Subject Code',
    'Title',
    'Author',
    'Edition'
  ],
  'Assessment Pattern': [
    'Subject Code',
    'Theory Internal',
    'Theory External',
    'Practical Internal',
    'Practical External',
    'University Exam'
  ]
};

export const getWorksheetColumns = (sheet: XLSX.WorkSheet): string[] => {
  if (!sheet || !sheet['!ref']) return [];
  const range = XLSX.utils.decode_range(sheet['!ref']);
  const cols: string[] = [];
  const R = range.s.r;
  for (let C = range.s.c; C <= range.e.c; ++C) {
    const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
    const cell = sheet[cellAddress];
    if (cell && cell.v !== undefined) {
      cols.push(String(cell.v).trim());
    }
  }
  return cols;
};

export const validateWorkbookWorksheets = (workbook: XLSX.WorkBook): { valid: boolean; missingSheets: string[] } => {
  const requiredSheets = Object.keys(EXPECTED_SHEETS_CONFIG);
  const sheetNames = workbook.SheetNames;
  const missingSheets = requiredSheets.filter(sheet => !sheetNames.includes(sheet));
  
  return {
    valid: missingSheets.length === 0,
    missingSheets
  };
};

export const validateWorkbookFull = (workbook: XLSX.WorkBook): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  const expectedSheets = Object.keys(EXPECTED_SHEETS_CONFIG);
  const sheetNames = workbook.SheetNames;

  // 1. Sheet presence
  const missingSheets = expectedSheets.filter(sheet => !sheetNames.includes(sheet));
  if (missingSheets.length > 0) {
    errors.push(`Missing required worksheet(s): ${missingSheets.join(', ')}`);
  }

  // 2. Sheet order sequence
  if (missingSheets.length === 0) {
    for (let i = 0; i < expectedSheets.length; i++) {
      if (sheetNames[i] !== expectedSheets[i]) {
        errors.push(`Incorrect worksheet sequence. Expected '${expectedSheets[i]}' at sheet index ${i + 1}, but found '${sheetNames[i]}'`);
      }
    }
  }

  // 3. Column names & sequence
  expectedSheets.forEach(sheetName => {
    if (!sheetNames.includes(sheetName)) return;
    const sheet = workbook.Sheets[sheetName];
    if (!sheet) {
      errors.push(`Worksheet '${sheetName}' is unreadable.`);
      return;
    }
    const actualCols = getWorksheetColumns(sheet);
    const expectedCols = EXPECTED_SHEETS_CONFIG[sheetName];

    if (actualCols.length === 0) {
      errors.push(`Worksheet '${sheetName}' is empty or contains no header row.`);
      return;
    }

    // Check columns and their exact sequence matching
    for (let i = 0; i < expectedCols.length; i++) {
      const expected = expectedCols[i];
      const actual = actualCols[i];
      if (!actual) {
        errors.push(`Worksheet '${sheetName}' is missing expected column '${expected}' at column position ${i + 1}`);
      } else if (actual !== expected) {
        errors.push(`Column sequence mismatch in '${sheetName}' at position ${i + 1}. Expected '${expected}', but found '${actual}'`);
      }
    }
  });

  return {
    valid: errors.length === 0,
    errors
  };
};

// Parse raw file into curriculum rows
export const parseCurriculumWorkbook = (workbook: XLSX.WorkBook, defaultAcademicYear?: string): Omit<MasterCurriculumDb, 'importHistory'> => {
  // Convert sheet to json helper
  const sheetToJson = <T>(sheetName: string): T[] => {
    const sheet = workbook.Sheets[sheetName];
    if (!sheet) return [];
    return XLSX.utils.sheet_to_json(sheet) as T[];
  };

  const courseInfoRaw = sheetToJson<any>('Course Information');
  const scopeRaw = sheetToJson<any>('Scope');
  const objectivesRaw = sheetToJson<any>('Objectives');
  const outcomesRaw = sheetToJson<any>('Course Outcomes');
  const unitsRaw = sheetToJson<any>('Units');
  const topicsRaw = sheetToJson<any>('Curriculum Topics');
  const refBooksRaw = sheetToJson<any>('Reference Books');
  const assessmentRaw = sheetToJson<any>('Assessment Pattern');

  // Map to clean formats linking by Subject Code
  const courseInformation: CourseInformation[] = courseInfoRaw.map(row => {
    const prog = String(row['Programme'] || row['programme'] || 'B.Pharm').trim();
    let rawReg = String(row['Regulation'] || row['regulation'] || '').trim();
    if (prog === 'Pharm.D') {
      rawReg = 'PCI 2008';
    } else {
      if (!rawReg || rawReg === 'PCI Regulation 2020' || rawReg === 'PCI Regulation 2008' || rawReg === 'PCI 2020' || rawReg === 'PCI 2008' || rawReg === 'PCI 2017') {
        rawReg = 'PCI 2017';
      } else if (rawReg === 'PCI2026' || rawReg === 'PCI Regulation 2026' || rawReg === 'PCI 2026') {
        rawReg = 'PCI 2026';
      } else {
        rawReg = 'PCI 2017';
      }
    }
    return {
      subjectCode: String(row['Subject Code'] || row['subjectCode'] || '').trim(),
      courseName: String(row['Course Name'] || row['courseName'] || '').trim(),
      programme: prog,
      regulation: rawReg,
      year: Number(row['Year'] || row['year'] || 1),
      semester: Number(row['Semester'] || row['semester'] || 1),
      credits: Number(row['Credits'] || row['credits'] || 4),
      hours: Number(row['Hours'] || row['hours'] || 45),
      subjectType: ((row['Subject Type'] || row['subjectType'] || 'Theory') === 'Practical' ? 'Practical' : 'Theory') as 'Theory' | 'Practical',
      status: String(row['Status'] || row['status'] || 'Approved') as any,
      facultyAssigned: String(row['Faculty Assigned'] || row['facultyAssigned'] || 'Unassigned').trim(),
      importVersion: String(row['Import Version'] || row['importVersion'] || '1.0').trim(),
      academicYear: String(row['Academic Year'] || row['academicYear'] || defaultAcademicYear || '2025-2026').trim()
    };
  }).filter(row => row.subjectCode);

  const scope: ScopeData[] = scopeRaw.map(row => ({
    subjectCode: String(row['Subject Code'] || row['subjectCode'] || '').trim(),
    scopeStatement: String(row['Scope Statement'] || row['scopeStatement'] || '').trim()
  })).filter(row => row.subjectCode);

  const objectives: ObjectiveData[] = objectivesRaw.map(row => ({
    subjectCode: String(row['Subject Code'] || row['subjectCode'] || '').trim(),
    objectiveText: String(row['Objective Text'] || row['objectiveText'] || '').trim(),
    order: Number(row['Order'] || row['order'] || 1)
  })).filter(row => row.subjectCode && row.objectiveText);

  const courseOutcomes: CourseOutcomeData[] = outcomesRaw.map(row => ({
    subjectCode: String(row['Subject Code'] || row['subjectCode'] || '').trim(),
    coCode: String(row['CO Code'] || row['coCode'] || '').trim(),
    coText: String(row['CO Text'] || row['coText'] || '').trim(),
    attainmentTarget: Number(row['Attainment Target'] || row['attainmentTarget'] || 2.5)
  })).filter(row => row.subjectCode && row.coCode);

  const units: UnitData[] = unitsRaw.map(row => ({
    subjectCode: String(row['Subject Code'] || row['subjectCode'] || '').trim(),
    unitCode: String(row['Unit Code'] || row['unitCode'] || '').trim(),
    unitName: String(row['Unit Name'] || row['unitName'] || '').trim(),
    hours: Number(row['Hours'] || row['hours'] || 9)
  })).filter(row => row.subjectCode && row.unitCode);

  const curriculumTopics: CurriculumTopicData[] = topicsRaw.map((row, idx) => ({
    subjectCode: String(row['Subject Code'] || row['subjectCode'] || '').trim(),
    unitCode: String(row['Unit Code'] || row['unitCode'] || '').trim(),
    topicCode: String(row['Topic Code'] || row['topicCode'] || `T${idx}`).trim(),
    topicName: String(row['Topic Name'] || row['topicName'] || '').trim(),
    hours: Number(row['Hours'] || row['hours'] || 1)
  })).filter(row => row.subjectCode && row.topicName);

  const referenceBooks: BookData[] = refBooksRaw.map(row => ({
    subjectCode: String(row['Subject Code'] || row['subjectCode'] || '').trim(),
    title: String(row['Title'] || row['title'] || '').trim(),
    author: String(row['Author'] || row['author'] || '').trim(),
    edition: String(row['Edition'] || row['edition'] || '').trim()
  })).filter(row => row.subjectCode && row.title);

  // Maintain recommendedBooks duplicate for seamless UI backward compatibility
  const recommendedBooks = referenceBooks;

  const assessmentPattern: AssessmentPatternData[] = assessmentRaw.map(row => ({
    subjectCode: String(row['Subject Code'] || row['subjectCode'] || '').trim(),
    theoryInternal: Number(row['Theory Internal'] || row['theoryInternal'] || 25),
    theoryExternal: Number(row['Theory External'] || row['theoryExternal'] || 75),
    practicalInternal: Number(row['Practical Internal'] || row['practicalInternal'] || 15),
    practicalExternal: Number(row['Practical External'] || row['practicalExternal'] || 35),
    universityExam: Number(row['University Exam'] || row['universityExam'] || 100)
  })).filter(row => row.subjectCode);

  return {
    courseInformation,
    scope,
    objectives,
    courseOutcomes,
    units,
    curriculumTopics,
    recommendedBooks,
    referenceBooks,
    assessmentPattern
  };
};

// Differentials comparison logic between existing and newly parsed workbook
export interface DiffSummary {
  subjectsAdded: string[];
  subjectsUpdated: string[];
  subjectsRemoved: string[];
  unitsUpdated: string[];
  booksUpdated: string[];
  objectivesUpdated: string[];
  hasChanges: boolean;
}

export const compareCurriculumVersions = (
  current: MasterCurriculumDb,
  parsed: Omit<MasterCurriculumDb, 'importHistory'>
): DiffSummary => {
  const currentCodes = current.courseInformation.map(c => c.subjectCode);
  const parsedCodes = parsed.courseInformation.map(c => c.subjectCode);

  const subjectsAdded = parsedCodes.filter(code => !currentCodes.includes(code));
  const subjectsRemoved = currentCodes.filter(code => !parsedCodes.includes(code));
  const subjectsUpdated: string[] = [];
  const unitsUpdated: string[] = [];
  const booksUpdated: string[] = [];
  const objectivesUpdated: string[] = [];

  // Check intersection for details change
  const intersection = currentCodes.filter(code => parsedCodes.includes(code));

  intersection.forEach(code => {
    // 1. Check Course Information details
    const currInfo = current.courseInformation.find(c => c.subjectCode === code);
    const newInfo = parsed.courseInformation.find(c => c.subjectCode === code);
    if (currInfo && newInfo) {
      if (
        currInfo.courseName !== newInfo.courseName ||
        currInfo.credits !== newInfo.credits ||
        currInfo.hours !== newInfo.hours ||
        currInfo.subjectType !== newInfo.subjectType
      ) {
        subjectsUpdated.push(code);
      }
    }

    // 2. Check Units
    const currUnits = current.units.filter(u => u.subjectCode === code).map(u => `${u.unitCode}:${u.unitName}:${u.hours}`).sort();
    const newUnits = parsed.units.filter(u => u.subjectCode === code).map(u => `${u.unitCode}:${u.unitName}:${u.hours}`).sort();
    if (JSON.stringify(currUnits) !== JSON.stringify(newUnits)) {
      unitsUpdated.push(code);
    }

    // 3. Check Objectives
    const currObjs = current.objectives.filter(o => o.subjectCode === code).map(o => o.objectiveText).sort();
    const newObjs = parsed.objectives.filter(o => o.subjectCode === code).map(o => o.objectiveText).sort();
    if (JSON.stringify(currObjs) !== JSON.stringify(newObjs)) {
      objectivesUpdated.push(code);
    }

    // 4. Check Books (rec + ref)
    const currRec = current.recommendedBooks.filter(b => b.subjectCode === code).map(b => `${b.title}:${b.author}`).sort();
    const newRec = parsed.recommendedBooks.filter(b => b.subjectCode === code).map(b => `${b.title}:${b.author}`).sort();
    const currRef = current.referenceBooks.filter(b => b.subjectCode === code).map(b => `${b.title}:${b.author}`).sort();
    const newRef = parsed.referenceBooks.filter(b => b.subjectCode === code).map(b => `${b.title}:${b.author}`).sort();
    if (JSON.stringify(currRec) !== JSON.stringify(newRec) || JSON.stringify(currRef) !== JSON.stringify(newRef)) {
      booksUpdated.push(code);
    }
  });

  return {
    subjectsAdded,
    subjectsUpdated,
    subjectsRemoved,
    unitsUpdated,
    booksUpdated,
    objectivesUpdated,
    hasChanges: 
      subjectsAdded.length > 0 ||
      subjectsRemoved.length > 0 ||
      subjectsUpdated.length > 0 ||
      unitsUpdated.length > 0 ||
      booksUpdated.length > 0 ||
      objectivesUpdated.length > 0
  };
};

// Generates and downloads the beautiful master curriculum excel template
export const generateAndDownloadTemplate = () => {
  const wb = XLSX.utils.book_new();

  // 1. Course Information sheet
  const courseInfoData = [
    {
      'Subject Code': 'BP101T',
      'Course Name': 'Human Anatomy and Physiology I',
      'Programme': 'B.Pharm',
      'Regulation': 'PCI Regulation 2020',
      'Year': 1,
      'Semester': 1,
      'Credits': 4,
      'Hours': 45,
      'Subject Type': 'Theory',
      'Status': 'Approved',
      'Faculty Assigned': 'Dr. V. Chitra',
      'Import Version': '1.2'
    },
    {
      'Subject Code': 'BP102T',
      'Course Name': 'Pharmaceutical Analysis I',
      'Programme': 'B.Pharm',
      'Regulation': 'PCI Regulation 2020',
      'Year': 1,
      'Semester': 1,
      'Credits': 4,
      'Hours': 45,
      'Subject Type': 'Theory',
      'Status': 'Approved',
      'Faculty Assigned': 'Dr. Meena Swaminathan, M.Pharm.',
      'Import Version': '1.0'
    }
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(courseInfoData), 'Course Information');

  // 2. Scope sheet
  const scopeData = [
    { 'Subject Code': 'BP101T', 'Scope Statement': 'This course is designed to impart a fundamental knowledge on the structure and functions of the various systems of the human body...' },
    { 'Subject Code': 'BP102T', 'Scope Statement': 'This course deals with the fundamentals of analytical chemistry and principles of electrochemical analysis of pharmaceutical formulations.' }
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(scopeData), 'Scope');

  // 3. Objectives sheet
  const objectivesData = [
    { 'Subject Code': 'BP101T', 'Objective Text': 'Describe the structure, location, and basic function of various organs of the human body.', 'Order': 1 },
    { 'Subject Code': 'BP101T', 'Objective Text': 'Comprehend the homeostatic mechanisms of tissue systems.', 'Order': 2 },
    { 'Subject Code': 'BP102T', 'Objective Text': 'Understand the principles of volumetric and electrochemical analysis.', 'Order': 1 }
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(objectivesData), 'Objectives');

  // 4. Course Outcomes sheet
  const outcomesData = [
    { 'Subject Code': 'BP101T', 'CO Code': 'CO1', 'CO Text': 'Articulate cellular pathways, epithelial tissue boundaries, and intercellular communications.', 'Attainment Target': 2.5 },
    { 'Subject Code': 'BP102T', 'CO Code': 'CO1', 'CO Text': 'Evaluate different sources of errors and conduct standard analytical calibrations.', 'Attainment Target': 2.5 }
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(outcomesData), 'Course Outcomes');

  // 5. Units sheet
  const unitsData = [
    { 'Subject Code': 'BP101T', 'Unit Code': 'Unit I', 'Unit Name': 'Introduction to Human Body & Cellular Level', 'Hours': 10 },
    { 'Subject Code': 'BP101T', 'Unit Code': 'Unit II', 'Unit Name': 'Skeletal & Joint Systems', 'Hours': 9 },
    { 'Subject Code': 'BP102T', 'Unit Code': 'Unit I', 'Unit Name': 'Quantitative Analysis & Titrimetry Fundamentals', 'Hours': 10 }
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(unitsData), 'Units');

  // 6. Curriculum Topics sheet
  const topicsData = [
    { 'Subject Code': 'BP101T', 'Unit Code': 'Unit I', 'Topic Code': 'T1.1', 'Topic Name': 'Definition of Anatomy and Physiology', 'Hours': 1 },
    { 'Subject Code': 'BP101T', 'Unit Code': 'Unit I', 'Topic Code': 'T1.2', 'Topic Name': 'Levels of Structural Organization', 'Hours': 1 },
    { 'Subject Code': 'BP102T', 'Unit Code': 'Unit I', 'Topic Code': 'T1.1', 'Topic Name': 'Classification of analytical methods', 'Hours': 2 }
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(topicsData), 'Curriculum Topics');

  // 7. Recommended Books sheet
  const recBooksData = [
    { 'Subject Code': 'BP101T', 'Title': 'Anatomy and Physiology in Health and Illness', 'Author': 'Ross & Wilson', 'Edition': '13th Edition' },
    { 'Subject Code': 'BP102T', 'Title': 'Practical Pharmaceutical Chemistry', 'Author': 'A.H. Beckett & J.B. Stenlake', 'Edition': '4th Edition' }
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(recBooksData), 'Recommended Books');

  // 8. Reference Books sheet
  const refBooksData = [
    { 'Subject Code': 'BP101T', 'Title': 'Textbook of Medical Physiology', 'Author': 'Guyton & Hall', 'Edition': '14th Edition' },
    { 'Subject Code': 'BP102T', 'Title': 'Analytical Chemistry', 'Author': 'Christian G.D.', 'Edition': '7th Edition' }
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(refBooksData), 'Reference Books');

  // 9. Assessment Pattern sheet
  const assessmentData = [
    { 'Subject Code': 'BP101T', 'Theory Internal': 25, 'Theory External': 75, 'Practical Internal': 15, 'Practical External': 35, 'University Exam': 100 },
    { 'Subject Code': 'BP102T', 'Theory Internal': 25, 'Theory External': 75, 'Practical Internal': 15, 'Practical External': 35, 'University Exam': 100 }
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(assessmentData), 'Assessment Pattern');

  // Trigger Excel file download
  XLSX.writeFile(wb, 'SRMCOP_Master_Curriculum_Template.xlsx');
};

// Seed resources corresponding to the topics in our default database
const defaultTeachingResources: Record<string, Resource[]> = {
  'BP101T': [
    {
      id: 'res-hap-1',
      type: 'Video',
      title: 'Introduction to Epithelial & Connective Tissues',
      description: 'Comprehensive lecture on structure, classification, and function of epithelial and connective tissues in human body.',
      duration: '42 mins',
      status: 'completed',
      url: 'https://www.w3schools.com/html/mov_bbb.mp4',
      content: 'Overview of tissues, structural hierarchy, types of simple and stratified epithelium, connective tissue matrix and specialized fibers.',
      unit: 'Unit I',
      topicCode: 'T1.7' // Epithelial, Connective, Muscle and Nervous Tissues
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
      unit: 'Unit II',
      topicCode: 'T2.1' // Bone Tissue Histology and Remodeling
    },
    {
      id: 'res-hap-3',
      type: 'Slides',
      title: 'Cardiovascular System - Blood Components',
      description: 'Lecture slides covering composition of blood, plasma proteins, hematopoiesis, red blood cell lifecycle, and erythropoietin feedback loop.',
      fileSize: '3.1 MB',
      status: 'in-progress',
      unit: 'Unit III',
      topicCode: 'T3.1' // Plasma Proteins and Solute Composition
    }
  ],
  'BP102T': [
    {
      id: 'res-pa-1',
      type: 'Video',
      title: 'Acid-Base Titration Concepts & Indicator Theory',
      description: 'Visualizing neutralization reactions, pH curves, Ostwald theory of indicators, and selection criteria for volumetric analysis.',
      duration: '35 mins',
      status: 'completed',
      url: 'https://www.w3schools.com/html/mov_bbb.mp4',
      unit: 'Unit II',
      topicCode: 'T2.1' // Acid-base indicators and Ostwald theories
    },
    {
      id: 'res-pa-2',
      type: 'PDF',
      title: 'Non-Aqueous Titration Methodologies & Solvents',
      description: 'Deep dive into titration of weak acids and bases, solvent effects, protogenic vs protophilic classifications, and assay of standard drugs.',
      fileSize: '3.6 MB',
      status: 'in-progress',
      content: 'Non-aqueous titrations are suitable for very weak acids/bases insoluble in water. Solvents used: Aprotic, Protogenic, Protophilic, Amphiprotic. Standard titrants: Perchloric acid in glacial acetic acid.',
      unit: 'Unit II',
      topicCode: 'T2.2' // Non-aqueous titrations: Protophilic vs Protogenic
    }
  ]
};

// Get teaching resources for a specific subject
export const getTeachingResources = (subjectCode: string): Resource[] => {
  const data = localStorage.getItem(`srmcop_teaching_res_${subjectCode}`);
  if (!data) {
    const defaults = defaultTeachingResources[subjectCode] || [];
    localStorage.setItem(`srmcop_teaching_res_${subjectCode}`, JSON.stringify(defaults));
    return defaults;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return defaultTeachingResources[subjectCode] || [];
  }
};

// Save teaching resources for a specific subject
export const saveTeachingResources = (subjectCode: string, resources: Resource[]) => {
  localStorage.setItem(`srmcop_teaching_res_${subjectCode}`, JSON.stringify(resources));

  // Sync to Firestore
  import('../lib/firebase').then(({ saveResourceToFirestore }) => {
    for (const res of resources) {
      saveResourceToFirestore(subjectCode, res).catch(err => console.error("Error saving resource to firestore:", err));
    }
  }).catch(e => console.error("Firebase load error inside saveTeachingResources:", e));
};

// Helper colors list to rotate styles on Course Cards
const colors = [
  'from-blue-500/20 to-indigo-500/20 border-blue-500/30 text-blue-900',
  'from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-900',
  'from-orange-500/20 to-amber-500/20 border-orange-500/30 text-orange-900',
  'from-purple-500/20 to-pink-500/20 border-purple-500/30 text-purple-900',
  'from-rose-500/20 to-red-500/20 border-rose-500/30 text-rose-900',
  'from-cyan-500/20 to-blue-500/20 border-cyan-500/30 text-cyan-900'
];

// Reconstruct Subject list from Excel Course Information DB dynamically
export const getAppSubjects = (): Subject[] => {
  const db = getCurriculumDb();
  const seenIds = new Set<string>();
  const uniqueSubjects: Subject[] = [];
  
  db.courseInformation.forEach((info, idx) => {
    const code = info.subjectCode;
    const resources = getTeachingResources(code);
    
    // Calculate course progress based on completed items in resources
    const completedRes = resources.filter(r => r.status === 'completed').length;
    const progress = resources.length > 0 ? Math.round((completedRes / resources.length) * 100) : 0;
    
    const reg = info.regulation || 'PCI 2017';
    const isLegacy = (code === 'BP101T' && reg === 'PCI 2017') ||
                     (code === 'PD101' && reg === 'PCI 2008') ||
                     (code === 'BP201T' && reg === 'PCI 2017') ||
                     (code === 'BP103T' && reg === 'PCI 2026');
    
    // If it's legacy and matches active year, keep it exact. Otherwise, make it unique.
    const id = isLegacy
      ? (info.academicYear === '2025-2026' ? code : `${code}-${info.academicYear}`)
      : `${code}-${reg}-${info.academicYear || '2025-2026'}`;
    
    if (!seenIds.has(id)) {
      seenIds.add(id);
      uniqueSubjects.push({
        id: id, // Unique combination where needed, legacy remains exact to prevent breaking lookups
        code: code,
        name: info.courseName,
        programme: info.programme as any,
        year: info.year,
        semester: info.semester,
        academicYear: info.academicYear || '2025-2026',
        regulation: info.regulation || 'PCI 2017',
        facultyName: info.facultyAssigned || 'Dr. V. Chitra',
        progress: progress,
        color: colors[idx % colors.length],
        resources: resources
      });
    }
  });

  return uniqueSubjects;
};

