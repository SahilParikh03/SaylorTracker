import { NextResponse } from "next/server";

// Use Node.js runtime for better header handling with large RSS feeds
// export const runtime = "edge"; // REMOVED

// Cache the response for 1 minute to refresh more frequently
export const revalidate = 60;

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

// Define fallback RSS sources for maximum resilience
const RSS_SOURCES = [
  {
    name: "RSS.app Primary",
    url: "https://rss.app/feeds/v1/t8M5m7X9n0p2L4r6.xml",
  },
  {
    name: "Nitter RSS",
    url: "https://nitter.net/saylor/rss",
  },
  {
    name: "OpenRSS",
    url: "https://openrss.org/twitter.com/saylor",
  },
];

async function fetchFromSource(sourceUrl: string): Promise<RSS2JSONResponse> {
  const rssUrl = encodeURIComponent(sourceUrl);
  const response = await fetch(
    `https://api.rss2json.com/v1/api.json?rss_url=${rssUrl}&count=15`,
    {
      headers: {
        "User-Agent": "SaylorTracker/1.0",
      },
      next: {
        revalidate: 60, // Cache for 1 minute
      },
    }
  );

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const data: RSS2JSONResponse = await response.json();

  if (data.status !== "ok" || !data.items || data.items.length === 0) {
    throw new Error("RSS feed parsing failed or empty");
  }

  return data;
}

export async function GET() {
  let lastError: Error | null = null;

  // Try each source in sequence until one succeeds
  for (const source of RSS_SOURCES) {
    try {
      console.log(`[SAYLOR_FEED] Attempting to fetch from: ${source.name}`);

      const data = await fetchFromSource(source.url);

      console.log(`[SAYLOR_FEED] ✅ Success from ${source.name}: ${data.items.length} items`);

      // Return with cache headers
      return NextResponse.json(data, {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
          "CDN-Cache-Control": "public, s-maxage=60",
          "Vercel-CDN-Cache-Control": "public, s-maxage=60",
          "X-RSS-Source": source.name,
        },
      });
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.error(`[SAYLOR_FEED] ❌ Failed on ${source.name}:`, lastError.message);
      // Continue to next source
    }
  }

  // All sources failed
  console.error("[SAYLOR_FEED] 🚨 All RSS sources exhausted. Last error:", lastError);

  return NextResponse.json(
    {
      status: "error",
      message: `All RSS sources failed. Last error: ${lastError?.message || "Unknown error"}`,
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
