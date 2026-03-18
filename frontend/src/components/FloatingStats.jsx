import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, TrendingDown, Activity, Clock, 
  Shield, X, ChevronUp 
} from 'lucide-react';

// Floating Stats Widget
const FloatingStats = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Mock real-time data
  const [stats, setStats] = useState({
    todayReturn: 1.2,
    currentDrawdown: -0.8,
    lastSignal: 'BUY @ 2658.45',
    marketStatus: 'Open',
    sessionActive: 'London/NY Overlap',
    riskMode: 'Conservative'
  });

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* Floating Widget Button */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1 }}
        className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3"
      >
        {/* Scroll to Top */}
        <AnimatePresence>
          {showScrollTop && (
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              onClick={scrollToTop}
              className="p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/10 hover:bg-white/20 transition-colors"
            >
              <ChevronUp size={20} />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Stats Panel */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="glass p-4 rounded-2xl w-64 mb-2"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-semibold">Live Stats</span>
                <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white">
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Today's Return</span>
                  <span className={`text-sm font-mono font-semibold ${stats.todayReturn >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {stats.todayReturn >= 0 ? '+' : ''}{stats.todayReturn}%
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Current DD</span>
                  <span className="text-sm font-mono text-orange-400">{stats.currentDrawdown}%</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Last Signal</span>
                  <span className="text-xs font-mono text-emerald-400">{stats.lastSignal}</span>
                </div>

                <div className="pt-2 border-t border-white/10">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">Market</span>
                    <span className="flex items-center gap-1.5 text-xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      {stats.marketStatus}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Session</span>
                  <span className="text-xs text-blue-400">{stats.sessionActive}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Risk Mode</span>
                  <span className="text-xs text-[#D4AF37]">{stats.riskMode}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Toggle Button */}
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`p-4 rounded-full ${
            isOpen 
              ? 'bg-[#D4AF37] text-black' 
              : 'bg-white/10 backdrop-blur-md border border-white/10 text-white'
          } shadow-lg hover:shadow-[#D4AF37]/20 transition-all`}
        >
          <Activity size={22} />
        </motion.button>
      </motion.div>
    </>
  );
};

export default FloatingStats;
