import { useState } from 'react';
import { Calculator, Landmark, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import { calculateROI, calculateLoanEligibility } from '../utils/scoring';
import storage from '../utils/storage';
import { trackEvent } from '../utils/rewards';

const courses = ['Computer Science', 'MBA', 'Data Science', 'Engineering'];
const countries = ['Canada', 'UK', 'Australia', 'Germany', 'USA'];

function VerdictBadge({ verdict, color }) {
  const bgMap = {
    'Excellent': 'bg-green-500/20 border-green-500/40 text-green-400',
    'Good': 'bg-teal/20 border-teal/40 text-teal-400',
    'Average': 'bg-yellow-500/20 border-yellow-500/40 text-yellow-400',
    'Risky': 'bg-red-500/20 border-red-500/40 text-red-400',
    'Unknown': 'bg-surface border-surface-border text-muted',
  };
  return (
    <span className={`badge border ${bgMap[verdict] || bgMap['Unknown']} text-sm font-bold px-4 py-1.5`}>
      {verdict === 'Excellent' ? '🚀' : verdict === 'Good' ? '✅' : verdict === 'Average' ? '⚠️' : verdict === 'Risky' ? '❌' : '❓'} {verdict}
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
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white">Finance</h1>
        <p className="text-muted text-sm mt-1">Analyze your ROI and loan eligibility</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-surface rounded-xl border border-surface-border w-fit">
        <button
          id="tab-roi"
          onClick={() => setActiveTab('roi')}
          className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
            activeTab === 'roi' ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'text-muted hover:text-white'
          }`}
        >
          📈 ROI Calculator
        </button>
        <button
          id="tab-loan"
          onClick={() => setActiveTab('loan')}
          className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
            activeTab === 'loan' ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'text-muted hover:text-white'
          }`}
        >
          🏦 Loan Eligibility
        </button>
      </div>

      {/* ROI Calculator */}
      {activeTab === 'roi' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form */}
          <div className="card space-y-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <Calculator size={20} className="text-blue-400" />
              </div>
              <div>
                <h2 className="font-bold text-white">ROI Calculator</h2>
                <p className="text-xs text-muted">Return on Investment Analysis</p>
              </div>
            </div>

            <div>
              <label className="label">Target Course</label>
              <select
                id="roi-course"
                className="input-field"
                value={roiForm.course}
                onChange={(e) => setRoiForm({ ...roiForm, course: e.target.value })}
              >
                <option value="">Select course</option>
                {courses.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="label">Target Country</label>
              <select
                id="roi-country"
                className="input-field"
                value={roiForm.country}
                onChange={(e) => setRoiForm({ ...roiForm, country: e.target.value })}
              >
                <option value="">Select country</option>
                {countries.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="label">Total Course Cost (USD)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted font-bold">$</span>
                <input
                  id="roi-cost"
                  type="number"
                  className="input-field pl-8"
                  placeholder="e.g. 40000"
                  value={roiForm.cost}
                  onChange={(e) => setRoiForm({ ...roiForm, cost: e.target.value })}
                />
              </div>
            </div>

            <button
              id="roi-calculate"
              onClick={handleROI}
              disabled={!roiForm.course || !roiForm.country || !roiForm.cost}
              className="btn-primary w-full disabled:opacity-50"
            >
              Calculate ROI
            </button>
          </div>

          {/* Result */}
          {roiResult ? (
            <div className="card space-y-5 animate-bounce-in">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-white">ROI Analysis</h3>
                <VerdictBadge verdict={roiResult.verdict} color={roiResult.color} />
              </div>

              {/* Gauge-like visual */}
              <div className="bg-surface rounded-2xl p-4 text-center">
                <p className="text-sm text-muted mb-1">Net ROI (Salary - Cost)</p>
                <p className={`text-4xl font-black ${roiResult.color}`}>
                  {roiResult.roi >= 0 ? '+' : ''}{formatCurrency(roiResult.roi)}
                </p>
                <p className="text-xs text-muted mt-1">per year advantage</p>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-surface rounded-xl p-4">
                  <p className="text-xs text-muted mb-1">Avg. Starting Salary</p>
                  <p className="text-xl font-bold text-white">{formatCurrency(roiResult.avgSalary)}</p>
                  <p className="text-xs text-muted">USD/year</p>
                </div>
                <div className="bg-surface rounded-xl p-4">
                  <p className="text-xs text-muted mb-1">Break-even Time</p>
                  <p className="text-xl font-bold text-white">{roiResult.breakEvenMonths}</p>
                  <p className="text-xs text-muted">months</p>
                </div>
              </div>

              {/* Break-even bar */}
              <div>
                <div className="flex justify-between text-xs text-muted mb-2">
                  <span>Break-even progress</span>
                  <span>{Math.min(roiResult.breakEvenMonths, 48)} / 48 months</span>
                </div>
                <div className="w-full bg-surface rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-2.5 rounded-full bg-gradient-to-r ${
                      roiResult.breakEvenMonths <= 18 ? 'from-green-500 to-teal' :
                      roiResult.breakEvenMonths <= 36 ? 'from-yellow-500 to-orange-500' :
                      'from-orange-500 to-red-500'
                    }`}
                    style={{ width: `${Math.min((roiResult.breakEvenMonths / 48) * 100, 100)}%` }}
                  />
                </div>
              </div>

              {/* Description */}
              <div className={`flex items-start gap-2 p-3 rounded-xl ${
                roiResult.verdict === 'Excellent' || roiResult.verdict === 'Good' ? 'bg-teal/10 border border-teal/20' :
                roiResult.verdict === 'Average' ? 'bg-yellow-500/10 border border-yellow-500/20' :
                'bg-red-500/10 border border-red-500/20'
              }`}>
                {roiResult.verdict === 'Risky' ? <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" /> : <CheckCircle size={16} className="text-teal-400 flex-shrink-0 mt-0.5" />}
                <p className="text-sm text-white">{roiResult.description}</p>
              </div>
            </div>
          ) : (
            <div className="card flex flex-col items-center justify-center text-center py-12">
              <TrendingUp size={48} className="text-muted mb-3" />
              <p className="text-white font-semibold">Fill the form to see your ROI</p>
              <p className="text-muted text-sm mt-1">We'll calculate your salary vs cost analysis</p>
            </div>
          )}
        </div>
      )}

      {/* Loan Eligibility */}
      {activeTab === 'loan' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form */}
          <div className="card space-y-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-teal/20 flex items-center justify-center">
                <Landmark size={20} className="text-teal-400" />
              </div>
              <div>
                <h2 className="font-bold text-white">Loan Eligibility Engine</h2>
                <p className="text-xs text-muted">Rule-based eligibility assessment</p>
              </div>
            </div>

            <div>
              <label className="label">Annual Family Income (₹ Lakhs)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted font-bold text-sm">₹</span>
                <input
                  id="loan-income"
                  type="number"
                  className="input-field pl-8"
                  placeholder="e.g. 6.5"
                  value={loanForm.income}
                  onChange={(e) => setLoanForm({ ...loanForm, income: e.target.value })}
                />
              </div>
              <p className="text-xs text-muted mt-1">
                &gt;8L = High | 5–8L = Medium | &lt;5L = Low eligibility
              </p>
            </div>

            <div className="space-y-3">
              <label className="label">Additional Factors</label>

              <div
                id="loan-co-applicant"
                className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                  loanForm.coApplicant ? 'bg-primary/15 border-primary/40' : 'bg-surface border-surface-border hover:border-surface-border/80'
                }`}
                onClick={() => setLoanForm({ ...loanForm, coApplicant: !loanForm.coApplicant })}
              >
                <div>
                  <p className="text-white font-medium text-sm">Co-Applicant Available</p>
                  <p className="text-muted text-xs">Parent/guardian as co-borrower</p>
                </div>
                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                  loanForm.coApplicant ? 'bg-primary border-primary' : 'border-surface-border'
                }`}>
                  {loanForm.coApplicant && <span className="text-white text-xs">✓</span>}
                </div>
              </div>

              <div
                id="loan-collateral"
                className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                  loanForm.collateral ? 'bg-teal/15 border-teal/40' : 'bg-surface border-surface-border hover:border-surface-border/80'
                }`}
                onClick={() => setLoanForm({ ...loanForm, collateral: !loanForm.collateral })}
              >
                <div>
                  <p className="text-white font-medium text-sm">Collateral Available</p>
                  <p className="text-muted text-xs">Property/FD as security</p>
                </div>
                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                  loanForm.collateral ? 'bg-teal border-teal' : 'border-surface-border'
                }`}>
                  {loanForm.collateral && <span className="text-white text-xs">✓</span>}
                </div>
              </div>
            </div>

            <button
              id="loan-check"
              onClick={handleLoan}
              disabled={!loanForm.income}
              className="btn-teal w-full disabled:opacity-50"
            >
              Check Loan Eligibility
            </button>
          </div>

          {/* Result */}
          {loanResult ? (
            <div className="card space-y-5 animate-bounce-in">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-white">Loan Assessment</h3>
                <span className={`badge border text-sm font-bold px-4 py-1.5 ${
                  loanResult.tier === 'High' ? 'bg-green-500/20 border-green-500/40 text-green-400' :
                  loanResult.tier === 'Medium' ? 'bg-yellow-500/20 border-yellow-500/40 text-yellow-400' :
                  'bg-red-500/20 border-red-500/40 text-red-400'
                }`}>
                  {loanResult.label}
                </span>
              </div>

              {/* Loan range */}
              <div className="bg-gradient-to-br from-primary/20 to-teal/10 rounded-2xl p-5 text-center border border-primary/20">
                <p className="text-sm text-muted mb-1">Eligible Loan Amount</p>
                <p className="text-3xl font-black text-white">
                  {formatINR(loanResult.loanMin)} – {formatINR(loanResult.loanMax)}
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-surface rounded-xl p-4">
                  <p className="text-xs text-muted mb-1">Interest Rate</p>
                  <p className="text-2xl font-bold text-white">{loanResult.interestRate}%</p>
                  <p className="text-xs text-muted">per annum</p>
                </div>
                <div className="bg-surface rounded-xl p-4">
                  <p className="text-xs text-muted mb-1">Loan Tenure</p>
                  <p className="text-2xl font-bold text-white">10</p>
                  <p className="text-xs text-muted">years</p>
                </div>
              </div>

              {/* EMI */}
              <div className="bg-surface rounded-xl p-4">
                <p className="text-xs text-muted mb-2">Monthly EMI Range (10 yr tenure)</p>
                <p className="text-xl font-bold text-white">
                  {formatINR(loanResult.emiMin)} – {formatINR(loanResult.emiMax)}
                </p>
                <p className="text-xs text-muted mt-1">Estimate only; actual rates may vary by bank</p>
              </div>

              {/* Boosts */}
              {(loanForm.coApplicant || loanForm.collateral) && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted uppercase tracking-wider">Applied Boosts</p>
                  {loanForm.coApplicant && (
                    <div className="flex items-center gap-2 text-sm text-green-400">
                      <CheckCircle size={14} /> Co-applicant: higher loan ceiling applied
                    </div>
                  )}
                  {loanForm.collateral && (
                    <div className="flex items-center gap-2 text-sm text-teal-400">
                      <CheckCircle size={14} /> Collateral: lower interest rate applied
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="card flex flex-col items-center justify-center text-center py-12">
              <Landmark size={48} className="text-muted mb-3" />
              <p className="text-white font-semibold">Enter your details to check eligibility</p>
              <p className="text-muted text-sm mt-1">Get a personalized loan assessment</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
