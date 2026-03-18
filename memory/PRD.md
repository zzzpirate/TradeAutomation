# PRD: Aurum Quant - XAUUSD Trading Algorithm Showcase

## Original Problem Statement
Build a premium, modern, highly polished website that showcases the performance and credibility of an automated XAUUSD (Gold) MetaTrader 5 trading algorithm. The website should look like a professional fintech / prop-firm / quant trading product landing page combined with a performance analytics dashboard.

## User Choices
- **Design**: Premium dark mode fintech dashboard
- **Colors**: Black/charcoal background with Gold, Emerald, Blue accents
- **Features**: All advanced features enabled (charts, analytics, trade tables)
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
├── App.js                    # Main application
├── index.css                 # Global styles (glassmorphism, gold effects)
├── data/
│   └── mockData.js           # All realistic mock data
└── components/
    ├── Navbar.jsx            # Floating navigation
    ├── Hero.jsx              # Hero section with key stats
    ├── PerformanceKPIs.jsx   # Animated KPI cards
    ├── EquityCurve.jsx       # Interactive equity chart
    ├── DrawdownAnalytics.jsx # Risk analytics section
    ├── StrategyOverview.jsx  # 6-step strategy flow
    ├── TradeAnalytics.jsx    # Distribution charts
    ├── RecentTrades.jsx      # Trade log table
    ├── ComparisonTable.jsx   # vs Manual/Signals/Martingale
    ├── Testimonials.jsx      # User feedback
    ├── FAQ.jsx               # Accordion FAQ
    ├── Footer.jsx            # CTA and contact
    └── FloatingStats.jsx     # Real-time stats widget
```

## What's Been Implemented (Jan 2026)

### Sections ✅
- [x] Hero section with animated particles & status banner
- [x] Performance KPIs with animated counters (8 metrics)
- [x] Interactive equity curve chart with timeframe toggles
- [x] Drawdown & risk analytics section
- [x] Strategy overview with 6-step flow cards
- [x] Trade distribution charts (pie, bar)
- [x] Recent trades table with pagination (18 trades)
- [x] Comparison table (vs Manual/Signals/Martingale)
- [x] Testimonials section
- [x] FAQ accordion (9 questions)
- [x] Footer with email capture CTA
- [x] Floating stats widget

### Design Features ✅
- [x] Premium dark mode (#020617 background)
- [x] Gold accents (#D4AF37)
- [x] Glassmorphism cards with backdrop blur
- [x] Framer Motion animations
- [x] Smooth scroll behavior
- [x] Responsive design (desktop/tablet/mobile)
- [x] Custom scrollbar
- [x] Gold glow effects

### Mock Data ✅
- Performance KPIs (67.4% return, 64.8% win rate, etc.)
- 365-day equity curve data
- 18 recent trade entries
- Monthly returns data
- Session performance data
- Weekday distribution data

## Testing Results
- **Success Rate**: 90%
- **Passed**: Hero, KPIs, Charts, Tables, FAQ, Forms, Responsive
- **Fixed**: Navigation z-index issues

## Backlog (P1/P2)

### P1 - Future Enhancements
- [ ] Connect to live MT5 data via API
- [ ] MyFXBook integration
- [ ] Real-time price ticker
- [ ] User authentication for premium analytics

### P2 - Nice to Have
- [ ] CSV export of trade data
- [ ] PDF performance report generation
- [ ] Dark/light theme toggle
- [ ] Multi-language support

## Related Files

### MQL5 Expert Advisor
Located in `/app/mql5/`:
- `XAUUSD_RSI_SR_EA.mq5` - Trading algorithm (v1.10)
- `README.md` - Installation guide
- `QUICK_REFERENCE.md` - Quick start card

## URLs
- **Preview**: https://gold-ea-trader-3.preview.emergentagent.com
