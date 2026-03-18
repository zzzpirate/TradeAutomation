import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { recentTrades } from '../data/mockData';

const RecentTrades = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const tradesPerPage = 10;
  const totalPages = Math.ceil(recentTrades.length / tradesPerPage);
  
  const paginatedTrades = recentTrades.slice(
    currentPage * tradesPerPage,
    (currentPage + 1) * tradesPerPage
  );

  return (
    <section className="relative py-24 md:py-32">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12"
        >
          <div>
            <span className="text-[#D4AF37] text-sm font-medium tracking-wider uppercase mb-4 block">
              Trade Log
            </span>
            <h2 className="font-display text-4xl md:text-5xl font-bold">
              Recent <span className="text-[#D4AF37]">Trades</span>
            </h2>
          </div>
          
          {/* Pagination */}
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-400">
              Page {currentPage + 1} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                disabled={currentPage === 0}
                className="p-2 rounded-lg bg-white/5 border border-white/10 disabled:opacity-30 hover:bg-white/10 transition-colors"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={currentPage === totalPages - 1}
                className="p-2 rounded-lg bg-white/5 border border-white/10 disabled:opacity-30 hover:bg-white/10 transition-colors"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Desktop Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="glass-card overflow-hidden hidden lg:block"
        >
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Trade ID</th>
                  <th>Date</th>
                  <th>Direction</th>
                  <th>Entry</th>
                  <th>Exit</th>
                  <th>SL</th>
                  <th>TP</th>
                  <th>Lots</th>
                  <th>Risk</th>
                  <th>Result</th>
                  <th>P&L</th>
                  <th>R Multiple</th>
                  <th>Duration</th>
                  <th>Session</th>
                </tr>
              </thead>
              <tbody>
                {paginatedTrades.map((trade, i) => (
                  <tr key={trade.id}>
                    <td className="text-slate-300">{trade.id}</td>
                    <td className="text-slate-400">{trade.date}</td>
                    <td>
                      <span className={`inline-flex items-center gap-1 ${
                        trade.direction === 'BUY' ? 'text-emerald-400' : 'text-red-400'
                      }`}>
                        {trade.direction === 'BUY' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                        {trade.direction}
                      </span>
                    </td>
                    <td className="text-slate-300">{trade.entry.toFixed(2)}</td>
                    <td className="text-slate-300">{trade.exit.toFixed(2)}</td>
                    <td className="text-red-400/70">{trade.sl.toFixed(2)}</td>
                    <td className="text-emerald-400/70">{trade.tp.toFixed(2)}</td>
                    <td className="text-slate-400">{trade.lots}</td>
                    <td className="text-[#D4AF37]">{trade.risk}%</td>
                    <td>
                      <span className={`status-badge ${
                        trade.result === 'WIN' ? 'status-win' : 'status-loss'
                      }`}>
                        {trade.result}
                      </span>
                    </td>
                    <td className={trade.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                      {trade.pnl >= 0 ? '+' : ''}${trade.pnl.toFixed(2)}
                    </td>
                    <td className={trade.rMultiple >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                      {trade.rMultiple >= 0 ? '+' : ''}{trade.rMultiple.toFixed(2)}R
                    </td>
                    <td className="text-slate-400">{trade.duration}</td>
                    <td className="text-slate-400">{trade.session}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Mobile Cards */}
        <div className="lg:hidden space-y-4">
          {paginatedTrades.map((trade, i) => (
            <motion.div
              key={trade.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="glass-card p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                    trade.direction === 'BUY' 
                      ? 'bg-emerald-500/10 text-emerald-400' 
                      : 'bg-red-500/10 text-red-400'
                  }`}>
                    {trade.direction === 'BUY' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                    {trade.direction}
                  </span>
                  <span className="text-sm text-slate-400">{trade.id}</span>
                </div>
                <span className={`status-badge ${
                  trade.result === 'WIN' ? 'status-win' : 'status-loss'
                }`}>
                  {trade.result}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-slate-500 text-xs">Entry</span>
                  <div className="font-mono">{trade.entry.toFixed(2)}</div>
                </div>
                <div>
                  <span className="text-slate-500 text-xs">Exit</span>
                  <div className="font-mono">{trade.exit.toFixed(2)}</div>
                </div>
                <div>
                  <span className="text-slate-500 text-xs">P&L</span>
                  <div className={`font-mono font-semibold ${trade.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {trade.pnl >= 0 ? '+' : ''}${trade.pnl.toFixed(2)}
                  </div>
                </div>
                <div>
                  <span className="text-slate-500 text-xs">R Multiple</span>
                  <div className={`font-mono font-semibold ${trade.rMultiple >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {trade.rMultiple >= 0 ? '+' : ''}{trade.rMultiple.toFixed(2)}R
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5 text-xs text-slate-500">
                <span>{trade.date}</span>
                <span>{trade.duration}</span>
                <span>{trade.session}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RecentTrades;
