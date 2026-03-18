// Enhanced Trading Algorithm - Optimized for Demo Showcase
// More aggressive signal detection while maintaining realistic behavior

class TradingAlgorithm {
  constructor() {
    this.settings = {
      rsiPeriod: 14,
      rsiOverbought: 65, // Lowered for more signals
      rsiOversold: 35,   // Raised for more signals
      srLookback: 30,
      zoneTolerance: 2.50, // Wider zone
      emaPeriod: 50,      // Faster EMA for quicker signals
      emaFastPeriod: 20,
      riskPercent: 0.75,
      maxTradesPerDay: 10, // Allow more trades in demo
      maxSpread: 50,
      rrRatio: 2.0,
      slBuffer: 1.50,
      breakevenTriggerR: 0.8,  // Earlier breakeven
      trailingTriggerR: 1.2,   // Earlier trailing
      trailingDistance: 2.00,
      partialTPRatio: 0.5,     // Partial TP at 50%
      partialTPTriggerR: 1.0
    };

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
    this.lastAnalysisTime = 0;
    this.cooldownTicks = 0;
    this.partialTPTaken = false;
    
    // Track market structure
    this.trendDirection = 'neutral';
    this.trendStrength = 0;
    this.lastSwingHigh = 0;
    this.lastSwingLow = 0;
  }

