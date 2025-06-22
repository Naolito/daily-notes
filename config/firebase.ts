import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth } from 'firebase/auth';
import { getFirestore, initializeFirestore } from 'firebase/firestore';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import crashlytics from '@react-native-firebase/crashlytics';

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

// Initialize Crashlytics
export const initializeCrashlytics = async () => {
  try {
    // Enable Crashlytics collection
    await crashlytics().setCrashlyticsCollectionEnabled(true);
    
    // Log that Crashlytics is initialized
    console.log('Firebase Crashlytics initialized');
  } catch (error) {
    console.error('Error initializing Crashlytics:', error);
  }
};

// Crashlytics utility functions
export const logCrashlyticsError = (error: Error, errorInfo?: any) => {
  crashlytics().recordError(error, errorInfo);
};

export const setCrashlyticsUserId = (userId: string) => {
  crashlytics().setUserId(userId);
};

export const setCrashlyticsAttributes = (attributes: { [key: string]: string }) => {
  Object.entries(attributes).forEach(([key, value]) => {
    crashlytics().setAttribute(key, value);
  });
};

export const logCrashlyticsMessage = (message: string) => {
  crashlytics().log(message);
};

export default app;