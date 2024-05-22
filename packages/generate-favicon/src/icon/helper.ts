import { NumberAlias, Svg, SVG } from "@svgdotjs/svg.js";
import { TransformData } from "@svgdotjs/svg.js";
import { ImageAdapter } from "../svg/adapter";

export type MasterIcon = {
  icon: Svg;
  darkIcon?: Svg;
}

export enum IconTransformationType {
  None = 'none',
  Background = 'background',
  Brightness = 'brightness',
  Invert = 'invert'
};

export type IconTransformation = {
  type: IconTransformationType;
  backgroundRadius: number;
  backgroundColor: string;
  imageScale: number;
  brightness: number;
};

export type IconTransformationParameters = {
  backgroundRadius?: number;
  backgroundColor?: string;
  imageScale?: number;
  brightness?: number;
};

export type IconSettings = {
  imageUrl: string;
  transformation: IconTransformation
};

export type IconFile = {
  name: string;
  downloadableContent: string | Blob;
};

export type IconEditorOutput = {
  files: IconFile[];
  markups: string[];
};

export const initTransformation = (type: IconTransformationType, parameters: IconTransformationParameters = {}): IconTransformation => (
  Object.assign({}, {
    type,
    backgroundColor: 'white',
    backgroundRadius: 0.0,
    imageScale: 1.0,
    brightness: 1.0
  }, parameters)
);

/**
 * @param iiWidth The inner image width
 * @param iiHeight The inner image height
 * @param imgSize The output image size (same width/height)
 * @param iiScale The inner image scale
 */
 export const innerImageTransform = (
  iiWidth: number, iiHeight: number, imgSize: number, iiScale = 1.0
): TransformData => {
  const iiSize = imgSize * iiScale;
  const scaleFactor = iiSize / Math.max(iiWidth, iiHeight);
  return {
    scaleX: scaleFactor,
    scaleY: scaleFactor,
    translateX: (imgSize - iiWidth) / 2,
    translateY: (imgSize - iiHeight) / 2
  };
};

export const transformSvg = (
  image: Svg,
  transformation: IconTransformation,
  imageAdapter: ImageAdapter,
  finalImageSize = 1000
): Svg => {
  const s = imageAdapter.createSvg().size(finalImageSize, finalImageSize);

  // Why a wrapper? Because we need to apply a clip to the image, and clip
  // can only be applied to a group **when the SVG is use as a favicon by Chrome**.
  // When the clip is applied to the overall <svg> element:
  // - Opened as a regular fine by Chome: the clip is applied.
  // - Used as a favicon by Chrome: the clip is wrongly applied and the favicon appears as empty.
  const wrapper = s.group();

  if (transformation.type === IconTransformationType.Background) {
    const b = wrapper.rect(finalImageSize, finalImageSize);
    b.fill(transformation.backgroundColor);
  }

  const container = wrapper.group();
  container.svg(image.svg());
  const t = innerImageTransform(
    numberAliasToNumber(image.width()),
    numberAliasToNumber(image.height()),
    finalImageSize,
    transformation.type === IconTransformationType.Background ? transformation.imageScale : 1.0,
  );
  container.transform(t);

  if (isCSSFilterTransformation(transformation.type)) {
    container.attr('style', `filter: ${getCSSFilter(transformation)}`);
  }

  if (transformation.type === IconTransformationType.Background) {
    const clip = wrapper.clip();
    const rm = clip.rect();
    rm.x(0);
    rm.y(0);
    rm.width(finalImageSize);
    rm.height(finalImageSize);
    rm.radius(transformation.backgroundRadius * finalImageSize / 2);
    wrapper.clipWith(clip);
  }

  return s;
};

export type CssBrightnessAndContrast = {
  brightness: number;
  contrast: number;
};

export const userBrightnessToCssFilter = (userBrightness: number): CssBrightnessAndContrast => ({
  brightness: userBrightness,
  contrast: userBrightness > 1.3
    ? 1.0 / (1.0 + ((userBrightness - 1.3) / 2))
    : 1.0
});

export const isCSSFilterTransformation = (type: IconTransformationType) => (
  type === IconTransformationType.Brightness || type === IconTransformationType.Invert
);

export const getCSSFilter = (transformation: IconTransformation) => {
  switch(transformation.type) {
    case(IconTransformationType.Brightness):
      const { brightness, contrast } = userBrightnessToCssFilter(transformation.brightness);
      return `contrast(${contrast}) brightness(${brightness})`;
    case(IconTransformationType.Invert):
      return 'invert(100%)';
    default:
      return 'none';
  }
};

export const numberAliasToNumber = (n: NumberAlias): number => {
  if (typeof n === 'string') {
    return parseInt(n);
  } else if (typeof n === 'number') {
    return n;
  } else {
    return n.value;
  }
}

export const isLightColor = (color: string): boolean => {
  const r = parseInt(color.substring(1, 3), 16);
  const g = parseInt(color.substring(3, 5), 16);
  const b = parseInt(color.substring(5, 7), 16);
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  return yiq > 128;
}
