/**
 * Firebase Configuration
 * 
 * Asumsi: File ini sudah dikonfigurasi dengan Firebase project credentials
 * Ganti dengan konfigurasi Firebase project Anda
 */

import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getFunctions } from 'firebase/functions';

// Firebase Configuration
// Konfigurasi dari Firebase Console
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDiafkrOuGaP6QZLn7AswDaBFLl4eRDoP0",
  authDomain: "posyandu-sakura-4cf92.firebaseapp.com",
  projectId: "posyandu-sakura-4cf92",
  storageBucket: "posyandu-sakura-4cf92.firebasestorage.app",
  messagingSenderId: "342126846178",
  appId: "1:342126846178:web:9630468b02a02ec07bfebb"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics (hanya untuk production)
// Disable untuk development karena ada warning API key
let analytics = null;
// if (typeof window !== 'undefined') {
//   analytics = getAnalytics(app);
// }

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Auth (dengan error handling)
// Jika Firebase Authentication belum diaktifkan, akan error tapi tidak crash
let auth = null;
try {
  auth = getAuth(app);
} catch (error) {
  console.warn('Firebase Auth initialization error:', error);
  console.warn('Jika tidak menggunakan Firebase Auth, error ini bisa diabaikan.');
}

// Initialize Functions
export const functions = getFunctions(app);

export { analytics, auth };
export default app;

