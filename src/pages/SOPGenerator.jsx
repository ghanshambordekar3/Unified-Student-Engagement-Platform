import { useState, useRef, useEffect } from 'react';
import { FileText, Wand2, Copy, Check, RefreshCw, Sparkles, BrainCircuit, Target, ChevronRight, Download, Clock, ChevronDown, ChevronUp, Edit3, Save, X, AlertCircle, CheckCircle, TrendingUp } from 'lucide-react';
import storage from '../utils/storage';
import { trackEvent } from '../utils/rewards';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../utils/cn';
import { generateSOP, improveSOP, generateTemplateSOP, enhanceWithAI } from '../services/sopEngine';
import { scoreSOP } from '../utils/sopScoring';

const courseMap = {
  'Computer Science': 'Computer Science',
  'MBA': 'MBA',
  'Data Science': 'Data Science',
  'Engineering': 'Engineering',
  'Medicine': 'Medicine',
  'Law': 'Law',
  'Arts & Humanities': 'Arts & Humanities',
  'Business': 'Business'
};

const countries = ['USA', 'Canada', 'UK', 'Australia', 'Germany', 'Ireland', 'New Zealand', 'Netherlands'];

// University options (top worldwide)
const universities = [
  "Massachusetts Institute of Technology (MIT)", "Stanford University", "Harvard University", "University of Cambridge", 
  "University of Oxford", "Imperial College London", "University of Toronto", "National University of Singapore (NUS)",
  "University of Melbourne", "UPenn", "Princeton University", "Technical University of Munich", "McGill University",
  "Nanyang Technological University", "Australian National University", "TU Delft", "ETH Zurich"
];

const sectionLabels = {
  introduction: '1. Introduction',
  academic_background: '2. Academic Background',
  experience: '3. Work Experience & Projects',
  course_reason: '4. Why This Course',
  country_reason: '5. Why This Country & University',
  career_goals: '6. Career Goals',
  conclusion: '7. Conclusion',
};

const sectionDescriptions = {
  introduction: 'Strong hook & motivation',
  academic_background: 'Academic foundation & preparation',
  experience: 'Skills, projects & impact',
  course_reason: 'Learning goals & curriculum fit',
  country_reason: 'University alignment & country context',
  career_goals: 'Short & long-term objectives',
  conclusion: 'Memorable closing statement',
};

