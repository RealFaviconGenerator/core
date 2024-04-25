import { Svg } from "@svgdotjs/svg.js";

export const convertBufferToDataUrl = (content: Buffer, mimeType: string): string => {
  return `data:${mimeType};base64,${content.toString('base64')}`;
}

export const convertSvgToDataUrl = (svg: Svg): string => {
  return convertBufferToDataUrl(Buffer.from(svg.svg()), 'image/svg+xml');
}
