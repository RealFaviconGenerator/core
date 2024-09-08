import { SVG, Svg } from "@svgdotjs/svg.js";
import { ImageAdapter } from "./adapter";
import { numberAliasToNumber } from "../icon/helper";

export const stringToSvg = (svg: string, imageAdapeter: ImageAdapter): Svg => {
  const s = imageAdapeter.createSvg().svg(svg);

  const subSvg: any = s.find('svg')[0];
  if (subSvg) {
    const viewBox = subSvg.viewbox();
    s.width(subSvg.width() ? subSvg.width() : viewBox.width);
    s.height(subSvg.height() ? subSvg.height() : viewBox.height);
  }

  return s;
};

export const urlToSvg = async (url: string, imageAdapter: ImageAdapter): Promise<Svg> => {
  const response = await fetch(url);
  const text = await response.text();
  return stringToSvg(text, imageAdapter);
};

export const blobToDataUrl = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject('Failed to read blob');
      }
    };
    reader.onerror = (e) => {
      reject(e);
    };
    reader.readAsDataURL(blob);
  });
}

export const bitmapToSvg = async (binaryData: ArrayBuffer, mimeType: string, imageAdapter: ImageAdapter): Promise<Svg> => {
  const blob = new Blob([ binaryData ], { type: mimeType });
  const url = await blobToDataUrl(blob);

  return dataUrlToSvg(url, imageAdapter);
}

export const httpUrlToDataUrl = async (url: string, imageAdapter: ImageAdapter): Promise<string> => {
  const response = await fetch(url);
  const buffer = await response.arrayBuffer();
  const contentType = response.headers.get('content-type') || 'application/octet-stream';
  return `data:${contentType};base64,${Buffer.from(buffer).toString('base64')}`;
}

export const anyUrlToSvg = async (url: string, imageAdapter: ImageAdapter): Promise<Svg> => {
  const dataUrl = url.startsWith('http') ? httpUrlToDataUrl(url, imageAdapter) : url;
  return dataUrlToSvg(url, imageAdapter);
}

export const dataUrlToSvg = async (dataUrl: string, imageAdapter: ImageAdapter): Promise<Svg> => {
  const { width, height } = await imageAdapter.getImageSize(dataUrl);
  const svg = imageAdapter.createSvg().size(width, height);

  const i = svg.image(dataUrl);
  i.width(width);
  i.height(height);

  svg.viewbox(0, 0, width, height);

  return svg;
}

export const makeFluidSvg = (svg: Svg): Svg => {
  const viewBox = svg.viewbox();
  const w = viewBox.width || 100;
  const h = viewBox.height || 100;
  svg.width('100%');
  svg.height('100%');
  svg.viewbox(0, 0, w, h);

  const children = svg.children();
  if (children.length === 1) {
    const child = children[0];
    if (child instanceof Svg) {
      const viewBox = child.viewbox();
      const w = viewBox.width;
      const h = viewBox.height;
      child.width('100%');
      child.height('100%');
      child.viewbox(0, 0, w, h);
    }
  }

  return svg;
}

export const scaleSvg = (svg: Svg, widthHeight: number, imageAdapeter: ImageAdapter): Svg => {
  const newSvg = imageAdapeter.createSvg();
  newSvg.size(widthHeight, widthHeight);
  const group = newSvg.group();
  group.attr('transform', `scale(${widthHeight / numberAliasToNumber(svg.width())})`);
  group.add(svg.clone());

  return newSvg;
}