  calculateRSI(candles) {
    if (candles.length < this.settings.rsiPeriod + 1) return 50;

    const closes = candles.slice(-(this.settings.rsiPeriod + 1)).map(c => c.close);
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

  detectSupportResistance(candles) {
    if (candles.length < this.settings.srLookback) return;

    const lookback = candles.slice(-this.settings.srLookback);
    const currentPrice = candles[candles.length - 1].close;
    const swingHighs = [];
    const swingLows = [];
    const window = 3; // Smaller window for faster detection

    for (let i = window; i < lookback.length - window; i++) {
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

    // Find nearest support
    const supportsBelow = swingLows.filter(l => l < currentPrice);
    this.supportLevel = supportsBelow.length > 0 
      ? Math.max(...supportsBelow) 
      : Math.min(...lookback.map(c => c.low));

    // Find nearest resistance
    const resistancesAbove = swingHighs.filter(h => h > currentPrice);
    this.resistanceLevel = resistancesAbove.length > 0 
      ? Math.min(...resistancesAbove) 
      : Math.max(...lookback.map(c => c.high));

    // Track swing points
    if (swingHighs.length > 0) this.lastSwingHigh = Math.max(...swingHighs);
    if (swingLows.length > 0) this.lastSwingLow = Math.min(...swingLows);

    return {
      support: Math.round(this.supportLevel * 100) / 100,
      resistance: Math.round(this.resistanceLevel * 100) / 100
    };
  }

  analyzeTrend(candles, currentPrice) {
    const ema20 = this.calculateEMA(candles, 20);
    const ema50 = this.calculateEMA(candles, 50);
    
    // Determine trend
    if (currentPrice > ema20 && ema20 > ema50) {
      this.trendDirection = 'bullish';
      this.trendStrength = Math.min(100, ((currentPrice - ema50) / ema50) * 1000);
    } else if (currentPrice < ema20 && ema20 < ema50) {
      this.trendDirection = 'bearish';
      this.trendStrength = Math.min(100, ((ema50 - currentPrice) / ema50) * 1000);
    } else {
      this.trendDirection = 'neutral';
      this.trendStrength = 0;
    }

    return {
      direction: this.trendDirection,
      strength: Math.round(this.trendStrength),
      ema20,
      ema50
    };
  }

  isNearSupport(price) {
    const distance = price - this.supportLevel;
    return distance >= -this.settings.zoneTolerance && distance <= this.settings.zoneTolerance * 1.5;
  }

  isNearResistance(price) {
    const distance = this.resistanceLevel - price;
    return distance >= -this.settings.zoneTolerance && distance <= this.settings.zoneTolerance * 1.5;
  }

  getCandlePattern(candle, prevCandle) {
    if (!candle || !prevCandle) return { type: null, strength: 0 };
    
    const body = candle.close - candle.open;
    const absBody = Math.abs(body);
    const range = candle.high - candle.low;
    const upperWick = candle.high - Math.max(candle.open, candle.close);
    const lowerWick = Math.min(candle.open, candle.close) - candle.low;
    
    const prevBody = prevCandle.close - prevCandle.open;
    
    // Bullish patterns
    if (body > 0) {
      // Bullish engulfing
      if (prevBody < 0 && candle.close > prevCandle.open && candle.open < prevCandle.close) {
        return { type: 'bullish_engulfing', strength: 90 };
      }
      // Hammer (bullish reversal)
      if (lowerWick > absBody * 2 && upperWick < absBody * 0.3) {
        return { type: 'hammer', strength: 75 };
      }
      // Strong bullish
      if (absBody > range * 0.6) {
        return { type: 'strong_bullish', strength: 70 };
      }
      return { type: 'bullish', strength: 50 };
    }
    
    // Bearish patterns
    if (body < 0) {
      // Bearish engulfing
      if (prevBody > 0 && candle.close < prevCandle.open && candle.open > prevCandle.close) {
        return { type: 'bearish_engulfing', strength: 90 };
      }
      // Shooting star (bearish reversal)
      if (upperWick > absBody * 2 && lowerWick < absBody * 0.3) {
        return { type: 'shooting_star', strength: 75 };
      }
      // Strong bearish
      if (absBody > range * 0.6) {
        return { type: 'strong_bearish', strength: 70 };
      }
      return { type: 'bearish', strength: 50 };
    }
    
    return { type: 'doji', strength: 30 };
  }

  think(category, message, data = {}) {
    const thought = {
      id: Date.now() + Math.random(),
      timestamp: new Date(),
      category,
      message,
      data
    };
    this.thoughtLog.unshift(thought);
    if (this.thoughtLog.length > 100) this.thoughtLog.pop();
    return thought;
  }

  analyze(candles, currentTick, marketPhase = null) {
    const { bid, ask, spread } = currentTick;
    const currentCandle = candles[candles.length - 1];
    const prevCandle = candles[candles.length - 2];
    const prev2Candle = candles[candles.length - 3];
    const isNewCandle = currentCandle.timestamp !== this.lastCandleTime;
    
    // Cooldown management
    if (this.cooldownTicks > 0) {
      this.cooldownTicks--;
    }

    if (isNewCandle) {
      this.lastCandleTime = currentCandle.timestamp;
      this.prevRSI = this.currentRSI;
    }

    // Calculate all indicators
    this.currentRSI = this.calculateRSI(candles);
    this.ema50 = this.calculateEMA(candles, this.settings.emaFastPeriod);
    this.ema200 = this.calculateEMA(candles, this.settings.emaPeriod);
    this.detectSupportResistance(candles);
    const trendInfo = this.analyzeTrend(candles, bid);
    const candlePattern = this.getCandlePattern(prevCandle, prev2Candle);

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
      trend: trendInfo,
      pattern: candlePattern,
      conditions: {},
      signal: null
    };

    // Manage existing position first
    if (this.position) {
      return this.managePosition(analysis, currentTick);
    }

    // Only analyze for new signals on new candles or periodically
    const now = Date.now();
    if (!isNewCandle && now - this.lastAnalysisTime < 500) {
      return analysis;
    }
    this.lastAnalysisTime = now;

    // Check trading conditions
    if (this.cooldownTicks > 0) {
      return analysis;
    }

    if (spread > this.settings.maxSpread) {
      this.think('filter', `⚠️ Spread too wide: ${spread} points. Waiting for better conditions.`, { spread });
      return analysis;
    }

    // Main analysis logging
    this.think('analysis', `📊 Analyzing market... Price: $${bid.toFixed(2)} | Phase: ${marketPhase?.phase || 'unknown'}`, {
      price: bid.toFixed(2),
      phase: marketPhase?.phase
    });

    // Trend analysis
    this.think('trend', `📈 Trend: ${trendInfo.direction.toUpperCase()} (Strength: ${trendInfo.strength}%)`, {
      direction: trendInfo.direction,
      strength: trendInfo.strength,
      ema20: trendInfo.ema20?.toFixed(2),
      ema50: trendInfo.ema50?.toFixed(2)
    });

    // RSI analysis
    const rsiStatus = this.currentRSI < this.settings.rsiOversold ? 'OVERSOLD' : 
                      this.currentRSI > this.settings.rsiOverbought ? 'OVERBOUGHT' : 'NEUTRAL';
    this.think('rsi', `📉 RSI(14): ${this.currentRSI.toFixed(1)} - ${rsiStatus}`, {
      value: this.currentRSI.toFixed(1),
      status: rsiStatus,
      oversoldLevel: this.settings.rsiOversold,
      overboughtLevel: this.settings.rsiOverbought
    });

    // Support/Resistance analysis
    const distToSupport = (bid - this.supportLevel).toFixed(2);
    const distToResistance = (this.resistanceLevel - bid).toFixed(2);
    this.think('structure', `🎯 S/R Levels | Support: $${this.supportLevel.toFixed(2)} (${distToSupport}) | Resistance: $${this.resistanceLevel.toFixed(2)} (${distToResistance})`, {
      support: this.supportLevel.toFixed(2),
      resistance: this.resistanceLevel.toFixed(2),
      distToSupport,
      distToResistance
    });

    // Check for BUY setup
    const nearSupport = this.isNearSupport(bid);
    const rsiOversold = this.currentRSI < this.settings.rsiOversold;
    const rsiCrossingUp = this.currentRSI > this.settings.rsiOversold && this.prevRSI <= this.settings.rsiOversold;
    const bullishTrend = trendInfo.direction === 'bullish' || (trendInfo.direction === 'neutral' && bid > this.ema200);
    const bullishPattern = candlePattern.type?.includes('bullish') || candlePattern.type === 'hammer';

    analysis.conditions = {
      nearSupport,
      nearResistance: this.isNearResistance(bid),
      rsiOversold,
      rsiOverbought: this.currentRSI > this.settings.rsiOverbought,
      bullishTrend,
      bearishTrend: trendInfo.direction === 'bearish' || (trendInfo.direction === 'neutral' && bid < this.ema200),
      bullishPattern,
      bearishPattern: candlePattern.type?.includes('bearish') || candlePattern.type === 'shooting_star'
    };

    // BUY Signal Logic
    if (nearSupport && (rsiOversold || rsiCrossingUp)) {
      this.think('signal', `🔍 BUY SETUP DETECTED at support zone!`, {
        nearSupport: true,
        rsi: this.currentRSI.toFixed(1),
        support: this.supportLevel.toFixed(2)
      });

      if (bullishPattern && candlePattern.strength >= 50) {
        this.think('confirmation', `✅ Candle confirmation: ${candlePattern.type.replace('_', ' ').toUpperCase()} (${candlePattern.strength}% strength)`, {
          pattern: candlePattern.type,
          strength: candlePattern.strength
        });

        const slPrice = this.supportLevel - this.settings.slBuffer;
        const slDistance = ask - slPrice;
        const tpPrice = ask + (slDistance * this.settings.rrRatio);

        this.think('decision', `🎯 BUY SIGNAL CONFIRMED! Entry: $${ask.toFixed(2)} | SL: $${slPrice.toFixed(2)} | TP: $${tpPrice.toFixed(2)}`, {
          entry: ask.toFixed(2),
          sl: slPrice.toFixed(2),
          tp: tpPrice.toFixed(2),
          rr: this.settings.rrRatio
        });

        analysis.signal = {
          type: 'BUY',
          reason: `${candlePattern.type.replace('_', ' ')} at support ($${this.supportLevel.toFixed(2)}) with RSI ${this.currentRSI.toFixed(1)}`,
          entry: ask,
          sl: slPrice,
          tp: tpPrice
        };
      } else {
        this.think('waiting', `⏳ Awaiting candle confirmation for BUY... Current: ${candlePattern.type || 'neutral'}`, {
          pattern: candlePattern.type,
          strength: candlePattern.strength
        });
      }
    }

    // SELL Signal Logic
    const nearResistance = this.isNearResistance(bid);
    const rsiOverbought = this.currentRSI > this.settings.rsiOverbought;
    const rsiCrossingDown = this.currentRSI < this.settings.rsiOverbought && this.prevRSI >= this.settings.rsiOverbought;
    const bearishTrend = trendInfo.direction === 'bearish' || (trendInfo.direction === 'neutral' && bid < this.ema200);
    const bearishPattern = candlePattern.type?.includes('bearish') || candlePattern.type === 'shooting_star';

    if (nearResistance && (rsiOverbought || rsiCrossingDown) && !analysis.signal) {
      this.think('signal', `🔍 SELL SETUP DETECTED at resistance zone!`, {
        nearResistance: true,
        rsi: this.currentRSI.toFixed(1),
        resistance: this.resistanceLevel.toFixed(2)
      });

      if (bearishPattern && candlePattern.strength >= 50) {
        this.think('confirmation', `✅ Candle confirmation: ${candlePattern.type.replace('_', ' ').toUpperCase()} (${candlePattern.strength}% strength)`, {
          pattern: candlePattern.type,
          strength: candlePattern.strength
        });

        const slPrice = this.resistanceLevel + this.settings.slBuffer;
        const slDistance = slPrice - bid;
        const tpPrice = bid - (slDistance * this.settings.rrRatio);

        this.think('decision', `🎯 SELL SIGNAL CONFIRMED! Entry: $${bid.toFixed(2)} | SL: $${slPrice.toFixed(2)} | TP: $${tpPrice.toFixed(2)}`, {
          entry: bid.toFixed(2),
          sl: slPrice.toFixed(2),
          tp: tpPrice.toFixed(2),
          rr: this.settings.rrRatio
        });

        analysis.signal = {
          type: 'SELL',
          reason: `${candlePattern.type.replace('_', ' ')} at resistance ($${this.resistanceLevel.toFixed(2)}) with RSI ${this.currentRSI.toFixed(1)}`,
          entry: bid,
          sl: slPrice,
          tp: tpPrice
        };
      } else {
        this.think('waiting', `⏳ Awaiting candle confirmation for SELL... Current: ${candlePattern.type || 'neutral'}`, {
          pattern: candlePattern.type,
          strength: candlePattern.strength
        });
      }
    }

    // No setup message
    if (!analysis.signal && !nearSupport && !nearResistance) {
      if (Math.random() > 0.7) { // Don't spam
        this.think('scanning', `👀 No setup at current price. Waiting for price to reach key levels...`, {
          priceLocation: bid > this.supportLevel && bid < this.resistanceLevel ? 'BETWEEN_LEVELS' : 'OUTSIDE_RANGE'
        });
      }
    }

    return analysis;
  }

  executeTrade(signal, balance = 10000) {
    const slDistance = Math.abs(signal.entry - signal.sl);
    const riskAmount = balance * (this.settings.riskPercent / 100);
    const pipValue = 1; // Simplified for gold
    const lotSize = Math.round((riskAmount / (slDistance * pipValue * 100)) * 100) / 100;

    this.position = {
      id: `XAU-${Date.now().toString(36).toUpperCase()}`,
      type: signal.type,
      entry: signal.entry,
      sl: signal.sl,
      tp: signal.tp,
      lots: Math.max(0.01, Math.min(lotSize, 0.50)),
      openTime: new Date(),
      reason: signal.reason,
      breakevenSet: false,
      trailingActive: false,
      initialSL: signal.sl,
      initialRisk: slDistance,
      partialClosed: false
    };

    this.dailyTrades++;
    this.partialTPTaken = false;
    this.cooldownTicks = 30; // Cooldown after trade

    this.think('execution', `🚀 TRADE OPENED: ${signal.type} ${this.position.lots} lots @ $${signal.entry.toFixed(2)}`, {
      id: this.position.id,
      type: signal.type,
      entry: signal.entry.toFixed(2),
      sl: signal.sl.toFixed(2),
      tp: signal.tp.toFixed(2),
      lots: this.position.lots,
      risk: `$${riskAmount.toFixed(2)} (${this.settings.riskPercent}%)`
    });

    return this.position;
  }

  managePosition(analysis, currentTick) {
    const { bid, ask } = currentTick;
    const pos = this.position;
    const currentPrice = pos.type === 'BUY' ? bid : ask;
    const profit = pos.type === 'BUY' 
      ? currentPrice - pos.entry 
      : pos.entry - currentPrice;
    const rMultiple = profit / pos.initialRisk;
    const pnlDollars = profit * pos.lots * 100;

    analysis.position = {
      ...pos,
      currentPrice,
      unrealizedPnL: Math.round(pnlDollars * 100) / 100,
      rMultiple: Math.round(rMultiple * 100) / 100
    };

    // Check Stop Loss
    if ((pos.type === 'BUY' && currentPrice <= pos.sl) ||
        (pos.type === 'SELL' && currentPrice >= pos.sl)) {
      const reason = pos.breakevenSet ? 'BREAKEVEN_STOP' : 'STOP_LOSS';
      return this.closePosition(reason, currentPrice, analysis);
    }

    // Check Take Profit
    if ((pos.type === 'BUY' && currentPrice >= pos.tp) ||
        (pos.type === 'SELL' && currentPrice <= pos.tp)) {
      return this.closePosition('TAKE_PROFIT', currentPrice, analysis);
    }

    // Partial Take Profit
    if (!this.partialTPTaken && rMultiple >= this.settings.partialTPTriggerR) {
      this.partialTPTaken = true;
      const partialPnL = (pnlDollars * this.settings.partialTPRatio);
      
      this.think('management', `💰 PARTIAL TP: Closed 50% @ $${currentPrice.toFixed(2)} for +$${partialPnL.toFixed(2)} (+${rMultiple.toFixed(2)}R)`, {
        closedPercent: '50%',
        pnl: partialPnL.toFixed(2),
        rMultiple: rMultiple.toFixed(2)
      });
    }

    // Break-even logic
    if (!pos.breakevenSet && rMultiple >= this.settings.breakevenTriggerR) {
      const newSL = pos.type === 'BUY' 
        ? pos.entry + 0.20 
        : pos.entry - 0.20;
      
      this.position.sl = newSL;
      this.position.breakevenSet = true;

      this.think('management', `🔒 BREAKEVEN SET: SL moved to $${newSL.toFixed(2)} (Entry + buffer). Risk eliminated!`, {
        trigger: `+${this.settings.breakevenTriggerR}R`,
        newSL: newSL.toFixed(2),
        profit: pnlDollars.toFixed(2)
      });
    }

    // Trailing stop logic
    if (pos.breakevenSet && rMultiple >= this.settings.trailingTriggerR) {
      const trailPrice = pos.type === 'BUY'
        ? currentPrice - this.settings.trailingDistance
        : currentPrice + this.settings.trailingDistance;

      if ((pos.type === 'BUY' && trailPrice > pos.sl) ||
          (pos.type === 'SELL' && trailPrice < pos.sl)) {
        
        const oldSL = pos.sl;
        this.position.sl = trailPrice;
        this.position.trailingActive = true;

        this.think('management', `📈 TRAILING STOP: SL moved from $${oldSL.toFixed(2)} to $${trailPrice.toFixed(2)} (+${rMultiple.toFixed(2)}R)`, {
          oldSL: oldSL.toFixed(2),
          newSL: trailPrice.toFixed(2),
          rMultiple: rMultiple.toFixed(2),
          lockedProfit: ((pos.type === 'BUY' ? trailPrice - pos.entry : pos.entry - trailPrice) * pos.lots * 100).toFixed(2)
        });
      }
    }

    // Position monitoring
    if (Math.random() > 0.85) {
      const status = rMultiple > 0 ? '🟢' : '🔴';
      this.think('monitoring', `${status} Position: ${pos.type} | Entry: $${pos.entry.toFixed(2)} | Current: $${currentPrice.toFixed(2)} | P&L: ${pnlDollars >= 0 ? '+' : ''}$${pnlDollars.toFixed(2)} (${rMultiple >= 0 ? '+' : ''}${rMultiple.toFixed(2)}R)`, {
        pnl: pnlDollars.toFixed(2),
        rMultiple: rMultiple.toFixed(2),
        sl: pos.sl.toFixed(2),
        tp: pos.tp.toFixed(2)
      });
    }

    return analysis;
  }

  closePosition(reason, exitPrice, analysis) {
    const pos = this.position;
    const profit = pos.type === 'BUY' 
      ? exitPrice - pos.entry 
      : pos.entry - exitPrice;
    const pnl = profit * pos.lots * 100;
    const rMultiple = profit / pos.initialRisk;

    const closedTrade = {
      ...pos,
      exitPrice,
      exitTime: new Date(),
      closeReason: reason,
      pnl: Math.round(pnl * 100) / 100,
      rMultiple: Math.round(rMultiple * 100) / 100,
      result: pnl >= 0 ? 'WIN' : 'LOSS',
      duration: this.formatDuration(new Date() - pos.openTime)
    };

    this.tradeHistory.unshift(closedTrade);
    this.position = null;
    this.cooldownTicks = 50; // Cooldown after close

    const emoji = reason === 'TAKE_PROFIT' ? '🎯' : 
                  reason === 'BREAKEVEN_STOP' ? '🔒' : 
                  pnl >= 0 ? '✅' : '❌';
    
    const reasonText = reason === 'TAKE_PROFIT' ? 'Target reached!' :
                       reason === 'BREAKEVEN_STOP' ? 'Stopped at breakeven' :
                       'Stop loss hit';

    this.think('execution', `${emoji} TRADE CLOSED: ${reasonText} | Exit: $${exitPrice.toFixed(2)} | P&L: ${pnl >= 0 ? '+' : ''}$${pnl.toFixed(2)} (${rMultiple >= 0 ? '+' : ''}${rMultiple.toFixed(2)}R)`, {
      reason,
      entry: pos.entry.toFixed(2),
      exit: exitPrice.toFixed(2),
      pnl: pnl.toFixed(2),
      rMultiple: rMultiple.toFixed(2),
      duration: closedTrade.duration,
      result: closedTrade.result
    });

    // Summary thought
    const wins = this.tradeHistory.filter(t => t.result === 'WIN').length;
    const totalTrades = this.tradeHistory.length;
    const totalPnL = this.tradeHistory.reduce((sum, t) => sum + t.pnl, 0);
    
    this.think('summary', `📊 Session: ${totalTrades} trades | Win rate: ${((wins/totalTrades)*100).toFixed(0)}% | Total P&L: ${totalPnL >= 0 ? '+' : ''}$${totalPnL.toFixed(2)}`, {
      totalTrades,
      wins,
      winRate: ((wins/totalTrades)*100).toFixed(0) + '%',
      totalPnL: totalPnL.toFixed(2)
    });

    analysis.closedTrade = closedTrade;
    return analysis;
  }

  formatDuration(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
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
      resistance: this.resistanceLevel,
      trend: this.trendDirection,
      trendStrength: this.trendStrength
    };
  }
}

export default TradingAlgorithm;
