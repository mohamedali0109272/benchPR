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
import { doc, getDocFromServer, getFirestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || '(default)');
export const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null,
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
void testConnection();

// Google blocks OAuth inside embedded WebViews, so the Android app signs in
// through the native Google account picker (see MainActivity.kt) or browser fallback
// and receives Google OAuth tokens back, which Firebase exchanges for a session.
declare global {
  interface Window {
    AndroidAuth?: {
      signIn: () => void;
      openBrowserAuth?: () => void;
      installUpdate?: (downloadUrl: string) => void;
    };
    __onUpdateProgress?: (percent: number) => void;
    __onUpdateError?: (message: string) => void;
    __onNativeGoogleResult?: (
      idToken: string | null,
      error: string | null,
      accessToken?: string | null,
    ) => void;
  }
}

const NATIVE_APP_HOST = 'appassets.androidplatform.net';

export function isAndroidApp(): boolean {
  return typeof window !== 'undefined' && (window.location.hostname === NATIVE_APP_HOST || !!window.AndroidAuth);
}

type NativeAuthResult = { idToken: string | null; accessToken: string | null };
let pendingNativeAuth: {
  resolve: (value: NativeAuthResult) => void;
  reject: (reason?: unknown) => void;
} | null = null;

if (typeof window !== 'undefined') {
  window.__onNativeGoogleResult = (idToken, error, accessToken) => {
    const pending = pendingNativeAuth;
    pendingNativeAuth = null;

    if (idToken || accessToken) {
      const creds: NativeAuthResult = {
        idToken: idToken || null,
        accessToken: accessToken || null,
      };
      if (pending) {
        pending.resolve(creds);
      } else {
        signInWithCredential(
          auth,
          GoogleAuthProvider.credential(creds.idToken, creds.accessToken),
        ).catch((err) => {
          console.error('Native deep-link signInWithCredential failed:', err);
        });
      }
      return;
    }

    const errObj = new Error(error ?? 'CANCELLED');
    if (pending) {
      pending.reject(errObj);
    } else if (error && error !== 'CANCELLED') {
      console.error('Native Google auth error:', error);
    }
  };
}

export function openAndroidBrowserAuth(): void {
  if (window.AndroidAuth?.openBrowserAuth) {
    window.AndroidAuth.openBrowserAuth();
  } else {
    window.open(`${window.location.origin}/auth-popup.html`, '_blank');
  }
}

function requestNativeGoogleCredential(): Promise<NativeAuthResult> {
  return new Promise((resolve, reject) => {
    pendingNativeAuth = { resolve, reject };
    window.AndroidAuth!.signIn();
  });
}

export async function signInWithGoogle(): Promise<User> {
  if (window.location.hostname === NATIVE_APP_HOST && window.AndroidAuth) {
    const { idToken, accessToken } = await requestNativeGoogleCredential();
    const result = await signInWithCredential(auth, GoogleAuthProvider.credential(idToken, accessToken));
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
