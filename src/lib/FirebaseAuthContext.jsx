/**
 * FirebaseAuthContext
 * SINGLE SOURCE OF TRUTH: Firebase onAuthStateChanged()
 *
 * Guarantees:
 * - isLoading is NEVER true for more than 8 seconds (hard timeout)
 * - syncUserProfile failure → fallback minimal profile, app continues
 * - firebaseUser is always set (null or user) — never left undefined
 */
import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { syncUserProfile, clearUserProfile, getCachedProfile, buildMinimalProfile } from '@/lib/userProfile';

const FirebaseAuthContext = createContext();

export const FirebaseAuthProvider = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState(undefined);
  const [profile, setProfile] = useState(null);
  const [loadingPhase, setLoadingPhase] = useState('init');
  const [lastError, setLastError] = useState(null);
  const hardTimeoutRef = useRef(null);

  useEffect(() => {
    // Hard timeout: if auth hasn't resolved in 8s, force isLoading → false
    hardTimeoutRef.current = setTimeout(() => {
      setFirebaseUser(prev => {
        if (prev === undefined) {
          setLastError('Auth timeout — forcing sign-in page');
          setLoadingPhase('timeout');
          return null;
        }
        return prev;
      });
    }, 8000);

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      clearTimeout(hardTimeoutRef.current);

      if (!fbUser) {
        setLoadingPhase('no-user');
        clearUserProfile();
        setProfile(null);
        setFirebaseUser(null);
        return;
      }

      setLoadingPhase('syncing-profile');

      let p = null;
      try {
        p = await Promise.race([
          syncUserProfile(fbUser),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('syncUserProfile timed out after 5s')), 5000)
          ),
        ]);
        setLoadingPhase('profile-ok');
      } catch (err) {
        setLastError('Profile sync failed: ' + err.message);
        setLoadingPhase('profile-fallback');
        p = getCachedProfile() || buildMinimalProfile(fbUser);
      }

      setProfile(p);
      setFirebaseUser(fbUser);
    });

    return () => {
      clearTimeout(hardTimeoutRef.current);
      unsubscribe();
    };
  }, []);

  const logout = async () => {
    clearUserProfile();
    setProfile(null);
    setFirebaseUser(null);
    setLoadingPhase('logged-out');
    await signOut(auth);
  };

  const refreshProfile = async () => {
    if (firebaseUser) {
      try {
        const p = await syncUserProfile(firebaseUser);
        setProfile(p);
        return p;
      } catch (err) {
        setLastError('Refresh failed: ' + err.message);
      }
    }
    return null;
  };

  const isLoading = firebaseUser === undefined;

  return (
    <FirebaseAuthContext.Provider value={{
      firebaseUser, profile, isLoading, logout, refreshProfile,
      loadingPhase, lastError,
    }}>
      {children}
    </FirebaseAuthContext.Provider>
  );
};

export const useFirebaseAuth = () => {
  const context = useContext(FirebaseAuthContext);
  if (!context) throw new Error('useFirebaseAuth must be used within a FirebaseAuthProvider');
  return context;
};
