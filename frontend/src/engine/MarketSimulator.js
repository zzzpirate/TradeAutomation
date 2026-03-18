// Enhanced Market Simulator for XAUUSD
// Creates dynamic, realistic market scenarios that trigger trading opportunities

class MarketSimulator {
  constructor() {
    this.basePrice = 2650;
    this.currentPrice = this.basePrice;
    this.spread = 0.30;
    this.candles = [];
    this.tickCount = 0;
    this.lastUpdate = Date.now();
    
    // Market phases for dynamic behavior
    this.phases = ['accumulation', 'markup', 'distribution', 'markdown', 'volatile', 'ranging'];
    this.currentPhase = 'accumulation';
    this.phaseTicksRemaining = 0;
    this.phaseTrend = 0;
    
    // Volatility settings
    this.baseVolatility = 0.0004;
    this.currentVolatility = this.baseVolatility;
    this.volatilitySpike = false;
    
    // Key levels that will be tested
    this.keyLevels = {
      strongSupport: 2620,
      support: 2640,
      pivot: 2660,
      resistance: 2680,
      strongResistance: 2700
    };
    
    // Initialize with proper historical data
    this.initializeHistory();
    this.setNextPhase();
  }

  initializeHistory() {
    // Generate 60 historical candles with a story
    let price = 2640;
    const now = Date.now();
    
    // Phase 1: Downtrend to support (candles 0-15)
    for (let i = 60; i > 45; i--) {
      const timestamp = now - (i * 15 * 60 * 1000);
      const trend = -0.3;
      const candle = this.generateHistoricalCandle(price, timestamp, trend, 0.0006);
      this.candles.push(candle);
      price = candle.close;
    }
    
    // Phase 2: Bounce from support (candles 16-30)
    for (let i = 45; i > 30; i--) {
      const timestamp = now - (i * 15 * 60 * 1000);
      const trend = 0.5;
      const candle = this.generateHistoricalCandle(price, timestamp, trend, 0.0005);
      this.candles.push(candle);
      price = candle.close;
    }
    
    // Phase 3: Test resistance and pullback (candles 31-45)
    for (let i = 30; i > 15; i--) {
      const timestamp = now - (i * 15 * 60 * 1000);
      const trend = i > 22 ? 0.3 : -0.2;
      const candle = this.generateHistoricalCandle(price, timestamp, trend, 0.0004);
      this.candles.push(candle);
      price = candle.close;
    }
    
    // Phase 4: Current consolidation (candles 46-60)
    for (let i = 15; i >= 0; i--) {
      const timestamp = now - (i * 15 * 60 * 1000);
      const trend = Math.sin(i / 3) * 0.2;
      const candle = this.generateHistoricalCandle(price, timestamp, trend, 0.0003);
      this.candles.push(candle);
      price = candle.close;
    }
    
    this.currentPrice = price;
    this.updateKeyLevels();
  }

  generateHistoricalCandle(basePrice, timestamp, trend, volatility) {
    const movement = basePrice * volatility * (trend + (Math.random() - 0.5));
    const open = basePrice;
    const close = basePrice + movement;
    const range = Math.abs(movement) * (1 + Math.random() * 0.5);
    const high = Math.max(open, close) + range * Math.random() * 0.5;
    const low = Math.min(open, close) - range * Math.random() * 0.5;
    
    return {
      timestamp,
      open: Math.round(open * 100) / 100,
      high: Math.round(high * 100) / 100,
      low: Math.round(low * 100) / 100,
      close: Math.round(close * 100) / 100,
      volume: Math.floor(1000 + Math.random() * 5000)
    };
  }

  updateKeyLevels() {
    // Dynamically update key levels based on recent price action
    const recentCandles = this.candles.slice(-30);
    const highs = recentCandles.map(c => c.high);
    const lows = recentCandles.map(c => c.low);
    
    const recentHigh = Math.max(...highs);
    const recentLow = Math.min(...lows);
    const range = recentHigh - recentLow;
    
    this.keyLevels = {
      strongSupport: Math.round((recentLow - range * 0.1) * 100) / 100,
      support: Math.round((recentLow + range * 0.1) * 100) / 100,
      pivot: Math.round((recentLow + range * 0.5) * 100) / 100,
      resistance: Math.round((recentHigh - range * 0.1) * 100) / 100,
      strongResistance: Math.round((recentHigh + range * 0.1) * 100) / 100
    };
  }

