// src/contexts/SessionProvider.js
import React, { useContext, createContext, useEffect, useState } from 'react';
import {getAuth, getReactNativePersistence, initializeAuth, signInWithEmailAndPassword} from "firebase/auth";
import { useStorageState } from './StorageState';
import {initializeApp} from "firebase/app";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import {initializeFirestore} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAP7ZATyBFL934s87r-tvZNAVpq7t2cJas",
  authDomain: "puttperfect-e6438.firebaseapp.com",
  projectId: "puttperfect-e6438",
  storageBucket: "puttperfect-e6438.firebasestorage.app",
  messagingSenderId: "737663000705",
  appId: "1:737663000705:web:d3a6ed8c2e2f8a9c02ed80",
  measurementId: "G-ZM9VDTXJY9"
};

export const app = initializeApp(firebaseConfig);
export const firestore = initializeFirestore(app, {
  experimentalForceLongPolling: true,
  useFetchStreams: false,
});
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});


const AuthContext = createContext({
  signIn: () => Promise.resolve(),
  signOut: () => Promise.resolve(),
  session: null,
  isLoading: false,
});

// Custom hook to access authentication context
export function useSession() {
  return useContext(AuthContext);
}

export function SessionProvider({ children }) {
  const [[isLoading, session], setSession] = useStorageState('session', null);
  const [loading, setLoading] = useState(true);

  const auth = getAuth();

  // Firebase sign-in function
  const signIn = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const token = await userCredential.user.getIdToken();
      setSession(token || null);
    } catch (error) {
      console.error('Error during sign-in:', error);
      throw error;
    }
  };

  // Firebase sign-out function
  const signOut = async () => {
    try {
      await auth.signOut();
      setSession(null);
    } catch (error) {
      console.error('Error during sign-out:', error);
    }
  };

  // Monitor Firebase authentication state changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const token = await user.getIdToken();
        setSession(token);
      } else {
        setSession(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        signIn,
        signOut,
        session,
        isLoading: loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}