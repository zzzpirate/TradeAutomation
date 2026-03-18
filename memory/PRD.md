# PRD: XAUUSD RSI+S/R Expert Advisor

## Original Problem Statement
Build a fully automated MetaTrader 5 Expert Advisor (EA) for XAUUSD (Gold) that can enter and exit trades autonomously with strict risk management, stop loss, take profit, and signal filtering using RSI + Support/Resistance logic.

## User Choices
- **Risk Profile**: Conservative (0.75% risk per trade, max 1 trade/day)
- **Session**: London + NY Overlap (13:00-17:00 GMT)
- **Advanced Features**: All enabled
  - Break-even at 1R ✓
  - Trailing stop after 1.5R ✓
  - Partial TP (50% at 1R) ✓
  - Multi-timeframe confirmation (H1+M15) ✓
  - On-chart dashboard ✓
- **Spread Limits**: Low (50 points max)

## Architecture

### Technology
- **Language**: MQL5 (MetaTrader 5 native)
- **Platform**: MetaTrader 5
- **Libraries**: CTrade, CPositionInfo (standard MT5)

### Core Components
1. **Signal Engine**: RSI + S/R zone detection
2. **Trend Filter**: H1 EMA200 + EMA50 alignment
3. **Risk Manager**: Position sizing, drawdown protection
4. **Trade Manager**: Breakeven, trailing, partial TP
5. **Dashboard**: On-chart real-time display

## What's Been Implemented (Jan 2026)

### Core Features ✅
- [x] RSI indicator with configurable levels (14, 30/70)
- [x] Automatic Support/Resistance zone detection
- [x] Swing high/low identification algorithm
- [x] Zone-based entry (not single line)
- [x] Multi-timeframe trend filter (H1 EMA200 + EMA50)
- [x] Bullish/Bearish candlestick confirmation
- [x] ATR volatility filter
- [x] **Automatic News Filter** (NFP, FOMC, CPI, GDP, PMI, etc.)

### Risk Management ✅
- [x] Risk % based position sizing (0.75% default)
- [x] Fixed lot mode alternative
- [x] Lot normalization to broker specs
- [x] Daily max drawdown limit (3%)
- [x] Equity protection (10%)
- [x] Max trades per day (1)
- [x] Max open trades (1)
- [x] Spread filter (50 points)
- [x] Slippage control (30 points)

### Trade Management ✅
- [x] Structure-based SL placement
- [x] Risk:Reward based TP (1:2)
- [x] Break-even at 1R
- [x] Trailing stop after 1.5R
- [x] Partial TP (50% at 1R)
- [x] Cooldown between trades

### Filters ✅
- [x] Session filter (London/NY overlap)
- [x] Spread filter
- [x] ATR volatility filter
- [x] Trend filter

### Dashboard ✅
- [x] RSI display
- [x] Support/Resistance levels
- [x] Spread indicator
- [x] ATR display
- [x] Daily trade counter
- [x] Session status
- [x] EA status

## Deliverables

| File | Description |
|------|-------------|
| `XAUUSD_RSI_SR_EA.mq5` | Complete EA source code (1800 lines, v1.10) |
| `README.md` | Full documentation with installation guide |
| `QUICK_REFERENCE.md` | Quick start card for traders |

## Backlog (P0/P1/P2)

### P1 - Future Enhancements
- [x] ~~News filter (avoid NFP, FOMC, etc.)~~ **COMPLETED v1.10**
- [ ] Multi-symbol support
- [ ] CSV trade logging
- [ ] Push notifications to mobile
- [ ] Email alerts

### P2 - Nice to Have
- [ ] ATR-based dynamic SL/TP
- [ ] Multiple partial TP levels
- [ ] Time-based exit (close after X hours)
- [ ] Equity curve analysis
- [ ] Performance statistics display

## Next Steps
1. User to copy .mq5 file to MT5 Experts folder
2. Compile in MetaEditor
3. Backtest on 1+ year of XAUUSD data
4. Demo trade for 2 weeks minimum
5. Go live with conservative settings

## Assumptions Made
1. Broker supports XAUUSD with standard contract specs
2. MT5 build 2000+ (for CTrade compatibility)
3. Broker allows 0.01 lot minimum
4. Stop level < 100 points
5. Account currency is USD (for risk calculation)
