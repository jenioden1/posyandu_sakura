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
const firebaseConfig = {
  apiKey: "AIzaSyDR54GnJuOytCyoCE_a7zytohlza7I4G5Y",
  authDomain: "posyandu-sakura-4f664-42534.firebaseapp.com",
  projectId: "posyandu-sakura-4f664-42534",
  storageBucket: "posyandu-sakura-4f664-42534.firebasestorage.app",
  messagingSenderId: "208535455796",
  appId: "1:208535455796:web:415971bea7b6a4e115a261",
  measurementId: "G-7KV8MW3B1L"
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

