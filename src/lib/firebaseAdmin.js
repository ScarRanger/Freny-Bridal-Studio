
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';


let app;
if (!getApps().length) {
  // Read base64-encoded service account JSON from env
  const base64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
  if (!base64) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_BASE64 env variable is not set');
  }
  const serviceAccount = JSON.parse(Buffer.from(base64, 'base64').toString('utf8'));
  app = initializeApp({
    credential: cert(serviceAccount),
  });
} else {
  app = getApps()[0];
}

export const adminDb = getFirestore(app);
