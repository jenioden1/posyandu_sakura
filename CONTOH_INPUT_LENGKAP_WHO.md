# 📋 Contoh Input Data Lengkap - WHO Classification

## 🎯 Contoh 1: Balita dengan Status Normal

### **Data Orang Tua:**
```json
{
  "username": "budi.santoso@email.com",
  "password": "password123",
  "nama_ayah": "Budi Santoso",
  "nama_ibu": "Siti Rahayu",
  "alamat": "Jl. Merdeka No. 45, RT.03/RW.05, Cikalang, Kec. Tawang, Kab. Tasikmalaya, Jawa Barat 46115",
  "no_telp": "081234567890"
}
```

### **Data Balita:**
```json
{
  "nama_anak": "Ahmad Budi Santoso",
  "nik": "3207151206010001",
  "jenis_kelamin": "L",
  "tgl_lahir": "2023-06-15",
  "alamat": "Jl. Merdeka No. 45, RT.03/RW.05, Cikalang, Kec. Tawang, Kab. Tasikmalaya, Jawa Barat 46115",
  "bb": null,
  "tb": null,
  "ll": null,
  "lk": null,
  "pelayanan": null
}
```

### **Pemeriksaan Ke-1 (Umur ~30 bulan):**
**Tanggal:** `2024-07-15` (sekitar 2.5 tahun setelah lahir)

⚠️ **CATATAN PENTING:** Sistem menghitung umur dari **tanggal sekarang**, bukan dari tanggal pemeriksaan. Jadi jika Anda input data ini di bulan Juli 2024, umur akan dihitung dari tgl_lahir sampai Juli 2024.

```json
{
  "nama": "Ahmad Budi Santoso",
  "tgl_lahir": "2022-01-15",
  "jenis_kelamin": "L",
  "berat": 12.5,
  "tinggi": 88.0,
  "lila": 15.5,
  "lingkar_kepala": 49.0,
  "balita_id": "[ID_BALITA]",
  "tgl_ukur": "2024-07-15"
}
```

**Hasil Perhitungan WHO (Estimasi untuk umur 30 bulan):**
- Umur: ~30 bulan (interpolasi antara 24-36 bulan)
- Median BB/U (L, 30 bulan): ~13.0 kg (interpolasi), SD: ~1.3
- Median TB/U (L, 30 bulan): ~91.0 cm (interpolasi), SD: ~3.3
- Z-Score BB/U: (12.5 - 13.0) / 1.3 = **-0.38** → **Normal**
- Z-Score TB/U: (88.0 - 91.0) / 3.3 = **-0.91** → **Normal**
- **Status Gizi Utama:** Normal

### **Pemeriksaan Ke-2 (Umur ~30 bulan):**
**Tanggal:** `2024-06-15` (1 bulan sebelum pemeriksaan pertama)

```json
{
  "nama": "Ahmad Budi Santoso",
  "tgl_lahir": "2022-01-15",
  "jenis_kelamin": "L",
  "berat": 12.2,
  "tinggi": 87.5,
  "lila": 15.3,
  "lingkar_kepala": 48.8,
  "balita_id": "[ID_BALITA]",
  "tgl_ukur": "2024-06-15"
}
```

**Hasil Perhitungan WHO (Estimasi untuk umur 29 bulan):**
- Umur: ~29 bulan (interpolasi antara 24-36 bulan)
- Median BB/U (L, 29 bulan): ~12.8 kg, SD: ~1.28
- Median TB/U (L, 29 bulan): ~90.5 cm, SD: ~3.25
- Z-Score BB/U: (12.2 - 12.8) / 1.28 = **-0.47** → **Normal**
- Z-Score TB/U: (87.5 - 90.5) / 3.25 = **-0.92** → **Normal**
- **Status Gizi Utama:** Normal

---

## ⚠️ **MASALAH YANG DITEMUKAN:**

Dari gambar yang Anda tunjukkan, status gizi menunjukkan **"Stunting Berat (TB/U), Gizi Kurang (BB/U)"** padahal seharusnya Normal. Ini terjadi karena:

