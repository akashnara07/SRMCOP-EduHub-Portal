import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, Clock, MapPin, ChevronLeft, ChevronRight, 
  Plus, Upload, FileSpreadsheet, FileText, Printer, Trash2, Edit2, 
  Search, Filter, CheckCircle2, AlertCircle, FileUp, Sparkles, 
  Download, ArrowRight, Save, X, CalendarDays, RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import * as XLSX from 'xlsx';
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, HeadingLevel, AlignmentType } from 'docx';

import GlassCard from './GlassCard';
import { 
  saveCalendarEventToFirestore, 
  saveCalendarEventsBatchToFirestore, 
  getCalendarEventsFromFirestore, 
  deleteCalendarEventFromFirestore,
  generateDeterministicEventId
} from '../lib/firebase';

interface CalendarEvent {
  id?: string;
  academicYear: string;
  programme: string;
  regulation: string;
  semester: string;
  startDate: string;
  endDate: string;
  title: string;
  description: string;
  category: string;
  workingDay: string;
  holiday: string;
  applicableTo: string;
  colour?: string;
  status: string;
  remarks: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
  
  // Sessional/CIA Schedule specific fields
  year?: string;
  examCategory?: string;
  examType?: 'Theory' | 'Practical';
  applicableSemesters?: string[];
  applicableYears?: string[];
}

interface CalendarDisplayEvent {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  category: string;
  source: 'institutional' | 'examination' | 'holiday';
  programme?: string;
  semesterOrYear?: string;
  rawEvent?: CalendarEvent;
}

export interface ExamSchedule {
  programme: 'B.Pharm' | 'Pharm.D';
  semesterOrYear: string;
  start: string;
  end: string;
  sessionalI: { practical: string; theory: string };
  sessionalII: { practical: string; theory: string };
  sessionalIII?: { practical: string; theory: string };
  universityExam: { practical: string; theory: string };
}

export const CANONICAL_SCHEDULES: ExamSchedule[] = [
  // B.Pharm Semester I
  {
    programme: 'B.Pharm',
    semesterOrYear: 'Semester I',
    start: '2026-09-02',
    end: '2027-02-17',
    sessionalI: { practical: '2026-11-02', theory: '2026-11-10' },
    sessionalII: { practical: '2027-01-05', theory: '2027-01-18' },
    universityExam: { practical: '2027-02-01', theory: '2027-02-08' }
  },
  // B.Pharm Semesters III, V, VII
  ...['Semester III', 'Semester V', 'Semester VII'].map(sem => ({
    programme: 'B.Pharm' as const,
    semesterOrYear: sem,
    start: '2026-06-15',
    end: '2026-11-13',
    sessionalI: { practical: '2026-08-03', theory: '2026-08-10' },
    sessionalII: { practical: '2026-10-05', theory: '2026-10-12' },
    universityExam: { practical: '2026-10-26', theory: '2026-11-02' }
  })),
  // B.Pharm Semester II
  {
    programme: 'B.Pharm',
    semesterOrYear: 'Semester II',
    start: '2027-03-01',
    end: '2027-08-20',
    sessionalI: { practical: '2027-04-29', theory: '2027-05-07' },
    sessionalII: { practical: '2027-07-12', theory: '2027-07-20' },
    universityExam: { practical: '2027-08-02', theory: '2027-08-09' }
  },
  // B.Pharm Semesters IV, VI, VIII
  ...['Semester IV', 'Semester VI', 'Semester VIII'].map(sem => ({
    programme: 'B.Pharm' as const,
    semesterOrYear: sem,
    start: '2026-11-16',
    end: '2027-05-07',
    sessionalI: { practical: '2027-01-18', theory: '2027-01-25' },
    sessionalII: { practical: '2027-03-22', theory: '2027-03-29' },
    universityExam: { practical: '2027-04-19', theory: '2027-04-26' }
  })),
  // Pharm.D Year I
  {
    programme: 'Pharm.D',
    semesterOrYear: 'Year I',
    start: '2026-09-02',
    end: '2027-08-27',
    sessionalI: { practical: '2026-11-30', theory: '2026-12-07' },
    sessionalII: { practical: '2027-03-08', theory: '2027-03-17' },
    sessionalIII: { practical: '2027-07-12', theory: '2027-07-20' },
    universityExam: { practical: '2027-08-23', theory: '2027-08-09' }
  },
  // Pharm.D Years II, III, IV, V
  ...['Year II', 'Year III', 'Year IV', 'Year V'].map(yr => ({
    programme: 'Pharm.D' as const,
    semesterOrYear: yr,
    start: '2026-06-15',
    end: '2027-05-07',
    sessionalI: { practical: '2026-08-31', theory: '2026-09-07' },
    sessionalII: { practical: '2026-11-30', theory: '2026-12-07' },
    sessionalIII: { practical: '2027-03-08', theory: '2027-03-15' },
    universityExam: { practical: '2027-04-19', theory: '2027-05-03' }
  }))
];

interface AcademicCalendarModuleProps {
  role: 'Admin' | 'Faculty' | 'Student';
}

const PROGRAMMES = ['Institution', 'B.Pharm', 'Pharm.D', 'M.Pharm'];

const REGULATION_MAP: Record<string, string[]> = {
  'Institution': ['Institution'],
  'B.Pharm': ['PCI 2017', 'PCI 2026'],
  'Pharm.D': ['PCI 2008'],
  'M.Pharm': ['PCI 2017']
};

const ACADEMIC_YEARS = ['2024-2025', '2025-2026', '2026-2027'];

const SEMESTERS = ['All', 'Semester I', 'Semester II', 'Semester III', 'Semester IV', 'Semester V', 'Semester VI', 'Semester VII', 'Semester VIII'];

const CATEGORIES = [
  'Working Day', 'Holiday', 'CIA / Sessional Examination', 'University Examination',
  'Practical Examination', 'Workshop', 'FDP', 'Seminar', 'Conference', 'Guest Lecture',
  'Orientation', 'Academic Milestone', 'Vacation', 'General Academic Event'
];

const MONTHS = [
  { label: 'All Months', value: '' },
  { label: 'January', value: '01' },
  { label: 'February', value: '02' },
  { label: 'March', value: '03' },
  { label: 'April', value: '04' },
  { label: 'May', value: '05' },
  { label: 'June', value: '06' },
  { label: 'July', value: '07' },
  { label: 'August', value: '08' },
  { label: 'September', value: '09' },
  { label: 'October', value: '10' },
  { label: 'November', value: '11' },
  { label: 'December', value: '12' }
];

function getNormalizedTitle(title: string): string {
  if (!title) return '';
  let t = title.toLowerCase().trim();
  
  // Replace symbols/punctuation with spaces or standards
  t = t.replace(/&/g, 'and');
  t = t.replace(/[\(\)\-\:\,\.\/]/g, ' '); // replace common separators with spaces
  
  // Normalize specific words
  t = t.replace(/\bfaculty development programmes?\b/g, 'fdp');
  t = t.replace(/\bfdp s\b/g, 'fdp');
  t = t.replace(/\bfdps\b/g, 'fdp');
  t = t.replace(/\bprogrammes?\b/g, 'program');
  t = t.replace(/\bexaminations?\b/g, 'exam');
  t = t.replace(/\bcontinuous internal assessments?\b/g, 'cia');
  
  // Collapse spaces
  t = t.replace(/\s+/g, ' ');
  
  // Deduplicate consecutive identical words (e.g. "fdp fdp" to "fdp")
  const words = t.split(' ');
  const uniqueWords: string[] = [];
  words.forEach(w => {
    if (uniqueWords.length === 0 || uniqueWords[uniqueWords.length - 1] !== w) {
      uniqueWords.push(w);
    }
  });
  t = uniqueWords.join(' ');

  return t.trim();
}

function getSemanticEventKey(evt: CalendarEvent): string {
  const title = getNormalizedTitle(evt.title);
  const start = (evt.startDate || '').trim();
  const end = (evt.endDate || evt.startDate || '').trim();
  
  // Normalize category: group "fdp" and "workshop" together
  let cat = (evt.category || '').toLowerCase().trim();
  if (cat === 'fdp' || cat === 'workshop') {
    cat = 'fdp-workshop';
  }
  
  // Normalize programme
  let prog = (evt.programme || '').toLowerCase().trim();
  if (prog === 'institution' || prog === 'all' || prog === 'all programmes' || prog === 'all students') {
    prog = 'all';
  }
  
  // Normalize semester
  let sem = (evt.semester || '').toLowerCase().trim();
  if (sem === 'all' || sem === 'all semesters') {
    sem = 'all';
  }

  return `${title}|${start}|${end}|${cat}|${prog}|${sem}`;
}

function formatEventDateRange(startDateStr: string, endDateStr: string): string {
  if (!startDateStr) return '';
  if (!endDateStr || endDateStr === startDateStr) {
    return new Date(startDateStr).toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
  }
  
  const startD = new Date(startDateStr);
  const endD = new Date(endDateStr);
  
  if (startD.getFullYear() === endD.getFullYear() && startD.getMonth() === endD.getMonth()) {
    // Same month and year, e.g., "Jul 20–24"
    const monthStr = startD.toLocaleDateString('en-US', { month: 'short' });
    return `${monthStr} ${startD.getDate()}–${endD.getDate()}`;
  } else if (startD.getFullYear() === endD.getFullYear()) {
    // Different months, same year, e.g., "Jul 30 – Aug 2"
    const startMonthStr = startD.toLocaleDateString('en-US', { month: 'short' });
    const endMonthStr = endD.toLocaleDateString('en-US', { month: 'short' });
    return `${startMonthStr} ${startD.getDate()} – ${endMonthStr} ${endD.getDate()}`;
  } else {
    // Different years
    const startStr = startD.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    const endStr = endD.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    return `${startStr} – ${endStr}`;
  }
}

