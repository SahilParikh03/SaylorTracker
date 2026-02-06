"use client";

import { useLiquidationStream, Liquidation } from "@/hooks/useLiquidationStream";
import { motion, useAnimation } from "framer-motion";
import { useEffect, useRef } from "react";

export default function LiquidationTerminal() {
  const controls = useAnimation();
  const sonarRef = useRef<HTMLAudioElement | null>(null);
  const guhRef = useRef<HTMLAudioElement | null>(null);

  const { liquidations, isWhaleRekt, isConnected, connectionError } = useLiquidationStream({
    onLiquidation: (liquidation) => {
      // Play sonar beep
      if (sonarRef.current) {
        sonarRef.current.currentTime = 0;
        sonarRef.current.play().catch(() => {
          // Ignore autoplay errors
        });
      }

      // Play GUH sound for whale liquidations
      if (liquidation.value >= 100000 && guhRef.current) {
        guhRef.current.currentTime = 0;
        guhRef.current.play().catch(() => {
          // Ignore autoplay errors
        });
      }
    },
  });

  // Shake animation when whale gets rekt
  useEffect(() => {
    if (isWhaleRekt) {
      controls.start({
        x: [0, -15, 15, -15, 15, -10, 10, -5, 5, 0],
        y: [0, -10, 10, -10, 10, -5, 5, -3, 3, 0],
        rotate: [0, -3, 3, -3, 3, -2, 2, -1, 1, 0],
        transition: {
          duration: 0.6,
          times: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 1],
        },
      });
    }
  }, [isWhaleRekt, controls]);

  const formatValue = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(2)}K`;
    }
    return `$${value.toFixed(2)}`;
  };

  return (
    <>
      {/* Audio elements - Placeholder URLs */}
      <audio ref={sonarRef} src="/sounds/sonar.mp3" preload="auto" />
      <audio ref={guhRef} src="/sounds/guh.mp3" preload="auto" />

      <motion.div
        animate={controls}
        className="terminal-border border border-terminal-orange/50 bg-terminal-black p-6 relative overflow-hidden"
      >
        {/* Connection status indicator */}
        <div className="absolute top-2 right-2 flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              isConnected ? "bg-green-500" : "bg-red-500"
            }`}
            style={{
              boxShadow: isConnected
                ? "0 0 8px rgba(34, 197, 94, 0.8)"
                : "0 0 8px rgba(239, 68, 68, 0.8)",
            }}
          />
          <span className="text-xs text-terminal-amber amber-glow">
            {isConnected ? "LIVE" : "OFFLINE"}
          </span>
        </div>

        {/* Header */}
        <h3 className="text-lg font-bold mb-4 plasma-glow">
          &gt; LIQUIDATION TERMINAL
          {isWhaleRekt && (
            <motion.span
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="ml-4 text-red-500 text-2xl"
              style={{
                textShadow:
                  "0 0 20px rgba(255, 0, 0, 0.9), 0 0 40px rgba(255, 0, 0, 0.6)",
              }}
            >
              🐋 WHALE REKT
            </motion.span>
          )}
        </h3>

        {/* Liquidations list */}
        <div className="space-y-2 font-mono text-sm">
          {/* Connection Error Display */}
          {connectionError && (
            <div className="border border-red-500/50 bg-red-950/30 p-3 rounded">
              <p className="text-red-400 font-bold">&gt; CONNECTION ERROR</p>
              <p className="text-red-300 text-xs mt-1">{connectionError}</p>
            </div>
          )}

          {liquidations.length === 0 && !connectionError && (
            <div className="text-terminal-orange-dim amber-glow">
              <p>&gt; AWAITING LIQUIDATIONS...</p>
              <p>&gt; LISTENING TO BINANCE FUTURES STREAM...</p>
            </div>
          )}

          {liquidations.map((liq, index) => {
            const isWhale = liq.value >= 100000;
            const isMegaWhale = liq.value >= 1000000;

            return (
              <motion.div
                key={liq.id}
                initial={{ opacity: 0, x: -20, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{ duration: 0.3 }}
                className={`
                  border-l-2 pl-3 py-2
                  ${
                    isMegaWhale
                      ? "border-red-600 bg-red-950/30"
                      : isWhale
                      ? "border-red-500 bg-red-950/20"
                      : liq.side === "SELL"
                      ? "border-red-400/50 bg-red-950/10"
                      : "border-green-400/50 bg-green-950/10"
                  }
                `}
                style={{
                  opacity: 1 - index * 0.08,
                }}
              >
                <div className="flex justify-between items-center">
                  {/* Symbol and Side */}
                  <div className="flex items-center gap-3">
                    <span className="text-terminal-amber amber-glow font-bold">
                      {liq.symbol}
                    </span>
                    <span
                      className={`
                      px-2 py-0.5 rounded text-xs font-bold
                      ${
                        liq.side === "SELL"
                          ? "bg-red-500/20 text-red-400"
                          : "bg-green-500/20 text-green-400"
                      }
                    `}
                    >
                      {liq.side === "SELL" ? "LONG LIQ" : "SHORT LIQ"}
                    </span>
                    {isWhale && (
                      <span className="text-red-500 text-xs animate-pulse">
                        🐋
                      </span>
                    )}
                    {isMegaWhale && (
                      <span className="text-red-600 text-xs animate-pulse font-black">
                        💀 MEGA
                      </span>
                    )}
                  </div>

                  {/* Value - Neon monospaced */}
                  <div
                    className={`
                    font-bold tabular-nums
                    ${
                      isMegaWhale
                        ? "text-red-500 text-lg"
                        : isWhale
                        ? "text-red-400 text-base"
                        : "text-terminal-orange"
                    }
                  `}
                    style={{
                      textShadow: isMegaWhale
                        ? "0 0 15px rgba(239, 68, 68, 0.9), 0 0 30px rgba(239, 68, 68, 0.5)"
                        : isWhale
                        ? "0 0 12px rgba(248, 113, 113, 0.8), 0 0 24px rgba(248, 113, 113, 0.4)"
                        : "0 0 8px rgba(247, 147, 26, 0.7), 0 0 15px rgba(247, 147, 26, 0.4)",
                    }}
                  >
                    {formatValue(liq.value)}
                  </div>
                </div>

                {/* Details */}
                <div className="mt-1 text-xs text-terminal-orange-dim space-x-4">
                  <span>QTY: {liq.quantity.toFixed(4)}</span>
                  <span>PRICE: ${liq.price.toLocaleString()}</span>
                  <span className="text-terminal-amber/50">
                    {new Date(liq.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Stats footer */}
        {liquidations.length > 0 && (
          <div className="mt-4 pt-4 border-t border-terminal-orange/30">
            <div className="flex justify-between text-xs text-terminal-amber amber-glow">
              <span>
                &gt; TOTAL LIQUIDATED: $
                {liquidations
                  .reduce((sum, liq) => sum + liq.value, 0)
                  .toLocaleString()}
              </span>
              <span>&gt; EVENTS: {liquidations.length}</span>
            </div>
          </div>
        )}

        {/* Whale warning overlay */}
        {isWhaleRekt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.3, 0.3, 0] }}
            transition={{ duration: 2 }}
            className="absolute inset-0 bg-red-500 pointer-events-none"
            style={{
              mixBlendMode: "multiply",
            }}
          />
        )}
      </motion.div>
    </>
  );
}
