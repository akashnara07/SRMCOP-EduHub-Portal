import { BookOpen, Download, Search, ExternalLink, BookmarkCheck } from 'lucide-react';
import GlassCard from '../GlassCard';

export default function LibraryView() {
  const books = [
    { title: "Remington: The Science and Practice of Pharmacy", author: "Loyd V. Allen Jr.", edition: "23rd Edition", size: "18.2 MB", desc: "The definitive reference textbook detailing the formulation, preparation, and standard dispensing of pharmaceutical drug delivery systems." },
    { title: "Goodman & Gilman's: The Pharmacological Basis of Therapeutics", author: "Laurence Brunton", edition: "14th Edition", size: "24.5 MB", desc: "The gold-standard treatise on chemical mechanism of drug actions, pharmacokinetic curves, receptors, and therapeutic interventions." },
    { title: "Indian Pharmacopoeia (IP 2026)", author: "Ministry of Health, India", edition: "9th Edition", size: "42.0 MB", desc: "Official compendium containing standards for ingredients, dosage forms, and analytical assay procedures compiled by Indian Pharmacopoeia Commission." },
    { title: "Martin's Physical Pharmacy and Pharmaceutical Sciences", author: "Patrick J. Sinko", edition: "8th Edition", size: "15.4 MB", desc: "Comprehensive textbook on physical chemical principles of solubility, thermodynamics, colloids, and stability of pharmaceutical liquids." }
  ];

  return (
    <div className="flex flex-col gap-6 w-full">
      <div>
        <h1 className="font-display font-extrabold text-2xl text-gray-900 tracking-tight">Digital Library</h1>
        <p className="text-xs text-gray-500">Access authorized medical compendiums, pharmacopoeias, and reference books online</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {books.map((book, idx) => (
          <GlassCard key={idx} hoverLift className="p-6 flex flex-col justify-between h-72">
            <div>
              <div className="flex justify-between items-start mb-3 gap-3">
                <div className="flex gap-2 items-center">
                  <div className="w-9 h-9 rounded-full bg-[#8B1E3F]/10 text-[#8B1E3F] flex items-center justify-center shrink-0">
                    <BookOpen className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-sm text-gray-900 leading-tight line-clamp-1">{book.title}</h3>
                    <p className="text-[10px] text-gray-500 font-semibold">{book.author} • {book.edition}</p>
                  </div>
                </div>
                <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 rounded-full uppercase shrink-0">
                  {book.size}
                </span>
              </div>

              <p className="text-xs text-gray-500 leading-relaxed mt-2 line-clamp-3">
                {book.desc}
              </p>
            </div>

            <div className="flex items-center justify-between border-t border-gray-100 pt-4 mt-3">
              <span className="text-[10px] font-bold text-[#8B1E3F] flex items-center gap-1">
                <BookmarkCheck className="w-3.5 h-3.5" /> Approved Reference
              </span>

              <a 
                href="https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
                download
                referrerPolicy="no-referrer"
                target="_blank"
                className="flex items-center gap-1.5 text-xs font-bold text-[#8B1E3F] bg-[#8B1E3F]/10 hover:bg-[#8B1E3F]/20 px-3.5 py-1.5 rounded-full transition-all"
              >
                <Download className="w-3.5 h-3.5" /> Download PDF
              </a>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
