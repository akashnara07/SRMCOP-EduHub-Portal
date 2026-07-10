import { useState } from 'react';
import { ArrowLeft, User, Check, Edit2, FileText, Download, Award, ChevronRight } from 'lucide-react';
import GlassCard from '../GlassCard';

interface FacultyAssignmentsProps {
  onBack: () => void;
}

export default function FacultyAssignments({
  onBack,
}: FacultyAssignmentsProps) {
  const [submissions, setSubmissions] = useState([
    { id: '1', studentName: 'J. Akash', reg: 'SRM2026PH7810', task: 'Histological Classification of Muscular Tissue', date: 'July 8, 2026', file: 'histology_muscle_akash.pdf', grade: 'Pending' },
    { id: '2', studentName: 'Priya Sharma', reg: 'SRM2026PH7812', task: 'Histological Classification of Muscular Tissue', date: 'July 7, 2026', file: 'muscle_histology_sharma.pdf', grade: 'A+' },
    { id: '3', studentName: 'Siddharth Roy', reg: 'SRM2026PH7815', task: 'Non-Aqueous Titration Lab Report', date: 'July 5, 2026', file: 'non_aq_titr_sid.pdf', grade: 'A' },
  ]);

  const [activeGradingId, setActiveGradingId] = useState<string | null>(null);
  const [selectedGrade, setSelectedGrade] = useState('A+');

  const handleGradeSubmit = (id: string) => {
    setSubmissions(submissions.map(sub => {
      if (sub.id === id) {
        return { ...sub, grade: selectedGrade };
      }
      return sub;
    }));
    setActiveGradingId(null);
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto">
      {/* Header and Back actions */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-white/60 border border-white/40 hover:bg-white flex items-center justify-center text-gray-700 transition-all shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <span className="text-[10px] font-bold text-[#8B1E3F] uppercase tracking-widest bg-pink-50 border border-pink-100 px-2.5 py-0.5 rounded-full">
              Sessional Assignments Portal
            </span>
            <h1 className="font-display font-extrabold text-2xl text-gray-900 tracking-tight mt-1">
              Student Lab Submissions
            </h1>
          </div>
        </div>

        <span className="text-xs font-bold text-gray-400">
          Pending Grade Checks: {submissions.filter(s => s.grade === 'Pending').length}
        </span>
      </div>

      {/* Submissions list */}
      <div className="flex flex-col gap-4">
        {submissions.map((sub) => {
          const isGrading = activeGradingId === sub.id;

          return (
            <GlassCard key={sub.id} className="p-6 border-l-4 border-l-[#8B1E3F]">
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-start gap-4 flex-wrap">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-sm text-gray-900 leading-tight">{sub.studentName}</h3>
                      <p className="text-[10px] text-gray-500 font-semibold">{sub.reg} • Submitted on {sub.date}</p>
                    </div>
                  </div>

                  {/* Grading Status Badging */}
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase ${
                      sub.grade === 'Pending' ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                    }`}>
                      Grade: {sub.grade}
                    </span>
                    {!isGrading && sub.grade === 'Pending' && (
                      <button
                        onClick={() => {
                          setActiveGradingId(sub.id);
                          setSelectedGrade('A+');
                        }}
                        className="px-3.5 py-1 bg-[#8B1E3F] hover:bg-[#b32a4e] text-white text-[10px] font-bold rounded-full transition-all flex items-center gap-1"
                      >
                        <Edit2 className="w-3 h-3" /> Grade
                      </button>
                    )}
                  </div>
                </div>

                {/* Task outline and attachment download */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gray-50/50 p-3.5 rounded-2xl border border-white/20">
                  <div>
                    <span className="text-[9px] font-bold text-gray-400 block uppercase tracking-wider">Assignment Task</span>
                    <h4 className="text-xs font-bold text-gray-800">{sub.task}</h4>
                  </div>

                  <a 
                    href="https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" 
                    download 
                    referrerPolicy="no-referrer"
                    target="_blank"
                    className="flex items-center gap-1 text-[11px] font-bold text-[#8B1E3F] bg-white border border-gray-100 px-3 py-1.5 rounded-xl hover:shadow-sm"
                  >
                    <FileText className="w-3.5 h-3.5 text-red-500" /> {sub.file} <Download className="w-3 h-3 ml-1" />
                  </a>
                </div>

                {/* Grade Input interface */}
                {isGrading && (
                  <div className="border-t border-gray-100 pt-4 flex flex-wrap gap-4 items-center justify-between animate-fade-in">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-gray-600">Assign Grade mark:</span>
                      <div className="flex gap-1.5 p-1 bg-gray-100 rounded-full border border-white/25">
                        {['O', 'A+', 'A', 'B+', 'B', 'C'].map((g) => (
                          <button
                            key={g}
                            type="button"
                            onClick={() => setSelectedGrade(g)}
                            className={`
                              w-8 h-8 rounded-full text-xs font-bold transition-all
                              ${selectedGrade === g 
                                ? 'bg-[#8B1E3F] text-white shadow-sm' 
                                : 'text-gray-500 hover:text-gray-900'
                              }
                            `}
                          >
                            {g}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => setActiveGradingId(null)}
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-bold rounded-full transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleGradeSubmit(sub.id)}
                        className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-full transition-all flex items-center gap-1 shadow-md shadow-emerald-900/10"
                      >
                        <Check className="w-4 h-4" /> Save Grade
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}
