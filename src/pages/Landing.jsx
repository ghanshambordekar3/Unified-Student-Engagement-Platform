import { useNavigate } from 'react-router-dom';
import {
  GraduationCap, ArrowRight, Sparkles, Shield,
  Bot, DollarSign, CreditCard, FileText, BarChart2, CalendarCheck,
  Globe, Users, Award, TrendingUp, ChevronDown
} from 'lucide-react';
import {
  motion, useScroll, useTransform, useSpring,
  useMotionValue, useInView, useAnimation
} from 'framer-motion';
import { useRef, useEffect, useState, useCallback } from 'react';
import LandingNavbar from '../components/LandingNavbar';
import { Tilt3D } from '../components/ui/Tilt3D';

/* ───────────── DATA ───────────── */
const features = [
  {
    icon: Bot,
    title: 'AI Career Chatbot',
    description: 'Conversational AI that guides you through university selection, course fit, and career projections.',
    gradient: 'from-violet-500 to-purple-600',
    glow: 'rgba(139,92,246,0.35)',
    tag: 'AI Powered',
  },
  {
    icon: DollarSign,
    title: 'ROI Calculator',
    description: 'Model your total education cost against projected 5-year salary returns — instantly.',
    gradient: 'from-emerald-400 to-teal-600',
    glow: 'rgba(20,184,166,0.35)',
    tag: 'Finance',
  },
  {
    icon: CreditCard,
    title: 'Loan Planning',
    description: 'Real-time EMI estimates, eligibility checks, and interest comparison across lenders.',
    gradient: 'from-blue-400 to-blue-600',
    glow: 'rgba(59,130,246,0.35)',
    tag: 'Smart Finance',
  },
  {
    icon: FileText,
    title: 'SOP Generator',
    description: 'AI writes a compelling, personalized Statement of Purpose aligned to your profile.',
    gradient: 'from-amber-400 to-orange-500',
    glow: 'rgba(251,191,36,0.35)',
    tag: 'AI Writing',
  },
  {
    icon: BarChart2,
    title: 'Admission Predictor',
    description: 'Data-driven probability scores for your shortlisted universities and programs.',
    gradient: 'from-pink-400 to-rose-600',
    glow: 'rgba(244,63,94,0.35)',
    tag: 'Analytics',
  },
  {
    icon: CalendarCheck,
    title: 'Timeline Tracker',
    description: 'Smart deadline management so you never miss a LOR request or application window.',
    gradient: 'from-cyan-400 to-sky-600',
    glow: 'rgba(6,182,212,0.35)',
    tag: 'Planning',
  },
];

const stats = [
  { value: 50, suffix: 'K+', label: 'Students Guided', icon: Users },
  { value: 200, suffix: '+', label: 'Universities Covered', icon: Globe },
  { value: 95, suffix: '%', label: 'Satisfaction Rate', icon: Award },
  { value: 3, suffix: 'x', label: 'Better Outcomes', icon: TrendingUp },
];

const processSteps = [
  { num: '01', title: 'Build Your Profile', desc: 'Tell us your academic background, target countries, and budget.' },
  { num: '02', title: 'Explore & Predict', desc: 'Get AI-matched universities with real admission odds.' },
  { num: '03', title: 'Plan Finances', desc: 'Calculate ROI, secure loans, and simulate your future salary.' },
  { num: '04', title: 'Apply with Confidence', desc: 'Generate your SOP, track deadlines, earn rewards as you go.' },
];

/* ───────────── ANIMATED COUNTER ───────────── */
function AnimatedCounter({ value, suffix }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const duration = 1800;
    const step = 16;
    const increment = value / (duration / step);
    const timer = setInterval(() => {
      start += increment;
      if (start >= value) {
        setDisplay(value);
        clearInterval(timer);
      } else {
        setDisplay(Math.floor(start));
      }
    }, step);
    return () => clearInterval(timer);
  }, [isInView, value]);

  return (
    <span ref={ref} className="tabular-nums">
      {display}{suffix}
    </span>
  );
}

/* ───────────── WORD REVEAL ───────────── */
function WordReveal({ text, className = '', delay = 0 }) {
  const words = text.split(' ');
  return (
    <span className={className} style={{ display: 'inline', flexWrap: 'wrap' }}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 40, filter: 'blur(8px)' }}
          whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, delay: delay + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
          className="inline-block mr-[0.25em]"
        >
          {word}
        </motion.span>
      ))}
    </span>
  );
}