  setNextPhase() {
    // Select phase based on current price position
    const distToSupport = this.currentPrice - this.keyLevels.support;
    const distToResistance = this.keyLevels.resistance - this.currentPrice;
    
    if (distToSupport < 5) {
      // Near support - likely to bounce
      this.currentPhase = Math.random() > 0.3 ? 'markup' : 'markdown';
      this.phaseTrend = this.currentPhase === 'markup' ? 1 : -1;
    } else if (distToResistance < 5) {
      // Near resistance - likely to reverse
      this.currentPhase = Math.random() > 0.3 ? 'markdown' : 'markup';
      this.phaseTrend = this.currentPhase === 'markdown' ? -1 : 1;
    } else if (Math.random() > 0.8) {
      // Random volatile phase
      this.currentPhase = 'volatile';
      this.phaseTrend = Math.random() > 0.5 ? 1 : -1;
      this.currentVolatility = this.baseVolatility * 3;
    } else {
      // Trending or ranging
      const phases = ['markup', 'markdown', 'ranging'];
      this.currentPhase = phases[Math.floor(Math.random() * phases.length)];
      this.phaseTrend = this.currentPhase === 'markup' ? 0.8 : 
                        this.currentPhase === 'markdown' ? -0.8 : 0;
    }
    
    // Phase duration: 50-200 ticks
    this.phaseTicksRemaining = 50 + Math.floor(Math.random() * 150);
    
    // Reset volatility if not in volatile phase
    if (this.currentPhase !== 'volatile') {
      this.currentVolatility = this.baseVolatility;
    }
  }

  tick() {
    this.tickCount++;
    const now = Date.now();
    
    // Check for phase transition
    this.phaseTicksRemaining--;
    if (this.phaseTicksRemaining <= 0) {
      this.setNextPhase();
    }
    
    // Calculate price movement based on phase
    let trendComponent = this.phaseTrend * this.currentPrice * 0.00015;
    let randomComponent = (Math.random() - 0.5) * this.currentPrice * this.currentVolatility;
    
    // Add momentum towards key levels when close
    const distToSupport = this.currentPrice - this.keyLevels.support;
    const distToResistance = this.keyLevels.resistance - this.currentPrice;
    
    if (distToSupport < 3 && this.phaseTrend < 0) {
      // Approaching support in downtrend - slow down and prepare bounce
      trendComponent *= 0.3;
      if (distToSupport < 1) {
        this.phaseTrend = 0.8; // Start bounce
        this.currentPhase = 'markup';
        this.phaseTicksRemaining = 100;
      }
    }
    
    if (distToResistance < 3 && this.phaseTrend > 0) {
      // Approaching resistance in uptrend - slow down
      trendComponent *= 0.3;
      if (distToResistance < 1) {
        this.phaseTrend = -0.8; // Start pullback
        this.currentPhase = 'markdown';
        this.phaseTicksRemaining = 100;
      }
    }
    
    // Apply movement
    this.currentPrice += trendComponent + randomComponent;
    
    // Ensure price stays in reasonable range
    this.currentPrice = Math.max(this.keyLevels.strongSupport - 10, 
                        Math.min(this.keyLevels.strongResistance + 10, this.currentPrice));
    this.currentPrice = Math.round(this.currentPrice * 100) / 100;
    
    // Occasionally spike volatility
    if (Math.random() > 0.995) {
      this.volatilitySpike = true;
      this.currentVolatility = this.baseVolatility * 4;
      setTimeout(() => {
        this.volatilitySpike = false;
        this.currentVolatility = this.baseVolatility;
      }, 5000);
    }
    
    // Update key levels periodically
    if (this.tickCount % 100 === 0) {
      this.updateKeyLevels();
    }
    
    return {
      bid: this.currentPrice,
      ask: Math.round((this.currentPrice + this.spread) * 100) / 100,
      spread: Math.round(this.spread * 100),
      timestamp: now,
      phase: this.currentPhase,
      volatilitySpike: this.volatilitySpike
    };
  }

  updateCandle() {
    const lastCandle = this.candles[this.candles.length - 1];
    const now = Date.now();
    const candleAge = now - lastCandle.timestamp;
    
    // New candle every 3 seconds in simulation (represents 15 min)
    const candleInterval = 3000;
    
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
      lastCandle.volume += Math.floor(Math.random() * 10);
      
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
    return this.keyLevels;
  }

  getPhase() {
    return {
      phase: this.currentPhase,
      trend: this.phaseTrend,
      ticksRemaining: this.phaseTicksRemaining
    };
  }
}

export default MarketSimulator;
