import admin from 'firebase-admin';

// --- Init Firebase Admin (idempotent untuk hot-reload) ---
if (!admin.apps.length) {
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!serviceAccountJson) {
    throw new Error('Missing env FIREBASE_SERVICE_ACCOUNT');
  }

  const serviceAccount = JSON.parse(serviceAccountJson);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

// --- Helpers ---
function calculateUmurBulan(tglLahirStr, tglReferensi = null) {
  const lahir = new Date(tglLahirStr);
  // Gunakan tgl_ukur sebagai tanggal referensi jika tersedia, jika tidak gunakan tanggal sekarang
  const referensi = tglReferensi ? new Date(tglReferensi) : new Date();
  const days = (referensi - lahir) / (1000 * 60 * 60 * 24);
  return Math.round((days / 30.4375) * 100) / 100; // ~30.44 hari/bulan
}

/**
 * Simulasi Tabel Referensi WHO untuk TB/U (Tinggi Badan per Umur)
 * Data ini adalah simulasi - untuk produksi sebaiknya menggunakan data WHO yang sesungguhnya
 * Format: { umur_bulan: { L: { median, sd }, P: { median, sd } } }
 */
function getWHOReferenceTB_U(umurBulan, jenisKelamin) {
  // Simulasi data referensi WHO (dalam cm)
  // Untuk produksi, gunakan data WHO Growth Standards yang sesungguhnya
  const gender = jenisKelamin === 'L' ? 'L' : 'P';
  
  // Contoh data simulasi (harus diganti dengan data WHO yang sesungguhnya)
  // Data ini hanya untuk demonstrasi arsitektur
  const referenceData = {
    6: { L: { median: 67.6, sd: 2.1 }, P: { median: 65.7, sd: 2.0 } },
    12: { L: { median: 75.7, sd: 2.5 }, P: { median: 74.0, sd: 2.4 } },
    18: { L: { median: 82.3, sd: 2.8 }, P: { median: 80.7, sd: 2.7 } },
    24: { L: { median: 87.8, sd: 3.1 }, P: { median: 86.8, sd: 3.0 } },
    36: { L: { median: 96.1, sd: 3.6 }, P: { median: 95.1, sd: 3.5 } },
  };

  // Interpolasi untuk umur yang tidak ada di tabel (linear interpolation)
  const umurKeys = Object.keys(referenceData).map(Number).sort((a, b) => a - b);
  let umurKey = umurKeys.find(k => k >= umurBulan);
  
  if (!umurKey) {
    // Jika umur lebih besar dari data terakhir, gunakan data terakhir
    umurKey = umurKeys[umurKeys.length - 1];
  } else if (umurKey > umurBulan && umurKeys.indexOf(umurKey) > 0) {
    // Interpolasi linear
    const prevKey = umurKeys[umurKeys.indexOf(umurKey) - 1];
    const prev = referenceData[prevKey][gender];
    const curr = referenceData[umurKey][gender];
    const ratio = (umurBulan - prevKey) / (umurKey - prevKey);
    
    return {
      median: prev.median + (curr.median - prev.median) * ratio,
      sd: prev.sd + (curr.sd - prev.sd) * ratio
    };
  }
  
  return referenceData[umurKey]?.[gender] || { median: 75, sd: 3 }; // Default fallback
}

/**
 * Simulasi Tabel Referensi WHO untuk BB/U (Berat Badan per Umur)
 */
function getWHOReferenceBB_U(umurBulan, jenisKelamin) {
  const gender = jenisKelamin === 'L' ? 'L' : 'P';
  
  // Contoh data simulasi (harus diganti dengan data WHO yang sesungguhnya)
  const referenceData = {
    6: { L: { median: 7.9, sd: 0.9 }, P: { median: 7.3, sd: 0.8 } },
    12: { L: { median: 9.6, sd: 1.0 }, P: { median: 8.9, sd: 0.9 } },
    18: { L: { median: 11.0, sd: 1.1 }, P: { median: 10.2, sd: 1.0 } },
    24: { L: { median: 12.2, sd: 1.2 }, P: { median: 11.5, sd: 1.1 } },
    36: { L: { median: 14.3, sd: 1.4 }, P: { median: 13.9, sd: 1.3 } },
  };

  const umurKeys = Object.keys(referenceData).map(Number).sort((a, b) => a - b);
  let umurKey = umurKeys.find(k => k >= umurBulan);
  
  if (!umurKey) {
    umurKey = umurKeys[umurKeys.length - 1];
  } else if (umurKey > umurBulan && umurKeys.indexOf(umurKey) > 0) {
    const prevKey = umurKeys[umurKeys.indexOf(umurKey) - 1];
    const prev = referenceData[prevKey][gender];
    const curr = referenceData[umurKey][gender];
    const ratio = (umurBulan - prevKey) / (umurKey - prevKey);
    
    return {
      median: prev.median + (curr.median - prev.median) * ratio,
      sd: prev.sd + (curr.sd - prev.sd) * ratio
    };
  }
  
  return referenceData[umurKey]?.[gender] || { median: 10, sd: 1.2 }; // Default fallback
}

