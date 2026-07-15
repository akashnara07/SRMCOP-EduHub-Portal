import { db } from './src/lib/firebase-node';
import { doc, getDoc } from 'firebase/firestore';


async function inspect() {
  console.log("Checking Semester I subjects in Firestore...");
  const years = ['2024-2025', '2025-2026'];
  const subjects = [
    'BP101T', 'BP107P', 'BP102T', 'BP108P', 'BP103T', 'BP109P', 'BP104T', 'BP110P', 'BP105T', 'BP111P', 'BP106RBT', 'BP112RBP', 'BP106RMT'
  ];

  for (const year of years) {
    console.log(`\nAcademic Year: ${year}`);
    let foundCount = 0;
    for (const code of subjects) {
      const ref = doc(db, 'curriculum', 'B.Pharm', 'PCI 2017', year, 'Semester I', code);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        foundCount++;
        const data = snap.data();
        console.log(`  [+] ${code} found: "${data.courseName}" (${data.units?.length || 0} units, ${data.objectives?.length || 0} objectives, ${data.recommendedBooks?.length || 0} recommended books)`);
      } else {
        console.log(`  [-] ${code} NOT found`);
      }
    }
    console.log(`Total found for ${year}: ${foundCount}/13`);
  }
}

inspect();
