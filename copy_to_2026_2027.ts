import { db } from './src/lib/firebase-node';
import { collection, doc, getDocs, setDoc } from 'firebase/firestore';
import fs from 'fs';


const semesters = [
  'Semester III',
  'Semester IV',
  'Semester V',
  'Semester VI',
  'Semester VII',
  'Semester VIII'
];

async function run() {
  console.log("Starting data copy from AY 2025–2026 to AY 2026–2027...");
  let semestersPopulated = 0;
  let totalCoursesCopied = 0;
  const updatedPaths: string[] = [];

  for (const sem of semesters) {
    console.log(`\nQuerying ${sem} from 2025-2026...`);
    const sourceColRef = collection(db, 'curriculum', 'B.Pharm', 'PCI 2017', '2025-2026', sem);
    const snap = await getDocs(sourceColRef);
    
    if (snap.empty) {
      console.log(`No courses found in ${sem} for 2025-2026.`);
      continue;
    }

    console.log(`Found ${snap.size} courses in ${sem}. Copying/Updating in 2026-2027...`);
    semestersPopulated++;

    for (const docSnap of snap.docs) {
      const data = docSnap.data();
      const subjectCode = docSnap.id;
      
      // Update academicYear to '2026-2027' in the document's body
      const updatedData = {
        ...data,
        academicYear: '2026-2027'
      };

      const destRef = doc(db, 'curriculum', 'B.Pharm', 'PCI 2017', '2026-2027', sem, subjectCode);
      await setDoc(destRef, updatedData, { merge: true });
      
      const destPath = `curriculum/B.Pharm/PCI 2017/2026-2027/${sem}/${subjectCode}`;
      updatedPaths.push(destPath);
      totalCoursesCopied++;
      console.log(`  ✓ Copied/Updated ${subjectCode} (${data.courseName || 'Unnamed'}) to ${destPath}`);
    }
  }

  console.log("\nCopy process completed successfully!");
  console.log(`Semesters populated: ${semestersPopulated}`);
  console.log(`Total courses copied: ${totalCoursesCopied}`);
  console.log("Updated paths:", updatedPaths);
}

run().catch(err => {
  console.error("Error running script:", err);
  process.exit(1);
});
