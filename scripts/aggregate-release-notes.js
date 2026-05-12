#!/usr/bin/env node
// Build umbrella GitHub release notes from per-package CHANGELOG.md entries.
// Input: JSON array from changesets/action `publishedPackages` output.
// Usage: node scripts/aggregate-release-notes.js '[{"name":"@conversokit/widgets","version":"0.1.3"}]'

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

function buildNameToDir() {
  const map = new Map();
  for (const dir of readdirSync('packages')) {
    const pkgPath = join('packages', dir, 'package.json');
    try {
      const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
      if (pkg.name) map.set(pkg.name, join('packages', dir));
    } catch {}
  }
  return map;
}

function extractSection(changelog, version) {
  const lines = changelog.split('\n');
  const start = lines.findIndex((l) => l.trim() === `## ${version}`);
  if (start === -1) return null;
  const out = [];
  for (let i = start + 1; i < lines.length; i++) {
    if (lines[i].startsWith('## ')) break;
    out.push(lines[i]);
  }
  return out.join('\n').trim();
}

const raw = process.argv[2];
if (!raw) {
  console.error('Usage: aggregate-release-notes.js <publishedPackages JSON>');
  process.exit(1);
}

let published;
try {
  published = JSON.parse(raw);
} catch (err) {
  console.error('Invalid JSON input:', err.message);
  process.exit(1);
}

if (!Array.isArray(published) || published.length === 0) {
  console.log('_No packages published._');
  process.exit(0);
}

const dirs = buildNameToDir();
const sections = [];

for (const { name, version } of published) {
  const dir = dirs.get(name);
  let body = '';
  if (dir) {
    try {
      const cl = readFileSync(join(dir, 'CHANGELOG.md'), 'utf8');
      body = extractSection(cl, version) || '';
    } catch {}
  }
  sections.push(`## ${name}@${version}\n\n${body || '_No changelog entry._'}`);
}

console.log(sections.join('\n\n'));
