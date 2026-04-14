import universitiesData from '../data/universities.json';
import sopTemplates from '../data/sopTemplates.json';
import { scoreSOP } from '../utils/sopScoring';
import { PROVIDERS, parseAIResponse } from './aiProvider';

const courseMap = {
  'Computer Science': 'ms_cs',
  'MBA': 'mba',
  'Data Science': 'ds',
  'Engineering': 'engineering',
};

// Timeout wrapper for API calls
function withTimeout(promise, ms = 10000) {
  return Promise.race([
    promise,
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Request timeout')), ms)
    )
  ]);
}

// Fuzzy match university
export function findUniversity(name) {
  if (!name) return null;
  const normalized = name.toLowerCase().trim();
  
  let match = universitiesData.find(u => u.name.toLowerCase() === normalized);
  if (match) return match;
  
  match = universitiesData.find(u => 
    u.name.toLowerCase().includes(normalized) || 
    normalized.includes(u.name.toLowerCase())
  );
  if (match) return match;
  
  const abbreviations = {
    'uc berkeley': 'University of California, Berkeley',
    'berkeley': 'University of California, Berkeley',
    'cmu': 'Carnegie Mellon University',
    'mit': 'MIT',
    'stanford': 'Stanford University',
    'ucla': 'University of California, Los Angeles',
    'toronto': 'University of Toronto',
    'ubc': 'University of British Columbia',
    'waterloo': 'University of Waterloo',
    'imperial': 'Imperial College London',
    'edinburgh': 'University of Edinburgh',
    'london business school': 'London Business School',
    'manchester': 'University of Manchester',
    'melbourne': 'University of Melbourne',
    'anu': 'Australian National University',
    'sydney': 'University of Sydney',
    'monash': 'Monash University',
    'tu munich': 'TU Munich',
    'tum': 'TU Munich',
    'heidelberg': 'Heidelberg University',
    'rwth': 'RWTH Aachen University',
    'aachen': 'RWTH Aachen University',
    'sfu': 'Simon Fraser University',
    'simon fraser': 'Simon Fraser University',
    'mcgill': 'McGill University',
  };
  
  for (const [abbr, fullName] of Object.entries(abbreviations)) {
    if (normalized.includes(abbr)) {
      match = universitiesData.find(u => u.name.toLowerCase() === fullName.toLowerCase());
      if (match) return match;
    }
  }
  
  return null;
}

