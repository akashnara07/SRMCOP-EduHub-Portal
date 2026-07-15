import { db } from './src/lib/firebase-node';
import { doc, setDoc } from 'firebase/firestore';
import fs from 'fs';


// Load JSON data
const sem7Courses = JSON.parse(fs.readFileSync('./src/data/syllabus_sem7.json', 'utf8'));
const sem8Courses = JSON.parse(fs.readFileSync('./src/data/syllabus_sem8.json', 'utf8'));

const allCourses = [
  ...sem7Courses.map((c: any) => ({ ...c, semester: 7 })),
  ...sem8Courses.map((c: any) => ({ ...c, semester: 8 }))
];

async function seedSyllabus78() {
  console.log(`Starting migration for ${allCourses.length} courses...`);

  const academicYears = ['2024-2025', '2025-2026'];

  for (const course of allCourses) {
    const { subjectCode, semester } = course;
    const semRoman = semester === 7 ? 'Semester VII' : 'Semester VIII';

    console.log(`Processing course: ${subjectCode} (${course.courseName}) for ${semRoman}`);

    // 1. Write to top-level courses/{subjectCode} with academicYear = '2025-2026' as default
    const topCourseRef = doc(db, 'courses', subjectCode);
    const topCourseData = {
      ...course,
      academicYear: '2025-2026'
    };
    await setDoc(topCourseRef, topCourseData, { merge: true });
    console.log(`  ✓ Written to courses/${subjectCode}`);

    // 2. Write to /curriculum/B.Pharm/PCI 2017/{year}/{semRoman}/{subjectCode}
    for (const year of academicYears) {
      const path = `curriculum/B.Pharm/PCI 2017/${year}/${semRoman}/${subjectCode}`;
      const curriculumRef = doc(db, 'curriculum', 'B.Pharm', 'PCI 2017', year, semRoman, subjectCode);
      const curriculumData = {
        ...course,
        academicYear: year
      };
      await setDoc(curriculumRef, curriculumData, { merge: true });
      console.log(`  ✓ Written to ${path}`);
    }
  }

  console.log('Semester VII and VIII syllabus seeding successfully completed!');
}

seedSyllabus78().catch((error) => {
  console.error('Error seeding syllabus:', error);
  process.exit(1);
});
