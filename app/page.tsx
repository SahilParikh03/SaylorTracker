"use client";

import { INITIAL_STATS } from "@/constants";
import WaterLevelGauge from "@/components/WaterLevelGauge";
import LiquidationTerminal from "@/components/LiquidationTerminal";
import SaylorTweetFeed from "@/components/SaylorTweetFeed";
import { useState, useEffect, useRef } from "react";
import { motion, useAnimation } from "framer-motion";

export default function Home() {
  const [currentPrice, setCurrentPrice] = useState(0);
  const [showGuh, setShowGuh] = useState(false);
  const previousPriceRef = useRef<number>(0);
  const controls = useAnimation();

  useEffect(() => {
    // Fetch current BTC price
    const fetchPrice = async () => {
      try {
        const response = await fetch("https://api.coinbase.com/v2/prices/BTC-USD/spot");
        const data = await response.json();
        const newPrice = parseFloat(data.data.amount);

        // Check if price dropped by more than $100
        if (previousPriceRef.current > 0) {
          const priceDrop = previousPriceRef.current - newPrice;

          if (priceDrop > 100) {
            // Trigger shake animation
            controls.start({
              x: [0, -10, 10, -10, 10, -5, 5, 0],
              y: [0, -5, 5, -5, 5, -2, 2, 0],
              rotate: [0, -2, 2, -2, 2, -1, 1, 0],
              transition: {
                duration: 0.5,
                times: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 1],
              },
            });

            // Show GUH overlay
            setShowGuh(true);
            setTimeout(() => setShowGuh(false), 2000);
          }
        }

        previousPriceRef.current = newPrice;
        setCurrentPrice(newPrice);
      } catch (error) {
        console.error("Error fetching BTC price:", error);
        // Fallback to cost basis if API fails
        setCurrentPrice(INITIAL_STATS.averagePrice);
      }
    };

    fetchPrice();
    const interval = setInterval(fetchPrice, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [controls]);

  return (
    <div className="flex gap-6">
      {/* Left Sidebar - Saylor Sentiment Bot + Tweet Feed */}
      <div className="w-96 flex-shrink-0">
        <SaylorTweetFeed
          currentPrice={currentPrice}
          previousPrice={previousPriceRef.current}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 space-y-6">
        {/* Terminal Welcome */}
        <div className="terminal-border border border-terminal-orange/50 bg-terminal-black p-6">
          <h2 className="text-2xl font-bold plasma-glow mb-4">
            &gt; SAYLOR SUBMARINE TRACKER_
          </h2>
          <div className="space-y-2 text-sm text-terminal-orange-dim amber-glow">
            <p>&gt; INITIALIZING BITCOIN TERMINAL INTERFACE...</p>
            <p>&gt; LOADING BITCOIN STRATEGY DATA...</p>
            <p>&gt; SYSTEM READY</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="terminal-border border border-terminal-orange/50 bg-terminal-black p-4">
            <div className="text-xs text-terminal-amber amber-glow mb-1">TOTAL BTC</div>
            <div className="text-2xl font-bold terminal-glow">{INITIAL_STATS.totalBTC.toLocaleString()}</div>
          </div>

          {/* AVG PRICE - with shake animation */}
          <motion.div
            animate={controls}
            className="terminal-border border border-terminal-orange/50 bg-terminal-black p-4 relative overflow-hidden"
          >
            <div className="text-xs text-terminal-amber amber-glow mb-1">AVG PRICE</div>
            <div className="text-2xl font-bold terminal-glow">${INITIAL_STATS.averagePrice.toLocaleString()}</div>

            {/* GUH overlay */}
            {showGuh && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5, y: 20 }}
                animate={{ opacity: [0, 1, 1, 0], scale: [0.5, 1.2, 1.2, 0.8], y: [20, 0, 0, -10] }}
                transition={{ duration: 2, times: [0, 0.1, 0.7, 1] }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
              >
                <div className="text-red-500 font-black text-6xl opacity-90"
                  style={{
                    textShadow: "0 0 20px rgba(255, 0, 0, 0.8), 0 0 40px rgba(255, 0, 0, 0.5)",
                    filter: "blur(0.5px)"
                  }}
                >
                  GUH
                </div>
              </motion.div>
            )}
          </motion.div>

          <div className="terminal-border border border-terminal-orange/50 bg-terminal-black p-4">
            <div className="text-xs text-terminal-amber amber-glow mb-1">TOTAL INVESTED</div>
            <div className="text-2xl font-bold terminal-glow">${INITIAL_STATS.totalInvested.toLocaleString()}</div>
          </div>
        </div>

        {/* Water Level Gauge */}
        {currentPrice > 0 && <WaterLevelGauge currentPrice={currentPrice} />}

        {/* Liquidation Terminal */}
        <LiquidationTerminal />

        {/* Data Table Placeholder */}
        <div className="terminal-border border border-terminal-orange/50 bg-terminal-black p-6">
          <h3 className="text-lg font-bold mb-4 plasma-glow">
            &gt; TRANSACTION HISTORY
          </h3>
          <div className="text-terminal-orange-dim amber-glow text-sm">
            <p>&gt; NO DATA LOADED</p>
            <p>&gt; AWAITING CONSTANTS CONFIGURATION...</p>
          </div>
        </div>
      </div>
    </div>
  );
}