/**
 * Hitung Z-Score menggunakan formula WHO: (Nilai Riil - Median) / SD
 */
function calculateZScore(nilaiRiil, median, sd) {
  if (!sd || sd === 0) return null;
  return (nilaiRiil - median) / sd;
}

/**
 * Klasifikasi Status Gizi berdasarkan Z-Score (Standar WHO)
 */
function classifyStatusGizi(zScore, type) {
  if (zScore === null || zScore === undefined) return { status: 'Tidak diketahui', kategori: 'UNKNOWN' };
  
  if (type === 'TB_U') {
    // Stunting (TB/U)
    if (zScore < -3) return { status: 'Stunting Berat', kategori: 'SEVERE_STUNTING', z_score: zScore };
    if (zScore < -2) return { status: 'Stunting', kategori: 'STUNTING', z_score: zScore };
    if (zScore >= -2 && zScore <= 2) return { status: 'Normal', kategori: 'NORMAL', z_score: zScore };
    if (zScore > 2) return { status: 'Tinggi', kategori: 'TALL', z_score: zScore };
  }
  
  if (type === 'BB_U') {
    // Underweight (BB/U) - Standar WHO
    if (zScore < -3) return { status: 'Gizi Buruk', kategori: 'SEVERE_UNDERWEIGHT', z_score: zScore };
    if (zScore < -2) return { status: 'Gizi Kurang', kategori: 'UNDERWEIGHT', z_score: zScore };
    if (zScore >= -2 && zScore <= 2) return { status: 'Normal', kategori: 'NORMAL', z_score: zScore };
    if (zScore > 2 && zScore <= 3) return { status: 'Overweight', kategori: 'OVERWEIGHT', z_score: zScore };
    if (zScore > 3) return { status: 'Obesitas', kategori: 'OBESE', z_score: zScore };
  }
  
  return { status: 'Tidak diketahui', kategori: 'UNKNOWN', z_score: zScore };
}

/**
 * Komputasi Status Gizi menggunakan Standar WHO (Z-Score)
 */
function computeStatusGiziWHO({ berat, tinggi, umur_bulan, jenis_kelamin }) {
  if (!berat || !tinggi || !umur_bulan || !jenis_kelamin) {
    return {
      status_gizi_bb_u: 'Tidak diketahui',
      status_gizi_tb_u: 'Tidak diketahui',
      z_score_bb_u: null,
      z_score_tb_u: null,
      note: 'Input kurang lengkap untuk perhitungan WHO'
    };
  }

  // 1. Ambil data referensi WHO berdasarkan umur & gender
  const refTB_U = getWHOReferenceTB_U(umur_bulan, jenis_kelamin);
  const refBB_U = getWHOReferenceBB_U(umur_bulan, jenis_kelamin);

  // 2. Hitung Z-Score untuk TB/U (Tinggi Badan per Umur)
  const z_score_tb_u = calculateZScore(tinggi, refTB_U.median, refTB_U.sd);
  const statusTB_U = classifyStatusGizi(z_score_tb_u, 'TB_U');

  // 3. Hitung Z-Score untuk BB/U (Berat Badan per Umur)
  const z_score_bb_u = calculateZScore(berat, refBB_U.median, refBB_U.sd);
  const statusBB_U = classifyStatusGizi(z_score_bb_u, 'BB_U');

  // 4. Tentukan status gizi utama (prioritas: Stunting > Underweight > Overweight > Normal)
  let status_gizi_utama = 'Normal';
  if (statusTB_U.kategori === 'SEVERE_STUNTING' || statusTB_U.kategori === 'STUNTING') {
    status_gizi_utama = statusTB_U.status;
  } else if (statusBB_U.kategori === 'SEVERE_UNDERWEIGHT') {
    status_gizi_utama = statusBB_U.status;
  } else if (statusBB_U.kategori === 'UNDERWEIGHT') {
    status_gizi_utama = statusBB_U.status;
  } else if (statusBB_U.kategori === 'OBESE' || statusBB_U.kategori === 'OVERWEIGHT') {
    status_gizi_utama = statusBB_U.status;
  } else if (statusTB_U.kategori === 'NORMAL' && statusBB_U.kategori === 'NORMAL') {
    status_gizi_utama = 'Normal';
  }

  return {
    status_gizi_utama,
    status_gizi_tb_u: statusTB_U.status,
    status_gizi_bb_u: statusBB_U.status,
    z_score_tb_u: z_score_tb_u !== null ? Math.round(z_score_tb_u * 100) / 100 : null, // Round to 2 decimals
    z_score_bb_u: z_score_bb_u !== null ? Math.round(z_score_bb_u * 100) / 100 : null,
    kategori_tb_u: statusTB_U.kategori,
    kategori_bb_u: statusBB_U.kategori,
    note: `TB/U: ${statusTB_U.status} (Z=${z_score_tb_u?.toFixed(2) || 'N/A'}), BB/U: ${statusBB_U.status} (Z=${z_score_bb_u?.toFixed(2) || 'N/A'})`
  };
}

