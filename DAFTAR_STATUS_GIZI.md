# 📊 Daftar Lengkap Status Gizi (Standar WHO)

Sistem ini menggunakan **klasifikasi WHO berdasarkan Z-Score** dengan **2 indikator utama**:

---

## 🎯 Total Status Gizi: **9 Status**

### **1. TB/U (Tinggi Badan per Umur) - 4 Status**

| No | Status | Kategori | Z-Score | Badge Color |
|----|--------|----------|---------|-------------|
| 1 | **Stunting Berat** | `SEVERE_STUNTING` | < -3 | 🔴 Merah (Error) |
| 2 | **Stunting** | `STUNTING` | -3 sampai -2 | 🔴 Merah (Error) |
| 3 | **Normal** | `NORMAL` | -2 sampai +2 | 🟢 Hijau (Success) |
| 4 | **Tinggi** | `TALL` | > +2 | 🔵 Biru (Info) |

---

### **2. BB/U (Berat Badan per Umur) - 5 Status**

| No | Status | Kategori | Z-Score | Badge Color |
|----|--------|----------|---------|-------------|
| 5 | **Gizi Buruk** | `SEVERE_UNDERWEIGHT` | < -3 | 🔴 Merah (Error) |
| 6 | **Gizi Kurang** | `UNDERWEIGHT` | -3 sampai -2 | 🟡 Kuning (Warning) |
| 7 | **Normal** | `NORMAL` | -2 sampai +2 | 🟢 Hijau (Success) |
| 8 | **Overweight** | `OVERWEIGHT` | +2 sampai +3 | 🟡 Kuning (Warning) |
| 9 | **Obesitas** | `OBESE` | > +3 | 🟡 Kuning (Warning) |

---

### **3. Status Khusus**

| No | Status | Kategori | Kondisi |
|----|--------|----------|---------|
| 10 | **Tidak diketahui** | `UNKNOWN` | Data tidak lengkap atau error |

---

## 📋 Ringkasan

### **Status Unik (Total: 9)**
1. ✅ **Stunting Berat** (TB/U)
2. ✅ **Stunting** (TB/U)
3. ✅ **Gizi Buruk** (BB/U)
4. ✅ **Gizi Kurang** (BB/U)
5. ✅ **Normal** (TB/U & BB/U)
6. ✅ **Overweight** (BB/U)
7. ✅ **Obesitas** (BB/U)
8. ✅ **Tinggi** (TB/U)
9. ✅ **Tidak diketahui** (Khusus)

---

## 🔄 Status Gizi Utama (Prioritas)

Sistem menentukan **status gizi utama** dengan prioritas:

1. **Stunting** (TB/U) - Prioritas Tertinggi
   - Jika `kategori_tb_u === 'STUNTING'` atau `'SEVERE_STUNTING'`
   - Status utama = "Stunting" atau "Stunting Berat"

2. **Gizi Buruk** (BB/U)
   - Jika `kategori_bb_u === 'SEVERE_UNDERWEIGHT'`
   - Status utama = "Gizi Buruk"

3. **Gizi Kurang** (BB/U)
   - Jika `kategori_bb_u === 'UNDERWEIGHT'`
   - Status utama = "Gizi Kurang"

4. **Overweight/Obesitas** (BB/U)
   - Jika `kategori_bb_u === 'OBESE'` atau `'OVERWEIGHT'`
   - Status utama = "Obesitas" atau "Overweight"

5. **Normal**
   - Jika `kategori_tb_u === 'NORMAL'` dan `kategori_bb_u === 'NORMAL'`
   - Status utama = "Normal"

---

## 📊 Contoh Kombinasi Status

### **Contoh 1: Normal**
- TB/U: Normal (Z = -0.5)
- BB/U: Normal (Z = 0.3)
- **Status Utama:** "Normal"
- **Status Gabungan:** "Normal (TB/U), Normal (BB/U)"

### **Contoh 2: Stunting**
- TB/U: Stunting (Z = -2.5)
- BB/U: Normal (Z = 0.2)
- **Status Utama:** "Stunting" (prioritas)
- **Status Gabungan:** "Stunting (TB/U), Normal (BB/U)"

### **Contoh 3: Gizi Kurang**
- TB/U: Normal (Z = -0.8)
- BB/U: Gizi Kurang (Z = -2.3)
- **Status Utama:** "Gizi Kurang"
- **Status Gabungan:** "Normal (TB/U), Gizi Kurang (BB/U)"

### **Contoh 4: Stunting + Gizi Kurang**
- TB/U: Stunting (Z = -2.4)
- BB/U: Gizi Kurang (Z = -2.1)
- **Status Utama:** "Stunting" (prioritas: Stunting > Underweight)
- **Status Gabungan:** "Stunting (TB/U), Gizi Kurang (BB/U)"

### **Contoh 5: Obesitas**
- TB/U: Normal (Z = 0.5)
- BB/U: Obesitas (Z = 3.5)
- **Status Utama:** "Obesitas"
- **Status Gabungan:** "Normal (TB/U), Obesitas (BB/U)"

---

## 🎨 Badge Color Mapping

| Status | Badge Color | CSS Class |
|--------|-------------|-----------|
| Stunting Berat | 🔴 Merah | `badge-error` |
| Stunting | 🔴 Merah | `badge-error` |
| Gizi Buruk | 🔴 Merah | `badge-error` |
| Gizi Kurang | 🟡 Kuning | `badge-warning` |
| Normal | 🟢 Hijau | `badge-success` |
| Overweight | 🟡 Kuning | `badge-warning` |
| Obesitas | 🟡 Kuning | `badge-warning` |
| Tinggi | 🔵 Biru | `badge-info` |
| Tidak diketahui | ⚪ Abu-abu | `badge-ghost` |

---

## 📝 Field di Database

Setiap record pemeriksaan menyimpan:

```javascript
{
  // Status utama (prioritas)
  status_gizi: "Normal" | "Stunting" | "Gizi Kurang" | "Gizi Buruk" | "Overweight" | "Obesitas",
  
  // Status gabungan (format: "Status TB/U (TB/U), Status BB/U (BB/U)")
  status_gizi_hasil_compute: "Normal (TB/U), Normal (BB/U)",
  
  // Status per indikator
  status_gizi_tb_u: "Normal" | "Stunting" | "Stunting Berat" | "Tinggi",
  status_gizi_bb_u: "Normal" | "Gizi Kurang" | "Gizi Buruk" | "Overweight" | "Obesitas",
  
  // Kategori per indikator
  kategori_tb_u: "NORMAL" | "STUNTING" | "SEVERE_STUNTING" | "TALL",
  kategori_bb_u: "NORMAL" | "UNDERWEIGHT" | "SEVERE_UNDERWEIGHT" | "OVERWEIGHT" | "OBESE",
  
  // Z-Score
  z_score_tb_u: -1.5,  // contoh
  z_score_bb_u: -0.8   // contoh
}
```

---

## ✅ Kesimpulan

**Total Status Gizi: 9 Status Unik**

1. Stunting Berat
2. Stunting
3. Gizi Buruk
4. Gizi Kurang
5. Normal
6. Overweight
7. Obesitas
8. Tinggi
9. Tidak diketahui

**Catatan:** Status "Normal" muncul di kedua indikator (TB/U dan BB/U), tetapi dihitung sebagai 1 status unik.

