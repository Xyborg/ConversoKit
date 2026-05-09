import { Command } from 'commander';
import chalk from 'chalk';
import prompts from 'prompts';
import { promises as fs } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { copyDir } from '../utils/copy.js';

const KINDS = ['widget', 'integration', 'template'] as const;
type Kind = (typeof KINDS)[number];

const TEMPLATES = ['commerce', 'booking', 'saas-onboarding'] as const;

const KNOWN_INTEGRATIONS: Record<
  string,
  {
    pkg: string;
    envVars: string[];
    wireUpHint: string;
  }
> = {
  stripe: {
    pkg: '@conversokit/integrations',
    envVars: ['STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET'],
    wireUpHint:
      "import { createStripeProvider } from '@conversokit/integrations';\n" +
      'const stripe = createStripeProvider(process.env);'
  },
  hubspot: {
    pkg: '@conversokit/integrations',
    envVars: ['HUBSPOT_API_KEY'],
    wireUpHint:
      "import { createHubspotProvider } from '@conversokit/integrations';\n" +
      'const hubspot = createHubspotProvider(process.env);'
  },
  supabase: {
    pkg: '@conversokit/integrations',
    envVars: ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'],
    wireUpHint:
      "import { createSupabaseStores } from '@conversokit/integrations';\n" +
      'const stores = createSupabaseStores(process.env);'
  },
  resend: {
    pkg: '@conversokit/integrations',
    envVars: ['RESEND_API_KEY'],
    wireUpHint:
      "import { createResendProvider } from '@conversokit/integrations';\n" +
      'const email = createResendProvider(process.env);'
  }
};

function templatesRoot(): string {
  const here = dirname(fileURLToPath(import.meta.url));
  return resolve(here, '..', '..', 'templates');
}

function kebabToPascal(s: string): string {
  return s
    .split(/[-_\s]/)
    .filter(Boolean)
    .map((p) => p[0].toUpperCase() + p.slice(1))
    .join('');
}

