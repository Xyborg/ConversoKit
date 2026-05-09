#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';
import { createCommand } from './commands/create.js';
import { addCommand } from './commands/add.js';

const program = new Command();

program
  .name('conversokit')
  .description(
    'ConversoKit CLI — scaffold ChatGPT Apps with reusable widgets, MCP tools, and templates.'
  )
  .version('0.1.0');

program.addCommand(createCommand);
program.addCommand(addCommand);

program.on('command:*', (operands) => {
  console.error(chalk.red(`Unknown command: ${operands.join(' ')}`));
  program.help({ error: true });
});

program.parseAsync(process.argv).catch((err) => {
  console.error(chalk.red(err instanceof Error ? err.message : String(err)));
  process.exit(1);
});
