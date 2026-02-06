"use client";

import { INITIAL_STATS } from "@/constants";

interface WaterLevelGaugeProps {
  currentPrice: number;
}

export default function WaterLevelGauge({ currentPrice }: WaterLevelGaugeProps) {
  const costBasis = INITIAL_STATS.averagePrice;
  const isUnderwater = currentPrice < costBasis;

  // Calculate the percentage position for visualization
  const maxPrice = Math.max(currentPrice, costBasis) * 1.2;
  const minPrice = Math.min(currentPrice, costBasis) * 0.8;
  const priceRange = maxPrice - minPrice;

  const costBasisPosition = ((maxPrice - costBasis) / priceRange) * 100;
  const currentPricePosition = ((maxPrice - currentPrice) / priceRange) * 100;

  // Calculate the height of the underwater area
  const underwaterHeight = isUnderwater
    ? Math.abs(currentPricePosition - costBasisPosition)
    : 0;
  const underwaterTop = isUnderwater ? costBasisPosition : 0;

  return (
    <div className="terminal-border border border-terminal-orange/50 bg-terminal-black p-6">
      <h3 className="text-lg font-bold mb-4 plasma-glow">
        &gt; WATER LEVEL GAUGE
      </h3>

      <div className="relative w-full h-64 bg-black/50 border border-terminal-orange/30 rounded">
        {/* Water level gradient - only shows if underwater */}
        {isUnderwater && (
          <div
            className="absolute left-0 right-0 transition-all duration-1000"
            style={{
              top: `${underwaterTop}%`,
              height: `${underwaterHeight}%`,
              background: "linear-gradient(to bottom, rgba(0, 20, 40, 0.9), rgba(0, 5, 15, 0.95))",
              borderTop: "1px solid rgba(0, 100, 200, 0.3)",
              borderBottom: "1px solid rgba(0, 100, 200, 0.3)",
            }}
          >
            <div className="absolute inset-0 opacity-30"
              style={{
                background: "repeating-linear-gradient(0deg, transparent, transparent 10px, rgba(0, 100, 200, 0.1) 10px, rgba(0, 100, 200, 0.1) 20px)"
              }}
            />
          </div>
        )}

        {/* Cost Basis Line (Water Surface) */}
        <div
          className="absolute left-0 right-0 border-t-2 border-blue-400 transition-all duration-500"
          style={{ top: `${costBasisPosition}%` }}
        >
          <div className="absolute left-2 -top-3 text-xs text-blue-400 font-mono">
            SURFACE: ${costBasis.toLocaleString()}
          </div>
          <div className="absolute right-0 left-0 h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-50" />
        </div>

        {/* Current Price Indicator */}
        <div
          className="absolute left-0 right-0 transition-all duration-500"
          style={{ top: `${currentPricePosition}%` }}
        >
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full ${isUnderwater ? 'bg-blue-600' : 'bg-terminal-orange'} pulse-glow`} />
            <div className={`ml-2 text-sm font-mono ${isUnderwater ? 'text-blue-400' : 'text-terminal-orange'}`}>
              CURRENT: ${currentPrice.toLocaleString()}
              {isUnderwater && (
                <span className="ml-2 text-blue-300 text-xs">⚠ UNDERWATER</span>
              )}
            </div>
          </div>
        </div>

        {/* Depth indicator */}
        {isUnderwater && (
          <div className="absolute bottom-2 left-2 text-xs text-blue-400/70 font-mono">
            DEPTH: ${(costBasis - currentPrice).toLocaleString()}
          </div>
        )}
      </div>

      {/* Status readout */}
      <div className="mt-4 space-y-1 text-xs font-mono">
        <div className={`${isUnderwater ? 'text-blue-400' : 'text-terminal-amber'} amber-glow`}>
          {isUnderwater
            ? `&gt; STATUS: SUBMARINE MODE ACTIVE - ${((1 - currentPrice / costBasis) * 100).toFixed(2)}% BELOW SURFACE`
            : `&gt; STATUS: ABOVE WATER - ${((currentPrice / costBasis - 1) * 100).toFixed(2)}% PROFIT`
          }
        </div>
        <div className="text-terminal-orange-dim">
          &gt; TOTAL BTC: {INITIAL_STATS.totalBTC.toLocaleString()}
        </div>
        {isUnderwater && (
          <div className="text-blue-400/70">
            &gt; UNREALIZED LOSS: ${((costBasis - currentPrice) * INITIAL_STATS.totalBTC).toLocaleString()}
          </div>
        )}
      </div>
    </div>
  );
}
