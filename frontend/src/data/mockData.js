// Mock data for the Aurum Quant trading dashboard

// Performance KPIs
export const performanceKPIs = {
  totalReturn: 67.4,
  monthlyAverage: 5.6,
  winRate: 64.8,
  profitFactor: 2.14,
  maxDrawdown: 8.2,
  sharpeRatio: 1.87,
  riskRewardRatio: 2.1,
  avgTradeDuration: "4.2 hrs",
  totalTrades: 847,
  bestDay: 4.2,
  worstDay: -2.1,
  consecutiveWins: 12,
  consecutiveLosses: 4,
  recoveryFactor: 8.2
};

// Generate realistic equity curve data
export const generateEquityCurve = (months = 12) => {
  const data = [];
  let balance = 10000;
  let equity = 10000;
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months);
  
  for (let i = 0; i <= months * 30; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    
    // Realistic growth with volatility
    const dailyReturn = (Math.random() - 0.45) * 0.8;
    const drawdownFactor = Math.sin(i / 50) * 0.02;
    
    balance = balance * (1 + dailyReturn / 100 + drawdownFactor / 100);
    equity = balance * (1 + (Math.random() - 0.5) * 0.02);
    
    // Occasional larger moves
    if (Math.random() > 0.95) {
      const bigMove = (Math.random() - 0.4) * 2;
      balance = balance * (1 + bigMove / 100);
    }
    
    // Ensure realistic growth
    balance = Math.max(balance, 9500);
    
    data.push({
      date: date.toISOString().split('T')[0],
      balance: Math.round(balance * 100) / 100,
      equity: Math.round(equity * 100) / 100,
      drawdown: Math.round((1 - equity / Math.max(...data.map(d => d?.balance || balance), balance)) * 10000) / 100
    });
  }
  
  // Normalize to show growth
  const maxBalance = Math.max(...data.map(d => d.balance));
  const minBalance = Math.min(...data.map(d => d.balance));
  const targetGrowth = 1.674; // 67.4% return
  
  return data.map((d, i) => ({
    ...d,
    balance: Math.round((10000 + (d.balance - minBalance) / (maxBalance - minBalance) * 10000 * (targetGrowth - 1)) * 100) / 100,
    equity: Math.round((10000 + (d.equity - minBalance) / (maxBalance - minBalance) * 10000 * (targetGrowth - 1)) * 100) / 100
  }));
};

export const equityCurveData = generateEquityCurve(12);

// Monthly returns data
export const monthlyReturns = [
  { month: 'Jan', return: 5.2, trades: 68 },
  { month: 'Feb', return: 4.8, trades: 72 },
  { month: 'Mar', return: 7.1, trades: 81 },
  { month: 'Apr', return: 3.9, trades: 65 },
  { month: 'May', return: 6.4, trades: 74 },
  { month: 'Jun', return: 4.2, trades: 69 },
  { month: 'Jul', return: 8.3, trades: 85 },
  { month: 'Aug', return: 5.7, trades: 71 },
  { month: 'Sep', return: 6.9, trades: 78 },
  { month: 'Oct', return: 4.5, trades: 67 },
  { month: 'Nov', return: 5.8, trades: 73 },
  { month: 'Dec', return: 4.6, trades: 64 }
];

// Win/Loss distribution
export const winLossDistribution = [
  { name: 'Wins', value: 549, fill: '#10B981' },
  { name: 'Losses', value: 298, fill: '#EF4444' }
];

// Long/Short distribution
export const longShortDistribution = [
  { name: 'Long', value: 456, fill: '#3B82F6' },
  { name: 'Short', value: 391, fill: '#8B5CF6' }
];

// Trades by session
export const tradesBySession = [
  { session: 'London', trades: 312, winRate: 66.2 },
  { session: 'New York', trades: 287, winRate: 63.4 },
  { session: 'Overlap', trades: 198, winRate: 68.7 },
  { session: 'Asian', trades: 50, winRate: 54.0 }
];

// Trades by weekday
export const tradesByWeekday = [
  { day: 'Mon', trades: 142, profit: 2340 },
  { day: 'Tue', trades: 178, profit: 3120 },
  { day: 'Wed', trades: 195, profit: 3890 },
  { day: 'Thu', trades: 187, profit: 3450 },
  { day: 'Fri', trades: 145, profit: 2180 }
];

