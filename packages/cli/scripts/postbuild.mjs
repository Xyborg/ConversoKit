#!/usr/bin/env node
import { chmodSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const cliJs = resolve(here, '..', 'dist', 'cli.js');

if (existsSync(cliJs)) {
  chmodSync(cliJs, 0o755);
  console.log(`chmod +x ${cliJs}`);
}
