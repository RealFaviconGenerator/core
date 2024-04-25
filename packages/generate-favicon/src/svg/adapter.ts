import { Dom, Svg } from "@svgdotjs/svg.js";

export type ImageAndMeta = {
  width: number;
  height: number;
  data: Buffer;
}

export type ImageAdapter = {
  createSvg: () => Svg,
  convertSvgToPng: (svg: Svg) => Promise<Buffer>,
  getImageSize: (dataUrl: string) => Promise<{ width: number, height: number }>,
  getImageData: (dataUrl: string, widthHeight: number) => Promise<Buffer>
}
