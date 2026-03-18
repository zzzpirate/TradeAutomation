import React from 'react';
import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';
import { testimonials } from '../data/mockData';

const Testimonials = () => {
  return (
    <section className="relative py-24 md:py-32">
      {/* Background Accent */}
      <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-[#D4AF37]/5 rounded-full blur-3xl -translate-y-1/2" />
      
      <div className="container-custom relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-[#D4AF37] text-sm font-medium tracking-wider uppercase mb-4 block">
            Feedback
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
            What Users <span className="text-[#D4AF37]">Say</span>
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Perspectives from traders who have evaluated our systematic approach.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="glass-card p-6 md:p-8 relative"
            >
              {/* Quote Icon */}
              <div className="absolute -top-3 -left-3 p-2 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/20">
                <Quote size={16} className="text-[#D4AF37]" />
              </div>
              
              <p className="text-slate-300 leading-relaxed mb-6 pt-4">
                "{testimonial.quote}"
              </p>
              
              <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#B5952F] flex items-center justify-center text-black font-semibold text-sm">
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="font-medium text-white">{testimonial.author}</div>
                  <div className="text-sm text-slate-500">{testimonial.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Disclaimer */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center text-xs text-slate-600 mt-8"
        >
          * Sample testimonials for demonstration purposes. Individual results may vary.
        </motion.p>
      </div>
    </section>
  );
};

export default Testimonials;
