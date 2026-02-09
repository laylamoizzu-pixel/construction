"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
    User,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getStaffRole } from "@/app/actions";

interface AuthContextType {
    user: User | null;
    role: string | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    role: null,
    loading: true,
    login: async () => { },
    logout: async () => { },
});

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
    const [user, setUser] = useState<User | null>(null);
    const [role, setRole] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [initializing, setInitializing] = useState(true);
    const [, setPersistedAuthState] = useState(false); // Renamed to avoid conflict with function

    useEffect(() => {
        // Check local storage for persisted auth state to avoid flash of login screen
        const storedAuth = localStorage.getItem("isAuthenticated");
        if (storedAuth === "true") {
            setPersistedAuthState(true);
        }
        // Note: setting initializing to false here might conflict with the onAuthStateChanged useEffect
        // Depending on desired behavior, one of these might need adjustment.
        // For now, keeping as per instruction.
        setInitializing(false);
    }, []);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setLoading(false);
            setInitializing(false);
            setPersistedAuth(!!user);
            setPersistedAuthState(!!user);

            if (user && user.email) {
                // Fetch role from server action in background without blocking UI
                getStaffRole(user.email)
                    .then((userRole) => {
                        setRole(userRole || "Staff");
                    })
                    .catch((e) => {
                        console.error("Error fetching role", e);
                        setRole("Staff");
                    });
            } else {
                setRole(null);
            }
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

    return (
        <AuthContext.Provider value={{ user, role, loading: loading || initializing, login, logout }}>
            {!initializing && children}
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
