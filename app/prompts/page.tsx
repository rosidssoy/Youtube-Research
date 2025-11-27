"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Copy, Check, Loader2, Sparkles, AlertCircle, ChevronDown, ChevronRight } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import AppNavbar from "@/components/AppNavbar";
import { toast } from "sonner";

function cn(...inputs: any[]) {
    return twMerge(clsx(inputs));
}

export default function PromptsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [promptsByCategory, setPromptsByCategory] = useState<Record<string, any[]>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

    // Redirect if not authenticated
    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

    // Fetch prompts
    useEffect(() => {
        async function fetchPrompts() {
            if (status !== "authenticated") return;

            try {
                const res = await fetch("/api/prompts");

                if (!res.ok) {
                    const errorData = await res.json();
                    throw new Error(errorData.error || "Failed to fetch prompts");
                }

                const data = await res.json();
                setPromptsByCategory(data);

                // Expand only the first category by default
                const categories = Object.keys(data);
                if (categories.length > 0) {
                    setExpandedCategories(new Set([categories[0]]));
                }
            } catch (error: any) {
                console.error("Error fetching prompts:", error);
                setError(error.message);
                toast.error("Failed to load prompts");
            } finally {
                setLoading(false);
            }
        }

        fetchPrompts();
    }, [status]);

    const copyPrompt = async (id: string, prompt: string) => {
        try {
            await navigator.clipboard.writeText(prompt);
            setCopiedId(id);
            toast.success("Prompt copied to clipboard!");
            setTimeout(() => setCopiedId(null), 2000);
        } catch (error) {
            console.error("Failed to copy:", error);
            toast.error("Failed to copy prompt");
        }
    };

    const toggleCategory = (category: string) => {
        const newExpanded = new Set(expandedCategories);
        if (newExpanded.has(category)) {
            newExpanded.delete(category);
        } else {
            newExpanded.add(category);
        }
        setExpandedCategories(newExpanded);
    };

    // Loading state
    if (status === "loading" || (loading && status === "authenticated")) {
        return (
            <main className="min-h-screen flex flex-col bg-background text-foreground">
                <AppNavbar />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center space-y-4">
                        <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
                        <p className="text-muted-foreground">Loading prompts...</p>
                    </div>
                </div>
            </main>
        );
    }

    // Unauthorized state
    if (status === "unauthenticated") {
        return null;
    }

    // Main content
    return (
        <main className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300">
            <AppNavbar />

            {/* Hero Section */}
            <section className="relative pt-20 pb-16 px-4 overflow-hidden">
                {/* Background Gradients */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
                    <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-50 animate-pulse" />
                    <div className="absolute top-40 right-1/4 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl opacity-50 animate-pulse delay-1000" />
                </div>

                <div className="max-w-5xl mx-auto relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center space-y-6"
                    >
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/50 border border-border/50 text-xs font-medium text-muted-foreground">
                            <Sparkles className="w-3 h-3 text-primary" />
                            <span>🤖 AI-Powered Prompts</span>
                        </div>

                        {/* Title */}
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                            Prompt Library
                        </h1>

                        {/* Subtitle */}
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                            Ready-made AI prompts to supercharge your competitor analysis.
                            Copy, customize, and use them instantly to extract valuable insights.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Visual Workflow Section (Desktop Only) */}
            <section className="hidden md:block px-4 mb-12">
                <div className="max-w-5xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-card/50 backdrop-blur-sm border border-border rounded-xl p-8 shadow-sm"
                    >
                        <div className="text-center mb-8">
                            <h2 className="text-xl font-bold flex items-center justify-center gap-2">
                                <span className="text-2xl">📖</span> How It Works
                            </h2>
                        </div>

                        <div className="flex items-start justify-between relative">
                            {/* Step 1 */}
                            <div className="flex flex-col items-center text-center max-w-[180px] group">
                                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 border border-primary/20">
                                    <span className="text-2xl">📥</span>
                                </div>
                                <h3 className="font-bold text-sm mb-1">Extract Data</h3>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    Use tool to get JSON
                                </p>
                            </div>

                            {/* Arrow */}
                            <div className="pt-4 text-primary/50">
                                <ChevronRight className="w-6 h-6" />
                            </div>

                            {/* Step 2 */}
                            <div className="flex flex-col items-center text-center max-w-[180px] group">
                                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 border border-primary/20">
                                    <span className="text-2xl">📋</span>
                                </div>
                                <h3 className="font-bold text-sm mb-1">Choose Prompt</h3>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    Browse prompts below
                                </p>
                            </div>

                            {/* Arrow */}
                            <div className="pt-4 text-primary/50">
                                <ChevronRight className="w-6 h-6" />
                            </div>

                            {/* Step 3 */}
                            <div className="flex flex-col items-center text-center max-w-[180px] group">
                                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 border border-primary/20">
                                    <span className="text-2xl">🤖</span>
                                </div>
                                <h3 className="font-bold text-sm mb-1">Copy to AI</h3>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    Paste in Claude or ChatGPT
                                </p>
                            </div>

                            {/* Arrow */}
                            <div className="pt-4 text-primary/50">
                                <ChevronRight className="w-6 h-6" />
                            </div>

                            {/* Step 4 */}
                            <div className="flex flex-col items-center text-center max-w-[180px] group">
                                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 border border-primary/20">
                                    <span className="text-2xl">📊</span>
                                </div>
                                <h3 className="font-bold text-sm mb-1">Add Your JSON</h3>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    Paste extracted data
                                </p>
                            </div>

                            {/* Arrow */}
                            <div className="pt-4 text-primary/50">
                                <ChevronRight className="w-6 h-6" />
                            </div>

                            {/* Step 5 */}
                            <div className="flex flex-col items-center text-center max-w-[180px] group">
                                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 border border-primary/20">
                                    <span className="text-2xl">✨</span>
                                </div>
                                <h3 className="font-bold text-sm mb-1">Get Insights</h3>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    AI returns actionable analysis
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Prompts Section */}
            <section className="pb-20 px-4">
                <div className="max-w-5xl mx-auto space-y-8">
                    {/* Error State */}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-destructive/10 border border-destructive/20 rounded-xl p-6 text-center"
                        >
                            <AlertCircle className="w-8 h-8 text-destructive mx-auto mb-3" />
                            <h3 className="font-semibold text-destructive mb-2">Failed to Load Prompts</h3>
                            <p className="text-sm text-muted-foreground">{error}</p>
                        </motion.div>
                    )}

                    {/* Empty State */}
                    {!error && !loading && Object.keys(promptsByCategory).length === 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center py-16"
                        >
                            <Sparkles className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold mb-2">No Prompts Available</h3>
                            <p className="text-muted-foreground">
                                Check back soon for ready-made AI prompts!
                            </p>
                        </motion.div>
                    )}

                    {/* Prompts Grid */}
                    {!error && Object.entries(promptsByCategory).map(([category, prompts], categoryIndex) => {
                        const isExpanded = expandedCategories.has(category);

                        return (
                            <motion.div
                                key={category}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: categoryIndex * 0.1 }}
                            >
                                {/* Category Header - Clickable */}
                                <button
                                    onClick={() => toggleCategory(category)}
                                    className="w-full flex items-center gap-3 mb-6 group hover:opacity-80 transition-opacity"
                                >
                                    {isExpanded ? (
                                        <ChevronDown className="w-5 h-5 text-primary transition-transform" />
                                    ) : (
                                        <ChevronRight className="w-5 h-5 text-primary transition-transform" />
                                    )}
                                    <h2 className="text-2xl font-bold text-left">
                                        {category} <span className="text-muted-foreground text-lg">({prompts.length} {prompts.length === 1 ? 'prompt' : 'prompts'})</span>
                                    </h2>
                                </button>

                                {/* Prompt Cards Grid - Collapsible */}
                                {isExpanded && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="grid grid-cols-1 md:grid-cols-2 gap-6"
                                    >
                                        {prompts.map((prompt: any, index: number) => {
                                            const isCopied = copiedId === prompt.id;

                                            return (
                                                <motion.div
                                                    key={prompt.id}
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: (categoryIndex * 0.1) + (index * 0.05) }}
                                                    className="bg-card border border-border rounded-xl p-6 transition-all duration-300 hover:shadow-lg hover:border-primary/50 h-[300px] flex flex-col"
                                                >
                                                    {/* Card Title */}
                                                    <h3 className="text-lg font-semibold mb-4 text-card-foreground">
                                                        {prompt.title}
                                                    </h3>

                                                    {/* Scrollable Prompt Area */}
                                                    <div
                                                        className="flex-1 mb-4 p-4 bg-secondary/30 rounded-lg overflow-y-auto font-mono text-sm text-secondary-foreground whitespace-pre-wrap"
                                                        style={{
                                                            height: '200px',
                                                            scrollbarWidth: 'thin',
                                                            scrollbarColor: '#667eea transparent'
                                                        }}
                                                    >
                                                        {prompt.prompt}
                                                    </div>

                                                    {/* Copy Button */}
                                                    <button
                                                        onClick={() => copyPrompt(prompt.id, prompt.prompt)}
                                                        className={cn(
                                                            "w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-200",
                                                            isCopied
                                                                ? "bg-green-600 hover:bg-green-700 text-white"
                                                                : "bg-primary hover:bg-primary/90 text-primary-foreground"
                                                        )}
                                                    >
                                                        {isCopied ? (
                                                            <>
                                                                <Check className="w-4 h-4" />
                                                                Copied!
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Copy className="w-4 h-4" />
                                                                Copy Prompt
                                                            </>
                                                        )}
                                                    </button>
                                                </motion.div>
                                            );
                                        })}
                                    </motion.div>
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            </section>

            {/* Custom Scrollbar Styles */}
            <style jsx global>{`
                .overflow-y-auto::-webkit-scrollbar {
                    width: 6px;
                }
                .overflow-y-auto::-webkit-scrollbar-track {
                    background: transparent;
                }
                .overflow-y-auto::-webkit-scrollbar-thumb {
                    background: #667eea;
                    border-radius: 3px;
                }
                .overflow-y-auto::-webkit-scrollbar-thumb:hover {
                    background: #764ba2;
                }
            `}</style>
        </main>
    );
}
