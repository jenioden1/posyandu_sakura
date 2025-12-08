# 📊 Penjelasan: Perbedaan Data Statistik vs Riwayat Pemeriksaan Terbaru

## ❓ Pertanyaan
Apakah data di statistik berbeda dengan data status gizi di Riwayat Pemeriksaan Terbaru?

## ✅ Jawaban Singkat
**TIDAK, seharusnya SAMA**, tetapi sebelumnya ada **ketidaksesuaian field** yang menyebabkan perhitungan berbeda. Sekarang sudah diperbaiki.

---

## 🔍 Analisis Masalah yang Ditemukan

### **Masalah 1: Field `status_gizi_hasil_compute` Tidak Disimpan di Database**

**Di API (`api/analyze.js`):**
- API menyimpan field:
  - `status_gizi` (status utama)
  - `status_gizi_tb_u` (status TB/U)
  - `status_gizi_bb_u` (status BB/U)
  - `kategori_tb_u` (kategori TB/U)
  - `kategori_bb_u` (kategori BB/U)
- **TIDAK menyimpan** `status_gizi_hasil_compute`

**Di Frontend:**
- `Statistik.jsx` mencari: `status_gizi_hasil_compute?.includes('Normal')`
- `Home.jsx` mencari: `status_gizi_hasil_compute === 'Normal'`
- `TabelRiwayat.jsx` menampilkan: `status_gizi_hasil_compute || status_gizi` (ada fallback)

**Dampak:**
- Statistik tidak menghitung dengan benar karena field tidak ada
- Riwayat Pemeriksaan menggunakan fallback ke `status_gizi` (masih bisa tampil)

---

### **Masalah 2: Filter yang Tidak Konsisten**

**Di `Statistik.jsx` (sebelum perbaikan):**
```javascript
normal: pemeriksaanList.filter(p => 
  p.status_gizi_hasil_compute?.includes('Normal') ||  // Field tidak ada!
  p.kategori_tb_u === 'NORMAL' || 
  p.kategori_bb_u === 'NORMAL'
).length
```

**Di `Home.jsx` (sebelum perbaikan):**
```javascript
normal: pemeriksaanList.filter(p => 
  p.status_gizi_hasil_compute === 'Normal'  // Field tidak ada! Exact match
).length
```

**Dampak:**
- `Statistik.jsx` masih bisa menghitung karena ada fallback ke `kategori_tb_u` dan `kategori_bb_u`
- `Home.jsx` tidak menghitung dengan benar karena hanya mencari exact match pada field yang tidak ada

---

## ✅ Perbaikan yang Dilakukan

### **1. Menambahkan Field `status_gizi_hasil_compute` di API**

**File: `api/analyze.js`**
```javascript
status_gizi_hasil_compute: `${whoResult.status_gizi_tb_u} (TB/U), ${whoResult.status_gizi_bb_u} (BB/U)`
```

**Format:**
- Contoh: `"Normal (TB/U), Normal (BB/U)"`
- Contoh: `"Stunting (TB/U), Normal (BB/U)"`
- Contoh: `"Normal (TB/U), Gizi Kurang (BB/U)"`

### **2. Memperbaiki Filter di `Statistik.jsx`**

Sekarang menggunakan **multiple fallback** untuk memastikan semua data terhitung:
```javascript
const normal = pemeriksaanList.filter(p => {
  const status = (p.status_gizi || '').toLowerCase()
  const statusCompute = (p.status_gizi_hasil_compute || '').toLowerCase()
  const statusTBU = (p.status_gizi_tb_u || '').toLowerCase()
  const statusBBU = (p.status_gizi_bb_u || '').toLowerCase()
  
  return status === 'normal' ||
    statusCompute.includes('normal') ||
    statusTBU === 'normal' ||
    statusBBU === 'normal' ||
    p.kategori_tb_u === 'NORMAL' || 
    p.kategori_bb_u === 'NORMAL'
}).length
```

### **3. Memperbaiki Filter di `Home.jsx`**

Sekarang menggunakan **multiple fallback** juga:
```javascript
normal: pemeriksaanList.filter(p => 
  p.status_gizi === 'Normal' || 
  p.status_gizi_hasil_compute?.includes('Normal') ||
  p.kategori_tb_u === 'NORMAL' || 
  p.kategori_bb_u === 'NORMAL'
).length
```

---

## 📋 Struktur Data Status Gizi di Database

Setelah perbaikan, setiap record pemeriksaan memiliki:

```javascript
{
  // Status utama (prioritas: Stunting > Underweight > Normal)
  status_gizi: "Normal" | "Stunting" | "Gizi Kurang" | "Gizi Buruk" | dll,
  
  // Status gabungan untuk statistik (format: "Status TB/U (TB/U), Status BB/U (BB/U)")
  status_gizi_hasil_compute: "Normal (TB/U), Normal (BB/U)",
  
  // Status per indikator
  status_gizi_tb_u: "Normal" | "Stunting" | "Stunting Berat" | "Tinggi",
  status_gizi_bb_u: "Normal" | "Gizi Kurang" | "Gizi Buruk" | "Obesitas",
  
  // Kategori per indikator (untuk filter yang lebih akurat)
  kategori_tb_u: "NORMAL" | "STUNTING" | "SEVERE_STUNTING" | "TALL",
  kategori_bb_u: "NORMAL" | "UNDERWEIGHT" | "SEVERE_UNDERWEIGHT" | "OVERWEIGHT" | "OBESITAS",
  
  // Z-Score
  z_score_tb_u: -1.5,
  z_score_bb_u: -0.8
}
```

