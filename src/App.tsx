/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { mockAnnouncements, mockStudentProgress, mockFacultyProfile, sampleQuiz } from './data/mockData';
import { Subject, Resource, Announcement, QuizQuestion } from './types';
import { getAppSubjects } from './data/curriculumDb';
import { downloadFirestoreToLocal } from './lib/firebase';

// UI components
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import GlassCard from './components/GlassCard';
import LoginModule from './components/LoginModule';

// Student screens
import StudentDashboard from './components/student/StudentDashboard';
import SubjectList from './components/student/SubjectList';
import SubjectHome from './components/student/SubjectHome';
import VideoPlayer from './components/student/VideoPlayer';
import PdfReader from './components/student/PdfReader';
import StudentQuiz from './components/student/StudentQuiz';
import StudentCalendar from './components/student/StudentCalendar';
import StudentProgress from './components/student/StudentProgress';
import LibraryView from './components/student/LibraryView';
import ProfileView from './components/student/ProfileView';
import AnnouncementsView from './components/student/AnnouncementsView';

// Faculty screens
import FacultyDashboard from './components/faculty/FacultyDashboard';
import SubjectManagement from './components/faculty/SubjectManagement';
import CreateQuiz from './components/faculty/CreateQuiz';
import FacultyAssignments from './components/faculty/FacultyAssignments';
import FacultyAnalytics from './components/faculty/FacultyAnalytics';
import CourseDesignerHub from './components/faculty/CourseDesignerHub';

