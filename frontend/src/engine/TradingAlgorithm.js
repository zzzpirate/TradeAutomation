// Optimized Trading Algorithm - AGGRESSIVE SIGNAL DETECTION
// Designed to work with MarketSimulator to generate consistent trades
// Lower thresholds, faster signals, more trades for demo purposes

class TradingAlgorithm {
  constructor() {
    this.settings = {
      rsiPeriod: 10,           // Faster RSI for quicker signals
      rsiOverbought: 58,       // Much lower threshold
      rsiOversold: 42,         // Much higher threshold (easier to trigger)
      srLookback: 25,
      zoneTolerance: 4.0,      // Much wider zone for easier detection
      emaFastPeriod: 10,
      emaPeriod: 20,
      riskPercent: 1.0,
      maxTradesPerDay: 50,     // No practical limit in demo
      maxSpread: 100,          // Very lenient spread filter
      rrRatio: 1.5,            // Lower R:R for faster TP
      slBuffer: 2.0,
      breakevenTriggerR: 0.6,  // Earlier breakeven
      trailingTriggerR: 1.0,   // Earlier trailing
      trailingDistance: 1.5,
      partialTPRatio: 0.5,
      partialTPTriggerR: 0.7
    };

    this.position = null;
    this.dailyTrades = 0;
    this.thoughtLog = [];
    this.tradeHistory = [];
    this.supportLevel = 0;
    this.resistanceLevel = 0;
    this.currentRSI = 50;
    this.prevRSI = 50;
    this.ema200 = 0;
    this.ema50 = 0;
    this.lastCandleTime = 0;
    this.cooldownTicks = 0;
    this.partialTPTaken = false;
    
    this.trendDirection = 'neutral';
    this.trendStrength = 0;
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
    if (candles.length < 15) return;

    const lookback = candles.slice(-30);
    const highs = lookback.map(c => c.high);
    const lows = lookback.map(c => c.low);
    
    // Find recent swing high/low
    const recentHigh = Math.max(...highs.slice(-15));
    const recentLow = Math.min(...lows.slice(-15));
    
    // Set S/R with buffer
    this.supportLevel = Math.round((recentLow - 0.5) * 100) / 100;
    this.resistanceLevel = Math.round((recentHigh + 0.5) * 100) / 100;

    return {
      support: this.supportLevel,
      resistance: this.resistanceLevel
    };
  }

  analyzeTrend(candles, currentPrice) {
    const ema10 = this.calculateEMA(candles, 10);
    const ema20 = this.calculateEMA(candles, 20);
    
    if (currentPrice > ema10 && ema10 > ema20) {
      this.trendDirection = 'bullish';
      this.trendStrength = Math.min(100, ((currentPrice - ema20) / ema20) * 1500);
    } else if (currentPrice < ema10 && ema10 < ema20) {
      this.trendDirection = 'bearish';
      this.trendStrength = Math.min(100, ((ema20 - currentPrice) / ema20) * 1500);
    } else {
      this.trendDirection = 'neutral';
      this.trendStrength = 20;
    }

    return {
      direction: this.trendDirection,
      strength: Math.round(this.trendStrength),
      ema10,
      ema20
    };
  }

  isNearSupport(price) {
    const distance = price - this.supportLevel;
    return distance >= -this.settings.zoneTolerance && distance <= this.settings.zoneTolerance * 2;
  }

  isNearResistance(price) {
    const distance = this.resistanceLevel - price;
    return distance >= -this.settings.zoneTolerance && distance <= this.settings.zoneTolerance * 2;
  }

