import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, type Auth } from 'firebase/auth';
import {
  initializeFirestore,
  persistentLocalCache,
  type Firestore,
} from 'firebase/firestore';

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const isFirebaseConfigured = Boolean(config.apiKey && config.projectId && config.appId);

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

if (isFirebaseConfigured) {
  app = initializeApp(config);
  auth = getAuth(app);
  // Persistent offline cache (IndexedDB). Reads/writes work offline and
  // sync once the device is back online.
  db = initializeFirestore(app, {
    localCache: persistentLocalCache({}),
  });
}

export { app, auth, db };
export const googleProvider = new GoogleAuthProvider();

const rawAllowed = import.meta.env.VITE_ALLOWED_EMAILS ?? '';
export const allowedEmails = rawAllowed
  .split(',')
  .map((s: string) => s.trim().toLowerCase())
  .filter(Boolean);

export function isEmailAllowed(email: string | null | undefined): boolean {
  if (allowedEmails.length === 0) return true;
  if (!email) return false;
  return allowedEmails.includes(email.toLowerCase());
}
