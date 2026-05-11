import { defineWorkspace } from 'vitest/config';

export default defineWorkspace([
  'packages/shared',
  'packages/widgets',
  'packages/themes',
  'packages/bridge',
  'packages/auth',
  'packages/cli',
]);
