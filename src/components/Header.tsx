import { useState } from 'react';
import { Search, Bell, ShieldCheck, ChevronRight, HelpCircle } from 'lucide-react';
import GlassCard from './GlassCard';
import { mockAnnouncements } from '../data/mockData';

interface HeaderProps {
  currentRole: 'Student' | 'Faculty' | 'Admin';
  currentScreen: string;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedProgramme: string;
  setSelectedProgramme: (prog: 'B.Pharm' | 'Pharm.D') => void;
  onGoToScreen: (screenId: string) => void;
}

export default function Header({
  currentRole,
  currentScreen,
  searchQuery,
  setSearchQuery,
  selectedProgramme,
  setSelectedProgramme,
  onGoToScreen,
}: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);

  // Simple Breadcrumb label determination
  const getBreadcrumb = () => {
    const parts = currentScreen.split('-');
    const role = parts[0].toUpperCase();
    const section = parts.slice(1).join(' ');
    
    // Capitalize first letters of each word
    const capitalizedSection = section
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    return (
      <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
        <span>{role}</span>
        <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
        <span className="text-gray-800 font-semibold">{capitalizedSection || 'Workspace'}</span>
      </div>
    );
  };

  return (
    <div className="w-full flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between relative z-50 flex-wrap">
      {/* Dynamic Breadcrumbs & Status */}
      <GlassCard className="px-6 flex-1 lg:flex-initial h-14 min-w-[200px]">
        <div className="flex items-center gap-4 h-full w-full">
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-2 h-2 rounded-full bg-[#8B1E3F] animate-pulse" />
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">SRMCOP</span>
          </div>
          <div className="w-[1px] h-4 bg-gray-300 shrink-0" />
          <div className="flex-1 min-w-0 truncate">{getBreadcrumb()}</div>
        </div>
      </GlassCard>

      {/* Main Interactions Bar */}
      <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-end">
        {/* Floating Search Bar */}
        {currentScreen !== 'faculty-dashboard' && (
          <GlassCard className="px-4 h-14 flex-1 md:flex-initial min-w-[150px] md:w-80">
            <div className="flex items-center gap-3 h-full w-full">
              <Search className="w-4 h-4 text-gray-400 shrink-0" />
              <input
                type="text"
                placeholder="Search subjects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border-none text-xs text-gray-800 placeholder-gray-400 focus:outline-none"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')} 
                  className="text-[10px] bg-gray-200/60 hover:bg-gray-200 text-gray-500 px-2 py-0.5 rounded-full shrink-0"
                >
                  Clear
                </button>
              )}
            </div>
          </GlassCard>
        )}



        {/* Notifications and Utilities */}
        <div className="flex gap-2 items-center relative">
          <GlassCard 
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-14 h-14 cursor-pointer hover:bg-white/85"
          >
            <div className="flex items-center justify-center h-full w-full">
              <div className="relative">
                <Bell className="w-5 h-5 text-gray-700" />
                {mockAnnouncements.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[#8B1E3F] border border-white text-[9px] font-bold text-white flex items-center justify-center">
                    {mockAnnouncements.length}
                  </span>
                )}
              </div>
            </div>
          </GlassCard>

          {/* Notifications Glass Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 top-16 w-80 bg-white/95 backdrop-blur-2xl rounded-[24px] shadow-2xl border border-white/40 p-5 z-50">
              <div className="flex justify-between items-center border-b border-gray-100 pb-3 mb-3">
                <h3 className="font-display font-bold text-sm text-gray-900">Notifications</h3>
                <span className="text-[10px] font-bold text-[#8B1E3F] uppercase tracking-wider bg-red-50 px-2 py-0.5 rounded-full">
                  Recent
                </span>
              </div>
              <div className="flex flex-col gap-3 max-h-72 overflow-y-auto">
                {mockAnnouncements.length === 0 ? (
                  <div className="py-8 text-center text-xs text-gray-400 font-medium">
                    No new notifications.
                  </div>
                ) : (
                  mockAnnouncements.map((ann) => (
                    <div 
                      key={ann.id} 
                      className="p-2.5 rounded-xl hover:bg-gray-50/80 cursor-pointer border border-transparent hover:border-gray-100 transition-all duration-200"
                      onClick={() => {
                        setShowNotifications(false);
                        onGoToScreen(currentRole === 'Student' ? 'student-announcements' : 'faculty-dashboard');
                      }}
                    >
                      <div className="flex gap-1.5 items-center mb-1">
                        <span className={`w-1.5 h-1.5 rounded-full ${ann.category === 'exam' ? 'bg-red-500' : 'bg-blue-500'}`} />
                        <h4 className="text-xs font-bold text-gray-800 truncate">{ann.title}</h4>
                      </div>
                      <p className="text-[10px] text-gray-500 line-clamp-2 leading-relaxed">
                        {ann.content}
                      </p>
                      <span className="text-[9px] text-gray-400 mt-1 block">{ann.date}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
