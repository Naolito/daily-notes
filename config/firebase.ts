import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth } from 'firebase/auth';
import { getFirestore, initializeFirestore } from 'firebase/firestore';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import crashlytics from '@react-native-firebase/crashlytics';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || ""
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth
export const auth = getAuth(app);

// Initialize Firestore with settings
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true, // For React Native
});

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

export default app;