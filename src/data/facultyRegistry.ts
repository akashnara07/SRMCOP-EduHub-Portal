export interface FacultyMember {
  id: string;
  name: string;
  empId: string;
  dept: string;
  email: string;
  phone: string;
  coursesAllotted: string[]; // List of subject codes
  status: 'Authorized' | 'Suspended';
}

export const DEFAULT_FACULTY: FacultyMember[] = [
  {
    id: '1',
    name: 'Dr. J. Kavitha',
    empId: '1800682',
    dept: 'Department of Pharmaceutical Analysis',
    email: 'kavithaj@srmist.edu.in',
    phone: '9876540001',
    coursesAllotted: ['PDA302'],
    status: 'Authorized'
  },
  {
    id: '2',
    name: 'Dr. K.S. Kokilambigai',
    empId: '1800944',
    dept: 'Department of Pharmaceutical Analysis',
    email: 'kokilams@srmist.edu.in',
    phone: '9876540002',
    coursesAllotted: ['BP206T', 'BP701T', 'BP811ET'],
    status: 'Authorized'
  },
  {
    id: '3',
    name: 'Dr. B. ShanthaKumar',
    empId: '1803567',
    dept: 'Department of Pharmaceutical Chemistry',
    email: 'shanthab@srmist.edu.in',
    phone: '9876540003',
    coursesAllotted: ['BP401T', 'PDC103'],
    status: 'Authorized'
  },
  {
    id: '4',
    name: 'Dr. D.Priya',
    empId: '1801772',
    dept: 'Department of Pharmaceutical Chemistry',
    email: 'priyad@srmist.edu.in',
    phone: '9876540004',
    coursesAllotted: ['BP501T', 'BP601T'],
    status: 'Authorized'
  },
  {
    id: '5',
    name: 'Dr. G.V. Anjana',
    empId: '1803942',
    dept: 'Department of Pharmaceutical Chemistry',
    email: 'anjanag@srmist.edu.in',
    phone: '9876540005',
    coursesAllotted: ['BP301T', 'BP402T'],
    status: 'Authorized'
  },
  {
    id: '6',
    name: 'Dr. Gandi Sony Pears',
    empId: '1809427',
    dept: 'Department of Pharmaceutical Chemistry',
    email: 'gandip@srmist.edu.in',
    phone: '9876540006',
    coursesAllotted: ['BP104T', 'BP203T'],
    status: 'Authorized'
  },
  {
    id: '7',
    name: 'Dr. T. Sundarrajan',
    empId: '1802470',
    dept: 'Department of Pharmaceutical Chemistry',
    email: 'sundarrt@srmist.edu.in',
    phone: '9876540007',
    coursesAllotted: ['BP202T'],
    status: 'Authorized'
  },
  {
    id: '8',
    name: 'Dr. V. Velmurugan',
    empId: '1801779',
    dept: 'Department of Pharmaceutical Chemistry',
    email: 'velmuruv@srmist.edu.in',
    phone: '9876540008',
    coursesAllotted: ['PDC305'],
    status: 'Authorized'
  },
  {
    id: '9',
    name: 'Dr.P. Jaividhya',
    empId: '1809141',
    dept: 'Department of Pharmaceutical Chemistry',
    email: 'jaividhp1@srmist.edu.in',
    phone: '9876540009',
    coursesAllotted: ['PDC105'],
    status: 'Authorized'
  },
  {
    id: '10',
    name: 'Prof. M.K. Kathiravan',
    empId: '1803241',
    dept: 'Department of Pharmaceutical Chemistry',
    email: 'kathirak@srmist.edu.in',
    phone: '9876540010',
    coursesAllotted: ['PDC104'],
    status: 'Authorized'
  },
  {
    id: '11',
    name: 'Dr. Farhath Sherin',
    empId: '1809500',
    dept: 'Department of Pharmaceutics',
    email: 'farhaths@srmist.edu.in',
    phone: '9876540011',
    coursesAllotted: ['BP103T', 'BP205T', 'BP604T'],
    status: 'Authorized'
  },
  {
    id: '12',
    name: 'Dr. P.N. Remya',
    empId: '1800404',
    dept: 'Department of Pharmaceutics',
    email: 'remyan@srmist.edu.in',
    phone: '9876540012',
    coursesAllotted: ['BP302T', 'PDP306'],
    status: 'Authorized'
  },
  {
    id: '13',
    name: 'Dr. R. Kavitha',
    empId: '1800391',
    dept: 'Department of Pharmaceutics',
    email: 'kavithar@srmist.edu.in',
    phone: '9876540013',
    coursesAllotted: ['BP303T', 'BP605T', 'PDP202'],
    status: 'Authorized'
  },
  {
    id: '14',
    name: 'Dr. Soji S',
    empId: '1809604',
    dept: 'Department of Pharmaceutics',
    email: 'sojis@srmist.edu.in',
    phone: '9876540014',
    coursesAllotted: ['BP804ET'],
    status: 'Authorized'
  },
  {
    id: '15',
    name: 'Prof. M.S. Umashankar',
    empId: '1802073',
    dept: 'Department of Pharmaceutics',
    email: 'umashans@srmist.edu.in',
    phone: '9876540015',
    coursesAllotted: ['BP803ET'],
    status: 'Authorized'
  },
  {
    id: '16',
    name: 'Prof. N. Damodharan',
    empId: '1800014',
    dept: 'Department of Pharmaceutics',
    email: 'damodhan@srmist.edu.in',
    phone: '9876540016',
    coursesAllotted: ['PDP102'],
    status: 'Authorized'
  },
  {
    id: '17',
    name: 'Prof. S. Sangeetha',
    empId: '1800708',
    dept: 'Department of Pharmaceutics',
    email: 'sangeets2@srmist.edu.in',
    phone: '9876540017',
    coursesAllotted: ['BP502T', 'BP809ET', 'PDP304'],
    status: 'Authorized'
  },
  {
    id: '18',
    name: 'Dr. J. Narayanan',
    empId: '1805447',
    dept: 'Department of Pharmacology',
    email: 'narayanj@srmist.edu.in',
    phone: '9876540018',
    coursesAllotted: ['PDP406'],
    status: 'Authorized'
  },
  {
    id: '19',
    name: 'Dr. K. Gayathiri',
    empId: '1804020',
    dept: 'Department of Pharmacology',
    email: 'gayathik@srmist.edu.in',
    phone: '9876540019',
    coursesAllotted: ['BP101T', 'BP201T'],
    status: 'Authorized'
  },
  {
    id: '20',
    name: 'Dr. K. Gowri',
    empId: '1800943',
    dept: 'Department of Pharmacology',
    email: 'gowrik@srmist.edu.in',
    phone: '9876540020',
    coursesAllotted: ['BP503T', 'BP602T'],
    status: 'Authorized'
  },
  {
    id: '21',
    name: 'Dr. M. Sumithra',
    empId: '1802074',
    dept: 'Department of Pharmacology',
    email: 'sumithrm@srmist.edu.in',
    phone: '9876540021',
    coursesAllotted: ['BP810ET', 'PDL301'],
    status: 'Authorized'
  },
  {
    id: '22',
    name: 'Dr. N. Krishna Prabha',
    empId: '1808476',
    dept: 'Department of Pharmacology',
    email: 'krishnan4@srmist.edu.in',
    phone: '9876540022',
    coursesAllotted: ['BP204T', 'PDL201'],
    status: 'Authorized'
  },
  {
    id: '23',
    name: 'Mrs. R Sridevi',
    empId: '1806037',
    dept: 'Department of Pharmacology',
    email: 'sridevir@srmist.edu.in',
    phone: '9876540023',
    coursesAllotted: ['BP802T', 'PDL101'],
    status: 'Authorized'
  },
  {
    id: '24',
    name: 'Dr. A. Priyadharshini',
    empId: '1804609',
    dept: 'Department of Pharmacy Practice',
    email: 'priyadha@srmist.edu.in',
    phone: '9876540024',
    coursesAllotted: ['PDP206', 'PDL502'],
    status: 'Authorized'
  },
  {
    id: '25',
    name: 'Dr. CH Hemanth Kumar',
    empId: '1807591',
    dept: 'Department of Pharmacy Practice',
    email: 'hemanthk@srmist.edu.in',
    phone: '9876540025',
    coursesAllotted: ['BP102T', 'BP801T', 'BP806ET'],
    status: 'Authorized'
  },
  {
    id: '26',
    name: 'Dr. G.P. Pazhani',
    empId: '1807218',
    dept: 'Department of Pharmacy Practice',
    email: 'gururajp@srmist.edu.in',
    phone: '9876540026',
    coursesAllotted: ['BP807ET'],
    status: 'Authorized'
  },
  {
    id: '27',
    name: 'Dr. K. Kanaka Parvathi',
    empId: '1808015',
    dept: 'Department of Pharmacy Practice',
    email: 'kanakapk@srmist.edu.in',
    phone: '9876540027',
    coursesAllotted: ['BP505T', 'BP606T'],
    status: 'Authorized'
  },
  {
    id: '28',
    name: 'Dr. Kella Alekhya',
    empId: '1807662',
    dept: 'Department of Pharmacy Practice',
    email: 'kellaals@srmist.edu.in',
    phone: '9876540028',
    coursesAllotted: ['BP102T', 'BP606T'],
    status: 'Authorized'
  },
  {
    id: '29',
    name: 'Dr. M. Jagadeesan',
    empId: '1804057',
    dept: 'Department of Pharmacy Practice',
    email: 'jagadeem1@srmist.edu.in',
    phone: '9876540029',
    coursesAllotted: ['PDP303', 'PDL503'],
    status: 'Authorized'
  },
  {
    id: '30',
    name: 'Dr. M.G. Rajanandh',
    empId: '1808535',
    dept: 'Department of Pharmacy Practice',
    email: 'mgr@srmist.edu.in',
    phone: '9876540030',
    coursesAllotted: ['PDL501'],
    status: 'Authorized'
  },
  {
    id: '31',
    name: 'Dr. Nandimandalam Sai Supra Siddhu',
    empId: '1807856',
    dept: 'Department of Pharmacy Practice',
    email: 'nandimak1@srmist.edu.in',
    phone: '9876540031',
    coursesAllotted: ['PDL205', 'PDP403'],
    status: 'Authorized'
  },
  {
    id: '32',
    name: 'Dr. Rapuru Rushendran',
    empId: '1809719',
    dept: 'Department of Pharmacy Practice',
    email: 'rushendr@srmist.edu.in',
    phone: '9876540032',
    coursesAllotted: ['BP404T'],
    status: 'Authorized'
  },
  {
    id: '33',
    name: 'Dr. S. Sarumathy',
    empId: '1803949',
    dept: 'Department of Pharmacy Practice',
    email: 'sarumats@srmist.edu.in',
    phone: '9876540033',
    coursesAllotted: ['PDP401'],
    status: 'Authorized'
  },
  {
    id: '34',
    name: 'Dr. T.M. Vijayakumar',
    empId: '1803251',
    dept: 'Department of Pharmacy Practice',
    email: 'vijayakm2@srmist.edu.in',
    phone: '9876540034',
    coursesAllotted: ['BP703T'],
    status: 'Authorized'
  },
  {
    id: '35',
    name: 'Dr. V. Manimaran',
    empId: '1800390',
    dept: 'Department of Pharmacy Practice',
    email: 'manimarv@srmist.edu.in',
    phone: '9876540035',
    coursesAllotted: ['BP704T'],
    status: 'Authorized'
  },
  {
    id: '36',
    name: 'Dr. M. Thirumal',
    empId: '1803295',
    dept: 'Department of Pharmacognosy',
    email: 'thirumam@srmist.edu.in',
    phone: '9876540036',
    coursesAllotted: ['BP603T', 'PDG106'],
    status: 'Authorized'
  },
  {
    id: '37',
    name: 'Dr. Sakthi Priyadarsini S',
    empId: '1804271',
    dept: 'Department of Pharmacognosy',
    email: 'sakthips1@srmist.edu.in',
    phone: '9876540037',
    coursesAllotted: ['BP405T', 'BP504T'],
    status: 'Authorized'
  }
];

export function resolveFacultyForCourse(context: {
  academicYear?: string;
  programme?: string;
  regulation?: string;
  semesterOrYear?: number;
  subjectCode: string;
}): string {
  let facultyList: FacultyMember[] = DEFAULT_FACULTY;
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('srm_lms_faculty_registry');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          facultyList = parsed;
        }
      } catch (e) {
        console.error('Error parsing srm_lms_faculty_registry:', e);
      }
    }
  }

  const codeToMatch = context.subjectCode.toUpperCase().trim();
  
  const matchedStaff = facultyList.filter(f => {
    if (f.status !== 'Authorized') return false;
    return f.coursesAllotted && f.coursesAllotted.some((c: string) => c.toUpperCase().trim() === codeToMatch);
  });

  if (matchedStaff.length > 0) {
    return matchedStaff.map(s => s.name).join(', ');
  }

  return 'Not Assigned';
}
