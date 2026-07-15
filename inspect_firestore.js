import { db } from './src/lib/firebase-node.js';
import { doc, getDoc } from 'firebase/firestore';


async function inspect() {
  console.log("Checking 'courses' collection...");
  try {
    const { collection, getDocs } = await import('firebase/firestore');
    const snap = await getDocs(collection(db, 'courses'));
    console.log(`Courses collection has ${snap.size} documents.`);
    snap.forEach(d => {
      console.log(`ID: ${d.id} data:`, JSON.stringify(d.data()));
    });
  } catch (e) {
    console.error("Error reading courses:", e.message);
  }
  
  console.log("Checking 'curriculum' paths...");
  const courseCodes = ['BP101T', 'BP102T', 'BP103T', 'BP104T'];
  const years = ['2024-2025', '2025-2026'];
  for (const year of years) {
    for (const code of courseCodes) {
      const path = `curriculum/B.Pharm/PCI 2017/${year}/Semester I/${code}`;
      try {
        const parts = path.split('/');
        const docRef = doc(db, parts[0], ...parts.slice(1));
        const snap = await getDoc(docRef);
        console.log(`Path: ${path} exists: ${snap.exists()}`);
        if (snap.exists()) {
          console.log(`Data (truncated):`, JSON.stringify(snap.data()).substring(0, 500));
        }
      } catch (e) {
        console.error(`Error reading ${path}:`, e.message);
      }
    }
  }
}

inspect();
