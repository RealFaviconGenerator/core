import { Svg } from "@svgdotjs/svg.js";
import { IconTransformationType, initTransformation } from "./helper";
import { EditedIcon } from ".";

export type WebAppManifestSettings = {
  name: string,
  shortName: string,
  backgroundColor: string,
  themeColor: string
} & EditedIcon;

export const initWebAppManifestSettings = (icon: Svg): WebAppManifestSettings => ({
  icon,
  transformation: initTransformation(IconTransformationType.None, {
    imageScale: 0.7,
    backgroundColor: '#ffffff',
    backgroundRadius: 0
  }),
  name: 'Example',
  shortName: 'Ex',
  backgroundColor: '#ffffff',
  themeColor: '#ffffff'
});