1. **Data referensi WHO terbatas:** Sistem hanya punya data untuk umur 6, 12, 18, 24, 36 bulan. Untuk umur 29-30 bulan, sistem menggunakan interpolasi yang mungkin tidak akurat.

2. **Nilai input terlalu rendah:** Untuk umur 29-30 bulan (Laki-laki):
   - Median TB/U seharusnya ~90-91 cm
   - Median BB/U seharusnya ~12.8-13.0 kg
   - Jika tinggi hanya 75-77 cm dan berat 9.8-10.2 kg, ini sangat rendah untuk umur 30 bulan!

3. **Perhitungan umur:** Sistem menghitung umur dari tanggal sekarang, bukan dari tanggal pemeriksaan. Jadi jika Anda input data di bulan Juli 2024 dengan tgl_lahir 2022-01-15, umur akan ~30 bulan.

### **Solusi: Perbaiki Data Input**

Untuk mendapatkan status **Normal** pada umur 29-30 bulan, gunakan nilai yang sesuai:

**Pemeriksaan Ke-1 (Normal):**
```json
{
  "nama": "Ahmad Budi Santoso",
  "tgl_lahir": "2022-01-15",
  "jenis_kelamin": "L",
  "berat": 13.0,  // Sesuai median untuk umur 30 bulan
  "tinggi": 91.0,  // Sesuai median untuk umur 30 bulan
  "lila": 15.5,
  "lingkar_kepala": 49.0,
  "balita_id": "[ID_BALITA]",
  "tgl_ukur": "2024-07-15"
}
```

**Pemeriksaan Ke-2 (Normal):**
```json
{
  "nama": "Ahmad Budi Santoso",
  "tgl_lahir": "2022-01-15",
  "jenis_kelamin": "L",
  "berat": 12.8,  // Sesuai median untuk umur 29 bulan
  "tinggi": 90.5,  // Sesuai median untuk umur 29 bulan
  "lila": 15.3,
  "lingkar_kepala": 48.8,
  "balita_id": "[ID_BALITA]",
  "tgl_ukur": "2024-06-15"
}
```

---

## 🎯 Contoh 2: Balita dengan Status Stunting

### **Data Orang Tua:**
```json
{
  "username": "sari.dewi@email.com",
  "password": "password123",
  "nama_ayah": "Dedi Kurniawan",
  "nama_ibu": "Sari Dewi",
  "alamat": "Jl. Cendrawasih No. 12, RT.01/RW.03, Cikalang, Kec. Tawang, Kab. Tasikmalaya, Jawa Barat 46115",
  "no_telp": "081987654321"
}
```

### **Data Balita:**
```json
{
  "nama_anak": "Putri Sari Dewi",
  "nik": "3207151206020002",
  "jenis_kelamin": "P",
  "tgl_lahir": "2023-01-10",
  "alamat": "Jl. Cendrawasih No. 12, RT.01/RW.03, Cikalang, Kec. Tawang, Kab. Tasikmalaya, Jawa Barat 46115",
  "bb": null,
  "tb": null,
  "ll": null,
  "lk": null,
  "pelayanan": null
}
```

### **Pemeriksaan Ke-1 (Umur 12 bulan):**
**Tanggal:** `2024-01-10` (tepat 1 tahun setelah lahir)

```json
{
  "nama": "Putri Sari Dewi",
  "tgl_lahir": "2023-01-10",
  "jenis_kelamin": "P",
  "berat": 7.5,
  "tinggi": 68.0,
  "lila": 12.5,
  "lingkar_kepala": 44.0,
  "balita_id": "[ID_BALITA]",
  "tgl_ukur": "2024-01-10"
}
```

