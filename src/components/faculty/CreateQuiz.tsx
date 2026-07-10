import { useState } from 'react';
import { ArrowLeft, Plus, CheckCircle, Trash2, Award, ClipboardList, Eye } from 'lucide-react';
import GlassCard from '../GlassCard';
import { QuizQuestion } from '../../types';

interface CreateQuizProps {
  onBack: () => void;
  onSaveQuiz: (title: string, questions: QuizQuestion[], timeLimit: number) => void;
}

export default function CreateQuiz({
  onBack,
  onSaveQuiz,
}: CreateQuizProps) {
  const [quizTitle, setQuizTitle] = useState('');
  const [quizTime, setQuizTime] = useState(10);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);

  // Draft Question Form State
  const [qText, setQText] = useState('');
  const [options, setOptions] = useState<string[]>(['', '', '', '']);
  const [correctOptionIdx, setCorrectOptionIdx] = useState(0);
  const [explanation, setExplanation] = useState('');

  const handleAddQuestion = () => {
    if (!qText.trim() || options.some(opt => !opt.trim())) return;

    const added: QuizQuestion = {
      id: `q-drafted-${Date.now()}`,
      question: qText.trim(),
      options: options.map(o => o.trim()),
      correctAnswer: correctOptionIdx,
      explanation: explanation.trim() || 'No explanation provided.'
    };

    setQuestions([...questions, added]);
    
    // Reset form states
    setQText('');
    setOptions(['', '', '', '']);
    setCorrectOptionIdx(0);
    setExplanation('');
  };

  const handleOptionChange = (idx: number, val: string) => {
    const updated = [...options];
    updated[idx] = val;
    setOptions(updated);
  };

  const handleDeleteDraftQuestion = (idx: number) => {
    setQuestions(questions.filter((_, i) => i !== idx));
  };

  const handlePublishQuiz = () => {
    if (!quizTitle.trim() || questions.length === 0) return;
    onSaveQuiz(quizTitle.trim(), questions, quizTime);
    onBack();
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
            <span className="text-[10px] font-bold text-purple-500 uppercase tracking-widest bg-purple-50 border border-purple-100 px-2.5 py-0.5 rounded-full">
              Sessional Quiz compiler
            </span>
            <h1 className="font-display font-extrabold text-2xl text-gray-900 tracking-tight mt-1">
              Create Custom Quiz MCQ
            </h1>
          </div>
        </div>

        <button
          onClick={handlePublishQuiz}
          disabled={!quizTitle.trim() || questions.length === 0}
          className="px-6 py-2.5 bg-[#8B1E3F] hover:bg-[#b32a4e] text-white text-xs font-bold rounded-full transition-all flex items-center gap-1.5 shadow-md shadow-maroon-900/10 disabled:opacity-50"
        >
          <CheckCircle className="w-4 h-4" /> Publish Assessment
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column (2 spans): Draft Questions List & Form */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* General configurations */}
          <GlassCard className="p-6">
            <h3 className="font-display font-bold text-sm text-gray-400 uppercase tracking-widest mb-4">Quiz Specifications</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[9px] font-bold text-gray-400 block mb-1 uppercase tracking-wider">Quiz Name</label>
                <input
                  type="text"
                  required
                  placeholder="Ex. Titration curves & chemical indicators..."
                  value={quizTitle}
                  onChange={(e) => setQuizTitle(e.target.value)}
                  className="w-full bg-gray-100/60 border border-transparent focus:border-[#8B1E3F] text-xs text-gray-800 p-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#8B1E3F]/30"
                />
              </div>

              <div>
                <label className="text-[9px] font-bold text-gray-400 block mb-1 uppercase tracking-wider">Time Limit (Minutes)</label>
                <select
                  value={quizTime}
                  onChange={(e) => setQuizTime(Number(e.target.value))}
                  className="w-full bg-gray-100/60 border border-transparent text-xs text-gray-800 p-2.5 rounded-xl focus:outline-none"
                >
                  <option value={5}>5 Minutes</option>
                  <option value={10}>10 Minutes</option>
                  <option value={15}>15 Minutes</option>
                  <option value={20}>20 Minutes</option>
                </select>
              </div>
            </div>
          </GlassCard>

          {/* Form to compilation of single question */}
          <GlassCard className="p-6">
            <h3 className="font-display font-bold text-sm text-gray-400 uppercase tracking-widest mb-4">Question Builder</h3>
            
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-[9px] font-bold text-gray-400 block mb-1 uppercase tracking-wider">Question Statement</label>
                <input
                  type="text"
                  placeholder="Ex. Which indicator is best suited for weak-acid vs strong-base titration?"
                  value={qText}
                  onChange={(e) => setQText(e.target.value)}
                  className="w-full bg-gray-100/60 border border-transparent focus:border-[#8B1E3F] text-xs text-gray-800 p-2.5 rounded-xl focus:outline-none focus:ring-1"
                />
              </div>

              {/* Grid of MCQ options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {options.map((opt, idx) => (
                  <div key={idx} className="flex flex-col gap-1">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Option {String.fromCharCode(65 + idx)}</span>
                      <button 
                        type="button"
                        onClick={() => setCorrectOptionIdx(idx)}
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full border transition-all ${
                          correctOptionIdx === idx 
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-200' 
                            : 'bg-white text-gray-400 border-gray-100 hover:text-gray-900'
                        }`}
                      >
                        {correctOptionIdx === idx ? 'Correct Answer' : 'Mark Correct'}
                      </button>
                    </div>
                    <input
                      type="text"
                      placeholder={`Draft Option ${String.fromCharCode(65 + idx)}...`}
                      value={opt}
                      onChange={(e) => handleOptionChange(idx, e.target.value)}
                      className="w-full bg-gray-100/60 border border-transparent text-xs text-gray-800 p-2.5 rounded-xl focus:outline-none"
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="text-[9px] font-bold text-gray-400 block mb-1 uppercase tracking-wider">Tutor Explanation</label>
                <textarea
                  placeholder="Explain the molecular pathways or analytical guidelines leading to correct selection..."
                  value={explanation}
                  rows={2}
                  onChange={(e) => setExplanation(e.target.value)}
                  className="w-full bg-gray-100/60 border border-transparent focus:border-[#8B1E3F] text-xs text-gray-800 p-2.5 rounded-xl focus:outline-none resize-none"
                />
              </div>

              <button
                type="button"
                onClick={handleAddQuestion}
                disabled={!qText.trim() || options.some(o => !o.trim())}
                className="w-full text-center text-xs font-bold bg-[#8B1E3F]/10 hover:bg-[#8B1E3F]/20 text-[#8B1E3F] py-3 rounded-full transition-all mt-2 border border-[#8B1E3F]/15"
              >
                + Append Question Item
              </button>
            </div>
          </GlassCard>
        </div>

        {/* Right Column: Live view compiled draft */}
        <div className="flex flex-col gap-6">
          <GlassCard className="p-6 h-[460px] flex flex-col justify-between">
            <div className="overflow-hidden">
              <div className="border-b border-gray-100 pb-3 mb-4 flex justify-between items-center">
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Live Compilation</span>
                  <h3 className="font-display font-bold text-base text-gray-900">Quiz Blueprint</h3>
                </div>
                <Eye className="w-5 h-5 text-gray-400" />
              </div>

              {/* Draft List */}
              <div className="flex flex-col gap-3 overflow-y-auto max-h-72 pr-1">
                {questions.length === 0 ? (
                  <div className="py-12 text-center flex flex-col items-center justify-center gap-2">
                    <ClipboardList className="w-10 h-10 text-gray-300 stroke-[1.5]" />
                    <p className="text-xs text-gray-400">No drafted questions found yet. Add questions to preview the blueprint list.</p>
                  </div>
                ) : (
                  questions.map((q, idx) => (
                    <div key={q.id} className="p-3 bg-gray-50/50 border border-gray-200/55 rounded-2xl flex items-start justify-between gap-3">
                      <div>
                        <h4 className="text-xs font-bold text-gray-800 leading-tight">Q.{idx + 1}: {q.question}</h4>
                        <span className="text-[9px] text-gray-400 font-bold block mt-1">Options Count: 4 • Correct: {String.fromCharCode(65 + q.correctAnswer)}</span>
                      </div>
                      <button 
                        onClick={() => handleDeleteDraftQuestion(idx)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-gray-100/60 p-3.5 rounded-2xl text-[10px] text-gray-500 font-semibold border border-white/20">
              Total questions: {questions.length} • Projected score ceiling: {questions.length} marks • Duration: {quizTime} mins
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
