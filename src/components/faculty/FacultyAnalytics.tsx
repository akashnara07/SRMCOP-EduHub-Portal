import React, { useState } from 'react';
import { BookOpen, Users, Download, ArrowLeft, BarChart3, ChevronRight, Award, GraduationCap, FileSpreadsheet, Clock, Layers } from 'lucide-react';
import GlassCard from '../GlassCard';
import { Subject, FacultyProfile } from '../../types';

interface FacultyAnalyticsProps {
  facultyProfile: FacultyProfile;
  subjects: Subject[];
}

interface StudentPerformance {
  id: string;
  name: string;
  registerNumber: string;
  sessionalIMark: number;   // out of 30
  sessionalIIMark: number;  // out of 30
  sessionalIIIMark: number; // out of 30
  internalAttainment: number; // out of 3 (OBE scale)
  semesterAttainment: number; // out of 3 (OBE scale)
}

// Generate some rich, deterministic mock scores for student progress tracking
const mockPerformanceData: Record<string, StudentPerformance[]> = {
  'bpharm-y1-s1-p1': [
    { id: '1', name: 'J. Akash', registerNumber: 'SRM2026PH7810', sessionalIMark: 26, sessionalIIMark: 27, sessionalIIIMark: 25, internalAttainment: 2.6, semesterAttainment: 2.5 },
    { id: '2', name: 'Meera Patel', registerNumber: 'SRM2026PH7812', sessionalIMark: 22, sessionalIIMark: 24, sessionalIIIMark: 21, internalAttainment: 2.2, semesterAttainment: 2.4 },
    { id: '3', name: 'Rahul Sharma', registerNumber: 'SRM2026PH7815', sessionalIMark: 29, sessionalIIMark: 28, sessionalIIIMark: 28, internalAttainment: 2.9, semesterAttainment: 2.8 },
    { id: '4', name: 'Priyesh Sen', registerNumber: 'SRM2026PH7830', sessionalIMark: 20, sessionalIIMark: 21, sessionalIIIMark: 22, internalAttainment: 2.0, semesterAttainment: 2.1 },
    { id: '5', name: 'Anjali Rao', registerNumber: 'SRM2026PH7831', sessionalIMark: 27, sessionalIIMark: 26, sessionalIIIMark: 24, internalAttainment: 2.5, semesterAttainment: 2.7 },
    { id: '6', name: 'Siddharth Nair', registerNumber: 'SRM2026PH7845', sessionalIMark: 25, sessionalIIMark: 23, sessionalIIIMark: 26, internalAttainment: 2.4, semesterAttainment: 2.5 },
  ],
  'pharmd-y1-p1': [
    { id: '1', name: 'J. Akash', registerNumber: 'SRM2026PH7810', sessionalIMark: 25, sessionalIIMark: 24, sessionalIIIMark: 26, internalAttainment: 2.5, semesterAttainment: 2.5 },
    { id: '2', name: 'Meera Patel', registerNumber: 'SRM2026PH7812', sessionalIMark: 24, sessionalIIMark: 23, sessionalIIIMark: 22, internalAttainment: 2.4, semesterAttainment: 2.4 },
    { id: '3', name: 'Rahul Sharma', registerNumber: 'SRM2026PH7815', sessionalIMark: 28, sessionalIIMark: 29, sessionalIIIMark: 27, internalAttainment: 2.8, semesterAttainment: 2.7 },
    { id: '4', name: 'Priyesh Sen', registerNumber: 'SRM2026PH7830', sessionalIMark: 22, sessionalIIMark: 21, sessionalIIIMark: 20, internalAttainment: 2.1, semesterAttainment: 2.1 },
    { id: '5', name: 'Anjali Rao', registerNumber: 'SRM2026PH7831', sessionalIMark: 26, sessionalIIMark: 25, sessionalIIIMark: 24, internalAttainment: 2.5, semesterAttainment: 2.5 },
    { id: '6', name: 'Siddharth Nair', registerNumber: 'SRM2026PH7845', sessionalIMark: 24, sessionalIIMark: 26, sessionalIIIMark: 25, internalAttainment: 2.5, semesterAttainment: 2.6 },
  ],
  'bpharm-y1-s2-p1': [
    { id: '1', name: 'J. Akash', registerNumber: 'SRM2026PH7810', sessionalIMark: 21, sessionalIIMark: 22, sessionalIIIMark: 23, internalAttainment: 2.1, semesterAttainment: 2.2 },
    { id: '2', name: 'Meera Patel', registerNumber: 'SRM2026PH7812', sessionalIMark: 19, sessionalIIMark: 20, sessionalIIIMark: 18, internalAttainment: 1.9, semesterAttainment: 2.0 },
    { id: '3', name: 'Rahul Sharma', registerNumber: 'SRM2026PH7815', sessionalIMark: 25, sessionalIIMark: 26, sessionalIIIMark: 24, internalAttainment: 2.5, semesterAttainment: 2.5 },
    { id: '4', name: 'Priyesh Sen', registerNumber: 'SRM2026PH7830', sessionalIMark: 23, sessionalIIMark: 21, sessionalIIIMark: 22, internalAttainment: 2.2, semesterAttainment: 2.1 },
    { id: '5', name: 'Anjali Rao', registerNumber: 'SRM2026PH7831', sessionalIMark: 24, sessionalIIMark: 25, sessionalIIIMark: 23, internalAttainment: 2.4, semesterAttainment: 2.4 },
    { id: '6', name: 'Siddharth Nair', registerNumber: 'SRM2026PH7845', sessionalIMark: 26, sessionalIIMark: 24, sessionalIIIMark: 25, internalAttainment: 2.5, semesterAttainment: 2.5 },
  ],
  'bpharm-y1-s1-p3': [
    { id: '1', name: 'J. Akash', registerNumber: 'SRM2026PH7810', sessionalIMark: 28, sessionalIIMark: 28, sessionalIIIMark: 29, internalAttainment: 2.8, semesterAttainment: 2.8 },
    { id: '2', name: 'Meera Patel', registerNumber: 'SRM2026PH7812', sessionalIMark: 23, sessionalIIMark: 22, sessionalIIIMark: 24, internalAttainment: 2.3, semesterAttainment: 2.4 },
    { id: '3', name: 'Rahul Sharma', registerNumber: 'SRM2026PH7815', sessionalIMark: 27, sessionalIIMark: 29, sessionalIIIMark: 28, internalAttainment: 2.7, semesterAttainment: 2.7 },
    { id: '4', name: 'Priyesh Sen', registerNumber: 'SRM2026PH7830', sessionalIMark: 24, sessionalIIMark: 23, sessionalIIIMark: 25, internalAttainment: 2.4, semesterAttainment: 2.4 },
    { id: '5', name: 'Anjali Rao', registerNumber: 'SRM2026PH7831', sessionalIMark: 29, sessionalIIMark: 28, sessionalIIIMark: 27, internalAttainment: 2.8, semesterAttainment: 2.8 },
    { id: '6', name: 'Siddharth Nair', registerNumber: 'SRM2026PH7845', sessionalIMark: 25, sessionalIIMark: 26, sessionalIIIMark: 24, internalAttainment: 2.5, semesterAttainment: 2.5 },
  ]
};

