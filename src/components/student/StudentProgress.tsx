import { useState, useEffect } from 'react';
import { Award, Clock, TrendingUp, BarChart3, Star, ChevronRight } from 'lucide-react';
import GlassCard from '../GlassCard';

interface StudentProgressProps {
  selectedProgramme?: 'B.Pharm' | 'Pharm.D';
}

export default function StudentProgress({ selectedProgramme }: StudentProgressProps) {
  const [programme, setProgramme] = useState<'B.Pharm' | 'Pharm.D'>(selectedProgramme || 'B.Pharm');
  const [selectedSemester, setSelectedSemester] = useState<number>(1);

  useEffect(() => {
    if (selectedProgramme) {
      setProgramme(selectedProgramme);
    }
  }, [selectedProgramme]);

  const getSemesterData = (semesterNum: number) => {
    const isPharmD = programme === 'Pharm.D';

    const getDynamicMarks = (subCode: string, defaultI: number, defaultII: number, defaultIII: number, gpa: number = 8.8) => {
      const cleanCode = subCode.endsWith('T') ? subCode.slice(0, -1) : subCode;
      const keyCandidates = [`sessional_marks_${subCode}`, `sessional_marks_${cleanCode}`];
      for (const key of keyCandidates) {
        const saved = localStorage.getItem(key);
        if (saved) {
          try {
            const cohort = JSON.parse(saved);
            const akash = cohort.find((s: any) => s.registerNumber === 'SRM2026PH7810');
            if (akash) {
              const s1 = akash.sessionalI;
              const s2 = akash.sessionalII;
              const s3 = akash.sessionalIII || 0;
              let avg = 0;
              if (isPharmD) {
                const sorted = [s1, s2, s3].sort((a, b) => b - a);
                avg = (sorted[0] + sorted[1]) / 2;
              } else {
                avg = (s1 + s2) / 2;
              }
              return {
                sessionalI: s1,
                sessionalII: s2,
                sessionalIII: s3,
                bestOf2Sessional: avg,
                semesterExam: Math.round(((akash.gpa || gpa) / 10) * 75)
              };
            }
          } catch (e) {
            console.error(e);
          }
        }
      }
      const fallbackAvg = isPharmD 
        ? ([defaultI, defaultII, defaultIII].sort((a, b) => b - a)[0] + [defaultI, defaultII, defaultIII].sort((a, b) => b - a)[1]) / 2 
        : (defaultI + defaultII) / 2;
      return {
        sessionalI: defaultI,
        sessionalII: defaultII,
        sessionalIII: defaultIII,
        bestOf2Sessional: fallbackAvg,
        semesterExam: isPharmD ? 62 : 64
      };
    };

    // Exact original Semester 1 data
    if (semesterNum === 1) {
      const s1Data = [
        {
          code: isPharmD ? 'PD101' : 'BP101T',
          name: 'Human Anatomy and Physiology I',
          sessionalI: 26,
          sessionalII: 28,
          sessionalIII: 27,
          bestOf2Sessional: isPharmD ? 27.5 : 27.0,
          internals: 21,
          semesterExam: 64,
          totalMarks: 85,
          grade: 'A+',
          attainmentTarget: 2.5,
          attainmentActual: 2.8,
          coAttainment: [
            { co: 'CO1', target: 2.5, actual: 2.7, status: 'Exceeded' },
            { co: 'CO2', target: 2.5, actual: 2.8, status: 'Exceeded' },
            { co: 'CO3', target: 2.5, actual: 2.6, status: 'Exceeded' },
            { co: 'CO4', target: 2.5, actual: 2.9, status: 'Exceeded' },
            { co: 'CO5', target: 2.5, actual: 3.0, status: 'Exceeded' }
          ]
        },
        {
          code: isPharmD ? 'PD102T' : 'BP102T',
          name: 'Pharmaceutical Analysis I',
          sessionalI: 24,
          sessionalII: 25,
          sessionalIII: 22,
          bestOf2Sessional: isPharmD ? 24.5 : 24.5,
          internals: 19,
          semesterExam: 59,
          totalMarks: 78,
          grade: 'A',
          attainmentTarget: 2.5,
          attainmentActual: 2.6,
          coAttainment: [
            { co: 'CO1', target: 2.5, actual: 2.5, status: 'Attained' },
            { co: 'CO2', target: 2.5, actual: 2.6, status: 'Attained' },
            { co: 'CO3', target: 2.5, actual: 2.7, status: 'Exceeded' },
            { co: 'CO4', target: 2.5, actual: 2.6, status: 'Attained' }
          ]
        },
        {
          code: isPharmD ? 'PD103T' : 'BP103T',
          name: 'Pharmaceutical Inorganic Chemistry',
          sessionalI: 28,
          sessionalII: 29,
          sessionalIII: 26,
          bestOf2Sessional: isPharmD ? 28.5 : 28.5,
          internals: 23,
          semesterExam: 68,
          totalMarks: 91,
          grade: 'O',
          attainmentTarget: 2.5,
          attainmentActual: 3.0,
          coAttainment: [
            { co: 'CO1', target: 2.5, actual: 3.0, status: 'Exceeded' },
            { co: 'CO2', target: 2.5, actual: 3.0, status: 'Exceeded' },
            { co: 'CO3', target: 2.5, actual: 2.9, status: 'Exceeded' },
            { co: 'CO4', target: 2.5, actual: 3.0, status: 'Exceeded' }
          ]
        },
        {
          code: isPharmD ? 'PD105T' : 'BP105T',
          name: 'Communication Skills',
          sessionalI: 29,
          sessionalII: 28,
          sessionalIII: 30,
          bestOf2Sessional: isPharmD ? 29.5 : 28.5,
          internals: 24,
          semesterExam: 71,
          totalMarks: 95,
          grade: 'O',
          attainmentTarget: 2.5,
          attainmentActual: 3.0,
          coAttainment: [
            { co: 'CO1', target: 2.5, actual: 3.0, status: 'Exceeded' },
            { co: 'CO2', target: 2.5, actual: 3.0, status: 'Exceeded' },
            { co: 'CO3', target: 2.5, actual: 3.0, status: 'Exceeded' }
          ]
        },
      ];
      return s1Data.map(item => {
        const dynamic = getDynamicMarks(item.code, item.sessionalI, item.sessionalII, item.sessionalIII);
        const total = Math.round(dynamic.bestOf2Sessional) + dynamic.semesterExam;
        let grade = 'B+';
        if (total >= 90) grade = 'O';
        else if (total >= 80) grade = 'A+';
        else if (total >= 70) grade = 'A';
        else if (total >= 60) grade = 'B+';
        else grade = 'B';
        return {
          ...item,
          sessionalI: dynamic.sessionalI,
          sessionalII: dynamic.sessionalII,
          sessionalIII: dynamic.sessionalIII,
          bestOf2Sessional: dynamic.bestOf2Sessional,
          semesterExam: dynamic.semesterExam,
          totalMarks: total,
          grade
        };
      });
    }

    const semesterSubjects: Record<number, { code: string; name: string }[]> = {
      2: [
        { code: isPharmD ? 'PD201T' : 'BP201T', name: 'Human Anatomy and Physiology II' },
        { code: isPharmD ? 'PD202T' : 'BP202T', name: 'Pharmaceutical Organic Chemistry I' },
        { code: isPharmD ? 'PD203T' : 'BP203T', name: 'Biochemistry' },
        { code: isPharmD ? 'PD204T' : 'BP204T', name: 'Pathophysiology' },
      ],
      3: [
        { code: isPharmD ? 'PD301T' : 'BP301T', name: 'Pharmaceutical Organic Chemistry II' },
        { code: isPharmD ? 'PD302T' : 'BP302T', name: 'Physical Pharmaceutics I' },
        { code: isPharmD ? 'PD303T' : 'BP303T', name: 'Pharmaceutical Microbiology' },
        { code: isPharmD ? 'PD304T' : 'BP304T', name: 'Pharmaceutical Engineering' },
      ],
      4: [
        { code: isPharmD ? 'PD401T' : 'BP401T', name: 'Pharmaceutical Organic Chemistry III' },
        { code: isPharmD ? 'PD402T' : 'BP402T', name: 'Physical Pharmaceutics II' },
        { code: isPharmD ? 'PD403T' : 'BP403T', name: 'Pharmacology I' },
        { code: isPharmD ? 'PD404T' : 'BP404T', name: 'Pharmacognosy and Phytochemistry I' },
      ],
      5: [
        { code: isPharmD ? 'PD501T' : 'BP501T', name: 'Medicinal Chemistry II' },
        { code: isPharmD ? 'PD502T' : 'BP502T', name: 'Industrial Pharmacy I' },
        { code: isPharmD ? 'PD503T' : 'BP503T', name: 'Pharmacology II' },
        { code: isPharmD ? 'PD504T' : 'BP504T', name: 'Pharmacognosy and Phytochemistry II' },
      ],
      6: [
        { code: isPharmD ? 'PD601T' : 'BP601T', name: 'Medicinal Chemistry III' },
        { code: isPharmD ? 'PD602T' : 'BP602T', name: 'Pharmacology III' },
        { code: isPharmD ? 'PD603T' : 'BP603T', name: 'Herbal Drug Technology' },
        { code: isPharmD ? 'PD604T' : 'BP604T', name: 'Biopharmaceutics and Pharmacokinetics' },
      ],
      7: [
        { code: isPharmD ? 'PD701T' : 'BP701T', name: 'Instrumental Methods of Analysis' },
        { code: isPharmD ? 'PD702T' : 'BP702T', name: 'Industrial Pharmacy II' },
        { code: isPharmD ? 'PD703T' : 'BP703T', name: 'Pharmacy Practice' },
        { code: isPharmD ? 'PD704T' : 'BP704T', name: 'Novel Drug Delivery System' },
      ],
      8: [
        { code: isPharmD ? 'PD801T' : 'BP801T', name: 'Biostatistics and Research Methodology' },
        { code: isPharmD ? 'PD802T' : 'BP802T', name: 'Social and Preventive Pharmacy' },
        { code: isPharmD ? 'PD803T' : 'BP803T', name: 'Pharma Marketing Management' },
        { code: isPharmD ? 'PD804T' : 'BP804T', name: 'Quality Control and Standardization' },
      ],
    };

    const baseSubjects = semesterSubjects[semesterNum] || semesterSubjects[2];

    return baseSubjects.map((sub, idx) => {
      const seed = (semesterNum * 9 + idx * 7) % 11;
      
      const s1 = 20 + (seed % 10);
      const s2 = 21 + ((seed + 2) % 9);
      const s3 = 20 + ((seed + 4) % 10);
      
      const dynamic = getDynamicMarks(sub.code, s1, s2, s3);
      const total = Math.round(dynamic.bestOf2Sessional) + dynamic.semesterExam;

      let grade = 'B+';
      if (total >= 90) grade = 'O';
      else if (total >= 80) grade = 'A+';
      else if (total >= 70) grade = 'A';
      else if (total >= 60) grade = 'B+';
      else grade = 'B';

      const attainmentActual = Number((2.3 + (seed % 7) * 0.1).toFixed(1));

      return {
        code: sub.code,
        name: sub.name,
        sessionalI: dynamic.sessionalI,
        sessionalII: dynamic.sessionalII,
        sessionalIII: dynamic.sessionalIII,
        bestOf2Sessional: dynamic.bestOf2Sessional,
        internals: Math.round(18 + (seed % 7)),
        semesterExam: dynamic.semesterExam,
        totalMarks: total,
        grade: grade,
        attainmentTarget: 2.5,
        attainmentActual: attainmentActual,
        coAttainment: [
          { co: 'CO1', target: 2.5, actual: Number((attainmentActual - 0.1).toFixed(1)), status: attainmentActual - 0.1 >= 2.5 ? 'Exceeded' : 'Attained' },
          { co: 'CO2', target: 2.5, actual: attainmentActual, status: attainmentActual >= 2.5 ? 'Exceeded' : 'Attained' },
          { co: 'CO3', target: 2.5, actual: Number((attainmentActual + 0.1).toFixed(1)), status: attainmentActual + 0.1 >= 2.5 ? 'Exceeded' : 'Attained' },
          { co: 'CO4', target: 2.5, actual: attainmentActual, status: attainmentActual >= 2.5 ? 'Exceeded' : 'Attained' }
        ]
      };
    });
  };

  const currentStudentProgress = getSemesterData(selectedSemester);

  const avgSessional = (currentStudentProgress.reduce((acc, sub) => acc + sub.bestOf2Sessional, 0) / currentStudentProgress.length).toFixed(1);
  const avgSemesterPercent = (currentStudentProgress.reduce((acc, sub) => acc + sub.totalMarks, 0) / currentStudentProgress.length).toFixed(1);
  const avgAttainment = (currentStudentProgress.reduce((acc, sub) => acc + sub.attainmentActual, 0) / currentStudentProgress.length).toFixed(2);

  return (
    <div className="flex flex-col gap-8 w-full max-w-5xl mx-auto pb-12">
      <div className="flex flex-col items-center text-center gap-5">
        <div>
          <h1 className="font-display font-extrabold text-2xl text-gray-900 tracking-tight">Academic Progress</h1>
          <p className="text-xs text-gray-500 font-medium">Verify your registered sessional marks, semester performance sheets, and PCI course outcomes attainment</p>
        </div>

        {/* Dynamic Programme Toggle and Semester Selector Options */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between w-full max-w-2xl bg-white p-3 rounded-2xl border border-gray-150 shadow-sm">
          <div className="flex items-center gap-1.5 p-1 bg-gray-100 rounded-xl">
            <button
              onClick={() => setProgramme('B.Pharm')}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                programme === 'B.Pharm'
                  ? 'bg-white text-[#8B1E3F] shadow-sm'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              B.Pharm (2 Sessionals)
            </button>
            <button
              onClick={() => setProgramme('Pharm.D')}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                programme === 'Pharm.D'
                  ? 'bg-white text-[#8B1E3F] shadow-sm'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              Pharm.D (3 Sessionals)
            </button>
          </div>

          <div className="flex items-center gap-1 overflow-x-auto max-w-full">
            {Array.from({ length: 8 }, (_, i) => i + 1).map((sem) => (
              <button
                key={sem}
                onClick={() => setSelectedSemester(sem)}
                className={`
                  px-2.5 py-1.5 rounded-lg text-[10px] font-extrabold transition-all duration-300 whitespace-nowrap
                  ${selectedSemester === sem
                    ? 'bg-[#8B1E3F] text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
                  }
                `}
              >
                Sem {sem}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Sessional Performance Average */}
        <GlassCard className="p-6 border-l-4 border-l-[#8B1E3F]">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Sessional Average</span>
            <span className="text-[9px] font-bold text-[#8B1E3F] bg-[#8B1E3F]/5 px-2 py-0.5 rounded-full">Max: 30</span>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-display font-black text-gray-900">{avgSessional}</span>
            <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> High Standing
            </span>
          </div>
          <p className="text-[10px] text-gray-400 mt-2 font-semibold">
            {programme === 'Pharm.D' ? 'Best-of-two' : 'Regular average'} sessional score rating
          </p>
        </GlassCard>

        {/* Semester Marks Average */}
        <GlassCard className="p-6 border-l-4 border-l-emerald-500">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Semester Marks</span>
            <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Max: 100</span>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-display font-black text-gray-900">{avgSemesterPercent}%</span>
            <span className="text-xs text-emerald-600 font-bold">Excellent</span>
          </div>
          <p className="text-[10px] text-gray-400 mt-2 font-semibold">Combined internals and semester exams</p>
        </GlassCard>

        {/* Course Outcomes Attainment */}
        <GlassCard className="p-6 border-l-4 border-l-purple-500">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">CO Attainment</span>
            <span className="text-[9px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">Max Index: 3.0</span>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-display font-black text-gray-900">{avgAttainment}</span>
            <span className="text-xs text-purple-600 font-bold">Level 3 Achieved</span>
          </div>
          <p className="text-[10px] text-gray-400 mt-2 font-semibold">PCI outcome accomplishment rating</p>
        </GlassCard>
      </div>

      {/* Sessional Marks Panel */}
      <div className="flex flex-col gap-4">
        <div className="border-b border-[#8B1E3F]/10 pb-2">
          <h2 className="font-display font-bold text-sm text-[#8B1E3F] uppercase tracking-wider flex items-center gap-1.5">
            <BarChart3 className="w-4 h-4" /> 1. Sessional Marks Breakdown (Semester {selectedSemester})
          </h2>
          <p className="text-[11px] text-gray-500">
            Continuous internal sessional scores ({programme === 'Pharm.D' ? 'Best of 2 determines sessional average' : 'Sessional 1 & 2 determines average'})
          </p>
        </div>

        <div className="bg-white border border-gray-150/40 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100 text-[10px] uppercase font-bold text-gray-400">
                  <th className="p-4">Subject Code</th>
                  <th className="p-4">Subject Title</th>
                  <th className="p-4 text-center">Sessional I (30)</th>
                  <th className="p-4 text-center">Sessional II (30)</th>
                  {programme === 'Pharm.D' && <th className="p-4 text-center">Sessional III (30)</th>}
                  <th className="p-4 text-center bg-[#8B1E3F]/5 text-[#8B1E3F]">Sessional Avg (30)</th>
                </tr>
              </thead>
              <tbody>
                {currentStudentProgress.map((sub) => (
                  <tr key={sub.code} className="border-b border-gray-50 hover:bg-gray-50/30 transition-all font-semibold text-gray-700">
                    <td className="p-4 font-mono font-bold text-[#8B1E3F]">{sub.code}</td>
                    <td className="p-4 text-gray-900 font-extrabold">{sub.name}</td>
                    <td className="p-4 text-center font-mono font-bold text-gray-500">{sub.sessionalI}</td>
                    <td className="p-4 text-center font-mono font-bold text-gray-500">{sub.sessionalII}</td>
                    {programme === 'Pharm.D' && <td className="p-4 text-center font-mono font-bold text-gray-500">{sub.sessionalIII}</td>}
                    <td className="p-4 text-center font-mono font-black bg-[#8B1E3F]/5 text-[#8B1E3F] text-sm">{sub.bestOf2Sessional.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Semester Marks Panel */}
      <div className="flex flex-col gap-4">
        <div className="border-b border-[#8B1E3F]/10 pb-2">
          <h2 className="font-display font-bold text-sm text-[#8B1E3F] uppercase tracking-wider flex items-center gap-1.5">
            <Award className="w-4 h-4" /> 2. Semester Examination Marks (Semester {selectedSemester})
          </h2>
          <p className="text-[11px] text-gray-500">Continuous internal assessment and external end-semester university examination transcripts</p>
        </div>

        <div className="bg-white border border-gray-150/40 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100 text-[10px] uppercase font-bold text-gray-400">
                  <th className="p-4">Subject Code</th>
                  <th className="p-4">Subject Title</th>
                  <th className="p-4 text-center">Continuous Internals (25)</th>
                  <th className="p-4 text-center">University Exam (75)</th>
                  <th className="p-4 text-center bg-emerald-50 text-emerald-700">Total Marks (100)</th>
                  <th className="p-4 text-center">Grade</th>
                </tr>
              </thead>
              <tbody>
                {currentStudentProgress.map((sub) => (
                  <tr key={sub.code} className="border-b border-gray-50 hover:bg-gray-50/30 transition-all font-semibold text-gray-700">
                    <td className="p-4 font-mono font-bold text-[#8B1E3F]">{sub.code}</td>
                    <td className="p-4 text-gray-900 font-extrabold">{sub.name}</td>
                    <td className="p-4 text-center font-mono font-bold text-gray-500">{sub.internals}</td>
                    <td className="p-4 text-center font-mono font-bold text-gray-500">{sub.semesterExam}</td>
                    <td className="p-4 text-center font-mono font-black bg-emerald-50 text-emerald-700 text-sm">{sub.totalMarks}</td>
                    <td className="p-4 text-center">
                      <span className="bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full font-black text-[10px] border border-emerald-100">
                        {sub.grade}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Attainment Levels Mapped to Course Outcomes */}
      <div className="flex flex-col gap-4">
        <div className="border-b border-[#8B1E3F]/10 pb-2">
          <h2 className="font-display font-bold text-sm text-[#8B1E3F] uppercase tracking-wider flex items-center gap-1.5">
            <Star className="w-4 h-4" /> 3. Course Outcomes (CO) Attainment (Semester {selectedSemester})
          </h2>
          <p className="text-[11px] text-gray-500">Detailed mapping of student achievement indexes against target PCI attainment scales</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {currentStudentProgress.map((sub) => (
            <GlassCard key={sub.code} className="p-6">
              <div className="flex justify-between items-center border-b border-gray-100 pb-3 mb-4">
                <div>
                  <span className="text-[9px] font-black text-gray-400 uppercase font-mono">{sub.code}</span>
                  <h3 className="text-xs font-black text-gray-800 line-clamp-1">{sub.name}</h3>
                </div>
                <div className="text-right">
                  <span className="text-[9px] font-bold text-gray-400 block uppercase">Attainment Level</span>
                  <span className="text-xs font-black text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full font-mono">
                    {sub.attainmentActual} / 3.0
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                {sub.coAttainment.map((coItem) => (
                  <div key={coItem.co} className="flex justify-between items-center bg-gray-50/50 border border-white p-2 rounded-xl text-xs font-semibold text-gray-600">
                    <span className="font-black text-gray-700 font-mono">{coItem.co}</span>
                    <div className="flex items-center gap-4">
                      <span>Target: <strong className="text-gray-700 font-mono font-bold">{coItem.target.toFixed(1)}</strong></span>
                      <span>Actual: <strong className="text-purple-600 font-mono font-black">{coItem.actual.toFixed(1)}</strong></span>
                      <span className={`text-[9px] font-black px-2 py-0.2 rounded-full uppercase tracking-wider ${
                        coItem.status === 'Exceeded' 
                          ? 'bg-emerald-50 text-emerald-600' 
                          : 'bg-blue-50 text-blue-600'
                      }`}>
                        {coItem.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </div>
  );
}
