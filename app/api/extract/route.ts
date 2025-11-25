import { NextResponse } from "next/server";
import { Innertube } from "youtubei.js";
import { google } from "googleapis";
import ytdl from "@distube/ytdl-core";
import YouTube from "youtube-sr";

// Initialize Google API
const youtubeApi = google.youtube("v3");

// Initialize InnerTube (Singleton-ish pattern for serverless might need re-init, but fine for now)
let innerTube: any = null;

async function getInnerTube() {
    if (!innerTube) {
        innerTube = await Innertube.create();
    }
    return innerTube;
}

// Fetch ALL videos from a channel using YouTube Data API v3 with pagination
async function fetchAllChannelVideos(channelId: string, apiKey: string) {
    // Convert channel ID to uploads playlist ID (UC -> UU)
    const uploadsPlaylistId = channelId.replace(/^UC/, "UU");
    let allVideos: any[] = [];
    let pageToken: string | undefined = undefined;
    let pageCount = 0;

    do {
        pageCount++;
        console.log(`📄 Fetching page ${pageCount}... (${allVideos.length} videos so far)`);

        const response: any = await youtubeApi.playlistItems.list({
            key: apiKey,
            part: ["snippet", "contentDetails"],
            playlistId: uploadsPlaylistId,
            maxResults: 50,
            pageToken: pageToken,
        });

        const videos = response.data.items || [];
        allVideos.push(...videos);

        pageToken = response.data.nextPageToken || undefined;

        // Rate limit protection: 100ms delay between requests
        if (pageToken) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    } while (pageToken);

    console.log(`✅ Fetched ${allVideos.length} total videos across ${pageCount} pages`);

    // Log date range for verification
    if (allVideos.length > 0) {
        const dates = allVideos
            .map(v => v.snippet?.publishedAt)
            .filter(Boolean)
            .sort();
        console.log(`📅 Date range: ${dates[0]} (oldest) to ${dates[dates.length - 1]} (newest)`);
    }

    // Fetch statistics AND duration in batches of 50
    console.log(`📊 Fetching video details for ${allVideos.length} videos...`);
    const videoIds = allVideos.map(v => v.contentDetails?.videoId).filter(Boolean);
    const videoDetailsMap: Record<string, { views: string; duration: string }> = {};

    for (let i = 0; i < videoIds.length; i += 50) {
        const batch = videoIds.slice(i, i + 50);
        try {
            const statsResponse: any = await youtubeApi.videos.list({
                key: apiKey,
                part: ["statistics", "contentDetails"],
                id: batch,
            });

            statsResponse.data.items?.forEach((item: any) => {
                if (item.id) {
                    videoDetailsMap[item.id] = {
                        views: item.statistics?.viewCount || "0",
                        duration: item.contentDetails?.duration || "PT0S"
                    };
                }
            });

            // Rate limit protection
            if (i + 50 < videoIds.length) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        } catch (error) {
            console.error(`Failed to fetch details for batch ${i / 50 + 1}:`, error);
        }
    }

    // Helper function to parse ISO 8601 duration to seconds
    const parseDuration = (duration: string): number => {
        const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
        if (!match) return 0;
        const hours = parseInt(match[1] || "0");
        const minutes = parseInt(match[2] || "0");
        const seconds = parseInt(match[3] || "0");
        return hours * 3600 + minutes * 60 + seconds;
    };

    // Filter out Shorts (videos < 60 seconds) and map to response format
    const longformVideos = allVideos
        .filter(item => {
            const videoId = item.contentDetails?.videoId;
            if (!videoId || !videoDetailsMap[videoId]) return false;
            const durationSeconds = parseDuration(videoDetailsMap[videoId].duration);
            return durationSeconds >= 60; // Only longform videos (60+ seconds)
        })
        .map(item => ({
            id: item.contentDetails?.videoId,
            title: item.snippet?.title || "Untitled",
            thumbnail: item.snippet?.thumbnails?.medium?.url || item.snippet?.thumbnails?.default?.url || "",
            url: `https://www.youtube.com/watch?v=${item.contentDetails?.videoId}`,
            views: videoDetailsMap[item.contentDetails?.videoId]?.views || "0",
            published_at: item.snippet?.publishedAt || "Unknown"
        }));

    console.log(`🎬 Filtered to ${longformVideos.length} longform videos (excluded ${allVideos.length - longformVideos.length} Shorts)`);

    return longformVideos;
}