**Hasil Perhitungan WHO (Estimasi):**
- Umur: 12 bulan
- Median BB/U (P, 12 bulan): 8.9 kg, SD: 0.9
- Median TB/U (P, 12 bulan): 74.0 cm, SD: 2.4
- Z-Score BB/U: (7.5 - 8.9) / 0.9 = **-1.56** → **Normal** (masih dalam range -2 sampai +2)
- Z-Score TB/U: (68.0 - 74.0) / 2.4 = **-2.5** → **Stunting** (Z < -2)
- **Status Gizi Utama:** Stunting (prioritas: Stunting > Underweight)

### **Pemeriksaan Ke-2 (Umur 18 bulan):**
**Tanggal:** `2024-07-10` (6 bulan setelah pemeriksaan pertama)

```json
{
  "nama": "Putri Sari Dewi",
  "tgl_lahir": "2023-01-10",
  "jenis_kelamin": "P",
  "berat": 8.2,
  "tinggi": 75.0,
  "lila": 13.0,
  "lingkar_kepala": 45.0,
  "balita_id": "[ID_BALITA]",
  "tgl_ukur": "2024-07-10"
}
```

**Hasil Perhitungan WHO (Estimasi):**
- Umur: 18 bulan
- Median BB/U (P, 18 bulan): 10.2 kg, SD: 1.0
- Median TB/U (P, 18 bulan): 80.7 cm, SD: 2.7
- Z-Score BB/U: (8.2 - 10.2) / 1.0 = **-2.0** → **Gizi Kurang** (Z = -2, batas)
- Z-Score TB/U: (75.0 - 80.7) / 2.7 = **-2.11** → **Stunting** (Z < -2)
- **Status Gizi Utama:** Stunting (prioritas: Stunting > Underweight)

---

## 🎯 Contoh 3: Balita dengan Status Gizi Kurang (Underweight)

### **Data Orang Tua:**
```json
{
  "username": "andi.prasetyo@email.com",
  "password": "password123",
  "nama_ayah": "Andi Prasetyo",
  "nama_ibu": "Rina Wati",
  "alamat": "Jl. Pahlawan No. 88, RT.04/RW.06, Cikalang, Kec. Tawang, Kab. Tasikmalaya, Jawa Barat 46115",
  "no_telp": "082345678901"
}
```

### **Data Balita:**
```json
{
  "nama_anak": "Budi Andi Prasetyo",
  "nik": "3207151206030003",
  "jenis_kelamin": "L",
  "tgl_lahir": "2022-12-20",
  "alamat": "Jl. Pahlawan No. 88, RT.04/RW.06, Cikalang, Kec. Tawang, Kab. Tasikmalaya, Jawa Barat 46115",
  "bb": null,
  "tb": null,
  "ll": null,
  "lk": null,
  "pelayanan": "Vitamin A"
}
```

### **Pemeriksaan Ke-1 (Umur 24 bulan):**
**Tanggal:** `2024-12-20` (tepat 2 tahun setelah lahir)

```json
{
  "nama": "Budi Andi Prasetyo",
  "tgl_lahir": "2022-12-20",
  "jenis_kelamin": "L",
  "berat": 10.5,
  "tinggi": 85.0,
  "lila": 13.5,
  "lingkar_kepala": 48.0,
  "balita_id": "[ID_BALITA]",
  "tgl_ukur": "2024-12-20"
}
```

**Hasil Perhitungan WHO (Estimasi):**
- Umur: 24 bulan
- Median BB/U (L, 24 bulan): 12.2 kg, SD: 1.2
- Median TB/U (L, 24 bulan): 87.8 cm, SD: 3.1
- Z-Score BB/U: (10.5 - 12.2) / 1.2 = **-1.42** → **Normal** (masih dalam range -2 sampai +2)
- Z-Score TB/U: (85.0 - 87.8) / 3.1 = **-0.90** → **Normal**
- **Status Gizi Utama:** Normal

### **Pemeriksaan Ke-2 (Umur 25 bulan):**
**Tanggal:** `2025-01-20` (1 bulan setelah pemeriksaan pertama)

