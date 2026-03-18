import React from 'react';
import { motion } from 'framer-motion';
import { 
  Activity, Target, Search, CheckCircle, 
  Zap, Settings, ArrowRight 
} from 'lucide-react';
import { strategySteps } from '../data/mockData';

const stepIcons = [Activity, Search, Target, CheckCircle, Settings, Zap];

const StrategyOverview = () => {
  return (
    <section id="strategy" className="relative py-24 md:py-32">
      {/* Background Accent */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#3B82F6]/5 rounded-full blur-3xl" />
      
      <div className="container-custom relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-[#D4AF37] text-sm font-medium tracking-wider uppercase mb-4 block">
            Strategy Logic
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
            How It <span className="text-[#D4AF37]">Works</span>
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            A systematic approach combining technical analysis with strict risk management for consistent execution.
          </p>
        </motion.div>

        {/* Strategy Flow */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {strategySteps.map((step, i) => {
            const Icon = stepIcons[i];
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="glass-card p-6 relative group"
              >
                {/* Step Number */}
                <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-[#D4AF37] flex items-center justify-center text-black font-bold text-sm">
                  {step.step}
                </div>
                
                {/* Arrow connector (hidden on mobile and last items) */}
                {i < 5 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                    {(i + 1) % 3 !== 0 && (
                      <ArrowRight size={20} className="text-[#D4AF37]/50" />
                    )}
                  </div>
                )}
                
                <div className="pt-4">
                  <div className="p-3 rounded-xl bg-white/5 w-fit mb-4 group-hover:bg-[#D4AF37]/10 transition-colors">
                    <Icon size={24} className="text-[#D4AF37]" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{step.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Strategy Summary Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="glass-card p-6"
          >
            <div className="text-[#D4AF37] font-semibold mb-3">Entry Timeframe</div>
            <div className="text-3xl font-mono font-bold mb-2">M15</div>
            <p className="text-sm text-slate-400">
              15-minute charts for precise entry timing with reduced noise
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="glass-card p-6"
          >
            <div className="text-[#D4AF37] font-semibold mb-3">Trend Filter</div>
            <div className="text-3xl font-mono font-bold mb-2">H1</div>
            <p className="text-sm text-slate-400">
              Hourly EMA 200 + EMA 50 alignment for trend confirmation
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="glass-card p-6"
          >
            <div className="text-[#D4AF37] font-semibold mb-3">Key Indicator</div>
            <div className="text-3xl font-mono font-bold mb-2">RSI 14</div>
            <p className="text-sm text-slate-400">
              Oversold &lt;30 at support, Overbought &gt;70 at resistance
            </p>
          </motion.div>
        </div>

        {/* Core Logic Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 glass-card p-8"
        >
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <span className="text-emerald-400">BUY</span> Signal Requirements
              </h3>
              <ul className="space-y-2">
                {[
                  'Price at or near Support Zone',
                  'RSI < 30 (oversold) or crossing up',
                  'H1 price above EMA 200 (uptrend)',
                  'EMA 50 > EMA 200 (trend alignment)',
                  'Bullish candle confirmation',
                  'Spread & session filters pass'
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-slate-400">
                    <CheckCircle size={14} className="text-emerald-400" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <span className="text-red-400">SELL</span> Signal Requirements
              </h3>
              <ul className="space-y-2">
                {[
                  'Price at or near Resistance Zone',
                  'RSI > 70 (overbought) or crossing down',
                  'H1 price below EMA 200 (downtrend)',
                  'EMA 50 < EMA 200 (trend alignment)',
                  'Bearish candle confirmation',
                  'Spread & session filters pass'
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-slate-400">
                    <CheckCircle size={14} className="text-red-400" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default StrategyOverview;
