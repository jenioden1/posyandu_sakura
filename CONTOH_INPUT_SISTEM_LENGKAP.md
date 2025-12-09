# 📋 Contoh Input Lengkap Sesuai Sistem - Klasifikasi WHO yang Jelas

## ⚠️ **PENTING: Cara Kerja Sistem**

### **Data Balita:**
- **BB, TB, LL, LK di data balita adalah OPSIONAL** (bisa null/kosong)
- Yang **WAJIB** di data balita: `nama_anak`, `nik`, `jenis_kelamin`, `tgl_lahir`, `orang_tua_uid`
- Data BB, TB, LL, LK di balita hanya untuk **display/referensi**, **TIDAK digunakan** untuk perhitungan WHO

### **Data Pemeriksaan:**
- **BB dan TB di form pemeriksaan WAJIB** untuk perhitungan WHO
- Sistem mengambil data identitas dari balita: `nama_anak`, `tgl_lahir`, `jenis_kelamin`
- ✅ **Sistem menghitung umur dari `tgl_ukur` (tanggal pemeriksaan)** - Sudah diperbaiki!
- Status gizi dihitung berdasarkan BB, TB, umur, dan jenis kelamin

---

## 🎯 **Contoh 1: Status Normal (Laki-laki, Umur 12 Bulan)**

### **Step 1: Buat Akun Orang Tua**
**Menu:** Admin → Orang Tua → Tambah Orang Tua

```json
{
  "username": "budi.santosoo@email.com",
  "password": "password123",
  "nama_ayah": "Budi Santoso",
  "nama_ibu": "Siti Rahayu",
  "alamat": "Jl. Merdeka No. 45, RT.03/RW.05, Cikalang, Kec. Tawang, Kab. Tasikmalaya, Jawa Barat 46115",
  "no_telp": "081234567890"
}
```

### **Step 2: Tambah Data Balita**
**Menu:** Admin → Manajemen Balita → Tab "Tambah Balita"

```json
{
  "nama_anak": "Ahmad Budi Santoso",
  "nik": "3207151206010001",
  "jenis_kelamin": "L",
  "tgl_lahir": "2023-06-15",
  "orang_tua_uid": "[ID_ORANG_TUA_DARI_STEP_1]",
  "alamat": "Jl. Merdeka No. 45, RT.03/RW.05, Cikalang, Kec. Tawang, Kab. Tasikmalaya, Jawa Barat 46115",
  "bb": "",        // ✅ OPSIONAL - Bisa kosong
  "tb": "",        // ✅ OPSIONAL - Bisa kosong
  "ll": "",        // ✅ OPSIONAL - Bisa kosong
  "lk": "",        // ✅ OPSIONAL - Bisa kosong
  "vitamin_a": false
}
```

**Catatan:** BB, TB, LL, LK bisa dikosongkan karena tidak digunakan untuk perhitungan WHO.

### **Step 3: Pemeriksaan Ke-1 (Normal)**
**Menu:** Admin → Manajemen Balita → Tab "Pemeriksaan"
**Tanggal Input:** 15 Juni 2024 (umur akan dihitung dari tgl_lahir sampai tgl_ukur)

**Pilih balita:** Ahmad Budi Santoso

```json
{
  "balita_id": "[ID_BALITA_DARI_STEP_2]",
  "tgl_ukur": "2024-06-15",
  "bb": "9.6",           // ✅ WAJIB - Sesuai median untuk umur 12 bulan (L)
  "tb": "75.7",          // ✅ WAJIB - Sesuai median untuk umur 12 bulan (L)
  "lila": "14.5",        // OPSIONAL
  "lingkar_kepala": "47.0"  // OPSIONAL
}
```

**Hasil yang Diharapkan:**
- Umur: 12 bulan (dari 2023-06-15 sampai 2024-06-15, menggunakan tgl_ukur)
- Median BB/U (L, 12 bulan): 9.6 kg, SD: 1.0
- Median TB/U (L, 12 bulan): 75.7 cm, SD: 2.5
- Z-Score BB/U: (9.6 - 9.6) / 1.0 = **0.0** → **Normal**
- Z-Score TB/U: (75.7 - 75.7) / 2.5 = **0.0** → **Normal**
- **Status Gizi:** Normal
- **Badge:** 🟢 Hijau

