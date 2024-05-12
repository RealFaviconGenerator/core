#!/usr/bin/env node

import { Command } from 'commander'
import { CheckExamples } from '@/example'
import { check, stringToScreen } from '@/check'
import p from '../package.json'
import { RealFaviconGeneratorBaseUrl } from './common.js';
import { generate } from './generate.js';

const program = new Command();

program
  .name('realfavicon')
  .description('Generate and check favicon with RealFaviconGenerator')
  .version(p.version);

program.command('check')
  .description('Check a favicon')
  .argument('<URL or port>', 'URL to check, or simply a port to target localhost')
  .option('-s, --screen <screen>', 'Screen where the report is displayed, can be cli or realfavicon', 'realfavicon')
  .addHelpText('after', CheckExamples)
  .action(async (urlOrPort: string, screen: string) => {
    await check(urlOrPort, stringToScreen(screen));
  });

program.command('generate').
  description('Generate a favicon')
  .argument('<image>', 'Path to the image file to use as the favicont')
  .argument('<settings>', `Path to the favicon settings file, which can be created via ${RealFaviconGeneratorBaseUrl}favicon/command-line`)
  .argument('<output data>', 'Path to the favicon data output file')
  .argument('<assets directory>', 'Directory where the favicon files are stored')
  .action(async (imagePath: string, settingsPath: string, outputData: string, assetsDir: string) => {
    await generate(imagePath, settingsPath, outputData, assetsDir);
  });

program.parse();
