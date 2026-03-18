import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Mail, MessageSquare, ArrowRight } from 'lucide-react';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
      setEmail('');
    }
  };

  return (
    <footer id="contact" className="relative py-24 md:py-32">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-gradient-to-t from-[#D4AF37]/10 via-[#D4AF37]/5 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="container-custom relative z-10">
        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Ready to <span className="text-[#D4AF37]">Explore</span>?
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto mb-8">
            Request access to our full performance analytics or schedule a strategy walkthrough.
          </p>

          {/* Email Capture */}
          <form onSubmit={handleSubmit} className="max-w-md mx-auto">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full pl-12 pr-4 py-4 rounded-full bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/50 transition-all"
                  data-testid="email-input"
                />
              </div>
              <button
                type="submit"
                className="btn-primary flex items-center gap-2"
                data-testid="submit-btn"
              >
                <span className="hidden sm:inline">Request Access</span>
                <Send size={18} />
              </button>
            </div>
            {submitted && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-emerald-400 text-sm mt-3"
              >
                Thank you! We'll be in touch soon.
              </motion.p>
            )}
          </form>
        </motion.div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-4 mb-16"
        >
          <a href="#performance" className="btn-secondary text-sm flex items-center gap-2">
            View Performance <ArrowRight size={14} />
          </a>
          <a href="#strategy" className="btn-secondary text-sm flex items-center gap-2">
            Explore Strategy <ArrowRight size={14} />
          </a>
          <a href="#" className="btn-secondary text-sm flex items-center gap-2">
            <MessageSquare size={14} />
            Contact Us
          </a>
        </motion.div>

        {/* Bottom Bar */}
        <div className="border-t border-white/5 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#B5952F] flex items-center justify-center">
                <span className="text-black font-bold text-lg">A</span>
              </div>
              <div>
                <span className="font-display text-xl font-bold">Aurum Quant</span>
                <span className="block text-xs text-slate-500">Institutional-Grade Trading</span>
              </div>
            </div>

            {/* Links */}
            <div className="flex flex-wrap justify-center gap-6 text-sm text-slate-500">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors">Risk Disclosure</a>
            </div>

            {/* Copyright */}
            <p className="text-sm text-slate-600">
              © 2026 Aurum Quant. All rights reserved.
            </p>
          </div>

          {/* Disclaimer */}
          <p className="text-xs text-slate-600 text-center mt-8 max-w-3xl mx-auto leading-relaxed">
            <strong>Risk Disclosure:</strong> Trading forex and CFDs involves substantial risk of loss and is not suitable for all investors. 
            Past performance is not indicative of future results. The information provided on this website is for educational and informational purposes only 
            and should not be considered financial advice. Always conduct your own research and consult with a qualified financial advisor before making any investment decisions.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
