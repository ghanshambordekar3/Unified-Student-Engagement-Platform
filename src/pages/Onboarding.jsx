import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, User, BookOpen, Globe, DollarSign, ChevronRight, ChevronLeft, Check, Sparkles, School, Award, FileText, FlaskConical, Layers } from 'lucide-react';
import storage from '../utils/storage';
import { motion, AnimatePresence, useSpring, useTransform } from 'framer-motion';
import { PageTransition } from '../components/ui/PageTransition';
import { Button } from '../components/ui/Button';
import { GlassCard } from '../components/ui/GlassCard';
import { cn } from '../utils/cn';

const countries = ['Canada', 'UK', 'Australia', 'Germany', 'USA', 'Ireland', 'New Zealand', 'Netherlands'];
const courses = ['Computer Science', 'MBA', 'Data Science', 'Engineering', 'Medicine', 'Law', 'Arts & Humanities', 'Business'];

const qualifications = [
  { label: "Bachelor's Degree", value: "Bachelor's Degree", icon: School, desc: 'Undergraduate' },
  { label: "Master's Degree",   value: "Master's Degree",   icon: Award,  desc: 'Postgraduate' },
  { label: 'Diploma',           value: 'Diploma',           icon: FileText, desc: 'Vocational' },
  { label: '12th Grade',        value: '12th Grade',        icon: Layers, desc: 'Pre-university' },
  { label: 'PhD',               value: 'PhD',               icon: FlaskConical, desc: 'Doctoral' },
];

