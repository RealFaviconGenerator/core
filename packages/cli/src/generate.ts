import fs from "fs/promises"
import { FaviconSettings, MasterIcon, bitmapToSvg, dataUrlToSvg, generateFaviconFiles, generateFaviconHtml, stringToSvg } from '@realfavicongenerator/generate-favicon';
import { getNodeImageAdapter, loadAndConvertToSvg } from "@realfavicongenerator/image-adapter-node";
import { Svg } from "@svgdotjs/svg.js";

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

export const generate = async (imagePath: string, settingsPath: string, outputData: string, assetsDir: string) => {
  const imageAdapter = await getNodeImageAdapter();

  // Open master image
  const masterIcon: MasterIcon = {
    icon: await loadAndConvertToSvg(imagePath),
  }

  // Open settings
  const faviconSettingsFile = await fs.readFile(settingsPath, 'utf8');
  const faviconSettings: FaviconSettings = JSON.parse(faviconSettingsFile);

  // Create output directory
  await fs.mkdir(assetsDir, { recursive: true });

  // Generate files
  const files = await generateFaviconFiles(masterIcon, faviconSettings, imageAdapter);
  for await (const fileName of Object.keys(files)) {
    const file = files[fileName];
    const filePath = `${assetsDir}/${fileName}`;
    await fs.writeFile(filePath, await toBuffer(file));
  }

  // Generate HTML
  const html = await generateFaviconHtml(faviconSettings);
  fs.writeFile(outputData, JSON.stringify(html, null, 2));
}
