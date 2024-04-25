import { Svg } from "@svgdotjs/svg.js";
import { DesktopIconSettings, initDesktopIconSettings } from "./desktop";
import { TouchIconSettings, initTouchIconSettings } from "./ios";
import { WebAppManifestSettings, initWebAppManifestSettings } from "./web-app-manifest";
import { IconTransformation } from "./helper";

export type FaviconIconSettings = {
  desktop: DesktopIconSettings,
  touch: TouchIconSettings,
  webAppManifest: WebAppManifestSettings,
}

export type FaviconSettings = {
  icon: FaviconIconSettings,
  path: string
}

export type EditedIcon = {
  icon: Svg,
  transformation: IconTransformation
}

export const initFaviconIconSettings = (svg: Svg): FaviconIconSettings => {
  return {
    desktop: initDesktopIconSettings(svg),
    touch: initTouchIconSettings(svg),
    webAppManifest: initWebAppManifestSettings(svg)
  };
}
