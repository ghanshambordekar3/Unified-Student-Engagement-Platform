import { useState } from 'react';
import { Calculator, Landmark, TrendingUp, AlertCircle, CheckCircle, Globe, DollarSign, Wallet, ArrowUpRight, Percent, Calendar } from 'lucide-react';
import { calculateROI, calculateLoanEligibility } from '../utils/scoring';
import storage from '../utils/storage';
import { trackEvent } from '../utils/rewards';
import { PageTransition } from '../components/ui/PageTransition';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../utils/cn';

const courses = ['Computer Science', 'MBA', 'Data Science', 'Engineering'];
const countries = ['Canada', 'UK', 'Australia', 'Germany', 'USA'];

function VerdictBadge({ verdict }) {
  const styles = {
    'Excellent': 'bg-teal-100 border-teal-500/30 text-teal-400',
    'Good': 'bg-blue-100 border-blue-500/30 text-blue-400',
    'Average': 'bg-yellow-100 border-yellow-500/30 text-yellow-400',
    'Risky': 'bg-red-500/10 border-red-500/30 text-red-400',
    'Unknown': 'bg-gray-100 border-gray-200 text-gray-500',
  };
  return (
    <span className={cn("px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-[0.1em]", styles[verdict] || styles['Unknown'])}>
      {verdict}
    </span>
  );
}

