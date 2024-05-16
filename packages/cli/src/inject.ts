import { injectMarkupInHtmlHead } from '@realfavicongenerator/inject-markups';
import { mkdir } from 'fs';
import fs from 'fs/promises';
import path from 'path';

export const inject = async (markupsFile: string, outputDir: string, htmlFiles: string[]) => {
  const markupFile = await fs.readFile(markupsFile, 'utf8');
  const markups = JSON.parse(markupFile);

  await fs.mkdir(outputDir, { recursive: true });

  for await (const htmlFile of htmlFiles) {
    const content = await fs.readFile(htmlFile, 'utf8');
    const injected = injectMarkupInHtmlHead(content, markups.markups, markups.cssSelectors);
    await fs.writeFile(path.join(outputDir, path.basename(htmlFile)), injected);
  }
}