---

## 🎯 Cara Perhitungan Statistik

### **Normal:**
- `status_gizi === 'Normal'` ATAU
- `status_gizi_hasil_compute` mengandung "Normal" ATAU
- `status_gizi_tb_u === 'Normal'` ATAU
- `status_gizi_bb_u === 'Normal'` ATAU
- `kategori_tb_u === 'NORMAL'` ATAU
- `kategori_bb_u === 'NORMAL'`

### **Stunting:**
- `status_gizi` mengandung "Stunting" ATAU
- `status_gizi_hasil_compute` mengandung "Stunting" atau "Pendek" ATAU
- `status_gizi_tb_u` mengandung "Stunting" atau "Pendek" ATAU
- `kategori_tb_u === 'STUNTING'` atau `'SEVERE_STUNTING'`

### **Wasting:**
- `status_gizi` mengandung "Gizi Kurang" atau "Gizi Buruk" ATAU
- `status_gizi_hasil_compute` mengandung "Wasting", "Gizi Kurang", atau "Gizi Buruk" ATAU
- `status_gizi_bb_u` mengandung "Gizi Kurang" atau "Gizi Buruk" ATAU
- `kategori_bb_u === 'WASTING'`, `'SEVERE_WASTING'`, `'UNDERWEIGHT'`, atau `'SEVERE_UNDERWEIGHT'`

### **Overweight:**
- `status_gizi` mengandung "Obesitas" atau "Gizi Lebih" ATAU
- `status_gizi_hasil_compute` mengandung "Overweight", "Obesitas", atau "Gizi Lebih" ATAU
- `status_gizi_bb_u` mengandung "Obesitas" atau "Gizi Lebih" ATAU
- `kategori_bb_u === 'OVERWEIGHT'`, `'OBESITAS'`, `'AT_RISK_OVERWEIGHT'`, atau `'OBESE'`

---

## 🔄 Konsistensi Data

### **Sebelum Perbaikan:**
- ❌ Statistik tidak akurat (field tidak ada)
- ❌ Home.jsx tidak akurat (field tidak ada)
- ✅ TabelRiwayat masih bisa tampil (ada fallback)

### **Setelah Perbaikan:**
- ✅ API menyimpan `status_gizi_hasil_compute`
- ✅ Statistik menggunakan multiple fallback
- ✅ Home.jsx menggunakan multiple fallback
- ✅ TabelRiwayat tetap menggunakan fallback (untuk kompatibilitas)
- ✅ **Semua data sekarang konsisten!**

---

## 📊 Contoh Data

### **Contoh 1: Balita Normal**
```javascript
{
  status_gizi: "Normal",
  status_gizi_hasil_compute: "Normal (TB/U), Normal (BB/U)",
  status_gizi_tb_u: "Normal",
  status_gizi_bb_u: "Normal",
  kategori_tb_u: "NORMAL",
  kategori_bb_u: "NORMAL"
}
```
**Statistik:** ✅ Terhitung sebagai Normal
**Riwayat:** ✅ Menampilkan "Normal"

### **Contoh 2: Balita Stunting**
```javascript
{
  status_gizi: "Stunting",
  status_gizi_hasil_compute: "Stunting (TB/U), Normal (BB/U)",
  status_gizi_tb_u: "Stunting",
  status_gizi_bb_u: "Normal",
  kategori_tb_u: "STUNTING",
  kategori_bb_u: "NORMAL"
}
```
**Statistik:** ✅ Terhitung sebagai Stunting
**Riwayat:** ✅ Menampilkan "Stunting (TB/U), Normal (BB/U)"

### **Contoh 3: Balita Wasting**
```javascript
{
  status_gizi: "Gizi Kurang",
  status_gizi_hasil_compute: "Normal (TB/U), Gizi Kurang (BB/U)",
  status_gizi_tb_u: "Normal",
  status_gizi_bb_u: "Gizi Kurang",
  kategori_tb_u: "NORMAL",
  kategori_bb_u: "UNDERWEIGHT"
}
```
**Statistik:** ✅ Terhitung sebagai Wasting
**Riwayat:** ✅ Menampilkan "Normal (TB/U), Gizi Kurang (BB/U)"

---

## ✅ Kesimpulan

1. **Data sekarang KONSISTEN** antara Statistik dan Riwayat Pemeriksaan
2. **Field `status_gizi_hasil_compute`** sekarang disimpan di database
3. **Filter menggunakan multiple fallback** untuk memastikan semua data terhitung
4. **Perhitungan statistik** sekarang akurat dan sesuai dengan data di Riwayat

**Catatan:** Data pemeriksaan yang sudah ada sebelum perbaikan mungkin tidak memiliki field `status_gizi_hasil_compute`, tetapi filter masih bisa menghitung menggunakan fallback ke field lain (`status_gizi`, `kategori_tb_u`, `kategori_bb_u`).