/* ───────────── 3D FLOATING ORB ───────────── */
function FloatingOrb() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none" aria-hidden>
      {/* Outer glow ring */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
        className="absolute w-[520px] h-[520px] rounded-full border border-teal-500/10"
        style={{ borderStyle: 'dashed' }}
      />
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        className="absolute w-[380px] h-[380px] rounded-full border border-blue-500/15"
        style={{ borderStyle: 'dashed' }}
      />
      {/* Glowing core */}
      <motion.div
        animate={{ scale: [1, 1.07, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute w-[220px] h-[220px] rounded-full"
        style={{
          background: 'radial-gradient(circle at 40% 35%, rgba(45,212,191,0.25), rgba(99,102,241,0.18) 60%, transparent)',
          filter: 'blur(30px)',
        }}
      />
      {/* Orbiting dots */}
      {[0, 60, 120, 180, 240, 300].map((deg, i) => (
        <motion.div
          key={i}
          animate={{ rotate: 360 }}
          transition={{ duration: 10 + i * 2, repeat: Infinity, ease: 'linear', delay: i * 0.4 }}
          className="absolute w-[280px] h-[280px]"
          style={{ transformOrigin: 'center center' }}
        >
          <div
            className="absolute w-2 h-2 rounded-full"
            style={{
              top: '0%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              background: i % 2 === 0
                ? 'rgba(45,212,191,0.9)'
                : 'rgba(99,102,241,0.9)',
              boxShadow: i % 2 === 0
                ? '0 0 10px rgba(45,212,191,0.8)'
                : '0 0 10px rgba(99,102,241,0.8)',
            }}
          />
        </motion.div>
      ))}
    </div>
  );
}

/* ───────────── PARTICLE GRID ───────────── */
function ParticleGrid() {
  const particles = Array.from({ length: 60 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2 + 0.5,
    delay: Math.random() * 5,
    duration: 4 + Math.random() * 4,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-teal-400/30"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size }}
          animate={{ opacity: [0.1, 0.6, 0.1], scale: [1, 1.5, 1] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
      {/* Grid lines */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.04]">
        <defs>
          <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
    </div>
  );
}

/* ───────────── MAGNETIC BUTTON ───────────── */
function MagneticButton({ children, onClick, className = '' }) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 200, damping: 15 });
  const springY = useSpring(y, { stiffness: 200, damping: 15 });

  const handleMouseMove = useCallback((e) => {
    const rect = ref.current.getBoundingClientRect();
    const dx = e.clientX - (rect.left + rect.width / 2);
    const dy = e.clientY - (rect.top + rect.height / 2);
    x.set(dx * 0.35);
    y.set(dy * 0.35);
  }, [x, y]);

  const handleMouseLeave = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  return (
    <motion.button
      ref={ref}
      style={{ x: springX, y: springY }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileTap={{ scale: 0.94 }}
      onClick={onClick}
      className={`relative group overflow-hidden ${className}`}
    >
      {/* Ripple bg */}
      <span className="absolute inset-0 bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-600 transition-all duration-300" />
      <span className="absolute inset-0 bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      {/* Top gloss */}
      <span className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
      {/* Shimmer sweep */}
      <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none" />
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
    </motion.button>
  );
}

/* ───────────── FEATURE CARD ───────────── */
function FeatureCard({ feature, index }) {
  const Icon = feature.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.6, delay: index * 0.09, ease: [0.22, 1, 0.36, 1] }}
    >
      <Tilt3D tiltMaxAngle={12} className="h-full">
        <div
          className="relative h-full rounded-2xl border border-white/8 bg-gray-900/60 backdrop-blur-sm p-7 overflow-hidden group cursor-default transition-all duration-300 hover:border-white/15"
          style={{ '--glow': feature.glow }}
        >
          {/* Hover glow */}
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"
            style={{ background: `radial-gradient(circle at 30% 20%, ${feature.glow}, transparent 70%)` }}
          />
          {/* Corner badge */}
          <span className="absolute top-4 right-4 text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-gray-400">
            {feature.tag}
          </span>
          {/* Icon */}
          <div className={`relative mb-5 w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center shadow-lg`}
            style={{ boxShadow: `0 8px 24px ${feature.glow}` }}>
            <Icon size={22} className="text-white" />
          </div>
          <h3 className="text-base font-bold text-white mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-300 transition-all duration-300">
            {feature.title}
          </h3>
          <p className="text-sm text-gray-400 leading-relaxed">{feature.description}</p>

          {/* Bottom border glow on hover */}
          <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
        </div>
      </Tilt3D>
    </motion.div>
  );
}

