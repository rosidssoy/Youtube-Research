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
                <Link href="/" className="flex items-center gap-2">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <Youtube className="w-6 h-6 text-primary" />
                    </div>
                    <span className="text-xl font-bold tracking-tight">VibeClone</span>
                </Link>

                <div className="flex items-center gap-4">
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
