/**
 * EduPath AI Chatbot
 *
 * API: NVIDIA Inference API (qwen/qwen3.5-397b-a17b)
 *   Browser → /api/nvidia/* (Vite proxy) → integrate.api.nvidia.com
 *
 * HuggingFace was abandoned due to repeated endpoint deprecations (410, 404).
 * Nvidia API is stable, fast, and streaming-capable.
 */

import universitiesData from '../data/universities.json';

// Proxied through Vite dev server — Authorization injected server-side from .env
// Key is NEVER in this file or in the browser bundle ✔️
const NVIDIA_URL = '/api/nvidia/v1/chat/completions';

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
    .slice(0, 6);
}

// ─────────────────────────────────────────────────────────────────────────────
// STREAMING response via Nvidia API (SSE)
// ─────────────────────────────────────────────────────────────────────────────
export async function getChatResponseStream(userInput, onChunk, onDone) {
  const topMatches = filterUniversities(userInput);

  const uniContext = topMatches.length > 0
    ? `Relevant universities from our database:\n${topMatches
        .map((u) => `• **${u.name}** (${u.country}) — ${u.course}, Annual Fees: $${u.fees?.toLocaleString()}`)
        .join('\n')}`
    : 'No specific universities matched. Provide general study-abroad advice.';

  const systemPrompt = `You are EduPath AI, a knowledgeable and friendly study-abroad advisor.

${uniContext}

Answer the user's question clearly. Use this structure:
• Start with a direct 1–2 sentence answer
• Use bullet points (•) for key details or university recommendations
• End with one helpful follow-up suggestion

Keep response under 200 words. Use **bold** for university names and important terms.`;

  try {
    const res = await fetch(NVIDIA_URL, {
      method: 'POST',
      headers: {
        // No Authorization header — Vite proxy injects it automatically from .env
        Accept: 'text/event-stream',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'meta/llama-3.1-8b-instruct',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user',   content: userInput },
        ],
        max_tokens: 400,
        temperature: 0.7,
        top_p: 0.9,
        stream: true,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`API ${res.status}: ${errText}`);
    }

    // Parse SSE stream
    const reader  = res.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';
    let inThinkBlock = false;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop();

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed === 'data: [DONE]') continue;
        if (!trimmed.startsWith('data: ')) continue;

        try {
          const json  = JSON.parse(trimmed.slice(6));
          let delta = json.choices?.[0]?.delta?.content ?? '';
          if (!delta) continue;

          // Strip any <think>...</think> blocks
          if (delta.includes('<think>')) inThinkBlock = true;
          if (inThinkBlock) {
            if (delta.includes('</think>')) {
              inThinkBlock = false;
              delta = delta.split('</think>').slice(1).join('');
            } else continue;
          }

          if (delta) onChunk(delta);
        } catch {
          // skip malformed SSE lines
        }
      }
    }

    onDone();
  } catch (err) {
    console.error('[EduPath] Chatbot error:', err.message);
    onChunk(`⚠️ **Connection error:** ${err.message}\n\nPlease check your internet and try again.`);
    onDone();
  }
}

/** Create a user message object */
export function createUserMessage(text) {
  return { text, isBot: false, timestamp: new Date().toISOString() };
}

/** Format timestamp for display */
export function formatTime(isoString) {
  const date = new Date(isoString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
