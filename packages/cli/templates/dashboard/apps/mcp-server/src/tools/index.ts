import type { Tool } from '@conversokit/shared';
import { getKpisTool } from './getKpis.js';
import { getTrendSeriesTool } from './getTrendSeries.js';
import { getAnalyticsPanelTool } from './getAnalyticsPanel.js';
import { getAlertsTool } from './getAlerts.js';

// Starter overlay: dashboard tools are unauthenticated for the demo.
// In production, set permissions.requiresAuth = true on each and wire JWT/Clerk.
export const tools: Tool[] = [
  getKpisTool,
  getTrendSeriesTool,
  getAnalyticsPanelTool,
  getAlertsTool
];
