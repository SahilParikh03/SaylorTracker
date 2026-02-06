"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { INITIAL_STATS } from "@/constants";

interface Tweet {
  id: string;
  text: string;
  timestamp: Date;
  hasHopium: boolean;
  convictionScore: number;
}

interface SaylorTweetFeedProps {
  currentPrice: number;
  previousPrice: number;
}

// Classic Saylor tweets as fallback when feed is down
const CLASSIC_SAYLOR_TWEETS: Tweet[] = [
  {
    id: "classic-1",
    text: "Bitcoin is a bank in cyberspace, run by incorruptible software, offering a global, affordable, simple, & secure savings account to billions of people that don't have the option or desire to run their own hedge fund.",
    timestamp: new Date("2020-08-01"),
    hasHopium: true,
    convictionScore: 95,
  },
  {
    id: "classic-2",
    text: "If you want to know what it's going to do in the next decade, just look at what it did in the prior decade. #Bitcoin",
    timestamp: new Date("2021-02-15"),
    hasHopium: true,
    convictionScore: 85,
  },
  {
    id: "classic-3",
    text: "There are no second best options in the 21st century. Bitcoin is the apex property of the human race.",
    timestamp: new Date("2021-06-10"),
    hasHopium: true,
    convictionScore: 100,
  },
  {
    id: "classic-4",
    text: "Digital gold for digital people in the digital economy.",
    timestamp: new Date("2020-12-20"),
    hasHopium: true,
    convictionScore: 75,
  },
  {
    id: "classic-5",
    text: "The most important thing you can do is upgrade yourself from Fiat to Bitcoin.",
    timestamp: new Date("2021-08-05"),
    hasHopium: true,
    convictionScore: 90,
  },
];

// Sentiment analysis function
function calculateConvictionScore(text: string): number {
  let score = 30; // Base score

  const upperText = text.toUpperCase();

  // High conviction keywords (+20 each)
  const highConvictionWords = ["CYBER", "LASER", "FOREVER", "FIRE"];
  highConvictionWords.forEach((word) => {
    if (upperText.includes(word)) {
      score += 20;
    }
  });

  // Medium conviction keywords (+15 each)
  const mediumConvictionWords = ["BITCOIN", "BTC", "STRATEGY", "HODL", "STACK"];
  mediumConvictionWords.forEach((word) => {
    if (upperText.includes(word)) {
      score += 15;
    }
  });

  // Bullish indicators (+10 each)
  const bullishWords = ["GOLD", "FUTURE", "PROPERTY", "DIGITAL", "SUPERIOR"];
  bullishWords.forEach((word) => {
    if (upperText.includes(word)) {
      score += 10;
    }
  });

  // Cap at 100
  return Math.min(score, 100);
}

