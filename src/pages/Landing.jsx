import { useNavigate } from 'react-router-dom';
import {
  GraduationCap, ArrowRight, Sparkles, Shield,
  Bot, DollarSign, CreditCard, FileText, BarChart2, CalendarCheck,
  Globe, Users, Award, TrendingUp, ChevronDown, CheckCircle2, Star,
  Zap, BookOpen, Target
} from 'lucide-react';
import {
  motion, useScroll, useTransform, useSpring, useMotionValue, useInView
} from 'framer-motion';
import { useRef, useEffect, useState, useCallback } from 'react';
import LandingNavbar from '../components/LandingNavbar';
import { Tilt3D } from '../components/ui/Tilt3D';

/* ─── DATA ──────────────────────────────────────────────────────────── */
const features = [
  {
    icon: Bot,
    title: 'AI Career Chatbot',
    description: 'Conversational AI that guides you through university selection, course fit, and career projections — available 24/7.',
    gradient: 'from-violet-500 to-purple-600',
    glow: 'rgba(139,92,246,0.10)',
    lightBg: 'bg-violet-50', border: 'border-violet-100',
    tag: 'AI Powered', tagColor: 'bg-violet-50 text-violet-600 border-violet-100',
  },
  {
    icon: DollarSign,
    title: 'ROI Calculator',
    description: 'Model your total education cost against projected 5-year salary returns with instant visual breakdowns.',
    gradient: 'from-emerald-400 to-teal-600',
    glow: 'rgba(20,184,166,0.10)',
    lightBg: 'bg-teal-50', border: 'border-teal-100',
    tag: 'Finance', tagColor: 'bg-teal-50 text-teal-600 border-teal-100',
  },
  {
    icon: CreditCard,
    title: 'Loan Planning',
    description: 'Real-time EMI estimates, eligibility checks, and interest rate comparison across leading lenders.',
    gradient: 'from-blue-400 to-blue-600',
    glow: 'rgba(59,130,246,0.10)',
    lightBg: 'bg-blue-50', border: 'border-blue-100',
    tag: 'Smart Finance', tagColor: 'bg-blue-50 text-blue-600 border-blue-100',
  },
  {
    icon: FileText,
    title: 'SOP Generator',
    description: 'AI writes a compelling, personalized Statement of Purpose tailored to each university and program.',
    gradient: 'from-amber-400 to-orange-500',
    glow: 'rgba(251,191,36,0.10)',
    lightBg: 'bg-amber-50', border: 'border-amber-100',
    tag: 'AI Writing', tagColor: 'bg-amber-50 text-amber-600 border-amber-100',
  },
  {
    icon: BarChart2,
    title: 'Admission Predictor',
    description: 'Data-driven probability scores for your shortlisted universities — know your chances before you apply.',
    gradient: 'from-pink-400 to-rose-600',
    glow: 'rgba(244,63,94,0.10)',
    lightBg: 'bg-rose-50', border: 'border-rose-100',
    tag: 'Analytics', tagColor: 'bg-rose-50 text-rose-600 border-rose-100',
  },
  {
    icon: CalendarCheck,
    title: 'Timeline Tracker',
    description: 'Smart deadline management so you never miss a LOR request, test deadline, or application window.',
    gradient: 'from-cyan-400 to-sky-600',
    glow: 'rgba(6,182,212,0.10)',
    lightBg: 'bg-cyan-50', border: 'border-cyan-100',
    tag: 'Planning', tagColor: 'bg-cyan-50 text-cyan-600 border-cyan-100',
  },
];

