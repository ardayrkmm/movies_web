/**
 * Firebase Admin SDK — Singleton Initialization
 *
 * Menggunakan lazy singleton pattern agar SDK hanya diinisialisasi sekali
 * dan tidak crash saat build time jika env vars belum tersedia.
 *
 * firebase-admin v14 menggunakan modular API:
 *   import { initializeApp, getApps, getApp, cert } from 'firebase-admin/app'
 *
 * Untuk mendapatkan credentials:
 * Firebase Console → Project Settings → Service Accounts → Generate new private key
 */

import {
  initializeApp,
  getApps,
  getApp,
  cert,
  type App,
} from "firebase-admin/app";

let cachedApp: App | undefined;

function getFirebaseAdmin(): App {
  // Gunakan instance yang sudah ter-cache
  if (cachedApp) {
    return cachedApp;
  }

  // Cek apakah sudah ada app yang diinisialisasi (hot-reload di dev mode)
  const apps = getApps();
  if (apps.length > 0) {
    cachedApp = getApp();
    return cachedApp;
  }

  // Validasi environment variables
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "Firebase Admin SDK tidak dapat diinisialisasi: " +
        "FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, dan FIREBASE_PRIVATE_KEY " +
        "harus diisi di .env.local"
    );
  }

  cachedApp = initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      // Env var menyimpan \n sebagai literal string — perlu di-unescape
      privateKey: privateKey.replace(/\\n/g, "\n"),
    }),
  });

  return cachedApp;
}

export { getFirebaseAdmin };
export default getFirebaseAdmin;
