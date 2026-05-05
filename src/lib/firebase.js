import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

/**
 * Firebase configuration.
 * For native iOS: replace with values from GoogleService-Info.plist
 * For native Android: replace with values from google-services.json
 */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyC2yUbUi-OdU0Vp-0fHJo_rXLmh2JjaKZk",
  authDomain: "tredia-479515.firebaseapp.com",
  projectId: "tredia-479515",
  storageBucket: "tredia-479515.firebasestorage.app",
  messagingSenderId: "676892933166",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:676892933166:web:b5ab440ecd9a78c3ac73bf",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;
