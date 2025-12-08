# 🔧 Fix: Database Tidak Masuk Setelah Deploy via GitHub

## ❌ Masalah
Setelah update via GitHub dan deploy otomatis di Vercel, data tidak masuk ke database Firestore.

## 🔍 Penyebab
Environment variable `FIREBASE_SERVICE_ACCOUNT` **tidak ter-set di Vercel Dashboard** untuk environment **Production**.

**PENTING**: `.env.local` hanya untuk development lokal. Vercel production **TIDAK** membaca `.env.local`!

---

## ✅ Solusi Lengkap

### **Langkah 1: Set Environment Variable di Vercel Dashboard**

1. **Login ke Vercel Dashboard**
   - Buka: https://vercel.com/dashboard
   - Login dengan akun GitHub/Vercel Anda

2. **Pilih Project**
   - Klik project `posyandu-sakura` (atau nama project Anda)

3. **Buka Settings → Environment Variables**
   - Klik tab **Settings**
   - Scroll ke bagian **Environment Variables**
   - Klik **Add New**

4. **Tambahkan Variable**
   - **Key**: `FIREBASE_SERVICE_ACCOUNT`
   - **Value**: Paste JSON service account (satu baris, tanpa newline)
     ```
     {"type":"service_account","project_id":"...","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"...","client_id":"...","token_uri":"https://oauth2.googleapis.com/token",...}
     ```
   - **Environment**: **PENTING!** Centang semua:
     - ✅ **Production**
     - ✅ **Preview**
     - ✅ **Development**
   - Klik **Save**

5. **Verifikasi**
   - Pastikan variable muncul di list
   - Pastikan semua environment (Production, Preview, Development) ter-centang

---

### **Langkah 2: Redeploy Setelah Set Environment Variable**

Setelah set environment variable, **WAJIB redeploy** agar perubahan ter-apply.

#### **Opsi A: Via Vercel Dashboard (Paling Mudah)**
1. Buka project di Vercel Dashboard
2. Klik tab **Deployments**
3. Klik **...** (three dots) pada deployment terbaru
4. Pilih **Redeploy**
5. Pastikan environment: **Production**
6. Klik **Redeploy**
7. Tunggu build selesai (2-3 menit)

#### **Opsi B: Via GitHub (Trigger Deploy Baru)**
1. Buat commit kosong untuk trigger deploy:
   ```bash
   git commit --allow-empty -m "chore: trigger redeploy after env update"
   git push origin main
   ```
2. Vercel akan otomatis deploy ulang dengan env variable baru

#### **Opsi C: Via Vercel CLI**
```bash
vercel --prod
```

---

### **Langkah 3: Verifikasi Environment Variable Ter-Apply**

1. **Cek di Vercel Dashboard**
   - Project → Settings → Environment Variables
   - Pastikan `FIREBASE_SERVICE_ACCOUNT` ada dan ter-centang untuk Production

2. **Test Endpoint API**
   ```bash
   curl -X POST https://YOUR-APP.vercel.app/api/analyze \
     -H "Content-Type: application/json" \
     -d '{
       "nama": "Test",
       "tgl_lahir": "2023-01-15",
       "jenis_kelamin": "L",
       "berat": 10.5,
       "tinggi": 80
     }'
   ```
   - Jika return `{"status":"success",...}` → **Berhasil!**
   - Jika return error `Missing env FIREBASE_SERVICE_ACCOUNT` → Env belum ter-apply, perlu redeploy

3. **Cek Logs di Vercel**
   - Project → **Logs**
   - Cek apakah ada error `Missing env FIREBASE_SERVICE_ACCOUNT`
   - Jika ada, berarti env belum ter-set atau belum redeploy

---

## 🎯 Cara Ambil Value FIREBASE_SERVICE_ACCOUNT

### **Dari File Service Account JSON**

1. **Buka file service account JSON** (yang diunduh dari Firebase Console)
   - Biasanya namanya: `posyandu-sakura-xxxxx-firebase-adminsdk-xxxxx.json`

