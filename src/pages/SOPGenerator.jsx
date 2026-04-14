import { useState, useCallback } from 'react';
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
};

const countries = ['USA', 'Canada', 'UK', 'Australia', 'Germany'];

// University options for dropdown (sorted by country and ranking)
const universities = [
  // USA
  { name: 'Massachusetts Institute of Technology', country: 'USA', ranking: 1 },
  { name: 'Stanford University', country: 'USA', ranking: 5 },
  { name: 'Harvard University', country: 'USA', ranking: 4 },
  { name: 'Carnegie Mellon University', country: 'USA', ranking: 8 },
  { name: 'University of California Berkeley', country: 'USA', ranking: 12 },
  { name: 'Cornell University', country: 'USA', ranking: 15 },
  { name: 'Princeton University', country: 'USA', ranking: 11 },
  { name: 'Columbia University', country: 'USA', ranking: 23 },
  { name: 'University of Pennsylvania', country: 'USA', ranking: 13 },
  { name: 'University of California Los Angeles', country: 'USA', ranking: 19 },
  { name: 'University of Michigan Ann Arbor', country: 'USA', ranking: 21 },
  { name: 'University of Washington', country: 'USA', ranking: 22 },
  { name: 'NYU', country: 'USA', ranking: 35 },
  { name: 'University of California San Diego', country: 'USA', ranking: 25 },
  { name: 'Georgia Institute of Technology', country: 'USA', ranking: 17 },
  { name: 'University of Texas Austin', country: 'USA', ranking: 24 },
  { name: 'Boston University', country: 'USA', ranking: 75 },
  // UK
  { name: 'University of Oxford', country: 'UK', ranking: 3 },
  { name: 'University of Cambridge', country: 'UK', ranking: 2 },
  { name: 'Imperial College London', country: 'UK', ranking: 6 },
  { name: 'University College London', country: 'UK', ranking: 9 },
  { name: 'University of Edinburgh', country: 'UK', ranking: 27 },
  { name: 'University of Manchester', country: 'UK', ranking: 28 },
  { name: 'London School of Economics', country: 'UK', ranking: 45 },
  { name: "King's College London", country: 'UK', ranking: 40 },
  // Canada
  { name: 'University of Toronto', country: 'Canada', ranking: 21 },
  { name: 'University of British Columbia', country: 'Canada', ranking: 34 },
  { name: 'McGill University', country: 'Canada', ranking: 30 },
  { name: 'University of Waterloo', country: 'Canada', ranking: 112 },
  { name: 'University of Alberta', country: 'Canada', ranking: 111 },
  { name: 'Simon Fraser University', country: 'Canada', ranking: 251 },
  { name: 'University of Toronto Scarborough', country: 'Canada', ranking: 21 },
  // Australia
  { name: 'University of Melbourne', country: 'Australia', ranking: 14 },
  { name: 'Australian National University', country: 'Australia', ranking: 30 },
  { name: 'University of Sydney', country: 'Australia', ranking: 41 },
  { name: 'UNSW Sydney', country: 'Australia', ranking: 19 },
  { name: 'University of Queensland', country: 'Australia', ranking: 43 },
  { name: 'Monash University', country: 'Australia', ranking: 37 },
  // Germany
  { name: 'Technical University of Munich', country: 'Germany', ranking: 50 },
  { name: 'Heidelberg University', country: 'Germany', ranking: 65 },
  { name: 'TU Berlin', country: 'Germany', ranking: 154 },
  { name: 'RWTH Aachen University', country: 'Germany', ranking: 106 },
  { name: 'Karlsruhe Institute of Technology', country: 'Germany', ranking: 119 },
  // France
  { name: 'HEC Paris', country: 'France', ranking: 72 },
  { name: 'École Polytechnique', country: 'France', ranking: 38 },
  { name: 'PSL University', country: 'France', ranking: 52 },
  { name: 'Sorbonne University', country: 'France', ranking: 60 },
  // Netherlands
  { name: 'TU Delft', country: 'Netherlands', ranking: 47 },
  { name: 'Leiden University', country: 'Netherlands', ranking: 77 },
  { name: 'Eindhoven University of Technology', country: 'Netherlands', ranking: 167 },
  // Switzerland
  { name: 'ETH Zurich', country: 'Switzerland', ranking: 7 },
  { name: 'EPFL', country: 'Switzerland', ranking: 36 },
  // Singapore
  { name: 'National University of Singapore', country: 'Singapore', ranking: 8 },
  { name: 'Nanyang Technological University', country: 'Singapore', ranking: 15 },
  // Ireland
  { name: 'Trinity College Dublin', country: 'Ireland', ranking: 81 },
  { name: 'University College Dublin', country: 'Ireland', ranking: 171 },
  // Japan
  { name: 'University of Tokyo', country: 'Japan', ranking: 23 },
  { name: 'Kyoto University', country: 'Japan', ranking: 36 },
  // Sweden
  { name: 'KTH Royal Institute of Technology', country: 'Sweden', ranking: 73 },
  { name: 'Uppsala University', country: 'Sweden', ranking: 105 },
  // Other countries
  { name: 'University of Auckland', country: 'New Zealand', ranking: 87 },
  { name: 'University of Hong Kong', country: 'Hong Kong', ranking: 21 },
  { name: 'Peking University', country: 'China', ranking: 14 },
  { name: 'Seoul National University', country: 'South Korea', ranking: 29 },
  { name: 'KAIST', country: 'South Korea', ranking: 53 },
  { name: 'University of Cape Town', country: 'South Africa', ranking: 120 },
  { name: 'Technical University of Denmark', country: 'Denmark', ranking: 99 },
  { name: 'Politecnico di Milano', country: 'Italy', ranking: 111 },
  { name: 'University of Helsinki', country: 'Finland', ranking: 115 },
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
  <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white">
    <button
      type="button"
      onClick={() => toggleSection(id)}
      className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
    >
      <span className="text-xs font-black uppercase tracking-widest text-gray-700">{title}</span>
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
    if (score >= 85) return 'text-green-500';
    if (score >= 70) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreBg = (score) => {
    if (score >= 85) return 'bg-green-500';
    if (score >= 70) return 'bg-yellow-500';
    return 'bg-red-500';
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
    const color = score >= 85 ? '#22c55e' : score >= 70 ? '#eab308' : '#ef4444';

    return (
      <div className="flex flex-col items-center gap-2">
        <div className="relative" style={{ width: size, height: size }}>
          <svg className="transform -rotate-90" width={size} height={size}>
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="#e5e7eb"
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
        <span className="text-[10px] font-black uppercase tracking-wider text-gray-500">{label}</span>
      </div>
    );
  };

  return (
    <div className="space-y-10 pb-20">
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 px-3 py-1 bg-gray-100 border border-gray-200 rounded-full w-fit"
          >
            <BrainCircuit size={14} className="text-yellow-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-yellow-700">SOP Architect Engine</span>
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">AI SOP <span className="text-gradient">Architect</span></h1>
          <p className="text-gray-500 font-medium text-sm">Generate admission-ready SOPs with AI scoring and auto-improvement.</p>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-5 space-y-4">
          <GlassCard className="p-6 space-y-4" hoverable={false}>
            <div className="flex items-center gap-4 mb-2">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-primary">
                <FileText size={20} />
              </div>
              <div>
                <h3 className="text-xs font-black uppercase tracking-widest text-gray-900">Narrative Parameters</h3>
                <p className="text-[10px] text-gray-500 font-bold tracking-widest uppercase">Required Information</p>
              </div>
            </div>

            <FormSection id="personal" title="Personal Information" defaultOpen={true} sections={sections} toggleSection={toggleSection}>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Full Name</label>
                  <input type="text" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-gray-900 font-bold focus:outline-none focus:border-primary/50 text-sm" placeholder="Your full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Target Course</label>
                  <select className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-gray-900 font-bold focus:outline-none focus:border-primary/50 text-sm appearance-none" value={form.course} onChange={(e) => setForm({ ...form, course: e.target.value })}>
                    <option value="">Select</option>
                    {Object.keys(courseMap).map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Target University</label>
                  <select 
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-gray-900 font-bold focus:outline-none focus:border-primary/50 text-sm appearance-none"
                    value={form.university}
                    onChange={(e) => setForm({ ...form, university: e.target.value })}
                  >
                    <option value="">Select University</option>
                    {universities.map((u) => (
                      <option key={u.name} value={u.name} className="bg-white">{u.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Country</label>
                  <select className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-gray-900 font-bold focus:outline-none focus:border-primary/50 text-sm appearance-none" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })}>
                    <option value="">Select</option>
                    {countries.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
            </FormSection>

            <FormSection id="academic" title="Academic Background" sections={sections} toggleSection={toggleSection}>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Undergrad Degree</label>
                  <input type="text" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-gray-900 font-bold focus:outline-none focus:border-primary/50 text-sm" placeholder="e.g. B.Tech Computer Science" value={form.undergradDegree} onChange={(e) => setForm({ ...form, undergradDegree: e.target.value })} />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">GPA / Percentage</label>
                  <input type="text" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-gray-900 font-bold focus:outline-none focus:border-primary/50 text-sm" placeholder="e.g. 3.6 or 85%" value={form.gpa} onChange={(e) => setForm({ ...form, gpa: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Undergrad University</label>
                <input type="text" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-gray-900 font-bold focus:outline-none focus:border-primary/50 text-sm" placeholder="Your undergraduate institution" value={form.undergradUni} onChange={(e) => setForm({ ...form, undergradUni: e.target.value })} />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Key Subjects / Coursework</label>
                <input type="text" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-gray-900 font-bold focus:outline-none focus:border-primary/50 text-sm" placeholder="e.g. Data Structures, Algorithms, ML" value={form.subjects} onChange={(e) => setForm({ ...form, subjects: e.target.value })} />
              </div>
            </FormSection>

            <FormSection id="projects" title="Projects" sections={sections} toggleSection={toggleSection}>
              {projects.map((project, idx) => (
                <div key={idx} className="space-y-2 p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-gray-500 uppercase">Project {idx + 1}</span>
                    {projects.length > 1 && (
                      <button type="button" onClick={(e) => { e.stopPropagation(); removeProject(idx); }} className="text-red-400 hover:text-red-600 text-xs font-bold">Remove</button>
                    )}
                  </div>
                  <input type="text" className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:border-primary/50" placeholder="Project Name" value={project.name} onChange={(e) => updateProject(idx, 'name', e.target.value)} />
                  <input type="text" className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:border-primary/50" placeholder="Brief Description" value={project.description} onChange={(e) => updateProject(idx, 'description', e.target.value)} />
                  <input type="text" className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:border-primary/50" placeholder="Technologies Used" value={project.technologies} onChange={(e) => updateProject(idx, 'technologies', e.target.value)} />
                  <input type="text" className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:border-primary/50" placeholder="Outcome / Result" value={project.outcome} onChange={(e) => updateProject(idx, 'outcome', e.target.value)} />
                </div>
              ))}
              <button type="button" onClick={addProject} className="w-full py-2 text-xs font-black uppercase tracking-widest text-primary border border-dashed border-primary/30 rounded-xl hover:bg-primary/5 transition-colors">
                + Add Project
              </button>
            </FormSection>

            <FormSection id="experience" title="Work Experience" sections={sections} toggleSection={toggleSection}>
              {workExperience.map((exp, idx) => (
                <div key={idx} className="space-y-2 p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-gray-500 uppercase">Experience {idx + 1}</span>
                    {workExperience.length > 1 && (
                      <button type="button" onClick={(e) => { e.stopPropagation(); removeExperience(idx); }} className="text-red-400 hover:text-red-600 text-xs font-bold">Remove</button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input type="text" className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:border-primary/50" placeholder="Company" value={exp.company} onChange={(e) => updateExperience(idx, 'company', e.target.value)} />
                    <input type="text" className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:border-primary/50" placeholder="Role / Title" value={exp.role} onChange={(e) => updateExperience(idx, 'role', e.target.value)} />
                  </div>
                  <input type="text" className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:border-primary/50" placeholder="Duration (e.g. Jan 2022 - Present)" value={exp.duration} onChange={(e) => updateExperience(idx, 'duration', e.target.value)} />
                  <textarea className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:border-primary/50 resize-none" rows={2} placeholder="Key Responsibilities & Achievements" value={exp.responsibilities} onChange={(e) => updateExperience(idx, 'responsibilities', e.target.value)} />
                </div>
              ))}
              <button type="button" onClick={addExperience} className="w-full py-2 text-xs font-black uppercase tracking-widest text-primary border border-dashed border-primary/30 rounded-xl hover:bg-primary/5 transition-colors">
                + Add Experience
              </button>
            </FormSection>

            <FormSection id="achievements" title="Achievements & Awards" sections={sections} toggleSection={toggleSection}>
              {achievements.map((ach, idx) => (
                <div key={idx} className="flex gap-2">
                  <input type="text" className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-medium focus:outline-none focus:border-primary/50" placeholder="e.g. Dean's List, Coding Competition Winner" value={ach} onChange={(e) => updateAchievement(idx, e.target.value)} />
                    {achievements.length > 1 && (
                      <button type="button" onClick={(e) => { e.stopPropagation(); removeAchievement(idx); }} className="text-red-400 hover:text-red-600 px-2"><X size={16} /></button>
                    )}
                </div>
              ))}
              <button type="button" onClick={addAchievement} className="w-full py-2 text-xs font-black uppercase tracking-widest text-primary border border-dashed border-primary/30 rounded-xl hover:bg-primary/5 transition-colors">
                + Add Achievement
              </button>
            </FormSection>

            <FormSection id="goals" title="Career Goals" sections={sections} toggleSection={toggleSection}>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Short-term Goal (5 years)</label>
                <textarea className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-medium focus:outline-none focus:border-primary/50 resize-none" rows={2} placeholder="e.g. Join a top tech company as a Senior ML Engineer" value={form.careerGoal} onChange={(e) => setForm({ ...form, careerGoal: e.target.value })} />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Long-term Goal (10+ years)</label>
                <textarea className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-medium focus:outline-none focus:border-primary/50 resize-none" rows={2} placeholder="e.g. Start my own AI research lab focusing on healthcare" value={form.longTermGoal} onChange={(e) => setForm({ ...form, longTermGoal: e.target.value })} />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Target Industry</label>
                <input type="text" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-medium focus:outline-none focus:border-primary/50" placeholder="e.g. Healthcare AI, Fintech, E-commerce" value={form.targetIndustry} onChange={(e) => setForm({ ...form, targetIndustry: e.target.value })} />
              </div>
            </FormSection>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
                <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
                <span className="text-xs font-bold text-red-600">{error}</span>
              </div>
            )}

            <Button
              onClick={handleGenerate}
              disabled={!form.course || !form.university || isGenerating}
              className="w-full h-14 uppercase tracking-[0.15em] font-black text-[11px]"
              glow
            >
              {isGenerating ? (
                <div className="flex items-center gap-3">
                  <RefreshCw className="animate-spin" size={18} />
                  Generating SOP...
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Wand2 size={18} />
                  Generate SOP
                </div>
              )}
            </Button>
          </GlassCard>

          <GlassCard className="p-5 border-teal-200 bg-teal-50" hoverable={false}>
            <div className="flex items-center gap-3 mb-3">
              <Target size={16} className="text-teal-500" />
              <h3 className="text-[10px] font-black uppercase tracking-widest text-teal-600">Writing Tips</h3>
            </div>
            <ul className="space-y-2">
              {[
                'Quantify achievements (e.g., 40% improvement)',
                'Use strong verbs: led, built, developed, engineered',
                'Reference specific faculty, courses, and research',
                'Connect past experiences to future goals',
                'Avoid generic phrases like "I am passionate about"'
              ].map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-[10px] font-bold text-gray-500 leading-tight">
                  <span className="text-teal-500 mt-0.5 flex-shrink-0">✓</span> {tip}
                </li>
              ))}
            </ul>
          </GlassCard>
        </div>

        <div className="lg:col-span-7">
          <AnimatePresence mode="wait">
            {isGenerating ? (
              <motion.div key="generating" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <GlassCard className="min-h-[600px] flex flex-col items-center justify-center text-center p-12 border-gray-200" hoverable={false}>
                  <div className="relative mb-8">
                    <div className="w-24 h-24 rounded-[30%] bg-yellow-50 border border-yellow-200 flex items-center justify-center text-yellow-500">
                      <Wand2 size={40} className="animate-pulse" />
                    </div>
                    <div className="absolute -inset-4 border border-yellow-200 rounded-[35%] animate-spin-slow" />
                  </div>
                  <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Generating Your SOP</h3>
                  <p className="text-gray-500 text-sm mt-3 max-w-sm font-medium leading-relaxed">
                    Creating your personalized Statement of Purpose. You'll see results in seconds.
                  </p>
                </GlassCard>
              </motion.div>
            ) : generated && scores ? (
              <motion.div key="generated" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-5">
                {scores && (
                  <GlassCard className="p-5 border-gray-200" hoverable={false}>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Generated with:</span>
                          <span className={cn(
                            "text-xs font-black uppercase px-2 py-0.5 rounded-full",
                            provider === 'nvidia' && "bg-purple-100 text-purple-700 border border-purple-200",
                            provider === 'huggingface' && "bg-orange-100 text-orange-700 border border-orange-200",
                            provider === 'template' && "bg-gray-100 text-gray-600 border border-gray-200"
                          )}>
                            {provider === 'nvidia' && '🤖 NVIDIA AI'}
                            {provider === 'huggingface' && '🤖 HuggingFace'}
                            {provider === 'template' && '📝 Template'}
                          </span>
                        </div>
                        <h3 className="text-sm font-black text-gray-900">Quality Score</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={cn("text-2xl font-black", getScoreColor(scores.final_score))}>{scores.final_score}%</span>
                          <span className={cn("text-xs font-black uppercase px-2 py-0.5 rounded-full", getScoreBg(scores.final_score), 'text-white')}>{getScoreLabel(scores.final_score)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <CircularScore score={scores.clarity} label="Clarity" size={60} />
                        <CircularScore score={scores.structure} label="Structure" size={60} />
                        <CircularScore score={scores.impact} label="Impact" size={60} />
                        <CircularScore score={scores.personalization} label="Personal" size={60} />
                      </div>
                    </div>
                    
                    {/* Enhancement Status Indicator */}
                    {isEnhancing && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="flex items-center justify-center gap-2 py-2 bg-blue-50 border border-blue-200 rounded-xl">
                          <RefreshCw className="animate-spin text-blue-500" size={14} />
                          <span className="text-xs font-medium text-blue-700">Enhancing with AI...</span>
                        </div>
                      </div>
                    )}
                    
                    {scores.final_score < 85 && !isEnhancing && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <Button
                          onClick={handleImprove}
                          disabled={isImproving}
                          size="sm"
                          glow
                          className="w-full h-10"
                        >
                          {isImproving ? (
                            <div className="flex items-center gap-2">
                              <RefreshCw className="animate-spin" size={14} />
                              Improving...
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <TrendingUp size={14} />
                              Auto-Improve SOP
                            </div>
                          )}
                        </Button>
                      </div>
                    )}
                  </GlassCard>
                )}

                <div className="flex items-center justify-between px-2">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-1.5">
                      <Clock size={10} /> {fullSOP.split(/\s+/).filter(Boolean).length} Words
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="secondary" size="sm" onClick={() => { setGenerated(null); setScores(null); setProvider(null); }} className="h-9 px-5 border-gray-200 bg-gray-50 font-black uppercase text-[10px] tracking-widest">
                      Reset
                    </Button>
                    <Button size="sm" onClick={handleCopy} className={cn("h-9 px-6 font-black uppercase text-[10px] tracking-widest transition-all", copied && "bg-teal-500")}>
                      {copied ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy</>}
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  {Object.entries(sectionLabels).map(([key, title]) => {
                    const isExp = expandedSection === key;
                    const isEditing = editingSection === key;
                    return (
                      <GlassCard
                        key={key}
                        className={cn(
                          "p-5 transition-all duration-300 cursor-pointer",
                          isExp ? "border-primary/30 bg-primary/5" : "hover:border-gray-200"
                        )}
                        onClick={() => !isEditing && setExpandedSection(isExp ? null : key)}
                        hoverable={false}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-xs font-black text-gray-900">{title}</h4>
                            <p className="text-[10px] text-gray-400 mt-0.5">{sectionDescriptions[key]}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {!isEditing && (
                              <button
                                onClick={(e) => { e.stopPropagation(); handleStartEdit(key); }}
                                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                                title="Edit section"
                              >
                                <Edit3 size={14} className="text-gray-400" />
                              </button>
                            )}
                            <ChevronRight size={18} className={cn("text-gray-400 transition-transform duration-300", isExp && "rotate-90 text-primary")} />
                          </div>
                        </div>
                        <AnimatePresence>
                          {isExp && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="mt-4 pt-4 border-t border-gray-100">
                                {isEditing ? (
                                  <div className="space-y-3">
                                    <textarea
                                      className="w-full bg-white border border-primary/30 rounded-xl px-4 py-3 text-sm font-medium leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                                      rows={8}
                                      value={editedContent}
                                      onChange={(e) => setEditedContent(e.target.value)}
                                    />
                                    <div className="flex gap-2">
                                      <Button size="sm" onClick={handleSaveEdit} className="flex-1 h-9">
                                        <Save size={14} className="mr-1" /> Save
                                      </Button>
                                      <Button variant="secondary" size="sm" onClick={handleCancelEdit} className="flex-1 h-9">
                                        <X size={14} className="mr-1" /> Cancel
                                      </Button>
                                    </div>
                                  </div>
                                ) : (
                                  <p className="text-sm text-gray-700 leading-relaxed font-medium whitespace-pre-wrap">
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

                {scores && scores.improvements && scores.improvements.length > 0 && scores.final_score >= 85 && (
                  <GlassCard className="p-5 border-green-200 bg-green-50" hoverable={false}>
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle size={16} className="text-green-500" />
                      <h3 className="text-[10px] font-black uppercase tracking-widest text-green-600">Quality Checklist</h3>
                    </div>
                    <ul className="space-y-2">
                      {scores.improvements.slice(0, 3).map((imp, i) => (
                        <li key={i} className="flex items-start gap-2 text-[10px] font-bold text-gray-600 leading-tight">
                          <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span> {imp}
                        </li>
                      ))}
                    </ul>
                  </GlassCard>
                )}

                {scores && scores.improvements && scores.final_score < 85 && (
                  <GlassCard className="p-5 border-amber-200 bg-amber-50" hoverable={false}>
                    <div className="flex items-center gap-2 mb-3">
                      <AlertCircle size={16} className="text-amber-500" />
                      <h3 className="text-[10px] font-black uppercase tracking-widest text-amber-600">Improvement Suggestions</h3>
                    </div>
                    <ul className="space-y-2">
                      {scores.improvements.slice(0, 4).map((imp, i) => (
                        <li key={i} className="flex items-start gap-2 text-[10px] font-bold text-gray-600 leading-tight">
                          <span className="text-amber-500 mt-0.5 flex-shrink-0">→</span> {imp}
                        </li>
                      ))}
                    </ul>
                  </GlassCard>
                )}

                <GlassCard className="p-4 border-gray-200 border-dashed" hoverable={false}>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest text-center">
                    Review and personalize before submission. AI-generated content should be verified.
                  </p>
                </GlassCard>
              </motion.div>
            ) : (
              <GlassCard className="min-h-[600px] flex flex-col items-center justify-center text-center p-12 border-gray-200 group" hoverable={false}>
                <div className="relative mb-8">
                  <div className="w-24 h-24 rounded-[30%] bg-gray-100 border border-gray-200 flex items-center justify-center text-5xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-12 group-hover:bg-primary/5 group-hover:border-primary/20 group-hover:text-primary">
                    ✍️
                  </div>
                  <div className="absolute -inset-4 border border-gray-100 rounded-[35%] group-hover:border-primary/10 transition-colors" />
                </div>
                <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Ready to Generate</h3>
                <p className="text-gray-500 text-sm mt-3 max-w-sm font-medium leading-relaxed">
                  Fill in your profile on the left and generate a professional, admission-ready SOP.
                </p>
                <div className="mt-8 grid grid-cols-2 gap-3 w-full max-w-xs">
                  {[
                    { icon: Sparkles, label: 'AI-Powered' },
                    { icon: BrainCircuit, label: 'Quality Scored' },
                    { icon: Target, label: 'Auto-Improve' },
                    { icon: Check, label: 'Editable' }
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