### **Step 4: Pemeriksaan Ke-2 (Normal)**
**Tanggal Input:** 15 Juli 2024

```json
{
  "balita_id": "[ID_BALITA_DARI_STEP_2]",
  "tgl_ukur": "2024-07-15",
  "bb": "10.0",          // ✅ WAJIB - Sedikit naik dari pemeriksaan pertama
  "tb": "77.0",          // ✅ WAJIB - Sedikit naik dari pemeriksaan pertama
  "lila": "14.8",        // OPSIONAL
  "lingkar_kepala": "47.5"  // OPSIONAL
}
```

**Hasil yang Diharapkan:**
- Umur: 13 bulan (dari 2023-06-15 sampai 2024-07-15, menggunakan tgl_ukur)
- Median BB/U (L, 13 bulan): ~9.8 kg (interpolasi), SD: ~1.05
- Median TB/U (L, 13 bulan): ~76.5 cm (interpolasi), SD: ~2.6
- Z-Score BB/U: (10.0 - 9.8) / 1.05 = **+0.19** → **Normal**
- Z-Score TB/U: (77.0 - 76.5) / 2.6 = **+0.19** → **Normal**
- **Status Gizi:** Normal
- **Badge:** 🟢 Hijau

---

## 🎯 **Contoh 2: Status Stunting (Perempuan, Umur 12 Bulan)**

### **Step 1: Buat Akun Orang Tua**
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

### **Step 2: Tambah Data Balita**
```json
{
  "nama_anak": "Putri Sari Dewi",
  "nik": "3207151206020002",
  "jenis_kelamin": "P",
  "tgl_lahir": "2023-01-10",
  "orang_tua_uid": "[ID_ORANG_TUA]",
  "alamat": "Jl. Cendrawasih No. 12, RT.01/RW.03, Cikalang, Kec. Tawang, Kab. Tasikmalaya, Jawa Barat 46115",
  "bb": "",        // ✅ OPSIONAL
  "tb": "",        // ✅ OPSIONAL
  "ll": "",        // ✅ OPSIONAL
  "lk": "",        // ✅ OPSIONAL
  "vitamin_a": false
}
```

### **Step 3: Pemeriksaan Ke-1 (Stunting)**
**Tanggal Input:** 10 Januari 2024

```json
{
  "balita_id": "[ID_BALITA]",
  "tgl_ukur": "2024-01-10",
  "bb": "7.5",           // ✅ WAJIB - Lebih ringan dari normal
  "tb": "69.0",          // ✅ WAJIB - Lebih pendek dari normal (Z < -2)
  "lila": "12.5",        // OPSIONAL
  "lingkar_kepala": "44.0"  // OPSIONAL
}
```

**Hasil yang Diharapkan:**
- Umur: 12 bulan (dari 2023-01-10 sampai 2024-01-10)
- Median BB/U (P, 12 bulan): 8.9 kg, SD: 0.9
- Median TB/U (P, 12 bulan): 74.0 cm, SD: 2.4
- Z-Score BB/U: (7.5 - 8.9) / 0.9 = **-1.56** → **Normal** (masih dalam range)
- Z-Score TB/U: (69.0 - 74.0) / 2.4 = **-2.08** → **Stunting** (Z < -2)
- **Status Gizi:** Stunting (prioritas: Stunting > Underweight)
- **Badge:** 🔴 Merah

### **Step 4: Pemeriksaan Ke-2 (Stunting Berat)**
**Tanggal Input:** 10 Juli 2024

```json
{
  "balita_id": "[ID_BALITA]",
  "tgl_ukur": "2024-07-10",
  "bb": "8.0",           // ✅ WAJIB
  "tb": "75.0",          // ✅ WAJIB - Masih sangat pendek untuk umur 18 bulan
  "lila": "13.0",        // OPSIONAL
  "lingkar_kepala": "45.0"  // OPSIONAL
}
```

