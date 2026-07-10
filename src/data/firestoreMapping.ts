/**
 * OFFICIAL SRMCOP EduHub Curriculum Firestore Schema & Mapping Specifications
 * 
 * This file outlines the exact document & collection mapping for migrating
 * the 8-worksheet official curriculum template directly to a Google Cloud Firestore database.
 */

export interface FirestoreFieldSchema {
  type: 'string' | 'number' | 'boolean' | 'timestamp' | 'array' | 'map';
  description: string;
  required: boolean;
}

export interface FirestoreCollectionSchema {
  path: string;
  primaryKey: string;
  description: string;
  fields: Record<string, FirestoreFieldSchema>;
}

// 1. Core Firestore Mappings mapping each sheet to structural paths
export const FIRESTORE_CURRICULUM_MAPPING: Record<string, FirestoreCollectionSchema> = {
  courseInformation: {
    path: '/courseInformation/{subjectCode}',
    primaryKey: 'subjectCode',
    description: 'Master list of courses containing basic metadata and status controls.',
    fields: {
      subjectCode: { type: 'string', required: true, description: 'Subject Code of the course (e.g. BP101T).' },
      courseName: { type: 'string', required: true, description: 'Full title of the syllabus course.' },
      programme: { type: 'string', required: true, description: 'E.g., B.Pharm / M.Pharm.' },
      regulation: { type: 'string', required: true, description: 'E.g., PCI Regulation 2020.' },
      year: { type: 'number', required: true, description: 'Academic curriculum year (1-4).' },
      semester: { type: 'number', required: true, description: 'Academic curriculum semester (1-8).' },
      credits: { type: 'number', required: true, description: 'Credits allocated to this course.' },
      hours: { type: 'number', required: true, description: 'Total study hours required.' },
      subjectType: { type: 'string', required: true, description: 'Either "Theory" or "Practical".' },
      status: { type: 'string', required: true, description: 'Approval state: "Approved", "Draft", "Archived".' },
      facultyAssigned: { type: 'string', required: true, description: 'Name of the primary faculty member assigned.' },
      importVersion: { type: 'string', required: true, description: 'Version number tracked by administrative uploads.' },
      academicYear: { type: 'string', required: true, description: 'Academic Year of allocation (e.g. 2024-2025).' }
    }
  },
  scope: {
    path: '/courseInformation/{subjectCode}/scope/details',
    primaryKey: 'subjectCode',
    description: 'Document outlining the educational scope and objectives bounds.',
    fields: {
      subjectCode: { type: 'string', required: true, description: 'Linked subject code.' },
      scopeStatement: { type: 'string', required: true, description: 'Full paragraph explaining curriculum boundaries.' }
    }
  },
  objectives: {
    path: '/courseInformation/{subjectCode}/objectives/{objectiveId}',
    primaryKey: 'objectiveId',
    description: 'Detailed syllabus learning goals and sequencing.',
    fields: {
      subjectCode: { type: 'string', required: true, description: 'Linked subject code.' },
      objectiveText: { type: 'string', required: true, description: 'Objective statement.' },
      order: { type: 'number', required: true, description: 'Chronological order index (1, 2, 3...)' }
    }
  },
  courseOutcomes: {
    path: '/courseInformation/{subjectCode}/courseOutcomes/{coCode}',
    primaryKey: 'coCode',
    description: 'Course Outcomes with target attainment levels for OBE tracking.',
    fields: {
      subjectCode: { type: 'string', required: true, description: 'Linked subject code.' },
      coCode: { type: 'string', required: true, description: 'Outcome label (e.g. CO1, CO2).' },
      coText: { type: 'string', required: true, description: 'Outcome target statement.' },
      attainmentTarget: { type: 'number', required: true, description: 'Target score average (out of 3.0).' }
    }
  },
  units: {
    path: '/courseInformation/{subjectCode}/units/{unitCode}',
    primaryKey: 'unitCode',
    description: 'PCI syllabus modular divisions or sections.',
    fields: {
      subjectCode: { type: 'string', required: true, description: 'Linked subject code.' },
      unitCode: { type: 'string', required: true, description: 'Unit number identifier (e.g., "Unit I").' },
      unitName: { type: 'string', required: true, description: 'Unit description name.' },
      hours: { type: 'number', required: true, description: 'Total study hours for this unit.' }
    }
  },
  curriculumTopics: {
    path: '/courseInformation/{subjectCode}/units/{unitCode}/topics/{topicCode}',
    primaryKey: 'topicCode',
    description: 'Granular topics covered inside each PCI syllabus unit.',
    fields: {
      subjectCode: { type: 'string', required: true, description: 'Linked subject code.' },
      unitCode: { type: 'string', required: true, description: 'Parent unit identifier.' },
      topicCode: { type: 'string', required: true, description: 'Granular topic sequence ID (e.g. T1, T2).' },
      topicName: { type: 'string', required: true, description: 'Topic description name.' },
      hours: { type: 'number', required: true, description: 'Assigned lecture hour duration.' }
    }
  },
  referenceBooks: {
    path: '/courseInformation/{subjectCode}/referenceBooks/{bookId}',
    primaryKey: 'bookId',
    description: 'Prescribed reference books and academic texts matching official template.',
    fields: {
      subjectCode: { type: 'string', required: true, description: 'Linked subject code.' },
      title: { type: 'string', required: true, description: 'Complete book citation title.' },
      author: { type: 'string', required: true, description: 'Authors list.' },
      edition: { type: 'string', required: true, description: 'Publication edition index.' }
    }
  },
  assessmentPattern: {
    path: '/courseInformation/{subjectCode}/assessmentPattern/details',
    primaryKey: 'subjectCode',
    description: 'Marks division weights mapping theory and practical end exams.',
    fields: {
      subjectCode: { type: 'string', required: true, description: 'Linked subject code.' },
      theoryInternal: { type: 'number', required: true, description: 'Internal Sessional limit (e.g. 25).' },
      theoryExternal: { type: 'number', required: true, description: 'End-semester Theory weight (e.g. 75).' },
      practicalInternal: { type: 'number', required: true, description: 'Practical Sessional limit (e.g. 15).' },
      practicalExternal: { type: 'number', required: true, description: 'End-semester Practical weight (e.g. 35).' },
      universityExam: { type: 'number', required: true, description: 'Total aggregated marks threshold (e.g. 100).' }
    }
  }
};

