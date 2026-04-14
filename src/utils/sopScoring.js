const GENERIC_PHRASES = [
  'i am passionate about',
  'i have always been interested',
  'i want to pursue my dream',
  'this program will help me',
  'i am excited to apply',
  'i would be honored',
  'my dream is to',
  'i have always wanted to',
  'i am eager to learn',
  'through this program',
  'it is my lifelong dream',
  'ever since i was young',
  'i am motivated by',
  'i have a strong desire',
  'my passion lies in',
  'i am determined to',
  'i believe that',
  'i am confident that',
  'this is my calling',
  'i feel that i am',
  'my main goal is to',
  'the main reason i',
  'one of my main goals',
  'my objective is to',
  'i have a keen interest',
];

const STRONG_VERBS = [
  'led', 'built', 'developed', 'designed', 'architected', 'engineered',
  'launched', 'scaled', 'optimized', 'implemented', 'streamlined',
  'spearheaded', 'orchestrated', 'pioneered', 'transformed', 'achieved',
  'delivered', 'reduced', 'increased', 'improved', 'automated',
  'analyzed', 'created', 'established', 'founded', 'co-founded',
  'mentored', 'collaborated', 'negotiated', 'restructured', 'launched',
  'deployed', 'integrated', 'containerized', 'migrated', 'secured',
  'validated', 'fabricated', 'manufactured', 'researched',
];

export function scoreSOP(sop, userData = {}) {
  const sections = [
    sop.introduction,
    sop.academic_background,
    sop.experience,
    sop.course_reason,
    sop.country_reason,
    sop.career_goals,
    sop.conclusion,
  ];

  const fullText = sections.join(' ').toLowerCase();
  const totalWords = fullText.split(/\s+/).filter(Boolean).length;

  const clarity = calculateClarity(sections, totalWords);
  const structure = calculateStructure(sections);
  const impact = calculateImpact(fullText, sections);
  const personalization = calculatePersonalization(fullText, userData);

  const final_score = Math.round((clarity + structure + impact + personalization) / 4);

  const improvements = generateImprovements({
    clarity, structure, impact, personalization,
    fullText, sections, totalWords, userData,
  });

  return {
    clarity: Math.round(clarity),
    structure: Math.round(structure),
    impact: Math.round(impact),
    personalization: Math.round(personalization),
    final_score,
    improvements,
  };
}

function calculateClarity(sections, totalWords) {
  let score = 70;

  if (totalWords >= 800 && totalWords <= 1200) {
    score += 15;
  } else if (totalWords >= 500 && totalWords < 800) {
    score += 8;
  } else if (totalWords > 1200) {
    score += 5;
  } else {
    score -= 10;
  }

  for (const section of sections) {
    const sentences = section.split(/[.!?]+/).filter(s => s.trim().length > 0);
    for (const sentence of sentences) {
      const words = sentence.trim().split(/\s+/).length;
      if (words > 40) score -= 2;
      if (words < 8 && words > 1) score -= 1;
    }
  }

  const paragraphs = sections.join('\n\n');
  const avgParaLength = paragraphs.split(/\n\n+/).filter(Boolean).length > 0
    ? totalWords / paragraphs.split(/\n\n+/).filter(Boolean).length
    : totalWords;
  if (avgParaLength >= 80 && avgParaLength <= 150) score += 5;

  return Math.min(100, Math.max(0, score));
}

function calculateStructure(sections) {
  let score = 50;

  if (sections.length === 7) score += 20;

  const sectionNames = ['intro', 'academic', 'experience', 'course', 'country', 'career', 'conclusion'];
  for (let i = 0; i < sections.length; i++) {
    if (sections[i] && sections[i].trim().length > 100) score += 4;
  }

  const hasFlow = checkFlow(sections);
  if (hasFlow) score += 10;

  return Math.min(100, Math.max(0, score));
}

function checkFlow(sections) {
  const transitionWords = ['therefore', 'consequently', 'furthermore', 'moreover', 'additionally',
    'building on', 'this experience', 'driven by', 'inspired by', 'pursuing', 'aligns'];
  let transitions = 0;
  for (const section of sections) {
    const text = section.toLowerCase();
    for (const word of transitionWords) {
      if (text.includes(word)) transitions++;
    }
  }
  return transitions >= 3;
}

function calculateImpact(fullText, sections) {
  let score = 60;

  for (const verb of STRONG_VERBS) {
    const regex = new RegExp(`\\b${verb}\\b`, 'gi');
    const matches = fullText.match(regex);
    if (matches) score += Math.min(matches.length * 2, 15);
  }

  const numbers = fullText.match(/\d+%|\d+x|\d+K|\d+k|\$\d+|\d+\s*(percent|people|users|customers|engineers)/gi);
  if (numbers) score += Math.min(numbers.length * 3, 15);

  for (const phrase of GENERIC_PHRASES) {
    if (fullText.includes(phrase)) score -= 5;
  }

  const uniqueSentences = new Set(sections.map(s => s.trim()).filter(Boolean));
  if (uniqueSentences.size >= 5) score += 5;

  return Math.min(100, Math.max(0, score));
}