**Hasil yang Diharapkan:**
- Umur: 18 bulan (dari 2023-01-10 sampai 2024-07-10)
- Median BB/U (P, 18 bulan): 10.2 kg, SD: 1.0
- Median TB/U (P, 18 bulan): 80.7 cm, SD: 2.7
- Z-Score BB/U: (8.0 - 10.2) / 1.0 = **-2.2** → **Gizi Kurang**
- Z-Score TB/U: (75.0 - 80.7) / 2.7 = **-2.11** → **Stunting**
- **Status Gizi:** Stunting (prioritas: Stunting > Underweight)
- **Badge:** 🔴 Merah

---

## 🎯 **Contoh 3: Status Gizi Kurang (Laki-laki, Umur 24 Bulan)**

### **Step 1 & 2: Buat Orang Tua & Balita**
```json
// Orang Tua
{
  "username": "andi.prasetyo@email.com",
  "password": "password123",
  "nama_ayah": "Andi Prasetyo",
  "nama_ibu": "Rina Wati",
  "alamat": "Jl. Pahlawan No. 88, RT.04/RW.06, Cikalang, Kec. Tawang, Kab. Tasikmalaya, Jawa Barat 46115",
  "no_telp": "082345678901"
}

// Balita
{
  "nama_anak": "Budi Andi Prasetyo",
  "nik": "3207151206030003",
  "jenis_kelamin": "L",
  "tgl_lahir": "2022-12-20",
  "orang_tua_uid": "[ID_ORANG_TUA]",
  "alamat": "Jl. Pahlawan No. 88, RT.04/RW.06, Cikalang, Kec. Tawang, Kab. Tasikmalaya, Jawa Barat 46115",
  "bb": "",        // ✅ OPSIONAL
  "tb": "",        // ✅ OPSIONAL
  "ll": "",        // ✅ OPSIONAL
  "lk": "",        // ✅ OPSIONAL
  "vitamin_a": true
}
```

### **Step 3: Pemeriksaan Ke-1 (Gizi Kurang)**
**Tanggal Input:** 20 Desember 2024

```json
{
  "balita_id": "[ID_BALITA]",
  "tgl_ukur": "2024-12-20",
  "bb": "10.0",          // ✅ WAJIB - Sangat rendah untuk umur 24 bulan (Z < -2)
  "tb": "87.0",          // ✅ WAJIB - Normal
  "lila": "13.0",        // OPSIONAL
  "lingkar_kepala": "48.0"  // OPSIONAL
}
```

**Hasil yang Diharapkan:**
- Umur: 24 bulan (dari 2022-12-20 sampai 2024-12-20)
- Median BB/U (L, 24 bulan): 12.2 kg, SD: 1.2
- Median TB/U (L, 24 bulan): 87.8 cm, SD: 3.1
- Z-Score BB/U: (10.0 - 12.2) / 1.2 = **-1.83** → **Normal** (masih dalam range -2 sampai +2)
- Z-Score TB/U: (87.0 - 87.8) / 3.1 = **-0.26** → **Normal**
- **Status Gizi:** Normal

**Catatan:** Untuk mendapatkan status "Gizi Kurang", perlu Z-Score BB/U < -2. Gunakan nilai di bawah ini:

### **Pemeriksaan Ke-1 (Alternatif - Gizi Kurang):**
```json
{
  "balita_id": "[ID_BALITA]",
  "tgl_ukur": "2024-12-20",
  "bb": "9.5",           // ✅ WAJIB - Z-Score < -2
  "tb": "87.0",          // ✅ WAJIB - Normal
  "lila": "12.8",        // OPSIONAL
  "lingkar_kepala": "47.8"  // OPSIONAL
}
```

**Hasil yang Diharapkan:**
- Z-Score BB/U: (9.5 - 12.2) / 1.2 = **-2.25** → **Gizi Kurang** (Z < -2)
- Z-Score TB/U: (87.0 - 87.8) / 3.1 = **-0.26** → **Normal**
- **Status Gizi:** Gizi Kurang
- **Badge:** 🟡 Kuning

### **Step 4: Pemeriksaan Ke-2 (Gizi Kurang)**
**Tanggal Input:** 20 Januari 2025

```json
{
  "balita_id": "[ID_BALITA]",
  "tgl_ukur": "2025-01-20",
  "bb": "9.8",           // ✅ WAJIB - Masih rendah
  "tb": "88.0",          // ✅ WAJIB - Normal
  "lila": "13.0",        // OPSIONAL
  "lingkar_kepala": "48.2"  // OPSIONAL
}
```