// 2. Production-Ready ABAC firestore.rules Definition
export const FIRESTORE_RULES_SPECIFICATION = `
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }

    // Check if user has Administrative Role
    function isAdmin() {
      return isAuthenticated() && 
        request.auth.token.role == "Admin" || 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "Admin";
    }

    // Check if user is an Assigned Faculty for this subject
    function isAssignedFaculty(subjectCode) {
      return isAuthenticated() && (
        get(/databases/$(database)/documents/courseInformation/$(subjectCode)).data.facultyAssigned == request.auth.token.email ||
        get(/databases/$(database)/documents/courseInformation/$(subjectCode)).data.facultyAssigned == request.auth.token.name
      );
    }

    // Course Information: Admins have full access. Faculty has Read-Only.
    match /courseInformation/{subjectCode} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();

      // Subcollections are locked dynamically
      match /scope/{document} {
        allow read: if isAuthenticated();
        allow write: if isAdmin();
      }
      
      match /objectives/{document} {
        allow read: if isAuthenticated();
        allow write: if isAdmin();
      }

      match /courseOutcomes/{document} {
        allow read: if isAuthenticated();
        allow write: if isAdmin();
      }

      match /units/{unitCode} {
        allow read: if isAuthenticated();
        allow write: if isAdmin();

        match /topics/{document} {
          allow read: if isAuthenticated();
          allow write: if isAdmin();
        }
      }

      match /referenceBooks/{document} {
        allow read: if isAuthenticated();
        allow write: if isAdmin();
      }

      match /assessmentPattern/{document} {
        allow read: if isAuthenticated();
        allow write: if isAdmin();
      }
    }
  }
}
`;

/**
 * Payload Compiler
 * Converts structural local state to batch-writeable Firestore payloads
 */
export const compileFirestoreBatchPayloads = (parsedWorkbook: any) => {
  const operations: Array<{
    collection: string;
    docId: string;
    data: any;
  }> = [];

  // Map Course Information
  parsedWorkbook.courseInformation.forEach((course: any) => {
    operations.push({
      collection: 'courseInformation',
      docId: course.subjectCode,
      data: { ...course }
    });
  });

  // Map Scope
  parsedWorkbook.scope.forEach((scopeDoc: any) => {
    operations.push({
      collection: `courseInformation/${scopeDoc.subjectCode}/scope`,
      docId: 'details',
      data: { ...scopeDoc }
    });
  });

  // Map Objectives
  parsedWorkbook.objectives.forEach((obj: any, idx: number) => {
    operations.push({
      collection: `courseInformation/${obj.subjectCode}/objectives`,
      docId: `obj-${idx}`,
      data: { ...obj }
    });
  });

  // Map Outcomes
  parsedWorkbook.courseOutcomes.forEach((co: any) => {
    operations.push({
      collection: `courseInformation/${co.subjectCode}/courseOutcomes`,
      docId: co.coCode,
      data: { ...co }
    });
  });

  // Map Units
  parsedWorkbook.units.forEach((unit: any) => {
    operations.push({
      collection: `courseInformation/${unit.subjectCode}/units`,
      docId: unit.unitCode.replace(/\\s+/g, '_'),
      data: { ...unit }
    });
  });

  // Map Topics
  parsedWorkbook.curriculumTopics.forEach((topic: any) => {
    operations.push({
      collection: `courseInformation/${topic.subjectCode}/units/${topic.unitCode.replace(/\\s+/g, '_')}/topics`,
      docId: topic.topicCode,
      data: { ...topic }
    });
  });

  // Map Reference Books
  parsedWorkbook.referenceBooks.forEach((book: any, idx: number) => {
    operations.push({
      collection: `courseInformation/${book.subjectCode}/referenceBooks`,
      docId: `ref-${idx}`,
      data: { ...book }
    });
  });

  // Map Assessment Pattern
  parsedWorkbook.assessmentPattern.forEach((assess: any) => {
    operations.push({
      collection: `courseInformation/${assess.subjectCode}/assessmentPattern`,
      docId: 'details',
      data: { ...assess }
    });
  });

  return operations;
};
