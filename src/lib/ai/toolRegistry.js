import {
  fetchSalesData,
  fetchServiceData,
  fetchFeedbackData,
  fetchStrugglesData,
} from './dbTool.js';

const toolRegistry = new Map([
  [
    'sales',
    {
      name: 'sales',
      title: 'Sales Analysis',
      description: 'Analyze sales performance and identify strengths and weaknesses.',
      handler: fetchSalesData,
    },
  ],
  [
    'service',
    {
      name: 'service',
      title: 'Service Analysis',
      description: 'Analyze service tickets and identify opportunities for improvement.',
      handler: fetchServiceData,
    },
  ],
  [
    'feedback',
    {
      name: 'feedback',
      title: 'Feedback Analysis',
      description: 'Summarize customer feedback and sentiment.',
      handler: fetchFeedbackData,
    },
  ],
  [
    'struggles',
    {
      name: 'struggles',
      title: 'Struggles Analysis',
      description: 'Analyze not repairable service records and suggest improvements.',
      handler: fetchStrugglesData,
    },
  ],
]);

export function getTool(name) {
  return toolRegistry.get(name);
}

export function listTools() {
  return Array.from(toolRegistry.values());
}

export function registerTool(name, tool) {
  if (!name || !tool || typeof tool.handler !== 'function') {
    throw new Error('Invalid tool registration.');
  }
  toolRegistry.set(name, tool);
}
