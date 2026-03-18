// Trading Algorithm - JavaScript implementation of the XAUUSD RSI+S/R EA
// This mirrors the logic from the MQL5 Expert Advisor

class TradingAlgorithm {
  constructor() {
    // Settings
    this.settings = {
      rsiPeriod: 14,
      rsiOverbought: 70,
      rsiOversold: 30,
      srLookback: 50,
      zoneTolerance: 1.00, // $1.00 tolerance
      emaPeriod: 200,
      emaFastPeriod: 50,
      riskPercent: 0.75,
      maxTradesPerDay: 1,
      maxSpread: 50,
      rrRatio: 2.0,
      slBuffer: 0.50,
      breakevenTriggerR: 1.0,
      trailingTriggerR: 1.5,
      trailingDistance: 1.50
    };

    // State
    this.position = null;
    this.dailyTrades = 0;
    this.lastTradeDay = null;
    this.thoughtLog = [];
    this.tradeHistory = [];
    this.supportLevel = 0;
    this.resistanceLevel = 0;
    this.currentRSI = 50;
    this.prevRSI = 50;
    this.ema200 = 0;
    this.ema50 = 0;
    this.lastCandleTime = 0;
  }

  // Calculate RSI
  calculateRSI(candles) {
    if (candles.length < this.settings.rsiPeriod + 1) return 50;

    const closes = candles.slice(-this.settings.rsiPeriod - 1).map(c => c.close);
    let gains = 0;
    let losses = 0;

    for (let i = 1; i < closes.length; i++) {
      const change = closes[i] - closes[i - 1];
      if (change > 0) gains += change;
      else losses += Math.abs(change);
    }

    const avgGain = gains / this.settings.rsiPeriod;
    const avgLoss = losses / this.settings.rsiPeriod;

    if (avgLoss === 0) return 100;
    const rs = avgGain / avgLoss;
    return Math.round((100 - (100 / (1 + rs))) * 100) / 100;
  }

  // Calculate EMA
  calculateEMA(candles, period) {
    if (candles.length < period) return candles[candles.length - 1]?.close || 0;

    const closes = candles.map(c => c.close);
    const multiplier = 2 / (period + 1);
    let ema = closes.slice(0, period).reduce((a, b) => a + b, 0) / period;

    for (let i = period; i < closes.length; i++) {
      ema = (closes[i] - ema) * multiplier + ema;
    }

    return Math.round(ema * 100) / 100;
  }

  // Detect Support and Resistance
  detectSupportResistance(candles) {
    if (candles.length < this.settings.srLookback) return;

    const lookback = candles.slice(-this.settings.srLookback);
    const currentPrice = candles[candles.length - 1].close;
    const swingHighs = [];
    const swingLows = [];
    const window = 5;

    for (let i = window; i < lookback.length - window; i++) {
      // Check for swing high
      let isSwingHigh = true;
      let isSwingLow = true;

      for (let j = 1; j <= window; j++) {
        if (lookback[i].high <= lookback[i - j].high || lookback[i].high <= lookback[i + j].high) {
          isSwingHigh = false;
        }
        if (lookback[i].low >= lookback[i - j].low || lookback[i].low >= lookback[i + j].low) {
          isSwingLow = false;
        }
      }

      if (isSwingHigh) swingHighs.push(lookback[i].high);
      if (isSwingLow) swingLows.push(lookback[i].low);
    }

    // Find nearest support (highest swing low below price)
    const supportsBelow = swingLows.filter(l => l < currentPrice);
    this.supportLevel = supportsBelow.length > 0 
      ? Math.max(...supportsBelow) 
      : Math.min(...lookback.map(c => c.low));

    // Find nearest resistance (lowest swing high above price)
    const resistancesAbove = swingHighs.filter(h => h > currentPrice);
    this.resistanceLevel = resistancesAbove.length > 0 
      ? Math.min(...resistancesAbove) 
      : Math.max(...lookback.map(c => c.high));

    return {
      support: Math.round(this.supportLevel * 100) / 100,
      resistance: Math.round(this.resistanceLevel * 100) / 100
    };
  }