  getCandlePattern(candle, prevCandle) {
    if (!candle || !prevCandle) return { type: 'neutral', strength: 60 };
    
    const body = candle.close - candle.open;
    const absBody = Math.abs(body);
    const prevBody = prevCandle.close - prevCandle.open;
    
    // More lenient pattern detection
    if (body > 0.3) {
      if (prevBody < -0.2) {
        return { type: 'bullish_engulfing', strength: 85 };
      }
      if (absBody > 0.5) {
        return { type: 'strong_bullish', strength: 75 };
      }
      return { type: 'bullish', strength: 65 };
    }
    
    if (body < -0.3) {
      if (prevBody > 0.2) {
        return { type: 'bearish_engulfing', strength: 85 };
      }
      if (absBody > 0.5) {
        return { type: 'strong_bearish', strength: 75 };
      }
      return { type: 'bearish', strength: 65 };
    }
    
    return { type: 'doji', strength: 50 };
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
    
    // Faster cooldown
    if (this.cooldownTicks > 0) {
      this.cooldownTicks--;
    }

    if (isNewCandle) {
      this.lastCandleTime = currentCandle.timestamp;
      this.prevRSI = this.currentRSI;
    }

    // Calculate indicators
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

    // Check cooldown
    if (this.cooldownTicks > 0) {
      return analysis;
    }

    // Main analysis logging (less spam)
    if (this.tickCount % 5 === 0 || isNewCandle) {
      this.think('analysis', `Scanning... Price: $${bid.toFixed(2)} | RSI: ${this.currentRSI.toFixed(1)}`, {
        price: bid.toFixed(2),
        rsi: this.currentRSI.toFixed(1)
      });
    }

    // S/R proximity
    const distToSupport = bid - this.supportLevel;
    const distToResistance = this.resistanceLevel - bid;
    
    if (isNewCandle) {
      this.think('structure', `S/R: Support $${this.supportLevel.toFixed(2)} (${distToSupport.toFixed(2)} away) | Resistance $${this.resistanceLevel.toFixed(2)} (${distToResistance.toFixed(2)} away)`, {
        support: this.supportLevel.toFixed(2),
        resistance: this.resistanceLevel.toFixed(2)
      });
    }

    // BUY Signal Logic - More aggressive
    const nearSupport = this.isNearSupport(bid);
    const rsiLow = this.currentRSI < this.settings.rsiOversold;
    const priceDropping = prevCandle && prevCandle.close > currentCandle.open;
    
    if (nearSupport) {
      this.think('signal', `BUY ZONE! Price near support $${this.supportLevel.toFixed(2)}`, {
        distance: distToSupport.toFixed(2),
        rsi: this.currentRSI.toFixed(1)
      });

      // Simplified conditions: near support + any bullish sign
      const bullishCandle = candlePattern.type.includes('bullish') || currentCandle.close > currentCandle.open;
      const rsiTurning = this.currentRSI > this.prevRSI || rsiLow;
      
      if ((rsiTurning || rsiLow) && bullishCandle) {
        this.think('confirmation', `BUY CONFIRMED: ${candlePattern.type} + RSI ${this.currentRSI.toFixed(1)}`, {
          pattern: candlePattern.type,
          rsi: this.currentRSI.toFixed(1)
        });

        const slPrice = this.supportLevel - this.settings.slBuffer;
        const slDistance = ask - slPrice;
        const tpPrice = ask + (slDistance * this.settings.rrRatio);

        this.think('decision', `EXECUTING BUY @ $${ask.toFixed(2)} | SL: $${slPrice.toFixed(2)} | TP: $${tpPrice.toFixed(2)}`, {
          entry: ask.toFixed(2),
          sl: slPrice.toFixed(2),
          tp: tpPrice.toFixed(2)
        });

        analysis.signal = {
          type: 'BUY',
          reason: `Support bounce at $${this.supportLevel.toFixed(2)} with RSI ${this.currentRSI.toFixed(1)}`,
          entry: ask,
          sl: slPrice,
          tp: tpPrice
        };
      }
    }

    // SELL Signal Logic - More aggressive
    const nearResistance = this.isNearResistance(bid);
    const rsiHigh = this.currentRSI > this.settings.rsiOverbought;
    
    if (nearResistance && !analysis.signal) {
      this.think('signal', `SELL ZONE! Price near resistance $${this.resistanceLevel.toFixed(2)}`, {
        distance: distToResistance.toFixed(2),
        rsi: this.currentRSI.toFixed(1)
      });

      const bearishCandle = candlePattern.type.includes('bearish') || currentCandle.close < currentCandle.open;
      const rsiTurning = this.currentRSI < this.prevRSI || rsiHigh;
      
      if ((rsiTurning || rsiHigh) && bearishCandle) {
        this.think('confirmation', `SELL CONFIRMED: ${candlePattern.type} + RSI ${this.currentRSI.toFixed(1)}`, {
          pattern: candlePattern.type,
          rsi: this.currentRSI.toFixed(1)
        });

        const slPrice = this.resistanceLevel + this.settings.slBuffer;
        const slDistance = slPrice - bid;
        const tpPrice = bid - (slDistance * this.settings.rrRatio);

        this.think('decision', `EXECUTING SELL @ $${bid.toFixed(2)} | SL: $${slPrice.toFixed(2)} | TP: $${tpPrice.toFixed(2)}`, {
          entry: bid.toFixed(2),
          sl: slPrice.toFixed(2),
          tp: tpPrice.toFixed(2)
        });

        analysis.signal = {
          type: 'SELL',
          reason: `Resistance rejection at $${this.resistanceLevel.toFixed(2)} with RSI ${this.currentRSI.toFixed(1)}`,
          entry: bid,
          sl: slPrice,
          tp: tpPrice
        };
      }
    }

    analysis.conditions = {
      nearSupport,
      nearResistance,
      rsiOversold: rsiLow,
      rsiOverbought: rsiHigh,
      pattern: candlePattern.type
    };

    return analysis;
  }

