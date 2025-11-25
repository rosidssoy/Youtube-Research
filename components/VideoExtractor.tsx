import { useState } from "react";
import { useSession } from "next-auth/react";
import { Search, Loader2, Copy, Check, Save, AlertCircle, FileText, AlignLeft, Download, Image as ImageIcon } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import AuthModal from "./AuthModal";
import TrustBadge from "./landing/TrustBadge";

interface VideoData {
    url: string;
    title: string;
    description: string;
    thumbnail: string;
    transcript?: string;
    [key: string]: any;
}

export default function VideoExtractor() {
    const { data: session, status } = useSession();
    const [url, setUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<VideoData | null>(null);
    const [error, setError] = useState("");
    const [copied, setCopied] = useState("");
    const [saving, setSaving] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);

    const handleExtract = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!url) return;

        // Check authentication
        if (status !== "authenticated") {
            setShowAuthModal(true);
            return;
        }

        setLoading(true);
        setError("");
        setData(null);

        try {
            const res = await fetch("/api/extract", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url, type: "video" }),
            });

            const result = await res.json();
            if (!res.ok) throw new Error(result.error || "Failed to extract video data");

            setData(result.data);

            // Auto-save to history
            if (result.data) {
                await saveToHistory(result.data);
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text: string = "", type: string = "json") => {
        const content = text || JSON.stringify(data, null, 2);
        navigator.clipboard.writeText(content);
        setCopied(type);

        if (type === "thumbnail") {
            toast.success("✅ Thumbnail URL copied");
        }

        setTimeout(() => setCopied(""), 2000);
    };

    const handleDownload = () => {
        if (!data) return;
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `video_extract_${new Date().getTime()}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const getHighResThumbnail = (url: string) => {
        // Try to get maxresdefault if available, otherwise fallback to the provided URL
        // Typical YouTube thumbnail URL: https://i.ytimg.com/vi/VIDEO_ID/hqdefault.jpg
        if (url.includes("hqdefault.jpg")) {
            return url.replace("hqdefault.jpg", "maxresdefault.jpg");
        }
        if (url.includes("mqdefault.jpg")) {
            return url.replace("mqdefault.jpg", "maxresdefault.jpg");
        }
        if (url.includes("sddefault.jpg")) {
            return url.replace("sddefault.jpg", "maxresdefault.jpg");
        }
        return url;
    };

    const handleDownloadThumbnail = async () => {
        if (!data) return;

        try {
            const highResUrl = getHighResThumbnail(data.thumbnail);

            // Fetch the image
            const response = await fetch(highResUrl);
            let blob;

            if (response.ok) {
                blob = await response.blob();
            } else {
                // Fallback to original if maxres fails
                const fallbackResponse = await fetch(data.thumbnail);
                if (!fallbackResponse.ok) throw new Error("Failed to fetch thumbnail");
                blob = await fallbackResponse.blob();
            }

            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            // Filename: video-title-thumbnail.jpg
            const safeTitle = data.title.replace(/[^a-z0-9]/gi, '-').toLowerCase();
            link.download = `${safeTitle}-thumbnail.jpg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

        } catch (err) {
            console.error("Failed to download thumbnail:", err);
            toast.error("Failed to download thumbnail");
        }
    };

    const saveToHistory = async (videoData: VideoData) => {
        if (status !== "authenticated" || !session?.user?.id) return;

        const payload = {
            type: "VIDEO",
            title: videoData.title,
            thumbnail: videoData.thumbnail,
            data: videoData
        };

        try {
            await fetch("/api/history", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
        } catch (error) {
            console.error("❌ Network error during auto-save:", error);
        }
    };

    return (
        <div className="w-full space-y-6">
            <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />

            <form onSubmit={handleExtract} className="relative">
                <div className="flex flex-col md:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Paste YouTube Video Link..."
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
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Extract"}
                    </button>
                </div>
            </form>

            {error && (
                <div className="p-4 bg-destructive/10 text-destructive rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    {error}
                </div>
            )}

            {data && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                >
                    <div className="flex justify-end gap-2">
                        <button
                            onClick={handleDownloadThumbnail}
                            className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
                        >
                            <ImageIcon className="w-4 h-4" />
                            Download Thumbnail
                        </button>
                        <button
                            onClick={handleDownload}
                            className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
                        >
                            <Download className="w-4 h-4" />
                            Download JSON
                        </button>
                        <button
                            onClick={() => copyToClipboard()}
                            className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
                        >
                            {copied === "json" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            Copy JSON
                        </button>
                    </div>

                    {/* Video Info */}
                    <div className="bg-card rounded-2xl p-6 border border-border shadow-sm">
                        <div className="flex flex-col md:flex-row gap-6">
                            <img
                                src={data.thumbnail}
                                alt={data.title}
                                className="w-full md:w-64 aspect-video object-cover rounded-xl"
                            />
                            <div className="space-y-2 flex-1">
                                <h2 className="text-xl font-bold line-clamp-2">{data.title}</h2>
                                <div className="pt-4 flex gap-2">
                                    <button
                                        onClick={() => copyToClipboard(data.title, "title")}
                                        className="text-xs flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors bg-secondary/50 px-2 py-1 rounded"
                                    >
                                        {copied === "title" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                        Copy Title
                                    </button>
                                    <button
                                        onClick={() => copyToClipboard(getHighResThumbnail(data.thumbnail), "thumbnail")}
                                        className="text-xs flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors bg-secondary/50 px-2 py-1 rounded"
                                    >
                                        {copied === "thumbnail" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                        Copy Thumbnail
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="bg-card rounded-2xl border border-border p-6 shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 font-medium text-lg">
                                <AlignLeft className="w-5 h-5 text-primary" />
                                <h3>Description</h3>
                            </div>
                            <button
                                onClick={() => copyToClipboard(data.description, "desc")}
                                className="p-2 hover:bg-secondary rounded-lg transition-colors text-muted-foreground hover:text-foreground"
                                title="Copy Description"
                            >
                                {copied === "desc" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            </button>
                        </div>
                        <div className="max-h-60 overflow-y-auto text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed pr-2 scrollbar-thin scrollbar-thumb-border">
                            {data.description || "No description available."}
                        </div>
                    </div>

                    {/* Transcript */}
                    <div className="bg-card rounded-2xl border border-border p-6 shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 font-medium text-lg">
                                <FileText className="w-5 h-5 text-primary" />
                                <h3>Transcript</h3>
                            </div>
                            <button
                                onClick={() => copyToClipboard(data.transcript, "transcript")}
                                className="p-2 hover:bg-secondary rounded-lg transition-colors text-muted-foreground hover:text-foreground"
                                title="Copy Transcript"
                            >
                                {copied === "transcript" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            </button>
                        </div>
                        <div className="max-h-96 overflow-y-auto text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed pr-2 scrollbar-thin scrollbar-thumb-border bg-muted/30 p-4 rounded-xl">
                            {data.transcript || "No transcript available."}
                        </div>
                    </div>

                    {/* JSON Preview */}
                    <div className="bg-card rounded-2xl border border-border overflow-hidden">
                        <div className="p-4 border-b border-border bg-muted/50 flex justify-between items-center">
                            <h3 className="font-medium">Extracted Data</h3>
                            <button
                                onClick={() => copyToClipboard(JSON.stringify(data, null, 2), "json_bottom")}
                                className="text-xs flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors bg-background border border-border px-2 py-1 rounded-md"
                            >
                                {copied === "json_bottom" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                Copy JSON
                            </button>
                        </div>
                        <div className="p-4 overflow-auto max-h-[500px]">
                            <pre className="text-sm font-mono text-muted-foreground">
                                {JSON.stringify(data, null, 2)}
                            </pre>
                        </div>
                    </div>
                </motion.div>
            )}

            {!data && <TrustBadge />}
        </div>
    );
}