export default function SaylorTweetFeed({ currentPrice, previousPrice }: SaylorTweetFeedProps) {
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [shouldFlicker, setShouldFlicker] = useState(false);

  const latestConviction = tweets.length > 0 ? tweets[0].convictionScore : 0;
  const shouldPulseBorder = latestConviction > 80;

  // Detect price drops greater than $50
  useEffect(() => {
    if (previousPrice > 0 && currentPrice > 0) {
      const priceDrop = previousPrice - currentPrice;
      if (priceDrop > 50) {
        setShouldFlicker(true);
        setTimeout(() => setShouldFlicker(false), 3000);
      }
    }
  }, [currentPrice, previousPrice]);

  // Fetch tweets from our proxy API
  useEffect(() => {
    const fetchTweets = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/saylor-proxy");

        if (!response.ok) {
          throw new Error("Feed fetch failed");
        }

        const data = await response.json();

        if (data.status !== "ok") {
          throw new Error(data.message || "Feed parsing failed");
        }

        // Parse and process tweets with validation
        const parsedTweets: Tweet[] = data.items
          .map((item: any, index: number) => {
            // VALIDATION: Ensure description or title exists
            const rawText = item.description || item.title || "";

            if (!rawText || rawText.trim().length === 0) {
              console.warn(`[SAYLOR_FEED] Skipping empty item at index ${index}`);
              return null;
            }

            // Strip HTML tags and clean up text safely
            const text = rawText
              .replace(/<[^>]*>/g, "")
              .replace(/&[^;]+;/g, " ")
              .replace(/\s+/g, " ")
              .trim();

            // Skip if text is still empty after cleaning
            if (text.length === 0) {
              return null;
            }

            // Calculate conviction score
            const convictionScore = calculateConvictionScore(text);

            // Check for hopium keywords
            const hopiumKeywords = ["Bitcoin", "Cyber", "Gold"];
            const hasHopium = hopiumKeywords.some((keyword) =>
              text.toLowerCase().includes(keyword.toLowerCase())
            );

            return {
              id: `${item.pubDate || Date.now()}-${index}`,
              text,
              timestamp: new Date(item.pubDate || Date.now()),
              hasHopium,
              convictionScore,
            };
          })
          .filter((tweet): tweet is Tweet => tweet !== null); // Remove nulls

        // If we got valid tweets, use them
        if (parsedTweets.length > 0) {
          setTweets(parsedTweets);
          setRetryCount(0);
        } else {
          throw new Error("No valid tweets in response");
        }
      } catch (err) {
        console.error("Error fetching Saylor tweets:", err);
        setError("FEED_JAMMED");

        // Use Classic Saylor tweets as fallback
        if (tweets.length === 0) {
          console.log("[SAYLOR_FEED] Loading Classic Saylor tweets as fallback");
          setTweets(CLASSIC_SAYLOR_TWEETS);
        }

        // Retry logic
        if (retryCount < 3) {
          setTimeout(() => {
            setRetryCount((prev) => prev + 1);
          }, 5000);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchTweets();
    // Refresh every 5 minutes
    const interval = setInterval(fetchTweets, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [retryCount]);

  // Calculate SAYLORCOPE indicator
  const calculateSaylorCope = (convictionScore: number): string => {
    // Handle edge cases: loading state or zero conviction
    if (currentPrice === 0 || previousPrice === 0) return "LOADING...";
    if (convictionScore === 0) return "N/A";

    const cope = (INITIAL_STATS.averagePrice - currentPrice) / convictionScore;
    return cope.toFixed(2);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Conviction Meter */}
      <div className="terminal-border border border-terminal-orange/50 bg-terminal-black p-4">
        <h4 className="text-xs font-bold text-terminal-amber amber-glow mb-3">
          &gt; CONVICTION METER
        </h4>
        <div className="flex items-center gap-4">
          {/* Vertical bar */}
          <div className="w-12 h-32 bg-terminal-black border border-terminal-orange/30 rounded relative overflow-hidden">
            <motion.div
              className="absolute bottom-0 left-0 right-0 rounded"
              initial={{ height: 0 }}
              animate={{ height: `${latestConviction}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              style={{
                background:
                  latestConviction > 80
                    ? "linear-gradient(to top, #F7931A, #FFD166)"
                    : latestConviction > 50
                    ? "linear-gradient(to top, #CC7A15, #F7931A)"
                    : "linear-gradient(to top, #B86D12, #CC7A15)",
                boxShadow:
                  latestConviction > 80
                    ? "0 0 20px rgba(247, 147, 26, 0.8)"
                    : "0 0 10px rgba(247, 147, 26, 0.4)",
              }}
            />
            {/* Scale markers */}
            {[100, 75, 50, 25].map((mark) => (
              <div
                key={mark}
                className="absolute left-0 right-0 border-t border-terminal-orange/20"
                style={{ bottom: `${mark}%` }}
              />
            ))}
          </div>

          {/* Score display */}
          <div className="flex-1">
            <div
              className="text-4xl font-bold tabular-nums"
              style={{
                color: "#F7931A",
                textShadow:
                  latestConviction > 80
                    ? "0 0 15px rgba(247, 147, 26, 0.9), 0 0 30px rgba(247, 147, 26, 0.6)"
                    : "0 0 8px rgba(247, 147, 26, 0.7)",
              }}
            >
              {latestConviction}
            </div>
            <div className="text-[10px] text-terminal-amber/70 amber-glow mt-1">
              {latestConviction > 80
                ? "MAXIMUM CONVICTION"
                : latestConviction > 50
                ? "HIGH CONVICTION"
                : latestConviction > 30
                ? "MODERATE"
                : "LOW SIGNAL"}
            </div>
            {latestConviction > 80 && (
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-[10px] text-terminal-orange mt-2 font-bold"
              >
                🔥 LASER EYES ACTIVATED
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Tweet Feed */}
      <motion.div
        animate={
          shouldFlicker
            ? {
                opacity: [1, 0.3, 1, 0.2, 1, 0.4, 1],
                transition: { duration: 0.8, times: [0, 0.14, 0.28, 0.42, 0.56, 0.7, 1] },
              }
            : shouldPulseBorder
            ? {
                boxShadow: [
                  "0 0 15px rgba(247, 147, 26, 0.4), inset 0 0 5px rgba(247, 147, 26, 0.2)",
                  "0 0 25px rgba(247, 147, 26, 0.8), inset 0 0 10px rgba(247, 147, 26, 0.4)",
                  "0 0 15px rgba(247, 147, 26, 0.4), inset 0 0 5px rgba(247, 147, 26, 0.2)",
                ],
                transition: { duration: 2, repeat: Infinity },
              }
            : {}
        }
        className="terminal-border border border-terminal-orange/50 bg-terminal-black p-4 h-[500px] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-terminal-orange/30">
          <h3 className="text-base font-bold plasma-glow">
            &gt; SAYLOR_FEED
            {shouldPulseBorder && (
              <span className="ml-2 text-xs text-terminal-orange">🔥</span>
            )}
          </h3>
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                error ? "bg-red-500" : "bg-terminal-orange"
              } animate-pulse`}
              style={{
                boxShadow: error
                  ? "0 0 8px rgba(239, 68, 68, 0.8)"
                  : "0 0 8px rgba(247, 147, 26, 0.8)",
              }}
            />
            <span className="text-xs text-terminal-amber amber-glow">
              {error ? "JAMMED" : "LIVE"}
            </span>
          </div>
        </div>

        {/* Content Area - Scrollable */}
        <div className="flex-1 overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-terminal-orange/50 scrollbar-track-terminal-black">
          {/* Loading State */}
          {isLoading && tweets.length === 0 && (
            <div className="text-terminal-orange-dim amber-glow text-xs space-y-1">
              <p>&gt; ESTABLISHING ENCRYPTED CONNECTION...</p>
              <p>&gt; SCANNING @SAYLOR TRANSMISSION...</p>
              <p className="animate-pulse">&gt; DECODING SIGNAL...</p>
            </div>
          )}

          {/* Error/Jammed State */}
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0.7, 1] }}
              transition={{ duration: 1, repeat: Infinity, repeatDelay: 1 }}
              className="border border-red-500/50 bg-red-950/20 p-3 rounded"
            >
              <p className="text-red-400 font-bold text-xs mb-1">
                ⚠️ COMMUNICATIONS JAMMED BY THE FED
              </p>
              <p className="text-red-300/80 text-xs">
                &gt; SIGNAL INTERCEPTED... RETRYING CONNECTION...
              </p>
              <p className="text-red-300/60 text-xs mt-1">
                &gt; RETRY ATTEMPT: {retryCount + 1}/3
              </p>
              {tweets.length > 0 && (
                <p className="text-yellow-300/80 text-xs mt-2">
                  &gt; DISPLAYING CLASSIC SAYLOR ARCHIVES WHILE RECONNECTING...
                </p>
              )}
            </motion.div>
          )}

          {/* Tweets List */}
          <AnimatePresence>
            {tweets.map((tweet, index) => (
              <motion.div
                key={tweet.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className={`border-l-2 pl-3 py-2 bg-terminal-black/50 ${
                  tweet.convictionScore > 80
                    ? "border-terminal-orange"
                    : "border-terminal-orange/40"
                }`}
              >
                {/* Conviction Badge */}
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                        tweet.convictionScore > 80
                          ? "bg-terminal-orange/20 text-terminal-orange"
                          : tweet.convictionScore > 50
                          ? "bg-terminal-amber/20 text-terminal-amber"
                          : "bg-terminal-orange-dim/20 text-terminal-orange-dim"
                      }`}
                    >
                      CONVICTION: {tweet.convictionScore}
                    </span>
                    {tweet.convictionScore > 80 && (
                      <span className="text-xs">🔥</span>
                    )}
                  </div>
                </div>

                {/* Tweet Text */}
                <p className="text-terminal-orange text-xs leading-relaxed mb-2 font-mono">
                  {tweet.text}
                </p>

                {/* Footer: Timestamp + Hopium Tag + SAYLORCOPE */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-terminal-amber/50 amber-glow">
                      {tweet.timestamp.toLocaleTimeString()} • {tweet.timestamp.toLocaleDateString()}
                    </span>

                    {/* SAYLORCOPE Indicator */}
                    <span
                      className="text-[9px] font-mono text-terminal-orange-dim px-1.5 py-0.5 bg-terminal-black border border-terminal-orange/20 rounded"
                      title="(Average Price - Current Price) / Conviction Score"
                    >
                      COPE: {calculateSaylorCope(tweet.convictionScore)}
                    </span>
                  </div>

                  {/* Hopium Detected Tag */}
                  {tweet.hasHopium && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="px-2 py-0.5 bg-green-500/20 border border-green-500/50 rounded text-[10px] font-bold text-green-400"
                      style={{
                        textShadow:
                          "0 0 10px rgba(34, 197, 94, 0.9), 0 0 20px rgba(34, 197, 94, 0.5)",
                      }}
                    >
                      🚀 HOPIUM
                    </motion.span>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Empty State (no error, no tweets) */}
          {!isLoading && !error && tweets.length === 0 && (
            <div className="text-terminal-orange-dim amber-glow text-xs space-y-1">
              <p>&gt; NO TRANSMISSIONS DETECTED</p>
              <p>&gt; AWAITING @SAYLOR SIGNAL...</p>
            </div>
          )}
        </div>

        {/* Footer Stats */}
        {tweets.length > 0 && (
          <div className="mt-3 pt-2 border-t border-terminal-orange/30">
            <div className="flex justify-between text-[10px] text-terminal-amber/70 amber-glow">
              <span>&gt; DECODED: {tweets.length} MESSAGES</span>
              <span>
                &gt; AVG CONVICTION:{" "}
                {Math.round(
                  tweets.reduce((sum, t) => sum + t.convictionScore, 0) / tweets.length
                )}
              </span>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