/* ───────────── MAIN COMPONENT ───────────── */
export default function Landing() {
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <div className="min-h-screen bg-[#060912] relative overflow-hidden font-sans">
      <LandingNavbar />

      {/* ── Global Background ── */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden>
        <div className="absolute top-0 left-1/4 w-[700px] h-[700px] bg-teal-500/10 rounded-full blur-[160px]" />
        <div className="absolute bottom-1/4 right-1/5 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[140px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-violet-600/6 rounded-full blur-[200px]" />
      </div>

      <ParticleGrid />

      {/* ══════════ HERO ══════════ */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-24 pb-16 overflow-hidden"
      >
        <FloatingOrb />

        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative z-10 max-w-5xl mx-auto text-center"
        >
          {/* Eyebrow badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="mb-8 inline-flex"
          >
            <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-semibold text-teal-300 backdrop-blur-md">
              <motion.span
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Sparkles size={15} />
              </motion.span>
              AI-Powered Study Abroad Platform
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
            </span>
          </motion.div>

          {/* Headline — word-by-word */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black leading-[1.05] tracking-tight text-white mb-6">
            <WordReveal text="Plan Your Dream" className="block" delay={0.1} />
            <span className="block mt-1">
              <WordReveal text="Education" className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-cyan-300 to-blue-500" delay={0.35} />
              <motion.span
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7, duration: 0.6 }}
                className="ml-4 text-white"
              >
                Journey
              </motion.span>
            </span>
          </h1>

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed"
          >
            One unified AI platform for career guidance, ROI calculations, loan planning,
            and smart application tracking. Your future abroad, simplified.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <MagneticButton
              onClick={() => navigate('/onboarding')}
              className="px-10 py-4 rounded-2xl text-base font-bold text-white shadow-2xl shadow-teal-500/25 hover:shadow-teal-500/40 transition-shadow duration-300"
            >
              Start Your Journey
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform duration-200" />
            </MagneticButton>

            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-10 py-4 rounded-2xl text-base font-semibold text-gray-300 border border-white/10 hover:border-white/25 hover:text-white hover:bg-white/5 backdrop-blur-sm transition-all duration-300"
            >
              See Features
            </motion.button>
          </motion.div>

          {/* Scroll hint */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 0.6 }}
            className="mt-16 flex flex-col items-center gap-2 text-gray-600"
          >
            <span className="text-xs tracking-widest uppercase">Scroll to explore</span>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
            >
              <ChevronDown size={18} />
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Hero bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#060912] to-transparent pointer-events-none" />
      </section>

      {/* ══════════ STATS ══════════ */}
      <section id="stats" className="relative py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="relative rounded-3xl border border-white/8 bg-white/3 backdrop-blur-sm p-10">
            {/* Decorative line */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-teal-500/50 to-transparent" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    className="text-center flex flex-col items-center gap-3"
                  >
                    <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center">
                      <Icon size={18} className="text-teal-400" />
                    </div>
                    <div className="text-3xl md:text-4xl font-black text-white">
                      <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                    </div>
                    <p className="text-sm text-gray-500">{stat.label}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ FEATURES ══════════ */}
      <section id="features" className="relative py-28 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Section header */}
          <div className="text-center mb-20">
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="inline-block text-xs font-bold tracking-widest uppercase text-teal-400 mb-4 px-4 py-1.5 rounded-full border border-teal-500/20 bg-teal-500/5"
            >
              Everything You Need
            </motion.span>
            <h2 className="text-4xl md:text-6xl font-black text-white leading-tight">
              <WordReveal text="Six Powerful Tools." delay={0} />
              <br />
              <WordReveal
                text="One Platform."
                className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500"
                delay={0.25}
              />
            </h2>
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="mt-5 text-gray-400 text-lg max-w-xl mx-auto"
            >
              From initial research to final acceptance — every step handled.
            </motion.p>
          </div>

          {/* Feature grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <FeatureCard key={i} feature={f} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ HOW IT WORKS ══════════ */}
      <section className="relative py-28 px-6 overflow-hidden">
        {/* Decorative side glow */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-96 h-96 bg-teal-500/8 rounded-full blur-[120px] pointer-events-none" />
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <motion.span
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="inline-block text-xs font-bold tracking-widest uppercase text-blue-400 mb-4 px-4 py-1.5 rounded-full border border-blue-500/20 bg-blue-500/5"
            >
              The Process
            </motion.span>
            <h2 className="text-4xl md:text-5xl font-black text-white">
              <WordReveal text="Four Steps to Your" delay={0} />
              <br />
              <WordReveal
                text="Dream University"
                className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400"
                delay={0.2}
              />
            </h2>
          </div>

          <div className="relative">
            {/* Connecting line */}
            <div className="absolute left-[calc(50%-1px)] top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent hidden md:block" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {processSteps.map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: i % 2 === 0 ? -40 : 40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: 0.7, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                  className={`flex gap-5 items-start ${i % 2 === 1 ? 'md:flex-row-reverse md:text-right' : ''}`}
                >
                  <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-white/4 border border-white/10 flex items-center justify-center">
                    <span className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-br from-teal-400 to-blue-500">
                      {step.num}
                    </span>
                  </div>
                  <div className="pt-1">
                    <h3 className="text-lg font-bold text-white mb-1.5">{step.title}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">{step.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ CTA BANNER ══════════ */}
      <section className="relative py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="relative rounded-3xl overflow-hidden"
          >
            {/* Animated mesh gradient background */}
            <div className="absolute inset-0">
              <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-900 to-gray-900" />
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
                className="absolute -top-1/2 -left-1/2 w-full h-full rounded-full"
                style={{ background: 'conic-gradient(from 0deg, rgba(45,212,191,0.15), rgba(99,102,241,0.15), rgba(59,130,246,0.1), rgba(45,212,191,0.15))' }}
              />
              <div className="absolute inset-0 backdrop-blur-3xl" />
            </div>
            {/* Border */}
            <div className="absolute inset-0 rounded-3xl border border-white/10" />
            {/* Top line */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-teal-400/60 to-transparent" />

            <div className="relative z-10 p-12 md:p-20 text-center">
              <motion.div
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="inline-flex mb-6"
              >
                <span className="text-5xl">🎓</span>
              </motion.div>
              <h2 className="text-3xl md:text-5xl font-black text-white mb-5 leading-tight">
                <WordReveal text="Your Dream Education" delay={0} />
                <br />
                <WordReveal
                  text="Awaits You"
                  className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-cyan-300 to-blue-500"
                  delay={0.2}
                />
              </h2>
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="text-gray-400 text-lg mb-10 max-w-lg mx-auto"
              >
                Join 50,000+ students who turned their study abroad dreams into accepted offers.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6, duration: 0.6 }}
                className="flex flex-col sm:flex-row gap-4 justify-center"
              >
                <MagneticButton
                  onClick={() => navigate('/onboarding')}
                  className="px-12 py-4 rounded-2xl text-lg font-bold text-white shadow-2xl shadow-teal-500/30"
                >
                  Get Started — Free
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform duration-200" />
                </MagneticButton>
              </motion.div>
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.8, duration: 0.5 }}
                className="mt-5 text-xs text-gray-600 flex items-center justify-center gap-2"
              >
                <Shield size={12} /> No credit card required · Fully private · Data never shared
              </motion.p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════ FOOTER ══════════ */}
      <footer className="relative py-12 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            {/* Brand */}
            <div className="flex items-center gap-3">
              <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center shadow-lg shadow-teal-500/20">
                <GraduationCap size={18} className="text-white" />
              </div>
              <span className="text-lg font-black text-white">
                Edu<span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-400">Path</span>
              </span>
            </div>

            {/* Links */}
            <div className="flex items-center gap-6 text-sm text-gray-500">
              {['About', 'Contact', 'Privacy Policy', 'Terms'].map(link => (
                <a key={link} href="#" className="hover:text-teal-400 transition-colors duration-200">{link}</a>
              ))}
            </div>

            {/* Trust badge */}
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/3 border border-white/8">
              <Shield className="text-teal-400" size={14} />
              <span className="text-xs text-gray-400 font-medium">Secure & Private</span>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-white/5 text-center">
            <p className="text-xs text-gray-600">
              © {new Date().getFullYear()} EduPath. Built for ambitious students worldwide. 🌍
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
