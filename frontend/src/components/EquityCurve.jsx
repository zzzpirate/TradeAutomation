import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid
} from 'recharts';
import { equityCurveData } from '../data/mockData';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass p-3 rounded-lg border border-white/10">
        <p className="text-xs text-slate-400 mb-1">{label}</p>
        <p className="text-sm font-mono text-emerald-400">
          Balance: ${payload[0]?.value?.toLocaleString()}
        </p>
        {payload[1] && (
          <p className="text-sm font-mono text-blue-400">
            Equity: ${payload[1]?.value?.toLocaleString()}
          </p>
        )}
      </div>
    );
  }
  return null;
};

const EquityCurve = () => {
  const [timeframe, setTimeframe] = useState('all');
  
  const timeframes = [
    { key: '1m', label: '1M' },
    { key: '3m', label: '3M' },
    { key: '6m', label: '6M' },
    { key: '1y', label: '1Y' },
    { key: 'all', label: 'All' }
  ];

  const filteredData = useMemo(() => {
    const data = equityCurveData;
    const now = data.length;
    switch (timeframe) {
      case '1m': return data.slice(-30);
      case '3m': return data.slice(-90);
      case '6m': return data.slice(-180);
      case '1y': return data.slice(-365);
      default: return data;
    }
  }, [timeframe]);

  const startBalance = filteredData[0]?.balance || 10000;
  const endBalance = filteredData[filteredData.length - 1]?.balance || 10000;
  const periodReturn = ((endBalance - startBalance) / startBalance * 100).toFixed(1);

  return (
    <section className="relative py-24 md:py-32">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <span className="text-[#D4AF37] text-sm font-medium tracking-wider uppercase mb-4 block">
                Equity Performance
              </span>
              <h2 className="font-display text-4xl md:text-5xl font-bold">
                Growth <span className="text-[#D4AF37]">Trajectory</span>
              </h2>
            </div>
            
            {/* Timeframe Selector */}
            <div className="flex gap-2">
              {timeframes.map((tf) => (
                <button
                  key={tf.key}
                  onClick={() => setTimeframe(tf.key)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    timeframe === tf.key
                      ? 'bg-[#D4AF37] text-black'
                      : 'bg-white/5 text-slate-400 hover:bg-white/10'
                  }`}
                >
                  {tf.label}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="glass-card p-6 md:p-8"
        >
          {/* Chart Header Stats */}
          <div className="flex flex-wrap gap-8 mb-8 pb-6 border-b border-white/5">
            <div>
              <div className="text-sm text-slate-400 mb-1">Starting Balance</div>
              <div className="font-mono text-xl text-white">${startBalance.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-sm text-slate-400 mb-1">Current Balance</div>
              <div className="font-mono text-xl text-emerald-400">${endBalance.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-sm text-slate-400 mb-1">Period Return</div>
              <div className={`font-mono text-xl ${parseFloat(periodReturn) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {parseFloat(periodReturn) >= 0 ? '+' : ''}{periodReturn}%
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="h-[400px] md:h-[500px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={filteredData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#D4AF37" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#D4AF37" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                  }}
                  interval="preserveStartEnd"
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                  domain={['dataMin - 500', 'dataMax + 500']}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="balance"
                  stroke="#D4AF37"
                  strokeWidth={2}
                  fill="url(#balanceGradient)"
                  dot={false}
                  activeDot={{ r: 4, fill: '#D4AF37', stroke: '#fff', strokeWidth: 2 }}
                />
                <Area
                  type="monotone"
                  dataKey="equity"
                  stroke="#3B82F6"
                  strokeWidth={1.5}
                  fill="url(#equityGradient)"
                  dot={false}
                  strokeDasharray="5 5"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="flex gap-6 mt-6 pt-4 border-t border-white/5">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#D4AF37]" />
              <span className="text-sm text-slate-400">Balance</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#3B82F6]" />
              <span className="text-sm text-slate-400">Equity (Floating)</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default EquityCurve;