async function pathExists(p: string): Promise<boolean> {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function addWidget(name: string): Promise<void> {
  const pascal = kebabToPascal(name);
  const cwd = process.cwd();
  const widgetsDir = join(cwd, 'apps', 'widget-ui', 'src', 'widgets');
  const target = join(widgetsDir, `${pascal}.tsx`);

  if (!(await pathExists(join(cwd, 'apps', 'widget-ui')))) {
    throw new Error(
      'No apps/widget-ui directory in the current path. Run `conversokit add` from a project created by `conversokit create`.'
    );
  }

  if (await pathExists(target)) {
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

  await fs.mkdir(widgetsDir, { recursive: true });
  const content = `import React from 'react';
import { z } from 'zod';
import { defaultWidgetConfig, type WidgetMeta } from '@conversokit/shared';

export interface ${pascal}Props {
  title: string;
  onAction?: () => void;
}

export const ${pascal}: React.FC<${pascal}Props> = ({ title, onAction }) => (
  <div
    style={{
      backgroundColor: 'var(--ck-surface)',
      color: 'var(--ck-text)',
      border: '1px solid var(--ck-border)',
      borderRadius: 'var(--ck-radius-md)',
      padding: 'var(--ck-spacing-4)'
    }}
  >
    <h3 style={{ margin: 0 }}>{title}</h3>
    {onAction && (
      <button
        type="button"
        onClick={onAction}
        style={{
          marginTop: 'var(--ck-spacing-2)',
          padding: '6px 12px',
          borderRadius: 'var(--ck-radius-sm)',
          border: 'none',
          backgroundColor: 'var(--ck-primary)',
          color: 'var(--ck-primary-foreground)',
          cursor: 'pointer'
        }}
      >
        Continue
      </button>
    )}
  </div>
);

export const ${pascal}Schema = z.object({ title: z.string() });

export const ${pascal}Meta: WidgetMeta = {
  name: '${pascal}',
  category: 'core',
  version: '0.1.0',
  config: { ...defaultWidgetConfig, permissions: {} },
  schema: ${pascal}Schema
};
`;
  await fs.writeFile(target, content);

  // Maintain a local registry file so the host app can register custom widgets.
  const registryPath = join(widgetsDir, 'index.ts');
  let registryContent = '';
  if (await pathExists(registryPath)) {
    registryContent = await fs.readFile(registryPath, 'utf8');
  } else {
    registryContent = `import { registerWidget } from '@conversokit/widgets';\n\n`;
  }
  if (!registryContent.includes(`from './${pascal}.js'`)) {
    registryContent +=
      `export { ${pascal}, ${pascal}Meta } from './${pascal}.js';\n` +
      `import { ${pascal}Meta } from './${pascal}.js';\n` +
      `registerWidget(${pascal}Meta);\n`;
    await fs.writeFile(registryPath, registryContent);
  }

  console.log(chalk.green(`✓ Created apps/widget-ui/src/widgets/${pascal}.tsx`));
  console.log(chalk.green(`✓ Registered in apps/widget-ui/src/widgets/index.ts`));
  console.log('');
  console.log('Next: import the widget in your App.tsx:');
  console.log(
    chalk.dim(`  import { ${pascal} } from './widgets/${pascal}.js';`)
  );
}

async function addIntegration(name: string): Promise<void> {
  const cwd = process.cwd();
  const cfg = KNOWN_INTEGRATIONS[name];
  if (!cfg) {
    throw new Error(
      `Unknown integration "${name}". Known: ${Object.keys(KNOWN_INTEGRATIONS).join(', ')}.`
    );
  }

  // Patch .env.example with the env keys this integration needs.
  const envExamplePath = join(cwd, '.env.example');
  if (await pathExists(envExamplePath)) {
    const current = await fs.readFile(envExamplePath, 'utf8');
    const lines = current.split('\n');
    const additions: string[] = [];
    for (const key of cfg.envVars) {
      const re = new RegExp(`^#?\\s*${key}=`);
      if (!lines.some((line) => re.test(line))) {
        additions.push(`# ${key}=`);
      }
    }
    if (additions.length > 0) {
      const updated =
        current.trimEnd() +
        `\n\n# Added by \`conversokit add integration ${name}\`\n` +
        additions.join('\n') +
        '\n';
      await fs.writeFile(envExamplePath, updated);
      console.log(
        chalk.green(`✓ Added ${additions.length} env var(s) to .env.example`)
      );
    } else {
      console.log(chalk.dim('• .env.example already contains the required keys'));
    }
  } else {
    console.log(
      chalk.yellow(
        '⚠ No .env.example in the current directory; skipping env patching.'
      )
    );
  }

  console.log('');
  console.log(chalk.bold('Wire-up snippet:'));
  console.log('');
  console.log(chalk.dim(cfg.wireUpHint));
  console.log('');
  console.log(chalk.bold('If not already installed:'));
  console.log(`  pnpm add ${cfg.pkg}`);
}

async function addTemplate(name: string, force: boolean): Promise<void> {
  if (!TEMPLATES.includes(name as (typeof TEMPLATES)[number])) {
    throw new Error(
      `Unknown template "${name}". Choose one of: ${TEMPLATES.join(', ')}`
    );
  }
  const cwd = process.cwd();
  const overlayDir = resolve(templatesRoot(), name);
  if (!(await pathExists(overlayDir))) {
    throw new Error(
      `Template overlay not found: ${overlayDir}. Reinstall the CLI.`
    );
  }

  // Conflict detection: if any of the overlay's files already exist and --force
  // wasn't passed, refuse.
  if (!force) {
    const conflicts: string[] = [];
    async function walk(src: string, relRoot: string): Promise<void> {
      const entries = await fs.readdir(src, { withFileTypes: true });
      for (const entry of entries) {
        const rel = join(relRoot, entry.name);
        if (entry.isDirectory()) {
          await walk(join(src, entry.name), rel);
        } else if (await pathExists(join(cwd, rel))) {
          conflicts.push(rel);
        }
      }
    }
    await walk(overlayDir, '.');
    if (conflicts.length > 0) {
      console.log(
        chalk.red(
          `Refusing to overlay; ${conflicts.length} file(s) would be overwritten:`
        )
      );
      for (const c of conflicts) console.log(`  ${c}`);
      console.log('');
      console.log(chalk.dim('Re-run with --force to proceed anyway.'));
      return;
    }
  }

  await copyDir(overlayDir, cwd, {
    replacements: { projectName: 'app', template: name }
  });
  console.log(chalk.green(`✓ Overlaid template "${name}" onto the current project.`));
}

export const addCommand = new Command('add')
  .description('Add a widget, integration, or template to an existing project.')
  .argument('<kind>', `One of: ${KINDS.join(', ')}`)
  .argument('<name>', 'Name (kebab-case)')
  .option('--force', 'Overwrite conflicting files (template only)', false)
  .action(async (kind: string, name: string, opts: { force: boolean }) => {
    if (!KINDS.includes(kind as Kind)) {
      throw new Error(`Unknown kind "${kind}". Use one of: ${KINDS.join(', ')}`);
    }
    switch (kind as Kind) {
      case 'widget':
        await addWidget(name);
        break;
      case 'integration':
        await addIntegration(name);
        break;
      case 'template':
        await addTemplate(name, opts.force);
        break;
    }
  });
