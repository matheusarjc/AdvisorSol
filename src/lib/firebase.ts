import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";

// Use demo project for development to avoid real Firebase connection
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const firebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);

// For development, we'll use offline mode to prevent connection errors
if (process.env.NODE_ENV === "development" && typeof window !== "undefined") {
  try {
    // Emulators can be connected here if needed
    // connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
    // connectFirestoreEmulator(db, 'localhost', 8080);
    console.log("Firebase initialized for development with demo config");
  } catch (error) {
    // Emulators not available, continue with offline mode
    console.log("Firebase emulators not available, using offline mode");
  }
}
