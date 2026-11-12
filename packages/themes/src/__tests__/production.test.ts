import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { runInNewContext } from 'node:vm';
import React from 'react';
import * as ReactDOMServer from 'react-dom/server';
import { build } from 'vite';
import { expect, it } from 'vitest';

const require = createRequire(import.meta.url);
const packageRoot = fileURLToPath(new URL('../../', import.meta.url));

it('renders the published theme provider and default context in a production bundle', async () => {
  const outDir = mkdtempSync(join(tmpdir(), 'conversokit-themes-'));
  try {
    // Compile the same JS entry point consumers receive from npm.
    execFileSync(process.execPath, [
      require.resolve('typescript/bin/tsc'),
      '--project', join(packageRoot, 'tsconfig.json'),
      '--outDir', outDir
    ]);
    const result = await build({
      configFile: false,
      esbuild: { jsxDev: false },
      logLevel: 'silent',
      define: { 'process.env.NODE_ENV': JSON.stringify('production') },
      resolve: { alias: { '@conversokit/themes': join(outDir, 'index.js') } },
      build: {
        write: false,
        target: 'es2020',
        minify: 'esbuild',
        lib: {
          entry: fileURLToPath(new URL('./fixtures/production.tsx', import.meta.url)),
          formats: ['iife'],
          name: 'ThemeFixture'
        },
        rollupOptions: {
          external: ['react', 'react/jsx-runtime', 'react-dom/server'],
          output: { globals: {
            react: 'React',
            'react/jsx-runtime': 'JSXRuntime',
            'react-dom/server': 'ReactDOMServer'
          } }
        }
      }
    });
    const outputs = Array.isArray(result) ? result : [result];
    const chunk = outputs.flatMap((output) => 'output' in output ? output.output : [])
      .find((output) => output.type === 'chunk' && output.isEntry);
    expect(chunk?.type).toBe('chunk');
    if (!chunk || chunk.type !== 'chunk') throw new Error('Missing production bundle');
    const context = { React, ReactDOMServer, JSXRuntime: require('react/jsx-runtime') };
    // Execute the flattened bundle outside Vitest's module transformer.
    runInNewContext(chunk.code, context);
    const fixture = (context as typeof context & {
      ThemeFixture: { commerceMarkup: string; defaultMarkup: string };
    }).ThemeFixture;
    expect(fixture.commerceMarkup).toContain('data-conversokit-theme="commerce"');
    expect(fixture.commerceMarkup).toContain('--ck-primary:#ea580c');
    expect(fixture.commerceMarkup).toContain('<span>commerce</span>');
    expect(fixture.defaultMarkup).toBe('<span>light</span>');
  } finally {
    rmSync(outDir, { recursive: true, force: true });
  }
}, 30_000);
