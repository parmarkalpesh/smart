import { initializeApp, getApps, getApp } from 'firebase/app';

const firebaseConfig = {
    "projectId": "qrcode-inventory-ace",
    "appId": "1:1073488652811:web:4305b190620530df55350e",
    "storageBucket": "qrcode-inventory-ace.firebasestorage.app",
    "apiKey": process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    "authDomain": "qrcode-inventory-ace.firebaseapp.com",
    "messagingSenderId": "1073488652811"
};

    "authDomain": "qrcode-inventory-ace.firebaseapp.com",
    "messagingSenderId": "1073488652811"
};

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
