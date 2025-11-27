import { useState } from "react";
import { useSession } from "next-auth/react";
import { Search, Loader2, AlertCircle, CheckSquare, Square, FileText, Check, Download, Copy, Eye, Calendar, ArrowUpDown } from "lucide-react";
import { motion } from "framer-motion";
import AuthModal from "./AuthModal";
import TrustBadge from "./landing/TrustBadge";

interface VideoData {
    id: string;
    title: string;
    thumbnail: string;
    url: string;
    views?: string;
    published_at?: string;  // This will be a relative date like "2 days ago"
}

interface AnalyzedVideo {
    url: string;
    metadata: {
        title: string;
        views: number;
        likes: number;
        upload_date: string;
        duration: string;
        comment_count: number;
        thumbnail: string;
        channel: string;
    };
    performance: {
        views_per_day: number;
        engagement_rate: number;
        watch_time_percentage: string;
    };
    publishing_schedule: {
        day_of_week: string;
        time_posted: string;
        frequency: string;
    };
    tags: string[];
    category: string;
    transcript?: string;
}

export default function ChannelExtractor() {
    const { data: session, status } = useSession();
    const [url, setUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);
    const [error, setError] = useState("");
    const [videos, setVideos] = useState<VideoData[]>([]);
    const [selectedVideos, setSelectedVideos] = useState<string[]>([]);
    const [analyzedData, setAnalyzedData] = useState<AnalyzedVideo[] | null>(null);
    const [sortBy, setSortBy] = useState<string>("popular_desc");
    const [showAuthModal, setShowAuthModal] = useState(false);

    // Extraction Options
    const [options, setOptions] = useState({
        title: true,
        transcript: true,
        description: true,
        metadata: true, // views, likes, dates, etc.
        thumbnail: true // New option
    });

    const handleFetchVideos = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!url) return;

        // Check authentication
        if (status !== "authenticated") {
            setShowAuthModal(true);
            return;
        }

        setLoading(true);
        setError("");
        setVideos([]);
        setAnalyzedData(null);
        setSelectedVideos([]);

        try {
            const res = await fetch("/api/extract", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url, type: "channel_list" }),
            });

            const json = await res.json();

            if (!res.ok) {
                throw new Error(json.error || "Failed to fetch channel videos");
            }

            setVideos(json.data);
            // Auto-sort by popular (views) by default
            sortVideos(json.data, "popular_desc");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const toggleVideo = (videoId: string) => {
        setSelectedVideos(prev =>
            prev.includes(videoId)
                ? prev.filter(id => id !== videoId)
                : [...prev, videoId]
        );
    };

    const toggleAll = () => {
        if (selectedVideos.length === videos.length) {
            setSelectedVideos([]);
        } else {
            setSelectedVideos(videos.map(v => v.id));
        }
    };

    const sortVideos = (videoList: VideoData[], sortKey: string) => {
        const sorted = [...videoList].sort((a, b) => {
            if (sortKey.startsWith("popular")) {
                // Parse view count (remove commas and parse as number)
                const viewsA = parseInt((a.views || "0").replace(/[^0-9]/g, ""));
                const viewsB = parseInt((b.views || "0").replace(/[^0-9]/g, ""));
                return sortKey === "popular_desc" ? viewsB - viewsA : viewsA - viewsB;
            } else {
                // YouTube API v3 returns ISO date strings (YYYY-MM-DD), which can be parsed
                const getTimestamp = (dateStr: string | undefined): number => {
                    if (!dateStr || dateStr === "Unknown" || dateStr === "N/A") return 0;

                    // Try ISO date parsing first (YouTube API v3 format)
                    const isoDate = new Date(dateStr);
                    if (!isNaN(isoDate.getTime())) {
                        return isoDate.getTime();
                    }

                    // Fallback: Try to extract relative time (for InnerTube fallback)
                    const match = dateStr.match(/(\d+)\s+(second|minute|hour|day|week|month|year)/);
                    if (!match) return 0;

                    const value = parseInt(match[1]);
                    const unit = match[2];

                    // Convert to milliseconds
                    const multipliers: Record<string, number> = {
                        'second': 1000,
                        'minute': 60000,
                        'hour': 3600000,
                        'day': 86400000,
                        'week': 604800000,
                        'month': 2592000000,
                        'year': 31536000000
                    };

                    // Subtract from now (relative dates are "X ago")
                    return Date.now() - (value * (multipliers[unit] || 0));
                };

                const timeA = getTimestamp(a.published_at);
                const timeB = getTimestamp(b.published_at);

                return sortKey === "date_desc" ? timeB - timeA : timeA - timeB;
            }
        });
        setVideos(sorted);
        setSortBy(sortKey);
    };

    const handleSort = (key: "popular" | "date") => {
        let newSortKey = "";
        if (key === "popular") {
            newSortKey = sortBy === "popular_desc" ? "popular_asc" : "popular_desc";
        } else {
            newSortKey = sortBy === "date_desc" ? "date_asc" : "date_desc";
        }
        sortVideos(videos, newSortKey);
    };

    const saveToHistory = async (videos: AnalyzedVideo[], channelName: string) => {
        try {
            await fetch("/api/history", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type: "CHANNEL",
                    title: channelName || "Bulk Channel Analysis",
                    thumbnail: videos[0]?.metadata?.thumbnail || "",
                    data: videos
                }),
            });
        } catch (error) {
            console.error("Failed to auto-save to history", error);
        }
    };

    const handleBulkExtract = async () => {
        if (selectedVideos.length === 0) return;

        setAnalyzing(true);
        setError("");
        setAnalyzedData(null);

        try {
            const selectedUrls = videos
                .filter(v => selectedVideos.includes(v.id))
                .map(v => v.url);

            const res = await fetch("/api/extract", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type: "bulk_analyze",
                    urls: selectedUrls,
                    options // Pass selected options to API
                }),
            });

            const json = await res.json();

            if (!res.ok) {
                throw new Error(json.error || "Failed to analyze videos");
            }

            // Merge original date data if missing from analysis
            const mergedData = json.data.map((analyzed: AnalyzedVideo) => {
                const originalVideo = videos.find(v => v.url === analyzed.url);
                if (originalVideo && (!analyzed.metadata.upload_date || analyzed.metadata.upload_date === "")) {
                    return {
                        ...analyzed,
                        metadata: {
                            ...analyzed.metadata,
                            upload_date: originalVideo.published_at || ""
                        }
                    };
                }
                return analyzed;
            });

            setAnalyzedData(mergedData);

            // Auto-save with proper channel name extraction
            const channelName = json.data[0]?.metadata?.channel;
            if (!channelName) {
                console.warn("⚠️ Could not extract channel name! Using fallback.");
            }

            await saveToHistory(json.data, channelName || "Unknown Channel");

        } catch (err: any) {
            setError("Failed during bulk extraction: " + err.message);
        } finally {
            setAnalyzing(false);
        }
    };

    const handleDownload = () => {
        if (!analyzedData) return;
        const blob = new Blob([JSON.stringify(analyzedData, null, 2)], { type: "application/json" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `channel_analysis_${new Date().getTime()}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="w-full space-y-6">
            <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />

            <form onSubmit={handleFetchVideos} className="relative">
                <div className="flex flex-col md:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Paste Channel Link..."
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-card border border-border shadow-sm focus:ring-2 focus:ring-primary outline-none transition-all text-base md:text-lg"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading || !url}
                        className="w-full md:w-auto px-8 py-4 bg-primary text-primary-foreground rounded-2xl font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 whitespace-nowrap"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Fetch Videos"}
                    </button>
                </div>
            </form>

            {error && (
                <div className="p-4 bg-destructive/10 text-destructive rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    {error}
                </div>
            )}

            {videos.length > 0 && !analyzedData && ( // Only show video selection if videos are fetched and no analysis is complete
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                >
                    {/* Fetching Completed Indicator & Analyze Button */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-2 text-emerald-500 bg-emerald-500/10 px-4 py-3 rounded-xl border border-emerald-500/20 flex-1">
                            <Check className="w-5 h-5" />
                            <span className="font-medium">Fetching Completed! Select videos to analyze.</span>
                        </div>

                        <button
                            onClick={handleBulkExtract}
                            disabled={analyzing || selectedVideos.length === 0}
                            className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-primary/20 whitespace-nowrap"
                        >
                            {analyzing ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Analyzing...
                                </>
                            ) : (
                                <>
                                    <FileText className="w-5 h-5" />
                                    Analyze Selected ({selectedVideos.length})
                                </>
                            )}
                        </button>
                    </div>

                    <div className="flex flex-col gap-6">
                        {/* Controls Bar */}
                        <div className="flex flex-col gap-4 p-4 bg-card rounded-xl border border-border shadow-sm">

                            {/* Section 1: Selection & Count */}
                            <div className="flex items-center gap-4 pb-4 border-b border-border">
                                <button
                                    onClick={toggleAll}
                                    className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {selectedVideos.length === videos.length ? (
                                        <CheckSquare className="w-5 h-5 text-primary" />
                                    ) : (
                                        <Square className="w-5 h-5" />
                                    )}
                                    Select All
                                </button>
                                <div className="h-4 w-px bg-border" />
                                <span className="text-sm font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                                    {selectedVideos.length} selected
                                </span>
                            </div>

                            {/* Section 2: Extraction Options (Chips) */}
                            <div className="flex flex-col gap-2">
                                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Data to Extract:</span>
                                <div className="flex flex-wrap items-center gap-2">
                                    {[
                                        { id: 'title', label: 'Title' },
                                        { id: 'transcript', label: 'Script' },
                                        { id: 'description', label: 'Description' },
                                        { id: 'thumbnail', label: 'Thumbnail' },
                                        { id: 'metadata', label: 'Other Data' }
                                    ].map((opt) => (
                                        <button
                                            key={opt.id}
                                            onClick={() => setOptions({ ...options, [opt.id]: !options[opt.id as keyof typeof options] })}
                                            className={`
                                                flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all border
                                                ${options[opt.id as keyof typeof options]
                                                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                                                    : "bg-secondary/50 text-muted-foreground border-transparent hover:bg-secondary hover:text-foreground"
                                                }
                                            `}
                                        >
                                            {options[opt.id as keyof typeof options] && <Check className="w-3 h-3" />}
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Video List View (Table Style) */}
                        <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-secondary/30 text-xs uppercase text-muted-foreground font-semibold">
                                        <tr>
                                            <th className="p-4 w-12 text-center">#</th>
                                            <th className="p-4 w-20">Thumbnail</th>
                                            <th className="p-4">Video Title</th>
                                            <th className="p-4 w-32 text-right cursor-pointer hover:text-foreground transition-colors select-none" onClick={() => handleSort("popular")}>
                                                <div className="flex items-center justify-end gap-1">
                                                    Views
                                                    {sortBy === "popular_desc" ? <ArrowUpDown className="w-3 h-3" /> : <ArrowUpDown className="w-3 h-3 opacity-50" />}
                                                </div>
                                            </th>
                                            <th className="p-4 w-32 text-right cursor-pointer hover:text-foreground transition-colors select-none" onClick={() => handleSort("date")}>
                                                <div className="flex items-center justify-end gap-1">
                                                    Date
                                                    {sortBy === "date_desc" ? <ArrowUpDown className="w-3 h-3" /> : <ArrowUpDown className="w-3 h-3 opacity-50" />}
                                                </div>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {videos.map((video) => {
                                            const isSelected = selectedVideos.includes(video.id);
                                            return (
                                                <tr
                                                    key={video.id}
                                                    onClick={() => toggleVideo(video.id)}
                                                    className={`
                                                        group cursor-pointer transition-colors hover:bg-secondary/30
                                                        ${isSelected ? "bg-primary/5" : ""}
                                                    `}
                                                >
                                                    <td className="p-4 text-center">
                                                        <div className={`
                                                            w-5 h-5 rounded border flex items-center justify-center mx-auto transition-colors
                                                            ${isSelected ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground/30 group-hover:border-primary/50"}
                                                        `}>
                                                            {isSelected && <Check className="w-3 h-3" />}
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="w-16 h-9 rounded-md overflow-hidden bg-secondary relative">
                                                            <img src={video.thumbnail} alt="" className="w-full h-full object-cover" />
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        <p className={`font-medium text-sm line-clamp-2 ${isSelected ? "text-primary" : "text-foreground"}`}>
                                                            {video.title}
                                                        </p>
                                                    </td>
                                                    <td className="p-4 text-right text-sm text-muted-foreground font-mono">
                                                        {video.views || "0"}
                                                    </td>
                                                    <td className="p-4 text-right text-sm text-muted-foreground whitespace-nowrap">
                                                        {video.published_at || "Unknown"}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Action Bar Removed (Moved to Top) */}
                </motion.div>
            )}

            {analyzedData && ( // Show analysis results if analyzedData is not null
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                >
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-semibold">Analysis Results</h3>
                        <div className="flex gap-2">
                            <button
                                onClick={handleDownload}
                                className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
                            >
                                <Download className="w-4 h-4" />
                                Download JSON
                            </button>
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(JSON.stringify(analyzedData, null, 2));
                                }}
                                className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
                            >
                                <Copy className="w-4 h-4" />
                                Copy JSON
                            </button>
                        </div>
                    </div>
                    <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-secondary/30 text-xs uppercase text-muted-foreground font-semibold">
                                    <tr>
                                        <th className="p-4 w-12 text-center">#</th>
                                        <th className="p-4 w-20">Image</th>
                                        <th className="p-4">Analyzed Video</th>
                                        <th className="p-4 w-32 text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {analyzedData.map((data, index) => (
                                        <tr key={index} className="group hover:bg-secondary/30 transition-colors">
                                            <td className="p-4 text-center text-sm text-muted-foreground">
                                                {index + 1}
                                            </td>
                                            <td className="p-4">
                                                <div className="w-16 h-9 rounded-md overflow-hidden bg-secondary relative">
                                                    {data.metadata.thumbnail ? (
                                                        <img src={data.metadata.thumbnail} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center bg-secondary text-muted-foreground">
                                                            <Eye className="w-4 h-4" />
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex flex-col gap-1">
                                                    <p className="font-medium text-sm line-clamp-1 text-foreground">
                                                        {data.metadata.title || "Untitled Video"}
                                                    </p>
                                                    <a
                                                        href={data.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 w-fit"
                                                    >
                                                        {data.metadata.channel}
                                                        <ArrowUpDown className="w-3 h-3 rotate-[-45deg]" />
                                                    </a>
                                                </div>
                                            </td>
                                            <td className="p-4 text-right">
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                                                    <Check className="w-3 h-3" />
                                                    Success
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </motion.div>
            )}

            {videos.length === 0 && <TrustBadge />}
        </div>
    );
}
