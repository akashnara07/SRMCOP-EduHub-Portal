import { useState } from 'react';
import { Bell, Megaphone, Calendar, Award, ChevronRight } from 'lucide-react';
import GlassCard from '../GlassCard';
import { Announcement } from '../../types';

interface AnnouncementsViewProps {
  announcements: Announcement[];
}

export default function AnnouncementsView({
  announcements,
}: AnnouncementsViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'academic' | 'exam' | 'event'>('all');

  const filteredAnnouncements = announcements.filter((ann) => {
    if (selectedCategory === 'all') return true;
    return ann.category === selectedCategory;
  });

  const getCategoryIcon = (category: Announcement['category']) => {
    switch (category) {
      case 'exam': return <Award className="w-4 h-4 text-red-500" />;
      case 'academic': return <Megaphone className="w-4 h-4 text-blue-500" />;
      case 'event': return <Calendar className="w-4 h-4 text-purple-500" />;
      default: return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-extrabold text-2xl text-gray-900 tracking-tight">University Announcements</h1>
          <p className="text-xs text-gray-500">Stay updated with official announcements, dates, and administrative releases</p>
        </div>

        {/* Filter segment */}
        <GlassCard className="p-1 flex gap-1 h-11 self-start sm:self-center">
          {[
            { id: 'all', label: 'All Announcements' },
            { id: 'academic', label: 'Academic' },
            { id: 'exam', label: 'Exams' },
            { id: 'event', label: 'Events' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id as any)}
              className={`
                px-3 h-full rounded-full text-[10px] font-bold transition-all duration-300 whitespace-nowrap
                ${selectedCategory === cat.id
                  ? 'bg-[#8B1E3F] text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-white/40'
                }
              `}
            >
              {cat.label}
            </button>
          ))}
        </GlassCard>
      </div>

      {/* Announcements list */}
      <div className="flex flex-col gap-4">
        {filteredAnnouncements.map((ann) => (
          <GlassCard key={ann.id} className="p-6 border-l-4 border-l-[#8B1E3F]">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 justify-between flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-white border border-gray-100 flex items-center justify-center shrink-0">
                    {getCategoryIcon(ann.category)}
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-[#8B1E3F] uppercase tracking-widest">{ann.category} release</span>
                    <h3 className="font-display font-bold text-sm text-gray-900 leading-tight">{ann.title}</h3>
                  </div>
                </div>
                <span className="text-[10px] text-gray-400 font-bold">{ann.date}</span>
              </div>

              <p className="text-xs text-gray-600 leading-relaxed pl-10 mt-1 font-medium">
                {ann.content}
              </p>

              <div className="flex items-center gap-2 pl-10 mt-3 pt-3 border-t border-gray-100/60 text-[10px] text-gray-400 font-semibold">
                <span>Sender:</span>
                <span className="text-gray-600 font-bold">{ann.sender}</span>
                <span className="text-gray-300">•</span>
                <span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full text-[9px]">Verified Announcement</span>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
