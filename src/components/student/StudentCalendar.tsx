import { useState } from 'react';
import { Calendar as CalendarIcon, Clock, MapPin, ChevronLeft, ChevronRight, Plus, Users } from 'lucide-react';
import GlassCard from '../GlassCard';

export default function StudentCalendar() {
  const [currentMonth, setCurrentMonth] = useState('July 2026');
  const [selectedDay, setSelectedDay] = useState<number>(8);

  const daysInMonth = Array.from({ length: 31 }, (_, i) => i + 1);

  // Events dataset mapped to days
  const events = [
    { day: 3, title: 'B.Pharm Term exams schedule release', time: '10:00 AM', type: 'exam', room: 'Main Office' },
    { day: 8, title: 'Introduction to Epithelial Tissue Lab', time: '11:30 AM', type: 'class', room: 'Pharmaceutics Lab I' },
    { day: 8, title: 'Submit Anatomy Classification Assignment', time: '11:59 PM', type: 'assignment', room: 'Online Portal' },
    { day: 12, title: 'Novartis Research Guest Lecture', time: '10:00 AM', type: 'event', room: 'Main Auditorium' },
    { day: 15, title: 'Integumentary & Skeletal Systems MCQ Test', time: '02:00 PM', type: 'exam', room: 'Lecture Hall 3' },
    { day: 22, title: 'Clinical Pharmacy Mentoring Session', time: '03:00 PM', type: 'class', room: 'Seminar Room 2' },
  ];

  const getEventsForDay = (day: number) => {
    return events.filter(e => e.day === day);
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      <div>
        <h1 className="font-display font-extrabold text-2xl text-gray-900 tracking-tight">Academic Calendar</h1>
        <p className="text-xs text-gray-500">Track key examinations, laboratory schedules, and submission deadlines</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left column (2-spans): Monthly Grid */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <GlassCard className="p-6">
            {/* Calendar grid header */}
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-display font-bold text-base text-gray-900 flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-[#8B1E3F]" />
                {currentMonth}
              </h3>
              <div className="flex items-center gap-1">
                <button className="p-2 hover:bg-gray-100 rounded-full text-gray-600">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-full text-gray-600">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Days header list */}
            <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">
              <span>Sun</span>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
            </div>

            {/* Days grid */}
            <div className="grid grid-cols-7 gap-2">
              {/* Padding for Monday start */}
              <div className="aspect-square bg-gray-50/10 rounded-2xl" />
              <div className="aspect-square bg-gray-50/10 rounded-2xl" />

              {daysInMonth.map((day) => {
                const dayEvents = getEventsForDay(day);
                const isSelected = selectedDay === day;
                const hasEvents = dayEvents.length > 0;

                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    className={`
                      aspect-square rounded-2xl flex flex-col items-center justify-between p-2.5 transition-all duration-300 relative border
                      ${isSelected 
                        ? 'bg-[#8B1E3F] text-white border-[#8B1E3F] shadow-md shadow-maroon-900/10' 
                        : 'bg-white/40 border-white/20 hover:border-gray-200 text-gray-700 hover:bg-white'
                      }
                    `}
                  >
                    <span className="text-xs font-bold">{day}</span>
                    
                    {/* Event Dots indicator */}
                    {hasEvents && (
                      <div className="flex gap-1 justify-center mt-1">
                        {dayEvents.map((evt, eIdx) => (
                          <span 
                            key={eIdx} 
                            className={`w-1.5 h-1.5 rounded-full ${
                              isSelected 
                                ? 'bg-white' 
                                : evt.type === 'exam' 
                                ? 'bg-red-500' 
                                : evt.type === 'assignment' 
                                ? 'bg-orange-400' 
                                : evt.type === 'class' 
                                ? 'bg-blue-500' 
                                : 'bg-purple-500'
                            }`} 
                          />
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </GlassCard>
        </div>

        {/* Right column: Selected Day details */}
        <div className="flex flex-col gap-6">
          <GlassCard className="p-6 h-[460px] flex flex-col justify-between">
            <div className="overflow-hidden">
              <div className="border-b border-gray-100 pb-3 mb-4">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Selected Schedule</span>
                <h3 className="font-display font-bold text-base text-gray-900">July {selectedDay}, 2026</h3>
              </div>

              {/* Event listings */}
              <div className="flex flex-col gap-3 overflow-y-auto max-h-72 pr-1">
                {getEventsForDay(selectedDay).length === 0 ? (
                  <div className="py-12 text-center flex flex-col items-center justify-center gap-2">
                    <CalendarIcon className="w-10 h-10 text-gray-300 stroke-[1.5]" />
                    <p className="text-xs text-gray-400">No events or deadlines scheduled for this day.</p>
                  </div>
                ) : (
                  getEventsForDay(selectedDay).map((evt, idx) => (
                    <div 
                      key={idx} 
                      className={`p-3 border rounded-2xl flex flex-col gap-1.5 ${
                        evt.type === 'exam' 
                          ? 'bg-red-50/50 border-red-500/20 text-red-950' 
                          : evt.type === 'assignment' 
                          ? 'bg-orange-50/50 border-orange-500/20 text-orange-950' 
                          : 'bg-blue-50/50 border-blue-500/20 text-blue-950'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-bold uppercase tracking-widest">{evt.type}</span>
                        <span className="text-[9px] font-bold flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> {evt.time}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold leading-snug">{evt.title}</h4>
                      <p className="text-[10px] opacity-80 flex items-center gap-1 font-semibold">
                        <MapPin className="w-3.5 h-3.5" /> {evt.room}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>

            <button className="w-full text-center text-xs font-bold text-[#8B1E3F] border border-[#8B1E3F]/20 hover:bg-[#8B1E3F]/5 py-2.5 rounded-full transition-all mt-4">
              Sync to Apple Calendar
            </button>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
