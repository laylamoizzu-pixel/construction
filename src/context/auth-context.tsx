"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
    User,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getStaffData } from "@/app/actions";

interface AuthContextType {
    user: User | null;
    role: string | null;
    permissions: string[];
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    role: null,
    permissions: [],
    loading: true,
    login: async () => { },
    logout: async () => { },
});

// Persist minimal auth state to localStorage for faster initial render
// Persist minimal auth state to localStorage for faster initial render
const AUTH_STORAGE_KEY = "smart_avenue_auth";

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
    const [permissions, setPermissions] = useState<string[]>([]);
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
                // Fetch staff data from server action in background without blocking UI
                getStaffData(user.email)
                    .then((data) => {
                        if (data) {
                            setRole(data.role);
                            setPermissions(data.permissions);
                        } else {
                            setRole("Staff");
                            setPermissions([]);
                        }
                    })
                    .catch((e) => {
                        console.error("Error fetching staff data", e);
                        setRole("Staff");
                        setPermissions([]);
                    });
            } else {
                setRole(null);
                setPermissions([]);
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
        <AuthContext.Provider value={{ user, role, permissions, loading: loading || initializing, login, logout }}>
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
