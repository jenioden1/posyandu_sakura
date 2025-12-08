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
    const { id } = body;

    if (!id) {
      return res.status(400).json({ success: false, message: 'id wajib diisi' });
    }

    // Delete Firestore doc
    await db.collection('orang_tua').doc(id).delete();

    // Delete Auth user (ignore error if not found)
    try {
      await admin.auth().deleteUser(id);
    } catch (err) {
      console.warn('deleteUser warning:', err?.message);
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error delete_orang_tua:', error);
    return res.status(500).json({ success: false, message: error.message || 'Internal Server Error' });
  }
}

