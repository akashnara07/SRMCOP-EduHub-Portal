import { ProgrammeType, StudentMaster } from './studentRegistry';

export type EnrollmentStatus = 
  | 'Active' 
  | 'Held Back' 
  | 'Repeater' 
  | 'Graduated' 
  | 'Discontinued' 
  | 'Transferred';

export interface AcademicEnrollment {
  id: string; // e.g. "ae-std-1-2026-2027"
  academicYear: string; // e.g. "2026-2027"
  studentId: string; // references StudentMaster.id
  programme: ProgrammeType;
  currentYear: string; // "Year I", "Year II", "Year III", "Year IV", "Year V", "Internship", "Graduated"
  semester: string; // "Semester I", "Semester III", "Semester V", "Semester VII", etc.
  section: string; // "Section A", "Section B"
  enrollmentStatus: EnrollmentStatus;
  facultyAdvisor?: string;
  notes?: string;
  createdAt?: string;
}

export interface ProgrammePromotionRule {
  programme: ProgrammeType;
  stages: {
    year: string;
    semester: string;
    nextYear: string;
    nextSemester: string;
  }[];
}

export const PROGRAMME_PROMOTION_RULES: Record<ProgrammeType, { year: string; semester: string; nextYear: string; nextSemester: string }[]> = {
  'B.Pharm': [
    { year: 'Year I', semester: 'Semester I', nextYear: 'Year II', nextSemester: 'Semester III' },
    { year: 'Year II', semester: 'Semester III', nextYear: 'Year III', nextSemester: 'Semester V' },
    { year: 'Year III', semester: 'Semester V', nextYear: 'Year IV', nextSemester: 'Semester VII' },
    { year: 'Year IV', semester: 'Semester VII', nextYear: 'Graduated', nextSemester: 'Graduated' }
  ],
  'Pharm.D': [
    { year: 'Year I', semester: 'Semester I', nextYear: 'Year II', nextSemester: 'Semester III' },
    { year: 'Year II', semester: 'Semester III', nextYear: 'Year III', nextSemester: 'Semester V' },
    { year: 'Year III', semester: 'Semester V', nextYear: 'Year IV', nextSemester: 'Semester VII' },
    { year: 'Year IV', semester: 'Semester VII', nextYear: 'Year V', nextSemester: 'Semester IX' },
    { year: 'Year V', semester: 'Semester IX', nextYear: 'Internship', nextSemester: 'Internship' },
    { year: 'Internship', semester: 'Internship', nextYear: 'Graduated', nextSemester: 'Graduated' }
  ],
  'M.Pharm': [
    { year: 'Year I', semester: 'Semester I', nextYear: 'Year II', nextSemester: 'Semester III' },
    { year: 'Year II', semester: 'Semester III', nextYear: 'Graduated', nextSemester: 'Graduated' }
  ]
};

const STORAGE_KEY_ENROLLMENTS = 'srm_lms_academic_enrollments_v1';

