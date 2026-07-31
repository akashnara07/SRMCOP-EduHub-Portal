export interface FacultyMember {
  id: string;
  name: string;
  empId: string;
  dept: string;
  designation: string;
  email: string;
  phone: string;
  status: 'Active' | 'On Leave' | 'Retired';
  dateJoined: string;
}

export interface TeachingAssignment {
  id: string;
  academicYear: string; // e.g. "2024-2025", "2025-2026", "2026-2027"
  programme: 'B.Pharm' | 'Pharm.D' | 'M.Pharm';
  semester: number;
  dept: string;
  courseCode: string;
  courseName: string;
  facultyId: string;
  facultyName: string;
  teachingType: {
    theory: boolean;
    practical: boolean;
    tutorial: boolean;
  };
  role: 'Course Coordinator' | 'Faculty' | 'Supporting Faculty' | 'Lab In-charge';
  status?: 'Active' | 'Completed' | 'Draft';
}

export const DEFAULT_FACULTY_MASTER: FacultyMember[] = [
  {
    id: '1',
    name: 'Dr. J. Kavitha',
    empId: '1800682',
    dept: 'Department of Pharmaceutical Analysis',
    designation: '',
    email: 'kavithaj@srmist.edu.in',
    phone: '',
    status: 'Active',
    dateJoined: ''
  },
  {
    id: '2',
    name: 'Dr. K.S. Kokilambigai',
    empId: '1800944',
    dept: 'Department of Pharmaceutical Analysis',
    designation: '',
    email: 'kokilams@srmist.edu.in',
    phone: '',
    status: 'Active',
    dateJoined: ''
  },
  {
    id: '3',
    name: 'Dr. B. ShanthaKumar',
    empId: '1803567',
    dept: 'Department of Pharmaceutical Chemistry',
    designation: '',
    email: 'shanthab@srmist.edu.in',
    phone: '',
    status: 'Active',
    dateJoined: ''
  },
  {
    id: '4',
    name: 'Dr. D.Priya',
    empId: '1801772',
    dept: 'Department of Pharmaceutical Chemistry',
    designation: '',
    email: 'priyad@srmist.edu.in',
    phone: '',
    status: 'Active',
    dateJoined: ''
  },
  {
    id: '5',
    name: 'Dr. G.V. Anjana',
    empId: '1803942',
    dept: 'Department of Pharmaceutical Chemistry',
    designation: '',
    email: 'anjanag@srmist.edu.in',
    phone: '',
    status: 'Active',
    dateJoined: ''
  },
  {
    id: '6',
    name: 'Dr. Gandi Sony Pears',
    empId: '1809427',
    dept: 'Department of Pharmaceutical Chemistry',
    designation: '',
    email: 'gandip@srmist.edu.in',
    phone: '',
    status: 'Active',
    dateJoined: ''
  },
  {
    id: '7',
    name: 'Dr. T. Sundarrajan',
    empId: '1802470',
    dept: 'Department of Pharmaceutical Chemistry',
    designation: '',
    email: 'sundarrt@srmist.edu.in',
    phone: '',
    status: 'Active',
    dateJoined: ''
  },
  {
    id: '8',
    name: 'Dr. V. Velmurugan',
    empId: '1801779',
    dept: 'Department of Pharmaceutical Chemistry',
    designation: '',
    email: 'velmuruv@srmist.edu.in',
    phone: '',
    status: 'Active',
    dateJoined: ''
  },
  {
    id: '9',
    name: 'Dr.P. Jaividhya',
    empId: '1809141',
    dept: 'Department of Pharmaceutical Chemistry',
    designation: '',
    email: 'jaividhp1@srmist.edu.in',
    phone: '',
    status: 'Active',
    dateJoined: ''
  },
  {
    id: '10',
    name: 'Prof. M.K. Kathiravan',
    empId: '1803241',
    dept: 'Department of Pharmaceutical Chemistry',
    designation: '',
    email: 'kathirak@srmist.edu.in',
    phone: '',
    status: 'Active',
    dateJoined: ''
  },
  {
    id: '11',
    name: 'Dr. Farhath Sherin',
    empId: '1809500',
    dept: 'Department of Pharmaceutics',
    designation: '',
    email: 'farhaths@srmist.edu.in',
    phone: '',
    status: 'Active',
    dateJoined: ''
  },
  {
    id: '12',
    name: 'Dr. P.N. Remya',
    empId: '1800404',
    dept: 'Department of Pharmaceutics',
    designation: '',
    email: 'remyan@srmist.edu.in',
    phone: '',
    status: 'Active',
    dateJoined: ''
  },
  {
    id: '13',
    name: 'Dr. R. Kavitha',
    empId: '1800391',
    dept: 'Department of Pharmaceutics',
    designation: '',
    email: 'kavithar@srmist.edu.in',
    phone: '',
    status: 'Active',
    dateJoined: ''
  },
  {
    id: '14',
    name: 'Dr. Soji S',
    empId: '1809604',
    dept: 'Department of Pharmaceutics',
    designation: '',
    email: 'sojis@srmist.edu.in',
    phone: '',
    status: 'Active',
    dateJoined: ''
  },
  {
    id: '15',
    name: 'Prof. M.S. Umashankar',
    empId: '1802073',
    dept: 'Department of Pharmaceutics',
    designation: '',
    email: 'umashans@srmist.edu.in',
    phone: '',
    status: 'Active',
    dateJoined: ''
  },
  {
    id: '16',
    name: 'Prof. N. Damodharan',
    empId: '1800014',
    dept: 'Department of Pharmaceutics',
    designation: '',
    email: 'damodhan@srmist.edu.in',
    phone: '',
    status: 'Active',
    dateJoined: ''
  },
  {
    id: '17',
    name: 'Prof. S. Sangeetha',
    empId: '1800708',
    dept: 'Department of Pharmaceutics',
    designation: '',
    email: 'sangeets2@srmist.edu.in',
    phone: '',
    status: 'Active',
    dateJoined: ''
  },
  {
    id: '18',
    name: 'Dr. J. Narayanan',
    empId: '1805447',
    dept: 'Department of Pharmacology',
    designation: '',
    email: 'narayanj@srmist.edu.in',
    phone: '',
    status: 'Active',
    dateJoined: ''
  },
  {
    id: '19',
    name: 'Dr. K. Gayathiri',
    empId: '1804020',
    dept: 'Department of Pharmacology',
    designation: '',
    email: 'gayathik@srmist.edu.in',
    phone: '',
    status: 'Active',
    dateJoined: ''
  },
  {
    id: '20',
    name: 'Dr. K. Gowri',
    empId: '1800943',
    dept: 'Department of Pharmacology',
    designation: '',
    email: 'gowrik@srmist.edu.in',
    phone: '',
    status: 'Active',
    dateJoined: ''
  },
  {
    id: '21',
    name: 'Dr. M. Sumithra',
    empId: '1802074',
    dept: 'Department of Pharmacology',
    designation: '',
    email: 'sumithrm@srmist.edu.in',
    phone: '',
    status: 'Active',
    dateJoined: ''
  },
  {
    id: '22',
    name: 'Dr. N. Krishna Prabha',
    empId: '1808476',
    dept: 'Department of Pharmacology',
    designation: '',
    email: 'krishnan4@srmist.edu.in',
    phone: '',
    status: 'Active',
    dateJoined: ''
  },
  {
    id: '23',
    name: 'Mrs. R Sridevi',
    empId: '1806037',
    dept: 'Department of Pharmacology',
    designation: '',
    email: 'sridevir@srmist.edu.in',
    phone: '',
    status: 'Active',
    dateJoined: ''
  },
  {
    id: '24',
    name: 'Dr. A. Priyadharshini',
    empId: '1804609',
    dept: 'Department of Pharmacy Practice',
    designation: '',
    email: 'priyadha@srmist.edu.in',
    phone: '',
    status: 'Active',
    dateJoined: ''
  },
  {
    id: '25',
    name: 'Dr. CH Hemanth Kumar',
    empId: '1807591',
    dept: 'Department of Pharmacy Practice',
    designation: '',
    email: 'hemanthk@srmist.edu.in',
    phone: '',
    status: 'Active',
    dateJoined: ''
  },
  {
    id: '26',
    name: 'Dr. G.P. Pazhani',
    empId: '1807218',
    dept: 'Department of Pharmacy Practice',
    designation: '',
    email: 'gururajp@srmist.edu.in',
    phone: '',
    status: 'Active',
    dateJoined: ''
  },
  {
    id: '27',
    name: 'Dr. K. Kanaka Parvathi',
    empId: '1808015',
    dept: 'Department of Pharmacy Practice',
    designation: '',
    email: 'kanakapk@srmist.edu.in',
    phone: '',
    status: 'Active',
    dateJoined: ''
  },
  {
    id: '28',
    name: 'Dr. Kella Alekhya',
    empId: '1807662',
    dept: 'Department of Pharmacy Practice',
    designation: '',
    email: 'kellaals@srmist.edu.in',
    phone: '',
    status: 'Active',
    dateJoined: ''
  },
  {
    id: '29',
    name: 'Dr. M. Jagadeesan',
    empId: '1804057',
    dept: 'Department of Pharmacy Practice',
    designation: '',
    email: 'jagadeem1@srmist.edu.in',
    phone: '',
    status: 'Active',
    dateJoined: ''
  },
  {
    id: '30',
    name: 'Dr. M.G. Rajanandh',
    empId: '1808535',
    dept: 'Department of Pharmacy Practice',
    designation: '',
    email: 'mgr@srmist.edu.in',
    phone: '',
    status: 'Active',
    dateJoined: ''
  },
  {
    id: '31',
    name: 'Dr. Nandimandalam Sai Supra Siddhu',
    empId: '1807856',
    dept: 'Department of Pharmacy Practice',
    designation: '',
    email: 'nandimak1@srmist.edu.in',
    phone: '',
    status: 'Active',
    dateJoined: ''
  },
  {
    id: '32',
    name: 'Dr. Rapuru Rushendran',
    empId: '1809719',
    dept: 'Department of Pharmacy Practice',
    designation: '',
    email: 'rushendr@srmist.edu.in',
    phone: '',
    status: 'Active',
    dateJoined: ''
  },
  {
    id: '33',
    name: 'Dr. S. Sarumathy',
    empId: '1803949',
    dept: 'Department of Pharmacy Practice',
    designation: '',
    email: 'sarumats@srmist.edu.in',
    phone: '',
    status: 'Active',
    dateJoined: ''
  },
  {
    id: '34',
    name: 'Dr. T.M. Vijayakumar',
    empId: '1803251',
    dept: 'Department of Pharmacy Practice',
    designation: '',
    email: 'vijayakm2@srmist.edu.in',
    phone: '',
    status: 'Active',
    dateJoined: ''
  },
  {
    id: '35',
    name: 'Dr. V. Manimaran',
    empId: '1800390',
    dept: 'Department of Pharmacy Practice',
    designation: '',
    email: 'manimarv@srmist.edu.in',
    phone: '',
    status: 'Active',
    dateJoined: ''
  },
  {
    id: '36',
    name: 'Dr. M. Thirumal',
    empId: '1803295',
    dept: 'Department of Pharmacognosy',
    designation: '',
    email: 'thirumam@srmist.edu.in',
    phone: '',
    status: 'Active',
    dateJoined: ''
  },
  {
    id: '37',
    name: 'Dr. Sakthi Priyadarsini S',
    empId: '1804271',
    dept: 'Department of Pharmacognosy',
    designation: '',
    email: 'sakthips1@srmist.edu.in',
    phone: '',
    status: 'Active',
    dateJoined: ''
  }
];

