import { Svg } from "@svgdotjs/svg.js";
import { IconTransformationType, initTransformation } from "./helper";
import { EditedIcon } from ".";

export type TouchIconSettings = {
  appTitle: string | null
} & EditedIcon;

export const initTouchIconSettings = (icon: Svg): TouchIconSettings => ({
  icon,
  transformation: initTransformation(IconTransformationType.None, {
    imageScale: 0.7,
    backgroundColor: '#ffffff',
    backgroundRadius: 0
  }),
  appTitle: null
});
