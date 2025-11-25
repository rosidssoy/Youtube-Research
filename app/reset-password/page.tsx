"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Lock, ArrowRight, Loader2, CheckCircle, AlertCircle, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get("token");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!password || !confirmPassword) return;

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (!token) {
            setError("Invalid or missing reset token");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to reset password");
            }

            setSuccess(true);
            toast.success("Password reset successfully");
            setTimeout(() => router.push("/login"), 3000);
        } catch (err: any) {
            setError(err.message);
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="text-center space-y-4">
                <div className="p-4 bg-destructive/10 text-destructive rounded-xl flex items-center justify-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    Invalid Reset Link
                </div>
                <Link href="/forgot-password" className="text-primary hover:underline">
                    Request a new link
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="text-center space-y-2">
                <h1 className="text-2xl font-bold tracking-tight">Set New Password</h1>
                <p className="text-muted-foreground text-sm">
                    Enter your new password below.
                </p>
            </div>

            {success ? (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6 text-center space-y-4"
                >
                    <div className="w-12 h-12 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto">
                        <CheckCircle className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="font-medium text-emerald-500">Password Reset!</h3>
                        <p className="text-sm text-muted-foreground">
                            Your password has been successfully updated. Redirecting to login...
                        </p>
                    </div>
                    <Link
                        href="/login"
                        className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                    >
                        Go to Login <ArrowRight className="w-4 h-4" />
                    </Link>
                </motion.div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label htmlFor="password" className="text-sm font-medium">
                            New Password
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                            <input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-secondary/50 border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
                                required
                                minLength={6}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="confirmPassword" className="text-sm font-medium">
                            Confirm Password
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                            <input
                                id="confirmPassword"
                                type="password"
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-secondary/50 border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
                                required
                                minLength={6}
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 p-3 rounded-lg">
                            <AlertCircle className="w-4 h-4" />
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary text-primary-foreground py-2.5 rounded-xl font-medium hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                    >
                        {loading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                Reset Password
                                <ArrowRight className="w-4 h-4" />
                            </>
                        )}
                    </button>
                </form>
            )}
        </div>
    );
}

export default function ResetPassword() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
                <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-30 animate-pulse" />
                <div className="absolute bottom-20 right-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl opacity-30 animate-pulse delay-1000" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md relative z-10"
            >
                <div className="bg-card border border-border rounded-2xl shadow-xl overflow-hidden">
                    <div className="p-8">
                        <Suspense fallback={<div className="flex justify-center"><Loader2 className="animate-spin" /></div>}>
                            <ResetPasswordForm />
                        </Suspense>
                    </div>

                    <div className="p-4 bg-secondary/30 border-t border-border text-center">
                        <Link
                            href="/login"
                            className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-2"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Login
                        </Link>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