export default function AcademicCalendarModule({ role }: AcademicCalendarModuleProps) {
  // Master state
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const isImportingRef = React.useRef(false);

  // Range Selector state
  const [selectedRange, setSelectedRange] = useState<'Jul-Dec-2026' | 'Jan-Aug-2027'>('Jul-Dec-2026');
  const [selectedMetricsProg, setSelectedMetricsProg] = useState<'B.Pharm' | 'Pharm.D'>('B.Pharm');

  // Filters State
  const [selectedProg, setSelectedProg] = useState('B.Pharm');
  const [selectedReg, setSelectedReg] = useState('PCI 2017');
  const [selectedYear, setSelectedYear] = useState('2026-2027');
  const [selectedSem, setSelectedSem] = useState('Semester V');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Sessional / CIA Redesign States
  const [sessionalTab, setSessionalTab] = useState<'B.Pharm' | 'Pharm.D'>('B.Pharm');
  const [expandedSection, setExpandedSection] = useState<string | null>(null);



  // Active Calendar Grid month
  const [gridMonth, setGridMonth] = useState<number>(6); // July (0-indexed base: 6 = July)
  const [gridYear, setGridYear] = useState<number>(2026);

  // Selected date events panel
  const [selectedGridDay, setSelectedGridDay] = useState<string>('2026-07-15');

  // Modal controls
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);

  // Form State
  const [formEvent, setFormEvent] = useState<Partial<CalendarEvent>>({
    academicYear: '2026-2027',
    programme: 'B.Pharm',
    regulation: 'PCI 2017',
    semester: 'Semester V',
    startDate: '',
    endDate: '',
    title: '',
    description: '',
    category: 'Working Day',
    workingDay: 'Yes',
    holiday: 'No',
    applicableTo: 'All Semester V B.Pharm students',
    status: 'Published',
    remarks: ''
  });

  // Import process states
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const [extractedPreview, setExtractedPreview] = useState<CalendarEvent[]>([]);
  const [importStep, setImportStep] = useState<'idle' | 'processing' | 'preview'>('idle');

  // Load events
  const loadData = async () => {
    setLoading(true);
    try {
      let result = await getCalendarEventsFromFirestore();
      
      // Group loaded Firestore events by deterministic ID to detect and prune duplicates at the source
      const groups: Record<string, CalendarEvent[]> = {};
      result.forEach(e => {
        const detId = generateDeterministicEventId(e);
        if (!groups[detId]) {
          groups[detId] = [];
        }
        groups[detId].push(e);
      });

      const cleanedResult: CalendarEvent[] = [];
      const duplicateIdsToDelete: string[] = [];
      const eventsToUpsert: CalendarEvent[] = [];

      for (const detId in groups) {
        const listInGroup = groups[detId];
        if (listInGroup.length === 1) {
          cleanedResult.push(listInGroup[0]);
        } else {
          // Prioritize the one whose .id is exactly the deterministic ID
          let mainEvent = listInGroup.find(e => e.id === detId);
          if (!mainEvent) {
            mainEvent = { ...listInGroup[0], id: detId };
            eventsToUpsert.push(mainEvent);
          }
          cleanedResult.push(mainEvent);

          // Identify duplicate records with different IDs to delete from Firestore
          listInGroup.forEach(e => {
            if (e.id && e.id !== mainEvent!.id) {
              duplicateIdsToDelete.push(e.id);
            }
          });
        }
      }

      if (duplicateIdsToDelete.length > 0) {
        console.log(`Deduplicating Firestore: Deleting ${duplicateIdsToDelete.length} legacy/duplicate calendar records...`);
        for (const idToDelete of duplicateIdsToDelete) {
          await deleteCalendarEventFromFirestore(idToDelete);
        }
      }

      if (eventsToUpsert.length > 0) {
        console.log(`Deduplicating Firestore: Migrating ${eventsToUpsert.length} records to use deterministic IDs...`);
        await saveCalendarEventsBatchToFirestore(eventsToUpsert);
      }

      // If changes were made to Firestore, re-fetch to ensure sync
      if (duplicateIdsToDelete.length > 0 || eventsToUpsert.length > 0) {
        result = await getCalendarEventsFromFirestore();
      } else {
        result = cleanedResult;
      }

      // Keep live database fully correct and up-to-date with our new authoritative exam datasets
      const correctExams = getCorrectExamEvents();
      const missingOrOutdated = correctExams.filter(exam => {
        const id = generateDeterministicEventId(exam);
        const existing = result.find(e => e.id === id);
        if (!existing) return true;
        return (
          existing.startDate !== exam.startDate || 
          existing.endDate !== exam.endDate || 
          existing.examCategory !== exam.examCategory || 
          existing.examType !== exam.examType
        );
      });

      if (missingOrOutdated.length > 0) {
        console.log(`Synchronizing ${missingOrOutdated.length} authoritative exam events to live Firestore...`);
        await saveCalendarEventsBatchToFirestore(missingOrOutdated);
        result = await getCalendarEventsFromFirestore();
      }
      
      const isProduction = import.meta.env.PROD;

      if (result.length === 0) {
        if (!isProduction) {
          console.log("Development mode: No academic calendar found in Firestore. Loading mock data purely in-memory.");
          // Isolate it clearly as development-only data and ensure it cannot silently populate Firestore
          result = getSeededEvents();
        } else {
          console.log("Production mode: Academic calendar in Firestore is empty. Not seeding mock data.");
        }
      }

      // Perform one final in-memory deduplication pass just to be absolutely bulletproof
      const finalSeen = new Set<string>();
      const finalUniqueEvents: CalendarEvent[] = [];
      result.forEach(e => {
        const key = getSemanticEventKey(e);
        if (!finalSeen.has(key)) {
          finalSeen.add(key);
          finalUniqueEvents.push(e);
        }
      });

      setEvents(finalUniqueEvents);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Update regulations list dynamically
  useEffect(() => {
    const regs = REGULATION_MAP[selectedProg] || [];
    if (!regs.includes(selectedReg)) {
      setSelectedReg(regs[0] || '');
    }
    setFormEvent(prev => ({ ...prev, programme: selectedProg, regulation: regs[0] || '' }));
  }, [selectedProg]);

  // Seeding trigger
  const handleForceReseed = async () => {
    if (import.meta.env.PROD) {
      console.warn("Force Reseed is disabled in production.");
      return;
    }
    setSyncing(true);
    try {
      const defaults = getSeededEvents();
      // First, delete current events from Firestore if any
      for (const item of events) {
        if (item.id) {
          await deleteCalendarEventFromFirestore(item.id);
        }
      }
      // Load defaults purely in-memory for development/demo purposes.
      // Do not save mock 2027 events to Firestore.
      setEvents(defaults);
    } catch (err) {
      console.error(err);
    } finally {
      setSyncing(false);
    }
  };

  // Helper to format Date to DD MMM YYYY (e.g., 22 Jul 2026)
  const formatDateToDMY = (dateStr: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parts[0];
      const monthIndex = parseInt(parts[1], 10) - 1;
      const day = parts[2];
      const standardMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthName = standardMonths[monthIndex] || parts[1];
      return `${day.padStart(2, '0')} ${monthName} ${year}`;
    }
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = String(d.getDate()).padStart(2, '0');
    const standardMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = standardMonths[d.getMonth()];
    const year = d.getFullYear();
    return `${day} ${month} ${year}`;
  };

  const formatEventPeriodToDMY = (start: string, end?: string) => {
    const s = formatDateToDMY(start);
    if (!end || start === end) return s;
    const e = formatDateToDMY(end);
    return `${s} → ${e}`;
  };

  // Classification Helpers
  const isHolidayEvent = (evt: CalendarEvent) => {
    const category = (evt.category || '').toLowerCase();
    const title = (evt.title || '').toLowerCase();
    const isH = evt.holiday === 'Yes';
    return category.includes('holiday') || title.includes('holiday') || isH;
  };

  const isExamEvent = (evt: CalendarEvent) => {
    if (evt.examCategory) return true;
    if (isMilestoneEvent(evt)) return false;
    const category = (evt.category || '').toLowerCase();
    const title = (evt.title || '').toLowerCase();
    return (
      category.includes('exam') || 
      category.includes('cia') || 
      category.includes('sessional') ||
      title.includes('exam') ||
      title.includes('cia') ||
      title.includes('sessional') ||
      title.includes('test')
    );
  };

  const isBPharm = (evt: CalendarEvent) => {
    const prog = (evt.programme || '').toLowerCase().replace(/\s+/g, '').replace(/\./g, '');
    return prog === 'bpharm';
  };

  const isPharmD = (evt: CalendarEvent) => {
    const prog = (evt.programme || '').toLowerCase().replace(/\s+/g, '').replace(/\./g, '');
    return prog === 'pharmd';
  };

  const SEM_YEAR_ORDER = [
    'Semester I', 'Semester II', 'Semester III', 'Semester IV',
    'Semester V', 'Semester VI', 'Semester VII', 'Semester VIII',
    'Year I', 'Year II', 'Year III', 'Year IV', 'Year V'
  ];

  const normalizeSemester = (s: string): string => {
    const clean = s.toUpperCase().replace(/\s+/g, '').replace(/[^A-Z0-9]/g, '');
    if (clean.includes('SEMESTERVIII') || clean.includes('SEMVIII') || clean === 'VIII' || clean.includes('SEM8') || clean.includes('SEMESTER8')) return 'VIII';
    if (clean.includes('SEMESTERVII') || clean.includes('SEMVII') || clean === 'VII' || clean.includes('SEM7') || clean.includes('SEMESTER7')) return 'VII';
    if (clean.includes('SEMESTERVI') || clean.includes('SEMVI') || clean === 'VI' || clean.includes('SEM6') || clean.includes('SEMESTER6')) return 'VI';
    if (clean.includes('SEMESTERV') || clean.includes('SEMV') || clean === 'V' || clean.includes('SEM5') || clean.includes('SEMESTER5')) return 'V';
    if (clean.includes('SEMESTERIV') || clean.includes('SEMIV') || clean === 'IV' || clean.includes('SEM4') || clean.includes('SEMESTER4')) return 'IV';
    if (clean.includes('SEMESTERIII') || clean.includes('SEMIII') || clean === 'III' || clean.includes('SEM3') || clean.includes('SEMESTER3')) return 'III';
    if (clean.includes('SEMESTERII') || clean.includes('SEMII') || clean === 'II' || clean.includes('SEM2') || clean.includes('SEMESTER2')) return 'II';
    if (clean.includes('SEMESTERI') || clean.includes('SEMI') || clean === 'I' || clean.includes('SEM1') || clean.includes('SEMESTER1')) return 'I';
    return s;
  };

  const normalizeYear = (y: string): string => {
    const clean = y.toUpperCase().replace(/\s+/g, '').replace(/[^A-Z0-9]/g, '');
    if (clean.includes('YEARV') || clean.includes('YRV') || clean === 'V' || clean.includes('YR5') || clean.includes('YEAR5')) return 'V';
    if (clean.includes('YEARIV') || clean.includes('YRIV') || clean === 'IV' || clean.includes('YR4') || clean.includes('YEAR4')) return 'IV';
    if (clean.includes('YEARIII') || clean.includes('YRIII') || clean === 'III' || clean.includes('YR3') || clean.includes('YEAR3')) return 'III';
    if (clean.includes('YEARII') || clean.includes('YRII') || clean === 'II' || clean.includes('YR2') || clean.includes('YEAR2')) return 'II';
    if (clean.includes('YEARI') || clean.includes('YRI') || clean === 'I' || clean.includes('YR1') || clean.includes('YEAR1')) return 'I';
    return y;
  };

  const eventAppliesToSection = (evt: CalendarEvent, sectionName: string, prog: 'B.Pharm' | 'Pharm.D'): boolean => {
    const titleLower = (evt.title || '').toLowerCase();
    const descLower = (evt.description || '').toLowerCase();

    if (prog === 'B.Pharm') {
      const targetSem = normalizeSemester(sectionName);
      if (evt.applicableSemesters && Array.isArray(evt.applicableSemesters)) {
        return evt.applicableSemesters.some(sem => normalizeSemester(sem) === targetSem);
      }
      // Fallbacks
      if (normalizeSemester(evt.semester || '') === targetSem) return true;
      if ((evt.semester || '').toLowerCase() === 'all') return true;
      if (titleLower.includes(`sem ${targetSem.toLowerCase()}`) || 
          titleLower.includes(`semester ${targetSem.toLowerCase()}`) ||
          descLower.includes(`sem ${targetSem.toLowerCase()}`) ||
          descLower.includes(`semester ${targetSem.toLowerCase()}`)) {
        return true;
      }
    } else {
      const targetYr = normalizeYear(sectionName);
      if (evt.applicableYears && Array.isArray(evt.applicableYears)) {
        return evt.applicableYears.some(yr => normalizeYear(yr) === targetYr);
      }
      // Fallbacks
      if (normalizeYear(evt.semester || '') === targetYr || normalizeYear(evt.year || '') === targetYr) return true;
      if ((evt.semester || '').toLowerCase() === 'all') return true;
      if (titleLower.includes(`yr ${targetYr.toLowerCase()}`) || 
          titleLower.includes(`year ${targetYr.toLowerCase()}`) ||
          titleLower.includes(`year-${targetYr.toLowerCase()}`) ||
          descLower.includes(`yr ${targetYr.toLowerCase()}`) ||
          descLower.includes(`year ${targetYr.toLowerCase()}`) ||
          descLower.includes(`year-${targetYr.toLowerCase()}`)) {
        return true;
      }
    }
    return false;
  };

  const getSemYearSortIndex = (name: string) => {
    const normalized = name.trim();
    const idx = SEM_YEAR_ORDER.findIndex(o => o.toLowerCase() === normalized.toLowerCase());
    return idx === -1 ? 999 : idx;
  };

  const getExamSubCategory = (evt: CalendarEvent, prog: 'B.Pharm' | 'Pharm.D'): string | null => {
    if (evt.examCategory) return evt.examCategory;
    const title = (evt.title || '').toLowerCase();
    const category = (evt.category || '').toLowerCase();
    
    const isFirst = title.includes('cia i') || title.includes('cia 1') || title.includes('sessional i') || title.includes('sessional 1') || title.includes('1st sessional') || title.includes('first sessional');
    const isSecond = title.includes('cia ii') || title.includes('cia 2') || title.includes('sessional ii') || title.includes('sessional 2') || title.includes('2nd sessional') || title.includes('second sessional');
    const isThird = title.includes('cia iii') || title.includes('cia 3') || title.includes('sessional iii') || title.includes('sessional 3') || title.includes('3rd sessional') || title.includes('third sessional');
    
    if (prog === 'B.Pharm') {
      if (isFirst) return 'I Sessional / CIA';
      if (isSecond) return 'II Sessional / CIA';
      const isSemesterEx = title.includes('university') || title.includes('semester exam') || title.includes('end-semester') || title.includes('semester closure') || category.includes('university') || category.includes('end-semester');
      if (isSemesterEx) return 'Semester Examination';
    } else {
      if (isFirst) return 'I Sessional / CIA';
      if (isSecond) return 'II Sessional / CIA';
      if (isThird) return 'III Sessional / CIA';
      const isUnivEx = title.includes('university') || title.includes('annual university') || category.includes('university');
      if (isUnivEx) return 'University Examination';
    }
    return null;
  };

  const isCurricularEvent = (evt: CalendarEvent) => {
    const category = (evt.category || '').toLowerCase();
    const title = (evt.title || '').toLowerCase();
    return (
      ['workshop', 'fdp', 'seminar', 'conference', 'guest lecture', 'orientation', 'general academic event'].includes(category) ||
      title.includes('fdp') ||
      title.includes('faculty development') ||
      title.includes('workshop') ||
      title.includes('conference') ||
      title.includes('guest lecture') ||
      title.includes('alumni lecture') ||
      title.includes('seminar') ||
      title.includes('orientation') ||
      title.includes('skill development') ||
      title.includes('awareness') ||
      title.includes('research')
    );
  };

  const isMilestoneEvent = (evt: CalendarEvent) => {
    const category = (evt.category || '').toLowerCase();
    const title = (evt.title || '').toLowerCase();
    return (
      ['academic milestone', 'vacation'].includes(category) ||
      title.includes('commencement') ||
      title.includes('last working day') ||
      title.includes('semester closure') ||
      title.includes('academic year closure') ||
      title.includes('registration') ||
      title.includes('result publication') ||
      title.includes('vacation') ||
      title.includes('semester break') ||
      title.includes('milestone') ||
      title.includes('examination commencement') ||
      (title.includes('university examination') && !category.includes('cia') && !title.includes('sessional'))
    );
  };

  // Filter events dynamically based on selected period and deduplicate them using stable unique identity
  const filteredEvents = (() => {
    const rawFiltered = events.filter(evt => {
      const start = evt.startDate;
      const end = evt.endDate || evt.startDate;
      if (selectedRange === 'Jul-Dec-2026') {
        return start <= '2026-12-31' && end >= '2026-07-01';
      } else {
        return start <= '2027-08-31' && end >= '2027-01-01';
      }
    });

    const seen = new Set<string>();
    const uniq: CalendarEvent[] = [];
    rawFiltered.forEach(evt => {
      const eventIdentity = getSemanticEventKey(evt);
      if (!seen.has(eventIdentity)) {
        seen.add(eventIdentity);
        uniq.push(evt);
      }
    });

    console.log(`[Trace] filteredEvents calculated for period: ${selectedRange}. Total raw events matching range: ${rawFiltered.length}, Semantically unique events: ${uniq.length}`);
    return uniq;
  })();

  // Helper colors for events
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Working Day':
        return { bg: 'bg-green-100 text-green-800 border-green-200/50', hex: '#16a34a', text: 'green' };
      case 'Holiday':
        return { bg: 'bg-red-100 text-red-800 border-red-200/50', hex: '#dc2626', text: 'red' };
      case 'CIA / Sessional Examination':
      case 'University Examination':
      case 'Practical Examination':
        return { bg: 'bg-orange-100 text-orange-800 border-orange-200/50', hex: '#f97316', text: 'orange' };
      case 'Workshop':
      case 'FDP':
      case 'Seminar':
      case 'Conference':
      case 'Guest Lecture':
      case 'Orientation':
        return { bg: 'bg-blue-100 text-blue-800 border-blue-200/50', hex: '#2563eb', text: 'blue' };
      case 'Academic Milestone':
        return { bg: 'bg-purple-100 text-purple-800 border-purple-200/50', hex: '#9333ea', text: 'purple' };
      case 'Vacation':
        return { bg: 'bg-slate-200 text-slate-800 border-slate-300', hex: '#475569', text: 'grey' };
      default:
        return { bg: 'bg-indigo-100 text-indigo-800 border-indigo-200/50', hex: '#4f46e5', text: 'indigo' };
    }
  };

  // Calculate Teaching Period boundary based on B.Pharm / Pharm.D active period
  const getTeachingPeriodRange = (prog: 'B.Pharm' | 'Pharm.D', range: 'Jul-Dec-2026' | 'Jan-Aug-2027', allEvents: CalendarEvent[]) => {
    if (prog === 'B.Pharm') {
      if (range === 'Jul-Dec-2026') {
        const commencement = allEvents.find(e => e.title.includes("Commencement") && e.programme.includes("B.Pharm") && e.startDate >= "2026-06-01" && e.startDate <= "2026-07-31")?.startDate || "2026-06-15";
        const examStart = allEvents.find(e => e.title.includes("University Practical End-Semester") && e.programme.includes("B.Pharm") && e.startDate >= "2026-10-01")?.startDate || "2026-10-26";
        const endD = new Date(examStart);
        endD.setDate(endD.getDate() - 1);
        const endStr = endD.toISOString().split('T')[0];
        return { start: commencement, end: endStr };
      } else {
        const commencement = allEvents.find(e => e.title.includes("Commencement") && e.programme.includes("B.Pharm") && e.startDate >= "2026-12-01" && e.startDate <= "2027-01-31")?.startDate || "2026-12-14";
        const examStart = allEvents.find(e => e.title.includes("University Practical End-Semester") && e.programme.includes("B.Pharm") && e.startDate >= "2027-05-01")?.startDate || "2027-05-10";
        const endD = new Date(examStart);
        endD.setDate(endD.getDate() - 1);
        const endStr = endD.toISOString().split('T')[0];
        return { start: commencement, end: endStr };
      }
    } else {
      const commencement = allEvents.find(e => e.title.includes("Commencement") && e.programme.includes("Pharm.D"))?.startDate || "2026-06-15";
      const examStart = allEvents.find(e => e.category.includes("Examination") && e.programme.includes("Pharm.D") && e.startDate >= "2027-05-01")?.startDate || "2027-05-17";
      const endD = new Date(examStart);
      endD.setDate(endD.getDate() - 1);
      const endStr = endD.toISOString().split('T')[0];
      return { start: commencement, end: endStr };
    }
  };

  const getWorkingDaysInRange = (startStr: string, endStr: string, allEvents: CalendarEvent[]) => {
    const start = new Date(startStr);
    const end = new Date(endStr);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
    
    let count = 0;
    const current = new Date(start);
    const holidayDates = new Set<string>();
    
    allEvents.forEach(evt => {
      if (isHolidayEvent(evt)) {
        let curHoliday = new Date(evt.startDate);
        const holidayEnd = new Date(evt.endDate || evt.startDate);
        while (curHoliday <= holidayEnd) {
          const dateStr = curHoliday.toISOString().split('T')[0];
          holidayDates.add(dateStr);
          curHoliday.setDate(curHoliday.getDate() + 1);
        }
      }
    });
    
    while (current <= end) {
      const dateStr = current.toISOString().split('T')[0];
      const dayOfWeek = current.getDay();
      const isSunday = dayOfWeek === 0;
      if (!isSunday && !holidayDates.has(dateStr)) {
        count++;
      }
      current.setDate(current.getDate() + 1);
    }
    return count;
  };

  const getExamDaysCount = (allEvents: CalendarEvent[], startStr: string, endStr: string) => {
    let count = 0;
    allEvents.forEach(evt => {
      if (isExamEvent(evt) && evt.startDate >= startStr && evt.startDate <= endStr) {
        const start = new Date(evt.startDate);
        const end = new Date(evt.endDate || evt.startDate);
        if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
          const diff = end.getTime() - start.getTime();
          const days = Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
          count += days;
        }
      }
    });
    return count;
  };

  const getRemainingWorkingDays = (startStr: string, endStr: string, allEvents: CalendarEvent[]) => {
    const todayStr = '2026-07-14';
    if (todayStr > endStr) return 0;
    const baseStart = todayStr > startStr ? todayStr : startStr;
    return getWorkingDaysInRange(baseStart, endStr, allEvents);
  };

  const teachingRange = getTeachingPeriodRange(selectedMetricsProg, selectedRange, events);
  const teachingPeriodEvents = events.filter(e => e.startDate >= teachingRange.start && e.startDate <= teachingRange.end);

  // Recalculated Metric Values
  const workingDaysCount = getWorkingDaysInRange(teachingRange.start, teachingRange.end, events);
  const holidaysCount = teachingPeriodEvents.filter(isHolidayEvent).length;
  const examsCount = getExamDaysCount(events, teachingRange.start, teachingRange.end);
  const totalEventsCount = teachingPeriodEvents.length;
  const remainingDays = getRemainingWorkingDays(teachingRange.start, teachingRange.end, events);

  // Helper to dynamically calculate active academic year duration from the master calendar dataset
  const getAcademicYearRange = () => {
    if (events.length === 0) return "July 2026 – August 2027";
    const sorted = [...events].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
    const earliest = sorted[0];
    const latest = sorted[sorted.length - 1];
    
    const formatMyDate = (dateStr: string) => {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return "";
      return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    };
    
    const startStr = formatMyDate(earliest.startDate);
    const endStr = formatMyDate(latest.endDate || latest.startDate);
    if (!startStr || !endStr) return "July 2026 – August 2027";
    return `${startStr} – ${endStr}`;
  };

  // Derived exams for Section 2 Table, derived from master dataset matching the selected period range
  const examEvents = filteredEvents.filter(isExamEvent);

  // Handle Event Add / Edit Submit
  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formEvent.title || !formEvent.startDate) {
      alert("Please provide a title and start date.");
      return;
    }

    setSyncing(true);
    try {
      const eventToSave = {
        ...formEvent,
        endDate: formEvent.endDate || formEvent.startDate,
        workingDay: formEvent.category === 'Holiday' ? 'No' : formEvent.workingDay,
        holiday: formEvent.category === 'Holiday' ? 'Yes' : formEvent.holiday,
        updatedAt: new Date().toISOString()
      };

      const result = await saveCalendarEventToFirestore(eventToSave);
      
      if (editingEvent) {
        setEvents(prev => prev.map(evt => evt.id === result.id ? result : evt));
      } else {
        setEvents(prev => [result, ...prev]);
      }
      
      setShowAddModal(false);
      setEditingEvent(null);
    } catch (err) {
      console.error(err);
    } finally {
      setSyncing(false);
    }
  };

  // Delete event
  const handleDeleteEvent = async (id: string) => {
    if (!confirm("Are you sure you want to delete this event?")) return;
    setSyncing(true);
    try {
      await deleteCalendarEventFromFirestore(id);
      setEvents(prev => prev.filter(e => e.id !== id));
    } catch (e) {
      console.error(e);
    } finally {
      setSyncing(false);
    }
  };

  // Open Edit Dialog
  const openEditDialog = (evt: CalendarEvent) => {
    setEditingEvent(evt);
    setFormEvent(evt);
    setShowAddModal(true);
  };

  // Open Add Dialog
  const openAddDialog = () => {
    setEditingEvent(null);
    setFormEvent({
      academicYear: selectedYear,
      programme: selectedProg,
      regulation: selectedReg,
      semester: selectedSem === 'All' ? 'Semester V' : selectedSem,
      startDate: selectedGridDay || '',
      endDate: selectedGridDay || '',
      title: '',
      description: '',
      category: 'Working Day',
      workingDay: 'Yes',
      holiday: 'No',
      applicableTo: `All students under ${selectedProg}`,
      status: 'Published',
      remarks: ''
    });
    setShowAddModal(true);
  };

  // Month navigation
  const handlePrevMonth = () => {
    if (selectedRange === 'Jul-Dec-2026') {
      if (gridYear === 2026 && gridMonth === 6) return; // limit to July 2026
    } else {
      if (gridYear === 2027 && gridMonth === 0) return; // limit to January 2027
    }

    if (gridMonth === 0) {
      setGridMonth(11);
      setGridYear(gridYear - 1);
    } else {
      setGridMonth(gridMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedRange === 'Jul-Dec-2026') {
      if (gridYear === 2026 && gridMonth === 11) return; // limit to December 2026
    } else {
      if (gridYear === 2027 && gridMonth === 7) return; // limit to August 2027
    }

    if (gridMonth === 11) {
      setGridMonth(0);
      setGridYear(gridYear + 1);
    } else {
      setGridMonth(gridMonth + 1);
    }
  };

  // Get Calendar days grid
  const getDaysInGridMonth = () => {
    const firstDayIndex = new Date(gridYear, gridMonth, 1).getDay();
    const totalDays = new Date(gridYear, gridMonth + 1, 0).getDate();
    
    const days = [];
    // Prefix spaces
    for (let i = 0; i < firstDayIndex; i++) {
      days.push(null);
    }
    // Days
    for (let i = 1; i <= totalDays; i++) {
      const dateStr = `${gridYear}-${String(gridMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      days.push({ day: i, date: dateStr });
    }
    return days;
  };

  const calendarGridDays = getDaysInGridMonth();

  // Source 1: Institutional/Curricular Events
  const institutionalEvents = React.useMemo(() => {
    return filteredEvents.filter(e => !isHolidayEvent(e) && !isExamEvent(e));
  }, [filteredEvents]);

  // Source 2: Sessional / Examination Schedule
  const examinationEvents = React.useMemo(() => {
    return filteredEvents.filter(isExamEvent);
  }, [filteredEvents]);

  // Source 3: Scheduled Holidays
  const holidayEvents = React.useMemo(() => {
    return filteredEvents.filter(isHolidayEvent);
  }, [filteredEvents]);

  // Combined calendarEvents list for runtime verification & debugging
  const calendarEvents = React.useMemo(() => {
    const list: CalendarDisplayEvent[] = [
      ...institutionalEvents.map(e => ({
        id: e.id || `${e.title}-${e.startDate}`,
        title: e.title,
        startDate: e.startDate,
        endDate: e.endDate || e.startDate,
        category: e.category,
        source: 'institutional' as const,
        programme: e.programme,
        semesterOrYear: e.semester || e.year,
        rawEvent: e
      })),
      ...examinationEvents.map(e => ({
        id: e.id || `${e.title}-${e.startDate}`,
        title: e.title,
        startDate: e.startDate,
        endDate: e.endDate || e.startDate,
        category: e.category,
        source: 'examination' as const,
        programme: e.programme,
        semesterOrYear: e.semester || e.year,
        rawEvent: e
      })),
      ...holidayEvents.map(e => ({
        id: e.id || `${e.title}-${e.startDate}`,
        title: e.title,
        startDate: e.startDate,
        endDate: e.endDate || e.startDate,
        category: e.category,
        source: 'holiday' as const,
        programme: e.programme,
        semesterOrYear: e.semester || e.year,
        rawEvent: e
      }))
    ];

    // Debug logging as required by the verification section
    console.log("[Trace] Rebuilt calendarEvents list:", list.length);
    console.table(list.map(event => ({
      title: event.title,
      startDate: event.startDate,
      endDate: event.endDate,
      source: event.source
    })));

    return list;
  }, [institutionalEvents, examinationEvents, holidayEvents]);

  // PHASE 4 — BUILD DATE MATCHING FROM SCRATCH
  const getNewCalendarDisplayEventsForDate = (dateStr: string): CalendarDisplayEvent[] => {
    // 1. Find institutional events where: date >= startDate AND date <= endDate
    const instMatched = institutionalEvents.filter(e => {
      const start = e.startDate;
      const end = e.endDate || e.startDate;
      return dateStr >= start && dateStr <= end;
    }).map(e => ({
      id: e.id || `${e.title}-${e.startDate}`,
      title: e.title,
      startDate: e.startDate,
      endDate: e.endDate || e.startDate,
      category: e.category,
      source: 'institutional' as const,
      programme: e.programme,
      semesterOrYear: e.semester || e.year,
      rawEvent: e
    }));

    // 2. Find examination events matching that date
    const examMatched = examinationEvents.filter(e => {
      const start = e.startDate;
      const end = e.endDate || e.startDate;
      return dateStr >= start && dateStr <= end;
    }).map(e => ({
      id: e.id || `${e.title}-${e.startDate}`,
      title: e.title,
      startDate: e.startDate,
      endDate: e.endDate || e.startDate,
      category: e.category,
      source: 'examination' as const,
      programme: e.programme,
      semesterOrYear: e.semester || e.year,
      rawEvent: e
    }));

    // 3. Find holidays matching that date
    const holidayMatched = holidayEvents.filter(e => {
      const start = e.startDate;
      const end = e.endDate || e.startDate;
      return dateStr >= start && dateStr <= end;
    }).map(e => ({
      id: e.id || `${e.title}-${e.startDate}`,
      title: e.title,
      startDate: e.startDate,
      endDate: e.endDate || e.startDate,
      category: e.category,
      source: 'holiday' as const,
      programme: e.programme,
      semesterOrYear: e.semester || e.year,
      rawEvent: e
    }));

    // Combine results for DISPLAY ONLY (avoid semantic duplicates within the same date cell)
    const seenKeys = new Set<string>();
    const combined: CalendarDisplayEvent[] = [];

    [...holidayMatched, ...examMatched, ...instMatched].forEach(e => {
      const normTitle = getNormalizedTitle(e.title);
      // Key contains title, date range, and source to identify logical event
      const key = `${normTitle}|${e.startDate}|${e.endDate}|${e.source}`;
      if (!seenKeys.has(key)) {
        seenKeys.add(key);
        combined.push(e);
      }
    });

    return combined;
  };

  // Next / Current Key Event Cards for Students
  const getUpcomingHighlights = () => {
    const sorted = [...filteredEvents]
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
    
    const nextEvent = sorted.find(e => !isHolidayEvent(e) && !isExamEvent(e) && !isMilestoneEvent(e));
    const nextExam = sorted.find(e => isExamEvent(e));
    const nextHoliday = sorted.find(e => isHolidayEvent(e));

    return { nextEvent, nextExam, nextHoliday };
  };

  const highlights = getUpcomingHighlights();

  // File parsing via Gemini API endpoint
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportStep('processing');
    setUploadProgress("Reading local file...");

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const base64 = (evt.target?.result as string).split(',')[1];
        setUploadProgress("Sending file to AI ERP Extraction Pipeline...");
        
        const response = await fetch("/api/ai/extract", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileBase64: base64,
            fileName: file.name,
            mimeType: file.type || "application/octet-stream"
          })
        });

        const data = await response.json();
        if (data.events && Array.isArray(data.events)) {
          setExtractedPreview(data.events);
          setImportStep('preview');
        } else {
          alert("Could not extract structured data. Please try again or use standard templates.");
          setImportStep('idle');
        }
      } catch (err) {
        console.error(err);
        alert("Error occurred in pipeline processing. Fallback triggered.");
        setImportStep('idle');
      }
    };
    reader.readAsDataURL(file);
  };

  // Save the approved extracted calendar events
  const handleConfirmImport = async () => {
    if (isImportingRef.current) return;
    isImportingRef.current = true;
    setSyncing(true);
    try {
      // Round-trip duplicate check & update / insert logic
      const mergedEvents = [...events];
      const newItemsToSave: CalendarEvent[] = [];

      extractedPreview.forEach(item => {
        // Search criteria: Academic Year, Programme, Regulation, Event Title, Start Date
        const existingIdx = mergedEvents.findIndex(e => 
          e.academicYear === item.academicYear &&
          e.programme === item.programme &&
          e.regulation === item.regulation &&
          e.title === item.title &&
          e.startDate === item.startDate
        );

        if (existingIdx >= 0) {
          // Update item
          mergedEvents[existingIdx] = { ...mergedEvents[existingIdx], ...item, id: mergedEvents[existingIdx].id };
          newItemsToSave.push(mergedEvents[existingIdx]);
        } else {
          // Add as new
          newItemsToSave.push(item);
        }
      });

      // Save in batch
      const savedList = await saveCalendarEventsBatchToFirestore(newItemsToSave);
      
      // Update local state by preserving unaffected ones and loading saved ones
      const unaffected = events.filter(e => !savedList.some(s => s.id === e.id));
      setEvents([...unaffected, ...savedList]);

      setShowImportModal(false);
      setImportStep('idle');
      setExtractedPreview([]);
      alert("Academic Calendar Seeded and Saved successfully! Templates generated on the fly.");
    } catch (err) {
      console.error(err);
    } finally {
      setSyncing(false);
      isImportingRef.current = false;
    }
  };

  // Download Excel template compiled with current events
  const handleDownloadExcel = () => {
    const headers = [
      "S.No", "Academic Year", "Programme", "Regulation", "Semester", 
      "Start Date", "End Date", "Event Title", "Category", 
      "Working Day", "Holiday", "Applicable To", "Description", "Status", "Remarks"
    ];
    const rows = filteredEvents.map((evt, idx) => [
      idx + 1,
      evt.academicYear || "2026-2027",
      evt.programme || "B.Pharm",
      evt.regulation || "PCI 2017",
      evt.semester || "Semester V",
      evt.startDate || "",
      evt.endDate || "",
      evt.title || "",
      evt.category || "Working Day",
      evt.workingDay || "Yes",
      evt.holiday || "No",
      evt.applicableTo || "All students",
      evt.description || "",
      evt.status || "Published",
      evt.remarks || ""
    ]);

    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Academic Calendar");
    XLSX.writeFile(wb, "Academic_Calendar_Template.xlsx");
  };

  // Download Word template compiled with current events
  const handleDownloadWord = async () => {
    await generateWordTemplate(filteredEvents);
  };

  // Custom formatted print
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-[1600px] mx-auto pb-12 print:bg-white print:text-black">
      {/* ----------------- Header Section ----------------- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/40 border border-white/20 p-6 rounded-[28px] shadow-sm backdrop-blur-md shrink-0 print:border-none print:shadow-none print:bg-transparent">
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <h1 className="font-display font-extrabold text-3xl text-gray-900 tracking-tight">Academic Calendar</h1>
            <div className="flex items-center bg-[#8B1E3F]/5 border border-[#8B1E3F]/15 p-1 rounded-full shrink-0 select-none">
              <button
                onClick={() => {
                  setSelectedRange('Jul-Dec-2026');
                  setGridMonth(6); // July
                  setGridYear(2026);
                  setSelectedGridDay('2026-07-15');
                }}
                className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-wider transition-all duration-300 ${
                  selectedRange === 'Jul-Dec-2026'
                    ? 'bg-[#8B1E3F] text-white shadow-md'
                    : 'text-[#8B1E3F] hover:bg-[#8B1E3F]/10'
                }`}
              >
                JUL – DEC 2026
              </button>
              <button
                onClick={() => {
                  setSelectedRange('Jan-Aug-2027');
                  setGridMonth(0); // January
                  setGridYear(2027);
                  setSelectedGridDay('2027-01-01');
                }}
                className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-wider transition-all duration-300 ${
                  selectedRange === 'Jan-Aug-2027'
                    ? 'bg-[#8B1E3F] text-white shadow-md'
                    : 'text-[#8B1E3F] hover:bg-[#8B1E3F]/10'
                }`}
              >
                JAN – AUG 2027
              </button>
            </div>
          </div>
        </div>

        {/* Top Actions Block - Responsive */}
        <div className="flex flex-wrap items-center gap-2 print:hidden select-none">
          {role === 'Admin' && (
            <>
              <button 
                onClick={openAddDialog}
                className="bg-gradient-to-r from-[#8B1E3F] to-[#CD4368] hover:shadow-lg hover:shadow-maroon-900/15 text-white text-xs font-black uppercase tracking-widest px-5 py-3 rounded-full flex items-center gap-2 active:scale-95 transition-all shadow-md"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" /> Add Event
              </button>

              <button 
                onClick={() => {
                  setImportStep('idle');
                  setExtractedPreview([]);
                  setShowImportModal(true);
                }}
                className="bg-white/80 border border-gray-200 hover:border-[#8B1E3F]/40 hover:bg-[#8B1E3F]/5 text-gray-800 text-xs font-bold px-4 py-3 rounded-full flex items-center gap-2 transition-all active:scale-95"
              >
                <Upload className="w-4 h-4 text-[#8B1E3F]" /> Import AI Pipeline
              </button>

              <button 
                onClick={handleDownloadExcel}
                className="bg-white/80 border border-gray-200 hover:bg-green-50 hover:border-green-300 text-gray-800 text-xs font-bold px-4 py-3 rounded-full flex items-center gap-2 transition-all"
              >
                <FileSpreadsheet className="w-4 h-4 text-green-600" /> Export Excel
              </button>

              <button 
                onClick={handleDownloadWord}
                className="bg-white/80 border border-gray-200 hover:bg-blue-50 hover:border-blue-300 text-gray-800 text-xs font-bold px-4 py-3 rounded-full flex items-center gap-2 transition-all"
              >
                <FileText className="w-4 h-4 text-blue-600" /> Export Word
              </button>
            </>
          )}

          <button 
            onClick={handlePrint}
            className="bg-white/80 border border-gray-200 hover:bg-gray-100 text-gray-800 text-xs font-bold px-4 py-3 rounded-full flex items-center gap-2 transition-all"
          >
            <Printer className="w-4 h-4" /> Print Calendar
          </button>

          {role === 'Admin' && (
            <button 
              onClick={handleForceReseed}
              disabled={syncing}
              className="bg-white/50 border border-dashed border-gray-300 hover:bg-red-50 text-gray-600 hover:text-red-700 text-xs font-bold p-3 rounded-full transition-all"
              title="Factory reset calendar events"
            >
              <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
            </button>
          )}
        </div>
      </div>

      {/* ----------------- Main Workspace (Grid Splitting) ----------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Span (2-Columns): Interactive Grid Calendar & Upcoming list */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Calendar View Card */}
          <GlassCard className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-display font-bold text-lg text-gray-900 flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-[#8B1E3F]" />
                {new Date(gridYear, gridMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h3>
              <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-full border border-gray-200">
                <button 
                  onClick={handlePrevMonth}
                  className="p-1.5 hover:bg-white rounded-full text-gray-600 shadow-sm transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button 
                  onClick={handleNextMonth}
                  className="p-1.5 hover:bg-white rounded-full text-gray-600 shadow-sm transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Days list header */}
            <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">
              <span>Sun</span>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
            </div>

            {/* Calendar Days Grid */}
            <div className="grid grid-cols-7 gap-2 text-slate-800">
              {calendarGridDays.map((cell, idx) => {
                if (!cell) {
                  return <div key={`empty-${idx}`} className="aspect-square bg-gray-50/20 rounded-2xl border border-transparent" />;
                }

                const dayEvents = getNewCalendarDisplayEventsForDate(cell.date);
                const isSelected = selectedGridDay === cell.date;
                const hasEvents = dayEvents.length > 0;
                
                // Set borders or coloring based on type of first event
                let borderStyle = "border-white/20";
                let bgStyle = "bg-white/40 hover:bg-white hover:border-gray-300";
                let textStyle = "text-gray-800";

                if (hasEvents) {
                  const prime = dayEvents[0];
                  if (prime.source === 'holiday') {
                    borderStyle = "border-red-300/60";
                    bgStyle = "bg-red-50 hover:bg-red-100/85 border-red-200/50";
                  } else if (prime.source === 'examination') {
                    borderStyle = "border-orange-300/60";
                    bgStyle = "bg-orange-50 hover:bg-orange-100/85 border-orange-200/50";
                  } else {
                    borderStyle = "border-blue-300/60";
                    bgStyle = "bg-blue-50 hover:bg-blue-100/85 border-blue-200/50";
                  }
                }

                if (isSelected) {
                  bgStyle = "bg-[#8B1E3F] text-white border-[#8B1E3F] shadow-lg shadow-maroon-900/15 scale-105 z-10";
                  textStyle = "text-white";
                }

                // Check weekends
                const dayOfWeek = new Date(cell.date).getDay();
                const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

                return (
                  <button
                    key={cell.date}
                    onClick={() => setSelectedGridDay(cell.date)}
                    className={`
                      aspect-square rounded-[18px] flex flex-col items-center justify-between p-2.5 transition-all duration-300 border relative overflow-hidden group
                      ${bgStyle} ${borderStyle}
                    `}
                  >
                    <span className={`text-xs font-bold ${textStyle} z-10 flex items-center justify-between w-full`}>
                      {cell.day}
                      {isWeekend && !isSelected && (
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300" title="Weekend student holiday" />
                      )}
                    </span>

                    {hasEvents && (
                      <div className="w-full flex flex-col gap-0.5 mt-0.5 overflow-hidden flex-1 justify-end z-10">
                        {dayEvents.slice(0, 2).map((e, eIdx) => {
                          const isHoliday = e.source === 'holiday';
                          const isExam = e.source === 'examination';
                          const dotColor = isSelected 
                            ? '#ffffff' 
                            : isHoliday 
                              ? '#dc2626' // Red
                              : isExam 
                                ? '#f97316' // Orange
                                : '#2563eb'; // Blue

                          const bgClass = isSelected 
                            ? 'bg-white/10 text-white' 
                            : isHoliday 
                              ? 'bg-red-100/50 text-red-700' 
                              : isExam 
                                ? 'bg-orange-100/50 text-orange-700' 
                                : 'bg-blue-100/50 text-blue-700';

                          return (
                            <div 
                              key={eIdx} 
                              className={`flex items-center gap-1 w-full text-[8px] leading-none text-left py-0.5 px-1 rounded truncate ${bgClass}`}
                              title={e.title}
                            >
                              <span 
                                className="w-1 h-1 rounded-full shrink-0" 
                                style={{ backgroundColor: dotColor }} 
                              />
                              <span className="truncate font-medium select-none">
                                {e.title}
                              </span>
                            </div>
                          );
                        })}
                        {dayEvents.length > 2 && (
                          <div className={`text-[7px] font-black text-center leading-none mt-0.5 ${isSelected ? 'text-white/85' : 'text-gray-500'}`}>
                            +{dayEvents.length - 2} more
                          </div>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </GlassCard>

          {/* Scrollable Timeline View */}
          <GlassCard className="p-6 select-none">
            <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-4">
              <h3 className="font-display font-bold text-base text-gray-900 flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-[#8B1E3F]" />
                Institutional Upcoming Timeline
              </h3>
              <span className="text-[10px] font-bold text-gray-400">Monthly Chronological Order</span>
            </div>

            <div className="flex flex-col gap-6 overflow-y-auto max-h-[400px] pr-2">
              {(selectedRange === 'Jul-Dec-2026' 
                ? ['2026-07', '2026-08', '2026-09', '2026-10', '2026-11', '2026-12']
                : ['2027-01', '2027-02', '2027-03', '2027-04', '2027-05', '2027-06', '2027-07', '2027-08']
              ).map((yrMo) => {
                const [yr, mo] = yrMo.split('-');
                const monthName = new Date(parseInt(yr), parseInt(mo) - 1).toLocaleDateString('en-US', { month: 'long' });
                
                const monthEvents = filteredEvents
                  .filter(e => e.startDate.startsWith(yrMo))
                  .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

                if (monthEvents.length === 0) return null;

                return (
                  <div key={yrMo} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start border-l-2 border-[#8B1E3F]/15 pl-4 ml-2">
                    <div className="md:col-span-1">
                      <h4 className="text-xs font-black uppercase tracking-widest text-[#8B1E3F] mb-1">{monthName} {yr}</h4>
                      <span className="text-[10px] text-gray-400 font-bold">{monthEvents.length} scheduled</span>
                    </div>
                    <div className="md:col-span-3 flex flex-wrap gap-2">
                      {monthEvents.map((evt) => (
                        <div 
                          key={evt.id}
                          onClick={() => {
                            setSelectedGridDay(evt.startDate);
                            const eventD = new Date(evt.startDate);
                            setGridMonth(eventD.getMonth());
                            setGridYear(eventD.getFullYear());
                          }}
                          className={`px-3 py-2 border rounded-xl flex items-center gap-2 cursor-pointer text-xs font-semibold hover:scale-102 transition-all ${getCategoryColor(evt.category).bg}`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: getCategoryColor(evt.category).hex }} />
                          <div className="flex flex-col">
                            <span className="font-bold text-gray-900 leading-normal">{evt.title}</span>
                            <span className="text-[9px] text-gray-500 font-bold">
                              {formatEventDateRange(evt.startDate, evt.endDate)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </GlassCard>
        </div>

        {/* Right Span (1-Column): Date Events Panel & Student Upcoming Widgets */}
        <div className="flex flex-col gap-6">
          
          {/* Selected Date Details Panel */}
          <GlassCard className="p-6 h-[460px] flex flex-col justify-between">
            <div className="overflow-hidden flex-1 flex flex-col">
              <div className="border-b border-gray-100 pb-3 mb-4 shrink-0 flex justify-between items-center">
                <div>
                  <span className="text-[10px] font-black text-[#8B1E3F] uppercase tracking-widest block">Selected Schedule</span>
                  <h3 className="font-display font-extrabold text-base text-gray-900">
                    {new Date(selectedGridDay).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </h3>
                </div>
                {role === 'Admin' && (
                  <button 
                    onClick={openAddDialog}
                    className="p-2 hover:bg-[#8B1E3F]/10 rounded-full text-[#8B1E3F] transition-all"
                    title="Add Event to this day"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Event lists on selected day */}
              <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-3">
                {getNewCalendarDisplayEventsForDate(selectedGridDay).length === 0 ? (
                  <div className="py-16 text-center flex flex-col items-center justify-center gap-3">
                    <CalendarIcon className="w-12 h-12 text-gray-300 stroke-[1.5]" />
                    <p className="text-xs text-gray-400 font-medium">No institutional events scheduled for this day.</p>
                  </div>
                ) : (
                  getNewCalendarDisplayEventsForDate(selectedGridDay).map((evt) => {
                    const design = getCategoryColor(evt.category);
                    return (
                      <div 
                        key={evt.id}
                        className={`p-4 border rounded-2xl flex flex-col gap-2 shadow-sm ${design.bg}`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-black uppercase tracking-widest text-[#8B1E3F] bg-white/60 px-2 py-0.5 rounded-full border border-gray-200/50">
                            {evt.category}
                          </span>
                          <span className="text-[9px] font-bold text-gray-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {!evt.endDate || evt.startDate === evt.endDate ? "All Day" : formatEventDateRange(evt.startDate, evt.endDate)}
                          </span>
                        </div>
                        
                        <h4 className="text-sm font-extrabold leading-snug text-gray-900">{evt.title}</h4>
                        {evt.rawEvent?.description && (
                          <p className="text-xs text-gray-600 font-medium">{evt.rawEvent.description}</p>
                        )}

                        <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-gray-200/20 text-[10px] font-bold text-gray-500">
                          <div>
                            <span className="block text-[8px] text-gray-400 uppercase tracking-wide">Scope / Semester</span>
                            <span className="text-gray-700">{evt.rawEvent?.semester || evt.semesterOrYear || 'All'} ({evt.programme || 'Institution'})</span>
                          </div>
                          <div>
                            <span className="block text-[8px] text-gray-400 uppercase tracking-wide">Regulation</span>
                            <span className="text-gray-700">{evt.rawEvent?.regulation || 'Universal'}</span>
                          </div>
                        </div>

                        {role === 'Admin' && evt.rawEvent && (
                          <div className="flex items-center justify-end gap-1.5 mt-2 pt-2 border-t border-gray-200/20">
                            <button 
                              onClick={() => openEditDialog(evt.rawEvent!)}
                              className="p-1.5 hover:bg-white rounded-full text-blue-600 hover:text-blue-700 transition-all shadow-sm"
                              title="Edit"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              onClick={() => handleDeleteEvent(evt.rawEvent!.id!)}
                              className="p-1.5 hover:bg-white rounded-full text-red-600 hover:text-red-700 transition-all shadow-sm"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </GlassCard>

          {/* Student Simplified Perspective Side Panel */}
          <GlassCard className="p-6 flex flex-col gap-5">
            <div className="border-b border-gray-100 pb-3">
              <h3 className="font-display font-bold text-base text-gray-900">Academic Milestones</h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">Quick Reference Highlights</p>
            </div>

            {/* Next Event */}
            <div className="flex gap-4 items-start bg-blue-50/40 border border-blue-100 p-3.5 rounded-xl">
              <div className="p-2.5 rounded-lg bg-blue-600 text-white shadow-md shadow-blue-900/10 shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[8px] font-black text-blue-600 uppercase tracking-widest block">Next General Event</span>
                <h4 className="text-xs font-bold text-gray-900 leading-normal mt-1">
                  {highlights.nextEvent ? highlights.nextEvent.title : 'No upcoming seminars'}
                </h4>
                <p className="text-[10px] text-gray-500 font-bold uppercase mt-1">
                  {highlights.nextEvent ? new Date(highlights.nextEvent.startDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }) : ''}
                </p>
              </div>
            </div>

            {/* Next Exam */}
            <div className="flex gap-4 items-start bg-orange-50/40 border border-orange-100 p-3.5 rounded-xl">
              <div className="p-2.5 rounded-lg bg-orange-600 text-white shadow-md shadow-orange-900/10 shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[8px] font-black text-orange-600 uppercase tracking-widest block">Next Sessional Exam / CIA</span>
                <h4 className="text-xs font-bold text-gray-900 leading-normal mt-1">
                  {highlights.nextExam ? highlights.nextExam.title : 'No exams scheduled'}
                </h4>
                <p className="text-[10px] text-gray-500 font-bold uppercase mt-1">
                  {highlights.nextExam ? new Date(highlights.nextExam.startDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }) : ''}
                </p>
              </div>
            </div>

            {/* Next Holiday */}
            <div className="flex gap-4 items-start bg-red-50/40 border border-red-100 p-3.5 rounded-xl">
              <div className="p-2.5 rounded-lg bg-red-600 text-white shadow-md shadow-red-900/10 shrink-0">
                <CalendarIcon className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[8px] font-black text-red-600 uppercase tracking-widest block">Next Scheduled Holiday</span>
                <h4 className="text-xs font-bold text-gray-900 leading-normal mt-1">
                  {highlights.nextHoliday ? highlights.nextHoliday.title : 'No upcoming holidays'}
                </h4>
                <p className="text-[10px] text-gray-500 font-bold uppercase mt-1">
                  {highlights.nextHoliday ? new Date(highlights.nextHoliday.startDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }) : ''}
                </p>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* ----------------- Event List modern Data Tables (Four Sections) ----------------- */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-6 print:grid-cols-1">
        
        {/* Section 1: Scheduled Holidays */}
        <GlassCard className="p-6 select-none overflow-hidden flex flex-col justify-between print:border-none print:shadow-none print:bg-transparent">
          <div>
            <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-4">
              <div>
                <h3 className="font-display font-extrabold text-base text-gray-900 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />
                  Scheduled Holidays
                </h3>
              </div>
              <span className="text-[10px] font-black text-red-600 bg-red-50 px-2 py-1 rounded-full uppercase tracking-wider border border-red-100">
                {filteredEvents.filter(isHolidayEvent).length} Holidays
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-400 font-bold uppercase tracking-wider text-[9px]">
                    <th className="py-2.5 px-2">Date</th>
                    <th className="py-2.5 px-2">Holiday</th>
                    {role === 'Admin' && <th className="py-2.5 px-2 text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 font-medium text-gray-700">
                  {filteredEvents.filter(isHolidayEvent).length === 0 ? (
                    <tr>
                      <td colSpan={role === 'Admin' ? 3 : 2} className="py-8 text-center text-gray-400">
                        No holidays scheduled for this period.
                      </td>
                    </tr>
                  ) : (
                    filteredEvents.filter(isHolidayEvent)
                      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
                      .map((evt) => (
                        <tr key={evt.id} className="hover:bg-gray-50/60 transition-colors">
                          <td className="py-2.5 px-2 font-bold text-gray-900 whitespace-nowrap">
                            {formatEventPeriodToDMY(evt.startDate, evt.endDate)}
                          </td>
                          <td className="py-2.5 px-2">
                            <div className="font-extrabold text-gray-900 leading-normal">{evt.title}</div>
                            {evt.description && <div className="text-[9px] text-gray-400 mt-0.5 font-medium">{evt.description}</div>}
                          </td>
                          {role === 'Admin' && (
                            <td className="py-2.5 px-2 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-1">
                                <button 
                                  onClick={() => openEditDialog(evt)}
                                  className="p-1 hover:bg-gray-100 rounded text-blue-600"
                                  title="Edit"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button 
                                  onClick={() => handleDeleteEvent(evt.id!)}
                                  className="p-1 hover:bg-gray-100 rounded text-red-600"
                                  title="Delete"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </GlassCard>

        {/* Section 2: Sessional / CIA Schedule */}
        <GlassCard className="p-6 select-none overflow-hidden flex flex-col justify-between print:border-none print:shadow-none print:bg-transparent">
          {(() => {
            const displaySections = sessionalTab === 'B.Pharm'
              ? (selectedRange === 'Jul-Dec-2026'
                ? ['Semester I', 'Semester III', 'Semester V', 'Semester VII']
                : ['Semester II', 'Semester IV', 'Semester VI', 'Semester VIII'])
              : ['Year I', 'Year II', 'Year III', 'Year IV', 'Year V'];

            // Filter current program exams
            const currentProgExams = filteredEvents.filter(evt => {
              if (!isExamEvent(evt)) return false;
              if (sessionalTab === 'B.Pharm') {
                return isBPharm(evt);
              } else {
                return isPharmD(evt);
              }
            });

            // Map events to our fixed sections
            const sectionEventsMap: Record<string, CalendarEvent[]> = {};
            displaySections.forEach(section => {
              sectionEventsMap[section] = currentProgExams.filter(evt => 
                eventAppliesToSection(evt, section, sessionalTab)
              );
            });

            return (
              <div>
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-gray-100 pb-4 mb-4">
                  <div>
                    <h3 className="font-display font-extrabold text-base text-gray-900 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block" />
                      Sessional / CIA Schedule
                    </h3>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-0.5">Internal & University Examination Calendar</p>
                  </div>
                  
                  {/* Programme Tabs with Maroon style */}
                  <div className="flex items-center bg-[#8B1E3F]/5 border border-[#8B1E3F]/15 p-1 rounded-full inline-flex self-start sm:self-auto select-none">
                    <button
                      onClick={() => {
                        setSessionalTab('B.Pharm');
                        setExpandedSection(null);
                      }}
                      className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all duration-300 ${
                        sessionalTab === 'B.Pharm'
                          ? 'bg-[#8B1E3F] text-white shadow-md'
                          : 'text-[#8B1E3F] hover:bg-[#8B1E3F]/10'
                      }`}
                    >
                      B.Pharm
                    </button>
                    <button
                      onClick={() => {
                        setSessionalTab('Pharm.D');
                        setExpandedSection(null);
                      }}
                      className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all duration-300 ${
                        sessionalTab === 'Pharm.D'
                          ? 'bg-[#8B1E3F] text-white shadow-md'
                          : 'text-[#8B1E3F] hover:bg-[#8B1E3F]/10'
                      }`}
                    >
                      Pharm.D
                    </button>
                  </div>
                </div>

                {/* Accordion List */}
                <div className="space-y-2">
                  {displaySections.map((semYearName) => {
                    const isExpanded = expandedSection === semYearName;
                    const groupEvents = sectionEventsMap[semYearName] || [];
                    
                    const sortedEvents = [...groupEvents].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
                    
                    // Group events strictly using examCategory and examType
                    const getExamEventForGroup = (category: string, type: 'Practical' | 'Theory') => {
                      return sortedEvents.find(evt => {
                        if (evt.examCategory !== category) return false;
                        const resolvedType = evt.examType || (evt.title.toLowerCase().includes('practical') ? 'Practical' : 'Theory');
                        return resolvedType.toLowerCase() === type.toLowerCase();
                      });
                    };

                    const renderExamRow = (evt: CalendarEvent | undefined, label: string) => {
                      return (
                        <div className="group/row flex justify-between items-center py-1">
                          <div>
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">
                              {label}
                            </div>
                            <div className="text-sm font-extrabold text-slate-800 tracking-tight leading-none">
                              {evt ? formatEventPeriodToDMY(evt.startDate, evt.endDate) : '—'}
                            </div>
                          </div>
                          {evt && role === 'Admin' && (
                            <div className="opacity-0 group-hover/row:opacity-100 flex items-center gap-1 transition-opacity pl-2">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openEditDialog(evt);
                                }}
                                className="p-1 hover:bg-gray-100 rounded text-blue-600 transition-colors"
                                title="Edit"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteEvent(evt.id!);
                                }}
                                className="p-1 hover:bg-gray-100 rounded text-red-600 transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    };

                    const renderExamCard = (categoryKey: string, displayTitle: string) => {
                      const prEvt = getExamEventForGroup(categoryKey, 'Practical');
                      const thEvt = getExamEventForGroup(categoryKey, 'Theory');
                      return (
                        <div className="bg-white border border-gray-150 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                          <h4 className="font-display font-black text-xs text-[#8B1E3F] tracking-widest uppercase border-b border-[#8B1E3F]/10 pb-2 mb-3">
                            {displayTitle}
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {renderExamRow(prEvt, 'PRACTICAL')}
                            {renderExamRow(thEvt, 'THEORY')}
                          </div>
                        </div>
                      );
                    };

                    const hasAnyEvents = sortedEvents.length > 0;

                    return (
                      <div 
                        key={semYearName} 
                        className="border border-gray-100 rounded-xl overflow-hidden transition-all bg-white/40 shadow-sm"
                      >
                        {/* Accordion Header */}
                        <div 
                          onClick={() => setExpandedSection(isExpanded ? null : semYearName)}
                          className="flex justify-between items-center px-4 py-3 cursor-pointer hover:bg-[#8B1E3F]/5 transition-colors select-none"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-[#8B1E3F] text-[10px] font-bold w-4 text-center">
                              {isExpanded ? '▼' : '▶'}
                            </span>
                            <span className="font-extrabold text-xs text-gray-800">
                              {sessionalTab === 'B.Pharm' ? 'B.Pharm' : 'Pharm.D'} – {semYearName}
                            </span>
                          </div>
                        </div>

                        {/* Accordion Content */}
                        <AnimatePresence initial={false}>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              style={{ overflow: 'hidden' }}
                              className="border-t border-gray-50 bg-white/25"
                            >
                              <div className="px-5 py-4">
                                {!hasAnyEvents ? (
                                  <p className="text-xs text-gray-400 italic font-medium py-2">
                                    Examination schedule not available in the current Academic Calendar. Do not invent dates.
                                  </p>
                                ) : sessionalTab === 'B.Pharm' ? (
                                  <div className="space-y-4">
                                    {renderExamCard("I Sessional / CIA", "I SESSIONAL / CIA")}
                                    {renderExamCard("II Sessional / CIA", "II SESSIONAL / CIA")}
                                    {renderExamCard("Semester Examination", "SEMESTER EXAMINATION")}
                                  </div>
                                ) : (
                                  <div className="space-y-4">
                                    {renderExamCard("I Sessional / CIA", "I SESSIONAL / CIA")}
                                    {renderExamCard("II Sessional / CIA", "II SESSIONAL / CIA")}
                                    {renderExamCard("III Sessional / CIA", "III SESSIONAL / CIA")}
                                    {renderExamCard("University Examination", "UNIVERSITY EXAMINATION")}
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}
        </GlassCard>

        {/* Section 3: Curricular Events */}
        <GlassCard className="p-6 select-none overflow-hidden flex flex-col justify-between print:border-none print:shadow-none print:bg-transparent">
          <div>
            <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-4">
              <div>
                <h3 className="font-display font-extrabold text-base text-gray-900 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
                  Curricular Events
                </h3>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-0.5">FDPs, Workshops, Seminars, & Conferences</p>
              </div>
              <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-full uppercase tracking-wider border border-blue-100">
                {filteredEvents.filter(isCurricularEvent).length} Events
              </span>
            </div>

            <div className="overflow-y-auto max-h-[500px] pr-1">
              {filteredEvents.filter(isCurricularEvent).length === 0 ? (
                <div className="py-12 text-center text-xs text-gray-400 font-medium">
                  No curricular events scheduled for this period.
                </div>
              ) : (
                (() => {
                  // Group by Month Year
                  const curriculars = filteredEvents.filter(isCurricularEvent)
                    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
                  
                  const groups: { [key: string]: CalendarEvent[] } = {};
                  curriculars.forEach(evt => {
                    const d = new Date(evt.startDate);
                    const monthYear = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
                    if (!groups[monthYear]) {
                      groups[monthYear] = [];
                    }
                    groups[monthYear].push(evt);
                  });

                  return Object.entries(groups).map(([monthYear, monthEvts]) => (
                    <div key={monthYear} className="mb-6">
                      <h4 className="text-xs font-black uppercase tracking-wider text-[#8B1E3F] bg-[#8B1E3F]/5 px-3 py-1.5 rounded-lg mb-2">
                        {monthYear}
                      </h4>
                      <table className="w-full text-left border-collapse text-xs mb-2">
                        <thead>
                          <tr className="border-b border-gray-100 text-gray-400 font-bold uppercase tracking-wider text-[9px]">
                            <th className="py-2 px-2 w-1/4">Date</th>
                            <th className="py-2 px-2 w-3/4">Event Details</th>
                            {role === 'Admin' && <th className="py-2 px-2 text-right">Actions</th>}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 font-medium text-gray-700">
                          {monthEvts.map((evt) => (
                            <tr key={evt.id} className="hover:bg-gray-50/60 transition-colors">
                              <td className="py-2.5 px-2 font-bold text-gray-900 whitespace-nowrap align-top">
                                {formatEventPeriodToDMY(evt.startDate, evt.endDate)}
                              </td>
                              <td className="py-2.5 px-2 align-top">
                                <span className={`px-1.5 py-0.5 rounded text-[8px] font-black border uppercase tracking-wider ${getCategoryColor(evt.category).bg} mr-2 inline-block mb-1`}>
                                  {evt.category}
                                </span>
                                <div className="font-extrabold text-gray-900 leading-normal">{evt.title}</div>
                                {evt.description && <div className="text-[9px] text-gray-400 mt-0.5 font-medium">{evt.description}</div>}
                              </td>
                              {role === 'Admin' && (
                                <td className="py-2.5 px-2 text-right whitespace-nowrap align-top">
                                  <div className="flex items-center justify-end gap-1">
                                    <button 
                                      onClick={() => openEditDialog(evt)}
                                      className="p-1 hover:bg-gray-100 rounded text-blue-600"
                                      title="Edit"
                                    >
                                      <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                    <button 
                                      onClick={() => handleDeleteEvent(evt.id!)}
                                      className="p-1 hover:bg-gray-100 rounded text-red-600"
                                      title="Delete"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </td>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ));
                })()
              )}
            </div>
          </div>
        </GlassCard>



      </div>

      {/* ----------------- Modals ----------------- */}

      {/* Add / Edit Event Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 select-none animate-fade-in">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-[32px] border border-gray-100 p-6 w-full max-w-lg shadow-2xl relative max-h-[90vh] overflow-y-auto"
          >
            <button 
              onClick={() => setShowAddModal(false)}
              className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 absolute top-4 right-4"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-display font-extrabold text-xl text-gray-900 mb-2">
              {editingEvent ? "Modify ERP Schedule Event" : "Define New Academic Event"}
            </h3>
            <p className="text-xs text-gray-500 mb-6">Manage specific dates, categories, and student scopes.</p>

            <form onSubmit={handleSaveEvent} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Programme</label>
                  <select 
                    value={formEvent.programme}
                    onChange={(e) => setFormEvent({ ...formEvent, programme: e.target.value })}
                    className="bg-gray-50 border border-gray-200 text-xs rounded-xl px-3 py-2.5 font-bold focus:outline-none"
                  >
                    {PROGRAMMES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Semester</label>
                  <select 
                    value={formEvent.semester}
                    onChange={(e) => setFormEvent({ ...formEvent, semester: e.target.value })}
                    className="bg-gray-50 border border-gray-200 text-xs rounded-xl px-3 py-2.5 font-bold focus:outline-none"
                  >
                    {SEMESTERS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Event Category</label>
                <select 
                  value={formEvent.category}
                  onChange={(e) => setFormEvent({ ...formEvent, category: e.target.value })}
                  className="bg-gray-50 border border-gray-200 text-xs rounded-xl px-3 py-2.5 font-bold focus:outline-none"
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Event Title</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g., Commencement of Classes"
                  value={formEvent.title}
                  onChange={(e) => setFormEvent({ ...formEvent, title: e.target.value })}
                  className="bg-gray-50 border border-gray-200 text-xs rounded-xl px-3 py-2.5 font-semibold focus:outline-none focus:border-[#8B1E3F]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Description</label>
                <textarea 
                  rows={2}
                  placeholder="Further event context details..."
                  value={formEvent.description}
                  onChange={(e) => setFormEvent({ ...formEvent, description: e.target.value })}
                  className="bg-gray-50 border border-gray-200 text-xs rounded-xl px-3 py-2.5 font-semibold focus:outline-none focus:border-[#8B1E3F]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Start Date</label>
                  <input 
                    type="date"
                    required
                    value={formEvent.startDate}
                    onChange={(e) => setFormEvent({ ...formEvent, startDate: e.target.value })}
                    className="bg-gray-50 border border-gray-200 text-xs rounded-xl px-3 py-2.5 font-bold focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">End Date</label>
                  <input 
                    type="date"
                    value={formEvent.endDate}
                    onChange={(e) => setFormEvent({ ...formEvent, endDate: e.target.value })}
                    className="bg-gray-50 border border-gray-200 text-xs rounded-xl px-3 py-2.5 font-bold focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Working Day?</label>
                  <select 
                    value={formEvent.workingDay}
                    onChange={(e) => setFormEvent({ ...formEvent, workingDay: e.target.value })}
                    className="bg-gray-50 border border-gray-200 text-xs rounded-xl px-3 py-2.5 font-bold focus:outline-none"
                  >
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Holiday?</label>
                  <select 
                    value={formEvent.holiday}
                    onChange={(e) => setFormEvent({ ...formEvent, holiday: e.target.value })}
                    className="bg-gray-50 border border-gray-200 text-xs rounded-xl px-3 py-2.5 font-bold focus:outline-none"
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Applicable To</label>
                <input 
                  type="text"
                  placeholder="e.g., All students"
                  value={formEvent.applicableTo}
                  onChange={(e) => setFormEvent({ ...formEvent, applicableTo: e.target.value })}
                  className="bg-gray-50 border border-gray-200 text-xs rounded-xl px-3 py-2.5 font-semibold focus:outline-none"
                />
              </div>

              {/* Sessional / CIA Specific Fields */}
              {isExamEvent(formEvent) && (
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col gap-3">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#8B1E3F] block border-b border-slate-200 pb-1">
                    Academic Calendar Exam Schema Settings
                  </span>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] font-bold uppercase tracking-wider text-gray-500">Exam Type</label>
                      <select
                        value={formEvent.examType || 'Theory'}
                        onChange={(e) => setFormEvent({ ...formEvent, examType: e.target.value as 'Theory' | 'Practical' })}
                        className="bg-white border border-gray-200 text-xs rounded-xl px-2.5 py-2 font-bold focus:outline-none"
                      >
                        <option value="Theory">Theory</option>
                        <option value="Practical">Practical</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] font-bold uppercase tracking-wider text-gray-500">Exam Category</label>
                      <select
                        value={formEvent.examCategory || 'I Sessional / CIA'}
                        onChange={(e) => setFormEvent({ ...formEvent, examCategory: e.target.value })}
                        className="bg-white border border-gray-200 text-xs rounded-xl px-2.5 py-2 font-bold focus:outline-none"
                      >
                        <option value="I Sessional / CIA">I Sessional / CIA</option>
                        <option value="II Sessional / CIA">II Sessional / CIA</option>
                        {formEvent.programme === 'Pharm.D' ? (
                          <>
                            <option value="III Sessional / CIA">III Sessional / CIA</option>
                            <option value="University Examination">University Examination</option>
                          </>
                        ) : (
                          <option value="Semester Examination">Semester Examination</option>
                        )}
                      </select>
                    </div>
                  </div>

                  {formEvent.programme === 'B.Pharm' && (
                    <div className="flex flex-col gap-1.5 mt-1">
                      <label className="text-[9px] font-bold uppercase tracking-wider text-gray-500">Applicable Semesters</label>
                      <div className="grid grid-cols-4 gap-2">
                        {['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'].map((sem) => {
                          const list = formEvent.applicableSemesters || [];
                          const checked = list.includes(sem);
                          return (
                            <label key={sem} className="flex items-center gap-1.5 text-xs font-bold cursor-pointer select-none text-slate-700">
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={(e) => {
                                  const newList = e.target.checked
                                    ? [...list, sem]
                                    : list.filter(s => s !== sem);
                                  setFormEvent({ ...formEvent, applicableSemesters: newList });
                                }}
                                className="rounded border-gray-300 text-[#8B1E3F] focus:ring-[#8B1E3F]"
                              />
                              Sem {sem}
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {formEvent.programme === 'Pharm.D' && (
                    <div className="flex flex-col gap-1.5 mt-1">
                      <label className="text-[9px] font-bold uppercase tracking-wider text-gray-500">Applicable Years</label>
                      <div className="grid grid-cols-3 gap-2">
                        {['I', 'II', 'III', 'IV', 'V'].map((yr) => {
                          const list = formEvent.applicableYears || [];
                          const checked = list.includes(yr);
                          return (
                            <label key={yr} className="flex items-center gap-1.5 text-xs font-bold cursor-pointer select-none text-slate-700">
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={(e) => {
                                  const newList = e.target.checked
                                    ? [...list, yr]
                                    : list.filter(y => y !== yr);
                                  setFormEvent({ ...formEvent, applicableYears: newList });
                                }}
                                className="rounded border-gray-300 text-[#8B1E3F] focus:ring-[#8B1E3F]"
                              />
                              Year {yr}
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 mt-4">
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)}
                  className="bg-gray-100 text-gray-600 hover:bg-gray-200 text-xs font-black uppercase tracking-widest px-5 py-3 rounded-full transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={syncing}
                  className="bg-gradient-to-r from-[#8B1E3F] to-[#CD4368] text-white text-xs font-black uppercase tracking-widest px-6 py-3 rounded-full flex items-center gap-2 active:scale-95 transition-all shadow-md"
                >
                  <Save className="w-4 h-4" /> {editingEvent ? "Save Changes" : "Create Event"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* AI Processing Pipeline & Document Importer Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-md flex items-center justify-center p-4 z-50 select-none animate-fade-in">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-[32px] border border-gray-100 p-6 w-full max-w-4xl shadow-2xl relative max-h-[90vh] overflow-y-auto"
          >
            <button 
              onClick={() => {
                setShowImportModal(false);
                setImportStep('idle');
              }}
              className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 absolute top-4 right-4"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-6 h-6 text-[#8B1E3F]" />
              <h3 className="font-display font-extrabold text-2xl text-gray-900">
                Academic Calendar AI Processing Pipeline
              </h3>
            </div>
            <p className="text-xs text-gray-500 mb-6">
              Upload official PDF, Excel sheets, or Word docs. Gemini AI will parse, extract, and auto-standardize the schedule.
            </p>

            {importStep === 'idle' && (
              <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-gray-200 rounded-[24px] bg-gray-50/50 relative group hover:border-[#8B1E3F]/40 transition-all">
                <FileUp className="w-16 h-16 text-gray-300 group-hover:text-[#8B1E3F]/70 transition-colors stroke-[1.25] mb-4" />
                <h4 className="text-sm font-bold text-gray-700 mb-1">Drag and drop academic document here</h4>
                <p className="text-[11px] text-gray-400 font-medium mb-4">Supported formats: PDF, .xlsx, .docx (Max 15MB)</p>
                
                <input 
                  type="file" 
                  accept=".pdf,.xlsx,.docx"
                  onChange={handleFileUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                
                <button className="bg-[#8B1E3F] hover:bg-[#8B1E3F]/90 text-white text-[10px] font-black uppercase tracking-widest px-5 py-2.5 rounded-full pointer-events-none shadow-md">
                  Select File
                </button>
              </div>
            )}

            {importStep === 'processing' && (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                {/* Custom glowing loader */}
                <div className="relative flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full border-4 border-gray-100 border-t-[#8B1E3F] animate-spin" />
                  <Sparkles className="w-5 h-5 text-[#8B1E3F] absolute animate-pulse" />
                </div>
                <h4 className="text-sm font-black text-[#8B1E3F] uppercase tracking-widest mt-2">Processing Document</h4>
                <p className="text-xs text-gray-500 font-medium animate-pulse">{uploadProgress}</p>

                {/* Simulated Pipeline Stages */}
                <div className="flex items-center gap-2 mt-4 text-[10px] font-bold text-gray-400">
                  <span className="text-green-500">Upload Doc</span>
                  <ArrowRight className="w-3 h-3 text-green-500" />
                  <span className="text-green-500">Detect Type</span>
                  <ArrowRight className="w-3 h-3 text-green-500" />
                  <span className="text-[#8B1E3F] font-black animate-pulse">AI Read</span>
                  <ArrowRight className="w-3 h-3" />
                  <span>Extract Fields</span>
                  <ArrowRight className="w-3 h-3" />
                  <span>Preview</span>
                </div>
              </div>
            )}

            {importStep === 'preview' && (
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <div>
                    <h4 className="text-sm font-extrabold text-gray-900">Extracted Events Review Sheet</h4>
                    <p className="text-[10px] text-gray-400 font-bold">Successfully identified {extractedPreview.length} items. Please review and refine values before merging into Firestore.</p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        setImportStep('idle');
                        setExtractedPreview([]);
                      }}
                      className="bg-gray-100 text-gray-600 hover:bg-gray-200 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full"
                    >
                      Re-Upload
                    </button>
                  </div>
                </div>

                {/* Editable Preview Table */}
                <div className="overflow-y-auto max-h-[350px] border border-gray-100 rounded-xl">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50 text-gray-400 font-bold uppercase tracking-wider text-[9px]">
                        <th className="py-2 px-3">Date</th>
                        <th className="py-2 px-3">Title</th>
                        <th className="py-2 px-3">Category</th>
                        <th className="py-2 px-3">Scope / Semester</th>
                        <th className="py-2 px-3">WD / Holiday</th>
                        <th className="py-2 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-medium">
                      {extractedPreview.map((item, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="py-2 px-3">
                            <input 
                              type="text" 
                              value={item.startDate}
                              onChange={(e) => {
                                const val = e.target.value;
                                setExtractedPreview(prev => prev.map((it, i) => i === idx ? { ...it, startDate: val, endDate: val } : it));
                              }}
                              className="bg-gray-50 border border-gray-200 rounded px-2 py-1 w-28 text-xs focus:bg-white"
                            />
                          </td>
                          <td className="py-2 px-3">
                            <input 
                              type="text" 
                              value={item.title}
                              onChange={(e) => {
                                const val = e.target.value;
                                setExtractedPreview(prev => prev.map((it, i) => i === idx ? { ...it, title: val } : it));
                              }}
                              className="bg-gray-50 border border-gray-200 rounded px-2 py-1 w-full text-xs focus:bg-white"
                            />
                          </td>
                          <td className="py-2 px-3">
                            <select 
                              value={item.category}
                              onChange={(e) => {
                                const val = e.target.value;
                                setExtractedPreview(prev => prev.map((it, i) => i === idx ? { ...it, category: val } : it));
                              }}
                              className="bg-gray-50 border border-gray-200 rounded px-2 py-1 text-xs"
                            >
                              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                          </td>
                          <td className="py-2 px-3">
                            <input 
                              type="text" 
                              value={item.semester}
                              onChange={(e) => {
                                const val = e.target.value;
                                setExtractedPreview(prev => prev.map((it, i) => i === idx ? { ...it, semester: val } : it));
                              }}
                              className="bg-gray-50 border border-gray-200 rounded px-2 py-1 w-24 text-xs"
                            />
                          </td>
                          <td className="py-2 px-3 whitespace-nowrap">
                            <span className="text-[10px] text-gray-500 mr-2">WD: {item.workingDay} | H: {item.holiday}</span>
                          </td>
                          <td className="py-2 px-3 text-right">
                            <button 
                              onClick={() => setExtractedPreview(prev => prev.filter((_, i) => i !== idx))}
                              className="p-1 hover:bg-red-50 rounded text-red-600"
                              title="Discard"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center justify-end gap-3 mt-4 border-t border-gray-100 pt-4">
                  <button 
                    onClick={() => {
                      setShowImportModal(false);
                      setImportStep('idle');
                    }}
                    className="bg-gray-100 text-gray-600 hover:bg-gray-200 text-xs font-black uppercase tracking-widest px-5 py-3 rounded-full transition-all"
                  >
                    Discard
                  </button>
                  <button 
                    onClick={handleConfirmImport}
                    disabled={syncing}
                    className={`text-xs font-black uppercase tracking-widest px-6 py-3 rounded-full flex items-center gap-2 transition-all shadow-md ${
                      syncing 
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed opacity-55" 
                        : "bg-gradient-to-r from-green-600 to-emerald-500 text-white active:scale-95 hover:shadow-lg"
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" /> Save Approved Calendar
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}

// Full array of seeded academic events from the official PDF list of holidays & events calendar!
function getSeededEvents(): CalendarEvent[] {
  const originalEvents: CalendarEvent[] = [
    {
      academicYear: "2026-2027",
      programme: "Institution",
      regulation: "Institution",
      semester: "All",
      startDate: "2026-06-26",
      endDate: "2026-06-26",
      title: "Moharram Holiday",
      description: "State government official holiday",
      category: "Holiday",
      workingDay: "No",
      holiday: "Yes",
      applicableTo: "All Students and Faculty",
      status: "Published",
      remarks: "Official Holiday"
    },
    {
      academicYear: "2026-2027",
      programme: "B.Pharm",
      regulation: "PCI 2017",
      semester: "Semester V",
      startDate: "2026-06-19",
      endDate: "2026-06-19",
      title: "Alumni Lecture 01",
      description: "Guest lecture by SRM Alumnus on modern pharmaceutical trends",
      category: "Guest Lecture",
      workingDay: "Yes",
      holiday: "No",
      applicableTo: "All B.Pharm and Pharm.D Students",
      status: "Published",
      remarks: "Placement Cell Series"
    },
    {
      academicYear: "2026-2027",
      programme: "Institution",
      regulation: "Institution",
      semester: "All",
      startDate: "2026-06-21",
      endDate: "2026-06-21",
      title: "International Yoga Day Celebration",
      description: "Institutional yoga awareness and wellness practice sessions",
      category: "General Academic Event",
      workingDay: "Yes",
      holiday: "No",
      applicableTo: "All Students and Faculty",
      status: "Published",
      remarks: "Yoga Club Event"
    },
    {
      academicYear: "2026-2027",
      programme: "Institution",
      regulation: "Institution",
      semester: "All",
      startDate: "2026-07-15",
      endDate: "2026-07-15",
      title: "Orientation Programme for New Batch",
      description: "Academic orientation and welcome session for Semester I B.Pharm and Pharm.D students",
      category: "Orientation",
      workingDay: "Yes",
      holiday: "No",
      applicableTo: "Semester I B.Pharm & Pharm.D Students",
      status: "Published",
      remarks: "IQAC Orientation"
    },
    {
      academicYear: "2026-2027",
      programme: "Institution",
      regulation: "Institution",
      semester: "All",
      startDate: "2026-07-20",
      endDate: "2026-07-24",
      title: "FDP on Mental Health & Wellness",
      description: "5-day National level Faculty Development Programme on holistic well-being",
      category: "FDP",
      workingDay: "Yes",
      holiday: "No",
      applicableTo: "All Faculty Members",
      status: "Published",
      remarks: "Organized by Pharmacy Education Dept"
    },
    {
      academicYear: "2026-2027",
      programme: "Institution",
      regulation: "Institution",
      semester: "All",
      startDate: "2026-08-15",
      endDate: "2026-08-15",
      title: "Independence Day Celebration",
      description: "National festival and flag hoisting ceremony",
      category: "Holiday",
      workingDay: "No",
      holiday: "Yes",
      applicableTo: "All Students and Faculty",
      status: "Published",
      remarks: "National Holiday"
    },
    {
      academicYear: "2026-2027",
      programme: "Institution",
      regulation: "Institution",
      semester: "All",
      startDate: "2026-09-04",
      endDate: "2026-09-05",
      title: "National Conference on Drug Discovery",
      description: "National level conference focusing on novel formulations and clinical therapies",
      category: "Conference",
      workingDay: "Yes",
      holiday: "No",
      applicableTo: "All Pharmacy Students and Faculty",
      status: "Published",
      remarks: "SRM Annual Conference"
    },
    {
      academicYear: "2026-2027",
      programme: "Institution",
      regulation: "Institution",
      semester: "All",
      startDate: "2026-09-15",
      endDate: "2026-09-15",
      title: "Milad-Un-Nabi Holiday",
      description: "Religious holiday observation",
      category: "Holiday",
      workingDay: "No",
      holiday: "Yes",
      applicableTo: "All Students and Faculty",
      status: "Published",
      remarks: "Official Holiday"
    },
    {
      academicYear: "2026-2027",
      programme: "Institution",
      regulation: "Institution",
      semester: "All",
      startDate: "2026-09-18",
      endDate: "2026-09-18",
      title: "Workshop on 3D Printing in Pharmaceutics",
      description: "Hands-on national level workshop focusing on automated pill design",
      category: "Workshop",
      workingDay: "Yes",
      holiday: "No",
      applicableTo: "B.Pharm and M.Pharm Students",
      status: "Published",
      remarks: "IQAC Series"
    },
    {
      academicYear: "2026-2027",
      programme: "Institution",
      regulation: "Institution",
      semester: "All",
      startDate: "2026-09-21",
      endDate: "2026-09-21",
      title: "Sri Krishna Jayanthi",
      description: "Festival holiday observation",
      category: "Holiday",
      workingDay: "No",
      holiday: "Yes",
      applicableTo: "All Students and Faculty",
      status: "Published",
      remarks: "Official Holiday"
    },
    {
      academicYear: "2026-2027",
      programme: "Institution",
      regulation: "Institution",
      semester: "All",
      startDate: "2026-09-25",
      endDate: "2026-09-25",
      title: "Vinayakar Chathurthi Holiday",
      description: "Festival holiday observation",
      category: "Holiday",
      workingDay: "No",
      holiday: "Yes",
      applicableTo: "All Students and Faculty",
      status: "Published",
      remarks: "Official Holiday"
    },
    {
      academicYear: "2026-2027",
      programme: "Institution",
      regulation: "Institution",
      semester: "All",
      startDate: "2026-10-12",
      endDate: "2026-10-17",
      title: "National Pharmacovigilance Week",
      description: "Annual awareness week regarding drug adverse reactions and safety systems",
      category: "Seminar",
      workingDay: "Yes",
      holiday: "No",
      applicableTo: "All Pharmacy Students",
      status: "Published",
      remarks: "Clinical Pharmacy Series"
    },
    {
      academicYear: "2026-2027",
      programme: "Institution",
      regulation: "Institution",
      semester: "All",
      startDate: "2026-10-02",
      endDate: "2026-10-02",
      title: "Gandhi Jayanthi Holiday",
      description: "National holiday observation",
      category: "Holiday",
      workingDay: "No",
      holiday: "Yes",
      applicableTo: "All Students and Faculty",
      status: "Published",
      remarks: "National Holiday"
    },
    {
      academicYear: "2026-2027",
      programme: "Institution",
      regulation: "Institution",
      semester: "All",
      startDate: "2026-10-19",
      endDate: "2026-10-19",
      title: "Ayudha Pooja Holiday",
      description: "Festival holiday observation",
      category: "Holiday",
      workingDay: "No",
      holiday: "Yes",
      applicableTo: "All Students and Faculty",
      status: "Published",
      remarks: "Official Holiday"
    },
    {
      academicYear: "2026-2027",
      programme: "Institution",
      regulation: "Institution",
      semester: "All",
      startDate: "2026-10-20",
      endDate: "2026-10-20",
      title: "Vijaya Dasami Holiday",
      description: "Festival holiday observation",
      category: "Holiday",
      workingDay: "No",
      holiday: "Yes",
      applicableTo: "All Students and Faculty",
      status: "Published",
      remarks: "Official Holiday"
    },
    {
      academicYear: "2026-2027",
      programme: "Institution",
      regulation: "Institution",
      semester: "All",
      startDate: "2026-11-06",
      endDate: "2026-11-06",
      title: "Deepavali Holiday",
      description: "Festival holiday observation",
      category: "Holiday",
      workingDay: "No",
      holiday: "Yes",
      applicableTo: "All Students and Faculty",
      status: "Published",
      remarks: "Official Holiday"
    },
    {
      academicYear: "2026-2027",
      programme: "Institution",
      regulation: "Institution",
      semester: "All",
      startDate: "2026-12-25",
      endDate: "2026-12-25",
      title: "Christmas Holiday",
      description: "Winter festival holiday observation",
      category: "Holiday",
      workingDay: "No",
      holiday: "Yes",
      applicableTo: "All Students and Faculty",
      status: "Published",
      remarks: "Official Holiday"
    },
    {
      academicYear: "2026-2027",
      programme: "Institution",
      regulation: "Institution",
      semester: "All",
      startDate: "2027-01-01",
      endDate: "2027-01-01",
      title: "New Year Holiday",
      description: "Calendar New Year Day celebration and holiday",
      category: "Holiday",
      workingDay: "No",
      holiday: "Yes",
      applicableTo: "All Students and Faculty",
      status: "Published",
      remarks: "Official Holiday"
    },
    {
      academicYear: "2026-2027",
      programme: "Institution",
      regulation: "Institution",
      semester: "All",
      startDate: "2027-01-13",
      endDate: "2027-01-15",
      title: "Pongal & Harvest Festival Holidays",
      description: "3-day regional cultural harvest festival holidays",
      category: "Holiday",
      workingDay: "No",
      holiday: "Yes",
      applicableTo: "All Students and Faculty",
      status: "Published",
      remarks: "Official Holiday"
    },
    {
      academicYear: "2026-2027",
      programme: "Institution",
      regulation: "Institution",
      semester: "All",
      startDate: "2027-01-22",
      endDate: "2027-01-22",
      title: "Orientation Programme for New Research Scholars",
      description: "Induction and registration briefing for newly admitted doctoral scholars",
      category: "Orientation",
      workingDay: "Yes",
      holiday: "No",
      applicableTo: "Doctoral Scholars & Research Guides",
      status: "Published",
      remarks: "IQAC Event"
    },
    {
      academicYear: "2026-2027",
      programme: "Institution",
      regulation: "Institution",
      semester: "All",
      startDate: "2027-01-26",
      endDate: "2027-01-26",
      title: "Republic Day Holiday",
      description: "National festival celebration with flag hoisting",
      category: "Holiday",
      workingDay: "No",
      holiday: "Yes",
      applicableTo: "All Students and Faculty",
      status: "Published",
      remarks: "National Holiday"
    },
    {
      academicYear: "2026-2027",
      programme: "Institution",
      regulation: "Institution",
      semester: "All",
      startDate: "2027-02-19",
      endDate: "2027-02-19",
      title: "Guest Lecture on Intellectual Property Rights",
      description: "Expert talk on patent filing, pharmaceutical copyrights and IP management",
      category: "Guest Lecture",
      workingDay: "Yes",
      holiday: "No",
      applicableTo: "PG Students and Faculty",
      status: "Published",
      remarks: "Research Cell Series"
    },
    {
      academicYear: "2026-2027",
      programme: "Institution",
      regulation: "Institution",
      semester: "All",
      startDate: "2027-03-05",
      endDate: "2027-03-05",
      title: "National Seminar on Quality by Design (QbD)",
      description: "1-day national level seminar highlighting QbD practices in modern pharma manufacturing",
      category: "Seminar",
      workingDay: "Yes",
      holiday: "No",
      applicableTo: "PG Scholars & Industrial Delegates",
      status: "Published",
      remarks: "Pharmaceutics Division"
    },
    {
      academicYear: "2026-2027",
      programme: "Institution",
      regulation: "Institution",
      semester: "All",
      startDate: "2027-03-12",
      endDate: "2027-03-12",
      title: "Skill Development Programme on Analytical Instruments",
      description: "Hands-on practical training with HPLC, UV-Vis, and FTIR instruments",
      category: "Workshop",
      workingDay: "Yes",
      holiday: "No",
      applicableTo: "Final Year Students",
      status: "Published",
      remarks: "Placement Training"
    },
    {
      academicYear: "2026-2027",
      programme: "Institution",
      regulation: "Institution",
      semester: "All",
      startDate: "2027-03-29",
      endDate: "2027-03-29",
      title: "Mahavir Jayanthi Holiday",
      description: "Religious holiday observation",
      category: "Holiday",
      workingDay: "No",
      holiday: "Yes",
      applicableTo: "All Students and Faculty",
      status: "Published",
      remarks: "Official Holiday"
    },
    {
      academicYear: "2026-2027",
      programme: "Institution",
      regulation: "Institution",
      semester: "All",
      startDate: "2027-04-02",
      endDate: "2027-04-02",
      title: "Good Friday Holiday",
      description: "Religious holiday observation",
      category: "Holiday",
      workingDay: "No",
      holiday: "Yes",
      applicableTo: "All Students and Faculty",
      status: "Published",
      remarks: "Official Holiday"
    },
    {
      academicYear: "2026-2027",
      programme: "Institution",
      regulation: "Institution",
      semester: "All",
      startDate: "2027-04-14",
      endDate: "2027-04-14",
      title: "Tamil New Year Holiday",
      description: "State traditional festival holiday observation",
      category: "Holiday",
      workingDay: "No",
      holiday: "Yes",
      applicableTo: "All Students and Faculty",
      status: "Published",
      remarks: "Official Holiday"
    },
    {
      academicYear: "2026-2027",
      programme: "Institution",
      regulation: "Institution",
      semester: "All",
      startDate: "2027-04-23",
      endDate: "2027-04-23",
      title: "Guest Lecture on Pharmacovigilance & Drug Safety",
      description: "Industrial guest speaker talking about pharmacovigilance databases and safety reporting",
      category: "Guest Lecture",
      workingDay: "Yes",
      holiday: "No",
      applicableTo: "B.Pharm and Pharm.D Students",
      status: "Published",
      remarks: "Placement Cell series"
    },
    {
      academicYear: "2026-2027",
      programme: "Institution",
      regulation: "Institution",
      semester: "All",
      startDate: "2027-05-01",
      endDate: "2027-05-01",
      title: "May Day Holiday",
      description: "International Labor Day observation",
      category: "Holiday",
      workingDay: "No",
      holiday: "Yes",
      applicableTo: "All Students and Faculty",
      status: "Published",
      remarks: "Official Holiday"
    },
    {
      academicYear: "2026-2027",
      programme: "Institution",
      regulation: "Institution",
      semester: "All",
      startDate: "2027-06-01",
      endDate: "2027-06-30",
      title: "Summer Vacation Period",
      description: "Official institutional summer vacation for students and faculty",
      category: "Vacation",
      workingDay: "No",
      holiday: "Yes",
      applicableTo: "All Students and Faculty",
      status: "Published",
      remarks: "Summer Break"
    },
    {
      academicYear: "2026-2027",
      programme: "Institution",
      regulation: "Institution",
      semester: "All",
      startDate: "2027-07-12",
      endDate: "2027-07-16",
      title: "FDP on Advances in Drug Delivery Systems",
      description: "5-day Faculty Development Programme focusing on modern nano-carriers and target systems",
      category: "FDP",
      workingDay: "Yes",
      holiday: "No",
      applicableTo: "All Faculty and PhD Scholars",
      status: "Published",
      remarks: "Organized by Pharmaceutics Division"
    },
    {
      academicYear: "2026-2027",
      programme: "Institution",
      regulation: "Institution",
      semester: "All",
      startDate: "2027-07-20",
      endDate: "2027-07-20",
      title: "Orientation for New Admissions batch (2027-2028)",
      description: "General orientation and induction for freshers of B.Pharm and Pharm.D",
      category: "Orientation",
      workingDay: "Yes",
      holiday: "No",
      applicableTo: "First Year Students and Parents",
      status: "Published",
      remarks: "Induction Week"
    },
    {
      academicYear: "2026-2027",
      programme: "Institution",
      regulation: "Institution",
      semester: "All",
      startDate: "2027-08-15",
      endDate: "2027-08-15",
      title: "Independence Day Holiday",
      description: "National festival holiday observation",
      category: "Holiday",
      workingDay: "No",
      holiday: "Yes",
      applicableTo: "All Students and Faculty",
      status: "Published",
      remarks: "National Holiday"
    },
    {
      academicYear: "2026-2027",
      programme: "Institution",
      regulation: "Institution",
      semester: "All",
      startDate: "2027-08-16",
      endDate: "2027-08-16",
      title: "Milad-Un-Nabi Holiday",
      description: "Religious holiday observation",
      category: "Holiday",
      workingDay: "No",
      holiday: "Yes",
      applicableTo: "All Students and Faculty",
      status: "Published",
      remarks: "Official Holiday"
    },
    {
      academicYear: "2026-2027",
      programme: "Institution",
      regulation: "Institution",
      semester: "All",
      startDate: "2027-08-20",
      endDate: "2027-08-20",
      title: "Guest Lecture on Career Avenues in Clinical Pharmacy",
      description: "Expert talk by overseas clinical pharmacy specialist on globally competitive avenues",
      category: "Guest Lecture",
      workingDay: "Yes",
      holiday: "No",
      applicableTo: "Pharm.D and B.Pharm Students",
      status: "Published",
      remarks: "Placement Cell series"
    },

    // ==========================================
    // B.PHARM SEMESTER I AUTHORITATIVE EVENTS
    // ==========================================
    {
      academicYear: "2026-2027",
      programme: "B.Pharm",
      regulation: "PCI 2017",
      semester: "Semester I",
      startDate: "2026-11-02",
      endDate: "2026-11-02",
      title: "I Sessional Practical Examination",
      description: "First Continuous Internal Assessment - Practical evaluations for Semester I B.Pharm",
      category: "Practical Examination",
      workingDay: "Yes",
      holiday: "No",
      applicableTo: "B.Pharm (Sem I) Students",
      status: "Published",
      remarks: "Internal Assessment",
      examCategory: "I Sessional / CIA",
      examType: "Practical",
      applicableSemesters: ["I"]
    },
    {
      academicYear: "2026-2027",
      programme: "B.Pharm",
      regulation: "PCI 2017",
      semester: "Semester I",
      startDate: "2026-11-10",
      endDate: "2026-11-10",
      title: "I Sessional Theory Examination",
      description: "First Continuous Internal Assessment - Theory evaluations for Semester I B.Pharm",
      category: "CIA / Sessional Examination",
      workingDay: "Yes",
      holiday: "No",
      applicableTo: "B.Pharm (Sem I) Students",
      status: "Published",
      remarks: "Internal Assessment",
      examCategory: "I Sessional / CIA",
      examType: "Theory",
      applicableSemesters: ["I"]
    },
    {
      academicYear: "2026-2027",
      programme: "B.Pharm",
      regulation: "PCI 2017",
      semester: "Semester I",
      startDate: "2027-01-05",
      endDate: "2027-01-05",
      title: "II Sessional Practical Examination",
      description: "Second Continuous Internal Assessment - Practical evaluations for Semester I B.Pharm",
      category: "Practical Examination",
      workingDay: "Yes",
      holiday: "No",
      applicableTo: "B.Pharm (Sem I) Students",
      status: "Published",
      remarks: "Internal Assessment",
      examCategory: "II Sessional / CIA",
      examType: "Practical",
      applicableSemesters: ["I"]
    },
    {
      academicYear: "2026-2027",
      programme: "B.Pharm",
      regulation: "PCI 2017",
      semester: "Semester I",
      startDate: "2027-01-18",
      endDate: "2027-01-18",
      title: "II Sessional Theory Examination",
      description: "Second Continuous Internal Assessment - Theory evaluations for Semester I B.Pharm",
      category: "CIA / Sessional Examination",
      workingDay: "Yes",
      holiday: "No",
      applicableTo: "B.Pharm (Sem I) Students",
      status: "Published",
      remarks: "Internal Assessment",
      examCategory: "II Sessional / CIA",
      examType: "Theory",
      applicableSemesters: ["I"]
    },
    {
      academicYear: "2026-2027",
      programme: "B.Pharm",
      regulation: "PCI 2017",
      semester: "Semester I",
      startDate: "2027-02-01",
      endDate: "2027-02-01",
      title: "End-Semester Practical Examination",
      description: "Semester practical examinations for Semester I B.Pharm",
      category: "Practical Examination",
      workingDay: "Yes",
      holiday: "No",
      applicableTo: "B.Pharm (Sem I) Students",
      status: "Published",
      remarks: "End Semester Exams",
      examCategory: "Semester Examination",
      examType: "Practical",
      applicableSemesters: ["I"]
    },
    {
      academicYear: "2026-2027",
      programme: "B.Pharm",
      regulation: "PCI 2017",
      semester: "Semester I",
      startDate: "2027-02-08",
      endDate: "2027-02-08",
      title: "End-Semester Theory Examination",
      description: "Semester theory examinations for Semester I B.Pharm",
      category: "University Examination",
      workingDay: "Yes",
      holiday: "No",
      applicableTo: "B.Pharm (Sem I) Students",
      status: "Published",
      remarks: "End Semester Exams",
      examCategory: "Semester Examination",
      examType: "Theory",
      applicableSemesters: ["I"]
    },
    {
      academicYear: "2026-2027",
      programme: "B.Pharm",
      regulation: "PCI 2017",
      semester: "Semester I",
      startDate: "2026-09-02",
      endDate: "2026-09-02",
      title: "Commencement of Classes",
      description: "Commencement of Classes for Semester I B.Pharm",
      category: "Academic Milestone",
      workingDay: "Yes",
      holiday: "No",
      applicableTo: "B.Pharm (Sem I) Students",
      status: "Published",
      remarks: "Milestone"
    },
    {
      academicYear: "2026-2027",
      programme: "B.Pharm",
      regulation: "PCI 2017",
      semester: "Semester I",
      startDate: "2027-02-01",
      endDate: "2027-02-01",
      title: "Semester Practical Examination Begins",
      description: "Practical examinations commencement",
      category: "Academic Milestone",
      workingDay: "Yes",
      holiday: "No",
      applicableTo: "B.Pharm (Sem I) Students",
      status: "Published",
      remarks: "Milestone"
    },
    {
      academicYear: "2026-2027",
      programme: "B.Pharm",
      regulation: "PCI 2017",
      semester: "Semester I",
      startDate: "2027-02-08",
      endDate: "2027-02-08",
      title: "Semester Theory Examination Begins",
      description: "Theory examinations commencement",
      category: "Academic Milestone",
      workingDay: "Yes",
      holiday: "No",
      applicableTo: "B.Pharm (Sem I) Students",
      status: "Published",
      remarks: "Milestone"
    },
    {
      academicYear: "2026-2027",
      programme: "B.Pharm",
      regulation: "PCI 2017",
      semester: "Semester I",
      startDate: "2027-02-17",
      endDate: "2027-02-17",
      title: "Semester End",
      description: "Closure of academic activities for Semester I B.Pharm",
      category: "Academic Milestone",
      workingDay: "Yes",
      holiday: "No",
      applicableTo: "B.Pharm (Sem I) Students",
      status: "Published",
      remarks: "Milestone"
    },

    // ==========================================
    // B.PHARM SEMESTERS III, V, VII (SHARED)
    // ==========================================
    {
      academicYear: "2026-2027",
      programme: "B.Pharm",
      regulation: "PCI 2017",
      semester: "Semester III",
      startDate: "2026-08-03",
      endDate: "2026-08-03",
      title: "I Sessional Practical Examination",
      description: "First Continuous Internal Assessment - Practical evaluations for Semesters III, V, VII B.Pharm",
      category: "Practical Examination",
      workingDay: "Yes",
      holiday: "No",
      applicableTo: "B.Pharm (Sem III, V, VII) Students",
      status: "Published",
      remarks: "Internal Assessment",
      examCategory: "I Sessional / CIA",
      examType: "Practical",
      applicableSemesters: ["III", "V", "VII"]
    },
    {
      academicYear: "2026-2027",
      programme: "B.Pharm",
      regulation: "PCI 2017",
      semester: "Semester III",
      startDate: "2026-08-10",
      endDate: "2026-08-10",
      title: "I Sessional Theory Examination",
      description: "First Continuous Internal Assessment - Theory evaluations for Semesters III, V, VII B.Pharm",
      category: "CIA / Sessional Examination",
      workingDay: "Yes",
      holiday: "No",
      applicableTo: "B.Pharm (Sem III, V, VII) Students",
      status: "Published",
      remarks: "Internal Assessment",
      examCategory: "I Sessional / CIA",
      examType: "Theory",
      applicableSemesters: ["III", "V", "VII"]
    },
    {
      academicYear: "2026-2027",
      programme: "B.Pharm",
      regulation: "PCI 2017",
      semester: "Semester III",
      startDate: "2026-10-05",
      endDate: "2026-10-05",
      title: "II Sessional Practical Examination",
      description: "Second Continuous Internal Assessment - Practical evaluations for Semesters III, V, VII B.Pharm",
      category: "Practical Examination",
      workingDay: "Yes",
      holiday: "No",
      applicableTo: "B.Pharm (Sem III, V, VII) Students",
      status: "Published",
      remarks: "Internal Assessment",
      examCategory: "II Sessional / CIA",
      examType: "Practical",
      applicableSemesters: ["III", "V", "VII"]
    },
    {
      academicYear: "2026-2027",
      programme: "B.Pharm",
      regulation: "PCI 2017",
      semester: "Semester III",
      startDate: "2026-10-12",
      endDate: "2026-10-12",
      title: "II Sessional Theory Examination",
      description: "Second Continuous Internal Assessment - Theory evaluations for Semesters III, V, VII B.Pharm",
      category: "CIA / Sessional Examination",
      workingDay: "Yes",
      holiday: "No",
      applicableTo: "B.Pharm (Sem III, V, VII) Students",
      status: "Published",
      remarks: "Internal Assessment",
      examCategory: "II Sessional / CIA",
      examType: "Theory",
      applicableSemesters: ["III", "V", "VII"]
    },
    {
      academicYear: "2026-2027",
      programme: "B.Pharm",
      regulation: "PCI 2017",
      semester: "Semester III",
      startDate: "2026-10-26",
      endDate: "2026-10-26",
      title: "End-Semester Practical Examination",
      description: "Semester practical examinations for Semesters III, V, VII B.Pharm",
      category: "Practical Examination",
      workingDay: "Yes",
      holiday: "No",
      applicableTo: "B.Pharm (Sem III, V, VII) Students",
      status: "Published",
      remarks: "End Semester Exams",
      examCategory: "Semester Examination",
      examType: "Practical",
      applicableSemesters: ["III", "V", "VII"]
    },
    {
      academicYear: "2026-2027",
      programme: "B.Pharm",
      regulation: "PCI 2017",
      semester: "Semester III",
      startDate: "2026-11-02",
      endDate: "2026-11-02",
      title: "End-Semester Theory Examination",
      description: "Semester theory examinations for Semesters III, V, VII B.Pharm",
      category: "University Examination",
      workingDay: "Yes",
      holiday: "No",
      applicableTo: "B.Pharm (Sem III, V, VII) Students",
      status: "Published",
      remarks: "End Semester Exams",
      examCategory: "Semester Examination",
      examType: "Theory",
      applicableSemesters: ["III", "V", "VII"]
    },
    {
      academicYear: "2026-2027",
      programme: "B.Pharm",
      regulation: "PCI 2017",
      semester: "Semester III",
      startDate: "2026-06-15",
      endDate: "2026-06-15",
      title: "Commencement of Classes",
      description: "Commencement of Classes for Semester III, V, VII B.Pharm",
      category: "Academic Milestone",
      workingDay: "Yes",
      holiday: "No",
      applicableTo: "B.Pharm (Sem III, V, VII) Students",
      status: "Published",
      remarks: "Milestone",
      applicableSemesters: ["III", "V", "VII"]
    },
    {
      academicYear: "2026-2027",
      programme: "B.Pharm",
      regulation: "PCI 2017",
      semester: "Semester III",
      startDate: "2026-10-26",
      endDate: "2026-10-26",
      title: "Semester Practical Examination Begins",
      description: "Semester Practical examinations commencement",
      category: "Academic Milestone",
      workingDay: "Yes",
      holiday: "No",
      applicableTo: "B.Pharm (Sem III, V, VII) Students",
      status: "Published",
      remarks: "Milestone",
      applicableSemesters: ["III", "V", "VII"]
    },
    {
      academicYear: "2026-2027",
      programme: "B.Pharm",
      regulation: "PCI 2017",
      semester: "Semester III",
      startDate: "2026-11-02",
      endDate: "2026-11-02",
      title: "Semester Theory Examination Begins",
      description: "Semester Theory examinations commencement",
      category: "Academic Milestone",
      workingDay: "Yes",
      holiday: "No",
      applicableTo: "B.Pharm (Sem III, V, VII) Students",
      status: "Published",
      remarks: "Milestone",
      applicableSemesters: ["III", "V", "VII"]
    },
    {
      academicYear: "2026-2027",
      programme: "B.Pharm",
      regulation: "PCI 2017",
      semester: "Semester III",
      startDate: "2026-11-13",
      endDate: "2026-11-13",
      title: "Semester End",
      description: "Closure of academic activities for Semester III, V, VII B.Pharm",
      category: "Academic Milestone",
      workingDay: "Yes",
      holiday: "No",
      applicableTo: "B.Pharm (Sem III, V, VII) Students",
      status: "Published",
      remarks: "Milestone",
      applicableSemesters: ["III", "V", "VII"]
    },

    // ==========================================
    // B.PHARM SEMESTER IV AUTHORITATIVE EVENTS
    // ==========================================
    {
      academicYear: "2026-2027",
      programme: "B.Pharm",
      regulation: "PCI 2017",
      semester: "Semester IV",
      startDate: "2027-04-29",
      endDate: "2027-04-29",
      title: "I Sessional Practical Examination",
      description: "First Continuous Internal Assessment - Practical evaluations for Semester IV B.Pharm",
      category: "Practical Examination",
      workingDay: "Yes",
      holiday: "No",
      applicableTo: "B.Pharm (Sem IV) Students",
      status: "Published",
      remarks: "Internal Assessment",
      examCategory: "I Sessional / CIA",
      examType: "Practical",
      applicableSemesters: ["IV"]
    },
    {
      academicYear: "2026-2027",
      programme: "B.Pharm",
      regulation: "PCI 2017",
      semester: "Semester IV",
      startDate: "2027-05-07",
      endDate: "2027-05-07",
      title: "I Sessional Theory Examination",
      description: "First Continuous Internal Assessment - Theory evaluations for Semester IV B.Pharm",
      category: "CIA / Sessional Examination",
      workingDay: "Yes",
      holiday: "No",
      applicableTo: "B.Pharm (Sem IV) Students",
      status: "Published",
      remarks: "Internal Assessment",
      examCategory: "I Sessional / CIA",
      examType: "Theory",
      applicableSemesters: ["IV"]
    },
    {
      academicYear: "2026-2027",
      programme: "B.Pharm",
      regulation: "PCI 2017",
      semester: "Semester IV",
      startDate: "2027-07-12",
      endDate: "2027-07-12",
      title: "II Sessional Practical Examination",
      description: "Second Continuous Internal Assessment - Practical evaluations for Semester IV B.Pharm",
      category: "Practical Examination",
      workingDay: "Yes",
      holiday: "No",
      applicableTo: "B.Pharm (Sem IV) Students",
      status: "Published",
      remarks: "Internal Assessment",
      examCategory: "II Sessional / CIA",
      examType: "Practical",
      applicableSemesters: ["IV"]
    },
    {
      academicYear: "2026-2027",
      programme: "B.Pharm",
      regulation: "PCI 2017",
      semester: "Semester IV",
      startDate: "2027-07-20",
      endDate: "2027-07-20",
      title: "II Sessional Theory Examination",
      description: "Second Continuous Internal Assessment - Theory evaluations for Semester IV B.Pharm",
      category: "CIA / Sessional Examination",
      workingDay: "Yes",
      holiday: "No",
      applicableTo: "B.Pharm (Sem IV) Students",
      status: "Published",
      remarks: "Internal Assessment",
      examCategory: "II Sessional / CIA",
      examType: "Theory",
      applicableSemesters: ["IV"]
    },
    {
      academicYear: "2026-2027",
      programme: "B.Pharm",
      regulation: "PCI 2017",
      semester: "Semester IV",
      startDate: "2027-08-02",
      endDate: "2027-08-02",
      title: "End-Semester Practical Examination",
      description: "Semester practical examinations for Semester IV B.Pharm",
      category: "Practical Examination",
      workingDay: "Yes",
      holiday: "No",
      applicableTo: "B.Pharm (Sem IV) Students",
      status: "Published",
      remarks: "End Semester Exams",
      examCategory: "Semester Examination",
      examType: "Practical",
      applicableSemesters: ["IV"]
    },
    {
      academicYear: "2026-2027",
      programme: "B.Pharm",
      regulation: "PCI 2017",
      semester: "Semester IV",
      startDate: "2027-08-09",
      endDate: "2027-08-09",
      title: "End-Semester Theory Examination",
      description: "Semester theory examinations for Semester IV B.Pharm",
      category: "University Examination",
      workingDay: "Yes",
      holiday: "No",
      applicableTo: "B.Pharm (Sem IV) Students",
      status: "Published",
      remarks: "End Semester Exams",
      examCategory: "Semester Examination",
      examType: "Theory",
      applicableSemesters: ["IV"]
    },
    {
      academicYear: "2026-2027",
      programme: "B.Pharm",
      regulation: "PCI 2017",
      semester: "Semester IV",
      startDate: "2027-03-01",
      endDate: "2027-03-01",
      title: "Commencement of Classes",
      description: "Commencement of Classes for Semester IV B.Pharm",
      category: "Academic Milestone",
      workingDay: "Yes",
      holiday: "No",
      applicableTo: "B.Pharm (Sem IV) Students",
      status: "Published",
      remarks: "Milestone"
    },
    {
      academicYear: "2026-2027",
      programme: "B.Pharm",
      regulation: "PCI 2017",
      semester: "Semester IV",
      startDate: "2027-08-02",
      endDate: "2027-08-02",
      title: "Semester Practical Examination Begins",
      description: "Semester Practical examinations commencement",
      category: "Academic Milestone",
      workingDay: "Yes",
      holiday: "No",
      applicableTo: "B.Pharm (Sem IV) Students",
      status: "Published",
      remarks: "Milestone"
    },
    {
      academicYear: "2026-2027",
      programme: "B.Pharm",
      regulation: "PCI 2017",
      semester: "Semester IV",
      startDate: "2027-08-09",
      endDate: "2027-08-09",
      title: "Semester Theory Examination Begins",
      description: "Semester Theory examinations commencement",
      category: "Academic Milestone",
      workingDay: "Yes",
      holiday: "No",
      applicableTo: "B.Pharm (Sem IV) Students",
      status: "Published",
      remarks: "Milestone"
    },
    {
      academicYear: "2026-2027",
      programme: "B.Pharm",
      regulation: "PCI 2017",
      semester: "Semester IV",
      startDate: "2027-08-20",
      endDate: "2027-08-20",
      title: "Semester End",
      description: "Closure of academic activities for Semester IV B.Pharm",
      category: "Academic Milestone",
      workingDay: "Yes",
      holiday: "No",
      applicableTo: "B.Pharm (Sem IV) Students",
      status: "Published",
      remarks: "Milestone"
    },

    // ==========================================
    // B.PHARM SEMESTERS VI, VIII (SHARED)
    // ==========================================
    {
      academicYear: "2026-2027",
      programme: "B.Pharm",
      regulation: "PCI 2017",
      semester: "Semester VI",
      startDate: "2027-01-18",
      endDate: "2027-01-18",
      title: "I Sessional Practical Examination",
      description: "First Continuous Internal Assessment - Practical evaluations for Semester VI, VIII B.Pharm",
      category: "Practical Examination",
      workingDay: "Yes",
      holiday: "No",
      applicableTo: "B.Pharm (Sem VI, VIII) Students",
      status: "Published",
      remarks: "Internal Assessment",
      examCategory: "I Sessional / CIA",
      examType: "Practical",
      applicableSemesters: ["VI", "VIII"]
    },
    {
      academicYear: "2026-2027",
      programme: "B.Pharm",
      regulation: "PCI 2017",
      semester: "Semester VI",
      startDate: "2027-01-25",
      endDate: "2027-01-25",
      title: "I Sessional Theory Examination",
      description: "First Continuous Internal Assessment - Theory evaluations for Semester VI, VIII B.Pharm",
      category: "CIA / Sessional Examination",
      workingDay: "Yes",
      holiday: "No",
      applicableTo: "B.Pharm (Sem VI, VIII) Students",
      status: "Published",
      remarks: "Internal Assessment",
      examCategory: "I Sessional / CIA",
      examType: "Theory",
      applicableSemesters: ["VI", "VIII"]
    },
    {
      academicYear: "2026-2027",
      programme: "B.Pharm",
      regulation: "PCI 2017",
      semester: "Semester VI",
      startDate: "2027-03-22",
      endDate: "2027-03-22",
      title: "II Sessional Practical Examination",
      description: "Second Continuous Internal Assessment - Practical evaluations for Semester VI, VIII B.Pharm",
      category: "Practical Examination",
      workingDay: "Yes",
      holiday: "No",
      applicableTo: "B.Pharm (Sem VI, VIII) Students",
      status: "Published",
      remarks: "Internal Assessment",
      examCategory: "II Sessional / CIA",
      examType: "Practical",
      applicableSemesters: ["VI", "VIII"]
    },
    {
      academicYear: "2026-2027",
      programme: "B.Pharm",
      regulation: "PCI 2017",
      semester: "Semester VI",
      startDate: "2027-03-29",
      endDate: "2027-03-29",
      title: "II Sessional Theory Examination",
      description: "Second Continuous Internal Assessment - Theory evaluations for Semester VI, VIII B.Pharm",
      category: "CIA / Sessional Examination",
      workingDay: "Yes",
      holiday: "No",
      applicableTo: "B.Pharm (Sem VI, VIII) Students",
      status: "Published",
      remarks: "Internal Assessment",
      examCategory: "II Sessional / CIA",
      examType: "Theory",
      applicableSemesters: ["VI", "VIII"]
    },
    {
      academicYear: "2026-2027",
      programme: "B.Pharm",
      regulation: "PCI 2017",
      semester: "Semester VI",
      startDate: "2027-04-19",
      endDate: "2027-04-19",
      title: "End-Semester Practical Examination",
      description: "Semester practical examinations for Semester VI, VIII B.Pharm",
      category: "Practical Examination",
      workingDay: "Yes",
      holiday: "No",
      applicableTo: "B.Pharm (Sem VI, VIII) Students",
      status: "Published",
      remarks: "End Semester Exams",
      examCategory: "Semester Examination",
      examType: "Practical",
      applicableSemesters: ["VI", "VIII"]
    },
    {
      academicYear: "2026-2027",
      programme: "B.Pharm",
      regulation: "PCI 2017",
      semester: "Semester VI",
      startDate: "2027-04-26",
      endDate: "2027-04-26",
      title: "End-Semester Theory Examination",
      description: "Semester theory examinations for Semester VI, VIII B.Pharm",
      category: "University Examination",
      workingDay: "Yes",
      holiday: "No",
      applicableTo: "B.Pharm (Sem VI, VIII) Students",
      status: "Published",
      remarks: "End Semester Exams",
      examCategory: "Semester Examination",
      examType: "Theory",
      applicableSemesters: ["VI", "VIII"]
    },
    {
      academicYear: "2026-2027",
      programme: "B.Pharm",
      regulation: "PCI 2017",
      semester: "Semester VI",
      startDate: "2026-11-16",
      endDate: "2026-11-16",
      title: "Commencement of Classes",
      description: "Commencement of Classes for Semester VI, VIII B.Pharm",
      category: "Academic Milestone",
      workingDay: "Yes",
      holiday: "No",
      applicableTo: "B.Pharm (Sem VI, VIII) Students",
      status: "Published",
      remarks: "Milestone",
      applicableSemesters: ["VI", "VIII"]
    },
    {
      academicYear: "2026-2027",
      programme: "B.Pharm",
      regulation: "PCI 2017",
      semester: "Semester VI",
      startDate: "2027-04-19",
      endDate: "2027-04-19",
      title: "Semester Practical Examination Begins",
      description: "Semester Practical examinations commencement",
      category: "Academic Milestone",
      workingDay: "Yes",
      holiday: "No",
      applicableTo: "B.Pharm (Sem VI, VIII) Students",
      status: "Published",
      remarks: "Milestone",
      applicableSemesters: ["VI", "VIII"]
    },
    {
      academicYear: "2026-2027",
      programme: "B.Pharm",
      regulation: "PCI 2017",
      semester: "Semester VI",
      startDate: "2027-04-26",
      endDate: "2027-04-26",
      title: "Semester Theory Examination Begins",
      description: "Semester Theory examinations commencement",
      category: "Academic Milestone",
      workingDay: "Yes",
      holiday: "No",
      applicableTo: "B.Pharm (Sem VI, VIII) Students",
      status: "Published",
      remarks: "Milestone",
      applicableSemesters: ["VI", "VIII"]
    },
    {
      academicYear: "2026-2027",
      programme: "B.Pharm",
      regulation: "PCI 2017",
      semester: "Semester VI",
      startDate: "2027-05-07",
      endDate: "2027-05-07",
      title: "Semester End",
      description: "Closure of academic activities for Semester VI, VIII B.Pharm",
      category: "Academic Milestone",
      workingDay: "Yes",
      holiday: "No",
      applicableTo: "B.Pharm (Sem VI, VIII) Students",
      status: "Published",
      remarks: "Milestone",
      applicableSemesters: ["VI", "VIII"]
    },

    // ==========================================
    // PHARM.D YEAR I AUTHORITATIVE EVENTS
    // ==========================================
    {
      academicYear: "2026-2027",
      programme: "Pharm.D",
      regulation: "PCI 2008",
      semester: "Year I",
      startDate: "2026-11-30",
      endDate: "2026-11-30",
      title: "I Sessional Practical Examination",
      description: "First Continuous Internal Assessment - Practical evaluations for Year I Pharm.D",
      category: "Practical Examination",
      workingDay: "Yes",
      holiday: "No",
      applicableTo: "Pharm.D (Yr I) Students",
      status: "Published",
      remarks: "Internal Assessment",
      examCategory: "I Sessional / CIA",
      examType: "Practical",
      applicableYears: ["I"]
    },
    {
      academicYear: "2026-2027",
      programme: "Pharm.D",
      regulation: "PCI 2008",
      semester: "Year I",
      startDate: "2026-12-07",
      endDate: "2026-12-07",
      title: "I Sessional Theory Examination",
      description: "First Continuous Internal Assessment - Theory evaluations for Year I Pharm.D",
      category: "CIA / Sessional Examination",
      workingDay: "Yes",
      holiday: "No",
      applicableTo: "Pharm.D (Yr I) Students",
      status: "Published",
      remarks: "Internal Assessment",
      examCategory: "I Sessional / CIA",
      examType: "Theory",
      applicableYears: ["I"]
    },
    {
      academicYear: "2026-2027",
      programme: "Pharm.D",
      regulation: "PCI 2008",
      semester: "Year I",
      startDate: "2027-03-08",
      endDate: "2027-03-08",
      title: "II Sessional Practical Examination",
      description: "Second Continuous Internal Assessment - Practical evaluations for Year I Pharm.D",
      category: "Practical Examination",
      workingDay: "Yes",
      holiday: "No",
      applicableTo: "Pharm.D (Yr I) Students",
      status: "Published",
      remarks: "Internal Assessment",
      examCategory: "II Sessional / CIA",
      examType: "Practical",
      applicableYears: ["I"]
    },
    {
      academicYear: "2026-2027",
      programme: "Pharm.D",
      regulation: "PCI 2008",
      semester: "Year I",
      startDate: "2027-03-17",
      endDate: "2027-03-17",
      title: "II Sessional Theory Examination",
      description: "Second Continuous Internal Assessment - Theory evaluations for Year I Pharm.D",
      category: "CIA / Sessional Examination",
      workingDay: "Yes",
      holiday: "No",
      applicableTo: "Pharm.D (Yr I) Students",
      status: "Published",
      remarks: "Internal Assessment",
      examCategory: "II Sessional / CIA",
      examType: "Theory",
      applicableYears: ["I"]
    },
    {
      academicYear: "2026-2027",
      programme: "Pharm.D",
      regulation: "PCI 2008",
      semester: "Year I",
      startDate: "2027-07-12",
      endDate: "2027-07-12",
      title: "III Sessional Practical Examination",
      description: "Third Continuous Internal Assessment - Practical evaluations for Year I Pharm.D",
      category: "Practical Examination",
      workingDay: "Yes",
      holiday: "No",
      applicableTo: "Pharm.D (Yr I) Students",
      status: "Published",
      remarks: "Internal Assessment",
      examCategory: "III Sessional / CIA",
      examType: "Practical",
      applicableYears: ["I"]
    },
    {
      academicYear: "2026-2027",
      programme: "Pharm.D",
      regulation: "PCI 2008",
      semester: "Year I",
      startDate: "2027-07-20",
      endDate: "2027-07-20",
      title: "III Sessional Theory Examination",
      description: "Third Continuous Internal Assessment - Theory evaluations for Year I Pharm.D",
      category: "CIA / Sessional Examination",
      workingDay: "Yes",
      holiday: "No",
      applicableTo: "Pharm.D (Yr I) Students",
      status: "Published",
      remarks: "Internal Assessment",
      examCategory: "III Sessional / CIA",
      examType: "Theory",
      applicableYears: ["I"]
    },
    {
      academicYear: "2026-2027",
      programme: "Pharm.D",
      regulation: "PCI 2008",
      semester: "Year I",
      startDate: "2027-08-09",
      endDate: "2027-08-09",
      title: "Annual University Theory Examination",
      description: "Official end-of-year comprehensive university theory examinations for Pharm.D Year I",
      category: "University Examination",
      workingDay: "No",
      holiday: "No",
      applicableTo: "Pharm.D (Yr I) Students",
      status: "Published",
      remarks: "Final University Exams",
      examCategory: "University Examination",
      examType: "Theory",
      applicableYears: ["I"]
    },
    {
      academicYear: "2026-2027",
      programme: "Pharm.D",
      regulation: "PCI 2008",
      semester: "Year I",
      startDate: "2027-08-23",
      endDate: "2027-08-23",
      title: "Annual University Practical Examination",
      description: "Official end-of-year comprehensive university practical examinations for Pharm.D Year I",
      category: "Practical Examination",
      workingDay: "No",
      holiday: "No",
      applicableTo: "Pharm.D (Yr I) Students",
      status: "Published",
      remarks: "Final University Exams",
      examCategory: "University Examination",
      examType: "Practical",
      applicableYears: ["I"]
    },
    {
      academicYear: "2026-2027",
      programme: "Pharm.D",
      regulation: "PCI 2008",
      semester: "Year I",
      startDate: "2026-09-02",
      endDate: "2026-09-02",
      title: "Academic Year Commences",
      description: "Orientation & Commences of Classes",
      category: "Academic Milestone",
      workingDay: "Yes",
      holiday: "No",
      applicableTo: "Pharm.D (Yr I) Students",
      status: "Published",
      remarks: "Milestone"
    },
    {
      academicYear: "2026-2027",
      programme: "Pharm.D",
      regulation: "PCI 2008",
      semester: "Year I",
      startDate: "2027-08-09",
      endDate: "2027-08-09",
      title: "University Theory Examination Begins",
      description: "University Theory examinations commencement",
      category: "Academic Milestone",
      workingDay: "Yes",
      holiday: "No",
      applicableTo: "Pharm.D (Yr I) Students",
      status: "Published",
      remarks: "Milestone"
    },
    {
      academicYear: "2026-2027",
      programme: "Pharm.D",
      regulation: "PCI 2008",
      semester: "Year I",
      startDate: "2027-08-23",
      endDate: "2027-08-23",
      title: "University Practical Examination Begins",
      description: "University Practical examinations commencement",
      category: "Academic Milestone",
      workingDay: "Yes",
      holiday: "No",
      applicableTo: "Pharm.D (Yr I) Students",
      status: "Published",
      remarks: "Milestone"
    },
    {
      academicYear: "2026-2027",
      programme: "Pharm.D",
      regulation: "PCI 2008",
      semester: "Year I",
      startDate: "2027-08-27",
      endDate: "2027-08-27",
      title: "Academic Year Ends",
      description: "Closure of academic activities for Year I Pharm.D",
      category: "Academic Milestone",
      workingDay: "Yes",
      holiday: "No",
      applicableTo: "Pharm.D (Yr I) Students",
      status: "Published",
      remarks: "Milestone"
    },

    // ==========================================
    // PHARM.D YEARS II, III, IV, V (SHARED)
    // ==========================================
    {
      academicYear: "2026-2027",
      programme: "Pharm.D",
      regulation: "PCI 2008",
      semester: "Year II",
      startDate: "2026-08-31",
      endDate: "2026-08-31",
      title: "I Sessional Practical Examination",
      description: "First Continuous Internal Assessment - Practical evaluations for Year II, III, IV, V Pharm.D",
      category: "Practical Examination",
      workingDay: "Yes",
      holiday: "No",
      applicableTo: "Pharm.D (Yr II, III, IV, V) Students",
      status: "Published",
      remarks: "Internal Assessment",
      examCategory: "I Sessional / CIA",
      examType: "Practical",
      applicableYears: ["II", "III", "IV", "V"]
    },
    {
      academicYear: "2026-2027",
      programme: "Pharm.D",
      regulation: "PCI 2008",
      semester: "Year II",
      startDate: "2026-09-07",
      endDate: "2026-09-07",
      title: "I Sessional Theory Examination",
      description: "First Continuous Internal Assessment - Theory evaluations for Year II, III, IV, V Pharm.D",
      category: "CIA / Sessional Examination",
      workingDay: "Yes",
      holiday: "No",
      applicableTo: "Pharm.D (Yr II, III, IV, V) Students",
      status: "Published",
      remarks: "Internal Assessment",
      examCategory: "I Sessional / CIA",
      examType: "Theory",
      applicableYears: ["II", "III", "IV", "V"]
    },
    {
      academicYear: "2026-2027",
      programme: "Pharm.D",
      regulation: "PCI 2008",
      semester: "Year II",
      startDate: "2026-11-30",
      endDate: "2026-11-30",
      title: "II Sessional Practical Examination",
      description: "Second Continuous Internal Assessment - Practical evaluations for Year II, III, IV, V Pharm.D",
      category: "Practical Examination",
      workingDay: "Yes",
      holiday: "No",
      applicableTo: "Pharm.D (Yr II, III, IV, V) Students",
      status: "Published",
      remarks: "Internal Assessment",
      examCategory: "II Sessional / CIA",
      examType: "Practical",
      applicableYears: ["II", "III", "IV", "V"]
    },
    {
      academicYear: "2026-2027",
      programme: "Pharm.D",
      regulation: "PCI 2008",
      semester: "Year II",
      startDate: "2026-12-07",
      endDate: "2026-12-07",
      title: "II Sessional Theory Examination",
      description: "Second Continuous Internal Assessment - Theory evaluations for Year II, III, IV, V Pharm.D",
      category: "CIA / Sessional Examination",
      workingDay: "Yes",
      holiday: "No",
      applicableTo: "Pharm.D (Yr II, III, IV, V) Students",
      status: "Published",
      remarks: "Internal Assessment",
      examCategory: "II Sessional / CIA",
      examType: "Theory",
      applicableYears: ["II", "III", "IV", "V"]
    },
    {
      academicYear: "2026-2027",
      programme: "Pharm.D",
      regulation: "PCI 2008",
      semester: "Year II",
      startDate: "2027-03-08",
      endDate: "2027-03-08",
      title: "III Sessional Practical Examination",
      description: "Third Continuous Internal Assessment - Practical evaluations for Year II, III, IV, V Pharm.D",
      category: "Practical Examination",
      workingDay: "Yes",
      holiday: "No",
      applicableTo: "Pharm.D (Yr II, III, IV, V) Students",
      status: "Published",
      remarks: "Internal Assessment",
      examCategory: "III Sessional / CIA",
      examType: "Practical",
      applicableYears: ["II", "III", "IV", "V"]
    },
    {
      academicYear: "2026-2027",
      programme: "Pharm.D",
      regulation: "PCI 2008",
      semester: "Year II",
      startDate: "2027-03-15",
      endDate: "2027-03-15",
      title: "III Sessional Theory Examination",
      description: "Third Continuous Internal Assessment - Theory evaluations for Year II, III, IV, V Pharm.D",
      category: "CIA / Sessional Examination",
      workingDay: "Yes",
      holiday: "No",
      applicableTo: "Pharm.D (Yr II, III, IV, V) Students",
      status: "Published",
      remarks: "Internal Assessment",
      examCategory: "III Sessional / CIA",
      examType: "Theory",
      applicableYears: ["II", "III", "IV", "V"]
    },
    {
      academicYear: "2026-2027",
      programme: "Pharm.D",
      regulation: "PCI 2008",
      semester: "Year II",
      startDate: "2027-04-19",
      endDate: "2027-04-19",
      title: "Annual University Theory Examination",
      description: "Official end-of-year comprehensive university theory examinations for Pharm.D Year II, III, IV, V",
      category: "University Examination",
      workingDay: "No",
      holiday: "No",
      applicableTo: "Pharm.D (Yr II, III, IV, V) Students",
      status: "Published",
      remarks: "Final University Exams",
      examCategory: "University Examination",
      examType: "Theory",
      applicableYears: ["II", "III", "IV", "V"]
    },
    {
      academicYear: "2026-2027",
      programme: "Pharm.D",
      regulation: "PCI 2008",
      semester: "Year II",
      startDate: "2027-05-03",
      endDate: "2027-05-03",
      title: "Annual University Practical Examination",
      description: "Official end-of-year comprehensive university practical examinations for Pharm.D Year II, III, IV, V",
      category: "Practical Examination",
      workingDay: "No",
      holiday: "No",
      applicableTo: "Pharm.D (Yr II, III, IV, V) Students",
      status: "Published",
      remarks: "Final University Exams",
      examCategory: "University Examination",
      examType: "Practical",
      applicableYears: ["II", "III", "IV", "V"]
    },
    {
      academicYear: "2026-2027",
      programme: "Pharm.D",
      regulation: "PCI 2008",
      semester: "Year II",
      startDate: "2026-06-15",
      endDate: "2026-06-15",
      title: "Academic Year Commences",
      description: "Academic year commenced for Year II, III, IV, V Pharm.D",
      category: "Academic Milestone",
      workingDay: "Yes",
      holiday: "No",
      applicableTo: "Pharm.D (Yr II, III, IV, V) Students",
      status: "Published",
      remarks: "Milestone",
      applicableYears: ["II", "III", "IV", "V"]
    },
    {
      academicYear: "2026-2027",
      programme: "Pharm.D",
      regulation: "PCI 2008",
      semester: "Year II",
      startDate: "2027-04-19",
      endDate: "2027-04-19",
      title: "University Theory Examination Begins",
      description: "University Theory examinations commencement",
      category: "Academic Milestone",
      workingDay: "Yes",
      holiday: "No",
      applicableTo: "Pharm.D (Yr II, III, IV, V) Students",
      status: "Published",
      remarks: "Milestone",
      applicableYears: ["II", "III", "IV", "V"]
    },
    {
      academicYear: "2026-2027",
      programme: "Pharm.D",
      regulation: "PCI 2008",
      semester: "Year II",
      startDate: "2027-05-03",
      endDate: "2027-05-03",
      title: "University Practical Examination Begins",
      description: "University Practical examinations commencement",
      category: "Academic Milestone",
      workingDay: "Yes",
      holiday: "No",
      applicableTo: "Pharm.D (Yr II, III, IV, V) Students",
      status: "Published",
      remarks: "Milestone",
      applicableYears: ["II", "III", "IV", "V"]
    },
    {
      academicYear: "2026-2027",
      programme: "Pharm.D",
      regulation: "PCI 2008",
      semester: "Year II",
      startDate: "2027-05-07",
      endDate: "2027-05-07",
      title: "Academic Year Ends",
      description: "Closure of academic activities for Year II, III, IV, V Pharm.D",
      category: "Academic Milestone",
      workingDay: "Yes",
      holiday: "No",
      applicableTo: "Pharm.D (Yr II, III, IV, V) Students",
      status: "Published",
      remarks: "Milestone",
      applicableYears: ["II", "III", "IV", "V"]
    }
  ];

  // Filter out all previous sessional/exam events to avoid duplicates or incorrect dates
  const filtered = originalEvents.filter(evt => {
    const category = (evt.category || '').toLowerCase();
    const title = (evt.title || '').toLowerCase();
    const examCat = (evt.examCategory || '').toLowerCase();
    const isExam = (
      category.includes('exam') || 
      category.includes('cia') || 
      category.includes('sessional') ||
      title.includes('exam') ||
      title.includes('cia') ||
      title.includes('sessional') ||
      title.includes('test')
    );
    return !(
      isExam || 
      examCat.includes('sessional') ||
      examCat.includes('examination')
    );
  });

  return [...filtered, ...getCorrectExamEvents()];
}

// Unused legacy function to safely consume remaining original block and keep syntax completely valid
function getLegacySeededEvents_unreachable(): any[] {
  return [
    {
      academicYear: "2026-2027",
      programme: "Institution",
      regulation: "Institution",
      semester: "All",
      startDate: "2026-06-26",
      endDate: "2026-06-26",
      title: "Moharram Holiday",
      description: "State government official holiday",
      category: "Holiday",
      workingDay: "No",
      holiday: "Yes",
      applicableTo: "All Students and Faculty",
      status: "Published",
      remarks: "Official Holiday"
    },
    {
      academicYear: "2026-2027",
      programme: "B.Pharm",
      regulation: "PCI 2017",
      semester: "Semester V",
      startDate: "2026-06-15",
      endDate: "2026-06-15",
      title: "Commencement of Classes (Sem III, V, VII B.Pharm & M.Pharm)",
      description: "Academic sessions begin for odd semesters B.Pharm and M.Pharm, and even years of Pharm.D",
      category: "Academic Milestone",
      workingDay: "Yes",
      holiday: "No",
      applicableTo: "B.Pharm (Sem III,V,VII), M.Pharm (Sem III), Pharm.D (Yr II-VI)",
      status: "Published",
      remarks: "First Working Day"
    },
    {
      academicYear: "2026-2027",
      programme: "B.Pharm",
      regulation: "PCI 2017",
      semester: "Semester V",
      startDate: "2026-06-19",
      endDate: "2026-06-19",
      title: "Alumni Lecture 01",
      description: "Guest lecture by SRM Alumnus on modern pharmaceutical trends",
      category: "Guest Lecture",
      workingDay: "Yes",
      holiday: "No",
      applicableTo: "All B.Pharm and Pharm.D Students",
      status: "Published",
      remarks: "Placement Cell Series"
    },
    {
      academicYear: "2026-2027",
      programme: "Institution",
      regulation: "Institution",
      semester: "All",
      startDate: "2026-06-21",
      endDate: "2026-06-21",
      title: "International Yoga Day Celebration",
      description: "Institutional yoga awareness and wellness practice sessions",
      category: "General Academic Event",
      workingDay: "Yes",
      holiday: "No",
      applicableTo: "All Students and Faculty",
      status: "Published",
      remarks: "Yoga Club Event"
    },
    {
      academicYear: "2026-2027",
      programme: "Institution",
      regulation: "Institution",
      semester: "All",
      startDate: "2026-07-15",
      endDate: "2026-07-15",
      title: "Orientation Programme for New Batch",
      description: "Academic orientation and welcome session for Semester I B.Pharm and Pharm.D students",
      category: "Orientation",
      workingDay: "Yes",
      holiday: "No",
      applicableTo: "Semester I B.Pharm & Pharm.D Students",
      status: "Published",
      remarks: "IQAC Orientation"
    },
    {
      academicYear: "2026-2027",
      programme: "Institution",
      regulation: "Institution",
      semester: "All",
      startDate: "2026-07-20",
      endDate: "2026-07-24",
      title: "FDP on Mental Health & Wellness",
      description: "5-day National level Faculty Development Programme on holistic well-being",
      category: "FDP",
      workingDay: "Yes",
      holiday: "No",
      applicableTo: "All Faculty Members",
      status: "Published",
      remarks: "Organized by Pharmacy Education Dept"
    },
    {
      academicYear: "2026-2027",
      programme: "B.Pharm",
      regulation: "PCI 2017",
      semester: "Semester V",
      startDate: "2026-08-03",
      endDate: "2026-08-07",
      title: "CIA I Practical Examinations",
      description: "First Continuous Internal Assessment - Practical evaluations for Odd Semesters",
      category: "Practical Examination",
      workingDay: "Yes",
      holiday: "No",
      applicableTo: "B.Pharm (Sem III,V,VII) Students",
      status: "Published",
      remarks: "Internal Assessment",
      examCategory: "I Sessional / CIA",
      examType: "Practical",
      applicableSemesters: ["III", "V", "VII"]
    },
    {
      academicYear: "2026-2027",
      programme: "B.Pharm",
      regulation: "PCI 2017",
      semester: "Semester V",
      startDate: "2026-08-10",
      endDate: "2026-08-14",
      title: "CIA I Theory Examinations",
      description: "First Continuous Internal Assessment - Theory evaluations for Odd Semesters",
      category: "CIA / Sessional Examination",
      workingDay: "Yes",
      holiday: "No",
      applicableTo: "B.Pharm (Sem III,V,VII) Students",
      status: "Published",
      remarks: "Internal Assessment",
      examCategory: "I Sessional / CIA",
      examType: "Theory",
      applicableSemesters: ["III", "V", "VII"]
    },
    {
      academicYear: "2026-2027",
      programme: "Institution",
      regulation: "Institution",
      semester: "All",
      startDate: "2026-08-15",
      endDate: "2026-08-15",
      title: "Independence Day Celebration",
      description: "National festival and flag hoisting ceremony",
      category: "Holiday",
      workingDay: "No",
      holiday: "Yes",
      applicableTo: "All Students and Faculty",
      status: "Published",
      remarks: "National Holiday"
    },
    {
      academicYear: "2026-2027",
      programme: "Institution",
      regulation: "Institution",
      semester: "All",
      startDate: "2026-08-20",
      endDate: "2026-08-21",
      title: "National Conference on Drug Discovery",
      description: "2-day National Conference on Frontiers in Drug Discovery - A Medicinal Chemistry Perspective",
      category: "Conference",
      workingDay: "Yes",
      holiday: "No",
      applicableTo: "All Students, Scholars, and Faculty",
      status: "Published",
      remarks: "Annual Conference"
    },
    {
      academicYear: "2026-2027",
      programme: "Institution",
      regulation: "Institution",
      semester: "All",
      startDate: "2026-08-26",
      endDate: "2026-08-26",
      title: "Milad-Un-Nabi Holiday",
      description: "Religious holiday observation",
      category: "Holiday",
      workingDay: "No",
      holiday: "Yes",
      applicableTo: "All Students and Faculty",
      status: "Published",
      remarks: "Official Holiday"
    },
    {
      academicYear: "2026-2027",
      programme: "B.Pharm",
      regulation: "PCI 2017",
      semester: "Semester V",
      startDate: "2026-09-02",
      endDate: "2026-09-02",
      title: "Workshop on 3D Printing in Pharmaceutics",
      description: "Hands-on workshop on 3D printed drug delivery systems and technology",
      category: "Workshop",
      workingDay: "Yes",
      holiday: "No",
      applicableTo: "B.Pharm and Pharm.D Students",
      status: "Published",
      remarks: "Skill Training Cell"
    },
    {
      academicYear: "2026-2027",
      programme: "Institution",
      regulation: "Institution",
      semester: "All",
      startDate: "2026-09-04",
      endDate: "2026-09-04",
      title: "Sri Krishna Jayanthi",
      description: "Religious holiday observation",
      category: "Holiday",
      workingDay: "No",
      holiday: "Yes",
      applicableTo: "All Students and Faculty",
      status: "Published",
      remarks: "Official Holiday"
    },
    {
      academicYear: "2026-2027",
      programme: "Institution",
      regulation: "Institution",
      semester: "All",
      startDate: "2026-09-14",
      endDate: "2026-09-14",
      title: "Vinayakar Chathurthi Holiday",
      description: "Religious holiday observation",
      category: "Holiday",
      workingDay: "No",
      holiday: "Yes",
      applicableTo: "All Students and Faculty",
      status: "Published",
      remarks: "Official Holiday"
    },
    {
      academicYear: "2026-2027",
      programme: "Institution",
      regulation: "Institution",
      semester: "All",
      startDate: "2026-09-17",
      endDate: "2026-09-23",
      title: "National Pharmacovigilance Week",
      description: "Patient safety campaigns, seminars, and student quiz contests",
      category: "Seminar",
      workingDay: "Yes",
      holiday: "No",
      applicableTo: "All Students and Faculty",
      status: "Published",
      remarks: "Pharmacovigilance Committee"
    },
    {
      academicYear: "2026-2027",
      programme: "Institution",
      regulation: "Institution",
      semester: "All",
      startDate: "2026-10-02",
      endDate: "2026-10-02",
      title: "Gandhi Jayanthi Holiday",
      description: "National holiday observation",
      category: "Holiday",
      workingDay: "No",
      holiday: "Yes",
      applicableTo: "All Students and Faculty",
      status: "Published",
      remarks: "National Holiday"
    },
    {
      academicYear: "2026-2027",
      programme: "B.Pharm",
      regulation: "PCI 2017",
      semester: "Semester V",
      startDate: "2026-10-05",
      endDate: "2026-10-09",
      title: "CIA II Practical Examinations",
      description: "Second Continuous Internal Assessment - Practical evaluations for Odd Semesters",
      category: "Practical Examination",
      workingDay: "Yes",
      holiday: "No",
      applicableTo: "B.Pharm (Sem III,V,VII) Students",
      status: "Published",
      remarks: "Internal Assessment",
      examCategory: "II Sessional / CIA",
      examType: "Practical",
      applicableSemesters: ["III", "V", "VII"]
    },
    {
      academicYear: "2026-2027",
      programme: "B.Pharm",
      regulation: "PCI 2017",
      semester: "Semester V",
      startDate: "2026-10-12",
      endDate: "2026-10-16",
      title: "CIA II Theory Examinations",
      description: "Second Continuous Internal Assessment - Theory evaluations for Odd Semesters",
      category: "CIA / Sessional Examination",
      workingDay: "Yes",
      holiday: "No",
      applicableTo: "B.Pharm (Sem III,V,VII) Students",
      status: "Published",
      remarks: "Internal Assessment",
      examCategory: "II Sessional / CIA",
      examType: "Theory",
      applicableSemesters: ["III", "V", "VII"]
    },
    {
      academicYear: "2026-2027",
      programme: "Institution",
      regulation: "Institution",
      semester: "All",
      startDate: "2026-10-19",
      endDate: "2026-10-19",
      title: "Ayudha Pooja Holiday",
      description: "Religious holiday observation",
      category: "Holiday",
      workingDay: "No",
      holiday: "Yes",
      applicableTo: "All Students and Faculty",
      status: "Published",
      remarks: "Official Holiday"
    },
    {
      academicYear: "2026-2027",
      programme: "Institution",
      regulation: "Institution",
      semester: "All",
      startDate: "2026-10-20",
      endDate: "2026-10-20",
      title: "Vijaya Dasami Holiday",
      description: "Religious holiday observation",
      category: "Holiday",
      workingDay: "No",
      holiday: "Yes",
      applicableTo: "All Students and Faculty",
      status: "Published",
      remarks: "Official Holiday"
    },
    {
      academicYear: "2026-2027",
      programme: "B.Pharm",
      regulation: "PCI 2017",
      semester: "Semester V",
      startDate: "2026-10-26",
      endDate: "2026-11-06",
      title: "University Practical End-Semester Examinations",
      description: "Odd Semester Practical End Semester Examinations conducted by SRM University",
      category: "Practical Examination",
      workingDay: "Yes",
      holiday: "No",
      applicableTo: "All Odd Semester Students",
      status: "Published",
      remarks: "University Examinations",
      examCategory: "Semester Examination",
      examType: "Practical",
      applicableSemesters: ["I", "III", "V", "VII"]
    },
    {
      academicYear: "2026-2027",
      programme: "Institution",
      regulation: "Institution",
      semester: "All",
      startDate: "2026-11-08",
      endDate: "2026-11-08",
      title: "Deepavali Holiday",
      description: "Religious holiday observation",
      category: "Holiday",
      workingDay: "No",
      holiday: "Yes",
      applicableTo: "All Students and Faculty",
      status: "Published",
      remarks: "Official Holiday"
    },
    {
      academicYear: "2026-2027",
      programme: "B.Pharm",
      regulation: "PCI 2017",
      semester: "Semester V",
      startDate: "2026-11-09",
      endDate: "2026-11-20",
      title: "University Theory End-Semester Examinations",
      description: "Odd Semester Theory End Semester Examinations conducted by SRM University",
      category: "University Examination",
      workingDay: "Yes",
      holiday: "No",
      applicableTo: "All Odd Semester Students",
      status: "Published",
      remarks: "University Examinations",
      examCategory: "Semester Examination",
      examType: "Theory",
      applicableSemesters: ["I", "III", "V", "VII"]
    },
    {
      academicYear: "2026-2027",
      programme: "B.Pharm",
      regulation: "PCI 2017",
      semester: "Semester VI",
      startDate: "2026-12-14",
      endDate: "2026-12-14",
      title: "Commencement of Classes (Even Semesters)",
      description: "Classes start for Semester II, IV, VI, VIII B.Pharm and M.Pharm students",
      category: "Academic Milestone",
      workingDay: "Yes",
      holiday: "No",
      applicableTo: "Even Semester B.Pharm & M.Pharm Students",
      status: "Published",
      remarks: "Term Commencement"
    },
    {
      academicYear: "2026-2027",
      programme: "Institution",
      regulation: "Institution",
      semester: "All",
      startDate: "2026-12-25",
      endDate: "2026-12-25",
      title: "Christmas Holiday",
      description: "Religious holiday observation",
      category: "Holiday",
      workingDay: "No",
      holiday: "Yes",
      applicableTo: "All Students and Faculty",
      status: "Published",
      remarks: "Official Holiday"
    },
    {
      academicYear: "2026-2027",
      programme: "Institution",
      regulation: "Institution",
      semester: "All",
      startDate: "2027-01-01",
      endDate: "2027-01-01",
      title: "New Year Holiday",
      description: "New Year holiday observation",
      category: "Holiday",
      workingDay: "No",
      holiday: "Yes",
      applicableTo: "All Students and Faculty",
      status: "Published",
      remarks: "Official Holiday"
    },
    {
      academicYear: "2026-2027",
      programme: "Institution",
      regulation: "Institution",
      semester: "All",
      startDate: "2027-01-14",
      endDate: "2027-01-16",
      title: "Pongal & Harvest Festival Holidays",
      description: "State level festival holidays (Pongal, Thiruvalluvar Day, Uzhavar Thirunal)",
      category: "Holiday",
      workingDay: "No",
      holiday: "Yes",
      applicableTo: "All Students and Faculty",
      status: "Published",
      remarks: "Official Holidays"
    },
    {
      academicYear: "2026-2027",
      programme: "Institution",
      regulation: "Institution",
      semester: "All",
      startDate: "2027-01-18",
      endDate: "2027-01-18",
      title: "Orientation Programme for New Research Scholars",
      description: "Research methodology and ethics orientation session for new PhD registrants",
      category: "Orientation",
      workingDay: "Yes",
      holiday: "No",
      applicableTo: "Research Scholars and Guides",
      status: "Published",
      remarks: "Research Committee"
    },
    {
      academicYear: "2026-2027",
      programme: "Institution",
      regulation: "Institution",
      semester: "All",
      startDate: "2027-01-26",
      endDate: "2027-01-26",
      title: "Republic Day Holiday",
      description: "National festival and parade ceremony",
      category: "Holiday",
      workingDay: "No",
      holiday: "Yes",
      applicableTo: "All Students and Faculty",
      status: "Published",
      remarks: "National Holiday"
    },
    {
      academicYear: "2026-2027",
      programme: "B.Pharm",
      regulation: "PCI 2017",
      semester: "Semester VI",
      startDate: "2027-02-08",
      endDate: "2027-02-12",
      title: "CIA I Practical Examinations (Even Sems)",
      description: "First Continuous Internal Assessment - Practical evaluations for Even Semesters",
      category: "Practical Examination",
      workingDay: "Yes",
      holiday: "No",
      applicableTo: "Even Semester B.Pharm Students",
      status: "Published",
      remarks: "Internal Assessment",
      examCategory: "I Sessional / CIA",
      examType: "Practical",
      applicableSemesters: ["II", "IV", "VI", "VIII"]
    },
    {
      academicYear: "2026-2027",
      programme: "B.Pharm",
      regulation: "PCI 2017",
      semester: "Semester VI",
      startDate: "2027-02-15",
      endDate: "2027-02-19",
      title: "CIA I Theory Examinations (Even Sems)",
      description: "First Continuous Internal Assessment - Theory evaluations for Even Semesters",
      category: "CIA / Sessional Examination",
      workingDay: "Yes",
      holiday: "No",
      applicableTo: "Even Semester B.Pharm Students",
      status: "Published",
      remarks: "Internal Assessment",
      examCategory: "I Sessional / CIA",
      examType: "Theory",
      applicableSemesters: ["II", "IV", "VI", "VIII"]
    },
    {
      academicYear: "2026-2027",
      programme: "Institution",
      regulation: "Institution",
      semester: "All",
      startDate: "2027-02-22",
      endDate: "2027-02-22",
      title: "Guest Lecture on Intellectual Property Rights",
      description: "Eminent lecture on patent laws and pharmaceutical filings in India",
      category: "Guest Lecture",
      workingDay: "Yes",
      holiday: "No",
      applicableTo: "All PG Students and Faculty",
      status: "Published",
      remarks: "IPR Cell Initiative"
    },
    {
      academicYear: "2026-2027",
      programme: "Institution",
      regulation: "Institution",
      semester: "All",
      startDate: "2027-03-05",
      endDate: "2027-03-05",
      title: "National Seminar on Quality by Design (QbD)",
      description: "National seminar on implementing QbD paradigms in pharmaceutical development",
      category: "Seminar",
      workingDay: "Yes",
      holiday: "No",
      applicableTo: "All Students and Faculty",
      status: "Published",
      remarks: "Pharmaceutics Dept"
    },
    {
      academicYear: "2026-2027",
      programme: "Institution",
      regulation: "Institution",
      semester: "All",
      startDate: "2027-03-12",
      endDate: "2027-03-12",
      title: "Skill Development Programme on Analytical Instruments",
      description: "Hands-on training session on HPLC, GC, and FTIR operations for undergraduates",
      category: "Workshop",
      workingDay: "Yes",
      holiday: "No",
      applicableTo: "Final Year B.Pharm Students",
      status: "Published",
      remarks: "Instrumentation Lab"
    },
    {
      academicYear: "2026-2027",
      programme: "Institution",
      regulation: "Institution",
      semester: "All",
      startDate: "2027-03-24",
      endDate: "2027-03-24",
      title: "Mahavir Jayanthi Holiday",
      description: "Religious holiday observation",
      category: "Holiday",
      workingDay: "No",
      holiday: "Yes",
      applicableTo: "All Students and Faculty",
      status: "Published",
      remarks: "Official Holiday"
    },
    {
      academicYear: "2026-2027",
      programme: "Institution",
      regulation: "Institution",
      semester: "All",
      startDate: "2027-03-26",
      endDate: "2027-03-26",
      title: "Good Friday Holiday",
      description: "Religious holiday observation",
      category: "Holiday",
      workingDay: "No",
      holiday: "Yes",
      applicableTo: "All Students and Faculty",
      status: "Published",
      remarks: "Official Holiday"
    },
    {
      academicYear: "2026-2027",
      programme: "B.Pharm",
      regulation: "PCI 2017",
      semester: "Semester VI",
      startDate: "2027-04-05",
      endDate: "2027-04-09",
      title: "CIA II Practical Examinations (Even Sems)",
      description: "Second Continuous Internal Assessment - Practical evaluations for Even Semesters",
      category: "Practical Examination",
      workingDay: "Yes",
      holiday: "No",
      applicableTo: "Even Semester B.Pharm Students",
      status: "Published",
      remarks: "Internal Assessment",
      examCategory: "II Sessional / CIA",
      examType: "Practical",
      applicableSemesters: ["II", "IV", "VI", "VIII"]
    },
    {
      academicYear: "2026-2027",
      programme: "B.Pharm",
      regulation: "PCI 2017",
      semester: "Semester VI",
      startDate: "2027-04-12",
      endDate: "2027-04-16",
      title: "CIA II Theory Examinations (Even Sems)",
      description: "Second Continuous Internal Assessment - Theory evaluations for Even Semesters",
      category: "CIA / Sessional Examination",
      workingDay: "Yes",
      holiday: "No",
      applicableTo: "Even Semester B.Pharm Students",
      status: "Published",
      remarks: "Internal Assessment",
      examCategory: "II Sessional / CIA",
      examType: "Theory",
      applicableSemesters: ["II", "IV", "VI", "VIII"]
    },
    {
      academicYear: "2026-2027",
      programme: "Institution",
      regulation: "Institution",
      semester: "All",
      startDate: "2027-04-14",
      endDate: "2027-04-14",
      title: "Tamil New Year Holiday",
      description: "State holiday observation",
      category: "Holiday",
      workingDay: "No",
      holiday: "Yes",
      applicableTo: "All Students and Faculty",
      status: "Published",
      remarks: "Official Holiday"
    },
    {
      academicYear: "2026-2027",
      programme: "Institution",
      regulation: "Institution",
      semester: "All",
      startDate: "2027-04-28",
      endDate: "2027-04-28",
      title: "Guest Lecture on Pharmacovigilance & Drug Safety",
      description: "Lecture on signal detection and global safety regulations by industry professional",
      category: "Guest Lecture",
      workingDay: "Yes",
      holiday: "No",
      applicableTo: "B.Pharm and Pharm.D Students",
      status: "Published",
      remarks: "Clinical Pharmacy Dept"
    },
    {
      academicYear: "2026-2027",
      programme: "Institution",
      regulation: "Institution",
      semester: "All",
      startDate: "2027-05-01",
      endDate: "2027-05-01",
      title: "May Day Holiday",
      description: "Labour day holiday",
      category: "Holiday",
      workingDay: "No",
      holiday: "Yes",
      applicableTo: "All Students and Faculty",
      status: "Published",
      remarks: "Official Holiday"
    },
    {
      academicYear: "2026-2027",
      programme: "B.Pharm",
      regulation: "PCI 2017",
      semester: "Semester VI",
      startDate: "2027-05-10",
      endDate: "2027-05-21",
      title: "University Practical End-Semester Examinations (Even Sems)",
      description: "Even Semester Practical End Semester Examinations conducted by SRM University",
      category: "Practical Examination",
      workingDay: "Yes",
      holiday: "No",
      applicableTo: "All Even Semester Students",
      status: "Published",
      remarks: "University Examinations",
      examCategory: "Semester Examination",
      examType: "Practical",
      applicableSemesters: ["II", "IV", "VI", "VIII"]
    },
    {
      academicYear: "2026-2027",
      programme: "B.Pharm",
      regulation: "PCI 2017",
      semester: "Semester VI",
      startDate: "2027-05-24",
      endDate: "2027-06-04",
      title: "University Theory End-Semester Examinations (Even Sems)",
      description: "Even Semester Theory End Semester Examinations conducted by SRM University",
      category: "University Examination",
      workingDay: "Yes",
      holiday: "No",
      applicableTo: "All Even Semester Students",
      status: "Published",
      remarks: "University Examinations",
      examCategory: "Semester Examination",
      examType: "Theory",
      applicableSemesters: ["II", "IV", "VI", "VIII"]
    },
    {
      academicYear: "2026-2027",
      programme: "B.Pharm",
      regulation: "PCI 2017",
      semester: "Semester VI",
      startDate: "2027-05-31",
      endDate: "2027-05-31",
      title: "Last Working Day / Semester Closure",
      description: "Official last working day and semester closure for Even Semester academic activities",
      category: "Academic Milestone",
      workingDay: "Yes",
      holiday: "No",
      applicableTo: "All Students and Faculty",
      status: "Published",
      remarks: "Semester Closure"
    },
    {
      academicYear: "2026-2027",
      programme: "Institution",
      regulation: "Institution",
      semester: "All",
      startDate: "2027-06-01",
      endDate: "2027-06-30",
      title: "Summer Vacation Period",
      description: "Official institutional summer vacation for students and faculty",
      category: "Vacation",
      workingDay: "No",
      holiday: "Yes",
      applicableTo: "All Students and Faculty",
      status: "Published",
      remarks: "Summer Break"
    },
    {
      academicYear: "2026-2027",
      programme: "B.Pharm",
      regulation: "PCI 2017",
      semester: "Semester VII",
      startDate: "2027-07-01",
      endDate: "2027-07-01",
      title: "Commencement of Classes (Odd Semesters 2027-2028)",
      description: "First working day and commencement of classes for the new academic year's odd semesters",
      category: "Academic Milestone",
      workingDay: "Yes",
      holiday: "No",
      applicableTo: "B.Pharm (Sem III,V,VII) Students",
      status: "Published",
      remarks: "Term Commencement"
    },
    {
      academicYear: "2026-2027",
      programme: "Institution",
      regulation: "Institution",
      semester: "All",
      startDate: "2027-07-12",
      endDate: "2027-07-16",
      title: "FDP on Advances in Drug Delivery Systems",
      description: "5-day Faculty Development Programme focusing on modern nano-carriers and target systems",
      category: "FDP",
      workingDay: "Yes",
      holiday: "No",
      applicableTo: "All Faculty and PhD Scholars",
      status: "Published",
      remarks: "Organized by Pharmaceutics Division"
    },
    {
      academicYear: "2026-2027",
      programme: "Institution",
      regulation: "Institution",
      semester: "All",
      startDate: "2027-07-20",
      endDate: "2027-07-20",
      title: "Orientation for New Admissions batch (2027-2028)",
      description: "General orientation and induction for freshers of B.Pharm and Pharm.D",
      category: "Orientation",
      workingDay: "Yes",
      holiday: "No",
      applicableTo: "First Year Students and Parents",
      status: "Published",
      remarks: "Induction Week"
    },
    {
      academicYear: "2026-2027",
      programme: "B.Pharm",
      regulation: "PCI 2017",
      semester: "Semester VII",
      startDate: "2027-08-02",
      endDate: "2027-08-06",
      title: "CIA I Theory & Practical Examinations",
      description: "Continuous Internal Assessment I for new odd semester classes",
      category: "CIA / Sessional Examination",
      workingDay: "Yes",
      holiday: "No",
      applicableTo: "All B.Pharm Odd Semester Students",
      status: "Published",
      remarks: "Internal Assessment"
    },
    {
      academicYear: "2026-2027",
      programme: "Institution",
      regulation: "Institution",
      semester: "All",
      startDate: "2027-08-15",
      endDate: "2027-08-15",
      title: "Independence Day Holiday",
      description: "National festival holiday observation",
      category: "Holiday",
      workingDay: "No",
      holiday: "Yes",
      applicableTo: "All Students and Faculty",
      status: "Published",
      remarks: "National Holiday"
    },
    {
      academicYear: "2026-2027",
      programme: "Institution",
      regulation: "Institution",
      semester: "All",
      startDate: "2027-08-16",
      endDate: "2027-08-16",
      title: "Milad-Un-Nabi Holiday",
      description: "Religious holiday observation",
      category: "Holiday",
      workingDay: "No",
      holiday: "Yes",
      applicableTo: "All Students and Faculty",
      status: "Published",
      remarks: "Official Holiday"
    },
    {
      academicYear: "2026-2027",
      programme: "Institution",
      regulation: "Institution",
      semester: "All",
      startDate: "2027-08-20",
      endDate: "2027-08-20",
      title: "Guest Lecture on Career Avenues in Clinical Pharmacy",
      description: "Expert talk by overseas clinical pharmacy specialist on globally competitive avenues",
      category: "Guest Lecture",
      workingDay: "Yes",
      holiday: "No",
      applicableTo: "Pharm.D and B.Pharm Students",
      status: "Published",
      remarks: "Placement Cell series"
    },
    {
      academicYear: "2026-2027",
      programme: "Pharm.D",
      regulation: "PCI 2008",
      semester: "Year II",
      startDate: "2026-09-14",
      endDate: "2026-09-19",
      title: "First Sessional Theory & Practical Examinations",
      description: "First internal assessment sessional examination for annual course students",
      category: "CIA / Sessional Examination",
      workingDay: "Yes",
      holiday: "No",
      applicableTo: "All Pharm.D (Yr II-V) Students",
      status: "Published",
      remarks: "Internal Assessment I",
      examCategory: "I Sessional / CIA",
      examType: "Theory",
      applicableYears: ["II", "III", "IV", "V"]
    },
    {
      academicYear: "2026-2027",
      programme: "Pharm.D",
      regulation: "PCI 2008",
      semester: "Year II",
      startDate: "2026-12-14",
      endDate: "2026-12-19",
      title: "Second Sessional Theory & Practical Examinations",
      description: "Second internal assessment sessional examination for annual course students",
      category: "CIA / Sessional Examination",
      workingDay: "Yes",
      holiday: "No",
      applicableTo: "All Pharm.D (Yr II-V) Students",
      status: "Published",
      remarks: "Internal Assessment II",
      examCategory: "II Sessional / CIA",
      examType: "Theory",
      applicableYears: ["II", "III", "IV", "V"]
    },
    {
      academicYear: "2026-2027",
      programme: "Pharm.D",
      regulation: "PCI 2008",
      semester: "Year II",
      startDate: "2027-03-15",
      endDate: "2027-03-20",
      title: "Third Sessional Theory & Practical Examinations",
      description: "Third internal assessment sessional examination for annual course students",
      category: "CIA / Sessional Examination",
      workingDay: "Yes",
      holiday: "No",
      applicableTo: "All Pharm.D (Yr II-V) Students",
      status: "Published",
      remarks: "Internal Assessment III",
      examCategory: "III Sessional / CIA",
      examType: "Theory",
      applicableYears: ["II", "III", "IV", "V"]
    },
    {
      academicYear: "2026-2027",
      programme: "Pharm.D",
      regulation: "PCI 2008",
      semester: "Year II",
      startDate: "2027-05-17",
      endDate: "2027-05-29",
      title: "Annual University Theory & Practical Examinations",
      description: "Official end-of-year comprehensive university examinations for Pharm.D",
      category: "University Examination",
      workingDay: "No",
      holiday: "No",
      applicableTo: "All Pharm.D Year-II to V Students",
      status: "Published",
      remarks: "Final University Exams",
      examCategory: "University Examination",
      examType: "Theory",
      applicableYears: ["II", "III", "IV", "V"]
    }
  ];
}

// Programmatic Word Document generation using standard docx elements
const generateWordTemplate = async (eventsList: any[]) => {
  try {
    const tableRows = [
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "S.No", bold: true })] })] }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Date / Period", bold: true })] })] }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Academic Event Title", bold: true })] })] }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Category", bold: true })] })] }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Programme", bold: true })] })] }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Semester", bold: true })] })] }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Applicable To", bold: true })] })] }),
        ]
      })
    ];

    eventsList.forEach((evt, idx) => {
      tableRows.push(
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ text: String(idx + 1) })] }),
            new TableCell({ children: [new Paragraph({ text: evt.startDate === evt.endDate ? evt.startDate : `${evt.startDate} to ${evt.endDate}` })] }),
            new TableCell({ children: [new Paragraph({ text: evt.title || "" })] }),
            new TableCell({ children: [new Paragraph({ text: evt.category || "" })] }),
            new TableCell({ children: [new Paragraph({ text: evt.programme || "" })] }),
            new TableCell({ children: [new Paragraph({ text: evt.semester || "" })] }),
            new TableCell({ children: [new Paragraph({ text: evt.applicableTo || "" })] }),
          ]
        })
      );
    });

    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            text: "SRM COLLEGE OF PHARMACY",
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            text: "MASTER INSTITUTIONAL ACADEMIC CALENDAR TEMPLATE",
            heading: HeadingLevel.HEADING_2,
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({ text: "" }),
          new Paragraph({ text: `Generated on: ${new Date().toLocaleDateString()}` }),
          new Paragraph({ text: "" }),
          new Table({
            rows: tableRows
          })
        ]
      }]
    });

    const blob = await Packer.toBlob(doc);
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "Academic_Calendar_Template.docx";
    link.click();
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error("Failed to generate Word document:", err);
  }
};

