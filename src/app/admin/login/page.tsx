"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { Lock, Mail, Loader2 } from "lucide-react";

export default function AdminLoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            await login(email, password);
            router.push("/admin");
        } catch (err: unknown) {
            console.error(err);
            const error = err as { code?: string; message?: string };
            if (error?.code === "auth/invalid-credential" || error?.message?.includes("auth/invalid-credential")) {
                setError("Invalid credential");
            } else {
                const errorMessage = err instanceof Error ? err.message : "Invalid credentials";
                setError(errorMessage);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-brand-sand flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Brand Header */}
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-serif text-brand-green mb-2 tracking-tight">
                        Gharana<span className="italic text-brand-gold"> Realtors</span>
                    </h1>
                    <p className="text-brand-gray text-sm uppercase tracking-widest">Administration</p>
                </div>

                {/* Login Card */}
                <div className="bg-white border border-gray-100 p-10 shadow-[0_20px_50px_rgba(0,0,0,0.05)]">
                    <h2 className="text-2xl font-serif text-brand-dark mb-8 text-center">Welcome Back</h2>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm text-center">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-1">
                            <label className="block text-xs font-medium text-brand-gray uppercase tracking-wider">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-0 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@company.com"
                                    className="w-full pl-8 pr-4 py-3 bg-transparent border-b border-gray-200 text-brand-dark placeholder-gray-300 focus:outline-none focus:border-brand-gold transition-colors rounded-none"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="block text-xs font-medium text-brand-gray uppercase tracking-wider">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-0 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full pl-8 pr-4 py-3 bg-transparent border-b border-gray-200 text-brand-dark placeholder-gray-300 focus:outline-none focus:border-brand-gold transition-colors rounded-none"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-brand-green text-white font-medium hover:bg-brand-dark transition-colors disabled:opacity-70 flex items-center justify-center gap-2 mt-8 tracking-wide"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                "ACCESS PORTAL"
                            )}
                        </button>
                    </form>
                </div>

                <div className="text-center mt-8">
                    <p className="text-xs text-brand-gray">
                        &copy; {new Date().getFullYear()} Gharana Realtors. Operations only.
                    </p>
                </div>
            </div>
        </div>
    );
}