// Build template variables from user data
function buildTemplateVars(userData, universityData) {
  const hooks = universityData?.sopHooks || {};
  const courseId = courseMap[userData.course] || 'ms_cs';
  const template = sopTemplates.find(t => t.id === courseId) || sopTemplates[0];
  
  const projects = userData.projects || [];
  const experiences = userData.workExperience || [];
  const achievements = userData.achievements || [];
  
  let projectMention = '';
  if (projects.length > 0) {
    const mainProject = projects[0];
    projectMention = `Key projects included "${mainProject.name}", where I ${mainProject.outcome || 'achieved significant results'}.`;
  }
  
  const achievementTexts = achievements.slice(0, 2).map((a, i) => {
    return `${i === 0 ? 'I' : 'Additionally, I'} ${a}`;
  }).join('. ');
  
  let achievement1 = '';
  let achievement2 = '';
  if (experiences.length > 0) {
    const mainExp = experiences[0];
    achievement1 = mainExp.responsibilities ? `I led initiatives that ${mainExp.responsibilities.substring(0, 100)}...` : `I contributed to ${mainExp.company}'s growth through my work as ${mainExp.role}.`;
    if (experiences.length > 1) {
      achievement2 = `At ${experiences[1].company}, I served as ${experiences[1].role} and ${experiences[1].responsibilities?.substring(0, 80) || 'gained valuable industry experience'}.`;
    }
  }
  
  const vars = {
    age_hook: 'at the age of sixteen, ',
    defining_moment: `first witnessed the power of technology to solve meaningful problems`,
    end_hook: '',
    
    name: userData.name || 'the applicant',
    gpa: userData.gpa || '3.5',
    undergrad_uni: userData.undergradUni || 'my undergraduate institution',
    experience: userData.experience || experiences.length.toString() || '2',
    company: experiences[0]?.company || userData.company || 'my current organization',
    job_title: experiences[0]?.role || userData.jobTitle || 'Software Engineer',
    team_size: experiences[0]?.team_size || '8',
    course: userData.course || 'Computer Science',
    university: userData.university || 'the target university',
    field: userData.course === 'MBA' ? 'Business Administration' : (userData.course || 'Computer Science'),
    thesis_topic: projects[0]?.name || 'a relevant technical topic',
    rank_percentile: '10',
    professional_achievement: `developing scalable solutions that served users effectively`,
    project_name: projects[0]?.name || 'an AI-powered analytics platform',
    project_outcome: projects[0]?.outcome || 'achieved significant results',
    impact_area: userData.targetIndustry || 'the technology sector',
    program_strength: hooks.programHighlight || 'cutting-edge research and industry connections',
    professor_name: hooks.facultyNotable?.[0] || 'distinguished faculty members',
    research_area: hooks.researchFocus || 'applied machine learning',
    your_interest: userData.course?.toLowerCase() || 'technology',
    career_goal: userData.careerGoal || `a lead ${userData.course || 'technology'} professional`,
    long_term_vision: userData.longTermGoal || 'build impactful technology solutions',
    contribution_area: 'technological innovation',
    target_country: userData.country || hooks.country || 'the target country',
    industry: userData.targetIndustry || 'technology',
    achievement: 'delivering high-impact projects consistently',
    academic_achievement: 'maintaining strong academic performance',
    alumni_count: '50,000',
    short_term_goal: userData.careerGoal || `join a leading ${userData.targetIndustry || 'technology'} firm`,
    specific_course: 'Strategic Leadership and Global Business',
    percentage: '42',
    pain_point: 'data processing latency',
    
    project_mention: projectMention,
    age_start: '16',
    technologies: projects[0]?.technologies || 'Python, Machine Learning, Cloud Platforms',
    quantified_result: 'measurable business impact',
    starting_point: 'technical individual contributor',
    mid_point: 'team lead',
    driving_motivation: 'create meaningful impact through technology',
    unique_qualifications: 'technical expertise and leadership experience',
    ultimate_goal: userData.longTermGoal || 'become a technology leader',
    passion_area: 'innovation and problem-solving',
    country_specific_reason: hooks.countryReason || 'excellent academic opportunities and diverse culture',
    additional_country_reason: 'This exposure will broaden my global business perspective.',
    tech_hub: 'a vibrant technology hub',
    company_partners: 'leading tech companies',
    target_audience: 'businesses and consumers',
    cultural_exposure: 'international business practices and diverse perspectives',
    industry_context: 'fast-paced environments',
    
    achievements_text: achievementTexts || 'demonstrated consistent high performance',
    achievement_1: achievement1,
    achievement_2: achievement2,
    
    key_subjects: userData.subjects || 'Data Structures, Algorithms, and Software Engineering',
    specific_skills: 'analytical and technical skills',
    
    program_highlight: hooks.programHighlight || 'industry partnerships and research opportunities',
    country: hooks.country || userData.country || 'the target country',
    
    specific_course_1: 'Advanced Machine Learning',
    specific_course_2: 'Research Methodology',
  };
  
  return { vars, template };
}

// Fill template with variables
function fillTemplate(templateText, vars) {
  let result = templateText;
  for (const [key, value] of Object.entries(vars)) {
    const regex = new RegExp(`\\{${key}\\}`, 'g');
    result = result.replace(regex, value);
  }
  return result;
}