function calculatePersonalization(fullText, userData) {
  let score = 60;

  if (userData.name && userData.name.trim()) score += 5;

  if (userData.university && fullText.includes(userData.university.toLowerCase())) score += 8;
  else if (userData.university) score -= 5;

  if (userData.course && fullText.includes(userData.course.toLowerCase())) score += 5;

  if (userData.country && fullText.includes(userData.country.toLowerCase())) score += 5;

  if (userData.company && fullText.includes(userData.company.toLowerCase())) score += 8;

  if (userData.gpa && fullText.includes(userData.gpa)) score += 5;

  if (userData.careerGoal && userData.careerGoal.trim().length > 10) {
    const goalWords = userData.careerGoal.toLowerCase().split(/\s+/);
    let matchCount = 0;
    for (const word of goalWords) {
      if (word.length > 3 && fullText.includes(word)) matchCount++;
    }
    if (matchCount >= 3) score += 7;
  }

  if (userData.projects && userData.projects.length > 0) {
    for (const proj of userData.projects) {
      if (proj.name && fullText.includes(proj.name.toLowerCase())) score += 3;
    }
  }

  if (userData.achievements && userData.achievements.length > 0) {
    score += Math.min(userData.achievements.length * 2, 8);
  }

  return Math.min(100, Math.max(0, score));
}

function generateImprovements({ clarity, structure, impact, personalization, fullText, sections, totalWords, userData }) {
  const suggestions = [];

  if (clarity < 85) {
    if (totalWords < 600) suggestions.push('Expand your SOP to 800-1000 words for a more comprehensive narrative.');
    if (totalWords > 1200) suggestions.push('Consider tightening your writing — aim for 800-1000 words to maintain impact.');
    suggestions.push('Use shorter, clearer sentences. Avoid run-on paragraphs that dilute your message.');
    suggestions.push('Each paragraph should focus on ONE key idea or experience.');
  }

  if (structure < 85) {
    const missingSections = [];
    if (!sections[0] || sections[0].length < 100) missingSections.push('Introduction');
    if (!sections[1] || sections[1].length < 100) missingSections.push('Academic Background');
    if (!sections[2] || sections[2].length < 100) missingSections.push('Work Experience');
    if (!sections[3] || sections[3].length < 100) missingSections.push('Why This Course');
    if (!sections[4] || sections[4].length < 100) missingSections.push('Why This Country/University');
    if (!sections[5] || sections[5].length < 100) missingSections.push('Career Goals');
    if (!sections[6] || sections[6].length < 100) missingSections.push('Conclusion');

    if (missingSections.length > 0) {
      suggestions.push(`Strengthen the following sections: ${missingSections.join(', ')}. Each section needs 100+ words.`);
    }
    suggestions.push('Add transition sentences between paragraphs to create a smooth narrative flow.');
  }

  if (impact < 85) {
    let genericFound = [];
    for (const phrase of GENERIC_PHRASES) {
      if (fullText.includes(phrase)) genericFound.push(phrase);
    }
    if (genericFound.length > 0) {
      suggestions.push(`Replace generic phrases: "${genericFound.slice(0, 3).join('", "')}". Be specific about your experiences.`);
    }

    const hasNumbers = fullText.match(/\d+%|\d+x|\d+K|\$\d+/);
    if (!hasNumbers) suggestions.push('Add quantifiable achievements (e.g., "improved performance by 40%", "managed a team of 8").');
    suggestions.push('Use strong action verbs: led, built, developed, engineered, launched, scaled, optimized.');
    suggestions.push('Each claim should be backed by a specific example or result.');
  }

  if (personalization < 85) {
    if (userData.university && !fullText.includes(userData.university.toLowerCase())) {
      suggestions.push(`Mention "${userData.university}" specifically — why this university and not others?`);
    }
    if (userData.course && !fullText.includes(userData.course.toLowerCase())) {
      suggestions.push(`Explicitly reference the "${userData.course}" program and its specific curriculum elements.`);
    }
    if (!userData.projects || userData.projects.length === 0) {
      suggestions.push('Add specific project details — names, technologies, outcomes, and your specific role.');
    }
    if (!userData.achievements || userData.achievements.length === 0) {
      suggestions.push('Include at least 2-3 specific achievements (awards, rankings, recognitions).');
    }
    suggestions.push('Connect your past experiences directly to your future goals — show the logical progression.');
  }

  if (suggestions.length === 0) {
    suggestions.push('Your SOP is well-structured. Consider having a mentor review it for final polish.');
    suggestions.push('Tailor the final version specifically for the university\'s values and culture.');
  }

  return suggestions.slice(0, 6);
}
