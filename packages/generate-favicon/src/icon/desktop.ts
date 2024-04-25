import { Svg } from "@svgdotjs/svg.js";
import { IconTransformation, IconTransformationType, initTransformation } from "./helper";

export type DesktopIconSettings = {
  // Regular icon
  regularIcon: Svg;
  regularIconTransformation: IconTransformation;

  // Dark icon
  darkIcon: Svg;
  darkIconType: 'none' | 'regular' | 'specific';
  darkIconTransformation: IconTransformation;
};

export const initDesktopIconSettings = (icon: Svg): DesktopIconSettings => ({
  darkIcon: icon,
  darkIconTransformation: initTransformation(IconTransformationType.None, {
    imageScale: 0.7,
    backgroundColor: '#ffffff',
    backgroundRadius: 0.7
  }),
  darkIconType: 'none',
  regularIcon: icon,
  regularIconTransformation: initTransformation(IconTransformationType.None, {
    imageScale: 0.7,
    backgroundColor: '#ffffff',
    backgroundRadius: 0.7
  })
});

export const getAppliedDarkIcon = (settings: DesktopIconSettings): {
  darkIcon: Svg, darkIconTransformation: IconTransformation
} => {
  const darkIcon = settings.darkIconType === 'specific'
    ? settings.darkIcon
    : settings.regularIcon;
  const darkIconTransformation = settings.darkIconType === 'none'
    ? settings.regularIconTransformation
    : settings.darkIconTransformation;

  return {
    darkIcon,
    darkIconTransformation
  }
}

export const hasDarkIcon = (settings: DesktopIconSettings): boolean => (
  settings.darkIconType !== 'none'
);
