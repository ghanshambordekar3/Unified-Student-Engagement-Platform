import { useState } from 'react';
import { TrendingUp, Info, Sparkles, Target, Zap, ChevronRight, BrainCircuit } from 'lucide-react';
import { calculateAdmissionScore } from '../utils/scoring';
import { trackEvent } from '../utils/rewards';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../utils/cn';

export default function AdmissionPredictor() {
  const [form, setForm] = useState({ gpa: '', ielts: '', experience: '' });
  const [result, setResult] = useState(null);
  const [animated, setAnimated] = useState(false);

  const handlePredict = () => {
    if (!form.gpa || !form.ielts || form.experience === '') return;
    const res = calculateAdmissionScore(form.gpa, form.ielts, form.experience);
    setResult(res);
    setAnimated(false);
    setTimeout(() => setAnimated(true), 50);
    trackEvent('predictor_used');
  };

  return (
    <div className="space-y-10 pb-20">
      {/* Header */}
      <section className="space-y-2">
        <motion.div 
           initial={{ opacity: 0, y: -10 }}
           animate={{ opacity: 1, y: 0 }}
           className="flex items-center gap-2 px-3 py-1 bg-gray-100 border border-gray-200 rounded-full w-fit"
        >
          <BrainCircuit size={14} className="text-teal-500" />
          <span className="text-[10px] font-black uppercase tracking-widest text-teal-700">Predictive Intelligence Engine</span>
        </motion.div>
        <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">Admission <span className="text-gradient">Forecasting</span></h1>
        <p className="text-gray-500 font-medium text-sm">Analyze your academic profile against global institutional benchmarks.</p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Input Form */}
        <GlassCard className="p-8 space-y-8" hoverable={false}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-100 border border-teal-200 flex items-center justify-center text-teal-500 relative">
              <Sparkles size={24} />
              <div className="absolute inset-0 bg-teal-400/20 blur-xl rounded-full animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-widest text-gray-900">Profile Parameters</h3>
              <p className="text-[10px] text-gray-500 font-bold tracking-widest uppercase mt-0.5">Input mission-critical academic data</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* GPA */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">GPA / CGPA Matrix</label>
                <span className="text-[10px] font-bold text-teal-600 bg-teal-100 px-2 py-0.5 rounded-full border border-teal-200">Scale 4.0</span>
              </div>
              <input
                id="predictor-gpa"
                type="number"
                min="0"
                max="4"
                step="0.1"
                className="w-full bg-gray-100 border border-gray-200 rounded-2xl px-5 py-4 text-gray-900 font-bold focus:outline-none focus:border-teal-500 transition-all placeholder:text-gray-600"
                placeholder="e.g. 3.5"
                value={form.gpa}
                onChange={(e) => setForm({ ...form, gpa: e.target.value })}
              />
            </div>

            {/* IELTS */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Linguistic Proficiency (IELTS)</label>
                <span className="text-[10px] font-bold text-blue-500 bg-blue-100 px-2 py-0.5 rounded-full border border-blue-200">Band 9.0</span>
              </div>
              <input
                id="predictor-ielts"
                type="number"
                min="0"
                max="9"
                step="0.5"
                className="w-full bg-gray-100 border border-gray-200 rounded-2xl px-5 py-4 text-gray-900 font-bold focus:outline-none focus:border-blue-500 transition-all placeholder:text-gray-600"
                placeholder="e.g. 7.5"
                value={form.ielts}
                onChange={(e) => setForm({ ...form, ielts: e.target.value })}
              />
              <div className="flex gap-2 flex-wrap">
                {[6.5, 7.0, 7.5, 8.0].map((band) => (
                  <button
                    key={band}
                    onClick={() => setForm({ ...form, ielts: band.toString() })}
                    className={cn(
                      "px-4 py-2 rounded-xl text-[10px] font-black transition-all border",
                      parseFloat(form.ielts) === band
                        ? "bg-teal-100 border-teal-500 text-gray-900"
                        : "bg-gray-100 border-gray-100 text-gray-500 hover:border-gray-300"
                    )}
                  >
                    {band}
                  </button>
                ))}
              </div>
            </div>

            {/* Experience */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Professional Tenure</label>
                <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full border border-gray-200">Years</span>
              </div>
              <input
                id="predictor-experience"
                type="number"
                min="0"
                max="20"
                className="w-full bg-gray-100 border border-gray-200 rounded-2xl px-5 py-4 text-gray-900 font-bold focus:outline-none focus:border-gray-300 transition-all placeholder:text-gray-600"
                placeholder="Years of experience"
                value={form.experience}
                onChange={(e) => setForm({ ...form, experience: e.target.value })}
              />
            </div>
          </div>

          <Button
            id="predictor-submit"
            onClick={handlePredict}
            disabled={!form.gpa || !form.ielts || form.experience === ''}
            className="w-full h-14 uppercase tracking-[0.2em] font-black text-[12px]"
            glow
          >
            Compute Probability
          </Button>

          <div className="flex items-start gap-4 p-4 bg-gray-100 rounded-2xl border border-gray-100">
            <Info size={16} className="text-teal-500 shrink-0 mt-0.5" />
            <p className="text-[10px] text-gray-500 font-bold leading-relaxed tracking-wide uppercase">
              Engine uses a weighted multi-factor heuristic: GPA (40%) + Language (35%) + Experience (25%). 
              Benchmarks are updated daily based on institutional intake data.
            </p>
          </div>
        </GlassCard>

        {/* Result Area */}
        <AnimatePresence mode="wait">
          {result ? (
            <motion.div
              key="result"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              <GlassCard className="p-10 border-gray-100 relative overflow-hidden" hoverable={false}>
                {/* Result Background Effect */}
                <div className={cn(
                  "absolute inset-0 bg-gradient-to-br opacity-5",
                  result.score >= 70 ? "from-teal-500 to-blue-500" :
                  result.score >= 50 ? "from-yellow-500 to-orange-500" :
                  "from-red-500 to-rose-600"
                )} />

                <div className="relative z-10 space-y-10">
                  <div className="text-center space-y-2">
                    <h3 className="text-sm font-black uppercase tracking-[0.3em] text-gray-900">Probability Quotient</h3>
                    <p className="text-[10px] text-gray-500 font-bold tracking-widest uppercase">Verified admissions index</p>
                  </div>

                  {/* Circular Score */}
                  <div className="flex flex-col items-center justify-center gap-8">
                    <div className="relative w-48 h-48">
                       {/* Background Ring */}
                       <svg className="w-48 h-48 -rotate-90 transform" viewBox="0 0 160 160">
                         <circle cx="80" cy="80" r="70" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="14" />
                         <motion.circle
                           cx="80"
                           cy="80"
                           r="70"
                           fill="none"
                           stroke={result.score >= 70 ? "#14b8a6" : result.score >= 50 ? "#eab308" : "#ef4444"}
                           strokeWidth="14"
                           strokeLinecap="round"
                           strokeDasharray={440}
                           initial={{ strokeDashoffset: 440 }}
                           animate={{ strokeDashoffset: 440 * (1 - result.score / 100) }}
                           transition={{ duration: 1.5, ease: "easeOut" }}
                           style={{ filter: `drop-shadow(0 0 8px ${result.score >= 70 ? "#14b8a666" : result.score >= 50 ? "#eab30866" : "#ef444466"})` }}
                         />
                       </svg>
                       <div className="absolute inset-0 flex flex-col items-center justify-center">
                         <motion.span 
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="text-6xl font-black text-gray-900 tracking-tighter"
                         >
                           {result.score}
                         </motion.span>
                         <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">/ 100</span>
                       </div>
                    </div>

                    <div className={cn(
                      "px-8 py-3 rounded-full text-xs font-black uppercase tracking-[0.2em] border shadow-lg transition-all duration-1000",
                      result.score >= 70 ? "bg-teal-100 border-teal-300 text-teal-500 shadow-teal-500/10" :
                      result.score >= 50 ? "bg-yellow-100 border-yellow-300 text-yellow-500 shadow-yellow-500/10" :
                      "bg-red-100 border-red-300 text-red-500 shadow-red-500/10"
                    )}>
                      {result.label} Probability
                    </div>
                  </div>

                  {/* Breakdown Bars */}
                  <div className="space-y-5 pt-6 border-t border-gray-100">
                    {[
                      { label: 'GPA Contribution', value: Math.round((parseFloat(form.gpa) / 4.0) * 40), max: 40, color: 'from-blue-600 to-blue-400' },
                      { label: 'Language Band', value: Math.round((parseFloat(form.ielts) / 9.0) * 35), max: 35, color: 'from-teal-600 to-teal-400' },
                      { label: 'Market Experience', value: Math.min(parseFloat(form.experience), 5) * 5, max: 25, color: 'from-purple-600 to-purple-400' },
                    ].map((item) => (
                      <div key={item.label} className="space-y-2">
                        <div className="flex justify-between items-end">
                          <span className="text-[9px] font-black uppercase tracking-widest text-gray-500">{item.label}</span>
                          <span className="text-xs font-black text-gray-900">{item.value}<span className="text-[10px] text-gray-500 ml-0.5">/ {item.max}</span></span>
                        </div>
                        <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden p-0.5">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(item.value / item.max) * 100}%` }}
                            transition={{ duration: 1.2, delay: 0.5 }}
                            className={cn("h-full rounded-full bg-gradient-to-r", item.color)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className={cn(
                    "p-6 rounded-2xl border transition-all duration-1000",
                    result.score >= 70 ? "bg-teal-50 border-teal-200" :
                    result.score >= 50 ? "bg-yellow-50 border-yellow-200" :
                    "bg-red-50 border-red-200"
                  )}>
                    <p className="text-sm text-gray-600 font-medium leading-relaxed italic">"{result.description}"</p>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="h-full"
            >
              <GlassCard className="h-full min-h-[500px] flex flex-col items-center justify-center text-center p-12 border-gray-100 group" hoverable={false}>
                <div className="relative mb-8">
                  <div className="w-24 h-24 rounded-[30%] bg-gray-100 border border-gray-200 flex items-center justify-center text-5xl transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6">
                    📊
                  </div>
                  <div className="absolute -inset-2 border border-gray-100 rounded-[35%] animate-spin-slow" />
                </div>
                <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Deployment Pending</h3>
                <p className="text-gray-500 text-sm mt-3 max-w-xs font-medium leading-relaxed">
                  Enter your academic telemetry in the console to initiate zero-origin probability forecasting.
                </p>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}