// Recent trades
export const recentTrades = [
  { id: 'XAU-847', date: '2026-01-17 14:32', direction: 'BUY', entry: 2658.45, exit: 2664.82, sl: 2652.00, tp: 2670.00, lots: 0.15, risk: 0.75, result: 'WIN', pnl: 95.55, rMultiple: 1.87, duration: '3h 24m', session: 'Overlap' },
  { id: 'XAU-846', date: '2026-01-17 09:15', direction: 'SELL', entry: 2672.30, exit: 2665.18, sl: 2680.00, tp: 2658.00, lots: 0.12, risk: 0.75, result: 'WIN', pnl: 85.44, rMultiple: 1.54, duration: '2h 48m', session: 'London' },
  { id: 'XAU-845', date: '2026-01-16 15:42', direction: 'BUY', entry: 2645.20, exit: 2641.85, sl: 2638.00, tp: 2660.00, lots: 0.18, risk: 0.75, result: 'LOSS', pnl: -60.30, rMultiple: -0.47, duration: '1h 12m', session: 'New York' },
  { id: 'XAU-844', date: '2026-01-16 10:28', direction: 'SELL', entry: 2668.90, exit: 2659.45, sl: 2676.00, tp: 2654.00, lots: 0.14, risk: 0.75, result: 'WIN', pnl: 132.30, rMultiple: 1.88, duration: '4h 35m', session: 'London' },
  { id: 'XAU-843', date: '2026-01-15 14:55', direction: 'BUY', entry: 2652.75, exit: 2661.20, sl: 2646.00, tp: 2666.00, lots: 0.16, risk: 0.75, result: 'WIN', pnl: 135.20, rMultiple: 1.63, duration: '3h 18m', session: 'Overlap' },
  { id: 'XAU-842', date: '2026-01-15 08:40', direction: 'BUY', entry: 2641.30, exit: 2649.85, sl: 2634.00, tp: 2656.00, lots: 0.13, risk: 0.75, result: 'WIN', pnl: 111.15, rMultiple: 1.47, duration: '2h 52m', session: 'London' },
  { id: 'XAU-841', date: '2026-01-14 16:22', direction: 'SELL', entry: 2678.40, exit: 2684.25, sl: 2686.00, tp: 2662.00, lots: 0.11, risk: 0.75, result: 'LOSS', pnl: -64.35, rMultiple: -0.77, duration: '0h 45m', session: 'New York' },
  { id: 'XAU-840', date: '2026-01-14 11:05', direction: 'BUY', entry: 2655.80, exit: 2668.45, sl: 2648.00, tp: 2672.00, lots: 0.15, risk: 0.75, result: 'WIN', pnl: 189.75, rMultiple: 2.04, duration: '5h 12m', session: 'London' },
  { id: 'XAU-839', date: '2026-01-13 14:18', direction: 'SELL', entry: 2682.15, exit: 2674.30, sl: 2690.00, tp: 2666.00, lots: 0.14, risk: 0.75, result: 'WIN', pnl: 109.90, rMultiple: 1.40, duration: '3h 42m', session: 'Overlap' },
  { id: 'XAU-838', date: '2026-01-13 09:30', direction: 'BUY', entry: 2648.60, exit: 2656.85, sl: 2642.00, tp: 2662.00, lots: 0.12, risk: 0.75, result: 'WIN', pnl: 99.00, rMultiple: 1.61, duration: '2h 28m', session: 'London' },
  { id: 'XAU-837', date: '2026-01-12 15:45', direction: 'SELL', entry: 2670.25, exit: 2675.80, sl: 2678.00, tp: 2654.00, lots: 0.16, risk: 0.75, result: 'LOSS', pnl: -88.80, rMultiple: -0.72, duration: '1h 35m', session: 'New York' },
  { id: 'XAU-836', date: '2026-01-12 10:12', direction: 'BUY', entry: 2638.90, exit: 2650.15, sl: 2632.00, tp: 2654.00, lots: 0.13, risk: 0.75, result: 'WIN', pnl: 146.25, rMultiple: 1.94, duration: '4h 08m', session: 'London' },
  { id: 'XAU-835', date: '2026-01-11 14:28', direction: 'SELL', entry: 2665.40, exit: 2658.75, sl: 2672.00, tp: 2652.00, lots: 0.15, risk: 0.75, result: 'WIN', pnl: 99.75, rMultiple: 1.51, duration: '3h 15m', session: 'Overlap' },
  { id: 'XAU-834', date: '2026-01-11 08:55', direction: 'BUY', entry: 2642.20, exit: 2639.45, sl: 2636.00, tp: 2656.00, lots: 0.11, risk: 0.75, result: 'LOSS', pnl: -30.25, rMultiple: -0.44, duration: '0h 52m', session: 'London' },
  { id: 'XAU-833', date: '2026-01-10 15:38', direction: 'BUY', entry: 2651.75, exit: 2662.30, sl: 2644.00, tp: 2668.00, lots: 0.14, risk: 0.75, result: 'WIN', pnl: 147.70, rMultiple: 1.79, duration: '4h 22m', session: 'Overlap' },
  { id: 'XAU-832', date: '2026-01-10 10:05', direction: 'SELL', entry: 2674.85, exit: 2666.20, sl: 2682.00, tp: 2660.00, lots: 0.12, risk: 0.75, result: 'WIN', pnl: 103.80, rMultiple: 1.64, duration: '3h 48m', session: 'London' },
  { id: 'XAU-831', date: '2026-01-09 14:52', direction: 'BUY', entry: 2658.30, exit: 2667.85, sl: 2651.00, tp: 2674.00, lots: 0.16, risk: 0.75, result: 'WIN', pnl: 152.80, rMultiple: 1.84, duration: '4h 05m', session: 'Overlap' },
  { id: 'XAU-830', date: '2026-01-09 09:18', direction: 'SELL', entry: 2680.45, exit: 2672.60, sl: 2688.00, tp: 2664.00, lots: 0.13, risk: 0.75, result: 'WIN', pnl: 102.05, rMultiple: 1.56, duration: '3h 32m', session: 'London' }
];

