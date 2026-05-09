import { promises as fs } from 'node:fs';
import { join, relative } from 'node:path';

export interface CopyOptions {
  /** Apply marker substitution to file contents. */
  replacements?: Record<string, string>;
  /** Files/dirs to skip (relative to src). */
  ignore?: string[];
}

const TEXT_EXTS = new Set([
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.json',
  '.md',
  '.html',
  '.css',
  '.yml',
  '.yaml',
  '.toml',
  '.env',
  '.gitignore',
  ''
]);

function applyReplacements(content: string, repl: Record<string, string>): string {
  let out = content;
  for (const [key, value] of Object.entries(repl)) {
    out = out.split(`<% ${key} %>`).join(value);
  }
  return out;
}

export async function copyDir(
  src: string,
  dest: string,
  options: CopyOptions = {}
): Promise<void> {
  const entries = await fs.readdir(src, { withFileTypes: true });
  await fs.mkdir(dest, { recursive: true });
  for (const entry of entries) {
    const rel = entry.name;
    if (options.ignore?.includes(rel)) continue;
    const srcPath = join(src, entry.name);
    const destPath = join(dest, entry.name);
    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath, {
        ...options,
        ignore: options.ignore?.map((p) =>
          p.startsWith(`${rel}/`) ? p.slice(rel.length + 1) : p
        )
      });
    } else if (entry.isFile()) {
      await copyFile(srcPath, destPath, options.replacements);
    }
  }
}

async function copyFile(
  src: string,
  dest: string,
  replacements?: Record<string, string>
): Promise<void> {
  const ext = src.slice(src.lastIndexOf('.'));
  const isText = TEXT_EXTS.has(ext);
  if (isText && replacements) {
    const buf = await fs.readFile(src, 'utf8');
    await fs.writeFile(dest, applyReplacements(buf, replacements));
  } else {
    await fs.copyFile(src, dest);
  }
}

export function relativePath(from: string, to: string): string {
  return relative(from, to) || '.';
}
