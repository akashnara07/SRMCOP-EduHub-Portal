import { db } from './src/lib/firebase-node';
import { doc, setDoc } from 'firebase/firestore';
import fs from 'fs';


// Load parts
const part1 = JSON.parse(fs.readFileSync('./src/data/syllabus_sem1_part1.json', 'utf8'));
const part2 = JSON.parse(fs.readFileSync('./src/data/syllabus_sem1_part2.json', 'utf8'));
const part3 = JSON.parse(fs.readFileSync('./src/data/syllabus_sem1_part3.json', 'utf8'));

const sem1Courses = [...part1, ...part2, ...part3];

async function seedSyllabus1() {
  console.log(`Starting migration for ${sem1Courses.length} Semester I courses...`);

  const academicYears = ['2024-2025', '2025-2026'];

  for (const course of sem1Courses) {
    const { subjectCode } = course;
    const semRoman = 'Semester I';

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

  console.log('Semester I syllabus seeding successfully completed!');
}

seedSyllabus1().catch((error) => {
  console.error('Error seeding syllabus:', error);
  process.exit(1);
});
