// Module augmentation for Express's Request type.
// Imports below ensure the augmentation runs when this file is in the program.
import 'express-serve-static-core';
import type { AuthResult } from './AuthProvider.js';

declare module 'express-serve-static-core' {
  interface Request {
    conversokitAuth?: AuthResult;
  }
}