  // Check if price is near support zone
  isNearSupport(price) {
    return price >= this.supportLevel - this.settings.zoneTolerance &&
           price <= this.supportLevel + this.settings.zoneTolerance;
  }

  // Check if price is near resistance zone
  isNearResistance(price) {
    return price >= this.resistanceLevel - this.settings.zoneTolerance &&
           price <= this.resistanceLevel + this.settings.zoneTolerance;
  }

  // Check for bullish candle
  isBullishCandle(candle, prevCandle) {
    const body = Math.abs(candle.close - candle.open);
    const range = candle.high - candle.low;
    
    if (candle.close > candle.open && body > range * 0.3) {
      // Check for bullish engulfing
      if (prevCandle && prevCandle.close < prevCandle.open) {
        if (candle.close > prevCandle.open && candle.open < prevCandle.close) {
          return { confirmed: true, pattern: 'Bullish Engulfing' };
        }
      }
      if (body > range * 0.5) {
        return { confirmed: true, pattern: 'Strong Bullish' };
      }
    }
    return { confirmed: false, pattern: null };
  }

  // Check for bearish candle
  isBearishCandle(candle, prevCandle) {
    const body = Math.abs(candle.close - candle.open);
    const range = candle.high - candle.low;
    
    if (candle.close < candle.open && body > range * 0.3) {
      // Check for bearish engulfing
      if (prevCandle && prevCandle.close > prevCandle.open) {
        if (candle.close < prevCandle.open && candle.open > prevCandle.close) {
          return { confirmed: true, pattern: 'Bearish Engulfing' };
        }
      }
      if (body > range * 0.5) {
        return { confirmed: true, pattern: 'Strong Bearish' };
      }
    }
    return { confirmed: false, pattern: null };
  }

  // Log a thought
  think(category, message, data = {}) {
    const thought = {
      id: Date.now() + Math.random(),
      timestamp: new Date(),
      category,
      message,
      data
    };
    this.thoughtLog.unshift(thought);
    
    // Keep only last 100 thoughts
    if (this.thoughtLog.length > 100) {
      this.thoughtLog.pop();
    }
    
    return thought;
  }

