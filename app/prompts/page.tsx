"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Copy, Check, ChevronDown, ChevronUp, Loader2, Sparkles, AlertCircle } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import AppNavbar from "@/components/AppNavbar";
import { toast } from "sonner";

function cn(...inputs) {
    return twMerge(clsx(inputs));
}

export default function PromptsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [promptsByCategory, setPromptsByCategory] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [copiedId, setCopiedId] = useState(null);
    const [expandedIds, setExpandedIds] = useState(new Set());

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
            } catch (error) {
                console.error("Error fetching prompts:", error);
                setError(error.message);
                toast.error("Failed to load prompts");
            } finally {
                setLoading(false);
            }
        }

        fetchPrompts();
    }, [status]);

    const copyPrompt = async (id, prompt) => {
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

    const toggleExpand = (id) => {
        const newExpanded = new Set(expandedIds);
        if (newExpanded.has(id)) {
            newExpanded.delete(id);
        } else {
            newExpanded.add(id);
        }
        setExpandedIds(newExpanded);
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

            {/* Prompts Section */}
            <section className="pb-20 px-4">
                <div className="max-w-5xl mx-auto space-y-12">
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
                    {!error && Object.entries(promptsByCategory).map(([category, prompts], categoryIndex) => (
                        <motion.div
                            key={category}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: categoryIndex * 0.1 }}
                        >
                            {/* Category Header */}
                            <div className="mb-6">
                                <h2 className="text-2xl font-bold">
                                    {category} <span className="text-muted-foreground text-lg">({prompts.length} {prompts.length === 1 ? 'prompt' : 'prompts'})</span>
                                </h2>
                            </div>

                            {/* Prompt Cards Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {prompts.map((prompt, index) => {
                                    const isExpanded = expandedIds.has(prompt.id);
                                    const isCopied = copiedId === prompt.id;
                                    const preview = prompt.prompt.length > 150
                                        ? prompt.prompt.substring(0, 150) + "..."
                                        : prompt.prompt;

                                    return (
                                        <motion.div
                                            key={prompt.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: (categoryIndex * 0.1) + (index * 0.05) }}
                                            className={cn(
                                                "bg-card border border-border rounded-xl p-6 transition-all duration-300 hover:shadow-lg hover:border-primary/50",
                                                isExpanded && "border-primary/50 shadow-lg"
                                            )}
                                        >
                                            {/* Card Title */}
                                            <h3 className="text-lg font-semibold mb-3 text-card-foreground">
                                                {prompt.title}
                                            </h3>

                                            {/* Prompt Preview/Full */}
                                            {isExpanded ? (
                                                <div className="mb-4 p-4 bg-secondary rounded-lg overflow-auto max-h-96 font-mono text-sm text-secondary-foreground whitespace-pre-wrap">
                                                    {prompt.prompt}
                                                </div>
                                            ) : (
                                                <p className="mb-4 text-muted-foreground leading-relaxed">
                                                    {preview}
                                                </p>
                                            )}

                                            {/* Action Buttons */}
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => copyPrompt(prompt.id, prompt.prompt)}
                                                    className={cn(
                                                        "flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-200",
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

                                                <button
                                                    onClick={() => toggleExpand(prompt.id)}
                                                    className="px-4 py-2.5 rounded-lg font-medium transition-all duration-200 border border-border hover:bg-secondary"
                                                >
                                                    {isExpanded ? (
                                                        <>
                                                            <ChevronUp className="w-4 h-4 inline mr-1" />
                                                            Less
                                                        </>
                                                    ) : (
                                                        <>
                                                            <ChevronDown className="w-4 h-4 inline mr-1" />
                                                            Full
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>
        </main>
    );
}
