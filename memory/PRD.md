# PRD: Aurum Quant - XAUUSD Trading Algorithm Showcase

## Original Problem Statement
Build a premium fintech website showcasing XAUUSD trading algorithm performance with a **live demo feature** that:
1. Spins up a dynamic simulated market
2. The algorithm actively takes trades based on optimal conditions
3. Shows real P&L with actual profits and losses
4. Side panel explains the algorithm's thinking in real-time
5. Demonstrates breakeven, trailing stop, and position management

## User Choices
- **Design**: Premium dark mode fintech dashboard
- **Colors**: Black/charcoal background with Gold, Emerald, Blue accents
- **Features**: All advanced features + Enhanced Live Demo
- **Brand**: Aurum Quant

## Architecture

### Technology Stack
- **Framework**: React 18
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Charts**: Recharts
- **Icons**: Lucide React

### Live Demo Engine
```
/app/frontend/src/engine/
├── MarketSimulator.js    # Dynamic market with phases
│   ├── Market phases: markup, markdown, volatile, ranging
│   ├── Automatic S/R level updates
│   ├── Price movement towards key levels
│   └── Realistic volatility spikes
│
└── TradingAlgorithm.js   # Active trading logic
    ├── RSI oversold/overbought detection (35/65 levels)
    ├── Support/Resistance zone trading
    ├── EMA 20/50 trend filter
    ├── Candle pattern recognition
    ├── Breakeven at +0.8R
    ├── Trailing stop at +1.2R
    ├── Partial take profit at +1.0R
    └── Detailed thinking log with categories
```

## What's Been Implemented (Jan 2026)

### Enhanced Live Demo ✅
- [x] **Dynamic Market Simulator**
  - Market phases (markup/markdown/volatile/ranging)
  - Price movements that test S/R levels
  - Automatic phase transitions
  - Volatility spikes
  
- [x] **Active Trading Algorithm**
  - Takes BUY trades at support with RSI oversold
  - Takes SELL trades at resistance with RSI overbought
  - Confirms with candle patterns (engulfing, hammer, etc.)
  - Manages positions with breakeven and trailing stops
  
- [x] **Algorithm Thinking Panel**
  - Real-time decision explanations
  - Color-coded thought categories
  - Shows RSI, Trend, S/R analysis
  - Trade execution and management logs
  - Session summary after trades
  
- [x] **Interactive Controls**
  - Play/Pause simulation
  - Speed controls (1x, 2x, 5x, 10x)
  - Real-time P&L tracking
  - Balance updates after closed trades
  - Recent trades history

### Website Sections ✅
- [x] Hero section with "View Live Demo" CTA
- [x] Performance KPIs with animated counters
- [x] Interactive equity curve chart
- [x] Drawdown & risk analytics
- [x] Strategy overview with flow cards
- [x] Trade distribution charts
- [x] Recent trades table
- [x] Comparison table
- [x] Testimonials & FAQ
- [x] Footer with email capture

## Testing Results
- **Live Demo Feature**: 85% pass rate
- Core trading functionality verified
- Position tracking and P&L calculations working

## URLs
- **Preview**: https://gold-trading-sim.preview.emergentagent.com

## Related Files (MQL5 EA)
- `/app/mql5/XAUUSD_RSI_SR_EA.mq5` - Production EA v1.10 with news filter
- `/app/mql5/README.md` - Installation guide
- `/app/mql5/QUICK_REFERENCE.md` - Quick start card
