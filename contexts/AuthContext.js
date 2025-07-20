// contexts/AuthContext.js
import React, {createContext, useContext, useMemo, useState} from 'react';
import {appleSignIn, createEmailAccount, googleSignIn, signIn, signOut} from '@/services/authService';

const AuthContext = createContext({
    signIn: () => Promise.resolve(),
    signOut: () => Promise.resolve(),
    googleSignIn: () => {},
    appleSignIn: () => {},
    createEmailAccount: () => Promise.resolve(),
    setSession: () => {},
    session: {},
    isLoading: true,
});

export const useSession = () => useContext(AuthContext);

export function AuthProvider({ children }) {
    const [session, setSession] = useState({});

    const authContextValue = useMemo(
        () => ({
            signIn,
            signOut,
            googleSignIn,
            appleSignIn,
            createEmailAccount,
            setSession,
            session,
        }),
        [session]
    );

    return <AuthContext.Provider value={authContextValue}>{children}</AuthContext.Provider>;
}