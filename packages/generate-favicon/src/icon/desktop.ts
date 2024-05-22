import { Svg } from "@svgdotjs/svg.js";
import { IconTransformation, IconTransformationType, MasterIcon, initTransformation } from "./helper";

export type DesktopIconSettings = {
  // Regular icon
  regularIconTransformation: IconTransformation;

  // Dark icon
  darkIconType: 'none' | 'regular' | 'specific';
  darkIconTransformation: IconTransformation;
};

export const initDesktopIconSettings = (): DesktopIconSettings => ({
  darkIconTransformation: initTransformation(IconTransformationType.None, {
    imageScale: 0.7,
    backgroundColor: '#ffffff',
    backgroundRadius: 0.7
  }),
  darkIconType: 'none',
  regularIconTransformation: initTransformation(IconTransformationType.None, {
    imageScale: 0.7,
    backgroundColor: '#ffffff',
    backgroundRadius: 0.7
  })
});

export const getAppliedDarkIcon = (masterIcon: MasterIcon, settings: DesktopIconSettings): {
  darkIcon: Svg, darkIconTransformation: IconTransformation
} => {
  const darkIcon = (settings.darkIconType === 'specific' && masterIcon.darkIcon)
    ? masterIcon.darkIcon
    : masterIcon.icon;
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
