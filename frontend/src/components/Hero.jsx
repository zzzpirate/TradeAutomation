import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Shield, Activity, Zap, ArrowRight, ChevronDown, Play } from 'lucide-react';

const Hero = ({ onOpenDemo }) => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[#020617]">
        {/* Grid Background */}
        <div className="absolute inset-0 grid-bg opacity-40" />
        
        {/* Gold Radial Gradient */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-b from-[#D4AF37]/10 via-[#D4AF37]/5 to-transparent rounded-full blur-3xl" />
        
        {/* Blue Accent */}
        <div className="absolute bottom-0 right-0 w-[600px] h-[400px] bg-gradient-to-t from-[#3B82F6]/10 to-transparent rounded-full blur-3xl" />
        
        {/* Animated Particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-[#D4AF37]/30 rounded-full"
              initial={{ 
                x: Math.random() * window.innerWidth, 
                y: Math.random() * window.innerHeight,
                opacity: 0.3 
              }}
              animate={{ 
                y: [null, Math.random() * -200],
                opacity: [0.3, 0, 0.3]
              }}
              transition={{ 
                duration: 5 + Math.random() * 5, 
                repeat: Infinity,
                delay: Math.random() * 2 
              }}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Status Banner */}
      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="absolute top-6 left-1/2 -translate-x-1/2 z-40 pointer-events-none md:pointer-events-auto"
        data-testid="status-banner"
      >
        <div className="glass flex items-center gap-4 px-6 py-3 rounded-full">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-emerald-400">System Active</span>
          </div>
          <div className="w-px h-4 bg-white/20" />
          <span className="text-sm text-slate-400">XAUUSD</span>
          <div className="w-px h-4 bg-white/20" />
          <span className="text-sm text-slate-400">Risk: Conservative</span>
          <div className="w-px h-4 bg-white/20" />
          <span className="text-sm text-slate-400">MT5 Auto</span>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="relative z-10 container-custom text-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-6"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/20 text-[#D4AF37] text-sm font-medium">
            <Zap size={14} />
            Institutional-Grade Algorithm
          </span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="font-display text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6"
        >
          <span className="text-white">Precision-Driven</span>
          <br />
          <span className="text-gold bg-gradient-to-r from-[#D4AF37] via-[#F5D77A] to-[#D4AF37] bg-clip-text text-transparent">
            Gold Trading
          </span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-8 leading-relaxed"
        >
          Automated XAUUSD trading powered by RSI divergence at Support/Resistance zones, 
          multi-timeframe trend confirmation, and institutional-grade risk management.
        </motion.p>

        {/* Quick Stats */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="flex flex-wrap justify-center gap-6 md:gap-10 mb-10"
        >
          <div className="text-center">
            <div className="font-mono text-2xl md:text-3xl font-bold text-emerald-400">+67.4%</div>
            <div className="text-sm text-slate-500">Total Return</div>
          </div>
          <div className="text-center">
            <div className="font-mono text-2xl md:text-3xl font-bold text-white">64.8%</div>
            <div className="text-sm text-slate-500">Win Rate</div>
          </div>
          <div className="text-center">
            <div className="font-mono text-2xl md:text-3xl font-bold text-[#D4AF37]">2.14</div>
            <div className="text-sm text-slate-500">Profit Factor</div>
          </div>
          <div className="text-center">
            <div className="font-mono text-2xl md:text-3xl font-bold text-blue-400">8.2%</div>
            <div className="text-sm text-slate-500">Max Drawdown</div>
          </div>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-wrap justify-center gap-4"
        >
          {/* Primary CTA - View Demo */}
          <button 
            onClick={onOpenDemo}
            data-testid="view-demo-btn"
            className="btn-primary flex items-center gap-2 animate-pulse-gold"
          >
            <Play size={18} />
            View Live Demo
          </button>
          <a href="#performance" className="btn-secondary flex items-center gap-2">
            <TrendingUp size={18} />
            View Performance
          </a>
          <a href="#strategy" className="btn-secondary flex items-center gap-2">
            <Shield size={18} />
            Explore Strategy
          </a>
        </motion.div>

        {/* Feature Pills */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="flex flex-wrap justify-center gap-3 mt-12"
        >
          {['RSI + S/R Logic', 'Multi-Timeframe', 'News Filter', 'Break-even & Trail', '0.75% Risk/Trade'].map((feature, i) => (
            <span key={i} className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-slate-400">
              {feature}
            </span>
          ))}
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex flex-col items-center gap-2 text-slate-500"
        >
          <span className="text-xs uppercase tracking-widest">Scroll to Explore</span>
          <ChevronDown size={20} />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Hero;
