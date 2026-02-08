"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
    User,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut
} from "firebase/auth";
import { auth } from "@/lib/firebase";

interface AuthContextType {
    user: User | null;
    loading: boolean;
    initializing: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Persist minimal auth state to localStorage for faster initial render
const AUTH_STORAGE_KEY = "smart_avenue_auth";

function getPersistedAuth(): boolean {
    if (typeof window === "undefined") return false;
    try {
        return localStorage.getItem(AUTH_STORAGE_KEY) === "true";
    } catch {
        return false;
    }
}

function setPersistedAuth(isLoggedIn: boolean) {
    if (typeof window === "undefined") return;
    try {
        if (isLoggedIn) {
            localStorage.setItem(AUTH_STORAGE_KEY, "true");
        } else {
            localStorage.removeItem(AUTH_STORAGE_KEY);
        }
    } catch {
        // Ignore localStorage errors
    }
}

export function AuthProvider({ children }: { children: ReactNode }) {
    // Initialize with persisted state for instant UI
    const [hasPersistedAuth] = useState(() => getPersistedAuth());
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [initializing, setInitializing] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setLoading(false);
            setInitializing(false);
            setPersistedAuth(!!user);
        });

        // Force stop loading after 10 seconds to prevent infinite load
        const timeout = setTimeout(() => {
            setLoading((prev) => {
                if (prev) {
                    console.warn("Auth state change timeout - forcing loading to false");
                    return false;
                }
                return prev;
            });
        }, 10000);

        return () => {
            unsubscribe();
            clearTimeout(timeout);
        };
    }, []);

    const login = async (email: string, password: string) => {
        await signInWithEmailAndPassword(auth, email, password);
    };

    const logout = async () => {
        setPersistedAuth(false);
        await signOut(auth);
    };

    // If we have persisted auth, show UI immediately while Firebase validates
    const effectiveLoading = hasPersistedAuth ? false : loading;

    return (
        <AuthContext.Provider value={{
            user,
            loading: effectiveLoading,
            initializing,
            login,
            logout
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
