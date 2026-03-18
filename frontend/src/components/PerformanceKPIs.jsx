import React, { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { 
  TrendingUp, TrendingDown, Activity, Target, Clock, 
  BarChart3, Award, AlertTriangle, Percent, Zap 
} from 'lucide-react';
import { performanceKPIs } from '../data/mockData';

// Animated counter component
const AnimatedCounter = ({ value, suffix = '', prefix = '', decimals = 1 }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (isInView) {
      const duration = 2000;
      const startTime = Date.now();
      const startValue = 0;
      const endValue = parseFloat(value);

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const current = startValue + (endValue - startValue) * easeOut;
        setCount(current);

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);
    }
  }, [isInView, value]);

  return (
    <span ref={ref} className="font-mono">
      {prefix}{count.toFixed(decimals)}{suffix}
    </span>
  );
};

const KPICard = ({ icon: Icon, label, value, suffix = '', prefix = '', color, delay, decimals = 1 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.5, delay }}
    className="glass-card p-6 group"
  >
    <div className="flex items-start justify-between mb-4">
      <div className={`p-2.5 rounded-xl ${color} bg-opacity-10`}>
        <Icon className={color.replace('bg-', 'text-')} size={20} />
      </div>
    </div>
    <div className={`text-3xl font-bold mb-1 ${color.replace('bg-', 'text-')}`}>
      <AnimatedCounter value={value} suffix={suffix} prefix={prefix} decimals={decimals} />
    </div>
    <div className="text-sm text-slate-400">{label}</div>
  </motion.div>
);

const PerformanceKPIs = () => {
  const kpis = [
    { icon: TrendingUp, label: 'Total Return', value: performanceKPIs.totalReturn, suffix: '%', prefix: '+', color: 'bg-emerald-500', decimals: 1 },
    { icon: Percent, label: 'Win Rate', value: performanceKPIs.winRate, suffix: '%', color: 'bg-blue-500', decimals: 1 },
    { icon: Target, label: 'Profit Factor', value: performanceKPIs.profitFactor, suffix: '', color: 'bg-[#D4AF37]', decimals: 2 },
    { icon: AlertTriangle, label: 'Max Drawdown', value: performanceKPIs.maxDrawdown, suffix: '%', color: 'bg-red-500', decimals: 1 },
    { icon: Activity, label: 'Sharpe Ratio', value: performanceKPIs.sharpeRatio, suffix: '', color: 'bg-purple-500', decimals: 2 },
    { icon: BarChart3, label: 'Risk:Reward', value: performanceKPIs.riskRewardRatio, suffix: ':1', color: 'bg-cyan-500', decimals: 1 },
    { icon: Clock, label: 'Avg Duration', value: '4.2', suffix: ' hrs', color: 'bg-orange-500', decimals: 1 },
    { icon: Zap, label: 'Total Trades', value: performanceKPIs.totalTrades, suffix: '', color: 'bg-pink-500', decimals: 0 },
  ];

  return (
    <section id="performance" className="relative py-24 md:py-32">
      {/* Background Accent */}
      <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-[#D4AF37]/5 rounded-full blur-3xl -translate-y-1/2" />
      
      <div className="container-custom relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-[#D4AF37] text-sm font-medium tracking-wider uppercase mb-4 block">
            Performance Metrics
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Data-Backed <span className="text-[#D4AF37]">Results</span>
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Transparent analytics from systematic XAUUSD trading with strict risk management protocols.
          </p>
        </motion.div>

        {/* KPI Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {kpis.map((kpi, i) => (
            <KPICard key={i} {...kpi} delay={i * 0.1} />
          ))}
        </div>

        {/* Additional Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-8 glass-card p-6"
        >
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 text-center">
            <div>
              <div className="text-emerald-400 font-mono text-xl font-bold">+{performanceKPIs.bestDay}%</div>
              <div className="text-xs text-slate-500 mt-1">Best Day</div>
            </div>
            <div>
              <div className="text-red-400 font-mono text-xl font-bold">{performanceKPIs.worstDay}%</div>
              <div className="text-xs text-slate-500 mt-1">Worst Day</div>
            </div>
            <div>
              <div className="text-[#D4AF37] font-mono text-xl font-bold">{performanceKPIs.consecutiveWins}</div>
              <div className="text-xs text-slate-500 mt-1">Max Win Streak</div>
            </div>
            <div>
              <div className="text-slate-300 font-mono text-xl font-bold">{performanceKPIs.consecutiveLosses}</div>
              <div className="text-xs text-slate-500 mt-1">Max Loss Streak</div>
            </div>
            <div>
              <div className="text-blue-400 font-mono text-xl font-bold">{performanceKPIs.recoveryFactor}x</div>
              <div className="text-xs text-slate-500 mt-1">Recovery Factor</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default PerformanceKPIs;
