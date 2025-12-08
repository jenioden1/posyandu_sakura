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
    // Get Firebase Auth token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split('Bearer ')[1];
    
    // Verify token and get user UID
    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(token);
    } catch (error) {
      return res.status(401).json({ success: false, message: 'Unauthorized: Invalid token' });
    }

    const userUid = decodedToken.uid;
    const userRole = decodedToken.role || 'orang_tua';

    // Verify user is orang_tua (or allow admin to view all)
    if (userRole !== 'orang_tua' && userRole !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden: Access denied' });
    }

    // Get orang_tua document ID from Firestore
    // Document ID should be the same as Firebase Auth UID (as per create_orang_tua.js)
    let orangTuaDocId = null;
    
    if (userRole === 'orang_tua') {
      // Try document ID first (most common case)
      const orangTuaDoc = await db.collection('orang_tua').doc(userUid).get();
      if (orangTuaDoc.exists) {
        orangTuaDocId = userUid;
      } else {
        // Fallback: find by uid field
        const orangTuaQuery = await db.collection('orang_tua')
          .where('uid', '==', userUid)
          .limit(1)
          .get();

        if (orangTuaQuery.empty) {
          // No orang_tua document found
          return res.status(200).json({ success: true, data: [] });
        } else {
          orangTuaDocId = orangTuaQuery.docs[0].id;
        }
      }
    }

    // Get balita data
    // Hapus orderBy untuk menghindari index requirement, sort manual di JavaScript
    let balitaQuery;
    if (userRole === 'admin') {
      // Admin can see all balita (tanpa orderBy untuk menghindari index)
      balitaQuery = await db.collection('balita').get();
    } else {
      // Orang tua can only see their own children
      if (!orangTuaDocId) {
        // No orang_tua document found, return empty
        return res.status(200).json({ success: true, data: [] });
      }
      
      // Query tanpa orderBy untuk menghindari composite index requirement
      balitaQuery = await db.collection('balita')
        .where('orang_tua_uid', '==', orangTuaDocId)
        .get();
    }

    const data = [];
    for (const doc of balitaQuery.docs) {
      const balita = { id: doc.id, ...doc.data() };
      
      // Format timestamps
      if (balita.created_at?.toDate) balita.created_at = balita.created_at.toDate().toISOString();
      if (balita.updated_at?.toDate) balita.updated_at = balita.updated_at.toDate().toISOString();
      
      // Get orang tua details if exists - PASTIKAN SEMUA DATA DARI ADMIN DIAMBIL
      if (balita.orang_tua_uid) {
        try {
          const otDoc = await db.collection('orang_tua').doc(balita.orang_tua_uid).get();
          if (otDoc.exists) {
            const otData = otDoc.data();
            balita.orang_tua = { id: otDoc.id, ...otData };
            // Populate nama_ayah and nama_ibu from orang_tua (prioritas dari orang_tua collection)
            balita.nama_ayah = otData.nama_ayah || balita.nama_ayah || null;
            balita.nama_ibu = otData.nama_ibu || balita.nama_ibu || null;
            // Pastikan nama_ortu juga diisi
            if (balita.nama_ayah && balita.nama_ibu) {
              balita.nama_ortu = `${balita.nama_ayah} / ${balita.nama_ibu}`;
            } else {
              balita.nama_ortu = balita.nama_ortu || balita.nama_ayah || balita.nama_ibu || null;
            }
          }
        } catch (e) {
          console.warn('Error fetching orang_tua:', e.message);
        }
      }

      // Fetch latest examination data for BB, TB, LL, LK, Status Gizi
      // Mengambil semua pemeriksaan tanpa orderBy (untuk menghindari index requirement)
      // Lalu sort manual di JavaScript
      try {
        const allPemeriksaanSnapshot = await db.collection('pemeriksaan')
          .where('balita_id', '==', balita.id)
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
          
          // Ambil yang terbaru (index 0) untuk ditampilkan di list balita
          if (allPemeriksaan.length > 0) {
            const latestPemeriksaan = allPemeriksaan[0];
            // Update dengan data terbaru dari pemeriksaan jika ada
            balita.bb = latestPemeriksaan.berat || balita.bb || null;
            balita.tb = latestPemeriksaan.tinggi || balita.tb || null;
            balita.ll = latestPemeriksaan.lila || balita.ll || null;
            balita.lk = latestPemeriksaan.lingkar_kepala || balita.lk || null;
            balita.status_gizi = latestPemeriksaan.status_gizi || null;
            balita.tgl_pemeriksaan_terakhir = latestPemeriksaan.tgl_ukur || null;
          }
          
          // Simpan juga data lengkap untuk referensi
          balita.total_pemeriksaan = allPemeriksaan.length;
        }
      } catch (e) {
        console.warn('Error fetching latest pemeriksaan:', e.message);
      }
      
      // Pastikan semua field dari admin tersedia (konsistensi data)
      // Field yang harus ada: nama_anak, tgl_lahir, jenis_kelamin, nama_ayah, nama_ibu, alamat, dll
      if (!balita.alamat) balita.alamat = balita.alamat || null;
      if (!balita.nik) balita.nik = balita.nik || null;
      
      data.push(balita);
    }

    // Sort manually by nama_anak (untuk semua role)
    if (data.length > 0) {
      data.sort((a, b) => {
        const namaA = (a.nama_anak || '').toLowerCase();
        const namaB = (b.nama_anak || '').toLowerCase();
        return namaA.localeCompare(namaB);
      });
    }

    return res.status(200).json({ success: true, data });
  } catch (err) {
    console.error('get_balita_by_orang_tua error:', err);
    console.error('Error details:', {
      message: err.message,
      code: err.code,
      stack: err.stack
    });
    return res.status(500).json({ 
      success: false, 
      message: err.message || 'Internal Server Error',
      code: err.code || 'UNKNOWN_ERROR'
    });
  }
}