```json
{
  "nama": "Budi Andi Prasetyo",
  "tgl_lahir": "2022-12-20",
  "jenis_kelamin": "L",
  "berat": 10.8,
  "tinggi": 86.0,
  "lila": 13.6,
  "lingkar_kepala": 48.2,
  "balita_id": "[ID_BALITA]",
  "tgl_ukur": "2025-01-20"
}
```

**Hasil Perhitungan WHO (Estimasi):**
- Umur: 25 bulan (interpolasi antara 24-36 bulan)
- Median BB/U (L, 25 bulan): ~12.4 kg, SD: ~1.25
- Median TB/U (L, 25 bulan): ~88.5 cm, SD: ~3.2
- Z-Score BB/U: (10.8 - 12.4) / 1.25 = **-1.28** → **Normal**
- Z-Score TB/U: (86.0 - 88.5) / 3.2 = **-0.78** → **Normal**
- **Status Gizi Utama:** Normal

**Catatan:** Untuk mendapatkan status "Gizi Kurang", perlu Z-Score BB/U < -2. Contoh di bawah ini:

### **Pemeriksaan Ke-2 (Alternatif - Gizi Kurang):**
**Tanggal:** `2025-01-20`

```json
{
  "nama": "Budi Andi Prasetyo",
  "tgl_lahir": "2022-12-20",
  "jenis_kelamin": "L",
  "berat": 9.5,
  "tinggi": 85.5,
  "lila": 13.0,
  "lingkar_kepala": 47.8,
  "balita_id": "[ID_BALITA]",
  "tgl_ukur": "2025-01-20"
}
```

**Hasil Perhitungan WHO (Estimasi):**
- Umur: 25 bulan
- Z-Score BB/U: (9.5 - 12.4) / 1.25 = **-2.32** → **Gizi Kurang** (Z < -2)
- Z-Score TB/U: (85.5 - 88.5) / 3.2 = **-0.94** → **Normal**
- **Status Gizi Utama:** Gizi Kurang

---

## 🎯 Contoh 4: Balita dengan Status Overweight

### **Data Orang Tua:**
```json
{
  "username": "lina.sari@email.com",
  "password": "password123",
  "nama_ayah": "Rudi Hermawan",
  "nama_ibu": "Lina Sari",
  "alamat": "Jl. Sudirman No. 33, RT.02/RW.04, Cikalang, Kec. Tawang, Kab. Tasikmalaya, Jawa Barat 46115",
  "no_telp": "083456789012"
}
```

### **Data Balita:**
```json
{
  "nama_anak": "Rina Lina Sari",
  "nik": "3207151206040004",
  "jenis_kelamin": "P",
  "tgl_lahir": "2021-06-01",
  "alamat": "Jl. Sudirman No. 33, RT.02/RW.04, Cikalang, Kec. Tawang, Kab. Tasikmalaya, Jawa Barat 46115",
  "bb": null,
  "tb": null,
  "ll": null,
  "lk": null,
  "pelayanan": null
}
```

### **Pemeriksaan Ke-1 (Umur 36 bulan):**
**Tanggal:** `2024-06-01` (tepat 3 tahun setelah lahir)

```json
{
  "nama": "Rina Lina Sari",
  "tgl_lahir": "2021-06-01",
  "jenis_kelamin": "P",
  "berat": 16.5,
  "tinggi": 95.0,
  "lila": 16.0,
  "lingkar_kepala": 50.0,
  "balita_id": "[ID_BALITA]",
  "tgl_ukur": "2024-06-01"
}
```

**Hasil Perhitungan WHO (Estimasi):**
- Umur: 36 bulan
- Median BB/U (P, 36 bulan): 13.9 kg, SD: 1.3
- Median TB/U (P, 36 bulan): 95.1 cm, SD: 3.5
- Z-Score BB/U: (16.5 - 13.9) / 1.3 = **+2.0** → **Overweight** (Z = +2, batas)
- Z-Score TB/U: (95.0 - 95.1) / 3.5 = **-0.03** → **Normal**
- **Status Gizi Utama:** Overweight

