import React from 'react';
import { 
  ArrowLeft, CheckCircle2, ChevronLeft, ChevronRight, 
  BookOpen, Layers, Award, Clock, Circle, Play
} from 'lucide-react';
import GlassCard from '../GlassCard';
import { Resource, Subject } from '../../types';
import { getCurriculumDb, saveTeachingResources } from '../../data/curriculumDb';

interface VideoPlayerProps {
  resource: Resource;
  subject: Subject;
  onBack: () => void;
  onUpdateSubjectResources?: (subjectId: string, updatedResources: Resource[]) => void;
  onSelectResource?: (resource: Resource) => void;
}

export default function VideoPlayer({
  resource,
  subject,
  onBack,
  onUpdateSubjectResources,
  onSelectResource,
}: VideoPlayerProps) {
  
  // 1. Load active curriculum database information matching this subject code
  const curriculumDb = getCurriculumDb();
  
  const courseInfo = curriculumDb.courseInformation.find(
    c => c.subjectCode === subject.code && c.academicYear === subject.academicYear
  ) || curriculumDb.courseInformation.find(
    c => c.subjectCode === subject.code
  ) || {
    subjectCode: subject.code,
    courseName: subject.name,
    programme: subject.programme,
    regulation: subject.regulation || 'PCI 2017',
    year: subject.year,
    semester: subject.semester,
    academicYear: subject.academicYear || '2025-2026',
    facultyAssigned: subject.facultyName
  };

  // Roman numerals converters for clean academic naming
  const getRomanYear = (yr: number): string => {
    const romans = ['I', 'II', 'III', 'IV', 'V', 'VI'];
    return romans[yr - 1] || String(yr);
  };

  const getRomanSem = (sem: number): string => {
    const romans = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];
    return romans[sem - 1] || String(sem);
  };

  // 2. Fetch specific unit and topic name from curriculum DB based on resource unit/topicCode
  const unitData = curriculumDb.units.find(
    u => u.subjectCode === subject.code && u.unitCode === resource.unit
  );
  const unitText = unitData ? `${resource.unit}: ${unitData.unitName}` : (resource.unit || 'Unit I');

  const topicData = curriculumDb.curriculumTopics.find(
    t => t.subjectCode === subject.code && t.topicCode === resource.topicCode
  );
  const topicText = topicData ? `${topicData.topicCode}: ${topicData.topicName}` : (resource.topicCode || 'T1.1');

  // 3. YouTube Embed URL Extraction
  const getYouTubeEmbedUrl = (url: string): string | null => {
    if (!url) return null;
    const isYouTube = url.includes('youtube.com') || url.includes('youtu.be');
    if (!isYouTube) return null;

    let videoId = '';
    if (url.includes('embed/')) {
      const parts = url.split('embed/');
      if (parts[1]) {
        videoId = parts[1].split('?')[0];
      }
    } else if (url.includes('v=')) {
      const parts = url.split('v=');
      if (parts[1]) {
        videoId = parts[1].split('&')[0];
      }
    } else if (url.includes('youtu.be/')) {
      const parts = url.split('youtu.be/');
      if (parts[1]) {
        videoId = parts[1].split('?')[0];
      }
    }

    return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0` : url;
  };

  const ytUrl = getYouTubeEmbedUrl(resource.url || '');

  // 4. Lecture Contents parsing from existing resource content or fallback to dynamic outline
  const getLectureContents = (): string[] => {
    if (resource.content) {
      const delimiter = resource.content.includes('\n') ? '\n' : (resource.content.includes(';') ? ';' : ',');
      return resource.content
        .split(delimiter)
        .map(item => item.trim())
        .filter(item => item.length > 0);
    }
    return [
      'Introduction and Historical Background',
      `Fundamental Concepts of ${resource.title}`,
      'Structural and Physiological Definitions',
      'Clinical Correlations and Cellular Pathways',
      'Summary and Academic Takeaways'
    ];
  };

  const lectureContents = getLectureContents();

  // 5. Retrieve associated Learning Objectives for this course
  const objectivesList = curriculumDb.objectives
    .filter(o => o.subjectCode === subject.code)
    .sort((a, b) => a.order - b.order);

  // 6. Retrieve associated Course Outcome(s) mapped to this Unit/Topic (Unit I -> CO1, Unit II -> CO2, etc.)
  const getMappedCourseOutcomes = () => {
    const allOutcomes = curriculumDb.courseOutcomes.filter(co => co.subjectCode === subject.code);
    
    const unitIndexMap: Record<string, string> = {
      'Unit I': 'CO1',
      'Unit II': 'CO2',
      'Unit III': 'CO3',
      'Unit IV': 'CO4',
      'Unit V': 'CO5'
    };

    const targetCoCode = resource.unit ? unitIndexMap[resource.unit] : 'CO1';
    const mapped = allOutcomes.filter(co => co.coCode === targetCoCode);

    return mapped.length > 0 ? mapped : allOutcomes.slice(0, 1);
  };

  const mappedOutcomes = getMappedCourseOutcomes();

  // 7. Calculate Topic level progress for Your Progress card
  const topicResources = subject.resources.filter(r => 
    r.unit === resource.unit && 
    (r.topicCode === resource.topicCode || !resource.topicCode)
  );

  const completedCount = topicResources.filter(r => r.status === 'completed').length;
  const totalCount = topicResources.length;
  const topicProgress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const topicStatus: 'Completed' | 'In Progress' | 'Not Started' = 
    topicProgress === 100 
      ? 'Completed' 
      : (topicProgress > 0 || resource.status === 'in-progress') 
      ? 'In Progress' 
      : 'Not Started';

  const getStatusConfig = (status: 'Completed' | 'In Progress' | 'Not Started') => {
    switch (status) {
      case 'Completed':
        return {
          ringColor: 'stroke-emerald-500',
          textColor: 'text-emerald-700',
          bgColor: 'bg-emerald-50 border-emerald-100',
          label: 'Completed',
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
        };
      case 'In Progress':
        return {
          ringColor: 'stroke-amber-500',
          textColor: 'text-amber-700',
          bgColor: 'bg-amber-50 border-amber-100',
          label: 'In Progress',
          icon: <Clock className="w-4 h-4 text-amber-600 shrink-0" />
        };
      default:
        return {
          ringColor: 'stroke-gray-300',
          textColor: 'text-gray-500',
          bgColor: 'bg-gray-50 border-gray-100',
          label: 'Not Started',
          icon: <Circle className="w-4 h-4 text-gray-500 shrink-0" />
        };
    }
  };

  const statusConfig = getStatusConfig(topicStatus);

  // 8. Navigation sequencing (Previous / Next Video)
  const videoResources = subject.resources.filter(r => r.type === 'Video');
  const currentIndex = videoResources.findIndex(r => r.id === resource.id);
  const prevVideo = currentIndex > 0 ? videoResources[currentIndex - 1] : null;
  const nextVideo = currentIndex < videoResources.length - 1 ? videoResources[currentIndex + 1] : null;

  // 9. Handlers
  const handleMarkCompleted = () => {
    const updatedResources = subject.resources.map(r => {
      if (r.id === resource.id) {
        return { ...r, status: 'completed' as const };
      }
      return r;
    });

    // Save and sync with local storage & Firestore
    saveTeachingResources(subject.code, updatedResources);

    if (onUpdateSubjectResources) {
      onUpdateSubjectResources(subject.id, updatedResources);
    }

    if (onSelectResource) {
      onSelectResource({ ...resource, status: 'completed' });
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto" id="video-lecture-viewer">
      
      {/* ==================================================
          1. ACADEMIC CONTEXT HEADER & BREADCRUMBS
          ================================================== */}
      <div className="flex flex-col gap-4">
        
        {/* Navigation Breadcrumb Trail */}
        <div className="flex items-center gap-2 text-[11px] font-bold text-gray-400 tracking-wide uppercase">
          <button onClick={onBack} className="hover:text-[#8B1E3F] transition-colors flex items-center gap-1">
            <ArrowLeft className="w-3 h-3" /> Dashboard
          </button>
          <span>&gt;</span>
          <span>{courseInfo.programme}</span>
          <span>&gt;</span>
          <span>{courseInfo.regulation}</span>
          <span>&gt;</span>
          <span>Year {getRomanYear(courseInfo.year)}</span>
          <span>&gt;</span>
          <span>Semester {getRomanSem(courseInfo.semester)}</span>
          <span>&gt;</span>
          <span className="text-[#8B1E3F] font-extrabold">{courseInfo.subjectCode}</span>
        </div>

        {/* Course Details Block */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-5">
          <div className="flex items-start gap-4">
            <button 
              onClick={onBack}
              className="w-12 h-12 rounded-2xl bg-white border border-gray-200 hover:bg-gray-50 flex items-center justify-center text-gray-700 transition-all shadow-sm active:scale-95 mt-1 shrink-0"
              title="Go back to Subject Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="font-display font-extrabold text-2xl text-gray-900 tracking-tight leading-snug">
                {courseInfo.courseName}
              </h1>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <span className="text-xs font-mono font-bold text-[#8B1E3F] bg-rose-50 border border-rose-100 px-2.5 py-0.5 rounded-md">
                  {courseInfo.subjectCode}
                </span>
                <span className="text-xs text-gray-400 font-medium">•</span>
                <span className="text-xs text-gray-500 font-medium">Faculty: {courseInfo.facultyAssigned || subject.facultyName}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Compact Academic Information Panel */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 bg-white/50 backdrop-blur-md border border-white/40 p-3.5 rounded-2xl shadow-sm">
          <div className="flex flex-col p-2 bg-white/70 rounded-xl border border-gray-100">
            <span className="text-[9px] uppercase tracking-wider text-gray-400 font-black">Program</span>
            <span className="text-xs font-extrabold text-gray-800 mt-0.5 truncate">{courseInfo.programme}</span>
          </div>
          <div className="flex flex-col p-2 bg-white/70 rounded-xl border border-gray-100">
            <span className="text-[9px] uppercase tracking-wider text-gray-400 font-black">Regulation</span>
            <span className="text-xs font-extrabold text-gray-800 mt-0.5 truncate">{courseInfo.regulation}</span>
          </div>
          <div className="flex flex-col p-2 bg-white/70 rounded-xl border border-gray-100">
            <span className="text-[9px] uppercase tracking-wider text-gray-400 font-black">Academic Year</span>
            <span className="text-xs font-extrabold text-gray-800 mt-0.5 truncate">{courseInfo.academicYear}</span>
          </div>
          <div className="flex flex-col p-2 bg-white/70 rounded-xl border border-gray-100">
            <span className="text-[9px] uppercase tracking-wider text-gray-400 font-black">Year</span>
            <span className="text-xs font-extrabold text-gray-800 mt-0.5 truncate">Year {getRomanYear(courseInfo.year)}</span>
          </div>
          <div className="flex flex-col p-2 bg-white/70 rounded-xl border border-gray-100">
            <span className="text-[9px] uppercase tracking-wider text-gray-400 font-black">Semester</span>
            <span className="text-xs font-extrabold text-gray-800 mt-0.5 truncate">Sem {getRomanSem(courseInfo.semester)}</span>
          </div>
          <div className="flex flex-col p-2 bg-white/70 rounded-xl border border-gray-100">
            <span className="text-[9px] uppercase tracking-wider text-gray-400 font-black">Unit</span>
            <span className="text-xs font-extrabold text-gray-800 mt-0.5 truncate" title={unitText}>{unitText}</span>
          </div>
          <div className="flex flex-col p-2 bg-white/70 rounded-xl border border-gray-100">
            <span className="text-[9px] uppercase tracking-wider text-gray-400 font-black">Topic</span>
            <span className="text-xs font-extrabold text-[#8B1E3F] mt-0.5 truncate" title={topicText}>{topicText}</span>
          </div>
          <div className="flex flex-col p-2 bg-white/70 rounded-xl border border-gray-100">
            <span className="text-[9px] uppercase tracking-wider text-gray-400 font-black">Sub Topic</span>
            <span className="text-xs font-extrabold text-gray-800 mt-0.5 truncate" title={resource.title}>{resource.title}</span>
          </div>
        </div>

      </div>

      {/* ==================================================
          MAIN CONTENT WORKSPACE (GRID LAYOUT)
          ================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Aspect-Ratio Stage with Horizontal Info Cards Stack below */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Main 16:9 Embedded Video Player Container */}
          <div className="relative aspect-video rounded-[24px] overflow-hidden bg-black shadow-lg border border-white/10" id="lecture-video-stage">
            {ytUrl ? (
              <iframe
                src={ytUrl}
                title={resource.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="w-full h-full"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-white p-6 text-center bg-gradient-to-br from-neutral-900 to-black relative">
                <Play className="w-12 h-12 text-[#CD4368] mb-3 animate-pulse" />
                <h4 className="font-display font-bold text-sm text-gray-200">Local Resource Stream Fallback</h4>
                <p className="text-xs text-gray-500 max-w-sm mt-1 leading-relaxed">
                  No compatible YouTube link found. Native direct streaming media fallback loading...
                </p>
                <video
                  src={resource.url || "https://www.w3schools.com/html/mov_bbb.mp4"}
                  controls
                  className="absolute inset-0 w-full h-full object-contain bg-black/80"
                />
              </div>
            )}
          </div>

          {/* ==================================================
              4. INFORMATION CARDS BELOW VIDEO
              ================================================== */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* A. Lecture Overview */}
            <GlassCard className="p-5 flex flex-col gap-3 min-h-[180px] shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 text-[#8B1E3F] border-b border-gray-100 pb-2">
                <BookOpen className="w-4 h-4 shrink-0" />
                <h4 className="font-display font-extrabold text-xs tracking-wider uppercase text-gray-900">Lecture Overview</h4>
              </div>
              <p className="text-[11px] text-gray-500 leading-relaxed">
                {resource.description || 'Comprehensive learning material detailing cellular pathways and associated biological properties.'}
              </p>
            </GlassCard>

            {/* B. Learning Objectives */}
            <GlassCard className="p-5 flex flex-col gap-3 min-h-[180px] shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 text-[#8B1E3F] border-b border-gray-100 pb-2">
                <Layers className="w-4 h-4 shrink-0" />
                <h4 className="font-display font-extrabold text-xs tracking-wider uppercase text-gray-900">Learning Objectives</h4>
              </div>
              {objectivesList.length === 0 ? (
                <p className="text-[11px] text-gray-400">Standard syllabus learning objectives are pending faculty mapping.</p>
              ) : (
                <ul className="flex flex-col gap-2 overflow-y-auto max-h-[160px] pr-1">
                  {objectivesList.map((obj, index) => (
                    <li key={index} className="text-[11px] text-gray-500 leading-relaxed flex items-start gap-1.5">
                      <span className="font-black text-[#8B1E3F] shrink-0">{obj.order || index + 1}.</span>
                      <span>{obj.objectiveText}</span>
                    </li>
                  ))}
                </ul>
              )}
            </GlassCard>

            {/* C. Course Outcome(s) */}
            <GlassCard className="p-5 flex flex-col gap-3 min-h-[180px] shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 text-[#8B1E3F] border-b border-gray-100 pb-2">
                <Award className="w-4 h-4 shrink-0" />
                <h4 className="font-display font-extrabold text-xs tracking-wider uppercase text-gray-900">Course Outcome(s)</h4>
              </div>
              {mappedOutcomes.length === 0 ? (
                <p className="text-[11px] text-gray-400">No Course Outcomes currently mapped to this module.</p>
              ) : (
                <div className="flex flex-col gap-3 overflow-y-auto max-h-[160px] pr-1">
                  {mappedOutcomes.map((co, index) => (
                    <div key={index} className="flex flex-col gap-1.5">
                      <span className="text-[9px] font-black tracking-widest text-[#8B1E3F] bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-full w-max">
                        {co.coCode}
                      </span>
                      <p className="text-[11px] text-gray-500 leading-relaxed font-semibold">
                        {co.coText}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </GlassCard>

          </div>

        </div>

        {/* Right Sidebar containing Lecture Contents and Progress widgets */}
        <div className="flex flex-col gap-6">
          
          {/* ==================================================
              5. YOUR PROGRESS CARD (Right Side)
              ================================================== */}
          <GlassCard className="p-5 flex flex-col gap-4 shadow-sm" id="lecture-progress-card">
            <div className="flex justify-between items-center border-b border-gray-100 pb-2.5">
              <h3 className="font-display font-extrabold text-xs uppercase tracking-wider text-gray-900">Your Progress</h3>
              <span className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${statusConfig.bgColor} flex items-center gap-1`}>
                {statusConfig.icon}
                {statusConfig.label}
              </span>
            </div>

            <div className="flex items-center gap-5">
              {/* Circular SVG Progress Ring */}
              <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="40"
                    cy="40"
                    r="34"
                    className="stroke-gray-100"
                    strokeWidth="6"
                    fill="transparent"
                  />
                  <circle
                    cx="40"
                    cy="40"
                    r="34"
                    className={`${statusConfig.ringColor} transition-all duration-500`}
                    strokeWidth="6"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 34}
                    strokeDashoffset={2 * Math.PI * 34 * (1 - topicProgress / 100)}
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-sm font-extrabold text-gray-800">
                    {topicProgress}%
                  </span>
                </div>
              </div>

              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Topic Coverage</span>
                <span className="text-xs font-extrabold text-gray-700 mt-1 leading-snug">
                  {completedCount} of {totalCount} lectures completed in this topic
                </span>
                <p className="text-[10px] text-gray-400 mt-1">
                  Complete all learning materials below this sub-topic to unlock the master competency marks.
                </p>
              </div>
            </div>
          </GlassCard>

          {/* ==================================================
              3. LECTURE CONTENTS CARD (Right Side)
              ================================================== */}
          <GlassCard className="p-5 flex flex-col gap-4 shadow-sm" id="lecture-contents-card">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-2.5">
              <BookOpen className="w-4 h-4 text-[#8B1E3F]" />
              <h3 className="font-display font-extrabold text-xs uppercase tracking-wider text-gray-900">Lecture Contents</h3>
            </div>
            
            <ul className="flex flex-col gap-3">
              {lectureContents.map((contentItem, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-gray-600 leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#CD4368] mt-1.5 shrink-0" />
                  <span className="font-medium">{contentItem}</span>
                </li>
              ))}
            </ul>
          </GlassCard>

        </div>

      </div>

      {/* ==================================================
          6. BOTTOM NAVIGATION (PREV/NEXT, MARK COMPLETED)
          ================================================== */}
      <div className="bg-white/50 backdrop-blur-md border border-white/40 p-4.5 rounded-[24px] flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm mt-2">
        
        {/* Previous Lecture button */}
        <button
          onClick={() => prevVideo && onSelectResource && onSelectResource(prevVideo)}
          disabled={!prevVideo}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all border shrink-0 ${
            prevVideo 
              ? 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 active:scale-95 shadow-sm' 
              : 'bg-gray-100/50 border-transparent text-gray-300 cursor-not-allowed'
          }`}
          type="button"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous Lecture
        </button>

        {/* Dynamic Center completion state */}
        {resource.status === 'completed' ? (
          <div className="flex items-center gap-2 px-6 py-2.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-black shadow-sm shrink-0 animate-fade-in">
            <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 fill-current" />
            Completed
          </div>
        ) : (
          <button
            onClick={handleMarkCompleted}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#8B1E3F] hover:bg-[#b32a4e] text-white border border-transparent rounded-xl text-xs font-black shadow-md shadow-maroon-900/15 active:scale-95 transition-all shrink-0"
            type="button"
          >
            <CheckCircle2 className="w-4.5 h-4.5" />
            Mark as Completed
          </button>
        )}

        {/* Next Lecture button */}
        <button
          onClick={() => nextVideo && onSelectResource && onSelectResource(nextVideo)}
          disabled={!nextVideo}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all border shrink-0 ${
            nextVideo 
              ? 'bg-white border-gray-200 text-[#8B1E3F] hover:bg-gray-50 active:scale-95 shadow-sm' 
              : 'bg-gray-100/50 border-transparent text-gray-300 cursor-not-allowed'
          }`}
          type="button"
        >
          Next Lecture
          <ChevronRight className="w-4 h-4" />
        </button>

      </div>

    </div>
  );
}
