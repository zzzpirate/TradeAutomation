// Simulated Market Engine for XAUUSD
// Generates realistic price movements and manages the trading simulation

class MarketSimulator {
  constructor() {
    this.currentPrice = 2658.50;
    this.spread = 0.35;
    this.candles = [];
    this.tickHistory = [];
    this.volatility = 0.0008; // Base volatility
    this.trend = 0; // -1 bearish, 0 neutral, 1 bullish
    this.trendStrength = 0;
    this.lastUpdate = Date.now();
    
    // Initialize with historical candles
    this.initializeHistory();
  }

  initializeHistory() {
    // Generate 100 historical M15 candles
    let price = 2640 + Math.random() * 40;
    const now = Date.now();
    
    for (let i = 100; i >= 0; i--) {
      const timestamp = now - (i * 15 * 60 * 1000); // 15 min intervals
      const candle = this.generateCandle(price, timestamp);
      this.candles.push(candle);
      price = candle.close;
    }
    
    this.currentPrice = price;
  }

  generateCandle(basePrice, timestamp) {
    const volatilityFactor = 0.002 + Math.random() * 0.003;
    const direction = Math.random() > 0.5 ? 1 : -1;
    const movement = basePrice * volatilityFactor * direction;
    
    const open = basePrice;
    const close = basePrice + movement;
    const high = Math.max(open, close) + Math.abs(movement) * Math.random() * 0.5;
    const low = Math.min(open, close) - Math.abs(movement) * Math.random() * 0.5;
    
    return {
      timestamp,
      open: Math.round(open * 100) / 100,
      high: Math.round(high * 100) / 100,
      low: Math.round(low * 100) / 100,
      close: Math.round(close * 100) / 100,
      volume: Math.floor(1000 + Math.random() * 5000)
    };
  }

  tick() {
    // Generate realistic price movement
    const now = Date.now();
    const elapsed = now - this.lastUpdate;
    this.lastUpdate = now;

    // Random walk with mean reversion and trend
    const randomComponent = (Math.random() - 0.5) * 2 * this.volatility * this.currentPrice;
    const trendComponent = this.trend * this.trendStrength * this.currentPrice * 0.0001;
    const meanReversion = (2658 - this.currentPrice) * 0.00001;

    this.currentPrice += randomComponent + trendComponent + meanReversion;
    this.currentPrice = Math.max(2600, Math.min(2720, this.currentPrice));
    this.currentPrice = Math.round(this.currentPrice * 100) / 100;

    // Update trend periodically
    if (Math.random() > 0.995) {
      this.trend = Math.floor(Math.random() * 3) - 1;
      this.trendStrength = Math.random() * 0.5;
    }

    // Occasionally spike volatility
    if (Math.random() > 0.99) {
      this.volatility = 0.001 + Math.random() * 0.002;
    } else {
      this.volatility = 0.0006 + Math.random() * 0.0004;
    }

    this.tickHistory.push({
      timestamp: now,
      bid: this.currentPrice,
      ask: this.currentPrice + this.spread
    });

    // Keep only last 1000 ticks
    if (this.tickHistory.length > 1000) {
      this.tickHistory.shift();
    }

    return {
      bid: this.currentPrice,
      ask: this.currentPrice + this.spread,
      spread: this.spread,
      timestamp: now
    };
  }

  updateCandle() {
    const lastCandle = this.candles[this.candles.length - 1];
    const now = Date.now();
    const candleAge = now - lastCandle.timestamp;

    if (candleAge >= 15 * 60 * 1000) {
      // Create new candle
      const newCandle = {
        timestamp: now,
        open: this.currentPrice,
        high: this.currentPrice,
        low: this.currentPrice,
        close: this.currentPrice,
        volume: 0
      };
      this.candles.push(newCandle);
      
      // Keep only last 100 candles
      if (this.candles.length > 100) {
        this.candles.shift();
      }
      
      return { type: 'new', candle: newCandle };
    } else {
      // Update current candle
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
    return this.currentPrice + this.spread;
  }

  getSpread() {
    return Math.round(this.spread * 100); // In points
  }
}

export default MarketSimulator;
