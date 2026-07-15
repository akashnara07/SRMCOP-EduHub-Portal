import React, { useState } from 'react';
import { 
  Search, Plus, ArrowRight, Eye, Edit, MoreVertical, Copy, Archive, Check, Trash2, ChevronLeft, ChevronRight, Layers, BookOpen 
} from 'lucide-react';
import { Subject } from '../../types';
import { getCurriculumDb } from '../../data/curriculumDb';
import GlassCard from '../GlassCard';

interface CourseListTableProps {
  programmeFilter: 'B.Pharm' | 'Pharm.D';
  selectedSemesterFilter: number | 'All';
  selectedYearLevelFilter: number | 'All';
  selectedRegulation: string;
  selectedYear: string;
  mySubjects: Subject[];
  publishedSubjectIds: string[];
  readOnly: boolean;
  onGoToSubject: (id: string) => void;
  onOpenCurriculumDesigner: (sub: Subject) => void;
  onEditCourse: (e: React.MouseEvent, sub: Subject) => void;
  onDuplicateCourse: (e: React.MouseEvent, sub: Subject) => void;
  onArchiveCourse: (e: React.MouseEvent, sub: Subject) => void;
  onDeleteCourse: (e: React.MouseEvent, sub: Subject) => void;
  onPublishCourse: (id: string) => void;
  onAddCourseClick: () => void;
  isPCI2026: boolean;
}

