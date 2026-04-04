'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api, type User } from './api';

interface AuthContextType {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (data: { email: string; password: string; full_name?: string; org_name?: string }) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Restore session from localStorage
    useEffect(() => {
        const savedToken = localStorage.getItem('srp_token');
        const savedUser = localStorage.getItem('srp_user');

        if (savedToken && savedUser) {
            try {
                setToken(savedToken);
                setUser(JSON.parse(savedUser));
            } catch {
                localStorage.removeItem('srp_token');
                localStorage.removeItem('srp_user');
            }
        }
        setIsLoading(false);
    }, []);

    const login = useCallback(async (email: string, password: string) => {
        const res = await api.auth.login(email, password);
        setUser(res.user);
        setToken(res.token);
        localStorage.setItem('srp_token', res.token);
        localStorage.setItem('srp_user', JSON.stringify(res.user));
    }, []);

    const register = useCallback(async (data: { email: string; password: string; full_name?: string; org_name?: string }) => {
        const res = await api.auth.register(data);
        setUser(res.user);
        setToken(res.token);
        localStorage.setItem('srp_token', res.token);
        localStorage.setItem('srp_user', JSON.stringify(res.user));
    }, []);

    const logout = useCallback(() => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('srp_token');
        localStorage.removeItem('srp_user');
    }, []);

    const value: AuthContextType = { user, token, isLoading, login, register, logout };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}
