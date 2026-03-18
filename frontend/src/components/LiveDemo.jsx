import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ComposedChart, Area, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, ReferenceLine, Bar
} from 'recharts';
import {
  Play, Pause, X, Brain, TrendingUp, TrendingDown,
  Target, Activity, Shield, Clock, ChevronRight,
  AlertTriangle, CheckCircle, Zap, BarChart3
} from 'lucide-react';
import MarketSimulator from '../engine/MarketSimulator';
import TradingAlgorithm from '../engine/TradingAlgorithm';

const ThoughtBubble = ({ thought }) => {
  const categoryIcons = {
    system: Clock,
    analysis: Brain,
    trend: TrendingUp,
    structure: Target,
    rsi: Activity,
    signal: Zap,
    decision: CheckCircle,
    waiting: Clock,
    filter: AlertTriangle,
    execution: TrendingUp,
    management: Shield,
    monitoring: BarChart3
  };

  const categoryColors = {
    system: 'border-slate-500 bg-slate-500/10',
    analysis: 'border-blue-500 bg-blue-500/10',
    trend: 'border-purple-500 bg-purple-500/10',
    structure: 'border-cyan-500 bg-cyan-500/10',
    rsi: 'border-orange-500 bg-orange-500/10',
    signal: 'border-yellow-500 bg-yellow-500/10',
    decision: 'border-emerald-500 bg-emerald-500/10',
    waiting: 'border-slate-400 bg-slate-400/10',
    filter: 'border-red-500 bg-red-500/10',
    execution: 'border-[#D4AF37] bg-[#D4AF37]/10',
    management: 'border-blue-400 bg-blue-400/10',
    monitoring: 'border-slate-400 bg-slate-400/10'
  };

  const Icon = categoryIcons[thought.category] || Brain;
  const colorClass = categoryColors[thought.category] || categoryColors.analysis;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: -20, scale: 0.95 }}
      className={`p-3 rounded-lg border ${colorClass} mb-2`}
    >
      <div className="flex items-start gap-2">
        <Icon size={16} className="mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm leading-relaxed">{thought.message}</p>
          {Object.keys(thought.data).length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {Object.entries(thought.data).map(([key, value]) => (
                <span key={key} className="text-xs px-2 py-0.5 rounded bg-white/5 font-mono">
                  {key}: {typeof value === 'number' ? value.toFixed?.(2) || value : String(value)}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="text-xs text-slate-500 mt-2">
        {thought.timestamp.toLocaleTimeString()}
      </div>
    </motion.div>
  );
};

const IndicatorCard = ({ label, value, status, icon: Icon }) => {
  const statusColors = {
    bullish: 'text-emerald-400',
    bearish: 'text-red-400',
    neutral: 'text-slate-400',
    overbought: 'text-red-400',
    oversold: 'text-emerald-400',
    ok: 'text-emerald-400',
    warning: 'text-orange-400'
  };

  return (
    <div className="p-3 rounded-lg bg-white/5 border border-white/5">
      <div className="flex items-center gap-2 mb-1">
        <Icon size={14} className="text-slate-400" />
        <span className="text-xs text-slate-500 uppercase">{label}</span>
      </div>
      <div className={`font-mono text-lg font-semibold ${statusColors[status] || 'text-white'}`}>
        {value}
      </div>
    </div>
  );
};

const LiveDemo = ({ onClose }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [candles, setCandles] = useState([]);
  const [currentTick, setCurrentTick] = useState({ bid: 0, ask: 0, spread: 0 });
  const [thoughts, setThoughts] = useState([]);
  const [position, setPosition] = useState(null);
  const [tradeHistory, setTradeHistory] = useState([]);
  const [indicators, setIndicators] = useState({});
  const [balance, setBalance] = useState(10000);
  const [stats, setStats] = useState({ trades: 0, wins: 0, pnl: 0 });

  const marketRef = useRef(null);
  const algoRef = useRef(null);
  const intervalRef = useRef(null);

  // Initialize
  useEffect(() => {
    marketRef.current = new MarketSimulator();
    algoRef.current = new TradingAlgorithm();
    
    const initialCandles = marketRef.current.getCandles(50);
    setCandles(initialCandles);
    setCurrentTick({
      bid: marketRef.current.getBid(),
      ask: marketRef.current.getAsk(),
      spread: marketRef.current.getSpread()
    });

    // Add initial thought
    algoRef.current.think('system', '🚀 Aurum Quant Algorithm initialized. Ready to analyze XAUUSD market.', {
      settings: 'Conservative mode',
      risk: '0.75%/trade'
    });
    setThoughts(algoRef.current.getThoughts());

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Main simulation loop
  const tick = useCallback(() => {
    if (!marketRef.current || !algoRef.current) return;

    // Update market
    const newTick = marketRef.current.tick();
    marketRef.current.updateCandle();
    const newCandles = marketRef.current.getCandles(50);

    setCurrentTick(newTick);
    setCandles(newCandles);

    // Run algorithm analysis
    const analysis = algoRef.current.analyze(newCandles, newTick);
    
    // Execute signal if present
    if (analysis.signal && !algoRef.current.getPosition()) {
      algoRef.current.executeTrade(analysis.signal, balance);
    }

    // Update state
    setThoughts([...algoRef.current.getThoughts()]);
    setPosition(algoRef.current.getPosition());
    setIndicators(algoRef.current.getIndicators());

    // Update trade history and stats
    const history = algoRef.current.getTradeHistory();
    if (history.length !== tradeHistory.length) {
      setTradeHistory(history);
      const lastTrade = history[0];
      if (lastTrade) {
        setBalance(b => b + lastTrade.pnl);
        setStats(s => ({
          trades: s.trades + 1,
          wins: s.wins + (lastTrade.result === 'WIN' ? 1 : 0),
          pnl: s.pnl + lastTrade.pnl
        }));
      }
    }
  }, [balance, tradeHistory.length]);

  // Control simulation
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(tick, 100 / speed);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, speed, tick]);

  const chartData = candles.map((c, i) => ({
    time: new Date(c.timestamp).toLocaleTimeString(),
    open: c.open,
    high: c.high,
    low: c.low,
    close: c.close,
    price: c.close
  }));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl overflow-hidden"
    >
      {/* Header */}
      <div className="h-16 border-b border-white/10 flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#D4AF37] to-[#B5952F] flex items-center justify-center">
              <span className="text-black font-bold text-sm">A</span>
            </div>
            <span className="font-display font-bold text-lg">Aurum Quant</span>
          </div>
          <div className="w-px h-6 bg-white/10" />
          <span className="text-sm text-slate-400">Live Algorithm Demo</span>
          <span className={`px-2 py-1 rounded text-xs font-medium ${isRunning ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-500/20 text-slate-400'}`}>
            {isRunning ? 'RUNNING' : 'PAUSED'}
          </span>
        </div>

        <div className="flex items-center gap-4">
          {/* Speed Control */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Speed:</span>
            {[1, 2, 5, 10].map(s => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                  speed === s ? 'bg-[#D4AF37] text-black' : 'bg-white/5 text-slate-400 hover:bg-white/10'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>

          {/* Play/Pause */}
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`p-3 rounded-full transition-colors ${
              isRunning ? 'bg-orange-500 text-white' : 'bg-emerald-500 text-white'
            }`}
          >
            {isRunning ? <Pause size={20} /> : <Play size={20} />}
          </button>

          {/* Close */}
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-64px)]">
        {/* Left Panel - Chart & Stats */}
        <div className="flex-1 p-6 overflow-auto">
          {/* Price Display */}
          <div className="flex items-center gap-8 mb-6">
            <div>
              <div className="text-sm text-slate-500">XAUUSD</div>
              <div className="text-4xl font-mono font-bold">{currentTick.bid.toFixed(2)}</div>
            </div>
            <div className="flex gap-4">
              <div className="text-center">
                <div className="text-xs text-slate-500">Bid</div>
                <div className="font-mono text-emerald-400">{currentTick.bid.toFixed(2)}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-slate-500">Ask</div>
                <div className="font-mono text-red-400">{currentTick.ask.toFixed(2)}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-slate-500">Spread</div>
                <div className="font-mono text-slate-300">{currentTick.spread} pts</div>
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="glass-card p-4 mb-6">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData}>
                  <defs>
                    <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#D4AF37" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#D4AF37" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="time" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 10 }}
                    interval="preserveEnd"
                  />
                  <YAxis 
                    domain={['auto', 'auto']}
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 10 }}
                    orientation="right"
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(0,0,0,0.8)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px'
                    }}
                  />
                  {indicators.support > 0 && (
                    <ReferenceLine 
                      y={indicators.support} 
                      stroke="#10B981" 
                      strokeDasharray="5 5" 
                      label={{ value: `S: ${indicators.support?.toFixed(2)}`, fill: '#10B981', fontSize: 10 }}
                    />
                  )}
                  {indicators.resistance > 0 && (
                    <ReferenceLine 
                      y={indicators.resistance} 
                      stroke="#EF4444" 
                      strokeDasharray="5 5"
                      label={{ value: `R: ${indicators.resistance?.toFixed(2)}`, fill: '#EF4444', fontSize: 10 }}
                    />
                  )}
                  {position && (
                    <ReferenceLine 
                      y={position.entry} 
                      stroke="#D4AF37" 
                      strokeWidth={2}
                      label={{ value: `Entry: ${position.entry.toFixed(2)}`, fill: '#D4AF37', fontSize: 10 }}
                    />
                  )}
                  <Area
                    type="monotone"
                    dataKey="price"
                    stroke="#D4AF37"
                    strokeWidth={2}
                    fill="url(#priceGradient)"
                    dot={false}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Indicators Grid */}
          <div className="grid grid-cols-5 gap-3 mb-6">
            <IndicatorCard
              label="RSI (14)"
              value={indicators.rsi?.toFixed(1) || '—'}
              status={indicators.rsi < 30 ? 'oversold' : indicators.rsi > 70 ? 'overbought' : 'neutral'}
              icon={Activity}
            />
            <IndicatorCard
              label="EMA 200"
              value={indicators.ema200?.toFixed(2) || '—'}
              status={currentTick.bid > (indicators.ema200 || 0) ? 'bullish' : 'bearish'}
              icon={TrendingUp}
            />
            <IndicatorCard
              label="Support"
              value={indicators.support?.toFixed(2) || '—'}
              status="ok"
              icon={Target}
            />
            <IndicatorCard
              label="Resistance"
              value={indicators.resistance?.toFixed(2) || '—'}
              status="warning"
              icon={Target}
            />
            <IndicatorCard
              label="Spread"
              value={`${currentTick.spread} pts`}
              status={currentTick.spread < 50 ? 'ok' : 'warning'}
              icon={BarChart3}
            />
          </div>

          {/* Position & Stats */}
          <div className="grid grid-cols-2 gap-4">
            {/* Current Position */}
            <div className="glass-card p-4">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Shield size={16} className="text-[#D4AF37]" />
                Current Position
              </h3>
              {position ? (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Type</span>
                    <span className={position.type === 'BUY' ? 'text-emerald-400' : 'text-red-400'}>
                      {position.type}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Entry</span>
                    <span className="font-mono">{position.entry.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">SL</span>
                    <span className="font-mono text-red-400">{position.sl.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">TP</span>
                    <span className="font-mono text-emerald-400">{position.tp.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Lots</span>
                    <span className="font-mono">{position.lots}</span>
                  </div>
                  {position.breakevenSet && (
                    <span className="inline-block px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 text-xs">
                      Break-even Active
                    </span>
                  )}
                </div>
              ) : (
                <div className="text-slate-500 text-sm">No open position</div>
              )}
            </div>

            {/* Account Stats */}
            <div className="glass-card p-4">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <BarChart3 size={16} className="text-[#D4AF37]" />
                Session Stats
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Balance</span>
                  <span className="font-mono text-[#D4AF37]">${balance.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Trades</span>
                  <span className="font-mono">{stats.trades}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Win Rate</span>
                  <span className="font-mono">
                    {stats.trades > 0 ? ((stats.wins / stats.trades) * 100).toFixed(0) : 0}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Session P&L</span>
                  <span className={`font-mono ${stats.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {stats.pnl >= 0 ? '+' : ''}${stats.pnl.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Algorithm Thinking */}
        <div className="w-[450px] border-l border-white/10 flex flex-col bg-black/50">
          <div className="p-4 border-b border-white/10">
            <h2 className="font-semibold flex items-center gap-2">
              <Brain className="text-[#D4AF37]" size={20} />
              Algorithm Thinking
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Real-time decision process and analysis
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <AnimatePresence mode="popLayout">
              {thoughts.slice(0, 50).map((thought) => (
                <ThoughtBubble key={thought.id} thought={thought} />
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default LiveDemo;
