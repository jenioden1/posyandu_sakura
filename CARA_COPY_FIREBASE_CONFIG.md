# 📋 Cara Copy Firebase Config untuk Frontend

## 🎯 Tujuan

Copy konfigurasi Firebase dari Firebase Console ke file `src/config/firebase.js`.

---

## 🚀 Langkah-Langkah

### STEP 1: Buka Firebase Console

1. Buka [Firebase Console](https://console.firebase.google.com/)
2. Login dengan akun Google Anda
3. Pilih project: **posyandu-sakura-4f664** (atau project yang baru dibuat)

---

### STEP 2: Buka Project Settings

1. Klik **Settings** (ikon gear di sidebar) → **Project settings**
2. Atau klik nama project di sidebar → **Project settings**

---

### STEP 3: Buka Tab General

1. Di Project settings, pastikan tab **General** aktif (default)

---

### STEP 4: Scroll ke "Your apps"

1. Scroll ke bawah sampai menemukan section **"Your apps"**
2. Jika belum ada web app, lanjut ke STEP 5
3. Jika sudah ada web app, lanjut ke STEP 6

---

### STEP 5: Register Web App (Jika Belum Ada)

1. Klik ikon **"</>"** (Web icon) di section "Your apps"
2. **Register app:**
   - **App nickname:** `posyandu-web` (atau nama lain)
   - **Firebase Hosting:** (optional, bisa skip)
   - Klik **Register app**
3. **Konfigurasi akan muncul** (langsung ke STEP 6)

---

### STEP 6: Copy Firebase Config

1. **Konfigurasi akan muncul dalam 2 format:**

**Format 1: CDN (Script tag)**
```html
<script>
  const firebaseConfig = {
    apiKey: "AIzaSy...",
    authDomain: "...",
    projectId: "...",
    storageBucket: "...",
    messagingSenderId: "...",
    appId: "...",
    measurementId: "..."
  };
</script>
```

**Format 2: npm (Module)**
```javascript
import { initializeApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "...",
  measurementId: "..."
};

const app = initializeApp(firebaseConfig);
```

2. **Copy bagian `firebaseConfig`** (object dengan apiKey, authDomain, dll)

---

### STEP 7: Update File `src/config/firebase.js`

1. Buka file `src/config/firebase.js` di project
2. **Ganti `firebaseConfig`** dengan yang di-copy dari Firebase Console
3. **Pastikan format sama:**
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSy...",
     authDomain: "...",
     projectId: "...",
     storageBucket: "...",
     messagingSenderId: "...",
     appId: "...",
     measurementId: "..."
   };
   ```

4. **Save file**

---

## ✅ Verifikasi

1. **Cek `projectId`:**
   - Harus sama dengan project di Firebase Console
   - Contoh: `posyandu-sakura-4f664`

2. **Cek `apiKey`:**
   - Harus ada dan tidak kosong
   - Format: `AIzaSy...`

3. **Cek `authDomain`:**
   - Format: `project-id.firebaseapp.com`
   - Harus sesuai dengan projectId

---

## 📝 Contoh Lengkap

**File `src/config/firebase.js` setelah di-update:**

```javascript
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getFunctions } from 'firebase/functions';

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyBI91ZEhjsA7Paewfyf_P5Abrc2lkbaep4",
  authDomain: "posyandu-sakura-4f664.firebaseapp.com",
  projectId: "posyandu-sakura-4f664",
  storageBucket: "posyandu-sakura-4f664.firebasestorage.app",
  messagingSenderId: "571630015992",
  appId: "1:571630015992:web:7d5be6ffc724186f8db20d",
  measurementId: "G-GXVDP9C9YG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics (disabled untuk development)
let analytics = null;

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Auth (dengan error handling)
let auth = null;
try {
  auth = getAuth(app);
} catch (error) {
  console.warn('Firebase Auth initialization error:', error);
}

// Initialize Functions
export const functions = getFunctions(app);

export { analytics, auth };
export default app;
```

---

## 🐛 Troubleshooting

### Error: "Firebase: Error (auth/invalid-api-key)"

**Penyebab:** API key tidak valid atau salah

**Solusi:**
1. Copy ulang config dari Firebase Console
2. Pastikan tidak ada typo
3. Pastikan projectId sesuai

### Error: "Firebase: Error (auth/project-not-found)"

**Penyebab:** projectId tidak sesuai

**Solusi:**
1. Cek projectId di Firebase Console
2. Update projectId di `firebase.js` sesuai dengan yang di Console

---

**Copy config dari Firebase Console, lalu paste ke `src/config/firebase.js`!** ✅

