# 🧪 Contoh Input untuk Testing Klasifikasi WHO

Dokumen ini berisi contoh input data untuk testing setiap klasifikasi status gizi berdasarkan standar WHO (Z-Score).

---

## 📋 Cara Testing

1. **Buka halaman Admin** → **Manajemen Balita** → Tab **Pemeriksaan**
2. **Pilih balita** dari dropdown
3. **Isi data** sesuai contoh di bawah
4. **Submit** dan lihat hasil klasifikasi
5. **Cek di Riwayat** dan **Statistik** untuk memastikan konsistensi

---

## 🎯 Klasifikasi Status Gizi WHO

### **TB/U (Tinggi Badan per Umur) - Stunting**

#### 1. **Normal** (Z-Score: -2 sampai +2)
```json
{
  "nama": "Anak Normal",
  "tgl_lahir": "2023-01-15",  // Umur ~12 bulan
  "jenis_kelamin": "L",
  "berat": 9.5,  // kg
  "tinggi": 75.0  // cm
}
```
**Hasil yang Diharapkan:**
- `status_gizi_tb_u`: "Normal"
- `kategori_tb_u`: "NORMAL"
- `z_score_tb_u`: antara -2 dan +2

---

#### 2. **Stunting** (Z-Score: -3 sampai -2)
```json
{
  "nama": "Anak Stunting",
  "tgl_lahir": "2023-01-15",  // Umur ~12 bulan
  "jenis_kelamin": "L",
  "berat": 8.0,  // kg (lebih ringan)
  "tinggi": 70.0  // cm (lebih pendek dari normal)
}
```
**Hasil yang Diharapkan:**
- `status_gizi_tb_u`: "Stunting"
- `kategori_tb_u`: "STUNTING"
- `z_score_tb_u`: antara -3 dan -2
- `status_gizi`: "Stunting" (prioritas)

---

#### 3. **Stunting Berat** (Z-Score: < -3)
```json
{
  "nama": "Anak Stunting Berat",
  "tgl_lahir": "2023-01-15",  // Umur ~12 bulan
  "jenis_kelamin": "L",
  "berat": 7.0,  // kg (sangat ringan)
  "tinggi": 65.0  // cm (sangat pendek)
}
```
**Hasil yang Diharapkan:**
- `status_gizi_tb_u`: "Stunting Berat"
- `kategori_tb_u`: "SEVERE_STUNTING"
- `z_score_tb_u`: < -3
- `status_gizi`: "Stunting Berat"

---

#### 4. **Tinggi** (Z-Score: > +2)
```json
{
  "nama": "Anak Tinggi",
  "tgl_lahir": "2023-01-15",  // Umur ~12 bulan
  "jenis_kelamin": "L",
  "berat": 11.0,  // kg
  "tinggi": 82.0  // cm (lebih tinggi dari normal)
}
```
**Hasil yang Diharapkan:**
- `status_gizi_tb_u`: "Tinggi"
- `kategori_tb_u`: "TALL"
- `z_score_tb_u`: > +2

---

### **BB/U (Berat Badan per Umur) - Wasting/Overweight**

#### 5. **Normal** (Z-Score: -2 sampai +2)
```json
{
  "nama": "Anak Normal BB",
  "tgl_lahir": "2023-01-15",  // Umur ~12 bulan
  "jenis_kelamin": "L",
  "berat": 9.5,  // kg
  "tinggi": 75.0  // cm
}
```
**Hasil yang Diharapkan:**
- `status_gizi_bb_u`: "Normal"
- `kategori_bb_u`: "NORMAL"
- `z_score_bb_u`: antara -2 dan +2

---

#### 6. **Gizi Kurang** (Z-Score: -3 sampai -2)
```json
{
  "nama": "Anak Gizi Kurang",
  "tgl_lahir": "2023-01-15",  // Umur ~12 bulan
  "jenis_kelamin": "L",
  "berat": 7.5,  // kg (lebih ringan dari normal)
  "tinggi": 75.0  // cm (tinggi normal)
}
```
**Hasil yang Diharapkan:**
- `status_gizi_bb_u`: "Gizi Kurang"
- `kategori_bb_u`: "UNDERWEIGHT"
- `z_score_bb_u`: antara -3 dan -2
- `status_gizi`: "Gizi Kurang" (jika TB/U normal)

---

#### 7. **Gizi Buruk** (Z-Score: < -3)
```json
{
  "nama": "Anak Gizi Buruk",
  "tgl_lahir": "2023-01-15",  // Umur ~12 bulan
  "jenis_kelamin": "L",
  "berat": 6.0,  // kg (sangat ringan)
  "tinggi": 75.0  // cm
}
```
**Hasil yang Diharapkan:**
- `status_gizi_bb_u`: "Gizi Buruk"
- `kategori_bb_u`: "SEVERE_UNDERWEIGHT"
- `z_score_bb_u`: < -3
- `status_gizi`: "Gizi Buruk"

