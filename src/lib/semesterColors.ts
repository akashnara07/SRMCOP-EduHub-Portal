export interface SemesterColorTheme {
  bg: string;
  text: string;
  border: string;
  badge: string; // Combined Tailwind classes
  dotBg: string;
  // Full Card Styling Extensions
  cardBg: string;
  cardBorder: string;
  accentStrip: string;
  codeChip: string;
  buttonStyle: string;
  hoverRing: string;
  headerBg: string;
  accentColor: string;
}

export function getSemesterTheme(programme: string = 'B.Pharm', semesterOrYear: number | string = 1): SemesterColorTheme {
  let num = 1;
  if (typeof semesterOrYear === 'number') {
    num = semesterOrYear;
  } else {
    const match = String(semesterOrYear).match(/\d+/);
    if (match) num = parseInt(match[0], 10);
  }

  const normalizedProg = (programme || 'B.Pharm').toUpperCase();

  // 1. Pharm.D (Year-based colours: 1=Blue, 2=Green, 3=Orange, 4=Purple, 5=Red, 6=Indigo)
  if (normalizedProg.includes('PHARM.D') || normalizedProg.includes('PHARMD')) {
    switch (num) {
      case 1: // Blue
        return {
          bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200',
          badge: 'bg-blue-50 text-blue-700 border-blue-200', dotBg: 'bg-blue-500',
          cardBg: 'from-blue-50/70 via-blue-50/30 to-white', cardBorder: 'border-l-4 border-l-blue-600 border-blue-200/80',
          accentStrip: 'bg-gradient-to-r from-blue-500 to-blue-600', codeChip: 'bg-blue-100/90 text-blue-800 border-blue-200',
          buttonStyle: 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20', hoverRing: 'hover:border-blue-400 hover:shadow-blue-500/10',
          headerBg: 'bg-blue-50/80', accentColor: 'blue'
        };
      case 2: // Green
        return {
          bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200',
          badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', dotBg: 'bg-emerald-500',
          cardBg: 'from-emerald-50/70 via-emerald-50/30 to-white', cardBorder: 'border-l-4 border-l-emerald-600 border-emerald-200/80',
          accentStrip: 'bg-gradient-to-r from-emerald-500 to-emerald-600', codeChip: 'bg-emerald-100/90 text-emerald-800 border-emerald-200',
          buttonStyle: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20', hoverRing: 'hover:border-emerald-400 hover:shadow-emerald-500/10',
          headerBg: 'bg-emerald-50/80', accentColor: 'emerald'
        };
      case 3: // Orange
        return {
          bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200',
          badge: 'bg-orange-50 text-orange-700 border-orange-200', dotBg: 'bg-orange-500',
          cardBg: 'from-orange-50/70 via-orange-50/30 to-white', cardBorder: 'border-l-4 border-l-orange-600 border-orange-200/80',
          accentStrip: 'bg-gradient-to-r from-orange-500 to-orange-600', codeChip: 'bg-orange-100/90 text-orange-800 border-orange-200',
          buttonStyle: 'bg-orange-600 hover:bg-orange-700 text-white shadow-orange-500/20', hoverRing: 'hover:border-orange-400 hover:shadow-orange-500/10',
          headerBg: 'bg-orange-50/80', accentColor: 'orange'
        };
      case 4: // Purple
        return {
          bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200',
          badge: 'bg-purple-50 text-purple-700 border-purple-200', dotBg: 'bg-purple-500',
          cardBg: 'from-purple-50/70 via-purple-50/30 to-white', cardBorder: 'border-l-4 border-l-purple-600 border-purple-200/80',
          accentStrip: 'bg-gradient-to-r from-purple-500 to-purple-600', codeChip: 'bg-purple-100/90 text-purple-800 border-purple-200',
          buttonStyle: 'bg-purple-600 hover:bg-purple-700 text-white shadow-purple-500/20', hoverRing: 'hover:border-purple-400 hover:shadow-purple-500/10',
          headerBg: 'bg-purple-50/80', accentColor: 'purple'
        };
      case 5: // Red
        return {
          bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200',
          badge: 'bg-red-50 text-red-700 border-red-200', dotBg: 'bg-red-500',
          cardBg: 'from-red-50/70 via-red-50/30 to-white', cardBorder: 'border-l-4 border-l-red-600 border-red-200/80',
          accentStrip: 'bg-gradient-to-r from-red-500 to-red-600', codeChip: 'bg-red-100/90 text-red-800 border-red-200',
          buttonStyle: 'bg-red-600 hover:bg-red-700 text-white shadow-red-500/20', hoverRing: 'hover:border-red-400 hover:shadow-red-500/10',
          headerBg: 'bg-red-50/80', accentColor: 'red'
        };
      case 6: // Indigo
      default:
        return {
          bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200',
          badge: 'bg-indigo-50 text-indigo-700 border-indigo-200', dotBg: 'bg-indigo-500',
          cardBg: 'from-indigo-50/70 via-indigo-50/30 to-white', cardBorder: 'border-l-4 border-l-indigo-600 border-indigo-200/80',
          accentStrip: 'bg-gradient-to-r from-indigo-500 to-indigo-600', codeChip: 'bg-indigo-100/90 text-indigo-800 border-indigo-200',
          buttonStyle: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20', hoverRing: 'hover:border-indigo-400 hover:shadow-indigo-500/10',
          headerBg: 'bg-indigo-50/80', accentColor: 'indigo'
        };
    }
  }

  // 2. M.Pharm (Semester palette: 1=Emerald, 2=Sky Blue, 3=Violet, 4=Deep Orange)
  if (normalizedProg.includes('M.PHARM') || normalizedProg.includes('MPHARM')) {
    switch (num) {
      case 1: // Emerald
        return {
          bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200',
          badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', dotBg: 'bg-emerald-500',
          cardBg: 'from-emerald-50/70 via-emerald-50/30 to-white', cardBorder: 'border-l-4 border-l-emerald-600 border-emerald-200/80',
          accentStrip: 'bg-gradient-to-r from-emerald-500 to-emerald-600', codeChip: 'bg-emerald-100/90 text-emerald-800 border-emerald-200',
          buttonStyle: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20', hoverRing: 'hover:border-emerald-400 hover:shadow-emerald-500/10',
          headerBg: 'bg-emerald-50/80', accentColor: 'emerald'
        };
      case 2: // Sky Blue
        return {
          bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200',
          badge: 'bg-sky-50 text-sky-700 border-sky-200', dotBg: 'bg-sky-500',
          cardBg: 'from-sky-50/70 via-sky-50/30 to-white', cardBorder: 'border-l-4 border-l-sky-600 border-sky-200/80',
          accentStrip: 'bg-gradient-to-r from-sky-500 to-sky-600', codeChip: 'bg-sky-100/90 text-sky-800 border-sky-200',
          buttonStyle: 'bg-sky-600 hover:bg-sky-700 text-white shadow-sky-500/20', hoverRing: 'hover:border-sky-400 hover:shadow-sky-500/10',
          headerBg: 'bg-sky-50/80', accentColor: 'sky'
        };
      case 3: // Violet
        return {
          bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200',
          badge: 'bg-violet-50 text-violet-700 border-violet-200', dotBg: 'bg-violet-500',
          cardBg: 'from-violet-50/70 via-violet-50/30 to-white', cardBorder: 'border-l-4 border-l-violet-600 border-violet-200/80',
          accentStrip: 'bg-gradient-to-r from-violet-500 to-violet-600', codeChip: 'bg-violet-100/90 text-violet-800 border-violet-200',
          buttonStyle: 'bg-violet-600 hover:bg-violet-700 text-white shadow-violet-500/20', hoverRing: 'hover:border-violet-400 hover:shadow-violet-500/10',
          headerBg: 'bg-violet-50/80', accentColor: 'violet'
        };
      case 4: // Deep Orange
      default:
        return {
          bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200',
          badge: 'bg-orange-50 text-orange-700 border-orange-200', dotBg: 'bg-orange-500',
          cardBg: 'from-orange-50/70 via-orange-50/30 to-white', cardBorder: 'border-l-4 border-l-orange-600 border-orange-200/80',
          accentStrip: 'bg-gradient-to-r from-orange-500 to-orange-600', codeChip: 'bg-orange-100/90 text-orange-800 border-orange-200',
          buttonStyle: 'bg-orange-600 hover:bg-orange-700 text-white shadow-orange-500/20', hoverRing: 'hover:border-orange-400 hover:shadow-orange-500/10',
          headerBg: 'bg-orange-50/80', accentColor: 'orange'
        };
    }
  }

  // 3. B.Pharm (Sem I=Blue, Sem II=Cyan, Sem III=Green/Emerald, Sem IV=Teal, Sem V=Orange, Sem VI=Amber, Sem VII=Purple, Sem VIII=Indigo)
  switch (num) {
    case 1: // Blue
      return {
        bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200',
        badge: 'bg-blue-50 text-blue-700 border-blue-200', dotBg: 'bg-blue-500',
        cardBg: 'from-blue-50/70 via-blue-50/30 to-white', cardBorder: 'border-l-4 border-l-blue-600 border-blue-200/80',
        accentStrip: 'bg-gradient-to-r from-blue-500 to-blue-600', codeChip: 'bg-blue-100/90 text-blue-800 border-blue-200',
        buttonStyle: 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20', hoverRing: 'hover:border-blue-400 hover:shadow-blue-500/10',
        headerBg: 'bg-blue-50/80', accentColor: 'blue'
      };
    case 2: // Cyan
      return {
        bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200',
        badge: 'bg-cyan-50 text-cyan-700 border-cyan-200', dotBg: 'bg-cyan-500',
        cardBg: 'from-cyan-50/70 via-cyan-50/30 to-white', cardBorder: 'border-l-4 border-l-cyan-600 border-cyan-200/80',
        accentStrip: 'bg-gradient-to-r from-cyan-500 to-cyan-600', codeChip: 'bg-cyan-100/90 text-cyan-800 border-cyan-200',
        buttonStyle: 'bg-cyan-600 hover:bg-cyan-700 text-white shadow-cyan-500/20', hoverRing: 'hover:border-cyan-400 hover:shadow-cyan-500/10',
        headerBg: 'bg-cyan-50/80', accentColor: 'cyan'
      };
    case 3: // Green (Emerald)
      return {
        bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200',
        badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', dotBg: 'bg-emerald-500',
        cardBg: 'from-emerald-50/70 via-emerald-50/30 to-white', cardBorder: 'border-l-4 border-l-emerald-600 border-emerald-200/80',
        accentStrip: 'bg-gradient-to-r from-emerald-500 to-emerald-600', codeChip: 'bg-emerald-100/90 text-emerald-800 border-emerald-200',
        buttonStyle: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20', hoverRing: 'hover:border-emerald-400 hover:shadow-emerald-500/10',
        headerBg: 'bg-emerald-50/80', accentColor: 'emerald'
      };
    case 4: // Teal
      return {
        bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200',
        badge: 'bg-teal-50 text-teal-700 border-teal-200', dotBg: 'bg-teal-500',
        cardBg: 'from-teal-50/70 via-teal-50/30 to-white', cardBorder: 'border-l-4 border-l-teal-600 border-teal-200/80',
        accentStrip: 'bg-gradient-to-r from-teal-500 to-teal-600', codeChip: 'bg-teal-100/90 text-teal-800 border-teal-200',
        buttonStyle: 'bg-teal-600 hover:bg-teal-700 text-white shadow-teal-500/20', hoverRing: 'hover:border-teal-400 hover:shadow-teal-500/10',
        headerBg: 'bg-teal-50/80', accentColor: 'teal'
      };
    case 5: // Orange
      return {
        bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200',
        badge: 'bg-orange-50 text-orange-700 border-orange-200', dotBg: 'bg-orange-500',
        cardBg: 'from-orange-50/70 via-orange-50/30 to-white', cardBorder: 'border-l-4 border-l-orange-600 border-orange-200/80',
        accentStrip: 'bg-gradient-to-r from-orange-500 to-orange-600', codeChip: 'bg-orange-100/90 text-orange-800 border-orange-200',
        buttonStyle: 'bg-orange-600 hover:bg-orange-700 text-white shadow-orange-500/20', hoverRing: 'hover:border-orange-400 hover:shadow-orange-500/10',
        headerBg: 'bg-orange-50/80', accentColor: 'orange'
      };
    case 6: // Amber
      return {
        bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200',
        badge: 'bg-amber-50 text-amber-700 border-amber-200', dotBg: 'bg-amber-500',
        cardBg: 'from-amber-50/70 via-amber-50/30 to-white', cardBorder: 'border-l-4 border-l-amber-600 border-amber-200/80',
        accentStrip: 'bg-gradient-to-r from-amber-500 to-amber-600', codeChip: 'bg-amber-100/90 text-amber-800 border-amber-200',
        buttonStyle: 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-500/20', hoverRing: 'hover:border-amber-400 hover:shadow-amber-500/10',
        headerBg: 'bg-amber-50/80', accentColor: 'amber'
      };
    case 7: // Purple
      return {
        bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200',
        badge: 'bg-purple-50 text-purple-700 border-purple-200', dotBg: 'bg-purple-500',
        cardBg: 'from-purple-50/70 via-purple-50/30 to-white', cardBorder: 'border-l-4 border-l-purple-600 border-purple-200/80',
        accentStrip: 'bg-gradient-to-r from-purple-500 to-purple-600', codeChip: 'bg-purple-100/90 text-purple-800 border-purple-200',
        buttonStyle: 'bg-purple-600 hover:bg-purple-700 text-white shadow-purple-500/20', hoverRing: 'hover:border-purple-400 hover:shadow-purple-500/10',
        headerBg: 'bg-purple-50/80', accentColor: 'purple'
      };
    case 8: // Indigo
    default:
      return {
        bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200',
        badge: 'bg-indigo-50 text-indigo-700 border-indigo-200', dotBg: 'bg-indigo-500',
        cardBg: 'from-indigo-50/70 via-indigo-50/30 to-white', cardBorder: 'border-l-4 border-l-indigo-600 border-indigo-200/80',
        accentStrip: 'bg-gradient-to-r from-indigo-500 to-indigo-600', codeChip: 'bg-indigo-100/90 text-indigo-800 border-indigo-200',
        buttonStyle: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20', hoverRing: 'hover:border-indigo-400 hover:shadow-indigo-500/10',
        headerBg: 'bg-indigo-50/80', accentColor: 'indigo'
      };
  }
}