**Hasil yang Diharapkan:**
- Umur: 25 bulan (dari 2022-12-20 sampai 2025-01-20)
- Median BB/U (L, 25 bulan): ~12.4 kg (interpolasi), SD: ~1.25
- Median TB/U (L, 25 bulan): ~88.5 cm (interpolasi), SD: ~3.2
- Z-Score BB/U: (9.8 - 12.4) / 1.25 = **-2.08** → **Gizi Kurang**
- Z-Score TB/U: (88.0 - 88.5) / 3.2 = **-0.16** → **Normal**
- **Status Gizi:** Gizi Kurang
- **Badge:** 🟡 Kuning

---

## 🎯 **Contoh 4: Status Overweight (Perempuan, Umur 36 Bulan)**

### **Step 1 & 2: Buat Orang Tua & Balita**
```json
// Orang Tua
{
  "username": "lina.sari@email.com",
  "password": "password123",
  "nama_ayah": "Rudi Hermawan",
  "nama_ibu": "Lina Sari",
  "alamat": "Jl. Sudirman No. 33, RT.02/RW.04, Cikalang, Kec. Tawang, Kab. Tasikmalaya, Jawa Barat 46115",
  "no_telp": "083456789012"
}

// Balita
{
  "nama_anak": "Rina Lina Sari",
  "nik": "3207151206040004",
  "jenis_kelamin": "P",
  "tgl_lahir": "2021-06-01",
  "orang_tua_uid": "[ID_ORANG_TUA]",
  "alamat": "Jl. Sudirman No. 33, RT.02/RW.04, Cikalang, Kec. Tawang, Kab. Tasikmalaya, Jawa Barat 46115",
  "bb": "",        // ✅ OPSIONAL
  "tb": "",        // ✅ OPSIONAL
  "ll": "",        // ✅ OPSIONAL
  "lk": "",        // ✅ OPSIONAL
  "vitamin_a": false
}
```

### **Step 3: Pemeriksaan Ke-1 (Overweight)**
**Tanggal Input:** 1 Juni 2024

```json
{
  "balita_id": "[ID_BALITA]",
  "tgl_ukur": "2024-06-01",
  "bb": "16.5",          // ✅ WAJIB - Z-Score > +2 (Overweight)
  "tb": "95.0",          // ✅ WAJIB - Normal
  "lila": "16.0",        // OPSIONAL
  "lingkar_kepala": "50.0"  // OPSIONAL
}
```

**Hasil yang Diharapkan:**
- Umur: 36 bulan (dari 2021-06-01 sampai 2024-06-01)
- Median BB/U (P, 36 bulan): 13.9 kg, SD: 1.3
- Median TB/U (P, 36 bulan): 95.1 cm, SD: 3.5
- Z-Score BB/U: (16.5 - 13.9) / 1.3 = **+2.0** → **Overweight** (Z = +2, batas)
- Z-Score TB/U: (95.0 - 95.1) / 3.5 = **-0.03** → **Normal**
- **Status Gizi:** Overweight
- **Badge:** 🟡 Kuning

### **Step 4: Pemeriksaan Ke-2 (Overweight)**
**Tanggal Input:** 1 Juli 2024

```json
{
  "balita_id": "[ID_BALITA]",
  "tgl_ukur": "2024-07-01",
  "bb": "17.0",          // ✅ WAJIB - Masih overweight
  "tb": "95.5",          // ✅ WAJIB - Normal
  "lila": "16.2",        // OPSIONAL
  "lingkar_kepala": "50.2"  // OPSIONAL
}
```

**Hasil yang Diharapkan:**
- Umur: 37 bulan (dari 2021-06-01 sampai 2024-07-01)
- Median BB/U (P, 37 bulan): ~14.1 kg (interpolasi), SD: ~1.35
- Median TB/U (P, 37 bulan): ~95.3 cm (interpolasi), SD: ~3.55
- Z-Score BB/U: (17.0 - 14.1) / 1.35 = **+2.15** → **Overweight** (Z > +2 dan <= +3)
- Z-Score TB/U: (95.5 - 95.3) / 3.55 = **+0.06** → **Normal**
- **Status Gizi:** Overweight
- **Badge:** 🟡 Kuning

---

