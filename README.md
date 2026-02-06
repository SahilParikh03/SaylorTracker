# Saylor Tracker

A Next.js 15 application with Bloomberg Terminal aesthetics to track Michael Saylor's Bitcoin strategy.

## Stack

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Roboto Mono** - Monospaced font from Google Fonts

## Bitcoin Orange Terminal Aesthetic (Gas-Plasma Display)

- **Background**: Pure black (`#000000`)
- **Primary Color**: Bitcoin Orange (`#F7931A`)
- **Secondary Color**: Amber (`#FFD166`)
- **Font**: Roboto Mono (monospaced)
- **Effects**: Amber glow on all text, plasma glow on headers, terminal borders

## Getting Started

1. Install dependencies (already done):
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
SaylorTracker/
├── app/
│   ├── globals.css       # Global styles with terminal theme
│   ├── layout.tsx        # Root layout with Bloomberg Terminal UI
│   └── page.tsx          # Home page
├── constants.ts          # Data constants (populate from context_saylor_submarine.md)
├── tailwind.config.ts    # Tailwind configuration with terminal colors
└── package.json          # Project dependencies
```

## Next Steps

1. Populate `constants.ts` with actual Bitcoin purchase data from `context_saylor_submarine.md`
2. Create components for data visualization
3. Add real-time Bitcoin price tracking
4. Build transaction history table
5. Add charts and analytics

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Theme Colors

The Bitcoin Orange gas-plasma display color scheme is configured in `tailwind.config.ts`:

- `terminal-black`: #000000 (Background)
- `terminal-orange`: #F7931A (Bitcoin Orange - Primary)
- `terminal-amber`: #FFD166 (Amber - Secondary)
- `terminal-orange-dim`: #CC7A15 (Dimmed Orange)
- `terminal-orange-dark`: #B86D12 (Dark Orange)

### Custom Effects

- `.plasma-glow` - Intense orange glow for headers (gas-plasma display effect)
- `.amber-glow` - Subtle amber glow for all monospaced text
- `.terminal-glow` - Standard terminal text glow
- `.terminal-border` - Glowing orange borders with inset effect
