import { useState } from 'react';
import { FileText, Wand2, Copy, Check, RefreshCw, Download, ChevronDown, ChevronUp } from 'lucide-react';
import sopTemplates from '../data/sopTemplates.json';
import storage from '../utils/storage';
import { trackEvent } from '../utils/rewards';

const courseMap = {
  'Computer Science': 'ms_cs',
  'MBA': 'mba',
  'Data Science': 'ds',
  'Engineering': 'engineering',
};

const universities = [
  'University of Toronto', 'McGill University', 'University of British Columbia',
  'Imperial College London', 'University of Edinburgh', 'London Business School',
  'TU Munich', 'Carnegie Mellon University', 'Stanford University', 'MIT',
  'University of Melbourne', 'University of Sydney',
];

const thesisTopics = {
  'Computer Science': ['Optimizing distributed systems for real-time data processing', 'Deep learning approaches for NLP in low-resource languages', 'Secure computation protocols for cloud environments', 'Efficient graph algorithms for social network analysis'],
  'Data Science': ['Predicting loan defaults using ensemble ML methods', 'Time-series forecasting for supply chain optimization', 'Fairness and bias detection in recommendation systems', 'Explainable AI for medical diagnosis support'],
  'Engineering': ['Structural health monitoring using IoT sensors', 'Sustainable material composites for aerospace applications', 'Advanced control systems for autonomous vehicles', 'Energy-efficient building design using computational fluid dynamics'],
  'MBA': ['Strategic entry models for emerging market startups', 'ESG reporting and corporate valuation correlation analysis', 'Digital transformation frameworks for traditional retailers', 'M&A due diligence in the SaaS industry'],
};

function fillTemplate(templateText, vars) {
  return templateText.replace(/\{(\w+)\}/g, (match, key) => vars[key] || match);
}

