# 🏥 Sistem Automasi Analisis Status Gizi Posyandu
## Frontend Application

Final Project Mata Kuliah **Cloud Computing**

## 🎯 Deskripsi Project

Aplikasi frontend untuk sistem manajemen data balita di Posyandu menggunakan:
- **React.js** untuk user interface
- **Google Cloud Firestore** untuk penyimpanan data
- **Tailwind CSS + daisyUI** untuk styling

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Firebase
1. Buat project di [Firebase Console](https://console.firebase.google.com/)
2. Enable Firestore Database
3. Copy konfigurasi Firebase ke `src/config/firebase.js`

### 3. Run Development
```bash
npm run dev
```

Aplikasi akan berjalan di `http://localhost:3000`

---

## 📋 Fitur

- ✅ Input data balita (Nama, NIK, Tanggal Lahir, dll)
- ✅ Input data pemeriksaan bulanan (BB, TB, LILA, Lingkar Kepala)
- ✅ Realtime display data balita dan pemeriksaan
- ✅ Dashboard monitoring
- ✅ Manajemen data balita

---

## 🏗️ Arsitektur

```
┌─────────────────┐
│   Frontend      │  React.js + Tailwind CSS
│   (React App)   │  Vite + React Router
└────────┬────────┘
         │ Firebase SDK
         ▼
┌─────────────────┐
│   Database      │  Google Cloud Firestore
│   (Data Store)  │  NoSQL Database
└─────────────────┘
```

## 🛠️ Tech Stack

- **Frontend:** React.js (Vite) + Tailwind CSS + daisyUI
- **Database:** Google Cloud Firestore
- **State Management:** React Hooks
- **Routing:** React Router DOM

---

## 📁 Struktur Project

```
src/
├── components/          # Komponen React
│   └── balita/         # Komponen untuk data balita
├── pages/              # Halaman aplikasi
├── config/             # Konfigurasi (Firebase)
├── contexts/           # React Context (Auth)
└── layouts/            # Layout components
```

---

## 🔐 Firebase Setup

1. Buka [Firebase Console](https://console.firebase.google.com/)
2. Buat project baru atau pilih project yang sudah ada
3. Enable **Firestore Database**
4. Set Firestore Rules untuk development:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if true;
       }
     }
   }
   ```
5. Copy konfigurasi Firebase ke `src/config/firebase.js`

---

## 🎓 Kategori Cloud Computing

| Layer | Technology | Category |
|-------|-----------|----------|
| Frontend | React (Vite) | **PaaS** |
| Database | Firestore | **DBaaS** |

---

**Dibuat dengan React.js + Tailwind CSS + Firebase** 🚀
