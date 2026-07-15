import { 
  LayoutDashboard, BookOpen, GraduationCap, Calendar, 
  TrendingUp, Bell, Library, User, Settings, Sliders, 
  Users, ClipboardList, BarChart3, Database, ShieldAlert
} from 'lucide-react';
import GlassCard from './GlassCard';

interface SidebarProps {
  currentRole: 'Student' | 'Faculty' | 'Admin';
  onChangeRole: (role: 'Student' | 'Faculty' | 'Admin') => void;
  currentScreen: string;
  onChangeScreen: (screen: string) => void;
}

export default function Sidebar({
  currentRole,
  onChangeRole,
  currentScreen,
  onChangeScreen,
}: SidebarProps) {
  
  // Menu items config for each role
  const studentMenu = [
    { id: 'student-dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'student-subjects', label: 'Subjects', icon: BookOpen },
    { id: 'student-progress', label: 'My Progress', icon: TrendingUp },
    { id: 'student-announcements', label: 'Announcements', icon: Bell },
    { id: 'student-profile', label: 'My Profile', icon: User },
  ];

  const facultyMenu = [
    { id: 'faculty-dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'faculty-courses', label: 'Courses', icon: BookOpen },
    { id: 'faculty-subjects', label: 'Course Manager', icon: Sliders },
    { id: 'faculty-analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'faculty-profile', label: 'Faculty Profile', icon: User },
  ];

  const adminMenu = [
    { id: 'admin-dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'faculty-courses', label: 'Courses', icon: BookOpen },
    { id: 'faculty-subjects', label: 'Course Manager', icon: Sliders },
    { id: 'admin-programmes', label: 'Programmes', icon: GraduationCap },
    { id: 'admin-faculty', label: 'Faculty Registry', icon: Users },
    { id: 'admin-students', label: 'Student Registry', icon: Users },
    { id: 'admin-years', label: 'Academic Years', icon: Database },
  ];

  const getMenuForRole = () => {
    switch (currentRole) {
      case 'Student': return studentMenu;
      case 'Faculty': return facultyMenu;
      case 'Admin': return adminMenu;
    }
  };

  const menuItems = getMenuForRole();

  return (
    <GlassCard className="h-[calc(100vh-2rem)] w-72 flex flex-col justify-between p-6 select-none sticky top-4 left-4">
      {/* Brand Section */}
      <div className="flex flex-col gap-5">
        <div className="flex items-center gap-3 border-b border-white/20 pb-5">
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#8B1E3F] to-[#CD4368] flex items-center justify-center text-white shadow-lg shadow-maroon-900/20">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-display font-bold text-lg text-gray-900 leading-tight">
              SRMCOP <span className="text-[#8B1E3F]">EduHub</span>
            </h1>
            <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">
              SRM College of Pharmacy
            </p>
          </div>
        </div>

        {/* Dynamic Navigation Options */}
        <div className="flex flex-col gap-2">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest pl-3 mb-1">
            {currentRole} Navigation
          </p>
          <nav className="flex flex-col gap-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentScreen === item.id || currentScreen.startsWith(item.id + '-') || (item.id === 'faculty-courses' && currentScreen === 'faculty-course-viewer');
              return (
                <button
                  key={item.id}
                  onClick={() => onChangeScreen(item.id)}
                  className={`
                    group flex items-center gap-3.5 px-4 py-3 rounded-full text-sm font-medium transition-all duration-300 relative overflow-hidden
                    ${isActive 
                      ? 'text-white shadow-md shadow-maroon-900/10' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white/40'
                    }
                  `}
                >
                  {/* Glowing background capsule for the active item */}
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-[#8B1E3F] to-[#b32a4e] z-0" />
                  )}
                  
                  {/* Custom Frosted Glass Circle Icon Wrapper */}
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 z-10
                    ${isActive 
                      ? 'bg-white/20 text-white' 
                      : 'bg-gray-100/60 text-gray-500 group-hover:bg-white/80 group-hover:text-[#8B1E3F] shadow-sm'
                    }
                  `}>
                    <Icon className="w-4 h-4" />
                  </div>
                  
                  <span className="z-10 relative">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Role Selector & Account Section */}
      <div className="flex flex-col gap-4 border-t border-white/20 pt-5">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest pl-3">
          Simulate Workspace
        </p>
        
        {/* Apple-style Segmented Control */}
        <div className="p-1 bg-gray-200/50 backdrop-blur-md rounded-full flex gap-1 border border-white/30 overflow-x-auto select-none no-scrollbar">
          {(['Student', 'Faculty', 'Admin'] as const).map((role) => (
            <button
              key={role}
              onClick={() => {
                onChangeRole(role);
                // Automatically route to their primary dashboard when switching roles
                onChangeScreen(`${role.toLowerCase()}-dashboard`);
              }}
              className={`
                flex-1 text-[10px] font-bold py-1.5 px-2.5 rounded-full transition-all duration-300 whitespace-nowrap
                ${currentRole === role
                  ? 'bg-white text-gray-900 shadow-sm font-black'
                  : 'text-gray-500 hover:text-gray-900'
                }
              `}
            >
              {role}
            </button>
          ))}
        </div>

        {/* User Info Capsule */}
        <div className="flex items-center gap-3 bg-white/40 border border-white/20 p-2.5 rounded-full">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#8B1E3F] to-rose-400 flex items-center justify-center text-white font-bold text-xs shadow-inner shrink-0">
            {currentRole === 'Student' ? 'JA' : currentRole === 'Faculty' ? 'VC' : 'JN'}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-semibold text-gray-900 truncate">
              {currentRole === 'Student' ? 'J. Akash' : currentRole === 'Faculty' ? 'Dr. V. Chitra' : 'Dr. J. Narayanan'}
            </h4>
            <p className="text-[10px] text-gray-500 truncate">
              {currentRole === 'Student' ? 'Year I (B.Pharm)' : currentRole === 'Faculty' ? 'Professor Pharmacology' : 'Emp ID: 1805447'}
            </p>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
