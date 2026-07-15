import React, { useState, useEffect } from 'react';
import { 
  BookOpen, ShieldCheck, Award, Sliders, Layers, Trash2, Plus, Edit, ChevronDown, ChevronRight, Library
} from 'lucide-react';
import { Subject } from '../../types';
import { db } from '../../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { 
  getCurriculumDb, 
  saveCurriculumDb, 
  MasterCurriculumDb, 
  CourseInformation 
} from '../../data/curriculumDb';

interface CurriculumTabContentProps {
  subject: Subject;
  readOnly: boolean;
  triggerToast: (msg: string) => void;
}

export default function CurriculumTabContent({
  subject,
  readOnly,
  triggerToast,
}: CurriculumTabContentProps) {
  // Loaded Curriculum data matching the subject code
  const [curriculumDb, setCurriculumDb] = useState<MasterCurriculumDb>(getCurriculumDb());
  const [subjectInfo, setSubjectInfo] = useState<CourseInformation | undefined>(
    curriculumDb.courseInformation.find(c => c.subjectCode === subject.code)
  );

  // Reload on subject code change
  useEffect(() => {
    const dbData = getCurriculumDb();
    setCurriculumDb(dbData);
    setSubjectInfo(dbData.courseInformation.find(c => c.subjectCode === subject.code));
  }, [subject.code]);

  // Curriculum elements derived from DB
  const scopeText = curriculumDb.scope.find(s => s.subjectCode === subject.code)?.scopeStatement || 
    'Standard curriculum scope details are pending import.';
  const objectivesList = curriculumDb.objectives
    .filter(o => o.subjectCode === subject.code)
    .sort((a, b) => a.order - b.order);
  const outcomesList = curriculumDb.courseOutcomes
    .filter(co => co.subjectCode === subject.code);
  const unitsList = curriculumDb.units
    .filter(u => u.subjectCode === subject.code);
  const topicsList = curriculumDb.curriculumTopics
    .filter(t => t.subjectCode === subject.code);
  const recBooks = curriculumDb.recommendedBooks
    .filter(b => b.subjectCode === subject.code);
  const refBooks = curriculumDb.referenceBooks
    .filter(b => b.subjectCode === subject.code);
  const assessment = curriculumDb.assessmentPattern
    .find(a => a.subjectCode === subject.code);

  // Accordion/Collapse States
  const [expandedCurriculumUnits, setExpandedCurriculumUnits] = useState<Record<string, boolean>>({});

  // CO-PO Mapping State
  const [coPoMapping, setCoPoMapping] = useState<Record<string, Record<string, number>>>({
    'CO1': { 'PO1': 3, 'PO2': 2, 'PO3': 1, 'PO4': 3, 'PO5': 2, 'PO6': 0, 'PO7': 1, 'PO8': 2, 'PO9': 1, 'PO10': 3, 'PO11': 0, 'PO12': 2 },
    'CO2': { 'PO1': 2, 'PO2': 3, 'PO3': 2, 'PO4': 1, 'PO5': 3, 'PO6': 1, 'PO7': 2, 'PO8': 0, 'PO9': 2, 'PO10': 1, 'PO11': 3, 'PO12': 1 },
    'CO3': { 'PO1': 3, 'PO2': 2, 'PO3': 3, 'PO4': 2, 'PO5': 1, 'PO6': 2, 'PO7': 1, 'PO8': 3, 'PO9': 0, 'PO10': 2, 'PO11': 1, 'PO12': 3 },
    'CO4': { 'PO1': 1, 'PO2': 1, 'PO3': 2, 'PO4': 3, 'PO5': 2, 'PO6': 3, 'PO7': 0, 'PO8': 1, 'PO9': 3, 'PO10': 2, 'PO11': 2, 'PO12': 1 },
    'CO5': { 'PO1': 2, 'PO2': 2, 'PO3': 1, 'PO4': 2, 'PO5': 3, 'PO6': 0, 'PO7': 3, 'PO8': 2, 'PO9': 1, 'PO10': 3, 'PO11': 1, 'PO12': 2 }
  });

  const handleCoPoCellClick = (coCode: string, po: string) => {
    setCoPoMapping(prev => {
      const currentVal = prev[coCode]?.[po] || 0;
      const newVal = (currentVal + 1) % 4; // Cycles through 0, 1, 2, 3
      return {
        ...prev,
        [coCode]: {
          ...(prev[coCode] || {}),
          [po]: newVal
        }
      };
    });
    triggerToast(`Updated ${coCode} to ${po} alignment index.`);
  };

  // Section-wise editing states
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [savingSection, setSavingSection] = useState<string | null>(null);

  // 1. Course Information States
  const [editInfoCode, setEditInfoCode] = useState('');
  const [editInfoName, setEditInfoName] = useState('');
  const [editInfoProgramme, setEditInfoProgramme] = useState('');
  const [editInfoRegulation, setEditInfoRegulation] = useState('');
  const [editInfoSemester, setEditInfoSemester] = useState<number>(3);
  const [editInfoCredits, setEditInfoCredits] = useState<number>(4);
  const [editInfoHours, setEditInfoHours] = useState<number>(45);
  const [editInfoType, setEditInfoType] = useState('Theory');

  // 2. Course Scope State
  const [editScopeStatement, setEditScopeStatement] = useState('');

  // 3. Learning Objectives State
  const [editObjectivesList, setEditObjectivesList] = useState<string[]>([]);

  // 4. Course Outcomes State
  const [editOutcomesList, setEditOutcomesList] = useState<string[]>([]);

  // 5. CO-PO Alignment Mapping Matrix State
  const [editCoPoMapping, setEditCoPoMapping] = useState<Record<string, Record<string, number>>>({});

  // 6. Units & Topics State
  const [editUnitsList, setEditUnitsList] = useState<any[]>([]);

  // 7. Recommended Books State
  const [editRecBooksList, setEditRecBooksList] = useState<{ author: string; title: string; edition: string }[]>([]);

  // 8. Reference Books State
  const [editRefBooksList, setEditRefBooksList] = useState<{ author: string; title: string; edition: string }[]>([]);

  // 9. Assessment Pattern State
  const [editTheoryInternal, setEditTheoryInternal] = useState<number>(25);
  const [editTheoryExternal, setEditTheoryExternal] = useState<number>(75);
  const [editPracticalInternal, setEditPracticalInternal] = useState<number>(15);
  const [editPracticalExternal, setEditPracticalExternal] = useState<number>(35);
  const [editUniversityExam, setEditUniversityExam] = useState<number>(100);

  const getRomanSemester = (sem: number): string => {
    const romans = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
    return `Semester ${romans[sem - 1] || sem}`;
  };

  const handleStartEdit = (section: string) => {
    setEditingSection(section);
    
    if (section === 'info') {
      setEditInfoCode(subjectInfo?.subjectCode || subject.code || '');
      setEditInfoName(subjectInfo?.courseName || subject.name || '');
      setEditInfoProgramme(subjectInfo?.programme || subject.programme || '');
      setEditInfoRegulation(subjectInfo?.regulation || subject.regulation || 'PCI 2017');
      setEditInfoSemester(subjectInfo?.semester || subject.semester || 3);
      setEditInfoCredits(subjectInfo?.credits || 4);
      setEditInfoHours(subjectInfo?.hours || 45);
      setEditInfoType(subjectInfo?.subjectType || 'Theory');
    } else if (section === 'scope') {
      setEditScopeStatement(scopeText);
    } else if (section === 'objectives') {
      setEditObjectivesList(objectivesList.map(o => o.objectiveText));
    } else if (section === 'outcomes') {
      setEditOutcomesList(outcomesList.map(co => co.coText));
    } else if (section === 'matrix') {
      setEditCoPoMapping(JSON.parse(JSON.stringify(coPoMapping)));
    } else if (section === 'units') {
      const nestedUnits = unitsList.map(u => {
        const uTopics = topicsList
          .filter(t => t.unitCode === u.unitCode)
          .map(t => ({
            number: t.topicCode,
            name: t.topicName,
            hours: Number(t.hours)
          }));
        
        return {
          name: u.unitCode,
          title: u.unitName,
          hours: Number(u.hours),
          description: '',
          topics: uTopics
        };
      });
      setEditUnitsList(nestedUnits);
    } else if (section === 'recommendedBooks') {
      setEditRecBooksList(recBooks.map(b => ({ author: b.author, title: b.title, edition: b.edition })));
    } else if (section === 'referenceBooks') {
      setEditRefBooksList(refBooks.map(b => ({ author: b.author, title: b.title, edition: b.edition })));
    } else if (section === 'assessment') {
      setEditTheoryInternal(assessment?.theoryInternal ?? 25);
      setEditTheoryExternal(assessment?.theoryExternal ?? 75);
      setEditPracticalInternal(assessment?.practicalInternal ?? 15);
      setEditPracticalExternal(assessment?.practicalExternal ?? 35);
      setEditUniversityExam(assessment?.universityExam ?? 100);
    }
  };

  const handleCancelEdit = () => {
    setEditingSection(null);
  };

  const handleSaveSection = async (section: string) => {
    setSavingSection(section);
    try {
      const newDb = { ...curriculumDb };
      
      if (section === 'info') {
        newDb.courseInformation = [
          ...newDb.courseInformation.filter(c => c.subjectCode !== subject.code),
          {
            subjectCode: editInfoCode,
            courseName: editInfoName,
            programme: editInfoProgramme,
            regulation: editInfoRegulation,
            year: Math.ceil(editInfoSemester / 2),
            semester: editInfoSemester,
            credits: Number(editInfoCredits),
            hours: Number(editInfoHours),
            subjectType: editInfoType as any,
            facultyAssigned: subjectInfo?.facultyAssigned || 'Dr. V. Chitra',
            importVersion: subjectInfo?.importVersion || '1.0',
            status: subjectInfo?.status || 'Active'
          }
        ];
      } else if (section === 'scope') {
        newDb.scope = [
          ...newDb.scope.filter(s => s.subjectCode !== subject.code),
          { subjectCode: subject.code, scopeStatement: editScopeStatement }
        ];
      } else if (section === 'objectives') {
        newDb.objectives = [
          ...newDb.objectives.filter(o => o.subjectCode !== subject.code),
          ...editObjectivesList.map((text, idx) => ({
            subjectCode: subject.code,
            objectiveText: text,
            order: idx + 1
          }))
        ];
      } else if (section === 'outcomes') {
        newDb.courseOutcomes = [
          ...newDb.courseOutcomes.filter(co => co.subjectCode !== subject.code),
          ...editOutcomesList.map((text, idx) => ({
            subjectCode: subject.code,
            coCode: `CO${idx + 1}`,
            coText: text,
            attainmentTarget: 2.50
          }))
        ];
      } else if (section === 'units') {
        newDb.units = [
          ...newDb.units.filter(u => u.subjectCode !== subject.code),
          ...editUnitsList.map(u => ({
            subjectCode: subject.code,
            unitCode: u.name,
            unitName: u.title,
            hours: Number(u.hours)
          }))
        ];
        
        const flatTopics: any[] = [];
        editUnitsList.forEach(u => {
          if (u.topics && Array.isArray(u.topics)) {
            u.topics.forEach((t: any) => {
              flatTopics.push({
                subjectCode: subject.code,
                unitCode: u.name,
                topicCode: t.number,
                topicName: t.name,
                hours: Number(t.hours)
              });
            });
          }
        });
        
        newDb.curriculumTopics = [
          ...newDb.curriculumTopics.filter(t => t.subjectCode !== subject.code),
          ...flatTopics
        ];
      } else if (section === 'recommendedBooks') {
        newDb.recommendedBooks = [
          ...newDb.recommendedBooks.filter(b => b.subjectCode !== subject.code),
          ...editRecBooksList.map(b => ({
            subjectCode: subject.code,
            title: b.title,
            author: b.author,
            edition: b.edition
          }))
        ];
      } else if (section === 'referenceBooks') {
        newDb.referenceBooks = [
          ...newDb.referenceBooks.filter(b => b.subjectCode !== subject.code),
          ...editRefBooksList.map(b => ({
            subjectCode: subject.code,
            title: b.title,
            author: b.author,
            edition: b.edition
          }))
        ];
      } else if (section === 'assessment') {
        newDb.assessmentPattern = [
          ...newDb.assessmentPattern.filter(a => a.subjectCode !== subject.code),
          {
            subjectCode: subject.code,
            theoryInternal: Number(editTheoryInternal),
            theoryExternal: Number(editTheoryExternal),
            practicalInternal: Number(editPracticalInternal),
            practicalExternal: Number(editPracticalExternal),
            universityExam: Number(editUniversityExam)
          }
        ];
      } else if (section === 'matrix') {
        setCoPoMapping(editCoPoMapping);
      }

      saveCurriculumDb(newDb);
      setCurriculumDb(newDb);
      if (section === 'info') {
        setSubjectInfo(newDb.courseInformation.find(c => c.subjectCode === editInfoCode));
      }

      const p = subject.programme;
      const r = subject.regulation || 'PCI 2017';
      const y = subject.academicYear || '2025-2026';
      const sName = getRomanSemester(subject.semester);
      const cCode = subject.code;

      const docRef = doc(db, 'curriculum', p, r, y, sName, cCode);

      let firestoreUpdate: any = {};
      if (section === 'info') {
        firestoreUpdate = {
          courseCode: editInfoCode,
          courseName: editInfoName,
          programme: editInfoProgramme,
          regulation: editInfoRegulation,
          semester: editInfoSemester,
          credits: Number(editInfoCredits),
          hours: Number(editInfoHours),
          type: editInfoType
        };
      } else if (section === 'scope') {
        firestoreUpdate = { scope: editScopeStatement };
      } else if (section === 'objectives') {
        firestoreUpdate = { objectives: editObjectivesList };
      } else if (section === 'outcomes') {
        firestoreUpdate = { courseOutcomes: editOutcomesList };
      } else if (section === 'matrix') {
        firestoreUpdate = { coPoMapping: editCoPoMapping };
      } else if (section === 'units') {
        firestoreUpdate = { units: editUnitsList };
      } else if (section === 'recommendedBooks') {
        firestoreUpdate = { recommendedBooks: editRecBooksList };
      } else if (section === 'referenceBooks') {
        firestoreUpdate = { referenceBooks: editRefBooksList };
      } else if (section === 'assessment') {
        firestoreUpdate = {
          assessmentPattern: {
            theoryInternal: Number(editTheoryInternal),
            theoryExternal: Number(editTheoryExternal),
            practicalInternal: Number(editPracticalInternal),
            practicalExternal: Number(editPracticalExternal),
            universityExam: Number(editUniversityExam)
          }
        };
      }

      await setDoc(docRef, firestoreUpdate, { merge: true });
      triggerToast(`Saved section ${section} successfully!`);
      setEditingSection(null);
    } catch (err: any) {
      console.error("Error saving curriculum section:", err);
      triggerToast(`Failed to save: ${err.message}`);
    } finally {
      setSavingSection(null);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto animate-fadeIn">
      
      {/* 1. Course Information Specifications */}
      <div className="rounded-[24px] bg-white border border-gray-150/50 shadow-sm overflow-hidden flex flex-col">
        <div 
          onClick={() => { if (editingSection !== 'info') setExpandedCurriculumUnits(prev => ({ ...prev, info: !prev.info })); }}
          className="p-5 bg-gray-50/50 hover:bg-gray-50/80 cursor-pointer flex justify-between items-center border-b border-gray-100"
        >
          <div className="flex justify-between items-center w-full">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#8B1E3F]/10 text-[#8B1E3F] flex items-center justify-center">
                <Library className="w-4 h-4" />
              </div>
              <h3 className="font-display font-extrabold text-sm text-gray-900 uppercase tracking-wide">Course Information</h3>
            </div>
            {!readOnly && (
              editingSection === 'info' ? (
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <button 
                    onClick={() => handleSaveSection('info')}
                    disabled={savingSection === 'info'}
                    className="px-3 py-1 text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-all flex items-center gap-1 shadow-sm disabled:opacity-50"
                  >
                    {savingSection === 'info' ? 'Saving...' : 'Save'}
                  </button>
                  <button 
                    onClick={handleCancelEdit}
                    className="px-3 py-1 text-[11px] font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button 
                  onClick={(e) => { e.stopPropagation(); handleStartEdit('info'); }}
                  className="px-3 py-1 text-[11px] font-bold text-[#8B1E3F] bg-pink-50 hover:bg-pink-100 rounded-lg transition-all flex items-center gap-1 border border-pink-100"
                >
                  <Edit className="w-3 h-3" /> Edit Section
                </button>
              )
            )}
          </div>
        </div>

        {!expandedCurriculumUnits.info && (
          <div className="p-5 bg-white">
            {editingSection === 'info' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black uppercase text-gray-400">Subject Code</label>
                  <input 
                    type="text" 
                    value={editInfoCode} 
                    onChange={(e) => setEditInfoCode(e.target.value)} 
                    className="p-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-pink-900/10 focus:border-[#8B1E3F]"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black uppercase text-gray-400">Syllabus Title</label>
                  <input 
                    type="text" 
                    value={editInfoName} 
                    onChange={(e) => setEditInfoName(e.target.value)} 
                    className="p-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-pink-900/10 focus:border-[#8B1E3F]"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black uppercase text-gray-400">Programme</label>
                  <select 
                    value={editInfoProgramme} 
                    onChange={(e) => setEditInfoProgramme(e.target.value)} 
                    className="p-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-pink-900/10"
                  >
                    <option value="B.Pharm">B.Pharm</option>
                    <option value="M.Pharm">M.Pharm</option>
                    <option value="Pharm.D">Pharm.D</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black uppercase text-gray-400">Syllabus Regulation</label>
                  <select 
                    value={editInfoRegulation} 
                    onChange={(e) => setEditInfoRegulation(e.target.value)} 
                    className="p-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-pink-900/10"
                  >
                    <option value="PCI 2017">PCI 2017</option>
                    <option value="PCI 2026">PCI 2026</option>
                    <option value="PCI 2020">PCI 2020</option>
                    <option value="PCI 2008">PCI 2008</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black uppercase text-gray-400">Semester</label>
                  <input 
                    type="number" 
                    min={1} 
                    max={10} 
                    value={editInfoSemester} 
                    onChange={(e) => setEditInfoSemester(Number(e.target.value))} 
                    className="p-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-pink-900/10"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black uppercase text-gray-400">Credits</label>
                  <input 
                    type="number" 
                    min={1} 
                    max={20} 
                    value={editInfoCredits} 
                    onChange={(e) => setEditInfoCredits(Number(e.target.value))} 
                    className="p-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-pink-900/10"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black uppercase text-gray-400">Lecture Hours</label>
                  <input 
                    type="number" 
                    min={1} 
                    max={100} 
                    value={editInfoHours} 
                    onChange={(e) => setEditInfoHours(Number(e.target.value))} 
                    className="p-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-pink-900/10"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black uppercase text-gray-400">Instruction Modality</label>
                  <select 
                    value={editInfoType} 
                    onChange={(e) => setEditInfoType(e.target.value)} 
                    className="p-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-pink-900/10"
                  >
                    <option value="Theory">Theory</option>
                    <option value="Practical">Practical</option>
                  </select>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Subject Code', value: subjectInfo?.subjectCode || subject.code },
                  { label: 'Syllabus Title', value: subjectInfo?.courseName || subject.name },
                  { label: 'Core Programme', value: subjectInfo?.programme || subject.programme },
                  { label: 'Syllabus Regulation', value: subjectInfo?.regulation || subject.regulation || 'PCI 2017' },
                  { label: 'Allotted Semester', value: `Semester ${subjectInfo?.semester || subject.semester}` },
                  { label: 'Classroom Credits', value: `${subjectInfo?.credits || 4} Credits` },
                  { label: 'Lecture Hours', value: `${subjectInfo?.hours || 45} Hours` },
                  { label: 'Curricular Modality', value: `${subjectInfo?.subjectType || 'Theory'} Instruction` }
                ].map((spec, sIdx) => (
                  <div key={sIdx} className="p-3 bg-gray-50/60 border border-gray-100 rounded-xl">
                    <span className="text-[8px] font-black uppercase tracking-wider text-gray-400 block mb-0.5">{spec.label}</span>
                    <p className="text-xs font-bold text-gray-800 leading-tight">{spec.value}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 2. Course Scope & Compliance Statement */}
      <div className="rounded-[24px] bg-white border border-gray-150/50 shadow-sm overflow-hidden flex flex-col">
        <div 
          onClick={() => { if (editingSection !== 'scope') setExpandedCurriculumUnits(prev => ({ ...prev, scope: !prev.scope })); }}
          className="p-5 bg-gray-50/50 hover:bg-gray-50/80 cursor-pointer flex justify-between items-center border-b border-gray-100"
        >
          <div className="flex justify-between items-center w-full">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#8B1E3F]/10 text-[#8B1E3F] flex items-center justify-center">
                <Sliders className="w-4 h-4" />
              </div>
              <h3 className="font-display font-extrabold text-sm text-gray-900 uppercase tracking-wide">Scope</h3>
            </div>
            {!readOnly && (
              editingSection === 'scope' ? (
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <button 
                    onClick={() => handleSaveSection('scope')}
                    disabled={savingSection === 'scope'}
                    className="px-3 py-1 text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-all flex items-center gap-1 shadow-sm disabled:opacity-50"
                  >
                    {savingSection === 'scope' ? 'Saving...' : 'Save'}
                  </button>
                  <button 
                    onClick={handleCancelEdit}
                    className="px-3 py-1 text-[11px] font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button 
                  onClick={(e) => { e.stopPropagation(); handleStartEdit('scope'); }}
                  className="px-3 py-1 text-[11px] font-bold text-[#8B1E3F] bg-pink-50 hover:bg-pink-100 rounded-lg transition-all flex items-center gap-1 border border-pink-100"
                >
                  <Edit className="w-3 h-3" /> Edit Section
                </button>
              )
            )}
          </div>
        </div>

        {!expandedCurriculumUnits.scope && (
          <div className="p-5 bg-white text-xs text-gray-600 leading-relaxed font-medium">
            {editingSection === 'scope' ? (
              <textarea 
                value={editScopeStatement}
                onChange={(e) => setEditScopeStatement(e.target.value)}
                rows={5}
                className="w-full p-4 border border-gray-200 rounded-2xl text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-pink-900/10 focus:border-[#8B1E3F]"
                placeholder="Enter Course Scope Statement..."
              />
            ) : (
              <div className="p-4 bg-gray-50/60 border border-gray-100 rounded-2xl italic">
                "{scopeText}"
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. Syllabus Learning Objectives */}
      <div className="rounded-[24px] bg-white border border-gray-150/50 shadow-sm overflow-hidden">
        <div 
          onClick={() => { if (editingSection !== 'objectives') setExpandedCurriculumUnits(prev => ({ ...prev, objectives: !prev.objectives })); }}
          className="p-5 bg-gray-50/50 hover:bg-gray-50/80 cursor-pointer flex justify-between items-center border-b border-gray-100"
        >
          <div className="flex justify-between items-center w-full">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#8B1E3F]/10 text-[#8B1E3F] flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h3 className="font-display font-extrabold text-sm text-gray-900 uppercase tracking-wide">Objectives</h3>
            </div>
            {!readOnly && (
              editingSection === 'objectives' ? (
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <button 
                    onClick={() => handleSaveSection('objectives')}
                    disabled={savingSection === 'objectives'}
                    className="px-3 py-1 text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-all flex items-center gap-1 shadow-sm disabled:opacity-50"
                  >
                    {savingSection === 'objectives' ? 'Saving...' : 'Save'}
                  </button>
                  <button 
                    onClick={handleCancelEdit}
                    className="px-3 py-1 text-[11px] font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button 
                  onClick={(e) => { e.stopPropagation(); handleStartEdit('objectives'); }}
                  className="px-3 py-1 text-[11px] font-bold text-[#8B1E3F] bg-pink-50 hover:bg-pink-100 rounded-lg transition-all flex items-center gap-1 border border-pink-100"
                >
                  <Edit className="w-3 h-3" /> Edit Section
                </button>
              )
            )}
          </div>
        </div>

        {!expandedCurriculumUnits.objectives && (
          <div className="p-5 flex flex-col gap-3 bg-white">
            {editingSection === 'objectives' ? (
              <div className="flex flex-col gap-3">
                {editObjectivesList.map((obj, oIdx) => (
                  <div key={oIdx} className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-pink-50 text-[#8B1E3F] font-mono text-[10px] font-black flex items-center justify-center shrink-0">
                      {oIdx + 1}
                    </span>
                    <input 
                      type="text"
                      value={obj}
                      onChange={(e) => {
                        const newList = [...editObjectivesList];
                        newList[oIdx] = e.target.value;
                        setEditObjectivesList(newList);
                      }}
                      className="flex-1 p-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-pink-900/10 focus:border-[#8B1E3F]"
                    />
                    <button 
                      onClick={() => {
                        setEditObjectivesList(editObjectivesList.filter((_, idx) => idx !== oIdx));
                      }}
                      className="p-2 border border-red-200 text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      title="Delete Objective"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                <button 
                  onClick={() => setEditObjectivesList([...editObjectivesList, ''])}
                  className="mt-2 py-2 border border-dashed border-gray-200 hover:border-[#8B1E3F]/30 text-[#8B1E3F] hover:bg-pink-50/30 text-xs font-bold rounded-xl transition-all"
                >
                  + Add Syllabus Objective
                </button>
              </div>
            ) : (
              objectivesList && objectivesList.length > 0 ? (
                objectivesList.map((obj, oIdx) => (
                  <div key={oIdx} className="p-3 bg-gray-50/40 border border-gray-100 rounded-xl flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-[#8B1E3F]/10 text-[#8B1E3F] font-mono text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
                      {oIdx + 1}
                    </span>
                    <p className="text-xs font-semibold text-gray-700 leading-relaxed pt-0.5">{obj.objectiveText}</p>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-xs text-gray-400 font-semibold italic border border-dashed border-gray-200 rounded-2xl">
                  No learning objectives mapped
                </div>
              )
            )}
          </div>
        )}
      </div>

      {/* 4. Course Outcomes (CO) Map */}
      <div className="rounded-[24px] bg-white border border-gray-150/50 shadow-sm overflow-hidden">
        <div 
          onClick={() => { if (editingSection !== 'outcomes') setExpandedCurriculumUnits(prev => ({ ...prev, outcomes: !prev.outcomes })); }}
          className="p-5 bg-gray-50/50 hover:bg-gray-50/80 cursor-pointer flex justify-between items-center border-b border-gray-100"
        >
          <div className="flex justify-between items-center w-full">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#8B1E3F]/10 text-[#8B1E3F] flex items-center justify-center">
                <Award className="w-4 h-4" />
              </div>
              <h3 className="font-display font-extrabold text-sm text-gray-900 uppercase tracking-wide">Course Outcomes</h3>
            </div>
            {!readOnly && (
              editingSection === 'outcomes' ? (
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <button 
                    onClick={() => handleSaveSection('outcomes')}
                    disabled={savingSection === 'outcomes'}
                    className="px-3 py-1 text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-all flex items-center gap-1 shadow-sm disabled:opacity-50"
                  >
                    {savingSection === 'outcomes' ? 'Saving...' : 'Save'}
                  </button>
                  <button 
                    onClick={handleCancelEdit}
                    className="px-3 py-1 text-[11px] font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button 
                  onClick={(e) => { e.stopPropagation(); handleStartEdit('outcomes'); }}
                  className="px-3 py-1 text-[11px] font-bold text-[#8B1E3F] bg-pink-50 hover:bg-pink-100 rounded-lg transition-all flex items-center gap-1 border border-pink-100"
                >
                  <Edit className="w-3 h-3" /> Edit Section
                </button>
              )
            )}
          </div>
        </div>

        {!expandedCurriculumUnits.outcomes && (
          <div className="p-5 flex flex-col gap-3 bg-white">
            {editingSection === 'outcomes' ? (
              <div className="flex flex-col gap-3">
                {editOutcomesList.map((coText, coIdx) => (
                  <div key={coIdx} className="flex items-center gap-3">
                    <span className="w-12 h-6 bg-pink-50 text-[#8B1E3F] font-mono text-[10px] font-black rounded-full flex items-center justify-center shrink-0">
                      CO{coIdx + 1}
                    </span>
                    <input 
                      type="text"
                      value={coText}
                      onChange={(e) => {
                        const newList = [...editOutcomesList];
                        newList[coIdx] = e.target.value;
                        setEditOutcomesList(newList);
                      }}
                      className="flex-1 p-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-pink-900/10 focus:border-[#8B1E3F]"
                    />
                    <button 
                      onClick={() => {
                        setEditOutcomesList(editOutcomesList.filter((_, idx) => idx !== coIdx));
                      }}
                      className="p-2 border border-red-200 text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      title="Delete Course Outcome"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                <button 
                  onClick={() => setEditOutcomesList([...editOutcomesList, ''])}
                  className="mt-2 py-2 border border-dashed border-gray-200 hover:border-[#8B1E3F]/30 text-[#8B1E3F] hover:bg-pink-50/30 text-xs font-bold rounded-xl transition-all"
                >
                  + Add Course Outcome
                </button>
              </div>
            ) : (
              outcomesList && outcomesList.length > 0 ? (
                outcomesList.map((co, coIdx) => (
                  <div key={coIdx} className="p-3 bg-pink-50/20 border border-pink-100/30 rounded-xl flex items-start gap-3">
                    <span className="w-12 h-6 bg-[#8B1E3F] text-white font-mono text-[10px] font-black rounded-full flex items-center justify-center shrink-0 mt-0.5">
                      {co.coCode}
                    </span>
                    <p className="text-xs font-semibold text-gray-700 leading-relaxed pr-2 flex-1 pt-0.5">{co.coText}</p>
                    <span className="text-[10px] font-bold text-gray-400 bg-gray-50 border border-gray-100 px-2 py-0.5 rounded font-mono shrink-0">
                      Target: {co.attainmentTarget.toFixed(2)}
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-xs text-gray-400 font-semibold italic border border-dashed border-gray-200 rounded-2xl">
                  No course outcomes mapped
                </div>
              )
            )}
          </div>
        )}
      </div>

      {/* 5. CO-PO Alignment Mapping Matrix */}
      <div className="rounded-[24px] bg-white border border-gray-150/50 shadow-sm overflow-hidden flex flex-col">
        <div 
          onClick={() => { if (editingSection !== 'matrix') setExpandedCurriculumUnits(prev => ({ ...prev, matrix: !prev.matrix })); }}
          className="p-5 bg-gray-50/50 hover:bg-gray-50/80 cursor-pointer flex justify-between items-center border-b border-gray-100"
        >
          <div className="flex justify-between items-center w-full">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#8B1E3F]/10 text-[#8B1E3F] flex items-center justify-center">
                <Sliders className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-display font-extrabold text-sm text-gray-900 uppercase tracking-wide">CO-PO Alignment Matrix</h3>
                <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Levels: 1 = Low Alignment, 2 = Medium Alignment, 3 = High Alignment</p>
              </div>
            </div>
            {!readOnly && (
              editingSection === 'matrix' ? (
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <button 
                    onClick={() => handleSaveSection('matrix')}
                    disabled={savingSection === 'matrix'}
                    className="px-3 py-1 text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-all flex items-center gap-1 shadow-sm disabled:opacity-50"
                  >
                    {savingSection === 'matrix' ? 'Saving...' : 'Save'}
                  </button>
                  <button 
                    onClick={handleCancelEdit}
                    className="px-3 py-1 text-[11px] font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button 
                  onClick={(e) => { e.stopPropagation(); handleStartEdit('matrix'); }}
                  className="px-3 py-1 text-[11px] font-bold text-[#8B1E3F] bg-pink-50 hover:bg-pink-100 rounded-lg transition-all flex items-center gap-1 border border-pink-100"
                >
                  <Edit className="w-3 h-3" /> Edit Alignment
                </button>
              )
            )}
          </div>
        </div>

        {!expandedCurriculumUnits.matrix && (
          <div className="p-5 bg-white w-full overflow-x-auto lg:overflow-x-visible">
            <table className="w-full text-left border-collapse text-xs table-fixed">
              <thead>
                <tr className="border-b border-gray-150/50">
                  <th className="py-2.5 pr-2 font-extrabold text-gray-400 uppercase text-[10px] tracking-wider w-16">Course Outcomes</th>
                  {['PO1', 'PO2', 'PO3', 'PO4', 'PO5', 'PO6', 'PO7', 'PO8', 'PO9', 'PO10', 'PO11', 'PO12'].map(po => (
                    <th key={po} className="py-2.5 px-0.5 text-center font-extrabold text-gray-400 uppercase text-[10px] tracking-wider w-8">{po}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {['CO1', 'CO2', 'CO3', 'CO4', 'CO5'].map((coCode) => {
                  const isEditing = editingSection === 'matrix';
                  const currentMapping = isEditing ? editCoPoMapping : coPoMapping;
                  const mapping = currentMapping[coCode] || {};
                  
                  return (
                    <tr key={coCode} className="border-b border-gray-50 hover:bg-gray-50/40 transition-colors">
                      <td className="py-3 pr-2 font-black text-gray-900 w-16">{coCode}</td>
                      {['PO1', 'PO2', 'PO3', 'PO4', 'PO5', 'PO6', 'PO7', 'PO8', 'PO9', 'PO10', 'PO11', 'PO12'].map(po => {
                        const value = mapping[po] || 0;
                        return (
                          <td 
                            key={po} 
                            onClick={() => {
                              if (!isEditing) {
                                if (!readOnly) {
                                  handleCoPoCellClick(coCode, po);
                                } else {
                                  triggerToast("This matrix is read-only when accessed through Courses.");
                                }
                                return;
                              }
                              setEditCoPoMapping(prev => {
                                const currentVal = prev[coCode]?.[po] || 0;
                                const newVal = (currentVal + 1) % 4;
                                return {
                                  ...prev,
                                  [coCode]: {
                                    ...(prev[coCode] || {}),
                                    [po]: newVal
                                  }
                                };
                              });
                            }}
                            className="py-2 px-1 text-center font-bold font-mono cursor-pointer select-none group"
                            title={isEditing ? `Click to cycle value` : `Level of alignment`}
                          >
                            {value > 0 ? (
                              <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-[10px] transition-all duration-200 group-hover:scale-110 shadow-sm ${
                                value === 3 ? 'bg-indigo-600 text-white' :
                                value === 2 ? 'bg-indigo-150 text-indigo-700' :
                                'bg-indigo-50 text-indigo-600'
                              }`}>
                                {value}
                              </span>
                            ) : (
                              <span className="text-gray-300 font-extrabold group-hover:text-indigo-400 transition-colors duration-200">-</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 6. PCI Topics / Units */}
      <div className="rounded-[24px] bg-white border border-gray-150/50 shadow-sm overflow-hidden">
        <div 
          onClick={() => { if (editingSection !== 'units') setExpandedCurriculumUnits(prev => ({ ...prev, units: !prev.units })); }}
          className="p-5 bg-gray-50/50 hover:bg-gray-50/80 cursor-pointer flex justify-between items-center border-b border-gray-100"
        >
          <div className="flex justify-between items-center w-full">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#8B1E3F]/10 text-[#8B1E3F] flex items-center justify-center">
                <Layers className="w-4 h-4" />
              </div>
              <h3 className="font-display font-extrabold text-sm text-gray-900 uppercase tracking-wide">PCI Topics / Units</h3>
            </div>
            {!readOnly && (
              editingSection === 'units' ? (
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <button 
                    onClick={() => handleSaveSection('units')}
                    disabled={savingSection === 'units'}
                    className="px-3 py-1 text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-all flex items-center gap-1 shadow-sm disabled:opacity-50"
                  >
                    {savingSection === 'units' ? 'Saving...' : 'Save'}
                  </button>
                  <button 
                    onClick={handleCancelEdit}
                    className="px-3 py-1 text-[11px] font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button 
                  onClick={(e) => { e.stopPropagation(); handleStartEdit('units'); }}
                  className="px-3 py-1 text-[11px] font-bold text-[#8B1E3F] bg-pink-50 hover:bg-pink-100 rounded-lg transition-all flex items-center gap-1 border border-pink-100"
                >
                  <Edit className="w-3 h-3" /> Edit Section
                </button>
              )
            )}
          </div>
        </div>

        {!expandedCurriculumUnits.units && (
          <div className="p-5 flex flex-col gap-4 bg-white">
            {editingSection === 'units' ? (
              <div className="flex flex-col gap-4">
                {editUnitsList.map((unit, uIdx) => (
                  <div key={uIdx} className="border border-pink-100 rounded-2xl p-4 bg-pink-50/5 flex flex-col gap-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="flex flex-col gap-1 sm:col-span-2">
                        <label className="text-[10px] font-black uppercase text-[#8B1E3F]">Unit ID & Title</label>
                        <div className="flex items-center gap-2">
                          <input 
                            type="text"
                            value={unit.name}
                            onChange={(e) => {
                              const newList = [...editUnitsList];
                              newList[uIdx].name = e.target.value;
                              setEditUnitsList(newList);
                            }}
                            className="w-24 p-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-800"
                            placeholder="e.g. Unit I"
                          />
                          <input 
                            type="text"
                            value={unit.title}
                            onChange={(e) => {
                              const newList = [...editUnitsList];
                              newList[uIdx].title = e.target.value;
                              setEditUnitsList(newList);
                            }}
                            className="flex-1 p-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-800"
                            placeholder="e.g. General Pharmacology"
                          />
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-black uppercase text-[#8B1E3F]">Syllabus Hours</label>
                        <input 
                          type="number"
                          value={unit.hours}
                          onChange={(e) => {
                            const newList = [...editUnitsList];
                            newList[uIdx].hours = Number(e.target.value);
                            setEditUnitsList(newList);
                          }}
                          className="p-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-800"
                          placeholder="e.g. 10"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5 mt-2">
                      <span className="text-[10px] font-black uppercase text-gray-400 block">Lectures/Topics mapped under {unit.name}</span>
                      <div className="flex flex-col gap-2 bg-white p-3 rounded-xl border border-gray-150/50">
                        {unit.topics.map((topic: any, tIdx: number) => (
                          <div key={tIdx} className="flex items-center gap-2">
                            <input 
                              type="text" 
                              value={topic.number} 
                              onChange={(e) => {
                                const newList = [...editUnitsList];
                                newList[uIdx].topics[tIdx].number = e.target.value;
                                setEditUnitsList(newList);
                              }}
                              className="w-16 p-1.5 border border-gray-200 rounded-lg text-xs font-bold text-center"
                              placeholder="No."
                            />
                            <input 
                              type="text" 
                              value={topic.name} 
                              onChange={(e) => {
                                const newList = [...editUnitsList];
                                newList[uIdx].topics[tIdx].name = e.target.value;
                                setEditUnitsList(newList);
                              }}
                              className="flex-1 p-1.5 border border-gray-200 rounded-lg text-xs font-bold"
                              placeholder="Topic name"
                            />
                            <input 
                              type="text" 
                              value={topic.hours} 
                              onChange={(e) => {
                                const newList = [...editUnitsList];
                                newList[uIdx].topics[tIdx].hours = e.target.value;
                                setEditUnitsList(newList);
                              }}
                              className="w-16 p-1.5 border border-gray-200 rounded-lg text-xs font-bold text-center"
                              placeholder="Hrs"
                            />
                            <button 
                              onClick={() => {
                                const newList = [...editUnitsList];
                                newList[uIdx].topics = newList[uIdx].topics.filter((_: any, idx: number) => idx !== tIdx);
                                setEditUnitsList(newList);
                              }}
                              className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                              title="Delete Topic"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                        <button 
                          onClick={() => {
                            const newList = [...editUnitsList];
                            const nextNum = `${uIdx + 1}.${unit.topics.length + 1}`;
                            newList[uIdx].topics = [...newList[uIdx].topics, { number: nextNum, name: '', hours: 1 }];
                            setEditUnitsList(newList);
                          }}
                          className="mt-1 text-left text-[11px] font-bold text-[#8B1E3F] hover:underline flex items-center gap-1 self-start"
                        >
                          + Add Syllabus Lecture Topic
                        </button>
                      </div>
                    </div>

                    <button 
                      onClick={() => {
                        setEditUnitsList(editUnitsList.filter((_, idx) => idx !== uIdx));
                      }}
                      className="mt-2 text-xs font-bold text-red-500 hover:underline self-end"
                    >
                      Delete Unit {unit.name}
                    </button>
                  </div>
                ))}
                <button 
                  onClick={() => setEditUnitsList([...editUnitsList, { name: `Unit ${editUnitsList.length + 1}`, title: '', hours: 10, topics: [] }])}
                  className="py-2.5 border border-dashed border-gray-250 hover:border-[#8B1E3F]/30 text-[#8B1E3F] hover:bg-pink-50/20 text-xs font-bold rounded-xl transition-all w-full"
                >
                  + Add Syllabus Unit Block
                </button>
              </div>
            ) : (
              unitsList.map((unit) => {
                const isUnitExpanded = expandedCurriculumUnits[unit.unitCode];
                const unitTopics = topicsList.filter(t => t.unitCode === unit.unitCode);
                return (
                  <div key={unit.unitCode} className="border border-gray-100 rounded-2xl p-4 bg-gray-50/30">
                    <div 
                      onClick={() => setExpandedCurriculumUnits(prev => ({ ...prev, [unit.unitCode]: !prev[unit.unitCode] }))}
                      className="flex justify-between items-center cursor-pointer select-none"
                    >
                      <div className="flex items-center gap-3">
                        {isUnitExpanded ? <ChevronDown className="w-4 h-4 text-[#8B1E3F]" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                        <h4 className="text-xs font-black text-gray-800 uppercase tracking-wider">{unit.unitCode}: {unit.unitName}</h4>
                      </div>
                      <span className="text-[10px] font-bold text-[#8B1E3F] bg-[#8B1E3F]/5 px-2.5 py-0.5 rounded-full font-mono">
                        {unit.hours} Hours
                      </span>
                    </div>

                    {isUnitExpanded && (
                      <div className="mt-4 border-t border-gray-100 pt-3 flex flex-col gap-2 animate-fadeIn">
                        {unitTopics.length > 0 ? (
                          unitTopics.map((topic) => (
                            <div key={topic.topicCode} className="flex justify-between items-center p-2.5 bg-white rounded-xl border border-gray-100 text-xs font-semibold">
                              <div className="flex items-center gap-2">
                                <span className="text-mono font-black text-gray-400 w-10">{topic.topicCode}</span>
                                <span className="text-gray-700">{topic.topicName}</span>
                              </div>
                              <span className="text-[9px] font-bold text-gray-400 bg-gray-50 px-2.5 py-0.5 rounded-full shrink-0 font-mono">
                                {topic.hours} Hr
                              </span>
                            </div>
                          ))
                        ) : (
                          <div className="p-3 text-center text-xs text-gray-400 italic">No topics mapped to this unit.</div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* 7. Recommended Books */}
      <div className="rounded-[24px] bg-white border border-gray-150/50 shadow-sm overflow-hidden">
        <div 
          onClick={() => { if (editingSection !== 'recommendedBooks') setExpandedCurriculumUnits(prev => ({ ...prev, recBooks: !prev.recBooks })); }}
          className="p-5 bg-gray-50/50 hover:bg-gray-50/80 cursor-pointer flex justify-between items-center border-b border-gray-100"
        >
          <div className="flex justify-between items-center w-full">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#8B1E3F]/10 text-[#8B1E3F] flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </div>
              <h3 className="font-display font-extrabold text-sm text-gray-900 uppercase tracking-wide">Recommended Books</h3>
            </div>
            {!readOnly && (
              editingSection === 'recommendedBooks' ? (
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <button 
                    onClick={() => handleSaveSection('recommendedBooks')}
                    disabled={savingSection === 'recommendedBooks'}
                    className="px-3 py-1 text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-all flex items-center gap-1 shadow-sm disabled:opacity-50"
                  >
                    {savingSection === 'recommendedBooks' ? 'Saving...' : 'Save'}
                  </button>
                  <button 
                    onClick={handleCancelEdit}
                    className="px-3 py-1 text-[11px] font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button 
                  onClick={(e) => { e.stopPropagation(); handleStartEdit('recommendedBooks'); }}
                  className="px-3 py-1 text-[11px] font-bold text-[#8B1E3F] bg-pink-50 hover:bg-pink-100 rounded-lg transition-all flex items-center gap-1 border border-pink-100"
                >
                  <Edit className="w-3 h-3" /> Edit Section
                </button>
              )
            )}
          </div>
        </div>

        {!expandedCurriculumUnits.recBooks && (
          <div className="p-5 flex flex-col gap-3 bg-white">
            {editingSection === 'recommendedBooks' ? (
              <div className="flex flex-col gap-3">
                {editRecBooksList.map((book, bIdx) => (
                  <div key={bIdx} className="flex flex-col sm:flex-row items-center gap-3 border border-gray-100 p-3 rounded-xl bg-gray-50/40">
                    <input 
                      type="text"
                      value={book.title}
                      onChange={(e) => {
                        const newList = [...editRecBooksList];
                        newList[bIdx].title = e.target.value;
                        setEditRecBooksList(newList);
                      }}
                      className="w-full sm:flex-1 p-2 border border-gray-200 rounded-lg text-xs font-bold"
                      placeholder="Book Title"
                    />
                    <input 
                      type="text"
                      value={book.author}
                      onChange={(e) => {
                        const newList = [...editRecBooksList];
                        newList[bIdx].author = e.target.value;
                        setEditRecBooksList(newList);
                      }}
                      className="w-full sm:w-48 p-2 border border-gray-200 rounded-lg text-xs font-bold"
                      placeholder="Author(s)"
                    />
                    <input 
                      type="text"
                      value={book.edition}
                      onChange={(e) => {
                        const newList = [...editRecBooksList];
                        newList[bIdx].edition = e.target.value;
                        setEditRecBooksList(newList);
                      }}
                      className="w-full sm:w-32 p-2 border border-gray-200 rounded-lg text-xs font-bold"
                      placeholder="Edition"
                    />
                    <button 
                      onClick={() => {
                        setEditRecBooksList(editRecBooksList.filter((_, idx) => idx !== bIdx));
                      }}
                      className="p-2 border border-red-200 text-red-500 hover:bg-red-50 rounded-xl transition-all self-stretch sm:self-auto flex justify-center items-center"
                      title="Delete Book"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                <button 
                  onClick={() => setEditRecBooksList([...editRecBooksList, { title: '', author: '', edition: '' }])}
                  className="mt-2 py-2 border border-dashed border-gray-200 hover:border-[#8B1E3F]/30 text-[#8B1E3F] hover:bg-pink-50/30 text-xs font-bold rounded-xl transition-all"
                >
                  + Add Recommended Book
                </button>
              </div>
            ) : (
              recBooks && recBooks.length > 0 ? (
                recBooks.map((b, idx) => (
                  <div key={idx} className="p-3 bg-gray-50/50 border border-gray-100 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-gray-800 block leading-tight">{b.title}</span>
                      <span className="text-[10px] font-semibold text-[#8B1E3F] mt-0.5 block leading-tight">{b.author}</span>
                    </div>
                    <span className="text-[10px] font-bold text-gray-400 bg-white border border-gray-150/50 px-2.5 py-0.5 rounded-full shrink-0">
                      {b.edition || 'Latest Edition'}
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-xs text-gray-400 font-semibold italic border border-dashed border-gray-200 rounded-2xl">
                  No recommended books listed
                </div>
              )
            )}
          </div>
        )}
      </div>

      {/* 8. Reference Books */}
      <div className="rounded-[24px] bg-white border border-gray-150/50 shadow-sm overflow-hidden">
        <div 
          onClick={() => { if (editingSection !== 'referenceBooks') setExpandedCurriculumUnits(prev => ({ ...prev, refBooks: !prev.refBooks })); }}
          className="p-5 bg-gray-50/50 hover:bg-gray-50/80 cursor-pointer flex justify-between items-center border-b border-gray-100"
        >
          <div className="flex justify-between items-center w-full">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#8B1E3F]/10 text-[#8B1E3F] flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </div>
              <h3 className="font-display font-extrabold text-sm text-gray-900 uppercase tracking-wide">Reference Books</h3>
            </div>
            {!readOnly && (
              editingSection === 'referenceBooks' ? (
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <button 
                    onClick={() => handleSaveSection('referenceBooks')}
                    disabled={savingSection === 'referenceBooks'}
                    className="px-3 py-1 text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-all flex items-center gap-1 shadow-sm disabled:opacity-50"
                  >
                    {savingSection === 'referenceBooks' ? 'Saving...' : 'Save'}
                  </button>
                  <button 
                    onClick={handleCancelEdit}
                    className="px-3 py-1 text-[11px] font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button 
                  onClick={(e) => { e.stopPropagation(); handleStartEdit('referenceBooks'); }}
                  className="px-3 py-1 text-[11px] font-bold text-[#8B1E3F] bg-pink-50 hover:bg-pink-100 rounded-lg transition-all flex items-center gap-1 border border-pink-100"
                >
                  <Edit className="w-3 h-3" /> Edit Section
                </button>
              )
            )}
          </div>
        </div>

        {!expandedCurriculumUnits.refBooks && (
          <div className="p-5 flex flex-col gap-3 bg-white">
            {editingSection === 'referenceBooks' ? (
              <div className="flex flex-col gap-3">
                {editRefBooksList.map((book, bIdx) => (
                  <div key={bIdx} className="flex flex-col sm:flex-row items-center gap-3 border border-gray-100 p-3 rounded-xl bg-gray-50/40">
                    <input 
                      type="text"
                      value={book.title}
                      onChange={(e) => {
                        const newList = [...editRefBooksList];
                        newList[bIdx].title = e.target.value;
                        setEditRefBooksList(newList);
                      }}
                      className="w-full sm:flex-1 p-2 border border-gray-200 rounded-lg text-xs font-bold"
                      placeholder="Book Title"
                    />
                    <input 
                      type="text"
                      value={book.author}
                      onChange={(e) => {
                        const newList = [...editRefBooksList];
                        newList[bIdx].author = e.target.value;
                        setEditRefBooksList(newList);
                      }}
                      className="w-full sm:w-48 p-2 border border-gray-200 rounded-lg text-xs font-bold"
                      placeholder="Author(s)"
                    />
                    <input 
                      type="text"
                      value={book.edition}
                      onChange={(e) => {
                        const newList = [...editRefBooksList];
                        newList[bIdx].edition = e.target.value;
                        setEditRefBooksList(newList);
                      }}
                      className="w-full sm:w-32 p-2 border border-gray-200 rounded-lg text-xs font-bold"
                      placeholder="Edition"
                    />
                    <button 
                      onClick={() => {
                        setEditRefBooksList(editRefBooksList.filter((_, idx) => idx !== bIdx));
                      }}
                      className="p-2 border border-red-200 text-red-500 hover:bg-red-50 rounded-xl transition-all self-stretch sm:self-auto flex justify-center items-center"
                      title="Delete Book"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                <button 
                  onClick={() => setEditRefBooksList([...editRefBooksList, { title: '', author: '', edition: '' }])}
                  className="mt-2 py-2 border border-dashed border-gray-200 hover:border-[#8B1E3F]/30 text-[#8B1E3F] hover:bg-pink-50/30 text-xs font-bold rounded-xl transition-all"
                >
                  + Add Reference Book
                </button>
              </div>
            ) : (
              refBooks && refBooks.length > 0 ? (
                refBooks.map((b, idx) => (
                  <div key={idx} className="p-3 bg-gray-50/50 border border-gray-100 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-gray-800 block leading-tight">{b.title}</span>
                      <span className="text-[10px] font-semibold text-[#8B1E3F] mt-0.5 block leading-tight">{b.author}</span>
                    </div>
                    <span className="text-[10px] font-bold text-gray-400 bg-white border border-gray-150/50 px-2.5 py-0.5 rounded-full shrink-0">
                      {b.edition || 'Latest Edition'}
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-xs text-gray-400 font-semibold italic border border-dashed border-gray-200 rounded-2xl">
                  No reference books listed
                </div>
              )
            )}
          </div>
        )}
      </div>

      {/* 9. Assessment Pattern */}
      <div className="rounded-[24px] bg-white border border-gray-150/50 shadow-sm overflow-hidden">
        <div 
          onClick={() => { if (editingSection !== 'assessment') setExpandedCurriculumUnits(prev => ({ ...prev, assessment: !prev.assessment })); }}
          className="p-5 bg-gray-50/50 hover:bg-gray-50/80 cursor-pointer flex justify-between items-center border-b border-gray-100"
        >
          <div className="flex justify-between items-center w-full">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#8B1E3F]/10 text-[#8B1E3F] flex items-center justify-center">
                <Sliders className="w-4 h-4" />
              </div>
              <h3 className="font-display font-extrabold text-sm text-gray-900 uppercase tracking-wide">Assessment Pattern</h3>
            </div>
            {!readOnly && (
              editingSection === 'assessment' ? (
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <button 
                    onClick={() => handleSaveSection('assessment')}
                    disabled={savingSection === 'assessment'}
                    className="px-3 py-1 text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-all flex items-center gap-1 shadow-sm disabled:opacity-50"
                  >
                    {savingSection === 'assessment' ? 'Saving...' : 'Save'}
                  </button>
                  <button 
                    onClick={handleCancelEdit}
                    className="px-3 py-1 text-[11px] font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button 
                  onClick={(e) => { e.stopPropagation(); handleStartEdit('assessment'); }}
                  className="px-3 py-1 text-[11px] font-bold text-[#8B1E3F] bg-pink-50 hover:bg-pink-100 rounded-lg transition-all flex items-center gap-1 border border-pink-100"
                >
                  <Edit className="w-3 h-3" /> Edit Section
                </button>
              )
            )}
          </div>
        </div>

        {!expandedCurriculumUnits.assessment && (
          <div className="p-5 bg-white text-xs font-semibold text-gray-600 leading-relaxed">
            {editingSection === 'assessment' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black uppercase text-gray-400">Theory Sessional</label>
                  <input 
                    type="number" 
                    value={editTheoryInternal} 
                    onChange={(e) => setEditTheoryInternal(Number(e.target.value))} 
                    className="p-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-800"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black uppercase text-gray-400">Theory End Exam</label>
                  <input 
                    type="number" 
                    value={editTheoryExternal} 
                    onChange={(e) => setEditTheoryExternal(Number(e.target.value))} 
                    className="p-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-800"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black uppercase text-gray-400">Practical Sessional</label>
                  <input 
                    type="number" 
                    value={editPracticalInternal} 
                    onChange={(e) => setEditPracticalInternal(Number(e.target.value))} 
                    className="p-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-800"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black uppercase text-gray-400">Practical End Exam</label>
                  <input 
                    type="number" 
                    value={editPracticalExternal} 
                    onChange={(e) => setEditPracticalExternal(Number(e.target.value))} 
                    className="p-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-800"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black uppercase text-[#8B1E3F]">University Total</label>
                  <input 
                    type="number" 
                    value={editUniversityExam} 
                    onChange={(e) => setEditUniversityExam(Number(e.target.value))} 
                    className="p-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-800"
                  />
                </div>
              </div>
            ) : (
              assessment ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="p-3 bg-gray-50/60 border border-gray-100 rounded-xl">
                    <span className="text-[8px] font-black uppercase tracking-wider text-gray-400 block mb-0.5">Theory Sessional</span>
                    <p className="text-xs font-bold text-gray-800">{assessment.theoryInternal} Marks</p>
                  </div>
                  <div className="p-3 bg-gray-50/60 border border-gray-100 rounded-xl">
                    <span className="text-[8px] font-black uppercase tracking-wider text-gray-400 block mb-0.5">Theory End Exam</span>
                    <p className="text-xs font-bold text-gray-800">{assessment.theoryExternal} Marks</p>
                  </div>
                  <div className="p-3 bg-gray-50/60 border border-gray-100 rounded-xl">
                    <span className="text-[8px] font-black uppercase tracking-wider text-gray-400 block mb-0.5">Practical Sessional</span>
                    <p className="text-xs font-bold text-gray-800">{assessment.practicalInternal} Marks</p>
                  </div>
                  <div className="p-3 bg-gray-50/60 border border-gray-100 rounded-xl">
                    <span className="text-[8px] font-black uppercase tracking-wider text-gray-400 block mb-0.5">Practical End Exam</span>
                    <p className="text-xs font-bold text-gray-800">{assessment.practicalExternal} Marks</p>
                  </div>
                  <div className="p-3 bg-[#8B1E3F]/5 border border-[#8B1E3F]/10 rounded-xl">
                    <span className="text-[8px] font-black uppercase tracking-wider text-[#8B1E3F] block mb-0.5">University Score</span>
                    <p className="text-xs font-bold text-[#8B1E3F]">{assessment.universityExam} Marks</p>
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center text-xs text-gray-400 font-semibold italic border border-dashed border-gray-200 rounded-2xl">
                  Sessional assessment scheme pending import.
                </div>
              )
            )}
          </div>
        )}
      </div>

    </div>
  );
}
