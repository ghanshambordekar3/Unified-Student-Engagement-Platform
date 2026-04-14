import universitiesData from '../data/universities.json';
import responsesData from '../data/chatResponses.json';

// ─────────────────────────────────────────────────────────────────────────────
// LOCAL filter extraction (instant, zero network call)
// ─────────────────────────────────────────────────────────────────────────────
const COUNTRY_KEYWORDS = {
  canada: 'Canada', uk: 'UK', 'united kingdom': 'UK',
  britain: 'UK', australia: 'Australia', germany: 'Germany',
  usa: 'USA', 'united states': 'USA', america: 'USA',
  france: 'France', ireland: 'Ireland', 'new zealand': 'New Zealand',
  singapore: 'Singapore', netherlands: 'Netherlands', sweden: 'Sweden',
  italy: 'Italy', japan: 'Japan',
};

const COURSE_KEYWORDS = {
  mba: 'MBA', 'business administration': 'MBA',
  'computer science': 'Computer Science', cs: 'Computer Science',
  'data science': 'Data Science', 'machine learning': 'Data Science',
  'artificial intelligence': 'Data Science', ai: 'Data Science',
  engineering: 'Engineering', finance: 'Finance',
  economics: 'Economics', law: 'Law',
  medicine: 'Medicine', psychology: 'Psychology',
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
  const usd = q.match(/\$(\d[\d,]*)/);
  if (usd) filters.maxFees = parseInt(usd[1].replace(',', ''));
  const k = q.match(/under\s+(\d+)\s*k/);
  if (k) filters.maxFees = parseInt(k[1]) * 1000;
  return filters;
}

function filterUniversities(query) {
  const f = extractFiltersLocally(query);
  const results = universitiesData
    .filter((u) => {
      if (f.country && !u.country.toLowerCase().includes(f.country.toLowerCase())) return false;
      if (f.course && !u.course.toLowerCase().includes(f.course.toLowerCase())) return false;
      if (f.maxFees && u.fees > f.maxFees) return false;
      return true;
    });
    
  // Randomize to prevent repetition
  return results.sort(() => Math.random() - 0.5).slice(0, 3);
}

// ─────────────────────────────────────────────────────────────────────────────
// NVIDIA API streaming response
// ─────────────────────────────────────────────────────────────────────────────
const SUGGESTIONS = ["Tell me about Canada", "Germany free education", "USA vs UK fees", "IELTS requirements"];

export async function getChatResponseStream(userInput, onChunk, onDone, history = []) {
  let hasFinished = false;
  let responseData = null;
  const q = userInput.toLowerCase();

  // 1. FAST PATH: Check keyword matches (Static rules)
  const matchedKey = Object.keys(responsesData.keywords).find(kw => q.includes(kw));
  if (matchedKey && !q.includes('compare') && !q.includes('why') && q.length < 25) {
    const text = responsesData.keywords[matchedKey].response;
    const suggestions = responsesData.keywords[matchedKey].suggestions;
    
    const words = text.split(' ');
    for (let i = 0; i < words.length; i++) {
        onChunk(words[i] + (i === words.length - 1 ? '' : ' '));
        await new Promise(r => setTimeout(r, 10));
    }
    
    const unis = filterUniversities(matchedKey);
    if (unis.length > 0) responseData = { universities: unis };
    
    onDone(suggestions, responseData);
    return;
  }

  // 2. DYNAMIC PATH: NVIDIA AI with Data Grounding
  const finish = (suggestions = SUGGESTIONS, data = responseData) => {
    if (!hasFinished) {
      hasFinished = true;
      onDone(suggestions, data);
    }
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const filteredUnis = filterUniversities(userInput);
    const dataContext = filteredUnis.length > 0 
      ? `\nRelevant Universities Found: ${JSON.stringify(filteredUnis.map(u => ({name: u.name, country: u.country, fees: u.fees, rank: u.ranking})))}`
      : "";

    if (filteredUnis.length > 0 && !q.match(/^(hi|hello|hey|thanks)(\s|$)/)) {
       responseData = { universities: filteredUnis };
    }

    const recentHistory = (history || []).slice(-4).map(m => `${m.isBot ? 'Assistant' : 'User'}: ${m.text}`).join('\n');

    const prompt = `You are EduPath Career AI, a world-class study abroad consultant.

GLOBAL KNOWLEDGE BASE:
- USA: Fees $40k-$75k/yr. Ivy Leagues (Harvard, MIT) are elite. F1 Visa. STEM OPT is 3 yrs.
- UK: Fees $25k-$45k/yr. Masters are 1 yr. Tier 4 Visa. Graduate Route (2yr PSW).
- CANADA: Fees $20k-$35k/yr. Study Permit. PGWP leads to PR. University of Toronto/Waterloo are top.
- GERMANY: Public unis are Free/Low-fee ($0-$5k). Masters 2yrs. Blocked Account (~€11k) needed.
- AUSTRALIA: Fees $30k-$50k/yr. Masters 2yrs. Subclass 500 visa. High quality of life.

GUIDELINES:
1. STRUCTURE: Use ### Headers for sections. Use Bullet points for comparison.
2. COMPLETENESS: Answer ALL parts of the user's question.
3. DATA: Always prioritize the provided 'Relevant Universities' data if it exists.
4. STYLE: Professional, insightful, and encouraging. Use Markdown.
5. NO REPETITION: Do not repeat sentences from history.

${dataContext}

Conversation History:
${recentHistory}

User Query: ${userInput}`;

    const response = await fetch('/api/nvidia/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        model: 'meta/llama-3.1-8b-instruct',
        messages: [{ role: 'user', content: prompt }],
        stream: true,
        max_tokens: 512
      })
    });

    clearTimeout(timeoutId);
    if (!response.ok) throw new Error(`Status: ${response.status}`);

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const dataContent = line.slice(6);
          if (dataContent === '[DONE]') {
            finish();
            return;
          }
          try {
            const json = JSON.parse(dataContent);
            const content = json.choices?.[0]?.delta?.content;
            if (content) onChunk(content);
          } catch (e) {}
        }
      }
    }
    
    finish();
  } catch (error) {
    clearTimeout(timeoutId);
    console.error('Chat error:', error.name === 'AbortError' ? 'Timeout' : error);
    
    if (error.name === 'AbortError') {
      onChunk("Taking a bit longer than expected... here's some info based on my database:");
    } else {
      onChunk("Sorry, I encountered an occasional connection issue. Let me help you with my local database:");
    }
    
    const unis = filterUniversities(userInput);
    if (unis.length > 0) {
        finish(["Visa process", "Scholarships"], { universities: unis });
    } else {
        onChunk(`\n${responsesData.default}`);
        finish(["Canada options", "UK programs"]);
    }
  }
}

export const formatTime = (isoString) => {
  const date = new Date(isoString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};
