import { 
  LayoutDashboard, BookOpen, GraduationCap, Calendar, 
  TrendingUp, Bell, Library, User, Settings, Sliders, 
  Users, ClipboardList, BarChart3, Database, ShieldAlert,
  LogOut
} from 'lucide-react';
import GlassCard from './GlassCard';

interface SidebarProps {
  currentRole: 'Student' | 'Faculty' | 'Admin';
  onChangeRole: (role: 'Student' | 'Faculty' | 'Admin') => void;
  currentScreen: string;
  onChangeScreen: (screen: string) => void;
  onLogout?: () => void;
  activeUser?: { name: string; subtext: string };
}

export default function Sidebar({
  currentRole,
  onChangeRole,
  currentScreen,
  onChangeScreen,
  onLogout,
  activeUser,
}: SidebarProps) {
  
  // Menu items config for each role
  const studentMenu = [
    { id: 'student-dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'student-subjects', label: 'Subjects', icon: BookOpen },
    { id: 'student-progress', label: 'My Progress', icon: TrendingUp },
    { id: 'academic-calendar', label: 'Academic Calendar', icon: Calendar },
    { id: 'student-announcements', label: 'Announcements', icon: Bell },
    { id: 'student-profile', label: 'My Profile', icon: User },
  ];

  const facultyMenu = [
    { id: 'faculty-dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'faculty-courses', label: 'Courses', icon: BookOpen },
    { id: 'faculty-subjects', label: 'Course Manager', icon: Sliders },
    { id: 'academic-calendar', label: 'Academic Calendar', icon: Calendar },
    { id: 'faculty-analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'faculty-profile', label: 'Faculty Profile', icon: User },
  ];

  const adminMenu = [
    { id: 'admin-dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'admin-analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'faculty-courses', label: 'Courses', icon: BookOpen },
    { id: 'faculty-subjects', label: 'Course Manager', icon: Sliders },
    { id: 'admin-programmes', label: 'Programmes', icon: GraduationCap },
    { id: 'admin-faculty', label: 'Faculty Registry', icon: Users },
    { id: 'admin-teaching', label: 'Teaching Allocation', icon: ClipboardList },
    { id: 'admin-students', label: 'Student Registry', icon: Users },
    { id: 'admin-years', label: 'Academic Years', icon: Database },
    { id: 'academic-calendar', label: 'Academic Calendar', icon: Calendar },
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
    <GlassCard className="h-[calc(100vh-2rem)] w-72 p-5 select-none sticky top-4 left-4 shrink-0 overflow-hidden">
      <div className="flex flex-col h-full justify-between min-h-0">
        
        {/* Upper Section (Brand Header + Scrollable Nav) */}
        <div className="flex flex-col min-h-0 flex-1 overflow-hidden">
          {/* Brand Section */}
          <div className="flex items-center gap-3 border-b border-white/20 pb-4 mb-3 shrink-0">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#8B1E3F] to-[#CD4368] flex items-center justify-center text-white shadow-lg shadow-maroon-900/20 shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h1 className="font-display font-bold text-base text-gray-900 leading-tight truncate">
                SRMCOP <span className="text-[#8B1E3F]">EduHub</span>
              </h1>
              <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider truncate">
                SRM College of Pharmacy
              </p>
            </div>
          </div>

          {/* Dynamic Navigation Options - SCROLLABLE AREA */}
          <div className="flex flex-col min-h-0 flex-1 overflow-y-auto pr-1 space-y-1">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest pl-3 py-1 sticky top-0 bg-white/40 backdrop-blur-md z-20 shrink-0">
              {currentRole} Navigation
            </p>
            <nav className="flex flex-col gap-1 pb-3">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentScreen === item.id || currentScreen.startsWith(item.id + '-') || (item.id === 'faculty-courses' && currentScreen === 'faculty-course-viewer');
                return (
                  <button
                    key={item.id}
                    onClick={() => onChangeScreen(item.id)}
                    className={`
                      group flex items-center gap-3 px-3.5 py-2.5 rounded-full text-xs font-semibold transition-all duration-300 relative overflow-hidden shrink-0 cursor-pointer
                      ${isActive 
                        ? 'text-white shadow-md shadow-maroon-900/10 font-bold' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                      }
                    `}
                  >
                    {/* Glowing background capsule for the active item */}
                    {isActive && (
                      <div className="absolute inset-0 bg-gradient-to-r from-[#8B1E3F] to-[#b32a4e] z-0" />
                    )}
                    
                    {/* Custom Frosted Glass Circle Icon Wrapper */}
                    <div className={`
                      w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 z-10 shrink-0
                      ${isActive 
                        ? 'bg-white/20 text-white' 
                        : 'bg-gray-100/70 text-gray-500 group-hover:bg-white/80 group-hover:text-[#8B1E3F] shadow-2xs'
                      }
                    `}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    
                    <span className="z-10 relative truncate">{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Role Selector & Account Section */}
        <div className="flex flex-col gap-3 border-t border-white/20 pt-3 mt-2 shrink-0">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest pl-3">
            Simulate Workspace
          </p>
          
          {/* Apple-style Segmented Control */}
          <div className="p-1 bg-gray-200/50 backdrop-blur-md rounded-full flex gap-1 border border-white/30 select-none overflow-x-auto no-scrollbar shrink-0">
            {(['Student', 'Faculty', 'Admin'] as const).map((role) => (
              <button
                key={role}
                onClick={() => {
                  onChangeRole(role);
                  // Automatically route to their primary dashboard when switching roles
                  onChangeScreen(`${role.toLowerCase()}-dashboard`);
                }}
                className={`
                  flex-1 text-[10px] font-bold py-1.5 px-2 rounded-full transition-all duration-300 whitespace-nowrap text-center cursor-pointer
                  ${currentRole === role
                    ? 'bg-white text-gray-900 shadow-xs font-black'
                    : 'text-gray-500 hover:text-gray-900'
                  }
                `}
              >
                {role}
              </button>
            ))}
          </div>

          {/* User Info Capsule */}
          <div className="flex items-center gap-2.5 bg-white/40 border border-white/20 p-2 rounded-full justify-between shrink-0">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#8B1E3F] to-rose-400 flex items-center justify-center text-white font-extrabold text-xs shadow-inner shrink-0">
                {activeUser 
                  ? activeUser.name.replace('Dr. ', '').replace('Prof. ', '').split(' ').map(p => p[0]).filter(Boolean).join('').substring(0, 2).toUpperCase()
                  : (currentRole === 'Student' ? 'AD' : currentRole === 'Faculty' ? 'JK' : 'JN')
                }
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-bold text-gray-900 truncate">
                  {activeUser ? activeUser.name : (currentRole === 'Student' ? 'ANVITA DAYAL' : currentRole === 'Faculty' ? 'Dr. J. Kavitha' : 'Dr. J. Narayanan')}
                </h4>
                <p className="text-[10px] text-gray-500 truncate">
                  {activeUser ? activeUser.subtext : (currentRole === 'Student' ? 'Year II (Pharm.D)' : currentRole === 'Faculty' ? 'Dept of Pharm Analysis' : 'Emp ID: 1805447')}
                </p>
              </div>
            </div>
            {onLogout && (
              <button
                onClick={onLogout}
                className="w-7 h-7 rounded-full bg-white/60 hover:bg-red-50 text-gray-500 hover:text-red-600 flex items-center justify-center border border-white/40 shadow-xs transition-all hover:scale-105 active:scale-95 shrink-0 cursor-pointer"
                title="Sign Out of Workspace"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

      </div>
    </GlassCard>
  );
}
