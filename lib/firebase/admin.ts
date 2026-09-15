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
  type ServiceAccount,
} from "firebase-admin/app";

let cachedApp: App | undefined;

function cleanPrivateKey(key: string): string {
  let cleaned = key.trim();
  // Hapus tanda kutip pembungkus jika terikut saat copy-paste ke Vercel env
  if (
    (cleaned.startsWith('"') && cleaned.endsWith('"')) ||
    (cleaned.startsWith("'") && cleaned.endsWith("'"))
  ) {
    cleaned = cleaned.slice(1, -1);
  }

  // Jika private key di-encode dalam base64
  if (!cleaned.includes("-----BEGIN PRIVATE KEY-----")) {
    try {
      const decoded = Buffer.from(cleaned, "base64").toString("utf-8");
      if (decoded.includes("-----BEGIN PRIVATE KEY-----")) {
        cleaned = decoded;
      }
    } catch {
      // Abaikan jika bukan base64 valid
    }
  }

  // Ubah literal \n menjadi newline asli
  return cleaned.replace(/\\n/g, "\n");
}

function resolveServiceAccount(): ServiceAccount | null {
  // Opsi 1: Base64 atau raw JSON via FIREBASE_SERVICE_ACCOUNT_KEY
  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (serviceAccountKey) {
    try {
      let jsonString = serviceAccountKey.trim();
      if (
        (jsonString.startsWith('"') && jsonString.endsWith('"')) ||
        (jsonString.startsWith("'") && jsonString.endsWith("'"))
      ) {
        jsonString = jsonString.slice(1, -1);
      }

      // Jika di-encode base64
      if (!jsonString.startsWith("{")) {
        const decoded = Buffer.from(jsonString, "base64").toString("utf-8");
        if (decoded.trim().startsWith("{")) {
          jsonString = decoded;
        }
      }

      const parsed = JSON.parse(jsonString);
      if (parsed.private_key) {
        parsed.private_key = cleanPrivateKey(parsed.private_key);
      }
      return parsed as ServiceAccount;
    } catch (err) {
      console.error("[Firebase Admin] Gagal membaca FIREBASE_SERVICE_ACCOUNT_KEY:", err);
    }
  }

  // Opsi 2: Environment variables terpisah
  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKeyRaw = process.env.FIREBASE_PRIVATE_KEY;

  if (projectId && clientEmail && privateKeyRaw) {
    return {
      projectId,
      clientEmail,
      privateKey: cleanPrivateKey(privateKeyRaw),
    };
  }

  return null;
}

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

  const serviceAccount = resolveServiceAccount();

  if (!serviceAccount) {
    const errorMsg =
      "Firebase Admin SDK tidak dapat diinisialisasi: " +
      "Pastikan Environment Variables telah diatur di Vercel / .env.local " +
      "(gunakan FIREBASE_SERVICE_ACCOUNT_KEY atau kombinasi FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY).";
    console.error(`[Firebase Admin Error] ${errorMsg}`);
    throw new Error(errorMsg);
  }

  try {
    cachedApp = initializeApp({
      credential: cert(serviceAccount),
    });
    return cachedApp;
  } catch (error) {
    console.error("[Firebase Admin Init Exception]:", error);
    throw error;
  }
}

export { getFirebaseAdmin };
export default getFirebaseAdmin;
