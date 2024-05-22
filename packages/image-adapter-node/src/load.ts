import fs from 'fs/promises'
import { Svg } from "@svgdotjs/svg.js";
import { dataUrlToSvg, stringToSvg } from '@realfavicongenerator/generate-favicon';
import { getNodeImageAdapter } from './adapter';

export const loadAndConvertToSvg = async (imagePath: string): Promise<Svg> => {
  const imageAdapter = await getNodeImageAdapter();
  if (imagePath.endsWith('.svg')) {
    const content = await fs.readFile(imagePath, 'utf8');
    return stringToSvg(content, imageAdapter);
  } else {
    const content = await fs.readFile(imagePath);
    const dataUrl = `data:image/${imagePath.split('.').pop()};base64,${content.toString('base64')}`;
    return dataUrlToSvg(dataUrl, imageAdapter);
  }
};
