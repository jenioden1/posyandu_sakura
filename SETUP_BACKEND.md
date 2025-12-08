# Setup Backend Lengkap (Firebase + Vercel Serverless)

Panduan detail dari nol (belum ada project Firebase) sampai backend siap.

---

## A. Buat Project Firebase
1. Buka https://console.firebase.google.com/ dan login.
2. Klik **Add project / Create project**.
3. Isi nama proyek (misal `posyandu-sakura`), matikan Google Analytics (opsional), lanjut hingga selesai.

## B. Tambah App Web & Salin Config
1. Di Firebase Console, buka proyek → **Project settings** → bagian **Your apps**.
2. Klik ikon **</> (Web)** → isi App nickname (mis. `posyandu-web`) → Register app.
3. Salin objek `firebaseConfig` (apiKey, authDomain, projectId, dll) untuk frontend.

## C. Enable Firestore + Rules Dev
1. Sidebar kiri → **Firestore Database** → **Create database**.
2. Mode: **Start in test mode** (development), region: pilih terdekat (mis. asia-southeast2).
3. Setelah aktif, buka tab **Rules** dan set (mode dev):
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if true;
       }
     }
   }
   ```
   Klik **Publish**. (Untuk produksi, perketat nanti.)

## D. Generate Service Account (untuk Backend)
1. Project Settings → tab **Service accounts**.
2. Klik **Generate new private key** → unduh JSON.
3. Simpan lokal, jangan di-commit.

## E. Set Environment Variable
### E.1 Lokal (`.env.local`)
- Buat file `.env.local` di root proyek, isi satu baris (tanpa newline di tengah):
  ```
  FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"...","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"...","client_id":"...","token_uri":"https://oauth2.googleapis.com/token",...}
  ```
### E.2 Vercel Dashboard
1. Vercel → Project → Settings → **Environment Variables**.
2. Key: `FIREBASE_SERVICE_ACCOUNT`
3. Value: paste JSON service account satu baris.
4. Environment: Development + Preview + Production → Save.

## F. Install Dependency Backend
```
npm install firebase-admin
```

## G. Tambah Serverless Function `api/analyze.js`
```javascript
import admin from 'firebase-admin';

// Init Firebase Admin (idempotent)
if (!admin.apps.length) {
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!serviceAccountJson) throw new Error('Missing env FIREBASE_SERVICE_ACCOUNT');
  const serviceAccount = JSON.parse(serviceAccountJson);
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}

const db = admin.firestore();

// Helpers
function calculateUmurBulan(tglLahirStr) {
  const lahir = new Date(tglLahirStr);
  const now = new Date();
  const days = (now - lahir) / (1000 * 60 * 60 * 24);
  return Math.round((days / 30.4375) * 100) / 100; // ~30.44 hari/bulan
}

function computeStatusGiziDummy({ berat, tinggi }) {
  if (!berat || !tinggi) return { status: 'Tidak diketahui', note: 'Input kurang' };
  const ratio = berat / tinggi; // kg per cm (dummy)
  if (ratio < 0.12) return { status: 'Gizi Kurang', note: 'Rasio BB/TB rendah' };
  if (ratio > 0.18) return { status: 'Risiko Kelebihan', note: 'Rasio BB/TB tinggi' };
  return { status: 'Gizi Baik', note: 'Rasio BB/TB normal' };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ status: 'error', message: 'Method not allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    const { nama, tgl_lahir, jenis_kelamin, berat, tinggi, lila = null, lingkar_kepala = null } = body;

    if (!nama || !tgl_lahir || !jenis_kelamin || !berat || !tinggi) {
      return res.status(400).json({ status: 'error', message: 'Field wajib belum lengkap' });
    }

    const umur_bulan = calculateUmurBulan(tgl_lahir);
    const { status: status_gizi, note } = computeStatusGiziDummy({ berat, tinggi });

    const docData = {
      nama,
      tgl_lahir,
      jenis_kelamin,
      berat,
      tinggi,
      lila,
      lingkar_kepala,
      umur_bulan,
      status_gizi,
      catatan_perhitungan: note,
      created_at: admin.firestore.FieldValue.serverTimestamp(),
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    };

    await db.collection('pemeriksaan').add(docData);

    return res.status(200).json({
      status: 'success',
      message: 'Data saved & analyzed',
      data: { status_gizi, umur_bulan },
    });
  } catch (err) {
    console.error('Error in /api/analyze:', err);
    return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
}
```

## H. Update Frontend Firebase Config
- Buka `src/config/firebase.js`, isi `firebaseConfig` dengan data dari langkah B:
  ```javascript
  const firebaseConfig = {
    apiKey: "....",
    authDomain: "...",
    projectId: "...",
    storageBucket: "...",
    messagingSenderId: "...",
    appId: "...",
    measurementId: "..." // jika ada
  };
  ```

## I. Jalankan Lokal
- Pastikan `.env.local` terisi.
- Backend: `vercel dev --listen 3001`
- Frontend: `npm run dev` → buka `http://localhost:3000`
- Tes endpoint: `POST http://localhost:3001/api/analyze` dengan body contoh:
  ```json
  {
    "nama": "Uji",
    "tgl_lahir": "2023-01-15",
    "jenis_kelamin": "L",
    "berat": 10.5,
    "tinggi": 80,
    "lila": 14,
    "lingkar_kepala": 46
  }
  ```

## J. Deploy ke Vercel
- Pastikan env `FIREBASE_SERVICE_ACCOUNT` sudah di Vercel.
- Deploy: `vercel --prod` (atau via Git).
- Uji produksi: `POST https://<your-vercel-app>/api/analyze`.

## K. Penyesuaian Lanjutan
- Ganti `computeStatusGiziDummy` dengan perhitungan Z-Score WHO sesungguhnya.
- Perketat Firestore Rules untuk produksi.
- Tambah validasi satuan (kg/cm), logging, dan error handling sesuai kebutuhan.
