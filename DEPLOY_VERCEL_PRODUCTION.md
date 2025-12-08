# 🚀 Panduan Deploy ke Vercel Production

Checklist lengkap sebelum dan langkah deploy ke Vercel Production.

---

## ✅ Checklist Sebelum Deploy

### 1. **Environment Variables di Vercel Dashboard**
   - [ ] Login ke [Vercel Dashboard](https://vercel.com/dashboard)
   - [ ] Pilih project → **Settings** → **Environment Variables**
   - [ ] Pastikan `FIREBASE_SERVICE_ACCOUNT` sudah di-set untuk:
     - ✅ **Development**
     - ✅ **Preview** 
     - ✅ **Production**
   - [ ] Value: JSON service account (satu baris, tanpa newline)

### 2. **Firebase Configuration**
   - [ ] `src/config/firebase.js` sudah diisi dengan Firebase config yang benar
   - [ ] Firebase Authentication sudah diaktifkan
   - [ ] Firestore Database sudah dibuat dan aktif
   - [ ] Firestore Rules sudah di-set (minimal untuk development)

### 3. **Kode & Dependencies**
   - [ ] Semua file API di folder `api/` sudah lengkap
   - [ ] `package.json` dependencies sudah benar (firebase, firebase-admin, dll)
   - [ ] Tidak ada error di console saat `npm run build`
   - [ ] File `.env.local` ada (untuk local dev, tidak perlu di-commit)

### 4. **Testing Lokal**
   - [ ] `npm run dev` berjalan tanpa error
   - [ ] `vercel dev` berjalan tanpa error
   - [ ] Endpoint `/api/analyze` bisa di-test via Postman/curl
   - [ ] Login admin dan orang tua berfungsi
   - [ ] CRUD balita dan orang tua berfungsi

---

## 📦 Langkah Deploy ke Vercel Production

### **Opsi 1: Deploy via Vercel CLI (Cepat)**

1. **Install Vercel CLI** (jika belum):
   ```bash
   npm i -g vercel
   ```

2. **Login ke Vercel**:
   ```bash
   vercel login
   ```

3. **Link project** (jika belum):
   ```bash
   vercel link
   ```
   - Pilih project yang sudah ada, atau buat project baru

4. **Deploy ke Production**:
   ```bash
   vercel --prod
   ```
   - Vercel akan build dan deploy
   - URL production akan muncul di terminal

---

### **Opsi 2: Deploy via GitHub (Direkomendasikan - Auto Deploy)**

#### A. Setup GitHub Repository

1. **Inisialisasi Git** (jika belum):
   ```bash
   git init
   git add .
   git commit -m "chore: ready for production deployment"
   ```

2. **Buat Repository di GitHub**:
   - Buka [GitHub](https://github.com/new)
   - Buat repository baru (misal: `posyandu-sakura`)
   - Jangan centang "Initialize with README"

3. **Push ke GitHub**:
   ```bash
   git remote add origin https://github.com/USERNAME/posyandu-sakura.git
   git branch -M main
   git push -u origin main
   ```

#### B. Connect GitHub ke Vercel

1. **Import Project di Vercel**:
   - Buka [Vercel Dashboard](https://vercel.com/dashboard)
   - Klik **Add New Project**
   - Pilih repository GitHub yang baru dibuat
   - Klik **Import**

2. **Configure Project Settings**:
   - **Framework Preset**: Vite (otomatis terdeteksi)
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build` (otomatis)
   - **Output Directory**: `dist` (otomatis)
   - **Install Command**: `npm install` (otomatis)

3. **Set Environment Variables**:
   - Di halaman project settings, klik **Environment Variables**
   - Tambahkan:
     - **Key**: `FIREBASE_SERVICE_ACCOUNT`
     - **Value**: Paste JSON service account (satu baris)
     - **Environment**: Pilih semua (Development, Preview, Production)
   - Klik **Save**

4. **Deploy**:
   - Klik **Deploy**
   - Vercel akan otomatis build dan deploy
   - Tunggu hingga selesai (biasanya 2-3 menit)

#### C. Auto Deploy Setup (Opsional)

- Setiap kali push ke branch `main`, Vercel akan otomatis deploy ke production
- Untuk preview, push ke branch lain akan membuat preview deployment

---

## 🔍 Verifikasi Setelah Deploy

### 1. **Cek URL Production**
   - URL akan muncul di Vercel Dashboard
   - Format: `https://posyandu-sakura.vercel.app` (atau custom domain)

### 2. **Test Endpoint API**
   ```bash
   curl -X POST https://YOUR-APP.vercel.app/api/analyze \
     -H "Content-Type: application/json" \
     -d '{
       "nama": "Test",
       "tgl_lahir": "2023-01-15",
       "jenis_kelamin": "L",
       "berat": 10.5,
       "tinggi": 80,
       "lila": 14,
       "lingkar_kepala": 46
     }'
   ```
   - Harus return `{"status":"success",...}`

### 3. **Test Frontend**
   - Buka URL production di browser
   - Test login admin dan orang tua
   - Test CRUD balita dan orang tua
   - Test form pemeriksaan

### 4. **Cek Logs di Vercel**
   - Vercel Dashboard → Project → **Logs**
   - Pastikan tidak ada error

---

## 🐛 Troubleshooting

### Error: "Missing env FIREBASE_SERVICE_ACCOUNT"
**Solusi:**
1. Pastikan env variable sudah di-set di Vercel Dashboard
2. Pastikan dipilih untuk **Production** environment
3. Redeploy setelah set env variable

### Error: "Firebase: Error (auth/configuration-not-found)"
**Solusi:**
1. Pastikan `src/config/firebase.js` sudah diisi dengan config yang benar
2. Pastikan Firebase project ID sama dengan service account project_id
3. Pastikan Firebase Authentication sudah diaktifkan

### Error: "The query requires an index"
**Solusi:**
- Sudah di-handle dengan menghapus `orderBy` dari queries
- Jika masih muncul, klik link di error untuk create index di Firebase Console

### Build Error: "Module not found"
**Solusi:**
1. Pastikan semua dependencies ada di `package.json`
2. Hapus `node_modules` dan `.vercel`, lalu:
   ```bash
   npm install
   vercel --prod
   ```

---

## 📝 Catatan Penting

1. **Environment Variables**:
   - Jangan commit `.env.local` ke Git
   - Pastikan `FIREBASE_SERVICE_ACCOUNT` sudah di-set di Vercel Dashboard

2. **Firestore Rules**:
   - Untuk development: gunakan rules yang permisif
   - Untuk production: perketat rules sesuai kebutuhan

3. **Custom Domain** (Opsional):
   - Vercel Dashboard → Project → Settings → Domains
   - Tambahkan custom domain jika diperlukan

4. **Monitoring**:
   - Gunakan Vercel Analytics untuk monitoring
   - Cek logs secara berkala

---

## ✅ Checklist Setelah Deploy

- [ ] URL production bisa diakses
- [ ] Frontend tampil dengan benar
- [ ] Login admin berfungsi
- [ ] Login orang tua berfungsi
- [ ] CRUD balita berfungsi
- [ ] CRUD orang tua berfungsi
- [ ] Form pemeriksaan berfungsi
- [ ] API `/api/analyze` return success
- [ ] Data tersimpan di Firestore
- [ ] Dashboard menampilkan data dengan benar
- [ ] Halaman Statistik menampilkan data
- [ ] Halaman Tentang bisa diakses

---

## 🎉 Selesai!

Setelah semua checklist terpenuhi, project Anda sudah siap digunakan di production!

**URL Production**: `https://YOUR-APP.vercel.app`

---

## 📞 Support

Jika ada masalah:
1. Cek logs di Vercel Dashboard
2. Cek Firebase Console untuk error
3. Test endpoint dengan Postman/curl
4. Pastikan semua environment variables sudah benar

