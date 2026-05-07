/**
 * FirebaseAuthContext
 *
 * Source of truth hierarchy:
 * 1. onAuthStateChanged (web — JS SDK has the session)
 * 2. getNativeSession()  (native iOS/Android — plugin session, JS SDK blind to it)
 * 3. null -> user is logged out
 *
 * isLoading is never true for more than 8 seconds (hard timeout).
 */
import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { syncUserProfile, clearUserProfile, getCachedProfile, buildMinimalProfile } from '@/lib/userProfile';
import { getNativeSession, clearNativeSession } from '@/lib/nativeSession';

const FirebaseAuthContext = createContext();

export const FirebaseAuthProvider = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState(undefined);
  const [profile, setProfile] = useState(null);
  const [loadingPhase, setLoadingPhase] = useState('init');
  const [lastError, setLastError] = useState(null);
  const hardTimeoutRef = useRef(null);

  useEffect(() => {
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

      if (fbUser) {
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
        return;
      }

      const nativeSession = getNativeSession();
      if (nativeSession) {
        setLoadingPhase('native-session');
        const syntheticUser = {
          email: nativeSession.email,
          uid: nativeSession.uid,
          displayName: nativeSession.displayName,
          photoURL: nativeSession.photoURL,
          _isNativeSession: true,
        };
        let p = null;
        try {
          p = await Promise.race([
            syncUserProfile(syntheticUser, nativeSession.idToken),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error('native syncUserProfile timeout 5s')), 5000)
            ),
          ]);
          setLoadingPhase('native-profile-ok');
        } catch (err) {
          setLastError('Native profile sync failed: ' + err.message);
          setLoadingPhase('native-profile-fallback');
          p = getCachedProfile() || buildMinimalProfile(syntheticUser);
        }
        setProfile(p);
        setFirebaseUser(syntheticUser);
        return;
      }

      setLoadingPhase('no-user');
      clearUserProfile();
      setProfile(null);
      setFirebaseUser(null);
    });

    return () => {
      clearTimeout(hardTimeoutRef.current);
      unsubscribe();
    };
  }, []);

  const logout = async () => {
    clearNativeSession();
    clearUserProfile();
    setProfile(null);
    setFirebaseUser(null);
    setLoadingPhase('logged-out');
    try { await signOut(auth); } catch (_) {}
  };

  const refreshProfile = async () => {
    if (firebaseUser) {
      try {
        const nativeSession = getNativeSession();
        const p = await syncUserProfile(firebaseUser, nativeSession?.idToken || null);
        setProfile(p);
        return p;
      } catch (err) {
        setLastError('Refresh failed: ' + err.message);
      }
    }
    return null;
  };

  // Called by SignIn.jsx on native login to immediately unblock AppRoutes
  const setNativeUser = (syntheticUser, p) => {
    setFirebaseUser(syntheticUser);
    setProfile(p);
    setLoadingPhase('native-injected');
  };

  // Called by Onboarding/Settings to update in-memory profile immediately
  const updateProfile = (updates) => {
    setProfile(prev => prev ? { ...prev, ...updates } : updates);
  };

  const isLoading = firebaseUser === undefined;

  return (
    <FirebaseAuthContext.Provider value={{
      firebaseUser, profile, isLoading, logout, refreshProfile, setNativeUser, updateProfile,
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