  // Main analysis function
  analyze(candles, currentTick) {
    const { bid, ask, spread } = currentTick;
    const currentCandle = candles[candles.length - 1];
    const prevCandle = candles[candles.length - 2];
    const isNewCandle = currentCandle.timestamp !== this.lastCandleTime;
    
    if (isNewCandle) {
      this.lastCandleTime = currentCandle.timestamp;
      this.prevRSI = this.currentRSI;
    }

    // Calculate indicators
    this.currentRSI = this.calculateRSI(candles);
    this.ema200 = this.calculateEMA(candles, this.settings.emaPeriod);
    this.ema50 = this.calculateEMA(candles, this.settings.emaFastPeriod);
    this.detectSupportResistance(candles);

    const analysis = {
      timestamp: new Date(),
      price: { bid, ask, spread },
      indicators: {
        rsi: this.currentRSI,
        prevRsi: this.prevRSI,
        ema200: this.ema200,
        ema50: this.ema50,
        support: this.supportLevel,
        resistance: this.resistanceLevel
      },
      conditions: {},
      signal: null,
      thoughts: []
    };

    // Only analyze on new candles
    if (!isNewCandle && !this.position) {
      return analysis;
    }

    // Check daily reset
    const today = new Date().toDateString();
    if (this.lastTradeDay !== today) {
      this.dailyTrades = 0;
      this.lastTradeDay = today;
      this.think('system', 'New trading day started. Daily trade count reset.', { date: today });
    }

    // Manage existing position
    if (this.position) {
      return this.managePosition(analysis, currentTick);
    }

    // Check if we can trade
    if (this.dailyTrades >= this.settings.maxTradesPerDay) {
      this.think('filter', 'Daily trade limit reached. Waiting for next day.', { trades: this.dailyTrades });
      return analysis;
    }

    if (spread > this.settings.maxSpread) {
      this.think('filter', `Spread too high: ${spread} points > ${this.settings.maxSpread} max`, { spread });
      return analysis;
    }

    // Analyze for BUY signal
    this.think('analysis', 'Scanning market for trading opportunities...', { price: bid });

    // Check trend alignment
    const bullishTrend = bid > this.ema200 && this.ema50 > this.ema200;
    const bearishTrend = bid < this.ema200 && this.ema50 < this.ema200;

    analysis.conditions.bullishTrend = bullishTrend;
    analysis.conditions.bearishTrend = bearishTrend;

    this.think('trend', `Trend Analysis: EMA50=${this.ema50.toFixed(2)}, EMA200=${this.ema200.toFixed(2)}`, {
      trend: bullishTrend ? 'BULLISH' : bearishTrend ? 'BEARISH' : 'NEUTRAL',
      priceVsEma: bid > this.ema200 ? 'ABOVE' : 'BELOW'
    });

    // Check S/R zones
    const nearSupport = this.isNearSupport(bid);
    const nearResistance = this.isNearResistance(bid);

    analysis.conditions.nearSupport = nearSupport;
    analysis.conditions.nearResistance = nearResistance;

    this.think('structure', `Support: ${this.supportLevel.toFixed(2)} | Resistance: ${this.resistanceLevel.toFixed(2)}`, {
      nearSupport,
      nearResistance,
      distanceToSupport: (bid - this.supportLevel).toFixed(2),
      distanceToResistance: (this.resistanceLevel - bid).toFixed(2)
    });

    // Check RSI
    const rsiOversold = this.currentRSI < this.settings.rsiOversold;
    const rsiOverbought = this.currentRSI > this.settings.rsiOverbought;
    const rsiCrossedUpFromOversold = this.currentRSI > this.settings.rsiOversold && this.prevRSI <= this.settings.rsiOversold;
    const rsiCrossedDownFromOverbought = this.currentRSI < this.settings.rsiOverbought && this.prevRSI >= this.settings.rsiOverbought;

    analysis.conditions.rsiOversold = rsiOversold;
    analysis.conditions.rsiOverbought = rsiOverbought;

    this.think('rsi', `RSI: ${this.currentRSI.toFixed(2)} (prev: ${this.prevRSI.toFixed(2)})`, {
      status: rsiOversold ? 'OVERSOLD' : rsiOverbought ? 'OVERBOUGHT' : 'NEUTRAL',
      crossedUp: rsiCrossedUpFromOversold,
      crossedDown: rsiCrossedDownFromOverbought
    });

    // BUY Signal Check
    if (bullishTrend && nearSupport && (rsiOversold || rsiCrossedUpFromOversold)) {
      const candleConfirm = this.isBullishCandle(prevCandle, candles[candles.length - 3]);
      
      this.think('signal', '🔍 Checking BUY conditions...', {
        trendAligned: true,
        atSupport: true,
        rsiCondition: true,
        candlePattern: candleConfirm.pattern
      });

      if (candleConfirm.confirmed) {
        this.think('decision', `✅ BUY SIGNAL CONFIRMED! ${candleConfirm.pattern} pattern at support with RSI oversold.`, {
          pattern: candleConfirm.pattern
        });

        analysis.signal = {
          type: 'BUY',
          reason: `${candleConfirm.pattern} at support zone (${this.supportLevel.toFixed(2)}) with RSI ${this.currentRSI.toFixed(2)} in uptrend`,
          entry: ask,
          sl: this.supportLevel - this.settings.slBuffer,
          tp: ask + (ask - (this.supportLevel - this.settings.slBuffer)) * this.settings.rrRatio
        };
      } else {
        this.think('waiting', 'BUY setup forming but awaiting candle confirmation...', {});
      }
    }

    // SELL Signal Check
    if (bearishTrend && nearResistance && (rsiOverbought || rsiCrossedDownFromOverbought)) {
      const candleConfirm = this.isBearishCandle(prevCandle, candles[candles.length - 3]);
      
      this.think('signal', '🔍 Checking SELL conditions...', {
        trendAligned: true,
        atResistance: true,
        rsiCondition: true,
        candlePattern: candleConfirm.pattern
      });

      if (candleConfirm.confirmed) {
        this.think('decision', `✅ SELL SIGNAL CONFIRMED! ${candleConfirm.pattern} pattern at resistance with RSI overbought.`, {
          pattern: candleConfirm.pattern
        });

        analysis.signal = {
          type: 'SELL',
          reason: `${candleConfirm.pattern} at resistance zone (${this.resistanceLevel.toFixed(2)}) with RSI ${this.currentRSI.toFixed(2)} in downtrend`,
          entry: bid,
          sl: this.resistanceLevel + this.settings.slBuffer,
          tp: bid - ((this.resistanceLevel + this.settings.slBuffer) - bid) * this.settings.rrRatio
        };
      } else {
        this.think('waiting', 'SELL setup forming but awaiting candle confirmation...', {});
      }
    }

    // No signal conditions
    if (!analysis.signal) {
      if (!bullishTrend && !bearishTrend) {
        this.think('waiting', 'No clear trend direction. EMAs not aligned. Standing aside.', {});
      } else if (!nearSupport && !nearResistance) {
        this.think('waiting', 'Price not at key S/R zone. Waiting for price to reach support or resistance.', {
          priceLocation: 'BETWEEN_LEVELS'
        });
      } else if (!rsiOversold && !rsiOverbought) {
        this.think('waiting', 'RSI in neutral zone. Waiting for oversold/overbought conditions.', {});
      }
    }

    return analysis;
  }