---

#### 8. **Overweight** (Z-Score: +2 sampai +3)
```json
{
  "nama": "Anak Overweight",
  "tgl_lahir": "2023-01-15",  // Umur ~12 bulan
  "jenis_kelamin": "L",
  "berat": 12.0,  // kg (lebih berat dari normal)
  "tinggi": 75.0  // cm
}
```
**Hasil yang Diharapkan:**
- `status_gizi_bb_u`: "Overweight"
- `kategori_bb_u`: "OVERWEIGHT"
- `z_score_bb_u`: antara +2 dan +3

---

#### 9. **Obesitas** (Z-Score: > +3)
```json
{
  "nama": "Anak Obesitas",
  "tgl_lahir": "2023-01-15",  // Umur ~12 bulan
  "jenis_kelamin": "L",
  "berat": 14.0,  // kg (sangat berat)
  "tinggi": 75.0  // cm
}
```
**Hasil yang Diharapkan:**
- `status_gizi_bb_u`: "Obesitas"
- `kategori_bb_u`: "OBESE"
- `z_score_bb_u`: > +3
- `status_gizi`: "Obesitas"

---

## 🔄 Kombinasi Status (Prioritas)

### **10. Stunting + Normal BB** (Prioritas: Stunting)
```json
{
  "nama": "Anak Stunting Normal BB",
  "tgl_lahir": "2023-01-15",  // Umur ~12 bulan
  "jenis_kelamin": "L",
  "berat": 9.5,  // kg (normal)
  "tinggi": 70.0  // cm (pendek - stunting)
}
```
**Hasil yang Diharapkan:**
- `status_gizi_tb_u`: "Stunting"
- `status_gizi_bb_u`: "Normal"
- `status_gizi`: "Stunting" (prioritas)
- `status_gizi_hasil_compute`: "Stunting (TB/U), Normal (BB/U)"

---

### **11. Normal TB + Gizi Kurang** (Prioritas: Gizi Kurang)
```json
{
  "nama": "Anak Normal TB Gizi Kurang",
  "tgl_lahir": "2023-01-15",  // Umur ~12 bulan
  "jenis_kelamin": "L",
  "berat": 7.5,  // kg (ringan - gizi kurang)
  "tinggi": 75.0  // cm (normal)
}
```
**Hasil yang Diharapkan:**
- `status_gizi_tb_u`: "Normal"
- `status_gizi_bb_u`: "Gizi Kurang"
- `status_gizi`: "Gizi Kurang" (prioritas)
- `status_gizi_hasil_compute`: "Normal (TB/U), Gizi Kurang (BB/U)"

---

### **12. Stunting + Gizi Kurang** (Prioritas: Stunting)
```json
{
  "nama": "Anak Stunting Gizi Kurang",
  "tgl_lahir": "2023-01-15",  // Umur ~12 bulan
  "jenis_kelamin": "L",
  "berat": 7.0,  // kg (ringan)
  "tinggi": 68.0  // cm (pendek)
}
```
**Hasil yang Diharapkan:**
- `status_gizi_tb_u`: "Stunting"
- `status_gizi_bb_u`: "Gizi Kurang"
- `status_gizi`: "Stunting" (prioritas: Stunting > Underweight)
- `status_gizi_hasil_compute`: "Stunting (TB/U), Gizi Kurang (BB/U)"

---

## 👧 Contoh untuk Perempuan

### **13. Perempuan Normal**
```json
{
  "nama": "Anak Perempuan Normal",
  "tgl_lahir": "2023-01-15",  // Umur ~12 bulan
  "jenis_kelamin": "P",
  "berat": 8.9,  // kg
  "tinggi": 74.0  // cm
}
```

### **14. Perempuan Stunting**
```json
{
  "nama": "Anak Perempuan Stunting",
  "tgl_lahir": "2023-01-15",  // Umur ~12 bulan
  "jenis_kelamin": "P",
  "berat": 7.5,  // kg
  "tinggi": 68.0  // cm (pendek)
}
```

---

## 📊 Variasi Umur

### **15. Bayi 6 Bulan (Laki-laki)**
```json
{
  "nama": "Bayi 6 Bulan",
  "tgl_lahir": "2024-07-15",  // Umur 6 bulan
  "jenis_kelamin": "L",
  "berat": 7.5,  // kg
  "tinggi": 67.0  // cm
}
```

### **16. Balita 24 Bulan (Laki-laki)**
```json
{
  "nama": "Balita 24 Bulan",
  "tgl_lahir": "2022-01-15",  // Umur 24 bulan
  "jenis_kelamin": "L",
  "berat": 12.0,  // kg
  "tinggi": 87.0  // cm
}
```