// Generate SOP from template (synchronous - instant)
export function generateSOPFromTemplate(userData, universityData) {
  const { vars, template } = buildTemplateVars(userData, universityData);
  
  const sop = {
    introduction: fillTemplate(template.intro, vars),
    academic_background: fillTemplate(template.academic, vars),
    experience: fillTemplate(template.experience, vars),
    course_reason: fillTemplate(template.course_reason, vars),
    country_reason: fillTemplate(template.country_reason, vars),
    career_goals: fillTemplate(template.career_goals, vars),
    conclusion: fillTemplate(template.conclusion, vars),
  };
  
  // Clean up any unfilled placeholders
  for (const key of Object.keys(sop)) {
    sop[key] = sop[key].replace(/\{[^}]+\}/g, '').replace(/\s+/g, ' ').trim();
    sop[key] = sop[key].replace(/\.\s*\./g, '.').replace(/\s+/g, ' ').trim();
  }
  
  return sop;
}

// Instant template-based SOP generation
export function generateTemplateSOP(userData) {
  const university = findUniversity(userData.university);
  const sop = generateSOPFromTemplate(userData, university);
  const scores = scoreSOP(sop, userData);
  
  return {
    sop,
    score: scores,
    provider: PROVIDERS.TEMPLATE,
    university,
  };
}

// Build AI prompt for full SOP generation
function buildSOPPrompt(userData, universityData) {
  const hooks = universityData?.sopHooks || {};
  
  const projectsText = userData.projects && userData.projects.length > 0
    ? userData.projects.map((p, i) => {
        let text = `${i + 1}. ${p.name}`;
        if (p.description) text += `: ${p.description}`;
        if (p.technologies) text += ` (Technologies: ${p.technologies})`;
        if (p.outcome) text += ` — Outcome: ${p.outcome}`;
        return text;
      }).join('\n')
    : 'Not provided';

  const achievementsText = userData.achievements && userData.achievements.length > 0
    ? userData.achievements.map((a, i) => `${i + 1}. ${a}`).join('\n')
    : 'Not provided';

  const experienceText = userData.workExperience && userData.workExperience.length > 0
    ? userData.workExperience.map(w => {
        let text = `${w.company} (${w.role}) — ${w.duration || 'Duration not specified'}`;
        if (w.responsibilities) {
          text += `\n   Key responsibilities: ${w.responsibilities}`;
        }
        return text;
      }).join('\n')
    : 'Not provided';

  return `You are a senior AI product engineer and admission expert. Generate a high-quality, university-ready Statement of Purpose (SOP) for a graduate school application.

## USER PROFILE
- Name: ${userData.name || '[Your Name]'}
- Target Course: ${userData.course}
- Target University: ${userData.university}
- Country: ${userData.country || 'Not specified'}
- GPA: ${userData.gpa || 'Not provided'}
- Undergraduate Degree: ${userData.undergradDegree || 'Not provided'}
- Undergraduate University: ${userData.undergradUni || 'Not provided'}
- Key Subjects/Coursework: ${userData.subjects || 'Not provided'}
- Immediate Career Goal: ${userData.careerGoal || 'Not provided'}
- Long-term Career Goal: ${userData.longTermGoal || 'Not provided'}
- Target Industry: ${userData.targetIndustry || 'Not provided'}

## PROJECTS
${projectsText}

## WORK EXPERIENCE
${experienceText}

## ACHIEVEMENTS & AWARDS
${achievementsText}

## UNIVERSITY CONTEXT
- University: ${userData.university}
- Country: ${userData.country}
- Research Focus: ${hooks.researchFocus || userData.course || 'Not specified'}
- Notable Faculty: ${hooks.facultyNotable?.join(', ') || 'Distinguished faculty'}
- Program Highlights: ${hooks.programHighlight || 'Strong academic program'}
- Why This Country: ${hooks.countryReason || 'Excellent academic opportunities'}

## REQUIRED SOP STRUCTURE (7 sections, return as JSON only)
{
  "introduction": "[Strong opening hook - personal story or defining moment. 100-150 words. Do NOT use generic phrases like 'I am passionate about'.]",
  "academic_background": "[Discuss undergraduate foundation, coursework, projects. 120-180 words.]",
  "experience": "[Describe work experience/projects with quantifiable impact. Use strong verbs. 150-200 words.]",
  "course_reason": "[Explain WHY this course specifically. 100-150 words.]",
  "country_reason": "[Explain WHY this university and country. 100-150 words. Name specific faculty/programs.]",
  "career_goals": "[Short-term and long-term goals with logical progression. 100-150 words.]",
  "conclusion": "[Strong closing, summarize fit. 80-100 words. Do NOT repeat intro.]"
}

## WRITING RULES
- Professional tone, first person
- NO generic phrases
- Use strong action verbs: led, built, developed, engineered, launched, scaled
- Add quantifiable achievements
- Total word count: 800-1000 words
- Return ONLY valid JSON, no markdown, no explanation`;
}