### **Pemeriksaan Ke-2 (Umur 37 bulan):**
**Tanggal:** `2024-07-01` (1 bulan setelah pemeriksaan pertama)

```json
{
  "nama": "Rina Lina Sari",
  "tgl_lahir": "2021-06-01",
  "jenis_kelamin": "P",
  "berat": 17.0,
  "tinggi": 95.5,
  "lila": 16.2,
  "lingkar_kepala": 50.2,
  "balita_id": "[ID_BALITA]",
  "tgl_ukur": "2024-07-01"
}
```

**Hasil Perhitungan WHO (Estimasi):**
- Umur: 37 bulan (interpolasi antara 36-60 bulan)
- Median BB/U (P, 37 bulan): ~14.1 kg, SD: ~1.35
- Median TB/U (P, 37 bulan): ~95.3 cm, SD: ~3.55
- Z-Score BB/U: (17.0 - 14.1) / 1.35 = **+2.15** → **Overweight** (Z > +2 dan <= +3)
- Z-Score TB/U: (95.5 - 95.3) / 3.55 = **+0.06** → **Normal**
- **Status Gizi Utama:** Overweight

---

## 🎯 Contoh 5: Balita dengan Status Obesitas

### **Data Orang Tua:**
```json
{
  "username": "dian.kartika@email.com",
  "password": "password123",
  "nama_ayah": "Ahmad Fauzi",
  "nama_ibu": "Dian Kartika",
  "alamat": "Jl. Gatot Subroto No. 77, RT.05/RW.07, Cikalang, Kec. Tawang, Kab. Tasikmalaya, Jawa Barat 46115",
  "no_telp": "084567890123"
}
```

### **Data Balita:**
```json
{
  "nama_anak": "Fauzi Ahmad Fauzi",
  "nik": "3207151206050005",
  "jenis_kelamin": "L",
  "tgl_lahir": "2020-03-15",
  "alamat": "Jl. Gatot Subroto No. 77, RT.05/RW.07, Cikalang, Kec. Tawang, Kab. Tasikmalaya, Jawa Barat 46115",
  "bb": null,
  "tb": null,
  "ll": null,
  "lk": null,
  "pelayanan": null
}
```

### **Pemeriksaan Ke-1 (Umur 48 bulan / 4 tahun):**
**Tanggal:** `2024-03-15` (tepat 4 tahun setelah lahir)

```json
{
  "nama": "Fauzi Ahmad Fauzi",
  "tgl_lahir": "2020-03-15",
  "jenis_kelamin": "L",
  "berat": 22.0,
  "tinggi": 105.0,
  "lila": 18.0,
  "lingkar_kepala": 52.0,
  "balita_id": "[ID_BALITA]",
  "tgl_ukur": "2024-03-15"
}
```

**Hasil Perhitungan WHO (Estimasi):**
- Umur: 48 bulan (4 tahun)
- Median BB/U (L, 48 bulan): ~16.5 kg (interpolasi), SD: ~1.8
- Median TB/U (L, 48 bulan): ~102.0 cm (interpolasi), SD: ~4.0
- Z-Score BB/U: (22.0 - 16.5) / 1.8 = **+3.06** → **Obesitas** (Z > +3)
- Z-Score TB/U: (105.0 - 102.0) / 4.0 = **+0.75** → **Normal**
- **Status Gizi Utama:** Obesitas

### **Pemeriksaan Ke-2 (Umur 49 bulan):**
**Tanggal:** `2024-04-15` (1 bulan setelah pemeriksaan pertama)

```json
{
  "nama": "Fauzi Ahmad Fauzi",
  "tgl_lahir": "2020-03-15",
  "jenis_kelamin": "L",
  "berat": 22.5,
  "tinggi": 105.5,
  "lila": 18.2,
  "lingkar_kepala": 52.2,
  "balita_id": "[ID_BALITA]",
  "tgl_ukur": "2024-04-15"
}
```

