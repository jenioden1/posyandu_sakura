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
    const { id } = body;
    if (!id) return res.status(400).json({ success: false, message: 'id wajib diisi' });

    await db.collection('balita').doc(id).delete();

    // TODO: jika ada subkoleksi/riwayat ingin dihapus, tambahkan di sini

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('admin_delete_balita error:', err);
    return res.status(500).json({ success: false, message: err.message || 'Internal Server Error' });
  }
}

