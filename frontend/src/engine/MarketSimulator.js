// Aggressive Market Simulator - GUARANTEED TRADE GENERATION
// Creates perfect setups for the algorithm to take trades consistently
// Goal: 10+ trades in 2 minutes at 10x speed

class MarketSimulator {
  constructor() {
    this.basePrice = 2650;
    this.currentPrice = this.basePrice;
    this.spread = 0.20;
    this.candles = [];
    this.tickCount = 0;
    
    // Trade-forcing system
    this.cycleIndex = 0;
    this.cycleProgress = 0;
    
    // Each cycle is designed to produce exactly ONE trade
    // ULTRA-FAST cycles for impressive demo - 10+ trades in ~45 seconds at 10x speed
    this.tradeCycles = [
      { type: 'BUY', duration: 22 },   
      { type: 'SELL', duration: 22 },  
      { type: 'BUY', duration: 20 },   
      { type: 'SELL', duration: 20 },  
      { type: 'BUY', duration: 21 },   
      { type: 'SELL', duration: 21 },  
      { type: 'BUY', duration: 19 },   
      { type: 'SELL', duration: 19 },  
      { type: 'BUY', duration: 20 },   
      { type: 'SELL', duration: 20 },  
      { type: 'BUY', duration: 22 },   
      { type: 'SELL', duration: 22 },  
    ];
    
    // Fixed S/R levels that the algorithm will detect
    this.supportLevel = 2635;
    this.resistanceLevel = 2665;
    
    // Initialize with setup history
    this.initializeHistory();
  }

  initializeHistory() {
    const now = Date.now();
    
    // Build history with clear swing highs and lows
    // This ensures algorithm detects our S/R levels
    const historyPattern = [
      // Start mid-range
      { price: 2650, count: 10 },
      // Drop to support
      { price: 2638, count: 8 },
      // Bounce up
      { price: 2655, count: 10 },
      // Rally to resistance
      { price: 2663, count: 8 },
      // Pullback
      { price: 2648, count: 10 },
      // Current position - ready for first trade
      { price: 2652, count: 5 },
    ];
    
    let candleIndex = 0;
    historyPattern.forEach(segment => {
      const startPrice = this.candles.length > 0 
        ? this.candles[this.candles.length - 1].close 
        : segment.price;
      
      for (let i = 0; i < segment.count; i++) {
        const progress = (i + 1) / segment.count;
        const targetPrice = startPrice + (segment.price - startPrice) * progress;
        const noise = (Math.random() - 0.5) * 1.5;
        const price = targetPrice + noise;
        
        const volatility = 2;
        const open = price;
        const close = price + (Math.random() - 0.5) * volatility;
        const high = Math.max(open, close) + Math.random() * volatility * 0.5;
        const low = Math.min(open, close) - Math.random() * volatility * 0.5;
        
        this.candles.push({
          timestamp: now - (50 - candleIndex) * 1000,
          open: Math.round(open * 100) / 100,
          high: Math.round(high * 100) / 100,
          low: Math.round(low * 100) / 100,
          close: Math.round(close * 100) / 100,
          volume: Math.floor(1000 + Math.random() * 3000)
        });
        candleIndex++;
      }
    });
    
    this.currentPrice = this.candles[this.candles.length - 1].close;
  }

  getCurrentCycle() {
    return this.tradeCycles[this.cycleIndex % this.tradeCycles.length];
  }

