# 📊 Penjelasan: Di Mana Standar WHO Digunakan?

## 🎯 Lokasi Implementasi Standar WHO

### **1. API Backend (`api/analyze.js`)**

Standar WHO diimplementasikan di **Vercel Serverless Function** (`api/analyze.js`):

#### **A. Data Referensi WHO**
```javascript
// File: api/analyze.js
// Fungsi: getWHOReferenceTB_U() dan getWHOReferenceBB_U()

// Data referensi WHO untuk TB/U (Tinggi Badan per Umur)
const referenceData = {
  6: { L: { median: 67.6, sd: 2.1 }, P: { median: 65.7, sd: 2.0 } },
  12: { L: { median: 75.7, sd: 2.5 }, P: { median: 74.0, sd: 2.4 } },
  18: { L: { median: 82.3, sd: 2.8 }, P: { median: 80.7, sd: 2.7 } },
  24: { L: { median: 87.8, sd: 3.1 }, P: { median: 86.8, sd: 3.0 } },
  36: { L: { median: 96.1, sd: 3.6 }, P: { median: 95.1, sd: 3.5 } },
};

// Data referensi WHO untuk BB/U (Berat Badan per Umur)
const referenceData = {
  6: { L: { median: 7.9, sd: 0.9 }, P: { median: 7.3, sd: 0.8 } },
  12: { L: { median: 9.6, sd: 1.0 }, P: { median: 8.9, sd: 0.9 } },
  18: { L: { median: 11.0, sd: 1.1 }, P: { median: 10.2, sd: 1.0 } },
  24: { L: { median: 12.2, sd: 1.2 }, P: { median: 11.5, sd: 1.1 } },
  36: { L: { median: 14.3, sd: 1.4 }, P: { median: 13.9, sd: 1.3 } },
};
```

**Catatan Penting:**
- ⚠️ Data ini adalah **SIMULASI** untuk keperluan tugas kuliah
- ⚠️ Untuk produksi, harus menggunakan **data WHO Growth Standards yang sesungguhnya**
- ✅ Format sudah sesuai standar WHO: `{ umur_bulan: { L: { median, sd }, P: { median, sd } } }`

#### **B. Perhitungan Z-Score (Formula WHO)**
```javascript
// File: api/analyze.js
// Fungsi: calculateZScore()

function calculateZScore(nilaiRiil, median, sd) {
  if (!sd || sd === 0) return null;
  return (nilaiRiil - median) / sd;  // ✅ Formula standar WHO
}
```

#### **C. Klasifikasi Status Gizi (Standar WHO)**
```javascript
// File: api/analyze.js
// Fungsi: classifyStatusGizi()

// TB/U (Tinggi Badan per Umur)
if (zScore < -3) return { status: 'Stunting Berat', kategori: 'SEVERE_STUNTING' };
if (zScore < -2) return { status: 'Stunting', kategori: 'STUNTING' };
if (zScore >= -2 && zScore <= 2) return { status: 'Normal', kategori: 'NORMAL' };
if (zScore > 2) return { status: 'Tinggi', kategori: 'TALL' };

// BB/U (Berat Badan per Umur)
if (zScore < -3) return { status: 'Gizi Buruk', kategori: 'SEVERE_UNDERWEIGHT' };
if (zScore < -2) return { status: 'Gizi Kurang', kategori: 'UNDERWEIGHT' };
if (zScore >= -2 && zScore <= 2) return { status: 'Normal', kategori: 'NORMAL' };
if (zScore > 2 && zScore <= 3) return { status: 'Overweight', kategori: 'OVERWEIGHT' };
if (zScore > 3) return { status: 'Obesitas', kategori: 'OBESE' };
```

**✅ Semua klasifikasi menggunakan standar WHO Z-Score cut-off points.**

---

## 🔍 Mengapa Banyak yang "Risiko Berlebihan"?

### **Masalah yang Ditemukan:**

1. **Data Referensi WHO Terbatas**
   - Data referensi hanya untuk umur: 6, 12, 18, 24, 36 bulan
   - Untuk umur lain, menggunakan **interpolasi linear** atau **fallback**
   - Fallback mungkin tidak akurat untuk umur tertentu

2. **SD (Standard Deviation) Terlalu Kecil**
   - SD yang terlalu kecil akan membuat Z-Score lebih besar
   - Contoh: Jika SD = 0.9 dan berat = 12 kg, median = 9.6 kg
   - Z-Score = (12 - 9.6) / 0.9 = 2.67 → **Overweight** (Z > 2)
   - Jika SD lebih besar (misalnya 1.5), Z-Score = 1.6 → **Normal**

3. **Data Referensi Belum Lengkap**
   - WHO Growth Standards memiliki data untuk **setiap bulan** (0-60 bulan)
   - Sistem saat ini hanya punya data untuk 5 titik umur
   - Interpolasi linear mungkin tidak akurat

---

## ✅ Solusi yang Perlu Dilakukan

### **1. Perbaiki Data Referensi WHO**

