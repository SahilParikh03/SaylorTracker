"use client";

import { useState, useEffect, useRef, useCallback } from "react";

export interface Liquidation {
  id: string;
  symbol: string;
  side: "BUY" | "SELL";
  quantity: number;
  price: number;
  value: number;
  timestamp: number;
}

interface UseLiquidationStreamProps {
  onLiquidation?: (liquidation: Liquidation) => void;
  maxLiquidations?: number;
}

interface BinanceLiquidationMessage {
  o: {
    s: string;  // Symbol
    S: "BUY" | "SELL";  // Side
    q: string;  // Quantity
    p: string;  // Price
    T: number;  // Time
  };
}

export function useLiquidationStream({
  onLiquidation,
  maxLiquidations = 10,
}: UseLiquidationStreamProps = {}) {
  const [liquidations, setLiquidations] = useState<Liquidation[]>([]);
  const [isWhaleRekt, setIsWhaleRekt] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const whaleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectTimerRef = useRef<NodeJS.Timeout | null>(null);
  const connectionAttemptRef = useRef<number>(0);

  const handleLiquidation = useCallback((data: BinanceLiquidationMessage) => {
    const quantity = parseFloat(data.o.q);
    const price = parseFloat(data.o.p);
    const value = quantity * price;

    const newLiquidation: Liquidation = {
      id: `${data.o.s}-${data.o.T}-${Math.random()}`,
      symbol: data.o.s,
      side: data.o.S,
      quantity,
      price,
      value,
      timestamp: data.o.T,
    };

    // Update liquidations list (keep last N)
    setLiquidations((prev) => {
      const updated = [newLiquidation, ...prev];
      return updated.slice(0, maxLiquidations);
    });

    // Check for whale liquidation ($100k+)
    if (value >= 100000) {
      setIsWhaleRekt(true);

      // Clear existing timer
      if (whaleTimerRef.current) {
        clearTimeout(whaleTimerRef.current);
      }

      // Reset after 2 seconds
      whaleTimerRef.current = setTimeout(() => {
        setIsWhaleRekt(false);
      }, 2000);
    }

    // Trigger callback
    if (onLiquidation) {
      onLiquidation(newLiquidation);
    }
  }, [onLiquidation, maxLiquidations]);

  const cleanupWebSocket = useCallback(() => {
    if (wsRef.current) {
      try {
        wsRef.current.onopen = null;
        wsRef.current.onmessage = null;
        wsRef.current.onerror = null;
        wsRef.current.onclose = null;

        if (wsRef.current.readyState === WebSocket.OPEN ||
            wsRef.current.readyState === WebSocket.CONNECTING) {
          wsRef.current.close(1000, "Component cleanup");
        }
      } catch (error) {
        console.error("Error during WebSocket cleanup:", error);
      }
      wsRef.current = null;
    }
  }, []);

  const connectWebSocket = useCallback((url: string) => {
    try {
      cleanupWebSocket();

      console.log(`🔗 Attempting to connect to ${url}...`);
      const ws = new WebSocket(url);

      ws.onopen = () => {
        console.log("✅ Connected to Binance liquidation stream");
        setIsConnected(true);
        setConnectionError(null);
        connectionAttemptRef.current = 0;
      };

      ws.onmessage = (event) => {
        try {
          const data: BinanceLiquidationMessage = JSON.parse(event.data);
          if (data.o) {
            handleLiquidation(data);
          }
        } catch (error) {
          console.error("Error parsing liquidation data:", error);
        }
      };

      ws.onerror = (error) => {
        console.error("❌ WebSocket error:", error);

        // Check if it's a rate limit error (429)
        if (error instanceof ErrorEvent && error.message?.includes("429")) {
          const rateLimitMsg = "⚠️ You are being rate limited by Binance. Please wait before reconnecting.";
          console.error(rateLimitMsg);
          setConnectionError(rateLimitMsg);
        } else {
          setConnectionError("Connection error occurred");
        }

        setIsConnected(false);
      };

      ws.onclose = (event) => {
        console.log(`🔌 Disconnected from Binance liquidation stream (Code: ${event.code}, Reason: ${event.reason})`);
        setIsConnected(false);

        // Attempt fallback to port 443 if first connection failed
        if (connectionAttemptRef.current === 0 && !url.includes(":443")) {
          connectionAttemptRef.current++;
          console.log("🔄 Attempting fallback connection on port 443...");
          reconnectTimerRef.current = setTimeout(() => {
            connectWebSocket("wss://fstream.binance.com:443/ws/!forceOrder@arr");
          }, 1000);
        }
      };

      wsRef.current = ws;
    } catch (error) {
      console.error("Failed to create WebSocket connection:", error);
      setConnectionError("Failed to create connection");
      setIsConnected(false);
    }
  }, [cleanupWebSocket, handleLiquidation]);

  useEffect(() => {
    let connectionTimer: NodeJS.Timeout;
    let mounted = true;

    // Delayed connection initialization for stability
    const initializeConnection = () => {
      if (!mounted) return;

      connectionTimer = setTimeout(() => {
        if (mounted) {
          connectWebSocket("wss://fstream.binance.com/ws/!forceOrder@arr");
        }
      }, 500);
    };

    // Wait for window load or initialize immediately if already loaded
    if (typeof window !== "undefined") {
      if (document.readyState === "complete") {
        initializeConnection();
      } else {
        window.addEventListener("load", initializeConnection);
      }

      // Cleanup on beforeunload to prevent ghost connections
      const handleBeforeUnload = () => {
        cleanupWebSocket();
      };
      window.addEventListener("beforeunload", handleBeforeUnload);

      return () => {
        mounted = false;
        window.removeEventListener("load", initializeConnection);
        window.removeEventListener("beforeunload", handleBeforeUnload);

        if (connectionTimer) {
          clearTimeout(connectionTimer);
        }
        if (reconnectTimerRef.current) {
          clearTimeout(reconnectTimerRef.current);
        }
        if (whaleTimerRef.current) {
          clearTimeout(whaleTimerRef.current);
        }

        cleanupWebSocket();
      };
    }

    return () => {
      mounted = false;
    };
  }, [connectWebSocket, cleanupWebSocket]);

  return {
    liquidations,
    isWhaleRekt,
    isConnected,
    connectionError,
  };
}
