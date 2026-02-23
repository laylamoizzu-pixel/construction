"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { getAdminProfile, updateAdminProfile, AdminProfile } from "@/app/actions";
import {
    Loader2,
    ArrowLeft,
    Save,
    User,
    Lock,
    Mail,
    Phone,
    Shield,
    Eye,
    EyeOff,
    CheckCircle2,
    XCircle,
} from "lucide-react";
import Link from "next/link";

type ToastType = "success" | "error";

interface Toast {
    message: string;
    type: ToastType;
}

export default function AdminSettingsPage() {
    const { user, loading: authLoading, role, changePassword } = useAuth();
    const router = useRouter();

    // Profile state
    const [profile, setProfile] = useState<AdminProfile | null>(null);
    const [profileForm, setProfileForm] = useState({ name: "", phone: "" });
    const [profileLoading, setProfileLoading] = useState(true);
    const [profileSaving, setProfileSaving] = useState(false);

    // Password state
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [passwordSaving, setPasswordSaving] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);


    // Toast state
    const [toast, setToast] = useState<Toast | null>(null);

    const showToast = useCallback((message: string, type: ToastType) => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    }, []);

    // Auth redirect
    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/admin/login");
        }
    }, [authLoading, user, router]);

    // Load profile
    useEffect(() => {
        if (user?.email) {
            getAdminProfile(user.email).then((data) => {
                setProfile(data);
                if (data) {
                    setProfileForm({ name: data.name, phone: data.phone || "" });
                }
                setProfileLoading(false);
            });
        }
    }, [user]);

    // Password strength
    const getPasswordStrength = (password: string) => {
        if (!password) return { score: 0, label: "", color: "" };
        let score = 0;
        if (password.length >= 6) score++;
        if (password.length >= 8) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;

        if (score <= 1) return { score: 1, label: "Weak", color: "bg-red-500" };
        if (score <= 2) return { score: 2, label: "Fair", color: "bg-orange-500" };
        if (score <= 3) return { score: 3, label: "Good", color: "bg-yellow-500" };
        if (score <= 4) return { score: 4, label: "Strong", color: "bg-green-500" };
        return { score: 5, label: "Very Strong", color: "bg-emerald-500" };
    };

    // Handlers
    const handleProfileSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?.email) return;
        setProfileSaving(true);
        const result = await updateAdminProfile(user.email, {
            name: profileForm.name,
            phone: profileForm.phone,
        });
        if (result.success) {
            showToast("Profile updated successfully", "success");
            // Refresh profile
            const updated = await getAdminProfile(user.email);
            if (updated) setProfile(updated);
        } else {
            showToast(result.error || "Failed to update profile", "error");
        }
        setProfileSaving(false);
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            showToast("New passwords do not match", "error");
            return;
        }
        if (passwordForm.newPassword.length < 6) {
            showToast("Password must be at least 6 characters", "error");
            return;
        }
        setPasswordSaving(true);
        const result = await changePassword(passwordForm.currentPassword, passwordForm.newPassword);
        if (result.success) {
            showToast("Password changed successfully", "success");
            setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
        } else {
            showToast(result.error || "Failed to change password", "error");
        }
        setPasswordSaving(false);
    };


    const passwordStrength = getPasswordStrength(passwordForm.newPassword);

    if (authLoading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-brand-gold" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 p-4 lg:p-6">
            <div className="max-w-3xl mx-auto">
                {/* Toast Notification */}
                {toast && (
                    <div
                        className={`fixed top-6 right-6 z-[100] flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl text-white text-sm font-medium transition-all duration-300 animate-in slide-in-from-top-2 ${toast.type === "success"
                            ? "bg-gradient-to-r from-green-600 to-emerald-600"
                            : "bg-gradient-to-r from-red-600 to-rose-600"
                            }`}
                    >
                        {toast.type === "success" ? (
                            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                        ) : (
                            <XCircle className="w-5 h-5 flex-shrink-0" />
                        )}
                        {toast.message}
                    </div>
                )}

                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link
                        href="/admin"
                        className="p-2.5 hover:bg-white rounded-xl transition-colors border border-transparent hover:border-gray-200 hover:shadow-sm"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </Link>
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Account Settings</h1>
                        <p className="text-gray-500 text-sm mt-0.5">Manage your profile, password, and login credentials</p>
                    </div>
                    <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-gray-100 shadow-sm">
                        <Shield className="w-4 h-4 text-brand-gold" />
                        <span className="text-sm font-medium text-gray-700 capitalize">{role}</span>
                    </div>
                </div>

                {/* Profile Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-6 overflow-hidden">
                    <div className="bg-gradient-to-r from-brand-green to-brand-green/90 p-6 flex items-center gap-4">
                        <div className="w-14 h-14 rounded-full bg-brand-gold flex items-center justify-center text-brand-green font-bold text-xl shadow-lg ring-4 ring-white/20">
                            {user.email?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h2 className="text-white font-semibold text-lg">{profile?.name || user.email?.split("@")[0]}</h2>
                            <p className="text-white/70 text-sm">{user.email}</p>
                        </div>
                    </div>

                    <form onSubmit={handleProfileSave} className="p-6 space-y-5">
                        <h3 className="font-semibold text-gray-800 flex items-center gap-2 text-base">
                            <User className="w-4.5 h-4.5 text-brand-green" />
                            Profile Information
                        </h3>

                        {profileLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="w-6 h-6 animate-spin text-brand-gold" />
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                                            Full Name
                                        </label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input
                                                type="text"
                                                value={profileForm.name}
                                                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                                                placeholder="Your full name"
                                                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-gold/30 focus:border-brand-gold transition-all text-sm bg-gray-50 focus:bg-white"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                                            Phone Number
                                        </label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input
                                                type="tel"
                                                value={profileForm.phone}
                                                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                                                placeholder="+1 (555) 000-0000"
                                                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-gold/30 focus:border-brand-gold transition-all text-sm bg-gray-50 focus:bg-white"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                                        Email Address
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="email"
                                            value={user.email || ""}
                                            disabled
                                            className="w-full pl-10 pr-4 py-2.5 border border-gray-100 rounded-xl text-sm bg-gray-100 text-gray-500 cursor-not-allowed"
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end pt-2">
                                    <button
                                        type="submit"
                                        disabled={profileSaving}
                                        className="flex items-center gap-2 px-5 py-2.5 bg-brand-green hover:bg-brand-green/90 text-white rounded-xl transition-all text-sm font-medium shadow-sm hover:shadow-md disabled:opacity-60"
                                    >
                                        {profileSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                        Save Profile
                                    </button>
                                </div>
                            </>
                        )}
                    </form>
                </div>

                {/* Password Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-6 overflow-hidden">
                    <form onSubmit={handlePasswordChange} className="p-6 space-y-5">
                        <h3 className="font-semibold text-gray-800 flex items-center gap-2 text-base">
                            <Lock className="w-4.5 h-4.5 text-brand-green" />
                            Change Password
                        </h3>

                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                                Current Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type={showCurrentPassword ? "text" : "password"}
                                    value={passwordForm.currentPassword}
                                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                                    placeholder="Enter current password"
                                    className="w-full pl-10 pr-12 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-gold/30 focus:border-brand-gold transition-all text-sm bg-gray-50 focus:bg-white"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                                    New Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type={showNewPassword ? "text" : "password"}
                                        value={passwordForm.newPassword}
                                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                        placeholder="Enter new password"
                                        className="w-full pl-10 pr-12 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-gold/30 focus:border-brand-gold transition-all text-sm bg-gray-50 focus:bg-white"
                                        required
                                        minLength={6}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>

                                {/* Password Strength Indicator */}
                                {passwordForm.newPassword && (
                                    <div className="mt-2.5">
                                        <div className="flex gap-1 mb-1">
                                            {[1, 2, 3, 4, 5].map((level) => (
                                                <div
                                                    key={level}
                                                    className={`h-1 flex-1 rounded-full transition-colors duration-300 ${level <= passwordStrength.score
                                                        ? passwordStrength.color
                                                        : "bg-gray-200"
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                        <p className={`text-xs font-medium ${passwordStrength.score <= 1 ? "text-red-500" :
                                            passwordStrength.score <= 2 ? "text-orange-500" :
                                                passwordStrength.score <= 3 ? "text-yellow-600" :
                                                    "text-green-600"
                                            }`}>
                                            {passwordStrength.label}
                                        </p>
                                    </div>
                                )}
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                                    Confirm New Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        value={passwordForm.confirmPassword}
                                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                        placeholder="Confirm new password"
                                        className={`w-full pl-10 pr-12 py-2.5 border rounded-xl focus:ring-2 focus:ring-brand-gold/30 focus:border-brand-gold transition-all text-sm bg-gray-50 focus:bg-white ${passwordForm.confirmPassword && passwordForm.confirmPassword !== passwordForm.newPassword
                                            ? "border-red-300"
                                            : "border-gray-200"
                                            }`}
                                        required
                                        minLength={6}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                {passwordForm.confirmPassword && passwordForm.confirmPassword !== passwordForm.newPassword && (
                                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                                        <XCircle className="w-3 h-3" /> Passwords do not match
                                    </p>
                                )}
                                {passwordForm.confirmPassword && passwordForm.confirmPassword === passwordForm.newPassword && passwordForm.newPassword.length >= 6 && (
                                    <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                                        <CheckCircle2 className="w-3 h-3" /> Passwords match
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-end pt-2">
                            <button
                                type="submit"
                                disabled={
                                    passwordSaving ||
                                    !passwordForm.currentPassword ||
                                    !passwordForm.newPassword ||
                                    passwordForm.newPassword !== passwordForm.confirmPassword
                                }
                                className="flex items-center gap-2 px-5 py-2.5 bg-brand-green hover:bg-brand-green/90 text-white rounded-xl transition-all text-sm font-medium shadow-sm hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {passwordSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                                Change Password
                            </button>
                        </div>
                    </form>
                </div>


                {/* Security Tips */}
                <div className="bg-brand-green/5 border border-brand-green/10 rounded-2xl p-5">
                    <h4 className="text-sm font-semibold text-brand-green flex items-center gap-2 mb-3">
                        <Shield className="w-4 h-4" />
                        Security Recommendations
                    </h4>
                    <ul className="text-xs text-gray-600 space-y-1.5">
                        <li className="flex items-start gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-brand-green flex-shrink-0 mt-0.5" />
                            Use a strong password with at least 8 characters, including uppercase, numbers and symbols.
                        </li>
                        <li className="flex items-start gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-brand-green flex-shrink-0 mt-0.5" />
                            Never share your admin credentials with unauthorized personnel.
                        </li>
                        <li className="flex items-start gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-brand-green flex-shrink-0 mt-0.5" />
                            Change your password regularly to maintain account security.
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
