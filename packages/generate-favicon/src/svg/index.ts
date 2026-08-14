import { SVG, Svg } from "@svgdotjs/svg.js";
import { ImageAdapter } from "./adapter";
import { numberAliasToNumber } from "../icon/helper";
import { filterDoctypeOut } from "./helper";
import { cloneSvg } from "./desktop";

// CSS absolute length units, expressed in pixels at the reference 96 DPI used
// by the SVG rasterizers (resvg/librsvg via sharp). Relative units (%, em, ...)
// are intentionally absent: they cannot be resolved to a fixed pixel size here.
const CSS_UNIT_TO_PX: Record<string, number> = {
  px: 1,
  in: 96,
  cm: 96 / 2.54,
  mm: 96 / 25.4,
  pt: 96 / 72,
  pc: 16,
};

// Resolve an SVG width/height value to user-space pixels.
//
// The scaling math in `transformSvg`/`innerImageTransform` interprets the
// master's width/height as user units, but the rasterizer renders the embedded
// SVG at the physical size implied by its unit (e.g. `81.844mm` -> ~309px at
// 96 DPI). When a physical unit is left in place these two disagree, the
// artwork is scaled far too large, and only its top-left corner survives inside
// the icon (see the cropped-favicon reports for SVGs exported by Inkscape).
// Converting the value to pixels keeps both interpretations consistent.
//
// Returns `undefined` for values that cannot be resolved to an absolute size
// (relative units, unparseable input) so the caller can fall back to the
// viewBox dimensions.
export const resolveLengthToPixels = (value: number | string): number | undefined => {
  if (typeof value === 'number') {
    return value;
  }
  const match = /^\s*([+-]?[\d.]+)\s*([a-z%]*)\s*$/i.exec(value);
  if (!match) {
    return undefined;
  }
  const amount = parseFloat(match[1]);
  const unit = match[2].toLowerCase();
  if (unit === '') {
    return amount;
  }
  const factor = CSS_UNIT_TO_PX[unit];
  return factor === undefined ? undefined : amount * factor;
};

export const stringToSvg = (svg: string, imageAdapeter: ImageAdapter): Svg => {
  // We use filterDoctypeOut because of
  // https://github.com/RealFaviconGenerator/realfavicongenerator/issues/507
  // and https://github.com/svgdotjs/svgdom/issues/130
  const s = imageAdapeter.createSvg().svg(filterDoctypeOut(svg));

  const subSvg: any = s.find('svg')[0];
  if (subSvg) {
    const viewBox = subSvg.viewbox();
    const innerAttrs: Record<string, any> = subSvg.attr();

    // Remove outer SVG attributes that aren't on the inner SVG
    const outerAttrs: Record<string, any> = s.attr();
    for (const key of Object.keys(outerAttrs)) {
      if (!(key in innerAttrs)) {
        s.attr(key, null);
      }
    }

    // Copy all attributes from inner SVG to outer SVG
    for (const [key, value] of Object.entries(innerAttrs)) {
      s.attr(key, value);
    }

    // Set width/height, falling back to viewBox dimensions if not explicit or
    // if the value carries a unit that cannot be resolved to absolute pixels.
    // Physical units (mm, cm, in, ...) are converted so the downstream scaling
    // math agrees with how the rasterizer sizes the embedded SVG.
    const resolvedWidth = subSvg.width() ? resolveLengthToPixels(subSvg.width()) : undefined;
    const resolvedHeight = subSvg.height() ? resolveLengthToPixels(subSvg.height()) : undefined;
    s.width(resolvedWidth !== undefined ? resolvedWidth : viewBox.width);
    s.height(resolvedHeight !== undefined ? resolvedHeight : viewBox.height);

    // Move children from inner SVG to outer SVG and remove the nested SVG
    while (subSvg.children().length > 0) {
      s.add(subSvg.children()[0]);
    }
    subSvg.remove();
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
  group.add(cloneSvg(svg, imageAdapeter));

  return newSvg;
}
