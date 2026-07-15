import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  getDocs, 
  setDoc, 
  doc, 
  deleteDoc, 
  writeBatch,
  getDocFromServer
} from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { CourseInformation, MasterCurriculumDb, getCurriculumDb, saveCurriculumDb, getTeachingResources, saveTeachingResources } from '../data/curriculumDb';
import { Subject, Resource } from '../types';

// Web SDK standard Firebase Configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || ""
};

const hasConfig = !!firebaseConfig.apiKey && !!firebaseConfig.projectId;

console.log("===== FIREBASE ENV CHECK =====");
console.log("Project ID:", firebaseConfig.projectId);
console.log("Auth Domain:", firebaseConfig.authDomain);
console.log("Storage Bucket:", firebaseConfig.storageBucket);
console.log("API Key Present:", !!firebaseConfig.apiKey);
console.log("hasConfig:", hasConfig);
console.log("==============================");

// Initialize Firebase app safely (with mock fallback for robust local dev initialization)
const app = hasConfig 
  ? initializeApp(firebaseConfig) 
  : initializeApp({
      apiKey: "mock-api-key",
      projectId: "mock-project-id",
      authDomain: "mock-project-id.firebaseapp.com",
      appId: "mock-app-id"
    });

console.log("Connected Project:", app.options.projectId);
console.log("Connected Auth Domain:", app.options.authDomain);

// Initialize Firestore, Auth and Storage with standard Firebase Web SDK references
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);


// Test connection on boot
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log("Firebase connected successfully!");
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration or network status.");
    }
  }
}
testConnection();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

/**
 * Upload the entire local localStorage curriculum database to Firestore
 */
export async function uploadLocalDbToFirestore() {
  try {
    const localDb = getCurriculumDb();
    const batch = writeBatch(db);

    // Save each course
    for (const course of localDb.courseInformation) {
      const courseRef = doc(db, 'courses', course.subjectCode);
      batch.set(courseRef, course);

      // Upload its local teaching resources too
      const resources = getTeachingResources(course.subjectCode);
      for (const res of resources) {
        const resRef = doc(db, 'teaching_resources', res.id);
        batch.set(resRef, {
          ...res,
          subjectCode: course.subjectCode
        });
      }
    }

    await batch.commit();
    console.log("Successfully seeded local database to Firestore!");
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'courses');
  }
}

/**
 * Sync from Firestore down to localStorage
 */
