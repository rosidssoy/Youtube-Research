"use client";

import { useState, useRef, useEffect } from "react";
import { Download, Image as ImageIcon, Loader2, Play, AlertCircle } from "lucide-react";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { toast } from "sonner";

interface FrameExtractorProps {
    videoUrl: string;
    title: string;
}

interface ExtractedFrame {
    id: number;
    url: string;
    timestamp: number;
    blob: Blob;
}

export default function FrameExtractor({ videoUrl, title }: FrameExtractorProps) {
    const [frames, setFrames] = useState<ExtractedFrame[]>([]);
    const [extracting, setExtracting] = useState(false);
    const [frameCount, setFrameCount] = useState(10);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState("");
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Helper to format timestamp
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleExtract = async () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas) return;

        setExtracting(true);
        setFrames([]);
        setProgress(0);
        setError("");

        try {
            // Note: YouTube URLs won't work directly in video tag due to CORS.
            // This component assumes a direct video file URL or a proxy is used.
            // For this demo, we'll try to load it. If it fails, we show an error.

            // Wait for metadata to load duration
            if (video.readyState < 1) {
                await new Promise((resolve, reject) => {
                    video.onloadedmetadata = resolve;
                    video.onerror = () => reject(new Error("Failed to load video. Note: Direct YouTube URLs cannot be processed client-side due to CORS."));
                });
            }

            const duration = video.duration;
            if (!isFinite(duration) || duration === 0) {
                throw new Error("Invalid video duration");
            }

            const interval = duration / (frameCount + 1);
            const newFrames: ExtractedFrame[] = [];
            const ctx = canvas.getContext("2d");

            if (!ctx) throw new Error("Canvas context not available");

            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            for (let i = 1; i <= frameCount; i++) {
                const time = interval * i;
                video.currentTime = time;

                // Wait for seek
                await new Promise<void>((resolve) => {
                    const onSeeked = () => {
                        video.removeEventListener("seeked", onSeeked);
                        resolve();
                    };
                    video.addEventListener("seeked", onSeeked);
                });

                // Draw frame
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

                // Convert to blob
                const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, "image/jpeg", 0.8));
                if (blob) {
                    const url = URL.createObjectURL(blob);
                    newFrames.push({
                        id: i,
                        url,
                        timestamp: time,
                        blob
                    });
                }

                setProgress(Math.round((i / frameCount) * 100));
            }

            setFrames(newFrames);
            toast.success(`Successfully extracted ${newFrames.length} frames`);

        } catch (err: any) {
            console.error("Extraction error:", err);
            setError(err.message || "Failed to extract frames");
            toast.error("Extraction failed");
        } finally {
            setExtracting(false);
        }
    };

    const handleDownloadZip = async () => {
        if (frames.length === 0) return;

        const zip = new JSZip();
        const folder = zip.folder("frames");

        frames.forEach((frame) => {
            const filename = `frame_${frame.id}_${Math.round(frame.timestamp)}s.jpg`;
            folder?.file(filename, frame.blob);
        });

        const content = await zip.generateAsync({ type: "blob" });
        const safeTitle = title.replace(/[^a-z0-9]/gi, '-').toLowerCase();
        saveAs(content, `${safeTitle}-frames.zip`);
        toast.success("ZIP download started");
    };

    return (
        <div className="bg-card rounded-2xl border border-border p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-medium text-lg">
                    <ImageIcon className="w-5 h-5 text-primary" />
                    <h3>Visual Frame Extractor</h3>
                </div>
            </div>

            <div className="space-y-4">
                {/* Controls */}
                <div className="flex flex-wrap items-end gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Number of Frames</label>
                        <select
                            value={frameCount}
                            onChange={(e) => setFrameCount(Number(e.target.value))}
                            className="block w-32 px-3 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                            disabled={extracting}
                        >
                            <option value={10}>10 Frames</option>
                            <option value={15}>15 Frames</option>
                            <option value={20}>20 Frames</option>
                        </select>
                    </div>

                    <button
                        onClick={handleExtract}
                        disabled={extracting}
                        className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center gap-2"
                    >
                        {extracting ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Extracting {progress}%
                            </>
                        ) : (
                            <>
                                <Play className="w-4 h-4" />
                                Extract Frames
                            </>
                        )}
                    </button>

                    {frames.length > 0 && (
                        <button
                            onClick={handleDownloadZip}
                            className="px-6 py-2 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/80 transition-colors flex items-center gap-2"
                        >
                            <Download className="w-4 h-4" />
                            Download ZIP
                        </button>
                    )}
                </div>

                {/* Error Message */}
                {error && (
                    <div className="p-4 bg-destructive/10 text-destructive rounded-xl flex items-center gap-2 text-sm">
                        <AlertCircle className="w-4 h-4" />
                        {error}
                    </div>
                )}

                {/* Hidden Video & Canvas */}
                <video
                    ref={videoRef}
                    src={videoUrl}
                    className="hidden"
                    crossOrigin="anonymous"
                    muted
                    playsInline
                />
                <canvas ref={canvasRef} className="hidden" />

                {/* Frames Grid */}
                {frames.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-6">
                        {frames.map((frame) => (
                            <div key={frame.id} className="group relative aspect-video bg-muted rounded-lg overflow-hidden border border-border">
                                <img
                                    src={frame.url}
                                    alt={`Frame at ${formatTime(frame.timestamp)}`}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <span className="text-white text-xs font-medium px-2 py-1 bg-black/50 rounded">
                                        {formatTime(frame.timestamp)}
                                    </span>
                                </div>
                                <a
                                    href={frame.url}
                                    download={`frame-${frame.timestamp}.jpg`}
                                    className="absolute bottom-2 right-2 p-1.5 bg-white/90 text-black rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                                    title="Download Frame"
                                >
                                    <Download className="w-3 h-3" />
                                </a>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