const stats = [
  { value: 50,  suffix: 'K+', label: 'Students Guided',     icon: Users,      color: 'text-teal-600',   bg: 'bg-teal-50',   border: 'border-teal-100'   },
  { value: 200, suffix: '+',  label: 'Universities Covered', icon: Globe,      color: 'text-blue-600',   bg: 'bg-blue-50',   border: 'border-blue-100'   },
  { value: 95,  suffix: '%',  label: 'Satisfaction Rate',    icon: Award,      color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100' },
  { value: 3,   suffix: 'x',  label: 'Better Outcomes',      icon: TrendingUp, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100' },
];

const processSteps = [
  {
    num: '01', icon: BookOpen, title: 'Build Your Profile',
    desc: 'Tell us your academic background, preferred countries, target programs, and budget range.',
    color: 'from-teal-400 to-cyan-500', bg: 'bg-teal-50', border: 'border-teal-100',
  },
  {
    num: '02', icon: Target, title: 'Explore & Predict',
    desc: 'Get AI-matched universities with real-time admission probability scores for each program.',
    color: 'from-blue-400 to-indigo-500', bg: 'bg-blue-50', border: 'border-blue-100',
  },
  {
    num: '03', icon: DollarSign, title: 'Plan Your Finances',
    desc: 'Calculate ROI, secure the best loan offers, and simulate your 5-year post-graduation salary.',
    color: 'from-purple-400 to-pink-500', bg: 'bg-purple-50', border: 'border-purple-100',
  },
  {
    num: '04', icon: Zap, title: 'Apply with Confidence',
    desc: 'Generate a compelling SOP, track deadlines, and earn XP rewards as you complete each step.',
    color: 'from-orange-400 to-amber-500', bg: 'bg-orange-50', border: 'border-orange-100',
  },
];

const testimonials = [
  { name: 'Priya M.',    course: 'MS Computer Science · Canada',    text: 'EduPath helped me secure a ₹40L loan and write my SOP in under 2 hours. Got into UofT!', stars: 5 },
  { name: 'Rahul K.',   course: 'MBA · United Kingdom',             text: 'The admission predictor was spot-on. I applied to the right universities and got 3 offers.', stars: 5 },
  { name: 'Anjali S.',  course: 'MS Data Science · Germany',        text: 'The ROI calculator showed me Germany was 60% cheaper than the US for the same quality.', stars: 5 },
];

const trustBadges = [
  '🔒 Bank-grade security',
  '🌍 50,000+ students',
  '🏆 95% satisfaction',
  '⚡ AI-powered',
  '📱 Works on all devices',
  '🆓 Free to start',
];

/* ─── ANIMATED COUNTER ───────────────────────────────────────────────── */
function AnimatedCounter({ value, suffix }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const step = 16;
    const inc = value / (1600 / step);
    const timer = setInterval(() => {
      start += inc;
      if (start >= value) { setDisplay(value); clearInterval(timer); }
      else setDisplay(Math.floor(start));
    }, step);
    return () => clearInterval(timer);
  }, [isInView, value]);

  return <span ref={ref} className="tabular-nums">{display}{suffix}</span>;
}

/* ─── WORD REVEAL ────────────────────────────────────────────────────── */
function WordReveal({ text, className = '', delay = 0 }) {
  return (
    <span className={className} style={{ display: 'inline' }}>
      {text.split(' ').map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5, delay: delay + i * 0.065, ease: [0.22, 1, 0.36, 1] }}
          className="inline-block mr-[0.25em]"
        >
          {word}
        </motion.span>
      ))}
    </span>
  );
}

/* ─── AMBIENT ORBS ───────────────────────────────────────────────────── */
function AmbientOrbs() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 45, repeat: Infinity, ease: 'linear' }}
        className="absolute w-[580px] h-[580px] rounded-full border border-teal-200/30"
        style={{ borderStyle: 'dashed' }}
      />
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
        className="absolute w-[400px] h-[400px] rounded-full border border-blue-200/20"
        style={{ borderStyle: 'dashed' }}
      />
      <motion.div
        animate={{ scale: [1, 1.05, 1], opacity: [0.35, 0.65, 0.35] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute w-[300px] h-[300px] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(20,184,166,0.14) 0%, rgba(99,102,241,0.08) 55%, transparent 80%)', filter: 'blur(40px)' }}
      />
      {[0, 72, 144, 216, 288].map((_, i) => (
        <motion.div
          key={i}
          animate={{ rotate: 360 }}
          transition={{ duration: 14 + i * 3, repeat: Infinity, ease: 'linear', delay: i * 0.6 }}
          className="absolute w-[310px] h-[310px]"
        >
          <div
            className="absolute w-1.5 h-1.5 rounded-full top-0 left-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{
              background: i % 2 === 0 ? 'rgba(20,184,166,0.6)' : 'rgba(99,102,241,0.6)',
              boxShadow: i % 2 === 0 ? '0 0 6px rgba(20,184,166,0.4)' : '0 0 6px rgba(99,102,241,0.4)',
            }}
          />
        </motion.div>
      ))}
    </div>
  );
}

