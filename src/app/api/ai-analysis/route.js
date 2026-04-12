import { NextResponse } from 'next/server';
import { generateAiAnalysis } from '@/services/aiAnalysisService.js';

export async function POST(request) {
  const payload = await request.json();
  const { mode, startDate, endDate } = payload || {};

  if (!mode) {
    return NextResponse.json(
      { error: 'AI analysis mode is required. Use sales, service, feedback, or struggles.' },
      { status: 400 }
    );
  }

  try {
    const analysis = await generateAiAnalysis(mode, { startDate, endDate });
    return NextResponse.json(analysis);
  } catch (error) {
    return NextResponse.json(
      { error: error?.message || 'AI analysis failed.' },
      { status: 500 }
    );
  }
}
