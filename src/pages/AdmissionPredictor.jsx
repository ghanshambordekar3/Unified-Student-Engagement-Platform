import { useState } from 'react';
import { TrendingUp, Info } from 'lucide-react';
import { calculateAdmissionScore } from '../utils/scoring';
import { trackEvent } from '../utils/rewards';

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

  const getBarColor = (score) => {
    if (score >= 70) return 'from-green-500 to-emerald-400';
    if (score >= 50) return 'from-yellow-500 to-amber-400';
    return 'from-red-500 to-orange-400';
  };

  const getGlowColor = (score) => {
    if (score >= 70) return 'shadow-green-500/30';
    if (score >= 50) return 'shadow-yellow-500/30';
    return 'shadow-red-500/30';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white">Admission Predictor</h1>
        <p className="text-muted text-sm mt-1">Know your chances before you apply</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <div className="card space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <TrendingUp size={20} className="text-purple-400" />
            </div>
            <div>
              <h2 className="font-bold text-white">Your Academic Profile</h2>
              <p className="text-xs text-muted">Score = GPA×10 + IELTS×5 + Experience×2</p>
            </div>
          </div>

          {/* GPA */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="label mb-0">GPA / CGPA</label>
              <span className="text-xs text-muted">Scale of 0–4.0</span>
            </div>
            <input
              id="predictor-gpa"
              type="number"
              min="0"
              max="4"
              step="0.1"
              className="input-field"
              placeholder="e.g. 3.5"
              value={form.gpa}
              onChange={(e) => setForm({ ...form, gpa: e.target.value })}
            />
            {form.gpa && (
              <div className="mt-2">
                <div className="w-full bg-surface rounded-full h-2 overflow-hidden">
                  <div
                    className="h-2 bg-gradient-to-r from-primary to-teal rounded-full transition-all duration-500"
                    style={{ width: `${(Math.min(parseFloat(form.gpa || 0), 4) / 4) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* IELTS */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="label mb-0">IELTS Overall Band</label>
              <span className="text-xs text-muted">Band 0–9.0</span>
            </div>
            <input
              id="predictor-ielts"
              type="number"
              min="0"
              max="9"
              step="0.5"
              className="input-field"
              placeholder="e.g. 7.0"
              value={form.ielts}
              onChange={(e) => setForm({ ...form, ielts: e.target.value })}
            />
            <div className="flex gap-2 mt-2">
              {[6.0, 6.5, 7.0, 7.5, 8.0].map((band) => (
                <button
                  key={band}
                  onClick={() => setForm({ ...form, ielts: band.toString() })}
                  className={`px-2 py-1 rounded-lg text-xs font-medium transition-colors ${
                    parseFloat(form.ielts) === band
                      ? 'bg-primary text-white'
                      : 'bg-surface text-muted hover:text-white border border-surface-border'
                  }`}
                >
                  {band}
                </button>
              ))}
            </div>
          </div>

          {/* Experience */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="label mb-0">Work Experience</label>
              <span className="text-xs text-muted">Years (0–10+)</span>
            </div>
            <input
              id="predictor-experience"
              type="number"
              min="0"
              max="20"
              step="1"
              className="input-field"
              placeholder="e.g. 2"
              value={form.experience}
              onChange={(e) => setForm({ ...form, experience: e.target.value })}
            />
            <div className="flex gap-2 mt-2 flex-wrap">
              {[0, 1, 2, 3, 5, 7].map((yr) => (
                <button
                  key={yr}
                  onClick={() => setForm({ ...form, experience: yr.toString() })}
                  className={`px-2 py-1 rounded-lg text-xs font-medium transition-colors ${
                    parseInt(form.experience) === yr
                      ? 'bg-teal text-white'
                      : 'bg-surface text-muted hover:text-white border border-surface-border'
                  }`}
                >
                  {yr}yr{yr !== 1 ? 's' : ''}
                </button>
              ))}
            </div>
          </div>

          <button
            id="predictor-submit"
            onClick={handlePredict}
            disabled={!form.gpa || !form.ielts || form.experience === ''}
            className="btn-primary w-full disabled:opacity-50"
          >
            Predict My Chances
          </button>

          {/* Formula info */}
          <div className="flex items-start gap-2 p-3 bg-surface rounded-xl">
            <Info size={14} className="text-muted flex-shrink-0 mt-0.5" />
            <p className="text-xs text-muted">
              Score formula: (GPA/4.0)×40 + (IELTS/9.0)×35 + min(Experience,5)×5.
              Max score = 100. ≥70 = High | 50–69 = Medium | &lt;50 = Low probability.
            </p>
          </div>
        </div>

        {/* Result */}
        {result ? (
          <div className={`card space-y-6 animate-bounce-in shadow-2xl ${getGlowColor(result.score)}`}>
            <div className="text-center">
              <h3 className="font-bold text-white mb-1">Your Admission Score</h3>
              <p className="text-xs text-muted">Based on GPA, IELTS, and work experience</p>
            </div>

            {/* Big score */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative w-40 h-40">
                <svg className="w-40 h-40 progress-ring" viewBox="0 0 140 140">
                  <circle cx="70" cy="70" r="60" className="text-surface-border" fill="none" stroke="currentColor" strokeWidth="12" />
                  <circle
                    cx="70"
                    cy="70"
                    r="60"
                    fill="none"
                    className={`text-transparent`}
                    stroke={result.score >= 70 ? '#22c55e' : result.score >= 50 ? '#eab308' : '#ef4444'}
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeDasharray="376.99"
                    strokeDashoffset={animated ? 376.99 * (1 - result.score / 100) : 376.99}
                    style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)' }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-black text-white">{result.score}</span>
                  <span className="text-xs text-muted">/ 100</span>
                </div>
              </div>

              <span className={`badge px-5 py-2 text-base font-bold ${
                result.score >= 70 ? 'bg-green-500/20 border border-green-500/40 text-green-400' :
                result.score >= 50 ? 'bg-yellow-500/20 border border-yellow-500/40 text-yellow-400' :
                'bg-red-500/20 border border-red-500/40 text-red-400'
              }`}>
                {result.label}
              </span>
            </div>

            {/* Score breakdown */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-muted uppercase tracking-wider">Score Breakdown</h4>
              {[
                { label: 'GPA Contribution', value: Math.round((parseFloat(form.gpa) / 4.0) * 40), max: 40, color: 'from-primary to-blue-400' },
                { label: 'IELTS Contribution', value: Math.round((parseFloat(form.ielts) / 9.0) * 35), max: 35, color: 'from-teal to-cyan-400' },
                { label: 'Experience Contribution', value: Math.min(parseFloat(form.experience), 5) * 5, max: 25, color: 'from-purple-500 to-purple-400' },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between text-xs text-muted mb-1">
                    <span>{item.label}</span>
                    <span>{item.value}/{item.max}</span>
                  </div>
                  <div className="w-full bg-surface rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full bg-gradient-to-r ${item.color} transition-all duration-1000 ease-out`}
                      style={{ width: animated ? `${(item.value / item.max) * 100}%` : '0%' }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Description */}
            <div className={`p-4 rounded-xl border ${
              result.score >= 70 ? 'bg-green-500/10 border-green-500/20' :
              result.score >= 50 ? 'bg-yellow-500/10 border-yellow-500/20' :
              'bg-red-500/10 border-red-500/20'
            }`}>
              <p className="text-sm text-white">{result.description}</p>
            </div>
          </div>
        ) : (
          <div className="card flex flex-col items-center justify-center text-center py-12">
            <div className="text-6xl mb-4 animate-float">🎓</div>
            <p className="text-white font-semibold">Fill your profile to see your chances</p>
            <p className="text-muted text-sm mt-1">We'll calculate a personalized admission score</p>
          </div>
        )}
      </div>
    </div>
  );
}
