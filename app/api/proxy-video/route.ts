import { NextResponse } from "next/server";
import { Innertube, UniversalCache } from "youtubei.js";
import "jintr"; // Polyfill for JS evaluation

// Cache InnerTube instance
let yt: Innertube | null = null;

async function getInnertube() {
    if (!yt) {
        yt = await Innertube.create({
            cache: new UniversalCache(false),
            generate_session_locally: true
        });
    }
    return yt;
}

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const url = searchParams.get("url");
    const range = req.headers.get("range");

    if (!url) {
        return new NextResponse("Missing URL", { status: 400 });
    }

    console.log(`🎥 Proxying video: ${url} | Range: ${range || "None"}`);

    // Extract Video ID
    let videoId = "";
    const shortMatch = url.match(/youtu\.be\/([^?&]+)/);
    const watchMatch = url.match(/[?&]v=([^&]+)/);
    const embedMatch = url.match(/embed\/([^?&]+)/);

    if (watchMatch) videoId = watchMatch[1];
    else if (shortMatch) videoId = shortMatch[1];
    else if (embedMatch) videoId = embedMatch[1];

    if (!videoId) {
        return new NextResponse("Invalid YouTube URL", { status: 400 });
    }

    // ---------------------------------------------------------
    // STRATEGY 1: Piped API (Best for avoiding IP blocks)
    // ---------------------------------------------------------
    try {
        console.log(`🔹 Strategy 1: Piped API for ID: ${videoId}`);
        const pipedResponse = await fetch(`https://api.piped.private.coffee/streams/${videoId}`);

        if (pipedResponse.ok) {
            const data = await pipedResponse.json();
            const streams = data.videoStreams || [];
            let stream = streams.find((s: any) => s.mimeType === "video/mp4" && s.quality === "1080p");
            if (!stream) stream = streams.find((s: any) => s.mimeType === "video/mp4" && s.quality === "720p");
            if (!stream) stream = streams.find((s: any) => s.mimeType === "video/mp4");

            if (stream) {
                console.log(`✅ Piped URL found: ${stream.url.substring(0, 50)}...`);
                return proxyStream(stream.url, range);
            }
        } else {
            console.warn(`⚠️ Piped API failed: ${pipedResponse.status}`);
        }
    } catch (error: any) {
        console.warn(`⚠️ Piped API error: ${error.message}`);
    }

    // ---------------------------------------------------------
    // STRATEGY 2: Innertube (Local Fallback)
    // ---------------------------------------------------------
    try {
        console.log(`🔹 Strategy 2: Innertube Fallback`);
        const youtube = await getInnertube();
        const info = await youtube.getInfo(videoId);

        const format = info.streaming_data?.formats.find((f: any) => f.mime_type.includes("video/mp4")) ||
            info.streaming_data?.adaptive_formats.find((f: any) => f.mime_type.includes("video/mp4"));

        if (format && format.url) {
            console.log(`✅ Innertube URL found`);
            return proxyStream(format.url, range);
        }
    } catch (error: any) {
        console.error(`❌ Innertube error: ${error.message}`);
    }

    return new NextResponse("Video unavailable or restricted", { status: 404 });
}

// Helper to stream the video
async function proxyStream(videoUrl: string, range: string | null) {
    const fetchHeaders: HeadersInit = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    };
    if (range) fetchHeaders["Range"] = range;

    const videoResponse = await fetch(videoUrl, { headers: fetchHeaders });

    if (!videoResponse.ok) {
        return new NextResponse(`Upstream Error: ${videoResponse.status}`, { status: videoResponse.status });
    }

    const headers = new Headers();
    headers.set("Content-Type", "video/mp4");
    headers.set("Access-Control-Allow-Origin", "*");
    headers.set("Accept-Ranges", "bytes");

    const contentLength = videoResponse.headers.get("content-length");
    if (contentLength) headers.set("Content-Length", contentLength);

    const contentRange = videoResponse.headers.get("content-range");
    if (contentRange) headers.set("Content-Range", contentRange);

    return new NextResponse(videoResponse.body, {
        status: videoResponse.status,
        headers,
    });
}
