import { Svg } from "@svgdotjs/svg.js";
import { bitmapToSvg, stringToSvg } from ".";
import { ImageAdapter } from "./adapter";

export const loadSvg = async (file: File, imageAdapter: ImageAdapter): Promise<Svg> => {
  return new Promise<Svg>((resolve, reject) => {
    const reader = new FileReader();

    if (file.type === 'image/svg+xml') {
      reader.onload = () => {
        if (reader.result) {
          const rawSvg = reader.result.toString();
          const svg = stringToSvg(rawSvg, imageAdapter);
          resolve(svg);
        }
      }
  
      reader.readAsText(file);
    } else {
      reader.onload = () => {
        const binaryData = reader.result as ArrayBuffer;
        const svg = bitmapToSvg(binaryData, imageAdapter).then(svg => {
          resolve(svg);
        });
      };
    
      reader.readAsArrayBuffer(file);
    }
  });
}