/* ─── DOT GRID ───────────────────────────────────────────────────────── */
function DotGrid() {
  return (
    <div className="absolute inset-0 pointer-events-none" aria-hidden>
      <svg className="absolute inset-0 w-full h-full opacity-[0.03]">
        <defs>
          <pattern id="dots-lg" width="28" height="28" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1" fill="#64748b" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dots-lg)" />
      </svg>
    </div>
  );
}

/* ─── MAGNETIC BUTTON ────────────────────────────────────────────────── */
function MagneticButton({ children, onClick, className = '' }) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 180, damping: 18 });
  const sy = useSpring(y, { stiffness: 180, damping: 18 });

  const onMove = useCallback((e) => {
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * 0.28);
    y.set((e.clientY - (r.top + r.height / 2)) * 0.28);
  }, [x, y]);
  const onLeave = useCallback(() => { x.set(0); y.set(0); }, [x, y]);

  return (
    <motion.button
      ref={ref} style={{ x: sx, y: sy }}
      onMouseMove={onMove} onMouseLeave={onLeave}
      whileTap={{ scale: 0.95 }} onClick={onClick}
      className={`relative group overflow-hidden ${className}`}
    >
      <span className="absolute inset-0 bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-600" />
      <span className="absolute inset-0 bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <span className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
      <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none" />
      <span className="relative z-10 flex items-center justify-center gap-2">{children}</span>
    </motion.button>
  );
}

/* ─── FEATURE CARD ───────────────────────────────────────────────────── */
function FeatureCard({ feature, index }) {
  const Icon = feature.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ duration: 0.5, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
    >
      <Tilt3D tiltMaxAngle={9} className="h-full">
        <div className={`relative h-full rounded-2xl border bg-white p-6 overflow-hidden group cursor-default transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${feature.border}`}>
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"
            style={{ background: `radial-gradient(circle at 30% 20%, ${feature.glow}, transparent 70%)` }}
          />
          <span className={`absolute top-4 right-4 text-[9px] font-black px-2.5 py-1 rounded-full border uppercase tracking-widest ${feature.tagColor}`}>
            {feature.tag}
          </span>
          <div className={`mb-4 w-11 h-11 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center shadow-md`}>
            <Icon size={20} className="text-white" />
          </div>
          <h3 className="text-base font-black text-gray-900 mb-2">{feature.title}</h3>
          <p className="text-sm text-gray-500 leading-relaxed">{feature.description}</p>
          <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
        </div>
      </Tilt3D>
    </motion.div>
  );
}

/* ─── STAR RATING ────────────────────────────────────────────────────── */
function Stars({ count = 5 }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} size={12} className="fill-amber-400 text-amber-400" />
      ))}
    </div>
  );
}

