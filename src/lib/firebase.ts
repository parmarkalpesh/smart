import { initializeApp, getApps, getApp } from 'firebase/app';

const requiredVars = [
  'FIREBASE_PROJECT_ID',
  'FIREBASE_APP_ID',
  'FIREBASE_STORAGE_BUCKET',
  'FIREBASE_API_KEY',
  'FIREBASE_AUTH_DOMAIN',
  'FIREBASE_MESSAGING_SENDER_ID'
];

for (const v of requiredVars) {
  if (!process.env[v]) {
    throw new Error(`Missing required environment variable: ${v}`);
  }
}

const firebaseConfig = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    appId: process.env.FIREBASE_APP_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export { app };
