import { MasterIcon } from '@realfavicongenerator/generate-favicon';
import { loadAndConvertToSvg } from '@realfavicongenerator/image-adapter-node';
import { FaviconSettings, generateFaviconFiles, generateFaviconHtml } from '@realfavicongenerator/generate-favicon';
import fs from 'fs/promises';
import { getNodeImageAdapter } from '@realfavicongenerator/image-adapter-node';

export type GenerateFaviconParams = {
  masterIcon: string,
  dest: string,
  settings: FaviconSettings,
  markupFile: string
};

const toBuffer = async (data: string | Buffer | Blob): Promise<Buffer> => {
  if (data instanceof Buffer) {
    return data;
  }
  if (data instanceof Blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result instanceof ArrayBuffer) {
          resolve(Buffer.from(reader.result));
        } else {
          reject(new Error('Failed to convert Blob to Buffer'));
        }
      };
      reader.onerror = () => {
        reject(new Error('Failed to read Blob'));
      };
      reader.readAsArrayBuffer(data);
    });
  }
  return Buffer.from(data, 'utf8');
}

export const generateFavicon = async (params: GenerateFaviconParams, callback: (err?: string) => void) => {
  const imageAdapter = await getNodeImageAdapter();

  const masterIcon: MasterIcon = {
    icon: await loadAndConvertToSvg(params.masterIcon),
  };

  // Create output directory
  await fs.mkdir(params.dest, { recursive: true });

  // Generate files
  const files = await generateFaviconFiles(masterIcon, params.settings, imageAdapter);
  for await (const fileName of Object.keys(files)) {
    const file = files[fileName];
    const filePath = `${params.dest}/${fileName}`;
    await fs.writeFile(filePath, await toBuffer(file));
  }

  // Generate HTML
  const html = await generateFaviconHtml(params.settings);
  fs.writeFile(params.markupFile, JSON.stringify(html, null, 2));

  callback();
}
