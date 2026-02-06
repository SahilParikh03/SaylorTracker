# Saylor Sentiment Analysis System

## Overview
The Saylor Sentiment Bot analyzes @saylor tweets and calculates a "conviction score" based on keyword analysis. The system includes a real-time conviction meter and SAYLORCOPE indicators.

## How It Works

### Conviction Score Calculation (0-100)

**Base Score:** 30 points

**High Conviction Keywords (+20 each):**
- CYBER
- LASER
- FOREVER
- FIRE

**Medium Conviction Keywords (+15 each):**
- BITCOIN
- BTC
- STRATEGY
- HODL
- STACK

**Bullish Indicators (+10 each):**
- GOLD
- FUTURE
- PROPERTY
- DIGITAL
- SUPERIOR

**Example:**
```
Tweet: "Bitcoin is the superior digital property forever"
Score: 30 (base) + 15 (Bitcoin) + 10 (superior) + 10 (digital) + 10 (property) + 20 (forever) = 95
```

## UI Features

### 1. Conviction Meter (Sidebar Top)
- **Visual:** Vertical bar chart (0-100)
- **Color Gradient:**
  - 0-50: Dark orange → Medium orange
  - 50-80: Medium orange → Bright orange
  - 80-100: Bright orange → Amber (with intense glow)
- **Status Labels:**
  - 0-30: "LOW SIGNAL"
  - 30-50: "MODERATE"
  - 50-80: "HIGH CONVICTION"
  - 80-100: "MAXIMUM CONVICTION" + 🔥 LASER EYES ACTIVATED

### 2. Pulsing Border
When the latest tweet has a conviction score > 80, the entire feed border pulses bright orange.

### 3. Individual Tweet Indicators

**Conviction Badge:**
- Shows conviction score for each tweet
- Color-coded:
  - 80+: Bright orange background
  - 50-80: Amber background
  - <50: Dim orange background
- 80+ tweets get a 🔥 emoji

**SAYLORCOPE Indicator:**
```
COPE = (Saylor's Avg Price - Current BTC Price) / Conviction Score
```

**Example:**
- Saylor's avg: $76,052
- Current BTC: $95,000
- Conviction: 85
- COPE = (76052 - 95000) / 85 = -223.03

**Interpretation:**
- **Negative COPE:** BTC above Saylor's average (we're winning)
- **Positive COPE:** BTC below Saylor's average (underwater)
- **Higher absolute value:** Greater gap between cost basis and current price, adjusted for sentiment

### 4. Hopium Detection
Still intact! Tweets containing "Bitcoin", "Cyber", or "Gold" get the green 🚀 HOPIUM tag.

## API Proxy

### Endpoint: `/api/saylor-proxy`
- **Method:** GET
- **Response:** RSS2JSON formatted data
- **Cache:** 5 minutes (300 seconds)
- **Rate Limit Protection:** Cached responses prevent API spam

### Configuration
Update the RSS URL in `app/api/saylor-proxy/route.ts`:
```typescript
const rssUrl = encodeURIComponent(
  "https://rss.app/feeds/v1/YOUR_FEED_ID.xml"
);
```

### RSS.app Setup
1. Go to [rss.app](https://rss.app/)
2. Create a new feed for Twitter/X @saylor
3. Copy your feed URL (format: `https://rss.app/feeds/v1/XXXXX.xml`)
4. Paste it in the proxy route

## Customization

### Add More Keywords
```typescript
// In SaylorTweetFeed.tsx, calculateConvictionScore function

const highConvictionWords = ["CYBER", "LASER", "FOREVER", "FIRE", "MOON"];
const mediumConvictionWords = ["BITCOIN", "BTC", "STRATEGY", "HODL", "STACK", "ORANGE"];
const bullishWords = ["GOLD", "FUTURE", "PROPERTY", "DIGITAL", "SUPERIOR", "SOUND"];
```

### Adjust Scoring
```typescript
// Change point values
const highConvictionWords = [...]; // +20 each
const mediumConvictionWords = [...]; // +15 each
const bullishWords = [...]; // +10 each

// Or change base score
let score = 30; // Start at 30 instead
```

### Modify Conviction Thresholds
```typescript
// For pulsing border
const shouldPulseBorder = latestConviction > 80; // Change 80 to 70

// For "MAXIMUM CONVICTION" label
{latestConviction > 80 ? "MAXIMUM CONVICTION" : ...} // Change 80
```

### Change SAYLORCOPE Formula
```typescript
const calculateSaylorCope = (convictionScore: number): string => {
  if (currentPrice === 0 || convictionScore === 0) return "N/A";

  // Original: (avgPrice - currentPrice) / conviction
  const cope = (INITIAL_STATS.averagePrice - currentPrice) / convictionScore;

  // Alternative: Show as percentage
  // const cope = ((currentPrice - INITIAL_STATS.averagePrice) / INITIAL_STATS.averagePrice) * 100;

  return cope.toFixed(2);
};
```

## Troubleshooting

### Feed Not Loading
1. **Check the proxy endpoint:** Visit http://localhost:3000/api/saylor-proxy
   - Should return JSON with `status: "ok"`
2. **Verify RSS.app URL:** Ensure your feed ID is correct
3. **Check browser console:** Look for fetch errors

### CORS Errors (Should Be Gone!)
The API proxy route handles all external requests server-side, eliminating CORS issues.

### Conviction Score Always Low
- **Check keyword casing:** Keywords are matched in UPPERCASE
- **Verify tweet text:** Console.log the cleaned text to see what's being analyzed
- **Add more keywords:** Expand the keyword lists

### Pulsing Border Not Working
Ensure you're using the latest framer-motion:
```bash
npm install framer-motion@latest
```

## Performance Notes

- **Cache Duration:** 5 minutes (adjust in route.ts `revalidate` value)
- **Update Frequency:** Frontend polls every 5 minutes
- **Tweet Limit:** 15 tweets per fetch (adjust `count` parameter)
- **Rate Limiting:** Built-in via cache headers

## Future Enhancements

Ideas for v2:
1. **Historical Conviction Chart:** Track conviction scores over time
2. **Conviction Alerts:** Notify when conviction > 90
3. **Keyword Cloud:** Visualize most-used words
4. **Sentiment Trend:** Show if conviction is increasing/decreasing
5. **COPE Leaderboard:** Highest/lowest COPE scores
6. **Multi-account Support:** Track other Bitcoin influencers

## Technical Details

### Files Modified
- `app/api/saylor-proxy/route.ts` - Server-side RSS proxy
- `components/SaylorTweetFeed.tsx` - Frontend with sentiment analysis
- `app/page.tsx` - Layout with sidebar

### Dependencies
- Next.js 14+ (App Router)
- Framer Motion (animations)
- RSS2JSON API (via proxy)

### Data Flow
```
RSS.app → RSS2JSON → Next.js API Proxy → Frontend Component → Sentiment Analysis → UI Render
                     (5min cache)         (5min polling)
```