// Seed initial teaching assignments for realistic history
export const DEFAULT_TEACHING_ASSIGNMENTS: TeachingAssignment[] = [
  // 2024-2025 Academic Year
  {
    id: 'ta-24-1',
    academicYear: '2024-2025',
    programme: 'B.Pharm',
    semester: 1,
    dept: 'Department of Pharmacology',
    courseCode: 'BP101T',
    courseName: 'Human Anatomy and Physiology I - Theory',
    facultyId: '19',
    facultyName: 'Dr. K. Gayathiri',
    teachingType: { theory: true, practical: true, tutorial: false },
    role: 'Course Coordinator',
    status: 'Completed'
  },
  {
    id: 'ta-24-2',
    academicYear: '2024-2025',
    programme: 'B.Pharm',
    semester: 4,
    dept: 'Department of Pharmacology',
    courseCode: 'BP401T',
    courseName: 'Pharmaceutical Organic Chemistry III',
    facultyId: '3',
    facultyName: 'Dr. B. ShanthaKumar',
    teachingType: { theory: true, practical: false, tutorial: false },
    role: 'Course Coordinator',
    status: 'Completed'
  },
  {
    id: 'ta-24-3',
    academicYear: '2024-2025',
    programme: 'B.Pharm',
    semester: 2,
    dept: 'Department of Pharmaceutical Analysis',
    courseCode: 'BP206T',
    courseName: 'Environmental Sciences',
    facultyId: '2',
    facultyName: 'Dr. K.S. Kokilambigai',
    teachingType: { theory: true, practical: false, tutorial: false },
    role: 'Course Coordinator',
    status: 'Completed'
  },
  {
    id: 'ta-24-4',
    academicYear: '2024-2025',
    programme: 'B.Pharm',
    semester: 5,
    dept: 'Department of Pharmaceutical Chemistry',
    courseCode: 'BP501T',
    courseName: 'Medicinal Chemistry II - Theory',
    facultyId: '4',
    facultyName: 'Dr. D.Priya',
    teachingType: { theory: true, practical: false, tutorial: false },
    role: 'Course Coordinator',
    status: 'Completed'
  },
  {
    id: 'ta-24-5',
    academicYear: '2024-2025',
    programme: 'B.Pharm',
    semester: 3,
    dept: 'Department of Pharmaceutics',
    courseCode: 'BP302T',
    courseName: 'Physical Pharmaceutics I - Theory',
    facultyId: '12',
    facultyName: 'Dr. P.N. Remya',
    teachingType: { theory: true, practical: true, tutorial: false },
    role: 'Faculty',
    status: 'Completed'
  },

  // 2025-2026 Academic Year (Active)
  {
    id: 'ta-25-1',
    academicYear: '2025-2026',
    programme: 'B.Pharm',
    semester: 1,
    dept: 'Department of Pharmacology',
    courseCode: 'BP101T',
    courseName: 'Human Anatomy and Physiology I - Theory',
    facultyId: '19',
    facultyName: 'Dr. K. Gayathiri',
    teachingType: { theory: true, practical: true, tutorial: false },
    role: 'Course Coordinator',
    status: 'Active'
  },
  {
    id: 'ta-25-2',
    academicYear: '2025-2026',
    programme: 'B.Pharm',
    semester: 2,
    dept: 'Department of Pharmacology',
    courseCode: 'BP201T',
    courseName: 'Human Anatomy and Physiology II - Theory',
    facultyId: '19',
    facultyName: 'Dr. K. Gayathiri',
    teachingType: { theory: true, practical: true, tutorial: false },
    role: 'Course Coordinator',
    status: 'Active'
  },
  {
    id: 'ta-25-3',
    academicYear: '2025-2026',
    programme: 'B.Pharm',
    semester: 4,
    dept: 'Department of Pharmacology',
    courseCode: 'BP401T',
    courseName: 'Pharmaceutical Organic Chemistry III',
    facultyId: '3',
    facultyName: 'Dr. B. ShanthaKumar',
    teachingType: { theory: true, practical: false, tutorial: false },
    role: 'Course Coordinator',
    status: 'Active'
  },
  {
    id: 'ta-25-4',
    academicYear: '2025-2026',
    programme: 'B.Pharm',
    semester: 2,
    dept: 'Department of Pharmaceutical Analysis',
    courseCode: 'BP206T',
    courseName: 'Environmental Sciences',
    facultyId: '2',
    facultyName: 'Dr. K.S. Kokilambigai',
    teachingType: { theory: true, practical: false, tutorial: false },
    role: 'Course Coordinator',
    status: 'Active'
  },
  {
    id: 'ta-25-5',
    academicYear: '2025-2026',
    programme: 'B.Pharm',
    semester: 7,
    dept: 'Department of Pharmaceutical Analysis',
    courseCode: 'BP701T',
    courseName: 'Instrumental Methods of Analysis',
    facultyId: '2',
    facultyName: 'Dr. K.S. Kokilambigai',
    teachingType: { theory: true, practical: true, tutorial: false },
    role: 'Course Coordinator',
    status: 'Active'
  },
  {
    id: 'ta-25-6',
    academicYear: '2025-2026',
    programme: 'B.Pharm',
    semester: 5,
    dept: 'Department of Pharmaceutical Chemistry',
    courseCode: 'BP501T',
    courseName: 'Medicinal Chemistry II - Theory',
    facultyId: '4',
    facultyName: 'Dr. D.Priya',
    teachingType: { theory: true, practical: false, tutorial: false },
    role: 'Course Coordinator',
    status: 'Active'
  },
  {
    id: 'ta-25-7',
    academicYear: '2025-2026',
    programme: 'B.Pharm',
    semester: 6,
    dept: 'Department of Pharmaceutical Chemistry',
    courseCode: 'BP601T',
    courseName: 'Medicinal Chemistry III - Theory',
    facultyId: '4',
    facultyName: 'Dr. D.Priya',
    teachingType: { theory: true, practical: false, tutorial: false },
    role: 'Course Coordinator',
    status: 'Active'
  },
  {
    id: 'ta-25-8',
    academicYear: '2025-2026',
    programme: 'B.Pharm',
    semester: 3,
    dept: 'Department of Pharmaceutical Chemistry',
    courseCode: 'BP301T',
    courseName: 'Pharmaceutical Organic Chemistry II - Theory',
    facultyId: '5',
    facultyName: 'Dr. G.V. Anjana',
    teachingType: { theory: true, practical: false, tutorial: false },
    role: 'Faculty',
    status: 'Active'
  },
  {
    id: 'ta-25-9',
    academicYear: '2025-2026',
    programme: 'B.Pharm',
    semester: 1,
    dept: 'Department of Pharmaceutical Chemistry',
    courseCode: 'BP104T',
    courseName: 'Pharmaceutical Inorganic Chemistry - Theory',
    facultyId: '6',
    facultyName: 'Dr. Gandi Sony Pears',
    teachingType: { theory: true, practical: true, tutorial: false },
    role: 'Course Coordinator',
    status: 'Active'
  },
  {
    id: 'ta-25-10',
    academicYear: '2025-2026',
    programme: 'B.Pharm',
    semester: 1,
    dept: 'Department of Pharmaceutics',
    courseCode: 'BP103T',
    courseName: 'Pharmaceutics I - Theory',
    facultyId: '11',
    facultyName: 'Dr. Farhath Sherin',
    teachingType: { theory: true, practical: true, tutorial: false },
    role: 'Course Coordinator',
    status: 'Active'
  },
  {
    id: 'ta-25-11',
    academicYear: '2025-2026',
    programme: 'B.Pharm',
    semester: 3,
    dept: 'Department of Pharmaceutics',
    courseCode: 'BP302T',
    courseName: 'Physical Pharmaceutics I - Theory',
    facultyId: '12',
    facultyName: 'Dr. P.N. Remya',
    teachingType: { theory: true, practical: true, tutorial: false },
    role: 'Course Coordinator',
    status: 'Active'
  },
  {
    id: 'ta-25-12',
    academicYear: '2025-2026',
    programme: 'B.Pharm',
    semester: 3,
    dept: 'Department of Pharmaceutics',
    courseCode: 'BP303T',
    courseName: 'Pharmaceutical Microbiology - Theory',
    facultyId: '13',
    facultyName: 'Dr. R. Kavitha',
    teachingType: { theory: true, practical: true, tutorial: false },
    role: 'Course Coordinator',
    status: 'Active'
  },
  {
    id: 'ta-25-13',
    academicYear: '2025-2026',
    programme: 'B.Pharm',
    semester: 5,
    dept: 'Department of Pharmacology',
    courseCode: 'BP503T',
    courseName: 'Pharmacology II - Theory',
    facultyId: '20',
    facultyName: 'Dr. K. Gowri',
    teachingType: { theory: true, practical: false, tutorial: false },
    role: 'Course Coordinator',
    status: 'Active'
  },
  {
    id: 'ta-25-14',
    academicYear: '2025-2026',
    programme: 'B.Pharm',
    semester: 6,
    dept: 'Department of Pharmacognosy',
    courseCode: 'BP603T',
    courseName: 'Herbal Drug Technology - Theory',
    facultyId: '36',
    facultyName: 'Dr. M. Thirumal',
    teachingType: { theory: true, practical: true, tutorial: false },
    role: 'Course Coordinator',
    status: 'Active'
  },
  {
    id: 'ta-25-15',
    academicYear: '2025-2026',
    programme: 'B.Pharm',
    semester: 4,
    dept: 'Department of Pharmacognosy',
    courseCode: 'BP405T',
    courseName: 'Pharmacognosy and Phytochemistry I - Theory',
    facultyId: '37',
    facultyName: 'Dr. Sakthi Priyadarsini S',
    teachingType: { theory: true, practical: true, tutorial: false },
    role: 'Course Coordinator',
    status: 'Active'
  }
];