  tick() {
    this.tickCount++;
    const now = Date.now();
    const cycle = this.getCurrentCycle();
    
    // Progress through current cycle
    this.cycleProgress++;
    const progress = this.cycleProgress / cycle.duration;
    
    // Phase within cycle:
    // 0-30%: Move to setup zone (approach S/R)
    // 30-60%: Consolidate at level (trigger RSI extreme)
    // 60-80%: Entry signal (reversal candle)
    // 80-100%: Trade runs to TP or SL, then next cycle
    
    let targetPrice;
    let phase;
    
    if (progress < 0.30) {
      // APPROACH: Move towards the setup level
      phase = 'approach';
      if (cycle.type === 'BUY') {
        // Move down towards support
        const approachProgress = progress / 0.30;
        targetPrice = this.currentPrice - (this.currentPrice - this.supportLevel) * approachProgress * 0.5;
      } else {
        // Move up towards resistance
        const approachProgress = progress / 0.30;
        targetPrice = this.currentPrice + (this.resistanceLevel - this.currentPrice) * approachProgress * 0.5;
      }
    } else if (progress < 0.50) {
      // SETUP: Hold at the level, building the RSI extreme
      phase = 'setup_' + cycle.type.toLowerCase();
      if (cycle.type === 'BUY') {
        // Hover around support with slight downward bias (creates oversold RSI)
        targetPrice = this.supportLevel + (Math.random() - 0.6) * 2;
      } else {
        // Hover around resistance with slight upward bias (creates overbought RSI)
        targetPrice = this.resistanceLevel + (Math.random() - 0.4) * 2;
      }
    } else if (progress < 0.65) {
      // TRIGGER: Create the reversal candle
      phase = 'trigger_' + cycle.type.toLowerCase();
      if (cycle.type === 'BUY') {
        // Start bouncing up from support (bullish candle)
        const bounceProgress = (progress - 0.50) / 0.15;
        targetPrice = this.supportLevel + bounceProgress * 3;
      } else {
        // Start dropping from resistance (bearish candle)
        const dropProgress = (progress - 0.50) / 0.15;
        targetPrice = this.resistanceLevel - dropProgress * 3;
      }
    } else {
      // RUN: Let the trade play out
      phase = 'run_' + cycle.type.toLowerCase();
      const runProgress = (progress - 0.65) / 0.35;
      
      if (cycle.type === 'BUY') {
        // Move up towards take profit (or sometimes hit SL for realism)
        const shouldWin = this.cycleIndex % 3 !== 2; // ~67% win rate
        if (shouldWin) {
          // Move to TP
          const tpTarget = this.supportLevel + 8; // ~8 points profit
          targetPrice = this.supportLevel + 2 + (tpTarget - this.supportLevel - 2) * runProgress;
        } else {
          // Move to SL
          const slTarget = this.supportLevel - 2;
          targetPrice = this.supportLevel + 2 - (4) * runProgress;
        }
      } else {
        // SELL trade running
        const shouldWin = this.cycleIndex % 3 !== 1; // ~67% win rate
        if (shouldWin) {
          // Move to TP
          const tpTarget = this.resistanceLevel - 8;
          targetPrice = this.resistanceLevel - 2 - (this.resistanceLevel - 2 - tpTarget) * runProgress;
        } else {
          // Move to SL
          targetPrice = this.resistanceLevel - 2 + (4) * runProgress;
        }
      }
    }
    
    // Check if cycle complete
    if (this.cycleProgress >= cycle.duration) {
      this.cycleIndex++;
      this.cycleProgress = 0;
      
      // Adjust levels slightly for variety
      const levelShift = (Math.random() - 0.5) * 4;
      this.supportLevel = Math.round((2635 + levelShift) * 100) / 100;
      this.resistanceLevel = Math.round((2665 + levelShift) * 100) / 100;
    }
    
    // Apply movement with some noise
    const noise = (Math.random() - 0.5) * 0.8;
    const movementSpeed = 0.15;
    this.currentPrice = this.currentPrice + (targetPrice - this.currentPrice) * movementSpeed + noise;
    this.currentPrice = Math.round(this.currentPrice * 100) / 100;
    
    // Keep in bounds
    this.currentPrice = Math.max(this.supportLevel - 5, Math.min(this.resistanceLevel + 5, this.currentPrice));
    
    return {
      bid: this.currentPrice,
      ask: Math.round((this.currentPrice + this.spread) * 100) / 100,
      spread: Math.round(this.spread * 100),
      timestamp: now,
      phase: phase
    };
  }

  updateCandle() {
    const lastCandle = this.candles[this.candles.length - 1];
    const now = Date.now();
    const candleAge = now - lastCandle.timestamp;
    
    // Fast candles: new one every 1.2 seconds
    const candleInterval = 1200;
    
    if (candleAge >= candleInterval) {
      const newCandle = {
        timestamp: now,
        open: this.currentPrice,
        high: this.currentPrice,
        low: this.currentPrice,
        close: this.currentPrice,
        volume: 0
      };
      this.candles.push(newCandle);
      
      if (this.candles.length > 100) {
        this.candles.shift();
      }
      
      return { type: 'new', candle: newCandle };
    } else {
      lastCandle.high = Math.max(lastCandle.high, this.currentPrice);
      lastCandle.low = Math.min(lastCandle.low, this.currentPrice);
      lastCandle.close = this.currentPrice;
      lastCandle.volume += Math.floor(Math.random() * 15);
      
      return { type: 'update', candle: lastCandle };
    }
  }

  getCandles(count = 50) {
    return this.candles.slice(-count);
  }

  getBid() {
    return this.currentPrice;
  }

  getAsk() {
    return Math.round((this.currentPrice + this.spread) * 100) / 100;
  }

  getSpread() {
    return Math.round(this.spread * 100);
  }

  getKeyLevels() {
    return {
      support: this.supportLevel,
      resistance: this.resistanceLevel
    };
  }

  getPhase() {
    const cycle = this.getCurrentCycle();
    const progress = this.cycleProgress / cycle.duration;
    return {
      phase: `${cycle.type}_setup`,
      trend: cycle.type === 'BUY' ? -1 : 1,
      ticksRemaining: cycle.duration - this.cycleProgress,
      progress: Math.round(progress * 100)
    };
  }
}

export default MarketSimulator;
