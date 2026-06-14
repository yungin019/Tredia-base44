import { initializeApp } from 'firebase/app';
import { initializeAuth, indexedDBLocalPersistence, browserLocalPersistence } from 'firebase/auth';
import { Capacitor } from '@capacitor/core';

const firebaseConfig = {
  apiKey: "AIzaSyDMQhF675zfVJZQ5dgL4OLbCZiiRK4d-O0",
  authDomain: "tredia-479515.firebaseapp.com",
  projectId: "tredia-479515",
  storageBucket: "tredia-479515.firebasestorage.app",
  messagingSenderId: "676892933166",
  appId: "1:676892933166:ios:4e8a0e10a9634550ac73bf"
};

const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: Capacitor.isNativePlatform() ? indexedDBLocalPersistence : browserLocalPersistence
});

export default app;