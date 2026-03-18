import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import PerformanceKPIs from './components/PerformanceKPIs';
import EquityCurve from './components/EquityCurve';
import DrawdownAnalytics from './components/DrawdownAnalytics';
import StrategyOverview from './components/StrategyOverview';
import TradeAnalytics from './components/TradeAnalytics';
import RecentTrades from './components/RecentTrades';
import ComparisonTable from './components/ComparisonTable';
import Testimonials from './components/Testimonials';
import FAQ from './components/FAQ';
import Footer from './components/Footer';
import FloatingStats from './components/FloatingStats';
import LiveDemo from './components/LiveDemo';
import './index.css';

function App() {
  const [showDemo, setShowDemo] = useState(false);

  return (
    <div className="min-h-screen bg-[#020617] text-white overflow-x-hidden">
      {/* Navigation */}
      <Navbar />
      
      {/* Main Content */}
      <main>
        {/* Hero Section */}
        <Hero onOpenDemo={() => setShowDemo(true)} />
        
        {/* Performance KPIs */}
        <PerformanceKPIs />
        
        {/* Equity Curve Chart */}
        <EquityCurve />
        
        {/* Drawdown & Risk Analytics */}
        <DrawdownAnalytics />
        
        {/* Strategy Overview */}
        <StrategyOverview />
        
        {/* Trade Distribution Analytics */}
        <TradeAnalytics />
        
        {/* Recent Trades Table */}
        <RecentTrades />
        
        {/* Comparison Table */}
        <ComparisonTable />
        
        {/* Testimonials */}
        <Testimonials />
        
        {/* FAQ */}
        <FAQ />
        
        {/* Footer with CTA */}
        <Footer />
      </main>
      
      {/* Floating Stats Widget */}
      <FloatingStats />

      {/* Live Demo Modal */}
      <AnimatePresence>
        {showDemo && (
          <LiveDemo onClose={() => setShowDemo(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
