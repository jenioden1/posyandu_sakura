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
    const { balita_id } = req.query;

    if (!balita_id) {
      return res.status(400).json({ success: false, message: 'balita_id is required' });
    }

    // Ambil data pemeriksaan berdasarkan balita_id
    // Tanpa orderBy untuk menghindari index requirement, sort manual di JavaScript
    const snapshot = await db.collection('pemeriksaan')
      .where('balita_id', '==', balita_id)
      .get();

    console.log(`[get_pemeriksaan_by_balita] Found ${snapshot.docs.length} pemeriksaan for balita_id: ${balita_id}`);

    let data = snapshot.docs.map(doc => {
      const docData = doc.data();
      
      // Normalize tgl_ukur (handle Firestore Timestamp)
      let tgl_ukur_normalized = null;
      if (docData.tgl_ukur) {
        if (docData.tgl_ukur.toDate) {
          tgl_ukur_normalized = docData.tgl_ukur.toDate().toISOString();
        } else if (typeof docData.tgl_ukur === 'string') {
          tgl_ukur_normalized = docData.tgl_ukur;
        } else {
          tgl_ukur_normalized = new Date(docData.tgl_ukur).toISOString();
        }
      }
      
      // Normalize created_at (handle Firestore Timestamp)
      let created_at_normalized = null;
      if (docData.created_at) {
        if (docData.created_at.toDate) {
          created_at_normalized = docData.created_at.toDate().toISOString();
        } else if (typeof docData.created_at === 'string') {
          created_at_normalized = docData.created_at;
        } else {
          created_at_normalized = new Date(docData.created_at).toISOString();
        }
      }
      
      return {
        id: doc.id,
        ...docData,
        // Normalize field names: berat/bb, tinggi/tb, lila/ll, lingkar_kepala/lk
        // Prioritize field names from pemeriksaan collection (berat, tinggi, lila, lingkar_kepala)
        berat: docData.berat !== undefined && docData.berat !== null ? docData.berat : (docData.bb || null),
        tinggi: docData.tinggi !== undefined && docData.tinggi !== null ? docData.tinggi : (docData.tb || null),
        lila: docData.lila !== undefined && docData.lila !== null ? docData.lila : (docData.ll || null),
        lingkar_kepala: docData.lingkar_kepala !== undefined && docData.lingkar_kepala !== null ? docData.lingkar_kepala : (docData.lk || null),
        // Keep original fields for backward compatibility
        bb: docData.bb || docData.berat || null,
        tb: docData.tb || docData.tinggi || null,
        ll: docData.ll || docData.lila || null,
        lk: docData.lk || docData.lingkar_kepala || null,
        // Convert Firestore Timestamp to ISO string
        tgl_ukur: tgl_ukur_normalized,
        created_at: created_at_normalized,
      };
    });

    console.log(`[get_pemeriksaan_by_balita] Processed ${data.length} pemeriksaan records`);

    // Sort manually by tgl_ukur or created_at (terbaru dulu)
    data.sort((a, b) => {
      const dateA = new Date(a.tgl_ukur || a.created_at || 0);
      const dateB = new Date(b.tgl_ukur || b.created_at || 0);
      return dateB - dateA;
    });

    return res.status(200).json({ success: true, data, count: data.length });
  } catch (err) {
    console.error('get_pemeriksaan_by_balita error:', err);
    return res.status(500).json({ success: false, message: err.message || 'Internal Server Error' });
  }
}

