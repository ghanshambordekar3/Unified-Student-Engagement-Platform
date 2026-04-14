import { GraduationCap, Menu, X, ArrowRight, Sparkles } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

const navLinks = [
  { label: 'Features',   href: '#features' },
  { label: 'How It Works', href: '#how' },
  { label: 'Stats',      href: '#stats' },
];

export default function LandingNavbar() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on resize
  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 768) setMenuOpen(false); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const scrollTo = (href) => {
    setMenuOpen(false);
    if (href.startsWith('#')) {
      document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <motion.nav
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-400 ${
        scrolled
          ? 'py-2 bg-white/90 backdrop-blur-xl border-b border-gray-100 shadow-sm shadow-gray-100/80'
          : 'py-4 bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-5 md:px-8 flex items-center justify-between gap-6">

        {/* ── Logo ── */}
        <Link to="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-teal-400 to-blue-500 rounded-xl blur-md opacity-40 group-hover:opacity-70 transition-opacity duration-300" />
            <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center shadow-md">
              <GraduationCap size={18} className="text-white" />
            </div>
          </div>
          <span className="text-lg font-black text-gray-900 tracking-tight">
            Edu<span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-cyan-500">Path</span>
          </span>
        </Link>

        {/* ── Desktop Links ── */}
        <div className="hidden md:flex items-center gap-1 flex-1 justify-center">
          {navLinks.map((link) => (
            <button
              key={link.label}
              onClick={() => scrollTo(link.href)}
              className="px-4 py-2 rounded-lg text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200"
            >
              {link.label}
            </button>
          ))}
          <a
            href="https://github.com/Vaibhav01-bit/Unified-Student-Engagement-Platform"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200"
          >
            GitHub
          </a>
        </div>

        {/* ── Desktop CTA ── */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
          <Link to="/onboarding">
            <button className="text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors duration-200 px-4 py-2">
              Sign in
            </button>
          </Link>
          <Link to="/onboarding">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="relative px-5 py-2.5 rounded-xl text-sm font-bold text-white overflow-hidden group shadow-md shadow-teal-500/20"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-teal-500 to-blue-600 transition-all duration-300 group-hover:from-teal-400 group-hover:to-blue-500" />
              <span className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/15 to-transparent pointer-events-none" />
              <span className="relative flex items-center gap-1.5">
                Get Started <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
              </span>
            </motion.button>
          </Link>
        </div>

        {/* ── Mobile Toggle ── */}
        <button
          className={`md:hidden w-9 h-9 flex items-center justify-center rounded-lg transition-all duration-200 ${
            menuOpen ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
          }`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* ── Mobile Menu ── */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="md:hidden mx-4 mt-2 rounded-2xl bg-white border border-gray-100 shadow-xl shadow-gray-200/60 p-4 flex flex-col gap-1"
          >
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => scrollTo(link.href)}
                className="text-left text-sm font-medium text-gray-600 hover:text-gray-900 px-4 py-2.5 rounded-xl hover:bg-gray-50 transition-all duration-200"
              >
                {link.label}
              </button>
            ))}
            <a
              href="https://github.com/Vaibhav01-bit/Unified-Student-Engagement-Platform"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 px-4 py-2.5 rounded-xl hover:bg-gray-50 transition-all"
            >
              GitHub
            </a>
            <div className="h-px bg-gray-100 my-1" />
            <Link to="/onboarding" onClick={() => setMenuOpen(false)}>
              <button className="w-full px-5 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-teal-500 to-blue-600 shadow-md shadow-teal-500/20 flex items-center justify-center gap-2">
                Get Started <ArrowRight size={14} />
              </button>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