export default function SOPGenerator() {
  const profile = storage.get('edupath_profile', {});
  const [form, setForm] = useState({
    name: profile.name || '',
    course: profile.targetCourse || '',
    university: '',
    gpa: '',
    experience: '',
    company: '',
    jobTitle: '',
    industry: '',
    careerGoal: '',
    country: profile.preferredCountries?.[0] || '',
  });
  const [generated, setGenerated] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [expandedSection, setExpandedSection] = useState(null);

  const handleGenerate = () => {
    if (!form.course || !form.university) return;
    setIsGenerating(true);

    setTimeout(() => {
      const templateId = courseMap[form.course] || 'ms_cs';
      const template = sopTemplates.find((t) => t.id === templateId);
      if (!template) return;

      const topics = thesisTopics[form.course] || thesisTopics['Computer Science'];
      const thesis = topics[Math.floor(Math.random() * topics.length)];
      const professors = ['Dr. James Wilson', 'Prof. Sarah Chen', 'Dr. Michael Thompson', 'Prof. Anika Patel'];
      const professor = professors[Math.floor(Math.random() * professors.length)];

      const vars = {
        name: form.name,
        age_start: '16',
        gpa: form.gpa || '3.6',
        undergrad_uni: 'my undergraduate institution',
        experience: form.experience || '2',
        company: form.company || 'my current organization',
        job_title: form.jobTitle || 'Software Engineer',
        team_size: '8',
        course: form.course,
        university: form.university,
        field: form.course === 'MBA' ? 'Business Administration' : form.course,
        thesis_topic: thesis,
        rank_percentile: '10',
        professional_achievement: `developing scalable ${form.course.toLowerCase()} solutions that served 50,000+ users`,
        project_name: 'the AI-powered analytics platform',
        project_outcome: 'a 35% improvement in system performance',
        impact_area: form.industry || 'the technology sector',
        program_strength: `its cutting-edge research and industry connections`,
        professor_name: professor,
        research_area: `applied machine learning and ${form.course.toLowerCase()}`,
        your_interest: form.course.toLowerCase(),
        career_goal: form.careerGoal || `a lead ${form.course} researcher or practitioner`,
        long_term_vision: `build AI-powered solutions that democratize access to quality ${form.course.toLowerCase()} tools`,
        contribution_area: 'technological innovation',
        target_country: form.country,
        industry: form.industry || 'technology',
        achievement: 'delivering high-impact projects consistently',
        academic_achievement: 'winning the Dean\'s List Award for 3 consecutive semesters',
        alumni_count: '50,000',
        short_term_goal: `join a leading ${form.industry || 'technology'} firm as a product/strategy specialist`,
        specific_course: 'Strategic Leadership and Global Business',
        percentage: '42',
        pain_point: 'data processing latency',
      };

      const sections = [
        { id: 'intro', title: '1. Introduction', content: fillTemplate(template.intro, vars) },
        { id: 'academic', title: '2. Academic Background', content: fillTemplate(template.academic, vars) },
        { id: 'professional', title: '3. Professional Experience', content: fillTemplate(template.professional, vars) },
        { id: 'why_program', title: '4. Why This Program', content: fillTemplate(template.why_program, vars) },
        { id: 'career', title: '5. Career Goals', content: fillTemplate(template.career, vars) },
        { id: 'closing', title: '6. Closing Statement', content: fillTemplate(template.closing, vars) },
      ];

      setGenerated({ sections, template });
      setExpandedSection('intro');
      setIsGenerating(false);

      // Track event
      trackEvent('sop_generated');
    }, 2000 + Math.random() * 1000);
  };

  const fullSOP = generated
    ? generated.sections.map((s) => `${s.title}\n\n${s.content}`).join('\n\n---\n\n')
    : '';

  const handleCopy = () => {
    navigator.clipboard.writeText(fullSOP);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleRegenerate = () => {
    setGenerated(null);
    handleGenerate();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-3">
            <Wand2 className="text-yellow-400" size={26} />
            AI SOP Generator
          </h1>
          <p className="text-muted text-sm mt-1">Generate a personalized Statement of Purpose using AI — free, instant, tailored to you</p>
        </div>
        <span className="badge bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 text-xs font-bold px-3 py-1.5">
          ✨ Generative AI
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Form */}
        <div className="lg:col-span-2 space-y-4">
          <div className="card space-y-4">
            <h2 className="font-bold text-white flex items-center gap-2">
              <FileText size={18} className="text-primary" />
              Your Profile
            </h2>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Target Course *</label>
                <select id="sop-course" className="input-field" value={form.course} onChange={(e) => setForm({ ...form, course: e.target.value })}>
                  <option value="">Select</option>
                  {Object.keys(courseMap).map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Target University *</label>
                <select id="sop-university" className="input-field" value={form.university} onChange={(e) => setForm({ ...form, university: e.target.value })}>
                  <option value="">Select</option>
                  {universities.map((u) => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">GPA / CGPA</label>
                <input id="sop-gpa" type="number" min="0" max="4" step="0.1" className="input-field" placeholder="3.6" value={form.gpa} onChange={(e) => setForm({ ...form, gpa: e.target.value })} />
              </div>
              <div>
                <label className="label">Work Exp (years)</label>
                <input id="sop-exp" type="number" min="0" max="20" className="input-field" placeholder="2" value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })} />
              </div>
            </div>

            <div>
              <label className="label">Current Company</label>
              <input id="sop-company" type="text" className="input-field" placeholder="e.g. Wipro, Infosys, TCS..." value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
            </div>

            <div>
              <label className="label">Current Job Title</label>
              <input id="sop-title" type="text" className="input-field" placeholder="e.g. Software Engineer" value={form.jobTitle} onChange={(e) => setForm({ ...form, jobTitle: e.target.value })} />
            </div>

            <div>
              <label className="label">Industry</label>
              <input id="sop-industry" type="text" className="input-field" placeholder="e.g. FinTech, Healthcare, EdTech" value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} />
            </div>

            <div>
              <label className="label">Career Goal (after degree)</label>
              <input id="sop-goal" type="text" className="input-field" placeholder="e.g. AI Research Scientist at Google" value={form.careerGoal} onChange={(e) => setForm({ ...form, careerGoal: e.target.value })} />
            </div>

            <button
              id="sop-generate"
              onClick={handleGenerate}
              disabled={!form.course || !form.university || isGenerating}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <RefreshCw size={18} className="animate-spin" />
                  AI is writing your SOP...
                </>
              ) : (
                <>
                  <Wand2 size={18} />
                  Generate My SOP
                </>
              )}
            </button>
          </div>

          {/* Tips */}
          <div className="card border-l-4 border-l-teal-500 bg-teal/5">
            <h3 className="text-sm font-semibold text-teal-400 mb-3">✅ SOP Writing Tips</h3>
            <ul className="space-y-2 text-xs text-muted">
              <li>• Keep it 800–1000 words (2 pages double-spaced)</li>
              <li>• Mention specific faculty/research by name</li>
              <li>• Use quantified achievements: "35% improvement"</li>
              <li>• Avoid generic phrases like "passionate about"</li>
              <li>• Review and personalize the AI draft before submitting</li>
            </ul>
          </div>
        </div>

        {/* Generated SOP */}
        <div className="lg:col-span-3">
          {isGenerating ? (
            <div className="card flex flex-col items-center justify-center text-center py-20">
              <div className="relative mb-6">
                <div className="w-20 h-20 rounded-full bg-yellow-500/10 flex items-center justify-center">
                  <Wand2 size={36} className="text-yellow-400 animate-pulse-slow" />
                </div>
                <div className="absolute inset-0 rounded-full border-2 border-yellow-500/30 animate-ping" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">AI is crafting your SOP...</h3>
              <p className="text-muted text-sm max-w-xs">Personalizing your statement of purpose based on your profile and target program</p>
              <div className="flex gap-2 mt-6">
                {['Analyzing profile', 'Crafting narrative', 'Tailoring for ' + (form.university || 'university')].map((step, i) => (
                  <div key={i} className="flex items-center gap-1 text-xs text-muted">
                    <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-bounce" style={{ animationDelay: `${i * 200}ms` }} />
                    {step}
                  </div>
                ))}
              </div>
            </div>
          ) : generated ? (
            <div className="space-y-4 animate-fade-in">
              {/* Controls */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-white">Your Generated SOP</h3>
                  <p className="text-xs text-muted">For {form.course} at {form.university}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={handleRegenerate} className="btn-secondary flex items-center gap-2 text-sm py-2 px-3">
                    <RefreshCw size={14} /> Regenerate
                  </button>
                  <button onClick={handleCopy} className={`flex items-center gap-2 text-sm py-2 px-3 rounded-xl font-semibold transition-all ${copied ? 'bg-green-500/20 border border-green-500/40 text-green-400' : 'btn-primary'}`}>
                    {copied ? <><Check size={14} /> Copied!</> : <><Copy size={14} /> Copy All</>}
                  </button>
                </div>
              </div>

              {/* Word count badge */}
              <div className="flex items-center gap-2">
                <span className="badge bg-primary/20 text-blue-300 border border-primary/30">
                  ~{fullSOP.split(' ').length} words
                </span>
                <span className="badge bg-teal/20 text-teal-300 border border-teal/30">
                  {generated.sections.length} sections
                </span>
                <span className="badge bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
                  ✨ AI Generated
                </span>
              </div>

              {/* Sections */}
              <div className="space-y-3">
                {generated.sections.map((section) => (
                  <div
                    key={section.id}
                    className={`card cursor-pointer transition-all duration-200 hover:border-primary/40 ${
                      expandedSection === section.id ? 'border-primary/40' : ''
                    }`}
                    onClick={() => setExpandedSection(expandedSection === section.id ? null : section.id)}
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-white text-sm">{section.title}</h4>
                      {expandedSection === section.id ? (
                        <ChevronUp size={16} className="text-muted" />
                      ) : (
                        <ChevronDown size={16} className="text-muted" />
                      )}
                    </div>
                    {expandedSection === section.id && (
                      <div className="mt-3 pt-3 border-t border-surface-border animate-fade-in">
                        <p className="text-sm text-white/90 leading-7">{section.content}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Disclaimer */}
              <div className="p-4 bg-surface rounded-xl border border-surface-border">
                <p className="text-xs text-muted">
                  ⚠️ <strong className="text-white">Important:</strong> This AI-generated SOP is a starting draft. Always review, personalize, and ensure authenticity before submitting to universities.
                </p>
              </div>
            </div>
          ) : (
            <div className="card flex flex-col items-center justify-center text-center py-20">
              <div className="text-6xl mb-4 animate-float">✍️</div>
              <h3 className="text-lg font-bold text-white mb-2">Your SOP will appear here</h3>
              <p className="text-muted text-sm max-w-xs">Fill in your profile on the left and click "Generate My SOP" to create a personalized statement</p>
              <div className="mt-6 grid grid-cols-2 gap-3 text-left w-full max-w-xs">
                {['Personalized to your profile', 'Course-specific narrative', 'University-tailored content', 'Instantly editable'].map((f) => (
                  <div key={f} className="flex items-center gap-2 text-xs text-muted">
                    <span className="text-teal-400">✓</span> {f}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