export default function FacultyAnalytics({
  facultyProfile,
  subjects,
}: FacultyAnalyticsProps) {
  // Only subjects taught by this faculty member
  const mySubjects = subjects.filter((s) => facultyProfile.subjects.includes(s.id));
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);

  const selectedSubject = subjects.find((s) => s.id === selectedSubjectId);
  const studentScores = selectedSubjectId ? (mockPerformanceData[selectedSubjectId] || mockPerformanceData['bpharm-y1-s1-p1'] || []) : [];

  // Downloader for detailed reports as Web-Printable formatted PDFs
  const handleDownloadReport = (sub: Subject, data: StudentPerformance[]) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to print/download the performance report.');
      return;
    }

    const avgI = (data.reduce((acc, s) => acc + s.sessionalIMark, 0) / data.length).toFixed(1);
    const avgII = (data.reduce((acc, s) => acc + s.sessionalIIMark, 0) / data.length).toFixed(1);
    const avgIII = (data.reduce((acc, s) => acc + s.sessionalIIIMark, 0) / data.length).toFixed(1);

    printWindow.document.write(`
      <html>
        <head>
          <title>Performance Report - ${sub.code}</title>
          <style>
            body {
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              color: #1a1a1a;
              padding: 40px;
              line-height: 1.5;
            }
            .header-container {
              display: flex;
              align-items: center;
              justify-content: space-between;
              border-bottom: 3px double #8B1E3F;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .college-details h1 {
              font-size: 24px;
              color: #8B1E3F;
              margin: 0;
              font-weight: 800;
              text-transform: uppercase;
              letter-spacing: -0.5px;
            }
            .college-details p {
              margin: 4px 0 0 0;
              font-size: 12px;
              color: #555;
              font-weight: 600;
            }
            .report-title {
              text-align: center;
              font-size: 18px;
              font-weight: 700;
              text-transform: uppercase;
              margin-bottom: 25px;
              letter-spacing: 1px;
              color: #333;
            }
            .meta-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 12px;
              margin-bottom: 30px;
              background-color: #fcf8f9;
              border: 1px solid #f3e6e9;
              padding: 16px;
              border-radius: 8px;
              font-size: 13px;
            }
            .meta-item {
              display: flex;
              justify-content: space-between;
              padding: 4px 0;
            }
            .meta-label {
              font-weight: 600;
              color: #666;
            }
            .meta-value {
              font-weight: 700;
              color: #111;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 30px;
              font-size: 12px;
            }
            th, td {
              border: 1px solid #e0e0e0;
              padding: 10px 12px;
              text-align: left;
            }
            th {
              background-color: #8B1E3F;
              color: white;
              font-weight: 700;
              text-transform: uppercase;
              font-size: 10px;
              letter-spacing: 0.5px;
            }
            tr:nth-child(even) td {
              background-color: #fafafa;
            }
            .stats-summary {
              background-color: #f5f5f5;
              font-weight: bold;
            }
            .footer-signatures {
              margin-top: 60px;
              display: flex;
              justify-content: space-between;
              font-size: 12px;
              font-weight: 700;
              color: #444;
            }
            .sig-line {
              border-top: 1px solid #333;
              width: 200px;
              text-align: center;
              padding-top: 8px;
              margin-top: 50px;
            }
            @media print {
              body {
                padding: 20px;
              }
              button {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <div style="display: flex; justify-content: flex-end; margin-bottom: 20px;">
            <button onclick="window.print()" style="background-color: #8B1E3F; color: white; border: none; padding: 10px 20px; font-weight: bold; border-radius: 6px; cursor: pointer;">Print / Download PDF</button>
          </div>
          <div class="header-container">
            <div class="college-details">
              <h1>SRM College of Pharmacy</h1>
              <p>${facultyProfile?.department || 'Department of Pharmacology'} • ISO 9001:2015 Certified</p>
            </div>
            <div style="text-align: right; font-size: 11px; color: #666; font-weight: 600;">
              Academic Year: ${sub.academicYear || '2025-2026'}<br/>
              Date: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
          </div>

          <div class="report-title">Academic Performance & Internal Attainment Report</div>

          <div class="meta-grid">
            <div class="meta-item">
              <span class="meta-label">Subject Code / Title:</span>
              <span class="meta-value">${sub.code} - ${sub.name}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Faculty in Charge:</span>
              <span class="meta-value">${facultyProfile.name}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Programme / Year:</span>
              <span class="meta-value">${sub.programme} • Semester ${sub.semester}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Regulation / Batch:</span>
              <span class="meta-value">PCI Regulation 2020 • Batch 2025</span>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 5%">S.No</th>
                <th style="width: 15%">Registration No</th>
                <th style="width: 30%">Name of Student</th>
                <th style="width: 10%; text-align: center;">Sessional I (30)</th>
                <th style="width: 10%; text-align: center;">Sessional II (30)</th>
                <th style="width: 10%; text-align: center;">Sessional III (30)</th>
                <th style="width: 10%; text-align: center;">Int. Attainment</th>
                <th style="width: 10%; text-align: center;">Sem. Attainment</th>
              </tr>
            </thead>
            <tbody>
              ${data.map((st, idx) => `
                <tr>
                  <td>${idx + 1}</td>
                  <td><strong>${st.registerNumber}</strong></td>
                  <td>${st.name}</td>
                  <td style="text-align: center;">${st.sessionalIMark}</td>
                  <td style="text-align: center;">${st.sessionalIIMark}</td>
                  <td style="text-align: center;">${st.sessionalIIIMark}</td>
                  <td style="text-align: center; font-weight: 700; color: #8B1E3F;">${st.internalAttainment}</td>
                  <td style="text-align: center; font-weight: 700;">${st.semesterAttainment}</td>
                </tr>
              `).join('')}
              <tr class="stats-summary">
                <td colspan="3" style="text-align: right; padding-right: 15px;">Average Subject Scores:</td>
                <td style="text-align: center; color: #8B1E3F;">${avgI}</td>
                <td style="text-align: center; color: #8B1E3F;">${avgII}</td>
                <td style="text-align: center; color: #8B1E3F;">${avgIII}</td>
                <td colspan="2" style="background-color: #fafafa;"></td>
              </tr>
            </tbody>
          </table>

          <div style="font-size: 11px; color: #666; margin-top: 10px; font-style: italic;">
            * Note: Internal Attainment scores are calculated in accordance with the university guidelines mapped to PCI 2020 regulations.
          </div>

          <div class="footer-signatures">
            <div class="sig-line">Faculty Signature</div>
            <div class="sig-line">Head of Department</div>
            <div class="sig-line">Principal / Dean</div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // If a subject is selected, show details
  if (selectedSubject) {
    // Calculate stats
    const averageSessionalI = (studentScores.reduce((acc, s) => acc + s.sessionalIMark, 0) / studentScores.length).toFixed(1);
    const averageSessionalII = (studentScores.reduce((acc, s) => acc + s.sessionalIIMark, 0) / studentScores.length).toFixed(1);
    const averageSessionalIII = (studentScores.reduce((acc, s) => acc + s.sessionalIIIMark, 0) / studentScores.length).toFixed(1);
    const averageInternalAttainment = (studentScores.reduce((acc, s) => acc + s.internalAttainment, 0) / studentScores.length).toFixed(1);
    const averageSemesterAttainment = (studentScores.reduce((acc, s) => acc + s.semesterAttainment, 0) / studentScores.length).toFixed(1);

    return (
      <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto">
        {/* Back and title bar */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedSubjectId(null)}
              className="w-10 h-10 rounded-full bg-white/60 border border-white/40 hover:bg-white flex items-center justify-center text-gray-700 transition-all shadow-sm"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">
                {selectedSubject.code} • Analytics
              </span>
              <h1 className="font-display font-extrabold text-xl text-gray-900 tracking-tight">
                {selectedSubject.name}
              </h1>
            </div>
          </div>

          <button
            onClick={() => handleDownloadReport(selectedSubject, studentScores)}
            className="px-4 py-2.5 bg-[#8B1E3F] hover:bg-[#b32a4e] text-white text-xs font-bold rounded-full transition-all flex items-center gap-2 shadow-md shadow-maroon-900/10"
          >
            <Download className="w-4 h-4" /> Download Performance Report
          </button>
        </div>

        {/* Quick averages cards row */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <GlassCard className="p-4 border-l-4 border-l-blue-500">
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block font-semibold">Avg Sessional I</span>
            <span className="text-xl font-display font-black text-gray-950 block mt-1">{averageSessionalI} / 30</span>
          </GlassCard>
          <GlassCard className="p-4 border-l-4 border-l-emerald-500">
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block font-semibold">Avg Sessional II</span>
            <span className="text-xl font-display font-black text-gray-950 block mt-1">{averageSessionalII} / 30</span>
          </GlassCard>
          <GlassCard className="p-4 border-l-4 border-l-purple-500">
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block font-semibold">Avg Sessional III</span>
            <span className="text-xl font-display font-black text-gray-950 block mt-1">{averageSessionalIII} / 30</span>
          </GlassCard>
          <GlassCard className="p-4 border-l-4 border-l-amber-500">
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block font-semibold">Avg Internal Attainment</span>
            <span className="text-xl font-display font-black text-gray-950 block mt-1">{averageInternalAttainment} / 3.0</span>
          </GlassCard>
          <GlassCard className="p-4 border-l-4 border-l-rose-500">
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block font-semibold">Avg Semester Attainment</span>
            <span className="text-xl font-display font-black text-gray-950 block mt-1">{averageSemesterAttainment} / 3.0</span>
          </GlassCard>
        </div>

        {/* Table of marks */}
        <GlassCard className="p-6">
          <div className="border-b border-gray-150 pb-3 mb-4">
            <h3 className="font-display font-bold text-base text-gray-900">Student Evaluations List</h3>
            <p className="text-xs text-gray-500">Comprehensive internal marks breakdown for Semester {selectedSubject.semester} candidates</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-150 text-[10px] font-extrabold text-gray-400 uppercase tracking-wider bg-gray-50/50">
                  <th className="py-3 px-3">S.No</th>
                  <th className="py-3 px-3">Registration No</th>
                  <th className="py-3 px-3">Name of Student</th>
                  <th className="py-3 px-3 text-center">Sessional I (30)</th>
                  <th className="py-3 px-3 text-center">Sessional II (30)</th>
                  <th className="py-3 px-3 text-center">Sessional III (30)</th>
                  <th className="py-3 px-3 text-center">Internal Attainment</th>
                  <th className="py-3 px-3 text-center">Semester Attainment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {studentScores.map((score, index) => (
                  <tr key={score.id} className="text-xs hover:bg-gray-50/40 transition-all font-semibold">
                    <td className="py-3.5 px-3 font-mono text-gray-400 text-[11px]">{index + 1}</td>
                    <td className="py-3.5 px-3 font-mono text-gray-500 text-[10px]">{score.registerNumber}</td>
                    <td className="py-3.5 px-3 font-bold text-gray-900">{score.name}</td>
                    <td className="py-3.5 px-3 text-center font-black text-blue-600 bg-blue-50/10">{score.sessionalIMark}</td>
                    <td className="py-3.5 px-3 text-center font-black text-emerald-600 bg-emerald-50/10">{score.sessionalIIMark}</td>
                    <td className="py-3.5 px-3 text-center font-black text-purple-600 bg-purple-50/10">{score.sessionalIIIMark}</td>
                    <td className="py-3.5 px-3 text-center font-black text-amber-600 bg-amber-50/10">{score.internalAttainment}</td>
                    <td className="py-3.5 px-3 text-center font-black text-rose-600 bg-rose-50/10">{score.semesterAttainment}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </div>
    );
  }

  // Primary list view
  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto">
      <div>
        <h1 className="font-display font-extrabold text-2xl text-gray-900 tracking-tight">Handled Subjects Analytics</h1>
        <p className="text-xs text-gray-500 mt-1">Select a course to view detailed student evaluation sheets and performance analytics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
        {mySubjects.map((sub) => {
          const scores = mockPerformanceData[sub.id] || [];
          const credits = (sub.code && sub.code.endsWith('P')) ? 2 : 4;
          const hours = (sub.code && sub.code.endsWith('P')) ? 30 : 45;
          const activeAccent = sub.programme === 'B.Pharm' ? 'border-maroon-100 hover:border-[#8B1E3F]/30 hover:shadow-maroon-900/10' : 'border-teal-100 hover:border-[#0F766E]/30 hover:shadow-teal-900/10';
          const progBadgeStyle = sub.programme === 'B.Pharm' 
            ? 'bg-maroon-50 text-[#8B1E3F] border-maroon-100/40' 
            : 'bg-teal-50 text-[#0F766E] border-teal-100/40';

          return (
            <GlassCard
              key={sub.id}
              hoverLift
              onClick={() => setSelectedSubjectId(sub.id)}
              className={`p-6 relative cursor-pointer flex flex-col justify-between border-2 ${activeAccent} hover:shadow-2xl transition-all duration-300 rounded-[32px] overflow-hidden group bg-white`}
            >
              {/* Decorative background gradient */}
              <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20 -mr-10 -mt-10 transition-colors duration-500 ${
                sub.programme === 'B.Pharm' ? 'bg-[#8B1E3F]' : 'bg-[#0F766E]'
              }`} />

              <div>
                {/* Top Tag Row */}
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 text-[10px] font-mono font-extrabold tracking-wider rounded-lg ${
                      sub.programme === 'B.Pharm'
                        ? 'bg-[#8B1E3F]/5 text-[#8B1E3F]'
                        : 'bg-[#0F766E]/5 text-[#0F766E]'
                    }`}>
                      {sub.code}
                    </span>
                    <span className="text-[9px] font-bold uppercase text-gray-400">
                      {sub.regulation || 'PCI 2017'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className={`text-[9px] font-black px-2.5 py-1 rounded-full uppercase border ${progBadgeStyle}`}>
                      {sub.programme} • {sub.semester ? `Sem ${sub.semester}` : `Year ${sub.year}`}
                    </span>
                  </div>
                </div>

                {/* Subject Title */}
                <h3 className="font-display font-black text-xl text-gray-900 leading-snug tracking-tight mb-4 pr-6 transition-colors duration-300 group-hover:text-[#8B1E3F]">
                  {sub.name}
                </h3>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-3 gap-3 py-3.5 border-y border-gray-100 my-4 text-[10px] font-semibold text-gray-500 bg-gray-50/50 rounded-2xl px-4">
                  <div className="flex flex-col gap-1 border-r border-gray-150/40 pr-1">
                    <span className="text-gray-400 text-[8px] uppercase font-black tracking-wider flex items-center gap-1">
                      <Award className="w-3 h-3 text-amber-500" />
                      Credits
                    </span>
                    <span className="font-extrabold text-gray-800 text-xs">{credits} Credits</span>
                  </div>
                  <div className="flex flex-col gap-1 border-r border-gray-150/40 pr-1">
                    <span className="text-gray-400 text-[8px] uppercase font-black tracking-wider flex items-center gap-1">
                      <Clock className="w-3 h-3 text-indigo-500" />
                      Hours
                    </span>
                    <span className="font-extrabold text-gray-800 text-xs">{hours} Hrs Required</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-gray-400 text-[8px] uppercase font-black tracking-wider flex items-center gap-1">
                      <Layers className="w-3 h-3 text-rose-500" />
                      Regulation
                    </span>
                    <span className="font-extrabold text-gray-800 text-xs">{sub.regulation || 'PCI 2017'}</span>
                  </div>
                </div>

                {/* Secondary Metadata Info */}
                <div className="space-y-2 text-[10px] font-bold text-gray-500 mt-2 pl-1 bg-gray-50/30 p-3 rounded-2xl border border-gray-100">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 font-extrabold uppercase text-[8px]">Faculty Assigned:</span>
                    <span className="text-gray-800 font-black">{sub.facultyName || 'Not Assigned'}</span>
                  </div>
                </div>
              </div>

              {/* Redesigned Card Footer Workspace */}
              <div className="border-t border-gray-150/40 pt-4 mt-5 flex justify-between items-center">
                <span className="text-xs text-gray-500 font-bold flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-[#8B1E3F]" /> {scores.length} Active Students
                </span>
                <button
                  className="text-xs font-bold text-[#8B1E3F] flex items-center gap-0.5 group-hover:underline"
                >
                  View Marks <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}
