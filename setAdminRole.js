import admin from 'firebase-admin';
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });

const ADMIN_EMAIL = 'admin@gmail.com'; // atau gunakan UID jika sudah tahu

const main = async () => {
  const user = await admin.auth().getUserByEmail(ADMIN_EMAIL);
  await admin.auth().setCustomUserClaims(user.uid, { role: 'admin' });
  console.log('Set role admin untuk', ADMIN_EMAIL);
};
main().catch(console.error);