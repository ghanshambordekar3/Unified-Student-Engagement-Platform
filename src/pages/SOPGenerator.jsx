import { useState } from 'react';
import { FileText, Wand2, Copy, Check, RefreshCw, Sparkles, BrainCircuit, Target, ChevronRight, Download, Clock } from 'lucide-react';
import sopTemplates from '../data/sopTemplates.json';
import storage from '../utils/storage';
import { trackEvent } from '../utils/rewards';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../utils/cn';

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
            <BrainCircuit size={14} className="text-yellow-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-yellow-700">Generative Narrative Engine</span>
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">AI SOP <span className="text-gradient">Architect</span></h1>
          <p className="text-gray-500 font-medium text-sm">Synthesize a high-impact Statement of Purpose tailored to your academic telemetry.</p>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Panel */}
        <div className="lg:col-span-5 space-y-6">
          <GlassCard className="p-8 space-y-8" hoverable={false}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-primary relative">
                <FileText size={24} />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase tracking-widest text-gray-900">Narrative Parameters</h3>
                <p className="text-[10px] text-gray-500 font-bold tracking-widest uppercase mt-0.5">Mission Critical Data Points</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Objective Degree</label>
                  <select 
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 text-gray-900 font-bold focus:outline-none focus:border-primary/50 text-sm transition-all appearance-none"
                    value={form.course} 
                    onChange={(e) => setForm({ ...form, course: e.target.value })}
                  >
                    <option value="" className="bg-white">Select Course</option>
                    {Object.keys(courseMap).map((c) => <option key={c} value={c} className="bg-white">{c}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Target Institution</label>
                  <select 
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 text-gray-900 font-bold focus:outline-none focus:border-primary/50 text-sm transition-all appearance-none"
                    value={form.university} 
                    onChange={(e) => setForm({ ...form, university: e.target.value })}
                  >
                    <option value="" className="bg-white">Select Uni</option>
                    {universities.map((u) => <option key={u} value={u} className="bg-white">{u}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Current GPA</label>
                  <input type="number" className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 text-gray-900 font-bold focus:outline-none focus:border-primary/50 text-sm transition-all" placeholder="3.6" value={form.gpa} onChange={(e) => setForm({ ...form, gpa: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Exp (Years)</label>
                  <input type="number" className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 text-gray-900 font-bold focus:outline-none focus:border-primary/50 text-sm transition-all" placeholder="2" value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Immediate Career Target</label>
                <input type="text" className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 text-gray-900 font-bold focus:outline-none focus:border-primary/50 text-sm transition-all" placeholder="e.g. AI Research at Google" value={form.careerGoal} onChange={(e) => setForm({ ...form, careerGoal: e.target.value })} />
              </div>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={!form.course || !form.university || isGenerating}
              className="w-full h-14 uppercase tracking-[0.2em] font-black text-[12px]"
              glow
            >
              {isGenerating ? (
                <div className="flex items-center gap-3">
                  <RefreshCw className="animate-spin" size={18} />
                  Processing...
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Wand2 size={18} />
                  Synthesize Draft
                </div>
              )}
            </Button>
          </GlassCard>

          {/* Guidelines */}
          <GlassCard className="p-6 border-teal-200 bg-teal-50" hoverable={false}>
             <div className="flex items-center gap-3 mb-4">
               <Target size={18} className="text-teal-500" />
               <h3 className="text-[10px] font-black uppercase tracking-widest text-teal-600">Optimization Guidelines</h3>
             </div>
             <ul className="space-y-3">
                {[
                  'Quantify achievements (e.g., 35% efficiency boost)',
                  'Reference specific institutional faculty names',
                  'Maintain 800-1000 word structural integrity',
                  'Align narrative with target industry benchmarks'
                ].map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-[10px] font-bold text-gray-500 leading-tight">
                    <span className="text-teal-500 mt-0.5">✓</span> {tip}
                  </li>
                ))}
             </ul>
          </GlassCard>
        </div>

        {/* Output Panel */}
        <div className="lg:col-span-7">
          <AnimatePresence mode="wait">
            {isGenerating ? (
              <motion.div
                key="generating"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full"
              >
                <GlassCard className="h-full min-h-[600px] flex flex-col items-center justify-center text-center p-12 border-gray-200" hoverable={false}>
                  <div className="relative mb-10">
                    <div className="w-24 h-24 rounded-[30%] bg-yellow-50 border border-yellow-200 flex items-center justify-center text-yellow-500">
                      <Wand2 size={40} className="animate-pulse" />
                    </div>
                    <div className="absolute -inset-4 border border-yellow-200 rounded-[35%] animate-spin-slow" />
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Narrative Synthesis In Progress</h3>
                  <p className="text-gray-500 text-sm mt-4 max-w-sm font-medium leading-relaxed">
                    AI is currently correlating your academic profile with institutional requirements to generate a premium Statement of Purpose.
                  </p>
                </GlassCard>
              </motion.div>
            ) : generated ? (
              <motion.div
                key="generated"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
              >
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 px-4">
                  <div>
                    <h3 className="text-xl font-black text-gray-900 tracking-tight">Draft Manifest</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-1.5 border-r border-gray-200 pr-3">
                        <Clock size={10} /> {fullSOP.split(' ').length} Words
                      </span>
                      <span className="text-[10px] font-black uppercase tracking-widest text-teal-500">Status: Verified Draft</span>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button variant="secondary" size="sm" onClick={() => setGenerated(null)} className="h-10 px-6 border-gray-200 bg-gray-50 font-black uppercase text-[10px] tracking-widest">
                       Reset
                    </Button>
                    <Button glow size="sm" onClick={handleCopy} className={cn("h-10 px-8 font-black uppercase text-[10px] tracking-widest transition-all", copied && "bg-teal-500 shadow-teal-500/50")}>
                       {copied ? "Copied" : "Copy All"}
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  {generated.sections.map((section) => {
                    const isExp = expandedSection === section.id;
                    return (
                      <GlassCard 
                        key={section.id} 
                        className={cn(
                          "p-6 transition-all duration-500 cursor-pointer overflow-hidden",
                          isExp ? "border-primary/30 bg-primary/5" : "hover:border-gray-200"
                        )}
                        onClick={() => setExpandedSection(isExp ? null : section.id)}
                        hoverable={false}
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-black uppercase tracking-[0.2em] text-gray-900 flex items-center gap-3">
                            <span className="text-[10px] text-gray-400 font-black opacity-30">0{section.id === 'intro' ? 1 : section.title.split('.')[0]}</span>
                            {section.title.split('.')[1].trim()}
                          </h4>
                          <ChevronRight size={18} className={cn("text-gray-400 transition-transform duration-500", isExp && "rotate-90 text-primary")} />
                        </div>
                        <AnimatePresence>
                          {isExp && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                            >
                              <div className="mt-6 pt-6 border-t border-gray-100">
                                <p className="text-sm text-gray-700 leading-relaxed font-medium whitespace-pre-wrap">
                                  {section.content}
                                </p>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </GlassCard>
                    );
                  })}
                </div>

                <GlassCard className="p-6 border-gray-200 border-dashed" hoverable={false}>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest text-center">
                    Draft is AI-synthesized. Institutional submission requires manual personalization and verification.
                  </p>
                </GlassCard>
              </motion.div>
            ) : (
              <GlassCard className="h-full min-h-[600px] flex flex-col items-center justify-center text-center p-12 border-gray-200 group" hoverable={false}>
                 <div className="relative mb-10">
                    <div className="w-24 h-24 rounded-[30%] bg-gray-100 border border-gray-200 flex items-center justify-center text-5xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-12 group-hover:bg-primary/5 group-hover:border-primary/20 group-hover:text-primary">
                      ✍️
                    </div>
                    <div className="absolute -inset-4 border border-gray-100 rounded-[35%] group-hover:border-primary/10 transition-colors" />
                 </div>
                 <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Awaiting Parameters</h3>
                 <p className="text-gray-500 text-sm mt-4 max-w-sm font-medium leading-relaxed">
                   Enter your profile telemetry on the left to initiate the high-spec AI narrative synthesis.
                 </p>
                 <div className="mt-10 grid grid-cols-2 gap-4 w-full max-w-sm">
                    {[
                      { icon: Sparkles, label: 'AI Tailored' },
                      { icon: Clock, label: 'Instant Draft' },
                      { icon: Target, label: 'Course Aligned' },
                      { icon: Check, label: 'Verified Format' }
                    ].map((feat, i) => (
                      <div key={i} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500 bg-gray-50 p-3 rounded-xl border border-gray-200 group-hover:border-gray-300 transition-colors">
                        <feat.icon size={12} className="text-primary" />
                        {feat.label}
                      </div>
                    ))}
                 </div>
              </GlassCard>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
