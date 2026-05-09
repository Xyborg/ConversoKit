import { Command } from 'commander';
import chalk from 'chalk';
import prompts from 'prompts';
import { promises as fs } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { copyDir } from '../utils/copy.js';

const TEMPLATES = ['commerce', 'booking', 'saas-onboarding'] as const;
type TemplateName = (typeof TEMPLATES)[number];

function templatesRoot(): string {
  const here = dirname(fileURLToPath(import.meta.url));
  // src/commands/create.ts → ../../templates  (built layout: dist/commands/ → ../../templates)
  return resolve(here, '..', '..', 'templates');
}

export const createCommand = new Command('create')
  .description('Scaffold a new ConversoKit app from a template.')
  .argument('<name>', 'Project directory name')
  .option(
    '-t, --template <name>',
    `Template to use (${TEMPLATES.join('|')})`,
    'commerce'
  )
  .option('--force', 'Overwrite if the directory already exists', false)
  .action(async (name: string, opts: { template: string; force: boolean }) => {
    if (!TEMPLATES.includes(opts.template as TemplateName)) {
      throw new Error(
        `Unknown template "${opts.template}". Choose one of: ${TEMPLATES.join(', ')}`
      );
    }
    const target = resolve(process.cwd(), name);

    let exists = false;
    try {
      await fs.access(target);
      exists = true;
    } catch {
      exists = false;
    }
    if (exists && !opts.force) {
      const { proceed } = await prompts({
        type: 'confirm',
        name: 'proceed',
        message: `${target} already exists. Overwrite?`,
        initial: false
      });
      if (!proceed) {
        console.log(chalk.yellow('Aborted.'));
        return;
      }
    }

    const root = templatesRoot();
    const baseDir = resolve(root, 'base');
    const overlayDir = resolve(root, opts.template);

    console.log(chalk.cyan(`▸ Scaffolding ${name} (${opts.template})…`));
    await copyDir(baseDir, target, {
      replacements: { projectName: name, template: opts.template }
    });
    try {
      await fs.access(overlayDir);
      await copyDir(overlayDir, target, {
        replacements: { projectName: name, template: opts.template }
      });
    } catch {
      // No overlay for this template — base is the whole thing.
    }

    console.log(chalk.green(`✓ Created ${name}/`));
    console.log('');
    console.log(chalk.bold('Next steps:'));
    console.log(`  cd ${name}`);
    console.log('  pnpm install');
    console.log('  pnpm dev');
    console.log('');
    console.log(
      chalk.dim(
        'The MCP server runs on :3000, the widget UI on :5173. ' +
          'Open the widget UI to try the demo.'
      )
    );
  });
