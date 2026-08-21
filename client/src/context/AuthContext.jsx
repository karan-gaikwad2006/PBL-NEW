import React, { createContext, useState, useEffect, useCallback, useRef } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { userService } from '../services/api';

export const ROLE_DASHBOARD_MAP = Object.freeze({
  donor: '/donor/dashboard',
  requester: '/requester/dashboard',
  institution: '/institution-profile',
  admin: '/admin/dashboard',
});

export function getDashboardForRole(role) {
  if (!role) return null;
  return ROLE_DASHBOARD_MAP[role] || null;
}

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [user, setUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPromiseRef = useRef(null);
  const lastSyncedUidRef = useRef(null);

  const clearFetchIfDone = () => {
    fetchPromiseRef.current = null;
  };

  const syncWithBackend = useCallback(async (fUser, role = null, fullName = null) => {
    setIsProfileLoading(true);
    try {
      const token = await fUser.getIdToken();
      const response = await userService.sync(token, role, fullName);
      setUser(response.data);
      lastSyncedUidRef.current = fUser.uid;
      return response.data;
    } catch (err) {
      console.error('[AUTH] Sync failed:', err.message);
      setError(err.message);
      return null;
    } finally {
      setIsProfileLoading(false);
    }
  }, []);

  const fetchProfile = useCallback(async (fUser) => {
    if (!fUser) return null;

    if (fetchPromiseRef.current && lastSyncedUidRef.current === fUser.uid) {
      return fetchPromiseRef.current;
    }

    const promise = (async () => {
      setIsProfileLoading(true);
      try {
        const token = await fUser.getIdToken(true);
        const response = await userService.getProfile(token);
        setUser(response.data);
        lastSyncedUidRef.current = fUser.uid;
        return response.data;
      } catch (err) {
        console.error('[AUTH] Profile fetch failed:', err.message);
        setUser(null);
        return null;
      } finally {
        setIsProfileLoading(false);
        clearFetchIfDone();
      }
    })();

    fetchPromiseRef.current = promise;
    return promise;
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fUser) => {
      setFirebaseUser(fUser);
      setIsAuthLoading(true);
      if (fUser) {
        await fetchProfile(fUser);
      } else {
        setUser(null);
        lastSyncedUidRef.current = null;
        fetchPromiseRef.current = null;
      }
      setIsAuthLoading(false);
    });

    return unsubscribe;
  }, [fetchProfile]);

  const login = useCallback(async (email, password) => {
    setError(null);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const fUser = userCredential.user;
      const profile = await fetchProfile(fUser);
      return { firebaseUser: fUser, profile };
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [fetchProfile]);

  const register = useCallback(async (email, password, role, fullName) => {
    setError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const fUser = userCredential.user;
      const profile = await syncWithBackend(fUser, role, fullName);
      return { firebaseUser: fUser, profile };
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [syncWithBackend]);

  const logout = useCallback(async () => {
    try {
      await signOut(auth);
      setFirebaseUser(null);
      setUser(null);
      lastSyncedUidRef.current = null;
      fetchPromiseRef.current = null;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const resetPassword = useCallback(async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const updateProfile = useCallback(async (data) => {
    if (!firebaseUser) return null;
    setIsProfileLoading(true);
    try {
      const token = await firebaseUser.getIdToken();
      const response = await userService.updateProfile(token, data);
      setUser(response.data);
      return response.data;
    } catch (err) {
      console.error('[AUTH] Profile update failed:', err.message);
      setError(err.message);
      throw err;
    } finally {
      setIsProfileLoading(false);
    }
  }, [firebaseUser]);

  const value = {
    firebaseUser,
    user,
    isAuthenticated: !!firebaseUser,
    isProfileLoaded: !!user,
    loading: isAuthLoading || isProfileLoading,
    error,
    login,
    register,
    logout,
    resetPassword,
    updateProfile,
    getDashboardForRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthContext;
