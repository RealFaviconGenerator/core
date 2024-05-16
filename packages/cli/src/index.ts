#!/usr/bin/env node

import { Command } from 'commander'
import { CheckExamples } from '@/example'
import { check, stringToScreen } from '@/check'
import p from '../package.json'
import { RealFaviconGeneratorBaseUrl } from './common.js';
import { generate } from './generate.js';
import { inject } from './inject.js';

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
  .argument('<image>', 'Path of the image file to use as the favicon')
  .argument('<settings>', `Path of the favicon settings file, which can be created via ${RealFaviconGeneratorBaseUrl}favicon/command-line`)
  .argument('<output data>', 'Path of the favicon data output file')
  .argument('<assets directory>', 'Directory where the favicon files are stored')
  .action(async (imagePath: string, settingsPath: string, outputData: string, assetsDir: string) => {
    await generate(imagePath, settingsPath, outputData, assetsDir);
  });

program.command('inject').
  description('Inject favicon markups in HTML files')
  .argument('<markups>', `Path of the markups file, created via the 'generate' command`)
  .argument('<output dir>', `Output directory`)
  .argument('<HTML files...>', 'Path of the HTML files to inject the favicon markups into')
  .action(async (markupsFile: string, outputDir: string, htmlFiles: string[]) => {
    await inject(markupsFile, outputDir, htmlFiles);
  });

program.parse();
