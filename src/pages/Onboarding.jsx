import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, User, BookOpen, Globe, DollarSign, ChevronRight, ChevronLeft, Check, Sparkles } from 'lucide-react';
import storage from '../utils/storage';
import { motion, AnimatePresence } from 'framer-motion';
import { PageTransition } from '../components/ui/PageTransition';
import { Button } from '../components/ui/Button';
import { GlassCard } from '../components/ui/GlassCard';
import { cn } from '../utils/cn';

const countries = ['Canada', 'UK', 'Australia', 'Germany', 'USA', 'Ireland', 'New Zealand', 'Netherlands'];
const courses = ['Computer Science', 'MBA', 'Data Science', 'Engineering', 'Medicine', 'Law', 'Arts & Humanities', 'Business'];
const qualifications = ['Bachelor\'s Degree', 'Master\'s Degree', 'Diploma', '12th Grade', 'PhD'];

const steps = [
  { id: 1, title: 'Identity', icon: User },
  { id: 2, title: 'Aspiration', icon: BookOpen },
  { id: 3, title: 'Ready', icon: Check },
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
        
        {/* Animated Background Decoration */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 90, 0],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-teal-100 rounded-full blur-[120px]"
          />
          <motion.div
            animate={{ 
              scale: [1, 1.3, 1],
              rotate: [0, -45, 0],
              opacity: [0.2, 0.4, 0.2]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-blue-100 rounded-full blur-[100px]"
          />
        </div>

        <div className="w-full max-w-xl relative">
          {/* Logo & Header */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-teal-500 mb-4 shadow-xl shadow-teal-500/20 border border-gray-200">
              <GraduationCap size={32} className="text-gray-900" />
            </div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">EduPath</h1>
            <div className="flex items-center justify-center gap-2 mt-1">
              <Sparkles size={14} className="text-teal-500" />
              <p className="text-gray-500 font-semibold uppercase tracking-[0.2em] text-[10px]">Your Future Context</p>
            </div>
          </motion.div>

          {/* Stepper */}
          <div className="flex items-center justify-center gap-4 mb-10 relative">
            {steps.map((s, i) => (
              <div key={s.id} className="flex items-center">
                <div className="flex flex-col items-center gap-2 group cursor-default">
                  <motion.div
                    animate={{ 
                      scale: step === s.id ? 1.1 : 1,
                      backgroundColor: step >= s.id ? 'rgba(20, 184, 166, 1)' : 'rgba(255, 255, 255, 0.05)',
                      boxShadow: step === s.id ? '0 0 20px rgba(20, 184, 166, 0.4)' : 'none'
                    }}
                    className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 border border-gray-200",
                      step >= s.id ? "text-gray-900" : "text-gray-500"
                    )}
                  >
                    {step > s.id ? <Check size={20} /> : <s.icon size={20} />}
                  </motion.div>
                  <span className={cn(
                    "text-[10px] font-black uppercase tracking-widest transition-colors",
                    step >= s.id ? "text-teal-500" : "text-gray-500"
                  )}>
                    {s.title}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div className="w-12 h-[2px] mb-6 mx-2 bg-gray-100 relative overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: step > s.id ? "100%" : 0 }}
                      className="absolute inset-y-0 left-0 bg-teal-500/50"
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
                    <div className="space-y-6">
                      <div className="space-y-1">
                        <h2 className="text-2xl font-black text-gray-900">The Identity</h2>
                        <p className="text-gray-500 text-sm font-medium">Let's start with the basics.</p>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-gray-500">Full Name</label>
                        <input
                          id="onboarding-name"
                          type="text"
                          className="w-full glass bg-gray-100 border border-gray-200 rounded-2xl px-5 py-4 text-gray-900 placeholder-gray-400 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-100 transition-all font-medium"
                          placeholder="e.g. Alexander Knight"
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                        />
                        {errors.name && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-500 text-xs font-bold tracking-tight">{errors.name}</motion.p>}
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-gray-500">Aspirant Qualification</label>
                        <select
                          id="onboarding-qualification"
                          className="w-full glass bg-gray-100 border border-gray-200 rounded-2xl px-5 py-4 text-gray-900 outline-none focus:border-teal-500 transition-all font-medium appearance-none"
                          value={form.qualification}
                          onChange={(e) => setForm({ ...form, qualification: e.target.value })}
                        >
                          <option value="" className="bg-gray-100">Select level...</option>
                          {qualifications.map((q) => (
                            <option key={q} value={q} className="bg-gray-100">{q}</option>
                          ))}
                        </select>
                        {errors.qualification && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-500 text-xs font-bold tracking-tight">{errors.qualification}</motion.p>}
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
                              onClick={() => setForm({...form, budget: b.val})}
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

            {/* Footer Navigation */}
            <div className="p-6 bg-gray-100 border-t border-gray-100 flex gap-4">
              {step > 1 && (
                <Button variant="secondary" onClick={handleBack} className="flex-1">
                  <ChevronLeft size={18} />
                </Button>
              )}
              {step < 3 ? (
                <Button
                  id="onboarding-next"
                  onClick={handleNext}
                  className="flex-[3] flex items-center justify-center gap-2"
                >
                  Continue Journey
                  <ChevronRight size={18} />
                </Button>
              ) : (
                <Button
                  id="onboarding-submit"
                  onClick={handleSubmit}
                  className="flex-[3] flex items-center justify-center gap-3"
                >
                  Launch OS
                  <GraduationCap size={18} />
                </Button>
              )}
            </div>
          </GlassCard>
        </div>
      </div>
    </PageTransition>
  );
}