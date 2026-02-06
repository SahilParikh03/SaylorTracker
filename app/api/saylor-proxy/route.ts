import { NextResponse } from "next/server";

export const runtime = "edge";

// Cache the response for 5 minutes to avoid rate limiting
export const revalidate = 300;

interface RSSItem {
  title: string;
  pubDate: string;
  link: string;
  guid: string;
  author: string;
  thumbnail: string;
  description: string;
  content: string;
  enclosure: Record<string, unknown>;
  categories: string[];
}

interface RSS2JSONResponse {
  status: string;
  feed: {
    url: string;
    title: string;
    link: string;
    author: string;
    description: string;
    image: string;
  };
  items: RSSItem[];
}

export async function GET() {
  try {
    // Using rss.app feed URL - replace with your actual RSS.app URL if different
    const rssUrl = encodeURIComponent(
      "https://rss.app/feeds/v1/t8M5m7X9n0p2L4r6.xml"
    );

    // Fetch from RSS2JSON API
    const response = await fetch(
      `https://api.rss2json.com/v1/api.json?rss_url=${rssUrl}&count=15`,
      {
        headers: {
          "User-Agent": "SaylorTracker/1.0",
        },
        next: {
          revalidate: 300, // Cache for 5 minutes
        },
      }
    );

    if (!response.ok) {
      throw new Error(`RSS feed fetch failed: ${response.status}`);
    }

    const data: RSS2JSONResponse = await response.json();

    if (data.status !== "ok") {
      throw new Error("RSS feed parsing failed");
    }

    // Return with cache headers
    return NextResponse.json(data, {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        "CDN-Cache-Control": "public, s-maxage=300",
        "Vercel-CDN-Cache-Control": "public, s-maxage=300",
      },
    });
  } catch (error) {
    console.error("Saylor proxy error:", error);

    return NextResponse.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error",
        items: [],
      },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      }
    );
  }
}
