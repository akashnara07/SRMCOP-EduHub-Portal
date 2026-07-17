import { useState } from 'react';
import { 
  ArrowLeft, BookOpen, Video, FileText, Award, Layers, 
  CheckCircle2, Circle, Clock, ChevronRight, ChevronDown, HelpCircle, 
  Search, ClipboardList, BookOpenCheck, ExternalLink, ShieldAlert,
  ShieldCheck, Info, Grid
} from 'lucide-react';
import GlassCard from '../GlassCard';
import { Subject, Resource } from '../../types';
import { getCurriculumDb } from '../../data/curriculumDb';

interface SubjectHomeProps {
  subject: Subject;
  onBack: () => void;
  onSelectResource: (resource: Resource) => void;
}

export default function SubjectHome({
  subject,
  onBack,
  onSelectResource,
}: SubjectHomeProps) {
  const [resourceSearch, setResourceSearch] = useState('');
  const [activeMediaFilter, setActiveMediaFilter] = useState<'all' | 'video' | 'pdf' | 'assessment'>('all');
  const [activeSection, setActiveSection] = useState<'curriculum' | 'resources'>('curriculum');

  // Track expanded units in learning resources workspace
  const [expandedResourceUnits, setExpandedResourceUnits] = useState<Record<string, boolean>>({
    'Unit I': true,
    'Unit II': false,
    'Unit III': false,
    'Unit IV': false,
    'Unit V': false,
  });

  // Track expanded topics in learning resources workspace
  const [expandedResourceTopics, setExpandedResourceTopics] = useState<Record<string, boolean>>({});

  // Accordion Units toggle states for syllabus preview (all minimised by default)
  const [expandedUnits, setExpandedUnits] = useState<Record<string, boolean>>({});

  const getIconForType = (type: Resource['type']) => {
    switch (type) {
      case 'Video': return <Video className="w-4 h-4 text-rose-500" />;
      case 'PDF': return <FileText className="w-4 h-4 text-blue-500" />;
      case 'Slides': return <Layers className="w-4 h-4 text-amber-500" />;
      case 'Notes': return <FileText className="w-4 h-4 text-emerald-500" />;
      case 'Quiz': return <Award className="w-4 h-4 text-purple-500" />;
      case 'Assignment': return <HelpCircle className="w-4 h-4 text-orange-500" />;
    }
  };

  // Dynamically load curriculum content from the master imported database
  const curriculumDb = getCurriculumDb();
  
  const dbSubjectInfo = curriculumDb.courseInformation.find(c => c.subjectCode === subject.code);
  const dbObjectives = curriculumDb.objectives
    .filter(o => o.subjectCode === subject.code)
    .sort((a, b) => a.order - b.order);
  const dbOutcomes = curriculumDb.courseOutcomes
    .filter(co => co.subjectCode === subject.code);
  const dbUnits = curriculumDb.units
    .filter(u => u.subjectCode === subject.code);
  const dbTopics = curriculumDb.curriculumTopics
    .filter(t => t.subjectCode === subject.code);
  const dbRecBooks = curriculumDb.recommendedBooks
    .filter(b => b.subjectCode === subject.code);
  const dbRefBooks = curriculumDb.referenceBooks
    .filter(b => b.subjectCode === subject.code);
  const dbAssessment = curriculumDb.assessmentPattern
    .find(a => a.subjectCode === subject.code);

  // Static fallback definitions if database doesn't contain matching values
  const defaultObjectives = subject.code === 'BP101T' ? [
    'Describe the structure, location, and basic function of various organs of the human body.',
    'Comprehend the homeostatic mechanisms of tissue systems.',
    'Perform structural analysis of cells, tissues, and skeletal classifications.',
    'Identify key skeletal bone landmarks and arterial routes.'
  ] : subject.code === 'BP102T' ? [
    'Understand the principles of volumetric and electrochemical analysis.',
    'Develop analytical skill sets in basic titration preparations.',
    'Appreciate the high-yield concepts of impurity control and limit tests.'
  ] : [
    'Understand the fundamental core guidelines of the prescribed pharmaceutical area.',
    'Develop application-level skills required for industry compliance.',
    'Understand theoretical frameworks under standard pharmacopeial directives.'
  ];

  const defaultOutcomes = subject.code === 'BP101T' ? [
    'CO1: Articulate cellular pathways, epithelial tissue boundaries, and intercellular communications.',
    'CO2: Classify bones and joints under skeletal physiology and locate specific cranial landmarks.',
    'CO3: Appraise blood parameters, plasma composition, and cardiovascular transport dynamics.',
    'CO4: Understand the nervous system structures, including spinal pathways and synaptic transmission.',
    'CO5: Evaluate the skin layers, sweat glands, and thermoregulatory feedback loops.'
  ] : subject.code === 'BP102T' ? [
    'CO1: Evaluate different sources of errors and conduct standard analytical calibrations.',
    'CO2: Perform complex neutralization and non-aqueous assays.',
    'CO3: Master precipitation and complexometric titration protocols.',
    'CO4: Formulate electrochemical cell metrics for quantitative analyses.'
  ] : [
    'CO1: Explain foundational principles and nomenclature systems.',
    'CO2: Apply standardized testing methods with correct accuracy.',
    'CO3: Evaluate outcome parameters in line with pharmaceutical regulations.',
    'CO4: Formulate analytical or synthetic procedures with complete quality control.'
  ];

  const defaultRecBooks = subject.code === 'BP101T' ? [
    { author: 'Ross & Wilson', title: 'Anatomy and Physiology in Health and Illness', edition: '13th Edition' },
    { author: 'Gerard J. Tortora', title: 'Principles of Anatomy and Physiology', edition: '15th Edition' }
  ] : subject.code === 'BP102T' ? [
    { author: 'A.H. Beckett & J.B. Stenlake', title: 'Practical Pharmaceutical Chemistry', edition: '4th Edition' },
    { author: 'Vogel', title: 'Quantitative Chemical Analysis', edition: '6th Edition' }
  ] : [
    { author: 'IP / BP / USP Pharmacopoeia Official Compendium', title: 'Govt Commission', edition: 'Latest Edition' },
    { author: 'Modern Industrial Pharmaceutics & Practice', title: 'Lachman et al.', edition: 'Core Text' }
  ];

  const defaultRefBooks = subject.code === 'BP101T' ? [
    { author: 'Guyton & Hall', title: 'Textbook of Medical Physiology', edition: '14th Edition' }
  ] : subject.code === 'BP102T' ? [
    { author: 'Christian G.D.', title: 'Analytical Chemistry', edition: '7th Edition' }
  ] : [
    { author: 'Remington', title: 'The Science and Practice of Pharmacy', edition: '23rd Edition' }
  ];

  const defaultAssessmentPattern = 'Theory: 75 Marks End-Semester University Exam, 25 Marks Continuous Internal Assessment';

  // Compute final variables using database values if present, else fallbacks
  const objectives = dbObjectives.length > 0 
    ? dbObjectives.map(o => o.objectiveText) 
    : defaultObjectives;

  const outcomes = dbOutcomes.length > 0 
    ? dbOutcomes.map(co => `${co.coCode}: ${co.coText}`) 
    : defaultOutcomes;

  const recBooks = dbRecBooks.length > 0
    ? dbRecBooks.map(b => ({ title: b.title, author: b.author, edition: b.edition }))
    : defaultRecBooks;

  const refBooks = dbRefBooks.length > 0
    ? dbRefBooks.map(b => ({ title: b.title, author: b.author, edition: b.edition }))
    : defaultRefBooks;

  const assessmentPattern = dbAssessment 
    ? `Theory: ${dbAssessment.theoryExternal} Marks End-Semester, ${dbAssessment.theoryInternal} Marks Internal Sessional` 
    : defaultAssessmentPattern;

  // Resolve units with their topics list
  const defaultUnits = subject.code === 'BP101T' ? [
    { name: 'Unit I', title: 'Introduction to Human Body & Cellular Level', hours: 10, topics: ['Levels of Structural Organization', 'Cellular Homeostasis', 'Active vs Passive Transport', 'Histological Classifications'] } as any,
    { name: 'Unit II', title: 'Skeletal & Joint Systems', hours: 9, topics: ['Osseous Tissues and Remodeling', 'Axial Skeleton Cranial Landmarks', 'Joint Articulations and Ranges of Motion'] } as any,
    { name: 'Unit III', title: 'Body Fluids & Blood', hours: 8, topics: ['Plasma Components & Solutes', 'Erythropoiesis Life Cycles', 'Hemostasis cascade & Blood Grouping'] } as any,
    { name: 'Unit IV', title: 'Cardiovascular & Lymphatic Systems', hours: 10, topics: ['Gross Anatomy of Heart Chambers', 'SA/AV Conduction Systems', 'Cardiac Cycles and ECG interpretation'] } as any,
    { name: 'Unit V', title: 'Nervous System & Integumentary System', hours: 8, topics: ['Myelination & Action Potentials', 'Reflex pathways', 'Epidermal Layer Pathology'] } as any
  ] : subject.code === 'BP102T' ? [
    { name: 'Unit I', title: 'Pharmaceutical Analysis & Volumetric Neutralization', hours: 10, topics: ['Limit Tests & Impurities', 'Neutralization Titration Curve Metrics', 'Acid-Base Indicators & Selection'] } as any,
    { name: 'Unit II', title: 'Non-aqueous & Precipitation Titrations', hours: 9, topics: ['Aprotic & Protophilic Solvents', 'Standardization of Perchloric Acid', 'Argentometric assays'] } as any,
    { name: 'Unit III', title: 'Complexometric Titrations & Gravimetry', hours: 8, topics: ['EDTA Ligand Complexation', 'Metal Indicator Theories', 'Co-precipitation vs Post-precipitation'] } as any,
    { name: 'Unit IV', title: 'Redox Titrations & Assays', hours: 10, topics: ['Cerimetry, Iodimetry, and Iodometry', 'Potassium Permanganate Preparations', 'Pharmaceutical Redox Assays'] } as any,
    { name: 'Unit V', title: 'Electrochemical Methods of Analysis', hours: 8, topics: ['Conductometric curves', 'Potentiometric Titrations', 'Polarography and Dropping Mercury Electrode'] } as any
  ] : [
    { name: 'Unit I', title: 'Introduction & Fundamental Directives', hours: 10, topics: ['Regulatory Frameworks', 'Nomenclature Systems', 'Foundational Chemical Properties'] } as any,
    { name: 'Unit II', title: 'Formulations & Processing Operations', hours: 9, topics: ['Standardized Blending Protocols', 'Active vs Inactive Excipients', 'Unit Process Systems'] } as any,
    { name: 'Unit III', title: 'Standardization & Quantitative Assays', hours: 8, topics: ['Assay Preparations', 'Instrument Calibration Curves', 'Sample Testing Routines'] } as any,
    { name: 'Unit IV', title: 'Advanced Technical Operations', hours: 10, topics: ['Industrial Scale Operations', 'Process Parameters Control', 'Safety Auditing Metrics'] } as any,
    { name: 'Unit V', title: 'Quality Control & Compliance Auditing', hours: 8, topics: ['Validation Protocols', 'Pharmacopeial Standards Guidance', 'Defect Category Audits'] } as any
  ];

  const units = dbUnits.length > 0 ? dbUnits.map(u => ({
    name: u.unitCode,
    title: u.unitName,
    hours: u.hours,
    topics: dbTopics
      .filter(t => t.unitCode === u.unitCode)
      .map(t => `${t.topicCode}: ${t.topicName}`)
  })) : defaultUnits;

  // Normalized resource units with structured topic objects for the learning resources accordion
  const normalizedResourceUnits = (dbUnits.length > 0 ? dbUnits : defaultUnits).map((u: any, uIdx: number) => {
    let unitTopicsList: any[] = [];
    if (dbUnits.length > 0) {
      unitTopicsList = dbTopics.filter((t: any) => t.unitCode === u.unitCode);
    } else {
      // defaultUnits fallback
      unitTopicsList = u.topics.map((tStr: string, tIdx: number) => {
        const match = tStr.match(/^([A-Za-z0-9\.]+)\s*:\s*(.*)$/);
        if (match) {
          return {
            topicCode: match[1],
            topicName: match[2]
          };
        } else {
          const romanNumeral = u.name.split(' ')[1]; // e.g. "I"
          const romanToNum: Record<string, number> = { 'I': 1, 'II': 2, 'III': 3, 'IV': 4, 'V': 5 };
          const unitNum = romanToNum[romanNumeral] || (uIdx + 1);
          const topicNum = tIdx + 1;
          return {
            topicCode: `T${unitNum}.${topicNum}`,
            topicName: tStr
          };
        }
      });
    }

    const nTopics = unitTopicsList.map((t: any) => ({
      topicCode: t.topicCode || '',
      topicName: t.topicName || t.topicText || ''
    }));

    return {
      name: u.unitCode || u.name,
      title: u.unitName || u.title,
      hours: u.hours,
      topics: nTopics
    };
  });

  // Maps a resource to the most appropriate topic code in a unit
  const mapResourceToTopic = (res: any, unitName: string, topics: { topicCode: string, topicName: string }[]) => {
    if (res.topicCode) {
      const matched = topics.find(t => t.topicCode.toLowerCase() === res.topicCode.toLowerCase());
      if (matched) return matched.topicCode;
    }

    if (topics.length === 0) return '';

    const titleLower = (res.title || '').toLowerCase();
    for (const t of topics) {
      const codeClean = t.topicCode.toLowerCase();
      if (titleLower.includes(codeClean) || titleLower.includes(` ${codeClean} `) || titleLower.startsWith(codeClean)) {
        return t.topicCode;
      }
    }

    const descLower = (res.description || '').toLowerCase();
    for (const t of topics) {
      const nameClean = t.topicName.toLowerCase();
      if (titleLower.includes(nameClean) || descLower.includes(nameClean)) {
        return t.topicCode;
      }
    }

    return topics[0].topicCode;
  };

  // Resolves the icon, type label, and style classes for resources
  const getResourceIconAndLabel = (type: string, url?: string) => {
    const t = type.toUpperCase();
    if (t === 'VIDEO') {
      return {
        icon: <Video className="w-3.5 h-3.5 text-rose-500 shrink-0" />,
        label: 'VIDEO',
        colorClass: 'text-rose-500 bg-rose-50 border border-rose-100/30 font-mono'
      };
    }
    if (t === 'PDF' || t === 'NOTES') {
      return {
        icon: <FileText className="w-3.5 h-3.5 text-blue-500 shrink-0" />,
        label: 'PDF',
        colorClass: 'text-blue-500 bg-blue-50 border border-blue-100/30 font-mono'
      };
    }
    if (t === 'SLIDES' || t === 'PPT') {
      return {
        icon: <Layers className="w-3.5 h-3.5 text-amber-500 shrink-0" />,
        label: 'PPT',
        colorClass: 'text-amber-500 bg-amber-50 border border-amber-100/30 font-mono'
      };
    }
    if (t === 'QUIZ' || t === 'TEST') {
      return {
        icon: <Award className="w-3.5 h-3.5 text-purple-500 shrink-0" />,
        label: 'QUIZ',
        colorClass: 'text-purple-500 bg-purple-50 border border-purple-100/30 font-mono'
      };
    }
    if (t === 'ASSIGNMENT') {
      return {
        icon: <ClipboardList className="w-3.5 h-3.5 text-orange-500 shrink-0" />,
        label: 'ASSIGNMENT',
        colorClass: 'text-orange-500 bg-orange-50 border border-orange-100/30 font-mono'
      };
    }
    if (url?.startsWith('http')) {
      return {
        icon: <ExternalLink className="w-3.5 h-3.5 text-teal-500 shrink-0" />,
        label: 'LINK',
        colorClass: 'text-teal-500 bg-teal-50 border border-teal-100/30 font-mono'
      };
    }
    return {
      icon: <FileText className="w-3.5 h-3.5 text-gray-500 shrink-0" />,
      label: 'DOCUMENT',
      colorClass: 'text-gray-500 bg-gray-50 border border-gray-100 font-mono'
    };
  };

  // Determines the contextual launch action text for resources
  const getResourceAction = (res: any) => {
    const type = res.type?.toUpperCase() || '';
    const status = res.status;

    if (type === 'VIDEO') {
      if (status === 'completed') return 'Replay';
      if (status === 'in-progress') return 'Continue';
      return 'Watch';
    }
    if (['PDF', 'NOTES', 'SLIDES', 'PRESENTATION'].includes(type)) {
      return 'View';
    }
    if (type === 'EXTERNAL RESOURCE' || res.url?.startsWith('http')) {
      return 'Open';
    }
    if (['QUIZ', 'ASSIGNMENT', 'TEST'].includes(type)) {
      if (status === 'completed') return 'Review';
      if (status === 'in-progress') return 'Continue';
      return 'Attempt';
    }
    return 'View';
  };

  const toggleResourceUnitExpanded = (unitName: string) => {
    setExpandedResourceUnits(prev => ({
      ...prev,
      [unitName]: !prev[unitName]
    }));
  };

  const toggleResourceTopicExpanded = (unitName: string, topicCode: string) => {
    const key = `${unitName}_${topicCode}`;
    setExpandedResourceTopics(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const isResourceTopicExpanded = (unitName: string, topicCode: string, topicsInUnit: { topicCode: string, topicName: string }[], unitResources: any[]) => {
    const key = `${unitName}_${topicCode}`;
    if (expandedResourceTopics[key] !== undefined) {
      return expandedResourceTopics[key];
    }
    const firstTopicWithResources = topicsInUnit.find(t => {
      const hasRes = unitResources.some(r => mapResourceToTopic(r, unitName, topicsInUnit) === t.topicCode);
      return hasRes;
    });
    return firstTopicWithResources ? firstTopicWithResources.topicCode === topicCode : false;
  };

  return (
    <div className="flex flex-col gap-8 w-full max-w-5xl mx-auto pb-12">
      {/* Back button and title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-white/60 border border-white/40 hover:bg-white flex items-center justify-center text-gray-700 transition-all shadow-sm shrink-0"
            id="back_btn"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <span className="text-[10px] font-bold text-[#8B1E3F] uppercase tracking-widest bg-[#8B1E3F]/5 border border-[#8B1E3F]/10 px-2.5 py-0.5 rounded-full">
              {subject.code} • Year {subject.year} • Semester {subject.semester}
            </span>
            <h1 className="font-display font-extrabold text-2xl text-gray-900 tracking-tight mt-1">
              {subject.name}
            </h1>
          </div>
        </div>

        {/* Faculty information pill */}
        <div className="flex items-center gap-2.5 bg-white/50 border border-white/30 px-4.5 py-2 rounded-full self-start sm:self-center shadow-sm">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#8B1E3F] to-[#CD4368] flex items-center justify-center text-white font-black text-xs">
            {subject.facultyName.split(' ')[1]?.[0] || 'P'}
          </div>
          <div>
            <span className="text-[8px] font-black uppercase text-gray-400 block tracking-wider">Subject-In-Charge</span>
            <span className="text-xs font-bold text-gray-800">{subject.facultyName}</span>
          </div>
        </div>
      </div>

      {/* Segmented Option Selector */}
      <div className="flex justify-center mt-2 border-b border-gray-100 pb-5">
        <div className="p-1 bg-gray-200/50 backdrop-blur-md rounded-full flex gap-1 border border-white/30 max-w-lg w-full">
          <button
            onClick={() => setActiveSection('curriculum')}
            className={`
              flex-1 text-xs font-semibold py-2.5 rounded-full transition-all duration-300
              ${activeSection === 'curriculum'
                ? 'bg-white text-gray-950 shadow-sm font-extrabold'
                : 'text-gray-500 hover:text-gray-950'
              }
            `}
          >
            Curriculum Syllabus
          </button>
          <button
            onClick={() => setActiveSection('resources')}
            className={`
              flex-1 text-xs font-semibold py-2.5 rounded-full transition-all duration-300
              ${activeSection === 'resources'
                ? 'bg-white text-gray-950 shadow-sm font-extrabold'
                : 'text-gray-500 hover:text-gray-950'
              }
            `}
          >
            Course Learning Resources
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-10">
        
        {/* ================= SECTION 1: CURRICULUM ================= */}
        {activeSection === 'curriculum' && (
          <div className="flex flex-col gap-6 animate-fadeIn" id="section_curriculum">
            <div className="border-b border-[#8B1E3F]/10 pb-2.5">
              <h2 className="font-display font-extrabold text-base text-[#8B1E3F] uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-4 bg-[#8B1E3F] rounded-full" />
                Section 1: Curriculum & Course Syllabus
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              <div className="lg:col-span-2 flex flex-col gap-6">
                
                {/* 1. Objectives */}
                <div className="rounded-[24px] bg-white border border-gray-150/50 shadow-sm p-6 flex flex-col gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#8B1E3F]/10 text-[#8B1E3F] flex items-center justify-center">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <h3 className="font-display font-extrabold text-sm text-gray-900 uppercase tracking-wide">Course Syllabus Objectives</h3>
                  </div>
                  <div className="flex flex-col gap-2.5 mt-2">
                    {dbObjectives.length > 0 ? (
                      dbObjectives.map((obj, oIdx) => (
                        <div key={oIdx} className="p-3 bg-gray-50/60 rounded-xl flex items-start gap-3 border border-gray-100">
                          <span className="w-5 h-5 rounded-full bg-[#8B1E3F]/15 text-[#8B1E3F] text-[9px] font-black flex items-center justify-center shrink-0 mt-0.5">
                            {obj.order}
                          </span>
                          <p className="text-xs font-semibold text-gray-700 leading-relaxed">{obj.objectiveText}</p>
                        </div>
                      ))
                    ) : (
                      objectives.map((obj, oIdx) => (
                        <div key={oIdx} className="p-3 bg-gray-50/60 rounded-xl flex items-start gap-3 border border-gray-100">
                          <span className="w-5 h-5 rounded-full bg-[#8B1E3F]/15 text-[#8B1E3F] text-[9px] font-black flex items-center justify-center shrink-0 mt-0.5">
                            {oIdx + 1}
                          </span>
                          <p className="text-xs font-semibold text-gray-700 leading-relaxed">{obj}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
                <div className="rounded-[24px] bg-white border border-gray-150/50 shadow-sm p-6 flex flex-col gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#8B1E3F]/10 text-[#8B1E3F] flex items-center justify-center">
                      <Award className="w-4 h-4" />
                    </div>
                    <h3 className="font-display font-extrabold text-sm text-gray-900 uppercase tracking-wide">Course Outcomes (CO)</h3>
                  </div>
                  <div className="flex flex-col gap-2.5 mt-2">
                    {dbOutcomes.length > 0 ? (
                      dbOutcomes.map((co) => (
                        <div key={co.coCode} className="p-3 bg-pink-50/20 rounded-xl flex items-start gap-3 border border-pink-100/30">
                          <span className="w-8 h-5 rounded-full bg-[#8B1E3F] text-white text-[9px] font-black flex items-center justify-center shrink-0 mt-0.5 font-mono">
                            {co.coCode}
                          </span>
                          <p className="text-xs font-semibold text-gray-700 leading-relaxed pr-2 flex-1">{co.coText}</p>
                        </div>
                      ))
                    ) : (
                      outcomes.map((co, cIdx) => {
                        const hasColon = co.includes(':');
                        const code = hasColon ? co.split(':')[0].trim() : `CO ${cIdx + 1}`;
                        const text = hasColon ? co.split(':').slice(1).join(':').trim() : co;
                        return (
                           <div key={cIdx} className="p-3 bg-pink-50/20 rounded-xl flex items-start gap-3 border border-pink-100/30">
                            <span className="w-8 h-5 rounded-full bg-[#8B1E3F] text-white text-[9px] font-black flex items-center justify-center shrink-0 mt-0.5 font-mono">
                              {code}
                            </span>
                            <p className="text-xs font-semibold text-gray-700 leading-relaxed pr-2 flex-1">{text}</p>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* CO-PO Mapping Matrix */}
                <div className="rounded-[24px] bg-white border border-gray-150/50 shadow-sm p-6 flex flex-col gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#8B1E3F]/10 text-[#8B1E3F] flex items-center justify-center">
                      <Grid className="w-4 h-4" />
                    </div>
                    <h3 className="font-display font-extrabold text-sm text-gray-900 uppercase tracking-wide">CO-PO Mapping Matrix</h3>
                  </div>
                  <div className="overflow-x-auto mt-2 border border-gray-100 rounded-xl">
                    <table className="min-w-full divide-y divide-gray-100 text-xs">
                      <thead className="bg-gray-50 text-gray-500 font-bold">
                        <tr>
                          <th className="px-3 py-2 text-left">Course Outcome</th>
                          {Array.from({ length: 11 }).map((_, i) => (
                            <th key={i} className="px-2 py-2 text-center font-mono">PO{i + 1}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 font-semibold text-gray-700">
                        {(dbOutcomes.length > 0 ? dbOutcomes.map(o => o.coCode) : outcomes.map((co, cIdx) => co.includes(':') ? co.split(':')[0].trim() : `CO${cIdx + 1}`)).map((coCode, idx) => {
                          const values = [
                            [3, 2, 1, 3, '-', 2, 1, '-', 2, 1, 3],
                            [2, 3, 2, '-', 1, 3, '-', 2, 1, '-', 2],
                            [3, 1, 3, 2, 2, '-', 3, 1, '-', 2, 1],
                            [1, 2, '-', 3, 3, 1, 2, '-', 3, 1, 2],
                            [2, '-', 2, 1, 2, 3, 1, 2, 2, 3, 3],
                          ][idx % 5];
                          return (
                            <tr key={coCode} className="hover:bg-gray-50/50 transition-colors">
                              <td className="px-3 py-2 font-bold text-gray-900 bg-gray-50/30">{coCode}</td>
                              {values.map((val, vIdx) => (
                                <td key={vIdx} className="px-2 py-2 text-center font-mono">
                                  <span className={val === 3 ? 'text-emerald-600 font-bold' : val === 2 ? 'text-blue-600' : val === 1 ? 'text-gray-600' : 'text-gray-300'}>
                                    {val}
                                  </span>
                                </td>
                              ))}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] font-bold text-gray-400 mt-1 px-1">
                    <span>Correlation Levels:</span>
                    <span className="text-emerald-600 font-bold">3: Substantial (High)</span>
                    <span className="text-blue-600">2: Moderate (Medium)</span>
                    <span className="text-gray-600">1: Slight (Low)</span>
                    <span className="text-gray-300">-: No Correlation</span>
                  </div>
                </div>

                {/* 3. Units & Topics */}
                <div className="rounded-[24px] bg-white border border-gray-150/50 shadow-sm p-6 flex flex-col gap-4">
                  <h3 className="font-display font-extrabold text-sm text-gray-900 uppercase tracking-wide border-b border-gray-100 pb-3">Course Contents</h3>
                  
                  {dbUnits.length > 0 ? (
                    dbUnits.map((unit) => {
                      const isUnitExpanded = expandedUnits[unit.unitCode];
                      const unitTopics = dbTopics.filter(t => t.unitCode === unit.unitCode);
                      return (
                        <div key={unit.unitCode} className="border border-gray-100 rounded-2xl p-4">
                          <div 
                            onClick={() => setExpandedUnits(prev => ({ ...prev, [unit.unitCode]: !prev[unit.unitCode] }))}
                            className="flex justify-between items-center cursor-pointer select-none"
                          >
                            <div className="flex items-center gap-3">
                              {isUnitExpanded ? <ChevronDown className="w-4 h-4 text-[#8B1E3F]" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                              <h4 className="text-xs font-black text-gray-800 uppercase tracking-wider">{unit.unitCode}: {unit.unitName}</h4>
                            </div>
                            <span className="text-[10px] font-bold text-[#8B1E3F] bg-[#8B1E3F]/5 px-2.5 py-0.5 rounded-full font-mono">
                              {unit.hours} Hours
                            </span>
                          </div>

                          {isUnitExpanded && (
                            <div className="mt-4 border-t border-gray-100 pt-3 flex flex-col gap-2 animate-fadeIn">
                              {unitTopics.length > 0 ? (
                                unitTopics.map((topic) => (
                                  <div key={topic.topicCode} className="flex justify-between items-center p-2.5 bg-gray-50 rounded-xl text-xs font-semibold">
                                    <div className="flex items-center gap-2">
                                      <span className="text-mono font-black text-gray-400 w-10">{topic.topicCode}</span>
                                      <span className="text-gray-700">{topic.topicName}</span>
                                    </div>
                                    <span className="text-[9px] font-bold text-gray-400 bg-white border border-gray-100 px-2.5 py-0.5 rounded-full shrink-0 font-mono">
                                      {topic.hours} Hr
                                    </span>
                                  </div>
                                ))
                              ) : (
                                <div className="p-3 text-center text-xs text-gray-400 italic">No topics mapped to this unit.</div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    defaultUnits.map((unit: any) => {
                      const isUnitExpanded = expandedUnits[unit.name];
                      return (
                        <div key={unit.name} className="border border-gray-100 rounded-2xl p-4">
                          <div 
                            onClick={() => setExpandedUnits(prev => ({ ...prev, [unit.name]: !prev[unit.name] }))}
                            className="flex justify-between items-center cursor-pointer select-none"
                          >
                            <div className="flex items-center gap-3">
                              {isUnitExpanded ? <ChevronDown className="w-4 h-4 text-[#8B1E3F]" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                              <h4 className="text-xs font-black text-gray-800 uppercase tracking-wider">{unit.name}: {unit.title}</h4>
                            </div>
                            <span className="text-[10px] font-bold text-[#8B1E3F] bg-[#8B1E3F]/5 px-2.5 py-0.5 rounded-full font-mono">
                              {unit.hours} Hours
                            </span>
                          </div>

                          {isUnitExpanded && (
                            <div className="mt-4 border-t border-gray-100 pt-3 flex flex-col gap-2 animate-fadeIn">
                              {unit.topics.map((top: string, tIdx: number) => {
                                const hasColon = top.includes(':');
                                const code = hasColon ? top.split(':')[0].trim() : `${tIdx + 1}`;
                                const text = hasColon ? top.split(':').slice(1).join(':').trim() : top;
                                return (
                                  <div key={tIdx} className="flex justify-between items-center p-2.5 bg-gray-50 rounded-xl text-xs font-semibold">
                                    <div className="flex items-center gap-2">
                                      <span className="text-mono font-black text-gray-400 w-10">{code}</span>
                                      <span className="text-gray-700">{text}</span>
                                    </div>
                                    <span className="text-[9px] font-bold text-gray-400 bg-white border border-gray-100 px-2.5 py-0.5 rounded-full shrink-0 font-mono">
                                      1 Hr
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Right Column: Prescribed Literature & Exam Blueprint */}
              <div className="flex flex-col gap-6">
                {/* recommended literature */}
                <GlassCard className="p-6">
                  <h3 className="font-display font-bold text-xs text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2 mb-4">
                    Literature References
                  </h3>
                  
                  <div className="flex flex-col gap-4">
                    <div>
                      <span className="text-[9px] font-black uppercase text-gray-400 block mb-1">Recommended Textbooks</span>
                      <div className="flex flex-col gap-2.5">
                        {recBooks.map((bk, idx) => (
                          <div key={idx} className="p-2.5 bg-gray-50/50 border border-white rounded-xl text-xs">
                            <p className="font-extrabold text-gray-800 leading-snug">{bk.title}</p>
                            <p className="text-[10px] text-gray-500 font-bold mt-0.5">{bk.author} — {bk.edition}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="border-t border-gray-100 pt-3">
                      <span className="text-[9px] font-black uppercase text-gray-400 block mb-1">Reference Textbooks</span>
                      <div className="flex flex-col gap-2.5">
                        {refBooks.map((bk, idx) => (
                          <div key={idx} className="p-2.5 bg-gray-50/50 border border-white rounded-xl text-xs">
                            <p className="font-extrabold text-gray-800 leading-snug">{bk.title}</p>
                            <p className="text-[10px] text-gray-500 font-bold mt-0.5">{bk.author} — {bk.edition}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </GlassCard>

                {/* 5. Assessment Weightages / Evaluation Scheme */}
                <GlassCard className="p-6">
                  <h3 className="font-display font-bold text-xs text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2 mb-3">
                    Evaluation Scheme
                  </h3>
                  
                  {dbAssessment ? (
                    <div className="flex flex-col gap-4">
                      {/* Theory Box Design */}
                      <div>
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider block mb-2">Theory Evaluation Scheme</span>
                        <div className="grid grid-cols-3 gap-2.5 text-center">
                          {/* IA */}
                          <div className="p-3 rounded-2xl bg-[#8B1E3F]/5 border border-[#8B1E3F]/15 flex flex-col gap-1 items-center justify-center">
                            <span className="text-[9px] font-black uppercase text-gray-500">Internal (IA)</span>
                            <span className="text-xl font-display font-black text-[#8B1E3F]">{dbAssessment.theoryInternal}</span>
                            <span className="text-[8px] font-bold text-maroon-400 uppercase">Sessional</span>
                          </div>
                          {/* ESE */}
                          <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-150 flex flex-col gap-1 items-center justify-center">
                            <span className="text-[9px] font-black uppercase text-gray-500">External (ESE)</span>
                            <span className="text-xl font-display font-black text-emerald-700">{dbAssessment.theoryExternal}</span>
                            <span className="text-[8px] font-bold text-emerald-500 uppercase">University</span>
                          </div>
                          {/* Total */}
                          <div className="p-3 rounded-2xl bg-blue-50 border border-blue-150 flex flex-col gap-1 items-center justify-center">
                            <span className="text-[9px] font-black uppercase text-gray-500 font-mono">Total</span>
                            <span className="text-xl font-display font-black text-blue-700">{dbAssessment.theoryInternal + dbAssessment.theoryExternal}</span>
                            <span className="text-[8px] font-bold text-blue-500 uppercase">Max Marks</span>
                          </div>
                        </div>
                      </div>

                      {/* Practical scheme using the same premium box design */}
                      {(dbAssessment.practicalInternal > 0 || dbAssessment.practicalExternal > 0) && (
                        <div className="border-t border-gray-100 pt-3">
                          <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider block mb-2">Practical Evaluation Scheme</span>
                          <div className="grid grid-cols-3 gap-2.5 text-center">
                            {/* IA */}
                            <div className="p-3 rounded-2xl bg-[#8B1E3F]/5 border border-[#8B1E3F]/15 flex flex-col gap-1 items-center justify-center">
                              <span className="text-[9px] font-black uppercase text-gray-500">Internal (IA)</span>
                              <span className="text-xl font-display font-black text-[#8B1E3F]">{dbAssessment.practicalInternal}</span>
                              <span className="text-[8px] font-bold text-maroon-400 uppercase">Sessional</span>
                            </div>
                            {/* ESE */}
                            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-150 flex flex-col gap-1 items-center justify-center">
                              <span className="text-[9px] font-black uppercase text-gray-500">External (ESE)</span>
                              <span className="text-xl font-display font-black text-emerald-700">{dbAssessment.practicalExternal}</span>
                              <span className="text-[8px] font-bold text-emerald-500 uppercase">University</span>
                            </div>
                            {/* Total */}
                            <div className="p-3 rounded-2xl bg-blue-50 border border-blue-150 flex flex-col gap-1 items-center justify-center">
                              <span className="text-[9px] font-black uppercase text-gray-500 font-mono">Total</span>
                              <span className="text-xl font-display font-black text-blue-700">{dbAssessment.practicalInternal + dbAssessment.practicalExternal}</span>
                              <span className="text-[8px] font-bold text-blue-500 uppercase">Max Marks</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      <div>
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider block mb-2">Theory Evaluation Scheme</span>
                        <div className="grid grid-cols-3 gap-2.5 text-center">
                          <div className="p-3 rounded-2xl bg-[#8B1E3F]/5 border border-[#8B1E3F]/15 flex flex-col gap-1 items-center justify-center">
                            <span className="text-[9px] font-black uppercase text-gray-500">Internal (IA)</span>
                            <span className="text-xl font-display font-black text-[#8B1E3F]">25</span>
                            <span className="text-[8px] font-bold text-maroon-400 uppercase">Sessional</span>
                          </div>
                          <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-150 flex flex-col gap-1 items-center justify-center">
                            <span className="text-[9px] font-black uppercase text-gray-500">External (ESE)</span>
                            <span className="text-xl font-display font-black text-emerald-700">75</span>
                            <span className="text-[8px] font-bold text-emerald-500 uppercase">University</span>
                          </div>
                          <div className="p-3 rounded-2xl bg-blue-50 border border-blue-150 flex flex-col gap-1 items-center justify-center">
                            <span className="text-[9px] font-black uppercase text-gray-500 font-mono">Total</span>
                            <span className="text-xl font-display font-black text-blue-700">100</span>
                            <span className="text-[8px] font-bold text-blue-500 uppercase">Max Marks</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </GlassCard>
              </div>
            </div>
          </div>
        )}

        {/* ================= SECTION 2: LEARNING RESOURCES ================= */}
        {activeSection === 'resources' && (
          <div className="flex flex-col gap-6 animate-fadeIn" id="section_resources">
            <div className="border-b border-emerald-500/10 pb-2.5">
              <h2 className="font-display font-extrabold text-base text-emerald-700 uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-4 bg-emerald-500 rounded-full" />
                Section 2: Course Learning Resources & Content
              </h2>
              <p className="text-xs text-gray-500 mt-0.5 font-medium">Supplementary video lectures, slide decks, study notes, and MCQs matching faculty courses.</p>
            </div>

          {/* Search, Filter Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative max-w-md w-full">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Search uploaded videos, slides, or quiz modules..."
                value={resourceSearch}
                onChange={(e) => setResourceSearch(e.target.value)}
                className="w-full bg-white border border-gray-200/80 rounded-full pl-10 pr-4 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 font-semibold shadow-sm"
              />
            </div>

            <GlassCard className="p-1 flex gap-1 h-10 shrink-0">
              {[
                { id: 'all', label: 'All Media' },
                { id: 'video', label: 'Lectures' },
                { id: 'pdf', label: 'Reading Material' },
                { id: 'assessment', label: 'Tests' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveMediaFilter(tab.id as any)}
                  className={`
                    px-3.5 h-full rounded-full text-[10px] font-black uppercase tracking-wider transition-all duration-300 whitespace-nowrap
                    ${activeMediaFilter === tab.id
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-white/40'
                    }
                  `}
                >
                  {tab.label}
                </button>
              ))}
            </GlassCard>
          </div>

          {/* Resources Timeline list Grouped by Units */}
          <div className="flex flex-col gap-4">
            {normalizedResourceUnits.map((unit: any) => {
              // Filter resources inside unit
              const unitResources = (subject.resources || []).filter((res) => {
                const matchesSearch = res.title.toLowerCase().includes(resourceSearch.toLowerCase()) || 
                                     res.description.toLowerCase().includes(resourceSearch.toLowerCase());
                if (!matchesSearch) return false;

                // Media tab filter check
                if (activeMediaFilter === 'video' && res.type !== 'Video') return false;
                if (activeMediaFilter === 'pdf' && !['PDF', 'Slides', 'Notes'].includes(res.type)) return false;
                if (activeMediaFilter === 'assessment' && !['Quiz', 'Assignment'].includes(res.type)) return false;

                // Match unit
                return res.unit === unit.name || res.title.startsWith(`${unit.name}:`) || (!res.unit && unit.name === 'Unit I' && !res.title.includes('Unit '));
              });

              const isUnitExpanded = expandedResourceUnits[unit.name];

              return (
                <div key={unit.name} className="flex flex-col gap-2 bg-white/45 border border-slate-150 rounded-2xl p-2.5 shadow-sm">
                  {/* UNIT HEADER */}
                  <div 
                    onClick={() => toggleResourceUnitExpanded(unit.name)}
                    className="w-full bg-[#f8fafc] border border-gray-200/80 rounded-xl px-4 py-3 flex items-center justify-between gap-4 cursor-pointer hover:bg-gray-100/50 transition-colors select-none"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-6 h-6 rounded-lg bg-white border border-gray-150 flex items-center justify-center shrink-0">
                        {isUnitExpanded ? (
                          <ChevronDown className="w-4 h-4 text-gray-600" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-gray-600" />
                        )}
                      </div>
                      <span className="font-display font-extrabold text-xs sm:text-sm text-gray-800 tracking-wide uppercase truncate">
                        {unit.name}: {unit.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] sm:text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100 font-mono">
                        {unitResources.length} {unitResources.length === 1 ? 'Resource' : 'Resources'}
                      </span>
                    </div>
                  </div>

                  {/* TOPICS ACCORDION */}
                  {isUnitExpanded && (
                    <div className="mt-1 flex flex-col border border-gray-100 rounded-xl bg-white overflow-hidden">
                      {unit.topics.map((topic: any) => {
                        const topicResources = unitResources.filter(res => mapResourceToTopic(res, unit.name, unit.topics) === topic.topicCode);
                        const isTopicExpanded = isResourceTopicExpanded(unit.name, topic.topicCode, unit.topics, unitResources);
                        const hasResources = topicResources.length > 0;

                        return (
                          <div key={topic.topicCode} className="border-b border-gray-100/80 last:border-0">
                            {/* TOPIC ROW */}
                            <div 
                              onClick={() => {
                                if (hasResources) {
                                  toggleResourceTopicExpanded(unit.name, topic.topicCode);
                                }
                              }}
                              className={`flex items-center justify-between gap-4 py-2.5 px-3 sm:px-4 select-none transition-colors
                                ${hasResources 
                                  ? 'cursor-pointer hover:bg-slate-50/50' 
                                  : 'cursor-not-allowed opacity-75 bg-gray-50/20'}`}
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                {hasResources ? (
                                  <div className="w-5 h-5 flex items-center justify-center shrink-0">
                                    {isTopicExpanded ? (
                                      <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
                                    ) : (
                                      <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
                                    )}
                                  </div>
                                ) : (
                                  <div className="w-5 h-5 shrink-0" />
                                )}
                                
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <span className="font-mono text-[10px] font-black text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100/50 shrink-0">
                                    {topic.topicCode}
                                  </span>
                                  <span className="text-xs sm:text-sm font-semibold text-gray-700 truncate" title={topic.topicName}>
                                    {topic.topicName}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-3 shrink-0">
                                <span className="text-[10px] sm:text-xs font-semibold text-gray-400 font-mono bg-gray-50 px-2 py-0.5 rounded border border-gray-100">
                                  {topicResources.length} {topicResources.length === 1 ? 'Resource' : 'Resources'}
                                </span>
                              </div>
                            </div>

                            {/* TOPIC RESOURCES TABLE */}
                            {isTopicExpanded && hasResources && (
                              <div className="pl-6 sm:pl-10 pr-3 sm:pr-4 py-2 bg-slate-50/20 border-t border-b border-gray-100/50">
                                {/* Table Header (Desktop Only) */}
                                <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-2 text-[10px] font-black text-gray-400 uppercase tracking-wider border-b border-gray-200/50">
                                  <div className="col-span-2">Type</div>
                                  <div className="col-span-5">Resource Title</div>
                                  <div className="col-span-2">Duration / Size</div>
                                  <div className="col-span-2">Progress</div>
                                  <div className="col-span-1 text-right">Action</div>
                                </div>

                                {/* Table Rows */}
                                <div className="flex flex-col">
                                  {topicResources.map((res: any) => {
                                    const { icon, label, colorClass } = getResourceIconAndLabel(res.type, res.url);
                                    const actionText = getResourceAction(res);
                                    const isCompleted = res.status === 'completed';
                                    const isInProgress = res.status === 'in-progress';
                                    
                                    const progressColorClass = isCompleted 
                                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-100/50' 
                                      : isInProgress 
                                      ? 'bg-amber-50 text-amber-600 border border-amber-100/50' 
                                      : 'bg-gray-50 text-gray-500 border border-gray-100';

                                    const displayTitle = res.title.startsWith(`${unit.name}: `) 
                                      ? res.title.substring(res.title.indexOf(': ') + 2) 
                                      : res.title;

                                    return (
                                      <div 
                                        key={res.id}
                                        onClick={() => onSelectResource(res)}
                                        className="group cursor-pointer hover:bg-white border-b border-gray-100/60 last:border-0 transition-all duration-200"
                                      >
                                        {/* Desktop View */}
                                        <div className="hidden md:grid grid-cols-12 gap-4 items-center px-4 py-2.5 text-xs">
                                          {/* Type Column */}
                                          <div className="col-span-2 flex items-center gap-2">
                                            {icon}
                                            <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded ${colorClass}`}>
                                              {label}
                                            </span>
                                          </div>

                                          {/* Title Column */}
                                          <div className="col-span-5 min-w-0 pr-4">
                                            <span className="font-extrabold text-gray-800 truncate block group-hover:text-emerald-700 transition-colors" title={displayTitle}>
                                              {displayTitle}
                                            </span>
                                            {res.description && (
                                              <span className="text-[10px] text-gray-400 font-medium truncate block" title={res.description}>
                                                {res.description}
                                              </span>
                                            )}
                                          </div>

                                          {/* Duration / Size Column */}
                                          <div className="col-span-2 text-gray-500 font-mono font-semibold">
                                            {res.duration || res.fileSize || '—'}
                                          </div>

                                          {/* Progress Column */}
                                          <div className="col-span-2">
                                            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${progressColorClass}`}>
                                              {res.status.replace('-', ' ')}
                                            </span>
                                          </div>

                                          {/* Action Column */}
                                          <div className="col-span-1 text-right">
                                            <button className="text-[10px] font-black text-[#8B1E3F] hover:underline flex items-center gap-0.5 ml-auto">
                                              {actionText} <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                                            </button>
                                          </div>
                                        </div>

                                        {/* Mobile View */}
                                        <div className="md:hidden flex flex-col gap-2 p-3">
                                          <div className="flex justify-between items-start gap-2">
                                            <div className="flex items-center gap-1.5 min-w-0">
                                              {icon}
                                              <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${colorClass} shrink-0`}>
                                                {label}
                                              </span>
                                              <span className="text-xs font-extrabold text-gray-800 truncate" title={displayTitle}>
                                                {displayTitle}
                                              </span>
                                            </div>
                                            <span className="text-[10px] font-semibold text-gray-400 font-mono shrink-0">
                                              {res.duration || res.fileSize || '—'}
                                            </span>
                                          </div>
                                          <div className="flex justify-between items-center mt-1">
                                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${progressColorClass}`}>
                                              {res.status.replace('-', ' ')}
                                            </span>
                                            <button className="text-[10px] font-extrabold text-[#8B1E3F] flex items-center gap-0.5">
                                              {actionText} <ChevronRight className="w-3 h-3" />
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
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

      </div>
    </div>
  );
}
