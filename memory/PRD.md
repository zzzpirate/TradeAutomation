# PRD: Aurum Quant - XAUUSD Trading Algorithm Showcase

## Original Problem Statement
Build a premium fintech website showcasing XAUUSD trading algorithm performance with a **live demo feature** that spins up a simulated market and shows the algorithm making real-time trading decisions with an "Algorithm Thinking" panel.

## User Choices
- **Design**: Premium dark mode fintech dashboard
- **Colors**: Black/charcoal background with Gold, Emerald, Blue accents
- **Features**: All advanced features + Live Demo
- **Brand**: Aurum Quant

## Architecture

### Technology Stack
- **Framework**: React 18
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Charts**: Recharts
- **Icons**: Lucide React

### File Structure
```
/app/frontend/src/
├── App.js                    # Main application with demo state
├── index.css                 # Global styles
├── data/
│   └── mockData.js           # Static mock data
├── engine/
│   ├── MarketSimulator.js    # Real-time market simulation
│   └── TradingAlgorithm.js   # Algorithm logic (mirrors MQL5 EA)
└── components/
    ├── LiveDemo.jsx          # Live demo modal with thinking panel
    ├── Hero.jsx              # Updated with "View Live Demo" button
    └── ... (other components)
```

## What's Been Implemented (Jan 2026)

### Live Demo Feature ✅ (NEW)
- [x] **Market Simulator**: Generates realistic XAUUSD price movements
- [x] **Trading Algorithm**: JavaScript version of MQL5 EA logic
  - RSI calculation and analysis
  - Support/Resistance detection (swing highs/lows)
  - EMA 200/50 trend filter
  - Candle pattern confirmation
  - Risk management (0.75% per trade)
  - Break-even and trailing stop logic
- [x] **Algorithm Thinking Panel**: Real-time decision logs
  - Shows what the algorithm is analyzing
  - Explains why it takes or skips trades
  - Displays indicator values and conditions
  - Color-coded thought categories
- [x] **Interactive Controls**:
  - Play/Pause simulation
  - Speed controls (1x, 2x, 5x, 10x)
  - Real-time price chart with S/R levels
  - Indicator cards (RSI, EMA, Support, Resistance, Spread)
  - Position tracking and P&L display
- [x] **"View Live Demo" button** in hero section

### Previous Features ✅
- [x] Hero section with animated particles
- [x] Performance KPIs with animated counters
- [x] Interactive equity curve chart
- [x] Drawdown & risk analytics
- [x] Strategy overview with flow cards
- [x] Trade distribution charts
- [x] Recent trades table
- [x] Comparison table
- [x] Testimonials
- [x] FAQ accordion
- [x] Footer with email capture
- [x] Floating stats widget

## Testing Results
- **Live Demo Feature**: 95% pass rate
- All major functionality working

## Backlog (P1/P2)

### P1 - Future Enhancements
- [ ] Connect live demo to actual MT5 via websocket
- [ ] Record and replay actual trading sessions
- [ ] Multiple algorithm presets (aggressive/conservative)

### P2 - Nice to Have
- [ ] Share demo state via URL
- [ ] Download demo session as report
- [ ] Sound effects for trade execution

## URLs
- **Preview**: https://gold-ea-trader-3.preview.emergentagent.com

## Related Files (MQL5 EA)
- `/app/mql5/XAUUSD_RSI_SR_EA.mq5` - Production EA v1.10
- `/app/mql5/README.md` - Installation guide
