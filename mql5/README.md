# XAUUSD RSI + Support/Resistance Expert Advisor

## Professional Gold Trading Bot for MetaTrader 5

A production-ready, fully automated Expert Advisor for trading XAUUSD (Gold) using RSI divergence at Support/Resistance zones with multi-timeframe trend confirmation and **automatic news filtering**.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Strategy Logic](#strategy-logic)
3. [Features](#features)
4. [News Filter](#news-filter)
5. [Installation Guide](#installation-guide)
6. [Configuration Parameters](#configuration-parameters)
7. [Risk Management](#risk-management)
8. [Backtesting Guide](#backtesting-guide)
9. [Live Trading Considerations](#live-trading-considerations)
10. [Troubleshooting](#troubleshooting)

---

## Overview

### Strategy Summary

| Aspect | Configuration |
|--------|---------------|
| **Instrument** | XAUUSD (Gold) |
| **Entry Timeframe** | M15 |
| **Trend Timeframe** | H1 |
| **Strategy Type** | Mean Reversion at S/R with Trend Filter |
| **Risk Per Trade** | 0.75% (Conservative) |
| **Max Trades/Day** | 1 |
| **Session** | London/NY Overlap (13:00-17:00 GMT) |
| **News Filter** | Auto-disables during NFP, FOMC, CPI, etc. |

### Key Philosophy

This EA trades the **bounce** at Support/Resistance zones, confirmed by:
1. RSI oversold/overbought conditions
2. H1 trend alignment (EMA 200 + EMA 50)
3. Candlestick confirmation
4. ATR volatility filter
5. **Automatic news event avoidance**

The conservative approach prioritizes **capital preservation** over frequency, making it suitable for real accounts.

---

## Strategy Logic

### Entry Conditions

#### BUY Signal (All must be true):
```
✓ Price is within Support Zone (swing lows ± tolerance)
✓ RSI < 30 OR RSI crossing up from oversold
✓ H1 Price > EMA 200 (bullish trend)
✓ H1 EMA 50 > EMA 200 (trend alignment)
✓ Bullish candle confirmation (engulfing or strong body)
✓ ATR within normal range (0.5x - 3x average)
✓ Session filter passes (13:00-17:00 GMT)
✓ Spread < Max allowed
✓ No existing BUY position
✓ Daily trade limit not reached
```

#### SELL Signal (All must be true):
```
✓ Price is within Resistance Zone (swing highs ± tolerance)
✓ RSI > 70 OR RSI crossing down from overbought
✓ H1 Price < EMA 200 (bearish trend)
✓ H1 EMA 50 < EMA 200 (trend alignment)
✓ Bearish candle confirmation (engulfing or strong body)
✓ ATR within normal range (0.5x - 3x average)
✓ Session filter passes (13:00-17:00 GMT)
✓ Spread < Max allowed
✓ No existing SELL position
✓ Daily trade limit not reached
```

### Support/Resistance Detection

The EA automatically detects S/R zones by:
1. Scanning the last 50 candles (configurable)
2. Identifying swing highs/lows using 5-candle lookback
3. Finding the nearest swing low below price (Support)
4. Finding the nearest swing high above price (Resistance)
5. Creating zones with configurable tolerance (±100 points default)

### Trade Management

| Feature | Trigger | Action |
|---------|---------|--------|
| **Partial TP** | +1R profit | Close 50% of position |
| **Break-even** | +1R profit | Move SL to entry + 10 points |
| **Trailing Stop** | +1.5R profit | Trail SL by 150 points |

---

## Features

### Core Features
- ✅ RSI + Support/Resistance strategy
- ✅ Multi-timeframe confirmation (H1 trend + M15 entry)
- ✅ Automatic lot sizing based on risk %
- ✅ Structure-based Stop Loss placement
- ✅ Risk:Reward based Take Profit (1:2 default)

### Advanced Features
- ✅ Break-even at 1R
- ✅ Trailing stop after 1.5R
- ✅ Partial take profit (50% at 1R)
- ✅ On-chart dashboard
- ✅ Session filter (London/NY overlap)
- ✅ ATR volatility filter
- ✅ Spread filter
- ✅ Daily drawdown protection
- ✅ Equity protection
- ✅ Cooldown between trades
- ✅ **Automatic News Filter** (NEW in v1.10)

### Safety Features
- ✅ Magic number support (avoid conflicts)
- ✅ Minimum stop level validation
- ✅ Lot size normalization to broker specs
- ✅ Slippage control
- ✅ Error handling and logging

---

## News Filter

### Overview

Gold (XAUUSD) is highly sensitive to US economic data releases. The news filter automatically disables trading during high-impact events to avoid:
- Extreme volatility spikes
- Widened spreads
- Slippage on entry/exit
- Unpredictable price movements

### Filtered Events

| Event | Code | Impact on Gold |
|-------|------|----------------|
| **NFP** | Non-Farm Payrolls | 🔴 Very High |
| **FOMC** | Federal Reserve Decision | 🔴 Very High |
| **CPI** | Consumer Price Index | 🔴 Very High |
| **GDP** | Gross Domestic Product | 🟠 High |
| **Retail Sales** | Consumer Spending | 🟠 High |
| **PMI** | Manufacturing/Services | 🟡 Medium-High |
| **Unemployment** | Jobless Claims | 🟡 Medium-High |
| **Central Bank** | ECB, BOE, BOJ, RBA | 🟠 High |

### How It Works

1. **MT5 Economic Calendar**: Primary method uses the built-in calendar API
2. **Scheduled Events**: Fallback for known recurring events (NFP on 1st Friday, etc.)
3. **Time Buffer**: Stops trading 30 minutes BEFORE and AFTER each event (configurable)

### Dashboard Display

```
News: CLEAR              ← Safe to trade
News: Next: 45m          ← Event in 45 minutes
News: BLOCKED: NFP       ← Currently avoiding NFP
News: DISABLED           ← News filter turned off
```

### Configuration

| Parameter | Default | Description |
|-----------|---------|-------------|
| `InpUseNewsFilter` | true | Enable/disable news filter |
| `InpNewsMinutesBefore` | 30 | Stop trading X minutes before |
| `InpNewsMinutesAfter` | 30 | Resume trading X minutes after |
| `InpFilterNFP` | true | Filter Non-Farm Payrolls |
| `InpFilterFOMC` | true | Filter Fed decisions |
| `InpFilterCPI` | true | Filter inflation data |
| `InpFilterGDP` | true | Filter GDP releases |
| `InpFilterRetailSales` | true | Filter retail sales |
| `InpFilterPMI` | true | Filter PMI data |
| `InpFilterUnemployment` | true | Filter jobless claims |
| `InpFilterCentralBank` | true | Filter all central bank events |

---

## Installation Guide

### Step 1: Download the EA File

Save `XAUUSD_RSI_SR_EA.mq5` to your computer.

### Step 2: Open MetaTrader 5

1. Launch MetaTrader 5
2. Open MetaEditor (press F4 or File → Open MetaEditor)

### Step 3: Install the EA

**Option A: Via File Explorer**
1. Navigate to: `File → Open Data Folder`
2. Go to: `MQL5/Experts/`
3. Copy `XAUUSD_RSI_SR_EA.mq5` into this folder

**Option B: Via MetaEditor**
1. In MetaEditor: `File → Open`
2. Navigate to the downloaded file
3. Save it in the Experts folder

### Step 4: Compile the EA

1. In MetaEditor, open the EA file
2. Press F7 or click `Compile`
3. Ensure "0 errors" in the output window
4. Warnings are acceptable, errors must be fixed

### Step 5: Attach to Chart

1. Return to MetaTrader 5 (F4)
2. Press Ctrl+R to refresh/reload
3. In Navigator panel (Ctrl+N), expand "Expert Advisors"
4. Find "XAUUSD_RSI_SR_EA"
5. Drag it onto a XAUUSD M15 chart

### Step 6: Enable Auto Trading

1. Click "AutoTrading" button in toolbar (should turn green)
2. Or use: Tools → Options → Expert Advisors → "Allow automated trading"

### Step 7: Configure Parameters

1. Right-click on chart → Expert Advisors → Properties
2. Adjust parameters as needed (see Configuration section)
3. Click OK

---

## Configuration Parameters

### General Settings

| Parameter | Default | Description |
|-----------|---------|-------------|
| `InpSymbol` | XAUUSD | Trading symbol |
| `InpEntryTimeframe` | M15 | Entry signal timeframe |
| `InpTrendTimeframe` | H1 | Trend filter timeframe |
| `InpMagicNumber` | 123456 | Unique EA identifier |
| `InpEnableDebugLogs` | true | Enable detailed logging |

### RSI Settings

| Parameter | Default | Description |
|-----------|---------|-------------|
| `InpRSIPeriod` | 14 | RSI calculation period |
| `InpRSIOverbought` | 70 | Overbought level |
| `InpRSIOversold` | 30 | Oversold level |

### Support/Resistance Settings

| Parameter | Default | Description |
|-----------|---------|-------------|
| `InpSRLookback` | 50 | Candles to scan for S/R |
| `InpZoneTolerance` | 100 | Zone tolerance (points) |
| `InpUseCandleConfirm` | true | Require candle confirmation |

### Risk Management Settings

| Parameter | Default | Description |
|-----------|---------|-------------|
| `InpUseFixedLot` | false | Use fixed lot size |
| `InpFixedLotSize` | 0.01 | Fixed lot size |
| `InpRiskPercent` | 0.75 | Risk % per trade |
| `InpMaxOpenTrades` | 1 | Max open trades |
| `InpMaxTradesPerDay` | 1 | Max trades per day |
| `InpDailyMaxDrawdown` | 3.0 | Daily max drawdown % |
| `InpEquityProtection` | 10.0 | Equity drawdown limit % |
| `InpMaxSpread` | 50 | Max spread (points) |

### Stop Loss / Take Profit Settings

| Parameter | Default | Description |
|-----------|---------|-------------|
| `InpSLBuffer` | 50 | SL buffer (points) |
| `InpRiskRewardRatio` | 2.0 | TP as multiple of SL |
| `InpUseStructureSL` | true | Use S/R-based SL |

### Trade Management Settings

| Parameter | Default | Description |
|-----------|---------|-------------|
| `InpEnableBreakeven` | true | Enable break-even |
| `InpBreakevenTriggerR` | 1.0 | Break-even at R multiple |
| `InpEnableTrailing` | true | Enable trailing stop |
| `InpTrailingTriggerR` | 1.5 | Trailing starts at R |
| `InpTrailingDistance` | 150 | Trailing distance (points) |
| `InpEnablePartialTP` | true | Enable partial TP |
| `InpPartialTPLevel` | 1.0 | Partial TP at R multiple |
| `InpPartialTPPercent` | 50.0 | % to close at partial TP |

### Session Filter Settings

| Parameter | Default | Description |
|-----------|---------|-------------|
| `InpUseSessionFilter` | true | Enable session filter |
| `InpSessionStartHour` | 13 | Session start (GMT) |
| `InpSessionEndHour` | 17 | Session end (GMT) |

---

## Risk Management

### Position Sizing Formula

```
Lot Size = (Account Balance × Risk%) / (SL Distance × Tick Value / Tick Size)
```

### Example Calculation

```
Account Balance: $10,000
Risk Per Trade: 0.75% = $75
SL Distance: 300 points ($30 per lot for gold)
Lot Size: $75 / $30 = 0.25 lots
```

### Safety Mechanisms

1. **Daily Drawdown Limit (3%)**: Stops new trades if daily loss exceeds 3%
2. **Equity Protection (10%)**: Disables EA if floating loss exceeds 10%
3. **Spread Filter**: No trades when spread > 50 points
4. **Session Filter**: Only trades during London/NY overlap
5. **Max 1 Trade/Day**: Prevents overtrading
6. **Cooldown**: 3 candles between trades

---

## Backtesting Guide

### Recommended Settings

1. **Symbol**: XAUUSD
2. **Period**: M15
3. **Date Range**: At least 1 year (2023-2024 recommended)
4. **Model**: Every tick based on real ticks (most accurate)
5. **Initial Deposit**: $10,000
6. **Leverage**: 1:100 or your broker's setting

### How to Backtest

1. Open Strategy Tester (Ctrl+R)
2. Select the EA from dropdown
3. Set symbol to XAUUSD
4. Set period to M15
5. Choose "Every tick based on real ticks"
6. Set date range
7. Enable "Visual mode" for first run (to see trades)
8. Click "Start"

### Optimization Tips

Optimize these parameters first:
- `InpRSIPeriod` (10-20)
- `InpSRLookback` (30-100)
- `InpZoneTolerance` (50-200)
- `InpRiskRewardRatio` (1.5-3.0)

---

## Live Trading Considerations

### Before Going Live

- [ ] Backtest on at least 1 year of data
- [ ] Demo trade for minimum 2 weeks
- [ ] Verify spread conditions with your broker
- [ ] Check broker minimum lot size for gold
- [ ] Ensure VPS or stable internet connection

### Recommended Broker Requirements

- ECN/STP execution preferred
- Low spread on XAUUSD (< 30 points typical)
- Minimum lot: 0.01
- Stop level: < 50 points
- Swap consideration for overnight positions

### VPS Recommendations

For 24/5 operation, use a VPS near your broker's server:
- NY4 or LD4 data centers
- Latency < 5ms
- 99.9% uptime

---

## Troubleshooting

### Common Issues

**EA Not Trading**
1. Check AutoTrading is enabled (green button)
2. Verify session time matches GMT
3. Check spread is below max allowed
4. Verify daily trade limit not reached
5. Check Expert tab for errors

**Invalid Stop Loss**
- Increase `InpSLBuffer`
- Broker's minimum stop level may be high
- Check symbol specifications

**Lot Size Too Small**
- Increase risk percentage
- Check broker's minimum lot
- Verify account balance is sufficient

**Compilation Errors**
- Ensure MT5 is up to date
- Check for missing include files
- Verify syntax in modified code

### Checking Logs

1. Go to: Tools → Options → Expert Advisors
2. Enable "Allow DLL imports" if needed
3. Check "Experts" tab in Terminal window
4. Set `InpEnableDebugLogs = true` for detailed logging

### Contact

For issues or feature requests, please document:
- MT5 version
- Broker name
- Error messages from Experts tab
- Screenshot of settings

---

## Disclaimer

⚠️ **RISK WARNING**: Trading forex and CFDs involves substantial risk of loss. This EA is provided for educational purposes. Past performance is not indicative of future results. Always test thoroughly on demo before live trading. Only trade with money you can afford to lose.

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.10 | Jan 2026 | Added automatic news filter for high-impact events |
| 1.00 | Jan 2026 | Initial release |

---

*Built with institutional-grade risk management for conservative gold trading.*
