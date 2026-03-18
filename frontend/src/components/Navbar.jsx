import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '#performance', label: 'Performance' },
    { href: '#strategy', label: 'Strategy' },
    { href: '#contact', label: 'Contact' }
  ];

  return (
    <>
      {/* Desktop Nav */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className={`fixed top-6 left-1/2 -translate-x-1/2 z-[100] hidden md:flex items-center gap-1 px-2 py-2 rounded-full transition-all duration-300 ${
          isScrolled 
            ? 'bg-black/80 backdrop-blur-xl border border-white/10 shadow-lg' 
            : 'bg-black/30 backdrop-blur-md border border-white/5'
        }`}
        data-testid="desktop-nav"
      >
        {/* Logo */}
        <a href="#" className="flex items-center gap-2 px-4 py-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#D4AF37] to-[#B5952F] flex items-center justify-center">
            <span className="text-black font-bold text-sm">A</span>
          </div>
          <span className="font-display font-bold text-lg">Aurum</span>
        </a>

        {/* Divider */}
        <div className="w-px h-6 bg-white/10" />

        {/* Links */}
        {navLinks.map((link) => (
          <a
            key={link.href}
            href={link.href}
            data-testid={`nav-link-${link.label.toLowerCase()}`}
            className="px-4 py-2 text-sm text-slate-300 hover:text-white transition-colors rounded-full hover:bg-white/5"
          >
            {link.label}
          </a>
        ))}

        {/* CTA */}
        <a
          href="#contact"
          data-testid="nav-cta-btn"
          className="ml-2 px-5 py-2 bg-[#D4AF37] text-black text-sm font-semibold rounded-full hover:bg-[#B5952F] transition-colors"
        >
          Get Access
        </a>
      </motion.nav>

      {/* Mobile Nav */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-[100]" data-testid="mobile-nav">
        <div className={`flex items-center justify-between px-4 py-4 transition-all ${
          isScrolled ? 'bg-black/90 backdrop-blur-xl' : ''
        }`}>
          <a href="#" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#D4AF37] to-[#B5952F] flex items-center justify-center">
              <span className="text-black font-bold text-sm">A</span>
            </div>
            <span className="font-display font-bold">Aurum Quant</span>
          </a>
          
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            data-testid="mobile-menu-btn"
            className="p-2 rounded-lg bg-white/5 border border-white/10"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-black/95 backdrop-blur-xl border-b border-white/10 overflow-hidden"
            >
              <div className="px-4 py-6 space-y-4">
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block py-2 text-lg text-slate-300 hover:text-white"
                  >
                    {link.label}
                  </a>
                ))}
                <a
                  href="#contact"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block w-full py-3 bg-[#D4AF37] text-black text-center font-semibold rounded-full mt-4"
                >
                  Get Access
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default Navbar;