## 🎯 **Contoh 5: Status Obesitas (Laki-laki, Umur 48 Bulan)**

### **Step 1 & 2: Buat Orang Tua & Balita**
```json
// Orang Tua
{
  "username": "dian.kartika@email.com",
  "password": "password123",
  "nama_ayah": "Ahmad Fauzi",
  "nama_ibu": "Dian Kartika",
  "alamat": "Jl. Gatot Subroto No. 77, RT.05/RW.07, Cikalang, Kec. Tawang, Kab. Tasikmalaya, Jawa Barat 46115",
  "no_telp": "084567890123"
}

// Balita
{
  "nama_anak": "Fauzi Ahmad Fauzi",
  "nik": "3207151206050005",
  "jenis_kelamin": "L",
  "tgl_lahir": "2020-03-15",
  "orang_tua_uid": "[ID_ORANG_TUA]",
  "alamat": "Jl. Gatot Subroto No. 77, RT.05/RW.07, Cikalang, Kec. Tawang, Kab. Tasikmalaya, Jawa Barat 46115",
  "bb": "",        // ✅ OPSIONAL
  "tb": "",        // ✅ OPSIONAL
  "ll": "",        // ✅ OPSIONAL
  "lk": "",        // ✅ OPSIONAL
  "vitamin_a": false
}
```

### **Step 3: Pemeriksaan Ke-1 (Obesitas)**
**Tanggal Input:** 15 Maret 2024

```json
{
  "balita_id": "[ID_BALITA]",
  "tgl_ukur": "2024-03-15",
  "bb": "22.0",          // ✅ WAJIB - Z-Score > +3 (Obesitas)
  "tb": "105.0",         // ✅ WAJIB - Normal
  "lila": "18.0",        // OPSIONAL
  "lingkar_kepala": "52.0"  // OPSIONAL
}
```

**Hasil yang Diharapkan:**
- Umur: 48 bulan (dari 2020-03-15 sampai 2024-03-15)
- Median BB/U (L, 48 bulan): ~16.5 kg (interpolasi), SD: ~1.8
- Median TB/U (L, 48 bulan): ~102.0 cm (interpolasi), SD: ~4.0
- Z-Score BB/U: (22.0 - 16.5) / 1.8 = **+3.06** → **Obesitas** (Z > +3)
- Z-Score TB/U: (105.0 - 102.0) / 4.0 = **+0.75** → **Normal**
- **Status Gizi:** Obesitas
- **Badge:** 🟡 Kuning

### **Step 4: Pemeriksaan Ke-2 (Obesitas)**
**Tanggal Input:** 15 April 2024

```json
{
  "balita_id": "[ID_BALITA]",
  "tgl_ukur": "2024-04-15",
  "bb": "22.5",          // ✅ WAJIB - Masih obesitas
  "tb": "105.5",         // ✅ WAJIB - Normal
  "lila": "18.2",        // OPSIONAL
  "lingkar_kepala": "52.2"  // OPSIONAL
}
```

**Hasil yang Diharapkan:**
- Umur: 49 bulan (dari 2020-03-15 sampai 2024-04-15)
- Median BB/U (L, 49 bulan): ~16.7 kg (interpolasi), SD: ~1.85
- Median TB/U (L, 49 bulan): ~102.3 cm (interpolasi), SD: ~4.05
- Z-Score BB/U: (22.5 - 16.7) / 1.85 = **+3.14** → **Obesitas**
- Z-Score TB/U: (105.5 - 102.3) / 4.05 = **+0.79** → **Normal**
- **Status Gizi:** Obesitas
- **Badge:** 🟡 Kuning

---

## 📊 Tabel Referensi Nilai untuk Status Normal (Median WHO)

| Umur (bulan) | Jenis Kelamin | Median BB/U (kg) | SD BB/U | Median TB/U (cm) | SD TB/U |
|--------------|---------------|------------------|---------|------------------|---------|
| 6 | L | 7.9 | 0.9 | 67.6 | 2.1 |
| 6 | P | 7.3 | 0.8 | 65.7 | 2.0 |
| 12 | L | 9.6 | 1.0 | 75.7 | 2.5 |
| 12 | P | 8.9 | 0.9 | 74.0 | 2.4 |
| 18 | L | 11.0 | 1.1 | 82.3 | 2.8 |
| 18 | P | 10.2 | 1.0 | 80.7 | 2.7 |
| 24 | L | 12.2 | 1.2 | 87.8 | 3.1 |
| 24 | P | 11.5 | 1.1 | 86.8 | 3.0 |
| 36 | L | 14.3 | 1.4 | 96.1 | 3.6 |
| 36 | P | 13.9 | 1.3 | 95.1 | 3.5 |

