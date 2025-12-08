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
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    // Tanpa orderBy untuk menghindari index requirement, sort manual di JavaScript
    const snapshot = await db.collection('orang_tua').get();
    let data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      created_at: doc.data().created_at?.toDate ? doc.data().created_at.toDate() : null,
    }));

    // Sort manually by created_at (terbaru dulu)
    data.sort((a, b) => {
      const dateA = a.created_at ? new Date(a.created_at) : new Date(0);
      const dateB = b.created_at ? new Date(b.created_at) : new Date(0);
      return dateB - dateA;
    });

    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Error admin_get_orang_tua:', error);
    return res.status(500).json({ success: false, message: error.message || 'Internal Server Error' });
  }
}

