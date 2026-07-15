import dotenv from 'dotenv';
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Load environment variables from .env
dotenv.config();

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || "",
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.VITE_FIREBASE_APP_ID || "",
  measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID || ""
};

const hasConfig = !!firebaseConfig.apiKey && !!firebaseConfig.projectId;

const app = hasConfig 
  ? initializeApp(firebaseConfig) 
  : initializeApp({
      apiKey: "mock-api-key",
      projectId: "mock-project-id",
      authDomain: "mock-project-id.firebaseapp.com",
      appId: "mock-app-id"
    });

const db = getFirestore(app);

export { app, db };
