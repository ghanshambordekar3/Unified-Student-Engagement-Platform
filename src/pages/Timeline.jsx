import { useState } from 'react';
import { Calendar, ChevronDown, Flag, CheckCircle2, AlertCircle, Clock, Plane, Landmark } from 'lucide-react';
import { generateTimeline } from '../utils/timeline';
import { GlassCard } from '../components/ui/GlassCard';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../utils/cn';

const statusLabels = {
  prep: { label: 'Initial Prep', color: 'bg-blue-100 text-blue-600 border-blue-200', icon: Clock },
  apply: { label: 'Application', color: 'bg-teal-100 text-teal-600 border-teal-200', icon: CheckCircle2 },
  offer: { label: 'Offer Stage', color: 'bg-yellow-100 text-yellow-600 border-yellow-200', icon: Flag },
  finance: { label: 'Finance Hub', color: 'bg-orange-100 text-orange-600 border-orange-200', icon: Landmark },
  visa: { label: 'Visa Process', color: 'bg-red-100 text-red-600 border-red-200', icon: AlertCircle },
  travel: { label: 'Travel Ready', color: 'bg-emerald-100 text-emerald-600 border-emerald-200', icon: Plane },
};

export default function Timeline() {
  const [intake, setIntake] = useState('Sep');
  const timeline = generateTimeline(intake);
  const [expanded, setExpanded] = useState(null);

  return (
    <div className="space-y-10 pb-20">
      {/* Header */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <motion.div 
             initial={{ opacity: 0, x: -20 }}
             animate={{ opacity: 1, x: 0 }}
             className="flex items-center gap-2 px-3 py-1 bg-teal-50 border border-teal-200 rounded-full w-fit"
          >
            <Calendar size={14} className="text-teal-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-teal-700">Strategic Roadmap</span>
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">Application <span className="text-gradient">Timeline</span></h1>
          <p className="text-gray-500 font-medium text-sm">Synchronized global intake milestones for your academic mission.</p>
        </div>
      </section>

      {/* Intake Selector */}
      <GlassCard className="p-8 border-gray-200" hoverable={false}>
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1 space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Target Deployment Cycle</h3>
            <div className="flex gap-4">
              {['Sep', 'Jan'].map((opt) => (
                <button
                  key={opt}
                  onClick={() => setIntake(opt)}
                  className={cn(
                    "flex-1 px-8 py-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all duration-300 border",
                    intake === opt
                      ? "bg-teal-500 border-teal-400 text-white shadow-lg"
                      : "bg-gray-100 border-gray-200 text-gray-600 hover:border-gray-300 hover:text-gray-900"
                  )}
                >
                  {opt === 'Sep' ? 'Sep Intake' : 'Jan Intake'}
                </button>
              ))}
            </div>
          </div>
          <div className="w-px h-16 bg-gray-200 hidden md:block" />
          <div className="text-center md:text-right shrink-0">
             <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Total Nodes</p>
             <p className="text-4xl font-black text-gray-900">{timeline.length}</p>
          </div>
        </div>
      </GlassCard>

      {/* Timeline Visualizer */}
      <div className="relative pt-4">
        {/* Dynamic Vertical Path */}
        <div className="absolute left-[34px] top-0 bottom-0 w-1 bg-gradient-to-b from-teal-400 via-blue-400 to-purple-400 rounded-full" />
        
        <div className="space-y-12 relative z-10">
          {timeline.map((step, i) => {
            const isExpanded = expanded === step.step;
            const StatusIcon = statusLabels[step.status]?.icon || Clock;
            
            return (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="relative pl-24 group"
              >
                {/* Step Node */}
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  onClick={() => setExpanded(isExpanded ? null : step.step)}
                  className={cn(
                    "absolute left-0 w-[70px] h-[70px] rounded-[30%] border-4 border-white flex items-center justify-center text-2xl shadow-lg z-20 cursor-pointer transition-all duration-500",
                    isExpanded ? "bg-teal-500 text-white scale-110" : "bg-white text-gray-400 shadow-md"
                  )}
                >
                  <span className="font-black italic tracking-tighter">{step.step}</span>
                </motion.div>

                {/* Content Card */}
                <GlassCard
                  className={cn(
                    "p-8 cursor-pointer transition-all duration-500 relative border-gray-200",
                    isExpanded && "border-teal-300 bg-teal-50"
                  )}
                  onClick={() => setExpanded(isExpanded ? null : step.step)}
                  hoverable={false}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className={cn("px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5", statusLabels[step.status]?.color)}>
                          <StatusIcon size={12} />
                          {statusLabels[step.status]?.label}
                        </div>
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Phase {step.step}</span>
                      </div>
                      <h3 className="text-xl font-black text-gray-900 tracking-tight">{step.title}</h3>
                      <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-gray-500">
                        <span className="flex items-center gap-1.5"><Calendar size={12} className="text-teal-500" /> {step.months}</span>
                        <span className="flex items-center gap-1.5 text-blue-500"><Clock size={12} /> Due: {step.dueDate}</span>
                      </div>
                    </div>
                    <ChevronDown
                      size={20}
                      className={cn("text-gray-400 transition-transform duration-500", isExpanded && "rotate-180 text-teal-500")}
                    />
                  </div>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-8 pt-8 border-t border-gray-200 space-y-4">
                           <p className="text-sm text-gray-600 font-medium leading-relaxed italic">
                             {step.description}
                           </p>
                           <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-teal-500">
                              <CheckCircle2 size={12} /> Operational node verified
                           </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Global Sync Banner */}
      <GlassCard className="p-10 border-teal-200 bg-teal-50 text-center relative overflow-hidden" hoverable={false}>
        <div className="absolute inset-0 bg-gradient-to-r from-teal-100 via-transparent to-blue-100" />
        <div className="relative z-10 space-y-4">
          <div className="w-16 h-16 bg-teal-100 rounded-2xl flex items-center justify-center mx-auto mb-2 border border-teal-200 text-teal-500">
            <Calendar size={32} />
          </div>
          <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Full System Integration</h3>
          <p className="text-sm text-gray-500 font-medium max-w-lg mx-auto leading-relaxed">
            Every step is bi-directionally synchronized with your <span className="text-gray-900 font-semibold">Progress Tracker</span>. Completing tasks in either module updates your global deployment status in real-time.
          </p>
        </div>
      </GlassCard>
    </div>
  );
}
