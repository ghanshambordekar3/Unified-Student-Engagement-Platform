import { useState } from 'react';
import { Landmark, CheckCircle, ChevronRight, FileCheck, Send, Users, Home, ShieldCheck } from 'lucide-react';
import loanOffersData from '../data/loanOffers.json';
import storage from '../utils/storage';
import { calculateLoanEligibility } from '../utils/scoring';
import { trackEvent } from '../utils/rewards';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../utils/cn';
import BankConsensusMatrix from '../components/BankConsensusMatrix';
import EMIProjection from '../components/EMIProjection';
import DocumentChecklist from '../components/DocumentChecklist';

const LOAN_APP_KEY = 'edupath_loan_application';

const steps = [
  { id: 1, title: 'Eligibility', icon: '🔍' },
  { id: 2, title: 'Offers', icon: '🏦' },
  { id: 3, title: 'Planner', icon: '📊' },
  { id: 4, title: 'Apply', icon: '📝' },
  { id: 5, title: 'Docs', icon: '📋' },
];

function formatINR(n) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
}

function calcEMI(principal, annualRate, months) {
  const r = annualRate / 100 / 12;
  return Math.round((principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1));
}

export default function Loans() {
  const profile = storage.get('edupath_profile', {});
  const saved = storage.get(LOAN_APP_KEY, null);
  const [step, setStep] = useState(1);

  // Step 1 — Eligibility
  const [eligForm, setEligForm] = useState({
    income: saved?.income || '',
    coApplicant: saved?.coApplicant || false,
    collateral: saved?.collateral || false,
    loanAmount: saved?.loanAmount || '25',
  });
  const [eligResult, setEligResult] = useState(null);

  // Step 2 — Selected offer
  const [selectedOffer, setSelectedOffer] = useState(null);

  // Step 3 — EMI
  const [tenure, setTenure] = useState(10);

  // Step 4 — Application form
  const [appForm, setAppForm] = useState({
    fullName: profile.name || '',
    email: saved?.email || '',
    phone: saved?.phone || '',
    address: saved?.address || '',
    universityName: saved?.universityName || '',
    courseStart: '',
  });
  const [appSubmitted, setAppSubmitted] = useState(false);

  const handleEligibility = () => {
    if (!eligForm.income) return;
    const result = calculateLoanEligibility(
      parseFloat(eligForm.income),
      eligForm.coApplicant,
      eligForm.collateral
    );
    setEligResult(result);
    trackEvent('loan_checked');
    storage.set(LOAN_APP_KEY, { ...eligForm });
    setStep(2);
  };

  const filteredOffers = loanOffersData.filter((o) => {
    if (!eligResult) return true;
    return parseFloat(eligForm.income) >= o.incomeMin;
  }).sort((a, b) => (a.consensusRank || 999) - (b.consensusRank || 999));

  const handleSelectOffer = (offer, previewOnly = false) => {
    setSelectedOffer(offer);
    if (!previewOnly) {
      setStep(3);
    }
    trackEvent('loan_checked');
  };

  const handleSubmitApp = () => {
    setAppSubmitted(true);
    trackEvent('loan_applied');
    storage.set(LOAN_APP_KEY, {
      ...eligForm,
      ...appForm,
      selectedBank: selectedOffer?.bank,
      submittedAt: new Date().toISOString(),
    });
  };

  const loanAmount = eligForm.loanAmount
    ? parseFloat(eligForm.loanAmount) * 100000
    : 2500000;
  const emi = selectedOffer ? calcEMI(loanAmount, parseFloat(selectedOffer.interest?.effectiveRate || selectedOffer.interest || 10), tenure * 12) : 0;
  const totalPayable = emi * tenure * 12;
  const totalInterest = totalPayable - loanAmount;

  return (
    <div className="space-y-10 pb-20">
      {/* Header */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 px-3 py-1 bg-gray-100 border border-gray-200 rounded-full w-fit"
          >
            <ShieldCheck size={14} className="text-teal-400" />
            <span className="text-[10px] font-black uppercase tracking-widest text-teal-700">Financial Logistics Alpha</span>
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">Loan <span className="text-gradient">Conversion</span> Hub</h1>
          <p className="text-gray-500 font-medium text-sm">End-to-end capital deployment pipeline for global academic missions.</p>
        </div>
      </section>

      {/* Navigation Progress */}
      <GlassCard className="p-4" hoverable={false}>
        <div className="flex items-center justify-between px-2 md:px-8 relative">
          <div className="absolute left-8 right-8 top-1/2 -translate-y-1/2 h-px bg-gray-100" />
          {steps.map((s) => (
            <motion.div
              key={s.id}
              onClick={() => s.id < step && setStep(s.id)}
              className="relative z-10 flex flex-col items-center gap-2 cursor-pointer group"
            >
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center text-xl border transition-all duration-500",
                step === s.id ? "bg-teal-500 border-teal-400 text-gray-900 shadow-[0_0_20px_rgba(20,184,166,0.3)]" :
                  step > s.id ? "bg-teal-500/20 border-teal-500/40 text-teal-400" :
                    "bg-gray-100 border-gray-200 text-gray-900/20 group-hover:border-gray-300"
              )}>
                {step > s.id ? "✓" : s.icon}
              </div>
              <span className={cn(
                "text-[9px] font-black uppercase tracking-widest hidden md:block",
                step >= s.id ? "text-teal-700" : "text-gray-900/20"
              )}>{s.title}</span>
            </motion.div>
          ))}
        </div>
      </GlassCard>

      <AnimatePresence mode="wait">
        {/* Step 1: Eligibility */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
          >
            <div className="lg:col-span-7">
              <GlassCard className="p-10 space-y-8" hoverable={false}>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gray-100 border border-gray-200 flex items-center justify-center text-primary">
                    <Landmark size={24} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-widest text-gray-900">Eligibility Diagnostics</h3>
                    <p className="text-[10px] text-gray-500 font-bold tracking-widest uppercase mt-0.5">Financial Telemetry Submission</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Family Income (₹ Lakhs)</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">₹</span>
                        <input type="number" className="w-full bg-gray-100 border border-gray-200 rounded-2xl px-8 py-4 text-gray-900 font-bold focus:outline-none focus:border-primary/30 text-sm transition-all" value={eligForm.income} onChange={(e) => setEligForm({ ...eligForm, income: e.target.value })} placeholder="7.5" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Required Amount (₹ Lakhs)</label>
                      <input type="number" className="w-full bg-gray-100 border border-gray-200 rounded-2xl px-6 py-4 text-gray-900 font-bold focus:outline-none focus:border-primary/30 text-sm transition-all" value={eligForm.loanAmount} onChange={(e) => setEligForm({ ...eligForm, loanAmount: e.target.value })} placeholder="25" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    {[
                      { key: 'coApplicant', label: 'Co-Applicant Node', sub: 'Reduces interest overhead by 0.5%', icon: <Users size={20} /> },
                      { key: 'collateral', label: 'Asset Collateral', sub: 'Unlocks high-tier credit limits', icon: <Home size={20} /> },
                    ].map(({ key, label, sub, icon }) => (
                      <div
                        key={key}
                        onClick={() => setEligForm({ ...eligForm, [key]: !eligForm[key] })}
                        className={cn(
                          "flex items-center justify-between p-5 rounded-2xl border cursor-pointer transition-all duration-500",
                          eligForm[key] ? "bg-teal-100 border-teal-500/40 shadow-[0_0_20px_rgba(20,184,166,0.05)]" : "bg-gray-100 border-gray-100 hover:border-gray-200"
                        )}
                      >
                        <div className="flex items-center gap-4">
                          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-colors", eligForm[key] ? "text-teal-400 bg-teal-100" : "text-gray-500 bg-gray-100")}>
                            {icon}
                          </div>
                          <div>
                            <p className="text-[11px] font-black uppercase tracking-widest text-gray-900">{label}</p>
                            <p className="text-[9px] text-gray-500 font-bold uppercase tracking-tight mt-0.5">{sub}</p>
                          </div>
                        </div>
                        <div className={cn("w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-500", eligForm[key] ? "bg-teal-500 border-teal-400" : "border-gray-200")}>
                          {eligForm[key] && <CheckCircle size={14} className="text-gray-900" />}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Button onClick={handleEligibility} disabled={!eligForm.income} className="w-full h-14 uppercase tracking-[0.2em] font-black text-[12px]" glow>
                  Initialize Selection Matrix
                </Button>
              </GlassCard>
            </div>

            <div className="lg:col-span-5 h-full">
              <GlassCard className="h-full min-h-[400px] p-10 flex flex-col justify-center items-center text-center border-teal-500/10" hoverable={false}>
                <div className="w-20 h-20 rounded-3xl bg-teal-100 border border-teal-500/20 flex items-center justify-center text-4xl mb-6 shadow-[0_0_30px_rgba(20,184,166,0.1)]">
                  🏛️
                </div>
                <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Deployment Workflow</h3>
                <div className="w-full space-y-4 mt-8">
                  {steps.map((s, i) => (
                    <div key={s.id} className="flex items-center gap-4 group">
                      <div className="w-8 h-8 rounded-xl bg-gray-100 border border-gray-100 flex items-center justify-center text-xs group-hover:border-teal-500/30 transition-colors">
                        {s.icon}
                      </div>
                      <div className={cn("h-px flex-1 bg-gray-100", i === steps.length - 1 && "hidden")} />
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 group-hover:text-teal-400 transition-colors">{s.title}</span>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </div>
          </motion.div>
        )}

        {/* Step 2: Offers */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase">Bank Consensus Matrix</h2>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Available Capital nodes based on telemetry</p>
              </div>
              <div className={cn("px-4 py-2 rounded-xl border font-black text-[10px] uppercase tracking-widest",
                eligResult?.tier === 'High' ? "bg-teal-100 border-teal-500/20 text-teal-400" : "bg-yellow-100 border-yellow-500/20 text-yellow-400"
              )}>
                Credit Tier: {eligResult?.label || 'Verified'}
              </div>
            </div>

            <BankConsensusMatrix
              banks={filteredOffers}
              selectedBank={selectedOffer}
              onSelectBank={handleSelectOffer}
            />

            {selectedOffer && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-teal-50 border border-teal-200"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{selectedOffer.logo}</span>
                  <div>
                    <p className="text-xs font-black text-gray-900 uppercase tracking-tight">{selectedOffer.bank}</p>
                    <p className="text-[10px] text-teal-700 font-bold uppercase tracking-widest">{selectedOffer.interest?.effectiveRate}% p.a. · Ready to Proceed</p>
                  </div>
                </div>
                <Button
                  onClick={() => setStep(3)}
                  className="h-12 px-8 uppercase tracking-[0.15em] font-black text-[11px] shrink-0"
                  glow
                >
                  Proceed with {selectedOffer.shortName || selectedOffer.bank} <ChevronRight size={14} className="ml-1" />
                </Button>
              </motion.div>
            )}

            <button onClick={() => setStep(1)} className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 hover:text-gray-900 transition-colors">← Recalibrate Diagnostics</button>
          </motion.div>
        )}

        {/* Step 3: Planner */}
        {step === 3 && selectedOffer && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-8"
          >
            <EMIProjection
              bank={selectedOffer}
              loanAmount={loanAmount}
              onTenureChange={setTenure}
            />

            <div className="flex justify-between items-center">
              <button onClick={() => setStep(2)} className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 hover:text-gray-900 transition-colors">← Back to Matrix</button>
              <Button onClick={() => setStep(4)} className="h-12 px-8 uppercase tracking-[0.15em] font-black text-[11px]" glow>
                Lock Configuration <ChevronRight size={14} className="ml-1" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 4: Apply */}
        {step === 4 && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {appSubmitted ? (
              <GlassCard className="max-w-3xl mx-auto p-12 text-center border-teal-500/30 bg-teal-50" hoverable={false}>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", damping: 10 }}
                  className="w-24 h-24 rounded-full bg-teal-500/20 border-2 border-teal-500/40 flex items-center justify-center text-5xl mx-auto mb-8 shadow-[0_0_40px_rgba(20,184,166,0.2)]"
                >
                  🎉
                </motion.div>
                <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tight">Transmission Successful</h2>
                <p className="text-gray-500 font-medium mt-4 max-w-lg mx-auto leading-relaxed">
                  Your financial dossier has been transmitted to <span className="text-gray-900 font-black">{selectedOffer?.bank}</span>. Node synchronization will complete within 48 operational hours.
                </p>

                <div className="grid grid-cols-3 gap-4 max-w-md mx-auto my-10">
                  {[
                    { l: 'Endpoint', v: selectedOffer?.bank },
                    { l: 'Base Rate', v: `${selectedOffer?.interest?.effectiveRate}%` },
                    { l: 'Status', v: 'PENDING', c: 'text-yellow-400' }
                  ].map((item, i) => (
                    <div key={i} className="bg-gray-100 p-4 rounded-2xl border border-gray-100">
                      <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">{item.l}</p>
                      <p className={cn("text-xs font-black truncate", item.c || "text-gray-900")}>{item.v}</p>
                    </div>
                  ))}
                </div>

                <Button glow onClick={() => setStep(5)} className="px-10 h-14 font-black uppercase text-xs tracking-widest">
                  Manage Documentary Assets <ChevronRight size={16} className="ml-2" />
                </Button>
              </GlassCard>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-7">
                  <GlassCard className="p-10 space-y-8" hoverable={false}>
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-gray-100 border border-gray-200 flex items-center justify-center text-4xl shadow-2xl">
                        {selectedOffer?.logo}
                      </div>
                      <div>
                        <h3 className="font-black text-gray-900 uppercase tracking-tight">Dossier Submission</h3>
                        <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mt-0.5">Direct Channel: {selectedOffer?.bank}</p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Full Name</label>
                          <input className="w-full bg-gray-100 border border-gray-200 rounded-2xl px-6 py-4 text-gray-900 font-bold focus:outline-none focus:border-primary/30 text-sm transition-all" value={appForm.fullName} onChange={(e) => setAppForm({ ...appForm, fullName: e.target.value })} placeholder="Full Identity" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Contact Number</label>
                          <input className="w-full bg-gray-100 border border-gray-200 rounded-2xl px-6 py-4 text-gray-900 font-bold focus:outline-none focus:border-primary/30 text-sm transition-all" value={appForm.phone} onChange={(e) => setAppForm({ ...appForm, phone: e.target.value })} placeholder="+91" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Secure Email</label>
                        <input type="email" className="w-full bg-gray-100 border border-gray-200 rounded-2xl px-6 py-4 text-gray-900 font-bold focus:outline-none focus:border-primary/30 text-sm transition-all" value={appForm.email} onChange={(e) => setAppForm({ ...appForm, email: e.target.value })} placeholder="alpha@network.com" />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">University Node</label>
                          <input className="w-full bg-gray-100 border border-gray-200 rounded-2xl px-6 py-4 text-gray-900 font-bold focus:outline-none focus:border-primary/30 text-sm transition-all" value={appForm.universityName} onChange={(e) => setAppForm({ ...appForm, universityName: e.target.value })} placeholder="Institution" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Course Genesis</label>
                          <input type="date" className="w-full bg-gray-100 border border-gray-200 rounded-2xl px-6 py-4 text-gray-900 font-bold focus:outline-none focus:border-primary/30 text-sm transition-all appearance-none" value={appForm.courseStart} onChange={(e) => setAppForm({ ...appForm, courseStart: e.target.value })} />
                        </div>
                      </div>

                      <Button onClick={handleSubmitApp} className="w-full h-14 uppercase tracking-[0.2em] font-black text-[12px]" glow disabled={!appForm.fullName || !appForm.phone}>
                        Initialize Transmission <Send size={16} className="ml-2" />
                      </Button>
                    </div>
                  </GlassCard>
                </div>

                <div className="lg:col-span-5">
                  <GlassCard className="p-8 space-y-6" hoverable={false}>
                    <h3 className="text-xs font-black uppercase tracking-widest text-gray-900">Application Manifest</h3>
                    <div className="space-y-2">
                      {[
                        { l: 'Capital Endpoint', v: selectedOffer?.bank },
                        { l: 'Credit Volume', v: formatINR(loanAmount) },
                        { l: 'Interest Vector', v: `${selectedOffer?.interest?.effectiveRate}% p.a.` },
                        { l: 'Temporal Scope', v: `${tenure} Years` },
                        { l: 'Monthly Payload', v: formatINR(emi) },
                        { l: 'Co-Applicant Protocol', v: eligForm.coApplicant ? 'ENABLED' : 'DISABLED' },
                      ].map((item, i) => (
                        <div key={i} className="flex justify-between py-4 border-b border-gray-100 last:border-0">
                          <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{item.l}</span>
                          <span className="text-xs font-black text-gray-900 uppercase tracking-tight">{item.v}</span>
                        </div>
                      ))}
                    </div>
                  </GlassCard>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Step 5: Docs */}
        {step === 5 && (
          <motion.div
            key="step5"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-10"
          >
            <div className="flex items-center gap-4 px-4">
              <FileCheck size={24} className="text-teal-400" />
              <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Document Checklist</h2>
            </div>

            <DocumentChecklist bank={selectedOffer} profile={profile} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