2. **Convert ke Satu Baris**
   - Buka file JSON
   - Copy semua isinya
   - **Hapus semua newline** (enter/line break)
   - Pastikan menjadi satu baris panjang
   - Paste ke Vercel Dashboard

   **Contoh format yang benar:**
   ```
   {"type":"service_account","project_id":"posyandu-sakura-4cf92","private_key_id":"abc123...","private_key":"-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n","client_email":"firebase-adminsdk-xxxxx@posyandu-sakura-4cf92.iam.gserviceaccount.com","client_id":"123456789","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40posyandu-sakura-4cf92.iam.gserviceaccount.com"}
   ```

3. **Atau dari `.env.local` (jika sudah ada)**
   - Buka file `.env.local` di project
   - Copy value setelah `FIREBASE_SERVICE_ACCOUNT=`
   - Paste ke Vercel Dashboard (tanpa `FIREBASE_SERVICE_ACCOUNT=`)

---

## ⚠️ Kesalahan Umum

### ❌ **Kesalahan 1: Hanya Set untuk Development**
- **Salah**: Hanya centang Development
- **Benar**: Centang **semua** (Production, Preview, Development)

### ❌ **Kesalahan 2: Tidak Redeploy Setelah Set Env**
- **Salah**: Set env variable tapi tidak redeploy
- **Benar**: **WAJIB redeploy** setelah set env variable

### ❌ **Kesalahan 3: Format JSON Salah**
- **Salah**: Ada newline di tengah JSON
- **Benar**: Satu baris panjang tanpa newline

### ❌ **Kesalahan 4: Mengira `.env.local` Ter-Read di Production**
- **Salah**: Mengira Vercel membaca `.env.local` dari GitHub
- **Benar**: Vercel **TIDAK** membaca `.env.local`. Harus set manual di Dashboard!

---

## 🔍 Debugging

### **Cek Apakah Env Variable Ter-Apply**

1. **Via Vercel CLI** (jika sudah install):
   ```bash
   vercel env pull .env.production
   cat .env.production
   ```
   - Harus muncul `FIREBASE_SERVICE_ACCOUNT=...`

2. **Via Function Logs**:
   - Tambahkan log di `api/analyze.js`:
     ```javascript
     console.log('FIREBASE_SERVICE_ACCOUNT exists:', !!process.env.FIREBASE_SERVICE_ACCOUNT);
     ```
   - Deploy ulang
   - Cek logs di Vercel Dashboard → Logs
   - Harus muncul `FIREBASE_SERVICE_ACCOUNT exists: true`

3. **Test Endpoint**:
   - Jika endpoint return error `Missing env FIREBASE_SERVICE_ACCOUNT` → Env belum ter-apply
   - Jika endpoint return success → Env sudah ter-apply

---

## ✅ Checklist Final

Setelah set environment variable, pastikan:

- [ ] `FIREBASE_SERVICE_ACCOUNT` sudah di-set di Vercel Dashboard
- [ ] Semua environment (Production, Preview, Development) ter-centang
- [ ] Format JSON sudah benar (satu baris, tanpa newline)
- [ ] Sudah **redeploy** setelah set env variable
- [ ] Test endpoint `/api/analyze` return success
- [ ] Data masuk ke Firestore setelah test
- [ ] Tidak ada error di Vercel Logs

---

## 🎉 Setelah Fix

Setelah semua langkah di atas, database seharusnya sudah bisa menerima data dari production.

**Test lagi:**
1. Buka aplikasi production
2. Login sebagai admin
3. Tambah data balita
4. Lakukan pemeriksaan
5. Cek Firestore Console → data harus muncul

---

## 📞 Masih Error?

Jika masih error setelah semua langkah di atas:

1. **Cek Vercel Logs**:
   - Project → Logs
   - Cari error terkait `FIREBASE_SERVICE_ACCOUNT`

2. **Cek Firebase Console**:
   - Pastikan service account masih aktif
   - Pastikan Firestore sudah diaktifkan

3. **Cek Format JSON**:
   - Pastikan tidak ada typo
   - Pastikan satu baris tanpa newline

4. **Coba Set Ulang**:
   - Hapus env variable di Vercel
   - Set ulang dengan format yang benar
   - Redeploy

