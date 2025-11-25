"use client";

import { format } from "date-fns";
import { Copy, Download, ExternalLink } from "lucide-react";

interface Analysis {
    id: string;
    type: string;
    title: string;
    thumbnail: string;
    data: string;
    createdAt: string;
}

interface VideoActivityCardProps {
    analysis: Analysis;
    onCopy: () => void;
    onDownload: () => void;
}

export function VideoActivityCard({ analysis, onCopy, onDownload }: VideoActivityCardProps) {
    const data = JSON.parse(analysis.data);
    const videoUrl = data.url || `https://www.youtube.com/watch?v=${data.videoId}`;

    return (
        <div className="flex items-center gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
            {/* Clickable Thumbnail */}
            <a
                href={videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0 group relative"
            >
                <img
                    src={analysis.thumbnail || "/placeholder-video.png"}
                    alt=""
                    className="w-20 h-15 object-cover rounded"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded flex items-center justify-center">
                    <ExternalLink className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
            </a>

            {/* Title & Channel */}
            <div className="flex-1 min-w-0">
                <a
                    href={videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium truncate hover:underline block"
                >
                    {analysis.title}
                </a>
                <p className="text-sm text-muted-foreground">
                    Channel: {data.channel || data.metadata?.channel || "Unknown"}
                </p>
            </div>

            {/* Timestamp & Actions */}
            <div className="text-right flex-shrink-0">
                <p className="text-sm text-muted-foreground">
                    {format(new Date(analysis.createdAt), "MMM dd, yyyy")}
                </p>
                <p className="text-xs text-muted-foreground">
                    {format(new Date(analysis.createdAt), "h:mm a")}
                </p>
                <div className="flex gap-2 mt-2">
                    <button
                        onClick={onCopy}
                        title="Copy JSON"
                        className="px-2 py-1 border rounded hover:bg-accent text-sm flex items-center gap-1"
                    >
                        <Copy className="w-4 h-4" />
                    </button>
                    <button
                        onClick={onDownload}
                        title="Download JSON"
                        className="px-2 py-1 border rounded hover:bg-accent text-sm flex items-center gap-1"
                    >
                        <Download className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