### **17. Balita 36 Bulan (Laki-laki)**
```json
{
  "nama": "Balita 36 Bulan",
  "tgl_lahir": "2021-01-15",  // Umur 36 bulan
  "jenis_kelamin": "L",
  "berat": 14.0,  // kg
  "tinggi": 95.0  // cm
}
```

---

## ✅ Checklist Testing

Setelah input data, pastikan:

- [ ] **Data tersimpan** di Firestore collection `pemeriksaan`
- [ ] **Field lengkap**: `status_gizi`, `status_gizi_tb_u`, `status_gizi_bb_u`, `status_gizi_hasil_compute`, `kategori_tb_u`, `kategori_bb_u`, `z_score_tb_u`, `z_score_bb_u`
- [ ] **Status di Riwayat** sesuai dengan klasifikasi WHO
- [ ] **Statistik terupdate**: Normal, Stunting, Wasting, Overweight terhitung dengan benar
- [ ] **Filter tanggal** di Laporan berfungsi
- [ ] **Export Excel** menampilkan data lengkap

---

## 🔍 Verifikasi di Database

Setelah testing, cek di Firestore Console:

1. Buka collection `pemeriksaan`
2. Cek record terbaru
3. Pastikan field berikut ada dan benar:
   - `status_gizi_hasil_compute`: "Normal (TB/U), Normal (BB/U)"
   - `status_gizi_tb_u`: "Normal" | "Stunting" | "Stunting Berat" | "Tinggi"
   - `status_gizi_bb_u`: "Normal" | "Gizi Kurang" | "Gizi Buruk" | "Obesitas"
   - `kategori_tb_u`: "NORMAL" | "STUNTING" | "SEVERE_STUNTING" | "TALL"
   - `kategori_bb_u`: "NORMAL" | "UNDERWEIGHT" | "SEVERE_UNDERWEIGHT" | "OVERWEIGHT" | "OBESE"
   - `z_score_tb_u`: angka (contoh: -1.5)
   - `z_score_bb_u`: angka (contoh: -0.8)

---

## 📝 Catatan Penting

1. **Data Referensi WHO**: Data yang digunakan adalah **simulasi**. Untuk produksi, gunakan data WHO Growth Standards yang sesungguhnya.

2. **Umur Bulan**: Sistem menghitung umur bulan dari `tgl_lahir` vs hari ini. Pastikan `tgl_lahir` benar.

3. **Satuan**:
   - Berat Badan: **kilogram (kg)**
   - Tinggi Badan: **centimeter (cm)**
   - LILA: **centimeter (cm)**
   - Lingkar Kepala: **centimeter (cm)**

4. **Prioritas Status Gizi**:
   - Stunting > Underweight > Normal
   - Jika TB/U Stunting, maka `status_gizi` = "Stunting"
   - Jika TB/U Normal tapi BB/U Underweight, maka `status_gizi` = "Gizi Kurang"

5. **Konsistensi**: Pastikan data di Statistik, Riwayat, dan Laporan sama dengan menggunakan filter yang konsisten.

---

## 🎯 Testing Scenario Lengkap

### **Scenario 1: Testing Normal**
1. Input data contoh #1 (Normal)
2. Cek di Riwayat → harus muncul "Normal"
3. Cek di Statistik → Normal +1
4. Cek di Laporan → Normal +1

### **Scenario 2: Testing Stunting**
1. Input data contoh #2 (Stunting)
2. Cek di Riwayat → harus muncul "Stunting"
3. Cek di Statistik → Stunting +1
4. Cek di Laporan → Stunting +1

### **Scenario 3: Testing Filter Tanggal**
1. Input data dengan tanggal hari ini
2. Set filter tanggal: mulai = hari ini, akhir = hari ini
3. Cek di Laporan → harus muncul data hari ini
4. Set filter tanggal: mulai = kemarin, akhir = kemarin
5. Cek di Laporan → tidak ada data (karena data hari ini)

---

## 🐛 Troubleshooting

### **Masalah: Status tidak sesuai**
- Pastikan `tgl_lahir` benar (format: YYYY-MM-DD)
- Pastikan `jenis_kelamin` benar (L atau P)
- Pastikan `berat` dan `tinggi` dalam satuan yang benar (kg dan cm)

### **Masalah: Filter tanggal tidak bekerja**
- Pastikan `tgl_ukur` diisi saat input pemeriksaan
- Cek format tanggal di database (harus bisa di-parse sebagai Date)

### **Masalah: Statistik tidak update**
- Refresh halaman
- Cek apakah data sudah tersimpan di Firestore
- Pastikan filter menggunakan field yang benar

---

## 📞 Support

Jika ada masalah saat testing:
1. Cek console browser untuk error
2. Cek Firestore Console untuk data yang tersimpan
3. Cek Network tab untuk response dari API `/api/analyze`
4. Pastikan semua field wajib sudah diisi

