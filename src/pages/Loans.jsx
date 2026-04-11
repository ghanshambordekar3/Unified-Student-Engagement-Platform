import { useState, useEffect } from 'react';
import { Landmark, CheckCircle, ChevronRight, Star, AlertCircle, FileCheck, Calculator, Send } from 'lucide-react';
import loanOffersData from '../data/loanOffers.json';
import storage from '../utils/storage';
import { calculateLoanEligibility } from '../utils/scoring';
import { trackEvent } from '../utils/rewards';
import ProgressBar from '../components/ProgressBar';

const LOAN_APP_KEY = 'edupath_loan_application';

const steps = [
  { id: 1, title: 'Eligibility Check', icon: '🔍' },
  { id: 2, title: 'Loan Offers', icon: '🏦' },
  { id: 3, title: 'EMI Planner', icon: '📊' },
  { id: 4, title: 'Apply', icon: '📝' },
  { id: 5, title: 'Documents', icon: '📋' },
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
    loanAmount: saved?.loanAmount || '',
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

  // Filter offers based on eligibility tier
  const filteredOffers = loanOffersData.filter((o) => {
    if (!eligResult) return true;
    return parseFloat(eligForm.income) >= o.incomeMin;
  });

  const handleSelectOffer = (offer) => {
    setSelectedOffer(offer);
    setStep(3);
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
    ? parseFloat(eligForm.loanAmount) * 100000  // in lakhs to rupees
    : eligResult?.loanMax || 2000000;
  const emi = selectedOffer ? calcEMI(loanAmount, parseFloat(selectedOffer.interest), tenure * 12) : 0;
  const totalPayable = emi * tenure * 12;
  const totalInterest = totalPayable - loanAmount;

  // Auto-fill document list based on profile
  const docChecklist = [
    { label: 'Passport (self)', done: true, prefilled: true },
    { label: `Admission offer letter from ${profile.targetCourse ? 'university' : '[University Name]'}`, done: true, prefilled: true },
    { label: 'Income proof (Form 16 / ITR last 2 years)', done: false, prefilled: false },
    { label: 'Bank statements (last 6 months)', done: false, prefilled: false },
    { label: 'Academic transcripts', done: false, prefilled: false },
    { label: 'Identity proof (Aadhaar / PAN)', done: false, prefilled: false },
    { label: eligForm.coApplicant ? 'Co-applicant income proof ✅ added' : 'Co-applicant income proof (optional)', done: eligForm.coApplicant, prefilled: eligForm.coApplicant },
    { label: eligForm.collateral ? 'Collateral documents ✅ added' : 'Collateral documents (if applicable)', done: eligForm.collateral, prefilled: eligForm.collateral },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-3">
          <Landmark className="text-teal-400" size={26} />
          Loan Conversion Hub
        </h1>
        <p className="text-muted text-sm mt-1">End-to-end education loan journey — eligibility to application</p>
      </div>

      {/* Step Progress */}
      <div className="card p-4">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-surface-border mx-8" />
          {steps.map((s) => (
            <div key={s.id} className="relative flex flex-col items-center gap-1 cursor-pointer" onClick={() => s.id < step && setStep(s.id)}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg border-2 transition-all duration-300 z-10 ${
                step === s.id ? 'bg-primary border-primary shadow-lg shadow-primary/40' :
                step > s.id ? 'bg-teal border-teal' : 'bg-surface border-surface-border'
              }`}>
                {step > s.id ? '✓' : s.icon}
              </div>
              <span className={`text-xs font-medium hidden sm:block ${step >= s.id ? 'text-white' : 'text-muted'}`}>
                {s.title}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Step 1: Eligibility */}
      {step === 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card space-y-5">
            <h2 className="font-bold text-white flex items-center gap-2">🔍 Eligibility Check</h2>
            <p className="text-sm text-muted">Tell us about your financial background to find the best loan options.</p>

            <div>
              <label className="label">Family Annual Income (₹ Lakhs) *</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted font-bold text-sm">₹</span>
                <input id="loan-income" type="number" className="input-field pl-8" placeholder="e.g. 7.5" value={eligForm.income} onChange={(e) => setEligForm({ ...eligForm, income: e.target.value })} />
              </div>
            </div>

            <div>
              <label className="label">Loan Amount Required (₹ Lakhs)</label>
              <input id="loan-amount" type="number" className="input-field" placeholder="e.g. 25 (for ₹25L)" value={eligForm.loanAmount} onChange={(e) => setEligForm({ ...eligForm, loanAmount: e.target.value })} />
            </div>

            <div className="space-y-3">
              {[
                { key: 'coApplicant', label: 'Co-Applicant Available', sub: 'Increases loan ceiling & lowers rate', icon: '👥' },
                { key: 'collateral', label: 'Collateral Available', sub: 'Property or FD as security', icon: '🏠' },
              ].map(({ key, label, sub, icon }) => (
                <div key={key}
                  className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                    eligForm[key] ? 'bg-primary/15 border-primary/40' : 'bg-surface border-surface-border hover:border-primary/20'
                  }`}
                  onClick={() => setEligForm({ ...eligForm, [key]: !eligForm[key] })}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{icon}</span>
                    <div>
                      <p className="text-sm font-medium text-white">{label}</p>
                      <p className="text-xs text-muted">{sub}</p>
                    </div>
                  </div>
                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center ${eligForm[key] ? 'bg-primary border-primary' : 'border-surface-border'}`}>
                    {eligForm[key] && <span className="text-white text-xs font-bold">✓</span>}
                  </div>
                </div>
              ))}
            </div>

            <button id="loan-check-eligibility" onClick={handleEligibility} disabled={!eligForm.income} className="btn-teal w-full disabled:opacity-50">
              Check My Eligibility →
            </button>
          </div>

          <div className="card flex flex-col justify-center items-center text-center py-10 bg-gradient-to-br from-teal/10 to-primary/10 border-teal/20">
            <div className="text-5xl mb-4">🏦</div>
            <h3 className="font-bold text-white mb-2">How It Works</h3>
            <div className="space-y-3 text-left w-full max-w-xs mt-4">
              {steps.map((s) => (
                <div key={s.id} className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-surface border border-surface-border flex items-center justify-center text-sm flex-shrink-0">{s.icon}</div>
                  <span className="text-sm text-muted">{s.title}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Loan Offers */}
      {step === 2 && eligResult && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-white">🏦 Personalized Loan Offers</h2>
            <span className={`badge border font-semibold ${
              eligResult.tier === 'High' ? 'bg-green-500/20 border-green-500/40 text-green-400' :
              eligResult.tier === 'Medium' ? 'bg-yellow-500/20 border-yellow-500/40 text-yellow-400' :
              'bg-red-500/20 border-red-500/40 text-red-400'
            }`}>{eligResult.label}</span>
          </div>

          <div className="card bg-gradient-to-r from-primary/10 to-teal/10 border-primary/20 flex items-center gap-4 flex-wrap">
            <div className="text-3xl">💡</div>
            <div>
              <p className="font-semibold text-white">Your eligible loan range: {formatINR(eligResult.loanMin)} – {formatINR(eligResult.loanMax)}</p>
              <p className="text-sm text-muted">Based on family income of ₹{eligForm.income}L{eligForm.coApplicant ? ' + co-applicant' : ''}{eligForm.collateral ? ' + collateral' : ''}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredOffers.map((offer) => (
              <div key={offer.id} className={`card-hover group relative overflow-hidden ${selectedOffer?.id === offer.id ? 'border-primary/60' : ''}`}>
                {offer.tag && (
                  <div className="absolute top-3 right-3">
                    <span className="badge bg-primary/20 border border-primary/30 text-blue-300 text-xs">{offer.tag}</span>
                  </div>
                )}
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">{offer.logo}</span>
                  <div>
                    <h3 className="font-bold text-white text-sm">{offer.bank}</h3>
                    <p className="text-xs text-muted">{offer.name}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="bg-surface rounded-lg p-2 text-center">
                    <p className="text-xs text-muted">Max Loan</p>
                    <p className="text-sm font-bold text-white">{formatINR(offer.maxAmount)}</p>
                  </div>
                  <div className="bg-surface rounded-lg p-2 text-center">
                    <p className="text-xs text-muted">Interest</p>
                    <p className="text-sm font-bold text-white">{offer.interest}%</p>
                  </div>
                </div>

                <div className="space-y-1 mb-4">
                  {offer.features.slice(0, 3).map((f) => (
                    <div key={f} className="flex items-center gap-1.5 text-xs text-muted">
                      <CheckCircle size={12} className="text-teal-400 flex-shrink-0" /> {f}
                    </div>
                  ))}
                </div>

                <button
                  id={`loan-select-${offer.id}`}
                  onClick={() => handleSelectOffer(offer)}
                  className="btn-primary w-full text-sm flex items-center justify-center gap-2"
                >
                  Select This Offer <ChevronRight size={14} />
                </button>
              </div>
            ))}
          </div>

          <button onClick={() => setStep(1)} className="text-sm text-muted hover:text-white transition-colors">← Back to eligibility check</button>
        </div>
      )}

      {/* Step 3: EMI Planner */}
      {step === 3 && selectedOffer && (
        <div className="space-y-6">
          <h2 className="font-bold text-white">📊 EMI Planner</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card space-y-5">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{selectedOffer.logo}</span>
                <div>
                  <h3 className="font-bold text-white">{selectedOffer.name}</h3>
                  <p className="text-sm text-muted">{selectedOffer.interest}% p.a. interest</p>
                </div>
              </div>

              <div>
                <label className="label">Loan Amount (₹)</label>
                <input type="number" className="input-field" placeholder="e.g. 2500000" value={loanAmount} onChange={(e) => {}} readOnly />
                <p className="text-xs text-muted mt-1">Adjust in Step 1 eligibility form</p>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <label className="label mb-0">Repayment Tenure</label>
                  <span className="text-sm font-bold text-white">{tenure} years</span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {selectedOffer.tenure.map((t) => (
                    <button
                      key={t}
                      onClick={() => setTenure(t)}
                      className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                        tenure === t ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-surface border border-surface-border text-muted hover:text-white'
                      }`}
                    >
                      {t} yrs
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs text-muted mb-3">Moratorium Period</p>
                <div className="bg-surface rounded-xl p-3 border border-surface-border">
                  <p className="text-sm text-white">{selectedOffer.moratorium}</p>
                  <p className="text-xs text-muted mt-1">No EMI during this period</p>
                </div>
              </div>

              <button onClick={() => setStep(4)} className="btn-teal w-full flex items-center justify-center gap-2">
                Proceed to Application <ChevronRight size={16} />
              </button>
            </div>

            <div className="card space-y-4">
              <h3 className="font-semibold text-white">EMI Breakdown</h3>

              <div className="bg-gradient-to-br from-primary/20 to-teal/10 rounded-2xl p-6 text-center border border-primary/20">
                <p className="text-sm text-muted mb-1">Monthly EMI</p>
                <p className="text-4xl font-black text-white">{formatINR(emi)}</p>
                <p className="text-xs text-muted mt-1">for {tenure} years</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-surface rounded-xl p-4 text-center">
                  <p className="text-xs text-muted mb-1">Principal</p>
                  <p className="text-lg font-bold text-white">{formatINR(loanAmount)}</p>
                </div>
                <div className="bg-surface rounded-xl p-4 text-center">
                  <p className="text-xs text-muted mb-1">Total Interest</p>
                  <p className="text-lg font-bold text-red-400">{formatINR(totalInterest)}</p>
                </div>
              </div>

              <div className="bg-surface rounded-xl p-4">
                <div className="flex justify-between text-sm mb-3">
                  <span className="text-muted">Principal</span>
                  <span className="text-white font-medium">{Math.round((loanAmount / totalPayable) * 100)}%</span>
                </div>
                <ProgressBar
                  percentage={Math.round((loanAmount / totalPayable) * 100)}
                  color="from-primary to-teal"
                  showLabel={false}
                  height="h-3"
                />
                <div className="flex justify-between text-xs text-muted mt-2">
                  <span>Principal: {formatINR(loanAmount)}</span>
                  <span>Total: {formatINR(totalPayable)}</span>
                </div>
              </div>

              {/* Tax benefit */}
              <div className="flex items-start gap-2 p-3 bg-teal/10 border border-teal/20 rounded-xl">
                <Star size={14} className="text-yellow-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-muted">
                  <strong className="text-white">Tax benefit u/s 80E:</strong> Full interest paid on education loan is deductible from taxable income for up to 8 years.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Application Form */}
      {step === 4 && (
        <div className="space-y-6">
          <h2 className="font-bold text-white">📝 Loan Application</h2>

          {appSubmitted ? (
            <div className="card text-center py-12 border border-green-500/30 bg-green-500/5 animate-bounce-in">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-2xl font-black text-white mb-2">Application Submitted!</h3>
              <p className="text-muted mb-6">Your loan application with <strong className="text-white">{selectedOffer?.bank}</strong> has been submitted. You'll receive a call within 48 hours.</p>
              <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mb-6">
                <div className="bg-surface rounded-xl p-3 text-center">
                  <p className="text-xs text-muted">Bank</p>
                  <p className="text-sm font-bold text-white">{selectedOffer?.bank}</p>
                </div>
                <div className="bg-surface rounded-xl p-3 text-center">
                  <p className="text-xs text-muted">Rate</p>
                  <p className="text-sm font-bold text-white">{selectedOffer?.interest}%</p>
                </div>
                <div className="bg-surface rounded-xl p-3 text-center">
                  <p className="text-xs text-muted">Status</p>
                  <p className="text-sm font-bold text-green-400">Pending</p>
                </div>
              </div>
              <button onClick={() => setStep(5)} className="btn-primary flex items-center justify-center gap-2 mx-auto">
                View Document Checklist <ChevronRight size={16} />
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card space-y-4">
                <h3 className="font-semibold text-white flex items-center gap-2">
                  <span className="text-xl">{selectedOffer?.logo}</span> Apply with {selectedOffer?.bank}
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">Full Name</label>
                    <input className="input-field" value={appForm.fullName} onChange={(e) => setAppForm({ ...appForm, fullName: e.target.value })} placeholder="Your full name" />
                  </div>
                  <div>
                    <label className="label">Phone Number</label>
                    <input className="input-field" value={appForm.phone} onChange={(e) => setAppForm({ ...appForm, phone: e.target.value })} placeholder="+91 98765 43210" />
                  </div>
                </div>

                <div>
                  <label className="label">Email Address</label>
                  <input type="email" className="input-field" value={appForm.email} onChange={(e) => setAppForm({ ...appForm, email: e.target.value })} placeholder="you@email.com" />
                </div>

                <div>
                  <label className="label">University Name</label>
                  <input className="input-field" value={appForm.universityName} onChange={(e) => setAppForm({ ...appForm, universityName: e.target.value })} placeholder="University you're applying to" />
                </div>

                <div>
                  <label className="label">Course Start Date</label>
                  <input type="date" className="input-field" value={appForm.courseStart} onChange={(e) => setAppForm({ ...appForm, courseStart: e.target.value })} />
                </div>

                <div>
                  <label className="label">Current Address</label>
                  <textarea className="input-field h-20 resize-none" value={appForm.address} onChange={(e) => setAppForm({ ...appForm, address: e.target.value })} placeholder="Your full address" />
                </div>

                <button
                  id="loan-submit-application"
                  onClick={handleSubmitApp}
                  disabled={!appForm.fullName || !appForm.phone || !appForm.email}
                  className="btn-teal w-full flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Send size={16} /> Submit Application
                </button>
              </div>

              <div className="card bg-surface space-y-4">
                <h3 className="font-semibold text-white">Application Summary</h3>
                {[
                  { label: 'Bank', value: selectedOffer?.bank },
                  { label: 'Loan Amount', value: formatINR(loanAmount) },
                  { label: 'Interest Rate', value: `${selectedOffer?.interest}% p.a.` },
                  { label: 'Tenure', value: `${tenure} years` },
                  { label: 'Monthly EMI', value: formatINR(emi) },
                  { label: 'Co-Applicant', value: eligForm.coApplicant ? 'Yes ✓' : 'No' },
                  { label: 'Collateral', value: eligForm.collateral ? 'Yes ✓' : 'No' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between py-2 border-b border-surface-border last:border-0">
                    <span className="text-sm text-muted">{label}</span>
                    <span className="text-sm font-semibold text-white">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 5: Documents */}
      {step === 5 && (
        <div className="space-y-5">
          <h2 className="font-bold text-white">📋 Document Checklist</h2>

          <div className="card border border-teal/20 bg-teal/5 flex items-start gap-3">
            <FileCheck size={20} className="text-teal-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-white text-sm">Auto-filled from your profile</p>
              <p className="text-xs text-muted">Documents marked ✅ were identified from your onboarding profile. Collect the remaining ones.</p>
            </div>
          </div>

          <div className="card space-y-3">
            {docChecklist.map((doc, i) => (
              <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                doc.done ? 'bg-teal/10 border-teal/20' : 'bg-surface border-surface-border'
              }`}>
                <div className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 ${
                  doc.done ? 'bg-teal border-teal border-2' : 'border-2 border-surface-border'
                }`}>
                  {doc.done && <span className="text-white text-xs font-bold">✓</span>}
                </div>
                <span className={`text-sm flex-1 ${doc.done ? 'text-muted line-through' : 'text-white'}`}>{doc.label}</span>
                {doc.prefilled && <span className="text-xs text-teal-400 font-medium">Auto-detected</span>}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="card text-center">
              <p className="text-3xl font-black text-white">{docChecklist.filter((d) => d.done).length}</p>
              <p className="text-sm text-muted">Ready</p>
            </div>
            <div className="card text-center">
              <p className="text-3xl font-black text-red-400">{docChecklist.filter((d) => !d.done).length}</p>
              <p className="text-sm text-muted">Pending</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
