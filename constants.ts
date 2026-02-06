/**
 * Saylor Submarine Constants
 * Data source: context_saylor_submarine.md
 */

export interface BitcoinPurchase {
  date: string;
  btc: number;
  price: number;
  total: number;
}

export interface SaylorStats {
  totalBTC: number;
  averagePrice: number;
  totalInvested: number;
  currentValue?: number;
  unrealizedGain?: number;
}

// Placeholder data - update with actual data from context_saylor_submarine.md
export const BITCOIN_PURCHASES: BitcoinPurchase[] = [
  // Example structure:
  // {
  //   date: "2024-01-01",
  //   btc: 1000,
  //   price: 45000,
  //   total: 45000000
  // }
];

export const INITIAL_STATS: SaylorStats = {
  totalBTC: 713502,
  averagePrice: 76052,
  totalInvested: 713502 * 76052,
};

// Bitcoin Orange Terminal Color Scheme (Gas-Plasma Display)
export const TERMINAL_COLORS = {
  background: "#000000",
  primary: "#F7931A",      // Bitcoin Orange
  secondary: "#FFD166",    // Amber
  dim: "#CC7A15",          // Dimmed Orange
  dark: "#B86D12",         // Dark Orange
  border: "rgba(247, 147, 26, 0.4)",
} as const;

// API endpoints (if needed)
export const API_ENDPOINTS = {
  btcPrice: "https://api.coinbase.com/v2/prices/BTC-USD/spot",
} as const;
