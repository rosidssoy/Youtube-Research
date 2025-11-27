"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Youtube, Moon, Sun } from "lucide-react";
import ProfileMenu from "@/components/ProfileMenu";

export default function AppNavbar() {
    const { data: session } = useSession();
    const [isDark, setIsDark] = useState(true);

    useEffect(() => {
        // Check initial theme
        if (document.documentElement.classList.contains("dark")) {
            setIsDark(true);
        } else {
            setIsDark(false);
        }
    }, []);

    const toggleTheme = () => {
        const newTheme = !isDark;
        setIsDark(newTheme);
        document.documentElement.classList.toggle("dark");
    };

    return (
        <header className="w-full border-b border-border/40 bg-background/80 backdrop-blur-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="relative w-8 h-8 flex items-center justify-center text-foreground group-hover:text-primary transition-colors duration-300">
                        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8">
                            <path d="M 8 8 L 8 24 L 20 16 Z" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.5" />
                            <path d="M 12 10 L 12 22 L 22 16 Z" fill="currentColor" />
                        </svg>
                    </div>
                    <span className="text-xl font-bold tracking-tight">VibeCloned</span>
                </Link>

                <div className="flex items-center gap-4">
                    <Link
                        href="/prompts"
                        className="text-sm font-medium hover:text-primary transition-colors"
                    >
                        🤖 AI Prompts
                    </Link>
                    {session ? (
                        <ProfileMenu />
                    ) : (
                        <>
                            <Link href="/login" className="text-sm font-medium hover:text-primary transition-colors">
                                Login
                            </Link>
                            <Link href="/signup" className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
                                Get Started
                            </Link>
                        </>
                    )}
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-full hover:bg-secondary transition-colors"
                    >
                        {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </button>
                </div>
            </div>
        </header>
    );
}
