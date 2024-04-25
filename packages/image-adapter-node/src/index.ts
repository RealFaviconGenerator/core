import { SVG, Svg, registerWindow } from "@svgdotjs/svg.js";
import { createSVGWindow } from "svgdom"
import { ImageAdapter } from "@realfavicongenerator/generate-favicon";
import sharp from "sharp";

const dataUrlToBuffer = async (dataUrl: string): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const base64 = dataUrl.split(',')[1];
    const buffer = Buffer.from(base64, 'base64');
    resolve(buffer);
  });
}

export const getNodeImageAdapter = (): ImageAdapter => {
  return {
    createSvg: () => {
      const window = createSVGWindow();
      const document = window.document
      registerWindow(window, document);
      return SVG(document.documentElement) as Svg;
    },
    convertSvgToPng: async (svg: Svg) => {
      return new Promise((resolve, reject) => {
        const svgString = svg.svg();
        const svgBuffer = Buffer.from(svgString);

        sharp(svgBuffer)
          .png()
          .toBuffer((err, buffer, info) => {
            if (err) {
              reject(err);
            } else {
              resolve(buffer);
            }
          });
      });
    },
    getImageSize: async (dataUrl: string) => {
      const buffer = await dataUrlToBuffer(dataUrl);
      return new Promise((resolve, reject) => {
        sharp(buffer)
        .metadata()
        .then(metadata => {
          const width = metadata.width;
          const height = metadata.height;
          if (width === undefined || height === undefined) {
            reject('Failed to get image metadata');
          } else {
            resolve({ width, height });
          }
        })
        .catch(err => {
          reject(err);
        });
      });
    },
    getImageData: async (dataUrl: string, widthHeight: number) => {
      const buffer = await dataUrlToBuffer(dataUrl);
      return new Promise((resolve, reject) => {
        sharp(buffer)
          .resize(widthHeight, widthHeight)
          .raw()
          .toBuffer((err, data, info) => {
            if (err) {
              reject(err);
            } else {
              resolve(data);
            }
          });
      });
    }
  }
};
