// AppProvider.js
import React from 'react';
import {AuthProvider} from './AuthContext';
import {AppContextProvider} from './AppContext';

export function AppProvider({ children }) {
    return (
        <AuthProvider>
            <AppContextProvider>{children}</AppContextProvider>
        </AuthProvider>
    );
}