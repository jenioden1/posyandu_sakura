import admin from 'firebase-admin';

if (!admin.apps.length) {
  const sa = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!sa) throw new Error('Missing env FIREBASE_SERVICE_ACCOUNT');
  admin.initializeApp({ credential: admin.credential.cert(JSON.parse(sa)) });
}

const db = admin.firestore();

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }
  try {
    // Tanpa orderBy untuk menghindari index requirement, sort manual di JavaScript
    const snap = await db.collection('balita').get();
    const data = [];
    for (const doc of snap.docs) {
      const balita = { id: doc.id, ...doc.data() };
      // format tanggal
      if (balita.created_at?.toDate) balita.created_at = balita.created_at.toDate();
      if (balita.updated_at?.toDate) balita.updated_at = balita.updated_at.toDate();
      
      // lookup orang tua
      if (balita.orang_tua_uid) {
        try {
          const otDoc = await db.collection('orang_tua').doc(balita.orang_tua_uid).get();
          if (otDoc.exists) {
            balita.orang_tua = { id: otDoc.id, ...otDoc.data() };
          }
        } catch (e) {
          console.warn('lookup orang_tua failed:', e.message);
        }
      }

      // Ambil data pemeriksaan terbaru untuk menampilkan BB, TB, LL, LK terbaru
      // Tanpa orderBy untuk menghindari index requirement, sort manual di JavaScript
      try {
        const allPemeriksaanSnapshot = await db.collection('pemeriksaan')
          .where('balita_id', '==', doc.id)
          .get();

        if (!allPemeriksaanSnapshot.empty) {
          // Convert semua pemeriksaan ke array dan sort manual
          const allPemeriksaan = allPemeriksaanSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              // Normalize tgl_ukur untuk sorting
              tgl_ukur_date: data.tgl_ukur 
                ? (data.tgl_ukur.toDate ? data.tgl_ukur.toDate() : new Date(data.tgl_ukur))
                : (data.created_at?.toDate ? data.created_at.toDate() : new Date(0))
            };
          });
          
          // Sort by tgl_ukur (terbaru dulu)
          allPemeriksaan.sort((a, b) => {
            return b.tgl_ukur_date - a.tgl_ukur_date;
          });
          
          // Ambil yang terbaru (index 0)
          if (allPemeriksaan.length > 0) {
            const latestPemeriksaan = allPemeriksaan[0];
            // Update dengan data terbaru dari pemeriksaan jika ada
            if (latestPemeriksaan.berat) balita.bb_latest = latestPemeriksaan.berat;
            if (latestPemeriksaan.tinggi) balita.tb_latest = latestPemeriksaan.tinggi;
            if (latestPemeriksaan.lila) balita.ll_latest = latestPemeriksaan.lila;
            if (latestPemeriksaan.lingkar_kepala) balita.lk_latest = latestPemeriksaan.lingkar_kepala;
            balita.latest_pemeriksaan_date = latestPemeriksaan.tgl_ukur || latestPemeriksaan.created_at;
          }
        }
      } catch (e) {
        console.warn('Error fetching latest pemeriksaan:', e.message);
      }

      data.push(balita);
    }
    
    // Sort manually by nama_anak
    data.sort((a, b) => {
      const namaA = (a.nama_anak || '').toLowerCase();
      const namaB = (b.nama_anak || '').toLowerCase();
      return namaA.localeCompare(namaB);
    });
    
    return res.status(200).json({ success: true, data });
  } catch (err) {
    console.error('admin_get_balita error:', err);
    return res.status(500).json({ success: false, message: err.message || 'Internal Server Error' });
  }
}