// --- Handler ---
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ status: 'error', message: 'Method not allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    const { 
      nama, 
      tgl_lahir, 
      jenis_kelamin, 
      berat, 
      tinggi, 
      lila = null, 
      lingkar_kepala = null,
      balita_id = null,
      tgl_ukur = null
    } = body;

    // Validasi field wajib untuk perhitungan WHO
    if (!nama || !tgl_lahir || !jenis_kelamin || !berat || !tinggi) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'Field wajib belum lengkap. Diperlukan: nama, tgl_lahir, jenis_kelamin, berat, tinggi' 
      });
    }

    // Validasi nilai berat dan tinggi
    if (parseFloat(berat) <= 0 || parseFloat(tinggi) <= 0) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'Berat badan dan tinggi badan harus lebih dari 0' 
      });
    }

    // Hitung umur dalam bulan (presisi untuk WHO)
    // Gunakan tgl_ukur sebagai tanggal referensi untuk perhitungan umur yang akurat
    const umur_bulan = calculateUmurBulan(tgl_lahir, tgl_ukur);
    
    // Hitung status gizi menggunakan Standar WHO (Z-Score)
    const whoResult = computeStatusGiziWHO({
      berat: parseFloat(berat),
      tinggi: parseFloat(tinggi),
      umur_bulan,
      jenis_kelamin
    });

    // Simpan data lengkap ke Firestore
    const docData = {
      // Data identitas balita (untuk perhitungan WHO)
      nama,
      tgl_lahir,
      jenis_kelamin,
      
      // Data pengukuran
      berat: parseFloat(berat),
      tinggi: parseFloat(tinggi),
      lila: lila ? parseFloat(lila) : null,
      lingkar_kepala: lingkar_kepala ? parseFloat(lingkar_kepala) : null,
      
      // Data perhitungan WHO (Z-Score)
      umur_bulan,
      z_score_tb_u: whoResult.z_score_tb_u,
      z_score_bb_u: whoResult.z_score_bb_u,
      status_gizi_tb_u: whoResult.status_gizi_tb_u,
      status_gizi_bb_u: whoResult.status_gizi_bb_u,
      status_gizi: whoResult.status_gizi_utama, // Status utama untuk kompatibilitas
      status_gizi_hasil_compute: `${whoResult.status_gizi_tb_u} (TB/U), ${whoResult.status_gizi_bb_u} (BB/U)`, // Gabungan untuk statistik
      kategori_tb_u: whoResult.kategori_tb_u,
      kategori_bb_u: whoResult.kategori_bb_u,
      catatan_perhitungan: whoResult.note,
      
      // Relasi dan metadata
      balita_id: balita_id || null,
      tgl_ukur: tgl_ukur || new Date().toISOString().split('T')[0],
      
      // Timestamp
      created_at: admin.firestore.FieldValue.serverTimestamp(),
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    };

    await db.collection('pemeriksaan').add(docData);

    return res.status(200).json({
      status: 'success',
      message: 'Data saved & analyzed using WHO Z-Score standards',
      data: {
        status_gizi: whoResult.status_gizi_utama,
        status_gizi_tb_u: whoResult.status_gizi_tb_u,
        status_gizi_bb_u: whoResult.status_gizi_bb_u,
        z_score_tb_u: whoResult.z_score_tb_u,
        z_score_bb_u: whoResult.z_score_bb_u,
        umur_bulan
      },
    });
  } catch (err) {
    console.error('Error in /api/analyze:', err);
    return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
}