export const DEFAULT_ACADEMIC_ENROLLMENTS: AcademicEnrollment[] = [
  // J. Akash (std-1, B.Pharm 2023-2027)
  {
    id: 'ae-std-1-2023-2024',
    studentId: 'std-1',
    academicYear: '2023-2024',
    programme: 'B.Pharm',
    currentYear: 'Year I',
    semester: 'Semester I',
    section: 'Section A',
    enrollmentStatus: 'Active',
    facultyAdvisor: 'Dr. V. Chitra'
  },
  {
    id: 'ae-std-1-2024-2025',
    studentId: 'std-1',
    academicYear: '2024-2025',
    programme: 'B.Pharm',
    currentYear: 'Year II',
    semester: 'Semester III',
    section: 'Section A',
    enrollmentStatus: 'Active',
    facultyAdvisor: 'Dr. V. Chitra'
  },
  {
    id: 'ae-std-1-2025-2026',
    studentId: 'std-1',
    academicYear: '2025-2026',
    programme: 'B.Pharm',
    currentYear: 'Year III',
    semester: 'Semester V',
    section: 'Section A',
    enrollmentStatus: 'Active',
    facultyAdvisor: 'Dr. Meena Swaminathan'
  },
  {
    id: 'ae-std-1-2026-2027',
    studentId: 'std-1',
    academicYear: '2026-2027',
    programme: 'B.Pharm',
    currentYear: 'Year IV',
    semester: 'Semester VII',
    section: 'Section A',
    enrollmentStatus: 'Active',
    facultyAdvisor: 'Prof. S. J. Vardhan'
  },

  // Priya Sharma (std-2, Pharm.D 2022-2028)
  {
    id: 'ae-std-2-2024-2025',
    studentId: 'std-2',
    academicYear: '2024-2025',
    programme: 'Pharm.D',
    currentYear: 'Year III',
    semester: 'Semester V',
    section: 'Section B',
    enrollmentStatus: 'Active',
    facultyAdvisor: 'Prof. Elizabeth Mathew'
  },
  {
    id: 'ae-std-2-2025-2026',
    studentId: 'std-2',
    academicYear: '2025-2026',
    programme: 'Pharm.D',
    currentYear: 'Year IV',
    semester: 'Semester VII',
    section: 'Section B',
    enrollmentStatus: 'Active',
    facultyAdvisor: 'Prof. Elizabeth Mathew'
  },
  {
    id: 'ae-std-2-2026-2027',
    studentId: 'std-2',
    academicYear: '2026-2027',
    programme: 'Pharm.D',
    currentYear: 'Year V',
    semester: 'Semester IX',
    section: 'Section B',
    enrollmentStatus: 'Active',
    facultyAdvisor: 'Dr. V. Chitra'
  },

  // Manoj Kumar (std-3, B.Pharm 2024-2028)
  {
    id: 'ae-std-3-2024-2025',
    studentId: 'std-3',
    academicYear: '2024-2025',
    programme: 'B.Pharm',
    currentYear: 'Year I',
    semester: 'Semester I',
    section: 'Section A',
    enrollmentStatus: 'Active',
    facultyAdvisor: 'Dr. V. Chitra'
  },
  {
    id: 'ae-std-3-2025-2026',
    studentId: 'std-3',
    academicYear: '2025-2026',
    programme: 'B.Pharm',
    currentYear: 'Year II',
    semester: 'Semester III',
    section: 'Section A',
    enrollmentStatus: 'Active',
    facultyAdvisor: 'Dr. V. Chitra'
  },
  {
    id: 'ae-std-3-2026-2027',
    studentId: 'std-3',
    academicYear: '2026-2027',
    programme: 'B.Pharm',
    currentYear: 'Year III',
    semester: 'Semester V',
    section: 'Section A',
    enrollmentStatus: 'Active',
    facultyAdvisor: 'Dr. Meena Swaminathan'
  },

  // Ritu Sen (std-4, Pharm.D 2021-2027)
  {
    id: 'ae-std-4-2025-2026',
    studentId: 'std-4',
    academicYear: '2025-2026',
    programme: 'Pharm.D',
    currentYear: 'Year V',
    semester: 'Semester IX',
    section: 'Section A',
    enrollmentStatus: 'Active',
    facultyAdvisor: 'Dr. J. Narayanan'
  },
  {
    id: 'ae-std-4-2026-2027',
    studentId: 'std-4',
    academicYear: '2026-2027',
    programme: 'Pharm.D',
    currentYear: 'Internship',
    semester: 'Internship',
    section: 'Section A',
    enrollmentStatus: 'Active',
    facultyAdvisor: 'Dr. J. Narayanan'
  },

  // Kavitha Raman (std-5, M.Pharm 2024-2026)
  {
    id: 'ae-std-5-2024-2025',
    studentId: 'std-5',
    academicYear: '2024-2025',
    programme: 'M.Pharm',
    currentYear: 'Year I',
    semester: 'Semester I',
    section: 'Section A',
    enrollmentStatus: 'Active',
    facultyAdvisor: 'Prof. K. S. Latha'
  },
  {
    id: 'ae-std-5-2025-2026',
    studentId: 'std-5',
    academicYear: '2025-2026',
    programme: 'M.Pharm',
    currentYear: 'Year II',
    semester: 'Semester III',
    section: 'Section A',
    enrollmentStatus: 'Active',
    facultyAdvisor: 'Prof. K. S. Latha'
  },
  {
    id: 'ae-std-5-2026-2027',
    studentId: 'std-5',
    academicYear: '2026-2027',
    programme: 'M.Pharm',
    currentYear: 'Graduated',
    semester: 'Graduated',
    section: 'Section A',
    enrollmentStatus: 'Graduated',
    facultyAdvisor: 'Prof. K. S. Latha'
  },

  // Deepak Raj (std-6, B.Pharm 2022-2026)
  {
    id: 'ae-std-6-2025-2026',
    studentId: 'std-6',
    academicYear: '2025-2026',
    programme: 'B.Pharm',
    currentYear: 'Year IV',
    semester: 'Semester VII',
    section: 'Section A',
    enrollmentStatus: 'Active',
    facultyAdvisor: 'Dr. J. Kavitha'
  },
  {
    id: 'ae-std-6-2026-2027',
    studentId: 'std-6',
    academicYear: '2026-2027',
    programme: 'B.Pharm',
    currentYear: 'Graduated',
    semester: 'Graduated',
    section: 'Section A',
    enrollmentStatus: 'Graduated',
    facultyAdvisor: 'Dr. J. Kavitha'
  }
];