// Drawdown data
export const drawdownData = [
  { date: 'Jan 1', drawdown: -0.8 },
  { date: 'Jan 15', drawdown: -2.1 },
  { date: 'Feb 1', drawdown: -1.2 },
  { date: 'Feb 15', drawdown: -3.4 },
  { date: 'Mar 1', drawdown: -1.8 },
  { date: 'Mar 15', drawdown: -0.5 },
  { date: 'Apr 1', drawdown: -4.2 },
  { date: 'Apr 15', drawdown: -2.8 },
  { date: 'May 1', drawdown: -1.5 },
  { date: 'May 15', drawdown: -5.8 },
  { date: 'Jun 1', drawdown: -3.2 },
  { date: 'Jun 15', drawdown: -1.9 },
  { date: 'Jul 1', drawdown: -0.8 },
  { date: 'Jul 15', drawdown: -2.4 },
  { date: 'Aug 1', drawdown: -8.2 },
  { date: 'Aug 15', drawdown: -4.5 },
  { date: 'Sep 1', drawdown: -2.1 },
  { date: 'Sep 15', drawdown: -1.3 },
  { date: 'Oct 1', drawdown: -3.6 },
  { date: 'Oct 15', drawdown: -2.2 },
  { date: 'Nov 1', drawdown: -1.5 },
  { date: 'Nov 15', drawdown: -2.8 },
  { date: 'Dec 1', drawdown: -1.1 },
  { date: 'Dec 15', drawdown: -0.6 }
];

// Risk metrics
export const riskMetrics = {
  riskPerTrade: 0.75,
  maxDailyTrades: 1,
  dailyDrawdownLimit: 3.0,
  maxOpenTrades: 1,
  spreadFilter: 50,
  sessionActive: 'London/NY Overlap',
  slippage: 30,
  newsFilter: true
};

// Comparison data
export const comparisonData = [
  { metric: 'Risk Discipline', aurumQuant: 'Strict 0.75%', manual: 'Inconsistent', signals: 'Variable', martingale: 'Escalating' },
  { metric: 'Stop Loss Usage', aurumQuant: 'Every Trade', manual: 'Often Skipped', signals: 'Sometimes', martingale: 'None/Wide' },
  { metric: 'Emotional Control', aurumQuant: 'Algorithm-Based', manual: 'Highly Variable', signals: 'User Dependent', martingale: 'Panic-Prone' },
  { metric: 'Drawdown Control', aurumQuant: 'Max 8.2%', manual: '20-50%+', signals: '15-30%', martingale: 'Account Wipe Risk' },
  { metric: 'Consistency', aurumQuant: 'Systematic', manual: 'Unpredictable', signals: 'Hit or Miss', martingale: 'Boom/Bust' },
  { metric: 'Overtrading Prevention', aurumQuant: '1 Trade/Day Max', manual: 'Common Problem', signals: 'No Limit', martingale: 'Encouraged' },
  { metric: 'Long-term Viability', aurumQuant: 'High', manual: 'Low', signals: 'Medium', martingale: 'Very Low' },
  { metric: 'Scalability', aurumQuant: 'Excellent', manual: 'Limited', signals: 'Moderate', martingale: 'Dangerous' }
];

