import { GoogleGenAI } from '@google/genai';

let aiOptions = null;

function getAi() {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error('Missing Gemini API key. Set GEMINI_API_KEY or GOOGLE_API_KEY in your environment.');
  }
  return new GoogleGenAI({ apiKey });
}

let aiInstance = null;

export async function generateAiText(prompt) {
  if (!prompt || typeof prompt !== 'string') {
    throw new Error('AI prompt must be a non-empty string.');
  }

  if (!aiInstance) {
    aiInstance = getAi();
  }

  const response = await aiInstance.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
    }
  });

  return response.text || '';
}
