// Temporarily disable Firebase for Expo Go testing
let app: any = null;
let auth: any = null;
let db: any = null;

// Mock Firebase for development
export { auth, db };

// We'll re-enable this for production builds
/*
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || ""
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
*/

// Initialize Crashlytics - Temporarily disabled
export const initializeCrashlytics = async () => {
  console.log('Crashlytics temporarily disabled');
};

// Crashlytics utility functions - Temporarily disabled
export const logCrashlyticsError = (error: Error, errorInfo?: any) => {
  console.error('Crashlytics error logging disabled:', error, errorInfo);
};

export const setCrashlyticsUserId = (userId: string) => {
  console.log('Crashlytics user ID disabled:', userId);
};

export const setCrashlyticsAttributes = (attributes: { [key: string]: string }) => {
  console.log('Crashlytics attributes disabled:', attributes);
};

export const logCrashlyticsMessage = (message: string) => {
  console.log('Crashlytics message disabled:', message);
};

export default app || {};