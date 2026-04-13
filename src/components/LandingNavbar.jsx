import { GraduationCap, Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Button } from './ui/Button';

export default function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'py-3 bg-gray-950/80 backdrop-blur-xl border-b border-white/5 shadow-2xl shadow-black/30'
          : 'py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-teal-400 to-blue-600 rounded-xl blur-md opacity-60 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center shadow-lg">
              <GraduationCap size={20} className="text-white" />
            </div>
          </div>
          <span className="text-xl font-black text-white tracking-tight">
            Edu<span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-400">Path</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          <a href="#features" className="text-sm font-medium text-gray-400 hover:text-white transition-colors duration-200">Features</a>
          <a href="#stats" className="text-sm font-medium text-gray-400 hover:text-white transition-colors duration-200">Why EduPath</a>
          <button
            onClick={() => window.open('https://github.com/Vaibhav01-bit/Unified-Student-Engagement-Platform', '_blank')}
            className="text-sm font-medium text-gray-400 hover:text-white transition-colors duration-200 px-4 py-2 rounded-lg hover:bg-white/5"
          >
            GitHub
          </button>
          <Link to="/onboarding">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative px-6 py-2.5 rounded-xl text-sm font-bold text-white overflow-hidden group"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-teal-500 to-blue-600 transition-all duration-300 group-hover:from-teal-400 group-hover:to-blue-500" />
              <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: 'radial-gradient(circle at 50% 0%, rgba(255,255,255,0.15), transparent 70%)' }}
              />
              <span className="relative">Start Journey →</span>
            </motion.button>
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden text-gray-400 hover:text-white"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden mt-2 mx-4 rounded-2xl bg-gray-900/95 backdrop-blur-xl border border-white/10 p-4 flex flex-col gap-3"
        >
          <a href="#features" className="text-sm text-gray-300 hover:text-white px-4 py-2 rounded-lg hover:bg-white/5 transition-all">Features</a>
          <a href="#stats" className="text-sm text-gray-300 hover:text-white px-4 py-2 rounded-lg hover:bg-white/5 transition-all">Why EduPath</a>
          <Link to="/onboarding" className="mt-1">
            <button className="w-full px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-teal-500 to-blue-600">
              Start Journey →
            </button>
          </Link>
        </motion.div>
      )}
    </motion.nav>
  );
}
