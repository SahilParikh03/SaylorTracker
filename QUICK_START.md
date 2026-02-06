# Quick Start: Saylor Sentiment Bot

## What Was Built

✅ **Server-Side RSS Proxy** - Eliminates CORS errors
✅ **Sentiment Analysis Engine** - Calculates conviction scores (0-100)
✅ **Conviction Meter** - Real-time visual sentiment gauge
✅ **SAYLORCOPE Indicator** - Shows (avgPrice - currentPrice) / sentiment
✅ **Pulsing Border** - Activates when conviction > 80
✅ **Price Drop Flicker** - Visual alert when BTC drops >$50

## Setup Steps

### 1. Get an RSS Feed URL

**Option A: RSS.app (Recommended)**
1. Go to https://rss.app/
2. Click "Create RSS Feed"
3. Enter Twitter/X URL: `https://twitter.com/saylor`
4. Copy your feed URL (e.g., `https://rss.app/feeds/v1/XXXXX.xml`)

**Option B: Nitter**
- Use directly: `https://nitter.net/saylor/rss`
- No signup required, but may be rate-limited

### 2. Update the Proxy Route

Edit `app/api/saylor-proxy/route.ts` (line 35):

```typescript
const rssUrl = encodeURIComponent(
  "https://rss.app/feeds/v1/YOUR_FEED_ID_HERE.xml"
);
```

### 3. Test the Proxy

Start dev server:
```bash
npm run dev
```

Visit: http://localhost:3000/api/saylor-proxy

You should see JSON with `"status": "ok"` and an array of tweets.

### 4. View the App

Open: http://localhost:3000

You should see:
- **Left sidebar** with Conviction Meter + Tweet Feed
- **Main content** with stats, water gauge, liquidations

## Feature Demos

### Conviction Score Testing

**High Conviction Tweet (80+):**
> "Bitcoin is the superior cyber property forever 🔥 Laser eyes activated"

- Conviction: ~95 (cyber +20, forever +20, Bitcoin +15, superior +10, property +10, laser +20)
- Border should pulse bright orange
- "MAXIMUM CONVICTION" label appears
- 🔥 emoji next to conviction badge

**Medium Conviction Tweet (50-80):**
> "MicroStrategy continues to stack Bitcoin"

- Conviction: ~60 (Bitcoin +15, stack +15, strategy +15, base 30)
- No border pulse
- "HIGH CONVICTION" label

**Low Conviction Tweet (<50):**
> "Enjoying the weekend"

- Conviction: 30 (base only)
- "MODERATE" or "LOW SIGNAL" label

### SAYLORCOPE Indicator

Formula: `(76052 - currentBTCPrice) / convictionScore`

**Example 1: BTC = $95,000, Conviction = 85**
```
COPE = (76052 - 95000) / 85 = -223.03
```
✅ Negative = We're winning (BTC above Saylor's avg)

**Example 2: BTC = $60,000, Conviction = 70**
```
COPE = (76052 - 60000) / 70 = +229.31
```
⚠️ Positive = Underwater (BTC below Saylor's avg)

### Price Drop Flicker

Simulate by manually changing the BTC price in the Coinbase API response:
1. Open DevTools → Network tab
2. Find the Coinbase API call
3. Right-click → "Override content"
4. Change the price to trigger a >$50 drop
5. Watch the feed flicker

## Troubleshooting

### ❌ Feed shows "JAMMED"
- Check `http://localhost:3000/api/saylor-proxy`
- Verify your RSS feed URL is correct
- Try a different RSS provider (Nitter, OpenRSS)

### ❌ Conviction score always 30
- Tweets might not contain keywords
- Check the cleaned tweet text in console
- Add more keywords to `calculateConvictionScore()` function

### ❌ SAYLORCOPE shows "N/A"
- BTC price hasn't loaded yet (wait 30 seconds)
- Check if `currentPrice > 0` in console

### ❌ Border not pulsing
- Latest tweet conviction must be > 80
- Check if latest tweet contains high-conviction keywords
- Verify framer-motion is installed: `npm install framer-motion`

## Customization Quick Links

### Add Keywords
File: `components/SaylorTweetFeed.tsx`
Function: `calculateConvictionScore()`
Lines: 19-45

### Change Pulse Threshold
File: `components/SaylorTweetFeed.tsx`
Line: 62 → `const shouldPulseBorder = latestConviction > 80;`

### Adjust Price Drop Trigger
File: `components/SaylorTweetFeed.tsx`
Line: 70 → `if (priceDrop > 50) {`

### Modify Feed Refresh Rate
File: `components/SaylorTweetFeed.tsx`
Line: 126 → `const interval = setInterval(fetchTweets, 5 * 60 * 1000);`

### Change Cache Duration
File: `app/api/saylor-proxy/route.ts`
Line: 7 → `export const revalidate = 300;` (seconds)

## Architecture

```
┌─────────────┐
│  RSS.app    │ Twitter → RSS Feed
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│  RSS2JSON API   │ Convert RSS to JSON
└──────┬──────────┘
       │
       ▼
┌──────────────────────┐
│ Next.js API Proxy    │ /api/saylor-proxy
│ (5min cache)         │ Eliminates CORS
└──────┬───────────────┘
       │
       ▼
┌─────────────────────────┐
│  SaylorTweetFeed.tsx    │
│  - Fetch tweets         │
│  - Calculate conviction │
│  - Render UI            │
└─────────────────────────┘
```

## What to Expect

- **Feed updates:** Every 5 minutes
- **Conviction meter:** Updates with each new tweet
- **Pulsing border:** Only when latest tweet > 80
- **SAYLORCOPE:** Updates with Bitcoin price changes
- **Hopium tags:** Green 🚀 for Bitcoin/Cyber/Gold mentions
- **Price flicker:** Triggers on >$50 BTC drops

## Next Steps

1. ✅ Get your RSS feed URL
2. ✅ Update the proxy route
3. ✅ Start dev server: `npm run dev`
4. ✅ Test at http://localhost:3000
5. 🎉 Watch Saylor's conviction in real-time!

## Production Deployment

Before deploying:
1. Add RSS URL to environment variable:
   ```env
   RSS_FEED_URL=https://rss.app/feeds/v1/XXXXX.xml
   ```
2. Update proxy route to use env var:
   ```typescript
   const rssUrl = encodeURIComponent(process.env.RSS_FEED_URL || "");
   ```
3. Deploy to Vercel/Netlify
4. Verify API route works: `https://yourdomain.com/api/saylor-proxy`

## Support

Issues? Check:
- Browser console for errors
- Network tab for failed requests
- API proxy endpoint response
- RSS feed URL accessibility

Happy tracking! 🚀📊
