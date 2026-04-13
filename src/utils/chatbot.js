import universitiesData from '../data/universities.json';
import responsesData from '../data/chatResponses.json';

// ─────────────────────────────────────────────────────────────────────────────
// LOCAL filter extraction (instant, zero network call)
// ─────────────────────────────────────────────────────────────────────────────
const COUNTRY_KEYWORDS = {
  canada: 'Canada',    uk: 'UK',           'united kingdom': 'UK',
  britain: 'UK',       australia: 'Australia', germany: 'Germany',
  usa: 'USA',          'united states': 'USA', america: 'USA',
  france: 'France',    ireland: 'Ireland',     'new zealand': 'New Zealand',
  singapore: 'Singapore', netherlands: 'Netherlands', sweden: 'Sweden',
  italy: 'Italy',      japan: 'Japan',
};

const COURSE_KEYWORDS = {
  mba: 'MBA',                  'business administration': 'MBA',
  'computer science': 'Computer Science', cs: 'Computer Science',
  'data science': 'Data Science',         'machine learning': 'Data Science',
  'artificial intelligence': 'Data Science', ai: 'Data Science',
  engineering: 'Engineering',  finance: 'Finance',
  economics: 'Economics',      law: 'Law',
  medicine: 'Medicine',        psychology: 'Psychology',
};

function extractFiltersLocally(query) {
  const q = query.toLowerCase();
  const filters = {};
  for (const [kw, country] of Object.entries(COUNTRY_KEYWORDS)) {
    if (q.includes(kw)) { filters.country = country; break; }
  }
  for (const [kw, course] of Object.entries(COURSE_KEYWORDS)) {
    if (q.includes(kw)) { filters.course = course; break; }
  }
  const lakh = q.match(/under\s+(\d+)\s*lakh/);
  if (lakh) filters.maxFees = parseInt(lakh[1]) * 1200;
  const usd  = q.match(/\$(\d[\d,]*)/);
  if (usd)  filters.maxFees = parseInt(usd[1].replace(',', ''));
  const k    = q.match(/under\s+(\d+)\s*k/);
  if (k)    filters.maxFees = parseInt(k[1]) * 1000;
  return filters;
}

function filterUniversities(query) {
  const f = extractFiltersLocally(query);
  return universitiesData
    .filter((u) => {
      if (f.country && !u.country.toLowerCase().includes(f.country.toLowerCase())) return false;
      if (f.course  && !u.course.toLowerCase().includes(f.course.toLowerCase()))   return false;
      if (f.maxFees && u.fees > f.maxFees) return false;
      return true;
    })
    .slice(0, 3); // Return top 3 for cleaner UI
}

// ─────────────────────────────────────────────────────────────────────────────
// SIMULATED streaming response (Rule-based)
// ─────────────────────────────────────────────────────────────────────────────
export async function getChatResponseStream(userInput, onChunk, onDone) {
  const q = userInput.toLowerCase();
  let responseText = '';
  let matchedSuggestions = [];

  // 1. Check keyword matches in responsesData
  const matchedKey = Object.keys(responsesData.keywords).find(kw => q.includes(kw));
  
  if (matchedKey) {
    responseText = responsesData.keywords[matchedKey].response;
    matchedSuggestions = responsesData.keywords[matchedKey].suggestions;
  } else {
    // 2. If no direct keyword, try university filtering
    const unis = filterUniversities(userInput);
    if (unis.length > 0) {
      responseText = `I found some great universities matching your query:\n\n${unis
        .map(u => `• **${u.name}** in ${u.country} offers ${u.course} for approx. **$${u.fees.toLocaleString()}/year**.`)
        .join('\n')}\n\nWould you like to know more about the scholarship options or visa process for these countries?`;
      matchedSuggestions = ["Visa process", "Scholarships", "Loan options"];
    } else {
      // 3. Fallback to default
      responseText = responsesData.default;
      matchedSuggestions = ["Canada options", "UK programs", "MBA guide"];
    }
  }

  // Simulate typing effect
  const words = responseText.split(' ');
  for (let i = 0; i < words.length; i++) {
    onChunk(words[i] + (i === words.length - 1 ? '' : ' '));
    // Small delay to simulate "thinking/typing"
    await new Promise(resolve => setTimeout(resolve, Math.random() * 30 + 10));
  }

  onDone(matchedSuggestions);
}

/** Create a user message object */
export function createUserMessage(text) {
  return { text, isBot: false, id: Date.now() };
}

/** Format timestamp for display */
export function formatTime() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

