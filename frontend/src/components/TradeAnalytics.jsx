import React from 'react';
import { motion } from 'framer-motion';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid
} from 'recharts';
import { 
  winLossDistribution, longShortDistribution, 
  tradesBySession, tradesByWeekday, monthlyReturns 
} from '../data/mockData';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass p-3 rounded-lg border border-white/10">
        <p className="text-sm font-medium">{payload[0].name || payload[0].payload.month || payload[0].payload.day || payload[0].payload.session}</p>
        <p className="text-sm font-mono text-[#D4AF37]">
          {payload[0].value}{payload[0].unit || ''}
        </p>
      </div>
    );
  }
  return null;
};

const COLORS_WIN_LOSS = ['#10B981', '#EF4444'];
const COLORS_LONG_SHORT = ['#3B82F6', '#8B5CF6'];

const TradeAnalytics = () => {
  return (
    <section className="relative py-24 md:py-32 bg-[#0A0F1C]">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-[#D4AF37] text-sm font-medium tracking-wider uppercase mb-4 block">
            Trade Analytics
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Distribution <span className="text-[#D4AF37]">Insights</span>
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Comprehensive breakdown of trading patterns, session performance, and return distribution.
          </p>
        </motion.div>

        {/* Top Row - Pie Charts */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Win/Loss Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="glass-card p-6"
          >
            <h3 className="text-sm font-medium text-slate-400 mb-4">Win/Loss Ratio</h3>
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={winLossDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {winLossDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS_WIN_LOSS[index]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-xs text-slate-400">Wins (549)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-xs text-slate-400">Losses (298)</span>
              </div>
            </div>
          </motion.div>

          {/* Long/Short Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="glass-card p-6"
          >
            <h3 className="text-sm font-medium text-slate-400 mb-4">Long/Short Split</h3>
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={longShortDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {longShortDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS_LONG_SHORT[index]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-xs text-slate-400">Long (456)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-purple-500" />
                <span className="text-xs text-slate-400">Short (391)</span>
              </div>
            </div>
          </motion.div>

          {/* Session Performance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="glass-card p-6 lg:col-span-2"
          >
            <h3 className="text-sm font-medium text-slate-400 mb-4">Performance by Session</h3>
            <div className="space-y-3">
              {tradesBySession.map((session, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-20 text-sm text-slate-400">{session.session}</div>
                  <div className="flex-1 h-8 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-[#D4AF37] to-[#B5952F] rounded-full flex items-center justify-end pr-3"
                      style={{ width: `${session.winRate}%` }}
                    >
                      <span className="text-xs font-mono text-black font-medium">{session.winRate}%</span>
                    </div>
                  </div>
                  <div className="w-16 text-right text-xs text-slate-500">{session.trades} trades</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Bottom Row - Bar Charts */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Monthly Returns */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="glass-card p-6"
          >
            <h3 className="text-sm font-medium text-slate-400 mb-6">Monthly Returns (%)</h3>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyReturns} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis 
                    dataKey="month" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 11 }}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar 
                    dataKey="return" 
                    fill="#D4AF37" 
                    radius={[4, 4, 0, 0]}
                    maxBarSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Trades by Weekday */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="glass-card p-6"
          >
            <h3 className="text-sm font-medium text-slate-400 mb-6">Trades by Weekday</h3>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={tradesByWeekday} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis 
                    dataKey="day" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 11 }}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 11 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar 
                    dataKey="trades" 
                    fill="#3B82F6" 
                    radius={[4, 4, 0, 0]}
                    maxBarSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* Summary Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-8 glass-card p-6"
        >
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 text-center">
            <div>
              <div className="text-[#D4AF37] font-mono text-2xl font-bold">$142</div>
              <div className="text-xs text-slate-500 mt-1">Avg Winner</div>
            </div>
            <div>
              <div className="text-red-400 font-mono text-2xl font-bold">$68</div>
              <div className="text-xs text-slate-500 mt-1">Avg Loser</div>
            </div>
            <div>
              <div className="text-emerald-400 font-mono text-2xl font-bold">1.72R</div>
              <div className="text-xs text-slate-500 mt-1">Avg R Multiple</div>
            </div>
            <div>
              <div className="text-blue-400 font-mono text-2xl font-bold">13:30</div>
              <div className="text-xs text-slate-500 mt-1">Best Entry Hour</div>
            </div>
            <div>
              <div className="text-purple-400 font-mono text-2xl font-bold">Wed</div>
              <div className="text-xs text-slate-500 mt-1">Most Profitable Day</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default TradeAnalytics;
