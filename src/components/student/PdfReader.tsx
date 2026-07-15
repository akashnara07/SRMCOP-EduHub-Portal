import { useState } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, Download, ZoomIn, ZoomOut, FileText, CheckCircle, Bookmark, MessageSquare } from 'lucide-react';
import GlassCard from '../GlassCard';
import { Resource } from '../../types';

interface PdfReaderProps {
  resource: Resource;
  onBack: () => void;
}

export default function PdfReader({
  resource,
  onBack,
}: PdfReaderProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 12; // simulated pages
  const [zoomLevel, setZoomLevel] = useState(100);
  const [isBookmarked, setIsBookmarked] = useState(false);

  // Mock pages content for skeletal histology
  const pageContent = [
    "Introduction to osseous cells: Osteoblasts produce new bone matrix (osteogenesis), osteoclasts break down matrix (bone resorption), osteocytes maintain homeostasis.",
    "Bone Histology: Haversian system or osteon is the basic functional unit of compact bone. Includes concentric lamellae, lacunae, osteocytes, canaliculi, and central canals.",
    "Skeletal classifications: The skeleton is divided into the axial skeleton (skull, vertebrae, thoracic cage) and the appendicular skeleton (girdles, limbs).",
    "Bone marrow physiology: Red marrow houses hematopoiesis (blood cell production). Yellow marrow consists of adipose tissue and serves as an energy reserve.",
    "Microscopic landmarks of long bones: Epiphyseal plates of hyaline cartilage allow interstitial growth, transforming into epiphyseal lines upon skeletal maturity."
  ];

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrev = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Header section with tools */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-white/60 border border-white/40 hover:bg-white flex items-center justify-center text-gray-700 transition-all shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest bg-blue-50 border border-blue-100 px-2.5 py-0.5 rounded-full">
              Syllabus Study Guide
            </span>
            <h1 className="font-display font-extrabold text-xl text-gray-900 tracking-tight mt-1">
              {resource.title}
            </h1>
          </div>
        </div>

        {/* Action icons bar */}
        <div className="flex items-center gap-2">
          <GlassCard className="p-1.5 flex gap-1 h-12">
            <button 
              onClick={() => setZoomLevel(Math.max(50, zoomLevel - 10))}
              className="w-9 h-full rounded-full hover:bg-gray-100/60 flex items-center justify-center text-gray-600 transition-colors"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-xs font-semibold text-gray-800 px-2 flex items-center justify-center">
              {zoomLevel}%
            </span>
            <button 
              onClick={() => setZoomLevel(Math.min(200, zoomLevel + 10))}
              className="w-9 h-full rounded-full hover:bg-gray-100/60 flex items-center justify-center text-gray-600 transition-colors"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </GlassCard>

          <GlassCard className="w-12 h-12 flex items-center justify-center cursor-pointer hover:bg-white/80">
            <a href="https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" download referrerPolicy="no-referrer" target="_blank" className="text-gray-500 hover:text-gray-900">
              <Download className="w-4.5 h-4.5" />
            </a>
          </GlassCard>
        </div>
      </div>

      {/* Main content grid: Document Page Stage + Index Guide */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left Column (3-spans): Dynamic PDF Paper Stage */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          <GlassCard className="p-8 md:p-12 min-h-[500px] flex flex-col justify-between items-center bg-white shadow-xl">
            {/* Sliding PDF Paper representation with adjustable zoom scaling */}
            <div 
              className="flex-1 w-full max-w-2xl flex flex-col justify-center items-center py-6 transition-transform duration-300"
              style={{ transform: `scale(${zoomLevel / 100})` }}
            >
              <div className="flex gap-3 items-center border-b border-gray-100 pb-4 mb-6 w-full">
                <FileText className="w-10 h-10 text-red-500 shrink-0" />
                <div>
                  <h3 className="font-display font-bold text-base text-gray-900 leading-tight">
                    SRM College of Pharmacy (SRMCOP)
                  </h3>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                    Study Guide & Handout Notes (BP101-Handout-{currentPage})
                  </p>
                </div>
              </div>

              {/* Page Simulated content */}
              <div className="w-full">
                <p className="text-sm text-gray-700 leading-loose text-justify font-sans bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                  {pageContent[(currentPage - 1) % pageContent.length]}
                </p>
                <div className="mt-8 border-t border-gray-100 pt-6 text-[10px] text-gray-400 font-semibold text-center uppercase tracking-widest">
                  Confidential Academic Document • For Student Personal Study Only
                </div>
              </div>
            </div>

            {/* Slide Navigation footer */}
            <div className="flex items-center gap-6 border-t border-gray-100 pt-6 w-full justify-between mt-8">
              <button
                onClick={handlePrev}
                disabled={currentPage === 1}
                className="flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-gray-900 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>
              
              <span className="text-xs font-bold text-gray-600">
                Page {currentPage} of {totalPages}
              </span>

              <button
                onClick={handleNext}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-[#8B1E3F] disabled:opacity-40"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </GlassCard>
        </div>

        {/* Right Column: Outline and syllabus references */}
        <div className="flex flex-col gap-6">
          <GlassCard className="p-6">
            <h3 className="font-display font-bold text-sm text-gray-900 border-b border-gray-100 pb-3 mb-4">
              Document Blueprint
            </h3>
            <div className="flex flex-col gap-2">
              {[
                { page: 1, title: 'Cell Physiology & Divisions' },
                { page: 2, title: 'Compact Bone Microanatomy' },
                { page: 3, title: 'Axial vs Appendicular skeleton' },
                { page: 4, title: 'Bone Marrow Mechanics' },
                { page: 5, title: 'Epiphyseal Plate Physiology' },
                { page: 6, title: 'Haversian Canal System' },
              ].map((item) => (
                <button
                  key={item.page}
                  onClick={() => setCurrentPage(item.page)}
                  className={`
                    w-full text-left p-2.5 rounded-xl text-xs font-medium transition-all duration-200 flex items-center justify-between
                    ${currentPage === item.page 
                      ? 'bg-[#8B1E3F]/10 text-[#8B1E3F] border border-[#8B1E3F]/20 font-bold' 
                      : 'hover:bg-gray-100/60 text-gray-600 border border-transparent'
                    }
                  `}
                >
                  <span className="truncate">{item.title}</span>
                  <span className="text-[10px] text-gray-400 shrink-0 font-mono">P.{item.page}</span>
                </button>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="p-6 flex flex-col gap-3 bg-gradient-to-br from-emerald-50/20 to-teal-50/10 border-emerald-500/20">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4.5 h-4.5 text-emerald-600" />
              <h4 className="font-bold text-xs text-emerald-800">Professor Recommendation</h4>
            </div>
            <p className="text-[11px] text-emerald-700/90 leading-relaxed font-medium">
              "Focus heavily on Page 2 and Page 5. These topics cover the fundamental structural questions featured heavily in the upcoming GPAT mock series and semester assessments."
            </p>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