import rateLimit from "@/lib/rate-limit";

const limiter = rateLimit({
    interval: 60 * 1000, // 60 seconds
    uniqueTokenPerInterval: 500,
});

export async function POST(req: Request) {
    try {
        await limiter.check(10, "CACHE_TOKEN"); // 10 requests per minute
    } catch {
        return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    }

    try {
        const { url, type, options, urls } = await req.json(); // Destructure 'urls' here
        const apiKey = process.env.YOUTUBE_API_KEY;

        // Validate input based on type
        if (type === "bulk_analyze") {
            if (!urls || !Array.isArray(urls)) {
                return NextResponse.json({ error: "URLs array is required for bulk_analyze" }, { status: 400 });
            }
        } else if (!url) { // 'url' is required for types other than 'bulk_analyze'
            return NextResponse.json({ error: "URL is required" }, { status: 400 });
        }

        if (type === "video") {
            let title = "";
            let description = "";
            let thumbnail = "";
            let transcript = "";

            // 1. Metadata Extraction
            // Priority: Official API -> InnerTube -> ytdl-core

            let channel = "";
            let views = "0";
            let published_at = "";

            // Try Official API first
            if (apiKey) {
                try {
                    const videoId = ytdl.getVideoID(url);
                    const response = await youtubeApi.videos.list({
                        key: apiKey,
                        part: ["snippet", "statistics"],
                        id: [videoId],
                    });

                    const item = response.data.items?.[0];
                    if (item?.snippet) {
                        title = item.snippet.title || "";
                        description = item.snippet.description || "";
                        thumbnail = item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url || "";
                        channel = item.snippet.channelTitle || "";
                        published_at = item.snippet.publishedAt || "";
                    }
                    if (item?.statistics) {
                        views = item.statistics.viewCount || "0";
                    }
                } catch (apiError) {
                    console.error("YouTube API Error:", apiError);
                }
            }

            // Fallback to InnerTube for metadata
            if (!title) {
                try {
                    const yt = await getInnerTube();
                    const videoId = ytdl.getVideoID(url);
                    const info = await yt.getBasicInfo(videoId);
                    title = info.basic_info.title || "";
                    description = info.basic_info.short_description || "";
                    thumbnail = info.basic_info.thumbnail?.[0]?.url || "";
                    channel = info.basic_info.channel?.name || "";
                    views = info.basic_info.view_count?.toString() || "0";
                    // InnerTube basic info doesn't always have date, but let's try
                    published_at = "Unknown";
                } catch (innerTubeError) {
                    console.error("InnerTube Metadata Error:", innerTubeError);
                }
            }

            // Fallback to ytdl-core
            if (!title) {
                try {
                    const info = await ytdl.getBasicInfo(url);
                    title = info.videoDetails.title;
                    description = info.videoDetails.description || "";
                    thumbnail = info.videoDetails.thumbnails[info.videoDetails.thumbnails.length - 1].url;
                    channel = info.videoDetails.author.name;
                    views = info.videoDetails.viewCount;
                    published_at = info.videoDetails.publishDate;
                } catch (scrapeError) {
                    console.error("Scraping Error:", scrapeError);
                    if (!title) throw new Error("Failed to fetch video metadata");
                }
            }

            // 2. Transcript Extraction (InnerTube is most robust)
            try {
                const yt = await getInnerTube();
                const videoId = ytdl.getVideoID(url);
                const info = await yt.getInfo(videoId);

                try {
                    const transcriptData = await info.getTranscript();
                    if (transcriptData && transcriptData.transcript) {
                        transcript = transcriptData.transcript.content.body.initial_segments
                            .map((s: any) => s.snippet.text)
                            .join(" ");
                    }
                } catch (transcriptError) {
                    console.log("InnerTube Transcript Error (might be no captions):", transcriptError);
                }

            } catch (e: any) {
                console.error("InnerTube failed:", e.message);
            }

            const result: any = {};
            if (!options || options.title !== false) result.title = title;
            if (!options || options.description) result.description = description;
            if (!options || options.thumbnail) result.thumbnail = thumbnail;
            if (!options || options.transcript) result.transcript = transcript || "No transcript available for this video.";

            result.url = url;
            result.channel = channel;
            result.views = views;
            result.published_at = published_at;

            return NextResponse.json({ data: result });

        } else if (type === "bulk_analyze") {
            // urls is already destructured at the top

            const yt = await getInnerTube();
            const results = [];

            for (const videoUrl of urls) {
                try {
                    const videoId = ytdl.getVideoID(videoUrl);
                    const info = await yt.getInfo(videoId);
                    const basicInfo = info.basic_info;
                    const primaryInfo = info.primary_info;
                    const secondaryInfo = info.secondary_info;

                    // 1. Metadata
                    const viewCount = basicInfo.view_count || 0;
                    const likeCount = basicInfo.like_count || 0;
                    // InnerTube doesn't always give exact upload date in basic_info, sometimes relative.
                    // primaryInfo.date might have it.
                    // Let's try to get the most accurate date.
                    const uploadDateStr = primaryInfo?.date?.text || "";
                    const duration = basicInfo.duration || 0; // in seconds

                    // Comment count is tricky, often in secondary info or requires separate fetch.
                    // We'll try to get it if available, else 0.
                    let commentCount = 0;
                    // InnerTube might not expose comment count directly in initial info easily without scrolling.
                    // We will leave it as 0 or try to parse if visible.

                    // 2. Performance Indicators
                    const uploadDate = new Date(uploadDateStr);
                    const daysSinceUpload = Math.max(1, (new Date().getTime() - uploadDate.getTime()) / (1000 * 60 * 60 * 24));
                    const viewsPerDay = Math.round(viewCount / daysSinceUpload);
                    const engagementRate = viewCount > 0 ? ((likeCount + commentCount) / viewCount) * 100 : 0;

                    // 3. Publishing Pattern
                    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
                    const dayOfWeek = isNaN(uploadDate.getTime()) ? "Unknown" : daysOfWeek[uploadDate.getDay()];
                    // Time posted is hard to get exactly without exact timestamp, usually just date is available publicly unless we parse precise upload time from source.
                    // We'll use "Unknown" for time unless we find a better source.

                    // 4. Tags/Category
                    const tags = basicInfo.keywords || [];
                    const category = basicInfo.category || "Unknown";

                    // 5. Transcript (Conditionally fetch)
                    let transcript = "";
                    console.log(`📝 [${videoUrl}] Options received:`, JSON.stringify(options));

                    if (!options || options.transcript !== false) {
                        try {
                            console.log(`📝 [${videoUrl}] Fetching transcript...`);
                            const transcriptData = await info.getTranscript();
                            if (transcriptData && transcriptData.transcript) {
                                transcript = transcriptData.transcript.content.body.initial_segments
                                    .map((s: any) => s.snippet.text)
                                    .join(" ");
                                console.log(`✅ [${videoUrl}] Transcript fetched, length: ${transcript.length}`);
                            } else {
                                console.log(`⚠️ [${videoUrl}] No transcript data found in response`);
                            }
                        } catch (e: any) {
                            console.log(`❌ [${videoUrl}] Transcript fetch failed:`, e.message);
                        }
                    } else {
                        console.log(`⏭️ [${videoUrl}] Transcript extraction skipped (options.transcript is false)`);
                    }

                    // Extract channel name and URL
                    const channelName = secondaryInfo?.owner?.author?.name || basicInfo?.author || "Unknown Channel";
                    // Extract actual channel URL/ID from owner info
                    const channelId = basicInfo?.channel_id || secondaryInfo?.owner?.author?.id || secondaryInfo?.owner?.author?.channel_id || null;
                    const channelUrl = channelId ? `https://www.youtube.com/channel/${channelId}` : null;

                    console.log(`🔗 Extracted channel info - Name: ${channelName}, ID: ${channelId}`);

                    // Construct result object based on options
                    const resultObj: any = {
                        url: videoUrl,
                        metadata: {
                            // Always include essential identification info
                            channel: channelName,
                            channel_url: channelUrl,
                            // Always include title for UI identification
                            title: basicInfo.title || primaryInfo?.title?.text || "Untitled Video",
                        }
                    };

                    // Add Thumbnail if requested
                    if (!options || options.thumbnail !== false) {
                        resultObj.metadata.thumbnail = basicInfo.thumbnail?.[0]?.url || "";
                    }

                    // Title is now always included above, so we don't need the conditional block for it.

                    // Add Description if requested (default true)
                    if (!options || options.description !== false) {
                        resultObj.metadata.description = basicInfo.short_description || "";
                    }

                    // Add Metadata/Stats if requested (default true)
                    if (!options || options.metadata !== false) {
                        resultObj.metadata = {
                            ...resultObj.metadata,
                            views: viewCount,
                            likes: likeCount,
                            upload_date: uploadDateStr,
                            duration: `${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, '0')}`,
                            comment_count: commentCount,
                        };

                        // Add performance metrics
                        resultObj.performance = {
                            views_per_day: viewsPerDay,
                            engagement_rate: parseFloat(engagementRate.toFixed(2)),
                            watch_time_percentage: "N/A"
                        };

                        // Add publishing schedule
                        resultObj.publishing_schedule = {
                            day_of_week: dayOfWeek,
                            time_posted: "Unknown",
                            frequency: "N/A"
                        };

                        // Add tags/category
                        resultObj.tags = tags;
                        resultObj.category = category;
                    }

                    // Add Transcript if requested
                    if (!options || options.transcript !== false) {
                        resultObj.transcript = transcript || "No transcript available.";
                        console.log(`✅ [${videoUrl}] Added transcript to resultObj: ${resultObj.transcript.substring(0, 50)}...`);
                    } else {
                        console.log(`⏭️ [${videoUrl}] Transcript NOT added to resultObj`);
                    }

                    results.push(resultObj);

                } catch (e: any) {
                    console.error(`Failed to analyze ${videoUrl}:`, e);
                    results.push({
                        url: videoUrl,
                        error: "Failed to analyze video"
                    });
                }
            }

            return NextResponse.json({ data: results });

        } else if (type === "channel_list") {
            // Fetch ALL channel videos using YouTube Data API v3

            if (!apiKey) {
                return NextResponse.json({
                    error: "YouTube API key required for channel fetching. Add YOUTUBE_API_KEY to .env.local"
                }, { status: 400 });
            }

            // Extract channel ID from URL
            let channelId = "";
            const idMatch = url.match(/channel\/(UC[\w-]{22})/);

            if (idMatch) {
                channelId = idMatch[1];
            } else {
                // For @handle or /user/ URLs, use InnerTube to resolve
                try {
                    const yt = await getInnerTube();
                    const resolved = await yt.resolveURL(url);
                    if (resolved?.payload?.browseId) {
                        channelId = resolved.payload.browseId;
                    }
                } catch (resolveError) {
                    console.error("Failed to resolve channel URL:", resolveError);
                    return NextResponse.json({
                        error: "Could not resolve channel URL. Please use a direct channel URL (youtube.com/channel/UC...)"
                    }, { status: 400 });
                }
            }

            if (!channelId) {
                return NextResponse.json({
                    error: "Could not extract channel ID from URL"
                }, { status: 400 });
            }

            try {
                console.log(`🎬 Fetching all videos for channel: ${channelId}`);
                const videos = await fetchAllChannelVideos(channelId, apiKey);

                return NextResponse.json({
                    data: videos,
                    meta: {
                        totalVideos: videos.length,
                        channelId: channelId
                    }
                });
            } catch (error: any) {
                console.error("YouTube API Error:", error);
                return NextResponse.json({
                    error: `Failed to fetch channel videos: ${error.message}`
                }, { status: 500 });
            }

        } else {
            return NextResponse.json({ error: "Invalid type" }, { status: 400 });
        }

    } catch (error: any) {
        console.error("Extraction Error:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
