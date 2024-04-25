import { Svg, SVG } from "@svgdotjs/svg.js";
import { ImageAdapter } from "../svg/adapter";


// Returns a string that can be assigned to a.href as is.
export const rawDataToDownloadableContent = (content: string, mimeType: string): string => (
  'data:' + mimeType + ';charset=utf-8,' + encodeURIComponent(content)
);

export const startDownload = (content: string, fileName: string) => {
  var element = document.createElement('a');
  element.setAttribute('href', content);
  element.setAttribute('download', fileName);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
};

export const stringToSvg = (svg: string, imageAdapter: ImageAdapter): Svg => {
  const s = imageAdapter.createSvg();
  s.svg(svg);

  const subSvg: any = s.find('svg')[0];
  if (subSvg) {
    const viewBox = subSvg.viewbox();
    s.width(subSvg.width() ? subSvg.width() : viewBox.width);
    s.height(subSvg.height() ? subSvg.height() : viewBox.height);
  }

  return s;
};
