import { createContext, useState, useEffect, useCallback } from 'react';
import {
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider, messaging } from '../lib/firebase';
import { getToken } from 'firebase/messaging';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Create or update user document in Firestore
  const createUserDocument = async (firebaseUser) => {
    if (!firebaseUser) return;

    const userRef = doc(db, 'users', firebaseUser.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      // First-time user — create document
      await setDoc(userRef, {
        displayName: firebaseUser.displayName || '',
        email: firebaseUser.email || '',
        photoURL: firebaseUser.photoURL || '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
      // Existing user — update last login
      await setDoc(
        userRef,
        { updatedAt: serverTimestamp() },
        { merge: true }
      );
    }
  };

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          creationTime: firebaseUser.metadata.creationTime,
        });
        await createUserDocument(firebaseUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Request Notification Permissions & Save Token
  const requestNotificationPermission = useCallback(async () => {
    if (typeof Notification === 'undefined') return;
    
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        console.info('✅ Local Notifications enabled successfully!');
        
        // Attempt Firebase Cloud Messaging registration if supported
        if (messaging && user) {
          try {
            const token = await getToken(messaging, { 
              vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY 
            });
            if (token) {
              const userRef = doc(db, 'users', user.uid);
              await setDoc(userRef, { fcmToken: token, updatedAt: serverTimestamp() }, { merge: true });
              console.log('FCM Token synced.');
            }
          } catch (err) {
            console.warn('FCM not configured, but local timer notifications will work fine.', err);
          }
        }
        
        // Force state update to re-render the Sidebar
        setUser(u => ({ ...u }));
      } else {
        console.warn('Notification permission denied.');
      }
    } catch (error) {
      console.error('An error occurred while retrieving token. ', error);
    }
  }, [user]);

  // Sign in with Google
  const signInWithGoogle = useCallback(async () => {
    try {
      setLoading(true);
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Sign-in error:', error);
      setLoading(false);
      throw error;
    }
  }, []);

  // Sign out
  const signOut = useCallback(async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
    } catch (error) {
      console.error('Sign-out error:', error);
      throw error;
    }
  }, []);

  const value = {
    user,
    loading,
    signInWithGoogle,
    signOut,
    requestNotificationPermission,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