// Admin screens
import AdminDashboard from './components/admin/AdminDashboard';
import ManageProgrammes from './components/admin/ManageProgrammes';
import ManageFaculty from './components/admin/ManageFaculty';
import AcademicYears from './components/admin/AcademicYears';
import ManageStudents from './components/admin/ManageStudents';
import AcademicCalendarModule from './components/AcademicCalendarModule';
import AdminAnalytics from './components/admin/AdminAnalytics';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [currentRole, setCurrentRole] = useState<'Student' | 'Faculty' | 'Admin'>('Student');
  const [currentScreen, setCurrentScreen] = useState<string>('student-dashboard');
  const [impersonatedUser, setImpersonatedUser] = useState<{ role: 'Student' | 'Faculty' | 'Admin'; name: string } | null>(null);
  const [selectedProgramme, setSelectedProgramme] = useState<'B.Pharm' | 'Pharm.D'>('B.Pharm');
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogin = (role: 'Student' | 'Faculty' | 'Admin') => {
    setCurrentRole(role);
    setCurrentScreen(`${role.toLowerCase()}-dashboard`);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  // Persistent database simulation
  const [subjects, setSubjects] = useState<Subject[]>(() => getAppSubjects());
  const [announcements, setAnnouncements] = useState<Announcement[]>(mockAnnouncements);
  const [activeSubjectId, setActiveSubjectId] = useState<string | null>(null);
  const [activeResource, setActiveResource] = useState<Resource | null>(null);

  // Sync subjects when navigating to capture any curriculum modifications
  useEffect(() => {
    setSubjects(getAppSubjects());
  }, [currentScreen]);

  // Initial Firestore database synchronization on mount
  useEffect(() => {
    async function initFirestore() {
      const success = await downloadFirestoreToLocal();
      if (success) {
        setSubjects(getAppSubjects());
      }
    }
    initFirestore();
  }, []);

  const handleImpersonateUser = (role: 'Student' | 'Faculty' | 'Admin', name: string) => {
    setImpersonatedUser({ role, name });
    setCurrentRole(role);
    setCurrentScreen(`${role.toLowerCase()}-dashboard`);
  };

  // Update a subject's resource timeline list (called from Faculty resource manager)
  const handleUpdateSubjectResources = (subId: string, updatedRes: Resource[]) => {
    setSubjects(subjects.map((sub) => {
      if (sub.id === subId) {
        // Calculate new course progress percentage based on completed resources
        const total = updatedRes.length;
        const completed = updatedRes.filter(r => r.status === 'completed').length;
        const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
        
        return { ...sub, resources: updatedRes, progress };
      }
      return sub;
    }));
  };

  // Broadcast a new sessional bulletin announcement (called from Faculty dashboard broadcaster)
  const handleCreateAnnouncement = (title: string, content: string, category: 'academic' | 'exam' | 'event') => {
    const newAnn: Announcement = {
      id: `ann-created-${Date.now()}`,
      title,
      content,
      date: 'Today',
      sender: currentRole === 'Faculty' ? mockFacultyProfile.name : 'University Admin Office',
      role: currentRole === 'Faculty' ? 'Faculty' : 'Admin',
      category
    };
    setAnnouncements([newAnn, ...announcements]);
  };

  // Add a quiz designed by faculty into the subject resource timeline
  const handleSaveDraftedQuiz = (title: string, questions: QuizQuestion[], timeLimit: number) => {
    if (!activeSubjectId) return;

    // Build the quiz object structure
    const newQuizResource: Resource = {
      id: `res-quiz-${Date.now()}`,
      type: 'Quiz',
      title,
      description: `Interactive test comprising ${questions.length} multiple choice questions. Time limit: ${timeLimit} mins.`,
      questionsCount: questions.length,
      status: 'not-started',
    };

    setSubjects(subjects.map((sub) => {
      if (sub.id === activeSubjectId) {
        return {
          ...sub,
          resources: [newQuizResource, ...sub.resources]
        };
      }
      return sub;
    }));
  };

  // Handle click of course resource timeline item
  const handleSelectResource = (res: Resource) => {
    setActiveResource(res);
    if (res.type === 'Video') {
      setCurrentScreen('student-videoplayer');
    } else if (res.type === 'PDF' || res.type === 'Slides' || res.type === 'Notes') {
      setCurrentScreen('student-pdfreader');
    } else if (res.type === 'Quiz') {
      setCurrentScreen('student-quiz');
    } else if (res.type === 'Assignment') {
      setCurrentScreen('faculty-assignments'); // Fallback assignment submission review mockup
    }
  };

  // Core router rendering matching the active screen ID
  const renderScreenContent = () => {
    switch (currentScreen) {
      // --- Student Perspective ---
      case 'student-dashboard':
        return (
          <StudentDashboard
            studentProgress={mockStudentProgress}
            subjects={subjects}
            announcements={announcements}
            onGoToSubject={(subId) => {
              setActiveSubjectId(subId);
              setCurrentScreen('student-subject-home');
            }}
            onGoToScreen={setCurrentScreen}
          />
        );
      case 'student-subjects':
        return (
          <SubjectList
            subjects={subjects}
            selectedProgramme={selectedProgramme}
            onGoToSubject={(subId) => {
              setActiveSubjectId(subId);
              setCurrentScreen('student-subject-home');
            }}
            searchQuery={searchQuery}
            studentProgress={mockStudentProgress}
          />
        );
      case 'student-subject-home':
        const activeSub = subjects.find(s => s.id === activeSubjectId);
        return activeSub ? (
          <SubjectHome
            subject={activeSub}
            onBack={() => setCurrentScreen('student-subjects')}
            onSelectResource={handleSelectResource}
          />
        ) : null;
      case 'student-videoplayer':
        const currentSub = subjects.find(s => s.id === activeSubjectId);
        return activeResource && currentSub ? (
          <VideoPlayer
            resource={activeResource}
            subject={currentSub}
            onBack={() => setCurrentScreen('student-subject-home')}
            onUpdateSubjectResources={handleUpdateSubjectResources}
            onSelectResource={setActiveResource}
          />
        ) : null;
      case 'student-pdfreader':
        return activeResource ? (
          <PdfReader
            resource={activeResource}
            onBack={() => setCurrentScreen('student-subject-home')}
          />
        ) : null;
      case 'student-quiz':
        return (
          <StudentQuiz
            quiz={sampleQuiz}
            onBack={() => setCurrentScreen('student-subject-home')}
          />
        );
      case 'student-calendar':
        return <StudentCalendar />;
      case 'student-progress':
        return <StudentProgress selectedProgramme={selectedProgramme} />;
      case 'student-library':
        return <LibraryView />;
      case 'student-announcements':
        return <AnnouncementsView announcements={announcements} />;
      case 'student-profile':
        return <ProfileView role="Student" />;

      // --- Faculty Perspective ---
      case 'faculty-dashboard':
        return (
          <FacultyDashboard
            facultyProfile={mockFacultyProfile}
            subjects={subjects}
            announcements={announcements}
            onCreateAnnouncement={handleCreateAnnouncement}
            onGoToScreen={setCurrentScreen}
            onGoToSubject={(subId) => {
              setActiveSubjectId(subId);
              setCurrentScreen('faculty-course-viewer');
            }}
          />
        );
      case 'faculty-courses':
        return (
          <CourseDesignerHub
            facultyProfile={mockFacultyProfile}
            subjects={subjects}
            readOnly={true}
            isAdmin={currentRole === 'Admin'}
            onGoToSubject={(subId) => {
              setActiveSubjectId(subId);
              setCurrentScreen('faculty-course-viewer');
            }}
            onGoToScreen={setCurrentScreen}
            onRefreshSubjects={() => setSubjects(getAppSubjects())}
          />
        );
      case 'faculty-course-viewer':
        let viewerSub = subjects.find(s => s.id === activeSubjectId);
        if (!viewerSub && activeSubjectId) {
          const code = activeSubjectId.split('-')[0];
          viewerSub = subjects.find(s => s.code === code);
        }
        return viewerSub ? (
          <SubjectManagement
            subject={viewerSub}
            readOnly={true}
            onBack={() => {
              if (currentRole === 'Admin') {
                setCurrentScreen('admin-dashboard');
              } else {
                setCurrentScreen('faculty-courses');
              }
            }}
            onUpdateSubjectResources={handleUpdateSubjectResources}
          />
        ) : null;
      case 'faculty-subjects':
        return (
          <CourseDesignerHub
            facultyProfile={mockFacultyProfile}
            subjects={subjects}
            isAdmin={currentRole === 'Admin'}
            onGoToSubject={(subId) => {
              setActiveSubjectId(subId);
              setCurrentScreen('faculty-subject-management');
            }}
            onGoToScreen={setCurrentScreen}
            onRefreshSubjects={() => setSubjects(getAppSubjects())}
          />
        );
      case 'faculty-subject-management':
        let facultySub = subjects.find(s => s.id === activeSubjectId);
        if (!facultySub && activeSubjectId) {
          const code = activeSubjectId.split('-')[0];
          facultySub = subjects.find(s => s.code === code);
        }
        return facultySub ? (
          <SubjectManagement
            subject={facultySub}
            readOnly={false}
            onBack={() => {
              if (currentRole === 'Admin') {
                setCurrentScreen('admin-dashboard');
              } else {
                setCurrentScreen('faculty-subjects');
              }
            }}
            onUpdateSubjectResources={handleUpdateSubjectResources}
          />
        ) : null;
      case 'faculty-quiz':
        return (
          <CreateQuiz
            onBack={() => setCurrentScreen('faculty-dashboard')}
            onSaveQuiz={handleSaveDraftedQuiz}
          />
        );
      case 'faculty-assignments':
        return <FacultyAssignments onBack={() => setCurrentScreen('faculty-dashboard')} />;
      case 'faculty-analytics':
        return <FacultyAnalytics facultyProfile={mockFacultyProfile} subjects={subjects} />;
      case 'faculty-profile':
        return (
          <ProfileView
            role="Faculty"
            facultyProfile={mockFacultyProfile}
            subjects={subjects}
            onGoToSubject={setActiveSubjectId}
            onGoToScreen={setCurrentScreen}
          />
        );

      // --- Admin Perspective ---
      case 'admin-dashboard':
        return (
          <AdminDashboard
            onGoToScreen={setCurrentScreen}
            onGoToSubject={(subId) => {
              setActiveSubjectId(subId);
              setCurrentScreen('faculty-course-viewer');
            }}
            currentRole={currentRole}
            onChangeRole={setCurrentRole}
            subjects={subjects}
            onRefreshSubjects={() => setSubjects(getAppSubjects())}
            onImpersonateUser={handleImpersonateUser}
          />
        );
      case 'admin-programmes':
        return <ManageProgrammes onBack={() => setCurrentScreen('admin-dashboard')} />;
      case 'admin-faculty':
        return <ManageFaculty onBack={() => setCurrentScreen('admin-dashboard')} />;
      case 'admin-years':
        return <AcademicYears onBack={() => setCurrentScreen('admin-dashboard')} />;
      case 'admin-students':
        return <ManageStudents onBack={() => setCurrentScreen('admin-dashboard')} />;
      case 'admin-subjects':
        return (
          <SubjectList 
            subjects={subjects} 
            selectedProgramme="B.Pharm" 
            onGoToSubject={(subId) => {
              setActiveSubjectId(subId);
              setCurrentScreen('faculty-course-viewer');
            }} 
            searchQuery="" 
          />
        );
      case 'admin-permissions':
        return <ManageFaculty onBack={() => setCurrentScreen('admin-dashboard')} />;
      case 'admin-analytics':
        return <AdminAnalytics subjects={subjects} />;
      case 'academic-calendar':
        return <AcademicCalendarModule role={currentRole} />;

      default:
        return (
          <StudentDashboard
            studentProgress={mockStudentProgress}
            subjects={subjects}
            announcements={announcements}
            onGoToSubject={(subId) => {
              setActiveSubjectId(subId);
              setCurrentScreen('student-subject-home');
            }}
            onGoToScreen={setCurrentScreen}
          />
        );
    }
  };

  if (!isLoggedIn) {
    return <LoginModule onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-[#F7F8FC] text-slate-800 flex relative overflow-hidden font-sans antialiased" style={{ background: "radial-gradient(circle at top left, #FDFDFE, #F7F8FC)" }}>
      {/* Visual background nodes for Apple glass look */}
      <div className="absolute top-[-100px] left-[-100px] w-[500px] h-[500px] rounded-full bg-[#8B1E3F] blur-[120px] opacity-20 pointer-events-none" />
      <div className="absolute bottom-[-100px] right-[-50px] w-[400px] h-[400px] rounded-full bg-[#6366f1] blur-[100px] opacity-15 pointer-events-none" />

      {/* Main Layout framework */}
      <div className="flex w-full p-4 gap-6 relative z-10">
        
        {/* Sticky floating Sidebar */}
        <Sidebar
          currentRole={currentRole}
          onChangeRole={setCurrentRole}
          currentScreen={currentScreen}
          onChangeScreen={setCurrentScreen}
          onLogout={handleLogout}
        />

        {/* Content Container (Header + Routed Screens) */}
        <div className="flex-1 flex flex-col gap-6 min-w-0 max-h-[calc(100vh-2rem)] overflow-y-auto pr-2">
          
          {/* Floating Top Navigation */}
          <Header
            currentRole={currentRole}
            currentScreen={currentScreen}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedProgramme={selectedProgramme}
            setSelectedProgramme={setSelectedProgramme}
            onGoToScreen={setCurrentScreen}
          />

          {/* Impersonation Status Banner */}
          {impersonatedUser && (
            <div className="bg-gradient-to-r from-[#8B1E3F] via-[#CD4368] to-[#8B1E3F] text-white px-6 py-3.5 rounded-[20px] shadow-lg border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in shrink-0">
              <div className="flex items-center gap-3">
                <span className="flex h-2.5 w-2.5 relative shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
                </span>
                <span className="text-[9px] font-black leading-none uppercase tracking-widest bg-white/15 border border-white/10 px-2.5 py-1 rounded-full shrink-0">
                  Super-User Override Active
                </span>
                <p className="text-xs font-medium text-pink-50 leading-normal">
                  Currently impersonating <strong className="font-extrabold text-white">{impersonatedUser.name} ({impersonatedUser.role})</strong>. Feel free to view or modify their files and courses.
                </p>
              </div>
              <button 
                onClick={() => {
                  setCurrentRole('Admin');
                  setImpersonatedUser(null);
                  setCurrentScreen('admin-dashboard');
                }}
                className="bg-white text-[#8B1E3F] hover:bg-pink-50 text-[10px] font-black uppercase tracking-widest px-4.5 py-2 rounded-full shadow-md active:scale-95 transition-all shrink-0 border border-transparent"
              >
                Exit Impersonation
              </button>
            </div>
          )}

          {/* Routed Screen Area */}
          <main className="w-full pb-8">
            {renderScreenContent()}
          </main>
        </div>
      </div>
    </div>
  );
}
