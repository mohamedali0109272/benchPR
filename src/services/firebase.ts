import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithCredential,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || '(default)');
export const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Google blocks OAuth inside embedded WebViews, so the Android app signs in
// through the native Google account picker (see MainActivity.kt) and receives
// an ID token back, which Firebase exchanges for a session.
declare global {
  interface Window {
    AndroidAuth?: {
      signIn: () => void;
      openBrowserAuth?: () => void;
      installUpdate?: (downloadUrl: string) => void;
    };
    __onNativeGoogleResult?: (idToken: string | null, error: string | null) => void;
  }
}

const NATIVE_APP_HOST = 'appassets.androidplatform.net';

export function isAndroidApp(): boolean {
  return typeof window !== 'undefined' && (window.location.hostname === NATIVE_APP_HOST || !!window.AndroidAuth);
}

export function openAndroidBrowserAuth(): void {
  if (window.AndroidAuth?.openBrowserAuth) {
    window.AndroidAuth.openBrowserAuth();
  } else {
    window.open('https://ais-pre-xfm4qcf5k75dpba4xnkto3-697317136065.europe-west3.run.app/auth-popup.html', '_blank');
  }
}

function requestNativeIdToken(): Promise<string> {
  return new Promise((resolve, reject) => {
    window.__onNativeGoogleResult = (idToken, error) => {
      if (idToken) resolve(idToken);
      else reject(new Error(error ?? 'CANCELLED'));
    };
    window.AndroidAuth!.signIn();
  });
}

export async function signInWithGoogle(): Promise<User> {
  if (window.location.hostname === NATIVE_APP_HOST && window.AndroidAuth) {
    const idToken = await requestNativeIdToken();
    const result = await signInWithCredential(auth, GoogleAuthProvider.credential(idToken));
    return result.user;
  }
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

export async function logoutUser(): Promise<void> {
  await signOut(auth);
}

export { onAuthStateChanged };
export type { User };
