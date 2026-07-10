export type ProgrammeType = 'B.Pharm' | 'Pharm.D' | 'M.Pharm' | 'Ph.D.' | 'Certificate';

export interface Resource {
  id: string;
  type: 'Video' | 'PDF' | 'Slides' | 'Notes' | 'Quiz' | 'Assignment';
  title: string;
  description: string;
  duration?: string; // For videos, e.g., "45 mins"
  fileSize?: string;  // For PDFs/Slides, e.g., "4.2 MB"
  questionsCount?: number; // For Quizzes
  dueDate?: string; // For Assignments
  status: 'completed' | 'in-progress' | 'not-started';
  url?: string;
  content?: string; // HTML or text preview content
  grade?: string; // For graded assignments/quizzes
  unit?: string; // e.g. "Unit I", "Unit II", etc.
  topicCode?: string; // Optional topic association
}

export interface Subject {
  id: string;
  code: string;
  name: string;
  programme: ProgrammeType;
  year: number;
  semester: number;
  facultyName: string;
  progress: number; // e.g., 68 (for 68%)
  color: string; // Tailwind gradient/color class
  resources: Resource[];
  academicYear?: string; // e.g., "2025-2026"
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  sender: string;
  role: 'Faculty' | 'Admin';
  category: 'academic' | 'exam' | 'event' | 'general';
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number; // index of options
  explanation: string;
}

export interface Quiz {
  id: string;
  subjectId: string;
  title: string;
  description: string;
  questions: QuizQuestion[];
  timeLimit: number; // in minutes
}

export interface StudentProgress {
  studentName: string;
  registerNumber: string;
  programme: ProgrammeType;
  year: number;
  semester: number;
  attendance: number; // percentage
  gpa: number; // e.g., 8.92
  completedLectures: number;
  totalLectures: number;
}

export interface FacultyProfile {
  name: string;
  designation: string;
  department: string;
  email: string;
  subjects: string[]; // subject IDs
  phone?: string;
}

export interface AcademicYear {
  id: string;
  name: string; // e.g., "2025-2026"
  isActive: boolean;
}

export interface SemesterConfig {
  id: string;
  name: string; // e.g., "Semester 1", "Semester 2"
  programme: ProgrammeType;
  year: number;
}