  executeTrade(signal, balance = 10000) {
    const slDistance = Math.abs(signal.entry - signal.sl);
    const riskAmount = balance * (this.settings.riskPercent / 100);
    const pipValue = 1;
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
    this.cooldownTicks = 8; // Very short cooldown for fast demo

    this.think('execution', `TRADE OPENED: ${signal.type} ${this.position.lots} lots @ $${signal.entry.toFixed(2)}`, {
      id: this.position.id,
      type: signal.type,
      entry: signal.entry.toFixed(2),
      sl: signal.sl.toFixed(2),
      tp: signal.tp.toFixed(2),
      lots: this.position.lots
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

    // Stop Loss check
    if ((pos.type === 'BUY' && currentPrice <= pos.sl) ||
        (pos.type === 'SELL' && currentPrice >= pos.sl)) {
      const reason = pos.breakevenSet ? 'BREAKEVEN_STOP' : 'STOP_LOSS';
      return this.closePosition(reason, currentPrice, analysis);
    }

    // Take Profit check
    if ((pos.type === 'BUY' && currentPrice >= pos.tp) ||
        (pos.type === 'SELL' && currentPrice <= pos.tp)) {
      return this.closePosition('TAKE_PROFIT', currentPrice, analysis);
    }

    // Break-even
    if (!pos.breakevenSet && rMultiple >= this.settings.breakevenTriggerR) {
      const newSL = pos.type === 'BUY' ? pos.entry + 0.15 : pos.entry - 0.15;
      this.position.sl = newSL;
      this.position.breakevenSet = true;
      
      this.think('management', `BREAKEVEN SET: SL moved to $${newSL.toFixed(2)}`, {
        newSL: newSL.toFixed(2),
        rMultiple: rMultiple.toFixed(2)
      });
    }

    // Trailing stop
    if (pos.breakevenSet && rMultiple >= this.settings.trailingTriggerR) {
      const trailPrice = pos.type === 'BUY'
        ? currentPrice - this.settings.trailingDistance
        : currentPrice + this.settings.trailingDistance;

      if ((pos.type === 'BUY' && trailPrice > pos.sl) ||
          (pos.type === 'SELL' && trailPrice < pos.sl)) {
        this.position.sl = trailPrice;
        this.position.trailingActive = true;
        
        this.think('management', `TRAILING SL: Moved to $${trailPrice.toFixed(2)}`, {
          newSL: trailPrice.toFixed(2),
          rMultiple: rMultiple.toFixed(2)
        });
      }
    }

    // Periodic monitoring
    if (Math.random() > 0.9) {
      const emoji = rMultiple >= 0 ? '+' : '';
      this.think('monitoring', `Position: ${pos.type} | P&L: ${emoji}$${pnlDollars.toFixed(2)} (${emoji}${rMultiple.toFixed(2)}R)`, {
        pnl: pnlDollars.toFixed(2),
        rMultiple: rMultiple.toFixed(2)
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
    this.cooldownTicks = 10; // Very short cooldown for fast demo

    const emoji = reason === 'TAKE_PROFIT' ? 'TARGET HIT!' : 
                  reason === 'BREAKEVEN_STOP' ? 'BREAKEVEN' : 
                  'STOPPED OUT';
    
    this.think('execution', `TRADE CLOSED: ${emoji} | P&L: ${pnl >= 0 ? '+' : ''}$${pnl.toFixed(2)} (${rMultiple >= 0 ? '+' : ''}${rMultiple.toFixed(2)}R)`, {
      reason,
      entry: pos.entry.toFixed(2),
      exit: exitPrice.toFixed(2),
      pnl: pnl.toFixed(2),
      result: closedTrade.result
    });

    // Session summary
    const wins = this.tradeHistory.filter(t => t.result === 'WIN').length;
    const totalTrades = this.tradeHistory.length;
    const totalPnL = this.tradeHistory.reduce((sum, t) => sum + t.pnl, 0);
    
    this.think('summary', `Session: ${totalTrades} trades | Win rate: ${((wins/totalTrades)*100).toFixed(0)}% | Total: ${totalPnL >= 0 ? '+' : ''}$${totalPnL.toFixed(2)}`, {
      totalTrades,
      winRate: ((wins/totalTrades)*100).toFixed(0) + '%',
      totalPnL: totalPnL.toFixed(2)
    });

    analysis.closedTrade = closedTrade;
    return analysis;
  }

  formatDuration(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
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