/* ─── MAIN PAGE ──────────────────────────────────────────────────────── */
export default function Landing() {
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY       = useTransform(scrollYProgress, [0, 1], [0, 90]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  return (
    <div className="min-h-screen bg-white relative overflow-hidden font-sans">
      <LandingNavbar />

      {/* Global ambient layers */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden>
        <div className="absolute top-0 left-1/4 w-[700px] h-[600px] bg-teal-400/6 rounded-full blur-[180px]" />
        <div className="absolute bottom-1/4 right-0 w-[500px] h-[500px] bg-blue-400/6 rounded-full blur-[150px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[700px] bg-violet-400/4 rounded-full blur-[200px]" />
      </div>
      <DotGrid />

      {/* ════════════════════════════════════════
          HERO
      ════════════════════════════════════════ */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex flex-col items-center justify-center px-5 pt-24 pb-20 overflow-hidden"
      >
        <AmbientOrbs />

        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative z-10 max-w-4xl mx-auto text-center"
        >
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="mb-7 inline-flex"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-50 border border-teal-200 text-xs font-bold text-teal-700 tracking-wide uppercase">
              <motion.span animate={{ rotate: [0, 14, -14, 0] }} transition={{ duration: 2.5, repeat: Infinity }}>
                <Sparkles size={13} className="text-teal-500" />
              </motion.span>
              AI-Powered Study Abroad Platform
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
            </span>
          </motion.div>

          {/* Headline — clean hierarchy */}
          <h1 className="font-black tracking-tight text-gray-900 leading-[1.06] mb-6">
            <span className="block text-5xl md:text-6xl lg:text-7xl">
              <WordReveal text="Plan Your Dream" delay={0.08} />
            </span>
            <span className="block text-5xl md:text-6xl lg:text-7xl mt-1">
              <WordReveal
                text="Education Journey"
                className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-600"
                delay={0.28}
              />
            </span>
            <span className="block text-3xl md:text-4xl lg:text-5xl text-gray-400 font-bold mt-3">
              <WordReveal text="with AI on your side" delay={0.5} />
            </span>
          </h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.72, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="text-gray-500 text-lg md:text-xl max-w-2xl mx-auto mb-4 leading-relaxed"
          >
            One unified platform for career guidance, ROI calculations, loan planning, SOP writing, and smart application tracking.
          </motion.p>

          {/* Value props */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.85, duration: 0.5 }}
            className="flex flex-wrap justify-center gap-3 mb-10"
          >
            {['Free to start', 'No credit card', 'AI-powered', '50K+ students'].map((tag) => (
              <span key={tag} className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-full">
                <CheckCircle2 size={11} className="text-teal-500" /> {tag}
              </span>
            ))}
          </motion.div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.95, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col sm:flex-row gap-3 justify-center items-center"
          >
            <MagneticButton
              onClick={() => navigate('/onboarding')}
              className="px-9 py-4 rounded-2xl text-base font-bold text-white shadow-xl shadow-teal-500/20 hover:shadow-teal-500/35 transition-shadow duration-300"
            >
              Start for Free
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-200" />
            </MagneticButton>

            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-9 py-4 rounded-2xl text-base font-semibold text-gray-600 border border-gray-200 hover:border-teal-300 hover:text-teal-600 hover:bg-teal-50/50 transition-all duration-300"
            >
              See All Features
            </motion.button>
          </motion.div>

          {/* Scroll cue */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4, duration: 0.5 }}
            className="mt-16 flex flex-col items-center gap-1.5 text-gray-400"
          >
            <span className="text-[9px] tracking-[0.25em] uppercase font-semibold">Scroll to explore</span>
            <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}>
              <ChevronDown size={16} />
            </motion.div>
          </motion.div>
        </motion.div>

        <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-white to-transparent pointer-events-none" />
      </section>

      {/* ════════════════════════════════════════
          TRUST STRIP
      ════════════════════════════════════════ */}
      <section className="py-6 border-y border-gray-100 bg-gray-50/60 overflow-hidden">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-3">
            {trustBadges.map((badge, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06, duration: 0.4 }}
                className="text-xs font-semibold text-gray-500"
              >
                {badge}
              </motion.span>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          STATS
      ════════════════════════════════════════ */}
      <section id="stats" className="relative py-24 px-5">
        <div className="max-w-6xl mx-auto">
          {/* Section label */}
          <div className="text-center mb-14">
            <motion.span
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-[10px] font-black tracking-widest uppercase text-teal-600 bg-teal-50 border border-teal-100 px-4 py-1.5 rounded-full inline-block mb-4"
            >
              By the numbers
            </motion.span>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900">
              <WordReveal text="Trusted by students" delay={0} />
              <span className="block text-teal-500">
                <WordReveal text="across the globe" delay={0.15} />
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className={`bg-white border ${stat.border} rounded-2xl p-6 text-center flex flex-col items-center gap-3 shadow-sm hover:shadow-md transition-shadow duration-300`}
                >
                  <div className={`w-11 h-11 rounded-xl ${stat.bg} border ${stat.border} flex items-center justify-center`}>
                    <Icon size={18} className={stat.color} />
                  </div>
                  <div className={`text-4xl font-black ${stat.color}`}>
                    <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                  </div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">{stat.label}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          FEATURES
      ════════════════════════════════════════ */}
      <section id="features" className="relative py-28 px-5 bg-gray-50/40">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <motion.span
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-[10px] font-black tracking-widest uppercase text-blue-600 bg-blue-50 border border-blue-100 px-4 py-1.5 rounded-full inline-block mb-4"
            >
              Everything You Need
            </motion.span>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight mb-4">
              <WordReveal text="Six powerful tools." delay={0} />
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-blue-600">
                <WordReveal text="One platform." delay={0.2} />
              </span>
            </h2>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-gray-500 text-lg max-w-xl mx-auto"
            >
              From first research to final acceptance — every step is handled.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => <FeatureCard key={i} feature={f} index={i} />)}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          HOW IT WORKS
      ════════════════════════════════════════ */}
      <section id="how" className="relative py-28 px-5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <motion.span
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-[10px] font-black tracking-widest uppercase text-purple-600 bg-purple-50 border border-purple-100 px-4 py-1.5 rounded-full inline-block mb-4"
            >
              The Process
            </motion.span>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight">
              <WordReveal text="Four steps to your" delay={0} />
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-blue-500">
                <WordReveal text="dream university" delay={0.18} />
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {processSteps.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.5, delay: i * 0.09, ease: [0.22, 1, 0.36, 1] }}
                  className={`flex gap-5 items-start bg-white border ${step.border} rounded-2xl p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300`}
                >
                  <div className={`flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br ${step.color} flex flex-col items-center justify-center shadow-md gap-0.5`}>
                    <span className="text-[10px] font-black text-white/70 leading-none">{step.num}</span>
                    <Icon size={16} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-gray-900 mb-1.5">{step.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          TESTIMONIALS
      ════════════════════════════════════════ */}
      <section className="relative py-24 px-5 bg-gray-50/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <motion.span
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-[10px] font-black tracking-widest uppercase text-amber-600 bg-amber-50 border border-amber-100 px-4 py-1.5 rounded-full inline-block mb-4"
            >
              Student Stories
            </motion.span>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900">
              <WordReveal text="Real results from real students" delay={0} />
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.09, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col gap-4"
              >
                <Stars count={t.stars} />
                <p className="text-sm text-gray-600 leading-relaxed flex-1">"{t.text}"</p>
                <div>
                  <p className="text-sm font-black text-gray-900">{t.name}</p>
                  <p className="text-[11px] text-teal-600 font-semibold">{t.course}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          CTA BANNER
      ════════════════════════════════════════ */}
      <section className="relative py-24 px-5">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 28, scale: 0.98 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            className="relative rounded-3xl overflow-hidden border border-gray-100 shadow-2xl shadow-teal-500/8"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white via-teal-50/50 to-blue-50/40" />
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 35, repeat: Infinity, ease: 'linear' }}
              className="absolute -top-1/2 -left-1/2 w-full h-full rounded-full"
              style={{ background: 'conic-gradient(from 0deg, rgba(20,184,166,0.06), rgba(99,102,241,0.05), rgba(59,130,246,0.04), rgba(20,184,166,0.06))' }}
            />
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-teal-400/60 to-transparent" />

            <div className="relative z-10 p-12 md:p-20 text-center">
              <motion.div
                animate={{ scale: [1, 1.06, 1] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                className="inline-flex mb-6"
              >
                <span className="text-5xl">🎓</span>
              </motion.div>

              <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-4 leading-tight">
                <WordReveal text="Your dream university" delay={0} />
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-600">
                  <WordReveal text="is waiting for you" delay={0.18} />
                </span>
              </h2>

              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="text-gray-500 text-lg mb-8 max-w-lg mx-auto leading-relaxed"
              >
                Join 50,000+ students who turned their study abroad dreams into accepted offers — for free.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="flex flex-col sm:flex-row gap-3 justify-center mb-6"
              >
                <MagneticButton
                  onClick={() => navigate('/onboarding')}
                  className="px-12 py-4 rounded-2xl text-lg font-bold text-white shadow-xl shadow-teal-500/25"
                >
                  Get Started — It's Free
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform duration-200" />
                </MagneticButton>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.65, duration: 0.4 }}
                className="text-xs text-gray-400 flex items-center justify-center gap-2"
              >
                <Shield size={11} /> No credit card required · Fully private · Data never shared
              </motion.p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          FOOTER
      ════════════════════════════════════════ */}
      <footer className="relative py-12 px-5 border-t border-gray-100 bg-gray-50/50">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Brand */}
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center shadow-md">
                <GraduationCap size={17} className="text-white" />
              </div>
              <span className="text-lg font-black text-gray-900">
                Edu<span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-cyan-500">Path</span>
              </span>
            </div>

            {/* Links */}
            <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-2 text-sm text-gray-500">
              {['About', 'Contact', 'Privacy Policy', 'Terms'].map(link => (
                <a key={link} href="#" className="hover:text-teal-500 transition-colors duration-200">{link}</a>
              ))}
            </div>

            {/* Trust */}
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-100 shadow-sm">
              <Shield className="text-teal-500" size={13} />
              <span className="text-xs text-gray-500 font-semibold">Secure & Private</span>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-400">
              © {new Date().getFullYear()} EduPath · Built for ambitious students worldwide 🌍
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
