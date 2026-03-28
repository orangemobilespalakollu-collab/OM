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
    sales: `You are a strategic business analytics assistant. Based on the provided sales records, describe what the business is doing well, where sales are low, and suggest innovative, tactical business strategies to maximize revenue and growth. Use the data only as provided.`,
    service: `You are a strategic service quality assistant. Based on the provided service ticket records, summarize strengths, recurring issues, and process improvement opportunities. Suggest high-impact business strategies to boost service efficiency and cut costs. Include model name, issue type, issue description, mobile type, registered date, and returned date when relevant.`,
    feedback: `You are a strategic customer feedback assistant. Summarize the themes, sentiment, and provide actionable business strategies from the provided feedback records to improve customer retention and lifetime value.`,
    struggles: `You are a repair analysis assistant. Analyze the not repairable records and their descriptions, then produce a concise list of struggle points and strategic business operation suggestions to reduce similar losses, enhance technician training, and improve future service success rates.`,
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
    '{\n  "overview": "A very brief, clear summary of overall business state.",\n  "positives": ["**Keyword**: Short point 1", "**Keyword**: Short point 2"],\n  "improvements": ["**Keyword**: Short point 1"],\n  "recommendations": ["**Strategic Business Move**: Actionable step to scale and improve"]\n}\n' +
    'Keep all points extremely short, simple, and concise. Always highlight key phrases using **bold markdown** within the strings.'
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
