/**
 * AI Provider Service
 * Unified service for AI text generation with automatic fallback
 * Priority: NVIDIA → HuggingFace → Template
 */

const PROVIDERS = {
  NVIDIA: 'nvidia',
  HUGGINGFACE: 'huggingface',
  TEMPLATE: 'template',
};

/**
 * Call NVIDIA API (Mistral 8x7B)
 */
export async function callNVIDIA(prompt, options = {}) {
  const { max_tokens = 2048, temperature = 0.7 } = options;
  
  const response = await fetch('/api/nvidia/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'mistralai/mixtral-8x7b-instruct-v0.1',
      messages: [{ role: 'user', content: prompt }],
      stream: false,
      max_tokens,
      temperature,
    }),
  });

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

/**
 * Call HuggingFace API (Mistral or T5)
 */
export async function callHuggingFace(prompt, options = {}) {
  const { max_tokens = 1024, temperature = 0.7 } = options;
  
  const response = await fetch('/api/hf/inference/tasks/text-generation', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      inputs: prompt,
      parameters: {
        max_new_tokens: max_tokens,
        temperature,
        return_full_text: false,
      },
    }),
  });

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

/**
 * Parse JSON from AI response - handles various formats
 */
export function parseAIResponse(content) {
  if (!content) return null;
  
  // Try direct JSON parse first
  try {
    return JSON.parse(content);
  } catch (e) {
    // Not direct JSON, try regex extraction
  }

  // Try to find JSON object in response
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[0]);
    } catch (e) {
      console.warn('Failed to parse extracted JSON:', e);
    }
  }

  // Try to find JSON array
  const arrayMatch = content.match(/\[[\s\S]*\]/);
  if (arrayMatch) {
    try {
      return JSON.parse(arrayMatch[0]);
    } catch (e) {
      console.warn('Failed to parse extracted array:', e);
    }
  }

  return null;
}

/**
 * Main function: Generate text with automatic fallback
 * Returns { provider, content, success }
 */
export async function generateWithFallback(prompt, options = {}) {
  const { max_tokens = 2048, temperature = 0.7 } = options;

  // Try NVIDIA first
  try {
    const content = await callNVIDIA(prompt, { max_tokens, temperature });
    return { provider: PROVIDERS.NVIDIA, content, success: true };
  } catch (nvidiaError) {
    console.warn('NVIDIA API failed:', nvidiaError.message);
  }

  // Try HuggingFace second
  try {
    const content = await callHuggingFace(prompt, { max_tokens, temperature });
    return { provider: PROVIDERS.HUGGINGFACE, content, success: true };
  } catch (hfError) {
    console.warn('HuggingFace API failed:', hfError.message);
  }

  // Both APIs failed
  return { provider: PROVIDERS.TEMPLATE, content: null, success: false };
}

export { PROVIDERS };
