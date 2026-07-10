import { useState, useEffect } from 'react';
import { ArrowLeft, Award, CheckCircle2, AlertTriangle, HelpCircle, ChevronRight, RefreshCw, Clock } from 'lucide-react';
import GlassCard from '../GlassCard';
import { Quiz } from '../../types';

interface StudentQuizProps {
  quiz: Quiz;
  onBack: () => void;
}

export default function StudentQuiz({
  quiz,
  onBack,
}: StudentQuizProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(quiz.timeLimit * 60); // in seconds
  const [quizScore, setQuizScore] = useState(0);

  // Countdown timer simulation
  useEffect(() => {
    if (isSubmitted) return;
    if (timeLeft <= 0) {
      handleSubmitQuiz();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isSubmitted]);

  const handleOptionSelect = (optionIndex: number) => {
    if (isSubmitted) return;
    setSelectedAnswers({
      ...selectedAnswers,
      [quiz.questions[currentQuestionIndex].id]: optionIndex
    });
  };

  const handleSubmitQuiz = () => {
    // Calculate final score
    let score = 0;
    quiz.questions.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctAnswer) {
        score++;
      }
    });

    setQuizScore(score);
    setIsSubmitted(true);
  };

  const handleRestart = () => {
    setSelectedAnswers({});
    setCurrentQuestionIndex(0);
    setIsSubmitted(false);
    setTimeLeft(quiz.timeLimit * 60);
    setQuizScore(0);
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const totalQuestions = quiz.questions.length;
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;

  if (isSubmitted) {
    const scorePercentage = (quizScore / totalQuestions) * 100;
    const isPassed = scorePercentage >= 60;

    return (
      <div className="flex flex-col gap-6 w-full max-w-3xl mx-auto">
        <GlassCard className="p-8 text-center flex flex-col items-center justify-center gap-5">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#8B1E3F] to-[#CD4368] flex items-center justify-center text-white shadow-2xl">
            <Award className="w-10 h-10" />
          </div>

          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Quiz Completed
            </span>
            <h1 className="font-display font-extrabold text-2xl text-gray-900 tracking-tight mt-1">
              Assessment Results
            </h1>
            <p className="text-xs text-gray-500 mt-1">{quiz.title}</p>
          </div>

          <div className="flex items-center gap-6 my-2 bg-gray-50/50 border border-white/20 p-4 rounded-3xl">
            <div className="text-center">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Score</span>
              <span className="text-3xl font-display font-black text-gray-900">
                {quizScore} <span className="text-gray-400 font-normal text-lg">/ {totalQuestions}</span>
              </span>
            </div>
            <div className="w-[1px] h-10 bg-gray-200" />
            <div className="text-center">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Percentage</span>
              <span className={`text-3xl font-display font-black ${isPassed ? 'text-emerald-500' : 'text-rose-500'}`}>
                {scorePercentage}%
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-1 max-w-sm">
            <span className={`text-sm font-bold ${isPassed ? 'text-emerald-600' : 'text-rose-600'}`}>
              {isPassed ? '✓ Congratulations! You Passed' : '✗ Failed to Meet Passing Score'}
            </span>
            <p className="text-xs text-gray-500 leading-relaxed">
              {isPassed 
                ? 'Your knowledge of the Integumentary and Skeletal system matches professional requirements.' 
                : 'Please review the textbook guides and re-attempt to solidify core pathways.'}
            </p>
          </div>

          <div className="flex items-center gap-3 mt-2">
            <button
              onClick={onBack}
              className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-full transition-all"
            >
              Back to Subject
            </button>
            <button
              onClick={handleRestart}
              className="px-6 py-2.5 bg-[#8B1E3F] hover:bg-[#b32a4e] text-white text-xs font-bold rounded-full transition-all flex items-center gap-1.5 shadow-md shadow-maroon-900/10"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Re-attempt
            </button>
          </div>
        </GlassCard>

        {/* Detailed Questions & Explanations Review */}
        <div className="flex flex-col gap-4">
          <h3 className="font-display font-bold text-base text-gray-900 pl-2">Answers Key & Explanations</h3>
          
          {quiz.questions.map((q, qIndex) => {
            const studentSelection = selectedAnswers[q.id];
            const isCorrect = studentSelection === q.correctAnswer;

            return (
              <GlassCard key={q.id} className="p-6 flex flex-col gap-4">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex gap-2">
                    <span className="text-xs font-bold text-gray-400">Q.{qIndex + 1}</span>
                    <h4 className="text-xs font-bold text-gray-800 leading-relaxed">{q.question}</h4>
                  </div>
                  <span className={`shrink-0 text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                    isCorrect 
                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                      : 'bg-rose-50 text-rose-600 border border-rose-100'
                  }`}>
                    {isCorrect ? 'Correct' : 'Incorrect'}
                  </span>
                </div>

                {/* Grid of Options */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                  {q.options.map((opt, optIndex) => {
                    const isCorrectAnswer = optIndex === q.correctAnswer;
                    const isSelected = optIndex === studentSelection;

                    return (
                      <div 
                        key={optIndex} 
                        className={`p-3 rounded-2xl text-[11px] font-semibold border ${
                          isCorrectAnswer 
                            ? 'bg-emerald-50/50 border-emerald-500/30 text-emerald-900' 
                            : isSelected 
                            ? 'bg-rose-50/50 border-rose-500/30 text-rose-900' 
                            : 'bg-white/40 border-gray-100 text-gray-600'
                        }`}
                      >
                        {opt}
                      </div>
                    );
                  })}
                </div>

                {/* Explanatory notes */}
                <div className="mt-2 bg-gray-50/50 p-3.5 rounded-2xl border border-white/20 text-[11px] text-gray-500 leading-relaxed">
                  <span className="font-bold text-gray-700 block mb-1">Tutor Explanation:</span>
                  {q.explanation}
                </div>
              </GlassCard>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-3xl mx-auto">
      {/* Header with active timer */}
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
              Timed Assessment
            </span>
            <h1 className="font-display font-extrabold text-lg text-gray-900 tracking-tight mt-1 truncate max-w-md">
              {quiz.title}
            </h1>
          </div>
        </div>

        {/* Dynamic ticking timer */}
        <GlassCard className="px-4 py-2 flex items-center gap-2 h-11 border-l-4 border-l-purple-500 shrink-0">
          <Clock className="w-4 h-4 text-purple-500 animate-pulse" />
          <span className="text-xs font-bold text-gray-700 font-mono">
            {formatTimer(timeLeft)}
          </span>
        </GlassCard>
      </div>

      {/* Progress tracker header */}
      <div className="flex items-center gap-2">
        {quiz.questions.map((_, idx) => (
          <div 
            key={idx}
            className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${
              currentQuestionIndex === idx 
                ? 'bg-purple-500' 
                : selectedAnswers[quiz.questions[idx].id] !== undefined 
                ? 'bg-purple-300' 
                : 'bg-gray-200'
            }`}
          />
        ))}
      </div>

      {/* Question stage */}
      <GlassCard className="p-8 flex flex-col gap-6">
        <div>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
            Question {currentQuestionIndex + 1} of {totalQuestions}
          </span>
          <h2 className="font-display font-bold text-base text-gray-800 leading-relaxed">
            {currentQuestion.question}
          </h2>
        </div>

        {/* Interactive Options list */}
        <div className="flex flex-col gap-3">
          {currentQuestion.options.map((opt, oIndex) => {
            const isSelected = selectedAnswers[currentQuestion.id] === oIndex;

            return (
              <button
                key={oIndex}
                onClick={() => handleOptionSelect(oIndex)}
                className={`
                  w-full text-left p-4 rounded-2xl text-xs font-semibold transition-all duration-300 border flex justify-between items-center
                  ${isSelected
                    ? 'bg-purple-500/10 border-purple-500/40 text-purple-900 shadow-md shadow-purple-500/5'
                    : 'bg-white/50 hover:bg-white border-white/40 text-gray-700 hover:border-gray-200 hover:shadow-sm'
                  }
                `}
              >
                <span>{opt}</span>
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                  isSelected 
                    ? 'border-purple-500 bg-purple-500 text-white' 
                    : 'border-gray-300 bg-white'
                }`}>
                  {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Controls block */}
        <div className="flex items-center justify-between border-t border-gray-100 pt-5 mt-2">
          <button
            onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
            disabled={currentQuestionIndex === 0}
            className="px-5 py-2 rounded-full border border-gray-200 text-xs font-bold text-gray-500 hover:text-gray-900 hover:bg-gray-50 disabled:opacity-40"
          >
            Previous
          </button>

          {isLastQuestion ? (
            <button
              onClick={handleSubmitQuiz}
              disabled={Object.keys(selectedAnswers).length < totalQuestions}
              className="px-6 py-2.5 bg-[#8B1E3F] hover:bg-[#b32a4e] text-white text-xs font-bold rounded-full transition-all shadow-md shadow-maroon-900/15 disabled:opacity-50"
            >
              Submit Quiz
            </button>
          ) : (
            <button
              onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
              className="px-5 py-2 rounded-full bg-purple-500 hover:bg-purple-600 text-white text-xs font-bold flex items-center gap-1 shadow-md shadow-purple-500/15"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </GlassCard>
    </div>
  );
}
