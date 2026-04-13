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
    .slice(0, 3);
}

// ─────────────────────────────────────────────────────────────────────────────
// NVIDIA API streaming response
// ─────────────────────────────────────────────────────────────────────────────
const SUGGESTIONS = ["Tell me about Canada", "MBA programs", "Education loans"];

export async function getChatResponseStream(userInput, onChunk, onDone) {
  let hasFinished = false;
  
  const finish = (suggestions = SUGGESTIONS) => {
    if (!hasFinished) {
      hasFinished = true;
      onDone(suggestions);
    }
  };

  try {
    const response = await fetch('/api/nvidia/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'mistralai/mixtral-8x7b-instruct-v0.1',
        messages: [{ role: 'user', content: userInput }],
        stream: true
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('NVIDIA API Error:', response.status, errorText);
      throw new Error(`API error: ${response.status}`);
    }

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
          const data = line.slice(6);
          if (data === '[DONE]') {
            finish();
            return;
          }
          try {
            const json = JSON.parse(data);
            const content = json.choices?.[0]?.delta?.content;
            if (content) onChunk(content);
          } catch (e) {}
        }
      }
    }
    
    finish();
  } catch (error) {
    console.error('Chat API error:', error);
    onChunk("Sorry, I encountered an error. Please check your API configuration and try again.");
    finish([]);
  }
}

/** Create a user message object */
export function createUserMessage(text) {
  return { text, isBot: false, id: Date.now() };
}

/** Format timestamp for display */
export function formatTime() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
