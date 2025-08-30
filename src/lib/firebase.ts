import { initializeApp, getApps, getApp } from 'firebase/app';

const firebaseConfig = {
    "projectId": "qrcode-inventory-ace",
    "appId": "1:1073488652811:web:4305b190620530df55350e",
    "storageBucket": "qrcode-inventory-ace.firebasestorage.app",
    "apiKey": "AIzaSyCQzpWZbOSLHRDkOxGIHB_DItZpYWh_meQ",
    "authDomain": "qrcode-inventory-ace.firebaseapp.com",
    "messagingSenderId": "1073488652811"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export { app };
