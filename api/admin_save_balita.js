import admin from 'firebase-admin';

if (!admin.apps.length) {
  const sa = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!sa) throw new Error('Missing env FIREBASE_SERVICE_ACCOUNT');
  admin.initializeApp({ credential: admin.credential.cert(JSON.parse(sa)) });
}

const db = admin.firestore();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    const {
      id,
      nama_anak,
      nik,
      jenis_kelamin,
      tgl_lahir,
      tanggal_lahir, // alias dari legacy
      nama_ortu,
      alamat,
      orang_tua_uid,
      orang_tua_id, // alias legacy
      penimbangan = [],
      // legacy fields
      nama_ayah,
      nama_ibu,
      bb,
      tb,
      ll,
      lk,
      pelayanan,
      keterangan,
    } = body;

    const finalTanggal = tgl_lahir || tanggal_lahir;
    const finalOrtuUid = orang_tua_uid || orang_tua_id || null;

    if (!nama_anak || !finalTanggal) {
      return res.status(400).json({ success: false, message: 'Nama anak dan tanggal lahir wajib diisi' });
    }
    if (!finalOrtuUid) {
      return res.status(400).json({ success: false, message: 'Akun orang tua wajib dipilih' });
    }

    // Ambil data orang tua dari Firestore untuk nama_ayah dan nama_ibu
    let namaAyah = nama_ayah || null;
    let namaIbu = nama_ibu || null;
    let finalNamaOrtu = nama_ortu || null;

    try {
      const orangTuaDoc = await db.collection('orang_tua').doc(finalOrtuUid).get();
      if (orangTuaDoc.exists) {
        const otData = orangTuaDoc.data();
        namaAyah = otData.nama_ayah || namaAyah;
        namaIbu = otData.nama_ibu || namaIbu;
        finalNamaOrtu = namaAyah && namaIbu ? `${namaAyah} / ${namaIbu}` : (namaAyah || namaIbu || finalNamaOrtu);
      }
    } catch (err) {
      console.warn('Error fetching orang_tua:', err);
    }

    // Build pelayanan string dari checkbox
    const pelayananList = [];
    if (body.pelayanan_vit_a) pelayananList.push('Vitamin A');
    if (body.pelayanan_oralit) pelayananList.push('Oralit');
    const finalPelayanan = pelayananList.length > 0 ? pelayananList.join(', ') : (pelayanan || null);

    const payload = {
      nama_anak: (nama_anak || '').trim(),
      nik: (nik || '').trim() || null,
      jenis_kelamin: jenis_kelamin || 'L',
      tgl_lahir: finalTanggal,
      nama_ortu: (finalNamaOrtu || '').trim() || null,
      alamat: (alamat || '').trim() || null,
      orang_tua_uid: finalOrtuUid,
      penimbangan: Array.isArray(penimbangan) ? penimbangan : [],
      nama_ayah: namaAyah || null,
      nama_ibu: namaIbu || null,
      bb: bb || null,
      tb: tb || null,
      ll: ll || null,
      lk: lk || null,
      pelayanan: finalPelayanan,
      keterangan: keterangan || null,
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    };

    if (id) {
      await db.collection('balita').doc(id).set(payload, { merge: true });
      return res.status(200).json({ success: true, id });
    } else {
      payload.created_at = admin.firestore.FieldValue.serverTimestamp();
      const docRef = await db.collection('balita').add(payload);
      return res.status(200).json({ success: true, id: docRef.id });
    }
  } catch (err) {
    console.error('admin_save_balita error:', err);
    return res.status(500).json({ success: false, message: err.message || 'Internal Server Error' });
  }
}