**Saat Ini (Simulasi):**
```javascript
// Hanya 5 titik umur
6: { L: { median: 7.9, sd: 0.9 }, ... },
12: { L: { median: 9.6, sd: 1.0 }, ... },
18: { L: { median: 11.0, sd: 1.1 }, ... },
24: { L: { median: 12.2, sd: 1.2 }, ... },
36: { L: { median: 14.3, sd: 1.4 }, ... },
```

**Seharusnya (WHO Growth Standards):**
- Data untuk **setiap bulan** dari 0-60 bulan
- Atau minimal data untuk setiap 3 bulan (0, 3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36, 39, 42, 45, 48, 51, 54, 57, 60)
- SD yang lebih akurat sesuai WHO Growth Standards

### **2. Verifikasi SD (Standard Deviation)**

SD yang terlalu kecil akan menyebabkan:
- Z-Score lebih besar → lebih banyak yang masuk kategori Overweight/Obesitas
- Z-Score lebih kecil → lebih banyak yang masuk kategori Gizi Kurang/Stunting

**Contoh:**
- Berat = 12 kg, Median = 9.6 kg
- Jika SD = 0.9 → Z = 2.67 → **Overweight**
- Jika SD = 1.5 → Z = 1.6 → **Normal**

### **3. Gunakan Data WHO yang Sesungguhnya**

Untuk produksi, gunakan:
- **WHO Growth Standards Tables** (dapat diunduh dari WHO website)
- Atau gunakan library seperti `who-growth-charts` (jika tersedia)
- Data lengkap untuk setiap bulan dengan SD yang akurat

---

## 📊 Cara Kerja Standar WHO di Sistem Ini

### **Flow Perhitungan:**

1. **Input Data:**
   - Berat badan (kg)
   - Tinggi badan (cm)
   - Tanggal lahir
   - Jenis kelamin (L/P)

2. **Hitung Umur Bulan:**
   ```javascript
   umur_bulan = (hari_sekarang - hari_lahir) / 30.4375
   ```

3. **Ambil Data Referensi WHO:**
   ```javascript
   refTB_U = getWHOReferenceTB_U(umur_bulan, jenis_kelamin)
   refBB_U = getWHOReferenceBB_U(umur_bulan, jenis_kelamin)
   ```

4. **Hitung Z-Score:**
   ```javascript
   z_score_tb_u = (tinggi - refTB_U.median) / refTB_U.sd
   z_score_bb_u = (berat - refBB_U.median) / refBB_U.sd
   ```

5. **Klasifikasi Status Gizi:**
   ```javascript
   status = classifyStatusGizi(z_score, type)
   ```

6. **Simpan ke Database:**
   - Status gizi TB/U
   - Status gizi BB/U
   - Status gizi utama (prioritas)
   - Z-Score TB/U dan BB/U

---

## ⚠️ Catatan Penting

### **1. Data Referensi Saat Ini adalah Simulasi**
- Data referensi WHO di sistem ini adalah **simulasi** untuk keperluan tugas kuliah
- Untuk produksi, **harus menggunakan data WHO Growth Standards yang sesungguhnya**
- Data WHO yang sesungguhnya dapat diunduh dari: https://www.who.int/tools/child-growth-standards

### **2. Mengapa Banyak "Overweight"?**
Kemungkinan penyebab:
- **SD terlalu kecil** → Z-Score lebih besar → lebih mudah masuk kategori Overweight
- **Data referensi terbatas** → interpolasi mungkin tidak akurat
- **Input data berat badan terlalu besar** → perlu verifikasi satuan (kg, bukan gram)

### **3. Rekomendasi Perbaikan**
1. ✅ Gunakan data WHO Growth Standards yang lengkap (setiap bulan)
2. ✅ Verifikasi SD sesuai dengan WHO Growth Standards
3. ✅ Validasi input data (pastikan satuan benar: kg untuk berat, cm untuk tinggi)
4. ✅ Tambahkan logging untuk debugging Z-Score calculation

---

## 📝 Lokasi File Standar WHO

| File | Fungsi | Deskripsi |
|------|--------|-----------|
| `api/analyze.js` | `getWHOReferenceTB_U()` | Data referensi WHO untuk TB/U |
| `api/analyze.js` | `getWHOReferenceBB_U()` | Data referensi WHO untuk BB/U |
| `api/analyze.js` | `calculateZScore()` | Perhitungan Z-Score (formula WHO) |
| `api/analyze.js` | `classifyStatusGizi()` | Klasifikasi status gizi (cut-off WHO) |
| `api/analyze.js` | `computeStatusGiziWHO()` | Komputasi lengkap status gizi |

---

## ✅ Kesimpulan

**Standar WHO digunakan di:**
- ✅ **API Backend** (`api/analyze.js`) - Vercel Serverless Function
- ✅ **Perhitungan Z-Score** menggunakan formula WHO
- ✅ **Klasifikasi status gizi** menggunakan cut-off points WHO
- ✅ **Data referensi** menggunakan format WHO (median, SD)

**Mengapa banyak "Overweight"?**
- Kemungkinan: **SD terlalu kecil** atau **data referensi terbatas**
- Solusi: Gunakan data WHO Growth Standards yang lengkap dan akurat