const FormSection = ({ id, title, children, sections, toggleSection }) => (
  <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm">
    <button
      type="button"
      onClick={() => toggleSection(id)}
      className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
    >
      <span className="text-[10px] font-black uppercase tracking-widest text-gray-700">{title}</span>
      {sections[id] ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
    </button>
    <AnimatePresence>
      {sections[id] && (
        <motion.div
          initial={{ height: 0 }}
          animate={{ height: 'auto' }}
          exit={{ height: 0 }}
          className="overflow-hidden"
        >
          <div className="p-4 pt-0 space-y-4">
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

function CustomDropdown({ label, options, value, onChange, placeholder }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="space-y-2 relative" ref={dropdownRef}>
      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">
        {label}
      </label>
      
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-gray-50 border border-gray-200 text-gray-900 font-bold rounded-2xl px-4 py-3.5 flex items-center justify-between hover:border-teal-500/50 transition-all duration-300 shadow-sm text-sm"
      >
        <span className="truncate">{value || placeholder}</span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }}>
          <ChevronRight size={14} className="text-gray-400 rotate-90" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="absolute z-50 top-full left-0 right-0 bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden mt-1 max-h-60 overflow-y-auto"
          >
            <div className="py-2 bg-white">
              {options.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    onChange(opt);
                    setIsOpen(false);
                  }}
                  className={`w-full px-4 py-3 text-left text-sm font-bold transition-all ${
                    value === opt 
                      ? 'bg-teal-50 text-teal-600' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function SOPGenerator() {
  const profile = storage.get('edupath_profile', {});

  const [form, setForm] = useState({
    name: profile.name || '',
    course: profile.targetCourse || '',
    university: '',
    country: profile.preferredCountries?.[0] || '',
    gpa: '',
    undergradDegree: '',
    undergradUni: '',
    subjects: '',
    careerGoal: '',
    longTermGoal: '',
    targetIndustry: '',
  });

  const [projects, setProjects] = useState([{ name: '', description: '', technologies: '', outcome: '' }]);
  const [workExperience, setWorkExperience] = useState([{ company: '', role: '', duration: '', responsibilities: '' }]);
  const [achievements, setAchievements] = useState(['']);

  const [sections, setSections] = useState({
    personal: true,
    academic: false,
    projects: false,
    experience: false,
    achievements: false,
    goals: false,
  });

  const [generated, setGenerated] = useState(null);
  const [scores, setScores] = useState(null);
  const [provider, setProvider] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isImproving, setIsImproving] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [expandedSection, setExpandedSection] = useState(null);
  const [editingSection, setEditingSection] = useState(null);
  const [editedContent, setEditedContent] = useState('');
  const [error, setError] = useState(null);

  const toggleSection = (section) => {
    setSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const addProject = () => {
    setProjects([...projects, { name: '', description: '', technologies: '', outcome: '' }]);
  };

  const updateProject = (index, field, value) => {
    const updated = [...projects];
    updated[index] = { ...updated[index], [field]: value };
    setProjects(updated);
  };

  const removeProject = (index) => {
    setProjects(projects.filter((_, i) => i !== index));
  };

  const addExperience = () => {
    setWorkExperience([...workExperience, { company: '', role: '', duration: '', responsibilities: '' }]);
  };

  const updateExperience = (index, field, value) => {
    const updated = [...workExperience];
    updated[index] = { ...updated[index], [field]: value };
    setWorkExperience(updated);
  };

  const removeExperience = (index) => {
    setWorkExperience(workExperience.filter((_, i) => i !== index));
  };

  const addAchievement = () => {
    setAchievements([...achievements, '']);
  };

  const updateAchievement = (index, value) => {
    const updated = [...achievements];
    updated[index] = value;
    setAchievements(updated);
  };

  const removeAchievement = (index) => {
    setAchievements(achievements.filter((_, i) => i !== index));
  };

  const handleGenerate = async () => {
    if (!form.course || !form.university) return;

    setIsGenerating(true);
    setError(null);
    setGenerated(null);
    setScores(null);
    setIsEnhancing(true);

    const userData = {
      ...form,
      projects: projects.filter(p => p.name.trim()),
      workExperience: workExperience.filter(w => w.company.trim()),
      achievements: achievements.filter(a => a.trim()),
    };

    // STEP 1: Generate template SOP instantly (synchronous)
    try {
      const templateResult = generateTemplateSOP(userData);
      setGenerated(templateResult.sop);
      setScores(templateResult.score);
      setProvider('template');
      setExpandedSection('introduction');
      trackEvent('sop_generated');
    } catch (err) {
      console.error('Template generation failed:', err);
    }

    // Stop the initial loading state
    setIsGenerating(false);

    // STEP 2: Enhance with AI in background (async)
    try {
      const enhancement = await enhanceWithAI(userData);
      
      if (enhancement && enhancement.sop) {
        const newScore = scoreSOP(enhancement.sop, userData);
        
        // Only update if AI result is better
        const currentScore = scores?.final_score || 0;
        if (newScore.final_score > currentScore) {
          setGenerated(enhancement.sop);
          setScores(newScore);
        }
        setProvider(enhancement.provider);
      }
    } catch (err) {
      console.warn('AI enhancement failed:', err);
    }

    setIsEnhancing(false);
  };

  const handleImprove = async () => {
    if (!generated || !scores) return;

    setIsImproving(true);
    setError(null);

    try {
      const result = await improveSOP(generated, scores, form);
      setGenerated(result.sop);
      setScores(result.score);
    } catch (err) {
      setError('Failed to improve SOP. Please try again.');
      console.error(err);
    } finally {
      setIsImproving(false);
    }
  };

  const handleStartEdit = (sectionKey) => {
    setEditingSection(sectionKey);
    setEditedContent(generated[sectionKey]);
  };

  const handleSaveEdit = () => {
    if (!editingSection) return;
    setGenerated({ ...generated, [editingSection]: editedContent });
    setScores(null);
    setEditingSection(null);
    setEditedContent('');
  };

  const handleCancelEdit = () => {
    setEditingSection(null);
    setEditedContent('');
  };

  const fullSOP = generated
    ? Object.entries(sectionLabels).map(([key, title]) =>
        `${title}\n\n${generated[key]}`
      ).join('\n\n---\n\n')
    : '';

  const handleCopy = () => {
    navigator.clipboard.writeText(fullSOP);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const getScoreColor = (score) => {
    if (score >= 85) return 'text-emerald-500';
    if (score >= 70) return 'text-amber-500';
    return 'text-rose-500';
  };

  const getScoreBg = (score) => {
    if (score >= 85) return 'bg-emerald-500';
    if (score >= 70) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  const getScoreLabel = (score) => {
    if (score >= 85) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 50) return 'Fair';
    return 'Needs Work';
  };

  const CircularScore = ({ score, label, size = 80 }) => {
    const radius = (size - 8) / 2;
    const circumference = 2 * Math.PI * radius;
    const progress = (score / 100) * circumference;
    const color = score >= 85 ? '#10b981' : score >= 70 ? '#f59e0b' : '#f43f5e';

    return (
      <div className="flex flex-col items-center gap-2">
        <div className="relative" style={{ width: size, height: size }}>
          <svg className="transform -rotate-90" width={size} height={size}>
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="#f3f4f6"
              strokeWidth="6"
              fill="none"
            />
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={color}
              strokeWidth="6"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={circumference - progress}
              strokeLinecap="round"
              className="transition-all duration-700"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={cn("text-lg font-black", getScoreColor(score))}>{score}</span>
          </div>
        </div>
        <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">{label}</span>
      </div>
    );
  };

  return (
    <div className="space-y-10 pb-20 animate-fade-in">
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 px-3 py-1 bg-gray-50 border border-gray-100 rounded-full w-fit"
          >
            <BrainCircuit size={14} className="text-amber-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-700">SOP Architect Engine</span>
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">AI SOP <span className="text-gradient">Architect</span></h1>
          <p className="text-gray-500 font-medium text-sm">Generate admission-ready SOPs with AI scoring and auto-improvement.</p>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-5 space-y-4">
          <GlassCard className="p-6 space-y-4" hoverable={false}>
            <div className="flex items-center gap-4 mb-2">
              <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600">
                <FileText size={20} />
              </div>
              <div>
                <h3 className="text-xs font-black uppercase tracking-widest text-gray-900">Narrative Parameters</h3>
                <p className="text-[10px] text-gray-500 font-bold tracking-widest uppercase">Required Information</p>
              </div>
            </div>

            <FormSection id="personal" title="Personal Information" sections={sections} toggleSection={toggleSection}>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Full Name</label>
                  <input type="text" className="input-field" placeholder="Your full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <CustomDropdown
                    label="Objective Degree"
                    placeholder="Select Course"
                    options={Object.keys(courseMap)}
                    value={form.course}
                    onChange={(val) => setForm({ ...form, course: val })}
                  />
                  <CustomDropdown
                    label="Destination"
                    placeholder="Select Country"
                    options={countries}
                    value={form.country}
                    onChange={(val) => setForm({ ...form, country: val })}
                  />
                </div>
                <CustomDropdown
                  label="Target Institution"
                  placeholder="Search University..."
                  options={universities}
                  value={form.university}
                  onChange={(val) => setForm({ ...form, university: val })}
                />
              </div>
            </FormSection>

            <FormSection id="academic" title="Academic Background" sections={sections} toggleSection={toggleSection}>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Undergrad Degree</label>
                  <input type="text" className="input-field" placeholder="e.g. B.Tech CS" value={form.undergradDegree} onChange={(e) => setForm({ ...form, undergradDegree: e.target.value })} />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">GPA / Score</label>
                  <input type="text" className="input-field" placeholder="e.g. 3.8/4.0" value={form.gpa} onChange={(e) => setForm({ ...form, gpa: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Undergrad Institution</label>
                <input type="text" className="input-field" placeholder="University name" value={form.undergradUni} onChange={(e) => setForm({ ...form, undergradUni: e.target.value })} />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Key Curriculum / Subjects</label>
                <input type="text" className="input-field" placeholder="e.g. DS, Algos, ML, Stats" value={form.subjects} onChange={(e) => setForm({ ...form, subjects: e.target.value })} />
              </div>
            </FormSection>

            <FormSection id="projects" title="Key Projects" sections={sections} toggleSection={toggleSection}>
              {projects.map((project, idx) => (
                <div key={idx} className="space-y-2 p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-gray-400 uppercase">Project {idx + 1}</span>
                    {projects.length > 1 && (
                      <button type="button" onClick={() => removeProject(idx)} className="text-rose-500 hover:text-rose-600 text-[10px] font-black uppercase">Remove</button>
                    )}
                  </div>
                  <input type="text" className="input-field bg-white" placeholder="Project Title" value={project.name} onChange={(e) => updateProject(idx, 'name', e.target.value)} />
                  <textarea className="input-field bg-white text-xs h-16" placeholder="Your contribution & result" value={project.description} onChange={(e) => updateProject(idx, 'description', e.target.value)} />
                </div>
              ))}
              <button type="button" onClick={addProject} className="w-full py-2.5 text-[10px] font-black uppercase tracking-widest text-teal-600 border border-dashed border-teal-200 rounded-xl hover:bg-teal-50 transition-colors">
                + Add Another Project
              </button>
            </FormSection>

            <FormSection id="experience" title="Work Experience" sections={sections} toggleSection={toggleSection}>
              {workExperience.map((exp, idx) => (
                <div key={idx} className="space-y-2 p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-gray-400 uppercase">Exp {idx + 1}</span>
                    {workExperience.length > 1 && (
                      <button type="button" onClick={() => removeExperience(idx)} className="text-rose-500 hover:text-rose-600 text-[10px] font-black uppercase">Remove</button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input type="text" className="input-field bg-white" placeholder="Company" value={exp.company} onChange={(e) => updateExperience(idx, 'company', e.target.value)} />
                    <input type="text" className="input-field bg-white" placeholder="Role" value={exp.role} onChange={(e) => updateExperience(idx, 'role', e.target.value)} />
                  </div>
                  <textarea className="input-field bg-white text-xs h-16" placeholder="Impact created" value={exp.responsibilities} onChange={(e) => updateExperience(idx, 'responsibilities', e.target.value)} />
                </div>
              ))}
              <button type="button" onClick={addExperience} className="w-full py-2.5 text-[10px] font-black uppercase tracking-widest text-teal-600 border border-dashed border-teal-200 rounded-xl hover:bg-teal-50 transition-colors">
                + Add Work History
              </button>
            </FormSection>

            <FormSection id="goals" title="Career Trajectory" sections={sections} toggleSection={toggleSection}>
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Short-term Goal</label>
                  <input type="text" className="input-field" placeholder="Position in 5 years" value={form.careerGoal} onChange={(e) => setForm({ ...form, careerGoal: e.target.value })} />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Long-term Vision</label>
                  <input type="text" className="input-field" placeholder="Position in 10+ years" value={form.longTermGoal} onChange={(e) => setForm({ ...form, longTermGoal: e.target.value })} />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Industry of Focus</label>
                  <input type="text" className="input-field" placeholder="e.g. AI Ethics, Finance, Space-tech" value={form.targetIndustry} onChange={(e) => setForm({ ...form, targetIndustry: e.target.value })} />
                </div>
              </div>
            </FormSection>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-100 rounded-xl">
                <AlertCircle size={14} className="text-rose-500 shrink-0" />
                <span className="text-[11px] font-bold text-rose-600">{error}</span>
              </div>
            )}

            <Button
              onClick={handleGenerate}
              disabled={!form.course || !form.university || isGenerating}
              className="w-full h-14 uppercase tracking-[0.18em] font-black text-[11px] shadow-xl shadow-teal-500/20"
              glow
            >
              {isGenerating ? (
                <div className="flex items-center gap-3">
                  <RefreshCw className="animate-spin" size={18} />
                  Architecting...
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Wand2 size={18} />
                  Construct SOP
                </div>
              )}
            </Button>
          </GlassCard>

          <GlassCard className="p-5 border-teal-100 bg-teal-50/50" hoverable={false}>
            <div className="flex items-center gap-3 mb-3">
              <Target size={16} className="text-teal-500" />
              <h3 className="text-[10px] font-black uppercase tracking-widest text-teal-700">Admission Insights</h3>
            </div>
            <ul className="space-y-2">
              {[
                'Quantify impact by exactly listing percentages/metrics',
                'Connect specific university modules to your goals',
                'Ensure narrative flow between undergrad and masters',
                'Maintain a tone of professional enthusiasm'
              ].map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-[10px] font-bold text-gray-500 leading-tight">
                  <span className="text-teal-500 mt-0.5">•</span> {tip}
                </li>
              ))}
            </ul>
          </GlassCard>
        </div>

        <div className="lg:col-span-7">
          <AnimatePresence mode="wait">
            {isGenerating ? (
              <motion.div key="generating" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <GlassCard className="min-h-[600px] flex flex-col items-center justify-center text-center p-12 border-gray-100" hoverable={false}>
                  <div className="relative mb-8">
                    <div className="w-24 h-24 rounded-3xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-500">
                      <Wand2 size={40} className="animate-pulse" />
                    </div>
                    <div className="absolute -inset-4 border border-teal-100 rounded-[2rem] animate-spin-slow opacity-30" />
                  </div>
                  <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Generating Narrative</h3>
                  <p className="text-gray-500 text-sm mt-3 max-w-sm font-medium leading-relaxed">
                    Analyzing your inputs against top-tier university expectations.
                  </p>
                </GlassCard>
              </motion.div>
            ) : generated && scores ? (
              <motion.div key="generated" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-5">
                <GlassCard className="p-6 border-gray-100 shadow-xl" hoverable={false}>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-gray-50">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Analysis Mode:</span>
                        <span className={cn(
                          "text-[9px] font-black uppercase px-2 py-0.5 rounded-full border",
                          provider === 'nvidia' ? "bg-indigo-50 text-indigo-600 border-indigo-100" : "bg-gray-50 text-gray-600 border-gray-200"
                        )}>
                          {provider === 'nvidia' ? '⚡ AI Grounding' : '📝 Heuristic Match'}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Global Quality</p>
                          <div className="flex items-center gap-2">
                            <span className={cn("text-4xl font-black tracking-tighter", getScoreColor(scores.final_score))}>{scores.final_score}%</span>
                            <span className={cn("text-[9px] font-black uppercase px-2 py-1 rounded-lg text-white", getScoreBg(scores.final_score))}>
                              {getScoreLabel(scores.final_score)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:flex items-center gap-6">
                      <CircularScore score={scores.clarity} label="Clarity" size={60} />
                      <CircularScore score={scores.structure} label="Flow" size={60} />
                      <CircularScore score={scores.impact} label="Impact" size={60} />
                      <CircularScore score={scores.personalization} label="Persona" size={60} />
                    </div>
                  </div>

                  {isEnhancing && (
                    <div className="mt-4 pt-4">
                      <div className="flex items-center justify-center gap-3 py-2.5 bg-teal-50/50 border border-teal-100 rounded-xl">
                        <RefreshCw className="animate-spin text-teal-500" size={14} />
                        <span className="text-[10px] font-black uppercase tracking-widest text-teal-700">Wait: Polishing with AI...</span>
                      </div>
                    </div>
                  )}

                  {!isEnhancing && scores.final_score < 90 && (
                    <div className="mt-6">
                      <Button onClick={handleImprove} disabled={isImproving} size="sm" className="w-full h-11 border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-700 font-black uppercase tracking-widest text-[10px]">
                        {isImproving ? <RefreshCw className="animate-spin mr-2" /> : <TrendingUp size={14} className="mr-2" />}
                        {isImproving ? 'Improving Narrative...' : 'Run Auto-Optimization'}
                      </Button>
                    </div>
                  )}
                </GlassCard>

                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                      <Clock size={12} className="text-gray-300" /> {fullSOP.split(/\s+/).length} Words
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                      <Sparkles size={12} className="text-teal-400" /> AI Grounded
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="secondary" size="sm" onClick={handleCopy} className={cn("h-9 px-6 font-black uppercase text-[10px] tracking-widest transition-all shadow-sm", copied && "bg-teal-500 text-white")}>
                      {copied ? <Check size={14} className="mr-2" /> : <Copy size={14} className="mr-2" />}
                      {copied ? 'Copied' : 'Export Script'}
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  {Object.entries(sectionLabels).map(([key, title]) => {
                    const isExp = expandedSection === key;
                    const isEditing = editingSection === key;
                    return (
                      <GlassCard
                        key={key}
                        className={cn(
                          "transition-all duration-300 overflow-hidden",
                          isExp ? "border-teal-200 ring-1 ring-teal-50 shadow-lg" : "hover:border-gray-200"
                        )}
                        onClick={() => !isEditing && setExpandedSection(isExp ? null : key)}
                        hoverable={false}
                      >
                        <div className="p-5 flex items-center justify-between cursor-pointer">
                          <div className="flex items-center gap-4">
                            <div className={cn("w-1.5 h-1.5 rounded-full transition-all", isExp ? "bg-teal-500 scale-150" : "bg-gray-200")} />
                            <div>
                              <h4 className="text-xs font-black text-gray-900 uppercase tracking-wide">{title}</h4>
                              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">{sectionDescriptions[key]}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            {!isEditing && (
                              <button onClick={(e) => { e.stopPropagation(); handleStartEdit(key); }} className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400 hover:text-teal-600">
                                <Edit3 size={14} />
                              </button>
                            )}
                            <ChevronRight size={18} className={cn("text-gray-300 transition-transform duration-300", isExp && "rotate-90 text-teal-500")} />
                          </div>
                        </div>
                        <AnimatePresence>
                          {isExp && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                              <div className="px-5 pb-6 pt-2">
                                {isEditing ? (
                                  <div className="space-y-4">
                                    <textarea
                                      className="input-field h-40 font-medium leading-relaxed resize-none p-4"
                                      value={editedContent}
                                      onChange={(e) => setEditedContent(e.target.value)}
                                    />
                                    <div className="flex gap-3">
                                      <Button size="sm" onClick={handleSaveEdit} className="flex-1 h-10 font-black uppercase text-[10px] tracking-widest">
                                        Update Segment
                                      </Button>
                                      <Button variant="secondary" size="sm" onClick={handleCancelEdit} className="flex-1 h-10 font-black uppercase text-[10px] tracking-widest">
                                        Discard
                                      </Button>
                                    </div>
                                  </div>
                                ) : (
                                  <p className="text-sm text-gray-600 leading-relaxed font-medium whitespace-pre-wrap">
                                    {generated[key]}
                                  </p>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </GlassCard>
                    );
                  })}
                </div>

                {scores.final_score < 85 && (
                  <GlassCard className="p-5 border-amber-100 bg-amber-50/30" hoverable={false}>
                    <div className="flex items-center gap-3 mb-3">
                      <AlertCircle size={16} className="text-amber-500" />
                      <h3 className="text-[10px] font-black uppercase tracking-widest text-amber-600">Architect Suggestions</h3>
                    </div>
                    <ul className="space-y-2">
                      {scores.improvements.slice(0, 4).map((imp, i) => (
                        <li key={i} className="flex items-start gap-2 text-[10px] font-bold text-gray-600 leading-tight">
                          <span className="text-amber-500 mt-0.5">→</span> {imp}
                        </li>
                      ))}
                    </ul>
                  </GlassCard>
                )}
              </motion.div>
            ) : (
              <GlassCard className="min-h-[600px] flex flex-col items-center justify-center text-center p-12 border-gray-100 group" hoverable={false}>
                <div className="relative mb-8">
                  <div className="w-28 h-28 rounded-[2rem] bg-gray-50 border border-gray-100 flex items-center justify-center text-5xl transition-all duration-500 group-hover:scale-110 group-hover:bg-teal-50 group-hover:border-teal-100 group-hover:rotate-6 shadow-sm">
                    📜
                  </div>
                  <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 4, repeat: Infinity }} className="absolute -inset-6 border border-teal-50 rounded-[2.5rem] -z-10" />
                </div>
                <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Narrative Workbench</h3>
                <p className="text-gray-500 text-sm mt-3 max-w-sm font-medium leading-relaxed">
                  The SOP Architect uses AI to synthesize your academic history into a compelling admission statement.
                </p>
                <div className="mt-10 grid grid-cols-2 gap-4 w-full">
                  {[
                    { icon: Sparkles, label: 'Adaptive Writing' },
                    { icon: BrainCircuit, label: 'Scoring Engine' },
                    { icon: Target, label: 'Uni Grounding' },
                    { icon: Edit3, label: 'Section Editor' }
                  ].map((feat, i) => (
                    <div key={i} className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-gray-500 bg-white p-3.5 rounded-2xl border border-gray-100 group-hover:border-teal-100 transition-all duration-300">
                      <feat.icon size={14} className="text-teal-500" />
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
