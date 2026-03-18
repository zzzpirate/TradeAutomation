import React from 'react';
import { motion } from 'framer-motion';
import { Check, X, Minus } from 'lucide-react';
import { comparisonData } from '../data/mockData';

const ComparisonTable = () => {
  const getStatusIcon = (value, isAurum = false) => {
    if (isAurum) {
      return <Check className="text-emerald-400" size={16} />;
    }
    if (value.includes('None') || value.includes('Wipe') || value.includes('Very Low') || value.includes('Panic')) {
      return <X className="text-red-400" size={16} />;
    }
    if (value.includes('Variable') || value.includes('Sometimes') || value.includes('Moderate') || value.includes('Medium')) {
      return <Minus className="text-yellow-400" size={16} />;
    }
    if (value.includes('Inconsistent') || value.includes('Skipped') || value.includes('Unpredictable') || value.includes('Limited') || value.includes('Low')) {
      return <X className="text-orange-400" size={16} />;
    }
    return <Minus className="text-slate-400" size={16} />;
  };

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
            Comparison
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Why <span className="text-[#D4AF37]">Aurum Quant</span>?
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            See how systematic algorithmic trading compares to alternative approaches.
          </p>
        </motion.div>

        {/* Desktop Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="hidden md:block glass-card overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left p-4 text-sm font-semibold text-slate-400">Metric</th>
                  <th className="text-center p-4 text-sm font-semibold">
                    <span className="text-[#D4AF37]">Aurum Quant</span>
                  </th>
                  <th className="text-center p-4 text-sm font-semibold text-slate-400">Manual Trading</th>
                  <th className="text-center p-4 text-sm font-semibold text-slate-400">Signal Groups</th>
                  <th className="text-center p-4 text-sm font-semibold text-slate-400">Martingale Bots</th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.map((row, i) => (
                  <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="p-4 text-sm font-medium text-white">{row.metric}</td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <Check className="text-emerald-400" size={16} />
                        <span className="text-sm text-emerald-400">{row.aurumQuant}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        {getStatusIcon(row.manual)}
                        <span className="text-sm text-slate-400">{row.manual}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        {getStatusIcon(row.signals)}
                        <span className="text-sm text-slate-400">{row.signals}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        {getStatusIcon(row.martingale)}
                        <span className="text-sm text-slate-400">{row.martingale}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-4">
          {comparisonData.map((row, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="glass-card p-4"
            >
              <h4 className="font-semibold text-white mb-4 pb-2 border-b border-white/10">{row.metric}</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[#D4AF37] text-sm">Aurum Quant</span>
                  <span className="text-sm text-emerald-400 flex items-center gap-1">
                    <Check size={14} />
                    {row.aurumQuant}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 text-sm">Manual Trading</span>
                  <span className="text-sm text-slate-400">{row.manual}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 text-sm">Signal Groups</span>
                  <span className="text-sm text-slate-400">{row.signals}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 text-sm">Martingale Bots</span>
                  <span className="text-sm text-slate-400">{row.martingale}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 text-center"
        >
          <p className="text-slate-400 mb-6">
            Systematic execution eliminates emotional decisions and ensures consistent risk management.
          </p>
          <a href="#contact" className="btn-primary inline-flex">
            Request Demo Access
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default ComparisonTable;
