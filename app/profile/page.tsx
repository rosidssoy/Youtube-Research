"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { User, Lock, Trash2, Save, Loader2, AlertCircle, CheckCircle, Shield } from "lucide-react";
import { toast } from "sonner";
import AppNavbar from "@/components/AppNavbar";

export default function ProfilePage() {
    const { data: session, update } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<"general" | "security" | "danger">("general");

    // General Form State
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");

    // Password Form State
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    useEffect(() => {
        if (session?.user) {
            setName(session.user.name || "");
            setEmail(session.user.email || "");
        }
    }, [session]);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch("/api/user/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name }),
            });

            if (!res.ok) throw new Error("Failed to update profile");

            await update({ name }); // Update session
            toast.success("Profile updated successfully");
        } catch (error) {
            toast.error("Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            toast.error("New passwords do not match");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("/api/user/change-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ currentPassword, newPassword }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to change password");

            toast.success("Password changed successfully");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (!confirm("Are you sure you want to delete your account? This action cannot be undone.")) return;

        setLoading(true);
        try {
            const res = await fetch("/api/user/account", {
                method: "DELETE",
            });

            if (!res.ok) throw new Error("Failed to delete account");

            toast.success("Account deleted");
            signOut({ callbackUrl: "/" });
        } catch (error) {
            toast.error("Failed to delete account");
            setLoading(false);
        }
    };

    if (!session) {
        return null; // Middleware handles redirect usually
    }

    return (
        <div className="min-h-screen bg-background">
            <AppNavbar />
            <div className="p-4 md:p-8">
                <div className="max-w-4xl mx-auto space-y-8">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
                        <p className="text-muted-foreground">Manage your account settings and preferences.</p>
                    </div>

                    <div className="flex flex-col md:flex-row gap-8">
                        {/* Sidebar Navigation */}
                        <aside className="w-full md:w-64 space-y-2">
                            <button
                                onClick={() => setActiveTab("general")}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === "general"
                                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                                    : "hover:bg-secondary text-muted-foreground hover:text-foreground"
                                    }`}
                            >
                                <User className="w-4 h-4" />
                                General
                            </button>
                            <button
                                onClick={() => setActiveTab("security")}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === "security"
                                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                                    : "hover:bg-secondary text-muted-foreground hover:text-foreground"
                                    }`}
                            >
                                <Shield className="w-4 h-4" />
                                Security
                            </button>
                            <button
                                onClick={() => setActiveTab("danger")}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === "danger"
                                    ? "bg-destructive text-destructive-foreground shadow-lg shadow-destructive/20"
                                    : "hover:bg-destructive/10 text-destructive"
                                    }`}
                            >
                                <Trash2 className="w-4 h-4" />
                                Danger Zone
                            </button>
                        </aside>

                        {/* Content Area */}
                        <div className="flex-1">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.2 }}
                                className="bg-card border border-border rounded-2xl p-6 shadow-sm"
                            >
                                {activeTab === "general" && (
                                    <form onSubmit={handleUpdateProfile} className="space-y-6">
                                        <div>
                                            <h2 className="text-xl font-semibold mb-1">General Information</h2>
                                            <p className="text-sm text-muted-foreground">Update your public profile information.</p>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Full Name</label>
                                                <input
                                                    type="text"
                                                    value={name}
                                                    onChange={(e) => setName(e.target.value)}
                                                    className="w-full px-4 py-2 bg-secondary/50 border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Email Address</label>
                                                <input
                                                    type="email"
                                                    value={email}
                                                    disabled
                                                    className="w-full px-4 py-2 bg-secondary/30 border border-border rounded-xl text-muted-foreground cursor-not-allowed"
                                                />
                                                <p className="text-xs text-muted-foreground">Email cannot be changed.</p>
                                            </div>
                                        </div>

                                        <div className="pt-4">
                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className="px-6 py-2 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 disabled:opacity-50 transition-all flex items-center gap-2"
                                            >
                                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                                Save Changes
                                            </button>
                                        </div>
                                    </form>
                                )}

                                {activeTab === "security" && (
                                    <form onSubmit={handleChangePassword} className="space-y-6">
                                        <div>
                                            <h2 className="text-xl font-semibold mb-1">Password & Security</h2>
                                            <p className="text-sm text-muted-foreground">Manage your password and security settings.</p>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Current Password</label>
                                                <div className="relative">
                                                    <Lock className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                                                    <input
                                                        type="password"
                                                        value={currentPassword}
                                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                                        className="w-full pl-10 pr-4 py-2 bg-secondary/50 border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">New Password</label>
                                                <div className="relative">
                                                    <Lock className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                                                    <input
                                                        type="password"
                                                        value={newPassword}
                                                        onChange={(e) => setNewPassword(e.target.value)}
                                                        className="w-full pl-10 pr-4 py-2 bg-secondary/50 border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none"
                                                        required
                                                        minLength={6}
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Confirm New Password</label>
                                                <div className="relative">
                                                    <Lock className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                                                    <input
                                                        type="password"
                                                        value={confirmPassword}
                                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                                        className="w-full pl-10 pr-4 py-2 bg-secondary/50 border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none"
                                                        required
                                                        minLength={6}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-4">
                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className="px-6 py-2 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 disabled:opacity-50 transition-all flex items-center gap-2"
                                            >
                                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                                Update Password
                                            </button>
                                        </div>
                                    </form>
                                )}

                                {activeTab === "danger" && (
                                    <div className="space-y-6">
                                        <div>
                                            <h2 className="text-xl font-semibold mb-1 text-destructive">Danger Zone</h2>
                                            <p className="text-sm text-muted-foreground">Irreversible actions for your account.</p>
                                        </div>

                                        <div className="p-4 border border-destructive/20 bg-destructive/5 rounded-xl space-y-4">
                                            <div className="flex items-start gap-4">
                                                <div className="p-2 bg-destructive/10 rounded-lg text-destructive">
                                                    <AlertCircle className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <h3 className="font-medium text-foreground">Delete Account</h3>
                                                    <p className="text-sm text-muted-foreground mt-1">
                                                        Permanently delete your account and all associated data (history, saved videos, etc.). This action cannot be undone.
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="pt-2">
                                                <button
                                                    onClick={handleDeleteAccount}
                                                    disabled={loading}
                                                    className="px-4 py-2 bg-destructive text-destructive-foreground rounded-lg text-sm font-medium hover:bg-destructive/90 transition-colors flex items-center gap-2"
                                                >
                                                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                                    Delete Account
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
