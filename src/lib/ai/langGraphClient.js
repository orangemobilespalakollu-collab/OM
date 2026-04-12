import { getTool } from './toolRegistry.js';
import { generateAiText } from './aiClient.js';

const MAX_RECORDS_FOR_PROMPT = 30;

function formatRecords(records, fields) {
  return records
    .slice(0, MAX_RECORDS_FOR_PROMPT)
    .map((record, index) => {
      const row = fields
        .map((field) => `${field.label}: ${record[field.key] ?? ''}`)
        .join(' | ');
      return `Record ${index + 1}: ${row}`;
    })
    .join('\n');
}

function buildPrompt(mode, records, filters) {
  const summaryLabel = {
    sales: 'Sales Performance',
    service: 'Service Performance',
    feedback: 'Customer Feedback',
    struggles: 'Repair Struggles',
  }[mode] || 'Analysis';

  const filterText = `Date range: ${filters.startDate || 'beginning'} to ${filters.endDate || 'till now'}`;
  const recordCount = records.length;

  if (recordCount === 0) {
    return `You are an AI analysis assistant. There are no records available for ${mode} analysis in the selected time range. Answer STRICTLY in valid JSON format matching this schema:\n{\n  "overview": "A concise statement acknowledging that no data was found.",\n  "positives": [],\n  "improvements": [],\n  "recommendations": []\n}`;
  }

  const modeInstructions = {
    sales: `Act as a helpful, beginner-friendly assistant for a local mobile repair shop owner. Look at the sales records and explain simply what is selling well and what isn't. Give 1 or 2 very easy-to-understand tips to increase daily sales.`,
    service: `Act as a helpful, beginner-friendly assistant for a local mobile repair shop. Look at the service tickets and explain simply what repair jobs are most common. Give easy, practical tips to make the service process smoother for customers.`,
    feedback: `Act as a helpful, beginner-friendly assistant for a local mobile repair shop. Summarize what customers are saying in very simple terms. Give easy ideas to make customers happier and get better reviews.`,
    struggles: `Act as a helpful, beginner-friendly assistant for a local mobile repair shop. Look at why some phones were marked "Not Repairable" (the mechanic's reason). Explain simply why tickets are failing and give an easy tip to avoid these specific failures next time.`,
  };

  const fieldsByMode = {
    sales: [
      { key: 'product_name', label: 'Product' },
      { key: 'brand_type', label: 'Brand' },
      { key: 'quantity', label: 'Quantity' },
      { key: 'price', label: 'Price' },
      { key: 'total', label: 'Total' },
      { key: 'recorded_by', label: 'Recorded By' },
      { key: 'created_at', label: 'Created At' },
    ],
    service: [
      { key: 'device_brand', label: 'Brand' },
      { key: 'device_model', label: 'Model' },
      { key: 'issue_type', label: 'Issue Type' },
      { key: 'issue_description', label: 'Issue Description' },
      { key: 'customer_mobile', label: 'Customer Mobile' },
      { key: 'created_at', label: 'Registered Date' },
      { key: 'returned_at', label: 'Returned Date' },
      { key: 'status', label: 'Status' },
    ],
    feedback: [
      { key: 'id', label: 'Feedback ID' },
      { key: 'customer_name', label: 'Customer Name' },
      { key: 'comments', label: 'Comments' },
      { key: 'rating', label: 'Rating' },
      { key: 'created_at', label: 'Created At' },
    ],
    struggles: [
      { key: 'device_brand', label: 'Brand' },
      { key: 'device_model', label: 'Model' },
      { key: 'issue_type', label: 'Issue Type' },
      { key: 'issue_description', label: 'Issue Description' },
      { key: 'customer_mobile', label: 'Customer Mobile' },
      { key: 'created_at', label: 'Registered Date' },
      { key: 'returned_at', label: 'Returned Date' },
    ],
  };

  const recordPayload = formatRecords(records, fieldsByMode[mode] || []);

  return [
    `Analysis type: ${summaryLabel}`,
    filterText,
    `Record count: ${recordCount}`,
    modeInstructions[mode] || `Provide a useful analysis.`,
    'Data records: ',
    recordPayload || 'No detailed records were provided.',
    'Answer STRICTLY in valid JSON format matching this schema:\n' +
    '{\n  "overview": "A very short, simple 1-sentence summary of how things are going.",\n  "positives": ["**Keyword**: 1 simple sentence explaining something good.", "**Keyword**: 1 simple positive fact."],\n  "improvements": ["**Keyword**: 1 simple sentence on what to fix under 15 words."],\n  "recommendations": ["**Easy Tip**: 1 practical, easy step to take right now."]\n}\n' +
    'CRITICAL RULES:\n' +
    '1. Write for a beginner. No complex business or technical jargon.\n' +
    '2. Keep everything extremely short. Maximum 1 sentence per bullet point.\n' +
    '3. Always highlight key phrases using **bold markdown** within the strings.\n' +
    '4. ABSOLUTELY NEVER blame "Staffing", "Skilled Technicians", or "Employee Availability". If a reason involves technicians, reframe it positively as a scheduling or process note, or just ignore it entirely.\n' +
    '5. Never use objectionable or demotivating language regarding the shop\'s staff.'
  ].join('\n\n');
}

export async function executeAiAnalysis(mode, filters = {}) {
  const tool = getTool(mode);
  if (!tool) {
    throw new Error(`Unsupported analysis mode: ${mode}`);
  }

  const toolResult = await tool.handler(filters);
  if (toolResult.error) {
    return {
      mode,
      title: tool.title,
      summary: `Unable to retrieve ${tool.title.toLowerCase()}: ${toolResult.error}`,
      recordCount: 0,
      error: toolResult.error,
    };
  }

  const prompt = buildPrompt(mode, toolResult.records, filters);
  const summaryText = await generateAiText(prompt);

  let summaryObj;
  try {
    const cleanedText = summaryText.replace(/```json\n?|```/g, '').trim();
    summaryObj = JSON.parse(cleanedText);
  } catch (err) {
    summaryObj = { overview: summaryText };
  }

  return {
    mode,
    title: tool.title,
    summary: summaryObj,
    recordCount: toolResult.records.length,
    meta: {
      filteredRange: {
        startDate: filters.startDate || 'beginning',
        endDate: filters.endDate || 'till now',
      },
    },
  };
}
