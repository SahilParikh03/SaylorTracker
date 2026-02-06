# Project: The Saylor Submarine (Bloomberg x Brainrot)
## Goal: Real-time liquidation tracker & Michael Saylor "Underwater" dashboard.

## Current Stats (As of Feb 6, 2026)
- Saylor Total BTC: 713,502 BTC
- Total Cost Basis: $54.26 Billion
- Average Price per BTC: $76,052
- Current BTC Market Price: ~$63,200
- Liquidation Data Source: CoinGlass API (v4) / CoinGecko

## Aesthetic Guidelines
- UI: Bloomberg Terminal (CRT scanlines, #00FF00 text, #000000 background).
- Humor: Brainrot micro-animations (CSS-based jitter, laser eye toggles).
- Tech Stack: Next.js (App Router), Tailwind CSS, Framer Motion.

## WebSocket Integration
- Endpoint: wss://fstream.binance.com/ws/!forceOrder@arr
- Event Type: "forceOrder"
- Filtering: We only care about BTCUSDT for the "Saylor" specific alerts, but show all coins for the general "Brainrot" ticker.