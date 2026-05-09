import { Command } from 'commander';
import chalk from 'chalk';
import { promises as fs } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { copyDir } from '../utils/copy.js';

const TARGETS = ['vercel', 'docker', 'railway'] as const;
type Target = (typeof TARGETS)[number];

const NEXT_STEPS: Record<Target, string[]> = {
  vercel: [
    'Install the Vercel CLI: `npm i -g vercel`',
    'Log in: `vercel login`',
    'Deploy: `vercel --prod`',
    'Set env vars in the Vercel dashboard (mirror your .env)'
  ],
  docker: [
    'Build the image: `docker build -t my-app .`',
    'Run locally: `docker compose up`',
    'Push: `docker tag my-app <registry>/my-app && docker push <registry>/my-app`'
  ],
  railway: [
    'Install the Railway CLI: `npm i -g @railway/cli`',
    'Log in: `railway login`',
    'Link a project: `railway link`',
    'Deploy: `railway up`'
  ]
};

function templatesRoot(): string {
  const here = dirname(fileURLToPath(import.meta.url));
  return resolve(here, '..', '..', 'templates');
}

async function pathExists(p: string): Promise<boolean> {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

export const deployCommand = new Command('deploy')
  .description('Write deployment config for a target platform into the current project.')
  .argument('<target>', `One of: ${TARGETS.join(', ')}`)
  .option('--force', 'Overwrite if any deployment files already exist', false)
  .action(async (target: string, opts: { force: boolean }) => {
    if (!TARGETS.includes(target as Target)) {
      throw new Error(
        `Unknown deploy target "${target}". Choose one of: ${TARGETS.join(', ')}`
      );
    }
    const overlayDir = resolve(templatesRoot(), 'deploy', target);
    if (!(await pathExists(overlayDir))) {
      throw new Error(
        `Deploy overlay missing: ${overlayDir}. Reinstall the CLI.`
      );
    }
    const cwd = process.cwd();

    if (!opts.force) {
      const conflicts: string[] = [];
      const walk = async (src: string, relRoot: string): Promise<void> => {
        const entries = await fs.readdir(src, { withFileTypes: true });
        for (const entry of entries) {
          const rel = relRoot ? join(relRoot, entry.name) : entry.name;
          const srcPath = join(src, entry.name);
          if (entry.isDirectory()) {
            await walk(srcPath, rel);
          } else if (await pathExists(join(cwd, rel))) {
            conflicts.push(rel);
          }
        }
      };
      await walk(overlayDir, '');
      if (conflicts.length > 0) {
        console.log(chalk.yellow('⚠ The following files already exist:'));
        for (const c of conflicts) console.log(`  ${c}`);
        console.log(chalk.dim('Re-run with --force to overwrite.'));
        return;
      }
    }

    await copyDir(overlayDir, cwd, {
      replacements: { projectName: basename(cwd), target }
    });
    console.log(chalk.green(`✓ Wrote ${target} deployment config.`));
    console.log('');
    console.log(chalk.bold('Next steps:'));
    for (const line of NEXT_STEPS[target as Target]) {
      console.log(`  ${line}`);
    }
  });