**Hasil Perhitungan WHO (Estimasi):**
- Umur: 49 bulan
- Median BB/U (L, 49 bulan): ~16.7 kg, SD: ~1.85
- Median TB/U (L, 49 bulan): ~102.3 cm, SD: ~4.05
- Z-Score BB/U: (22.5 - 16.7) / 1.85 = **+3.14** → **Obesitas** (Z > +3)
- Z-Score TB/U: (105.5 - 102.3) / 4.05 = **+0.79** → **Normal**
- **Status Gizi Utama:** Obesitas

---

## 📊 Ringkasan Klasifikasi WHO

| Status | Z-Score BB/U | Z-Score TB/U | Badge Color |
|--------|--------------|--------------|-------------|
| **Normal** | -2 ≤ Z ≤ +2 | -2 ≤ Z ≤ +2 | 🟢 Hijau |
| **Stunting** | - | Z < -2 | 🔴 Merah |
| **Stunting Berat** | - | Z < -3 | 🔴 Merah |
| **Gizi Kurang** | -3 ≤ Z < -2 | - | 🟡 Kuning |
| **Gizi Buruk** | Z < -3 | - | 🔴 Merah |
| **Overweight** | +2 < Z ≤ +3 | - | 🟡 Kuning |
| **Obesitas** | Z > +3 | - | 🟡 Kuning |
| **Tinggi** | - | Z > +2 | 🔵 Biru |

---

## 📝 Catatan Penting

1. **Data Referensi WHO:** Data median dan SD yang digunakan adalah simulasi. Untuk produksi, gunakan data WHO Growth Standards yang sesungguhnya.

2. **Format Tanggal:** Gunakan format ISO 8601 (YYYY-MM-DD) untuk konsistensi.

3. **Satuan:**
   - Berat Badan (BB): **kilogram (kg)**
   - Tinggi Badan (TB): **centimeter (cm)**
   - Lingkar Lengan (LL/LILA): **centimeter (cm)**
   - Lingkar Kepala (LK): **centimeter (cm)**

4. **Relasi Data:**
   - Setiap balita harus memiliki `orang_tua_uid` yang mengacu ke ID akun orang tua
   - Setiap pemeriksaan harus memiliki `balita_id` yang mengacu ke ID balita

5. **Validasi:**
   - NIK minimal 10 digit
   - Tanggal lahir tidak boleh di masa depan
   - Umur maksimal 60 bulan (5 tahun)
   - BB dan TB harus > 0
   - Tanggal pemeriksaan tidak boleh di masa depan

6. **Urutan Input:**
   1. Buat akun orang tua terlebih dahulu
   2. Tambah data balita (pilih orang tua dari dropdown)
   3. Lakukan pemeriksaan (pilih balita dari dropdown)

---

## 🔄 Contoh Alur Input Lengkap

### **Step 1: Buat Akun Orang Tua**
- Login sebagai Admin
- Menu: "Orang Tua" → "Tambah Orang Tua"
- Input data orang tua (Contoh 1)
- Simpan

### **Step 2: Tambah Data Balita**
- Menu: "Manajemen Balita" → Tab "Tambah Balita"
- Input data balita (Contoh 1)
- Pilih orang tua dari dropdown
- Simpan

### **Step 3: Pemeriksaan Ke-1**
- Menu: "Manajemen Balita" → Tab "Pemeriksaan"
- Pilih balita dari dropdown
- Input data pemeriksaan ke-1
- Simpan (sistem otomatis hitung status gizi)

### **Step 4: Pemeriksaan Ke-2**
- Menu: "Manajemen Balita" → Tab "Pemeriksaan"
- Pilih balita yang sama
- Input data pemeriksaan ke-2 (tanggal berbeda)
- Simpan

### **Step 5: Verifikasi**
- Menu: "Manajemen Balita" → Tab "Riwayat"
- Filter balita yang dipilih
- Lihat 2 pemeriksaan dengan status gizi yang sesuai

---

**File ini dapat digunakan sebagai panduan untuk testing dan input data real di sistem.**