export default function CourseListTable({
  programmeFilter,
  selectedSemesterFilter,
  selectedYearLevelFilter,
  selectedRegulation,
  selectedYear,
  mySubjects,
  publishedSubjectIds,
  readOnly,
  onGoToSubject,
  onOpenCurriculumDesigner,
  onEditCourse,
  onDuplicateCourse,
  onArchiveCourse,
  onDeleteCourse,
  onPublishCourse,
  onAddCourseClick,
  isPCI2026,
}: CourseListTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [activeDropdownRowId, setActiveDropdownRowId] = useState<string | null>(null);

  const filteredSubjects = mySubjects.filter(sub => {
    if (!sub) return false;
    const code = sub.code || '';
    const name = sub.name || '';
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return code.toLowerCase().includes(q) || name.toLowerCase().includes(q);
  });

  const totalCourses = filteredSubjects.length;
  const totalPages = Math.ceil(totalCourses / rowsPerPage);
  const paginatedSubjects = filteredSubjects.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  return (
    <div className="bg-white border border-gray-150/50 rounded-2xl p-6 shadow-sm flex flex-col gap-5">
      {/* Header Search & Actions Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div>
          <h2 className="font-display font-black text-lg text-gray-950 flex items-center gap-2">
            {programmeFilter === 'B.Pharm' 
              ? selectedSemesterFilter === 'All' ? 'All Semesters' : `Semester ${selectedSemesterFilter}`
              : selectedYearLevelFilter === 'All' ? 'All Years' : `Year ${selectedYearLevelFilter}`
            }
            <span className="text-gray-400 font-extrabold">•</span>
            <span className={`text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
              programmeFilter === 'B.Pharm' ? 'bg-[#8B1E3F]/5 text-[#8B1E3F]' : 'bg-teal-50 text-[#0F766E]'
            }`}>
              {totalCourses} {totalCourses === 1 ? 'Course' : 'Courses'}
            </span>
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Manage and edit course syllabus, learning outcomes, books and compliance tables.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-60">
            <Search className="absolute left-3 top-3 w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search code or title..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 placeholder-gray-450 focus:outline-none h-10 transition-colors"
            />
          </div>

          {/* Add Course Button */}
          {!readOnly && (
            <button
              onClick={onAddCourseClick}
              className={`h-10 px-4 text-white text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm shrink-0 whitespace-nowrap ${
                programmeFilter === 'B.Pharm'
                  ? 'bg-[#8B1E3F] hover:bg-[#721833]'
                  : 'bg-[#0F766E] hover:bg-[#0C5F58]'
              }`}
            >
              <Plus className="w-3.5 h-3.5 text-white" />
              Add Course
            </button>
          )}
        </div>
      </div>

      {/* Course List / Tree view state conditional */}
      {isPCI2026 && totalCourses === 0 ? (
        <GlassCard className="p-12 flex flex-col items-center justify-center text-center gap-4 border border-dashed border-gray-250">
          <div className="w-14 h-14 rounded-full bg-pink-50 flex items-center justify-center border border-pink-100 shadow-sm text-[#8B1E3F]">
            <Layers className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h4 className="font-display font-extrabold text-base text-[#8B1E3F]">PCI 2026 Regulation Schema</h4>
            <p className="text-xs text-gray-500 max-w-md leading-relaxed mt-2 mx-auto">
              This regulation is reserved for future curriculum entry. Existing PCI 2017 course data is not copied or displayed.
            </p>
            <div className="mt-4 flex flex-col sm:flex-row gap-3 justify-center items-center">
              <div className="px-4 py-2 bg-pink-50 border border-pink-100/60 rounded-xl text-xs font-bold text-[#8B1E3F]">
                No semesters configured.
              </div>
              <div className="px-4 py-2 bg-gray-50 border border-gray-150 rounded-xl text-xs font-bold text-gray-500">
                No courses configured.
              </div>
            </div>
          </div>
        </GlassCard>
      ) : totalCourses > 0 ? (
        <>
          {/* Responsive Table */}
          <div className="overflow-x-auto border border-gray-150/40 rounded-2xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-150/40 bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  <th className="py-3.5 px-4 font-black">Code</th>
                  <th className="py-3.5 px-4 font-black">Course Title</th>
                  <th className="py-3.5 px-4 font-black text-center">Credits</th>
                  <th className="py-3.5 px-4 text-center font-black">Hours</th>
                  <th className="py-3.5 px-4 text-center font-black">COs</th>
                  <th className="py-3.5 px-4 text-center font-black">POs</th>
                  <th className="py-3.5 px-4 font-black">Status</th>
                  <th className="py-3.5 px-4 text-right font-black">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {paginatedSubjects.map((sub) => {
                  const isPublished = publishedSubjectIds.includes(sub.id);
                  const status = isPublished ? 'Published' : 'Draft';
                  const credits = (sub.code && sub.code.endsWith('P')) ? 2 : 4;
                  const hours = (sub.code && sub.code.endsWith('P')) ? 30 : 45;
                  
                  const db = getCurriculumDb();
                  const coCount = db.courseOutcomes.filter(co => co.subjectCode === sub.code).length || 6;
                  const poCount = 12;

                  return (
                    <tr key={sub.id} className="hover:bg-gray-50/50 transition-colors">
                      {/* Code */}
                      <td className="py-3.5 px-4 font-mono font-black">
                        <span className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold ${
                          programmeFilter === 'B.Pharm'
                            ? 'bg-pink-50 text-[#8B1E3F]'
                            : 'bg-teal-50 text-[#0F766E]'
                        }`}>
                          {sub.code}
                        </span>
                      </td>

                      {/* Course Title */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col">
                          <span 
                            className="font-extrabold text-gray-800 text-sm hover:text-purple-700 hover:underline cursor-pointer" 
                            onClick={() => onGoToSubject(sub.id)}
                          >
                            {sub.name}
                          </span>
                          <span className="text-[10px] text-gray-400 font-semibold mt-0.5">
                            Assigned: {sub.facultyName || 'Dr. V. Chitra'} • {sub.regulation}
                          </span>
                        </div>
                      </td>

                      {/* Credits */}
                      <td className="py-3.5 px-4 text-center font-extrabold text-gray-700">
                        {credits}
                      </td>

                      {/* Hours */}
                      <td className="py-3.5 px-4 text-center font-bold text-gray-700">
                        {hours}
                      </td>

                      {/* COs */}
                      <td className="py-3.5 px-4 text-center font-bold text-gray-700">
                        {coCount}
                      </td>

                      {/* POs */}
                      <td className="py-3.5 px-4 text-center font-bold text-gray-700">
                        {poCount}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wide border ${
                          isPublished
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                            : 'bg-amber-50 text-amber-700 border-amber-100'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${isPublished ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                          {status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5 relative">
                          {/* Open Workspace */}
                          <button
                            onClick={() => onGoToSubject(sub.id)}
                            className="p-1.5 text-gray-400 hover:text-gray-750 hover:bg-gray-100 rounded-lg transition-all"
                            title="Open Teaching Workspace"
                          >
                            <ArrowRight className="w-4 h-4" />
                          </button>

                          {/* Preview Curriculum */}
                          <button
                            onClick={() => onOpenCurriculumDesigner(sub)}
                            className="p-1.5 text-gray-400 hover:text-gray-750 hover:bg-gray-100 rounded-lg transition-all"
                            title="Preview Syllabus Master"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Edit Details */}
                          {!readOnly && (
                            <button
                              onClick={(e) => onEditCourse(e, sub)}
                              className="p-1.5 text-gray-400 hover:text-gray-750 hover:bg-gray-100 rounded-lg transition-all"
                              title="Edit Course Shell"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          )}

                          {/* Dropdown triggers */}
                          {!readOnly && (
                            <div className="relative">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveDropdownRowId(activeDropdownRowId === sub.id ? null : sub.id);
                                }}
                                className="p-1.5 text-gray-400 hover:text-gray-750 hover:bg-gray-100 rounded-lg transition-all"
                                title="More Actions"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </button>

                              {activeDropdownRowId === sub.id && (
                                <>
                                  <div className="fixed inset-0 z-10" onClick={() => setActiveDropdownRowId(null)} />
                                  <div className="absolute right-0 mt-1 w-44 bg-white border border-gray-150 rounded-xl shadow-xl py-1.5 z-20 text-left">
                                    <button
                                      onClick={(e) => {
                                        onGoToSubject(sub.id);
                                        setActiveDropdownRowId(null);
                                      }}
                                      className="w-full px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                    >
                                      <BookOpen className="w-3.5 h-3.5 text-gray-400" />
                                      Open Workspace
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        onDuplicateCourse(e, sub);
                                        setActiveDropdownRowId(null);
                                      }}
                                      className="w-full px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                    >
                                      <Copy className="w-3.5 h-3.5 text-gray-400" />
                                      Duplicate Course
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (isPublished) {
                                          onArchiveCourse(e, sub);
                                        } else {
                                          onPublishCourse(sub.id);
                                        }
                                        setActiveDropdownRowId(null);
                                      }}
                                      className="w-full px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                    >
                                      {isPublished ? (
                                        <>
                                          <Archive className="w-3.5 h-3.5 text-gray-400" />
                                          Revert to Draft
                                        </>
                                      ) : (
                                        <>
                                          <Check className="w-3.5 h-3.5 text-gray-400" />
                                          Publish Course
                                        </>
                                      )}
                                    </button>
                                    <div className="border-t border-gray-100 my-1" />
                                    <button
                                      onClick={(e) => {
                                        onDeleteCourse(e, sub);
                                        setActiveDropdownRowId(null);
                                      }}
                                      className="w-full px-4 py-2 text-xs font-black text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                                    >
                                      <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                                      Delete Shell
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Footer Pagination controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-100 pt-4 mt-1 font-semibold text-xs text-gray-500">
            <div>
              Showing <span className="font-bold text-gray-800">
                {totalCourses === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1}
              </span> to <span className="font-bold text-gray-800">
                {Math.min(currentPage * rowsPerPage, totalCourses)}
              </span> of <span className="font-bold text-gray-800">{totalCourses}</span> courses
            </div>

            <div className="flex items-center gap-5">
              <div className="flex items-center gap-2">
                <span>Rows per page:</span>
                <select
                  value={rowsPerPage}
                  onChange={(e) => {
                    setRowsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="bg-white border border-gray-200 rounded-lg px-2.5 py-1 text-xs font-bold text-gray-800 focus:outline-none cursor-pointer"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-800 hover:bg-gray-50 disabled:opacity-40 transition-all cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNumber => (
                  <button
                    key={pageNumber}
                    onClick={() => setCurrentPage(pageNumber)}
                    className={`w-8 h-8 rounded-lg text-xs font-black transition-all flex items-center justify-center cursor-pointer ${
                      currentPage === pageNumber
                        ? programmeFilter === 'B.Pharm'
                          ? 'bg-[#8B1E3F] text-white shadow-sm shadow-maroon-900/10'
                          : 'bg-[#0F766E] text-white shadow-sm'
                        : 'border border-gray-150 text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                    }`}
                  >
                    {pageNumber}
                  </button>
                ))}

                <button
                  disabled={currentPage === totalPages || totalPages === 0}
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-800 hover:bg-gray-50 disabled:opacity-40 transition-all cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </>
      ) : (
        <GlassCard className="p-12 flex flex-col items-center justify-center text-center gap-4 border border-dashed border-gray-200">
          <div className="w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100 shadow-sm text-gray-400">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-display font-bold text-base text-gray-800">No Courses Match Filters</h4>
            <p className="text-xs text-gray-500 max-w-sm leading-relaxed mt-1">
              There are no allotted courses under the chosen Regulation/Academic Year. Change selectors or upload Excel workbooks to populate.
            </p>
          </div>
        </GlassCard>
      )}
    </div>
  );
}
