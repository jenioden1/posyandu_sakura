import admin from 'firebase-admin';

// Init Firebase Admin
if (!admin.apps.length) {
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!serviceAccountJson) {
    throw new Error('Missing env FIREBASE_SERVICE_ACCOUNT');
  }
  const serviceAccount = JSON.parse(serviceAccountJson);
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}

const db = admin.firestore();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    const { username, password, nama_ayah, nama_ibu, alamat = '', no_telp = '' } = body;

    if (!username || !password || !nama_ayah || !nama_ibu) {
      return res.status(400).json({ success: false, message: 'Field wajib belum lengkap' });
    }

    // Create user in Firebase Auth
    const userRecord = await admin.auth().createUser({
      email: username,
      password,
      displayName: `${nama_ayah} & ${nama_ibu}`,
      emailVerified: false,
      disabled: false,
    });

    // Set role orang_tua
    await admin.auth().setCustomUserClaims(userRecord.uid, { role: 'orang_tua' });

    // Save profile in Firestore (doc id = uid)
    const docData = {
      uid: userRecord.uid, // Store Firebase Auth UID for easy lookup
      username,
      nama_ayah,
      nama_ibu,
      alamat,
      no_telp,
      role: 'orang_tua',
      created_at: admin.firestore.FieldValue.serverTimestamp(),
    };

    await db.collection('orang_tua').doc(userRecord.uid).set(docData);

    return res.status(200).json({ success: true, message: 'Akun orang tua berhasil dibuat' });
  } catch (error) {
    console.error('Error create_orang_tua:', error);
    // Rollback: if Auth created but Firestore fails, you may delete user (optional)
    return res.status(500).json({ success: false, message: error.message || 'Internal Server Error' });
  }
}

