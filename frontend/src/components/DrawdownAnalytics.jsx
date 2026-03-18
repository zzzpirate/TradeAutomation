import React from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid
} from 'recharts';
import { Shield, AlertTriangle, Target, Clock, Filter, Calendar } from 'lucide-react';
import { drawdownData, riskMetrics } from '../data/mockData';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass p-3 rounded-lg border border-white/10">
        <p className="text-xs text-slate-400 mb-1">{label}</p>
        <p className="text-sm font-mono text-red-400">
          Drawdown: {payload[0]?.value}%
        </p>
      </div>
    );
  }
  return null;
};

const RiskMetricCard = ({ icon: Icon, label, value, color = 'text-slate-300' }) => (
  <div className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/5">
    <div className="p-2.5 rounded-lg bg-white/5">
      <Icon size={18} className="text-[#D4AF37]" />
    </div>
    <div>
      <div className={`font-mono text-lg font-semibold ${color}`}>{value}</div>
      <div className="text-xs text-slate-500">{label}</div>
    </div>
  </div>
);

const DrawdownAnalytics = () => {
  return (
    <section className="relative py-24 md:py-32 bg-[#0A0F1C]">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0A0F1C] to-transparent" />
      
      <div className="container-custom relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-[#D4AF37] text-sm font-medium tracking-wider uppercase mb-4 block">
            Risk Analytics
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Drawdown <span className="text-[#D4AF37]">Control</span>
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Capital preservation is our first priority. Every trade operates within strict risk parameters.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Drawdown Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="glass-card p-6 md:p-8"
          >
            <h3 className="text-xl font-semibold mb-6">Drawdown History</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={drawdownData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="drawdownGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#EF4444" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#EF4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 11 }}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    tickFormatter={(value) => `${value}%`}
                    domain={[-10, 0]}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="drawdown"
                    stroke="#EF4444"
                    strokeWidth={2}
                    fill="url(#drawdownGradient)"
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            
            {/* Drawdown Stats */}
            <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/5">
              <div className="text-center">
                <div className="font-mono text-xl text-red-400">-8.2%</div>
                <div className="text-xs text-slate-500 mt-1">Max Drawdown</div>
              </div>
              <div className="text-center">
                <div className="font-mono text-xl text-orange-400">-2.4%</div>
                <div className="text-xs text-slate-500 mt-1">Avg Drawdown</div>
              </div>
              <div className="text-center">
                <div className="font-mono text-xl text-emerald-400">12 days</div>
                <div className="text-xs text-slate-500 mt-1">Avg Recovery</div>
              </div>
            </div>
          </motion.div>

          {/* Risk Parameters */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            <div className="glass-card p-6">
              <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <Shield className="text-[#D4AF37]" size={20} />
                Risk Engine Parameters
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <RiskMetricCard 
                  icon={Target} 
                  label="Risk Per Trade" 
                  value={`${riskMetrics.riskPerTrade}%`}
                  color="text-emerald-400"
                />
                <RiskMetricCard 
                  icon={Calendar} 
                  label="Max Trades/Day" 
                  value={riskMetrics.maxDailyTrades}
                />
                <RiskMetricCard 
                  icon={AlertTriangle} 
                  label="Daily DD Limit" 
                  value={`${riskMetrics.dailyDrawdownLimit}%`}
                  color="text-orange-400"
                />
                <RiskMetricCard 
                  icon={Filter} 
                  label="Max Spread" 
                  value={`${riskMetrics.spreadFilter} pts`}
                />
                <RiskMetricCard 
                  icon={Clock} 
                  label="Session Filter" 
                  value="London/NY"
                  color="text-blue-400"
                />
                <RiskMetricCard 
                  icon={Shield} 
                  label="News Filter" 
                  value="Active"
                  color="text-emerald-400"
                />
              </div>
            </div>

            {/* Key Risk Points */}
            <div className="glass-card p-6">
              <h4 className="font-semibold mb-4 text-slate-300">Risk Discipline</h4>
              <ul className="space-y-3">
                {[
                  'Stop Loss mandatory on every trade',
                  'Take Profit calculated at 1:2 Risk/Reward',
                  'Break-even protection at +1R profit',
                  'Trailing stop activated at +1.5R',
                  'No martingale or grid strategies',
                  'No revenge trading or averaging down'
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-slate-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default DrawdownAnalytics;
