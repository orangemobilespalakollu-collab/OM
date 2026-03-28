import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

if (!apiKey) {
  throw new Error('Missing Gemini API key. Set GEMINI_API_KEY or GOOGLE_API_KEY in your environment.');
}

const ai = new GoogleGenAI({ apiKey });

export async function generateAiText(prompt) {
  if (!prompt || typeof prompt !== 'string') {
    throw new Error('AI prompt must be a non-empty string.');
  }

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
    }
  });

  return response.text || '';
}
