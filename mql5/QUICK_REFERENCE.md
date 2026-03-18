# Quick Reference Card - XAUUSD RSI+S/R EA

## Default Configuration Summary

```
┌─────────────────────────────────────────────────────────────┐
│              XAUUSD RSI+S/R EA v1.10 (News Filter)          │
├─────────────────────────────────────────────────────────────┤
│  Risk: 0.75% per trade  │  Max Trades: 1/day              │
│  Session: 13:00-17:00 GMT (London/NY Overlap)              │
│  Timeframes: M15 Entry / H1 Trend                          │
├─────────────────────────────────────────────────────────────┤
│  ENTRY CONDITIONS                                           │
│  ─────────────────                                          │
│  BUY:  Price @ Support + RSI < 30 + Bullish Trend          │
│  SELL: Price @ Resistance + RSI > 70 + Bearish Trend       │
├─────────────────────────────────────────────────────────────┤
│  TRADE MANAGEMENT                                           │
│  ─────────────────                                          │
│  @ 1.0R → Partial TP (50%) + Move SL to Breakeven          │
│  @ 1.5R → Start Trailing Stop (150 pts)                    │
│  @ 2.0R → Final Take Profit                                │
├─────────────────────────────────────────────────────────────┤
│  NEWS FILTER (Auto-blocks trading during events)           │
│  ─────────────────                                          │
│  NFP, FOMC, CPI, GDP, Retail Sales, PMI, Unemployment      │
│  Buffer: 30 min before & after each event                  │
├─────────────────────────────────────────────────────────────┤
│  SAFETY FILTERS                                             │
│  ─────────────────                                          │
│  ✓ Max Spread: 50 points                                   │
│  ✓ Daily Drawdown Limit: 3%                                │
│  ✓ Equity Protection: 10%                                  │
│  ✓ ATR Volatility Filter: 0.5x - 3.0x                      │
│  ✓ Cooldown: 3 candles after trade                         │
└─────────────────────────────────────────────────────────────┘
```

## Installation Checklist

```
□ 1. Copy XAUUSD_RSI_SR_EA.mq5 to MQL5/Experts folder
□ 2. Compile in MetaEditor (F7) - ensure 0 errors
□ 3. Attach to XAUUSD M15 chart
□ 4. Enable AutoTrading (green button)
□ 5. Verify settings in EA Properties
□ 6. Check Experts tab for initialization message
```

## Dashboard Legend

```
┌─────────────────────────────────────────┐
│  RSI: 45.32                             │  ← Current RSI value
│  Support: 2650.50                       │  ← Nearest support zone
│  Resistance: 2680.25                    │  ← Nearest resistance zone
│  Spread: 25 pts                         │  ← Green = OK, Red = High
│  ATR: 15.50                             │  ← Current volatility
│  Daily Trades: 0/1                      │  ← Trades used today
│  Session: ACTIVE                        │  ← Trading session status
│  News: CLEAR                            │  ← News filter status
│  Status: READY                          │  ← EA operational status
└─────────────────────────────────────────┘
```

## News Filter Status

| Status | Meaning |
|--------|---------|
| CLEAR | No high-impact news nearby |
| Next: Xm | High-impact event in X minutes |
| BLOCKED: [event] | Currently avoiding news event |
| DISABLED | News filter is turned off |

## Status Messages

| Status | Meaning |
|--------|---------|
| READY | EA is active and looking for signals |
| MAX DAILY TRADES | Daily limit reached, wait for new day |
| NEWS FILTER | High-impact news event - trading paused |
| HIGH SPREAD | Spread too high, waiting for better conditions |
| SESSION CLOSED | Outside trading hours |
| COOLDOWN: X | Waiting X candles before next signal |

## Profit Target Example

```
Entry: 2660.00 (BUY)
SL: 2657.00 (300 points)
Risk: $75 (0.75% of $10,000)

Trade Progress:
─────────────────────────────────────────────────
2657.00 ├─ SL (LOSS: -$75)
        │
2660.00 ├─ ENTRY
        │
2663.00 ├─ 1R (+$75) → Close 50%, Move SL to BE
        │
2664.50 ├─ 1.5R (+$112.50) → Start Trailing
        │
2666.00 ├─ 2R TP (+$150) → Final Target
─────────────────────────────────────────────────
```

## Key Parameters to Adjust

| For More Trades | For Fewer Trades |
|-----------------|------------------|
| ↑ InpMaxTradesPerDay | ↓ InpMaxTradesPerDay |
| ↑ InpZoneTolerance | ↓ InpZoneTolerance |
| ↓ InpRSIOversold / ↑ InpRSIOverbought | Keep strict RSI levels |
| Disable InpUseCandleConfirm | Enable InpUseCandleConfirm |

| For More Risk | For Less Risk |
|---------------|---------------|
| ↑ InpRiskPercent (max 2%) | ↓ InpRiskPercent |
| ↓ InpRiskRewardRatio | ↑ InpRiskRewardRatio |
| Disable InpEnablePartialTP | Enable InpEnablePartialTP |

## Emergency Actions

**To Stop EA:**
1. Click AutoTrading button (turns red)
2. Or: Right-click chart → Expert Advisors → Remove

**To Close All Positions:**
1. Go to Trade tab
2. Right-click on position
3. Select "Close Position"

---
*Keep this card handy while trading. Good luck!*