  // Execute a trade
  executeTrade(signal, balance = 10000) {
    const slDistance = Math.abs(signal.entry - signal.sl);
    const riskAmount = balance * (this.settings.riskPercent / 100);
    const lotSize = Math.round((riskAmount / (slDistance * 100)) * 100) / 100;

    this.position = {
      id: `XAU-${Date.now()}`,
      type: signal.type,
      entry: signal.entry,
      sl: signal.sl,
      tp: signal.tp,
      lots: Math.max(0.01, Math.min(lotSize, 0.5)),
      openTime: new Date(),
      reason: signal.reason,
      breakevenSet: false,
      trailingActive: false,
      initialSL: signal.sl
    };

    this.dailyTrades++;

    this.think('execution', `🎯 TRADE EXECUTED: ${signal.type} @ ${signal.entry.toFixed(2)}`, {
      sl: signal.sl.toFixed(2),
      tp: signal.tp.toFixed(2),
      lots: this.position.lots,
      risk: this.settings.riskPercent + '%'
    });

    return this.position;
  }

  // Manage open position
  managePosition(analysis, currentTick) {
    const { bid, ask } = currentTick;
    const pos = this.position;
    const currentPrice = pos.type === 'BUY' ? bid : ask;
    const slDistance = Math.abs(pos.entry - pos.initialSL);
    const profit = pos.type === 'BUY' 
      ? currentPrice - pos.entry 
      : pos.entry - currentPrice;
    const rMultiple = profit / slDistance;

    analysis.position = {
      ...pos,
      currentPrice,
      unrealizedPnL: profit * pos.lots * 100,
      rMultiple: Math.round(rMultiple * 100) / 100
    };

    // Check Stop Loss
    if ((pos.type === 'BUY' && currentPrice <= pos.sl) ||
        (pos.type === 'SELL' && currentPrice >= pos.sl)) {
      return this.closePosition('SL_HIT', currentPrice, analysis);
    }

    // Check Take Profit
    if ((pos.type === 'BUY' && currentPrice >= pos.tp) ||
        (pos.type === 'SELL' && currentPrice <= pos.tp)) {
      return this.closePosition('TP_HIT', currentPrice, analysis);
    }

    // Break-even logic
    if (!pos.breakevenSet && rMultiple >= this.settings.breakevenTriggerR) {
      const newSL = pos.type === 'BUY' 
        ? pos.entry + 0.10 
        : pos.entry - 0.10;
      
      this.position.sl = newSL;
      this.position.breakevenSet = true;

      this.think('management', `🔒 BREAK-EVEN SET: SL moved to ${newSL.toFixed(2)} (+1R reached)`, {
        rMultiple: rMultiple.toFixed(2),
        newSL: newSL.toFixed(2)
      });
    }

    // Trailing stop logic
    if (pos.breakevenSet && rMultiple >= this.settings.trailingTriggerR) {
      const trailPrice = pos.type === 'BUY'
        ? currentPrice - this.settings.trailingDistance
        : currentPrice + this.settings.trailingDistance;

      if ((pos.type === 'BUY' && trailPrice > pos.sl) ||
          (pos.type === 'SELL' && trailPrice < pos.sl)) {
        this.position.sl = trailPrice;
        this.position.trailingActive = true;

        this.think('management', `📈 TRAILING STOP: SL moved to ${trailPrice.toFixed(2)}`, {
          rMultiple: rMultiple.toFixed(2),
          trailDistance: this.settings.trailingDistance
        });
      }
    }

    // Periodic position update thoughts
    if (Math.random() > 0.95) {
      this.think('monitoring', `Position update: ${pos.type} @ ${pos.entry.toFixed(2)} | Current: ${currentPrice.toFixed(2)} | P&L: ${(profit * pos.lots * 100).toFixed(2)} (${rMultiple.toFixed(2)}R)`, {
        rMultiple: rMultiple.toFixed(2),
        unrealizedPnL: (profit * pos.lots * 100).toFixed(2)
      });
    }

    return analysis;
  }

