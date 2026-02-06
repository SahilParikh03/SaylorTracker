# Saylor Tweet Feed Setup Guide

## Overview
The SaylorTweetFeed component displays Michael Saylor's tweets in a terminal-styled feed with:
- Real-time updates every 5 minutes
- "HOPIUM DETECTED" tags for tweets mentioning Bitcoin, Cyber, or Gold
- Flickering animation when BTC price drops more than $50
- Fallback message when feed is unavailable

## RSS Feed Options

Since Twitter/X has restricted API access, you'll need to use an RSS proxy service. Here are your options:

### Option 1: RSS2JSON (Recommended for Development)
1. Sign up for a free API key at [rss2json.com](https://rss2json.com/)
2. In `components/SaylorTweetFeed.tsx`, replace `your_api_key_here` with your actual API key:
   ```typescript
   const response = await fetch(
     `https://api.rss2json.com/v1/api.json?rss_url=${rssUrl}&api_key=YOUR_ACTUAL_KEY&count=10`
   );
   ```

### Option 2: Nitter Instances (No API Key Required)
Nitter provides RSS feeds without authentication. Update the RSS URL:
```typescript
// Try different Nitter instances if one is down
const rssUrl = encodeURIComponent("https://nitter.net/saylor/rss");
// Alternatives:
// "https://nitter.poast.org/saylor/rss"
// "https://nitter.privacydev.net/saylor/rss"
```

### Option 3: RSS.app
1. Sign up at [rss.app](https://rss.app/)
2. Create a feed for @saylor's Twitter/X profile
3. Replace the fetch URL with your RSS.app feed URL

### Option 4: OpenRSS
No API key needed, but rate-limited:
```typescript
const response = await fetch(
  `https://openrss.org/twitter.com/saylor`
);
```

### Option 5: Self-Hosted Solution
For production, consider:
- Running your own Nitter instance
- Using [Birdwatch](https://github.com/micahflee/birdwatch)
- Setting up a cron job to scrape and cache tweets

## Features Breakdown

### Hopium Detection
Tweets containing these keywords get a special green tag:
- "Bitcoin"
- "Cyber"
- "Gold"

You can modify this list in `components/SaylorTweetFeed.tsx`:
```typescript
const hopiumKeywords = ["Bitcoin", "Cyber", "Gold", "HODL", "Strategy"];
```

### Price Drop Flicker
When BTC price drops more than $50, the entire feed flickers for 3 seconds.
Adjust the threshold in the component:
```typescript
if (priceDrop > 50) {  // Change 50 to your preferred threshold
  setShouldFlicker(true);
```

### Retry Logic
If the feed fails to load, it automatically retries 3 times with 5-second delays.
Customize in the error catch block:
```typescript
if (retryCount < 3) {  // Max retries
  setTimeout(() => {
    setRetryCount((prev) => prev + 1);
  }, 5000);  // Delay between retries
}
```

## Troubleshooting

### Feed Not Loading
1. Check browser console for CORS errors
2. Try a different Nitter instance
3. Verify your API key (if using RSS2JSON)
4. Check if the RSS feed URL is accessible in your browser

### CORS Issues
If you encounter CORS errors, you may need to:
1. Use a CORS proxy (not recommended for production)
2. Set up a serverless function to proxy the request
3. Use Next.js API routes as a backend proxy

Example Next.js API route (`app/api/saylor-feed/route.ts`):
```typescript
export async function GET() {
  const rssUrl = "https://nitter.net/saylor/rss";
  const response = await fetch(
    `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`
  );
  const data = await response.json();
  return Response.json(data);
}
```

Then update the component to fetch from `/api/saylor-feed` instead.

### Rate Limiting
Free tiers have rate limits:
- RSS2JSON: 10,000 requests/day
- Nitter: Varies by instance
- Solution: Implement caching or increase refresh interval

## Production Recommendations

1. **Use environment variables** for API keys:
   ```typescript
   const apiKey = process.env.NEXT_PUBLIC_RSS2JSON_KEY;
   ```

2. **Implement caching** to reduce API calls:
   - Cache responses in localStorage
   - Use SWR or React Query for data fetching
   - Set up server-side caching

3. **Monitor feed health** and switch between providers:
   ```typescript
   const providers = [
     "https://nitter.net/saylor/rss",
     "https://nitter.poast.org/saylor/rss",
     "https://nitter.privacydev.net/saylor/rss",
   ];
   // Try each provider until one works
   ```

4. **Add error reporting** to track feed failures

## Customization

### Change Feed Update Frequency
```typescript
const interval = setInterval(fetchTweets, 5 * 60 * 1000); // 5 minutes
// Change to: 10 * 60 * 1000 for 10 minutes
```

### Adjust Feed Height
In the component JSX:
```typescript
<div className="h-[500px]">  // Change to h-[600px] or h-[400px]
```

### Add More Keywords
```typescript
const hopiumKeywords = [
  "Bitcoin", "Cyber", "Gold",
  "HODL", "Stack", "Strategy",
  "MicroStrategy", "Laser Eyes"
];
```

## Testing

To test with mock data during development, add this temporary code:
```typescript
// In useEffect, before fetchTweets()
if (process.env.NODE_ENV === 'development') {
  setTweets([
    {
      id: '1',
      text: 'Bitcoin is the future of digital property rights. #Cyber',
      timestamp: new Date(),
      hasHopium: true,
    },
    {
      id: '2',
      text: 'Just another day building the future.',
      timestamp: new Date(Date.now() - 3600000),
      hasHopium: false,
    },
  ]);
  return;
}
```

## Support

If you encounter issues:
1. Check the browser console for error messages
2. Verify the RSS feed URL works in your browser
3. Test with different Nitter instances
4. Consider using mock data for development
