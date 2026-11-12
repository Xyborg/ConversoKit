import 'express-serve-static-core';
import type { ConsentRecord } from '@conversokit/shared';
import type { AuthResult } from '@conversokit/auth';

declare module 'express-serve-static-core' {
  interface Request {
    conversokitAuth?: AuthResult;
    conversokitConsent?: ConsentRecord;
  }
}
