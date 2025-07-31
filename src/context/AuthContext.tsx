
'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { onAuthStateChanged, User, getRedirectResult } from 'firebase/auth';
import { auth, firestore, GoogleAuthProvider } from '@/lib/firebase';
import { doc, getDoc, DocumentData, setDoc, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  userData: DocumentData | null;
  loading: boolean;
  refetchUserData: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  loading: true,
  refetchUserData: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<DocumentData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = useCallback(async (currentUser: User) => {
    let userDocRef = doc(firestore, 'mentors', currentUser.uid);
    let userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      setUserData(userDoc.data());
      return;
    }
    
    userDocRef = doc(firestore, 'mentees', currentUser.uid);
    userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) {
      setUserData(userDoc.data());
    }
  }, []);
  
  const handleNewUserFromRedirect = useCallback(async (result: any) => {
    if (!result || !result.user) return false;
    const newUser = result.user;

    const mentorDocRef = doc(firestore, 'mentors', newUser.uid);
    const menteeDocRef = doc(firestore, 'mentees', newUser.uid);

    const mentorDoc = await getDoc(mentorDocRef);
    const menteeDoc = await getDoc(menteeDocRef);

    if (!mentorDoc.exists() && !menteeDoc.exists()) {
      // Store new user info in localStorage to be picked up by the Create Account page
      if (typeof window !== 'undefined') {
        localStorage.setItem('googleUser', JSON.stringify({
          uid: newUser.uid,
          email: newUser.email,
          displayName: newUser.displayName,
        }));
      }
      return true; // Indicates a new user that needs to choose a path
    }
    return false; // Existing user
  }, []);
  
  useEffect(() => {
    const handleAuth = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          const isNew = await handleNewUserFromRedirect(result);
          if (isNew) {
            // For new users, we will let them be redirected to choose-path
            // The onAuthStateChanged will handle the user object setting
          }
        }
      } catch (error) {
        console.error("Error processing redirect result", error);
      }
      
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
          setUser(user);
          await fetchUserData(user);
        } else {
          setUser(null);
          setUserData(null);
        }
        setLoading(false);
      });
      return unsubscribe;
    };

    const unsubscribePromise = handleAuth();

    return () => {
      unsubscribePromise.then(unsubscribe => unsubscribe && unsubscribe());
    };
  }, [fetchUserData, handleNewUserFromRedirect]);
  
  const refetchUserData = useCallback(() => {
    if (user) {
      setLoading(true);
      fetchUserData(user).finally(() => setLoading(false));
    }
  }, [user, fetchUserData]);

  const value = { user, userData, loading, refetchUserData };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
