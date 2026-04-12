import { executeAiAnalysis } from '@/lib/ai/langGraphClient.js';

export async function generateAiAnalysis(mode, filters = {}) {
  return executeAiAnalysis(mode, filters);
}