function getCorrectExamEvents(): CalendarEvent[] {
  const list: CalendarEvent[] = [];

  CANONICAL_SCHEDULES.forEach(schedule => {
    const isBPharm = schedule.programme === 'B.Pharm';
    const reg = isBPharm ? "PCI 2017" : "PCI 2008";
    
    // Get numeric code or year code (e.g., "Semester I" -> "I", "Year I" -> "I")
    const semOrYrCode = schedule.semesterOrYear.split(' ').pop() || '';

    // Sessional I Practical
    list.push({
      academicYear: "2026-2027",
      programme: schedule.programme,
      regulation: reg,
      semester: schedule.semesterOrYear,
      startDate: schedule.sessionalI.practical,
      endDate: schedule.sessionalI.practical,
      title: `${schedule.semesterOrYear} I Sessional Practical Examination`,
      description: `First Continuous Internal Assessment - Practical evaluations for ${schedule.semesterOrYear} ${schedule.programme}`,
      category: "Practical Examination",
      workingDay: "Yes",
      holiday: "No",
      applicableTo: `${schedule.programme} (${schedule.semesterOrYear}) Students`,
      status: "Published",
      remarks: "Internal Assessment",
      examCategory: "I Sessional / CIA",
      examType: "Practical",
      ...(isBPharm ? { applicableSemesters: [semOrYrCode] } : { applicableYears: [semOrYrCode] })
    });

    // Sessional I Theory
    list.push({
      academicYear: "2026-2027",
      programme: schedule.programme,
      regulation: reg,
      semester: schedule.semesterOrYear,
      startDate: schedule.sessionalI.theory,
      endDate: schedule.sessionalI.theory,
      title: `${schedule.semesterOrYear} I Sessional Theory Examination`,
      description: `First Continuous Internal Assessment - Theory evaluations for ${schedule.semesterOrYear} ${schedule.programme}`,
      category: "CIA / Sessional Examination",
      workingDay: "Yes",
      holiday: "No",
      applicableTo: `${schedule.programme} (${schedule.semesterOrYear}) Students`,
      status: "Published",
      remarks: "Internal Assessment",
      examCategory: "I Sessional / CIA",
      examType: "Theory",
      ...(isBPharm ? { applicableSemesters: [semOrYrCode] } : { applicableYears: [semOrYrCode] })
    });

    // Sessional II Practical
    list.push({
      academicYear: "2026-2027",
      programme: schedule.programme,
      regulation: reg,
      semester: schedule.semesterOrYear,
      startDate: schedule.sessionalII.practical,
      endDate: schedule.sessionalII.practical,
      title: `${schedule.semesterOrYear} II Sessional Practical Examination`,
      description: `Second Continuous Internal Assessment - Practical evaluations for ${schedule.semesterOrYear} ${schedule.programme}`,
      category: "Practical Examination",
      workingDay: "Yes",
      holiday: "No",
      applicableTo: `${schedule.programme} (${schedule.semesterOrYear}) Students`,
      status: "Published",
      remarks: "Internal Assessment",
      examCategory: "II Sessional / CIA",
      examType: "Practical",
      ...(isBPharm ? { applicableSemesters: [semOrYrCode] } : { applicableYears: [semOrYrCode] })
    });

    // Sessional II Theory
    list.push({
      academicYear: "2026-2027",
      programme: schedule.programme,
      regulation: reg,
      semester: schedule.semesterOrYear,
      startDate: schedule.sessionalII.theory,
      endDate: schedule.sessionalII.theory,
      title: `${schedule.semesterOrYear} II Sessional Theory Examination`,
      description: `Second Continuous Internal Assessment - Theory evaluations for ${schedule.semesterOrYear} ${schedule.programme}`,
      category: "CIA / Sessional Examination",
      workingDay: "Yes",
      holiday: "No",
      applicableTo: `${schedule.programme} (${schedule.semesterOrYear}) Students`,
      status: "Published",
      remarks: "Internal Assessment",
      examCategory: "II Sessional / CIA",
      examType: "Theory",
      ...(isBPharm ? { applicableSemesters: [semOrYrCode] } : { applicableYears: [semOrYrCode] })
    });

    // Sessional III (Pharm.D only)
    if (!isBPharm && schedule.sessionalIII) {
      // Sessional III Practical
      list.push({
        academicYear: "2026-2027",
        programme: schedule.programme,
        regulation: reg,
        semester: schedule.semesterOrYear,
        startDate: schedule.sessionalIII.practical,
        endDate: schedule.sessionalIII.practical,
        title: `${schedule.semesterOrYear} III Sessional Practical Examination`,
        description: `Third Continuous Internal Assessment - Practical evaluations for ${schedule.semesterOrYear} ${schedule.programme}`,
        category: "Practical Examination",
        workingDay: "Yes",
        holiday: "No",
        applicableTo: `${schedule.programme} (${schedule.semesterOrYear}) Students`,
        status: "Published",
        remarks: "Internal Assessment",
        examCategory: "III Sessional / CIA",
        examType: "Practical",
        applicableYears: [semOrYrCode]
      });

      // Sessional III Theory
      list.push({
        academicYear: "2026-2027",
        programme: schedule.programme,
        regulation: reg,
        semester: schedule.semesterOrYear,
        startDate: schedule.sessionalIII.theory,
        endDate: schedule.sessionalIII.theory,
        title: `${schedule.semesterOrYear} III Sessional Theory Examination`,
        description: `Third Continuous Internal Assessment - Theory evaluations for ${schedule.semesterOrYear} ${schedule.programme}`,
        category: "CIA / Sessional Examination",
        workingDay: "Yes",
        holiday: "No",
        applicableTo: `${schedule.programme} (${schedule.semesterOrYear}) Students`,
        status: "Published",
        remarks: "Internal Assessment",
        examCategory: "III Sessional / CIA",
        examType: "Theory",
        applicableYears: [semOrYrCode]
      });
    }

    // University Practical
    list.push({
      academicYear: "2026-2027",
      programme: schedule.programme,
      regulation: reg,
      semester: schedule.semesterOrYear,
      startDate: schedule.universityExam.practical,
      endDate: schedule.universityExam.practical,
      title: isBPharm 
        ? `${schedule.semesterOrYear} End-Semester Practical Examination` 
        : `${schedule.semesterOrYear} Annual University Practical Examination`,
      description: isBPharm 
        ? `Semester practical examinations for ${schedule.semesterOrYear} ${schedule.programme}` 
        : `Official end-of-year comprehensive university practical examinations for ${schedule.programme} ${schedule.semesterOrYear}`,
      category: "Practical Examination",
      workingDay: "Yes",
      holiday: "No",
      applicableTo: `${schedule.programme} (${schedule.semesterOrYear}) Students`,
      status: "Published",
      remarks: isBPharm ? "End Semester Exams" : "Final University Exams",
      examCategory: isBPharm ? "Semester Examination" : "University Examination",
      examType: "Practical",
      ...(isBPharm ? { applicableSemesters: [semOrYrCode] } : { applicableYears: [semOrYrCode] })
    });

    // University Theory
    list.push({
      academicYear: "2026-2027",
      programme: schedule.programme,
      regulation: reg,
      semester: schedule.semesterOrYear,
      startDate: schedule.universityExam.theory,
      endDate: schedule.universityExam.theory,
      title: isBPharm 
        ? `${schedule.semesterOrYear} End-Semester Theory Examination` 
        : `${schedule.semesterOrYear} Annual University Theory Examination`,
      description: isBPharm 
        ? `Semester theory examinations for ${schedule.semesterOrYear} ${schedule.programme}` 
        : `Official end-of-year comprehensive university theory examinations for ${schedule.programme} ${schedule.semesterOrYear}`,
      category: "University Examination",
      workingDay: "Yes",
      holiday: "No",
      applicableTo: `${schedule.programme} (${schedule.semesterOrYear}) Students`,
      status: "Published",
      remarks: isBPharm ? "End Semester Exams" : "Final University Exams",
      examCategory: isBPharm ? "Semester Examination" : "University Examination",
      examType: "Theory",
      ...(isBPharm ? { applicableSemesters: [semOrYrCode] } : { applicableYears: [semOrYrCode] })
    });
  });

  return list;
}
