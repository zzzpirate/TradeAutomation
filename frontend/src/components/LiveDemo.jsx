import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ComposedChart, Area, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, ReferenceLine
} from 'recharts';
import {
  Play, Pause, X, Brain, TrendingUp, TrendingDown,
  Target, Activity, Shield, Clock, AlertTriangle, 
  CheckCircle, Zap, BarChart3, DollarSign, Percent
} from 'lucide-react';
import MarketSimulator from '../engine/MarketSimulator';
import TradingAlgorithm from '../engine/TradingAlgorithm';

const ThoughtBubble = ({ thought }) => {
  const categoryConfig = {
    system: { icon: Clock, color: 'border-slate-500 bg-slate-500/10', textColor: 'text-slate-400' },
    analysis: { icon: Brain, color: 'border-blue-500 bg-blue-500/10', textColor: 'text-blue-400' },
    trend: { icon: TrendingUp, color: 'border-purple-500 bg-purple-500/10', textColor: 'text-purple-400' },
    structure: { icon: Target, color: 'border-cyan-500 bg-cyan-500/10', textColor: 'text-cyan-400' },
    rsi: { icon: Activity, color: 'border-orange-500 bg-orange-500/10', textColor: 'text-orange-400' },
    signal: { icon: Zap, color: 'border-yellow-500 bg-yellow-500/10', textColor: 'text-yellow-400' },
    confirmation: { icon: CheckCircle, color: 'border-emerald-500 bg-emerald-500/10', textColor: 'text-emerald-400' },
    decision: { icon: Zap, color: 'border-[#D4AF37] bg-[#D4AF37]/20', textColor: 'text-[#D4AF37]' },
    waiting: { icon: Clock, color: 'border-slate-400 bg-slate-400/10', textColor: 'text-slate-400' },
    scanning: { icon: Brain, color: 'border-slate-400 bg-slate-400/10', textColor: 'text-slate-400' },
    filter: { icon: AlertTriangle, color: 'border-red-500 bg-red-500/10', textColor: 'text-red-400' },
    execution: { icon: TrendingUp, color: 'border-[#D4AF37] bg-[#D4AF37]/20', textColor: 'text-[#D4AF37]' },
    management: { icon: Shield, color: 'border-blue-400 bg-blue-400/10', textColor: 'text-blue-400' },
    monitoring: { icon: BarChart3, color: 'border-slate-400 bg-slate-400/10', textColor: 'text-slate-400' },
    summary: { icon: BarChart3, color: 'border-purple-400 bg-purple-400/10', textColor: 'text-purple-400' }
  };

  const config = categoryConfig[thought.category] || categoryConfig.analysis;
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: -20, scale: 0.95 }}
      className={`p-3 rounded-lg border ${config.color} mb-2`}
    >
      <div className="flex items-start gap-2">
        <Icon size={16} className={`mt-0.5 flex-shrink-0 ${config.textColor}`} />
        <div className="flex-1 min-w-0">
          <p className="text-sm leading-relaxed">{thought.message}</p>
          {Object.keys(thought.data).length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {Object.entries(thought.data).slice(0, 6).map(([key, value]) => (
                <span key={key} className="text-xs px-2 py-0.5 rounded bg-white/5 font-mono">
                  {key}: {typeof value === 'number' ? (Number.isInteger(value) ? value : value.toFixed?.(2)) : String(value)}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="text-xs text-slate-500 mt-2 font-mono">
        {thought.timestamp.toLocaleTimeString()}
      </div>
    </motion.div>
  );
};

const StatCard = ({ label, value, subValue, icon: Icon, color = 'text-white', trend }) => (
  <div className="p-3 rounded-lg bg-white/5 border border-white/5">
    <div className="flex items-center gap-2 mb-1">
      <Icon size={14} className="text-slate-400" />
      <span className="text-xs text-slate-500 uppercase tracking-wide">{label}</span>
    </div>
    <div className={`font-mono text-xl font-bold ${color}`}>{value}</div>
    {subValue && <div className="text-xs text-slate-500 mt-0.5">{subValue}</div>}
  </div>
);

const LiveDemo = ({ onClose }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(2);
  const [candles, setCandles] = useState([]);
  const [currentTick, setCurrentTick] = useState({ bid: 0, ask: 0, spread: 0, phase: '' });
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
    
    const tick = marketRef.current.tick();
    setCurrentTick(tick);
    
    setIndicators(algoRef.current.getIndicators());
    setThoughts(algoRef.current.getThoughts());

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const tick = useCallback(() => {
    if (!marketRef.current || !algoRef.current) return;

    // Update market
    const newTick = marketRef.current.tick();
    marketRef.current.updateCandle();
    const newCandles = marketRef.current.getCandles(50);
    const marketPhase = marketRef.current.getPhase();

    setCurrentTick(newTick);
    setCandles(newCandles);

    // Run algorithm analysis
    const analysis = algoRef.current.analyze(newCandles, newTick, marketPhase);
    
    // Execute signal if present
    if (analysis.signal && !algoRef.current.getPosition()) {
      algoRef.current.executeTrade(analysis.signal, balance);
      setPosition(algoRef.current.getPosition());
    }

    // Update state
    setThoughts([...algoRef.current.getThoughts()]);
    setPosition(algoRef.current.getPosition());
    setIndicators(algoRef.current.getIndicators());

    // Update trade history and stats
    const history = algoRef.current.getTradeHistory();
    if (history.length !== tradeHistory.length) {
      setTradeHistory([...history]);
      const lastTrade = history[0];
      if (lastTrade) {
        setBalance(b => Math.round((b + lastTrade.pnl) * 100) / 100);
        setStats({
          trades: history.length,
          wins: history.filter(t => t.result === 'WIN').length,
          pnl: Math.round(history.reduce((sum, t) => sum + t.pnl, 0) * 100) / 100
        });
      }
    }
  }, [balance, tradeHistory.length]);

  useEffect(() => {
    if (isRunning) {
      const interval = Math.max(20, 100 / speed);
      intervalRef.current = setInterval(tick, interval);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, speed, tick]);

  const chartData = candles.map((c) => ({
    time: new Date(c.timestamp).toLocaleTimeString(),
    price: c.close,
    high: c.high,
    low: c.low
  }));

  const winRate = stats.trades > 0 ? ((stats.wins / stats.trades) * 100).toFixed(0) : 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-[#030712] overflow-hidden"
    >
      {/* Header */}
      <div className="h-14 border-b border-white/10 flex items-center justify-between px-4 bg-black/50">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#D4AF37] to-[#B5952F] flex items-center justify-center">
              <span className="text-black font-bold text-xs">A</span>
            </div>
            <span className="font-display font-bold">Aurum Quant</span>
          </div>
          <div className="w-px h-5 bg-white/10" />
          <span className="text-sm text-slate-400">Live Demo</span>
          <div className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium ${isRunning ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-500/20 text-slate-400'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isRunning ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'}`} />
            {isRunning ? 'LIVE' : 'PAUSED'}
          </div>
          {currentTick.phase && (
            <span className="text-xs text-slate-500 px-2 py-1 rounded bg-white/5">
              Market: {currentTick.phase}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Speed */}
          <div className="flex items-center gap-1.5 bg-white/5 rounded-lg p-1">
            {[1, 2, 5, 10].map(s => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  speed === s ? 'bg-[#D4AF37] text-black' : 'text-slate-400 hover:text-white'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`p-2.5 rounded-lg transition-colors ${
              isRunning ? 'bg-orange-500 text-white' : 'bg-emerald-500 text-white'
            }`}
          >
            {isRunning ? <Pause size={18} /> : <Play size={18} />}
          </button>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-56px)]">
        {/* Left Panel - Chart & Stats */}
        <div className="flex-1 p-4 overflow-auto">
          {/* Price Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-6">
              <div>
                <div className="text-xs text-slate-500 mb-1">XAUUSD</div>
                <div className="text-3xl font-mono font-bold tabular-nums">${currentTick.bid.toFixed(2)}</div>
              </div>
              <div className="flex gap-4 text-sm">
                <div>
                  <span className="text-slate-500">Bid </span>
                  <span className="font-mono text-emerald-400">{currentTick.bid.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-slate-500">Ask </span>
                  <span className="font-mono text-red-400">{currentTick.ask.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-slate-500">Spread </span>
                  <span className="font-mono">{currentTick.spread}pts</span>
                </div>
              </div>
            </div>
            
            {/* Session Stats Summary */}
            <div className="flex gap-4 text-sm">
              <div className="text-center">
                <div className="text-slate-500 text-xs">Balance</div>
                <div className={`font-mono font-bold ${balance >= 10000 ? 'text-emerald-400' : 'text-red-400'}`}>
                  ${balance.toFixed(2)}
                </div>
              </div>
              <div className="text-center">
                <div className="text-slate-500 text-xs">Trades</div>
                <div className="font-mono font-bold">{stats.trades}</div>
              </div>
              <div className="text-center">
                <div className="text-slate-500 text-xs">Win Rate</div>
                <div className="font-mono font-bold">{winRate}%</div>
              </div>
              <div className="text-center">
                <div className="text-slate-500 text-xs">P&L</div>
                <div className={`font-mono font-bold ${stats.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {stats.pnl >= 0 ? '+' : ''}${stats.pnl.toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="glass-card p-4 mb-4">
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#D4AF37" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#D4AF37" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="time" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#475569', fontSize: 10 }}
                    interval="preserveEnd"
                  />
                  <YAxis 
                    domain={['auto', 'auto']}
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#475569', fontSize: 10 }}
                    orientation="right"
                    tickFormatter={v => v.toFixed(0)}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(0,0,0,0.9)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                    formatter={(value) => [`$${value.toFixed(2)}`, 'Price']}
                  />
                  {indicators.support > 0 && (
                    <ReferenceLine 
                      y={indicators.support} 
                      stroke="#10B981" 
                      strokeDasharray="4 4"
                      strokeWidth={1.5}
                    />
                  )}
                  {indicators.resistance > 0 && (
                    <ReferenceLine 
                      y={indicators.resistance} 
                      stroke="#EF4444" 
                      strokeDasharray="4 4"
                      strokeWidth={1.5}
                    />
                  )}
                  {position && (
                    <>
                      <ReferenceLine 
                        y={position.entry} 
                        stroke="#D4AF37" 
                        strokeWidth={2}
                      />
                      <ReferenceLine 
                        y={position.sl} 
                        stroke="#EF4444" 
                        strokeWidth={1}
                        strokeDasharray="2 2"
                      />
                      <ReferenceLine 
                        y={position.tp} 
                        stroke="#10B981" 
                        strokeWidth={1}
                        strokeDasharray="2 2"
                      />
                    </>
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
            
            {/* Chart Legend */}
            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/5 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-0.5 bg-emerald-500" />
                <span className="text-slate-400">Support: ${indicators.support?.toFixed(2) || '—'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-0.5 bg-red-500" />
                <span className="text-slate-400">Resistance: ${indicators.resistance?.toFixed(2) || '—'}</span>
              </div>
              {position && (
                <>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-0.5 bg-[#D4AF37]" />
                    <span className="text-slate-400">Entry: ${position.entry.toFixed(2)}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Indicators & Position */}
          <div className="grid grid-cols-6 gap-3 mb-4">
            <StatCard
              label="RSI (14)"
              value={indicators.rsi?.toFixed(1) || '—'}
              subValue={indicators.rsi < 35 ? 'Oversold' : indicators.rsi > 65 ? 'Overbought' : 'Neutral'}
              icon={Activity}
              color={indicators.rsi < 35 ? 'text-emerald-400' : indicators.rsi > 65 ? 'text-red-400' : 'text-slate-300'}
            />
            <StatCard
              label="Trend"
              value={indicators.trend?.toUpperCase() || '—'}
              subValue={indicators.trendStrength ? `${indicators.trendStrength}% strength` : ''}
              icon={TrendingUp}
              color={indicators.trend === 'bullish' ? 'text-emerald-400' : indicators.trend === 'bearish' ? 'text-red-400' : 'text-slate-300'}
            />
            <StatCard
              label="EMA 20"
              value={`$${indicators.ema50?.toFixed(0) || '—'}`}
              icon={BarChart3}
              color="text-purple-400"
            />
            <StatCard
              label="EMA 50"
              value={`$${indicators.ema200?.toFixed(0) || '—'}`}
              icon={BarChart3}
              color="text-cyan-400"
            />
            <StatCard
              label="Support"
              value={`$${indicators.support?.toFixed(2) || '—'}`}
              icon={Target}
              color="text-emerald-400"
            />
            <StatCard
              label="Resistance"
              value={`$${indicators.resistance?.toFixed(2) || '—'}`}
              icon={Target}
              color="text-red-400"
            />
          </div>

          {/* Current Position */}
          {position ? (
            <div className="glass-card p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <Shield size={16} className="text-[#D4AF37]" />
                  Open Position
                </h3>
                <span className={`px-2 py-1 rounded text-xs font-bold ${
                  position.type === 'BUY' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                }`}>
                  {position.type}
                </span>
              </div>
              <div className="grid grid-cols-6 gap-4 text-sm">
                <div>
                  <div className="text-slate-500 text-xs">Entry</div>
                  <div className="font-mono">${position.entry.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-slate-500 text-xs">Current</div>
                  <div className="font-mono">${(position.type === 'BUY' ? currentTick.bid : currentTick.ask).toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-slate-500 text-xs">Stop Loss</div>
                  <div className="font-mono text-red-400">${position.sl.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-slate-500 text-xs">Take Profit</div>
                  <div className="font-mono text-emerald-400">${position.tp.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-slate-500 text-xs">Lots</div>
                  <div className="font-mono">{position.lots}</div>
                </div>
                <div>
                  <div className="text-slate-500 text-xs">P&L</div>
                  {(() => {
                    const currentPrice = position.type === 'BUY' ? currentTick.bid : currentTick.ask;
                    const pnl = (position.type === 'BUY' ? currentPrice - position.entry : position.entry - currentPrice) * position.lots * 100;
                    return (
                      <div className={`font-mono font-bold ${pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {pnl >= 0 ? '+' : ''}${pnl.toFixed(2)}
                      </div>
                    );
                  })()}
                </div>
              </div>
              {(position.breakevenSet || position.trailingActive) && (
                <div className="flex gap-2 mt-3 pt-3 border-t border-white/5">
                  {position.breakevenSet && (
                    <span className="px-2 py-1 rounded bg-blue-500/20 text-blue-400 text-xs">🔒 Breakeven Set</span>
                  )}
                  {position.trailingActive && (
                    <span className="px-2 py-1 rounded bg-purple-500/20 text-purple-400 text-xs">📈 Trailing Active</span>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="glass-card p-4">
              <div className="flex items-center gap-2 text-slate-500">
                <Shield size={16} />
                <span>No open position — Algorithm is scanning for setups...</span>
              </div>
            </div>
          )}

          {/* Recent Trades */}
          {tradeHistory.length > 0 && (
            <div className="mt-4 glass-card p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <BarChart3 size={16} className="text-[#D4AF37]" />
                Recent Trades
              </h3>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {tradeHistory.slice(0, 5).map((trade, i) => (
                  <div key={i} className="flex items-center justify-between text-sm p-2 rounded bg-white/5">
                    <div className="flex items-center gap-3">
                      <span className={`w-2 h-2 rounded-full ${trade.result === 'WIN' ? 'bg-emerald-400' : 'bg-red-400'}`} />
                      <span className={trade.type === 'BUY' ? 'text-emerald-400' : 'text-red-400'}>{trade.type}</span>
                      <span className="text-slate-400 text-xs">{trade.closeReason}</span>
                    </div>
                    <div className={`font-mono ${trade.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {trade.pnl >= 0 ? '+' : ''}${trade.pnl.toFixed(2)} ({trade.rMultiple >= 0 ? '+' : ''}{trade.rMultiple.toFixed(2)}R)
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Panel - Algorithm Thinking */}
        <div className="w-[420px] border-l border-white/10 flex flex-col bg-black/30">
          <div className="p-4 border-b border-white/10 bg-black/50">
            <h2 className="font-semibold flex items-center gap-2">
              <Brain className="text-[#D4AF37]" size={18} />
              Algorithm Thinking
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Real-time decision process • Updates every tick
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-3">
            <AnimatePresence mode="popLayout">
              {thoughts.slice(0, 50).map((thought) => (
                <ThoughtBubble key={thought.id} thought={thought} />
              ))}
            </AnimatePresence>
            
            {thoughts.length === 0 && (
              <div className="text-center text-slate-500 mt-8">
                <Brain size={32} className="mx-auto mb-2 opacity-50" />
                <p>Press Play to start the simulation</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default LiveDemo;
