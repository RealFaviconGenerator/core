import { addPngTextMetadata } from './png';
import { addSvgMetadata } from './svg';

export { addPngTextMetadata } from './png';
export { addSvgMetadata } from './svg';

export const RFG_CREATOR = 'RealFaviconGenerator';
export const RFG_URL = 'https://realfavicongenerator.net';

export const addRfgMetadataToPng = (png: Buffer): Buffer =>
  addPngTextMetadata(png, { Software: `${RFG_CREATOR} (${RFG_URL})` });

export const addRfgMetadataToSvg = (svg: string): string =>
  addSvgMetadata(svg, RFG_CREATOR, RFG_URL);