export async function downloadFirestoreToLocal(): Promise<boolean> {
  try {
    // 1. Fetch courses from the 'courses' collection
    const courses: CourseInformation[] = [];
    let coursesSnapshot: any = null;
    try {
      console.log("Reading collection:", "courses");
      coursesSnapshot = await getDocs(collection(db, 'courses'));
      console.log("courses OK");
      if (coursesSnapshot) {
        coursesSnapshot.forEach((docSnap: any) => {
          courses.push(docSnap.data() as CourseInformation);
        });
      }
    } catch (error: any) {
      console.error("Collection failed:", "courses");
      console.error("Code:", error ? error.code : "N/A");
      console.error("Message:", error ? error.message : "N/A");
      console.error(error);
    }

    const localDb = getCurriculumDb();

    // 2. Clear sync courses (Semester I, II, III, IV, V, VI, VII, VIII) from localDb to avoid stale/duplicate/mock data
    const syncSemCodes = [
      'BP101T', 'BP102T', 'BP103T', 'BP104T', 'BP105T', 'BP106RBT', 'BP106RMT', 'BP107P', 'BP108P', 'BP109P', 'BP110P', 'BP111P', 'BP112RBP',
      'BP201T', 'BP202T', 'BP203T', 'BP204T', 'BP205T', 'BP206T', 'BP207P', 'BP208P', 'BP209P', 'BP210P',
      'BP301T', 'BP302T', 'BP303T', 'BP304T', 'BP305P', 'BP306P', 'BP307P', 'BP308P',
      'BP401T', 'BP402T', 'BP403T', 'BP404T', 'BP405T', 'BP406P', 'BP407P', 'BP408P', 'BP409P',
      'BP501T', 'BP502T', 'BP503T', 'BP504T', 'BP505T', 'BP506P', 'BP507P', 'BP508P',
      'BP601T', 'BP602T', 'BP603T', 'BP604T', 'BP605T', 'BP606T', 'BP607P', 'BP608P', 'BP609P',
      'BP701T', 'BP702T', 'BP703T', 'BP704T', 'BP705P',
      'BP801T', 'BP802T', 'BP803ET', 'BP804ET', 'BP805ET', 'BP806ET', 'BP807ET', 'BP808ET', 'BP809ET', 'BP810ET', 'BP811ET', 'BP812ET', 'BP813ET'
    ];
    localDb.courseInformation = localDb.courseInformation.filter(c => !syncSemCodes.includes(c.subjectCode));
    localDb.scope = localDb.scope.filter(s => !syncSemCodes.includes(s.subjectCode));
    localDb.objectives = localDb.objectives.filter(o => !syncSemCodes.includes(o.subjectCode));
    localDb.courseOutcomes = localDb.courseOutcomes.filter(co => !syncSemCodes.includes(co.subjectCode));
    localDb.units = localDb.units.filter(u => !syncSemCodes.includes(u.subjectCode));
    localDb.curriculumTopics = localDb.curriculumTopics.filter(t => !syncSemCodes.includes(t.subjectCode));
    localDb.recommendedBooks = localDb.recommendedBooks.filter(b => !syncSemCodes.includes(b.subjectCode));
    localDb.referenceBooks = localDb.referenceBooks.filter(b => !syncSemCodes.includes(b.subjectCode));
    localDb.assessmentPattern = localDb.assessmentPattern.filter(a => !syncSemCodes.includes(a.subjectCode));

    // 3. Traversal of Firestore curriculum subcollections to fetch authentic data
    const progs = ['B.Pharm', 'Pharm.D'];
    const regs = ['PCI 2017', 'PCI 2026', 'PCI 2008'];
    const years = ['2024-2025', '2025-2026', '2026-2027'];
    const sems = ['Semester I', 'Semester II', 'Semester III', 'Semester IV', 'Semester V', 'Semester VI', 'Semester VII', 'Semester VIII'];

    for (const prog of progs) {
      for (const reg of regs) {
        for (const year of years) {
          for (const sem of sems) {
            const collectionName = `curriculum/${prog}/${reg}/${year}/${sem}`;
            try {
              console.log("Reading collection:", collectionName);
              const colRef = collection(db, 'curriculum', prog, reg, year, sem);
              const snap = await getDocs(colRef);
              console.log(`${collectionName} OK`);
              
              snap.forEach((docSnap) => {
                const data = docSnap.data();
                const subjectCode = data.subjectCode || data.courseCode || docSnap.id;
                
                if (subjectCode) {
                  // Clean any existing records for this subject in our localDb to avoid duplicate/corrupt insertions
                  localDb.courseInformation = localDb.courseInformation.filter(c => !(c.subjectCode === subjectCode && c.academicYear === year && c.regulation === reg));
                  
                  // Add Course Information
                  localDb.courseInformation.push({
                    subjectCode,
                    courseName: data.courseName || data.name || 'Unnamed Course',
                    programme: data.programme || prog,
                    regulation: data.regulation || reg,
                    year: data.year || (prog === 'B.Pharm' ? (['Semester I', 'Semester II'].includes(sem) ? 1 : ['Semester III', 'Semester IV'].includes(sem) ? 2 : ['Semester V', 'Semester VI'].includes(sem) ? 3 : 4) : 1),
                    semester: data.semester || (sem === 'Semester I' ? 1 : sem === 'Semester II' ? 2 : sem === 'Semester III' ? 3 : sem === 'Semester IV' ? 4 : sem === 'Semester V' ? 5 : sem === 'Semester VI' ? 6 : sem === 'Semester VII' ? 7 : sem === 'Semester VIII' ? 8 : 1),
                    credits: data.credits || 4,
                    hours: data.hours || 45,
                    subjectType: data.subjectType || data.type || 'Theory',
                    status: data.status || 'Approved',
                    facultyAssigned: data.facultyAssigned || data.facultyName || 'Dr. V. Chitra',
                    importVersion: data.importVersion || '1.0',
                    academicYear: data.academicYear || year
                  });

                  // Scope
                  if (data.scope) {
                    localDb.scope = localDb.scope.filter(s => s.subjectCode !== subjectCode);
                    localDb.scope.push({
                      subjectCode,
                      scopeStatement: data.scope
                    });
                  }

                  // Objectives
                  if (Array.isArray(data.objectives)) {
                    localDb.objectives = localDb.objectives.filter(o => o.subjectCode !== subjectCode);
                    data.objectives.forEach((objText: string, idx: number) => {
                      localDb.objectives.push({
                        subjectCode,
                        objectiveText: objText,
                        order: idx + 1
                      });
                    });
                  }

                  // Course Outcomes
                  if (Array.isArray(data.courseOutcomes)) {
                    localDb.courseOutcomes = localDb.courseOutcomes.filter(co => co.subjectCode !== subjectCode);
                    data.courseOutcomes.forEach((coText: string) => {
                      let coCode = 'CO1';
                      let coVal = coText;
                      if (coText.includes(':')) {
                        const parts = coText.split(':');
                        coCode = parts[0].trim();
                        coVal = parts.slice(1).join(':').trim();
                      } else {
                        coCode = `CO${localDb.courseOutcomes.filter(co => co.subjectCode === subjectCode).length + 1}`;
                      }
                      localDb.courseOutcomes.push({
                        subjectCode,
                        coCode,
                        coText: coVal,
                        attainmentTarget: 60
                      });
                    });
                  }

                  // Units & Topics
                  if (Array.isArray(data.units)) {
                    localDb.units = localDb.units.filter(u => u.subjectCode !== subjectCode);
                    localDb.curriculumTopics = localDb.curriculumTopics.filter(t => t.subjectCode !== subjectCode);
                    data.units.forEach((u: any, uIdx: number) => {
                      const unitCode = u.unitCode || u.name || `Unit ${uIdx + 1}`;
                      const unitName = u.unitName || u.title || `Unit ${uIdx + 1}`;
                      localDb.units.push({
                        subjectCode,
                        unitCode,
                        unitName,
                        hours: u.hours || 9
                      });

                      if (Array.isArray(u.topics)) {
                        u.topics.forEach((t: any, tIdx: number) => {
                          localDb.curriculumTopics.push({
                            subjectCode,
                            unitCode,
                            topicCode: t.topicCode || t.number || `${unitCode}.${tIdx + 1}`,
                            topicName: t.topicName || t.name || '',
                            hours: t.hours || 1
                          });
                        });
                      }
                    });
                  }

                  // Recommended Books
                  if (Array.isArray(data.recommendedBooks)) {
                    localDb.recommendedBooks = localDb.recommendedBooks.filter(b => b.subjectCode !== subjectCode);
                    data.recommendedBooks.forEach((b: any) => {
                      localDb.recommendedBooks.push({
                        subjectCode,
                        title: b.title || '',
                        author: b.author || '',
                        edition: b.edition || ''
                      });
                    });
                  }

                  // Reference Books
                  if (Array.isArray(data.referenceBooks)) {
                    localDb.referenceBooks = localDb.referenceBooks.filter(b => b.subjectCode !== subjectCode);
                    data.referenceBooks.forEach((b: any) => {
                      localDb.referenceBooks.push({
                        subjectCode,
                        title: b.title || '',
                        author: b.author || '',
                        edition: b.edition || ''
                      });
                    });
                  }

                  // Assessment Pattern
                  if (data.assessmentPattern) {
                    localDb.assessmentPattern = localDb.assessmentPattern.filter(a => a.subjectCode !== subjectCode);
                    localDb.assessmentPattern.push({
                      subjectCode,
                      theoryInternal: data.assessmentPattern.theoryInternal ?? 25,
                      theoryExternal: data.assessmentPattern.theoryExternal ?? 75,
                      practicalInternal: data.assessmentPattern.practicalInternal ?? 15,
                      practicalExternal: data.assessmentPattern.practicalExternal ?? 35,
                      universityExam: data.assessmentPattern.universityExam ?? 100
                    });
                  }
                }
              });
            } catch (error: any) {
              console.error("Collection failed:", collectionName);
              console.error("Code:", error ? error.code : "N/A");
              console.error("Message:", error ? error.message : "N/A");
              console.error(error);
            }
          }
        }
      }
    }

    // Merge in any other non-sync courses fetched from 'courses' collection
    courses.forEach(course => {
      if (!syncSemCodes.includes(course.subjectCode)) {
        if (!localDb.courseInformation.some(c => c.subjectCode === course.subjectCode && c.academicYear === course.academicYear && c.regulation === course.regulation)) {
          localDb.courseInformation.push(course);
        }
      }
    });

    // 4. Save resources per subject
    let resourcesSnapshot: any = null;
    try {
      console.log("Reading collection:", "teaching_resources");
      resourcesSnapshot = await getDocs(collection(db, 'teaching_resources'));
      console.log("teaching_resources OK");
    } catch (error: any) {
      console.error("Collection failed:", "teaching_resources");
      console.error("Code:", error ? error.code : "N/A");
      console.error("Message:", error ? error.message : "N/A");
      console.error(error);
    }

    const resourcesBySubject: Record<string, Resource[]> = {};
    if (resourcesSnapshot) {
      resourcesSnapshot.forEach((docSnap: any) => {
        const res = docSnap.data() as Resource & { subjectCode: string };
        const subCode = res.subjectCode;
        if (!resourcesBySubject[subCode]) {
          resourcesBySubject[subCode] = [];
        }
        resourcesBySubject[subCode].push(res);
      });
    }

    saveCurriculumDb(localDb);

    for (const course of localDb.courseInformation) {
      const subjectRes = resourcesBySubject[course.subjectCode] || [];
      saveTeachingResources(course.subjectCode, subjectRes);
    }

    console.log("Local storage synchronized with complete Firebase curriculum and courses!");
    return true;
  } catch (error: any) {
    console.error("===== FIRESTORE SYNC ERROR DIAGNOSTICS =====");
    if (error) {
      console.error("Error Code:", error.code);
      console.error("Error Message:", error.message);
      console.error("Full Error Object:", error);
    } else {
      console.error("Unknown error caught (null/undefined)");
    }
    console.error("============================================");
    console.warn("Failed to synchronize with Firestore, falling back to local storage.", error);
    return false;
  }
}