// Try NVIDIA API with timeout
async function tryNVIDIA(prompt) {
  const response = await withTimeout(
    fetch('/api/nvidia/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'mistralai/mixtral-8x7b-instruct-v0.1',
        messages: [{ role: 'user', content: prompt }],
        stream: false,
        max_tokens: 2048,
        temperature: 0.7,
      }),
    }),
    8000 // 8 second timeout
  );

  if (!response.ok) {
    throw new Error(`NVIDIA API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  
  if (!content) {
    throw new Error('No content from NVIDIA API');
  }

  return content.trim();
}

// Try HuggingFace API with timeout
async function tryHuggingFace(prompt) {
  const response = await withTimeout(
    fetch('/api/hf/inference/tasks/text-generation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 1024,
          temperature: 0.7,
          return_full_text: false,
        },
      }),
    }),
    8000 // 8 second timeout
  );

  if (!response.ok) {
    throw new Error(`HuggingFace API error: ${response.status}`);
  }

  const data = await response.json();
  let content;
  if (Array.isArray(data)) {
    content = data[0]?.generated_text;
  } else if (data.generated_text) {
    content = data.generated_text;
  } else {
    throw new Error('Invalid HuggingFace response format');
  }

  if (!content) {
    throw new Error('No content from HuggingFace API');
  }

  return content.trim();
}

// Enhance SOP with AI (async, for background use)
export async function enhanceWithAI(userData, currentSOP = null) {
  const university = findUniversity(userData.university);
  const prompt = buildSOPPrompt(userData, university);
  
  // Try NVIDIA first with timeout
  try {
    const content = await tryNVIDIA(prompt);
    const parsed = parseAIResponse(content);
    if (parsed && parsed.introduction && parsed.conclusion) {
      return { provider: PROVIDERS.NVIDIA, sop: parsed };
    }
  } catch (e) {
    console.warn('NVIDIA enhancement failed:', e.message);
  }
  
  // Try HuggingFace second with timeout
  try {
    const content = await tryHuggingFace(prompt);
    const parsed = parseAIResponse(content);
    if (parsed && parsed.introduction && parsed.conclusion) {
      return { provider: PROVIDERS.HUGGINGFACE, sop: parsed };
    }
  } catch (e) {
    console.warn('HuggingFace enhancement failed:', e.message);
  }
  
  return null; // Enhancement failed
}

// Main generation function (async for backward compatibility)
export async function generateSOP(userData) {
  const university = findUniversity(userData.university);
  const prompt = buildSOPPrompt(userData, university);
  
  let provider = PROVIDERS.TEMPLATE;
  let sop = null;
  
  // Try NVIDIA API with timeout
  try {
    const content = await tryNVIDIA(prompt);
    const parsed = parseAIResponse(content);
    if (parsed && parsed.introduction && parsed.conclusion) {
      sop = parsed;
      provider = PROVIDERS.NVIDIA;
    }
  } catch (e) {
    console.warn('NVIDIA API failed:', e.message);
  }
  
  // Try HuggingFace API if NVIDIA failed
  if (!sop) {
    try {
      const content = await tryHuggingFace(prompt);
      const parsed = parseAIResponse(content);
      if (parsed && parsed.introduction && parsed.conclusion) {
        sop = parsed;
        provider = PROVIDERS.HUGGINGFACE;
      }
    } catch (e) {
      console.warn('HuggingFace API failed:', e.message);
    }
  }
  
  // Fallback to template if both APIs failed
  if (!sop) {
    console.log('Using template-based SOP generation (AI APIs unavailable)');
    sop = generateSOPFromTemplate(userData, university);
    provider = PROVIDERS.TEMPLATE;
  }
  
  const scores = scoreSOP(sop, userData);
  
  return {
    sop,
    score: scores,
    provider,
    university,
  };
}

// Improve a single section with AI (with timeout)
export async function improveSectionWithAI(sectionKey, currentText, userData) {
  const prompts = {
    introduction: `Rewrite this introduction to be more compelling with a strong hook. Avoid generic phrases. Keep it 100-150 words.\n\nCurrent: ${currentText}`,
    academic_background: `Rewrite to be more specific about coursework and academic preparation. Add concrete examples. Keep it 120-180 words.\n\nCurrent: ${currentText}`,
    experience: `Rewrite with strong action verbs and quantifiable impact. Make it clear what YOU did. 150-200 words.\n\nCurrent: ${currentText}`,
    course_reason: `Rewrite explaining WHY this course specifically. 100-150 words.\n\nCurrent: ${currentText}`,
    country_reason: `Rewrite explaining WHY this university and country. Be specific about faculty/programs. 100-150 words.\n\nCurrent: ${currentText}`,
    career_goals: `Rewrite showing clear progression from past to future. Be specific. 100-150 words.\n\nCurrent: ${currentText}`,
    conclusion: `Rewrite to be memorable. Summarize fit without repeating intro. 80-100 words.\n\nCurrent: ${currentText}`,
  };

  const prompt = prompts[sectionKey];
  if (!prompt) return null;

  try {
    const response = await withTimeout(
      fetch('/api/nvidia/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'mistralai/mixtral-8x7b-instruct-v0.1',
          messages: [{ role: 'user', content: prompt }],
          stream: false,
          max_tokens: 512,
          temperature: 0.75,
        }),
      }),
      5000 // 5 second timeout
    );

    if (response.ok) {
      const data = await response.json();
      const content = data.choices?.[0]?.message?.content?.trim();
      if (content && content.length > 20) {
        return content.replace(/^[""]|[""]$/g, '');
      }
    }
  } catch (e) {
    console.warn('Improve section failed:', e.message);
  }

  return null;
}

// Improve SOP (with timeouts)
export async function improveSOP(sop, scores, userData, weakness = 'all') {
  const weakSections = [];

  if (weakness === 'all') {
    weakSections.push('introduction', 'academic_background', 'experience', 'course_reason', 'country_reason', 'career_goals', 'conclusion');
  } else {
    if (scores.clarity < 85) weakSections.push('introduction', 'academic_background');
    if (scores.structure < 85) weakSections.push('course_reason', 'country_reason');
    if (scores.impact < 85) weakSections.push('experience', 'career_goals');
    if (scores.personalization < 85) weakSections.push('introduction', 'country_reason', 'career_goals');
  }

  const improved = { ...sop };
  const improvedSections = [];

  for (const section of weakSections) {
    const newText = await improveSectionWithAI(section, improved[section], userData);
    if (newText && newText !== improved[section]) {
      improved[section] = newText;
      improvedSections.push(section);
    }
  }

  const newScores = scoreSOP(improved, userData);

  return {
    sop: improved,
    score: newScores,
    improvedSections,
  };
}

// Re-export for compatibility
export { scoreSOP };