export function getAcademicEnrollments(): AcademicEnrollment[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ENROLLMENTS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Error loading academic enrollments:', e);
  }
  
  // Default fallback and save
  saveAcademicEnrollments(DEFAULT_ACADEMIC_ENROLLMENTS);
  return DEFAULT_ACADEMIC_ENROLLMENTS;
}

export function saveAcademicEnrollments(list: AcademicEnrollment[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_ENROLLMENTS, JSON.stringify(list));
  } catch (e) {
    console.error('Error saving academic enrollments:', e);
  }
}

/**
 * Gets the current active enrollment record for a student for a specific academic year.
 * If target year is omitted, defaults to "2026-2027".
 */
export function getCurrentEnrollmentForStudent(
  studentId: string, 
  academicYear: string = '2026-2027',
  enrollments?: AcademicEnrollment[]
): AcademicEnrollment | null {
  const list = enrollments || getAcademicEnrollments();
  const match = list.find(e => e.studentId === studentId && e.academicYear === academicYear);
  if (match) return match;

  // Fallback to most recent available enrollment
  const studentEnrollments = list
    .filter(e => e.studentId === studentId)
    .sort((a, b) => b.academicYear.localeCompare(a.academicYear));

  return studentEnrollments[0] || null;
}

/**
 * Gets all enrollment records across academic years for a student, sorted chronologically.
 */
export function getStudentEnrollmentHistory(
  studentId: string,
  enrollments?: AcademicEnrollment[]
): AcademicEnrollment[] {
  const list = enrollments || getAcademicEnrollments();
  return list
    .filter(e => e.studentId === studentId)
    .sort((a, b) => a.academicYear.localeCompare(b.academicYear));
}

/**
 * Queries Academic Enrollment for eligible candidates in Examination Modules.
 * (Examination Schedule, Seating, Invigilation, Attendance, Hall Reports, Result Processing)
 */
export function getEligibleCandidatesForExam(
  academicYear: string,
  programme?: ProgrammeType,
  currentYear?: string,
  semester?: string,
  enrollments?: AcademicEnrollment[]
): AcademicEnrollment[] {
  const list = enrollments || getAcademicEnrollments();
  return list.filter(e => {
    if (e.academicYear !== academicYear) return false;
    if (programme && e.programme !== programme) return false;
    if (currentYear && e.currentYear !== currentYear) return false;
    if (semester && e.semester !== semester) return false;
    if (e.enrollmentStatus !== 'Active' && e.enrollmentStatus !== 'Repeater') return false;
    return true;
  });
}