// Testimonials
export const testimonials = [
  {
    quote: "The consistency and drawdown control are what stood out. After years of manual trading with inconsistent results, seeing a systematic approach with strict risk management was refreshing.",
    author: "M. Chen",
    role: "Prop Firm Trader",
    avatar: "MC"
  },
  {
    quote: "It behaves like a disciplined system, not a gambling bot. The transparency in showing both wins and losses builds real trust. No unrealistic claims, just solid execution.",
    author: "S. Williams",
    role: "Portfolio Manager",
    avatar: "SW"
  },
  {
    quote: "The analytics transparency is a huge trust factor. Being able to see every trade, understand the logic, and track real drawdowns helped me make an informed decision.",
    author: "R. Patel",
    role: "Private Investor",
    avatar: "RP"
  }
];

// FAQ data
export const faqData = [
  {
    question: "Is this a live trading bot or a performance showcase?",
    answer: "This website serves as a performance showcase and analytics dashboard for our XAUUSD trading algorithm. The system is designed to operate on MetaTrader 5 and can be deployed for live trading with proper setup and risk acknowledgment."
  },
  {
    question: "Does it trade automatically on MT5?",
    answer: "Yes, when deployed, the algorithm operates as a fully automated Expert Advisor on MetaTrader 5. It handles all aspects of trade execution including entry, exit, stop loss, take profit, and position management without manual intervention."
  },
  {
    question: "What market does it trade?",
    answer: "The algorithm is specifically designed for XAUUSD (Gold vs US Dollar). Gold was chosen due to its volatility characteristics, strong technical price action, and favorable trading conditions during London and New York sessions."
  },
  {
    question: "How is risk managed?",
    answer: "Risk management is institutional-grade: 0.75% risk per trade, maximum 1 trade per day, 3% daily drawdown limit, mandatory stop-loss on every position, session filters, spread filters, and automatic news event avoidance."
  },
  {
    question: "Is martingale or grid strategy used?",
    answer: "Absolutely not. The algorithm uses fixed risk position sizing only. There is no martingale, no grid, no averaging down, and no revenge trading logic. Each trade is independent with predefined risk."
  },
  {
    question: "Is this backtest or forward test data?",
    answer: "The performance data shown represents a combination of backtested results and forward-tested live market data. All metrics are calculated using realistic spread, slippage, and execution conditions."
  },
  {
    question: "Can live broker data be integrated?",
    answer: "Yes, the dashboard can be connected to MT5 trade logs, MyFXBook accounts, or direct API feeds to display real-time performance data from live trading accounts."
  },
  {
    question: "What timeframe does it trade?",
    answer: "The algorithm uses M15 (15-minute) charts for entry signals with H1 (hourly) chart confirmation for trend direction. This provides a balance between signal frequency and noise filtering."
  },
  {
    question: "Is this suitable for prop-firm style risk limits?",
    answer: "Yes, the risk parameters are specifically designed to comply with typical prop-firm rules: controlled drawdown (under 10%), consistent position sizing, and no prohibited strategies like martingale or news gambling."
  }
];

// Strategy steps
export const strategySteps = [
  { step: 1, title: 'Market Structure', description: 'Analyze H1 trend using EMA 200 and EMA 50 alignment to determine market direction' },
  { step: 2, title: 'Support/Resistance', description: 'Identify key S/R zones using swing high/low detection on M15 timeframe' },
  { step: 3, title: 'RSI Confirmation', description: 'Wait for RSI oversold (<30) at support or overbought (>70) at resistance' },
  { step: 4, title: 'Candle Validation', description: 'Confirm entry with bullish/bearish engulfing or strong momentum candle' },
  { step: 5, title: 'Filter Checks', description: 'Verify spread, session, news filter, and daily trade limits before entry' },
  { step: 6, title: 'Execute & Manage', description: 'Place trade with structure-based SL, 1:2 RR TP, breakeven at 1R, trail at 1.5R' }
];