// Local Storage Master Management Functions
export function getFacultyMaster(): FacultyMember[] {
  if (typeof window === 'undefined') return DEFAULT_FACULTY_MASTER;
  const saved = localStorage.getItem('srm_lms_faculty_master_v3');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch (e) {
      console.error('Error reading srm_lms_faculty_master_v3:', e);
    }
  }

  localStorage.setItem('srm_lms_faculty_master_v3', JSON.stringify(DEFAULT_FACULTY_MASTER));
  return DEFAULT_FACULTY_MASTER;
}

export function saveFacultyMaster(list: FacultyMember[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('srm_lms_faculty_master_v3', JSON.stringify(list));
  }
}

export function getTeachingAssignments(): TeachingAssignment[] {
  if (typeof window === 'undefined') return DEFAULT_TEACHING_ASSIGNMENTS;
  const saved = localStorage.getItem('srm_lms_teaching_assignments');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch (e) {
      console.error('Error reading srm_lms_teaching_assignments:', e);
    }
  }
  localStorage.setItem('srm_lms_teaching_assignments', JSON.stringify(DEFAULT_TEACHING_ASSIGNMENTS));
  return DEFAULT_TEACHING_ASSIGNMENTS;
}

export function saveTeachingAssignments(list: TeachingAssignment[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('srm_lms_teaching_assignments', JSON.stringify(list));
  }
}