---

## 📝 **Rumus untuk Mendapatkan Status Tertentu**

### **Normal (Z-Score: -2 ≤ Z ≤ +2):**
- Gunakan nilai yang mendekati median untuk umur dan jenis kelamin
- Contoh: Umur 12 bulan (L) → BB: 9.6 kg, TB: 75.7 cm

### **Stunting (Z-Score TB/U < -2):**
- TB harus lebih rendah dari (median - 2×SD)
- Contoh: Umur 12 bulan (P) → Median TB: 74.0, SD: 2.4
- TB untuk Stunting: < 74.0 - (2 × 2.4) = **< 69.2 cm**

### **Stunting Berat (Z-Score TB/U < -3):**
- TB harus lebih rendah dari (median - 3×SD)
- Contoh: Umur 12 bulan (P) → TB < 74.0 - (3 × 2.4) = **< 66.8 cm**

### **Gizi Kurang (Z-Score BB/U: -3 ≤ Z < -2):**
- BB harus antara (median - 3×SD) dan (median - 2×SD)
- Contoh: Umur 24 bulan (L) → Median BB: 12.2, SD: 1.2
- BB untuk Gizi Kurang: antara 12.2 - (3 × 1.2) = **8.6** dan 12.2 - (2 × 1.2) = **9.8 kg**

### **Gizi Buruk (Z-Score BB/U < -3):**
- BB harus lebih rendah dari (median - 3×SD)
- Contoh: Umur 24 bulan (L) → BB < 12.2 - (3 × 1.2) = **< 8.6 kg**

### **Overweight (Z-Score BB/U: +2 < Z ≤ +3):**
- BB harus antara (median + 2×SD) dan (median + 3×SD)
- Contoh: Umur 36 bulan (P) → Median BB: 13.9, SD: 1.3
- BB untuk Overweight: antara 13.9 + (2 × 1.3) = **16.5** dan 13.9 + (3 × 1.3) = **17.8 kg**

### **Obesitas (Z-Score BB/U > +3):**
- BB harus lebih tinggi dari (median + 3×SD)
- Contoh: Umur 36 bulan (P) → BB > 13.9 + (3 × 1.3) = **> 17.8 kg**

---

## ⚠️ **Catatan Penting**

1. **Data Balita BB, TB, LL, LK BISA NULL:** Field ini opsional dan tidak digunakan untuk perhitungan WHO.

2. **Yang WAJIB di Data Balita:**
   - `nama_anak`
   - `nik`
   - `jenis_kelamin`
   - `tgl_lahir`
   - `orang_tua_uid`

3. **Yang WAJIB di Form Pemeriksaan:**
   - `balita_id` (pilih dari dropdown)
   - `tgl_ukur`
   - `bb` (Berat Badan dalam kg)
   - `tb` (Tinggi Badan dalam cm)
   - `lila` dan `lingkar_kepala` (opsional)

4. **Perhitungan Umur:** ✅ **Sistem sekarang menghitung umur dari `tgl_ukur` (tanggal pemeriksaan)** - Sudah diperbaiki! Pastikan `tgl_ukur` selalu diisi dengan benar.

5. **Data Referensi WHO:** Data yang digunakan adalah simulasi. Untuk produksi, gunakan data WHO Growth Standards yang sesungguhnya.

---

## ✅ **Kesimpulan**

- ✅ **Data balita BB, TB, LL, LK BISA NULL** (opsional)
- ✅ **Status gizi dihitung dari data pemeriksaan** (BB, TB) + data identitas balita (nama, tgl_lahir, jenis_kelamin)
- ✅ **Gunakan nilai yang sesuai dengan tabel referensi** untuk mendapatkan klasifikasi yang jelas
- ✅ **Pastikan tanggal lahir sesuai** dengan umur yang diinginkan saat input pemeriksaan

