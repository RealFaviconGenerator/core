#!/usr/bin/env node

import { Command } from 'commander'
import { CheckExamples } from '@/example'
import { check, stringToScreen } from '@/check'

const program = new Command();

program
  .name('realfavicon')
  .description('Create and check favicon with RealFaviconGenerator')
  .version('0.0.1');

program.command('check')
  .description('Check a favicon')
  .argument('<URL or port>', 'the URL to check, or simply a port to target localhost')
  .option('-s, --screen <screen>', 'the screen where the report is displayed, can be cli or realfavicon', 'realfavicon')
  .addHelpText('after', CheckExamples)
  .action(async (urlOrPort: string, screen: string) => {
    await check(urlOrPort, stringToScreen(screen));
  });

program.parse();
