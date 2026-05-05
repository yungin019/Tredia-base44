/**
 * FirebaseAuthContext — Firebase-based authentication context.
 *
 * SINGLE SOURCE OF TRUTH: Firebase onAuthStateChanged()
 * base44.auth.* is NOT used for authentication.
 */

import React, { createContext, useState, useContext, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { syncUserProfile, clearUserProfile } from '@/lib/userProfile';

const FirebaseAuthContext = createContext();

export const FirebaseAuthProvider = ({ children }) => {
  // undefined = still loading, null = logged out, object = logged in
  const [firebaseUser, setFirebaseUser] = useState(undefined);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        const p = await syncUserProfile(fbUser);
        setProfile(p);
        setFirebaseUser(fbUser);
      } else {
        clearUserProfile();
        setProfile(null);
        setFirebaseUser(null);
      }
    });
    return unsubscribe;
  }, []);

  const logout = async () => {
    clearUserProfile();
    setProfile(null);
    setFirebaseUser(null);
    await signOut(auth);
  };

  const refreshProfile = async () => {
    if (firebaseUser) {
      const p = await syncUserProfile(firebaseUser);
      setProfile(p);
      return p;
    }
    return null;
  };

  const isLoading = firebaseUser === undefined;

  return (
    <FirebaseAuthContext.Provider value={{ firebaseUser, profile, isLoading, logout, refreshProfile }}>
      {children}
    </FirebaseAuthContext.Provider>
  );
};

export const useFirebaseAuth = () => {
  const context = useContext(FirebaseAuthContext);
  if (!context) throw new Error('useFirebaseAuth must be used within a FirebaseAuthProvider');
  return context;
};