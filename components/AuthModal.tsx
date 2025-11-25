"use client";

import Link from "next/link";
import { X, Youtube, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-card border border-border shadow-2xl rounded-2xl p-8 z-50"
                    >
                        <button
                            onClick={onClose}
                            className="absolute right-4 top-4 p-2 rounded-full hover:bg-secondary transition-colors text-muted-foreground"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="flex flex-col items-center text-center space-y-6">
                            <div className="p-3 bg-primary/10 rounded-xl">
                                <Youtube className="w-8 h-8 text-primary" />
                            </div>

                            <div className="space-y-2">
                                <h2 className="text-2xl font-bold tracking-tight">Unlock VibeClone</h2>
                                <p className="text-muted-foreground">
                                    Sign up to extract video data, analyze competitors, and save your research history.
                                </p>
                            </div>

                            <div className="grid gap-2 w-full text-sm text-left bg-secondary/30 p-4 rounded-xl border border-border/50">
                                <div className="flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-primary" />
                                    <span>Unlimited Video Extraction</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-primary" />
                                    <span>Full Transcript Access</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-primary" />
                                    <span>Save Analysis History</span>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3 w-full">
                                <Link
                                    href="/signup"
                                    className="w-full py-3 px-4 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 text-center"
                                >
                                    Get Started for Free
                                </Link>
                                <Link
                                    href="/login"
                                    className="w-full py-3 px-4 bg-secondary text-secondary-foreground rounded-xl font-medium hover:bg-secondary/80 transition-colors text-center"
                                >
                                    Log In
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
