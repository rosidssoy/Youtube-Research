"use client";

import { useState, useRef, useEffect } from "react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { User, LogOut, History, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ProfileMenu() {
    const { data: session } = useSession();
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    if (!session?.user) return null;

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-secondary transition-colors"
            >
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                    <User className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium hidden md:block">{session.user.name || "User"}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-xl shadow-lg overflow-hidden z-50"
                    >
                        <div className="p-2">
                            <div className="px-3 py-2 text-xs text-muted-foreground border-b border-border mb-1">
                                {session.user.email}
                            </div>
                            <Link
                                href="/profile"
                                onClick={() => setIsOpen(false)}
                                className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-secondary transition-colors"
                            >
                                <User className="w-4 h-4" />
                                Profile Settings
                            </Link>
                            <Link
                                href="/history"
                                onClick={() => setIsOpen(false)}
                                className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-secondary transition-colors"
                            >
                                <History className="w-4 h-4" />
                                Analysis History
                            </Link>
                            <button
                                onClick={() => signOut({ callbackUrl: "/" })}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors text-left"
                            >
                                <LogOut className="w-4 h-4" />
                                Sign Out
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
