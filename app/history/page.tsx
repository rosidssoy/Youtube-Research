"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Search, ArrowLeft, Youtube, Moon, Sun, BarChart2, Loader2 } from "lucide-react";
import { VideoActivityCard } from "@/components/history/VideoActivityCard";
import { ChannelActivityCard } from "@/components/history/ChannelActivityCard";
import ProfileMenu from "@/components/ProfileMenu";
import { toast } from "sonner";
import { format } from "date-fns";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import AppNavbar from "@/components/AppNavbar";

function cn(...inputs: (string | undefined | null | false)[]) {
    return twMerge(clsx(inputs));
}

interface Analysis {
    id: string;
    type: string;
    title: string;
    thumbnail: string;
    data: string;
    createdAt: string;
}

export default function HistoryPage() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [analyses, setAnalyses] = useState<Analysis[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [timeFilter, setTimeFilter] = useState<"all" | "7d" | "30d">("all");
    const [activeTab, setActiveTab] = useState("video");
    const [isDark, setIsDark] = useState(true);

    const toggleTheme = () => {
        setIsDark(!isDark);
        document.documentElement.classList.toggle("dark");
    };

    useEffect(() => {
        if (status === "unauthenticated") {
            toast.error("Please login to view history");
            router.push("/login");
        } else if (status === "authenticated") {
            fetchHistory();
        }
    }, [status, router]);

    const fetchHistory = async () => {
        try {
            const res = await fetch("/api/history");

            if (res.status === 401) {
                toast.error("Please login to view history");
                router.push("/login");
                return;
            }

            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }

            const json = await res.json();
            setAnalyses(json.data || []);
        } catch (error) {
            console.error("Failed to fetch history:", error);
            toast.error("Failed to load history");
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = async (analysis: Analysis) => {
        try {
            const data = JSON.parse(analysis.data);
            await navigator.clipboard.writeText(JSON.stringify(data, null, 2));

            if (analysis.type === "VIDEO") {
                toast.success("✅ Video data copied to clipboard");
            } else {
                const videoCount = Array.isArray(data) ? data.length : 0;
                toast.success(`✅ Channel data (${videoCount} videos) copied to clipboard`);
            }
        } catch (error) {
            toast.error("Failed to copy data");
        }
    };

    const handleDownload = (analysis: Analysis) => {
        try {
            const data = JSON.parse(analysis.data);
            const blob = new Blob([JSON.stringify(data, null, 2)], {
                type: "application/json"
            });

            const sanitizedTitle = analysis.title
                .replace(/[^a-z0-9]/gi, '_')
                .toLowerCase();
            const dateStr = format(new Date(analysis.createdAt), "yyyyMMdd");
            const filename = `${sanitizedTitle}_${dateStr}.json`;

            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = filename;
            link.click();

            toast.success(`📥 Downloaded ${filename}`);
        } catch (error) {
            toast.error("Failed to download data");
        }
    };

    // Filter by type
    const filteredByType = analyses.filter(a =>
        activeTab === "video" ? a.type === "VIDEO" : a.type === "CHANNEL"
    );

    // Filter by search query
    const filteredBySearch = filteredByType.filter(a =>
        a.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Filter by time
    const filteredByTime = filteredBySearch.filter(a => {
        if (timeFilter === "all") return true;

        const daysAgo = timeFilter === "7d" ? 7 : 30;
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - daysAgo);

        return new Date(a.createdAt) >= cutoff;
    });

    const displayedAnalyses = filteredByTime;

    return (
        <main className={cn("min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300", isDark ? "dark" : "")}>
            <AppNavbar />

            <div className="container max-w-5xl mx-auto p-6 pt-8">
                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2 tracking-tight">Analysis History</h1>
                    <p className="text-muted-foreground">
                        View and manage your video and channel analyses
                    </p>
                </div>

                {/* Search and Filter */}
                <div className="flex flex-col md:flex-row gap-4 mb-8">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search by video or channel name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                        />
                    </div>
                    <select
                        value={timeFilter}
                        onChange={(e) => setTimeFilter(e.target.value as any)}
                        className="px-4 py-2.5 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                    >
                        <option value="all">All time</option>
                        <option value="7d">Last 7 days</option>
                        <option value="30d">Last 30 days</option>
                    </select>
                </div>

                {/* Tabs */}
                <div className="mb-8">
                    <div className="border-b border-border">
                        <div className="flex gap-6">
                            <button
                                onClick={() => setActiveTab("video")}
                                className={`pb-3 px-1 border-b-2 transition-all font-medium text-sm ${activeTab === "video"
                                    ? "border-primary text-primary"
                                    : "border-transparent text-muted-foreground hover:text-foreground"
                                    }`}
                            >
                                Single Videos
                            </button>
                            <button
                                onClick={() => setActiveTab("channel")}
                                className={`pb-3 px-1 border-b-2 transition-all font-medium text-sm ${activeTab === "channel"
                                    ? "border-primary text-primary"
                                    : "border-transparent text-muted-foreground hover:text-foreground"
                                    }`}
                            >
                                Bulk Channels
                            </button>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="space-y-4">
                    {loading ? (
                        // Loading Skeletons
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="bg-card border border-border rounded-xl p-4 h-32 animate-pulse">
                                    <div className="flex gap-4 h-full">
                                        <div className="w-48 bg-secondary rounded-lg h-full" />
                                        <div className="flex-1 space-y-3 py-2">
                                            <div className="h-5 bg-secondary rounded w-3/4" />
                                            <div className="h-4 bg-secondary rounded w-1/2" />
                                            <div className="h-8 bg-secondary rounded w-24 mt-auto" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : displayedAnalyses.length === 0 ? (
                        // Improved Empty State
                        <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-card/50 border border-border/50 rounded-2xl border-dashed">
                            <div className="w-16 h-16 bg-secondary/50 rounded-full flex items-center justify-center mb-4">
                                <BarChart2 className="w-8 h-8 text-muted-foreground" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">No Analysis History</h3>
                            <p className="text-muted-foreground max-w-sm mb-8">
                                You haven't analyzed any {activeTab === "video" ? "videos" : "channels"} yet. Start extracting data to see insights here.
                            </p>
                            <Link
                                href="/"
                                className="px-6 py-2.5 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center gap-2"
                            >
                                <Youtube className="w-4 h-4" />
                                Extract First {activeTab === "video" ? "Video" : "Channel"}
                            </Link>
                        </div>
                    ) : (
                        displayedAnalyses.map(analysis => (
                            activeTab === "video" ? (
                                <VideoActivityCard
                                    key={analysis.id}
                                    analysis={analysis}
                                    onCopy={() => handleCopy(analysis)}
                                    onDownload={() => handleDownload(analysis)}
                                />
                            ) : (
                                <ChannelActivityCard
                                    key={analysis.id}
                                    analysis={analysis}
                                    onCopy={() => handleCopy(analysis)}
                                    onDownload={() => handleDownload(analysis)}
                                />
                            )
                        ))
                    )}
                </div>
            </div>
        </main>
    );
}