export function resolveFacultyForCourse(context: {
  academicYear?: string;
  programme?: string;
  regulation?: string;
  semesterOrYear?: number;
  subjectCode: string;
}): string {
  const assignments = getTeachingAssignments();
  const codeToMatch = context.subjectCode.toUpperCase().trim();
  
  const matched = assignments.filter(a => {
    const codeMatch = a.courseCode.toUpperCase().trim() === codeToMatch;
    if (!codeMatch) return false;
    if (context.academicYear && a.academicYear !== context.academicYear) {
      return false;
    }
    return true;
  });

  if (matched.length > 0) {
    const uniqueNames = Array.from(new Set(matched.map(m => m.facultyName)));
    return uniqueNames.join(', ');
  }

  // Fallback: search without year constraint if exact year not specified or missing
  const fallbackMatched = assignments.filter(a => a.courseCode.toUpperCase().trim() === codeToMatch);
  if (fallbackMatched.length > 0) {
    const uniqueNames = Array.from(new Set(fallbackMatched.map(m => m.facultyName)));
    return uniqueNames.join(', ');
  }

  return 'Not Assigned';
}

export function getFacultyTeachingHistory(facultyId: string): Record<string, TeachingAssignment[]> {
  const assignments = getTeachingAssignments();
  const facultyAssignments = assignments.filter(a => a.facultyId === facultyId);
  
  const grouped: Record<string, TeachingAssignment[]> = {};
  facultyAssignments.forEach(a => {
    if (!grouped[a.academicYear]) {
      grouped[a.academicYear] = [];
    }
    grouped[a.academicYear].push(a);
  });
  
  return grouped;
}

export function copyAllocations(sourceYear: string, targetYear: string): TeachingAssignment[] {
  const current = getTeachingAssignments();
  const sourceItems = current.filter(a => a.academicYear === sourceYear);
  
  // Remove existing allocations for target year before replacing
  const otherItems = current.filter(a => a.academicYear !== targetYear);
  
  const newAssignments: TeachingAssignment[] = sourceItems.map((item, idx) => ({
    ...item,
    id: `ta-copy-${Date.now()}-${idx}`,
    academicYear: targetYear,
    status: 'Active'
  }));

  const updatedList = [...otherItems, ...newAssignments];
  saveTeachingAssignments(updatedList);
  return updatedList;
}

// Backward compatibility alias for legacy code
export const DEFAULT_FACULTY = DEFAULT_FACULTY_MASTER;
