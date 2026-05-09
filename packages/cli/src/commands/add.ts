import { Command } from 'commander';
import chalk from 'chalk';

const KINDS = ['widget', 'integration', 'template'] as const;
type Kind = (typeof KINDS)[number];

export const addCommand = new Command('add')
  .description('Add a widget, integration, or template to an existing project (preview).')
  .argument('<kind>', `One of: ${KINDS.join(', ')}`)
  .argument('<name>', 'Name (kebab-case)')
  .action(async (kind: string, name: string) => {
    if (!KINDS.includes(kind as Kind)) {
      throw new Error(`Unknown kind "${kind}". Use one of: ${KINDS.join(', ')}`);
    }
    console.log(chalk.yellow('⚠ `conversokit add` is preview-only in 0.1.x.'));
    console.log('');
    console.log(`Requested: add ${kind} ${chalk.cyan(name)}`);
    console.log('');
    switch (kind as Kind) {
      case 'widget':
        console.log('Manual steps:');
        console.log(
          `  1. Import { ${pascal(name)} } from '@conversokit/widgets' in your widget UI.`
        );
        console.log(
          `  2. Register it in your app's widgetRegistry.local.ts (see docs/widget-authoring.md).`
        );
        break;
      case 'integration':
        console.log('Manual steps:');
        console.log(
          `  1. Set the relevant env vars in .env (see .env.example).`
        );
        console.log(
          `  2. Wire the provider in apps/mcp-server/src/index.ts (see docs/integrations.md).`
        );
        break;
      case 'template':
        console.log('Manual steps:');
        console.log(
          `  1. Run \`conversokit create <new-app> --template ${name}\` in a sibling directory,`
        );
        console.log(
          `     then copy the bits you want into your existing project.`
        );
        break;
    }
  });

function pascal(s: string): string {
  return s
    .split(/[-_\s]/)
    .filter(Boolean)
    .map((p) => p[0].toUpperCase() + p.slice(1))
    .join('');
}
