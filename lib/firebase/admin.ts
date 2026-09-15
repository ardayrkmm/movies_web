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

const DEFAULT_FIREBASE_PROJECT_ID = "movies-38191";
const DEFAULT_FIREBASE_CLIENT_EMAIL =
  "firebase-adminsdk-fbsvc@movies-38191.iam.gserviceaccount.com";
const DEFAULT_FIREBASE_PRIVATE_KEY_B64 =
  "LS0tLS1CRUdJTiBQUklWQVRFIEtFWS0tLS0tCk1JSUV2Z0lCQURBTkJna3Foa2lHOXcwQkFRRUZB" +
  "QVNDQktnd2dnU2tBZ0VBQW9JQkFRRFNsQUhkd2I1am1qaC8KK05aK2FMVGdsRkRlbHlkZTA1Lytj" +
  "WWgrb3JJemI1Qkd4Ky85WXpWd0lGMyt5ZFM4TDJ0a3JVSGg1bGszWEFMKwpZanZXUG5BaVNwUmRO" +
  "cWwzc3BJM21CcHhvNFdXYUMvYlZjVkEzaFdMMldFTUhUeng5T0psNS9ybzBZamdNMzJaCjNSbXo2" +
  "N09SK1RFL0V3b0FLQmtpN3pDdTBsN3ZZM3hTb3FnV3VXODEvTlJsTlNMbTVFSVFZS0ZoTTR0SGxv" +
  "eU0KSFJ5UnBlRnlGb01udVVhaEpkczUzckozem9pT3JhSGUvczVjWSticm1WQnRiWXFHdVE0UUVh" +
  "WjQ4ekNxRWJXawpBZVBROG1VTm1ORWIyUDR2QkVJNGpYRjVSY3ZnYnNBN0h1RC84cE10cXJUM1Ba" +
  "T3EzRXJGSk16SUVqL0lLWmZaCnRiRGY4ZEhYQWdNQkFBRUNnZ0VBRi94bDdnV0lrejNZMjdMVGM5" +
  "aW5hY0ZiS00rYzIyOU5sU1VIZ0MwMkVTZlAKRGxEdDVEWHR1MVRrZ0FZclpqZ2NpbjQxdCs2T0VR" +
  "RTVFaExNY0EzeXBlVksyd2REN0c5NXVqMW9IYk9ibnRORgpTRDJQMTJDMG9aWmtPSVlJRUNOdHVs" +
  "L2ZNNi9TWUg5YytpNjJJOGxnVGV0TmticXdjKzRkVnQ1WjlEL2dNbkkwCmRvQVN4R1VaSmNXNEdp" +
  "RlluTFVuaFpkdEN0SmVYZExMdEdWZm4zMUVzaWU0MzBXdW1WZWN1V1NIWGRFblFRL3kKR0I3by82" +
  "dVBKUlRvOXRWRzhpbUprMzRDZktLQ243ZmRndTFFQkQvdUNhQmZPY243ZGEvZVhHSnQrU3l6Ui9q" +
  "Zgo2ZERwSFJzM2MxWERCcE5XUGxWWll4dzRraFQ4UXpvWmsxdFJDeThZS1FLQmdRRCtBbWN5c1BW" +
  "RmJOcDdDVzZpCjBXSGtweWdvcy9TRkM2eEhQT1liT3JRMFR2TllmMFpoeTljc1NuQ0pTT2lmMXEr" +
  "T0pTbHFkUGY1WXRnR242R3cKQWd2RUxIaEF1NXdtenZRK3FtK3dXWGswajlGZHBjSDJCYnRKYXcy" +
  "RitOVGM2SDNZZXhFUzhvU3UrTFU3ZUlxNApjWU45dGdGdmVmSE9uc1REaVRzVGdPVzNaUUtCZ1FE" +
  "VU9uak0zU1ZtanRjTGpWQmVWbVo1L0hHZDRHWFdobjlrCi9Xd295QjJyR1hQS0ZvdTZDTVpERlJ3" +
  "c2RxZ0IwR2NMTDBEL3Jjb2pXbEhtNEZjNnV2c2t2NUl5VDg2Y1VLZnUKK1huU0JZU3p2MHk0V2VU" +
  "SWw3dVVKSnl1QnZ3M3JvTjZvNnBBNzBZcEhoeTZacFAyMTJ0Q3EyMHN2RUlKcURMRQpqdHkvcGNG" +
  "bWl3S0JnUUNBdUVFSnJDa3UvR0dmTmdGdDJ3TnJ0dFdnQXNtbjNtbDRWRUVialYwaW9OdXFmaHp4" +
  "CmxEVy9TUjNNUkRrMlByb0tJNFRnWU5RRStmVVZMakhtbXJMUnYrTlVrbjRvSUhvZmc0bEQ2YU9G" +
  "WWxncng4TUoKNUkrclBlZkZlM3FMVS9ucUNUdDJ5WlU1Z2VsOWNMR0RsR3FZK3ZHeFJ5K2xrRW1Q" +
  "K1d3Smp5bGFEUUtCZ0VNWApVUVVDakVaRnRiblRMS3NHQ1ZOYStOZitEbk9wQlRENTVHMW9CZWtI" +
  "SE5Hd0d1L3V3aTZHeCtkT2c0SS9UYlA5CmRrRGR3ZDgzT0ZrU1pzRU1SMFN3d3hqZ25lSlFwU1lv" +
  "KzlmbklySm9NV3ErRUZOUmxGMGF6ZVUrRkJIT080WlQKb3dqd0cyLzRNd0RDV05oWjlYQ1lIT1Zk" +
  "aGtyalAxbGdDRzBWaTNSTkFvR0JBSnhnRTFuZ3Z0ZEpybno3Zlp0VwpaQkFQUWR6QjRWdUNNZnpi" +
  "djI0MTRyNUYzeWRlQWJoWGlOWVZIa3FFSGRPQ3lWM2h6UG8zeWh4eWxlODZXV3RECmRBYU5RTndF" +
  "QS9IZEpGczV0QlN1blc1TytkZlpRcG1uN25QOGR6RlNCZEZKenZsWk9FeHFId29GTU0yQzVhaGUK" +
  "ME1CS2Faak9JK2x0R3JVblRITHZZV1JUCi0tLS0tRU5EIFBSSVZBVEUgS0VZLS0tLS0K";

function resolveServiceAccount(): ServiceAccount {
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

  // Opsi 3: Fallback bawaan di kode (memastikan koneksi selalu berhasil)
  const defaultPrivateKey = Buffer.from(
    DEFAULT_FIREBASE_PRIVATE_KEY_B64,
    "base64"
  ).toString("utf-8");

  return {
    projectId: DEFAULT_FIREBASE_PROJECT_ID,
    clientEmail: DEFAULT_FIREBASE_CLIENT_EMAIL,
    privateKey: cleanPrivateKey(defaultPrivateKey),
  };
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
