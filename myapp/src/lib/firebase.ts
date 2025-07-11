import { initializeApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth, signInWithEmailAndPassword, signInWithPopup, GithubAuthProvider, onAuthStateChanged } from "firebase/auth";

// Firebase configuration object with type annotation
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app: FirebaseApp = initializeApp(firebaseConfig);
export const auth: Auth = getAuth(app);
export const githubProvider = new GithubAuthProvider();
export { signInWithEmailAndPassword, signInWithPopup, onAuthStateChanged };