const steps = [
  { id: 1, title: 'Identity',   icon: User },
  { id: 2, title: 'Aspiration', icon: BookOpen },
  { id: 3, title: 'Ready',      icon: Check },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1); // 1 for next, -1 for back
  const [form, setForm] = useState({
    name: '',
    qualification: '',
    targetCourse: '',
    preferredCountries: [],
    budget: '',
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (step === 1) {
      if (!form.name.trim()) e.name = 'Name is required';
      if (!form.qualification) e.qualification = 'Please select your qualification';
    }
    if (step === 2) {
      if (!form.targetCourse) e.targetCourse = 'Please select a target course';
      if (form.preferredCountries.length === 0) e.preferredCountries = 'Select at least one country';
      if (!form.budget) e.budget = 'Please select a budget range';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (validate()) {
      if (step < 3) {
        setDirection(1);
        setStep(step + 1);
      }
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setDirection(-1);
      setStep(step - 1);
    }
  };

  const toggleCountry = (country) => {
    setForm((f) => ({
      ...f,
      preferredCountries: f.preferredCountries.includes(country)
        ? f.preferredCountries.filter((c) => c !== country)
        : [...f.preferredCountries, country],
    }));
  };

  const handleSubmit = () => {
    storage.set('edupath_profile', {
      ...form,
      createdAt: new Date().toISOString(),
    });
    storage.set('edupath_checklist_completed', []);
    navigate('/dashboard');
  };

  const stepVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 50 : -50,
      opacity: 0,
      scale: 0.98
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction < 0 ? 50 : -50,
      opacity: 0,
      scale: 0.98
    })
  };

  return (
    <PageTransition transitionKey="onboarding">
      <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">

        {/* Animated Background Mesh */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
          <motion.div
            animate={{ scale: [1, 1.25, 1], rotate: [0, 60, 0], opacity: [0.25, 0.45, 0.25] }}
            transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
            className="absolute top-[-15%] right-[-10%] w-[700px] h-[700px] rounded-full blur-[130px]"
            style={{ background: 'radial-gradient(circle, #5eead4 0%, #0ea5e9 60%, transparent 100%)' }}
          />
          <motion.div
            animate={{ scale: [1, 1.3, 1], rotate: [0, -50, 0], opacity: [0.15, 0.35, 0.15] }}
            transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute bottom-[-15%] left-[-10%] w-[600px] h-[600px] rounded-full blur-[110px]"
            style={{ background: 'radial-gradient(circle, #818cf8 0%, #38bdf8 60%, transparent 100%)' }}
          />
          {/* subtle grid overlay */}
          <div className="absolute inset-0" style={{
            backgroundImage: 'linear-gradient(rgba(99,102,241,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.03) 1px, transparent 1px)',
            backgroundSize: '48px 48px'
          }} />
        </div>

        <div className="w-full max-w-xl relative">
          {/* Logo & Header */}
          <motion.div
            initial={{ opacity: 0, y: -24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="text-center mb-10"
          >
            <div className="relative inline-block mb-4">
              <div className="inline-flex items-center justify-center w-[72px] h-[72px] rounded-[22px] bg-gradient-to-br from-blue-600 via-blue-500 to-teal-400 shadow-2xl shadow-teal-500/30">
                <GraduationCap size={34} className="text-white" />
              </div>
              <motion.div
                animate={{ scale: [1, 1.18, 1], opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -inset-1 rounded-[26px] bg-gradient-to-br from-blue-500/30 to-teal-400/30 blur-md -z-10"
              />
            </div>
            <h1 className="text-[2.6rem] font-black tracking-tight leading-none"
              style={{ background: 'linear-gradient(135deg,#1e293b 0%,#0f766e 100%)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
              EduPath
            </h1>
            <div className="flex items-center justify-center gap-2 mt-2">
              <Sparkles size={13} className="text-teal-500" />
              <p className="text-gray-400 font-bold uppercase tracking-[0.22em] text-[9px]">Your Future Navigator</p>
            </div>
          </motion.div>

          {/* ─── Premium Stepper ─── */}
          <div className="flex items-center justify-center mb-10">
            {steps.map((s, i) => (
              <div key={s.id} className="flex items-center">
                <div className="flex flex-col items-center gap-2">
                  <motion.div
                    animate={{
                      scale: step === s.id ? 1.12 : 1,
                      boxShadow: step === s.id
                        ? '0 0 0 4px rgba(20,184,166,0.18), 0 0 20px rgba(20,184,166,0.35)'
                        : '0 0 0 0px transparent'
                    }}
                    transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                    className={cn(
                      'w-11 h-11 rounded-2xl flex items-center justify-center border-2 transition-colors duration-300',
                      step > s.id
                        ? 'bg-gradient-to-br from-teal-500 to-emerald-400 border-teal-400 text-white'
                        : step === s.id
                        ? 'bg-white border-teal-500 text-teal-600'
                        : 'bg-gray-50 border-gray-200 text-gray-400'
                    )}
                  >
                    <AnimatePresence mode="wait">
                      {step > s.id ? (
                        <motion.div key="check" initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0 }}>
                          <Check size={18} strokeWidth={3} />
                        </motion.div>
                      ) : (
                        <motion.div key="icon" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                          <s.icon size={18} strokeWidth={2} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                  <span className={cn(
                    'text-[9px] font-black uppercase tracking-[0.18em] transition-colors duration-300',
                    step >= s.id ? 'text-teal-600' : 'text-gray-400'
                  )}>{s.title}</span>
                </div>
                {i < steps.length - 1 && (
                  <div className="w-14 h-[2px] mx-2 mb-6 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: step > s.id ? '100%' : 0 }}
                      transition={{ duration: 0.45, ease: 'easeOut' }}
                      className="h-full rounded-full bg-gradient-to-r from-teal-500 to-emerald-400"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Form Content */}
          <GlassCard className="p-0 overflow-hidden border-gray-200 shadow-3xl min-h-[420px] flex flex-col" hoverable={false}>
              <div className="p-8 flex-1">
                <AnimatePresence mode="wait" custom={direction}>
                  <motion.div
                    key={step}
                    custom={direction}
                    variants={stepVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                      x: { type: "spring", stiffness: 300, damping: 30 },
                      opacity: { duration: 0.2 }
                    }}
                    className="w-full h-full"
                  >
                    {step === 1 && (
                      <div className="space-y-7">
                        {/* Section header */}
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center shadow-md shadow-teal-400/30">
                              <User size={14} className="text-white" strokeWidth={2.5} />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-600">Step 1 of 3</span>
                          </div>
                          <h2 className="text-[1.75rem] font-black text-gray-900 leading-tight tracking-tight">
                            Who are <span style={{ background: 'linear-gradient(135deg, #0ea5e9, #14b8a6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>you?</span>
                          </h2>
                          <p className="text-gray-400 text-sm font-medium leading-relaxed">
                            Tell us a bit about yourself so we can personalise your journey.
                          </p>
                        </div>

                        {/* ─── Full Name Input ─── */}
                        <div className="space-y-2">
                          <label htmlFor="onboarding-name" className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-gray-500">
                            <User size={11} className="text-teal-500" />
                            Full Name
                          </label>
                          <motion.div
                            animate={errors.name ? { x: [0, -6, 6, -6, 6, 0] } : { x: 0 }}
                            transition={{ duration: 0.4 }}
                            className="relative group"
                          >
                            <div className="pointer-events-none absolute inset-y-0 left-5 flex items-center">
                              <User size={16} className={cn('transition-colors duration-200', form.name ? 'text-teal-500' : 'text-gray-400')} />
                            </div>
                            <input
                              id="onboarding-name"
                              type="text"
                              autoComplete="name"
                              className={cn(
                                'w-full rounded-2xl pl-12 pr-5 py-[15px] text-gray-900 font-semibold text-[15px] outline-none transition-all duration-200 bg-gray-50 border-2',
                                errors.name
                                  ? 'border-red-400 ring-4 ring-red-100 bg-red-50/40'
                                  : 'border-gray-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-100 focus:bg-white hover:border-gray-300'
                              )}
                              placeholder="e.g. Alexander Knight"
                              value={form.name}
                              onChange={(e) => setForm({ ...form, name: e.target.value })}
                            />
                            {/* live check */}
                            <AnimatePresence>
                              {form.name.trim().length > 1 && (
                                <motion.div
                                  initial={{ scale: 0, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  exit={{ scale: 0, opacity: 0 }}
                                  className="absolute inset-y-0 right-4 flex items-center"
                                >
                                  <div className="w-5 h-5 rounded-full bg-teal-500 flex items-center justify-center">
                                    <Check size={11} className="text-white" strokeWidth={3} />
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </motion.div>
                          <AnimatePresence>
                            {errors.name && (
                              <motion.p
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -4 }}
                                className="text-red-500 text-[11px] font-bold tracking-tight flex items-center gap-1"
                              >
                                <span className="inline-block w-1 h-1 rounded-full bg-red-500" />
                                {errors.name}
                              </motion.p>
                            )}
                          </AnimatePresence>
                        </div>

                        {/* ─── Qualification Cards ─── */}
                        <div className="space-y-3">
                          <label className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-gray-500">
                            <Award size={11} className="text-teal-500" />
                            Highest Qualification
                          </label>
                          <div className="grid grid-cols-1 gap-2.5">
                            {qualifications.map((q) => {
                              const Icon = q.icon;
                              const selected = form.qualification === q.value;
                              return (
                                <motion.button
                                  key={q.value}
                                  type="button"
                                  whileHover={{ scale: 1.015 }}
                                  whileTap={{ scale: 0.985 }}
                                  onClick={() => setForm({ ...form, qualification: q.value })}
                                  className={cn(
                                    'relative w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl border-2 text-left transition-all duration-200 overflow-hidden group',
                                    selected
                                      ? 'border-teal-500 bg-gradient-to-r from-teal-50 to-blue-50 shadow-lg shadow-teal-200/60'
                                      : 'border-gray-200 bg-gray-50 hover:border-teal-300 hover:bg-white hover:shadow-md'
                                  )}
                                >
                                  {/* selection stripe */}
                                  <AnimatePresence>
                                    {selected && (
                                      <motion.div
                                        initial={{ scaleY: 0 }}
                                        animate={{ scaleY: 1 }}
                                        exit={{ scaleY: 0 }}
                                        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl bg-gradient-to-b from-teal-500 to-blue-500"
                                        style={{ originY: 0.5 }}
                                      />
                                    )}
                                  </AnimatePresence>

                                  <div className={cn(
                                    'w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200',
                                    selected
                                      ? 'bg-gradient-to-br from-teal-500 to-blue-500 text-white shadow-md shadow-teal-400/40'
                                      : 'bg-gray-100 text-gray-500 group-hover:bg-teal-50 group-hover:text-teal-500'
                                  )}>
                                    <Icon size={17} strokeWidth={2} />
                                  </div>

                                  <div className="flex-1 min-w-0">
                                    <p className={cn(
                                      'text-sm font-bold leading-none transition-colors',
                                      selected ? 'text-gray-900' : 'text-gray-700'
                                    )}>{q.label}</p>
                                    <p className={cn(
                                      'text-[10px] font-semibold mt-0.5 transition-colors',
                                      selected ? 'text-teal-600' : 'text-gray-400'
                                    )}>{q.desc}</p>
                                  </div>

                                  <AnimatePresence>
                                    {selected && (
                                      <motion.div
                                        initial={{ scale: 0, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        exit={{ scale: 0, opacity: 0 }}
                                        className="w-5 h-5 rounded-full bg-teal-500 flex items-center justify-center shrink-0"
                                      >
                                        <Check size={11} className="text-white" strokeWidth={3} />
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </motion.button>
                              );
                            })}
                          </div>
                          <AnimatePresence>
                            {errors.qualification && (
                              <motion.p
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -4 }}
                                className="text-red-500 text-[11px] font-bold tracking-tight flex items-center gap-1"
                              >
                                <span className="inline-block w-1 h-1 rounded-full bg-red-500" />
                                {errors.qualification}
                              </motion.p>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    )}

                    {step === 2 && (
                      <div className="space-y-6">
                        <div className="space-y-1">
                          <h2 className="text-2xl font-black text-gray-900">The Aspiration</h2>
                          <p className="text-gray-500 text-sm font-medium">Where is your journey taking you?</p>
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-black uppercase tracking-widest text-gray-500">Discipline of Interest</label>
                          <select
                            id="onboarding-course"
                            className="w-full glass bg-gray-100 border border-gray-200 rounded-2xl px-5 py-4 text-gray-900 outline-none focus:border-teal-500 transition-all font-medium appearance-none"
                            value={form.targetCourse}
                            onChange={(e) => setForm({ ...form, targetCourse: e.target.value })}
                          >
                            <option value="" className="bg-gray-100">Select domain...</option>
                            {courses.map((c) => (
                              <option key={c} value={c} className="bg-gray-100">{c}</option>
                            ))}
                          </select>
                          {errors.targetCourse && <p className="text-red-500 text-xs font-bold tracking-tight">{errors.targetCourse}</p>}
                        </div>

                        <div className="space-y-3">
                          <label className="text-xs font-black uppercase tracking-widest text-gray-500">Destination Nodes</label>
                          <div className="grid grid-cols-2 gap-3">
                            {countries.map((country) => {
                              const selected = form.preferredCountries.includes(country);
                              return (
                                <motion.button
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  key={country}
                                  type="button"
                                  onClick={() => toggleCountry(country)}
                                  className={cn(
                                    "px-4 py-3 rounded-xl text-xs font-bold text-left transition-all duration-300 border",
                                    selected
                                      ? "bg-teal-100 border-teal-500 text-gray-900 shadow-lg shadow-teal-100"
                                      : "bg-gray-100 border-gray-100 text-gray-500 hover:border-teal-300 hover:text-gray-900"
                                  )}
                                >
                                  {selected && <Check size={12} className="inline mr-2" />}
                                  {country}
                                </motion.button>
                              );
                            })}
                          </div>
                          {errors.preferredCountries && <p className="text-red-500 text-xs font-bold tracking-tight">{errors.preferredCountries}</p>}
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-black uppercase tracking-widest text-gray-500">Fuel Reservoir (Annual Budget)</label>
                          <div className="grid grid-cols-2 gap-3">
                            {[
                              { label: '< $15k', val: 'under-15k' },
                              { label: '$15k-30k', val: '15k-30k' },
                              { label: '$30k-50k', val: '30k-50k' },
                              { label: '> $50k', val: 'over-50k' }
                            ].map(b => (
                              <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                key={b.val}
                                type="button"
                                onClick={() => setForm({ ...form, budget: b.val })}
                                className={cn(
                                  "px-4 py-3 rounded-xl text-xs font-bold text-center transition-all duration-300 border",
                                  form.budget === b.val
                                    ? "bg-blue-100 border-blue-500 text-gray-900 shadow-lg shadow-blue-100"
                                    : "bg-gray-100 border-gray-100 text-gray-500 hover:border-blue-300 hover:text-gray-900"
                                )}
                              >
                                {b.label}
                              </motion.button>
                            ))}
                          </div>
                          {errors.budget && <p className="text-red-500 text-xs font-bold tracking-tight">{errors.budget}</p>}
                        </div>
                      </div>
                    )}

                    {step === 3 && (
                      <div className="space-y-6">
                        <div className="space-y-1">
                          <h2 className="text-2xl font-black text-gray-900">The Activation 🎉</h2>
                          <p className="text-gray-500 text-sm font-medium">Ready to initialize your education OS?</p>
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                          {[
                            { icon: User, label: 'Identity', val: form.name },
                            { icon: BookOpen, label: 'Qualification', val: form.qualification },
                            { icon: GraduationCap, label: 'Discipline', val: form.targetCourse },
                            { icon: Globe, label: 'Nodes', val: form.preferredCountries.join(', ') },
                            { icon: DollarSign, label: 'Fuel', val: form.budget },
                          ].map((item, idx) => (
                            <motion.div
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.1 }}
                              key={idx}
                              className="flex items-center justify-between p-4 bg-gray-100 border border-gray-100 rounded-2xl"
                            >
                              <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-gray-100 text-teal-500">
                                  <item.icon size={16} />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">{item.label}</span>
                              </div>
                              <span className="text-sm font-bold text-gray-900 truncate max-w-[180px]">{item.val}</span>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

            {/* ─── Footer Navigation ─── */}
            <div className="px-6 py-5 bg-gradient-to-r from-gray-50 to-white border-t border-gray-100 flex gap-3">
              {step > 1 && (
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={handleBack}
                  className="flex-none w-12 h-12 rounded-xl flex items-center justify-center border-2 border-gray-200 bg-white text-gray-500 hover:border-gray-400 hover:text-gray-700 transition-all duration-200 shadow-sm"
                >
                  <ChevronLeft size={20} />
                </motion.button>
              )}
              {step < 3 ? (
                <motion.button
                  id="onboarding-next"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleNext}
                  className="relative flex-1 h-12 rounded-xl overflow-hidden flex items-center justify-center gap-2.5 text-white font-black text-sm tracking-wide shadow-lg shadow-teal-500/30 transition-all duration-200"
                  style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #0ea5e9 40%, #14b8a6 100%)', backgroundSize: '200% 200%' }}
                >
                  {/* shimmer sweep */}
                  <motion.div
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ duration: 2.2, repeat: Infinity, ease: 'linear', repeatDelay: 1.2 }}
                    className="absolute inset-0 pointer-events-none"
                    style={{ background: 'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.28) 50%, transparent 70%)' }}
                  />
                  <span className="relative z-10">Continue Journey</span>
                  <ChevronRight size={18} className="relative z-10" />
                </motion.button>
              ) : (
                <motion.button
                  id="onboarding-submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleSubmit}
                  className="relative flex-1 h-12 rounded-xl overflow-hidden flex items-center justify-center gap-2.5 text-white font-black text-sm tracking-wide shadow-lg shadow-blue-500/30"
                  style={{ background: 'linear-gradient(135deg, #6366f1 0%, #3b82f6 50%, #14b8a6 100%)' }}
                >
                  <motion.div
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ duration: 2.2, repeat: Infinity, ease: 'linear', repeatDelay: 1.2 }}
                    className="absolute inset-0 pointer-events-none"
                    style={{ background: 'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.28) 50%, transparent 70%)' }}
                  />
                  <span className="relative z-10">Launch OS</span>
                  <GraduationCap size={18} className="relative z-10" />
                </motion.button>
              )}
            </div>
          </GlassCard>
        </div>
      </div>
    </PageTransition>
  );
}