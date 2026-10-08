#!/usr/bin/env node
'use strict';

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import path from 'path';
import { runScraper } from '../src/scraper';
import { exportLeads } from '../src/exporter';
import type { ScraperOptions, Lead } from '../src/types';

let pkg = { version: '1.0.0' };
try {
  // Try relative to dist/bin (when compiled) or bin (when running with ts-node)
  pkg = require(path.resolve(__dirname, '../../package.json'));
} catch {
  try {
    pkg = require(path.resolve(__dirname, '../package.json'));
  } catch {
    // fallback if package.json is not found
  }
}

const banner = `
${chalk.cyan.bold('╔══════════════════════════════════════════════════╗')}
${chalk.cyan.bold('║')}   ${chalk.white.bold('⚡ ziara-lead-scrapper')} ${chalk.gray(`v${pkg.version}`)}                  ${chalk.cyan.bold('║')}
${chalk.cyan.bold('║')}   ${chalk.gray('Zero-config Google Maps lead scraper')}           ${chalk.cyan.bold('║')}
${chalk.cyan.bold('║')}   ${chalk.gray('by Ziara TechQ Labs · github.com/Aquil1401')}     ${chalk.cyan.bold('║')}
${chalk.cyan.bold('╚══════════════════════════════════════════════════╝')}
`;

const program = new Command();

program
  .name('ziara-lead-scrapper')
  .description('Zero-config Google Maps lead scraper — no Docker, no Python, no paid APIs.')
  .version(pkg.version, '-v, --version', 'Output the current version')
  .requiredOption('-q, --query <string>', 'Google Maps search query (e.g. "Dentists in South Delhi")')
  .option('-l, --limit <number>', 'Maximum number of leads to collect', '20')
  .option('-o, --output <string>', 'Output format: csv or json', 'csv')
  .option('--headless <boolean>', 'Run browser in headless mode', 'true')
  .option('--concurrency <number>', 'Parallel processing limit (keep low to avoid blocks)', '1')
  .option('--enrich', 'Enrich results by visiting websites for emails and social handles', false)
  .addHelpText(
    'after',
    `
${chalk.bold('Examples:')}
  ${chalk.cyan('$')} npx ziara-lead-scrapper -q "Dentists in South Delhi" -l 50
  ${chalk.cyan('$')} npx ziara-lead-scrapper -q "SaaS Founders in Austin" -l 100 -o json --enrich
  ${chalk.cyan('$')} npx ziara-lead-scrapper -q "Coffee Shops in NYC" --headless false
  `
  )
  .parse(process.argv);

const opts = program.opts();

async function main(): Promise<void> {
  console.log(banner);

  const query: string = (opts.query || '').trim();
  if (!query) {
    console.error(chalk.red('  ✖  Search query cannot be empty. Specify a valid query with -q.'));
    process.exit(1);
  }

  const rawOutput = String(opts.output || 'csv').trim().toLowerCase();
  if (rawOutput !== 'csv' && rawOutput !== 'json') {
    console.error(chalk.red(`  ✖  Invalid --output value "${opts.output}". Use "csv" or "json".`));
    process.exit(1);
  }
  const outputFormat: 'csv' | 'json' = rawOutput;

  const limit: number = Math.max(1, parseInt(opts.limit, 10) || 20);
  const headless: boolean = !(opts.headless === 'false' || opts.headless === false);
  const concurrency: number = Math.max(1, parseInt(opts.concurrency, 10) || 1);
  const enrich: boolean = Boolean(opts.enrich);

  console.log(chalk.bold('  📋 Configuration'));
  console.log(chalk.gray('  ─────────────────────────────────────────'));
  console.log(`  ${chalk.cyan('Query      :')} ${chalk.white(query)}`);
  console.log(`  ${chalk.cyan('Limit      :')} ${chalk.white(String(limit))}`);
  console.log(`  ${chalk.cyan('Output     :')} ${chalk.white(outputFormat.toUpperCase())}`);
  console.log(`  ${chalk.cyan('Headless   :')} ${chalk.white(String(headless))}`);
  console.log(`  ${chalk.cyan('Concurrency:')} ${chalk.white(String(concurrency))}`);
  console.log(`  ${chalk.cyan('Enrich     :')} ${chalk.white(String(enrich))}`);
  console.log(chalk.gray('  ─────────────────────────────────────────\n'));

  const scraperOptions: ScraperOptions = {
    query,
    limit,
    headless,
    concurrency,
    enrich,
  };

  const spinner = ora({
    text: chalk.cyan(`Launching browser and searching for: ${chalk.bold(query)}`),
    color: 'cyan',
    spinner: 'dots',
  }).start();

  let leads: Lead[] = [];

  try {
    leads = await runScraper(scraperOptions, (message: string, count: number) => {
      spinner.text = chalk.cyan(`${message} ${chalk.bold.white(`[${count}/${limit}]`)}`);
    });

    spinner.succeed(chalk.green(`Scraping complete! Collected ${chalk.bold.white(String(leads.length))} leads.`));
  } catch (err: any) {
    spinner.fail(chalk.red('Scraping failed.'));
    if (err?.message?.toLowerCase().includes('captcha') || err?.message?.toLowerCase().includes('blocked')) {
      console.error(chalk.yellow('\n  ⚠  Google detected automated activity.'));
      console.error(chalk.gray('     Suggestions:'));
      console.error(chalk.gray('     • Reduce --concurrency to 1'));
      console.error(chalk.gray('     • Add random delays by re-running after a few minutes'));
      console.error(chalk.gray('     • Run with --headless false to solve CAPTCHA manually'));
    } else {
      console.error(chalk.red(`\n  ✖  Error: ${err?.message ?? 'Unknown error'}`));
    }
    process.exit(1);
  }

  if (leads.length === 0) {
    console.log(chalk.yellow('\n  ⚠  No leads were collected. Try refining your query.'));
    process.exit(0);
  }

  const exportSpinner = ora({
    text: chalk.cyan(`Saving ${leads.length} leads as ${outputFormat.toUpperCase()}...`),
    color: 'cyan',
    spinner: 'dots',
  }).start();

  try {
    const outputPath = await exportLeads(leads, outputFormat, query);
    exportSpinner.succeed(chalk.green(`Saved → ${chalk.bold.white(outputPath)}`));
  } catch (err: any) {
    exportSpinner.fail(chalk.red('Export failed.'));
    console.error(chalk.red(`  ✖  ${err?.message ?? 'Unknown error'}`));
    process.exit(1);
  }

  console.log(chalk.gray('\n  ─────────────────────────────────────────'));
  console.log(`  ${chalk.green.bold('✔')}  Done! ${chalk.bold.white(String(leads.length))} leads collected.`);
  console.log(chalk.gray('  ─────────────────────────────────────────'));
  if (!enrich) {
    console.log(chalk.gray(`\n  💡 Tip: Run with ${chalk.cyan('--enrich')} to extract emails & socials from websites.\n`));
  }
}

main().catch((err: any) => {
  console.error(chalk.red(`\n  ✖  Fatal: ${err?.message ?? 'Unknown error'}`));
  process.exit(1);
});
