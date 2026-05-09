import type { Tool } from '@conversokit/shared';
import { getAvailabilityTool } from './getAvailability.js';
import { createReservationTool } from './createReservation.js';
import { cancelReservationTool } from './cancelReservation.js';

export const tools: Tool[] = [
  getAvailabilityTool,
  createReservationTool,
  cancelReservationTool
];
