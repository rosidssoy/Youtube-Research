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

interface ChannelActivityCardProps {
    analysis: Analysis;
    onCopy: () => void;
    onDownload: () => void;
}

export function ChannelActivityCard({ analysis, onCopy, onDownload }: ChannelActivityCardProps) {
    const data = JSON.parse(analysis.data);
    const videoCount = Array.isArray(data) ? data.length : 0;

    // Extract channel info from first video's metadata
    const firstVideo = Array.isArray(data) && data.length > 0 ? data[0] : null;

    // ALWAYS extract from metadata.channel - don't trust analysis.title as it might be "Channel Analysis"
    const channelName = firstVideo?.metadata?.channel || analysis.title || "Unknown Channel";

    // Use the actual channel URL from metadata, don't construct it from the display name
    // Display names can be different from handles (e.g., "Casual Finance" vs "@casuallyfinance")
    const channelUrl = firstVideo?.metadata?.channel_url || null;

    // Use analysis thumbnail (which is the first video's thumbnail)
    const channelThumbnail = analysis.thumbnail;

    return (
        <div className="flex items-center gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
            {/* Channel Icon/Thumbnail */}
            {channelThumbnail ? (
                <a
                    href={channelUrl || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0 group relative"
                >
                    <img
                        src={channelThumbnail}
                        alt={channelName}
                        className="w-20 h-20 object-cover rounded-full border-2 border-border"
                    />
                    {channelUrl && (
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-full flex items-center justify-center">
                            <ExternalLink className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                    )}
                </a>
            ) : (
                <div className="w-20 h-20 flex items-center justify-center bg-gradient-to-br from-red-500 to-pink-500 rounded-full text-4xl flex-shrink-0 border-2 border-border">
                    📺
                </div>
            )}

            {/* Channel Info */}
            <div className="flex-1 min-w-0">
                <h3 className="font-medium truncate text-lg">{channelName}</h3>
                <p className="text-sm text-muted-foreground">
                    {videoCount} video{videoCount !== 1 ? 's' : ''} extracted
                </p>
                {channelUrl && (
                    <a
                        href={channelUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-1"
                    >
                        View on YouTube
                        <ExternalLink className="w-3 h-3" />
                    </a>
                )}
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
                        className="px-2 py-1 border rounded hover:bg-accent text-sm"
                    >
                        <Copy className="w-4 h-4" />
                    </button>
                    <button
                        onClick={onDownload}
                        title="Download JSON"
                        className="px-2 py-1 border rounded hover:bg-accent text-sm"
                    >
                        <Download className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