/**
 * Add a course to Firestore
 */
export async function addCourseToFirestore(course: CourseInformation) {
  try {
    const courseRef = doc(db, 'courses', course.subjectCode);
    await setDoc(courseRef, course);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `courses/${course.subjectCode}`);
  }
}

/**
 * Delete a course from Firestore
 */
export async function deleteCourseFromFirestore(subjectCode: string) {
  try {
    const courseRef = doc(db, 'courses', subjectCode);
    await deleteDoc(courseRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `courses/${subjectCode}`);
  }
}

/**
 * Save a resource to Firestore
 */
export async function saveResourceToFirestore(subjectCode: string, resource: Resource) {
  try {
    const resRef = doc(db, 'teaching_resources', resource.id);
    await setDoc(resRef, {
      ...resource,
      subjectCode
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `teaching_resources/${resource.id}`);
  }
}

/**
 * Delete a resource from Firestore
 */
export async function deleteResourceFromFirestore(resourceId: string) {
  try {
    const resRef = doc(db, 'teaching_resources', resourceId);
    await deleteDoc(resRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `teaching_resources/${resourceId}`);
  }
}

/**
 * Generate a deterministic event ID based on:
 * academicYear + normalizedTitle + startDate + endDate + programme + semester/year + category
 */
export function generateDeterministicEventId(event: any) {
  const academicYear = (event.academicYear || '').trim().toLowerCase();
  const normalizedTitle = (event.title || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
  const startDate = (event.startDate || '').trim().toLowerCase();
  const endDate = (event.endDate || event.startDate || '').trim().toLowerCase();
  const programme = (event.programme || '').trim().toLowerCase();
  const semester = (event.semester || '').trim().toLowerCase();
  const category = (event.category || '').trim().toLowerCase();

  const rawKey = `${academicYear}_${normalizedTitle}_${startDate}_${endDate}_${programme}_${semester}_${category}`;
  
  // Clean rawKey for a safe Firestore Document ID [a-zA-Z0-9_\-]
  const safeId = rawKey
    .replace(/[^a-zA-Z0-9_\-]+/g, '-') // replace invalid chars with a dash
    .replace(/-+/g, '-')              // consolidate multiple dashes
    .replace(/^-|-$/g, '');           // trim leading/trailing dashes
  
  return `cal-${safeId}`.substring(0, 120).toLowerCase();
}

/**
 * Save academic calendar event to Firestore
 */
export async function saveCalendarEventToFirestore(event: any) {
  try {
    const id = event.id || generateDeterministicEventId(event);
    const eventRef = doc(db, 'academicCalendar', id);
    const data = { 
      ...event, 
      id,
      createdAt: event.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await setDoc(eventRef, data);
    return data;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `academicCalendar/${event.id}`);
  }
}

/**
 * Save multiple academic calendar events in a batch
 */
export async function saveCalendarEventsBatchToFirestore(events: any[]) {
  try {
    const batch = writeBatch(db);
    const processedEvents = events.map(event => {
      const id = event.id || generateDeterministicEventId(event);
      const eventRef = doc(db, 'academicCalendar', id);
      const data = {
        ...event,
        id,
        createdAt: event.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      batch.set(eventRef, data);
      return data;
    });
    await batch.commit();
    return processedEvents;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'academicCalendar/batch');
  }
}

/**
 * Get all academic calendar events from Firestore
 */
export async function getCalendarEventsFromFirestore() {
  try {
    const querySnapshot = await getDocs(collection(db, 'academicCalendar'));
    const events: any[] = [];
    querySnapshot.forEach((docSnap) => {
      events.push(docSnap.data());
    });
    return events;
  } catch (error) {
    console.error("Failed to read academicCalendar from Firestore:", error);
    return [];
  }
}

/**
 * Delete an academic calendar event from Firestore
 */
export async function deleteCalendarEventFromFirestore(eventId: string) {
  try {
    const eventRef = doc(db, 'academicCalendar', eventId);
    await deleteDoc(eventRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `academicCalendar/${eventId}`);
  }
}