export default function Finance() {
  const [activeTab, setActiveTab] = useState('roi');
  const profile = storage.get('edupath_profile', {});

  // ROI State
  const [roiForm, setRoiForm] = useState({
    course: profile.targetCourse || '',
    country: profile.preferredCountries?.[0] || '',
    cost: '',
  });
  const [roiResult, setRoiResult] = useState(null);

  // Loan State
  const [loanForm, setLoanForm] = useState({
    income: '',
    coApplicant: false,
    collateral: false,
  });
  const [loanResult, setLoanResult] = useState(null);

  const handleROI = () => {
    if (!roiForm.course || !roiForm.country || !roiForm.cost) return;
    const result = calculateROI(parseFloat(roiForm.cost), roiForm.course, roiForm.country);
    setRoiResult(result);
    trackEvent('roi_calculated');
  };

  const handleLoan = () => {
    if (!loanForm.income) return;
    const result = calculateLoanEligibility(
      parseFloat(loanForm.income),
      loanForm.coApplicant,
      loanForm.collateral
    );
    setLoanResult(result);
    trackEvent('loan_checked');
  };

  const formatCurrency = (n) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

  const formatINR = (n) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

  return (
    <PageTransition transitionKey="finance">
      <div className="space-y-8 pb-10">
        {/* Page Header */}
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <motion.div 
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               className="flex items-center gap-2 px-3 py-1 bg-gray-100 border border-gray-200 rounded-full w-fit"
            >
              <Wallet size={14} className="text-teal-400" />
              <span className="text-[10px] font-black uppercase tracking-widest text-teal-700">Financial Intelligence Matrix</span>
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">Financial <span className="text-gradient">Optimization</span></h1>
            <p className="text-gray-500 font-medium text-sm">Calculate projection models for global ROI and debt-to-income ratios.</p>
          </div>

          {/* Premium Tabs */}
          <div className="flex p-1.5 bg-gray-100 border border-gray-100 rounded-2xl w-fit relative">
            <motion.div 
              layoutId="activeFinanceTab"
              className="absolute inset-y-1.5 rounded-xl bg-teal-500 shadow-lg shadow-teal-500/20"
              initial={false}
              animate={{ 
                x: activeTab === 'roi' ? 0 : 155,
                width: 145 
              }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
            <button
              onClick={() => setActiveTab('roi')}
              className={cn(
                "relative z-10 px-6 py-2.5 text-xs font-black uppercase tracking-widest transition-colors duration-300 w-[145px]",
                activeTab === 'roi' ? "text-gray-900" : "text-gray-500 hover:text-gray-900"
              )}
            >
              ROI Modeler
            </button>
            <button
              onClick={() => setActiveTab('loan')}
              className={cn(
                "relative z-10 px-6 py-2.5 text-xs font-black uppercase tracking-widest transition-colors duration-300 w-[145px]",
                activeTab === 'loan' ? "text-gray-900" : "text-gray-500 hover:text-gray-900"
              )}
            >
              Loan Engine
            </button>
          </div>
        </section>

        <AnimatePresence mode="wait">
          {activeTab === 'roi' ? (
            <motion.div 
              key="roi"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-8"
            >
              {/* Form Card */}
              <GlassCard className="p-8 space-y-8" hoverable={false}>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-100 border border-blue-500/20 flex items-center justify-center text-blue-400">
                    <Calculator size={24} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-gray-900">Projection Inputs</h3>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">Define your academic orbit</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Specialization Path</label>
                    <select
                      className="w-full glass bg-gray-100 border border-gray-100 rounded-xl px-4 py-3.5 text-sm text-gray-900 outline-none focus:border-blue-500/30 transition-all font-medium appearance-none"
                      value={roiForm.course}
                      onChange={(e) => setRoiForm({ ...roiForm, course: e.target.value })}
                    >
                      <option value="" className="bg-gray-100">Select Sector</option>
                      {courses.map((c) => <option key={c} value={c} className="bg-gray-100">{c}</option>)}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Geo-Target Node</label>
                    <select
                      className="w-full glass bg-gray-100 border border-gray-100 rounded-xl px-4 py-3.5 text-sm text-gray-900 outline-none focus:border-blue-500/30 transition-all font-medium appearance-none"
                      value={roiForm.country}
                      onChange={(e) => setRoiForm({ ...roiForm, country: e.target.value })}
                    >
                      <option value="" className="bg-gray-100">Select Region</option>
                      {countries.map((c) => <option key={c} value={c} className="bg-gray-100">{c}</option>)}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Capital Outlay (USD)</label>
                    <div className="relative group">
                      <DollarSign size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
                      <input
                        type="number"
                        className="w-full glass bg-gray-100 border border-gray-100 rounded-xl pl-12 pr-4 py-3.5 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-blue-500/30 transition-all font-medium"
                        placeholder="e.g. 45000"
                        value={roiForm.cost}
                        onChange={(e) => setRoiForm({ ...roiForm, cost: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleROI}
                  disabled={!roiForm.course || !roiForm.country || !roiForm.cost}
                  className="w-full py-4"
                >
                  <ArrowUpRight size={18} className="mr-2" />
                  Generate ROI Projection
                </Button>
              </GlassCard>

              {/* Result Preview */}
              <div className="relative">
                <AnimatePresence mode="wait">
                  {roiResult ? (
                    <motion.div
                      key="result"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="h-full"
                    >
                      <GlassCard className="p-8 space-y-8 h-full border-blue-500/20 shadow-blue-500/5" hoverable={false}>
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-gray-900">Projection Verdict</h3>
                            <p className="text-[10px] text-gray-500 font-bold tracking-widest uppercase">Algorithmic Confidence: High</p>
                          </div>
                          <VerdictBadge verdict={roiResult.verdict} />
                        </div>

                        {/* Main Yield Metric */}
                        <div className="relative py-10 flex flex-col items-center">
                          <div className="absolute inset-0 bg-gradient-to-t from-teal-500/10 to-transparent blur-3xl rounded-full" />
                          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-teal-400 mb-2 relative">Net Annual Yield</p>
                          <h2 className="text-6xl font-black text-gray-900 relative flex items-baseline gap-1">
                            <span className="text-3xl text-teal-400">+</span>
                            {formatCurrency(roiResult.roi)}
                          </h2>
                          <div className="mt-4 px-4 py-1.5 bg-teal-100 rounded-full border border-teal-500/20 relative">
                            <span className="text-[10px] font-black uppercase text-teal-400">Superior Market Performance</span>
                          </div>
                        </div>

                        {/* Detail Grid */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="glass bg-gray-100 rounded-2xl p-6 border border-gray-100 space-y-1">
                            <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Entry Salary</p>
                            <p className="text-2xl font-black text-gray-900">{formatCurrency(roiResult.avgSalary)}</p>
                            <p className="text-[10px] text-teal-500 font-bold">AVG. STARTING</p>
                          </div>
                          <div className="glass bg-gray-100 rounded-2xl p-6 border border-gray-100 space-y-1">
                            <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Break-Even</p>
                            <p className="text-2xl font-black text-gray-900">{roiResult.breakEvenMonths} <span className="text-xs text-gray-500">MO</span></p>
                            <p className="text-[10px] text-blue-500 font-bold">RECOVERY TIME</p>
                          </div>
                        </div>

                        {/* Visual Timeline */}
                        <div className="space-y-3">
                          <div className="flex justify-between items-end">
                            <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Capital Neutrality Progress</span>
                            <span className="text-xs font-black text-gray-900">{Math.min(roiResult.breakEvenMonths, 48)}/48 <span className="text-[10px] text-gray-500">MONTHS</span></span>
                          </div>
                          <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden p-0.5 border border-gray-100">
                            <motion.div 
                               initial={{ width: 0 }}
                               animate={{ width: `${Math.min((roiResult.breakEvenMonths / 48) * 100, 100)}%` }}
                               transition={{ duration: 1, ease: "easeOut" }}
                               className="h-full rounded-full bg-gradient-to-r from-teal-500 to-blue-500 shadow-[0_0_15px_rgba(20,184,166,0.5)]"
                            />
                          </div>
                        </div>

                        {/* Insight description */}
                        <div className="flex gap-4 p-4 rounded-2xl bg-gray-100 border border-gray-200 items-start">
                           <div className="p-2 rounded-xl bg-teal-100 text-teal-400">
                             <Sparkles size={16} />
                           </div>
                           <p className="text-xs leading-relaxed text-gray-600 font-medium">{roiResult.description}</p>
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
                       <GlassCard className="h-full flex flex-col items-center justify-center p-12 text-center opacity-50" hoverable={false}>
                          <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-6">
                            <TrendingUp size={32} className="text-gray-500" />
                          </div>
                          <h4 className="text-lg font-black text-gray-900 uppercase tracking-widest">Awaiting Simulation</h4>
                          <p className="text-sm text-gray-500 max-w-xs mt-2">Enter your financial nodes on the left to activate projection engines.</p>
                       </GlassCard>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="loan"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-8"
            >
              {/* Form Card */}
              <GlassCard className="p-8 space-y-8" hoverable={false}>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-teal-100 border border-teal-500/20 flex items-center justify-center text-teal-400">
                    <Landmark size={24} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-gray-900">Eligibility Protocol</h3>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">Asset & Liability analysis</p>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="space-y-2">
                    <div className="flex justify-between items-end">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Annual Global Income (Lakhs)</label>
                      <span className="text-lg font-black text-teal-400">₹{loanForm.income || '0'}L</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="30"
                      step="0.5"
                      className="w-full h-2 bg-gray-100 rounded-full appearance-none cursor-pointer accent-teal-500"
                      value={loanForm.income}
                      onChange={(e) => setLoanForm({ ...loanForm, income: e.target.value })}
                    />
                    <div className="flex justify-between text-[8px] font-black text-gray-500 uppercase tracking-tighter">
                      <span>Low Tier</span>
                      <span>Mid-Market</span>
                      <span>High Capacity</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Safety Modifiers</label>
                    <div className="grid grid-cols-1 gap-3">
                      <button
                        onClick={() => setLoanForm({ ...loanForm, coApplicant: !loanForm.coApplicant })}
                        className={cn(
                          "flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 group",
                          loanForm.coApplicant ? "bg-teal-100 border-teal-500/40" : "bg-gray-100 border-gray-100 hover:border-gray-300"
                        )}
                      >
                        <div className="text-left">
                          <p className="text-xs font-black text-gray-900 uppercase tracking-widest">Co-Applicant</p>
                          <p className="text-[10px] text-gray-500 font-medium mt-0.5">Global guarantor integration</p>
                        </div>
                        <div className={cn("w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all", loanForm.coApplicant ? "bg-teal-500 border-teal-500" : "border-gray-200")}>
                          {loanForm.coApplicant && <CheckCircle size={14} className="text-gray-900" />}
                        </div>
                      </button>

                      <button
                        onClick={() => setLoanForm({ ...loanForm, collateral: !loanForm.collateral })}
                        className={cn(
                          "flex items-center justify-between p-4 rounded-2xl border transition-all duration-300",
                          loanForm.collateral ? "bg-blue-100 border-blue-500/40" : "bg-gray-100 border-gray-100 hover:border-gray-300"
                        )}
                      >
                        <div className="text-left">
                          <p className="text-xs font-black text-gray-900 uppercase tracking-widest">Secured Collateral</p>
                          <p className="text-[10px] text-gray-500 font-medium mt-0.5">Physical asset backing</p>
                        </div>
                        <div className={cn("w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all", loanForm.collateral ? "bg-blue-500 border-blue-500" : "border-gray-200")}>
                          {loanForm.collateral && <CheckCircle size={14} className="text-gray-900" />}
                        </div>
                      </button>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleLoan}
                  disabled={!loanForm.income}
                  className="w-full py-4 variant-teal"
                >
                  <Percent size={18} className="mr-2" />
                  Validate Credit Eligibility
                </Button>
              </GlassCard>

              {/* Loan Preview */}
              <div className="relative">
                <AnimatePresence mode="wait">
                  {loanResult ? (
                    <motion.div
                      key="loan-result"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="h-full"
                    >
                      <GlassCard className="p-8 space-y-8 h-full border-teal-500/20 shadow-teal-500/5" hoverable={false}>
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-gray-900">Credit Sanctioning</h3>
                            <p className="text-[10px] text-gray-500 font-bold tracking-widest uppercase">Verified against global standards</p>
                          </div>
                          <div className={cn("px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest animate-pulse-slow", 
                            loanResult.tier === 'High' ? "bg-teal-100 border-teal-500/30 text-teal-400" :
                            loanResult.tier === 'Medium' ? "bg-yellow-100 border-yellow-500/30 text-yellow-400" :
                            "bg-red-500/10 border-red-500/30 text-red-500"
                          )}>
                            {loanResult.label}
                          </div>
                        </div>

                        {/* Loan Range */}
                        <div className="relative py-8 px-6 bg-gray-100 border border-gray-200 rounded-3xl overflow-hidden flex flex-col items-center text-center">
                           <div className="absolute top-0 right-0 p-4 opacity-10">
                             <Landmark size={80} />
                           </div>
                           <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 mb-3 relative">Maximum Credit Limit</p>
                           <h2 className="text-4xl font-black text-gray-900 relative">
                            {formatINR(loanResult.loanMin)} – {formatINR(loanResult.loanMax)}
                           </h2>
                           <div className="mt-4 flex items-center gap-4">
                             <div className="flex flex-col">
                               <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Rate (APR)</span>
                               <span className="text-xl font-black text-teal-400">{loanResult.interestRate}%</span>
                             </div>
                             <div className="w-px h-8 bg-gray-200" />
                             <div className="flex flex-col">
                               <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Max Tenure</span>
                               <span className="text-xl font-black text-gray-900">10 <span className="text-xs text-gray-500">YRS</span></span>
                             </div>
                           </div>
                        </div>

                        {/* EMI Matrix */}
                        <div className="space-y-4">
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500">Monthly Repayment Simulation</h4>
                          <div className="p-6 glass bg-gradient-to-r from-teal-500/10 to-blue-500/10 border border-gray-100 rounded-2xl">
                             <div className="flex justify-between items-baseline mb-2">
                               <p className="text-[10px] font-black text-teal-700 uppercase tracking-widest">Estimated EMI</p>
                               <p className="text-2xl font-black text-gray-900 tracking-tight">
                                 {formatINR(loanResult.emiMin)} – {formatINR(loanResult.emiMax)}
                               </p>
                             </div>
                             <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                               <motion.div 
                                 initial={{ width: 0 }}
                                 animate={{ width: '100%' }}
                                 className="h-full bg-gradient-to-r from-teal-500 to-blue-500"
                               />
                             </div>
                             <p className="mt-3 text-[8px] font-black text-gray-500 uppercase tracking-widest leading-relaxed">
                               Simulation based on 10-year repayment lifecycle with monthly compounding.
                             </p>
                          </div>
                        </div>

                        {/* Applied Boosts */}
                        {(loanForm.coApplicant || loanForm.collateral) && (
                          <div className="flex flex-wrap gap-2">
                            {loanForm.coApplicant && (
                              <div className="flex items-center gap-2 px-3 py-2 bg-green-500/10 border border-green-500/20 rounded-xl">
                                <CheckCircle size={14} className="text-green-400" />
                                <span className="text-[9px] font-black text-green-400 uppercase tracking-widest">Co-Borrower Boost</span>
                              </div>
                            )}
                            {loanForm.collateral && (
                              <div className="flex items-center gap-2 px-3 py-2 bg-blue-100 border border-blue-500/20 rounded-xl">
                                <CheckCircle size={14} className="text-blue-400" />
                                <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Collateral Rate Applied</span>
                              </div>
                            )}
                          </div>
                        )}
                      </GlassCard>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="empty-loan"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="h-full"
                    >
                       <GlassCard className="h-full flex flex-col items-center justify-center p-12 text-center opacity-50" hoverable={false}>
                          <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-6">
                            <Landmark size={32} className="text-gray-500" />
                          </div>
                          <h4 className="text-lg font-black text-gray-900 uppercase tracking-widest">Eligibility Offline</h4>
                          <p className="text-sm text-gray-500 max-w-xs mt-2">Adjust your income flow on the left to initialize credit assessment.</p>
                       </GlassCard>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
}