  // Close position
  closePosition(reason, exitPrice, analysis) {
    const pos = this.position;
    const profit = pos.type === 'BUY' 
      ? exitPrice - pos.entry 
      : pos.entry - exitPrice;
    const pnl = profit * pos.lots * 100;
    const slDistance = Math.abs(pos.entry - pos.initialSL);
    const rMultiple = profit / slDistance;

    const closedTrade = {
      ...pos,
      exitPrice,
      exitTime: new Date(),
      closeReason: reason,
      pnl: Math.round(pnl * 100) / 100,
      rMultiple: Math.round(rMultiple * 100) / 100,
      result: pnl >= 0 ? 'WIN' : 'LOSS'
    };

    this.tradeHistory.unshift(closedTrade);
    this.position = null;

    const emoji = pnl >= 0 ? '✅' : '❌';
    this.think('execution', `${emoji} TRADE CLOSED: ${reason} @ ${exitPrice.toFixed(2)} | P&L: $${pnl.toFixed(2)} (${rMultiple.toFixed(2)}R)`, {
      result: closedTrade.result,
      pnl: closedTrade.pnl,
      rMultiple: closedTrade.rMultiple
    });

    analysis.closedTrade = closedTrade;
    return analysis;
  }

  getThoughts() {
    return this.thoughtLog;
  }

  getPosition() {
    return this.position;
  }

  getTradeHistory() {
    return this.tradeHistory;
  }

  getIndicators() {
    return {
      rsi: this.currentRSI,
      ema200: this.ema200,
      ema50: this.ema50,
      support: this.supportLevel,
      resistance: this.resistanceLevel
    };
  }
}

export default TradingAlgorithm;
